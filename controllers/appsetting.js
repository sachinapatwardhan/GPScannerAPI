var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var AppVersion = models.tblappversion;
var AppInfo = models.tblappinfo;
//End of Tables

router.get('/GetAllAppName', function(req, res) {
    var query = "select * from tblappinfo where AppName not in (select Name from tblappversion)";
    connection.query(query, function(err, rows, fields) {
            if (!err) {
                res.json({ success: true, data: rows });
            } else {
                res.json({ success: false, data: [] });
            }
        })
        // AppInfo.findAll().then(function(response) {
        //     res.json(response);
        // }).catch(function(error) {
        //     res.json(error);
        // })
});

router.get('/GetAllAppVersion', function(req, res) {
    AppVersion.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
});

router.get('/GetAppVersionByName', function(req, res) {
    AppVersion.findOne({ where: { Name: req.query.Name } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
});



router.post('/SaveAppVesionInfo', jsonParser, function(req, res) {
    objAppVersion = req.body;
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
                if (objAppVersion.id == 0) {
                    AppVersion.create(objAppVersion).then(function(response) {
                        if (response) {
                            res.json({
                                success: true,
                                message: "App Version created successfully...",
                                data: response
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "App Version is already Exist...",
                                data: response
                            });
                        }
                    })
                } else {
                    AppVersion.update(objAppVersion, {
                        where: {
                            id: objAppVersion.id
                        }
                    }).then(function(response) {
                        if (response[0]) {
                            // funAuditLog.CreateAuditLog('SaveVehicle', decoded.username, 'Update Vehicle');
                            res.json({
                                success: true,
                                message: "App Version updated successfully...",
                                data: response
                            });
                        }
                    })
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/DeleteAppVersion', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    if (token) {
        var decoded = jwt.decode(token, TokenKey);


        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (req.query.Id != '' && req.query.Id != null) {

                    AppVersion.destroy({
                        where: {
                            id: req.query.Id
                        }
                    }).then(function(response) {
                        if (response) {
                            funAuditLog.CreateAuditLog('DeleteSim', UserExist.username, 'Delete SIm');
                            res.json({
                                success: true,
                                message: "App Version successfully...",
                                data: response
                            });
                        } else {
                            res.json(RecordNotFound);
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: "App Version To delete",
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
module.exports = router