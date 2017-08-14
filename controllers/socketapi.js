//Tables
var router = express.Router();
var geolib = require("geolib");
var PushNotification = models.tblpushnotification;
var IMEINumber = models.tblimeinumber;
var IMEINumberMapping = models.tbliosimeinumbermapping;
var TaxSetting = models.tblsetting;
// var FacebookPostData = models.tblfacebookpostdata;
var HandShake = models.tblhandshake;
var Vehicle = models.tblvehicle;

var momentz = require('moment-timezone');



//End of Tables

global.deg_to_lat_long = function(deg, Direction) {

    // var Direction = deg.substring(deg.length - 1, deg.length);
    // var Minute = deg.substring(deg.length - 7, deg.length)
    // var degree = deg.substring(0, deg.length - 7)
    var Minute = deg.substring(deg.indexOf('.') - 2, deg.length)
    var degree = deg.substring(0, deg.indexOf('.') - 2)
        // console.log(Minute)
    var min = Minute.substring(0, Minute.indexOf('.'));
    var sec = parseFloat(Minute.substring(Minute.indexOf('.'), Minute.length)) * 60;
    // console.log("#######################")
    // console.log(sec);
    sec = sec.toFixed(3);
    // console.log(degree);
    // console.log(min);
    // console.log(sec);
    // console.log("#######################")
    var lat_long = '';
    try {
        lat_long = geolib.useDecimal(degree + "° " + min + "' " + sec + "\" " + Direction);
    } catch (ex) {
        // console.log(ex)
        lat_long = parseFloat(degree) + (parseFloat(Minute) / 60);

        if (Direction == "S" || Direction == "W") {
            lat_long = parseFloat(lat_long) * -1;
        }
    }
    return lat_long;
}

router.get('/TestDegree', function(req, res) {
    var A = global.deg_to_lat_long('5016.8633N')
    var B = global.deg_to_lat_long('00347.3997W')
    console.log(A)
    console.log(B)
    res.send(A + B);
})



function SendIOSPushNotification(DeviceId) {
    // console.log(__dirname + "/../resource/key.pem")
    var deviceIds = [];

    var UserId = 0;
    var data = {
        title: 'Alert',
        message: '9787 is out of Home Fence.',
        Fence: 'Default',
        otherfields: {
            deviceid: '123456',
            Id: 1,
            VehicleName: '9787',
            AlarmCode: '6',
            Type: 'Alarm'
        }
    };

    // PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {

    //PushNotificationSettings.apn.defaultData.sound = 'jinglebellssms.caf';

    var objPushNotificationSend = new PushNotifications(PushNotificationSettings);

    function SendNotification(i) {
        // if (i < response.length) {
        // deviceIds.push(response[i].PushNotificationId)
        deviceIds.push(DeviceId)
            // SendNotification(i + 1);
            // } else {
        console.log(deviceIds)
        if (deviceIds.length > 0) {
            objPushNotificationSend.send(deviceIds, data, function(result) {
                console.log(result);
            });
        };
        // }
    }
    SendNotification(0)
        // }).catch(function(error) {
        //     // console.log(error);
        // })

}


router.get('/SendIOSPush', function(req, res) {
    var DeviceId = req.query.Token;
    SendIOSPushNotification(DeviceId);
    res.send("Done")
})

router.get('/TestQuery', function(req, res) {
    connection.query("SELECT PushNotificationId,Platform from tblpushnotification where iduser=1 group by PushNotificationId, Platform", function(err, response, fields) {
        console.log(err)
        console.log(response.length)
        res.json(response)
    });
})

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function SendPushNotification(data, UserId) {
    // var deviceIds = [];
    connection.query("SELECT PushNotificationId,Platform from tblpushnotification where iduser=" + UserId + " group by PushNotificationId, Platform", function(err, response, fields) {
        if (!err && response.length > 0) {
            // PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {
            function SendNotification(i) {
                if (i < response.length) {

                    // connection.query("SELECT * from tblsetting where Name ='" + PushNotificationType + "' ", function(err, lstSetting, fields) {
                    //     if (lstSetting[0].Value == 1) {
                    var deviceIds = [];
                    deviceIds.push(response[i].PushNotificationId)
                        //SendNotification(i + 1);
                        // } else {
                        // console.log(deviceIds)
                    var objData = clone(data);
                    if (response[i].Platform == 'ios') {
                        objData.title = data.message;
                        objData.message = data.message;
                        if (objData.Fence == 'FenceIn') {
                            PushNotificationSettings.apn.defaultData.sound = 'fencein.caf';
                        } else if (objData.Fence == 'FenceOut') {
                            PushNotificationSettings.apn.defaultData.sound = 'fenceout.caf';
                        } else {
                            PushNotificationSettings.apn.defaultData.sound = 'default';
                        };
                    };
                    // console.log(response[i].Platform + "_______________________________________________________")
                    // console.log(objData)
                    objData.priority = 'high';
                    var objPushNotificationSend = new PushNotifications(PushNotificationSettings);
                    if (deviceIds.length > 0) {

                        objPushNotificationSend.send(deviceIds, objData, function(result) {
                            // console.log(result);
                            SendNotification(i + 1);
                        });
                    } else {
                        SendNotification(i + 1);
                    };
                    //     } else {
                    //         SendNotification(i + 1);
                    //     }
                    // });



                }
            }
            SendNotification(0)
        }

    })
}

function GetCurrentDate() {
    var today = new Date();

    var sec = today.getUTCSeconds();
    var min = today.getUTCMinutes();
    var hour = today.getUTCHours();

    var year = today.getUTCFullYear();
    var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getUTCDate();

    //return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    return ("0000" + year.toString()).slice(-4) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2) + " " + ("00" + hour.toString()).slice(-2) + ":" + ("00" + min.toString()).slice(-2) + ":" + ("00" + sec.toString()).slice(-2);
}

// var ServerConnectionrule = new schedule.RecurrenceRule();
// //rule.dayOfWeek = [0, new schedule.Range(4, 6)];
// // rule.hour = 10;
// rule.minute = 1;
// rule.second = 0;
function sendServerDisconnectMail() {

    TaxSetting.findOne({ where: { Name: 'SocketCheckMail', Value: '1' } }).then(function(response) {
        //console.log(response)
        if (response) {
            var mail = {
                from: 'pmt@bugzstudio.com',
                to: 'pmt@bugzstudio.com;soham.patel@bugzstudio.com',
                //to: 'soham.patel@bugzstudio.com',
                subject: 'Pettorway Socket Server Disconnected',
                text: 'Dear Bugzstudio Team,\n\n Your Pettorway Socket Server is not Responding. Please Restart it. \n Thank you. \n\n Pettorway'
            };
            transporter.sendMail(mail, function(error, response) {

            });
        };

    });
}

function CheckServerLoadIncreaseMail() {
    var Currentdatetime = new Date();
    console.log("Call Datetime = " + Currentdatetime);
    var query = "select Id,Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction, DeviceId from tblpetgps where deviceid=075034498153 and GPSPositioning='A' and Datetime >= '2017-07-03 18:30:00' and Datetime <= '2017-07-04 18:29:59';"
    connection.query(query, function(err, lstGPSData, fields) {
        //console.log(response)
        var Responsedatetime = new Date();
        console.log("Response Datetime = " + Responsedatetime);
        var ResponseTime = (Responsedatetime - Currentdatetime);
        console.log("Response Time = " + ResponseTime)
        if (ResponseTime > 5000) {
            var mail = {
                from: 'pmt@bugzstudio.com',
                to: 'pmt@bugzstudio.com;soham.patel@bugzstudio.com',
                //to: 'soham.patel@bugzstudio.com',
                subject: 'Pettorway API load time > 5sec',
                text: 'Dear Bugzstudio Team,\n\n Your GPSINA GPS data get taking greater then 5sec. Please Check it. \n Thank you. \n\n'
            };
            transporter.sendMail(mail, function(error, response) {

            });
        }

    });
}

var ServerConnectionCheck = schedule.scheduleJob('* * 9 * * *', function() {
    // CheckServerLoadIncreaseMail();
});

//Calculate CRC
// global.CalculateCRCbyHex = function(hex) {
//     var bytedata = hex2byteCRC(hex);
//     return ("0000" + decimalToHexString(crc.crc16ccitt(bytedata))).slice(-4);
// }

global.CalculateCRCbyHex = function(hex) {
    var bytedata = hex2byteCRC(hex);
    return ("0000" + decimalToHexString(crc.crc16x25(bytedata))).slice(-4);
}

// var Testdatatt = '100000000C9461000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C94C3000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C9473000C94730000000000240027002A000000000023002600290000000000DD10008000250028002B0004040404040404040202020202020303030303030102040810204080010204081020010204081020000000080002010000030407000000000000000011241FBECFEFD8E0DEBFCDBF21E0A0E0B1E001C01D92A930B207E1F70E940D010C94E1010C940000833081F028F4813099F08230A1F008958730A9F088305310010000B9F08430D1F4809180008F7D03C0809180008F7780938000089584B58F7702C084B58F7D84BD08958091B0008F7703C08091B0008F7D8093B00008953FB7F8948091050190910601A0910701B091080126B5A89B05C02F3F19F00196A11DB11D3FBFBA2FA92F982F8827820F911DA11DB11DBC01CD0142E0660F771F881F991FF3100180004A95D1F708951F920F920FB60F9211242F933F938F939F93AF93BF938091010190910201A0910301B09104013091000123E0230F2D3720F40196A11DB11D05C026E8230F0296A11DB11D209300018093010190930201A0930301B09304018091050190910601A0910701B09108010196A11DB11D8093050190930601A09307018410020000B0930801BF91AF919F918F913F912F910F900FBE0F901F901895789484B5826084BD84B5816084BD85B5826085BD85B5816085BD80916E00816080936E00109281008091810082608093810080918100816080938100809180008160809380008091B10084608093B1008091B00081608093B00080917A00846080937A00809159100280007A00826080937A0080917A00816080937A0080917A00806880937A001092C100CCE9D0E0FE01249108E810E0F8018491882399F090E0880F991FFC01E859FF4FA591B49184589F4FFC01459154918FB7F8949C91292B2C938FBF40EBE42E40E0F42E50E0C52E50E0D52EF7018491FE01A490F801B490BB20A1F081110E947500DF10030000EB2DF0E0EE0FFF1FEE58FF4FA591B4918C91A82291E080E009F490E0A92EB82E02C0A12CB12CF7018491FE018490F80194909920C1F081110E947500892D90E0880F991F84589F4FFC01A591B4918FB7F8949C91AA94AB2819F48094892201C0892A8C928FBF0E949E002B013C0184EF882E99249394A12CB12C0E949E00DC014D10038000CB0184199509A609B709883E9340A105B10558F021E0821A9108A108B10888EE480E83E0581E611C711C81149104A104B10419F7C114D10409F497CF0E94000094CFF894FFCFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFAC00000001';
// console.log(CalculateCRCbyHex('4040001266104024166087400001'));

