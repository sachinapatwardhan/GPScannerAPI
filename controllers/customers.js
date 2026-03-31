var router = express.Router();

//Tables
var User = models.tbluserinformation;
var UserPermission = models.tbluserpermission;
var Module = models.tblmodulemgmt;
var Role = models.tblrole;
var UserInRole = models.tbluserinrole;
var AuditLog = models.tblauditlog;
var EmailSetting = models.tblemailsettingsys;
var WebCashconfig = require('./../config/webcash.json');
var Commonfunction = require('./common.js');
//End of Tables

router.get('/GetAddressLatLong', function (req, res) {
  var Lat = req.query.Lat;
  var Lng = req.query.Lng;
  Commonfunction.GetAddressLatLong(Lat, Lng, function (response) {
    res.json(response);
  });
});

router.get('/GetLatLongAddress', function (req, res) {
  var Address = req.query.Address;
  Commonfunction.GetLatLongAddress(Address, function (response) {
    res.json(response);
  });
});

//Global Message
global.NoAccessPermission = {
  success: false,
  message: 'No Access Permission...',
  data: 'AccessPermission',
};

global.InvalidToken = {
  success: false,
  message: 'Invalid token...',
  data: 'TOKEN',
};
global.NotDeleteReferenceData = {
  success: false,
  message: "This Record Can't Deleted, It Contain References to other data...",
};
global.RecordNotFound = {
  success: false,
  message: 'Requested Record(s) not Found....',
  data: null,
};
//End of Global Message

var https = require('https');

router.get('/GetAddressLatLong', function (req, res) {
  var Lat = req.query.Lat;
  var Lng = req.query.Lng;
  Commonfunction.GetAddressLatLong(Lat, Lng, function (response) {
    res.json(response);
  });
});

router.get('/GetLatLongAddress', function (req, res) {
  var Address = req.query.Address;
  Commonfunction.GetLatLongAddress(Address, function (response) {
    res.json(response);
  });
});

router.get('/GetGeoCodingServiceProvider', function (req, res) {
  // var ServiceProvider = 'google';
  var ServiceProvider = 'nominatim';
  if (req.query.AppName == 'Navi Track') {
    ServiceProvider = 'nominatim';
  } else if (req.query.AppName == 'Maark') {
    ServiceProvider = 'nominatim';
  } else if (req.query.AppName == 'HC CARGO') {
    ServiceProvider = 'nominatim';
  }
  res.json(ServiceProvider);
});

