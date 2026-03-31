var router = express.Router();
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var GPSdata = models.tblgpsdata;
var JourneyRoute = models.JourneyRoute;
var momentz = require('moment-timezone');
var Commonfunction = require('./common.js');

/*------------------------------------Detailed Trip Report-------------------*/
router.get('/GetAllGPSByTimeZoneDate', function(req, res) {
    wherecondition = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        wherecondition = ' and tblgpsdata.deviceid in (' + req.query.DeviceId + ')';
    }
    var Startdate = req.query.TodayStartDateTime;
    var Enddate = req.query.TodayEndDateTime;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    var orderby = ' ';
    if (req.query.orderby != '' && req.query.orderby != undefined && req.query.orderby != null) {
        orderby = ' ,' + req.query.orderby;
    }

    var query = " SET @cnt = 0; " +
        "select SQL_CALC_FOUND_ROWS " +
        "tblgpsdata.Date,tblgpsdata.Datetime,tblvehicle.DeviceId, " +
        "CASE " +
        "WHEN IsPatchEngine=true then (@cnt := @cnt + 2) " +
        "ELSE (@cnt+1)  " +
        "END AS rowNumber , " +
        "tblvehicle.Name,tblgpsdata.IsPatchEngine as IsEngine,tblgpsdata.Speed,tblgpsdata.Direction,tblgpsdata.Latitude,tblgpsdata.Longitude,tblvehiclegroup.GroupName " +
        "from tblgpsdata " +
        "left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid " +
        "left join tblvehiclegroup on tblvehiclegroup.Id = tblvehicle.IdGroup " +
        "Where tblgpsdata.Date >=  '" + unixStartdate + "' and tblgpsdata.Date <=  '" + unixEnddate + "' " +
        wherecondition +
        "group by DeviceId,rowNumber order by Date limit " + req.query.length + " OFFSET " + req.query.start + ";SELECT FOUND_ROWS() as TotalRecord;";
    connection.query(query, function(err, lstGPSData, fields) {
        if (!err) {
            
            var NewListData = [];

        
            var object = new Object();
            object.data = lstGPSData[1];
            object.Totalrecord = lstGPSData[2][0].TotalRecord;
            res.json(object);
            
        }
    });
});

router.get('/ExportDetailTripReport_phili', function(req, res) {

    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
            caption: 'Group Name',
            type: 'string'
        }, {
            caption: 'Asset Name',
            type: 'string'
        }, {
            caption: 'Time',
            type: 'string'
        },
        {
            caption: 'Address',
            type: 'string'
        },
        
        {
            caption: 'Asset Status',
            type: 'string'
        }, {
            caption: 'Speed(km/h)',
            type: 'number'
        },
        
        {
            caption: 'Direction',
            type: 'number'
        },
        
    ];



    wherecondition = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        wherecondition = ' and tblgpsdata.deviceid in (' + req.query.DeviceId + ')';
    }
    var Startdate = req.query.StartDate;
    var Enddate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var query = " SET @cnt = 0; " +
        "select  " +
        "tblgpsdata.Date,tblgpsdata.Datetime,tblvehicle.DeviceId, " +
        "CASE " +
        "WHEN IsPatchEngine=true then (@cnt := @cnt + 2) " +
        "ELSE (@cnt+1)  " +
        "END AS rowNumber , " +
        "tblvehicle.Name,tblgpsdata.IsPatchEngine as IsEngine,tblgpsdata.Speed,tblgpsdata.Direction,tblgpsdata.Latitude,tblgpsdata.Longitude,tblvehiclegroup.GroupName " +
        "from tblgpsdata " +
        "left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid " +
        "left join tblvehiclegroup on tblvehiclegroup.Id = tblvehicle.IdGroup " +
        "Where tblgpsdata.Date >=  '" + unixStartdate + "' and tblgpsdata.Date <=  '" + unixEnddate + "' " +
        wherecondition +
        "group by DeviceId,rowNumber order by Date";

    
    connection.query(query, function(err, lstGPSData) {
        conf.rows = [];
        var response = [];
        var COuntEngineOn = 0;
        var lstGPSData = lstGPSData[1];
        for (var i = 0; i < lstGPSData.length; i++) {

            if (lstGPSData[i].IsEngine == true) {
                COuntEngineOn = 0;
                response.push(lstGPSData[i]);
            } else {
                if (COuntEngineOn == 0) {
                    response.push(lstGPSData[i]);
                    COuntEngineOn = 1;
                }
            }
            if (lstGPSData[i].IsEngine == 1) {
                lstGPSData[i].IsEngine = "Engine ON";
            } else {
                lstGPSData[i].IsEngine = "Engine OFF";
            }
                    }
        GetData(0);

        function GetData(i) {
            if (i < response.length) {
                // for (var i = 0; i < response.length; i++) {
                var row = [];
                var Name = 'N/A';
                var GroupName = 'UnGroup'
                var TIme = 'N/A';
                // var Address = 'N/A';
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
                var Address = 'N/A';
                if (response[i].Latitude != undefined && response[i].Latitude != null && response[i].Latitude != '' && response[i].Longitude != undefined && response[i].Longitude != null && response[i].Longitude != '') {
                    
                    Commonfunction.GetAddressLatLong(response[i].Latitude, response[i].Longitude, function(resAddress) {
                        if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                            
                            TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                        }
                        if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                            Name = response[i].Name;
                        }
                        if (response[i].GroupName != null && response[i].GroupName != '' && response[i].GroupName != undefined) {
                            GroupName = response[i].GroupName;
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
                            var Degree = parseInt(response[i].Direction);
                            if (Degree > 315 || Degree < 45) {
                                Direction = "North";
                            } else if (Degree == 45) {
                                Direction = "North-East";
                            } else if (Degree > 45 && Degree < 135) {
                                Direction = "East";
                            } else if (Degree == 135) {
                                Direction = "East-South";
                            } else if (Degree > 135 && Degree < 225) {
                                Direction = "South";
                            } else if (Degree == 225) {
                                Direction = "South-West";
                            } else if (Degree > 225 && Degree < 315) {
                                Direction = "West";
                            } else if (Degree == 315) {
                                Direction = "West-North";
                            }

                        }
                        if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                            Latitude = response[i].Latitude;
                        }
                        if (response[i].Longitude != null && response[i].Longitude != '' && response[i].Longitude != undefined) {
                            Longitude = response[i].Longitude;
                        }
                        if (resAddress == '' || resAddress == null) {
                            resAddress = 'N/A'
                        }
                        Address = resAddress;
                        
                        row.push(GroupName, Name.toString(), TIme.toString(), Address, AssetStatus.toString(), Speed, Direction, Latitude, Longitude);
                        conf.rows.push(row);
                        GetData(i + 1);
                    })
                } else {
                    if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                        
                        TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                    }
                    if (response[i].GroupName != null && response[i].GroupName != '' && response[i].GroupName != undefined) {
                        GroupName = response[i].GroupName;
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
                        var Degree = parseInt(response[i].Direction);
                        if (Degree > 315 || Degree < 45) {
                            Direction = "North";
                        } else if (Degree == 45) {
                            Direction = "North-East";
                        } else if (Degree > 45 && Degree < 135) {
                            Direction = "East";
                        } else if (Degree == 135) {
                            Direction = "East-South";
                        } else if (Degree > 135 && Degree < 225) {
                            Direction = "South";
                        } else if (Degree == 225) {
                            Direction = "South-West";
                        } else if (Degree > 225 && Degree < 315) {
                            Direction = "West";
                        } else if (Degree == 315) {
                            Direction = "West-North";
                        }
                    }
                    if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                        Latitude = response[i].Latitude;
                    }
                    if (response[i].Longitude != null && response[i].Longitude != '' && response[i].Longitude != undefined) {
                        Longitude = response[i].Longitude;
                    }
                    row.push(GroupName, Name.toString(), TIme.toString(), Address, AssetStatus.toString(), Speed, Direction, Latitude, Longitude);
                    conf.rows.push(row);
                    GetData(i + 1);
                    // }
                }
                
            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=DetailTripReport.xlsx");
                res.end(result, 'binary');
            }
        }

    })
})


router.get('/PrintDetailTripReport_phili', function(req, res) {

    wherecondition = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        wherecondition = ' and tblgpsdata.deviceid in (' + req.query.DeviceId + ')';
    }
    var Startdate = req.query.StartDate;
    var Enddate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var query = " SET @cnt = 0; " +
        "select " +
        "tblgpsdata.Date,tblgpsdata.Datetime,tblvehicle.DeviceId, " +
        "CASE " +
        "WHEN IsPatchEngine=true then (@cnt := @cnt + 2) " +
        "ELSE (@cnt+1)  " +
        "END AS rowNumber , " +
        "tblvehicle.Name,tblgpsdata.IsPatchEngine as IsEngine,tblgpsdata.Speed,tblgpsdata.Direction,tblgpsdata.Latitude,tblgpsdata.Longitude,tblvehiclegroup.GroupName " +
        "from tblgpsdata " +
        "left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid " +
        "left join tblvehiclegroup on tblvehiclegroup.Id = tblvehicle.IdGroup " +
        "Where tblgpsdata.Date >=  '" + unixStartdate + "' and tblgpsdata.Date <=  '" + unixEnddate + "' " +
        wherecondition +
        "group by DeviceId,rowNumber order by Date";

    connection.query(query, function(err, lstGPSData) {
        var response = [];
        var COuntEngineOn = 0;
        var lstGPSData = lstGPSData[1];
        for (var i = 0; i < lstGPSData.length; i++) {

            if (lstGPSData[i].IsEngine == true) {
                COuntEngineOn = 0;
                response.push(lstGPSData[i]);
            } else {
                if (COuntEngineOn == 0) {
                    response.push(lstGPSData[i]);
                    COuntEngineOn = 1;
                }
            }
            if (lstGPSData[i].IsEngine == 1) {
                lstGPSData[i].IsEngine = "Engine ON";
            } else {
                lstGPSData[i].IsEngine = "Engine OFF";
            }
            //response.push(response[i]);
        }
        var TodayDate = momentz.utc(new Date()).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
        
        var table = '<div style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; padding:0 15px;">' +
            '<div style="padding:15px; border-bottom:1px solid #000;">' +
            '<h1 style="text-transform: uppercase; text-align:center; font-weight: normal;font-size: 14px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Detailed Trip Report</h1>' +
            '<div style="text-align: right;font-size: 8px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"><strong>' + TodayDate + '</strong></div>' +
            '</div>' +
            '<div>' +
            '<table style="width:100%; margin:0; padding: 0;">' +
            '<thead>' +
            '<tr>' +
            '<th style="padding: 10px 5px;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-bottom: 1px dotted #000; border-right: 1px dotted #000;">No</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Group Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Time</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Address</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Status</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Speed(km/h)</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Direction</th>' +
'</thead><tbody>';

        GetData(0);

        function GetData(i) {
            if (i < response.length) {
                // for (var i = 0; i < response.length; i++) {
                var row = [];
                var Name = 'N/A';
                var TIme = 'N/A';
                var Address = 'N/A';
                var GroupName = "UnGroup";
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
                                        Commonfunction.GetAddressLatLong(response[i].Latitude, response[i].Longitude, function(resAddress) {
                        if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                            // Datetime = dateformat(response[i].Datetime, 2);
                            TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                        }
                        if (response[i].GroupName != null && response[i].GroupName != '' && response[i].GroupName != undefined) {
                            GroupName = response[i].GroupName;
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
                            var Degree = parseInt(response[i].Direction);
                            if (Degree > 315 || Degree < 45) {
                                Direction = "North";
                            } else if (Degree == 45) {
                                Direction = "North-East";
                            } else if (Degree > 45 && Degree < 135) {
                                Direction = "East";
                            } else if (Degree == 135) {
                                Direction = "East-South";
                            } else if (Degree > 135 && Degree < 225) {
                                Direction = "South";
                            } else if (Degree == 225) {
                                Direction = "South-West";
                            } else if (Degree > 225 && Degree < 315) {
                                Direction = "West";
                            } else if (Degree == 315) {
                                Direction = "West-North";
                            }
                        }
                        if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                            Latitude = response[i].Latitude;
                        }
                        if (response[i].Longitude != null && response[i].Longitude != '' && response[i].Longitude != undefined) {
                            Longitude = response[i].Longitude;
                        }

                        if (resAddress == '' || resAddress == null) {
                            resAddress = 'N/A';
                        }
                        Address = resAddress;
                        
                        table += '<tr>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + GroupName.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TIme.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Address + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + AssetStatus.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; ">' + Direction + '</td>' +
                            '</tr>';
                        GetData(i + 1);
                    })
                } else {
                    if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                        TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                    }
                    if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                        Name = response[i].Name;
                    }
                    if (response[i].Address != null && response[i].Address != '' && response[i].Address != undefined) {
                        Address = response[i].Address;
                    }
                    if (response[i].GroupName != null && response[i].GroupName != '' && response[i].GroupName != undefined) {
                        GroupName = response[i].GroupName;
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
                        var Degree = parseInt(response[i].Direction);
                        if (Degree > 315 || Degree < 45) {
                            Direction = "North";
                        } else if (Degree == 45) {
                            Direction = "North-East";
                        } else if (Degree > 45 && Degree < 135) {
                            Direction = "East";
                        } else if (Degree == 135) {
                            Direction = "East-South";
                        } else if (Degree > 135 && Degree < 225) {
                            Direction = "South";
                        } else if (Degree == 225) {
                            Direction = "South-West";
                        } else if (Degree > 225 && Degree < 315) {
                            Direction = "West";
                        } else if (Degree == 315) {
                            Direction = "West-North";
                        }
                    }
                    if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                        Latitude = response[i].Latitude;
                    }
                    if (response[i].Longitude != null && response[i].Longitude != '' && response[i].Longitude != undefined) {
                        Longitude = response[i].Longitude;
                    }
                    table += '<tr>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + GroupName.toString() + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TIme.toString() + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Address + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + AssetStatus.toString() + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; ">' + Direction + '</td>' +
                        '</tr>';
                    GetData(i + 1);
                }
            } else {
                table += '</tbody></table>' +
                    ' </div>' +
                    '</div>';
                var html = table;
                var options = {
                    format: 'A4',
                    footer: {
                        height: '35px',
                        contents: { default: '<hr/><span style="color: #444;text-align:right">{{page}}</span>' },
                        last: 'Last Page'
                    },
                    header: {
                        "height": "35px",
                    },
                };
                pdf.create(html, options).toStream(function(err, stream) {
                    stream.pipe(res);
                });
            }
        }
    })

})

/*------------------------------------End Detailed Trip Report-------------------*/

