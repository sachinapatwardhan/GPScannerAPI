var router = express.Router();
var geolib = require("geolib");
var User = models.tbluserinformation;
var AdvanceFence = models.tbladvancefence;
var Fence = models.tblfence;
var PetGPS = models.tblgpsdata;
var Bike = models.tblvehicle;
var Commonfunction = require('./common.js');



router.get('/GetVehicleCurrentLocation', function(req, res) {
    // var Startdate = new Date();

    // var convertDate = convertdateformatForUnix(Startdate);
    // var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    // // var unixStartdate = Startdate.getTime() / 1000;



    client.get(req.query.DeviceId, function(err, strgpsdata) {
        if (!err) {
            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                res.json({ success: true, data: JSON.parse(strgpsdata) });
            } else {
                GetdbCurrentLocation();
            }
        } else {
            GetdbCurrentLocation();
        }
    });

    function GetdbCurrentLocation() {
        var Startdate = new Date();

        var convertDate = convertdateformatForUnix(Startdate);
        var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
        // var unixStartdate = Startdate.getTime() / 1000;
        GPSData.findOne({
            where: {
                DeviceId: req.query.DeviceId,
                GPSPositioning: 'A',
                Date: { $lte: unixStartdate }
            },
            order: 'Date DESC'
        }).then(function(response) {
            if (response != null) {
                client.set(req.query.DeviceId, JSON.stringify(response), function(err, replies) {});
                res.json({ success: true, data: response });
            } else {
                res.json(RecordNotFound);
            }
        })
    }
});

router.get('/GetLastGpsData', function(req, res) {
    var query = "select * from tblgpsdata a inner join (select max(Date) as maxdate,DeviceId from  tblgpsdata group by DeviceId) d on  a.DeviceId = d.DeviceId and a.Date =d.maxdate group by a.DeviceId";
    connection.query(query, function(err, rows, fields) {
        if (!err && rows) {
            res.json(rows);
        }
    })

})

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

