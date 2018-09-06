var router = express.Router();
var User = models.tbluserinformation;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var AgentRetailer = models.tblagentretailer;
var DeviceAgentRetailer = models.tbldeviceagentretailer;

router.get('/GetAllAgent', function(req, res) {
    var search = '';
    if (req.query.idApp != undefined && req.query.idApp != null && req.query.idApp != '' && req.query.idApp != 'All') {
        search = " where idApp=" + req.query.idApp;
    }
    var query = "SELECT tbluserinformation.id,tbluserinformation.email " +
        " FROM tbluserinformation" +
        " INNER JOIN tbluserinrole ON tbluserinrole.userId =tbluserinformation.id  " +
        " INNER JOIN tblrole ON tblrole.id =tbluserinrole.roleId and RoleName='Sales Agent'" +
        " INNER JOIN tblappinfo On tblappinfo.Id = tbluserinformation.idApp " + search;
    connection.query(query, function(err, response) {
        res.json(response)
    })
})

router.get('/GetAllAgentRetailer', function(req, res) {

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
        search = 'Where (tua.email like "%' + objSearch + '%" or ';
        search = search + 'tur.email like "%' + objSearch + '%" or ';
        search = search + 'tv.Name like "%' + objSearch + '%" or ';
        search = search + 'ta.AppName like "%' + objSearch + '%" or ';
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
    if (AdvanceSearch.agentId != null && AdvanceSearch.agentId != undefined && AdvanceSearch.agentId != '') {
        if (search != "") {
            search += ' and tda.agentId = "' + AdvanceSearch.agentId + '"';
        } else {
            search += ' where tda.agentId = "' + AdvanceSearch.agentId + '"';
        }
    }
    if (AdvanceSearch.retailerId != null && AdvanceSearch.retailerId != undefined && AdvanceSearch.retailerId != '') {
        if (search != "") {
            search += ' and tda.retailerId = "' + AdvanceSearch.retailerId + '"';
        } else {
            search += ' where tda.retailerId = "' + AdvanceSearch.retailerId + '"';
        }
    }

    var query = "SELECT tda.id,tda.agentId,tda.retailerId,tua.email as agent,tur.email as retailer,tv.Name,tda.deviceId,ta.AppName,tu.idApp, " +
        "CONVERT_TZ(tda.createdDatetime,'+00:00','" + CurrentOffset + "') as CreatedDate " +
        " FROM tbldeviceagentretailer tda " +
        " INNER JOIN tbluserinformation tua ON tua.id=tda.agentId" +
        " LEFT JOIN tbluserinformation tur ON tur.id=tda.retailerId" +
        " INNER JOIN tblvehicle tv ON tv.deviceid=tda.deviceId" +
        " INNER JOIN tbluserinformation tu ON tu.id = tv.iduser and tv.IsDelete=0" +
        " INNER JOIN tblappinfo ta ON ta.Id = tu.idApp " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "SELECT count(*) as TotalRecord " +
        " FROM tbldeviceagentretailer tda " +
        " INNER JOIN tbluserinformation tua ON tua.id=tda.agentId" +
        " LEFT JOIN tbluserinformation tur ON tur.id=tda.retailerId" +
        " INNER JOIN tblvehicle tv ON tv.deviceid=tda.deviceId" +
        " INNER JOIN tbluserinformation tu ON tu.id = tv.iduser and tv.IsDelete=0" +
        " INNER JOIN tblappinfo ta ON ta.Id = tu.idApp " + search;
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



router.post('/SaveAgentDeviceRetailer', jsonParser, function(req, res) {
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
                if (objdata.Id == 0) {

                } else {
                    DeviceAgentRetailer.findOne({ where: { id: objdata.id } }).then(function(objExist) {
                        if (objExist) {
                            DeviceAgentRetailer.findOne({ where: { agentId: objExist.agentId, retailerId: objExist.retailerId, deviceId: objExist.deviceId } }).then(function(objdataExist) {
                                if (objdataExist != null && objdataExist.id != objExist.id) {
                                    res.json({ success: false, message: "Device Agent retailer is already assigned...", data: objdataExist });
                                } else {
                                    objExist.updateAttributes({ retailerId: objdata.retailerId }).then(function(response) {
                                        if (response) {
                                            funAuditLog.CreateAuditLog('Assign Device Agent Retailer', UserExist.username, 'Assign Device Agent Retailer');
                                            res.json({ success: true, message: "Device agent retailer assigned successfully...", data: response });
                                        } else {
                                            res.json({ success: false, message: "Device agent retailer not assigned successfully...", data: response });
                                        }
                                    })
                                }
                            })
                        } else {
                            res.json({ success: false, message: "Device Agent is not Exist...", data: null });
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
    res.setHeader("Content-Disposition", "attachment; filename=" + "AssignDeviceAgentRetailer_Template.xlsx");
    res.end(result, 'binary');
})


router.post('/uploadExcelDevice', function(req, res) {
    var form = new formidable.IncomingForm();
    var lst = [];
    var FileName = [];
    var Importerror = [];
    var agentId = null;
    var retailerId = null;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //var FileName = __dirname + '/../MediaUploads/FileUpload/DeviceList.xlsx';
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

    form.parse(req, function(err, fields, files) {
        agentId = fields.agentId;
        retailerId = fields.retailerId;
    });

    form.on('fileBegin', function(name, file) {
        // console.log("***********************fileBegin")
        file.path = form.uploadDir + "/" + file.name;
        // console.log(file.path);
        FileName = file.path.toString();
        //FileName.push(file.path);
    });

    form.on('end', function() {
        // console.log(FileName)
        if (FileName.length > 0) {
            var workbook = XLSX.readFile(FileName, { type: 'binary' });
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            if (worksheet != null && worksheet != undefined && worksheet != '') {
                var Firstcolumn = worksheet.A1.v;
                if (Firstcolumn == "DeviceID") {
                    lst = XLSX.utils.sheet_to_json(worksheet);
                    if (lst.length > 0) {
                        function updateRetailer(i) {
                            if (i < lst.length) {
                                var deviceId = lst[i].DeviceID.trim();

                                DeviceAgentRetailer.findOne({
                                    where: { agentId: agentId, deviceId: deviceId },
                                }).then(function(response) {
                                    if (response) {
                                        // funAuditLog.CreateAuditLog('Upload SIM Data', UserExist.username, 'Cerate New SIM Data');
                                        response.updateAttributes({ retailerId: retailerId }).then(function(updatedata) {
                                            if (updatedata) {
                                                updateRetailer(i + 1);
                                            } else {
                                                Importerror.push(lst[i].deviceId);
                                                updateRetailer(i + 1);
                                            }
                                        })

                                    } else {
                                        Importerror.push(lst[i].deviceId);
                                        updateRetailer(i + 1);
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
                        updateRetailer(0)
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


router.get('/ExportAgentRetailer', function(req, res) {
    var objParam = req.query;
    var conf = {};
    conf.name = "Sheet1";
    var UserRoles = objParam.UserRoles;
    conf.cols = [];
    conf.cols.push({
        caption: 'Agent',
        type: 'string'
    });



    conf.cols.push({
        caption: 'Reatiler',
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

    // conf.cols.push({
    //     caption: 'Created Date',
    //     type: 'string'
    // });

    var objSearch = req.query.search;
    var appId = req.query.appId;
    var search = '';
    if (objSearch != null && objSearch != '') {
        search = 'Where (tua.email like "%' + objSearch + '%" or ';
        search = search + 'tur.email like "%' + objSearch + '%" or ';
        search = search + 'tv.Name like "%' + objSearch + '%" or ';
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
    if (req.query.agentId != null && req.query.agentId != undefined && req.query.agentId != '') {
        if (search != "") {
            search += ' and tda.agentId = "' + req.query.agentId + '"';
        } else {
            search += ' where tda.agentId = "' + req.query.agentId + '"';
        }
    }
    if (req.query.retailerId != null && req.query.retailerId != undefined && req.query.retailerId != '') {
        if (search != "") {
            search += ' and tda.retailerId = "' + req.query.retailerId + '"';
        } else {
            search += ' where tda.retailerId = "' + req.query.retailerId + '"';
        }
    }

    var query = "SELECT tda.id,tda.agentId,tda.retailerId,tua.email as agent,tur.email as retailer,tv.Name,tda.deviceId,ta.AppName,tu.idApp, " +
        "CONVERT_TZ(tda.createdDatetime,'+00:00','" + CurrentOffset + "') as CreatedDate " +
        " FROM tbldeviceagentretailer tda " +
        " INNER JOIN tbluserinformation tua ON tua.id=tda.agentId" +
        " LEFT JOIN tbluserinformation tur ON tur.id=tda.retailerId" +
        " INNER JOIN tblvehicle tv ON tv.deviceid=tda.deviceId" +
        " INNER JOIN tbluserinformation tu ON tu.id = tv.iduser and tv.IsDelete=0" +
        " INNER JOIN tblappinfo ta ON ta.Id = tu.idApp " + search +
        " Order by tda.createdDatetime desc";
    connection.query(query, function(err, response) {
        if (response != undefined) {
            conf.rows = [];
            // conf1.rows = [];
            // GetTrackerData(0);

            // function GetTrackerData(i) {
            for (var i = 0; i < response.length; i++) {
                var agent = '';
                var retailer = '';
                var AppName = '';
                var deviceId = '';
                var CreatedDate = '';
                // if (i < response.length) {
                var row = [];
                if (response[i].agent != null && response[i].agent != '' && response[i].agent != undefined) {
                    agent = response[i].agent;
                }

                if (response[i].retailer != null && response[i].retailer != '' && response[i].retailer != undefined) {
                    retailer = response[i].retailer;
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
                    row.push(agent, retailer, deviceId, AppName);
                } else {
                    row.push(agent, retailer, deviceId);
                }
                conf.rows.push(row);

                // GetTrackerData(i + 1);
            }
            var result = nodeExcel.execute(conf);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=AgentRetailer.xlsx");
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