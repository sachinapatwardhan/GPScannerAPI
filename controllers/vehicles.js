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

    var qry = "Select vehicle.*,vehicletype.Type,gpsdevice.IMEI,CONVERT_TZ(vehicle.HandshakDatetime,'+00:00','" + CurrentOffset + "') as DisplyHandshakDate,  " +
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

    GPSData.findOne({
        where: {
            DeviceId: req.query.DeviceId,
            Date: { $lte: unixStartdate }
        },
        order: 'id DESC'
    }).then(function(response) {
        if (response != null) {
            res.json({ success: true, data: response });
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
    }
})

// router.get('/GetAllNotUseDevcie', function(req, res) {
//     var objParam = req.query;
//     var objColumns = objParam.columns;
//     var objOrderBy = objParam.order;
//     var objSearch = objParam.search;

//     var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

//     var search = "";
//     var date = new Date;
//     date.setDate(date.getDate() - 30);

//     // convertDate = convertdateformatForUnix(date);
//     date = new Date(date).getTime() / 1000;
//     date = date.toString().split('.');
//     if (objSearch != '' && objSearch != null && objSearch != undefined) {
//         search = ' and (tb.Name like "%' + objSearch + '%" or ';
//         search = search + 'tb.deviceid like "%' + objSearch + '%" or ';
//         search = search + 'tvt.Type like "%' + objSearch + '%" or ';
//         search = search + 'td.Type like "%' + objSearch + '%" )  ';
//     }
//     if (req.query.UserId != null && req.query.UserId != '' && req.query.UserId != undefined) {
//         search = " and (tb.iduser=" + req.query.UserId + " OR tsd.idUser=" + req.query.UserId + ")";
//     }

//     var qry = "SELECT  tb.Name,tb.deviceid,tvt.Type as vehicleType,td.Type,tpg.Datetime, tpg.Date,tu.email,tu.username,tu.phone" +
//         " FROM tblvehicle tb" +
//         " left join tbluserinformation tu on tu.id = tb.iduser" +
//         " left join tblvehicletype tvt on tvt.id = tb.idType " +
//         " left join tblsharedevice tsd ON tsd.idVehicle = tb.id" +
//         " left join tblgpsdevice td On td.DeviceId = tb.deviceid" +
//         " Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId" +
//         " INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM (SELECT DeviceId, Date FROM tblgpsdata ORDER BY Date DESC) d GROUP BY DeviceId)  b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate" +
//         " where IsDelete=false and tpg.Date<=" + date[0] + search +
//         " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
//     var Countqry = "SELECT  count(tb.id) as TotalRecord" +
//         " FROM tblvehicle tb" +
//         " left join tbluserinformation tu on tu.id = tb.iduser" +
//         " left join tblvehicletype tvt on tvt.id = tb.idType " +
//         " left join tblsharedevice tsd ON tsd.idVehicle = tb.id" +
//         " left join tblgpsdevice td On td.DeviceId = tb.deviceid" +
//         " Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId" +
//         " INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM (SELECT DeviceId, Date FROM tblgpsdata ORDER BY Date DESC) d GROUP BY DeviceId)  b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate" +
//         " where  IsDelete=false and tpg.Date<=" + date[0] + search;


//     connection.query(qry, function(err, response) {
//         if (response != undefined) {
//             connection.query(Countqry, function(err, lstCount, fields) {
//                 var response1 = new Object();
//                 response1.draw = objParam.draw;
//                 response1.recordsTotal = lstCount[0].TotalRecord;
//                 response1.recordsFiltered = lstCount[0].TotalRecord;
//                 response1.data = response;
//                 res.json(response1);
//             });
//         } else {
//             var response1 = new Object();
//             response1.draw = objParam.draw;
//             response1.recordsTotal = 0;
//             response1.recordsFiltered = 0;
//             response1.data = [];
//             res.json(response1);
//         }
//     })
// })


