var router = express.Router();
var Vehicle = models.tblvehicle;
var Alarm = models.tblalarm;
var Fence = models.tblfence;
var PetGPS = models.tblgpsdata;
var Bike = models.tblvehicle;
var CanbusData = models.tblcanbusdata;
var DrivingData = models.tbldrivingdata;
router.get('/GetAllBike', function(req, res) {
    Vehicle.findAll( /*{ order: 'bikeNumber desc' }*/ ).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
});

router.post('/GetPath', jsonParser, function(req, res) {
    var objTask = req.body;
    console.log("@@...", objTask);


    var query = "Select tblgpsdata.* ,tblvehicle.Name from tblgpsdata, tblvehicle where tblvehicle.deviceid = tblgpsdata.DeviceId and  DATE(tblgpsdata.Datetime) >= '" + convertdateformat(objTask.StartDate) + "' and DATE(tblgpsdata.Datetime)<='" + convertdateformat(objTask.EndDate) + "' and TIME(tblgpsdata.Datetime)>='" + convertdateformat(objTask.StartTime, 1) + "' and  TIME(tblgpsdata.Datetime)<='" + convertdateformat(objTask.EndTime, 1) + "' and tblgpsdata.DeviceId='" + objTask.DeviceId + "' order by DateTime asc";
    console.log(query);
    connection.query(query, function(err, response) {
        if (response != undefined && response != null && response.length != 0) {
            // console.log(response);
            res.json({ success: true, data: response });
        } else {
            var response1 = new Object()
            res.json({ success: false, data: response1 });
        }
    })

});

