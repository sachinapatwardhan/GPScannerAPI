//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Language = models.language;
//End of Tables

router.get('/DownloadTemplate', function (req, res) {
    Language.findAll().then(function (response) {
        var columnData = [];
        for (var i = 0; i < response.length; i++) {
            if (i == 0) {
                var Obj = new Object();
                Obj.caption = 'Code';
                Obj.type = 'String';
                columnData.push(Obj);
            }
            var Obj = new Object();
            Obj.caption = response[i].LanguageCulture;
            Obj.type = 'String';
            columnData.push(Obj);
        }
        var conf = {};
        conf.name = "Sheet1";
        conf.cols = columnData;
        var row = [];
        for (var i = 0; i < conf.cols.length; i++) {
            row.push('');
        };
        conf.rows = [];
        conf.rows.push(row);
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "MobileLanguageResources_Template.xlsx");
        res.end(result, 'binary');
    }).catch(function (error) {
        res.json(error);
    })
    
})

router.get('/GetMobileLanguageData', function (req, res) {
    


    var file = __dirname + "/MultiLangugaeFile/MobileLanguageResource.json";

    jsonfile.readFile(file, function (err, obj) {
        res.json(obj);
    })
})

router.post('/SaveMobileLanguageData', jsonParser, function (req, res) {
    objMobileLanguageData = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    req.query['permission'] = "Modified";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({
                    where: {
                        username: decoded.username,
                        password: decoded.password
                    }
                }).then(function (UserExist) {
                    if (UserExist != null) {
                        var file = __dirname + "/MultiLangugaeFile/MobileLanguageResource.json";
                        var array = [];


                        var lstMobileLanguageResources = [];
                        jsonfile.readFile(file, function (err, obj) {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: err,
                                });
                            } else {
                                lstMobileLanguageResources = obj;

                                for (var i = 2; i < objMobileLanguageData.length - 1; i++) {
                                    lstMobileLanguageResources[objMobileLanguageData[i].Name][objMobileLanguageData[1].Value] = objMobileLanguageData[i].Value;
                                }
                                jsonfile.writeFile(file, lstMobileLanguageResources, function (err) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: err,
                                        });
                                    } else {
                                        funAuditLog.CreateAuditLog('SaveMobileLanguageData', UserExist.username, 'Create Mobile Language Resources');
                                        res.json({
                                            success: true,
                                            message: "Mobile Language Resources updated successfully...",
                                            data: err
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
        } else {
            res.json(NoAccessPermission);
        }
    });
})

router.get('/ExportMobileLanguageResource', function (req, res) {

    var file = __dirname + "/MultiLangugaeFile/MobileLanguageResource.json";
    var conf = {};
    conf.cols = [];

    jsonfile.readFile(file, function (err, obj) {
        var conf = {};
        conf.cols = [];

        var NewColumn1 = {
            caption: 'Code',
            type: 'string'
        }

        conf.cols.push(NewColumn1);

        var objHead = []
        for (var obj1 in obj) {
            var objHeader = new Object();
            objHeader.caption = obj1;
            objHeader.type = 'string';
            objHead.push(obj1);
            conf.cols.push(objHeader);
        }
        var lstLanguage = [];
        for (var objLanKey in obj[Object.keys(obj)[0]]) {
            var Language = new Object();
            Language.Code = objLanKey;
            for (var obj1 in obj) {
                var langObj = obj[obj1];
                Language[obj1] = langObj[objLanKey];
            }
            lstLanguage.push(Language);
        };
        conf.rows = [];

        for (var i = 0; i < lstLanguage.length; i++) {
            var row = [];
            var code = lstLanguage[i].Code;
            row.push(code);
            for (var j = 0; j < objHead.length; j++) {
                var name = objHead[j];
                var lang1 = lstLanguage[i][name];
                row.push(lang1);
            }
            conf.rows.push(row);
        }

        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "MobileLanguageResource.xlsx");
        res.end(result, 'binary');

    })

})

router.post('/ImportMobileLanguageResource', jsonParser, function (req, res) {
    var form = new formidable.IncomingForm();
    var FileName = [];
    var LanguageId = 0;
    var lst = [];
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

    //file upload path
    form.parse(req, function (err, fields, files) {
        LanguageId = fields.LanguageId;
    });

    //First Call this
    form.on('fileBegin', function (name, file) {
        file.path = form.uploadDir + "/" + file.name;
        FileName.push(file.path);
    });

    form.on('end', function () {
        if (FileName.length > 0) {
            var workbook = XLSX.readFile(FileName[0], { type: 'binary' });
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            if (worksheet != null && worksheet != undefined && worksheet != '') {
                var Firstcolumn = worksheet.A1.v;
                if (Firstcolumn == "Code") {
                    lst = XLSX.utils.sheet_to_json(worksheet);
                    if (lst.length > 0) {
                        var NewObjLanguageResources = [];
                        var lstLanguageCode = {};
                        var lang1 = [];
                        var language = {};
                        for (var item in lst[0]) {
                            lang1.push(item);
                        }
                        var u = lang1.length - 2;
                        for (var j = 1; j < lang1.length; j++) {
                            lstLanguageCode = {};
                            for (var i = 0; i < lst.length; i++) {
                                var objlang = lst[i];
                                NewObjLanguageResources = [];
                                for (var obj in objlang) {
                                    NewObjLanguageResources.push(objlang[obj]);
                                }
                                for (var k = 1; k < NewObjLanguageResources.length - u; k++) {
                                    var key = objlang.Code;
                                    var value = NewObjLanguageResources[k];
                                    lstLanguageCode[key] = value;
                                }
                            }
                            var key1 = lang1[j];
                            language[key1] = lstLanguageCode;
                            u = u - 1;
                        }

                        var file = __dirname + "/MultiLangugaeFile/MobileLanguageResource.json";
                        //set Parameter
                        req.query['permission'] = "Added";

                        var obj = {};
                        obj.headers = req.headers;
                        obj.query = req.query;

                        funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
                            var AccessPermission = responseAccessPermission.success;
                            if (AccessPermission) {

                                jsonfile.writeFile(file, language, function (err) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: err,

                                        });
                                    } else {
                                        res.json({
                                            success: true,
                                            message: "Mobile Language Resources updated successfully...",
                                            data: err
                                        });
                                    }
                                })
                            } else {
                                res.json(NoAccessPermission);
                            }
                        });
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

module.exports = router