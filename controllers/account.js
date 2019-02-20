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
var Commonfunction = require('./common.js');
var DistributorSubUser = models.tbldistributorsubuser;
//End of Tables

router.get('/login', jsonParser, function (req, res) {
    var Encryptpassword = jwt.encode(req.query.password, "bugz");

    var search = {};


    search['$or'] = [];
    var obj = new Object();
    obj['username'] = {
        $eq: req.query.username
    };
    search['$or'].push(obj);


    var obj = new Object();
    obj['email'] = {
        $eq: req.query.username
    };
    search['$or'].push(obj);

    // search['$or'] = [];
    search['$and'] = [];
    var obj = new Object();
    obj['password'] = {
        $eq: Encryptpassword
    };
    search['$and'].push(obj);


    // var obj = new Object();
    // obj['idApp'] = {
    //     $eq: req.query.appId
    // };
    // search['$and'].push(obj);
    User.findOne({
        // where: {
        //     username: req.query.username,
        //     password: Encryptpassword
        // }
        where: search
    }).then(function (response) {
        if (response != null) {
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
                    attributes: ['id', 'RoleName', 'Country']
                }]
            }).then(function (resUserInRole) {
                var rol = false;
                var lstRole = [];
                var lstRolewiseCountryList = [];
                for (var i = 0; i < resUserInRole.length; i++) {
                    var objRole = resUserInRole[i].tblrole.RoleName;
                    if (objRole == 'Super Admin') {
                        rol = true;
                    }
                    lstRole.push(objRole);

                    var objCountry = resUserInRole[i].tblrole.Country;
                    lstRolewiseCountryList.push(objCountry);
                }


                var user = {
                    username: req.query.username,
                    password: response.password,
                    Role: lstRole
                }
                if (response.idApp == req.query.appId) {
                    var token = jwt.encode(user, "bugz");
                    res.json({
                        success: true,
                        token: 'JWT ' + token,
                        UserId: response.id,
                        UserImage: response.image,
                        UserCountry: response.country,
                        UserRoles: lstRole,
                        RolewiseCountryList: lstRolewiseCountryList,
                        appId: response.idApp,
                        message: "Login Successfully..."
                    });
                } else {
                    if (rol) {
                        var token = jwt.encode(user, "bugz");
                        res.json({
                            success: true,
                            token: 'JWT ' + token,
                            UserId: response.id,
                            UserImage: response.image,
                            UserCountry: response.country,
                            UserRoles: lstRole,
                            RolewiseCountryList: lstRolewiseCountryList,
                            appId: response.idApp,
                            message: "Login Successfully..."
                        });
                    } else {
                        var obj = new Object();
                        obj['idApp'] = {
                            $eq: req.query.appId
                        };
                        search['$and'].push(obj);

                        User.findOne({
                            where: search
                        }).then(function (response1) {

                            if (response1 != null) {
                                res.json({
                                    success: true,
                                    token: 'JWT ' + token,
                                    UserId: response1.id,
                                    UserImage: response1.image,
                                    UserCountry: response1.country,
                                    UserRoles: lstRole,
                                    RolewiseCountryList: lstRolewiseCountryList,
                                    appId: response1.idApp,
                                    message: "Login Successfully..."
                                });
                            } else {
                                res.json({
                                    success: false,
                                    message: "Invalid Username or Password..."
                                });
                            }
                        })


                    }
                }
            })
        } else {
            res.json({
                success: false,
                message: "Invalid Username or Password..."
            });
        }
    })
})

router.get('/loginNew', jsonParser, function (req, res) {
    var Encryptpassword = jwt.encode(req.query.password, "bugz");
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
            $or: {
                username: req.query.username,
                email: req.query.username,
            },
            password: Encryptpassword
        },
        include: [{
            model: UserInRole,
            include: [{
                model: Role,
                where: { RoleName: 'Super Admin' }
            }]
        }],
    }).then(function (response) {
        if (response != null) {
            var lstRole = [];
            var lstRolewiseCountryList = [];
            for (var i = 0; i < response.tbluserinroles.length; i++) {
                var objRole = response.tbluserinroles[i].tblrole.RoleName;
                lstRole.push(objRole);
                var objCountry = response.tbluserinroles[i].tblrole.Country;
                lstRolewiseCountryList.push(objCountry);
            }
            var user = {
                username: response.username,
                password: response.password,
                Role: lstRole
            }
            var token = jwt.encode(user, "bugz");
            res.json({
                success: true,
                token: 'JWT ' + token,
                UserId: response.id,
                UserImage: response.image,
                UserCountry: response.country,
                UserRoles: lstRole,
                RolewiseCountryList: lstRolewiseCountryList,
                appId: response.idApp,
                UserName: response.username,
                Amount: response.Amount,
                message: "Login Successfully..."
            });
        } else {
            User.findOne({
                where: {
                    $or: {
                        username: req.query.username,
                        email: req.query.username,
                    },
                    password: Encryptpassword,
                    idApp: req.query.appId,
                },
                include: [{
                    model: UserInRole,
                    include: [{
                        model: Role,
                        where: { RoleName: 'Distributor Sub User' }
                    }]
                }],
            }).then(function (resUser) {
                // res.json(resUser);
                if (resUser != null) {
                    DistributorSubUser.findOne({
                        where: {
                            idSubUser: resUser.id
                        }
                    }).then(function (resSubUser) {
                        if (resSubUser != null) {
                            var lstRole = [];
                            var lstRolewiseCountryList = [];
                            for (var i = 0; i < resUser.tbluserinroles.length; i++) {
                                var objRole = resUser.tbluserinroles[i].tblrole.RoleName;
                                lstRole.push(objRole);

                                var objCountry = resUser.tbluserinroles[i].tblrole.Country;
                                lstRolewiseCountryList.push(objCountry);
                            }
                            var user = {
                                username: resUser.username,
                                password: resUser.password,
                                Role: lstRole
                            }
                            if (lstRole.length == 1 && lstRole == 'User') {
                                res.json({
                                    success: false,
                                    message: "Invalid Username or Password..."
                                });
                            } else {
                                var token = jwt.encode(user, "bugz");
                                res.json({
                                    success: true,
                                    token: 'JWT ' + token,
                                    UserId: resUser.id,
                                    DistributorId: resSubUser.idUser,
                                    UserImage: resUser.image,
                                    UserCountry: resUser.country,
                                    UserRoles: lstRole,
                                    RolewiseCountryList: lstRolewiseCountryList,
                                    appId: resUser.idApp,
                                    UserName: resUser.username,
                                    Amount: response.Amount,
                                    message: "Login Successfully..."
                                });
                            }
                        } else {
                            res.json({
                                success: false,
                                message: "Invalid Username or Password..."
                            });
                        }
                    })

                } else {
                    User.findOne({
                        where: {
                            $or: {
                                username: req.query.username,
                                email: req.query.username,
                            },
                            password: Encryptpassword,
                            idApp: req.query.appId,
                        },
                        include: [{
                            model: UserInRole,
                            include: [{
                                model: Role,
                            }]
                        }],
                    }).then(function (resUser) {
                        if (resUser) {
                            var lstRole = [];
                            var lstRolewiseCountryList = [];
                            for (var i = 0; i < resUser.tbluserinroles.length; i++) {
                                var objRole = resUser.tbluserinroles[i].tblrole.RoleName;
                                lstRole.push(objRole);

                                var objCountry = resUser.tbluserinroles[i].tblrole.Country;
                                lstRolewiseCountryList.push(objCountry);
                            }
                            var user = {
                                username: resUser.username,
                                password: resUser.password,
                                Role: lstRole
                            }
                            if (lstRole.length == 1 && lstRole == 'User') {
                                res.json({
                                    success: false,
                                    message: "Invalid Username or Password..."
                                });
                            } else {
                                var token = jwt.encode(user, "bugz");
                                res.json({
                                    success: true,
                                    token: 'JWT ' + token,
                                    UserId: resUser.id,
                                    UserImage: resUser.image,
                                    UserCountry: resUser.country,
                                    UserRoles: lstRole,
                                    RolewiseCountryList: lstRolewiseCountryList,
                                    appId: resUser.idApp,
                                    UserName: resUser.username,
                                    Amount: response.Amount,
                                    message: "Login Successfully..."
                                });
                            }

                        } else {
                            res.json({
                                success: false,
                                message: "Invalid Username or Password..."
                            });
                        }
                    })
                }

            })
        }
    })
})

