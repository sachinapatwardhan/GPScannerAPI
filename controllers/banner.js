 //Tables
 var router = express.Router();
 var Banner = models.tblbanner;
 var BannerMgmt = models.tblbannermgmt;
 var User = models.tbluserinformation;
 //End of Tables

 //Banner Master
 router.get('/GetAllBanner', function(req, res) {
     Banner.findAll().then(function(response) {
         res.json(response);
     }).catch(function(error) {
         res.json(error);
     })
 })


 router.get('/GetBannerById', function(req, res) {
     Banner.findOne({
         where: {
             id: req.query.idBanner
         }
     }).then(function(response) {
         if (response != null) {
             res.json({
                 success: true,
                 message: "Banner found...",
                 data: response
             });
         } else {
             res.json({
                 success: false,
                 message: "Banner not found...",
                 data: response
             });
         }
     })
 })

 router.post('/SaveBanner', jsonParser, function(req, res) {
     objBanner = req.body;
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
                 if (objBanner.id == 0) {
                     //set Parameter
                     req.query['permission'] = "Added";

                     var obj = {};
                     obj.headers = req.headers;
                     obj.query = req.query;
                     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                         var AccessPermission = responseAccessPermission.success;
                         if (AccessPermission) {
                             Banner.findOrCreate({
                                 where: {
                                     Name: objBanner.Name
                                 },
                                 defaults: objBanner
                             }).then(function(response) {
                                 if (response[1]) {
                                     funAuditLog.CreateAuditLog('SaveBanner', UserExist.username, 'Create Banner ('+ response[1].Name +')');
                                     res.json({
                                         success: true,
                                         message: "Banner created successfully...",
                                         data: response
                                     });
                                 } else {
                                     res.json({
                                         success: false,
                                         message: "Banner is already Exist...",
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
                             Banner.findOne({
                                 where: {
                                     Name: objBanner.Name
                                 },
                                 defaults: objBanner
                             }).then(function(objBannerExist) {
                                 if (objBannerExist != null && objBanner.id != objBannerExist.id) {
                                     res.json({
                                         success: false,
                                         message: "Banner is already Exist...",
                                         data: objBannerExist
                                     });
                                 } else {
                                     Banner.update(objBanner, {
                                         where: {
                                             id: objBanner.id
                                         }
                                     }).then(function(response) {
                                         if (response[0]) {
                                             funAuditLog.CreateAuditLog('UpdateBanner', UserExist.username, 'Update Banner ('+ objBannerExist.Name +')');
                                             res.json({
                                                 success: true,
                                                 message: "Banner updated successfully...",
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
 });

 router.get('/DeleteBanner', function(req, res) {
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
                         BannerMgmt.findOne({
                             where: {
                                 BannerId: req.query.idBanner
                             }
                         }).then(function(resBannerMgmt) {
                             if (resBannerMgmt == null) {
                                 Banner.destroy({
                                     where: {
                                         id: req.query.idBanner
                                     }
                                 }).then(function(response) {
                                     if (response) {
                                         funAuditLog.CreateAuditLog('DeleteBanner', UserExist.username, 'Delete Banner ID ('+ resBannerMgmt.BannerId +')');
                                         res.json({
                                             success: true,
                                             message: "Banner deleted successfully...",
                                             data: response
                                         });
                                     } else {
                                         res.json(RecordNotFound);
                                     }
                                 })
                             } else {
                                 res.json(NotDeleteReferenceData);
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
 //End of Banner Master

 //Banner MGMT
 router.get('/GetAllBannerMgmt', function(req, res) {
     BannerMgmt.findAll().then(function(response) {
         res.json(response);
     }).catch(function(error) {
         res.json(error);
     })
 })


 router.get('/GetBannerMgmtById', function(req, res) {
     BannerMgmt.findAll({
         where: {
             BannerId: req.query.idBanner
         }
     }).then(function(response) {
         if (response.length > 0) {
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

 router.post('/SaveBannerMgmt', jsonParser, function(req, res) {

     objBannerMgmt = req.body;

     //Set Parameter for User Permission
     req.query['tablename'] = req.headers['x-requested-with'];
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
                 if (objBannerMgmt.id == 0) {

                     //set Parameter
                     req.query['permission'] = "Added";

                     var obj = {};
                     obj.headers = req.headers;
                     obj.query = req.query;

                     funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                         var AccessPermission = responseAccessPermission.success;
                         if (AccessPermission) {

                             BannerMgmt.findOrCreate({
                                 where: {
                                     BannerId: objBannerMgmt.BannerId,
                                     ImageUrl: objBannerMgmt.ImageUrl
                                 },
                                 defaults: objBannerMgmt
                             }).then(function(response) {
                                 if ((response[1])) {
                                     funAuditLog.CreateAuditLog('SaveBannerMgmt', UserExist.username, 'Create Banner Management BId : ('+ response[1].id +')');
                                     res.json({
                                         success: true,
                                         message: "BannerMgmt created successfully...",
                                         data: response
                                     });
                                 } else {
                                     res.json({
                                         success: false,
                                         message: "BannerMgmt is already Exist...",
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
                             BannerMgmt.findOne({
                                 where: {
                                     BannerId: objBannerMgmt.BannerId,
                                     ImageUrl: objBannerMgmt.ImageUrl
                                 }
                             }).then(function(responseBannerMgmt) {
                                 if (responseBannerMgmt != null && objBannerMgmt.id != responseBannerMgmt.id) {
                                     res.json({
                                         success: false,
                                         message: "BannerMgmt is already Exist...",
                                         data: responseBannerMgmt
                                     });
                                 } else {
                                     BannerMgmt.update(objBannerMgmt, {
                                         where: {
                                             id: objBannerMgmt.id
                                         }
                                     }).then(function(response) {
                                         if (response[0]) {
                                             funAuditLog.CreateAuditLog('UpdateBannerMgmt', UserExist.username, 'Update Banner Management  BId : ('+ responseBannerMgmt.id +')');
                                             res.json({
                                                 success: true,
                                                 message: "BannerMgmt updated successfully...",
                                                 data: response
                                             });
                                         } else {
                                             res.json({
                                                 success: false,
                                                 message: "BannerMgmt not Found...",
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
 });


 router.get('/DeleteBannerMgmt', function(req, res) {
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
                         BannerMgmt.destroy({
                             where: {
                                 id: req.query.idBanner
                             }
                         }).then(function(response) {
                             if (response) {
                                 funAuditLog.CreateAuditLog('DeleteBannerMgmt', UserExist.username, 'Delete Banner Management ');
                                 res.json({
                                     success: true,
                                     message: "BannerMgmt deleted successfully...",
                                     data: response
                                 });
                             } else {
                                 res.json(RecordNotFound);
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

 router.get('/GetAllBannerMgmtByBannerName', function(req, res) {
     BannerMgmt.belongsTo(Banner, {
         foreignKey: {
             name: 'BannerId',
             allowNull: false
         }
     });
     BannerMgmt.findAll({
         include: [{
             model: Banner,
             where: { Name: req.query.BannerName }
         }]
     }).then(function(response) {
         res.json(response);
     }).catch(function(error) {
         res.json(error);
     })
 })

 //End of Banner MGMT

 module.exports = router