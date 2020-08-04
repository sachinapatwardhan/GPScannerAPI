var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var SIM = models.tblsimdetails;
var AppInfo = models.tblappinfo;
var TelCo = models.tbltelco;
var Vehicle = models.tblvehicle;
var GPSDevice = models.tblgpsdevice;
//End of Tables
router.get('/GetSimSerialByDeviceId', function (req, res) {

    var query = " SELECT ts.SerialNum,tg.DeviceId,tg.Type,tg.AppName,tc.Country FROM" +
        " tblgpsdevice tg" +
        " INNER JOIN tblsimdetails ts ON tg.idSim= ts.id" +
        " INNER JOIN tblcountrymgmt tc ON tc.id= tg.CountryId where tg.DeviceId='" + req.query.DeviceId + "'";
    connection.query(query, function (err, response) {
        if (response != undefined) {
            res.json(response);
        } else {
            var response1 = new Object();
            res.json(response1);
        }
    });
})

router.get('/GetAllSIMInfo', function (req, res) {

    // var query = "SELECT ts.id,ts.SerialNum,ts.PhoneNum,ts.idApp,CONVERT_TZ(ts.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate, tt.Name as TelName,tt.id as idTelCo from tblsimdetails as ts LEFT JOIN tbltelco as tt ON ts.idTelCo = tt.id  ORDER BY CreatedDate DESC";
    var query = "SELECT ts.id,ts.SerialNum,ts.PhoneNum,ts.idApp,tai.AppName,CONVERT_TZ(ts.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate, tt.Name as TelName,tt.id as idTelCo from tblsimdetails as ts LEFT JOIN tbltelco as tt ON ts.idTelCo = tt.id LEFT JOIN tblappinfo tai on ts.idApp = tai.Id  ORDER BY CreatedDate DESC";
    connection.query(query, function (err, response) {
        if (response != undefined) {
            res.json(response);
        } else {
            var response1 = new Object();
            res.json(response1);
        }
    });
    // SIM.findAll({
    //     order: [
    //         ['CreatedDate', 'DESC'],
    //     ]
    // }).then(function(response) {
    //     res.json(response);
    // }).catch(function(error) {
    //     res.json(error);
    // })
});


