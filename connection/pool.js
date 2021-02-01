const mysql = require('mysql');

const pool = mysql.createPool({
  host: process.env.MysqlHost,
  user: process.env.Mysqluser,
  password: process.env.Mysqlpassword,
  database: process.env.Mysqldatabase
});

module.exports = pool;


pool.query('SELECT ? + ? FROM DUAL', [3, 2], (err, rows) => {
  if (err) {
    return console.error(err.stack);
  }

  return console.log(rows);
});
