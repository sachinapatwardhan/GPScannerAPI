var router = express.Router();
var User = models.tbluserinformation;
var Gps = models.tblgpsdata;
var GpsDevice = models.tblgpsdevice;
var Alarm = models.tblalarm;
var Bike = models.tblvehicle;
//gpsdata

router.get('/GetAllGpsData', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];
        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                if (columnName != 'id') {
                    search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                }
            };
        };
    }

    search['$and'] = [];
    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != undefined) {
        var obj = new Object();
        obj['DeviceId'] = {
            $eq: DeviceId
        };
        search['$and'].push(obj);
    }

    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var obj = new Object();
        obj['Date'] = {
            $between: [unixStartdate, unixEndDate]
        };
        search['$and'].push(obj);
    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var obj = new Object();
        obj['Date'] = {
            $gt: unixStartdate
        };
        search['$and'].push(obj);
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var obj = new Object();
        obj['Date'] = {
            $lt: unixEndDate
        };
        search['$and'].push(obj);
    }


    // var StartDate = objParam.StartDate;
    // var EndDate = objParam.EndDate;
    // if (StartDate != '' && EndDate != '') {
    //     StartDate = convertdateUTCformat(StartDate);
    //     EndDate = convertdateUTCformat(EndDate);
    //     var obj = new Object();
    //     obj['CreatedDate'] = {
    //         $between: [StartDate, EndDate]
    //     };
    //     search['$and'].push(obj);
    // } else if (StartDate != null && StartDate != '') {
    //     StartDate = convertdateUTCformat(StartDate);
    //     var obj = new Object();
    //     obj['CreatedDate'] = {
    //         $gt: StartDate
    //     };
    //     search['$and'].push(obj);
    // } else if (EndDate != null && EndDate != '') {
    //     EndDate = convertdateUTCformat(EndDate);
    //     var obj = new Object();
    //     obj['CreatedDate'] = {
    //         $lt: EndDate
    //     };
    //     search['$and'].push(obj);
    // }
    Gps.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
    }).then(function(response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function(error) {
        res.json(error);
    })
})


//AlarmData
router.get('/GetAllAlarm', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = {};
    var search1 = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];
        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                if (columnName != 'id' && columnName != 'AlarmCode') {
                    search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                }
            };
        };
    }
    search['$and'] = [];
    var DeviceId = objParam.DeviceId;

    if (DeviceId != null && DeviceId != '' && DeviceId != undefined) {
        var obj1 = new Object();
        obj1['DeviceId'] = {
            $eq: parseInt(DeviceId)
        };
        search['$and'].push(obj1);
    }

    var AlarmCode = objParam.AlarmCode;

    if (AlarmCode != null && AlarmCode != undefined && AlarmCode != '') {
        var obj2 = new Object();
        obj2['AlarmCode'] = {
            $eq: parseInt(AlarmCode)
        };
        search['$and'].push(obj2);
    }

    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var obj = new Object();
        obj['Date'] = {
            $between: [unixStartdate, unixEndDate]
        };
        search['$and'].push(obj);
    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var obj = new Object();
        obj['Date'] = {
            $gt: unixStartdate
        };
        search['$and'].push(obj);
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var obj = new Object();
        obj['Date'] = {
            $lt: unixEndDate
        };
        search['$and'].push(obj);
    }
    Alarm.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
    }).then(function(response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllGpsDevice', function(req, res) {
    GpsDevice.findAll().then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json(err);
    })
});


