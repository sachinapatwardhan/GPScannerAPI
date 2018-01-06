var router = express.Router();
var User = models.tbluserinformation;
var Gps = models.tblgpsdata;
var GpsDevice = models.tblgpsdevice;
var Alarm = models.tblalarm;
var Bike = models.tblvehicle;
var momentz = require('moment-timezone');
var Vehicle = models.tblvehicle;
var EmailTemplate = models.tblemailtemplate;
var SystemEmail = models.tblemailsettingsys;
var GpsDeleteCash = models.tblgpsdeletecash;
//gpsdata

router.get('/GetAllGpsDataOld', function(req, res) {
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

router.get('/GetAllGpsData', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (tgps.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tgps.Latitude like "%' + objSearch + '%" or ';
        search = search + 'tgps.Longitude like "%' + objSearch + '%" or ';
        search = search + 'tgps.GPSPositioning like "%' + objSearch + '%" or ';
        search = search + 'tgps.Speed like "%' + objSearch + '%" or ';
        search = search + 'tgps.Direction like "%' + objSearch + '%" or ';
        search = search + 'tgps.Status like "%' + objSearch + '%" or ';
        search = search + 'tgps.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tgps.Altitude like "%' + objSearch + '%" or ';
        search = search + 'tgps.AD1 like "%' + objSearch + '%" or ';
        search = search + 'tgps.AD2 like "%' + objSearch + '%" or ';
        search = search + 'tgps.OdoMeter like "%' + objSearch + '%") ';
    }

    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != 'All' && DeviceId != undefined) {
        if (search != "") {
            search += ' and tgps.DeviceId = ' + DeviceId;
        } else {
            search += ' where tgps.DeviceId = ' + DeviceId;
        }
    }
    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
    if (objParam.StartDate != '') {
        if (search != "") {
            search += ' and tgps.Date >= ' + unixStartdate;
        } else {
            search += ' where tgps.Date >= ' + unixStartdate;
        }
    }
    if (objParam.EndDate != '') {
        if (search != "") {
            search += ' and tgps.Date <= ' + unixEndDate;
        } else {
            search += ' where tgps.Date <= ' + unixEndDate;
        }
    }

    if (search != "") {
        search += ' and tu.idApp = ' + objParam.idApp;
    } else {
        search += ' where tu.idApp = ' + objParam.idApp;
    }

    // var qry = "SELECT tgps.*, tv.iduser, tu.idApp FROM tblgpsdata as tgps left Join tblvehicle as tv on tgps.DeviceId = tv.deviceid left join tbluserinformation as tu on tv.idUser = tu.id " + search +
    //     " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);

    var qry = "SELECT tgps.DeviceId, tgps.Date, tgps.Latitude, tgps.Longitude, tgps.Speed, tgps.Direction, tu.idApp, tgps.GPSPositioning, tgps.Speed, tgps.Direction, tgps.Status, " +
        " tgps.IsRelayToStopTheCar, tgps.IsSirenSound, tgps.IsDoor, tgps.IsEngine, tgps.IsLockTheDoor, tgps.IsUnlockTheDoor, tgps.IsSOS, tgps.AD1, tgps.AD2, tgps.Altitude, tgps.OdoMeter FROM tblgpsdata as tgps left Join tblvehicle as tv on tgps.DeviceId = tv.deviceid" +
        " left join tbluserinformation as tu on tv.idUser = tu.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);

    var Countqry = "SELECT count(tgps.id) as TotalRecord FROM tblgpsdata as tgps left Join tblvehicle as tv on tgps.DeviceId = tv.deviceid left join tbluserinformation as tu on tv.idUser = tu.id " + search;
    connection.query(qry, function(err, response) {
        if (response != undefined) {
            connection.query(Countqry, function(err, lstCount, fields) {
                var response1 = new Object();
                response1.draw = objParam.draw;
                response1.recordsTotal = lstCount[0].TotalRecord;
                response1.recordsFiltered = lstCount[0].TotalRecord;
                response1.data = response;
                res.json(response1);
            });
        } else {
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = 0;
            response1.recordsFiltered = 0;
            response1.data = [];
            res.json(response1);
        }
    })
})

router.get('/GetAllGpsDataNew', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = ' Where (tgps.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tgps.Latitude like "%' + objSearch + '%" or ';
        search = search + 'tgps.Longitude like "%' + objSearch + '%" or ';
        search = search + 'tgps.GPSPositioning like "%' + objSearch + '%" or ';
        search = search + 'tgps.Speed like "%' + objSearch + '%" or ';
        search = search + 'tgps.Direction like "%' + objSearch + '%" or ';
        search = search + 'tgps.Status like "%' + objSearch + '%" or ';
        search = search + 'tgps.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tgps.Altitude like "%' + objSearch + '%" or ';
        search = search + 'tgps.AD1 like "%' + objSearch + '%" or ';
        search = search + 'tgps.AD2 like "%' + objSearch + '%" or ';
        search = search + 'tgps.OdoMeter like "%' + objSearch + '%") ';
    }

    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != 'All' && DeviceId != undefined) {
        if (search != "") {
            search += ' and tgps.DeviceId = ' + DeviceId;
        } else {
            search += ' where tgps.DeviceId = ' + DeviceId;
        }
    }
    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
    if (objParam.StartDate != '') {
        if (search != "") {
            search += ' and tgps.Date >= ' + unixStartdate;
        } else {
            search += ' where tgps.Date >= ' + unixStartdate;
        }
    }
    if (objParam.EndDate != '') {
        if (search != "") {
            search += ' and tgps.Date <= ' + unixEndDate;
        } else {
            search += ' where tgps.Date <= ' + unixEndDate;
        }
    }

    // if (search != "") {
    //     search += ' and tu.idApp = ' + objParam.idApp;
    // } else {
    //     search += ' where tu.idApp = ' + objParam.idApp;
    // }

    if (search != "") {
        search += " and ta.AppName =  '" + objParam.AppName + "'";
    } else {
        search += " where ta.AppName = '" + objParam.AppName + "'";
    }

    // var qry = "SELECT tgps.*, tv.iduser, tu.idApp FROM tblgpsdata as tgps left Join tblvehicle as tv on tgps.DeviceId = tv.deviceid left join tbluserinformation as tu on tv.idUser = tu.id " + search +
    //     " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);

    var qry = "SELECT tgps.DeviceId, tgps.Date, tgps.Latitude, tgps.Longitude, tgps.Speed, tgps.Direction, tu.idApp, tgps.GPSPositioning, tgps.Speed, tgps.Direction, tgps.Status, " +
        " tgps.IsRelayToStopTheCar, tgps.IsSirenSound, tgps.IsDoor, tgps.IsEngine, tgps.IsLockTheDoor, tgps.IsUnlockTheDoor, tgps.IsSOS, tgps.AD1, tgps.AD2, tgps.Altitude, tgps.OdoMeter " +
        "FROM tblgpsdata as tgps left Join tblvehicle as tv on tgps.DeviceId = tv.deviceid" +
        " left join tbluserinformation as tu on tv.idUser = tu.id " +
        " inner join tblappinfo as ta  on ta.Id = tu.idApp" +
        search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    // var Countqry = "SELECT count(tgps.id) as TotalRecord FROM tblgpsdata as tgps left Join tblvehicle as tv on tgps.DeviceId = tv.deviceid left join tbluserinformation as tu on tv.idUser = tu.id " + search;
    var Countqry = "SELECT count(tgps.id) as TotalRecord " +
        "FROM tblgpsdata as tgps left Join tblvehicle as tv on tgps.DeviceId = tv.deviceid" +
        " left join tbluserinformation as tu on tv.idUser = tu.id " +
        " inner join tblappinfo as ta  on ta.Id = tu.idApp" +
        search;
    connection.query(qry, function(err, response) {
        if (response != undefined) {
            connection.query(Countqry, function(err, lstCount, fields) {
                var response1 = new Object();
                response1.draw = objParam.draw;
                response1.recordsTotal = lstCount[0].TotalRecord;
                response1.recordsFiltered = lstCount[0].TotalRecord;
                response1.data = response;
                res.json(response1);
            });
        } else {
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = 0;
            response1.recordsFiltered = 0;
            response1.data = [];
            res.json(response1);
        }
    })
})

