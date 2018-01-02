var router = express.Router();
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var GPSdata = models.tblgpsdata;
var momentz = require('moment-timezone');
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
        orderby = ' ' + req.query.orderby;
    }

    var query = "select tblgpsdata.*,tblvehicle.Name from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + orderby + " LIMIT " + req.query.length + " OFFSET " + req.query.start + ";"
    var Count = "select count(*) AS Totalrecord from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + ";"
    connection.query(query, function(err, lstGPSData, fields) {
        if (!err) {
            connection.query(Count, function(err1, res1, fields) {
                var object = new Object();
                object.data = lstGPSData;
                object.Totalrecord = res1[0].Totalrecord;
                res.json(object);
            })

        }
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
        },
        // {
        //     caption: 'Address',
        //     type: 'string'
        // },
        // {
        //     caption: 'Device Status',
        //     type: 'string'
        // },
        {
            caption: 'Asset Status',
            type: 'string'
        }, {
            caption: 'Speed(km/h)',
            type: 'number'
        },
        /* {
                    caption: 'Fule(%)',
                    type: 'number'
                }, {
                    caption: 'Fule(L)',
                    type: 'number'
                }, {
                    caption: 'Mileage(km)',
                    type: 'number'
                }, {
                    caption: 'Temp.',
                    type: 'number'
                }, {
                    caption: 'GPS Signal',
                    type: 'string'
                }
        , */
        {
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



    var query = "select tblgpsdata.*,tblvehicle.Name from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + " order by Date ASC;"
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
        // GetData(0);


        //function GetData(i) {
        //if (i < response.length) {
        for (var i = 0; i < response.length; i++) {
            var row = [];
            var Name = 'N/A';
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

            if (response[i].Latitude != undefined && response[i].Latitude != null && response[i].Latitude != '' && response[i].Longitude != undefined && response[i].Longitude != null && response[i].Longitude != '') {
                // geocoder.reverse({ lat: response[i].Latitude, lon: response[i].Longitude }, function(err, resAddress) {
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

                // if (err == null && resAddress != null) {
                //     if (resAddress.length > 0) {
                //         Address = resAddress[0].formattedAddress;
                //         row.push(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
                //     } else {
                //         Address = "N/A";
                //         row.push(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
                //     }
                // } else {
                // Address = "N/A";
                // row.push(Name.toString(), TIme.toString(), /*DeviceStatus.toString(),*/ AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
                row.push(Name.toString(), TIme.toString(), AssetStatus.toString(), Speed, Direction, Latitude, Longitude);
                // }
                conf.rows.push(row);
                // GetData(i + 1);
                // })
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
                // row.push(Name.toString(), TIme.toString(), /*DeviceStatus.toString(),*/ AssetStatus.toString(), Speed, /*Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(),*/ Direction, Latitude, Longitude);
                row.push(Name.toString(), TIme.toString(), AssetStatus.toString(), Speed, Direction, Latitude, Longitude);
                conf.rows.push(row);
                // GetData(i + 1);
            }
        }
        /*console.log(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);

        row.push(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
        conf.rows.push(row);
        GetData(i + 1);*/
        //} else {
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=DetailTripReport.xlsx");
        res.end(result, 'binary');
        //}
        //}

    })
})