router.get('/GetAllSIMInfoNew', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != null && objSearch != '') {
        search = ' Where (ts.SerialNum like "%' + objSearch + '%" or ';
        search = search + 'ts.PhoneNum like "%' + objSearch + '%" or ';
        search = search + 'tai.AppName like "%' + objSearch + '%" or ';
        search = search + 'ts.Status like "%' + objSearch + '%" or ';
        search = search + 'ts.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tt.Name like "%' + objSearch + '%") ';
    };

    var query = "SELECT ts.id,ts.SerialNum,ts.PhoneNum,ts.idApp,ts.Status,tai.AppName,CONVERT_TZ(ts.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate, tt.Name as TelName,tt.id as idTelCo, " +
        " CONVERT_TZ(ts.SpoilDate,'+00:00','" + CurrentOffset + "') as SpoilDate," +
        " CONVERT_TZ(ts.StartDate,'+00:00','" + CurrentOffset + "') as StartDate" +
        " from tblsimdetails as ts " +
        " LEFT JOIN tbltelco as tt ON ts.idTelCo = tt.id " +
        " LEFT JOIN tblappinfo tai on ts.idApp = tai.Id  " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var countquery = "SELECT count(*) as TotalRecord " +
        " from tblsimdetails as ts " +
        " LEFT JOIN tbltelco as tt ON ts.idTelCo = tt.id " +
        " LEFT JOIN tblappinfo tai on ts.idApp = tai.Id  " + search;
    connection.query(query, function (err, response) {
        if (response != undefined) {
            connection.query(countquery, function (err, lstCount, fields) {
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

router.post('/SaveSIMInfo', jsonParser, function (req, res) {
    objSIMInfo = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                if (objSIMInfo.Id == 0) {
                    objSIMInfo.CreatedDate = new Date();
                    // SIM.findOrCreate({ where: { AppName: objSIMInfo.AppName }, defaults: objSIMInfo }).then(function(response) {
                    // SIM.create(objSIMInfo).then(function(response) {
                    //     if (response) {
                    //         // funAuditLog.CreateAuditLog('SaveSIMInfo', decoded.username, 'Create SIMInfo');
                    //         res.json({
                    //             success: true,
                    //             message: "SIM Info created successfully...",
                    //             data: response
                    //         });
                    //     } else {
                    //         res.json({
                    //             success: false,
                    //             message: "SIM Info is already Exist...",
                    //             data: response
                    //         });
                    //     }
                    // })
                    if (objSIMInfo.Status == 'Spoil') {
                        objSIMInfo.SpoilDate = new Data()
                    }
                    SIM.findOrCreate({ where: { SerialNum: objSIMInfo.SerialNum }, defaults: objSIMInfo }).then(function (response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('Save SIM', UserExist.username, 'Cerate New SIM Data');
                            res.json({ success: true, message: "SIM Info created successfully...", data: response });
                        } else {
                            res.json({ success: false, message: "SIM Info is already Exist...", data: response });
                        }
                    })
                } else {
                    // SIM.update(objSIMInfo, {
                    //     where: {
                    //         id: objSIMInfo.Id
                    //     }
                    // }).then(function(response) {
                    //     if (response[0]) {
                    //         // funAuditLog.CreateAuditLog('SaveVehicle', decoded.username, 'Update Vehicle');
                    //         res.json({
                    //             success: true,
                    //             message: "SIM Info updated successfully...",
                    //             data: response
                    //         });
                    //     }
                    // })
                    SIM.findOne({ where: { SerialNum: objSIMInfo.SerialNum }, defaults: objSIMInfo }).then(function (objSimsExist) {
                        if (objSimsExist != null && objSIMInfo.Id != objSimsExist.id) {
                            res.json({ success: false, message: "SIM Info is already Exist...", data: objSimsExist });
                        } else {
                            SIM.findOne({ where: { id: objSIMInfo.Id } }).then(function (resSimsExist) {
                                var Status = resSimsExist.Status;
                                if (Status != 'Spoil' && objSIMInfo.Status == 'Spoil') {
                                    objSIMInfo.SpoilDate = new Date()
                                }
                                SIM.update(objSIMInfo, { where: { id: objSIMInfo.Id } }).then(function (response) {
                                    if (response[0]) {
                                        funAuditLog.CreateAuditLog('Update SIM', UserExist.username, 'Update SIM Data');
                                        res.json({ success: true, message: "SIM Info updated successfully...", data: response });
                                    } else {
                                        res.json({ success: false, message: "SIM Info not updated successfully...", data: response });
                                    }
                                })
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

router.get('/DeleteSIMInfo', function (req, res) {
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
        }).then(function (UserExist) {
            if (UserExist != null) {
                if (req.query.Id != '' && req.query.Id != null) {

                    SIM.destroy({
                        where: {
                            id: req.query.Id
                        }
                    }).then(function (response) {
                        if (response) {
                            funAuditLog.CreateAuditLog('DeleteSIM', UserExist.username, 'Delete SIM');
                            res.json({
                                success: true,
                                message: "SIM deleted successfully...",
                                data: response
                            });
                        } else {
                            res.json(RecordNotFound);
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: "Select SIm To delete",
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

router.get('/DownloadTemplate', function (req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'SerialNumber',
        type: 'string'
    }, {
        caption: 'PhoneNumber',
        type: 'string'
    }];


    var row = [];
    for (var i = 0; i < conf.cols.length; i++) {
        row.push('');
    };
    conf.rows = [];
    conf.rows.push(row);
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "SIM_Template.xlsx");
    res.end(result, 'binary');
})

router.post('/uploadExcelDevice', function (req, res) {
    var form = new formidable.IncomingForm();
    var lst = [];
    var FileName = [];
    var Importerror = [];
    var idTelCo = null;
    var idApp = null;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //var FileName = __dirname + '/../MediaUploads/FileUpload/DeviceList.xlsx';
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

    form.parse(req, function (err, fields, files) {
        idTelCo = fields.idTelCo;
        idApp = fields.idApp;
    });

    form.on('fileBegin', function (name, file) {
        // console.log("***********************fileBegin")
        file.path = form.uploadDir + "/" + file.name;
        // console.log(file.path);
        FileName = file.path.toString();
        //FileName.push(file.path);
    });

    form.on('end', function () {
        // console.log(FileName)
        if (FileName.length > 0) {
            var workbook = XLSX.readFile(FileName, { type: 'binary' });
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            if (worksheet != null && worksheet != undefined && worksheet != '') {
                var Firstcolumn = worksheet.A1.v;
                if (Firstcolumn == "SerialNumber") {
                    lst = XLSX.utils.sheet_to_json(worksheet);
                    if (lst.length > 0) {
                        function addSIm(i) {
                            if (i < lst.length) {
                                var obj = new Object();
                                obj.SerialNum = lst[i].SerialNumber.trim();
                                if (lst[i].PhoneNumber != null && lst[i].PhoneNumber != undefined) {
                                    obj.PhoneNum = lst[i].PhoneNumber.trim();
                                } else {
                                    obj.PhoneNum = null;
                                }

                                if (idTelCo != null && idTelCo != 'null') {
                                    obj.idTelCo = idTelCo;
                                }
                                if (idApp != null && idApp != 'null') {
                                    obj.idApp = idApp;
                                }
                                obj.CreatedDate = new Date();

                                SIM.findOrCreate({
                                    where: { SerialNum: obj.SerialNum },
                                    defaults: obj
                                }).then(function (response) {
                                    if ((response[1])) {
                                        // funAuditLog.CreateAuditLog('Upload SIM Data', UserExist.username, 'Cerate New SIM Data');
                                        addSIm(i + 1);
                                    } else {
                                        SIM.update(obj, { where: { id: response[0].id } }).then(function (resUpdateSim) {
                                            // Importerror.push(lst[i].SerialNumber);
                                            addSIm(i + 1);
                                        });
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
                        addSIm(0)
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

router.get('/Export', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'SerialNumber',
        type: 'string'
    },
    {
        caption: 'PhoneNumber',
        type: 'string'
    }, {
        caption: 'Telephone Company',
        type: 'string'
    },
    {
        caption: 'CreatedDate',
        type: 'string'
    },
    {
        caption: 'App Name',
        type: 'string'
    }

    ];
    // SIM.findAll({
    //     order: [
    //         ['CreatedDate', 'DESC'],
    //     ]
    // }).then(function(response) {
    var query = "  SELECT ts.id,ts.SerialNum,ts.PhoneNum,ts.idApp,tai.AppName,CONVERT_TZ(ts.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate, tt.Name as TelName,tt.id as idTelCo from tblsimdetails as ts LEFT JOIN tbltelco as tt ON ts.idTelCo = tt.id LEFT JOIN tblappinfo tai on ts.idApp = tai.Id  ORDER BY CreatedDate DESC"
    // var query = "SELECT ts.id,ts.SerialNum,ts.PhoneNum,CONVERT_TZ(ts.CreatedDate,'+00:00','" + req.query.CurrentOffset + "') as CreatedDate, tt.Name as TelName from tblsimdetails as ts LEFT JOIN tbltelco as tt ON ts.idTelCo = tt.id ORDER BY CreatedDate DESC";
    connection.query(query, function (err, response) {
        conf.rows = [];
        if (response.length > 0) {
            function setdata(i) {
                if (i < response.length) {
                    var row = [];
                    var SerialNumber = '';
                    var PhoneNumber = '';
                    var CreatedDate = '';
                    var TelName = '';
                    var AppName = '';
                    if (response[i].SerialNum != null && response[i].SerialNum != undefined && response[i].SerialNum != '') {
                        SerialNumber = response[i].SerialNum.toString();
                    } else {
                        SerialNumber = "";
                    }
                    if (response[i].PhoneNum != null && response[i].PhoneNum != undefined && response[i].PhoneNum != '') {
                        PhoneNumber = response[i].PhoneNum.toString();
                    } else {
                        PhoneNumber = "";
                    }
                    if (response[i].TelName != null && response[i].TelName != undefined && response[i].TelName != '') {
                        TelName = response[i].TelName.toString();
                    } else {
                        TelName = "";
                    }

                    if (response[i].CreatedDate != null && response[i].CreatedDate != undefined && response[i].CreatedDate != '') {
                        CreatedDate = moment(moment.utc(response[i].CreatedDate).toDate()).format("DD-MM-YYYY hh:mm a");
                        //convertdateformat(response[i].CreatedDate, "Excel Export");
                    } else {
                        CreatedDate = "";
                    }
                    if (response[i].AppName != null && response[i].AppName != undefined && response[i].AppName != '') {
                        AppName = response[i].AppName;
                    } else {
                        AppName = "";
                    }
                    row.push(SerialNumber, PhoneNumber, TelName, CreatedDate, AppName);

                    conf.rows.push(row);

                    setdata(i + 1);
                } else {
                    var result = nodeExcel.execute(conf);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    res.setHeader("Content-Disposition", "attachment; filename=" + "SIM.xlsx");
                    res.end(result, 'binary');

                }
            }
            setdata(0);
        } else {
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + "SIM.xlsx");
            res.end(result, 'binary');
        }
    });
});

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
    } else if (flg == "Excel Export") {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
    } else if (flg == 2) {
        return ("00" + firstdayDay.toString()).slice(-2) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayYear.toString()).slice(-4);
    } else {
        //return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}

var SocketClientModule = require('socket.io-client');
router.get('/CheckSimDetail', function (req, res) {
    req.setTimeout(3600000);
    var objdata = req.query;
    var socClient = new SocketClientModule(process.env.MaarkNotifyUrl);
    var Data = JSON.stringify(objdata);
    var Sendflag = false;
    console.log("Command Send", Data)
    io.sockets.emit('emit_from_server', Data);
    io.sockets.emit('SimDetailRequest', Data);
    setTimeout(function () {
        if (Sendflag == false) {
            console.log("Socket Timeout")
            res.json({ success: false, message: 'Socket not connected. Try after 5 minute.' });
            socClient.disconnect();
        };
    }, 60000)
    socClient.on('SimDetailResponse', function (data) {
        var line = data.toString();
        try {
            var objResData = JSON.parse(line);
            console.log(line);
            if (objResData.simcardnumber == objdata.SerialNum) {
                Sendflag = true;
                // if (objResData.status == 'ACTIVE') {
                res.json({ success: true, data: objResData });
                //} else {
                //res.json({ success: false, message: 'Sim Status is InActive.', data: objResData });
                //}
                socClient.disconnect(); // kill client after server's response
            }
        } catch (ex) {

        }
    });
});

router.get('/GetFullSimSerialByDeviceId', function (req, res) {
    var query = " SELECT ts.SerialNum,ts.PhoneNum,ts.Status as SimStatus,tg.Status as DeviceStatus,tsuVehicle.email as VehicleUser,CONVERT_TZ(tsuVehicle.LastLogin,'+00:00','" + CurrentOffset + "') as LastLogin,tg.DeviceId,tg.Type,tg.AppName,tc.Country,IFNULL(tsu.email,tsu2.email) as SalesAgent,tsu1.email as Distributor,CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate,CONVERT_TZ(tv.HandshakDatetime,'+00:00','" + CurrentOffset + "') as LastHandshake,CONVERT_TZ(tg.CreatedDate,'+00:00','" + CurrentOffset + "') as GPSCreatedDate,CASE WHEN tl.CreatedDate is not null then CONVERT_TZ(tl.CreatedDate,'+00:00','" + CurrentOffset + "') else CONVERT_TZ(tv.CreatedDate,'+00:00','" + CurrentOffset + "') end as CreatedDate,CASE WHEN tl.id is null then false else true END as IsLicenceHave,tl.LicenceNo FROM" +
        " tblgpsdevice tg" +
        " left JOIN tblsimdetails ts ON tg.idSim= ts.id" +
        " left JOIN tbllicencemanager tl ON tg.DeviceId= tl.DeviceId" +
        " left JOIN tblvehicle tv ON tg.DeviceId= tv.deviceid and tv.IsDelete=0" +
        " left JOIN tbluserinformation tsuVehicle ON tsuVehicle.id= tv.iduser" +
        " left JOIN tbluserinformation tsu2 ON tsu2.id= tg.idSalesAgent" +
        " left JOIN tbldeviceagentretailer tdr ON tdr.deviceId= tg.DeviceId" +
        " left JOIN tbluserinformation tsu ON tsu.id= tdr.agentId" +
        " left JOIN tbluserinformation tsu1 ON tsu1.id= tdr.idDistributor" +
        " left JOIN tblcountrymgmt tc ON tc.id= tg.CountryId where tg.DeviceId='" + req.query.DeviceId + "'";
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].ExpiryDate != null) {
                    response[i].ExpiryDate = convertdateformat(response[i].ExpiryDate, 'Excel Export');
                }
                if (response[i].CreatedDate != null) {
                    response[i].CreatedDate = convertdateformat(response[i].CreatedDate, 'Excel Export');
                }
                if (response[i].LastHandshake != null) {
                    response[i].LastHandshake = convertdateformat(response[i].LastHandshake, 'Excel Export');
                }
                if (response[i].GPSCreatedDate != null) {
                    response[i].GPSCreatedDate = convertdateformat(response[i].GPSCreatedDate, 'Excel Export');
                }
                if (response[i].LastLogin != null) {
                    response[i].LastLogin = convertdateformat(response[i].LastLogin, 'Excel Export');
                }
            }
            res.json(response);
        } else {
            res.json([]);
        }
    });
})

router.get('/GetFullDeviceBySimSerial', function (req, res) {
    var query = " SELECT ts.SerialNum,ts.PhoneNum,ts.Status as SimStatus,tg.Status as DeviceStatus,tsuVehicle.email as VehicleUser,CONVERT_TZ(tsuVehicle.LastLogin,'+00:00','" + CurrentOffset + "') as LastLogin,tg.DeviceId,tg.Type,tg.AppName,tc.Country,IFNULL(tsu.email,tsu2.email) as SalesAgent,tsu1.email as Distributor,CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate,CONVERT_TZ(tv.HandshakDatetime,'+00:00','" + CurrentOffset + "') as LastHandshake,CONVERT_TZ(tg.CreatedDate,'+00:00','" + CurrentOffset + "') as GPSCreatedDate,CASE WHEN tl.CreatedDate is not null then CONVERT_TZ(tl.CreatedDate,'+00:00','" + CurrentOffset + "') else CONVERT_TZ(tv.CreatedDate,'+00:00','" + CurrentOffset + "') end as CreatedDate,CASE WHEN tl.id is null then false else true END as IsLicenceHave,tl.LicenceNo FROM" +
        " tblgpsdevice tg" +
        " left JOIN tblsimdetails ts ON tg.idSim= ts.id" +
        " left JOIN tbllicencemanager tl ON tg.DeviceId= tl.DeviceId" +
        " left JOIN tblvehicle tv ON tg.DeviceId= tv.deviceid and tv.IsDelete=0" +
        " left JOIN tbluserinformation tsuVehicle ON tsuVehicle.id= tv.iduser" +
        " left JOIN tbluserinformation tsu2 ON tsu2.id= tg.idSalesAgent" +
        " left JOIN tbldeviceagentretailer tdr ON tdr.deviceId= tg.DeviceId" +
        " left JOIN tbluserinformation tsu ON tsu.id= tdr.agentId" +
        " left JOIN tbluserinformation tsu1 ON tsu1.id= tdr.idDistributor" +
        " left JOIN tblcountrymgmt tc ON tc.id= tg.CountryId where ts.SerialNum='" + req.query.Sim + "'";
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].ExpiryDate != null) {
                    response[i].ExpiryDate = convertdateformat(response[i].ExpiryDate, 'Excel Export');
                }
                if (response[i].CreatedDate != null) {
                    response[i].CreatedDate = convertdateformat(response[i].CreatedDate, 'Excel Export');
                }
                if (response[i].LastHandshake != null) {
                    response[i].LastHandshake = convertdateformat(response[i].LastHandshake, 'Excel Export');
                }
                if (response[i].GPSCreatedDate != null) {
                    response[i].GPSCreatedDate = convertdateformat(response[i].GPSCreatedDate, 'Excel Export');
                }
                if (response[i].LastLogin != null) {
                    response[i].LastLogin = convertdateformat(response[i].LastLogin, 'Excel Export');
                }
            }
            res.json(response);
        } else {
            res.json([]);
        }
    });
})

router.get('/GetFullDeviceByVehicle', function (req, res) {
    var query = " SELECT ts.SerialNum,ts.PhoneNum,ts.Status as SimStatus,tg.Status as DeviceStatus,tsuVehicle.email as VehicleUser,CONVERT_TZ(tsuVehicle.LastLogin,'+00:00','" + CurrentOffset + "') as LastLogin,tg.DeviceId,tg.Type,tg.AppName,tc.Country,IFNULL(tsu.email,tsu2.email) as SalesAgent,tsu1.email as Distributor,CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate,CONVERT_TZ(tv.HandshakDatetime,'+00:00','" + CurrentOffset + "') as LastHandshake,CONVERT_TZ(tg.CreatedDate,'+00:00','" + CurrentOffset + "') as GPSCreatedDate,CASE WHEN tl.CreatedDate is not null then CONVERT_TZ(tl.CreatedDate,'+00:00','" + CurrentOffset + "') else CONVERT_TZ(tv.CreatedDate,'+00:00','" + CurrentOffset + "') end as CreatedDate,CASE WHEN tl.id is null then false else true END as IsLicenceHave,tl.LicenceNo FROM" +
        " tblgpsdevice tg" +
        " left JOIN tblsimdetails ts ON tg.idSim= ts.id" +
        " left JOIN tbllicencemanager tl ON tg.DeviceId= tl.DeviceId" +
        " left JOIN tblvehicle tv ON tg.DeviceId= tv.deviceid and tv.IsDelete=0" +
        " left JOIN tbluserinformation tsuVehicle ON tsuVehicle.id= tv.iduser" +
        " left JOIN tbluserinformation tsu2 ON tsu2.id= tg.idSalesAgent" +
        " left JOIN tbldeviceagentretailer tdr ON tdr.deviceId= tg.DeviceId" +
        " left JOIN tbluserinformation tsu ON tsu.id= tdr.agentId" +
        " left JOIN tbluserinformation tsu1 ON tsu1.id= tdr.idDistributor" +
        " left JOIN tblcountrymgmt tc ON tc.id= tg.CountryId where tv.Name like '%" + req.query.Vehicle + "%'";
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].ExpiryDate != null) {
                    response[i].ExpiryDate = convertdateformat(response[i].ExpiryDate, 'Excel Export');
                }
                if (response[i].CreatedDate != null) {
                    response[i].CreatedDate = convertdateformat(response[i].CreatedDate, 'Excel Export');
                }
                if (response[i].LastHandshake != null) {
                    response[i].LastHandshake = convertdateformat(response[i].LastHandshake, 'Excel Export');
                }
                if (response[i].GPSCreatedDate != null) {
                    response[i].GPSCreatedDate = convertdateformat(response[i].GPSCreatedDate, 'Excel Export');
                }
                if (response[i].LastLogin != null) {
                    response[i].LastLogin = convertdateformat(response[i].LastLogin, 'Excel Export');
                }
            }
            res.json(response);
        } else {
            res.json([]);
        }
    });
})

router.get('/GetOrderRenewByDevice', function (req, res) {
    var query = "SELECT * FROM tblorderservice where OrderNotes like '%" + req.query.DeviceId + "%' order by id desc;";
    connection.query(query, function (err, response) {
        if (!err) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].CreatedOnUtc != null) {
                    response[i].CreatedOnUtc = convertdateformat(response[i].CreatedOnUtc, 'Excel Export');
                }
            }
        }
        res.json(response);
    });
})

router.get('/GetDeviceBySimSerial', function (req, res) {
    var query = "select group_concat(tgd.DeviceId) as Deviceids from tblsimdetails ts inner join tblgpsdevice tgd on ts.id=tgd.idSim where ts.SerialNum='" + req.query.SerialNum + "'";
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            res.json(response[0].Deviceids);
        } else {
            res.json('');
        }
    });
})