//AlarmData
router.get('/GetAllAlarmOld', function(req, res) {
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

router.get('/GetAllAlarm', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = "";
    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (ta.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'ta.AlarmCode like "%' + objSearch + '%" or ';
        search = search + 'ta.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'ta.Latitude like "%' + objSearch + '%" or ';
        search = search + 'ta.Longitude like "%' + objSearch + '%" or ';
        search = search + 'ta.GPSPositioning like "%' + objSearch + '%" or ';
        search = search + 'ta.Status like "%' + objSearch + '%") ';
    }

    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != 'All' && DeviceId != undefined) {
        if (search != "") {
            search += ' and ta.DeviceId = ' + DeviceId;
        } else {
            search += ' where ta.DeviceId = ' + DeviceId;
        }
    }
    var AlarmCode = objParam.AlarmCode;
    if (AlarmCode != null && AlarmCode != undefined && AlarmCode != '' && AlarmCode != 'All') {
        if (search != "") {
            search += ' and ta.AlarmCode = ' + parseInt(AlarmCode);
        } else {
            search += ' where ta.AlarmCode = ' + parseInt(AlarmCode);
        }
    }

    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.StartDate != '') {
        if (search != "") {
            search += ' and ta.Date >= ' + unixStartdate;
        } else {
            search += ' where ta.Date >= ' + unixStartdate;
        }
    }
    if (objParam.EndDate != '') {
        if (search != "") {
            search += ' and ta.Date <= ' + unixEndDate;
        } else {
            search += ' where ta.Date <= ' + unixEndDate;
        }
    }

    if (search != "") {
        search += ' and tu.idApp = ' + objParam.idApp;
    } else {
        search += ' where tu.idApp = ' + objParam.idApp;
    }

    var query = "SELECT ta.*, CONVERT_TZ(ta.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate,tv.idUser, tu.idApp FROM tblalarm as ta left join tblvehicle as tv on tv.deviceid = ta.DeviceId left join tbluserinformation as tu on tv.idUser = tu.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "SELECT count(ta.id) as TotalRecord FROM tblalarm as ta left Join tblvehicle as tv on ta.DeviceId = tv.deviceid left join tbluserinformation as tu on tv.idUser = tu.id " + search;
    connection.query(query, function(err, response) {
        if (response != undefined) {
            connection.query(Countqry, function(err, lstCount, fields) {
                var response1 = new Object();
                response1.draw = objParam.draw;
                response1.recordsTotal = lstCount[0].TotalRecord;
                response1.recordsFiltered = lstCount[0].TotalRecord;
                response1.data = response;
                res.json(response1);
            });
        } else {
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = 0;
            response1.recordsFiltered = 0;
            response1.data = [];
            res.json(response1);
        }
    })
})

router.get('/GetAllGpsDevice', function(req, res) {
    var query = "SELECT tgdevice.*, tv.iduser,tu.idApp FROM tblgpsdevice as tgdevice LEFT JOIN tblvehicle as tv ON tgdevice.DeviceId = tv.deviceid LEFT JOIN tbluserinformation AS tu ON tv.iduser = tu.id where tu.idApp = " + req.query.idApp;
    connection.query(query, function(err, response) {
        if (response != undefined) {
            res.json(response);
        } else {
            res.json(err);
        }
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

    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
    search['$and'] = [];
    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != undefined && DeviceId != "All") {
        var obj = new Object();
        obj['DeviceId'] = {
            $eq: DeviceId
        };
        search['$and'].push(obj);
    }
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
                res.setHeader("Content-Disposition", "attachment; filename=GPSData.xlsx");
                res.end(result, 'binary');
            }

        }
    });
});

