var router = express.Router();
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var GPSdata = models.tblgpsdata;
var momentz = require('moment-timezone');

router.get('/GetAllGPSByTimeZoneDate', function(req, res) {

    wherecondition = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        wherecondition = ' and tblgpsdata.deviceid=' + req.query.DeviceId;
    }
    var Startdate = req.query.TodayStartDateTime;
    var Enddate = req.query.TodayEndDateTime;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    var orderby = '  order by Date desc';
    if (req.query.orderby != '' && req.query.orderby != undefined && req.query.orderby != null) {
        orderby = ' ' + req.query.orderby;
    }

    var query = "select tblgpsdata.*,tblvehicle.Name from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + " and tblgpsdata.GPSPositioning='A' and tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + orderby + ";"

    connection.query(query, function(err, lstGPSData, fields) {
        res.json(lstGPSData);
    });
});

router.get('/ExportDetailTripReport', function(req, res) {

    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
            caption: 'Asset Name',
            type: 'string'
        }, {
            caption: 'Time',
            type: 'string'
        }, {
            caption: 'Address',
            type: 'string'
        }, {
            caption: 'Device Status',
            type: 'string'
        }, {
            caption: 'Asset Status',
            type: 'string'
        }, {
            caption: 'Speed(km/h)',
            type: 'number'
        }, {
            caption: 'Fule(%)',
            type: 'number'
        }, {
            caption: 'Fule(L)',
            type: 'number'
        }, {
            caption: 'Mileage(km)',
            type: 'number'
        }, {
            caption: 'Temp.(&#8451;)',
            type: 'number'
        }, {
            caption: 'GPS Signal',
            type: 'string'
        }, {
            caption: 'Direction',
            type: 'number'
        }, {
            caption: 'Latitude',
            type: 'number'
        },
        {
            caption: 'Longitude',
            type: 'number'
        }
    ];



    wherecondition = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        wherecondition = ' and tblgpsdata.deviceid=' + req.query.DeviceId;
    }
    var Startdate = req.query.StartDate;
    var Enddate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;



    var query = "select tblgpsdata.*,tblvehicle.Name from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + " and tblgpsdata.GPSPositioning='A' and tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + " order by Datetime;"
    connection.query(query, function(err, response) {
        conf.rows = [];
        for (var i = 0; i < response.length; i++) {
            if (response[i].IsEngine == 1) {
                response[i].IsEngine = "Engine ON";
            } else {
                response[i].IsEngine = "Engine OFF";
            }
            //response.push(response[i]);
        }
        GetData(0);


        function GetData(i) {
            if (i < response.length) {
                var row = [];
                var Name = 'N/A';
                var TIme = 'N/A';
                var Address = 'N/A';
                var DeviceStatus = 'N/A';
                var AssetStatus = 'N/A';
                var Speed = 0.00;
                var Fuleper = 0.00;
                var Fulelett = 0.00;
                var Mileage = 0.00;
                var Temp = 0.00;
                var GPSSignal = 'N/A';
                var Direction = 0.00;
                var Latitude = 0.00;
                var Longitude = 0.00;

                if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                    // Datetime = dateformat(response[i].Datetime, 2);
                    TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                }
                if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                    Name = response[i].Name;
                }
                if (response[i].Address != null && response[i].Address != '' && response[i].Address != undefined) {
                    Address = response[i].Address;
                }

                if (response[i].DeviceStatus != null && response[i].DeviceStatus != '' && response[i].DeviceStatus != undefined) {
                    DeviceStatus = response[i].DeviceStatus;
                }

                if (response[i].IsEngine != null && response[i].IsEngine != '' && response[i].IsEngine != undefined) {
                    AssetStatus = response[i].IsEngine;
                }

                if (response[i].Speed != null && response[i].Speed != '' && response[i].Speed != undefined) {
                    Speed = parseFloat(response[i].Speed).toFixed(2);
                }

                if (response[i].Fuleper != null && response[i].Fuleper != '' && response[i].Fuleper != undefined) {
                    Fuleper = parseFloat(response[i].Fuleper).toFixed(2);
                }
                if (response[i].Fulelett != null && response[i].Fulelett != '' && response[i].Fulelett != undefined) {
                    Fulelett = parseFloat(response[i].Fulelett).toFixed(2);
                }


                if (response[i].Mileage != null && response[i].Mileage != '' && response[i].Mileage != undefined) {
                    Mileage = parseFloat(response[i].Mileage).toFixed(2);
                }
                if (response[i].Temp != null && response[i].Temp != '' && response[i].Temp != undefined) {
                    Temp = parseFloat(response[i].Temp).toFixed(2);
                }

                if (response[i].GPSSignal != null && response[i].GPSSignal != '' && response[i].GPSSignal != undefined) {
                    GPSSignal = parseFloat(response[i].GPSSignal).toFixed(2);
                }

                if (response[i].Direction != null && response[i].Direction != '' && response[i].Direction != undefined) {
                    Direction = response[i].Direction;
                }
                if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                    Latitude = response[i].Latitude;
                }
                if (response[i].Longitude != null && response[i].Longitude != '' && response[i].Longitude != undefined) {
                    Longitude = response[i].Longitude;
                }

                row.push(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
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

router.get('/GetAllFenceInAndOutData', function(req, res) {
    var objParam = req.query;

    var Orderby = 'Order By Date DESC';
    var search = "";
    // var StartDate = convertdateformatForUnix(objParam.StartDate);
    // console.log(StartDate);
    var unixStartdate = new Date(objParam.StartDate).getTime() / 1000;

    // var EndDate = convertdateformatForUnix(objParam.EndDate);
    // console.log(EndDate);
    var unixEndDate = new Date(objParam.EndDate).getTime() / 1000;

    if (objParam.DeviceId != null && objParam.DeviceId != 'All' && objParam.DeviceId != undefined) {
        if (search != "") {
            search += " And tblalarm.DeviceId IN (" + objParam.DeviceId + ")";
        } else {
            search += " Where tblalarm.DeviceId IN (" + objParam.DeviceId + ")";
        }
    } else {
        if (search != "") {
            search += " And tblvehicle.IsDelete = 0 AND tblvehicle.idUser = " + objParam.idUser;
        } else {
            search += " Where tblvehicle.IsDelete = 0 AND tblvehicle.idUser = " + objParam.idUser;
        }
    }

    if (objParam.StartDate != null && objParam.StartDate != '' && objParam.StartDate != undefined) {
        if (search != "") {
            search += " And tblalarm.Date >= '" + unixStartdate + "'";
        } else {
            search += " Where tblalarm.Date >= '" + unixStartdate + "'";
        }
    }

    if (objParam.EndDate != null && objParam.EndDate != '' && objParam.EndDate != undefined) {
        if (search != "") {
            search += " And tblalarm.Date <= '" + unixEndDate + "'";
        } else {
            search += " Where tblalarm.Date <= '" + unixEndDate + "'";
        }
    }

    if (search != "") {
        search += " And tblalarm.AlarmCode IN ('06', '66')";
    } else {
        search += " Where tblalarm.AlarmCode IN ('06', '66')";
    }

    var query = "Select tblalarm.* , tblvehicle.iduser, tblvehicle.Name, tblvehicle.IsOnline from tblalarm left join tblvehicle On tblvehicle.deviceid = tblalarm.DeviceId " + search + Orderby;

    connection.query(query, function(err, response) {
        if (response != undefined) {
            res.json(response);
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })
})

router.get('/ExportFenceReport', function(req, res) {
    var objParam = req.query;
    // console.log(objParam);
    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
        caption: 'Asset Name',
        type: 'string'
    }, {
        caption: 'Time',
        type: 'string'
    }, {
        caption: 'Fence Status',
        type: 'string'
    }, {
        caption: 'Address',
        type: 'string'
    }];
    var Orderby = 'Order By Date DESC';
    var search = "";
    // var StartDate = convertdateformatForUnix(objParam.StartDate);
    // console.log(StartDate);
    var unixStartdate = new Date(objParam.StartDate).getTime() / 1000;

    // var EndDate = convertdateformatForUnix(objParam.EndDate);
    // console.log(EndDate);
    var unixEndDate = new Date(objParam.EndDate).getTime() / 1000;

    if (objParam.DeviceId != null && objParam.DeviceId != 'All' && objParam.DeviceId != undefined) {
        if (search != "") {
            search += " And tblalarm.DeviceId IN (" + objParam.DeviceId + ")";
        } else {
            search += " Where tblalarm.DeviceId IN (" + objParam.DeviceId + ")";
        }
    } else {
        if (search != "") {
            search += " And tblvehicle.IsDelete = 0 AND tblvehicle.idUser = " + objParam.idUser;
        } else {
            search += " Where tblvehicle.IsDelete = 0 AND tblvehicle.idUser = " + objParam.idUser;
        }
    }

    if (objParam.StartDate != null && objParam.StartDate != '' && objParam.StartDate != undefined) {
        if (search != "") {
            search += " And tblalarm.Date >= '" + unixStartdate + "'";
        } else {
            search += " Where tblalarm.Date >= '" + unixStartdate + "'";
        }
    }

    if (objParam.EndDate != null && objParam.EndDate != '' && objParam.EndDate != undefined) {
        if (search != "") {
            search += " And tblalarm.Date <= '" + unixEndDate + "'";
        } else {
            search += " Where tblalarm.Date <= '" + unixEndDate + "'";
        }
    }

    if (search != "") {
        search += " And tblalarm.AlarmCode IN ('06', '66')";
    } else {
        search += " Where tblalarm.AlarmCode IN ('06', '66')";
    }

    var query = "Select tblalarm.* , tblvehicle.iduser, tblvehicle.Name, tblvehicle.IsOnline from tblalarm left join tblvehicle On tblvehicle.deviceid = tblalarm.DeviceId " + search + Orderby;
    // console.log(query);
    connection.query(query, function(err, response) {
        if (response != undefined) {
            conf.rows = [];
            GetData(0);

            function GetData(i) {
                if (i < response.length) {
                    var row = [];
                    var Name = 'N/A';
                    var TIme = 'N/A';
                    var Address = 'N/A';
                    var FenceStatus = 'N/A';

                    if (response[i].Latitude != undefined && response[i].Latitude != null && response[i].Latitude != '' && response[i].Longitude != undefined && response[i].Longitude != null && response[i].Longitude != '') {
                        geocoder.reverse({ lat: response[i].Latitude, lon: response[i].Longitude }, function(err, res) {
                            if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                                // Datetime = dateformat(response[i].Datetime, 2);
                                TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                            }

                            if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                                Name = response[i].Name;
                            }

                            if (response[i].AlarmCode != null && response[i].AlarmCode != '' && response[i].AlarmCode != undefined) {
                                if (response[i].AlarmCode == '06') {
                                    FenceStatus = 'Fence In';
                                } else {
                                    FenceStatus = 'Fence Out';
                                }
                            }

                            if (res.length > 0) {
                                Address = res[0].formattedAddress;
                                row.push(Name.toString(), TIme.toString(), FenceStatus.toString(), Address.toString());
                                conf.rows.push(row);
                            } else {
                                Address = "N/A";
                                row.push(Name.toString(), TIme.toString(), FenceStatus.toString(), Address.toString());
                                conf.rows.push(row);
                            }
                            // console.log(conf.rows);
                            GetData(i + 1);
                        })

                    } else {
                        if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                            // Datetime = dateformat(response[i].Datetime, 2);
                            TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                        }

                        if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                            Name = response[i].Name;
                        }

                        if (response[i].AlarmCode != null && response[i].AlarmCode != '' && response[i].AlarmCode != undefined) {
                            if (response[i].AlarmCode == '06') {
                                FenceStatus = 'Fence In';
                            } else {
                                FenceStatus = 'Fence Out';
                            }
                        }

                        Address = "N/A";
                        row.push(Name.toString(), TIme.toString(), FenceStatus.toString(), Address.toString());
                        conf.rows.push(row);
                        GetData(i + 1);
                    }
                    // conf.rows.push(Name.toString(), TIme.toString(), FenceStatus.toString(), Address.toString());
                    // GetData(i + 1);
                } else {
                    var result = nodeExcel.execute(conf);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader("Content-Disposition", "attachment; filename=FenceInOutDetail.xlsx");
                    res.end(result, 'binary');
                }
            }
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })
})