router.get('/ExportAllGpsData', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
            caption: 'DeviceId',
            type: 'string'
        }, {
            caption: 'Datetime',
            type: 'string'
        }, {
            caption: 'Latitude',
            type: 'string'
        }, {
            caption: 'Longitude',
            type: 'string'
        }, {
            caption: 'GPSPositioning',
            type: 'string'
        }, {
            caption: 'Speed',
            type: 'string'
        }, {
            caption: 'Direction',
            type: 'string'
        }, {
            caption: 'Status',
            type: 'string'
        }, {
            caption: 'IsRelayToStopTheCar',
            type: 'string'
        }, {
            caption: 'IsSirenSound',
            type: 'string'
        }, {
            caption: 'IsLockTheDoor',
            type: 'string'
        }, {
            caption: 'IsUnlockTheDoor',
            type: 'string'
        }, {
            caption: 'IsSOS',
            type: 'string'
        }, {
            caption: 'IsDoor',
            type: 'string'
        }, {
            caption: 'IsEngine',
            type: 'string'
        }, {
            caption: 'CreatedDate',
            type: 'string'
        }, {
            caption: 'Altitude',
            type: 'string'
        }, {
            caption: 'AD1',
            type: 'string'
        },
        {
            caption: 'AD2',
            type: 'string'
        }, {
            caption: 'OdoMeter',
            type: 'string'
        }
    ];



    var objParam = req.query;
    var Orderby = 'CreatedDate asc';
    var search = {};


    search['$and'] = [];
    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != undefined) {
        var obj = new Object();
        obj['DeviceId'] = {
            $eq: DeviceId
        };
        search['$and'].push(obj);
    }
    var StartDate = objParam.StartDate;
    var EndDate = objParam.EndDate;
    if (StartDate != '' && EndDate != '' && StartDate != undefined && EndDate != undefined) {
        StartDate = convertdateUTCformat(StartDate);
        EndDate = convertdateUTCformat(EndDate);
        var obj = new Object();
        obj['CreatedDate'] = {
            $between: [StartDate, EndDate]
        };
        search['$and'].push(obj);
    } else if (StartDate != null && StartDate != '' && StartDate != undefined) {
        StartDate = convertdateUTCformat(StartDate);
        var obj = new Object();
        obj['CreatedDate'] = {
            $gt: StartDate
        };
        search['$and'].push(obj);
    } else if (EndDate != null && EndDate != '' && EndDate != undefined) {
        EndDate = convertdateUTCformat(EndDate);
        var obj = new Object();
        obj['CreatedDate'] = {
            $lt: EndDate
        };
        search['$and'].push(obj);
    }

    Gps.findAll({
        where: search,
        order: Orderby,
    }).then(function(response) {
        conf.rows = [];
        var DeviceId = '';
        var Datetime = '';
        var Latitude = '';
        var Longitude = '';
        var GPSPositioning = '';
        var Speed = '';
        var Direction = '';
        var Status = '';
        var IsRelayToStopTheCar = false;
        var IsSirenSound = false;
        var IsLockTheDoor = false;
        var IsUnlockTheDoor = false;
        var IsSOS = false;
        var IsDoor = false;
        var IsEngine = false;
        var CreatedDate = '';
        var Altitude = '';
        var AD1 = '';
        var AD2 = '';
        var OdoMeter = '';
        GetGpsData(0);

        function GetGpsData(i) {
            if (i < response.length) {
                var row = [];
                if (response[i].DeviceId != null && response[i].DeviceId != '' && response[i].DeviceId != undefined) {
                    DeviceId = response[i].DeviceId;
                }

                if (response[i].Datetime != null && response[i].Datetime != '' && response[i].Datetime != undefined) {
                    Datetime = convertdateformat(response[i].Datetime, 2);
                }

                if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                    Latitude = response[i].Latitude
                }

                if (response[i].Longitude != null && response[i].Longitude != '' && response[i].Longitude != undefined) {
                    Longitude = response[i].Longitude;
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

                if (response[i].Status != null && response[i].Status != '' && response[i].Status != undefined) {
                    Status = response[i].Status;
                }

                if (response[i].IsRelayToStopTheCar != null && response[i].IsRelayToStopTheCar != '' && response[i].IsRelayToStopTheCar != undefined) {
                    IsRelayToStopTheCar = response[i].IsRelayToStopTheCar;
                }
                if (response[i].IsSirenSound != null && response[i].IsSirenSound != '' && response[i].IsSirenSound != undefined) {
                    IsSirenSound = response[i].IsSirenSound;
                }
                if (response[i].IsLockTheDoor != null && response[i].IsLockTheDoor != '' && response[i].IsLockTheDoor != undefined) {
                    IsLockTheDoor = response[i].IsLockTheDoor;
                }
                if (response[i].IsUnlockTheDoor != null && response[i].IsUnlockTheDoor != '' && response[i].IsUnlockTheDoor != undefined) {
                    IsUnlockTheDoor = response[i].IsUnlockTheDoor;
                }
                if (response[i].IsSOS != null && response[i].IsSOS != '' && response[i].IsSOS != undefined) {
                    IsSOS = response[i].IsSOS;
                }
                if (response[i].IsDoor != null && response[i].IsDoor != '' && response[i].IsDoor != undefined) {
                    IsDoor = response[i].IsDoor;
                }
                if (response[i].IsEngine != null && response[i].IsEngine != '' && response[i].IsEngine != undefined) {
                    IsEngine = response[i].IsEngine;
                }
                if (response[i].CreatedDate != null && response[i].CreatedDate != '' && response[i].CreatedDate != undefined) {
                    CreatedDate = convertdateformat(response[i].CreatedDate, 2);
                }
                if (response[i].Altitude != null && response[i].Altitude != '' && response[i].Altitude != undefined) {
                    Altitude = response[i].Altitude;
                }
                if (response[i].AD1 != null && response[i].AD1 != '' && response[i].AD1 != undefined) {
                    AD1 = response[i].AD1;
                }
                if (response[i].AD2 != null && response[i].AD2 != '' && response[i].AD2 != undefined) {
                    AD2 = response[i].AD2;
                }
                if (response[i].OdoMeter != null && response[i].OdoMeter != '' && response[i].OdoMeter != undefined) {
                    OdoMeter = response[i].OdoMeter;
                }
                row.push(DeviceId, Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction, Status, IsRelayToStopTheCar, IsSirenSound, IsLockTheDoor, IsUnlockTheDoor, IsSOS, IsDoor, IsEngine, CreatedDate, Altitude, AD1, AD2, OdoMeter);
                conf.rows.push(row);
                GetGpsData(i + 1);
            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=GpdData.xlsx");
                res.end(result, 'binary');
            }

        }
    });
});

