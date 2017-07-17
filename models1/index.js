"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
//var env       =  "production";
// var config    = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var sequelize = new Sequelize("gpsscanner", "di", "di123##", {
    host: '192.168.1.209',
    dialect: 'mysql',
    port: 3306,
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

// var sequelize = new Sequelize("Pettorway","root", "upQ--xT6c3JQX9vy", {
//   host: '192.168.169.39',
//   dialect: 'mysql',
//   port:3306,
//   pool: {
//     max: 5,
//     min: 0,
//     idle: 10000
//   },
//   logging: false,
//    define: {
//         timestamps: false,
//     }


// });

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