router.get('/AttachSimMDetail', function (req, res) {
    var ChedkSim = "Select * from tblgpsdevice tg inner join tblsimdetails ts on ts.id=tg.idSim where ts.SerialNum='" + req.query.Sim + "'";
    connection.query(ChedkSim, function (err, response) {
        if (!err) {
            if (response.length > 0) {
                res.json({ success: false, message: 'This Sim already attached. try with different sim' });
            } else {
                var GetSim = "Select * from tblsimdetails where SerialNum='" + req.query.Sim + "'";
                connection.query(GetSim, function (err, resSim) {
                    if (!err) {
                        if (resSim.length > 0) {
                            GPSDevice.findOne({ where: { DeviceId: req.query.DeviceId, } }).then(function (DeviceIdExist) {
                                if (DeviceIdExist) {
                                    var UpdateSim = "Update tblgpsdevice set idSim=" + resSim[0].id + " where DeviceId='" + req.query.DeviceId + "'";
                                    connection.query(UpdateSim, function (err, resSimAttach) {
                                        res.json({ success: true, message: 'Sim attach with device successfully.' })
                                    });
                                } else {
                                    res.json({ success: false, message: 'This Device not registered. Try wirth different Device or register from admin side.' })
                                }
                            })
                        } else {
                            res.json({ success: false, message: 'This Sim not registered. Try wirth different sim or register from admin side.' });
                        }
                    } else {
                        res.json({ success: false, message: 'Something went wrong. Try again later.' });
                    }
                });
            }
        } else {
            res.json({ success: false, message: 'Something went wrong. Try again later.' });
        }
    });
})

