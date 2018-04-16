var router = express.Router();
var User = models.tbluserinformation;
var ServiceEnhacement = models.tblserviceenhancement;
var ServiceEnhacementType = models.tblserviceenhancementtype;
var Vehicle = models.tblvehicle;
var ServiceEnhancementNotification = models.tblserviceenhancementnotification;
var ServiceEnhancementinCountry = models.tblserviceenhancementincountry;


//find all serveicetype
router.get('/GetAllServiceEnhacementType', function(req, res) {
    ServiceEnhacementType.findAll({ order: 'Type asc' }).then(function(resType) {
        res.json(resType);
    }).catch(function(resErr) {
        res.json(resErr);
    })
})
router.get('/getAllSericeInCountry', function(req, res) {
    ServiceEnhancementinCountry.findAll({ where: { IdServiceEnhancementType: req.query.id } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.post('/SaveServiceType', jsonParser, function(req, res) {
    console.log(req.body)
    objServiceType = req.body;
    objHeader = req.headers;
    console.log(objServiceType)
        //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objServiceType.id == 0) {
                    objServiceType.CreatedDate = new Date();
                    objServiceType.CreatedBy = UserExist.username;

                    ServiceEnhacementType.findOrCreate({ where: { Type: objServiceType.Type }, defaults: objServiceType }).then(function(response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('Save Sevice type', UserExist.username, 'Cerate Sevcie Type');
                            res.json({ success: true, message: "Service Type created successfully...", data: response });
                        } else {
                            res.json({ success: false, message: "Service Type is already Exist...", data: response });
                        }
                    })
                } else {
                    objServiceType.ModifiedDate = new Date();
                    objServiceType.ModifiedBy = UserExist.username;
                    ServiceEnhacementType.findOne({ where: { Type: objServiceType.Type } }).then(function(objSimsExist) {
                        if (objSimsExist != null && objServiceType.id != objSimsExist.id) {
                            res.json({ success: false, message: "Service Type is already Exist...", data: objSimsExist });
                        } else {
                            ServiceEnhacementType.update(objServiceType, { where: { id: objServiceType.id } }).then(function(response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('Update Service Type', UserExist.username, 'Update Service Type');
                                    res.json({ success: true, message: "Service Type updated successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Service Type not updated successfully...", data: response });
                                }
                            })
                        }
                    })
                }
            } else {
                res.json(InvalidToken);
            }
        })
    }
})


router.post('/SaveServiceInCountry', jsonParser, function(req, res) {
    objServiceCountry = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {

                //set Parameter
                req.query['permission'] = "Added";

                var obj = {};
                obj.headers = req.headers;
                obj.query = req.query;

                funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                    var AccessPermission = responseAccessPermission.success;
                    if (AccessPermission) {
                        if (objServiceCountry.Country == 'All') {
                            ServiceEnhancementinCountry.destroy({ where: { IdServiceEnhancementType: objServiceCountry.IdServiceEnhancementType } }).then(function(resposeDelete) {
                                ServiceEnhancementinCountry.create(objServiceCountry).then(function(response) {
                                    if (response) {
                                        funAuditLog.CreateAuditLog('Add Service country', UserExist.username, 'Create Add Service country');
                                        res.json({ success: true, message: "Service add for all country successfully...", data: response });
                                    } else {
                                        res.json({ success: false, message: "Service is already exist in country...", data: response });
                                    }
                                })
                            })


                        } else {
                            ServiceEnhancementinCountry.findOrCreate({ where: { IdServiceEnhancementType: objServiceCountry.IdServiceEnhancementType, Country: objServiceCountry.Country }, defaults: objServiceCountry }).then(function(response) {
                                if ((response[1])) {
                                    funAuditLog.CreateAuditLog('Add Service country', UserExist.username, 'Create Add Service country');
                                    res.json({ success: true, message: "Service add in country successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Service is already exist in country...", data: response });
                                }
                            })
                        }
                    } else {
                        res.json(NoAccessPermission);
                    }
                });
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})



router.get('/DeleteServicefromCountry', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    req.query['permission'] = "Deleted";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {

            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
                    if (UserExist != null) {

                        ServiceEnhancementinCountry.destroy({ where: { IdServiceEnhancementType: req.query.IdServiceEnhancementType, Country: req.query.Country } }).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('Delete Service from country', UserExist.username, 'Delete Service from country');
                                res.json({ success: true, message: "Service remove from country successfully...", data: response });
                            } else {
                                res.json({ success: true, message: "Service not remove from country successfully...", data: response });
                            }
                        })
                    } else {
                        res.json(InvalidToken);
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        } else {
            res.json(NoAccessPermission);
        }
    });
});


