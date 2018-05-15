var router = express.Router();
var LicenceManager = models.tbllicencemanager;
var GPSData = models.tblgpsdata;
var User = models.tbluserinformation;
var AppInfo = models.tblappinfo;
var GpsDevice = models.tblgpsdevice;
var Vehicle = models.tblvehicle;
var User = models.tbluserinformation;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var OrderService = models.tblorderservice;
var WalletTransaction = models.tblwallettransaction;
var AuditLogLicence = models.tblauditloglicence;
var DeviceAgentRetailer = models.tbldeviceagentretailer;
var SimDetail = models.tblsimdetails;

var Sequelize = require('sequelize');
var sequelize = require('../models1').sequelize;

router.get('/GetAllLicence', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != null && objSearch != '') {
        search += ' and (tl.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tl.LicenceNo like "%' + objSearch + '%" or ';
        search = search + 'tl.ExpiryDate like "%' + objSearch + '%" or ';
        search = search + 'tl.CreatedDate like "%' + objSearch + '%" or ';
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

    var query = "SELECT tl.Id, tu.email,tl.DeviceId,tl.LicenceNo,tl.IdUser,tu.phone,tv.Name as VehicleName,ta.AppName,tl.LicenceRenewalType,tl.LicenceType,ta.LicenceRenewalType as appLicenceRenewalType,ta.LicenceType as appLicenceType, " +
        "CONVERT_TZ(tl.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate, " +
        "CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate, " +
        "CONVERT_TZ(tl.ModifiedDate,'+00:00','" + CurrentOffset + "') as ModifiedDate " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " LEFT JOIN (Select * from tblvehicle where IsDelete=0) tv on tv.deviceid =tl.DeviceId " +
        " LEFT JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
        " where tl.IsDeleted=0  " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var countquery = "SELECT count(*) as TotalRecord " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " LEFT JOIN (Select * from tblvehicle where IsDelete=0)  tv on tv.deviceid =tl.DeviceId " +
        " LEFT JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
        " where tl.IsDeleted=0 " + search;
    connection.query(query, function(err, response) {
        if (response != undefined) {
            connection.query(countquery, function(err, lstCount, fields) {
                var response1 = new Object();
                response1.draw = objParam.draw;
                response1.recordsTotal = lstCount[0].TotalRecord;
                response1.recordsFiltered = lstCount[0].TotalRecord;
                response1.data = response;
                res.json(response1);
            });
        } else {
            console.log(err);
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = 0;
            response1.recordsFiltered = 0;
            response1.data = [];
            res.json(response1);
        }
    })
})

