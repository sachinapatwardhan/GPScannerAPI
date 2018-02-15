var router = express.Router();
var Route = models.tblroute;
var RouteDevice = models.tblroutedevice;
var User = models.tbluserinformation;
var RouteMarker = models.tblroutemarker;

router.get('/GetAllRouteByUserId', function(req, res) {
    console.log(req.query)
    var search = {};
    if (req.query.UserId != null && req.query.UserId != undefined && req.query.UserId != '') {
        search['$and'] = [];
        var obj = new Object();
        obj['UserId'] = {
            $eq: req.query.UserId
        };
        search['$and'].push(obj);
    }
    if (req.query.Id != null && req.query.Id != undefined && req.query.Id != '') {
        search['$and'] = [];
        var obj = new Object();
        obj['Id'] = {
            $eq: req.query.Id
        };
        search['$and'].push(obj);
    }
    Route.hasMany(RouteDevice, {
        foreignKey: {
            name: 'IdRoute',
            allowNull: false
        }
    });
    Route.hasMany(RouteMarker, {
        foreignKey: {
            name: 'IdRoute',
            allowNull: true
        }
    });
    Route.findAll({
        where: search,
        include: [{
            model: RouteDevice,
        }, {
            model: RouteMarker,
        }],
        order: 'CreatedDate desc'
    }).then(function(response) {
        res.json(response)
    })
})