router.get('/GetVehicleDetail', function (req, res) {
    var query = `SELECT *,
                    CONVERT_TZ(tv.renewaldate,
                            '+00:00',
                            '" + CurrentOffset + "') AS ExpiryDate,
                    CONVERT_TZ(tv.CreatedDate,
                            '+00:00',
                            '" + CurrentOffset + "') AS DisplayCreatedDate,
                    CONVERT_TZ(tv.HandshakDatetime,
                            '+00:00',
                            '" + CurrentOffset + "') AS LastHandshake
                FROM
                    tblvehicle tv
                        INNER JOIN
                    tbluserinformation tu ON tu.id = tv.iduser
                WHERE
                    tu.email = '` + req.query.Email + `' AND tv.IsDelete = FALSE;`

    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].ExpiryDate != null) {
                    response[i].ExpiryDate = convertdateformat(response[i].ExpiryDate, 'Excel Export');
                }
                if (response[i].DisplayCreatedDate != null) {
                    response[i].DisplayCreatedDate = convertdateformat(response[i].DisplayCreatedDate, 'Excel Export');
                }
                if (response[i].LastHandshake != null) {
                    response[i].LastHandshake = convertdateformat(response[i].LastHandshake, 'Excel Export');
                }
            }
            res.json(response);
        } else {
            res.json([]);
        }
    });
})

router.get('/GetExpiryByDeviceID', function (req, res) {
    var query = "select CONVERT_TZ(renewaldate,'+00:00','" + CurrentOffset + "') as ExpiryDate,CONVERT_TZ(CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate from tblvehicle where deviceid='" + req.query.DeviceId + "' and IsDelete=false;";
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            var obj = new Object();
            obj.ExpiryDate = convertdateformat(response[0].ExpiryDate, 'Excel Export');
            obj.CreatedDate = convertdateformat(response[0].CreatedDate, 'Excel Export');
            res.json(obj);
        } else {
            res.json({});
        }
    });
})

router.get('/GetFirstGPSDataByDeviceID', function (req, res) {
    var query = "select * from tblgpsdata where DeviceId='" + req.query.DeviceId + "' order by Date limit 1;";
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            var obj = new Object();
            obj.IsEngine = response[0].IsEngine;
            obj.Latitude = response[0].Latitude;
            obj.Longitude = response[0].Longitude;
            obj.Date = response[0].Date;
            obj.DisplayDate = convertdateformat(new Date(response[0].Date * 1000), 'Excel Export');
            obj.Speed = response[0].Speed;
            obj.Direction = response[0].Direction;
            obj.OdoMeter = response[0].OdoMeter;
            obj.AD1 = response[0].AD1;
            obj.AD2 = response[0].AD2;
            obj.IsWiringForAntiTamper = response[0].IsWiringForAntiTamper;
            res.json(obj);
        } else {
            res.json({});
        }
    });
})

router.get('/GetDeviceExpiryBySimSerial', function (req, res) {
    var query = "select tgd.DeviceId,CONVERT_TZ(tv.renewaldate,'+00:00','" + CurrentOffset + "') as ExpiryDate,CONVERT_TZ(tv.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate from tblsimdetails ts inner join tblgpsdevice tgd on ts.id=tgd.idSim left join tblvehicle tv on tv.deviceid=tgd.DeviceId where ts.SerialNum='" + req.query.SerialNum + "'";
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            var obj = new Object();
            var Deviceids = '';
            var ExpiryDate = '';
            var CreatedDate = '';
            for (var i = 0; i < response.length; i++) {
                if (response[i].ExpiryDate != null) {
                    var ExDate = convertdateformat(response[i].ExpiryDate, 'Excel Export');
                } else {
                    var ExDate = 'N/A';
                }
                if (response[i].CreatedDate != null) {
                    var CrDate = convertdateformat(response[i].CreatedDate, 'Excel Export');
                } else {
                    var CrDate = 'N/A';
                }
                if (Deviceids == '') {
                    Deviceids = Deviceids + response[i].DeviceId;

                    ExpiryDate = ExpiryDate + ExDate;
                    CreatedDate = CreatedDate + CrDate;
                } else {
                    Deviceids = Deviceids + ',' + response[i].DeviceId;
                    ExpiryDate = ExpiryDate + ',' + ExDate;
                    CreatedDate = CreatedDate + ',' + CrDate;
                }
            }
            obj.Deviceids = Deviceids;
            obj.ExpiryDate = ExpiryDate;
            obj.CreatedDate = CreatedDate;
            res.json(obj);
        } else {
            res.json({});
        }
    });
})

router.get('/ExportWithSalesAgent', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'DeviceId',
        type: 'string'
    },
    {
        caption: 'SalesAgent',
        type: 'string'
    }];

    // var query = " SELECT tda.deviceId,tu.email FROM tbldeviceagentretailer tda inner join tbluserinformation tu on tu.id=tda.agentId where agentId is not null;"
    var query = "select tg.deviceId,tu.email from tblgpsdevice tg left join tbldeviceagentretailer tds on tg.DeviceId=tds.deviceId left join tbluserinformation tu on tds.agentId=tu.id;"
    connection.query(query, function (err, response) {
        conf.rows = [];
        if (response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                var row = [];
                var DeviceId = '';
                var SalesAgent = '';
                if (response[i].deviceId != null && response[i].deviceId != undefined && response[i].deviceId != '') {
                    DeviceId = response[i].deviceId.toString();
                }
                if (response[i].email != null && response[i].email != undefined && response[i].email != '') {
                    SalesAgent = response[i].email.toString();
                }
                row.push(DeviceId, SalesAgent);
                conf.rows.push(row);
            }
        }
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=DeviceWithSalesAgent.xlsx");
        res.end(result, 'binary');
    });
});

router.get('/ExportWithoutSalesAgent', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'DeviceId',
        type: 'string'
    },
    {
        caption: 'SalesAgent',
        type: 'string'
    }];

    var query = " select deviceId from tblgpsdevice where deviceId not in (select deviceId from tbldeviceagentretailer where agentId is not null);"
    connection.query(query, function (err, response) {
        conf.rows = [];
        if (response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                var row = [];
                var DeviceId = '';
                var SalesAgent = '';
                if (response[i].deviceId != null && response[i].deviceId != undefined && response[i].deviceId != '') {
                    DeviceId = response[i].deviceId.toString();
                }

                row.push(DeviceId, SalesAgent);
                conf.rows.push(row);
            }
        }
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=DeviceWithOutSalesAgent.xlsx");
        res.end(result, 'binary');
    });
});