router.get('/ExportAlarm', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'AlarmCode',
        type: 'string'
    }, {
        caption: 'DeviceId',
        type: 'string'
    }, {
        caption: 'Latitude',
        type: 'string'
    }, {
        caption: 'Longitude',
        type: 'string'
    }, {
        caption: 'GPSPositioning',
        type: 'string'
    }, {
        caption: 'Status',
        type: 'string'
    }, {
        caption: 'CreatedDate',
        type: 'string'
    }];



    var objParam = req.query;
    var Orderby = 'CreatedDate asc';
    var search = {};


    search['$and'] = [];
    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != undefined) {
        var obj = new Object();
        obj['DeviceId'] = {
            $eq: DeviceId
        };
        search['$and'].push(obj);
    }
    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var obj = new Object();
        obj['Date'] = {
            $between: [unixStartdate, unixEndDate]
        };
        search['$and'].push(obj);
    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var obj = new Object();
        obj['Date'] = {
            $gt: unixStartdate
        };
        search['$and'].push(obj);
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var obj = new Object();
        obj['Date'] = {
            $lt: unixEndDate
        };
        search['$and'].push(obj);
    }
    var AlarmCode = objParam.AlarmCode;

    if (AlarmCode != null && AlarmCode != undefined && AlarmCode != '') {
        var obj = new Object();
        obj['AlarmCode'] = {
            $eq: AlarmCode
        };
        search['$and'].push(obj);
    }

    Alarm.findAll({
        where: search,
        order: Orderby,
    }).then(function(response) {
        conf.rows = [];
        var AlarmCode = '';
        var DeviceId = '';
        var Latitude = '';
        var Longitude = '';
        var GPSPositioning = '';
        var Status = '';
        var CreatedDate = '';
        GetAlarmData(0);

        function GetAlarmData(i) {
            if (i < response.length) {
                var row = [];
                if (response[i].AlarmCode != null && response[i].AlarmCode != '' && response[i].AlarmCode != undefined) {
                    var list = AlarmCodedata();
                    var obj = u.findWhere(list, { AlarmCode: response[i].AlarmCode });
                    if (obj != null && obj != undefined && obj != '') {
                        AlarmCode = obj.Alarm;
                    }
                }
                if (response[i].DeviceId != null && response[i].DeviceId != '' && response[i].DeviceId != undefined) {
                    DeviceId = response[i].DeviceId;
                }

                if (response[i].CreatedDate != null && response[i].CreatedDate != '' && response[i].CreatedDate != undefined) {
                    CreatedDate = convertdateformat(response[i].CreatedDate, 2);
                }

                if (response[i].Latitude != null && response[i].Latitude != '' && response[i].Latitude != undefined) {
                    Latitude = response[i].Latitude
                }

                if (response[i].Longitude != null && response[i].Longitude != '' && response[i].Longitude != undefined) {
                    Longitude = response[i].Longitude;
                }

                if (response[i].GPSPositioning != null && response[i].GPSPositioning != '' && response[i].GPSPositioning != undefined) {
                    GPSPositioning = response[i].GPSPositioning;
                }

                if (response[i].Status != null && response[i].Status != '' && response[i].Status != undefined) {
                    Status = response[i].Status;
                }


                row.push(AlarmCode, DeviceId, Latitude, Longitude, GPSPositioning, Status, CreatedDate);
                conf.rows.push(row);
                GetAlarmData(i + 1);
            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=Alarm.xlsx");
                res.end(result, 'binary');
            }

        }
    });
});

function convertdateformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;

    var firstdayDay = date.getDate();

    var firstdayYear = date.getFullYear();

    var firstdayHours = date.getMinutes();

    var firstdayMinutes = date.getMinutes();

    var firstdaySeconds = date.getSeconds();

    if (flg == 1) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "23:59:59";
    } else if (flg == "Excel Export") {
        // return moment(moment.utc(date).toDate()).format("YYYY-MM-DD hh:mm:ss");
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
    } else if (flg == 2) {
        return ("00" + firstdayDay.toString()).slice(-2) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayYear.toString()).slice(-4);
    } else {
        //return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}

function convertdateUTCformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getUTCMonth() + 1;
    var firstdayDay = date.getUTCDate();
    var firstdayYear = date.getUTCFullYear();
    var firstdayHours = date.getUTCHours();
    var firstdayMinutes = date.getUTCMinutes();
    var firstdaySeconds = date.getUTCSeconds();
    //return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
    return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
}


function AlarmCodedata() {
    var ResponseAlarm = [];
    var obj = new Object();
    obj.AlarmCode = "01";
    obj.Alarm = "SOS alarm(IN1)";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "02";
    obj.Alarm = "Line broken alarm(IN2)";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "03";
    obj.Alarm = "Door open alarm(IN3)";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "04";
    obj.Alarm = "Engine on alarm(IN4)";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "05";
    obj.Alarm = "Original triggering alarm(IN5)";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "10";
    obj.Alarm = "Law battery alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "11";
    obj.Alarm = "Over speed alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "12";
    obj.Alarm = "Movment alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "13";
    obj.Alarm = "Geo-fence alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "30";
    obj.Alarm = "Vibration alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "50";
    obj.Alarm = "External power cut alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "52";
    obj.Alarm = "Veer report";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "60";
    obj.Alarm = "Fatigue driving alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "71";
    obj.Alarm = "Crash alarm(Harsh brake)";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "71";
    obj.Alarm = "Acceleration alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "81";
    obj.Alarm = "Fuel loss alarm";
    ResponseAlarm.push(obj);
    return ResponseAlarm;

}