router.post('/SaveRoutePlan', jsonParser, function(req, res) {

    objRoute = req.body.objRoute;
    var Deviceidlist = [];
    Deviceidlist = req.body.selectedlist;
    var MarkerPinList = req.body.objMarkerPin;
    console.log(req.body)

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
                if (objRoute.Id == 0) {
                    objRoute.CreatedDate = new Date();
                    Route.create(objRoute).then(function(routerCreated) {
                        if (routerCreated) {
                            console.log("@@@@@@@@@@@@@@@...", routerCreated.Id)
                            console.log(Deviceidlist)
                            if (Deviceidlist.length > 0) {
                                var colllist = [];
                                for (var i = 0; i < Deviceidlist.length; i++) {
                                    var colldata = [Deviceidlist[i], routerCreated.Id];
                                    colllist.push(colldata);
                                }
                                if (colllist.length > 0) {
                                    connection.query("INSERT INTO tblroutedevice (DeviceId,IdRoute) VALUES ?", [colllist], function(err, routeDeviceCreated, fields) {
                                        if (!err && routeDeviceCreated) {
                                            if (MarkerPinList.length > 0) {
                                                var datalist = [];
                                                for (var i = 0; i < MarkerPinList.length; i++) {
                                                    var colldata = [MarkerPinList[i].MarkerName, MarkerPinList[i].Lat, MarkerPinList[i].Lng, routerCreated.Id];
                                                    datalist.push(colldata);
                                                }
                                                if (datalist.length > 0) {
                                                    connection.query("INSERT INTO tblroutemarker (MarkerName,Lat,Lng,IdRoute) VALUES ?", [datalist], function(err, routePinMarkerCreated, fields) {
                                                        if (!err && routePinMarkerCreated) {
                                                            res.json({ success: true, message: 'Route Plan created successfully...' })
                                                        }
                                                    })
                                                }
                                            } else {
                                                res.json({ success: true, message: 'Route Plan created successfully...' })
                                            }
                                        } else {
                                            res.json({ success: false, message: 'Route Plan not created...' })
                                        }
                                    })
                                }
                            }
                        } else {
                            res.json({ success: false, message: 'Route Plan not created...' })
                        }
                    })
                } else {
                    // console.log(objRoute)
                    // Route.update(objRoute, { where: { Id: objRoute.Id } }).then(function(routerCreated) {
                    //     console.log(routerCreated)
                    //     if (routerCreated) {
                    //         console.log("@@@@@@@@@@@@@@@...", objRoute.Id)
                    if (Deviceidlist.length > 0) {
                        RouteDevice.destroy({ where: { IdRoute: objRoute.Id } }).then(function(deletedDeviceRoute) {
                            if (deletedDeviceRoute) {
                                var colllist = [];
                                for (var i = 0; i < Deviceidlist.length; i++) {
                                    var colldata = [Deviceidlist[i], objRoute.Id];
                                    colllist.push(colldata);
                                }
                                if (colllist.length > 0) {
                                    connection.query("INSERT INTO tblroutedevice (DeviceId,IdRoute) VALUES ?", [colllist], function(err, routeDeviceCreated, fields) {
                                        if (!err && routeDeviceCreated) {
                                            res.json({ success: true, message: 'Route Plan updated successfully..' })
                                        } else {
                                            res.json({ success: false, message: 'Route Plan not updated..' })
                                        }
                                    })
                                }
                            } else {
                                res.json({ success: false, message: 'Route Plan not updated..' })
                            }
                        })
                    } else {
                        res.json({ success: true, message: 'Route Plan updated successfully..' })
                    }
                    //     } else {
                    //         res.json({ success: false, message: 'Route not updated..' })
                    //     }
                    // })
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});


router.post('/updateRoutePlan', jsonParser, function(req, res) {

    objRoute = req.body.objRoute;
    var Deviceidlist = [];
    Deviceidlist = req.body.selectedlist;
    console.log(req.body)
    var MarkerPinList = req.body.objMarkerPin;
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
                if (objRoute.Id != 0) {
                    Route.update(objRoute, { where: { Id: objRoute.Id } }).then(function(routerCreated) {
                        if (routerCreated) {
                            RouteMarker.destroy({ where: { IdRoute: objRoute.Id } }).then(function(deletedRouteMarker) {
                                if (MarkerPinList.length > 0) {
                                    var datalist = [];
                                    for (var i = 0; i < MarkerPinList.length; i++) {
                                        var colldata = [MarkerPinList[i].MarkerName, MarkerPinList[i].Lat, MarkerPinList[i].Lng, objRoute.Id];
                                        datalist.push(colldata);
                                    }
                                    if (datalist.length > 0) {
                                        connection.query("INSERT INTO tblroutemarker (MarkerName,Lat,Lng,IdRoute) VALUES ?", [datalist], function(err, routePinMarkerCreated, fields) {
                                            if (!err && routePinMarkerCreated) {
                                                res.json({ success: false, message: 'Route Plan updated successfully..' })
                                            }
                                        })
                                    } else {
                                        res.json({ success: true, message: 'Route Plan updated successfully..' })
                                    }
                                } else {
                                    res.json({ success: false, message: 'Route Plan updated successfully..' })
                                }
                            })


                        } else {
                            res.json({ success: false, message: 'Route Plan not updated..' })
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


router.get('/DeleteRouteById', function(req, res) {
    console.log(req.query.Id)
    RouteDevice.destroy({
        where: {
            IdRoute: req.query.Id
        }
    }).then(function(FenceDeleted) {
        RouteMarker.destroy({
            where: {
                IdRoute: req.query.Id
            }
        }).then(function(MarkerDeleted) {
            Route.destroy({
                where: {
                    id: req.query.Id
                }
            }).then(function(response) {
                if (response) {

                    res.json({
                        success: true,
                        message: "Route plan removed successfully...",
                        data: response
                    });
                } else {
                    res.json({ success: false, message: 'Route plan not Removed...' });
                }
            })
        })

    })
});



router.post('/SaveRoutemarker', jsonParser, function(req, res) {
    console.log(req.body)
    objRouteMarker = req.body;
    var Deviceidlist = [];
    // Deviceidlist = req.body.selectedlist;
    console.log(req.body)

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
                if (objRouteMarker.Id == 0) {
                    objRouteMarker.CreatedDate = new Date();
                    RouteMarker.create(objRouteMarker).then(function(routerMarkerCreated) {
                        if (routerMarkerCreated) {
                            res.json({ success: true, message: 'Route Marker created successfully..' })
                        } else {
                            res.json({ success: false, message: 'Route Marker not created..' })
                        }
                    })
                } else {
                    RouteMarker.update(objRouteMarker, { where: { Id: objRouteMarker.Id } }).then(function(routerMarkerCreated) {
                        console.log("##########################################")
                        if (routerMarkerCreated) {
                            res.json({ success: true, message: 'Route Marker updated successfully..' })
                        } else {
                            res.json({ success: false, message: 'Route Marker not updated..' })
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


router.get('/DeleteRoutemarker', jsonParser, function(req, res) {

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
                RouteMarker.destroy({ where: { Id: req.query.Id } }).then(function(response) {
                    if (response) {
                        res.json({ success: true, message: 'Route Marker deleted successfully..' })
                    } else {
                        res.json({ success: false, message: 'Route Marker not created..' })
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


module.exports = router