router.get('/CalculateCRCOnline', function(req, res) {
    res.send(CalculateCRCbyHex(req.query.data));
});
//Hex to Byte For CRC
function hex2byteCRC(hexx) {
    var hex = hexx.toString(); //force conversion
    var lst = [];
    for (var i = 0; i < hex.length; i += 2)
        lst.push(parseInt(hex.substr(i, 2), 16));
    return lst;
}

function hexToBinary(s) {
    var i, k, part, ret = '';
    // lookup table for easier conversion. '0' characters are padded for '1' to '7'
    var lookupTable = {
        '0': '0000',
        '1': '0001',
        '2': '0010',
        '3': '0011',
        '4': '0100',
        '5': '0101',
        '6': '0110',
        '7': '0111',
        '8': '1000',
        '9': '1001',
        'a': '1010',
        'b': '1011',
        'c': '1100',
        'd': '1101',
        'e': '1110',
        'f': '1111',
        'A': '1010',
        'B': '1011',
        'C': '1100',
        'D': '1101',
        'E': '1110',
        'F': '1111'
    };
    for (i = 0; i < s.length; i += 1) {
        if (lookupTable.hasOwnProperty(s[i])) {
            ret += lookupTable[s[i]];
        }
    }
    return ret;
}
// var binary = parseInt('1000', 16).toString(2)
// console.log(hexToBinary('1001'))

//Decimal To Hex
function decimalToHexString(number) {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

function a2hex(str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i++) {
        var hex = ("00" + Number(str.charCodeAt(i)).toString(16).toUpperCase()).slice(-2);
        arr.push(hex);
    }

    return arr.join('');
}

//Hex to Ascii
function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

router.get('/TestAPI', function(req, res) {
    console.log(req.query);
    res.send("Success");
});

router.get('/RequestIMEINumberbyUDID', function(req, res) {
    var UDID = req.query.UDID;
    IMEINumberMapping.findOne({ where: { UDID: UDID } }).then(function(objUserIMEI) {
        if (objUserIMEI != null) {
            res.json({ IMEI: objUserIMEI.IMEI });
        } else {
            IMEINumber.findOne({ where: { IsUse: false } }).then(function(objIMEI) {
                var obj = new Object();
                obj.UDID = UDID;
                obj.IMEI = objIMEI.IMEI;
                obj.CreatedDate = new Date();
                IMEINumberMapping.create(obj).then(function(resUserIMEI) {
                    objIMEI.updateAttributes({ IsUse: true }).then(function(resIMEI) {
                        res.json({ IMEI: objIMEI.IMEI });
                    })
                })
            })
        }
    })

});

router.get('/GenerateIMEI', function(req, res) {
    req.setTimeout(3600000);
    // for (var i = 0; i < 10; i++) {
    // var NewPassword = customPassword();
    // console.log(NewPassword);
    // }

    function InsertIMEI(i) {
        if (i < 10000) {
            var IMEINumber = customPassword();
            connection.query("SELECT * from tblimeinumber where IMEI=" + IMEINumber + "", function(err, numberrow, fields) {
                if (!err) {
                    if (numberrow.length > 0) {
                        InsertIMEI(i + 1);
                    } else {
                        connection.query("Insert INTO tblimeinumber (`IMEI`,`IsUse`) VALUES(" + IMEINumber + ",0)", function(err, Bikerows, fields) {
                            InsertIMEI(i + 1);
                        });
                    }
                } else {
                    InsertIMEI(i + 1);
                }
            });
        } else {
            res.send("Success");
        }
    }
    InsertIMEI(0)



});


