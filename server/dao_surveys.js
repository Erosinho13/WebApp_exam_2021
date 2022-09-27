'use strict';

const db = require('./db');

// get the list of all the available surveys
exports.getListSurveys = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT S.survey_id, S.title, A.name, S.num_questions
      FROM Surveys AS S, Admins AS A
      WHERE S.admin_id = A.admin_id`;
    db.all(sql, [], (err, rows) => {
      if (err)
        reject(err);
      else if (rows.length === 0)
        resolve({error: "no matches"})
      else {
        const surveys = rows.map(s => ({
          id: s.survey_id,
          title: s.title,
          admin: s.name,
          num_questions: s.num_questions
        }));
        resolve(surveys);
      }
    });
  });
};

// get survey title and author by its survey id
exports.getSurveyById = (survey_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT S.title, A.name, S.num_questions
      FROM Surveys AS S, Admins AS A
      WHERE S.admin_id = A.admin_id AND
            S.survey_id = ?`;
    db.get(sql, [survey_id], (err, row) => {
      if (err)
        reject(err);
      else if (!row)
        resolve({error: "no match"})
      else {
        const survey = {
          title: row.title,
          admin: row.name,
          num_questions: row.num_questions
        }
        resolve(survey);
      }
    });
  });
};

exports.getRespondantUsersByAId = (admin_id) => {
  
  return new Promise((resolve, reject) => {
    
    const sql = `
    SELECT *
    FROM (    
      SELECT S.survey_id, S.title, S.admin_id, COUNT(I.answers_id) AS num_responses
      FROM Surveys S
      LEFT JOIN (
        SELECT answers_id, survey_id
        FROM (
          SELECT answers_id, survey_id
          FROM ClosedAnswers
          UNION
          SELECT answers_id, survey_id
          FROM OpenAnswers
        )
      ) I 
      ON S.survey_id = I.survey_id
      GROUP BY S.survey_id
    )
    WHERE admin_id = ?
    `;
    
    db.all(sql, [admin_id], (err, rows) => {
      if (err)
          reject(err);
      else {
        const responses = rows.map((row) => ({
          survey_id: row.survey_id,
          title: row.title,
          admin_id: row.admin_id,
          num_responses: row.num_responses
        }));
        resolve(responses);
      }
    });

  });

};

exports.getRespondantUsersBySId = (survey_id) => {
  
  return new Promise((resolve, reject) => {
    
    const sql = `
    SELECT S.admin_id, S.title, I.num_responses
    FROM Surveys S, (
      SELECT COUNT(answers_id) AS num_responses 
      FROM (
        SELECT answers_id
        FROM ClosedAnswers CA
        WHERE CA.survey_id = ?
        UNION
        SELECT answers_id
        FROM OpenAnswers OA
        WHERE OA.survey_id = ?
      )
    ) I
    WHERE S.survey_id = ?`;
    
    db.get(sql, [survey_id, survey_id, survey_id], (err, row) => {
      if (err)
          reject(err);
      else if (!row)
        resolve({error: "no match"})
      else {
        const responses_per_survey = {
          survey_id: survey_id,
          admin_id: row.admin_id,
          title: row.title,
          num_responses: row.num_responses
        };
        resolve(responses_per_survey);
      }
    });

  });

};

exports.getLastId = (() => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT MAX(survey_id) AS max
      FROM Surveys
    `;
    db.get(sql, [], (err, row) => err ? reject(err) : resolve(row.max ? row.max : 0));
  });
});

exports.addSurvey = (survey_id, title, admin_id, num_questions) => {
  return new Promise((resolve, reject) => {
    const sql = `
    INSERT INTO Surveys(survey_id, title, admin_id, num_questions)
    VALUES(?, ?, ?, ?)
    `;
    db.run(sql, [survey_id, title, admin_id, num_questions],
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