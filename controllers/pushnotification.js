var express = require('express'),
    router = express.Router();
var geolib = require("geolib");
//Tables
var PushNotification = models.tblpushnotification;
var User = models.tbluserinformation;
var FacebookPostData = models.tblfacebookpostdata;

//End of Tables





router.post('/Subscribe', jsonParser, function(req, res) {
    objPushNotification = req.body;
    console.log(objPushNotification)
    PushNotification.findOne({
        where: {
            udid: objPushNotification.udid,
            UserType: objPushNotification.UserType
        }
    }).then(function(obj) {
        if (obj != null) {
            obj.updateAttributes({ Country: objPushNotification.Country, PushNotificationId: objPushNotification.PushNotificationId }).then(function(resUpdate) {
                res.json({
                    success: true,
                    message: "User Subscribe successfully...",
                    data: resUpdate
                });
            });
        } else {
            PushNotification.create(objPushNotification).then(function(response) {
                res.json({
                    success: true,
                    message: "User Subscribe successfully...",
                    data: response
                });
            })
        }
    })
})

router.get('/CheckSubscribe', function(req, res) {
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
    }).then(function(obj) {
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
                PushNotification.findOne({
                    where: {
                        udid: req.query.udid,
                    }
                    // where: searchPushNotification
                }).then(function(response) {
                    if (response) {
                        response.updateAttributes({ iduser: req.query.UserId, Country: req.query.Country }).then(function(resUpdate) {
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
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
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

router.post('/SendPushNotification', jsonParser, function(req, res) {

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

    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {

            PushNotification.findAll({ distinct: 'PushNotificationId' }).then(function(response) {
                // console.log(response)

                var groups = u.groupBy(response, function(o) {
                    return o.PushNotificationId;
                });

                var lstGroupData = u.map(groups, function(group, PushNotificationId) {
                    return {
                        PushNotificationId: PushNotificationId,
                        Platform: group[0].Platform,
                        Country: group[0].Country,
                    }
                });

                if (objPushNotification.Country != 'All') {
                    lstGroupData = u.where(lstGroupData, { Country: objPushNotification.Country });
                };
                console.log(lstGroupData)

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

                                objPushNotificationSend.send(deviceIds, objData, function(result) {
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
                            connection.query(query, function(err, rows, fields) {
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


//FacebookPostData

router.get('/GetAllSentFqacebookFeeds', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var objSearch = objParam.search.value;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];
        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                var obj = new Object();
                obj[columnName] = {
                    $like: '%' + objSearch + '%'
                }
                search['$or'].push(obj);
            };
        };
    }

    FacebookPostData.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
    }).then(function(response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function(error) {
        res.json(error);
    })
})



module.exports = router