router.get('/DeleteSevcieType', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    if (token) {
        var decoded = jwt.decode(token, TokenKey);


        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (req.query.id != '' && req.query.id != null) {

                    ServiceEnhacementType.destroy({
                        where: {
                            id: req.query.id
                        }
                    }).then(function(response) {
                        if (response) {
                            funAuditLog.CreateAuditLog('Delete sevice type', UserExist.username, 'Delete sevice type');
                            res.json({
                                success: true,
                                message: "Sevcie Type deleted successfully...",
                                data: response
                            });
                        } else {
                            res.json(RecordNotFound);
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: "Sevcie Type To delete",
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }

});

router.get('/GetAllServiceEnhacementTypebyCountry', function(req, res) {
    ServiceEnhacementType.hasMany(ServiceEnhancementinCountry, {
        foreignKey: {
            name: 'IdServiceEnhancementType',
            allowNull: false
        }
    });
    ServiceEnhacementType.findAll({
        include: [{
            model: ServiceEnhancementinCountry,
            where: {
                $or: [{ Country: req.query.Country }, { Country: 'All' }]
            }
        }],
    }).then(function(resType) {
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
            // idUser: req.query.idUser,
            IsDelete: 0
        },
        offset: offset,
        limit: 10,
        order: 'id DESC'
    }).then(function(ResData) {
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
                // idUser: req.query.idUser
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
    if (objService.Todate != null) {
        var date = objService.Todate + " GMT"

        var targetTime = new Date(date);
        var lstoffsethour = CurrentOffset.split(":");
        //get the timezone offset from local time in minutes
        var tzDifference = parseFloat(lstoffsethour[0]) * 60 + parseFloat(lstoffsethour[1]);
        //convert the offset to milliseconds, add to targetTime, and make a new Date
        var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);
        objService.Todate = ConvertAlertDate(offsetTime);
    }
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
                            DeviceId: objService.DeviceId,
                        }
                    }).then(function(ExistDevice) {
                        if (ExistDevice != null) {
                            if (objService.id == 0) {
                                ServiceEnhacement.findOne({ where: { DeviceId: objService.DeviceId, Type: objService.Type, IsDelete: 0, IsComplete: 0 } }).then(function(ServiceEnhacementExist) {
                                    if (ServiceEnhacementExist) {
                                        res.json({
                                            success: false,
                                            message: 'Service reminder already created',
                                            err: null
                                        })
                                    } else {
                                        objService.idvehicle = ExistDevice.id;
                                        objService.CreatedDate = new Date();
                                        objService.CreatedBy = decoded.username;
                                        ServiceEnhacement.create(objService).then(function(saveService) {
                                            if (saveService != null) {
                                                funAuditLog.CreateAuditLog('Save Sevice Reminder', UserExist.username, 'Cerate Sevcie Reminder');
                                                res.json({
                                                    success: true,
                                                    message: 'Service Save Successfully',
                                                    err: null
                                                })
                                            }
                                        })
                                    }
                                })
                            } else {
                                objService.idvehicle = ExistDevice.id;
                                objService.ModifiedDate = new Date();
                                objService.ModifiedBy = decoded.username;
                                ServiceEnhacement.findOne({ where: { id: objService.id } }).then(function(ServiceEnhacementExist) {
                                    ServiceEnhacementExist.updateAttributes(objService).then(function(response) {
                                        if (response) {
                                            funAuditLog.CreateAuditLog('Update Sevice Reminder', UserExist.username, 'update Sevcie Reminder');
                                            res.json({
                                                success: true,
                                                message: 'Service reminder updated successfully',
                                                data: response
                                            })
                                        } else {
                                            res.json({
                                                success: false,
                                                message: 'Service reminder not updated successfully',
                                                err: null
                                            })
                                        }
                                    })
                                })
                            }
                        } else {
                            res.json({
                                success: false,
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
                    ServiceEnhacement.findOne({
                        where: {
                            id: req.query.id,
                        }
                    }).then(function(ServiceEnhacementEixst) {
                        if (ServiceEnhacementEixst) {
                            ServiceEnhacementEixst.updateAttributes({ IsDelete: 1, ModifiedDate: new Date(), ModifiedBy: decoded.username }).then(function(response) {
                                if (response) {
                                    funAuditLog.CreateAuditLog('Delete Sevice Reminder', UserExist.username, 'Delete Sevcie Reminder');
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
    // console.log("Call Alert Notification Every 01:00 Minute", new Date());
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
        where: { Todate: { $gte: date }, IsDelete: 0, IsComplete: 0 },
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

                                if (diffDays == 30 || diffDays == 3) {
                                    var RenewDate = moment(new Date(date2));
                                    var RenewDateFormat = RenewDate.format("DD MMMM YYYY");
                                    if (response[i].Type == 'Car Service') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " service due on " + RenewDateFormat + ". Pls get your vehicle serviced.";
                                    } else if (response[i].Type == 'Insurance Renewal') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " insurance will expire on " + RenewDateFormat + ".Pls renew it on time.";
                                    } else if (response[i].Type == 'Driving Licence Renewal') {
                                        Message = "Your driving license will expire on " + RenewDateFormat + ". Pls renew it on time.";
                                    } else if (response[i].Type == 'Battery Replacement') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " battery need replacement before " + RenewDateFormat + ". Pls replace it on time.";
                                    } else if (response[i].Type == 'PUC Renewal') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " PUC will expire on " + RenewDateFormat + ".Pls renew it on time.";
                                    } else if (response[i].Type == 'Road Tax Renewal') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " road tax due on " + RenewDateFormat + ". Pls renew your road tax.";
                                    } else if (response[i].Type == 'Tyre Replacement') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " tyre need replacement before " + RenewDateFormat + ". Pls replace it on time.";
                                    }

                                } else if (diffDays == 0) {
                                    if (response[i].Type == 'Car Service') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " service has due today. Pls get your vehicle serviced.";
                                    } else if (response[i].Type == 'Insurance Renewal') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " insurance has expired today. Pls renew today to avoid uncovered moments.";
                                    } else if (response[i].Type == 'Driving Licence Renewal') {
                                        Message = "Your driving license has expired today. Pls renew today to avoid uncovered moments.";
                                    } else if (response[i].Type == 'Battery Replacement') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " battery need replacement today. Pls replace it.";
                                    } else if (response[i].Type == 'PUC Renewal') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " PUC has expired today. Pls renew today.";
                                    } else if (response[i].Type == 'Road Tax Renewal') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " road tax is due for renewal. Pls renew today to avoid uncovered moments.";
                                    } else if (response[i].Type == 'Tyre Replacement') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " tyre need replacement today. Pls replace it.";
                                    }
                                } else {

                                    if (response[i].Type == 'Car Service') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " need a service. Pls get your vehicle serviced.";
                                    } else if (response[i].Type == 'Insurance Renewal') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " insurance has expired. Pls renew your insurance.";
                                    } else if (response[i].Type == 'Driving Licence Renewal') {
                                        Message = "Your driving license has expired. Pls renew your driving license.";
                                    } else if (response[i].Type == 'Battery Replacement') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " battery need replacement. Get your car battery replaced.";
                                    } else if (response[i].Type == 'PUC Renewal') {
                                        Message = "We're sorry, your PUC for " + response[i].tblvehicle.Name + " has expired. Renew your PUC license.";
                                    } else if (response[i].Type == 'Road Tax Renewal') {
                                        Message = "Your vehicle " + response[i].tblvehicle.Name + " road tax has expired. Pls renew your expired road tax.";
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

});

