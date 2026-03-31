//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Language = models.language;
var LanguageInCountry = models.tbllanguageincountry;

//End of Tables

router.get('/GetAllLanguage', function (req, res) {
    Language.findAll().then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})


router.get('/GetAllPublishLanguage', function (req, res) {
    Language.hasMany(LanguageInCountry, {
        foreignKey: {
            name: 'IdLanguage',
            allowNull: false
        }
    });
    Language.findAll({
        where: { Published: true },
        include: [{
            model: LanguageInCountry,
            where: {
                $or: [{ Country: req.query.Country }, { Country: 'All' }]
            }
        }],
        order: ['DisplayOrder']
    }).then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})

router.get('/GetLanguageById', function (req, res) {
    Language.findOne({ where: { Id: req.query.idLanguage } }).then(function (response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.get('/GetLangageCulture', function (req, res) {
    var allCountryCodes = CountryLanguage.getLanguages();
    var culturename = [];
    for (var i = 0; i < allCountryCodes.length; i++) {
        if (allCountryCodes[i].langCultureMs) {
            allCountryCodes[i].langCultureMs.forEach(function (locale) {
                culturename.push(locale.langCultureName);
            })
        };
    };

    res.json(culturename);
})




router.post('/SaveLanguage', jsonParser, function (req, res) {
    objLanguage = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                if (objLanguage.Id == 0) {
                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            Language.findOrCreate({ where: { Name: objLanguage.Name }, defaults: objLanguage }).then(function (response) {
                                if ((response[1])) {
                                    funAuditLog.CreateAuditLog('SaveLanguage', UserExist.username, 'Create Language');
                                    res.json({ success: true, message: "Language created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Language is already Exist...", data: response });
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {
                    //set Parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            Language.findOne({ where: { Name: objLanguage.Name }, defaults: objLanguage }).then(function (objLanguageExist) {
                                if (objLanguageExist != null && objLanguage.Id != objLanguageExist.Id) {
                                    res.json({ success: false, message: "Language is already Exist...", data: objLanguageExist });
                                } else {
                                    Language.update(objLanguage, { where: { Id: objLanguage.Id } }).then(function (response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveLanguage', UserExist.username, 'Update Language');
                                            res.json({ success: true, message: "Language updated successfully...", data: response });
                                        }
                                    })
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/DeleteLanguage', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    req.query['permission'] = "Deleted";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
                    if (UserExist != null) {

                        Language.findOne({ where: { Id: req.query.idLanguage } }).then(function (response1) {
                            if (response1 != null) {
                                if (response1.FlagImageFileName != '' && response1.FlagImageFileName != null) {
                                    var oldFile = __dirname + '/../MediaUploads/' + response1.FlagImageFileName;
                                    console.log(oldFile)
                                    fs.exists(oldFile, function (exists) {
                                        if (exists) {
                                            fs.unlink(oldFile);
                                        }
                                    });
                                }
                                Language.destroy({ where: { Id: req.query.idLanguage } }).then(function (response) {
                                    if (response) {
                                        funAuditLog.CreateAuditLog('DeleteLanguage', UserExist.username, 'Delete Language');
                                        res.json({ success: true, message: "Language deleted successfully...", data: response });
                                    } else {
                                        res.json({ success: false, message: "Requested Record not Exist....", data: response });
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
        } else {
            res.json(NoAccessPermission);
        }
    });
});

router.post('/uploadImage', function (req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/../MediaUploads';
    var FileName = [];
    var lstUser = [];




    //file upload path
    form.parse(req, function (err, fields, files) {
        //you can get fields here
    });
    form.on('fileBegin', function (name, file) {
        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetUserNameFromDate();
        if (ext.indexOf('?') > -1) {
            ext = ext.substring(0, ext.indexOf('?'));
        };

        file.path = form.uploadDir + "/" + NewName + ext;
        FileName.push(NewName + ext);
        lstUser.push(name);

        //modify file path
    });
    form.on('end', function () {
        var i = 0;

        function uploader(i) {
            if (i < FileName.length) {
                var Id = parseInt(lstUser[i]);
                Language.findOne({ where: { Id: Id } }).then(function (response) {
                    if (response != null) {
                        if (response.FlagImageFileName != '' && response.FlagImageFileName != null) {
                            var oldFile = __dirname + '/../MediaUploads/' + response.FlagImageFileName;
                            fs.exists(oldFile, function (exists) {
                                if (exists) {
                                    fs.unlink(oldFile);
                                }
                            });
                        };
                        response.updateAttributes({ FlagImageFileName: FileName[i] }).then(function (resUpdate) {
                            if ((i + 1) == FileName.length) {
                                res.json({ success: true, message: "Images Uploaded Successfully...", data: FileName[i] });
                            } else {
                                uploader(i + 1);
                            };
                        })

                    }
                })
            }
        }
        uploader(i);
        if (FileName.length == 0) {
            res.json({ success: false, message: "Please Select atleast One File..." });
        }

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

router.get('/GetMobileLanguageData', function (req, res) {
    var file = __dirname + "/MultiLangugaeFile/MobileLanguageResource.json";
jsonfile.readFile(file, function (err, obj) {
        res.json(obj);
        })

    
})


module.exports = router