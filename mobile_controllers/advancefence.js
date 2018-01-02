var router = express.Router();
var geolib = require("geolib");
var User = models.tbluserinformation;
var AdvanceFence = models.tbladvancefence;
var Fence = models.tblfence;
var PetGPS = models.tblgpsdata;
var Bike = models.tblvehicle;

//-------------------(MobileApp & WebApp):-(Get All Advancefence List data)-----------------------
router.get('/GetAllAdvancefence', function(req, res) {
    AdvanceFence.hasMany(Fence, {
        foreignKey: {
            name: 'IdAdvanceFence',
            allowNull: false
        }
    });

    AdvanceFence.findAll({
        where: {
            UserId: req.query.UserId
        },
        include: [{
            model: Fence,
        }]
    }).then(function(response) {
        if (response != null) {
            res.json({
                success: true,
                message: "Record found...",
                data: response
            });
        } else {
            res.json(RecordNotFound);
        }
    })
})

//-------------------(MobileApp & WebApp):-(Delete Advance fence)-----------------------
router.get('/DeleteFenceById', function(req, res) {
    Fence.destroy({
        where: {
            IdAdvanceFence: req.query.id
        }
    }).then(function(FenceDeleted) {

        AdvanceFence.destroy({
            where: {
                id: req.query.id
            }
        }).then(function(response) {
            if (response) {

                res.json({
                    success: true,
                    message: "Advance fence removed successfully...",
                    data: response
                });
            } else {
                res.json({ success: false, message: 'Advance rence not Removed.' });
            }
        })

    })
});

