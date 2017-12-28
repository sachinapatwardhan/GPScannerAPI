// require('newrelic');
require('dotenv').config()
global.express = require('express');
//var router = express.Router();
global.app = express();
global.Promise = require("bluebird");
Promise.config({
    longStackTraces: true,
    warnings: true
})
var x = new Date();
var offset = -x.getTimezoneOffset();
global.CurrentOffset = (('00' + offset).slice(-2) >= 0 ? "+" : "-") + ('00' + parseInt(offset / 60).toString()).slice(-2) + ":" + offset % 60;
global.bodyParser = require('body-parser');
global.jsonParser = bodyParser.json();
global.passport = require('passport');
global.jwt = require('jwt-simple');
global.validator = require('validator');
global.nodemailer = require('nodemailer');
global.smtpTransport = require('nodemailer-smtp-transport');
global.u = require("underscore");
global.fs = require('fs');
global.formidable = require('formidable');
global.nodeExcel = require('excel-export');
global.generatePassword = require("password-generator");
global.geolib = require("geolib");
global.models = require('./models1');
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

global.NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyAzzv0uzTJsDnsxVoBKYg1xNn8bCBrMErM', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};
global.geocoder = NodeGeocoder(options);

//Socket and Token
global.SocketPort = process.env.SocketPort;
global.SocketIPAddress = process.env.SocketIPAddress;
global.TokenKey = process.env.TokenKey;

global.MysqlHost = process.env.MysqlHost;
global.Mysqluser = process.env.Mysqluser;
global.Mysqlpassword = process.env.Mysqlpassword;
global.Mysqldatabase = process.env.Mysqldatabase;
global.IsProduction = process.env.IsProduction;

//mysql connection
global.connection = mysql.createConnection({
    host: MysqlHost,
    user: Mysqluser,
    password: Mysqlpassword,
    database: Mysqldatabase
});
global.RoutePath = process.env.RoutePath;

//Push Notification
global.PushNotifications = require('node-pushnotifications');
global.pdf = require('html-pdf');
global.redis = require("redis");

if (process.env.IsProduction == true || process.env.IsProduction == "true") {
    global.client = redis.createClient({
        host: process.env.RedisHost,
        port: process.env.RedisPort,
        password: process.env.RedisPassword
    });
} else {
    global.client = redis.createClient({
        host: process.env.RedisHost,
        port: process.env.RedisPort
    });
}

client.on("error", function(err) {
    console.log("Error " + err);
});


if (global.IsProduction == false || global.IsProduction == "false") {
    //Local
    global.PushNotificationSettings = {
        gcm: {
            id: process.env.PushNotificationgcmid, // PUT YOUR GCM SERVER API KEY,
            // id: 'AIzaSyDlPocDJjvWweDY_uaOmEkzqZQIUDbCGV8',
            // id: 'AIzaSyD1uMEJM2cfegBmWOgqg3iJYFOlN6PWLE0',
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
                cert: __dirname + "/certs/certdevelopment.pem",
                key: __dirname + "/certs/keyDevelopment.pem",
                // cert: __dirname + "/certs/HCDevelopmnetCert.pem",
                // key: __dirname + "/certs/HCDevelopmentKey.pem",
                // cert: __dirname + "/certs/NaviDevelopmentCert.pem",
                // key: __dirname + "/certs/NaviDevelopmentKey.pem",
                // production: true
            }
        },
    };
} else {

    //Live
    global.PushNotificationSettings = {
        gcm: {
            id: process.env.PushNotificationgcmid, // PUT YOUR GCM SERVER API KEY,
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
            //gateway: 'gateway.sandbox.push.apple.com',
            badge: 1,
            defaultData: {
                expiry: 4 * 7 * 24 * 3600, // 4 weeks
                sound: 'bass.caf'
            },
            options: {
                cert: __dirname + "/certs/certProduction.pem",
                key: __dirname + "/certs/keyProduction.pem",
                production: true
            }
        },
    };
}