router.get('/ExportAlarm', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'Date Time',
        type: 'string'
    }, {
        caption: 'Alarm',
        type: 'string'
    }, {
        caption: 'Device Id',
        type: 'string'
    }, {
        caption: 'Latitude',
        type: 'string'
    }, {
        caption: 'Longitude',
        type: 'string'
    }, {
        caption: 'GPS Positioning',
        type: 'string'
    }, {
        caption: 'Status',
        type: 'string'
    }, {
        caption: 'Created Date',
        type: 'string'
    }];

    var objParam = req.query;
    var objColumns = objParam.columns;
    var Orderby = 'Date desc';
    var objSearch = objParam.search;
    var search = "";
    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (ta.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'ta.AlarmCode like "%' + objSearch + '%" or ';
        search = search + 'ta.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'ta.Latitude like "%' + objSearch + '%" or ';
        search = search + 'ta.Longitude like "%' + objSearch + '%" or ';
        search = search + 'ta.GPSPositioning like "%' + objSearch + '%" or ';
        search = search + 'ta.Status like "%' + objSearch + '%") ';
    }

    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != 'All' && DeviceId != undefined) {
        if (search != "") {
            search += ' and ta.DeviceId = ' + DeviceId;
        } else {
            search += ' where ta.DeviceId = ' + DeviceId;
        }
    }
    var AlarmCode = objParam.AlarmCode;
    if (AlarmCode != null && AlarmCode != undefined && AlarmCode != '' && AlarmCode != 'All') {
        if (search != "") {
            search += ' and ta.AlarmCode = ' + parseInt(AlarmCode);
        } else {
            search += ' where ta.AlarmCode = ' + parseInt(AlarmCode);
        }
    }

    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.StartDate != '') {
        if (search != "") {
            search += ' and ta.Date >= ' + unixStartdate;
        } else {
            search += ' where ta.Date >= ' + unixStartdate;
        }
    }
    if (objParam.EndDate != '') {
        if (search != "") {
            search += ' and ta.Date <= ' + unixEndDate;
        } else {
            search += ' where ta.Date <= ' + unixEndDate;
        }
    }

    if (search != "") {
        search += ' and tu.idApp = ' + objParam.idApp;
    } else {
        search += ' where tu.idApp = ' + objParam.idApp;
    }

    var query = "SELECT ta.*,CONVERT_TZ(ta.CreatedDate,'+00:00','" + req.query.CurrentOffset + "') as CreatedDate, tv.idUser, tu.idApp FROM tblalarm as ta left join tblvehicle as tv on tv.deviceid = ta.DeviceId left join tbluserinformation as tu on tv.idUser = tu.id " + search +
        " order by " + Orderby;
    connection.query(query, function(err, response) {
        if (response != undefined) {
            conf.rows = [];
            var AlarmCode = '';
            var DeviceId = '';
            var Latitude = '';
            var Longitude = '';
            var GPSPositioning = '';
            var Status = '';
            var CreatedDate = '';
            var DisplayDate = '';
            // GetAlarmData(0);

            // function GetAlarmData(i) {
            for (var i = 0; i < response.length; i++) {
                var row = [];
                if (response[i].Date != null && response[i].Date != '' && response[i].Date != undefined) {
                    var Dates = new Date(response[i].Date * 1000);
                    DisplayDate = momentz.utc(new Date(response[i].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                }

                if (response[i].AlarmCode != null && response[i].AlarmCode != '' && response[i].AlarmCode != undefined) {
                    var list = AlarmCodedata();
                    var obj = u.findWhere(list, { AlarmCode: response[i].AlarmCode });
                    if (obj != null && obj != undefined && obj != '') {
                        if (response[i].AlarmCode == '66' || response[i].AlarmCode == '6') {
                            AlarmCode = response[i].FenceName + " " + obj.Alarm;
                        } else {
                            AlarmCode = obj.Alarm;
                        }
                    }
                }
                if (response[i].DeviceId != null && response[i].DeviceId != '' && response[i].DeviceId != undefined) {
                    DeviceId = response[i].DeviceId;
                }

                if (response[i].CreatedDate != null && response[i].CreatedDate != '' && response[i].CreatedDate != undefined) {
                    // CreatedDate = convertdateformat(response[i].CreatedDate, "Excel Export");
                    CreatedDate = moment(moment.utc(response[i].CreatedDate).toDate()).format("DD-MM-YYYY hh:mm:ss a");
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


                row.push(DisplayDate, AlarmCode, DeviceId, Latitude, Longitude, GPSPositioning, Status, CreatedDate);
                conf.rows.push(row);
                // GetAlarmData(i + 1);
            }
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=Alarm.xlsx");
            res.end(result, 'binary');

        } else {
            conf.rows = [];
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=NoData.xlsx");
            res.end(result, 'binary');
        }
    })
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
    obj.Alarm = "SOS alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "02";
    obj.Alarm = "Line broken alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "03";
    obj.Alarm = "Door open alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "04";
    obj.Alarm = "Engine on alarm";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "05";
    obj.Alarm = "Original triggering alarm";
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
    var obj = new Object();
    obj.AlarmCode = "66";
    obj.Alarm = "Fence OUT";
    ResponseAlarm.push(obj);
    var obj = new Object();
    obj.AlarmCode = "6";
    obj.Alarm = "Fence IN";
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

//------------------------------------Speed Report-----------------------------------//
router.get('/GetAllSpeedDataReport', function(req, res) {
    var objParam = req.query;
    var WhereCondition = " Where Bike.idUser= " + req.query.idUser;

    if (objParam.StartDate != '' && objParam.EndDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";

    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date >='" + unixStartdate + "'";
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date <='" + unixEndDate + "'";

    }
    if (objParam.Speed != null && objParam.Speed != undefined && objParam.Speed != '') {
        WhereCondition += " And Gps.Speed >= " + objParam.Speed;
    }
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " And Gps.DeviceId = " + objParam.DeviceId;
    }
    WhereCondition += ' and Gps.IsEngine = 1'
    var query = "SELECT User.username,Bike.MaxSpeed,Bike.Name,Bike.IsOnline,Gps.* FROM tblvehicle  AS Bike left join  tblgpsdata AS Gps on Gps.DeviceId = Bike.deviceid left join  tbluserinformation AS User on Bike.iduser = User.id " + WhereCondition + " order by Gps.Date asc LIMIT " + req.query.length + " OFFSET " + req.query.start + ";";
    // console.log(query);
    var count = "SELECT count(*) AS Totalrecord FROM tblvehicle  AS Bike left join  tblgpsdata AS Gps on Gps.DeviceId = Bike.deviceid left join  tbluserinformation AS User on Bike.iduser = User.id " + WhereCondition + ";";
    connection.query(query, function(err, response, fields) {
        if (!err) {
            connection.query(count, function(err1, response1, fields) {
                var obj = new Object();
                obj.data = response;
                obj.Totalrecord = response1[0].Totalrecord;
                res.json(obj);
            })
        } else {
            var obj = new Object();
            obj.data = [];
            obj.Totalrecord = 0;
            res.json(obj);

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
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date between '" + unixStartdate + "' And '" + unixEndDate + "'";

    } else if (objParam.StartDate != null && objParam.StartDate != '') {
        var StartDate = convertdateformatForUnix(objParam.StartDate);
        var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date >='" + unixStartdate + "'";
    } else if (objParam.EndDate != null && objParam.EndDate != '') {
        var EndDate = convertdateformatForUnix(objParam.EndDate);
        var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;
        WhereCondition += " And Gps.Date <='" + unixEndDate + "'";

    }
    if (objParam.Speed != null && objParam.Speed != undefined && objParam.Speed != '') {
        WhereCondition += " And Gps.Speed >= " + objParam.Speed;
    }
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " And Gps.DeviceId = " + objParam.DeviceId;
    }
    WhereCondition += ' and Gps.IsEngine = 1'

    var query = "SELECT User.username,Bike.MaxSpeed,Bike.Name,Bike.IsOnline,Gps.* FROM tblvehicle  AS Bike left join  tblgpsdata AS Gps on Gps.DeviceId = Bike.deviceid left join  tbluserinformation AS User on Bike.iduser = User.id " + WhereCondition + " order by Gps.Date asc";
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
                    DisplayDate = moment(Dates).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');

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
router.get('/GetAllWoringHourForReportOld', function(req, res) {
    var objParam = req.query;
    var WhereCondition = " Where Bike.idUser= " + req.query.idUser;


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
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " And gps.DeviceId = " + objParam.DeviceId;
    }
    // WhereCondition += " And Gps.IsEngine = false";
    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    //  console.log(query);
    connection.query(query, function(err, response, fields) {
        if (!err) {
            var GroupByDevice = u.groupBy(response, function(data) { return data.DeviceId; });

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
                for (var i = 0; i < group.length; i++) {
                    group[i].Date = new Date(group[i].Date * 1000);

                    if (group[i].GPSPositioning == "A" && group[i].IsEngine == true) {
                        if (HighestSpeed < parseFloat(group[i].Speed)) {
                            HighestSpeed = parseFloat(group[i].Speed);
                        }
                    }
                    if (group[i].IsEngine == true) {
                        if ((i + 1) < group.length) {
                            TotalMileage = TotalMileage + parseFloat(distance(parseFloat(group[i].Latitude), parseFloat(group[i].Longitude), parseFloat(group[i + 1].Latitude), parseFloat(group[i + 1].Longitude)))
                        }
                    }
                    if (group[i].IsEngine == true && parseFloat(group[i].Speed) > 1) {
                        if (IsDriving == 0) {
                            DrivingStartPosition = i;
                        }
                        IsDriving = 1;
                        if (IsParking == 1) {
                            IsParking = 0;
                            TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[ParkingStartPosition].Date));
                        }

                        if (group[i].GPSPositioning == "A") {
                            TotalSpeed = TotalSpeed + parseFloat(group[i].Speed);
                            TotalSpeedRecord = TotalSpeedRecord + 1;
                        }

                    } else {
                        if (IsDriving == 1) {
                            IsDriving = 0;
                            TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[DrivingStartPosition].Date));
                        }

                        if (IsParking == 0) {
                            ParkingStartPosition = i;
                        }
                        IsParking = 1;
                        // console.log(ParkingStartPosition)
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
                var AverageSpeed = (TotalSpeed / TotalSpeedRecord).toFixed(2);

                return {
                    // data: group,
                    Name: group[0].Name,
                    DeviceId: DeviceId,
                    DrivingTime: TotalDrivingTimeDisplay,
                    Parkingtime: TotalParkingTimeDisplay,
                    AverageSpeed: AverageSpeed + " km/h",
                    HighestSpeed: HighestSpeed.toFixed(2) + " km/h",
                    TotalMileage: TotalMileage.toFixed(2) + " km"
                }
            });
            res.json(lstGroup)
        } else {
            res.json([])
        }
    });
})
router.get('/GetAllWoringHourForReport', function(req, res) {
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

    // WhereCondition += " And Gps.IsEngine = false";
    var query = "select " +
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    // console.log(query)
    connection.query(query, function(err, response, fields) {
        if (!err) {
            var query1 = "select tblalarm.*,tblvehicle.deviceid from tblalarm left join tblvehicle on tblalarm.deviceid = tblvehicle.deviceid Where tblvehicle.iduser=" + req.query.idUser + "  and tblalarm.Date >= '" + unixStartdate + "' and tblalarm.Date <= '" + unixEndDate + "'" + wherecondition1 + ";"
            connection.query(query1, function(alarmerr, alarmresponse, alarmfields) {

                var GroupByDevice = u.groupBy(response, function(data) { return data.DeviceId; });

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
                    for (var i = 0; i < group.length; i++) {

                        group[i].Date = new Date(group[i].Date * 1000);

                        if (group[i].IsEngine == true) {

                            // if ((i + 1) < group.length) {
                            //     TotalMileage = TotalMileage + parseFloat(distance(parseFloat(group[i].Latitude), parseFloat(group[i].Longitude), parseFloat(group[i + 1].Latitude), parseFloat(group[i + 1].Longitude)))
                            // }
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
                                // s_id = group[ParkingStartPosition].Id;
                                // e_id = group[i].Id
                                // console.log(s_id, "-$-", e_id);
                            }

                            // if (IsDriving == 0) {
                            //     DrivingStartPosition = i;
                            // }
                            // IsDriving = 1;

                            if (parseFloat(group[i].Speed) > 1) {
                                if (IsDriving == 0) {
                                    DrivingStartPosition = i;
                                }
                                IsDriving = 1;
                            }

                            // } else {
                            //     if (IsDriving == 1) {
                            //         IsDriving = 0;
                            //         s_id = group[DrivingStartPosition].Id;
                            //         e_id = group[i].Id
                            //             // console.log(s_id, "-$-", e_id);
                            //         TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[DrivingStartPosition].Date));
                            //     }
                            // }

                        } else {
                            Engineco = 0;
                            if (IsDriving == 1) {
                                IsDriving = 0;
                                s_id = group[DrivingStartPosition].Id;
                                // e_id = group[i].Id
                                // console.log(TotalSpeed, "/", TotalSpeedRecord, "=")
                                // console.log((TotalSpeed / TotalSpeedRecord).toFixed(2));
                                // TotalSpeed = 0;
                                // TotalSpeedRecord = 0;
                                // console.log(s_id, "-$-", e_id);
                                TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[DrivingStartPosition].Date));
                                TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                            }

                            if (IsParking == 0) {
                                ParkingStartPosition = i;
                            }
                            IsParking = 1;
                            // console.log(ParkingStartPosition)
                        }
                    }

                    if (IsParking == 1) {
                        IsParking = 0;
                        TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(group[group.length - 1].Date), moment(group[ParkingStartPosition].Date));
                        // s_id = group[ParkingStartPosition].Id;
                        // e_id = group[group.length - 1].Id
                        // console.log(s_id, "-$-", e_id);
                    }

                    if (IsDriving == 1) {
                        IsDriving = 0;
                        // s_id = group[DrivingStartPosition].Id;
                        // e_id = group[group.length - 1].Id
                        // console.log(s_id, "-$-", e_id);
                        TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[group.length - 1].Date), moment(group[DrivingStartPosition].Date));
                    }
                    if (TotalSpeedRecord == 0) {
                        TotalSpeedRecord = 1;
                    }

                    var TotalDrivingTimeDisplay = calhrminsecfromsec(TotalDrivingtime);
                    var TotalParkingTimeDisplay = calhrminsecfromsec(TotalParkingtime);
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
                    return {
                        // data: group,
                        Name: group[0].Name,
                        DeviceId: DeviceId,
                        DrivingTime: TotalDrivingTimeDisplay,
                        Parkingtime: TotalParkingTimeDisplay,
                        AverageSpeed: AverageSpeed + " km/h",
                        HighestSpeed: HighestSpeed.toFixed(2) + " km/h",
                        TotalMileage: TotalMileage.toFixed(2) + " km",
                        OverSpeed: OverSpeed,
                    }
                });
                res.json(lstGroup)
            })
        } else {
            res.json([])
        }
    });
})