router.get('/SaveLicenceDetail', function(req, res) {
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
                LicenceManager.findOne({ where: { DeviceId: req.query.DeviceId, IsDeleted: 0 } }).then(function(LicenceAssigned) {
                    if (LicenceAssigned && LicenceAssigned.Id != req.query.Id) {
                        res.json({
                            success: false,
                            message: "Licence alerady assigned for this device",
                        });
                    } else {
                        // User.findOne({ where: { id: req.query.IdUser } }).then(function(DeviceUserExist) {
                        //     if (DeviceUserExist) {
                        // AppInfo.findOne({ where: { Id: DeviceUserExist.idApp } }).then(function(AppExits) {
                        GpsDevice.findOne({ where: { DeviceId: req.query.DeviceId }, })
                            .then(function(objGpsDevice) {
                                if (objGpsDevice != null) {
                                    AppInfo.findOne({ where: { AppName: objGpsDevice.AppName } }).then(function(AppExits) {
                                        LicenceManager.findOne({ where: { Id: req.query.Id } }).then(function(LicenceExist) {
                                            if (AppExits.Id == LicenceExist.idApp) {
                                                if (LicenceExist.DeviceId == null || LicenceExist.DeviceId == '' || LicenceExist.DeviceId == undefined) {
                                                    LicenceExist.updateAttributes({
                                                        IdUser: req.query.IdUser,
                                                        DeviceId: req.query.DeviceId,
                                                        ExpiryDate: req.query.ExpiryDate,
                                                        CreatedDate: new Date(),
                                                        LicenceRenewalType: req.query.LicenceRenewalType,
                                                        LicenceType: req.query.LicenceType,
                                                    }).then(function(response) {
                                                        if (response) {
                                                            Vehicle.findOne({ where: { deviceid: response.DeviceId } }).then(function(vehicleExist) {
                                                                if (vehicleExist) {
                                                                    vehicleExist.updateAttributes({ renewaldate: response.ExpiryDate }).then(function(updateRenewDate) {})
                                                                }
                                                            })

                                                            // funAuditLog.CreateAuditLog('update ExpiryDate of Device ', UserExist.username, 'update ExpiryDate of Device (' + response.DeviceId + ')');
                                                            funAuditLogLicence.CreateAuditLogLicence('Assign Licence', LicenceExist.LicenceNo, response.DeviceId, response.ExpiryDate, null, UserExist.username, 'Assign through update licence number');
                                                            // funAuditLogLicence.CreateAuditLogLicence('Assign Licence', UserExist.username, 'Licence No (' + LicenceExist.LicenceNo + ') / Assign Licence to (' + response.DeviceId + ') ');
                                                            res.json({
                                                                success: true,
                                                                message: "Licence assign for device successfully.",
                                                                data: response
                                                            });
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Licence not assign for device.",
                                                                data: response
                                                            });
                                                        }
                                                    })

                                                } else {
                                                    var OldDeviceId = LicenceExist.DeviceId;
                                                    var oldexpdate = LicenceExist.ExpiryDate;
                                                    LicenceExist.updateAttributes({
                                                        IdUser: req.query.IdUser,
                                                        DeviceId: req.query.DeviceId,
                                                        ExpiryDate: req.query.ExpiryDate,
                                                        LicenceRenewalType: req.query.LicenceRenewalType,
                                                        LicenceType: req.query.LicenceType,
                                                        ModifiedDate: new Date(),
                                                    }).then(function(response) {
                                                        if (response) {
                                                            Vehicle.findOne({ where: { deviceid: response.DeviceId, IsDelete: false } }).then(function(vehicleExist) {
                                                                    if (vehicleExist) {
                                                                        vehicleExist.updateAttributes({ renewaldate: response.ExpiryDate }).then(function(updateRenewDate) {})
                                                                    }
                                                                })
                                                                // funAuditLog.CreateAuditLog('Update Licence device ', UserExist.username, 'update Device (' + OldDeviceId + ') to (' + response.DeviceId + ') / Licence No (' + LicenceExist.LicenceNo + ')');
                                                            funAuditLogLicence.CreateAuditLogLicence('Update Licence', LicenceExist.LicenceNo, req.query.DeviceId, req.query.ExpiryDate, oldexpdate, UserExist.username, 'Update licence (old deviceId :' + OldDeviceId + ')');
                                                            res.json({
                                                                success: true,
                                                                message: "Licence assign for device successfully.",
                                                                data: response
                                                            });
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Licence not assign for device.",
                                                                data: response
                                                            });
                                                        }
                                                    })
                                                }
                                            } else {
                                                res.json({
                                                    success: false,
                                                    message: "Invalid Device Id., Please insert valid Device Id.",
                                                    data: ""
                                                });
                                            }
                                        })
                                    })

                                } else {
                                    res.json({
                                        success: false,
                                        message: "Invalid Device Id., Please insert valid Device Id.",
                                        data: ""
                                    });
                                }
                            })
                            // })
                            //     } else {
                            //         res.json({
                            //             success: false,
                            //             message: "Invalid User Name., Please insert valid User Name.",
                            //             data: ""
                            //         });
                            //     }
                            // })
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

router.get('/DeleteDeviceLicence', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    if (token) {
        var decoded = jwt.decode(token, TokenKey);


        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (req.query.Id != '' && req.query.Id != null) {
                    LicenceManager.findOne({ where: { Id: req.query.Id } }).then(function(LicenceExist) {
                        if (LicenceExist.DeviceId != null && LicenceExist.DeviceId != undefined && LicenceExist.DeviceId != '') {
                            LicenceExist.updateAttributes({ IsDeleted: 1 }).then(function(response) {
                                if (response) {
                                    funAuditLogLicence.CreateAuditLogLicence('Delete Licence', LicenceExist.LicenceNo, LicenceExist.DeviceId, LicenceExist.ExpiryDate, null, UserExist.username, 'update IsDeleted true');
                                    res.json({
                                        success: true,
                                        message: "Licence number deleted successfully.",
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Licence number not deleted.",
                                    });
                                }
                            })
                        } else {
                            LicenceManager.destroy({ where: { Id: req.query.Id } }).then(function(response) {
                                funAuditLogLicence.CreateAuditLogLicence('Delete Licence', LicenceExist.LicenceNo, null, null, null, UserExist.username, 'Delete licence');
                                if (response) {
                                    res.json({
                                        success: true,
                                        message: "Licence number deleted successfully.",
                                    });
                                } else {
                                    res.json({
                                        success: true,
                                        message: "Licence number not deleted.",
                                    });
                                }
                            })
                        }
                    })

                } else {
                    res.json({
                        success: false,
                        message: "Select Licence To delete",
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }

});

router.get('/changestatusrenewal', function(req, res) {
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
                LicenceManager.findOne({
                    where: {
                        Id: req.query.id,
                    }
                }).then(function(isExist) {

                    // AppInfo.findOne({ where: { AppName: req.query.AppName } }).then(function(AppInfo) {
                    var AddMonth = 0;
                    if (isExist.LicenceRenewalType == 'Monthly') {
                        AddMonth = 1;
                    } else if (isExist.LicenceRenewalType == 'Quarterly') {
                        AddMonth = 3;
                    } else if (isExist.LicenceRenewalType == 'Yearly') {
                        AddMonth = 12;
                    }
                    var oldexpdate = isExist.ExpiryDate;
                    var date = new Date(isExist.ExpiryDate);
                    var updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);

                    var timeDiff = (new Date(oldexpdate)).getTime() - (new Date()).getTime();
                    var diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
                    days = diffDays
                    if (days < 0) {
                        date = new Date();
                        updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);
                    }

                    isExist.updateAttributes({ ExpiryDate: updatedDate }).then(function(response) {
                            var difference = (response.ExpiryDate.getFullYear() * 12 + response.ExpiryDate.getMonth()) - (oldexpdate.getFullYear() * 12 + oldexpdate.getMonth());
                            // funAuditLog.CreateAuditLog('Update Licecence ExpiryDate of Device ', UserExist.username, 'DeviceID(' + response.DeviceId + ') / Updated ExpiryDate (' + convertdateformat(response.ExpiryDate, 4) + ') / Old ExpiryDate (' + convertdateformat(oldexpdate, 4) + ') / Updated for (' + difference + ') month)');
                            Vehicle.findOne({ where: { DeviceId: isExist.DeviceId } }).then(function(vehicleExist) {
                                if (vehicleExist) {
                                    vehicleExist.updateAttributes({ renewaldate: updatedDate }).then(function(updateRenewDate) {})
                                }
                            })
                            funAuditLogLicence.CreateAuditLogLicence('Renew Licence', isExist.LicenceNo, isExist.DeviceId, updatedDate, oldexpdate, UserExist.username, 'Renew licence Expiry date for month:(' + difference + ')');
                            res.json({
                                success: true,
                                message: " Device renewal successfully.",
                                data: response
                            })
                        })
                        // })
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})


router.get('/SwipeDeviceAdmin', function(req, res) {
    sequelize.transaction(function(t) {
            return GpsDevice.findOne({
                    where: {
                        DeviceId: req.query.DeviceId
                    }
                })
                .then(function(GpsDeviceExist) {
                    if (!GpsDeviceExist) {
                        var err = new Error('Invalid device id.');
                        err.name = 'BugzError';
                        throw err;
                    }
                    return AppInfo.findOne({
                            where: {
                                AppName: GpsDeviceExist.AppName
                            }
                        })
                        .then(function(AppInfoExist) {
                            if (!AppInfoExist) {
                                var err = new Error('Invalid device id.');
                                err.name = 'BugzError';
                                throw err;
                            }
                            return LicenceManager.findOne({
                                    where: {
                                        Id: req.query.Id
                                    }
                                })
                                .then(function(LicenceManagerExist) {
                                    if (!LicenceManagerExist) {
                                        var err = new Error('Licence not found.');
                                        err.name = 'BugzError';
                                        throw err;
                                    }

                                    return LicenceManager.findOne({
                                            where: {
                                                DeviceId: req.query.DeviceId,
                                                IsDeleted: 0
                                            }
                                        })
                                        .then(function(newLicenceManagerExist) {
                                            if (newLicenceManagerExist) {
                                                var err = new Error('This device licence is already assigned.');
                                                err.name = 'BugzError';
                                                throw err;
                                            } else {
                                                if (LicenceManagerExist.idApp == AppInfoExist.Id) {
                                                    return LicenceManagerExist.updateAttributes({
                                                            DeviceId: req.query.DeviceId
                                                        })
                                                        .then(function(resLicenceUpdate) {
                                                            funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', LicenceManagerExist.LicenceNo, req.query.DeviceId, LicenceManagerExist.ExpiryDate, LicenceManagerExist.ExpiryDate, req.query.CreatedBy, 'Swap licence deviceId (old deviceId :' + req.query.OldDeviceId + ')');

                                                            return Vehicle.findOne({
                                                                    where: {
                                                                        deviceid: req.query.OldDeviceId,
                                                                        IsDelete: 0
                                                                    }
                                                                })
                                                                .then(function(resVehical) {
                                                                    if (!resVehical) {
                                                                        return LicenceManagerExist;
                                                                    }
                                                                    return resVehical.updateAttributes({
                                                                            IsDelete: 1
                                                                        })
                                                                        .then(function(resUpdateVehical) {

                                                                            funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.query.OldDeviceId, null, null, req.query.CreatedBy, 'Update vehical IsDelete true.');

                                                                            var obj = {
                                                                                iduser: resUpdateVehical.iduser,
                                                                                Name: resUpdateVehical.Name,
                                                                                deviceid: req.query.DeviceId,
                                                                                renewaldate: resUpdateVehical.renewaldate,
                                                                                CreatedDate: resUpdateVehical.CreatedDate,
                                                                                CreatedBy: req.query.CreatedBy,
                                                                            }
                                                                            return Vehicle.create(obj)
                                                                                .then(function(resVreateVehical) {
                                                                                    funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.query.DeviceId, null, null, req.query.CreatedBy, 'Create new vehical with deviceid :' + req.query.DeviceId + '.');

                                                                                    return DeviceAgentRetailer.findOne({
                                                                                            where: {
                                                                                                deviceId: req.query.OldDeviceId
                                                                                            }
                                                                                        })
                                                                                        .then(function(DeviceAgentRetailerExits) {
                                                                                            if (!DeviceAgentRetailerExits) {
                                                                                                return LicenceManagerExist;
                                                                                            }
                                                                                            DeviceAgentRetailerExits.updateAttributes({
                                                                                                    deviceId: req.query.DeviceId
                                                                                                })
                                                                                                .then(function(DeviceAgentRetailerUpdated) {
                                                                                                    funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.query.DeviceId, null, null, req.query.CreatedBy, 'Swap agent Device Id (old deviceId :' + req.query.OldDeviceId + ').');
                                                                                                    if (!DeviceAgentRetailerUpdated) {
                                                                                                        return DeviceAgentRetailerUpdated;
                                                                                                    }
                                                                                                    return OrderService.findOne({
                                                                                                            where: {
                                                                                                                OrderNotes: req.query.OldDeviceId
                                                                                                            }
                                                                                                        })
                                                                                                        .then(function(resOrder) {
                                                                                                            if (!resOrder) {
                                                                                                                return LicenceManagerExist;
                                                                                                            }

                                                                                                            return resOrder.updateAttributes({
                                                                                                                OrderNotes: req.query.DeviceId
                                                                                                            }).then(function(resOrderUpdate) {
                                                                                                                funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.query.DeviceId, null, null, req.query.CreatedBy, 'Swap order service OrderNotes from old OrderNotes :' + req.query.OldDeviceId + ' to new OrderNotes :' + req.query.DeviceId);

                                                                                                                return WalletTransaction.findOne({
                                                                                                                        where: {
                                                                                                                            DeviceId: req.query.OldDeviceId
                                                                                                                        }
                                                                                                                    })
                                                                                                                    .then(function(resWallet) {
                                                                                                                        if (!resWallet) {
                                                                                                                            return LicenceManagerExist;
                                                                                                                        }

                                                                                                                        return resWallet.updateAttributes({
                                                                                                                                DeviceId: req.query.DeviceId,
                                                                                                                                ModifiedDate: new Date(),
                                                                                                                                ModifiedBy: req.query.CreatedBy
                                                                                                                            })
                                                                                                                            .then(function(resWalletUpdate) {
                                                                                                                                funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.query.DeviceId, null, null, req.query.CreatedBy, 'Swap wallet transaction DeviceId (old DeviceId :(' + req.query.OldDeviceId + ' )');
                                                                                                                                return LicenceManagerExist;
                                                                                                                            })
                                                                                                                    })
                                                                                                            })
                                                                                                        })
                                                                                                })
                                                                                        })
                                                                                });
                                                                        })
                                                                })
                                                        })
                                                } else {
                                                    var err = new Error('Invalid device id.');
                                                    err.name = 'BugzError';
                                                    throw err;
                                                }
                                            }
                                        })

                                })
                        })
                })
        })
        .then(function(responsedata) {
            res.json({
                success: true,
                message: 'Swip device successfully.',
                data: responsedata
            });
        })
        .catch(function(err) {
            res.json({
                success: false,
                message: err.message
            });
        });
});

