(function() {
    'use strict';

    var express = require('express');
    var router = express.Router();
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();
    var moment = require('moment');
    var Commonfunction = require('./common.js');

    //////////

    var DeviceAgentRetailer = models.tbldeviceagentretailer;
    var Vehicle = models.tblvehicle;
    var User = models.tbluserinformation;
    var SIM = models.tblsimdetails;
    var AppInfo = models.tblappinfo;
    var GPSDevice = models.tblgpsdevice;
    var Country = models.tblcountrymgmt;
    var AgentRetailer = models.tblagentretailer
    var UserInRole = models.tbluserinrole;
    var Role = models.tblrole;
    //////////

    router.get('/getAutocompleteEmail', function(req, res) {
        var now = moment();
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
        User.findAll({
                where: {
                    email: {
                        $like: '%' + req.query.email + '%'
                    },
                    idApp: { $eq: req.query.idApp }
                },
                include: [{
                    model: UserInRole,
                    include: [{
                        model: Role,
                        where: { RoleName: 'User' }
                    }]
                }],
                limit: 20
            })
            .then(function(ruser) {
                if (ruser.length) {
                    res.json({
                        success: true,
                        message: 'Record(s) found.',
                        data: ruser
                    });
                } else {
                    res.json({
                        success: false,
                        message: 'No record(s) found.'
                    });
                }
            })
            .catch(function(err) {
                res.json({
                    success: false,
                    message: 'Record(s) not found.'
                });
            });
    });

    router.get('/findsimnumber', function(req, res) {
        GPSDevice.findOne({ where: { DeviceId: req.query.DeviceId } }).then(function(GPSDeviceExist) {
            if (GPSDeviceExist) {
                if (GPSDeviceExist.idSim != null && GPSDeviceExist.idSim != '' && GPSDeviceExist.idSim != undefined) {
                    SIM.findOne({ where: { id: GPSDeviceExist.idSim } }).then(function(response) {
                        res.json(response);
                    })
                } else {
                    res.json({ success: false, message: 'Sim not found..' })
                }
            } else {
                res.json({ success: false, message: 'Gps device not found..' })
            }
        })
    })

    router.get('/getAutocompleteActivateSerialNums', function(req, res) {
        var search = '';
        if (req.query.SerialNum != null && req.query.SerialNum != undefined && req.query.SerialNum != '') {
            search = " and SerialNum like '%" + req.query.SerialNum + "%'"
        }
        // if (req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != '') {

        //     search += " and idApp=" + req.query.idApp;

        // }
        var query = "select * from tblsimdetails where SerialNum not in (select simSerial from tbldeviceagentretailer where simSerial is not null) " + search;
        connection.query(query, function(err, response) {
            res.json({ success: true, data: response });
        })
    })


    router.get('/getPagedClientsByRetailerId', function(req, res) {
        DeviceAgentRetailer.belongsTo(Vehicle, {
            targetKey: 'deviceid',
            foreignKey: {
                name: 'deviceId',
                allowNull: false
            }
        });

        Vehicle.belongsTo(User, {
            foreignKey: {
                name: 'iduser',
                allowNull: false
            }
        });

        var include = {
            model: User,
            attributes: ['ProfileName', 'email', 'phone']
        };
        if (req.query.search.value) {
            include.where = {
                $or: [
                    { ProfileName: { $like: '%' + req.query.search.value + '%' } },
                    { email: { $like: '%' + req.query.search.value + '%' } },
                    { phone: { $like: '%' + req.query.search.value + '%' } }
                ]
            };
        }

        DeviceAgentRetailer.findAndCountAll({
                where: {
                    retailerId: req.query.retailerId
                },
                include: [{
                    model: Vehicle,
                    include: [include]
                }]
            })
            .then(function(result) {
                if (result.rows.length) {
                    res.json({
                        success: true,
                        message: 'Record(s) found.',
                        data: result.rows,
                        draw: req.query.draw,
                        recordsTotal: result.count,
                        recordsFiltered: result.count
                    });
                } else {
                    res.json({
                        success: false,
                        message: 'No record(s) found.',
                        data: result.rows,
                        draw: req.query.draw,
                        recordsTotal: result.count,
                        recordsFiltered: result.count
                    });
                }
            })
            .catch(function(err) {
                res.json({
                    success: false,
                    message: 'Record(s) not found.'
                });
            });
    });

    // router.get('/getAutocompleteActivateDeviceIds', function(req, res) {
    //     var now = moment();

    //     DeviceAgentRetailer.findAll({
    //             where: {
    //                 deviceId: {
    //                     $like: '%' + req.query.deviceId + '%'
    //                 },
    //                 $or: [
    //                     { activatedDatetime: { $eq: null } },
    //                     { expiryDatetime: { $lt: now } }
    //                 ]
    //             },
    //             limit: 20
    //         })
    //         .then(function(rGpsDevices) {
    //             if (rGpsDevices.length) {
    //                 res.json({
    //                     success: true,
    //                     message: 'Record(s) found.',
    //                     data: rGpsDevices
    //                 });
    //             } else {
    //                 res.json({
    //                     success: false,
    //                     message: 'No record(s) found.'
    //                 });
    //             }
    //         })
    //         .catch(function(err) {
    //             res.json({
    //                 success: false,
    //                 message: 'Record(s) not found.'
    //             });
    //         });
    // });

    router.get('/getAutocompleteActivateDeviceIds', function(req, res) {
        var now = moment();
        DeviceAgentRetailer.belongsTo(GPSDevice, {
            foreignKey: {
                name: 'deviceId',
                allowNull: false
            },
            targetKey: 'DeviceId',
        });

        GPSDevice.belongsTo(AppInfo, {
            foreignKey: {
                name: 'AppName',
                allowNull: false
            }
        });


        if (req.query.retailerId != 0) {
            AgentRetailer.findOne({
                where: {
                    retailerId: req.query.retailerId
                }
            }).then(function(objAgent) {
                if (objAgent != null) {
                    DeviceAgentRetailer.findAll({
                            where: {
                                deviceId: {
                                    $like: '%' + req.query.deviceId + '%'
                                },
                                agentId: objAgent.agentId,
                                $or: [
                                    { activatedDatetime: { $eq: null } },
                                    { expiryDatetime: { $lt: now } }
                                ]
                            },
                            // include: [{
                            //     model: GPSDevice,
                            //     include: [{
                            //         model: AppInfo,
                            //         where: { id: { $eq: req.query.idApp } }
                            //     }],
                            // }],
                            limit: 20
                        })
                        .then(function(rGpsDevices) {
                            if (rGpsDevices.length) {
                                res.json({
                                    success: true,
                                    message: 'Record(s) found.',
                                    data: rGpsDevices
                                });
                            } else {
                                res.json({
                                    success: false,
                                    message: 'No record(s) found.'
                                });
                            }
                        })
                        .catch(function(err) {
                            res.json({
                                success: false,
                                message: 'Record(s) not found.'
                            });
                        });
                } else {
                    res.json({
                        success: false,
                        message: 'No record(s) found.'
                    });
                }
            }).catch(function(err) {
                res.json({
                    success: false,
                    message: 'Record(s) not found.'
                });
            });
        } else {

            DeviceAgentRetailer.findAll({
                    where: {
                        deviceId: {
                            $like: '%' + req.query.deviceId + '%'
                        },
                        $or: [
                            { activatedDatetime: { $eq: null } },
                            { expiryDatetime: { $lt: now } }
                        ]
                    },
                    // include: [{
                    //     model: GPSDevice,
                    //     include: [{
                    //         model: AppInfo,
                    //         where: { id: { $eq: req.query.idApp } }
                    //     }],
                    // }],
                    limit: 20
                })
                .then(function(rGpsDevices) {
                    if (rGpsDevices.length) {
                        res.json({
                            success: true,
                            message: 'Record(s) found.',
                            data: rGpsDevices
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'No record(s) found.'
                        });
                    }
                })
                .catch(function(err) {
                    res.json({
                        success: false,
                        message: 'Record(s) not found.'
                    });
                });
        }
    });

    router.get('/getAutocompleteReconfigureDeviceIds', function(req, res) {
        var now = moment();

        DeviceAgentRetailer.findAll({
                where: {
                    deviceId: {
                        $like: '%' + req.query.deviceId + '%'
                    },
                    activatedDatetime: {
                        $lt: now
                    },
                    expiryDatetime: {
                        $gt: now
                    }
                },
                limit: 20
            })
            .then(function(rGpsDevices) {
                if (rGpsDevices.length) {
                    res.json({
                        success: true,
                        message: 'Record(s) found.',
                        data: rGpsDevices
                    });
                } else {
                    res.json({
                        success: false,
                        message: 'No record(s) found.'
                    });
                }
            })
            .catch(function(err) {
                res.json({
                    success: false,
                    message: 'Record(s) not found.'
                });
            });
    });

    router.post('/activateDevice', jsonParser, function(req, res) {
        var objVehicle = req.body.objvehicle;
        DeviceAgentRetailer.findOne({
                where: {
                    $or: {
                        deviceId: req.body.deviceId,
                        simSerial: req.body.simSerial
                    }
                },
                $or: [
                    { activatedDatetime: { $eq: null } },
                    { expiryDatetime: { $ne: null } }
                ]
            })
            .then(function(rDeviceAgentRetailer) {
                // console.log("************************", rDeviceAgentRetailer)
                if (!rDeviceAgentRetailer) {
                    var err = new Error('GPS device not found.');
                    err.name = 'BugzError';
                    throw err;
                } else {
                    SIM.findOne({
                            where: { SerialNum: req.body.simSerial }
                        }).then(function(SIMExist) {
                            if (!SIMExist) {
                                var err = new Error('Sim Serial not found.');
                                err.name = 'BugzError';
                                throw err;
                            }
                            return rDeviceAgentRetailer.update({
                                retailerId: req.body.retailerId,
                                simSerial: req.body.simSerial,
                                activatedDatetime: moment(),
                                expiryDatetime: moment().add(1, 'year'),
                                lastModifiedDatetime: moment()
                            });
                        }).then(function(rDeviceAgentRetailer) {

                            User.findOne({ where: { id: req.body.retailerId } }).then(function(userexits) {
                                    GPSDevice.findOne({ where: { DeviceId: objVehicle.deviceid } }).then(function(GPSDevicefound) {
                                        if (GPSDevicefound) {
                                            GPSDevicefound.updateAttributes({ idSim: req.body.idSim }).then(function(GPSDeviceupdated) {
                                                if (GPSDeviceupdated) {
                                                    funAuditLog.CreateAuditLog('update idSim GPSDevice ', userexits.username, 'update idSim GPSDevice (DeviceId:' + GPSDevicefound.DeviceId + ') throgth Device activation ');
                                                }
                                            })
                                        }
                                    })
                                    objVehicle.CreatedDate = new Date();
                                    objVehicle.CreatedBy = userexits.username;
                                    Vehicle.findOne({
                                        where: {
                                            deviceid: objVehicle.deviceid,
                                        }
                                    }).then(function(VehicleExist) {
                                        // AssignLicenceNumber(objVehicle, userexits.username, function(LicenceNores) {
                                        //     if (LicenceNores.success == true) {
                                        if (VehicleExist) {

                                            if (VehicleExist.IsDelete == true) {
                                                objVehicle.IsDelete = false;
                                                // var LicenceNo = objVehicle.Licence_No;
                                                checkLicence(objVehicle, userexits.username, function(LicenceNores) {
                                                    if (LicenceNores.success == true) {
                                                        objVehicle.renewaldate = LicenceNores.data.ExpiryDate;
                                                        Vehicle.update(objVehicle, {
                                                            where: {
                                                                id: VehicleExist.id
                                                            }
                                                        }).then(function(vehicleCreated) {
                                                            if (vehicleCreated) {
                                                                Commonfunction.UpdateVehicleRedis(objVehicle.deviceid, 'Vehicle');
                                                                funAuditLog.CreateAuditLog('Create Vehicle through device Activation', userexits.username, 'Save Vehicle (DeviceId:' + vehicleCreated.deviceid + ') through device Activation');
                                                                callActiveDevice()
                                                            }
                                                        })
                                                    } else {
                                                        res.json({
                                                            success: false,
                                                            message: LicenceNores.message,
                                                            data: null
                                                        });
                                                    }
                                                })
                                            } else {
                                                callActiveDevice()
                                            }
                                        } else {
                                            // var LicenceNo = objVehicle.Licence_No;
                                            checkLicence(objVehicle, userexits.username, function(LicenceNores) {
                                                if (LicenceNores.success == true) {
                                                    objVehicle.renewaldate = LicenceNores.data.ExpiryDate;
                                                    Vehicle.create(objVehicle).then(function(vehicleCreated) {
                                                        if (vehicleCreated) {
                                                            Commonfunction.UpdateVehicleRedis(objVehicle.deviceid);
                                                            funAuditLog.CreateAuditLog('Create Vehicle through device Activation', userexits.username, 'Save Vehicle (DeviceId:' + vehicleCreated.deviceid + ') through device Activation');
                                                            callActiveDevice()
                                                        }
                                                    })

                                                } else {
                                                    res.json({
                                                        success: false,
                                                        message: LicenceNores.message,
                                                        data: null
                                                    });
                                                }
                                            })
                                        }
                                        //     } else {
                                        //         res.json({
                                        //             success: false,
                                        //             message: "Invalid Licence Number",
                                        //             data: null
                                        //         });
                                        //     }
                                        // })
                                    })
                                })
                                // console.log("SUCCESS..............................................................")

                            function callActiveDevice() {
                                User.findOne({ where: rDeviceAgentRetailer.agentId }).then(function(UserExist) {
                                    GPSDevice.findOne({ where: { DeviceId: rDeviceAgentRetailer.deviceId } }).then(function(GPSDeviceExist) {
                                        Country.findOne({ where: { id: GPSDeviceExist.CountryId } }).then(function(countryExist) {
                                            var DeviceCountry = null;
                                            if (countryExist) {
                                                DeviceCountry = countryExist.Country;
                                            }
                                            CreateOrderServiceGlobal(DeviceCountry, objVehicle.iduser, rDeviceAgentRetailer.deviceId, UserExist.username, UserExist.idApp, function(orderresponse) {
                                                AppInfo.findOne({ where: { id: UserExist.idApp } }).then(function(AppinfoExist) {
                                                    if (AppinfoExist.AppName == 'Maark') {
                                                        res.json({
                                                            success: true,
                                                            message: 'Device activated!',
                                                            data: rDeviceAgentRetailer
                                                        });
                                                    } else {
                                                        CreateDabitWalletTransactionGlobal(DeviceCountry, rDeviceAgentRetailer.deviceId, UserExist.username, UserExist.idApp, function(resFlg) {
                                                            res.json({
                                                                success: true,
                                                                message: 'Device activated!',
                                                                data: rDeviceAgentRetailer
                                                            });
                                                        })
                                                    }
                                                })
                                            })
                                        })

                                    })

                                })
                            }
                        })
                        .catch(function(err) {
                            console.log("err..", err);
                            res.json({
                                success: false,
                                message: err.message
                            });
                        });
                }
            })
            // .then(function(rDeviceAgentRetailer) {
            //     User.findOne({ where: rDeviceAgentRetailer.agentId }).then(function(UserExist) {
            //         console.log(rDeviceAgentRetailer)

        //         console.log(UserExist.country, "===", rDeviceAgentRetailer.DeviceId, "===", UserExist.username, "===", UserExist.idApp)
        //         CreateDabitWalletTransactionGlobal(UserExist.country, rDeviceAgentRetailer.DeviceId, UserExist.username, UserExist.idApp, function(resFlg) {
        //             res.json({
        //                 success: true,
        //                 message: 'Device activated!',
        //                 data: rDeviceAgentRetailer
        //             });
        //         })
        //     })
        // })
        .catch(function(err) {
            console.log("err..", err);
            res.json({
                success: false,
                message: err.message
            });
        });
    });

    module.exports = router;
})();