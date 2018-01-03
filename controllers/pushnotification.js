var express = require('express'),
    router = express.Router();
var geolib = require("geolib");
//Tables
var PushNotification = models.tblpushnotification;
var User = models.tbluserinformation;
var PWANotifications = models.tblpwa_notification_subscription;

//End of Tables

router.post('/Subscribe', jsonParser, function (req, res) {
    objPushNotification = req.body;
    console.log(objPushNotification)
    if (objPushNotification.AppVersion == undefined) {
        objPushNotification.AppVersion = null;
    }
    PushNotification.findOne({
        where: {
            udid: objPushNotification.udid,
            UserType: objPushNotification.UserType
        }
    }).then(function (PushnotificationExist) {
        if (PushnotificationExist != null) {
            if (objPushNotification.Country) {

                PushnotificationExist.updateAttributes({
                    Country: objPushNotification.Country,
                    PushNotificationId: objPushNotification.PushNotificationId,
                    iduser: objPushNotification.iduser,
                    MessageCount: 0,
                    AppVersion: objPushNotification.AppVersion
                }).then(function (resUpdate) {
                    res.json({
                        success: true,
                        message: "User Subscribe successfully...",
                        data: resUpdate
                    });
                });
            } else {
                PushnotificationExist.updateAttributes({ PushNotificationId: objPushNotification.PushNotificationId, iduser: objPushNotification.iduser, MessageCount: 0, AppVersion: objPushNotification.AppVersion }).then(function (resUpdate) {
                    res.json({
                        success: true,
                        message: "User Subscribe successfully...",
                        data: resUpdate
                    });
                });

            }
        } else {
            PushNotification.create(objPushNotification).then(function (response) {
                res.json({
                    success: true,
                    message: "User Subscribe successfully...",
                    data: response
                });
            })
        }
    })
})

router.get('/CheckSubscribe', function (req, res) {
    // objPushNotification = req.body;

    var search = {};
    search['$and'] = [];

    var obj = new Object();
    obj['udid'] = {
        $eq: req.query.deviceId
    };
    search['$and'].push(obj);
    if (req.query.UserType == 'Owner') {
        var obj = new Object();
        obj['UserType'] = {
            $eq: 'Owner'
        };
        search['$and'].push(obj);
    } else {
        var obj = new Object();
        obj['UserType'] = {
            $eq: 'Shop'
        };
        search['$and'].push(obj);
    }

    PushNotification.findOne({
        // where: {
        //     udid: req.query.deviceId,
        //     UserType: req.query.UserType
        // }
        where: search
    }).then(function (obj) {
        if (obj != null) {
            res.json({
                success: false,
                message: "User already Subscribed...",
            });
        } else {
            // PushNotification.create(objPushNotification).then(function(response) {
            // if ((response[1])) {
            res.json({
                success: true,
                message: "User is not Subscribe...",
            });
            // })
        }
    })
})

