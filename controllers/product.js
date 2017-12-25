//var nodeExcel = require('excel-export');

//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Product = models.product;
var ProductTag = models.producttag;
var ProductACL = models.aclrecord;
// var ProductStore = models.storemapping;
var ProductApplyDiscount = models.discount_appliedtoproducts;
var ProductPictureMaping = models.product_picture_mapping;
var MediaMgmt = models.tblmediamgmt;
var ProductCategory = models.product_category_mapping;
var Category = models.tblcategorymgmt;
var ProductManufacturer = models.product_manufacturer_mapping;
var ProductAttributeMaping = models.product_productattribute_mapping;
var ProductAttributeMapping = models.product_productattribute_mapping;
var ProductAttributeValue = models.productattributevalue;
var ProductAttribute = models.productattribute;
var ProductSpecificationAttribute = models.product_specificationattribute_mapping;
var ProductAttributeCombination = models.productattributecombination;
var ProductTierPrice = models.tierprice;
var RelatedProduct = models.relatedproduct;
var CrossSellProduct = models.crosssellproduct;
var CombinationTierPrice = models.tblproductattributecombinationtierprice;
var Role = models.tblrole;
var Setting = models.tblsetting
var AppInfo = models.tblappinfo;

//End of Tables
router.get('/GetAllProduct', function (req, res) {

    var model = [];
    var search = {};

    var Published = req.query.Published;
    var Name = req.query.Name;

    var CategoryId = req.query.CategoryId;
    var VendorId = req.query.VendorId;
    var WarehouseId = req.query.WarehouseId;
    var Sku = req.query.Sku;
    var ProductTypeId = req.query.ProductTypeId;
    var ManufacturerId = req.query.ManufacturerId;
    var StoreId = req.query.StoreId;
    // var ProductTypeId = req.query.ProductTypeId;

    var objParam = req.query;
    var objOrder = objParam.order;
    var objColumns = objParam.columns;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;

    var objSearch = objParam.search.value;
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];

        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                var obj = new Object();
                obj[columnName] = {
                    $like: '%' + objSearch + '%'
                };
                search['$or'].push(obj);
            };
        };
    }

    search['$and'] = [];

    var obj = new Object();
    obj['Deleted'] = {
        $ne: true
    };
    search['$and'].push(obj);

    if (Published == 0) {
        var obj = new Object();
        obj['Published'] = {
            $like: 0
        };
        search['$and'].push(obj);

    } else if (Published == 1) {
        var obj = new Object();
        obj['Published'] = {
            $like: 1
        };
        search['$and'].push(obj);
    }

    if (Name != null && Name != '') {
        var obj = new Object();
        obj['Name'] = {
            $like: '%' + Name + '%'
        };
        search['$and'].push(obj);
    }

    if (VendorId > 0) {
        var obj = new Object();
        obj['VendorId'] = {
            $like: VendorId
        };
        search['$and'].push(obj);
    }

    if (WarehouseId > 0) {
        var obj = new Object();
        obj['WarehouseId'] = {
            $like: WarehouseId
        };
        search['$and'].push(obj);
    }

    if (ProductTypeId != null && ProductTypeId != '') {
        var obj = new Object();
        obj['ProductTypeId'] = {
            $like: ProductTypeId
        };
        search['$and'].push(obj);
    }

    if (Sku != null && Sku != '') {
        var obj = new Object();
        obj['Sku'] = {
            $like: Sku
        };
        search['$and'].push(obj);
    }

    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });

    Product.hasMany(ProductTag, {
        foreignKey: {
            name: 'Product_Id',
            allowNull: false
        }
    });

    Product.belongsTo(AppInfo, {
        foreignKey: {
            name: 'ProductTypeId',
            allowNull: false
        }
    });
    model.push({
        model: AppInfo,
        attributes: ['id', 'AppName']
    });

    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });
    model.push({
        model: ProductPictureMaping,
        include: [MediaMgmt]
    }, {
            model: ProductTag,
            attributes: ['Name']
        });

    if (CategoryId > 0) {
        Product.hasMany(ProductCategory, {
            foreignKey: {
                name: 'ProductId',
                allowNull: false
            }
        });
        model.push({
            model: ProductCategory,
            where: {
                CategoryId: CategoryId
            }
        });
    }

    if (ManufacturerId > 0) {
        Product.hasMany(ProductManufacturer, {
            foreignKey: {
                name: 'ProductId',
                allowNull: false
            }
        });
        model.push({
            model: ProductManufacturer,
            where: {
                ManufacturerId: ManufacturerId
            }
        });
    }

    if (StoreId > 0) {
        // Product.hasMany(ProductStore, {
        //     foreignKey: {
        //         name: 'EntityId',
        //         allowNull: false
        //     }
        // });
        // model.push({
        //     model: ProductStore,
        //     where: {
        //         StoreId: StoreId,
        //         EntityName: "Product"
        //     }
        // });
    }
    // // order: 'CreatedOnUtc DESC',
    // Product.findAll({ include: model, order: 'CreatedOnUtc DESC', where: search }).then(function(response) {
    //     res.json(response);
    // }).catch(function(error) {
    //     res.json(error);
    // })
    var offset = (req.query.PageNo * 10) - 10;
    // 'CreatedOnUtc DESC',
    Product.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
        include: model
    }).then(function (response) {
        // res.json({ success: true, response: response });
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function (error) {
        res.json({
            success: false,
            response: error
        });
    })
})


router.get('/GetExpiryProductByName', function (req, res) {
    Product.findOne({
        where: { Name: "Expiry Product" },
        attributes: ['Id', 'Name'],
    }).then(function (response) {
        if (response != null) {
            res.json({ success: true, response: response });
        } else {
            res.json({ success: false, response: "Record not found..." });
        }
    })
})



//Get Product By Id For FrontSide
router.get('/GetProductById', function (req, res) {
    var model = [];
    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });

    Product.hasMany(ProductTag, {
        foreignKey: {
            name: 'Product_Id',
            allowNull: false
        }
    });

    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });
    //
    Product.hasMany(RelatedProduct, {
        foreignKey: {
            name: 'ProductId1',
            allowNull: false
        }
    });

    RelatedProduct.belongsTo(Product, {
        foreignKey: {
            name: 'ProductId2',
            allowNull: false
        }
    });
    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });
    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });

    model.push({
        model: ProductPictureMaping,
        include: [MediaMgmt]
    }, {
            model: ProductTag,
            attributes: ['Name']
        }, {
            model: RelatedProduct,
            include: [{
                model: Product,
                include: {
                    model: ProductPictureMaping,
                    include: [MediaMgmt]
                }
            }]
        });
    Product.findAll({
        where: {
            Id: req.query.idProduct
        },
        include: model
        // include: [{
        //     model: ProductPictureMaping,
        //     include: [MediaMgmt]
        // }]

    }).then(function (response) {
        if (response != null) {
            res.json({
                success: true,
                response: response
            });
        } else {
            res.json({
                success: false,
                response: "Record not found..."
            });
        }

    })
})


//Get Product By Id For FrontSide
router.get('/GetProductByIdForPreview', function (req, res) {
    // Product.hasMany(ProductPictureMaping, {
    //     foreignKey: {
    //         name: 'ProductId',
    //         allowNull: false
    //     }
    // });
    //
    // ProductPictureMaping.belongsTo(MediaMgmt, {
    //     foreignKey: {
    //         name: 'PictureId',
    //         allowNull: false
    //     }
    // });
    var model = [];
    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });

    Product.hasMany(ProductTag, {
        foreignKey: {
            name: 'Product_Id',
            allowNull: false
        }
    });

    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });
    //
    Product.hasMany(RelatedProduct, {
        foreignKey: {
            name: 'ProductId1',
            allowNull: false
        }
    });

    RelatedProduct.belongsTo(Product, {
        foreignKey: {
            name: 'ProductId2',
            allowNull: false
        }
    });
    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });
    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });

    model.push({
        model: ProductPictureMaping,
        include: [MediaMgmt],
        require: false
    }, {
            model: ProductTag,
            attributes: ['Name'],
            require: false
        }, {
            model: RelatedProduct,
            include: [{
                model: Product,
                include: {
                    model: ProductPictureMaping,
                    include: [MediaMgmt],
                    require: false
                },
                require: false
            }],
            require: false
        });
    Product.findAll({
        where: {
            Id: req.query.idProduct
        },
        include: model
        // include: [{
        //     model: ProductPictureMaping,
        //     include: [MediaMgmt]
        // }]

    }).then(function (response) {
        if (response != null) {
            res.json({
                success: true,
                response: response
            });
        } else {
            res.json({
                success: false,
                response: "Record not found..."
            });
        }

    })
})


//Get Product By Published and Deleted for FrontSide
router.get('/GetPublishProduct', function (req, res) {
    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });

    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });


    Product.findAll({
        where: {
            Published: 1,
            Deleted: 0,
            ProductTypeId: 0
        },
        include: [{
            model: ProductPictureMaping,
            include: [MediaMgmt]
        }]
    }).then(function (response) {
        if (response != null) {
            res.json({
                success: true,
                response: response
            });
        } else {
            res.json({
                success: false,
                response: "Record not found..."
            });
        }
    })
})