router.get('/SendOTP', function (req, res) {
  var data = JSON.stringify({
    api_key: 'a692ce5b',
    api_secret: '928903ee92ecd3e4',
    text: 'Your One Time Password(OTP) is 1234',
    to: '+918460533003',
    from: 'Pettorway',
  });

  var options = {
    host: 'rest.nexmo.com',
    path: '/sms/json',
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  var req = https.request(options);

  req.write(data);
  req.end();

  var responseData = '';
  req.on('response', function (res1) {
    res1.on('data', function (chunk) {
      responseData += chunk;
    });

    res1.on('end', function () {
      // console.log(JSON.parse(responseData));
      res.json(JSON.parse(responseData));
    });
  });
});

router.get('/GetDirectionSpeedByAppName', function (req, res) {
  res.json({
    Speed: 5,
    Direction: 30,
  });
});

router.post('/Getlocations', jsonParser, function (req, res) {
  console.log(req.body);
  console.log(req.query);
  res.send('success');
});

router.get('/GetGeneralInfo', function (req, res) {
  var CompanyName = '';
  var phoneNumber = '';

  if (req.query.AppName == 'HC CARGO') {
    CompanyName = 'CAR PRO AUTO PARTS & ACC. S/B';
    phoneNumber = '603-61793598';
  }
  var obj = new Object();
  obj.CompanyName = CompanyName;
  obj.phoneNumber = phoneNumber;
  if (
    req.query.DeviceList != undefined &&
    req.query.DeviceList != null &&
    req.query.DeviceList != '' &&
    req.query.DeviceList.length > 0
  ) {
    var query =
      'SELECT tu.email,tu.username,tu.phone,tda.retailerId,tu.ProfileName ' +
      ' FROM tbluserinformation tu ' +
      ' INNER JOIN tbldeviceagentretailer tda ON tda.retailerId = tu.id ' +
      ' WHERE tda.DeviceId IN (' +
      req.query.DeviceList +
      ')  LIMIT 1';
    connection.query(query, function (err, response, fields) {
      if (!err && response.length > 0) {
        if (
          response[0].email != null &&
          response[0].email != undefined &&
          response[0].email != ''
        ) {
          var obj1 = new Object();
          obj1.CompanyName = response[0].ProfileName;
          obj1.phoneNumber = response[0].phone;
          res.json({ success: true, data: obj1 });
        } else {
          res.json({ success: true, data: obj });
        }
      } else {
        res.json({ success: true, data: obj });
      }
    });
  } else {
    res.json({ success: true, data: obj });
  }
});

router.get('/SendTestMail', function (req, res) {
  var mail = {
    from: 'noreply@maark.my',
    to: 'soham.patel@bugzstudio.com',
    subject: 'hello',
    text: 'hello world!',
  };
  transporter.sendMail(mail, function (error, response) {
    if (error) {
      res.json(error);
    } else {
      res.json(response);
    }
  });
});

router.get('/GetDirectionSpeedByAppName', function (req, res) {
  res.json({
    Speed: 5,
    Direction: 30,
  });
});

router.get('/GetWebcashCredential', function (req, res) {
  res.json({
    MID: WebCashconfig.WebCash.MerchantID,
    MKey: WebCashconfig.WebCash.MerchantKey,
    MURL: WebCashconfig.WebCash.MUrl,
  });
});

router.get('/GetEmptyFuelPoint', function (req, res) {
  res.json(40);
});

getToken = function (headers) {
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

router.get('/EncodeData', function (req, res) {
  var Passwordaa = req.query.data;
  // console.log(Passwordaa)
  var EncodePass = jwt.encode(Passwordaa, 'bugz');
  // console.log(EncodePass)
  // var DecodePass = jwt.decode(EncodePass, "bugz");
  // console.log(DecodePass)
  res.send(EncodePass);
});

router.get('/DecodeData', function (req, res) {
  var Passwordaa = req.query.data;
  var DecodePass = jwt.decode(Passwordaa, 'bugz');
  // console.log(DecodePass)
  res.send(DecodePass);
});

app.use(express.static(__dirname + '/../MediaUploads'));

router.get('/ReportExample', function (req, res) {
  
});

var GpsDate = models.tblgpsdate;
function UpdateGpsDate() {
  var currentDate = new Date();
  currentDate.setHours(0);
  currentDate.setMinutes(0);
  currentDate.setSeconds(0);
  var StartDate = Math.round(currentDate.getTime() / 1000);
  currentDate.setHours(23);
  currentDate.setMinutes(59);
  currentDate.setSeconds(59);
  var EndDate = Math.round(currentDate.getTime() / 1000);
  console.log(StartDate, EndDate);
  connection.query(
    "SELECT DeviceId,DATE(from_unixtime(Date)) as GPSDate FROM tblgpsdata where Date >= '" +
      StartDate +
      "' and Date<='" +
      EndDate +
      "' group by DeviceId,DATE(from_unixtime(Date));",
    function (err, response, fields) {
      if (!err && response.length > 0) {
        function InsertDate(i) {
          if (i < response.length) {
            var objData = {
              DeviceId: response[i].DeviceId,
              GPSDate: ConvertDatetimeToDate(response[i].GPSDate),
            };
            GpsDate.findOrCreate({
              where: {
                GPSDate: new Date(objData.GPSDate),
                DeviceId: objData.DeviceId,
              },
              defaults: objData,
            }).then(function (resData) {
              InsertDate(i + 1);
            });
          } else {
            console.log('GPS Date Save Successfully.');
          }
        }
        InsertDate(0);
      }
    }
  );
}


function UpdateAllGpsDate(callback) {
  connection.query(
    'SELECT DeviceId,DATE(from_unixtime(Date)) as GPSDate FROM tblgpsdata group by DeviceId,DATE(from_unixtime(Date));',
    function (err, response, fields) {
      if (!err && response.length > 0) {
        var lstGpsDate = [];
        for (var i = 0; i < response.length; i++) {
          lstGpsDate.push([
            response[i].DeviceId,
            ConvertDatetimeToDate(response[i].GPSDate),
          ]);
        }
        var lstRecordsChuck = chuckdata(lstGpsDate, 10000);
        function Inseronebyone(k) {
          if (k < lstRecordsChuck.length) {
            connection.query(
              'INSERT INTO tblgpsdate (DeviceId,GPSDate) VALUES ?',
              [lstRecordsChuck[k]],
              function (err, FenceCreated, fields) {
                console.log('GPS Date Inserted Successfully.', k, err);
                Inseronebyone(k + 1);
              }
            );
          } else {
            callback({
              success: true,
              message: 'GPS Date Inserted Successfully.',
            });
          }
        }
        Inseronebyone(0);
      } else {
        callback({ success: false, message: 'No GPS Data found.' });
      }
    }
  );
}
function chuckdata(arr, size) {
  var newArr = [];
  for (var i = 0; i < arr.length; i += size) {
    newArr.push(arr.slice(i, i + size));
  }
  return newArr;
}


function ConvertDatetimeToDate(datedata) {
  var d = new Date(datedata);
  var Year = d.getFullYear();
  var Month = d.getMonth() + 1;
  var day = d.getDate();

  return (
    ('0000' + Year.toString()).slice(-4) +
    '-' +
    ('00' + Month.toString()).slice(-2) +
    '-' +
    ('00' + day.toString()).slice(-2)
  );
}

router.get('/UpdateAllGPSDate', function (req, res) {
  req.setTimeout(3600000);
  UpdateAllGpsDate(function (resdata) {
    res.json(resdata);
  });
});

// MYT 11:00PM call
var UpdateGPSDateSchedule = schedule.scheduleJob('0 23 * * *', function () {
  // API for transfer date to tblgpsdate
  UpdateGpsDate();
});

//Manage Permission to Access Methods
global.funAccessPermission = new Object();
global.funAccessPermission.CheckUserAccessPermission =
  CheckUserAccessPermission;

function CheckUserAccessPermission(ObjParams, callback) {
  var returnobj = {
    success: true,
    message: 'Permission to Access...',
  };

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
          password: objUser.password,
        },
      }).then(function (UserExist) {
        if (UserExist != null) {
          var tablename = ObjParams.query.tablename;
          var permission = ObjParams.query.permission;
          var username = objUser.username;

          //Get Module
          Module.findOne({
            where: {
              Module: tablename,
            },
          }).then(function (objModule) {
            if (objModule != null) {
              UserInRole.belongsTo(Role, {
                foreignKey: {
                  name: 'roleId',
                  allowNull: false,
                },
              });
              UserInRole.findAll({
                where: {
                  userId: UserExist.id,
                },
                include: [
                  {
                    model: Role,
                  },
                ],
              }).then(function (strRole) {
                function uploader(i) {
                  if (i < strRole.length) {
                    UserPermission.findOne({
                      where: {
                        idModule: objModule.id,
                        RoleName: strRole[i].tblrole.RoleName,
                      },
                    }).then(function (objUserPermission) {
                      if (objUserPermission != null) {
                        if (permission == 'Added') {
                          if (objUserPermission.Added == true) {
                            return callback(returnobj);
                          } else {
                            uploader(i + 1);
                          }
                        } else if (permission == 'Show') {
                          if (objUserPermission.Show == true) {
                            return callback(returnobj);
                          } else {
                            uploader(i + 1);
                          }
                        } else if (permission == 'Modified') {
                          if (objUserPermission.Modified == true) {
                            return callback(returnobj);
                          } else {
                            uploader(i + 1);
                          }
                        } else if (permission == 'Deleted') {
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
                    });
                  } else {
                    return callback(NoAccessPermission);
                  }
                }
                uploader(0);

                if (strRole.length == 0) {
                  return callback(NoAccessPermission);
                }
              });
            } else {
              return callback(NoAccessPermission);
            }
          });
        } else {
          return callback(InvalidToken);
        }
      });
    } else {
      return callback(InvalidToken);
    }
  } else {
    return callback(InvalidToken);
  }
}

