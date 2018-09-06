//Tables
var router = express.Router();
var User = models.tbluserinformation;
var PetAlarm = models.tblalarm;
var Bike = models.tblbike;
var Vehicle = models.tblvehicle;

//End of Tables

router.get('/setAlarmMarkAsRead', function (req, res) {
    PetAlarm.update({ IsRead: 1 }, { where: { DeviceId: req.query.DeviceId } }).then(function (response) {
        if (response) {
            res.json({ success: true, message: 'All Notification have been marked as read..' });
        } else {
            res.json({ success: true, message: 'Err....' });
        }
    }).catch(function (error) {
        res.json(error);
    })
})
router.get('/GetAllPetAlarm', function (req, res) {
    PetAlarm.findAll().then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})

router.get('/GetPetAlarmByDeviceId', function (req, res) {
    var offset = (parseInt(req.query.page) * 10);
    PetAlarm.findAll({
        where: {
            DeviceId: req.query.DeviceId,
            Datetime: { $lte: new Date() }
        },
        offset: offset,
        limit: 10,
        order: 'Id DESC'
    }).then(function (response) {
        res.json(response);
    })
})

router.get('/GetAlarmByDeviceId', function (req, res) {
    PetAlarm.findAll({
        where: {
            DeviceId: req.query.deviceid,
            Datetime: { $lte: new Date() }
        }
    }).then(function (response) {
        res.json(response);
    })
})

