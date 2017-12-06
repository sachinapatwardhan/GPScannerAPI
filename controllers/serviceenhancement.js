var router = express.Router();
var User = models.tbluserinformation;
var ServiceEnhacement = models.tblserviceenhancement;
var ServiceEnhacementType = models.tblserviceenhancementtype;
var Vehicle = models.tblvehicle;
var ServiceEnhancementNotification = models.tblserviceenhancementnotification


//find all serveicetype
router.get('/GetAllServiceEnhacementType', function(req, res) {
    ServiceEnhacementType.findAll().then(function(resType) {
        res.json(resType);
    }).catch(function(resErr) {
        res.json(resErr);
    })
})


router.get('/GetAllServiceData', function(req, res) {
    var offset = (parseInt(req.query.page) * 10);
    ServiceEnhacement.findAll({
        where: {
            DeviceId: req.query.DeviceId,
            idUser: req.query.idUser,
            IsDelete: 0
        },
        offset: offset,
        limit: 10,
        order: 'id DESC'
    }).then(function(ResData) {
        var date = new Date();
        date.setDate(date.getDate() - 1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        for (var i = 0; i < ResData.length; i++) {

            if (ResData[i].Todate < date) {
                ResData[i].dataValues.expiryOn = true;
            } else {
                ResData[i].dataValues.expiryOn = false;
                var timeDiff = Math.abs(ResData[i].Todate.getTime() - date.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                ResData[i].dataValues.Days = diffDays;
            }

        }
        res.json(ResData);
    }).catch(function(err) {
        res.json(err);
    })
})

router.get('/getAllServiceNotification', function(req, res) {
    var offset = (parseInt(req.query.page) * 10);
    // var query = "Select * from tblserviceenhancementnotification tn inner join tblserviceenhancement ts on tn.IdServiceEnhancement = ts.id " +
    //     "where ts.DeviceId ='" + req.query.DeviceId + "' and ts.idUser ='" + req.query.idUser + "'";
    ServiceEnhancementNotification.belongsTo(ServiceEnhacement, {
        foreignKey: {
            name: 'IdServiceEnhancement',
            allowNull: false
        }
    });
    ServiceEnhancementNotification.findAll({
        include: [{
            model: ServiceEnhacement,
            where: {
                DeviceId: req.query.DeviceId,
                idUser: req.query.idUser
            },
        }],
        offset: offset,
        limit: 10,
        order: 'CreatedDate DESC'
    }).then(function(response) {
        res.json(response)
    })

})

router.post('/SaveService', jsonParser, function(req, res) {
    objService = req.body;
    var date = objService.Todate + " GMT"

    var targetTime = new Date(date);
    var lstoffsethour = CurrentOffset.split(":");
    //get the timezone offset from local time in minutes
    var tzDifference = parseFloat(lstoffsethour[0]) * 60 + parseFloat(lstoffsethour[1]);
    //convert the offset to milliseconds, add to targetTime, and make a new Date
    var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);
    objService.Todate = ConvertAlertDate(offsetTime);

    // objService.Todate = ConvertAlertDate(new Date(objService.Todate));

    objHeader = req.headers;
    try {
        var token = getToken(objHeader);
        if (token) {
            var decoded = jwt.decode(token, TokenKey);
            User.findOne({
                where: {
                    username: decoded.username,
                    password: decoded.password
                }
            }).then(function(UserExist) {
                if (UserExist != null) {
                    Vehicle.findOne({
                        where: {
                            DeviceId: objService.DeviceId
                        }
                    }).then(function(ExistDevice) {
                        if (ExistDevice != null) {
                            if (objService.id == 0) {
                                objService.idvehicle = ExistDevice.id;
                                objService.CreatedDate = new Date();
                                objService.CreatedBy = decoded.username;
                                ServiceEnhacement.create(objService).then(function(saveService) {
                                    if (saveService != null) {
                                        res.json({
                                            success: true,
                                            message: 'Service Save Successfully',
                                            err: null
                                        })
                                    }
                                })
                            }
                        } else {
                            res.json({
                                success: true,
                                message: 'No Device Found!',
                                err: null
                            })
                        }
                    })
                } else {
                    res.json(InvalidToken);
                }
            })
        } else {
            res.json(InvalidToken);
        }
    } catch (err) {
        res.json({
            success: false,
            message: '',
            err: err
        })
    }
});


router.get('/DeleteRemiderService', function(req, res) {

    ServiceEnhacement.findOne({
        where: {
            id: req.query.id,
        }
    }).then(function(ServiceEnhacementEixst) {
        if (ServiceEnhacementEixst) {
            ServiceEnhacementEixst.updateAttributes({ IsDelete: 1 }).then(function(response) {
                if (response) {
                    res.json({
                        success: true,
                        message: 'Reminder service deleted Successfully',
                        err: null
                    })
                } else {
                    res.json({
                        success: false,
                        message: 'Reminder service not deleted Successfully',
                        err: null
                    })
                }
            })
        } else {
            res.json({
                success: false,
                message: 'Reminder service not Exist',
                err: null
            })
        }

    }).catch(function(err) {
        res.json(err);
    })
})

router.post('/UpdateReadStatus', jsonParser, function(req, res) {
    objIdList = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                ServiceEnhancementNotification.update({
                    IsRead: 1
                }, {
                    where: { Id: { in: objIdList } }
                }).then(function(response) {
                    io.sockets.emit(UserExist.id + 'UpdateAlertNotification');
                    res.json({ success: true, data: response });
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

//Call Every Day '15:00 Minit'
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 0);


var AddAllServiceNotification = schedule.scheduleJob(rule, function() {
    console.log("Call Alert Notification Every 01:00 Minute", new Date());
    var date = new Date();
    date.setUTCDate((new Date()).getDate() - 1);
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    // console.log("Main date = ", date)

    ServiceEnhacement.belongsTo(Vehicle, {
        foreignKey: {
            name: 'idvehicle',
            allowNull: false
        }
    });

    ServiceEnhacement.findAll({
        where: { Todate: { $gte: date }, IsDelete: 0 },
        include: [{
            model: Vehicle
        }]
    }).then(function(response) {
        if (response) {
            function uploader(i) {
                if (response.length > i) {
                    date1 = new Date();
                    date2 = response[i].Todate;

                    date1.setUTCHours(0);
                    date1.setUTCMinutes(0);
                    date1.setUTCSeconds(0);

                    var timeDiff = date2.getTime() - date1.getTime();
                    var diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
                    if (diffDays == 30 || diffDays == 3 || diffDays == 0 || diffDays == -1) {
                        var obj = new Object();
                        obj.IdServiceEnhancement = response[i].id;
                        obj.CreatedDate = new Date();
                        obj.days = diffDays;
                        obj.IsRead = false;
                        // obj.idvehicle = response[i].tblvehicle.id;
                        ServiceEnhancementNotification.findOrCreate({
                            where: {
                                IdServiceEnhancement: obj.IdServiceEnhancement,
                                days: diffDays
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
                                NewObj.days = diffDays;
                                NewObj.IsRead = false;
                                NewObj.idvehicle = response[i].tblvehicle.id;
                                io.sockets.emit(response[i].tblvehicle.iduser + 'ServiceEnhacementNotification', JSON.stringify(NewObj));

                                var Message = "";

                                if (response[i].Type == 'Car Service') {
                                    Message = "Please get your vehicle " + response[i].tblvehicle.Name + " to the service station.";
                                } else if (response[i].Type == 'Insurance Renewal') {
                                    Message = "Your vehicle " + response[i].tblvehicle.Name + "'s insurance has expired. Renew your insurance.";
                                } else if (response[i].Type == 'Driving Licence Renewal') {
                                    Message = "We're sorry, your license has expired. Renew your driving license.";
                                } else if (response[i].Type == 'Battery Replacement') {
                                    Message = "We're sorry, your license has expired. Renew your driving license.";
                                } else if (response[i].Type == 'PUC Renewal') {
                                    Message = "We're sorry, your PUC for " + response[i].tblvehicle.Name + " has expired. Renew your PUC license.";
                                } else if (response[i].Type == 'Road Tax Renewal') {
                                    Message = "Renew your expired road tax.";
                                } else if (response[i].Type == 'Tyre Replacement') {
                                    Message = "We're sorry, your license has expired. Renew your PUC license.";
                                }

                                //push Notification Send

                                connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + response[i].idUser, function(err, objAppInfo, fields) {
                                    var soundname = "Default";
                                    var AllUser = response[i].idUser.toString();
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

});

function convertdateformat(date) {
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    return ("00" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayDay.toString()).slice(-2);

}

function ConvertAlertDate(today) {


    var sec = today.getUTCSeconds();
    var min = today.getUTCMinutes();
    var hour = today.getUTCHours();

    var year = today.getUTCFullYear();
    var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getUTCDate();

    //return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    return ("0000" + year.toString()).slice(-4) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2) + " " + ("00" + hour.toString()).slice(-2) + ":" + ("00" + min.toString()).slice(-2) + ":" + ("00" + sec.toString()).slice(-2);
}


module.exports = router