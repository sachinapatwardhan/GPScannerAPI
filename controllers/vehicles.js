var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var UserInRole = models.tbluserinrole;
var DrivingData = models.tbldrivingdata;
var GPSData = models.tblgpsdata;
var Alarm = models.tblalarm;
var DefaultValue = models.tbldefaultvalue;
var VehicleGroup = models.tblvehiclegroup;
var LicenceManager = models.tbllicencemanager;
//End of Tables

router.get('/UpdateExpiryDate', function(req, res) {
    objHeader = req.headers;
    // var DeviceList = req.query.DeviceList;
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
                Vehicle.findOne({ where: { id: req.query.id } }).then(function(vehicleExist) {
                    if (vehicleExist) {
                        var oldexpdate = vehicleExist.renewaldate;

                        vehicleExist.updateAttributes({ renewaldate: req.query.renewaldate }).then(function(response) {
                            LicenceManager.findOne({ where: { DeviceId: vehicleExist.deviceid, IsDeleted: 0 } }).then(function(LicenceExist) {
                                var oldExpiry = LicenceExist.ExpiryDate;
                                if (LicenceExist) {
                                    LicenceExist.updateAttributes({ ExpiryDate: req.query.renewaldate }).then(function(UpdateExpiry) {
                                        if (UpdateExpiry) {
                                            funAuditLogLicence.CreateAuditLogLicence('Update Licence Expiry date', LicenceExist.LicenceNo, LicenceExist.DeviceId, req.query.renewaldate, oldExpiry, UserExist.username, 'Update Licence Expiry date througth vehicle expiry update');

                                        }
                                    })
                                }
                            })
                            if (response) {
                                var difference = (response.renewaldate.getFullYear() * 12 + response.renewaldate.getMonth()) - (oldexpdate.getFullYear() * 12 + oldexpdate.getMonth());
                                // funAuditLog.CreateAuditLog('Update ExpiryDate of Device', UserExist.usernam, 'Update vehicle ExpiryDate of Device (' + response.deviceid + ')');
                                funAuditLog.CreateAuditLog('update ExpiryDate of Device', UserExist.username, 'DeviceID(' + response.deviceid + ') / update vehicle ExpiryDate of Device (' + convertdateformat1(response.renewaldate, 4) + ') / Old ExpiryDate (' + convertdateformat1(vehicleExist.renewaldate, 4) + ') / Updated for (' + difference + ' month)');
                                res.json({ success: true, message: 'Expiry Date updated successfully..' })
                            } else {
                                res.json({ success: false, message: 'Expiry Date not updated' })
                            }
                        })
                    } else {
                        res.json({ success: false, message: 'vehicle not found..' })
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


router.get('/GetAllGroup', function(req, res) {
    VehicleGroup.findAll({ where: { IdUser: req.query.IdUser } }).then(function(response) {
        res.json(response)
    })
})


router.get('/AddVehicleToGroup', function(req, res) {
    objHeader = req.headers;
    var TotalSuccess = 0;
    var TotalError = 0;
    // var DeviceList = req.query.DeviceList;
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
                connection.query("Update tblvehicle set IdGroup=null where IdGroup =" + req.query.Id, function(err, vehicleRemoveToGroup, fields) {
                    connection.query("Update tblsharedevice set IdSharedGroup=null where idUser=" + req.query.idUser + " and IdSharedGroup =" + req.query.Id, function(err, sharedvehicleRemoveToGroup, fields) {
                        uploder(0);

                        function uploder(i) {
                            if (i < 2) {
                                if (i == 0) {
                                    if (req.query.DeviceList != undefined && req.query.DeviceList != null && req.query.DeviceList != '') {
                                        connection.query("Update tblvehicle set IdGroup=" + req.query.Id + " where deviceid in (" + [req.query.DeviceList] + ")", function(err, VehicleAddToGroup, fields) {
                                            if (!err && VehicleAddToGroup) {
                                                uploder(i + 1);
                                                TotalSuccess++;
                                            } else {
                                                uploder(i + 1);
                                                TotalError++;
                                            }
                                        })
                                    } else {
                                        uploder(i + 1);
                                    }
                                }
                                if (i == 1) {
                                    if (req.query.SharedDeviceList != undefined && req.query.SharedDeviceList != null && req.query.SharedDeviceList != '') {
                                        connection.query("Update tblsharedevice set IdSharedGroup=" + req.query.Id + " where idUser=" + req.query.idUser + " and DeviceId in (" + [req.query.SharedDeviceList] + ")", function(err, VehicleAddToGroup, fields) {

                                            if (!err && VehicleAddToGroup) {
                                                uploder(i + 1);
                                                TotalSuccess++;
                                            } else {
                                                uploder(i + 1);
                                                TotalError++;
                                            }
                                        })
                                    } else {
                                        uploder(i + 1);
                                    }
                                }
                            } else {
                                res.json({ success: true, message: 'Vehicle added in this group successfully..', TotalError: TotalError, TotalSuccess: TotalSuccess })
                            }

                        }
                        // if (req.query.DeviceList.length > 0) {
                        //     console.log("Update tblvehicle set IdGroup=" + req.query.Id + " where deviceid in (" + [req.query.DeviceList] + ")");
                        //     connection.query("Update tblvehicle set IdGroup=" + req.query.Id + " where deviceid in (" + [req.query.DeviceList] + ")", function(err, VehicleAddToGroup, fields) {
                        //         console.log(err)
                        //         if (!err && VehicleAddToGroup) {
                        //             res.json({ success: true, message: 'Vehicle added in this group successfully..' })
                        //         } else {
                        //             res.json({ success: false, message: 'Vehicle not added in this group..' })
                        //         }
                        //     })
                        // } else {
                        //     res.json({ success: false, message: 'Vehicle list not found' })
                        // }

                        // if (req.query.SharedDeviceList.length > 0) {

                        // }
                    })
                })

            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})


router.get('/GroupRemoveById', function(req, res) {
    objHeader = req.headers;
    // var DeviceList = req.query.DeviceList;
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

                connection.query("Update tblvehicle set IdGroup=null where IdGroup =" + req.query.Id, function(err, GroupRemoved, fields) {
                    if (!err && GroupRemoved) {
                        connection.query("Update tblsharedevice set IdSharedGroup=null where IdSharedGroup =" + req.query.Id, function(err, sharedvehicleRemoveToGroup, fields) {
                            if (!err && sharedvehicleRemoveToGroup) {
                                VehicleGroup.destroy({ where: { Id: req.query.Id } }).then(function(response) {
                                    if (response) {
                                        res.json({ success: true, message: 'Group removed successfully..' })
                                    }
                                })
                            } else {
                                res.json({ success: false, message: 'Group is not removed..' })
                            }

                        })
                    } else {
                        res.json({ success: false, message: 'Group is not removed..' })
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


router.get('/updateVehicleGroupName', function(req, res) {

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
                VehicleGroup.findOne({ where: { Id: req.query.Id } }).then(function(VehiceGroupExist) {
                    if (VehiceGroupExist) {
                        VehiceGroupExist.updateAttributes({ GroupName: req.query.GroupName }).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('update vehicle group name', UserExist.username, 'update vehicle group name');
                                res.json({ success: true, message: "Group Name updated Successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "Group Name is not updated...", data: response });
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Group not found..." });
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


router.get('/GetAllNotAssignGroupVehicle', function(req, res) {

    var query = "Select tblvehicle.*,tblsharedevice.IdSharedGroup from tblvehicle " +
        "Left Join tblsharedevice on tblsharedevice.idVehicle = tblvehicle.id " +
        "where (tblvehicle.IdGroup IS Null or tblsharedevice.IdSharedGroup IS Null or tblvehicle.IdGroup =" + req.query.IdGroup + " or tblsharedevice.IdSharedGroup ==" + req.query.IdGroup + " ) " +
        "and tblvehicle.IsDelete=0 and tblvehicle.Iduser=" + req.query.IdUser;


    Vehicle.findAll({
        where: {
            $or: [{ IdGroup: null }, { IdGroup: req.query.IdGroup }],
            $and: [{
                Iduser: req.query.IdUser,
                IsDelete: 0
            }]
        }
    }).then(function(response) {
        res.json(response)
    })
})

router.post('/SaveVehicleGroup', jsonParser, function(req, res) {
    objGroup = req.body;
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
                if (objGroup.Id == 0) {
                    objGroup.CreatedBy = UserExist.username;
                    objGroup.CreatedDate = new Date();

                    VehicleGroup.findOne({ where: { IdUser: objGroup.IdUser, GroupName: objGroup.GroupName } }).then(function(VehiceGroupExist) {
                        if (VehiceGroupExist) {
                            res.json({ success: false, message: "Group is already exist...", data: VehiceGroupExist });
                        } else {
                            VehicleGroup.create(objGroup).then(function(response) {
                                if (response) {
                                    funAuditLog.CreateAuditLog('Create vehicle group', UserExist.username, 'Cerate New vehicle group');
                                    res.json({ success: true, message: "Group created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Group is not Created...", data: response });
                                }
                            })
                        }
                    })

                } else {
                    VehicleGroup.findOne({
                        where: { IdUser: objGroup.IdUser, GroupName: objGroup.GroupName },
                        defaults: objGroup
                    }).then(function(objVehicleGroupExist) {
                        if (objVehicleGroupExist != null && objGroup.Id != objVehicleGroupExist.Id) {
                            res.json({ success: false, message: "Group is already exist...", data: objVehicleGroupExist });
                        } else {
                            VehicleGroup.update(objGroup, { where: { Id: objGroup.Id } }).then(function(response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('Update vehicle group', UserExist.username, 'Update vehicle group Data');
                                    res.json({ success: true, message: "Group updated successfully...", data: response });
                                } else {
                                    res.json({ success: true, message: "Group is not updated successfully...", data: response });
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
})




router.get('/GetAllDynamicVehicle', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;

    var AdvanceSearch = objParam.AdvanceSearch;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (vehicle.Name like "%' + objSearch + '%" or ';
        search = search + 'user.username like "%' + objSearch + '%" or ';
        search = search + 'vehicle.deviceid like "%' + objSearch + '%" or ';
        search = search + 'vehicle.BatteryPercentage like "%' + objSearch + '%" or ';
        search = search + 'vehicle.HandshakDatetime like "%' + objSearch + '%" or ';
        search = search + 'vehicle.DeviceType like "%' + objSearch + '%" or ';
        search = search + 'vehicletype.Type like "%' + objSearch + '%" or ';
        search = search + 'vehicle.IsOnline like "%' + objSearch + '%") ';
    }

    if (objParam.UserId != null && objParam.UserId != '' && objParam.UserId != undefined) {
        if (search != "") {
            search += ' and vehicle.idSalesAgent = ' + objParam.UserId;
        } else {
            search += ' where vehicle.idSalesAgent = ' + objParam.UserId;
        }
    }

    if (search != "") {
        search += ' and vehicle.IsDelete = 0 ';
    } else {
        search += ' where vehicle.IsDelete = 0 ';
    }
    if (objParam.appId != null && objParam.appId != '' && objParam.appId != undefined) {
        if (search != "") {
            search += ' and user.idApp =' + objParam.appId;
        } else {
            search += ' Where user.idApp =' + objParam.appId;
        }
    }
    var AdvanceSearch = objParam.AdvanceSearch;
    if (AdvanceSearch != null && AdvanceSearch != '' && AdvanceSearch != undefined) {
        if (AdvanceSearch.idType != '' && AdvanceSearch.idType != undefined && AdvanceSearch.idType != '') {
            search += " and vehicle.idType=" + AdvanceSearch.idType;
        }
        if (AdvanceSearch.StartDate != '' && AdvanceSearch.EndDate == '') {
            search += " and Date(vehicle.renewaldate)>='" + ConvertDateFormat(new Date(AdvanceSearch.StartDate)) + "'";
        }
        if (AdvanceSearch.StartDate == '' && AdvanceSearch.EndDate != '') {
            search += " and Date(vehicle.renewaldate)<'" + ConvertDateFormat(new Date(AdvanceSearch.EndDate)) + "'";
        }
        if (AdvanceSearch.StartDate != '' && AdvanceSearch.EndDate != '') {
            search += " and Date(vehicle.renewaldate)>='" + ConvertDateFormat(new Date(AdvanceSearch.StartDate)) + "' and Date(vehicle.renewaldate) <= '" + ConvertDateFormat(new Date(AdvanceSearch.EndDate)) + "'";
        }
        if (AdvanceSearch.IsOnline != '' && AdvanceSearch.IsOnline != '') {
            search += " and vehicle.IsOnline =" + AdvanceSearch.IsOnline;
        }
    }

    console.log(search)
    var qry = "Select vehicle.*,vehicletype.Type,gpsdevice.IMEI,CONVERT_TZ(vehicle.HandshakDatetime,'+00:00','" + CurrentOffset + "') as DisplyHandshakDate, CONVERT_TZ(vehicle.renewaldate,'+00:00','" + CurrentOffset + "') as Displyrenewaldate,  " +
        "user.username AS username " +
        "FROM tblvehicle AS vehicle " +
        " left join tblvehicletype  as vehicletype on vehicletype.id = vehicle.idType " +
        " left join tblgpsdevice as gpsdevice on gpsdevice.DeviceId =vehicle.deviceid " +
        " LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    // var Countqry = "SELECT count(vehicle.id) as TotalRecord " +
    //     "FROM tblvehicle AS vehicle " +
    //     "LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search;
    var Countqry = "SELECT count(vehicle.id) as TotalRecord " +
        "FROM tblvehicle AS vehicle " +
        " left join tblvehicletype  as vehicletype on vehicletype.id = vehicle.idType " +
        " left join tblgpsdevice as gpsdevice on gpsdevice.DeviceId =vehicle.deviceid " +
        " LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search;

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


router.get('/ExportVehicle', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
            caption: 'User Name',
            type: 'string'
        }, {
            caption: 'Vehicle',
            type: 'string'
        }, {
            caption: 'Tracker Id',
            type: 'string'
        },
        {
            caption: 'Device Type',
            type: 'string'
        }, {
            caption: 'Type',
            type: 'string'
        }, {
            caption: 'Expiry Date',
            type: 'string'
        },
        {
            caption: 'HandShake Time',
            type: 'string'
        },
        {
            caption: 'Is Online',
            type: 'string'
        },
    ];

    var objParam = req.query;
    var search = "";
    if (objParam.IsTrackingApp == 'true' || objParam.IsTrackingApp == true) {
        conf.cols.splice(3, 1);
    }
    console.log(objParam)
    if (objParam.UserId != null && objParam.UserId != '' && objParam.UserId != undefined) {
        if (search != "") {
            search += ' and vehicle.idSalesAgent = ' + objParam.UserId;
        } else {
            search += ' where vehicle.idSalesAgent = ' + objParam.UserId;
        }
    }

    if (search != "") {
        search += ' and vehicle.IsDelete = 0 ';
    } else {
        search += ' where vehicle.IsDelete = 0 ';
    }
    if (objParam.appId != null && objParam.appId != '' && objParam.appId != undefined) {
        if (search != "") {
            search += ' and user.idApp =' + objParam.appId;
        } else {
            search += ' Where user.idApp =' + objParam.appId;
        }
    }
    if (objParam.IsOnline != null && objParam.IsOnline != '' && objParam.IsOnline != undefined) {
        if (search != "") {
            search += ' and vehicle.IsOnline =' + objParam.IsOnline;
        } else {
            search += ' Where vehicle.IsOnline =' + objParam.IsOnline;
        }
    }
    if (objParam.idType != null && objParam.idType != '' && objParam.idType != undefined) {
        if (search != "") {
            search += ' and vehicle.idType=' + objParam.idType;
        } else {
            search += ' Where vehicle.idType=' + objParam.idType;
        }
    }
    if (objParam.StartDate != '' && objParam.EndDate == '') {
        if (search != "") {
            search += " and Date(vehicle.renewaldate)>='" + ConvertDateFormat(new Date(objParam.StartDate)) + "'";
        } else {
            search += " Where Date(vehicle.renewaldate)>='" + ConvertDateFormat(new Date(objParam.StartDate)) + "'";
        }
    }
    if (objParam.StartDate == '' && objParam.EndDate != '') {
        if (search != "") {
            search += " and Date(vehicle.renewaldate)<'" + ConvertDateFormat(new Date(objParam.EndDate)) + "'";
        } else {
            search += " Where Date(vehicle.renewaldate)<'" + ConvertDateFormat(new Date(objParam.EndDate)) + "'";
        }
    }
    if (objParam.StartDate != '' && objParam.EndDate != '') {
        if (search != "") {
            search += " and Date(vehicle.renewaldate)>='" + ConvertDateFormat(new Date(objParam.StartDate)) + "' and Date(vehicle.renewaldate) <= '" + ConvertDateFormat(new Date(objParam.EndDate)) + "'";
        } else {
            search += " where Date(vehicle.renewaldate)>='" + ConvertDateFormat(new Date(objParam.StartDate)) + "' and Date(vehicle.renewaldate) <= '" + ConvertDateFormat(new Date(objParam.EndDate)) + "'";
        }
    }

    var qry = "Select vehicle.*,vehicletype.Type,gpsdevice.IMEI,CONVERT_TZ(vehicle.HandshakDatetime,'+00:00','" + CurrentOffset + "') as DisplyHandshakDate, CONVERT_TZ(vehicle.renewaldate,'+00:00','" + CurrentOffset + "') as Displyrenewaldate,  " +
        "user.username AS username " +
        "FROM tblvehicle AS vehicle " +
        " left join tblvehicletype  as vehicletype on vehicletype.id = vehicle.idType " +
        " left join tblgpsdevice as gpsdevice on gpsdevice.DeviceId =vehicle.deviceid " +
        " LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search +
        " order by id desc";
    console.log("@@@@@@@@@@@@", qry)
    connection.query(qry, function(err, response) {
        if (response != undefined) {
            conf.rows = [];
            var username = '';
            var Name = '';
            var deviceid = '';
            var Type = '';
            var DeviceType = '';
            var Displyrenewaldate = '';
            var DisplyHandshakDate = '';
            var IsOnline = 0;

            function GetVehiclesData(i) {
                if (i < response.length) {
                    var row = [];
                    if (response[i].username != null && response[i].username != '' && response[i].username != undefined) {
                        username = response[i].username;
                    }
                    if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                        Name = response[i].Name;
                    }
                    if (response[i].deviceid != null && response[i].deviceid != '' && response[i].deviceid != undefined) {
                        deviceid = response[i].deviceid;
                    }
                    if (response[i].DeviceType != null && response[i].DeviceType != '' && response[i].DeviceType != undefined) {
                        DeviceType = response[i].DeviceType;
                    }
                    if (response[i].Type != null && response[i].Type != '' && response[i].Type != undefined) {
                        Type = response[i].Type;
                    }
                    if (response[i].Displyrenewaldate != null && response[i].Displyrenewaldate != '' && response[i].Displyrenewaldate != undefined) {
                        Displyrenewaldate = moment(response[i].Displyrenewaldate).format('DD-MM-YYYY');
                    }
                    if (response[i].DisplyHandshakDate != null && response[i].DisplyHandshakDate != '' && response[i].DisplyHandshakDate != undefined) {
                        DisplyHandshakDate = moment(response[i].DisplyHandshakDate).format(' hh:mm:ss a');
                    }
                    IsOnline = response[i].IsOnline == true || response[i].IsOnline == 1 || response[i].IsOnline == '1' ? '1' : '0';
                    if (objParam.IsTrackingApp == 'true' || objParam.IsTrackingApp == true) {
                        row.push(username, Name, deviceid, Type, Displyrenewaldate, DisplyHandshakDate, IsOnline);
                    } else {
                        row.push(username, Name, deviceid, DeviceType, Type, Displyrenewaldate, DisplyHandshakDate, IsOnline);
                    }
                    conf.rows.push(row);
                    GetVehiclesData(i + 1);
                } else {
                    var result = nodeExcel.execute(conf);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader("Content-Disposition", "attachment; filename=Vehicles.xlsx");
                    res.end(result, 'binary');
                }
            }
            GetVehiclesData(0);

        }
    })
})

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
                            funAuditLog.CreateAuditLog('SaveVehicle', decoded.username, 'Create Vehicle (DeviceId:' + response[0].deviceid + ' , UserId : ' + response[0].iduser + ')');
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
                            funAuditLog.CreateAuditLog('SaveVehicle', decoded.username, 'Update Vehicle (DeviceId:' + response[0].deviceid + ' , UserId : ' + response[0].iduser + ')');
                            res.json({
                                success: true,
                                message: "Vehicle Detail updated successfully...",
                                data: response
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "Vehicle Detail not updated successfully...",
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
                                funAuditLog.CreateAuditLog('Delete Vehicle', UserExist.username, 'Delete Vehicle (DeviceId:' + response.deviceid + ' , UserId : ' + response.iduser + ')');
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
    if (req.query.iduser != null || req.query.iduser != undefined) {

        var search = "";
        if (search != "") {
            search += " and tv.iduser = " + req.query.iduser;
        } else {
            search = " Where tv.iduser = " + req.query.iduser;
        }

        if (search != "") {
            search += " and tv.IsDelete = 0 and tv.deviceid != '' ";
        } else {
            search = " Where tv.IsDelete = 0 and tv.deviceid != '' ";
        }

        if (req.query.idSalesAgent != null && req.query.idSalesAgent != '' && req.query.idSalesAgent != undefined) {
            if (search != "") {
                search += " and tv.idSalesAgent =" + req.query.idSalesAgent;
            } else {
                search = " Where tv.idSalesAgent =" + req.query.idSalesAgent;
            }
        }
        var query = "SELECT tv.*, CONVERT_TZ(tgd.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate FROM tblvehicle as tv LEFT JOIN tblgpsdevice as tgd ON tgd.DeviceId = tv.deviceid " + search;
        connection.query(query, function(err, response) {
            if (response != undefined) {
                res.json(response);
            } else {
                res.json(err);
            }
        });
        // Vehicle.findAll({
        //     where: [search, {
        //         IsDelete: 0,
        //         deviceid: {
        //             $ne: '',
        //         },
        //         iduser: req.query.iduser,
        //     }],
        //     order: 'CreatedDate'
        // }).then(function(response) {
        //     res.json(response);
        // }).catch(function(error) {
        //     res.json(error);
        // })
    } else {
        res.json(RecordNotFound);
    }

})

router.get('/GetAllVehicleById', function(req, res) {
    if (req.query.id != null || req.query.id != undefined) {
        var search = {};

        search['$and'] = [];

        var obj = new Object();
        obj['id'] = {
            $eq: req.query.id
        };
        search['$and'].push(obj);

        var obj = new Object();
        obj['IsDelete'] = {
            $eq: false
        };
        search['$and'].push(obj);
        Vehicle.findOne({
            where: search,
        }).then(function(response) {
            res.json(response);
        }).catch(function(error) {
            res.json(error);
        })
    } else {
        res.json(RecordNotFound);
    }

})

router.get('/GetDrivingDataByDeviceId', function(req, res) {
    DrivingData.findOne({
        where: { DeviceId: req.query.DeviceId },
        order: 'Datetime desc'
    }).then(function(response) {
        res.json({
            success: true,
            message: "Record found...",
            data: response
        });
    }).catch(function(error) {
        res.json(RecordNotFound);
    })

})

router.get('/GetVehicleCurrentLocation', function(req, res) {

    var Startdate = new Date();

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    // GPSData.findOne({
    //     where: {
    //         DeviceId: req.query.DeviceId,
    //         Date: { $lte: unixStartdate }
    //     },
    //     order: 'id DESC'
    // }).then(function(response) {
    // if (response != null) {
    // res.json({ success: true, data: response });

    //----------------call redix server data--------------------------
    client.get(req.query.DeviceId, function(err, response) {

        if (!err && response != null && response != '' && response != undefined) {
            //----------------End redix server data--------------------------
            res.json({ success: true, data: JSON.parse(response) });


        } else {
            res.json(RecordNotFound);
        }
    })
});

function convertdateformatForUnix(date1) {
    var date = date1;
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

}

router.get('/GetAllOnlineVehicle', function(req, res) {
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
        search = search + 'vehicle.DeviceType like "%' + objSearch + '%" ) ';
        // search = search + 'vehicle.IsOnline like "%' + objSearch + '%") ';
    }
    search = " where vehicle.IsOnline = 1";

    if (objParam.UserId != null && objParam.UserId != '' && objParam.UserId != undefined) {
        if (search != "") {
            search += ' and vehicle.idSalesAgent = ' + objParam.UserId;
        } else {
            search += ' where vehicle.idSalesAgent = ' + objParam.UserId;
        }
    }

    if (search != "") {
        search += ' and vehicle.IsDelete = 0 ';
    } else {
        search += ' where vehicle.IsDelete = 0 ';
    }
    if (objParam.appId != null && objParam.appId != '' && objParam.appId != undefined) {
        if (search != "") {
            search += ' and user.idApp =' + objParam.appId;
        } else {
            search += ' Where user.idApp =' + objParam.appId;
        }
    }



    var qry = "Select vehicle.*,CONVERT_TZ(vehicle.HandshakDatetime,'+00:00','" + CurrentOffset + "') as DisplyHandshakDate,  " +
        "user.username AS username " +
        "FROM tblvehicle AS vehicle " +
        "LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    // console.log(qry)
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

router.get('/getAllDefaultValue', function(req, res) {

    DefaultValue.findAll().then(function(response) {
        res.json(response);
    });
})

router.get('/UpdateDefultValue', function(req, res) {
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
                DefaultValue.findOne({ where: { Type: req.query.Type } }).then(function(objexist) {
                    objexist.updateAttributes({
                        Value: req.query.Value
                    }).then(function(response) {
                        funAuditLog.CreateAuditLog('Update Default value', UserExist.username, 'Update Default value of ' + req.query.Type);
                        res.json({ success: true, message: ' updated successfully', data: response });
                    });
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }

})

router.get('/GetAllNotAssignDevice', function(req, res) {
    var query = "select id, DeviceId from tblgpsdevice  where DeviceId not in (select deviceid from tblvehicle)";
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})


router.get('/TransferDevicetoUser', function(req, res) {
    // var query = "Update tblvehicle set deviceid = '" + req.query.deviceid + "' where iduser = '" + req.query.iduser + "' and deviceid = '" + req.query.olddeviceid + "'";
    // var query = "Update tblvehicle set deviceid = '" + req.query.deviceid + "', MaxSpeed='0.0' where id = '" + req.query.id + "'";
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
                var query = "update tblvehicle left join tblfence on tblvehicle.deviceid = tblfence.deviceId set  tblvehicle.deviceid='" + req.query.deviceid + "' ,tblfence.deviceId  = '" + req.query.deviceid + "' ,tblvehicle.MaxSpeed = 0 where tblvehicle.id= '" + req.query.id + "'"
                connection.query(query, function(err, rows, fields) {
                    if (!err) {
                        funAuditLog.CreateAuditLog('Transfer Device', UserExist.username, 'Transfer Device (' + req.query.olddeviceid + ') to (' + req.query.deviceid + ')');
                        res.json({ success: true, message: "Device Transfer successfully..", data: rows });
                    } else {
                        res.json({ success: false, data: [] });
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken)
    }
})


router.get('/GetAllNotUseDevcie', function(req, res) {
    var objParam = req.query;


    var search = "";
    var date = new Date;
    date.setDate(date.getDate() - 10);

    date = new Date(date).getTime() / 1000;
    date = date.toString().split('.');

    if (req.query.UserId != null && req.query.UserId != '' && req.query.UserId != undefined) {
        search = " and (tb.iduser=" + req.query.UserId + " OR tsd.idUser=" + req.query.UserId + ")";
    }

    var qry = "SELECT  taf.AppName,tb.Name,tb.deviceid,tvt.Type as vehicleType,tb.DeviceType as Type,tpg.Datetime, tpg.Date,tpg.IsEngine,tu.email,tu.username,tu.phone,tpg.Latitude,tpg.Longitude" +
        " FROM tblvehicle tb" +
        " left join tbluserinformation tu on tu.id = tb.iduser" +
        " left join tblvehicletype tvt on tvt.id = tb.idType " +
        " left join tblappinfo taf on taf.id = tu.idApp " +
        " Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId" +
        " INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM (SELECT DeviceId, Date FROM tblgpsdata where IsEngine=1 ORDER BY Date DESC) d GROUP BY DeviceId)  b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate" +
        " where IsDelete=false  group by tb.deviceid";
    var lstObject = [];

    connection.query(qry, function(err, response) {

        var listdata = [];
        if (!err && response) {
            if (response.length > 0) {
                for (i = 0; i < response.length; i++) {
                    if (response[i].Date < date[0]) {
                        listdata.push(response[i]);
                    }
                }
            }
        }
        res.json(listdata)

    })
})


function convertdateformatForUnix(date1) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    return ("00" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

}


router.get('/GetAllVehicleDeviceId', function(req, res) {
    var search = req.query.search;
    var searchdevice = {};


    searchdevice['$and'] = [];
    var obj = new Object();
    obj['IsDelete'] = {
        $eq: 0
    }
    searchdevice['$and'].push(obj);

    if (search != null && search != '' & search != undefined) {
        // searchdevice['$and'] = [];
        var obj = new Object();
        obj['deviceid'] = {
            $like: '%' + search + '%'
        };
        searchdevice['$and'].push(obj);
    }
    Vehicle.findAll({ where: searchdevice }).then(function(response) {
        res.json(response)
    })

})

function ConvertDateFormat(today, flg) {
    var year = today.getUTCFullYear();
    var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getUTCDate();
    var firstdayHours = today.getUTCHours();
    var firstdayMinutes = today.getUTCMinutes();
    var firstdaySeconds = today.getUTCSeconds();

    //return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    if (flg) {
        return ("00" + year.toString()).slice(-4) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("0000" + day.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
    } else { return ("0000" + year.toString()).slice(-4) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2); }
}




function convertdateformat1(date1, flg) {
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
module.exports = router