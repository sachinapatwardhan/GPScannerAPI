//Tables
var router = express.Router();
var User = models.tbluserinformation;
var facebookpage = models.tblfacebookpagesettings;
//End of Tables

router.get('/GetAllFacebookPage', function(req, res) {
    facebookpage.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllFacebookPageByCountry', function(req, res) {
    facebookpage.findOne({ where: { CountryName: req.query.CountryName } }).then(function(response) {

        if (response != null) {
            res.json(response);
        } else {
            facebookpage.findOne({ where: { CountryName: 'Default' } }).then(function(response1) {
                res.json(response1);
            }).catch(function(error) {
                res.json(error);
            })
        };


    }).catch(function(error) {
        res.json(error);
    })
})


router.post('/SaveFacebookPage', jsonParser, function(req, res) {
    objfacebookpage = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];


    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objfacebookpage.id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            facebookpage.findOrCreate({ where: { CountryName: objfacebookpage.CountryName }, defaults: objfacebookpage }).then(function(response) {
                                if ((response[1])) {
                                    res.json({ success: true, message: "Facebook Page created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Facebook Page is already Exist...", data: response });
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

                            facebookpage.findOne({ where: { CountryName: objfacebookpage.CountryName }, defaults: objfacebookpage }).then(function(objfacebookpageExist) {
                                if (objfacebookpageExist != null && objfacebookpage.id != objfacebookpageExist.id) {
                                    res.json({ success: false, message: "Facebook Page is already Exist...", data: objfacebookpageExist });
                                } else {
                                    facebookpage.update(objfacebookpage, { where: { id: objfacebookpage.id } }).then(function(response) {
                                        if (response[0]) {
                                            res.json({ success: true, message: "Facebook Page updated successfully...", data: response });
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

router.get('/DeleteFacebookPage', function(req, res) {
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
                        facebookpage.destroy({ where: { id: req.query.idFacebookPage } }).then(function(response) {
                            if (response) {
                                res.json({ success: true, message: "Facebook Page deleted successfully...", data: response });
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
