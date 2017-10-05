var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var SIM = models.tblsimdetails;
//End of Tables

router.get('/GetAllSIMInfo', function(req, res) {
    var query = "SELECT ts.id,ts.SerialNum,ts.PhoneNum,CONVERT_TZ(ts.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate, tt.Name as TelName,tt.id as idTelCo from tblsimdetails as ts LEFT JOIN tbltelco as tt ON ts.idTelCo = tt.id ORDER BY CreatedDate DESC";
    connection.query(query, function(err, response) {
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

router.post('/SaveSIMInfo', jsonParser, function(req, res) {
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
        }).then(function(UserExist) {
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

                    SIM.findOrCreate({ where: { SerialNum: objSIMInfo.SerialNum }, defaults: objSIMInfo }).then(function(response) {
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
                    SIM.findOne({ where: { SerialNum: objSIMInfo.SerialNum }, defaults: objSIMInfo }).then(function(objSimsExist) {
                        if (objSimsExist != null && objSIMInfo.Id != objSimsExist.id) {
                            res.json({ success: false, message: "SIM Info is already Exist...", data: objSimsExist });
                        } else {
                            SIM.update(objSIMInfo, { where: { id: objSIMInfo.Id } }).then(function(response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('Update SIM', UserExist.username, 'Update SIM Data');
                                    res.json({ success: true, message: "SIM Info updated successfully...", data: response });
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

router.get('/DeleteSIMInfo', function(req, res) {
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

                    SIM.destroy({
                        where: {
                            id: req.query.Id
                        }
                    }).then(function(response) {
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

router.get('/DownloadTemplate', function(req, res) {
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

router.post('/uploadExcelDevice', function(req, res) {
    var form = new formidable.IncomingForm();
    var lst = [];
    var FileName = [];
    var Importerror = [];


    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //var FileName = __dirname + '/../MediaUploads/FileUpload/DeviceList.xlsx';
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

    form.parse(req, function(err, fields, files) {

    });

    form.on('fileBegin', function(name, file) {
        console.log("***********************fileBegin")
        file.path = form.uploadDir + "/" + file.name;
        // console.log(file.path);
        FileName = file.path.toString();
        //FileName.push(file.path);
    });

    form.on('end', function() {
        console.log(FileName)
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
                                obj.PhoneNum = lst[i].PhoneNumber.trim();
                                obj.CreatedDate = new Date();

                                SIM.findOrCreate({
                                    where: { SerialNum: obj.SerialNum },
                                    defaults: obj
                                }).then(function(response) {
                                    if ((response[1])) {
                                        // funAuditLog.CreateAuditLog('Upload SIM Data', UserExist.username, 'Cerate New SIM Data');
                                        addSIm(i + 1);
                                    } else {
                                        Importerror.push(lst[i].SerialNumber);
                                        addSIm(i + 1);
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

router.get('/Export', function(req, res) {
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
        }

    ];
    // SIM.findAll({
    //     order: [
    //         ['CreatedDate', 'DESC'],
    //     ]
    // }).then(function(response) {
    var query = "SELECT ts.id,ts.SerialNum,ts.PhoneNum,CONVERT_TZ(ts.CreatedDate,'+00:00','" + req.query.CurrentOffset + "') as CreatedDate, tt.Name as TelName from tblsimdetails as ts LEFT JOIN tbltelco as tt ON ts.idTelCo = tt.id ORDER BY CreatedDate DESC";
    connection.query(query, function(err, response) {
        conf.rows = [];
        if (response.length > 0) {
            function setdata(i) {
                if (i < response.length) {
                    var row = [];
                    var SerialNumber = '';
                    var PhoneNumber = '';
                    var CreatedDate = '';
                    var TelName = '';
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
                    row.push(SerialNumber, PhoneNumber, TelName, CreatedDate);

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

module.exports = router