const mysql = require('mysql');
const config = {
    host: process.env.MysqlHost,
    user: process.env.Mysqluser,
    port: process.env.MysqlPort,
    password: process.env.Mysqlpassword,
    database: process.env.Mysqldatabase,
    multipleStatements: true
}
class Database {
    constructor() {
        this.connection = mysql.createConnection(config);
        this.handleConnection();
    }
    handleConnection() {
        this.connection.connect((err) => {
            if (err) {
                setTimeout(() => {
                    this.connection = mysql.createConnection(config);
                    this.handleConnection();
                }, 2000);
            }
        });
        this.connection.on('error', (err) => {
            this.connection = mysql.createConnection(config);
            this.handleConnection();
        });
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}
module.exports = Database;