router.get('/Mobilelogin', jsonParser, function (req, res) {
    var Encryptpassword = jwt.encode(req.query.password, "bugz");
    var search = {};
    search['$and'] = [];

    var obj = new Object();
    obj['username'] = {
        $eq: req.query.username
    };
    search['$and'].push(obj);
    if (req.query.type == 'Owner') {
        var obj = new Object();
        obj['password'] = {
            $eq: Encryptpassword
        };
        search['$and'].push(obj);
    } else {
        var obj = new Object();
        obj['password'] = {
            $eq: Encryptpassword
        };
        search['$and'].push(obj);
    }

    User.findOne({
        // where: {
        //     username: req.query.username,
        //     password: Encryptpassword,
        //     // Type: req.query.type
        // }
        where: search
    }).then(function (response) {
        if (response != null) {
            if (response.Type == req.query.type || response.Type == 'Both' || req.query.type == null || req.query.type == undefined) {
                //if (response.IsMobileVerify == true) {
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
                }).then(function (resUserInRole) {
                    var lstRole = [];
                    for (var i = 0; i < resUserInRole.length; i++) {
                        var objRole = resUserInRole[i].tblrole.RoleName;
                        lstRole.push(objRole);
                    }

                    var user = {
                        username: req.query.username,
                        password: Encryptpassword,
                        Role: lstRole
                    }
                    var token = jwt.encode(user, "bugz");
                    res.json({
                        success: true,
                        token: 'JWT ' + token,
                        UserId: response.id,
                        message: "Login Successfully..."
                    });
                })
                // } else {
                //     res.json({
                //         success: false,
                //         UserId: response.id,
                //         message: "OTP"
                //     });
                // };
            } else {
                res.json({
                    success: false,
                    message: "Invalid Username or Password..."
                });
            }
        } else {

            //Get Wifi Data
            // request.get({
            //     url: 'http://api.pettorway.com/GetDateServices.asmx/loginSystem?LoginName=' + req.query.username + '&LoginPassword=' + req.query.password + '&LoginType=ENTERPRISE&language=cn&ISMD5=0&timeZone=8&apply=APP&loginUrl=&PushID=',
            // }, function(error, response, body) {
            //     var data1 = JSON.parse(body)
            //     if (data1.success == 'true') {
            //         res.json({
            //             success: false,
            //             mds: data1.mds,
            //             message: "Old User"
            //         });
            //     } else {
            res.json({
                success: false,
                message: "Invalid Username or Password..."
            });
            // }



            // });
        }
    })
})

router.get('/MobileOwnerlogin', jsonParser, function (req, res) {
    var Encryptpassword = jwt.encode(req.query.password, "bugz");
    var search = {};
    search['$or'] = [];

    var obj = new Object();
    obj['username'] = {
        $eq: req.query.username
    };
    search['$or'].push(obj);

    var obj = new Object();
    obj['OwnerPhone'] = {
        $eq: req.query.username
    };
    search['$or'].push(obj);

    search['$and'] = [];

    var obj = new Object();
    obj['password'] = {
        $eq: Encryptpassword
    };
    search['$and'].push(obj);

    User.findOne({
        where: search
    }).then(function (response) {
        if (response != null) {
            if (response.Type == req.query.type || response.Type == 'Both' || req.query.type == null || req.query.type == undefined) {
                if (response.IsMobileVerify == true) {
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
                    }).then(function (resUserInRole) {
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
                            message: "Login Successfully..."
                        });
                    })
                } else {
                    res.json({
                        success: false,
                        UserId: response.id,
                        UserName: response.username,
                        message: "OTP"
                    });
                };
            } else {
                res.json({
                    success: false,
                    message: "Invalid Username or Password..."
                });
            }
        } else {
            res.json({
                success: false,
                message: "Invalid Username or Password..."
            });
        }
    })
})

