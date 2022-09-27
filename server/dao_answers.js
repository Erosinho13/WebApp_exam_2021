'use strict';

const db = require('./db');

const addClosedAnswer = (answer) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO ClosedAnswers(answers_id, question_id, option_id, survey_id, user)
      VALUES(?, ?, ?, ?, ?)
    `;
    db.run(sql, [answer.answers_id, answer.question_id, answer.option_id, answer.survey_id,
      answer.user],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
}

const addOpenAnswer = (answer) => {
  return new Promise((resolve, reject) => {
    const sql = `
    INSERT INTO OpenAnswers(answers_id, question_id, survey_id, user, text)
    VALUES(?, ?, ?, ?, ?)
    `;
    db.run(sql, [answer.answers_id, answer.question_id, answer.survey_id, answer.user,
      answer.text],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
}

exports.addSurveyAnswers = (filling) => {

  if (filling.answers.length > 0) {
    let pr_list = []
    for (let answer of filling.answers) {
      if (answer.option_id)
        pr_list = [...pr_list, addClosedAnswer({
          answers_id: filling.answers_id,
          question_id: answer.question_id,
          option_id: answer.option_id,
          survey_id: filling.survey_id,
          user: filling.user
        })];
      else if (answer.text)
        pr_list = [...pr_list, addOpenAnswer({
          answers_id: filling.answers_id,
          question_id: answer.question_id,
          survey_id: filling.survey_id,
          user: filling.user,
          text: answer.text
        })];
    }

    const ret_value = Promise.all(pr_list).then((res) => {
      return res;
    });
  
    return ret_value;

  }

  return addClosedAnswer({
    answers_id: filling.answers_id,
    question_id: 1,
    option_id: -1,
    survey_id: filling.survey_id,
    user: filling.user
  })

}

exports.getMaxAnsId = () => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT MAX(answers_id) AS max_id
    FROM (
      SELECT answers_id FROM ClosedAnswers
      UNION
      SELECT answers_id FROM OpenAnswers
    )`
    db.get(sql, [], (err, row) => err ? reject(err) : resolve(row));
  });    
}

exports.getAnswersBySId = (survey_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT R.answers_id, R.question_id, S.admin_id, R.user, R.option_id, R.text
    FROM Surveys S, Questions Q, (
      SELECT answers_id, question_id, user, option_id, NULL AS text
      FROM ClosedAnswers
      WHERE survey_id = ?
      UNION
      SELECT answers_id, question_id, user, NULL AS option_id, text
      FROM OpenAnswers
      WHERE survey_id = ?
      ) R
    WHERE Q.question_id = R.question_id AND
      Q.survey_id = S.survey_id AND
      S.survey_id = ?
    `;
    db.all(sql, [survey_id, survey_id, survey_id], (err, rows) => {
      if (err)
        reject(err);
      else if (rows.length === 0)
        resolve({info: "no matches"})
      else {

        let responses = {};
        responses.admin_id = rows[0].admin_id;
        
        for (let r of rows) {
          
          if (!responses[r.answers_id])
            responses[r.answers_id] = {
              'user': r.user,
              'answers': {}
            };

            if (r.text)
              responses[r.answers_id]['answers'][r.question_id] = r.text;
            else {
              if (!responses[r.answers_id]['answers'][r.question_id])
                responses[r.answers_id]['answers'][r.question_id] = [];
              responses[r.answers_id]['answers'][r.question_id] =
                [...responses[r.answers_id]['answers'][r.question_id], r.option_id]
            }
        }

        resolve(responses);

      }
    });
  });
};