router.get('/GetAllEngineData', function(req, res) {
    var objParam = req.query;

    var Orderby = ' Order By Date ASC';
    var search = "";

    var unixStartdate = new Date(objParam.StartDate).getTime() / 1000;

    var unixEndDate = new Date(objParam.EndDate).getTime() / 1000;

    if (objParam.DeviceId != null && objParam.DeviceId != 'All' && objParam.DeviceId != undefined) {
        if (search != "") {
            search += " And tblgpsdata.DeviceId = " + objParam.DeviceId;
        } else {
            search += " Where tblgpsdata.DeviceId = " + objParam.DeviceId;
        }
    }

    if (objParam.StartDate != null && objParam.StartDate != '' && objParam.StartDate != undefined) {
        if (search != "") {
            search += " And tblgpsdata.Date >= '" + unixStartdate + "'";
        } else {
            search += " Where tblgpsdata.Date >= '" + unixStartdate + "'";
        }
    }

    if (objParam.EndDate != null && objParam.EndDate != '' && objParam.EndDate != undefined) {
        if (search != "") {
            search += " And tblgpsdata.Date <= '" + unixEndDate + "'";
        } else {
            search += " Where tblgpsdata.Date <= '" + unixEndDate + "'";
        }
    }

    var query = "SELECT tblgpsdata.Id, tblgpsdata.Datetime, tblgpsdata.Date, tblgpsdata.Latitude, tblgpsdata.Longitude, tblgpsdata.DeviceId, tblgpsdata.IsEngine, tblgpsdata.Speed, tblvehicle.Name, tblvehicle.iduser FROM tblgpsdata LEFT JOIN tblvehicle ON tblvehicle.deviceid = tblgpsdata.DeviceId " + search;
    query += Orderby;
    console.log(query);
    connection.query(query, function(err, response) {
        if (response != undefined) {
            res.json(response);
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })
})

router.get('/ExportEngineReport', function(req, res) {
    var objParam = req.query;
    // console.log(objParam);
    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
        caption: 'Asset Name',
        type: 'string'
    }, {
        caption: 'Engine Status',
        type: 'string'
    }, {
        caption: 'Continuous Time',
        type: 'string'
    }, {
        caption: 'Start Time',
        type: 'string'
    }, {
        caption: 'End Time',
        type: 'string'
    }, {
        caption: 'Mileage',
        type: 'string'
    }];

    var Orderby = ' Order By Date ASC';
    var search = "";

    var unixStartdate = new Date(objParam.StartDate).getTime() / 1000;

    var unixEndDate = new Date(objParam.EndDate).getTime() / 1000;

    if (objParam.DeviceId != null && objParam.DeviceId != 'All' && objParam.DeviceId != undefined) {
        if (search != "") {
            search += " And tblgpsdata.DeviceId = " + objParam.DeviceId;
        } else {
            search += " Where tblgpsdata.DeviceId = " + objParam.DeviceId;
        }
    }

    if (objParam.StartDate != null && objParam.StartDate != '' && objParam.StartDate != undefined) {
        if (search != "") {
            search += " And tblgpsdata.Date >= '" + unixStartdate + "'";
        } else {
            search += " Where tblgpsdata.Date >= '" + unixStartdate + "'";
        }
    }

    if (objParam.EndDate != null && objParam.EndDate != '' && objParam.EndDate != undefined) {
        if (search != "") {
            search += " And tblgpsdata.Date <= '" + unixEndDate + "'";
        } else {
            search += " Where tblgpsdata.Date <= '" + unixEndDate + "'";
        }
    }

    var query = "SELECT tblgpsdata.Id, tblgpsdata.Datetime, tblgpsdata.Date, tblgpsdata.Latitude, tblgpsdata.Longitude, tblgpsdata.DeviceId, tblgpsdata.IsEngine, tblgpsdata.Speed, tblvehicle.Name, tblvehicle.iduser FROM tblgpsdata LEFT JOIN tblvehicle ON tblvehicle.deviceid = tblgpsdata.DeviceId " + search;
    query += Orderby;
    connection.query(query, function(err, response) {
        var lstEngine = [];
        if (response != undefined) {
            conf.rows = [];
            var COuntEngineOff = 0;
            var COuntEngineOn = 0;

            FilterArray(0);

            function FilterArray(k) {
                if (k < response.length) {
                    if (response[k].IsEngine == 1) {
                        if (COuntEngineOn == 0) {
                            lstEngine.push(response[k]);
                            COuntEngineOff = 0;
                            COuntEngineOn = COuntEngineOn + 1;
                            FilterArray(k + 1);
                        } else {
                            FilterArray(k + 1);
                            COuntEngineOff = 0;
                            COuntEngineOn = COuntEngineOn + 1;
                        }
                    } else {
                        if (COuntEngineOff == 0) {
                            lstEngine.push(response[k]);
                            COuntEngineOn = 0;
                            COuntEngineOff = COuntEngineOff + 1;
                            FilterArray(k + 1);
                        } else {
                            COuntEngineOn = 0;
                            COuntEngineOff = COuntEngineOff + 1;
                            FilterArray(k + 1);
                        }

                    }
                } else {
                    GetData(0);
                }

                function GetData(i) {
                    if (i < lstEngine.length) {
                        var row = [];
                        var Name = '';
                        var Status = '';
                        var ContinueTIme = '';
                        var StartTime = '';
                        var EndTime = '';
                        var Mileage = 0.00;
                        var DatewiseTravelledDistance = 0;
                        if (lstEngine[i].Name != null && lstEngine[i].Name != '' && lstEngine[i].Name != undefined) {
                            Name = lstEngine[i].Name;
                        }

                        if (lstEngine[i].IsEngine != null && lstEngine[i].IsEngine != '' && lstEngine[i].IsEngine != undefined) {
                            if (lstEngine[i].IsEngine == 1) {
                                Status = 'Engine On';
                            } else {
                                Status = 'Engine Off';
                            }
                        } else {
                            Status = 'Engine Off';
                        }

                        // $scope.lstEngine[j].StartTime = $scope.lstEngine[j].DisplayDate;

                        if (i != lstEngine.length - 1) {
                            if (lstEngine[i].Date != null && lstEngine[i].Date != '' && lstEngine[i].Date != undefined) {
                                StartTime = momentz.utc(new Date(lstEngine[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                EndTime = momentz.utc(new Date(lstEngine[i + 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                ContinueTime = calcDateDiff(EndTime, StartTime);
                                // Datetime = dateformat(response[i].Datetime, 2);
                            }

                        } else {
                            if (lstEngine[i].Date != null && lstEngine[i].Date != '' && lstEngine[i].Date != undefined) {
                                StartTime = momentz.utc(new Date(lstEngine[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                EndTime = moment(new Date(response[response.length - 1].Date * 1000)).format('DD-MM-YYYY hh:mm:ss a');
                                ContinueTime = calcDateDiff(EndTime, StartTime);
                            }
                        }
                        if (lstEngine[i].Latitude != undefined && lstEngine[i].Latitude != null && lstEngine[i].Latitude != '' && lstEngine[i].Longitude != undefined && lstEngine[i].Longitude != null && lstEngine[i].Longitude != '') {
                            if (i != 0) {
                                DatewiseTravelledDistance = distance(parseFloat(lstEngine[i - 1].Latitude), parseFloat(lstEngine[i - 1].Longitude), parseFloat(lstEngine[i].Latitude), parseFloat(lstEngine[i].Longitude))
                                Mileage = parseFloat(DatewiseTravelledDistance).toFixed(2);
                            } else {
                                DatewiseTravelledDistance = 0;
                                Mileage = parseFloat(DatewiseTravelledDistance).toFixed(2);
                            }
                        }

                        row.push(Name.toString(), Status.toString(), ContinueTime.toString(), StartTime.toString(), EndTime.toString(), Mileage.toString());
                        conf.rows.push(row);
                        GetData(i + 1);
                    } else {
                        var result = nodeExcel.execute(conf);
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader("Content-Disposition", "attachment; filename=EngineOnOffDetail.xlsx");
                        res.end(result, 'binary');
                    }
                }
            }
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })
})

/*================ LastPosition Report Start====================*/
router.get('/GetAllVehicleLastPositionByUserIdWebApp', jsonParser, function(req, res) {
    var WhereCondition = '';
    var StartDate = req.query.StartDate;
    var EndDate = req.query.EndDate;

    if (StartDate != '' && EndDate != '') {
        StartDate = momentz(StartDate).format('YYYY-MM-DD HH:mm:ss');
        EndDate = momentz(EndDate).format('YYYY-MM-DD HH:mm:ss');

        if (WhereCondition == '') {
            WhereCondition = 'where Datetime>="' + StartDate + '" and Datetime<="' + EndDate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Datetime>="' + StartDate + '" and Datetime<="' + EndDate + '" ';
        }
    } else if (StartDate != null && StartDate != '') {
        StartDate = momentz(StartDate).format('YYYY-MM-DD HH:mm:ss');
        if (WhereCondition == '') {
            WhereCondition = 'where Datetime>="' + StartDate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Datetime>="' + StartDate + '" ';
        }
    } else if (EndDate != null && EndDate != '') {
        EndDate = momentz(EndDate).format('YYYY-MM-DD HH:mm:ss');
        if (WhereCondition == '') {
            WhereCondition = 'where Datetime<="' + EndDate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Datetime<="' + EndDate + '" ';
        }
    }

    connection.query("SELECT  tb.*,tpg.IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction FROM tblvehicle tb Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId, MAX(Datetime) as maxDate FROM (SELECT DeviceId, Datetime FROM tblgpsdata " + WhereCondition + "ORDER BY Datetime DESC) d GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Datetime = b.maxDate WHERE iduser=" + req.query.UserId + " and IsDelete=false group by tb.deviceid;", function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
});

router.get('/ExportLastPositionDataByUserId', function(req, res) {

    req.setTimeout(1800000);

    var conf = {};
    conf.name = "sheet1";
    conf.cols = [];
    conf.rows = [];
    conf.cols = [{
        caption: 'Assest Name',
        type: 'string'
    }, {
        caption: 'Device Id',
        type: 'string'
    }, {
        caption: 'Time',
        type: 'string'
    }, {
        caption: 'Address',
        type: 'string'
    }, {
        caption: 'Device Status',
        type: 'string'
    }, {
        caption: 'Engine',
        type: 'string'
    }, {
        caption: 'Door',
        type: 'string'
    }, {
        caption: 'Speed',
        type: 'string'
    }, {
        caption: 'Latitude',
        type: 'string'
    }, {
        caption: 'Longitude',
        type: 'string'
    }, {
        caption: 'Direction',
        type: 'string'
    }];

    var WhereCondition = '';
    var StartDate = req.query.StartDate;
    var EndDate = req.query.EndDate;

    if (StartDate != '' && EndDate != '') {
        StartDate = new Date(StartDate);
        EndDate = new Date(EndDate);
        var StartDate1 = momentz.utc(StartDate).format('YYYY-MM-DD HH:mm:ss');
        var EndDate1 = momentz.utc(EndDate).format('YYYY-MM-DD HH:mm:ss');


        if (WhereCondition == '') {
            WhereCondition = 'where Datetime>="' + StartDate1 + '" and Datetime<="' + EndDate1 + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Datetime>="' + StartDate1 + '" and Datetime<="' + EndDate1 + '" ';
        }
    } else if (StartDate != null && StartDate != '') {
        StartDate = new Date(StartDate);
        var StartDate1 = momentz.utc(StartDate).format('YYYY-MM-DD HH:mm:ss');
        if (WhereCondition == '') {
            WhereCondition = 'where Datetime>="' + StartDate1 + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Datetime>="' + StartDate1 + '" ';
        }
    } else if (EndDate != null && EndDate != '') {
        EndDate = new Date(EndDate);
        var EndDate1 = momentz.utc(EndDate).format('YYYY-MM-DD HH:mm:ss');
        if (WhereCondition == '') {
            WhereCondition = 'where Datetime<="' + EndDate1 + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Datetime<="' + EndDate1 + '" ';
        }
    }
    connection.query("SELECT  tb.*,tpg.IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction FROM tblvehicle tb Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId, MAX(Datetime) as maxDate FROM (SELECT DeviceId, Datetime FROM tblgpsdata " + WhereCondition + "ORDER BY Datetime DESC) d GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Datetime = b.maxDate WHERE iduser=" + req.query.UserId + " and IsDelete=false group by tb.deviceid;", function(err, rows, fields) {
        if (!err) {
            var ListPostionData = rows;
            ExportData(ListPostionData)
        } else {
            var ListPostionData = [];
            ExportData(ListPostionData)
        }
    })

    function ExportData(ListPostionData) {
        function AddList(i) {
            if (i < ListPostionData.length) {

                if (ListPostionData[i].Latitude != undefined && ListPostionData[i].Latitude != null && ListPostionData[i].Latitude != '' && ListPostionData[i].Longitude != undefined && ListPostionData[i].Longitude != null && ListPostionData[i].Longitude != '') {
                    // var Address = '';
                    geocoder.reverse({ lat: ListPostionData[i].Latitude, lon: ListPostionData[i].Longitude }, function(err, res) {
                        if (ListPostionData[i].Name != undefined && ListPostionData[i].Name != null && ListPostionData[i].Name != '') {
                            var AssestName = ListPostionData[i].Name.toString();
                        } else {
                            var AssestName = "N/A";
                        }

                        if (ListPostionData[i].deviceid != undefined && ListPostionData[i].deviceid != null && ListPostionData[i].deviceid != '') {
                            var DeviceId = ListPostionData[i].deviceid.toString();
                        } else {
                            var DeviceId = "N/A";
                        }

                        if (ListPostionData[i].Datetime != undefined && ListPostionData[i].Datetime != null && ListPostionData[i].Datetime != '') {
                            var Time = momentz(ListPostionData[i].Datetime).format('YYYY-MM-DD HH:mm:ss').toString();
                        } else {
                            var Time = "N/A";
                        }

                        if (ListPostionData[i].IsOnline != undefined && ListPostionData[i].IsOnline != null && ListPostionData[i].IsOnline != '') {
                            var DeviceStatus = ListPostionData[i].IsOnline.toString();
                        } else {
                            var DeviceStatus = "0";
                        }

                        if (ListPostionData[i].IsEngine != undefined && ListPostionData[i].IsEngine != null && ListPostionData[i].IsEngine != '') {
                            if (ListPostionData[i].IsEngine == 1) {
                                var Engine = "ON";
                            } else {
                                var Engine = "OFF";
                            }
                        } else {
                            var Engine = "OFF";
                        }

                        if (ListPostionData[i].IsDoor != undefined && ListPostionData[i].IsDoor != null && ListPostionData[i].IsDoor != '') {
                            if (ListPostionData[i].IsDoor == 1) {
                                var Door = "Open";
                            } else {
                                var Door = "Close";
                            }
                        } else {
                            var Door = "Close";
                        }

                        if (ListPostionData[i].Speed != undefined && ListPostionData[i].Speed != null && ListPostionData[i].Speed != '') {
                            var Speed = ListPostionData[i].Speed.toString();
                        } else {
                            var Speed = "0";
                        }

                        if (ListPostionData[i].Latitude != undefined && ListPostionData[i].Latitude != null && ListPostionData[i].Latitude != '') {
                            var Latitude = ListPostionData[i].Latitude.toString();
                        } else {
                            var Latitude = "0";
                        }

                        if (ListPostionData[i].Longitude != undefined && ListPostionData[i].Longitude != null && ListPostionData[i].Longitude != '') {
                            var Longitude = ListPostionData[i].Longitude.toString();
                        } else {
                            var Longitude = "0";
                        }

                        if (ListPostionData[i].Direction != undefined && ListPostionData[i].Direction != null && ListPostionData[i].Direction != '') {
                            var Direction = ListPostionData[i].Direction.toString();
                        } else {
                            var Direction = "0";
                        }

                        if (res.length > 0) {
                            var Address = res[0].formattedAddress;
                            conf.rows.push([AssestName, DeviceId, Time, Address, DeviceStatus, Engine, Door, Speed, Latitude, Longitude, Direction]);
                        } else {
                            var Address = "N/A";
                            conf.rows.push([AssestName, DeviceId, Time, Address, DeviceStatus, Engine, Door, Speed, Latitude, Longitude, Direction]);
                        }
                        AddList(i + 1);

                    });

                } else {
                    if (ListPostionData[i].Name != undefined && ListPostionData[i].Name != null && ListPostionData[i].Name != '') {
                        var AssestName = ListPostionData[i].Name.toString();
                    } else {
                        var AssestName = "N/A";
                    }

                    if (ListPostionData[i].deviceid != undefined && ListPostionData[i].deviceid != null && ListPostionData[i].deviceid != '') {
                        var DeviceId = ListPostionData[i].deviceid.toString();
                    } else {
                        var DeviceId = "N/A";
                    }

                    if (ListPostionData[i].Datetime != undefined && ListPostionData[i].Datetime != null && ListPostionData[i].Datetime != '') {
                        var Time = ListPostionData[i].Datetime.toString();
                    } else {
                        var Time = "N/A";
                    }

                    if (ListPostionData[i].IsOnline != undefined && ListPostionData[i].IsOnline != null && ListPostionData[i].IsOnline != '') {
                        var DeviceStatus = ListPostionData[i].IsOnline.toString();
                    } else {
                        var DeviceStatus = "0";
                    }

                    if (ListPostionData[i].IsEngine != undefined && ListPostionData[i].IsEngine != null && ListPostionData[i].IsEngine != '') {
                        if (ListPostionData[i].IsEngine == 1) {
                            var Engine = "ON";
                        } else {
                            var Engine = "OFF";
                        }
                    } else {
                        var Engine = "OFF";
                    }

                    if (ListPostionData[i].IsDoor != undefined && ListPostionData[i].IsDoor != null && ListPostionData[i].IsDoor != '') {
                        if (ListPostionData[i].IsDoor == 1) {
                            var Door = "Open";
                        } else {
                            var Door = "Close";
                        }
                    } else {
                        var Door = "Close";
                    }

                    if (ListPostionData[i].Speed != undefined && ListPostionData[i].Speed != null && ListPostionData[i].Speed != '') {
                        var Speed = ListPostionData[i].Speed.toString();
                    } else {
                        var Speed = "0";
                    }

                    if (ListPostionData[i].Latitude != undefined && ListPostionData[i].Latitude != null && ListPostionData[i].Latitude != '') {
                        var Latitude = ListPostionData[i].Latitude.toString();
                    } else {
                        var Latitude = "0";
                    }

                    if (ListPostionData[i].Longitude != undefined && ListPostionData[i].Longitude != null && ListPostionData[i].Longitude != '') {
                        var Longitude = ListPostionData[i].Longitude.toString();
                    } else {
                        var Longitude = "0";
                    }

                    if (ListPostionData[i].Direction != undefined && ListPostionData[i].Direction != null && ListPostionData[i].Direction != '') {
                        var Direction = ListPostionData[i].Direction.toString();
                    } else {
                        var Direction = "0";
                    }
                    var Address = "N/A";
                    conf.rows.push([AssestName, DeviceId, Time, Address, DeviceStatus, Engine, Door, Speed, Latitude, Longitude, Direction]);
                    AddList(i + 1);
                }
            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=" + "LastPositionData.xlsx");
                res.end(result, 'binary');
            }

        }
        AddList(0);
    }
});
/*================ LastPosition Report End====================*/

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


function calcDateDiff(date1, date2) {
    // var l = moment.duration(date1.diff(date2, 'milliseconds'));
    var l = moment.duration(moment(date1, "DD/MM/YYYY HH:mm:ss").diff(moment(date2, "DD/MM/YYYY HH:mm:ss")), 'milliseconds');
    var diff = l.asMilliseconds();
    var difference_ms = diff;
    difference_ms = difference_ms / 1000;
    var seconds = Math.floor(difference_ms % 60);
    difference_ms = difference_ms / 60; // minute
    var minutes = Math.floor(difference_ms % 60);
    difference_ms = difference_ms / 60; //hours
    var hours = Math.floor(difference_ms % 24);
    var days = Math.floor(difference_ms / 24);

    if (days != 0) {
        return days + ' days, ' + hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds';
    } else if (hours != 0) {
        return hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds';
    } else if (minutes != 0) {
        return minutes + ' minutes, and ' + seconds + ' seconds';
    } else {
        return seconds + ' seconds';
    };


}

function distance(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

module.exports = router