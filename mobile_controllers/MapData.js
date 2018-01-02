var router = express.Router();
var Fence = models.tblfence;
var momentz = require('moment-timezone');
var CanbusData = models.tblcanbusdata;
var DrivingData = models.tbldrivingdata;

//------------webapp:- export history data-----------------
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

    var query = "select Id,Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction, DeviceId,IsEngine, Date from tblgpsdata where deviceid=" + req.query.DeviceId + " and Date >= '" + unixStartdate + "' and Date <= '" + unixEnddate + "' order by Date;"

    connection.query(query, function(err, response) {
        conf.rows = [];
        // var lstTemp = [];
        // for (var i = 0; i < response.length; i++) {
        //     if (response[i].IsEngine == true) {
        //         COuntEngineOff = 0;
        //         lstTemp.push(response[i]);
        //     } else {
        //         if (COuntEngineOff == 0) {
        //             lstTemp.push(response[i]);
        //         }
        //         COuntEngineOff = COuntEngineOff + 1;
        //     }
        // }

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

//----------webapp:- Get all fence ----------------
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

//------------------------webapp:- find canvas data of vehicle info------------------
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

//-----------------webapp:- find Driving data of vehicle info-------
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

//-----------------webapp:-delete fence-------
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