/*================ LastPosition Report Start====================*/
router.get('/GetAllVehicleLastPositionByUserIdWebApp', jsonParser, function(req, res) {
    var WhereCondition = '';
     var StartDate = req.query.TodayStartDateTime;
    var EndDate = req.query.TodayEndDateTime;

    var convertDate = convertdateformatForUnix(StartDate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(EndDate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    if (StartDate != '' && EndDate != '' && StartDate != 'Invalid date' && EndDate != 'Invalid date') {
        
        if (WhereCondition == '') {
            WhereCondition = 'where Date>="' + unixStartdate + '" and Date<="' + unixEnddate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date>="' + unixStartdate + '" and Date<="' + unixEnddate + '" ';
        }
    } else if (StartDate != null && StartDate != '' && StartDate != 'Invalid date') {
        if (WhereCondition == '') {
            WhereCondition = 'where Date>="' + unixStartdate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date>="' + unixStartdate + '" ';
        }
    } else if (EndDate != null && EndDate != '' && EndDate != 'Invalid date') {
        if (WhereCondition == '') {
            WhereCondition = 'where Date<="' + unixEnddate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date<="' + unixEnddate + '" ';
        }
    }
    var query = "SELECT  tb.*,tpg.IsPatchEngine as IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction,tvg.GroupName,tvgs.GroupName as ShareGroupName" +
        " FROM tblvehicle tb left join tblsharedevice tsd ON tsd.idVehicle = tb.id Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId " +
        " LEFT JOIN tblvehiclegroup tvg on tvg.Id = tb.IdGroup" +
        " LEFT JOIN tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup" +
        " INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM " +
        " (SELECT DeviceId, Date FROM tblgpsdata " + WhereCondition + "ORDER BY Date DESC) d GROUP BY DeviceId) " +
        " b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate WHERE " +
        " (tb.iduser=" + req.query.UserId + " OR tsd.idUser=" + req.query.UserId + ") and IsDelete=false " +
        " group by tb.deviceid order by Name LIMIT " + req.query.length + " OFFSET " + req.query.start + ";"
    var count = "SELECT count(*) FROM tblvehicle tb left join tblsharedevice tsd ON tsd.idVehicle = tb.id" +
        " Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN" +
        " LEFT JOIN tblvehiclegroup tvg on tvg.Id = tb.IdGroup" +
        " (SELECT DeviceId, MAX(Date) as maxDate FROM " +
        " (SELECT DeviceId, Date FROM tblgpsdata " + WhereCondition + "ORDER BY Date DESC) d GROUP BY DeviceId)" +
        " b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate WHERE " +
        " (tb.iduser=" + req.query.UserId + " OR tsd.idUser=" + req.query.UserId + ") and IsDelete=false group by tb.deviceid;";
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            connection.query(count, function(error, count, fields) {
                res.json({ success: true, data: rows });
            })

        } else {
            res.json({ success: false, data: [], Totalrecord: 0 });
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
            caption: 'Group Name',
            type: 'string'
        }, {
            caption: 'Assest Name',
            type: 'string'
        }, {
            caption: 'Device Id',
            type: 'string'
        }, {
            caption: 'Time',
            type: 'string'
        },
        {
            caption: 'Address',
            type: 'string'
        },
        {
            caption: 'Device Status',
            type: 'string'
        }, {
            caption: 'Engine',
            type: 'string'
        },
        {
            caption: 'Speed',
            type: 'string'
        },
        {
            caption: 'Direction',
            type: 'string'
        }
    ];

    var WhereCondition = '';
    var StartDate = req.query.StartDate;
    var EndDate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(StartDate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(EndDate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    if (StartDate != '' && EndDate != '' && StartDate != 'Invalid date' && EndDate != 'Invalid date') {
        if (WhereCondition == '') {
            WhereCondition = 'where Date>="' + unixStartdate + '" and Date<="' + unixEnddate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date>="' + unixStartdate + '" and Date<="' + unixEnddate + '" ';
        }
    } else if (StartDate != null && StartDate != '' && StartDate != 'Invalid date') {
        if (WhereCondition == '') {
            WhereCondition = 'where Date>="' + unixStartdate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date>="' + unixStartdate + '" ';
        }
    } else if (EndDate != null && EndDate != '' && EndDate != 'Invalid date') {
        if (WhereCondition == '') {
            WhereCondition = 'where Date<="' + unixEnddate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date<="' + unixEnddate + '" ';
        }
    }
    var query = "SELECT  tb.*,tpg.IsPatchEngine as IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction,tvg.GroupName,tvgs.GroupName as ShareGroupName" +
        " FROM tblvehicle tb left join tblsharedevice tsd ON tsd.idVehicle = tb.id Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId " +
        " LEFT JOIN tblvehiclegroup tvg on tvg.Id = tb.IdGroup" +
        " LEFT JOIN tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup" +
        " INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM " +
        " (SELECT DeviceId, Date FROM tblgpsdata " + WhereCondition + "ORDER BY Date DESC) d GROUP BY DeviceId) " +
        " b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate WHERE " +
        " (tb.iduser=" + req.query.UserId + " OR tsd.idUser=" + req.query.UserId + ") and IsDelete=false " +
        " group by tb.deviceid order by Name";
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            for (var i = 0; i < rows.length; i++) {
                rows[i].Time = momentz.utc(new Date(rows[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
            }
            var ListPostionData = rows;
            ListPostionData = u.sortBy(ListPostionData, function(num) { return new Date(num.Date) })
            ExportData(ListPostionData)
        } else {
            var ListPostionData = [];
            ListPostionData = u.sortBy(ListPostionData, function(num) { return new Date(num.Date) })
            ExportData(ListPostionData)
        }
    })



    function ExportData(ListPostionData) {
        function AddList(i) {
            if (i < ListPostionData.length) {

                if (ListPostionData[i].Latitude != undefined && ListPostionData[i].Latitude != null && ListPostionData[i].Latitude != '' && ListPostionData[i].Longitude != undefined && ListPostionData[i].Longitude != null && ListPostionData[i].Longitude != '') {
                    // geocoder.reverse({ lat: ListPostionData[i].Latitude, lon: ListPostionData[i].Longitude }, function(err, res) {
                    Commonfunction.GetAddressLatLong(ListPostionData[i].Latitude, ListPostionData[i].Longitude, function(resAddress) {
                        if (ListPostionData[i].iduser == req.query.UserId) {
                            if (ListPostionData[i].GroupName != undefined && ListPostionData[i].GroupName != null && ListPostionData[i].GroupName != '') {
                                var GroupName = ListPostionData[i].GroupName.toString();
                            } else {
                                var GroupName = "UnGroup";
                            }
                        } else {
                            if (ListPostionData[i].ShareGroupName != undefined && ListPostionData[i].ShareGroupName != null && ListPostionData[i].ShareGroupName != '') {
                                var GroupName = ListPostionData[i].ShareGroupName.toString();
                            } else {
                                var GroupName = "UnGroup";
                            }
                        }

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

                        if (ListPostionData[i].Time != undefined && ListPostionData[i].Time != null && ListPostionData[i].Time != '') {
                            var Time = ListPostionData[i].Time;
                        } else {
                            var Time = "N/A";
                        }

                        if (ListPostionData[i].IsOnline != undefined && ListPostionData[i].IsOnline != null && ListPostionData[i].IsOnline != '') {
                            var DeviceStatus = 'Online'
                                // ListPostionData[i].IsOnline.toString();
                        } else {
                            var DeviceStatus = "Offline";
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
                            var Degree = parseInt(ListPostionData[i].Direction);
                            if (Degree > 315 || Degree < 45) {
                                Direction = "North";
                            } else if (Degree == 45) {
                                Direction = "North-East";
                            } else if (Degree > 45 && Degree < 135) {
                                Direction = "East";
                            } else if (Degree == 135) {
                                Direction = "East-South";
                            } else if (Degree > 135 && Degree < 225) {
                                Direction = "South";
                            } else if (Degree == 225) {
                                Direction = "South-West";
                            } else if (Degree > 225 && Degree < 315) {
                                Direction = "West";
                            } else if (Degree == 315) {
                                Direction = "West-North";
                            }
                        } else {
                            var Direction = "0" + ' Degree';
                        }
                        
                        if (resAddress == '' || resAddress == null) {
                            resAddress = 'N/A';
                        }
                        Address = resAddress;
                        conf.rows.push([GroupName, AssestName, DeviceId, Time, Address, DeviceStatus, Engine, Speed, Direction]);
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
                        var DeviceStatus = 'Offline'
                            
                    } else {
                        var DeviceStatus = "Online";
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
                        var Degree = parseInt(ListPostionData[i].Direction);
                        if (Degree > 315 || Degree < 45) {
                            Direction = "North";
                        } else if (Degree == 45) {
                            Direction = "North-East";
                        } else if (Degree > 45 && Degree < 135) {
                            Direction = "East";
                        } else if (Degree == 135) {
                            Direction = "East-South";
                        } else if (Degree > 135 && Degree < 225) {
                            Direction = "South";
                        } else if (Degree == 225) {
                            Direction = "South-West";
                        } else if (Degree > 225 && Degree < 315) {
                            Direction = "West";
                        } else if (Degree == 315) {
                            Direction = "West-North";
                        }
                    } else {
                        var Direction = "0";
                    }
                    var Address = "N/A";
                    conf.rows.push([GroupName, AssestName, Address, DeviceId, Time, DeviceStatus, Engine, Speed, Direction]);
                    AddList(i + 1);
                }
            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=" + "LastPositionReport.xlsx");
                res.end(result, 'binary');
            }

        }
        AddList(0);
    }
});

router.get('/PrintLastPositionDataByUserId', function(req, res) {

    var WhereCondition = '';
    var StartDate = req.query.StartDate;
    var EndDate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(StartDate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(EndDate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    if (StartDate != '' && EndDate != '' && StartDate != 'Invalid date' && EndDate != 'Invalid date') {

        if (WhereCondition == '') {
            WhereCondition = 'where Date>="' + unixStartdate + '" and Date<="' + unixEnddate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date>="' + unixStartdate + '" and Date<="' + unixEnddate + '" ';
        }
    } else if (StartDate != null && StartDate != '' && StartDate != 'Invalid date') {

        if (WhereCondition == '') {
            WhereCondition = 'where Date>="' + unixStartdate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date>="' + unixStartdate + '" ';
        }
    } else if (EndDate != null && EndDate != '' && EndDate != 'Invalid date') {
        if (WhereCondition == '') {
            WhereCondition = 'where Date<="' + unixEnddate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date<="' + unixEnddate + '" ';
        }
    }
    var query = "SELECT  tb.*,tpg.IsPatchEngine as IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction,tvg.GroupName,tvgs.GroupName as ShareGroupName" +
        " FROM tblvehicle tb left join tblsharedevice tsd ON tsd.idVehicle = tb.id Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId " +
        " LEFT JOIN tblvehiclegroup tvg on tvg.Id = tb.IdGroup" +
        " LEFT JOIN tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup" +
        " INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM " +
        " (SELECT DeviceId, Date FROM tblgpsdata " + WhereCondition + "ORDER BY Date DESC) d GROUP BY DeviceId) " +
        " b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate WHERE " +
        " (tb.iduser=" + req.query.UserId + " OR tsd.idUser=" + req.query.UserId + ") and IsDelete=false " +
        " group by tb.deviceid order by Name";
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            for (var i = 0; i < rows.length; i++) {
                rows[i].Time = momentz.utc(new Date(rows[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
            }
            var ListPostionData = rows;
            ListPostionData = u.sortBy(ListPostionData, function(num) { return new Date(num.Date) })
            ExportData(ListPostionData)
        } else {
            var ListPostionData = [];
            ListPostionData = u.sortBy(ListPostionData, function(num) { return new Date(num.Date) })
            ExportData(ListPostionData)
        }
    })
    var TodayDate = momentz.utc(new Date()).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
    
    var table = '<div style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; padding:0 15px;">' +
        '<div style="padding:15px; border-bottom:1px solid #000;">' +
        '<h1 style="text-transform: uppercase; text-align:center; font-weight: normal;font-size: 14px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Last Position Report</h1>' +
        '<div style="text-align: right;font-size: 8px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"><strong>' + TodayDate + '</strong></div>' +
        '</div>' +
        '<div>' +
        '<table style="width:100%; margin:0; padding: 0;">' +
        '<thead>' +
        '<tr>' +
        '<th style="padding: 10px 5px;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-bottom: 1px dotted #000; border-right: 1px dotted #000;">No</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">GroupName</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Device Id</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Time</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Address</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Device Status</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Engine</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Speed</th>' +
        // '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Latitude</th>' +
        // '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Longitude</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Direction</th></tr>' +
        '</thead><tbody>';

    function ExportData(ListPostionData) {

        function AddList(i) {
            if (i < ListPostionData.length) {

                if (ListPostionData[i].Latitude != undefined && ListPostionData[i].Latitude != null && ListPostionData[i].Latitude != '' && ListPostionData[i].Longitude != undefined && ListPostionData[i].Longitude != null && ListPostionData[i].Longitude != '') {
                    // geocoder.reverse({ lat: ListPostionData[i].Latitude, lon: ListPostionData[i].Longitude }, function(err, res) {
                    Commonfunction.GetAddressLatLong(ListPostionData[i].Latitude, ListPostionData[i].Longitude, function(resAddress) {
                        if (ListPostionData[i].iduser == req.query.UserId) {
                            if (ListPostionData[i].GroupName != undefined && ListPostionData[i].GroupName != null && ListPostionData[i].GroupName != '') {
                                var GroupName = ListPostionData[i].GroupName.toString();
                            } else {
                                var GroupName = "UnGroup";
                            }
                        } else {
                            if (ListPostionData[i].ShareGroupName != undefined && ListPostionData[i].ShareGroupName != null && ListPostionData[i].ShareGroupName != '') {
                                var GroupName = ListPostionData[i].ShareGroupName.toString();
                            } else {
                                var GroupName = "UnGroup";
                            }
                        }
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

                        if (ListPostionData[i].Time != undefined && ListPostionData[i].Time != null && ListPostionData[i].Time != '') {
                            var Time = ListPostionData[i].Time;
                        } else {
                            var Time = "N/A";
                        }

                        if (ListPostionData[i].IsOnline != undefined && ListPostionData[i].IsOnline != null && ListPostionData[i].IsOnline != '') {
                            var DeviceStatus = 'Online'
                                // ListPostionData[i].IsOnline.toString();
                        } else {
                            var DeviceStatus = "Offline";
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
                            var Degree = parseInt(ListPostionData[i].Direction);
                            if (Degree > 315 || Degree < 45) {
                                Direction = "North";
                            } else if (Degree == 45) {
                                Direction = "North-East";
                            } else if (Degree > 45 && Degree < 135) {
                                Direction = "East";
                            } else if (Degree == 135) {
                                Direction = "East-South";
                            } else if (Degree > 135 && Degree < 225) {
                                Direction = "South";
                            } else if (Degree == 225) {
                                Direction = "South-West";
                            } else if (Degree > 225 && Degree < 315) {
                                Direction = "West";
                            } else if (Degree == 315) {
                                Direction = "West-North";
                            }
                        } else {
                            var Direction = "0" + ' Degree';
                        }
                        
                        if (resAddress == '' || resAddress == null) {
                            resAddress = 'N/A';
                        }
                        Address = resAddress;
                        table += '<tr>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                            ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + GroupName + '</td>' +
                            ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + AssestName + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DeviceId + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Time + '</td>' +
                            ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Address + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DeviceStatus + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Engine + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Direction + '</td>' +
                            '</tr>';
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
                        var DeviceStatus = 'Offline'
                            
                    } else {
                        var DeviceStatus = "Online";
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
                        var Degree = parseInt(ListPostionData[i].Direction);
                        if (Degree > 315 || Degree < 45) {
                            Direction = "North";
                        } else if (Degree == 45) {
                            Direction = "North-East";
                        } else if (Degree > 45 && Degree < 135) {
                            Direction = "East";
                        } else if (Degree == 135) {
                            Direction = "East-South";
                        } else if (Degree > 135 && Degree < 225) {
                            Direction = "South";
                        } else if (Degree == 225) {
                            Direction = "South-West";
                        } else if (Degree > 225 && Degree < 315) {
                            Direction = "West";
                        } else if (Degree == 315) {
                            Direction = "West-North";
                        }
                    } else {
                        var Direction = "0";
                    }
                    var Address = "N/A";
                    table += '<tr>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                        ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + GroupName + '</td>' +
                        ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + AssestName + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DeviceId + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Time + '</td>' +
                        ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Address + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DeviceStatus + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Engine + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Direction + '</td>' +
                        '</tr>';
                    AddList(i + 1);
                }
            } else {
                table += '</tbody></table>' +
                    ' </div>' +
                    '</div>';
                var html = table;
                var options = {
                    format: 'A4',
                    footer: {
                        height: '35px',
                        contents: { default: '<hr/><span style="color: #444;text-align:right">{{page}}</span>' },
                        last: 'Last Page'
                    },
                    header: {
                        "height": "35px",
                    },
                };

                pdf.create(html, options).toStream(function(err, stream) {
                    stream.pipe(res);
                });
            }

        }
        AddList(0);
    }
});

/*================ LastPosition Report End====================*/



/*-------------------------Parking Report Start-----------------------*/

router.get('/GetAllParkingDataNew', function(req, res) {
    WhereCondition = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        WhereCondition = ' and gps.deviceid in (' + req.query.DeviceId + ')';
    }

    var Startdate = req.query.TodayStartDateTime;
    var Enddate = req.query.TodayEndDateTime;
    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    if (Startdate != '' && Enddate != '') {
        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEnddate + "'";
    } else if (Startdate != null && Startdate != '') {
        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
    } else if (Enddate != null && Enddate != '') {
        WhereCondition += " And gps.Date <='" + unixEnddate + "'";
    }
    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsPatchEngine as IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid,Bike.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    // console.log(query)
    var Count = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsPatchEngine as IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
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
            var Array = [];
            var IsParking = 0;
            var TotalAllParkingTime = 0;
            var TotalParkingtime = 0;
            for (var i = 0; i < lstGroup.length; i++) {
                IsParking = 0;
                var ParkingStartPosition = 0;

                if (lstGroup[i].data.length > 0) {
                    for (var k = 0; k < lstGroup[i].data.length; k++) {
                        lstGroup[i].data[k].Date = new Date(lstGroup[i].data[k].Date * 1000);
                        if (lstGroup[i].data[k].IsEngine == 1) {
                            if (IsParking == 1) {
                                IsParking = 0;
                                obj.EndTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                obj.EndTime1 = lstGroup[i].data[k].Date;
                                TotalParkingtime = calcDateDiffCalInSec(moment((lstGroup[i].data[k].Date)), moment(lstGroup[i].data[ParkingStartPosition].Date));
                                obj.ParkingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[ParkingStartPosition].Date)));
                                TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;
                                if (obj.ParkingTime != "0 sec") {
                                    obj.GroupName = "UnGroup";
                                    if (req.query.idUser == lstGroup[i].data[k].iduser) {
                                        if (lstGroup[i].data[k].GroupName != null && lstGroup[i].data[k].GroupName != undefined && lstGroup[i].data[k].GroupName != '') {
                                            obj.GroupName = lstGroup[i].data[k].GroupName;
                                        }
                                    } else {
                                        if (lstGroup[i].data[k].ShareGroupName != null && lstGroup[i].data[k].ShareGroupName != undefined && lstGroup[i].data[k].ShareGroupName != '') {
                                            obj.GroupName = lstGroup[i].data[k].ShareGroupName;
                                        }
                                    }
                                    Array.push(obj);
                                }
                            }
                        } else {
                            if (IsParking == 0) {
                                var obj = new Object();
                                ParkingStartPosition = 0;
                                obj.Latitude = lstGroup[i].data[k].Latitude;
                                obj.Longitude = lstGroup[i].data[k].Longitude;
                                obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                obj.Name = lstGroup[i].data[k].Name;
                                obj.StartTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                obj.StartTime1 = lstGroup[i].data[k].Date;
                                ParkingStartPosition = k;
                            }
                            IsParking = 1;
                        }
                    }
                    var LastPosition = lstGroup[i].data.length - 1;
                    if (IsParking == 1) {
                        IsParking = 0;
                        TotalParkingtime = calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[ParkingStartPosition].Date));
                        obj.EndTime = momentz.utc(lstGroup[i].data[LastPosition].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                        obj.EndTime1 = lstGroup[i].data[LastPosition].Date;
                        obj.ParkingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[ParkingStartPosition].Date)));
                        TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;
                        if (obj.ParkingTime != "0 sec") {
                            obj.GroupName = "UnGroup";
                            if (req.query.idUser == lstGroup[i].data[LastPosition].iduser) {
                                if (lstGroup[i].data[LastPosition].GroupName != null && lstGroup[i].data[LastPosition].GroupName != undefined && lstGroup[i].data[LastPosition].GroupName != '') {
                                    obj.GroupName = lstGroup[i].data[LastPosition].GroupName;
                                }
                            } else {
                                if (lstGroup[i].data[LastPosition].ShareGroupName != null && lstGroup[i].data[LastPosition].ShareGroupName != undefined && lstGroup[i].data[LastPosition].ShareGroupName != '') {
                                    obj.GroupName = lstGroup[i].data[LastPosition].ShareGroupName;
                                }
                            }
                            Array.push(obj);
                        }
                    }
                }
            }
            var response = new Object();
            response.Array = Array;
            response.TotalAllParkingTime = calhrminsecfromsec(TotalAllParkingTime);
            res.json(response);
        } else {
            res.json(RecordNotFound);
        }
    });
});

router.get('/ExportParkingReportNew', function(req, res) {
    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
            caption: 'Group Name',
            type: 'string'
        }, {
            caption: 'Asset Name',
            type: 'string'
        }, {
            caption: 'Start Time',
            type: 'string'
        }, {
            caption: 'End Time',
            type: 'string'
        }, {
            caption: 'Parking Time',
            type: 'string'
        },
        {
            caption: 'Address',
            type: 'string'
        },
    ];



    WhereCondition = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        WhereCondition = ' Where gps.deviceid in (' + req.query.DeviceId + ')';
    }
    var Startdate = req.query.StartDate;
    var Enddate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    if (Startdate != '' && Enddate != '') {

        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEnddate + "'";
    } else if (Startdate != null && Startdate != '') {

        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
    } else if (Enddate != null && Enddate != '') {

        WhereCondition += " And gps.Date <='" + unixEnddate + "'";

    }
    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsPatchEngine as IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid,Bike.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";

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
            var Array = [];
            var IsParking = 0;
            var TotalParkingtime = 0;
            var TotalAllParkingTime = 0;
            for (var i = 0; i < lstGroup.length; i++) {
                IsParking = 0;
                var ParkingStartPosition = 0;

                if (lstGroup[i].data.length > 0) {
                    for (var k = 0; k < lstGroup[i].data.length; k++) {
                        lstGroup[i].data[k].Date = new Date(lstGroup[i].data[k].Date * 1000);
                        if (lstGroup[i].data[k].IsEngine == 1) {
                            if (IsParking == 1) {
                                IsParking = 0;
                                obj.EndTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                TotalParkingtime = calcDateDiffCalInSec(moment((lstGroup[i].data[k].Date)), moment(lstGroup[i].data[ParkingStartPosition].Date));
                                obj.ParkingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[ParkingStartPosition].Date)));
                                TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;

                                if (obj.ParkingTime != "0 sec") {
                                    obj.GroupName = "UnGroup";
                                    if (req.query.idUser == lstGroup[i].data[k].iduser) {
                                        if (lstGroup[i].data[k].GroupName != null && lstGroup[i].data[k].GroupName != undefined && lstGroup[i].data[k].GroupName != '') {
                                            obj.GroupName = lstGroup[i].data[k].GroupName;
                                        }
                                    } else {
                                        if (lstGroup[i].data[k].ShareGroupName != null && lstGroup[i].data[k].ShareGroupName != undefined && lstGroup[i].data[k].ShareGroupName != '') {
                                            obj.GroupName = lstGroup[i].data[k].ShareGroupName;
                                        }
                                    }
                                    Array.push(obj);
                                }
                            }
                        } else {
                            if (IsParking == 0) {
                                var obj = new Object();
                                ParkingStartPosition = 0;
                                obj.Latitude = lstGroup[i].data[k].Latitude;
                                obj.Longitude = lstGroup[i].data[k].Longitude;
                                obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                obj.Name = lstGroup[i].data[k].Name;
                                obj.StartTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                ParkingStartPosition = k;
                            }
                            IsParking = 1;
                        }
                    }
                    var LastPosition = lstGroup[i].data.length - 1;
                    if (IsParking == 1) {
                        IsParking = 0;
                        TotalParkingtime = calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[ParkingStartPosition].Date));
                        obj.EndTime = momentz.utc(lstGroup[i].data[LastPosition].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                        obj.ParkingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[ParkingStartPosition].Date)));
                        TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;
                        if (obj.ParkingTime != "0 sec") {
                            obj.GroupName = "UnGroup";
                            if (req.query.idUser == lstGroup[i].data[LastPosition].iduser) {
                                if (lstGroup[i].data[LastPosition].GroupName != null && lstGroup[i].data[LastPosition].GroupName != undefined && lstGroup[i].data[LastPosition].GroupName != '') {
                                    obj.GroupName = lstGroup[i].data[LastPosition].GroupName;
                                }
                            } else {
                                if (lstGroup[i].data[LastPosition].ShareGroupName != null && lstGroup[i].data[LastPosition].ShareGroupName != undefined && lstGroup[i].data[LastPosition].ShareGroupName != '') {
                                    obj.GroupName = lstGroup[i].data[LastPosition].ShareGroupName;
                                }
                            }
                            Array.push(obj);
                        }
                    }
                }
            }
            TotalAllParkingTime = calhrminsecfromsec(TotalAllParkingTime);
        }
        if (Array.length > 0) {
            var data = u.sortBy(Array, function(num) { return new Date(num.StartTime) }) 
            Array = data;
        }

        GetData(0);

        function GetData(i) {
            var row = [];
            if (i < Array.length) {

                var Name = 'N/A';
                var GroupName = "UnGroup";
                var StartTime = 'N/A';
                var EndTime = 'N/A';
                var Address = 'N/A';
                var ParkingTime = 'N/A';
                var Direction = 0.00;
                var Latitude = 0.00;
                var Longitude = '';

                if (Array[i].Latitude != undefined && Array[i].Latitude != null && Array[i].Latitude != '' && Array[i].Longitude != undefined && Array[i].Longitude != null && response[i].Longitude != '') {
                    
                    Commonfunction.GetAddressLatLong(Array[i].Latitude, Array[i].Longitude, function(resAddress) {
                        if (Array[i].GroupName != null && Array[i].GroupName != '' && Array[i].GroupName != undefined) {
                            GroupName = Array[i].GroupName;
                        }

                        if (Array[i].StartTime != null && Array[i].StartTime != '' && Array[i].StartTime != undefined) {
                            StartTime = Array[i].StartTime;
                        }

                        if (Array[i].EndTime != null && Array[i].EndTime != '' && Array[i].EndTime != undefined) {
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
                        
                        if (resAddress == '' || resAddress == null) {
                            resAddress = 'N/A';
                        }
                        Address = resAddress;
                        row.push(GroupName, Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString());
                        conf.rows.push(row);
                        GetData(i + 1);
                    })
                } else {
                    if (Array[i].GroupName != null && Array[i].GroupName != '' && Array[i].GroupName != undefined) {
                        GroupName = Array[i].GroupName;
                    }
                    if (Array[i].StartTime != null && Array[i].StartTime != '' && Array[i].StartTime != undefined) {
                        StartTime = Array[i].StartTime;
                    }

                    if (Array[i].EndTime != null && Array[i].EndTime != '' && Array[i].EndTime != undefined) {
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
                    row.push(GroupName, Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address);
                    conf.rows.push(row);
                    GetData(i + 1);
                }

            } else {
                row.push("Total:", '', '', TotalAllParkingTime, '', '', '');
                conf.rows.push(row);
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=ParkingReport.xlsx");
                res.end(result, 'binary');
            }
        }

    })
})
router.get('/PrintParkingReportNew', function(req, res) {

    WhereCondition = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        WhereCondition = ' Where gps.deviceid in (' + req.query.DeviceId + ')';
    }
    var Startdate = req.query.StartDate;
    var Enddate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    if (Startdate != '' && Enddate != '') {

        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEnddate + "'";
    } else if (Startdate != null && Startdate != '') {

        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
    } else if (Enddate != null && Enddate != '') {

        WhereCondition += " And gps.Date <='" + unixEnddate + "'";

    }
    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsPatchEngine as IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid,Bike.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    connection.query(query, function(err, response, fields) {
        var Array = [];
        if (response.length > 0) {


            var groups = u.groupBy(response, function(o) {
                return o.DeviceId;
            });

            var lstGroup = u.map(groups, function(group) {

                return {
                    data: group
                }
            });
            var Array = [];
            var IsParking = 0;
            var TotalParkingtime = 0;
            var TotalAllParkingTime = 0;
            for (var i = 0; i < lstGroup.length; i++) {
                IsParking = 0;
                var ParkingStartPosition = 0;

                if (lstGroup[i].data.length > 0) {
                    for (var k = 0; k < lstGroup[i].data.length; k++) {
                        lstGroup[i].data[k].Date = new Date(lstGroup[i].data[k].Date * 1000);
                        if (lstGroup[i].data[k].IsEngine == 1) {
                            if (IsParking == 1) {
                                IsParking = 0;
                                obj.EndTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                TotalParkingtime = calcDateDiffCalInSec(moment((lstGroup[i].data[k].Date)), moment(lstGroup[i].data[ParkingStartPosition].Date));
                                obj.ParkingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[ParkingStartPosition].Date)));
                                TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;

                                if (obj.ParkingTime != "0 sec") {
                                    obj.GroupName = "UnGroup";
                                    if (req.query.idUser == lstGroup[i].data[k].iduser) {
                                        if (lstGroup[i].data[k].GroupName != null && lstGroup[i].data[k].GroupName != undefined && lstGroup[i].data[k].GroupName != '') {
                                            obj.GroupName = lstGroup[i].data[k].GroupName;
                                        }
                                    } else {
                                        if (lstGroup[i].data[k].ShareGroupName != null && lstGroup[i].data[k].ShareGroupName != undefined && lstGroup[i].data[k].ShareGroupName != '') {
                                            obj.GroupName = lstGroup[i].data[k].ShareGroupName;
                                        }
                                    }
                                    Array.push(obj);
                                }
                            }
                        } else {
                            if (IsParking == 0) {
                                var obj = new Object();
                                ParkingStartPosition = 0;
                                obj.Latitude = lstGroup[i].data[k].Latitude;
                                obj.Longitude = lstGroup[i].data[k].Longitude;
                                obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                obj.Name = lstGroup[i].data[k].Name;
                                obj.StartTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                ParkingStartPosition = k;
                            }
                            IsParking = 1;
                        }
                    }
                    var LastPosition = lstGroup[i].data.length - 1;
                    if (IsParking == 1) {
                        IsParking = 0;
                        TotalParkingtime = calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[ParkingStartPosition].Date));
                        obj.EndTime = momentz.utc(lstGroup[i].data[LastPosition].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                        obj.ParkingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[ParkingStartPosition].Date)));
                        TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;
                        if (obj.ParkingTime != "0 sec") {
                            obj.GroupName = "UnGroup";
                            if (req.query.idUser == lstGroup[i].data[LastPosition].iduser) {
                                if (lstGroup[i].data[LastPosition].GroupName != null && lstGroup[i].data[LastPosition].GroupName != undefined && lstGroup[i].data[LastPosition].GroupName != '') {
                                    obj.GroupName = lstGroup[i].data[LastPosition].GroupName;
                                }
                            } else {
                                if (lstGroup[i].data[LastPosition].ShareGroupName != null && lstGroup[i].data[LastPosition].ShareGroupName != undefined && lstGroup[i].data[LastPosition].ShareGroupName != '') {
                                    obj.GroupName = lstGroup[i].data[LastPosition].ShareGroupName;
                                }
                            }
                            Array.push(obj);
                        }
                    }
                }
            }
            TotalAllParkingTime = calhrminsecfromsec(TotalAllParkingTime);
        }
        if (Array.length > 0) {
            var data = u.sortBy(Array, function(num) { return new Date(num.StartTime) }) //.reverse();
            Array = data;
        }

        GetData(0);
        var TodayDate = momentz.utc(new Date()).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');

         var table = '<div style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; padding:0 15px;">' +
            '<div style="padding:15px; border-bottom:1px solid #000;">' +
            '<h1 style="text-transform: uppercase; text-align:center; font-weight: normal;font-size: 14px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Parking Report</h1>' +
            '<div style="text-align: right;font-size: 8px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"><strong>' + TodayDate + '</strong></div>' +
            '</div>' +
            '<div>' +
            '<table style="width:100%; margin:0; padding: 0;">' +
            '<thead>' +
            '<tr>' +
            '<th style="padding: 10px 5px;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-bottom: 1px dotted #000; border-right: 1px dotted #000;">No</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Group Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Start Time</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">End Time</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Parking Time</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Address</th></tr>' +
            '</thead><tbody>';

        function GetData(i) {
            var row = [];
            if (i < Array.length) {
                var GroupName = "UnGroup";
                var Name = 'N/A';
                var StartTime = 'N/A';
                var EndTime = 'N/A';
                var Address = 'N/A';
                var ParkingTime = 'N/A';
                var Direction = 0.00;
                var Latitude = 0.00;
                var Longitude = '';

                if (Array[i].Latitude != undefined && Array[i].Latitude != null && Array[i].Latitude != '' && Array[i].Longitude != undefined && Array[i].Longitude != null && response[i].Longitude != '') {
                    // geocoder.reverse({ lat: Array[i].Latitude, lon: Array[i].Longitude }, function(err, res) {
                    Commonfunction.GetAddressLatLong(Array[i].Latitude, Array[i].Longitude, function(resAddress) {
                        if (Array[i].GroupName != null && Array[i].GroupName != '' && Array[i].GroupName != undefined) {
                            GroupName = Array[i].GroupName;
                        }
                        if (Array[i].StartTime != null && Array[i].StartTime != '' && Array[i].StartTime != undefined) {
                            StartTime = Array[i].StartTime;
                        }

                        if (Array[i].EndTime != null && Array[i].EndTime != '' && Array[i].EndTime != undefined) {
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
                       
                        if (resAddress == '' || resAddress == null) {
                            resAddress = 'N/A';
                        }
                        Address = resAddress;
                        table += '<tr>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + GroupName.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + StartTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + EndTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + ParkingTime.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Address.toString() + '</td>' +
                            '</tr>';
                        GetData(i + 1);
                    })
                } else {
                    if (Array[i].GroupName != null && Array[i].GroupName != '' && Array[i].GroupName != undefined) {
                        GroupName = Array[i].GroupName;
                    }
                    if (Array[i].StartTime != null && Array[i].StartTime != '' && Array[i].StartTime != undefined) {
                        StartTime = Array[i].StartTime;
                    }

                    if (Array[i].EndTime != null && Array[i].EndTime != '' && Array[i].EndTime != undefined) {
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
                    table += '<tr>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + GroupName.toString() + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva,Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + StartTime + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + EndTime + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + ParkingTime.toString() + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Address.toString() + '</td>' +
                        '</tr>';
                    GetData(i + 1);
                }

            } else {
                
                table += '  <tfoot style="font-weight: bold;">' +
                    ' <tr>' +
                    ' <td style="padding: 8px 5px; border-bottom: 1px dotted #000; border-right: 1px dotted #000;" colspan="2">Total:</td>' +
                    ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                    ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                    ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                    ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TotalAllParkingTime + '</td>' +
                    ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"></td>' +
                    '</tr>' +
                    '</tfoot>';
                table += '</tbody></table>' +
                    ' </div>' +
                    '</div>';
                var html = table;
                var options = {
                    format: 'A4',
                    footer: {
                        height: '35px',
                        contents: { default: '<hr/><span style="color: #444;text-align:right">{{page}}</span>' },
                        last: 'Last Page'
                    },
                    header: {
                        "height": "35px",
                    },
                };

                pdf.create(html, options).toStream(function(err, stream) {
                    stream.pipe(res);
                });
            }
        }

    })
})

