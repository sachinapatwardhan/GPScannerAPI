// require('newrelic');
var express = require('express');
//var router = express.Router();
var app = express();
var Promise = require("bluebird");
Promise.config({
    longStackTraces: true,
    warnings: true
})

var bodyParser = require('body-parser');
var passport = require('passport');
var jwt = require('jwt-simple');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
global.mysql = require('mysql');
//Import Excel File
global.XLSX = require('xlsx');
global.FileReader = require('filereader')
global.request = require('request');
global.jsonfile = require('jsonfile');
global.CountryLanguage = require('country-language');
global.moment = require('moment');
global.crc = require('crc');
global.net = require('net');

global.MysqlHost = '192.168.1.209';
global.Mysqluser = 'di';
global.Mysqlpassword = 'di123##';
global.Mysqldatabase = 'gpsscanner';
//mysql connection
// global.connection = mysql.createConnection({
//     host: '192.168.169.39',
//     user: 'root',
//     password: 'upQ--xT6c3JQX9vy',
//     database: 'gipsin'
// });
global.connection = mysql.createConnection({
    host: MysqlHost,
    user: Mysqluser,
    password: Mysqlpassword,
    database: Mysqldatabase
});

// global.RoutePath = "http://45.64.169.32:4444/";
// global.RoutePath = "http://localhost:10026/";
global.RoutePath = "http://localhost:7100/";
//global.RoutePath = "http://182.70.126.194:10026/";

//Push Notification
global.PushNotifications = require('node-pushnotifications');

// var setting = models.tblsetting;

global.PushNotificationSettings = {
    gcm: {
        id: 'AIzaSyBXEIP3zuw_zKeu3MMnRXL9V9J_QBuns3k', // PUT YOUR GCM SERVER API KEY,
        msgcnt: 1,
        dataDefaults: {
            delayWhileIdle: false,
            timeToLive: 4 * 7 * 24 * 3600, // 4 weeks
            retries: 4,
            sound: 'img/bell.mp3'
        },
        // Custom GCM request options https://github.com/ToothlessGear/node-gcm#custom-gcm-request-options
        options: {},
    },
    apn: {
        gateway: 'gateway.sandbox.push.apple.com',
        badge: 1,
        defaultData: {
            expiry: 4 * 7 * 24 * 3600, // 4 weeks
            sound: 'bass.caf'
        },
        options: {
            // cert: __dirname + "/../certs/pettorwayIOS.p12", // {Buffer|String} The filename of the connection certificate to load from disk, or a Buffer/String containing the certificate data. (Defaults to: cert.pem)
            // passphrase: "pettorway"
            cert: __dirname + "/certs/Pettorwaycert.pem",
            key: __dirname + "/certs/Pettorwaykey.pem",
            // cert: __dirname + "/certs/PFcert.pem",
            // key: __dirname + "/certs/PFkey.pem",
            // production: true
            // key: __dirname + "/../certs/pettorwayIOS.p12"
        }
    },
};

global.OwnerPushNotificationSettings = {
    gcm: {
        id: 'AIzaSyBXEIP3zuw_zKeu3MMnRXL9V9J_QBuns3k', // PUT YOUR GCM SERVER API KEY,
        msgcnt: 1,
        dataDefaults: {
            delayWhileIdle: false,
            timeToLive: 4 * 7 * 24 * 3600, // 4 weeks
            retries: 4,
            sound: 'img/bell.mp3'
        },
        // Custom GCM request options https://github.com/ToothlessGear/node-gcm#custom-gcm-request-options
        options: {},
    },
    apn: {
        gateway: 'gateway.sandbox.push.apple.com',
        badge: 1,
        defaultData: {
            expiry: 4 * 7 * 24 * 3600, // 4 weeks
            sound: 'bass.caf'
        },
        options: {
            // cert: __dirname + "/../certs/pettorwayIOS.p12", // {Buffer|String} The filename of the connection certificate to load from disk, or a Buffer/String containing the certificate data. (Defaults to: cert.pem)
            // passphrase: "pettorway"
            cert: __dirname + "/certs/Ownercertd.pem",
            key: __dirname + "/certs/Ownerkeyd.pem",
            // cert: __dirname + "/certs/Ownercertp.pem",
            // key: __dirname + "/certs/Ownerkeyp.pem",
            // production: true
            // key: __dirname + "/../certs/pettorwayIOS.p12"
        }
    },
};

