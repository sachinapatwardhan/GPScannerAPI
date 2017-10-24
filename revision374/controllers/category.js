//Tables
var router = express.Router();
var Category = models.tblcategorymgmt;
var ParentCategory = models.tblcategorymgmt;
var CategoryApplyDiscount = models.discount_appliedtocategories;
var Discount = models.discount;
var ProductCategoryMapping = models.product_category_mapping;
var User = models.tbluserinformation;
var UserPermission = models.tbluserpermission;

//End of Tables

router.get('/GetAllCategory', function(req, res) {
    // console.log(req.headers['x-requested-with'])
    // console.log(router)

    // console.log(UserPermissionRouter)
    // console.log(express.Router())




    Category.hasMany(CategoryApplyDiscount, {
        foreignKey: {
            name: 'Category_Id',
            allowNull: false
        }
    });
    CategoryApplyDiscount.belongsTo(Discount, {
        foreignKey: {
            name: 'Discount_Id',
            allowNull: false
        }
    });

    Category.findAll({
        include: [ParentCategory.belongsTo(Category, {
            as: 'ParentCategory',
            foreignKey: {
                name: 'Parent',
                allowNull: false
            }
        }), {
            model: CategoryApplyDiscount,
            include: [{ model: Discount, attributes: ['Id', 'Name'] }]
        }]
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})


router.get('/GetAllParentCategory', function(req, res) {
    Category.findAll({ where: { Parent: null } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Parent Category found...", data: response });
        } else {
            res.json({ success: false, message: "Parent Category not found...", data: response });
        }
    })
})

router.get('/GetCategoryById', function(req, res) {
    Category.findOne({ where: { id: req.query.idCategory } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Category found...", data: response });
        } else {
            res.json({ success: false, message: "Category not found...", data: response });
        }
    })
})

router.post('/CreateCategory', jsonParser, function(req, res) {
    var objCategory = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                var ApplyDiscount = objCategory.ApplyDiscount;
                if (objCategory.id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            Category.findOrCreate({ where: { Title: objCategory.Title }, defaults: objCategory }).then(function(response) {
                                if ((response[1])) {
                                    var CategoryId = response[0].id;
                                    SaveCategoryApplyDiscount(CategoryId, ApplyDiscount, req);
                                    res.json({ success: true, message: "Category created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Category is already Exist...", data: response });
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {
                    var CategoryId = objCategory.id;

                    //set Parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            Category.findOne({ where: { Title: objCategory.Title }, defaults: objCategory }).then(function(objCategoryExist) {
                                if (objCategoryExist != null && CategoryId != objCategoryExist.id) {
                                    res.json({ success: false, message: "Category is already Exist...", data: objCategoryExist });
                                } else {
                                    Category.update(objCategory, { where: { id: objCategory.id } }).then(function(response) {
                                        if (response[0]) {
                                            SaveCategoryApplyDiscount(CategoryId, ApplyDiscount, req);
                                            res.json({ success: true, message: "Category updated successfully...", data: response });
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

});

router.get('/DeleteCategory', function(req, res) {
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
                        ParentCategory.findOne({ where: { Parent: req.query.idCategory } }).then(function(resParentCategory) {
                            ProductCategoryMapping.findOne({ where: { CategoryId: req.query.idCategory } }).then(function(resProdCatMapp) {
                                if (resParentCategory == null && resProdCatMapp == null) {
                                    Category.destroy({ where: { id: req.query.idCategory } }).then(function(response) {
                                        if (response) {
                                            res.json({ success: true, message: "Category deleted successfully...", data: response });
                                        } else {
                                            res.json(RecordNotFound);
                                        }
                                    })
                                } else {
                                    res.json(NotDeleteReferenceData);
                                }
                            })
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

function SaveCategoryApplyDiscount(CategoryId, arrCategoryApplyDiscount, req) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                var lstCategoryApplyDiscount = [];
                for (var i = 0; i < arrCategoryApplyDiscount.length; i++) {
                    var objCategoryApplyDiscount = { Discount_Id: arrCategoryApplyDiscount[i].Id, Category_Id: CategoryId };
                    lstCategoryApplyDiscount.push(objCategoryApplyDiscount);
                }

                CategoryApplyDiscount.destroy({ where: { Category_Id: CategoryId } }).then(function(resDestroyCategoryApplyDiscount) {
                    CategoryApplyDiscount.bulkCreate(lstCategoryApplyDiscount).then(function(resCreateCategoryApplyDiscount) {})
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
}

module.exports = router
