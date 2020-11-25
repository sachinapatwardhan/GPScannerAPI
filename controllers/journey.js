var router = express.Router();
var User = models.tbluserinformation;
var JourneyRoute = models.tbljourneyroute;
var Vehicle = models.tblvehicle;
// var JourneyGPSData = models.tbljourneygpsdata;
var momentz = require('moment-timezone');

// router.get('/getAllCompletedJourneyHistoryById', function(req, res) {
//     var query = "select Id,Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction, DeviceId, IsPatchEngine as IsEngine, OdoMeter, Date from tbljourneygpsdata where IdJourneyRoute=" + req.query.Id;
//     connection.query(query, function(err, lstGPSData, fields) {
//         res.json(lstGPSData);
//     });
// })

router.get('/getAllCompletedJourney', function(req, res) {
    var search = {};
    search['$and'] = [];
    var obj = new Object();
    obj['IsDelete'] = {
        $eq: 0
    };
    search['$and'].push(obj);
    var obj = new Object();
    obj['IsCompleted'] = {
        $eq: 1
    };
    search['$and'].push(obj);
    if (req.query.DeviceId != null && req.query.DeviceId != '' && req.query.DeviceId != undefined) {

        var obj = new Object();
        obj['DeviceId'] = {
            $eq: req.query.DeviceId
        };
        search['$and'].push(obj);
    }
    if (req.query.UserId != null && req.query.UserId != '' && req.query.UserId != undefined) {
        var obj = new Object();
        obj['UserId'] = {
            $eq: req.query.UserId
        };
        search['$and'].push(obj);
    }


    JourneyRoute.belongsTo(User, {
        foreignKey: {
            name: 'UserId',
            allowNull: false
        }
    });

    JourneyRoute.findAll({
        where: search,
        include: [{
            model: User,
        }],
        order: 'StartTime desc'
    }).then(function(response) {
        res.json(response)
    })
})


router.get('/GetDeviceJourney', function(req, res) {
    var search = {};
    search['$and'] = [];
    var obj = new Object();
    obj['IsDelete'] = {
        $eq: 0
    };
    search['$and'].push(obj);
    var obj = new Object();
    obj['EndTime'] = {
        $ne: null
    };
    search['$and'].push(obj);
    if (req.query.DeviceId != null && req.query.DeviceId != '' && req.query.DeviceId != undefined) {

        var obj = new Object();
        obj['DeviceId'] = {
            $eq: req.query.DeviceId
        };
        search['$and'].push(obj);
    }
    if (req.query.UserId != null && req.query.UserId != '' && req.query.UserId != undefined) {
        var obj = new Object();
        obj['UserId'] = {
            $eq: req.query.UserId
        };
        search['$and'].push(obj);
    }

    if (req.query.StartDate != null && req.query.StartDate != '' && req.query.StartDate != undefined) {
        var obj = new Object();
        obj['StartTime'] = {
            $gte: req.query.StartDate
        };
        search['$and'].push(obj);
    }

    if (req.query.EndDate != null && req.query.EndDate != '' && req.query.EndDate != undefined) {
        var obj = new Object();
        obj['StartTime'] = {
            $lte: req.query.EndDate
        };
        search['$and'].push(obj);
    }
    JourneyRoute.belongsTo(Vehicle, {
        foreignKey: 'DeviceId',
        targetKey: 'deviceid',
    });
    JourneyRoute.findAll({ where: search, order: 'StartTime desc', include: [{ model: Vehicle, attributes: ['Name'] }] }).then(function(response) {
        res.json(response)
    })
})

