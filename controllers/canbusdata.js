var router = express.Router();
var User = models.tbluserinformation;
var GpsDevice = models.tblgpsdevice;
var CanBus = models.tblcanbusdata;
var DrivingBehavior = models.tbldrivingdata;
var momentz = require('moment-timezone');

router.get('/GetAllCanbusData', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = "";
    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (tcb.Datetime like "%' + objSearch + '%" or ';
        search = search + 'tcb.BatteryVoltage like "%' + objSearch + '%" or ';
        search = search + 'tcb.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tcb.EngineSpeed like "%' + objSearch + '%" or ';
        search = search + 'tcb.RunningSpeed like "%' + objSearch + '%" or ';
        search = search + 'tcb.CoolantTemperature like "%' + objSearch + '%" or ';
        search = search + 'tcb.ThrottleOpeningWidth like "%' + objSearch + '%" or ';
        search = search + 'tcb.EngineLoad like "%' + objSearch + '%" or ';
        search = search + 'tcb.InstantaneousFuelConsumption like "%' + objSearch + '%" or ';
        search = search + 'tcb.AverageFuelConsumption like "%' + objSearch + '%" or ';
        search = search + 'tcb.DrivingRange like "%' + objSearch + '%" or ';
        search = search + 'tcb.TotalMileage like "%' + objSearch + '%" or ';
        search = search + 'tcb.SingleFuelConsumptionVolume like "%' + objSearch + '%" or ';
        search = search + 'tcb.CurrentErrorCodeNumbers like "%' + objSearch + '%" or ';
        search = search + 'tcb.HarshAccelerationNo like "%' + objSearch + '%" or ';
        search = search + 'tcb.HarshBrakeNo like "%' + objSearch + '%") ';
    }

    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != 'All' && DeviceId != undefined) {
        if (search != "") {
            search += ' and tcb.DeviceId = ' + DeviceId;
        } else {
            search += ' where tcb.DeviceId = ' + DeviceId;
        }
    }

    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.StartDate != '') {
        if (search != "") {
            search += ' and tcb.Datetime >= ' + unixStartdate;
        } else {
            search += ' where tcb.Datetime >= ' + unixStartdate;
        }
    }
    if (objParam.EndDate != '') {
        if (search != "") {
            search += ' and tcb.Datetime <= ' + unixEndDate;
        } else {
            search += ' where tcb.Datetime <= ' + unixEndDate;
        }
    }

    if (search != "") {
        search += ' and tu.idApp = ' + objParam.idApp;
    } else {
        search += ' where tu.idApp = ' + objParam.idApp;
    }

    var query = "SELECT tcb.*,CONVERT_TZ(tcb.CreatedDate,'+00:00','" + CurrentOffset + "') as DisplayCreatedDate, tv.iduser, tu.idApp FROM tblcanbusdata as tcb left join tblvehicle as tv on tv.deviceid = tcb.DeviceId left join tbluserinformation as tu on tv.idUser = tu.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "SELECT count(tcb.id) as TotalRecord FROM tblcanbusdata as tcb left join tblvehicle as tv on tv.deviceid = tcb.DeviceId left join tbluserinformation as tu on tv.idUser = tu.id " + search;
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