router.get('/CompleteSevice', function(req, res) {

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
                    ServiceEnhacement.belongsTo(Vehicle, {
                        foreignKey: {
                            name: 'idvehicle',
                            allowNull: false
                        }
                    });
                    ServiceEnhacement.findOne({
                        where: { id: req.query.id },
                        include: [{
                            model: Vehicle
                        }]
                    }).then(function(ServiceEnhacementExist) {
                        if (ServiceEnhacement) {
                            ServiceEnhacementExist.updateAttributes({ IsComplete: 1, ModifiedDate: new Date(), ModifiedBy: decoded.username }).then(function(updatedata) {
                                if (updatedata) {
                                    ServiceEnhacementType.findOne({ where: { Type: updatedata.Type } }).then(function(servicetypeExist) {
                                        if (servicetypeExist) {
                                            var obj = new Object();
                                            obj.IsDelete = 0;
                                            obj.Type = updatedata.Type;
                                            obj.idvehicle = updatedata.idvehicle;
                                            obj.idUser = updatedata.tblvehicle.iduser;
                                            obj.DeviceId = updatedata.DeviceId;
                                            obj.IsActive = updatedata.IsActive;
                                            obj.CreatedBy = updatedata.CreatedBy;
                                            obj.CreatedDate = updatedata.CreatedDate;
                                            obj.Title = updatedata.Title;
                                            if (updatedata.Type == 'Car Service' || updatedata.Type == 'Tyre Replacement') {
                                                obj.Currentkm = req.query.OdoMeter;
                                                obj.Expiredkm = parseInt(req.query.OdoMeter) + servicetypeExist.Month;
                                                obj.WorkShop = updatedata.WorkShop;
                                                obj.ContectNo = updatedata.ContectNo;
                                            } else {
                                                obj.Todate = new Date(updatedata.Todate);
                                                obj.Todate.setMonth(obj.Todate.getMonth() + servicetypeExist.Month);
                                            }

                                            ServiceEnhacement.create(obj).then(function(response) {
                                                if (response) {
                                                    funAuditLog.CreateAuditLog('Create Sevice Reminder', UserExist.username, 'Create Sevcie Reminder');
                                                    res.json({ success: true, message: 'New service reminder created successfully' })
                                                } else {
                                                    res.json({ success: false, message: 'New Service reminder not created successfully' })
                                                }
                                            })
                                        } else {
                                            res.json({ success: false, message: 'Service is not  Exist!' })
                                        }
                                    })
                                } else {
                                    res.json({ success: false, message: 'Service not completed successfully!' })
                                }
                            })
                        } else {
                            res.json({ success: false, message: 'Service reminder not found!' })
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

})

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