//End Permission

global.funAuditLogLicence = new Object();
global.funAuditLogLicence.CreateAuditLogLicence = CreateAuditLogLicence;
var AuditLogLicence = models.tblauditloglicence;

function CreateAuditLogLicence(
  Type,
  LicenceNo,
  DeviceId,
  ExpiryDate,
  OldExpiryDate,
  CreatedBy,
  Message
) {
  var objAuditLicence = new Object();
  objAuditLicence.Type = Type;
  objAuditLicence.LicenceNo = LicenceNo;
  objAuditLicence.DeviceId = DeviceId;
  objAuditLicence.ExpiryDate = ExpiryDate;
  objAuditLicence.OldExpiryDate = OldExpiryDate;
  objAuditLicence.CreatedDate = new Date();
  objAuditLicence.CreatedBy = CreatedBy;
  objAuditLicence.Message = Message;

  AuditLogLicence.create(objAuditLicence).then(function (objAuditLicence) {});
}

//Create Audit Log
global.funAuditLog = new Object();
global.funAuditLog.CreateAuditLog = CreateAuditLog;

function CreateAuditLog(Method, User, Message) {
  var objAudit = new Object();
  objAudit.type = Method;
  objAudit.createdby = User;
  objAudit.createddate = new Date();
  objAudit.message = Message;

  AuditLog.create(objAudit).then(function (responseAudit) {});
}
var rule1 = new schedule.RecurrenceRule();

var DailyUserReport = schedule.scheduleJob('0 23 * * *', function () {
  var conf = {};
  conf.name = 'Sheet1';
  conf.cols = [
    {
      caption: 'Email',
      type: 'string',
    },
    {
      caption: 'TodayDevice',
      type: 'string',
    },
    {
      caption: 'TotalDevice',
      type: 'string',
    },
  ];

  connection.query(
    'SELECT t2.email,count(t1.id) todaydevice,(select Count(*) from tblvehicle where iduser=t1.iduser and IsDelete=false) as totaldevice FROM tblvehicle t1 left join tbluserinformation t2 on t1.iduser = t2.id where date(t1.CreatedDate) = current_date() and t1.IsDelete=false group by t2.id;',
    function (err, response, fields) {
      if (!err && response.length > 0) {
        conf.rows = [];

        if (response.length > 0) {
          for (var i = 0; i < response.length; i++) {
            var row = [];

            var Email = '';
            var TodayDevice = '';
            var TotalDevice = '';
            if (
              response[i].email != null &&
              response[i].email != '' &&
              response[i].email != undefined
            ) {
              Email = response[i].email;
            }

            if (
              response[i].todaydevice != null &&
              response[i].todaydevice != '' &&
              response[i].todaydevice != undefined
            ) {
              TodayDevice = response[i].todaydevice.toString();
            }

            if (
              response[i].totaldevice != null &&
              response[i].totaldevice != '' &&
              response[i].totaldevice != undefined
            ) {
              TotalDevice = response[i].totaldevice.toString();
            }
            row.push(Email, TodayDevice, TotalDevice);
            conf.rows.push(row);
          }

          var TodayDate = GetCurrentDate1();
          var result = nodeExcel.execute(conf);
          var ConsoleStream = fs.createWriteStream(
            'MediaUploads/UserReportFileUpload/DailyUserReport__' +
              TodayDate +
              '.xlsx'
          );
          ConsoleStream.write(result, 'binary');
          ConsoleStream.end();

          var mail = {
            from: 'soham.patel@bugzstudio.com',
            to: 'pmt@bugzstudio.com',
            
            subject: 'DailyUserReport__' + TodayDate,
            attachments: [
              {
                filename: 'DailyUserReport__' + TodayDate + '.xlsx',
                path:
                  'MediaUploads/UserReportFileUpload/DailyUserReport__' +
                  TodayDate +
                  '.xlsx', // stream this file
              },
            ],
          };
          transporter.sendMail(mail, function (error, response) {});
        }
      }
    }
  );
});
var rule2 = new schedule.RecurrenceRule();