router.get('/ExportReport', function(req, res) {
    objTask = req.query;
    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
        caption: 'Date Time',
        type: 'string'
    }, {
        caption: 'Latitude/Longtitude',
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
    }];

    var query = "Select * from tblgpsdata where DATE(tblgpsdata.Datetime) >= '" + dateformat(new Date(objTask.StartDate)) + "' and DATE(tblgpsdata.Datetime)<='" + dateformat(new Date(objTask.EndDate)) + "' and TIME(tblgpsdata.Datetime)>='" + dateformat(new Date(objTask.StartTime), 1) + "' and  TIME(tblgpsdata.Datetime)<='" + dateformat(new Date(objTask.EndTime), 1) + "' and DeviceId='" + objTask.DeviceId + "' order by DateTime asc";
    console.log(query);
    connection.query(query, function(err, response) {
        console.log(response);
        conf.rows = [];
        GetData(0);

        function GetData(i) {


            if (i < response.length) {
                var row = [];


                var Datetime = 'N/A';
                var longitude = 0.00;
                var Longtitude = 0.00;
                var Speed = 0.00;
                var GPSPositioning = 'N/A';
                var Direction = 0.00;


                if (response[i].Datetime != null && response[i].Datetime != '' && response[i].Datetime != undefined) {
                    Datetime = dateformat(response[i].Datetime, 2);
                }

                if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                    Latitude = response[i].Latitude;
                }
                if (response[i].Longtitude != null && response[i].Longtitude != '' && response[i].Longtitude != undefined) {
                    Longtitude = response[i].Longtitude;
                }
                if (response[i].GPSPositioning != null && response[i].GPSPositioning != '' && response[i].GPSPositioning != undefined) {
                    GPSPositioning = response[i].GPSPositioning;
                }
                if (response[i].Speed != null && response[i].Speed != '' && response[i].Speed != undefined) {
                    Speed = response[i].Speed;
                }
                if (response[i].Direction != null && response[i].Direction != '' && response[i].Direction != undefined) {
                    Direction = response[i].Direction;
                }
                var latlng = Longtitude + "/" + Longtitude;
                row.push(Datetime.toString(), latlng, GPSPositioning.toString(), Speed.toString(), Direction.toString());
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

function dateformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getUTCMonth() + 1;
    var firstdayDay = date.getUTCDate();
    var firstdayYear = date.getUTCFullYear();
    var firstdayHours = date.getUTCHours();
    var firstdayMinutes = date.getUTCMinutes();
    var firstdaySeconds = date.getUTCSeconds();
    if (flg == 2) {
        var newdate = (("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + "  " + ("00" + firstdayHours.toString()).slice(-2) + ":" + ("00" + firstdayMinutes.toString()).slice(-2) + ":" + ("00" + firstdaySeconds.toString()).slice(-2));
        newdate = new Date(newdate);
        var options = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        var timeString = newdate.toLocaleString('en-US', options);
        // console.log(timeString);
        return (("00" + firstdayDay.toString()).slice(-2) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayYear.toString()).slice(-4) + "  " + timeString);

    } else if (flg == 1) {
        return (("00" + firstdayHours.toString()).slice(-2) + ":" + ("00" + firstdayMinutes.toString()).slice(-2) + ":" + ("00" + firstdaySeconds.toString()).slice(-2));
    } else {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}

function convertdateformat(date1, flg) {
    var date = new Date(date1);
    console.log(date);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();
    if (flg == 1) {
        return (("00" + firstdayHours.toString()).slice(-2) + ":" + ("00" + firstdayMinutes.toString()).slice(-2) + ":" + ("00" + firstdaySeconds.toString()).slice(-2));
    } else if (flg == 0) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
    } else if (flg == 3) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    } else if (flg == "sdt") {
        //return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00").toString().slice(-2) + ':' + ("00").toString().slice(-2) + ':' + ("00").toString().slice(-2);
    } else if (flg == "edt") {
        //return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("23").toString().slice(-2) + ':' + ("59").toString().slice(-2) + ':' + ("59").toString().slice(-2);
    } else {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}

router.get('/GetNotification', function(req, res) {
    var search = '';
    //search = 

    var where = '';
    if (req.query.deviceid != '' && req.query.deviceid != undefined && req.query.deviceid != null) {
        where = " and tblvehicle.deviceid= '" + req.query.deviceid + "'";
    }

    var query = "Select tblalarm.*,tblvehicle.Name  from tblalarm LEFT OUTER JOIN tblvehicle ON tblalarm.DeviceId = tblvehicle.deviceid where tblvehicle.iduser ='" + req.query.userid + "' " + where + " ORDER BY tblalarm.createddate desc;";
    console.log(query);
    connection.query(query, function(err, response) {
        res.json(response);

    })

});

router.post('/SaveFence', jsonParser, function(req, res) {
    objFence = req.body;
    console.log(objFence)
        // objHeader = req.headers;
        // var token = getToken(objHeader);
        // if (token) {
        //     var decoded = jwt.decode(token, TokenKey);
        //     User.findOne({
        //         where: {
        //             username: decoded.username,
        //             password: decoded.password
        //         }
        //     }).then(function(UserExist) {
        //         if (UserExist != null) {
    Fence.findOrCreate({
        where: {
            deviceId: objFence.deviceId,
            name: objFence.name,
        },
        defaults: objFence
    }).then(function(response) {
        console.log("@@@.....", response);
        if (objFence.id == 0) {
            if ((response[1])) {
                var IsPetInFence = true;
                console.log("ssd....");
                PetGPS.findOne({
                    where: {
                        DeviceId: objFence.deviceId
                    },
                    order: 'id DESC'
                }).then(function(response) {
                    if (response != null) {

                        var CheckPoints = {
                            latitude: parseFloat(response.Latitude),
                            longitude: parseFloat(response.Longtitude)
                        }

                        if (objFence.fencedraw == "circle") {
                            var CircleCenterPoints = {
                                latitude: parseFloat(objFence.lat),
                                longitude: parseFloat(objFence.lng)
                            }
                            var CircleRadius = parseFloat(objFence.range);
                            IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)

                            // console.log("IsPetIn Fence - " + IsPetInFence)
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
                                // console.log("IsPetIn Fence - " + IsPetInFence)
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

                            // console.log(lstpolygonDrawC)
                            IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                // console.log("Sqre IsPetIn Fence - " + IsPetInFence)
                        };
                    }

                    Bike.findOne({
                        where: {
                            deviceid: objFence.deviceId
                        }
                    }).then(function(objPet) {
                        objPet.updateAttributes({ IsInFence: IsPetInFence }).then(function(resUpdate) {
                            // funAuditLog.CreateAuditLog('SaveFence', UserExist.username , 'Delete Pet Tracking');
                            res.json({
                                success: true,
                                message: "Fence created successfully...",
                                data: response
                            });
                        });
                    })

                })
            }
        } else {
            console.log("@@....");
            Fence.update(objFence, {
                where: {
                    //deviceId: objFence.deviceId
                    id: objFence.id,
                }
            }).then(function(response) {
                var IsPetInFence = true;
                PetGPS.findOne({
                    where: {
                        DeviceId: objFence.deviceId
                    },
                    order: 'id DESC'
                }).then(function(response) {
                    if (response != null) {
                        var CheckPoints = {
                                latitude: parseFloat(response.Latitude),
                                longitude: parseFloat(response.Longtitude)
                            }
                            // var IsPetInFence = true;

                        if (objFence.fencedraw == "circle") {
                            var CircleCenterPoints = {
                                latitude: parseFloat(objFence.lat),
                                longitude: parseFloat(objFence.lng)
                            }
                            var CircleRadius = parseFloat(objFence.range);
                            IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)

                            // console.log("IsPetIn Fence - " + IsPetInFence)
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
                                // console.log("IsPetIn Fence - " + IsPetInFence)
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

                            // console.log(lstpolygonDrawC)
                            IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                // console.log("Sqre IsPetIn Fence - " + IsPetInFence)
                        };
                    }

                    Bike.findOne({
                        where: {
                            deviceid: objFence.deviceId
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

router.get('/GetFenceByPet', function(req, res) {
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
router.get('/GetAllCanvasData', function(req, res) {

    CanbusData.findOne({
        where: { DeviceId: req.query.DeviceId },
        order: 'CreatedDate desc',
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
});
router.get('/GetAllDrivingData', function(req, res) {

    DrivingData.findOne({
        where: { DeviceId: req.query.DeviceId },
        order: 'CreatedDate desc',
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
});
router.get('/DeleteFence', function(req, res) {
    Fence.destroy({
        where: {
            id: req.query.id
        }
    }).then(function(response) {
        if (response != null) {
            res.json({
                success: true,
                message: "Fence Deleted Successfully...",
                data: response
            });
        } else {
            res.json(RecordNotFound);
        }
    })
})

module.exports = router