//Private functions
var maxLength = 16;
var minLength = 16;
var uppercaseMinCount = 2;
var lowercaseMinCount = 2;
var numberMinCount = 16;
var specialMinCount = 1;
var UPPERCASE_RE = /([A-Z])/g;
var LOWERCASE_RE = /([a-z])/g;
var NUMBER_RE = /([\d])/g;
var NumberNotStartwithZero = /^((?!(0))(?!(.0))(?!(..0))[0-9]{16})$/g;
var SPECIAL_CHAR_RE = /([\?\-\^\$\#\@\!\%\&\*])/g;
var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

function isStrongEnough(password) {
    // var uc = password.match(UPPERCASE_RE);
    // var lc = password.match(LOWERCASE_RE);
    var n = password.match(NUMBER_RE);
    var nc = password.match(NumberNotStartwithZero);
    // var sc = password.match(SPECIAL_CHAR_RE);
    var nr = password.match(NON_REPEATING_CHAR_RE);
    return password.length >= minLength &&
        n && n.length >= numberMinCount && nc;
    // &&
    // sc && sc.length >= specialMinCount;
}

function customPassword() {
    var password = "";
    var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;

    while (!isStrongEnough(password)) {
        password = generatePassword(randomLength, false, /[\d\-]/);
    }
    return password;
}
//End of Private functions

//5000 - Login
router.get('/Command5000', function(req, res) {
    var line = req.query.Code;
    console.log("Login = " + line);

    var DeviceId = line.substring(8, 22);

    var CurrentDate = GetCurrentDate();
    var response = '40400012' + DeviceId + '400001';
    response = response + CalculateCRCbyHex(response) + '0D0A';
    connection.query("SELECT * from tblgpsdevice where DeviceId=" + DeviceId, function(err, rows, fields) {
        if (!err) {
            //if (rows.length > 0) {
            //tblapisresponse Entry
            // var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('5000', '" + response + "', '" + CurrentDate + "');";
            // connection.query(ResponceQuery, function(err, rows1, fields) {
            res.send(response);
            // });
            // } else {
            //     //tblPetgps Entry

            //     var ResponceQuery = "INSERT INTO tblgpsdevice (Code,Response,Datetime) VALUES ('5000', '" + response + "', '" + CurrentDate + "');";
            //     connection.query(ResponceQuery, function(err, rows1, fields) {
            //         res.json(response);
            //     });
            //     //});
            // }
        }
    })

})

//Command5001 - Heartbeat Command
global.Command5001 = function(line, Callback) {
    console.log("HandShak = " + line);
    //Server Reconnet If Disconneted
    if (connection.state == 'disconnected') {
        global.connection = mysql.createConnection({
            host: MysqlHost,
            user: Mysqluser,
            password: Mysqlpassword,
            database: Mysqldatabase
        });
    }

    var DeviceId = line.substring(8, 22);

    var CurrentDate = GetCurrentDate();

    //tblPetgps Entry
    var query = "INSERT INTO tblhandshake (DeviceId,Datetime ) VALUES ('" + DeviceId + "', '" + CurrentDate + "');";
    connection.query(query, function(err, rows, fields) {

        connection.query("Update tblvehicle set HandshakDatetime='" + CurrentDate + "',IsOnline=true where deviceid=" + DeviceId, function(err, rows1, fields) {
            var objConnection = {
                DeviceId: DeviceId,
                Status: true
            }
            io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
            io.sockets.emit(DeviceId + 'BikeDeviceStatus', JSON.stringify(objConnection));
        });

    });
};

//Command9955 - GPS Command
global.Command9955 = function(line, Callback) {
    console.log("GPS Data = " + line);
    try {
        //Server Reconnet If Disconneted
        if (connection.state == 'disconnected') {
            global.connection = mysql.createConnection({
                host: MysqlHost,
                user: Mysqluser,
                password: Mysqlpassword,
                database: Mysqldatabase
            });
        }
        // var line = req.query.Code;
        // console.log("muyyyyy", line);
        var DeviceId = line.substring(8, 22);

        var GPSData = hex2a(line.substring(26, (line.length - 8)));

        var lstGPSAllData = GPSData.split('|');

        var lstLocationData = lstGPSAllData[0].split(',');


        var Date1 = lstLocationData[8];
        var Position = lstLocationData[1];
        var Lat = lstLocationData[2];
        var LatDirection = lstLocationData[3];
        var Lan = lstLocationData[4];
        var LanDirection = lstLocationData[5];
        var Speed = (parseFloat(lstLocationData[6]) * 1.852);
        var Time = lstLocationData[0];
        var Direction = lstLocationData[7];

        var HDOP = lstGPSAllData[1];
        var altitude = lstGPSAllData[2];
        var inputoutputSTatus = lstGPSAllData[3];
        var lstAD = lstGPSAllData[4].split(',')
        var AD1 = lstAD[0];
        var AD2 = lstAD[2];
        var Odometer = lstGPSAllData[5];
        var RFID = lstGPSAllData[6];


        var day = parseInt(Date1.substring(0, 2));
        var month = parseInt(Date1.substring(2, 4));
        var year = parseInt("20" + Date1.substring(4, 6));
        var hour = parseInt(Time.substring(0, 2));
        var min = parseInt(Time.substring(2, 4));
        var sec = parseInt(Time.substring(4, 6));

        // // var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
        var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
        var GPSDate = year + "-" + month + "-" + day;
        var CurrentDate = GetCurrentDate();

        var convertDate = convertdateformat(GPSDateTime);
        var unixDateStemp = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

        var Latitude = global.deg_to_lat_long(Lat, LatDirection);
        var Longitude = global.deg_to_lat_long(Lan, LanDirection);

        var Inputoutputbit = hexToBinary(inputoutputSTatus);
        var lstInputOutputStatus = Inputoutputbit.split('');

        var IsRelayToStopTheCar = false;
        var IsSirenSound = false;
        var IsUserDefined = false;
        var IsLockTheDoor = false;
        var IsUnlockTheDoor = false;
        var IsSOS = false;
        var IsWiringForAntiTamper = false;
        var IsDoor = false;
        var IsEngine = false;
        var IsOriginalSirenTriggeringStatus = false;

        if (lstInputOutputStatus[15] == '1') {
            IsRelayToStopTheCar = true;
        }

        if (lstInputOutputStatus[14] == '1') {
            IsSirenSound = true;
        }

        if (lstInputOutputStatus[13] == '1') {
            IsUserDefined = true;
        }

        if (lstInputOutputStatus[12] == '1') {
            IsLockTheDoor = true;
        }

        if (lstInputOutputStatus[11] == '1') {
            IsUnlockTheDoor = true;
        }

        if (lstInputOutputStatus[10] == '1') {
            IsSOS = true;
        }

        if (lstInputOutputStatus[9] == '1') {
            IsWiringForAntiTamper = true;
        }

        if (lstInputOutputStatus[8] == '1') {
            IsDoor = true;
        }

        if (lstInputOutputStatus[4] == '1' || lstInputOutputStatus[3] == '1') {
            IsEngine = true;
        }

        if (lstInputOutputStatus[3] == '1') {
            IsOriginalSirenTriggeringStatus = true;
        }

        var IsAdvanture = false;
        // //Insert data in gps
        var query = "INSERT INTO tblgpsdata (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,IsRelayToStopTheCar,IsSirenSound,IsUserDefined,IsLockTheDoor,IsUnlockTheDoor,IsSOS,IsWiringForAntiTamper,IsDoor,IsEngine,IsOriginalSirenTriggeringStatus,CreatedDate,HDOP,Altitude,AD1,AD2,OdoMeter,Date ) " +
            "VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "'," + IsRelayToStopTheCar + "," + IsSirenSound + "," + IsUserDefined + "," + IsLockTheDoor + "," + IsUnlockTheDoor + "," + IsSOS + "," + IsWiringForAntiTamper + "," + IsDoor + "," + IsEngine + "," + IsOriginalSirenTriggeringStatus + ",'" + CurrentDate + "','" + HDOP + "','" + altitude + "','" + AD1 + "','" + AD2 + "','" + Odometer + "','" + unixDateStemp + "');";
        connection.query(query, function(err, rows, fields) {
            // console.log(err)
            //     console.log("***************BR00**************")
            //     console.log(err)
            //     console.log("*****************************")
            //     var code = "BR00";
            //     if (line.indexOf('BP04') > 0) {
            //         code = "BP04";
            //     }

            //     // var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('" + code + "', 'No Response', '" + CurrentDate + "');";
            //     // connection.query(ResponceQuery, function(err, rows1, fields) {
            //     console.log("End Function", new Date())
            //     Callback("No Response");
            //     strResponce = "No Response";
            //     //});

            var objConnection = {
                Position: Position,
                Speed: Speed,
                Deviceid: DeviceId,
                Latitude: Latitude,
                Longitude: Longitude,
                Direction: Direction,
                IsRelayToStopTheCar: IsRelayToStopTheCar,
                IsSirenSound: IsSirenSound,
                IsUserDefined: IsUserDefined,
                IsLockTheDoor: IsLockTheDoor,
                IsUnlockTheDoor: IsUnlockTheDoor,
                IsSOS: IsSOS,
                IsWiringForAntiTamper: IsWiringForAntiTamper,
                IsDoor: IsDoor,
                IsEngine: IsEngine,
                IsOriginalSirenTriggeringStatus: IsOriginalSirenTriggeringStatus,
                Date: unixDateStemp
            }

            if (Position == 'A') {
                io.sockets.emit('BikeRoute', JSON.stringify(objConnection));
                io.sockets.emit(DeviceId + 'BikeRoute', JSON.stringify(objConnection));
            }
        });

        connection.query("SELECT * from tblfence where deviceId=" + DeviceId, function(err, rows, fields) {
            if (!err && rows.length > 0) {
                connection.query("SELECT * from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
                    if (!err && Bikerows.length > 0) {
                        var objVehicle = Bikerows[0];
                        if (Position == 'A') {

                            function checkFence(j) {
                                if (j < rows.length) {
                                    rows[j].IsPetInFence = true;
                                    var response = rows[j];

                                    // var response = rows[0];

                                    var CheckPoints = {
                                        latitude: parseFloat(Latitude),
                                        longitude: parseFloat(Longitude)
                                    }

                                    var IsPetInFence = true;

                                    if (response.fencedraw == "circle") {
                                        var CircleCenterPoints = {
                                            latitude: parseFloat(response.lat),
                                            longitude: parseFloat(response.lng)
                                        }
                                        var CircleRadius = parseFloat(response.range);
                                        IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                    } else if (response.fencedraw == "polygon" || response.fencedraw == "polyline") {
                                        var lstpolygonDrawC = [];
                                        var lstlatC = response.lat.split(',');
                                        var lstlngC = response.lng.split(',');

                                        for (var i = 0; i < lstlatC.length; i++) {
                                            var objDraw = {
                                                latitude: parseFloat(lstlatC[i]),
                                                longitude: parseFloat(lstlngC[i])
                                            }
                                            lstpolygonDrawC.push(objDraw);
                                        }
                                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                    } else if (response.fencedraw == "rectangle") {
                                        var lstpolygonDrawC = [];
                                        var lstlatC = response.lat.split(',');
                                        var lstlngC = response.lng.split(',');

                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[0]),
                                            longitude: parseFloat(lstlngC[0])
                                        }
                                        lstpolygonDrawC.push(objDraw);
                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[0]),
                                            longitude: parseFloat(lstlngC[1])
                                        }
                                        lstpolygonDrawC.push(objDraw);
                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[1]),
                                            longitude: parseFloat(lstlngC[1])
                                        }
                                        lstpolygonDrawC.push(objDraw);
                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[1]),
                                            longitude: parseFloat(lstlngC[0])
                                        }
                                        lstpolygonDrawC.push(objDraw);
                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[0]),
                                            longitude: parseFloat(lstlngC[0])
                                        }
                                        lstpolygonDrawC.push(objDraw);

                                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                    };

                                    // console.log("Fence Last State = " + objBike.IsInFence)
                                    // console.log("Fence Current State = " + IsPetInFence)
                                    if (IsPetInFence != rows[j].IsInFence && rows[j].IsFenceOnline) {
                                        var AlarmCode = '6';
                                        var Message = '';

                                        if (IsPetInFence == false) {
                                            AlarmCode = '66';
                                            if (rows[j].name != null && rows[j].name != '' && rows[j].name != undefined) {
                                                Message = objVehicle.Name + ' is out of ' + rows[j].name + ' Fence.';
                                            } else {
                                                Message = objVehicle.Name + ' is out of Fence.';
                                            }
                                        } else {
                                            AlarmCode = '6';
                                            if (rows[j].name != null && rows[j].name != '' && rows[j].name != undefined) {
                                                Message = objVehicle.Name + ' is in ' + rows[j].name + ' Fence.';
                                            } else {
                                                Message = objVehicle.Name + ' is in Fence.';
                                            }
                                        }
                                        console.log(unixDateStemp);
                                        connection.query('UPDATE tblfence set IsInFence=' + IsPetInFence + ' WHERE id=' + rows[j].id, function(err, rowsFence, fields) {
                                            console.log(err)
                                            var Alarmquery = "INSERT INTO tblalarm (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,AlarmCode,CreatedDate,FenceName ) VALUES ('" + GPSDateTime + "', '" + unixDateStemp + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "','" + AlarmCode + "','" + CurrentDate + "','" + rows[j].name + "');";
                                            // var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + AlarmCode + "');";
                                            connection.query(Alarmquery, function(err1, Alarmrows, fields) {

                                                var PushNotificationdata = {
                                                    title: 'Alert',
                                                    message: Message,
                                                    Fence: 'Default',
                                                    otherfields: {
                                                        deviceid: DeviceId,
                                                        Id: objVehicle.id,
                                                        VehicleName: objVehicle.Name,
                                                        AlarmCode: AlarmCode,
                                                        Type: 'Alarm'
                                                    }
                                                };
                                                SendPushNotification(PushNotificationdata, objVehicle.iduser);

                                                var objConnection = {
                                                    AlarmCode: AlarmCode.toString(),
                                                    DeviceId: DeviceId,
                                                    Datetime: GPSDateTime,
                                                    Date: unixDateStemp,
                                                    IdUser: objVehicle.iduser,
                                                    Name: objVehicle.Name
                                                }


                                                io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                                                io.sockets.emit(objVehicle.iduser + 'DeviceAlarm', JSON.stringify(objConnection));
                                                checkFence(j + 1);
                                            });
                                        });
                                    } else {
                                        checkFence(j + 1);
                                    }
                                } else {

                                }
                            }
                            checkFence(0);
                        }
                    }
                });
            };
        });

        connection.query("SELECT * from tblfavoriteplace where DeviceId=" + DeviceId, function(err, rows, fields) {
            if (!err && rows.length > 0) {
                connection.query("SELECT * from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
                    if (!err && Bikerows.length > 0) {
                        var objBike = Bikerows[0];
                        if (Position == 'A') {
                            function checkFavorite(j) {
                                if (j < rows.length) {
                                    rows[j].IsInFavoritePlace = true;
                                    var response = rows[j];

                                    // var response = rows[0];

                                    var CheckPoints = {
                                        latitude: parseFloat(Latitude),
                                        longitude: parseFloat(Longitude)
                                    }

                                    var IsInFavoritePlace = true;

                                    // if (response.fencedraw == "circle") {
                                    var CircleCenterPoints = {
                                        latitude: parseFloat(response.Latitude),
                                        longitude: parseFloat(response.Longitude)
                                    }
                                    var CircleRadius = parseFloat(response.Range);
                                    IsInFavoritePlace = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                        // }

                                    // console.log("Fence Last State = " + objBike.IsInFence)
                                    // console.log("Fence Current State = " + IsPetInFence)
                                    if (IsInFavoritePlace != rows[j].IsInFavoritePlace && rows[j].IsInFavoritePlace) {
                                        var Code = '0';
                                        var message = '';

                                        if (IsInFavoritePlace == false) {
                                            AlarmCode = '1';
                                            if (rows[j].Name != null && rows[j].Name != '' && rows[j].Name != undefined) {
                                                message = objBike.Name + ' is out of ' + rows[j].Name + ' Favorite Place.';
                                            } else {
                                                message = objBike.Name + ' is out of Favorite Place.';
                                            }
                                        } else {
                                            AlarmCode = '0';
                                            if (rows[j].Name != null && rows[j].Name != '' && rows[j].Name != undefined) {
                                                message = objBike.Name + ' is in ' + rows[j].Name + ' Favorite Place.';
                                            } else {
                                                message = objBike.Name + ' is in Favorite Place.';
                                            }
                                        }
                                        console.log(unixDateStemp);
                                        connection.query('UPDATE tblfavoriteplace set IsInFavoritePlace=' + IsInFavoritePlace + ' WHERE id=' + rows[j].id, function(err, rowsFavorite, fields) {
                                            console.log(err)
                                            var query = "INSERT INTO tblfavoriteinout (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,Code,CreatedDate ) VALUES ('" + GPSDateTime + "', '" + unixDateStemp + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "','" + Code + "','" + CurrentDate + "');";
                                            // var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + AlarmCode + "');";
                                            connection.query(query, function(err1, Favrows, fields) {
                                                checkFavorite(j + 1);
                                            });
                                        });
                                    } else {
                                        checkFavorite(j + 1);
                                    }
                                } else {

                                }
                            }
                            checkFavorite(0);
                        }
                    }
                });
            };
        });

    } catch (ex) {
        console.log("Error GPS Data = " + line);
    }

};