router.get('/DetachSimTracker', function (req, res) {
    GPSDevice.findOne({
        where: {
            DeviceId: req.query.DeviceId,
        }
    }).then(function (ObjExist) {
        if (ObjExist) {
            ObjExist.updateAttributes({
                idSim: null,
            }).then(function (response) {
                if (response) {
                    funAuditLog.CreateAuditLog('Detach Sim Tracker', 'Direct URL', 'update tracker SIM: (' + ObjExist.DeviceId + ')');
                    res.json({ success: true, message: "Tracker detached successfully." });
                } else {
                    res.json({ success: false, message: "Tacker not detached." })
                }
            })
        } else {
            res.json({ success: false, message: "Invalid GPS Device." });
        }
    })
})

router.get('/ExportSimExport', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'SerialNum',
        type: 'string'
    },
    {
        caption: 'Deviceids',
        type: 'string'
    },
    {
        caption: 'AppName',
        type: 'string'
    }];

    var query = " SELECT ts.SerialNum,group_concat(tg.DeviceId) as Deviceids,group_concat(tg.AppName) as AppName FROM tblsimdetails ts left join tblgpsdevice tg on ts.id=tg.idSim group by ts.id;"
    connection.query(query, function (err, response) {
        conf.rows = [];
        if (response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                var row = [];
                var SerialNum = '';
                var DeviceId = '';
                var AppName = '';
                if (response[i].Deviceids != null && response[i].Deviceids != undefined && response[i].Deviceids != '') {
                    DeviceId = response[i].Deviceids.toString();
                }

                if (response[i].SerialNum != null && response[i].SerialNum != undefined && response[i].SerialNum != '') {
                    SerialNum = response[i].SerialNum.toString();
                }

                if (response[i].AppName != null && response[i].AppName != undefined && response[i].AppName != '') {
                    AppName = response[i].AppName.toString();
                }

                row.push(SerialNum, DeviceId, AppName);
                conf.rows.push(row);
            }
        }
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=SimExport.xlsx");
        res.end(result, 'binary');
    });
});

router.get('/ExportSimMultiDeviceExport', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'SerialNum',
        type: 'string'
    },
    {
        caption: 'Deviceids',
        type: 'string'
    },
    {
        caption: 'AppName',
        type: 'string'
    }];

    var query = `SELECT 
                    ts.SerialNum,
                    GROUP_CONCAT(tg.DeviceId) AS Deviceids,
                    GROUP_CONCAT(tg.AppName) AS AppName,
                    Count(tg.id) as TotalDevice
                FROM
                    tblsimdetails ts
                        LEFT JOIN
                    tblgpsdevice tg ON ts.id = tg.idSim
                GROUP BY ts.id
                order by TotalDevice desc;`;
    connection.query(query, function (err, response) {
        conf.rows = [];
        if (response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].TotalDevice > 1) {
                    var row = [];
                    var SerialNum = '';
                    var DeviceId = '';
                    var AppName = '';
                    if (response[i].Deviceids != null && response[i].Deviceids != undefined && response[i].Deviceids != '') {
                        DeviceId = response[i].Deviceids.toString();
                    }

                    if (response[i].SerialNum != null && response[i].SerialNum != undefined && response[i].SerialNum != '') {
                        SerialNum = response[i].SerialNum.toString();
                    }

                    if (response[i].AppName != null && response[i].AppName != undefined && response[i].AppName != '') {
                        AppName = response[i].AppName.toString();
                    }

                    row.push(SerialNum, DeviceId, AppName);
                    conf.rows.push(row);
                }
            }
        }
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=SimMultiDeviceExport.xlsx");
        res.end(result, 'binary');
    });
});

router.get('/ExportNoSimNoAppDeviceExport', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'SerialNum',
        type: 'string'
    },
    {
        caption: 'DeviceId',
        type: 'string'
    },
    {
        caption: 'AppName',
        type: 'string'
    },
    {
        caption: 'Country',
        type: 'string'
    }];

    var query = `SELECT 
                    DeviceId, IMEI, tg.AppName, ts.SerialNum, tc.Country
                FROM
                    tblgpsdevice tg
                        LEFT JOIN
                    tblcountrymgmt tc ON tc.id = tg.CountryId
                        LEFT JOIN
                    tblsimdetails ts ON ts.id = tg.idSim
                WHERE
                    idSim IS NULL OR AppName IS NULL;`;
    connection.query(query, function (err, response) {
        conf.rows = [];
        if (response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                var row = [];
                var SerialNum = '';
                var DeviceId = '';
                var AppName = '';
                var Country = '';
                if (response[i].DeviceId != null && response[i].DeviceId != undefined && response[i].DeviceId != '') {
                    DeviceId = response[i].DeviceId.toString();
                }

                if (response[i].SerialNum != null && response[i].SerialNum != undefined && response[i].SerialNum != '') {
                    SerialNum = response[i].SerialNum.toString();
                }

                if (response[i].AppName != null && response[i].AppName != undefined && response[i].AppName != '') {
                    AppName = response[i].AppName.toString();
                }

                if (response[i].Country != null && response[i].Country != undefined && response[i].Country != '') {
                    Country = response[i].Country.toString();
                }

                row.push(SerialNum, DeviceId, AppName, Country);
                conf.rows.push(row);
            }
        }
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=NoSimExport.xlsx");
        res.end(result, 'binary');
    });
});

router.get('/ExportKCDevice', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'SerialNum',
        type: 'string'
    },
    {
        caption: 'DeviceId',
        type: 'string'
    },
    {
        caption: 'AppName',
        type: 'string'
    },
    {
        caption: 'SalesAgent',
        type: 'string'
    }];

    var query = `SELECT 
                    ts.SerialNum,
                    ts.PhoneNum,
                    tg.DeviceId,
                    tg.AppName,
                    IFNULL(tsu.email, tsu2.email) AS SalesAgent
                FROM
                    tblgpsdevice tg
                        LEFT JOIN
                    tblsimdetails ts ON tg.idSim = ts.id
                        LEFT JOIN
                    tbluserinformation tsu2 ON tsu2.id = tg.idSalesAgent
                        LEFT JOIN
                    tbldeviceagentretailer tdr ON tdr.deviceId = tg.DeviceId
                        LEFT JOIN
                    tbluserinformation tsu ON tsu.id = tdr.agentId
                WHERE
                    (tsu.email = 'kclim7@yahoo.com'
                        OR tsu.email = 'kclim_maark@salesagent.com'
                        OR tsu.email = 'kclim_navy@salesagent.com'
                        OR tsu2.email = 'kclim7@yahoo.com'
                        OR tsu2.email = 'kclim_maark@salesagent.com'
                        OR tsu2.email = 'kclim_navy@salesagent.com');`;
    connection.query(query, function (err, response) {
        conf.rows = [];
        if (response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                var row = [];
                var SerialNum = '';
                var DeviceId = '';
                var AppName = '';
                var SalesAgent = '';
                if (response[i].DeviceId != null && response[i].DeviceId != undefined && response[i].DeviceId != '') {
                    DeviceId = response[i].DeviceId.toString();
                }

                if (response[i].SerialNum != null && response[i].SerialNum != undefined && response[i].SerialNum != '') {
                    SerialNum = response[i].SerialNum.toString();
                }

                if (response[i].AppName != null && response[i].AppName != undefined && response[i].AppName != '') {
                    AppName = response[i].AppName.toString();
                }

                if (response[i].SalesAgent != null && response[i].SalesAgent != undefined && response[i].SalesAgent != '') {
                    SalesAgent = response[i].SalesAgent.toString();
                }

                row.push(SerialNum, DeviceId, AppName, SalesAgent);
                conf.rows.push(row);
            }
        }
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=KCDevice.xlsx");
        res.end(result, 'binary');
    });
});

router.get('/UpdateManualSimStatus', function (req, res) {
    if (req.query.secret == 'XjZ9A7Wasr82pQr8') {
        SIM.findOne({
            where: {
                SerialNum: req.query.SerialSerial,
            }
        }).then(function (ObjExist) {
            if (ObjExist) {
                ObjExist.updateAttributes({
                    Status: 'Terminate',
                }).then(function (response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('Update Sim Manual', 'Direct URL', 'update tracker SIM: (' + req.query.SerialSerial + ')');
                        res.json("OK");
                    } else {
                        res.json("Can Not Update")
                    }
                })
            } else {
                res.json("Invalid Sim Serial.");
            }
        })
    } else {
        res.json("Invalid URL.");
    }
})

