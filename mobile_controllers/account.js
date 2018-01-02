//Tables
var router = express.Router();
var User = models.tbluserinformation;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var Country = models.tblcountrymgmt;
var State = models.tblcountrystatemgmt;
var SystemEmail = models.tblemailsettingsys;
var EmailTemplate = models.tblemailtemplate;
var PushNotification = models.tblpushnotification;
var Setting = models.tblsetting;
var SharedEmailTbl = models.tblsharedemail;
var ShareDevice = models.tblsharedevice;
var Vehicle = models.tblvehicle;
//End of Tables

//----------------------web app(Setting forgotpass)------------------------------------
router.post('/changeUserPassword', jsonParser, function(req, res) {
    objUser = req.body;

    //Set Parameter for User Permission
    // req.query['tablename'] = req.headers['x-requested-with'];
    var EncryptOldpassword = jwt.encode(objUser.password, "bugz");
    var EncryptNewpassword = jwt.encode(objUser.NewPassword, "bugz");

    if (objUser.NewPassword.length < 2) {
        res.json({
            success: false,
            message: "New Password contains atleast 2 characters..."
        });
    } else {
        User.findOne({
            where: {
                username: objUser.username
            }
        }).then(function(chkUserExist) {
            if (chkUserExist != null) {

                //set Parameter
                // req.query['permission'] = "Modified";

                // var obj = {};
                // obj.headers = req.headers;
                // obj.query = req.query;

                // funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                //     var AccessPermission = responseAccessPermission.success;
                //     if (AccessPermission) {

                if (objUser.Type == 'Owner') {
                    var Password = chkUserExist.password;
                    var search = { password: EncryptNewpassword };
                } else {
                    var Password = chkUserExist.password;
                    var search = { password: EncryptNewpassword };
                }
                if (EncryptOldpassword == Password) {
                    chkUserExist.updateAttributes(search).then(function(response) {
                        funAuditLog.CreateAuditLog('changepassword', chkUserExist.username, 'Change User Password');
                        res.json({
                            success: true,
                            message: "Password changed successfully..."
                        });
                    }).catch(function(error) {
                        res.json({
                            success: false,
                            message: error.errors[0].message + "..."
                        });
                    })
                } else {
                    res.json({
                        success: false,
                        message: "Old Password is wrong..."
                    });
                }
                //     } else {
                //         res.json(NoAccessPermission);
                //     }
                // });
            } else {
                res.json({
                    success: false,
                    message: "User is not Exist..."
                });
            }
        })
    }
});

//-------------------MobileApp(Logout)------------------------------------------------
router.get('/MobileApplogout', jsonParser, function(req, res) {
    if (req.query.UserType != null && req.query.UserType != undefined && req.query.UserType != '') {
        PushNotification.findOne({
            where: {
                udid: req.query.udid,
                UserType: req.query.UserType,
            }
        }).then(function(response) {
            if (response != null) {
                var objPushnotification = response;
                objPushnotification.updateAttributes({ iduser: 0 }).then(function(resUpdate) {
                    res.json({
                        success: true,
                        message: "Logout Successfully."
                    });
                });
            } else {
                res.json({
                    success: true,
                    message: "Logout Successfully."
                });
            }
        })
    } else {
        PushNotification.findOne({
            where: {
                udid: req.query.udid,
            }
        }).then(function(response) {
            if (response != null) {
                var objPushnotification = response;
                objPushnotification.updateAttributes({ iduser: 0 }).then(function(resUpdate) {
                    res.json({
                        success: true,
                        message: "Logout Successfully."
                    });
                });
            } else {
                res.json({
                    success: true,
                    message: "Logout Successfully."
                });
            }
        })
    }
})

//-----------------MobileApp(storeDeviceToken)------------------------------------------
router.get('/SetLastLogin', jsonParser, function(req, res) {
    User.findOne({ where: { id: req.query.useId } }).then(function(userExits) {
        if (userExits) {
            var LastLogin = new Date();
            userExits.updateAttributes({ LastLogin: LastLogin }).then(function(userupdate) {
                res.json(userupdate)

            })
        } else {
            res.json({
                success: false,
                message: 'User not found.'
            })
        }
    })
})

