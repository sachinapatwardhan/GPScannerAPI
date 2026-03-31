var router = express.Router();
var User = models.tbluserinformation;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var GPSDevice = models.tblgpsdevice;
var DeviceDistributor = models.tbldeviceagentretailer;

// ----------------------------Get Distributor User------------------------------------------------------------
router.get('/GetAllDistributor', function(req, res) {
    var search = '';
    if (req.query.idApp != undefined && req.query.idApp != null && req.query.idApp != '' && req.query.idApp != 'All') {
        search = " where idApp=" + req.query.idApp;
    }
    var query = "SELECT tbluserinformation.id,tbluserinformation.email " +
        " FROM tbluserinformation" +
        " INNER JOIN tbluserinrole ON tbluserinrole.userId =tbluserinformation.id  " +
        " INNER JOIN tblrole ON tblrole.id =tbluserinrole.roleId and RoleName='Distributor'" +
        " INNER JOIN tblappinfo On tblappinfo.Id = tbluserinformation.idApp " + search;
    connection.query(query, function(err, response) {
        res.json(response)
    })
})

// ----------------------------Get  Assign Distributor User Device------------------------------------------------------------
router.get('/GetAllAssignDistributor', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var AdvanceSearch = objParam.AdvanceSearch;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = '';
    var IsUserSuperAdmin = false;
    var IsCountryAll = false;

    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }

    var UserRoles = objParam.UserRoles;

    if (objSearch != null && objSearch != '') {
        search = 'Where (tur.email like "%' + objSearch + '%" or ';
        search = search + 'tgd.AppName like "%' + objSearch + '%" or ';
        search = search + 'tda.deviceId like "%' + objSearch + '%") ';
    };

    if (objParam.appId != null && objParam.appId != undefined && objParam.appId != '') {
        if (search != "") {
            search += ' and ta.Id = "' + objParam.appId + '"';
        } else {
            search += ' where ta.Id = "' + objParam.appId + '"';
        }
    }
    if (AdvanceSearch.idApp != null && AdvanceSearch.idApp != undefined && AdvanceSearch.idApp != '') {
        if (search != "") {
            search += ' and ta.Id = "' + AdvanceSearch.idApp + '"';
        } else {
            search += ' where ta.Id = "' + AdvanceSearch.idApp + '"';
        }
    }
    if (AdvanceSearch.idDistributor != null && AdvanceSearch.idDistributor != undefined && AdvanceSearch.idDistributor != '') {
        if (search != "") {
            search += ' and tda.idDistributor = "' + AdvanceSearch.idDistributor + '"';
        } else {
            search += ' where tda.idDistributor = "' + AdvanceSearch.idDistributor + '"';
        }
    }


    var query = "SELECT tda.id,tda.idDistributor,tur.email as Distributor,tda.deviceId,tgd.AppName,ta.Id as idApp, " +
        " CONVERT_TZ(tda.createdDatetime,'+00:00','" + CurrentOffset + "') as CreatedDate " +
        " FROM tbldeviceagentretailer tda " +
        " INNER JOIN tbluserinformation tur ON tur.id=tda.idDistributor" +
        " INNER JOIN tblgpsdevice tgd ON tgd.DeviceId=tda.deviceId" +
        " INNER JOIN tblappinfo ta ON ta.AppName = tgd.AppName " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "SELECT count(*) as TotalRecord " +
        " FROM tbldeviceagentretailer tda " +
        " INNER JOIN tbluserinformation tur ON tur.id=tda.idDistributor" +
        " INNER JOIN tblgpsdevice tgd ON tgd.DeviceId=tda.deviceId" +
        " INNER JOIN tblappinfo ta ON ta.AppName = tgd.AppName " + search;
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


