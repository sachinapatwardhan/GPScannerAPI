var router = express.Router();
var User = models.tbluserinformation;
var GpsDevice = models.tblgpsdevice;
var CanBus = models.tblcanbusdata;
var DrivingBehavior = models.tbldrivingdata;

router.get('/GetAllCanbusData', function(req, res) {
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
    var StartDate = objParam.StartDate;
    var EndDate = objParam.EndDate;
    if (StartDate != '' && EndDate != '') {
        StartDate = convertdateformat(StartDate, 0);
        EndDate = convertdateformat(EndDate, 1);
        var obj = new Object();
        obj['CreatedDate'] = {
            $between: [StartDate, EndDate]
        };
        search['$and'].push(obj);
    } else if (StartDate != null && StartDate != '') {
        StartDate = convertdateformat(StartDate, 0);
        var obj = new Object();
        obj['CreatedDate'] = {
            $gt: StartDate
        };
        search['$and'].push(obj);
    } else if (EndDate != null && EndDate != '') {
        EndDate = convertdateformat(EndDate, 1);
        var obj = new Object();
        obj['CreatedDate'] = {
            $lt: EndDate
        };
        search['$and'].push(obj);
    }
    CanBus.findAndCountAll({
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

router.get('/ExportAllCanbusData', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'DeviceId',
        type: 'string'
    }, {
        caption: 'Datetime',
        type: 'string'
    }, {
        caption: 'BatteryVoltage',
        type: 'string'
    }, {
        caption: 'EngineSpeed',
        type: 'string'
    }, {
        caption: 'RunningSpeed',
        type: 'string'
    }, {
        caption: 'CoolantTemperature',
        type: 'string'
    }, {
        caption: 'ThrottleOpeningWidth',
        type: 'string'
    }, {
        caption: 'EngineLoad',
        type: 'string'
    }, {
        caption: 'InstantaneousFuelConsumption',
        type: 'string'
    }, {
        caption: 'AverageFuelConsumption',
        type: 'string'
    }, {
        caption: 'DrivingRange',
        type: 'string'
    }, {
        caption: 'TotalMileage',
        type: 'string'
    }, {
        caption: 'SingleFuelConsumptionVolume',
        type: 'string'
    }, {
        caption: 'TotalFuelConsumptionVolume',
        type: 'string'
    }, {
        caption: 'CurrentErrorCodeNumbers',
        type: 'string'
    }, {
        caption: 'CreatedDate',
        type: 'string'
    }, {
        caption: 'HarshAccelerationNo',
        type: 'string'
    }, {
        caption: 'HarshBrakeNo',
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
    var StartDate = objParam.StartDate;
    var EndDate = objParam.EndDate;
    if (StartDate != '' && EndDate != '' && StartDate != undefined && EndDate != undefined) {
        StartDate = convertdateformat(StartDate, 0);
        EndDate = convertdateformat(EndDate, 1);
        var obj = new Object();
        obj['CreatedDate'] = {
            $between: [StartDate, EndDate]
        };
        search['$and'].push(obj);
    } else if (StartDate != null && StartDate != '' && StartDate != undefined) {
        StartDate = convertdateformat(StartDate, 0);
        var obj = new Object();
        obj['CreatedDate'] = {
            $gt: StartDate
        };
        search['$and'].push(obj);
    } else if (EndDate != null && EndDate != '' && EndDate != undefined) {
        EndDate = convertdateformat(EndDate, 1);
        var obj = new Object();
        obj['CreatedDate'] = {
            $lt: EndDate
        };
        search['$and'].push(obj);
    }

    CanBus.findAll({
        where: search,
        order: Orderby,
    }).then(function(response) {
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
        GetCanbusData(0);

        function GetCanbusData(i) {
            if (i < response.length) {
                var row = [];
                if (response[i].DeviceId != null && response[i].DeviceId != '' && response[i].DeviceId != undefined) {
                    DeviceId = response[i].DeviceId;
                }

                if (response[i].Datetime != null && response[i].Datetime != '' && response[i].Datetime != undefined) {
                    Datetime = convertdateformat(response[i].Datetime, 2);
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
                }
                if (response[i].HarshAccelerationNo != null && response[i].HarshAccelerationNo != '' && response[i].HarshAccelerationNo != undefined) {
                    HarshAccelerationNo = response[i].HarshAccelerationNo.toString();
                }
                if (response[i].HarshBrakeNo != null && response[i].HarshBrakeNo != '' && response[i].HarshBrakeNo != undefined) {
                    HarshBrakeNo = response[i].HarshBrakeNo.toString();
                }
                row.push(DeviceId, Datetime, BatteryVoltage, EngineSpeed, RunningSpeed, CoolantTemperature, ThrottleOpeningWidth, EngineLoad, InstantaneousFuelConsumption, AverageFuelConsumption, DrivingRange, TotalMileage, SingleFuelConsumptionVolume, TotalFuelConsumptionVolume, CurrentErrorCodeNumbers, CreatedDate, HarshAccelerationNo, HarshBrakeNo);
                conf.rows.push(row);
                GetCanbusData(i + 1);
            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=CanbusData.xlsx");
                res.end(result, 'binary');
            }

        }
    });
});

router.get('/GetAllDrivingBehavior', function(req, res) {
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
    var StartDate = objParam.StartDate;
    var EndDate = objParam.EndDate;
    if (StartDate != '' && EndDate != '') {
        StartDate = convertdateformat(StartDate, 0);
        EndDate = convertdateformat(EndDate, 1);
        var obj = new Object();
        obj['CreatedDate'] = {
            $between: [StartDate, EndDate]
        };
        search['$and'].push(obj);
    } else if (StartDate != null && StartDate != '') {
        StartDate = convertdateformat(StartDate, 0);
        var obj = new Object();
        obj['CreatedDate'] = {
            $gt: StartDate
        };
        search['$and'].push(obj);
    } else if (EndDate != null && EndDate != '') {
        EndDate = convertdateformat(EndDate, 1);
        var obj = new Object();
        obj['CreatedDate'] = {
            $lt: EndDate
        };
        search['$and'].push(obj);
    }
    DrivingBehavior.findAndCountAll({
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

router.get('/ExportAllDrivingData', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'DeviceId',
        type: 'string'
    }, {
        caption: 'Datetime',
        type: 'string'
    }, {
        caption: 'TotalIgnition',
        type: 'string'
    }, {
        caption: 'TotalDrivingTime',
        type: 'string'
    }, {
        caption: 'TotalIdlingTime',
        type: 'string'
    }, {
        caption: 'AverageHotStartTime',
        type: 'string'
    }, {
        caption: 'AverageSpeed',
        type: 'string'
    }, {
        caption: 'HistoryHighestSpeed',
        type: 'string'
    }, {
        caption: 'HistoryHighestRotation',
        type: 'string'
    }, {
        caption: 'TotalHarshAcceleration',
        type: 'string'
    }, {
        caption: 'TotalHarshBrake',
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
    var StartDate = objParam.StartDate;
    var EndDate = objParam.EndDate;
    if (StartDate != '' && EndDate != '' && StartDate != undefined && EndDate != undefined) {
        StartDate = convertdateformat(StartDate, 0);
        EndDate = convertdateformat(EndDate, 1);
        var obj = new Object();
        obj['CreatedDate'] = {
            $between: [StartDate, EndDate]
        };
        search['$and'].push(obj);
    } else if (StartDate != null && StartDate != '' && StartDate != undefined) {
        StartDate = convertdateformat(StartDate, 0);
        var obj = new Object();
        obj['CreatedDate'] = {
            $gt: StartDate
        };
        search['$and'].push(obj);
    } else if (EndDate != null && EndDate != '' && EndDate != undefined) {
        EndDate = convertdateformat(EndDate, 1);
        var obj = new Object();
        obj['CreatedDate'] = {
            $lt: EndDate
        };
        search['$and'].push(obj);
    }

    DrivingBehavior.findAll({
        where: search,
        order: Orderby,
    }).then(function(response) {
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
        var TotalHarshBrake = '';
        var CreatedDate = '';
        GetDriverBehaviorData(0);

        function GetDriverBehaviorData(i) {
            if (i < response.length) {
                var row = [];
                if (response[i].DeviceId != null && response[i].DeviceId != '' && response[i].DeviceId != undefined) {
                    DeviceId = response[i].DeviceId;
                }

                if (response[i].Datetime != null && response[i].Datetime != '' && response[i].Datetime != undefined) {
                    Datetime = convertdateformat(response[i].Datetime, 2);
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
                if (response[i].CreatedDate != null && response[i].CreatedDate != '' && response[i].CreatedDate != undefined) {
                    CreatedDate = convertdateformat(response[i].CreatedDate, 2);
                }
                row.push(DeviceId, Datetime, TotalIgnition, TotalDrivingTime, TotalIdlingTime, AverageHotStartTime, AverageSpeed, HistoryHighestSpeed, HistoryHighestRotation, TotalHarshAcceleration, TotalHarshBrake, CreatedDate);
                conf.rows.push(row);
                GetDriverBehaviorData(i + 1);
            } else {
                var result = nodeExcel.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=DrivingBehavior.xlsx");
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
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();
    if (flg == 1) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "23:59:59";
    } else if (flg == "Excel Export") {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
    } else if (flg == 2) {
        return ("00" + firstdayDay.toString()).slice(-2) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayYear.toString()).slice(-4);
    } else {
        //return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}

module.exports = router;