//Tables
var router = express.Router();
var User = models.tbluserinformation;
var PetAlarm = models.tblalarm;
var Vehicle = models.tblvehicle;

//End of Tables
//------------MobileApp:-clear alarm----------------------------
router.get('/DeleteVehicleAlarm', function(req, res) {
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
        }).then(function(UserExist) {
            if (UserExist != null) {
                Vehicle.findAll({
                    where: {
                        iduser: req.query.UserId
                    }
                }).then(function(resBike) {
                    if (resBike == null) {
                        res.json(RecordNotFound);
                    } else {
                        function DeleteBike(i) {
                            if (i < resBike.length) {
                                PetAlarm.destroy({
                                    where: {
                                        DeviceId: resBike[i].deviceid
                                    }
                                }).then(function(response) {
                                    msg = { success: true, message: "Vehicle Alarm deleted successfully...", data: response };
                                    DeleteBike(i + 1);
                                })
                            } else {
                                funAuditLog.CreateAuditLog('DeleteVehicleAlarm', UserExist.username, 'Delete Vehicle Alarm');
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

//-------------------(Mobileapp & webapp):- Get alarm by vehicle------------------
router.get('/GetVehicleAlarmByUser', function(req, res) {
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
    var query = "select tp.Id,tp.CreatedDate,tp.Datetime,tp.Date,tp.DeviceId,tp.Speed,tp.AlarmCode, tp.FenceName,tp.IsRead, tpg.id,tpg.Name from tblalarm tp inner join tblvehicle tpg on tp.DeviceId = tpg.deviceid left join tblsharedevice tsd on tpg.id=tsd.idVehicle ";
    query += search;

    var limit = 10;
    if (req.query.limit != undefined && req.query.limit != null) {
        limit = req.query.limit;
    }

    var offset = (parseInt(req.query.page) * limit);

    query += " group by tp.Id order by tp.Id DESC limit " + limit + " OFFSET " + offset;

    connection.query(query, function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

//-------------------(Mobileapp & webapp):- for read alarm update status------------------
router.post('/UpdateReadStatus', jsonParser, function(req, res) {
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
        }).then(function(UserExist) {
            if (UserExist != null) {
                PetAlarm.update({
                    IsRead: 1
                }, {
                    where: { Id: { in: objIdList } }
                }).then(function(response) {
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

//-------------------(Mobileapp):-Total notification of device-----------------
router.get('/GetTotalNotificationCount', function(req, res) {
    var query = "select count(tp.Id) as TotalNotificationCount from tblalarm tp Where tp.IsRead=false and tp.DeviceId = '" + req.query.DeviceId + "'";
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

//-------------------(Webapp):-Total notification -----------------
router.get('/GetAllTotalNotificationCount', function(req, res) {
    var query = "SELECT count(tal.Id) as TotalNotificationCount  FROM tblalarm as tal left join tblvehicle tb on tal.DeviceId = tb.deviceid WHERE (tb.iduser='" + req.query.iduser + "') and IsDelete=false and tb.deviceid != '' and tal.IsRead=0 ";
    // var query = "select count(tp.Id) as TotalNotificationCount from tblalarm tp inner join tblvehicle tpg on tp.DeviceId = tpg.deviceid  inner join tblsharedevice ts on ts.idUser = tpg.iduser Where tp.IsRead=0 and (tpg.iduser='" + req.query.iduser + "' or ts.idUser ='" + req.query.iduser + "') and tpg.IsDelete=0 ";
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

module.exports = router