'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const session = require('express-session'); // session middleware

const passport = require('passport');
const passportLocal = require('passport-local');

const adminsDao = require('./dao_admins');
const surveysDao = require('./dao_surveys');
const questionsDao = require('./dao_questions');
const optionsDao = require('./dao_options');
const answersDao = require('./dao_answers');

const {check, validationResult} = require('express-validator'); // validation middleware

// initialize and configure passport
passport.use(new passportLocal.Strategy((username, password, done) => {
  // verification callback for authentication
  adminsDao.getUser(username, password).then(user => {
    if (user)
      done(null, user);
    else
      done(null, false, {message: 'Username or password wrong'});
  }).catch(err => {
    done(err);
  });
}));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session:
// the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  adminsDao.getUserById(id).then(user => {
    done(null, user); // this will be available in req.user
  }).catch(err => {
    done(err, null);
  });
});

const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());

//custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();
  return res.status(401).json({error: 'not authenticated'});
}

// initiallize and configure HTTP sessions
app.use(session({
  secret: 'tell me your secret',
  resave: false,
  saveUninitialized: false
}));

// tell passport to use session cookies
app.use(passport.initialize());
app.use(passport.session());

/*******************************************************/
/****************** LOGIN/LOGOUT APIS ******************/
/*******************************************************/

// POST /sessions
// login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user)
      // display wrong login messages
      return res.status(401).json(info);
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);
      // req.user contains the authenticated user, we send all the user info back
      // this is coming from adminsDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current
app.get('/api/sessions/current', isLoggedIn, (req, res) => {
  res.status(200).json(req.user);
});

// DELETE /api/sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

/*******************************************************/
/******************   SURVEYS APIS    ******************/
/*******************************************************/

// GET /api/surveys
app.get('/api/surveys', async (req, res) => {
  try {
    const result = await surveysDao.getListSurveys();
    res.json(result);
  }
  catch (err) {
    res.status(500).end();
  }
});

// GET /api/survey/<survey_id>
app.get('/api/survey/:survey_id', async (req, res) => {
  try {
    const result = await surveysDao.getSurveyById(req.params.survey_id);
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);
  }
  catch (err) {
    res.status(500).end();
  }
});

// GET /api/survey/<survey_id>/num_responses
app.get('/api/survey/:survey_id/num_responses', isLoggedIn, async (req, res) => {
  try {
    const result = await surveysDao.getRespondantUsersBySId(req.params.survey_id);
    if (result.error)
      res.status(404).json(result);
    else if (result.admin_id !== req.session.passport.user)
      res.status(401).json({error: 'Not authorized'});
    else
      res.json(result);
  }
  catch (err) {
    res.status(500).end();
  }
});

// GET /api/surveys/num_responses
app.get('/api/surveys/num_responses', isLoggedIn, async (req, res) => {
  try {
    const result = await surveysDao.getRespondantUsersByAId(req.session.passport.user);
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);
  }
  catch (err) {
    res.status(500).end();
  }
});

// POST /api/survey/<survey_id>