/*-------------------------Parking Report End-----------------------*/


//--------------------------Driving Report Start-------------------------------------------//

router.get('/GetAllDriverReportNew', function(req, res) {
    var objParam = req.query;
    var wherecondition1 = "";
    var WhereCondition = "";
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " Where gps.DeviceId in ( " + objParam.DeviceId + ")";
        wherecondition1 += " Where ta.deviceid in ( " + objParam.DeviceId + ")";

    }
    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";
        wherecondition1 += " And ta.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";

    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
        wherecondition1 += " And gps.Date >='" + unixStartdate + "'";

    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date <='" + unixEndDate + "'";
        wherecondition1 += " And ta.Date <='" + unixEndDate + "'";
    }


    wherecondition1 += " And ta.AlarmCode = '11'";
    
    var query = "select " +
        " gps.Date,gps.Speed,gps.Longitude,gps.Latitude,gps.Direction,gps.GPSPositioning,gps.DeviceId,gps.IsPatchEngine as IsEngine,Bike.*,tvg.GroupName,tvgs.GroupName as ShareGroupName  " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";

    var query1 = "select ta.Datetime, ta.Date, ta.deviceid from tblalarm as ta left join tblvehicle As Bike on ta.deviceid = Bike.deviceid " + wherecondition1 + ";"

    connection.query(query, function(err, response, fields) {
        if (response.length > 0) {
            connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {
                var groups = u.groupBy(response, function(o) {
                    return o.DeviceId;
                });
                var lstGroup = u.map(groups, function(group) {
                    return {
                        data: group
                    }
                });
                
                var l = 0;
                var D = 0;
                var Array = [];
                var TotalDrivingtime = 0;
                for (var i = 0; i < lstGroup.length; i++) {

                    var IsDriving = 0;
                    var DrivingStartPosition = 0;


                    var Speed6090 = 0;
                    var Speed90130 = 0;
                    var Over130 = 0;
                    var LocateNumber = 0;
                    var objSpeed = [];
                    var TotalRecord = 0;
                    var Mileage = 0.00;
                    var Totalsum = 0;

                    if (lstGroup[i].data.length > 0) {
                        var StartMilage = 0;
                        var Milageco = 0;
                        var Engineco = 0;
                        var id = 0;
                        for (var k = 0; k < lstGroup[i].data.length; k++) {
                            lstGroup[i].data[k].Date = new Date(lstGroup[i].data[k].Date * 1000);

                            if (lstGroup[i].data[k].IsEngine == true) {
                                if (lstGroup[i].data[k].Speed > 1 && lstGroup[i].data[k].GPSPositioning == 'A') {
                                    objSpeed.push(parseFloat(lstGroup[i].data[k].Speed));
                                    if (lstGroup[i].data[k].Speed > 60 && lstGroup[i].data[k].Speed <= 90) {
                                        Speed6090 = Speed6090 + 1;
                                    }
                                    if (lstGroup[i].data[k].Speed > 90 && lstGroup[i].data[k].Speed <= 130) {
                                        Speed90130 = Speed6090 + 1;
                                    }
                                    if (lstGroup[i].data[k].Speed > 130) {
                                        Over130 = Over130 + 1;
                                    }
                                    TotalRecord = TotalRecord + 1;

                                }

                                if (Engineco == 0) {
                                    StartMilage = k;
                                    
                                    Engineco = 1;
                                    
                                }
                                // obj.s_id = 0;
                                if ((k != 0) && lstGroup[i].data[k].GPSPositioning == 'A') {

                                    if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                        Milageco = 0;
                                        Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                        StartMilage = k;
                                    } else {

                                        if (Milageco == 0) {
                                            Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                            StartMilage = k;
                                        }
                                        Milageco = 1;
                                    }
                                }
                                
                                if (k == 0) { LocateNumber = 1; } else {
                                    if (lstGroup[i].data[k].Latitude != lstGroup[i].data[k - 1].Latitude && lstGroup[i].data[k].Longitude != lstGroup[i].data[k - 1].Longitude) {
                                        {
                                            LocateNumber = LocateNumber + 1;
                                        }
                                    }
                                }
                                if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (IsDriving == 0) {
                                        DrivingStartPosition = k;
                                        var obj = new Object();
                                        
                                        obj.OverSpeed = 0;
                                        obj.StartLatitude = lstGroup[i].data[k].Latitude;
                                        obj.StartLongitude = lstGroup[i].data[k].Longitude;
                                        obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                        obj.StartSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                        obj.Name = lstGroup[i].data[k].Name;
                                        obj.StartAddress = "No Address Found";
                                        obj.EndAddress = "No Address Found";
                                        
                                        obj.DrivingStartTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                                        obj.DrivingStartTime1 = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a')
                                        obj.StartTime1 = lstGroup[i].data[k].Date;
                                    }
                                    IsDriving = 1;
                                }
                            } else {
                                Engineco = 0;
                                if (IsDriving == 1) {
                                    IsDriving = 0;
                                    obj.EndLatitude = lstGroup[i].data[k].Latitude;
                                    obj.EndLongitude = lstGroup[i].data[k].Longitude;
                                    obj.EndSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                    obj.EndDrivingTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                    obj.EndDrivingTime1 = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a');
                                    obj.EndTime1 = lstGroup[i].data[k].Date;
                                    obj.Speed6090 = Speed6090;
                                    obj.Speed90130 = Speed90130;
                                    obj.Over130 = Over130;
                                    Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                    obj.Mileage = parseFloat(Mileage); //.toFixed(2);
                                    var sum = 0;

                                    for (var m = 0; m < objSpeed.length; m++) {
                                        sum += parseFloat(objSpeed[m]);
                                    }
                                    // console.log(sum)
                                    if (sum != 0) {
                                        obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                                        obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                                    } else {
                                        obj.avgSpeed = 0;
                                        obj.MaxSpeed = 0;
                                    }
                                    //obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                                    obj.LocateNumber = LocateNumber;
                                    obj.DrivingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date)));
                                    TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                                    // console.log(obj.s_id, "====", obj.EndId)
                                    if (obj.DrivingTime != "0 sec") {
                                        obj.GroupName = "UnGroup";
                                        if (req.query.idUser == lstGroup[i].data[k].iduser) {
                                            if (lstGroup[i].data[k].GroupName != null && lstGroup[i].data[k].GroupName != undefined && lstGroup[i].data[k].GroupName != '') {
                                                obj.GroupName = lstGroup[i].data[k].GroupName;
                                            }
                                        } else {
                                            if (lstGroup[i].data[k].ShareGroupName != null && lstGroup[i].data[k].ShareGroupName != undefined && lstGroup[i].data[k].ShareGroupName != '') {
                                                obj.GroupName = lstGroup[i].data[k].ShareGroupName;
                                            }
                                        }
                                        Array.push(obj);
                                    }
                                    StartVehical = 0;
                                    Speed6090 = 0;
                                    Speed90130 = 0;
                                    Over130 = 0;
                                    LocateNumber = 0;
                                    objSpeed = [];
                                    TotalRecord = 0;
                                    Mileage = 0.00;
                                }
                            }
                        }
                        if (IsDriving == 1) {
                            IsDriving = 0;
                            var lastposition = lstGroup[i].data.length - 1;
                            obj.EndLatitude = lstGroup[i].data[lastposition].Latitude;
                            obj.EndLongitude = lstGroup[i].data[lastposition].Longitude;
                            obj.EndSpeed = parseFloat(lstGroup[i].data[lastposition].Speed).toFixed(2);
                            obj.EndDrivingTime = momentz.utc(lstGroup[i].data[lastposition].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                            // obj.EndId = lstGroup[i].data[lastposition].Id;
                            obj.EndDrivingTime1 = momentz.utc(lstGroup[i].data[lastposition].Date).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a');
                            obj.EndTime1 = lstGroup[i].data[lastposition].Date;
                            obj.Speed6090 = Speed6090;
                            obj.Speed90130 = Speed90130;
                            obj.Over130 = Over130;
                            obj.Mileage = parseFloat(Mileage).toFixed(2);
                            var sum = 0;
                            for (var m = 0; m < objSpeed.length; m++) {
                                sum += parseFloat(objSpeed[m]);
                            }
                            // console.log(sum)
                            if (sum != 0) {
                                obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                                obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                            } else {
                                obj.avgSpeed = 0;
                                obj.MaxSpeed = 0;
                            }
                            obj.LocateNumber = LocateNumber;
                            obj.DrivingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[lastposition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date)));
                            TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[lastposition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                            
                            if (obj.DrivingTime != "0 sec") {
                                obj.GroupName = "UnGroup";
                                if (req.query.idUser == lstGroup[i].data[lastposition].iduser) {
                                    if (lstGroup[i].data[lastposition].GroupName != null && lstGroup[i].data[lastposition].GroupName != undefined && lstGroup[i].data[lastposition].GroupName != '') {
                                        obj.GroupName = lstGroup[i].data[lastposition].GroupName;
                                    }
                                } else {
                                    if (lstGroup[i].data[lastposition].ShareGroupName != null && lstGroup[i].data[lastposition].ShareGroupName != undefined && lstGroup[i].data[lastposition].ShareGroupName != '') {
                                        obj.GroupName = lstGroup[i].data[lastposition].ShareGroupName;
                                    }
                                }
                                Array.push(obj);
                            }
                        }
                    }
                }
                var obj = new Object();
                obj.TotalDrivingTime = calhrminsecfromsec(TotalDrivingtime);

                if (alarmresponse.length > 0) {
                    for (var i = 0; i <= Array.length; i++) {
                        if (i < Array.length) {
                            for (var h = 0; h < alarmresponse.length; h++) {
                                var alarmDate = momentz.utc(new Date(alarmresponse[h].Date * 1000)).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a');

                                if (alarmresponse[h].deviceid == Array[i].DeviceId) {
                                    if (new Date(alarmDate) >= new Date(Array[i].DrivingStartTime1) && new Date(alarmDate) <= new Date(Array[i].EndDrivingTime1)) {
                                        Array[i].OverSpeed = Array[i].OverSpeed + 1;
                                    }
                                }
                            }
                        } else {
                            obj.Array = Array;
                            res.json(obj);
                        }
                    }
                } else {
                    obj.Array = Array;
                    res.json(obj);
                }
            })
        } else {
            res.json(null);
        }

    });

})

router.get('/PrintDriverReportNew', function(req, res) {


    var objParam = req.query;
    var wherecondition1 = "";
    var WhereCondition = "";
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " Where gps.DeviceId in (" + objParam.DeviceId + ")";
        wherecondition1 += " Where ta.deviceid in (" + objParam.DeviceId + ")";

    }
    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";
        wherecondition1 += " And ta.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";


    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
        wherecondition1 += " And ta.Date >='" + unixStartdate + "'";

    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date <='" + unixEndDate + "'";
        wherecondition1 += " And ta.Date <='" + unixEndDate + "'";


    }


    wherecondition1 += " And ta.AlarmCode = '11'";
var query = "select " +
        " gps.Date,gps.Speed,gps.Longitude,gps.Latitude,gps.Direction,gps.GPSPositioning,gps.DeviceId,gps.IsPatchEngine as IsEngine,Bike.*,tvg.GroupName,tvgs.GroupName as ShareGroupName  " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    var query1 = "select ta.Datetime, ta.Date, ta.deviceid from tblalarm as ta left join tblvehicle As Bike on ta.deviceid = Bike.deviceid " + wherecondition1 + ";"

    connection.query(query, function(err, response, fields) {
        connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {
            if (response.length > 0) {

                var groups = u.groupBy(response, function(o) {
                    return o.DeviceId;
                });

                var TodayDate = momentz.utc(new Date()).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');



                var table = '<div style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; padding:0 15px;">' +
                    '<div style="padding:15px; border-bottom:1px solid #000;">' +
                    '<h1 style="text-transform: uppercase; text-align:center; font-weight: normal;font-size: 14px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Driving Report</h1>' +
                    '<div style="text-align: right;font-size: 8px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"><strong>' + TodayDate + '</strong></div>' +
                    '</div>' +
                    '<div>' +
                    '<table style="width:100%; margin:0; padding: 0;">' +
                    '<thead>' +
                    '<tr>' +
                    '<th style="padding: 10px 5px;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-bottom: 1px dotted #000; border-right: 1px dotted #000;">No</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Group Name</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Assest Name</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Start Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">End Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Driving Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">60-90 Speed (km/h)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">90-130 Speed (km/h)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Over 130 Speed (km/h)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Max Speed</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Avearge Speed</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Over Speeding Frequency</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Mileage</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Start Longitude</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Start Latitude</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">End Longitude</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">End Latitude</th></tr>' +
                    '</thead><tbody>';
                var lstGroup = u.map(groups, function(group) {

                    return {
                        data: group
                    }
                });
                var l = 0;
                var D = 0;
                var Array = [];
                var TotalDrivingtime = 0;
                for (var i = 0; i < lstGroup.length; i++) {

                    var IsDriving = 0;
                    var DrivingStartPosition = 0;
                    var TotalDrivingtime = 0;

                    var Speed6090 = 0;
                    var Speed90130 = 0;
                    var Over130 = 0;
                    var LocateNumber = 0;
                    var objSpeed = [];
                    var TotalRecord = 0;
                    var Mileage = 0.00;
                    var Totalsum = 0;
                    if (lstGroup[i].data.length > 0) {
                        var StartMilage = 0;
                        var Milageco = 0;
                        var Engineco = 0;
                        var id = 0;
                        for (var k = 0; k < lstGroup[i].data.length; k++) {
                            lstGroup[i].data[k].Date = new Date(lstGroup[i].data[k].Date * 1000);

                            if (lstGroup[i].data[k].IsEngine == true) {
                                if (lstGroup[i].data[k].Speed > 1 && lstGroup[i].data[k].GPSPositioning == 'A') {
                                    objSpeed.push(parseFloat(lstGroup[i].data[k].Speed));
                                    if (lstGroup[i].data[k].Speed > 60 && lstGroup[i].data[k].Speed <= 90) {
                                        Speed6090 = Speed6090 + 1;
                                    }
                                    if (lstGroup[i].data[k].Speed > 90 && lstGroup[i].data[k].Speed <= 130) {
                                        Speed90130 = Speed6090 + 1;
                                    }
                                    if (lstGroup[i].data[k].Speed > 130) {
                                        Over130 = Over130 + 1;
                                    }
                                    TotalRecord = TotalRecord + 1;

                                }

                                if (Engineco == 0) {
                                    StartMilage = k;
                                    Engineco = 1;
                                }
                                if ((k != 0) && lstGroup[i].data[k].GPSPositioning == 'A') {

                                    if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                        Milageco = 0;
                                        Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                        StartMilage = k;
                                    } else {

                                        if (Milageco == 0) {
                                            Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                            StartMilage = k;
                                        }
                                        Milageco = 1;
                                    }
                                }
                                if (k == 0) { LocateNumber = 1; } else {
                                    if (lstGroup[i].data[k].Latitude != lstGroup[i].data[k - 1].Latitude && lstGroup[i].data[k].Longitude != lstGroup[i].data[k - 1].Longitude) {
                                        {
                                            LocateNumber = LocateNumber + 1;
                                        }
                                    }
                                }
                                if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (IsDriving == 0) {
                                        DrivingStartPosition = k;
                                        var obj = new Object();
                                        obj.OverSpeed = 0;
                                        obj.StartLatitude = lstGroup[i].data[k].Latitude;
                                        obj.StartLongitude = lstGroup[i].data[k].Longitude;
                                        obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                        obj.StartSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                        obj.Name = lstGroup[i].data[k].Name;
                                        obj.StartAddress = "No Address Found";
                                        obj.EndAddress = "No Address Found";
                                        obj.DrivingStartTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                                        obj.DrivingStartTime1 = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a')
                                    }
                                    IsDriving = 1;
                                }
                            } else {
                                Engineco = 0;
                                if (IsDriving == 1) {
                                    IsDriving = 0;
                                    obj.EndLatitude = lstGroup[i].data[k].Latitude;
                                    obj.EndLongitude = lstGroup[i].data[k].Longitude;
                                    obj.EndSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                    obj.EndDrivingTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                    obj.EndDrivingTime1 = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a');
                                    obj.Speed6090 = Speed6090;
                                    obj.Speed90130 = Speed90130;
                                    obj.Over130 = Over130;
                                    Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                    obj.Mileage = parseFloat(Mileage).toFixed(2);
                                    var sum = 0;

                                    for (var m = 0; m < objSpeed.length; m++) {
                                        sum += parseFloat(objSpeed[m]);
                                    }
                                    if (sum != 0) {
                                        obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                                        obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                                    } else {
                                        obj.avgSpeed = 0;
                                        obj.MaxSpeed = 0;
                                    }
                                    obj.LocateNumber = LocateNumber;
                                    obj.DrivingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date)));
                                    TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                                    if (obj.DrivingTime != "0 sec") {
                                        obj.GroupName = "UnGroup";
                                        if (req.query.idUser == lstGroup[i].data[k].iduser) {
                                            if (lstGroup[i].data[k].GroupName != null && lstGroup[i].data[k].GroupName != undefined && lstGroup[i].data[k].GroupName != '') {
                                                obj.GroupName = lstGroup[i].data[k].GroupName;
                                            }
                                        } else {
                                            if (lstGroup[i].data[k].ShareGroupName != null && lstGroup[i].data[k].ShareGroupName != undefined && lstGroup[i].data[k].ShareGroupName != '') {
                                                obj.GroupName = lstGroup[i].data[k].ShareGroupName;
                                            }
                                        }

                                        Array.push(obj);
                                    }
                                    StartVehical = 0;
                                    Speed6090 = 0;
                                    Speed90130 = 0;
                                    Over130 = 0;
                                    LocateNumber = 0;
                                    objSpeed = [];
                                    TotalRecord = 0;
                                    Mileage = 0.00;
                                }
                            }
                        }
                        if (IsDriving == 1) {
                            IsDriving = 0;
                            var lastposition = lstGroup[i].data.length - 1;
                            obj.EndLatitude = lstGroup[i].data[lastposition].Latitude;
                            obj.EndLongitude = lstGroup[i].data[lastposition].Longitude;
                            obj.EndSpeed = parseFloat(lstGroup[i].data[lastposition].Speed).toFixed(2);
                            obj.EndDrivingTime = momentz.utc(lstGroup[i].data[lastposition].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                            obj.EndDrivingTime1 = momentz.utc(lstGroup[i].data[lastposition].Date).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a');

                            obj.Speed6090 = Speed6090;
                            obj.Speed90130 = Speed90130;
                            obj.Over130 = Over130;
                            obj.Mileage = parseFloat(Mileage).toFixed(2);
                            var sum = 0;
                            for (var m = 0; m < objSpeed.length; m++) {
                                sum += parseFloat(objSpeed[m]);
                            }
                            if (sum != 0) {
                                obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                                obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                            } else {
                                obj.avgSpeed = 0;
                                obj.MaxSpeed = 0;
                            }
                            obj.LocateNumber = LocateNumber;
                            obj.DrivingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[lastposition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date)));
                            TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[lastposition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                            if (obj.DrivingTime != "0 sec") {
                                obj.GroupName = "UnGroup";
                                if (req.query.idUser == lstGroup[i].data[lastposition].iduser) {
                                    if (lstGroup[i].data[lastposition].GroupName != null && lstGroup[i].data[lastposition].GroupName != undefined && lstGroup[i].data[lastposition].GroupName != '') {
                                        obj.GroupName = lstGroup[i].data[lastposition].GroupName;
                                    }
                                } else {
                                    if (lstGroup[i].data[lastposition].ShareGroupName != null && lstGroup[i].data[lastposition].ShareGroupName != undefined && lstGroup[i].data[lastposition].ShareGroupName != '') {
                                        obj.GroupName = lstGroup[i].data[lastposition].ShareGroupName;
                                    }
                                }
                                Array.push(obj);
                            }
                        }
                    }
                }
                TotalDrivingtime = calhrminsecfromsec(TotalDrivingtime);
                if (alarmresponse.length > 0) {
                    for (var i = 0; i <= Array.length; i++) {
                        if (i < Array.length) {
                            for (var h = 0; h < alarmresponse.length; h++) {
                                var alarmDate = momentz.utc(new Date(alarmresponse[h].Date * 1000)).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a');
                                if (alarmresponse[h].deviceid == Array[i].DeviceId) {
                                    if (new Date(alarmDate) >= new Date(Array[i].DrivingStartTime1) && new Date(alarmDate) <= new Date(Array[i].EndDrivingTime1)) {
                                        Array[i].OverSpeed = Array[i].OverSpeed + 1;
                                    }
                                }
                            }
                        } else {
                            if (Array.length > 0) {
                                var data = u.sortBy(Array, function(num) { return new Date(num.DrivingStartTime1) });
                                Array = data;
                            }
                            GetDrivingData(0);
                        }
                    }
                } else {
                    if (Array.length > 0) {
                        var data = u.sortBy(Array, function(num) { return new Date(num.DrivingStartTime1) });
                        Array = data;
                    }
                    GetDrivingData(0);
                }


                function GetDrivingData(i) {
                    var Name = '';
                    var GroupName = "UnGroup";
                    var DrivingStartTime = '';
                    var EndDrivingTime = '';
                    var DrivingTime = '';
                    var LocateNumber = '';
                    var Speed6090 = '';
                    var Speed90130 = '';
                    var Over130 = '';
                    var MaxSpeed = 0.0;
                    var avgSpeed = 0.0;
                    var OverSpeed = 0.0;
                    var StartSpeed = '';
                    var EndSpeed = '';
                    var StartLongitude = '';
                    var StartLatitude = '';
                    var EndLongitude = '';
                    var EndLatitude = '';
                    if (i < Array.length) {
                        if (Array[i].GroupName != null && Array[i].GroupName != '' && Array[i].GroupName != undefined) {
                            GroupName = Array[i].GroupName;
                        }
                        if (Array[i].Name != null && Array[i].Name != '' && Array[i].Name != undefined) {
                            Name = Array[i].Name;
                        }
                        if (Array[i].DrivingStartTime != null && Array[i].DrivingStartTime != '' && Array[i].DrivingStartTime != undefined) {
                            DrivingStartTime = Array[i].DrivingStartTime.toString();
                        }
                        if (Array[i].EndDrivingTime != null && Array[i].EndDrivingTime != '' && Array[i].EndDrivingTime != undefined) {
                            EndDrivingTime = Array[i].EndDrivingTime.toString();
                        }
                        if (Array[i].DrivingTime != null && Array[i].DrivingTime != '' && Array[i].DrivingTime != undefined) {
                            DrivingTime = Array[i].DrivingTime.toString();
                        }

                        if (Array[i].LocateNumber != null && Array[i].LocateNumber != '' && Array[i].LocateNumber != undefined) {
                            LocateNumber = Array[i].LocateNumber.toString();
                        }
                        if (Array[i].Speed6090 != null && Array[i].Speed6090 != undefined) {
                            Speed6090 = Array[i].Speed6090.toString();
                        }
                        if (Array[i].Speed90130 != null && Array[i].Speed90130 != undefined) {
                            Speed90130 = Array[i].Speed90130.toString();
                        }
                        if (Array[i].Over130 != null && Array[i].Over130 != undefined) {
                            Over130 = Array[i].Over130.toString();
                        }
                        if (Array[i].MaxSpeed != null && Array[i].MaxSpeed != '' && Array[i].MaxSpeed != undefined) {
                            MaxSpeed = Array[i].MaxSpeed.toString();
                        }
                        if (Array[i].avgSpeed != null && Array[i].avgSpeed != '' && Array[i].avgSpeed != undefined) {
                            avgSpeed = Array[i].avgSpeed.toString();
                        }

                        if (Array[i].OverSpeed != null && Array[i].OverSpeed != '' && Array[i].OverSpeed != undefined) {
                            OverSpeed = Array[i].OverSpeed.toString();
                        }
                        if (Array[i].Mileage != null && Array[i].Mileage != '' && Array[i].Mileage != undefined) {
                            StartSpeed = Array[i].Mileage.toString();
                        }
                        if (Array[i].StartLongitude != null && Array[i].StartLongitude != '' && Array[i].StartLongitude != undefined) {
                            StartLongitude = Array[i].StartLongitude.toString();
                        }
                        if (Array[i].StartLatitude != null && Array[i].StartLatitude != '' && Array[i].StartLatitude != undefined) {
                            StartLatitude = Array[i].StartLatitude.toString();
                        }
                        if (Array[i].EndLongitude != null && Array[i].EndLongitude != '' && Array[i].EndLongitude != undefined) {
                            EndLongitude = Array[i].EndLongitude.toString();
                        }
                        if (Array[i].EndLatitude != null && Array[i].EndLatitude != '' && Array[i].EndLatitude != undefined) {
                            EndLatitude = Array[i].EndLatitude.toString();
                        }
                        table += '<tr>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + GroupName + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DrivingStartTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + EndDrivingTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DrivingTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed6090 + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed90130 + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Over130 + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + MaxSpeed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + avgSpeed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + OverSpeed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + StartSpeed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + StartLongitude + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + StartLatitude + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + EndLongitude + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + EndLatitude + '</td>' +
                            '</tr>';

                        GetDrivingData(i + 1);
                    } else {


                        table += '</tbody><tfoot style="font-weight: bold;">' +
                            ' <tr>' +
                            ' <td style="padding: 8px 5px; border-bottom: 1px dotted #000; border-right: 1px dotted #000;" colspan="2">Total:</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"> </td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TotalDrivingtime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"></td>' +
                            '</tr>' +
                            '</tfoot>';
                        table += '</table>' +
                            ' </div>' +
                            '</div>';
                        var html = table;
                        var options = {
                            format: 'A4',
                            orientation: "landscape",
                            footer: {
                                height: '35px',
                                contents: { default: '<hr/><span style="color: #444;text-align:right">{{page}}</span>' },
                                last: 'Last Page'
                            },
                            header: {
                                "height": "35px",
                            },
                        };

                        pdf.create(html, options).toStream(function(err, stream) {
                            stream.pipe(res);
                        });
                    }

                }

            } else {
                var html = table;
                var options = {
                    format: 'A4',
                    footer: {
                        height: '35px',
                        contents: { default: '<hr/><span style="color: #444;text-align:right">{{page}}</span>' },
                        last: 'Last Page'
                    },
                    header: {
                        "height": "35px",
                    },
                };

                pdf.create(html, options).toStream(function(err, stream) {
                    stream.pipe(res);
                });
            }
        })
    });
})

