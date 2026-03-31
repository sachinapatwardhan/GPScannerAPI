var router = express.Router();
var Vehicle = models.tblvehicle;
var Alarm = models.tblalarm;
var Fence = models.tblfence;
var PetGPS = models.tblgpsdata;
var Bike = models.tblvehicle;
var CanbusData = models.tblcanbusdata;
var DrivingData = models.tbldrivingdata;
var momentz = require('moment-timezone');
var Commonfunction = require('./common.js');

router.get('/GetAllBike', function(req, res) {
    Vehicle.findAll( /*{ order: 'bikeNumber desc' }*/ ).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
});

router.post('/GetPath', jsonParser, function(req, res) {
    var objTask = req.body;
    var query = "Select tblgpsdata.* ,tblvehicle.Name from tblgpsdata, tblvehicle where tblvehicle.deviceid = tblgpsdata.DeviceId and  DATE(tblgpsdata.Datetime) >= '" + convertdateformat(objTask.StartDate) + "' and DATE(tblgpsdata.Datetime)<='" + convertdateformat(objTask.EndDate) + "' and TIME(tblgpsdata.Datetime)>='" + convertdateformat(objTask.StartTime, 1) + "' and  TIME(tblgpsdata.Datetime)<='" + convertdateformat(objTask.EndTime, 1) + "' and tblgpsdata.DeviceId='" + objTask.DeviceId + "' order by DateTime asc";
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
    var Startdate = objTask.StartDate;
    var Enddate = objTask.EndDate;

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


router.get('/ExportReportNew', function(req, res) {
    objTask = req.query;
    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
            caption: 'Date Time',
            type: 'string'
        },
        {
            caption: 'Address',
            type: 'string'
        },
        {
            caption: 'Speed (km/h)',
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
        }
    ];
    var Startdate = objTask.StartDate;
    var Enddate = objTask.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var query = "select Id,Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction, DeviceId,IsPatchEngine as IsEngine, Date from tblgpsdata where deviceid=" + req.query.DeviceId + " and Date >= '" + unixStartdate + "' and Date <= '" + unixEnddate + "' order by Date;"
    console.log(query)
    connection.query(query, function(err, response) {
        conf.rows = [];
        var lstTemp = [];
        var COuntEngineOff = 0;
        for (var i = 0; i < response.length; i++) {
            if (response[i].IsEngine == true) {
                COuntEngineOff = 0;
                lstTemp.push(response[i]);
            } else {
                if (COuntEngineOff == 0) {
                    lstTemp.push(response[i]);
                }
                COuntEngineOff = COuntEngineOff + 1;
            }
        }
        response = lstTemp;
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
                if (response[i].Latitude != undefined && response[i].Latitude != null && response[i].Latitude != '' && response[i].Longitude != undefined && response[i].Longitude != null && response[i].Longitude != '') {
                    Commonfunction.GetAddressLatLong(response[i].Latitude, response[i].Longitude, function(resAddress) {
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
                        if (resAddress != '') {
                            Address = resAddress;
                        } else {
                            Address = "N/A";
                        }
                        row.push(Datetime.toString(), Address, Speed.toString(), GPSPositioning.toString(), Direction.toString(), IsEngine.toString());
                        conf.rows.push(row);
                        setTimeout(function() {
                            GetData(i + 1);
                        });
                    })
                } else {
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
                    setTimeout(function() {
                        GetData(i + 1);
                    });
                }
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
        return (("00" + firstdayDay.toString()).slice(-2) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayYear.toString()).slice(-4) + " " + timeString);

    } else if (flg == 1) {
        return (("00" + firstdayHours.toString()).slice(-2) + ":" + ("00" + firstdayMinutes.toString()).slice(-2) + ":" + ("00" + firstdaySeconds.toString()).slice(-2));
    } else {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}

function convertdateformat(date1, flg) {
    var date = new Date(date1);
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

function convertdateformatForUnix(date1) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

}

router.get('/GetNotification', function(req, res) {
    var search = '';
    //search = 

    var where = '';
    if (req.query.deviceid != '' && req.query.deviceid != undefined && req.query.deviceid != null) {
        where = " and tblvehicle.deviceid= '" + req.query.deviceid + "'";
    }

    var query = "Select tblalarm.*,tblvehicle.Name  from tblalarm LEFT OUTER JOIN tblvehicle ON tblalarm.DeviceId = tblvehicle.deviceid where tblvehicle.iduser ='" + req.query.userid + "' " + where + " ORDER BY tblalarm.createddate desc;";
    connection.query(query, function(err, response) {
        res.json(response);

    })

});

router.post('/SaveFence', jsonParser, function(req, res) {
    objFence = req.body;
    
    Fence.findOrCreate({
        where: {
            deviceId: objFence.deviceId,
            name: objFence.name,
        },
        defaults: objFence
    }).then(function(response) {
        if (objFence.id == 0) {
            if ((response[1])) {
                var IsPetInFence = true;
                Commonfunction.UpdateVehicleRedis(objFence.DeviceId, 'Fence');
                PetGPS.findOne({
                    where: {
                        DeviceId: objFence.deviceId
                    },
                    order: 'id DESC'
                }).then(function(response) {
                    if (response != null) {

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
                            Commonfunction.UpdateVehicleRedis(objFence.deviceId, 'Vehicle');
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
            Fence.update(objFence, {
                where: {
                    
                    id: objFence.id,
                }
            }).then(function(response) {
                var IsPetInFence = true;
                Commonfunction.UpdateVehicleRedis(objFence.deviceId, 'Fence');
                PetGPS.findOne({
                    where: {
                        DeviceId: objFence.deviceId
                    },
                    order: 'id DESC'
                }).then(function(response) {

                    if (response != null) {
                        var CheckPoints = {
                                latitude: parseFloat(response.Latitude),
                                longitude: parseFloat(response.Longitude)
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
                            Commonfunction.UpdateVehicleRedis(objFence.deviceId, 'Vehicle');
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
    Fence.findOne({
        where: {
            id: req.query.id
        }
    }).then(function(FenceExits) {
        var DeviceId = FenceExits.deviceId;
        Fence.destroy({
            where: {
                id: req.query.id
            }
        }).then(function(response) {
            if (response != null) {
                Commonfunction.UpdateVehicleRedis(DeviceId, 'Fence');
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
})

module.exports = router