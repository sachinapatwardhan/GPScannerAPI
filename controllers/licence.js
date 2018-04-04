var router = express.Router();
var LicenceManager = models.tbllicencemanager;
var GPSData = models.tblgpsdata;
var User = models.tbluserinformation;
var AppInfo = models.tblappinfo;
var GpsDevice = models.tblgpsdevice;
var Vehicle = models.tblvehicle;

router.get('/GetAllLicence', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';


    if (objSearch != null && objSearch != '') {
        search = ' and (tl.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tl.LicenceNo like "%' + objSearch + '%" or ';
        search = search + 'tl.ExpiryDate like "%' + objSearch + '%" or ';
        search = search + 'tl.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tu.email like "%' + objSearch + '%" or ';
        search = search + 'tu.username like "%' + objSearch + '%" or ';
        search = search + 'ta.AppName like "%' + objSearch + '%" or ';
        search = search + 'ta.LicenceType like "%' + objSearch + '%" or ';
        search = search + 'tv.Name like "%' + objSearch + '%") ';
    };

    if (req.query.StartDate != '' && req.query.EndDate != '') {
        if (search == '') {
            search = " AND tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
        } else {
            search = search + " AND   tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
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

    var query = "SELECT tl.Id, tu.email,tl.DeviceId,tl.LicenceNo,tl.IdUser,tu.username,tv.Name as VehicleName,ta.AppName,ta.LicenceType, " +
        "CONVERT_TZ(tl.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate, " +
        "CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate, " +
        "CONVERT_TZ(tl.ModifiedDate,'+00:00','" + CurrentOffset + "') as ModifiedDate " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tbluserinformation as tu ON tl.IdUser = tu.id " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " LEFT JOIN tblvehicle tv on tv.deviceid =tl.DeviceId where tl.IsDeleted=0  " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);


    var countquery = "SELECT count(*) as TotalRecord " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tbluserinformation as tu ON tl.IdUser = tu.id " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " LEFT JOIN tblvehicle tv on tv.deviceid =tl.DeviceId  where tl.IsDeleted=0  " + search;
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
                        User.findOne({ where: { id: req.query.IdUser } }).then(function(DeviceUserExist) {
                            if (DeviceUserExist) {
                                AppInfo.findOne({ where: { Id: DeviceUserExist.idApp } }).then(function(AppExits) {
                                    GpsDevice.findOne({ where: { DeviceId: req.query.DeviceId, AppName: AppExits.AppName }, })
                                        .then(function(objGpsDevice) {
                                            if (objGpsDevice != null) {
                                                LicenceManager.findOne({ where: { Id: req.query.Id } }).then(function(LicenceExist) {
                                                    if (LicenceExist.DeviceId == null || LicenceExist.DeviceId == '' || LicenceExist.DeviceId == undefined) {
                                                        LicenceExist.updateAttributes({
                                                            IdUser: req.query.IdUser,
                                                            DeviceId: req.query.DeviceId,
                                                            ExpiryDate: req.query.ExpiryDate,
                                                            CreatedDate: new Date(),
                                                        }).then(function(response) {
                                                            if (response) {
                                                                Vehicle.findOne({ where: { deviceid: response.DeviceId } }).then(function(vehicleExist) {
                                                                        if (vehicleExist) {
                                                                            vehicleExist.updateAttributes({ renewaldate: response.ExpiryDate }).then(function(updateRenewDate) {})
                                                                        }
                                                                    })
                                                                    // funAuditLog.CreateAuditLog('update ExpiryDate of Device ', UserExist.username, 'update ExpiryDate of Device (' + response.DeviceId + ')');
                                                                funAuditLog.CreateAuditLog('Assign device Licence ', UserExist.username, 'Licence No (' + LicenceExist.LicenceNo + ') / Assign Licence to (' + response.DeviceId + ') ');
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
                                                        LicenceExist.updateAttributes({
                                                            IdUser: req.query.IdUser,
                                                            DeviceId: req.query.DeviceId,
                                                            ExpiryDate: req.query.ExpiryDate,
                                                            ModifiedDate: new Date(),
                                                        }).then(function(response) {
                                                            if (response) {
                                                                Vehicle.findOne({ where: { deviceid: response.DeviceId, IsDelete: false } }).then(function(vehicleExist) {
                                                                        if (vehicleExist) {
                                                                            vehicleExist.updateAttributes({ renewaldate: response.ExpiryDate }).then(function(updateRenewDate) {})
                                                                        }
                                                                    })
                                                                    // funAuditLog.CreateAuditLog('update ExpiryDate of Device ', UserExist.username, 'update ExpiryDate of Device (' + response.DeviceId + ')');
                                                                funAuditLog.CreateAuditLog('Update Licence device ', UserExist.username, 'update Device (' + OldDeviceId + ') to (' + response.DeviceId + ') / Licence No (' + LicenceExist.LicenceNo + ')');
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
                                                })
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
                                    message: "Invalid User Name., Please insert valid User Name.",
                                    data: ""
                                });
                            }
                        })
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

                    AppInfo.findOne({ where: { AppName: req.query.AppName } }).then(function(AppInfo) {
                        var AddMonth = 0;
                        if (AppInfo.LicenceRenewalType == 'Monthly') {
                            AddMonth = 1;
                        } else if (AppInfo.LicenceRenewalType == 'Quarterly') {
                            AddMonth = 6;
                        } else if (AppInfo.LicenceRenewalType == 'Yearly') {
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
                            funAuditLog.CreateAuditLog('update ExpiryDate of Device', UserExist.username, 'DeviceID(' + response.DeviceId + ') / update Licence ExpiryDate of Device (' + convertdateformat(response.ExpiryDate, 4) + ') / Old ExpiryDate (' + convertdateformat(oldexpdate, 4) + ') / Updated for (' + difference + ' month)');
                            res.json({
                                success: true,
                                message: " Device renewal successfully.",
                                data: response
                            })
                        })
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