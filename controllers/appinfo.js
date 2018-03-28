var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var AppInfo = models.tblappinfo;
//End of Tables

router.get('/GetAllAppInfo', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (AppName like "%' + objSearch + '%" or ';
        search = search + 'BundleId like "%' + objSearch + '%" or ';
        search = search + 'IOSCertificate like "%' + objSearch + '%" or ';
        search = search + 'IOSKey like "%' + objSearch + '%" or ';
        search = search + 'AndroidId like "%' + objSearch + '%" or ';
        search = search + 'AndroidSenderId like "%' + objSearch + '%" or ';
        search = search + 'CreatedBy like "%' + objSearch + '%" or ';
        search = search + 'CreatedDate like "%' + objSearch + '%") ';
    }

    var qry = "Select tblappinfo.* ,CONVERT_TZ(tblappinfo.CreatedDate,'+00:00','" + CurrentOffset + "') as DisplyCreatedDate from tblappinfo " +
        search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    // console.log(qry);
    var Countqry = "SELECT count(tblappinfo.id) as TotalRecord " +
        "FROM tblappinfo " + search;

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

router.get('/GetAllInfoList', function(req, res) {
    AppInfo.findAll({
        attributes: ['id', 'AppName']
    }).then(function(response) {
        res.json(response);
    })
})

router.post('/SaveAppInfo', jsonParser, function(req, res) {
    // console.log(req.body)
    objAppInfo = req.body;
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
                if (objAppInfo.Id == 0) {
                    objAppInfo.CreatedDate = new Date();
                    objAppInfo.CreatedBy = decoded.username;
                    AppInfo.findOrCreate({ where: { AppName: objAppInfo.AppName }, defaults: objAppInfo }).then(function(response) {
                        if (response[0]) {

                            DefultAppSetting(response[0].Id);
                            funAuditLog.CreateAuditLog('SaveApp', decoded.username, 'Create App Info ('+ response[1].AppName +')');
                            res.json({
                                success: true,
                                message: "App Info created successfully...",
                                data: response
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "App Info is already Exist...",
                                data: response
                            });
                        }
                    })
                } else {
                    objAppInfo.ModifiedDate = new Date();
                    objAppInfo.ModifiedBy = decoded.username;
                    // objAppInfo.IOSCertificate = '';
                    // objAppInfo.IOSKey = '';
                    AppInfo.update(objAppInfo, {
                        where: {
                            Id: objAppInfo.Id
                        }
                    }).then(function(response) {
                        if (response[0]) {
                            funAuditLog.CreateAuditLog('Update App', decoded.username, 'Update App Info ('+ response.AppName +')');
                            res.json({
                                success: true,
                                message: "App Info updated successfully...",
                                data: response
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "App Info not updated successfully...",
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

router.get('/DeleteAppInfo', function(req, res) {
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
                if (req.query.Id != '' && req.query.Id != null) {
                    AppInfo.findOne({
                        where: {
                            Id: req.query.Id,
                        }
                    }).then(function(response) {
                        if (response) {
                            // response.updateAttributes({ IsDelete: true }).then(function(resUpdate) {
                            response.destroy().then(function(resUpdate) {
                                funAuditLog.CreateAuditLog('DeleteApp', UserExist.username, 'Delete App Info ('+ response.AppName +')');
                                res.json({
                                    success: true,
                                    message: "App Info Deleted Successfully",
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
                        message: "Select App Info To delete",
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

router.post('/uploadFileold', function(req, res) {
    var form = new formidable.IncomingForm();
    // console.log(req.query)
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';
    // form.uploadDir2 = __dirname + '/../MediaUploads/UserUpload';
    var FileName = [];
    var lstUser = [];




    //file upload path
    form.parse(req, function(err, fields, files) {

    });
    form.on('fileBegin', function(name, file) {
        // var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        // var NewName = file.name; //GetUserNameFromDate();
        // if (ext.indexOf('?') > -1) {
        //     ext = ext.substring(0, ext.indexOf('?'));
        // };

        // file.path = form.uploadDir + "/" + NewName; //+ ext;
        // FileName.push(NewName + ext);
        // lstUser.push(name);

        //modify file path
        var strarr = name.split(',');

        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetUserNameFromDate();
        if (ext.indexOf('?') > -1) {
            ext = ext.substring(0, ext.indexOf('?'));
        };
        if (strarr[1] == "IC") {
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "IK") {
            NewName = parseInt(NewName) + 2;
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "logo") {
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

        function uploader(i) {
            if (i < FileName.length) {
                var Id = parseInt(lstUser[i]);
                AppInfo.findOne({ where: { Id: Id } }).then(function(response) {
                    if (response != null) {

                        if (FileName[i].Type == "logo") {
                            if (response.ImageLogo != '' && response.ImageLogo != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.ImageLogo;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            response.updateAttributes({ ImageLogo: FileName[i].Name }).then(function(resUpdate) {
                                if ((i + 1) == FileName.length) {
                                    res.json({ success: true, message: "File Uploaded Successfully...", data: FileName[i] });
                                } else {
                                    uploader(i + 1);
                                };
                            })
                        }
                        if (FileName[i].Type == "IC") {
                            if (response.IOSCertificate != '' && response.IOSCertificate != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.IOSCertificate;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            response.updateAttributes({ IOSCertificate: FileName[i].Name }).then(function(resUpdate) {
                                if ((i + 1) == FileName.length) {
                                    res.json({ success: true, message: "File Uploaded Successfully...", data: FileName[i] });
                                } else {
                                    uploader(i + 1);
                                };
                            })
                        }
                        if (FileName[i].Type == "IK") {
                            if (response.IOSKey != '' && response.IOSKey != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.IOSKey;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            response.updateAttributes({ IOSKey: FileName[i].Name }).then(function(resUpdate) {
                                if ((i + 1) == FileName.length) {
                                    res.json({ success: true, message: "File Uploaded Successfully...", data: FileName[i] });
                                } else {
                                    uploader(i + 1);
                                };
                            })

                        }

                        //  }
                    }
                })
            }
        }
        uploader(i);
        if (FileName.length == 0) {
            res.json({ success: false, message: "Please Select atleast One File..." });
        }
        // res.sendStatus(200);
        //when finish all process
    });
});

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
        if (strarr[1] == "IC") {
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "IK") {
            NewName = parseInt(NewName) + 2;
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "logo") {
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "Loginlogo") {
            file.path = form.uploadDir + "/" + NewName + ext;
        } else if (strarr[1] == "Headerlogo") {
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
        var ImageLogo = '';
        var WebAppLoginLogo = '';
        var WebAppHeaderLogo = '';
        var IOSCertificate = '';
        var IOSKey = '';
        var Id = parseInt(lstUser[i]);
        AppInfo.findOne({ where: { Id: Id } }).then(function(response) {
            if (response != null) {
                function uploader(i) {
                    if (i < FileName.length) {
                        if (FileName[i].Type == "logo") {
                            if (response.ImageLogo != '' && response.ImageLogo != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.ImageLogo;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            ImageLogo = FileName[i].Name;
                        }
                        if (FileName[i].Type == "Loginlogo") {
                            if (response.WebAppLoginLogo != '' && response.WebAppLoginLogo != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.WebAppLoginLogo;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            WebAppLoginLogo = FileName[i].Name;
                        }
                        if (FileName[i].Type == "Headerlogo") {
                            if (response.WebAppHeaderLogo != '' && response.WebAppHeaderLogo != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.WebAppHeaderLogo;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            WebAppHeaderLogo = FileName[i].Name;
                        }
                        if (FileName[i].Type == "IC") {
                            if (response.IOSCertificate != '' && response.IOSCertificate != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.IOSCertificate;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });
                            }
                            IOSCertificate = FileName[i].Name;
                        }
                        if (FileName[i].Type == "IK") {
                            if (response.IOSKey != '' && response.IOSKey != null) {
                                var oldFile = __dirname + '/../MediaUploads/FileUpload/' + response.IOSKey;
                                fs.exists(oldFile, function(exists) {
                                    if (exists) {
                                        fs.unlink(oldFile);
                                    }
                                });

                            }
                            IOSKey = FileName[i].Name;
                        }
                        uploader(i + 1);
                    } else {
                        var obj = new Object();
                        if (ImageLogo != '') { obj.ImageLogo = ImageLogo; }
                        if (WebAppLoginLogo != '') { obj.WebAppLoginLogo = WebAppLoginLogo; }
                        if (WebAppHeaderLogo != '') { obj.WebAppHeaderLogo = WebAppHeaderLogo; }
                        if (IOSCertificate != '') { obj.IOSCertificate = IOSCertificate }
                        if (IOSKey != '') { obj.IOSKey = IOSKey }

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

router.get('/GetAppInfoByName', function(req, res) {
    AppInfo.findOne({ where: { AppName: req.query.AppName } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    });
})

router.get('/GetAppInfoByAdmin', function(req, res) {
    AppInfo.findOne({ where: { AdminUrl: { $like: "%" + req.query.AdminUrl + "%" } } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    });
})
router.get('/GetAppInfoByWebApp', function(req, res) {
    AppInfo.findOne({ where: { WebAppUrl: req.query.WebAppUrl } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    });
})


router.get('/GetAllInfoList', function(req, res) {
    AppInfo.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    });
})

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

module.exports = router