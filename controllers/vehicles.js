var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var UserInRole = models.tbluserinrole;
var DrivingData = models.tbldrivingdata;
var GPSData = models.tblgpsdata;
var Alarm = models.tblalarm;
//End of Tables

router.get('/GetAllDynamicVehicle', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (vehicle.Name like "%' + objSearch + '%" or ';
        search = search + 'user.username like "%' + objSearch + '%" or ';
        search = search + 'vehicle.deviceid like "%' + objSearch + '%" or ';
        search = search + 'vehicle.BatteryPercentage like "%' + objSearch + '%" or ';
        search = search + 'vehicle.HandshakDatetime like "%' + objSearch + '%" or ';
        search = search + 'vehicle.IsOnline like "%' + objSearch + '%") ';
    }

    if (objParam.UserId != null && objParam.UserId != '' && objParam.UserId != undefined) {
        if (search != "") {
            search += ' and vehicle.idSalesAgent = ' + objParam.UserId;
        } else {
            search += ' where vehicle.idSalesAgent = ' + objParam.UserId;
        }
    }

    if (search != "") {
        search += ' and vehicle.IsDelete = 0 ';
    } else {
        search += ' where vehicle.IsDelete = 0 ';
    }



    var qry = "Select vehicle.*, " +
        "user.username AS username " +
        "FROM tblvehicle AS vehicle " +
        "LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "SELECT count(vehicle.id) as TotalRecord " +
        "FROM tblvehicle AS vehicle " +
        "LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search;

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
});