router.get('/ExportAllCanbusData', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'Device Id',
        type: 'string'
    }, {
        caption: 'Date Time',
        type: 'string'
    }, {
        caption: 'Battery Voltage',
        type: 'string'
    }, {
        caption: 'Engine Speed',
        type: 'string'
    }, {
        caption: 'Running Speed',
        type: 'string'
    }, {
        caption: 'Coolant Temperature',
        type: 'string'
    }, {
        caption: 'Throttle Opening Width',
        type: 'string'
    }, {
        caption: 'Engine Load',
        type: 'string'
    }, {
        caption: 'Instantaneous Fuel Consumption',
        type: 'string'
    }, {
        caption: 'Average Fuel Consumption',
        type: 'string'
    }, {
        caption: 'Driving Range',
        type: 'string'
    }, {
        caption: 'Total Mileage',
        type: 'string'
    }, {
        caption: 'Single Fuel Consumption Volume',
        type: 'string'
    }, {
        caption: 'Total Fuel Consumption Volume',
        type: 'string'
    }, {
        caption: 'Current Error Code Numbers',
        type: 'string'
    }, {
        caption: 'Created Date',
        type: 'string'
    }, {
        caption: 'Harsh Acceleration No',
        type: 'string'
    }, {
        caption: 'Harsh Brake No',
        type: 'string'
    }];



    var objParam = req.query;
    var Orderby = 'Datetime DESC';
    var objSearch = objParam.search;
    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (tcb.Datetime like "%' + objSearch + '%" or ';
        search = search + 'tcb.BatteryVoltage like "%' + objSearch + '%" or ';
        search = search + 'tcb.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tcb.EngineSpeed like "%' + objSearch + '%" or ';
        search = search + 'tcb.RunningSpeed like "%' + objSearch + '%" or ';
        search = search + 'tcb.CoolantTemperature like "%' + objSearch + '%" or ';
        search = search + 'tcb.ThrottleOpeningWidth like "%' + objSearch + '%" or ';
        search = search + 'tcb.EngineLoad like "%' + objSearch + '%" or ';
        search = search + 'tcb.InstantaneousFuelConsumption like "%' + objSearch + '%" or ';
        search = search + 'tcb.AverageFuelConsumption like "%' + objSearch + '%" or ';
        search = search + 'tcb.DrivingRange like "%' + objSearch + '%" or ';
        search = search + 'tcb.TotalMileage like "%' + objSearch + '%" or ';
        search = search + 'tcb.SingleFuelConsumptionVolume like "%' + objSearch + '%" or ';
        search = search + 'tcb.CurrentErrorCodeNumbers like "%' + objSearch + '%" or ';
        search = search + 'tcb.HarshAccelerationNo like "%' + objSearch + '%" or ';
        search = search + 'tcb.HarshBrakeNo like "%' + objSearch + '%") ';
    }

    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != 'All' && DeviceId != undefined) {
        if (search != "") {
            search += ' and tcb.DeviceId = ' + DeviceId;
        } else {
            search += ' where tcb.DeviceId = ' + DeviceId;
        }
    }

    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.StartDate != '') {
        if (search != "") {
            search += ' and tcb.Datetime >= ' + unixStartdate;
        } else {
            search += ' where tcb.Datetime >= ' + unixStartdate;
        }
    }
    if (objParam.EndDate != '') {
        if (search != "") {
            search += ' and tcb.Datetime <= ' + unixEndDate;
        } else {
            search += ' where tcb.Datetime <= ' + unixEndDate;
        }
    }

    if (search != "") {
        search += ' and tu.idApp = ' + objParam.idApp;
    } else {
        search += ' where tu.idApp = ' + objParam.idApp;
    }

    var query = "SELECT tcb.*, tv.iduser, tu.idApp FROM tblcanbusdata as tcb left join tblvehicle as tv on tv.deviceid = tcb.DeviceId left join tbluserinformation as tu on tv.idUser = tu.id " + search + " order by " + Orderby;
    connection.query(query, function(err, response) {
        if (response != undefined) {
            conf.rows = [];
            var DeviceId = '';
            var Datetime = '';
            var BatteryVoltage = '';
            var EngineSpeed = '';
            var RunningSpeed = '0.00';
            var CoolantTemperature = '';
            var ThrottleOpeningWidth = '';
            var EngineLoad = '';
            var InstantaneousFuelConsumption = '';
            var AverageFuelConsumption = '';
            var DrivingRange = '';
            var TotalMileage = '0.00';
            var SingleFuelConsumptionVolume = '';
            var TotalFuelConsumptionVolume = '';
            var CurrentErrorCodeNumbers = '0';
            var HarshAccelerationNo = '0';
            var HarshBrakeNo = '0';
            var CreatedDate = '';
            // GetCanbusData(0);

            for (var i = 0; i < response.length; i++) {
                var row = [];
                if (response[i].DeviceId != null && response[i].DeviceId != '' && response[i].DeviceId != undefined) {
                    DeviceId = response[i].DeviceId;
                }

                if (response[i].Datetime != null && response[i].Datetime != '' && response[i].Datetime != undefined) {
                    // Datetime = convertdateformat(response[i].Datetime, 2);
                    Datetime = momentz.utc(new Date(response[i].Datetime * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm a');
                }

                if (response[i].BatteryVoltage != null && response[i].BatteryVoltage != '' && response[i].BatteryVoltage != undefined) {
                    BatteryVoltage = response[i].BatteryVoltage.toString()
                }

                if (response[i].EngineSpeed != null && response[i].EngineSpeed != '' && response[i].EngineSpeed != undefined) {
                    EngineSpeed = response[i].EngineSpeed.toString();
                }

                if (response[i].RunningSpeed != null && response[i].RunningSpeed != '' && response[i].RunningSpeed != undefined) {
                    RunningSpeed = response[i].RunningSpeed.toString();
                }

                if (response[i].CoolantTemperature != null && response[i].CoolantTemperature != '' && response[i].CoolantTemperature != undefined) {
                    CoolantTemperature = response[i].CoolantTemperature.toString();
                }

                if (response[i].ThrottleOpeningWidth != null && response[i].ThrottleOpeningWidth != '' && response[i].ThrottleOpeningWidth != undefined) {
                    ThrottleOpeningWidth = response[i].ThrottleOpeningWidth.toString();
                }

                if (response[i].EngineLoad != null && response[i].EngineLoad != '' && response[i].EngineLoad != undefined) {
                    EngineLoad = response[i].EngineLoad.toString();
                }

                if (response[i].InstantaneousFuelConsumption != null && response[i].InstantaneousFuelConsumption != '' && response[i].InstantaneousFuelConsumption != undefined) {
                    InstantaneousFuelConsumption = response[i].InstantaneousFuelConsumption.toString();
                }
                if (response[i].AverageFuelConsumption != null && response[i].AverageFuelConsumption != '' && response[i].AverageFuelConsumption != undefined) {
                    AverageFuelConsumption = response[i].AverageFuelConsumption.toString();
                }
                if (response[i].DrivingRange != null && response[i].DrivingRange != '' && response[i].DrivingRange != undefined) {
                    DrivingRange = response[i].DrivingRange.toString();
                }
                if (response[i].TotalMileage != null && response[i].TotalMileage != '' && response[i].TotalMileage != undefined) {
                    TotalMileage = response[i].TotalMileage.toString();
                }
                if (response[i].SingleFuelConsumptionVolume != null && response[i].SingleFuelConsumptionVolume != '' && response[i].SingleFuelConsumptionVolume != undefined) {
                    SingleFuelConsumptionVolume = response[i].SingleFuelConsumptionVolume.toString();
                }
                if (response[i].TotalFuelConsumptionVolume != null && response[i].TotalFuelConsumptionVolume != '' && response[i].TotalFuelConsumptionVolume != undefined) {
                    TotalFuelConsumptionVolume = response[i].TotalFuelConsumptionVolume.toString();
                }
                if (response[i].CurrentErrorCodeNumbers != null && response[i].CurrentErrorCodeNumbers != '' && response[i].CurrentErrorCodeNumbers != undefined) {
                    CurrentErrorCodeNumbers = response[i].CurrentErrorCodeNumbers.toString();
                }
                if (response[i].CreatedDate != null && response[i].CreatedDate != '' && response[i].CreatedDate != undefined) {
                    CreatedDate = convertdateformat(response[i].CreatedDate, 2);
                    //momentz(new Date(response[i].Datetime)).format('DD/MM/YYYY hh:mm a');
                }
                if (response[i].HarshAccelerationNo != null && response[i].HarshAccelerationNo != '' && response[i].HarshAccelerationNo != undefined) {
                    HarshAccelerationNo = response[i].HarshAccelerationNo.toString();
                }
                if (response[i].HarshBrakeNo != null && response[i].HarshBrakeNo != '' && response[i].HarshBrakeNo != undefined) {
                    HarshBrakeNo = response[i].HarshBrakeNo.toString();
                }
                row.push(DeviceId, Datetime, BatteryVoltage, EngineSpeed, RunningSpeed, CoolantTemperature, ThrottleOpeningWidth, EngineLoad, InstantaneousFuelConsumption, AverageFuelConsumption, DrivingRange, TotalMileage, SingleFuelConsumptionVolume, TotalFuelConsumptionVolume, CurrentErrorCodeNumbers, CreatedDate, HarshAccelerationNo, HarshBrakeNo);
                conf.rows.push(row);
                // GetCanbusData(i + 1);
            }
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=CanbusData.xlsx");
            res.end(result, 'binary');
        } else {
            conf.rows = [];
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=CanbusData.xlsx");
            res.end(result, 'binary');
        }
    });
});

