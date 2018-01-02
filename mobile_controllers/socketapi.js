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
var GPSData = models.tblgpsdata;
var GPSDevice = models.tblgpsdevice;
var ServiceEnhacement = models.tblserviceenhancement;
var ServiceEnhacementType = models.tblserviceenhancementtype;
var ServiceEnhancementNotification = models.tblserviceenhancementnotification;
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
        message: '9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence.',
        soundname: 'sound50',
        msgcnt: "2",
        otherfields: {
            deviceid: '123456',
            Id: 1,
            VehicleName: '9787',
            AlarmCode: '6',
            Type: 'Alarm',
        }
    };

    // PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {
    PushNotificationSettings.gcm.msgcnt = "10";
    PushNotificationSettings.apn.defaultData.sound = data.soundname + '.caf';

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

router.get('/SendPushTest', function(req, res) {
    var UserId = req.query.UserId;
    connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + UserId, function(err, objAppInfo, fields) {
        var PushNotificationdata = {
            title: 'Alert',
            message: '9787 is out of Home Fence.',
            Fence: 'Default',
            otherfields: {
                deviceid: 123456,
                Id: 1,
                VehicleName: '9787',
                AlarmCode: '11',
                Type: 'Alarm'
            }
        };
        SendPushNotification(PushNotificationdata, UserId, objAppInfo[0]);
        res.send("Done");
    })
})

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

global.SendPushNotification = function(data, UserId, objAppInfo) {
    // var deviceIds = [];
    connection.query("SELECT PushNotificationId,Platform,MessageCount,UserType,udid from tblpushnotification where iduser in (" + UserId + ") group by PushNotificationId, Platform", function(err, response, fields) {
        if (!err && response.length > 0) {
            // PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {
            function SendNotification(i) {
                if (i < response.length) {
                    try {
                        var messagecount = 1;
                        if (response[i].MessageCount) {
                            messagecount = parseInt(response[i].MessageCount) + 1;
                        }
                        // connection.query("SELECT * from tblsetting where Name ='" + PushNotificationType + "' ", function(err, lstSetting, fields) {
                        //     if (lstSetting[0].Value == 1) {
                        var deviceIds = [];
                        deviceIds.push(response[i].PushNotificationId)
                            //SendNotification(i + 1);
                            // } else {
                        console.log(deviceIds)
                        var objData = clone(data);

                        if (response[i].Platform == 'ios') {
                            objData.title = data.message;
                            objData.message = data.message;

                            PushNotificationSettings.apn.options.cert = __dirname + '/../MediaUploads/FileUpload/' + objAppInfo.IOSCertificate;
                            PushNotificationSettings.apn.options.key = __dirname + '/../MediaUploads/FileUpload/' + objAppInfo.IOSKey;

                            PushNotificationSettings.apn.badge = messagecount;

                            if (objData.soundname == 'Default') {
                                PushNotificationSettings.apn.defaultData.sound = 'default';
                            } else {
                                PushNotificationSettings.apn.defaultData.sound = objData.soundname + '.caf';
                            };

                        } else {

                            PushNotificationSettings.gcm.msgcnt = messagecount;
                            PushNotificationSettings.gcm.id = objAppInfo.AndroidId;

                        }
                        // console.log(response[i].Platform + "_______________________________________________________")
                        // console.log(objData)
                        objData.priority = 'high';
                        var objPushNotificationSend = new PushNotifications(PushNotificationSettings);
                        if (deviceIds.length > 0) {

                            objPushNotificationSend.send(deviceIds, objData, function(result) {
                                // console.log(result);
                                connection.query("Update tblpushnotification set messagecount=" + messagecount + " where udid='" + response[i].udid + "' and UserType='" + response[i].UserType + "'", function(errupdate, updateresp, fields) {
                                    console.log(errupdate)
                                    SendNotification(i + 1);
                                });
                            });
                        } else {
                            SendNotification(i + 1);
                        };
                        //     } else {
                        //         SendNotification(i + 1);
                        //     }
                        // });
                    } catch (ex) {
                        console.log(ex);
                        SendNotification(i + 1);
                    }


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


//Calculate CRC
// global.CalculateCRCbyHex = function(hex) {
//     var bytedata = hex2byteCRC(hex);
//     return ("0000" + decimalToHexString(crc.crc16ccitt(bytedata))).slice(-4);
// }

global.CalculateCRCbyHex = function(hex) {
    var bytedata = hex2byteCRC(hex);
    return ("0000" + decimalToHexString(crc.crc16x25(bytedata))).slice(-4);
}

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
                obj.Type = 'IOS';
                obj.CreatedDate = new Date();
                IMEINumberMapping.create(obj).then(function(resUserIMEI) {
                    objIMEI.updateAttributes({ IsUse: true }).then(function(resIMEI) {
                        GPSDevice.findOne({ where: { IMEI: objIMEI.IMEI } }).then(function(resDevice) {
                            if (resDevice == null) {
                                var objDevice = new Object();
                                objDevice.IMEI = objIMEI.IMEI;
                                objDevice.DeviceId = objIMEI.IMEI.toString().substring((objIMEI.IMEI.toString()).length - 14);
                                objDevice.CreatedDate = new Date();
                                objDevice.Type = 'Mob';
                                objDevice.CreatedBy = '';
                                objDevice.IsActive = true;
                                objDevice.AppName = req.query.AppName;
                                objDevice.ActivationDate = new Date();
                                var expireDate = new Date();
                                expireDate.setFullYear(expireDate.getFullYear() + 1);
                                expireDate.setHours(00);
                                expireDate.setMinutes(00);
                                expireDate.setSeconds(00);
                                objDevice.ExpiryDate = expireDate;
                                GPSDevice.create(objDevice).then(function(resCreate) {
                                    res.json({ IMEI: objIMEI.IMEI });
                                })
                            } else {
                                res.json({ IMEI: objIMEI.IMEI });
                            }
                        })
                    })
                })
            })
        }
    })

});

