//Tables
var router = express.Router();
var User = models.tbluserinformation;
var DynamicPage = models.tbldynamicpagemgmt;
//End of Tables

router.get('/GetAllDynamicPage', function (req, res) {
    DynamicPage.findAll().then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})

router.get('/GetDynamicPageById', function (req, res) {
    DynamicPage.findOne({ where: { id: req.query.idDynamicPage } }).then(function (response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        }
        else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.get('/GetCMSPageBySlug', function(req, res) {
    DynamicPage.findOne({ where: { Slug: req.query.Slug } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        }
        else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
});

router.post('/SaveDynamicPage', jsonParser, function (req, res) {
    objDynamicPage = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                if (objDynamicPage.id == 0) {
                    DynamicPage.findOrCreate({ where: { Slug: objDynamicPage.Slug }, defaults: objDynamicPage }).then(function (response) {
                        if ((response[1])) {
                            //res.json("DynamicPage created successfully...");
                            funAuditLog.CreateAuditLog('SaveDynamicPage', UserExist.username , 'Create DynamicPage: ('+response[1].Name+')');
                            res.json({ success: true, message: "DynamicPage created successfully...", data: response });
                        }
                        else {
                            //res.json("DynamicPage is already Exist...");
                            res.json({ success: true, message: "DynamicPage is already Exist...", data: response });
                        }
                    })
                }
                else {
                    DynamicPage.findOne({ where: { Slug: objDynamicPage.Slug }, defaults: objDynamicPage }).then(function (objDynamicPageExist) {
                        if (objDynamicPageExist != null && objDynamicPage.id != objDynamicPageExist.id) {
                            res.json({ success: false, message: "DynamicPage is already Exist...", data: objDynamicPageExist });
                        }
                        else {
                            DynamicPage.update(objDynamicPage, { where: { id: objDynamicPage.id } }).then(function (response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('Update DynamicPage', UserExist.username , 'Update DynamicPage: ('+objDynamicPageExist.Name+')');
                                    res.json({ success: true, message: "DynamicPage updated successfully...", data: response });
                                }
                            })
                        }
                    })
                }
            }
            else {
                res.json(InvalidToken);
            }
        })
    }
    else {
        res.json(InvalidToken);
    }
});

//router.get('/UpdateDynamicPage', function (req, res) {

//    var objDynamicPage = {
//        id: 1,
//        Title: 'title2',
//        Name: 'name_2',
//        PageContent: 'a sda sdka sdkja sdkah sdk2',
//        isPublish: 1,
//        Slug: 'page1',
//        MetaTag: 'meta tag1',
//        MetaDescription: 'meta description1',
//        isHomePage: 1,
//        CreatedBy: 'Desai2',
//        CreatedDate: new Date(),
//        ModifiedBy: 'Desai2',
//        ModifiedDate: new Date(),
//    };

//    DynamicPage.update(objDynamicPage, { where: { id: 8 } }).then(function (response) {
//        if (response[0]) {
//            res.json("DynamicPage updated successfully...");
//        }
//        else {
//            res.json("DynamicPage not Found...");
//        }
//    })

//});

router.get('/DeleteDynamicPage', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                DynamicPage.destroy({ where: { id: req.query.idDynamicPage } }).then(function (response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeleteDynamicPage', UserExist.username , 'Delete DynamicPage');
                        res.json({ success: true, message: "DynamicPage deleted successfully...", data: response });
                    }
                    else {
                        res.json(RecordNotFound);
                    }
                })
            }
            else {
                res.json(InvalidToken);
            }
        })
    }
    else {
        res.json(InvalidToken);
    }
});

module.exports = router
