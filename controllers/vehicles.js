var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var UserInRole = models.tbluserinrole;
//End of Tables

router.get('/GetAllDynamicVehicle', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (vehicle.Name like "%' + objSearch + '%" or ';
        search = search + 'user.username like "%' + objSearch + '%" or ';
        search = search + 'vehicle.deviceid like "%' + objSearch + '%" or ';
        search = search + 'vehicle.BatteryPercentage like "%' + objSearch + '%" or ';
        search = search + 'vehicle.HandshakDatetime like "%' + objSearch + '%" or ';
        search = search + 'vehicle.IsOnline like "%' + objSearch + '%") ';
    }

    if (search != "") {
        search += ' and vehicle.IsDelete = 0 ';
    } else {
        search += ' where vehicle.IsDelete = 0 ';
    }


    var qry = "Select Vehicle.*, " +
        "user.username AS username " +
        "FROM tblvehicle AS vehicle " +
        "LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "SELECT count(vehicle.id) as TotalRecord " +
        "FROM tblvehicle AS vehicle " +
        "LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search;

    connection.query(qry, function(err, response) {
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
});

router.post('/SaveVehicle', jsonParser, function(req, res) {
    objVehicle = req.body;
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
                if (objVehicle.id == 0) {
                    objVehicle.CreatedDate = new Date();
                    objVehicle.CreatedBy = decoded.username;
                    Vehicle.findOrCreate({ where: { deviceid: objVehicle.deviceid }, defaults: objVehicle }).then(function(response) {
                        if (response[0]) {
                            funAuditLog.CreateAuditLog('SaveVehicle', decoded.username, 'Create Vehicle');
                            res.json({
                                success: true,
                                message: "Vehicle Detail created successfully...",
                                data: response
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "Vehicle Detail is already Exist...",
                                data: response
                            });
                        }
                    })
                } else {
                    objVehicle.ModifiedDate = new Date();
                    objVehicle.ModifiedBy = decoded.username;
                    Vehicle.update(objVehicle, {
                        where: {
                            id: objVehicle.id
                        }
                    }).then(function(response) {
                        if (response[0]) {
                            funAuditLog.CreateAuditLog('SaveVehicle', decoded.username, 'Update Vehicle');
                            res.json({
                                success: true,
                                message: "Vehicle Detail updated successfully...",
                                data: response
                            });
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
})

router.post('/SaveVehicle1', jsonParser, function(req, res) {
    objVehicle = req.body;
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
                Bike.count({
                    where: {
                        iduser: objPet.iduser,
                        IsDeleted: false,
                        DeviceType: {
                            $ne: 'M2'
                        },
                    }
                }).then(function(objCount) {
                    if (objPet.deviceid != '' && objPet.deviceid != null) {

                        var searchDevice = {};
                        searchDevice['$and'] = [];

                        var obj = new Object();
                        obj['DeviceId'] = {
                            $eq: objPet.deviceid
                        };
                        searchDevice['$and'].push(obj);

                        if (objPet.Type == 'Owner') {
                            var obj = new Object();
                            obj['Type'] = {
                                $ne: 'M2'
                            };
                            searchDevice['$and'].push(obj);
                        } else {
                            var obj = new Object();
                            obj['Type'] = {
                                $eq: 'M2'
                            };
                            searchDevice['$and'].push(obj);
                        }

                        PetDevice.findOne({
                            // where: {
                            //     DeviceId: objPet.deviceid,
                            //     Type: DeviceType,
                            // }

                            where: searchDevice
                        }).then(function(objPetDevice) {
                            if (objPetDevice != null) {
                                if (objPet.id == 0) {

                                    objPet.IMEINumber = objPetDevice.IMEI;
                                    objPet.IsOldDevice = objPetDevice.IsOldDevice;
                                    objPet.IsOnline = false;
                                    // objPet.HandshakDatetime = null;
                                    objPet.CreatedDate = GetCurrentDate();
                                    objPet.DeviceType = objPetDevice.Type;
                                    Bike.findOne({
                                        where: {
                                            deviceid: objPet.deviceid,
                                            IsDeleted: true
                                        }
                                    }).then(function(objPetExist) {
                                        if (objPetExist) {
                                            objPet.id = objPetExist.id;
                                            Bike.update(objPet, {
                                                where: {
                                                    id: objPet.id
                                                }
                                            }).then(function(response) {
                                                if (response[0]) {
                                                    funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Create Vehicle');
                                                    res.json({
                                                        success: true,
                                                        message: "Vehicle created successfully...",
                                                        data: objPet
                                                    });
                                                }
                                            })
                                        } else {
                                            objPet.mode = 1;
                                            Bike.findOne({
                                                where: {
                                                    deviceid: objPet.deviceid,
                                                    IsDeleted: false
                                                }
                                            }).then(function(objNewPetExist) {
                                                if (objNewPetExist) {
                                                    res.json({
                                                        success: false,
                                                        message: "Tracker No. is already assign to other Vehicle...",
                                                        data: null
                                                    });

                                                } else {
                                                    Bike.create(objPet).then(function(response) {
                                                        if (response) {
                                                            funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Create Vehicle');
                                                            res.json({
                                                                success: true,
                                                                message: "Vehicle created successfully...",
                                                                data: response
                                                            });
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Tracker No. is already assign to other Vehicle...",
                                                                data: null
                                                            });
                                                        }
                                                    })
                                                }

                                            })
                                        }
                                    })
                                } else {
                                    objPet.IsOldDevice = objPetDevice.IsOldDevice;
                                    Bike.findOne({
                                        where: {
                                            deviceid: objPet.deviceid
                                        }
                                    }).then(function(objPetExist) {
                                        if (objPetExist != null && objPetExist.id != objPet.id && objPetExist.IsDeleted == false) {
                                            res.json({
                                                success: false,
                                                message: "Tracker No. is already assign to other Vehicle...",
                                                data: objPetExist
                                            });
                                        } else {
                                            Bike.update(objPet, {
                                                where: {
                                                    id: objPet.id
                                                }
                                            }).then(function(response) {
                                                if (response[0]) {
                                                    funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Update Vehicle');
                                                    res.json({
                                                        success: true,
                                                        message: "Vehicle updated successfully...",
                                                        data: objPet
                                                    });
                                                }
                                            })
                                        }
                                    })
                                }
                            } else {
                                res.json({
                                    success: false,
                                    message: "Invalid Tracker No., Please insert valid Tracker No.",
                                    data: ""
                                });
                            }
                        })
                    } else {
                        if (objPet.id == 0) {
                            objPet.IMEINumber = '';
                            // objPet.IsOldDevice = objPetDevice.IsOldDevice;
                            objPet.IsOnline = false;
                            objPet.HandshakDatetime = null;
                            objPet.CreatedDate = GetCurrentDate();

                            // Pet.findOne({
                            //     where: {
                            //         deviceid: objPet.deviceid,
                            //         IsDeleted: true
                            //     }
                            // }).then(function(objPetExist) {
                            //     if (objPetExist) {
                            //         objPet.id = objPetExist.id;
                            //         Pet.update(objPet, {
                            //             where: {
                            //                 id: objPet.id
                            //             }
                            //         }).then(function(response) {
                            //             if (response[0]) {
                            //                 res.json({
                            //                     success: true,
                            //                     message: "Pet created successfully...",
                            //                     data: objPet
                            //                 });
                            //             }
                            //         })

                            //     } else {
                            objPet.mode = 1;
                            // Pet.findOne({
                            //     where: {
                            //         deviceid: objPet.deviceid,
                            //         IsDeleted: false
                            //     }
                            // }).then(function(objNewPetExist) {
                            //     if (objNewPetExist) {
                            //         res.json({
                            //             success: false,
                            //             message: "Device id is already assign to other pet...",
                            //             data: null
                            //         });

                            //     } else {
                            Bike.create(objPet).then(function(response) {
                                if (response) {
                                    funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Create Vehicle');
                                    res.json({
                                        success: true,
                                        message: "Vehicle created successfully...",
                                        data: response
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Tracker No. is already assign to other pet...",
                                        data: null
                                    });
                                }
                            })

                            //     }

                            // })
                            //     }
                            // })
                        } else {
                            // objPet.IsOldDevice = objPetDevice.IsOldDevice;
                            Bike.findOne({
                                where: {
                                    id: objPet.id
                                }
                            }).then(function(objPetExist) {
                                if (objPetExist != null && objPetExist.id != objPet.id && objPetExist.IsDeleted == false) {
                                    res.json({
                                        success: false,
                                        message: "Tracker No. is already assign to other Vehicle...",
                                        data: objPetExist
                                    });
                                } else {
                                    Bike.update(objPet, {
                                        where: {
                                            id: objPet.id
                                        }
                                    }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Update Vehicle');
                                            res.json({
                                                success: true,
                                                message: "Vehicle updated successfully...",
                                                data: objPet
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    }
                    //}
                });
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/DeleteVehicle', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;
    if (token) {
        var decoded = jwt.decode(token, TokenKey);

        var search = {};
        search['$and'] = [];

        var obj = new Object();
        obj['username'] = {
            $eq: decoded.username
        };
        search['$and'].push(obj);
        if (req.query.Type == 'Owner') {
            var obj = new Object();
            obj['password'] = {
                $eq: decoded.password
            };
            search['$and'].push(obj);
        } else {
            var obj = new Object();
            obj['password'] = {
                $eq: decoded.password
            };
            search['$and'].push(obj);
        }

        User.findOne({
            where: search
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (req.query.id != '' && req.query.id != null) {
                    Vehicle.findOne({
                        where: {
                            id: req.query.id,
                            IsDelete: false
                        }
                    }).then(function(response) {
                        if (response) {
                            response.updateAttributes({ IsDelete: true }).then(function(resUpdate) {
                                funAuditLog.CreateAuditLog('DeleteVehicle', UserExist.username, 'Delete Vehicle');
                                res.json({
                                    success: true,
                                    message: "Vehicle Deleted Successfully",
                                    data: response
                                });
                            });
                        } else {
                            res.json(RecordNotFound);
                        }

                    })
                } else {
                    res.json({
                        success: false,
                        message: "Select Vehicle To delete",
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
    //     } else {
    //         res.json(NoAccessPermission);
    //     }
    // });
});

router.get('/GetAllVehicleByUser', function(req, res) {
    console.log(req.query);
    if (req.query.iduser != null || req.query.iduser != undefined) {

        var search = {};

        search['$and'] = [];

        var obj = new Object();
        obj['iduser'] = {
            $eq: req.query.iduser
        };
        search['$and'].push(obj);

        var obj = new Object();
        obj['deviceid'] = {
            $ne: ''
        };
        search['$and'].push(obj);

        var obj = new Object();
        obj['IsDelete'] = {
            $eq: false
        };
        search['$and'].push(obj);

        Vehicle.findAll({
            where: search,
            order: 'CreatedDate'
        }).then(function(response) {
            res.json(response);
        }).catch(function(error) {
            res.json(error);
        })
    } else {
        res.json(RecordNotFound);
    }

})


module.exports = router