//Create and Update Product
router.post('/CreateProductPanel', jsonParser, function (req, res) {

    var objProduct = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                var ProductTags = objProduct.ProductTags;
                var ACL = objProduct.ACL;
                var Store = objProduct.Store;
                var ApplyDiscount = objProduct.ApplyDiscount;

                if (objProduct.Id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            objProduct.CreatedOnUtc = new Date();
                            Product.findOrCreate({
                                where: {
                                    Name: objProduct.Name,
                                    ProductTypeId: parseInt(objProduct.ProductTypeId),
                                },
                                defaults: objProduct
                            }).then(function (response) {

                                if ((response[1])) {
                                    var ProductId = response[0].Id;
                                    manageProductTag(ProductId, ProductTags);
                                    manageProductACL(ProductId, ACL);
                                    manageProductStore(ProductId, Store);
                                    manageProductApplyDiscount(ProductId, ApplyDiscount);

                                    funAuditLog.CreateAuditLog('CreateProductPanel', UserExist.username, 'Create Product');
                                    res.json({
                                        success: true,
                                        data: ProductId,
                                        message: "Product created successfully..."
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Product is already Exist..."
                                    });
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {

                    // var CategoryId = objCategory.id;

                    //set Parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            objProduct.UpdatedOnUtc = new Date();
                            var ProductId = objProduct.Id;
                            Product.findOne({
                                where: {
                                    Name: objProduct.Name,
                                    ProductTypeId: parseInt(objProduct.ProductTypeId),
                                },
                                defaults: objProduct
                            }).then(function (objProductExist) {
                                if (objProductExist != null && objProduct.Id != objProductExist.Id) {
                                    res.json({
                                        success: false,
                                        response: objProductExist,
                                        message: "Product is already Exist..."
                                    });
                                } else {
                                    Product.update(objProduct, {
                                        where: {
                                            Id: ProductId
                                        }
                                    }).then(function (resUpdate) {
                                        if (resUpdate[0]) {
                                            manageProductTag(ProductId, ProductTags);
                                            manageProductACL(ProductId, ACL);
                                            manageProductStore(ProductId, Store);
                                            manageProductApplyDiscount(ProductId, ApplyDiscount);
                                            funAuditLog.CreateAuditLog('CreateProductPanel', UserExist.username, 'Update Product');
                                            res.json({
                                                success: true,
                                                data: ProductId,
                                                message: "Product updated successfully..."
                                            });
                                        } else {
                                            res.json({
                                                success: true,
                                                data: ProductId,
                                                message: "Product updated successfully..."
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

router.post('/CopyProduct', jsonParser, function (req, res) {
    var objProduct = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    req.query['permission'] = "Modified";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({
                    where: {
                        username: decoded.username,
                        password: decoded.password
                    }
                }).then(function (UserExist) {
                    if (UserExist != null) {
                        var oldProductId = objProduct.Id;
                        objProduct.Id = 0;
                        objProduct.Name = objProduct.Name + "_copy";

                        var ProductTags = objProduct.ProductTags;
                        var ACL = objProduct.ACL;
                        var Store = objProduct.Store;
                        var ApplyDiscount = objProduct.ApplyDiscount;

                        Product.findOrCreate({
                            where: {
                                Name: objProduct.Name
                            },
                            defaults: objProduct
                        }).then(function (response) {

                            if ((response[1])) {
                                var ProductId = response[0].Id;
                                manageProductTag(ProductId, ProductTags);
                                manageProductACL(ProductId, ACL);
                                manageProductStore(ProductId, Store);
                                manageProductApplyDiscount(ProductId, ApplyDiscount);

                                manageProductCategoryMapping(oldProductId, ProductId);
                                manageProductManufacturerMapping(oldProductId, ProductId);
                                manageProductSpecificationAttributeMapping(oldProductId, ProductId);
                                manageProductAttributeMapping(oldProductId, ProductId);
                                manageProductAttributeCombination(oldProductId, ProductId);
                                manageTierPrice(oldProductId, ProductId);
                                manageProductPictureMapping(oldProductId, ProductId);
                                manageRelatedProduct(oldProductId, ProductId);
                                manageCrossSellProduct(oldProductId, ProductId);

                                funAuditLog.CreateAuditLog('CopyProduct', UserExist.username, 'Create Product');
                                res.json({
                                    success: true,
                                    data: ProductId,
                                    message: "Product created successfully..."
                                });
                            } else {
                                res.json({
                                    success: false,
                                    message: "Product is already Exist..."
                                });
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
})

router.get('/UpdateProduct', jsonParser, function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                var objProduct = req.body;
                Product.update(objProduct, {
                    where: {
                        Id: objProduct.Id
                    }
                }).then(function (response) {
                    if (response[0]) {
                        funAuditLog.CreateAuditLog('UpdateProduct', UserExist.username, 'Update Product');
                        res.json({
                            success: true,
                            message: "Product updated successfully...",
                            data: response
                        });
                    } else {
                        res.json({
                            success: true,
                            message: "Product not found...",
                            data: response
                        });
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

router.post('/DeleteProduct', jsonParser, function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    var objProduct = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    req.query['permission'] = "Deleted";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({
                    where: {
                        username: decoded.username,
                        password: decoded.password
                    }
                }).then(function (UserExist) {
                    if (UserExist != null) {
                        var objProduct = req.body;
                        if (objProduct != null) {
                            objProduct.Published = false;
                            objProduct.Deleted = true;
                            Product.update(objProduct, {
                                where: {
                                    Id: objProduct.Id
                                }
                            }).then(function (resProduct) {
                                if (resProduct[0]) {
                                    funAuditLog.CreateAuditLog('DeleteProduct', UserExist.username, 'Delete Product');
                                    res.json({
                                        success: true,
                                        message: "Product deleted successfully..."
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Requested Record not Exist...."
                                    });
                                }
                            })
                        } else {
                            res.json({
                                success: false,
                                message: "Requested Record not Exist...."
                            });
                        }
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

//Private functions
function manageProductTag(ProductId, arrProductTags) {
    // var arrProductTags = [];
    var lstProductTags = [];
    // arrProductTags = strProductTags.split(",");
    for (var i = 0; i < arrProductTags.length; i++) {
        var objProductTag = {
            Name: arrProductTags[i].text,
            Product_Id: ProductId
        };
        lstProductTags.push(objProductTag);
    }

    //Delete all Product tags for this Product
    ProductTag.destroy({
        where: {
            Product_Id: ProductId
        }
    }).then(function (resDestroyProductTag) {
        //Insert all new Product tags for this Product
        ProductTag.bulkCreate(lstProductTags).then(function (resCreateProductTag) { })
    })
}

function manageProductACL(ProductId, arrProductACL) {
    // var arrProductACL = [];
    var lstProductACL = [];
    // arrProductACL = strProductACL.split(",");
    for (var i = 0; i < arrProductACL.length; i++) {
        var objProductACL = {
            RoleId: arrProductACL[i].id,
            EntityId: ProductId,
            EntityName: "Product"
        };
        lstProductACL.push(objProductACL);
    }

    //Delete all Product tags for this Product
    ProductACL.destroy({
        where: {
            EntityId: ProductId,
            EntityName: "Product"
        }
    }).then(function (resDestroyProductACL) {
        //Insert all new Product tags for this Product
        ProductACL.bulkCreate(lstProductACL).then(function (resCreateProductACL) { })
    })
}

function manageProductStore(ProductId, arrProductStore) {
    // // var arrProductStore = [];
    // var lstProductStore = [];
    // // arrProductStore = strProductStore.split(",");
    // for (var i = 0; i < arrProductStore.length; i++) {
    //     var objProductStore = {
    //         StoreId: arrProductStore[i].Id,
    //         EntityId: ProductId,
    //         EntityName: "Product"
    //     };
    //     lstProductStore.push(objProductStore);
    // }
    //
    // //Delete all Product tags for this Product
    // ProductStore.destroy({
    //     where: {
    //         EntityId: ProductId,
    //         EntityName: "Product"
    //     }
    // }).then(function(resDestroyProductStore) {
    //     //Insert all new Product tags for this Product
    //     ProductStore.bulkCreate(lstProductStore).then(function(resCreateProductStore) {})
    // })
}

function manageProductApplyDiscount(ProductId, arrProductApplyDiscount) {
    // // var arrProductApplyDiscount = [];
    // var lstProductApplyDiscount = [];
    // // arrProductApplyDiscount = strProductApplyDiscount.split(",");
    // for (var i = 0; i < arrProductApplyDiscount.length; i++) {
    //     var objProductApplyDiscount = {
    //         Discount_Id: arrProductApplyDiscount[i].Id,
    //         Product_Id: ProductId
    //     };
    //     lstProductApplyDiscount.push(objProductApplyDiscount);
    // }
    //
    // //Delete all Product tags for this Product
    // ProductApplyDiscount.destroy({
    //     where: {
    //         Product_Id: ProductId
    //     }
    // }).then(function(resDestroyProductApplyDiscount) {
    //     //Insert all new Product tags for this Product
    //     ProductApplyDiscount.bulkCreate(lstProductApplyDiscount).then(function(resCreateProductApplyDiscount) {})
    // })
}

router.get('/UpdateProductPrice', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    req.query['permission'] = "Modified";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({
                    where: {
                        username: decoded.username,
                        password: decoded.password
                    }
                }).then(function (UserExist) {
                    if (UserExist != null) {
                        var model = [];
                        var search = {};

                        var Published = req.query.Publish;
                        var Name = req.query.Name;
                        var CategoryId = req.query.CategoryId;
                        var VendorId = req.query.VendorId;
                        var WarehouseId = req.query.WarehouseId;
                        var Sku = req.query.Sku;
                        var ProductTypeId = req.query.ProductTypeId;
                        var ManufacturerId = req.query.ManufacturerId;
                        var StoreId = req.query.StoreId;
                        var Percentage = req.query.Percentage;
                        var Amount = req.query.Amount;

                        if (Percentage != 0 || Amount != 0) {
                            search['Deleted'] = {
                                $ne: true
                            };

                            if (Published == 0) {
                                search['Published'] = {
                                    $like: 0
                                };
                            } else if (Published == 1) {
                                search['Published'] = {
                                    $like: 1
                                };
                            }

                            if (Name != null && Name != '') {
                                search['Name'] = {
                                    $like: '%' + Name + '%'
                                };
                            }

                            if (VendorId > 0) {
                                search['VendorId'] = {
                                    $like: VendorId
                                };
                            }

                            if (WarehouseId > 0) {
                                search['WarehouseId'] = {
                                    $like: WarehouseId
                                };
                            }

                            if (ProductTypeId > 0) {
                                search['ProductTypeId'] = {
                                    $like: ProductTypeId
                                };
                            }

                            if (Sku != null && Sku != '') {
                                search['Sku'] = {
                                    $like: Sku
                                };
                            }

                            Product.hasMany(ProductPictureMaping, {
                                foreignKey: {
                                    name: 'ProductId',
                                    allowNull: false
                                }
                            });

                            Product.hasMany(ProductTag, {
                                foreignKey: {
                                    name: 'Product_Id',
                                    allowNull: false
                                }
                            });

                            ProductPictureMaping.belongsTo(MediaMgmt, {
                                foreignKey: {
                                    name: 'PictureId',
                                    allowNull: false
                                }
                            });
                            model.push({
                                model: ProductPictureMaping,
                                include: [MediaMgmt]
                            }, {
                                    model: ProductTag,
                                    attributes: ['Name']
                                });

                            if (CategoryId > 0) {
                                Product.hasMany(ProductCategory, {
                                    foreignKey: {
                                        name: 'ProductId',
                                        allowNull: false
                                    }
                                });
                                model.push({
                                    model: ProductCategory,
                                    where: {
                                        CategoryId: CategoryId
                                    }
                                });
                            }

                            if (ManufacturerId > 0) {
                                Product.hasMany(ProductManufacturer, {
                                    foreignKey: {
                                        name: 'ProductId',
                                        allowNull: false
                                    }
                                });
                                model.push({
                                    model: ProductManufacturer,
                                    where: {
                                        ManufacturerId: ManufacturerId
                                    }
                                });
                            }

                            if (StoreId > 0) {
                                Product.hasMany(ProductStore, {
                                    foreignKey: {
                                        name: 'EntityId',
                                        allowNull: false
                                    }
                                });
                                model.push({
                                    model: ProductStore,
                                    where: {
                                        StoreId: StoreId,
                                        EntityName: "Product"
                                    }
                                });
                            }



                            Product.findAll({
                                include: model,
                                order: 'CreatedOnUtc DESC',
                                where: search
                            }).then(function (response) {
                                function uploader(i) {
                                    if (i < response.length) {

                                        var objProduct = response[i];

                                        var NewPrice = 0;
                                        var oldPrice = 0;

                                        if (objProduct.Price != null) {
                                            oldPrice = parseFloat(objProduct.Price);
                                        }

                                        if (Percentage != 0) {
                                            var discount = 0;
                                            discount = (parseFloat(oldPrice) * parseFloat(Percentage)) / 100;
                                            NewPrice = parseFloat(oldPrice) + discount;
                                        } else {
                                            NewPrice = parseFloat(oldPrice) + parseFloat(Amount);
                                        }

                                        // objProduct.Price = NewPrice;

                                        objProduct.updateAttributes({
                                            Price: NewPrice
                                        }).then(function (resUpdate) {
                                            if ((i + 1) == response.length) {
                                                funAuditLog.CreateAuditLog('UpdateProductPrice', UserExist.username, 'Update Product Price');
                                                res.json({
                                                    success: true,
                                                    message: "Product Prices Updated successfully..."
                                                });
                                            } else {
                                                uploader(i + 1);
                                            };
                                        })
                                    }
                                }
                                uploader(0);
                            }).catch(function (error) {
                                res.json(error);
                            })

                        } else {
                            funAuditLog.CreateAuditLog('UpdateProductPrice', UserExist.username, 'Update Product Price');
                            res.json({
                                success: true,
                                message: "Product Prices Updated successfully..."
                            });
                        }
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
})

router.get('/UpdateProductPublish', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                var model = [];
                var search = {};

                var Published = req.query.Publish;
                var Name = req.query.Name;
                var CategoryId = req.query.CategoryId;
                var VendorId = req.query.VendorId;
                var WarehouseId = req.query.WarehouseId;
                var Sku = req.query.Sku;
                var ProductTypeId = req.query.ProductTypeId;
                var ManufacturerId = req.query.ManufacturerId;
                var StoreId = req.query.StoreId;
                var UpdatePublish = req.query.UpdatePublish;


                search['Deleted'] = {
                    $ne: true
                };

                if (Published == 0) {
                    search['Published'] = {
                        $like: 0
                    };
                } else if (Published == 1) {
                    search['Published'] = {
                        $like: 1
                    };
                }

                if (Name != null && Name != '') {
                    search['Name'] = {
                        $like: '%' + Name + '%'
                    };
                }

                if (VendorId > 0) {
                    search['VendorId'] = {
                        $like: VendorId
                    };
                }

                if (WarehouseId > 0) {
                    search['WarehouseId'] = {
                        $like: WarehouseId
                    };
                }

                if (ProductTypeId > 0) {
                    search['ProductTypeId'] = {
                        $like: ProductTypeId
                    };
                }

                if (Sku != null && Sku != '') {
                    search['Sku'] = {
                        $like: Sku
                    };
                }

                Product.hasMany(ProductPictureMaping, {
                    foreignKey: {
                        name: 'ProductId',
                        allowNull: false
                    }
                });

                Product.hasMany(ProductTag, {
                    foreignKey: {
                        name: 'Product_Id',
                        allowNull: false
                    }
                });

                ProductPictureMaping.belongsTo(MediaMgmt, {
                    foreignKey: {
                        name: 'PictureId',
                        allowNull: false
                    }
                });
                model.push({
                    model: ProductPictureMaping,
                    include: [MediaMgmt]
                }, {
                        model: ProductTag,
                        attributes: ['Name']
                    });

                if (CategoryId > 0) {
                    Product.hasMany(ProductCategory, {
                        foreignKey: {
                            name: 'ProductId',
                            allowNull: false
                        }
                    });
                    model.push({
                        model: ProductCategory,
                        where: {
                            CategoryId: CategoryId
                        }
                    });
                }

                if (ManufacturerId > 0) {
                    Product.hasMany(ProductManufacturer, {
                        foreignKey: {
                            name: 'ProductId',
                            allowNull: false
                        }
                    });
                    model.push({
                        model: ProductManufacturer,
                        where: {
                            ManufacturerId: ManufacturerId
                        }
                    });
                }

                if (StoreId > 0) {
                    Product.hasMany(ProductStore, {
                        foreignKey: {
                            name: 'EntityId',
                            allowNull: false
                        }
                    });
                    model.push({
                        model: ProductStore,
                        where: {
                            StoreId: StoreId,
                            EntityName: "Product"
                        }
                    });
                }

                Product.findAll({
                    include: model,
                    order: 'CreatedOnUtc DESC',
                    where: search
                }).then(function (response) {


                    function uploader(i) {
                        if (i < response.length) {

                            var objProduct = response[i];

                            // var NewPrice = 0;
                            // var oldPrice = 0;

                            // if (objProduct.Price != null) {
                            //     oldPrice = parseFloat(objProduct.Price);
                            // }

                            // if (Percentage != 0) {
                            //     var discount = 0;
                            //     discount = (parseFloat(oldPrice) * parseFloat(Percentage)) / 100;
                            //     NewPrice = parseFloat(oldPrice) + discount;
                            // } else {
                            //     NewPrice = parseFloat(oldPrice) + parseFloat(Amount);
                            // }

                            // objProduct.Price = NewPrice;

                            //Set Parameter for User Permission
                            req.query['tablename'] = req.headers['x-requested-with'];
                            req.query['permission'] = "Modified";

                            var obj = {};
                            obj.headers = req.headers;
                            obj.query = req.query;

                            funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
                                var AccessPermission = responseAccessPermission.success;
                                if (AccessPermission) {

                                    objProduct.updateAttributes({
                                        Published: UpdatePublish
                                    }).then(function (resUpdate) {
                                        if ((i + 1) == response.length) {

                                            if (UpdatePublish == 'true') {
                                                funAuditLog.CreateAuditLog('UpdateProductPublish', UserExist.username, 'Product(s) Published');
                                                res.json({
                                                    success: true,
                                                    message: "Product(s) Published successfully..."
                                                });
                                            } else {
                                                funAuditLog.CreateAuditLog('UpdateProductPublish', UserExist.username, 'Product(s) UnPublished');
                                                res.json({
                                                    success: true,
                                                    message: "Product(s) UnPublished successfully..."
                                                });
                                            }
                                        } else {
                                            uploader(i + 1);
                                        };
                                    })
                                } else {
                                    res.json(NoAccessPermission);
                                }
                            });
                        }
                    }
                    uploader(0);


                }).catch(function (error) {
                    res.json(error);
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/DownloadExcelTemplate', function (req, res) {
    // objHeader = req.headers;
    // var token = getToken(objHeader);
    // if (token) {
    //     var decoded = jwt.decode(token, TokenKey);
    //     User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
    //         if (UserExist != null) {
    var conf = {};
    conf.name = "sheet1";
    conf.cols = [{
        caption: 'No',
        type: 'string'
    }, {
        caption: 'Name',
        type: 'string'
    }, {
        caption: 'Price',
        type: 'string'
    }, {
        caption: 'OldPrice',
        type: 'string'
    }, {
        caption: 'Stock',
        type: 'string'
    }, {
        caption: 'Weight',
        type: 'string'
    }, {
        caption: 'Length',
        type: 'string'
    }, {
        caption: 'PWidth',
        type: 'string'
    }, {
        caption: 'Height',
        type: 'string'
    }, {
        caption: 'Picture',
        type: 'string'
    }, {
        caption: 'AttributePrice',
        type: 'string'
    }, {
        caption: 'AttributeOldPrice',
        type: 'string'
    }];

    ProductAttribute.findAll().then(function (response) {
        if (response != null) {
            for (var i = 0; i < response.length; i++) {
                var objData = u.findWhere(conf.cols, {
                    caption: response[i].Name
                });
                if (objData == null || objData == undefined) {
                    var obj = new Object();
                    obj.caption = response[i].Name;
                    obj.type = "string";

                    conf.cols.push(obj)
                };
            };
        }
        var row = [];
        for (var i = 0; i < conf.cols.length; i++) {
            row.push('');
        };
        conf.rows = [];
        conf.rows.push(row);
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Product_Template.xlsx");
        res.end(result, 'binary');
    })

    // conf.rows = [
    //     ['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14],
    //     ["e", new Date(2012, 4, 1), false, 2.7182],
    //     ["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
    //     ["null date", null, true, 1.414]
    // ];
    // } else {
    //     res.json(InvalidToken);
    // }
    // })
    // }
    // else {
    //     res.json(InvalidToken);
    // }
})


router.get('/ExportProducts', function (req, res) {
    // objHeader = req.headers;
    // var token = getToken(objHeader);
    // if (token) {
    //     var decoded = jwt.decode(token, TokenKey);
    //     User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
    //         if (UserExist != null) {
    // var CategoryId = req.query.CategoryId;
    var CategoryId = '';
    var lstProduct = [];
    // var ObjProduct = {
    //     sku: '',
    //     Name: '',
    //     Category: '',
    //     SubCategory: '',
    //     ProductCost: '',
    //     Price: '',
    //     OldPrice: '',
    //     Stock: '',
    //     Weight: '',
    //     Length: '',
    //     Width: '',
    //     Height: '',
    //     Picture: ''
    // }

    var conf = {};
    // conf.stylesXmlFile = "styles.xml";
    // conf.name = "sheet1";

    conf.cols = [{
        caption: 'No',
        type: 'string'
    }, {
        caption: 'Name',
        type: 'string'
    }, {
        caption: 'Price',
        type: 'string'
    }, {
        caption: 'OldPrice',
        type: 'string'
    }, {
        caption: 'Stock',
        type: 'string'
    }, {
        caption: 'Weight',
        type: 'string'
    }, {
        caption: 'Length',
        type: 'string'
    }, {
        caption: 'PWidth',
        type: 'string'
    }, {
        caption: 'Height',
        type: 'string'
    }, {
        caption: 'Picture',
        type: 'string'
    }, {
        caption: 'AttributePrice',
        type: 'string'
    }, {
        caption: 'AttributeOldPrice',
        type: 'string'
    }];


    Product.hasMany(ProductAttributeMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });

    ProductAttributeMaping.belongsTo(ProductAttribute, {
        foreignKey: {
            name: 'ProductAttributeId',
            allowNull: false
        }
    });

    ProductAttributeMaping.hasMany(ProductAttributeValue, {
        foreignKey: {
            name: 'ProductAttributeMappingId',
            allowNull: false
        }
    });

    Product.hasMany(ProductCategory, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });

    ProductCategory.belongsTo(Category, {
        foreignKey: {
            name: 'CategoryId',
            allowNull: false
        }
    });

    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });


    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });
    var include = [];

    include.push({
        model: ProductPictureMaping,
        include: [{
            model: MediaMgmt,
            attributes: ['FileName']
        }]
    });

    if (CategoryId > 0) {

        include.push({
            model: ProductCategory,
            where: {
                CategoryId: CategoryId
            },
            include: [{
                model: Category,
                attributes: ['id', 'Name', 'Title']
            }]
        });
    } else {
        include.push({
            model: ProductCategory,
            include: [{
                model: Category,
                attributes: ['id', 'Name', 'Title']
            }]
        });
    }

    include.push({
        model: ProductAttributeMaping,
        include: [{
            model: ProductAttribute,
            attributes: ['Name']
        }, {
            model: ProductAttributeValue
        }]
    });

    var SearchExport = "";

    if (req.query.SearchExport == 'UnPublish') {
        SearchExport = {
            Deleted: {
                $ne: true
            },
            Published: {
                $ne: true
            }
        }
    } else {
        SearchExport = {
            Deleted: {
                $eq: false
            },
            Published: {
                $like: 1
            }
        }
    }
    Product.findAll({
        include: include,
        order: 'CreatedOnUtc DESC',
        where: SearchExport
    }).then(function (response) {
        conf.rows = [];
        var lstProduct = [];
        // i -uploaderproduct
        // j -uploaderproductcat
        // k -manageproductcat
        // l -uploadSubcat
        if (response.length > 0) {
            function uploaderproduct(i) {
                if (i < response.length) {
                    //Manage Product Category
                    // var lstproductCat = [];
                    // if (response[i].product_category_mappings != undefined && response[i].product_category_mappings != null && response[i].product_category_mappings.length > 0) {
                    //     function uploaderproductcat(j) {
                    //         if (j < response[i].product_category_mappings.length) {
                    //             var obj = new Object();
                    //             obj.CategoryId = response[i].product_category_mappings[j].CategoryId;
                    //             obj.CategoryName = response[i].product_category_mappings[j].tblcategorymgmt.Name;
                    //             lstproductCat.push(obj);
                    //             uploaderproductcat(j + 1);
                    //         }
                    //     }
                    //     uploaderproductcat(0)
                    // }
                    // if (lstproductCat.length > 0) {
                    //     var CategoryName = "";
                    //     var SubCategory = "";
                    //     var CategoryId = "";

                    //     function manageproductcat(k) {
                    //         if (k < lstproductCat.length) {
                    //             CategoryName = lstproductCat[k].CategoryName;
                    //             SubCategory = "";
                    //             CategoryId = parseInt(lstproductCat[k].CategoryId);

                    //             Category.findAll({
                    //                 where: {
                    //                     Parent: CategoryId,
                    //                 }
                    //             }).then(function(responsesubcat) {
                    //                 if (responsesubcat.length > 0) {
                    //                     function uploadSubcat(l) {
                    //                         if (l < responsesubcat.length) {
                    //                             var objcat = u.findWhere(lstproductCat, {
                    //                                 CategoryId: parseInt(responsesubcat[l].id)
                    //                             });
                    // if (objcat != null && objcat != undefined && objcat != '') {
                    //     var subcat = objcat.CategoryName;
                    //     // //Remove Parrent Cat if Sub Cate Exists
                    //     // if (SubCategory != null && SubCategory != '') {
                    //     //     SubCategory = SubCategory + ',' + subcat;
                    //     // } else {
                    //     //     SubCategory = subcat;
                    //     // }
                    //     SubCategory = subcat;
                    //     if (lstproductCat.length > 0) {
                    //         lstproductCat = u.filter(lstproductCat, function(o) {
                    //             if (o.CategoryId != parseInt(responsesubcat[l].id)) {
                    //                 return o;
                    //             }
                    //         });
                    //     }
                    // }
                    //if (l + 1 == responsesubcat.length) {
                    //                                 if (response[i].product_picture_mappings.length > 0) {
                    //                                     function uploadimage(j) {
                    //                                         if (j < response[i].product_picture_mappings.length) {
                    //                                             var object = new Object();
                    //                                             object["ProductId"] = response[i].Id;
                    //                                             object["sku"] = response[i].Sku;
                    //                                             object["Name"] = response[i].Name.toString();
                    //                                             object["CategoryName"] = CategoryName;
                    //                                             object["SubCategory"] = SubCategory;
                    //                                             object["ProductCost"] = response[i].ProductCost.toString();
                    //                                             object["Price"] = response[i].Price.toString();
                    //                                             object["OldPrice"] = response[i].OldPrice.toString();
                    //                                             object["Stock"] = response[i].StockQuantity.toString();
                    //                                             object["Weight"] = response[i].Weight.toString();
                    //                                             object["Length"] = response[i].Length.toString();
                    //                                             object["PWidth"] = response[i].Width.toString();
                    //                                             object["Height"] = response[i].Height.toString();
                    //                                             object["Picture"] = RoutePath + 'MediaUploads/' + response[i].product_picture_mappings[j].tblmediamgmt.FileName;
                    //                                             lstProduct.push(object);
                    //                                             uploadimage(j + 1);
                    //                                         }
                    //                                     }
                    //                                     uploadimage(0);
                    //                                 } else {
                    //                                     var object = new Object();
                    //                                     object["ProductId"] = response[i].Id;
                    //                                     object["sku"] = response[i].Sku;
                    //                                     object["Name"] = response[i].Name.toString();
                    //                                     object["CategoryName"] = CategoryName;
                    //                                     object["SubCategory"] = SubCategory;
                    //                                     object["ProductCost"] = response[i].ProductCost.toString();
                    //                                     object["Price"] = response[i].Price.toString();
                    //                                     object["OldPrice"] = response[i].OldPrice.toString();
                    //                                     object["Stock"] = response[i].StockQuantity.toString();
                    //                                     object["Weight"] = response[i].Weight.toString();
                    //                                     object["Length"] = response[i].Length.toString();
                    //                                     object["PWidth"] = response[i].Width.toString();
                    //                                     object["Height"] = response[i].Height.toString();
                    //                                     object["Picture"] = '';
                    //                                     lstProduct.push(object);
                    //                                 }
                    //                                 manageproductcat(k + 1);
                    //                             } else {
                    //                                 uploadSubcat(l + 1);
                    //                             }
                    //                         }
                    //                     }
                    //                     uploadSubcat(0);

                    //                 } else {
                    //                     if (response[i].product_picture_mappings.length > 0) {
                    //                         function uploadimage(j) {
                    //                             if (j < response[i].product_picture_mappings.length) {
                    //                                 var object = new Object();
                    //                                 object["ProductId"] = response[i].Id;
                    //                                 object["sku"] = response[i].Sku;
                    //                                 object["Name"] = response[i].Name.toString();
                    //                                 object["CategoryName"] = CategoryName;
                    //                                 object["SubCategory"] = SubCategory;
                    //                                 object["ProductCost"] = response[i].ProductCost.toString();
                    //                                 object["Price"] = response[i].Price.toString();
                    //                                 object["OldPrice"] = response[i].OldPrice.toString();
                    //                                 object["Stock"] = response[i].StockQuantity.toString();
                    //                                 object["Weight"] = response[i].Weight.toString();
                    //                                 object["Length"] = response[i].Length.toString();
                    //                                 object["PWidth"] = response[i].Width.toString();
                    //                                 object["Height"] = response[i].Height.toString();
                    //                                 object["Picture"] = RoutePath + 'MediaUploads/' + response[i].product_picture_mappings[j].tblmediamgmt.FileName;
                    //                                 lstProduct.push(object);
                    //                                 uploadimage(j + 1);
                    //                             }
                    //                         }
                    //                         uploadimage(0);
                    //                     } else {
                    //                         var object = new Object();
                    //                         object["ProductId"] = response[i].Id;
                    //                         object["sku"] = response[i].Sku;
                    //                         object["Name"] = response[i].Name.toString();
                    //                         object["CategoryName"] = CategoryName;
                    //                         object["SubCategory"] = SubCategory;
                    //                         object["ProductCost"] = response[i].ProductCost.toString();
                    //                         object["Price"] = response[i].Price.toString();
                    //                         object["OldPrice"] = response[i].OldPrice.toString();
                    //                         object["Stock"] = response[i].StockQuantity.toString();
                    //                         object["Weight"] = response[i].Weight.toString();
                    //                         object["Length"] = response[i].Length.toString();
                    //                         object["PWidth"] = response[i].Width.toString();
                    //                         object["Height"] = response[i].Height.toString();
                    //                         object["Picture"] = '';
                    //                         lstProduct.push(object);
                    //                     }
                    //                     manageproductcat(k + 1);
                    //                 }
                    //             });
                    //         } else {
                    //             uploaderproduct(i + 1);
                    //         }
                    //     }
                    //     manageproductcat(0);

                    // } else {
                    //     if (response[i].product_picture_mappings.length > 0) {
                    //         function uploadimage(j) {
                    //             if (j < response[i].product_picture_mappings.length) {
                    //                 var object = new Object();
                    //                 object["ProductId"] = response[i].Id;
                    //                 object["sku"] = response[i].Sku;
                    //                 object["Name"] = response[i].Name.toString();
                    //                 object["CategoryName"] = "";
                    //                 object["SubCategory"] = "";
                    //                 object["ProductCost"] = response[i].ProductCost.toString();
                    //                 object["Price"] = response[i].Price.toString();
                    //                 object["OldPrice"] = response[i].OldPrice.toString();
                    //                 object["Stock"] = response[i].StockQuantity.toString();
                    //                 object["Weight"] = response[i].Weight.toString();
                    //                 object["Length"] = response[i].Length.toString();
                    //                 object["PWidth"] = response[i].Width.toString();
                    //                 object["Height"] = response[i].Height.toString();
                    //                 object["Picture"] = RoutePath + 'MediaUploads/' + response[i].product_picture_mappings[j].tblmediamgmt.FileName;
                    //                 lstProduct.push(object);
                    //                 uploadimage(j + 1);
                    //             }
                    //         }
                    //         uploadimage(0);

                    //     } else {
                    //         var object = new Object();
                    //         object["ProductId"] = response[i].Id;
                    //         object["sku"] = response[i].Sku;
                    //         object["Name"] = response[i].Name.toString();
                    //         object["CategoryName"] = "";
                    //         object["SubCategory"] = "";
                    //         object["ProductCost"] = response[i].ProductCost.toString();
                    //         object["Price"] = response[i].Price.toString();
                    //         object["OldPrice"] = response[i].OldPrice.toString();
                    //         object["Stock"] = response[i].StockQuantity.toString();
                    //         object["Weight"] = response[i].Weight.toString();
                    //         object["Length"] = response[i].Length.toString();
                    //         object["PWidth"] = response[i].Width.toString();
                    //         object["Height"] = response[i].Height.toString();
                    //         object["Picture"] = '';
                    //         lstProduct.push(object);
                    //     }
                    //     uploaderproduct(i + 1);
                    // }
                    if (response[i].product_picture_mappings.length > 0) {
                        function uploadimage(j) {
                            if (j < response[i].product_picture_mappings.length) {
                                var object = new Object();
                                object["ProductId"] = response[i].Id;
                                object["No"] = 0;
                                object["Name"] = response[i].Name.toString();
                                // object["CategoryName"] = "";
                                // object["SubCategory"] = "";
                                object["ProductCost"] = response[i].ProductCost.toString();
                                object["Price"] = response[i].Price.toString();
                                object["OldPrice"] = response[i].OldPrice.toString();
                                object["AttributePrice"] = 0;
                                object["AttributeOldPrice"] = 0;
                                object["Stock"] = response[i].StockQuantity.toString();
                                object["Weight"] = response[i].Weight.toString();
                                object["Length"] = response[i].Length.toString();
                                object["PWidth"] = response[i].Width.toString();
                                object["Height"] = response[i].Height.toString();
                                object["Picture"] = RoutePath + 'MediaUploads/' + response[i].product_picture_mappings[j].tblmediamgmt.FileName;
                                lstProduct.push(object);
                                uploadimage(j + 1);
                            }
                        }
                        uploadimage(0);

                    } else {
                        var object = new Object();
                        object["ProductId"] = response[i].Id;
                        object["No"] = 0;
                        object["Name"] = response[i].Name.toString();
                        // object["CategoryName"] = "";
                        // object["SubCategory"] = "";
                        object["ProductCost"] = response[i].ProductCost.toString();
                        object["Price"] = response[i].Price.toString();
                        object["OldPrice"] = response[i].OldPrice.toString();
                        object["AttributePrice"] = 0;
                        object["AttributeOldPrice"] = 0;
                        object["Stock"] = response[i].StockQuantity.toString();
                        object["Weight"] = response[i].Weight.toString();
                        object["Length"] = response[i].Length.toString();
                        object["PWidth"] = response[i].Width.toString();
                        object["Height"] = response[i].Height.toString();
                        object["Picture"] = '';
                        lstProduct.push(object);
                    }
                    uploaderproduct(i + 1);
                } else {
                    //Manage Product Attrinute Combination
                    //p-uploaderFinalProduct
                    var LstFinalProduct = [];
                    if (lstProduct.length > 0) {

                        function uploaderFinalProduct(p) {
                            if (p < lstProduct.length) {
                                GetProductCombinationforExport(lstProduct[p].ProductId, function (response) {
                                    var Attriburecolumn = response;
                                    if (Attriburecolumn != null && Attriburecolumn != undefined && Attriburecolumn != '') {

                                        if (Attriburecolumn.length > 0) {
                                            var arrGoupbyAttriburecolumn = u.groupBy(Attriburecolumn, 'ProductCombinationid');
                                            var array = u.map(arrGoupbyAttriburecolumn, function (value, index) {
                                                return value;
                                            });
                                            //Add Column
                                            if (array.length > 0) {
                                                function uploadAttributeExcelColumn(a) {
                                                    if (a < array.length) {

                                                        function ManageAttriburecolumn(q) {
                                                            if (q < array[a].length) {
                                                                var columnExists = u.findWhere(conf.cols, {
                                                                    caption: array[a][q].AttributeColName
                                                                });
                                                                if (columnExists == undefined || columnExists == '' || columnExists == null) {
                                                                    var obj = new Object();
                                                                    obj.caption = array[a][q].AttributeColName;
                                                                    obj.type = 'string';
                                                                    conf.cols.push(obj);

                                                                }
                                                                ManageAttriburecolumn(q + 1);
                                                            } else {
                                                                uploadAttributeExcelColumn(a + 1);
                                                            }
                                                        }
                                                        ManageAttriburecolumn(0);
                                                    } else {
                                                        uploadmultipleAttribute(0);
                                                    }
                                                }
                                                uploadAttributeExcelColumn(0);

                                                //Append Attribute
                                                function uploadmultipleAttribute(a) {


                                                    if (a < array.length) {
                                                        function uploaderAttriburecolumn(q) {
                                                            var objProductExport = new Object();
                                                            for (var i = 0; i < conf.cols.length; i++) {
                                                                objProductExport[conf.cols[i].caption] = null;
                                                            };
                                                            if (q < array[a].length) {
                                                                var index = -1;
                                                                u.each(conf.cols, function (data, idx) {
                                                                    if (data.caption == 'AttributeOldPrice') {
                                                                        index = idx;
                                                                        return;
                                                                    }
                                                                });

                                                                objProductExport.ProductId = lstProduct[p].ProductId;
                                                                objProductExport.No = lstProduct[p].No.toString();
                                                                objProductExport.Name = lstProduct[p].Name.toString();
                                                                // objProductExport.CategoryName = lstProduct[p].CategoryName;
                                                                // objProductExport.SubCategory = lstProduct[p].SubCategory;
                                                                objProductExport.ProductCost = lstProduct[p].ProductCost.toString();
                                                                objProductExport.Price = lstProduct[p].Price.toString();
                                                                objProductExport.OldPrice = lstProduct[p].OldPrice.toString();
                                                                objProductExport.AttributePrice = lstProduct[p].AttributePrice.toString();
                                                                objProductExport.AttributeOldPrice = lstProduct[p].AttributeOldPrice.toString();
                                                                objProductExport.Stock = lstProduct[p].Stock.toString();
                                                                objProductExport.Weight = lstProduct[p].Weight.toString();
                                                                objProductExport.Length = lstProduct[p].Length.toString();
                                                                objProductExport.PWidth = lstProduct[p].PWidth.toString();
                                                                objProductExport.Height = lstProduct[p].Height.toString();
                                                                objProductExport.Picture = lstProduct[p].Picture;
                                                                if (array[a][q].CombinationPrice != null && array[a][q].CombinationPrice != undefined && array[a][q].CombinationPrice != '') {
                                                                    objProductExport.AttributePrice = array[a][q].CombinationPrice.toString();
                                                                }
                                                                if (array[a][q].CombinationOldPrice != null && array[a][q].CombinationOldPrice != undefined && array[a][q].CombinationOldPrice != '') {
                                                                    objProductExport.AttributeOldPrice = array[a][q].CombinationOldPrice.toString();
                                                                }
                                                                // objProductExport["ProductCombinationid"] = array[a][q].ProductCombinationid;
                                                                var attrNamelist = [];

                                                                if (index != -1) {
                                                                    function attributes(e) {
                                                                        if (e <= conf.cols.length) {
                                                                            if (conf.cols[e] != null && conf.cols[e] != undefined && conf.cols[e] != '') {
                                                                                var obj = new Object();
                                                                                obj.caption = conf.cols[e].caption;
                                                                                attrNamelist.push(obj);
                                                                            }
                                                                            attributes(e + 1);
                                                                        } else {
                                                                            if (attrNamelist.length > 0) {
                                                                                function Setattrributevalue(s) {
                                                                                    if (s < attrNamelist.length) {
                                                                                        var objattri = u.filter(array[a], {
                                                                                            AttributeColName: attrNamelist[s].caption,
                                                                                            ProductCombinationid: array[a][q].ProductCombinationid,
                                                                                        });
                                                                                        if (objattri.length > 0) {
                                                                                            var objattri1 = u.filter(objattri, { AttributeColName: attrNamelist[s].caption, AttributeColValue: array[a][q].AttributeColValue })
                                                                                            objProductExport[objattri1[0].AttributeColName] = objattri1[0].AttributeColValue;
                                                                                        } else {
                                                                                            objProductExport[attrNamelist[s].caption] = "";
                                                                                        }
                                                                                        Setattrributevalue(s + 1);
                                                                                    } else {
                                                                                        LstFinalProduct.push(objProductExport);
                                                                                        uploaderAttriburecolumn(q + 1);

                                                                                    }
                                                                                }
                                                                                Setattrributevalue(0);
                                                                            }
                                                                        }
                                                                    }
                                                                    attributes(index + 1);
                                                                } else {
                                                                    uploaderAttriburecolumn(q + 1);

                                                                }

                                                            } else {

                                                                uploadmultipleAttribute(a + 1);
                                                            }
                                                        }
                                                        uploaderAttriburecolumn(0);
                                                    } else {
                                                        uploaderFinalProduct(p + 1);
                                                    }
                                                }

                                            }
                                        }
                                    } else {
                                        var objNotAttribute = new Object();

                                        var index = -1;
                                        u.each(conf.cols, function (data, idx) {
                                            if (data.caption == 'AttributeOldPrice') {
                                                index = idx;
                                                return;
                                            }
                                        });

                                        var attrNamelist = [];
                                        if (index != -1) {
                                            function attributse(e) {
                                                if (e <= conf.cols.length) {
                                                    if (conf.cols[e] != null && conf.cols[e] != undefined && conf.cols[e] != '') {
                                                        var attri = conf.cols[e].caption;
                                                        attrNamelist.push(attri);
                                                    }
                                                    attributse(e + 1);
                                                } else {
                                                    if (attrNamelist.length > 0) {
                                                        function Setattrributevalues(s) {
                                                            if (s < attrNamelist.length) {
                                                                objNotAttribute[attrNamelist[s]] = "";
                                                                Setattrributevalues(s + 1);
                                                            }
                                                        }
                                                        Setattrributevalues(0);
                                                    }
                                                }
                                            }
                                            attributse(index + 1);
                                        }



                                        ProductAttribute.findAll().then(function (response) {
                                            if (response != null) {
                                                for (var i = 0; i < response.length; i++) {
                                                    var objData = u.findWhere(conf.cols, {
                                                        caption: response[i].Name
                                                    });
                                                    if (objData == null || objData == undefined) {
                                                        var obj = new Object();
                                                        obj.caption = response[i].Name;
                                                        obj.type = "string";

                                                        conf.cols.push(obj);
                                                        objNotAttribute[response[i].Name] = "";
                                                    };
                                                };
                                                objNotAttribute.ProductId = lstProduct[p].ProductId;
                                                objNotAttribute.No = lstProduct[p].No.toString();
                                                objNotAttribute.Name = lstProduct[p].Name.toString();
                                                // objNotAttribute.CategoryName = lstProduct[p].CategoryName;
                                                // objNotAttribute.SubCategory = lstProduct[p].SubCategory;
                                                objNotAttribute.ProductCost = lstProduct[p].ProductCost.toString();
                                                objNotAttribute.Price = lstProduct[p].Price.toString();
                                                objNotAttribute.OldPrice = lstProduct[p].OldPrice.toString();
                                                objNotAttribute.AttributePrice = lstProduct[p].AttributePrice.toString();
                                                objNotAttribute.AttributeOldPrice = lstProduct[p].AttributeOldPrice.toString();
                                                objNotAttribute.Stock = lstProduct[p].Stock.toString();
                                                objNotAttribute.Weight = lstProduct[p].Weight.toString();
                                                objNotAttribute.Length = lstProduct[p].Length.toString();
                                                objNotAttribute.PWidth = lstProduct[p].PWidth.toString();
                                                objNotAttribute.Height = lstProduct[p].Height.toString();
                                                objNotAttribute.Picture = lstProduct[p].Picture;
                                                LstFinalProduct.push(objNotAttribute);
                                                uploaderFinalProduct(p + 1);
                                            } else {
                                                objNotAttribute.ProductId = lstProduct[p].ProductId;
                                                objNotAttribute.No = lstProduct[p].No.toString();;
                                                objNotAttribute.Name = lstProduct[p].Name.toString();
                                                // objNotAttribute.CategoryName = lstProduct[p].CategoryName;
                                                // objNotAttribute.SubCategory = lstProduct[p].SubCategory;
                                                objNotAttribute.ProductCost = lstProduct[p].ProductCost.toString();
                                                objNotAttribute.Price = lstProduct[p].Price.toString();
                                                objNotAttribute.OldPrice = lstProduct[p].OldPrice.toString();
                                                objNotAttribute.AttributePrice = lstProduct[p].AttributePrice.toString();
                                                objNotAttribute.AttributeOldPrice = lstProduct[p].AttributeOldPrice.toString();
                                                objNotAttribute.Stock = lstProduct[p].Stock.toString();
                                                objNotAttribute.Weight = lstProduct[p].Weight.toString();
                                                objNotAttribute.Length = lstProduct[p].Length.toString();
                                                objNotAttribute.PWidth = lstProduct[p].PWidth.toString();
                                                objNotAttribute.Height = lstProduct[p].Height.toString();
                                                objNotAttribute.Picture = lstProduct[p].Picture;
                                                LstFinalProduct.push(objNotAttribute);
                                                uploaderFinalProduct(p + 1);
                                            }
                                        });

                                    }
                                })
                            } else {
                                var index = -1;
                                u.each(conf.cols, function (data, idx) {
                                    if (data.caption == 'AttributeOldPrice') {
                                        index = idx;
                                        return;
                                    }
                                });
                                if (LstFinalProduct.length > 0) {
                                    function FinalExportProduct(row) {
                                        if (row < LstFinalProduct.length) {
                                            var rows = [];

                                            rows.push((row + 1).toString());
                                            rows.push(LstFinalProduct[row].Name);
                                            // rows.push(LstFinalProduct[row].CategoryName);
                                            // rows.push(LstFinalProduct[row].SubCategory);
                                            // rows.push(LstFinalProduct[row].ProductCost);
                                            rows.push(LstFinalProduct[row].Price);
                                            rows.push(LstFinalProduct[row].OldPrice);
                                            rows.push(LstFinalProduct[row].Stock);
                                            rows.push(LstFinalProduct[row].Weight);
                                            rows.push(LstFinalProduct[row].Length);
                                            rows.push(LstFinalProduct[row].PWidth);
                                            rows.push(LstFinalProduct[row].Height);
                                            rows.push(LstFinalProduct[row].Picture);
                                            rows.push(LstFinalProduct[row].AttributePrice);
                                            rows.push(LstFinalProduct[row].AttributeOldPrice);
                                            if (conf.cols.length > 0) {
                                                function uploaderFinalAttributeColumn(i) {
                                                    if (i <= conf.cols.length) {
                                                        if (conf.cols[i] != null && conf.cols[i] != undefined && conf.cols[i] != '') {
                                                            var attri = conf.cols[i].caption;
                                                            if (LstFinalProduct[row][attri] != null && LstFinalProduct[row][attri] != undefined) {
                                                                rows.push(LstFinalProduct[row][attri]);
                                                            } else {
                                                                rows.push("");
                                                            }

                                                        }
                                                        uploaderFinalAttributeColumn(i + 1);
                                                    } else {
                                                        conf.rows.push(rows);
                                                    }
                                                }
                                                uploaderFinalAttributeColumn(index + 1);
                                            } else {
                                                conf.rows.push(rows);
                                            }
                                            FinalExportProduct(row + 1);
                                        }

                                    }
                                    FinalExportProduct(0);
                                }
                                var result = nodeExcel.execute(conf);
                                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                                res.setHeader("Content-Disposition", "attachment; filename=" + "Product.xlsx");
                                res.end(result, 'binary');
                            }
                        }
                        uploaderFinalProduct(0);
                    }
                }
            }
            uploaderproduct(0);
        } else {
            var row = [];
            for (var i = 0; i < conf.cols.length; i++) {
                row.push('');
            };
            conf.rows = [];
            conf.rows.push(row);
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + "NoProduct.xlsx");
            res.end(result, 'binary');
        }
        // res.json(lstProduct);

    }).catch(function (error) {
        res.json(error);
    })
    //         } else {
    //             res.json(InvalidToken);
    //         }
    //     })
    // } else {
    //     res.json(InvalidToken);
    // }
})

var request = require('request');
var http = require('http');

router.post('/ImportProducts', function (req, res) {

    var totalattributes = 0;
    //upto picture column name
    var totalRequiredcolumn = 12;

    //Set Parameter for User Permission
    // req.query['tablename'] = req.headers['x-requested-with'];
    // req.query['permission'] = "Added";

    // var obj = {};
    // obj.headers = req.headers;
    // obj.query = req.query;

    // funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
    //     var AccessPermission = responseAccessPermission.success;
    //     if (AccessPermission) {

    //         ProductAttribute.findAndCountAll().then(function(response) {
    //             totalattributes = response.count;
    //             totalRequiredcolumn = totalRequiredcolumn + totalattributes;
    //             ImportData()

    //             function ImportData() {
    // ProductAttribute.findAndCountAll().then(function(response) {
    //     if (response != null && response != undefined && response != '') {
    //         totalattributes = response.count;
    //         totalRequiredcolumn = totalRequiredcolumn + totalattributes;
    //         console.log('totalRequiredcolumn', totalRequiredcolumn)

    //         function ImportData() {

    var form = new formidable.IncomingForm();
    var FileName = [];
    var lstexcel = [];


    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //var FileName = __dirname + '/../MediaUploads/FileUpload/DeviceList.xlsx';
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

    form.parse(req, function (err, fields, files) {
        //CreatedBy = fields.CreatedBy;

    });

    form.on('fileBegin', function (name, file) {
        file.path = form.uploadDir + "/" + file.name;
        FileName = file.path.toString();
        //FileName.push(file.path);
    });



    // var form = new formidable.IncomingForm();
    // var FileName = [];
    // var lstexcel = [];

    // form.uploadDir = __dirname + '/../MediaUploads/FileUpload';
    // //file upload path
    // form.parse(req, function(err, fields, files) {

    // });

    // form.on('fileBegin', function(name, file) {
    //     file.path = form.uploadDir + "/" + file.name;
    //     // console.log(file.path);
    //     FileName = file.path.toString();
    //     //FileName.push(file.path);
    // });


    form.on('end', function () {
        ProductAttribute.findAndCountAll().then(function (response) {
            if (response != null && response != undefined && response != '') {
                totalattributes = response.count;
                totalRequiredcolumn = totalRequiredcolumn + totalattributes;
                if (FileName.length > 0) {
                    var workbook = XLSX.readFile(FileName, {
                        type: 'binary'
                    });

                    var first_sheet_name = workbook.SheetNames[0];
                    var worksheet = workbook.Sheets[first_sheet_name];
                    if (worksheet != null && worksheet != undefined && worksheet != '') {
                        var Firstcolumn = (worksheet.A1 == undefined ? "Firstcolumn" : worksheet.A1.v);
                        var Secondcolumn = (worksheet.B1 == undefined ? "Secondcolumn" : worksheet.B1.v);
                        var BeforeAtrribute = (worksheet.M1 == undefined ? "BeforeAtrribute" : worksheet.M1.v)
                        var lstAllVarient = [];
                        var lstVarient = [];

                        var headers = [];
                        var range = XLSX.utils.decode_range(worksheet['!ref']);
                        var C, R = range.s.r;

                        // range--> { s: { c: 0, r: 0 }, e: { c: 15, r: 1 } }

                        for (C = range.s.c; C <= range.e.c; ++C) {
                            var cell = worksheet[XLSX.utils.encode_cell({
                                c: C,
                                r: R
                            })];

                            /* find the cell in the first row */
                            var hdr = "UNKNOWN " + C; // <-- replace with your desired default
                            if (cell && cell.t) {
                                hdr = XLSX.utils.format_cell(cell);
                            }
                            headers.push(hdr);
                        }
                        lstexcel = XLSX.utils.sheet_to_json(worksheet);
                        var lst = [];
                        lstexcel.forEach(function (row) {
                            // Set empty cell to ''.
                            var obj = new Object();
                            headers.forEach(function (hd) {
                                if (row[hd] == undefined) {
                                    obj[hd] = '';
                                } else {
                                    obj[hd] = row[hd];
                                }
                            });
                            lst.push(obj);
                        });
                        if (lst.length > 0) {
                            function removeProductImage(d) {
                                if (d < lst.length) {
                                    lstAllVarient = Object.keys(lst[d]);

                                    var objProduct = InitializeProductObject();

                                    objProduct.No = lst[d].No;
                                    objProduct.Name = lst[d].Name;

                                    objProduct.ProductCost = (lst[d].ProductCost != null && lst[d].ProductCost != '' && lst[d].ProductCost != undefined) ? parseFloat(lst[d].ProductCost) : 0;
                                    objProduct.Price = (lst[d].Price != null && lst[d].Price != '' && lst[d].Price != undefined) ? parseFloat(lst[d].Price) : 0;
                                    objProduct.OldPrice = (lst[d].OldPrice != null && lst[d].OldPrice != '' && lst[d].OldPrice != undefined) ? parseFloat(lst[d].OldPrice) : 0;
                                    objProduct.AttributePrice = (lst[d].AttributePrice != null && lst[d].AttributePrice != '' && lst[d].AttributePrice != undefined) ? parseFloat(lst[d].AttributePrice) : 0;
                                    objProduct.AttributeOldPrice = (lst[d].AttributeOldPrice != null && lst[d].AttributeOldPrice != '' && lst[d].AttributeOldPrice != undefined) ? parseFloat(lst[d].AttributeOldPrice) : 0;
                                    objProduct.StockQuantity = (lst[d].Stock != null && lst[d].Stock != '' && lst[d].Stock != undefined) ? parseFloat(lst[d].Stock) : 0;
                                    objProduct.Weight = (lst[d].Weight != null && lst[d].Weight != '' && lst[d].Weight != undefined) ? parseFloat(lst[d].Weight) : 0;
                                    objProduct.Length = (lst[d].Length != null && lst[d].Length != '' && lst[d].Length != undefined) ? parseFloat(lst[d].Length) : 0;
                                    objProduct.Width = (lst[d].PWidth != null && lst[d].PWidth != '' && lst[d].PWidth != undefined) ? parseFloat(lst[d].PWidth) : 0;
                                    objProduct.Height = (lst[d].Height != null && lst[d].Height != '' && lst[d].Height != undefined) ? parseFloat(lst[d].Height) : 0;
                                    objProduct.CreatedOnUtc = new Date();

                                    //create Product
                                    Product.findOrCreate({
                                        where: {
                                            Name: objProduct.Name
                                        },
                                        defaults: objProduct
                                    }).then(function (responseProduct) {
                                        var objProductResponse = responseProduct[0];
                                        var ProductId = objProductResponse.Id;
                                        ProductPictureMaping.destroy({
                                            where: {
                                                ProductId: ProductId
                                            }
                                        }).then(function (responsepicturemapping) {
                                            function FindExcelAttribute(k) {
                                                if (k < lstAllVarient.length) {
                                                    if (k > 11) {
                                                        lstVarient.push(lstAllVarient[k]);
                                                    }
                                                    FindExcelAttribute(k + 1);
                                                } else {

                                                    if (lstVarient.length > 0) {
                                                        ProductAttributeMapping.findAll({
                                                            where: {
                                                                ProductId: ProductId
                                                            }
                                                        }).then(function (response) {
                                                            if (response.length > 0) {
                                                                function DeleteMapping(p) {
                                                                    if (p < response.length) {
                                                                        var ProductAttributeMappingId = response[p].Id;
                                                                        ProductAttributeValue.findAll({
                                                                            where: {
                                                                                ProductAttributeMappingId: ProductAttributeMappingId
                                                                            }
                                                                        }).then(function (response1) {
                                                                            if (response1.length > 0) {
                                                                                function uploader(q) {
                                                                                    if (q < response1.length) {

                                                                                        // var idvalue = response1[q].Id.toString();
                                                                                        // ProductAttributeCombination.findAll({
                                                                                        //     where: {
                                                                                        //         ProductId: ProductId
                                                                                        //     }
                                                                                        // }).then(function(response2) {
                                                                                        //     if (response2.length > 0) {
                                                                                        //         function deletecombination(d) {
                                                                                        //             if (d < response2.length) {
                                                                                        //                 var idcombination = response2[d].Id;
                                                                                        //                 CombinationTierPrice.destroy({
                                                                                        //                     where: {
                                                                                        //                         ProductAttributeCombinationId: idcombination
                                                                                        //                     }
                                                                                        //                 }).then(function(objhcombinationtierprice) {
                                                                                        //                     ProductAttributeCombination.destroy({
                                                                                        //                         where: {
                                                                                        //                             Id: idcombination
                                                                                        //                         }
                                                                                        //                     }).then(function(responsecombinationtierprice) {
                                                                                        //                         deletecombination(d + 1);
                                                                                        //                     })
                                                                                        //                 })
                                                                                        //             } else {


                                                                                        //             }
                                                                                        //         }
                                                                                        //         deletecombination(0);

                                                                                        //     } else {
                                                                                        //         uploader(q + 1);

                                                                                        //     }
                                                                                        // })
                                                                                        uploader(q + 1);
                                                                                    } else {
                                                                                        ProductAttributeValue.destroy({
                                                                                            where: {
                                                                                                ProductAttributeMappingId: ProductAttributeMappingId
                                                                                            }
                                                                                        }).then(function (responsevalue) {
                                                                                            // res.json({ success: true, message: "Product Attribute deleted successfully...", data: response });
                                                                                            ProductAttributeMapping.destroy({
                                                                                                where: {
                                                                                                    ProductId: ProductId
                                                                                                }
                                                                                            }).then(function (responsemapping) {

                                                                                                DeleteMapping(p + 1);

                                                                                            })
                                                                                        })
                                                                                    }
                                                                                }
                                                                                uploader(0);
                                                                            } else {
                                                                                ProductAttributeMapping.destroy({
                                                                                    where: {
                                                                                        ProductId: ProductId
                                                                                    }
                                                                                }).then(function (response) {
                                                                                    DeleteMapping(p + 1);
                                                                                    // res.json({ success: true, message: "Product Attribute deleted successfully...", data: response });
                                                                                })
                                                                                // ProductAttributeCombination.findAll({
                                                                                //     where: {
                                                                                //         ProductId: ProductId
                                                                                //     }
                                                                                // }).then(function(response2) {
                                                                                //     if (response2.length > 0) {
                                                                                //         function deletecombination(d) {
                                                                                //             if (d < response2.length) {
                                                                                //                 var idcombination = response2[d].Id;
                                                                                //                 CombinationTierPrice.destroy({
                                                                                //                     where: {
                                                                                //                         ProductAttributeCombinationId: idcombination
                                                                                //                     }
                                                                                //                 }).then(function(objhcombinationtierprice) {
                                                                                //                     ProductAttributeCombination.destroy({
                                                                                //                         where: {
                                                                                //                             Id: idcombination
                                                                                //                         }
                                                                                //                     }).then(function(responsecombinationtierprice) {
                                                                                //                         deletecombination(d + 1);
                                                                                //                     })
                                                                                //                 })
                                                                                //             } else {
                                                                                //                 ProductAttributeMapping.destroy({
                                                                                //                     where: {
                                                                                //                         ProductId: ProductId
                                                                                //                     }
                                                                                //                 }).then(function(response) {
                                                                                //                     DeleteMapping(p + 1);
                                                                                //                     // res.json({ success: true, message: "Product Attribute deleted successfully...", data: response });
                                                                                //                 })


                                                                                //             }
                                                                                //         }
                                                                                //         deletecombination(0);

                                                                                //     } else {
                                                                                //         ProductAttributeMapping.destroy({
                                                                                //             where: {
                                                                                //                 ProductId: ProductId
                                                                                //             }
                                                                                //         }).then(function(response) {
                                                                                //             DeleteMapping(p + 1);
                                                                                //             // res.json({ success: true, message: "Product Attribute deleted successfully...", data: response });
                                                                                //         })

                                                                                //     }
                                                                                // }).then(function(response) {
                                                                                //     DeleteMapping(p + 1);
                                                                                //     // res.json({ success: true, message: "Product Attribute deleted successfully...", data: response });
                                                                                // })

                                                                            }
                                                                        })

                                                                    } else {
                                                                        removeProductImage(d + 1);
                                                                    }
                                                                }
                                                                DeleteMapping(0);
                                                            } else {
                                                                removeProductImage(d + 1);
                                                            }
                                                        })
                                                    } else {
                                                        removeProductImage(d + 1);
                                                    }
                                                }
                                            }
                                            FindExcelAttribute(0);


                                        });
                                    });

                                } else {
                                    UploadNewProduct();
                                }
                            }
                            removeProductImage(0);

                        }

                        function UploadNewProduct() {

                            if (lst.length > 0) {
                                var totalExcelcolumn = Object.keys(lst[0]).length;
                                if (Firstcolumn == "No" && Secondcolumn == "Name" && totalExcelcolumn == totalRequiredcolumn) {
                                    function uploadExcel(i) {
                                        if (i < lst.length) {
                                            lstAllVarient = Object.keys(lst[i]);
                                            //Initialize Product Object
                                            var objProduct = InitializeProductObject();

                                            objProduct.Sku = lst[i].Spu;
                                            objProduct.Name = lst[i].Name;

                                            objProduct.ProductCost = (lst[i].ProductCost != null && lst[i].ProductCost != '' && lst[i].ProductCost != undefined) ? parseFloat(lst[i].ProductCost) : 0;
                                            objProduct.Price = (lst[i].Price != null && lst[i].Price != '' && lst[i].Price != undefined) ? parseFloat(lst[i].Price) : 0;
                                            objProduct.OldPrice = (lst[i].OldPrice != null && lst[i].OldPrice != '' && lst[i].OldPrice != undefined) ? parseFloat(lst[i].OldPrice) : 0;
                                            objProduct.AttributePrice = (lst[i].AttributePrice != null && lst[i].AttributePrice != '' && lst[i].AttributePrice != undefined) ? parseFloat(lst[i].AttributePrice) : 0;
                                            objProduct.AttributeOldPrice = (lst[i].AttributeOldPrice != null && lst[i].AttributeOldPrice != '' && lst[i].AttributeOldPrice != undefined) ? parseFloat(lst[i].AttributeOldPrice) : 0;
                                            objProduct.StockQuantity = (lst[i].Stock != null && lst[i].Stock != '' && lst[i].Stock != undefined) ? parseFloat(lst[i].Stock) : 0;
                                            objProduct.Weight = (lst[i].Weight != null && lst[i].Weight != '' && lst[i].Weight != undefined) ? parseFloat(lst[i].Weight) : 0;
                                            objProduct.Length = (lst[i].Length != null && lst[i].Length != '' && lst[i].Length != undefined) ? parseFloat(lst[i].Length) : 0;
                                            objProduct.Width = (lst[i].PWidth != null && lst[i].PWidth != '' && lst[i].PWidth != undefined) ? parseFloat(lst[i].PWidth) : 0;
                                            objProduct.Height = (lst[i].Height != null && lst[i].Height != '' && lst[i].Height != undefined) ? parseFloat(lst[i].Height) : 0;
                                            objProduct.CreatedOnUtc = new Date();

                                            var CategoryName = lst[i].CategoryName;
                                            var SubCategory = lst[i].SubCategory;

                                            //create Product
                                            Product.findOrCreate({
                                                where: {
                                                    Name: objProduct.Name
                                                },
                                                defaults: objProduct
                                            }).then(function (responseProduct) {
                                                var objProductResponse = responseProduct[0];
                                                var FlgProductResponse = responseProduct[1];
                                                var ProductId = objProductResponse.Id;
                                                var ProductName = objProductResponse.Name;

                                                //Manage Media
                                                var Excelimage = (lst[i].Picture != null && lst[i].Picture != '' && lst[i].Picture != undefined) ? lst[i].Picture : "";

                                                if (Excelimage != null && Excelimage != '' && Excelimage != undefined) {
                                                    var objMedia = InitializeMediaObject();
                                                    var index = Excelimage.lastIndexOf('/');
                                                    var imgname = Excelimage.substring(index + 1, Excelimage.length);
                                                    var onlyname = imgname.substring(0, imgname.lastIndexOf('.'));
                                                    var extension = imgname.substring(imgname.lastIndexOf('.'), imgname.length);

                                                    var FileNewName = GetUserNameFromDate();
                                                    var FileName = FileNewName + extension;
                                                    var filePath = 'MediaUploads/' + FileName;

                                                    if (!fs.existsSync(filePath)) {

                                                        var file = fs.createWriteStream(filePath);
                                                        var request = http.get(Excelimage, function (response) {
                                                            response.pipe(file);
                                                        });

                                                        // var download = function(uri, filename, callback) {
                                                        //     request.head(uri, function(err, res, body) {
                                                        //         request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                                                        //     });
                                                        // };
                                                        // download(Excelimage, filePath, function() {});
                                                    }

                                                    var objMedia = {
                                                        FileName: FileName,
                                                        Author: 'Admin@bugzstudio.com',
                                                        Caption: null,
                                                        AltText: FileNewName,
                                                        Description: null,
                                                        Name: FileNewName,
                                                    };
                                                    MediaMgmt.findOrCreate({
                                                        where: {
                                                            FileName: objMedia.FileName
                                                        },
                                                        defaults: objMedia
                                                    }).then(function (responseMedia) {
                                                        var objProductPirctureMapping = new InitializeProductPirctureMappingObject();
                                                        objProductPirctureMapping.ProductId = ProductId;
                                                        objProductPirctureMapping.PictureId = responseMedia[0].id;
                                                        objProductPirctureMapping.DisplayOrder = 0;
                                                        ProductPictureMaping.findOrCreate({
                                                            where: {
                                                                ProductId: objProductPirctureMapping.ProductId,
                                                                PictureId: objProductPirctureMapping.PictureId
                                                            },
                                                            defaults: objProductPirctureMapping
                                                        }).then(function (responsepicturemapping) {
                                                            ManageImportExcel();
                                                        });
                                                    })

                                                } else {
                                                    ManageImportExcel();
                                                }

                                                function ManageImportExcel() {

                                                    if (FlgProductResponse) {
                                                        //Manage Category Name
                                                        // if (CategoryName == null || CategoryName == undefined || CategoryName == '') {
                                                        //     CategoryName = "Other";
                                                        // }

                                                        // //Initialize Category Object
                                                        // var objCategory = InitializeCategoryObject();
                                                        // objCategory.Title = CategoryName;
                                                        // objCategory.Name = CategoryName;
                                                        // objCategory.Description = CategoryName;

                                                        // var CatId = 0;
                                                        // Category.findOrCreate({
                                                        //     where: {
                                                        //         Title: objCategory.Title
                                                        //     },
                                                        //     defaults: objCategory
                                                        // }).then(function(responseCategory) {
                                                        //     if (responseCategory[0] != null) {

                                                        //         Cid = responseCategory[0].id;

                                                        //         //Initialize Category Mapping Object
                                                        //         var objProductCategorymapping = InitializeCategoryMappingObject();
                                                        //         objProductCategorymapping.CategoryId = Cid;
                                                        //         objProductCategorymapping.ProductId = ProductId;
                                                        //         ProductCategory.findOrCreate({
                                                        //             where: {
                                                        //                 CategoryId: Cid,
                                                        //                 ProductId: ProductId
                                                        //             },
                                                        //             defaults: objProductCategorymapping
                                                        //         }).then(function(objProductCategoryExist) {
                                                        //             //End Category

                                                        //             //For SubCategory
                                                        //             if (SubCategory != null && SubCategory != '' && SubCategory != undefined) {

                                                        //                 var arrSubCategory = SubCategory.split(",");

                                                        //                 if (arrSubCategory.length > 0) {
                                                        //                     function uploadSubCategoryExcel(j) {
                                                        //                         if (j < arrSubCategory.length) {
                                                        //                             //Initialize Sub Category Object
                                                        //                             var objSubCategory = InitializeCategoryObject();
                                                        //                             objSubCategory.Title = arrSubCategory[j];
                                                        //                             objSubCategory.Name = arrSubCategory[j];
                                                        //                             objSubCategory.Parent = Cid;
                                                        //                             objSubCategory.Description = arrSubCategory[j]; + " For " + CategoryName;

                                                        //                             var SubCatId = 0;
                                                        //                             Category.findOrCreate({
                                                        //                                 where: {
                                                        //                                     Title: objSubCategory.Title
                                                        //                                 },
                                                        //                                 defaults: objSubCategory
                                                        //                             }).then(function(responseSubCategory) {
                                                        //                                 if (responseSubCategory[0] != null) {

                                                        //                                     SubCatId = responseSubCategory[0].id;

                                                        //                                     //Initialize Sub Category Mapping Object
                                                        //                                     var objProductSubCategorymapping = InitializeCategoryMappingObject();
                                                        //                                     objProductSubCategorymapping.CategoryId = SubCatId;
                                                        //                                     objProductSubCategorymapping.ProductId = ProductId;
                                                        //                                     ProductCategory.findOrCreate({
                                                        //                                         where: {
                                                        //                                             CategoryId: SubCatId,
                                                        //                                             ProductId: ProductId
                                                        //                                         },
                                                        //                                         defaults: objProductSubCategorymapping
                                                        //                                     }).then(function(objProductSubCategoryExist) {
                                                        //                                         uploadSubCategoryExcel(j + 1);
                                                        //                                     });
                                                        //                                 } else {
                                                        //                                     uploadSubCategoryExcel(j + 1);
                                                        //                                 }
                                                        //                             });
                                                        //                         } else {

                                                        //                             FindExcelAttribute(0);
                                                        //                         }
                                                        //                     }
                                                        //                     uploadSubCategoryExcel(0);
                                                        //                 }
                                                        //             } else {
                                                        //                 FindExcelAttribute(0);
                                                        //             }
                                                        //             //End Sub Category

                                                        //         })
                                                        //     }
                                                        // });

                                                        //For Attributes
                                                        if (lstAllVarient.length > 0) {

                                                            function FindExcelAttribute(k) {
                                                                if (k < lstAllVarient.length) {
                                                                    if (k > 11) {
                                                                        lstVarient.push(lstAllVarient[k]);
                                                                    }
                                                                    FindExcelAttribute(k + 1);
                                                                } else {

                                                                    if (lstVarient.length > 0) {
                                                                        var lstProductAttributeCombXml = [];
                                                                        var AttributeString = '';
                                                                        var AttributeValueString = '';
                                                                        var XMLAtt = '';

                                                                        function ManageAttributes(l) {
                                                                            if (l < lstVarient.length) {

                                                                                var AttributeName = lstVarient[l];
                                                                                var VarientName = lst[i][AttributeName];

                                                                                if (VarientName != null && VarientName != '' && VarientName != undefined) {
                                                                                    //Get Attribute id if  exist or create New Attribute
                                                                                    var objProductAttribute = InitializeProductAttributeObject();
                                                                                    objProductAttribute.Name = AttributeName;
                                                                                    objProductAttribute.Description = AttributeName;
                                                                                    var AttributeId = 0;
                                                                                    ProductAttribute.findOrCreate({
                                                                                        where: {
                                                                                            Name: objProductAttribute.Name
                                                                                        },
                                                                                        defaults: objProductAttribute
                                                                                    }).then(function (responseProductAttribute) {
                                                                                        var objresponseProductAttribute = responseProductAttribute[0];
                                                                                        var flgresponseProductAttribute = responseProductAttribute[1];

                                                                                        AttributeId = objresponseProductAttribute.Id;

                                                                                        //Now Manage Product Attribute Mapping
                                                                                        //Initialize Product Attribute Mapping Object
                                                                                        var objProductAttributeMapping = InitializeProductAttributeMappingObject();
                                                                                        objProductAttributeMapping.ProductAttributeId = AttributeId;
                                                                                        objProductAttributeMapping.ProductId = ProductId;
                                                                                        ProductAttributeMapping.findOrCreate({
                                                                                            where: {
                                                                                                ProductAttributeId: objProductAttributeMapping.ProductAttributeId,
                                                                                                ProductId: objProductAttributeMapping.ProductId
                                                                                            },
                                                                                            defaults: objProductAttributeMapping
                                                                                        }).then(function (responseProductAttributeMapping) {
                                                                                            //End Product Attribute Mapping

                                                                                            var ProductAttributeMappingId = responseProductAttributeMapping[0].Id;
                                                                                            //Now Manage Product Attribute Value
                                                                                            //Initialize Product Attribute Value Object
                                                                                            var objProductAttributeValue = InitializeProductAttributeValueObject();
                                                                                            objProductAttributeValue.ProductAttributeMappingId = ProductAttributeMappingId;
                                                                                            objProductAttributeValue.Name = VarientName;
                                                                                            //objProductAttributeValue.PriceAdjustment = objProduct.Price;
                                                                                            objProductAttributeValue.WeightAdjustment = objProduct.Weight;
                                                                                            objProductAttributeValue.Cost = objProduct.ProductCost;
                                                                                            objProductAttributeValue.Quantity = objProduct.StockQuantity;
                                                                                            objProductAttributeValue.Price = objProduct.AttributePrice;
                                                                                            objProductAttributeValue.OldPrice = objProduct.AttributeOldPrice;
                                                                                            ProductAttributeValue.findOrCreate({
                                                                                                where: {
                                                                                                    ProductAttributeMappingId: objProductAttributeValue.ProductAttributeMappingId,
                                                                                                    Name: objProductAttributeValue.Name
                                                                                                },
                                                                                                defaults: objProductAttributeValue
                                                                                            }).then(function (responseProductAttributeValue) {
                                                                                                var obj = new Object();
                                                                                                obj.ID = AttributeId;
                                                                                                obj.Value = responseProductAttributeValue[0].Id;
                                                                                                var objexist = u.findWhere(lstProductAttributeCombXml, {
                                                                                                    ID: AttributeId,
                                                                                                    Value: responseProductAttributeValue[0].Id
                                                                                                });
                                                                                                if (objexist == undefined || objexist == '' || objexist == null) {
                                                                                                    lstProductAttributeCombXml.push(obj);
                                                                                                }
                                                                                                ManageAttributes(l + 1);
                                                                                            })
                                                                                        })
                                                                                    })
                                                                                } else {
                                                                                    ManageAttributes(l + 1);
                                                                                }
                                                                            } else {
                                                                                for (var o = 0; o < lstProductAttributeCombXml.length; o++) {
                                                                                    var obj = lstProductAttributeCombXml[o];
                                                                                    if (XMLAtt == null || XMLAtt == '') {
                                                                                        XMLAtt = "<Attributes>";
                                                                                    }

                                                                                    XMLAtt = XMLAtt + '<ProductVariantAttribute ID="' + obj.ID + '">';
                                                                                    XMLAtt = XMLAtt + '<ProductVariantAttributeValue>';
                                                                                    XMLAtt = XMLAtt + '<Value>' + obj.Value + '</Value>';
                                                                                    XMLAtt = XMLAtt + '</ProductVariantAttributeValue>';
                                                                                    XMLAtt = XMLAtt + '</ProductVariantAttribute>';
                                                                                    if (o + 1 == lstProductAttributeCombXml.length) {
                                                                                        XMLAtt = XMLAtt + "</Attributes>";
                                                                                    }

                                                                                    if (AttributeString == '') {
                                                                                        AttributeString = obj.ID;
                                                                                        AttributeValueString = obj.Value;
                                                                                    } else {
                                                                                        AttributeString = AttributeString + "," + obj.ID;
                                                                                        AttributeValueString = AttributeValueString + "," + obj.Value;
                                                                                    }
                                                                                };
                                                                                // if (AttributeString != '' && AttributeString != null && AttributeString != undefined) {
                                                                                //     //Now Manage Product Attribute Combination
                                                                                //     //Initialize Product Attribute Combination Object
                                                                                //     var objProductAttributeCombination = InitializeProductAttributeCombinationObject();
                                                                                //     objProductAttributeCombination.ProductId = ProductId;
                                                                                //     objProductAttributeCombination.AttributesXml = XMLAtt;
                                                                                //     objProductAttributeCombination.StockQuantity = objProduct.StockQuantity;
                                                                                //     objProductAttributeCombination.AllowOutOfStockOrders = false;
                                                                                //     objProductAttributeCombination.Sku = objProduct.Sku;
                                                                                //     objProductAttributeCombination.OverriddenPrice = objProduct.Price;
                                                                                //     objProductAttributeCombination.NotifyAdminForQuantityBelow = 1;
                                                                                //     objProductAttributeCombination.AttributeString = AttributeString;
                                                                                //     objProductAttributeCombination.AttributeValueString = AttributeValueString;



                                                                                //     var objProductAttributeCombinationPrice = InitializeProductAttributeCombinationPriceObject();
                                                                                //     ProductAttributeCombination.findOrCreate({
                                                                                //         where: {
                                                                                //             ProductId: objProductAttributeCombination.ProductId,
                                                                                //             AttributeValueString: objProductAttributeCombination.AttributeValueString
                                                                                //         },
                                                                                //         defaults: objProductAttributeCombination
                                                                                //     }).then(function(responseProductAttributeCombination) {

                                                                                //         objProductAttributeCombinationPrice.ProductAttributeCombinationId = responseProductAttributeCombination[0].Id;
                                                                                //         objProductAttributeCombinationPrice.Price = objProductAttributeCombination.OverriddenPrice;
                                                                                //         objProductAttributeCombinationPrice.Quantity = objProductAttributeCombination.StockQuantity;

                                                                                //         var objRole = new Object();
                                                                                //         objRole.id = 0;
                                                                                //         objRole.RoleName = "User";
                                                                                //         objRole.Description = "User";
                                                                                //         Role.findOrCreate({
                                                                                //             where: {
                                                                                //                 RoleName: objRole.RoleName
                                                                                //             },
                                                                                //             defaults: objRole
                                                                                //         }).then(function(responseRole) {
                                                                                //             var Roleid = responseRole[0].id;
                                                                                //             objProductAttributeCombinationPrice.UserRoleId = Roleid;
                                                                                //             CombinationTierPrice.findOrCreate({
                                                                                //                 where: {
                                                                                //                     ProductAttributeCombinationId: objProductAttributeCombinationPrice.ProductAttributeCombinationId,
                                                                                //                     Type: objProductAttributeCombinationPrice.Type,
                                                                                //                     UserRoleId: objProductAttributeCombinationPrice.UserRoleId
                                                                                //                 },
                                                                                //                 defaults: objProductAttributeCombinationPrice
                                                                                //             }).then(function(responseCombinationTierPrice) {
                                                                                //                 if (responseCombinationTierPrice != null) {
                                                                                //                     uploadExcel(i + 1);
                                                                                //                 }

                                                                                //             });

                                                                                //         })


                                                                                //     });
                                                                                // }
                                                                                uploadExcel(i + 1);

                                                                            }
                                                                        }
                                                                        ManageAttributes(0);
                                                                    }
                                                                }
                                                            }
                                                            FindExcelAttribute(0)
                                                        }


                                                    } else {

                                                        objProductResponse.ProductCost = objProduct.ProductCost;
                                                        objProductResponse.Price = objProduct.Price;
                                                        objProductResponse.OldPrice = objProduct.OldPrice;

                                                        // objProductResponse.Price = objProduct.AttributePrice;
                                                        // objProductResponse.OldPrice = objProduct.AttributeOldPrice;
                                                        objProductResponse.StockQuantity = objProduct.StockQuantity;
                                                        objProductResponse.Weight = objProduct.Weight;
                                                        objProductResponse.Length = objProduct.Length;
                                                        objProductResponse.Width = objProduct.Width;
                                                        objProductResponse.Height = objProduct.Height;
                                                        objProductResponse.UpdatedOnUtc = new Date();

                                                        objProductResponse.save().then(function (responseobjProductResponse) {
                                                            //Manage Category Name
                                                            // if (CategoryName == null || CategoryName == undefined || CategoryName == '') {
                                                            //     CategoryName = "Other";
                                                            // }
                                                            // // //Manage Category Name
                                                            // if (CategoryName != null && CategoryName != undefined && CategoryName != '') {


                                                            //     //Initialize Category Object
                                                            //     var objCategory = InitializeCategoryObject();
                                                            //     objCategory.Title = CategoryName;
                                                            //     objCategory.Name = CategoryName;
                                                            //     objCategory.Description = CategoryName;

                                                            //     var CatId = 0;
                                                            //     Category.findOrCreate({
                                                            //         where: {
                                                            //             Title: objCategory.Title
                                                            //         },
                                                            //         defaults: objCategory
                                                            //     }).then(function(responseCategory) {
                                                            //         if (responseCategory[0] != null) {

                                                            //             Cid = responseCategory[0].id;

                                                            //             //Initialize Category Mapping Object
                                                            //             var objProductCategorymapping = InitializeCategoryMappingObject();
                                                            //             objProductCategorymapping.CategoryId = Cid;
                                                            //             objProductCategorymapping.ProductId = ProductId;
                                                            //             ProductCategory.findOrCreate({
                                                            //                 where: {
                                                            //                     CategoryId: Cid,
                                                            //                     ProductId: ProductId
                                                            //                 },
                                                            //                 defaults: objProductCategorymapping
                                                            //             }).then(function(objProductCategoryExist) {
                                                            //                 //End Category

                                                            //                 //For SubCategory
                                                            //                 if (SubCategory != null && SubCategory != '' && SubCategory != undefined) {

                                                            //                     var arrSubCategory = SubCategory.split(",");

                                                            //                     if (arrSubCategory.length > 0) {
                                                            //                         function uploadSubCategoryExcel(j) {
                                                            //                             if (j < arrSubCategory.length) {
                                                            //                                 //Initialize Sub Category Object
                                                            //                                 var objSubCategory = InitializeCategoryObject();
                                                            //                                 objSubCategory.Title = arrSubCategory[j];
                                                            //                                 objSubCategory.Name = arrSubCategory[j];
                                                            //                                 objSubCategory.Parent = Cid;
                                                            //                                 objSubCategory.Description = arrSubCategory[j]; + " For " + CategoryName;

                                                            //                                 var SubCatId = 0;
                                                            //                                 Category.findOrCreate({
                                                            //                                     where: {
                                                            //                                         Title: objSubCategory.Title
                                                            //                                     },
                                                            //                                     defaults: objSubCategory
                                                            //                                 }).then(function(responseSubCategory) {
                                                            //                                     if (responseSubCategory[0] != null) {

                                                            //                                         SubCatId = responseSubCategory[0].id;

                                                            //                                         //Initialize Sub Category Mapping Object
                                                            //                                         var objProductSubCategorymapping = InitializeCategoryMappingObject();
                                                            //                                         objProductSubCategorymapping.CategoryId = SubCatId;
                                                            //                                         objProductSubCategorymapping.ProductId = ProductId;
                                                            //                                         ProductCategory.findOrCreate({
                                                            //                                             where: {
                                                            //                                                 CategoryId: SubCatId,
                                                            //                                                 ProductId: ProductId
                                                            //                                             },
                                                            //                                             defaults: objProductSubCategorymapping
                                                            //                                         }).then(function(objProductSubCategoryExist) {
                                                            //                                             uploadSubCategoryExcel(j + 1);
                                                            //                                         });
                                                            //                                     } else {
                                                            //                                         uploadSubCategoryExcel(j + 1);
                                                            //                                     }
                                                            //                                 });
                                                            //                             } else {

                                                            //                                 UpdateAll();
                                                            //                             }
                                                            //                         }
                                                            //                         uploadSubCategoryExcel(0);
                                                            //                     } else {
                                                            //                         UpdateAll();

                                                            //                     }
                                                            //                 } else {
                                                            //                     UpdateAll();
                                                            //                 }
                                                            //                 //End Sub Category

                                                            //             })
                                                            //         } else {
                                                            //             UpdateAll();
                                                            //         }
                                                            //     });

                                                            // } else {
                                                            //     UpdateAll();
                                                            // }

                                                            UpdateAll();

                                                            function UpdateAll() {
                                                                function FindExcelAttribute(k) {
                                                                    if (k < lstAllVarient.length) {
                                                                        if (k > 11) {
                                                                            lstVarient.push(lstAllVarient[k]);

                                                                        }
                                                                        FindExcelAttribute(k + 1);
                                                                    } else {
                                                                        if (lstVarient.length > 0) {
                                                                            var lstProductAttributeCombXml = [];
                                                                            var AttributeString = '';
                                                                            var AttributeValueString = '';
                                                                            var XMLAtt = '';

                                                                            function ManageAttributes(l) {
                                                                                if (l < lstVarient.length) {

                                                                                    var AttributeName = lstVarient[l];
                                                                                    var VarientName = lst[i][AttributeName];

                                                                                    if (VarientName != null && VarientName != '' && VarientName != undefined) {
                                                                                        //Get Attribute id if  exist or create New Attribute
                                                                                        var objProductAttribute = InitializeProductAttributeObject();
                                                                                        objProductAttribute.Name = AttributeName;
                                                                                        objProductAttribute.Description = AttributeName;
                                                                                        var AttributeId = 0;
                                                                                        ProductAttribute.findOrCreate({
                                                                                            where: {
                                                                                                Name: objProductAttribute.Name
                                                                                            },
                                                                                            defaults: objProductAttribute
                                                                                        }).then(function (responseProductAttribute) {
                                                                                            var objresponseProductAttribute = responseProductAttribute[0];
                                                                                            var flgresponseProductAttribute = responseProductAttribute[1];

                                                                                            AttributeId = objresponseProductAttribute.Id;

                                                                                            //Now Manage Product Attribute Mapping
                                                                                            //Initialize Product Attribute Mapping Object
                                                                                            var objProductAttributeMapping = InitializeProductAttributeMappingObject();
                                                                                            objProductAttributeMapping.ProductAttributeId = AttributeId;
                                                                                            objProductAttributeMapping.ProductId = ProductId;
                                                                                            ProductAttributeMapping.findOrCreate({
                                                                                                where: {
                                                                                                    ProductAttributeId: objProductAttributeMapping.ProductAttributeId,
                                                                                                    ProductId: objProductAttributeMapping.ProductId
                                                                                                },
                                                                                                defaults: objProductAttributeMapping
                                                                                            }).then(function (responseProductAttributeMapping) {
                                                                                                //End Product Attribute Mapping

                                                                                                var ProductAttributeMappingId = responseProductAttributeMapping[0].Id;
                                                                                                //Now Manage Product Attribute Value
                                                                                                //Initialize Product Attribute Value Object
                                                                                                var objProductAttributeValue = InitializeProductAttributeValueObject();
                                                                                                objProductAttributeValue.ProductAttributeMappingId = ProductAttributeMappingId;
                                                                                                objProductAttributeValue.Name = VarientName;
                                                                                                //objProductAttributeValue.PriceAdjustment = objProduct.Price;
                                                                                                objProductAttributeValue.WeightAdjustment = objProduct.Weight;
                                                                                                objProductAttributeValue.Cost = objProduct.ProductCost;
                                                                                                objProductAttributeValue.Quantity = objProduct.StockQuantity;
                                                                                                objProductAttributeValue.Price = objProduct.AttributePrice;
                                                                                                objProductAttributeValue.OldPrice = objProduct.AttributeOldPrice;
                                                                                                ProductAttributeValue.findOrCreate({
                                                                                                    where: {
                                                                                                        ProductAttributeMappingId: objProductAttributeValue.ProductAttributeMappingId,
                                                                                                        Name: objProductAttributeValue.Name
                                                                                                    },
                                                                                                    defaults: objProductAttributeValue
                                                                                                }).then(function (responseProductAttributeValue) {

                                                                                                    var obj = new Object();
                                                                                                    obj.ID = AttributeId;
                                                                                                    obj.Value = responseProductAttributeValue[0].Id;
                                                                                                    var objexist = u.findWhere(lstProductAttributeCombXml, {
                                                                                                        ID: AttributeId,
                                                                                                        Value: responseProductAttributeValue[0].Id
                                                                                                    });
                                                                                                    if (objexist == undefined || objexist == '' || objexist == null) {
                                                                                                        lstProductAttributeCombXml.push(obj);
                                                                                                    }
                                                                                                    ManageAttributes(l + 1);

                                                                                                })
                                                                                            })
                                                                                        })
                                                                                    } else {
                                                                                        ManageAttributes(l + 1);
                                                                                    }
                                                                                } else {
                                                                                    // for (var o = 0; o < lstProductAttributeCombXml.length; o++) {
                                                                                    //     var obj = lstProductAttributeCombXml[o];
                                                                                    //     if (XMLAtt == null || XMLAtt == '') {
                                                                                    //         XMLAtt = "<Attributes>";
                                                                                    //     }

                                                                                    //     XMLAtt = XMLAtt + '<ProductVariantAttribute ID="' + obj.ID + '">';
                                                                                    //     XMLAtt = XMLAtt + '<ProductVariantAttributeValue>';
                                                                                    //     XMLAtt = XMLAtt + '<Value>' + obj.Value + '</Value>';
                                                                                    //     XMLAtt = XMLAtt + '</ProductVariantAttributeValue>';
                                                                                    //     XMLAtt = XMLAtt + '</ProductVariantAttribute>';
                                                                                    //     if (o + 1 == lstProductAttributeCombXml.length) {
                                                                                    //         XMLAtt = XMLAtt + "</Attributes>";
                                                                                    //     }

                                                                                    //     if (AttributeString == '') {
                                                                                    //         AttributeString = obj.ID;
                                                                                    //         AttributeValueString = obj.Value;
                                                                                    //     } else {
                                                                                    //         AttributeString = AttributeString + "," + obj.ID;
                                                                                    //         AttributeValueString = AttributeValueString + "," + obj.Value;
                                                                                    //     }
                                                                                    // };
                                                                                    uploadExcel(i + 1);
                                                                                    // if (AttributeString != '' && AttributeString != null && AttributeString != undefined) {
                                                                                    //     //Now Manage Product Attribute Combination
                                                                                    //     //Initialize Product Attribute Combination Object
                                                                                    //     var objProductAttributeCombination = InitializeProductAttributeCombinationObject();
                                                                                    //     objProductAttributeCombination.ProductId = ProductId;
                                                                                    //     objProductAttributeCombination.AttributesXml = XMLAtt;
                                                                                    //     objProductAttributeCombination.StockQuantity = objProduct.StockQuantity;
                                                                                    //     objProductAttributeCombination.AllowOutOfStockOrders = false;
                                                                                    //     objProductAttributeCombination.Sku = objProduct.Sku;
                                                                                    //     objProductAttributeCombination.OverriddenPrice = objProduct.Price;
                                                                                    //     objProductAttributeCombination.NotifyAdminForQuantityBelow = 1;
                                                                                    //     objProductAttributeCombination.AttributeString = AttributeString;
                                                                                    //     objProductAttributeCombination.AttributeValueString = AttributeValueString;


                                                                                    //     var objProductAttributeCombinationPrice = InitializeProductAttributeCombinationPriceObject();
                                                                                    //     ProductAttributeCombination.findOrCreate({
                                                                                    //         where: {
                                                                                    //             ProductId: objProductAttributeCombination.ProductId,
                                                                                    //             AttributeValueString: objProductAttributeCombination.AttributeValueString
                                                                                    //         },
                                                                                    //         defaults: objProductAttributeCombination
                                                                                    //     }).then(function(responseProductAttributeCombination) {
                                                                                    //         objProductAttributeCombinationPrice.ProductAttributeCombinationId = responseProductAttributeCombination[0].Id;
                                                                                    //         objProductAttributeCombinationPrice.Price = objProductAttributeCombination.OverriddenPrice;
                                                                                    //         objProductAttributeCombinationPrice.Quantity = objProductAttributeCombination.StockQuantity;

                                                                                    //         var objRole = new Object();
                                                                                    //         objRole.id = 0;
                                                                                    //         objRole.RoleName = "User";
                                                                                    //         objRole.Description = "User";
                                                                                    //         Role.findOrCreate({
                                                                                    //             where: {
                                                                                    //                 RoleName: objRole.RoleName
                                                                                    //             },
                                                                                    //             defaults: objRole
                                                                                    //         }).then(function(responseRole) {
                                                                                    //             var Roleid = responseRole[0].id;
                                                                                    //             objProductAttributeCombinationPrice.UserRoleId = Roleid;
                                                                                    //             CombinationTierPrice.findOrCreate({
                                                                                    //                 where: {
                                                                                    //                     ProductAttributeCombinationId: objProductAttributeCombinationPrice.ProductAttributeCombinationId,
                                                                                    //                     Type: objProductAttributeCombinationPrice.Type,
                                                                                    //                     UserRoleId: objProductAttributeCombinationPrice.UserRoleId
                                                                                    //                 },
                                                                                    //                 defaults: objProductAttributeCombinationPrice
                                                                                    //             }).then(function(responseCombinationTierPrice) {
                                                                                    //                 if (responseCombinationTierPrice != null) {
                                                                                    //                     uploadExcel(i + 1);
                                                                                    //                 }

                                                                                    //             });

                                                                                    //         })


                                                                                    //     });
                                                                                    // } else {
                                                                                    //     uploadExcel(i + 1);
                                                                                    // }

                                                                                }
                                                                            }
                                                                            ManageAttributes(0);
                                                                        } else {
                                                                            uploadExcel(i + 1);

                                                                        }
                                                                    }
                                                                }
                                                                FindExcelAttribute(0);

                                                            }

                                                        });

                                                    }
                                                }
                                            });

                                        } else {

                                            res.json({
                                                success: true,
                                                message: "Excel File uploaded successfully..",
                                            });
                                        }
                                    }
                                    uploadExcel(0);
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Excel File is Not in Valid Format, You can Download Template for import Excel File.",
                                    });
                                }
                            } else {
                                res.json({
                                    success: false,
                                    message: "No Data in Excel File..",
                                });
                            }
                        }
                    } else {
                        res.json({
                            success: false,
                            message: "Error in Import , Excel File is Protected..",
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        message: "No File Found..",
                    });
                };
            }
        });

    });
    //         }
    //         ImportData();

    //         //     function ImportData() {
    //     }
    // });




    //             }
    //         });
    //     } else {
    //         res.json(NoAccessPermission);
    //     }
    // });
})

function GetUserNameFromDate() {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();

    var seconds = d.getSeconds();
    var minutes = d.getMinutes();
    var hour = d.getHours();

    var milisec = d.getMilliseconds();

    return curr_year.toString() + curr_month.toString() + curr_date.toString() + hour.toString() + minutes.toString() + seconds.toString() + milisec.toString();


}

//Initialize Product Object
function InitializeProductObject() {
    var objProduct = new Object();
    objProduct.Id = 0;
    objProduct.ProductTypeId = 5;
    objProduct.ParentGroupedProductId = 0;
    objProduct.VisibleIndividually = true;
    objProduct.ProductTemplateId = 0;
    objProduct.Name = '';
    objProduct.ShortDescription = '';
    objProduct.FullDescription = '';
    objProduct.AdminComment = '';
    objProduct.VendorId = 0;
    objProduct.BrandId = 0;
    objProduct.DisplayOrder = 0;
    objProduct.ShowOnHomePage = false;
    objProduct.AllowCustomerReviews = true;
    objProduct.Sku = '';
    objProduct.Price = 0.0000;
    objProduct.OldPrice = 0.0000;
    objProduct.ProductCost = 0.0000;
    objProduct.SpecialPrice = 0;
    objProduct.SpecialPriceStartDateTimeUtc = null;
    objProduct.SpecialPriceEndDateTimeUtc = null;
    objProduct.DisableBuyButton = false;
    objProduct.DisableWishlistButton = false;
    objProduct.AvailableForPreOrder = false;
    objProduct.PreOrderAvailabilityStartDateTimeUtc = null;
    objProduct.CallForPrice = false;
    objProduct.CustomerEntersPrice = false;
    objProduct.MinimumCustomerEnteredPrice = 0.0000;
    objProduct.MaximumCustomerEnteredPrice = 1000.0000;
    objProduct.RequireOtherProducts = false;
    objProduct.RequiredProductIds = '';
    objProduct.RequireProductNames = '';
    objProduct.AutomaticallyAddRequiredProducts = false;
    objProduct.IsGiftCard = false;
    objProduct.GiftCardTypeId = 0;
    objProduct.IsDownload = false;
    objProduct.IsRecurring = false;
    objProduct.RecurringCycleLength = 100;
    objProduct.RecurringCyclePeriodId = 0;
    objProduct.RecurringTotalCycles = 10;
    objProduct.IsRental = false;
    objProduct.RentalPriceLength = 1;
    objProduct.RentalPricePeriodId = 0;
    objProduct.IsShipEnabled = true;
    objProduct.IsFreeShipping = false;
    objProduct.ShipSeparately = false;
    objProduct.AdditionalShippingCharge = 0.0000;
    objProduct.Weight = 0.0000;
    objProduct.Length = 0.0000;
    objProduct.Width = 0.0000;
    objProduct.Height = 0.0000;
    objProduct.DeliveryDateId = '0';
    objProduct.IsTaxExempt = false;
    objProduct.TaxCategoryId = 0;
    objProduct.IsTelecommunicationsOrBroadcastingOrElectronicServices = false;
    objProduct.ManageInventoryMethodId = 0;
    objProduct.UseMultipleWarehouses = false;
    objProduct.WarehouseId = 0;
    objProduct.StockQuantity = 10000;
    objProduct.DisplayStockAvailability = false;
    objProduct.DisplayStockQuantity = false;
    objProduct.MinStockQuantity = 0;
    objProduct.LowStockActivityId = 0;
    objProduct.NotifyAdminForQuantityBelow = 1;
    objProduct.BackorderModeId = 0;
    objProduct.AllowBackInStockSubscriptions = false;
    objProduct.OrderMinimumQuantity = 1;
    objProduct.OrderMaximumQuantity = 10000;
    objProduct.AllowedQuantities = '';
    objProduct.AllowAddingOnlyExistingAttributeCombinations = false;
    objProduct.AvailableStartDateTimeUtc = null;
    objProduct.AvailableEndDateTimeUtc = null;
    objProduct.Published = true;
    objProduct.CreatedOnUtc = null;
    objProduct.UpdatedOnUtc = null;
    objProduct.MetaKeywords = '';
    objProduct.MetaDescription = '';
    objProduct.MetaTitle = '';
    objProduct.HasDiscountsApplied = false;
    objProduct.SubjectToAcl = false;
    objProduct.LimitedToStores = false;
    objProduct.SearchText = '';
    objProduct.LstDiscount = '';
    objProduct.ApprovedRatingSum = 0;
    objProduct.NotApprovedRatingSum = 0;
    objProduct.ApprovedTotalReviews = 0;
    objProduct.NotApprovedTotalReviews = 0;
    return objProduct;
}

function InitializeMediaObject() {
    var objMedia = new Object();
    objMedia.id = 0;
    objMedia.FileName = '';
    objMedia.Author = '';
    objMedia.Caption = '';
    objMedia.AltText = '';
    objMedia.Description = '';
    objMedia.Name = '';
    return objMedia;
}

function InitializeProductPirctureMappingObject() {
    var objProductPirctureMapping = new Object();
    objProductPirctureMapping.Id = 0;
    objProductPirctureMapping.ProductId = 0;
    objProductPirctureMapping.PictureId = 0;
    objProductPirctureMapping.DisplayOrder = 0;
    return objProductPirctureMapping;
}

function InitializeCategoryObject() {
    var objCategory = new Object();
    objCategory.id = 0;
    objCategory.Parent = 0;
    objCategory.Name = '';
    objCategory.Title = '';
    objCategory.Description = '';
    objCategory.Seq = '0';
    objCategory.CreatedBy = 'Admin';
    objCategory.CreatedDate = new Date();
    objCategory.ModifiedBy = '';
    objCategory.ModifiedDate = null;

    return objCategory;
}

function InitializeCategoryMappingObject() {
    var ObjCategoryMapping = new Object();
    ObjCategoryMapping.Id = 0;
    ObjCategoryMapping.ProductId = 0;
    ObjCategoryMapping.CategoryId = 0;
    ObjCategoryMapping.IsFeaturedProduct = false;
    ObjCategoryMapping.DisplayOrder = 0;
    return ObjCategoryMapping;
}

function InitializeProductAttributeObject() {

    var objProductAttribute = new Object();
    objProductAttribute.Id = 0;
    objProductAttribute.Name = 0;
    objProductAttribute.Description = 0;

    return objProductAttribute;
}

function InitializeProductAttributeMappingObject() {
    var objProductAttributeMapping = new Object();
    objProductAttributeMapping.Id = 0;
    objProductAttributeMapping.ProductId = 0;
    objProductAttributeMapping.ProductAttributeId = 0;
    objProductAttributeMapping.TextPrompt = '';
    objProductAttributeMapping.IsRequired = false;
    objProductAttributeMapping.AttributeControlType = 'Drop-down list';
    objProductAttributeMapping.DisplayOrder = 0;
    objProductAttributeMapping.ValidationMinLength = 0;
    objProductAttributeMapping.ValidationMaxLength = 0;
    objProductAttributeMapping.ValidationFileAllowedExtensions = '';
    objProductAttributeMapping.ValidationFileMaximumSize = 0;
    objProductAttributeMapping.DefaultValue = 0;

    return objProductAttributeMapping;
}

function InitializeProductAttributeValueObject() {
    var objProductAttributeValue = new Object();
    objProductAttributeValue.Id = 0;
    objProductAttributeValue.ProductAttributeMappingId = 0;
    objProductAttributeValue.AttributeValueTypeId = 0;
    objProductAttributeValue.AssociatedProductId = 0;
    objProductAttributeValue.Name = '';
    objProductAttributeValue.ColorSquaresRgb = '';
    objProductAttributeValue.PriceAdjustment = 0;
    objProductAttributeValue.WeightAdjustment = 0;
    objProductAttributeValue.Cost = 0;
    objProductAttributeValue.Quantity = 0;
    objProductAttributeValue.IsPreSelected = false;
    objProductAttributeValue.DisplayOrder = 0;
    objProductAttributeValue.PictureId = 0;
    objProductAttributeValue.Price = 0;
    objProductAttributeValue.OldPrice = 0;
    objProductAttributeValue.ProductCost = 0;
    objProductAttributeValue.SpecialPrice = 0;
    objProductAttributeValue.SpecialPriceStartDateTimeUtc = null;
    objProductAttributeValue.SpecialPriceEndDateTimeUtc = null;
    return objProductAttributeValue;
}

function InitializeProductAttributeCombinationObject() {
    var objProductAttributeCombination = new Object();
    objProductAttributeCombination.Id = 0;
    objProductAttributeCombination.ProductId = 0;
    objProductAttributeCombination.AttributesXml = '';
    objProductAttributeCombination.StockQuantity = 0;
    objProductAttributeCombination.AllowOutOfStockOrders = false;
    objProductAttributeCombination.Sku = '';
    objProductAttributeCombination.ManufacturerPartNumber = '';
    objProductAttributeCombination.Gtin = '';
    objProductAttributeCombination.OverriddenPrice = 0;
    objProductAttributeCombination.NotifyAdminForQuantityBelow = 0;
    objProductAttributeCombination.AttributeString = '';
    objProductAttributeCombination.AttributeValueString = '';

    return objProductAttributeCombination;
}


function InitializeProductAttributeCombinationPriceObject() {
    var objProductAttributeCombinationPrice = new Object();
    objProductAttributeCombinationPrice.id = 0;
    objProductAttributeCombinationPrice.ProductAttributeCombinationId = 0;
    objProductAttributeCombinationPrice.UserRoleId = 0;
    objProductAttributeCombinationPrice.Quantity = 0;
    objProductAttributeCombinationPrice.Price = 0;
    objProductAttributeCombinationPrice.Type = 'Role';
    return objProductAttributeCombinationPrice;
}

function GetCategoryIdFromImport(objCategory) {
    var Cid = 0;
    Category.findOrCreate({
        where: {
            Title: objCategory.Title
        },
        defaults: objCategory
    }).then(function (response) {
        if (response[0] != null) {
            Cid = response[0].id;
            return Cid;
        }
    });

}



//Copy Product Panel functions
function manageProductCategoryMapping(oldProductId, newProductId) {
    ProductCategory.findAll({
        where: {
            ProductId: oldProductId
        }
    }).then(function (response) {
        var lstProductCategory = [];
        for (var i = 0; i < response.length; i++) {
            var objProductCategory = {
                CategoryId: response[i].CategoryId,
                DisplayOrder: response[i].DisplayOrder,
                IsFeaturedProduct: response[i].IsFeaturedProduct,
                ProductId: newProductId
            }
            lstProductCategory.push(objProductCategory);

            if (i == response.length - 1) {
                ProductCategory.bulkCreate(lstProductCategory).then(function (resProductCategory) { })
            }
        }
    })
}

function manageProductManufacturerMapping(oldProductId, newProductId) {
    ProductManufacturer.findAll({
        where: {
            ProductId: oldProductId
        }
    }).then(function (response) {
        var lstProductManufacturer = [];
        for (var i = 0; i < response.length; i++) {
            var objProductManufacturer = {
                ManufacturerId: response[i].ManufacturerId,
                DisplayOrder: response[i].DisplayOrder,
                IsFeaturedProduct: response[i].IsFeaturedProduct,
                ProductId: newProductId
            }
            lstProductManufacturer.push(objProductManufacturer);

            if (i == response.length - 1) {
                ProductManufacturer.bulkCreate(lstProductManufacturer).then(function (resProductManufacturer) { })
            }
        }
    })
}

function manageProductSpecificationAttributeMapping(oldProductId, newProductId) {
    ProductSpecificationAttribute.findAll({
        where: {
            ProductId: oldProductId
        }
    }).then(function (response) {
        var lstProductSpecificationAttribute = [];
        for (var i = 0; i < response.length; i++) {
            var objProductSpecificationAttribute = {
                AttributeTypeId: response[i].AttributeTypeId,
                DisplayOrder: response[i].DisplayOrder,
                SpecificationAttributeOptionId: response[i].SpecificationAttributeOptionId,
                CustomValue: response[i].CustomValue,
                AllowFiltering: response[i].AllowFiltering,
                ShowOnProductPage: response[i].ShowOnProductPage,
                ProductId: newProductId
            }
            lstProductSpecificationAttribute.push(objProductSpecificationAttribute);

            if (i == response.length - 1) {
                ProductSpecificationAttribute.bulkCreate(lstProductSpecificationAttribute).then(function (resProductSpecificationAttribute) { })
            }
        }
    })
}

function manageProductAttributeMapping(oldProductId, newProductId) {
    ProductAttributeMaping.findAll({
        where: {
            ProductId: oldProductId
        }
    }).then(function (response) {
        var lstProductAttributeMaping = [];
        for (var i = 0; i < response.length; i++) {
            var objProductAttributeMaping = {
                ProductAttributeId: response[i].ProductAttributeId,
                DisplayOrder: response[i].DisplayOrder,
                TextPrompt: response[i].TextPrompt,
                IsRequired: response[i].IsRequired,
                AttributeControlType: response[i].AttributeControlType,
                ValidationMinLength: response[i].ValidationMinLength,
                ValidationMaxLength: response[i].ValidationMaxLength,
                ValidationFileAllowedExtensions: response[i].ValidationFileAllowedExtensions,
                ValidationFileMaximumSize: response[i].ValidationFileMaximumSize,
                ProductId: newProductId
            }
            lstProductAttributeMaping.push(objProductAttributeMaping);

            if (i == response.length - 1) {
                ProductAttributeMaping.bulkCreate(lstProductAttributeMaping).then(function (resProductAttributeMaping) { })
            }
        }
    })
}

function manageProductAttributeCombination(oldProductId, newProductId) {
    ProductAttributeCombination.findAll({
        where: {
            ProductId: oldProductId
        }
    }).then(function (response) {
        var lstProductAttributeCombination = [];
        for (var i = 0; i < response.length; i++) {
            var objProductAttributeCombination = {
                AttributesXml: response[i].AttributesXml,
                StockQuantity: response[i].StockQuantity,
                AllowOutOfStockOrders: response[i].AllowOutOfStockOrders,
                Sku: response[i].Sku,
                ManufacturerPartNumber: response[i].ManufacturerPartNumber,
                Gtin: response[i].Gtin,
                OverriddenPrice: response[i].OverriddenPrice,
                NotifyAdminForQuantityBelow: response[i].NotifyAdminForQuantityBelow,
                ProductId: newProductId
            }
            lstProductAttributeCombination.push(objProductAttributeCombination);

            if (i == response.length - 1) {
                ProductAttributeCombination.bulkCreate(lstProductAttributeCombination).then(function (resProductAttributeCombination) { })
            }
        }
    })
}

function manageTierPrice(oldProductId, newProductId) {
    ProductTierPrice.findAll({
        where: {
            ProductId: oldProductId
        }
    }).then(function (response) {
        var lstProductTierPrice = [];
        for (var i = 0; i < response.length; i++) {
            var objProductTierPrice = {
                StoreId: response[i].StoreId,
                CustomerRoleId: response[i].CustomerRoleId,
                Price: response[i].Price,
                Quantity: response[i].Quantity,
                ProductId: newProductId
            }
            lstProductTierPrice.push(objProductTierPrice);

            if (i == response.length - 1) {

                ProductTierPrice.bulkCreate(lstProductTierPrice).then(function (resProductTierPrice) { })
            }
        }
    })
}

function manageProductPictureMapping(oldProductId, newProductId) {
    ProductPictureMaping.findAll({
        where: {
            ProductId: oldProductId
        }
    }).then(function (response) {
        var lstProductPictureMaping = [];
        for (var i = 0; i < response.length; i++) {
            var objProductPictureMaping = {
                PictureId: response[i].PictureId,
                DisplayOrder: response[i].DisplayOrder,
                ProductId: newProductId
            }
            lstProductPictureMaping.push(objProductPictureMaping);

            if (i == response.length - 1) {
                ProductPictureMaping.bulkCreate(lstProductPictureMaping).then(function (resProductPictureMaping) { })
            }
        }
    })
}

function manageRelatedProduct(oldProductId, newProductId) {
    RelatedProduct.findAll({
        where: {
            ProductId1: oldProductId
        }
    }).then(function (response) {
        var lstRelatedProduct = [];
        for (var i = 0; i < response.length; i++) {
            var objRelatedProduct = {
                ProductId2: response[i].ProductId2,
                DisplayOrder: response[i].DisplayOrder,
                ProductId1: newProductId
            }
            lstRelatedProduct.push(objRelatedProduct);

            if (i == response.length - 1) {
                RelatedProduct.bulkCreate(lstRelatedProduct).then(function (resRelatedProduct) { })
            }
        }
    })
}

function manageCrossSellProduct(oldProductId, newProductId) {
    CrossSellProduct.findAll({
        where: {
            ProductId1: oldProductId
        }
    }).then(function (response) {
        var lstCrossSellProduct = [];
        for (var i = 0; i < response.length; i++) {
            var objCrossSellProduct = {
                ProductId2: response[i].ProductId2,
                ProductId1: newProductId
            }
            lstCrossSellProduct.push(objCrossSellProduct);

            if (i == response.length - 1) {
                CrossSellProduct.bulkCreate(lstCrossSellProduct).then(function (resCrossSellProduct) { })
            }
        }
    })
}
//End of Copy Product Panel functions

// function GetProductCombinationforExport(idProduct, callback) {
//     CombinationTierPrice.belongsTo(ProductAttributeCombination, {
//         foreignKey: {
//             name: 'ProductAttributeCombinationId',
//             allowNull: false
//         }
//     });
//     CombinationTierPrice.belongsTo(Role, {
//         foreignKey: {
//             name: 'UserRoleId',
//             allowNull: false
//         }
//     });
//     CombinationTierPrice.belongsTo(User, {
//         foreignKey: {
//             name: 'UserRoleId',
//             allowNull: false
//         }
//     });

//     CombinationTierPrice.findAll({
//         include: [{
//             model: ProductAttributeCombination,
//             where: {
//                 ProductId: parseInt(idProduct)
//             }
//         }, {
//             model: Role,
//             attributes: ['id', 'RoleName']
//         }, {
//             model: User,
//             attributes: ['id', 'username']
//         }]
//     }).then(function(response) {
//         var lstResponse = [];
//         if (response.length > 0) {
//             function uploader(i) {
//                 if (i < response.length) {
//                     var arrAttributeString = response[i].productattributecombination.AttributeString.split(',');
//                     var arrAttributeValueString = response[i].productattributecombination.AttributeValueString.split(',');
//                     var CombinationPrice = response[i].Price;
//                     var ProductCombinationid = response[i].productattributecombination.Id;
//                     var val = '';
//                     if (arrAttributeString.length > 0) {
//                         function arruploader(j) {
//                             if (j < arrAttributeString.length) {
//                                 if (arrAttributeString[j] != null && arrAttributeString[j] != '' && arrAttributeString[j] != undefined) {
//                                     var id = parseInt(arrAttributeString[j]);
//                                     ProductAttribute.findOne({
//                                         where: {
//                                             Id: id
//                                         }
//                                     }).then(function(resProductAttribute) {
//                                         if (arrAttributeValueString[j] != null && arrAttributeValueString[j] != '' && arrAttributeValueString[j] != undefined) {
//                                             ProductAttributeValue.findOne({
//                                                 where: {
//                                                     Id: arrAttributeValueString[j]
//                                                 }
//                                             }).then(function(resProductAttributeValue) {
//                                                 if (resProductAttributeValue != null && resProductAttributeValue != '' && resProductAttributeValue != undefined) {
//                                                     var obj = {
//                                                         AttributeColName: resProductAttribute.Name,
//                                                         AttributeColValue: resProductAttributeValue.Name,
//                                                         CombinationPrice: CombinationPrice,
//                                                         ProductCombinationid: ProductCombinationid,
//                                                     }
//                                                     lstResponse.push(obj);
//                                                 }
//                                                 arruploader(j + 1);

//                                             })
//                                         } else {
//                                             arruploader(j + 1);
//                                         }
//                                     })
//                                 } else {
//                                     arruploader(j + 1);
//                                 }
//                             } else {
//                                 uploader(i + 1);
//                             }
//                         }
//                         arruploader(0);
//                     }

//                 } else {
//                     return callback(lstResponse);

//                 }
//             }
//             uploader(0);
//         } else {
//             return callback(lstResponse);
//         }
//     })

//     // urllib.request(urlToCall, { wd: 'nodejs' }, function(err, data, response) {
//     //     var statusCode = response.statusCode;
//     //     finalData = getResponseJson(statusCode, data.toString());
//     //     return callback(finalData);
//     // });
// }

//var gm = require("gm");

// router.get('/resizeimage', function(req, res) {

//     var dstPath = 'MediaUploads/Img1_resize.jpg';
//     var srcpath = 'MediaUploads/Img1.jpg';
//     var imdata = fs.readFileSync(srcpath, 'binary');
//     // im.identify(srcpath, function(err, features) {
//     //     console.log(err);
//     //     // if (err) return console.error(err.stack || err);
//     //     // console.log('identify(path) ->', features);
//     // })


//     // im.resize({
//     //     srcData: imdata,
//     //     width: 300,
//     //     height: 300
//     // }, function(err, stdout, stderr) {
//     //     if (err) return console.error(err.stack || err);
//     //     fs.writeFileSync(dstPath, stdout, 'binary');
//     //     console.log('resize(...) wrote "test-resized.jpg" (' + stdout.length + ' Bytes)');
//     // })


//     gm(srcpath)
//         .resize(353, 257)
//         .autoOrient()
//         .write(imdata, function(err) {
//             console.log(err);
//             if (!err) console.log(' hooray! ');
//         });
// });


router.get('/CheckProductIsAddable', function (req, res) {
    var ProductType = "";
    Product.findAll({
        where: {
            VendorId: req.query.VendorId,
            ProductTypeId: req.query.ProductTypeId,
            Deleted: false
        }
    }).then(function (resProduct) {
        if (req.query.ProductTypeId != null && req.query.ProductTypeId != "" && req.query.ProductTypeId != undefined) {
            if (req.query.ProductTypeId == "1") {
                ProductType = "VeterinarySlot";
            }
            if (req.query.ProductTypeId == "2") {
                ProductType = "ProductSlot";
            }
        }

        Setting.findOne({
            where: {
                Name: ProductType
            }
        }).then(function (resSetting) {
            if (resSetting != null) {
                if (resSetting.Value <= resProduct.length) {
                    res.json({
                        success: false,
                        message: "Product Slot is full",
                        data: resSetting
                    });
                } else {
                    res.json({
                        success: true,
                        message: "Product Slot is not full",
                        data: resSetting
                    });
                }
            } else {
                res.json({
                    success: true,
                    message: "Product Slot is not full",
                    data: resSetting
                });
            }
        })
    })
});
router.get('/GetHotSeelingProductForApp', function (req, res) {
    var objParam = req.query;

    var offset = (parseInt(objParam.page) * 4);

    var Productmodel = [];
    var search = {};

    search['$and'] = [];

    var obj = new Object();
    obj['Deleted'] = {
        $ne: true
    };
    search['$and'].push(obj);

    var obj = new Object();
    obj['IsHotSelling'] = {
        $eq: true
    };
    search['$and'].push(obj);

    var obj = new Object();
    obj['Published'] = {
        $eq: true
    };
    search['$and'].push(obj);
    //var Orderby = 'Id desc LIMIT ' + parseInt(offset) + ', 4';

    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });


    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });

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

    Product.hasMany(ProductAttributeMapping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });

    ProductAttributeValue.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });

    Product.findAndCountAll({
        where: search,
        offset: parseInt(offset),
        limit: 4,
        order: [
            ['Id', 'desc']
        ],
        include: [{
            model: ProductPictureMaping,
            require: false,
            include: [{
                model: MediaMgmt,
                require: true
            }],
        }, {
            model: ProductAttributeMapping,

            include: [{
                model: ProductAttribute
            }, {
                model: ProductAttributeValue,
                //order: Orderby,
                include: [{
                    model: MediaMgmt,
                    attributes: ['Id', 'FileName']
                }]
            }]
        }],
    }).then(function (response) {
        // res.json({ success: true, response: response });
        var response1 = new Object();
        // response1.draw = objParam.draw;
        // response1.recordsTotal = response.count;
        // response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function (error) {
        res.json({
            success: false,
            response: error
        });
    })
})
router.get('/GetAllProductForApp', function (req, res) {
    var objParam = req.query;
    var offset = (parseInt(objParam.page) * 4);
    var Productmodel = [];
    var search = {};
    var search1 = {};
    var order = [];
    var orderProdcut = [];
    var orderattribute = [];

    search['$and'] = [];

    var obj = new Object();
    obj['Deleted'] = {
        $ne: true
    };
    search['$and'].push(obj);
    var obj1 = new Object();
    obj1['ProductTypeId'] = {
        $ne: 2
    };
    search['$and'].push(obj1);

    var obj2 = new Object();
    obj2['ProductTypeId'] = {
        $ne: 3
    };
    search['$and'].push(obj2);

    var obj = new Object();
    obj['Published'] = {
        $eq: true
    };
    search['$and'].push(obj);

    var Orderby = '';
    var OrderbyPrice;
    if (objParam.sortBy == "PriceHighLow") {
        // order.push('truprice');
        // order.push('desc');
        order = 'truprice desc'
    } else if (objParam.sortBy == "PriceLowHigh") {
        // order.push('truprice');
        // order.push('asc');
        order = 'truprice asc'
    } else {
        // order.push('Id');
        // order.push('desc');
        order = '`product`.`Id` desc'
        //Orderby = 'Id desc'; // LIMIT ' + parseInt(offset) + ', ' + parseInt(objParam.limit) + '';
    }

    Product.hasMany(ProductAttributeMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });
    ProductAttributeMaping.belongsTo(ProductAttribute, {
        foreignKey: {
            name: 'ProductAttributeId',
            allowNull: false
        }
    });
    ProductAttributeMaping.hasMany(ProductAttributeValue, {
        foreignKey: {
            name: 'ProductAttributeMappingId',
            allowNull: false
        }
    });
    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });
    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });
    Product.findAll({
        attributes: Object.keys(Product.attributes).concat([
            [
                models.sequelize.literal('IF((case when `product_productattribute_mappings.productattributevalues`.`Price` is null then 0 else `product_productattribute_mappings.productattributevalues`.`Price` end)>0,(case when `product_productattribute_mappings.productattributevalues`.`Price` is null then 0 else `product_productattribute_mappings.productattributevalues`.`Price` end),`product`.`Price`)'),
                'truprice'
            ]
        ]),
        where: search,
        order: order,
        offset: parseInt(offset),
        limit: parseInt(objParam.limit),
        group: ['product.id'],
        subQuery: false,
        include: [{
            model: ProductAttributeMapping,
            where: {
                IsRequired: true
            },
            required: false,
            attributes: ['Id', 'ProductId', 'ProductAttributeId', 'IsRequired'],
            include: [{
                model: ProductAttribute,
                attributes: ['Name']
            }, {
                where: {
                    Name: objParam.Country
                },
                required: false,
                model: ProductAttributeValue,
                attributes: ['Id', 'ProductAttributeMappingId', 'Name', 'Price', 'OldPrice', 'ProductCost']
            }]
        }, {
            model: ProductPictureMaping,
            attributes: ['Id', 'ProductId', 'PictureId'],
            include: [{
                model: MediaMgmt,
                attributes: ['Id', 'FileName', 'Name']
            }]
        }]
    }).then(function (response) {
        var response1 = new Object();
        response1.data = response;
        res.json(response1);
    }).catch(function (error) {
        res.json({
            success: false,
            response: error
        });
    })
})

//Get Product By Id For FrontSide
router.get('/GetProductByIdForApp', function (req, res) {
    // Product.hasMany(ProductPictureMaping, {
    //     foreignKey: {
    //         name: 'ProductId',
    //         allowNull: false
    //     }
    // });
    //
    // ProductPictureMaping.belongsTo(MediaMgmt, {
    //     foreignKey: {
    //         name: 'PictureId',
    //         allowNull: false
    //     }
    // });
    var model = [];
    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });

    Product.hasMany(ProductTag, {
        foreignKey: {
            name: 'Product_Id',
            allowNull: false
        }
    });

    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });
    //
    Product.hasMany(RelatedProduct, {
        foreignKey: {
            name: 'ProductId1',
            allowNull: false
        }
    });

    RelatedProduct.belongsTo(Product, {
        foreignKey: {
            name: 'ProductId2',
            allowNull: false
        }
    });
    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });
    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });

    model.push({
        model: ProductPictureMaping,
        include: [MediaMgmt]
    }, {
            model: ProductTag,
            attributes: ['Name']
        }, {
            model: RelatedProduct,
            include: [{
                model: Product,
                include: {
                    model: ProductPictureMaping,
                    include: [MediaMgmt]
                }
            }]
        });
    Product.findAll({
        where: {
            Id: req.query.idProduct
        },
        include: model
        // include: [{
        //     model: ProductPictureMaping,
        //     include: [MediaMgmt]
        // }]

    }).then(function (response) {
        if (response != null) {
            res.json({
                success: true,
                response: response
            });
        } else {
            res.json({
                success: false,
                response: "Record not found..."
            });
        }

    })
})

router.get('/GetProductSearchForApp', function (req, res) {

    //var offset = (parseInt(req.query.page) * 4);

    var search = {};
    search['$or'] = [];


    var obj = new Object();
    obj["Name"] = {
        $like: '%' + req.query.Name + '%'
    };
    search['$or'].push(obj);

    search['$and'] = [];
    obj['Deleted'] = {
        $ne: true
    };
    search['$and'].push(obj);
    obj['Published'] = {
        $eq: 1
    };
    search['$and'].push(obj);

    var obj1 = new Object();
    obj1['ProductTypeId'] = {
        $ne: 2
    };
    search['$and'].push(obj1);

    var obj2 = new Object();
    obj2['ProductTypeId'] = {
        $ne: 3
    };

    var model = [];
    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });

    Product.hasMany(ProductTag, {
        foreignKey: {
            name: 'Product_Id',
            allowNull: false
        }
    });

    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });
    //
    Product.hasMany(RelatedProduct, {
        foreignKey: {
            name: 'ProductId1',
            allowNull: false
        }
    });

    RelatedProduct.belongsTo(Product, {
        foreignKey: {
            name: 'ProductId2',
            allowNull: false
        }
    });
    Product.hasMany(ProductPictureMaping, {
        foreignKey: {
            name: 'ProductId',
            allowNull: false
        }
    });
    ProductPictureMaping.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });

    model.push({
        model: ProductPictureMaping,
        include: [MediaMgmt]
    }, {
            model: ProductTag,
            attributes: ['Name']
        }, {
            model: RelatedProduct,
            include: [{
                model: Product,
                include: {
                    model: ProductPictureMaping,
                    include: [MediaMgmt]
                }
            }]
        });
    Product.findAll({
        //where: { Name: req.query.idProduct },
        where: search,
        include: model,
        // offset: parseInt(offset),
        // limit: 4
        // include: [{
        //     model: ProductPictureMaping,
        //     include: [MediaMgmt]
        // }]
    }).then(function (response) {
        if (response != null) {
            res.json({
                success: true,
                response: response
            });
        } else {
            res.json({
                success: false,
                response: "Record not found..."
            });
        }

    })
})