//Command9999 - Alarm Command
global.Command9999 = function(line, Callback) {
    console.log("Alarm Data = " + line);
    //Server Reconnet If Disconneted
    if (connection.state == 'disconnected') {
        global.connection = mysql.createConnection({
            host: MysqlHost,
            user: Mysqluser,
            password: Mysqlpassword,
            database: Mysqldatabase
        });
    }
    // var line = req.query.Code;
    // console.log("muyyyyy", line);
    var DeviceId = line.substring(8, 22);
    var AlarmCode = line.substring(26, 28);
    var GPSData = hex2a(line.substring(28, (line.length - 8)));
    var lstGPSAllData = GPSData.split('|');

    var lstLocationData = lstGPSAllData[0].split(',');


    var Date1 = lstLocationData[8];
    var Position = lstLocationData[1];
    var Lat = lstLocationData[2];
    var LatDirection = lstLocationData[3];
    var Lan = lstLocationData[4];
    var LanDirection = lstLocationData[5];
    var Speed = (parseFloat(lstLocationData[6]) * 1.852);
    var Time = lstLocationData[0];
    var Direction = lstLocationData[7];

    var HDOP = lstGPSAllData[1];
    var altitude = lstGPSAllData[2];
    var inputoutputSTatus = lstGPSAllData[3];
    var lstAD = lstGPSAllData[4].split(',')
    var AD1 = lstAD[0];
    var AD2 = lstAD[2];
    var Odometer = lstGPSAllData[5];
    var RFID = lstGPSAllData[6];


    var day = parseInt(Date1.substring(0, 2));
    var month = parseInt(Date1.substring(2, 4));
    var year = parseInt("20" + Date1.substring(4, 6));
    var hour = parseInt(Time.substring(0, 2));
    var min = parseInt(Time.substring(2, 4));
    var sec = parseInt(Time.substring(4, 6));

    // // var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
    var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    var GPSDate = year + "-" + month + "-" + day;
    var CurrentDate = GetCurrentDate();
    var convertDate = convertdateformat(GPSDateTime);
    var unixDateStemp = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    var Latitude = global.deg_to_lat_long(Lat, LatDirection);
    var Longitude = global.deg_to_lat_long(Lan, LanDirection);

    var Status = '0';
    var Sign = '0';
    var ReserveSection = '0';
    var IsAdvanture = false;

    // console.log(Latitude)
    // console.log(Longitude)
    // console.log(GPSDateTime)

    var query = "INSERT INTO tblalarm (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,AlarmCode,CreatedDate ) VALUES ('" + GPSDateTime + "', '" + unixDateStemp + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "','" + AlarmCode + "','" + CurrentDate + "');";
    connection.query(query, function(err, rows, fields) {
        // console.log("Alarm");
        // console.log(err);
        // var GPSquery = "INSERT INTO tblpetgps (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + DeviceId + "'," + IsAdvanture + ");";
        // connection.query(GPSquery, function(err, rows, fields) {
        //     // console.log("GPS");
        //     // console.log(err);
        // });

        connection.query("SELECT * from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, lstVehicle, fields) {
            if (!err && lstVehicle.length > 0) {
                var objVehicle = lstVehicle[0];
                var Message = "";

                if (AlarmCode == '04') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Engine ON alert! Please check!';
                } else if (AlarmCode == '03') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Door Open alert! Please check!';
                } else if (AlarmCode == '10') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Low Bettry alert! Please check!';
                } else if (AlarmCode == '11') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Max Speed alert! Please check!';
                } else if (AlarmCode == '12') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Movement alert! Please check!';
                } else if (AlarmCode == '30') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Vibration alert! Please check!';
                } else if (AlarmCode == '50') {
                    Message = 'Vehicle ' + objVehicle.Name + ' External Power Cut alert! Please check!';
                } else if (AlarmCode == '05') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Original Triggering alert! Please check!';
                } else if (AlarmCode == '02') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Line Broken alert! Please check!';
                } else if (AlarmCode == '52') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Veer Report alert! Please check!';
                } else if (AlarmCode == '60') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Fuel Driving alert! Please check!';
                } else if (AlarmCode == '71') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Crash alert! Please check!';
                } else if (AlarmCode == '72') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Acceleration alert! Please check!';
                } else if (AlarmCode == '81') {
                    Message = 'Vehicle ' + objVehicle.Name + ' Fuel Loss alert! Please check!';
                }

                var PushNotificationdata = {
                    title: 'Alert',
                    message: Message,
                    Fence: 'Default',
                    otherfields: {
                        deviceid: DeviceId,
                        Id: objVehicle.id,
                        VehicleName: objVehicle.Name,
                        AlarmCode: AlarmCode,
                        Type: 'Alarm'
                    }
                };
                SendPushNotification(PushNotificationdata, objVehicle.iduser);


                var objConnection = {
                    AlarmCode: AlarmCode.toString(),
                    DeviceId: DeviceId,
                    Datetime: GPSDateTime,
                    Date: unixDateStemp,
                    IdUser: objVehicle.iduser,
                    Name: objVehicle.Name
                }

                // if (new Date(GPSDateTime) <= new Date()) {
                io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                io.sockets.emit(objVehicle.iduser + 'DeviceAlarm', JSON.stringify(objConnection));
                // }
            }
        });


    });


    // if (AlarmCode.toString() == "11" && Position == 'A') {


    //     var prevDatetime = new Date(GPSDateTime);
    //     var OneMinPrevDatetime = new Date(GPSDateTime);
    //     var PreDate = convertdateformat(prevDatetime);
    //     var OneMinPreDate = convertdateformat(OneMinPrevDatetime.setMinutes(OneMinPrevDatetime.getMinutes() - 1));
    //     var newDate = convertdateformat(prevDatetime.setMinutes(prevDatetime.getMinutes() - 30));
    //     connection.query("SELECT * from tblalarm where Datetime >'" + newDate + "' and AlarmCode = '11' and DeviceId='" + DeviceId + "' order by Id desc", function(err, PetGpsDetailrows, fields) {
    //         if (!err && PetGpsDetailrows.length > 0) {
    //             var oldDate = convertdateformat(PetGpsDetailrows[0].Datetime);
    //             connection.query("SELECT * from tblpetgps where Datetime >'" + oldDate + "' and Datetime <'" + PreDate + "' and DeviceId='" + DeviceId + "' and GPSPositioning = 'A' ORDER BY Id DESC", function(err, PetGpsrows, fields) {
    //                 if (PetGpsrows.length == 0) {
    //                     // flgIsMaxSpeedNotification = true;
    //                     // SendMaxSpeedAlarm();
    //                     connection.query("SELECT * from tblalarm where Datetime >'" + OneMinPreDate + "' and AlarmCode = '11' and DeviceId='" + DeviceId + "' order by Id desc", function(err, PetGpsOneMinDetailrows, fields) {
    //                         if (PetGpsOneMinDetailrows.length == 0) {
    //                             SendMaxSpeedAlarm();
    //                         } else {
    //                             res.json(strResponce);
    //                         }
    //                     });
    //                 } else {
    //                     res.json(strResponce);
    //                 }
    //             });
    //         } else {
    //             // flgIsMaxSpeedNotification = true;
    //             SendMaxSpeedAlarm();
    //         }
    //     });

    //     function SendMaxSpeedAlarm() {
    //         console.log("Call Max Speed Notification");
    //         connection.query("SELECT user.MaxSpeed as UserMaxSpeed, bike.* from tbluserinformation as user inner join tblbike as bike where user.id = bike.iduser and deviceid=" + DeviceId, function(err, Userrows, fields) {
    //             if (!err && Userrows.length > 0) {
    //                 var objUser = Userrows[0];
    //                 var maxSpeed = 0;
    //                 if (objUser.MaxSpeed != null && objUser.MaxSpeed != undefined) {
    //                     maxSpeed = parseFloat(objUser.MaxSpeed);
    //                 } else {
    //                     maxSpeed = parseFloat(objUser.UserMaxSpeed);
    //                 }

    //                 var deviceSpeed = parseFloat(Speed);
    //                 //if (deviceSpeed > maxSpeed) {
    //                 //Speed = maxSpeed;
    //                 // }

    //                 var query = "INSERT INTO tblalarm (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + maxSpeed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + DeviceId + "','" + alarmcode + "');";
    //                 connection.query(query, function(err, rows, fields) {

    //                     var GPSquery = "INSERT INTO tblpetgps (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + DeviceId + "'," + IsAdvanture + ");";
    //                     connection.query(GPSquery, function(err, rows, fields) {

    //                         var objConnection = {
    //                             Position: Position,
    //                             Speed: Speed,
    //                             Deviceid: DeviceId,
    //                             Latitude: Latitude,
    //                             Longitude: Longitude,
    //                             Direction: Direction,
    //                         }
    //                         io.sockets.emit('BikeRoute', JSON.stringify(objConnection));

    //                         // connection.query("Update tblbike set IsWireCut=true where deviceid=" + DeviceId, function (err1, rows, fields) {

    //                         //     if (!err) {
    //                         connection.query("SELECT * from tblbike where deviceid=" + DeviceId + " and IsDelete=false", function(err, Petrows, fields) {
    //                             if (!err && Petrows.length > 0) {
    //                                 var objPet = Petrows[0];

    //                                 // if (flgIsMaxSpeedNotification == true) {
    //                                 console.log(objPet.IsDelete.toString('hex'));
    //                                 if (objPet.IsDelete.toString('hex') == '00') {
    //                                     var PushNotificationdata = {
    //                                         title: 'Alert',
    //                                         message: 'Vehicle ' + objPet.Name + 'Max Speed alert! Please check!',
    //                                         Fence: 'Default',
    //                                         otherfields: {
    //                                             deviceid: DeviceId,
    //                                             PetId: objPet.id,
    //                                             PetName: objPet.Name
    //                                         }
    //                                     };
    //                                     SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerMaxSpeedPushNotification');
    //                                 }
    //                                 // }

    //                                 var objConnection = {
    //                                     AlarmCode: alarmcode.toString(),
    //                                     DeviceId: DeviceId,
    //                                     Datetime: GPSDateTime,
    //                                     IdUser: objPet.iduser,
    //                                     Name: objPet.Name
    //                                 }
    //                                 if (new Date(GPSDateTime) <= new Date()) {
    //                                     io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
    //                                 }
    //                             }
    //                         });
    //                         //     }
    //                         // });

    //                         //tblapisresponse Entry
    //                         var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BO01', '" + strResponce + "', '" + CurrentDate + "');";
    //                         connection.query(ResponceQuery, function(err, rows2, fields) {

    //                         });

    //                     });
    //                 });
    //             }
    //         })
    //     }
    // } else if (alarmcode.toString() == "30") {


    //     var prevDatetime = new Date(GPSDateTime);
    //     var OneMinPrevDatetime = new Date(GPSDateTime);
    //     var PreDate = convertdateformat(prevDatetime);
    //     var OneMinPreDate = convertdateformat(OneMinPrevDatetime.setMinutes(OneMinPrevDatetime.getMinutes() - 1));
    //     var newDate = convertdateformat(prevDatetime.setMinutes(prevDatetime.getMinutes() - 30));
    //     connection.query("SELECT * from tblalarm where Datetime >'" + newDate + "' and AlarmCode = '30' and DeviceId='" + DeviceId + "' order by Id desc", function(err, PetGpsDetailrows, fields) {
    //         if (!err && PetGpsDetailrows.length > 0) {
    //             var oldDate = convertdateformat(PetGpsDetailrows[0].Datetime);
    //             console.log("Old Date = " + oldDate)
    //             console.log("Previous Date = " + PreDate)
    //             console.log("Previous Date = " + newDate)
    //             connection.query("SELECT * from tblpetgps where Datetime >'" + oldDate + "' and Datetime <'" + PreDate + "' and DeviceId='" + DeviceId + "' and GPSPositioning = 'A' ORDER BY Id DESC", function(err, PetGpsrows, fields) {
    //                 if (PetGpsrows.length == 0) {
    //                     // flgIsNotification = true;
    //                     // SendVibrationNotification();
    //                     connection.query("SELECT * from tblalarm where Datetime >'" + OneMinPreDate + "' and AlarmCode = '30' and DeviceId='" + DeviceId + "' order by Id desc", function(err, PetGpsOneMinDetailrows, fields) {
    //                         if (PetGpsOneMinDetailrows.length == 0) {
    //                             SendVibrationNotification();
    //                         } else {
    //                             res.json(strResponce);
    //                         }
    //                     });
    //                 } else {
    //                     res.json(strResponce);
    //                 }
    //             });
    //         } else {
    //             // flgIsNotification = true;
    //             SendVibrationNotification();
    //         }
    //     });

    //     function SendVibrationNotification() {
    //         console.log("Call Vibration Notification");
    //         var query = "INSERT INTO tblalarm (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + DeviceId + "','" + alarmcode + "');";
    //         connection.query(query, function(err, rows, fields) {

    //             var GPSquery = "INSERT INTO tblpetgps (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + DeviceId + "'," + IsAdvanture + ");";
    //             connection.query(GPSquery, function(err, rows, fields) {

    //                 var objConnection = {
    //                     Position: Position,
    //                     Speed: Speed,
    //                     Deviceid: DeviceId,
    //                     Latitude: Latitude,
    //                     Longitude: Longitude,
    //                     Direction: Direction,
    //                 }
    //                 io.sockets.emit('BikeRoute', JSON.stringify(objConnection));

    //                 // connection.query("Update tblbike set IsWireCut=true where deviceid=" + DeviceId, function (err1, rows, fields) {

    //                 // if (!err) {
    //                 connection.query("SELECT * from tblbike where deviceid=" + DeviceId + " and IsDelete=false", function(err, Petrows, fields) {
    //                     if (!err && Petrows.length > 0) {

    //                         var objPet = Petrows[0];
    //                         // if (flgIsNotification == true) {
    //                         console.log(objPet.IsDelete.toString('hex'));
    //                         if (objPet.IsDelete.toString('hex') == '00') {
    //                             var PushNotificationdata = {
    //                                 title: 'Alert',
    //                                 message: 'Vehicle ' + objPet.Name + ' Vibrating alert! Please check!',
    //                                 Fence: 'Default',
    //                                 otherfields: {
    //                                     deviceid: DeviceId,
    //                                     PetId: objPet.id,
    //                                     PetName: objPet.Name
    //                                 }
    //                             };
    //                             SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerVibrationPushNotification');
    //                         }
    //                         // }

    //                         var objConnection = {
    //                             AlarmCode: alarmcode.toString(),
    //                             DeviceId: DeviceId,
    //                             Datetime: GPSDateTime,
    //                             IdUser: objPet.iduser,
    //                             Name: objPet.Name
    //                         }
    //                         if (new Date(GPSDateTime) <= new Date()) {
    //                             io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
    //                         }
    //                     }
    //                 });
    //                 // }
    //                 // });

    //                 //tblapisresponse Entry
    //                 var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BO01', '" + strResponce + "', '" + CurrentDate + "');";
    //                 connection.query(ResponceQuery, function(err, rows2, fields) {

    //                 });

    //             });
    //         });
    //     }
    // } else if (alarmcode.toString() == "02") {
    //     var prevDatetime = new Date(GPSDateTime);
    //     var OneMinPrevDatetime = new Date(GPSDateTime);
    //     var OneMinPreDate = convertdateformat(OneMinPrevDatetime.setMinutes(OneMinPrevDatetime.getMinutes() - 1));

    //     connection.query("SELECT * from tblalarm where Datetime >'" + OneMinPreDate + "' and AlarmCode = '02' and DeviceId='" + DeviceId + "' order by Id desc", function(err, PetGpsOneMinDetailrows, fields) {
    //         if (PetGpsOneMinDetailrows.length == 0) {
    //             SendWirecutNotification();
    //         } else {
    //             res.json(strResponce);
    //         }
    //     });

    //     function SendWirecutNotification() {
    //         var query = "INSERT INTO tblalarm (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + DeviceId + "','" + alarmcode + "');";
    //         connection.query(query, function(err, rows, fields) {

    //             var GPSquery = "INSERT INTO tblpetgps (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + DeviceId + "'," + IsAdvanture + ");";
    //             connection.query(GPSquery, function(err, rows, fields) {

    //                 var objConnection = {
    //                     Position: Position,
    //                     Speed: Speed,
    //                     Deviceid: DeviceId,
    //                     Latitude: Latitude,
    //                     Longitude: Longitude,
    //                     Direction: Direction,
    //                 }
    //                 io.sockets.emit('BikeRoute', JSON.stringify(objConnection));

    //                 // connection.query("Update tblbike set IsWireCut=true where deviceid=" + DeviceId, function (err1, rows, fields) {

    //                 // if (!err) {
    //                 connection.query("SELECT * from tblbike where deviceid=" + DeviceId + " and IsDelete=false", function(err, Petrows, fields) {
    //                     if (!err && Petrows.length > 0) {
    //                         var objPet = Petrows[0];
    //                         console.log(objPet.IsDelete.toString('hex'));
    //                         if (objPet.IsDelete.toString('hex') == '00') {
    //                             var PushNotificationdata = {
    //                                 title: 'Alert',
    //                                 message: 'Vehicle ' + objPet.Name + ' Wire Cut alert! Please check!',
    //                                 // Fence: 'Default',
    //                                 Fence: 'FenceIn',
    //                                 otherfields: {
    //                                     deviceid: DeviceId,
    //                                     PetId: objPet.id,
    //                                     PetName: objPet.Name
    //                                 }
    //                             };
    //                             SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerWireCutPushNotification');
    //                         }
    //                         var objConnection = {
    //                             AlarmCode: alarmcode.toString(),
    //                             DeviceId: DeviceId,
    //                             Datetime: GPSDateTime,
    //                             IdUser: objPet.iduser,
    //                             Name: objPet.Name
    //                         }
    //                         if (new Date(GPSDateTime) <= new Date()) {
    //                             io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
    //                         }
    //                     }
    //                 });
    //                 // }
    //                 // });

    //                 //tblapisresponse Entry
    //                 var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BO01', '" + strResponce + "', '" + CurrentDate + "');";
    //                 connection.query(ResponceQuery, function(err, rows2, fields) {

    //                 });

    //             });
    //         });
    //     }
    // } else if (alarmcode.toString() == "01") {
    //     var prevDatetime = new Date(GPSDateTime);
    //     var OneMinPrevDatetime = new Date(GPSDateTime);
    //     var OneMinPreDate = convertdateformat(OneMinPrevDatetime.setMinutes(OneMinPrevDatetime.getMinutes() - 1));

    //     connection.query("SELECT * from tblalarm where Datetime >'" + OneMinPreDate + "' and AlarmCode = '01' and DeviceId='" + DeviceId + "' order by Id desc", function(err, PetGpsOneMinDetailrows, fields) {
    //         if (PetGpsOneMinDetailrows.length == 0) {
    //             SendSOSNotification();
    //         } else {
    //             res.json(strResponce);
    //         }
    //     });

    //     function SendSOSNotification() {
    //         var query = "INSERT INTO tblalarm (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + DeviceId + "','" + alarmcode + "');";
    //         connection.query(query, function(err, rows, fields) {

    //             var GPSquery = "INSERT INTO tblpetgps (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + DeviceId + "'," + IsAdvanture + ");";
    //             connection.query(GPSquery, function(err, rows, fields) {

    //                 var objConnection = {
    //                     Position: Position,
    //                     Speed: Speed,
    //                     Deviceid: DeviceId,
    //                     Latitude: Latitude,
    //                     Longitude: Longitude,
    //                     Direction: Direction,
    //                 }
    //                 io.sockets.emit('BikeRoute', JSON.stringify(objConnection));

    //                 // connection.query("Update tblbike set IsWireCut=true where deviceid=" + DeviceId, function (err1, rows, fields) {

    //                 // if (!err) {
    //                 connection.query("SELECT * from tblbike where deviceid=" + DeviceId + " and IsDelete=false", function(err, Petrows, fields) {
    //                     if (!err && Petrows.length > 0) {
    //                         var objPet = Petrows[0];
    //                         console.log(objPet.IsDelete.toString('hex'));
    //                         if (objPet.IsDelete.toString('hex') == '00') {
    //                             var PushNotificationdata = {
    //                                 title: 'Alert',
    //                                 message: 'Vehicle ' + objPet.Name + ' SOS alert! Please check!',
    //                                 // Fence: 'Default',
    //                                 Fence: 'FenceIn',
    //                                 otherfields: {
    //                                     deviceid: DeviceId,
    //                                     PetId: objPet.id,
    //                                     PetName: objPet.Name
    //                                 }
    //                             };
    //                             SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerSOSPushNotification');
    //                         }
    //                         var objConnection = {
    //                             AlarmCode: alarmcode.toString(),
    //                             DeviceId: DeviceId,
    //                             Datetime: GPSDateTime,
    //                             IdUser: objPet.iduser,
    //                             Name: objPet.Name
    //                         }
    //                         if (new Date(GPSDateTime) <= new Date()) {
    //                             io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
    //                         }
    //                     }
    //                 });
    //                 // }
    //                 // });

    //                 //tblapisresponse Entry
    //                 var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BO01', '" + strResponce + "', '" + CurrentDate + "');";
    //                 connection.query(ResponceQuery, function(err, rows2, fields) {

    //                 });

    //             });
    //         });
    //     }
    // } else {

    // }
};