router.get('/RequestIMEINumberForAndroid', function(req, res) {
    IMEINumberMapping.findOne({ where: { UDID: req.query.UDID } }).then(function(objUserIMEI) {
        if (objUserIMEI != null) {
            res.json({ IMEI: objUserIMEI.IMEI });
        } else {
            var obj = new Object();
            obj.UDID = req.query.UDID;
            obj.IMEI = req.query.IMEI;
            obj.Type = req.query.Type;
            obj.CreatedDate = new Date();
            IMEINumberMapping.create(obj).then(function(resUserIMEI) {
                if (resUserIMEI != null) {
                    GPSDevice.findOne({ where: { IMEI: resUserIMEI.IMEI } }).then(function(resDevice) {
                        if (resDevice == null) {
                            var objDevice = new Object();
                            objDevice.IMEI = resUserIMEI.IMEI;
                            objDevice.DeviceId = resUserIMEI.IMEI.toString().substring((resUserIMEI.IMEI.toString()).length - 14);
                            objDevice.CreatedDate = new Date();
                            objDevice.Type = 'Mob';
                            objDevice.CreatedBy = '';
                            objDevice.IsActive = true;
                            objDevice.AppName = req.query.AppName;
                            objDevice.ActivationDate = new Date();
                            var expireDate = new Date();
                            expireDate.setFullYear(expireDate.getFullYear() + 1);
                            expireDate.setHours(00);
                            expireDate.setMinutes(00);
                            expireDate.setSeconds(00);
                            objDevice.ExpiryDate = expireDate;
                            GPSDevice.create(objDevice).then(function(resCreate) {
                                res.json({ IMEI: req.query.IMEI });
                            })
                        } else {
                            res.json({ IMEI: req.query.IMEI });
                        }
                    })
                }
            })
        }
    })
})

