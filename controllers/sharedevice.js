var router = express.Router();
var User = models.tbluserinformation;
var SharedDevice = models.tblsharedevice;

router.get('/GetAllSharedDeviceByUser', function(req, res) {
    SharedDevice.findAll({
        where: { DeviceId: req.query.DeviceId, $or: [{ idSharedUser: req.query.idSharedUser }, { idUser: req.query.idSharedUser }] },
        order: 'CreatedDate DESC'
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
});

router.post('/SaveSharedUser', jsonParser, function(req, res) {
    objUser = req.body;

    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { email: objUser.email } }).then(function(chkUserExist) {
            if (chkUserExist != null) {
                objUser.idUser = chkUserExist.id;
                objUser.CreatedDate = new Date();
                objUser.CreatedBy = decoded.username;
                SharedDevice.findOne({ where: { DeviceId: objUser.DeviceId, idUser: objUser.idUser, idSharedUser: objUser.idSharedUser } }).then(function(resExist) {
                    if (resExist != null) {
                        res.json({
                            success: false,
                            message: "Vehicle is already Shared With This User...",
                            data: resExist
                        });

                    } else {
                        SharedDevice.create(objUser).then(function(response) {
                            funAuditLog.CreateAuditLog('ShareDevice', decoded.username, 'Share Vehicle');
                            res.json({
                                success: true,
                                message: "Vehicle Shared successfully...",
                                data: response
                            });

                            var objConnection = {
                                UserId: objUser.idUser,
                                DeviceId: objUser.DeviceId
                            }
                            io.sockets.emit('ShareStatus', JSON.stringify(objConnection));
                            io.sockets.emit(objUser.idUser + 'ShareStatus', JSON.stringify(objConnection));
                        })
                    }
                })
            } else {
                res.json({
                    success: false,
                    message: "User is not Exist...",
                    data: 1,
                });
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/ChangeSharedNotificationSetting', function(req, res) {

    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        var query = "Update tblsharedevice set IsSharedUserNotification=" + req.query.IsSharedUserNotification + ", IsNotification=" + req.query.IsNotification + " where id='" + req.query.id + "'";
        connection.query(query, function(err, rows, fields) {
            if (!err) {
                res.json({ success: true, message: 'Main Notification Setting Changed Successfully.' });
                funAuditLog.CreateAuditLog('ChangeMainShareNotification', decoded.username, 'Change Main Share Notification');
                var objConnection = {
                    id: req.query.id,
                    UserId: req.query.idUser,
                    IsSharedNotification: req.query.IsSharedUserNotification
                }
                io.sockets.emit('ShareNotification', JSON.stringify(objConnection));
                io.sockets.emit(req.query.idUser + 'ShareNotification', JSON.stringify(objConnection));
            } else {
                console.log(err);
                res.json({ success: false, message: 'Notification Setting could not Changed. Try again later.' });
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/ChangeNotificationSetting', function(req, res) {

    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        var query = "Update tblsharedevice set IsNotification=" + req.query.IsNotification + " where id='" + req.query.id + "'";
        console.log(query);
        connection.query(query, function(err, rows, fields) {
            if (!err) {
                res.json({ success: true, message: 'Notification Setting Changed Successfully.' });
                funAuditLog.CreateAuditLog('ChangeSubShareNotification', decoded.username, 'Change Sub Share Notification');
            } else {
                console.log(err);
                res.json({ success: false, message: 'Notification Setting could not Changed. Try again later.' });
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/RemoveSharedUser', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        SharedDevice.destroy({ where: { id: req.query.id } }).then(function(response) {
            if (response) {
                funAuditLog.CreateAuditLog('DeleteSharedUser', decoded.username, 'Delete Shared User');
                res.json({ success: true, message: "User Removed successfully...", data: response });

                var objConnection = {
                    UserId: req.query.UserId,
                    DeviceId: req.query.DeviceId
                }
                io.sockets.emit('ShareStatus', JSON.stringify(objConnection));
                io.sockets.emit(req.query.UserId + 'ShareStatus', JSON.stringify(objConnection));

            } else {
                res.json({ success: false, message: 'User not Removed.' });
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

module.exports = router