router.get('/DeleteFenceById', function(req, res) {
    Fence.findAll({
        where: {
            IdAdvanceFence: req.query.id
        }
    }).then(function(FenceList) {
        var Deviceidlist = [];
        for (var i = 0; i < FenceList.length; i++) {
            Deviceidlist.push(FenceList[i].deviceId);
        }
        UpdateFenceForRedis(Deviceidlist);
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
                    res.json({ success: false, message: 'Advance fence not Removed.' });
                }
            })

        })
    })
});

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
                                                        Commonfunction.UpdateVehicleRedis(Deviceidlist[m], 'Fence');
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


                                                        // PetGPS.findOne({
                                                        //     where: {
                                                        //         DeviceId: Deviceidlist[m]
                                                        //     },
                                                        //     order: 'id DESC'
                                                        // }).then(function(response) {
                                                        //     var IsPetInFence = true
                                                        //     if (response != null) {
                                                        //         var CheckPoints = {
                                                        //             latitude: parseFloat(response.Latitude),
                                                        //             longitude: parseFloat(response.Longitude)
                                                        //         }

                                                        //         if (objFence.fencedraw == "circle") {
                                                        //             var CircleCenterPoints = {
                                                        //                 latitude: parseFloat(objFence.lat),
                                                        //                 longitude: parseFloat(objFence.lng)
                                                        //             }
                                                        //             var CircleRadius = parseFloat(objFence.range);
                                                        //             IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                                        //         } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                                                        //             var lstpolygonDrawC = [];
                                                        //             var lstlatC = objFence.lat.split(',');
                                                        //             var lstlngC = objFence.lng.split(',');

                                                        //             for (var i = 0; i < lstlatC.length; i++) {
                                                        //                 var objDraw = {
                                                        //                     latitude: parseFloat(lstlatC[i]),
                                                        //                     longitude: parseFloat(lstlngC[i])
                                                        //                 }
                                                        //                 lstpolygonDrawC.push(objDraw);
                                                        //             }
                                                        //             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                        //         } else if (objFence.fencedraw == "rectangle") {
                                                        //             var lstpolygonDrawC = [];
                                                        //             var lstlatC = objFence.lat.split(',');
                                                        //             var lstlngC = objFence.lng.split(',');


                                                        //             var objDraw = {
                                                        //                 latitude: parseFloat(lstlatC[0]),
                                                        //                 longitude: parseFloat(lstlngC[0])
                                                        //             }
                                                        //             lstpolygonDrawC.push(objDraw);
                                                        //             var objDraw = {
                                                        //                 latitude: parseFloat(lstlatC[0]),
                                                        //                 longitude: parseFloat(lstlngC[1])
                                                        //             }
                                                        //             lstpolygonDrawC.push(objDraw);
                                                        //             var objDraw = {
                                                        //                 latitude: parseFloat(lstlatC[1]),
                                                        //                 longitude: parseFloat(lstlngC[1])
                                                        //             }
                                                        //             lstpolygonDrawC.push(objDraw);
                                                        //             var objDraw = {
                                                        //                 latitude: parseFloat(lstlatC[1]),
                                                        //                 longitude: parseFloat(lstlngC[0])
                                                        //             }
                                                        //             lstpolygonDrawC.push(objDraw);
                                                        //             var objDraw = {
                                                        //                 latitude: parseFloat(lstlatC[0]),
                                                        //                 longitude: parseFloat(lstlngC[0])
                                                        //             }
                                                        //             lstpolygonDrawC.push(objDraw);

                                                        //             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                        //         };
                                                        //         if (IsPetInFence == false) {
                                                        //             Devicelist.push(response.DeviceId);
                                                        //         }
                                                        //     }
                                                        //     objFence.IsInFence = IsPetInFence;
                                                        //     // Fence.update(objFence, {
                                                        //     //     where: {
                                                        //     //         deviceId: Deviceidlist[m],
                                                        //     //         IdAdvanceFence: AdvanceFenceExits.id,
                                                        //     //     }
                                                        //     // }).then(function(resUpdate) {
                                                        //     //     
                                                        //     // });


                                                        //     uploader(m + 1);
                                                        // })
                                                    } else {
                                                        if (Devicelist.length > 0) {
                                                            connection.query("UPDATE tblfence set IsInFence=false where IdAdvanceFence='" + AdvanceFenceCreated.id + "' and  deviceId in (" + [Devicelist] + ');', function(err, resUpdate, fields) {
                                                                UpdateFenceForRedis(Devicelist);
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
                        var Devicelist = [];
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
                                        Commonfunction.UpdateVehicleRedis(Deviceidlist[m], 'Fence');
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
                                                UpdateFenceForRedis(Devicelist);
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

                                // PetGPS.findOne({
                                //     where: {
                                //         DeviceId: objFence.deviceId
                                //     },
                                //     order: 'id DESC'
                                // }).then(function(response) {
                                //     if (response != null) {
                                //         var CheckPoints = {
                                //             latitude: parseFloat(response.Latitude),
                                //             longitude: parseFloat(response.Longitude)
                                //         }
                                //         if (objFence.fencedraw == "circle") {
                                //             var CircleCenterPoints = {
                                //                 latitude: parseFloat(objFence.lat),
                                //                 longitude: parseFloat(objFence.lng)
                                //             }
                                //             var CircleRadius = parseFloat(objFence.range);
                                //             IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                //         } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                                //             var lstpolygonDrawC = [];
                                //             var lstlatC = objFence.lat.split(',');
                                //             var lstlngC = objFence.lng.split(',');

                                //             for (var i = 0; i < lstlatC.length; i++) {
                                //                 var objDraw = {
                                //                     latitude: parseFloat(lstlatC[i]),
                                //                     longitude: parseFloat(lstlngC[i])
                                //                 }
                                //                 lstpolygonDrawC.push(objDraw);
                                //             }
                                //             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                //         } else if (objFence.fencedraw == "rectangle") {
                                //             var lstpolygonDrawC = [];
                                //             var lstlatC = objFence.lat.split(',');
                                //             var lstlngC = objFence.lng.split(',');


                                //             var objDraw = {
                                //                 latitude: parseFloat(lstlatC[0]),
                                //                 longitude: parseFloat(lstlngC[0])
                                //             }
                                //             lstpolygonDrawC.push(objDraw);
                                //             var objDraw = {
                                //                 latitude: parseFloat(lstlatC[0]),
                                //                 longitude: parseFloat(lstlngC[1])
                                //             }
                                //             lstpolygonDrawC.push(objDraw);
                                //             var objDraw = {
                                //                 latitude: parseFloat(lstlatC[1]),
                                //                 longitude: parseFloat(lstlngC[1])
                                //             }
                                //             lstpolygonDrawC.push(objDraw);
                                //             var objDraw = {
                                //                 latitude: parseFloat(lstlatC[1]),
                                //                 longitude: parseFloat(lstlngC[0])
                                //             }
                                //             lstpolygonDrawC.push(objDraw);
                                //             var objDraw = {
                                //                 latitude: parseFloat(lstlatC[0]),
                                //                 longitude: parseFloat(lstlngC[0])
                                //             }
                                //             lstpolygonDrawC.push(objDraw);

                                //             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                //         };
                                //     }

                                //     objFence.IsInFence = IsPetInFence;
                                //     Fence.update(objFence, {
                                //         where: {
                                //             id: objFence.idFence
                                //         }
                                //     }).then(function(resUpdate) {
                                //         res.json({
                                //             success: true,
                                //             message: "Fence updated successfully...",
                                //             data: resUpdate
                                //         });
                                //     });
                                // })
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
                                                        Commonfunction.UpdateVehicleRedis(Deviceidlist[m], 'Fence');
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
                                                            // PetGPS.findOne({
                                                            //     where: {
                                                            //         DeviceId: Deviceidlist[m]
                                                            //     },
                                                            //     order: 'id DESC'
                                                            // }).then(function(response) {
                                                            //     var IsPetInFence = true
                                                            //     if (response != null) {
                                                            //         var CheckPoints = {
                                                            //             latitude: parseFloat(response.Latitude),
                                                            //             longitude: parseFloat(response.Longitude)
                                                            //         }

                                                        //         if (objFence.fencedraw == "circle") {
                                                        //             var CircleCenterPoints = {
                                                        //                 latitude: parseFloat(objFence.lat),
                                                        //                 longitude: parseFloat(objFence.lng)
                                                        //             }
                                                        //             var CircleRadius = parseFloat(objFence.range);
                                                        //             IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                                        //         } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                                                        //             var lstpolygonDrawC = [];
                                                        //             var lstlatC = objFence.lat.split(',');
                                                        //             var lstlngC = objFence.lng.split(',');

                                                        //             for (var i = 0; i < lstlatC.length; i++) {
                                                        //                 var objDraw = {
                                                        //                     latitude: parseFloat(lstlatC[i]),
                                                        //                     longitude: parseFloat(lstlngC[i])
                                                        //                 }
                                                        //                 lstpolygonDrawC.push(objDraw);
                                                        //             }
                                                        //             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                        //         } else if (objFence.fencedraw == "rectangle") {
                                                        //             var lstpolygonDrawC = [];
                                                        //             var lstlatC = objFence.lat.split(',');
                                                        //             var lstlngC = objFence.lng.split(',');


                                                        //             var objDraw = {
                                                        //                 latitude: parseFloat(lstlatC[0]),
                                                        //                 longitude: parseFloat(lstlngC[0])
                                                        //             }
                                                        //             lstpolygonDrawC.push(objDraw);
                                                        //             var objDraw = {
                                                        //                 latitude: parseFloat(lstlatC[0]),
                                                        //                 longitude: parseFloat(lstlngC[1])
                                                        //             }
                                                        //             lstpolygonDrawC.push(objDraw);
                                                        //             var objDraw = {
                                                        //                 latitude: parseFloat(lstlatC[1]),
                                                        //                 longitude: parseFloat(lstlngC[1])
                                                        //             }
                                                        //             lstpolygonDrawC.push(objDraw);
                                                        //             var objDraw = {
                                                        //                 latitude: parseFloat(lstlatC[1]),
                                                        //                 longitude: parseFloat(lstlngC[0])
                                                        //             }
                                                        //             lstpolygonDrawC.push(objDraw);
                                                        //             var objDraw = {
                                                        //                 latitude: parseFloat(lstlatC[0]),
                                                        //                 longitude: parseFloat(lstlngC[0])
                                                        //             }
                                                        //             lstpolygonDrawC.push(objDraw);

                                                        //             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                        //         };
                                                        //         if (IsPetInFence == false) {
                                                        //             Devicelist.push(response.DeviceId);
                                                        //         }
                                                        //     }
                                                        //     objFence.IsInFence = IsPetInFence;
                                                        //     // Fence.update(objFence, {
                                                        //     //     where: {
                                                        //     //         deviceId: Deviceidlist[m],
                                                        //     //         IdAdvanceFence: AdvanceFenceExits.id,
                                                        //     //     }
                                                        //     // }).then(function(resUpdate) {
                                                        //     //     
                                                        //     // });


                                                        //     uploader(m + 1);
                                                        // })
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
                                                        // res.json({
                                                        //     success: true,
                                                        //     message: "Advance fence updated successfully...",
                                                        // });
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
                                } else {
                                    res.json({
                                        success: true,
                                        message: "Advance fence update successfully...",
                                    });

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


router.post('/SaveFenceByIdNew_phili', jsonParser, function(req, res) {
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
                var Deviceidlist = [];
                var Devicelist = [];
                Deviceidlist = objFence.selectedlist;
                AdvanceFence.find({
                    where: {
                        id: objFence.id
                    },
                }).then(function(AdvanceFenceExits) {
                    if (AdvanceFenceExits == null) {
                        var objAdvanceFence = new Object()
                        objAdvanceFence.CreatedDate = new Date();
                        objAdvanceFence.name = objFence.name;
                        objAdvanceFence.UserId = objFence.UserId;
                        objAdvanceFence.range = objFence.range;
                        objAdvanceFence.status = objFence.status;
                        objAdvanceFence.lat = objFence.lat;
                        objAdvanceFence.lng = objFence.lng;
                        objAdvanceFence.fencedraw = objFence.fencedraw;
                        AdvanceFence.create(objAdvanceFence).then(function(AdvanceFenceCreated) {
                            if (AdvanceFenceCreated) {
                                res.json({
                                    success: true,
                                    message: "Fence created successfully...",
                                });

                            } else {
                                res.json({
                                    success: true,
                                    message: "Fence not created successfully...",
                                });
                            }
                        })
                    } else {
                        var objAdvanceFence = new Object()
                        objAdvanceFence.name = objFence.name;
                        objAdvanceFence.UserId = UserExist.id;
                        objAdvanceFence.range = objFence.range;
                        objAdvanceFence.status = objFence.status;
                        objAdvanceFence.lat = objFence.lat;
                        objAdvanceFence.lng = objFence.lng;
                        objAdvanceFence.fencedraw = objFence.fencedraw;
                        objAdvanceFence.UserId = objFence.UserId;
                        AdvanceFence.update(objAdvanceFence, {
                            where: {
                                id: objFence.id,
                            }
                        }).then(function(updateAdvancefence) {

                            var objFenceNew = new Object()
                            objFenceNew.name = objFence.name;
                            objFenceNew.range = objFence.range;
                            objFenceNew.status = objFence.status;
                            objFenceNew.lat = objFence.lat;
                            objFenceNew.lng = objFence.lng;
                            objFenceNew.fencedraw = objFence.fencedraw;
                            Fence.update(objFenceNew, {
                                where: {
                                    IdAdvanceFence: AdvanceFenceExits.id,
                                }
                            }).then(function(resFence) {
                                var IsPetInFence = true;

                                function uploader(m) {
                                    if (Deviceidlist.length > m) {
                                        Commonfunction.UpdateVehicleRedis(Deviceidlist[m], 'Fence');
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
                                        if (Devicelist) {
                                            if (Devicelist.length > 0) {
                                                connection.query("UPDATE tblfence set IsInFence=false where IdAdvanceFence='" + AdvanceFenceCreated.id + "' and  deviceId in (" + [Devicelist] + ');', function(err, resUpdate, fields) {
                                                    UpdateFenceForRedis(Devicelist);
                                                    res.json({
                                                        success: true,
                                                        message: "Advance fence Updated successfully...",
                                                        data: resUpdate
                                                    });

                                                })
                                            } else {
                                                res.json({
                                                    success: true,
                                                    message: "Advance fence Updated successfully...",
                                                });
                                            }
                                        } else {
                                            res.json({
                                                success: true,
                                                message: "Advance fence Updated successfully...",
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



router.get('/ChangeFenceByBike', function(req, res) {
    var idAdvanceFence = req.query.idFence;
    var deviceId = req.query.deviceId
    var IsFenceOnline = req.query.IsFenceOnline;

    AdvanceFence.findOne({
        where: {
            id: idAdvanceFence
        }
    }).then(function(response) {
        if (response) {
            Fence.update({ IsFenceOnline: IsFenceOnline }, { where: { IdAdvanceFence: response.id } }).then(function(resUpdate) {
                var desc = "Fence Status = " + IsFenceOnline;
                Commonfunction.UpdateVehicleRedis(deviceId, 'Fence');
                res.json({
                    success: true,
                    message: "Advance fence setting saved successfully.",
                    data: IsFenceOnline
                });

            });
        } else {
            res.json({ success: false, message: 'Fence setting not saved successfully. Try after 5 minute.' });
        }

    })

})


function UpdateFenceForRedis(Deviceidlist) {
    for (var i = 0; i < Deviceidlist.length; i++) {
        //Update Vehicle Data For in Redis Server
        Commonfunction.UpdateVehicleRedis(Deviceidlist[i], 'Fence');
    }
}

module.exports = router