//Live
// global.PushNotificationSettings = {
//     gcm: {
//         id: 'AIzaSyBXEIP3zuw_zKeu3MMnRXL9V9J_QBuns3k', // PUT YOUR GCM SERVER API KEY,
//         msgcnt: 1,
//         dataDefaults: {
//             delayWhileIdle: false,
//             timeToLive: 4 * 7 * 24 * 3600, // 4 weeks
//             retries: 4,
//             sound: 'img/bell.mp3'
//         },
//         // Custom GCM request options https://github.com/ToothlessGear/node-gcm#custom-gcm-request-options
//         options: {},
//     },
//     apn: {
//         //gateway: 'gateway.sandbox.push.apple.com',
//         badge: 1,
//         defaultData: {
//             expiry: 4 * 7 * 24 * 3600, // 4 weeks
//             sound: 'bass.caf'
//         },
//         options: {
//             // cert: __dirname + "/../certs/pettorwayIOS.p12", // {Buffer|String} The filename of the connection certificate to load from disk, or a Buffer/String containing the certificate data. (Defaults to: cert.pem)
//             // passphrase: "pettorway"
//             // cert: __dirname + "/certs/Pettorwaycert.pem",
//             // key: __dirname + "/certs/Pettorwaykey.pem",
//             cert: __dirname + "/certs/PFcert.pem",
//             key: __dirname + "/certs/PFkey.pem",
//             production: true
//                 // key: __dirname + "/../certs/pettorwayIOS.p12"
//         }
//     },
// };

// global.OwnerPushNotificationSettings = {
//     gcm: {
//         id: 'AIzaSyBXEIP3zuw_zKeu3MMnRXL9V9J_QBuns3k', // PUT YOUR GCM SERVER API KEY,
//         msgcnt: 1,
//         dataDefaults: {
//             delayWhileIdle: false,
//             timeToLive: 4 * 7 * 24 * 3600, // 4 weeks
//             retries: 4,
//             sound: 'img/bell.mp3'
//         },
//         // Custom GCM request options https://github.com/ToothlessGear/node-gcm#custom-gcm-request-options
//         options: {},
//     },
//     apn: {
//         //gateway: 'gateway.sandbox.push.apple.com',
//         badge: 1,
//         defaultData: {
//             expiry: 4 * 7 * 24 * 3600, // 4 weeks
//             sound: 'bass.caf'
//         },
//         options: {
//             // cert: __dirname + "/../certs/pettorwayIOS.p12", // {Buffer|String} The filename of the connection certificate to load from disk, or a Buffer/String containing the certificate data. (Defaults to: cert.pem)
//             // passphrase: "pettorway"
//             //cert: __dirname + "/certs/Ownercertd.pem",
//             //key: __dirname + "/certs/Ownerkeyd.pem",
//              cert: __dirname + "/certs/Ownercertp.pem",
//              key: __dirname + "/certs/Ownerkeyp.pem",
//              production: true
//             // key: __dirname + "/../certs/pettorwayIOS.p12"
//         }
//     },
// };

//schedule
global.schedule = require('node-schedule');

// function test() {
//     console.log("test - " + new Date())
//         // console.trace();
//     setTimeout(test, 10000);
// }

// test();

// function f() {
//     console.log("f - " + new Date);
// }

// setInterval(f, 10000);

// var rule = new schedule.RecurrenceRule();
// //rule.dayOfWeek = [0, new schedule.Range(4, 6)];
// //rule.hour = 5;
// //rule.minute = 0;
// rule.second = 10;

// var j = schedule.scheduleJob(rule, function() {
//     console.log(new Date());
// });


//Report
// global.jasper = require('node-jasper')({
//     path: __dirname + '/lib/jasperreports-5.6.0',
//     drivers: {
//         pg: {
//             path: __dirname + '/lib/mysql-connector-java-5.1.39-bin.jar',
//             class: 'com.mysql.jdbc.Driver',
//             type: 'mysql'
//         }
//     },
//     conns: {
//         dbserver1: {
//             host: '192.168.1.100',
//             port: 3306,
//             dbname: '91mai',
//             user: 'dhaval',
//             pass: 'dhaval',
//             driver: 'pg'
//         }
//     },
//     defaultConn: 'dbserver1'
// });
// var tttt = {
//     "gateway": "gateway.sandbox.push.apple.com",
//     "cert": __dirname + "/../resource/cert.pem",
//     "key:": __dirname + "/../resource/key.pem",
//     "passphrase:": "secret"
// }
global.PushNotificationSend = new PushNotifications(PushNotificationSettings);

//Push Notification End

var smtpConfig = {
    service: "trxemail",
    host: 'mail.trxemail.com',
    port: 25,
    secure: false,
    auth: {
        user: 'trxemail',
        pass: 'XfYvGSU51p'
    },
    tls: {
        rejectUnauthorized: false
    }
};
global.transporter = nodemailer.createTransport(smtpTransport(smtpConfig));