router.get('/GetAllNotUseDevcie', function(req, res) {
    var objParam = req.query;


    var search = "";
    var date = new Date;
    date.setDate(date.getDate() - 30);

    // convertDate = convertdateformatForUnix(date);
    date = new Date(date).getTime() / 1000;
    date = date.toString().split('.');

    if (req.query.UserId != null && req.query.UserId != '' && req.query.UserId != undefined) {
        search = " and (tb.iduser=" + req.query.UserId + " OR tsd.idUser=" + req.query.UserId + ")";
    }

    var qry = "SELECT  tb.Name,tb.deviceid,tvt.Type as vehicleType,td.Type,tpg.Datetime, tpg.Date,tpg.IsEngine,tu.email,tu.username,tu.phone,tpg.Latitude,tpg.Longitude" +
        " FROM tblvehicle tb" +
        " left join tbluserinformation tu on tu.id = tb.iduser" +
        " left join tblvehicletype tvt on tvt.id = tb.idType " +
        " left join tblsharedevice tsd ON tsd.idVehicle = tb.id" +
        " left join tblgpsdevice td On td.DeviceId = tb.deviceid" +
        " Inner JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId" +
        // " INNER JOIN (SELECT DeviceId, MAX(Date) as maxDate FROM (SELECT DeviceId, Date FROM tblgpsdata ORDER BY Date DESC) d GROUP BY DeviceId)  b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.maxDate" +
        " where IsDelete=false " + search;

    var lstObject = [];
    connection.query(qry, function(err, response) {
        var GroupByDevice = u.groupBy(response, function(o) {
            return o.deviceid;
        });
        var lstGroup = u.map(GroupByDevice, function(group, deviceid) {
            var groups = u.sortBy(group, function(num) { return num.Date }).reverse();
            // return groups;


            console.log(groups[0].deviceid, "@@@@@@@@@...", groups[0].Date, "--------<-----", date[0], ".==", groups[0].Date < date[0]);
            if (parseInt(groups[0].Date) < parseInt(date[0])) {
                console.log("@@@@@@@@@");
                return {
                    Name: groups[0].Name,
                    deviceid: groups[0].deviceid,
                    Date: groups[0].Date,
                    vehicleType: groups[0].vehicleType,
                    Type: groups[0].Type,
                    Datetime: groups[0].Datetime,
                    email: groups[0].Date,
                    username: groups[0].username,
                    phone: groups[0].phone
                }
            } else {

                var flg = true;
                var i = 1;
                console.log("else..............", groups[i].Date, ".....<", date[0], "----", parseInt(groups[i].Date) > parseInt(date[0]));
                var record = 0;

                function uploader(i) {
                    console.log(parseInt(groups[i].Date), " > ", parseInt(date[0]), "==", parseInt(groups[i].Date) > parseInt(date[0]))
                    if (flg == true) {
                        console.log(groups[i].Date, "------------", date[0])
                        console.log(groups[i].IsEngine == 0)
                        console.log(groups[i - 1].Latitude, "==", groups[i].Latitude, "==", groups[i - 1].Latitude == groups[i].Latitude)
                        console.log(groups[i - 1].Longitude, "==", groups[i].Longitude, "==", groups[i - 1].Longitude == groups[i].Longitude)
                        if (groups[i].IsEngine == 0) {
                            console.log("i.....", i);

                            uploader(i + 1);
                        } else {
                            record = i;
                            console.log("else....")
                            flg = false;
                        }

                    }
                }
                uploader(i);
                if (parseInt(groups[record].Date) < parseInt(date[0])) {
                    return {
                        Name: groups[record].Name,
                        deviceid: groups[record].deviceid,
                        Date: groups[record].Date,
                        vehicleType: groups[record].vehicleType,
                        Type: groups[record].Type,
                        Datetime: groups[record].Datetime,
                        email: groups[record].Date,
                        username: groups[record].username,
                        phone: groups[record].phone
                    }
                }
            }



        })

        var response1 = [];
        for (var i = 0; i < lstGroup.length; i++) {
            if (lstGroup[i] != null) {
                response1.push(lstGroup[i]);
            }
        }

        res.json(response1)
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


module.exports = router