// -------------------------------------------------------------------report Api----------------------------------------------------

//get speedreport

router.get('/GetAllvehicleByUser', function(req, res) {
    Bike.findAll({
        where: {
            idUser: req.query.idUser
        }
    }).then(function(resbike) {
        res.json(resbike);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllSpeedDataReport', function(req, res) {
    var objParam = req.query;
    var WhereCondition = " Where Bike.idUser= " + req.query.idUser;

    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateUTCformat(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";

    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date >='" + unixStartdate + "'";
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateUTCformat(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date <='" + unixEndDate + "'";

    }
    if (objParam.Speed != null && objParam.Speed != undefined && objParam.Speed != '') {
        WhereCondition += " And Gps.Speed >= " + objParam.Speed;
    }
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " And Gps.DeviceId = " + objParam.DeviceId;
    }
    var query = "SELECT User.username,Bike.MaxSpeed,Bike.Name,Bike.IsOnline,Gps.* FROM tblvehicle  AS Bike left join  tblgpsdata AS Gps on Gps.DeviceId = Bike.deviceid left join  tbluserinformation AS User on Bike.iduser = User.id " + WhereCondition + " order by Gps.Date Desc";

    console.log("**************", query)
    connection.query(query, function(err, response, fields) {
        if (!err) {
            res.json(response)
        } else {
            res.json([])
        }
    });
})

// Export
router.get('/ExportAllSpeedDataReport', function(req, res) {

    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'Assest Name',
        type: 'string'
    }, {
        caption: 'DateTime',
        type: 'string'
    }, {
        caption: 'Speed',
        type: 'string'
    }, ];


    var objParam = req.query;
    var WhereCondition = " Where Bike.idUser= " + req.query.idUser;

    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateUTCformat(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";

    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date >='" + unixStartdate + "'";
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateUTCformat(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date <='" + unixEndDate + "'";

    }
    if (objParam.Speed != null && objParam.Speed != undefined && objParam.Speed != '') {
        WhereCondition += " And Gps.Speed >= " + objParam.Speed;
    }
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " And Gps.DeviceId = " + objParam.DeviceId;
    }


    var query = "SELECT User.username,Bike.MaxSpeed,Bike.Name,Bike.IsOnline,Gps.* FROM tblvehicle  AS Bike left join  tblgpsdata AS Gps on Gps.DeviceId = Bike.deviceid left join  tbluserinformation AS User on Bike.iduser = User.id " + WhereCondition + " order by Gps.Date Desc";
    connection.query(query, function(err, response, fields) {
        conf.rows = [];
        var Name = '';
        var DisplayDate = '';
        var Speed = '';

        GetSpeedData(0);

        function GetSpeedData(i) {
            if (i < response.length) {
                var row = [];
                if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                    Name = response[i].Name;
                }

                if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                    var Dates = new Date(response[i].Date * 1000);
                    DisplayDate = moment(Dates).format('DD-MM-YYYY hh:mm:ss a');
                }
                if (response[i].Speed != null && response[i].Speed != '' && response[i].Speed != undefined) {
                    Speed = parseFloat(response[i].Speed).toFixed(2);
                }
                row.push(Name, DisplayDate, Speed);
                conf.rows.push(row);
                GetSpeedData(i + 1);
            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=SpeedReport.xlsx");
                res.end(result, 'binary');
            }

        }
    });
})