router.get('/GenerateIMEI', function(req, res) {
    req.setTimeout(3600000);
    // for (var i = 0; i < 10; i++) {
    // var NewPassword = customPassword();
    // console.log(NewPassword);
    // }
    console.log("Call IMEI")

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
var maxLength = 15;
var minLength = 15;
var uppercaseMinCount = 2;
var lowercaseMinCount = 2;
var numberMinCount = 15;
var specialMinCount = 1;
var UPPERCASE_RE = /([A-Z])/g;
var LOWERCASE_RE = /([a-z])/g;
var NUMBER_RE = /([\d])/g;
var NumberNotStartwithZero = /^((?!(0))(?!(.0))(?!(..0))[0-9]{15})$/g;
var NumberNotStartwithThreeFive = /^((?!(35))(?!(.35))(?!(..35))[0-9]{15})$/g;
var SPECIAL_CHAR_RE = /([\?\-\^\$\#\@\!\%\&\*])/g;
var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

function isStrongEnough(password) {
    // var uc = password.match(UPPERCASE_RE);
    // var lc = password.match(LOWERCASE_RE);
    var n = password.match(NUMBER_RE);
    var nc = password.match(NumberNotStartwithZero);
    var ntf = password.match(NumberNotStartwithThreeFive);
    // var sc = password.match(SPECIAL_CHAR_RE);
    var nr = password.match(NON_REPEATING_CHAR_RE);
    return password.length >= minLength &&
        n && n.length >= numberMinCount && nc && ntf;
    // &&
    // sc && sc.length >= specialMinCount;
}

function customPassword() {
    var password = "";
    var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
    //console.log(randomLength)
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
    } catch (ex) {
        console.log("Error Heartbeat Data = " + line);
    }
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
        var AD2 = lstAD[1];
        var Odometer = lstGPSAllData[5];
        var RFID = lstGPSAllData[6];
        if (AD2 == undefined) {
            AD2 = 0;
        }

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

        //check <5 min time difference then only store data otherwise neglect
        var systemtime = new Date();
        var DeviceTime = new Date(GPSDateTime + " UTC");
        // console.log(systemtime)
        // console.log(DeviceTime)
        var timediffernce = parseInt((DeviceTime - systemtime) / 1000);
        console.log("Time Diff = " + timediffernce)

        if (timediffernce <= 3600) {

            // //Insert data in gps
            var query = "INSERT INTO tblgpsdata (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,IsRelayToStopTheCar,IsSirenSound,IsUserDefined,IsLockTheDoor,IsUnlockTheDoor,IsSOS,IsWiringForAntiTamper,IsDoor,IsEngine,IsOriginalSirenTriggeringStatus,CreatedDate,HDOP,Altitude,AD1,AD2,OdoMeter,Date ) " +
                "VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "'," + IsRelayToStopTheCar + "," + IsSirenSound + "," + IsUserDefined + "," + IsLockTheDoor + "," + IsUnlockTheDoor + "," + IsSOS + "," + IsWiringForAntiTamper + "," + IsDoor + "," + IsEngine + "," + IsOriginalSirenTriggeringStatus + ",'" + CurrentDate + "','" + HDOP + "','" + altitude + "','" + AD1 + "','" + AD2 + "','" + Odometer + "','" + unixDateStemp + "');";
            connection.query(query, function(err, rows, fields) {
                // console.log(err);
                var objConnection = {
                    Position: Position,
                    Speed: Speed,
                    Deviceid: DeviceId,
                    Latitude: Latitude,
                    Longitude: Longitude,
                    Direction: Direction,
                    OdoMeter: Odometer,
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

                client.set(DeviceId, JSON.stringify(objConnection), function(err, replies) {});

                if (Position == 'A') {
                    io.sockets.emit('BikeRoute', JSON.stringify(objConnection));
                    io.sockets.emit(DeviceId + 'BikeRoute', JSON.stringify(objConnection));
                }
            });

            if (IsEngine == true) {
                //Fence
                connection.query("SELECT * from tblfence where deviceId=" + DeviceId + " and IsFenceOnline=true", function(err, rows, fields) {
                    if (!err && rows.length > 0) {
                        connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
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
                                                var soundname = "";

                                                if (IsPetInFence == false) {
                                                    AlarmCode = '66';
                                                    if (rows[j].name != null && rows[j].name != '' && rows[j].name != undefined) {
                                                        Message = objVehicle.Name + ' is out of ' + rows[j].name + ' Fence.';
                                                    } else {
                                                        Message = objVehicle.Name + ' is out of Fence.';
                                                    }
                                                    soundname = "Default";
                                                } else {
                                                    AlarmCode = '6';
                                                    if (rows[j].name != null && rows[j].name != '' && rows[j].name != undefined) {
                                                        Message = objVehicle.Name + ' is in ' + rows[j].name + ' Fence.';
                                                    } else {
                                                        Message = objVehicle.Name + ' is in Fence.';
                                                    }
                                                    soundname = "Default";
                                                }
                                                // console.log(unixDateStemp);
                                                connection.query('UPDATE tblfence set IsInFence=' + IsPetInFence + ' WHERE id=' + rows[j].id, function(err, rowsFence, fields) {
                                                    // console.log(err)
                                                    var Alarmquery = "INSERT INTO tblalarm (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,AlarmCode,CreatedDate,FenceName ) VALUES ('" + GPSDateTime + "', '" + unixDateStemp + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "','" + AlarmCode + "','" + CurrentDate + "','" + rows[j].name + "');";
                                                    // var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + AlarmCode + "');";
                                                    connection.query(Alarmquery, function(err1, Alarmrows, fields) {

                                                        connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function(err, lstShareUser, fields) {
                                                            var lstAllUser = [objVehicle.iduser];
                                                            var AllUser = objVehicle.iduser.toString();
                                                            if (!err && lstShareUser.length > 0) {
                                                                for (var i = 0; i < lstShareUser.length; i++) {
                                                                    lstAllUser.push(lstShareUser[i].idUser)
                                                                    AllUser = AllUser + ',' + lstShareUser[i].idUser;
                                                                }
                                                            }
                                                            connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function(err, objAppInfo, fields) {

                                                                var PushNotificationdata = {
                                                                    title: 'Alert',
                                                                    message: Message,
                                                                    // Fence: 'Default',
                                                                    soundname: soundname,
                                                                    otherfields: {
                                                                        deviceid: DeviceId,
                                                                        Id: objVehicle.id,
                                                                        VehicleName: objVehicle.Name,
                                                                        AlarmCode: AlarmCode,
                                                                        Type: 'Alarm'
                                                                    }
                                                                };

                                                                SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);

                                                                // var objConnection = {
                                                                //     AlarmCode: AlarmCode.toString(),
                                                                //     DeviceId: DeviceId,
                                                                //     Datetime: GPSDateTime,
                                                                //     Date: unixDateStemp,
                                                                //     IdUser: objVehicle.iduser,
                                                                //     Name: objVehicle.Name,
                                                                //     FenceName: rows[j].name
                                                                // }


                                                                // // io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                                                                // io.sockets.emit(objVehicle.iduser + 'DeviceAlarm', JSON.stringify(objConnection));

                                                                for (var i = 0; i < lstAllUser.length; i++) {
                                                                    var objConnection = {
                                                                        AlarmCode: AlarmCode.toString(),
                                                                        DeviceId: DeviceId,
                                                                        Datetime: GPSDateTime,
                                                                        Date: unixDateStemp,
                                                                        IdUser: lstAllUser[i],
                                                                        Name: objVehicle.Name,
                                                                        FenceName: rows[j].name
                                                                    }

                                                                    io.sockets.emit(lstAllUser[i] + 'DeviceAlarm', JSON.stringify(objConnection));

                                                                    var objPushnotificationCount = {
                                                                        Id: Alarmrows.insertId,
                                                                        Latitude: Latitude,
                                                                        Longitude: Longitude,
                                                                        GPSPositioning: Position,
                                                                        Speed: Speed,
                                                                        Direction: Direction,
                                                                        Status: inputoutputSTatus,
                                                                        AlarmCode: AlarmCode.toString(),
                                                                        DeviceId: DeviceId,
                                                                        CreatedDate: CurrentDate,
                                                                        Datetime: GPSDateTime,
                                                                        Date: unixDateStemp,
                                                                        FenceName: rows[j].name,
                                                                        UserId: lstAllUser[i],
                                                                        IsRead: false,
                                                                        // Name: objVehicle.Name
                                                                    }

                                                                    io.sockets.emit(lstAllUser[i] + 'DeviceNotificationCount', JSON.stringify(objPushnotificationCount));
                                                                }

                                                                checkFence(j + 1);
                                                            });
                                                        });
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

                //Favorite place
                // connection.query("SELECT * from tblfavoriteplace where DeviceId=" + DeviceId, function(err, rows, fields) {
                //     if (!err && rows.length > 0) {
                //         connection.query("SELECT * from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
                //             if (!err && Bikerows.length > 0) {
                //                 var objBike = Bikerows[0];
                //                 if (Position == 'A') {
                //                     function checkFavorite(j) {
                //                         if (j < rows.length) {
                //                             rows[j].IsInFavoritePlace = true;
                //                             var response = rows[j];

                //                             // var response = rows[0];

                //                             var CheckPoints = {
                //                                 latitude: parseFloat(Latitude),
                //                                 longitude: parseFloat(Longitude)
                //                             }

                //                             var IsInFavoritePlace = true;

                //                             // if (response.fencedraw == "circle") {
                //                             var CircleCenterPoints = {
                //                                 latitude: parseFloat(response.Latitude),
                //                                 longitude: parseFloat(response.Longitude)
                //                             }
                //                             var CircleRadius = parseFloat(response.Range);
                //                             IsInFavoritePlace = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                //                                 // }

                //                             // console.log("Fence Last State = " + objBike.IsInFence)
                //                             // console.log("Fence Current State = " + IsPetInFence)
                //                             if (IsInFavoritePlace != rows[j].IsInFavoritePlace && rows[j].IsInFavoritePlace) {
                //                                 var Code = '0';
                //                                 var message = '';

                //                                 if (IsInFavoritePlace == false) {
                //                                     AlarmCode = '1';
                //                                     if (rows[j].Name != null && rows[j].Name != '' && rows[j].Name != undefined) {
                //                                         message = objBike.Name + ' is out of ' + rows[j].Name + ' Favorite Place.';
                //                                     } else {
                //                                         message = objBike.Name + ' is out of Favorite Place.';
                //                                     }
                //                                 } else {
                //                                     AlarmCode = '0';
                //                                     if (rows[j].Name != null && rows[j].Name != '' && rows[j].Name != undefined) {
                //                                         message = objBike.Name + ' is in ' + rows[j].Name + ' Favorite Place.';
                //                                     } else {
                //                                         message = objBike.Name + ' is in Favorite Place.';
                //                                     }
                //                                 }
                //                                 console.log(unixDateStemp);
                //                                 connection.query('UPDATE tblfavoriteplace set IsInFavoritePlace=' + IsInFavoritePlace + ' WHERE id=' + rows[j].id, function(err, rowsFavorite, fields) {
                //                                     console.log(err)
                //                                     var query = "INSERT INTO tblfavoriteinout (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,Code,CreatedDate ) VALUES ('" + GPSDateTime + "', '" + unixDateStemp + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "','" + Code + "','" + CurrentDate + "');";
                //                                     // var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + AlarmCode + "');";
                //                                     connection.query(query, function(err1, Favrows, fields) {
                //                                         checkFavorite(j + 1);
                //                                     });
                //                                 });
                //                             } else {
                //                                 checkFavorite(j + 1);
                //                             }
                //                         } else {

                //                         }
                //                     }
                //                     checkFavorite(0);
                //                 }
                //             }
                //         });
                //     };
                // });
            }

            //check Arm settings
            connection.query("SELECT * from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
                if (!err) {
                    if (Bikerows.length > 0) {
                        if (Bikerows[0].Arm == 2) {
                            var checkEngine = 0;
                            var ArmStatus = 1;
                            if (IsEngine == true) {
                                checkEngine = 1;
                                ArmStatus = 0;
                            }
                            if (checkEngine == Bikerows[0].LastArmSetting) {
                                var obj = new Object();
                                obj.DeviceId = DeviceId;
                                obj.Arm = 2;
                                obj.ArmStatus = ArmStatus;
                                SetArmSettings(obj, function(data) {

                                })
                            }
                        }
                    }
                }
            });

            //update Relay settings
            if (IsRelayToStopTheCar) {
                var Relay = 1;
            } else {
                var Relay = 0;
            }
            connection.query("Update tblvehicle set Relay = " + Relay + " where deviceid=" + DeviceId + " and IsDelete=false", function(err, relayData, fields) {
                if (!err) {
                    var objRelay = {
                        DeviceId: DeviceId,
                        Relay: Relay,
                    }
                    io.sockets.emit(DeviceId + 'RelaySetting', JSON.stringify(objRelay));
                }
            });


            //Check Odometer for send Service Enhancement notification

            var CheckOdometer = Math.floor(parseFloat(Odometer) / 1000);
            ServiceEnhacement.belongsTo(Vehicle, {
                foreignKey: {
                    name: 'idvehicle',
                    allowNull: false
                }
            });

            ServiceEnhacement.findAll({
                where: { Expiredkm: { $gte: (CheckOdometer - 10) }, IsDelete: 0, IsComplete: 0 },
                include: [{
                    model: Vehicle,
                    where: { deviceid: DeviceId }
                }]
            }).then(function(response) {
                if (response) {
                    function uploader(i) {
                        if (response.length > i) {

                            var ExpiredKM = response[i].Expiredkm;
                            var kmdiff = parseFloat(ExpiredKM) - parseFloat(CheckOdometer);
                            var diffkm = 0;
                            var IskmNotification = false;

                            if (kmdiff > 45 && kmdiff < 55) {
                                diffkm = 50;
                                IskmNotification = true;
                            } else if (kmdiff > 5 && kmdiff < 15) {
                                diffkm = 10;
                                IskmNotification = true;
                            } else if (kmdiff > -5 && kmdiff < 5) {
                                diffkm = 0;
                                IskmNotification = true;
                            } else if (kmdiff > -15 && kmdiff < -5) {
                                diffkm = -10;
                                IskmNotification = true;
                            }
                            if (IskmNotification == true) {
                                var obj = new Object();
                                obj.IdServiceEnhancement = response[i].id;
                                obj.CreatedDate = new Date();
                                obj.days = diffkm;
                                obj.IsRead = false;
                                // obj.idvehicle = response[i].tblvehicle.id;
                                ServiceEnhancementNotification.findOrCreate({
                                    where: {
                                        IdServiceEnhancement: obj.IdServiceEnhancement,
                                        days: diffkm
                                    },
                                    defaults: obj
                                }).then(function(ServiceEnhacementcerated) {

                                    if (ServiceEnhacementcerated[1]) {
                                        var NewObj = new Object()
                                        NewObj.Id = ServiceEnhacementcerated[0].Id;
                                        NewObj.IdServiceEnhancement = ServiceEnhacementcerated[0].IdServiceEnhancement;
                                        NewObj.CreatedDate = ServiceEnhacementcerated[0].CreatedDate;
                                        NewObj.Message = ServiceEnhacementcerated[0].Message;
                                        NewObj.tblserviceenhancement = response[i];
                                        NewObj.days = diffkm;
                                        NewObj.IsRead = false;
                                        NewObj.idvehicle = response[i].tblvehicle.id;
                                        io.sockets.emit(response[i].tblvehicle.iduser + 'ServiceEnhacementNotification', JSON.stringify(NewObj));

                                        var Message = "";

                                        if (diffkm == 50 || diffkm == 10) {
                                            var RenewDate = moment(new Date(date2));
                                            var RenewDateFormat = RenewDate.format("DD MMMM YYYY");
                                            if (response[i].Type == 'Car Service') {
                                                Message = "Your vehicle " + response[i].tblvehicle.Name + " service due after" + kmdiff + " km. Pls get your vehicle serviced.";
                                            } else if (response[i].Type == 'Tyre Replacement') {
                                                Message = "Your vehicle " + response[i].tblvehicle.Name + " tyre need replacement after " + kmdiff + " km. Pls replace it on time.";
                                            }

                                        } else if (diffkm == 0) {
                                            if (response[i].Type == 'Car Service') {
                                                Message = "Your vehicle " + response[i].tblvehicle.Name + " service has due. Pls get your vehicle serviced.";
                                            } else if (response[i].Type == 'Tyre Replacement') {
                                                Message = "Your vehicle " + response[i].tblvehicle.Name + " tyre need replacement. Pls replace it.";
                                            }
                                        } else {

                                            if (response[i].Type == 'Car Service') {
                                                Message = "Your vehicle " + response[i].tblvehicle.Name + " need a service. Pls get your vehicle serviced.";
                                            } else if (response[i].Type == 'Tyre Replacement') {
                                                Message = "Your vehicle " + response[i].tblvehicle.Name + " tyre need replacement. Get your car tyre replaced.";
                                            }
                                        }

                                        //push Notification Send

                                        connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + response[i].tblvehicle.iduser, function(err, objAppInfo, fields) {
                                            var soundname = "Default";
                                            var AllUser = response[i].tblvehicle.iduser.toString();
                                            var PushNotificationdata = {
                                                title: 'Alert',
                                                message: Message,
                                                // Fence: 'Default',
                                                soundname: soundname,
                                                otherfields: {
                                                    deviceid: response[i].tblvehicle.deviceid,
                                                    Id: response[i].tblvehicle.id,
                                                    VehicleName: response[i].tblvehicle.Name,
                                                    NotificationType: response[i].Type,
                                                    Type: 'Notification'
                                                }
                                            };

                                            SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);

                                            uploader(i + 1);
                                        });
                                    } else {
                                        uploader(i + 1);
                                    }

                                })
                            } else {
                                uploader(i + 1)
                            }
                        }
                    }
                    uploader(0)
                } else {
                    res.json({ success: false });
                }
            })
        }

    } catch (ex) {
        console.log("Error GPS Data = " + line);
    }

};

//Command9999 - Alarm Command
global.Command9999 = function(line, Callback) {
    console.log("Alarm Data = " + line);
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
        var AD2 = lstAD[1];
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


            connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, lstVehicle, fields) {
                if (!err && lstVehicle.length > 0) {
                    var objVehicle = lstVehicle[0];
                    connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function(err, lstShareUser, fields) {
                        var lstAllUser = [objVehicle.iduser];
                        var AllUser = objVehicle.iduser.toString();
                        if (!err && lstShareUser.length > 0) {
                            for (var i = 0; i < lstShareUser.length; i++) {
                                lstAllUser.push(lstShareUser[i].idUser)
                                AllUser = AllUser + ',' + lstShareUser[i].idUser;
                            }
                        }
                        connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function(err, objAppInfo, fields) {

                            var Message = "";
                            var soundname = "";

                            if (AlarmCode == '04') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Engine ON alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '03') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Door Open alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '10') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Low Bettry alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '11') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Max Speed alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '12') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Movement alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '30') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Vibration alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '50') {
                                Message = 'Vehicle ' + objVehicle.Name + ' External Power Cut alert! Please check!';
                                soundname = 'sound50';
                            } else if (AlarmCode == '05') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Original Triggering alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '02') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Line Broken alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '52') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Veer Report alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '60') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Fuel Driving alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '71') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Crash alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '72') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Acceleration alert! Please check!';
                                soundname = 'Default';
                            } else if (AlarmCode == '81') {
                                Message = 'Vehicle ' + objVehicle.Name + ' Fuel Loss alert! Please check!';
                                soundname = 'Default';
                            } else {
                                soundname = 'Default';
                            }

                            var PushNotificationdata = {
                                title: 'Alert',
                                message: Message,
                                // Fence: 'Default',
                                soundname: soundname,
                                otherfields: {
                                    deviceid: DeviceId,
                                    Id: objVehicle.id,
                                    VehicleName: objVehicle.Name,
                                    AlarmCode: AlarmCode,
                                    Type: 'Alarm'
                                }
                            };
                            console.log(AllUser)
                            SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);

                            // if (new Date(GPSDateTime) <= new Date()) {
                            // io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                            for (var i = 0; i < lstAllUser.length; i++) {
                                var objConnection = {
                                    AlarmCode: AlarmCode.toString(),
                                    DeviceId: DeviceId,
                                    Datetime: GPSDateTime,
                                    Date: unixDateStemp,
                                    IdUser: lstAllUser[i],
                                    Name: objVehicle.Name
                                }

                                io.sockets.emit(lstAllUser[i] + 'DeviceAlarm', JSON.stringify(objConnection));

                                var objPushnotificationCount = {
                                    Id: rows.insertId,
                                    Latitude: Latitude,
                                    Longitude: Longitude,
                                    GPSPositioning: Position,
                                    Speed: Speed,
                                    Direction: Direction,
                                    Status: inputoutputSTatus,
                                    AlarmCode: AlarmCode.toString(),
                                    DeviceId: DeviceId,
                                    CreatedDate: CurrentDate,
                                    Datetime: GPSDateTime,
                                    Date: unixDateStemp,
                                    FenceName: null,
                                    UserId: lstAllUser[i],
                                    IsRead: false,
                                    // Name: objVehicle.Name
                                }

                                io.sockets.emit(lstAllUser[i] + 'DeviceNotificationCount', JSON.stringify(objPushnotificationCount));
                            }
                            // }

                        });
                    })
                }
            });


        });

    } catch (ex) {
        console.log("Error Alarm Data = " + line);
    }
};

