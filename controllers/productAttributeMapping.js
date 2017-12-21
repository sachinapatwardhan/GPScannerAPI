//Tables
var router = express.Router();
var User = models.tbluserinformation;
var ProductAttributeMapping = models.product_productattribute_mapping;
var ProductAttribute = models.productattribute;
var ProductAttributeValue = models.productattributevalue;
var Product = models.product;
var Media = models.tblmediamgmt;
var ProductAttributeCombination = models.productattributecombination;
var tblproductattributecombinationtierprice = models.tblproductattributecombinationtierprice;
//End of Tables

router.get('/GetAllProductAttribute', function(req, res) {
    ProductAttribute.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllProductAttributeMappingByProductId', function(req, res) {

    ProductAttributeMapping.belongsTo(ProductAttribute, {
        foreignKey: {
            name: 'ProductAttributeId',
            allowNull: false
        }
    });

    ProductAttributeMapping.hasMany(ProductAttributeValue, {
        foreignKey: {
            name: 'ProductAttributeMappingId',
            allowNull: false
        }
    });

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

    ProductAttributeMapping.findAll({
        where: { ProductId: req.query.idProduct },
        include: [{
            model: ProductAttribute
        }, {
            model: ProductAttributeValue,
            include: [{
                model: Product,
                attributes: ['Id', 'Name']
            }, {
                model: Media,
                attributes: ['Id', 'FileName']
            }]
        }]
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetProductAttributeMappingById', function(req, res) {
    ProductAttributeMapping.findOne({ where: { Id: req.query.idProductAttributeMapping } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Product Attribute created successfully...", data: response });
        } else {
            res.json({ success: false, message: "Product Attribute is already Exist...", data: response });
        }
    })
})

router.post('/CreateProductAttributeMapping', jsonParser, function(req, res) {
    var objProductAttributeMapping = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objProductAttributeMapping.Id == 0) {
                    ProductAttributeMapping.findOrCreate({ where: { ProductAttributeId: objProductAttributeMapping.ProductAttributeId, ProductId: objProductAttributeMapping.ProductId }, defaults: objProductAttributeMapping }).then(function(response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('CreateProductAttributeMapping', UserExist.username, 'Create Product Attribute Mapping');
                            res.json({ success: true, message: "Product Attribute created successfully...", data: response });
                        } else {
                            res.json({ success: false, message: "Product Attribute is already Exist...", data: response });
                        }
                    })
                } else {
                    ProductAttributeMapping.findOne({ where: { ProductAttributeId: objProductAttributeMapping.ProductAttributeId, ProductId: objProductAttributeMapping.ProductId }, defaults: objProductAttributeMapping }).then(function(objProductAttributeMappingExist) {
                        if (objProductAttributeMappingExist != null && objProductAttributeMapping.Id != objProductAttributeMappingExist.Id) {
                            res.json({ success: false, data: objProductAttributeMappingExist, message: "Product Attribute is already Exist..." });
                        } else {
                            ProductAttributeMapping.update(objProductAttributeMapping, { where: { Id: objProductAttributeMapping.Id } }).then(function(resUpdate) {
                                if (resUpdate[0]) {
                                    funAuditLog.CreateAuditLog('CreateProductAttributeMapping', UserExist.username, 'Update Product Attribute Mapping');
                                    res.json({ success: true, data: resUpdate, message: "Product Attribute updated successfully..." });
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
});


router.get('/DeleteProductAttributeMapping', function(req, res) {
    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                ProductAttributeMapping.findOne({ where: { Id: req.query.idProductAttributeMapping } }).then(function(response) {
                    if (response != null) {
                        ProductAttributeValue.findAll({ where: { ProductAttributeMappingId: req.query.idProductAttributeMapping } }).then(function(response1) {
                            if (response1.length > 0) {
                                function uploader(j) {
                                    if (j < response1.length) {
                                        var idvalue = response1[j].Id.toString();
                                        ProductAttributeCombination.findAll().then(function(response2) {
                                                if (response2.length > 0) {
                                                    function uploaderprice(k) {
                                                        if (k < response2.length) {
                                                            if (response2[k].AttributeValueString != null && response2[k].AttributeValueString != '' && response2[k].AttributeValueString != undefined) {
                                                                var arrAttributeValueString = response2[k].AttributeValueString.split(',')
                                                                var idcombination = parseInt(response2[k].Id);
                                                                if (arrAttributeValueString.length > 0) {
                                                                    function arrAttruploader(l) {
                                                                        if (l < arrAttributeValueString.length) {
                                                                            var idfromsplit = parseInt(arrAttributeValueString[l]);
                                                                            if (idfromsplit == idvalue) {
                                                                                tblproductattributecombinationtierprice.destroy({ where: { ProductAttributeCombinationId: idcombination } }).then(function(combinationtierprice) {
                                                                                    ProductAttributeCombination.destroy({ where: { Id: idcombination } }).then(function(responsecombinationtierprice) {})
                                                                                })
                                                                                uploaderprice(k + 1);

                                                                            }
                                                                            arrAttruploader(l + 1);
                                                                        }
                                                                    }
                                                                    arrAttruploader(0);
                                                                }

                                                            }
                                                            uploaderprice(k + 1);
                                                        }
                                                    }
                                                    uploaderprice(0);
                                                }
                                            })
                                            // ProductAttributeCombination.findAll({ where: { AttributeValueString: { $like: '%' + id + '%' } } }).then(function(response2) {
                                            //     if (response2.length > 0) {
                                            //         function uploaderprice(k) {
                                            //             if (k < response2.length) {
                                            //                 var id1 = parseInt(response2[k].Id);
                                            //                 tblproductattributecombinationtierprice.destroy({ where: { ProductAttributeCombinationId: id1 } }).then(function(combinationtierprice) {
                                            //                     ProductAttributeCombination.destroy({ where: { Id: id1 } }).then(function(responsecombinationtierprice) {})
                                            //                 })
                                            //                 uploaderprice(k + 1);
                                            //             }
                                            //         }
                                            //         uploaderprice(0)
                                            //     }
                                            // })
                                        uploader(j + 1);
                                    } else {
                                        ProductAttributeMapping.destroy({ where: { Id: req.query.idProductAttributeMapping } }).then(function(response) {})
                                        ProductAttributeValue.destroy({ where: { ProductAttributeMappingId: req.query.idProductAttributeMapping } }).then(function(response) {
                                            funAuditLog.CreateAuditLog('DeleteProductAttributeMapping', UserExist.username, 'Delete Product Attribute');
                                            res.json({ success: true, message: "Product Attribute deleted successfully...", data: response });
                                        })
                                    }
                                }
                                uploader(0);
                            } else {
                                ProductAttributeMapping.destroy({
                                    where: {
                                        Id: req.query.idProductAttributeMapping
                                    }
                                }).then(function(response) {
                                    res.json({ success: true, message: "Product Attribute deleted successfully...", data: response });
                                })
                            }
                        })
                    } else {
                        res.json(RecordNotFound);
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
router.get('/GetAllProductAttributeMapping', function(req, res) {

    ProductAttributeMapping.belongsTo(ProductAttribute, {
        foreignKey: {
            name: 'ProductAttributeId',
            allowNull: false
        }
    });

    ProductAttributeMapping.hasMany(ProductAttributeValue, {
        foreignKey: {
            name: 'ProductAttributeMappingId',
            allowNull: false
        }
    });

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

    ProductAttributeMapping.findAll({
        include: [{
            model: ProductAttribute
        }, {
            model: ProductAttributeValue,
            include: [{
                model: Product,
                attributes: ['Id', 'Name']
            }, {
                model: Media,
                attributes: ['Id', 'FileName']
            }]
        }]
    }).then(function(response) {       
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})
module.exports = router