router.get('/GetPetAlarmById', function (req, res) {
    PetAlarm.findOne({
        where: {
            id: req.query.idPetAlarm
        }
    }).then(function (response) {
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

router.post('/SavePetAlarm', jsonParser, function (req, res) {
    objPetAlarm = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                if (objPetAlarm.id == 0) {
                    PetAlarm.findOrCreate({
                        where: {
                            idpet: objPetAlarm.idpet
                        },
                        defaults: objPetAlarm
                    }).then(function (response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('SavePetAlarm', UserExist.username, 'Create Pet Alarm / DeviceId (' + response[1].DeviceId + ')');
                            res.json({
                                success: true,
                                message: "Pet Alarm created successfully...",
                                data: response
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "Pet Alarm is already Exist...",
                                data: response
                            });
                        }
                    })
                } else {
                    PetAlarm.findOne({
                        where: {
                            id: objPetAlarm.id
                        },
                        defaults: objPetAlarm
                    }).then(function (objPetAlarmExist) {
                        if (objPetAlarmExist != null && objPetAlarm.id != objPetAlarmExist.id) {
                            res.json({
                                success: false,
                                message: "Pet is already Exist...",
                                data: objPetAlarmExist
                            });
                        } else {
                            PetAlarm.update(objPetAlarm, {
                                where: {
                                    id: objPetAlarm.id
                                }
                            }).then(function (response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('UpdatePetAlarm', UserExist.username, 'Update Pet Alarm / (' + objPetAlarmExist.DeviceId + ')');
                                    res.json({
                                        success: true,
                                        message: "Pet Alarm updated successfully...",
                                        data: response
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Pet Alarm not updated successfully...",
                                        data: response
                                    });
                                }
                            })
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
});

router.get('/DeleteVehicleAlarm', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    var msg = null;
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                Vehicle.findAll({
                    where: {
                        iduser: req.query.UserId
                    }
                }).then(function (resBike) {
                    if (resBike == null) {
                        res.json(RecordNotFound);
                    } else {
                        function DeleteBike(i) {
                            if (i < resBike.length) {
                                PetAlarm.destroy({
                                    where: {
                                        DeviceId: resBike[i].deviceid
                                    }
                                }).then(function (response) {
                                    msg = { success: true, message: "Vehicle Alarm deleted successfully...", data: response };
                                    DeleteBike(i + 1);
                                })
                            } else {
                                funAuditLog.CreateAuditLog('DeleteVehicleAlarm', UserExist.username, 'Delete Vehicle Alarm / DeviceId (' + resBike.DeviceId + ')');
                                res.json(msg);
                            }
                        }
                        DeleteBike(0);
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});
router.get('/GetVehicleAlarmByUser', function (req, res) {
    var search = "";
    if (search != "") {
        search += " and (tpg.iduser = " + req.query.UserId + " or tsd.idUser=" + req.query.UserId + ") and tpg.IsDelete = 0";
    } else {
        search += " Where (tpg.iduser = " + req.query.UserId + " or tsd.idUser=" + req.query.UserId + ") and tpg.IsDelete = 0";
    }

    if (req.query.DeviceId != null && req.query.DeviceId != undefined && req.query.DeviceId != '-1' && req.query.DeviceId != 'All') {
        if (search != "") {
            search += " and tp.DeviceId = '" + req.query.DeviceId + "'";
        } else {
            search += " Where tp.DeviceId = '" + req.query.DeviceId + "'";
        }
    }

    if (req.query.ExpiredDevice != null && req.query.ExpiredDevice != undefined && req.query.ExpiredDevice != '') {
        if (search != "") {
            search += " and tp.DeviceId not in (" + req.query.ExpiredDevice + ")";
        } else {
            search += " Where tp.DeviceId not in (" + req.query.ExpiredDevice + ")";
        }
    }
    if (req.query.AlarmCode != null && req.query.AlarmCode != undefined && req.query.AlarmCode != '-1' && req.query.AlarmCode != 'All') {
        if (req.query.AlarmCode == 50) {
            if (search != "") {
                search += " and (tp.AlarmCode = '" + req.query.AlarmCode + "' or tp.AlarmCode=52)";
            } else {
                search += " Where (tp.AlarmCode = '" + req.query.AlarmCode + "' or tp.AlarmCode=52)";
            }
        } else if (req.query.AlarmCode == 51) {
            if (search != "") {
                search += " and (tp.AlarmCode = '" + req.query.AlarmCode + "' or tp.AlarmCode=53)";
            } else {
                search += " Where (tp.AlarmCode = '" + req.query.AlarmCode + "' or tp.AlarmCode=53)";
            }
        } else {
            if (search != "") {
                search += " and tp.AlarmCode = '" + req.query.AlarmCode + "'";
            } else {
                search += " Where tp.AlarmCode = '" + req.query.AlarmCode + "'";
            }
        }
    }
    if (req.query.StartTime != null && req.query.StartTime != undefined && req.query.StartTime != '-1' && req.query.StartTime != 'All') {
        var Startdate = req.query.StartTime;
        var convertDate = convertdateformatForUnix(Startdate);
        var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
        if (search != "") {
            search += " and tp.Date >= '" + unixStartdate + "'";
        } else {
            search += " Where tp.Date >= '" + unixStartdate + "'";
        }
    }
    if (req.query.EndTime != null && req.query.EndTime != undefined && req.query.EndTime != '-1' && req.query.EndTime != 'All') {
        var Enddate = req.query.EndTime;
        var convertDate = convertdateformatForUnix(Enddate);
        var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
        if (search != "") {
            search += " and tp.Date <= '" + unixEnddate + "'";
        } else {
            search += " Where tp.Date <= '" + unixEnddate + "'";
        }
    }
    var query = "select tp.Id,tp.CreatedDate,tp.Latitude,tp.Longitude,tp.Datetime,tp.Date,tp.DeviceId,tp.Speed,tp.AlarmCode, tp.FenceName,tp.IsRead, tpg.id,tpg.Name from tblalarm tp inner join tblvehicle tpg on tp.DeviceId = tpg.deviceid left join tblsharedevice tsd on tpg.id=tsd.idVehicle ";
    query += search;

    var limit = 10;
    if (req.query.limit != undefined && req.query.limit != null) {
        limit = req.query.limit;
    }

    var offset = (parseInt(req.query.page) * limit);

    query += " group by tp.Id order by tp.Id DESC limit " + limit + " OFFSET " + offset;

    connectionAlarmData.query(query, function (err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

function GetCurrentDate() {
    var today = new Date();

    var sec = today.getUTCSeconds();
    var min = today.getUTCMinutes();
    var hour = today.getUTCHours();

    var year = today.getUTCFullYear();
    var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getUTCDate();

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

router.post('/UpdateReadStatus', jsonParser, function (req, res) {
    objIdList = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                PetAlarm.update({
                    IsRead: 1
                }, {
                        where: { Id: { in: objIdList } }
                    }).then(function (response) {
                        io.sockets.emit(UserExist.id + 'UpdateNotification');
                        res.json({ success: true, data: response });
                    })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/GetTotalNotificationCount', function (req, res) {
    var query = "select count(tp.Id) as TotalNotificationCount from tblalarm tp Where tp.IsRead=false and tp.DeviceId = '" + req.query.DeviceId + "'";
    connection.query(query, function (err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})
router.get('/GetAllTotalNotificationCount', function (req, res) {
    var query = '';
    if (req.query.ExpiredDevice != null && req.query.ExpiredDevice != undefined && req.query.ExpiredDevice != '') {
        query = "SELECT count(tal.Id) as TotalNotificationCount  FROM tblalarm as tal left join tblvehicle tb on tal.DeviceId = tb.deviceid WHERE (tb.iduser='" + req.query.iduser + "') and IsDelete=false and tb.deviceid != '' and tal.IsRead=0 and tal.DeviceId not in (" + req.query.ExpiredDevice + ")";
    } else {
        query = "SELECT count(tal.Id) as TotalNotificationCount  FROM tblalarm as tal left join tblvehicle tb on tal.DeviceId = tb.deviceid WHERE (tb.iduser='" + req.query.iduser + "') and IsDelete=false and tb.deviceid != '' and tal.IsRead=0 ";
    }
    // var query = "select count(tp.Id) as TotalNotificationCount from tblalarm tp inner join tblvehicle tpg on tp.DeviceId = tpg.deviceid  inner join tblsharedevice ts on ts.idUser = tpg.iduser Where tp.IsRead=0 and (tpg.iduser='" + req.query.iduser + "' or ts.idUser ='" + req.query.iduser + "') and tpg.IsDelete=0 ";
    connection.query(query, function (err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

router.get('/setAlarmMarkAsReadweb', function (req, res) {
    PetAlarm.update({ IsRead: 1 }, { where: { DeviceId: { $in: req.query.DeviceArray } } }).then(function (response) {
        if (response) {
            res.json({ success: true, message: 'All Notification have been marked as read..' });
        } else {
            res.json({ success: true, message: 'Err....' });
        }
    }).catch(function (error) {
        res.json(error);
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