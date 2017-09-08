var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var GPSData = models.tblgpsdata;
// var Alarm = models.tblalarm;
var Fence = models.tblfence;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var GpsDevice = models.tblgpsdevice;
var Buffer = require('buffer').Buffer;
var momentz = require('moment-timezone');
//End of Tables

app.use(express.static(__dirname + '/../MediaUploads/PetUpload'));


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function GetCurrentDate() {
    var today = new Date();

    var sec = today.getUTCSeconds();
    var min = today.getUTCMinutes();
    var hour = today.getUTCHours();

    var year = today.getUTCFullYear();
    var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getUTCDate();

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

router.get('/getAllBikeByUser', function(req, res) {
    Vehicle.findAll({
        where: {
            iduser: req.query.idUser,
            IsDelete: false,
            deviceid: {
                $ne: ''
            }
        },
        order: 'CreatedDate'
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })

})

router.get('/GetVehicleById', function(req, res) {
    Vehicle.findOne({
        where: {
            id: req.query.idVehicle
        }
    }).then(function(response) {
        if (response != null) {
            res.json({
                success: true,
                message: "Record found...",
                data: response
            });
        } else {
            res.json(RecordNotFound);
        }
    })
})

router.get('/GetVehicleDetailById', function(req, res) {
    var query = "SELECT tv.*, tgd.ExpiryDate, tgd.IsActive From tblvehicle as tv LEFT JOIN tblgpsdevice as tgd ON tgd.DeviceId = tv.deviceid WHERE tv.id = " + req.query.idVehicle + " LIMIT 1"
        // console.log(query);
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

router.post('/GetAllWorkingBike', jsonParser, function(req, res) {
    connection.query("SELECT  tb.id,tb.deviceid,tb.Name,tb.IsOnline, tb.DeviceType, tb.IsACC,tpg.IsEngine, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction FROM tblvehicle tb INNER JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.Date LEFT JOIN tblsharedevice tsd on tb.id=tsd.idVehicle WHERE (tb.iduser=" + req.query.idUser + " or tsd.idUser=" + req.query.idUser + ") and IsDelete=false;", function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

router.get('/GetAllWorkingBikeWebApp', jsonParser, function(req, res) {

    connection.query("SELECT  tb.*,tpg.IsEngine, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed, tpg.Direction,tsd.id as ShareId FROM tblvehicle tb LEFT JOIN tblgpsdata tpg INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date  ON tb.deviceid=tpg.DeviceId LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle WHERE (tb.iduser=" + req.query.idUser + " or tsd.iduser=" + req.query.idUser + ") and IsDelete=false and tb.deviceid != '' group by tb.deviceid;", function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

router.get('/DeleteBike', function(req, res) {
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
                if (req.query.DeviceId != '' && req.query.DeviceId != null) {
                    Vehicle.findOne({
                        where: {
                            deviceid: req.query.DeviceId,
                            IsDelete: false
                        }
                    }).then(function(response) {
                        if (response) {
                            response.updateAttributes({ IsDelete: true }).then(function(resUpdate) {
                                // GPSData.destroy({ where: { DeviceId: req.query.DeviceId } }).then(function(responseGPS) {
                                //     Alarm.destroy({ where: { DeviceId: req.query.DeviceId } }).then(function(responseAlarm) {
                                funAuditLog.CreateAuditLog('DeleteBike', UserExist.username, 'Delete Vehicle');
                                res.json({
                                    success: true,
                                    message: "Vehicle deleted successfully",
                                    data: response
                                });
                                //     });
                                // });
                            });
                        } else {
                            res.json(RecordNotFound);
                        }

                    })
                } else {
                    if (req.query.BikeId != '' && req.query.BikeId != null) {
                        Vehicle.destroy({ where: { id: req.query.BikeId } }).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('DeleteBike', UserExist.username, 'Delete Vehicle');
                                res.json({
                                    success: true,
                                    message: "Vehicle deleted successfully",
                                    data: response
                                });
                            } else {
                                res.json(RecordNotFound);
                            }
                        })
                    } else {
                        res.json(RecordNotFound);
                    }
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/GetVehicleCurrentLocation', function(req, res) {
    var Startdate = new Date();

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    // var unixStartdate = Startdate.getTime() / 1000;

    GPSData.findOne({
        where: {
            DeviceId: req.query.DeviceId,
            Date: { $lte: unixStartdate }
        },
        order: 'Date DESC'
    }).then(function(response) {
        if (response != null) {
            res.json({ success: true, data: response });
        } else {
            res.json(RecordNotFound);
        }
    })
});

router.get('/GetVehicleCurrentLocationForSharedDevice', function(req, res) {
    var Startdate = new Date();

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    // var unixStartdate = Startdate.getTime() / 1000;
    var query = "Select tv.Name, tv.IsOnline, tv.iduser, tv.IsShared, tgps.* FROM tblgpsdata as tgps LEFT JOIN tblvehicle as tv ON tgps.DeviceId = tv.deviceid where tgps.DeviceId = " + jwt.decode(req.query.DeviceId, "bugz") + " AND tgps.Date <= '" + unixStartdate + "' ORDER BY Date DESC limit 1";
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.json({ success: false, data: [] });
        }
    })
});

router.get('/GetAllGPSDate', function(req, res) {
    var AppTimeZone = req.query.TimeZone;
    if (AppTimeZone != null && AppTimeZone != undefined && AppTimeZone != '') {
        var todaydata = new Date();
        var todaydata4 = new Date();
        // todaydata = new Date(todaydata.setMonth(todaydata.getMonth() - 4));

        // var convertDate = convertdateformat(todaydata);
        var unixNewDate = todaydata.getTime() / 1000;

        todaydata4 = new Date(todaydata4.setMonth(todaydata4.getMonth() - 4));

        // var convertDate = convertdateformat(todaydata4);
        var unixTodaydata = todaydata4.getTime() / 1000;

        GPSData.findAll({
            attributes: ['Date'],
            where: {
                DeviceId: req.query.DeviceId,
                Date: { $lte: unixNewDate, $gte: unixTodaydata }
                //Datetime: { $lte: new Date(), $gte: todaydata }

            },
            order: 'Date DESC'
        }).then(function(response) {

            var groups = u.groupBy(response, function(o) {

                return momentz.utc(o.Date * 1000).tz(AppTimeZone).format('DD-MM-YYYY')
            });

            var lstGroupDate = u.map(groups, function(group, date) {
                return {
                    Datetime: date,
                    Date: group[0].Date
                }
            });

            res.json(lstGroupDate);

        })
    } else {
        var todaydata = new Date();

        // var convertDate = convertdateformat(todaydata);
        var unixNewDate = todaydata.getTime() / 1000;

        todaydata = new Date(todaydata.setMonth(todaydata.getMonth() - 4));

        // var convertDate = convertdateformat(todaydata);
        var unixTodaydata = todaydata.getTime() / 1000;


        GPSData.findAll({
            attributes: ['Datetime', 'Date'],
            where: {
                DeviceId: req.query.DeviceId,
                Date: { $lte: unixNewDate, $gte: unixTodaydata }
            },
            group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
            order: 'Date DESC'
        }).then(function(response) {
            res.json(response);
        })
    }
});

router.get('/GetAllGPSDateByDate', function(req, res) {
    var AppTimeZone = req.query.TimeZone;
    if (AppTimeZone != null && AppTimeZone != undefined && AppTimeZone != '') {
        var Startdate = req.query.StartDateTime;
        var StartUnixTime = null;
        var todaydata = new Date();
        var unixNewDate = todaydata.getTime() / 1000;

        if (Startdate == null || Startdate == '') {
            var todaydata4 = new Date();
            todaydata4 = new Date(todaydata4.setMonth(todaydata4.getMonth() - 4));
            StartUnixTime = todaydata4.getTime() / 1000;
        } else {
            var convertDate = convertdateformatForUnix(Startdate);
            StartUnixTime = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
        }
        GPSData.findAll({
            attributes: ['Date'],
            where: {
                DeviceId: req.query.DeviceId,
                // Datetime: { $lte: new Date(), $gt: Startdate }
                Date: { $lte: unixNewDate, $gt: StartUnixTime }
            },
            // group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
            order: 'Date DESC'
        }).then(function(response) {

            var groups = u.groupBy(response, function(o) {

                return momentz.utc(o.Date * 1000).tz(AppTimeZone).format('DD-MM-YYYY')
            });

            var lstGroupDate = u.map(groups, function(group, date) {
                return {
                    Datetime: date,
                    Date: group[0].Date
                }
            });
            res.json(lstGroupDate);

        })
    } else {
        var Startdate = req.query.StartDateTime;
        if (Startdate == null || Startdate == '') {
            Startdate = new Date();
            Startdate = new Date(Startdate.setMonth(Startdate.getMonth() - 4));
            var convertDate = convertdateformat(Startdate);
            var unixStartdata = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
        }


        var todaydata = new Date();
        var convertDate = convertdateformat(todaydata);
        var unixNewDate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

        GPSData.findAll({
            attributes: ['Datetime', 'Date'],
            where: {
                DeviceId: req.query.DeviceId,
                Datetime: { $lte: unixNewDate, $gt: unixStartdata }
            },
            group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
            order: 'Date DESC'
        }).then(function(response) {
            res.json(response);
        })
    }
});

router.get('/GetAllGPSByTimeZoneDate', function(req, res) {

    var Startdate = req.query.TodayStartDateTime;
    var Enddate = req.query.TodayEndDateTime;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;


    var query = "select Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction, DeviceId,IsEngine, Date from tblgpsdata where deviceid=" + req.query.DeviceId + " and GPSPositioning='A' and Date >= '" + unixStartdate + "' and Date <= '" + unixEnddate + "' order by Date;"
    connection.query(query, function(err, lstGPSData, fields) {
        res.json(lstGPSData);
    });
});

router.get('/GetAllGPSByTimeZoneDateWithV', function(req, res) {
    // console.log(req.query)
    var Startdate = req.query.TodayStartDateTime;
    var Enddate = req.query.TodayEndDateTime;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var query = "select Id,Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction, DeviceId,IsEngine, Date from tblgpsdata where deviceid=" + req.query.DeviceId + " and Date >= '" + unixStartdate + "' and Date <= '" + unixEnddate + "' order by Date;"
    connection.query(query, function(err, lstGPSData, fields) {
        res.json(lstGPSData);
    });
});

function ConvertDateFormat(today) {
    var year = today.getUTCFullYear();
    var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getUTCDate();

    //return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    return ("0000" + year.toString()).slice(-4) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2);
}

router.get('/ChangeFenceByBike', function(req, res) {
    var idFence = req.query.idFence;
    var deviceId = req.query.deviceId
    var IsFenceOnline = req.query.IsFenceOnline;

    Fence.findOne({
        where: {
            id: idFence
        }
    }).then(function(response) {
        if (response) {

            response.updateAttributes({ IsFenceOnline: IsFenceOnline }).then(function(resUpdate) {
                var desc = "Fence Status = " + IsFenceOnline;

                res.json({
                    success: true,
                    message: "Fence Setting saved successfully.",
                    data: IsFenceOnline
                });

            });
        } else {
            res.json({ success: false, message: 'Fence Setting not saved successfully. Try after 5 minute.' });
        }

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

// router.post('/SaveVehicle', jsonParser, function(req, res) {
//     objVehicle = req.body;
router.get('/SaveVehicle', jsonParser, function(req, res) {
    objVehicle = req.query;
    objVehicle.IsDelete = false;
    console.log(objVehicle);
    objHeader = req.headers;
    var token = getToken(objHeader);
    var search = {};
    search['$and'] = [];
    if (objVehicle.AppName != null && objVehicle.AppName != undefined && objVehicle.AppName != '') {
        var obj = new Object();
        obj['AppName'] = {
            $eq: objVehicle.AppName
        };
        search['$and'].push(obj);
    }

    if (objVehicle.IMEI != null && objVehicle.IMEI != undefined && objVehicle.IMEI != '') {
        var obj = new Object();
        obj['IMEI'] = {
            $eq: objVehicle.IMEI
        };
        search['$and'].push(obj);
    }

    if (token) {
        var decoded = jwt.decode(token, TokenKey);

        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (objVehicle.IMEI != '' && objVehicle.IMEI != null) {
                    GpsDevice.findOne({
                        where: search
                    }).then(function(objGpsDevice) {
                        if (objGpsDevice != null) {
                            if (objVehicle.id == 0) {
                                objVehicle.IsOnline = false;
                                objVehicle.CreatedDate = GetCurrentDate();
                                objVehicle.DeviceType = objGpsDevice.Type;
                                Vehicle.findOne({
                                    where: {
                                        deviceid: objVehicle.deviceid,
                                        IsDelete: true
                                    }
                                }).then(function(objVehicleExist) {
                                    if (objVehicleExist) {
                                        objVehicle.id = objVehicleExist.id;
                                        Vehicle.update(objVehicle, {
                                            where: {
                                                id: objVehicle.id
                                            }
                                        }).then(function(response) {
                                            if (response[0]) {
                                                funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
                                                res.json({
                                                    success: true,
                                                    message: "Vehicle created successfully...",
                                                    data: objVehicle
                                                });
                                            }
                                        })
                                    } else {
                                        Vehicle.findOne({
                                            where: {
                                                deviceid: objVehicle.deviceid,
                                                IsDelete: false
                                            }
                                        }).then(function(objNewPetExist) {
                                            if (objNewPetExist) {
                                                res.json({
                                                    success: false,
                                                    message: "Tracker No. is already assign to other Vehicle...",
                                                    data: null
                                                });
                                            } else {
                                                Vehicle.create(objVehicle).then(function(response) {
                                                    if (response) {
                                                        funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
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
                                Vehicle.findOne({
                                    where: {
                                        deviceid: objVehicle.deviceid
                                    }
                                }).then(function(objVehicleExist) {
                                    if (objVehicleExist != null && objVehicleExist.id != objVehicle.id && objVehicleExist.IsDeleted == false) {
                                        res.json({
                                            success: false,
                                            message: "Tracker No. is already assign to other Vehicle...",
                                            data: objVehicleExist
                                        });
                                    } else {
                                        Vehicle.update(objVehicle, {
                                            where: {
                                                id: objVehicle.id
                                            }
                                        }).then(function(response) {
                                            if (response[0]) {
                                                funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Update Vehicle');
                                                res.json({
                                                    success: true,
                                                    message: "Vehicle updated successfully...",
                                                    data: objVehicle
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
                    if (objVehicle.id == 0) {
                        objVehicle.IsOnline = false;
                        objVehicle.HandshakDatetime = null;
                        objVehicle.CreatedDate = GetCurrentDate();
                        Vehicle.create(objVehicle).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
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
                    } else {
                        Vehicle.findOne({
                            where: {
                                id: objVehicle.id
                            }
                        }).then(function(objVehicleExist) {
                            if (objVehicleExist != null && objVehicleExist.id != objVehicle.id && objVehicleExist.IsDelete == false) {
                                res.json({
                                    success: false,
                                    message: "Tracker No. is already assign to other Vehicle...",
                                    data: objVehicleExist
                                });
                            } else {
                                Vehicle.update(objVehicle, {
                                    where: {
                                        id: objVehicle.id
                                    }
                                }).then(function(response) {
                                    if (response[0]) {
                                        funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Update Vehicle');
                                        res.json({
                                            success: true,
                                            message: "Vehicle updated successfully...",
                                            data: objVehicle
                                        });
                                    }
                                })
                            }
                        })
                    }
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});


// router.get('/SaveVehicle', jsonParser, function(req, res) {
//     objVehicle = req.query;
//     objHeader = req.headers;
//     var token = getToken(objHeader);
//     if (token) {
//         var decoded = jwt.decode(token, TokenKey);
//         User.findOne({
//             where: {
//                 username: decoded.username,
//                 password: decoded.password
//             }
//         }).then(function(UserExist) {
//             if (UserExist != null) {
//                 if (objVehicle.deviceid != '' && objVehicle.deviceid != null) {
//                     GpsDevice.findOne({
//                         where: {
//                             DeviceId: objVehicle.deviceid,
//                         }
//                     }).then(function(objGpsDevice) {
//                         if (objGpsDevice != null) {
//                             if (objVehicle.id == 0) {
//                                 objVehicle.IsOnline = false;
//                                 objVehicle.CreatedDate = GetCurrentDate();
//                                 objVehicle.DeviceType = objGpsDevice.Type;
//                                 Vehicle.findOne({
//                                     where: {
//                                         deviceid: objVehicle.deviceid,
//                                         // IsDelete: true
//                                     }
//                                 }).then(function(objPetExist) {
//                                     if (objPetExist && objPetExist.IsDelete) {
//                                         objPet.id = objPetExist.id;
//                                         Vehicle.update(objPet, {
//                                             where: {
//                                                 id: objVehicle.id
//                                             }
//                                         }).then(function(response) {
//                                             if (response[0]) {
//                                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
//                                                 res.json({
//                                                     success: true,
//                                                     message: "Vehicle created successfully...",
//                                                     data: objVehicle
//                                                 });
//                                             }
//                                         })
//                                     } else if (objPetExist && !objPetExist.IsDelete) {
//                                         res.json({
//                                             success: false,
//                                             message: "Tracker No. is already assign to other Vehicle...",
//                                             data: null
//                                         });
//                                     } else {
//                                         Vehicle.create(objPet).then(function(response) {
//                                             if (response) {
//                                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
//                                                 res.json({
//                                                     success: true,
//                                                     message: "Vehicle created successfully...",
//                                                     data: response
//                                                 });
//                                             } else {
//                                                 res.json({
//                                                     success: false,
//                                                     message: "Tracker No. is already assign to other Vehicle...",
//                                                     data: null
//                                                 });
//                                             }
//                                         })
//                                     }
//                                 })
//                             } else {
//                                 Vehicle.findOne({
//                                     where: {
//                                         deviceid: objVehicle.deviceid
//                                     }
//                                 }).then(function(objVehicleExist) {
//                                     if (objVehicleExist != null && objVehicleExist.id != objVehicle.id && objVehicleExist.IsDeleted == false) {
//                                         res.json({
//                                             success: false,
//                                             message: "Tracker No. is already assign to other Vehicle...",
//                                             data: objVehicleExist
//                                         });
//                                     } else {
//                                         Vehicle.update(objVehicle, {
//                                             where: {
//                                                 id: objVehicle.id
//                                             }
//                                         }).then(function(response) {
//                                             if (response[0]) {
//                                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Update Vehicle');
//                                                 res.json({
//                                                     success: true,
//                                                     message: "Vehicle updated successfully...",
//                                                     data: objVehicle
//                                                 });
//                                             }
//                                         })
//                                     }
//                                 })
//                             }
//                         } else {
//                             res.json({
//                                 success: false,
//                                 message: "Invalid Tracker No., Please insert valid Tracker No.",
//                                 data: ""
//                             });
//                         }
//                     })
//                 } else {
//                     if (objVehicle.id == 0) {
//                         objVehicle.IsOnline = false;
//                         objVehicle.HandshakDatetime = null;
//                         objVehicle.CreatedDate = GetCurrentDate();
//                         Vehicle.create(objVehicle).then(function(response) {
//                             if (response) {
//                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
//                                 res.json({
//                                     success: true,
//                                     message: "Vehicle created successfully...",
//                                     data: response
//                                 });
//                             } else {
//                                 res.json({
//                                     success: false,
//                                     message: "Tracker No. is already assign to other pet...",
//                                     data: null
//                                 });
//                             }
//                         })
//                     } else {
//                         Vehicle.findOne({
//                             where: {
//                                 id: objVehicle.id
//                             }
//                         }).then(function(objVehicleExist) {
//                             if (objVehicleExist != null && objVehicleExist.id != objVehicle.id && objVehicleExist.IsDelete == false) {
//                                 res.json({
//                                     success: false,
//                                     message: "Tracker No. is already assign to other Vehicle...",
//                                     data: objVehicleExist
//                                 });
//                             } else {
//                                 Vehicle.update(objVehicle, {
//                                     where: {
//                                         id: objVehicle.id
//                                     }
//                                 }).then(function(response) {
//                                     if (response[0]) {
//                                         funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Update Vehicle');
//                                         res.json({
//                                             success: true,
//                                             message: "Vehicle updated successfully...",
//                                             data: objVehicle
//                                         });
//                                     }
//                                 })
//                             }
//                         })
//                     }
//                 }
//             } else {
//                 res.json(InvalidToken);
//             }
//         })
//     } else {
//         res.json(InvalidToken);
//     }
// });


router.get('/UpdateVehicleName', jsonParser, function(req, res) {

    connection.query("Update tblvehicle set Name='" + req.query.Name + "' where deviceid=" + req.query.DeviceId, function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, message: 'Vehicle No. Save Successfully.' });
        } else {
            // console.log(err);
            res.json({ success: false, message: 'Vehicle No. could not save. Try again later.' });
        }
    })

})

router.get('/UpdateVehicleShare', jsonParser, function(req, res) {
    connection.query("Update tblvehicle set IsShared=" + req.query.IsShared + " where deviceid='" + req.query.DeviceId + "'", function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, message: 'Vehicle No. Save Successfully.' });

            var objConnection = {
                DeviceId: req.query.DeviceId,
                // PetId: objVehicle.id,
                Status: req.query.IsShared
            }
            io.sockets.emit('ShareStatus', JSON.stringify(objConnection));
            io.sockets.emit(req.query.DeviceId + 'ShareStatus', JSON.stringify(objConnection));
        } else {
            // console.log(err);
            res.json({ success: false, message: 'Vehicle No. could not save. Try again later.' });
        }
    })

})


module.exports = router