router.post('/SwipeDevice', jsonParser, function(req, res) {
    sequelize.transaction(function(t) {
            return DeviceAgentRetailer.findOne({
                    where: {
                        agentId: req.body.agentId,
                        deviceId: req.body.NewDeviceId
                    }
                })
                .then(function(resDeviceAgent) {
                    if (!resDeviceAgent) {
                        var err = new Error('Invalid device id.');
                        err.name = 'BugzError';
                        throw err;
                    }

                    return resDeviceAgent.updateAttributes({
                            retailerId: req.body.retailerId,
                            activatedDatetime: req.body.activatedDatetime,
                            expiryDatetime: req.body.expiryDatetime,
                            lastModifiedDatetime: new Date(),
                            simSerial: req.body.simSerial
                        })
                        .then(function(resUpdateDeviceAgent) {
                            funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.body.NewDeviceId, null, null, req.body.CreatedBy, 'Copy agent device detail from old DeviceId :' + req.body.OldDeviceId + ' to new DeviceId :' + req.body.NewDeviceId);

                            // return SimDetail.findOne({
                            //         where: {
                            //             SerialNum: req.body.simSerial
                            //         }
                            //     })
                            //     .then(function(resSim) {
                            //         if (!resSim) {
                            //             var err = new Error('No sim found.');
                            //             err.name = 'BugzError';
                            //             throw err;
                            //         }

                            //         return GpsDevice.findOne({
                            //                 where: {
                            //                     DeviceId: req.body.NewDeviceId
                            //                 }
                            //             })
                            //             .then(function(resGPSDevice) {
                            //                 return resGPSDevice.updateAttributes({
                            //                         idSim: resSim.id
                            //                     })
                            //                     .then(function(resGPSDeviceUpdate) {
                            //                         funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.body.NewDeviceId, null, null, req.body.CreatedBy, 'Swap GPSDevice idSim from old DeviceId :' + req.body.OldDeviceId + ' to new DeviceId :' + req.body.NewDeviceId);
                            return LicenceManager.findOne({
                                    where: {
                                        DeviceId: req.body.OldDeviceId,
                                        IsDeleted: 0,
                                        idApp: req.body.AppId
                                    }
                                })
                                .then(function(resLicence) {
                                    if (!resLicence) {
                                        var err = new Error('No licenece found.');
                                        err.name = 'BugzError';
                                        throw err;
                                    }

                                    return resLicence.updateAttributes({
                                            DeviceId: req.body.NewDeviceId
                                        })
                                        .then(function(resLicenceUpdate) {
                                            funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', resLicence.LicenceNo, req.body.NewDeviceId, resLicence.updatedDate, resLicence.oldexpdate, req.body.CreatedBy, 'Swap licence deviceId (old deviceId :' + req.body.OldDeviceId + ')');

                                            return Vehicle.findOne({
                                                    where: {
                                                        deviceid: req.body.OldDeviceId,
                                                        IsDelete: 0
                                                    }
                                                })
                                                .then(function(resVehical) {
                                                    if (!resVehical) {
                                                        return resLicence;
                                                    }

                                                    return resVehical.updateAttributes({
                                                            IsDelete: 1
                                                        })
                                                        .then(function(resUpdateVehical) {
                                                            funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.body.OldDeviceId, null, null, req.body.CreatedBy, 'Update vehical IsDelete true.');

                                                            var obj = {
                                                                iduser: resUpdateVehical.iduser,
                                                                Name: resUpdateVehical.Name,
                                                                deviceid: req.body.NewDeviceId,
                                                                renewaldate: resUpdateVehical.renewaldate,
                                                                CreatedDate: resUpdateVehical.CreatedDate,
                                                                CreatedBy: req.body.CreatedBy,
                                                            }
                                                            return Vehicle.create(obj)
                                                                .then(function(resVreateVehical) {
                                                                    funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.body.NewDeviceId, null, null, req.body.CreatedBy, 'Create new vehical with deviceid :' + req.body.NewDeviceId + '.');

                                                                    return OrderService.findOne({
                                                                            where: {
                                                                                OrderNotes: req.body.OldDeviceId
                                                                            }
                                                                        })
                                                                        .then(function(resOrder) {
                                                                            if (!resOrder) {
                                                                                return resLicence;
                                                                            }

                                                                            return resOrder.updateAttributes({
                                                                                OrderNotes: req.body.NewDeviceId
                                                                            }).then(function(resOrderUpdate) {
                                                                                funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.body.NewDeviceId, null, null, req.body.CreatedBy, 'Swap order service OrderNotes from old OrderNotes :' + req.body.OldDeviceId + ' to new OrderNotes :' + req.body.NewDeviceId);

                                                                                return WalletTransaction.findOne({
                                                                                        where: {
                                                                                            DeviceId: req.body.OldDeviceId
                                                                                        }
                                                                                    })
                                                                                    .then(function(resWallet) {
                                                                                        if (!resWallet) {
                                                                                            return resLicence;
                                                                                        }

                                                                                        return resWallet.updateAttributes({
                                                                                                DeviceId: req.query.NewDeviceId,
                                                                                                ModifiedDate: new Date(),
                                                                                                ModifiedBy: req.body.CreatedBy
                                                                                            })
                                                                                            .then(function(resWalletUpdate) {
                                                                                                funAuditLogLicence.CreateAuditLogLicence('Swap Licence Device', null, req.body.NewDeviceId, null, null, req.body.CreatedBy, 'Swap wallet transaction DeviceId (old DeviceId :(' + req.body.OldDeviceId + ' )');
                                                                                                return resLicence;
                                                                                            })
                                                                                    })
                                                                            })
                                                                        })
                                                                });
                                                        })
                                                })
                                        })
                                })
                                //                 })
                                //         })
                                // })

                        })
                })
        })
        .then(function(responsedata) {
            res.json({
                success: true,
                message: 'Swip device successfully.',
                data: responsedata
            });
        })
        .catch(function(err) {
            res.json({
                success: false,
                message: err.message
            });
        });
});

