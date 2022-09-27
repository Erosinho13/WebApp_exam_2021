'use strict';

const bcrypt = require('bcrypt');

const db = require('./db');

exports.getUser = (name, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Admins WHERE name = ?';
    db.get(sql, [name], (err, row) => {
      if (err)
        reject(err); // DB error
      else if (row === undefined)
        resolve(false); // name of the admin not found. No row is returned
      else {
        bcrypt.compare(password, row.password).then(result => {
          if (result) //password matches
            resolve({id: row.admin_id, username: row.name, num_surveys: row.num_surveys});
          else
            resolve(false);
        })
      }
    })
  })
};

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Admins WHERE admin_id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({error: 'User not found.'});
      else
        // by default, the local strategy looks for "username":
        // not to create confusion in server.js, we can create an object with that property
        resolve({id: row.admin_id, username: row.name, num_surveys: row.num_surveys});
    });
  });
};

exports.updateAdminNumSurveys = (admin_id, num_surveys) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE Admins
      SET num_surveys = ?
      WHERE admin_id = ?`;
    db.run(sql, [num_surveys, admin_id], function (err) {
        if (err) {
            reject(err);
            return;
        }
        resolve(true);
    });
  });
};