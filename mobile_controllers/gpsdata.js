var router = express.Router();
var User = models.tbluserinformation;
var Bike = models.tblvehicle;
var Vehicle = models.tblvehicle;
var GpsDeleteCash = models.tblgpsdeletecash;
//gpsdata
//---------------(Mobile App & webapp):-(Delete vehicle data)--------
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
    //-----------------------end Speed report-------------------------------------
    // New Working hour report


//=------------------------------working hour report----------------------------
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
    //------------------End Export report-----------------------------------

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


module.exports = router;
//End of Tables;