router.get('/ExportDriverReportNew', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
            caption: 'Group Name',
            type: 'string'
        }, {
            caption: 'Assest Name',
            type: 'string'
        },
        {
            caption: 'StartTime',
            type: 'string'
        },
        {
            caption: 'End Time',
            type: 'string'
        },
        {
            caption: 'Driving Time',
            type: 'string'
        },
        {
            caption: '60-90 Speed (km/h)',
            type: 'string'
        }, {
            caption: '90-130 Speed (km/h)',
            type: 'string'
        }, {
            caption: 'Over 130 Speed (km/h)',
            type: 'string'
        }, {
            caption: 'Max Speed',
            type: 'number'
        },
        {
            caption: 'Avearge Speed',
            type: 'number'
        },
        {
            caption: 'Over Speeding Frequency',
            type: 'number'
        },
        {
            caption: 'Mileage',
            type: 'string'
        },
        {
            caption: 'Start Longitude',
            type: 'string'
        },
        {
            caption: 'Start Latitude',
            type: 'string'
        },
        {
            caption: 'End Longitude',
            type: 'string'
        },
        {
            caption: 'End Latitude',
            type: 'string'
        },
    ];
    var objParam = req.query;
    var wherecondition1 = "";
    var WhereCondition = "";
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " Where gps.DeviceId in (" + objParam.DeviceId + ")";
        wherecondition1 += " Where ta.deviceid in (" + objParam.DeviceId + ")";

    }
    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";
        wherecondition1 += " And ta.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";


    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
        wherecondition1 += " And ta.Date >='" + unixStartdate + "'";

    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date <='" + unixEndDate + "'";
        wherecondition1 += " And ta.Date <='" + unixEndDate + "'";


    }


    wherecondition1 += " And ta.AlarmCode = '11'";
var query = "select " +
        " gps.Date,gps.Speed,gps.Longitude,gps.Latitude,gps.Direction,gps.GPSPositioning,gps.DeviceId,gps.IsPatchEngine as IsEngine,Bike.*,tvg.GroupName,tvgs.GroupName as ShareGroupName  " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    var query1 = "select ta.Datetime, ta.Date, ta.deviceid from tblalarm as ta left join tblvehicle As Bike on ta.deviceid = Bike.deviceid " + wherecondition1 + ";"

    connection.query(query, function(err, response, fields) {
        conf.rows = [];
        connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {
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
                var D = 0;
                var Array = [];
                var TotalDrivingtime = 0;
                for (var i = 0; i < lstGroup.length; i++) {

                    var IsDriving = 0;
                    var DrivingStartPosition = 0;
                    var TotalDrivingtime = 0;

                    var Speed6090 = 0;
                    var Speed90130 = 0;
                    var Over130 = 0;
                    var LocateNumber = 0;
                    var objSpeed = [];
                    var TotalRecord = 0;
                    var Mileage = 0.00;
                    var Totalsum = 0;
                    if (lstGroup[i].data.length > 0) {
                        var StartMilage = 0;
                        var Milageco = 0;
                        var Engineco = 0;
                        var id = 0;
                        for (var k = 0; k < lstGroup[i].data.length; k++) {
                            lstGroup[i].data[k].Date = new Date(lstGroup[i].data[k].Date * 1000);

                            if (lstGroup[i].data[k].IsEngine == true) {
                                if (lstGroup[i].data[k].Speed > 1 && lstGroup[i].data[k].GPSPositioning == 'A') {
                                    objSpeed.push(parseFloat(lstGroup[i].data[k].Speed));
                                    if (lstGroup[i].data[k].Speed > 60 && lstGroup[i].data[k].Speed <= 90) {
                                        Speed6090 = Speed6090 + 1;
                                    }
                                    if (lstGroup[i].data[k].Speed > 90 && lstGroup[i].data[k].Speed <= 130) {
                                        Speed90130 = Speed6090 + 1;
                                    }
                                    if (lstGroup[i].data[k].Speed > 130) {
                                        Over130 = Over130 + 1;
                                    }
                                    TotalRecord = TotalRecord + 1;

                                }

                                if (Engineco == 0) {
                                    StartMilage = k;
                                    Engineco = 1;
                                }
                                if ((k != 0) && lstGroup[i].data[k].GPSPositioning == 'A') {

                                    if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                        Milageco = 0;
                                        Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                        StartMilage = k;
                                    } else {

                                        if (Milageco == 0) {
                                            Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                            StartMilage = k;
                                        }
                                        Milageco = 1;
                                    }
                                }
                                if (k == 0) { LocateNumber = 1; } else {
                                    if (lstGroup[i].data[k].Latitude != lstGroup[i].data[k - 1].Latitude && lstGroup[i].data[k].Longitude != lstGroup[i].data[k - 1].Longitude) {
                                        {
                                            LocateNumber = LocateNumber + 1;
                                        }
                                    }
                                }
                                if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (IsDriving == 0) {
                                        DrivingStartPosition = k;
                                        var obj = new Object();
                                        obj.OverSpeed = 0;
                                        obj.StartLatitude = lstGroup[i].data[k].Latitude;
                                        obj.StartLongitude = lstGroup[i].data[k].Longitude;
                                        obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                        obj.StartSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                        obj.Name = lstGroup[i].data[k].Name;
                                        obj.StartAddress = "No Address Found";
                                        obj.EndAddress = "No Address Found";
                                        obj.DrivingStartTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                                        obj.DrivingStartTime1 = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a')
                                    }
                                    IsDriving = 1;
                                }
                            } else {
                                Engineco = 0;
                                if (IsDriving == 1) {
                                    IsDriving = 0;
                                    obj.EndLatitude = lstGroup[i].data[k].Latitude;
                                    obj.EndLongitude = lstGroup[i].data[k].Longitude;
                                    obj.EndSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                    obj.EndDrivingTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                    obj.EndDrivingTime1 = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a');
                                    obj.Speed6090 = Speed6090;
                                    obj.Speed90130 = Speed90130;
                                    obj.Over130 = Over130;
                                    Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                    obj.Mileage = parseFloat(Mileage).toFixed(2);
                                    var sum = 0;

                                    for (var m = 0; m < objSpeed.length; m++) {
                                        sum += parseFloat(objSpeed[m]);
                                    }
                                    if (sum != 0) {
                                        obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                                        obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                                    } else {
                                        obj.avgSpeed = 0;
                                        obj.MaxSpeed = 0;
                                    }
                                    obj.LocateNumber = LocateNumber;
                                    obj.DrivingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date)));
                                    TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                                    if (obj.DrivingTime != "0 sec") {
                                        obj.GroupName = "UnGroup";
                                        if (req.query.idUser == lstGroup[i].data[k].iduser) {
                                            if (lstGroup[i].data[k].GroupName != null && lstGroup[i].data[k].GroupName != undefined && lstGroup[i].data[k].GroupName != '') {
                                                obj.GroupName = lstGroup[i].data[k].GroupName;
                                            }
                                        } else {
                                            if (lstGroup[i].data[k].ShareGroupName != null && lstGroup[i].data[k].ShareGroupName != undefined && lstGroup[i].data[k].ShareGroupName != '') {
                                                obj.GroupName = lstGroup[i].data[k].ShareGroupName;
                                            }
                                        }
                                        Array.push(obj);
                                    }
                                    StartVehical = 0;
                                    Speed6090 = 0;
                                    Speed90130 = 0;
                                    Over130 = 0;
                                    LocateNumber = 0;
                                    objSpeed = [];
                                    TotalRecord = 0;
                                    Mileage = 0.00;
                                }
                            }
                        }
                        if (IsDriving == 1) {
                            IsDriving = 0;
                            var lastposition = lstGroup[i].data.length - 1;
                            obj.EndLatitude = lstGroup[i].data[lastposition].Latitude;
                            obj.EndLongitude = lstGroup[i].data[lastposition].Longitude;
                            obj.EndSpeed = parseFloat(lstGroup[i].data[lastposition].Speed).toFixed(2);
                            obj.EndDrivingTime = momentz.utc(lstGroup[i].data[lastposition].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                            obj.EndDrivingTime1 = momentz.utc(lstGroup[i].data[lastposition].Date).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a');

                            obj.Speed6090 = Speed6090;
                            obj.Speed90130 = Speed90130;
                            obj.Over130 = Over130;
                            obj.Mileage = parseFloat(Mileage).toFixed(2);
                            var sum = 0;
                            for (var m = 0; m < objSpeed.length; m++) {
                                sum += parseFloat(objSpeed[m]);
                            }
                            if (sum != 0) {
                                obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                                obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                            } else {
                                obj.avgSpeed = 0;
                                obj.MaxSpeed = 0;
                            }
                            obj.LocateNumber = LocateNumber;
                            obj.DrivingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[lastposition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date)));
                            TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[lastposition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                            if (obj.DrivingTime != "0 sec") {
                                obj.GroupName = "UnGroup";
                                if (req.query.idUser == lstGroup[i].data[lastposition].iduser) {
                                    if (lstGroup[i].data[lastposition].GroupName != null && lstGroup[i].data[lastposition].GroupName != undefined && lstGroup[i].data[lastposition].GroupName != '') {
                                        obj.GroupName = lstGroup[i].data[lastposition].GroupName;
                                    }
                                } else {
                                    if (lstGroup[i].data[lastposition].ShareGroupName != null && lstGroup[i].data[lastposition].ShareGroupName != undefined && lstGroup[i].data[lastposition].ShareGroupName != '') {
                                        obj.GroupName = lstGroup[i].data[lastposition].ShareGroupName;
                                    }
                                }
                                Array.push(obj);
                            }
                        }
                    }
                }
                TotalDrivingtime = calhrminsecfromsec(TotalDrivingtime);
                if (alarmresponse.length > 0) {
                    for (var i = 0; i <= Array.length; i++) {
                        if (i < Array.length) {
                            for (var h = 0; h < alarmresponse.length; h++) {
                                var alarmDate = momentz.utc(new Date(alarmresponse[h].Date * 1000)).tz(req.query.TimeZone).format('MM-DD-YYYY hh:mm:ss a');
                                if (alarmresponse[h].deviceid == Array[i].DeviceId) {
                                    if (new Date(alarmDate) >= new Date(Array[i].DrivingStartTime1) && new Date(alarmDate) <= new Date(Array[i].EndDrivingTime1)) {
                                        Array[i].OverSpeed = Array[i].OverSpeed + 1;
                                    }
                                }
                            }
                        } else {
                            if (Array.length > 0) {
                                var data = u.sortBy(Array, function(num) { return new Date(num.DrivingStartTime1) });
                                Array = data;
                            }
                            GetDrivingData(0);
                        }
                    }
                } else {
                    if (Array.length > 0) {
                        var data = u.sortBy(Array, function(num) { return new Date(num.DrivingStartTime1) });
                        Array = data;
                    }
                    GetDrivingData(0);
                }

                function GetDrivingData(i) {
                    var GroupName = '';
                    var Name = '';
                    var DrivingStartTime = '';
                    var EndDrivingTime = '';
                    var DrivingTime = '';
                    var LocateNumber = '';
                    var Speed6090 = '';
                    var Speed90130 = '';
                    var Over130 = '';
                    var MaxSpeed = 0.0;
                    var avgSpeed = 0.0;
                    var OverSpeed = 0.0;
                    var StartSpeed = '';
                    var EndSpeed = '';
                    var StartLongitude = '';
                    var StartLatitude = '';
                    var EndLongitude = '';
                    var EndLatitude = '';
                    var row = [];
                    if (i < Array.length) {
                        if (Array[i].GroupName != null && Array[i].GroupName != '' && Array[i].GroupName != undefined) {
                            GroupName = Array[i].GroupName;
                        }
                        if (Array[i].Name != null && Array[i].Name != '' && Array[i].Name != undefined) {
                            Name = Array[i].Name;
                        }
                        if (Array[i].DrivingStartTime != null && Array[i].DrivingStartTime != '' && Array[i].DrivingStartTime != undefined) {
                            DrivingStartTime = Array[i].DrivingStartTime.toString();
                        }
                        if (Array[i].EndDrivingTime != null && Array[i].EndDrivingTime != '' && Array[i].EndDrivingTime != undefined) {
                            EndDrivingTime = Array[i].EndDrivingTime.toString();
                        }
                        if (Array[i].DrivingTime != null && Array[i].DrivingTime != '' && Array[i].DrivingTime != undefined) {
                            DrivingTime = Array[i].DrivingTime.toString();
                        }

                        if (Array[i].LocateNumber != null && Array[i].LocateNumber != '' && Array[i].LocateNumber != undefined) {
                            LocateNumber = Array[i].LocateNumber.toString();
                        }
                        if (Array[i].Speed6090 != null && Array[i].Speed6090 != undefined) {
                            Speed6090 = Array[i].Speed6090.toString();
                        }
                        if (Array[i].Speed90130 != null && Array[i].Speed90130 != undefined) {
                            Speed90130 = Array[i].Speed90130.toString();
                        }
                        if (Array[i].Over130 != null && Array[i].Over130 != undefined) {
                            Over130 = Array[i].Over130.toString();
                        }
                        if (Array[i].MaxSpeed != null && Array[i].MaxSpeed != '' && Array[i].MaxSpeed != undefined) {
                            MaxSpeed = Array[i].MaxSpeed.toString();
                        }
                        if (Array[i].avgSpeed != null && Array[i].avgSpeed != '' && Array[i].avgSpeed != undefined) {
                            avgSpeed = Array[i].avgSpeed.toString();
                        }

                        if (Array[i].OverSpeed != null && Array[i].OverSpeed != '' && Array[i].OverSpeed != undefined) {
                            OverSpeed = Array[i].OverSpeed.toString();
                        }
                        if (Array[i].Mileage != null && Array[i].Mileage != '' && Array[i].Mileage != undefined) {
                            StartSpeed = Array[i].Mileage.toString();
                        }
                        if (Array[i].StartLongitude != null && Array[i].StartLongitude != '' && Array[i].StartLongitude != undefined) {
                            StartLongitude = Array[i].StartLongitude.toString();
                        }
                        if (Array[i].StartLatitude != null && Array[i].StartLatitude != '' && Array[i].StartLatitude != undefined) {
                            StartLatitude = Array[i].StartLatitude.toString();
                        }
                        if (Array[i].EndLongitude != null && Array[i].EndLongitude != '' && Array[i].EndLongitude != undefined) {
                            EndLongitude = Array[i].EndLongitude.toString();
                        }
                        if (Array[i].EndLatitude != null && Array[i].EndLatitude != '' && Array[i].EndLatitude != undefined) {
                            EndLatitude = Array[i].EndLatitude.toString();
                        }
                        row.push(GroupName, Name, DrivingStartTime, EndDrivingTime, DrivingTime, /* LocateNumber,*/ Speed6090, Speed90130, Over130, MaxSpeed, avgSpeed, OverSpeed, StartSpeed, StartLongitude, StartLatitude, EndLongitude, EndLatitude);
                        conf.rows.push(row);
                        GetDrivingData(i + 1);
                    } else {
                        row.push('Total :', '', '', '', TotalDrivingtime, '', '', /* LocateNumber,*/ '', '', '', '', '', '', '', '', '', '', '');
                        conf.rows.push(row);
                        var result = nodeExcel.execute(conf);
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader("Content-Disposition", "attachment; filename=DrivingReport.xlsx");
                        res.end(result, 'binary');
                    }

                }

            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=DrivingReport.xlsx");
                res.end(result, 'binary');
            }
        })
    });
})


//--------------------------Driving Report End-------------------------------------------//

