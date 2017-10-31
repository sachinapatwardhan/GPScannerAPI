//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Module = models.tblmodulemgmt;
var UserPermission = models.tbluserpermission;
//End of Tables

router.get('/GetAllModule', function(req, res) {
    Module.findAll({ where: { IsActive: true } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllModuleName', function(req, res) {
    Module.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetModuleById/:idModule', function(req, res) {
    Module.findOne({ where: { id: req.params.idModule } }).then(function(response) {
        if (response != null) {
            res.json(response);
        } else {
            res.json({ success: false, message: "Module not found..." });
        }
    })
})

router.post('/CreateModule', jsonParser, function(req, res) {
    objModule = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                Module.findOrCreate({ where: { Module: objModule.Module }, defaults: objModule }).then(function(response) {
                    if ((response[1])) {
                        funAuditLog.CreateAuditLog('CreateModule', UserExist.username, 'Create Module');
                        res.json({ success: true, message: "Module created successfully..." });
                    } else {
                        res.json({ success: false, message: "Module is already Exist..." });
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

router.post('/UpdateModule', jsonParser, function(req, res) {
    console.log(req.query)
    objModule = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                Module.update(objModule, { where: { id: objModule.id } }).then(function(response) {
                    if (response[0]) {
                        funAuditLog.CreateAuditLog('UpdateModule', UserExist.username, 'Update Module');
                        res.json({ success: true, message: "Module updated successfully..." });
                    } else {
                        res.json({ success: false, message: "Module not Found..." });
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

router.get('/DeleteModule/:idModule', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                UserPermission.findOne({ where: { idModule: req.params.idModule } }).then(function(UserPermissionExits) {
                    if (UserPermissionExits) {
                        res.json({ success: false });
                    } else {
                        Module.destroy({ where: { id: req.params.idModule } }).then(function(response) {
                            if (response) {

                                funAuditLog.CreateAuditLog('DeleteModule', UserExist.username, 'Delete Module');
                                res.json({ success: true, message: "Module deleted successfully..." });
                            } else {
                                res.json({ success: false, message: "Requested Module not Exist..." });
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
});


router.get('/DeleteModuleAndpermission/:idModule', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                UserPermission.destroy({ where: { idModule: req.params.idModule } }).then(function(userDeleted) {
                    Module.destroy({ where: { id: req.params.idModule } }).then(function(response) {
                        if (response) {
                            funAuditLog.CreateAuditLog('DeleteModule', UserExist.username, 'Delete Module');
                            res.json({ success: true, message: "Module deleted successfully..." });
                        } else {
                            res.json({ success: false, message: "Requested Module not Exist..." });
                        }
                    })
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});


module.exports = router