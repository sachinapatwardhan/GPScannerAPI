 //Tables
 var router = express.Router();
 var User = models.tbluserinformation;
 var UserInRole = models.tbluserinrole;
 var Role = models.tblrole;
 var Pet = models.tblpet;
 var Bike = models.tblbike;
 var Country = models.tblcountrymgmt;
 var State = models.tblcountrystatemgmt;
 //End of Tables

 router.get('/GetAllUser', function(req, res) {

     User.hasMany(UserInRole, {
         foreignKey: {
             name: 'userId',
             allowNull: false
         }
     });

     UserInRole.belongsTo(Role, {
         foreignKey: {
             name: 'roleId',
             allowNull: false
         }
     });

     User.findAll({
         include: [{
             model: UserInRole,
             include: [
                 Role
             ]
         }],
         order: 'createddate'
     }).then(function(response) {
         res.json(response);
     }).catch(function(error) {
         res.json(error);
     })
 })

 router.get('/GetFirstUserSequelize', function(req, res) {
     User.findOne().then(function(response) {
         var obj = new Object();
         obj.status = true;
         obj.data = response;
         res.json(obj);
     }).catch(function(error) {
         var obj = new Object();
         obj.status = false;
         obj.data = error;
         res.json(obj);
     })
 })

 router.get('/GetAllDynamicUser', function(req, res) {

     var objParam = req.query;
     var objColumns = objParam.columns;
     var objOrder = objParam.order;
     var objSearch = objParam.search.value;

     var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
     var search = {};


     if (objSearch != null && objSearch != '') {
         search['$or'] = [];

         for (var i = 0; i < objColumns.length; i++) {
             if (objColumns[i].data != null && objColumns[i].data != '') {
                 var columnName = objColumns[i].data;

                 if (columnName != 'createddate') {
                     search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                 }
             };
         };
     }



     User.hasMany(UserInRole, {
         foreignKey: {
             name: 'userId',
             allowNull: false
         }
     });

     UserInRole.belongsTo(Role, {
         foreignKey: {
             name: 'roleId',
             allowNull: false
         }
     });

     User.findAndCountAll({
         where: search,
         order: Orderby,
         offset: parseInt(objParam.start),
         limit: parseInt(objParam.length),
         include: [{
             model: UserInRole,
             include: [
                 Role
             ]
         }]
     }).then(function(response) {
         var response1 = new Object();
         response1.draw = objParam.draw;
         response1.recordsTotal = response.count;
         response1.recordsFiltered = response.count;
         response1.data = response.rows;
         res.json(response1);
     }).catch(function(error) {
         res.json(error);
     })
 })

 router.get('/GetAllDynamicCustomer', function(req, res) {
     var objParam = req.query;
     var objColumns = objParam.columns;
     var objOrder = objParam.order;
     var objSearch = objParam.search.value;

     var CountryList = objParam.CountryList;
     if (CountryList == undefined || CountryList == null || CountryList == "") {
         CountryList = [];
     }
     var UserRoles = objParam.UserRoles;
     var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
     var search = {};
     var search1 = {};

     search1['$and'] = [];

     var IsUserSuperAdmin = false;
     var IsCountryAll = false;

     if (UserRoles.length > 0) {

         function CheckUserCountry(i) {
             if (i < UserRoles.length) {

                 if (UserRoles[i] == 'Super Admin') {
                     IsUserSuperAdmin = true;
                     CheckUserCountry(i + 1);
                 } else {
                     CheckUserCountry(i + 1);
                 }

             } else {
                 if (!IsUserSuperAdmin) {
                     search['$or'] = [];
                 } else {
                     search['$and'] = [];
                 }

                 if (objSearch != null && objSearch != '') {
                     search1['$or'] = [];

                     for (var i = 0; i < objColumns.length; i++) {
                         if (objColumns[i].data != null && objColumns[i].data != '') {
                             var columnName = objColumns[i].data;
                             if (columnName != 'CreatedDate') {
                                 search1['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                             }
                         };
                     };
                 }
                 if (!IsUserSuperAdmin) {
                     search['$or'] = [];
                     if (CountryList.length > 0) {
                         function CheckCountry(p) {
                             if (p < CountryList.length) {
                                 var obj = new Object();
                                 if (CountryList[p] != "") {

                                     obj['country'] = {
                                         $like: '%' + CountryList[p] + '%'
                                     }
                                     search['$or'].push(obj);

                                     if (CountryList[p] == "All") {
                                         IsCountryAll = true;
                                     }
                                 }
                                 CheckCountry(p + 1);
                             }
                         }
                         CheckCountry(0);
                     }
                 }

                 if (IsCountryAll) {
                     search = {};
                 } else {
                     search1['$and'].push(search)
                 }

                 User.hasMany(Pet, {
                     foreignKey: {
                         name: 'iduser',
                         allowNull: false
                     }
                 });

                 User.findAndCountAll({
                     required: true,
                     where: search1,
                     order: Orderby,
                     offset: parseInt(objParam.start),
                     limit: parseInt(objParam.length),
                     include: [{
                         model: Pet,
                         attributes: [
                             [('DISTINCT', models.sequelize.col('iduser')), 'iduser']
                         ],
                         where: {
                             IsDeleted: 0,
                             deviceid: {
                                 $ne: ''
                             }
                         },
                     }],
                 }).then(function(response) {
                     var response1 = new Object();
                     response1.draw = objParam.draw;
                     response1.recordsTotal = response.count;
                     response1.recordsFiltered = response.count;
                     response1.data = response.rows;
                     res.json(response1);
                 }).catch(function(error) {
                     res.json(error);
                 })
             }
         }
         CheckUserCountry(0)
     }
 })

 router.get('/GetAllDynamicUserbyCountry', function(req, res) {

     var objParam = req.query;
     var objColumns = objParam.columns;
     var objOrder = objParam.order;
     var objSearch = objParam.search.value;
     var UserCountry = objParam.UserCountry;
     var Type = objParam.Type;
     var CountryList = objParam.CountryList;
     if (CountryList == undefined || CountryList == null || CountryList == "") {
         CountryList = [];
     }
     var UserRoles = objParam.UserRoles;
     var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
     var search = {};
     var search1 = {};
     var search2 = {};
     var search3 = {};
     //var search2 = {};

     search1['$and'] = [];
     //search1['$or'] = [];
     var IsUserSuperAdmin = false;
     var IsCountryAll = false;


     if (UserRoles.length > 0) {

         function CheckUserCountry(i) {
             if (i < UserRoles.length) {

                 if (UserRoles[i] == 'Super Admin') {
                     IsUserSuperAdmin = true;
                     CheckUserCountry(i + 1);
                 } else {
                     CheckUserCountry(i + 1);
                 }

             } else {
                 if (!IsUserSuperAdmin) {
                     search['$or'] = [];
                 } else {
                     search['$and'] = [];
                 }
                 if (objSearch != null && objSearch != '') {
                     search2['$or'] = [];

                     for (var i = 0; i < objColumns.length; i++) {
                         if (objColumns[i].data != null && objColumns[i].data != '') {
                             var columnName = objColumns[i].data;

                             if (columnName != 'createddate') {
                                 search2['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                             }
                         };
                     };
                     search1['$and'].push(search2);
                 }
                 if (Type != null && Type != '') {
                     search3['$or'] = [];

                     for (var i = 0; i < Type.length; i++) {
                         if (Type[i] != null && Type[i] != '') {
                             var TypeName = Type[i];
                             var obj = new Object();
                             if (TypeName != '') {
                                 obj['Type'] = {
                                     $eq: TypeName
                                 }
                                 search3['$or'].push(obj);
                             }
                         };
                     };
                     //console.log("search3",search3['$or'])
                     search1['$and'].push(search3);
                 }
                 if (!IsUserSuperAdmin) {
                     search['$or'] = [];
                     if (CountryList.length > 0) {
                         function CheckCountry(p) {
                             if (p < CountryList.length) {
                                 var obj = new Object();
                                 if (CountryList[p] != "") {

                                     obj['country'] = {
                                         $like: '%' + CountryList[p] + '%'
                                     }
                                     search['$or'].push(obj);

                                     if (CountryList[p] == "All") {
                                         IsCountryAll = true;
                                     }
                                 }
                                 CheckCountry(p + 1);
                             }
                         }
                         CheckCountry(0);
                     }
                 }


                 if (IsCountryAll) {
                     search = {};
                 } else {
                     search1['$and'].push(search)
                 }

                 User.hasMany(UserInRole, {
                     foreignKey: {
                         name: 'userId',
                         allowNull: false
                     }
                 });

                 UserInRole.belongsTo(Role, {
                     foreignKey: {
                         name: 'roleId',
                         allowNull: false
                     }
                 });
                 User.findAndCountAll({
                     where: search1,
                     order: Orderby,
                     offset: parseInt(objParam.start),
                     limit: parseInt(objParam.length),
                     include: [{
                         model: UserInRole,
                         include: [
                             Role
                         ]
                     }]
                 }).then(function(response) {
                     var response1 = new Object();
                     response1.draw = objParam.draw;
                     response1.recordsTotal = response.count;
                     response1.recordsFiltered = response.count;
                     response1.data = response.rows;
                     res.json(response1);
                 }).catch(function(error) {
                     res.json(error);
                 })
             }
         }
         CheckUserCountry(0)
     }
 })

 router.get('/GetUserByName', function(req, res) {

     User.hasMany(UserInRole, {
         foreignKey: {
             name: 'userId',
             allowNull: false
         }
     });

     UserInRole.belongsTo(Role, {
         foreignKey: {
             name: 'roleId',
             allowNull: false
         }
     });

     User.findAll({
         where: {
             username: {
                 $like: '%' + req.query.UserName + '%'
             }
         },
         include: [{
             model: UserInRole,
             include: [
                 Role
             ]
         }],
         order: 'username',
         limit: 10
     }).then(function(response) {
         res.json(response);
     }).catch(function(error) {
         res.json(error);
     })
 })

 router.get('/GetUserById', function(req, res) {

     User.findOne({
         where: {
             id: req.query.idUser
         }
     }).then(function(response) {
         if (response != null) {
             if (req.query.OTP) {
                 response.updateAttributes({ OTP: req.query.OTP }).then(function(resUpdate) {
                     response.OTP = req.query.OTP;
                     res.json({
                         success: true,
                         message: "Record found...",
                         data: response
                     });
                 })
             } else {
                 res.json({
                     success: true,
                     message: "Record found...",
                     data: response
                 });
             };

         } else {
             res.json({
                 success: false,
                 message: "Record not found...",
                 data: response
             });
         }
     })
 })


 var https = require('https');
 router.get('/GetSupportUserById', function(req, res) {
     //set Parameter
     req.query['permission'] = "Modified";

     var obj = {};
     obj.headers = req.headers;
     obj.query = req.query;

     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
         var AccessPermission = responseAccessPermission.success;
         if (AccessPermission) {


             User.findOne({
                 where: {
                     id: req.query.idUser
                 }
             }).then(function(response) {
                 if (response != null) {
                     if (req.query.OTP) {
                         response.updateAttributes({ OTP: req.query.OTP }).then(function(resUpdate) {
                             response.OTP = req.query.OTP;
                             var data = JSON.stringify({
                                 api_key: 'a692ce5b',
                                 api_secret: '928903ee92ecd3e4',
                                 text: 'Your One Time Password(OTP) is ' + req.query.OTP,
                                 to: resUpdate.phone,
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

                             var req1 = https.request(options);

                             req1.write(data);
                             req1.end();

                             var responseData = '';
                             req1.on('response', function(res1) {
                                 res1.on('data', function(chunk) {
                                     responseData += chunk;
                                 });

                                 res1.on('end', function() {
                                     console.log(JSON.parse(responseData));
                                     res.json({
                                         success: true,
                                         message: "Record found...",
                                         data: JSON.parse(responseData)
                                     });
                                 });
                             });
                         })
                     } else {
                         res.json({
                             success: false,
                             message: "Record found...",
                             data: response
                         });
                     };

                 } else {
                     res.json({
                         success: false,
                         message: "Record not found...",
                         data: response
                     });
                 }
             })
         } else {
             res.json(NoAccessPermission);
         }
     });
 })

 router.get('/SendOTPById', function(req, res) {

     User.findOne({
         where: {
             id: req.query.idUser
         }
     }).then(function(response) {
         if (response != null) {

             // response.updateAttributes({ OTP: req.query.OTP }).then(function(resUpdate) {
             //     response.OTP = req.query.OTP;
             //     res.json({
             //         success: true,
             //         message: "Record found...",
             //         data: response
             //     });
             // })

             var data = JSON.stringify({
                 api_key: 'a692ce5b',
                 api_secret: '928903ee92ecd3e4',
                 text: 'Your One Time Password(OTP) is ' + req.query.OTP,
                 to: response.phone,
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

             var req1 = https.request(options);

             req1.write(data);
             req1.end();

             var responseData = '';
             req1.on('response', function(res1) {
                 res1.on('data', function(chunk) {
                     responseData += chunk;
                 });

                 res1.on('end', function() {
                     console.log(JSON.parse(responseData));
                     res.json({
                         success: true,
                         message: "Record found...",
                         data: JSON.parse(responseData)
                     });
                 });
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

 router.get('/GetUserByOTP', function(req, res) {

     User.findOne({
         where: {
             id: req.query.idUser,
             OTP: req.query.OTP,
         }
     }).then(function(response) {
         if (response != null) {

             response.updateAttributes({ IsMobileVerify: true }).then(function(resUpdate) {

                 UserInRole.belongsTo(Role, {
                     foreignKey: {
                         name: 'roleId',
                         allowNull: false
                     }
                 });
                 UserInRole.findAll({
                     where: {
                         userId: response.id
                     },
                     include: [{
                         model: Role,
                         attributes: ['id', 'RoleName']
                     }]
                 }).then(function(resUserInRole) {
                     var lstRole = [];
                     for (var i = 0; i < resUserInRole.length; i++) {
                         var objRole = resUserInRole[i].tblrole.RoleName;
                         lstRole.push(objRole);
                     }

                     var user = {
                         username: response.username,
                         password: response.password,
                         Role: lstRole
                     }
                     var token = jwt.encode(user, "bugz");
                     var Usertoken = 'JWT ' + token;

                     res.json({
                         success: true,
                         message: "Record found...",
                         data: response,
                         token: Usertoken
                     });
                 })
             })


         } else {
             res.json({
                 success: false,
                 message: "Record not found...",
                 data: response
             });
         }
     })
 })

 router.get('/GetUserProfile', function(req, res) {
     User.hasMany(UserInRole, {
         foreignKey: {
             name: 'userId',
             allowNull: false
         }
     });

     UserInRole.belongsTo(Role, {
         foreignKey: {
             name: 'roleId',
             allowNull: false
         }
     });


     User.findOne({
         where: {
             username: req.query.username
         },
         include: [{
             model: UserInRole,
             include: [Role]
         }]
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

 router.post('/SaveUser', jsonParser, function(req, res) {
     objUser = req.body;
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
                 if (objUser.id != 0) {

                     //set Parameter
                     req.query['permission'] = "Modified";

                     var obj = {};
                     obj.headers = req.headers;
                     obj.query = req.query;

                     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                         var AccessPermission = responseAccessPermission.success;
                         if (AccessPermission) {

                             User.findOne({
                                 where: {
                                     username: objUser.username
                                 },
                                 defaults: objUser
                             }).then(function(objUserExist) {
                                 if (objUserExist != null && objUser.id != objUserExist.id) {
                                     res.json({
                                         success: false,
                                         message: "User is already Exist...",
                                         data: objUserExist
                                     });
                                 } else {

                                     if (objUser.phone && objUser.phone != '') {
                                         User.findOne({
                                             where: {
                                                 // email: objUserReg.email
                                                 $or: [{ email: objUser.email }, { phone: objUser.phone }],
                                                 $and: [{
                                                     id: { $ne: objUser.id }
                                                 }]

                                             }
                                         }).then(function(chkEmailExist) {
                                             if (chkEmailExist != null) {
                                                 if (objUser.phone == chkEmailExist.phone) {
                                                     res.json({
                                                         success: false,
                                                         message: "Phone is already Exist..."
                                                     });
                                                 } else {
                                                     res.json({
                                                         success: false,
                                                         message: "Email is already Exist..."
                                                     });
                                                 }
                                             } else {
                                                 User.update(objUser, {
                                                     where: {
                                                         id: objUser.id
                                                     }
                                                 }).then(function(responseUser) {
                                                     UserInRole.destroy({
                                                         where: {
                                                             userId: objUser.id
                                                         }
                                                     }).then(function(response) {
                                                         if (objUser.roleId.length > 0) {
                                                             function uploader(i) {
                                                                 if (i < objUser.roleId.length) {
                                                                     var objUserInRole = {
                                                                         userId: objUser.id,
                                                                         roleId: objUser.roleId[i].id
                                                                     }
                                                                     UserInRole.create(objUserInRole).then(function(response) {
                                                                         if (objUser.roleId.length == (i + 1)) {
                                                                             funAuditLog.CreateAuditLog('SaveUser', UserExist.username, 'Update User');
                                                                             res.json({
                                                                                 success: true,
                                                                                 message: "User updated successfully...",
                                                                                 data: response
                                                                             });
                                                                         } else {
                                                                             uploader(i + 1);
                                                                         }
                                                                     })

                                                                 }
                                                             }
                                                             uploader(0);
                                                         } else {
                                                             res.json({
                                                                 success: false,
                                                                 message: "Please Select atleast One Role..."
                                                             });
                                                         }
                                                     })
                                                 })
                                             }

                                         });
                                     } else {
                                         User.findOne({
                                             where: {
                                                 // email: objUserReg.email
                                                 $or: [{ email: objUser.email }],
                                                 $and: [{
                                                     id: { $ne: objUser.id }
                                                 }]

                                             }
                                         }).then(function(chkEmailExist) {
                                             if (chkEmailExist != null) {
                                                 // if (objUser.phone == chkEmailExist.phone) {
                                                 //     res.json({
                                                 //         success: false,
                                                 //         message: "Phone is already Exist..."
                                                 //     });
                                                 // } else {
                                                 res.json({
                                                     success: false,
                                                     message: "Email is already Exist..."
                                                 });
                                                 //}
                                             } else {
                                                 User.update(objUser, {
                                                     where: {
                                                         id: objUser.id
                                                     }
                                                 }).then(function(responseUser) {
                                                     UserInRole.destroy({
                                                         where: {
                                                             userId: objUser.id
                                                         }
                                                     }).then(function(response) {
                                                         if (objUser.roleId.length > 0) {
                                                             function uploader(i) {
                                                                 if (i < objUser.roleId.length) {
                                                                     var objUserInRole = {
                                                                         userId: objUser.id,
                                                                         roleId: objUser.roleId[i].id
                                                                     }
                                                                     UserInRole.create(objUserInRole).then(function(response) {
                                                                         if (objUser.roleId.length == (i + 1)) {
                                                                             funAuditLog.CreateAuditLog('SaveUser', UserExist.username, 'Update User');
                                                                             res.json({
                                                                                 success: true,
                                                                                 message: "User updated successfully...",
                                                                                 data: response
                                                                             });
                                                                         } else {
                                                                             uploader(i + 1);
                                                                         }
                                                                     })

                                                                 }
                                                             }
                                                             uploader(0);
                                                         } else {
                                                             res.json({
                                                                 success: false,
                                                                 message: "Please Select atleast One Role..."
                                                             });
                                                         }
                                                     })
                                                 })
                                             }

                                         });
                                     }
                                 }
                             })
                         } else {
                             res.json(NoAccessPermission);
                         }
                     });
                 } else {

                     //set Parameter
                     req.query['permission'] = "Added";

                     var obj = {};
                     obj.headers = req.headers;
                     obj.query = req.query;

                     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                         var AccessPermission = responseAccessPermission.success;
                         if (AccessPermission) {

                             User.findOne({
                                 where: {
                                     username: objUser.username
                                 },
                                 defaults: objUser
                             }).then(function(objUserExist) {
                                 if (objUserExist != null && objUser.id != objUserExist.id) {
                                     res.json({
                                         success: false,
                                         message: "User is already Exist...",
                                         data: objUserExist
                                     });
                                 } else {

                                     var UserPassword = customPassword();
                                     var EncryptUserpassword = jwt.encode(UserPassword, "bugz");

                                     if (objUser.phone && objUser.phone != '') {
                                         User.findOne({
                                             where: {
                                                 // email: objUserReg.email
                                                 $or: [{ email: objUser.email }, { phone: objUser.phone }]
                                             }
                                         }).then(function(chkEmailExist) {
                                             if (chkEmailExist != null) {
                                                 if (objUser.phone == chkEmailExist.phone) {
                                                     res.json({
                                                         success: false,
                                                         message: "Phone is already Exist...",
                                                         data: chkEmailExist

                                                     });
                                                 } else {
                                                     res.json({
                                                         success: false,
                                                         message: "Email is already Exist...",
                                                         data: chkEmailExist

                                                     });
                                                 }
                                             } else {
                                                 User.findOrCreate({
                                                     where: {
                                                         username: objUser.username,
                                                         password: EncryptUserpassword
                                                     },
                                                     defaults: objUser
                                                 }).then(function(responseObjUser) {
                                                     //
                                                     UserInRole.destroy({
                                                         where: {
                                                             userId: responseObjUser[0].id
                                                         }
                                                     }).then(function(response) {
                                                         if (objUser.roleId.length > 0) {
                                                             function uploader(i) {
                                                                 if (i < objUser.roleId.length) {
                                                                     var objUserInRole = {
                                                                         userId: responseObjUser[0].id,
                                                                         roleId: objUser.roleId[i].id
                                                                     }
                                                                     UserInRole.create(objUserInRole).then(function(response) {
                                                                         if (objUser.roleId.length == (i + 1)) {
                                                                             funAuditLog.CreateAuditLog('SaveUser', UserExist.username, 'Create User');
                                                                             res.json({
                                                                                 success: true,
                                                                                 message: "User created successfully...",
                                                                                 data: response
                                                                             });
                                                                         } else {
                                                                             uploader(i + 1);
                                                                         }
                                                                     })
                                                                 }
                                                             }
                                                             uploader(0);
                                                         } else {
                                                             res.json({
                                                                 success: false,
                                                                 message: "Please Select atleast One Role..."
                                                             });
                                                         }
                                                     })

                                                     //
                                                 })
                                             }
                                         });

                                     } else {
                                         User.findOne({
                                             where: {
                                                 // email: objUserReg.email
                                                 $or: [{ email: objUser.email }]
                                             }
                                         }).then(function(chkEmailExist) {
                                             if (chkEmailExist != null) {
                                                 // if (objUser.phone == chkEmailExist.phone) {
                                                 //     res.json({
                                                 //         success: false,
                                                 //         message: "Phone is already Exist...",
                                                 //         data: chkEmailExist

                                                 //     });
                                                 // } else {
                                                 res.json({
                                                     success: false,
                                                     message: "Email is already Exist...",
                                                     data: chkEmailExist

                                                 });
                                                 //}
                                             } else {
                                                 User.findOrCreate({
                                                     where: {
                                                         username: objUser.username,
                                                         password: EncryptUserpassword
                                                     },
                                                     defaults: objUser
                                                 }).then(function(responseObjUser) {
                                                     //
                                                     UserInRole.destroy({
                                                         where: {
                                                             userId: responseObjUser[0].id
                                                         }
                                                     }).then(function(response) {
                                                         if (objUser.roleId.length > 0) {
                                                             function uploader(i) {
                                                                 if (i < objUser.roleId.length) {
                                                                     var objUserInRole = {
                                                                         userId: responseObjUser[0].id,
                                                                         roleId: objUser.roleId[i].id
                                                                     }
                                                                     UserInRole.create(objUserInRole).then(function(response) {
                                                                         if (objUser.roleId.length == (i + 1)) {
                                                                             funAuditLog.CreateAuditLog('SaveUser', UserExist.username, 'Create User');
                                                                             res.json({
                                                                                 success: true,
                                                                                 message: "User created successfully...",
                                                                                 data: response
                                                                             });
                                                                         } else {
                                                                             uploader(i + 1);
                                                                         }
                                                                     })
                                                                 }
                                                             }
                                                             uploader(0);
                                                         } else {
                                                             res.json({
                                                                 success: false,
                                                                 message: "Please Select atleast One Role..."
                                                             });
                                                         }
                                                     })

                                                     //
                                                 })
                                             }
                                         });
                                     }
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

 router.post('/SaveMobileUser', jsonParser, function(req, res) {
     objUser = req.body;
     console.log(objUser)
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
                 if (objUser.id != 0) {
                     User.findOne({

                         where: {
                             username: objUser.username
                         },
                         defaults: objUser
                     }).then(function(objUserExist) {
                         if (objUserExist != null && objUser.id != objUserExist.id) {
                             res.json({
                                 success: false,
                                 message: "User is already Exist...",
                                 data: objUserExist
                             });
                         } else {
                             User.update(objUser, {
                                 where: {
                                     id: objUser.id
                                 }
                             }).then(function(responseUser) {
                                 funAuditLog.CreateAuditLog('SaveMobileUser', UserExist.username, 'Update User');
                                 res.json({
                                     success: true,
                                     message: "User updated successfully...",
                                     data: responseUser
                                 });
                             })
                         }
                     })

                 } else {
                     res.json({
                         success: false,
                         message: "User not updated...",
                         data: responseUser
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

 router.post('/SaveSupportUser', jsonParser, function(req, res) {
     objUser = req.body;
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
                 if (objUser.id != 0) {

                     //set Parameter
                     req.query['permission'] = "Modified";

                     var obj = {};
                     obj.headers = req.headers;
                     obj.query = req.query;

                     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                         var AccessPermission = responseAccessPermission.success;
                         if (AccessPermission) {

                             User.findOne({
                                 where: {
                                     username: objUser.username
                                 },
                                 defaults: objUser
                             }).then(function(objUserExist) {
                                 if (objUserExist != null && objUser.id != objUserExist.id) {
                                     res.json({
                                         success: false,
                                         message: "User is already Exist...",
                                         data: objUserExist
                                     });
                                 } else {
                                     User.findOne({
                                         where: {
                                             $or: [{ email: objUser.email }, { phone: objUser.phone }],
                                             $and: [{
                                                 id: { $ne: objUser.id }
                                             }]
                                         }
                                     }).then(function(chkEmailExist) {
                                         if (chkEmailExist != null) {
                                             if (objUser.phone == chkEmailExist.phone) {
                                                 res.json({
                                                     success: false,
                                                     message: "Phone is already Exist..."
                                                 });
                                             } else {
                                                 res.json({
                                                     success: false,
                                                     message: "Email is already Exist..."
                                                 });
                                             }
                                         } else {
                                             User.update(objUser, {
                                                 where: {
                                                     id: objUser.id
                                                 }
                                             }).then(function(responseUser) {
                                                 funAuditLog.CreateAuditLog('SaveSupportUser', UserExist.username, 'Create Support User');
                                                 res.json({
                                                     success: true,
                                                     message: "User updated successfully...",
                                                     data: responseUser
                                                 });
                                             })
                                         }
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
                         message: "You Can not Create User from this Page.",
                         data: objUserExist
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

 router.post('/SaveUserInRole', jsonParser, function(req, res) {
     objUser = req.body;
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

                 UserInRole.findOrCreate({
                     where: {
                         userId: objUser.userId
                     },
                     defaults: objUser
                 }).then(function(response) {
                     if ((response[1])) {
                         funAuditLog.CreateAuditLog('SaveUserInRole', UserExist.username, 'Create User In Role');
                         res.json({
                             success: true,
                             message: "Role assigned successfully...",
                             data: response
                         });
                     } else {
                         UserInRole.update(objUser, {
                             where: {
                                 userId: objUser.userId
                             }
                         }).then(function(response) {
                             if (response[0]) {
                                 funAuditLog.CreateAuditLog('SaveUserInRole', UserExist.username, 'Create User In Role');
                                 res.json({
                                     success: true,
                                     message: "Role assigned successfully...",
                                     data: response
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
 })

 router.post('/UpdateMobileUserOwnerSpeed', jsonParser, function(req, res) {
     objUser = req.body;
     objHeader = req.headers;
     var token = getToken(objHeader);
     if (token) {
         var decoded = jwt.decode(token, TokenKey);

         User.findOne({
             where: {
                 username: decoded.username,
                 OwnerPassword: decoded.password
             }
         }).then(function(UserExist) {
             if (UserExist != null) {
                 if (objUser.id != 0) {
                     User.findOne({
                         where: {
                             username: objUser.username
                         },
                         defaults: objUser
                     }).then(function(objUserExist) {

                         //Umang -- Start
                         if (objUserExist != null) {

                             if (objUserExist.MaxSpeed == null) {
                                 objUserExist.MaxSpeed = 0;
                             }
                             var Speed = objUserExist.MaxSpeed;
                             var Security = objUserExist.IsOwnerSecurity;


                             var search = {};

                             search['$and'] = [];

                             var obj = new Object();
                             obj['iduser'] = {
                                 $eq: objUserExist.id
                             };
                             search['$and'].push(obj);

                             var obj = new Object();
                             obj['IsOnline'] = {
                                 $eq: true
                             };
                             search['$and'].push(obj);

                             var obj = new Object();
                             obj['IsDeleted'] = {
                                 $eq: false
                             };
                             search['$and'].push(obj);

                             var obj = new Object();
                             obj['deviceid'] = {
                                 $ne: ''
                             };
                             search['$and'].push(obj);

                             var obj = new Object();
                             obj['DeviceType'] = {
                                 $ne: 'M2'
                             };
                             search['$and'].push(obj);

                             Bike.findAll({
                                 where: search,
                             }).then(function(UserRes) {
                                 if (UserRes.length > 0) {
                                     var client = new net.Socket();
                                     var SecurityFlag = '0';
                                     var timerHander = 0;
                                     var timerHanderSecurity = 0;

                                     if (Speed != objUser.MaxSpeed) {
                                         var MaxSpeed = ("00" + objUser.MaxSpeed).slice(-3);

                                         function SetMaxSpeedCommand(i) {
                                             if (i < UserRes.length) {
                                                 var Sendflag = false;
                                                 var DeviceId = UserRes[i].deviceid;
                                                 var Data = "(" + DeviceId + "DP12H" + MaxSpeed + "L000)";

                                                 client.connect(SocketPort, SocketIPAddress, function() {
                                                     console.log(Data);
                                                     client.write(Data);
                                                     client.setTimeout(180000, function() {
                                                         if (Sendflag == false) {
                                                             Sendflag = true;
                                                             // res.json({ success: false, message: 'Network searching, please try again' });
                                                             client.destroy();
                                                             SetMaxSpeedCommand(i + 1);
                                                         };

                                                     });
                                                 });

                                                 client.on('data', function(data) {
                                                     var line = data.toString();
                                                     //console.log(line);
                                                     if (Sendflag == false) {
                                                         if (line.indexOf('BP12') > 0) {
                                                             console.log('Received: ' + line);

                                                             var deviceID = line.substring(1, 13);
                                                             var SpeedDetail = line.substring(17, 25);

                                                             Sendflag = true;
                                                             // res.json({ success: true, data: objNavigation });
                                                             // res.json(objNavigation);

                                                             client.destroy();
                                                             //clearTimeout(timerHander);
                                                             timerHander = 0;
                                                             SetMaxSpeedCommand(i + 1); // kill client after server's response
                                                         } else {
                                                             Sendflag = true;
                                                             // res.json({ success: false, message: 'Network searching, please try again' });

                                                             client.destroy();
                                                             //clearTimeout(timerHander);
                                                             timerHander = 0;
                                                             SetMaxSpeedCommand(i + 1);
                                                         }

                                                     }
                                                 });

                                                 client.on('close', function() {
                                                     console.log('Connection closed');
                                                 });
                                             }
                                             // else {
                                             //     if (Security != objUser.IsSecurity) {
                                             //         var Sendflag = false;

                                             //         if (objUser.IsSecurity) {
                                             //             SecurityFlag = '1';
                                             //         }
                                             //         SetSecurityCommand(0);
                                             //     }
                                             // }
                                         }
                                         SetMaxSpeedCommand(0);
                                     }
                                     // else {
                                     //     if (objUser.IsOwnerSecurity != Security) {
                                     //         var Sendflag = false;

                                     //         if (objUser.IsOwnerSecurity) {
                                     //             SecurityFlag = '1';
                                     //         }
                                     //         SetSecurityCommand(0);
                                     //     };
                                     // }


                                     // function SetSecurityCommand(j) {
                                     //     if (j < UserRes.length) {
                                     //         var Sendflag = false;
                                     //         var DeviceId = UserRes[j].deviceid;
                                     //         var Data = "(" + DeviceId + "DV03" + SecurityFlag + ")";

                                     //         client.connect(SocketPort, SocketIPAddress, function() {
                                     //             console.log(Data);
                                     //             client.write(Data);
                                     //             client.setTimeout(180000, function() {
                                     //                 if (Sendflag == false) {
                                     //                     Sendflag = true;
                                     //                     // res.json({ success: false, message: 'Network searching, please try again' });
                                     //                     client.destroy();
                                     //                     GetSecurityCommand(j + 1);
                                     //                 };

                                     //             });
                                     //         });

                                     //         client.on('data', function(data) {
                                     //             var line = data.toString();
                                     //             //console.log(line);
                                     //             if (Sendflag == false) {
                                     //                 if (line.indexOf('BV03') > 0) {
                                     //                     console.log('Received: ' + line);

                                     //                     var deviceID = line.substring(1, 13);
                                     //                     var SecurityFlag = line.substring(17, 18);

                                     //                     Sendflag = true;
                                     //                     // res.json({ success: true, data: objNavigation });
                                     //                     // res.json(objNavigation);
                                     //                     client.destroy();
                                     //                     //clearTimeout(timerHanderSecurity);
                                     //                     timerHanderSecurity = 0;
                                     //                     SetSecurityCommand(j + 1); // kill client after server's response
                                     //                 } else {
                                     //                     Sendflag = true;
                                     //                     // res.json({ success: false, message: 'Network searching, please try again' });

                                     //                     client.destroy();
                                     //                     //clearTimeout(timerHanderSecurity);
                                     //                     timerHanderSecurity = 0;
                                     //                     SetSecurityCommand(j + 1);
                                     //                 }
                                     //             }
                                     //         });

                                     //         client.on('close', function() {
                                     //             console.log('Connection closed');
                                     //         });
                                     //     }
                                     // }

                                 }
                             });

                             //Umang -- End


                             objUserExist.updateAttributes({ MaxSpeed: objUser.MaxSpeed }).then(function(responseUser) {
                                 connection.query("update tblbike set MaxSpeed = '" + objUser.MaxSpeed + "' where iduser = '" + objUserExist.id + "' and IsDeleted=false and DeviceType!='M2';", function(err, rows, fields) {
                                     funAuditLog.CreateAuditLog('UpdateMobileUserOwnerSpeed', UserExist.username, 'Update Maximum Speed');
                                     res.json({
                                         success: true,
                                         message: "Maximum Speed updated successfully...",
                                         data: responseUser
                                     });
                                 });
                             })
                         }
                     })
                 } else {
                     res.json({
                         success: false,
                         message: "Maximum Speed not updated...",
                         data: responseUser
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

 router.post('/UpdateBikeDeviceMaxSpeed', jsonParser, function(req, res) {
     objUser = req.body;
     objHeader = req.headers;
     var token = getToken(objHeader);
     if (token) {
         var decoded = jwt.decode(token, TokenKey);

         User.findOne({
             where: {
                 username: decoded.username,
                 OwnerPassword: decoded.password
             }
         }).then(function(UserExist) {
             if (UserExist != null) {
                 if (objUser.id != 0) {
                     Bike.findOne({
                         where: {
                             id: objUser.bikeId,
                             // IsOnline: true,
                             IsDeleted: false,
                             DeviceType: {
                                 $ne: 'M2'
                             },
                         },
                         defaults: objUser
                     }).then(function(objUserExist) {
                         console.log("objUserExist", objUserExist)
                         if (objUserExist != null) {

                             if (objUserExist.MaxSpeed == null) {
                                 objUserExist.MaxSpeed = 0;
                             }
                             var Speed = objUserExist.MaxSpeed;
                             var Security = objUserExist.IsOwnerSecurity;


                             var client = new net.Socket();
                             var SecurityFlag = '0';
                             var timerHander = 0;
                             var timerHanderSecurity = 0;

                             if (Speed != objUser.MaxSpeed) {
                                 var MaxSpeed = ("00" + objUser.MaxSpeed).slice(-3);

                                 var Sendflag = false;
                                 var DeviceId = objUserExist.deviceid;
                                 var Data = "(" + DeviceId + "DP12H" + MaxSpeed + "L000)";

                                 client.connect(SocketPort, SocketIPAddress, function() {
                                     console.log(Data);
                                     client.write(Data);
                                     client.setTimeout(120000, function() {
                                         if (Sendflag == false) {
                                             Sendflag = true;
                                             client.destroy();
                                             res.json({
                                                 success: false,
                                                 message: "Device not Connected.Try again after 5 Minute",
                                                 data: objUserExist
                                             });
                                         };

                                     });
                                 });

                                 client.on('data', function(data) {
                                     var line = data.toString();
                                     if (Sendflag == false) {
                                         if (line.indexOf('BP12') > 0) {
                                             console.log('Received: ' + line);

                                             var deviceID = line.substring(1, 13);
                                             var SpeedDetail = line.substring(17, 25);

                                             Sendflag = true;

                                             client.destroy();
                                             timerHander = 0;

                                             objUserExist.updateAttributes({ MaxSpeed: objUser.MaxSpeed }).then(function(responseUser) {
                                                 funAuditLog.CreateAuditLog('UpdateBikeDeviceMaxSpeed', UserExist.username, deviceID + 'Update Maximum Speed');
                                                 res.json({
                                                     success: true,
                                                     message: "Maximum Speed updated successfully...",
                                                     data: responseUser
                                                 });
                                             })
                                         } else {
                                             Sendflag = true;

                                             client.destroy();
                                             timerHander = 0;
                                             res.json({
                                                 success: false,
                                                 message: "Maximum Speed  Not updated.Try again Later",
                                                 data: objUserExist
                                             });
                                         }

                                     }
                                 });

                                 client.on('close', function() {
                                     console.log('Connection closed');
                                 });
                             } else {
                                 res.json({
                                     success: false,
                                     message: "Maximum Speed Same as Before. Try with different Speed",
                                     data: objUserExist
                                 });
                             }


                         } else {
                             res.json({
                                 success: false,
                                 message: "Maximum Speed not updated...",
                                 data: null
                             });
                         }
                     })
                 } else {
                     res.json({
                         success: false,
                         message: "Maximum Speed not updated...",
                         data: UserExist
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


 //  router.post('/UpdateBikeDeviceMaxSpeed', jsonParser, function (req, res) {
 //     objUser = req.body;
 //     objHeader = req.headers;
 //     var token = getToken(objHeader);
 //     if (token) {
 //         var decoded = jwt.decode(token, TokenKey);

 //         User.findOne({
 //             where: {
 //                 username: decoded.username,
 //                 OwnerPassword: decoded.password
 //             }
 //         }).then(function (UserExist) {
 //             if (UserExist != null) {
 //                 if (objUser.id != 0) {
 //                     Bike.findOne({
 //                         where: {
 //                             id: objUser.bikeId,
 //                             IsOnline: true,
 //                             IsDeleted: false,
 //                             DeviceType: 'M2-U'
 //                         },
 //                         defaults: objUser
 //                     }).then(function (objUserExist) {
 //                         if (objUserExist != null) {

 //                             if (objUserExist.MaxSpeed == null) {
 //                                 objUserExist.MaxSpeed = 0;
 //                             }
 //                             var Speed = objUserExist.MaxSpeed;
 //                             var Security = objUserExist.IsOwnerSecurity;


 //                             var client = new net.Socket();
 //                             var SecurityFlag = '0';
 //                             var timerHander = 0;
 //                             var timerHanderSecurity = 0;

 //                             if (Speed != objUser.MaxSpeed) {
 //                                 var MaxSpeed = ("00" + objUser.MaxSpeed).slice(-3);

 //                                 var Sendflag = false;
 //                                 var DeviceId = objUserExist.deviceid;
 //                                 var Data = "(" + DeviceId + "DP12H" + MaxSpeed + "L000)";

 //                                 client.connect(SocketPort, SocketIPAddress, function () {
 //                                     console.log(Data);
 //                                     client.write(Data);
 //                                     client.setTimeout(180000, function () {
 //                                         if (Sendflag == false) {
 //                                             Sendflag = true;
 //                                             client.destroy();
 //                                         };

 //                                     });
 //                                 });

 //                                 client.on('data', function (data) {
 //                                     var line = data.toString();
 //                                     if (Sendflag == false) {
 //                                         if (line.indexOf('BP12') > 0) {
 //                                             console.log('Received: ' + line);

 //                                             var deviceID = line.substring(1, 13);
 //                                             var SpeedDetail = line.substring(17, 25);

 //                                             Sendflag = true;

 //                                             client.destroy();
 //                                             timerHander = 0;
 //                                         } else {
 //                                             Sendflag = true;

 //                                             client.destroy();
 //                                             timerHander = 0;
 //                                         }

 //                                     }
 //                                 });

 //                                 client.on('close', function () {
 //                                     console.log('Connection closed');
 //                                 });
 //                             }

 //                             objUserExist.updateAttributes({ MaxSpeed: objUser.MaxSpeed }).then(function (responseUser) {
 //                                 funAuditLog.CreateAuditLog('UpdateBikeDeviceMaxSpeed', UserExist.username, 'Update Maximum Speed');
 //                                 res.json({
 //                                     success: true,
 //                                     message: "Maximum Speed updated successfully...",
 //                                     data: responseUser
 //                                 });
 //                             })
 //                         } else {
 //                             res.json({
 //                                 success: true,
 //                                 message: "Maximum Speed updated successfully...",
 //                                 data: objUserExist
 //                             });
 //                         }
 //                     })
 //                 } else {
 //                     res.json({
 //                         success: false,
 //                         message: "Maximum Speed not updated...",
 //                         data: UserExist
 //                     });
 //                 }
 //             } else {
 //                 res.json(InvalidToken);
 //             }
 //         })
 //     } else {
 //         res.json(InvalidToken);
 //     }
 // })

 router.post('/UpdateMobileUserOwner', jsonParser, function(req, res) {
     objUser = req.body;
     objHeader = req.headers;

     var token = getToken(objHeader);
     if (token) {
         var decoded = jwt.decode(token, TokenKey);

         User.findOne({
             where: {
                 username: decoded.username,
                 OwnerPassword: decoded.password
             }
         }).then(function(UserExist) {
             if (UserExist != null) {
                 if (objUser.id != 0) {
                     User.findOne({
                         where: {
                             username: objUser.username
                         },
                         defaults: objUser
                     }).then(function(objUserExist) {

                         if (objUserExist != null) {

                             if (objUserExist.MaxSpeed == null) {
                                 objUserExist.MaxSpeed = 0;
                             }
                             var Speed = objUserExist.MaxSpeed;
                             var Security = objUserExist.IsOwnerSecurity;


                             var search = {};

                             search['$and'] = [];

                             var obj = new Object();
                             obj['iduser'] = {
                                 $eq: objUserExist.id
                             };
                             search['$and'].push(obj);

                             var obj = new Object();
                             obj['IsOnline'] = {
                                 $eq: true
                             };
                             search['$and'].push(obj);

                             var obj = new Object();
                             obj['IsDeleted'] = {
                                 $eq: false
                             };
                             search['$and'].push(obj);

                             var obj = new Object();
                             obj['deviceid'] = {
                                 $ne: ''
                             };
                             search['$and'].push(obj);

                             var obj = new Object();
                             obj['DeviceType'] = {
                                 $ne: 'M2'
                             };
                             search['$and'].push(obj);

                             Bike.findAll({
                                 where: search,
                             }).then(function(UserRes) {
                                 if (UserRes.length > 0) {
                                     var client = new net.Socket();
                                     var SecurityFlag = '0';
                                     var timerHander = 0;
                                     var timerHanderSecurity = 0;

                                     // if (Speed != objUser.MaxSpeed) {
                                     //     var MaxSpeed = ("00" + objUser.MaxSpeed).slice(-3);

                                     //     function SetMaxSpeedCommand(i) {
                                     //         if (i < UserRes.length) {
                                     //             var Sendflag = false;
                                     //             var DeviceId = UserRes[i].deviceid;
                                     //             var Data = "(" + DeviceId + "DP12H" + MaxSpeed + "L000)";

                                     //             client.connect(SocketPort, SocketIPAddress, function() {
                                     //                 console.log(Data);
                                     //                 client.write(Data);
                                     //                 client.setTimeout(180000, function() {
                                     //                     if (Sendflag == false) {
                                     //                         Sendflag = true;
                                     //                         // res.json({ success: false, message: 'Network searching, please try again' });
                                     //                         client.destroy();
                                     //                         SetMaxSpeedCommand(i + 1);
                                     //                     };

                                     //                 });
                                     //             });

                                     //             client.on('data', function(data) {
                                     //                 var line = data.toString();
                                     //                 //console.log(line);
                                     //                 if (Sendflag == false) {
                                     //                     if (line.indexOf('BP12') > 0) {
                                     //                         console.log('Received: ' + line);

                                     //                         var deviceID = line.substring(1, 13);
                                     //                         var SpeedDetail = line.substring(17, 25);

                                     //                         Sendflag = true;
                                     //                         // res.json({ success: true, data: objNavigation });
                                     //                         // res.json(objNavigation);

                                     //                         client.destroy();
                                     //                         //clearTimeout(timerHander);
                                     //                         timerHander = 0;
                                     //                         SetMaxSpeedCommand(i + 1); // kill client after server's response
                                     //                     } else {
                                     //                         Sendflag = true;
                                     //                         // res.json({ success: false, message: 'Network searching, please try again' });

                                     //                         client.destroy();
                                     //                         //clearTimeout(timerHander);
                                     //                         timerHander = 0;
                                     //                         SetMaxSpeedCommand(i + 1);
                                     //                     }

                                     //                 }
                                     //             });

                                     //             client.on('close', function() {
                                     //                 console.log('Connection closed');
                                     //             });
                                     //         } else {
                                     //             if (Security != objUser.IsSecurity) {
                                     //                 var Sendflag = false;

                                     //                 if (objUser.IsSecurity) {
                                     //                     SecurityFlag = '1';
                                     //                 }
                                     //                 SetSecurityCommand(0);
                                     //             }
                                     //         }
                                     //     }
                                     //     SetMaxSpeedCommand(0);
                                     // } else {
                                     if (objUser.IsOwnerSecurity != Security) {
                                         var Sendflag = false;
                                         if (objUser.IsOwnerSecurity) {
                                             SecurityFlag = '1';
                                         }
                                         SetSecurityCommand(0);
                                     };
                                     //}
                                     function SetSecurityCommand(j) {
                                         if (j < UserRes.length) {
                                             var Sendflag = false;
                                             var DeviceId = UserRes[j].deviceid;
                                             var Data = "(" + DeviceId + "DV03" + SecurityFlag + ")";

                                             client.connect(SocketPort, SocketIPAddress, function() {
                                                 console.log(Data);
                                                 client.write(Data);
                                                 client.setTimeout(180000, function() {
                                                     if (Sendflag == false) {
                                                         Sendflag = true;
                                                         // res.json({ success: false, message: 'Network searching, please try again' });
                                                         client.destroy();
                                                         GetSecurityCommand(j + 1);
                                                     };

                                                 });
                                             });

                                             client.on('data', function(data) {
                                                 var line = data.toString();
                                                 //console.log(line);
                                                 if (Sendflag == false) {
                                                     if (line.indexOf('BV03') > 0) {
                                                         console.log('Received: ' + line);

                                                         var deviceID = line.substring(1, 13);
                                                         var SecurityFlag = line.substring(17, 18);

                                                         Sendflag = true;
                                                         // res.json({ success: true, data: objNavigation });
                                                         // res.json(objNavigation);
                                                         client.destroy();
                                                         //clearTimeout(timerHanderSecurity);
                                                         timerHanderSecurity = 0;
                                                         SetSecurityCommand(j + 1); // kill client after server's response
                                                     } else {
                                                         Sendflag = true;
                                                         // res.json({ success: false, message: 'Network searching, please try again' });

                                                         client.destroy();
                                                         //clearTimeout(timerHanderSecurity);
                                                         timerHanderSecurity = 0;
                                                         SetSecurityCommand(j + 1);
                                                     }
                                                 }
                                             });

                                             client.on('close', function() {
                                                 console.log('Connection closed');
                                             });
                                         }
                                     }
                                 }
                             });
                             //Umang -- End
                             objUserExist.updateAttributes({ OwnerName: objUser.OwnerName, email: objUser.email, OwnerPhone: objUser.OwnerPhone, IsOwnerSecurity: objUser.IsOwnerSecurity }).then(function(responseUser) {
                                 funAuditLog.CreateAuditLog('UpdateMobileUserOwner', UserExist.username, 'Update Owner User');
                                 res.json({
                                     success: true,
                                     message: "User updated successfully...",
                                     data: responseUser
                                 });
                             })
                         }
                     })
                 } else {
                     res.json({
                         success: false,
                         message: "User not updated...",
                         data: responseUser
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
 router.post('/UpdateMobileUser', jsonParser, function(req, res) {
     objUser = req.body;
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
                 if (objUser.id != 0) {
                     User.findOne({
                         where: {
                             username: objUser.username
                         },
                         defaults: objUser
                     }).then(function(objUserExist) {
                         if (objUserExist != null) {
                             objUserExist.updateAttributes({ ShopName: objUser.ShopName, PersonInCharge: objUser.PersonInCharge, phone: objUser.phone, IsSecurity: objUser.IsSecurity }).then(function(responseUser) {
                                 funAuditLog.CreateAuditLog('UpdateMobileUser', UserExist.username, 'Update User');
                                 res.json({
                                     success: true,
                                     message: "User updated successfully...",
                                     data: responseUser
                                 });
                             })
                         }
                     })

                 } else {
                     res.json({
                         success: false,
                         message: "User not updated...",
                         data: responseUser
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

 router.get('/DeleteUser', function(req, res) {
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
                 User.destroy({
                     where: {
                         id: req.query.idUser
                     }
                 }).then(function(response) {
                     if (response) {
                         funAuditLog.CreateAuditLog('DeleteUser', UserExist.username, 'Delete User');
                         res.json({
                             success: true,
                             message: "User deleted successfully...",
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


 // Generate Custome Password for Creating New User
 var maxLength = 10;
 var minLength = 8;
 var uppercaseMinCount = 2;
 var lowercaseMinCount = 2;
 var numberMinCount = 2;
 var specialMinCount = 1;
 var UPPERCASE_RE = /([A-Z])/g;
 var LOWERCASE_RE = /([a-z])/g;
 var NUMBER_RE = /([\d])/g;
 var SPECIAL_CHAR_RE = /([\?\-\^\$\#\@\!\%\&\*])/g;
 var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

 function isStrongEnough(password) {
     var uc = password.match(UPPERCASE_RE);
     var lc = password.match(LOWERCASE_RE);
     var n = password.match(NUMBER_RE);
     var sc = password.match(SPECIAL_CHAR_RE);
     var nr = password.match(NON_REPEATING_CHAR_RE);
     return password.length >= minLength &&
         !nr &&
         uc && uc.length >= uppercaseMinCount &&
         lc && lc.length >= lowercaseMinCount &&
         n && n.length >= numberMinCount &&
         sc && sc.length >= specialMinCount;
 }

 function customPassword() {
     var password = "";
     var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
     while (!isStrongEnough(password)) {
         password = generatePassword(randomLength, false, /[\w\d\?\-]/);
     }
     return password;
 }
 //End

 function GetUserNameFromDate() {
     var d = new Date();
     var curr_date = d.getDate();
     var curr_month = d.getMonth() + 1; //Months are zero based
     var curr_year = d.getFullYear();

     var seconds = d.getSeconds();
     var minutes = d.getMinutes();
     var hour = d.getHours();

     var milisec = d.getMilliseconds();

     return curr_year.toString() + curr_month.toString() + curr_date.toString() + hour.toString() + minutes.toString() + seconds.toString() + milisec.toString();


 }


 router.post('/uploadImage', function(req, res) {
     var form = new formidable.IncomingForm();

     form.uploadDir = __dirname + '/../MediaUploads/UserUpload';
     var FileName = [];
     var lstUser = [];




     //file upload path
     form.parse(req, function(err, fields, files) {

         // console.log(err)
         // console.log(fields)
         //console.log(files)
         //you can get fields here
     });
     form.on('fileBegin', function(name, file) {
         var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
         var NewName = GetUserNameFromDate();
         if (ext.indexOf('?') > -1) {
             ext = ext.substring(0, ext.indexOf('?'));
         };

         file.path = form.uploadDir + "/" + NewName + ext;
         FileName.push(NewName + ext);
         lstUser.push(name);

         //modify file path
     });
     form.on('end', function() {
         var i = 0;

         function uploader(i) {
             if (i < FileName.length) {
                 var UserId = parseInt(lstUser[i]);

                 User.findOne({ where: { id: UserId } }).then(function(response) {
                     if (response != null) {
                         if (req.query.UserType == 'Owner') {
                             if (response.OwnerImage != '' && response.OwnerImage != null) {
                                 var oldFile = __dirname + '/../MediaUploads/UserUpload/' + response.OwnerImage;
                                 fs.exists(oldFile, function(exists) {
                                     if (exists) {
                                         fs.unlink(oldFile);
                                     }
                                 });
                             };
                             response.updateAttributes({ OwnerImage: FileName[i] }).then(function(resUpdate) {
                                 if ((i + 1) == FileName.length) {
                                     res.json({ success: true, message: "Images Uploaded Successfully...", data: FileName[i] });
                                 } else {
                                     uploader(i + 1);
                                 };
                             })
                         } else {
                             if (response.image != '' && response.image != null) {
                                 var oldFile = __dirname + '/../MediaUploads/UserUpload/' + response.image;
                                 fs.exists(oldFile, function(exists) {
                                     if (exists) {
                                         fs.unlink(oldFile);
                                     }
                                 });
                             };
                             response.updateAttributes({ image: FileName[i] }).then(function(resUpdate) {
                                 if ((i + 1) == FileName.length) {
                                     res.json({ success: true, message: "Images Uploaded Successfully...", data: FileName[i] });
                                 } else {
                                     uploader(i + 1);
                                 };
                             })
                         }
                     }
                 })
             }
         }
         uploader(i);
         if (FileName.length == 0) {
             res.json({ success: false, message: "Please Select atleast One File..." });
         }
         // res.sendStatus(200);
         //when finish all process
     });
 });

 router.get('/GetAllDynamicOwnerCustomer', function(req, res) {
     var objParam = req.query;
     var objColumns = objParam.columns;
     var objOrder = objParam.order;
     var objSearch = objParam.search.value;

     var CountryList = objParam.CountryList;
     if (CountryList == undefined || CountryList == null || CountryList == "") {
         CountryList = [];
     }
     var UserRoles = objParam.UserRoles;
     var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
     var search = {};
     var search1 = {};
     var search2 = {};
     search1['$and'] = [];

     var IsUserSuperAdmin = false;
     var IsCountryAll = false;

     if (UserRoles.length > 0) {

         function CheckUserCountry(i) {
             if (i < UserRoles.length) {

                 if (UserRoles[i] == 'Super Admin') {
                     IsUserSuperAdmin = true;
                     CheckUserCountry(i + 1);
                 } else {
                     CheckUserCountry(i + 1);
                 }

             } else {
                 if (!IsUserSuperAdmin) {
                     search['$or'] = [];
                 } else {
                     search['$and'] = [];
                 }

                 search2['$or'] = [];
                 var obje = new Object();
                 obje['Type'] = 'Owner';
                 search2['$or'].push(obje);
                 var obje1 = new Object();
                 obje1['Type'] = 'Both';
                 search2['$or'].push(obje1);


                 if (objSearch != null && objSearch != '') {
                     search1['$or'] = [];

                     for (var i = 0; i < objColumns.length; i++) {
                         if (objColumns[i].data != null && objColumns[i].data != '') {
                             var columnName = objColumns[i].data;
                             if (columnName != 'CreatedDate') {
                                 if (columnName == 'MaxSpeed') {
                                     columnName = 'tbluserinformation.MaxSpeed';
                                 }
                                 search1['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                             }
                         };
                     };
                 }

                 search1['$and'].push(search2)

                 User.hasMany(Bike, {
                     foreignKey: {
                         name: 'iduser',
                         allowNull: false
                     }
                 });

                 User.findAndCountAll({
                     required: true,
                     where: search1,
                     order: Orderby,
                     offset: parseInt(objParam.start),
                     limit: parseInt(objParam.length),
                     include: [{
                         model: Bike,
                         attributes: [
                             [('DISTINCT', models.sequelize.col('iduser')), 'iduser']
                         ],
                         where: {
                             IsDeleted: 0,
                             DeviceType: {
                                 $ne: 'M2'
                             },
                             deviceid: {
                                 $ne: ''
                             }
                         },
                     }],
                 }).then(function(response) {
                     var response1 = new Object();
                     response1.draw = objParam.draw;
                     response1.recordsTotal = response.count;
                     response1.recordsFiltered = response.count;
                     response1.data = response.rows;
                     res.json(response1);
                 }).catch(function(error) {
                     res.json(error);
                 })
             }
         }
         CheckUserCountry(0)
     }
 })


 router.get('/GetAllDynamicShopperCustomer', function(req, res) {
     var objParam = req.query;
     var objColumns = objParam.columns;
     var objOrder = objParam.order;
     var objSearch = objParam.search.value;

     var CountryList = objParam.CountryList;
     if (CountryList == undefined || CountryList == null || CountryList == "") {
         CountryList = [];
     }
     var UserRoles = objParam.UserRoles;
     var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
     var search = {};
     var search1 = {};
     var search2 = {};
     search1['$and'] = [];

     var IsUserSuperAdmin = false;
     var IsCountryAll = false;

     if (UserRoles.length > 0) {

         function CheckUserCountry(i) {
             if (i < UserRoles.length) {

                 if (UserRoles[i] == 'Super Admin') {
                     IsUserSuperAdmin = true;
                     CheckUserCountry(i + 1);
                 } else {
                     CheckUserCountry(i + 1);
                 }

             } else {
                 if (!IsUserSuperAdmin) {
                     search['$or'] = [];
                 } else {
                     search['$and'] = [];
                 }

                 search2['$or'] = [];
                 var obje = new Object();
                 obje['Type'] = 'Shop';
                 search2['$or'].push(obje);
                 var obje1 = new Object();
                 obje1['Type'] = 'Both';
                 search2['$or'].push(obje1);

                 if (objSearch != null && objSearch != '') {
                     search1['$or'] = [];

                     for (var i = 0; i < objColumns.length; i++) {
                         if (objColumns[i].data != null && objColumns[i].data != '') {
                             var columnName = objColumns[i].data;
                             if (columnName != 'CreatedDate') {
                                 search1['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                             }
                         };
                     };
                 }

                 search1['$and'].push(search2)
                 User.hasMany(Bike, {
                     foreignKey: {
                         name: 'iduser',
                         allowNull: false
                     }
                 });

                 User.findAndCountAll({
                     required: true,
                     where: search1,
                     order: Orderby,
                     offset: parseInt(objParam.start),
                     limit: parseInt(objParam.length),
                     include: [{
                         model: Bike,
                         attributes: [
                             [('DISTINCT', models.sequelize.col('iduser')), 'iduser']
                         ],
                         where: {
                             IsDeleted: 0,
                             DeviceType: 'M2',
                             deviceid: {
                                 $ne: ''
                             }
                         },
                     }],
                 }).then(function(response) {
                     console.log(response)
                     var response1 = new Object();
                     response1.draw = objParam.draw;
                     response1.recordsTotal = response.count;
                     response1.recordsFiltered = response.count;
                     response1.data = response.rows;
                     res.json(response1);
                 }).catch(function(error) {
                     res.json(error);
                 })
             }
         }
         CheckUserCountry(0)
     }
 })


 module.exports = router