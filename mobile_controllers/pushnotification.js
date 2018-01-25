var express = require('express'),
    router = express.Router();
var geolib = require("geolib");
//Tables
var PushNotification = models.tblpushnotification;
var User = models.tbluserinformation;

//End of Tables
//------------------(mobile app:-storeDeviceToken)---------------
router.post('/Subscribe', jsonParser, function(req, res) {
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
    }).then(function(PushnotificationExist) {
        if (PushnotificationExist != null) {
            if (objPushNotification.Country) {

                PushnotificationExist.updateAttributes({
                    Country: objPushNotification.Country,
                    PushNotificationId: objPushNotification.PushNotificationId,
                    iduser: objPushNotification.iduser,
                    MessageCount: 0,
                    AppVersion: objPushNotification.AppVersion
                }).then(function(resUpdate) {

                    if (objPushNotification.iduser != 0) {
                        User.findOne({ where: { id: objPushNotification.iduser } }).then(function(userExits) {
                            if (userExits) {
                                var LastLogin = new Date();
                                if (objPushNotification.AppVersion != null && objPushNotification.AppVersion != undefined && objPushNotification.AppVersion != '0.0.0') {
                                    userExits.updateAttributes({ LastLogin: LastLogin, AppVersion: objPushNotification.AppVersion, Platform: objPushNotification.Platform }).then(function(UpdateLastLogin) {})
                                } else {
                                    userExits.updateAttributes({ LastLogin: LastLogin, Platform: objPushNotification.Platform }).then(function(UpdateLastLogin) {})
                                }
                            }
                            res.json({
                                success: true,
                                message: "User Subscribe successfully...",
                                data: resUpdate
                            });
                        })

                    } else {
                        res.json({
                            success: true,
                            message: "User Subscribe successfully...",
                            data: resUpdate
                        });
                    }

                });
            } else {
                PushnotificationExist.updateAttributes({ PushNotificationId: objPushNotification.PushNotificationId, iduser: objPushNotification.iduser, MessageCount: 0, AppVersion: objPushNotification.AppVersion }).then(function(resUpdate) {
                    if (objPushNotification.iduser != 0) {
                        User.findOne({ where: { id: objPushNotification.iduser } }).then(function(userExits) {
                            if (userExits) {
                                var LastLogin = new Date();
                                if (objPushNotification.AppVersion != null && objPushNotification.AppVersion != undefined && objPushNotification.AppVersion != '0.0.0') {
                                    userExits.updateAttributes({ LastLogin: LastLogin, AppVersion: objPushNotification.AppVersion, Platform: objPushNotification.Platform }).then(function(UpdateLastLogin) {})
                                } else {
                                    userExits.updateAttributes({ LastLogin: LastLogin, Platform: objPushNotification.Platform }).then(function(UpdateLastLogin) {})
                                }
                            }
                            res.json({
                                success: true,
                                message: "User Subscribe successfully...",
                                data: resUpdate
                            });
                        })

                    } else {
                        res.json({
                            success: true,
                            message: "User Subscribe successfully...",
                            data: resUpdate
                        });
                    }
                });

            }
        } else {
            PushNotification.create(objPushNotification).then(function(response) {
                if (objPushNotification.iduser != 0) {
                    User.findOne({ where: { id: objPushNotification.iduser } }).then(function(userExits) {
                        if (userExits) {
                            var LastLogin = new Date();
                            if (objPushNotification.AppVersion != null && objPushNotification.AppVersion != undefined && objPushNotification.AppVersion != '0.0.0') {
                                userExits.updateAttributes({ LastLogin: LastLogin, AppVersion: objPushNotification.AppVersion, Platform: objPushNotification.Platform }).then(function(UpdateLastLogin) {})
                            } else {
                                userExits.updateAttributes({ LastLogin: LastLogin, Platform: objPushNotification.Platform }).then(function(UpdateLastLogin) {})
                            }
                        }
                        res.json({
                            success: true,
                            message: "User Subscribe successfully...",
                            data: response
                        });
                    })

                } else {
                    res.json({
                        success: true,
                        message: "User Subscribe successfully...",
                        data: response
                    });
                }
            })
        }
    })
})

//--------------------(mobile & web app):-(login,register, demo)-------------------
router.get('/UpdateUserIdByUdId', function(req, res) {
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
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (req.query.UserType != null && req.query.UserType != undefined && req.query.UserType != '') {
                    PushNotification.findOne({
                        where: {
                            udid: req.query.udid,
                            UserType: req.query.UserType,
                        }
                        // where: searchPushNotification
                    }).then(function(response) {
                        if (response) {
                            response.updateAttributes({ iduser: req.query.UserId, Country: req.query.Country, MessageCount: 0 }).then(function(resUpdate) {
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
                    }).then(function(response) {
                        if (response) {
                            response.updateAttributes({ iduser: req.query.UserId, Country: req.query.Country, MessageCount: 0 }).then(function(resUpdate) {
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

//---------------------(mobile app):- SetAppVersionDetail---------------
router.get('/UpdatePushnotificationCounter', function(req, res) {
    console.log(req.query)
    connection.query("Update tblpushnotification set messagecount=0 where udid='" + req.query.udid + "' and UserType='" + req.query.UserType + "'", function(errupdate, updateresp, fields) {
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


module.exports = router