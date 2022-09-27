import 'bootstrap/dist/css/bootstrap.min.css';
import '../../custom.css';

import {Spinner, Form, Row, Col, Button, ListGroup, Alert} from 'react-bootstrap';
import {useEffect, useState} from 'react';
import {Redirect, useHistory} from 'react-router-dom';

import {Question} from './Question'
import {Headline} from '../../utils'

import API from '../../API.js';

function UserField(props) {

  return (
    <Form.Group as={Row}>
      <Form.Label column sm={2}>
        Your name:
      </Form.Label>
      <Col sm={10}>
        <Form.Control type='text' placeholder='name' maxLength='50'
          className={props.notValid.includes('userName') ? 'form-control-error' : ''}
          onChange={ev => props.setUserName(ev.target.value)} />
      </Col>
    </Form.Group>
  );

}

function FillSurvey(props) {

  const [notValid, setNotValid] = useState([]);
  const [userName, setUserName] = useState('');
  const [closedAnswers, setClosedAnswers] = useState([]);
  const [openAnswers, setOpenAnswers] = useState({});

  const setAnswering = props.setAnswering;
  const setLoading = props.setLoading;
  const setSurveyTitle = props.setSurveyTitle;
  const setSurveyAuthor = props.setSurveyAuthor;
  const setQuestions = props.setQuestions;
  const id = props.id;

  useEffect(() => setAnswering(true), [setAnswering]);

  useEffect(() => {
    setLoading(true);
    API.getSurveyById(id).then((res) => {
      setSurveyTitle(res.title);
      setSurveyAuthor(res.admin);
    });
    API.getQuestions(id).then((res) => {
      setQuestions(res);
      setLoading(false);
    });
  }, [id, setLoading, setSurveyTitle, setSurveyAuthor, setQuestions]);

  let history = useHistory();

  const validateUser = (userName, not_valid) => {

    if (userName === '' ||
      userName.match(' ') ||
      userName.length < 3)
      not_valid = [...not_valid, 'userName'];

    return not_valid;

  };

  const validateClosedQuestion = (question, not_valid) => {

    if (question.is_closed) {

      let count = 0;

      for (let answer of closedAnswers)
        if (question.id === answer.question_id)
          count++;

      if (count < question.min || count > question.max)
        not_valid = [...not_valid, `question_${question.id}`];

    }
    
    return not_valid;

  };

  const validateOpenQuestion = (question, not_valid) => {

    if (!question.is_closed &&
        question.min === 1 &&
        question.max === 1 &&
        !openAnswers[question.id])
      not_valid = [...not_valid, `question_${question.id}`];

    return not_valid;
    
  };

  const handleRedirect = () => {
    props.setMessage({msg: 'Thank you for your time!', type: 'success'});
    setLoading(false);
    history.push('/');
  }

  const handleSubmit = (event) => {        
    
    event.preventDefault();

    let not_valid = validateUser(userName, []);

    for (let question of props.questions) {
      not_valid = validateClosedQuestion(question, not_valid);
      not_valid = validateOpenQuestion(question, not_valid);
    }
    
    setNotValid(not_valid);
    
    if (not_valid.length === 0) {

      setLoading(true);

      let objToPost = {};

      objToPost.survey_id = id;
      objToPost.user = userName;
      objToPost.answers = [];

      for (const q_id in openAnswers) {
        objToPost.answers = [...objToPost.answers, {
          question_id: parseInt(q_id),
          text: openAnswers[q_id]
        }];
      }

      for (let answer of closedAnswers) {
        objToPost.answers = [...objToPost.answers, {
          question_id: answer.question_id, 
          option_id: answer.option_id
        }];
      }

      API.submitSurveyAnswers(objToPost);
      handleRedirect();

    }
    
  };

  return (
      
      <>
      
      {props.loading ? 

        <Spinner animation='border' /> :

        <>

          <Headline title={props.surveyTitle} subtitle={`Author: ${props.surveyAuthor}`}/>

          <Form>

            <UserField notValid={notValid} setUserName={setUserName}/>

            <ListGroup>

              {
                props.questions !== 'not found' ?

                  props.questions.map((question) => {

                    return (

                      <Question key={question.id} question={question} notValid={notValid}
                        closedAnswers={closedAnswers} setClosedAnswers={setClosedAnswers}
                        openAnswers={openAnswers} setOpenAnswers={setOpenAnswers}
                        read_only={false}/>

                    );

                  }) :
                  <>
                    <Redirect to='/' />
                  </>
                }

            </ListGroup>

          </Form>

          {notValid.length !== 0 && 
            <Alert variant='danger' className='error-alert'>
              Error(s) in the form, please fix it.
            </Alert>}

          <Button variant='mandarin-margin' onClick={handleSubmit}>Submit</Button>

        </>
      
      }
      
      </>
  
  );

}

export default FillSurvey;