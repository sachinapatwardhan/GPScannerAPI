var router = express.Router();
var User = models.tbluserinformation;
var JourneyRoute = models.tbljourneyroute;
var JourneyGPSData = models.tbljourneygpsdata;

router.get('/getAllCompletedJourney', function(req, res) {
    JourneyRoute.findAll({ where: { DeviceId: req.query.DeviceId, UserId: req.query.UserId, IsCompleted: 1, IsDelete: 0 }, order: 'StartTime desc' }).then(function(response) {
        res.json(response)
    })
})


router.get('/GetDeviceJourney', function(req, res) {
    JourneyRoute.findAll({ where: { DeviceId: req.query.DeviceId, EndTime: { $ne: null } }, order: 'StartTime desc' }).then(function(response) {
        res.json(response)
    })
})


router.get('/GetDeviceLastJourney', function(req, res) {
    JourneyRoute.findOne({ where: { DeviceId: req.query.DeviceId, EndTime: { $eq: null } }, order: 'StartTime desc' }).then(function(response) {
        if (response) {
            res.json({ success: true, data: response })
        } else {
            res.json({ success: false, data: response })
        }
    })
})



router.post('/StartJourney', jsonParser, function(req, res) {
    objJourney = req.body;
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
                JourneyRoute.findOne({ where: { DeviceId: objJourney.DeviceId, EndTime: { $eq: null } }, order: 'StartTime desc' }).then(function(JourneyRouteExist) {
                    if (JourneyRouteExist) {
                        JourneyRouteExist.updateAttributes({
                            EndTime: new Date(),
                            ModifieDate: new Date(),
                            ModifiedBy: UserExist.username,
                            JourneyName: objJourney.JourneyName,
                        }).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('update Joureny', UserExist.username, 'Stop Joureny');
                                res.json({ success: true, message: 'Joureny stop successfully..' });
                            } else {
                                res.json({ success: false, message: 'Joureny not stop..' });
                            }
                        })
                    } else {
                        objJourney.StartTime = new Date();
                        objJourney.CreatedDate = new Date();
                        objJourney.CreatedBy = UserExist.username;

                        JourneyRoute.create(objJourney).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('Create Joureny', UserExist.username, 'Start Joureny');
                                res.json({ success: true, message: 'Joureny started successfully..' });
                            } else {
                                res.json({ success: false, message: 'Joureny not started..' });
                            }
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
});



router.get('/deleteJourneyById', function(req, res) {
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
                if (req.query.Id != '' && req.query.Id != null) {

                    JourneyRoute.findOne({
                        where: {
                            id: req.query.Id
                        }
                    }).then(function(JourneyRouteExist) {
                        if (JourneyRouteExist) {
                            JourneyGPSData.destroy({
                                where: {
                                    IdJourneyRoute: req.query.Id
                                }
                            }).then(function(JouryGpsDataDeleted) {
                                JourneyRouteExist.updateAttributes({ IsDelete: 1 }).then(function(response) {
                                    if (response) {
                                        funAuditLog.CreateAuditLog('Delete journey route', UserExist.username, 'Delete journey route');
                                        res.json({
                                            success: true,
                                            message: "journey deleted successfully...",
                                            data: response
                                        });
                                    } else {
                                        res.json({
                                            success: true,
                                            message: "journey not deleted",
                                        });
                                    }
                                })
                            })

                        } else {
                            res.json(RecordNotFound);
                        }

                    })
                } else {
                    res.json({
                        success: false,
                        message: "Select journey To delete",
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


module.exports = router