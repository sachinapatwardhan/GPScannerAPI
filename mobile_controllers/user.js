 //Tables
 var router = express.Router();
 var User = models.tbluserinformation;
 var UserInRole = models.tbluserinrole;
 var Role = models.tblrole;
 //End of Tables

 //------------------------(web &  mobile app): get user information  in user profile--------------
 router.get('/GetUserProfileNew', function(req, res) {
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
             id: req.query.UserId,
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

 //----------(web & mobile):- update user information--------------------
 router.post('/UpdateMobileUserOwnerNew', jsonParser, function(req, res) {
     objUser = req.body;
     objHeader = req.headers;

     var token = getToken(objHeader);
     if (token) {
         var decoded = jwt.decode(token, TokenKey);

         User.findOne({
             where: {
                 username: decoded.username,
                 password: decoded.password,
                 idApp: objUser.idApp,
             }
         }).then(function(UserExist) {
             if (UserExist != null) {
                 UserExist.updateAttributes({ ProfileName: objUser.ProfileName, email: objUser.email, phone: objUser.phone }).then(function(responseUser) {
                     funAuditLog.CreateAuditLog('UpdateMobileUserOwner', UserExist.username, 'Update User');
                     res.json({
                         success: true,
                         message: "User updated successfully...",
                         data: responseUser
                     });
                 })

             } else {
                 res.json(InvalidToken);
             }
         })
     } else {
         res.json(InvalidToken);
     }
 })

 //----------------(webapp):-upload user image
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
                         //  if (req.query.UserType == 'Owner') {
                         //      if (response.OwnerImage != '' && response.OwnerImage != null) {
                         //          var oldFile = __dirname + '/../MediaUploads/UserUpload/' + response.OwnerImage;
                         //          fs.exists(oldFile, function(exists) {
                         //              if (exists) {
                         //                  fs.unlink(oldFile);
                         //              }
                         //          });
                         //      };
                         //      response.updateAttributes({ OwnerImage: FileName[i] }).then(function(resUpdate) {
                         //          if ((i + 1) == FileName.length) {
                         //              res.json({ success: true, message: "Images Uploaded Successfully...", data: FileName[i] });
                         //          } else {
                         //              uploader(i + 1);
                         //          };
                         //      })
                         //  } else {
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
                             //  }
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
 module.exports = router