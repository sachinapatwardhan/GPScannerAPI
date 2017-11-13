var router = express.Router();


//Tables
var User = models.tbluserinformation;
var UserPermission = models.tbluserpermission;
var Module = models.tblmodulemgmt;
var Role = models.tblrole;
var UserInRole = models.tbluserinrole;
var AuditLog = models.tblauditlog;
//End of Tables

//Global Message
global.NoAccessPermission = {
    success: false,
    message: "No Access Permission...",
    data: "AccessPermission"
};


global.InvalidToken = {
    success: false,
    message: "Invalid token...",
    data: "TOKEN"
};
global.NotDeleteReferenceData = {
    success: false,
    message: "This Record Can't Deleted, It Contain References to other data..."
};
global.RecordNotFound = {
    success: false,
    message: "Requested Record(s) not Found....",
    data: null
};
//End of Global Message

var https = require('https');

router.get('/SendOTP', function(req, res) {
    var data = JSON.stringify({
        api_key: 'a692ce5b',
        api_secret: '928903ee92ecd3e4',
        text: 'Your One Time Password(OTP) is 1234',
        to: '+918460533003',
        from: 'Pettorway'

    });

    var options = {
        host: 'rest.nexmo.com',
        path: '/sms/json',
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var req = https.request(options);

    req.write(data);
    req.end();

    var responseData = '';
    req.on('response', function(res1) {
        res1.on('data', function(chunk) {
            responseData += chunk;
        });

        res1.on('end', function() {
            // console.log(JSON.parse(responseData));
            res.json(JSON.parse(responseData));
        });
    });
});


router.get('/SendTestMail', function(req, res) {

    var mail = {
        from: 'soham.patel@bugzstudio.com',
        to: 'soham.patel@bugzstudio.com',
        subject: 'hello',
        text: 'hello world!'
    };
    transporter.sendMail(mail, function(error, response) {
        if (error) {
            res.json(error);
        } else {
            res.json(response);
        }
    });
})


getToken = function(headers) {
    // console.log(headers.authorization);
    // console.log(JSON.stringify(headers));
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

router.get('/EncodeData', function(req, res) {
    var Passwordaa = req.query.data;
    // console.log(Passwordaa)
    var EncodePass = jwt.encode(Passwordaa, "bugz");
    // console.log(EncodePass)
    // var DecodePass = jwt.decode(EncodePass, "bugz");
    // console.log(DecodePass)
    res.send(EncodePass);
});

router.get('/DecodeData', function(req, res) {
    var Passwordaa = req.query.data;
    // var EncodePass = jwt.encode(Passwordaa, "bugz");
    // console.log(EncodePass)
    var DecodePass = jwt.decode(Passwordaa, "bugz");
    // console.log(DecodePass)
    res.send(DecodePass);
});

app.use(express.static(__dirname + '/../MediaUploads'));

router.get('/ReportExample', function(req, res) {

    // var objReport = {
    //     jasper: __dirname + '/../reports/Invoice.jasper'
    // };

    // var report = { report: objReport, data: { id: 4 } };
    // var pdf = jasper.pdf(report);
    // res.set({
    //     'Content-type': 'application/pdf',
    //     'Content-Length': pdf.length
    // });
    // res.send(pdf);


})

//Manage Permission to Access Methods
global.funAccessPermission = new Object();
global.funAccessPermission.CheckUserAccessPermission = CheckUserAccessPermission;


function CheckUserAccessPermission(ObjParams, callback) {
    var returnobj = {
        success: true,
        message: "Permission to Access...",
    }

    objHeader = ObjParams.headers;
    var PermissionFlag = false;
    var token = getToken(objHeader);

    if (token) {
        var objUser = jwt.decode(token, TokenKey);
        if (objUser) {
            //Check User Exist or not
            User.findOne({ where: { username: objUser.username, password: objUser.password } }).then(function(UserExist) {
                if (UserExist != null) {

                    var tablename = ObjParams.query.tablename;
                    var permission = ObjParams.query.permission;
                    var username = objUser.username;

                    //Get Module
                    Module.findOne({ where: { Module: tablename } }).then(function(objModule) {
                        if (objModule != null) {
                            UserInRole.belongsTo(Role, {
                                foreignKey: {
                                    name: 'roleId',
                                    allowNull: false
                                }
                            });
                            UserInRole.findAll({
                                where: { userId: UserExist.id },
                                include: [{
                                    model: Role
                                }]
                            }).then(function(strRole) {

                                function uploader(i) {
                                    if (i < strRole.length) {

                                        UserPermission.findOne({ where: { idModule: objModule.id, RoleName: strRole[i].tblrole.RoleName } }).then(function(objUserPermission) {
                                            if (objUserPermission != null) {

                                                if (permission == "Added") {
                                                    if (objUserPermission.Added == true) {
                                                        return callback(returnobj);
                                                    } else {
                                                        uploader(i + 1);
                                                    }
                                                } else if (permission == "Show") {
                                                    if (objUserPermission.Show == true) {
                                                        return callback(returnobj);
                                                    } else {
                                                        uploader(i + 1);
                                                    }
                                                } else if (permission == "Modified") {
                                                    if (objUserPermission.Modified == true) {
                                                        return callback(returnobj);
                                                    } else {
                                                        uploader(i + 1);
                                                    }
                                                } else if (permission == "Deleted") {
                                                    if (objUserPermission.Deleted == true) {
                                                        return callback(returnobj);
                                                    } else {
                                                        uploader(i + 1);
                                                    }
                                                } else {
                                                    uploader(i + 1);
                                                }
                                            } else {
                                                uploader(i + 1);
                                            }
                                        })
                                    } else {
                                        return callback(NoAccessPermission)
                                    }
                                }
                                uploader(0);

                                if (strRole.length == 0) {
                                    return callback(NoAccessPermission)
                                };

                            })
                        } else {
                            return callback(NoAccessPermission)
                        }
                    })
                } else {
                    return callback(InvalidToken);
                }
            })
        } else {
            return callback(InvalidToken);
        };
    } else {
        return callback(InvalidToken);
    }
}

//End Permission

//Create Audit Log
global.funAuditLog = new Object();
global.funAuditLog.CreateAuditLog = CreateAuditLog;

function CreateAuditLog(Method, User, Message) {
    var objAudit = new Object();
    objAudit.type = Method;
    objAudit.createdby = User;
    objAudit.createddate = new Date();
    objAudit.message = Message;

    AuditLog.create(objAudit).then(function(responseAudit) {});
}
var rule1 = new schedule.RecurrenceRule();

var DailyUserReport = schedule.scheduleJob('0 23 * * *', function() {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'Email',
        type: 'string'
    }, {
        caption: 'TodayDevice',
        type: 'string'
    }, {
        caption: 'TotalDevice',
        type: 'string'
    }];

    connection.query("SELECT t2.email,count(t1.id) todaydevice,(select Count(*) from tblvehicle where iduser=t1.iduser and IsDelete=false) as totaldevice FROM tblvehicle t1 left join tbluserinformation t2 on t1.iduser = t2.id where date(t1.CreatedDate) = current_date() and t1.IsDelete=false group by t2.id;", function(err, response, fields) {
        if (!err && response.length > 0) {
            conf.rows = [];

            if (response.length > 0) {

                for (var i = 0; i < response.length; i++) {
                    var row = [];

                    var Email = '';
                    var TodayDevice = '';
                    var TotalDevice = '';
                    if (response[i].email != null && response[i].email != '' && response[i].email != undefined) {
                        Email = response[i].email;
                    }

                    if (response[i].todaydevice != null && response[i].todaydevice != '' && response[i].todaydevice != undefined) {
                        TodayDevice = response[i].todaydevice.toString();
                    }

                    if (response[i].totaldevice != null && response[i].totaldevice != '' && response[i].totaldevice != undefined) {
                        TotalDevice = response[i].totaldevice.toString();
                    }
                    row.push(Email, TodayDevice, TotalDevice);
                    conf.rows.push(row);
                }

                var TodayDate = GetCurrentDate1();
                var result = nodeExcel.execute(conf);
                var ConsoleStream = fs.createWriteStream('MediaUploads/UserReportFileUpload/DailyUserReport__' + TodayDate + '.xlsx');
                ConsoleStream.write(result, 'binary');
                ConsoleStream.end();

                var mail = {
                    from: 'soham.patel@bugzstudio.com',
                    to: 'soham.patel@bugzstudio.com',
                    //bcc: objSetting.Value,
                    subject: 'DailyUserReport__' + TodayDate,
                    attachments: [{
                        filename: 'DailyUserReport__' + TodayDate + '.xlsx',
                        path: 'MediaUploads/UserReportFileUpload/DailyUserReport__' + TodayDate + '.xlsx', // stream this file
                    }]
                };
                transporter.sendMail(mail, function(error, response) {

                });
            }

        }
    })
});
var rule2 = new schedule.RecurrenceRule();