app.post('/api/survey/:survey_id', [
  check('user').isString(),
  check('answers').isArray(),
  check('answers').custom(answers => {
      if (answers.length > 0)
        return answers.map(a => Number.isInteger(a.question_id)).reduce((a,b) => a && b);
      return true;
    }
  ),
  check('answers').custom(answers => {
    let res = true;
    for (let a of answers) {   
      if (a.option_id)
        res &&= Number.isInteger(a.option_id);
      if (a.text)
        res &&= (typeof a.text === typeof '');
    }
    return res;
  })
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({errors: errors.array()});

  const questions = await questionsDao.getQuestions(req.params.survey_id);
  if (questions.error)
    return res.status(404).json({error: `No survey with id ${req.params.survey_id}`});

  let q_dictionary = {};

  for (let q of questions)
    q_dictionary[q.id] = {
      is_closed: q.is_closed,
      min: q.min,
      max: q.max,
      num_options: q.num_options
    }
  
  let ans_counter = {};
  
  for (let answer of req.body.answers) {

    const question = q_dictionary[answer.question_id];
    if (!question)
      return res.status(404).json({error: `No question with id ${answer.question_id}`});

    if ((question.is_closed && !answer.option_id) ||
      (!question.is_closed && !answer.text))
      return res.status(400).json({error: 'Wrong fields'});

    if (question.is_closed) {
      
      if (answer.option_id > question.num_options || answer.option_id < 1)
        return res.status(404).json({error: `No option with id ${answer.option_id}`});
      
      if (!ans_counter[answer.question_id])
        ans_counter[answer.question_id] = 1;
      else
        ans_counter[answer.question_id] += 1;

    }
    else if (answer.text)
      ans_counter[answer.question_id] = 1;

  }

  for (let q_id in q_dictionary) {

    if (!ans_counter[q_id])
      ans_counter[q_id] = 0;

    if (q_dictionary[q_id]['is_closed']) {
      if (ans_counter[q_id] < q_dictionary[q_id]['min'] ||
        ans_counter[q_id] > q_dictionary[q_id]['max'])
        return res.status(400).json({error: 'Constraints not satisfied'});
    }
    else {
      if (q_dictionary[q_id]['min'] === 1 &&
        q_dictionary[q_id]['max'] === 1 &&
        ans_counter[q_id] === 0)
        return res.status(400).json({error: 'Constraints not satisfied'});
    }

  }

  const max_id = (await answersDao.getMaxAnsId()).max_id;

  const filling = {
    answers_id: max_id + 1,
    survey_id: req.params.survey_id,
    user: req.body.user,
    answers: req.body.answers
  };

  try {
    
    const result = await answersDao.addSurveyAnswers(filling);

    if (req.body.answers.length > 0)
      result.length !== req.body.answers.length ? res.status(400).end() : res.status(201).end();
    else
      res.status(201).end();

  } 
  catch (err) {
    res.status(503).json({
      error: `Database error during the filling of the survey ${filling.survey_id}.`
    });
  }

  res.status(201).end();

});

/*******************************************************/
/******************  QUESTIONS APIS   ******************/
/*******************************************************/

// GET /api/survey/<survey_id>/questions
app.get('/api/survey/:survey_id/questions', async (req, res) => {
  try {
    const result = await questionsDao.getQuestions(req.params.survey_id);
    if (result.error)
      res.status(404).json(result);
    else {
      for (let question of result)
        if (question.is_closed) {
          try {
            const result2 = await optionsDao.getOptions(req.params.survey_id, question.id);
            if (result2.error)
              res.status(404).json(result2);
            else
              question.options = result2;
          }
          catch {
            res.status(500).end();
          }
        }
      res.json(result);
    }
  }
  catch (err) {
    res.status(500).end();
  }
});

// GET /api/survey/<survey_id>/question/<question_id>
app.get('/api/survey/:survey_id/question/:question_id', async (req, res) => {
  try {
    const result = await questionsDao.getQuestionBySIdQId(req.params.survey_id,
      req.params.question_id);
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);
  }
  catch (err) {
    res.status(500).end();
  }
});

/*******************************************************/
/******************   OPTIONS APIS    ******************/
/*******************************************************/

// GET /api/survey/<survey_id>/question/<question_id>/options
app.get('/api/survey/:survey_id/question/:question_id/options', async (req, res) => {
  try {
    const result = await optionsDao.getOptions(req.params.survey_id, req.params.question_id);
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);
  }
  catch (err) {
    res.status(500).end();
  }
});

// GET /api/survey/<survey_id>/question/<question_id>/option/<option_id>
app.get('/api/survey/:survey_id/question/:question_id/option/:option_id', async (req, res) => {
  try {
    const result = await optionsDao.getOptionBySIdQIdOId(req.params.survey_id,
      req.params.question_id, req.params.option_id);
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);
  }
  catch (err) {
    res.status(500).end();
  }
});

/*******************************************************/
/******************   ANSWERS APIS    ******************/
/*******************************************************/

// GET /api/surveys/maxid

app.get('/api/surveys/maxid', async (req, res) => {
  try {
    const result = await answersDao.getMaxAnsId();
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);
  }
  catch (err) {
    res.status(500).end();
  }
});