var MonthlyUserReport = schedule.scheduleJob('10 0 1 * *', function () {
  var conf = {};
  conf.name = 'Sheet1';
  conf.cols = [
    {
      caption: 'Email',
      type: 'string',
    },
    {
      caption: 'ThisMonthDevice',
      type: 'string',
    },
    {
      caption: 'TotalDevice',
      type: 'string',
    },
  ];

  connection.query(
    'SELECT t2.email,count(t1.id) ThisMonthDevice,(select Count(*) from tblvehicle where iduser=t1.iduser and IsDelete=false) as TotalDevice FROM tblvehicle t1 left join tbluserinformation t2 on t1.iduser = t2.id where MONTH(t1.CreatedDate) = MONTH(DATE_ADD(current_date(), INTERVAL 0 MONTH) - INTERVAL 1 DAY) and  YEAR(t1.CreatedDate) = YEAR(DATE_ADD(current_date(), INTERVAL 0 MONTH) - INTERVAL 1 DAY)  and t1.IsDelete=false group by t2.id;',
    function (err, response, fields) {
      if (!err && response.length > 0) {
        conf.rows = [];

        if (response.length > 0) {
          for (var i = 0; i < response.length; i++) {
            var row = [];

            var Email = 'N/A';
            var TodayDevice = 'N/A';
            var TotalDevice = 'N/A';
            if (
              response[i].email != null &&
              response[i].email != '' &&
              response[i].email != undefined
            ) {
              Email = response[i].email;
            }

            if (
              response[i].ThisMonthDevice != null &&
              response[i].ThisMonthDevice != '' &&
              response[i].ThisMonthDevice != undefined
            ) {
              ThisMonthDevice = response[i].ThisMonthDevice.toString();
            }

            if (
              response[i].TotalDevice != null &&
              response[i].TotalDevice != '' &&
              response[i].TotalDevice != undefined
            ) {
              TotalDevice = response[i].TotalDevice.toString();
            }
            row.push(Email, ThisMonthDevice, TotalDevice);
            conf.rows.push(row);
          }

          var objDate = new Date();
          var locale = 'en-us';
          var Month = objDate.toLocaleString(locale, {
            month: 'short',
          });
          var Year = objDate.getUTCFullYear();
          var result = nodeExcel.execute(conf);
          var ConsoleStream = fs.createWriteStream(
            'MediaUploads/UserReportFileUpload/MonthlyUserReport__' +
              Month +
              '_' +
              Year +
              '.xlsx'
          );
          ConsoleStream.write(result, 'binary');
          ConsoleStream.end();

          var mail = {
            from: 'soham.patel@bugzstudio.com',
            to: 'pmt@bugzstudio.com',
            subject: 'MonthlyUserReport__' + Month + '_' + Year,
            attachments: [
              {
                filename: 'MonthlyUserReport__' + Month + '_' + Year + '.xlsx',
                path:
                  'MediaUploads/UserReportFileUpload/MonthlyUserReport__' +
                  Month +
                  '_' +
                  Year +
                  '.xlsx', // stream this file
              },
            ],
          };
          transporter.sendMail(mail, function (error, response) {});
        }
      }
    }
  );
});

function GetCurrentDate1() {
  var today = new Date();

  var year = today.getUTCFullYear();
  var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
  var day = today.getUTCDate();

  //return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

  return (
    ('00' + day.toString()).slice(-2) +
    '-' +
    ('00' + month.toString()).slice(-2) +
    '-' +
    ('0000' + year.toString()).slice(-4)
  );
}

router.get('/GetMobileLanguageData', function (req, res) {
  var file = __dirname + '/MultiLangugaeFile/MobileLanguageResource.json';

  jsonfile.readFile(file, function (err, obj) {
    res.json(obj);
    // res.json(translations);
  });

});
//Call 1st And 16th date of the month
var IsActiveDeviceCheck = schedule.scheduleJob('1 0 0 1,16 * *', function () {
  var days = 15; // Days you want to subtract
  var date = new Date();
  var Date1 = null;
  var Date1 = null;

  var conf = {};
  conf.name = 'Sheet1';
  conf.cols = [
    {
      caption: 'DeviceId',
      type: 'string',
    },
    {
      caption: 'Type',
      type: 'string',
    },
    {
      caption: 'IMEI',
      type: 'string',
    },
    {
      caption: 'SerialNumber',
      type: 'string',
    },
    {
      caption: 'PhoneNumber',
      type: 'string',
    },
    {
      caption: 'Telephone Company',
      type: 'string',
    },
    {
      caption: 'AppName',
      type: 'string',
    },
    {
      caption: 'ExpiryDate',
      type: 'string',
    },
  ];

  if (date.getDate() == 16) {
    Date1 = convertdateformat(
      new Date(date.getTime() - days * 24 * 60 * 60 * 1000),
      2
    );
    Date2 = convertdateformat(
      new Date(date.getTime() - 1 * 24 * 60 * 60 * 1000),
      1
    );
  } else {
    Date1 = convertdateformat(
      new Date(date.getFullYear(), date.getMonth() - 1, 16),
      2
    );
    Date2 = convertdateformat(
      new Date(date.getTime() - 1 * 24 * 60 * 60 * 1000),
      1
    );
  }

  var query =
    "Select tgd.DeviceId,Type,IMEI,SerialNum,PhoneNum,ttc.Name,AppName,CONVERT_TZ(renewaldate,'+00:00','" +
    CurrentOffset +
    "') as ExpiryDate " +
    'from tblgpsdevice tgd ' +
    ' left join tblvehicle tv on tv.deviceid = tgd.DeviceId ' +
    'inner join tblsimdetails tsd on tgd.idSim = tsd.id inner join tbltelco ttc on ttc.id = tsd.idTelCo ' +
    "where ActivationDate between '" +
    Date1 +
    "' and '" +
    Date2 +
    "' and IsActive = true";
  var lstDevice = [];
  connection.query(query, function (err, response, fields) {
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
          if (
            response[i].DeviceId != null &&
            response[i].DeviceId != '' &&
            response[i].DeviceId != undefined
          ) {
            DeviceId = response[i].DeviceId;
          }

          if (
            response[i].Type != null &&
            response[i].Type != '' &&
            response[i].Type != undefined
          ) {
            Type = response[i].Type.toString();
          }

          if (
            response[i].IMEI != null &&
            response[i].IMEI != '' &&
            response[i].IMEI != undefined
          ) {
            IMEI = response[i].IMEI.toString();
          }
          if (
            response[i].SerialNumber != null &&
            response[i].SerialNumber != '' &&
            response[i].SerialNumber != undefined
          ) {
            SerialNumber = response[i].SerialNumber.toString();
          }
          if (
            response[i].PhoneNumber != null &&
            response[i].PhoneNumber != '' &&
            response[i].PhoneNumber != undefined
          ) {
            PhoneNumber = response[i].PhoneNumber.toString();
          }
          if (
            response[i].Name != null &&
            response[i].Name != '' &&
            response[i].Name != undefined
          ) {
            Name = response[i].Name.toString();
          }
          if (
            response[i].AppName != null &&
            response[i].AppName != '' &&
            response[i].AppName != undefined
          ) {
            AppName = response[i].AppName.toString();
          }
          if (
            response[i].ExpiryDate != null &&
            response[i].ExpiryDate != '' &&
            response[i].ExpiryDate != undefined
          ) {
            ExpiryDate = convertdateformat(
              response[i].ExpiryDate,
              3
            ).toString();
          }
          row.push(
            DeviceId,
            Type,
            IMEI,
            SerialNumber,
            PhoneNumber,
            Name,
            AppName,
            ExpiryDate
          );
          conf.rows.push(row);
        }
        var objDate = new Date();
        var locale = 'en-us';
        var Month = objDate.toLocaleString(locale, {
          month: 'short',
        });
        var Year = objDate.getUTCFullYear();
        var Day = objDate.getUTCDate();
        var result = nodeExcel.execute(conf);
        var ConsoleStream = fs.createWriteStream(
          'MediaUploads/UserReportFileUpload/GpsDeviceActive__' +
            Day +
            '_' +
            Month +
            '_' +
            Year +
            '.xlsx'
        );
        ConsoleStream.write(result, 'binary');
        ConsoleStream.end();

        var EmailName = "Select Value from tblsetting where Name = 'EmailTo' ";
        connection.query(EmailName, function (err, response, fields) {
          if (!err && response[0].Value != null && response[0].Value != '') {
            var mail = {
              from: response[0].Value,
              to: response[0].Value,
              subject:
                'GpsDeviceActive__' +
                new Date(Date1).getDate() +
                '_' +
                Month +
                '_' +
                Year +
                ' To ' +
                new Date(Date2).getDate() +
                '_' +
                Month +
                '_' +
                Year,
              text:
                'All Activated Sim and Tracker Detail From ' +
                new Date(Date1).getDate() +
                '_' +
                Month +
                '_' +
                Year +
                ' To ' +
                new Date(Date2).getDate() +
                '_' +
                Month +
                '_' +
                Year,
              attachments: [
                {
                  filename:
                    'GpsDeviceActive__' +
                    Day +
                    '_' +
                    Month +
                    '_' +
                    Year +
                    '.xlsx',
                  path:
                    'MediaUploads/UserReportFileUpload/GpsDeviceActive__' +
                    Day +
                    '_' +
                    Month +
                    '_' +
                    Year +
                    '.xlsx', // stream this file
                },
              ],
            };
            transporter.sendMail(mail, function (error, response) {});
          }
          
        });
      }
    }
  });
});