router.post('/UpdateHotSellingProduct', jsonParser, function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                var objProduct = req.body;
                Product.findOne({
                    attributes: ['Id', 'Name', 'IsHotSelling'],
                    where: {
                        Id: objProduct.Id
                    }
                }).then(function (ObjHotSellProduct) {
                    if (ObjHotSellProduct) {
                        //funAuditLog.CreateAuditLog('UpdateProduct', UserExist.username, 'Update Product');
                        ObjHotSellProduct.updateAttributes({
                            IsHotSelling: objProduct.IsHotSelling
                        }).then(function (resUpdate) {
                            if (resUpdate) {
                                funAuditLog.CreateAuditLog('UpdateHotSellProduct', UserExist.username, 'Update Hot Selling Product');
                                res.json({
                                    success: true,
                                    message: "Product updated successfully..."
                                });
                            } else {
                                res.json({
                                    success: false,
                                    message: "Product updated unsuccessfully..."
                                });
                            };
                        })
                    } else {
                        res.json({
                            success: true,
                            message: "Product not found...",
                        });
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

// router.get('/ExportProducts', function(req, res) {
//     var CategoryId = '';
//     var lstProduct = [];

//     var conf = {};

//     conf.cols = [{
//         caption: 'Spu',
//         type: 'string'
//     }, {
//         caption: 'Name',
//         type: 'string'
//     }, {
//         caption: 'CategoryName',
//         type: 'string'
//     }, {
//         caption: 'SubCategory',
//         type: 'string'
//     }, {
//         caption: 'ProductCost',
//         type: 'string'
//     }, {
//         caption: 'Price',
//         type: 'string'
//     }, {
//         caption: 'OldPrice',
//         type: 'string'
//     }, {
//         caption: 'Stock',
//         type: 'string'
//     }, {
//         caption: 'Weight',
//         type: 'string'
//     }, {
//         caption: 'Length',
//         type: 'string'
//     }, {
//         caption: 'PWidth',
//         type: 'string'
//     }, {
//         caption: 'Height',
//         type: 'string'
//     }, {
//         caption: 'Picture',
//         type: 'string'
//     }];


//     Product.hasMany(ProductAttributeMaping, {
//         foreignKey: {
//             name: 'ProductId',
//             allowNull: false
//         }
//     });

//     ProductAttributeMaping.belongsTo(ProductAttribute, {
//         foreignKey: {
//             name: 'ProductAttributeId',
//             allowNull: false
//         }
//     });

//     ProductAttributeMaping.hasMany(ProductAttributeValue, {
//         foreignKey: {
//             name: 'ProductAttributeMappingId',
//             allowNull: false
//         }
//     });


//     Product.hasMany(ProductPictureMaping, {
//         foreignKey: {
//             name: 'ProductId',
//             allowNull: false
//         }
//     });


//     ProductPictureMaping.belongsTo(MediaMgmt, {
//         foreignKey: {
//             name: 'PictureId',
//             allowNull: false
//         }
//     });
//     var include = [];

//     include.push({
//         model: ProductPictureMaping,
//         include: [{
//             model: MediaMgmt,
//             attributes: ['FileName']
//         }]
//     });


//     include.push({
//         model: ProductAttributeMaping,
//         include: [{
//             model: ProductAttribute,
//             attributes: ['Name']
//         }, {
//             model: ProductAttributeValue
//         }]
//     });

//     var SearchExport = "";
//     console.log(req.query.SearchExport);
//     if (req.query.SearchExport == 'UnPublish') {
//         console.log("Call");
//         SearchExport = { Deleted: { $ne: true }, Published: { $ne: true } }
//     } else {
//         console.log("Caldddddddl");

//         SearchExport = { Deleted: { $ne: true } }
//     }
//     Product.findAll({
//             include: include,
//             order: 'CreatedOnUtc DESC',
//             where: SearchExport
//         }).then(function(response) {
//             conf.rows = [];
//             var lstProduct = [];
//             // i -uploaderproduct
//             // j -uploaderproductcat
//             // k -manageproductcat
//             // l -uploadSubcat
//             if (response.length > 0) {
//                 function uploaderproduct(i) {
//                     if (i < response.length) {

//                         if (response[i].product_picture_mappings.length > 0) {
//                             function uploadimage(j) {
//                                 if (j < response[i].product_picture_mappings.length) {
//                                     var object = new Object();
//                                     object["ProductId"] = response[i].Id;
//                                     object["sku"] = response[i].Sku;
//                                     object["Name"] = response[i].Name.toString();
//                                     object["CategoryName"] = CategoryName;
//                                     object["SubCategory"] = SubCategory;
//                                     object["ProductCost"] = response[i].ProductCost.toString();
//                                     object["Price"] = response[i].Price.toString();
//                                     object["OldPrice"] = response[i].OldPrice.toString();
//                                     object["Stock"] = response[i].StockQuantity.toString();
//                                     object["Weight"] = response[i].Weight.toString();
//                                     object["Length"] = response[i].Length.toString();
//                                     object["PWidth"] = response[i].Width.toString();
//                                     object["Height"] = response[i].Height.toString();
//                                     object["Picture"] = 'http://localhost:3030/MediaUploads/' + response[i].product_picture_mappings[j].tblmediamgmt.FileName;
//                                     lstProduct.push(object);
//                                     uploadimage(j + 1);
//                                 }
//                             }
//                             uploadimage(0);
//                         } else {
//                             var object = new Object();
//                             object["ProductId"] = response[i].Id;
//                             object["sku"] = response[i].Sku;
//                             object["Name"] = response[i].Name.toString();
//                             object["CategoryName"] = CategoryName;
//                             object["SubCategory"] = SubCategory;
//                             object["ProductCost"] = response[i].ProductCost.toString();
//                             object["Price"] = response[i].Price.toString();
//                             object["OldPrice"] = response[i].OldPrice.toString();
//                             object["Stock"] = response[i].StockQuantity.toString();
//                             object["Weight"] = response[i].Weight.toString();
//                             object["Length"] = response[i].Length.toString();
//                             object["PWidth"] = response[i].Width.toString();
//                             object["Height"] = response[i].Height.toString();
//                             object["Picture"] = '';
//                             lstProduct.push(object);
//                         }
//                         uploaderproduct(i + 1);


//                     } else {
//                         //Manage Product Attrinute Combination
//                         //p-uploaderFinalProduct
//                         var LstFinalProduct = [];
//                         if (lstProduct.length > 0) {

//                             function uploaderFinalProduct(p) {
//                                 if (p < lstProduct.length) {
//                                     GetProductCombinationforExport(lstProduct[p].ProductId, function(response) {
//                                         var Attriburecolumn = response;

//                                         if (Attriburecolumn != null && Attriburecolumn != undefined && Attriburecolumn != '') {
//                                             if (Attriburecolumn.length > 0) {
//                                                 var arrGoupbyAttriburecolumn = u.groupBy(Attriburecolumn, 'ProductCombinationid');
//                                                 var array = u.map(arrGoupbyAttriburecolumn, function(value, index) {
//                                                     return value;
//                                                 });

//                                                 //Add Column
//                                                 if (array.length > 0) {
//                                                     function uploadAttributeExcelColumn(a) {
//                                                         if (a < array.length) {
//                                                             function ManageAttriburecolumn(q) {
//                                                                 if (q < array[a].length) {
//                                                                     var columnExists = u.findWhere(conf.cols, { caption: array[a][q].AttributeColName });
//                                                                     if (columnExists == undefined || columnExists == '' || columnExists == null) {
//                                                                         var obj = new Object();
//                                                                         obj.caption = array[a][q].AttributeColName;
//                                                                         obj.type = 'string';
//                                                                         conf.cols.push(obj);

//                                                                     }
//                                                                     ManageAttriburecolumn(q + 1);
//                                                                 } else {
//                                                                     uploadAttributeExcelColumn(a + 1);
//                                                                 }
//                                                             }
//                                                             ManageAttriburecolumn(0);
//                                                         }
//                                                     }
//                                                     uploadAttributeExcelColumn(0);

//                                                     //Append Attribute
//                                                     function uploadmultipleAttribute(a) {
//                                                         var objProductExport = new Object();
//                                                         for (var i = 0; i < conf.cols.length; i++) {
//                                                             objProductExport[conf.cols[i].caption] = null;
//                                                         };
//                                                         if (a < array.length) {
//                                                             function uploaderAttriburecolumn(q) {
//                                                                 if (q < array[a].length) {
//                                                                     var index = -1;
//                                                                     u.each(conf.cols, function(data, idx) {
//                                                                         if (data.caption == 'Picture') {
//                                                                             index = idx;
//                                                                             return;
//                                                                         }
//                                                                     });

//                                                                     objProductExport.ProductId = lstProduct[p].ProductId;
//                                                                     objProductExport.Spu = lstProduct[p].sku;
//                                                                     objProductExport.Name = lstProduct[p].Name.toString();
//                                                                     objProductExport.CategoryName = lstProduct[p].CategoryName;
//                                                                     objProductExport.SubCategory = lstProduct[p].SubCategory;
//                                                                     objProductExport.ProductCost = lstProduct[p].ProductCost.toString();
//                                                                     objProductExport.Price = lstProduct[p].Price.toString();
//                                                                     objProductExport.OldPrice = lstProduct[p].OldPrice.toString();
//                                                                     objProductExport.Stock = lstProduct[p].Stock.toString();
//                                                                     objProductExport.Weight = lstProduct[p].Weight.toString();
//                                                                     objProductExport.Length = lstProduct[p].Length.toString();
//                                                                     objProductExport.PWidth = lstProduct[p].PWidth.toString();
//                                                                     objProductExport.Height = lstProduct[p].Height.toString();
//                                                                     objProductExport.Picture = lstProduct[p].Picture;
//                                                                     if (array[a][q].CombinationPrice != null && array[a][q].CombinationPrice != undefined && array[a][q].CombinationPrice != '') {
//                                                                         objProductExport.Price = array[a][q].CombinationPrice.toString();
//                                                                     }
//                                                                     // objProductExport["ProductCombinationid"] = array[a][q].ProductCombinationid;

//                                                                     var attrNamelist = [];
//                                                                     if (index != -1) {
//                                                                         function attributes(e) {
//                                                                             if (e <= conf.cols.length) {
//                                                                                 if (conf.cols[e] != null && conf.cols[e] != undefined && conf.cols[e] != '') {
//                                                                                     var obj = new Object();
//                                                                                     obj.caption = conf.cols[e].caption;
//                                                                                     attrNamelist.push(obj);
//                                                                                 }
//                                                                                 attributes(e + 1);
//                                                                             } else {
//                                                                                 if (attrNamelist.length > 0) {

//                                                                                     function Setattrributevalue(s) {
//                                                                                         if (s < attrNamelist.length) {
//                                                                                             var objattri = u.findWhere(array[a], { AttributeColName: attrNamelist[s].caption, ProductCombinationid: array[a][q].ProductCombinationid });
//                                                                                             if (objattri != undefined && objattri != null && objattri != '') {
//                                                                                                 objProductExport[objattri.AttributeColName] = objattri.AttributeColValue;
//                                                                                             } else {
//                                                                                                 objProductExport[attrNamelist[s].caption] = "";
//                                                                                             }

//                                                                                             Setattrributevalue(s + 1);
//                                                                                         } else {
//                                                                                             uploaderAttriburecolumn(q + 1);

//                                                                                         }
//                                                                                     }
//                                                                                     Setattrributevalue(0);
//                                                                                 }
//                                                                             }
//                                                                         }
//                                                                         attributes(index + 1);
//                                                                     } else {
//                                                                         uploaderAttriburecolumn(q + 1);

//                                                                     }

//                                                                 } else {
//                                                                     LstFinalProduct.push(objProductExport);
//                                                                     uploadmultipleAttribute(a + 1);
//                                                                 }
//                                                             }
//                                                             uploaderAttriburecolumn(0);
//                                                         } else {
//                                                             uploaderFinalProduct(p + 1);
//                                                         }
//                                                     }
//                                                     uploadmultipleAttribute(0);

//                                                 }
//                                             }
//                                         } else {
//                                             var objNotAttribute = new Object();

//                                             var index = -1;
//                                             u.each(conf.cols, function(data, idx) {
//                                                 if (data.caption == 'Picture') {
//                                                     index = idx;
//                                                     return;
//                                                 }
//                                             });

//                                             var attrNamelist = [];
//                                             if (index != -1) {
//                                                 function attributse(e) {
//                                                     if (e <= conf.cols.length) {
//                                                         if (conf.cols[e] != null && conf.cols[e] != undefined && conf.cols[e] != '') {
//                                                             var attri = conf.cols[e].caption;
//                                                             attrNamelist.push(attri);
//                                                         }
//                                                         attributse(e + 1);
//                                                     } else {
//                                                         if (attrNamelist.length > 0) {
//                                                             function Setattrributevalues(s) {
//                                                                 if (s < attrNamelist.length) {
//                                                                     objNotAttribute[attrNamelist[s]] = "";
//                                                                     Setattrributevalues(s + 1);
//                                                                 }
//                                                             }
//                                                             Setattrributevalues(0);
//                                                         }
//                                                     }
//                                                 }
//                                                 attributse(index + 1);
//                                             }

//                                             objNotAttribute.ProductId = lstProduct[p].ProductId;
//                                             objNotAttribute.Spu = lstProduct[p].sku;
//                                             objNotAttribute.Name = lstProduct[p].Name.toString();
//                                             objNotAttribute.CategoryName = lstProduct[p].CategoryName;
//                                             objNotAttribute.SubCategory = lstProduct[p].SubCategory;
//                                             objNotAttribute.ProductCost = lstProduct[p].ProductCost.toString();
//                                             objNotAttribute.Price = lstProduct[p].Price.toString();
//                                             objNotAttribute.OldPrice = lstProduct[p].OldPrice.toString();
//                                             objNotAttribute.Stock = lstProduct[p].Stock.toString();
//                                             objNotAttribute.Weight = lstProduct[p].Weight.toString();
//                                             objNotAttribute.Length = lstProduct[p].Length.toString();
//                                             objNotAttribute.PWidth = lstProduct[p].PWidth.toString();
//                                             objNotAttribute.Height = lstProduct[p].Height.toString();
//                                             objNotAttribute.Picture = lstProduct[p].Picture;
//                                             LstFinalProduct.push(objNotAttribute);
//                                             uploaderFinalProduct(p + 1);
//                                         }
//                                     })
//                                 } else {
//                                     var index = -1;
//                                     u.each(conf.cols, function(data, idx) {
//                                         if (data.caption == 'Picture') {
//                                             index = idx;
//                                             return;
//                                         }
//                                     });
//                                     if (LstFinalProduct.length > 0) {
//                                         function FinalExportProduct(row) {
//                                             if (row < LstFinalProduct.length) {
//                                                 var rows = [];
//                                                 rows.push(LstFinalProduct[row].Spu);
//                                                 rows.push(LstFinalProduct[row].Name);
//                                                 rows.push(LstFinalProduct[row].CategoryName);
//                                                 rows.push(LstFinalProduct[row].SubCategory);
//                                                 rows.push(LstFinalProduct[row].ProductCost);
//                                                 rows.push(LstFinalProduct[row].Price);
//                                                 rows.push(LstFinalProduct[row].OldPrice);
//                                                 rows.push(LstFinalProduct[row].Stock);
//                                                 rows.push(LstFinalProduct[row].Weight);
//                                                 rows.push(LstFinalProduct[row].Length);
//                                                 rows.push(LstFinalProduct[row].PWidth);
//                                                 rows.push(LstFinalProduct[row].Height);
//                                                 rows.push(LstFinalProduct[row].Picture);
//                                                 if (conf.cols.length > 0) {
//                                                     function uploaderFinalAttributeColumn(i) {
//                                                         if (i <= conf.cols.length) {
//                                                             if (conf.cols[i] != null && conf.cols[i] != undefined && conf.cols[i] != '') {
//                                                                 var attri = conf.cols[i].caption;
//                                                                 if (LstFinalProduct[row][attri] != null && LstFinalProduct[row][attri] != undefined) {
//                                                                     rows.push(LstFinalProduct[row][attri]);
//                                                                 } else {
//                                                                     rows.push("");
//                                                                 }
//                                                             }
//                                                             uploaderFinalAttributeColumn(i + 1);
//                                                         } else {
//                                                             conf.rows.push(rows);
//                                                         }
//                                                     }
//                                                     uploaderFinalAttributeColumn(index + 1);
//                                                 } else {
//                                                     conf.rows.push(rows);
//                                                 }
//                                                 FinalExportProduct(row + 1);
//                                             }

//                                         }
//                                         FinalExportProduct(0);
//                                     }
//                                     var result = nodeExcel.execute(conf);
//                                     res.setHeader('Content-Type', 'application/vnd.openxmlformats');
//                                     res.setHeader("Content-Disposition", "attachment; filename=" + "Product.xlsx");
//                                     res.end(result, 'binary');
//                                 }
//                             }
//                             uploaderFinalProduct(0);
//                         }
//                     }
//                 }
//                 uploaderproduct(0);
//             } else {
//                 var row = [];
//                 for (var i = 0; i < conf.cols.length; i++) {
//                     row.push('');
//                 };
//                 conf.rows = [];
//                 conf.rows.push(row);
//                 var result = nodeExcel.execute(conf);
//                 res.setHeader('Content-Type', 'application/vnd.openxmlformats');
//                 res.setHeader("Content-Disposition", "attachment; filename=" + "NoProduct.xlsx");
//                 res.end(result, 'binary');
//             }
//             // res.json(lstProduct);

//         }).catch(function(error) {
//             res.json(error);
//         })
//         //         } else {
//         //             res.json(InvalidToken);
//         //         }
//         //     })
//         // } else {
//         //     res.json(InvalidToken);
//         // }
// })

function GetProductCombinationforExport(idProduct, callback) {
    ProductAttributeValue.belongsTo(ProductAttributeMaping, {
        foreignKey: {
            name: 'ProductAttributeMappingId',
            allowNull: false
        }
    });

    ProductAttributeValue.findAll({
        include: [{
            model: ProductAttributeMaping,
            where: {
                ProductId: parseInt(idProduct)
            }
        }]
    }).then(function (response) {
        var lstResponse = [];
        if (response.length > 0) {
            function uploader(i) {

                if (i < response.length) {
                    var arrAttributeString = [];
                    arrAttributeString.push(response[i].product_productattribute_mapping);
                    var arrAttributeValueString = response[i].Id;
                    var CombinationPrice = response[i].Price;
                    var CombinationOldPrice = response[i].OldPrice;
                    var ProductCombinationid = response[i].product_productattribute_mapping.Id;
                    var val = '';
                    if (arrAttributeString.length > 0) {
                        function arruploader(j) {
                            if (j < arrAttributeString.length) {
                                if (arrAttributeString[j] != null && arrAttributeString[j] != '' && arrAttributeString[j] != undefined) {
                                    var id = parseInt(arrAttributeString[j].ProductAttributeId);
                                    ProductAttribute.findOne({
                                        where: {
                                            Id: id
                                        }
                                    }).then(function (resProductAttribute) {
                                        if (arrAttributeValueString != null && arrAttributeValueString != '' && arrAttributeValueString != undefined) {
                                            ProductAttributeValue.findOne({
                                                where: {
                                                    Id: arrAttributeValueString
                                                }
                                            }).then(function (resProductAttributeValue) {
                                                if (resProductAttributeValue != null && resProductAttributeValue != '' && resProductAttributeValue != undefined) {
                                                    var obj = {
                                                        AttributeColName: resProductAttribute.Name,
                                                        AttributeColValue: resProductAttributeValue.Name,
                                                        CombinationPrice: CombinationPrice,
                                                        CombinationOldPrice: CombinationOldPrice,
                                                        ProductCombinationid: ProductCombinationid,
                                                    }
                                                    lstResponse.push(obj);
                                                }
                                                arruploader(j + 1);

                                            })
                                        } else {
                                            arruploader(j + 1);
                                        }
                                    })
                                } else {
                                    arruploader(j + 1);
                                }
                            } else {
                                uploader(i + 1);
                            }
                        }
                        arruploader(0);
                    } else {
                        uploader(i + 1)
                    }
                } else {
                    return callback(lstResponse);

                }
            }
            uploader(0);
        } else {
            return callback(lstResponse);
        }
    })

    // urllib.request(urlToCall, { wd: 'nodejs' }, function(err, data, response) {
    //     var statusCode = response.statusCode;
    //     finalData = getResponseJson(statusCode, data.toString());
    //     return callback(finalData);
    // });
}
router.get('/GetAllWalletPackage', function (req, res) {

    var search = {};
    search['$and'] = [];
    var obj = new Object();
    obj['ProductTypeId'] = {
        $eq: 2
    };
    obj['Published'] = {
        $eq: true
    };
    search['$and'].push(obj);


    Product.findAndCountAll({
        where: search,
    }).then(function (response) {
        // res.json({ success: true, response: response });
        res.json(response);
    }).catch(function (error) {
        res.json({
            success: false,
            response: error
        });
    })
})

router.get('/GetAllWalletPackageOneTime', function (req, res) {

    var search = {};
    search['$and'] = [];
    var obj = new Object();
    obj['ProductTypeId'] = {
        $eq: 3
    };
    obj['Published'] = {
        $eq: true
    };
    search['$and'].push(obj);


    Product.findAndCountAll({
        where: search,
    }).then(function (response) {
        // res.json({ success: true, response: response });
        res.json(response);
    }).catch(function (error) {
        res.json({
            success: false,
            response: error
        });
    })
})
module.exports = router