router.get('/GetAllDrivingBehavior', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (td.Datetime like "%' + objSearch + '%" or ';
        search = search + 'td.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'td.TotalIgnition like "%' + objSearch + '%" or ';
        search = search + 'td.TotalDrivingTime like "%' + objSearch + '%" or ';
        search = search + 'td.TotalIdlingTime like "%' + objSearch + '%" or ';
        search = search + 'td.AverageHotStartTime like "%' + objSearch + '%" or ';
        search = search + 'td.AverageSpeed like "%' + objSearch + '%" or ';
        search = search + 'td.HistoryHighestSpeed like "%' + objSearch + '%" or ';
        search = search + 'td.HistoryHighestRotation like "%' + objSearch + '%" or ';
        search = search + 'td.TotalHarshAcceleration like "%' + objSearch + '%" or ';
        search = search + 'td.TotalHarshBrake like "%' + objSearch + '%") ';
    }

    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != 'All' && DeviceId != undefined) {
        if (search != "") {
            search += ' and td.DeviceId = ' + DeviceId;
        } else {
            search += ' where td.DeviceId = ' + DeviceId;
        }
    }

    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.StartDate != '') {
        if (search != "") {
            search += ' and td.Datetime >= ' + unixStartdate;
        } else {
            search += ' where td.Datetime >= ' + unixStartdate;
        }
    }
    if (objParam.EndDate != '') {
        if (search != "") {
            search += ' and td.Datetime <= ' + unixEndDate;
        } else {
            search += ' where td.Datetime <= ' + unixEndDate;
        }
    }

    if (search != "") {
        search += ' and tu.idApp = ' + objParam.idApp;
    } else {
        search += ' where tu.idApp = ' + objParam.idApp;
    }

    var query = "SELECT td.*, tv.iduser, tu.idApp FROM tbldrivingdata as td left join tblvehicle as tv ON td.DeviceId = tv.deviceid left join tbluserinformation as tu ON tv.iduser = tu.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "SELECT count(*) as TotalRecord FROM tbldrivingdata as td left join tblvehicle as tv on tv.deviceid = td.DeviceId left join tbluserinformation as tu on tv.idUser = tu.id " + search;
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

