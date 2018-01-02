var router = express.Router();
var geolib = require("geolib");
var User = models.tbluserinformation;
var FavoritePlace = models.tblfavoriteplace;
var GPSData = models.tblgpsdata;
//-------------------Get All favorite place by device id------------------------
router.get('/GetAllFavoritePlaceByDevice', function(req, res) {
    FavoritePlace.findAll({
        where: {
            DeviceId: req.query.DeviceId
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

//------------Get favorite place by id---------------
router.get('/GetFavoritePlaceById', function(req, res) {
    // console.log(req.query);
    FavoritePlace.findOne({
        where: {
            id: req.query.id
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

//----------------save favorite place-------------
router.post('/SaveFavoritePlace', jsonParser, function(req, res) {
    objFavoritePlace = req.body;
    objFavoritePlace.CreatedDate = new Date();
    if (objFavoritePlace.id == '') {
        objFavoritePlace.id = 0;
    }
    FavoritePlace.findOrCreate({ where: { DeviceId: objFavoritePlace.DeviceId, Name: objFavoritePlace.Name }, defaults: objFavoritePlace }).then(function(response) {
        if (response[0]) {
            var IsInFavoritePlace = false;
            // console.log("-----------------------------------------------------------------------")

            // GPSData.findOne({
            //     where: {
            //         DeviceId: objFavoritePlace.DeviceId
            //     },
            //     order: 'id DESC'
            // }).then(function(resGPS) {
            //     // console.log("-----------------------------------------------------------------------")
            //     if (resGPS != null) {


            //----------------call redix server data--------------------------
            client.get(objFavoritePlace.DeviceId, function(err, strgpsdata) {
                console.log("@@@@@@@@@@@@@@@", err)

                if (!err && strgpsdata != null && strgpsdata != '' && strgpsdata != undefined) {
                    var resGPS = JSON.parse(strgpsdata)
                        //----------------End redix server data--------------------------
                    var CheckPoints = {
                        latitude: parseFloat(resGPS.Latitude),
                        longitude: parseFloat(resGPS.Longitude)
                    }

                    var CircleCenterPoints = {
                        latitude: parseFloat(objFavoritePlace.Latitude),
                        longitude: parseFloat(objFavoritePlace.Longitude)
                    }

                    var CircleRadius = parseFloat(objFavoritePlace.Range);
                    IsInFavoritePlace = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                        // console.log("IsPetIn Fence - " + IsPetInFence)
                }

                FavoritePlace.findOne({
                    where: {
                        DeviceId: objFavoritePlace.DeviceId,
                        Name: objFavoritePlace.Name
                    }
                }).then(function(resFavoritePlace) {
                    resFavoritePlace.updateAttributes({ IsInFavoritePlace: IsInFavoritePlace }).then(function(resUpdate) {
                        // funAuditLog.CreateAuditLog('SaveFence', UserExist.username , 'Delete Pet Tracking');
                        res.json({
                            success: true,
                            message: "Favorite Place created successfully...",
                            data: response
                        });
                    });
                })

            })
        } else {
            Fence.update(objFavoritePlace, {
                where: {
                    deviceId: objFavoritePlace.deviceId,
                    Name: objFavoritePlace.Name
                }
            }).then(function(response) {
                var IsPetInFence = true;
                // PetGPS.findOne({
                //     where: {
                //         DeviceId: objFavoritePlace.deviceId
                //     },
                //     order: 'id DESC'
                // }).then(function(response) {
                // if (response != null) {
                //----------------call redix server data--------------------------
                client.get(objFavoritePlace.deviceId, function(err, response) {

                    if (!err && response != null && response != '' && response != undefined) {
                        response = JSON.parse(response)
                            //----------------End redix server data--------------------------


                        var CheckPoints = {
                                latitude: parseFloat(response.Latitude),
                                longitude: parseFloat(response.Longitude)
                            }
                            // var IsPetInFence = true;

                        if (objFavoritePlace.fencedraw == "circle") {
                            var CircleCenterPoints = {
                                latitude: parseFloat(objFavoritePlace.lat),
                                longitude: parseFloat(objFavoritePlace.lng)
                            }
                            var CircleRadius = parseFloat(objFavoritePlace.range);
                            IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)

                            // console.log("IsPetIn Fence - " + IsPetInFence)
                        } else if (objFavoritePlace.fencedraw == "polygon" || objFavoritePlace.fencedraw == "polyline") {
                            var lstpolygonDrawC = [];
                            var lstlatC = objFavoritePlace.lat.split(',');
                            var lstlngC = objFavoritePlace.lng.split(',');

                            for (var i = 0; i < lstlatC.length; i++) {
                                var objDraw = {
                                    latitude: parseFloat(lstlatC[i]),
                                    longitude: parseFloat(lstlngC[i])
                                }
                                lstpolygonDrawC.push(objDraw);
                            }
                            IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                // console.log("IsPetIn Fence - " + IsPetInFence)
                        } else if (objFavoritePlace.fencedraw == "rectangle") {
                            var lstpolygonDrawC = [];
                            var lstlatC = objFavoritePlace.lat.split(',');
                            var lstlngC = objFavoritePlace.lng.split(',');


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

                            // console.log(lstpolygonDrawC)
                            IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                // console.log("Sqre IsPetIn Fence - " + IsPetInFence)
                        };
                    }

                    Bike.findOne({
                        where: {
                            deviceid: objFavoritePlace.deviceId
                        }
                    }).then(function(objPet) {
                        objPet.updateAttributes({ IsInFence: IsPetInFence }).then(function(resUpdate) {
                            res.json({
                                success: true,
                                message: "Fence updated successfully...",
                                data: response
                            });
                        });
                    })

                })
            })
        }
    })

    //         } else {
    //             res.json(InvalidToken);
    //         }
    //     })
    // } else {
    //     res.json(InvalidToken);
    // }
});

//------------------Delete favorite place
router.get('/DeleteFavoritePlace', function(req, res) {
    FavoritePlace.destroy({
        where: {
            id: req.query.id
        }
    }).then(function(response) {
        if (response != null) {
            res.json({
                success: true,
                message: "Favorite Place Deleted Successfully...",
                data: response
            });
        } else {
            res.json(RecordNotFound);
        }
    })
});

//-------------update favorite place--------
router.post('/UpdateFavoritePlaceNameById', jsonParser, function(req, res) {
    objFavorite = req.body;
    // console.log(objFavorite);
    FavoritePlace.findOne({
        where: {
            id: objFavorite.id
        }
    }).then(function(response) {
        if (response != null) {
            response.updateAttributes({ Name: objFavorite.Name, ModifiedDate: new Date() }).then(function(resUpdate) {
                res.json({
                    success: true,
                    message: "Favorite Place Name updated successfully...",
                    data: response,
                });
            });
        } else {
            res.json({
                success: false,
                message: "Favorite Place Name not updated...",
            });
        }
    });
});


module.exports = router