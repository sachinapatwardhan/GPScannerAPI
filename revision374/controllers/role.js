//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Role = models.tblrole;
 var UserInRole = models.tbluserinrole;
//End of Tables

router.get('/GetAllRole', function (req, res) {
    Role.findAll().then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})

router.get('/GetRoleById', function (req, res) {
    Role.findOne({ where: { id: req.query.idRole } }).then(function (response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        }
        else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveRole', jsonParser, function (req, res) {
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                objRole = req.body;
                if (objRole.id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            Role.findOrCreate({ where: { RoleName: objRole.RoleName }, defaults: objRole }).then(function (response) {
                                if ((response[1])) {
                                    funAuditLog.CreateAuditLog('SaveRole', UserExist.username , 'Create Role');
                                    res.json({ success: true, message: "Role created successfully...", data: response });
                                }
                                else {
                                    res.json({ success: false, message: "Role is already Exist...", data: response });
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

                            Role.findOne({ where: { RoleName: objRole.RoleName }, defaults: objRole }).then(function (objRoleExist) {
                                if (objRoleExist != null && objRole.id != objRoleExist.id) {
                                    res.json({ success: false, message: "Role is already Exist...", data: objRoleExist });
                                }
                                else {
                                    Role.update(objRole, { where: { id: objRole.id } }).then(function (response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveRole', UserExist.username , 'Update Role');
                                            res.json({ success: true, message: "Role updated successfully...", data: response });
                                        }
                                    })
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                }
            }
            else {
                res.json(InvalidToken);
            }
        })
    }
    else {
        res.json(InvalidToken);
    }
})

router.get('/DeleteRole', function (req, res) {
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
                User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
                    if (UserExist != null) {
                        UserInRole.findOne({ where: { roleId: req.query.idRole } }).then(function (resUserInRole) {
                            if (resUserInRole == null) {
                        Role.destroy({ where: { id: req.query.idRole } }).then(function (response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('DeleteRole', UserExist.username , 'Delete Role');
                                res.json({ success: true, message: "Role deleted successfully...", data: response });
                            }
                            else {
                                res.json({ success: false, message: "Requested Record not Exist....", data: response });
                            }
                        })
                    } else {
                        res.json(NotDeleteReferenceData);
                    }
                })
                    }
                    else {
                        res.json(InvalidToken);
                    }
                })
            }
            else {
                res.json(InvalidToken);
            }
        } else {
            res.json(NoAccessPermission);
        }
    });
});

module.exports = router