//Command9901 - CAN-BUS Command
global.Command9901 = function(line, Callback) {
    console.log("CAN-BUS Data = " + line);
    //Server Reconnet If Disconneted
    if (connection.state == 'disconnected') {
        global.connection = mysql.createConnection({
            host: MysqlHost,
            user: Mysqluser,
            password: Mysqlpassword,
            database: Mysqldatabase
        });
    }

    var DeviceId = line.substring(8, 22);

    var CANBUSData = hex2a(line.substring(26, (line.length - 8)));

    var lstCANBUSAllData = CANBUSData.split(',');


    var BatteryVoltage = lstCANBUSAllData[0];
    var EngineSpeed = lstCANBUSAllData[1];
    var RunningSpeed = lstCANBUSAllData[2];
    var ThrottleOpeningWidth = lstCANBUSAllData[3];
    var EngineLoad = lstCANBUSAllData[4];
    var CoolantTemperature = lstCANBUSAllData[5];
    var InstantaneousFuelConsumption = lstCANBUSAllData[6];
    var AverageFuelConsumption = lstCANBUSAllData[7];
    var DrivingRange = lstCANBUSAllData[8];
    var TotalMileage = lstCANBUSAllData[9];
    var SingleFuelConsumptionVolume = lstCANBUSAllData[10];
    var TotalFuelConsumptionVolume = lstCANBUSAllData[11];
    var CurrentErrorCodeNumbers = lstCANBUSAllData[12];
    var HarshAccelerationNo = lstCANBUSAllData[13];
    var HarshBrakeNo = lstCANBUSAllData[14];


    var CurrentDate = GetCurrentDate();
    var unixDateStemp = Math.floor((new Date()).getTime() / 1000);

    var query = "INSERT INTO tblcanbusdata (DeviceId,Datetime,BatteryVoltage,EngineSpeed,RunningSpeed,ThrottleOpeningWidth,EngineLoad,CoolantTemperature,InstantaneousFuelConsumption,AverageFuelConsumption,DrivingRange,TotalMileage,SingleFuelConsumptionVolume,TotalFuelConsumptionVolume,CurrentErrorCodeNumbers,HarshAccelerationNo,HarshBrakeNo,CreatedDate) " +
        "VALUES ('" + DeviceId + "', '" + unixDateStemp + "', '" + BatteryVoltage + "', '" + EngineSpeed + "', '" + RunningSpeed + "', '" + ThrottleOpeningWidth + "', '" + EngineLoad + "', '" + CoolantTemperature + "'," + InstantaneousFuelConsumption + "," + AverageFuelConsumption + "," + DrivingRange + "," + TotalMileage + "," + SingleFuelConsumptionVolume + "," + TotalFuelConsumptionVolume + "," + CurrentErrorCodeNumbers + "," + HarshAccelerationNo + "," + HarshBrakeNo + ",'" + CurrentDate + "');";
    connection.query(query, function(err, rows, fields) {

        var objConnection = {
            DeviceId: DeviceId,
            BatteryVoltage: BatteryVoltage,
            EngineSpeed: EngineSpeed,
            RunningSpeed: RunningSpeed,
            ThrottleOpeningWidth: ThrottleOpeningWidth,
            EngineLoad: EngineLoad,
            CoolantTemperature: CoolantTemperature,
            InstantaneousFuelConsumption: InstantaneousFuelConsumption,
            AverageFuelConsumption: AverageFuelConsumption,
            DrivingRange: DrivingRange,
            TotalMileage: TotalMileage,
            SingleFuelConsumptionVolume: SingleFuelConsumptionVolume,
            TotalFuelConsumptionVolume: TotalFuelConsumptionVolume,
            CurrentErrorCodeNumbers: CurrentErrorCodeNumbers,
            HarshAccelerationNo: HarshAccelerationNo,
            HarshBrakeNo: HarshBrakeNo,
            Datetime: unixDateStemp
        }

        io.sockets.emit(DeviceId + 'canbusdata', JSON.stringify(objConnection));
        // io.sockets.emit('canbusdata', JSON.stringify(objConnection));

    });

};