//schedule
global.schedule = require('node-schedule');

global.PushNotificationSend = new PushNotifications(PushNotificationSettings);

//Push Notification End

var smtpConfig = {
    service: process.env.SMTPService,
    host: process.env.SMTPhost,
    port: process.env.SMTPport,
    secure: true,
    auth: {
        user: process.env.SMTPuser,
        pass: process.env.SMTPpass
    },
    tls: {
        rejectUnauthorized: false
    }
};
global.transporter = nodemailer.createTransport(smtpTransport(smtpConfig));
//-------------redis server-----------
global.redis = require("redis");

if (process.env.IsProduction == true || process.env.IsProduction == "true") {
    global.client = redis.createClient({
        host: process.env.RedisHost,
        port: process.env.RedisPort,
        password: process.env.RedisPassword
    });
} else {
    global.client = redis.createClient({
        host: process.env.RedisHost,
        port: process.env.RedisPort
    });
}

client.on("error", function(err) {
    console.log("Error " + err);
});



// client.set(DeviceId, JSON.stringify(objConnection), function(err, replies) {});
//----------------end redis server------------
//============== Send SMS ======================//
global.api_key = process.env.SMSAPIkey;
global.api_secret = process.env.SMSapisecret;
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

// var models = require("./models1");
app.use(passport.initialize());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization, Access-Control-Allow-Headers");
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// for Socket

var http = require('http').Server(app);
// var io = require('socket.io')(http),
global.io = require('socket.io')(http);

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

app.use('/pettracking', require('./controllers/petTracking'))

app.use('/petalarm', require('./controllers/petAlarm'))
app.use('/favoriteplace', require('./controllers/favoriteplace'))
    //app.use('/petFeedback', require('./controllers/petFeedback'))
    //app.use('/petshop', require('./controllers/petShop'))

app.use('/carrier', require('./controllers/carrier'))

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


//User
app.use('/role', require('./controllers/role'))
app.use('/user', require('./controllers/user'))
app.use('/userpermission', require('./controllers/userPermission'))
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
app.use('/sharedevice', require('./controllers/sharedevice'))
app.use('/productAttribute', require('./controllers/productAttribute'))
app.use('/product', require('./controllers/product'))
app.use('/productAttributeMapping', require('./controllers/productAttributeMapping'))
app.use('/productAttributeValue', require('./controllers/productAttributeValue'))
app.use('/productAttributeCombination', require('./controllers/productAttributeCombination'))
app.use('/productPictureMapping', require('./controllers/productPictureMapping'))
app.use('/orderservice', require('./controllers/orderservice'))
    // app.use('/advancefence', require('./controllers/advancefence'))
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
app.use('/telco', require('./controllers/telco'))
app.use('/MapData', require('./controllers/MapData'))
app.use('/homepage', require('./controllers/homepage'))
app.use('/Report', require('./controllers/Report'));
app.use('/appinfo', require('./controllers/appinfo'));
app.use('/appversion', require('./controllers/appversion'));
app.use('/sim', require('./controllers/sim'));
app.use('/appsetting', require('./controllers/appsetting'));
app.use('/vehicletype', require('./controllers/vehicletype'));
app.use('/mainsetting', require('./controllers/mainsetting'));
app.use('/DeviceStock', require('./controllers/DeviceStock'));
app.use('/serviceenhancement', require('./controllers/serviceenhancement'));
app.use('/advancefence', require('./controllers/advancefence'))
    //socket API End

//Wallet Transaction
app.use('/WalletTransaction', require('./controllers/WalletTransaction'))

// MAARK Install App
app.use('/salesAgent', require('./controllers/salesAgent'));
app.use('/retailer', require('./controllers/retailer'));

// MAARK Install App End

http.listen(process.env.APIPort, function() {
    console.log('listening on *:' + process.env.APIPort);
});

io.sockets.on('connection', function(socket) {
    // console.log('connection...');
    socket.on('emit_from_client', function(data) {
        // console.log('socket.io server received : ' + data);
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