//Call Every Day '1:00 AM UTC'(9:00 AM MYT)(11:30 AM IST) O'clock
var rule = new schedule.RecurrenceRule();
rule.hour = 1;
rule.minute = 0;
rule.second = 0;

var ExpiryDateDeviceCheck = schedule.scheduleJob(rule, function () {
  //Expire After 1 month notification
  var query1 =
    "Select id,Name,iduser,deviceid,renewaldate from tblvehicle tv where Date(renewaldate) = '" +
    convertdateformat(new Date().setMonth(new Date().getMonth() + 1), 4) +
    "' and IsDelete=false;";
  connection.query(query1, function (err, GpsExpirydevice, fields) {
    if (!err && GpsExpirydevice.length > 0) {
      SendExpireNotificationCommon(GpsExpirydevice, 'in next 30 days.');
    }
  });

  //Expire After 15 days notification
  var query2 =
    "Select id,Name,iduser,deviceid,renewaldate from tblvehicle tv where Date(renewaldate) = '" +
    convertdateformat(new Date().setDate(new Date().getDate() + 15), 4) +
    "' and IsDelete=false;";
  connection.query(query2, function (err, GpsExpirydevice, fields) {
    if (!err && GpsExpirydevice.length > 0) {
      SendExpireNotificationCommon(GpsExpirydevice, 'in next 15 days.');
    }
  });

  //Expire After 3 days notification
  var query3 =
    "Select id,Name,iduser,deviceid,renewaldate from tblvehicle tv where Date(renewaldate) = '" +
    convertdateformat(new Date().setDate(new Date().getDate() + 3), 4) +
    "' and IsDelete = false;";
  connection.query(query3, function (err, GpsExpirydevice, fields) {
    if (!err && GpsExpirydevice.length > 0) {
      SendExpireNotificationCommon(GpsExpirydevice, 'in next 3 days.');
    }
  });

  //Expire After 2 days notification
  var query4 =
    "Select id,Name,iduser,deviceid,renewaldate from tblvehicle tv where Date(renewaldate) = '" +
    convertdateformat(new Date().setDate(new Date().getDate() + 2), 4) +
    "' and IsDelete = false;";
  connection.query(query4, function (err, GpsExpirydevice, fields) {
    if (!err && GpsExpirydevice.length > 0) {
      SendExpireNotificationCommon(GpsExpirydevice, 'in next 2 days.');
    }
  });

  //Expire Tomorrow notification
  var query5 =
    "Select id,Name,iduser,deviceid,renewaldate from tblvehicle tv where Date(renewaldate) = '" +
    convertdateformat(new Date().setDate(new Date().getDate() + 1), 4) +
    "' and IsDelete = false;";
  connection.query(query5, function (err, GpsExpirydevice, fields) {
    if (!err && GpsExpirydevice.length > 0) {
      SendExpireNotificationCommon(GpsExpirydevice, 'tomorrow.');
    }
  });

  //Expire Today notification
  var query6 =
    "Select id,Name,iduser,deviceid,renewaldate from tblvehicle tv where Date(renewaldate) = '" +
    convertdateformat(new Date(), 4) +
    "' and IsDelete = true;";
  connection.query(query6, function (err, GpsExpirydevice, fields) {
    if (!err && GpsExpirydevice.length > 0) {
      SendExpireNotificationCommon(GpsExpirydevice, 'today.');
    }
  });
});