router.get('/UpdateUserIdByUdId', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);

        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
            // where: search
        }).then(function (UserExist) {
            if (UserExist != null) {
                if (req.query.UserType != null && req.query.UserType != undefined && req.query.UserType != '') {
                    PushNotification.findOne({
                        where: {
                            udid: req.query.udid,
                            UserType: req.query.UserType,
                        }
                        // where: searchPushNotification
                    }).then(function (response) {
                        if (response) {
                            response.updateAttributes({ iduser: req.query.UserId, Country: req.query.Country, MessageCount: 0 }).then(function (resUpdate) {
                                res.json({
                                    success: true,
                                    message: "User Push notification data updated successfully...",
                                    data: response
                                });
                            });
                        } else {
                            res.json(RecordNotFound);
                        }

                    })
                } else {
                    PushNotification.findOne({
                        where: {
                            udid: req.query.udid,
                        }
                        // where: searchPushNotification
                    }).then(function (response) {
                        if (response) {
                            response.updateAttributes({ iduser: req.query.UserId, Country: req.query.Country, MessageCount: 0 }).then(function (resUpdate) {
                                res.json({
                                    success: true,
                                    message: "User Push notification data updated successfully...",
                                    data: response
                                });
                            });
                        } else {
                            res.json(RecordNotFound);
                        }

                    })
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/UpdatePushnotificationCounter', function (req, res) {
    console.log(req.query)
    connection.query("Update tblpushnotification set messagecount=0 where udid='" + req.query.udid + "' and UserType='" + req.query.UserType + "'", function (errupdate, updateresp, fields) {
        res.json({
            success: true,
            message: "User Push notification data updated successfully...",
            data: updateresp
        });
    });

});



function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
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

router.post('/SendPushNotification', jsonParser, function (req, res) {

    objPushNotification = req.body;
    var data = {
        title: objPushNotification.Title,
        message: objPushNotification.Message,
        Fence: 'Default',
        otherfields: {}
    };

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //set Parameter
    req.query['permission'] = "Added";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {

            PushNotification.findAll({ distinct: 'PushNotificationId' }).then(function (response) {
                // console.log(response)

                var groups = u.groupBy(response, function (o) {
                    return o.PushNotificationId;
                });

                var lstGroupData = u.map(groups, function (group, PushNotificationId) {
                    return {
                        PushNotificationId: PushNotificationId,
                        Platform: group[0].Platform,
                        Country: group[0].Country,
                    }
                });

                if (objPushNotification.Country != 'All') {
                    lstGroupData = u.where(lstGroupData, { Country: objPushNotification.Country });
                };
                // console.log(lstGroupData)

                if (lstGroupData.length > 0) {
                    // PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {
                    function SendNotification(i) {
                        if (i < lstGroupData.length) {
                            var deviceIds = [];
                            deviceIds.push(lstGroupData[i].PushNotificationId)
                            //SendNotification(i + 1);
                            // } else {
                            // console.log(deviceIds)
                            var objData = clone(data);
                            if (lstGroupData[i].Platform == 'ios') {
                                objData.title = data.message;
                                objData.message = data.title;
                                if (objData.Fence == 'Fence') {
                                    PushNotificationSettings.apn.defaultData.sound = 'jinglebellssms.caf';
                                } else {
                                    PushNotificationSettings.apn.defaultData.sound = 'default';
                                };
                            };
                            // console.log(response[i].Platform + "_______________________________________________________")
                            // console.log(objData)
                            var objPushNotificationSend = new PushNotifications(PushNotificationSettings);
                            if (deviceIds.length > 0) {

                                objPushNotificationSend.send(deviceIds, objData, function (result) {
                                    // console.log(result);
                                    SendNotification(i + 1);
                                });
                            } else {
                                SendNotification(i + 1);
                            };
                        } else {
                            var currentDatetime = GetCurrentDate();

                            objHeader = req.headers;
                            var token = getToken(objHeader);
                            var UserName = "";
                            if (token) {
                                var decoded = jwt.decode(token, TokenKey);
                                UserName = decoded.username;

                            }

                            var query = "INSERT INTO tblfacebookpostdata (title,message,datetime,flag,Type,SendBy,Country) VALUES ('" + data.title + "','" + data.message + "','" + currentDatetime + "', 1,'Custom','" + UserName + "','" + objPushNotification.Country + "');";
                            connection.query(query, function (err, rows, fields) {
                                res.json({
                                    success: true,
                                    message: "Push Notification send Successfully.",
                                    data: null
                                });
                            });


                        }

                    }
                    SendNotification(0)
                }
            })
        } else {
            res.json(NoAccessPermission);
        }
    });
})

//=====PWA Push Notification===============================

router.post('/PWAsubscribePushNotification', jsonParser, function (req, res) {
    try {
        var objdata = req.body;
        if (objdata.newSub != null && objdata.newSub != undefined && objdata.newSub != '') {
            if (objdata.newSub.endpoint != null && objdata.newSub.endpoint != undefined && objdata.newSub.endpoint != '') {
                var objInsert = new Object();
                objInsert.id = 0;
                objInsert.iduser = parseInt(objdata.iduser);
                objInsert.endpoint = objdata.newSub.endpoint;
                objInsert.auth = objdata.newSub.keys.auth;
                objInsert.p256dh = objdata.newSub.keys.p256dh;
                // Module.findOrCreate({ where: { Module: objModule.Module }, defaults: objModule }).then(function(response) {
                PWANotifications.findOrCreate({ where: { iduser: objInsert.iduser, endpoint: objInsert.endpoint }, defaults: objInsert }).then(function (resCreate) {
                    res.json(true);
                });
            } else {
                res.json(false);
            }
        } else {
            res.json(false);
        }
    } catch (errr) {
        res.json(false);
    }
});

router.post('/PWAUnsubscribePushNotification', jsonParser, function (req, res) {
    try {
        var objdata = req.body;
        if (objdata.endpoint != null && objdata.endpoint != undefined && objdata.endpoint != '' && objdata.iduser != null && objdata.iduser != undefined && objdata.iduser != '') {
            PWANotifications.destroy({
                where: {
                    iduser: parseInt(objdata.iduser),
                    endpoint: objdata.endpoint,
                }
            }).then(function (resDelete) {
                res.json(true);
            });
        } else {
            res.json(false);
        }
    } catch (errr) {
        res.json(false);
    }
});


//=====End PWA Push Notification===============================

module.exports = router