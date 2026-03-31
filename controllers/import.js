//Tables
var router = express.Router();
var AppInfo = models.tblappinfo;
var User = models.tbluserinformation;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var GPSDevice = models.tblgpsdevice;
var SimService = models.tblsimdetails;
var VehicleType = models.tblvehicletype;
var Vehicle = models.tblvehicle;
var TelCo = models.tbltelco;
var Commonfunction = require('./common.js');
//End of Tables

router.get('/DownloadTemplate', function (req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'IMEI',
        type: 'string'
    }, {
        caption: 'SIMNo',
        type: 'string'
    }
        
        , {
        caption: 'TelephoneCompany',
        type: 'string'
    }, {
        caption: 'VehicleName',
        type: 'string'
    }, {
        caption: 'VehicleType',
        type: 'string'
    }, {
        caption: 'Email',
        type: 'string'
    }
    ];


    var row = [];
    for (var i = 0; i < conf.cols.length; i++) {
        row.push('');
    };
    conf.rows = [];
    conf.rows.push(row);
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Template.xlsx");
    res.end(result, 'binary');
})

router.post('/ImportData', function (req, res) {
    var form = new formidable.IncomingForm();
    var lst = [];
    var FileName = [];
    var CreatedBy;
    var AppName;
    var Importerror = [];

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //var FileName = __dirname + '/../MediaUploads/FileUpload/DeviceList.xlsx';
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

    form.parse(req, function (err, fields, files) {
        CreatedBy = fields.CreatedBy;
        AppName = fields.AppName;
    });

    form.on('fileBegin', function (name, file) {
        file.path = form.uploadDir + "/" + file.name;
        FileName = file.path.toString();
    });

    form.on('end', function () {
        if (FileName.length > 0) {
            var workbook = XLSX.readFile(FileName, { type: 'binary' });
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            if (worksheet != null && worksheet != undefined && worksheet != '') {
                var Firstcolumn = (worksheet.A1 == undefined ? "Firstcolumn" : worksheet.A1.v);
                var Secondcolumn = (worksheet.B1 == undefined ? "Secondcolumn" : worksheet.B1.v);
                var Lastcolumn = (worksheet.F1 == undefined ? "BeforeAtrribute" : worksheet.F1.v);
                if (Firstcolumn == "IMEI" && Lastcolumn == "Email" && Secondcolumn == "SIMNo") {
                    lst = XLSX.utils.sheet_to_json(worksheet);
                    if (lst.length > 0) {
                        var TotalError = 0;
                        addDevice(0);

                        function addDevice(i) {
                            if (i < lst.length) {
                                var idApp = null;
                                var idUser = null;
                                var objData = lst[i];
                                AppInfo.findOne({ where: { AppName: AppName } }).then(function (resAppInfo) {
                                    idApp = resAppInfo.Id;
                                    var Simobj = new Object();
                                    Simobj.SerialNum = objData.SIMNo.trim();
                                    Simobj.PhoneNum = objData.SIMNo.trim();
                                    Simobj.idTelCo = null;
                                    Simobj.idApp = idApp;
                                    TelCo.findOne({ where: { Name: objData.TelephoneCompany.trim() } }).then(function (TelCoExist) {
                                        if (TelCoExist) {
                                            Simobj.idTelCo = TelCoExist.id;
                                            AddSIMDetails(objData, Simobj);
                                        } else {
                                            var objTelCo = new Object();
                                            objTelCo.Name = objData.TelephoneCompany.trim();
                                            objTelCo.CreatedDate = new Date();
                                            objTelCo.CreatedBy = CreatedBy;
                                            TelCo.create(objTelCo).then(function (TelCoCreated) {
                                                Simobj.idTelCo = TelCoCreated.id;
                                                AddSIMDetails(objData, Simobj);
                                            })
                                        }
                                    })

                                })

                                function AddSIMDetails(objData, Simobj) {
                                    SimService.findOne({ where: { SerialNum: objData.SIMNo } }).then(function (resExist) {
                                        if (resExist != null) {
                                            Simobj.id = resExist.id;
                                            AddGpsDevice(Simobj.id);

                                        } else {
                                            Simobj.CreatedDate = new Date();
                                            SimService.create(Simobj).then(function (response) {
                                                funAuditLog.CreateAuditLog('SaveSIM', CreatedBy, 'Cerate New SIM Data');
                                                AddGpsDevice(response.id);
                                            })
                                        }
                                    })
                                }

                                function AddGpsDevice(idSim) {
                                    var objDevice = new Object();
                                    objDevice.DeviceId = objData.IMEI.trim();
                                    objDevice.IMEI = objData.IMEI.trim();
                                    objDevice.CreatedDate = new Date();
                                    objDevice.CreatedBy = CreatedBy;
                                    objDevice.AppName = AppName;
                                    objDevice.idSim = idSim;
                                    objDevice.IsActive = true;
                                    objDevice.Type = "MT05";
                                    objDevice.Version = "v4";
                                    GPSDevice.findOne({ where: { idSim: objDevice.idSim, IMEI: { $ne: objData.IMEI } } }).then(function (DeviceSimExist) {
                                        if (DeviceSimExist) {
                                            addDevice(i + 1);
                                        } else {
                                            GPSDevice.findOrCreate({ where: { IMEI: objDevice.IMEI }, defaults: objDevice }).then(function (response) {
                                                if ((response[1])) {
                                                    funAuditLog.CreateAuditLog('SaveGPSDevice', CreatedBy, 'Create GPS Tracker Device');
                                                    CreateUser();
                                                } else {
                                                    CreateUser();
                                                    }
                                            })
                                        }
                                    }).catch(function (resError) {
                                        CreateUser();
                                    })
                                }

                                function CreateUser() {
                                    var objUser = new Object();
                                    objUser.username = objData.Email;
                                    objUser.email = objData.Email;
                                    objUser.password = jwt.encode("123456", TokenKey);
                                    objUser.idApp = idApp;
                                    User.findOne({
                                        where: {
                                            $or: [{ email: objData.Email }, { username: objData.Email }],
                                            idApp: idApp,
                                        }
                                    }).then(function (chkEmailExist) {
                                        if (chkEmailExist != null) {
                                            idUser = chkEmailExist.id
                                            AddVehicle(idUser)
                                            } else {
                                            objUser.createdby = CreatedBy;
                                            objUser.createddate = new Date();
                                            User.create(objUser).then(function (resUserReg) {
                                                idUser = resUserReg.id
                                                Role.findOne({ where: { RoleName: "User" } }).then(function (objRole) {
                                                    if (objRole != null) {
                                                        var objUserInRole = {
                                                            userId: idUser,
                                                            roleId: objRole.id,
                                                        }
                                                        UserInRole.create(objUserInRole).then(function (resUserInRole) {
                                                            funAuditLog.CreateAuditLog('SaveUser', CreatedBy, 'Create User');
                                                            AddVehicle(idUser)
                                                        })
                                                    } else {
                                                        var objRole = {
                                                            RoleName: "User",
                                                            Description: null
                                                        }
                                                        Role.create(objRole).then(function (resRole) {
                                                            var objUserInRole = {
                                                                userId: idUser,
                                                                roleId: resRole.id,
                                                            }
                                                            UserInRole.create(objUserInRole).then(function (resUserInRole) {
                                                                updateUserRedisValue(idUser);
                                                                funAuditLog.CreateAuditLog('SaveUser', CreatedBy, 'Create User');
                                                                AddVehicle(idUser);
                                                            })
                                                        })
                                                    }
                                                })
                                            })
                                        }
                                    })
                                }

                                function AddVehicle(idUser) {
                                    var objVehicleType = new Object();
                                    objVehicleType.Type = objData.VehicleType;
                                    objVehicleType.IsActive = true;
                                    objVehicleType.LocateIsRotate = true;
                                    VehicleType.findOne({ where: { Type: objVehicleType.Type } }).then(function (response) {
                                        if (response != null) {
                                            objVehicleType.id = response.id;
                                            CreateVehicle(objVehicleType.id)
                                            } else {
                                            objVehicleType.CreatedDate = new Date();
                                            objVehicleType.CreatedBy = CreatedBy;
                                            VehicleType.create(objVehicleType).then(function (response) {
                                                funAuditLog.CreateAuditLog('SaveVehicleType', CreatedBy, 'Create Vehicle Type');
                                                CreateVehicle(response.id)

                                            })
                                        }
                                    })
                                }

                                function CreateVehicle(idType) {
                                    var today = new Date();
                                    today = today.setMonth(today.getMonth() + 1);
                                    var objVehicle = new Object();
                                    objVehicle.iduser = idUser;
                                    objVehicle.Name = objData.VehicleName;
                                    objVehicle.deviceid = objData.IMEI;
                                    objVehicle.idType = idType;
                                    objVehicle.DeviceType = "MT05";
                                    objVehicle.renewaldate = today;
                                    objVehicle.IsDelete = 0;
                                    Vehicle.findOne({ where: { deviceid: objVehicle.deviceid, IsDelete: true } }).then(function (response) {
                                        if (response != null) {
                                            objVehicle.id = response.id;
                                            objVehicle.ModifiedDate = new Date();
                                            objVehicle.ModifiedBy = CreatedBy;
                                            Vehicle.update(objVehicle, { where: { id: objVehicle.id } }).then(function (response) {
                                                Commonfunction.UpdateVehicleRedis(objVehicle);
                                                funAuditLog.CreateAuditLog('SaveVehicle', CreatedBy, 'Update Vehicle');
                                                shareVehicleTosysreportUser(objVehicle.deviceid)
                                                addDevice(i + 1)
                                            })
                                        } else {
                                            Vehicle.findOne({ where: { deviceid: objVehicle.deviceid, IsDelete: false } }).then(function (objvehicleexist) {
                                                if (objvehicleexist) {
                                                    addDevice(i + 1)
                                                } else {
                                                    objVehicle.CreatedDate = new Date();
                                                    objVehicle.CreatedBy = CreatedBy;
                                                    Vehicle.create(objVehicle).then(function (response) {
                                                        Commonfunction.updateSIMStartDate(objVehicle.deviceid);
                                                        Commonfunction.UpdateVehicleRedis(objVehicle.deviceid);
                                                        funAuditLog.CreateAuditLog('SaveVehicle', CreatedBy, 'Create Vehicle');
                                                        shareVehicleTosysreportUser(objVehicle.deviceid)
                                                        addDevice(i + 1)
                                                    })
                                                }
                                            });
                                        }
                                    })
                                }
                            } else {
                                if (TotalError == 0) {
                                    res.json({
                                        success: true,
                                        message: "Excel File uploaded successfully..",
                                    });
                                } else {
                                    res.json({
                                        success: true,
                                        message: "Excel File uploaded successfully..Failed To Import : " + TotalError,
                                    });
                                }
                            }
                        }

                    } else {
                        res.json({
                            success: false,
                            message: "No Data in Excel File..",
                        });
                    }

                } else {
                    res.json({
                        success: false,
                        message: "Excel File is Not in Valid Format, You can Download Template for import Excel File.",
                    });
                }
            } else {
                res.json({
                    success: false,
                    message: "Error in Import , Excel File is Protected..",
                });
            }
        } else {
            res.json({
                success: false,
                message: "No File Found..",
            });
        };

    });
});



function updateUserRedisValue(id) {
    Vehicle.findAll({ where: { iduser: id } }).then(function (response) {
        if (response) {
            for (var i = 0; i < response.length; i++) {
                Commonfunction.UpdateVehicleRedis(response[i].deviceid, 'User')
            }
        }
    })
}


module.exports = router