var MonthlyUserReport = schedule.scheduleJob('10 0 1 * *', function() {

    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'Email',
        type: 'string'
    }, {
        caption: 'ThisMonthDevice',
        type: 'string'
    }, {
        caption: 'TotalDevice',
        type: 'string'
    }];

    connection.query("SELECT t2.email,count(t1.id) ThisMonthDevice,(select Count(*) from tblvehicle where iduser=t1.iduser and IsDelete=false) as TotalDevice FROM tblvehicle t1 left join tbluserinformation t2 on t1.iduser = t2.id where MONTH(t1.CreatedDate) = MONTH(DATE_ADD(current_date(), INTERVAL 0 MONTH) - INTERVAL 1 DAY) and  YEAR(t1.CreatedDate) = YEAR(DATE_ADD(current_date(), INTERVAL 0 MONTH) - INTERVAL 1 DAY)  and t1.IsDelete=false group by t2.id;", function(err, response, fields) {
        if (!err && response.length > 0) {
            conf.rows = [];

            if (response.length > 0) {
                for (var i = 0; i < response.length; i++) {
                    var row = [];

                    var Email = 'N/A';
                    var TodayDevice = 'N/A';
                    var TotalDevice = 'N/A';
                    if (response[i].email != null && response[i].email != '' && response[i].email != undefined) {
                        Email = response[i].email;
                    }

                    if (response[i].ThisMonthDevice != null && response[i].ThisMonthDevice != '' && response[i].ThisMonthDevice != undefined) {
                        ThisMonthDevice = response[i].ThisMonthDevice.toString();
                    }

                    if (response[i].TotalDevice != null && response[i].TotalDevice != '' && response[i].TotalDevice != undefined) {
                        TotalDevice = response[i].TotalDevice.toString();
                    }
                    row.push(Email, ThisMonthDevice, TotalDevice);
                    conf.rows.push(row);
                }

                var objDate = new Date();
                var locale = "en-us";
                var Month = objDate.toLocaleString(locale, { month: "short" });
                var Year = objDate.getUTCFullYear();
                var result = nodeExcel.execute(conf);
                var ConsoleStream = fs.createWriteStream('MediaUploads/UserReportFileUpload/MonthlyUserReport__' + Month + '_' + Year + '.xlsx');
                ConsoleStream.write(result, 'binary');
                ConsoleStream.end();

                var mail = {
                    from: 'soham.patel@bugzstudio.com',
                    to: 'soham.patel@bugzstudio.com',
                    subject: 'MonthlyUserReport__' + Month + '_' + Year,
                    attachments: [{
                        filename: 'MonthlyUserReport__' + Month + '_' + Year + '.xlsx',
                        path: 'MediaUploads/UserReportFileUpload/MonthlyUserReport__' + Month + '_' + Year + '.xlsx', // stream this file
                    }]
                };
                transporter.sendMail(mail, function(error, response) {});

            }
        }
    })
});

