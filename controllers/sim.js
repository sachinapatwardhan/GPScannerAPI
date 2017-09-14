var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var SIM = models.tblsimdetails;
//End of Tables

router.get('/GetAllSIMInfo', function(req, res) {
    SIM.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
});

router.post('/SaveSIMInfo', jsonParser, function(req, res) {
    objSIMInfo = req.body;
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
                if (objSIMInfo.Id == 0) {
                    objSIMInfo.CreatedDate = new Date();
                    // SIM.findOrCreate({ where: { AppName: objSIMInfo.AppName }, defaults: objSIMInfo }).then(function(response) {
                    SIM.create(objSIMInfo).then(function(response) {
                        if (response) {
                            // funAuditLog.CreateAuditLog('SaveSIMInfo', decoded.username, 'Create SIMInfo');
                            res.json({
                                success: true,
                                message: "SIM Info created successfully...",
                                data: response
                            });
                        } else {
                            res.json({
                                success: false,
                                message: "SIm Info is already Exist...",
                                data: response
                            });
                        }
                    })
                } else {
                    SIM.update(objSIMInfo, {
                        where: {
                            Id: objSIMInfo.Id
                        }
                    }).then(function(response) {
                        if (response[0]) {
                            // funAuditLog.CreateAuditLog('SaveVehicle', decoded.username, 'Update Vehicle');
                            res.json({
                                success: true,
                                message: "SIM Info updated successfully...",
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

router.get('/DeleteSIMInfo', function(req, res) {
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

                    SIM.destroy({
                        where: {
                            id: req.query.Id
                        }
                    }).then(function(response) {
                        if (response) {
                            funAuditLog.CreateAuditLog('DeleteSim', UserExist.username, 'Delete SIm');
                            res.json({
                                success: true,
                                message: "SIM deleted successfully...",
                                data: response
                            });
                        } else {
                            res.json(RecordNotFound);
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: "Select SIm To delete",
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