router.post('/SaveVehicle', jsonParser, function(req, res) {
    objVehicle = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (objVehicle.id == 0) {
                    objVehicle.CreatedDate = new Date();
                    objVehicle.CreatedBy = decoded.username;
                    Vehicle.findOrCreate({ where: { deviceid: objVehicle.deviceid }, defaults: objVehicle }).then(function(response) {
                        if (response[0]) {
                            funAuditLog.CreateAuditLog('SaveVehicle', decoded.username, 'Create Vehicle');
                            res.json({
                                success: true,
                                message: "Vehicle Detail created successfully...",
                                data: response
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "Vehicle Detail is already Exist...",
                                data: response
                            });
                        }
                    })
                } else {
                    objVehicle.ModifiedDate = new Date();
                    objVehicle.ModifiedBy = decoded.username;
                    Vehicle.update(objVehicle, {
                        where: {
                            id: objVehicle.id
                        }
                    }).then(function(response) {
                        if (response[0]) {
                            funAuditLog.CreateAuditLog('SaveVehicle', decoded.username, 'Update Vehicle');
                            res.json({
                                success: true,
                                message: "Vehicle Detail updated successfully...",
                                data: response
                            });
                        }
                    })
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/DeleteVehicle', function(req, res) {
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
        if (req.query.Type == 'Owner') {
            var obj = new Object();
            obj['password'] = {
                $eq: decoded.password
            };
            search['$and'].push(obj);
        } else {
            var obj = new Object();
            obj['password'] = {
                $eq: decoded.password
            };
            search['$and'].push(obj);
        }

        User.findOne({
            where: search
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (req.query.id != '' && req.query.id != null) {
                    Vehicle.findOne({
                        where: {
                            id: req.query.id,
                            IsDelete: false
                        }
                    }).then(function(response) {
                        if (response) {
                            response.updateAttributes({ IsDelete: true }).then(function(resUpdate) {
                                funAuditLog.CreateAuditLog('DeleteVehicle', UserExist.username, 'Delete Vehicle');
                                res.json({
                                    success: true,
                                    message: "Vehicle Deleted Successfully",
                                    data: response
                                });
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
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
    //     } else {
    //         res.json(NoAccessPermission);
    //     }
    // });
});

router.get('/GetAllVehicleByUser', function(req, res) {
    if (req.query.iduser != null || req.query.iduser != undefined) {

        var search = {};

        search['$and'] = [];
        if (req.query.idSalesAgent != null && req.query.idSalesAgent != '' && req.query.idSalesAgent != undefined) {
            var obj = new Object();
            obj['idSalesAgent'] = {
                $eq: req.query.idSalesAgent
            };
            search['$and'].push(obj);
        }


        Vehicle.findAll({
            where: [search, {
                IsDelete: 0,
                deviceid: {
                    $ne: '',
                },
                iduser: req.query.iduser,
            }],
            order: 'CreatedDate'
        }).then(function(response) {
            res.json(response);
        }).catch(function(error) {
            res.json(error);
        })
    } else {
        res.json(RecordNotFound);
    }

})

router.get('/GetAllVehicleById', function(req, res) {
    if (req.query.id != null || req.query.id != undefined) {
        var search = {};

        search['$and'] = [];

        var obj = new Object();
        obj['id'] = {
            $eq: req.query.id
        };
        search['$and'].push(obj);

        var obj = new Object();
        obj['IsDelete'] = {
            $eq: false
        };
        search['$and'].push(obj);
        Vehicle.findOne({
            where: search,
        }).then(function(response) {
            res.json(response);
        }).catch(function(error) {
            res.json(error);
        })
    } else {
        res.json(RecordNotFound);
    }

})

router.get('/GetDrivingDataByDeviceId', function(req, res) {
    DrivingData.findOne({
        where: { DeviceId: req.query.DeviceId },
        order: 'Datetime desc'
    }).then(function(response) {
        res.json({
            success: true,
            message: "Record found...",
            data: response
        });
    }).catch(function(error) {
        res.json(RecordNotFound);
    })

})

router.get('/GetVehicleCurrentLocation', function(req, res) {

    var Startdate = new Date();

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    GPSData.findOne({
        where: {
            DeviceId: req.query.DeviceId,
            Date: { $lte: unixStartdate }
        },
        order: 'id DESC'
    }).then(function(response) {
        if (response != null) {
            res.json({ success: true, data: response });
        } else {
            res.json(RecordNotFound);
        }
    })
});

router.get('/GetAllFenceInAndOutData', function(req, res) {
    var objParam = req.query;
    var Orderby = 'Date DESC';
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

    var query = "Select tblalarm.* , tblvehicle.iduser, tblvehicle.Name, tblvehicle.IsOnline from tblalarm left join tblvehicle On tblvehicle.deviceid = tblalarm.DeviceId " + search;

    connection.query(query, function(err, response) {
        if (response != undefined) {
            res.json(response);
        } else {
            var response1 = new Object()
            res.json(response1);
        }
    })

    // // var AlarmCode = objParam.AlarmCode;



    // if (objParam.StartDate != '' && objParam.EndDate != '') {
    //     var obj = new Object();
    //     obj['Date'] = {
    //         $between: [unixStartdate, unixEndDate]
    //     };
    //     search['$and'].push(obj);
    // } else if (objParam.StartDate != null && objParam.StartDate != '') {
    //     var obj = new Object();
    //     obj['Date'] = {
    //         $gt: unixStartdate
    //     };
    //     search['$and'].push(obj);
    // } else if (objParam.EndDate != null && objParam.EndDate != '') {
    //     var obj = new Object();
    //     obj['Date'] = {
    //         $lt: unixEndDate
    //     };
    //     search['$and'].push(obj);
    // }

    // Alarm.findAndCountAll({
    //     where: search,
    //     order: Orderby,
    //     // offset: parseInt(objParam.start),
    //     // limit: parseInt(objParam.length),
    // }).then(function(response) {
    //     // var response1 = new Object();
    //     // response1.draw = objParam.draw;
    //     // response1.recordsTotal = response.count;
    //     // response1.recordsFiltered = response.count;
    //     // response1.data = response.rows;
    //     res.json(response);
    // }).catch(function(error) {
    //     res.json(error);
    // })
})

function convertdateformatForUnix(date1) {
    var date = date1;
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

}

module.exports = router