router.get('/PrintDetailTripReport', function(req, res) {

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



    var query = "select tblgpsdata.*,tblvehicle.Name from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + " order by Date ASC;"
    connection.query(query, function(err, response) {
        for (var i = 0; i < response.length; i++) {
            if (response[i].IsEngine == 1) {
                response[i].IsEngine = "Engine ON";
            } else {
                response[i].IsEngine = "Engine OFF";
            }
        }
        var TodayDate = momentz.utc(new Date()).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
        // var table = '<h2 style="text-align:center"><b>Detailed Trip Report</b></h2><h5 style="text-align:right">' + TodayDate + '</h5><hr/><table style="width:100%">' +
        //     '<tr><th style="text-align:left">No</th>' +
        //     '<th style="text-align:left">Asset Name</th>' +
        //     '<th style="text-align:left">Time</th>' +
        //     '<th style="text-align:left">Asset Status</th>' +
        //     '<th style="text-align:left">Speed(km/h)</th>' +
        //     '<th style="text-align:left">Direction</th>' +
        //     '<th style="text-align:left">Latitude</th>' +
        //     '<th style="text-align:left">Longitude</th></tr>';


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
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Time</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Status</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Speed(km/h)</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Direction</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Latitude</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Longitude</th></tr>' +
            '</thead><tbody>';


        for (var i = 0; i < response.length; i++) {
            var row = [];
            var Name = 'N/A';
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

            if (response[i].Latitude != undefined && response[i].Latitude != null && response[i].Latitude != '' && response[i].Longitude != undefined && response[i].Longitude != null && response[i].Longitude != '') {
                // geocoder.reverse({ lat: response[i].Latitude, lon: response[i].Longitude }, function(err, resAddress) {
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

                // if (err == null && resAddress != null) {
                //     if (resAddress.length > 0) {
                //         Address = resAddress[0].formattedAddress;
                //         row.push(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
                //     } else {
                //         Address = "N/A";
                //         row.push(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
                //     }
                // } else {
                // Address = "N/A";
                // row.push(Name.toString(), TIme.toString(), /*DeviceStatus.toString(),*/ AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);
                table += '<tr>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TIme.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + AssetStatus.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Direction + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Latitude + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Longitude + '</td>' +
                    '</tr>';
                // }
                // GetData(i + 1);
                // })
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
                // row.push(Name.toString(), TIme.toString(), /*DeviceStatus.toString(),*/ AssetStatus.toString(), Speed, /*Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(),*/ Direction, Latitude, Longitude);
                table += '<tr>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TIme.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + AssetStatus.toString() + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Direction + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Latitude + '</td>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Longitude + '</td>' +
                    '</tr>';
                // GetData(i + 1);
            }
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

    })

})

/*------------------------------------Detailed Trip Report End-------------------*/

//------------------------------------Fence in/out Report-----------------------------------------------//
router.get('/GetAllFenceInAndOutData', function(req, res) {
    var objParam = req.query;

    var Orderby = '';
    if (req.query.orderby != '' && req.query.orderby !== null && req.query.orderby != undefined) {
        Orderby = ' ' + req.query.orderby;
    }
    var search = "";
    // var unixStartdate = new Date(objParam.StartDate).getTime() / 1000;
    // var unixEndDate = new Date(objParam.EndDate).getTime() / 1000;
    search = "";
    var Startdate = objParam.StartDate;
    var Enddate = objParam.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    // if (objParam.DeviceId != null && objParam.DeviceId != 'All' && objParam.DeviceId != undefined) {
    //     if (search != "") {
    //         search += " And tblalarm.DeviceId IN (" + objParam.DeviceId + ")";
    //     } else {
    //         search += " Where tblalarm.DeviceId IN (" + objParam.DeviceId + ")";
    //     }
    // } else {
    //     if (search != "") {
    //         search += " And tblvehicle.IsDelete = 0 AND tblvehicle.idUser = " + objParam.idUser;
    //     } else {
    //         search += " Where tblvehicle.IsDelete = 0 AND tblvehicle.idUser = " + objParam.idUser;
    //     }
    // }
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

    var query = "Select tblalarm.* , tblvehicle.iduser, tblvehicle.Name, tblvehicle.IsOnline from tblalarm left join tblvehicle On tblvehicle.deviceid = tblalarm.DeviceId " + search + Orderby + " LIMIT " + req.query.length + " OFFSET " + req.query.start + ";";
    var count = "Select count(*) As Totalrecord from tblalarm left join tblvehicle On tblvehicle.deviceid = tblalarm.DeviceId " + search + ";";
    connection.query(query, function(err, response) {

        if (response != undefined) {
            connection.query(count, function(err1, countdata) {
                var obj = new Object();
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
        //  {
        //     caption: 'Address',
        //     type: 'string'
        // }
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

    // if (objParam.DeviceId != null && objParam.DeviceId != 'All' && objParam.DeviceId != undefined) {
    //     if (search != "") {
    //         search += " And tblalarm.DeviceId IN (" + objParam.DeviceId + ")";
    //     } else {
    //         search += " Where tblalarm.DeviceId IN (" + objParam.DeviceId + ")";
    //     }
    // } else {
    //     if (search != "") {
    //         search += " And tblvehicle.IsDelete = 0 AND tblvehicle.idUser = " + objParam.idUser;
    //     } else {
    //         search += " Where tblvehicle.IsDelete = 0 AND tblvehicle.idUser = " + objParam.idUser;
    //     }
    // }
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
                    var FenceStatus = 'N/A';
                    var FenceName = 'N/A';

                    if (response[i].Latitude != undefined && response[i].Latitude != null && response[i].Latitude != '' && response[i].Longitude != undefined && response[i].Longitude != null && response[i].Longitude != '') {
                        // geocoder.reverse({ lat: response[i].Latitude, lon: response[i].Longitude }, function(err, res) {
                        if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                            // Datetime = dateformat(response[i].Datetime, 2);
                            TIme = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
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

                        // if (res.length > 0) {
                        //     Address = res[0].formattedAddress;
                        //     row.push(Name.toString(), TIme.toString(), FenceStatus.toString(), Address.toString());
                        //     conf.rows.push(row);
                        // } else {
                        //     Address = "N/A";
                        row.push(Name.toString(), FenceName.toString(), TIme.toString(), FenceStatus.toString());
                        conf.rows.push(row);
                        // }

                        GetData(i + 1);
                        // })

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
                    // conf.rows.push(Name.toString(), TIme.toString(), FenceStatus.toString(), Address.toString());
                    // GetData(i + 1);
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

    var query = "Select tblalarm.* , tblvehicle.iduser, tblvehicle.Name, tblvehicle.IsOnline from tblalarm left join tblvehicle On tblvehicle.deviceid = tblalarm.DeviceId " + search + Orderby;
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
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Fence Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Time</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; >Fence Status</th></tr>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Over Speed(Times)</th></tr>' +
            '</thead><tbody>';

        if (response != undefined) {
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
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + FenceName.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + TIme.toString() + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + FenceStatus.toString() + '</td>' +
                            '</tr>';
                        // }

                        GetData(i + 1);
                        // })

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
                        // Address = "N/A";
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
    var query = "SELECT  tblgpsdata.Datetime, tblgpsdata.Date, tblgpsdata.Latitude, tblgpsdata.Longitude, tblgpsdata.DeviceId, tblgpsdata.IsEngine, tblgpsdata.Speed,tblgpsdata.GPSPositioning, tblvehicle.Name, tblvehicle.iduser FROM tblgpsdata LEFT JOIN tblvehicle ON tblvehicle.deviceid = tblgpsdata.DeviceId " + search;
    // console.log(query)
    query += Orderby;
    connection.query(query, function(err, response) {
        // console.log(response.length)
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
                        // response[k].StartTimeold = new Date(response[k].Date * 1000);
                        // response[k].Status = 'Engine On';
                        // response[k].StartTime = momentz.utc(new Date(response[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                        //moment(new Date(response[k].Date * 1000)).format('DD-MM-YYYY hh:mm:ss a');
                        // console.log("on..", response[k].Id);
                        // Array.push(response[k]);
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
                    //momentz.utc(new Date(response[response.length - 1].Date * 1000)).format('DD-MM-YYYY hh:mm:ss a');
                    Array[j].ContinueTime = calcDateDiff(Array[j].EndTime, Array[j].StartTime);
                    if (Array[j].Status == 'Engine On') {
                        TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(response[response.length - 1].StartTimeold), moment(Array[j].StartTimeold));
                    }

                }

                // if (j != Array.length - 1) {

                //     DatewiseTravelledDistance = distance(parseFloat(Array[j].Latitude), parseFloat(Array[j].Longitude), parseFloat(Array[j + 1].Latitude), parseFloat(Array[j + 1].Longitude))
                // } else {
                //     DatewiseTravelledDistance = 0;
                // }
                // Array[j].Mileage = DatewiseTravelledDistance;
            }
            //console.log("Engineon time....", calhrminsecfromsec(TotalEngineOnTime))
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
    // var query = "SELECT tblgpsdata.Id, tblgpsdata.Datetime, tblgpsdata.Date, tblgpsdata.Latitude, tblgpsdata.Longitude, tblgpsdata.DeviceId, tblgpsdata.IsEngine, tblgpsdata.Speed, tblvehicle.Name, tblvehicle.iduser FROM tblgpsdata LEFT JOIN tblvehicle ON tblvehicle.deviceid = tblgpsdata.DeviceId " + search;
    // query += Orderby;
    var query = "SELECT  tblgpsdata.Datetime, tblgpsdata.Date, tblgpsdata.Latitude, tblgpsdata.Longitude, tblgpsdata.DeviceId, tblgpsdata.IsEngine, tblgpsdata.Speed,tblgpsdata.GPSPositioning, tblvehicle.Name, tblvehicle.iduser FROM tblgpsdata LEFT JOIN tblvehicle ON tblvehicle.deviceid = tblgpsdata.DeviceId " + search;
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
                        // response[k].StartTimeold = new Date(response[k].Date * 1000);
                        // response[k].Status = 'Engine On';
                        // response[k].StartTime = momentz.utc(new Date(response[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                        //moment(new Date(response[k].Date * 1000)).format('DD-MM-YYYY hh:mm:ss a');
                        // console.log("on..", response[k].Id);
                        // Array.push(response[k]);
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
                    Array[j].ContinueTime = calcDateDiff(Array[j].EndTime, Array[j].StartTime);
                    if (Array[j].Status == 'Engine On') {
                        TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(Array[j + 1].StartTimeold), moment(Array[j].StartTimeold));
                    }

                } else {
                    Array[j].EndTime = momentz.utc(new Date(response[response.length - 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                    //momentz.utc(new Date(response[response.length - 1].Date * 1000)).format('DD-MM-YYYY hh:mm:ss a');
                    Array[j].ContinueTime = calcDateDiff(Array[j].EndTime, Array[j].StartTime);
                    if (Array[j].Status == 'Engine On') {
                        TotalEngineOnTime = TotalEngineOnTime + calcDateDiffCalInSec(moment(response[response.length - 1].StartTimeold), moment(Array[j].StartTimeold));
                    }

                }

                // if (j != Array.length - 1) {

                //     DatewiseTravelledDistance = distance(parseFloat(Array[j].Latitude), parseFloat(Array[j].Longitude), parseFloat(Array[j + 1].Latitude), parseFloat(Array[j + 1].Longitude))
                // } else {
                //     DatewiseTravelledDistance = 0;
                // }
                // Array[j].Mileage = DatewiseTravelledDistance;
            }
            if (Array.length > 0) {
                var data = u.sortBy(Array, function(num) { return new Date(num.StartTime) }) //.reverse();
                lstEngine = data;
            }
            // for (var k = 0; k < response.length; k++) {

            //     if (response[k].IsEngine == 1) {
            //         if (COuntEngineOn == 0) {
            //             lstEngine.push(response[k]);
            //             COuntEngineOff = 0;
            //             COuntEngineOn = COuntEngineOn + 1;
            //         } else {
            //             COuntEngineOff = 0;
            //             COuntEngineOn = COuntEngineOn + 1;
            //         }
            //     } else {
            //         if (COuntEngineOff == 0) {
            //             lstEngine.push(response[k]);
            //             COuntEngineOn = 0;
            //             COuntEngineOff = COuntEngineOff + 1;

            //         } else {
            //             COuntEngineOn = 0;
            //             COuntEngineOff = COuntEngineOff + 1;
            //         }

            //     }

            // }

            //  function GetData(i) {
            for (var i = 0; i < lstEngine.length; i++) {

                var row = [];
                var Name = '';
                var Status = '';
                var ContinueTime = '';
                var StartTime = '';
                var EndTime = '';
                var Mileage = 0.00;
                var DatewiseTravelledDistance = 0;
                if (lstEngine[i].Name != null && lstEngine[i].Name != '' && lstEngine[i].Name != undefined) {
                    Name = lstEngine[i].Name;
                }

                // if (lstEngine[i].IsEngine != null && lstEngine[i].IsEngine != '' && lstEngine[i].IsEngine != undefined) {
                //     if (lstEngine[i].IsEngine == 1) {
                //         Status = 'Engine On';
                //     } else {
                //         Status = 'Engine Off';
                //     }
                // } else {
                //     Status = 'Engine Off';
                // }
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
                // Array[j].StartTime = Array[j].DisplayDate;

                // if (i != lstEngine.length - 1) {
                //     if (lstEngine[i].Date != null && lstEngine[i].Date != '' && lstEngine[i].Date != undefined) {
                //         StartTime = momentz.utc(new Date(lstEngine[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                //         EndTime = momentz.utc(new Date(lstEngine[i + 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                //         ContinueTime = calcDateDiff(EndTime, StartTime);
                //         // Datetime = dateformat(response[i].Datetime, 2);
                //     }
                //     if (lstEngine[i].Latitude != undefined && lstEngine[i].Latitude != null && lstEngine[i].Latitude != '' && lstEngine[i].Longitude != undefined && lstEngine[i].Longitude != null && lstEngine[i].Longitude != '') {
                //         DatewiseTravelledDistance = distance(parseFloat(lstEngine[i].Latitude), parseFloat(lstEngine[i].Longitude), parseFloat(lstEngine[i + 1].Latitude), parseFloat(lstEngine[i + 1].Longitude))
                //         Mileage = parseFloat(DatewiseTravelledDistance).toFixed(2);
                //     }

                // } else {
                //     if (lstEngine[i].Date != null && lstEngine[i].Date != '' && lstEngine[i].Date != undefined) {
                //         StartTime = momentz.utc(new Date(lstEngine[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                //         // EndTime = moment(new Date(response[response.length - 1].Date * 1000)).format('DD-MM-YYYY hh:mm:ss a');
                //         EndTime = momentz.utc(new Date(response[response.length - 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                //         ContinueTime = calcDateDiff(EndTime, StartTime);
                //     }
                //     DatewiseTravelledDistance = 0;
                //     Mileage = parseFloat(DatewiseTravelledDistance).toFixed(2);
                // }

                row.push(Name.toString(), Status.toString(), ContinueTime.toString(), StartTime.toString(), EndTime.toString(), Mileage.toString());
                conf.rows.push(row);

                /*setTimeout(function() {
                    GetData(i + 1);
                }, 10)*/

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
    var query = "SELECT  tblgpsdata.Datetime, tblgpsdata.Date, tblgpsdata.Latitude, tblgpsdata.Longitude, tblgpsdata.DeviceId, tblgpsdata.IsEngine, tblgpsdata.Speed,tblgpsdata.GPSPositioning, tblvehicle.Name, tblvehicle.iduser FROM tblgpsdata LEFT JOIN tblvehicle ON tblvehicle.deviceid = tblgpsdata.DeviceId " + search;
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
/*================ LastPosition Report Start====================*/
router.get('/GetAllVehicleLastPositionByUserIdWebApp', jsonParser, function(req, res) {
    var WhereCondition = '';
    // var StartDate = req.query.StartDate;
    // var EndDate = req.query.EndDate;
    var StartDate = req.query.TodayStartDateTime;
    var EndDate = req.query.TodayEndDateTime;

    var convertDate = convertdateformatForUnix(StartDate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(EndDate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    if (StartDate != '' && EndDate != '' && StartDate != 'Invalid date' && EndDate != 'Invalid date') {
        /*StartDate = momentz(StartDate).format('YYYY-MM-DD HH:mm:ss');
        EndDate = momentz(EndDate).format('YYYY-MM-DD HH:mm:ss');
        console.log(StartDate, "---", EndDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        console.log(unixStartdate, "------", unixEndDate)*/
        if (WhereCondition == '') {
            WhereCondition = 'where Date>="' + unixStartdate + '" and Date<="' + unixEnddate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date>="' + unixStartdate + '" and Date<="' + unixEnddate + '" ';
        }
    } else if (StartDate != null && StartDate != '' && StartDate != 'Invalid date') {
        // StartDate = momentz(StartDate).format('YYYY-MM-DD HH:mm:ss');
        // var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        if (WhereCondition == '') {
            WhereCondition = 'where Date>="' + unixStartdate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date>="' + unixStartdate + '" ';
        }
    } else if (EndDate != null && EndDate != '' && EndDate != 'Invalid date') {
        // EndDate = momentz(EndDate).format('YYYY-MM-DD HH:mm:ss');
        // var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        if (WhereCondition == '') {
            WhereCondition = 'where Date<="' + unixEnddate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date<="' + unixEnddate + '" ';
        }
    }
    // var query = "SELECT  tb.*,tpg.IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction FROM tblvehicle tb Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM (SELECT DeviceId, Date FROM tblgpsdata " + WhereCondition + "ORDER BY Date DESC) d GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate WHERE iduser=" + req.query.UserId + " and IsDelete=false group by tb.deviceid order by Name LIMIT " + req.query.length + " OFFSET " + req.query.start + ";"
    var query = "SELECT  tb.*,tpg.IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction" +
        " FROM tblvehicle tb left join tblsharedevice tsd ON tsd.idVehicle = tb.id Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId " +
        " INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM " +
        " (SELECT DeviceId, Date FROM tblgpsdata " + WhereCondition + "ORDER BY Date DESC) d GROUP BY DeviceId) " +
        " b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate WHERE " +
        " (tb.iduser=" + req.query.UserId + " OR tsd.idUser=" + req.query.UserId + ") and IsDelete=false " +
        " group by tb.deviceid order by Name LIMIT " + req.query.length + " OFFSET " + req.query.start + ";"
        // console.log(query);
    var count = "SELECT count(*) FROM tblvehicle tb left join tblsharedevice tsd ON tsd.idVehicle = tb.id" +
        " Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN" +
        " (SELECT DeviceId, MAX(Date) as maxDate FROM " +
        " (SELECT DeviceId, Date FROM tblgpsdata " + WhereCondition + "ORDER BY Date DESC) d GROUP BY DeviceId)" +
        " b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate WHERE " +
        " (tb.iduser=" + req.query.UserId + " OR tsd.idUser=" + req.query.UserId + ") and IsDelete=false group by tb.deviceid;";
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            // for (var i = 0; i < rows.length; i++) {
            //     console.log(rows[i].Date);
            //     rows[i].Time = momentz.utc(new Date(rows[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
            //     console.log(rows[i].Time);
            //     // momentz.utc(rows[i].Date * 1000).format('DD-MM-YYYY HH:mm:ss a')
            // }
            connection.query(count, function(error, count, fields) {
                res.json({ success: true, data: rows, Totalrecord: count.length });
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
            caption: 'Assest Name',
            type: 'string'
        }, {
            caption: 'Device Id',
            type: 'string'
        }, {
            caption: 'Time',
            type: 'string'
        },
        // {
        //     caption: 'Address',
        //     type: 'string'
        // }, 
        {
            caption: 'Device Status',
            type: 'string'
        }, {
            caption: 'Engine',
            type: 'string'
        },
        // {
        //     caption: 'Door',
        //     type: 'string'
        // },
        {
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
        // StartDate = new Date(StartDate);
        // EndDate = new Date(EndDate);
        // var StartDate1 = momentz.utc(StartDate).format('YYYY-MM-DD HH:mm:ss');
        // var EndDate1 = momentz.utc(EndDate).format('YYYY-MM-DD HH:mm:ss');
        // var unixStartdate = new Date(StartDate1.replace(' ', 'T')).getTime() / 1000;
        // var unixEndDate = new Date(EndDate1.replace(' ', 'T')).getTime() / 1000;

        if (WhereCondition == '') {
            WhereCondition = 'where Date>="' + unixStartdate + '" and Date<="' + unixEnddate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date>="' + unixStartdate + '" and Date<="' + unixEnddate + '" ';
        }
    } else if (StartDate != null && StartDate != '' && StartDate != 'Invalid date') {
        // StartDate = new Date(StartDate);
        // var StartDate1 = momentz.utc(StartDate).format('YYYY-MM-DD HH:mm:ss');
        // var unixStartdate = new Date(StartDate1.replace(' ', 'T')).getTime() / 1000;
        if (WhereCondition == '') {
            WhereCondition = 'where Date>="' + unixStartdate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date>="' + unixStartdate + '" ';
        }
    } else if (EndDate != null && EndDate != '' && EndDate != 'Invalid date') {
        // EndDate = new Date(EndDate);
        // var EndDate1 = momentz.utc(EndDate).format('YYYY-MM-DD HH:mm:ss');
        // var unixEndDate = new Date(EndDate1.replace(' ', 'T')).getTime() / 1000;
        if (WhereCondition == '') {
            WhereCondition = 'where Date<="' + unixEnddate + '" ';
        } else {
            WhereCondition = WhereCondition + 'and Date<="' + unixEnddate + '" ';
        }
    }
    var query = "SELECT  tb.*,tpg.IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction" +
        " FROM tblvehicle tb left join tblsharedevice tsd ON tsd.idVehicle = tb.id Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId " +
        " INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM " +
        " (SELECT DeviceId, Date FROM tblgpsdata " + WhereCondition + "ORDER BY Date DESC) d GROUP BY DeviceId) " +
        " b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate WHERE " +
        " (tb.iduser=" + req.query.UserId + " OR tsd.idUser=" + req.query.UserId + ") and IsDelete=false " +
        " group by tb.deviceid order by Name";
    // connection.query("SELECT  tb.*,tpg.IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction FROM tblvehicle tb Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM (SELECT DeviceId, Date FROM tblgpsdata " + WhereCondition + "ORDER BY Date DESC) d GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate WHERE iduser=" + req.query.UserId + " and IsDelete=false group by tb.deviceid order by Name;", function(err, rows, fields) {
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
                        var Direction = ListPostionData[i].Direction.toString() + ' Degree';;
                    } else {
                        var Direction = "0" + ' Degree';
                    }

                    if (res.length > 0) {
                        // var Address = res[0].formattedAddress;
                        conf.rows.push([AssestName, DeviceId, Time, DeviceStatus, Engine, Speed, Latitude, Longitude, Direction]);
                    } else {
                        // var Address = "N/A";
                        conf.rows.push([AssestName, DeviceId, Time, DeviceStatus, Engine, Speed, Latitude, Longitude, Direction]);
                    }
                    AddList(i + 1);

                    // });

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
                            // ListPostionData[i].IsOnline.toString();
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
                        var Direction = ListPostionData[i].Direction.toString();
                    } else {
                        var Direction = "0";
                    }
                    // var Address = "N/A";
                    conf.rows.push([AssestName, DeviceId, Time, DeviceStatus, Engine, Speed, Latitude, Longitude, Direction]);
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
    var query = "SELECT  tb.*,tpg.IsEngine,tpg.IsDoor, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction" +
        " FROM tblvehicle tb left join tblsharedevice tsd ON tsd.idVehicle = tb.id Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId " +
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
    // var table = '<h2 style="text-align:center"><b>Last Position Report</b></h2><h5 style="text-align:right">' + TodayDate + '</h5><hr/><table style="width:100%">' +
    //     '<tr><th style="text-align:left">No</th>' +
    //     '<th style="text-align:left">Asset Name</th>' +
    //     '<th style="text-align:left">Device Id</th>' +
    //     '<th style="text-align:left">Time</th>' +
    //     '<th style="text-align:left">Device Status</th>' +
    //     '<th style="text-align:left">Engine</th>' +
    //     '<th style="text-align:left">Speed</th>' +
    //     '<th style="text-align:left">Latitude</th>' +
    //     '<th style="text-align:left">Longitude</th>' +
    //     '<th style="text-align:left">Direction</th></tr>';


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
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Device Id</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Time</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Device Status</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Engine</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Speed</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Latitude</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Longitude</th>' +
        '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Direction</th></tr>' +
        '</thead><tbody>';

    function ExportData(ListPostionData) {

        function AddList(i) {
            if (i < ListPostionData.length) {

                if (ListPostionData[i].Latitude != undefined && ListPostionData[i].Latitude != null && ListPostionData[i].Latitude != '' && ListPostionData[i].Longitude != undefined && ListPostionData[i].Longitude != null && ListPostionData[i].Longitude != '') {
                    // geocoder.reverse({ lat: ListPostionData[i].Latitude, lon: ListPostionData[i].Longitude }, function(err, res) {
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
                        var Direction = ListPostionData[i].Direction.toString() + ' Degree';;
                    } else {
                        var Direction = "0" + ' Degree';
                    }

                    if (res.length > 0) {
                        // var Address = res[0].formattedAddress;
                        table += '<tr>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                            ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + AssestName + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DeviceId + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Time + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DeviceStatus + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Engine + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Latitude + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Longitude + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Direction + '</td>' +
                            '</tr>';
                        conf.rows.push([AssestName, DeviceId, Time, DeviceStatus, Engine, Speed, Latitude, Longitude, Direction]);
                    } else {
                        // var Address = "N/A";
                        table += '<tr>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                            ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + AssestName + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DeviceId + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Time + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DeviceStatus + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Engine + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Latitude + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Longitude + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Direction + '</td>' +
                            '</tr>';
                    }
                    AddList(i + 1);

                    // });

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
                            // ListPostionData[i].IsOnline.toString();
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
                        var Direction = ListPostionData[i].Direction.toString();
                    } else {
                        var Direction = "0";
                    }
                    // var Address = "N/A";
                    table += '<tr>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                        ' <td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + AssestName + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DeviceId + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Time + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + DeviceStatus + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Engine + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Speed + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Latitude + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + Longitude + '</td>' +
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
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    var Count = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
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
    // var query = "select tblgpsdata.*,tblvehicle.Name from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + "  and tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + ' order by tblgpsdata.Date ASC' + ";"
    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
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

        function GetData(i) {
            var row = [];
            if (i < Array.length) {

                var Name = 'N/A';
                var StartTime = 'N/A';
                var EndTime = 'N/A';
                var Address = 'N/A';
                var ParkingTime = 'N/A';
                var Direction = 0.00;
                var Latitude = 0.00;
                var Longitude = '';

                if (Array[i].Latitude != undefined && Array[i].Latitude != null && Array[i].Latitude != '' && Array[i].Longitude != undefined && Array[i].Longitude != null && response[i].Longitude != '') {
                    geocoder.reverse({ lat: Array[i].Latitude, lon: Array[i].Longitude }, function(err, res) {
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
                        if (!err || res != null) {
                            if (res.length > 0) {
                                Address = res[0].formattedAddress;
                                row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString());
                                // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString(), Latitude, Longitude);
                            } else {
                                Address = "N/A";
                                row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString());
                                // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString(), Latitude, Longitude);
                            }
                        } else {
                            Address = "N/A";
                            row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address);
                            // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address, Latitude, Longitude);
                        }
                        conf.rows.push(row);
                        GetData(i + 1);
                    })
                } else {
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
                    row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address);
                    // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address, Latitude, Longitude);
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
    // var query = "select tblgpsdata.*,tblvehicle.Name from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + "  and tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + ' order by tblgpsdata.Date ASC' + ";"
    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
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

        // var table = '<h2 style="text-align:center"><b>Parking Report</b></h2><h5 style="text-align:right">' + TodayDate + '</h5><hr/><table style="width:100%">' +
        //     '<tr><th style="text-align:left">No</th>' +
        //     '<th style="text-align:left">Asset Name</th>' +
        //     '<th style="text-align:left">Start Time</th>' +
        //     '<th style="text-align:left">End Time</th>' +
        //     '<th style="text-align:left">Parking Time</th>' +
        //     '<th style="text-align:left">Address</th></tr>';

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
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Start Time</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">End Time</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Parking Time</th>' +
            '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Address</th></tr>' +
            '</thead><tbody>';

        function GetData(i) {
            var row = [];
            if (i < Array.length) {

                var Name = 'N/A';
                var StartTime = 'N/A';
                var EndTime = 'N/A';
                var Address = 'N/A';
                var ParkingTime = 'N/A';
                var Direction = 0.00;
                var Latitude = 0.00;
                var Longitude = '';

                if (Array[i].Latitude != undefined && Array[i].Latitude != null && Array[i].Latitude != '' && Array[i].Longitude != undefined && Array[i].Longitude != null && response[i].Longitude != '') {
                    geocoder.reverse({ lat: Array[i].Latitude, lon: Array[i].Longitude }, function(err, res) {

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
                        if (!err || res != null) {
                            if (res.length > 0) {
                                Address = res[0].formattedAddress;
                                // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString());
                                table += '<tr>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + StartTime + '</td>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + EndTime + '</td>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + ParkingTime.toString() + '</td>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Address.toString() + '</td>' +
                                    '</tr>';
                                // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString(), Latitude, Longitude);
                            } else {
                                Address = "N/A";
                                table += '<tr>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + StartTime + '</td>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + EndTime + '</td>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + ParkingTime.toString() + '</td>' +
                                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Address.toString() + '</td>' +
                                    '</tr>';
                                // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString());
                                // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address.toString(), Latitude, Longitude);
                            }
                        } else {
                            Address = "N/A";
                            table += '<tr>' +
                                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
                                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + StartTime + '</td>' +
                                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + EndTime + '</td>' +
                                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + ParkingTime.toString() + '</td>' +
                                '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Address.toString() + '</td>' +
                                '</tr>';
                            // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address);
                            // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address, Latitude, Longitude);
                        }
                        GetData(i + 1);
                    })
                } else {
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
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name.toString() + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + StartTime + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + EndTime + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + ParkingTime.toString() + '</td>' +
                        '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + Address.toString() + '</td>' +
                        '</tr>';
                    // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address);
                    // row.push(Name.toString(), StartTime, EndTime, ParkingTime.toString(), Address, Latitude, Longitude);
                    GetData(i + 1);
                }

            } else {
                // table += '<tr><td>Total:</td><td></td><td></td><td></td><td>' + TotalAllParkingTime + '</td><td></td></tr></table>'

                table += '  <tfoot style="font-weight: bold;">' +
                    ' <tr>' +
                    ' <td style="padding: 8px 5px; border-bottom: 1px dotted #000; border-right: 1px dotted #000;" colspan="2">Total:</td>' +
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
        "gps.id,gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
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
                            // if (lstGroup[i].data[k].IsEngine == 1) {
                            //     if ((k + 1) < lstGroup[i].data.length) {
                            //         obj.Mileage = obj.Mileage + parseFloat(distance(parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude), parseFloat(lstGroup[i].data[k + 1].Latitude), parseFloat(lstGroup[i].data[k + 1].Longitude)))
                            //     }
                            // }
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
                                // if (IsDriving == 0) {
                                //     DrivingStartPosition = k;
                                // }
                                // IsDriving = 1;
                                if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (IsDriving == 0) {
                                        DrivingStartPosition = k;
                                    }
                                    IsDriving = 1;
                                }
                                // } else {
                                //     if (IsDriving == 1) {
                                //         IsDriving = 0;
                                //         TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                                //     }
                                // }
                            } else {
                                Engineco = 0;
                                if (IsEngineOn == 1) {
                                    IsEngineOn = 0;
                                    // console.log(lstGroup[i].data[EngineOnStartPosition].Id, "--", lstGroup[i].data[k].Id);
                                    // console.log(momentz.utc(lstGroup[i].data[EngineOnStartPosition].Date).tz(req.query.TimeZone).format('DD-MM-YYYY'), "--", momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY'));
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
            caption: 'Invalid Location',
            type: 'number'
        }, {
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
            caption: 'Over Speed(times)',
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
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        "Where  gps.Date >= '" + unixStartdate + "' and gps.Date <= '" + unixEnddate + "'" +
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


                        if (Array[i].Date != null && Array[i].Date != '' && Array[i].Date != undefined) {
                            Date = Array[i].Date;
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


                        row.push(Name, Date, DrivingTime, ParkingTime, TotalTime, InvalidLocation, Mileage, AverageSpeed, HighestSpeed, OverSpeed, AlarmNumber, EnginOnTime /*, DoorOpenNumber, DoorOpenTime, ShockNumber, ShockTime, EngineOnNumber*/ );
                        conf.rows.push(row);
                        GetData(i + 1);

                    } else {
                        row.push('Total:', '', TotalAllDrivingTime, TotalAllParkingTime, TotalAllTime, '', '', '', '', '', '', TotalAllEngineOnTime);
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
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        "Where  gps.Date >= '" + unixStartdate + "' and gps.Date <= '" + unixEnddate + "'" +
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
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Date</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Driving Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Parking Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Total Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Invalid Location</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Mileage(km)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Average Speed(km/h)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Max Speed(km/h)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Over Speed(times)</th>' +
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


                        if (Array[i].Date != null && Array[i].Date != '' && Array[i].Date != undefined) {
                            Date = Array[i].Date;
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
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Name + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Date + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + DrivingTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + ParkingTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + TotalTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + InvalidLocation + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + Mileage + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + AverageSpeed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + HighestSpeed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + OverSpeed + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + AlarmNumber + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">' + EnginOnTime + '</td>' +
                            '</tr>';
                        // row.push(Name, Date, DrivingTime, ParkingTime, TotalTime, InvalidLocation, Mileage, AverageSpeed, HighestSpeed, OverSpeed, AlarmNumber, EnginOnTime /*, DoorOpenNumber, DoorOpenTime, ShockNumber, ShockTime, EngineOnNumber*/ );
                        GetData(i + 1);

                    } else {


                        table += '</tbody>  <tfoot style="font-weight: bold;">' +
                            ' <tr>' +
                            ' <td style="padding: 8px 5px; border-bottom: 1px dotted #000; border-right: 1px dotted #000;" colspan="2">Total:</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + TotalAllDrivingTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + TotalAllParkingTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">' + TotalAllTime + '</td>' +
                            '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;"></td>' +
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
        //days + ' days, ' + hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds';
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

function calcDateDiffCalInSec(date1, date2) {

    var l = moment.duration(date1.diff(date2, 'milliseconds'));

    var diff = l.asMilliseconds();

    var seconds = Math.floor(diff / 1000);

    return seconds
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
module.exports = router