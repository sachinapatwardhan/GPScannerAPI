//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Product = models.product;
var Media = models.tblmediamgmt;
var ProductAttributeValue = models.productattributevalue;
var Product_ProductAttribute_Mapping = models.product_productattribute_mapping;
var ProductAttribute = models.productattribute;
//End of Tables

router.get('/GetProductAttributeValues', function(req, res) {
    ProductAttributeValue.belongsTo(Product, {
        foreignKey: {
            name: 'AssociatedProductId',
            allowNull: false
        }
    });
    ProductAttributeValue.belongsTo(Media, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });
    ProductAttributeValue.belongsTo(Product_ProductAttribute_Mapping, {
        foreignKey: {
            name: 'ProductAttributeMappingId',
            allowNull: false
        }
    });
    Product_ProductAttribute_Mapping.belongsTo(ProductAttribute, {
        foreignKey: {
            name: 'ProductAttributeId',
            allowNull: false
        }
    });
    ProductAttributeValue.findAll({
        where: { ProductAttributeMappingId: req.query.ProductAttributeMappingId },
        include: [{
            model: Product,
            attributes: ['Id', 'Name']
        }, {
            model: Media,
            attributes: ['Id', 'FileName']
        }, {
            model: Product_ProductAttribute_Mapping,
            include: [{
                model: ProductAttribute
            }]
        }]
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.post('/SaveProductAttributeValue', jsonParser, function(req, res) {
    objProductAttributeValue = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objProductAttributeValue.Id == 0) {
                    ProductAttributeValue.findOne({ where: { Name: objProductAttributeValue.Name, ProductAttributeMappingId: objProductAttributeValue.ProductAttributeMappingId } }).then(function(objProductAttributeValueExist) {
                        if (objProductAttributeValueExist != null && objProductAttributeValue.Id != objProductAttributeValueExist.Id) {
                            res.json({ success: false, message: "Product Attribute Value is already Exist..." });
                        } else {
                            if (objProductAttributeValue.IsPreSelected == true) {
                                ProductAttributeValue.findAll({ where: { ProductAttributeMappingId: objProductAttributeValue.ProductAttributeMappingId, IsPreSelected: true } }).then(function(resProductAttributeValue) {
                                    if (resProductAttributeValue != null) {
                                        for (var i = 0; i < resProductAttributeValue.length; i++) {
                                            resProductAttributeValue[i].updateAttributes({ IsPreSelected: false }).then(function(response) {})
                                        }
                                    }
                                })
                            }
                            ProductAttributeValue.create(objProductAttributeValue).then(function(response) {
                                funAuditLog.CreateAuditLog('SaveProductAttributeValue', UserExist.username, 'Create Product Attribute Value');
                                res.json({ success: true, message: "Product Attribute Value created successfully...", data: response });
                            })
                        }
                    })
                } else {
                    ProductAttributeValue.findOne({ where: { Name: objProductAttributeValue.Name, ProductAttributeMappingId: objProductAttributeValue.ProductAttributeMappingId } }).then(function(objProductAttributeValueExist) {
                        if (objProductAttributeValueExist != null && objProductAttributeValue.Id != objProductAttributeValueExist.Id) {
                            res.json({ success: false, message: "Product Attribute Value is already Exist..." });
                        } else {
                            if (objProductAttributeValue.IsPreSelected == true) {
                                ProductAttributeValue.findAll({ where: { ProductAttributeMappingId: objProductAttributeValue.ProductAttributeMappingId, IsPreSelected: true } }).then(function(resProductAttributeValue) {
                                    if (resProductAttributeValue != null) {
                                        for (var i = 0; i < resProductAttributeValue.length; i++) {
                                            resProductAttributeValue[i].updateAttributes({ IsPreSelected: false }).then(function(response) {})
                                        }
                                    }
                                })
                            }
                            ProductAttributeValue.update(objProductAttributeValue, { where: { Id: objProductAttributeValue.Id } }).then(function(response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('SaveProductAttributeValue', UserExist.username, 'Update Product Attribute Value');
                                    res.json({ success: true, message: "Product Attribute Value updated successfully...", data: response });
                                }
                            })
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


router.get('/DeleteProductAttributeValue', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                ProductAttributeValue.destroy({ where: { Id: req.query.idProductAttributeValue } }).then(function(response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeleteProductAttributeValue', UserExist.username, 'Delete Product Attribute Value');
                        res.json({ success: true, message: "Product Attribute Value deleted successfully...", data: response });
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
});

module.exports = router