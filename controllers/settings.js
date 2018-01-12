//Tables
var router = express.Router();
var User = models.tbluserinformation;
var MediaSize = models.tblmediasetting;
var TaxSetting = models.tblsetting;
var RewardPointSetting = models.tblrewardpointssetting;
var Handshake = models.tblhandshake;
var PetGps = models.tblgpsscanner;
var Alarm = models.tblalarm;
var Vehicle = models.tblvehicle;
//End of Tables

//Media Size
router.get('/GetAllMediaSize', function(req, res) {
    MediaSize.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetMediaSizeById', function(req, res) {
    MediaSize.findOne({ where: { id: req.query.idMediaSize } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveMediaSize', jsonParser, function(req, res) {
    objMediaSize = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objMediaSize.id == 0) {
                    MediaSize.findOrCreate({ where: { Height: objMediaSize.Height, Width: objMediaSize.Width }, defaults: objMediaSize }).then(function(response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('SaveMediaSize', UserExist.username, 'Create Media Size');
                            res.json({ success: true, message: "Media Size created successfully...", data: response });
                        } else {
                            res.json({ success: false, message: "Media Size is already Exist...", data: response });
                        }
                    })
                } else {
                    MediaSize.findOne({ where: { Height: objMediaSize.Height, Width: objMediaSize.Width }, defaults: objMediaSize }).then(function(objMediaSizeExist) {
                        if (objMediaSizeExist != null && objMediaSize.id != objMediaSizeExist.id) {
                            res.json({ success: false, message: "Media Size is already Exist...", data: objMediaSizeExist });
                        } else {
                            MediaSize.update(objMediaSize, { where: { id: objMediaSize.id } }).then(function(response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('SaveMediaSize', UserExist.username, 'Update Media Size');
                                    res.json({ success: true, message: "Media Size updated successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Media Size not updated successfully...", data: response });
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

router.get('/DeleteMediaSize', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                MediaSize.destroy({ where: { id: req.query.idMediaSize } }).then(function(response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeleteMediaSize', UserExist.username, 'Delete Media Size');
                        res.json({ success: true, message: "Media Size deleted successfully...", data: response });
                    } else {
                        res.json({ success: false, message: "Requested Record not Exist....", data: response });
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});
//End of Media Size

//Tax Setting
router.get('/GetAllTaxSetting', function(req, res) {
    TaxSetting.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetTaxSettingByName', function(req, res) {
    TaxSetting.findOne({ where: { Name: req.query.TaxSettingName } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.get('/GetTaxSettingForSharlink', function(req, res) {
    TaxSetting.findOne({ where: { Name: req.query.TaxSettingName } }).then(function(response) {
        if (response != null) {
            Vehicle.findOne({ where: { deviceid: req.query.DeviceId } }).then(function(VehicleExist) {
                VehicleExist.updateAttributes({ ShareCode: Math.floor(100000 + Math.random() * 900000) }).then(function(shareCodeupdated) {
                    var response1 = new Object();
                    response1.Name = response.Name
                    var url = req.query.DeviceId + "," + shareCodeupdated.ShareCode;
                    response1.enDeviceId = jwt.encode(url, "bugz");
                    response1.link = response.Value + '/' + response1.enDeviceId;
                    res.json({ success: true, message: "Record found...", data: response1 });
                })
            })
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.get('/GetAllSettingByNamelist', function(req, res) {
    var lstAllSettingsName = req.query.TaxSettingName.split(',');
    var objsearch = new Object();

    objsearch["$or"] = [];
    for (var i = 0; i < lstAllSettingsName.length; i++) {
        if (lstAllSettingsName[i] != '') {
            objsearch["$or"].push({ Name: lstAllSettingsName[i].trim() })
        }
    }
    TaxSetting.findAll({ where: objsearch }).then(function(response) {
        res.json(response);
        // if (response != null) {
        //     res.json({ success: true, message: "Record found...", data: response });
        // } else {
        //     res.json({ success: false, message: "Record not found...", data: response });
        // }
    })
})

router.get('/GetSettingByName', function(req, res) {
    TaxSetting.findAll({ where: { Name: { $like: '%' + req.query.SettingName + '%' } } }).then(function(response) {
        res.json(response);
    })
})

router.post('/SaveTaxSetting', jsonParser, function(req, res) {
    lstTaxSetting = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                function uploader(i) {
                    if (i < lstTaxSetting.length) {
                        if (lstTaxSetting[i].Name != null && lstTaxSetting[i].Name != undefined) {

                            //set Parameter
                            req.query['permission'] = "Modified";

                            var obj = {};
                            obj.headers = req.headers;
                            obj.query = req.query;

                            funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                                var AccessPermission = responseAccessPermission.success;
                                if (AccessPermission) {

                                    TaxSetting.findOrCreate({ where: { Name: lstTaxSetting[i].Name }, defaults: lstTaxSetting[i] }).then(function(response) {
                                        if ((response[1])) {
                                            //insert
                                            uploader(i + 1);
                                        } else {
                                            //update
                                            TaxSetting.update(lstTaxSetting[i], { where: { Name: lstTaxSetting[i].Name } }).then(function(response) {
                                                uploader(i + 1);
                                            })
                                        }
                                    })
                                } else {
                                    res.json(NoAccessPermission);
                                }
                            });
                        } else {
                            uploader(i + 1);
                        }

                        // if (i == lstTaxSetting.length - 1) {
                        //     res.json({ success: true, message: "Tax setting save successfully..." });
                        // }
                    } else {
                        funAuditLog.CreateAuditLog('SaveTaxSetting', UserExist.username, 'Create Tax Setting');
                        res.json({ success: true, message: "Setting save successfully..." });
                    }
                }
                uploader(0);
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.post('/UpdateTaxSettingByName', jsonParser, function(req, res) {
    objSetting = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //set Parameter
    req.query['permission'] = "Modified";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
                    if (UserExist != null) {

                        TaxSetting.findOne({
                            where: {
                                Name: objSetting.Name
                            }
                        }).then(function(response) {
                            if (response) {
                                response.updateAttributes({ Value: objSetting.Value }).then(function(resUpdate) {
                                    funAuditLog.CreateAuditLog('UpdateTaxSettingByName', UserExist.username, 'Update Tax Setting By Name');
                                    res.json({
                                        success: true,
                                        message: "Settings Updated Successfully..."
                                    });

                                });
                            } else {
                                res.json(RecordNotFound);
                            }


                        })

                    } else {
                        res.json(InvalidToken);
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        } else {
            res.json(NoAccessPermission);
        }
    });
})

router.get('/DeleteTaxSetting', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                TaxSetting.destroy({ where: { id: req.query.idTaxSetting } }).then(function(response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeleteTaxSetting', UserExist.username, 'Delete Tax Setting');
                        res.json({ success: true, message: "Tax Setting deleted successfully...", data: response });
                    } else {
                        res.json({ success: false, message: "Requested Record not Exist....", data: response });
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});
//End of Tax Setting

//Reward Point Setting
router.get('/GetAllRewardPointSetting', function(req, res) {
    RewardPointSetting.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetRewardPointSetting', function(req, res) {
    RewardPointSetting.findOne().then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveRewardPointSetting', jsonParser, function(req, res) {
    objRewardPointSetting = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objRewardPointSetting.Id == 0) {
                    RewardPointSetting.create(objRewardPointSetting).then(function(response) {
                        funAuditLog.CreateAuditLog('SaveRewardPointSetting', UserExist.username, 'Create Reward Point Setting');
                        res.json({ success: true, message: "Reward Point Setting created successfully...", data: response });
                    })
                } else {
                    RewardPointSetting.update(objRewardPointSetting, { where: { Id: objRewardPointSetting.Id } }).then(function(response) {
                        if (response[0]) {
                            funAuditLog.CreateAuditLog('SaveRewardPointSetting', UserExist.username, 'Update Reward Point Setting');
                            res.json({ success: true, message: "Reward Point Setting updated successfully...", data: response });
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

router.get('/DeleteRewardPointSetting', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                RewardPointSetting.destroy({ where: { Id: req.query.idRewardPointSetting } }).then(function(response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeleteRewardPointSetting', UserExist.username, 'Delete Reward Point Setting');
                        res.json({ success: true, message: "Reward Point Setting deleted successfully...", data: response });
                    } else {
                        res.json({ success: false, message: "Requested Record not Exist....", data: response });
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});
//End of Tax Setting


//Hand shake
router.get('/GetAllHandshake', function(req, res) {
    var offset = (parseInt(req.query.page) * 50);
    var objParam = req.query;
    var DeviceID = objParam.deviceId;
    var StartDate = objParam.fromDate;
    var EndDate = objParam.todate;
    var search = {};
    search['$and'] = [];

    if (DeviceID != '' && DeviceID != undefined) {
        var obj = new Object();
        obj['DeviceID'] = {
            //$eq: DeviceID
            $like: '%' + DeviceID + '%'
        };
        search['$and'].push(obj);
    }
    if (StartDate != undefined && EndDate != undefined && StartDate != '' && EndDate != '') {
        StartDate = StartDate;
        EndDate = EndDate;
        var obj = new Object();
        obj['Datetime'] = {
            $between: [StartDate, EndDate]
        };
        search['$and'].push(obj);
    } else if (StartDate != null && StartDate != '' && StartDate != undefined) {
        StartDate = StartDate;
        var obj = new Object();
        obj['Datetime'] = {
            $gt: StartDate
        };
        search['$and'].push(obj);
    } else if (EndDate != null && EndDate != '' && EndDate != undefined) {
        EndDate = EndDate;
        var obj = new Object();
        obj['Datetime'] = {
            $lt: EndDate
        };
        search['$and'].push(obj);
    }
    Handshake.findAll({ where: search, order: 'Datetime desc', limit: 50, offset: offset }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllDynamickHandshake', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (th.DeviceId like "%' + objSearch + '%" or ';
        // search = search + 'th.Charging like "%' + objSearch + '%" or ';
        // search = search + 'th.Power like "%' + objSearch + '%" or ';
        search = search + 'th.Datetime like "%' + objSearch + '%") ';
    }

    if (objParam.DeviceId != null && objParam.DeviceId != 'All' && objParam.DeviceId != '' && objParam.DeviceId != undefined) {
        if (search != "") {
            search += ' and th.DeviceId like "%' + objParam.DeviceId + '%"';
        } else {
            search += ' where th.DeviceId like "%' + objParam.DeviceId + '%"';
        }
    }
    if (objParam.fromdate != null && objParam.fromdate != '' && objParam.fromdate != undefined) {
        if (search != "") {
            search += ' and th.Datetime >= "' + convertdateformat(objParam.fromdate) + '"';
        } else {
            search += ' where th.Datetime >= "' + convertdateformat(objParam.fromdate) + '"';
        }
    }
    if (objParam.todate != null && objParam.todate != '' && objParam.todate != undefined) {
        if (search != "") {
            search += ' and th.Datetime <= "' + convertdateformat(objParam.todate) + '"';
        } else {
            search += ' where th.Datetime <= "' + convertdateformat(objParam.todate) + '"';
        }
    }

    if (search != "") {
        search += ' and tu.idApp = ' + objParam.idApp;
    } else {
        search += ' where tu.idApp = ' + objParam.idApp;
    }

    var query = "SELECT th.Id,th.DeviceId,CONVERT_TZ(th.Datetime,'+00:00','" + CurrentOffset + "') as Datetime, tv.iduser, tu.idApp FROM tblhandshake as th LEFT JOIN tblvehicle as tv ON th.DeviceId = tv.deviceid LEFT JOIN tbluserinformation AS tu ON tv.iduser = tu.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "SELECT count(th.id) as TotalRecord FROM tblhandshake as th LEFT JOIN tblvehicle as tv ON th.DeviceId = tv.deviceid LEFT JOIN tbluserinformation AS tu ON tv.iduser = tu.id " + search;
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

//End Hand shake


//Pet Gps
router.get('/GetAllGpsData', function(req, res) {
    var offset = (parseInt(req.query.page) * 50);
    var objParam = req.query;
    var DeviceID = objParam.deviceId;
    var StartDate = objParam.fromDate;
    var EndDate = objParam.todate;
    var search = {};
    search['$and'] = [];

    if (DeviceID != '' && DeviceID != undefined) {
        var obj = new Object();
        obj['DeviceID'] = {
            //$eq: DeviceID
            $like: '%' + DeviceID + '%'
        };
        search['$and'].push(obj);
    }
    if (StartDate != undefined && EndDate != undefined && StartDate != '' && EndDate != '') {
        StartDate = StartDate;
        EndDate = EndDate;
        var obj = new Object();
        obj['Datetime'] = {
            $between: [StartDate, EndDate]
        };
        search['$and'].push(obj);
    } else if (StartDate != null && StartDate != '' && StartDate != undefined) {
        StartDate = StartDate;
        var obj = new Object();
        obj['Datetime'] = {
            $gt: StartDate
        };
        search['$and'].push(obj);
    } else if (EndDate != null && EndDate != '' && EndDate != undefined) {
        EndDate = EndDate;
        var obj = new Object();
        obj['Datetime'] = {
            $lt: EndDate
        };
        search['$and'].push(obj);
    }
    PetGps.findAll({ where: search, order: 'Id desc', limit: 50, offset: offset }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

//End Pet Gps

//Pet Alarm
router.get('/GetAllAlarmData', function(req, res) {
    var offset = (parseInt(req.query.page) * 50);
    var objParam = req.query;
    var DeviceID = objParam.deviceId;
    var StartDate = objParam.fromDate;
    var EndDate = objParam.todate;
    var search = {};
    search['$and'] = [];

    var StartDate = convertdateUTCformat(StartDate);
    var unixStartdate = new Date(StartDate.replace(' ', 'T')).getTime() / 1000;

    var EndDate = convertdateUTCformat(EndDate);
    var unixEndDate = new Date(EndDate.replace(' ', 'T')).getTime() / 1000;

    if (objParam.fromDate != '' && objParam.todate != '') {
        var obj = new Object();
        obj['Date'] = {
            $between: [unixStartdate, unixEndDate]
        };
        search['$and'].push(obj);
    } else if (objParam.fromDate != null && objParam.fromDate != '') {
        var obj = new Object();
        obj['Date'] = {
            $gt: unixStartdate
        };
        search['$and'].push(obj);
    } else if (objParam.todate != null && objParam.todate != '') {
        var obj = new Object();
        obj['Date'] = {
            $lt: unixEndDate
        };
        search['$and'].push(obj);
    }


    if (DeviceID != '' && DeviceID != undefined) {
        var obj = new Object();
        obj['DeviceID'] = {
            //$eq: DeviceID
            $like: '%' + DeviceID + '%'
        };
        search['$and'].push(obj);
    }
    // if (StartDate != undefined && EndDate != undefined && StartDate != '' && EndDate != '') {
    //     StartDate = StartDate;
    //     EndDate = EndDate;
    //     var obj = new Object();
    //     obj['Datetime'] = {
    //         $between: [StartDate, EndDate]
    //     };
    //     search['$and'].push(obj);
    // } else if (StartDate != null && StartDate != '' && StartDate != undefined) {
    //     StartDate = StartDate;
    //     var obj = new Object();
    //     obj['Datetime'] = {
    //         $gt: StartDate
    //     };
    //     search['$and'].push(obj);
    // } else if (EndDate != null && EndDate != '' && EndDate != undefined) {
    //     EndDate = EndDate;
    //     var obj = new Object();
    //     obj['Datetime'] = {
    //         $lt: EndDate
    //     };
    //     search['$and'].push(obj);
    // }
    Alarm.findAll({ where: search, order: 'Date desc', limit: 50, offset: offset }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

function convertdateUTCformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getUTCMonth() + 1;
    var firstdayDay = date.getUTCDate();
    var firstdayYear = date.getUTCFullYear();
    var firstdayHours = date.getUTCHours();
    var firstdayMinutes = date.getUTCMinutes();
    var firstdaySeconds = date.getUTCSeconds();

    //return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
    return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
}

function convertdateformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();
    //return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
    return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
}


//End Pet Alarm
module.exports = router