//============== Send SMS ======================//
global.api_key = 'a692ce5b';
global.api_secret = '928903ee92ecd3e4';
global.sendSMS = function(obj, callback) {
    // var SMSbody = obj.body.replace(/ /g, "%20");
    request.get({
        url: 'https://rest.nexmo.com/sms/json?api_key=' + api_key + '&api_secret=' + api_secret + '&text=' + obj.body + '&to=' + obj.To + '&from=Gipsina'
            // url: 'http://sms.bugzstudio.com/websmsapi/ISendSMS.aspx?username=' + SMSUserName + '&password=' + SMSPassword + '&message=' + SMSbody + '&mobile=' + obj.To + '&sender=gintell&type=1'
    }, function(error, response, body) {
        // console.log(error)
        // console.log("################################")
        // console.log(response)
        // console.log("################################")
        // console.log(body)
        if (error) {
            var ResMessage = '';
            var objres = new Object();
            objres.Status = false;
            ResMessage = "Message Not Send Successfully."
            objres.body = body;
            callback(objres);
        } else {
            var objres = new Object();
            objres.Status = true;
            objres.body = body;
            var ResMessage = '';

            // var lstbodyResp = body.split(':');
            // if (lstbodyResp[0] == "1701") {
            //     ResMessage = "Message Send Successfully."
            // } else if (lstbodyResp[0] == "1702") {
            //     objres.Status = false;
            //     ResMessage = "Invalid Username Password (SMS Gatway)."
            // } else if (lstbodyResp[0] == "1703") {
            //     objres.Status = false;
            //     ResMessage = "Internal Server Error (SMS Gatway)."
            // } else if (lstbodyResp[0] == "1704") {
            //     objres.Status = false;
            //     ResMessage = "Insufficient Credits (SMS Gatway)."
            // } else if (lstbodyResp[0] == "1705") {
            //     objres.Status = false;
            //     ResMessage = "Invalid Mobile Number.Please Contact Administrator (SMS Gatway)."
            // } else if (lstbodyResp[0] == "1706") {
            //     objres.Status = false;
            //     ResMessage = "Invalid Message. Please Contact Administrator (SMS Gatway)."
            // } else if (lstbodyResp[0] == "1718") {
            //     objres.Status = false;
            //     ResMessage = "Duplicate record received.Please Contact Administrator (SMS Gatway)."
            // } else if (lstbodyResp[0] == "1719") {
            //     objres.Status = false;
            //     ResMessage = "Spam Keyword found in Message Template (SMS Gatway)."
            // } else {
            //     objres.Status = false;
            //     ResMessage = "Message Not Send Successfully."
            // }

            objres.Message = ResMessage;
            callback(objres);
        }
    });
}

app.get('/SendTestSMS', function(req, res) {
    console.log("Calll")
    var obj = new Object();
    obj.To = '919727850580';
    obj.body = 'This SMS is for Test.';
    global.sendSMS(obj, function(response) {
        res.send(response);
    })
});



var models = require("./models1");
app.use(passport.initialize());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization, Access-Control-Allow-Headers");
    next();
});

// for Socket

var http = require('http').Server(app);
// var io = require('socket.io')(http),
global.io = require('socket.io')(http),
    fs = require('fs');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/loaderio-eecfb734fd04534c9d0a45668de1f60e', function(req, res) {
    res.send('loaderio-eecfb734fd04534c9d0a45668de1f60e');
});

app.get('/loaderio-77f8cf2fe818b42b0353bbe2a21da573', function(req, res) {
    res.send('loaderio-77f8cf2fe818b42b0353bbe2a21da573');
});

app.use(express.static(__dirname + '/'));


app.use('/customer', require('./controllers/customers'))
app.use('/dashboard', require('./controllers/dashboard'))
app.use('/account', require('./controllers/account'))

app.use('/enquiry', require('./controllers/enquiry'))
app.use('/vehicles', require('./controllers/vehicles'))

//Pet

app.use('/pettracking', require('./controllers/petTracking'))

app.use('/petalarm', require('./controllers/petAlarm'))
    //app.use('/petFeedback', require('./controllers/petFeedback'))
    //app.use('/petshop', require('./controllers/petShop'))

app.use('/carrier', require('./controllers/carrier'))
    //app.use('/petbreed', require('./controllers/petbreed'))
    //End of Pet

//Sales


//End of Sales

//CMS
app.use('/media', require('./controllers/media'))
app.use('/menu', require('./controllers/menu'))
app.use('/banner', require('./controllers/banner'))
app.use('/stickyfooter', require('./controllers/stickyfooter'))
app.use('/widget', require('./controllers/widget'))


app.use('/news', require('./controllers/news'))
    //End of CMS


