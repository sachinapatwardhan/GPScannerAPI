//Tables
var router = express.Router();
var Setting = models.tblsetting;
var User = models.tbluserinformation;

router.get('/GetAllSetting', function(req, res) {
    Setting.findAll().then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json({ success: false, data: err });
    })
})


router.post('/SaveSetting', jsonParser, function(req, res) {
    var objSetting = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objSetting.id == 0) {

                    //set Parameter
                    Setting.findOrCreate({ where: { Name: objSetting.Name }, defaults: objSetting }).then(function(response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('Create Setting', UserExist.username, 'Save Setting');
                            res.json({ success: true, message: "Setting created successfully...", data: response });
                        } else {
                            res.json({ success: false, message: "Setting is already Exist...", data: response });
                        }
                    })

                } else {
                    console.log(objSetting.Name)
                        //set Parameter
                    Setting.findOne({ where: { Name: { $like: '%' + objSetting.Name + '%' } }, defaults: objSetting }).then(function(objSettingExist) {
                        if (objSettingExist != null && objSetting.Name != objSettingExist.Name) {
                            res.json({ success: false, message: "Setting is already Exist...", data: objSettingExist });
                        } else {
                            var obj = new Object();
                            obj.Value = objSetting.Value;
                            obj.StoreId = objSetting.StoreId;
                            Setting.update(obj, { where: { Name: { $like: '%' + objSetting.Name + '%' } } }).then(function(response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('Update Setting ', UserExist.username, 'Update Seting');
                                    res.json({ success: true, message: "Setting updated successfully...", data: response });
                                }
                            })
                        }
                    })
                }
            } else {
                res.json({
                    success: false,
                    InvalidToken: true,
                    data: InvalidToken,
                });
            }
        })
    } else {
        res.json({
            success: false,
            InvalidToken: true,
            data: InvalidToken,
        });
    }
})



router.get('/DeleteSettingeById', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {

                Setting.destroy({
                    where: { Name: req.query.Name }
                }).then(function(response) {
                    if (response != null) {
                        funAuditLog.CreateAuditLog('Delete Setting', UserExist.username, 'Delete Setting');
                        res.json({ success: true, message: "Setting deleted successfully...", data: response });
                    } else {
                        res.json({ success: true, message: "Setting not deleted successfully...", data: response });
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


module.exports = router