function SendExpireNotificationCommon(GpsExpirydevice, EndMessage) {
  var lstGroupVehicle = u.groupBy(GpsExpirydevice, function (o) {
    return o.iduser;
  });
  var lstExpiredVehicle = u.map(lstGroupVehicle, function (group, iduser) {
    return {
      iduser: iduser,
      lstVehicle: group,
    };
  });
  function SendExpiryNotification(i) {
    if (i < lstExpiredVehicle.length) {
      var VehicleName = 'vehicles ';
      var objVehicle = lstExpiredVehicle[i];
      if (objVehicle.lstVehicle.length > 1) {
        for (var j = 0; j < objVehicle.lstVehicle.length; j++) {
          if (j == objVehicle.lstVehicle.length - 1) {
            VehicleName = VehicleName + ' and ' + objVehicle.lstVehicle[j].Name;
          } else {
            if (j == 0) {
              VehicleName = VehicleName + objVehicle.lstVehicle[j].Name;
            } else {
              VehicleName = VehicleName + ', ' + objVehicle.lstVehicle[j].Name;
            }
          }
        }
      } else {
        VehicleName = 'vehicle ' + objVehicle.lstVehicle[0].Name;
      }
      var AllUser = objVehicle.iduser.toString();
      connection.query(
        'SELECT tu.id, tu.username,tu.Notification, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=' +
          objVehicle.iduser,
        function (err, objAppInfo, fields) {
          var PushNotificationdata = {
            title: 'Alert',
            message:
              'Your tracking services for the ' +
              VehicleName +
              ' will expire ' +
              EndMessage,
            soundname: 'Default',
            otherfields: {
              iduser: objVehicle.iduser,
              VehicleName: VehicleName,
              Type: 'Expiry',
            },
          };
          SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
          SendExpiryNotification(i + 1);
        }
      );
    }
  }
  SendExpiryNotification(0);
}

function convertdateformat(date1, flg) {
  var date = new Date(date1);
  var firstdayMonth = date.getMonth() + 1;
  var firstdayDay = date.getDate();
  var firstdayYear = date.getFullYear();
  var firstdayHours = date.getHours();
  var firstdayMinutes = date.getMinutes();
  var firstdaySeconds = date.getSeconds();

  if (flg == 1) {
    return (
      ('0000' + firstdayYear.toString()).slice(-4) +
      '-' +
      ('00' + firstdayMonth.toString()).slice(-2) +
      '-' +
      ('00' + firstdayDay.toString()).slice(-2) +
      ' ' +
      '23:59:59'
    );
  } else if (flg == 2) {
    return (
      ('0000' + firstdayYear.toString()).slice(-4) +
      '-' +
      ('00' + firstdayMonth.toString()).slice(-2) +
      '-' +
      ('00' + firstdayDay.toString()).slice(-2) +
      ' ' +
      '00:00:00'
    );
  } else if (flg == 3) {
    return (
      ('0000' + firstdayYear.toString()).slice(-4) +
      '-' +
      ('00' + firstdayMonth.toString()).slice(-2) +
      '-' +
      ('00' + firstdayDay.toString()).slice(-2) +
      ' ' +
      ('00' + firstdayHours.toString()).slice(-2) +
      ':' +
      ('00' + firstdayMinutes.toString()).slice(-2) +
      ':' +
      ('00' + firstdaySeconds.toString()).slice(-2)
    );
  } else {
    return (
      ('0000' + firstdayYear.toString()).slice(-4) +
      '-' +
      ('00' + firstdayMonth.toString()).slice(-2) +
      '-' +
      ('00' + firstdayDay.toString()).slice(-2)
    );
  }
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
    GetExpiryProductByName(ProductTypeId, function (resProductId) {
      TotalAmount = 0;
      if (resProductId > 0) {
        GetProductAttributes(
          resProductId,
          Country,
          function (resAllAttributes) {
            for (var i = 0; i < resAllAttributes.length; i++) {
              TotalAmount += resAllAttributes[i].PriceAdjustment;
            }
            return callback({
              TotalAmount: TotalAmount,
              ProductId: resProductId,
            });
          }
        );
      } else {
        return callback({
          TotalAmount: TotalAmount,
          ProductId: 0,
        });
      }
    });
  } catch (err) {
    return callback({
      TotalAmount: TotalAmount,
      ProductId: 0,
    });
  }
}

