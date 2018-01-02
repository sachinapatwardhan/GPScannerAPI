//Tables
var router = express.Router();
var geolib = require("geolib");
var User = models.tbluserinformation;
var Fence = models.tblfence;
var PetGPS = models.tblgpsdata;
var Bike = models.tblvehicle;
//End of Tables
//---------------------(mobileApp):-get all fence of device---------------------
router.get('/GetAllFenceByVehicle', function(req, res) {
    Fence.findAll({
        where: {
            deviceId: req.query.deviceId
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

//-----------------------(mobileapp:- get fence detail by id)---------------------
router.get('/GetFenceById', function(req, res) {

    Fence.findOne({
        where: {
            id: req.query.idFence
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

//--------------------------------------(mobile & web app):-save fence& update fence------------------------------
router.post('/SaveFenceById', jsonParser, function(req, res) {
    objFence = req.body;

    if (objFence.idFence == 0 || objFence.idFence == null || objFence.idFence == undefined) {
        Fence.create(objFence).then(function(resFence) {
            if (resFence) {
                var IsPetInFence = true;
                // PetGPS.findOne({
                //     where: {
                //         DeviceId: objFence.deviceId
                //     },
                //     order: 'id DESC'
                // }).then(function(response) {
                //     if (response != null) {

                //----------------call redix server data--------------------------
                client.get(objFence.deviceId, function(err, strgpsdata) {
                    if (!err && strgpsdata != null && strgpsdata != '' && strgpsdata != undefined) {
                        var response = JSON.parse(strgpsdata);
                        console.log("up########", response.DeviceId);
                        //-----------------------------------------------------
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
                    }
                    // Bike.findOne({
                    //     where: {
                    //         deviceid: objFence.deviceId
                    //     }
                    // }).then(function(objPet) {
                    objFence.IsInFence = IsPetInFence;
                    Fence.update(objFence, {
                        where: {
                            id: resFence.id
                        }
                    }).then(function(resUpdate) {
                        // funAuditLog.CreateAuditLog('SaveFence', UserExist.username , 'Delete Pet Tracking');
                        res.json({
                            success: true,
                            message: "Fence created successfully...",
                            data: resUpdate
                        });
                    });
                    // })
                })
            }
        })
    } else {
        Fence.update(objFence, {
            where: {
                id: objFence.idFence
            }
        }).then(function(resFence) {
            // var IsPetInFence = true;
            // PetGPS.findOne({
            //     where: {
            //         DeviceId: objFence.deviceId
            //     },
            //     order: 'id DESC'
            // }).then(function(response) {
            //     if (response != null) {

            //----------------call redix server data--------------------------
            client.get(objFence.deviceId, function(err, strgpsdata) {
                if (!err && strgpsdata != null && strgpsdata != '' && strgpsdata != undefined) {
                    var response = JSON.parse(strgpsdata);
                    console.log("up########", response.DeviceId);
                    //-----------------------------------------------------


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
                }

                // Bike.findOne({
                //     where: {
                //         deviceid: objFence.deviceId
                //     }
                // }).then(function(objPet) {
                objFence.IsInFence = IsPetInFence;
                Fence.update(objFence, {
                    where: {
                        id: objFence.idFence
                    }
                }).then(function(resUpdate) {
                    res.json({
                        success: true,
                        message: "Fence updated successfully...",
                        data: resUpdate
                    });
                });
                // })
            })
        })
    }

});

//--------------------------------------(mobile & web app):-update fence=------------------------------
router.post('/UpdateFenceNameById', jsonParser, function(req, res) {
    objFence = req.body;
    Fence.findOne({
        where: {
            id: objFence.id
        }
    }).then(function(response) {
        if (response != null) {
            response.updateAttributes({ name: objFence.name }).then(function(resUpdate) {
                res.json({
                    success: true,
                    message: "Fence Name updated successfully...",
                    data: response,
                });
            });
        } else {
            res.json({
                success: false,
                message: "Fence Name not updated...",
            });
        }
    });
});

//--------------------------------------(mobile & web app):-Delete fence=------------------------------
router.get('/DeleteFenceById', function(req, res) {
    Fence.destroy({
        where: {
            id: req.query.idFence
        }
    }).then(function(response) {
        if (response) {
            res.json({
                success: true,
                message: "Fence Removed successfully...",
                data: response
            });
        } else {
            res.json({ success: false, message: 'Fence not Removed.' });
        }
    })
});

module.exports = router