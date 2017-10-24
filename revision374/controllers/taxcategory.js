//Tables
var router = express.Router();
var User = models.tbluserinformation;
var TaxCategory = models.taxcategory;
//End of Tables

router.get('/GetAllTaxCategory', function(req, res) {
    TaxCategory.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetTaxCategoryById', function(req, res) {
    TaxCategory.findOne({ where: { Id: req.query.idTaxCategory } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveTaxCategory', jsonParser, function(req, res) {
    objTaxCategory = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objTaxCategory.Id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {


                            TaxCategory.findOrCreate({ where: { Name: objTaxCategory.Name }, defaults: objTaxCategory }).then(function(response) {
                                if ((response[1])) {
                                    res.json({ success: true, message: "Tax Category created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Tax Category is already Exist...", data: response });
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

                            TaxCategory.findOne({ where: { Name: objTaxCategory.Name }, defaults: objTaxCategory }).then(function(objTaxCategoryExist) {
                                if (objTaxCategoryExist != null && objTaxCategory.Id != objTaxCategoryExist.Id) {
                                    res.json({ success: false, message: "Tax Category is already Exist...", data: objTaxCategoryExist });
                                } else {
                                    TaxCategory.update(objTaxCategory, { where: { Id: objTaxCategory.Id } }).then(function(response) {
                                        if (response[0]) {
                                            res.json({ success: true, message: "Tax Category updated successfully...", data: response });
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

router.get('/DeleteTaxCategory', function(req, res) {
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
                User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
                    if (UserExist != null) {
                        TaxCategory.destroy({ where: { Id: req.query.idTaxCategory } }).then(function(response) {
                            if (response) {
                                res.json({ success: true, message: "Tax Category deleted successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "Requested Record not Exist....", data: response });
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
