 //Tables
 var router = express.Router();
 var User = models.tbluserinformation;
 var EmailSetting = models.tblemailsettingsys;
 var EmailTemplate = models.tblemailtemplate;
 var SystemEmail = models.tblemailsettingsys;
 //End of Tables

 //Email EmailSetting
 router.get('/GetAllEmailSetting', function(req, res) {
     EmailSetting.findAll().then(function(response) {
         res.json(response);
     }).catch(function(error) {
         res.json(error);
     })
 })

 router.get('/GetEmailSetting', function(req, res) {
     EmailSetting.findOne().then(function(response) {
         if (response != null) {
             res.json({
                 success: true,
                 message: "Email Setting found...",
                 data: response
             });
         } else {
             res.json({
                 success: false,
                 message: "Email Setting not found...",
                 data: response
             });
         }
     })
 })

 router.post('/SaveEmailSetting', jsonParser, function(req, res) {
     objEmailSetting = req.body;
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
                 if (objEmailSetting.id == 0) {

                     //set Parameter
                     req.query['permission'] = "Added";

                     var obj = {};
                     obj.headers = req.headers;
                     obj.query = req.query;

                     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                         var AccessPermission = responseAccessPermission.success;
                         if (AccessPermission) {

                             EmailSetting.create(objEmailSetting).then(function(response) {
                                 funAuditLog.CreateAuditLog('SaveEmailSetting', UserExist.username , 'Create Email Setting');
                                 res.json({
                                     success: true,
                                     message: "Email Setting created successfully...",
                                     data: response
                                 });
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

                             EmailSetting.update(objEmailSetting, {
                                 where: {
                                     id: objEmailSetting.id
                                 }
                             }).then(function(response) {
                                 if (response[0]) {
                                     funAuditLog.CreateAuditLog('SaveEmailSetting', UserExist.username , 'Update Email Setting');
                                     res.json({
                                         success: true,
                                         message: "Email Setting updated successfully...",
                                         data: response
                                     });
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

 router.get('/DeleteEmailSetting', function(req, res) {
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
                 EmailSetting.destroy({
                     where: {
                         id: req.query.idEmailSetting
                     }
                 }).then(function(response) {
                     if (response) {
                         funAuditLog.CreateAuditLog('DeleteEmailSetting', UserExist.username , 'Delete Email Setting');
                         res.json({
                             success: true,
                             message: "Email Setting deleted successfully...",
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
 });
 //End of Email Setting

 //Email Template
 router.get('/GetAllEmailTemplate', function(req, res) {
     EmailTemplate.findAll().then(function(response) {
         res.json(response);
     }).catch(function(error) {
         res.json(error);
     })
 })

 router.get('/GetEmailTemplateById', function(req, res) {
     EmailTemplate.findOne({
         where: {
             id: req.query.idEmailTemplate
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

 router.post('/SaveEmailTemplate', jsonParser, function(req, res) {
     objEmailTemplate = req.body;
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
                 if (objEmailTemplate.id == 0) {

                     //set Parameter
                     req.query['permission'] = "Added";

                     var obj = {};
                     obj.headers = req.headers;
                     obj.query = req.query;

                     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                         var AccessPermission = responseAccessPermission.success;
                         if (AccessPermission) {

                             EmailTemplate.create(objEmailTemplate).then(function(response) {
                                 funAuditLog.CreateAuditLog('SaveEmailTemplate', UserExist.username , 'Create Email Template');
                                 res.json({
                                     success: true,
                                     message: "EmailTemplate created successfully...",
                                     data: response
                                 });
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
                             EmailTemplate.update(objEmailTemplate, {
                                 where: {
                                     id: objEmailTemplate.id
                                 }
                             }).then(function(response) {
                                 if (response[0]) {
                                     funAuditLog.CreateAuditLog('SaveEmailTemplate', UserExist.username , 'Update Email Template');
                                     res.json({
                                         success: true,
                                         message: "EmailTemplate updated successfully...",
                                         data: response
                                     });
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

 router.get('/DeleteEmailTemplate', function(req, res) {
     objHeader = req.headers;

     //Set Parameter for User Permission
     req.query['tablename'] = req.headers['x-requested-with'];
     req.query['permission'] = "Deleted";

     var obj = {};
     obj.headers = req.headers;
     obj.query = req.query;

     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
         var AccessPermission = responseAccessPermission.success;
         if (AccessPermission) {

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
                         EmailTemplate.destroy({
                             where: {
                                 id: req.query.idEmailTemplate
                             }
                         }).then(function(response) {
                             if (response) {
                                 funAuditLog.CreateAuditLog('DeleteEmailTemplate', UserExist.username , 'Delete EmailTemplate');
                                 res.json({
                                     success: true,
                                     message: "EmailTemplate deleted successfully...",
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
 //End of Email Template

 //Send Email
 router.post('/SendEmail', jsonParser, function(req, res) {
     objEmail = req.body;
     objHeader = req.headers;
     //Set Parameter for User Permission
     req.query['tablename'] = req.headers['x-requested-with'];
     req.query['permission'] = "Added";

     var obj = {};
     obj.headers = req.headers;
     obj.query = req.query;

     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
         var AccessPermission = responseAccessPermission.success;
         if (AccessPermission) {
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
                         SystemEmail.findOne().then(function(objSystemEmail) {
                             var mail = {
                                 from: objSystemEmail.DefaultEmailFrom,
                                 to: objEmail.EmailTo, // + ', ' + objSystemEmail.NotificationEmailTo,
                                 subject: objEmail.EmailSubject,
                                 //text: 'hello ' + objUser.username + ' ' + 'Your New Password is ' + NewPassword,
                                 html: objEmail.EmailBody
                             };
                             transporter.sendMail(mail, function(error, response) {
                                 if (error) {
                                     res.json(error);
                                 } else {
                                     res.json({
                                         success: true,
                                         message: "Email has been sent successfully...",
                                         data: response
                                     });
                                 }
                             });
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
 //End of Send Email



 module.exports = router
