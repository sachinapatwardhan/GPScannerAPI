//Tables
var router = express.Router();
var User = models.tbluserinformation;
var ProductAttribute = models.productattribute;
var ProductAttributeMapping = models.product_productattribute_mapping;
//End of Tables

router.get('/GetAllProductAttribute', function(req, res) {
    ProductAttribute.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetProductAttributeById', function(req, res) {
    ProductAttribute.findOne({ where: { Id: req.query.idProductAttribute } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveProductAttribute', jsonParser, function(req, res) {
    objProductAttribute = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objProductAttribute.Id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;
                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            ProductAttribute.findOrCreate({ where: { Name: objProductAttribute.Name }, defaults: objProductAttribute }).then(function(response) {
                                if ((response[1])) {
                                    funAuditLog.CreateAuditLog('SaveProductAttribute', UserExist.username, 'Create  Attribute');
                                    res.json({ success: true, message: "Attribute created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Attribute is already Exist...", data: response });
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

                            ProductAttribute.findOne({ where: { Name: objProductAttribute.Name }, defaults: objProductAttribute }).then(function(objProductAttributeExist) {
                                if (objProductAttributeExist != null && objProductAttribute.Id != objProductAttributeExist.Id) {
                                    res.json({ success: false, message: "Attribute is already Exist...", data: objProductAttributeExist });
                                } else {
                                    ProductAttribute.update(objProductAttribute, { where: { Id: objProductAttribute.Id } }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveProductAttribute', UserExist.username, 'Update Attribute');
                                            res.json({ success: true, message: "Attribute updated successfully...", data: response });
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

router.get('/DeleteProductAttribute', function(req, res) {
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
                User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
                    if (UserExist != null) {
                        ProductAttributeMapping.findOne({ where: { ProductAttributeId: req.query.idProductAttribute } }).then(function(response) {
                            if (response == null) {
                                ProductAttribute.destroy({ where: { Id: req.query.idProductAttribute } }).then(function(response) {
                                    if (response) {
                                        funAuditLog.CreateAuditLog('DeleteProductAttribute', UserExist.username, 'Delete Attribute');
                                        res.json({ success: true, message: "Attribute deleted successfully...", data: response });
                                    } else {
                                        res.json({ success: false, message: "Requested Record not Exist....", data: response });
                                    }
                                })
                            } else {
                                res.json({ success: false, message: "This Record Can't Deleted, It Contain References to other data...", data: response });
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