//--------------------(MobileApp & WebApp):-(Login,signup,demo)-------------------------------------------
router.get('/MobileAppLoginNew', jsonParser, function(req, res) {
    var Encryptpassword = jwt.encode(req.query.password, "bugz");
    User.findOne({
        where: {
            $or: {
                username: req.query.username,
                email: req.query.username,
                phone: req.query.username,
            },
            password: Encryptpassword,
            idApp: req.query.idApp,
        }
    }).then(function(response) {
        if (response != null) {
            UserInRole.belongsTo(Role, {
                foreignKey: {
                    name: 'roleId',
                    allowNull: false
                }
            });
            var LastLogin = new Date();
            response.updateAttributes({ LastLogin: LastLogin }).then(function(UpdateLastLogin) {})
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
                    password: Encryptpassword,
                    Role: lstRole
                }
                var token = jwt.encode(user, "bugz");
                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    UserId: response.id,
                    UserName: response.username,
                    Email: response.email,
                    message: "Login Successfully..."
                });
            })
        } else {
            res.json({
                success: false,
                message: "Invalid Username or Password..."
            });
        }
    })
})

//--------------------Start (MobileApp & WebApp):-(signup)-------------------------------------------
router.post('/CheckMobileUserExistNew', jsonParser, function(req, res) {
    objUserReg = req.body
    if (!validator.isEmail(objUserReg.email)) {
        res.json({
            success: false,
            message: "Invalid Email..."
        });
    } else {
        User.findOne({
            where: {
                $or: [{ email: objUserReg.email }, { username: objUserReg.username }],
                idApp: objUserReg.idApp,
            }
        }).then(function(chkEmailExist) {
            if (chkEmailExist != null) {
                res.json({
                    success: false,
                    message: "Username is already Exist..."
                });
            } else {
                res.json({
                    success: true,
                    message: "user is not Exist..."
                });
            }
        })
    }
});

router.post('/MobileRegisterNew', jsonParser, function(req, res) {
    objUserReg = req.body
    objUserReg.password = jwt.encode(objUserReg.password, "bugz");
    User.create(objUserReg).then(function(resUserReg) {
        Role.findOne({
            where: {
                RoleName: "User"
            }
        }).then(function(objRole) {
            if (objRole != null) {
                var objUserInRole = {
                    userId: resUserReg.id,
                    roleId: objRole.id,
                }
                UserInRole.create(objUserInRole).then(function(resUserInRole) {
                    funAuditLog.CreateAuditLog('register', resUserReg.username, 'Create New User');

                    //Send OTP
                    // var objOTP = new Object();
                    // objOTP.To = objUserReg.phone;
                    // objOTP.body = 'Your Verification Code for logging into is ' + objUserReg.OTP + '. Kindly do not share it with anyone else.';
                    // global.sendSMS(objOTP, function(responseOTP) {
                    //     console.log(responseOTP)
                    // });
                    var objshare = { email: resUserReg.email, id: resUserReg.id, username: resUserReg.username };
                    AddNewShareDevice(objshare, function(response1) {
                        res.json({
                            success: true,
                            message: "User Registered Successfully...",
                            data: resUserReg
                        });
                    })

                })
            } else {
                var objRole = {
                    RoleName: "User",
                    Description: null
                }
                Role.create(objRole).then(function(resRole) {

                    var objUserInRole = {
                        userId: resUserReg.id,
                        roleId: resRole.id,
                    }
                    UserInRole.create(objUserInRole).then(function(resUserInRole) {
                        funAuditLog.CreateAuditLog('register', resUserReg.username, 'Create New User');

                        //Send OTP
                        // var objOTP = new Object();
                        // objOTP.To = objUserReg.phone;
                        // objOTP.body = 'Your Verification Code for logging into is ' + objUserReg.OTP + '. Kindly do not share it with anyone else.';
                        // global.sendSMS(objOTP, function(responseOTP) {
                        //     console.log(responseOTP)
                        // });
                        var objshare = { email: resUserReg.email, id: resUserReg.id, username: resUserReg.username };
                        AddNewShareDevice(objshare, function(response1) {
                            console.log("@@@@")
                            res.json({
                                success: true,
                                message: "User Registered Successfully...",
                                data: resUserReg
                            });
                        })



                        // res.json({
                        //     success: true,
                        //     message: "User Registered Successfully..."
                        // });
                    })
                })
            }
        })
    }).catch(function(error) {
        res.json({
            success: false,
            message: "User Registration Failed..."
        });
    })
});

