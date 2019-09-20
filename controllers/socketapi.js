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
var SystemEmail = models.tblemailsettingsys;
var EmailTemplate = models.tblemailtemplate;
var Setting = models.tblsetting;
var momentz = require('moment-timezone');
var CommonFunction = require('./common.js');
var FCM = require('fcm-node');
// var serverKey = process.env.PushNotificationgcmid; //put your server key here

//End of Tables

global.deg_to_lat_long = function (deg, Direction) {

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

router.get('/TestDegree', function (req, res) {
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
        title: '9787 is out of Home Fence.',
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
            objPushNotificationSend.send(deviceIds, data, function (result) {
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

function SendFCMPushNotification(DeviceId) {
    var message = {
        to: DeviceId,
        collapse_key: 'Maark',
        notification: {
            title: '9787 is out of Home Fence.',
            body: '9787 is out of Home Fence.',
            // body: '9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence.',
            "sound": "default",
            "click_action": "FCM_PLUGIN_ACTIVITY",
            // "icon": "fcm_push_icon"
        },
        data: {
            title: '9787 is out of Home Fence.',
            message: '9787 is out of Home Fence.',
            //message: '9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence. 9787 is out of Home Fence.',
            soundname: 'sound50',
            msgcnt: "2",
            otherfields: {
                deviceid: '123456',
                Id: 1,
                VehicleName: '9787',
                AlarmCode: '6',
                Type: 'Alarm',
                // Type: 'Notification',
                // NotificationType: 'Road Tax Renewal'
            }
        }
    };
    var serverKey = process.env.PushNotificationgcmid;
    var fcm = new FCM(serverKey);
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!", err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });

}

router.get('/SendFCMPush', function (req, res) {
    var DeviceId = req.query.Token;
    SendFCMPushNotification(DeviceId);
    res.send("Done")
})

router.get('/SendIOSPush', function (req, res) {
    var DeviceId = req.query.Token;
    SendIOSPushNotification(DeviceId);
    res.send("Done")
})

router.get('/SendPushTest', function (req, res) {
    var UserId = req.query.UserId;
    connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + UserId, function (err, objAppInfo, fields) {
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
        SendPWAPushNotification(PushNotificationdata, UserId);
        // SendPushNotification(PushNotificationdata, UserId, objAppInfo[0]);
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

function SendFCMPushOneByOne(message, serverKey, callback) {
    var fcm = new FCM(serverKey);
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!", err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
        return callback(true);
    });
}

global.SendPushNotification = function (data, UserId, objAppInfo) {
    // var deviceIds = [];
    var AlarmCode = '';
    if (data.otherfields.AlarmCode != null && data.otherfields.AlarmCode != undefined && data.otherfields.AlarmCode != '') {
        AlarmCode = data.otherfields.AlarmCode;
    } else {
        AlarmCode = data.otherfields.NotificationType;
    }
    CheckNotificationOn(UserId, AlarmCode, function (alarmStatusUserId) {
        if (alarmStatusUserId != '') {
            connection.query("SELECT PushNotificationId,Platform,MessageCount,UserType,udid,iduser from tblpushnotification where iduser in (" + alarmStatusUserId + ") group by PushNotificationId, Platform", function (err, response, fields) {
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

                                    objData.priority = 'high';
                                    var objPushNotificationSend = new PushNotifications(PushNotificationSettings);
                                    if (deviceIds.length > 0) {

                                        objPushNotificationSend.send(deviceIds, objData, function (result) {
                                            // console.log(result);
                                            connection.query("Update tblpushnotification set messagecount=" + messagecount + " where udid='" + response[i].udid + "' and UserType='" + response[i].UserType + "'", function (errupdate, updateresp, fields) {
                                                console.log(errupdate)

                                                SendNotification(i + 1);
                                            });
                                        });
                                    } else {
                                        SendNotification(i + 1);
                                    };

                                } else {

                                    // PushNotificationSettings.gcm.msgcnt = messagecount;
                                    // PushNotificationSettings.gcm.id = objAppInfo.AndroidId;

                                    var objDataFCM = clone(data);
                                    objDataFCM.msgcnt = messagecount;
                                    console.log(objDataFCM)
                                    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                        to: response[i].PushNotificationId,
                                        collapse_key: objAppInfo.AppName,
                                        notification: {
                                            title: objDataFCM.title,
                                            body: objDataFCM.message,
                                            "sound": "default",
                                            "click_action": "FCM_PLUGIN_ACTIVITY",
                                            // "icon": "fcm_push_icon"
                                        },
                                        data: objDataFCM
                                    };
                                    SendFCMPushOneByOne(message, objAppInfo.AndroidId, function () {
                                        connection.query("Update tblpushnotification set messagecount=" + messagecount + " where udid='" + response[i].udid + "' and UserType='" + response[i].UserType + "'", function (errupdate, updateresp, fields) {
                                            console.log(errupdate)
                                            SendNotification(i + 1);
                                        });
                                    });

                                }
                                // console.log(response[i].Platform + "_______________________________________________________")
                                // console.log(objData)

                                //     } else {
                                //         SendNotification(i + 1);
                                //     }
                                // });

                            } catch (ex) {
                                console.log(ex);
                                SendNotification(i + 1);
                            }


                        } else {
                            SendPWAPushNotification(data, UserId);
                        }
                    }
                    SendNotification(0)
                } else {
                    SendPWAPushNotification(data, UserId);
                }
            })
        }
    })
}

router.get('/SendPushTest1', function (req, res) {
    var UserId = req.query.UserId;
    CheckNotificationOn('1,50316', 'Road Tax Renewal', function (alarmStatus) { })
    connection.query("SELECT tu.id, tu.username, tu.Notification, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + UserId, function (err, objAppInfo, fields) {
        if (objAppInfo[0].Notification == 1) {
            var AlarmCode = '6'
            var PushNotificationdata = {
                title: 'Alert',
                message: '9787 is out of Home Fence.',
                Fence: 'Default',
                otherfields: {
                    deviceid: 123456,
                    Id: 1,
                    VehicleName: '9787',
                    AlarmCode: AlarmCode,
                    Type: 'Alarm',
                    // NotificationType: 'Road Tax Renewal'
                }
            };
            SendPushNotification(PushNotificationdata, '1,50316', objAppInfo[0]);
        }
        res.send("Success")
    })
})

global.CheckNotificationOn = CheckNotificationOn;

function CheckNotificationOn(UserId, AlarmCode, callback) {
    var UserId = UserId;
    var FinalUserId = '';
    var qryUserNotitifcation = "Select id from tbluserinformation where id in (" + UserId + ") and Notification=true";
    connection.query(qryUserNotitifcation, function (err, lstUserNotificationOn, fields) {
        var NewUserId = '';
        for (var i = 0; i < lstUserNotificationOn.length; i++) {
            if (NewUserId != '') {
                NewUserId = NewUserId + ',' + lstUserNotificationOn[i].id;
            } else {
                NewUserId = lstUserNotificationOn[i].id
            }
        }
        if (NewUserId != '') {
            var qry = "SELECT tnm.Notification, tnm.AlarmCode, tns.IsNotificationOn,tns.idUser FROM tblnotificationmgmt as tnm INNER JOIN tblnotificationsetting as tns ON tns.idNotification = tnm.id where tns.idUser in (" + NewUserId + ") and (Notification='" + AlarmCode + "' or AlarmCode = '" + AlarmCode + "')";
            connection.query(qry, function (err, lstNotification, fields) {
                for (var i = 0; i < lstUserNotificationOn.length; i++) {
                    var IsNotificationAllow = u.findWhere(lstNotification, { idUser: lstUserNotificationOn[i].id });
                    if (IsNotificationAllow != undefined) {
                        if (IsNotificationAllow.IsNotificationOn == true || IsNotificationAllow.IsNotificationOn == 1) {
                            if (FinalUserId != '') {
                                FinalUserId = FinalUserId + ',' + lstUserNotificationOn[i].id;
                            } else {
                                FinalUserId = lstUserNotificationOn[i].id
                            }
                        }
                    } else {
                        if (FinalUserId != '') {
                            FinalUserId = FinalUserId + ',' + lstUserNotificationOn[i].id;
                        } else {
                            FinalUserId = lstUserNotificationOn[i].id
                        }
                    }
                }
                return callback(FinalUserId)
            })
        } else {
            return callback(FinalUserId)
        }
    })
}

