var express = require('express'),
    router = express.Router();
//var app = express();
//var fs = require('fs');
//var formidable = require('formidable');

//Tables
app.use(express.static(__dirname + '/../MediaUploads'));
var ProductPicture = models.product_picture_mapping;
var User = models.tbluserinformation;
var MediaMgmt = models.tblmediamgmt;
//End of Tables

router.get('/GetAllProductPictureByProductId', function(req, res) {   
    ProductPicture.belongsTo(MediaMgmt, {
        foreignKey: {
            name: 'PictureId',
            allowNull: false
        }
    });
    ProductPicture.findAll({
        where: { ProductId: req.query.idProductPicture },
        include: [{
            model: MediaMgmt
        }]
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetProductPictureById', function(req, res) {
    ProductPicture.findOne({ where: { id: req.query.idProductPicture } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Product Picture created successfully...", data: response });
        } else {
            res.json({ success: false, message: "Product Picture is already Exist...", data: response });
        }
    })
})

router.post('/CreateProductPicture', jsonParser, function(req, res) {
    var objProductPicture = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objProductPicture.PictureId != 0) {
                    if (objProductPicture.Id == 0) {

                        //set Parameter
                        req.query['permission'] = "Added";

                        var obj = {};
                        obj.headers = req.headers;
                        obj.query = req.query;

                        funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                            var AccessPermission = responseAccessPermission.success;
                            if (AccessPermission) {

                                ProductPicture.findOrCreate({ where: { PictureId: objProductPicture.PictureId, ProductId: objProductPicture.ProductId }, defaults: objProductPicture }).then(function(response) {
                                    if ((response[1])) {
                                        funAuditLog.CreateAuditLog('CreateProductPicture', UserExist.username, 'Create Product Picture');
                                        res.json({ success: true, message: "Product Picture created successfully...", data: response });
                                    } else {
                                        res.json({ success: false, message: "Product Picture is already Exist...", data: response });
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
                                ProductPicture.findOne({ where: { PictureId: objProductPicture.PictureId, ProductId: objProductPicture.ProductId }, defaults: objProductPicture }).then(function(objProductPictureExist) {
                                    if (objProductPictureExist != null && objProductPicture.Id != objProductPictureExist.Id) {
                                        res.json({ success: false, data: objProductPictureExist, message: "Product Picture is already Exist..." });
                                    } else {
                                        ProductPicture.update(objProductPicture, { where: { Id: objProductPicture.Id } }).then(function(resUpdate) {
                                            if (resUpdate[0]) {
                                                funAuditLog.CreateAuditLog('CreateProductPicture', UserExist.username, 'Update Product Picture');
                                                res.json({ success: true, data: resUpdate, message: "Product Picture updated successfully..." });
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
                    res.json({ success: false, message: "Image is Required..." });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/DeleteProductPicture', function(req, res) {
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
                        ProductPicture.destroy({ where: { Id: req.query.idProductPicture } }).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('DeleteProductPicture', UserExist.username, 'Delete Product Picture');
                                res.json({ success: true, message: "Product Picture deleted successfully...", data: response });
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
        } else {
            res.json(NoAccessPermission);
        }
    });
});

module.exports = router
