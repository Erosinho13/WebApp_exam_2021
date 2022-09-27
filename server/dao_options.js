'use strict';

const db = require('./db');

// get options by its survey id and question id
exports.getOptions = (survey_id, question_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT option_id, option
      FROM Options
      WHERE survey_id = ? AND question_id = ?`;
    db.all(sql, [survey_id, question_id], (err, rows) => {
      if (err)
        reject(err);
      else if (rows.length === 0)
        resolve({error: "no matches"})
      else {
        const options = rows.map(o => ({
          id: o.option_id,
          option: o.option
        }));
        resolve(options);
      }
    });
  });
};

// get option by its survey id, question id and option id
exports.getOptionBySIdQIdOId = (survey_id, question_id, option_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT survey_id, question_id, option_id, option
      FROM Options
      WHERE survey_id = ? AND question_id = ? AND option_id = ?`;
    db.get(sql, [survey_id, question_id, option_id], (err, row) => {
      if (err)
        reject(err);
      else if (!row)
        resolve({error: "no match"})
      else {
        const question = {
          survey_id: row.survey_id,
          question_id: row.question_id,
          option_id: row.option_id,
          option: row.option
        }
        resolve(question);
      }
    });
  });
};

exports.addOption = (survey_id, question_id, option_id, option) => {
  return new Promise((resolve, reject) => {
    const sql = `
    INSERT INTO Options(survey_id, question_id, option_id, option)
    VALUES(?, ?, ?, ?)
    `;
    db.run(sql, [survey_id, question_id, option_id, option],
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