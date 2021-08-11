const mysql = require('mysql');

const pool = mysql.createPool({
  host: process.env.MysqlHost,
  user: process.env.Mysqluser,
  password: process.env.Mysqlpassword,
  database: process.env.Mysqldatabase
});

module.exports = pool;