function GetCurrentDate1() {
    var today = new Date();

    var year = today.getUTCFullYear();
    var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getUTCDate();

    //return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    return ("00" + day.toString()).slice(-2) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("0000" + year.toString()).slice(-4);
}


//Call 1st And 16th date of the month
var IsActiveDeviceCheck = schedule.scheduleJob('1 0 0 1,16 * *', function() {
    var days = 15; // Days you want to subtract
    var date = new Date();
    var Date1 = null;
    var Date1 = null;

    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'DeviceId',
        type: 'string'
    }, {
        caption: 'Type',
        type: 'string'
    }, {
        caption: 'IMEI',
        type: 'string'
    }, {
        caption: 'SerialNumber',
        type: 'string'
    }, {
        caption: 'PhoneNumber',
        type: 'string'
    }, {
        caption: 'Telephone Company',
        type: 'string'
    }, {
        caption: 'AppName',
        type: 'string'
    }, {
        caption: 'ExpiryDate',
        type: 'string'
    }];

    if (date.getDate() == 16) {
        Date1 = convertdateformat(new Date(date.getTime() - (days * 24 * 60 * 60 * 1000)), 2);
        Date2 = convertdateformat(new Date(date.getTime() - (1 * 24 * 60 * 60 * 1000)), 1);
    } else {
        Date1 = convertdateformat(new Date(date.getFullYear(), date.getMonth() - 1, 16), 2);
        Date2 = convertdateformat(new Date(date.getTime() - (1 * 24 * 60 * 60 * 1000)), 1);
    }

    var query = "Select DeviceId,Type,IMEI,SerialNum,PhoneNum,Name,AppName,CONVERT_TZ(ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate " +
        "from tblgpsdevice tgd " +
        "inner join tblsimdetails tsd on tgd.idSim = tsd.id inner join tbltelco ttc on ttc.id = tsd.idTelCo " +
        "where ActivationDate between '" + Date1 + "' and '" + Date2 + "' and IsActive = true";

    var lstDevice = [];
    connection.query(query, function(err, response, fields) {
        if (!err && response.length > 0) {
            conf.rows = [];
            if (response.length > 0) {
                for (var i = 0; i < response.length; i++) {
                    var row = [];

                    var DeviceId = 'N/A';
                    var Type = 'N/A';
                    var IMEI = 'N/A';
                    var SerialNumber = 'N/A';
                    var PhoneNumber = 'N/A';
                    var Name = 'N/A';
                    var AppName = 'N/A';
                    var ExpiryDate = 'N/A';
                    if (response[i].DeviceId != null && response[i].DeviceId != '' && response[i].DeviceId != undefined) {
                        DeviceId = response[i].DeviceId;
                    }

                    if (response[i].Type != null && response[i].Type != '' && response[i].Type != undefined) {
                        Type = response[i].Type.toString();
                    }

                    if (response[i].IMEI != null && response[i].IMEI != '' && response[i].IMEI != undefined) {
                        IMEI = response[i].IMEI.toString();
                    }
                    if (response[i].SerialNumber != null && response[i].SerialNumber != '' && response[i].SerialNumber != undefined) {
                        SerialNumber = response[i].SerialNumber.toString();
                    }
                    if (response[i].PhoneNumber != null && response[i].PhoneNumber != '' && response[i].PhoneNumber != undefined) {
                        PhoneNumber = response[i].PhoneNumber.toString();
                    }
                    if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                        Name = response[i].Name.toString();
                    }
                    if (response[i].AppName != null && response[i].AppName != '' && response[i].AppName != undefined) {
                        AppName = response[i].AppName.toString();
                    }
                    if (response[i].ExpiryDate != null && response[i].ExpiryDate != '' && response[i].ExpiryDate != undefined) {
                        ExpiryDate = convertdateformat(response[i].ExpiryDate, 3).toString();
                    }
                    row.push(DeviceId, Type, IMEI, SerialNumber, PhoneNumber, Name, AppName, ExpiryDate);
                    conf.rows.push(row);
                }
                var objDate = new Date();
                var locale = "en-us";
                var Month = objDate.toLocaleString(locale, { month: "short" });
                var Year = objDate.getUTCFullYear();
                var Day = objDate.getUTCDate();
                var result = nodeExcel.execute(conf);
                var ConsoleStream = fs.createWriteStream('MediaUploads/UserReportFileUpload/GpsDeviceActive__' + Day + '_' + Month + '_' + Year + '.xlsx');
                ConsoleStream.write(result, 'binary');
                ConsoleStream.end();

                var EmailName = "Select Value from tblsetting where Name = 'EmailTo' ";
                connection.query(EmailName, function(err, response, fields) {
                    if (!err && response[0].Value != null && response[0].Value != '') {
                        var mail = {
                            from: response[0].Value,
                            to: response[0].Value,
                            subject: 'GpsDeviceActive__' + new Date(Date1).getDate() + '_' + Month + '_' + Year + ' To ' + new Date(Date2).getDate() + '_' + Month + '_' + Year,
                            text: 'All Activated Sim and Tracker Detail From ' + new Date(Date1).getDate() + '_' + Month + '_' + Year + ' To ' + new Date(Date2).getDate() + '_' + Month + '_' + Year,
                            attachments: [{
                                filename: 'GpsDeviceActive__' + Day + '_' + Month + '_' + Year + '.xlsx',
                                path: 'MediaUploads/UserReportFileUpload/GpsDeviceActive__' + Day + '_' + Month + '_' + Year + '.xlsx', // stream this file
                            }]
                        };
                        transporter.sendMail(mail, function(error, response) {});
                    }
                    // else {
                    //     var mail = {
                    //         from: 'soham.patel@bugzstudio.com',
                    //         to: 'soham.patel@bugzstudio.com',
                    //         subject: 'GpsDeviceActive__' + Day + '_' + Month + '_' + Year,
                    //         attachments: [{
                    //             filename: 'GpsDeviceActive__' + Day + '_' + Month + '_' + Year + '.xlsx',
                    //             path: 'MediaUploads/UserReportFileUpload/GpsDeviceActive__' + Day + '_' + Month + '_' + Year + '.xlsx', // stream this file
                    //         }]
                    //     };
                    //     transporter.sendMail(mail, function(error, response) {});
                    // }
                });
            }
        }
    });
});