//New Working hour report
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
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
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
                    for (var i = 0; i < group.length; i++) {

                        group[i].Date = new Date(group[i].Date * 1000);

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
                // console.log(TotalAllDrivingTime, " - ", TotalAllParkingTime, " - ", TotalAllTime);
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
            caption: 'Average Speed',
            type: 'number'
        },
        {
            caption: 'Highest Speed',
            type: 'number'
        }, {
            caption: 'Over Speed(Times)',
            type: 'number'
        },
        /*{
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
        },*/
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
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
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
                // for (var i = 0; i < group.length; i++) {

                //     group[i].Date = new Date(group[i].Date * 1000);

                //     if (group[i].GPSPositioning == "A" && group[i].IsEngine == true) {
                //         if (HighestSpeed < parseFloat(group[i].Speed)) {
                //             HighestSpeed = parseFloat(group[i].Speed);
                //         }
                //     }
                //     if (group[i].IsEngine == true) {
                //         if ((i + 1) < group.length) {
                //             TotalMileage = TotalMileage + parseFloat(distance(parseFloat(group[i].Latitude), parseFloat(group[i].Longitude), parseFloat(group[i + 1].Latitude), parseFloat(group[i + 1].Longitude)))
                //         }
                //     }
                //     if (group[i].IsEngine == true) {

                //         if (IsParking == 1) {
                //             IsParking = 0;
                //             TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[ParkingStartPosition].Date));
                //             s_id = group[ParkingStartPosition].Id;
                //             e_id = group[i].Id
                //                 // console.log(s_id, "-$-", e_id);
                //         }


                //         if (parseFloat(group[i].Speed) > 1) {
                //             if (group[i].GPSPositioning == "A") {
                //                 TotalSpeed = TotalSpeed + parseFloat(group[i].Speed);
                //                 TotalSpeedRecord = TotalSpeedRecord + 1;
                //             }
                //             if (IsDriving == 0) {
                //                 DrivingStartPosition = i;
                //             }
                //             IsDriving = 1;
                //         } else {
                //             if (IsDriving == 1) {
                //                 IsDriving = 0;
                //                 TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[DrivingStartPosition].Date));
                //             }
                //         }

                //     } else {
                //         if (IsDriving == 1) {
                //             IsDriving = 0;
                //             TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[DrivingStartPosition].Date));
                //         }

                //         if (IsParking == 0) {
                //             ParkingStartPosition = i;
                //         }
                //         IsParking = 1;
                //         // console.log(ParkingStartPosition)
                //     }
                // }

                for (var i = 0; i < group.length; i++) {

                    group[i].Date = new Date(group[i].Date * 1000);

                    if (group[i].IsEngine == true) {

                        // if ((i + 1) < group.length) {
                        //     TotalMileage = TotalMileage + parseFloat(distance(parseFloat(group[i].Latitude), parseFloat(group[i].Longitude), parseFloat(group[i + 1].Latitude), parseFloat(group[i + 1].Longitude)))
                        // }
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
                            // s_id = group[ParkingStartPosition].Id;
                            // e_id = group[i].Id
                            // console.log(s_id, "-$-", e_id);
                        }
                        if (parseFloat(group[i].Speed) > 1) {
                            if (IsDriving == 0) {
                                DrivingStartPosition = i;
                            }
                            IsDriving = 1;
                        }
                        // if (parseFloat(group[i].Speed) > 1) {
                        //     if (group[i].GPSPositioning == "A") {

                        //     }

                        // } else {
                        //     if (IsDriving == 1) {
                        //         IsDriving = 0;
                        //         s_id = group[DrivingStartPosition].Id;
                        //         e_id = group[i].Id
                        //             // console.log(s_id, "-$-", e_id);
                        //         TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[DrivingStartPosition].Date));
                        //     }
                        // }

                    } else {
                        Engineco = 0;
                        if (IsDriving == 1) {
                            IsDriving = 0;
                            // s_id = group[DrivingStartPosition].Id;
                            // e_id = group[i].Id
                            // console.log(TotalSpeed, "/", TotalSpeedRecord, "=")
                            // console.log((TotalSpeed / TotalSpeedRecord).toFixed(2));
                            // TotalSpeed = 0;
                            // TotalSpeedRecord = 0;
                            // console.log(s_id, "-$-", e_id);
                            TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[i].Date), moment(group[DrivingStartPosition].Date));
                            TotalMileage += distance(parseFloat(group[StartMilage].Latitude), parseFloat(group[StartMilage].Longitude), parseFloat(group[i].Latitude), parseFloat(group[i].Longitude));
                        }

                        if (IsParking == 0) {
                            ParkingStartPosition = i;
                        }
                        IsParking = 1;
                        // console.log(ParkingStartPosition)
                    }
                }

                if (IsParking == 1) {
                    IsParking = 0;
                    TotalParkingtime = TotalParkingtime + calcDateDiffCalInSec(moment(group[group.length - 1].Date), moment(group[ParkingStartPosition].Date));
                    // s_id = group[ParkingStartPosition].Id;
                    // e_id = group[group.length - 1].Id
                    // console.log(s_id, "-$-", e_id);
                }

                if (IsDriving == 1) {
                    IsDriving = 0;
                    // s_id = group[DrivingStartPosition].Id;
                    // e_id = group[group.length - 1].Id
                    // console.log(s_id, "-$-", e_id);
                    TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(group[group.length - 1].Date), moment(group[DrivingStartPosition].Date));
                }
                if (TotalSpeedRecord == 0) {
                    TotalSpeedRecord = 1;
                }

                var TotalDrivingTimeDisplay = calhrminsecfromsec(TotalDrivingtime);
                var TotalParkingTimeDisplay = calhrminsecfromsec(TotalParkingtime);
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
                return {
                    Name: group[0].Name,
                    DeviceId: DeviceId,
                    DrivingTime: TotalDrivingTimeDisplay,
                    Parkingtime: TotalParkingTimeDisplay,
                    AverageSpeed: AverageSpeed + " km/h",
                    HighestSpeed: HighestSpeed.toFixed(2) + " km/h",
                    TotalMileage: TotalMileage.toFixed(2) + " km",
                    OverSpeed: OverSpeed
                }
            });

            response1 = lstGroup;

            conf.rows = [];

            response1 = u.sortBy(response1, function(num) { return num.Name })
            for (var i = 0; i < response1.length; i++) {
                var row = [];
                row.push(response1[i].Name, response1[i].DrivingTime, response1[i].Parkingtime, response1[i].TotalMileage, response1[i].AverageSpeed, response1[i].HighestSpeed, response1[i].OverSpeed);
                conf.rows.push(row);
            }

            // GetData(i + 1);
            //  } else {
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=WorkingHourReport.xlsx");
            res.end(result, 'binary');
            // var BikeName = '';
            // var DrivingTime = '';
            // var ParkingTime = '';
            // var Distance = '';
            // var EngineStartStartDate = '';
            // var EngineStartEndDate = '';
            // var EngingStartTime = '';
            // var AveargeSpeed = 0;
            // var HighestSpeed = 0;
            // var EngingEndTime = '';
            // GetData(0);

            // function GetData(i) {
            //     if (i < response1.length) {
            // var row = [];
            // if (response1[i].BikeName != null && response1[i].BikeName != '' && response1[i].BikeName != undefined) {
            //     BikeName = response1[i].BikeName;
            // }
            // if (response1[i].DrivingTime != null && response1[i].DrivingTime != '' && response1[i].DrivingTime != undefined) {
            //     DrivingTime = response1[i].DrivingTime;
            // }
            // if (response1[i].ParkingTime != null && response1[i].ParkingTime != '' && response1[i].ParkingTime != undefined) {
            //     ParkingTime = response1[i].ParkingTime;
            // }
            // if (response1[i].TolalMilage != null && response1[i].TolalMilage != '' && response1[i].TolalMilage != undefined) {
            //     Distance = response1[i].TolalMilage;
            // }
            /*if (response1[i].StartDate != null && response1[i].StartDate != '' && response1[i].StartDate != undefined) {
                EngineStartStartDate = response1[i].StartDate;
            }
            if (response1[i].StartTime != null && response1[i].StartTime != '' && response1[i].StartTime != undefined) {
                EngingStartTime = response1[i].StartTime;
            }
            if (response1[i].EndDate != null && response1[i].EndDate != '' && response1[i].EndDate != undefined) {
                EngineStartEndDate = response1[i].EndDate;
            }
            if (response1[i].EndTime != null && response1[i].EndTime != '' && response1[i].EndTime != undefined) {
                EngingEndTime = response1[i].EndTime;
            }*/
            // if (response1[i].AveargeSpeed != null && response1[i].AveargeSpeed != '' && response1[i].AveargeSpeed != undefined) {
            //     AveargeSpeed = response1[i].AveargeSpeed;
            // }
            // if (response1[i].HighestSpeed != null && response1[i].HighestSpeed != '' && response1[i].HighestSpeed != undefined) {
            //     HighestSpeed = response1[i].HighestSpeed;
            // }

            // for(var i = 0; i < response1.length; i++) {
            //     row.push(response1[i].Name, response1[i].DrivingTime, response1[i].ParkingTime, response1[i].Distance, response1[i].AveargeSpeed, response1[i].HighestSpeed);
            //     conf.rows.push(row);
            // }

            // GetData(i + 1);
            //  } else {
            // var result = nodeExcel.execute(conf);
            // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            // res.setHeader("Content-Disposition", "attachment; filename=WorkingHourReport.xlsx");
            // res.end(result, 'binary');
            //}

            //}
        })
    });
})

