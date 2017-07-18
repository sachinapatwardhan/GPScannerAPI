//Tables
var router = express.Router();
var User = models.tbluserinformation;
var PetAlarm = models.tblalarm;
var Bike = models.tblbike;

//End of Tables

router.get('/GetAllPetAlarm', function(req, res) {
    PetAlarm.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetPetAlarmByDeviceId', function(req, res) {
    var offset = (parseInt(req.query.page) * 10);
    PetAlarm.findAll({
        where: {
            DeviceId: req.query.DeviceId,
            Datetime: { $lte: new Date() }
        },
        offset: offset,
        limit: 10,
        order: 'Id DESC'
    }).then(function(response) {
        res.json(response);
    })
})

router.get('/GetAlarmByDeviceId', function(req, res) {
    PetAlarm.findAll({
        where: {
            DeviceId: req.query.deviceid,
            Datetime: { $lte: new Date() }
        }
    }).then(function(response) {
        res.json(response);
    })
})

router.get('/GetPetAlarmById', function(req, res) {
    PetAlarm.findOne({
        where: {
            id: req.query.idPetAlarm
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

router.post('/SavePetAlarm', jsonParser, function(req, res) {
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
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (objPetAlarm.id == 0) {
                    PetAlarm.findOrCreate({
                        where: {
                            idpet: objPetAlarm.idpet
                        },
                        defaults: objPetAlarm
                    }).then(function(response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('SavePetAlarm', UserExist.username, 'Create Pet Alarm');
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
                    }).then(function(objPetAlarmExist) {
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
                            }).then(function(response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('SavePetAlarm', UserExist.username, 'Update Pet Alarm');
                                    res.json({
                                        success: true,
                                        message: "Pet Alarm updated successfully...",
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

router.get('/DeleteBikeAlarm', function(req, res) {
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
                Bike.findAll({
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
                                    msg = { success: true, message: "Bike Alarm deleted successfully...", data: response };
                                    DeleteBike(i + 1);
                                })
                            } else {
                                funAuditLog.CreateAuditLog('DeletePetAlarm', UserExist.username, 'Delete Pet Alarm');
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
router.get('/GetBikeAlarmByUser', function(req, res) {
    var offset = (parseInt(req.query.page) * 10);
    console.log(offset)
        //connection.query("select  tp.*, tpg.* from tblalarm tp inner join tblbike tpg where tp.DeviceId = tpg.deviceid and tpg.iduser = " + req.query.UserId + " and tpg.IsDeleted = 0 and tpg.DeviceType = 'M2-U' and tp.Datetime <='" + GetCurrentDate() + "' order by Datetime DESC limit 10 OFFSET " + offset, function(err, rows, fields) {
    connection.query("select  tp.Id,tp.Datetime,tp.DeviceId,tp.Speed,tp.AlarmCode, tpg.id,tpg.bikeNumber from tblalarm tp inner join tblbike tpg where tp.DeviceId = tpg.deviceid and tpg.iduser = " + req.query.UserId + " and tpg.IsDeleted = 0 and tpg.DeviceType != 'M2' and tp.Datetime <='" + GetCurrentDate() + "' order by tp.Id DESC limit 10 OFFSET " + offset, function(err, rows, fields) {
        console.log(err)
        if (!err) {
            res.json({ success: true, data: rows });
        } else {

            res.json({ success: false, data: [] });
        }
    })

    // PetAlarm.findAll({
    //     where: {
    //         DeviceId: req.query.DeviceId
    //     },
    //     offset: offset,
    //     limit: 10,
    //     order: 'Id DESC'
    // }).then(function(response) {
    //     res.json(response);
    // })
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
module.exports = router