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

                if (response[i].Latitude != undefined && response[i].Latitude != null && response[i].Latitude != '' && response[i].Longitude != undefined && response[i].Longitude != null && response[i].Longitude != '') {
                    geocoder.reverse({ lat: response[i].Latitude, lon: response[i].Longitude }, function(err, res) {
                        if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                            // Datetime = dateformat(response[i].Datetime, 2);
                            TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                        }
                        if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                            Name = response[i].Name;
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
                        if (err || res == null) {
                            if (res.length > 0) {
                                Address = res[0].formattedAddress;
                                row.push(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
                            } else {
                                Address = "N/A";
                                row.push(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
                            }
                        } else {
                            Address = "N/A";
                            row.push(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
                        }
                        conf.rows.push(row);
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
                }
                /*console.log(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);

                row.push(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
                conf.rows.push(row);
                GetData(i + 1);*/
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
                            setTimeout(function() {
                                FilterArray(k + 1);
                            }, 10)

                        } else {
                            setTimeout(function() {
                                FilterArray(k + 1);
                            }, 10)
                            COuntEngineOff = 0;
                            COuntEngineOn = COuntEngineOn + 1;
                        }
                    } else {
                        if (COuntEngineOff == 0) {
                            lstEngine.push(response[k]);
                            COuntEngineOn = 0;
                            COuntEngineOff = COuntEngineOff + 1;
                            setTimeout(function() {
                                FilterArray(k + 1);
                            }, 10)
                        } else {
                            COuntEngineOn = 0;
                            COuntEngineOff = COuntEngineOff + 1;
                            setTimeout(function() {
                                FilterArray(k + 1);
                            }, 10)
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
                            if (lstEngine[i].Latitude != undefined && lstEngine[i].Latitude != null && lstEngine[i].Latitude != '' && lstEngine[i].Longitude != undefined && lstEngine[i].Longitude != null && lstEngine[i].Longitude != '') {
                                DatewiseTravelledDistance = distance(parseFloat(lstEngine[i].Latitude), parseFloat(lstEngine[i].Longitude), parseFloat(lstEngine[i + 1].Latitude), parseFloat(lstEngine[i + 1].Longitude))
                                Mileage = parseFloat(DatewiseTravelledDistance).toFixed(2);
                            }

                        } else {
                            if (lstEngine[i].Date != null && lstEngine[i].Date != '' && lstEngine[i].Date != undefined) {
                                StartTime = momentz.utc(new Date(lstEngine[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                EndTime = moment(new Date(response[response.length - 1].Date * 1000)).format('DD-MM-YYYY hh:mm:ss a');
                                ContinueTime = calcDateDiff(EndTime, StartTime);
                            }
                            DatewiseTravelledDistance = 0;
                            Mileage = parseFloat(DatewiseTravelledDistance).toFixed(2);
                        }

                        row.push(Name.toString(), Status.toString(), ContinueTime.toString(), StartTime.toString(), EndTime.toString(), Mileage.toString());
                        conf.rows.push(row);

                        setTimeout(function() {
                            GetData(i + 1);
                        }, 10)
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

    connection.query("SELECT  tb.*,tpg.IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction FROM tblvehicle tb Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId, MAX(Datetime) as maxDate FROM (SELECT DeviceId, Datetime FROM tblgpsdata " + WhereCondition + "ORDER BY Datetime DESC) d GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Datetime = b.maxDate WHERE iduser=" + req.query.UserId + " and IsDelete=false group by tb.deviceid order by Name;", function(err, rows, fields) {
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
    connection.query("SELECT  tb.*,tpg.IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction FROM tblvehicle tb Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId, MAX(Datetime) as maxDate FROM (SELECT DeviceId, Datetime FROM tblgpsdata " + WhereCondition + "ORDER BY Datetime DESC) d GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Datetime = b.maxDate WHERE iduser=" + req.query.UserId + " and IsDelete=false group by tb.deviceid order by Name;", function(err, rows, fields) {
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
/*-------------------------Parking Report Start-----------------------*/

router.get('/GetAllParkingData', function(req, res) {

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


    var query = "select tblgpsdata.*,tblvehicle.Name from tblgpsdata inner join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + " and tblgpsdata.GPSPositioning='A' and tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + ' order by tblgpsdata.Date asc' + ";"
    console.log(query);
    connection.query(query, function(err, response, fields) {

        if (response.length > 0) {


            var groups = u.groupBy(response, function(o) {
                return o.DeviceId;
            });

            var lstGroup = u.map(groups, function(group) {

                return {
                    data: group
                }
            });
            var l = 0;
            var COuntEngineOff = 0;
            var Array = [];
            var StartDate = '';
            var EndDate = '';
            for (var i = 0; i < lstGroup.length; i++) {
                COuntEngineOff = 0;
                if (lstGroup[i].data.length > 0) {
                    for (var k = 0; k < lstGroup[i].data.length; k++) {
                        if (lstGroup[i].data[k].IsEngine == 0) {
                            // console.log(lstGroup[i].data[k].Id)
                            if (COuntEngineOff == 0) {
                                var obj = new Object();
                                obj.Latitude = lstGroup[i].data[k].Latitude;
                                obj.Longitude = lstGroup[i].data[k].Longitude;
                                obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                obj.Name = lstGroup[i].data[k].Name;
                                obj.Id = lstGroup[i].data[k].Id;
                                obj.StartTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                StartDate = new Date(lstGroup[i].data[k].Date * 1000);
                                COuntEngineOff = COuntEngineOff + 1;
                            } else {
                                obj.EndTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                obj.EndId = lstGroup[i].data[k].Id;
                                EndDate = new Date(lstGroup[i].data[k].Date * 1000);
                                obj.ParkingTime = timeDifference(StartDate, EndDate);

                            }
                        } else {
                            if (COuntEngineOff != 0) {
                                if (obj.EndTime == null || obj.EndTime == undefined || obj.EndTime == '') {
                                    obj.EndTime = momentz.utc(new Date(lstGroup[i].data[k - 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                    obj.EndId = lstGroup[i].data[k - 1].Id;
                                    EndDate = new Date(lstGroup[i].data[k - 1].Date * 1000);
                                    obj.ParkingTime = timeDifference(StartDate, EndDate);
                                }
                                Array.push(obj);
                            }
                            COuntEngineOff = 0;
                        }

                        /*   if (lstGroup[i].data[k].IsEngine == 1) {
                               if (COuntEngineOff != 0) {

                                   obj.EndTime = momentz.utc(new Date(lstGroup[i].data[k-1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                   obj.EndId = lstGroup[i].data[k - 1].Id;
                                   EndDate = new Date(lstGroup[i].data[k - 1].Date * 1000);
                                   obj.ParkingTime = timeDifference(StartDate, EndDate);
                                   Array.push(obj);
                                   COuntEngineOff = 0;
                               }
                           } else {
                               if (COuntEngineOff == 0) {
                                   var obj = new Object();
                                   obj.Latitude = lstGroup[i].data[k].Latitude;
                                   obj.Longitude = lstGroup[i].data[k].Longitude;
                                   obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                   obj.Name = lstGroup[i].data[k].Name;
                                   obj.Id = lstGroup[i].data[k].Id;
                                   obj.StartTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                   StartDate = new Date(lstGroup[i].data[k].Date * 1000);

                               }
                               COuntEngineOff = COuntEngineOff + 1;
                           }*/
                    }

                    if (COuntEngineOff != 0) {
                        if (obj.EndTime == null || obj.EndTime == undefined || obj.EndTime == '') {
                            obj.EndTime = obj.StartTime
                            EndDate = StartDate;
                            obj.ParkingTime = timeDifference(StartDate, EndDate);
                        }
                        Array.push(obj);
                    }
                }
            }
            res.json(Array);
        } else {
            res.json(RecordNotFound);
        }
    });
});

router.get('/ExportParkingReport', function(req, res) {

    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
            caption: 'Asset Name',
            type: 'string'
        }, {
            caption: 'StartTime',
            type: 'string'
        }, {
            caption: 'EndTime',
            type: 'string'
        }, {
            caption: 'Parking Time',
            type: 'string'
        }, {
            caption: 'Address',
            type: 'string'
        }, {
            caption: 'Latitude',
            type: 'number'
        },
        {
            caption: 'Longitude',
            type: 'number'
        }
    ];



    var wherecondition = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        wherecondition = ' and tblgpsdata.deviceid=' + req.query.DeviceId;
    }
    var Startdate = req.query.StartDate;
    var Enddate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;



    var query = "select tblgpsdata.*,tblvehicle.Name from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + " and tblgpsdata.GPSPositioning='A' and tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + ' order by tblgpsdata.Date ASC' + ";"
    connection.query(query, function(err, response, fields) {
        var Array = [];
        conf.rows = [];
        if (response.length > 0) {


            var groups = u.groupBy(response, function(o) {
                return o.DeviceId;
            });

            var lstGroup = u.map(groups, function(group) {

                return {
                    data: group
                }
            });
            var l = 0;
            var COuntEngineOff = 0;

            var StartDate = '';
            var EndDate = '';
            for (var i = 0; i < lstGroup.length; i++) {
                COuntEngineOff = 0;
                if (lstGroup[i].data.length > 0) {
                    for (var k = 0; k < lstGroup[i].data.length; k++) {
                        if (lstGroup[i].data[k].IsEngine == 0) {
                            if (COuntEngineOff == 0) {
                                var obj = new Object();
                                obj.Latitude = lstGroup[i].data[k].Latitude;
                                obj.Longitude = lstGroup[i].data[k].Longitude;
                                obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                obj.Name = lstGroup[i].data[k].Name;
                                obj.Id = lstGroup[i].data[k].Id;
                                obj.StartTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                StartDate = new Date(lstGroup[i].data[k].Date * 1000);
                                COuntEngineOff = COuntEngineOff + 1;
                            } else {
                                obj.EndTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                obj.EndId = lstGroup[i].data[k].Id;
                                EndDate = new Date(lstGroup[i].data[k].Date * 1000);
                                obj.ParkingTime = timeDifference(StartDate, EndDate);
                            }
                        } else {
                            if (COuntEngineOff != 0) {
                                if (obj.EndTime == null || obj.EndTime == undefined || obj.EndTime == '') {
                                    obj.EndTime = momentz.utc(new Date(lstGroup[i].data[k - 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                    obj.EndId = lstGroup[i].data[k - 1].Id;
                                    EndDate = new Date(lstGroup[i].data[k - 1].Date * 1000);
                                    obj.ParkingTime = timeDifference(StartDate, EndDate);
                                }
                                Array.push(obj);
                            }
                            COuntEngineOff = 0;
                        }

                        /* if (lstGroup[i].data[k].IsEngine == 1) {
                             if (COuntEngineOff != 0) {
                                 obj.Latitude = lstGroup[i].data[k - 1].Latitude;
                                 obj.Longitude = lstGroup[i].data[k - 1].Longitude;
                                 obj.DeviceId = lstGroup[i].data[k - 1].DeviceId;
                                 obj.Name = lstGroup[i].data[k - 1].Name;
                                 obj.Id = lstGroup[i].data[k - 1].Id;
                                 obj.StartTime = momentz.utc(new Date(lstGroup[i].data[k - 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                 StartDate = new Date(lstGroup[i].data[k - 1].Date * 1000);
                                 obj.ParkingTime = timeDifference(StartDate, EndDate);

                                 Array.push(obj);
                                 COuntEngineOff = 0;
                             }
                         } else {
                             if (COuntEngineOff == 0) {
                                 var obj = new Object();
                                 obj.EndTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                 obj.EndId = lstGroup[i].data[k].Id;
                                 EndDate = new Date(lstGroup[i].data[k].Date * 1000);
                             }
                             COuntEngineOff = COuntEngineOff + 1;
                         }*/
                    }
                    if (COuntEngineOff != 0) {
                        if (obj.EndTime == null || obj.EndTime == undefined || obj.EndTime == '') {
                            obj.EndTime = obj.StartTime
                            EndDate = StartDate;
                            obj.ParkingTime = timeDifference(StartDate, EndDate);
                        }
                        Array.push(obj);
                    }
                }
            }

        }
        GetData(0);


        function GetData(i) {
            if (i < Array.length) {
                var row = [];
                var Name = 'N/A';
                var StartTime = 'N/A';
                var EndTime = 'N/A';
                var Address = 'N/A';
                var ParkingTime = 'N/A';
                var Direction = 0.00;
                var Latitude = 0.00;
                var Longitude = 0.00;

                if (Array[i].Latitude != undefined && Array[i].Latitude != null && Array[i].Latitude != '' && Array[i].Longitude != undefined && Array[i].Longitude != null && response[i].Longitude != '') {
                    geocoder.reverse({ lat: Array[i].Latitude, lon: Array[i].Longitude }, function(err, res) {
                        if (Array[i].StartTime != null && Array[i].StartTime != '' && Array[i].StartTime != undefined) {

                            // Datetime = dateformat(Array[i].Datetime, 2);
                            StartTime = Array[i].StartTime;
                        }

                        if (Array[i].EndTime != null && Array[i].EndTime != '' && Array[i].EndTime != undefined) {
                            // Datetime = dateformat(Array[i].Datetime, 2);
                            EndTime = Array[i].EndTime;
                        }

                        if (Array[i].Name != null && Array[i].Name != '' && Array[i].Name != undefined) {
                            Name = Array[i].Name;
                        }

                        if (Array[i].ParkingTime != null && Array[i].ParkingTime != '' && Array[i].ParkingTime != undefined) {
                            ParkingTime = Array[i].ParkingTime;
                        }
                        if (Array[i].Latitude != null && Array[i].Latitude != '' && Array[i].Latitude != undefined) {
                            Latitude = Array[i].Latitude;
                        }
                        if (Array[i].Longitude != null && Array[i].Longitude != '' && Array[i].Longitude != undefined) {
                            Longitude = Array[i].Longitude;
                        }
                        if (res.length > 0) {
                            Address = res[0].formattedAddress;
                            row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString(), Latitude, Longitude);
                        } else {
                            Address = "N/A";
                            row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString(), Latitude, Longitude);
                        }
                        conf.rows.push(row);
                        GetData(i + 1);


                    })
                } else {
                    if (Array[i].StartTime != null && Array[i].StartTime != '' && Array[i].StartTime != undefined) {

                        // Datetime = dateformat(Array[i].Datetime, 2);
                        StartTime = Array[i].StartTime;
                    }

                    if (Array[i].EndTime != null && Array[i].EndTime != '' && Array[i].EndTime != undefined) {
                        // Datetime = dateformat(Array[i].Datetime, 2);
                        EndTime = Array[i].EndTime;
                    }

                    if (Array[i].Name != null && Array[i].Name != '' && Array[i].Name != undefined) {
                        Name = Array[i].Name;
                    }
                    if (Array[i].Address != null && Array[i].Address != '' && Array[i].Address != undefined) {
                        Address = Array[i].Address;
                    }

                    if (Array[i].ParkingTime != null && Array[i].ParkingTime != '' && Array[i].ParkingTime != undefined) {
                        ParkingTime = Array[i].ParkingTime;
                    }
                    if (Array[i].Latitude != null && Array[i].Latitude != '' && Array[i].Latitude != undefined) {
                        Latitude = Array[i].Latitude;
                    }
                    if (Array[i].Longitude != null && Array[i].Longitude != '' && Array[i].Longitude != undefined) {
                        Longitude = Array[i].Longitude;
                    }
                    row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString(), Latitude, Longitude);
                    conf.rows.push(row);
                    GetData(i + 1);
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

/*-------------------------Parking Report End-----------------------*/
router.get('/GetAllDailyStatDate', function(req, res) {
    wherecondition = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        wherecondition = ' and tblgpsdata.deviceid=' + req.query.DeviceId;
        wherecondition1 = ' and tblalarm.deviceid=' + req.query.DeviceId;
    }
    var Startdate = req.query.TodayStartDateTime;
    var Enddate = req.query.TodayEndDateTime;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;


    var query = "select tblgpsdata.*,tblvehicle.Name,tblvehicle.deviceid from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + "  and tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + ' order by tblgpsdata.Date asc' + ";"

    connection.query(query, function(err, response, fields) {
        var query1 = "select tblalarm.*,tblvehicle.deviceid from tblalarm left join tblvehicle on tblalarm.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + "  and tblalarm.Date >= '" + unixStartdate + "' and tblalarm.Date <= '" + unixEnddate + "'" + wherecondition1 + ";"
        console.log(query1);
        connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {

            if (response.length > 0) {

                var group2 = u.groupBy(response, function(o) {
                    return momentz.utc(o.Datetime).format('DD-MM-YYYY')
                });

                var lstGroupData = u.map(group2, function(group3, groupdate) {
                    var group = u.groupBy(group3, function(o) {
                        return o.Name;
                    });
                    var lstGroup1 = u.map(group, function(group1, Name) {
                        return {
                            data: group1
                        }
                    });
                    return {
                        data: lstGroup1
                    }
                });


                var l = 0;
                var COuntEngineOff = 0;
                var COuntEngineON = 0;
                var CountDriving = 0;
                var Array = [];
                var StartDate = '';
                var EndDate = '';
                var EngineOnStartDate = '';
                var EngineOnEndDate = '';
                var DrivingStartTime = '';
                var DrivingEndTime = '';
                var Speed = 0.0;
                var lstGroup = [];
                var m = 0;
                //console.log("[]===", lstGroupData.length);
                for (var i = 0; i < lstGroupData.length; i++) {
                    if (lstGroupData[i].data.length > 0) {
                        console.log(lstGroupData[i].data.length);
                        for (var j = 0; j < lstGroupData[i].data.length; j++) {

                            lstGroup[m] = lstGroupData[i].data[j];
                            //   console.log("---", m);
                            m++;
                        }
                    }
                }
                /*  if (lstGroupData.length > 0) {
                      function update(i) {
                          console.log(i, "------", lstGroupData[i].data);
                          if (lstGroupData[i].data.length > 0) {
                              function updatedata(j) {
                                  if (lstGroupData[i].data[j] != null) {
                                      lstGroup[m] = lstGroupData[i].data[j];
                                      console.log("---", m);
                                      m++;
                                      updatedata(j + 1);
                                  } else {
                                      update(i + 1);
                                  }
                              }
                              updatedata(0);

                          }
                      }
                      update(0);
                  }*/
                console.log("@@..", lstGroup.length);
                // res.json(lstGroupData);

                //res.json(lstGroup);

                for (var i = 0; i < lstGroup.length; i++) {
                    COuntEngineOff = 0;
                    COuntEngineON = 0;
                    CountDriving = 0;


                    if (lstGroup[i].data.length > 0) {
                        var obj = new Object();
                        var hours = 0;
                        var minutes = 0;
                        var seconds = 0;
                        var EngineOnhours = 0;
                        var EngineOnminutes = 0;
                        var EngineOnseconds = 0;
                        var Drivinghours = 0;
                        var Drivingminutes = 0;
                        var Drivingseconds = 0;
                        DrivingStartTime = '';
                        DrivingEndTime = '';
                        StartDate = '';
                        EndDate = '';
                        EngineOnStartDate = '';
                        EngineOnEndDate = '';
                        Speed = 0.0;
                        var SpeedCo = 0;
                        obj.DeviceId = lstGroup[i].data[0].deviceid;
                        obj.Name = lstGroup[i].data[0].Name;
                        obj.Date = momentz.utc(new Date(lstGroup[i].data[0].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY');
                        obj.InvalidLocation = 0;
                        obj.Mileage = 0.0;
                        obj.AlarmNumber = 0;
                        if (alarmresponse.length > 0) {
                            for (var h = 0; h < alarmresponse.length; h++) {
                                var alarmDate = momentz.utc(new Date(alarmresponse[h].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY');
                                if (alarmresponse[h].deviceid == obj.DeviceId && alarmDate == obj.Date) {
                                    obj.AlarmNumber = obj.AlarmNumber + 1;
                                }
                            }

                        }
                        for (var k = 0; k < lstGroup[i].data.length; k++) {


                            if (lstGroup[i].data[k].GPSPositioning != 'A') {
                                obj.InvalidLocation = obj.InvalidLocation + 1;
                            }
                            if (k == 0) { obj.LocateNumber = 1; } else {

                                obj.Mileage = obj.Mileage + distance(parseFloat(lstGroup[i].data[k - 1].Latitude), parseFloat(lstGroup[i].data[k - 1].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude))

                                if (lstGroup[i].data[k].Latitude != lstGroup[i].data[k - 1].Latitude || lstGroup[i].data[k].Latitude != lstGroup[i].data[k - 1].Latitude) {
                                    obj.LocateNumber = obj.LocateNumber + 1;
                                }
                            }

                            if (lstGroup[i].data[k].Speed > 1 && lstGroup[i].data[k].IsEngine == 1) {
                                Speed = Speed + parseFloat(lstGroup[i].data[k].Speed);
                                SpeedCo = SpeedCo + 1;
                            }
                            //  console.log("id.....", lstGroup[i].data[k].Id, "-----", lstGroup[i].data[k].IsEngine);
                            if (lstGroup[i].data[k].IsEngine == 1) {
                                if (COuntEngineOff != 0) {
                                    if (EndDate == null || EndDate == undefined || EndDate == '') {
                                        EndDate = Startdate;
                                    } else {
                                        hours = hours + timeDifference(StartDate, EndDate, 'h');
                                        minutes = minutes + timeDifference(StartDate, EndDate, 'm');
                                        seconds = seconds + timeDifference(StartDate, EndDate, 's');
                                    }
                                    COuntEngineOff = 0;
                                    EndDate = '';
                                }
                                if (COuntEngineON == 0) {

                                    EngineOnEndDate = '';
                                    EngineOnStartDate = new Date(lstGroup[i].data[k].Date * 1000);
                                    obj.onStartid = lstGroup[i].data[k].Id;
                                    obj.sd = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');;;
                                    COuntEngineON = COuntEngineON + 1;
                                } else {
                                    EngineOnEndDate = new Date(lstGroup[i].data[k].Date * 1000);
                                    obj.ed = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');;
                                    obj.onEndid = lstGroup[i].data[k].Id;
                                }

                                if (CountDriving == 0 && lstGroup[i].data[k].Speed > 1) {
                                    DrivingEndTime = '';
                                    obj.DrivS_id = lstGroup[i].data[k].Id;
                                    DrivingStartTime = new Date(lstGroup[i].data[k].Date * 1000);
                                    CountDriving = CountDriving + 1;
                                } else if (CountDriving != 0 && lstGroup[i].data[k].Speed > 1) {
                                    obj.DrivE_id = lstGroup[i].data[k].Id;
                                    DrivingEndTime = new Date(lstGroup[i].data[k].Date * 1000);
                                }
                                if (CountDriving != 0 && lstGroup[i].data[k].Speed < 1) {
                                    Drivinghours = Drivinghours + timeDifference(DrivingStartTime, DrivingEndTime, 'h');
                                    Drivingminutes = Drivingminutes + timeDifference(DrivingStartTime, DrivingEndTime, 'm');
                                    Drivingseconds = Drivingseconds + timeDifference(DrivingStartTime, DrivingEndTime, 's');
                                    CountDriving = 0;
                                }

                            } else if (lstGroup[i].data[k].IsEngine == 0) {
                                if (COuntEngineON != 0) {
                                    if (EngineOnEndDate == null || EngineOnEndDate == undefined || EngineOnEndDate == '') {
                                        EngineOnEndDate = EngineOnStartDate;
                                    } else {
                                        EngineOnhours = EngineOnhours + timeDifference(EngineOnStartDate, EngineOnEndDate, 'h');
                                        EngineOnminutes = EngineOnminutes + timeDifference(EngineOnStartDate, EngineOnEndDate, 'm');
                                        EngineOnseconds = EngineOnseconds + timeDifference(EngineOnStartDate, EngineOnEndDate, 's');

                                    }
                                    if (CountDriving != 0) {
                                        if (DrivingEndTime == null || DrivingEndTime == undefined || DrivingEndTime == '') {} else {
                                            Drivinghours = Drivinghours + timeDifference(DrivingStartTime, DrivingEndTime, 'h');
                                            Drivingminutes = Drivingminutes + timeDifference(DrivingStartTime, DrivingEndTime, 'm');
                                            Drivingseconds = Drivingseconds + timeDifference(DrivingStartTime, DrivingEndTime, 's');
                                        }
                                        CountDriving = 0;
                                    }
                                    COuntEngineON = 0;
                                }
                                if (COuntEngineOff == 0) {

                                    obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                    obj.Id = lstGroup[i].data[k].Id;
                                    obj.ParkingTime = 0;
                                    StartDate = new Date(lstGroup[i].data[k].Date * 1000);
                                    COuntEngineOff = COuntEngineOff + 1;

                                } else {
                                    obj.EndId = lstGroup[i].data[k].Id;
                                    EndDate = new Date(lstGroup[i].data[k].Date * 1000);

                                    obj.Date = momentz.utc(new Date(lstGroup[i].data[0].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY');

                                }
                            }

                        }
                        if (COuntEngineON == 0 && COuntEngineOff == 0) {
                            obj.ParkingTime = hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds';
                            obj.DrivingTime = EngineOnhours + ' hours, ' + EngineOnminutes + ' minutes, and ' + EngineOnseconds + ' seconds';
                            Array.push(obj);

                        } else {
                            if (COuntEngineON != 0) {
                                if (EngineOnEndDate == '') {
                                    EngineOnhours = EngineOnhours + 0;
                                    EngineOnminutes = EngineOnminutes + 0;
                                    EngineOnseconds = EngineOnseconds + 0;
                                } else {
                                    EngineOnhours = EngineOnhours + timeDifference(EngineOnStartDate, EngineOnEndDate, 'h');
                                    EngineOnminutes = EngineOnminutes + timeDifference(EngineOnStartDate, EngineOnEndDate, 'm');
                                    EngineOnseconds = EngineOnseconds + timeDifference(EngineOnStartDate, EngineOnEndDate, 's');
                                }
                            }

                            if (CountDriving != 0) {
                                if (DrivingEndTime == '') {
                                    Drivinghours = Drivinghours + 0;
                                    Drivingminutes = Drivingminutes + 0;
                                    Drivingseconds = Drivingseconds + 0;
                                } else {
                                    Drivinghours = Drivinghours + timeDifference(DrivingStartTime, DrivingEndTime, 'h');
                                    Drivingminutes = Drivingminutes + timeDifference(DrivingStartTime, DrivingEndTime, 'm');
                                    Drivingseconds = Drivingseconds + timeDifference(DrivingStartTime, DrivingEndTime, 's');
                                }
                            }

                            if (COuntEngineON != 0) {
                                if (EndDate == '') {
                                    hours = hours + 0;
                                    minutes = minutes + 0;
                                    seconds = seconds + 0;
                                } else {
                                    hours = hours + timeDifference(StartDate, EndDate, 'h');
                                    minutes = minutes + timeDifference(StartDate, EndDate, 'm');
                                    seconds = seconds + timeDifference(StartDate, EndDate, 's');
                                }

                            }
                            if (SpeedCo > 0) {
                                obj.AverageSpeed = Speed / SpeedCo;
                            } else {
                                obj.AverageSpeed = 0
                            }
                            obj.ParkingTime = hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds';
                            obj.EnginOnTime = EngineOnhours + ' hours, ' + EngineOnminutes + ' minutes, and ' + EngineOnseconds + ' seconds';
                            obj.DrivingTime = Drivinghours + ' hours, ' + Drivingminutes + ' minutes, and ' + Drivingseconds + ' seconds';
                            Array.push(obj);
                        }
                    }

                }
                res.json(Array);
            } else {
                res.json(RecordNotFound);
            }
        })
    });
});


router.get('/ExportDailyStatReport', function(req, res) {

    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
            caption: 'Asset Name',
            type: 'string'
        }, {
            caption: 'Date Time',
            type: 'string'
        }, {
            caption: 'Driving Time',
            type: 'string'
        }, {
            caption: 'Parking Time',
            type: 'string'
        }, {
            caption: 'Asset Status',
            type: 'string'
        }, {
            caption: 'Locate Number',
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
    var l = moment.duration(moment(date1, "DD/MM/YYYY HH:mm:ss a").diff(moment(date2, "DD/MM/YYYY HH:mm:ss a")), 'milliseconds');
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


function timeDifference(Start, End, flg) {

    var one_day = 1000 * 60 * 60 * 24;
    date1 = new Date(Start);
    date2 = new Date(End);
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    var difference_ms = date2_ms - date1_ms;
    difference_ms = difference_ms / 1000;
    var seconds = Math.floor(difference_ms % 60);
    difference_ms = difference_ms / 60;
    var minutes = Math.floor(difference_ms % 60);
    difference_ms = difference_ms / 60;
    var hours = Math.floor(difference_ms % 24);
    var days = Math.floor(difference_ms / 24);
    if (flg == 'h') {
        return hours;
    } else if (flg == 'm') {
        return minutes;
    } else if (flg == 's') {
        return seconds;
    } else {
        return days + ' days, ' + hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds';
    }

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