function GetExpiryProductByName(ProductTypeId, callback) {
  try {
    Product.findOne({
      where: {
        Name: 'Renew Price',
        ProductTypeId: parseInt(ProductTypeId),
        Deleted: false,
      },
      attributes: ['Id', 'Name'],
    }).then(function (response) {
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

function GetProductAttributes(idProduct, Country, callback) {
  ProductAttributeMapping.belongsTo(ProductAttribute, {
    foreignKey: {
      name: 'ProductAttributeId',
      allowNull: false,
    },
  });
  ProductAttributeMapping.hasMany(ProductAttributeValue, {
    foreignKey: {
      name: 'ProductAttributeMappingId',
      allowNull: false,
    },
  });
  ProductAttributeValue.belongsTo(Product, {
    foreignKey: {
      name: 'AssociatedProductId',
      allowNull: false,
    },
  });
  ProductAttributeMapping.findAll({
    where: {
      ProductId: idProduct,
    },
    include: [
      {
        model: ProductAttribute,
      },
      {
        model: ProductAttributeValue,
        include: [
          {
            model: Product,
            attributes: ['Id', 'Name'],
          },
        ],
      },
    ],
  })
    .then(function (resAttributes) {
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
    })
    .catch(function (error) {
      return callback([]);
    });
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
    return (
      ('0000' + firstdayYear.toString()).slice(-4) +
      '-' +
      ('00' + firstdayMonth.toString()).slice(-2) +
      '-' +
      ('00' + firstdayDay.toString()).slice(-2) +
      ' 23:59:59'
    );
  } else {
    return (
      ('0000' + firstdayYear.toString()).slice(-4) +
      '-' +
      ('00' + firstdayMonth.toString()).slice(-2) +
      '-' +
      ('00' + firstdayDay.toString()).slice(-2) +
      ' 00:00:00'
    );
  }
}

function AddDate(oldDate, offset, offsetType) {
  var year = parseInt(oldDate.getFullYear());
  var month = parseInt(oldDate.getMonth());
  var date = parseInt(oldDate.getDate());
  var hour = parseInt(oldDate.getHours());
  var newDate;
  if (offsetType == 'Year') {
    newDate = new Date(year + offset, month, date, hour);
  } else if (offsetType == 'Month') {
    newDate = new Date(year, month + offset, date, hour);
  } else if (offsetType == 'Day' || offsetType == 'Week') {
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
  var randomWord = '';
  var randomLength =
    Math.floor(Math.random() * (maxLength - minLength)) + minLength;
  while (!isStrongEnough(randomWord)) {
    randomWord = generatePassword(randomLength, false, /([A-Z])/g);
  }
  return randomWord.toUpperCase();
}

function CreateOrderServiceGlobal(
  Country,
  UserId,
  DeviceId,
  UserName,
  ProductTypeId,
  callback
) {
  GetChargesGlobal(Country, ProductTypeId, function (resOrderTotal) {
    var OrderTotal = resOrderTotal.TotalAmount;
    var ProductId = resOrderTotal.ProductId;

    var objOrder = new Object();
    objOrder.CustomerId = UserId;
    objOrder.CreatedOnUtc = new Date();
    objOrder.ExpiryDate = AddDate(objOrder.CreatedOnUtc, 1, 'Year');
    objOrder.ExpiryDurationValue = 1;
    objOrder.ExpiryDurationType = 'Year';
    objOrder.MerchantId = 0;
    var PurchaseOrderNumber = new Date();
    objOrder.PurchaseOrderNumber =
      'BILLNO' + GetRandomWord() + Date.parse(PurchaseOrderNumber);
    objOrder.CustomerCurrencyCode = 'MYR / Rs';
    objOrder.OrderTotal = OrderTotal;
    objOrder.OrderNotes = DeviceId;
    objOrder.SettlementCur = 'MYR / Rs';
    objOrder.OrderStatusId = 1;
    objOrder.SubscriptionTransactionId = ProductTypeId;
    objOrder.ShippingStatusId = 0;
    objOrder.PaymentMethodSystemName = 'CASH';
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
        allowNull: false,
      },
    });

    OrderService.findOne({
      include: [
        {
          model: OrderServiceStatus,
          attributes: ['id', 'OrderStatus'],
          where: { OrderStatus: 'Pending' },
          required: true,
        },
      ],
      where: { OrderNotes: DeviceId },
    }).then(function (OrderServiceExist) {
      if (OrderServiceExist) {
        return callback({
          success: false,
          message: 'Order is already placed ...',
        });
      } else {
        OrderService.create(objOrder).then(function (response) {
          var objOrderDetail = new Object();
          objOrderDetail.OrderId = response.id;
          objOrderDetail.ProductId = ProductId;
          objOrderDetail.ProductName = 'Expiry Product';
          objOrderDetail.Quantity = 1;
          objOrderDetail.UnitPriceInclTax = OrderTotal;
          objOrderDetail.UnitPriceExclTax = OrderTotal;
          objOrderDetail.idOrderStatus = 1;
          objOrderDetail.PriceInclTax = OrderTotal;
          objOrderDetail.PriceExclTax = OrderTotal;
          OrderServiceDetail.create(objOrderDetail).then(function (
            responseOrderDetail
          ) {
            return callback({
              success: true,
              message: 'Order placed successfully...',
            });
          });
        });
      }
    });
  });
}



//============================End Order Service======================================

//============================Wallet Transaction======================================

function CreateDabitWalletTransactionGlobal(
  Country,
  DeviceId,
  UserName,
  ProductTypeId,
  callback
) {
  GetWalletChargesGlobal(Country, ProductTypeId, function (resOrderTotal) {
    var Amount = resOrderTotal.TotalAmount;
    var Remark = resOrderTotal.Remark;

    var ObjWalletTransaction = new Object();
    ObjWalletTransaction.id = 0;
    ObjWalletTransaction.idApp = ProductTypeId;
    ObjWalletTransaction.Amount = Amount;
    ObjWalletTransaction.Type = 'Debit';
    ObjWalletTransaction.Remark = Remark;
    ObjWalletTransaction.OrderNumber =
      'WALTNO-' + GetRandomWord() + Date.parse(new Date());
    ObjWalletTransaction.Country = Country;
    ObjWalletTransaction.PaymentType = 'Offline';
    ObjWalletTransaction.DeviceId = DeviceId;
    ObjWalletTransaction.IsPaymentSuccess = 0;
    ObjWalletTransaction.CreatedDate = new Date();
    ObjWalletTransaction.CreatedBy = UserName;
    ObjWalletTransaction.ExpiryDate = AddDate(
      ObjWalletTransaction.CreatedDate,
      1,
      'Year'
    );
    ObjWalletTransaction.ModifiedDate = null;
    ObjWalletTransaction.ModifiedBy = null;
    ObjWalletTransaction.PaymentReceipt = null;

    WalletTransaction.findOne({
      where: {
        IsPaymentSuccess: false,
        idApp: ProductTypeId,
      },
    }).then(function (resTraExists) {
      if (resTraExists == null) {
        PutEntryWalletTransaction();
      } else {
        return callback({
          success: false,
          message: 'Already Transaction Exists.',
        });
      }
    });

    function PutEntryWalletTransaction() {
      WalletTransaction.create(ObjWalletTransaction).then(function (
        responseTransaction
      ) {
        return callback({
          success: true,
          message: 'Transaction successfully.',
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
    GetProductByNameForWallet(
      'Platform Charge',
      ProductTypeId,
      function (resProductId) {
        if (resProductId > 0) {
          GetProductAttributes(
            resProductId,
            Country,
            function (resAllAttributes) {
              for (var i = 0; i < resAllAttributes.length; i++) {
                PlatformTotalAmount += resAllAttributes[i].PriceAdjustment;
              }
              remark = 'Platform Charges = ' + PlatformTotalAmount;
              ForWardSimCharges();
            }
          );
        } else {
          ForWardSimCharges();
        }
      }
    );

    function ForWardSimCharges() {
      SimTotalAmount = 0;
      GetProductByNameForWallet(
        'SIM Charge',
        ProductTypeId,
        function (resSIMProductId) {
          if (resSIMProductId > 0) {
            GetProductAttributes(
              resSIMProductId,
              Country,
              function (resAllSIMAttributes) {
                for (var i = 0; i < resAllSIMAttributes.length; i++) {
                  SimTotalAmount += resAllSIMAttributes[i].PriceAdjustment;
                }
                if (remark != null) {
                  remark = remark + '<br/>SIM Charges = ' + SimTotalAmount;
                } else {
                  remark = 'SIM Charges = ' + SimTotalAmount;
                }
                ForWardResponse();
              }
            );
          } else {
            ForWardResponse();
          }
        }
      );
    }

    function ForWardResponse() {
      var TotalAmount = 0;
      TotalAmount = PlatformTotalAmount + SimTotalAmount;
      return callback({
        TotalAmount: TotalAmount,
        Remark: remark,
      });
    }
  } catch (err) {
    return callback({
      TotalAmount: 0,
      Remark: '',
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
    }).then(function (response) {
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
      },
    });

    GetMarkTypeId(function (resMarkId) {
      if (resMarkId > 0) {
        ForwardM(resMarkId);
      } else {
        return callback(false);
      }
    });

    function ForwardM(MarkId) {
      GpsDevice.findOne({
        where: {
          DeviceId: DeviceId,
        },
        include: [
          {
            model: SIM,
            require: true,
            where: {
              $and: [
                {
                  idApp: {
                    $ne: parseInt(MarkId),
                  },
                },
                {
                  idApp: {
                    $gt: 0,
                  },
                },
              ],
            },
          },
        ],
      }).then(function (resDevice) {
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
        AppName: 'Maark',
      },
    }).then(function (resMarkTypeId) {
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



function getVehicleLastLocation(callback) {
  var Startdate = new Date();

  var convertDate = convertdateformatForUnix(Startdate);
  var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
  var query =
    'select * from tblgpsdata a inner join (select max(Date) as maxdate,DeviceId from  tblgpsdata where Date<' +
    unixStartdate +
    " group by DeviceId) d on  a.DeviceId = d.DeviceId and a.Date =d.maxdate where a.GPSPositioning='A' group by a.DeviceId";
  connection.query(query, function (err, rows, fields) {
    if (!err && rows) {
      if (rows.length > 0) {
        for (var i = 0; i < rows.length; i++) {
          client.set(
            rows[i].DeviceId,
            JSON.stringify(rows[i]),
            function (err, replies) {}
          );
        }
        return callback({
          success: true,
          message: 'Data save successfully...',
        });
      } else {
        return callback({
          success: false,
          message: 'Data could not save...',
        });
      }
      // res.json(rows);
    } else {
      return callback({
        success: false,
        message: 'Data could not save...',
      });
    }
  });
}

router.get('/getVehicleLastLocation', function (req, res) {
  req.setTimeout(3600000);
  getVehicleLastLocation(function (response) {
    res.json(response);
  });
});

function convertdateformatForUnix(date1) {
  var date = new Date(date1);
  var firstdayMonth = date.getMonth() + 1;
  var firstdayDay = date.getDate();
  var firstdayYear = date.getFullYear();
  var firstdayHours = date.getHours();
  var firstdayMinutes = date.getMinutes();
  var firstdaySeconds = date.getSeconds();

  return (
    ('00' + firstdayYear.toString()).slice(-4) +
    '-' +
    ('00' + firstdayMonth.toString()).slice(-2) +
    '-' +
    ('0000' + firstdayDay.toString()).slice(-2) +
    ' ' +
    ('00' + firstdayHours.toString()).slice(-2) +
    ':' +
    ('00' + firstdayMinutes.toString()).slice(-2) +
    ':' +
    ('00' + firstdaySeconds.toString()).slice(-2)
  );
}

global.DefultAppSetting = DefultAppSetting;

function DefultAppSetting(Id) {
  var obj = new Object();
  obj.DefaultEmailFrom = process.env.SMTPuser;
  obj.SMTPService = process.env.SMTPService;
  obj.SMTPhost = process.env.SMTPhost;
  obj.SMTPuser = process.env.SMTPuser;
  obj.SMTPpass = process.env.SMTPpass;
  obj.IdApp = Id;
  EmailSetting.create(obj).then(function (EmailSettingCreated) {});
}

module.exports = router;