//Get Working Hour report 
router.get('/GetAllWoringHourForReport', function(req, res) {
    var objParam = req.query;
    var WhereCondition = " Where Bike.idUser= " + req.query.idUser;

    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateUTCformat(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";

    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateUTCformat(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date <='" + unixEndDate + "'";

    }
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " And gps.DeviceId = " + objParam.DeviceId;
    }
    // WhereCondition += " And Gps.IsEngine = false";
    var query = "select " +
        "gps.*,Bike.*" +
        "from tblvehicle  As Bike " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.DeviceId,gps.Date Asc";
    connection.query(query, function(err, response, fields) {
        if (!err) {
            res.json(response)
        } else {
            res.json([])
        }
    });
})

//export Working Hour
router.get('/ExportAllWoringHourForReport', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
            caption: 'Assest Name',
            type: 'string'
        }, {
            caption: 'Driving Time',
            type: 'string'
        }, {
            caption: 'Parking Time',
            type: 'string'
        },
        {
            caption: 'Total Mileage',
            type: 'string'
        },
        {
            caption: 'Start Time',
            type: 'string'
        },
        {
            caption: 'End Time',
            type: 'string'
        },
        {
            caption: 'Start Work',
            type: 'string'
        },
        {
            caption: 'End Work',
            type: 'string'
        },
    ];


    var objParam = req.query;
    var WhereCondition = " Where Bike.idUser= " + req.query.idUser;

    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateUTCformat(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";

    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateUTCformat(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date <='" + unixEndDate + "'";

    }
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " And gps.DeviceId = " + objParam.DeviceId;
    }

    var query = "select " +
        "gps.*,Bike.*" +
        "from tblvehicle  As Bike " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.DeviceId,gps.Date Asc";
    connection.query(query, function(err, response, fields) {
        console.log(response)
        var DeviceId = null;
        var response1 = [];
        var GroupByDevice = u.groupBy(response, function(data) { return data.DeviceId; });

        u.each(GroupByDevice, function(rows) {

            var obj = new Object();

            obj.EngineStopStartDate = null;
            obj.EngineStopEndDate = null;
            obj.EngineStartStartDate = null;
            obj.EngineStartEndDate = null;

            for (var i = 0; i < rows.length; i++) {
                var date1 = new Date(rows[i].Date * 1000);
                obj.Date = moment(date1).format('YYYY-MM-DD HH:mm:ss');
                obj.DeviceId = rows[i].DeviceId;
                obj.BikeName = rows[i].Name;
                if (i == 0) {
                    obj.StartLatitude = rows[i].Latitude;
                    obj.StartLongitude = rows[i].Longitude;
                }

                if (rows[i].IsEngine == false) {
                    if (obj.EngineStopStartDate == null || obj.EngineStopStartDate == undefined || obj.EngineStopStartDate == '') {
                        obj.EngineStopStartDate = obj.Date;

                    }
                    obj.EngineStopEndDate = obj.Date;

                } else {
                    if (obj.EngineStartStartDate == null || obj.EngineStartStartDate == undefined || obj.EngineStartStartDate == '') {
                        obj.EngineStartStartDate = obj.Date;
                        obj.EngingStartTime = moment(date1).format('HH:mm:ss');
                    }
                    obj.EngineStartEndDate = obj.Date;
                    obj.EngingEndTime = moment(date1).format('HH:mm:ss');
                }
                if (i + 1 == rows.length) {
                    obj.EndLatitude = rows[i].Latitude;
                    obj.EndLongitude = rows[i].Longitude;
                    obj.Distance = parseFloat(distance(obj.StartLatitude, obj.StartLongitude, obj.EndLatitude, obj.EndLongitude)).toFixed(2);
                    if (obj.EngineStartEndDate != null && obj.EngineStartStartDate != null) {
                        obj.DrivingTime = timeDifference(obj.EngineStartEndDate, obj.EngineStartStartDate);
                    } else {
                        obj.DrivingTime = null;
                    }
                    if (obj.EngineStopStartDate != null && obj.EngineStopEndDate != null) {
                        obj.ParkingTime = timeDifference(obj.EngineStopEndDate, obj.EngineStopStartDate);
                    } else {
                        obj.ParkingTime = null;
                    }
                    response1.push(obj);

                }

            }
        })

        conf.rows = [];
        var BikeName = '';
        var DrivingTime = '';
        var ParkingTime = '';
        var Distance = '';
        var EngineStartStartDate = '';
        var EngineStartEndDate = '';
        var EngingStartTime = '';

        var EngingEndTime = '';


        console.log("*********", response1);
        GetData(0);

        function GetData(i) {
            if (i < response1.length) {
                var row = [];
                if (response1[i].BikeName != null && response1[i].BikeName != '' && response1[i].BikeName != undefined) {
                    BikeName = response1[i].BikeName;
                }
                if (response1[i].DrivingTime != null && response1[i].DrivingTime != '' && response1[i].DrivingTime != undefined) {
                    DrivingTime = response1[i].DrivingTime;
                }
                if (response1[i].ParkingTime != null && response1[i].ParkingTime != '' && response1[i].ParkingTime != undefined) {
                    ParkingTime = response1[i].ParkingTime;
                }
                if (response1[i].Distance != null && response1[i].Distance != '' && response1[i].Distance != undefined) {
                    Distance = response1[i].Distance;
                }
                if (response1[i].EngineStartStartDate != null && response1[i].EngineStartEndDate != '' && response1[i].EngineStartEndDate != undefined) {
                    EngineStartStartDate = response1[i].EngineStartEndDate;
                }
                if (response1[i].EngineStartEndDate != null && response1[i].EngineStartEndDate != '' && response1[i].EngineStartEndDate != undefined) {
                    EngineStartEndDate = response1[i].EngineStartEndDate;
                }
                if (response1[i].EngingStartTime != null && response1[i].EngingStartTime != '' && response1[i].EngingStartTime != undefined) {
                    EngingStartTime = response1[i].EngingStartTime;
                }
                if (response1[i].EngingEndTime != null && response1[i].EngingEndTime != '' && response1[i].EngingEndTime != undefined) {
                    EngingEndTime = response1[i].EngingEndTime;
                }
                row.push(BikeName, DrivingTime, ParkingTime, Distance, EngineStartStartDate, EngineStartEndDate, EngingStartTime, EngingEndTime);
                conf.rows.push(row);
                GetData(i + 1);
            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=WorkingHourReport.xlsx");
                res.end(result, 'binary');
            }

        }
    });
})