//Command9902 -  Driving Behavior Command
global.Command9902 = function(line, Callback) {
    console.log("Driving Data = " + line);
    //Server Reconnet If Disconneted
    if (connection.state == 'disconnected') {
        global.connection = mysql.createConnection({
            host: MysqlHost,
            user: Mysqluser,
            password: Mysqlpassword,
            database: Mysqldatabase
        });
    }

    var DeviceId = line.substring(8, 22);

    var DrivingData = hex2a(line.substring(26, (line.length - 8)));

    var lstDrivingAllData = DrivingData.split(',');


    var TotalIgnition = lstDrivingAllData[0];
    var TotalDrivingTime = lstDrivingAllData[1];
    var TotalIdlingTime = lstDrivingAllData[2];
    var AverageHotStartTime = lstDrivingAllData[3];
    var AverageSpeed = lstDrivingAllData[4];
    var HistoryHighestSpeed = lstDrivingAllData[5];
    var HistoryHighestRotation = lstDrivingAllData[6];
    var TotalHarshAcceleration = lstDrivingAllData[7];
    var TotalHarshBrake = lstDrivingAllData[8];



    var CurrentDate = GetCurrentDate();
    var unixDateStemp = Math.floor((new Date()).getTime() / 1000);

    var query = "INSERT INTO tbldrivingdata (DeviceId,Datetime,TotalIgnition,TotalDrivingTime,TotalIdlingTime,AverageHotStartTime,AverageSpeed,HistoryHighestSpeed,HistoryHighestRotation,TotalHarshAcceleration,TotalHarshBrake,CreatedDate) " +
        "VALUES ('" + DeviceId + "', '" + unixDateStemp + "', '" + TotalIgnition + "', '" + TotalDrivingTime + "', '" + TotalIdlingTime + "', '" + AverageHotStartTime + "', '" + AverageSpeed + "', '" + HistoryHighestSpeed + "'," + HistoryHighestRotation + "," + TotalHarshAcceleration + "," + TotalHarshBrake + ",'" + CurrentDate + "');";
    connection.query(query, function(err, rows, fields) {

        var objConnection = {
            DeviceId: DeviceId,
            TotalIgnition: TotalIgnition,
            TotalDrivingTime: TotalDrivingTime,
            TotalIdlingTime: TotalIdlingTime,
            AverageHotStartTime: AverageHotStartTime,
            AverageSpeed: AverageSpeed,
            HistoryHighestSpeed: HistoryHighestSpeed,
            HistoryHighestRotation: HistoryHighestRotation,
            TotalHarshAcceleration: TotalHarshAcceleration,
            TotalHarshBrake: TotalHarshBrake,
            Datetime: unixDateStemp
        }

        io.sockets.emit(DeviceId + 'drivingdata', JSON.stringify(objConnection));

    });

};