function SendPWAPushNotification(data, UserId) {
    var AlarmCode = '';
    if (data.otherfields.AlarmCode != null && data.otherfields.AlarmCode != undefined && data.otherfields.AlarmCode != '') {
        AlarmCode = data.otherfields.AlarmCode;
    } else {
        AlarmCode = data.otherfields.NotificationType;
    }
    try {
        if (UserId.length > 0 && data.title != undefined && data.title != null && data.title != '') {
            CheckNotificationOn(UserId, AlarmCode, function (alarmStatusUserId) {
                if (alarmStatusUserId != '') {
                    connection.query("SELECT * from tblpwa_notification_subscription where iduser in (" + alarmStatusUserId + ")", function (errors, lstPWASubscribers, fields) {
                        if (!errors && lstPWASubscribers.length > 0) {
                            var title = data.title;
                            var message = data.message;

                            function SendOneByOne(p) {
                                if (p < lstPWASubscribers.length) {
                                    try {
                                        var objPWANotification = lstPWASubscribers[p];

                                        var endpoint = objPWANotification.endpoint;
                                        var auth = objPWANotification.auth;
                                        var p256dh = objPWANotification.p256dh;
                                        const pushSubscription = {
                                            endpoint: endpoint,
                                            keys: {
                                                auth: auth,
                                                p256dh: p256dh
                                            }
                                        };
                                        webpush.sendNotification(pushSubscription, JSON.stringify({ title: title, content: message })).then(function (resPWA) {
                                            SendOneByOne(p + 1);
                                            // console.log("========================================================")
                                            // console.log(resPWA)
                                            // console.log("========================================================")
                                        }).catch(function (err) {
                                            // console.log(err);
                                            SendOneByOne(p + 1);
                                        });
                                    } catch (errr) {
                                        SendOneByOne(p + 1);
                                    }
                                }
                            }
                            SendOneByOne(0);
                        }
                    });
                }
            })
        }
    } catch (er) { }
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
global.CalculateCRCbyHex = function (hex) {
    var bytedata = hex2byteCRC(hex);
    return ("0000" + decimalToHexString(crc.crc16x25(bytedata))).slice(-4);
}

router.get('/CalculateCRCOnline', function (req, res) {
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

global.hexToBinary = function (s) {
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

router.get('/TestAPI', function (req, res) {
    console.log(req.query);
    res.send("Success");
});

router.get('/GetCenterByGPS', function (req, res) {
    console.log(req.query);
    console.log(CurrentOffset)
    connection.query("SELECT Latitude as latitude,Longitude as longitude FROM tblgpsdata where DeviceId='" + req.query.DeviceId + "' and DATE_FORMAT(Datetime,'%H:%i:%s')>='20:30:00' and DATE_FORMAT(Datetime,'%H:%i:%s')<='22:30:00' and speed=0 and Direction=0  and Datetime>'2018-01-02';", function (err, lstData, fields) {
        var centerdata = geolib.getCenter(lstData);
        console.log(centerdata)
        res.send(centerdata);
    });
});

router.get('/RequestIMEINumberbyUDID', function (req, res) {
    var UDID = req.query.UDID;
    IMEINumberMapping.findOne({ where: { UDID: UDID } }).then(function (objUserIMEI) {
        if (objUserIMEI != null) {
            res.json({ IMEI: objUserIMEI.IMEI });
        } else {
            IMEINumber.findOne({ where: { IsUse: false } }).then(function (objIMEI) {
                var obj = new Object();
                obj.UDID = UDID;
                obj.IMEI = objIMEI.IMEI;
                obj.Type = 'IOS';
                obj.CreatedDate = new Date();
                IMEINumberMapping.create(obj).then(function (resUserIMEI) {
                    objIMEI.updateAttributes({ IsUse: true }).then(function (resIMEI) {
                        GPSDevice.findOne({ where: { IMEI: objIMEI.IMEI } }).then(function (resDevice) {
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
                                GPSDevice.create(objDevice).then(function (resCreate) {
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

router.get('/RequestIMEINumberForAndroid', function (req, res) {
    IMEINumberMapping.findOne({ where: { UDID: req.query.UDID } }).then(function (objUserIMEI) {
        if (objUserIMEI != null) {
            res.json({ IMEI: objUserIMEI.IMEI });
        } else {
            var obj = new Object();
            obj.UDID = req.query.UDID;
            obj.IMEI = req.query.IMEI;
            obj.Type = req.query.Type;
            obj.CreatedDate = new Date();
            IMEINumberMapping.create(obj).then(function (resUserIMEI) {
                if (resUserIMEI != null) {
                    GPSDevice.findOne({ where: { IMEI: resUserIMEI.IMEI } }).then(function (resDevice) {
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
                            GPSDevice.create(objDevice).then(function (resCreate) {
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

router.get('/GenerateIMEI', function (req, res) {
    req.setTimeout(3600000);
    // for (var i = 0; i < 10; i++) {
    // var NewPassword = customPassword();
    // console.log(NewPassword);
    // }
    console.log("Call IMEI")

    function InsertIMEI(i) {
        if (i < 10000) {
            var IMEINumber = customPassword();
            connection.query("SELECT * from tblimeinumber where IMEI=" + IMEINumber + "", function (err, numberrow, fields) {
                if (!err) {
                    if (numberrow.length > 0) {
                        InsertIMEI(i + 1);
                    } else {
                        connection.query("Insert INTO tblimeinumber (`IMEI`,`IsUse`) VALUES(" + IMEINumber + ",0)", function (err, Bikerows, fields) {
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
router.get('/Command5000', function (req, res) {

    var line = req.query.Code;
    console.log("Login = " + line);

    var DeviceId = line.substring(8, 22);

    var CurrentDate = GetCurrentDate();
    var response = '40400012' + DeviceId + '400001';
    response = response + CalculateCRCbyHex(response) + '0D0A';
    connection.query("SELECT * from tblgpsdevice where DeviceId=" + DeviceId, function (err, rows, fields) {
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
global.Command5001 = function (line, Callback) {
    console.log("HandShak = " + line);
    try {
        //Server Reconnet If Disconneted
        if (connection.state == 'disconnected') {
            global.connection = mysql.createConnection({
                host: MysqlHost,
                user: Mysqluser,
                password: Mysqlpassword,
                database: Mysqldatabase,
                multipleStatements: true
            });
        }

        var DeviceId = line.substring(8, 22);

        var CurrentDate = GetCurrentDate();

        //tblPetgps Entry
        var query = "INSERT INTO tblhandshake (DeviceId,Datetime ) VALUES ('" + DeviceId + "', '" + CurrentDate + "');";
        connection.query(query, function (err, rows, fields) {

            connection.query("Update tblvehicle set HandshakDatetime='" + CurrentDate + "',IsOnline=true where deviceid=" + DeviceId, function (err, rows1, fields) {
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
global.Command9955 = function (objConnection, Callback) {
    var DeviceId = objConnection.DeviceId;
    client.get(DeviceId + "ProjectIgnitionStatus", function (err, ProjectIgnitionStatus) {
        if (!err) {
            if (ProjectIgnitionStatus == 'true') {
                //Server Reconnet If Disconneted
                if (connection.state == 'disconnected') {
                    global.connection = mysql.createConnection({
                        host: MysqlHost,
                        user: Mysqluser,
                        password: Mysqlpassword,
                        database: Mysqldatabase,
                        multipleStatements: true
                    });
                }
                objConnection.Deviceid = DeviceId;
                var CurrentDate = GetCurrentDate();
                // var objConnection = {
                //     Position: Position,
                //     Speed: Speed,
                //     Deviceid: DeviceId,
                //     Latitude: Latitude,
                //     Longitude: Longitude,
                //     Direction: Direction,
                //     OdoMeter: Odometer,
                //     IsRelayToStopTheCar: IsRelayToStopTheCar,
                //     IsSirenSound: IsSirenSound,
                //     IsUserDefined: IsUserDefined,
                //     IsLockTheDoor: IsLockTheDoor,
                //     IsUnlockTheDoor: IsUnlockTheDoor,
                //     IsSOS: IsSOS,
                //     IsWiringForAntiTamper: IsWiringForAntiTamper,
                //     IsDoor: IsDoor,
                //     IsEngine: IsPatchEngine,
                //     IsOriginalSirenTriggeringStatus: IsOriginalSirenTriggeringStatus,
                //     Date: unixDateStemp,
                //     AD1: AD1,
                //     AD2: AD2
                // }

                // if (objConnection.Position == 'A') {
                //     client.set(DeviceId, JSON.stringify(objConnection), function(err, replies) {});
                //     // io.sockets.emit('BikeRoute', JSON.stringify(objConnection));
                //     io.sockets.emit(DeviceId + 'BikeRoute', JSON.stringify(objConnection));
                // }
                var VehicleStatus = 0;
                if (objConnection.Speed == 0 && objConnection.IsEngine == true) {
                    VehicleStatus = 2;
                } else {
                    VehicleStatus = 1;
                }

                //Ignition Status
                var IsEngineStatusGet = false;
                var IsEngineStatusChange = false;
                client.get(DeviceId + "EngineStatus1", function (err, strEngineStatus) {
                    if (!err) {
                        if (strEngineStatus != null && strEngineStatus != undefined && strEngineStatus != '' && strEngineStatus != 'null' && strEngineStatus != 'undefined') {
                            IsEngineStatusGet = true;
                            var objEngineStatus = JSON.parse(strEngineStatus);
                            if (objEngineStatus.IsEngine != objConnection.IsEngine) {
                                IsEngineStatusChange = true;
                            }
                        }
                    }

                    if (IsEngineStatusGet == false || IsEngineStatusChange == true) {
                        var objnewEngineStatus = {
                            IsEngine: objConnection.IsEngine,
                            Date: objConnection.Date
                        }
                        client.set(DeviceId + "EngineStatus1", JSON.stringify(objnewEngineStatus), function (err, replies) { });

                        // var NewDeviceId = DeviceId.substring(DeviceId.length - 7);
                        // var Ids = "3" + unixDateStemp.toString() + NewDeviceId;
                        // var IsEnginetStaus = 0;
                        // if (IsPatchEngine == true) {
                        //     IsEnginetStaus = 1;
                        // }
                        // var query = "INSERT INTO tblvehicletransaction (id,DeviceId,Type,Status,Date,CreatedDate,Latitude,Longitude,Odometer) VALUES (" + Ids + ",'" + DeviceId + "','EngineStatus'," + IsEnginetStaus + "," + unixDateStemp + ",'" + CurrentDate + "','" + Latitude + "','" + Longitude + "'," + Odometer + ");";
                        // connectionSocketAPIEngineStatus.query(query, function(err, rows, fields) {});

                        var AlarmCode = '07';
                        if (objConnection.IsEngine == true) {
                            AlarmCode = '08';
                        }

                        if (ObjMyPinIgnition[DeviceId] != null && ObjMyPinIgnition[DeviceId] != undefined && ObjMyPinIgnition[DeviceId] != '') {
                            if ((ObjMyPinIgnition[DeviceId].Ignition != objConnection.IsEngine) || (ObjMyPinIgnition[DeviceId].Ignition == objConnection.IsEngine && ObjMyPinIgnition[DeviceId].Alert == false)) {
                                ObjMyPinIgnition[DeviceId].Ignition = objConnection.IsEngine;
                                ObjMyPinIgnition[DeviceId].Alert = true;

                                UpdateIgnitionQuery();
                            }
                        } else {
                            ObjMyPinIgnition[DeviceId] = {
                                Ignition: objConnection.IsEngine,
                                Alert: true
                            }
                            UpdateIgnitionQuery();
                        }

                        function UpdateIgnitionQuery() {
                            var query = "INSERT INTO tblalarm (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,AlarmCode,CreatedDate ) VALUES ('" + objConnection.GPSDateTime + "', '" + objConnection.Date + "', '" + objConnection.Latitude + "', '" + objConnection.Longitude + "', '" + objConnection.Position + "', '" + objConnection.Speed + "', '" + objConnection.Direction + "', '" + objConnection.inputoutputSTatus + "', '" + DeviceId + "','" + AlarmCode + "','" + CurrentDate + "');";
                            connection.query(query, function (err, rows, fields) {

                                connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid='" + DeviceId + "' and IsDelete=false", function (err, lstVehicle, fields) {
                                    if (!err && lstVehicle.length > 0) {
                                        var objVehicle = lstVehicle[0];
                                        connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function (err, lstShareUser, fields) {
                                            var lstAllUser = [objVehicle.iduser];
                                            var AllUser = objVehicle.iduser.toString();
                                            if (!err && lstShareUser.length > 0) {
                                                for (var i = 0; i < lstShareUser.length; i++) {
                                                    lstAllUser.push(lstShareUser[i].idUser)
                                                    AllUser = AllUser + ',' + lstShareUser[i].idUser;
                                                }
                                            }
                                            connection.query("SELECT tu.id,tu.idApp, tu.username,tu.email,tu.Notification, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function (err, objAppInfo, fields) {

                                                for (var i = 0; i < lstAllUser.length; i++) {
                                                    var objConnection1 = {
                                                        AlarmCode: AlarmCode.toString(),
                                                        DeviceId: DeviceId,
                                                        Datetime: objConnection.GPSDateTime,
                                                        Date: objConnection.Date,
                                                        IdUser: lstAllUser[i],
                                                        Name: objVehicle.Name
                                                    }
                                                    io.sockets.emit(lstAllUser[i] + 'DeviceAlarm', JSON.stringify(objConnection1));
                                                    ObjMyPinIgnition[DeviceId].Alert = true;


                                                    var objPushnotificationCount = {
                                                        Id: rows.insertId,
                                                        Latitude: objConnection.Latitude,
                                                        Longitude: objConnection.Longitude,
                                                        GPSPositioning: objConnection.Position,
                                                        Speed: objConnection.Speed,
                                                        Direction: objConnection.Direction,
                                                        Status: objConnection.inputoutputSTatus,
                                                        AlarmCode: AlarmCode.toString(),
                                                        DeviceId: DeviceId,
                                                        CreatedDate: CurrentDate,
                                                        Datetime: objConnection.GPSDateTime,
                                                        Date: objConnection.Date,
                                                        FenceName: null,
                                                        UserId: lstAllUser[i],
                                                        IsRead: false,
                                                        // Name: objVehicle.Name
                                                    }

                                                    io.sockets.emit(lstAllUser[i] + 'DeviceNotificationCount', JSON.stringify(objPushnotificationCount));
                                                }

                                                client.get(DeviceId + "IgnitionStatus", function (err, UserIgnitionStatus) {
                                                    if (!err) {
                                                        if (UserIgnitionStatus != null && UserIgnitionStatus != undefined && UserIgnitionStatus != '' && UserIgnitionStatus != 'null' && UserIgnitionStatus != 'undefined') {
                                                            if (UserIgnitionStatus == 'true') {
                                                                var Message = "";
                                                                var soundname = "Default";

                                                                if (AlarmCode == '08') {
                                                                    Message = 'Vehicle ' + objVehicle.Name + ' Ignition ON alert! Please check!';
                                                                    soundname = 'Default';
                                                                } else if (AlarmCode == '07') {
                                                                    Message = 'Vehicle ' + objVehicle.Name + ' Ignition OFF alert! Please check!';
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
                                                                // console.log(AllUser)


                                                                SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
                                                                // if (new Date(GPSDateTime) <= new Date()) {
                                                                // io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));

                                                                var objConnection1 = {
                                                                    AlarmCode: AlarmCode.toString(),
                                                                    DeviceId: DeviceId,
                                                                    Datetime: objConnection.GPSDateTime,
                                                                    Date: objConnection.Date,
                                                                    Name: objVehicle.Name
                                                                }

                                                                client.get(DeviceId + "EmailNotificationSend", function (err, UserEmailStatus) {
                                                                    // console.log("Redis Error ============================================================", err, UserEmailStatus)
                                                                    if (!err) {
                                                                        if (UserEmailStatus != null && UserEmailStatus != undefined && UserEmailStatus != '' && UserEmailStatus != 'null' && UserEmailStatus != 'undefined') {
                                                                            if (UserEmailStatus == 'true') {
                                                                                notifyMe(objConnection1)
                                                                                var Emails = objAppInfo[0].email;
                                                                                var body = '<p>Dear Valued Customer,</p>' +
                                                                                    "<p>It&#39;s an information E-mail.</p>" +
                                                                                    "<p>" + objConnection1.Message + "</p>" +
                                                                                    "<p>Click on the below link to view vehicle alert live location: <br />" +
                                                                                    "<a href='http://maps.google.com/maps?q=" + objConnection.Latitude + "," + objConnection.Longitude + "' target='_blank'>http://maps.google.com/maps?q=" + objConnection.Latitude + "," + objConnection.Longitude + "</a></p>" +
                                                                                    "<p>Thanks</p>" +
                                                                                    "<p>Sincerely,<br />" +
                                                                                    objAppInfo[0].AppName + " Support Team</p>";

                                                                                SystemEmail.findOne({ where: { IdApp: objAppInfo[0].idApp } }).then(function (objSystemEmail) {
                                                                                    var mail = {
                                                                                        from: objSystemEmail.DefaultEmailFrom,
                                                                                        to: Emails,
                                                                                        subject: objAppInfo[0].AppName + " " + objConnection1.title,
                                                                                        html: body
                                                                                    };
                                                                                    SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                                                                        // console.log("################################# Email ###########################################")
                                                                                        // console.log(EmailSettingCreated)
                                                                                    })
                                                                                })
                                                                            }
                                                                        }
                                                                    }
                                                                })

                                                                // }

                                                            }
                                                        }
                                                    }
                                                });

                                            });
                                        })
                                    }
                                });

                            });
                        }
                    }
                });

                //Vehical status (Idle minute check)
                var IsVehicleStatusGet = false;
                var IsVehicleStatusChange = false;
                var IsLastVehicleStatusIdle = false;
                var IsLastVehicleStatusMaintenance = false;
                var LastVehicleStatusIdleunixtime = 0;
                var LastVehicleStatus = 0;
                client.get(DeviceId + "VehicleStatus1", function (err, strVehicleStatus) {
                    if (!err) {
                        if (strVehicleStatus != null && strVehicleStatus != undefined && strVehicleStatus != '' && strVehicleStatus != 'null' && strVehicleStatus != 'undefined') {
                            IsVehicleStatusGet = true;
                            var objVehicleStatus = JSON.parse(strVehicleStatus);
                            if (objVehicleStatus.VehicleStatus != VehicleStatus) {
                                IsVehicleStatusChange = true;
                                LastVehicleStatus = objVehicleStatus.VehicleStatus;
                                if (objVehicleStatus.IsLastVehicleStatusIdle == true) {
                                    IsLastVehicleStatusIdle = true;
                                    LastVehicleStatusIdleunixtime = objVehicleStatus.LastVehicleStatusIdleunixtime;

                                }
                            }
                        }
                    }

                    if (IsVehicleStatusGet == false || IsVehicleStatusChange == true) {
                        if (VehicleStatus == 2 && IsVehicleStatusGet == true) {

                            if (IsLastVehicleStatusIdle == false) {
                                var objnewVehicleStatus = {
                                    VehicleStatus: LastVehicleStatus,
                                    Date: objConnection.Date,
                                    IsLastVehicleStatusIdle: true,
                                    LastVehicleStatusIdleunixtime: objConnection.Date
                                }
                                client.set(DeviceId + "VehicleStatus1", JSON.stringify(objnewVehicleStatus), function (err, replies) { });
                                VehicleStatus = LastVehicleStatus;

                                if (ObjMyPinIdle[DeviceId] != null && ObjMyPinIdle[DeviceId] != undefined && ObjMyPinIdle[DeviceId] != '') {
                                    ObjMyPinIdle[DeviceId].Alert = false;
                                } else {
                                    ObjMyPinIdle[DeviceId] = {
                                        Alert: false
                                    }
                                }

                            } else {
                                var minute = 0;
                                client.get(DeviceId + "IdleMinute", function (err, repliesMinute) {
                                    if (repliesMinute != null && repliesMinute != undefined && repliesMinute != '' && repliesMinute != 'null' && repliesMinute != 'undefined') {
                                        minute = parseInt(repliesMinute);
                                    }

                                    if ((objConnection.Date - LastVehicleStatusIdleunixtime) >= (minute * 60)) {
                                        var objnewVehicleStatus = {
                                            VehicleStatus: VehicleStatus,
                                            Date: objConnection.Date,
                                            IsLastVehicleStatusIdle: false,
                                            LastVehicleStatusIdleunixtime: 0
                                        }

                                        client.set(DeviceId + "VehicleStatus1", JSON.stringify(objnewVehicleStatus), function (err, replies) { });

                                        if (ObjMyPinIdle[DeviceId] != null && ObjMyPinIdle[DeviceId] != undefined && ObjMyPinIdle[DeviceId] != '') {
                                            if (ObjMyPinIdle[DeviceId].Alert == false) {
                                                ObjMyPinIdle[DeviceId].Alert = true;
                                                UpdateIdleQuery();
                                            }
                                        } else {
                                            ObjMyPinIdle[DeviceId] = {
                                                Alert: true
                                            }
                                            UpdateIdleQuery();
                                        }

                                        function UpdateIdleQuery() {
                                            var AlarmCode = 84;
                                            var query = "INSERT INTO tblalarm (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,AlarmCode,CreatedDate,FenceName ) VALUES ('" + objConnection.GPSDateTime + "', '" + objConnection.Date + "', '" + objConnection.Latitude + "', '" + objConnection.Longitude + "', '" + objConnection.Position + "', '" + objConnection.Speed + "', '" + objConnection.Direction + "', '" + objConnection.inputoutputSTatus + "', '" + DeviceId + "','" + AlarmCode + "','" + CurrentDate + "', '" + minute + " minute');";
                                            connection.query(query, function (err, rows, fields) {
                                                connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid='" + DeviceId + "' and IsDelete=false", function (err, lstVehicle, fields) {
                                                    if (!err && lstVehicle.length > 0) {
                                                        var objVehicle = lstVehicle[0];
                                                        connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function (err, lstShareUser, fields) {
                                                            var lstAllUser = [objVehicle.iduser];
                                                            var AllUser = objVehicle.iduser.toString();
                                                            if (!err && lstShareUser.length > 0) {
                                                                for (var i = 0; i < lstShareUser.length; i++) {
                                                                    lstAllUser.push(lstShareUser[i].idUser)
                                                                    AllUser = AllUser + ',' + lstShareUser[i].idUser;
                                                                }
                                                            }
                                                            connection.query("SELECT tu.id,tu.idApp, tu.username,tu.email,tu.Notification, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function (err, objAppInfo, fields) {

                                                                for (var i = 0; i < lstAllUser.length; i++) {
                                                                    var objConnectionAlarm = {
                                                                        AlarmCode: AlarmCode.toString(),
                                                                        DeviceId: DeviceId,
                                                                        Datetime: objConnection.GPSDateTime,
                                                                        Date: objConnection.Date,
                                                                        IdUser: lstAllUser[i],
                                                                        Name: objVehicle.Name
                                                                    }
                                                                    io.sockets.emit(lstAllUser[i] + 'DeviceAlarm', JSON.stringify(objConnectionAlarm));

                                                                    var objPushnotificationCount = {
                                                                        Id: rows.insertId,
                                                                        Latitude: objConnection.Latitude,
                                                                        Longitude: objConnection.Longitude,
                                                                        GPSPositioning: objConnection.Position,
                                                                        Speed: objConnection.Speed,
                                                                        Direction: objConnection.Direction,
                                                                        Status: objConnection.inputoutputSTatus,
                                                                        AlarmCode: AlarmCode.toString(),
                                                                        DeviceId: DeviceId,
                                                                        CreatedDate: CurrentDate,
                                                                        Datetime: objConnection.GPSDateTime,
                                                                        Date: objConnection.Date,
                                                                        FenceName: null,
                                                                        UserId: lstAllUser[i],
                                                                        IsRead: false,
                                                                    }

                                                                    io.sockets.emit(lstAllUser[i] + 'DeviceNotificationCount', JSON.stringify(objPushnotificationCount));
                                                                }

                                                                var Message = 'Vehicle ' + objVehicle.Name + ' Vehical Idle alert! Please check!';
                                                                var soundname = 'Default';

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

                                                                var objConnection1 = {
                                                                    AlarmCode: AlarmCode.toString(),
                                                                    DeviceId: DeviceId,
                                                                    Datetime: objConnection.GPSDateTime,
                                                                    Date: objConnection.Date,
                                                                    Name: objVehicle.Name,
                                                                    Time: minute
                                                                }

                                                                client.get(DeviceId + "EmailNotificationSend", function (err, UserEmailStatus) {
                                                                    // console.log("Redis Error ============================================================", err, UserEmailStatus)
                                                                    if (!err) {
                                                                        if (UserEmailStatus != null && UserEmailStatus != undefined && UserEmailStatus != '' && UserEmailStatus != 'null' && UserEmailStatus != 'undefined') {
                                                                            if (UserEmailStatus == 'true') {
                                                                                notifyMe(objConnection1)
                                                                                var Emails = objAppInfo[0].email;
                                                                                var body = '<p>Dear Valued Customer,</p>' +
                                                                                    "<p>It&#39;s an information E-mail.</p>" +
                                                                                    "<p>" + objConnection1.Message + "</p>" +
                                                                                    "<p>Click on the below link to view vehicle alert live location: <br />" +
                                                                                    "<a href='http://maps.google.com/maps?q=" + objConnection.Latitude + "," + objConnection.Longitude + "' target='_blank'>http://maps.google.com/maps?q=" + objConnection.Latitude + "," + objConnection.Longitude + "</a></p>" +
                                                                                    "<p>Thanks</p>" +
                                                                                    "<p>Sincerely,<br />" +
                                                                                    objAppInfo[0].AppName + " Support Team</p>";

                                                                                SystemEmail.findOne({ where: { IdApp: objAppInfo[0].idApp } }).then(function (objSystemEmail) {
                                                                                    var mail = {
                                                                                        from: objSystemEmail.DefaultEmailFrom,
                                                                                        to: Emails,
                                                                                        subject: objAppInfo[0].AppName + " " + objConnection1.title,
                                                                                        html: body
                                                                                    };
                                                                                    SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                                                                        // console.log("################################# Email ###########################################")
                                                                                        // console.log(EmailSettingCreated)
                                                                                    })
                                                                                })
                                                                            }
                                                                        }
                                                                    }
                                                                })
                                                            });
                                                        })
                                                    }
                                                });
                                            });
                                        }
                                    } else {
                                        VehicleStatus = LastVehicleStatus;
                                        if (ObjMyPinIdle[DeviceId] != null && ObjMyPinIdle[DeviceId] != undefined && ObjMyPinIdle[DeviceId] != '') {
                                            ObjMyPinIdle[DeviceId].Alert = false;
                                        } else {
                                            ObjMyPinIdle[DeviceId] = {
                                                Alert: false
                                            }
                                        }
                                    }
                                })
                            }
                        } else {
                            var objnewVehicleStatus = {
                                VehicleStatus: VehicleStatus,
                                Date: objConnection.Date,
                                IsLastVehicleStatusIdle: false,
                                LastVehicleStatusIdleunixtime: 0
                            }

                            client.set(DeviceId + "VehicleStatus1", JSON.stringify(objnewVehicleStatus), function (err, replies) { });
                            if (ObjMyPinIdle[DeviceId] != null && ObjMyPinIdle[DeviceId] != undefined && ObjMyPinIdle[DeviceId] != '') {
                                ObjMyPinIdle[DeviceId].Alert = false;
                            } else {
                                ObjMyPinIdle[DeviceId] = {
                                    Alert: false
                                }
                            }
                        }
                    }

                });

            }
        }
    });

};

//Command9999 - Alarm Command
global.Command9999 = function (line, Callback) {
    console.log("Alarm Data = " + line);
    try {
        //Server Reconnet If Disconneted
        if (connection.state == 'disconnected') {
            global.connection = mysql.createConnection({
                host: MysqlHost,
                user: Mysqluser,
                password: Mysqlpassword,
                database: Mysqldatabase,
                multipleStatements: true
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
        if (AlarmCode != '81') {
            var query = "INSERT INTO tblalarm (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,AlarmCode,CreatedDate ) VALUES ('" + GPSDateTime + "', '" + unixDateStemp + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "','" + AlarmCode + "','" + CurrentDate + "');";
            connection.query(query, function (err, rows, fields) {


                connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function (err, lstVehicle, fields) {
                    if (!err && lstVehicle.length > 0) {
                        var objVehicle = lstVehicle[0];
                        connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function (err, lstShareUser, fields) {
                            var lstAllUser = [objVehicle.iduser];
                            var AllUser = objVehicle.iduser.toString();
                            if (!err && lstShareUser.length > 0) {
                                for (var i = 0; i < lstShareUser.length; i++) {
                                    lstAllUser.push(lstShareUser[i].idUser)
                                    AllUser = AllUser + ',' + lstShareUser[i].idUser;
                                }
                            }
                            connection.query("SELECT tu.id,tu.idApp, tu.username,tu.email,tu.Notification, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function (err, objAppInfo, fields) {

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
                                // console.log(AllUser)
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

                                var objConnection1 = {
                                    AlarmCode: AlarmCode.toString(),
                                    DeviceId: DeviceId,
                                    Datetime: GPSDateTime,
                                    Date: unixDateStemp,
                                    Name: objVehicle.Name
                                }

                                client.get(DeviceId + "EmailNotificationSend", function (err, UserEmailStatus) {
                                    // console.log("Redis Error ============================================================", err, UserEmailStatus)
                                    if (!err) {
                                        if (UserEmailStatus != null && UserEmailStatus != undefined && UserEmailStatus != '' && UserEmailStatus != 'null' && UserEmailStatus != 'undefined') {
                                            if (UserEmailStatus == 'true') {
                                                notifyMe(objConnection1)
                                                var Emails = objAppInfo[0].email;
                                                var body = '<p>Dear Valued Customer,</p>' +
                                                    "<p>It&#39;s an information E-mail.</p>" +
                                                    "<p>" + objConnection1.Message + "</p>" +
                                                    "<p>Click on the below link to view vehicle alert live location: <br />" +
                                                    "<a href='http://maps.google.com/maps?q=" + Latitude + "," + Longitude + "' target='_blank'>http://maps.google.com/maps?q=" + Latitude + "," + Longitude + "</a></p>" +
                                                    "<p>Thanks</p>" +
                                                    "<p>Sincerely,<br />" +
                                                    objAppInfo[0].AppName + " Support Team</p>";

                                                console.log(Emails)
                                                console.log(body)
                                                SystemEmail.findOne({ where: { IdApp: objAppInfo[0].idApp } }).then(function (objSystemEmail) {
                                                    var mail = {
                                                        from: objSystemEmail.DefaultEmailFrom,
                                                        to: Emails,
                                                        subject: objAppInfo[0].AppName + " " + objConnection1.title,
                                                        html: body
                                                    };
                                                    SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                                        // console.log("################################# Email ###########################################")
                                                        // console.log(EmailSettingCreated)
                                                    })
                                                })
                                            }
                                        }
                                    }
                                })
                                // }

                            });
                        })
                    }
                });


            });
        }
    } catch (ex) {
        console.log("Error Alarm Data = " + line);
    }
};

// send email notification for Alarm
global.SendEmailNotification = function (objConnection) {
    client.get(objConnection.DeviceId + "EmailNotificationSend", function (err, UserEmailStatus) {
        if (!err) {
            if (UserEmailStatus != null && UserEmailStatus != undefined && UserEmailStatus != '' && UserEmailStatus != 'null' && UserEmailStatus != 'undefined') {
                if (UserEmailStatus == 'true') {
                    connection.query("SELECT tu.id,tu.idApp, tu.username,tu.email,tu.Notification, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objConnection.UserId, function (err, objAppInfo, fields) {
                        notifyMe(objConnection)
                        var Emails = objAppInfo[0].email;
                        var body = '<p>Dear Valued Customer,</p>' +
                            "<p>It&#39;s an information E-mail.</p>" +
                            "<p>" + objConnection.Message + "</p>" +
                            "<p>Click on the below link to view vehicle alert live location: <br />" +
                            "<a href='http://maps.google.com/maps?q=" + objConnection.Latitude + "," + objConnection.Longitude + "' target='_blank'>http://maps.google.com/maps?q=" + objConnection.Latitude + "," + objConnection.Longitude + "</a></p>" +
                            "<p>Thanks</p>" +
                            "<p>Sincerely,<br />" +
                            objAppInfo[0].AppName + " Support Team</p>";

                        SystemEmail.findOne({ where: { IdApp: objAppInfo[0].idApp } }).then(function (objSystemEmail) {
                            var mail = {
                                from: objSystemEmail.DefaultEmailFrom,
                                to: Emails,
                                subject: objAppInfo[0].AppName + " " + objConnection.title,
                                html: body
                            };
                            SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                // console.log("################################# Email ###########################################")
                                // console.log(EmailSettingCreated)
                            })
                        })
                    });
                }
            }
        }
    })
}

function notifyMe(o) {
    var title = '';
    var Message = '';
    if (o.AlarmCode == '04') {
        title = 'Vehicle ' + o.Name + ' Speed alert';
        Message = "We would like to inform you that your vehicle " + o.Name + " reached over speed."
    } else if (o.AlarmCode == '03') {
        title = 'Vehicle ' + o.Name + ' Door open alert';
        Message = "We would like to notify you that a Door open alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '10') {
        title = 'Vehicle ' + o.Name + ' Low battery alert';
        Message = "We would like to notify you that a Low battery alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '11') {
        title = 'Vehicle ' + o.Name + ' Max Speed alert';
        Message = "We would like to inform you that your vehicle " + o.Name + " reached max speed."
    } else if (o.AlarmCode == '12') {
        title = 'Vehicle ' + o.Name + ' Movement watch alert';
        Message = "We would like to notify you that a Movement alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '6') {
        title = 'Vehicle ' + o.Name + ' Fence alert';
        Message = "We would like to inform you that your vehicle " + o.Name + " is " + o.FenceName + " Fence IN.";
    } else if (o.AlarmCode == '66') {
        title = 'Vehicle ' + o.Name + ' Fence alert';
        Message = "We would like to inform you that your vehicle " + o.Name + " is " + o.FenceName + " Fence OUT."
    } else if (o.AlarmCode == '30') {
        title = 'Vehicle ' + o.Name + ' Vibration alert';
        Message = "We would like to notify you that a Vibration alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '50') {
        title = 'Vehicle ' + o.Name + ' External power cut alert';
        Message = "We would like to notify you that an External power cut alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '05') {
        title = 'Vehicle ' + o.Name + ' Original triggering alert';
        Message = "We would like to notify you that an Original triggering alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '02') {
        title = 'Vehicle ' + o.Name + ' Line broken alert';
        Message = "We would like to notify you that a Line broken alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '52') {
        title = 'Vehicle ' + o.Name + ' Veer report alert';
        Message = "We would like to notify you that a Veer report alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '60') {
        title = 'Vehicle ' + o.Name + ' Fuel driving alert';
        Message = "We would like to notify you that a Fuel driving alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '71') {
        title = 'Vehicle ' + o.Name + ' Crash alert';
        Message = "We would like to notify you that a Crash alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '72') {
        title = 'Vehicle ' + o.Name + ' Acceleration alert';
        Message = "We would like to notify you that an Acceleration alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '81') {
        title = 'Vehicle ' + o.Name + ' Fuel theft  alert';
        Message = "We would like to notify you that a Fuel theft alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '04') {
        title = 'Vehicle ' + o.Name + ' Engine ON alert';
        Message = "We would like to notify you that an Engine ON alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '08') {
        title = 'Vehicle ' + o.Name + ' Ignition alert';
        Message = "We would like to notify you that an Ignition ON alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '07') {
        title = 'Vehicle ' + o.Name + ' Ignition  alert';
        Message = "We would like to notify you that an Ignition Off alert was detected on your vehicle " + o.Name + ".";
    } else if (o.AlarmCode == '84') {
        title = 'Vehicle ' + o.Name + ' Idle  alert';
        Message = "We would like to notify you that your vehicle " + o.Name + " is Idle from last " + o.Time + " minute.";
    }
    o.title = title;
    o.Message = Message;
}

//Command9901 - CAN-BUS Command
global.Command9901 = function (objCanbusData, Callback) {
    io.sockets.emit(objCanbusData.DeviceId + 'canbusdata', JSON.stringify(objCanbusData));
};

//Command9902 -  Driving Behavior Command
global.Command9902 = function (objDrivingData, Callback) {
    io.sockets.emit(objDrivingData.DeviceId + 'drivingdata', JSON.stringify(objDrivingData));
};


//Send Speed Data
router.get('/SendSpeedData', function (req, res) {
    req.setTimeout(3600000);
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.Speed = req.query.Speed;
    SendSpeedData(obj, function (data) {
        res.json(data);
    })
})

//Send Speed Data
global.SendSpeedData = function (objdata, Callback) {
    var DeviceId = objdata.DeviceId;
    var Speed = ('00' + decimalToHexString(parseInt(objdata.Speed) / 10)).slice(-2);
    var Data = "40400012" + DeviceId + "4105" + Speed;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4105') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set MaxSpeed=" + objdata.Speed + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            //Update Max Speed in Redis
                            CommonFunction.UpdateVehicleRedis(DeviceId, 'Vehicle');
                            funAuditLog.CreateAuditLog('Speed Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') max speed (' + objdata.Speed + ') setting at (time:' + convertdateformat(new Date()) + ').');
                            Callback({ success: true, message: 'Speed Settings Save Successfully.' });
                        });
                    } else {
                        Callback({ success: false, message: 'Speed Settings could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Speed Settings could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Send Movement Data
router.get('/SendMovementData', function (req, res) {
    req.setTimeout(3600000);
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.Movement = req.query.Movement;
    SendMovementData(obj, function (data) {
        res.json(data);
    })
})

//Send Movement Data
global.SendMovementData = function (objdata, Callback) {
    var DeviceId = objdata.DeviceId;
    var Movement = ('00' + objdata.Movement).slice(-2);
    var Data = "40400012" + DeviceId + "4106" + Movement;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4106') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill client after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set Movement=" + objdata.Movement + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            funAuditLog.CreateAuditLog('Movement Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') Movement Setting at (time:' + convertdateformat(new Date()) + ').');
                            Callback({ success: true, message: 'Movement Settings Save Successfully.' });
                        });
                    } else {
                        Callback({ success: false, message: 'Movement Settings could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Movement Settings could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Get Current Location
router.get('/GetCurrentLocation', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "4101";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9955') {
                    console.log('Received: ' + line);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    res.json({ success: true, message: 'Current Location Received Successfully.' });
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Current Location could not Received. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

router.get('/SendCommandToDevice', function (req, res) {
    var lstDevice = req.query.objDevice;
    var objDevice = [];
    if (Array.isArray(lstDevice)) {
        objDevice = lstDevice;
    } else {
        objDevice.push(lstDevice);
    }

    function uploader(i) {
        if (i < objDevice.length) {
            var objMaxSpeed = new Object();
            objMaxSpeed.DeviceId = objDevice[i];
            objMaxSpeed.Speed = req.query.MaxSpeed;
            SendSpeedData(objMaxSpeed, function (data) { })

            var objSleepMode = new Object();
            objSleepMode.DeviceId = objDevice[i];
            objSleepMode.SleepMode = req.query.SleepMode;
            SetSleepMode(objSleepMode, function (data) { })

            var objGPRSInterval = new Object();
            objGPRSInterval.DeviceId = objDevice[i];
            objGPRSInterval.TimeInterval = req.query.TimeInterval;
            SetGPRSInterval(objGPRSInterval, function (data) { })

            var objArm = new Object();
            objArm.DeviceId = objDevice[i];
            objArm.Arm = req.query.Arm;
            SetArmSettings(objArm, function (data) { })

            var objOdoMeter = new Object();
            objOdoMeter.DeviceId = objDevice[i];
            objOdoMeter.odometer = req.query.odometer;
            SetOdometerSetting(objOdoMeter, function (data) { })

            var objHeartbeatInterval = new Object();
            objHeartbeatInterval.DeviceId = objDevice[i];
            objHeartbeatInterval.TimeInterval = req.query.HeartbeatInterval;
            SetHeartBeatInterval(objHeartbeatInterval, function (data) { })

            var objGPRSStopInterval = new Object();
            objGPRSStopInterval.DeviceId = objDevice[i];
            objGPRSStopInterval.TimeInterval = req.query.GPRSStopInterval;
            SetGPRSIntervalStopCar(objGPRSStopInterval, function (data) { })

            var objACC = new Object();
            objACC.DeviceId = objDevice[i];
            objACC.TimeInterval = req.query.ACC;
            SetACCSetting(objACC, function (data) { uploader(i + 1); })

        } else {
            res.json({ success: true, message: 'Default value send to device successfully.' });
        }
    }
    uploader(0);
})

//Set GPRS Interval Settings
router.get('/SetGPRSInterval', function (req, res) {
    req.setTimeout(3600000);
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.TimeInterval = req.query.TimeInterval;
    SetGPRSInterval(obj, function (data) {
        res.json(data);
    })
})

//Set GPRS Interval Settings
global.SetGPRSInterval = function (objdata, Callback) {
    var DeviceId = objdata.DeviceId;
    var TimeInterval = ('0000' + decimalToHexString(parseInt(objdata.TimeInterval) / 10)).slice(-4);
    var Data = "40400013" + DeviceId + "4102" + TimeInterval;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4102') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set GPRSInterval=" + objdata.TimeInterval + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            funAuditLog.CreateAuditLog('GPRS Interval Settings', null, 'Change vehicle (DeviceId:' + DeviceId + ') GPRS Interval Settings at (time:' + convertdateformat(new Date()) + ').');
                            Callback({ success: true, message: 'GPRS Interval Settings Save Successfully.' });
                        });
                    } else {
                        Callback({ success: false, message: 'GPRS Interval Settings could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'GPRS Interval Settings could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Factory Restet
router.get('/FectoryReset', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "4110";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4110') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        res.json({ success: true, message: 'Factory Reset Successfully.' });
                    } else {
                        res.json({ success: false, message: 'Could Not factory Reset. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Could Not factory Reset. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Reboot Device
router.get('/RebootDevice', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "4902";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4902') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        res.json({ success: true, message: 'Device Reboot Successfully.' });
                    } else {
                        res.json({ success: false, message: 'Could Not Reboot Device. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Could Not Reboot Device. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Set Sleep Mode Settings
router.get('/SetSleepMode', function (req, res) {
    req.setTimeout(3600000);
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.SleepMode = req.query.SleepMode;
    SetSleepMode(obj, function (data) {
        res.json(data);
    })
})

//Set Sleep Mode
global.SetSleepMode = function (objdata, Callback) {
    var DeviceId = objdata.DeviceId;
    var SleepMode = ('00' + decimalToHexString(parseInt(objdata.SleepMode))).slice(-2);
    var Data = "40400012" + DeviceId + "4113" + SleepMode;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4113') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set SleepMode=" + objdata.SleepMode + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            funAuditLog.CreateAuditLog('Sleep Mode Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') Sleep Mode Setting at (time:' + convertdateformat(new Date()) + ').');
                            Callback({ success: true, message: 'Sleep Mode Save Successfully.' });
                        });
                    } else {
                        Callback({ success: false, message: 'Sleep Mode could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Sleep Mode could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Set Output Control Settings
router.get('/SetOutputControl', function (req, res) {
    req.setTimeout(3600000);
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
        funAuditLog.CreateAuditLog('Relay Setting', null, 'Change vehicle (DeviceId:' + req.query.DeviceId + ') Relay Setting at (time:' + convertdateformat(new Date()) + ').');
    }
    if (req.query.Siren != undefined) {
        BSiren = req.query.Siren;
        if (updateQuery == "") {
            updateQuery += "Siren=" + req.query.Siren;
        } else {
            updateQuery += ", Siren=" + req.query.Siren;
        }
        funAuditLog.CreateAuditLog('Siren Setting', null, 'Change vehicle (DeviceId:' + req.query.DeviceId + ') Siren Setting at (time:' + convertdateformat(new Date()) + ').');
    }
    if (req.query.UserDefined != undefined) {
        CUserDefined = req.query.UserDefined;
        if (updateQuery == "") {
            updateQuery += "UserDefined=" + req.query.UserDefined;
        } else {
            updateQuery += ", UserDefined=" + req.query.UserDefined;
        }
        funAuditLog.CreateAuditLog('User Defined setting', null, 'Change vehicle (DeviceId:' + req.query.DeviceId + ') User Defined Setting at (time:' + convertdateformat(new Date()) + ').');
    }
    if (req.query.DoorLock != undefined) {
        DDoorLock = req.query.DoorLock;
        if (updateQuery == "") {
            updateQuery += "DoorLock =" + req.query.DoorLock;
        } else {
            updateQuery += ", DoorLock =" + req.query.DoorLock;
        }
        funAuditLog.CreateAuditLog('Door Lock setting', null, 'Change vehicle (DeviceId:' + req.query.DeviceId + ') User Door Lock Setting at (time:' + convertdateformat(new Date()) + ').');
    }
    if (req.query.DoorUnlock != undefined) {
        EDoorUnlock = req.query.DoorUnlock;
        if (updateQuery == "") {
            updateQuery += "DoorUnlock=" + req.query.DoorUnlock;
        } else {
            updateQuery += ", DoorUnlock=" + req.query.DoorUnlock;
        }
        funAuditLog.CreateAuditLog('Door Unlock setting', null, 'Change vehicle (DeviceId:' + req.query.DeviceId + ') User Door Unlock Setting at (time:' + convertdateformat(new Date()) + ').');
    }
    var ABCDE = ('00' + decimalToHexString(parseInt(ARelay))).slice(-2) + ('00' + decimalToHexString(parseInt(BSiren))).slice(-2) + ('00' + decimalToHexString(parseInt(CUserDefined))).slice(-2) + ('00' + decimalToHexString(parseInt(DDoorLock))).slice(-2) + ('00' + decimalToHexString(parseInt(EDoorUnlock))).slice(-2);
    var Data = "40400016" + DeviceId + "4114" + ABCDE;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4114') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set " + updateQuery + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            if (updateQuery.indexOf("Relay=") >= 0) {
                                client.set(DeviceId + "Relay", parseInt(ARelay), function (err, replies) { });
                            }
                            res.json({ success: true, message: 'Setting Save Successfully.' });
                        });
                    } else {
                        res.json({ success: false, message: 'Setting could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Setting could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Set Arm Settings
router.get('/SetArmSettings', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    if (req.query.Arm == '2' || req.query.Arm == 2) {
        var obj = new Object();
        obj.DeviceId = DeviceId;
        obj.Arm = req.query.Arm;
        connection.query("Update tblvehicle set Arm=" + obj.Arm + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
            //UpdateArm Mode in Redis
            CommonFunction.UpdateVehicleRedis(DeviceId, 'Vehicle');
            var Startdate = new Date();
            var convertDate = convertdateformatForUnix(Startdate);
            var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
            //----------------call redix server data--------------------------
            client.get(DeviceId, function (err, response) {
                if (!err && response != null && response != '' && response != undefined) {
                    response = JSON.parse(response);
                    if (response.IsEngine == 1) {
                        obj.ArmStatus = 0;
                    } else {
                        obj.ArmStatus = 1;
                    }
                    SetArmSettings(obj, function (data) { });
                    funAuditLog.CreateAuditLog('Arm Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') Arm Setting at (time:' + convertdateformat(new Date()) + ').');
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
        SetArmSettings(obj, function (data) {
            res.json(data);
        })
    }
})

//Set Arm Settings
global.SetArmSettings = function (objdata, Callback) {
    var Arm = ('00' + decimalToHexString(parseInt(objdata.ArmStatus))).slice(-2);
    var DeviceId = objdata.DeviceId;
    var Data = "40400012" + DeviceId + "4116" + Arm;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4116') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill client after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set Arm=" + objdata.Arm + ", LastArmSetting=" + objdata.ArmStatus + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            //Update Arm Setting in Redis
                            CommonFunction.UpdateVehicleRedis(DeviceId, 'Vehicle');
                            funAuditLog.CreateAuditLog('Arm Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') Arm Setting at (time:' + convertdateformat(new Date()) + ').');
                            Callback({ success: true, message: 'Arm Settings Save Successfully.' });
                        });
                    } else {
                        Callback({ success: false, message: 'Arm Settings could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Arm Settings could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Set GPRS Interval Settings When Car in Stop
router.get('/SetGPRSIntervalStopCar', function (req, res) {
    req.setTimeout(3600000);
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.TimeInterval = req.query.TimeInterval;
    SetGPRSIntervalStopCar(obj, function (data) {
        res.json(data);
    })
})

//Set GPRS Interval Settings When Car in Stop
global.SetGPRSIntervalStopCar = function (objdata, Callback) {
    var DeviceId = objdata.DeviceId;
    var TimeInterval = ('0000' + decimalToHexString(parseInt(objdata.TimeInterval) / 10)).slice(-4);
    var Data = "40400013" + DeviceId + "4126" + TimeInterval;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4126') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set GPRSStopInterval=" + objdata.TimeInterval + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            funAuditLog.CreateAuditLog('GPRS Interval Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') GPRS Interval Setting at (time:' + convertdateformat(new Date()) + ').');
                            Callback({ success: true, message: 'GPRS Interval Settings for Stop Car Save Successfully.' });
                        });
                    } else {
                        Callback({ success: false, message: 'GPRS Interval Settings for Stop Car could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'GPRS Interval Settings for Stop Car could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Set TimeZone Settings
router.get('/SetTimeZone', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var TimeInterval = a2hex(req.query.TimeZone);
    var Data = "";
    if (parseInt(req.query.TimeZone) < 0) {
        Data = "40400015" + DeviceId + "4132" + TimeInterval;
    } else {
        Data = "40400014" + DeviceId + "4132" + TimeInterval;
    }
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4132') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set TimeZone=" + req.query.TimeZone + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            res.json({ success: true, message: 'TimeZone Save Successfully.' });
                        });
                    } else {
                        res.json({ success: false, message: 'TimeZone could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'TimeZone could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Set Initial ODOmeter Settings
router.get('/SetOdometerSetting', function (req, res) {
    req.setTimeout(3600000);
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.odometer = req.query.odometer;
    SetOdometerSetting(obj, function (data) {
        res.json(data);
    })
})

//Set Initial ODOmeter Settings
global.SetOdometerSetting = function (objdata, Callback) {
    var DeviceId = objdata.DeviceId;
    var odometer = a2hex(objdata.odometer);
    var datalength = 8;
    var Data = DeviceId + "4145" + odometer;
    datalength = datalength + (Data.length / 2);
    Data = "4040" + ('0000' + datalength.toString(16)).slice(-4) + Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4145') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set OdoMeter=" + objdata.odometer + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            funAuditLog.CreateAuditLog('Odometer Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') Odometer Setting at (time:' + convertdateformat(new Date()) + ').');
                            Callback({ success: true, message: 'Odometer settings Save Successfully.' });
                        });
                    } else {
                        Callback({ success: false, message: 'Odometer settings could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Odometer settings could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Set Initial ACC Settings
router.get('/SetACCSetting', function (req, res) {
    req.setTimeout(3600000);
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.ACC = req.query.ACC;
    SetACCSetting(obj, function (data) {
        res.json(data);
    })
})

//Set Initial ACC Settings
global.SetACCSetting = function (objdata, Callback) {
    var DeviceId = objdata.DeviceId;
    var ACC = a2hex(objdata.ACC.toString());
    var commandlength = ('0000' + (17 + (ACC.length / 2)).toString()).slice(-4);
    var Data = "4040" + commandlength + DeviceId + "4148" + ACC;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4148') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set ACC=" + objdata.ACC + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            funAuditLog.CreateAuditLog('ACC Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') ACC Setting at (time:' + convertdateformat(new Date()) + ').');
                            Callback({ success: true, message: 'ACC settings Save Successfully.' });
                        });
                    } else {
                        Callback({ success: false, message: 'ACC settings could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'ACC settings could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Set HeartBeat Interval Settings
router.get('/SetHeartBeatInterval', function (req, res) {
    req.setTimeout(3600000);
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.TimeInterval = req.query.TimeInterval;
    SetHeartBeatInterval(obj, function (data) {
        res.json(data);
    })
})

//Set HeartBeat Interval Settings
global.SetHeartBeatInterval = function (objdata, Callback) {
    var packetLength = 17;
    var DeviceId = objdata.DeviceId;
    var TimeInterval = a2hex(objdata.TimeInterval);
    packetLength = packetLength + (TimeInterval.length / 2);
    var Data = "4040" + ('0000' + packetLength.toString(16)).slice(-4) + DeviceId + "5119" + TimeInterval;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '5119') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        connection.query("Update tblvehicle set HeartbeatInterval=" + objdata.TimeInterval + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                            funAuditLog.CreateAuditLog('HeartBeat Interval Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') HeartBeat Interval Setting at (time:' + convertdateformat(new Date()) + ').');
                            Callback({ success: true, message: 'HeartBeat Interval Settings Save Successfully.' });
                        });
                    } else {
                        Callback({ success: false, message: 'HeartBeat Interval Settings could not save. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'HeartBeat Interval Settings could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Clear data Logger
router.get('/ClearDataLogger', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "5503";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '5503') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        res.json({ success: true, message: 'Data Logger Clear Successfully.' });
                    } else {
                        res.json({ success: false, message: 'Data Logger could not Clear. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Data Logger could not Clear. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Clear data Logger
router.get('/GetFirmWareVersion', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "9001";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
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
                    socketclient.destroy(); // kill socketclient after server's response
                    res.json({ success: true, message: 'Firmware Version get Successfully.', data: objFirmware });
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'could not get Firmware Version. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Read GPRS Time Interval
router.get('/ReadGPRSTimeInterval', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "9002";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9002') {
                    console.log('Received: ' + line);
                    var GPRSTimeIntervaldata = line.substring(26, 30);
                    var GPRSTimeInterval = parseInt(GPRSTimeIntervaldata, 16) * 10;
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    res.json({ success: true, message: 'GPRS Time Interval Retrive Successfully.', data: GPRSTimeInterval });
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'could not get GPRS Time Interval. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Read Trouble Code
router.get('/ReadTroubleCode', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "9903";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9903') {
                    console.log('Received: ' + line);
                    var TroubleCodehex = line.substring(26, line.length - 8);
                    var TroubleCode = hex2a(TroubleCodehex);
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: true, message: 'Trouble Code Retrive Successfully.', data: TroubleCode });
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'could not get Trouble Code. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Clear Trouble Code
router.get('/ClearTroubleCode', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "9904";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9904') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy();
                    if (StatusCode == '01') {
                        res.json({ success: true, message: 'Trouble Code clear successfully.' });
                    } else {
                        res.json({ success: false, message: 'Can Not Clear Trouble Code. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Can Not Clear Trouble Co. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Read VIN Code
router.get('/ReadVINCode', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "9905";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '9905') {
                    console.log('Received: ' + line);
                    var VINCodehex = line.substring(26, line.length - 8);
                    var VINCode = hex2a(VINCodehex);
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: true, message: 'VIN Code Retrive Successfully.', data: VINCode });
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'could not get VIN Code. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Read RFID Tags
router.get('/ReadRFIDTags', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    var Data = "40400011" + DeviceId + "4170";
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4170') {
                    console.log('Received: ' + line);
                    var RFIDTagshex = line.substring(26, line.length - 8);
                    var RFIDTags = hex2a(RFIDTagshex);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    res.json({ success: true, message: 'RFID Tags Retrive Successfully.', data: RFIDTags });
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'could not get RFID Tags. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Minitor Voice
router.get('/MonitorVoice', function (req, res) {
    req.setTimeout(3600000);
    var packetLength = 17;
    var DeviceId = req.query.DeviceId;
    var Phone = req.query.Phone;
    var PhoneHex = a2hex(Phone);
    packetLength = packetLength + (PhoneHex.length / 2);
    var Data = "4040" + ('0000' + packetLength.toString(16)).slice(-4) + DeviceId + "4130" + PhoneHex;
    Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '2424' && line.substring(22, 26) == '4130') {
                    console.log('Received: ' + line);
                    var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode == '01') {
                        res.json({ success: true, message: 'Monitor Voice Successfully. You will receive Call soon.' });
                    } else {
                        res.json({ success: false, message: 'Monitor Voice could not retrive. Try again later.' });
                    }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Monitor Voice could not retrive. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
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

module.exports = router