//--------------------------------Working Houre Report---------------------------------------//
router.get('/GetAllWoringHourForReportNew', function(req, res) {
    var objParam = req.query;
    var WhereCondition = " ";
    var wherecondition1 = "";
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " Where gps.DeviceId in (" + objParam.DeviceId + ")";
        wherecondition1 = ' and tblalarm.deviceid in (' + req.query.DeviceId + ')';
    }
    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";
    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date <='" + unixEndDate + "'";

    }

    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsPatchEngine as IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid,Bike.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    connection.query(query, function(err, response, fields) {
        if (!err) {
            var query1 = "select tblalarm.*,tblvehicle.deviceid from tblalarm left join tblvehicle on tblalarm.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + "  and tblalarm.Date >= '" + unixStartdate + "' and tblalarm.Date <= '" + unixEndDate + "'" + wherecondition1 + ";"
            connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {

                var GroupByDevice = u.groupBy(response, function(data) { return data.DeviceId; });
                var TotalAllDrivingTime = 0;
                var TotalAllParkingTime = 0;
                var TotalAllTime = 0;
                var lstGroup = u.map(GroupByDevice, function(group, DeviceId) {
                    var IsDriving = 0;
                    var DrivingStartPosition = 0;
                    var TotalDrivingtime = 0;
                    var IsParking = 0;
                    var ParkingStartPosition = 0;
                    var TotalParkingtime = 0;
                    var TotalSpeed = 0;
                    var TotalSpeedRecord = 0;
                    var HighestSpeed = 0;
                    var TotalMileage = 0;
                    var s_id = 0;
                    var e_id = 0;
                    var StartMilage = 0;
                    var Milageco = 0;
                    var Engineco = 0;
                    var OverSpeed = 0;
                    var GroupName = "UnGroup";
                    for (var i = 0; i < group.length; i++) {

                        group[i].Date = new Date(group[i].Date * 1000);
                        if (req.query.idUser == group[i].iduser) {
                            if (group[i].GroupName != null && group[i].GroupName != undefined && group[i].GroupName != '') {
                                GroupName = group[i].GroupName;
                            }
                        } else {
                            if (group[i].ShareGroupName != null && group[i].ShareGroupName != undefined && group[i].ShareGroupName != '') {
                                GroupName = group[i].ShareGroupName;
                            }
                        }
                        if (group[i].IsEngine == true) {

                            if (Engineco == 0) {
                                StartMilage = i;
                                Engineco = 1;
                            }
                            if ((i != 0) && group[i].GPSPositioning == 'A') {
                                if (parseFloat(group[i].Speed) > 1) {
                                    Milageco = 0;
                                    TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                                    StartMilage = i;
                                } else {

                                    if (Milageco == 0) {
                                        TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                                        StartMilage = i;
                                    }
                                    Milageco = 1;
                                }
                            }
                            if (group[i].GPSPositioning == "A" && group[i].Speed > 1) {
                                if (HighestSpeed < parseFloat(group[i].Speed)) {
                                    HighestSpeed = parseFloat(group[i].Speed);
                                }
                                TotalSpeed = TotalSpeed + parseFloat(group[i].Speed);
                                TotalSpeedRecord = TotalSpeedRecord + 1;
                            }
                            if (IsParking == 1) {
                                IsParking = 0;
                                TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[ParkingStartPosition].Date));
                            }
                            if (parseFloat(group[i].Speed) > 1) {
                                if (IsDriving == 0) {
                                    DrivingStartPosition = i;
                                }
                                IsDriving = 1;
                            }
                        } else {
                            Engineco = 0;
                            if (IsDriving == 1) {
                                IsDriving = 0;
                                s_id = group[DrivingStartPosition].Id;
                                TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[DrivingStartPosition].Date));
                                TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                            }

                            if (IsParking == 0) {
                                ParkingStartPosition = i;
                            }
                            IsParking = 1;
                        }
                    }

                    if (IsParking == 1) {
                        IsParking = 0;
                        TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(group[group.length - 1].Date), moment(group[ParkingStartPosition].Date));
                    }

                    if (IsDriving == 1) {
                        IsDriving = 0;
                        TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[group.length - 1].Date), moment(group[DrivingStartPosition].Date));
                    }
                    if (TotalSpeedRecord == 0) {
                        TotalSpeedRecord = 1;
                    }

                    var TotalDrivingTimeDisplay = calhrminsecfromsec(TotalDrivingtime);
                    var TotalParkingTimeDisplay = calhrminsecfromsec(TotalParkingtime);
                    var TotalTiming = TotalDrivingtime + TotalParkingtime;
                    var TotalTimingDisplay = calhrminsecfromsec(TotalTiming);
                    var AverageSpeed = (TotalSpeed / TotalSpeedRecord).toFixed(2);
                    if (alarmresponse.length > 0) {
                        for (var h = 0; h < alarmresponse.length; h++) {
                            if (alarmresponse[h].deviceid == DeviceId) {
                                if (alarmresponse[h].AlarmCode == '11') {
                                    OverSpeed = OverSpeed + 1;
                                }
                            }
                        }
                    }

                    TotalAllDrivingTime = TotalAllDrivingTime + TotalDrivingtime;
                    TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;
                    TotalAllTime = TotalAllTime + TotalTiming;
                    return {
                        GroupName: GroupName,
                        Name: group[0].Name,
                        DeviceId: DeviceId,
                        DrivingTime: TotalDrivingTimeDisplay,
                        Parkingtime: TotalParkingTimeDisplay,
                        AverageSpeed: AverageSpeed + " km/h",
                        HighestSpeed: HighestSpeed.toFixed(2) + " km/h",
                        TotalMileage: TotalMileage.toFixed(2) + " km",
                        OverSpeed: OverSpeed,
                        TotalTiming: TotalTimingDisplay,
                    }
                });
                TotalAllDrivingTime = calhrminsecfromsec(TotalAllDrivingTime);
                TotalAllParkingTime = calhrminsecfromsec(TotalAllParkingTime);
                TotalAllTime = calhrminsecfromsec(TotalAllTime);
                var obj = new Object();
                obj.Array = lstGroup;
                obj.TotalAllDrivingTime = TotalAllDrivingTime;
                obj.TotalAllParkingTime = TotalAllParkingTime;
                obj.TotalAllTime = TotalAllTime;
                res.json(obj)
            })
        } else {
            res.json([])
        }
    });
})


router.get('/ExportAllWoringHourForReportNew', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
            caption: 'Group Name',
            type: 'string'
        }, {
            caption: 'Assest Name',
            type: 'string'
        }, {
            caption: 'Driving Time',
            type: 'string'
        }, {
            caption: 'Parking Time',
            type: 'string'
        }, {
            caption: 'Total Time',
            type: 'string'
        },
        {
            caption: 'Total Mileage',
            type: 'string'
        },
        {
            caption: 'Average Speed',
            type: 'number'
        },
        {
            caption: 'Highest Speed',
            type: 'number'
        }, {
            caption: 'Over Speeding Frequency',
            type: 'number'
        },
    ];


    var objParam = req.query;

    var WhereCondition = " ";
    var wherecondition1 = "";
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " Where gps.DeviceId in (" + objParam.DeviceId + ")";
        wherecondition1 = ' and tblalarm.deviceid in (' + req.query.DeviceId + ')';
    }
    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";

    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date <='" + unixEndDate + "'";

    }


    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsPatchEngine as IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid,Bike.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    connection.query(query, function(err, response, fields) {
        var query1 = "select tblalarm.*,tblvehicle.deviceid from tblalarm left join tblvehicle on tblalarm.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + "  and tblalarm.Date >= '" + unixStartdate + "' and tblalarm.Date <= '" + unixEndDate + "'" + wherecondition1 + ";"
        connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {
            var DeviceId = null;
            var response1 = [];


            var DeviceId = null;
            var GroupByDevice = u.groupBy(response, function(data) { return data.DeviceId; });
            var TotalAllDrivingTime = 0;
            var TotalAllParkingTime = 0;
            var TotalAllTime = 0;

            var lstGroup = u.map(GroupByDevice, function(group, DeviceId) {
                var IsDriving = 0;
                var DrivingStartPosition = 0;
                var TotalDrivingtime = 0;
                var IsParking = 0;
                var ParkingStartPosition = 0;
                var TotalParkingtime = 0;
                var TotalSpeed = 0;
                var TotalSpeedRecord = 0;
                var HighestSpeed = 0;
                var TotalMileage = 0;
                var StartMilage = 0;
                var Milageco = 0;
                var Engineco = 0;
                var OverSpeed = 0;
                var GroupName = "UnGroup";

                for (var i = 0; i < group.length; i++) {

                    group[i].Date = new Date(group[i].Date * 1000);
                    if (req.query.idUser == group[i].iduser) {
                        if (group[i].GroupName != null && group[i].GroupName != undefined && group[i].GroupName != '') {
                            GroupName = group[i].GroupName;
                        }
                    } else {
                        if (group[i].ShareGroupName != null && group[i].ShareGroupName != undefined && group[i].ShareGroupName != '') {
                            GroupName = group[i].ShareGroupName;
                        }
                    }
                    if (group[i].IsEngine == true) {

                        if (Engineco == 0) {
                            StartMilage = i;
                            Engineco = 1;
                        }
                        if ((i != 0) && group[i].GPSPositioning == 'A') {
                            if (parseFloat(group[i].Speed) > 1) {
                                Milageco = 0;
                                TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                                StartMilage = i;
                            } else {

                                if (Milageco == 0) {
                                    TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                                    StartMilage = i;
                                }
                                Milageco = 1;
                            }
                        }


                        if (group[i].GPSPositioning == "A" && group[i].Speed > 1) {
                            if (HighestSpeed < parseFloat(group[i].Speed)) {
                                HighestSpeed = parseFloat(group[i].Speed);
                            }
                            TotalSpeed = TotalSpeed + parseFloat(group[i].Speed);
                            TotalSpeedRecord = TotalSpeedRecord + 1;
                        }

                        if (IsParking == 1) {
                            IsParking = 0;
                            TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[ParkingStartPosition].Date));
                        }
                        if (parseFloat(group[i].Speed) > 1) {
                            if (IsDriving == 0) {
                                DrivingStartPosition = i;
                            }
                            IsDriving = 1;
                        }

                    } else {
                        Engineco = 0;
                        if (IsDriving == 1) {
                            IsDriving = 0;
                            TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[DrivingStartPosition].Date));
                            TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                        }

                        if (IsParking == 0) {
                            ParkingStartPosition = i;
                        }
                        IsParking = 1;
                    }
                }

                if (IsParking == 1) {
                    IsParking = 0;
                    TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(group[group.length - 1].Date), moment(group[ParkingStartPosition].Date));
                }

                if (IsDriving == 1) {
                    IsDriving = 0;
                    TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[group.length - 1].Date), moment(group[DrivingStartPosition].Date));
                }
                if (TotalSpeedRecord == 0) {
                    TotalSpeedRecord = 1;
                }

                var TotalDrivingTimeDisplay = calhrminsecfromsec(TotalDrivingtime);
                var TotalParkingTimeDisplay = calhrminsecfromsec(TotalParkingtime);
                var TotalTiming = TotalDrivingtime + TotalParkingtime;
                var TotalTimingDisplay = calhrminsecfromsec(TotalTiming);
                var AverageSpeed = (TotalSpeed / TotalSpeedRecord).toFixed(2);
                if (alarmresponse.length > 0) {
                    for (var h = 0; h < alarmresponse.length; h++) {
                        if (alarmresponse[h].deviceid == DeviceId) {
                            if (alarmresponse[h].AlarmCode == '11') {
                                OverSpeed = OverSpeed + 1;
                            }
                        }
                    }
                }
                TotalAllDrivingTime = TotalAllDrivingTime + TotalDrivingtime;
                TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;
                TotalAllTime = TotalAllTime + TotalTiming;
                return {
                    GroupName: GroupName,
                    Name: group[0].Name,
                    DeviceId: DeviceId,
                    DrivingTime: TotalDrivingTimeDisplay,
                    Parkingtime: TotalParkingTimeDisplay,
                    AverageSpeed: AverageSpeed + " km/h",
                    HighestSpeed: HighestSpeed.toFixed(2) + " km/h",
                    TotalMileage: TotalMileage.toFixed(2) + " km",
                    OverSpeed: OverSpeed,
                    TotalTiming: TotalTimingDisplay,
                }
            });

            response1 = lstGroup;

            conf.rows = [];

            response1 = u.sortBy(response1, function(num) { return num.Name })

            for (var i = 0; i < response1.length; i++) {
                var row = [];
                row.push(response1[i].GroupName, response1[i].Name, response1[i].DrivingTime, response1[i].Parkingtime, response1[i].TotalTiming, response1[i].TotalMileage, response1[i].AverageSpeed, response1[i].HighestSpeed, response1[i].OverSpeed);
                conf.rows.push(row);

            }

            var row = [];
            // console.log(TotalAllDrivingTime, " - ", TotalAllParkingTime, " - ", TotalAllTime);
            TotalAllDrivingTime = calhrminsecfromsec(TotalAllDrivingTime)
            TotalAllParkingTime = calhrminsecfromsec(TotalAllParkingTime)
            TotalAllTime = calhrminsecfromsec(TotalAllTime)
            row.push('Total:', '', TotalAllDrivingTime, TotalAllParkingTime, TotalAllTime, '', '', '', '');
            conf.rows.push(row);
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=WorkingHourReport.xlsx");
            res.end(result, 'binary');

        })
    });
})

router.get('/PrintAllWoringHourForReportNew', function(req, res) {

    var objParam = req.query;

    var WhereCondition = " ";
    var wherecondition1 = "";
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " Where gps.DeviceId in (" + objParam.DeviceId + ")";
        wherecondition1 = ' and tblalarm.deviceid in (' + req.query.DeviceId + ')';
    }
    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";

    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date <='" + unixEndDate + "'";

    }


    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsPatchEngine as IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid,Bike.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    connection.query(query, function(err, response, fields) {
        var query1 = "select tblalarm.*,tblvehicle.deviceid from tblalarm left join tblvehicle on tblalarm.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + "  and tblalarm.Date >= '" + unixStartdate + "' and tblalarm.Date <= '" + unixEndDate + "'" + wherecondition1 + ";"
        connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {
            var DeviceId = null;
            var response1 = [];


            var DeviceId = null;
            var GroupByDevice = u.groupBy(response, function(data) { return data.DeviceId; });
            var TotalAllDrivingTime = 0;
            var TotalAllParkingTime = 0;
            var TotalAllTime = 0;

            var lstGroup = u.map(GroupByDevice, function(group, DeviceId) {
                var IsDriving = 0;
                var DrivingStartPosition = 0;
                var TotalDrivingtime = 0;
                var IsParking = 0;
                var ParkingStartPosition = 0;
                var TotalParkingtime = 0;
                var TotalSpeed = 0;
                var TotalSpeedRecord = 0;
                var HighestSpeed = 0;
                var TotalMileage = 0;
                var StartMilage = 0;
                var Milageco = 0;
                var Engineco = 0;
                var OverSpeed = 0;
                var GroupName = "UnGroup";
                for (var i = 0; i < group.length; i++) {

                    group[i].Date = new Date(group[i].Date * 1000);
                    if (req.query.idUser == group[i].iduser) {
                        if (group[i].GroupName != null && group[i].GroupName != undefined && group[i].GroupName != '') {
                            GroupName = group[i].GroupName;
                        }
                    } else {
                        if (group[i].ShareGroupName != null && group[i].ShareGroupName != undefined && group[i].ShareGroupName != '') {
                            GroupName = group[i].ShareGroupName;
                        }
                    }
                    if (group[i].IsEngine == true) {

                        if (Engineco == 0) {
                            StartMilage = i;
                            Engineco = 1;
                        }
                        if ((i != 0) && group[i].GPSPositioning == 'A') {
                            if (parseFloat(group[i].Speed) > 1) {
                                Milageco = 0;
                                TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                                StartMilage = i;
                            } else {

                                if (Milageco == 0) {
                                    TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                                    StartMilage = i;
                                }
                                Milageco = 1;
                            }
                        }


                        if (group[i].GPSPositioning == "A" && group[i].Speed > 1) {
                            if (HighestSpeed < parseFloat(group[i].Speed)) {
                                HighestSpeed = parseFloat(group[i].Speed);
                            }
                            TotalSpeed = TotalSpeed + parseFloat(group[i].Speed);
                            TotalSpeedRecord = TotalSpeedRecord + 1;
                        }

                        if (IsParking == 1) {
                            IsParking = 0;
                            TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[ParkingStartPosition].Date));
                        }
                        if (parseFloat(group[i].Speed) > 1) {
                            if (IsDriving == 0) {
                                DrivingStartPosition = i;
                            }
                            IsDriving = 1;
                        }

                    } else {
                        Engineco = 0;
                        if (IsDriving == 1) {
                            IsDriving = 0;
                            TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[DrivingStartPosition].Date));
                            TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                        }

                        if (IsParking == 0) {
                            ParkingStartPosition = i;
                        }
                        IsParking = 1;
                    }
                }

                if (IsParking == 1) {
                    IsParking = 0;
                    TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(group[group.length - 1].Date), moment(group[ParkingStartPosition].Date));
                }

                if (IsDriving == 1) {
                    IsDriving = 0;
                    TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[group.length - 1].Date), moment(group[DrivingStartPosition].Date));
                }
                if (TotalSpeedRecord == 0) {
                    TotalSpeedRecord = 1;
                }

                var TotalDrivingTimeDisplay = calhrminsecfromsec(TotalDrivingtime);
                var TotalParkingTimeDisplay = calhrminsecfromsec(TotalParkingtime);
                var TotalTiming = TotalDrivingtime + TotalParkingtime;
                var TotalTimingDisplay = calhrminsecfromsec(TotalTiming);
                var AverageSpeed = (TotalSpeed / TotalSpeedRecord).toFixed(2);
                if (alarmresponse.length > 0) {
                    for (var h = 0; h < alarmresponse.length; h++) {
                        if (alarmresponse[h].deviceid == DeviceId) {
                            if (alarmresponse[h].AlarmCode == '11') {
                                OverSpeed = OverSpeed + 1;
                            }
                        }
                    }
                }
                TotalAllDrivingTime = TotalAllDrivingTime + TotalDrivingtime;
                TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;
                TotalAllTime = TotalAllTime + TotalTiming;
                return {
                    GroupName: GroupName,
                    Name: group[0].Name,
                    DeviceId: DeviceId,
                    DrivingTime: TotalDrivingTimeDisplay,
                    Parkingtime: TotalParkingTimeDisplay,
                    AverageSpeed: AverageSpeed + " km/h",
                    HighestSpeed: HighestSpeed.toFixed(2) + " km/h",
                    TotalMileage: TotalMileage.toFixed(2) + " km",
                    OverSpeed: OverSpeed,
                    TotalTiming: TotalTimingDisplay,
                }
            });

            response1 = lstGroup;


            response1 = u.sortBy(response1, function(num) { return num.Name })
            var TodayDate = momentz.utc(new Date()).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
            
            var table = '<div style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; padding:0 15px;">' +
                '<div style="padding:15px; border-bottom:1px solid #000;">' +
                '<h1 style="text-transform: uppercase; text-align:center; font-weight: normal;font-size: 14px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Working Hour Report</h1>' +
                '<div style="text-align: right;font-size: 8px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"><strong>' + TodayDate + '</strong></div>' +
                '</div>' +
                '<div>' +
                '<table style="width:100%; margin:0; padding: 0;">' +
                '<thead>' +
                '<tr>' +
                '<th style="padding: 10px 5px;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-bottom: 1px dotted #000; border-right: 1px dotted #000;">No</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Group Name</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Driving Time</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Parking Time</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Total Time</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Total Mileage</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Average Speed(km/h)</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Highest Speed</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Over Speeding Frequency</th></tr>' +
                '</thead><tbody>';

            for (var i = 0; i < response1.length; i++) {
                table += '<tr>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + response1[i].GroupName + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + response1[i].Name + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + response1[i].DrivingTime + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + response1[i].Parkingtime + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + response1[i].TotalTiming + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + response1[i].TotalMileage + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + response1[i].AverageSpeed + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + response1[i].HighestSpeed + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + response1[i].OverSpeed + '</td>' +
                    '</tr>';

            }


            TotalAllDrivingTime = calhrminsecfromsec(TotalAllDrivingTime)
            TotalAllParkingTime = calhrminsecfromsec(TotalAllParkingTime)
            TotalAllTime = calhrminsecfromsec(TotalAllTime)

            table += '</tbody><tfoot style="font-weight: bold;">' +
                ' <tr>' +
                ' <td style="padding: 8px 5px; border-bottom: 1px dotted #000; border-right: 1px dotted #000;" colspan="2">Total:</td>' +
                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TotalAllDrivingTime + '</td>' +
                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TotalAllParkingTime + '</td>' +
                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TotalAllTime + '</td>' +
                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;"></td>' +
                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"></td>' +
                '</tr>' +
                '</tfoot>';
            table += '</table>' +
                ' </div>' +
                '</div>';
            var html = table;
            var options = {
                format: 'A4',
                footer: {
                    height: '35px',
                    contents: { default: '<hr/><span style="color: #444;text-align:right">{{page}}</span>' },
                    last: 'Last Page'
                },
                header: {
                    "height": "35px",
                },
            };

            pdf.create(html, options).toStream(function(err, stream) {
                stream.pipe(res);
            });

        })
    });
})

//-----------------------------------End Working houre Report---------------------------------------//



//---------------------------------Daily Stat. Report Start.------------------------------------//

