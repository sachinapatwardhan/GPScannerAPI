//Tables
var router = express.Router();
var Currency = models.tblcurrency;
var User = models.tbluserinformation;

router.get('/GetCurrency', function(req, res) {
    Currency.findOne().then(function(response) {
        res.json(response);
    });
});

// 
router.post('/ManageCurrency', jsonParser, function(req, res) {
    objCurrency = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objCurrency.id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            Currency.create(objCurrency).then(function(response) {
                                funAuditLog.CreateAuditLog('ManageCurrency', UserExist.username , 'Create Currency');
                                res.json({
                                    success: true,
                                    message: "Currency created successfully...",
                                    data: response
                                });
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

                            Currency.update(objCurrency, { where: { id: objCurrency.id } }).then(function(response) {
                                if (response[0]) {
                                    res.json({ success: true, message: "Currency updated successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Record not found" });
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
});

module.exports = router
