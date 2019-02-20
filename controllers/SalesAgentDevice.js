(function() {
    'use strict';

    var express = require('express');
    var router = express.Router();
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();
    var Bluebird = require('bluebird');
    var moment = require('moment');

    //////////

    var Sequelize = require('sequelize');
    var sequelize = require('../models1').sequelize;
    var User = models.tbluserinformation;
    var Role = models.tblrole;
    var UserInRole = models.tbluserinrole;
    var SIM = models.tblsimdetails;
    var AppInfo = models.tblappinfo;
    var GPSDevice = models.tblgpsdevice;
    //   ==========================================LOGIN============================================
    router.get('/MobileAppLoginNew', jsonParser, function(req, res) {
        User.hasMany(UserInRole, {
            foreignKey: {
                name: 'userId',
                allowNull: false
            }
        });
        UserInRole.belongsTo(Role, {
            foreignKey: {
                name: 'roleId',
                allowNull: false
            }
        });
        var Encryptpassword = jwt.encode(req.query.password, "bugz");
        User.findOne({
            where: {
                $or: {
                    username: req.query.username,
                    email: req.query.username,
                    phone: req.query.username,
                },
                password: Encryptpassword,
            },
            include: [{
                model: UserInRole,
                include: [{
                    model: Role,
                    where: { RoleName: 'Sales Agent' }
                }]
            }],
        }).then(function(response) {
            if (response != null) {
                var user = {
                    username: response.username,
                    password: Encryptpassword,
                }
                var token = jwt.encode(user, "bugz");
                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    UserId: response.id,
                    UserName: response.username,
                    Email: response.email,
                    idApp: response.idApp,
                    message: "Login Successfully..."
                });
            } else {
                res.json({
                    success: false,
                    message: "Invalid Username or Password..."
                });
            }
        })
    })

    router.get('/GetSIMByIMEI', function(req, res) {
        AppInfo.findOne({
                where: {
                    id: req.query.idApp
                }
            }).then(function(resAppInfo) {
                if (resAppInfo) {
                    GPSDevice.findOne({ where: { IMEI: req.query.IMEI, AppName: resAppInfo.AppName } }).then(function(response1) {
                        if (response1 != null) {
                            if (response1.idSim != null && response1.idSim != '') {
                                SIM.findOne({
                                    where: {
                                        id: parseInt(response1.idSim)
                                    }
                                }).then(function(resSIM) {
                                    if (resSIM) {
                                        res.json({ success: true, message: 'Success.', data: resSIM });
                                    } else {
                                        res.json({ success: true, message: 'Success.', data: null });
                                    }
                                })
                            } else {
                                res.json({ success: true, message: 'Success.', data: null });
                            }
                        } else {
                            res.json({ success: false, message: 'Tacker Invalid..', data: null });
                        }
                    })
                } else {
                    res.json({ success: false, message: 'Tacker Invalid..', data: null });
                }
            })
            .catch(function(err) {
                res.json({ success: false, message: err, data: null });
            })
    })

    router.post('/UpdateDeviceBySalesAgent', jsonParser, function(req, res) {
        var objHeader = req.headers;
        var objGpsDevice = req.body;

        var token = getToken(objHeader);
        if (token) {
            var decoded = jwt.decode(token, TokenKey);
            User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
                if (UserExist != null) {
                    AppInfo.findOne({
                        where: {
                            id: objGpsDevice.idApp
                        }
                    }).then(function(resAppInfo) {
                        if (resAppInfo) {
                            GPSDevice.findOne({
                                where: {
                                    IMEI: objGpsDevice.IMEI,
                                    AppName: resAppInfo.AppName
                                }
                            }).then(function(ObjExist) {
                                if (ObjExist) {
                                    ManageSimFun(objGpsDevice.SIM, objGpsDevice.idApp, function(objSIMData) {
                                        ObjExist.updateAttributes({
                                            idSim: objSIMData.id,
                                            SimNum: objSIMData.SerialNum,
                                            idSalesAgent: objGpsDevice.UserId
                                        }).then(function(response) {
                                            if (response) {
                                                funAuditLog.CreateAuditLog('Tracker Update', UserExist.username, 'tracker Update by sales agent / IMEI: (' + ObjExist.IMEI + ')');
                                                res.json({ success: true, message: "Tracker Update successfully", data: response });
                                            } else {
                                                res.json({ success: false, message: "Tacker Not Updated", data: null })
                                            }
                                        })

                                    })
                                } else {
                                    res.json({ success: false, message: "Tacker Invalid.." })
                                }
                            })
                        } else {
                            res.json({ success: false, message: "Tacker Invalid.." })
                        }
                    })
                } else {
                    res.json(InvalidToken);
                }
            })
        } else {
            res.json(InvalidToken);
        }
    })



    function ManageSimFun(SIMSerialNumber, idApp, ReturnData) {
        SIM.findOne({
            where: {
                SerialNum: SIMSerialNumber,
            }
        }).then(function(resSimFound) {
            if (resSimFound) {
                return ReturnData(resSimFound);
            } else {
                SIM.create({ SerialNum: SIMSerialNumber, CreatedDate: new Date(), idApp: idApp }).then(function(createSIM) {
                    return ReturnData(createSIM);
                })
            }
        })
    }


    module.exports = router;
})();