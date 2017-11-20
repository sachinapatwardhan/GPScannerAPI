//Tables
var router = express.Router();
var VehicleType = models.tblvehicletype;
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;

router.get('/GetAllActivevehicletype', function(req, res) {

    VehicleType.findAll({ where: { IsActive: 1 } }).then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json({ success: false, data: err });
    })
})

router.get('/Getvehicletype', function(req, res) {
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
                if (columnName != 'CreatedDate') {
                    search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                }
            };
        };
    }
    VehicleType.findAndCountAll({
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
        // VehicleType.findAll().then(function(response) {
        //     res.json(response);
        // }).catch(function(err) {
        //     res.json({ success: false, data: err });
        // })
})

router.post('/SaveVehicleType', jsonParser, function(req, res) {
    console.log(req.body);
    var objVehicleType = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objVehicleType.id == 0) {

                    //set Parameter
                    objVehicleType.CreatedDate = new Date();
                    objVehicleType.CreatedBy = decoded.username;
                    VehicleType.findOrCreate({ where: { Type: objVehicleType.Type }, defaults: objVehicleType }).then(function(response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('Create Vehicle Type', UserExist.username, 'Save Vehicle Type');
                            res.json({ success: true, message: "Vehicle Type created successfully...", data: response });
                        } else {
                            res.json({ success: false, message: "Vehicle Type is already Exist...", data: response });
                        }
                    })

                } else {
                    //set Parameter
                    VehicleType.findOne({ where: { Type: objVehicleType.Type }, defaults: objVehicleType }).then(function(objVehicleTypeExist) {
                        if (objVehicleTypeExist != null && objVehicleType.id != objVehicleTypeExist.id) {
                            res.json({ success: false, message: "Vehicle Type is already Exist...", data: objVehicleTypeExist });
                        } else {
                            VehicleType.update(objVehicleType, { where: { id: objVehicleType.id } }).then(function(response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('Update Vehicle Type ', UserExist.username, 'Update Vehicle Type');
                                    res.json({ success: true, message: "Vehicle Type updated successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Vehicle Type not updated successfully...", data: response });
                                }
                            })
                        }
                    })

                }
            } else {
                res.json({
                    success: false,
                    InvalidToken: true,
                    data: InvalidToken,
                });
            }
        })
    } else {
        res.json({
            success: false,
            InvalidToken: true,
            data: InvalidToken,
        });
    }
})



