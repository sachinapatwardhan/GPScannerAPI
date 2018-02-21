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

router.get('/GetGeneralInfo', function(req, res) {
    var CompanyName = '';
    var phoneNumber = '';

    if (req.query.AppName == 'HC CARGO') {
        CompanyName = 'CAR PRO AUTO PARTS & ACC. S/B';
        phoneNumber = '603-62581961';
    }
    var obj = new Object();
    obj.CompanyName = CompanyName;
    obj.phoneNumber = phoneNumber;
    res.json({ success: true, data: obj });
})

router.get('/SendTestMail', function(req, res) {

    var mail = {
        from: 'noreply@maark.my',
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

router.get('/GetGeneralInfo', function(req, res) {
    console.log(req.query)
    var CompanyName = '';
    var phoneNumber = '';

    if (req.query.AppName == 'HC CARGO') {
        CompanyName = 'CAR PRO AUTO PARTS & ACC. S/B';
        phoneNumber = '603-62581961';
    }
    var obj = new Object();
    obj.CompanyName = CompanyName;
    obj.phoneNumber = phoneNumber;
    res.json({ success: true, data: obj });
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
            User.findOne({
                where: {
                    username: objUser.username,
                    password: objUser.password
                }
            }).then(function(UserExist) {
                if (UserExist != null) {

                    var tablename = ObjParams.query.tablename;
                    var permission = ObjParams.query.permission;
                    var username = objUser.username;

                    //Get Module
                    Module.findOne({
                        where: {
                            Module: tablename
                        }
                    }).then(function(objModule) {
                        if (objModule != null) {
                            UserInRole.belongsTo(Role, {
                                foreignKey: {
                                    name: 'roleId',
                                    allowNull: false
                                }
                            });
                            UserInRole.findAll({
                                where: {
                                    userId: UserExist.id
                                },
                                include: [{
                                    model: Role
                                }]
                            }).then(function(strRole) {

                                function uploader(i) {
                                    if (i < strRole.length) {

                                        UserPermission.findOne({
                                            where: {
                                                idModule: objModule.id,
                                                RoleName: strRole[i].tblrole.RoleName
                                            }
                                        }).then(function(objUserPermission) {
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
                    to: 'soham.patel@bugzstudio.com,pmt@bugzstudio.com',
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
                var Month = objDate.toLocaleString(locale, {
                    month: "short"
                });
                var Year = objDate.getUTCFullYear();
                var result = nodeExcel.execute(conf);
                var ConsoleStream = fs.createWriteStream('MediaUploads/UserReportFileUpload/MonthlyUserReport__' + Month + '_' + Year + '.xlsx');
                ConsoleStream.write(result, 'binary');
                ConsoleStream.end();

                var mail = {
                    from: 'soham.patel@bugzstudio.com',
                    to: 'soham.patel@bugzstudio.com,pmt@bugzstudio.com',
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


router.get('/GetMobileLanguageData', function(req, res) {
        // var translations = {
        //     "en-GB": {
        //         //English Language
        //         "Home": "Home",
        //         "Events": "Events",
        //         "Pet Shop": "Pet Shop",
        //         "My Pet": "My Pet",
        //         "My Profile": "My Profile",
        //         "About us": "About us",
        //         "Contact us": "Contact us",
        //         "Feedback": "Feedback",
        //         "Connect Facebook": "Connect Facebook",
        //         "Logout Facebook": "Logout Facebook",
        //         "Login": "Login",
        //         "Pettorway Login": "Pettorway Login",
        //         "Logout": "Logout",
        //         "Share This App": "Share This App",
        //         "About": "About",
        //         "Cancel": "Cancel",
        //         "Register": "Register",
        //         "OR": "OR",
        //         "Email": "Email",
        //         "Password": "Password",
        //         "Mobile Phone": "Mobile Phone",
        //         "Required Email Message": "Please Enter Email Id.",
        //         "Valid Email Message": "Please Enter Valid Email address.",
        //         "Required Password Message": "Please Enter Password.",
        //         "Valid Password Message": "Passwords must be between 2 and 20 characters.",
        //         "Required Phone Message": "Please Enter Phone Number.",
        //         "Likes": "Likes",
        //         "Comments": "Comments",
        //         "Write a Comment": "Write a Comment...",
        //         "Post": "Post",
        //         "FacebookLoginMessage": "You need to login to Facebook to perform this action. Do you want to login now?",
        //         "Yes": "Yes",
        //         "No": "No",
        //         "Facebook Login": "Facebook Login",
        //         "Add Pet": "Add Pet",
        //         "Fence": "Fence",
        //         "Power Saving": "Power Saving",
        //         "Action For": "Action For",
        //         "Home Wifi Settings": "Home Wifi Settings",
        //         "Adventures": "Adventures",
        //         "Show Alarms": "Show Alarms",
        //         "Delete Pet": "Delete Pet",
        //         "DeviceConnectedMessage": "Device is connected to",
        //         "DeviceNotConnectedMessage": "Device is currently not connected to Wifi.",
        //         "NoNetworkFoundMessage": "No Network Found.",
        //         "Alarms": "Alarms",
        //         "Clear": "Clear",
        //         "Fence In": "Fence In",
        //         "Fence Out": "Fence Out",
        //         "Low Battery": "Low Battery",
        //         "NoAlarmsMessage": "No Alarms Found",
        //         "Ok": "Ok",
        //         "DeletePetConfirmMessage": "Are you sure?",
        //         "Search Country": "Search Country",
        //         "Registration Failed!": "Registration Failed!",
        //         "Please Try again later.": "Please Try again later.",
        //         "OTP send Failed!": "OTP send Failed!",
        //         "Register Successfully": "Register Successfully",
        //         "OTP": "OTP",
        //         "Enter OTP": "Enter OTP",
        //         "Submit": "Submit",
        //         "Resend OTP After": "Resend OTP After",
        //         "Minutes": "Minutes",
        //         "Resend OTP": "Resend OTP",
        //         "Invalid OTP!": "Invalid OTP!",
        //         "InvalidOTPMessage": "Please check OTP. otherwise try to Resend OTP.",
        //         "OTP send Successfully!": "OTP send Successfully!",
        //         "OTPSendMessage": "OTP was send to your registered phone.",
        //         "Liked": "Liked",
        //         "UnLiked": "UnLiked",
        //         "Could not perform action": "Could not perform action",
        //         "Commented": "Commented",
        //         "Could not Commented": "Could not Commented",
        //         "Could not Connect to Facebook": "Could not Connect to Facebook",
        //         "No Location Found": "No Location Found",
        //         "Connected to Facebook": "Connected to Facebook",
        //         "Logout to Facebook": "Logout to Facebook",
        //         "Could not Logout to Facebook": "Could not Logout to Facebook",
        //         "Save": "Save",
        //         "Remove": "Remove",
        //         "Menu": "Menu",
        //         "Updating Working Mode": "Updating Working Mode",
        //         "Working Mode Fence Message": "Working Mode set to Fence Successfully.",
        //         "Working Mode Standby Message": "Working Mode set to Standby Successfully.",
        //         "Working Mode Tracking Message": "Working Mode set to Tracking Successfully.",
        //         "Wifi setting Deleted": "Wifi setting Deleted",
        //         "Wifi setting saved": "Wifi setting saved",
        //         "Alarms cleared": "Alarms cleared",
        //         "Oops! Alarms not cleared": "Oops! Alarms not cleared",
        //         "No Advanture Found": "No Advanture Found",
        //         "Select Date": "Select Date",
        //         "Name": "Name",
        //         "Country": "Country",
        //         "State": "State",
        //         "City": "City",
        //         "Change Password": "Change Password",

        //         "Your profile has been updated successfully.": "Your profile has been updated successfully.",
        //         "Your profile has not been updated.": "Your profile has not been updated.",
        //         "Take Picture": "Take Picture",
        //         "From Gallery": "From Gallery",
        //         "Camera open permission denied. Please enable permission.": "Camera open permission denied. Please enable permission.",
        //         "Uploading": "Uploading",
        //         "Please Wait": "Please Wait",
        //         "Success!": "Success!",
        //         "Image does not Uploaded": "Image does not Uploaded",
        //         "Please try again Latter": "Please try again Latter",
        //         "Old Password": "Old Password",
        //         "New Password": "New Password",
        //         "Confirm Password": "Confirm Password",
        //         "Required OldPassword Message": "Please Enter Old Password.",
        //         "Required NewPassword Message": "Please Enter New Password.",
        //         "Required ConfirmPassword Message": "Please Enter Confirm Password.",
        //         "Password mismatch!": "Password mismatch!",
        //         "mismatch Password Message": "Your New password and Confirm password does not match.",
        //         "Call": "Call",
        //         "Facebook": "Facebook",
        //         "Twitter": "Twitter",
        //         "Error!": "Error!",
        //         "No Pet Fount": "No Pet Fount",
        //         "Pet Added Successfully": "Pet Added Successfully",
        //         "Pet Info Updated Successfully": "Pet Info Updated Successfully",
        //         "Add New Pet": "Add New Pet",
        //         "Pet Name Required!": "Pet Name Required!",
        //         "Pet Type Required!": "Pet Type Required!",
        //         "Pet Location Required!": "Pet Location Required!",
        //         "Birthday Required!": "Birthday Required!",
        //         "DeviceId Required!": "DeviceId Required!",
        //         "Renewal Date Required!": "Renewal Date Required!",
        //         //Latest
        //         "Standby": "Standby",
        //         "Credit Expire Date": "Credit Expire Date",
        //         "Credit Expire Date Required!": "Credit Expire Date Required!",
        //         "Breed": "Breed",
        //         "Weight": "Weight",
        //         "Device": "Device",
        //         "Alarm list": "Alarm list",

        //         "Travelled": "Travelled",
        //         "Top Speed": "Top Speed",
        //         "Average Speed": "Average Speed",
        //         "Total Record": "Total Record",
        //         "Distance": "Distance",
        //         "Max. Speed": "Max. Speed",
        //         "Average Adventure Distance": "Average Adventure Distance",
        //         "Longest Adventure Distance": "Longest Adventure Distance",
        //         "km": "km",
        //         "km/h": "km/h",
        //         "Sign Up": "Sign Up",
        //         "Tracking": "Tracking",
        //         "Password Send Successfully message": "New Password sent successfully.<br>Please check your email.",
        //         "Forgot Password": "Forgot Password",
        //         "Reset": "Reset",

        //         //new
        //         "Full Name": "Full Name",
        //         "Subject": "Subject",
        //         "Message": "Message",
        //         "Send Feedback": "Send Feedback",
        //         "Please Enter Full Name": "Please Enter Full Name",
        //         "Please Enter Subject": "Please Enter Subject",
        //         "Please Enter Enquiry": "Please Enter Enquiry",
        //         "FOLLOW US": "Follow Us",

        //         //new
        //         "Login Failed!": "Login Failed!",
        //         "Invalid Username or Password": "Invalid Username or Password",
        //         "Play": "Play",
        //         "Pause": "Pause",
        //         "Device Located": "Device Located",
        //         "I am at home.": "I am at home.",
        //         "Loading": "Loading",
        //         "Please set Fence": "Please set Fence",
        //         "Birthday": "Birthday",
        //         "Device Id": "Device Id",
        //         "Renewal Date": "Renewal Date",
        //         "Edit": "Edit",
        //         "Location": "Location",
        //         "Navigate": "Navigate",
        //         "Gender": "Gender",
        //         "Pet Location": "Pet Location",
        //         "Profile": "Profile",
        //         "Pet Name": "Pet Name",
        //         "Pet Type": "Pet Type",
        //         "User cancelling dialog": "User cancelling dialog",
        //         "Profile": "Profile",

        //     },
        //     "zh-CN": {
        //         //Chienese Language
        //         "Home": "家",
        //         "Events": "活动",
        //         "Pet Shop": "宠物商店",
        //         "My Pet": "我的宠物",
        //         "My Profile": "我的简历",
        //         "About us": "关于我们",
        //         "Contact us": "联系我们",
        //         "Feedback": "反馈",
        //         "Connect Facebook": "Facebook的连接",
        //         "Logout Facebook": "Facebook的注销",
        //         "Login": "登录",
        //         "Pettorway Login": "Pettorway登录",
        //         "Logout": "登出",
        //         "Share This App": "分享这个应用程式",
        //         "About": "关于",
        //         "Cancel": "取消",
        //         "Register": "寄存器",
        //         "OR": "要么",
        //         "Email": "電子郵件",
        //         "Password": "密码",
        //         "Mobile Phone": "移动电话",
        //         "Required Email Message": "请输入电子邮件ID 。",
        //         "Valid Email Message": "请输入有效的电子邮件地址。",
        //         "Required Password Message": "请输入密码。",
        //         "Valid Password Message": "密码必须在2到20个字符之间。",
        //         "Required Phone Message": "请输入电话号码。",
        //         "Likes": "喜歡",
        //         "Comments": "注释",
        //         "Write a Comment": "写一个评论...",
        //         "Post": "岗位",
        //         "FacebookLoginMessage": "您需要登录到Facebook来执行此操作。你想现在登录？",
        //         "Yes": "是",
        //         "No": "没有",
        //         "Facebook Login": "Facebook登入",
        //         "Add Pet": "添加宠物",
        //         "Fence": "篱笆",
        //         "Power Saving": "省电",
        //         "Action For": "对于行动",
        //         "Home Wifi Settings": "家庭WiFi设置",
        //         "Adventures": "冒险",
        //         "Show Alarms": "显示警报",
        //         "Delete Pet": "删除宠物",
        //         "DeviceConnectedMessage": "装置被连接到",
        //         "DeviceNotConnectedMessage": "设备当前没有连接到无线网络。",
        //         "NoNetworkFoundMessage": "没有网络找到。",
        //         "Alarms": "警报",
        //         "Clear": "明确",
        //         "Fence In": "围栏",
        //         "Fence Out": "隔开",
        //         "Low Battery": "低电量",
        //         "NoAlarmsMessage": "没有发现报警",
        //         "Ok": "好",
        //         "DeletePetConfirmMessage": "你确定？",
        //         "Search Country": "搜索国家",
        //         "Registration Failed!": "注册失败！",
        //         "Please Try again later.": "请稍后再试。",
        //         "OTP send Failed!": "OTP发送失败！",
        //         "Register Successfully": "注册成功",
        //         "OTP": "OTP",
        //         "Enter OTP": "输入OTP",
        //         "Submit": "提交",
        //         "Resend OTP After": "重新发送后， OTP",
        //         "Minutes": "分钟",
        //         "Resend OTP": "重新发送OTP",
        //         "Invalid OTP!": "OTP无效！",
        //         "InvalidOTPMessage": "请检查OTP 。否则尝试重新发送OTP 。",
        //         "OTP send Successfully!": "OTP发送成功！",
        //         "OTPSendMessage": "OTP被发送到您注册的电话。",
        //         "Liked": "喜欢",
        //         "UnLiked": "不再喜欢",
        //         "Could not perform action": "无法执行操作",
        //         "Commented": "评论",
        //         "Could not Commented": "无法评论",
        //         "Could not Connect to Facebook": "无法连接到Facebook",
        //         "No Location Found": "发现没有位置",
        //         "Connected to Facebook": "连接至Facebook",
        //         "Logout to Facebook": "注销Facebook的",
        //         "Could not Logout to Facebook": "无法注销Facebook的",
        //         "Save": "保存",
        //         "Remove": "去掉",
        //         "Menu": "菜单",
        //         "Updating Working Mode": "更新工作模式",
        //         "Working Mode Fence Message": "工作模式设置围栏成功。",
        //         "Working Mode Standby Message": "工作模式设置为待机成功。",
        //         "Working Mode Tracking Message": "工作模式设置为成功跟踪。",
        //         "Wifi setting Deleted": "无线设置删除",
        //         "Wifi setting saved": "无线设置保存",
        //         "Alarms cleared": "清除报警",
        //         "Oops! Alarms not cleared": "哎呀！警报不会被清除",
        //         "No Advanture Found": "没有找到Advanture",
        //         "Select Date": "选择日期",
        //         "Name": "名称",
        //         "Country": "国家",
        //         "State": "州",
        //         "City": "市",
        //         "Change Password": "更改密码",

        //         "Your profile has been updated successfully.": "您的个人资料已成功更新。",
        //         "Your profile has not been updated.": "您的个人资料尚未更新。",
        //         "Take Picture": "拍照片",
        //         "From Gallery": "从画廊",
        //         "Camera open permission denied. Please enable permission.": "相机打开权限被拒绝。请启用许可。",
        //         "Uploading": "上传",
        //         "Please Wait": "请稍候",
        //         "Success!": "成功！",
        //         "Image does not Uploaded": "图像不上传",
        //         "Please try again Latter": "请重试后期",
        //         "Old Password": "旧密码",
        //         "New Password": "新密码",
        //         "Confirm Password": "确认密码",
        //         "Required OldPassword Message": "请输入旧密码。",
        //         "Required NewPassword Message": "请输入新密码。",
        //         "Required ConfirmPassword Message": "请输入确认密码。",
        //         "Password mismatch!": "密码不匹配！",
        //         "mismatch Password Message": "新密码和确认密码不匹配。",
        //         "Call": "呼叫",
        //         "Facebook": "Facebook的",
        //         "Twitter": "推特",
        //         "Error!": "错误！",
        //         "No Pet Fount": "没有润版液宠物",
        //         "Pet Added Successfully": "宠物添加成功",
        //         "Pet Info Updated Successfully": "宠物信息更新成功",
        //         "Add New Pet": "添加新宠物",
        //         "Pet Type Required!": "宠物类型必需！",
        //         "Pet Name Required!": "宠物名称必需！",
        //         "Pet Location Required!": "宠物位置所需！",
        //         "Birthday Required!": "生日必选！",
        //         "DeviceId Required!": "设备id必选！",
        //         "Renewal Date Required!": "需要更新日期！",
        //         //Latest
        //         "Standby": "支持",
        //         "Credit Expire Date": "信用卡到期日期",
        //         "Credit Expire Date Required!": "必需的信用失效日期！",
        //         "Breed": "品种",
        //         "Weight": "重量",
        //         "Device": "设备",
        //         "Alarm list": "报警列表",

        //         "Travelled": "旅行",
        //         "Top Speed": "最高速度",
        //         "Average Speed": "平均速度",
        //         "Total Record": "总记录",
        //         "Distance": "距离",
        //         "Max. Speed": "最大。速度",
        //         "Average Adventure Distance": "平均距离冒险",
        //         "Longest Adventure Distance": "最长的冒险距离",
        //         "km": "千米",
        //         "km/h": "公里/小时",
        //         "Sign Up": "注册",
        //         "Tracking": "跟踪",
        //         "Password Send Successfully message": "新密码发送successfully.<br>Please检查你的电子邮件。",
        //         "Forgot Password": "忘记密码",
        //         "Reset": "重启",

        //         //new
        //         "Full Name": "全名",
        //         "Subject": "主题",
        //         "Message": "信息",
        //         "Send Feedback": "发送反馈",
        //         "Please Enter Full Name": "请输入全名",
        //         "Please Enter Email": "请输入电子邮件",
        //         "Please Enter Subject": "请输入主题",
        //         "Please Enter Enquiry": "请输入查询",
        //         "FOLLOW US": "关注我们",

        //         //new
        //         "Login Failed!": "登录失败！",
        //         "Invalid Username or Password": "无效的用戶名或密码",
        //         "Play": "播放",
        //         "Pause": "暂停",
        //         "Device Located": "定位成功",
        //         "I am at home.": "我在家",
        //         "Loading": "加载",
        //         "Please set Fence": "请设置转栏",
        //         "Birthday": "生日",
        //         "Device Id": "设备ID",
        //         "Renewal Date": "更新日期",
        //         "Edit": "编辑",
        //         "Location": "位置",
        //         "Navigate": "导航",
        //         "Gender": "性別",
        //         "Pet Location": "P宠物地址",
        //         "Profile": "Profil",
        //         "Pet Name": "爱称",
        //         "Pet Type": "宠物类型",
        //         "User cancelling dialog": "用戶取消对话框",
        //         "Profile": "简历",
        //     },
        //     "de-DE": {
        //         //German Language
        //         "Home": "Zuhause",
        //         "Events": "Veranstaltungen",
        //         "Pet Shop": "Tierhandlung",
        //         "My Pet": "Mein Haustier",
        //         "My Profile": "Mein Profil",
        //         "About us": "Über uns",
        //         "Contact us": "Kontaktiere uns",
        //         "Feedback": "Feedback",
        //         "Connect Facebook": "Verbinden Sie Facebook",
        //         "Logout": "Ausloggen",
        //         "Login": "Anmeldung",
        //         "Logout Facebook": "Abmelden Facebook",
        //         "Likes": "Mögen",
        //         "Comments": "Kommentar",
        //         "Pettorway Login": "Pettorway Login",
        //         "Share This App": "Share This App",
        //         "About": "About",
        //         "Cancel": "Cancel",
        //         "Register": "Neu registrieren",
        //         "OR": "OR",
        //         "Email": "Email",
        //         "Password": "Passwort",
        //         "Mobile Phone": "Mobiltelefon",
        //         "Required Email Message": "Bitte geben Sie E-Mail -ID .",
        //         "Valid Email Message": "Bitte geben Sie eine gültige Email Adresse an.",
        //         "Required Password Message": "Bitte Passwort eingeben.",
        //         "Valid Password Message": "Passwörter müssen zwischen 2 und 20 Zeichen lang sein.",
        //         "Required Phone Message": "Bitte Telefonnummer  eingeben .",
        //         "Write a Comment": "Schreibe einen Kommentar...",
        //         "Post": "Post",
        //         "FacebookLoginMessage": "Sie müssen Facebook anmelden diese action.Do Sie jetzt anmelden möchten ausführen?",
        //         "Yes": "ja",
        //         "No": "Nein",
        //         "Facebook Login": "Facebook Anmeldung",
        //         "Add Pet": "In Pet",
        //         "Fence": "Zaun",
        //         "Power Saving": "Energiespar",
        //         "Action For": "Aktion für",
        //         "Home Wifi Settings": "Startseite Wifi -Einstellungen",
        //         "Adventures": "Abenteuer",
        //         "Show Alarms": "Alarme anzeigen",
        //         "Delete Pet": "löschen Pet",
        //         "DeviceConnectedMessage": "Das Gerät ist mit",
        //         "DeviceNotConnectedMessage": "Das Gerät ist momentan nicht mit einem WLAN verbunden .",
        //         "NoNetworkFoundMessage": "Kein Netzwerk gefunden .",
        //         "Alarms": "Alarm",
        //         "Clear": "Klar",
        //         "Fence In": "einzäunen",
        //         "Fence Out": "Fence Out",
        //         "Low Battery": "Niedriger Batteriestatus",
        //         "NoAlarmsMessage": "Keine Alarme gefunden",
        //         "Ok": "Ok",
        //         "DeletePetConfirmMessage": "Bist du sicher?",
        //         "Search Country": "Suchen Land",
        //         "Registration Failed!": "Registrierung fehlgeschlagen!",
        //         "Please Try again later.": "Bitte versuchen Sie es später noch einmal .",
        //         "OTP send Failed!": "OTP gesendet werden konnte !",
        //         "Register Successfully": "Registrieren Erfolgreich",

        //         "OTP": "OTP",
        //         "Enter OTP": "Geben Sie OTP",
        //         "Submit": "einreichen",
        //         "Resend OTP After": "Erneut senden OTP Nach",
        //         "Minutes": "Protokoll",
        //         "Resend OTP": "Erneut senden OTP",
        //         "Invalid OTP!": "Ungültige OTP !",
        //         "InvalidOTPMessage": "Bitte überprüfen Sie OTP . ansonsten versuchen OTP erneut zu senden.",
        //         "OTP send Successfully!": "OTP senden Erfolgreich !",
        //         "OTPSendMessage": "OTP wurde in Ihrem registrierten Telefon senden.",
        //         "Liked": "Zufrieden",
        //         "UnLiked": "unliked",
        //         "Could not perform action": "Konnte nicht Aktion durchführen",
        //         "Commented": "kommentiert",
        //         "Could not Commented": "Konnte nicht kommentiert",
        //         "Could not Connect to Facebook": "Es konnte keine Verbindung zu Facebook",
        //         "No Location Found": "Kein Ort gefunden",
        //         "Connected to Facebook": "Verbunden mit Facebook",
        //         "Logout to Facebook": "Abmelden Book",
        //         "Could not Logout to Facebook": "Konnte nicht an Facebook Abmelden",
        //         "Save": "sparen",
        //         "Remove": "Entfernen",

        //         "Menu": "Menü",
        //         "Updating Working Mode": "Aktualisieren der Arbeitsmodus",
        //         "Working Mode Fence Message": "Arbeitsmodus gesetzt Erfolgreich in den Zaun .",
        //         "Working Mode Standby Message": "Arbeitsmodus gesetzt Erfolgreich in den Standby-Modus.",
        //         "Working Mode Tracking Message": "Arbeitsmodus gesetzt erfolgreich zu verfolgen.",
        //         "Wifi setting Deleted": "Wifi Einstellung Gelöschte",
        //         "Wifi setting saved": "Wifi Einstellung gespeichert",
        //         "Alarms cleared": "Alarme gelöscht",
        //         "Oops! Alarms not cleared": "Hoppla! Alarme nicht gelöscht",
        //         "No Advanture Found": "Keine Advanture gefunden",
        //         "Select Date": "Wählen Sie Datum",
        //         "Name": "Name",
        //         "Country": "Land",
        //         "State": "Bundesland",
        //         "City": "Stadt",
        //         "Change Password": "Passwort ändern",

        //         "Your profile has been updated successfully.": "Dein Profil wurde erfolgreich aktualisiert.",
        //         "Your profile has not been updated.": "Ihr Profil wurde nicht aktualisiert.",
        //         "Take Picture": "Ein Bild machen",
        //         "From Gallery": "aus Galerie",
        //         "Camera open permission denied. Please enable permission.": "Kamera öffnen die Erlaubnis verweigert . Bitte aktivieren Sie diese Erlaubnis .",
        //         "Uploading": "Hochladen",
        //         "Please Wait": "Warten Sie mal",
        //         "Success!": "Erfolg!",
        //         "Image does not Uploaded": "Bild nicht hochgeladen",
        //         "Please try again Latter": "Bitte versuchen Sie es erneut Letzten",
        //         "Old Password": "Altes Passwort",
        //         "New Password": "Neues Kennwort",
        //         "Confirm Password": "Bestätige das Passwort",
        //         "Required OldPassword Message": "Bitte altes Passwort eingeben .",
        //         "Required NewPassword Message": "Bitte neues Passwort .",
        //         "Required ConfirmPassword Message": "Bitte Passwort eingeben bestätigen .",
        //         "Password mismatch!": "Die Passwörter stimmen nicht überein!",
        //         "mismatch Password Message": "Ihr neues Passwort und Passwort bestätigen stimmt nicht überein .",
        //         "Call": "Anruf",
        //         "Facebook": "Facebook",
        //         "Twitter": "zwitschern",
        //         "Error!": "Fehler!",
        //         "No Pet Fount": "Kein Haustier Fount",
        //         "Pet Added Successfully": "Pet Erfolgreich",
        //         "Pet Info Updated Successfully": "Pet Info erfolgreich aktualisiert",
        //         "Add New Pet": "New Pet",
        //         "Pet Type Required!": "Pet Typ Erforderlich !",
        //         "Pet Name Required!": "Pet Name Erforderlich !",
        //         "Pet Location Required!": "Pet Ort erforderlich!",
        //         "Birthday Required!": "Geburtstag erforderlich!",
        //         "DeviceId Required!": "DeviceId erforderlich!",
        //         "Renewal Date Required!": "Verlängerungsdatum erforderlich!",
        //         //Latest
        //         "Standby": "Bereithalten",
        //         "Credit Expire Date": "Ablaufen Kredit Datum",
        //         "Credit Expire Date Required!": "Kreditablaufdatum erforderlich!",
        //         "Breed": "Rasse",
        //         "Weight": "Gewicht",
        //         "Device": "Gerät",
        //         "Alarm list": "Alarmliste",

        //         "Travelled": "gereist",
        //         "Top Speed": "Höchstgeschwindigkeit",
        //         "Average Speed": "Durchschnittsgeschwindigkeit",
        //         "Total Record": "insgesamt Bilanz",
        //         "Distance": "Entfernung",
        //         "Max. Speed": "Max. Geschwindigkeit",
        //         "Average Adventure Distance": "Durchschnittliche Entfernung Advanture",
        //         "Longest Adventure Distance": "Längste Abenteuer Entfernung",
        //         "km": "km",
        //         "km/h": "km/h",
        //         "Sign Up": "Anmelden",
        //         "Tracking": "Verfolgung",
        //         "Password Send Successfully message": "Neues Passwort gesendet successfully.<br>Please Ihre E-Mail überprüfen.",
        //         "Forgot Password": "Passwort vergessen",
        //         "Reset": "zurückstellen",

        //         //new
        //         "Login Failed!": "Anmeldung fehlgeschlagen!",
        //         "Invalid Username or Password": "Ungültiger Benutzername oder Passwort",
        //         "Play": "Spielen",
        //         "Pause": "Pause",
        //         "Device Located": "Geräts",
        //         "I am at home.": "Ich bin zu Hause.",
        //         "Loading": "Laden",
        //         "Please set Fence": "Bitte setzen Sie Zaun",
        //         "Birthday": "Geburtstag",
        //         "Device Id": "Geräte ID",
        //         "Renewal Date": "Verlängerungsdatum",
        //         "Edit": "Bearbeiten",
        //         "Location": "Ort",
        //         "Navigate": "Navigieren",
        //         "Gender": "Geschlecht",
        //         "Pet Location": "Pet Ort",
        //         "Profile": "Profil",
        //         "Pet Name": "Haustiername",
        //         "Pet Type": "Pet Art",
        //         "User cancelling dialog": "Benutzer Cancelling Dialog",
        //         "Gender": "Geschlecht",
        //         "Pet Location": "Pet Ort",
        //         "Profile": "Profil",
        //         "Pet Name": "Haustiername",
        //         "Pet Type": "Pet Art",
        //         "Full Name": "Vollständiger Name",
        //         "Subject": "Fach",
        //         "Message": "Nachricht",
        //         "Send Feedback": "Feedback abschicken",
        //         "Please Enter Full Name": "Bitte Vollständiger Name",
        //         "Please Enter Email": "Bitte E-Mail eingeben",
        //         "Please Enter Subject": "Bitte geben Sie Betreff",
        //         "Please Enter Enquiry": "Bitte geben Sie Anfrage",
        //         "FOLLOW US": "FOLGE UNS",

        //     },
        //     "es-ES": {
        //         //Spanish Language
        //         "Home": "Casa",
        //         "Events": "Eventos",
        //         "Pet Shop": "La tienda de animales",
        //         "My Pet": "Mi mascota",
        //         "My Profile": "Mi perfil",
        //         "About us": "Sobre nosotros",
        //         "Contact us": "Contáctenos",
        //         "Feedback": "Realimentación",
        //         "Connect Facebook": "Conectar Facebook",
        //         "Logout Facebook": "Cerrar sesión Facebook",
        //         "Login": "Iniciar sesión",
        //         "Pettorway Login": "entrada Pettorway",
        //         "Logout": "Cerrar sesión",
        //         "Share This App": "Comparte esta",
        //         "About": "Acerca de",
        //         "Cancel": "Cancel",
        //         "Register": "Registro",
        //         "OR": "OR",
        //         "Email": "Email",
        //         "Password": "Contraseña",
        //         "Mobile Phone": "Teléfono móvil",
        //         "Required Email Message": "Por favor, introduzca ID de correo electrónico .",
        //         "Valid Email Message": "Por favor ingrese una dirección de correo electrónico válida.",
        //         "Required Password Message": "Por favor, ingrese contraseña.",
        //         "Valid Password Message": "Las contraseñas deben tener entre 2 y 20 caracteres .",
        //         "Required Phone Message": "Por favor Introducir número de teléfono .",
        //         "Likes": "Gustó",
        //         "Comments": "comentarios",
        //         "Write a Comment": "Escribir un comentario",
        //         "Post": "Post",
        //         "FacebookLoginMessage": "Es necesario iniciar sesión en Facebook para realizar esta action.Do desea iniciar sesión ahora?",
        //         "Yes": "Sí",
        //         "No": "No",
        //         "Facebook Login": "Facebook Login",
        //         "Add Pet": "Añadir para mascotas",
        //         "Fence": "Cerca",
        //         "Power Saving": "Ahorro de energía",
        //         "Action For": "Por la acción",
        //         "Home Wifi Settings": "Ajustes WiFi doméstica",
        //         "Adventures": "aventuras",
        //         "Show Alarms": "Show Alarms",
        //         "Delete Pet": "eliminar de mascotas",
        //         "DeviceConnectedMessage": "El dispositivo no conectado. Pruebe después de 5 minutos",
        //         "DeviceNotConnectedMessage": "Actualmente dispositivo no está conectado a Wi-Fi .",
        //         "NoNetworkFoundMessage": "No se encontró ninguna red .",
        //         "Alarms": "alarmas",
        //         "Clear": "Claro",
        //         "Fence In": "En la cerca",
        //         "Fence Out": "Fuera de la cerca",
        //         "Low Battery": "Batería baja",
        //         "NoAlarmsMessage": "No Alarms Found",
        //         "Ok": "DE ACUERDO",
        //         "DeletePetConfirmMessage": "¿Estás seguro?",
        //         "Search Country": "Buscar País",
        //         "Registration Failed!": "¡Registro fallido!",
        //         "Please Try again later.": "Por favor, inténtelo de nuevo más tarde.",
        //         "OTP send Failed!": "OTP Enviar Error!",
        //         "Register Successfully": "regístrese con éxito",

        //         "OTP": "OTP",
        //         "Enter OTP": "Introduzca OTP",
        //         "Submit": "Enviar",
        //         "Resend OTP After": "Después de volver a enviar OTP",
        //         "Minutes": "Minutos",
        //         "Resend OTP": "Reenviar mensaje de OTP",
        //         "Invalid OTP!": "OTP no válido !",
        //         "InvalidOTPMessage": "Por favor, compruebe OTP . de otro modo tratar de enviarlo OTP .",
        //         "OTP send Successfully!": "OTP enviar con éxito !",
        //         "OTPSendMessage": "OTP fue enviada a su teléfono registrado .",
        //         "Liked": "Gustó",
        //         "UnLiked": "unliked",
        //         "Could not perform action": "No se pudo realizar la acción",
        //         "Commented": "comentado",
        //         "Could not Commented": "No se pudo Comentadas",
        //         "Could not Connect to Facebook": "No se pudo conectar a Facebook",
        //         "No Location Found": "No Ubicación encontrado",
        //         "Connected to Facebook": "Conectado a Facebook",
        //         "Logout to Facebook": "Cerrar sesión con Facebook",
        //         "Could not Logout to Facebook": "No se pudo Cerrar sesión con Facebook",
        //         "Save": "Salvar",
        //         "Remove": "retirar",

        //         "Menu": "Menú",
        //         "Updating Working Mode": "Actualización de Modo de trabajo",
        //         "Working Mode Fence Message": "Modo de trabajo establecido en la cerca con éxito .",
        //         "Working Mode Standby Message": "Modo de trabajo en Standby con éxito .",
        //         "Working Mode Tracking Message": "Modo de trabajo establecido en seguimiento correcto .",
        //         "Wifi setting Deleted": "Suprimido configuración wifi",
        //         "Wifi setting saved": "configuración wifi guardados",
        //         "Alarms cleared": "alarmas borran",
        //         "Oops! Alarms not cleared": "Ups! Las alarmas no borran",
        //         "No Advanture Found": "No se han encontrado Advanture",
        //         "Select Date": "Seleccione fecha",
        //         "Name": "Nombre",
        //         "Country": "País",
        //         "State": "Estado",
        //         "City": "Ciudad",
        //         "Change Password": "Cambia la contraseña",

        //         "Your profile has been updated successfully.": "Tu perfil ha sido actualizado exitosamente.",
        //         "Your profile has not been updated.": "Su perfil no se ha actualizado .",
        //         "Take Picture": "Tomar la foto",
        //         "From Gallery": "Desde la Galería",
        //         "Camera open permission denied. Please enable permission.": "Cámara abierta permiso denegado. Por favor, activa el permiso .",
        //         "Uploading": "Subiendo",
        //         "Please Wait": "Por favor espera",
        //         "Success!": "¡Éxito!",
        //         "Image does not Uploaded": "La imagen no Subido",
        //         "Please try again Latter": "Por favor, inténtelo de nuevo los Últimos",
        //         "Old Password": "Contraseña anterior",
        //         "New Password": "nueva contraseña",
        //         "Confirm Password": "Confirmar contraseña",
        //         "Required OldPassword Message": "Por favor, introduzca la contraseña antigua .",
        //         "Required NewPassword Message": "Por favor, introduzca la nueva contraseña .",
        //         "Required ConfirmPassword Message": "Por favor, introduzca Confirmar contraseña .",
        //         "Password mismatch!": "¡Contraseña no coincide!",
        //         "mismatch Password Message": "Su nueva contraseña y Confirmar contraseña no coincide .",
        //         "Call": "Llamada",
        //         "Facebook": "Facebook",
        //         "Twitter": "Gorjeo",
        //         "Error!": "¡Error!",
        //         "No Pet Fount": "Sin Manantial de mascotas",
        //         "Pet Added Successfully": "Mascota añadido correctamente",
        //         "Pet Info Updated Successfully": "Información de mascota actualizado correctamente",
        //         "Add New Pet": "Añadir nueva mascota",
        //         "Pet Type Required!": "Tipo Obligatorio mascota !",
        //         "Pet Name Required!": "Nombre Requerido para mascotas !",
        //         "Pet Location Required!": "Pet Ubicación requerida!",
        //         "Birthday Required!": "Cumpleaños requerida!",
        //         "DeviceId Required!": "DeviceId requerida!",
        //         "Renewal Date Required!": "Fecha de renovación requerida!",
        //         //Latest
        //         "Standby": "Colocarse",
        //         "Credit Expire Date": "La fecha de vencimiento del crédito",
        //         "Credit Expire Date Required!": "La fecha de vencimiento de crédito requerida!",
        //         "Breed": "Raza",
        //         "Weight": "Peso",
        //         "Device": "Dispositivo",
        //         "Alarm list": "lista de alarmas",

        //         "Travelled": "viajado",
        //         "Top Speed": "Velocidad máxima",
        //         "Average Speed": "Velocidad media",
        //         "Total Record": "Grabar total",
        //         "Distance": "Distancia",
        //         "Max. Speed": "Max . Velocidad",
        //         "Average Adventure Distance": "Distancia media Aventura",
        //         "Longest Adventure Distance": "Distancia más larga aventura",
        //         "km": "km",
        //         "km/h": "km/h",
        //         "Sign Up": "Regístrate",
        //         "Tracking": "Rastreo",
        //         "Password Send Successfully message": "Nueva contraseña enviada successfully.<br>Please comprobar su correo electrónico.",
        //         "Forgot Password": "Se te olvidó tu contraseña",
        //         "Reset": "Reiniciar",

        //         //new
        //         "Login Failed!": "Error de inicio de sesion!",
        //         "Invalid Username or Password": "Usuario o contraseña invalido",
        //         "Play": "Jugar",
        //         "Pause": "Pausa",
        //         "Device Located": "Situado dispositivo",
        //         "I am at home.": "Estoy en casa.",
        //         "Loading": "Cargando",
        //         "Please set Fence": "Por favor, establece la cerca",
        //         "Birthday": "Cumpleaños",
        //         "Device Id": "ID del dispositivo",
        //         "Renewal Date": "Fecha de renovación",
        //         "Edit": "Editar",
        //         "Location": "Pet Art",
        //         "Navigate": "Navegar",
        //         "Gender": "Género",
        //         "Pet Location": "Localización mascota",
        //         "Profile": "Perfil",
        //         "Pet Name": "Nombre de mascota",
        //         "Pet Type": "Pet Art",
        //         "User cancelling dialog": "cancelación de diálogo de usuario",
        //         "Gender": "Geschlecht",
        //         "Pet Location": "Pet Ort",
        //         "Profile": "Perfil",
        //         "Pet Name": "Nombre de mascota",
        //         "Pet Type": "Tipo de mascota",
        //         "Full Name": "Nombre completo",
        //         "Subject": "Tema",
        //         "Message": "Mensaje",
        //         "Send Feedback": "Enviar comentarios",
        //         "Please Enter Full Name": "Por favor, introduzca Nombre Completo",
        //         "Please Enter Email": "Por favor, introduzca Correo",
        //         "Please Enter Subject": "Por favor, introduzca Asunto",
        //         "Please Enter Enquiry": "Por favor, introduzca una solicitud",
        //         "FOLLOW US": "SÍGUENOS",

        //     },
        //     "sv-SE": {
        //         //Swedish Language
        //         "Home": "Hem",
        //         "Events": "Händelser",
        //         "Pet Shop": "Djuraffär",
        //         "My Pet": "Mitt husdjur",
        //         "My Profile": "Min profil",
        //         "About us": "Om oss",
        //         "Contact us": "Kontakta oss",
        //         "Feedback": "Återkoppling",
        //         "Connect Facebook": "ansluta Facebook",
        //         "Logout Facebook": "logout Facebook",
        //         "Login": "Logga in",
        //         "Pettorway Login": "Pettorway Login",
        //         "Logout": "Logga ut",
        //         "Share This App": "Dela Denna app",
        //         "About": "Handla om",
        //         "Cancel": "Cancel",
        //         "Register": "Registrera",
        //         "OR": "OR",
        //         "Email": "E-post",
        //         "Password": "Lösenord",
        //         "Mobile Phone": "Mobiltelefon",
        //         "Required Email Message": "Ange E Id .",
        //         "Valid Email Message": "Ange giltig e-postadress .",
        //         "Required Password Message": "Ange lösenord.",
        //         "Valid Password Message": "Lösenordet måste vara mellan 2 och 20 tecken .",
        //         "Required Phone Message": "Ange telefonnummer .",
        //         "Likes": "Omtyckt",
        //         "Comments": "kommentarer",
        //         "Write a Comment": "Skriv en kommentar",
        //         "Post": "Posta",
        //         "FacebookLoginMessage": "Du måste logga in på Facebook för att utföra denna action. Do du vill logga in nu?",
        //         "Yes": "Ja",
        //         "No": "Nej",
        //         "Facebook Login": "Facebook inloggning",
        //         "Add Pet": "lägga Pet",
        //         "Fence": "Staket",
        //         "Power Saving": "Energibesparing",
        //         "Action For": "handling För",
        //         "Home Wifi Settings": "Hem Wifi Settings",
        //         "Adventures": "äventyr",
        //         "Show Alarms": "show Larm",
        //         "Delete Pet": "radera Pet",
        //         "DeviceConnectedMessage": "Enheten är ansluten till",
        //         "DeviceNotConnectedMessage": "Enheten inte är ansluten till WiFi .",
        //         "NoNetworkFoundMessage": "Inget nätverk hittades.",
        //         "Alarms": "larm",
        //         "Clear": "Klar",
        //         "Fence In": "INHÄGNA",
        //         "Fence Out": "staket ut",
        //         "Low Battery": "Låg batterinivå",
        //         "NoAlarmsMessage": "Inga larm hittades",
        //         "Ok": "Ok",
        //         "DeletePetConfirmMessage": "Är du säker?",
        //         "Search Country": "Sök Land",
        //         "Registration Failed!": "Registreringen misslyckades!",
        //         "Please Try again later.": "Försök igen senare .",
        //         "OTP send Failed!": "OTP skicka misslyckades!",
        //         "Register Successfully": "registrera framgångsrikt",

        //         "OTP": "OTP",
        //         "Enter OTP": "Ange OTP",
        //         "Submit": "Skicka",
        //         "Resend OTP After": "Skicka OTP Efter",
        //         "Minutes": "Minuter",
        //         "Resend OTP": "återsänd OTP",
        //         "Invalid OTP!": "Ogiltig OTP !",
        //         "InvalidOTPMessage": "Kontrollera OTP . annars försöka att skicka OTP .",
        //         "OTP send Successfully!": "OTP sända framgångsrikt !",
        //         "OTPSendMessage": "OTP var skicka till din registrerade telefonen .",
        //         "Liked": "Omtyckt",
        //         "UnLiked": "UnLiked",
        //         "Could not perform action": "Det gick inte att utföra åtgärden",
        //         "Commented": "kommenterade",
        //         "Could not Commented": "Det gick inte kommenterat",
        //         "Could not Connect to Facebook": "Det gick inte att ansluta till Facebook",
        //         "No Location Found": "Ingen plats hittades",
        //         "Connected to Facebook": "Ansluten till Facebook",
        //         "Logout to Facebook": "Logga ut på Facebook",
        //         "Could not Logout to Facebook": "Det gick inte att Logga ut till Facebook",
        //         "Save": "Spara",
        //         "Remove": "Avlägsna",

        //         "Menu": "Meny",
        //         "Updating Working Mode": "Uppdatering arbetsläge",
        //         "Working Mode Fence Message": "Arbetsläge inställt på Fence framgångsrikt .",
        //         "Working Mode Standby Message": "Arbetsläge till standby framgångsrikt .",
        //         "Working Mode Tracking Message": "Arbetsläge inställt på Tracking framgångsrikt .",
        //         "Wifi setting Deleted": "WiFi inställning Utgår",
        //         "Wifi setting saved": "Wifi inställning sparas",
        //         "Alarms cleared": "larm rensas",
        //         "Oops! Alarms not cleared": "Oj då! Larm inte rensas",
        //         "No Advanture Found": "Ingen advanture Funnet",
        //         "Select Date": "Välj Datum",
        //         "Name": "Namn",
        //         "Country": "Land",
        //         "State": "Ange",
        //         "City": "Stad",
        //         "Change Password": "Byt lösenord",


        //         "Your profile has been updated successfully.": "Din profil har uppdaterats .",
        //         "Your profile has not been updated.": "Din profil har inte uppdaterats .",
        //         "Take Picture": "Ta bild",
        //         "From Gallery": "från Gallery",
        //         "Camera open permission denied. Please enable permission.": "Kameran öppen åtkomst nekad . Vänligen aktivera tillstånd .",
        //         "Uploading": "uppladdning",
        //         "Please Wait": "Vänta",
        //         "Success!": "Framgång!",
        //         "Image does not Uploaded": "Bilden behöver inte laddat",
        //         "Please try again Latter": "Försök igen Sista",
        //         "Old Password": "Gammalt lösenord",
        //         "New Password": "nytt lösenord",
        //         "Confirm Password": "Bekräfta lösenord",
        //         "Required OldPassword Message": "Ange gamla lösenordet.",
        //         "Required NewPassword Message": "Ange nytt lösenord .",
        //         "Required ConfirmPassword Message": "Ange Bekräfta lösenord .",
        //         "Password mismatch!": "Lösenord mismatch !",
        //         "mismatch Password Message": "Ditt nya lösenord och Bekräfta lösenord stämmer inte.",
        //         "Call": "Ring upp",
        //         "Facebook": "Facebook",
        //         "Twitter": "Twitter",
        //         "Error!": "Fel!",
        //         "No Pet Fount": "Ingen Pet Fount",
        //         "Pet Added Successfully": "Pet lagts till",
        //         "Pet Info Updated Successfully": "Pet Info uppdaterats",
        //         "Add New Pet": "Lägg till New Pet",
        //         "Pet Type Required!": "Pet Typ krävs!",
        //         "Pet Name Required!": "Smeknamnet krävs!",
        //         "Pet Location Required!": "Pet utrymme krävs !",
        //         "Birthday Required!": "Födelsedag krävs!",
        //         "DeviceId Required!": "Enhets krävs!",
        //         "Renewal Date Required!": "Förnyelse önskat datum !",
        //         //Latest
        //         "Standby": "Står fast vid",
        //         "Credit Expire Date": "Credit utgångsdatum",
        //         "Credit Expire Date Required!": "Kredit utgångsdatum krävs!",
        //         "Breed": "Ras",
        //         "Weight": "Vikt",
        //         "Device": "Anordning",
        //         "Alarm list": "larmlista",

        //         "Travelled": "BEREST",
        //         "Top Speed": "MAXIMIHASTIGHET",
        //         "Average Speed": "Medelhastighet",
        //         "Total Record": "totalt Record",
        //         "Distance": "Distans",
        //         "Max. Speed": "Max. Fart",
        //         "Average Adventure Distance": "Genomsnittlig äventyr Distans",
        //         "Longest Adventure Distance": "Längsta äventyr Avstånd",
        //         "km": "km",
        //         "km/h": "km/t",
        //         "Sign Up": "Registrera dig",
        //         "Tracking": "spårning",
        //         "Password Send Successfully message": "Nytt lösenord skickat successfully.<br>Please kolla din e-post .",
        //         "Forgot Password": "Glömt ditt lösenord",
        //         "Reset": "Återställa",

        //         //new
        //         "Login Failed!": "Inloggning misslyckades!",
        //         "Invalid Username or Password": "Ogiltigt användarnamn eller lösenord",
        //         "Play": "Spela",
        //         "Pause": "Paus",
        //         "Device Located": "anordning belägen",
        //         "I am at home.": "Jag är hemma.",
        //         "Loading": "Läser in",
        //         "Please set Fence": "Ställ Fence",
        //         "Birthday": "Födelsedag",
        //         "Device Id": "Enhets-ID",
        //         "Renewal Date": "Förnyelsedatum",
        //         "Edit": "Redigera",
        //         "Location": "Plats",
        //         "Navigate": "Navigera",
        //         "Gender": "Kön",
        //         "Pet Location": "husdjur Plats",
        //         "Profile": "Profil",
        //         "Pet Name": "Husdjursnamn",
        //         "Pet Type": "Pet Typ",
        //         "User cancelling dialog": "Användaren avbryter dialog",
        //         "Full Name": "Fullständiga namn",
        //         "Subject": "Ämne",
        //         "Message": "Meddelande",
        //         "Send Feedback": "Skicka feedback",
        //         "Please Enter Full Name": "Ange Fullständigt namn",
        //         "Please Enter Email": "Ange E-post",
        //         "Please Enter Subject": "Ange Ämne",
        //         "Please Enter Enquiry": "Vänligen ange Förfrågan",
        //         "FOLLOW US": "FÖLJ OSS",
        //     },
        //     "ms-MY": {
        //         //Malaysian Language
        //         "Home": "Laman Utama",
        //         "Events": "Peristiwa",
        //         "Pet Shop": "Kedai haiwan peliharaan",
        //         "My Pet": "Haiwan peliharaan saya",
        //         "My Profile": "Profil saya",
        //         "About us": "Tentang kita",
        //         "Contact us": "Hubungi kami",
        //         "Feedback": "Maklumbalas",
        //         "Connect Facebook": "Sambung Facebook",
        //         "Logout Facebook": "Log Keluar Facebook",
        //         "Login": "Log masuk",
        //         "Pettorway Login": "Pettorway Log Masuk",
        //         "Logout": "Log keluar",
        //         "Share This App": "Kongsi App ini",
        //         "About": "Mengenai",
        //         "Cancel": "Batal",
        //         "Register": "Daftar",
        //         "OR": "ATAU",
        //         "Email": "E-mel",
        //         "Password": "kata laluan",
        //         "Mobile Phone": "Telefon bimbit",
        //         "Required Email Message": "Sila Masukkan Id E-mel.",
        //         "Valid Email Message": "Sila Masukkan Alamat e-mel yang sah.",
        //         "Required Password Message": "Sila Masukkan Kata Laluan.",
        //         "Valid Password Message": "Kata laluan mesti mengandungi antara 2 dan 20 aksara.",
        //         "Required Phone Message": "Sila Masukkan Nombor Telefon.",
        //         "Likes": "Suka",
        //         "Comments": "komen",
        //         "Write a Comment": "Tulis komen...",
        //         "Post": "Post",
        //         "FacebookLoginMessage": "Anda perlu log masuk ke Facebook untuk melaksanakan tindakan ini. Adakah anda ingin log masuk sekarang?",
        //         "Yes": "Ya",
        //         "No": "Tiada",
        //         "Facebook Login": "Log masuk Facebook",
        //         "Add Pet": "Tambahkan Haiwan",
        //         "Fence": "Pagar",
        //         "Power Saving": "Power Saving",
        //         "Action For": "Action For",
        //         "Home Wifi Settings": "Tetapan Halaman Utama Wifi",
        //         "Adventures": "Adventures",
        //         "Show Alarms": "Show Alarms",
        //         "Delete Pet": "Padam Haiwan",
        //         "DeviceConnectedMessage": "Peranti disambungkan kepada",
        //         "DeviceNotConnectedMessage": "Peranti tidak bersambung ke Wifi.",
        //         "NoNetworkFoundMessage": "Tiada Rangkaian Found.",
        //         "Alarms": "Penggera",
        //         "Clear": "Hapus",
        //         "Fence In": "Pagar Dalam",
        //         "Fence Out": "Pagar Luar",
        //         "Low Battery": "Bateri lemah",
        //         "NoAlarmsMessage": "Tiada Penggera Terdapat",
        //         "Ok": "okey",
        //         "DeletePetConfirmMessage": "Adakah anda pasti?",
        //         "Search Country": "Cari Negara",
        //         "Registration Failed!": "Pendaftaran Gagal !",
        //         "Please Try again later.": "Sila cuba sebentar lagi.",
        //         "OTP send Failed!": "OTP send Gagal !",
        //         "Register Successfully": "mendaftar Berjaya",
        //         "OTP": "OTP",
        //         "Enter OTP": "Masukkan OTP",
        //         "Submit": "hantar",
        //         "Resend OTP After": "Hantar semula OTP Selepas",
        //         "Minutes": "minit",
        //         "Resend OTP": "Hantar semula OTP",
        //         "Invalid OTP!": "OTP tidak sah!",
        //         "InvalidOTPMessage": "Sila menyemak OTP. jika tidak cuba untuk Hantar semula OTP.",
        //         "OTP send Successfully!": "OTP menghantar Berjaya !",
        //         "OTPSendMessage": "OTP telah menghantar kepada telefon berdaftar anda.",
        //         "Liked": "suka",
        //         "UnLiked": "tidak menyukai",
        //         "Could not perform action": "Tidak dapat melaksanakan tindakan",
        //         "Commented": "mengulas",
        //         "Could not Commented": "Tidak dapat Commented",
        //         "Could not Connect to Facebook": "Tidak Dapat Menyambung ke Facebook",
        //         "No Location Found": "Tiada Lokasi dijumpai",
        //         "Connected to Facebook": "Bersambung ke Facebook",
        //         "Logout to Facebook": "Log keluar ke Facebook",
        //         "Could not Logout to Facebook": "Tidak dapat Logout ke Facebook",
        //         "Save": "Simpan",
        //         "Remove": "Buang",

        //         "Menu": "menu",
        //         "Updating Working Mode": "Mengemaskini Mod Kerja",
        //         "Working Mode Fence Message": "Mod Kerja ditetapkan untuk Fence Berjaya.",
        //         "Working Mode Standby Message": "Mod Kerja dijangka siap sedia Berjaya.",
        //         "Working Mode Tracking Message": "Mod Kerja ditetapkan untuk Penjejakan Berjaya.",
        //         "Wifi setting Deleted": "tetapan Wifi Dihapuskan",
        //         "Wifi setting saved": "Wifi setting saved",
        //         "Alarms cleared": "Penggera dibersihkan",
        //         "Oops! Alarms not cleared": "Oops! Penggera tidak dibersihkan",
        //         "No Advanture Found": "Tiada Advanture Terdapat",
        //         "Select Date": "Pilih Tarikh",
        //         "Name": "Nama",
        //         "Country": "negara",
        //         "State": "Negeri",
        //         "City": "City",
        //         "Change Password": "Tukar kata laluan",

        //         "Your profile has been updated successfully.": "Profil anda telah berjaya dikemas kini.",
        //         "Your profile has not been updated.": "Profil anda tidak dikemaskini .",
        //         "Take Picture": "Mengambil gambar",
        //         "From Gallery": "dari Galeri",
        //         "Camera open permission denied. Please enable permission.": "Kamera kebenaran terbuka dinafikan. Sila membolehkan kebenaran.",
        //         "Uploading": "memuat naik",
        //         "Please Wait": "Sila tunggu",
        //         "Success!": "Kejayaan !",
        //         "Image does not Uploaded": "Imej tidak naik",
        //         "Please try again Latter": "Sila cuba lagi Latter",
        //         "Old Password": "kata laluan lama",
        //         "New Password": "Kata laluan baharu",
        //         "Confirm Password": "sahkan Kata laluan",
        //         "Required OldPassword Message": "Sila Masukkan Kata Laluan Lama .",
        //         "Required NewPassword Message": "Sila Masukkan Kata Laluan Baru .",
        //         "Required ConfirmPassword Message": "Sila Masukkan Sahkan Kata Laluan.",
        //         "Password mismatch!": "Kata laluan tidak sepadan !",
        //         "mismatch Password Message": "Kata laluan baru anda dan Sahkan kata laluan tidak sama.",
        //         "Call": "Call",
        //         "Facebook": "Facebook",
        //         "Twitter": "Twitter",
        //         "Error!": "Kesalahan!",
        //         "No Pet Fount": "Tiada haiwan peliharaan Fount",
        //         "Pet Added Successfully": "Pet Ditambah Berjaya",
        //         "Pet Info Updated Successfully": "Maklumat Pet Dikemaskini Berjaya",
        //         "Add New Pet": "Add New Pet",
        //         "Pet Type Required!": "Jenis Pet Diperlukan!",
        //         "Pet Name Required!": "Nama haiwan peliharaan Diperlukan!",
        //         "Pet Location Required!": "Lokasi Haiwan Diperlukan!",
        //         "Birthday Required!": "Birthday Diperlukan!",
        //         "DeviceId Required!": "Id peranti Diperlukan!",
        //         "Renewal Date Required!": "Pembaharuan Tarikh Diperlukan!",
        //         //Latest
        //         "Standby": "siap sedia",
        //         "Credit Expire Date": "Kredit Luputkan Tarikh",
        //         "Credit Expire Date Required!": "Kredit Luputkan Tarikh Diperlukan!",
        //         "Breed": "baka",
        //         "Weight": "Berat",
        //         "Device": "Peranti",
        //         "Alarm list": "senarai penggera",

        //         "Travelled": "mengembara",
        //         "Top Speed": "Kelajuan tertinggi",
        //         "Average Speed": "Kelajuan purata",
        //         "Total Record": "Jumlah Rekod",
        //         "Distance": "Jarak",
        //         "Max. Speed": "Max. Speed",
        //         "Average Adventure Distance": "Sederhana Adventure Jarak",
        //         "Longest Adventure Distance": "Paling lama Adventure Jarak",
        //         "km": "km",
        //         "km/h": "km/h",
        //         "Sign Up": "Daftar",
        //         "Tracking": "Penjejakan",
        //         "Password Send Successfully message": "Kata Laluan Baru menghantar successfully.<br>Please memeriksa e-mel anda.",
        //         "Forgot Password": "Lupa kata laluan",
        //         "Reset": "Reset",

        //         //new
        //         "Full Name": "Nama penuh",
        //         "Subject": "Subjek",
        //         "Message": "Mesej",
        //         "Send Feedback": "Hantar maklumbalas",
        //         "Please Enter Full Name": "Sila Masukkan Nama Penuh",
        //         "Please Enter Subject": "Sila Masukkan Subject",
        //         "Please Enter Enquiry": "Sila Masukkan Pertanyaan",
        //         "FOLLOW US": "IKUT KAMI",

        //         //new
        //         "Login Failed!": "Daftar masuk gagal!",
        //         "Invalid Username or Password": "Nama pengguna atau kata laluan tidak sah",
        //         "Play": "Mainkan",
        //         "Pause": "Pegun",
        //         "Device Located": "Peranti yang terjempa",
        //         "I am at home.": "Saya berada di rumah.",
        //         "Loading": "Sedang Memproses",
        //         "Please set Fence": "Sila menetapkan Pagar",
        //         "Birthday": "Birthday",
        //         "Device Id": "ID peranti",
        //         "Renewal Date": "Tarikh pembaharuan",
        //         "Edit": "Edit",
        //         "Location": "lokasi",
        //         "Navigate": "Navigasi",
        //         "Gender": "Jantina",
        //         "Pet Location": "Lokasi Haiwan",
        //         "Profile": "profil",
        //         "Pet Name": "Nama haiwan peliharaan",
        //         "Pet Type": "Jenis Haiwan",
        //         "User cancelling dialog": "Pengguna dialog membatalkan",
        //         "Profile": "profil",
        //     },
        //     "id-ID": {
        //         //Indonesian Language

        //         "Home": "Halaman",
        //         "Events": "Acara",
        //         "Pet Shop": "Toko hewan",
        //         "My Pet": "My Pet",
        //         "My Profile": "Hewan Peliharaanku",
        //         "About us": "Tentang kami",
        //         "Contact us": "Hubungi kami",
        //         "Feedback": "Umpan balik",
        //         "Connect Facebook": "Hubungkan Facebook",
        //         "Logout Facebook": "logout Facebook",
        //         "Login": "Masuk",
        //         "Pettorway Login": "Pettorway Login",
        //         "Logout": "Keluar",
        //         "Share This App": "Bagikan Aplikasi ini",
        //         "About": "Tentang",
        //         "Cancel": "Membatalkan",
        //         "Register": "Daftar",
        //         "OR": "ATAU",
        //         "Email": "E-mail",
        //         "Password": "Kata sandi",
        //         "Mobile Phone": "Telepon genggam",
        //         "Required Email Message": "Silahkan Masukkan Id Email .",
        //         "Valid Email Message": "Silahkan Masukkan alamat email Valid .",
        //         "Required Password Message": "Silahkan Masukkan Password.",
        //         "Valid Password Message": "Password harus antara 2 dan 20 karakter .",
        //         "Required Phone Message": "Silahkan Masukkan Nomor Telepon .",
        //         "Likes": "suka",
        //         "Comments": "komentar",
        //         "Write a Comment": "Tulis komen...",
        //         "Post": "Pos",
        //         "FacebookLoginMessage": "Anda perlu login ke Facebook untuk melakukan tindakan ini . Apakah Anda ingin login sekarang ?",
        //         "Yes": "Iya",
        //         "No": "Tidak",
        //         "Facebook Login": "Facebook Login",
        //         "Add Pet": "Tambahkan Hewan",
        //         "Fence": "Pagar",
        //         "Power Saving": "Penghematan energi",
        //         "Action For": "aksi Untuk",
        //         "Home Wifi Settings": "Rumah Wifi Pengaturan",
        //         "Adventures": "Adventures",
        //         "Show Alarms": "Tampilkan Alarm",
        //         "Delete Pet": "Hapus Hewan",
        //         "DeviceConnectedMessage": "Perangkat terhubung ke",
        //         "DeviceNotConnectedMessage": "Perangkat saat ini tidak terhubung ke Wifi .",
        //         "NoNetworkFoundMessage": "Tidak ada Jaringan Ditemukan .",
        //         "Alarms": "Alarms",
        //         "Clear": "Bersih",
        //         "Fence In": "Pagar Masuk",
        //         "Fence Out": "Pagar Keluar",
        //         "Low Battery": "Baterai lemah",
        //         "NoAlarmsMessage": "Tidak ada Alarm Ditemukan",
        //         "Ok": "Baik",
        //         "DeletePetConfirmMessage": "Apakah Anda yakin ?",
        //         "Search Country": "Cari negara",
        //         "Registration Failed!": "Registrasi gagal!",
        //         "Please Try again later.": "Silakan coba lagi nanti .",
        //         "OTP send Failed!": "OTP kirim Gagal !",
        //         "Register Successfully": "mendaftar Berhasil",
        //         "OTP": "OTP",
        //         "Enter OTP": "Masukkan OTP",
        //         "Submit": "Menyerahkan",
        //         "Resend OTP After": "Kirim ulang OTP Setelah",
        //         "Minutes": "Menit",
        //         "Resend OTP": "Kirim ulang OTP",
        //         "Invalid OTP!": "Valid OTP !",
        //         "InvalidOTPMessage": "Silakan periksa OTP . jika tidak mencoba untuk Kirim ulang OTP .",
        //         "OTP send Successfully!": "OTP mengirim Berhasil !",
        //         "OTPSendMessage": "OTP itu kirim ke ponsel Anda yang terdaftar .",
        //         "Liked": "Menyukai",
        //         "UnLiked": "membatalkan suka",
        //         "Could not perform action": "tidak bisa melakukan tindakan",
        //         "Commented": "berkomentar",
        //         "Could not Commented": "tidak bisa dikomentari",
        //         "Could not Connect to Facebook": "tidak bisa Terhubung ke Facebook",
        //         "No Location Found": "Tidak ada Lokasi Ditemukan",
        //         "Connected to Facebook": "Terhubung dengan Facebook",
        //         "Logout to Facebook": "Logout ke Facebook",
        //         "Could not Logout to Facebook": "tidak bisa Keluar ke Facebook",
        //         "Save": "Menyimpan",
        //         "Remove": "Menghapus",

        //         "Menu": "menu",
        //         "Updating Working Mode": "Memperbarui Bekerja Mode",
        //         "Working Mode Fence Message": "Modus kerja diatur untuk Pagar Berhasil .",
        //         "Working Mode Standby Message": "Modus kerja diatur ke Siaga Berhasil .",
        //         "Working Mode Tracking Message": "Modus kerja diatur ke Pelacakan Berhasil .",
        //         "Wifi setting Deleted": "pengaturan wifi Dihapus",
        //         "Wifi setting saved": "pengaturan wifi disimpan",
        //         "Alarms cleared": "alarm dibersihkan",
        //         "Oops! Alarms not cleared": "Ups ! Alarm tidak dibersihkan",
        //         "No Advanture Found": "Tidak ada Advanture Ditemukan",
        //         "Select Date": "Pilih Tanggal",
        //         "Name": "Nama",
        //         "Country": "negara",
        //         "State": "Negeri",
        //         "City": "City",
        //         "Change Password": "Tukar kata laluan",

        //         "Your profile has been updated successfully.": "Profil Anda telah berhasil diperbarui .",
        //         "Your profile has not been updated.": "Profil Anda belum diperbarui .",
        //         "Take Picture": "Mengambil gambar",
        //         "From Gallery": "dari Gallery",
        //         "Camera open permission denied. Please enable permission.": "Kamera izin terbuka ditolak . Aktifkan izin .",
        //         "Uploading": "upload",
        //         "Please Wait": "Mohon tunggu",
        //         "Success!": "Keberhasilan!",
        //         "Image does not Uploaded": "Gambar tidak Diupload",
        //         "Please try again Latter": "Silakan coba lagi Orang",
        //         "Old Password": "Password lama",
        //         "New Password": "kata sandi baru",
        //         "Confirm Password": "konfirmasi sandi",
        //         "Required OldPassword Message": "Silahkan Masukkan Sandi Lama.",
        //         "Required NewPassword Message": "Silahkan Masukkan Password Baru .",
        //         "Required ConfirmPassword Message": "Silahkan Masukkan Konfirmasi Password.",
        //         "Password mismatch!": "Kata sandi tidak cocok!",
        //         "mismatch Password Message": "New password dan Confirm password tidak cocok .",
        //         "Call": "Panggilan",
        //         "Facebook": "Facebook",
        //         "Twitter": "Kericau",
        //         "Error!": "Kesalahan!",
        //         "No Pet Fount": "Tidak ada Pet Fount",
        //         "Pet Added Successfully": "Pet Ditambahkan Berhasil",
        //         "Pet Info Updated Successfully": "Pet Info Updated Berhasil",
        //         "Add New Pet": "Tambahkan Pet Baru",
        //         "Pet Type Required!": "Pet Tipe Diperlukan !",
        //         "Pet Name Required!": "Nama Pet Diperlukan !",
        //         "Pet Location Required!": "Pet Lokasi Diperlukan !",
        //         "Birthday Required!": "Ulang Tahun Diperlukan !",
        //         "DeviceId Required!": "Perangkat Id Diperlukan !",
        //         "Renewal Date Required!": "Renewal Tanggal Diperlukan !",
        //         //Latest
        //         "Standby": "Bersiap",
        //         "Credit Expire Date": "Kredit Tanggal Kadaluarsa",
        //         "Credit Expire Date Required!": "Kredit Tanggal Kadaluarsa Diperlukan !",
        //         "Breed": "Berkembang biak",
        //         "Weight": "Berat",
        //         "Device": "Alat",
        //         "Alarm list": "daftar alarm",

        //         "Travelled": "Bepergian",
        //         "Top Speed": "Kecepatan atas",
        //         "Average Speed": "Kecepatan rata-rata",
        //         "Total Record": "total Rekam",
        //         "Distance": "Jarak",
        //         "Max. Speed": "Max. Kecepatan",
        //         "Average Adventure Distance": "Rata-rata Petualangan Jarak",
        //         "Longest Adventure Distance": "Terpanjang Petualangan Jarak",
        //         "km": "km",
        //         "km/h": "km/h",
        //         "Sign Up": "Daftar",
        //         "Tracking": "pelacakan",
        //         "Password Send Successfully message": "Sandi baru mengirim successfully.<br>Please memeriksa email Anda .",
        //         "Forgot Password": "Lupa kata sandi",
        //         "Reset": "ulang",

        //         //new
        //         "Full Name": "Nama lengkap",
        //         "Subject": "Subyek",
        //         "Message": "Pesan",
        //         "Send Feedback": "Beri Tanggapan",
        //         "Please Enter Full Name": "Silahkan Masukkan Nama Lengkap",
        //         "Please Enter Subject": "Silahkan Masukkan Subjek",
        //         "Please Enter Enquiry": "Silahkan Masukkan Enquiry",
        //         "FOLLOW US": "IKUTI KAMI",

        //         //new
        //         "Login Failed!": "Gagal masuk!",
        //         "Invalid Username or Password": "Username dan password salah",
        //         "Play": "Bermain",
        //         "Pause": "Berhenti sebentar",
        //         "Device Located": "perangkat Terletak",
        //         "I am at home.": "Saya di rumah.",
        //         "Loading": "Pemuatan",
        //         "Please set Fence": "Silahkan set Pagar",
        //         "Birthday": "Ulang tahun",
        //         "Device Id": "perangkat Id",
        //         "Renewal Date": "Tanggal pembaruan",
        //         "Edit": "mengedit",
        //         "Location": "tempat",
        //         "Navigate": "arahkan",
        //         "Gender": "Jenis kelamin",
        //         "Pet Location": "Pet Lokasi",
        //         "Profile": "Profil",
        //         "Pet Name": "Nama binatang peliharaan",
        //         "Pet Type": "Pet Type",
        //         "User cancelling dialog": "Pengguna dialog membatalkan",
        //         "Profile": "Profil",

        //     }

        // };


        // var lst = [];

        // for (objLan in translations[Object.keys(translations)[0]]) {
        //     var oo = new Object();

        //     oo.Code = objLan;
        //     for (obj in translations) {

        //         var kkkk = translations[obj];
        //         oo[obj] = kkkk[objLan];

        //     }

        //     lst.push(oo);
        // };

        // res.json(lst);
        var file = __dirname + "/MultiLangugaeFile/MobileLanguageResource.json";


        // jsonfile.writeFile(file, translations, function(err) {
        //     console.error(err)
        //     res.json(translations);
        // })

        jsonfile.readFile(file, function(err, obj) {
            res.json(obj);
            // res.json(translations);
        })

        // res.json(translations);
    })
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

    var query = "Select tgd.DeviceId,Type,IMEI,SerialNum,PhoneNum,ttc.Name,AppName,CONVERT_TZ(renewaldate,'+00:00','" + CurrentOffset + "') as ExpiryDate " +
        "from tblgpsdevice tgd " +
        " left join tblvehicle tv on tv.deviceid = tgd.DeviceId " +
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
                var Month = objDate.toLocaleString(locale, {
                    month: "short"
                });
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
    var query1 = "Select tgd.DeviceId,Type,IMEI,SerialNum,PhoneNum,ttc.Name,AppName,ExpiryDate,renewaldate " +
        "from tblgpsdevice tgd " +
        "left join tblvehicle tv on tv.deviceid = tgd.DeviceId " +
        "inner join tblsimdetails tsd on tgd.idSim = tsd.id inner join tbltelco ttc on ttc.id = tsd.idTelCo " +
        "where Date(renewaldate) = '" + Date1 + "' and IsActive = true";

    connection.query(query1, function(err, GpsExpirydevice, fields) {
        if (!err && GpsExpirydevice.length > 0) {
            function SendExpiryNotification1(i) {
                if (i < GpsExpirydevice.length) {
                    if (GpsExpirydevice[i].renewaldate != null) {
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

    var query2 = "Select tgd.DeviceId,Type,IMEI,SerialNum,PhoneNum,ttc.Name,AppName,ExpiryDate,renewaldate " +
        "from tblgpsdevice tgd " +
        "left join tblvehicle tv on tv.deviceid = tgd.DeviceId " +
        "inner join tblsimdetails tsd on tgd.idSim = tsd.id inner join tbltelco ttc on ttc.id = tsd.idTelCo " +
        "where Date(renewaldate) = '" + convertdateformat(new Date(new Date().getTime() + (15 * 24 * 60 * 60 * 1000)), 4) + "' and IsActive = true";

    connection.query(query2, function(err, GpsExpirydevice, fields) {
        if (!err && GpsExpirydevice.length > 0) {
            function SendExpiryNotification2(i) {
                if (i < GpsExpirydevice.length) {
                    if (GpsExpirydevice[i].renewaldate != null) {
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

    var query3 = "Select tgd.DeviceId,Type,IMEI,SerialNum,PhoneNum,ttc.Name,AppName,ExpiryDate,renewaldate " +
        "from tblgpsdevice tgd " +
        "left join tblvehicle tv on tv.deviceid = tgd.DeviceId " +
        "inner join tblsimdetails tsd on tgd.idSim = tsd.id inner join tbltelco ttc on ttc.id = tsd.idTelCo " +
        "where Date(renewaldate) = '" + convertdateformat(new Date(new Date().getTime() + (2 * 24 * 60 * 60 * 1000)), 4) + "' and IsActive = true";

    connection.query(query3, function(err, GpsExpirydevice, fields) {
        if (!err && GpsExpirydevice.length > 0) {
            function SendExpiryNotification3(i) {
                if (i < GpsExpirydevice.length) {
                    if (GpsExpirydevice[i].renewaldate != null) {
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

    var query4 = "Select tgd.DeviceId,Type,IMEI,SerialNum,PhoneNum,ttc.Name,AppName,ExpiryDate,renewaldate " +
        "from tblgpsdevice tgd " +
        "left join tblvehicle tv on tv.deviceid = tgd.DeviceId " +
        "inner join tblsimdetails tsd on tgd.idSim = tsd.id inner join tbltelco ttc on ttc.id = tsd.idTelCo " +
        "where Date(renewaldate) = '" + convertdateformat(new Date(), 4) + "' and IsActive = true";

    connection.query(query4, function(err, GpsExpirydevice, fields) {
        if (!err && GpsExpirydevice.length > 0) {
            function SendExpiryNotification4(i) {
                if (i < GpsExpirydevice.length) {
                    if (GpsExpirydevice[i].renewaldate != null) {
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


var OrderService = models.tblorderservice;
var OrderServiceStatus = models.tblorderservicestatus;
var OrderServiceDetail = models.tblorderserviceitem;
var Product = models.product;
var ProductAttributeMapping = models.product_productattribute_mapping;
var ProductAttribute = models.productattribute;
var ProductAttributeValue = models.productattributevalue;
var GpsDevice = models.tblgpsdevice;
var SIM = models.tblsimdetails;
var AppInfo = models.tblappinfo;
var WalletTransaction = models.tblwallettransaction;


//============================Order Service======================================
global.CreateOrderServiceGlobal = CreateOrderServiceGlobal;
global.CreateDabitWalletTransactionGlobal = CreateDabitWalletTransactionGlobal;
global.GetRandomWord = GetRandomWord;
global.GetWalletChargesGlobal = GetWalletChargesGlobal;
global.AddDate = AddDate;

function GetChargesGlobal(Country, ProductTypeId, callback) {
    var TotalAmount = 0;
    try {
        GetExpiryProductByName(ProductTypeId, function(resProductId) {
            TotalAmount = 0;
            if (resProductId > 0) {
                GetProductAttributes(resProductId, Country, function(resAllAttributes) {
                    for (var i = 0; i < resAllAttributes.length; i++) {
                        TotalAmount += resAllAttributes[i].PriceAdjustment;
                    }
                    return callback({
                        "TotalAmount": TotalAmount,
                        "ProductId": resProductId
                    });
                });
            } else {
                return callback({
                    "TotalAmount": TotalAmount,
                    "ProductId": 0
                });
            }
        });

    } catch (err) {
        return callback({
            "TotalAmount": TotalAmount,
            "ProductId": 0
        });
    }
}

function GetExpiryProductByName(ProductTypeId, callback) {
    try {
        Product.findOne({
            where: {
                Name: "Renew Price",
                ProductTypeId: parseInt(ProductTypeId),
                Deleted: false,
            },
            attributes: ['Id', 'Name'],
        }).then(function(response) {
            if (response != null) {
                return callback(response.Id);
            } else {
                return callback(0);
            }
        })
    } catch (ees) {
        return callback(0);
    }
}

function GetProductAttributes(idProduct, Country, callback) {
    ProductAttributeMapping.belongsTo(ProductAttribute, {
        foreignKey: {
            name: 'ProductAttributeId',
            allowNull: false
        }
    });
    ProductAttributeMapping.hasMany(ProductAttributeValue, {
        foreignKey: {
            name: 'ProductAttributeMappingId',
            allowNull: false
        }
    });
    ProductAttributeValue.belongsTo(Product, {
        foreignKey: {
            name: 'AssociatedProductId',
            allowNull: false
        }
    });
    ProductAttributeMapping.findAll({
        where: {
            ProductId: idProduct
        },
        include: [{
            model: ProductAttribute
        }, {
            model: ProductAttributeValue,
            include: [{
                model: Product,
                attributes: ['Id', 'Name']
            }]
        }]
    }).then(function(resAttributes) {
        var AllAttributeValue = [];
        for (var i = 0; i < resAttributes.length; i++) {
            var value = resAttributes[i];
            for (var j = 0; j < value.productattributevalues.length; j++) {
                var InnerVal = value.productattributevalues[j];
                var obj1 = new Object();
                obj1.Id = InnerVal.Id;
                obj1.Name = InnerVal.Name;
                obj1.PriceAdjustment = InnerVal.PriceAdjustment;
                obj1.mapid = InnerVal.ProductAttributeMappingId;
                obj1.AName = value.productattribute.Name;
                obj1.AId = value.Id;
                if (Country == obj1.AName) {
                    AllAttributeValue.push(obj1);
                }
            }
        }
        return callback(AllAttributeValue);
    }).catch(function(error) {
        return callback([]);
    })
}

function convertdateUTCformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getUTCMonth() + 1;
    var firstdayDay = date.getUTCDate();
    var firstdayYear = date.getUTCFullYear();
    var firstdayHours = date.getUTCHours();
    var firstdayMinutes = date.getUTCMinutes();
    var firstdaySeconds = date.getUTCSeconds();
    if (flg == 2) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " 23:59:59";
    } else {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " 00:00:00";
    }
}

function AddDate(oldDate, offset, offsetType) {
    var year = parseInt(oldDate.getFullYear());
    var month = parseInt(oldDate.getMonth());
    var date = parseInt(oldDate.getDate());
    var hour = parseInt(oldDate.getHours());
    var newDate;
    if (offsetType == "Year") {
        newDate = new Date(year + offset, month, date, hour);
    } else if (offsetType == "Month") {
        newDate = new Date(year, month + offset, date, hour);
    } else if (offsetType == "Day" || offsetType == "Week") {
        newDate = new Date(year, month, date + offset, hour);
    }
    return newDate;
}

var maxLength = 3;
var minLength = 3;
var uppercaseMinCount = 3;
var numberMinCount = 1;
var UPPERCASE_RE = /([A-Z])/g;
var NUMBER_RE = /([\d])/g;
var NON_REPEATING_CHAR_RE = /([\w\d\-])\1{2,}/g;

function isStrongEnough(randomWord) {
    var uc = randomWord.match(UPPERCASE_RE);
    var n = randomWord.match(NUMBER_RE);
    return randomWord.length >= minLength && uc && uc.length >= uppercaseMinCount;
}

function GetRandomWord() {
    var randomWord = "";
    var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
    while (!isStrongEnough(randomWord)) {
        randomWord = generatePassword(randomLength, false, /([A-Z])/g);
    }
    return randomWord.toUpperCase();
}

function CreateOrderServiceGlobal(Country, UserId, DeviceId, UserName, ProductTypeId, callback) {
    GetChargesGlobal(Country, ProductTypeId, function(resOrderTotal) {
        var OrderTotal = resOrderTotal.TotalAmount;
        var ProductId = resOrderTotal.ProductId;

        var objOrder = new Object();
        objOrder.CustomerId = UserId;
        objOrder.CreatedOnUtc = new Date();
        objOrder.ExpiryDate = AddDate(objOrder.CreatedOnUtc, 1, "Year");
        objOrder.ExpiryDurationValue = 1;
        objOrder.ExpiryDurationType = "Year";
        objOrder.MerchantId = 0;
        var PurchaseOrderNumber = new Date();
        objOrder.PurchaseOrderNumber = "BILLNO" + GetRandomWord() + Date.parse(PurchaseOrderNumber);
        objOrder.CustomerCurrencyCode = "MYR / Rs";
        objOrder.OrderTotal = OrderTotal;
        objOrder.OrderNotes = DeviceId;
        objOrder.SettlementCur = "MYR / Rs";
        objOrder.OrderStatusId = 1;
        objOrder.SubscriptionTransactionId = ProductTypeId;
        objOrder.ShippingStatusId = 0;
        objOrder.PaymentMethodSystemName = "CASH";
        objOrder.CustomerTaxDisplayTypeId = 0;
        objOrder.OrderSubtotalInclTax = OrderTotal;
        objOrder.OrderSubtotalExclTax = OrderTotal;
        objOrder.OrderSubTotalDiscountInclTax = 0;
        objOrder.OrderSubTotalDiscountExclTax = 0;
        objOrder.OrderShippingInclTax = 0;
        objOrder.OrderShippingExclTax = 0;
        objOrder.TaxRates = 0;
        objOrder.OrderTax = 0;
        objOrder.OrderDiscount = 0;
        objOrder.RefundedAmount = 0;
        objOrder.RewardPointsWereAdded = 0;
        objOrder.CustomerLanguageId = 0;
        objOrder.AffiliateId = 0;
        objOrder.AllowStoringCreditCardNumber = 0;
        objOrder.CreatedBy = UserName;
        objOrder.PaymentMethodAdditionalFeeInclTax = 0;
        objOrder.PaymentMethodAdditionalFeeExclTax = 0;
        objOrder.ProcessingCharges = 0;
        objOrder.PaymentStatusId = null;
        objOrder.Deleted = false;
        objOrder.ShippAddress1 = Country;

        OrderService.belongsTo(OrderServiceStatus, {
            foreignKey: {
                name: 'OrderStatusId',
                allowNull: false
            }
        });

        OrderService.findOne({
            include: [{
                model: OrderServiceStatus,
                attributes: ['id', 'OrderStatus'],
                where: { OrderStatus: 'Pending' },
                required: true
            }],
            where: { OrderNotes: DeviceId },
        }).then(function(OrderServiceExist) {
            if (OrderServiceExist) {
                return callback({
                    success: false,
                    message: "Order is already placed ...",
                });
            } else {
                OrderService.create(objOrder).then(function(response) {
                    var objOrderDetail = new Object();
                    objOrderDetail.OrderId = response.id;
                    objOrderDetail.ProductId = ProductId;
                    objOrderDetail.ProductName = "Expiry Product";
                    objOrderDetail.Quantity = 1;
                    objOrderDetail.UnitPriceInclTax = OrderTotal;
                    objOrderDetail.UnitPriceExclTax = OrderTotal;
                    objOrderDetail.idOrderStatus = 1;
                    objOrderDetail.PriceInclTax = OrderTotal;
                    objOrderDetail.PriceExclTax = OrderTotal;
                    OrderServiceDetail.create(objOrderDetail).then(function(responseOrderDetail) {
                        return callback({
                            success: true,
                            message: "Order placed successfully...",
                        });
                    });
                });
            }
        })


    });
}

// CreateOrderServiceGlobal("India", 1, "2201", "XXXX", 1, function (ddd) {
//     console.log(ddd);
// });


//============================End Order Service======================================

//============================Wallet Transaction======================================


function CreateDabitWalletTransactionGlobal(Country, DeviceId, UserName, ProductTypeId, callback) {
    GetWalletChargesGlobal(Country, ProductTypeId, function(resOrderTotal) {
        var Amount = resOrderTotal.TotalAmount;
        var Remark = resOrderTotal.Remark;

        var ObjWalletTransaction = new Object();
        ObjWalletTransaction.id = 0;
        ObjWalletTransaction.idApp = ProductTypeId;
        ObjWalletTransaction.Amount = Amount;
        ObjWalletTransaction.Type = "Debit";
        ObjWalletTransaction.Remark = Remark;
        ObjWalletTransaction.OrderNumber = "WALTNO-" + GetRandomWord() + Date.parse(new Date());
        ObjWalletTransaction.Country = Country;
        ObjWalletTransaction.PaymentType = "Offline";
        ObjWalletTransaction.DeviceId = DeviceId;
        ObjWalletTransaction.IsPaymentSuccess = 0;
        ObjWalletTransaction.CreatedDate = new Date();
        ObjWalletTransaction.CreatedBy = UserName;
        ObjWalletTransaction.ExpiryDate = AddDate(ObjWalletTransaction.CreatedDate, 1, "Year");
        ObjWalletTransaction.ModifiedDate = null;
        ObjWalletTransaction.ModifiedBy = null;
        ObjWalletTransaction.PaymentReceipt = null;

        WalletTransaction.findOne({
            where: {
                IsPaymentSuccess: false,
                idApp: ProductTypeId,
            }
        }).then(function(resTraExists) {
            if (resTraExists == null) {
                PutEntryWalletTransaction();
            } else {
                return callback({
                    success: false,
                    message: "Already Transaction Exists.",
                });
            }
        });

        function PutEntryWalletTransaction() {
            WalletTransaction.create(ObjWalletTransaction).then(function(responseTransaction) {
                return callback({
                    success: true,
                    message: "Transaction successfully.",
                });
            });
        }
    });
}

function GetWalletChargesGlobal(Country, ProductTypeId, callback) {
    var PlatformTotalAmount = 0;
    var SimTotalAmount = 0;
    var remark = null;
    try {
        GetProductByNameForWallet("Platform Charge", ProductTypeId, function(resProductId) {
            if (resProductId > 0) {
                GetProductAttributes(resProductId, Country, function(resAllAttributes) {
                    for (var i = 0; i < resAllAttributes.length; i++) {
                        PlatformTotalAmount += resAllAttributes[i].PriceAdjustment;
                    }
                    remark = "Platform Charges = " + PlatformTotalAmount;
                    ForWardSimCharges();
                });
            } else {
                ForWardSimCharges();
            }
        });

        function ForWardSimCharges() {
            SimTotalAmount = 0;
            GetProductByNameForWallet("SIM Charge", ProductTypeId, function(resSIMProductId) {
                if (resSIMProductId > 0) {
                    GetProductAttributes(resSIMProductId, Country, function(resAllSIMAttributes) {
                        for (var i = 0; i < resAllSIMAttributes.length; i++) {
                            SimTotalAmount += resAllSIMAttributes[i].PriceAdjustment;
                        }
                        if (remark != null) {
                            remark = remark + "<br/>SIM Charges = " + SimTotalAmount;
                        } else {
                            remark = "SIM Charges = " + SimTotalAmount;
                        }
                        ForWardResponse();
                    });
                } else {
                    ForWardResponse();
                }
            });
        }


        function ForWardResponse() {
            var TotalAmount = 0;
            TotalAmount = PlatformTotalAmount + SimTotalAmount;
            return callback({
                "TotalAmount": TotalAmount,
                "Remark": remark,
            });
        }
    } catch (err) {
        return callback({
            "TotalAmount": 0,
            "Remark": ""
        });
    }
}

function GetProductByNameForWallet(Name, ProductTypeId, callback) {
    try {
        Product.findOne({
            where: {
                Name: Name,
                ProductTypeId: parseInt(ProductTypeId),
                Deleted: false,
            },
            attributes: ['Id', 'Name'],
        }).then(function(response) {
            if (response != null) {
                return callback(response.Id);
            } else {
                return callback(0);
            }
        });
    } catch (ees) {
        return callback(0);
    }
}

function GetSimChargeFlg(DeviceId, callback) {
    try {
        GpsDevice.belongsTo(SIM, {
            foreignKey: {
                name: 'idSim',
                allowNull: false,
            }
        });

        GetMarkTypeId(function(resMarkId) {
            if (resMarkId > 0) {
                ForwardM(resMarkId);
            } else {
                return callback(false);
            }
        })

        function ForwardM(MarkId) {
            GpsDevice.findOne({
                where: {
                    DeviceId: DeviceId
                },
                include: [{
                    model: SIM,
                    require: true,
                    where: {
                        $and: [{
                            idApp: {
                                $ne: parseInt(MarkId)
                            }
                        }, {
                            idApp: {
                                $gt: 0
                            }
                        }]
                    }
                }]
            }).then(function(resDevice) {
                if (resDevice == null) {
                    return callback(false);
                } else {
                    return callback(true);
                }
            });
        }
    } catch (err) {
        return callback(false);
    }
}

function GetMarkTypeId(callback) {
    try {
        AppInfo.findOne({
            where: {
                AppName: 'Maark'
            }
        }).then(function(resMarkTypeId) {
            if (resMarkTypeId == null) {
                return callback(0);
            } else {
                return callback(resMarkTypeId.Id);
            }
        });
    } catch (err) {
        return callback(0);
    }
}

// CreateDabitWalletTransactionGlobal("India", "44444444444456", "XXX", 2, function (resFlg) {
//     console.log("=================")
//     console.log(resFlg)
//     console.log("=================")
// });
//============================End Wallet Transaction======================================



//============================Vehical Location======================================



function getVehicleLastLocation(callback) {

    var Startdate = new Date();

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    var query = "select * from tblgpsdata a inner join (select max(Date) as maxdate,DeviceId from  tblgpsdata where Date<" + unixStartdate + " group by DeviceId) d on  a.DeviceId = d.DeviceId and a.Date =d.maxdate where a.GPSPositioning='A' group by a.DeviceId";
    connection.query(query, function(err, rows, fields) {
        if (!err && rows) {
            if (rows.length > 0) {
                for (var i = 0; i < rows.length; i++) {
                    client.set(rows[i].DeviceId, JSON.stringify(rows[i]), function(err, replies) {


                    });
                }
                return callback({
                    success: true,
                    message: "Data save successfully...",
                });
            } else {
                return callback({
                    success: false,
                    message: "Data could not save...",
                });
            }
            // res.json(rows);
        } else {
            return callback({
                success: false,
                message: "Data could not save...",
            });
        }
    })
}

router.get('/getVehicleLastLocation', function(req, res) {
    req.setTimeout(3600000);
    getVehicleLastLocation(function(response) {
        res.json(response);
    })
})

function convertdateformatForUnix(date1) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    return ("00" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

}


// router.get('/getVehicleLastLocation', function (req, res) {
//     getVehicleLastLocation(function (response) {
//         res.json(response);
//     })
// })


//============================End Vehical Location======================================
//========================================Defult Setting========================================
global.DefultAppSetting = DefultAppSetting;
var EmailSetting = models.tblemailsettingsys;

function DefultAppSetting(Id) {
    var obj = new Object();
    obj.DefaultEmailFrom = process.env.SMTPuser;
    obj.SMTPService = process.env.SMTPService;
    obj.SMTPhost = process.env.SMTPhost;
    obj.SMTPuser = process.env.SMTPuser;
    obj.SMTPpass = process.env.SMTPpass;
    obj.IdApp = Id;
    EmailSetting.create(obj).then(function(EmailSettingCreated) {

    })
}


module.exports = router