//Send Speed Data
router.get('/SendSpeedData', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    var Speed = ('00' + decimalToHexString(parseInt(req.query.Speed) / 10)).slice(-2);

    var Data = "40400012" + DeviceId + "4105" + Speed;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4105') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    connection.query("Update tblvehicle set MaxSpeed=" + req.query.Speed + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        res.json({ success: true, message: 'Speed Settings Save Successfully.' });
                    });
                } else {
                    res.json({ success: false, message: 'Speed Settings could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Speed Settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Get Current Location
router.get('/GetCurrentLocation', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    // var Speed = ('00' + decimalToHexString(parseInt(req.query.Speed) / 10)).slice(-2);

    var Data = "40400011" + DeviceId + "4101";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9955') {
                console.log('Received: ' + line);

                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response

                res.json({ success: true, message: 'Current Location Received Successfully.' });


            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Current Location could not Received. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Set GPRS Interval Settings
router.get('/SetGPRSInterval', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    var TimeInterval = ('0000' + decimalToHexString(parseInt(req.query.TimeInterval) / 10)).slice(-4);

    var Data = "40400013" + DeviceId + "4102" + TimeInterval;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4102') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    connection.query("Update tblvehicle set GPRSInterval=" + req.query.TimeInterval + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        res.json({ success: true, message: 'GPRS Interval Settings Save Successfully.' });
                    });
                } else {
                    res.json({ success: false, message: 'GPRS Interval Settings could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'GPRS Interval Settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Factory Restet
router.get('/FectoryReset', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    // var Speed = ('00' + decimalToHexString(parseInt(req.query.Speed) / 10)).slice(-2);

    var Data = "40400011" + DeviceId + "4110";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4110') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response

                if (StatusCode == '01') {
                    res.json({ success: true, message: 'Factory Reset Successfully.' });
                } else {
                    res.json({ success: false, message: 'Could Not factory Reset. Try again later.' });
                }


            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Could Not factory Reset. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Reboot Device
router.get('/RebootDevice', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    // var Speed = ('00' + decimalToHexString(parseInt(req.query.Speed) / 10)).slice(-2);

    var Data = "40400011" + DeviceId + "4902";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4902') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response

                if (StatusCode == '01') {
                    res.json({ success: true, message: 'Device Reboot Successfully.' });
                } else {
                    res.json({ success: false, message: 'Could Not Reboot Device. Try again later.' });
                }


            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Could Not Reboot Device. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Set Sleep Mode Settings
router.get('/SetSleepMode', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    var SleepMode = ('00' + decimalToHexString(parseInt(req.query.SleepMode))).slice(-2);

    var Data = "40400012" + DeviceId + "4113" + SleepMode;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';

    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4113') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    connection.query("Update tblvehicle set SleepMode=" + req.query.SleepMode + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        res.json({ success: true, message: 'Sleep Mode Save Successfully.' });
                    });
                } else {
                    res.json({ success: false, message: 'Sleep Mode could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Sleep Mode could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Set Output Control Settings
router.get('/SetOutputControl', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    var ARelay = req.query.Relay;
    var BSiren = req.query.Siren;
    var CUserDefined = req.query.UserDefined;
    var DDoorLock = req.query.DoorLock;
    var EDoorUnLock = req.query.DoorUnLock;

    var ABCDE = ('00' + decimalToHexString(parseInt(ARelay))).slice(-2) + ('00' + decimalToHexString(parseInt(BSiren))).slice(-2) + ('00' + decimalToHexString(parseInt(CUserDefined))).slice(-2) + ('00' + decimalToHexString(parseInt(DDoorLock))).slice(-2) + ('00' + decimalToHexString(parseInt(EDoorUnLock))).slice(-2);

    var Data = "40400016" + DeviceId + "4114" + ABCDE;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';

    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4114') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    // connection.query("Update tblvehicle set SleepMode=" + req.query.SleepMode + " where deviceid=" + DeviceId, function(err, rows, fields) {
                    res.json({ success: true, message: 'OutPut Control Save Successfully.' });
                    // });
                } else {
                    res.json({ success: false, message: 'OutPut Control could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'OutPut Control could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Set Arm Settings
router.get('/SetArmSettings', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    var Arm = ('00' + decimalToHexString(parseInt(req.query.Arm))).slice(-2);

    var Data = "40400012" + DeviceId + "4116" + Arm;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';

    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4116') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    connection.query("Update tblvehicle set Arm=" + req.query.Arm + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        res.json({ success: true, message: 'Arm Settings Save Successfully.' });
                    });
                } else {
                    res.json({ success: false, message: 'Arm Settings could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Arm Settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Set GPRS Interval Settings When Car in Stop
router.get('/SetGPRSIntervalStopCar', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    var TimeInterval = ('0000' + decimalToHexString(parseInt(req.query.TimeInterval) / 10)).slice(-4);

    var Data = "40400013" + DeviceId + "4126" + TimeInterval;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4126') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    connection.query("Update tblvehicle set GPRSStopInterval=" + req.query.TimeInterval + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        res.json({ success: true, message: 'GPRS Interval Settings for Stop Car Save Successfully.' });
                    });
                } else {
                    res.json({ success: false, message: 'GPRS Interval Settings for Stop Car could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'GPRS Interval Settings for Stop Car could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Set TimeZone Settings
router.get('/SetTimeZone', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    var TimeInterval = a2hex(req.query.TimeZone);
    var Data = "";
    if (parseInt(req.query.TimeZone) < 0) {
        Data = "40400015" + DeviceId + "4132" + TimeInterval;
    } else {
        Data = "40400014" + DeviceId + "4132" + TimeInterval;
    }



    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4132') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    connection.query("Update tblvehicle set TimeZone=" + req.query.TimeZone + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        res.json({ success: true, message: 'TimeZone Save Successfully.' });
                    });
                } else {
                    res.json({ success: false, message: 'TimeZone could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'TimeZone could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Set Initial ODOmeter Settings
router.get('/SetOdometerSetting', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    var odometer = a2hex(('0000' + req.query.odometer).slice(-4));

    var Data = "40400015" + DeviceId + "4145" + odometer;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';

    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4145') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    res.json({ success: true, message: 'Odometer settings Save Successfully.' });
                } else {
                    connection.query("Update tblvehicle set OdoMeter=" + req.query.odometer + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        res.json({ success: false, message: 'Odometer settings could not save. Try again later.' });
                    });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Odometer settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Set HeartBeat Interval Settings
router.get('/SetHeartBeatInterval', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503  
    //404018580420800457925119326b320d0a
    var packetLength = 17;
    var DeviceId = req.query.DeviceId;
    var TimeInterval = a2hex(req.query.TimeInterval);
    packetLength = packetLength + (TimeInterval.length / 2);

    var Data = "4040" + ('0000' + packetLength.toString(16)).slice(-4) + DeviceId + "5119" + TimeInterval;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '5119') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    connection.query("Update tblvehicle set HeartbeatInterval=" + req.query.TimeInterval + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        res.json({ success: true, message: 'HeartBeat Interval Settings Save Successfully.' });
                    });
                } else {
                    res.json({ success: false, message: 'HeartBeat Interval Settings could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'HeartBeat Interval Settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Clear data Logger
router.get('/ClearDataLogger', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503  
    //404018580420800457925119326b320d0a
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "5503";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '5503') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    res.json({ success: true, message: 'Data Logger Clear Successfully.' });
                } else {
                    res.json({ success: false, message: 'Data Logger could not Clear. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Data Logger could not Clear. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Clear data Logger
router.get('/GetFirmWareVersion', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503  
    //404018580420800457925119326b320d0a
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "9001";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9001') {
                console.log('Received: ' + line);
                var VersionInformation = line.substring(26, line.length - 8);
                var Versiondata = hex2a(VersionInformation);
                var lstVersiondata = Versiondata.split(',');
                var objFirmware = {
                    DeviceId: lstVersiondata[0],
                    IMEI: lstVersiondata[1],
                    Version: lstVersiondata[2],
                }
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                // if (StatusCode == '01') {
                res.json({ success: true, message: 'Firmware Version get Successfully.', data: objFirmware });
                // } else {
                //     res.json({ success: false, message: 'Data Logger could not Clear. Try again later.' });
                // }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'could not get Firmware Version. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Read GPRS Time Interval
router.get('/ReadGPRSTimeInterval', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503  
    //404018580420800457925119326b320d0a
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "9002";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9002') {
                console.log('Received: ' + line);
                var GPRSTimeIntervaldata = line.substring(26, 30);
                var GPRSTimeInterval = parseInt(GPRSTimeIntervaldata, 16) * 10;

                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                // if (StatusCode == '01') {
                res.json({ success: true, message: 'GPRS Time Interval Retrive Successfully.', data: GPRSTimeInterval });
                // } else {
                //     res.json({ success: false, message: 'Data Logger could not Clear. Try again later.' });
                // }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'could not get GPRS Time Interval. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Read Trouble Code
router.get('/ReadTroubleCode', function(req, res) {
    req.setTimeout(3600000);

    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "9903";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {

        client.write(Data, 'hex');
        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });

            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9903') {
                console.log('Received: ' + line);
                var TroubleCodehex = line.substring(26, line.length - 8);
                var TroubleCode = hex2a(TroubleCodehex);

                Sendflag = true;

                client.destroy();

                res.json({ success: true, message: 'Trouble Code Retrive Successfully.', data: TroubleCode });

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'could not get Trouble Code. Try again later.' });

            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Clear Trouble Code
router.get('/ClearTroubleCode', function(req, res) {
    req.setTimeout(3600000);

    var DeviceId = req.query.DeviceId;

    var Data = "40400011" + DeviceId + "9904";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {

        client.write(Data, 'hex');

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9904') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;

                client.destroy();
                if (StatusCode == '01') {
                    res.json({ success: true, message: 'Trouble Code clear successfully.' });
                } else {
                    res.json({ success: false, message: 'Can Not Clear Trouble Code. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Can Not Clear Trouble Co. Try again later.' });
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Read VIN Code
router.get('/ReadVINCode', function(req, res) {
    req.setTimeout(3600000);

    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "9905";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {

        client.write(Data, 'hex');
        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });

            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9905') {
                console.log('Received: ' + line);
                var VINCodehex = line.substring(26, line.length - 8);
                var VINCode = hex2a(VINCodehex);

                Sendflag = true;

                client.destroy();

                res.json({ success: true, message: 'VIN Code Retrive Successfully.', data: VINCode });

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'could not get VIN Code. Try again later.' });

            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Read RFID Tags
router.get('/ReadRFIDTags', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503  
    //404018580420800457925119326b320d0a
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "4170";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4170') {
                console.log('Received: ' + line);
                var RFIDTagshex = line.substring(26, line.length - 8);
                var RFIDTags = hex2a(RFIDTagshex);

                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                // if (StatusCode == '01') {
                res.json({ success: true, message: 'RFID Tags Retrive Successfully.', data: RFIDTags });
                // } else {
                //     res.json({ success: false, message: 'Data Logger could not Clear. Try again later.' });
                // }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'could not get RFID Tags. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

//Minitor Voice
router.get('/MonitorVoice', function(req, res) {
    req.setTimeout(3600000);

    var packetLength = 17;
    var DeviceId = req.query.DeviceId;
    var Phone = req.query.Phone;
    var PhoneHex = a2hex(Phone);
    packetLength = packetLength + (PhoneHex.length / 2);

    var Data = "4040" + ('0000' + packetLength.toString(16)).slice(-4) + DeviceId + "4130" + PhoneHex;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4130') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;

                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    res.json({ success: true, message: 'Monitor Voice Successfully. You will receive Call soon.' });
                } else {
                    res.json({ success: false, message: 'Monitor Voice could not retrive. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Monitor Voice could not retrive. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

function convertdateformat(date1) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

}

router.get('/UpdateDeviceStatus', function(req, res) {
    var DeviceId = req.query.DeviceId;
    // deviceID = '075034903863';
    var Status = req.query.Status;
    // var Status = true;

    connection.query("SELECT * from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, Vehiclerows, fields) {
        //tblPetgps Entry
        if (!err && Vehiclerows.length > 0) {
            var objVehicle = Vehiclerows[0];

            var flgOnline = false;
            if (objVehicle.IsOnline == 1) {
                flgOnline = true;
            }
            if (Status.toString() != flgOnline.toString()) {
                var query = "Update tblvehicle set IsOnline=" + Status + " where deviceid='" + DeviceId + "';";
                connection.query(query, function(err, rows, fields) {
                    //tblapisresponse Entry
                    // if (objVehicle.IsDelete == false) {
                    //     if (!Status) {
                    //         var PushNotificationdata = {
                    //             title: 'Alert',
                    //             message: 'Vehicle ' + objVehicle.Name + ' Device offline alert! Please check!',
                    //             Fence: 'Default',
                    //             otherfields: {
                    //                 deviceid: DeviceId,
                    //                 PetId: objVehicle.id,
                    //                 PetName: objVehicle.Name
                    //             }
                    //         };
                    //     } else {
                    //         var PushNotificationdata = {
                    //             title: 'Alert',
                    //             message: 'Vehicle ' + objVehicle.Name + ' Device online alert! Please check!',
                    //             Fence: 'Default',
                    //             otherfields: {
                    //                 deviceid: DeviceId,
                    //                 PetId: objVehicle.id,
                    //                 PetName: objVehicle.Name
                    //             }
                    //         };
                    //     }

                    //     SendPushNotification(PushNotificationdata, objVehicle.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
                    // }
                    res.json("No Response");
                    strResponce = "No Response";

                    var ConnectionStatus = false;
                    if (Status == 'true' || Status == true) {
                        ConnectionStatus = true;
                    }
                    var objConnection = {
                        DeviceId: DeviceId,
                        // PetId: objVehicle.id,
                        Status: ConnectionStatus
                    }
                    io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
                    io.sockets.emit(DeviceId + 'BikeDeviceStatus', JSON.stringify(objConnection));
                });
            } else {
                res.json("No Response");
                strResponce = "No Response";
            }
        } else {
            res.json("No Response");
            strResponce = "No Response";
        }
    });


    // res.json("No Response");
    // var deviceID = '075034498021';
    // var Latitude = '20.834979';
    // var Longitude = '73.265247';

    // var objConnection = {
    //     Deviceid: deviceID,
    //     Latitude: Latitude,
    //     Longitude: Longitude,
    // }
    // io.sockets.emit('BikeRoute', JSON.stringify(objConnection));

})

//End of Send Email

var rule = new schedule.RecurrenceRule();
//rule.dayOfWeek = [0, new schedule.Range(4, 6)];
// rule.hour = 0;
// rule.minute = 0;
// rule.second = 30;
rule.minute = new schedule.Range(0, 59, 1);
//rule.minute = new schedule.Range(0, 59, 1);
var testStatus = false;
var IsOnlineDeviceCheck = schedule.scheduleJob(rule, function() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1; // beware: January = 0; February = 1, etc.
    // var month1 = today.getMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getDate();

    var data = year + '-' + month + '-' + day;
    console.log(new Date())

    Vehicle.findAll({
        where: {
            IsOnline: true,
            IsDelete: false
        },
    }).then(function(resVehicle) {
        // for (var i = 0; i < resVehicle.length; i++) {
        function setDeviceStatus(i) {
            if (i < resVehicle.length) {
                if (resVehicle[i].HandshakDatetime != null) {
                    var date1 = new Date();
                    var date2 = new Date(resVehicle[i].HandshakDatetime);
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    var min = Math.floor(timeDiff / 60000);
                    console.log(resVehicle[i].deviceid + "    = " + min);
                    if (min > 20) {
                        var objVehicleExist = resVehicle[i];
                        Vehicle.findOne({
                            where: {
                                id: objVehicleExist.id
                            }
                        }).then(function(objVehicleExistOnline) {
                            if (objVehicleExistOnline && objVehicleExistOnline.IsOnline) {
                                objVehicleExistOnline.updateAttributes({ IsOnline: false }).then(function(resUpdate) {

                                    if (objVehicleExistOnline.IsDelete == false) {
                                        // var PushNotificationdata = {
                                        //     title: 'Alert',
                                        //     message: 'Vehicle ' + objVehicleExistOnline.Name + ' Device offline alert! Please check!',
                                        //     Fence: 'Default',
                                        //     otherfields: {
                                        //         deviceid: objVehicleExistOnline.deviceid,
                                        //         Id: objVehicleExistOnline.id,
                                        //         Name: objVehicleExistOnline.Name
                                        //     }
                                        // };

                                        // SendPushNotification(PushNotificationdata, objVehicleExistOnline.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
                                    }
                                    var objConnection = {
                                        DeviceId: objVehicleExistOnline.deviceid,
                                        // PetId: objVehicleExistOnline.id,
                                        Status: false
                                    }
                                    io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
                                    io.sockets.emit(objVehicleExistOnline.deviceid + 'BikeDeviceStatus', JSON.stringify(objConnection));
                                    setDeviceStatus(i + 1);
                                })
                            } else {
                                setDeviceStatus(i + 1);
                            }
                        })
                    } else {
                        setDeviceStatus(i + 1);
                    }
                } else {
                    var objVehicleExist = resVehicle[i];
                    Vehicle.findOne({
                        where: {
                            id: objVehicleExist.id
                        }
                    }).then(function(objVehicleExistOnline) {
                        if (objVehicleExistOnline && objVehicleExistOnline.IsOnline) {
                            objVehicleExistOnline.updateAttributes({ IsOnline: false }).then(function(resUpdate) {
                                if (objVehicleExistOnline.IsDelete == false) {
                                    // var PushNotificationdata = {
                                    //     title: 'Alert',
                                    //     message: 'Vehicle ' + objVehicleExistOnline.Name + ' Device offline alert! Please check!',
                                    //     Fence: 'Default',
                                    //     otherfields: {
                                    //         deviceid: objVehicleExistOnline.deviceid,
                                    //         Id: objVehicleExistOnline.id,
                                    //         Name: objVehicleExistOnline.Name
                                    //     }
                                    // };
                                    // if (objVehicleExistOnline.DeviceType == 'M2') {
                                    //     SendPushNotification(PushNotificationdata, objVehicleExistOnline.iduser, 'Shop', null);
                                    // } else {
                                    //     SendPushNotification(PushNotificationdata, objVehicleExistOnline.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
                                    // }
                                }
                                var objConnection = {
                                    DeviceId: objVehicleExistOnline.deviceid,
                                    // PetId: objVehicleExistOnline.id,
                                    Status: false
                                }
                                io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
                                io.sockets.emit(objVehicleExistOnline.deviceid + 'BikeDeviceStatus', JSON.stringify(objConnection));
                                setDeviceStatus(i + 1);
                            })
                        } else {
                            setDeviceStatus(i + 1);
                        }
                    })
                }
            }
        }
        setDeviceStatus(0);
    })
});

module.exports = router