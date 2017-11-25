var router = express.Router();
var User = models.tbluserinformation;
var SharedDevice = models.tblsharedevice;
var EmailTemplate = models.tblemailtemplate;
var SystemEmail = models.tblemailsettingsys;
var SharedEmail = models.tblsharedemail;

router.get('/GetAllSharedDeviceByUser', function(req, res) {
    SharedDevice.belongsTo(User, {
        foreignKey: {
            name: 'idUser',
            allowNull: false
        }
    });
    SharedDevice.findAll({
        include: [{
            model: User,
            attributes: ['id', 'email', 'username'],
        }],
        where: { DeviceId: req.query.DeviceId, $or: [{ idSharedUser: req.query.idSharedUser }, { idUser: req.query.idSharedUser }] },
        order: 'CreatedDate DESC'
    }).then(function(response) {
        SharedEmail.findAll({ where: { idUser: req.query.idSharedUser, DeviceId: req.query.DeviceId, Status: 'Pending' } }).then(function(resShare) {
            res.json({ "lstSharedUser": response, "lstSharedInvite": resShare });
        })
    }).catch(function(error) {
        res.json(error);
    })
});

// router.get('/GetAllSharedDeviceByUser', function(req, res) {
//     SharedDevice.belongsTo(User, {
//         foreignKey: {
//             name: 'idUser',
//             allowNull: false
//         }
//     });
//     SharedDevice.findAll({
//         include: [{
//             model: User,
//             attributes: ['id', 'email', 'username'],
//         }],
//         where: { DeviceId: req.query.DeviceId, $or: [{ idSharedUser: req.query.idSharedUser }, { idUser: req.query.idSharedUser }] },
//         order: 'CreatedDate DESC'
//     }).then(function(response) {
//         res.json(response);
//     }).catch(function(error) {
//         res.json(error);
//     })
// });

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

router.post('/SaveSharedUserNew', jsonParser, function(req, res) {
    objUser = req.body;

    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { email: objUser.email, idApp: objUser.idApp } }).then(function(chkUserExist) {
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
router.get('/GetAllInvitedEmail', jsonParser, function(req, res) {
    SharedEmail.findAll({ where: { DeviceId: req.query.DeviceId } }).then(function(response) {
        res.json(response);
    })
})
router.post('/InvitedNewUser', jsonParser, function(req, res) {
    objUser = req.body;

    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                var ObjSharedEmail = new Object();
                ObjSharedEmail.DeviceId = objUser.DeviceId;
                ObjSharedEmail.SharedEmail = objUser.email;
                ObjSharedEmail.Status = 'Pending';
                ObjSharedEmail.idUser = objUser.idSharedUser;
                ObjSharedEmail.CreatedDate = new Date();
                SharedEmail.findOrCreate({
                    where: {
                        DeviceId: ObjSharedEmail.DeviceId,
                        SharedEmail: ObjSharedEmail.SharedEmail
                    },
                    defaults: ObjSharedEmail
                }).then(function(SharedEmailExit) {
                    if (SharedEmailExit[1]) {
                        SystemEmail.findOne().then(function(objSystemEmail) {
                            EmailTemplate.findOne({
                                where: {
                                    Type: "Invitation Email",
                                }
                            }).then(function(objEmailTemplate) {

                                var fromid = '';
                                if (UserExist.email == '' || UserExist.email == null || UserExist.email == undefined) {
                                    fromid = objSystemEmail.DefaultEmailFrom;
                                } else {
                                    fromid = UserExist.email;
                                }
                                var body = objEmailTemplate.EmailBody.replace(/{AppName}/g, objUser.AppName).replace(/{email}/g, fromid);
                                var mail = {
                                    from: fromid,
                                    to: objUser.email, // + ', ' + objSystemEmail.NotificationEmailTo,
                                    // cc: objSetting.Value,
                                    subject: UserExist.email + " " + objEmailTemplate.EmailSubject,
                                    html: body
                                };

                                transporter.sendMail(mail, function(error, response) {
                                    if (error) {
                                        res.json(error);
                                    } else {
                                        // funAuditLog.CreateAuditLog('Send initation mail', decoded.username, 'Send initation mail');
                                        res.json({
                                            success: true,
                                            message: "Invitation email send to this user successfully",
                                            data: response
                                        });
                                    }
                                });
                            })
                        })

                    } else {
                        res.json({
                            success: true,
                            message: "You have already invited this user",
                            data: SharedEmailExit
                        });
                    }
                })
            } else {
                res.json({
                    success: false,
                    InvalidToken: true,
                    data: InvalidToken,
                });
            }
        })
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
                io.sockets.emit(req.query.UserId + 'ShareStatus', JSON.stringify(objConnection));
                if (req.query.idSharedUser) {
                    var objConnection1 = {
                        UserId: req.query.idSharedUser,
                        DeviceId: req.query.DeviceId
                    }
                    io.sockets.emit(req.query.idSharedUser + 'UserShareStatus', JSON.stringify(objConnection1));
                }
            } else {
                res.json({ success: false, message: 'User not Removed.' });
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/RejectSharedInvitation', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        SharedEmail.findOne({
            where: {
                Id: req.query.Id
            }
        }).then(function(response) {
            if (response != null) {
                response.updateAttributes({ Status: 'Rejected By Main User' }).then(function(resUpdate) {
                    if (resUpdate != null) {
                        funAuditLog.CreateAuditLog('RejectSharedInvitation', decoded.username, 'Reject Shared Invitation By Main User');
                        res.json({ success: true, message: "User Removed successfully...", data: resUpdate });
                    } else {
                        res.json({ success: false, message: "Please Try Again Later...", data: resUpdate });
                    }
                })
            }
        })
    } else {
        res.json(InvalidToken);
    }

})
module.exports = router