// ----------------------------Save  Assign Distributor User Device------------------------------------------------------------
router.post('/SaveDeviceDistributor', jsonParser, function(req, res) {
    objdata = req.body;
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
                GPSDevice.findOne({
                    where: {
                        DeviceId: objdata.deviceId,
                        AppName: objdata.AppName
                    }
                }).then(function(resGpsDevice) {
                    if (resGpsDevice) {
                        if (objdata.id == 0) {
                            DeviceDistributor.findOne({ where: { idDistributor: objdata.idDistributor, deviceId: objdata.deviceId } }).then(function(objdataExist) {
                                if (objdataExist != null) {
                                    res.json({ success: false, message: "Device Distributor is already assigned...", data: objdataExist });
                                } else {
                                    objdata.createdDatetime = new Date();
                                    DeviceDistributor.create(objdata).then(function(response) {
                                        if (response) {
                                            funAuditLog.CreateAuditLog('Assign Device Distributor', UserExist.username, 'Assign Device Distributor');
                                            res.json({ success: true, message: "Device Distributor assigned successfully...", data: response });
                                        } else {
                                            res.json({ success: false, message: "Device Distributor not assigned successfully...", data: response });
                                        }
                                    })
                                }
                            })
                        } else {
                            DeviceDistributor.findOne({ where: { id: objdata.id } }).then(function(objExist) {
                                if (objExist) {
                                    DeviceDistributor.findOne({ where: { idDistributor: objExist.idDistributor, deviceId: objExist.deviceId } }).then(function(objdataExist) {
                                        if (objdataExist != null && objdataExist.id != objExist.id) {
                                            res.json({ success: false, message: "Device Distributor is already assigned...", data: objdataExist });
                                        } else {
                                            objExist.updateAttributes({ deviceId: objdata.deviceId, idDistributor: objdata.idDistributor, lastModifiedDatetime: new Date() }).then(function(response) {
                                                if (response) {
                                                    funAuditLog.CreateAuditLog('Assign Device Distributor', UserExist.username, 'Assign Device Distributor');
                                                    res.json({ success: true, message: "Device Distributor assigned successfully...", data: response });
                                                } else {
                                                    res.json({ success: false, message: "Device Distributor not assigned successfully...", data: response });
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    res.json({ success: false, message: "Device Distributor is not Exist...", data: null });
                                }

                            })
                        }
                    } else {
                        res.json({
                            success: false,
                            message: "Invalid Device ID., Please insert valid Device ID.",
                            data: null,
                        });
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

// ---------------------------Download Excel Template For Email------------------------------------------------------------
router.get('/DownloadTemplate', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'DeviceID',
        type: 'string'
    }, ];


    var row = [];
    for (var i = 0; i < conf.cols.length; i++) {
        row.push('');
    };
    conf.rows = [];
    conf.rows.push(row);
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "AssignDeviceDistributor_Template.xlsx");
    res.end(result, 'binary');
})

// ---------------------------Update Device For Distributor Device From Excel------------------------------------------------------------
router.post('/uploadExcelDevice', function(req, res) {
    var form = new formidable.IncomingForm();
    var lst = [];
    var FileName = [];
    var Importerror = [];
    var idDistributor = null;
    var AppName = null;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

    form.parse(req, function(err, fields, files) {
        idDistributor = fields.idDistributor;
        AppName = fields.AppName;
    });

    form.on('fileBegin', function(name, file) {
        // console.log("***********************fileBegin")
        file.path = form.uploadDir + "/" + file.name;
        // console.log(file.path);
        FileName = file.path.toString();
        
    });

    form.on('end', function() {
        if (FileName.length > 0) {
            var workbook = XLSX.readFile(FileName, { type: 'binary' });
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            if (worksheet != null && worksheet != undefined && worksheet != '') {
                var Firstcolumn = worksheet.A1.v;
                if (Firstcolumn == "DeviceID") {
                    lst = XLSX.utils.sheet_to_json(worksheet);
                    if (lst.length > 0) {
                        function ImportDataOnebyOne(i) {
                            if (i < lst.length) {
                                var deviceId = lst[i].DeviceID.trim();
                                GPSDevice.findOne({
                                    where: {
                                        DeviceId: deviceId,
                                        AppName: AppName
                                    }
                                }).then(function(resGpsDevice) {
                                    if (resGpsDevice) {
                                        DeviceDistributor.findOne({
                                            where: { idDistributor: idDistributor, deviceId: deviceId },
                                        }).then(function(response) {
                                            if (response == null) {
                                                DeviceDistributor.create({ deviceId: deviceId, idDistributor: idDistributor, createdDatetime: new Date() }).then(function(updatedata) {
                                                    if (updatedata) {
                                                        ImportDataOnebyOne(i + 1);
                                                    } else {
                                                        Importerror.push(lst[i].deviceId);
                                                        ImportDataOnebyOne(i + 1);
                                                    }
                                                })

                                            } else {
                                                Importerror.push(lst[i].deviceId);
                                                ImportDataOnebyOne(i + 1);
                                            }
                                        })
                                    } else {
                                        Importerror.push(lst[i].deviceId);
                                        ImportDataOnebyOne(i + 1);
                                    }
                                })

                            } else {
                                if (Importerror.length == 0) {
                                    res.json({
                                        success: true,
                                        message: "Excel File uploaded successfully..",
                                    });
                                } else {
                                    res.json({
                                        success: true,
                                        message: "Excel File uploaded successfully..Failed To Import : " + Importerror.length,
                                    });
                                }
                            }
                        }
                        ImportDataOnebyOne(0)
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


// ----------------------------Export Excel  Assign Distributor User Device------------------------------------------------------------
router.get('/ExportDeviceDistributor', function(req, res) {
    var objParam = req.query;
    var conf = {};
    conf.name = "Sheet1";
    var UserRoles = objParam.UserRoles;
    conf.cols = [];
    conf.cols.push({
        caption: 'Distributor',
        type: 'string'
    });

    conf.cols.push({
        caption: 'Device ID',
        type: 'string'
    });

    if (UserRoles == 'Super Admin') {
        conf.cols.push({
            caption: 'App Name',
            type: 'string'
        });
    }

    var objSearch = req.query.search;
    var appId = req.query.appId;
    var search = '';
    if (objSearch != null && objSearch != '') {
        search = 'Where (tur.email like "%' + objSearch + '%" or ';
        search = search + 'ta.AppName like "%' + objSearch + '%" or ';
        search = search + 'tda.deviceId like "%' + objSearch + '%") ';
    };

    if (appId != null && appId != undefined && appId != '') {
        if (search != "") {
            search += ' and ta.Id = "' + appId + '"';
        } else {
            search += ' where ta.Id = "' + appId + '"';
        }
    }
    if (req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != '') {
        if (search != "") {
            search += ' and ta.Id = "' + req.query.idApp + '"';
        } else {
            search += ' where ta.Id = "' + req.query.idApp + '"';
        }
    }
    if (req.query.idDistributor != null && req.query.idDistributor != undefined && req.query.idDistributor != '') {
        if (search != "") {
            search += ' and tda.idDistributor = "' + req.query.idDistributor + '"';
        } else {
            search += ' where tda.idDistributor = "' + req.query.idDistributor + '"';
        }
    }


    var query = "SELECT tda.id,tda.idDistributor,tur.email as Distributor,tda.deviceId,tgd.AppName,ta.Id as idApp, " +
        " CONVERT_TZ(tda.createdDatetime,'+00:00','" + CurrentOffset + "') as CreatedDate " +
        " FROM tbldeviceagentretailer tda " +
        " INNER JOIN tbluserinformation tur ON tur.id=tda.idDistributor" +
        " INNER JOIN tblgpsdevice tgd ON tgd.DeviceId=tda.deviceId" +
        " INNER JOIN tblappinfo ta ON ta.AppName = tgd.AppName " + search +
        " Order by tda.createdDatetime desc";
    connection.query(query, function(err, response) {
        if (response != undefined) {
            conf.rows = [];
            
            for (var i = 0; i < response.length; i++) {
                var Distributor = '';
                var AppName = '';
                var deviceId = '';
                var CreatedDate = '';
               
                var row = [];
                if (response[i].Distributor != null && response[i].Distributor != '' && response[i].Distributor != undefined) {
                    Distributor = response[i].Distributor;
                }

                if (response[i].deviceId != null && response[i].deviceId != '' && response[i].deviceId != undefined) {
                    deviceId = response[i].deviceId;
                }
                if (response[i].AppName != null && response[i].AppName != '' && response[i].AppName != undefined) {
                    AppName = response[i].AppName;
                }

                if (response[i].CreatedDate != null && response[i].CreatedDate != '' && response[i].CreatedDate != undefined) {
                    CreatedDate = moment(response[i].CreatedDate).format('DD-MM-YYYY hh:mm:ss a');
                }

                if (UserRoles == 'Super Admin') {
                    row.push(Distributor, deviceId, AppName);
                } else {
                    row.push(Distributor, deviceId);
                }
                conf.rows.push(row);

                // GetTrackerData(i + 1);
            }
            var result = nodeExcel.execute(conf);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=Distributor.xlsx");
            res.end(result, 'binary');

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



module.exports = router