router.get('/GetAllDailyStatDateNew', function(req, res) {
    wherecondition = '';
    wherecondition1 = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        //wherecondition = ' and tblgpsdata.deviceid=' + req.query.DeviceId;
        wherecondition = ' and gps.deviceid in (' + req.query.DeviceId + ')';
        wherecondition1 = ' and tblalarm.deviceid in (' + req.query.DeviceId + ')';
    }

    var Startdate = req.query.TodayStartDateTime;
    var Enddate = req.query.TodayEndDateTime;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsPatchEngine as IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid ,Bike.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        "Where gps.Date >= '" + unixStartdate + "' and gps.Date <= '" + unixEnddate + "'" +
        wherecondition +
        " order by gps.Date Asc";
    //  var query = "select tblgpsdata.*,tblvehicle.Name,tblvehicle.deviceid from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + "  and tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + ' order by tblgpsdata.Date asc' + ";"
    connection.query(query, function(err, response, fields) {
        var query1 = "select tblalarm.*,tblvehicle.deviceid from tblalarm left join tblvehicle on tblalarm.deviceid = tblvehicle.deviceid Where  tblalarm.Date >= '" + unixStartdate + "' and tblalarm.Date <= '" + unixEnddate + "'" + wherecondition1 + ";"
            // console.log(query1)
        connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {

            if (response.length > 0) {

                var groups = u.groupBy(response, function(value) {
                    if (req.query.TimeZone) {
                        return value.DeviceId + '#' + momentz.utc(value.Date * 1000).tz(req.query.TimeZone).format('DD-MM-YYYY')
                    } else {
                        return value.DeviceId + '#' + momentz.utc(value.Date * 1000).format('DD-MM-YYYY')
                    }
                });

                var lstGroup = u.map(groups, function(group) {
                    return {
                        DeviceId: group[0].DeviceId,
                        Datetime: group[0].Date,
                        data: group,
                    }
                });

                var Array = [];
                var Speed = 0.0;
                var TotalAllDrivingTime = 0;
                var TotalAllParkingTime = 0;
                var TotalAllEngineOnTime = 0;
                var TotalAllTime = 0;
                for (var i = 0; i < lstGroup.length; i++) {
                    var IsParking = 0;
                    var IsDriving = 0;
                    var IsEngineOn = 0;

                    var DrivingStartPosition = 0;
                    var ParkingStartPosition = 0;
                    var EngineOnStartPosition = 0;

                    var TotalDrivingtime = 0;
                    var TotalParkingtime = 0;
                    var TotalEngineOnTime = 0;
                    var s_id = 0;
                    var e_id = 0;
                    if (lstGroup[i].data.length > 0) {
                        var obj = new Object();
                        Speed = 0.0;
                        var SpeedCo = 0;
                        var StartMilage = 0;
                        var Milageco = 0;
                        var Engineco = 0;
                        obj.DeviceId = lstGroup[i].data[0].deviceid;
                        obj.Name = lstGroup[i].data[0].Name;
                        obj.Date = momentz.utc(new Date(lstGroup[i].data[0].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY');
                        obj.Date1 = new Date(lstGroup[i].data[0].Date * 1000)
                        obj.InvalidLocation = 0;
                        obj.Mileage = 0.0;
                        obj.AlarmNumber = 0;
                        obj.HighestSpeed = 0;
                        obj.OverSpeed = 0;
                        if (alarmresponse.length > 0) {
                            for (var h = 0; h < alarmresponse.length; h++) {
                                var alarmDate = momentz.utc(new Date(alarmresponse[h].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY');
                                if (alarmresponse[h].deviceid == obj.DeviceId && alarmDate == obj.Date) {
                                    obj.AlarmNumber = obj.AlarmNumber + 1;
                                    if (alarmresponse[h].AlarmCode == '11') {
                                        obj.OverSpeed = obj.OverSpeed + 1;
                                    }
                                }

                            }
                        }
                        obj.GroupName = "UnGroup";
                        if (req.query.idUser == lstGroup[i].data[0].iduser) {
                            if (lstGroup[i].data[0].GroupName != null && lstGroup[i].data[0].GroupName != undefined && lstGroup[i].data[0].GroupName != '') {
                                obj.GroupName = lstGroup[i].data[0].GroupName;
                            }
                        } else {
                            if (lstGroup[i].data[0].ShareGroupName != null && lstGroup[i].data[0].ShareGroupName != undefined && lstGroup[i].data[0].ShareGroupName != '') {
                                obj.GroupName = lstGroup[i].data[0].ShareGroupName;
                            }
                        }
                        for (var k = 0; k < lstGroup[i].data.length; k++) {


                            lstGroup[i].data[k].Date = new Date(lstGroup[i].data[k].Date * 1000);
                            //------ Count Invalid Location--------//
                            if (lstGroup[i].data[k].GPSPositioning != 'A') {
                                obj.InvalidLocation = obj.InvalidLocation + 1;
                            }
                            //--------Count Locate Number----------//
                            if (k == 0) { obj.LocateNumber = 1; } else {
                                if (lstGroup[i].data[k].Latitude != lstGroup[i].data[k - 1].Latitude && lstGroup[i].data[k].Longitude != lstGroup[i].data[k - 1].Longitude) {
                                    obj.LocateNumber = obj.LocateNumber + 1;
                                }
                            }
                            
                            //-----------Add Speed--------------//
                            if (lstGroup[i].data[k].Speed > 1 && lstGroup[i].data[k].IsEngine == 1 && lstGroup[i].data[k].GPSPositioning == 'A') {
                                Speed = Speed + parseFloat(lstGroup[i].data[k].Speed);
                                SpeedCo = SpeedCo + 1;
                            }

                            if (lstGroup[i].data[k].IsEngine == true) {
                                if (lstGroup[i].data[k].GPSPositioning == "A" && parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (obj.HighestSpeed < parseFloat(lstGroup[i].data[k].Speed)) {
                                        obj.HighestSpeed = 0;
                                        obj.HighestSpeed = parseFloat(lstGroup[i].data[k].Speed);
                                    }
                                }
                                if (Engineco == 0) {
                                    StartMilage = k;
                                    Engineco = 1;
                                }
                                if ((k != 0) && lstGroup[i].data[k].GPSPositioning == 'A') {
                                    if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                        Milageco = 0;
                                        obj.Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                        StartMilage = k;
                                    } else {

                                        if (Milageco == 0) {
                                            obj.Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                            StartMilage = k;
                                        }
                                        Milageco = 1;
                                    }
                                }
                                if (IsEngineOn == 0) {
                                    EngineOnStartPosition = k;
                                }
                                IsEngineOn = 1;

                                if (IsParking == 1) {
                                    IsParking = 0;
                                    TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[ParkingStartPosition].Date));
                                }
                                
                                if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (IsDriving == 0) {
                                        DrivingStartPosition = k;
                                    }
                                    IsDriving = 1;
                                }
                                
                            } else {
                                Engineco = 0;
                                if (IsEngineOn == 1) {
                                    IsEngineOn = 0;
                                    TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[EngineOnStartPosition].Date));
                                }

                                if (IsDriving == 1) {

                                    obj.Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                    IsDriving = 0;
                                    TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                                }

                                if (IsParking == 0) {

                                    ParkingStartPosition = k;
                                }
                                IsParking = 1;
                            }

                        }
                        var LastPosition = lstGroup[i].data.length - 1;
                        if (IsParking == 1) {
                            IsParking = 0;
                            TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[ParkingStartPosition].Date));
                        }
                        if (IsDriving == 1) {
                            IsDriving = 0;
                            TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                        }
                        if (IsEngineOn == 1) {
                            IsEngineOn = 0;
                            // console.log(lstGroup[i].data[EngineOnStartPosition], Id, "--", lstGroup[i].data[LastPosition].Id);
                            // console.log(momentz.utc(lstGroup[i].data[EngineOnStartPosition].Date).tz(req.query.TimeZone).format('DD-MM-YYYY'), "--", momentz.utc(lstGroup[i].data[LastPosition].Date).tz(req.query.TimeZone).format('DD-MM-YYYY'));
                            TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[EngineOnStartPosition].Date));
                        }
                        //-----------------Average Speed-----------------/
                        if (SpeedCo > 0) {
                            obj.AverageSpeed = Speed / SpeedCo;
                        } else {
                            obj.AverageSpeed = 0
                        }

                        obj.DrivingTime = calhrminsecfromsec(TotalDrivingtime);
                        obj.ParkingTime = calhrminsecfromsec(TotalParkingtime);
                        obj.EnginOnTime = calhrminsecfromsec(TotalEngineOnTime);
                        var TotalTime = TotalDrivingtime + TotalParkingtime;
                        obj.TotalTime = calhrminsecfromsec(TotalTime);
                        Array.push(obj);

                        TotalAllDrivingTime = TotalAllDrivingTime + TotalDrivingtime;
                        TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;
                        TotalAllEngineOnTime = TotalAllEngineOnTime + TotalEngineOnTime;
                        TotalAllTime = TotalAllTime + TotalTime;
                    }
                }
                TotalAllDrivingTime = calhrminsecfromsec(TotalAllDrivingTime);
                TotalAllParkingTime = calhrminsecfromsec(TotalAllParkingTime);
                TotalAllEngineOnTime = calhrminsecfromsec(TotalAllEngineOnTime);
                TotalAllTime = calhrminsecfromsec(TotalAllTime);
                var obj = new Object();
                obj.Array = Array;
                obj.TotalAllDrivingTime = TotalAllDrivingTime;
                obj.TotalAllParkingTime = TotalAllParkingTime;
                obj.TotalAllEngineOnTime = TotalAllEngineOnTime;
                obj.TotalAllTime = TotalAllTime;

                res.json(obj);
            } else {
                res.json(RecordNotFound);
            }
        })
    });
});

router.get('/ExportDailyStatReportNew', function(req, res) {

    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
            caption: 'GroupName Name',
            type: 'string'
        }, {
            caption: 'Asset Name',
            type: 'string'
        }, {
            caption: 'Date',
            type: 'string'
        }, {
            caption: 'Driving Time',
            type: 'string'
        }, {
            caption: 'Parking Time',
            type: 'string'
        },
        {
            caption: 'Total Time',
            type: 'string'
        },
        {
            caption: 'Mileage(km)',
            type: 'number'
        }, {
            caption: 'Average Speed(km/h)',
            type: 'number'
        },
        {
            caption: 'Max Speed(km/h)',
            type: 'number'
        },
        {
            caption: 'Over Speeding Frequency',
            type: 'number'
        }, {
            caption: 'Notification Count',
            type: 'number'
        }, {
            caption: 'Engine On Time',
            type: 'String'
        },

    ];
    wherecondition = '';
    wherecondition1 = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        wherecondition = ' and gps.deviceid in (' + req.query.DeviceId + ')';
        wherecondition1 = ' and tblalarm.deviceid in (' + req.query.DeviceId + ')';
    }


    var Startdate = req.query.StartDate;
    var Enddate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsPatchEngine as IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid ,Bike.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        "Where gps.Date >= '" + unixStartdate + "' and gps.Date <= '" + unixEnddate + "'" +
        wherecondition +
        " order by gps.Date Asc";
    connection.query(query, function(err, response, fields) {
        var query1 = "select tblalarm.*,tblvehicle.deviceid from tblalarm left join tblvehicle on tblalarm.deviceid = tblvehicle.deviceid Where  tblalarm.Date >= '" + unixStartdate + "' and tblalarm.Date <= '" + unixEnddate + "'" + wherecondition1 + ";"
        connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {
            var Array = [];
            if (response.length > 0) {

                var groups = u.groupBy(response, function(value) {
                    if (req.query.TimeZone) {
                        return value.DeviceId + '#' + momentz.utc(value.Date * 1000).tz(req.query.TimeZone).format('DD-MM-YYYY')
                    } else {
                        return value.DeviceId + '#' + momentz.utc(value.Date * 1000).format('DD-MM-YYYY')
                    }

                });

                var lstGroup = u.map(groups, function(group) {
                    return {
                        DeviceId: group[0].DeviceId,
                        Datetime: group[0].Date,
                        data: group
                    }
                });

                var Array = [];
                var Speed = 0.0;
                var TotalAllDrivingTime = 0;
                var TotalAllParkingTime = 0;
                var TotalAllEngineOnTime = 0;
                var TotalAllTime = 0

                for (var i = 0; i < lstGroup.length; i++) {
                    var IsParking = 0;
                    var IsDriving = 0;
                    var IsEngineOn = 0;

                    var DrivingStartPosition = 0;
                    var ParkingStartPosition = 0;
                    var EngineOnStartPosition = 0;

                    var TotalDrivingtime = 0;
                    var TotalParkingtime = 0;
                    var TotalEngineOnTime = 0;
                    var s_id = 0;
                    var e_id = 0;
                    if (lstGroup[i].data.length > 0) {
                        var obj = new Object();
                        Speed = 0.0;
                        var SpeedCo = 0;
                        var StartMilage = 0;
                        var Milageco = 0;
                        var Engineco = 0;
                        obj.DeviceId = lstGroup[i].data[0].deviceid;
                        obj.Name = lstGroup[i].data[0].Name;
                        obj.Date = momentz.utc(new Date(lstGroup[i].data[0].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY');
                        obj.InvalidLocation = 0;
                        obj.Mileage = 0.0;
                        obj.AlarmNumber = 0;
                        obj.HighestSpeed = 0;
                        obj.OverSpeed = 0

                        if (alarmresponse.length > 0) {
                            for (var h = 0; h < alarmresponse.length; h++) {
                                var alarmDate = momentz.utc(new Date(alarmresponse[h].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY');
                                if (alarmresponse[h].deviceid == obj.DeviceId && alarmDate == obj.Date) {
                                    obj.AlarmNumber = obj.AlarmNumber + 1;
                                    if (alarmresponse[h].AlarmCode == '11' && alarmDate == obj.Date) {
                                        obj.OverSpeed = obj.OverSpeed + 1;
                                    }
                                }

                            }
                        }

                        obj.GroupName = "UnGroup";
                        if (req.query.idUser == lstGroup[i].data[0].iduser) {
                            if (lstGroup[i].data[0].GroupName != null && lstGroup[i].data[0].GroupName != undefined && lstGroup[i].data[0].GroupName != '') {
                                obj.GroupName = lstGroup[i].data[0].GroupName;
                            }
                        } else {
                            if (lstGroup[i].data[0].ShareGroupName != null && lstGroup[i].data[0].ShareGroupName != undefined && lstGroup[i].data[0].ShareGroupName != '') {
                                obj.GroupName = lstGroup[i].data[0].ShareGroupName;
                            }
                        }
                        for (var k = 0; k < lstGroup[i].data.length; k++) {
                            lstGroup[i].data[k].Date = new Date(lstGroup[i].data[k].Date * 1000);
                            //------ Count Invalid Location--------//
                            if (lstGroup[i].data[k].GPSPositioning != 'A') {
                                obj.InvalidLocation = obj.InvalidLocation + 1;
                            }
                            //--------Count Locate Number----------//
                            if (k == 0) { obj.LocateNumber = 1; } else {
                                if (lstGroup[i].data[k].Latitude != lstGroup[i].data[k - 1].Latitude && lstGroup[i].data[k].Longitude != lstGroup[i].data[k - 1].Longitude) {
                                    obj.LocateNumber = obj.LocateNumber + 1;
                                }
                            }
                            //-----------Add Speed--------------//
                            if (lstGroup[i].data[k].Speed > 1 && lstGroup[i].data[k].IsEngine == 1 && lstGroup[i].data[k].GPSPositioning == 'A') {
                                Speed = Speed + parseFloat(lstGroup[i].data[k].Speed);
                                SpeedCo = SpeedCo + 1;
                            }

                            if (lstGroup[i].data[k].IsEngine == true) {
                                if (lstGroup[i].data[k].GPSPositioning == "A" && parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (obj.HighestSpeed < parseFloat(lstGroup[i].data[k].Speed)) {
                                        obj.HighestSpeed = 0;
                                        obj.HighestSpeed = parseFloat(lstGroup[i].data[k].Speed);
                                    }
                                }
                                if (Engineco == 0) {
                                    StartMilage = k;
                                    Engineco = 1;
                                }
                                if ((k != 0) && lstGroup[i].data[k].GPSPositioning == 'A') {
                                    if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                        Milageco = 0;
                                        obj.Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                        StartMilage = k;
                                    } else {

                                        if (Milageco == 0) {
                                            obj.Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                            StartMilage = k;
                                        }
                                        Milageco = 1;
                                    }
                                }
                                if (IsEngineOn == 0) {
                                    EngineOnStartPosition = k;
                                }
                                IsEngineOn = 1;

                                if (IsParking == 1) {
                                    IsParking = 0;
                                    TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[ParkingStartPosition].Date));
                                }
                                if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (IsDriving == 0) {
                                        DrivingStartPosition = k;
                                    }
                                    IsDriving = 1;
                                }
                            } else {
                                Engineco = 0;
                                if (IsEngineOn == 1) {
                                    IsEngineOn = 0;
                                    TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[EngineOnStartPosition].Date));
                                }

                                if (IsDriving == 1) {

                                    obj.Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                    IsDriving = 0;
                                    TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                                }

                                if (IsParking == 0) {

                                    ParkingStartPosition = k;
                                }
                                IsParking = 1;
                            }

                        }
                        var LastPosition = lstGroup[i].data.length - 1;
                        if (IsParking == 1) {
                            IsParking = 0;
                            TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[ParkingStartPosition].Date));
                        }
                        if (IsDriving == 1) {
                            IsDriving = 0;
                            TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                        }
                        if (IsEngineOn == 1) {
                            IsEngineOn = 0;
                            TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[EngineOnStartPosition].Date));
                        }
                        //-----------------Average Speed-----------------/
                        if (SpeedCo > 0) {
                            obj.AverageSpeed = Speed / SpeedCo;
                        } else {
                            obj.AverageSpeed = 0
                        }

                        obj.DrivingTime = calhrminsecfromsec(TotalDrivingtime);
                        obj.ParkingTime = calhrminsecfromsec(TotalParkingtime);
                        obj.EnginOnTime = calhrminsecfromsec(TotalEngineOnTime);
                        var TotalTime = TotalDrivingtime + TotalParkingtime;
                        obj.TotalTime = calhrminsecfromsec(TotalTime);
                        Array.push(obj);
                        TotalAllDrivingTime = TotalAllDrivingTime + TotalDrivingtime;
                        TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;
                        TotalAllEngineOnTime = TotalAllEngineOnTime + TotalEngineOnTime;
                        TotalAllTime = TotalAllTime + TotalTime;
                    }
                }
                TotalAllDrivingTime = calhrminsecfromsec(TotalAllDrivingTime);
                TotalAllParkingTime = calhrminsecfromsec(TotalAllParkingTime);
                TotalAllEngineOnTime = calhrminsecfromsec(TotalAllEngineOnTime);
                TotalAllTime = calhrminsecfromsec(TotalAllTime);
                if (Array.length > 0) {
                    var data = u.sortBy(Array, function(num) { return new Date(num.Date) });
                    Array = data;
                }
                conf.rows = [];
                GetData(0);

                function GetData(i) {
                    var row = [];
                    if (i < Array.length) {

                        var Name = 'N/A';
                        var Date = 'N/A';
                        var DrivingTime = 'N/A';
                        var ParkingTime = 'N/A';
                        var LocateNumber = 0;
                        var InvalidLocation = 0;
                        var Mileage = 0.00;
                        var AverageSpeed = 0.00;
                        var AlarmNumber = 0;
                        var EnginOnTime = 'N/A';
                        var DoorOpenNumber = 0;
                        var DoorOpenTime = 'N/A';
                        var ShockNumber = 0;
                        var ShockTime = 'N/A';
                        var EngineOnNumber = 0;
                        var HighestSpeed = 0;
                        var OverSpeed = 0;
                        var GroupName = "UnGroup";

                        if (Array[i].Date != null && Array[i].Date != '' && Array[i].Date != undefined) {
                            Date = Array[i].Date;
                        }
                        if (Array[i].Name != null && Array[i].Name != '' && Array[i].Name != undefined) {
                            Name = Array[i].Name;
                        }
                        if (Array[i].GroupName != null && Array[i].GroupName != '' && Array[i].GroupName != undefined) {
                            GroupName = Array[i].GroupName;
                        }
                        if (Array[i].DrivingTime != null && Array[i].DrivingTime != '' && Array[i].DrivingTime != undefined) {
                            DrivingTime = Array[i].DrivingTime;
                        }

                        if (Array[i].ParkingTime != null && Array[i].ParkingTime != '' && Array[i].ParkingTime != undefined) {
                            ParkingTime = Array[i].ParkingTime;
                        }

                        if (Array[i].TotalTime != null && Array[i].TotalTime != '' && Array[i].TotalTime != undefined) {
                            TotalTime = Array[i].TotalTime;
                        }

                        if (Array[i].LocateNumber != null && Array[i].LocateNumber != '' && Array[i].LocateNumber != undefined) {
                            LocateNumber = Array[i].LocateNumber;
                        }

                        if (Array[i].InvalidLocation != null && Array[i].InvalidLocation != '' && Array[i].InvalidLocation != undefined) {
                            InvalidLocation = Array[i].InvalidLocation;
                        }

                        if (Array[i].Mileage != null && Array[i].Mileage != '' && Array[i].Mileage != undefined) {
                            Mileage = parseFloat(Array[i].Mileage).toFixed(2);
                        }

                        if (Array[i].AverageSpeed != null && Array[i].AverageSpeed != '' && Array[i].AverageSpeed != undefined) {
                            AverageSpeed = parseFloat(Array[i].AverageSpeed).toFixed(2);
                        }
                        if (Array[i].HighestSpeed != null && Array[i].HighestSpeed != '' && Array[i].HighestSpeed != undefined) {
                            HighestSpeed = parseFloat(Array[i].HighestSpeed).toFixed(2);
                        }
                        if (Array[i].OverSpeed != null && Array[i].OverSpeed != '' && Array[i].OverSpeed != undefined) {
                            OverSpeed = parseFloat(Array[i].OverSpeed).toFixed(2);
                        }
                        if (Array[i].AlarmNumber != null && Array[i].AlarmNumber != '' && Array[i].AlarmNumber != undefined) {
                            AlarmNumber = Array[i].AlarmNumber;
                        }

                        if (Array[i].EnginOnTime != null && Array[i].EnginOnTime != '' && Array[i].EnginOnTime != undefined) {
                            EnginOnTime = Array[i].EnginOnTime;
                        }

                        if (Array[i].DoorOpenNumber != null && Array[i].DoorOpenNumber != '' && Array[i].DoorOpenNumber != undefined) {
                            DoorOpenNumber = Array[i].DoorOpenNumber;
                        }

                        if (Array[i].DoorOpenTime != null && Array[i].DoorOpenTime != '' && Array[i].DoorOpenTime != undefined) {
                            DoorOpenTime = Array[i].DoorOpenTime;
                        }

                        if (Array[i].ShockNumber != null && Array[i].ShockNumber != '' && Array[i].ShockNumber != undefined) {
                            ShockNumber = Array[i].ShockNumber;
                        }

                        if (Array[i].ShockTime != null && Array[i].ShockTime != '' && Array[i].ShockTime != undefined) {
                            ShockTime = Array[i].ShockTime;
                        }

                        if (Array[i].EngineOnNumber != null && Array[i].EngineOnNumber != '' && Array[i].EngineOnNumber != undefined) {
                            EngineOnNumber = Array[i].EngineOnNumber;
                        }


                        row.push(GroupName, Name, Date, DrivingTime, ParkingTime, TotalTime, Mileage, AverageSpeed, HighestSpeed, OverSpeed, AlarmNumber, EnginOnTime /*, DoorOpenNumber, DoorOpenTime, ShockNumber, ShockTime, EngineOnNumber*/ );
                        conf.rows.push(row);
                        GetData(i + 1);

                    } else {
                        row.push('Total:', '', '', TotalAllDrivingTime, TotalAllParkingTime, TotalAllTime, '', '', '', '', '', TotalAllEngineOnTime);
                        conf.rows.push(row);
                        var result = nodeExcel.execute(conf);
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader("Content-Disposition", "attachment; filename=DailyStatReport.xlsx");
                        res.end(result, 'binary');
                    }
                }

            }
        })
    })
})