// GET /api/survey/<survey_id>/answers

app.get('/api/survey/:survey_id/answers', isLoggedIn, async (req, res) => {
  try {
    const result = await answersDao.getAnswersBySId(req.params.survey_id);
    if (result.info)
      res.status(200).json(result);
    else if (result.error)
      res.status(404).json(result);
    else if (result.admin_id !== req.session.passport.user)
      res.status(401).json({error: 'Not authorized'});
    else
      res.json(result);
  }
  catch (err) {
    res.status(500).end();
  }
});

//POST /api/survey

app.post('/api/survey', [
  isLoggedIn,
  check('title').isString(),
  check('questions').isArray(),
  check('questions').custom(questions => questions.length > 0),
  check('questions').custom(questions => {

    for (const q of questions) {

      if (!q.title)
        return false;

      if (typeof q.title != typeof ' ')
        return false;

      if (q.is_closed !== 0 && q.is_closed !== 1)
        return false;

      if (q.is_closed) {

        if (!q.options)
          return false;

        if (!Array.isArray(q.options))
          return false;
          
        for (const o of q.options)
          if (typeof o != typeof ' ')
            return false;
        
        if (!(0 <= q.min && q.min <= q.max && q.max <= q.options.length))
          return false;

      }
      else {
        
        if (!((q.min === 0 && q.max === 0) || (q.min === 1 && q.max === 1)))
          return false;

      }

    }
    return true;
  })

], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({errors: errors.array()});

  const admin_id = req.session.passport.user;
  const title = req.body.title;
  const num_questions = req.body.questions.length;
  const questions = req.body.questions;
  
  try {

    const admin_request = await adminsDao.getUserById(admin_id);
    !admin_request.id && res.status(404).json(admin_request);
    const num_surveys = admin_request.num_surveys + 1;

    const survey_request = await surveysDao.getLastId();
    !Number.isInteger(survey_request) && res.status(404).json(survey_request);
    const survey_id = survey_request + 1;
    
    await adminsDao.updateAdminNumSurveys(admin_id, num_surveys);
    
    const result = await surveysDao.addSurvey(survey_id, title, admin_id, num_questions);
    result !== survey_id && res.status(401).end();

    for (let i=0; i<num_questions; i++) {

      if (questions[i].is_closed)
        for (let j=0; j<questions[i].options.length; j++)
          await optionsDao.addOption(
            survey_id,
            i+1,
            j+1,
            questions[i].options[j]
          );

      await questionsDao.addQuestion(
        survey_id, i+1,
        questions[i].is_closed,
        questions[i].title, 
        questions[i].min,
        questions[i].max,
        questions[i].options ? questions[i].options.length : null
      );

    }

  } 
  catch (err) {
    res.status(503).json({
      error: `Database error.`
    });
  }

  res.status(201).end();

});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// test the dao_admins
// adminsDao.getUser("admin2", "password2!").then((result) => console.log(result));
// adminsDao.getUserById(3).then((result) => console.log(result));
// adminsDao.updateAdminNumSurveys(1, 123).then((result) => console.log(result));

// test the dao_surveys
// surveysDao.getListSurveys().then((result) => console.log(result));
// surveysDao.getSurveyById(4).then((result) => console.log(result));
// surveysDao.getRespondantUsersByAId(4).then((result) => console.log(result));
// surveysDao.addSurvey(9, 'bla', 20, 184).then((result) => console.log(result)); 
// surveysDao.getLastId().then((result) => console.log(result));

// test the dao_questions
// questionsDao.getQuestions(1).then((result) => console.log(result));

// test the dao_options
// optionsDao.getListOptions(2, 1).then((result) => console.log(result));

// test the dao_answers

/*
answersDao.addSurveyAnswers({
  survey_id: 20,
  user: 'pippo',
  answers: [
    {question_id: 1, text: 'ahiho!'},
    {question_id: 2, option_id: 1},
    {question_id: 2, option_id: 2}
  ]
}).then((result) => console.log(result));
*/

// answersDao.getMaxAnsId().then((result) => console.log(result));
// answersDao.getAnswersBySId(6).then((result) => console.log(result));