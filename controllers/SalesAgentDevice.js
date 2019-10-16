(function () {
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
    router.get('/MobileAppLoginNew', jsonParser, function (req, res) {
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
        }).then(function (response) {
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
                    OrderTotal: response.Amount != null && response.Amount != '' ? response.Amount : 0,
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

    router.get('/GetSIMByIMEI', function (req, res) {
        // AppInfo.findOne({
        //         where: {
        //             id: req.query.idApp
        //         }
        //     }).then(function(resAppInfo) {
        //         if (resAppInfo) {
        GPSDevice.findOne({ where: { IMEI: req.query.IMEI } }).then(function (response1) {
            if (response1 != null) {
                if (response1.idSim != null && response1.idSim != '') {
                    SIM.findOne({
                        where: {
                            id: parseInt(response1.idSim)
                        }
                    }).then(function (resSIM) {
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
                res.json({ success: true, message: 'Success.', data: null });
            }
        })
        //     } else {
        //         res.json({ success: false, message: 'Tacker Invalid..', data: null });
        //     }
        // })
        // .catch(function(err) {
        //     res.json({ success: false, message: err, data: null });
        // })
    })

    router.post('/UpdateDeviceBySalesAgent', jsonParser, function (req, res) {
        var objHeader = req.headers;
        var objGpsDevice = req.body;

        var token = getToken(objHeader);
        if (token) {
            var decoded = jwt.decode(token, TokenKey);
            User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
                if (UserExist != null) {
                    AppInfo.findOne({
                        where: {
                            id: objGpsDevice.idApp
                        }
                    }).then(function (resAppInfo) {
                        if (resAppInfo) {
                            GPSDevice.findOne({
                                where: {
                                    IMEI: objGpsDevice.IMEI
                                    // AppName: resAppInfo.AppName
                                }
                            }).then(function (ObjExist) {
                                if (ObjExist) {
                                    ManageSimFun(objGpsDevice.SIM, objGpsDevice.idApp, function (objSIMData) {
                                        ObjExist.updateAttributes({
                                            idSim: objSIMData.id,
                                            SimNum: objSIMData.SerialNum,
                                            idSalesAgent: objGpsDevice.UserId,
                                            AppName: resAppInfo.AppName
                                        }).then(function (response) {
                                            if (response) {
                                                funAuditLog.CreateAuditLog('Tracker Update', UserExist.username, 'tracker Update by sales agent : (' + decoded.username + ') / IMEI: (' + ObjExist.IMEI + ')');
                                                res.json({ success: true, message: "Tracker Update successfully.", data: response });
                                            } else {
                                                res.json({ success: false, message: "Tacker Not Updated.", data: null })
                                            }
                                        })
                                    })
                                } else {
                                    //res.json({ success: false, message: "Tacker Invalid.." })
                                    ManageSimFun(objGpsDevice.SIM, objGpsDevice.idApp, function (objSIMData) {
                                        objGpsDevice.CreatedDate = new Date();
                                        objGpsDevice.CreatedBy = decoded.username;
                                        objGpsDevice.idSim = objSIMData.id;
                                        objGpsDevice.SimNum = objSIMData.SerialNum;
                                        objGpsDevice.idSalesAgent = objGpsDevice.UserId;
                                        objGpsDevice.AppName = resAppInfo.AppName;
                                        objGpsDevice.Type = 'MT05';
                                        objGpsDevice.DeviceId = objGpsDevice.IMEI.toString().trim().slice(1);
                                        GPSDevice.findOrCreate({ where: { IMEI: objGpsDevice.IMEI }, defaults: objGpsDevice }).then(function (response) {
                                            if (response) {
                                                funAuditLog.CreateAuditLog('Tracker Create', UserExist.username, 'tracker created by sales agent : (' + decoded.username + ') / IMEI: (' + objGpsDevice.IMEI + ')');
                                                res.json({ success: true, message: "Tracker Activated successfully.", data: response });
                                            } else {
                                                res.json({ success: false, message: "Tacker Not Activated. Try again later.", data: null })
                                            }
                                        });
                                    })
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
        }).then(function (resSimFound) {
            if (resSimFound) {
                return ReturnData(resSimFound);
            } else {
                SIM.create({ SerialNum: SIMSerialNumber, CreatedDate: new Date(), idApp: idApp }).then(function (createSIM) {
                    return ReturnData(createSIM);
                })
            }
        })
    }

    // -------------------------------------Renew Management------------------------------------------
    router.get('/GetAllRenewDataForSalesAgent', function (req, res) {
        var objParam = req.query;
        var offset = (parseInt(objParam.page) * 10);
        var objSearch = objParam.search;
        var Orderby = 'ExpiryDate ASC';
        var search = '';


        if (objSearch != null && objSearch != '') {
            search += ' and (tl.DeviceId like "%' + objSearch + '%" or ';
            search = search + 'tl.ExpiryDate like "%' + objSearch + '%" or ';
            search = search + 'tu.email like "%' + objSearch + '%" or ';
            search = search + 'tu.phone like "%' + objSearch + '%" or ';
            search = search + 'ta.AppName like "%' + objSearch + '%" or ';
            search = search + 'tl.LicenceType like "%' + objSearch + '%" or ';
            search = search + 'tl.LicenceRenewalType like "%' + objSearch + '%" or ';
            search = search + 'tv.Name like "%' + objSearch + '%") ';
        };

        if (req.query.StartDate != '' && req.query.EndDate != '') {
            if (search == '') {
                search += " AND tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
            } else {
                search += search + " AND   tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
            }
        } else if (req.query.StartDate != null && req.query.StartDate != '' && req.query.StartDate != undefined) {
            if (search == '') {
                search += " AND  tl.ExpiryDate >= '" + convertdateformat(req.query.StartDate, 3) + "'";
            } else {
                search += " AND tl.ExpiryDate >= '" + convertdateformat(req.query.StartDate, 3) + "'";
            }
        } else if (req.query.EndDate != null && req.query.EndDate != '' && req.query.EndDate != undefined) {
            if (search == '') {
                search += " AND tl.ExpiryDate <= '" + convertdateformat(req.query.EndDate, 3) + "'";
            } else {
                search += " AND tl.ExpiryDate <= '" + convertdateformat(req.query.EndDate, 3) + "'";
            }
        }

        if (req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != '') {
            search += " and ta.Id=" + req.query.idApp + " ";
        }
        console.log(search)
        var query = "SELECT tl.Id, tu.email,CONVERT_TZ(tu.LastLogin,'+00:00','" + CurrentOffset + "') as LastLoginDate ,tl.DeviceId,tv.iduser,tu.phone,tv.Name as VehicleName,ta.Id as idApp,ta.AppName,tl.LicenceRenewalType,tl.LicenceType,ta.LicenceRenewalType as appLicenceRenewalType,ta.LicenceType as appLicenceType, " +
            "CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate " +
            " from tbllicencemanager as tl " +
            " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
            " INNER JOIN (Select * from tblvehicle where IsDelete=0) tv on tv.deviceid =tl.DeviceId " +
            " INNER JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
            " where tl.IsDeleted=0  " + search +
            " order by " + Orderby + " limit " + parseInt(10) + " offset " + parseInt(offset);
        var countquery = "SELECT count(*) as TotalRecord " +
            " from tbllicencemanager as tl " +
            " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
            " INNER JOIN (Select * from tblvehicle where IsDelete=0)  tv on tv.deviceid =tl.DeviceId " +
            " INNER JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
            " where tl.IsDeleted=0 " + search;

        connection.query(query, function (err, response) {
            if (response != undefined) {
                connection.query(countquery, function (err, lstCount, fields) {
                    var lstAllVehicle = [];

                    function getData(i) {
                        if (i < response.length) {
                            var obj = new Object();
                            obj.Id = response[i].Id;
                            obj.email = response[i].email;
                            obj.LastLoginDate = response[i].LastLoginDate;
                            obj.DeviceId = response[i].DeviceId;
                            obj.iduser = response[i].iduser;
                            obj.phone = response[i].phone;
                            obj.VehicleName = response[i].VehicleName;
                            obj.idApp = response[i].idApp;
                            obj.AppName = response[i].AppName;
                            obj.LicenceRenewalType = response[i].LicenceRenewalType;
                            obj.LicenceType = response[i].LicenceType;
                            obj.appLicenceRenewalType = response[i].appLicenceRenewalType;
                            obj.appLicenceType = response[i].appLicenceType;
                            obj.ExpiryDate = response[i].ExpiryDate;

                            client.get(response[i].DeviceId, function (err, strgpsdata) {
                                if (!err) {
                                    if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                        var objgps = JSON.parse(strgpsdata);
                                        obj.GpsDate = objgps.Date;
                                    } else {
                                        obj.GpsDate = null;
                                    }
                                } else {
                                    obj.GpsDate = null;
                                }
                                lstAllVehicle.push(obj);
                                getData(i + 1);
                            });
                        } else {
                            res.json(lstAllVehicle);
                        }
                    }
                    getData(0);
                });
            } else {
                res.json([]);
            }
        })
    })

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

        } else if (flg == 2) {
            return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
        } else if (flg == 3) {
            return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
        } else {
            return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
        }
    }

    module.exports = router;
})();