router.get('/PrintDailyStatReportNew', function(req, res) {


    wherecondition = '';
    wherecondition1 = '';
    if (req.query.DeviceId != 'All' && req.query.DeviceId != '-1' && req.query.DeviceId != null) {
        wherecondition = ' and gps.deviceid in (' + req.query.DeviceId + ')';
        wherecondition1 = ' and tblalarm.deviceid in (' + req.query.DeviceId + ')';
    }


    var Startdate = req.query.StartDate;
    var Enddate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsPatchEngine as IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid ,Bike.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblvehicle  As Bike " +
        " left join tblvehiclegroup tvg on tvg.Id = Bike.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = Bike.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        "Where gps.Date >= '" + unixStartdate + "' and gps.Date <= '" + unixEnddate + "'" +
        wherecondition +
        " order by gps.Date Asc";
    connection.query(query, function(err, response, fields) {
        var query1 = "select tblalarm.*,tblvehicle.deviceid from tblalarm left join tblvehicle on tblalarm.deviceid = tblvehicle.deviceid Where  tblalarm.Date >= '" + unixStartdate + "' and tblalarm.Date <= '" + unixEnddate + "'" + wherecondition1 + ";"
        connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {
            var Array = [];
            if (response.length > 0) {

                var groups = u.groupBy(response, function(value) {
                    if (req.query.TimeZone) {
                        return value.DeviceId + '#' + momentz.utc(value.Date * 1000).tz(req.query.TimeZone).format('DD-MM-YYYY')
                    } else {
                        return value.DeviceId + '#' + momentz.utc(value.Date * 1000).format('DD-MM-YYYY')
                    }

                });

                var lstGroup = u.map(groups, function(group) {
                    return {
                        DeviceId: group[0].DeviceId,
                        Datetime: group[0].Date,
                        data: group
                    }
                });

                var Array = [];
                var Speed = 0.0;
                var TotalAllDrivingTime = 0;
                var TotalAllParkingTime = 0;
                var TotalAllEngineOnTime = 0;
                var TotalAllTime = 0

                for (var i = 0; i < lstGroup.length; i++) {
                    var IsParking = 0;
                    var IsDriving = 0;
                    var IsEngineOn = 0;

                    var DrivingStartPosition = 0;
                    var ParkingStartPosition = 0;
                    var EngineOnStartPosition = 0;

                    var TotalDrivingtime = 0;
                    var TotalParkingtime = 0;
                    var TotalEngineOnTime = 0;
                    var s_id = 0;
                    var e_id = 0;
                    if (lstGroup[i].data.length > 0) {
                        var obj = new Object();
                        Speed = 0.0;
                        var SpeedCo = 0;
                        var StartMilage = 0;
                        var Milageco = 0;
                        var Engineco = 0;
                        obj.DeviceId = lstGroup[i].data[0].deviceid;
                        obj.Name = lstGroup[i].data[0].Name;
                        obj.Date = momentz.utc(new Date(lstGroup[i].data[0].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY');
                        obj.InvalidLocation = 0;
                        obj.Mileage = 0.0;
                        obj.AlarmNumber = 0;
                        obj.HighestSpeed = 0;
                        obj.OverSpeed = 0

                        if (alarmresponse.length > 0) {
                            for (var h = 0; h < alarmresponse.length; h++) {
                                var alarmDate = momentz.utc(new Date(alarmresponse[h].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY');
                                if (alarmresponse[h].deviceid == obj.DeviceId && alarmDate == obj.Date) {
                                    obj.AlarmNumber = obj.AlarmNumber + 1;
                                    if (alarmresponse[h].AlarmCode == '11' && alarmDate == obj.Date) {
                                        obj.OverSpeed = obj.OverSpeed + 1;
                                    }
                                }

                            }
                        }
                        obj.GroupName = "UnGroup";
                        if (req.query.idUser == lstGroup[i].data[0].iduser) {
                            if (lstGroup[i].data[0].GroupName != null && lstGroup[i].data[0].GroupName != undefined && lstGroup[i].data[0].GroupName != '') {
                                obj.GroupName = lstGroup[i].data[0].GroupName;
                            }
                        } else {
                            if (lstGroup[i].data[0].ShareGroupName != null && lstGroup[i].data[0].ShareGroupName != undefined && lstGroup[i].data[0].ShareGroupName != '') {
                                obj.GroupName = lstGroup[i].data[0].ShareGroupName;
                            }
                        }
                        for (var k = 0; k < lstGroup[i].data.length; k++) {
                            lstGroup[i].data[k].Date = new Date(lstGroup[i].data[k].Date * 1000);
                            //------ Count Invalid Location--------//
                            if (lstGroup[i].data[k].GPSPositioning != 'A') {
                                obj.InvalidLocation = obj.InvalidLocation + 1;
                            }
                            //--------Count Locate Number----------//
                            if (k == 0) { obj.LocateNumber = 1; } else {
                                if (lstGroup[i].data[k].Latitude != lstGroup[i].data[k - 1].Latitude && lstGroup[i].data[k].Longitude != lstGroup[i].data[k - 1].Longitude) {
                                    obj.LocateNumber = obj.LocateNumber + 1;
                                }
                            }
                            //-----------Add Speed--------------//
                            if (lstGroup[i].data[k].Speed > 1 && lstGroup[i].data[k].IsEngine == 1 && lstGroup[i].data[k].GPSPositioning == 'A') {
                                Speed = Speed + parseFloat(lstGroup[i].data[k].Speed);
                                SpeedCo = SpeedCo + 1;
                            }

                            if (lstGroup[i].data[k].IsEngine == true) {
                                if (lstGroup[i].data[k].GPSPositioning == "A" && parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (obj.HighestSpeed < parseFloat(lstGroup[i].data[k].Speed)) {
                                        obj.HighestSpeed = 0;
                                        obj.HighestSpeed = parseFloat(lstGroup[i].data[k].Speed);
                                    }
                                }
                                if (Engineco == 0) {
                                    StartMilage = k;
                                    Engineco = 1;
                                }
                                if ((k != 0) && lstGroup[i].data[k].GPSPositioning == 'A') {
                                    if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                        Milageco = 0;
                                        obj.Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                        StartMilage = k;
                                    } else {

                                        if (Milageco == 0) {
                                            obj.Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                            StartMilage = k;
                                        }
                                        Milageco = 1;
                                    }
                                }
                                if (IsEngineOn == 0) {
                                    EngineOnStartPosition = k;
                                }
                                IsEngineOn = 1;

                                if (IsParking == 1) {
                                    IsParking = 0;
                                    TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[ParkingStartPosition].Date));
                                }
                                if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (IsDriving == 0) {
                                        DrivingStartPosition = k;
                                    }
                                    IsDriving = 1;
                                }
                            } else {
                                Engineco = 0;
                                if (IsEngineOn == 1) {
                                    IsEngineOn = 0;
                                    TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[EngineOnStartPosition].Date));
                                }

                                if (IsDriving == 1) {

                                    obj.Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                    IsDriving = 0;
                                    TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                                }

                                if (IsParking == 0) {

                                    ParkingStartPosition = k;
                                }
                                IsParking = 1;
                            }

                        }
                        var LastPosition = lstGroup[i].data.length - 1;
                        if (IsParking == 1) {
                            IsParking = 0;
                            TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[ParkingStartPosition].Date));
                        }
                        if (IsDriving == 1) {
                            IsDriving = 0;
                            TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                        }
                        if (IsEngineOn == 1) {
                            IsEngineOn = 0;
                            TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(lstGroup[i].data[LastPosition].Date), moment(lstGroup[i].data[EngineOnStartPosition].Date));
                        }
                        //-----------------Average Speed-----------------/
                        if (SpeedCo > 0) {
                            obj.AverageSpeed = Speed / SpeedCo;
                        } else {
                            obj.AverageSpeed = 0
                        }

                        obj.DrivingTime = calhrminsecfromsec(TotalDrivingtime);
                        obj.ParkingTime = calhrminsecfromsec(TotalParkingtime);
                        obj.EnginOnTime = calhrminsecfromsec(TotalEngineOnTime);
                        var TotalTime = TotalDrivingtime + TotalParkingtime;
                        obj.TotalTime = calhrminsecfromsec(TotalTime);
                        Array.push(obj);
                        TotalAllDrivingTime = TotalAllDrivingTime + TotalDrivingtime;
                        TotalAllParkingTime = TotalAllParkingTime + TotalParkingtime;
                        TotalAllEngineOnTime = TotalAllEngineOnTime + TotalEngineOnTime;
                        TotalAllTime = TotalAllTime + TotalTime;
                    }
                }
                TotalAllDrivingTime = calhrminsecfromsec(TotalAllDrivingTime);
                TotalAllParkingTime = calhrminsecfromsec(TotalAllParkingTime);
                TotalAllEngineOnTime = calhrminsecfromsec(TotalAllEngineOnTime);
                TotalAllTime = calhrminsecfromsec(TotalAllTime);

                var TodayDate = momentz.utc(new Date()).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');



                var table = '<div style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; padding:0 15px;">' +
                    '<div style="padding:15px; border-bottom:1px solid #000;">' +
                    '<h1 style="text-transform: uppercase; text-align:center; font-weight: normal;font-size: 14px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Daily Stat. Report</h1>' +
                    '<div style="text-align: right;font-size: 8px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"><strong>' + TodayDate + '</strong></div>' +
                    '</div>' +
                    '<div>' +
                    '<table style="width:100%; margin:0; padding: 0;">' +
                    '<thead>' +
                    '<tr>' +
                    '<th style="padding: 10px 5px;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-bottom: 1px dotted #000; border-right: 1px dotted #000;">No</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Group Name</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Date</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Driving Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Parking Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Total Time</th>' +
                    // '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Invalid Location</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Mileage(km)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Average Speed(km/h)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Max Speed(km/h)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Over Speeding Frequency</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Notification Count</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Engine On Time</th></tr>' +
                    '</thead><tbody>';
                if (Array.length > 0) {
                    var data = u.sortBy(Array, function(num) { return new Date(num.Date) });
                    Array = data;
                }
                GetData(0);


                function GetData(i) {
                    var row = [];
                    if (i < Array.length) {

                        var Name = 'N/A';
                        var Date = 'N/A';
                        var DrivingTime = 'N/A';
                        var ParkingTime = 'N/A';
                        var LocateNumber = 0;
                        var InvalidLocation = 0;
                        var Mileage = 0.00;
                        var AverageSpeed = 0.00;
                        var AlarmNumber = 0;
                        var EnginOnTime = 'N/A';
                        var DoorOpenNumber = 0;
                        var DoorOpenTime = 'N/A';
                        var ShockNumber = 0;
                        var ShockTime = 'N/A';
                        var EngineOnNumber = 0;
                        var HighestSpeed = 0;
                        var OverSpeed = 0;
                        var GroupName = "UnGroup";

                        if (Array[i].Date != null && Array[i].Date != '' && Array[i].Date != undefined) {
                            Date = Array[i].Date;
                        }
                        if (Array[i].GroupName != null && Array[i].GroupName != '' && Array[i].GroupName != undefined) {
                            GroupName = Array[i].GroupName;
                        }
                        if (Array[i].Name != null && Array[i].Name != '' && Array[i].Name != undefined) {
                            Name = Array[i].Name;
                        }
                        if (Array[i].DrivingTime != null && Array[i].DrivingTime != '' && Array[i].DrivingTime != undefined) {
                            DrivingTime = Array[i].DrivingTime;
                        }

                        if (Array[i].ParkingTime != null && Array[i].ParkingTime != '' && Array[i].ParkingTime != undefined) {
                            ParkingTime = Array[i].ParkingTime;
                        }

                        if (Array[i].TotalTime != null && Array[i].TotalTime != '' && Array[i].TotalTime != undefined) {
                            TotalTime = Array[i].TotalTime;
                        }

                        if (Array[i].LocateNumber != null && Array[i].LocateNumber != '' && Array[i].LocateNumber != undefined) {
                            LocateNumber = Array[i].LocateNumber;
                        }

                        if (Array[i].InvalidLocation != null && Array[i].InvalidLocation != '' && Array[i].InvalidLocation != undefined) {
                            InvalidLocation = Array[i].InvalidLocation;
                        }

                        if (Array[i].Mileage != null && Array[i].Mileage != '' && Array[i].Mileage != undefined) {
                            Mileage = parseFloat(Array[i].Mileage).toFixed(2);
                        }

                        if (Array[i].AverageSpeed != null && Array[i].AverageSpeed != '' && Array[i].AverageSpeed != undefined) {
                            AverageSpeed = parseFloat(Array[i].AverageSpeed).toFixed(2);
                        }
                        if (Array[i].HighestSpeed != null && Array[i].HighestSpeed != '' && Array[i].HighestSpeed != undefined) {
                            HighestSpeed = parseFloat(Array[i].HighestSpeed).toFixed(2);
                        }
                        if (Array[i].OverSpeed != null && Array[i].OverSpeed != '' && Array[i].OverSpeed != undefined) {
                            OverSpeed = parseFloat(Array[i].OverSpeed).toFixed(2);
                        }
                        if (Array[i].AlarmNumber != null && Array[i].AlarmNumber != '' && Array[i].AlarmNumber != undefined) {
                            AlarmNumber = Array[i].AlarmNumber;
                        }

                        if (Array[i].EnginOnTime != null && Array[i].EnginOnTime != '' && Array[i].EnginOnTime != undefined) {
                            EnginOnTime = Array[i].EnginOnTime;
                        }

                        if (Array[i].DoorOpenNumber != null && Array[i].DoorOpenNumber != '' && Array[i].DoorOpenNumber != undefined) {
                            DoorOpenNumber = Array[i].DoorOpenNumber;
                        }

                        if (Array[i].DoorOpenTime != null && Array[i].DoorOpenTime != '' && Array[i].DoorOpenTime != undefined) {
                            DoorOpenTime = Array[i].DoorOpenTime;
                        }

                        if (Array[i].ShockNumber != null && Array[i].ShockNumber != '' && Array[i].ShockNumber != undefined) {
                            ShockNumber = Array[i].ShockNumber;
                        }

                        if (Array[i].ShockTime != null && Array[i].ShockTime != '' && Array[i].ShockTime != undefined) {
                            ShockTime = Array[i].ShockTime;
                        }

                        if (Array[i].EngineOnNumber != null && Array[i].EngineOnNumber != '' && Array[i].EngineOnNumber != undefined) {
                            EngineOnNumber = Array[i].EngineOnNumber;
                        }

                        table += '<tr>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + GroupName + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Date + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + DrivingTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + ParkingTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + TotalTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Mileage + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + AverageSpeed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + HighestSpeed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + OverSpeed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + AlarmNumber + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + EnginOnTime + '</td>' +
                            '</tr>';
                        GetData(i + 1);

                    } else {


                        table += '</tbody>  <tfoot style="font-weight: bold;">' +
                            ' <tr>' +
                            ' <td style="padding: 8px 5px; border-bottom: 1px dotted #000; border-right: 1px dotted #000;" colspan="2">Total:</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + TotalAllDrivingTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + TotalAllParkingTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + TotalAllTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + TotalAllEngineOnTime + '</td>' +
                            '</tr>' +
                            '</tfoot>';
                        table += '</table>' +
                            ' </div>' +
                            '</div>';
                        var html = table;
                        var options = {
                            format: 'A4',
                            orientation: "landscape",
                            footer: {
                                height: '35px',
                                contents: { default: '<hr/><span style="color: #444;text-align:right">{{page}}</span>' },
                                last: 'Last Page'
                            },
                            header: {
                                "height": "35px",
                            },
                        };

                        pdf.create(html, options).toStream(function(err, stream) {
                            stream.pipe(res);
                        });
                    }
                }

            }
        })
    })
})

//-------------------------------------------End Dail stat. report---------------------------------------------------