function distance(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}


function timeDifference(old_date, new_date) {
    var old_date_obj = new Date(Date.parse(old_date));
    var new_date_obj = new Date(Date.parse(new_date));
    var diffMs = Math.abs(new_date_obj - old_date_obj);
    var diffDays = Math.round(diffMs / 86400000); // days
    var diffHrs = Math.round((diffMs % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

    // return "days:" + diffDays + "hours:" + diffHrs + "minutes:" + diffMins;

    return diffDays + "Day " + diffHrs + "Hour " + diffMins + "Minute ";

}


//Engin ideal Report
router.get('/GetAllEngineidleReport', function(req, res) {
    var objParam = req.query;
    var WhereCondition = " Where Bike.idUser= " + req.query.idUser;

    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateUTCformat(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";

    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date >='" + unixStartdate + "'";
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateUTCformat(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And gps.Date <='" + unixEndDate + "'";

    }
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " And gps.DeviceId = " + objParam.DeviceId;
    }
    // WhereCondition += " And Gps.DeviceId = 075034901552";
    // WhereCondition += " And Gps.IsEngine = false";
    var query = "select " +
        "gps.Date,gps.Speed,gps.Latitude,gps.Longitude,bike.Name,gps.id,gps.IsEngine ,gps.DeviceId  " +
        "from tblvehicle  As Bike " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.DeviceId,gps.Date";
    connection.query(query, function(err, response, fields) {
        if (!err) {
            res.json(response)
        } else {
            res.json([])
        }
    });
})


module.exports = router;
//End of Tables