//-------------------(MobileApp & WebApp):-(save Advance fence)-----------------------
router.post('/SaveFenceByIdNew', jsonParser, function(req, res) {

    objFence = req.body;
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
                var Deviceidlist = objFence.selectedlist;
                AdvanceFence.find({
                    where: {
                        id: objFence.IdAdvanceFence
                    },
                }).then(function(AdvanceFenceExits) {
                    if (AdvanceFenceExits == null) {
                        var objAdvanceFence = new Object()
                        objAdvanceFence.CreatedDate = new Date();
                        objAdvanceFence.name = objFence.name;
                        objAdvanceFence.UserId = UserExist.id;
                        AdvanceFence.create(objAdvanceFence).then(function(AdvanceFenceCreated) {
                            if (AdvanceFenceCreated) {
                                objFence.IdAdvanceFence = AdvanceFenceCreated.id;
                                if (Deviceidlist.length > 0) {
                                    var colllist = [];
                                    for (var i = 0; i < Deviceidlist.length; i++) {
                                        var colldata = [Deviceidlist[i], objFence.name, (objFence.lat).toString(), (objFence.lng).toString(), objFence.fencedraw, objFence.range, objFence.status, objFence.IdAdvanceFence];
                                        colllist.push(colldata);
                                    }
                                    if (colllist.length > 0) {
                                        connection.query("INSERT INTO tblfence (deviceId,name,lat,lng,fencedraw,tblfence.range,status,IdAdvanceFence) VALUES ?", [colllist], function(err, FenceCreated, fields) {
                                            if (!err && FenceCreated) {
                                                var Devicelist = [];

                                                function uploader(m) {
                                                    if (Deviceidlist.length > m) {
                                                        client.get(Deviceidlist[m], function(err, strgpsdata) {

                                                            var response = JSON.parse(strgpsdata);
                                                            if (!err) {
                                                                var IsPetInFence = true
                                                                if (response != null & response != '' && response != undefined) {

                                                                    var CheckPoints = {
                                                                        latitude: parseFloat(response.Latitude),
                                                                        longitude: parseFloat(response.Longitude)
                                                                    }

                                                                    if (objFence.fencedraw == "circle") {
                                                                        var CircleCenterPoints = {
                                                                            latitude: parseFloat(objFence.lat),
                                                                            longitude: parseFloat(objFence.lng)
                                                                        }
                                                                        var CircleRadius = parseFloat(objFence.range);
                                                                        IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                                                    } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                                                                        var lstpolygonDrawC = [];
                                                                        var lstlatC = objFence.lat.split(',');
                                                                        var lstlngC = objFence.lng.split(',');

                                                                        for (var i = 0; i < lstlatC.length; i++) {
                                                                            var objDraw = {
                                                                                latitude: parseFloat(lstlatC[i]),
                                                                                longitude: parseFloat(lstlngC[i])
                                                                            }
                                                                            lstpolygonDrawC.push(objDraw);
                                                                        }
                                                                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                                    } else if (objFence.fencedraw == "rectangle") {
                                                                        var lstpolygonDrawC = [];
                                                                        var lstlatC = objFence.lat.split(',');
                                                                        var lstlngC = objFence.lng.split(',');


                                                                        var objDraw = {
                                                                            latitude: parseFloat(lstlatC[0]),
                                                                            longitude: parseFloat(lstlngC[0])
                                                                        }
                                                                        lstpolygonDrawC.push(objDraw);
                                                                        var objDraw = {
                                                                            latitude: parseFloat(lstlatC[0]),
                                                                            longitude: parseFloat(lstlngC[1])
                                                                        }
                                                                        lstpolygonDrawC.push(objDraw);
                                                                        var objDraw = {
                                                                            latitude: parseFloat(lstlatC[1]),
                                                                            longitude: parseFloat(lstlngC[1])
                                                                        }
                                                                        lstpolygonDrawC.push(objDraw);
                                                                        var objDraw = {
                                                                            latitude: parseFloat(lstlatC[1]),
                                                                            longitude: parseFloat(lstlngC[0])
                                                                        }
                                                                        lstpolygonDrawC.push(objDraw);
                                                                        var objDraw = {
                                                                            latitude: parseFloat(lstlatC[0]),
                                                                            longitude: parseFloat(lstlngC[0])
                                                                        }
                                                                        lstpolygonDrawC.push(objDraw);

                                                                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                                    };
                                                                    if (IsPetInFence == false) {
                                                                        Devicelist.push(response.DeviceId);
                                                                    }
                                                                }
                                                                objFence.IsInFence = IsPetInFence;
                                                                uploader(m + 1);
                                                            }
                                                        })
                                                    } else {
                                                        if (Devicelist.length > 0) {
                                                            connection.query("UPDATE tblfence set IsInFence=false where IdAdvanceFence='" + AdvanceFenceCreated.id + "' and  deviceId in (" + [Devicelist] + ');', function(err, resUpdate, fields) {
                                                                res.json({
                                                                    success: true,
                                                                    message: "Advance fence created successfully...",
                                                                    data: resUpdate
                                                                });

                                                            })
                                                        } else {
                                                            res.json({
                                                                success: true,
                                                                message: "Advance fence created successfully...",
                                                            });

                                                        }
                                                    }
                                                }
                                                uploader(0);
                                            }
                                        });
                                    }
                                }

                            } else {
                                res.json({
                                    success: true,
                                    message: "Fence not created successfully...",
                                });
                            }
                        })
                    } else {
                        AdvanceFence.update(objFence, {
                            where: {
                                id: AdvanceFenceExits.id,
                            }
                        }).then(function(updateAdvancefence) {
                            Fence.update(objFence, {
                                where: {
                                    IdAdvanceFence: AdvanceFenceExits.id,
                                }
                            }).then(function(resFence) {
                                var IsPetInFence = true;

                                function uploader(m) {
                                    if (Deviceidlist.length > m) {
                                        client.get(Deviceidlist[m], function(err, strgpsdata) {
                                            var response = JSON.parse(strgpsdata);
                                            if (!err) {
                                                var IsPetInFence = true
                                                if (response != null & response != '' && response != undefined) {

                                                    var CheckPoints = {
                                                        latitude: parseFloat(response.Latitude),
                                                        longitude: parseFloat(response.Longitude)
                                                    }

                                                    if (objFence.fencedraw == "circle") {
                                                        var CircleCenterPoints = {
                                                            latitude: parseFloat(objFence.lat),
                                                            longitude: parseFloat(objFence.lng)
                                                        }
                                                        var CircleRadius = parseFloat(objFence.range);
                                                        IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                                    } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                                                        var lstpolygonDrawC = [];
                                                        var lstlatC = objFence.lat.split(',');
                                                        var lstlngC = objFence.lng.split(',');

                                                        for (var i = 0; i < lstlatC.length; i++) {
                                                            var objDraw = {
                                                                latitude: parseFloat(lstlatC[i]),
                                                                longitude: parseFloat(lstlngC[i])
                                                            }
                                                            lstpolygonDrawC.push(objDraw);
                                                        }
                                                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                    } else if (objFence.fencedraw == "rectangle") {
                                                        var lstpolygonDrawC = [];
                                                        var lstlatC = objFence.lat.split(',');
                                                        var lstlngC = objFence.lng.split(',');
                                                        var objDraw = {
                                                            latitude: parseFloat(lstlatC[0]),
                                                            longitude: parseFloat(lstlngC[0])
                                                        }
                                                        lstpolygonDrawC.push(objDraw);
                                                        var objDraw = {
                                                            latitude: parseFloat(lstlatC[0]),
                                                            longitude: parseFloat(lstlngC[1])
                                                        }
                                                        lstpolygonDrawC.push(objDraw);
                                                        var objDraw = {
                                                            latitude: parseFloat(lstlatC[1]),
                                                            longitude: parseFloat(lstlngC[1])
                                                        }
                                                        lstpolygonDrawC.push(objDraw);
                                                        var objDraw = {
                                                            latitude: parseFloat(lstlatC[1]),
                                                            longitude: parseFloat(lstlngC[0])
                                                        }
                                                        lstpolygonDrawC.push(objDraw);
                                                        var objDraw = {
                                                            latitude: parseFloat(lstlatC[0]),
                                                            longitude: parseFloat(lstlngC[0])
                                                        }
                                                        lstpolygonDrawC.push(objDraw);

                                                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                    };
                                                    if (IsPetInFence == false) {
                                                        Devicelist.push(response.DeviceId);
                                                    }
                                                }
                                                objFence.IsInFence = IsPetInFence;
                                                uploader(m + 1);
                                            }
                                        })
                                    } else {
                                        if (Devicelist.length > 0) {
                                            connection.query("UPDATE tblfence set IsInFence=false where IdAdvanceFence='" + AdvanceFenceCreated.id + "' and  deviceId in (" + [Devicelist] + ');', function(err, resUpdate, fields) {
                                                res.json({
                                                    success: true,
                                                    message: "Advance fence created successfully...",
                                                    data: resUpdate
                                                });

                                            })
                                        } else {
                                            res.json({
                                                success: true,
                                                message: "Advance fence created successfully...",
                                            });
                                        }
                                    }
                                }
                                uploader(0);
                            })
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

//-------------------(MobileApp & WebApp):-(update Advance fence)-----------------------
router.post('/updateAdvanceFence', jsonParser, function(req, res) {
    objFence = req.body;
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
                var Deviceidlist = objFence.selectedlist;
                AdvanceFence.find({
                    where: {
                        id: objFence.IdAdvanceFence
                    },
                }).then(function(AdvanceFenceExits) {
                    if (AdvanceFenceExits) {
                        AdvanceFence.update(objFence, {
                            where: {
                                id: AdvanceFenceExits.id,
                            }
                        }).then(function(updateAdvancefence) {

                            Fence.destroy({ where: { IdAdvanceFence: AdvanceFenceExits.id } }).then(function(fencedeleted) {
                                objFence.IdAdvanceFence = AdvanceFenceExits.id;
                                if (Deviceidlist.length > 0) {
                                    var colllist = [];
                                    for (var i = 0; i < Deviceidlist.length; i++) {
                                        var colldata = [Deviceidlist[i], objFence.name, (objFence.lat).toString(), (objFence.lng).toString(), objFence.fencedraw, objFence.range, objFence.status, objFence.IdAdvanceFence];
                                        colllist.push(colldata);
                                    }
                                    if (colllist.length > 0) {
                                        connection.query("INSERT INTO tblfence (deviceId,name,lat,lng,fencedraw,tblfence.range,status,IdAdvanceFence) VALUES ?", [colllist], function(err, FenceCreated, fields) {
                                            if (!err && FenceCreated) {
                                                var lstIsInFence = [];
                                                var Devicelist = [];
                                                var IsPetInFence = true

                                                function uploader(m) {
                                                    if (Deviceidlist.length > m) {
                                                        client.get(Deviceidlist[m], function(err, strgpsdata) {
                                                            var response = JSON.parse(strgpsdata);
                                                            if (!err) {
                                                                var IsPetInFence = true
                                                                if (response != null & response != '' && response != undefined) {

                                                                    var CheckPoints = {
                                                                        latitude: parseFloat(response.Latitude),
                                                                        longitude: parseFloat(response.Longitude)
                                                                    }

                                                                    if (objFence.fencedraw == "circle") {
                                                                        var CircleCenterPoints = {
                                                                            latitude: parseFloat(objFence.lat),
                                                                            longitude: parseFloat(objFence.lng)
                                                                        }
                                                                        var CircleRadius = parseFloat(objFence.range);
                                                                        IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                                                    } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                                                                        var lstpolygonDrawC = [];
                                                                        var lstlatC = objFence.lat.split(',');
                                                                        var lstlngC = objFence.lng.split(',');

                                                                        for (var i = 0; i < lstlatC.length; i++) {
                                                                            var objDraw = {
                                                                                latitude: parseFloat(lstlatC[i]),
                                                                                longitude: parseFloat(lstlngC[i])
                                                                            }
                                                                            lstpolygonDrawC.push(objDraw);
                                                                        }
                                                                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                                    } else if (objFence.fencedraw == "rectangle") {
                                                                        var lstpolygonDrawC = [];
                                                                        var lstlatC = objFence.lat.split(',');
                                                                        var lstlngC = objFence.lng.split(',');


                                                                        var objDraw = {
                                                                            latitude: parseFloat(lstlatC[0]),
                                                                            longitude: parseFloat(lstlngC[0])
                                                                        }
                                                                        lstpolygonDrawC.push(objDraw);
                                                                        var objDraw = {
                                                                            latitude: parseFloat(lstlatC[0]),
                                                                            longitude: parseFloat(lstlngC[1])
                                                                        }
                                                                        lstpolygonDrawC.push(objDraw);
                                                                        var objDraw = {
                                                                            latitude: parseFloat(lstlatC[1]),
                                                                            longitude: parseFloat(lstlngC[1])
                                                                        }
                                                                        lstpolygonDrawC.push(objDraw);
                                                                        var objDraw = {
                                                                            latitude: parseFloat(lstlatC[1]),
                                                                            longitude: parseFloat(lstlngC[0])
                                                                        }
                                                                        lstpolygonDrawC.push(objDraw);
                                                                        var objDraw = {
                                                                            latitude: parseFloat(lstlatC[0]),
                                                                            longitude: parseFloat(lstlngC[0])
                                                                        }
                                                                        lstpolygonDrawC.push(objDraw);

                                                                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                                    };
                                                                    if (IsPetInFence == false) {
                                                                        Devicelist.push(response.DeviceId);
                                                                    }
                                                                }
                                                                objFence.IsInFence = IsPetInFence;
                                                                uploader(m + 1);
                                                            }
                                                        })

                                                    } else {

                                                        if (Devicelist.length > 0) {
                                                            connection.query("UPDATE tblfence set IsInFence=false where IdAdvanceFence='" + AdvanceFenceExits.id + "' and  deviceId in (" + [Devicelist] + ');', function(err, resUpdate, fields) {
                                                                res.json({
                                                                    success: true,
                                                                    message: "Advance fence updated successfully...",
                                                                    data: resUpdate
                                                                });

                                                            })
                                                        } else {
                                                            res.json({
                                                                success: true,
                                                                message: "Advance fence update successfully...",
                                                            });

                                                        }

                                                    }

                                                }
                                                uploader(0);
                                                // console.log("select * from tblgpsdata where id in (select max(Date) from tblgpsdata where DeviceId in (" + [Deviceidlist] + ")  group by DeviceId)");
                                                // connection.query("select * from tblgpsdata where id in (select max(Date) from tblgpsdata where DeviceId in (" + [Deviceidlist] + ")  group by DeviceId)", function(err, response, fields) {
                                                //     console.log("find........................")
                                                //     console.log(err)
                                                //     console.log(response.length)
                                                //     if (!err && response) {
                                                //         if (response.length > 0) {
                                                //             var IsPetInFence = true;
                                                //             var lstIsInFence = [];
                                                //             var Deviceidlist = [];
                                                //             for (var i = 0; i < response.length; i++) {
                                                //                 var CheckPoints = {
                                                //                     latitude: parseFloat(response[i].Latitude),
                                                //                     longitude: parseFloat(response[i].Longitude)
                                                //                 }

                                                //                 if (objFence.fencedraw == "circle") {
                                                //                     var CircleCenterPoints = {
                                                //                         latitude: parseFloat(objFence.lat),
                                                //                         longitude: parseFloat(objFence.lng)
                                                //                     }
                                                //                     var CircleRadius = parseFloat(objFence.range);
                                                //                     IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                                //                 } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                                                //                     var lstpolygonDrawC = [];
                                                //                     var lstlatC = objFence.lat.split(',');
                                                //                     var lstlngC = objFence.lng.split(',');

                                                //                     for (var i = 0; i < lstlatC.length; i++) {
                                                //                         var objDraw = {
                                                //                             latitude: parseFloat(lstlatC[i]),
                                                //                             longitude: parseFloat(lstlngC[i])
                                                //                         }
                                                //                         lstpolygonDrawC.push(objDraw);
                                                //                     }
                                                //                     IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                //                 } else if (objFence.fencedraw == "rectangle") {
                                                //                     var lstpolygonDrawC = [];
                                                //                     var lstlatC = objFence.lat.split(',');
                                                //                     var lstlngC = objFence.lng.split(',');


                                                //                     var objDraw = {
                                                //                         latitude: parseFloat(lstlatC[0]),
                                                //                         longitude: parseFloat(lstlngC[0])
                                                //                     }
                                                //                     lstpolygonDrawC.push(objDraw);
                                                //                     var objDraw = {
                                                //                         latitude: parseFloat(lstlatC[0]),
                                                //                         longitude: parseFloat(lstlngC[1])
                                                //                     }
                                                //                     lstpolygonDrawC.push(objDraw);
                                                //                     var objDraw = {
                                                //                         latitude: parseFloat(lstlatC[1]),
                                                //                         longitude: parseFloat(lstlngC[1])
                                                //                     }
                                                //                     lstpolygonDrawC.push(objDraw);
                                                //                     var objDraw = {
                                                //                         latitude: parseFloat(lstlatC[1]),
                                                //                         longitude: parseFloat(lstlngC[0])
                                                //                     }
                                                //                     lstpolygonDrawC.push(objDraw);
                                                //                     var objDraw = {
                                                //                         latitude: parseFloat(lstlatC[0]),
                                                //                         longitude: parseFloat(lstlngC[0])
                                                //                     }
                                                //                     lstpolygonDrawC.push(objDraw);

                                                //                     IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)

                                                //                 };
                                                //                 if (IsPetInFence == false) {
                                                //                     // lstIsInFence.push(IsPetInFence);
                                                //                     Deviceidlist.push(response[i].DeviceId);
                                                //                 }
                                                //                 console.log(response[i].DeviceId, "--->>-", IsPetInFence)
                                                //             }
                                                //         }
                                                //         if (Devicelist.length > 0) {
                                                //             connection.query("UPDATE tblfence set IsInFence=false where IdAdvanceFence='" + AdvanceFenceExits.id + "' and  deviceId in (" + [Deviceidlist] + ');', function(err, resUpdate, fields) {
                                                //                 console.log(err)
                                                //                 console.log(resUpdate.length);
                                                //                 res.json({
                                                //                     success: true,
                                                //                     message: "Advance fence updated successfully...",
                                                //                     data: response
                                                //                 });

                                                //             })
                                                //         } else {
                                                //             res.json({
                                                //                 success: true,
                                                //                 message: "Advance fence updated successfully...",
                                                //                 data: response
                                                //             });
                                                //         }
                                                //     }

                                                // });
                                            }

                                        });
                                    }
                                }

                            })


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
})

//-------------------(MobileApp):-(Get All Device of Advance fence)-----------------------
router.get('/GetFenceById', function(req, res) {
    Fence.findAll({
        where: {
            IdAdvanceFence: req.query.IdAdvanceFence
        }
    }).then(function(response) {
        if (response != null) {
            res.json({
                success: true,
                message: "Record found...",
                data: response
            });
        } else {
            res.json(RecordNotFound);
        }
    })
})

//-------------------(MobileApp & WebApp):-(update Advance fence Name)-----------------------
router.post('/UpdateFenceNameById', jsonParser, function(req, res) {
    objFence = req.body;
    AdvanceFence.findOne({
        where: {
            id: objFence.id
        }
    }).then(function(response) {
        if (response != null) {
            response.updateAttributes({ name: objFence.name }).then(function(resUpdate) {
                res.json({
                    success: true,
                    message: "Advance fence name updated successfully...",
                    data: response,
                });
            });
        } else {
            res.json({
                success: false,
                message: "Advance fence name not updated...",
            });
        }
    });
});

module.exports = router