router.get('/GetExpiredDeviceNoSimTerminate', function (req, res) {
    var OrderBy = req.query.OrderBy;
    var query = `SELECT 
                    tg.DeviceId,
                    tg.AppName,
                    tc.Country,
                    CONVERT_TZ(tl.ExpiryDate, '+00:00', '` + CurrentOffset + `') AS ExpiryDate,
                    ts.SerialNum,
                    ts.PhoneNum
                FROM
                    tblgpsdevice tg
                        LEFT JOIN
                    tblcountrymgmt tc ON tc.id = tg.CountryId
                        INNER JOIN
                    tblsimdetails ts ON tg.idSim = ts.id
                        INNER JOIN
                    tbllicencemanager tl ON tg.DeviceId = tl.DeviceId
                WHERE
                    tl.ExpiryDate < NOW() and (ts.Status!='Terminate' or ts.Status is null)
                    ORDER BY `+ OrderBy + `;`;
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].ExpiryDate != null) {
                    response[i].ExpiryDate = convertdateformat(response[i].ExpiryDate, 'Excel Export');
                }
            }
            res.json(response);
        } else {
            res.json([]);
        }
    });
})

router.get('/GetExpiredDeviceIn30Days', function (req, res) {
    var query = `SELECT 
                    tg.DeviceId,
                    tg.AppName,
                    tc.Country,
                    CONVERT_TZ(tl.ExpiryDate, '+00:00', '` + CurrentOffset + `') AS ExpiryDate
                FROM
                    tblgpsdevice tg
                        LEFT JOIN
                    tblcountrymgmt tc ON tc.id = tg.CountryId
                        INNER JOIN
                    tbllicencemanager tl ON tg.DeviceId = tl.DeviceId
                WHERE
                    tl.ExpiryDate > NOW() and tl.ExpiryDate < DATE_ADD(NOW(), INTERVAL 1 MONTH);`;
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].ExpiryDate != null) {
                    response[i].ExpiryDate = convertdateformat(response[i].ExpiryDate, 'Excel Export');
                }
            }
            res.json(response);
        } else {
            res.json([]);
        }
    });
})

router.get('/GetRenewalList', function (req, res) {
    var objParam = req.query;
    var offset = (parseInt(objParam.page) * 50);
    var limit = 50;
    var Where = "";
    var OrderBy = req.query.OrderBy;
    if (objParam.idApp != '' && objParam.idApp != null && objParam.idApp != undefined) {
        Where = "Where ta.id=" + objParam.idApp + " ";
    }
    if (objParam.idCountry != '' && objParam.idCountry != null && objParam.idCountry != undefined) {
        if (Where == '') {
            Where = "Where tgd.CountryId=" + objParam.idCountry + " ";
        } else {
            Where = Where + " AND tgd.CountryId=" + objParam.idCountry + " ";
        }
    }
    var query = `SELECT 
                        torder.*, tl.LicenceNo, tv.Name AS VehicleName,tsu.email as SalesAgent,ta.AppName 
                    FROM
                        (SELECT 
                            CONVERT_TZ(CreatedOnUtc, '+00:00', '` + CurrentOffset + `') AS CreateDate,
                                Terms,
                                SUBSTRING_INDEX(SUBSTRING_INDEX(tos.OrderNotes, ',', numbers.n), ',', - 1) DeviceId
                        FROM
                            (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) numbers
                        INNER JOIN tblorderservice tos ON CHAR_LENGTH(tos.OrderNotes) - CHAR_LENGTH(REPLACE(tos.OrderNotes, ',', '')) >= numbers.n - 1) torder
                            INNER JOIN
                        tbllicencemanager tl ON tl.DeviceId = torder.DeviceId
                            LEFT JOIN
                        tblappinfo ta ON ta.id = tl.idApp 
                            LEFT JOIN
                        tblvehicle tv ON tv.deviceid = torder.DeviceId
                            LEFT JOIN
                        tblgpsdevice tgd ON tgd.DeviceId = torder.DeviceId
                            LEFT JOIN
                        tbldeviceagentretailer tdr ON tdr.deviceId = torder.DeviceId
                            LEFT JOIN
                            tbluserinformation tsu ON tsu.id = tdr.agentId `+ Where + ` ORDER BY ` + OrderBy + ` limit ` + limit + ` offset ` + offset;
    console.log(query)
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].CreateDate != null) {
                    response[i].CreateDate = convertdateformat(response[i].CreateDate, 'Excel Export');
                }
            }
            res.json(response);
        } else {
            res.json([]);
        }
    });
})

router.get('/ExportRenewalData', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'Device Id',
        type: 'string'
    }, {
        caption: 'App Name',
        type: 'string'
    }, {
        caption: 'Date',
        type: 'string'
    }, {
        caption: 'Agent',
        type: 'string'
    }, {
        caption: 'Licence Code',
        type: 'string'
    }, {
        caption: 'Vehicle',
        type: 'string'
    }, {
        caption: 'Remark',
        type: 'string'
    }
    ];

    var objParam = req.query;
    var Where = "";
    if (objParam.idApp != '' && objParam.idApp != null && objParam.idApp != undefined) {
        Where = "Where ta.id=" + objParam.idApp + " ";
    }
    if (objParam.idCountry != '' && objParam.idCountry != null && objParam.idCountry != undefined) {
        if (Where == '') {
            Where = "Where tgd.CountryId=" + objParam.idCountry + " ";
        } else {
            Where = Where + " AND tgd.CountryId=" + objParam.idCountry + " ";
        }
    }
    console.log(objParam)
    var query = `SELECT 
                        torder.*, tl.LicenceNo, tv.Name AS VehicleName,tsu.email as SalesAgent,ta.AppName 
                    FROM
                        (SELECT 
                            CONVERT_TZ(CreatedOnUtc, '+00:00', '` + CurrentOffset + `') AS CreateDate,
                                Terms,
                                SUBSTRING_INDEX(SUBSTRING_INDEX(tos.OrderNotes, ',', numbers.n), ',', - 1) DeviceId
                        FROM
                            (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) numbers
                        INNER JOIN tblorderservice tos ON CHAR_LENGTH(tos.OrderNotes) - CHAR_LENGTH(REPLACE(tos.OrderNotes, ',', '')) >= numbers.n - 1) torder
                            INNER JOIN
                        tbllicencemanager tl ON tl.DeviceId = torder.DeviceId
                            LEFT JOIN
                        tblappinfo ta ON ta.id = tl.idApp 
                            LEFT JOIN
                        tblvehicle tv ON tv.deviceid = torder.DeviceId
                            LEFT JOIN
                        tblgpsdevice tgd ON tgd.DeviceId = torder.DeviceId
                            LEFT JOIN
                        tbldeviceagentretailer tdr ON tdr.deviceId = torder.DeviceId
                            LEFT JOIN
                        tbluserinformation tsu ON tsu.id = tdr.agentId `+ Where;
    console.log(query)
    connection.query(query, function (err, response) {
        // console.log(response)
        conf.rows = [];
        if (response.length > 0) {
            for (i = 0; i < response.length; i++) {
                var row = [];
                var DeviceId = 'N/A';
                var AppName = 'N/A';
                var Date = 'N/A';
                var SalesAgent = 'N/A';
                var LicenceCode = 'N/A';
                var VehicleName = 'N/A';
                var Terms = 'N/A';
                if (response[i].CreateDate != null) {
                    response[i].CreateDate = convertdateformat(response[i].CreateDate, 'Excel Export');
                }
                DeviceId = response[i].DeviceId != null && response[i].DeviceId != undefined && response[i].DeviceId != '' ? response[i].DeviceId.toString() : DeviceId;
                AppName = response[i].AppName && response[i].AppName != undefined && response[i].AppName != '' ? response[i].AppName.toString() : AppName;
                Date = response[i].CreateDate && response[i].CreateDate != undefined && response[i].CreateDate != '' ? response[i].CreateDate.toString() : CreateDate;
                SalesAgent = response[i].SalesAgent && response[i].SalesAgent != undefined && response[i].SalesAgent != '' ? response[i].SalesAgent.toString() : SalesAgent;
                LicenceCode = response[i].LicenceNo && response[i].LicenceNo != undefined && response[i].LicenceNo != '' ? response[i].LicenceNo.toString() : LicenceNo;
                VehicleName = response[i].VehicleName && response[i].VehicleName != undefined && response[i].VehicleName != '' ? response[i].VehicleName.toString() : VehicleName;
                Terms = response[i].Terms && response[i].Terms != undefined && response[i].Terms != '' ? response[i].Terms.toString() : Terms;

                row.push(DeviceId, AppName, Date, SalesAgent, LicenceCode, VehicleName, Terms);
                conf.rows.push(row);
            }
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + "Renewal.xlsx");
            res.end(result, 'binary');

        } else {
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + "Renewal.xlsx");
            res.end(result, 'binary');
        }
    });
});