//Call Every Day '12:05 AM' O'clock
var rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 05;
rule.second = 0;

var ExpiryDateDeviceCheck = schedule.scheduleJob(rule, function() {
    var date = new Date();
    var Date1 = convertdateformat(date.setMonth(date.getMonth() + 1), 4);
    //var Date2 = convertdateformat(new Date(), 2);

    //Expire After 1 month notification

    var query1 = "Select DeviceId,Type,IMEI,SerialNum,PhoneNum,Name,AppName,ExpiryDate " +
        "from tblgpsdevice tgd " +
        "inner join tblsimdetails tsd on tgd.idSim = tsd.id inner join tbltelco ttc on ttc.id = tsd.idTelCo " +
        "where Date(ExpiryDate) = '" + Date1 + "' and IsActive = true";


    connection.query(query1, function(err, GpsExpirydevice, fields) {
        if (!err && GpsExpirydevice.length > 0) {
            function SendExpiryNotification1(i) {
                if (i < GpsExpirydevice.length) {
                    if (GpsExpirydevice[i].ExpiryDate != null) {
                        connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + GpsExpirydevice[i].DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
                            if (!err && Bikerows.length > 0) {
                                var objVehicle = Bikerows[0];
                                connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function(err, lstShareUser, fields) {
                                    var lstAllUser = [objVehicle.iduser];
                                    var AllUser = objVehicle.iduser.toString();
                                    if (!err && lstShareUser.length > 0) {
                                        for (var j = 0; j < lstShareUser.length; j++) {
                                            lstAllUser.push(lstShareUser[j].idUser)
                                            AllUser = AllUser + ',' + lstShareUser[j].idUser;
                                        }

                                    }
                                    connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function(err, objAppInfo, fields) {

                                        var PushNotificationdata = {
                                            title: 'Alert',
                                            message: "Your Tracking for " + GpsExpirydevice[i].DeviceId + " will be expire after a month.",
                                            // Fence: 'Default',
                                            soundname: 'Default',
                                            otherfields: {
                                                deviceid: GpsExpirydevice[i].DeviceId,
                                                Id: objVehicle.id,
                                                VehicleName: objVehicle.Name,
                                                Type: 'Alarm'
                                            }
                                        };

                                        SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
                                        SendExpiryNotification1(i + 1);
                                    });
                                });

                            } else {
                                SendExpiryNotification1(i + 1);

                            }
                        })
                    } else {
                        SendExpiryNotification1(i + 1);
                    }
                }
            }
            SendExpiryNotification1(0);
        }
    });

    //Expire After 15 days notification

    var query2 = "Select DeviceId,Type,IMEI,SerialNum,PhoneNum,Name,AppName,ExpiryDate " +
        "from tblgpsdevice tgd " +
        "inner join tblsimdetails tsd on tgd.idSim = tsd.id inner join tbltelco ttc on ttc.id = tsd.idTelCo " +
        "where Date(ExpiryDate) = '" + convertdateformat(new Date(new Date().getTime() + (15 * 24 * 60 * 60 * 1000)), 4) + "' and IsActive = true";


    connection.query(query2, function(err, GpsExpirydevice, fields) {
        if (!err && GpsExpirydevice.length > 0) {
            function SendExpiryNotification2(i) {
                if (i < GpsExpirydevice.length) {
                    if (GpsExpirydevice[i].ExpiryDate != null) {
                        connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + GpsExpirydevice[i].DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
                            if (!err && Bikerows.length > 0) {
                                var objVehicle = Bikerows[0];
                                connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function(err, lstShareUser, fields) {
                                    var lstAllUser = [objVehicle.iduser];
                                    var AllUser = objVehicle.iduser.toString();
                                    if (!err && lstShareUser.length > 0) {
                                        for (var j = 0; j < lstShareUser.length; j++) {
                                            lstAllUser.push(lstShareUser[j].idUser)
                                            AllUser = AllUser + ',' + lstShareUser[j].idUser;
                                        }

                                    }
                                    connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function(err, objAppInfo, fields) {

                                        var PushNotificationdata = {
                                            title: 'Alert',
                                            message: "Your Tracking for " + GpsExpirydevice[i].DeviceId + " will be expire after 15 days",
                                            // Fence: 'Default',
                                            soundname: 'Default',
                                            otherfields: {
                                                deviceid: GpsExpirydevice[i].DeviceId,
                                                Id: objVehicle.id,
                                                VehicleName: objVehicle.Name,
                                                Type: 'Alarm'
                                            }
                                        };

                                        SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
                                        SendExpiryNotification2(i + 1);
                                    });
                                });

                            } else {
                                SendExpiryNotification2(i + 1);

                            }
                        })
                    } else {
                        SendExpiryNotification2(i + 1);
                    }
                }
            }
            SendExpiryNotification2(0);
        }
    });

    //Expire After 3 days notification

    var query3 = "Select DeviceId,Type,IMEI,SerialNum,PhoneNum,Name,AppName,ExpiryDate " +
        "from tblgpsdevice tgd " +
        "inner join tblsimdetails tsd on tgd.idSim = tsd.id inner join tbltelco ttc on ttc.id = tsd.idTelCo " +
        "where Date(ExpiryDate) = '" + convertdateformat(new Date(new Date().getTime() + (2 * 24 * 60 * 60 * 1000)), 4) + "' and IsActive = true";


    connection.query(query3, function(err, GpsExpirydevice, fields) {
        if (!err && GpsExpirydevice.length > 0) {
            function SendExpiryNotification3(i) {
                if (i < GpsExpirydevice.length) {
                    if (GpsExpirydevice[i].ExpiryDate != null) {
                        connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + GpsExpirydevice[i].DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
                            if (!err && Bikerows.length > 0) {
                                var objVehicle = Bikerows[0];
                                connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function(err, lstShareUser, fields) {
                                    var lstAllUser = [objVehicle.iduser];
                                    var AllUser = objVehicle.iduser.toString();
                                    if (!err && lstShareUser.length > 0) {
                                        for (var j = 0; j < lstShareUser.length; j++) {
                                            lstAllUser.push(lstShareUser[j].idUser)
                                            AllUser = AllUser + ',' + lstShareUser[j].idUser;
                                        }

                                    }
                                    connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function(err, objAppInfo, fields) {

                                        var PushNotificationdata = {
                                            title: 'Alert',
                                            message: "Your Tracking for " + GpsExpirydevice[i].DeviceId + " will be expire after 3 days",
                                            // Fence: 'Default',
                                            soundname: 'Default',
                                            otherfields: {
                                                deviceid: GpsExpirydevice[i].DeviceId,
                                                Id: objVehicle.id,
                                                VehicleName: objVehicle.Name,
                                                Type: 'Alarm'
                                            }
                                        };

                                        SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
                                        SendExpiryNotification3(i + 1);
                                    });
                                });

                            } else {
                                SendExpiryNotification3(i + 1);

                            }
                        })
                    } else {
                        SendExpiryNotification3(i + 1);
                    }
                }
            }
            SendExpiryNotification3(0);
        }
    });

    //Expire Today notification

    var query4 = "Select DeviceId,Type,IMEI,SerialNum,PhoneNum,Name,AppName,ExpiryDate " +
        "from tblgpsdevice tgd " +
        "inner join tblsimdetails tsd on tgd.idSim = tsd.id inner join tbltelco ttc on ttc.id = tsd.idTelCo " +
        "where Date(ExpiryDate) = '" + convertdateformat(new Date(), 4) + "' and IsActive = true";


    connection.query(query4, function(err, GpsExpirydevice, fields) {
        if (!err && GpsExpirydevice.length > 0) {
            function SendExpiryNotification4(i) {
                if (i < GpsExpirydevice.length) {
                    if (GpsExpirydevice[i].ExpiryDate != null) {
                        connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + GpsExpirydevice[i].DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
                            if (!err && Bikerows.length > 0) {
                                var objVehicle = Bikerows[0];
                                connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function(err, lstShareUser, fields) {
                                    var lstAllUser = [objVehicle.iduser];
                                    var AllUser = objVehicle.iduser.toString();
                                    if (!err && lstShareUser.length > 0) {
                                        for (var j = 0; j < lstShareUser.length; j++) {
                                            lstAllUser.push(lstShareUser[j].idUser)
                                            AllUser = AllUser + ',' + lstShareUser[j].idUser;
                                        }

                                    }
                                    connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function(err, objAppInfo, fields) {

                                        var PushNotificationdata = {
                                            title: 'Alert',
                                            message: "Your Tracking for " + GpsExpirydevice[i].DeviceId + " is expire Today",
                                            // Fence: 'Default',
                                            soundname: 'Default',
                                            otherfields: {
                                                deviceid: GpsExpirydevice[i].DeviceId,
                                                Id: objVehicle.id,
                                                VehicleName: objVehicle.Name,
                                                Type: 'Alarm'
                                            }
                                        };

                                        SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
                                        SendExpiryNotification4(i + 1);
                                    });
                                });

                            } else {
                                SendExpiryNotification4(i + 1);

                            }
                        })
                    } else {
                        SendExpiryNotification4(i + 1);
                    }
                }
            }
            SendExpiryNotification4(0);
        }
    });

    // console.log('query', query)

    // connection.query(query, function(err, GpsExpirydevice, fields) {
    //     if (!err && GpsExpirydevice.length > 0) {
    //         function SendExpiryNotification(i) {
    //             if (i < GpsExpirydevice.length) {
    //                 if (GpsExpirydevice[i].ExpiryDate != null) {
    //                     console.log(GpsExpirydevice[i].DeviceId)
    //                     connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + GpsExpirydevice[i].DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
    //                         if (!err && Bikerows.length > 0) {
    //                             var objVehicle = Bikerows[0];
    //                             connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function(err, lstShareUser, fields) {
    //                                 var lstAllUser = [objVehicle.iduser];
    //                                 var AllUser = objVehicle.iduser.toString();
    //                                 if (!err && lstShareUser.length > 0) {
    //                                     for (var j = 0; j < lstShareUser.length; j++) {
    //                                         lstAllUser.push(lstShareUser[j].idUser)
    //                                         AllUser = AllUser + ',' + lstShareUser[j].idUser;
    //                                     }

    //                                 }
    //                                 connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function(err, objAppInfo, fields) {

    //                                     var PushNotificationdata = {
    //                                         title: 'Alert',
    //                                         message: 'This is Test Notification',
    //                                         // Fence: 'Default',
    //                                         soundname: 'Default',
    //                                         otherfields: {
    //                                             deviceid: GpsExpirydevice[i].DeviceId,
    //                                             Id: objVehicle.id,
    //                                             VehicleName: objVehicle.Name,
    //                                             Type: 'Alarm'
    //                                         }
    //                                     };
    //                                     if (convertdateformat((Date1), 4) == convertdateformat((GpsExpirydevice[i].ExpiryDate), 4)) {
    //                                         SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
    //                                     } else if (convertdateformat(new Date(new Date().getTime() - (15 * 24 * 60 * 60 * 1000))) == convertdateformat((GpsExpirydevice[i].ExpiryDate), 4)) {
    //                                         SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
    //                                     } else if (convertdateformat(new Date(new Date().getTime() - (2 * 24 * 60 * 60 * 1000))) == convertdateformat((GpsExpirydevice[i].ExpiryDate), 4)) {
    //                                         SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
    //                                     } else if (convertdateformat(new Date(), 4) == convertdateformat((GpsExpirydevice[i].ExpiryDate), 4)) {
    //                                         SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
    //                                     }
    //                                     SendExpiryNotification(i + 1);
    //                                 });
    //                             });

    //                         } else {
    //                             SendExpiryNotification(i + 1);

    //                         }
    //                     })
    //                 } else {
    //                     SendExpiryNotification(i + 1);
    //                 }
    //             }
    //         }
    //         SendExpiryNotification(0);
    //     }
    // });
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

    } else if (flg == 2) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
    } else if (flg == 3) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
    } else {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}

