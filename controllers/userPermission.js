//Tables
var router = express.Router();
var User = models.tbluserinformation;
var UserPermission = models.tbluserpermission;
var Module = models.tblmodulemgmt;
var Role = models.tblrole;
var UserInRole = models.tbluserinrole;
//End of Tables

router.get('/GetAllPermissionByRole', function(req, res) {
    UserPermission.belongsTo(Module, {
        foreignKey: {
            name: 'idModule',
            allowNull: false
        }
    });
    UserPermission.findAll({
        where: { RoleName: req.query.RoleName },
        include: [{
            model: Module
        }]
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.post('/ChangePermission', jsonParser, function(req, res) {
    objUserPermission = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                var idPermission = 0;
                UserPermission.findOne({ where: { idModule: objUserPermission.idModule, RoleName: objUserPermission.RoleName }, defaults: objUserPermission }).then(function(objUserPermissionExist) {
                    if (objUserPermissionExist != null) {
                        idPermission = objUserPermissionExist.id;
                    }
                    if (idPermission != 0) {
                        objUserPermission.id = idPermission;
                        UserPermission.update(objUserPermission, { where: { id: objUserPermission.id, idModule: objUserPermission.idModule } }).then(function(response) {
                            if (response[0]) {
                                funAuditLog.CreateAuditLog('ChangePermission', UserExist.username, 'Update User Permission');
                                res.json({ success: true, message: "User Permission updated successfully...", data: response });
                            }
                        })
                    } else {
                        UserPermission.create(objUserPermission).then(function(response) {
                            funAuditLog.CreateAuditLog('ChangePermission', UserExist.username, 'Create User Permission');
                            res.json({ success: true, message: "User Permission created successfully...", data: response });
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


router.post('/ChangeAllPermissions', jsonParser, function(req, res) {
    objUserPermission = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                var objPermission = new Object();
                if (objUserPermission.Type == "View") {
                    objPermission = { Show: objUserPermission.Show };
                } else if (objUserPermission.Type == "Add") {
                    objPermission = { Added: objUserPermission.Show };
                } else if (objUserPermission.Type == "Update") {
                    objPermission = { Modified: objUserPermission.Show };
                } else {
                    objPermission = { Deleted: objUserPermission.Show };
                }

                function uploader(i) {
                    if (i < objUserPermission.Data.length) {
                        var idPermission = 0;
                        UserPermission.findOne({ where: { idModule: objUserPermission.Data[i].idModule, RoleName: objUserPermission.RoleName }, defaults: objUserPermission.Data[i] }).then(function(objUserPermissionExist) {
                            if (objUserPermissionExist != null) {
                                idPermission = objUserPermissionExist.id;
                            }
                            if (idPermission != 0) {
                                objUserPermission.Data[i].id = idPermission;
                                objUserPermissionExist.updateAttributes(objPermission).then(function(response) {
                                    uploader(i + 1);
                                })
                            } else {
                                var obj = new Object();
                                if (objUserPermission.Type == "View") {
                                    obj = { idModule: objUserPermission.Data[i].idModule, RoleName: objUserPermission.RoleName, Show: objUserPermission.Show };
                                } else if (objUserPermission.Type == "Add") {
                                    obj = { idModule: objUserPermission.Data[i].idModule, RoleName: objUserPermission.RoleName, Added: objUserPermission.Show };
                                } else if (objUserPermission.Type == "Update") {
                                    obj = { idModule: objUserPermission.Data[i].idModule, RoleName: objUserPermission.RoleName, Modified: objUserPermission.Show };
                                } else {
                                    obj = { idModule: objUserPermission.Data[i].idModule, RoleName: objUserPermission.RoleName, Deleted: objUserPermission.Show };
                                }
                                UserPermission.create(obj).then(function(response) {
                                    if (response != null) {
                                        uploader(i + 1)
                                    } else {
                                        funAuditLog.CreateAuditLog('ChangeAllPermissions', UserExist.username, 'Create All User Permission');
                                        res.json({ success: true, message: "User Permission created successfully...", data: response });
                                    }
                                })
                            }
                        })
                    } else {
                        funAuditLog.CreateAuditLog('ChangeAllPermissions', UserExist.username, 'Update All User Permission');
                        res.json({ success: true, message: "User Permission updated successfully..." });
                    }
                }
                uploader(0);
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/CheckRights', function(req, res) {
    objHeader = req.headers;

    var PermissionFlag = false;
    var token = getToken(objHeader);

    if (token) {
        var objUser = jwt.decode(token, TokenKey);
        if (objUser) {
            var search = {};
            search['$and'] = [];

            var obj = new Object();
            obj['username'] = {
                $eq: objUser.username
            };
            search['$and'].push(obj);

            var obj1 = new Object();
            obj1['password'] = {
                $eq: objUser.password
            };
            search['$and'].push(obj1);

            if (req.query.idApp != null && req.query.idApp != '' && req.query.idApp != undefined) {
                var obj2 = new Object();
                obj2['idApp'] = {
                    $eq: req.query.idApp
                };
                search['$and'].push(obj2);
            }
            //Check User Exist or not
            User.findOne({ where: search }).then(function(UserExist) {

                if (UserExist != null) {

                    var tablename = req.query.tablename;
                    var permission = req.query.permission;
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
                                                        res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                                    } else {
                                                        uploader(i + 1);
                                                    }
                                                } else if (permission == "Show") {
                                                    if (objUserPermission.Show == true) {
                                                        res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                                    } else {
                                                        uploader(i + 1);
                                                    }
                                                } else if (permission == "Modified") {
                                                    if (objUserPermission.Modified == true) {
                                                        res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                                    } else {
                                                        uploader(i + 1);
                                                    }
                                                } else if (permission == "Deleted") {
                                                    if (objUserPermission.Deleted == true) {
                                                        res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
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
                                        res.json({ success: false, message: "No Permission to Access...", data: "" });
                                    }
                                }
                                uploader(0);

                                if (strRole.length == 0) {
                                    res.json({ success: false, message: "No Permission to Access...", data: "" });
                                };

                            })
                        } else {
                            res.json({ success: false, message: "No Permission to Access...", data: "" });
                        }
                    })
                } else {
                    res.json(InvalidToken);
                }
            })
        } else {
            res.json(InvalidToken);
        };
    } else {
        res.json(InvalidToken);
    }
});

router.get('/GetAllPageRights', function(req, res) {
    objHeader = req.headers;

    var PermissionFlag = false;
    var token = getToken(objHeader);
    if (token) {
        var objUser = jwt.decode(token, TokenKey);

        var search = {};
        search['$and'] = [];

        var obj = new Object();
        obj['username'] = {
            $eq: objUser.username
        };
        search['$and'].push(obj);

        var obj1 = new Object();
        obj1['password'] = {
            $eq: objUser.password
        };
        search['$and'].push(obj1);

        if (req.query.idApp != null && req.query.idApp != '' && req.query.idApp != undefined) {
            var obj2 = new Object();
            obj2['idApp'] = {
                $eq: req.query.idApp
            };
            search['$and'].push(obj2);
        }
        if (objUser) {
            //Check User Exist or not
            User.findOne({ where: search }).then(function(UserExist) {
                if (UserExist != null) {
                    // var tablename = req.query.tablename;
                    // var permission = req.query.permission;
                    var username = objUser.username;
                    //Get Module
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
                        var lstUserRole = [];
                        for (var i = 0; i < strRole.length; i++) {
                            lstUserRole.push(strRole[i].tblrole.RoleName);
                        }


                        if (lstUserRole.length > 0) {
                            UserPermission.belongsTo(Module, {
                                foreignKey: {
                                    name: 'idModule',
                                    allowNull: false
                                }
                            });
                            UserPermission.findAll({
                                where: { Show: true, RoleName: { $in: lstUserRole } },
                                include: [{
                                    model: Module,
                                    attributes: ['DisplayOrder', 'Module']
                                }]
                            }).then(function(lstUserPermission) {
                                if (lstUserPermission.length > 0) {
                                    res.json({ success: true, message: "Permission to Access...", data: lstUserPermission });
                                    // if (permission == "Added") {
                                    //     if (objUserPermission.Added == true) {
                                    //         res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                    //     } else {
                                    //         uploader(i + 1);
                                    //     }
                                    // } else if (permission == "Show") {
                                    //     if (objUserPermission.Show == true) {
                                    //         res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                    //     } else {
                                    //         uploader(i + 1);
                                    //     }
                                    // } else if (permission == "Modified") {
                                    //     if (objUserPermission.Modified == true) {
                                    //         res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                    //     } else {
                                    //         uploader(i + 1);
                                    //     }
                                    // } else if (permission == "Deleted") {
                                    //     if (objUserPermission.Deleted == true) {
                                    //         res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                    //     } else {
                                    //         uploader(i + 1);
                                    //     }
                                    // } else {
                                    //     uploader(i + 1);
                                    // }
                                } else {
                                    res.json({ success: false, message: "No Permission to Access...", data: [] });
                                }
                            })
                        } else {
                            res.json({ success: false, message: "No Permission to Access...", data: [] });
                        }


                    })

                } else {
                    res.json(InvalidToken);
                }
            })
        } else {
            res.json(InvalidToken);
        };
    } else {
        res.json(InvalidToken);
    }
});

router.get('/CheckRightsbyPage', function(req, res) {
    objHeader = req.headers;

    var PermissionFlag = false;
    var token = getToken(objHeader);

    if (token) {
        var objUser = jwt.decode(token, TokenKey);
        var search = {};
        search['$and'] = [];

        var obj = new Object();
        obj['username'] = {
            $eq: objUser.username
        };
        search['$and'].push(obj);

        var obj1 = new Object();
        obj1['password'] = {
            $eq: objUser.password
        };
        search['$and'].push(obj1);

        if (req.query.idApp != null && req.query.idApp != '' && req.query.idApp != undefined) {
            var obj2 = new Object();
            obj2['idApp'] = {
                $eq: req.query.idApp
            };
            search['$and'].push(obj2);
        }

        if (objUser) {
            //Check User Exist or not
            User.findOne({ where: search }).then(function(UserExist) {
                if (UserExist != null) {
                    var tablename = req.query.tablename;
                    // var permission = req.query.permission;
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

                                // function uploader(i) {
                                //     if (i < strRole.length) {

                                var lstUserRole = [];
                                for (var i = 0; i < strRole.length; i++) {
                                    lstUserRole.push(strRole[i].tblrole.RoleName);
                                }

                                if (lstUserRole.length > 0) {
                                    UserPermission.findOne({ where: { idModule: objModule.id, RoleName: { $in: lstUserRole } } }).then(function(objUserPermission) {
                                        if (objUserPermission != null) {
                                            res.json({ success: true, message: "Permission to Access...", data: objUserPermission });
                                            // if (permission == "Added") {
                                            //     if (objUserPermission.Added == true) {
                                            //         res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                            //     } else {
                                            //         uploader(i + 1);
                                            //     }
                                            // } else if (permission == "Show") {
                                            //     if (objUserPermission.Show == true) {
                                            //         res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                            //     } else {
                                            //         uploader(i + 1);
                                            //     }
                                            // } else if (permission == "Modified") {
                                            //     if (objUserPermission.Modified == true) {
                                            //         res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                            //     } else {
                                            //         uploader(i + 1);
                                            //     }
                                            // } else if (permission == "Deleted") {
                                            //     if (objUserPermission.Deleted == true) {
                                            //         res.json({ success: true, message: "Permission to Access...", order: objModule.DisplayOrder });
                                            //     } else {
                                            //         uploader(i + 1);
                                            //     }
                                            // } else {
                                            //     uploader(i + 1);
                                            // }
                                        } else {
                                            // uploader(i + 1);
                                            res.json({ success: false, message: "No Permission to Access...", data: null });
                                        }
                                    })

                                } else {
                                    res.json({ success: false, message: "No Permission to Access...", data: null });
                                }
                                //     } else {
                                //         res.json({ success: false, message: "No Permission to Access...", data: "" });
                                //     }
                                // }
                                // uploader(0);

                                // if (strRole.length == 0) {
                                //     res.json({ success: false, message: "No Permission to Access...", data: "" });
                                // };

                            })
                        } else {
                            res.json({ success: false, message: "No Permission to Access...", data: null });
                        }
                    })
                } else {
                    res.json(InvalidToken);
                }
            })
        } else {
            res.json(InvalidToken);
        };
    } else {
        res.json(InvalidToken);
    }
});
module.exports = router