router.get('/ExportAllDrivingData', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
            caption: 'Device Id',
            type: 'string'
        }, {
            caption: 'Date Time',
            type: 'string'
        }, {
            caption: 'Total Ignition',
            type: 'string'
        }, {
            caption: 'Total Driving Time',
            type: 'string'
        }, {
            caption: 'Total Idling Time',
            type: 'string'
        }, {
            caption: 'Average Hot Start Time',
            type: 'string'
        }, {
            caption: 'Average Speed',
            type: 'string'
        }, {
            caption: 'History Highest Speed',
            type: 'string'
        }, {
            caption: 'History Highest Rotation',
            type: 'string'
        }, {
            caption: 'Total Harsh Acceleration',
            type: 'string'
        },
        {
            caption: 'Total Harsh Brake',
            type: 'string'
        }
        //    , {
        //        caption: 'CreatedDate',
        //        type: 'string'
        //    }
    ];

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = "Datetime desc";
    var objSearch = objParam.search;
    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (td.Datetime like "%' + objSearch + '%" or ';
        search = search + 'td.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'td.TotalIgnition like "%' + objSearch + '%" or ';
        search = search + 'td.TotalDrivingTime like "%' + objSearch + '%" or ';
        search = search + 'td.TotalIdlingTime like "%' + objSearch + '%" or ';
        search = search + 'td.AverageHotStartTime like "%' + objSearch + '%" or ';
        search = search + 'td.AverageSpeed like "%' + objSearch + '%" or ';
        search = search + 'td.HistoryHighestSpeed like "%' + objSearch + '%" or ';
        search = search + 'td.HistoryHighestRotation like "%' + objSearch + '%" or ';
        search = search + 'td.TotalHarshAcceleration like "%' + objSearch + '%" or ';
        search = search + 'td.TotalHarshBrake like "%' + objSearch + '%") ';
    }

    var DeviceId = objParam.DeviceId;
    if (DeviceId != null && DeviceId != '' && DeviceId != 'All' && DeviceId != undefined) {
        if (search != "") {
            search += ' and td.DeviceId = ' + DeviceId;
        } else {
            search += ' where td.DeviceId = ' + DeviceId;
        }
    }

    var StartDate = convertdateUTCformat(objParam.StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(objParam.EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.StartDate != '') {
        if (search != "") {
            search += ' and td.Datetime >= ' + unixStartdate;
        } else {
            search += ' where td.Datetime >= ' + unixStartdate;
        }
    }
    if (objParam.EndDate != '') {
        if (search != "") {
            search += ' and td.Datetime <= ' + unixEndDate;
        } else {
            search += ' where td.Datetime <= ' + unixEndDate;
        }
    }

    if (search != "") {
        search += ' and tu.idApp = ' + objParam.idApp;
    } else {
        search += ' where tu.idApp = ' + objParam.idApp;
    }

    // var query = "SELECT td.*, tv.iduser, tu.idApp FROM tbldrivingdata as td left join tblvehicle as tv ON td.DeviceId = tv.deviceid left join tbluserinformation as tu ON tv.iduser = tu.id " + search +
    //     " order by " + objOrderBy;
    var query = "SELECT td.DeviceId, td.TotalIgnition, td.TotalDrivingTime, td.TotalIdlingTime, td.AverageHotStartTime, td.AverageSpeed, td.HistoryHighestSpeed, td.HistoryHighestRotation, " +
        " td.TotalHarshAcceleration, td.TotalHarshBrake, td.Datetime, tu.idApp FROM tbldrivingdata as td left join tblvehicle as tv ON td.DeviceId = tv.deviceid left join tbluserinformation as tu ON tv.iduser = tu.id " + search +
        " order by " + objOrderBy;

    connection.query(query, function(err, response) {
        if (response != undefined) {
            conf.rows = [];
            var DeviceId = '';
            var Datetime = '';
            var TotalIgnition = '';
            var TotalDrivingTime = '';
            var TotalIdlingTime = '0.00';
            var AverageHotStartTime = '';
            var AverageSpeed = '';
            var HistoryHighestSpeed = '';
            var HistoryHighestRotation = '';
            var TotalHarshAcceleration = '';
            var TotalHarshBrake = '0';
            var CreatedDate = '';
            // GetDriverBehaviorData(0);
            // function GetDriverBehaviorData(i) {
            // if (i < response.length) {
            for (var i = 0; i < response.length; i++) {
                var row = [];
                if (response[i].DeviceId != null && response[i].DeviceId != '' && response[i].DeviceId != undefined) {
                    DeviceId = response[i].DeviceId;
                }

                if (response[i].Datetime != null && response[i].Datetime != '' && response[i].Datetime != undefined) {
                    Datetime = momentz.utc(new Date(response[i].Datetime * 1000)).tz(req.query.TimeZone).format('DD-MM-YYYY hh:mm a');
                    //momentz(new Date(response[i].Datetime * 1000)).format('DD/MM/YYYY hh:mm a');
                    // convertdateformat(response[i].Datetime, 2);
                }

                if (response[i].TotalIgnition != null && response[i].TotalIgnition != '' && response[i].TotalIgnition != undefined) {
                    TotalIgnition = response[i].TotalIgnition.toString()
                }

                if (response[i].TotalDrivingTime != null && response[i].TotalDrivingTime != '' && response[i].TotalDrivingTime != undefined) {
                    TotalDrivingTime = response[i].TotalDrivingTime.toString();
                }

                if (response[i].TotalIdlingTime != null && response[i].TotalIdlingTime != '' && response[i].TotalIdlingTime != undefined) {
                    TotalIdlingTime = response[i].TotalIdlingTime.toString();
                }

                if (response[i].TotalIdlingTime != null && response[i].TotalIdlingTime != '' && response[i].TotalIdlingTime != undefined) {
                    TotalIdlingTime = response[i].TotalIdlingTime.toString();
                }

                if (response[i].AverageHotStartTime != null && response[i].AverageHotStartTime != '' && response[i].AverageHotStartTime != undefined) {
                    AverageHotStartTime = response[i].AverageHotStartTime.toString();
                }

                if (response[i].AverageSpeed != null && response[i].AverageSpeed != '' && response[i].AverageSpeed != undefined) {
                    AverageSpeed = response[i].AverageSpeed.toString();
                }

                if (response[i].HistoryHighestSpeed != null && response[i].HistoryHighestSpeed != '' && response[i].HistoryHighestSpeed != undefined) {
                    HistoryHighestSpeed = response[i].HistoryHighestSpeed.toString();
                }
                if (response[i].HistoryHighestRotation != null && response[i].HistoryHighestRotation != '' && response[i].HistoryHighestRotation != undefined) {
                    HistoryHighestRotation = response[i].HistoryHighestRotation.toString();
                }
                if (response[i].TotalHarshAcceleration != null && response[i].TotalHarshAcceleration != '' && response[i].TotalHarshAcceleration != undefined) {
                    TotalHarshAcceleration = response[i].TotalHarshAcceleration.toString();
                }
                if (response[i].TotalHarshBrake != null && response[i].TotalHarshBrake != '' && response[i].TotalHarshBrake != undefined) {
                    TotalHarshBrake = response[i].TotalHarshBrake.toString();
                }
                row.push(DeviceId, Datetime, TotalIgnition, TotalDrivingTime, TotalIdlingTime, AverageHotStartTime, AverageSpeed, HistoryHighestSpeed, HistoryHighestRotation, TotalHarshAcceleration, TotalHarshBrake);
                conf.rows.push(row);
                // GetDriverBehaviorData(i + 1);
            }
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=DrivingBehavior.xlsx");
            res.end(result, 'binary');
        } else {
            conf.rows = [];
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=Nodata.xlsx");
            res.end(result, 'binary');
        }
    })
});

function convertdateformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();
    var amPM = (firstdayHours > 11) ? "pm" : "am";
    if (flg == 1) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "23:59:59";
    } else if (flg == "Excel Export") {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
    } else if (flg == 2) {
        return ("00" + firstdayDay.toString()).slice(-2) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayYear.toString()).slice(-4) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + "" + amPM;
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


module.exports = router;