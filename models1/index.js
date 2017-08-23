"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
//var env       =  "production";
// var config    = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var sequelize = new Sequelize(process.env.Mysqldatabase, process.env.Mysqluser, process.env.Mysqlpassword, {
    host: process.env.MysqlHost,
    dialect: 'mysql',
    port: process.env.MysqlPort,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    logging: false,
    define: {
        timestamps: false,
    }


});

var db = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;