function SendPushNotification(data, UserId, objAppInfo) {
    // var deviceIds = [];
    connection.query("SELECT PushNotificationId,Platform,MessageCount,UserType,udid from tblpushnotification where iduser in (" + UserId + ") group by PushNotificationId, Platform", function(err, response, fields) {
        if (!err && response.length > 0) {
            // PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {
            function SendNotification(i) {
                if (i < response.length) {
                    var messagecount = 1;
                    if (response[i].MessageCount) {
                        messagecount = parseInt(response[i].MessageCount) + 1;
                    }
                    // connection.query("SELECT * from tblsetting where Name ='" + PushNotificationType + "' ", function(err, lstSetting, fields) {
                    //     if (lstSetting[0].Value == 1) {
                    var deviceIds = [];
                    deviceIds.push(response[i].PushNotificationId)
                        //SendNotification(i + 1);
                        // } else {
                        // console.log(deviceIds)
                    var objData = clone(data);

                    if (response[i].Platform == 'ios') {
                        objData.title = data.message;
                        objData.message = data.message;

                        PushNotificationSettings.apn.options.cert = __dirname + '/../MediaUploads/FileUpload/' + objAppInfo.IOSCertificate;
                        PushNotificationSettings.apn.options.key = __dirname + '/../MediaUploads/FileUpload/' + objAppInfo.IOSKey;

                        PushNotificationSettings.apn.badge = messagecount;

                        if (objData.soundname == 'Default') {
                            PushNotificationSettings.apn.defaultData.sound = 'default';
                        } else {
                            PushNotificationSettings.apn.defaultData.sound = objData.soundname + '.caf';
                        };

                    } else {

                        PushNotificationSettings.gcm.msgcnt = messagecount;
                        PushNotificationSettings.gcm.id = objAppInfo.AndroidId;

                    }
                    // console.log(response[i].Platform + "_______________________________________________________")
                    // console.log(objData)
                    objData.priority = 'high';
                    var objPushNotificationSend = new PushNotifications(PushNotificationSettings);
                    if (deviceIds.length > 0) {

                        objPushNotificationSend.send(deviceIds, objData, function(result) {
                            // console.log(result);
                            connection.query("Update tblpushnotification set messagecount=" + messagecount + " where udid='" + response[i].udid + "' and UserType='" + response[i].UserType + "'", function(errupdate, updateresp, fields) {
                                console.log(errupdate)
                                SendNotification(i + 1);
                            });
                        });
                    } else {
                        SendNotification(i + 1);
                    };
                    //     } else {
                    //         SendNotification(i + 1);
                    //     }
                    // });



                }
            }
            SendNotification(0)
        }

    })
}

module.exports = router