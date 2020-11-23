//var nodeExcel = require('excel-export');

//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Product = models.product;
var MediaMgmt = models.tblmediamgmt;
var ProductAttributeMaping = models.product_productattribute_mapping;
var ProductAttributeMapping = models.product_productattribute_mapping;
var ProductAttributeValue = models.productattributevalue;
var ProductAttribute = models.productattribute;
var ProductAttributeCombination = models.productattributecombination;
var Setting = models.tblsetting
var AppInfo = models.tblappinfo;

//End of Tables
router.get('/GetAllProduct', function (req, res) {

    var model = [];
    var search = {};

    var Published = req.query.Published;
    var Name = req.query.Name;

    var VendorId = req.query.VendorId;
    var WarehouseId = req.query.WarehouseId;
    var Sku = req.query.Sku;
    var ProductTypeId = req.query.ProductTypeId;
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

    Product.findAll({
        where: {
            Id: req.query.idProduct
        }
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
    var model = [];
    Product.findAll({
        where: {
            Id: req.query.idProduct
        }
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

    Product.findAll({
        where: {
            Published: 1,
            Deleted: 0,
            ProductTypeId: 0
        }
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
                                    Sku: objProduct.Sku
                                },
                                defaults: objProduct
                            }).then(function (response) {

                                if ((response[1])) {
                                    var ProductId = response[0].Id;
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
                                    Sku: objProduct.Sku
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

                        Product.findOrCreate({
                            where: {
                                Name: objProduct.Name
                            },
                            defaults: objProduct
                        }).then(function (response) {

                            if ((response[1])) {
                                var ProductId = response[0].Id;
                                manageProductAttributeMapping(oldProductId, ProductId);
                                manageProductAttributeCombination(oldProductId, ProductId);
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
                        var VendorId = req.query.VendorId;
                        var WarehouseId = req.query.WarehouseId;
                        var Sku = req.query.Sku;
                        var ProductTypeId = req.query.ProductTypeId;
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
                var VendorId = req.query.VendorId;
                var WarehouseId = req.query.WarehouseId;
                var Sku = req.query.Sku;
                var ProductTypeId = req.query.ProductTypeId;
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

                Product.findAll({
                    include: model,
                    order: 'CreatedOnUtc DESC',
                    where: search
                }).then(function (response) {


                    function uploader(i) {
                        if (i < response.length) {

                            var objProduct = response[i];

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

    var include = [];

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
                    var object = new Object();
                    object["ProductId"] = response[i].Id;
                    object["No"] = 0;
                    object["Name"] = response[i].Name.toString();
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
    Product.findAll({
        where: {
            Id: req.query.idProduct
        }
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
    Product.findAll({
        where: search,
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