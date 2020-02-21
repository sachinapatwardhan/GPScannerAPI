var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var SIM = models.tblsimdetails;
var AppInfo = models.tblappinfo;
var TelCo = models.tbltelco;
var GPSDevice = models.tblgpsdevice;
//End of Tables

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
        search = search + 'ts.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tt.Name like "%' + objSearch + '%") ';
    };

    var query = "SELECT ts.id,ts.SerialNum,ts.PhoneNum,ts.idApp,tai.AppName,CONVERT_TZ(ts.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate, tt.Name as TelName,tt.id as idTelCo " +
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
                            SIM.update(objSIMInfo, { where: { id: objSIMInfo.Id } }).then(function (response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('Update SIM', UserExist.username, 'Update SIM Data');
                                    res.json({ success: true, message: "SIM Info updated successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "SIM Info not updated successfully...", data: response });
                                }
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
                                        SimService.update(obj, { where: { id: response[0].id } }).then(function (resUpdateSim) {
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

router.get('/GetSimSerialByDeviceId', function (req, res) {
    var query = " SELECT ts.SerialNum,ts.PhoneNum,tg.DeviceId,tg.Type,tg.AppName,tc.Country,IFNULL(tsu.email,tsu2.email) as SalesAgent,tsu1.email as Distributor,CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate,CASE WHEN tl.CreatedDate is not null then CONVERT_TZ(tl.CreatedDate,'+00:00','" + CurrentOffset + "') else CONVERT_TZ(tv.CreatedDate,'+00:00','" + CurrentOffset + "') end as CreatedDate,CASE WHEN tl.id is null then false else true END as IsLicenceHave,tl.LicenceNo FROM" +
        " tblgpsdevice tg" +
        " left JOIN tblsimdetails ts ON tg.idSim= ts.id" +
        " left JOIN tbllicencemanager tl ON tg.DeviceId= tl.DeviceId" +
        " left JOIN tblvehicle tv ON tg.DeviceId= tv.deviceid and tv.IsDelete=0" +
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
            }
            res.json(response);
        } else {
            res.json([]);
        }
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
module.exports = router