router.get('/GetDeviceLastJourney', function(req, res) {
    var search = {};

    search['$and'] = [];
    var obj = new Object();
    obj['EndTime'] = {
        $eq: null
    };
    search['$and'].push(obj);
    if (req.query.DeviceId != null && req.query.DeviceId != '' && req.query.DeviceId != undefined) {
        var obj = new Object();
        obj['DeviceId'] = {
            $eq: req.query.DeviceId
        };
        search['$and'].push(obj);
    }
    if (req.query.UserId != null && req.query.UserId != '' && req.query.UserId != undefined) {
        var obj = new Object();
        obj['UserId'] = {
            $eq: req.query.UserId
        };
        search['$and'].push(obj);
    }

    JourneyRoute.findOne({ where: search, order: 'StartTime desc' }).then(function(response) {
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
                // [2020-11-24 @ Dino] add for maark journey report service
                io.sockets.emit('AllJourneyHook', {
                    DeviceId: req.body.DeviceId,
                    JourneyStart: req.body.JourneyName === '',
                    JourneyName: req.body.JourneyName,
                    Date: new Date().getTime() / 1000
                });

                var search = {};
                if (objJourney.DeviceId != null && objJourney.DeviceId != '' && objJourney.DeviceId != undefined) {
                    search['$and'] = [];
                    var obj = new Object();
                    obj['DeviceId'] = {
                        $eq: objJourney.DeviceId
                    };
                    search['$and'].push(obj);
                }
                if (objJourney.UserId != null && objJourney.UserId != '' && objJourney.UserId != undefined) {
                    var obj = new Object();
                    obj['UserId'] = {
                        $eq: objJourney.UserId
                    };
                    search['$and'].push(obj);
                }
                var obj = new Object();
                obj['EndTime'] = {
                    $eq: null
                };
                search['$and'].push(obj);
                JourneyRoute.findOne({ where: search, order: 'StartTime desc' }).then(function(JourneyRouteExist) {
                    if (JourneyRouteExist) {
                        JourneyRouteExist.updateAttributes({
                            EndTime: new Date(),
                            ModifieDate: new Date(),
                            ModifiedBy: UserExist.username,
                            JourneyName: objJourney.JourneyName,
                        }).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('update Journey', UserExist.username, 'Stop Journey / DeviceID: (' + JourneyRouteExist.DeviceId + ')');
                                res.json({ success: true, message: 'Journey stop successfully..' });
                            } else {
                                res.json({ success: false, message: 'Journey can not stop. Try again later.' });
                            }
                        })
                    } else {
                        objJourney.StartTime = new Date();
                        objJourney.CreatedDate = new Date();
                        objJourney.CreatedBy = UserExist.username;

                        JourneyRoute.create(objJourney).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('Create Journey', UserExist.username, 'Start Journey / DeviceID: (' + response.DeviceId + ')');
                                res.json({ success: true, message: 'Journey started successfully..' });
                            } else {
                                res.json({ success: false, message: 'Journey can not start. Try again later.' });
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
                            // JourneyGPSData.destroy({
                            //     where: {
                            //         IdJourneyRoute: req.query.Id
                            //     }
                            // }).then(function(JouryGpsDataDeleted) {
                            JourneyRouteExist.updateAttributes({ IsDelete: 1 }).then(function(response) {
                                if (response) {
                                    funAuditLog.CreateAuditLog('Delete journey route', UserExist.username, 'Delete journey route/ DeviceId (' + JourneyRouteExist.DeviceId + ')');
                                    res.json({
                                        success: true,
                                        message: "journey deleted successfully...",
                                        data: response
                                    });
                                } else {
                                    res.json({
                                        success: true,
                                        message: "journey can not delete. Try again later.",
                                    });
                                }
                            })

                            //})

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



router.get('/ExportReport', function(req, res) {
    objTask = req.query;
    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
        caption: 'Date Time',
        type: 'string'
    }, {
        caption: 'Latitude/Longitude',
        type: 'string'
    }, {
        caption: 'Speed',
        type: 'string'
    }, {
        caption: 'GPS Positioning',
        type: 'string'
    }, {
        caption: 'Direction',
        type: 'string'
    }, {
        caption: 'Is Engine',
        type: 'string'
    }];

    var Startdate = req.query.TodayStartDateTime;
    var Enddate = req.query.TodayEndDateTime;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var query = "select Id,Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction, DeviceId,IsPatchEngine as IsEngine, Date from tblgpsdata where deviceid=" + req.query.DeviceId + " and Date >= '" + unixStartdate + "' and Date <= '" + unixEnddate + "' order by Date;"

    connection.query(query, function(err, response) {
        conf.rows = [];

        GetData(0);

        function GetData(i) {
            if (i < response.length) {
                var row = [];
                var Datetime = 'N/A';
                var longitude = 0.00;
                var Longitude = 0.00;
                var Speed = 0.00;
                var GPSPositioning = 'N/A';
                var Direction = 0.00;
                var IsEngine = 'Off';

                if (response[i].Datetime != null && response[i].Datetime != '' && response[i].Datetime != undefined) {
                    // Datetime = dateformat(response[i].Datetime, 2);
                    Datetime = momentz.utc(new Date(response[i].Date * 1000)).tz(objTask.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                }

                if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                    Latitude = response[i].Latitude;
                }
                if (response[i].Longitude != null && response[i].Longitude != '' && response[i].Longitude != undefined) {
                    Longitude = response[i].Longitude;
                }
                if (response[i].GPSPositioning != null && response[i].GPSPositioning != '' && response[i].GPSPositioning != undefined) {
                    GPSPositioning = response[i].GPSPositioning;
                }
                if (response[i].Speed != null && response[i].Speed != '' && response[i].Speed != undefined) {
                    Speed = parseFloat(response[i].Speed).toFixed(2);
                }
                if (response[i].Direction != null && response[i].Direction != '' && response[i].Direction != undefined) {
                    Direction = response[i].Direction;
                }
                if (response[i].IsEngine != null && response[i].IsEngine != '' && response[i].IsEngine != undefined) {
                    if (response[i].IsEngine == 0 || response[i].IsEngine == false) {
                        IsEngine = 'Off';
                    } else {
                        IsEngine = 'On';
                    }
                }
                var latlng = Latitude + "/" + Longitude;
                row.push(Datetime.toString(), latlng, Speed.toString(), GPSPositioning.toString(), Direction.toString(), IsEngine.toString());
                conf.rows.push(row);
                GetData(i + 1);
            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=TrackDetail.xlsx");
                res.end(result, 'binary');
            }
        }
    })
})

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
