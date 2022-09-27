'use strict';

const db = require('./db');

// get the list of all the questions for a given survey
exports.getQuestions = (survey_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT question_id, is_closed, title, min, max, num_options
      FROM Questions
      WHERE survey_id = ?
    `
    db.all(sql, [survey_id], (err, rows) => {
      if (err)
        reject(err);
      else if (rows.length === 0)
        resolve({error: "no matches"})
      else {
        const questions = rows.map(q => ({
          id: q.question_id,
          is_closed: q.is_closed,
          title: q.title,
          min: q.min,
          max: q.max,
          num_options: q.num_options
        }));
        resolve(questions);
      }
    });
  });    
}

// get question by its survey id and question id
exports.getQuestionBySIdQId = (survey_id, question_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT survey_id, question_id, is_closed, title, min, max, num_options
      FROM Questions
      WHERE survey_id = ? AND question_id = ?`;
    db.get(sql, [survey_id, question_id], (err, row) => {
      if (err)
        reject(err);
      else if (!row)
        resolve({error: "no match"})
      else {
        const question = {
          survey_id: row.survey_id,
          question_id: row.question_id,
          is_closed: row.is_closed,
          title: row.title,
          min: row.min,
          max: row.max,
          num_options: row.num_options
        }
        resolve(question);
      }
    });
  });
};

exports.addQuestion = (survey_id, question_id, is_closed, title, min, max, num_options) => {
  return new Promise((resolve, reject) => {
    const sql = `
    INSERT INTO Questions(survey_id, question_id, is_closed, title, min, max, num_options)
    VALUES(?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [survey_id, question_id, is_closed, title, min, max, num_options],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      }
    );
  });
}