function AddNewShareDevice(objparam, callback) {
    SharedEmailTbl.findAll({
        where: {
            SharedEmail: objparam.email,
            Status: 'Pending'
        }
    }).then(function(SharedEmailExit) {
        if (SharedEmailExit.length > 0) {
            function uploader(i) {
                if (SharedEmailExit.length > i) {
                    Vehicle.findOne({ where: { deviceid: SharedEmailExit[i].DeviceId } }).then(function(vehicleExit) {
                        if (vehicleExit) {
                            User.findOne({ where: { id: SharedEmailExit[i].idUser } }).then(function(userExit) {
                                if (userExit) {
                                    var obj = new Object();
                                    obj.DeviceId = SharedEmailExit[i].DeviceId;
                                    obj.idUser = objparam.id;
                                    obj.idSharedUser = SharedEmailExit[i].idUser;
                                    obj.idVehicle = vehicleExit.id;
                                    obj.IsActive = 1;
                                    obj.IsSharedUserNotification = 1;
                                    obj.IsNotification = 1;
                                    obj.CreatedDate = new Date();
                                    obj.CreatedBy = userExit.username;

                                    ShareDevice.create(obj).then(function(ShareDeviceCreated) {

                                        if (ShareDeviceCreated) {
                                            SharedEmailExit[i].updateAttributes({ Status: 'Complete', ModifiedDate: new Date(), ModifiedBy: objparam.username }).then(function(SharedEmailupdate) {
                                                funAuditLog.CreateAuditLog('update SharedEmailExit', objparam.username, 'Update SharedEmailExit');
                                                uploader(i + 1);

                                            })


                                        } else {
                                            callback({
                                                success: false,
                                                message: "Share vehicle not added successfully..."
                                            });
                                        }
                                    })
                                } else {
                                    callback({
                                        success: false,
                                        message: "shared User not exits..."
                                    });
                                }
                            })

                        } else {
                            callback({
                                success: false,
                                message: "shared Vehicle not exits..."
                            });
                        }
                    })
                } else {
                    callback({
                        success: true,
                        message: "Share vehicle added successfully..."
                    });
                }
            }
            uploader(0);
        } else {
            callback({
                success: false,
                message: "Shared Device not found..."
            });
        }
    })
}

//--------------------END (MobileApp & WebApp):-(signup)-------------------------------------------