router.get('/GetAllLiacenceAuditlog', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];

        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                if (columnName != 'createddate') {
                    search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                }

            };
        };
    }
    search['$and'] = [];
    var StartDate = req.query.StartDate;
    var EndDate = req.query.EndDate;
    if (StartDate != '' && EndDate != '') {
        StartDate = convertdateformat(StartDate, 3);
        EndDate = convertdateformat(EndDate, 3);

        var obj = new Object();
        obj['createddate'] = {
            $between: [StartDate, EndDate]
        };
        search['$and'].push(obj);
    } else if (StartDate != null && StartDate != '') {
        StartDate = convertdateformat(StartDate, 3);
        var obj = new Object();
        obj['createddate'] = {
            $gt: StartDate
        };
        search['$and'].push(obj);
    } else if (EndDate != null && EndDate != '') {
        EndDate = convertdateformat(EndDate, 3);
        var obj = new Object();
        obj['createddate'] = {
            $lt: EndDate
        };
        search['$and'].push(obj);
    }
    AuditLogLicence.findAndCountAll({
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


//Private functions
var maxLength = 16;
var minLength = 16;
var uppercaseMinCount = 2;
var lowercaseMinCount = 2;
var numberMinCount = 2;
var specialMinCount = 1;
var UPPERCASE_RE = /([A-Z])/g;
var LOWERCASE_RE = /([a-z])/g;
var NUMBER_RE = /([\d])/g;
var SPECIAL_CHAR_RE = /([\?\-\^\$\#\@\!\%\&\_\*])/g;
var NON_REPEATING_CHAR_RE = /([\w\d])\1{2}/g;

function isStrongEnough1(password) {
    var uc = password.match(UPPERCASE_RE);
    var lc = password.match(LOWERCASE_RE);
    var n = password.match(NUMBER_RE);
    var sc = password.match(SPECIAL_CHAR_RE);
    // var nr = password.match(NON_REPEATING_CHAR_RE);
    // console.log(uc)
    // console.log(n)
    // console.log(password.length >= minLength &&
    //     uc && uc.length >= uppercaseMinCount &&
    //     n && n.length >= numberMinCount)
    return password.length >= minLength &&
        uc && uc.length >= uppercaseMinCount &&
        n && n.length >= numberMinCount && !sc;
    // &&
    // sc && sc.length >= specialMinCount;
}

function customPassword1() {
    var password = "";
    var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
    while (!isStrongEnough1(password)) {
        password = generatePassword(randomLength, false, /[\w\d\-]/);
    }
    // console.log(password.toUpperCase());
    return password.toUpperCase();
}
var LicenceManager = models.tbllicencemanager;

router.get('/CreateLicenceNumbers', function(req, res) {
    req.setTimeout(3600000);
    // function insertLicenceno() {
    // var coll = [];
    // for (var i = 0; i < 20; i++) {
    //     var calldata = [customPassword1()];
    //     console.log(i, "---", calldata)
    //     coll.push(calldata);
    // }
    var Length = req.query.Length;
    var CheckPass = req.query.Pass;
    var AppName = req.query.AppName;
    var SystemPassword = process.env.LicencePassword;

    if (SystemPassword == CheckPass) {
        try {
            LicenceGenerateLength = parseInt(Length);
        } catch (ex) {
            LicenceGenerateLength = 0;
        }

        if (LicenceGenerateLength == 0 || LicenceGenerateLength.toString() == 'NaN') {
            res.json({
                success: false,
                message: "Please check Length. Licence number not Generated.",
            });

        } else {
            AppInfo.findOne({ where: { AppName: AppName } }).then(function(AppExits) {
                if (AppExits != null) {
                    function uploder(i) {
                        if (i < LicenceGenerateLength) {
                            var LicenceNo = customPassword1();
                            // LicenceManager.find({ where: { LicenceNo: LicenceNo } }).then(function(LicenceNoExits) {
                            //     if (LicenceNoExits) {
                            //         uploder(i + 1);
                            //     } else {
                            var obj = new Object();
                            obj.LicenceNo = LicenceNo;
                            obj.idApp = AppExits.Id;
                            obj.LicenceRenewalType = AppExits.LicenceRenewalType;
                            obj.LicenceType = AppExits.LicenceType;
                            LicenceManager.findOrCreate({ where: { LicenceNo: LicenceNo }, defaults: obj }).then(function(response) {
                                // console.log("###")
                                uploder(i + 1);
                            });
                            //     }
                            // })
                        } else {
                            res.json({
                                success: true,
                                message: "Licence number Generated successfully.",
                            });
                        }

                    }
                    uploder(0)
                } else {
                    res.json({
                        success: false,
                        message: "Please check AppName. Licence number not Generated.",
                    });
                }
            });
        }
    } else {
        res.json({
            success: false,
            message: "InvalidPassword. Licence number not Generated.",
        });
    }
    // connection.query("INSERT INTO tbllicencemanager (LicenceNo) VALUES ?", [coll], function(err, res, fields) {
    //     console.log("Err...", err);
    //     console.log("res...", res);
    // })
    // }
});
// insertLicenceno();

module.exports = router