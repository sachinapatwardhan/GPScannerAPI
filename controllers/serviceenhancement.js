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
                        message: 'Remider service deleted Successfully',
                        err: null
                    })
                } else {
                    res.json({
                        success: false,
                        message: 'Remider service not deleted Successfully',
                        err: null
                    })
                }
            })
        } else {
            res.json({
                success: false,
                message: 'Remider service not Exist',
                err: null
            })
        }

    }).catch(function(err) {
        res.json(err);
    })
})

//Call Every Day '15:00 Minit'
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 0);


var AddAllServiceNotification = schedule.scheduleJob(rule, function() {
    console.log("Call Every 15:00 Minit");
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    ServiceEnhacement.findAll({ where: { Todate: { $gte: date }, IsDelete: 0 } }).then(function(response) {
        if (response) {
            function uploader(i) {
                if (response.length > i) {
                    date1 = date;
                    date2 = response[i].Todate;

                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (diffDays == 30 || diffDays == 3 || diffDays == 1) {
                        var obj = new Object();
                        obj.IdServiceEnhancement = response[i].id;
                        obj.CreatedDate = new Date();
                        ServiceEnhancementNotification.findOrCreate({
                            where: {
                                IdServiceEnhancement: obj.IdServiceEnhancement
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
                                io.sockets.emit('ServiceEnhacementNotification', JSON.stringify(NewObj));
                            }
                            uploader(i + 1);
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



module.exports = router