router.get('/ExportExpiredDevice', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'Device Id',
        type: 'string'
    },
    {
        caption: 'App Name',
        type: 'string'
    }, {
        caption: 'Country',
        type: 'string'
    },
    {
        caption: 'Expired Date',
        type: 'string'
    },
    {
        caption: 'SIM serial',
        type: 'string'
    }, {
        caption: 'Phone No.',
        type: 'string'
    }

    ];

    var OrderBy = req.query.OrderBy;
    var query = `SELECT 
                    tg.DeviceId,
                    tg.AppName,
                    tc.Country,
                    CONVERT_TZ(tl.ExpiryDate, '+00:00', '` + CurrentOffset + `') AS ExpiryDate,
                    ts.SerialNum,
                    ts.PhoneNum
                FROM
                    tblgpsdevice tg
                        LEFT JOIN
                    tblcountrymgmt tc ON tc.id = tg.CountryId
                        INNER JOIN
                    tblsimdetails ts ON tg.idSim = ts.id
                        INNER JOIN
                    tbllicencemanager tl ON tg.DeviceId = tl.DeviceId
                WHERE
                    tl.ExpiryDate < NOW() and (ts.Status!='Terminate' or ts.Status is null) 
                ORDER BY `+ OrderBy + `;`;
    connection.query(query, function (err, response) {
        conf.rows = [];
        if (response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                var row = [];
                var DeviceId = '';
                var AppName = '';
                var Country = '';
                var ExpiryDate = '';
                var SerialNum = '';
                var PhoneNum = '';


                DeviceId = response[i].DeviceId != null && response[i].DeviceId != undefined && response[i].DeviceId != '' ? response[i].DeviceId.toString() : DeviceId;
                AppName = response[i].AppName && response[i].AppName != undefined && response[i].AppName != '' ? response[i].AppName.toString() : AppName;
                Country = response[i].Country && response[i].Country != undefined && response[i].Country != '' ? response[i].Country.toString() : Country;
                ExpiryDate = response[i].ExpiryDate && response[i].ExpiryDate != undefined && response[i].ExpiryDate != '' ?
                    moment(moment.utc(response[i].ExpiryDate).toDate()).format("YYYY-MM-DD HH:mm:ss") : ExpiryDate;
                SerialNum = response[i].SerialNum && response[i].SerialNum != undefined && response[i].SerialNum != '' ? response[i].SerialNum.toString() : SerialNum;
                PhoneNum = response[i].PhoneNum && response[i].PhoneNum != undefined && response[i].PhoneNum != '' ? response[i].PhoneNum.toString() : PhoneNum;

                row.push(DeviceId, AppName, Country, ExpiryDate, SerialNum, PhoneNum);

                conf.rows.push(row);

            }
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + "ExpiredTracker.xlsx");
            res.end(result, 'binary');

        } else {
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + "ExpiredTracker.xlsx");
            res.end(result, 'binary');
        }
    });
});

router.get('/GetSalesAgentDevice', function (req, res) {
    var objParam = req.query;
    var offset = (parseInt(objParam.page) * 50);
    var limit = 50;
    var Where = "";
    if (objParam.Email != '' && objParam.Email != null && objParam.Email != undefined) {
        Where = " AND tsu.email like '%" + objParam.Email + "%' ";
    }

    var query = `SELECT 
    tdr.deviceId,
    torder.CreateDate,
    torder.Terms,
    torder.DeviceId as RenewDevice,
    tl.LicenceNo,
    ts.SerialNum,
    ts.PhoneNum,
    ts.Status AS SimStatus,
    tsu.email AS SalesAgent
FROM
    tbldeviceagentretailer tdr
        INNER JOIN
    tblgpsdevice tgd ON tgd.DeviceId = tdr.deviceId
        LEFT JOIN
    tblsimdetails ts ON ts.id = tgd.idSim
        LEFT JOIN
    (SELECT 
        CONVERT_TZ(CreatedOnUtc, '+00:00', '` + CurrentOffset + `') AS CreateDate,
            Terms,
            SUBSTRING_INDEX(SUBSTRING_INDEX(tos.OrderNotes, ',', numbers.n), ',', - 1) DeviceId
    FROM
        (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) numbers
    INNER JOIN tblorderservice tos ON CHAR_LENGTH(tos.OrderNotes) - CHAR_LENGTH(REPLACE(tos.OrderNotes, ',', '')) >= numbers.n - 1
    ORDER BY CreatedOnUtc DESC) AS torder ON tdr.deviceId = torder.DeviceId
        LEFT JOIN
    tbllicencemanager tl ON tl.DeviceId = tdr.DeviceId
        INNER JOIN
    tbluserinformation tsu ON tsu.id = tdr.agentId
WHERE
    tdr.agentId IS NOT NULL  `+ Where + `
GROUP BY tdr.deviceId
limit ` + limit + ` offset ` + offset;
    console.log(query)
    connection.query(query, function (err, response) {
        if (!err && response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                if (response[i].CreateDate != null) {
                    response[i].CreateDate = convertdateformat(response[i].CreateDate, 'Excel Export');
                }
            }
            res.json(response);
        } else {
            res.json([]);
        }
    });
})

router.get('/GetTerminatedSim', function (req, res) {
    // var OrderBy = req.query.OrderBy;
    var query = `SELECT 
                    tgd.id,
                    tgd.DeviceId,
                    tgd.AppName,
                    tc.Country,
                    ts.SerialNum,
                    ts.PhoneNum
                FROM
                    tblgpsdevice tgd
                        INNER JOIN
                    tblsimdetails ts ON tgd.idSim = ts.id
                        LEFT JOIN
                    tblcountrymgmt tc ON tgd.CountryId = tc.id
                WHERE
                    ts.Status = 'Terminate'`;
    connection.query(query, function (err, response) {
        if (!err) {
            var lstDevice = [];

            function getData(i) {
                if (i < response.length) {
                    var obj = new Object();
                    obj.id = response[i].id;
                    obj.DeviceId = response[i].DeviceId;
                    obj.AppName = response[i].AppName;
                    obj.Country = response[i].Country;
                    obj.SerialNum = response[i].SerialNum;
                    obj.PhoneNum = response[i].PhoneNum;
                    client.get(response[i].DeviceId, function (err, strgpsdata) {
                        if (!err) {
                            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                var objgps = JSON.parse(strgpsdata);
                                obj.GPSDate = objgps.Date;
                            } else {
                                obj.GPSDate = null;
                            }
                        } else {
                            obj.GPSDate = null;
                        }
                        lstDevice.push(obj);
                        getData(i + 1);
                    });
                } else {
                    res.json(lstDevice);
                }
            }
            getData(0)
        } else {
            res.json([]);
        }
    });
})

