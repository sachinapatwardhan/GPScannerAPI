var router = express.Router();
var User = models.tbluserinformation;
var SharedDevice = models.tblsharedevice;
var EmailTemplate = models.tblemailtemplate;
var SystemEmail = models.tblemailsettingsys;
var SharedEmail = models.tblsharedemail;
var AppInfo = models.tblappinfo;
var Vehicle = models.tblvehicle;
var Commonfunction = require('./common.js');
router.get('/GetAllSharedVehicle', function(req, res) {
    var search = '';
    if (req.query.appId != null && req.query.appId != '' && req.query.appId != undefined) {
        if (search != "") {
            search += " and user.idApp =" + req.query.appId;
        } else {
            search += " Where user.idApp =" + req.query.appId;
        }
    }

    var qry = "Select vehicle.id as idVehicle,vehicle.deviceId,user.email ,user.id,user.idApp " +
        "FROM tblvehicle AS vehicle " +
        " left join tblvehicletype  as vehicletype on vehicletype.id = vehicle.idType " +
        " left join tblgpsdevice as gpsdevice on gpsdevice.DeviceId =vehicle.deviceid " +
        " LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search;
    connection.query(qry, function(err, response) {
        if (!err && response) {
            res.json(response)
        }
    })

})


router.get('/GetAllSharedUser', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (tu.email like "%' + objSearch + '%" or ';
        search = search + 'tus.email like "%' + objSearch + '%" or ';
        search = search + 'tv.Name like "%' + objSearch + '%" or ';
        search = search + 'ts.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tai.AppName like "%' + objSearch + '%" or ';
        search = search + 'ts.CreatedDate like "%' + objSearch + '%") ';
    }

    if (objParam.appId != null && objParam.appId != '' && objParam.appId != undefined) {
        if (search != "") {
            search += ' and tu.idApp =' + objParam.appId;
        } else {
            search += ' Where tu.idApp =' + objParam.appId;
        }
    }

    var query = " SELECT tai.AppName,ts.id,ts.idUser,ts.idSharedUser,tu.email,tus.email as sharedUser,tv.Name,ts.DeviceId,CONVERT_TZ(ts.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate" +
        " FROM tblsharedevice ts  LEFT JOIN tbluserinformation tu on tu.id = ts.idUser" +
        " LEFT Join tblappinfo tai ON tu.idApp = tai.id" +
        " LEFT JOIN tbluserinformation tus ON ts.idSharedUser = tus.id " +
        " LEFT JOIN tblvehicle tv ON tv.deviceid = ts.DeviceId " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    // var query = " SELECT tai.AppName,ts.id,ts.idUser,ts.idSharedUser,tu.email,tv.sharedUser,tv.Name,ts.DeviceId,CONVERT_TZ(ts.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate" +
    //     " FROM tblsharedevice ts  LEFT JOIN tbluserinformation tu on tu.id = ts.idUser" +
    //     " LEFT Join tblappinfo tai ON tu.idApp = tai.id" +
    //     " LEFT JOIN (SELECT tbluserinformation.email as 'sharedUser',tblvehicle.Name, tblvehicle.deviceid,tblvehicle.id,tblvehicle.iduser" +
    //     " FROM tblvehicle LEFT JOIN tbluserinformation ON tbluserinformation.id= tblvehicle.iduser) as tv on tv.deviceid= ts.DeviceId " + search +
    //     " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);

    var Countqry = "SELECT count(ts.id) as TotalRecord " +
        " FROM tblsharedevice ts  LEFT JOIN tbluserinformation tu on tu.id = ts.idUser" +
        " LEFT Join tblappinfo tai ON tu.idApp = tai.id" +
        " LEFT JOIN tbluserinformation tus ON ts.idSharedUser = tus.id " +
        " LEFT JOIN tblvehicle tv ON tv.deviceid = ts.DeviceId " + search;
    // var Countqry = "SELECT count(ts.id) as TotalRecord " +
    //     " FROM tblsharedevice ts  LEFT JOIN tbluserinformation tu on tu.id = ts.idUser" +
    //     " LEFT Join tblappinfo tai ON tu.idApp = tai.id" +
    //     " LEFT JOIN (SELECT tbluserinformation.email as 'sharedUser',tblvehicle.Name, tblvehicle.deviceid,tblvehicle.id,tblvehicle.iduser" +
    //     " FROM tblvehicle LEFT JOIN tbluserinformation ON tbluserinformation.id= tblvehicle.iduser) as tv on tv.deviceid= ts.DeviceId " + search;
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

router.get('/GetAllSharedDeviceByUserNew', function(req, res) {
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
                            funAuditLog.CreateAuditLog('Share Device', decoded.username, 'user (UserId:' + response.idSharedUser + ') share vehicle (DeviceId:' + response.DeviceId + ') to user (UserId:' + response.idUser + ')');
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
                            funAuditLog.CreateAuditLog('Share Device', decoded.username, 'user (UserId:' + response.idSharedUser + ') share vehicle (DeviceId:' + response.DeviceId + ') to user (UserId:' + response.idUser + ')');
                            res.json({
                                success: true,
                                message: "Vehicle Shared successfully...",
                                data: response
                            });
                            Commonfunction.UpdateVehicleRedis(objUser.DeviceId, 'PushNotification')
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
                AppInfo.findOne({ where: { AppName: objUser.AppName } }).then(function(AppInfoExit) {

                    var ObjSharedEmail = new Object();
                    ObjSharedEmail.DeviceId = objUser.DeviceId;
                    ObjSharedEmail.SharedEmail = objUser.email;
                    ObjSharedEmail.Status = 'Pending';
                    ObjSharedEmail.idUser = objUser.idSharedUser;
                    ObjSharedEmail.CreatedDate = new Date();
                    ObjSharedEmail.CreatedBy = decoded.username;
                    SharedEmail.findOrCreate({
                        where: {
                            DeviceId: ObjSharedEmail.DeviceId,
                            SharedEmail: ObjSharedEmail.SharedEmail,
                        },
                        defaults: ObjSharedEmail
                    }).then(function(SharedEmailExit) {
                        if (SharedEmailExit[1]) {


                            funAuditLog.CreateAuditLog('Create shared Email', decoded.username, 'Save shared Email');
                            SystemEmail.findOne({ where: { IdApp: AppInfoExit.Id } }).then(function(objSystemEmail) {
                                EmailTemplate.findOne({
                                    where: {
                                        Type: "Invitation Email",
                                    }
                                }).then(function(objEmailTemplate) {
                                    if (objEmailTemplate) {
                                        var fromid = '';
                                        if (UserExist.email == '' || UserExist.email == null || UserExist.email == undefined) {
                                            fromid = objSystemEmail.DefaultEmailFrom;
                                        } else {
                                            fromid = UserExist.email;
                                        }
                                        var body = objEmailTemplate.EmailBody.replace(/{AppName}/g, objUser.AppName).replace(/{email}/g, fromid).replace(/{url}/g, AppInfoExit.WebAppUrl);
                                        var mail = {
                                            from: fromid,
                                            to: objUser.email, // + ', ' + objSystemEmail.NotificationEmailTo,
                                            // cc: objSetting.Value,
                                            subject: UserExist.email + " " + objEmailTemplate.EmailSubject,
                                            html: body
                                        };
                                        SetsmtpConfig(objSystemEmail, mail, function(EmailSettingCreated) {
                                            // console.log(EmailSettingCreated)
                                        })

                                        // transporter.sendMail(mail, function(error, response) {
                                        //     if (error) {
                                        //         res.json(error);
                                        //     } else {
                                        // funAuditLog.CreateAuditLog('Send initation mail', decoded.username, 'Send initation mail');
                                        res.json({
                                            success: true,
                                            message: "Invitation email send to this user successfully",
                                            // data: response
                                        });
                                        //     }
                                        // });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "Email Template not found",
                                            data: response
                                        });
                                    }
                                })
                            })

                        } else {
                            if (SharedEmailExit[0].Status != 'Pending' && SharedEmailExit[0].Status != 'Complete') {
                                var obj = { Status: "Pending", ModifiedBy: null, ModifiedDate: null, CreatedBy: decoded.username, CreatedDate: new Date() };
                                SharedEmailExit[0].updateAttributes(obj).then(function(SystemEmailUpdate) {
                                    if (SystemEmailUpdate) {
                                        funAuditLog.CreateAuditLog('Create shared Email', decoded.username, 'Update shared Email');
                                        SystemEmail.findOne({ where: { IdApp: AppInfoExit.Id } }).then(function(objSystemEmail) {
                                            EmailTemplate.findOne({
                                                where: {
                                                    Type: "Invitation Email",
                                                }
                                            }).then(function(objEmailTemplate) {
                                                if (objEmailTemplate) {
                                                    var fromid = '';
                                                    if (UserExist.email == '' || UserExist.email == null || UserExist.email == undefined) {
                                                        fromid = objSystemEmail.DefaultEmailFrom;
                                                    } else {
                                                        fromid = UserExist.email;
                                                    }
                                                    var body = objEmailTemplate.EmailBody.replace(/{AppName}/g, objUser.AppName).replace(/{email}/g, fromid).replace(/{url}/g, AppInfoExit.WebAppUrl);;
                                                    var mail = {
                                                        from: fromid,
                                                        to: objUser.email, // + ', ' + objSystemEmail.NotificationEmailTo,
                                                        // cc: objSetting.Value,
                                                        subject: UserExist.email + " " + objEmailTemplate.EmailSubject,
                                                        html: body
                                                    };

                                                    SetsmtpConfig(objSystemEmail, mail, function(EmailSettingCreated) {
                                                        // console.log(EmailSettingCreated)
                                                    })

                                                    // transporter.sendMail(mail, function(error, response) {
                                                    //     if (error) {
                                                    //         res.json(error);
                                                    //     } else {
                                                    // funAuditLog.CreateAuditLog('Send initation mail', decoded.username, 'Send initation mail');
                                                    res.json({
                                                        success: true,
                                                        message: "Invitation email send to this user successfully",
                                                        // data: response
                                                    });
                                                    //     }
                                                    // });
                                                } else {
                                                    res.json({
                                                        success: false,
                                                        message: "Email Template not found",
                                                        data: response
                                                    });
                                                }
                                            })
                                        })

                                    } else {
                                        res.json({
                                            success: true,
                                            message: "Invitaion failed",
                                            data: SharedEmailExit
                                        });
                                    }
                                })
                            } else {
                                res.json({
                                    success: true,
                                    message: "You have already invited this user",
                                    data: SharedEmailExit
                                });
                            }

                        }
                    })
                })
            } else {
                res.json(InvalidToken)
            }
        })
    } else {
        res.json(InvalidToken)
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
                connection.query("SELECT DeviceId, idUser from tblsharedevice  where id=" + req.query.id, function(err, response, fields) {
                    updatePushNotificationRedisValue(response[0].idUser);
                })
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
        SharedDevice.findOne({ where: { id: req.query.id } }).then(function(response) {
            if (response) {
                var DeviceId = response.DeviceId;
                SharedDevice.destroy({ where: { id: req.query.id } }).then(function(response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeleteSharedUser', decoded.username, 'Delete Shared User(UserId:' + SharedDevice.idUser + ') and DeviceId (' + SharedDevice.DeviceId + ')');
                        res.json({ success: true, message: "User Removed successfully...", data: response });
                        Commonfunction.UpdateVehicleRedis(DeviceId, 'PushNotification')
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
                res.json(RecordNotFound);
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
                response.updateAttributes({ Status: 'Rejected By Main User', ModifiedDate: new Date(), ModifiedBy: decoded.username }).then(function(resUpdate) {
                    if (resUpdate != null) {
                        funAuditLog.CreateAuditLog('RejectSharedInvitation', decoded.username, response.SharedEmail + ' id Shared Invitation reject By Main User');
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

function updatePushNotificationRedisValue(id) {
    var query = "SELECT tv.deviceid " +
        " FROM tblvehicle tv " +
        " LEFT JOIN tblsharedevice tsd ON tv.id=tsd.idVehicle " +
        " where  (tv.iduser=" + id + " or tsd.iduser=" + id + ")  and tv.IsDelete = 0";
    connection.query(query, function(err, response, filed) {
        if (response) {
            for (var i = 0; i < response.length; i++) {
                Commonfunction.UpdateVehicleRedis(response[i].deviceid, 'PushNotification')
            }
        }
    })
}

module.exports = router