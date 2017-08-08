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
            search += " And tblalarm.DeviceId = " + objParam.DeviceId;
        } else {
            search += " Where tblalarm.DeviceId = " + objParam.DeviceId;
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
            res.json(response);
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })
})

router.get('/ExportFenceReport', function(req, res) {
    var objParam = req.query;
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
    }, {
        caption: 'Latitude',
        type: 'number'
    }, {
        caption: 'Longitude',
        type: 'number'
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
            search += " And tblalarm.DeviceId = " + objParam.DeviceId;
        } else {
            search += " Where tblalarm.DeviceId = " + objParam.DeviceId;
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
            conf.rows = [];
            GetData(0);

            function GetData(i) {
                if (i < response.length) {
                    var row = [];
                    var Name = 'N/A';
                    var TIme = 'N/A';
                    var Address = 'N/A';
                    var Latitude = 0.00;
                    var Longitude = 0.00;
                    var FenceStatus = 'N/A';


                    if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                        // Datetime = dateformat(response[i].Datetime, 2);
                        TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                    }
                    if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                        Name = response[i].Name;
                    }
                    // if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                    //     var latlng = new google.maps.LatLng(response[i].Latitude, response[i].Longitude);
                    //     var geocoder = new google.maps.Geocoder();
                    //     geocoder.geocode({ 'latLng': latlng }, function(results, status) {
                    //         if (results != null) {
                    //             if (results[0]) {
                    //                 $scope.$apply(function() {
                    //                     response[i].Address = Address = results[0].formatted_address;
                    //                     // Address = results[0].formatted_address;
                    //                 })
                    //             }
                    //         } else {
                    //             Address = 'N/A';
                    //         }
                    //     })
                    // }

                    if (response[i].AlarmCode != null && response[i].AlarmCode != '' && response[i].AlarmCode != undefined) {
                        if (response[i].AlarmCode == '06') {
                            FenceStatus = 'Fence In';
                        } else {
                            FenceStatus = 'Fence Out';
                        }
                    }

                    if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                        Latitude = response[i].Latitude;
                    }

                    if (response[i].Longitude != null && response[i].Longitude != '' && response[i].Longitude != undefined) {
                        Longitude = response[i].Longitude;
                    }

                    row.push(Name.toString(), TIme.toString(), FenceStatus.toString(), Address.toString(), Latitude, Longitude);
                    conf.rows.push(row);
                    GetData(i + 1);
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

    var Orderby = 'Order By Date ASC';
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

    var query = "SELECT tblgpsdata.Id, tblgpsdata.Datetime, tblgpsdata.Date, tblgpsdata.Latitude, tblgpsdata.Longitude, tblgpsdata.DeviceId, tblgpsdata.IsEngine, tblgpsdata.Speed, tblvehicle.Name, tblvehicle.iduser FROM gpsscanner.tblgpsdata LEFT JOIN tblvehicle ON tblvehicle.deviceid = tblgpsdata.DeviceId " + search;
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

module.exports = router