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
    console.log(wherecondition);
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
    console.log(query);
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
    console.log(req.query);
    var Startdate = req.query.StartDate;
    var Enddate = req.query.EndDate;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;



    var query = "select tblgpsdata.*,tblvehicle.Name from tblgpsdata left join tblvehicle on tblgpsdata.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + " and tblgpsdata.GPSPositioning='A' and tblgpsdata.Date >= '" + unixStartdate + "' and tblgpsdata.Date <= '" + unixEnddate + "'" + wherecondition + " order by Datetime;"
    console.log(query);
    connection.query(query, function(err, response) {
        conf.rows = [];
        console.log("Lenth....", response.length);
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
                console.log(Name.toString(), TIme.toString(), Address.toString(), DeviceStatus.toString(), AssetStatus.toString(), Speed, Fuleper, Fulelett, Mileage, Temp, GPSSignal.toString(), Direction, Latitude, Longitude);

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

module.exports = router