router.get('/OwnerMobilelogout', jsonParser, function (req, res) {
    PushNotification.findOne({
        where: {
            udid: req.query.udid,
            UserType: 'Owner',
        }
    }).then(function (response) {
        if (response != null) {
            var objPushnotification = response;
            var idUser = response.iduser;

            objPushnotification.updateAttributes({ iduser: 0 }).then(function (resUpdate) {
                updatePushNotificationRedisValue(idUser);
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
})
router.get('/Mobilelogout', jsonParser, function (req, res) {
    if (req.query.UserType != null && req.query.UserType != undefined && req.query.UserType != '') {
        PushNotification.findOne({
            where: {
                udid: req.query.udid,
                UserType: req.query.UserType,
            }
        }).then(function (response) {
            if (response != null) {
                var objPushnotification = response;
                var iduser = response.iduser;
                objPushnotification.updateAttributes({ iduser: 0, MessageCount: 0 }).then(function (resUpdate) {
                    updatePushNotificationRedisValue(iduser);
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
                udid: req.query.udid
            }
        }).then(function (response) {
            if (response != null) {
                var objPushnotification = response;
                var iduser = response.iduser;
                objPushnotification.updateAttributes({ iduser: 0, MessageCount: 0 }).then(function (resUpdate) {
                    updatePushNotificationRedisValue(iduser);
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

router.post('/register', jsonParser, function (req, res) {
    objUserReg = req.body

    if (objUserReg.Type == undefined || objUserReg.Type == null || objUserReg.Type == '') {
        objUserReg.Type = 'Shop';
    }
    objUserReg.password = jwt.encode(objUserReg.password, "bugz");

    if (objUserReg.Type == 'Owner') {
        objUserReg.password = objUserReg.password
    }
    if (!validator.isEmail(objUserReg.email)) {
        res.json({
            success: false,
            message: "Invalid Email..."
        });
    } else {
        User.findOne({
            where: {
                username: objUserReg.username
            }
        }).then(function (chkUserExist) {
            if (chkUserExist != null && (chkUserExist.Type == objUserReg.Type || chkUserExist.Type == 'Both')) {
                res.json({
                    success: false,
                    message: "Username is already Exist..."
                });
            } else {
                User.findOne({
                    where: {
                        // email: objUserReg.email
                        // $or: [{ email: objUserReg.email }, { phone: objUserReg.phone }]
                        $or: [{ email: objUserReg.email }]
                    }
                }).then(function (chkEmailExist) {
                    if (chkEmailExist != null && (chkEmailExist.Type == objUserReg.Type || chkEmailExist.Type == 'Both')) {
                        // if (objUserReg.phone == chkEmailExist.phone) {
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
                        if (chkEmailExist != null && objUserReg.Type == 'Owner') {
                            objUserReg.Type = 'Both';
                            chkEmailExist.updateAttributes({ Type: 'Both', password: objUserReg.password, MaxSpeed: objUserReg.MaxSpeed }).then(function (resUser) {
                                updateUserRedisValue(chkEmailExist.id);
                                funAuditLog.CreateAuditLog('register', chkEmailExist.username, 'Create New User in Both');
                                res.json({
                                    success: true,
                                    message: "User Registered Successfully..."
                                });
                            })
                        } else if (chkEmailExist != null && objUserReg.Type == 'Shop') {
                            objUserReg.Type = 'Both';
                            chkEmailExist.updateAttributes({ Type: 'Both', password: objUserReg.password }).then(function (resUser) {
                                updateUserRedisValue(chkEmailExist.id);
                                funAuditLog.CreateAuditLog('register', chkEmailExist.username, 'Create New User in Both');
                                res.json({
                                    success: true,
                                    message: "User Registered Successfully..."
                                });
                            })
                        } else {
                            User.create(objUserReg).then(function (resUserReg) {
                                Role.findOne({
                                    where: {
                                        RoleName: "User"
                                    }
                                }).then(function (objRole) {
                                    if (objRole != null) {

                                        var objUserInRole = {
                                            userId: resUserReg.id,
                                            roleId: objRole.id,
                                        }
                                        UserInRole.create(objUserInRole).then(function (resUserInRole) {
                                            updateUserRedisValue(resUserReg.id);
                                            funAuditLog.CreateAuditLog('register', resUserReg.username, 'Create New User');
                                            res.json({
                                                success: true,
                                                message: "User Registered Successfully..."
                                            });
                                        })
                                    } else {
                                        var objRole = {
                                            RoleName: "User",
                                            Description: null
                                        }
                                        Role.create(objRole).then(function (resRole) {

                                            var objUserInRole = {
                                                userId: resUserReg.id,
                                                roleId: resRole.id,
                                            }
                                            UserInRole.create(objUserInRole).then(function (resUserInRole) {
                                                updateUserRedisValue(resUserReg.id);
                                                funAuditLog.CreateAuditLog('register', resUserReg.username, 'Create New User');
                                                res.json({
                                                    success: true,
                                                    message: "User Registered Successfully..."
                                                });
                                            })
                                        })
                                    }
                                })
                            }).catch(function (error) {
                                res.json({
                                    success: false,
                                    message: error.Error[0].message + "..."
                                });
                            })
                        }
                    }
                })
            }
        })
    }
});

router.get('/ResendOTP', function (req, res) {
    User.findOne({
        where: {
            id: req.query.idUser
        }
    }).then(function (objUser) {
        if (objUser != null) {
            objUser.updateAttributes({ OTP: req.query.OTP }).then(function (resUpdate) {
                //Send OTP
                updateUserRedisValue(objUser.id)
                var objOTP = new Object();
                objOTP.To = objUser.phone;
                objOTP.body = 'Your Verification Code for logging into GPSINA is ' + req.query.OTP + '. Kindly do not share it with anyone else.';
                global.sendSMS(objOTP, function (responseOTP) {
                    if (responseOTP.Status == true) {
                        res.json({
                            success: true,
                            message: "Verification Code send to Registered Mobile Number."
                        });
                    } else {
                        res.json({
                            success: false,
                            message: responseOTP.Message
                        });
                    }
                });
            })
        } else {
            res.json({
                success: false,
                message: "Invalid User"
            });
        }

    });
});

router.post('/CheckUserExist', jsonParser, function (req, res) {
    objUserReg = req.body
    if (objUserReg.Type == undefined || objUserReg.Type == null || objUserReg.Type == '') {
        objUserReg.Type = 'Shop';
    }
    if (!validator.isEmail(objUserReg.email)) {
        res.json({
            success: false,
            message: "Invalid Email..."
        });
    } else {

        User.findOne({
            where: {
                // email: objUserReg.email
                // $or: [{ email: objUserReg.email }, { username: objUserReg.username }, { phone: objUserReg.phone }]
                $or: [{ email: objUserReg.email }, { username: objUserReg.username }]
            }
        }).then(function (chkEmailExist) {
            if (chkEmailExist != null) {
                // if (objUserReg.phone == chkEmailExist.phone) {
                //     res.json({
                //         success: false,
                //         message: "Phone is already Exist..."
                //     });
                // } else 
                if (objUserReg.username == chkEmailExist.username && (chkEmailExist.Type == objUserReg.Type || chkEmailExist.Type == 'Both')) {
                    res.json({
                        success: false,
                        message: "Username is already Exist..."
                    });
                }
                // else {
                //     res.json({
                //         success: false,
                //         message: "Email is already Exist..."
                //     });
                // }
                else {
                    res.json({
                        success: true,
                        message: "user is Exist in another Type..."
                    });
                }
            } else {
                res.json({
                    success: true,
                    message: "user is not Exist..."
                });
            }
        })

    }
});

var https = require('https');
router.post('/CheckWebUserExistWithOTPsend', jsonParser, function (req, res) {
    objUserReg = req.body
    if (!validator.isEmail(objUserReg.email)) {
        res.json({
            success: false,
            message: "Invalid Email..."
        });
    } else {

        User.findOne({
            where: {
                // email: objUserReg.email
                $or: [{ email: objUserReg.email }, { username: objUserReg.username }, { phone: objUserReg.phone }]
            }
        }).then(function (chkEmailExist) {
            if (chkEmailExist != null) {
                if (objUserReg.phone == chkEmailExist.phone) {
                    res.json({
                        success: false,
                        message: "Phone is already Exist..."
                    });
                } else if (objUserReg.username == chkEmailExist.username) {
                    res.json({
                        success: false,
                        message: "Username is already Exist..."
                    });
                } else {
                    res.json({
                        success: false,
                        message: "Email is already Exist..."
                    });
                }
            } else {

                var data = JSON.stringify({
                    api_key: 'a692ce5b',
                    api_secret: '928903ee92ecd3e4',
                    text: 'Your One Time Password(OTP) is ' + objUserReg.OTP,
                    to: objUserReg.phone,
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
                req1.on('response', function (res1) {
                    res1.on('data', function (chunk) {
                        responseData += chunk;
                    });

                    res1.on('end', function () {
                        res.json({
                            success: true,
                            message: "Record found...",
                            data: JSON.parse(responseData)
                        });
                    });
                });

                // res.json({
                //     success: true,
                //     message: "user is Exist..."
                // });
            }
        })

    }
});

router.get('/passwordVerification', jsonParser, function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                var password = jwt.decode(UserExist.password, "bugz");
                if (password == req.query.password) {
                    res.json({
                        success: true,
                        message: "Valid Password..."
                    });

                } else {
                    res.json({
                        success: false,
                        message: "The password is incorrect.Try again."
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


router.post('/changepasswordNew', jsonParser, function (req, res) {

    objUser = req.body;

    //Set Parameter for User Permission
    // req.query['tablename'] = req.headers['x-requested-with'];
    var EncryptOldpassword = jwt.encode(objUser.oldpassword, "bugz");
    var EncryptNewpassword = jwt.encode(objUser.password, "bugz");

    // if (objUser.password != objUser.confirmpassword) {
    //     res.json({
    //         success: false,
    //         message: "Password and Confirm Password does not match..."
    //     });
    // } else 
    if (objUser.password.length < 2) {
        res.json({
            success: false,
            message: "Password contains atleast 2 characters..."
        });
    } else {
        User.findOne({
            where: {
                id: objUser.UserId
            }
        }).then(function (chkUserExist) {
            if (chkUserExist != null) {
                // if (EncryptOldpassword == chkUserExist.password) {
                if (chkUserExist.email != 'demo@maark.my' && chkUserExist.email != 'demo@gmail.com') {
                    chkUserExist.updateAttributes({
                        password: EncryptNewpassword
                    }).then(function (response) {
                        updateUserRedisValue(chkUserExist.id)
                        funAuditLog.CreateAuditLog('changepassword', chkUserExist.username, 'Change User Password-ID: (' + chkUserExist.id + ')');
                        SystemEmail.findOne({ where: { IdApp: chkUserExist.idApp } }).then(function (objSystemEmail) {
                            EmailTemplate.findOne({
                                where: {
                                    Type: "Change Password",
                                }
                            }).then(function (objEmailTemplate) {
                                if (objEmailTemplate != null) {
                                    var Name = chkUserExist.username;
                                    var Password = objUser.password;

                                    Setting.findOne({
                                        where: {
                                            Name: 'NotificationEmailTo'
                                        }
                                    }).then(function (objSetting) {

                                        var body = objEmailTemplate.EmailBody.replace(/{UserName}/g, Name).replace("{Password}", Password).replace(/{AppName}/g, objUser.AppName).replace("{Email}", chkUserExist.email);
                                        var mail = {
                                            from: objSystemEmail.DefaultEmailFrom,
                                            to: chkUserExist.email,
                                            bcc: objSetting.Value,
                                            // bcc: 'soham.patel1@bugzstudio.com',
                                            subject: objUser.AppName + " " + objEmailTemplate.EmailSubject,
                                            html: body
                                        };
                                        SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                            // console.log(EmailSettingCreated)
                                        })

                                        // transporter.sendMail(mail, function(error, response) {
                                        //     if (error) {
                                        //         // res.json(error);
                                        //     } else {
                                        //         // funAuditLog.CreateAuditLog('change password', chkUserExist.username, 'change password');
                                        //     }
                                        // });
                                        funAuditLog.CreateAuditLog('change password', chkUserExist.username, 'change password-ID: (' + chkUserExist.id + ')');
                                        res.json({
                                            success: true,
                                            message: "New Password email sent. password has been changed....",
                                            // data: response
                                        });
                                    })
                                } else {
                                    res.json({
                                        success: false,
                                        message: "This Email template not found..."
                                    })
                                }
                            });


                        })

                        // res.json({
                        //     success: true,
                        //     message: "Password changed successfully..."
                        // });
                    }).catch(function (error) {
                        res.json({
                            success: false,
                            message: error.errors[0].message + "..."
                        });
                    })
                } else {
                    res.json({
                        success: false,
                        message: "you can not reset this account password..",
                        // data: response
                    });
                }

                // } else {
                //     res.json({
                //         success: false,
                //         message: "Old Password is wrong..."
                //     });
                // }
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

router.post('/changepassword', jsonParser, function (req, res) {
    objUser = req.body;

    //Set Parameter for User Permission
    // req.query['tablename'] = req.headers['x-requested-with'];
    var EncryptOldpassword = jwt.encode(objUser.oldpassword, "bugz");
    var EncryptNewpassword = jwt.encode(objUser.password, "bugz");

    if (objUser.password != objUser.confirmpassword) {
        res.json({
            success: false,
            message: "Password and Confirm Password does not match..."
        });
    } else if (objUser.password.length < 2) {
        res.json({
            success: false,
            message: "Password contains atleast 2 characters..."
        });
    } else {
        User.findOne({
            where: {
                id: objUser.UserId
            }
        }).then(function (chkUserExist) {
            if (chkUserExist != null) {

                //set Parameter
                // req.query['permission'] = "Modified";

                // var obj = {};
                // obj.headers = req.headers;
                // obj.query = req.query;

                // funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                //     var AccessPermission = responseAccessPermission.success;
                //     if (AccessPermission) {



                if (EncryptOldpassword == chkUserExist.password) {
                    chkUserExist.updateAttributes({
                        password: EncryptNewpassword
                    }).then(function (response) {
                        updateUserRedisValue(chkUserExist.id)
                        funAuditLog.CreateAuditLog('changepassword', chkUserExist.username, 'Change User Password - ID: (' + chkUserExist.id + ')');
                        res.json({
                            success: true,
                            message: "Password changed successfully..."
                        });
                    }).catch(function (error) {
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

router.post('/changeUserPassword', jsonParser, function (req, res) {
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
        }).then(function (chkUserExist) {
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
                    chkUserExist.updateAttributes(search).then(function (response) {
                        updateUserRedisValue(chkUserExist.id)
                        funAuditLog.CreateAuditLog('changepassword', chkUserExist.username, 'Change User Password- ID: (' + chkUserExist.id + ')');
                        res.json({
                            success: true,
                            message: "Password changed successfully..."
                        });
                    }).catch(function (error) {
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

router.get('/forgotpassword', function (req, res) {
    User.findOne({
        where: {
            // email: req.query.email,
            // idApp: req.query.idApp
            id: req.query.id,
        }
    }).then(function (objUser) {
        if (objUser != null) {
            SystemEmail.findOne({ where: { IdApp: objUser.idApp } }).then(function (objSystemEmail) {
                var NewPassword = customPassword();
                console.log(NewPassword);
                var EncryptNewpassword = jwt.encode(NewPassword, "bugz");
                var search = { password: EncryptNewpassword };
                objUser.updateAttributes(search).then(function (response) {
                    updateUserRedisValue(objUser.id)
                    if (response != null) {
                        EmailTemplate.findOne({
                            where: {
                                Type: "Forgot Password Email",
                            }
                        }).then(function (objEmailTemplate) {
                            if (objEmailTemplate != null) {
                                var Name = objUser.username;
                                var Password = NewPassword;
                                Setting.findOne({
                                    where: {
                                        Name: 'NotificationEmailTo'
                                    }
                                }).then(function (objSetting) {
                                    var body = objEmailTemplate.EmailBody.replace(/{UserName}/g, Name).replace("{Password}", Password).replace("{AppName}", req.query.AppName);
                                    var mail = {
                                        from: objSystemEmail.DefaultEmailFrom,
                                        to: objUser.email, // + ', ' + objSystemEmail.NotificationEmailTo,
                                        bcc: objSetting.Value,
                                        // bcc: 'soham.patel1@bugzstudio.com',
                                        subject: req.query.AppName + " " + objEmailTemplate.EmailSubject,
                                        html: body
                                    };
                                    SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                        // console.log(EmailSettingCreated)
                                    })

                                    // transporter.sendMail(mail, function(error, response) {
                                    //     if (error) {
                                    //         res.json(error);
                                    //     } else {
                                    funAuditLog.CreateAuditLog('forgotpassword', objUser.username, 'forgot User Password - ID: (' + objUser.id + ')');
                                    res.json({
                                        success: true,
                                        message: "Password sent to your email successfully...",
                                        // data: response
                                    });
                                    //     }
                                    // });
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
                }).catch(function (error) {
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

router.get('/forgotpasswordNew', function (req, res) {
    if (req.query.email != 'demo@maark.my' && req.query.email != 'demo@gmail.com') {
        var flgChangePass = false;
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
            where: { email: req.query.email, },
            include: [{
                model: UserInRole,
                include: [{
                    model: Role,
                    attributes: ['id', 'RoleName'],
                    where: { RoleName: 'Super Admin' }
                }]
            }],
        }).then(function (response) {

            if (response != null) {
                SystemEmail.findOne({ where: { IdApp: req.query.idApp } }).then(function (objSystemEmail) {
                    var NewPassword = customPassword();
                    // console.log(NewPassword);
                    var EncryptNewpassword = jwt.encode(NewPassword, "bugz");
                    response.updateAttributes({ password: EncryptNewpassword }).then(function (response) {
                        if (response != null) {
                            updateUserRedisValue(response.id);
                            EmailTemplate.findOne({
                                where: {
                                    Type: "Forgot Password Email",
                                }
                            }).then(function (objEmailTemplate) {
                                if (objEmailTemplate != null) {
                                    var Name = response.username;
                                    var Password = NewPassword;
                                    Setting.findOne({
                                        where: {
                                            Name: 'NotificationEmailTo'
                                        }
                                    }).then(function (objSetting) {
                                        var body = objEmailTemplate.EmailBody.replace(/{UserName}/g, Name).replace("{Password}", Password).replace(/{AppName}/g, req.query.AppName).replace("{Email}", response.email);
                                        var mail = {
                                            from: objSystemEmail.DefaultEmailFrom,
                                            to: response.email, // + ', ' + objSystemEmail.NotificationEmailTo,
                                            bcc: objSetting.Value,
                                            // bcc: 'soham.patel1@bugzstudio.com',
                                            subject: req.query.AppName + " " + objEmailTemplate.EmailSubject,
                                            html: body
                                        };
                                        SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                            // transporter.sendMail(mail, function(error, response) {
                                            // if (error) {
                                            //     res.json(error);
                                            // } else {
                                            //     funAuditLog.CreateAuditLog('forgotpassword', response.email, 'forgot User Password');

                                            // }
                                            // });
                                            console.log(EmailSettingCreated)
                                        })
                                        funAuditLog.CreateAuditLog('forgotpassword', response.email, 'forgot User Password - ID: (' + response.id + ')');
                                        res.json({
                                            success: true,
                                            message: "Password sent to your email successfully...",
                                        });
                                    })
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
                    }).catch(function (error) {
                        res.json({
                            success: false,
                            message: error.errors[0].message + "..."
                        });
                    })
                })

            } else {
                User.findOne({
                    where: { email: req.query.email, idApp: req.query.idApp },
                    include: [{
                        model: UserInRole,
                        include: [{
                            model: Role,
                            attributes: ['id', 'RoleName'],
                        }]
                    }],
                }).then(function (response1) {


                    if (response1) {

                        var lstRole = [];
                        for (var i = 0; i < response1.tbluserinroles.length; i++) {
                            var objRole = response1.tbluserinroles[i].tblrole.RoleName;
                            lstRole.push(objRole);
                        }
                        console.log(lstRole)
                        if (lstRole.length == 1 && lstRole == 'User') {
                            res.json({
                                success: false,
                                message: "This system Email not found..."
                            });
                        } else {
                            SystemEmail.findOne({ where: { IdApp: req.query.idApp } }).then(function (objSystemEmail) {

                                var NewPassword = customPassword();
                                var EncryptNewpassword = jwt.encode(NewPassword, "bugz");
                                response1.updateAttributes({ password: EncryptNewpassword }).then(function (response) {
                                    if (response != null) {
                                        updateUserRedisValue(response1.id);
                                        EmailTemplate.findOne({
                                            where: {
                                                Type: "Forgot Password Email",
                                            }
                                        }).then(function (objEmailTemplate) {
                                            if (objEmailTemplate != null) {
                                                var Name = response1.username;
                                                var Password = NewPassword;
                                                Setting.findOne({
                                                    where: {
                                                        Name: 'NotificationEmailTo'
                                                    }
                                                }).then(function (objSetting) {
                                                    var body = objEmailTemplate.EmailBody.replace(/{UserName}/g, Name).replace("{Password}", Password).replace(/{AppName}/g, req.query.AppName).replace("{Email}", response1.email);
                                                    var mail = {
                                                        from: objSystemEmail.DefaultEmailFrom,
                                                        to: response1.email, // + ', ' + objSystemEmail.NotificationEmailTo,
                                                        bcc: objSetting.Value,
                                                        // bcc: 'soham.patel@bugzstudio.com',
                                                        subject: req.query.AppName + " " + objEmailTemplate.EmailSubject,
                                                        html: body
                                                    };
                                                    SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                                        // transporter.sendMail(mail, function(error, response) {
                                                        //     console.log(error)
                                                        //     if (error) {
                                                        //         res.json(error);
                                                        //     } else {
                                                        //         funAuditLog.CreateAuditLog('forgotpassword', response1.email, 'forgot User Password');
                                                        //         res.json({
                                                        //             success: true,
                                                        //             message: "Password sent to your email successfully...",
                                                        //             data: response
                                                        //         });
                                                        //     }
                                                        // }); 
                                                        // console.log(EmailSettingCreated)

                                                    })
                                                    res.json({
                                                        success: true,
                                                        message: "Password sent to your email successfully...",
                                                        // data: response
                                                    });
                                                })
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
                                }).catch(function (error) {
                                    res.json({
                                        success: false,
                                        message: error.errors[0].message + "..."
                                    });
                                })
                            })
                        }


                    } else {
                        res.json({
                            success: false,
                            message: "This system Email not found..."
                        });
                    }
                })
            }
        })
    } else {
        res.json({
            success: false,
            message: "you can not reset this account password..",
            // data: response
        });
    }
});

router.get('/forgotpasswordfromOwnerCustomer', function (req, res) {
    User.findOne({
        where: {
            // email: req.query.email,
            // idApp: req.query.idApp
            id: req.query.id,
        }
    }).then(function (objUser) {
        if (objUser != null) {

            SystemEmail.findOne({ where: { IdApp: objUser.idApp } }).then(function (objSystemEmail) {

                var NewPassword = customPassword();
                var EncryptNewpassword = jwt.encode(NewPassword, "bugz");
                var flgIsUpdate = false;

                var search = { password: EncryptNewpassword };
                flgIsUpdate = true;

                if (flgIsUpdate) {
                    objUser.updateAttributes(search).then(function (response) {
                        if (response != null) {
                            updateUserRedisValue(objUser.id);
                            EmailTemplate.findOne({
                                where: {
                                    Type: "Forgot Password Email",
                                }
                            }).then(function (objEmailTemplate) {
                                if (objEmailTemplate != null) {
                                    var Name = objUser.username;
                                    var Password = NewPassword;

                                    Setting.findOne({
                                        where: {
                                            Name: 'NotificationEmailTo'
                                        }
                                    }).then(function (objSetting) {

                                        var body = objEmailTemplate.EmailBody.replace(/{UserName}/g, Name).replace("{Password}", Password).replace("{AppName}", req.query.AppName);
                                        var mail = {
                                            from: objSystemEmail.DefaultEmailFrom,
                                            to: objUser.email,
                                            bcc: objSetting.Value,
                                            // bcc: 'soham.patel1@bugzstudio.com',
                                            subject: req.query.AppName + " " + objEmailTemplate.EmailSubject,
                                            html: body
                                        };
                                        SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                            // console.log(EmailSettingCreated)
                                        })
                                        // transporter.sendMail(mail, function(error, response) {
                                        //     if (error) {
                                        //         res.json(error);
                                        //     } else {
                                        funAuditLog.CreateAuditLog('forgotpassword', objUser.username, 'forgot User Password - ID: (' + objUser.id + ')');
                                        res.json({
                                            success: true,
                                            message: "Password sent to your email successfully...",
                                            // data: response
                                        });
                                        //     }
                                        // });
                                    })
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
                    }).catch(function (error) {
                        res.json({
                            success: false,
                            message: error.errors[0].message + "..."
                        });
                    })
                } else {
                    res.json({
                        success: false,
                        message: "This system Email not found..."
                    });
                }
            })
        } else {
            res.json({
                success: false,
                message: "This Email not registered with us..."
            });
        }
    })
});

router.get('/forgotpasswordfromOwnerCustomerNew', jsonParser, function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                var password = jwt.decode(UserExist.password, "bugz");
                if (password == req.query.password) {
                    User.findOne({
                        where: {
                            // email: req.query.email,
                            // idApp: req.query.idApp
                            id: req.query.id,
                        }
                    }).then(function (objUser) {
                        if (objUser != null) {
                            if (objUser.email != 'demo@maark.my' && objUser.email != 'demo@gmail.com') {
                                SystemEmail.findOne({ where: { IdApp: objUser.idApp } }).then(function (objSystemEmail) {

                                    var NewPassword = customPassword();
                                    var EncryptNewpassword = jwt.encode(NewPassword, "bugz");
                                    var flgIsUpdate = false;

                                    var search = { password: EncryptNewpassword };
                                    flgIsUpdate = true;

                                    if (flgIsUpdate) {
                                        objUser.updateAttributes(search).then(function (response) {
                                            if (response != null) {
                                                updateUserRedisValue(objUser.id);
                                                EmailTemplate.findOne({
                                                    where: {
                                                        Type: "Forgot Password Email",
                                                    }
                                                }).then(function (objEmailTemplate) {
                                                    if (objEmailTemplate != null) {
                                                        var Name = objUser.username;
                                                        var Password = NewPassword;

                                                        Setting.findOne({
                                                            where: {
                                                                Name: 'NotificationEmailTo'
                                                            }
                                                        }).then(function (objSetting) {

                                                            var body = objEmailTemplate.EmailBody.replace(/{UserName}/g, Name).replace("{Password}", Password).replace(/{AppName}/g, req.query.AppName).replace("{Email}", objUser.email);
                                                            var mail = {
                                                                from: objSystemEmail.DefaultEmailFrom,
                                                                to: objUser.email,
                                                                bcc: objSetting.Value,
                                                                // bcc: 'soham.patel1@bugzstudio.com',
                                                                subject: req.query.AppName + " " + objEmailTemplate.EmailSubject,
                                                                html: body
                                                            };
                                                            SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                                                // console.log(EmailSettingCreated
                                                            })

                                                            // transporter.sendMail(mail, function(error, response) {
                                                            //     if (error) {
                                                            //         // res.json(error);
                                                            //     } else {
                                                            //        

                                                            //     }
                                                            // });
                                                            funAuditLog.CreateAuditLog('forgotpassword', objUser.username, 'forgot User Password - ID: (' + objUser.id + ')');
                                                            res.json({
                                                                success: true,
                                                                message: "Reset Password email sent.",
                                                                // data: response
                                                            });
                                                        })
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
                                        }).catch(function (error) {
                                            res.json({
                                                success: false,
                                                message: error.errors[0].message + "..."
                                            });
                                        })
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "This system Email not found..."
                                        });
                                    }
                                })
                            } else {
                                res.json({
                                    success: false,
                                    message: "you can not reset this account password..",
                                    // data: response
                                });
                            }
                        } else {
                            res.json({
                                success: false,
                                message: "This Email not registered with us..."
                            });
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: "The password is incorrect.Try again."
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

//Start Mobile App

router.get('/MobileAppLogin', jsonParser, function (req, res) {
    var Encryptpassword = jwt.encode(req.query.password, "bugz");
    User.findOne({
        where: {
            $or: {
                username: req.query.username,
                email: req.query.username,
                phone: req.query.username,
            },
            password: Encryptpassword,
        }
    }).then(function (response) {
        if (response != null) {
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
            }).then(function (resUserInRole) {
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

router.post('/CheckMobileUserExist', jsonParser, function (req, res) {
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
            }
        }).then(function (chkEmailExist) {
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

router.post('/MobileRegister', jsonParser, function (req, res) {
    objUserReg = req.body
    objUserReg.password = jwt.encode(objUserReg.password, "bugz");
    User.create(objUserReg).then(function (resUserReg) {
        Role.findOne({
            where: {
                RoleName: "User"
            }
        }).then(function (objRole) {
            if (objRole != null) {
                var objUserInRole = {
                    userId: resUserReg.id,
                    roleId: objRole.id,
                }
                UserInRole.create(objUserInRole).then(function (resUserInRole) {
                    updateUserRedisValue(resUserReg.id)
                    funAuditLog.CreateAuditLog('register', resUserReg.username, 'Create New User - ID: (' + resUserReg.id + ')');

                    //Send OTP
                    // var objOTP = new Object();
                    // objOTP.To = objUserReg.phone;
                    // objOTP.body = 'Your Verification Code for logging is ' + objUserReg.OTP + '. Kindly do not share it with anyone else.';
                    // global.sendSMS(objOTP, function(responseOTP) {
                    //     console.log(responseOTP)
                    // });

                    res.json({
                        success: true,
                        message: "User Registered Successfully..."
                    });
                })
            } else {
                var objRole = {
                    RoleName: "User",
                    Description: null
                }
                Role.create(objRole).then(function (resRole) {

                    var objUserInRole = {
                        userId: resUserReg.id,
                        roleId: resRole.id,
                    }
                    UserInRole.create(objUserInRole).then(function (resUserInRole) {
                        updateUserRedisValue(resUserReg.id);
                        funAuditLog.CreateAuditLog('register', resUserReg.username, 'Create New User - ID: (' + resUserReg.id + ')');

                        //Send OTP
                        // var objOTP = new Object();
                        // objOTP.To = objUserReg.phone;
                        // objOTP.body = 'Your Verification Code for logging is ' + objUserReg.OTP + '. Kindly do not share it with anyone else.';
                        // global.sendSMS(objOTP, function(responseOTP) {
                        //     console.log(responseOTP)
                        // });

                        res.json({
                            success: true,
                            message: "User Registered Successfully..."
                        });


                        // res.json({
                        //     success: true,
                        //     message: "User Registered Successfully..."
                        // });
                    })
                })
            }
        })
    }).catch(function (error) {
        res.json({
            success: false,
            message: "User Registration Failed..."
        });
    })
});

router.get('/MobileForgotPassword', function (req, res) {
    User.findOne({ where: { email: req.query.email } }).then(function (objUser) {
        if (objUser != null) {
            SystemEmail.findOne().then(function (objSystemEmail) {
                var NewPassword = customPassword();
                console.log(NewPassword);
                var EncryptNewpassword = jwt.encode(NewPassword, "bugz");
                var search = { password: EncryptNewpassword };
                objUser.updateAttributes(search).then(function (response) {
                    if (response != null) {
                        updateUserRedisValue(objUser.id);
                        EmailTemplate.findOne({
                            where: {
                                Type: "Forgot Password Email",
                            }
                        }).then(function (objEmailTemplate) {
                            if (objEmailTemplate != null) {
                                var Name = objUser.username;
                                var Password = NewPassword;

                                var body = objEmailTemplate.EmailBody.replace(/{UserName}/g, Name).replace("{Password}", Password);
                                var mail = {
                                    from: objSystemEmail.DefaultEmailFrom,
                                    to: objUser.email, // + ', ' + objSystemEmail.NotificationEmailTo,
                                    subject: objEmailTemplate.EmailSubject,
                                    html: body
                                };
                                transporter.sendMail(mail, function (error, response) {
                                    if (error) {
                                        res.json({
                                            success: false,
                                            message: "Error in Sending Email " + error,
                                            data: error
                                        });
                                    } else {
                                        funAuditLog.CreateAuditLog('forgotpassword', objUser.username, 'forgot User Password - ID: (' + objUser.id + ')');
                                        res.json({
                                            success: true,
                                            message: "Password sent to your email successfully...",
                                            data: response
                                        });
                                    }
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
                }).catch(function (error) {
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

router.post('/changeMobileUserPassword', jsonParser, function (req, res) {
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
                username: objUser.username
            }
        }).then(function (chkUserExist) {
            if (chkUserExist != null) {
                var Password = chkUserExist.password;
                var search = { password: EncryptNewpassword };
                if (EncryptOldpassword == Password) {
                    chkUserExist.updateAttributes(search).then(function (response) {
                        updateUserRedisValue(chkUserExist.id);
                        funAuditLog.CreateAuditLog('changepassword', chkUserExist.username, 'Change User Password - ID: (' + chkUserExist.id + ')');
                        res.json({
                            success: true,
                            message: "Password changed successfully..."
                        });
                    }).catch(function (error) {
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

router.get('/MobileApplogout', jsonParser, function (req, res) {
    if (req.query.UserType != null && req.query.UserType != undefined && req.query.UserType != '') {
        PushNotification.findOne({
            where: {
                udid: req.query.udid,
                UserType: req.query.UserType,
            }
        }).then(function (response) {
            if (response != null) {
                var objPushnotification = response;
                var iduser = response.iduser;
                objPushnotification.updateAttributes({ iduser: 0 }).then(function (resUpdate) {
                    updatePushNotificationRedisValue(iduser);
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
        }).then(function (response) {
            if (response != null) {
                var objPushnotification = response;
                var iduser = response.iduser;
                objPushnotification.updateAttributes({ iduser: 0 }).then(function (resUpdate) {
                    updatePushNotificationRedisValue(iduser);
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
router.get('/SetLastLogin', jsonParser, function (req, res) {
    User.findOne({ where: { id: req.query.useId } }).then(function (userExits) {
        if (userExits) {
            var LastLogin = new Date();
            userExits.updateAttributes({ LastLogin: LastLogin }).then(function (userupdate) {
                updateUserRedisValue(userExits.id);
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

//End Mobile App

//New Mobile App wise

router.get('/MobileAppLoginNew', jsonParser, function (req, res) {
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
    }).then(function (response) {
        if (response != null) {
            UserInRole.belongsTo(Role, {
                foreignKey: {
                    name: 'roleId',
                    allowNull: false
                }
            });
            var LastLogin = new Date();
            if (req.query.AppVersion != null && req.query.AppVersion != undefined && req.query.AppVersion != '0.0.0') {
                response.updateAttributes({ LastLogin: LastLogin, AppVersion: req.query.AppVersion, Platform: req.query.Platform }).then(function (UpdateLastLogin) {
                    updateUserRedisValue(response.id);
                })
            } else {
                response.updateAttributes({ LastLogin: LastLogin }).then(function (UpdateLastLogin) {
                    updateUserRedisValue(response.id);
                })
            }
            UserInRole.findAll({
                where: {
                    userId: response.id
                },
                include: [{
                    model: Role,
                    attributes: ['id', 'RoleName']
                }]
            }).then(function (resUserInRole) {
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
                    Notification: response.Notification,
                    SpeedValue: response.SpeedValue,
                    IsIgnition: response.IsIgnition,
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

router.post('/CheckMobileUserExistNew', jsonParser, function (req, res) {
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
        }).then(function (chkEmailExist) {
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

router.post('/MobileRegisterNew', jsonParser, function (req, res) {
    objUserReg = req.body
    objUserReg.password = jwt.encode(objUserReg.password, "bugz");
    User.create(objUserReg).then(function (resUserReg) {
        Role.findOne({
            where: {
                RoleName: "User"
            }
        }).then(function (objRole) {
            if (objRole != null) {
                var objUserInRole = {
                    userId: resUserReg.id,
                    roleId: objRole.id,
                }
                UserInRole.create(objUserInRole).then(function (resUserInRole) {
                    funAuditLog.CreateAuditLog('register', resUserReg.username, 'Create New User - ID: (' + resUserReg.id + ')');

                    //Send OTP
                    // var objOTP = new Object();
                    // objOTP.To = objUserReg.phone;
                    // objOTP.body = 'Your Verification Code for logging into is ' + objUserReg.OTP + '. Kindly do not share it with anyone else.';
                    // global.sendSMS(objOTP, function(responseOTP) {
                    //     console.log(responseOTP)
                    // });
                    var objshare = { email: resUserReg.email, id: resUserReg.id, username: resUserReg.username };
                    AddNewShareDevice(objshare, function (response1) {
                        updateUserRedisValue(resUserReg.id)
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
                Role.create(objRole).then(function (resRole) {

                    var objUserInRole = {
                        userId: resUserReg.id,
                        roleId: resRole.id,
                    }
                    UserInRole.create(objUserInRole).then(function (resUserInRole) {
                        funAuditLog.CreateAuditLog('register', resUserReg.username, 'Create New User - ID: (' + resUserReg.id + ')');

                        //Send OTP
                        // var objOTP = new Object();
                        // objOTP.To = objUserReg.phone;
                        // objOTP.body = 'Your Verification Code for logging into is ' + objUserReg.OTP + '. Kindly do not share it with anyone else.';
                        // global.sendSMS(objOTP, function(responseOTP) {
                        //     console.log(responseOTP)
                        // });
                        var objshare = { email: resUserReg.email, id: resUserReg.id, username: resUserReg.username };
                        AddNewShareDevice(objshare, function (response1) {
                            updateUserRedisValue(resUserReg.id)
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
    }).catch(function (error) {
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
    }).then(function (SharedEmailExit) {
        if (SharedEmailExit.length > 0) {
            function uploader(i) {
                if (SharedEmailExit.length > i) {
                    Vehicle.findOne({ where: { deviceid: SharedEmailExit[i].DeviceId } }).then(function (vehicleExit) {
                        if (vehicleExit) {
                            User.findOne({ where: { id: SharedEmailExit[i].idUser } }).then(function (userExit) {
                                if (userExit) {
                                    var obj = new Object();
                                    obj.DeviceId = SharedEmailExit[i].DeviceId;
                                    obj.idUser = objparam.id;
                                    obj.idSharedUser = SharedEmailExit[i].idUser;
                                    obj.JourneyFlag = SharedEmailExit[i].JourneyFlag;
                                    obj.idVehicle = vehicleExit.id;
                                    obj.IsActive = 1;
                                    obj.IsSharedUserNotification = 1;
                                    obj.IsNotification = 1;
                                    obj.CreatedDate = new Date();
                                    obj.CreatedBy = userExit.username;

                                    ShareDevice.create(obj).then(function (ShareDeviceCreated) {

                                        if (ShareDeviceCreated) {
                                            SharedEmailExit[i].updateAttributes({ Status: 'Complete', ModifiedDate: new Date(), ModifiedBy: objparam.username }).then(function (SharedEmailupdate) {
                                                updateUserRedisValue(vehicleExit.iduser);
                                                funAuditLog.CreateAuditLog('update SharedEmailExit', objparam.username, 'Update SharedEmailExit  UserID: (' + SharedEmailExit.idUser + ') -> SharedID: (' + SharedEmailExit.Id + ') ');
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

router.get('/MobileForgotPasswordNew', function (req, res) {
    if (req.query.email != 'demo@maark.my' && req.query.email != 'demo@gmail.com') {
        User.findOne({ where: { email: req.query.email, idApp: req.query.idApp, } }).then(function (objUser) {
            if (objUser != null) {
                SystemEmail.findOne({ where: { IdApp: objUser.idApp } }).then(function (objSystemEmail) {
                    var NewPassword = customPassword();
                    var EncryptNewpassword = jwt.encode(NewPassword, "bugz");
                    var search = { password: EncryptNewpassword };
                    objUser.updateAttributes(search).then(function (response) {
                        updateUserRedisValue(objUser.id);
                        if (response != null) {
                            EmailTemplate.findOne({
                                where: {
                                    Type: "Forgot Password Email",
                                }
                            }).then(function (objEmailTemplate) {
                                if (objEmailTemplate != null) {
                                    var Name = objUser.username;
                                    var Password = NewPassword;
                                    Setting.findOne({
                                        where: {
                                            Name: 'NotificationEmailTo'
                                        }
                                    }).then(function (objSetting) {
                                        var body = objEmailTemplate.EmailBody.replace(/{UserName}/g, Name).replace("{Password}", Password).replace(/{AppName}/g, req.query.AppName).replace("{Email}", objUser.email);
                                        var mail = {
                                            from: objSystemEmail.DefaultEmailFrom,
                                            to: objUser.email, // + ', ' + objSystemEmail.NotificationEmailTo,
                                            bcc: objSetting.Value,
                                            // bcc: 'soham.patel1@bugzstudio.com',
                                            subject: req.query.AppName + " " + objEmailTemplate.EmailSubject,
                                            html: body
                                        };
                                        SetsmtpConfig(objSystemEmail, mail, function (EmailSettingCreated) {
                                            // console.log(EmailSettingCreated)
                                        })

                                        // transporter.sendMail(mail, function(error, response) {
                                        //     if (error) {
                                        //         res.json({
                                        //             success: false,
                                        //             message: "Error in Sending Email " + error,
                                        //             data: error
                                        //         });
                                        //     } else {
                                        funAuditLog.CreateAuditLog('forgotpassword', objUser.username, 'forgot User Password - ID: (' + objUser.id + ') ');
                                        res.json({
                                            success: true,
                                            message: "Password sent to your email successfully...",
                                            // data: response
                                        });
                                        //     }
                                        // });
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
                    }).catch(function (error) {
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
    } else {
        res.json({
            success: false,
            message: "you can not reset this account password..",
            // data: response
        });
    }
});

router.post('/changeMobileUserPasswordNew', jsonParser, function (req, res) {
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
        }).then(function (chkUserExist) {
            if (chkUserExist != null) {
                var Password = chkUserExist.password;
                var search = { password: EncryptNewpassword };
                if (EncryptOldpassword == Password) {
                    chkUserExist.updateAttributes(search).then(function (response) {
                        updateUserRedisValue(chkUserExist.id);
                        funAuditLog.CreateAuditLog('changepassword', chkUserExist.username, 'Change User Password - ID: (' + chkUserExist.id + ')  ');
                        res.json({
                            success: true,
                            message: "Password changed successfully..."
                        });
                    }).catch(function (error) {
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

router.get('/MobileApplogoutNew', jsonParser, function (req, res) {
    if (req.query.UserType != null && req.query.UserType != undefined && req.query.UserType != '') {
        PushNotification.findOne({
            where: {
                udid: req.query.udid,
                UserType: req.query.UserType,
            }
        }).then(function (response) {
            if (response != null) {
                var objPushnotification = response;
                var iduser = iduser;
                objPushnotification.updateAttributes({ iduser: 0 }).then(function (resUpdate) {
                    updatePushNotificationRedisValue(iduser);
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
        }).then(function (response) {
            if (response != null) {
                var objPushnotification = response;
                var iduser = iduser;
                objPushnotification.updateAttributes({ iduser: 0 }).then(function (resUpdate) {
                    updatePushNotificationRedisValue(iduser);
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

router.get('/MobileAppLoginScannerApp', jsonParser, function (req, res) {
    var Encryptpassword = jwt.encode(req.query.password, "bugz");
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
            $or: {
                username: req.query.username,
                email: req.query.username,
                phone: req.query.username,
            },
            password: Encryptpassword,
        },
        include: [{
            model: UserInRole,
            include: [{
                model: Role,
                attributes: ['id', 'RoleName'],
                where: {
                    RoleName: ['Super Admin', 'Scanner']
                }
            }]
        }],
    }).then(function (response) {
        if (response != null) {
            var lstRole = [];
            for (var i = 0; i < response.tbluserinroles.length; i++) {
                var objRole = response.tbluserinroles[i].tblrole.RoleName;
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
        } else {
            res.json({
                success: false,
                message: "Invalid Username or Password..."
            });
        }
    })
})

router.get('/CheckUserPassword', jsonParser, function (req, res) {
    var Encryptpassword = jwt.encode(req.query.password, "bugz");
    User.findOne({
        where: {
            username: req.query.username,
            password: Encryptpassword,
            idApp: req.query.idApp,
        }
    }).then(function (response) {
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

function updatePushNotificationRedisValue(id) {
    var query = "SELECT tv.deviceid " +
        " FROM tblvehicle tv " +
        " LEFT JOIN tblsharedevice tsd ON tv.id=tsd.idVehicle " +
        " where  (tv.iduser=" + id + " or tsd.iduser=" + id + ")  and tv.IsDelete = 0";
    connection.query(query, function (err, response, filed) {
        if (response) {
            for (var i = 0; i < response.length; i++) {
                Commonfunction.UpdateVehicleRedis(response[i].deviceid, 'PushNotification')
            }
        }
    })
}

function updateUserRedisValue(id) {
    Vehicle.findAll({ where: { iduser: id } }).then(function (response) {
        if (response) {
            for (var i = 0; i < response.length; i++) {
                Commonfunction.UpdateVehicleRedis(response[i].deviceid, 'User')
            }
        }
    })
}
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