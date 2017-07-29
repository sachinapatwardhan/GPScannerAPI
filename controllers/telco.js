var router = express.Router();
var TelCo = models.tbltelco;
var User = models.tbluserinformation;
var GPSDevice = models.tblgpsdevice;

router.get('/GetAllCompany', function(req, res) {
    TelCo.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.post('/SaveCompany', jsonParser, function(req, res) {
    objTelCo = req.body;
    objHeader = req.headers;
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
                if (objTelCo.id == 0) {
                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;
                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            objTelCo.CreatedDate = new Date();
                            objTelCo.CreatedBy = decoded.username;
                            TelCo.findOrCreate({
                                where: {
                                    Name: objTelCo.Name
                                },
                                defaults: objTelCo
                            }).then(function(response) {
                                if (response[1]) {
                                    funAuditLog.CreateAuditLog('SaveTelCo', UserExist.username, 'Create TelCo');
                                    res.json({
                                        success: true,
                                        message: "Telephone Company created successfully...",
                                        data: response
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Telephone Company is already Exist...",
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
                            objTelCo.ModifiedDate = new Date();
                            objTelCo.ModifiedBy = decoded.username;
                            TelCo.findOne({
                                where: {
                                    Name: objTelCo.Name
                                },
                                defaults: objTelCo
                            }).then(function(objTelCoExist) {
                                if (objTelCoExist != null && objTelCo.id != objTelCoExist.id) {
                                    res.json({
                                        success: false,
                                        message: "Telephone Company is already Exist...",
                                        data: objTelCoExist
                                    });
                                } else {
                                    TelCo.update(objTelCo, {
                                        where: {
                                            id: objTelCo.id
                                        }
                                    }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveTelCo', UserExist.username, 'Update TelCo');
                                            res.json({
                                                success: true,
                                                message: "Telephone Company updated successfully...",
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

router.get('/DeleteTelCompany', function(req, res) {
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
                        GPSDevice.findOne({
                            where: {
                                TelCoId: req.query.id
                            }
                        }).then(function(resExist) {
                            if (resExist != null) {
                                res.json(NotDeleteReferenceData);
                            } else {
                                TelCo.destroy({
                                    where: {
                                        id: req.query.id
                                    }
                                }).then(function(response) {
                                    if (response) {
                                        funAuditLog.CreateAuditLog('DeleteTelCo', UserExist.username, 'Delete TelCo');
                                        res.json({
                                            success: true,
                                            message: "Telephone Company deleted successfully...",
                                            data: response
                                        });
                                    } else {
                                        res.json(RecordNotFound);
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
});

module.exports = router