//------------------------------------Engine on/off Report-----------------------------------------------//
router.get('/GetAllEngineData', function(req, res) {
    var objParam = req.query;

    var Orderby = ' Order By Date ASC';
    var search = "";
    // search = " where tblvehicle.iduser=" + req.query.idUser;
    // var unixStartdate = new Date(objParam.StartDate).getTime() / 1000;
    // var unixEndDate = new Date(objParam.EndDate).getTime() / 1000;

    var Startdate = objParam.StartDate;
    var Enddate = objParam.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;




    if (objParam.DeviceId != null && objParam.DeviceId != '' && objParam.DeviceId != undefined) {
        if (search != "") {
            search += " And tblgpsdata.DeviceId in (" + objParam.DeviceId + ")";
        } else {
            search += " Where tblgpsdata.DeviceId in (" + objParam.DeviceId + ")";
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
            search += " And tblgpsdata.Date <= '" + unixEnddate + "'";
        } else {
            search += " Where tblgpsdata.Date <= '" + unixEnddate + "'";
        }
    }

    var query = "SELECT  tblgpsdata.Datetime, tblgpsdata.Date, tblgpsdata.Latitude, tblgpsdata.Longitude, tblgpsdata.DeviceId, tblgpsdata.IsPatchEngine as IsEngine, tblgpsdata.Speed,tblgpsdata.GPSPositioning, tblvehicle.Name, tblvehicle.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "FROM tblgpsdata LEFT JOIN tblvehicle ON tblvehicle.deviceid = tblgpsdata.DeviceId " +
        " left join tblvehiclegroup tvg on tvg.Id = tblvehicle.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = tblvehicle.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " + search;
    query += Orderby;
    connection.query(query, function(err, response) {
         if (response != undefined) {
            var Array = [];
            var COuntEngineOff = 0;
            var COuntEngineOn = 0;
            var StartMilage = 0;
            var Milageco = 0;
            var Engineco = 0;
            var TotalMileage = 0
            for (var k = 0; k < response.length; k++) {
                if (response[k].IsEngine == 1) {
                    if (Engineco == 0) {
                        StartMilage = k;
                        Engineco = 1;
                    }
                    if ((k != 0) && response[k].GPSPositioning == 'A') {
                        if (parseFloat(response[k].Speed) > 1) {
                            Milageco = 0;
                            TotalMileage += distance(parseFloat(response[StartMilage].Latitude), parseFloat(response[StartMilage].Longitude), parseFloat(response[k].Latitude), parseFloat(response[k].Longitude));
                            StartMilage = k;
                        } else {
                            if (Milageco == 0) {
                                TotalMileage += distance(parseFloat(response[StartMilage].Latitude), parseFloat(response[StartMilage].Longitude), parseFloat(response[k].Latitude), parseFloat(response[k].Longitude));
                                StartMilage = k;
                            }
                            Milageco = 1;
                        }
                    }

                    if (COuntEngineOn == 0) {
                        var obj = new Object();
                        obj.GroupName = "UnGroup";
                        if (req.query.idUser == response[k].iduser) {
                            if (response[k].GroupName != null && response[k].GroupName != undefined && response[k].GroupName != '') {
                                obj.GroupName = response[k].GroupName;
                            }
                        } else {
                            if (response[k].ShareGroupName != null && response[k].ShareGroupName != undefined && response[k].ShareGroupName != '') {
                                obj.GroupName = response[k].ShareGroupName;
                            }
                        }
                        obj.Name = response[k].Name;
                        obj.StartTimeold = new Date(response[k].Date * 1000);
                        obj.Status = 'Engine On';
                        obj.StartTime = momentz.utc(new Date(response[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                    }
                    COuntEngineOff = 0;
                    COuntEngineOn = 1;
                    // }
                } else {
                    if (COuntEngineOn != 0) {
                        Engineco = 0;
                        TotalMileage += distance(parseFloat(response[StartMilage].Latitude), parseFloat(response[StartMilage].Longitude), parseFloat(response[k].Latitude), parseFloat(response[k].Longitude));
                        obj.Mileage = TotalMileage;
                        Array.push(obj);
                        TotalMileage = 0;

                    }
                    COuntEngineOn = 0;
                    if (COuntEngineOff == 0) {
                        var GroupName = "UnGroup";
                        if (req.query.idUser == response[k].iduser) {
                            if (response[k].GroupName != null && response[k].GroupName != undefined && response[k].GroupName != '') {
                                GroupName = response[k].GroupName;
                            }
                        } else {
                            if (response[k].ShareGroupName != null && response[k].ShareGroupName != undefined && response[k].ShareGroupName != '') {
                                GroupName = response[k].ShareGroupName;
                            }
                        }
                        response[k].GroupName = GroupName;
                        response[k].Status = 'Engine Off';
                        // console.log(response[k].Id);
                        response[k].StartTimeold = new Date(response[k].Date * 1000);
                        response[k].StartTime = momentz.utc(new Date(response[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                        Array.push(response[k]);
                    }

                    COuntEngineOff = COuntEngineOff + 1;
                }
            }
            var DatewiseTravelledDistance = 0;
            var TotalEngineOnTime = 0;
            for (var j = 0; j < Array.length; j++) {
                if (j != Array.length - 1) {
                    Array[j].EndTime = Array[j + 1].StartTime;
                    Array[j].StartTime1 = Array[j].StartTimeold
                    Array[j].EndTime1 = Array[j + 1].StartTimeold
                    Array[j].ContinueTime = calcDateDiff(Array[j].EndTime, Array[j].StartTime);
                    if (Array[j].Status == 'Engine On') {
                        TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(Array[j + 1].StartTimeold), moment(Array[j].StartTimeold));
                    }

                } else {
                    Array[j].EndTime1 = new Date(response[response.length - 1].Date * 1000)
                    Array[j].EndTime = momentz.utc(new Date(response[response.length - 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                    Array[j].ContinueTime = calcDateDiff(Array[j].EndTime, Array[j].StartTime);
                    if (Array[j].Status == 'Engine On') {
                        TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(response[response.length - 1].StartTimeold), moment(Array[j].StartTimeold));
                    }

                }

                
            }
            
            res.json(Array);
            //res.json(response);
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })
})

router.get('/ExportEngineReport', function(req, res) {
    var objParam = req.query;

    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
        caption: 'Group Name',
        type: 'string'
    }, {
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
    var Startdate = objParam.StartDate;
    var Enddate = objParam.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;



    if (objParam.DeviceId != null && objParam.DeviceId != '' && objParam.DeviceId != undefined) {
        if (search != "") {
            search += " And tblgpsdata.DeviceId in (" + objParam.DeviceId + ")";
        } else {
            search += " Where tblgpsdata.DeviceId in (" + objParam.DeviceId + ")";
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
            search += " And tblgpsdata.Date <= '" + unixEnddate + "'";
        } else {
            search += " Where tblgpsdata.Date <= '" + unixEnddate + "'";
        }
    }

    var query = "SELECT  tblgpsdata.Datetime, tblgpsdata.Date, tblgpsdata.Latitude, tblgpsdata.Longitude, tblgpsdata.DeviceId, tblgpsdata.IsPatchEngine as IsEngine, tblgpsdata.Speed,tblgpsdata.GPSPositioning, tblvehicle.Name, tblvehicle.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "FROM tblgpsdata LEFT JOIN tblvehicle ON tblvehicle.deviceid = tblgpsdata.DeviceId " +
        " left join tblvehiclegroup tvg on tvg.Id = tblvehicle.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = tblvehicle.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " + search;
    query += Orderby;
    connection.query(query, function(err, response) {
        // console.log(response.length)
        var Array = [];
        var lstEngine = [];

        if (response != undefined) {
            conf.rows = [];
            var Array = [];
            var COuntEngineOff = 0;
            var COuntEngineOn = 0;
            var StartMilage = 0;
            var Milageco = 0;
            var Engineco = 0;
            var TotalMileage = 0
            for (var k = 0; k < response.length; k++) {
                if (response[k].IsEngine == 1) {
                    if (Engineco == 0) {
                        StartMilage = k;
                        Engineco = 1;
                    }
                    if ((k != 0) && response[k].GPSPositioning == 'A') {
                        if (parseFloat(response[k].Speed) > 1) {
                            Milageco = 0;
                            TotalMileage += distance(parseFloat(response[StartMilage].Latitude), parseFloat(response[StartMilage].Longitude), parseFloat(response[k].Latitude), parseFloat(response[k].Longitude));
                            StartMilage = k;
                        } else {
                            if (Milageco == 0) {
                                TotalMileage += distance(parseFloat(response[StartMilage].Latitude), parseFloat(response[StartMilage].Longitude), parseFloat(response[k].Latitude), parseFloat(response[k].Longitude));
                                StartMilage = k;
                            }
                            Milageco = 1;
                        }
                    }

                    if (COuntEngineOn == 0) {
                        var obj = new Object();
                        obj.GroupName = "UnGroup";
                        if (req.query.idUser == response[k].iduser) {
                            if (response[k].GroupName != null && response[k].GroupName != undefined && response[k].GroupName != '') {
                                obj.GroupName = response[k].GroupName;
                            }
                        } else {
                            if (response[k].ShareGroupName != null && response[k].ShareGroupName != undefined && response[k].ShareGroupName != '') {
                                obj.GroupName = response[k].ShareGroupName;
                            }
                        }

                        obj.Name = response[k].Name;
                        obj.StartTimeold = new Date(response[k].Date * 1000);
                        obj.Status = 'Engine On';
                        obj.StartTime = momentz.utc(new Date(response[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                    }
                    COuntEngineOff = 0;
                    COuntEngineOn = 1;
                } else {
                    if (COuntEngineOn != 0) {
                        Engineco = 0;
                        TotalMileage += distance(parseFloat(response[StartMilage].Latitude), parseFloat(response[StartMilage].Longitude), parseFloat(response[k].Latitude), parseFloat(response[k].Longitude));
                        obj.Mileage = TotalMileage;
                        Array.push(obj);
                        TotalMileage = 0;

                    }
                    COuntEngineOn = 0;
                    if (COuntEngineOff == 0) {
                        var GroupName = "UnGroup";
                        if (req.query.idUser == response[k].iduser) {
                            if (response[k].GroupName != null && response[k].GroupName != undefined && response[k].GroupName != '') {
                                GroupName = response[k].GroupName;
                            }
                        } else {
                            if (response[k].ShareGroupName != null && response[k].ShareGroupName != undefined && response[k].ShareGroupName != '') {
                                GroupName = response[k].ShareGroupName;
                            }
                        }
                        response[k].Status = 'Engine Off';
                        response[k].StartTimeold = new Date(response[k].Date * 1000);
                        response[k].StartTime = momentz.utc(new Date(response[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                        Array.push(response[k]);
                    }

                    COuntEngineOff = COuntEngineOff + 1;
                }
            }
            var DatewiseTravelledDistance = 0;
            var TotalEngineOnTime = 0;
            for (var j = 0; j < Array.length; j++) {
                if (j != Array.length - 1) {
                    Array[j].EndTime = Array[j + 1].StartTime;
                    Array[j].ContinueTime = calcDateDiff(Array[j].EndTime, Array[j].StartTime);
                    if (Array[j].Status == 'Engine On') {
                        TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(Array[j + 1].StartTimeold), moment(Array[j].StartTimeold));
                    }

                } else {
                    Array[j].EndTime = momentz.utc(new Date(response[response.length - 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                    Array[j].ContinueTime = calcDateDiff(Array[j].EndTime, Array[j].StartTime);
                    if (Array[j].Status == 'Engine On') {
                        TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(response[response.length - 1].StartTimeold), moment(Array[j].StartTimeold));
                    }

                }

            }
            if (Array.length > 0) {
                var data = u.sortBy(Array, function(num) { return new Date(num.StartTime) }) //.reverse();
                lstEngine = data;
            }
            for (var i = 0; i < lstEngine.length; i++) {

                var row = [];
                var Name = '';
                var Status = '';
                var ContinueTime = '';
                var StartTime = '';
                var EndTime = '';
                var Mileage = 0.00;
                var DatewiseTravelledDistance = 0;
                var GroupName = "UnGroup";
                if (lstEngine[i].Name != null && lstEngine[i].Name != '' && lstEngine[i].Name != undefined) {
                    Name = lstEngine[i].Name;
                }


                if (lstEngine[i].Status != null && lstEngine[i].Status != '' && lstEngine[i].Status != undefined) {
                    Status = lstEngine[i].Status;
                }
                if (lstEngine[i].ContinueTime != null && lstEngine[i].ContinueTime != '' && lstEngine[i].ContinueTime != undefined) {
                    ContinueTime = lstEngine[i].ContinueTime;
                }
                if (lstEngine[i].StartTime != null && lstEngine[i].StartTime != '' && lstEngine[i].StartTime != undefined) {
                    StartTime = lstEngine[i].StartTime;
                }
                if (lstEngine[i].Mileage != null && lstEngine[i].Mileage != '' && lstEngine[i].Mileage != undefined) {
                    Mileage = parseFloat(lstEngine[i].Mileage).toFixed(2);
                }
                if (lstEngine[i].EndTime != null && lstEngine[i].EndTime != '' && lstEngine[i].EndTime != undefined) {
                    EndTime = lstEngine[i].EndTime;
                }
                if (lstEngine[i].GroupName != null && lstEngine[i].GroupName != '' && lstEngine[i].GroupName != undefined) {
                    GroupName = lstEngine[i].GroupName;
                }

                row.push(GroupName, Name.toString(), Status.toString(), ContinueTime.toString(), StartTime.toString(), EndTime.toString(), Mileage.toString());
                conf.rows.push(row);


            }
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=EngineOnOffReport.xlsx");
            res.end(result, 'binary');
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })
})


router.get('/PrintEngineReport', function(req, res) {
    var objParam = req.query;

    var Orderby = ' Order By Date ASC';
    var search = "";

    var Startdate = objParam.StartDate;
    var Enddate = objParam.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;



    if (objParam.DeviceId != null && objParam.DeviceId != '' && objParam.DeviceId != undefined) {
        if (search != "") {
            search += " And tblgpsdata.DeviceId in (" + objParam.DeviceId + ")";
        } else {
            search += " Where tblgpsdata.DeviceId in (" + objParam.DeviceId + ")";
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
            search += " And tblgpsdata.Date <= '" + unixEnddate + "'";
        } else {
            search += " Where tblgpsdata.Date <= '" + unixEnddate + "'";
        }
    }
    var query = "SELECT  tblgpsdata.Datetime, tblgpsdata.Date, tblgpsdata.Latitude, tblgpsdata.Longitude, tblgpsdata.DeviceId, tblgpsdata.IsPatchEngine as IsEngine, tblgpsdata.Speed,tblgpsdata.GPSPositioning, tblvehicle.Name, tblvehicle.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "FROM tblgpsdata LEFT JOIN tblvehicle ON tblvehicle.deviceid = tblgpsdata.DeviceId " +
        " left join tblvehiclegroup tvg on tvg.Id = tblvehicle.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = tblvehicle.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " + search;
    query += Orderby;
    connection.query(query, function(err, response) {
        var Array = [];
        var lstEngine = [];

        if (response != undefined) {
            var Array = [];
            var COuntEngineOff = 0;
            var COuntEngineOn = 0;
            var StartMilage = 0;
            var Milageco = 0;
            var Engineco = 0;
            var TotalMileage = 0
            for (var k = 0; k < response.length; k++) {
                if (response[k].IsEngine == 1) {
                    if (Engineco == 0) {
                        StartMilage = k;
                        Engineco = 1;
                    }
                    if ((k != 0) && response[k].GPSPositioning == 'A') {
                        if (parseFloat(response[k].Speed) > 1) {
                            Milageco = 0;
                            TotalMileage += distance(parseFloat(response[StartMilage].Latitude), parseFloat(response[StartMilage].Longitude), parseFloat(response[k].Latitude), parseFloat(response[k].Longitude));
                            StartMilage = k;
                        } else {
                            if (Milageco == 0) {
                                TotalMileage += distance(parseFloat(response[StartMilage].Latitude), parseFloat(response[StartMilage].Longitude), parseFloat(response[k].Latitude), parseFloat(response[k].Longitude));
                                StartMilage = k;
                            }
                            Milageco = 1;
                        }
                    }

                    if (COuntEngineOn == 0) {
                        var obj = new Object();
                        obj.GroupName = "UnGroup";
                        if (req.query.idUser == response[k].iduser) {
                            if (response[k].GroupName != null && response[k].GroupName != undefined && response[k].GroupName != '') {
                                obj.GroupName = response[k].GroupName;
                            }
                        } else {
                            if (response[k].ShareGroupName != null && response[k].ShareGroupName != undefined && response[k].ShareGroupName != '') {
                                obj.GroupName = response[k].ShareGroupName;
                            }
                        }
                        obj.Name = response[k].Name;
                        obj.StartTimeold = new Date(response[k].Date * 1000);
                        obj.Status = 'Engine On';
                        obj.StartTime = momentz.utc(new Date(response[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                    }
                    COuntEngineOff = 0;
                    COuntEngineOn = 1;
                } else {
                    if (COuntEngineOn != 0) {
                        Engineco = 0;
                        TotalMileage += distance(parseFloat(response[StartMilage].Latitude), parseFloat(response[StartMilage].Longitude), parseFloat(response[k].Latitude), parseFloat(response[k].Longitude));
                        obj.Mileage = TotalMileage;
                        Array.push(obj);
                        TotalMileage = 0;

                    }
                    COuntEngineOn = 0;
                    if (COuntEngineOff == 0) {
                        var GroupName = "UnGroup";
                        if (req.query.idUser == response[k].iduser) {
                            if (response[k].GroupName != null && response[k].GroupName != undefined && response[k].GroupName != '') {
                                GroupName = response[k].GroupName;
                            }
                        } else {
                            if (response[k].ShareGroupName != null && response[k].ShareGroupName != undefined && response[k].ShareGroupName != '') {
                                GroupName = response[k].ShareGroupName;
                            }
                        }
                        response[k].Status = 'Engine Off';
                        response[k].StartTimeold = new Date(response[k].Date * 1000);
                        response[k].StartTime = momentz.utc(new Date(response[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                        Array.push(response[k]);
                    }

                    COuntEngineOff = COuntEngineOff + 1;
                }
            }
            var DatewiseTravelledDistance = 0;
            var TotalEngineOnTime = 0;
            for (var j = 0; j < Array.length; j++) {
                if (j != Array.length - 1) {
                    Array[j].EndTime = Array[j + 1].StartTime;
                    Array[j].ContinueTime = calcDateDiff(Array[j].EndTime, Array[j].StartTime);
                    if (Array[j].Status == 'Engine On') {
                        TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(Array[j + 1].StartTimeold), moment(Array[j].StartTimeold));
                    }

                } else {
                    Array[j].EndTime = momentz.utc(new Date(response[response.length - 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                    Array[j].ContinueTime = calcDateDiff(Array[j].EndTime, Array[j].StartTime);
                    if (Array[j].Status == 'Engine On') {
                        TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(response[response.length - 1].StartTimeold), moment(Array[j].StartTimeold));
                    }

                }
            }
            if (Array.length > 0) {
                var data = u.sortBy(Array, function(num) { return new Date(num.StartTime) }) //.reverse();
                lstEngine = data;
            }
            var TodayDate = momentz.utc(new Date()).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');



            var table = '<div style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; padding:0 15px;">' +
                '<div style="padding:15px; border-bottom:1px solid #000;">' +
                '<h1 style="text-transform: uppercase; text-align:center; font-weight: normal;font-size: 14px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Engine On/Off Report</h1>' +
                '<div style="text-align: right;font-size: 8px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"><strong>' + TodayDate + '</strong></div>' +
                '</div>' +
                '<div>' +
                '<table style="width:100%; margin:0; padding: 0;">' +
                '<thead>' +
                '<tr>' +
                '<th style="padding: 10px 5px;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-bottom: 1px dotted #000; border-right: 1px dotted #000;">No</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Group Name</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Engine Status</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Continuous Time</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Start Time</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">End Time</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Mileage</th></tr>' +
                '</thead><tbody>';

            for (var i = 0; i < lstEngine.length; i++) {

                var Name = '';
                var Status = '';
                var ContinueTime = '';
                var StartTime = '';
                var EndTime = '';
                var Mileage = 0.00;
                var DatewiseTravelledDistance = 0;
                var GroupName = "UnGroup";
                if (lstEngine[i].GroupName != null && lstEngine[i].GroupName != '' && lstEngine[i].GroupName != undefined) {
                    GroupName = lstEngine[i].GroupName;
                }
                if (lstEngine[i].Name != null && lstEngine[i].Name != '' && lstEngine[i].Name != undefined) {
                    Name = lstEngine[i].Name;
                }
                if (lstEngine[i].Status != null && lstEngine[i].Status != '' && lstEngine[i].Status != undefined) {
                    Status = lstEngine[i].Status;
                }
                if (lstEngine[i].ContinueTime != null && lstEngine[i].ContinueTime != '' && lstEngine[i].ContinueTime != undefined) {
                    ContinueTime = lstEngine[i].ContinueTime;
                }
                if (lstEngine[i].StartTime != null && lstEngine[i].StartTime != '' && lstEngine[i].StartTime != undefined) {
                    StartTime = lstEngine[i].StartTime;
                }
                if (lstEngine[i].Mileage != null && lstEngine[i].Mileage != '' && lstEngine[i].Mileage != undefined) {
                    Mileage = parseFloat(lstEngine[i].Mileage).toFixed(2);
                }
                if (lstEngine[i].EndTime != null && lstEngine[i].EndTime != '' && lstEngine[i].EndTime != undefined) {
                    EndTime = lstEngine[i].EndTime;
                }
                table += '<tr>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + GroupName.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Name.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Status.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + ContinueTime.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + StartTime.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + EndTime.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Mileage.toString() + '</td>' +
                    '</tr>';
            }
            table += '</tbody></table>' +
                ' </div>' +
                '</div>';
            var html = table;
            var options = {
                format: 'A4',
                footer: {
                    height: '35px',
                    contents: { default: '<hr/><span style="color: #444;text-align:right">{{page}}</span>' },
                    last: 'Last Page'
                },
                header: {
                    "height": "35px",
                },
            };

            pdf.create(html, options).toStream(function(err, stream) {
                stream.pipe(res);
            });
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })
})

//------------------------------------Engine on/off Report End-----------------------------------------------//



//------------------------------------Fence in/out Report-----------------------------------------------//
router.get('/GetAllFenceInAndOutData', function(req, res) {
    var objParam = req.query;

    var Orderby = 'Order By Date ASC';
    if (req.query.orderby != '' && req.query.orderby !== null && req.query.orderby != undefined) {
        Orderby = ' ' + req.query.orderby;
    }
    var search = "";
    search = "";
    var Startdate = objParam.StartDate;
    var Enddate = objParam.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.DeviceId != null && objParam.DeviceId != 'All' && objParam.DeviceId != undefined && objParam.DeviceId != '-1') {
        if (search != "") {
            search += " And tblalarm.DeviceId in (" + objParam.DeviceId + ")";
        } else {
            search += " Where tblalarm.DeviceId in (" + objParam.DeviceId + ")";
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
            search += " And tblalarm.Date <= '" + unixEnddate + "'";
        } else {
            search += " Where tblalarm.Date <= '" + unixEnddate + "'";
        }
    }

    if (search != "") {
        search += " And tblalarm.AlarmCode IN ('6', '66')";
    } else {
        search += " Where tblalarm.AlarmCode IN ('6', '66')";
    }

    var query = "Select tblalarm.* , tblvehicle.iduser, tblvehicle.Name, tblvehicle.IsOnline , tblvehicle.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblalarm left join tblvehicle On tblvehicle.deviceid = tblalarm.DeviceId " +
        " left join tblvehiclegroup tvg on tvg.Id = tblvehicle.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = tblvehicle.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " + search + Orderby + " LIMIT " + req.query.length + " OFFSET " + req.query.start + ";";
    var count = "Select count(*) As Totalrecord " +
        "from tblalarm left join tblvehicle On tblvehicle.deviceid = tblalarm.DeviceId " +
        " left join tblvehiclegroup tvg on tvg.Id = tblvehicle.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = tblvehicle.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " + search;
    connection.query(query, function(err, response) {

        if (response != undefined) {
            connection.query(count, function(err1, countdata) {
                var obj = new Object();
                for (var k = 0; k < response.length; k++) {
                    var GroupName = "UnGroup";
                    if (req.query.idUser == response[k].iduser) {
                        if (response[k].GroupName != null && response[k].GroupName != undefined && response[k].GroupName != '') {
                            GroupName = response[k].GroupName;
                        }
                    } else {
                        if (response[k].ShareGroupName != null && response[k].ShareGroupName != undefined && response[k].ShareGroupName != '') {
                            GroupName = response[k].ShareGroupName;
                        }
                    }
                    response[k].GroupName = GroupName;
                }
                obj.data = response;
                obj.Totalrecord = countdata[0].Totalrecord;
                res.json(obj);
            })

        } else {
            var response1 = new Object()
            response1.data = [];
            response1.Totalrecord = 0;
            res.json(response1);
        }
    })
})

router.get('/ExportFenceReport', function(req, res) {
    var objParam = req.query;

    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
            caption: 'Group Name',
            type: 'string'
        }, {
            caption: 'Asset Name',
            type: 'string'
        }, {
            caption: 'Fence Name',
            type: 'string'
        }, {
            caption: 'Time',
            type: 'string'
        }, {
            caption: 'Fence Status',
            type: 'string'
        },
        
    ];
    var Orderby = 'Order By Date ASC';
    var search = "";
    search = "";
    var Startdate = objParam.StartDate;
    var Enddate = objParam.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    
    if (objParam.DeviceId != null && objParam.DeviceId != 'All' && objParam.DeviceId != undefined && objParam.DeviceId != '-1') {
        if (search != "") {
            search += " And tblalarm.DeviceId in (" + objParam.DeviceId + ")";
        } else {
            search += " Where tblalarm.DeviceId in (" + objParam.DeviceId + ")";
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
            search += " And tblalarm.Date <= '" + unixEnddate + "'";
        } else {
            search += " Where tblalarm.Date <= '" + unixEnddate + "'";
        }
    }

    if (search != "") {
        search += " And tblalarm.AlarmCode IN ('6', '66')";
    } else {
        search += " Where tblalarm.AlarmCode IN ('6', '66')";
    }
    var query = "Select tblalarm.* , tblvehicle.iduser, tblvehicle.Name, tblvehicle.IsOnline , tblvehicle.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblalarm left join tblvehicle On tblvehicle.deviceid = tblalarm.DeviceId " +
        " left join tblvehiclegroup tvg on tvg.Id = tblvehicle.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = tblvehicle.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " + search + Orderby;
    connection.query(query, function(err, response) {
        for (var k = 0; k < response.length; k++) {
            var GroupName = "UnGroup";
            if (req.query.idUser == response[k].iduser) {
                if (response[k].GroupName != null && response[k].GroupName != undefined && response[k].GroupName != '') {
                    GroupName = response[k].GroupName;
                }
            } else {
                if (response[k].ShareGroupName != null && response[k].ShareGroupName != undefined && response[k].ShareGroupName != '') {
                    GroupName = response[k].ShareGroupName;
                }
            }
            response[k].GroupName = GroupName;
        }
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
                    var FenceName = 'N/A';

                    if (response[i].Latitude != undefined && response[i].Latitude != null && response[i].Latitude != '' && response[i].Longitude != undefined && response[i].Longitude != null && response[i].Longitude != '') {
                        // geocoder.reverse({ lat: response[i].Latitude, lon: response[i].Longitude }, function(err, res) {
                        if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                            // Datetime = dateformat(response[i].Datetime, 2);
                            TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                        }
                        if (response[i].GroupName != null && response[i].GroupName != '' && response[i].GroupName != undefined) {
                            GroupName = response[i].GroupName;
                        }

                        if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                            Name = response[i].Name;
                        }
                        if (response[i].FenceName != null && response[i].FenceName != '' && response[i].FenceName != undefined) {
                            FenceName = response[i].FenceName;
                        }

                        if (response[i].AlarmCode != null && response[i].AlarmCode != '' && response[i].AlarmCode != undefined) {
                            if (response[i].AlarmCode == '6') {
                                FenceStatus = 'Fence In';
                            } else {
                                FenceStatus = 'Fence Out';
                            }
                        }


                        row.push(GroupName, Name.toString(), FenceName.toString(), TIme.toString(), FenceStatus.toString());
                        conf.rows.push(row);


                        GetData(i + 1);


                    } else {
                        if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                            // Datetime = dateformat(response[i].Datetime, 2);
                            TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                        }

                        if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                            Name = response[i].Name;
                        }

                        if (response[i].AlarmCode != null && response[i].AlarmCode != '' && response[i].AlarmCode != undefined) {
                            if (response[i].AlarmCode == '6') {
                                FenceStatus = 'Fence In';
                            } else {
                                FenceStatus = 'Fence Out';
                            }
                        }

                        // Address = "N/A";
                        row.push(Name.toString(), FenceName.toString(), TIme.toString(), FenceStatus.toString());
                        conf.rows.push(row);
                        GetData(i + 1);
                    }

                } else {
                    var result = nodeExcel.execute(conf);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader("Content-Disposition", "attachment; filename=FenceInOutReport.xlsx");
                    res.end(result, 'binary');
                }
            }
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })
})

router.get('/PrintFenceReport', function(req, res) {
    var objParam = req.query;

    var Orderby = 'Order By Date ASC';
    var search = "";
    search = "";
    var Startdate = objParam.StartDate;
    var Enddate = objParam.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.DeviceId != null && objParam.DeviceId != 'All' && objParam.DeviceId != undefined && objParam.DeviceId != '-1') {
        if (search != "") {
            search += " And tblalarm.DeviceId in (" + objParam.DeviceId + ")";
        } else {
            search += " Where tblalarm.DeviceId in (" + objParam.DeviceId + ")";
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
            search += " And tblalarm.Date <= '" + unixEnddate + "'";
        } else {
            search += " Where tblalarm.Date <= '" + unixEnddate + "'";
        }
    }

    if (search != "") {
        search += " And tblalarm.AlarmCode IN ('6', '66')";
    } else {
        search += " Where tblalarm.AlarmCode IN ('6', '66')";
    }

    var query = "Select tblalarm.* , tblvehicle.iduser, tblvehicle.Name, tblvehicle.IsOnline , tblvehicle.iduser,tvg.GroupName,tvgs.GroupName as ShareGroupName " +
        "from tblalarm left join tblvehicle On tblvehicle.deviceid = tblalarm.DeviceId " +
        " left join tblvehiclegroup tvg on tvg.Id = tblvehicle.IdGroup " +
        " left join tblsharedevice tsd on tsd.idVehicle = tblvehicle.id " +
        " left join tblvehiclegroup tvgs on tvgs.Id = tsd.IdSharedGroup " + search + Orderby;
    connection.query(query, function(err, response) {

        var TodayDate = momentz.utc(new Date()).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');



        var table = '<div style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; padding:0 15px;">' +
            '<div style="padding:15px; border-bottom:1px solid #000;">' +
            '<h1 style="text-transform: uppercase; text-align:center; font-weight: normal;font-size: 14px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Fence In And Out Report</h1>' +
            '<div style="text-align: right;font-size: 8px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;"><strong>' + TodayDate + '</strong></div>' +
            '</div>' +
            '<div>' +
            '<table style="width:100%; margin:0; padding: 0;">' +
            '<thead>' +
            '<tr>' +
            '<th style="padding: 10px 5px;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-bottom: 1px dotted #000; border-right: 1px dotted #000;">No</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Group Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Fence Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Time</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; >Fence Status</th></tr>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Over Speeding Frequency</th></tr>' +
            '</thead><tbody>';

        if (response != undefined) {

            for (var k = 0; k < response.length; k++) {
                var GroupName = "UnGroup";
                if (req.query.idUser == response[k].iduser) {
                    if (response[k].GroupName != null && response[k].GroupName != undefined && response[k].GroupName != '') {
                        GroupName = response[k].GroupName;
                    }
                } else {
                    if (response[k].ShareGroupName != null && response[k].ShareGroupName != undefined && response[k].ShareGroupName != '') {
                        GroupName = response[k].ShareGroupName;
                    }
                }
                response[k].GroupName = GroupName;
            }
            GetData(0);

            function GetData(i) {
                if (i < response.length) {
                    var row = [];
                    var Name = 'N/A';
                    var TIme = 'N/A';
                    var Address = 'N/A';
                    var FenceStatus = 'N/A';
                    var FenceName = 'N/A';

                    if (response[i].Latitude != undefined && response[i].Latitude != null && response[i].Latitude != '' && response[i].Longitude != undefined && response[i].Longitude != null && response[i].Longitude != '') {
                        if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                            TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                        }
                        if (response[i].GroupName != null && response[i].GroupName != '' && response[i].GroupName != undefined) {
                            GroupName = response[i].GroupName;
                        }
                        if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                            Name = response[i].Name;
                        }
                        if (response[i].FenceName != null && response[i].FenceName != '' && response[i].FenceName != undefined) {
                            FenceName = response[i].FenceName;
                        }

                        if (response[i].AlarmCode != null && response[i].AlarmCode != '' && response[i].AlarmCode != undefined) {
                            if (response[i].AlarmCode == '6') {
                                FenceStatus = 'Fence In';
                            } else {
                                FenceStatus = 'Fence Out';
                            }
                        }

                        table += '<tr>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + GroupName.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + FenceName.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TIme.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + FenceStatus.toString() + '</td>' +
                            '</tr>';


                        GetData(i + 1);


                    } else {
                        if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                            // Datetime = dateformat(response[i].Datetime, 2);
                            TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                        }

                        if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                            Name = response[i].Name;
                        }

                        if (response[i].AlarmCode != null && response[i].AlarmCode != '' && response[i].AlarmCode != undefined) {
                            if (response[i].AlarmCode == '6') {
                                FenceStatus = 'Fence In';
                            } else {
                                FenceStatus = 'Fence Out';
                            }
                        }
                        table += '<tr>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + FenceName.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TIme.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + FenceStatus.toString() + '</td>' +
                            '</tr>';

                        GetData(i + 1);
                    }
                } else {
                    table += '</tbody></table>' +
                        ' </div>' +
                        '</div>';
                    var html = table;
                    var options = {
                        format: 'A4',
                        footer: {
                            height: '35px',
                            contents: { default: '<hr/><span style="color: #444;text-align:right">{{page}}</span>' },
                            last: 'Last Page'
                        },
                        header: {
                            "height": "35px",
                        },
                    };

                    pdf.create(html, options).toStream(function(err, stream) {
                        stream.pipe(res);
                    });
                }
            }
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })
})

//------------------------------------Fence in/out Report end-----------------------------------------------//


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

function calhrminsecfromsec(seconds) {

    minutes = Math.floor(seconds / 60);
    hours = Math.floor(minutes / 60);
    days = Math.floor(hours / 24);

    hours = hours - (days * 24);
    minutes = minutes - (days * 24 * 60) - (hours * 60);
    seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);
    var displaydata = "";
    if (days > 0) {
        displaydata = days + " days " + hours + " hrs " + minutes + " min " + seconds + " sec";
    } else if (hours > 0) {
        displaydata = hours + " hrs " + minutes + " min " + seconds + " sec";
    } else if (minutes > 0) {
        displaydata = minutes + " min " + seconds + " sec";
    } else {
        displaydata = seconds + " sec";
    }
    return displaydata;
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

function calcDateDiffCalInSec(date1, date2) {

    var l = moment.duration(date1.diff(date2, 'milliseconds'));

    var diff = l.asMilliseconds();

    var seconds = Math.floor(diff / 1000);

    return seconds
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


module.exports = router