 //Tables
 var router = express.Router();
 var User = models.tbluserinformation;
 var Language = models.language;
 var LanguageResources = models.localestringresource;
 //End of Tables

 router.get('/GetAllLanguageResources', function(req, res) {
     var objParam = req.query;
     var objColumns = objParam.columns;
     var objOrderBy = objParam.order;
     var objSearch = objParam.search;
     console.log(objSearch)
         //  var objSearch = objParam.search.value;
     var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

     var search = "";
     if (objSearch != '' && objSearch != null && objSearch != undefined) {
         search = 'Where (localestringresource.ResourceName like "%' + objSearch + '%" or ';
         search = search + 'localestringresource.ResourceValue like "%' + objSearch + '%" or ';
         search = search + 'language.Name like "%' + objSearch + '%") ';
     }

     var query = "Select localestringresource.* ,language.id,language.Name from localestringresource inner join language on localestringresource.LanguageId = language.id " +
         search + " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
     var Countqry = "Select count(localestringresource.Id)  from localestringresource inner join language on localestringresource.LanguageId = language.id " + search;
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
                 var response1 = new Object();
                 response1.draw = objParam.draw;
                 response1.recordsTotal = 0;
                 response1.recordsFiltered = 0;
                 response1.data = [];
                 res.json(response1);
             }
         })
         //  LanguageResources.belongsTo(Language, {
         //      foreignKey: {
         //          name: 'LanguageId',
         //          allowNull: false
         //      }
         //  });
         //  LanguageResources.findAndCountAll({
         //      include: [{
         //          model: Language,
         //          attributes: ['Id', 'Name']
         //      }],
         //      where: search,
         //      order: Orderby,
         //      offset: parseInt(objParam.start),
         //      limit: parseInt(objParam.length),
         //  }).then(function(response) {
         //      var response1 = new Object();
         //      response1.draw = objParam.draw;
         //      response1.recordsTotal = response.count;
         //      response1.recordsFiltered = response.count;
         //      response1.data = response.rows;
         //      res.json(response1);
         //  }).catch(function(error) {
         //      res.json(error);
         //  })
 })

 router.get('/GetLanguageResourcesById', function(req, res) {
     LanguageResources.findOne({
         where: {
             Id: req.query.idLanguageResources
         }
     }).then(function(response) {
         if (response != null) {
             res.json({
                 success: true,
                 message: "Record found...",
                 data: response
             });
         } else {
             res.json({
                 success: false,
                 message: "Record not found...",
                 data: response
             });
         }
     })
 })

 router.post('/SaveLanguageResources', jsonParser, function(req, res) {
     objLanguageResources = req.body;
     objHeader = req.headers;
     //Set Parameter for User Permission
     req.query['tablename'] = req.headers['x-requested-with'];

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
                 if (objLanguageResources.Id == 0) {
                     //set Parameter
                     req.query['permission'] = "Added";

                     var obj = {};
                     obj.headers = req.headers;
                     obj.query = req.query;

                     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                         var AccessPermission = responseAccessPermission.success;
                         if (AccessPermission) {
                             LanguageResources.findOrCreate({
                                 where: {
                                     ResourceName: objLanguageResources.ResourceName,
                                     LanguageId: objLanguageResources.LanguageId
                                 },
                                 defaults: objLanguageResources
                             }).then(function(response) {
                                 if ((response[1])) {
                                     funAuditLog.CreateAuditLog('SaveLanguageResources', UserExist.username, 'Create Language Resources');
                                     res.json({
                                         success: true,
                                         message: "Language Resources created successfully...",
                                         data: response
                                     });
                                 } else {
                                     res.json({
                                         success: false,
                                         message: "Language Resources is already Exist...",
                                         data: response
                                     });
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

                     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                         var AccessPermission = responseAccessPermission.success;
                         if (AccessPermission) {
                             LanguageResources.findOne({
                                 where: {
                                     ResourceName: objLanguageResources.ResourceName,
                                     LanguageId: objLanguageResources.LanguageId
                                 }
                             }).then(function(objLanguageResourcesExist) {
                                 if (objLanguageResourcesExist != null && objLanguageResources.Id != objLanguageResourcesExist.Id) {
                                     res.json({
                                         success: false,
                                         message: "Language Resources is already Exist...",
                                         data: objLanguageResourcesExist
                                     });
                                 } else {
                                     LanguageResources.update(objLanguageResources, {
                                         where: {
                                             Id: objLanguageResources.Id
                                         }
                                     }).then(function(response) {
                                         if (response[0]) {
                                             funAuditLog.CreateAuditLog('SaveLanguageResources', UserExist.username, 'Update Language Resources');
                                             res.json({
                                                 success: true,
                                                 message: "Language Resources updated successfully...",
                                                 data: response
                                             });
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

 router.get('/DeleteLanguageResources', function(req, res) {
     objHeader = req.headers;
     var token = getToken(objHeader);
     //Set Parameter for User Permission
     req.query['tablename'] = req.headers['x-requested-with'];
     req.query['permission'] = "Deleted";

     var obj = {};
     obj.headers = req.headers;
     obj.query = req.query;

     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
         var AccessPermission = responseAccessPermission.success;
         if (AccessPermission) {
             if (token) {
                 var decoded = jwt.decode(token, TokenKey);
                 User.findOne({
                     where: {
                         username: decoded.username,
                         password: decoded.password
                     }
                 }).then(function(UserExist) {
                     if (UserExist != null) {
                         LanguageResources.destroy({
                             where: {
                                 Id: req.query.idLanguageResources
                             }
                         }).then(function(response) {
                             if (response) {
                                 funAuditLog.CreateAuditLog('DeleteLanguageResources', UserExist.username, 'Delete Language Resources');
                                 res.json({
                                     success: true,
                                     message: "Language Resources deleted successfully...",
                                     data: response
                                 });
                             } else {
                                 res.json({
                                     success: false,
                                     message: "Requested Record not Exist....",
                                     data: response
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
         } else {
             res.json(NoAccessPermission);
         }
     });
 });

 router.get('/ExportLanguage', function(req, res) {
     objLanguage = req.body;
     objHeader = req.headers;
     var conf = {};
     conf.name = "Sheet1";
     conf.cols = [{
         caption: 'Name',
         type: 'string'
     }, {
         caption: 'Value',
         type: 'string'
     }];

     LanguageResources.belongsTo(Language, {
         foreignKey: {
             name: 'LanguageId',
             allowNull: false
         }
     });

     LanguageResources.findAll({ where: { LanguageId: req.query.languageid } }).then(function(response) {
         conf.rows = [];
         for (var i = 0; i < response.length; i++) {
             var row = [];

             var Name = '';
             var Value = '';

             Name = response[i].ResourceName;
             Value = response[i].ResourceValue;

             row.push(Name, Value);
             conf.rows.push(row);
         }
         var result = nodeExcel.execute(conf);
         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
         res.setHeader("Content-Disposition", "attachment; filename=" + req.query.language + ".xlsx");
         res.end(result, 'binary');

     }).catch(function(error) {
         res.json({
             success: false,
             response: error
         });
     })

 });

 router.get('/DownloadTemplate', function(req, res) {
     Language.findAll().then(function(response) {
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
         }).catch(function(error) {
             res.json(error);
         })
         //  var conf = {};
         //  conf.name = "Sheet1";

     //  conf.cols = [{
     //      caption: 'Code',
     //      type: 'string'
     //  }, {
     //      caption: 'en-GB',
     //      type: 'string'
     //  }, {
     //      caption: 'gu-IN',
     //      type: 'string'
     //  }, {
     //      caption: 'hi-IN',
     //      type: 'string'
     //  }, {
     //      caption: 'ms-MY',
     //      type: 'string'
     //  }];


     //  var row = [];
     //  for (var i = 0; i < conf.cols.length; i++) {
     //      row.push('');
     //  };
     //  conf.rows = [];
     //  conf.rows.push(row);
     //  var result = nodeExcel.execute(conf);
     //  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
     //  res.setHeader("Content-Disposition", "attachment; filename=" + "MobileLanguageResources_Template.xlsx");
     //  res.end(result, 'binary');
 })

 router.post('/ImportExcel', jsonParser, function(req, res) {
     var form = new formidable.IncomingForm();
     var FileName = [];
     var LanguageId = 0;
     var lst = [];

     //Set Parameter for User Permission
     req.query['tablename'] = req.headers['x-requested-with'];

     form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

     //file upload path
     form.parse(req, function(err, fields, files) {
         LanguageId = fields.LanguageId;
     });

     //First Call this
     form.on('fileBegin', function(name, file) {
         file.path = form.uploadDir + "/" + file.name;
         FileName.push(file.path);
     });

     form.on('end', function() {
         if (FileName.length > 0) {
             var workbook = XLSX.readFile(FileName[0], { type: 'binary' });
             var first_sheet_name = workbook.SheetNames[0];
             var worksheet = workbook.Sheets[first_sheet_name];

             if (worksheet != null && worksheet != undefined && worksheet != '') {
                 var Firstcolumn = worksheet.A1.v;
                 var Secondcolumn = worksheet.B1.v;
                 var Thirdcolumn = worksheet.C1;
                 if (Firstcolumn == "Name" && Secondcolumn == "Value" && Thirdcolumn == undefined) {
                     lst = XLSX.utils.sheet_to_json(worksheet);
                     if (lst.length > 0) {
                         function uploadExcel(i) {

                             if (i < lst.length) {

                                 var objLanguageResources = lst[i];
                                 //set Parameter
                                 req.query['permission'] = "Added";

                                 var obj = {};
                                 obj.headers = req.headers;
                                 obj.query = req.query;

                                 funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                                     var AccessPermission = responseAccessPermission.success;
                                     if (AccessPermission) {

                                         LanguageResources.findOne({
                                             where: {
                                                 ResourceName: objLanguageResources.Name,
                                                 LanguageId: LanguageId,
                                             }
                                         }).then(function(responseLanguageResourcesExist) {
                                             if (responseLanguageResourcesExist != null) {
                                                 //update
                                                 var updateObjLanguageResources = new Object();
                                                 updateObjLanguageResources.Id = responseLanguageResourcesExist.Id;
                                                 updateObjLanguageResources.LanguageId = responseLanguageResourcesExist.LanguageId;
                                                 updateObjLanguageResources.ResourceName = responseLanguageResourcesExist.ResourceName;
                                                 updateObjLanguageResources.ResourceValue = objLanguageResources.Value;

                                                 LanguageResources.update(updateObjLanguageResources, {
                                                     where: {
                                                         Id: updateObjLanguageResources.Id
                                                     }
                                                 }).then(function(response) {
                                                     uploadExcel(i + 1);
                                                 })
                                             } else {
                                                 var NewObjLanguageResources = new Object();
                                                 NewObjLanguageResources.Id = 0;
                                                 NewObjLanguageResources.LanguageId = LanguageId;
                                                 NewObjLanguageResources.ResourceName = objLanguageResources.Name;
                                                 NewObjLanguageResources.ResourceValue = objLanguageResources.Value;
                                                 //insert
                                                 LanguageResources.create(NewObjLanguageResources).then(function(response) {
                                                     uploadExcel(i + 1);

                                                 });

                                             }
                                         })
                                     } else {
                                         res.json(NoAccessPermission);
                                     }
                                 });

                             } else {
                                 res.json({
                                     success: true,
                                     message: "Excel File uploaded successfully..",
                                 });
                             }
                         }
                         uploadExcel(0);
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

 router.get('/GetMobileLanguageData', function(req, res) {
     // var translations = {
     //     "en_GB": {
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
     //         "Pettroway Login": "Pettroway Login",
     //         "Logout": "Logout",
     //         "Share This App": "Share This App",
     //         "About": "About",
     //         "Cancel": "Cancel",
     //         "Register": "Register",
     //         "OR": "OR",
     //         "Email": "Email",
     //         "Password": "Password",
     //         "Phone": "Phone",
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
     //         "Wifi Settings": "Wifi Settings",
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
     //         "DeletePetConfirmMessage": "Are you sure you want to delete this Pet?",
     //         //new
     //         "FullName": "FullName",

     //     },
     //     "zh_CN": {
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
     //         "Pettroway Login": "Pettroway登录",
     //         "Logout": "登出",
     //         "Share This App": "分享这个应用程式",
     //         "About": "关于",
     //         "Cancel": "取消",
     //         "Register": "寄存器",
     //         "OR": "要么",
     //         "Email": "電子郵件",
     //         "Password": "密码",
     //         "Phone": "电话",
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
     //         "Wifi Settings": "无线网络设置",
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
     //         "DeletePetConfirmMessage": "你确定要删除这个宠物？",
     //         //new
     //         "Full Name": "全名",
     //         "Subject": "主题",
     //         "Message": "信息",
     //         "Send Feedback": "发送反馈",
     //         "Please Enter Full Name": "请输入全名",
     //         "Please Enter Email": "请输入电子邮件",
     //         "Please Enter Subject": "请输入主题",
     //         "Please Enter Enquiry": "请输入查询",
     //         "Please Enter Email Id": "请输入email",
     //         "Please Enter Password": "请输入密码",
     //         "Please Enter Phone Number": "请输入手机号码",
     //         "FOLLOW US": "关注我们",

     //         //new
     //         "Login Failed": "登入失败",
     //         "Invalid Username or Password": "无效的用戶名或密码",
     //         "Play": "播放",
     //         "Pause": "暂停",
     //         "Device Located": "定位成功",
     //         "I am at home.": "我在家",
     //         "Loading": "加载",
     //         "Please set Fence": "请设置转栏",
     //         "Login Failed": "登入失败",
     //         "Birthday": "生日",
     //         "Device Id": "设备ID",
     //         "Renewal Date": "更新日期",
     //         "Edit": "编辑",
     //         "Location": "位置",
     //         "Nevigate": "导航",
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
     //         "Pettroway Login": "Pettroway Login",
     //         "Share This App": "Share This App",
     //         "About": "About",
     //         "Cancel": "Cancel",
     //         "Register": "Neu registrieren",
     //         "OR": "OR",
     //         "Email": "Email",
     //         "Password": "Passwort",
     //         "Phone": "Telefon",
     //         "Required Email Message": "Please Enter Email Id.",
     //         "Valid Email Message": "Please Enter Valid Email address.",
     //         "Required Password Message": "Please Enter Password.",
     //         "Valid Password Message": "Passwords must be between 2 and 20 characters.",
     //         "Required Phone Message": "Please Enter Phone Number.",
     //         "Write a Comment": "Schreibe einen Kommentar...",
     //         "Post": "Post",
     //         "FacebookLoginMessage": "Sie müssen Facebook anmelden diese action.Do Sie jetzt anmelden möchten ausführen?",
     //         "Yes": "ja",
     //         "No": "Nein",
     //         "Facebook Login": "Facebook Anmeldung",
     //         "Add Pet": "Add Pet",
     //         "Fence": "Fence",
     //         "Power Saving": "Power Saving",
     //         "Action For": "Action For",
     //         "Wifi Settings": "Wifi Settings",
     //         "Adventures": "Adventures",
     //         "Show Alarms": "Show Alarms",
     //         "Delete Pet": "Delete Pet",
     //         "DeviceConnectedMessage": "Das Gerät ist mit",
     //         "DeviceNotConnectedMessage": "Device is currently not connected to Wifi.",
     //         "NoNetworkFoundMessage": "No Network Found.",
     //         "Alarms": "Alarm",
     //         "Clear": "Klar",
     //         "Fence In": "einzäunen",
     //         "Fence Out": "Fence Out",
     //         "Low Battery": "Low Battery",
     //         "NoAlarmsMessage": "No Alarms Found",
     //         "Ok": "Ok",
     //         "DeletePetConfirmMessage": "Are you sure you want to delete this Pet?",
     //         //new
     //         "Login Failed": "Anmeldung fehlgeschlagen",
     //         "Invalid Username or Password": "Ungültiger Benutzername oder Passwort",
     //         "Play": "Spielen",
     //         "Pause": "Pause",
     //         "Device Located": "Geräts",
     //         "I am at home.": "Ich bin zu Hause.",
     //         "Loading": "Laden",
     //         "Please set Fence": "Bitte setzen Sie Zaun",
     //         "Login Failed": "Anmeldung fehlgeschlagen",
     //         "Birthday": "Geburtstag",
     //         "Device Id": "Geräte ID",
     //         "Renewal Date": "Verlängerungsdatum",
     //         "Edit": "Bearbeiten",
     //         "Location": "Ort",
     //         "Nevigate": "Nevigate",
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
     //         "Please Enter Email Id": "Bitte geben Sie E-Mail-Id",
     //         "Please Enter Password": "Bitte Passwort eingeben",
     //         "Please Enter Phone Number": "Bitte Telefonnummer eingeben",
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
     //         "Pettroway Login": "entrada Pettorway",
     //         "Logout": "Cerrar sesión",
     //         "Share This App": "Comparte esta",
     //         "About": "Acerca de",
     //         "Cancel": "Cancel",
     //         "Register": "Registro",
     //         "OR": "OR",
     //         "Email": "Email",
     //         "Password": "Contraseña",
     //         "Phone": "Teléfono",
     //         "Required Email Message": "Please Enter Email Id.",
     //         "Valid Email Message": "Please Enter Valid Email address.",
     //         "Required Password Message": "Please Enter Password.",
     //         "Valid Password Message": "Passwords must be between 2 and 20 characters.",
     //         "Required Phone Message": "Please Enter Phone Number.",
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
     //         "Wifi Settings": "wifi Marco",
     //         "Adventures": "aventuras",
     //         "Show Alarms": "Show Alarms",
     //         "Delete Pet": "eliminar de mascotas",
     //         "DeviceConnectedMessage": "El dispositivo no conectado. Pruebe después de 5 minutos",
     //         "DeviceNotConnectedMessage": "Device is currently not connected to Wifi.",
     //         "NoNetworkFoundMessage": "No Network Found.",
     //         "Alarms": "alarmas",
     //         "Clear": "Claro",
     //         "Fence In": "En la cerca",
     //         "Fence Out": "Fuera de la cerca",
     //         "Low Battery": "Batería baja",
     //         "NoAlarmsMessage": "No Alarms Found",
     //         "Ok": "DE ACUERDO",
     //         "DeletePetConfirmMessage": "Are you sure you want to delete this Pet?",
     //         "Birthday": "Cumpleaños",
     //         "Device Id": "ID del dispositivo",
     //         "Renewal Date": "Fecha de renovación",
     //         "Edit": "Editar",
     //         "Location": "Pet Art",
     //         "Nevigate": "Nevigate",
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
     //         "Please Enter Email Id": "Por favor, introduzca Identificación del email",
     //         "Please Enter Password": "Por favor, ingrese contraseña",
     //         "Please Enter Phone Number": "Por favor Introducir número de teléfono",
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
     //         "Pettroway Login": "Pettroway Login",
     //         "Logout": "Logga ut",
     //         "Share This App": "Dela Denna app",
     //         "About": "Handla om",
     //         "Cancel": "Cancel",
     //         "Register": "Registrera",
     //         "OR": "OR",
     //         "Email": "E-post",
     //         "Password": "Lösenord",
     //         "Phone": "Telefon",
     //         "Required Email Message": "Please Enter Email Id.",
     //         "Valid Email Message": "Please Enter Valid Email address.",
     //         "Required Password Message": "Please Enter Password.",
     //         "Valid Password Message": "Passwords must be between 2 and 20 characters.",
     //         "Required Phone Message": "Please Enter Phone Number.",
     //         "Likes": "Omtyckt",
     //         "Comments": "kommentarer",
     //         "Write a Comment": "Skriv en kommentar",
     //         "Post": "Post",
     //         "FacebookLoginMessage": "Du måste logga in på Facebook för att utföra denna action. Do du vill logga in nu?",
     //         "Yes": "Ja",
     //         "No": "Nej",
     //         "Facebook Login": "Facebook inloggning",
     //         "Add Pet": "Add Pet",
     //         "Fence": "Staket",
     //         "Power Saving": "Energibesparing",
     //         "Action For": "handling För",
     //         "Wifi Settings": "wiFi Setting",
     //         "Adventures": "äventyr",
     //         "Show Alarms": "Show Alarms",
     //         "Delete Pet": "radera Pet",
     //         "DeviceConnectedMessage": "Enheten är ansluten till",
     //         "DeviceNotConnectedMessage": "Device is currently not connected to Wifi.",
     //         "NoNetworkFoundMessage": "No Network Found.",
     //         "Alarms": "larm",
     //         "Clear": "Klar",
     //         "Fence In": "INHÄGNA",
     //         "Fence Out": "staket ut",
     //         "Low Battery": "Låg batterinivå",
     //         "NoAlarmsMessage": "No Alarms Found",
     //         "Ok": "Ok",
     //         "DeletePetConfirmMessage": "Are you sure you want to delete this Pet?",
     //         "Birthday": "Födelsedag",
     //         "Device Id": "Enhets-ID",
     //         "Renewal Date": "Förnyelsedatum",
     //         "Edit": "Redigera",
     //         "Location": "Plats",
     //         "Nevigate": "Nevigate",
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
     //         "Please Enter Email Id": "Ange E Id",
     //         "Please Enter Password": "Ange lösenord",
     //         "Please Enter Phone Number": "Ange telefonnummer",
     //         "FOLLOW US": "FÖLJ OSS",
     //     }

     // };


     var file = __dirname + "/MultiLangugaeFile/MobileLanguageResource.json";

     // jsonfile.writeFile(file, translations, function (err) {
     //   console.error(err)
     // })

     jsonfile.readFile(file, function(err, obj) {
         res.json(obj);
     })
 })

 router.post('/SaveMobileLanguageData', jsonParser, function(req, res) {
     objMobileLanguageData = req.body;
     objHeader = req.headers;
     var token = getToken(objHeader);
     //Set Parameter for User Permission
     req.query['tablename'] = req.headers['x-requested-with'];
     req.query['permission'] = "Modified";

     var obj = {};
     obj.headers = req.headers;
     obj.query = req.query;

     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
         var AccessPermission = responseAccessPermission.success;
         if (AccessPermission) {
             if (token) {
                 var decoded = jwt.decode(token, TokenKey);
                 User.findOne({
                     where: {
                         username: decoded.username,
                         password: decoded.password
                     }
                 }).then(function(UserExist) {
                     if (UserExist != null) {
                         var file = __dirname + "/MultiLangugaeFile/MobileLanguageResource.json";
                         var array = [];


                         var lstMobileLanguageResources = [];
                         jsonfile.readFile(file, function(err, obj) {
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
                                 jsonfile.writeFile(file, lstMobileLanguageResources, function(err) {
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

 router.get('/ExportMobileLanguageResource', function(req, res) {

     var file = __dirname + "/MultiLangugaeFile/MobileLanguageResource.json";
     var conf = {};
     conf.cols = [];

     jsonfile.readFile(file, function(err, obj) {
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

 router.post('/ImportMobileLanguageResource', jsonParser, function(req, res) {
     var form = new formidable.IncomingForm();
     var FileName = [];
     var LanguageId = 0;
     var lst = [];
     //Set Parameter for User Permission
     req.query['tablename'] = req.headers['x-requested-with'];
     form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

     //file upload path
     form.parse(req, function(err, fields, files) {
         LanguageId = fields.LanguageId;
     });

     //First Call this
     form.on('fileBegin', function(name, file) {
         file.path = form.uploadDir + "/" + file.name;
         FileName.push(file.path);
     });

     form.on('end', function() {
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

                         funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                             var AccessPermission = responseAccessPermission.success;
                             if (AccessPermission) {

                                 jsonfile.writeFile(file, language, function(err) {
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