//Command9901 - CAN-BUS Command
global.Command9901 = function(line, Callback) {
    console.log("CAN-BUS Data = " + line);
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
    } catch (ex) {
        console.log("Error Canbus Data = " + line);
    }

};

//Command9902 -  Driving Behavior Command
global.Command9902 = function(line, Callback) {
    console.log("Driving Data = " + line);
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
    } catch (ex) {
        console.log("Error Driving Data = " + line);
    }

};

//Send Speed Data
router.get('/SendSpeedData', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.Speed = req.query.Speed;
    SendSpeedData(obj, function(data) {
        res.json(data);
    })


})

//Send Speed Data
global.SendSpeedData = function(objdata, Callback) {

    var DeviceId = objdata.DeviceId;
    var Speed = ('00' + decimalToHexString(parseInt(objdata.Speed) / 10)).slice(-2);

    var Data = "40400012" + DeviceId + "4105" + Speed;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('Speed send to ' + Data);
        client.write(Data, 'hex');

        client.setTimeout(10000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
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
                    connection.query("Update tblvehicle set MaxSpeed=" + objdata.Speed + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        Callback({ success: true, message: 'Speed Settings Save Successfully.' });
                    });
                } else {
                    Callback({ success: false, message: 'Speed Settings could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Speed Settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });
}

//Send Movement Data
router.get('/SendMovementData', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.Movement = req.query.Movement;
    SendMovementData(obj, function(data) {
        res.json(data);
    })


})

//Send Movement Data
global.SendMovementData = function(objdata, Callback) {

    var DeviceId = objdata.DeviceId;
    var Movement = ('00' + objdata.Movement).slice(-2);

    var Data = "40400012" + DeviceId + "4106" + Movement;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('Speed send to ' + Data);
        client.write(Data, 'hex');

        client.setTimeout(10000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4106') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    connection.query("Update tblvehicle set Movement=" + objdata.Movement + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        Callback({ success: true, message: 'Movement Settings Save Successfully.' });
                    });
                } else {
                    Callback({ success: false, message: 'Movement Settings could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Movement Settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });
}

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

        client.setTimeout(10000, function() {
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

router.get('/SendCommandToDevice', function(req, res) {
    var lstDevice = req.query.objDevice;
    var objDevice = [];
    if (Array.isArray(lstDevice)) {
        objDevice = lstDevice;
    } else {
        objDevice.push(lstDevice);
    }

    function uploader(i) {
        if (i < objDevice.length) {
            // var objMaxSpeed = new Object();
            // objMaxSpeed.DeviceId = objDevice[i];
            // objMaxSpeed.MaxSpeed = req.query.MaxSpeed;
            // SetMaxSpeed(objMaxSpeed, function(data) {})
            var objMaxSpeed = new Object();
            objMaxSpeed.DeviceId = objDevice[i];
            objMaxSpeed.Speed = req.query.MaxSpeed;
            SendSpeedData(objMaxSpeed, function(data) {})

            var objSleepMode = new Object();
            objSleepMode.DeviceId = objDevice[i];
            objSleepMode.SleepMode = req.query.SleepMode;
            SetSleepMode(objSleepMode, function(data) {})

            var objGPRSInterval = new Object();
            objGPRSInterval.DeviceId = objDevice[i];
            objGPRSInterval.TimeInterval = req.query.TimeInterval;
            SetGPRSInterval(objGPRSInterval, function(data) {})

            var objArm = new Object();
            objArm.DeviceId = objDevice[i];
            objArm.Arm = req.query.Arm;
            SetArmSettings(objArm, function(data) {})

            var objOdoMeter = new Object();
            objOdoMeter.DeviceId = objDevice[i];
            objOdoMeter.odometer = req.query.odometer;
            SetOdometerSetting(objOdoMeter, function(data) {})

            var objHeartbeatInterval = new Object();
            objHeartbeatInterval.DeviceId = objDevice[i];
            objHeartbeatInterval.TimeInterval = req.query.HeartbeatInterval;
            SetHeartBeatInterval(objHeartbeatInterval, function(data) {})

            var objGPRSStopInterval = new Object();
            objGPRSStopInterval.DeviceId = objDevice[i];
            objGPRSStopInterval.TimeInterval = req.query.GPRSStopInterval;
            SetGPRSIntervalStopCar(objGPRSStopInterval, function(data) {})

            var objACC = new Object();
            objACC.DeviceId = objDevice[i];
            objACC.TimeInterval = req.query.ACC;
            SetACCSetting(objACC, function(data) { uploader(i + 1); })

        } else {
            res.json({ success: true, message: 'Default value send to device successfully.' });
        }
    }
    uploader(0);
})

//Set GPRS Interval Settings
router.get('/SetGPRSInterval', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.TimeInterval = req.query.TimeInterval;
    SetGPRSInterval(obj, function(data) {
        res.json(data);
    })


})

//Set GPRS Interval Settings
global.SetGPRSInterval = function(objdata, Callback) {

    var DeviceId = objdata.DeviceId;
    var TimeInterval = ('0000' + decimalToHexString(parseInt(objdata.TimeInterval) / 10)).slice(-4);

    var Data = "40400013" + DeviceId + "4102" + TimeInterval;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(10000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
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
                    connection.query("Update tblvehicle set GPRSInterval=" + objdata.TimeInterval + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        Callback({ success: true, message: 'GPRS Interval Settings Save Successfully.' });
                    });
                } else {
                    Callback({ success: false, message: 'GPRS Interval Settings could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'GPRS Interval Settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });
}

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

        client.setTimeout(10000, function() {
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

        client.setTimeout(10000, function() {
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
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.SleepMode = req.query.SleepMode;
    SetSleepMode(obj, function(data) {
        res.json(data);
    })
})

//Set Sleep Mode
global.SetSleepMode = function(objdata, Callback) {

    var DeviceId = objdata.DeviceId;
    var SleepMode = ('00' + decimalToHexString(parseInt(objdata.SleepMode))).slice(-2);

    var Data = "40400012" + DeviceId + "4113" + SleepMode;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';

    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(10000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
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
                    connection.query("Update tblvehicle set SleepMode=" + objdata.SleepMode + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        Callback({ success: true, message: 'Sleep Mode Save Successfully.' });
                    });
                } else {
                    Callback({ success: false, message: 'Sleep Mode could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Sleep Mode could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });
}

//Set Output Control Settings
router.get('/SetOutputControl', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var updateQuery = "";
    var DeviceId = req.query.DeviceId;
    var ARelay = 2;
    var BSiren = 2;
    var CUserDefined = 2;
    var DDoorLock = 2;
    var EDoorUnlock = 2;

    if (req.query.Relay != undefined) {
        ARelay = req.query.Relay;
        if (updateQuery == "") {
            updateQuery += "Relay=" + req.query.Relay;
        } else {
            updateQuery += ", Relay=" + req.query.Relay;
        }
    }

    if (req.query.Siren != undefined) {
        BSiren = req.query.Siren;
        if (updateQuery == "") {
            updateQuery += "Siren=" + req.query.Siren;
        } else {
            updateQuery += ", Siren=" + req.query.Siren;
        }
    }

    if (req.query.UserDefined != undefined) {
        CUserDefined = req.query.UserDefined;
        if (updateQuery == "") {
            updateQuery += "UserDefined=" + req.query.UserDefined;
        } else {
            updateQuery += ", UserDefined=" + req.query.UserDefined;
        }
    }

    if (req.query.DoorLock != undefined) {
        DDoorLock = req.query.DoorLock;
        if (updateQuery == "") {
            updateQuery += "DoorLock =" + req.query.DoorLock;
        } else {
            updateQuery += ", DoorLock =" + req.query.DoorLock;
        }
    }

    if (req.query.DoorUnlock != undefined) {
        EDoorUnlock = req.query.DoorUnlock;
        if (updateQuery == "") {
            updateQuery += "DoorUnlock=" + req.query.DoorUnlock;
        } else {
            updateQuery += ", DoorUnlock=" + req.query.DoorUnlock;
        }
    }

    // console.log(updateQuery);

    // var ARelay = req.query.Relay;
    // var BSiren = req.query.Siren;
    // var CUserDefined = req.query.UserDefined;
    // var DDoorLock = req.query.DoorLock;
    // var EDoorUnlock = req.query.DoorUnLock;


    var ABCDE = ('00' + decimalToHexString(parseInt(ARelay))).slice(-2) + ('00' + decimalToHexString(parseInt(BSiren))).slice(-2) + ('00' + decimalToHexString(parseInt(CUserDefined))).slice(-2) + ('00' + decimalToHexString(parseInt(DDoorLock))).slice(-2) + ('00' + decimalToHexString(parseInt(EDoorUnlock))).slice(-2);
    var Data = "40400016" + DeviceId + "4114" + ABCDE;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(10000, function() {
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
                    connection.query("Update tblvehicle set " + updateQuery + " where deviceid='" + DeviceId + "'", function(err, rows, fields) {
                        res.json({ success: true, message: 'Setting Save Successfully.' });
                    });
                } else {
                    res.json({ success: false, message: 'Setting could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Setting could not save. Try again later.' });
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
    if (req.query.Arm == '2' || req.query.Arm == 2) {
        var obj = new Object();
        obj.DeviceId = DeviceId;
        obj.Arm = req.query.Arm;

        connection.query("Update tblvehicle set Arm=" + obj.Arm + " where deviceid=" + DeviceId, function(err, rows, fields) {
            var Startdate = new Date();

            var convertDate = convertdateformatForUnix(Startdate);
            var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
            // var unixStartdate = Startdate.getTime() / 1000;

            // GPSData.findOne({
            //     where: {
            //         DeviceId: DeviceId,
            //         Date: { $lte: unixStartdate }
            //     },
            //     order: 'Date DESC'
            // }).then(function(response) {
            //     if (response != null) {

            //----------------call redix server data--------------------------
            client.get(DeviceId, function(err, response) {

                if (!err && response != null && response != '' && response != undefined) {
                    response = JSON.parse(response);
                    //----------------End redix server data--------------------------

                    if (response.IsEngine == 1) {
                        obj.ArmStatus = 0;
                    } else {
                        obj.ArmStatus = 1;
                    }
                    SetArmSettings(obj, function(data) {});
                    res.json({ success: true, message: 'Arm Settings Save Successfully.' });

                } else {
                    res.json({ success: true, message: 'Arm Settings Save Successfully.' });
                }
            })

        });

    } else {
        var obj = new Object();
        obj.DeviceId = DeviceId;
        obj.Arm = req.query.Arm;
        obj.ArmStatus = req.query.Arm;
        SetArmSettings(obj, function(data) {
            res.json(data);
        })
    }


})

//Set Arm Settings
global.SetArmSettings = function(objdata, Callback) {

    var Arm = ('00' + decimalToHexString(parseInt(objdata.ArmStatus))).slice(-2);
    var DeviceId = objdata.DeviceId;
    var Data = "40400012" + DeviceId + "4116" + Arm;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';

    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(10000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
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

                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    connection.query("Update tblvehicle set Arm=" + objdata.Arm + ", LastArmSetting=" + objdata.ArmStatus + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        Callback({ success: true, message: 'Arm Settings Save Successfully.' });
                    });
                } else {
                    Callback({ success: false, message: 'Arm Settings could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Arm Settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });
}

//Set GPRS Interval Settings When Car in Stop
router.get('/SetGPRSIntervalStopCar', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.TimeInterval = req.query.TimeInterval;
    SetGPRSIntervalStopCar(obj, function(data) {
        res.json(data);
    })


})

//Set GPRS Interval Settings When Car in Stop
global.SetGPRSIntervalStopCar = function(objdata, Callback) {

    var DeviceId = objdata.DeviceId;
    var TimeInterval = ('0000' + decimalToHexString(parseInt(objdata.TimeInterval) / 10)).slice(-4);

    var Data = "40400013" + DeviceId + "4126" + TimeInterval;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(10000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
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
                    connection.query("Update tblvehicle set GPRSStopInterval=" + objdata.TimeInterval + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        Callback({ success: true, message: 'GPRS Interval Settings for Stop Car Save Successfully.' });
                    });
                } else {
                    Callback({ success: false, message: 'GPRS Interval Settings for Stop Car could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'GPRS Interval Settings for Stop Car could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });
}

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

        client.setTimeout(10000, function() {
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
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.odometer = req.query.odometer;
    SetOdometerSetting(obj, function(data) {
        res.json(data);
    })


})

//Set Initial ODOmeter Settings
global.SetOdometerSetting = function(objdata, Callback) {

    var DeviceId = objdata.DeviceId;
    var odometer = a2hex(objdata.odometer);
    var datalength = 8;
    var Data = DeviceId + "4145" + odometer;
    datalength = datalength + (Data.length / 2);
    Data = "4040" + ('0000' + datalength.toString(16)).slice(-4) + Data + CalculateCRCbyHex(Data) + '0D0A';
    console.log(Data)
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(10000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
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
                    connection.query("Update tblvehicle set OdoMeter=" + objdata.odometer + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        Callback({ success: true, message: 'Odometer settings Save Successfully.' });
                    });
                } else {
                    Callback({ success: false, message: 'Odometer settings could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Odometer settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });

}

//Set Initial ACC Settings
router.get('/SetACCSetting', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.ACC = req.query.ACC;
    SetACCSetting(obj, function(data) {
        res.json(data);
    })


})

//Set Initial ACC Settings
global.SetACCSetting = function(objdata, Callback) {

    var DeviceId = objdata.DeviceId;
    var ACC = a2hex(objdata.ACC.toString());
    var commandlength = ('0000' + (17 + (ACC.length / 2)).toString()).slice(-4);

    var Data = "4040" + commandlength + DeviceId + "4148" + ACC;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';

    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(10000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4148') {
                console.log('Received: ' + line);
                var StatusCode = line.substring(26, 28);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '01') {
                    connection.query("Update tblvehicle set ACC=" + objdata.ACC + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        Callback({ success: true, message: 'ACC settings Save Successfully.' });
                    });
                } else {

                    Callback({ success: false, message: 'ACC settings could not save. Try again later.' });

                }

            } else {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'ACC settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });

}

//Set HeartBeat Interval Settings
router.get('/SetHeartBeatInterval', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503  
    //404018580420800457925119326b320d0a
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.TimeInterval = req.query.TimeInterval;
    SetHeartBeatInterval(obj, function(data) {
        res.json(data);
    })


})

//Set HeartBeat Interval Settings
global.SetHeartBeatInterval = function(objdata, Callback) {

    var packetLength = 17;
    var DeviceId = objdata.DeviceId;
    var TimeInterval = a2hex(objdata.TimeInterval);
    packetLength = packetLength + (TimeInterval.length / 2);

    var Data = "4040" + ('0000' + packetLength.toString(16)).slice(-4) + DeviceId + "5119" + TimeInterval;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data, 'hex');

        client.setTimeout(10000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
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
                    connection.query("Update tblvehicle set HeartbeatInterval=" + objdata.TimeInterval + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        Callback({ success: true, message: 'HeartBeat Interval Settings Save Successfully.' });
                    });
                } else {
                    Callback({ success: false, message: 'HeartBeat Interval Settings could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                Callback({ success: false, message: 'HeartBeat Interval Settings could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });

}

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

        client.setTimeout(10000, function() {
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

        client.setTimeout(10000, function() {
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

        client.setTimeout(10000, function() {
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
        client.setTimeout(10000, function() {
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

        client.setTimeout(10000, function() {
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
        client.setTimeout(10000, function() {
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

        client.setTimeout(10000, function() {
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

        client.setTimeout(10000, function() {
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

function convertdateformatForUnix(date1) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    return ("00" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

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

// var rule = new schedule.RecurrenceRule();
// //rule.dayOfWeek = [0, new schedule.Range(4, 6)];
// // rule.hour = 0;
// // rule.minute = 0;
// // rule.second = 30;
// rule.minute = new schedule.Range(0, 59, 1);
// //rule.minute = new schedule.Range(0, 59, 1);
// var testStatus = false;
// var IsOnlineDeviceCheck = schedule.scheduleJob(rule, function() {

//     // Fake Alarm Add
//     // FakeAlarm();

//     var today = new Date();
//     var year = today.getFullYear();
//     var month = today.getMonth() + 1; // beware: January = 0; February = 1, etc.
//     // var month1 = today.getMonth() + 1; // beware: January = 0; February = 1, etc.
//     var day = today.getDate();

//     var data = year + '-' + month + '-' + day;
//     console.log(new Date())

//     Vehicle.findAll({
//         where: {
//             IsOnline: true,
//             IsDelete: false
//         },
//     }).then(function(resVehicle) {
//         // for (var i = 0; i < resVehicle.length; i++) {
//         function setDeviceStatus(i) {
//             if (i < resVehicle.length) {
//                 if (resVehicle[i].HandshakDatetime != null) {
//                     var date1 = new Date();
//                     var date2 = new Date(resVehicle[i].HandshakDatetime);
//                     var timeDiff = Math.abs(date2.getTime() - date1.getTime());
//                     var min = Math.floor(timeDiff / 60000);
//                     console.log(resVehicle[i].deviceid + "    = " + min);
//                     if (min > 5) {
//                         var objVehicleExist = resVehicle[i];
//                         Vehicle.findOne({
//                             where: {
//                                 id: objVehicleExist.id
//                             }
//                         }).then(function(objVehicleExistOnline) {
//                             if (objVehicleExistOnline && objVehicleExistOnline.IsOnline) {
//                                 objVehicleExistOnline.updateAttributes({ IsOnline: false }).then(function(resUpdate) {

//                                     if (objVehicleExistOnline.IsDelete == false) {
//                                         // var PushNotificationdata = {
//                                         //     title: 'Alert',
//                                         //     message: 'Vehicle ' + objVehicleExistOnline.Name + ' Device offline alert! Please check!',
//                                         //     Fence: 'Default',
//                                         //     otherfields: {
//                                         //         deviceid: objVehicleExistOnline.deviceid,
//                                         //         Id: objVehicleExistOnline.id,
//                                         //         Name: objVehicleExistOnline.Name
//                                         //     }
//                                         // };

//                                         // SendPushNotification(PushNotificationdata, objVehicleExistOnline.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
//                                     }
//                                     var objConnection = {
//                                         DeviceId: objVehicleExistOnline.deviceid,
//                                         // PetId: objVehicleExistOnline.id,
//                                         Status: false
//                                     }
//                                     io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
//                                     io.sockets.emit(objVehicleExistOnline.deviceid + 'BikeDeviceStatus', JSON.stringify(objConnection));
//                                     setDeviceStatus(i + 1);
//                                 })
//                             } else {
//                                 setDeviceStatus(i + 1);
//                             }
//                         })
//                     } else {
//                         setDeviceStatus(i + 1);
//                     }
//                 } else {
//                     var objVehicleExist = resVehicle[i];
//                     Vehicle.findOne({
//                         where: {
//                             id: objVehicleExist.id
//                         }
//                     }).then(function(objVehicleExistOnline) {
//                         if (objVehicleExistOnline && objVehicleExistOnline.IsOnline) {
//                             objVehicleExistOnline.updateAttributes({ IsOnline: false }).then(function(resUpdate) {
//                                 if (objVehicleExistOnline.IsDelete == false) {
//                                     // var PushNotificationdata = {
//                                     //     title: 'Alert',
//                                     //     message: 'Vehicle ' + objVehicleExistOnline.Name + ' Device offline alert! Please check!',
//                                     //     Fence: 'Default',
//                                     //     otherfields: {
//                                     //         deviceid: objVehicleExistOnline.deviceid,
//                                     //         Id: objVehicleExistOnline.id,
//                                     //         Name: objVehicleExistOnline.Name
//                                     //     }
//                                     // };
//                                     // if (objVehicleExistOnline.DeviceType == 'M2') {
//                                     //     SendPushNotification(PushNotificationdata, objVehicleExistOnline.iduser, 'Shop', null);
//                                     // } else {
//                                     //     SendPushNotification(PushNotificationdata, objVehicleExistOnline.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
//                                     // }
//                                 }
//                                 var objConnection = {
//                                     DeviceId: objVehicleExistOnline.deviceid,
//                                     // PetId: objVehicleExistOnline.id,
//                                     Status: false
//                                 }
//                                 io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
//                                 io.sockets.emit(objVehicleExistOnline.deviceid + 'BikeDeviceStatus', JSON.stringify(objConnection));
//                                 setDeviceStatus(i + 1);
//                             })
//                         } else {
//                             setDeviceStatus(i + 1);
//                         }
//                     })
//                 }
//             }
//         }
//         setDeviceStatus(0);
//     })
// });

module.exports = router