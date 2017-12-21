 //Tables
var router = express.Router();
var ProductAttributeCombination = models.productattributecombination;
var CombinationTierPrice = models.tblproductattributecombinationtierprice;
var ProductAttributeMapping = models.product_productattribute_mapping;
var Role = models.tblrole;
var Product = models.product;
var User = models.tbluserinformation;
var ProductAttribute = models.productattribute;
var ProductAttributeValue = models.productattributevalue;
//End of Tables

router.get('/GetAllProductAttributeCombinations', function(req, res) {
    CombinationTierPrice.belongsTo(ProductAttributeCombination, {
        foreignKey: {
            name: 'ProductAttributeCombinationId',
            allowNull: false
        }
    });
    CombinationTierPrice.belongsTo(Role, {
        foreignKey: {
            name: 'UserRoleId',
            allowNull: false
        }
    });
    CombinationTierPrice.belongsTo(User, {
        foreignKey: {
            name: 'UserRoleId',
            allowNull: false
        }
    });

    CombinationTierPrice.findAll({
        include: [{
            model: ProductAttributeCombination,
            where: {
                ProductId: req.query.idProduct
            }
        }, {
            model: Role,
            attributes: ['id', 'RoleName']
        }, {
            model: User,
            attributes: ['id', 'username']
        }]
    }).then(function(response) {
        var lstResponse = [];

        function uploader(i) {
            if (i < response.length) {
                var arrAttributeString = response[i].productattributecombination.AttributeString.split(',');
                var arrAttributeValueString = response[i].productattributecombination.AttributeValueString.split(',');
                var val = '';
                if (arrAttributeString.length > 0) {
                    function arruploader(j) {
                        if (j < arrAttributeString.length) {
                            if (arrAttributeString[j] != null && arrAttributeString[j] != '' && arrAttributeString[j] != undefined) {
                                var id = parseInt(arrAttributeString[j]);
                                ProductAttribute.findOne({
                                    where: {
                                        Id: id
                                    }
                                }).then(function(resProductAttribute) {
                                    if (arrAttributeValueString[j] != null && arrAttributeValueString[j] != '' && arrAttributeValueString[j] != undefined) {
                                        ProductAttributeValue.findOne({
                                            where: {
                                                Id: arrAttributeValueString[j]
                                            }
                                        }).then(function(resProductAttributeValue) {
                                            if (resProductAttributeValue != null && resProductAttributeValue != '' && resProductAttributeValue != undefined) {
                                                val = val + "<b>" + resProductAttribute.Name + "</b> : " + resProductAttributeValue.Name + "<br />";
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
                            var obj = {
                                AttributeCombination: response[i],
                                AttributeWithValue: val
                            }
                            lstResponse.push(obj);
                            uploader(i + 1);
                        }
                    }
                    arruploader(0);
                }

            } else {
                res.json(lstResponse);
            }
        }
        uploader(0);

    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllProductAttributeCombinationByProductId', function(req, res) {
    ProductAttributeCombination.findAll({
        where: {
            ProductId: req.query.idProduct
        }
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetProductAttributeCombinationById', function(req, res) {
    ProductAttributeCombination.findOne({
        where: {
            Id: req.query.idProductAttributeCombination
        }
    }).then(function(response) {
        if (response != null) {
            res.json({
                success: true,
                message: "Product Attribute Combination created successfully...",
                data: response
            });
        } else {
            res.json({
                success: false,
                message: "Product Attribute Combination is already Exist...",
                data: response
            });
        }
    })
})

router.post('/CreateProductAttributeCombination', jsonParser, function(req, res) {
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
                var objProductAttributeCombination = req.body.objProductAttributeCombination;
                var objTierPrice = req.body.objTierPrice;
                var Product_Id = req.body.Product_Id;

                if (objProductAttributeCombination.Id == 0) {
                    ProductAttributeCombination.findOne({
                        where: {
                            AttributesXml: objProductAttributeCombination.AttributesXml
                        }
                    }).then(function(response) {
                        if (response == null) {
                            objProductAttributeCombination.ProductId = Product_Id;
                            ProductAttributeCombination.create(objProductAttributeCombination).then(function(response) {
                                objTierPrice.ProductAttributeCombinationId = response.Id;
                                objTierPrice.Price = objProductAttributeCombination.OverriddenPrice;
                                objTierPrice.Quantity = objProductAttributeCombination.StockQuantity;
                                CombinationTierPrice.findOrCreate({
                                    where: {
                                        ProductAttributeCombinationId: objTierPrice.ProductAttributeCombinationId,
                                        Type: objTierPrice.Type,
                                        UserRoleId: objTierPrice.UserRoleId
                                    },
                                    defaults: objTierPrice
                                }).then(function(response) {
                                    if (response[1]) {
                                        funAuditLog.CreateAuditLog('CreateProductAttributeCombination', UserExist.username , 'Create Product Attribute Combination');
                                        res.json({
                                            success: true,
                                            message: "Product Attribute Combination created successfully...",
                                            data: response
                                        });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "Product Attribute Combination is already Exist...",
                                            data: response
                                        });
                                    }
                                })
                            })
                        } else {
                            objTierPrice.ProductAttributeCombinationId = response.Id;
                            objTierPrice.Price = objProductAttributeCombination.OverriddenPrice;
                            objTierPrice.Quantity = objProductAttributeCombination.StockQuantity;
                            CombinationTierPrice.findOrCreate({
                                where: {
                                    ProductAttributeCombinationId: objTierPrice.ProductAttributeCombinationId,
                                    Type: objTierPrice.Type,
                                    UserRoleId: objTierPrice.UserRoleId
                                },
                                defaults: objTierPrice
                            }).then(function(response) {
                                if (response[1]) {
                                    funAuditLog.CreateAuditLog('CreateProductAttributeCombination', UserExist.username , 'Create Product Attribute Combination');
                                    res.json({
                                        success: true,
                                        message: "Product Attribute Combination created successfully...",
                                        data: response
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Product Attribute Combination is already Exist...",
                                        data: response
                                    });
                                }
                            })
                        }
                    })
                } else {
                    CombinationTierPrice.findOne({
                        where: {
                            ProductAttributeCombinationId: objProductAttributeCombination.Id,
                            Type: objTierPrice.Type,
                            UserRoleId: objTierPrice.UserRoleId
                        }
                    }).then(function(resCombinationTierPrice) {
                        if (resCombinationTierPrice == null) {
                            objTierPrice.ProductAttributeCombinationId = objProductAttributeCombination.Id;
                            objTierPrice.Price = objProductAttributeCombination.OverriddenPrice;
                            objTierPrice.Quantity = objProductAttributeCombination.StockQuantity;
                            CombinationTierPrice.create(objTierPrice).then(function(response) {})
                        } else {
                            resCombinationTierPrice.updateAttributes({
                                ProductAttributeCombinationId: objProductAttributeCombination.Id,
                                Price: objProductAttributeCombination.OverriddenPrice,
                                Quantity: objProductAttributeCombination.StockQuantity
                            }).then(function(response) {
                                funAuditLog.CreateAuditLog('CreateProductAttributeCombination', UserExist.username , 'Update Product Attribute Combination');
                                res.json({
                                    success: true,
                                    message: "Product Attribute Combination updated successfully...",
                                    data: response
                                });
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

router.post('/UpdateCombinationPrice', jsonParser, function(req, res) {
    CombinationTierPrice.belongsTo(ProductAttributeCombination, {
        foreignKey: {
            name: 'ProductAttributeCombinationId',
            allowNull: false
        }
    });
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
                objProductCombination = req.body;
                var lstProductCombination = [];
                CombinationTierPrice.findAll({
                    include: [{
                        model: ProductAttributeCombination,
                        where: {
                            ProductId: objProductCombination.ProductId
                        }
                    }]
                }).then(function(response) {
                    lstProductCombination = response;
                    if (lstProductCombination.length > 0) {
                        if (objProductCombination.Percentage != 0 || objProductCombination.Amount != 0) {
                            function uploader(i) {
                                if (i < response.length) {

                                    var objProduct = response[i];

                                    var NewPrice = 0;
                                    var oldPrice = 0;

                                    if (objProduct.Price != null) {
                                        oldPrice = objProduct.Price;
                                    }

                                    if (objProductCombination.Percentage != 0) {
                                        var perAmount = 0;
                                        perAmount = (parseFloat(oldPrice) * parseFloat(objProductCombination.Percentage)) / 100;
                                        NewPrice = parseFloat(oldPrice) + perAmount;
                                    } else {
                                        NewPrice = parseFloat(oldPrice) + parseFloat(objProductCombination.Amount);
                                    }
                                    objProduct.updateAttributes({
                                        Price: NewPrice
                                    }).then(function(resUpdate) {
                                        if ((i + 1) == response.length) {
                                            funAuditLog.CreateAuditLog('UpdateCombinationPrice', UserExist.username , 'Update Product Price');
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
                        }
                    } else {
                        res.json({
                            success: false,
                            message: "No Record(s) found for update...",
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

router.post('/CopyCombinationPrice', jsonParser, function(req, res) {
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
                objProductCombinationModal = req.body;
                var lstCombinationTierPrice = [];
                CombinationTierPrice.belongsTo(ProductAttributeCombination, {
                    foreignKey: {
                        name: 'ProductAttributeCombinationId',
                        allowNull: false
                    }
                });

                CombinationTierPrice.findAll({
                    include: [{
                        model: ProductAttributeCombination,
                        where: {
                            ProductId: objProductCombinationModal.idProduct
                        }
                    }],
                    where: {
                        Type: objProductCombinationModal.FromType,
                        UserRoleId: objProductCombinationModal.FromUserRoleId
                    }
                }).then(function(response) {
                    lstCombinationTierPrice = response;
                    if (lstCombinationTierPrice.length > 0) {
                        function uploader(i) {
                            // var obj = db.tblProductAttributeCombinationTierPrices.Where(x => x.UserRoleId == ToUserRole_Id && x.Type == objProductCombination.ToType && x.ProductAttributeCombinationId == item.ProductAttributeCombinationId).FirstOrDefault();
                            var ToUserRole_Id = objProductCombinationModal.ToUserRoleId;
                            if (i < lstCombinationTierPrice.length) {
                                var objCombinationPrice = lstCombinationTierPrice[i];
                                CombinationTierPrice.findOne({
                                    where: {
                                        UserRoleId: ToUserRole_Id,
                                        Type: objProductCombinationModal.ToType,
                                        ProductAttributeCombinationId: objCombinationPrice.ProductAttributeCombinationId
                                    }
                                }).then(function(objresponse) {
                                    if (objresponse != null) {
                                        //update Price
                                        var NewPrice = 0;

                                        NewPrice = objCombinationPrice.Price;

                                        if (objProductCombinationModal.Percentage != 0) {
                                            var PercentageAmount = 0;
                                            PercentageAmount = (NewPrice * objProductCombinationModal.Percentage) / 100;
                                            NewPrice = NewPrice + PercentageAmount;
                                        } else {
                                            NewPrice = NewPrice + objProductCombinationModal.Amount;
                                        }
                                        objresponse.updateAttributes({
                                            Price: NewPrice
                                        }).then(function(resUpdate) {
                                            if ((i + 1) == lstCombinationTierPrice.length) {
                                                funAuditLog.CreateAuditLog('CopyCombinationPrice', UserExist.username , 'Product Prices Copy');
                                                res.json({
                                                    success: true,
                                                    message: "Product Prices Copy successfully..."
                                                });
                                            } else {
                                                uploader(i + 1);
                                            };
                                        })
                                    } else {
                                        var objCreateCombinationPrice = {};
                                        var NewPrice = 0;
                                        NewPrice = objCombinationPrice.Price;
                                        if (objProductCombinationModal.Percentage != 0) {
                                            var PercentageAmount = 0;
                                            PercentageAmount = (NewPrice * objProductCombinationModal.Percentage) / 100;
                                            NewPrice = NewPrice + PercentageAmount;
                                        } else {
                                            NewPrice = NewPrice + objProductCombinationModal.Amount;
                                        }
                                        objCreateCombinationPrice.ProductAttributeCombinationId = objCombinationPrice.ProductAttributeCombinationId;
                                        objCreateCombinationPrice.Price = NewPrice;
                                        objCreateCombinationPrice.Quantity = parseInt(objCombinationPrice.Quantity);
                                        objCreateCombinationPrice.Type = objProductCombinationModal.ToType;
                                        objCreateCombinationPrice.UserRoleId = ToUserRole_Id;
                                        //Add New Price
                                        CombinationTierPrice.create(objCreateCombinationPrice).then(function(responseCreate) {
                                            if ((i + 1) == lstCombinationTierPrice.length) {
                                                if ((responseCreate[1])) {
                                                    funAuditLog.CreateAuditLog('CopyCombinationPrice', UserExist.username , 'Product Prices Copy');
                                                    res.json({
                                                        success: true,
                                                        message: "Product Prices Copy successfully..",
                                                        data: response
                                                    });
                                                }
                                            } else {
                                                uploader(i + 1);
                                            };
                                        })
                                    }
                                })
                            }
                        }
                        uploader(0);
                    } else {
                        res.json({
                            success: false,
                            message: "No Record(s) found for copy...",
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

router.get('/DeleteProductAttributeCombination', function(req, res) {
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
                CombinationTierPrice.destroy({
                    where: {
                        id: req.query.id
                    }
                }).then(function(response) {
                    CombinationTierPrice.findAll({
                        where: {
                            ProductAttributeCombinationId: req.query.ProductAttributeCombinationId
                        }
                    }).then(function(response) {
                        if (response.length == 0) {
                            ProductAttributeCombination.destroy({
                                where: {
                                    Id: req.query.ProductAttributeCombinationId
                                }
                            }).then(function(response) {})
                        }
                        funAuditLog.CreateAuditLog('DeleteProductAttributeCombination', UserExist.username , 'Delete Product Attribute Combination');
                        res.json({
                            success: true,
                            message: "Product Attribute Combination deleted successfully..."
                        });
                    })
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/ExportProductAttributeCombinations', function(req, res) {
    var conf = {};
    conf.cols = [];

    var ObjParams = req.query;
    var Type = ObjParams.Type;
    var UserRoleId = ObjParams.UserRoleId;
    var ProductId = '';
    if (ObjParams.ProductId != null && ObjParams.ProductId != undefined && ObjParams.ProductId != '') {
        ProductId = parseInt(ObjParams.ProductId);
    }

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

    ProductAttributeMapping.findAll({
        where: {
            ProductId: ProductId
        },
        include: [{
            model: ProductAttribute
        }, {
            model: ProductAttributeValue,
            include: [{
                model: Product,
                attributes: ['Id', 'Name']
            }]
        }]
    }).then(function(lstAttributebyProductId) {

        var lstAttributeValueAddedCount = [];
        var lstAttributeValueCount = [];
        var totalrecords = 1;

        if (lstAttributebyProductId.length > 0) {

            function uploderProductAttributeMapping(i) {
                if (i < lstAttributebyProductId.length) {
                    var objProductAttributeMapping = lstAttributebyProductId[i];
                    var lstproductattribute = objProductAttributeMapping.productattribute;
                    var lstproductattributevalues = objProductAttributeMapping.productattributevalues;

                    lstAttributeValueAddedCount.push(0);
                    lstAttributeValueCount.push(lstproductattributevalues.length);
                    totalrecords = totalrecords * lstproductattributevalues.length;

                    if (objProductAttributeMapping.productattribute != null && objProductAttributeMapping.productattribute != undefined && objProductAttributeMapping.productattribute != '') {
                        var columnExists = u.findWhere(conf.cols, {
                            caption: objProductAttributeMapping.productattribute.Name
                        });
                        if (columnExists == undefined || columnExists == '' || columnExists == null) {
                            var obj = new Object();
                            obj.caption = objProductAttributeMapping.productattribute.Name;
                            obj.type = 'string';
                            conf.cols.push(obj);
                        }
                    }
                    uploderProductAttributeMapping(i + 1);
                } else {
                    var NewColumn1 = {
                        caption: 'Stock Quantity',
                        type: 'string'
                    }
                    conf.cols.push(NewColumn1);

                    var NewColumn2 = {
                        caption: 'Overridden Price',
                        type: 'string'
                    }
                    conf.cols.push(NewColumn2);

                    var NewColumn3 = {
                        caption: 'Notify Admin For Quantity Below',
                        type: 'string'
                    }
                    conf.cols.push(NewColumn3);

                    var FinalList = [];
                    if (totalrecords > 0) {
                        function ManagetotalRecords(j) {
                            if (j < totalrecords) {
                                var ObjRow = [];

                                var onerecord = true;
                                var AllAttributes = "";
                                var AllAttributeValue = "";

                                if (lstAttributebyProductId.length > 0) {
                                    // lstAttributebyProductId
                                    function AttributebyProductId(k) {
                                        if (parseInt(k) >= 0) {
                                            if (lstAttributeValueAddedCount[k] == lstAttributeValueCount[k]) {
                                                lstAttributeValueAddedCount[k] = 0;
                                                if (k - 1 >= 0) {
                                                    lstAttributeValueAddedCount[k - 1] = lstAttributeValueAddedCount[k - 1] + 1;
                                                }
                                            }

                                            var valueindex = parseInt(lstAttributeValueAddedCount[k]);

                                            if (AllAttributes == "") {
                                                AllAttributes = lstAttributebyProductId[k].ProductAttributeId.toString();
                                                AllAttributeValue = lstAttributebyProductId[k].productattributevalues[valueindex].Id.toString();
                                            } else {
                                                AllAttributes = AllAttributes + "," + lstAttributebyProductId[k].ProductAttributeId.toString();
                                                AllAttributeValue = AllAttributeValue + "," + lstAttributebyProductId[k].productattributevalues[valueindex].Id.toString();
                                            }

                                            ObjRow[k] = lstAttributebyProductId[k].productattributevalues[valueindex].Name;

                                            if (onerecord) {
                                                onerecord = false;
                                                if (lstAttributeValueAddedCount[k] < lstAttributeValueCount[k]) {
                                                    lstAttributeValueAddedCount[k] = lstAttributeValueAddedCount[k] + 1;
                                                }
                                            }
                                            AttributebyProductId(k - 1);

                                        } else {
                                            CombinationTierPrice.belongsTo(ProductAttributeCombination, {
                                                foreignKey: {
                                                    name: 'ProductAttributeCombinationId',
                                                    allowNull: false
                                                }
                                            });

                                            function reversedAllAttributes(s) {
                                                return s.split(',').reverse().join(',');
                                            }
                                            var AttributeValue = reversedAllAttributes(AllAttributeValue);

                                            CombinationTierPrice.findOne({
                                                include: [{
                                                    model: ProductAttributeCombination,
                                                    where: {
                                                        ProductId: ProductId,
                                                        AttributeValueString: AttributeValue,
                                                    }
                                                }],
                                                where: {
                                                    Type: Type,
                                                    UserRoleId: parseInt(UserRoleId),
                                                }
                                            }).then(function(responsecombination) {
                                                if (responsecombination != null && responsecombination != '' && responsecombination != undefined) {
                                                    ObjRow.push(responsecombination.Quantity.toString());
                                                    ObjRow.push(responsecombination.Price.toString());
                                                    ObjRow.push(responsecombination.productattributecombination.NotifyAdminForQuantityBelow.toString());
                                                } else {
                                                    ObjRow.push('');
                                                    ObjRow.push('');
                                                    ObjRow.push('');
                                                }
                                                FinalList.push(ObjRow);

                                                ManagetotalRecords(j + 1);

                                            });
                                        }
                                    }
                                    AttributebyProductId(lstAttributebyProductId.length - 1);
                                }

                            } else {
                                conf.rows = [];
                                if (FinalList.length > 0) {
                                    function uploadExcel(l) {
                                        if (l < FinalList.length) {
                                            conf.rows.push(FinalList[l]);
                                            uploadExcel(l + 1);
                                        } else {
                                            var result = nodeExcel.execute(conf);
                                            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                                            res.setHeader("Content-Disposition", "attachment; filename=" + "ProductAttributeCombinationPrice_" + Type + ".xlsx");
                                            res.end(result, 'binary');
                                        }
                                    }
                                    uploadExcel(0);
                                }
                            }
                        }
                        ManagetotalRecords(0);
                    }

                }
            }
            uploderProductAttributeMapping(0);

        } else {
            var NewColumn1 = {
                caption: 'Stock Quantity',
                type: 'string'
            }
            conf.cols.push(NewColumn1);

            var NewColumn2 = {
                caption: 'Overridden Price',
                type: 'string'
            }
            conf.cols.push(NewColumn2);

            var NewColumn3 = {
                caption: 'Notify Admin For Quantity Below',
                type: 'string'
            }
            conf.cols.push(NewColumn3);
            var row = [];
            for (var i = 0; i < conf.cols.length; i++) {
                row.push('');
            };
            conf.rows = [];
            conf.rows.push(row);
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + "NoProductCombination.xlsx");
            res.end(result, 'binary');
        }
        // res.json(response);
    }).catch(function(error) {
        // res.json(error);
    })
});

router.post('/ImportProductAttributeCombinations', jsonParser, function(req, res) {
    var ProdAttrCombi_ProductId = req.query.ProductId;
    var Type = req.query.Type;
    var UserRoleId = req.query.UserRoleId;

    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';
    var FileName = [];
    form.parse(req, function(err, fields, files) {});
    form.on('fileBegin', function(name, file) {
        file.path = form.uploadDir + "/" + file.name;
        FileName.push(file.path);
    });
    form.on('end', function() {
        var lst = [];
        if (FileName.length > 0) {
            var workbook = XLSX.readFile(FileName[0], {
                type: 'binary'
            });
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            lst = XLSX.utils.sheet_to_json(worksheet);
            if (lst.length > 1) {
                var keyNames = Object.keys(lst[0]);
                var lstFieldName = [];

                for (var i in keyNames) {
                    lstFieldName.push(keyNames[i]);
                }
                if (lst.length > 1) {
                    function uploadExcel(i) {

                        var AttributeString = "";
                        var AttributeValueString = "";
                        var RowStockQty = 0;
                        var XMLAtt = "<Attributes>";
                        var NextCall = false;

                        if (i < lst.length) {
                            function uploadFieldName(j) {
                                var indexNum = 0;
                                if (j < lstFieldName.length) {
                                    if (lstFieldName[j] == "Stock Quantity") {
                                        RowStockQty = j;
                                        NextCall = true;
                                    } else {

                                        var ColName = lstFieldName[j];
                                        var objProductAttributes = {
                                            Name: ColName,
                                            Description: ColName
                                        };
                                        ProductAttribute.findOrCreate({
                                            where: {
                                                Name: ColName
                                            },
                                            defaults: objProductAttributes
                                        }).then(function(resProductAttributes) {
                                            var ProductAttributeId = resProductAttributes[0].Id
                                            var objProductAttributeMapping = {
                                                ProductId: ProdAttrCombi_ProductId,
                                                ProductAttributeId: ProductAttributeId,
                                                AttributeControlType: "Drop-down list",
                                                DisplayOrder: indexNum + 1,
                                                IsRequired: 0
                                            };
                                            ProductAttributeMapping.findOrCreate({
                                                where: {
                                                    ProductId: ProdAttrCombi_ProductId,
                                                    ProductAttributeId: ProductAttributeId
                                                },
                                                defaults: objProductAttributeMapping
                                            }).then(function(resProductAttributeMapping) {
                                                var ValName = lst[i][lstFieldName[j]];
                                                var ProductAttributeMappingId = resProductAttributeMapping[0].Id;
                                                ProductAttributeValue.findOne({
                                                    where: {
                                                        ProductAttributeMappingId: ProductAttributeMappingId,
                                                        Name: ValName
                                                    }
                                                }).then(function(objProdAttrVal) {
                                                    if (objProdAttrVal == null) {
                                                        var DisplayOrder = 1;
                                                        ProductAttributeValue.findOne({
                                                            where: {
                                                                ProductAttributeMappingId: ProductAttributeMappingId
                                                            },
                                                            order: 'DisplayOrder DESC'
                                                        }).then(function(objLastProductAttributevalue) {

                                                            if (objLastProductAttributevalue != null) {
                                                                DisplayOrder = objLastProductAttributevalue.DisplayOrder + 1;
                                                            }
                                                            var objProductAttributeValue = {
                                                                ProductAttributeMappingId: ProductAttributeMappingId,
                                                                Name: ValName,
                                                                PriceAdjustment: 0,
                                                                WeightAdjustment: 0,
                                                                Cost: 0,
                                                                Quantity: 0,
                                                                IsActive: true,
                                                                DisplayOrder: DisplayOrder,
                                                                AttributeValueTypeId: 0,
                                                                AssociatedProductId: 0,
                                                                IsPreSelected: 0,
                                                                PictureId: 0,
                                                            }
                                                            ProductAttributeValue.create(objProductAttributeValue).then(function(resProductAttributeValue) {
                                                                XMLAtt = XMLAtt + "<ProductVariantAttribute ID=\"" + ProductAttributeId + "\">";
                                                                XMLAtt = XMLAtt + "<ProductVariantAttributeValue>";
                                                                XMLAtt = XMLAtt + "<Value>" + objProdAttrVal.Id + "</Value>";
                                                                XMLAtt = XMLAtt + "</ProductVariantAttributeValue>";
                                                                XMLAtt = XMLAtt + "</ProductVariantAttribute>";

                                                                if (AttributeValueString == "") {
                                                                    AttributeValueString = AttributeValueString + objProdAttrVal.Id;
                                                                    AttributeString = AttributeString + ProductAttributeId;
                                                                } else {
                                                                    AttributeValueString = AttributeValueString + "," + objProdAttrVal.Id;
                                                                    AttributeString = AttributeString + "," + ProductAttributeId;
                                                                }
                                                                XMLAtt = XMLAtt + "</Attributes>";
                                                                uploadFieldName(j + 1);
                                                            })
                                                        })
                                                    }
                                                    if (objProdAttrVal != null) {
                                                        XMLAtt = XMLAtt + "<ProductVariantAttribute ID=\"" + ProductAttributeId + "\">";
                                                        XMLAtt = XMLAtt + "<ProductVariantAttributeValue>";
                                                        XMLAtt = XMLAtt + "<Value>" + objProdAttrVal.Id + "</Value>";
                                                        XMLAtt = XMLAtt + "</ProductVariantAttributeValue>";
                                                        XMLAtt = XMLAtt + "</ProductVariantAttribute>";

                                                        if (AttributeValueString == "") {
                                                            AttributeValueString = AttributeValueString + objProdAttrVal.Id;
                                                            AttributeString = AttributeString + ProductAttributeId;
                                                        } else {
                                                            AttributeValueString = AttributeValueString + "," + objProdAttrVal.Id;
                                                            AttributeString = AttributeString + "," + ProductAttributeId;
                                                        }
                                                        XMLAtt = XMLAtt + "</Attributes>";
                                                        uploadFieldName(j + 1);
                                                    }
                                                })
                                            })
                                        })
                                    }
                                }
                                if (NextCall) {
                                    ProductAttributeCombination.findOne({
                                        where: {
                                            AttributesXml: XMLAtt,
                                            ProductId: ProdAttrCombi_ProductId
                                        }
                                    }).then(function(objAttributeCombination) {
                                        if (objAttributeCombination != null) {
                                            var OverriddenPrice = 0;
                                            if (lst[i][lstFieldName[j + 1]] > 0) {
                                                OverriddenPrice = lst[i][lstFieldName[j + 1]];
                                            }
                                            var StockQuantity = 0;
                                            if (lst[i][lstFieldName[j]] > 0) {
                                                StockQuantity = lst[i][lstFieldName[j]];
                                            }
                                            var NotifyAdminForQuantityBelow = 0;
                                            if (lst[i][lstFieldName[j + 2]] > 0) {
                                                NotifyAdminForQuantityBelow = lst[i][lstFieldName[j + 1]];
                                            }
                                            if (OverriddenPrice > 0) {
                                                var objProductAttributeCombinations = {
                                                    ProductId: ProdAttrCombi_ProductId,
                                                    AttributesXml: XMLAtt,
                                                    AttributeString: AttributeString,
                                                    AttributeValueString: AttributeValueString,
                                                    StockQuantity: StockQuantity,
                                                    OverriddenPrice: OverriddenPrice,
                                                    NotifyAdminForQuantityBelow: NotifyAdminForQuantityBelow,
                                                    AllowOutOfStockOrders: 0
                                                }
                                                ProductAttributeCombination.update(objProductAttributeCombinations, {
                                                    where: {
                                                        AttributesXml: XMLAtt,
                                                        ProductId: ProdAttrCombi_ProductId,
                                                    }
                                                }).then(function(resProductAttributeCombinations) {
                                                    var objProductAttributeCombinationTierPrice = {
                                                        ProductAttributeCombinationId: objAttributeCombination.Id,
                                                        UserRoleId: UserRoleId,
                                                        Quantity: StockQuantity,
                                                        Price: OverriddenPrice,
                                                        Type: Type
                                                    }
                                                    CombinationTierPrice.findOrCreate({
                                                        where: {
                                                            ProductAttributeCombinationId: objAttributeCombination.Id,
                                                            UserRoleId: UserRoleId,
                                                            Type: Type
                                                        },
                                                        defaults: objProductAttributeCombinationTierPrice
                                                    }).then(function(response) {
                                                        if ((response[1])) {
                                                            uploadExcel(i + 1);
                                                        } else {
                                                            CombinationTierPrice.update(objProductAttributeCombinationTierPrice, {
                                                                where: {
                                                                    ProductAttributeCombinationId: resProductAttributeCombinations.Id,
                                                                    UserRoleId: UserRoleId,
                                                                    Type: Type
                                                                }
                                                            }).then(function(response) {
                                                                uploadExcel(i + 1);
                                                            })
                                                        }
                                                    })
                                                })
                                            }
                                        } else {
                                            var OverriddenPrice = 0;
                                            if (lst[i][lstFieldName[j + 1]] > 0) {
                                                OverriddenPrice = lst[i][lstFieldName[j + 1]];
                                            }
                                            var StockQuantity = 0;
                                            if (lst[i][lstFieldName[j]] > 0) {
                                                StockQuantity = lst[i][lstFieldName[j]];
                                            }
                                            var NotifyAdminForQuantityBelow = 0;
                                            if (lst[i][lstFieldName[j + 2]] > 0) {
                                                NotifyAdminForQuantityBelow = lst[i][lstFieldName[j + 1]];
                                            }
                                            if (OverriddenPrice > 0) {
                                                var objProductAttributeCombinations = {
                                                    ProductId: ProdAttrCombi_ProductId,
                                                    AttributesXml: XMLAtt,
                                                    AttributeString: AttributeString,
                                                    AttributeValueString: AttributeValueString,
                                                    StockQuantity: StockQuantity,
                                                    OverriddenPrice: OverriddenPrice,
                                                    NotifyAdminForQuantityBelow: NotifyAdminForQuantityBelow,
                                                    AllowOutOfStockOrders: 0
                                                }
                                                ProductAttributeCombination.create(objProductAttributeCombinations).then(function(resProductAttributeCombinations) {
                                                    var objProductAttributeCombinationTierPrice = {
                                                        ProductAttributeCombinationId: resProductAttributeCombinations.Id,
                                                        UserRoleId: UserRoleId,
                                                        Quantity: resProductAttributeCombinations.StockQuantity,
                                                        Price: resProductAttributeCombinations.OverriddenPrice,
                                                        Type: Type
                                                    }
                                                    CombinationTierPrice.findOrCreate({
                                                        where: {
                                                            ProductAttributeCombinationId: resProductAttributeCombinations.Id,
                                                            UserRoleId: UserRoleId,
                                                            Type: Type
                                                        },
                                                        defaults: objProductAttributeCombinationTierPrice
                                                    }).then(function(response) {
                                                        if ((response[1])) {
                                                            uploadExcel(i + 1);
                                                        } else {
                                                            CombinationTierPrice.update(objProductAttributeCombinationTierPrice, {
                                                                where: {
                                                                    ProductAttributeCombinationId: resProductAttributeCombinations.Id,
                                                                    UserRoleId: UserRoleId,
                                                                    Type: Type
                                                                }
                                                            }).then(function(response) {
                                                                uploadExcel(i + 1);
                                                            })
                                                        }
                                                    })
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                            uploadFieldName(0);
                        }
                        if((i + 1) == lst.length)
                        {
                            res.json({
                                success: true,
                                message: "File Imported Successfully...",
                            });
                        }
                    }
                    uploadExcel(0);
                } else {
                    res.json({
                        success: false,
                        message: "No Data in Excel File...",
                    });
                }
            } else {
                res.json(lst);
            };
        }
    });
});

module.exports = router