//--------------------(MobileApp & WebApp):-(forgot password)-------------------------------------------
router.get('/MobileForgotPasswordNew', function(req, res) {
    User.findOne({ where: { email: req.query.email, idApp: req.query.idApp, } }).then(function(objUser) {
        if (objUser != null) {
            SystemEmail.findOne().then(function(objSystemEmail) {
                var NewPassword = customPassword();
                console.log(NewPassword);
                var EncryptNewpassword = jwt.encode(NewPassword, "bugz");
                var search = { password: EncryptNewpassword };
                objUser.updateAttributes(search).then(function(response) {
                    if (response != null) {
                        EmailTemplate.findOne({
                            where: {
                                Type: "Forgot Password Email",
                            }
                        }).then(function(objEmailTemplate) {
                            if (objEmailTemplate != null) {
                                var Name = objUser.username;
                                var Password = NewPassword;
                                Setting.findOne({
                                    where: {
                                        Name: 'NotificationEmailTo'
                                    }
                                }).then(function(objSetting) {
                                    var body = objEmailTemplate.EmailBody.replace(/{UserName}/g, Name).replace("{Password}", Password).replace("{AppName}", req.query.AppName);
                                    var mail = {
                                        from: objSystemEmail.DefaultEmailFrom,
                                        to: objUser.email, // + ', ' + objSystemEmail.NotificationEmailTo,
                                        bcc: objSetting.Value,
                                        subject: req.query.AppName + " " + objEmailTemplate.EmailSubject,
                                        html: body
                                    };
                                    transporter.sendMail(mail, function(error, response) {
                                        if (error) {
                                            res.json({
                                                success: false,
                                                message: "Error in Sending Email " + error,
                                                data: error
                                            });
                                        } else {
                                            funAuditLog.CreateAuditLog('forgotpassword', objUser.username, 'forgot User Password');
                                            res.json({
                                                success: true,
                                                message: "Password sent to your email successfully...",
                                                data: response
                                            });
                                        }
                                    });
                                });
                            } else {
                                res.json({
                                    success: false,
                                    message: "This Email template not found..."
                                })
                            }
                        });
                    } else {
                        res.json({
                            success: false,
                            message: "This system Email not found..."
                        });
                    }
                }).catch(function(error) {
                    res.json({
                        success: false,
                        message: error.errors[0].message + "..."
                    });
                })

            })
        } else {
            res.json({
                success: false,
                message: "This Email not registered with us..."
            });
        }
    })
});

//--------------------(MobileApp & WebApp):-(Change password)-------------------------------------------
router.post('/changeMobileUserPasswordNew', jsonParser, function(req, res) {
    objUser = req.body;
    var EncryptOldpassword = jwt.encode(objUser.password, "bugz");
    var EncryptNewpassword = jwt.encode(objUser.NewPassword, "bugz");

    if (objUser.NewPassword.length < 2) {
        res.json({
            success: false,
            message: "New Password contains atleast 2 characters..."
        });
    } else {
        User.findOne({
            where: {
                id: objUser.UserId,
            }
        }).then(function(chkUserExist) {
            if (chkUserExist != null) {
                var Password = chkUserExist.password;
                var search = { password: EncryptNewpassword };
                if (EncryptOldpassword == Password) {
                    chkUserExist.updateAttributes(search).then(function(response) {
                        funAuditLog.CreateAuditLog('changepassword', chkUserExist.username, 'Change User Password');
                        res.json({
                            success: true,
                            message: "Password changed successfully..."
                        });
                    }).catch(function(error) {
                        res.json({
                            success: false,
                            message: error.errors[0].message + "..."
                        });
                    })
                } else {
                    res.json({
                        success: false,
                        message: "Old Password is wrong..."
                    });
                }
            } else {
                res.json({
                    success: false,
                    message: "User is not Exist..."
                });
            }
        })
    }
});

//-------------------MobileApp :-(setRelaySettings)-------------------------
router.get('/CheckUserPassword', jsonParser, function(req, res) {
    var Encryptpassword = jwt.encode(req.query.password, "bugz");
    User.findOne({
        where: {
            username: req.query.username,
            password: Encryptpassword,
            idApp: req.query.idApp,
        }
    }).then(function(response) {
        if (response != null) {
            res.json({
                success: true,
                message: "Valid Password..."
            });
        } else {
            res.json({
                success: false,
                message: "Invalid Password..."
            });
        }
    })
})

//End Of New Mobile App wise

//Private functions
var maxLength = 6;
var minLength = 6;
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
    // var sc = password.match(SPECIAL_CHAR_RE);
    var nr = password.match(NON_REPEATING_CHAR_RE);
    return password.length >= minLength &&
        !nr &&
        uc && uc.length >= uppercaseMinCount &&
        lc && lc.length >= lowercaseMinCount &&
        n && n.length >= numberMinCount;
    // &&
    // sc && sc.length >= specialMinCount;
}

function customPassword() {
    var password = "";
    var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
    while (!isStrongEnough(password)) {
        password = generatePassword(randomLength, false, /[\w\d\?\-]/);
    }
    return password;
}
//End of Private functions

module.exports = router