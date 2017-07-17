  var async = require('async');
  var models  = require('../models1');

exports.create = function(userId, text, done) {
  var values = [userId, text, new Date().toISOString()]
  
  db.get().query('INSERT INTO comments (user_id, text, date) VALUES(?, ?, ?)', values, function(err, result) {
    if (err) return done(err)
    done(null, result.insertId)
  })
}

exports.getAll = function(done) {
  db.get().query('SELECT * FROM product', function (err, rows) {
    if (err) return done(err)
    done(null, rows)
  })
}

exports.getAllByUser = function(userId, done) {
  db.get().query('SELECT * FROM product WHERE id = ?', userId, function (err, rows) {
    if (err) return done(err)
    done(null, rows)
  })
}
var message = 'Howdy';

exports.sayHello = function(){
  
}