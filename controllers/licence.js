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
        search = search + 'tv.Name like "%' + objSearch + '%") ';
    };

    var query = "SELECT tl.Id, tu.email,tl.DeviceId,tl.LicenceNo,tl.IdUser,tu.username,tv.Name as VehicleName, " +
        "CONVERT_TZ(tl.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate, " +
        "CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate, " +
        "CONVERT_TZ(tl.ModifiedDate,'+00:00','" + CurrentOffset + "') as ModifiedDate " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tbluserinformation as tu ON tl.IdUser = tu.id " +
        " LEFT JOIN tblvehicle tv on tv.deviceid =tl.DeviceId where tl.IsDeleted=0  " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var countquery = "SELECT count(*) as TotalRecord " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tbluserinformation as tu ON tl.IdUser = tu.id " +
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
                                                                Vehicle.findOne({ where: { deviceid: response.DeviceId, IsDelete: false } }).then(function(vehicleExist) {
                                                                    if (vehicleExist) {
                                                                        vehicleExist.updateAttributes({ renewaldate: response.ExpiryDate }).then(function(updateRenewDate) {})
                                                                    }
                                                                })
                                                                funAuditLog.CreateAuditLog('update ExpiryDate of Device (' + response.DeviceId + ')', UserExist.usernam, 'update ExpiryDate of Device (' + response.DeviceId + ')');
                                                                funAuditLog.CreateAuditLog('Assign device Licence (' + LicenceExist.LicenceNo + ')', UserExist.usernam, 'Assign Licence to (' + response.DeviceId + ')');
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
                                                                funAuditLog.CreateAuditLog('update ExpiryDate of Device (' + response.DeviceId + ')', UserExist.usernam, 'update ExpiryDate of Device (' + response.DeviceId + ')');
                                                                funAuditLog.CreateAuditLog('Update Licence device (' + LicenceExist.LicenceNo + ')', UserExist.username, 'update Device (' + OldDeviceId + ') to (' + response.DeviceId + ')');
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


//Private functions
var maxLength = 15;
var minLength = 15;
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

function insertLicenceno() {
    // var coll = [];
    // for (var i = 0; i < 20; i++) {
    //     var calldata = [customPassword1()];
    //     console.log(i, "---", calldata)
    //     coll.push(calldata);
    // }

    function uploder(i) {
        if (i < 20) {
            var LicenceNo = customPassword1();
            LicenceManager.find({ where: { LicenceNo: LicenceNo } }).then(function(LicenceNoExits) {
                if (LicenceNoExits) {
                    uploder(i + 1);
                } else {
                    var obj = new Object();
                    obj.LicenceNo = LicenceNo;
                    LicenceManager.create(obj).then(function(response) {
                        // console.log("###")
                        uploder(i + 1);
                    })
                }
            })
        }

    }
    uploder(0)
        // connection.query("INSERT INTO tbllicencemanager (LicenceNo) VALUES ?", [coll], function(err, res, fields) {
        //     console.log("Err...", err);
        //     console.log("res...", res);
        // })
}
// insertLicenceno();

module.exports = router