app.use('/warehouse', require('./controllers/warehouse'))
app.use('/vendor', require('./controllers/vendor'))

app.use('/store', require('./controllers/store'))
    //End of Master

//User
app.use('/role', require('./controllers/role'))
app.use('/user', require('./controllers/user'))
app.use('/userpermission', require('./controllers/userPermission'))
    //End of User

//User

app.use('/currency', require('./controllers/currency'))

//End of User

//Setting
app.use('/module', require('./controllers/module'))
app.use('/country', require('./controllers/country'))
app.use('/state', require('./controllers/state'))
app.use('/city', require('./controllers/city'))


app.use('/settings', require('./controllers/settings'))
app.use('/email', require('./controllers/email'))
app.use('/category', require('./controllers/category'))
app.use('/taxcategory', require('./controllers/taxcategory'))
app.use('/taxrate', require('./controllers/taxrate'))
app.use('/language', require('./controllers/language'))
app.use('/languageresources', require('./controllers/languageResources'))
app.use('/pushnotification', require('./controllers/pushnotification'))
app.use('/petfence', require('./controllers/petFence'))
app.use('/facebookpagesetting', require('./controllers/facebookpagesetting'))

//End of Setting

//Bike
app.use('/bike', require('./controllers/bike'))
    // End of Bike

app.use('/dynamicpage', require('./controllers/dynamicpage'))

//socket API start
app.use('/socketapi', require('./controllers/socketapi'))

app.use('/PetDevice', require('./controllers/PetDevice'))

//gpsdata
app.use('/gpsdata', require('./controllers/gpsdata'))
app.use('/canbusdata', require('./controllers/canbusdata'))

//socket API End


//app.use('/petshopaccount', require('./controllers/petshopaccount'))

var PetGPS = models.tblgpsscanner;
var PetAlarm = models.tblalarm;
var PetResponse = models.tblapisresponse;
var PetHandshake = models.tblhandshake;
var Pet = models.tblpet;
var Fence = models.tblfence;


var geolib = require("geolib");

http.listen(7212, function() {
    console.log('listening on *:7212');
});

// http.listen(3333, function() {
//     console.log('listening on *:3333');
// });
io.sockets.on('connection', function(socket) {
    // console.log('connection...');
    socket.on('emit_from_client', function(data) {
        // console.log('socket.io server received : ' + data);
        // 接続しているソケット全部
        io.sockets.emit('emit_from_server', data);
    });

    //GPS Data
    socket.on('Command9955', function(data) {
        // console.log('socket.io server received 9955 : ' + data);
        Command9955(data, function(res) {

        })
    });

    //Alarm Data
    socket.on('Command9999', function(data) {
        // console.log('socket.io server received 9999 : ' + data);
        Command9999(data, function(res) {

        })
    });

    //Heart Beat Data
    socket.on('Command5001', function(data) {
        // console.log('socket.io server received 5001 : ' + data);

        Command5001(data, function(res) {

        })
    });

    //CAN-BUS Data
    socket.on('Command9901', function(data) {
        // console.log('socket.io server received 9901 : ' + data);
        Command9901(data, function(res) {

        })
    });

    //Driving Behavior Data
    socket.on('Command9902', function(data) {
        // console.log('socket.io server received 9902 : ' + data);
        Command9902(data, function(res) {

        })
    });
});


var PushNotification = models.tblpushnotification;

function SendIOSPushNotification() {
    console.log(__dirname + "/../resource/key.pem")
    var deviceIds = [];

    var UserId = 0;
    var data = {
        title: 'Fence',
        message: "Test",
        otherfields: {
            deviceid: "1",
            PetId: "2",
            PetName: "3"
        }
    };

    PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {

        function SendNotification(i) {
            if (i < response.length) {
                deviceIds.push(response[i].PushNotificationId)
                SendNotification(i + 1);
            } else {
                console.log(deviceIds)
                if (deviceIds.length > 0) {
                    PushNotificationSend.send(deviceIds, data, function(result) {
                        console.log(result);
                    });
                };
            }
        }
        SendNotification(0)
    }).catch(function(error) {
        console.log(error);
    })

}

function SendPushNotification(data, UserId) {
    var deviceIds = [];

    PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {
        console.log(response)

        function SendNotification(i) {
            if (i < response.length) {
                deviceIds.push(response[i].PushNotificationId)
                SendNotification(i + 1);
            } else {
                console.log(deviceIds)
                if (deviceIds.length > 0) {

                    PushNotificationSend.send(deviceIds, data, function(result) {
                        console.log(result);
                    });
                };
            }
        }
        SendNotification(0)
    }).catch(function(error) {
        res.json(error);
    })

}