router.get('/DeleteVehicleTypeById', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                Vehicle.findOne({ where: { idType: req.query.id } }).then(function(VehicleExist) {
                    if (VehicleExist != null) {
                        res.json({ success: true, message: "This Type of Vehicel Exist..So, You can not delete this Vehicle Type" });
                    } else {
                        VehicleType.destroy({
                            where: { id: req.query.id }
                        }).then(function(response) {
                            if (response != null) {
                                funAuditLog.CreateAuditLog('Delete Vehicle Type', UserExist.username, 'Delete Vehicle Type');
                                res.json({ success: true, message: "Vehicle Type deleted successfully...", data: response });
                            } else {
                                res.json({ success: true, message: "Vehicle Type not deleted successfully...", data: response });
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


router.get('/UpdateIsActiveStatus', function(req, res) {
    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                VehicleType.findOne({ where: { id: req.query.id } }).then(function(objVehicleTypeExist) {
                    if (objVehicleTypeExist != null) {
                        objVehicleTypeExist.updateAttributes({
                            IsActive: req.query.IsActive
                        }).then(function(response) {
                            if (response != null) {
                                funAuditLog.CreateAuditLog('Update Vehicle Type Status', UserExist.username, 'Update Vehicle Type Status');
                                res.json({ success: true, message: "Vehicle Type status updated successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "Vehicle Type status not updated successfully...", data: response });
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Vehicle Type is not Exist...", data: response });
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



router.post('/uploadFile', function(req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';
    var FileName = [];
    var lstUser = [];
    //file upload path
    form.parse(req, function(err, fields, files) {});
    form.on('fileBegin', function(name, file) {
        var strarr = name.split(',');
        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetUserNameFromDate();
        if (ext.indexOf('?') > -1) {
            ext = ext.substring(0, ext.indexOf('?'));
        };
        if (strarr[1] == "OnIcon") {
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "ActiveIcon") {
            NewName = parseInt(NewName) + 2;
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "OffIcon") {
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "LocateOnIcon") {
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "LocateActiveIcon") {
            NewName = parseInt(NewName) + 2;
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "LocateOffIcon") {
            file.path = form.uploadDir + "/" + NewName + ext;
        }
        var obj = new Object();
        obj.Name = NewName + ext;
        obj.Type = strarr[1];
        FileName.push(obj);
        lstUser.push(strarr[0]);

    });
    form.on('end', function() {
        var i = 0;
        var OnIcon = '';
        var OffIcon = '';
        var ActiveIcon = '';
        var id = parseInt(lstUser[i]);
        console.log("id...", id)
        VehicleType.findOne({ where: { id: id } }).then(function(response) {
            if (response != null) {
                function uploader(i) {
                    if (i < FileName.length) {
                        if (FileName[i].Type == "OnIcon") {
                            if (response.OnIcon != '' && response.OnIcon != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.OnIcon;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            OnIcon = FileName[i].Name;
                        }
                        if (FileName[i].Type == "ActiveIcon") {
                            if (response.ActiveIcon != '' && response.ActiveIcon != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.ActiveIcon;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            ActiveIcon = FileName[i].Name;
                        }
                        if (FileName[i].Type == "OffIcon") {
                            if (response.OffIcon != '' && response.OffIcon != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.OffIcon;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            OffIcon = FileName[i].Name;
                        }
                        if (FileName[i].Type == "LocateOnIcon") {
                            if (response.LocateOnIcon != '' && response.LocateOnIcon != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.LocateOnIcon;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            LocateOnIcon = FileName[i].Name;
                        }
                        if (FileName[i].Type == "LocateActiveIcon") {
                            if (response.LocateActiveIcon != '' && response.LocateActiveIcon != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.LocateActiveIcon;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            LocateActiveIcon = FileName[i].Name;
                        }
                        if (FileName[i].Type == "LocateOffIcon") {
                            if (response.LocateOffIcon != '' && response.LocateOffIcon != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.LocateOffIcon;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            LocateOffIcon = FileName[i].Name;
                        }

                        uploader(i + 1);
                    } else {
                        var obj = new Object();
                        if (OnIcon != '') { obj.OnIcon = OnIcon; }
                        if (OffIcon != '') { obj.OffIcon = OffIcon; }
                        if (ActiveIcon != '') { obj.ActiveIcon = ActiveIcon; }
                        if (LocateOnIcon != '') { obj.LocateOnIcon = LocateOnIcon; }
                        if (LocateOffIcon != '') { obj.LocateOffIcon = LocateOffIcon; }
                        if (LocateActiveIcon != '') { obj.LocateActiveIcon = LocateActiveIcon; }
                        console.log("obj......", obj)
                        response.updateAttributes(obj).then(function(resUpdate) {
                            if (resUpdate != null) {
                                res.json({ success: true, message: "File Uploaded Successfully...", data: resUpdate });
                            } else {
                                res.json({ success: false, message: "File not Uploaded Successfully...", data: 0 });
                            }
                        })
                    }
                }
                uploader(i);
            } else {
                res.json({ success: false, message: "File not uploaded..." });
            }
        })
    });
});

function GetUserNameFromDate() {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();

    var seconds = d.getSeconds();
    var minutes = d.getMinutes();
    var hour = d.getHours();

    var milisec = d.getMilliseconds();

    return curr_year.toString() + curr_month.toString() + curr_date.toString() + hour.toString() + minutes.toString() + seconds.toString() + milisec.toString();


}


router.get('/GetActivevehicletype', function(req, res) {
    console.log(req.query)
    VehicleType.findOne({
        where: {
            IsActive: 1,
            Type: req.query.Type
        }
    }).then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json({ success: false, data: err });
    })
})

module.exports = router