router.get('/ExportAllWoringHourForReportNew', function(req, res) {
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
            caption: 'Over Speed(Times)',
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
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
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

                for (var i = 0; i < group.length; i++) {

                    group[i].Date = new Date(group[i].Date * 1000);

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
                row.push(response1[i].Name, response1[i].DrivingTime, response1[i].Parkingtime, response1[i].TotalTiming, response1[i].TotalMileage, response1[i].AverageSpeed, response1[i].HighestSpeed, response1[i].OverSpeed);
                conf.rows.push(row);

            }

            var row = [];
            // console.log(TotalAllDrivingTime, " - ", TotalAllParkingTime, " - ", TotalAllTime);
            TotalAllDrivingTime = calhrminsecfromsec(TotalAllDrivingTime)
            TotalAllParkingTime = calhrminsecfromsec(TotalAllParkingTime)
            TotalAllTime = calhrminsecfromsec(TotalAllTime)
            row.push('Total:', TotalAllDrivingTime, TotalAllParkingTime, TotalAllTime, '', '', '', '');
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
        "gps.DeviceId,gps.Date,gps.Speed,gps.IsEngine,gps.Latitude,gps.Longitude,gps.GPSPositioning,Bike.Name,Bike.id,Bike.deviceid " +
        "from tblvehicle  As Bike " +
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

                for (var i = 0; i < group.length; i++) {

                    group[i].Date = new Date(group[i].Date * 1000);

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
            // var table = '<h2 style="text-align:center"><b>Working Hour Report</b></h2><h5 style="text-align:right">' + TodayDate + '</h5><hr/><table style="width:100%">' +
            //     '<tr><th style="text-align:left">No</th>' +
            //     '<th style="text-align:left">Asset Name</th>' +
            //     '<th style="text-align:left">Driving Time</th>' +
            //     '<th style="text-align:left">Parking Time</th>' +
            //     '<th style="text-align:left">Total Time</th>' +
            //     '<th style="text-align:left">Total Mileage</th>' +
            //     '<th style="text-align:left">Average Speed(km/h)</th>' +
            //     '<th style="text-align:left">Highest Speed</th>' +
            //     '<th style="text-align:left">Over Speed(Times)</th></tr>';


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
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Asset Name</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Driving Time</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Parking Time</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Total Time</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Total Mileage</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Average Speed(km/h)</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Highest Speed</th>' +
                '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Over Speed(Times)</th></tr>' +
                '</thead><tbody>';

            for (var i = 0; i < response1.length; i++) {
                table += '<tr>' +
                    '<td style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000; text-align: center;">' + (i + 1) + '</td>' +
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
                            if (COuntEngineOff == 0) {
                                var obj = new Object();
                                obj.Latitude = lstGroup[i].data[k].Latitude;
                                obj.Longitude = lstGroup[i].data[k].Longitude;
                                obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                obj.Speed = lstGroup[i].data[k].Speed;
                                obj.Name = lstGroup[i].data[k].Name;
                                // obj.Id = lstGroup[i].data[k].Id;
                                obj.StartTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                StartDate = new Date(lstGroup[i].data[k].Date * 1000);
                                COuntEngineOff = COuntEngineOff + 1;
                            } else {
                                obj.EndTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                // obj.EndId = lstGroup[i].data[k].Id;
                                EndDate = new Date(lstGroup[i].data[k].Date * 1000);
                                obj.ParkingTime = calcDateDiff(EndDate, StartDate);

                            }
                        } else {
                            if (COuntEngineOff != 0) {
                                if (obj.EndTime == null || obj.EndTime == undefined || obj.EndTime == '') {
                                    obj.EndTime = momentz.utc(new Date(lstGroup[i].data[k - 1].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                    // obj.EndId = lstGroup[i].data[k - 1].Id;
                                    EndDate = new Date(lstGroup[i].data[k - 1].Date * 1000);
                                    obj.ParkingTime = calcDateDiff(EndDate, StartDate);
                                }
                                Array.push(obj);
                            }
                            COuntEngineOff = 0;
                        }
                    }

                    if (COuntEngineOff != 0) {
                        if (obj.EndTime == null || obj.EndTime == undefined || obj.EndTime == '') {
                            obj.EndTime = obj.StartTime;
                            // obj.EndId = lstGroup[i].data[k - 1].Id;
                            EndDate = StartDate;
                            obj.ParkingTime = calcDateDiff(EndDate, StartDate);
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

})

//--------------------------Driving Report Start-------------------------------------------//
router.get('/GetAllDriverReportOld', function(req, res) {
    var objParam = req.query;
    var WhereCondition = " Where Bike.idUser= " + req.query.idUser;
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
    if (objParam.DeviceId != null && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        WhereCondition += " And gps.DeviceId = " + objParam.DeviceId;
    }
    //WhereCondition += " And Gps.DeviceId = 075034901552";
    // WhereCondition += " And Gps.IsEngine = false";
    var query = "select " +
        " gps.*,Bike.*  " +
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


            var l = 0;
            var StartVehical = 0;
            var Array = [];
            for (var i = 0; i < lstGroup.length; i++) {
                StartVehical = 0;
                var Speed6090 = 0;
                var Speed90130 = 0;
                var Over130 = 0;
                var LocateNumber = 0;
                var objSpeed = [];
                var TotalRecord = 0;
                var Mileage = 0.00;
                if (lstGroup[i].data.length > 0) {
                    for (var k = 0; k < lstGroup[i].data.length; k++) {
                        if (lstGroup[i].data[k].IsEngine == true) {
                            if (lstGroup[i].data[k].Speed > 1) {
                                //objSpeed.push(lstGroup[i].data[k].Speed);
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
                                if ((k) != 0) {
                                    Mileage += distance(parseFloat(lstGroup[i].data[k - 1].Latitude), parseFloat(lstGroup[i].data[k - 1].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                }
                            }
                            LocateNumber = LocateNumber + 1;
                            if (StartVehical == 0) {
                                var obj = new Object();
                                // obj.s_id = lstGroup[i].data[k].Id;
                                obj.StartLatitude = lstGroup[i].data[k].Latitude;
                                obj.StartLongitude = lstGroup[i].data[k].Longitude;
                                obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                obj.StartSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                obj.Name = lstGroup[i].data[k].Name;
                                obj.StartAddress = "No Address Found";
                                obj.EndAddress = "No Address Found";
                                // obj.StartId = lstGroup[i].data[k].Id;
                                obj.DrivingStartTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                                    // obj.DrivingStartTime = moment(new Date(lstGroup[i].data[k].Date * 1000)).format('DD-MM-YYYY hh:mm:ss a');
                                obj.StartDate = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone)
                                    // obj.StartDate = moment(new Date(lstGroup[i].data[k].Date * 1000));
                                StartVehical = StartVehical + 1;

                            } else {
                                // obj.e_id = lstGroup[i].data[k].Id;
                                obj.EndLatitude = lstGroup[i].data[k].Latitude;
                                obj.EndLongitude = lstGroup[i].data[k].Longitude;
                                obj.EndSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                // obj.EndDrivingTime = moment(new Date(lstGroup[i].data[k].Date * 1000)).format('DD-MM-YYYY hh:mm:ss a');
                                obj.EndDrivingTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                // obj.EndId = lstGroup[i].data[k].Id;
                                // obj.EndDate = moment(new Date(lstGroup[i].data[k].Date * 1000));
                                obj.EndDate = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone);
                                obj.DrivingTime = calcDateDiff(obj.EndDate, obj.StartDate);
                                obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                                obj.Speed6090 = Speed6090;
                                obj.Speed90130 = Speed90130;
                                obj.Mileage = parseFloat(Mileage).toFixed(2);
                                obj.Over130 = Over130;
                                var sum = 0;
                                for (var m = 0; m < objSpeed.length; m++) {
                                    sum += parseFloat(objSpeed[m]);
                                }
                                obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                                obj.LocateNumber = LocateNumber;
                            }


                        } else {
                            if (StartVehical != 0) {
                                if (obj.EndDrivingTime == null || obj.EndDrivingTime == undefined || obj.EndDrivingTime == '') {
                                    obj.EndLatitude = lstGroup[i].data[k].Latitude;
                                    obj.EndLongitude = lstGroup[i].data[k].Longitude;
                                    obj.EndSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                    // obj.EndDrivingTime = moment(new Date(lstGroup[i].data[k].Date * 1000)).format('DD-MM-YYYY hh:mm:ss a');
                                    obj.EndDrivingTime = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                                    // obj.EndId = lstGroup[i].data[k].Id;
                                    // obj.EndDate = moment(new Date(lstGroup[i].data[k].Date * 1000));
                                    obj.EndDate = momentz.utc(new Date(lstGroup[i].data[k].Date * 1000)).tz(req.query.TimeZone);
                                    obj.DrivingTime = calcDateDiff(obj.EndDate, obj.StartDate);
                                    obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                                    obj.Speed6090 = Speed6090;
                                    obj.Speed90130 = Speed90130;
                                    obj.Over130 = Over130;
                                    obj.Mileage = parseFloat(Mileage).toFixed(2);
                                    var sum = 0;
                                    for (var m = 0; m < objSpeed.length; m++) {
                                        sum += parseFloat(objSpeed[m]);
                                    }
                                    obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                                    obj.LocateNumber = LocateNumber;

                                }
                                // console.log(obj.s_id, "--@--", obj.EndId)
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

                    if (StartVehical != 0) {
                        if (obj.EndDrivingTime == null || obj.EndDrivingTime == undefined || obj.EndDrivingTime == '') {
                            obj.EndDrivingTime = obj.DrivingStartTime;
                            obj.EndDate = obj.StartDate;
                            obj.EndSpeed = obj.StartSpeed;
                            obj.DrivingTime = calcDateDiff(obj.EndDate, obj.StartDate);
                            obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                            obj.Speed6090 = Speed6090;
                            obj.Speed90130 = Speed90130;
                            obj.Over130 = Over130;
                            obj.Mileage = parseFloat(Mileage).toFixed(2);
                            var sum = 0;
                            for (var m = 0; m < objSpeed.length; m++) {
                                sum += parseFloat(objSpeed[m]);
                            }
                            obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                            obj.LocateNumber = LocateNumber;
                        }
                        // console.log(obj.s_id, "--@--", obj.s_id)
                        Array.push(obj);
                    }
                }
            }

            res.json(Array);
        } else {
            res.json([]);
        }
    });
})

router.get('/GetAllDriverReport', function(req, res) {
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
    //WhereCondition += " And Gps.DeviceId = 075034901552";
    // WhereCondition += " And Gps.IsEngine = false";
    var query = "select " +
        " gps.*,Bike.*  " +
        "from tblvehicle  As Bike " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    // console.log(query);
    var query1 = "select ta.Datetime, ta.Date, ta.deviceid from tblalarm as ta left join tblvehicle As Bike on ta.deviceid = Bike.deviceid " + wherecondition1 + ";"
        // console.log(query1)
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
                // for (var i = 0; i < lstGroup.length; i++) {
                //     for (var k = 0; k < lstGroup[i].data.length; k++) {
                //         if (lstGroup[i].data[k].IsEngine == 1) {

                //         } else {

                //         }
                //     }

                // }
                var l = 0;
                var D = 0;
                var Array = [];
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
                    // var StartMilage = 0;
                    // var Milageco = 0;
                    // var Engineco = 0;
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
                                    // Milageco = 1;
                                    Engineco = 1;
                                    // id = lstGroup[i].data[k].Id;
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
                                // if ((k) != 0 && lstGroup[i].data[k].GPSPositioning == 'A') {
                                //     if (k == 0) {
                                //         Mileage += distance(parseFloat(lstGroup[i].data[k - 1].Latitude), parseFloat(lstGroup[i].data[k - 1].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                //     } else {
                                //         if (lstGroup[i].data[k].Speed > 1) {
                                //             Mileage += distance(parseFloat(lstGroup[i].data[k - 1].Latitude), parseFloat(lstGroup[i].data[k - 1].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                //         }
                                //     }
                                // } 
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
                                        // obj.s_id = lstGroup[i].data[k].Id;
                                        obj.OverSpeed = 0;
                                        obj.StartLatitude = lstGroup[i].data[k].Latitude;
                                        obj.StartLongitude = lstGroup[i].data[k].Longitude;
                                        obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                        obj.StartSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                        obj.Name = lstGroup[i].data[k].Name;
                                        obj.StartAddress = "No Address Found";
                                        obj.EndAddress = "No Address Found";
                                        // obj.StartId = lstGroup[i].data[k].Id;
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
                                    // obj.EndId = lstGroup[i].data[k].Id;
                                    // obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                                    obj.Speed6090 = Speed6090;
                                    obj.Speed90130 = Speed90130;
                                    obj.Over130 = Over130;
                                    // if (Milageco == 1) {
                                    Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                    // Milageco = 0;
                                    // }
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
                            // console.log(obj.s_id, "====", obj.EndId)
                            if (obj.DrivingTime != "0 sec") {
                                Array.push(obj);
                            }
                        }
                    }
                }

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
                            res.json(Array);
                        }
                    }
                } else {
                    res.json(Array);
                }
            })
        } else {
            res.json([]);
        }

    });

})


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
    //WhereCondition += " And Gps.DeviceId = 075034901552";
    // WhereCondition += " And Gps.IsEngine = false";
    var query = "select " +
        " gps.*,Bike.*  " +
        "from tblvehicle  As Bike " +
        "inner  join tblgpsdata as gps " +
        "on " +
        "gps.DeviceId = Bike.deviceid " +
        WhereCondition +
        " order by gps.Date Asc";
    // console.log(query);
    var query1 = "select ta.Datetime, ta.Date, ta.deviceid from tblalarm as ta left join tblvehicle As Bike on ta.deviceid = Bike.deviceid " + wherecondition1 + ";"
        // console.log(query1)
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
                // for (var i = 0; i < lstGroup.length; i++) {
                //     for (var k = 0; k < lstGroup[i].data.length; k++) {
                //         if (lstGroup[i].data[k].IsEngine == 1) {

                //         } else {

                //         }
                //     }

                // }
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
                    // var StartMilage = 0;
                    // var Milageco = 0;
                    // var Engineco = 0;
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
                                    // Milageco = 1;
                                    Engineco = 1;
                                    // id = lstGroup[i].data[k].Id;
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
                                // if ((k) != 0 && lstGroup[i].data[k].GPSPositioning == 'A') {
                                //     if (k == 0) {
                                //         Mileage += distance(parseFloat(lstGroup[i].data[k - 1].Latitude), parseFloat(lstGroup[i].data[k - 1].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                //     } else {
                                //         if (lstGroup[i].data[k].Speed > 1) {
                                //             Mileage += distance(parseFloat(lstGroup[i].data[k - 1].Latitude), parseFloat(lstGroup[i].data[k - 1].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                //         }
                                //     }
                                // } 
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
                                        // obj.s_id = lstGroup[i].data[k].Id;
                                        obj.OverSpeed = 0;
                                        obj.StartLatitude = lstGroup[i].data[k].Latitude;
                                        obj.StartLongitude = lstGroup[i].data[k].Longitude;
                                        obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                        obj.StartSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                        obj.Name = lstGroup[i].data[k].Name;
                                        obj.StartAddress = "No Address Found";
                                        obj.EndAddress = "No Address Found";
                                        // obj.StartId = lstGroup[i].data[k].Id;
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
                                    // obj.EndId = lstGroup[i].data[k].Id;
                                    // obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                                    obj.Speed6090 = Speed6090;
                                    obj.Speed90130 = Speed90130;
                                    obj.Over130 = Over130;
                                    // if (Milageco == 1) {
                                    Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                    // Milageco = 0;
                                    // }
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
                            // console.log(obj.s_id, "====", obj.EndId)
                            if (obj.DrivingTime != "0 sec") {
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

router.get('/ExportDriverReport', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
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
        //  {
        //     caption: 'Start Address',
        //     type: 'string'
        // },
        // {
        //     caption: 'End Address',
        //     type: 'string'
        // },
        {
            caption: 'Locate Number',
            type: 'string'
        }, {
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
            caption: 'Over Speed(times)',
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

    //WhereCondition += " And Gps.DeviceId = 075034901552";
    // WhereCondition += " And Gps.IsEngine = false";
    var query = "select " +
        " gps.*,Bike.*  " +
        "from tblvehicle  As Bike " +
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
                // var l = 0;
                // var D = 0;
                // var StartVehical = 0;
                // var Array = [];

                // var l = 0;
                // var D = 0;
                // var Array = [];
                // for (var i = 0; i < lstGroup.length; i++) {

                //     var IsDriving = 0;
                //     var DrivingStartPosition = 0;
                //     var TotalDrivingtime = 0;

                //     var Speed6090 = 0;
                //     var Speed90130 = 0;
                //     var Over130 = 0;
                //     var LocateNumber = 0;
                //     var objSpeed = [];
                //     var TotalRecord = 0;
                //     var Mileage = 0.00;
                //     var Totalsum = 0;
                //     if (lstGroup[i].data.length > 0) {
                //         for (var k = 0; k < lstGroup[i].data.length; k++) {
                //             lstGroup[i].data[k].Date = new Date(lstGroup[i].data[k].Date * 1000);
                //             if (lstGroup[i].data[k].IsEngine == true) {
                //                 if (lstGroup[i].data[k].Speed > 1 && lstGroup[i].data[k].GPSPositioning == 'A') {
                //                     objSpeed.push(parseFloat(lstGroup[i].data[k].Speed));
                //                     if (lstGroup[i].data[k].Speed > 60 && lstGroup[i].data[k].Speed <= 90) {
                //                         Speed6090 = Speed6090 + 1;
                //                     }
                //                     if (lstGroup[i].data[k].Speed > 90 && lstGroup[i].data[k].Speed <= 130) {
                //                         Speed90130 = Speed6090 + 1;
                //                     }
                //                     if (lstGroup[i].data[k].Speed > 130) {
                //                         Over130 = Over130 + 1;
                //                     }
                //                     TotalRecord = TotalRecord + 1;

                //                 }
                //                 if ((k) != 0) {
                //                     Mileage += distance(parseFloat(lstGroup[i].data[k - 1].Latitude), parseFloat(lstGroup[i].data[k - 1].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                //                 }

                //                 LocateNumber = LocateNumber + 1;
                //                 if (IsDriving == 0) {
                //                     DrivingStartPosition = k;
                //                     var obj = new Object();
                //                     obj.s_id = lstGroup[i].data[k].Id;
                //                     obj.StartLatitude = lstGroup[i].data[k].Latitude;
                //                     obj.StartLongitude = lstGroup[i].data[k].Longitude;
                //                     obj.DeviceId = lstGroup[i].data[k].DeviceId;
                //                     obj.StartSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                //                     obj.Name = lstGroup[i].data[k].Name;
                //                     obj.StartAddress = "No Address Found";
                //                     obj.EndAddress = "No Address Found";
                //                     obj.StartId = lstGroup[i].data[k].Id;
                //                     obj.DrivingStartTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                //                 }
                //                 IsDriving = 1;
                //             } else {
                //                 if (IsDriving == 1) {
                //                     IsDriving = 0;
                //                     obj.EndLatitude = lstGroup[i].data[k].Latitude;
                //                     obj.EndLongitude = lstGroup[i].data[k].Longitude;
                //                     obj.EndSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                //                     obj.EndDrivingTime = momentz.utc(lstGroup[i].data[k].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                //                     obj.EndId = lstGroup[i].data[k].Id;
                //                     // obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                //                     obj.Speed6090 = Speed6090;
                //                     obj.Speed90130 = Speed90130;
                //                     obj.Over130 = Over130;
                //                     obj.Mileage = parseFloat(Mileage).toFixed(2);
                //                     var sum = 0;

                //                     for (var m = 0; m < objSpeed.length; m++) {
                //                         sum += parseFloat(objSpeed[m]);
                //                     }
                //                     // console.log(sum)
                //                     if (sum != 0) {
                //                         obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                //                         obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                //                     } else {
                //                         obj.avgSpeed = 0;
                //                         obj.MaxSpeed = 0;
                //                     }
                //                     //obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                //                     obj.LocateNumber = LocateNumber;
                //                     obj.DrivingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date)));
                //                     TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                //                     // console.log(obj.s_id, "====", obj.EndId)
                //                     if (obj.DrivingTime != "0 sec") {
                //                         Array.push(obj);
                //                     }
                //                     StartVehical = 0;
                //                     Speed6090 = 0;
                //                     Speed90130 = 0;
                //                     Over130 = 0;
                //                     LocateNumber = 0;
                //                     objSpeed = [];
                //                     TotalRecord = 0;
                //                     Mileage = 0.00;
                //                 }
                //             }
                //         }
                //         if (IsDriving == 1) {
                //             IsDriving = 0;
                //             var lastposition = lstGroup[i].data.length - 1;
                //             obj.EndLatitude = lstGroup[i].data[lastposition].Latitude;
                //             obj.EndLongitude = lstGroup[i].data[lastposition].Longitude;
                //             obj.EndSpeed = parseFloat(lstGroup[i].data[lastposition].Speed).toFixed(2);
                //             obj.EndDrivingTime = momentz.utc(lstGroup[i].data[lastposition].Date).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a');
                //             obj.EndId = lstGroup[i].data[lastposition].Id;

                //             obj.Speed6090 = Speed6090;
                //             obj.Speed90130 = Speed90130;
                //             obj.Over130 = Over130;
                //             obj.Mileage = parseFloat(Mileage).toFixed(2);
                //             var sum = 0;
                //             for (var m = 0; m < objSpeed.length; m++) {
                //                 sum += parseFloat(objSpeed[m]);
                //             }
                //             // console.log(sum)
                //             if (sum != 0) {
                //                 obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                //                 obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                //             } else {
                //                 obj.avgSpeed = 0;
                //                 obj.MaxSpeed = 0;
                //             }
                //             obj.LocateNumber = LocateNumber;
                //             obj.DrivingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[lastposition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date)));
                //             TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[lastposition].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                //             // console.log(obj.s_id, "====", obj.EndId)
                //             if (obj.DrivingTime != "0 sec") {
                //                 Array.push(obj);
                //             }
                //         }
                //         // console.log("Driving Time....", calhrminsecfromsec(TotalDrivingtime))
                //     }
                // }
                var l = 0;
                var D = 0;
                var Array = [];
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
                    // var StartMilage = 0;
                    // var Milageco = 0;
                    // var Engineco = 0;
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
                                    // Milageco = 1;
                                    Engineco = 1;
                                    // id = lstGroup[i].data[k].Id;
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
                                // if ((k) != 0 && lstGroup[i].data[k].GPSPositioning == 'A') {
                                //     if (k == 0) {
                                //         Mileage += distance(parseFloat(lstGroup[i].data[k - 1].Latitude), parseFloat(lstGroup[i].data[k - 1].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                //     } else {
                                //         if (lstGroup[i].data[k].Speed > 1) {
                                //             Mileage += distance(parseFloat(lstGroup[i].data[k - 1].Latitude), parseFloat(lstGroup[i].data[k - 1].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                //         }
                                //     }
                                // }
                                if (k == 0) { LocateNumber = 1; } else {
                                    if (lstGroup[i].data[k].Latitude != lstGroup[i].data[k - 1].Latitude && lstGroup[i].data[k].Longitude != lstGroup[i].data[k - 1].Longitude) {
                                        {
                                            LocateNumber = LocateNumber + 1;
                                        }
                                    }
                                }
                                // LocateNumber = LocateNumber + 1;
                                if (parseFloat(lstGroup[i].data[k].Speed) > 1) {
                                    if (IsDriving == 0) {
                                        DrivingStartPosition = k;
                                        var obj = new Object();
                                        obj.OverSpeed = 0;
                                        // obj.s_id = lstGroup[i].data[k].Id;
                                        obj.StartLatitude = lstGroup[i].data[k].Latitude;
                                        obj.StartLongitude = lstGroup[i].data[k].Longitude;
                                        obj.DeviceId = lstGroup[i].data[k].DeviceId;
                                        obj.StartSpeed = parseFloat(lstGroup[i].data[k].Speed).toFixed(2);
                                        obj.Name = lstGroup[i].data[k].Name;
                                        obj.StartAddress = "No Address Found";
                                        obj.EndAddress = "No Address Found";
                                        // obj.StartId = lstGroup[i].data[k].Id;
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
                                    // obj.EndId = lstGroup[i].data[k].Id;
                                    // obj.MaxSpeed = parseFloat(u.max(objSpeed, function(MaxSpeeddata) { return MaxSpeeddata; })).toFixed(2);
                                    obj.Speed6090 = Speed6090;
                                    obj.Speed90130 = Speed90130;
                                    obj.Over130 = Over130;
                                    // if (Milageco == 1) {
                                    Mileage += distance(parseFloat(lstGroup[i].data[StartMilage].Latitude), parseFloat(lstGroup[i].data[StartMilage].Longitude), parseFloat(lstGroup[i].data[k].Latitude), parseFloat(lstGroup[i].data[k].Longitude));
                                    // Milageco = 0;
                                    // }
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
                                    //obj.avgSpeed = parseFloat(sum / TotalRecord).toFixed(2);
                                    obj.LocateNumber = LocateNumber;
                                    obj.DrivingTime = calhrminsecfromsec(calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date)));
                                    TotalDrivingtime = TotalDrivingtime + calcDateDiffCalInSec(moment(lstGroup[i].data[k].Date), moment(lstGroup[i].data[DrivingStartPosition].Date));
                                    // console.log(obj.s_id, "====", obj.EndId)
                                    if (obj.DrivingTime != "0 sec") {
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
                            // obj.EndId = lstGroup[i].data[lastposition].Id;

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
                            // console.log(obj.s_id, "====", obj.EndId)
                            if (obj.DrivingTime != "0 sec") {
                                Array.push(obj);
                            }
                        }
                        // console.log("Driving Time....", calhrminsecfromsec(TotalDrivingtime))
                    }
                }

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
                                // console.log(Array);
                            }
                            GetDrivingData(0);
                        }
                    }
                } else {
                    if (Array.length > 0) {
                        var data = u.sortBy(Array, function(num) { return new Date(num.DrivingStartTime1) });
                        Array = data;
                        // console.log(Array);
                    }
                    GetDrivingData(0);
                }


                // if (Array.length > 0) {
                //     var data = u.sortBy(Array, function(num) { return new Date(num.DrivingStartTime) });
                //     //.reverse();
                //     Array = data;
                // }
                // GetDrivingData(0);

                function GetDrivingData(i) {
                    var Name = '';
                    var DrivingStartTime = '';
                    var EndDrivingTime = '';
                    var DrivingTime = '';
                    // var StartAddress = 'No Address Found';
                    // var EndAddress = 'No Address Found';
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
                        var row = [];
                        if (Array[i].Name != null && Array[i].Name != '' && Array[i].Name != undefined) {
                            Name = Array[i].Name;
                        }
                        if (Array[i].DrivingStartTime != null && Array[i].DrivingStartTime != '' && Array[i].DrivingStartTime != undefined) {
                            DrivingStartTime = Array[i].DrivingStartTime.toString();
                            // DrivingStartTime = momentz.utc(Array[i].DrivingStartTime).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')
                        }
                        if (Array[i].EndDrivingTime != null && Array[i].EndDrivingTime != '' && Array[i].EndDrivingTime != undefined) {
                            EndDrivingTime = Array[i].EndDrivingTime.toString();
                            // EndDrivingTime = momentz.utc(Array[i].EndDrivingTime).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')

                        }
                        if (Array[i].DrivingTime != null && Array[i].DrivingTime != '' && Array[i].DrivingTime != undefined) {
                            DrivingTime = Array[i].DrivingTime.toString();
                            // DrivingTime = momentz.utc(Array[i].DrivingTime).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm:ss a')

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
                        // if (Array[i].EndSpeed != null && Array[i].EndSpeed != '' && Array[i].EndSpeed != undefined) {
                        //     EndSpeed = Array[i].EndSpeed.toString();
                        // }
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
                        // if (Array[i].StartLatitude != null && Array[i].StartLatitude != '' && Array[i].StartLatitude != undefined && Array[i].StartLongitude != null && Array[i].StartLongitude != '' && Array[i].StartLongitude != undefined) {
                        //     getGeocodeGenrate(Array[i].StartLatitude, Array[i].StartLongitude, function(Address) {
                        //         StartAddress = Address;
                        //         if (Array[i].EndLatitude != null && Array[i].EndLatitude != '' && Array[i].EndLatitude != undefined && Array[i].EndLongitude != null && Array[i].EndLongitude != '' && Array[i].EndLongitude != undefined) {
                        //             getGeocodeGenrate(Array[i].EndLatitude, Array[i].EndLongitude, function(Address) {
                        //                 EndAddress = Address;
                        //                 row.push(Name, DrivingStartTime, EndDrivingTime, DrivingTime, StartAddress, EndAddress, LocateNumber, Speed6090, Speed90130, Over130, MaxSpeed, avgSpeed, StartSpeed, EndSpeed, StartLongitude, StartLatitude, EndLongitude, EndLatitude);
                        //                 conf.rows.push(row);
                        //                 GetDrivingData(i + 1);
                        //             })
                        //         } else {
                        //             row.push(Name, DrivingStartTime, EndDrivingTime, DrivingTime, StartAddress, EndAddress, LocateNumber, Speed6090, Speed90130, Over130, MaxSpeed, avgSpeed, StartSpeed, EndSpeed, StartLongitude, StartLatitude, EndLongitude, EndLatitude);
                        //             conf.rows.push(row);
                        //             GetDrivingData(i + 1);
                        //         }

                        //     });
                        // } else {
                        row.push(Name, DrivingStartTime, EndDrivingTime, DrivingTime, LocateNumber, Speed6090, Speed90130, Over130, MaxSpeed, avgSpeed, OverSpeed, StartSpeed, StartLongitude, StartLatitude, EndLongitude, EndLatitude);
                        conf.rows.push(row);
                        GetDrivingData(i + 1);
                        // }
                    } else {
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

    //WhereCondition += " And Gps.DeviceId = 075034901552";
    // WhereCondition += " And Gps.IsEngine = false";
    var query = "select " +
        " gps.*,Bike.*  " +
        "from tblvehicle  As Bike " +
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
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Assest Name</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Start Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">End Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Driving Time</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">60-90 Speed (km/h)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">90-130 Speed (km/h)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Over 130 Speed (km/h)</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Max Speed</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Avearge Speed</th>' +
                    '<th style="border-bottom: 1px dotted #000;font-size:10px;font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; border-right: 1px dotted #000;">Over Speed(times)</th>' +
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
                    // var StartMilage = 0;
                    // var Milageco = 0;
                    // var Engineco = 0;
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
                        // table += '<tr><td> Total:</td>' +
                        //     '<td></td><td></td><td></td><td>' + TotalDrivingtime + '</td>' +
                        //     '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td> </td></tr></table>';
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
            caption: 'Over Speed(times)',
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

    //WhereCondition += " And Gps.DeviceId = 075034901552";
    // WhereCondition += " And Gps.IsEngine = false";
    var query = "select " +
        " gps.*,Bike.*  " +
        "from tblvehicle  As Bike " +
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
                    // var StartMilage = 0;
                    // var Milageco = 0;
                    // var Engineco = 0;
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
                        row.push(Name, DrivingStartTime, EndDrivingTime, DrivingTime, /* LocateNumber,*/ Speed6090, Speed90130, Over130, MaxSpeed, avgSpeed, OverSpeed, StartSpeed, StartLongitude, StartLatitude, EndLongitude, EndLatitude);
                        conf.rows.push(row);
                        GetDrivingData(i + 1);
                    } else {
                        row.push('Total :', '', '', TotalDrivingtime, '', '', /* LocateNumber,*/ '', '', '', '', '', '', '', '', '', '', '');
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

function getGeocodeGenrate(lat, long, callback) {
    var Address = "No Address Found";
    geocoder.reverse({ lat: lat, lon: long }, function(err, res) {

        if (res != null) {
            Address = res[0].formattedAddress;
        }

        return callback(Address);
    })
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


router.get('/DeleteGPSdatabyVehicleId', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        var search = {};
        search['$and'] = [];

        var obj = new Object();
        obj['username'] = {
            $eq: decoded.username
        };
        search['$and'].push(obj);

        var obj = new Object();
        obj['password'] = {
            $eq: decoded.password
        };
        search['$and'].push(obj);

        User.findOne({
            where: search
        }).then(function(UserExist) {
            if (UserExist != null) {

                var Encryptpassword = jwt.encode(req.query.password, "bugz");
                if (decoded.password == Encryptpassword) {
                    if (req.query.DeviceId != '' && req.query.DeviceId != null) {
                        Vehicle.findOne({
                            where: {
                                deviceid: req.query.DeviceId,
                                IsDelete: false
                            }
                        }).then(function(response) {
                            if (response) {
                                response.updateAttributes({ IsDelete: true }).then(function(resUpdate) {
                                    if (resUpdate) {
                                        funAuditLog.CreateAuditLog('Delete vehicle', decoded.username, 'Update IsDelete Status 1');
                                        if (req.query.flg == true || req.query.flg == 'true') {
                                            var obj = new Object();
                                            obj.idVehicle = response.id;
                                            obj.DeviceId = response.deviceid;
                                            obj.idUser = response.iduser;
                                            obj.Status = 'Pending';
                                            obj.CreatedDate = new Date();
                                            obj.CreatedBy = UserExist.username;
                                            GpsDeleteCash.create(obj).then(function(CashCreate) {
                                                if (CashCreate) {
                                                    funAuditLog.CreateAuditLog('Create GpsDeleteCash data', decoded.username, 'Save GpsDeleteCash data');
                                                    res.json({
                                                        success: true,
                                                        message: "Vehicle Deleted Successfully",
                                                    })
                                                } else {
                                                    res.json({
                                                        success: false,
                                                        message: "Vehicle not Deleted Successfully",
                                                    })
                                                }

                                            })

                                        } else {
                                            res.json({
                                                success: false,
                                                message: "Vehicle Deleted Successfully",
                                            })
                                        }
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "Vehicle not Deleted Successfully",
                                        })
                                    }
                                });
                            } else {
                                res.json(RecordNotFound);
                            }

                        })
                    } else {
                        res.json({
                            success: false,
                            message: "Select Vehicle To delete",
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        message: "your password is wrong..",
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }

})


module.exports = router;
//End of Tables;