router.get('/ExportTerminatedSim', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'Device Id',
        type: 'string'
    },
    {
        caption: 'App Name',
        type: 'string'
    }, {
        caption: 'Country',
        type: 'string'
    },
    {
        caption: 'SIM serial',
        type: 'string'
    }, {
        caption: 'Phone No.',
        type: 'string'
    },
    {
        caption: 'GPS Date',
        type: 'string'
    }
    ];

    var OrderBy = req.query.OrderBy;
    var query = `SELECT 
                    tgd.id,
                    tgd.DeviceId,
                    tgd.AppName,
                    tc.Country,
                    ts.SerialNum,
                    ts.PhoneNum
                FROM
                    tblgpsdevice tgd
                        INNER JOIN
                    tblsimdetails ts ON tgd.idSim = ts.id
                        LEFT JOIN
                    tblcountrymgmt tc ON tgd.CountryId = tc.id
                WHERE
                    ts.Status = 'Terminate';`;
    connection.query(query, function (err, response) {
        conf.rows = [];
        if (response.length > 0) {
            function setdata(i) {
                if (i < response.length) {
                    var row = [];
                    var DeviceId = 'N/A';
                    var AppName = 'N/A';
                    var Country = 'N/A';
                    var GPSDate = 'N/A';
                    var SerialNum = 'N/A';
                    var PhoneNum = 'N/A';
                    client.get(response[i].DeviceId, function (err, strgpsdata) {
                        if (!err) {
                            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                var objgps = JSON.parse(strgpsdata);
                                GPSDate = moment(moment.utc(objgps.Date * 1000).toDate()).format("YYYY-MM-DD HH:mm:ss");
                            } else {
                                GPSDate = 'N/A';
                            }
                        } else {
                            GPSDate = 'N/A';
                        }
                        DeviceId = response[i].DeviceId != null && response[i].DeviceId != undefined && response[i].DeviceId != '' ? response[i].DeviceId.toString() : DeviceId;
                        AppName = response[i].AppName && response[i].AppName != undefined && response[i].AppName != '' ? response[i].AppName.toString() : AppName;
                        Country = response[i].Country && response[i].Country != undefined && response[i].Country != '' ? response[i].Country.toString() : Country;
                        SerialNum = response[i].SerialNum && response[i].SerialNum != undefined && response[i].SerialNum != '' ? response[i].SerialNum.toString() : SerialNum;
                        PhoneNum = response[i].PhoneNum && response[i].PhoneNum != undefined && response[i].PhoneNum != '' ? response[i].PhoneNum.toString() : PhoneNum;

                        row.push(DeviceId, AppName, Country, SerialNum, PhoneNum, GPSDate);

                        conf.rows.push(row);
                        setdata(i + 1);
                    });

                } else {
                    var result = nodeExcel.execute(conf);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    res.setHeader("Content-Disposition", "attachment; filename=" + "TerminatedSim.xlsx");
                    res.end(result, 'binary');

                }
            }
            setdata(0);
        } else {
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + "TerminatedSim.xlsx");
            res.end(result, 'binary');
        }
    });
});

router.get('/GetTerminatedSimAdmin', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = '';
    if (objSearch != null && objSearch != '') {
        search = 'and (tgd.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tgd.AppName like "%' + objSearch + '%" or ';
        search = search + 'tc.Country like "%' + objSearch + '%" or ';
        search = search + 'ts.SerialNum like "%' + objSearch + '%" or ';
        search = search + 'ts.PhoneNum like "%' + objSearch + '%") ';
    };
    var query = `SELECT SQL_CALC_FOUND_ROWS 
                    tgd.id,
                    tgd.DeviceId,
                    tgd.AppName,
                    tc.Country,
                    ts.SerialNum,
                    ts.PhoneNum
                FROM
                    tblgpsdevice tgd
                        INNER JOIN
                    tblsimdetails ts ON tgd.idSim = ts.id
                        LEFT JOIN
                    tblcountrymgmt tc ON tgd.CountryId = tc.id
                WHERE
                    ts.Status = 'Terminate' `+ search + ` order by ` + Orderby + ` limit ` + parseInt(objParam.length) + ` offset ` + parseInt(objParam.start);
    query += ";SELECT FOUND_ROWS() as TotalRecord;"

    connection.query(query, function (err, response) {
        if (!err) {
            var lstDevice = [];

            function getData(i) {
                if (i < response[0].length) {
                    var obj = new Object();
                    obj.id = response[0][i].id;
                    obj.DeviceId = response[0][i].DeviceId;
                    obj.AppName = response[0][i].AppName;
                    obj.Country = response[0][i].Country;
                    obj.SerialNum = response[0][i].SerialNum;
                    obj.PhoneNum = response[0][i].PhoneNum;
                    client.get(response[0][i].DeviceId, function (err, strgpsdata) {
                        if (!err) {
                            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                var objgps = JSON.parse(strgpsdata);
                                obj.GPSDate = objgps.Date;
                            } else {
                                obj.GPSDate = null;
                            }
                        } else {
                            obj.GPSDate = null;
                        }
                        lstDevice.push(obj);
                        getData(i + 1);
                    });
                } else {

                    var response1 = new Object();
                    response1.draw = objParam.draw;
                    response1.recordsTotal = response[1][0].TotalRecord;
                    response1.recordsFiltered = response[1][0].TotalRecord;
                    response1.data = lstDevice;
                    res.json(response1);
                    // res.json(lstDevice);
                }
            }
            getData(0)
        } else {
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = 0;
            response1.recordsFiltered = 0;
            response1.data = [];
            res.json(response1);
        }
    });
})

router.get('/ExportTerminatedSimAdmin', function (req, res) {
    var conf = {};
    conf.cols = [{
        caption: 'Device Id',
        type: 'string'
    },
    {
        caption: 'App Name',
        type: 'string'
    }, {
        caption: 'Country',
        type: 'string'
    },
    {
        caption: 'SIM serial',
        type: 'string'
    }, {
        caption: 'Phone No.',
        type: 'string'
    },
    {
        caption: 'Last GPS Date',
        type: 'string'
    }
    ];

    var OrderBy = req.query.OrderBy;
    var query = `SELECT
                    tgd.id,
                    tgd.DeviceId,
                    tgd.AppName,
                    tc.Country,
                    ts.SerialNum,
                    ts.PhoneNum
                FROM
                    tblgpsdevice tgd
                INNER JOIN
                    tblsimdetails ts ON tgd.idSim = ts.id
                LEFT JOIN
                    tblcountrymgmt tc ON tgd.CountryId = tc.id
                WHERE
                    ts.Status = 'Terminate'; `;
    connection.query(query, function (err, response) {
        conf.rows = [];
        if (response.length > 0) {
            function setdata(i) {
                if (i < response.length) {
                    var row = [];
                    var DeviceId = 'N/A';
                    var AppName = 'N/A';
                    var Country = 'N/A';
                    var GPSDate = 'N/A';
                    var SerialNum = 'N/A';
                    var PhoneNum = 'N/A';
                    client.get(response[i].DeviceId, function (err, strgpsdata) {
                        if (!err) {
                            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                var objgps = JSON.parse(strgpsdata);
                                GPSDate = moment(moment.utc(objgps.Date * 1000).toDate()).format("YYYY-MM-DD HH:mm:ss");
                            } else {
                                GPSDate = 'N/A';
                            }
                        } else {
                            GPSDate = 'N/A';
                        }
                        DeviceId = response[i].DeviceId != null && response[i].DeviceId != undefined && response[i].DeviceId != '' ? response[i].DeviceId.toString() : DeviceId;
                        AppName = response[i].AppName && response[i].AppName != undefined && response[i].AppName != '' ? response[i].AppName.toString() : AppName;
                        Country = response[i].Country && response[i].Country != undefined && response[i].Country != '' ? response[i].Country.toString() : Country;
                        SerialNum = response[i].SerialNum && response[i].SerialNum != undefined && response[i].SerialNum != '' ? response[i].SerialNum.toString() : SerialNum;
                        PhoneNum = response[i].PhoneNum && response[i].PhoneNum != undefined && response[i].PhoneNum != '' ? response[i].PhoneNum.toString() : PhoneNum;

                        row.push(DeviceId, AppName, Country, SerialNum, PhoneNum, GPSDate);

                        conf.rows.push(row);
                        setdata(i + 1);
                    });

                } else {
                    var result = nodeExcel.execute(conf);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    res.setHeader("Content-Disposition", "attachment; filename=" + "TerminatedSim.xlsx");
                    res.end(result, 'binary');

                }
            }
            setdata(0);
        } else {
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + "TerminatedSim.xlsx");
            res.end(result, 'binary');
        }
    });
});
module.exports = router