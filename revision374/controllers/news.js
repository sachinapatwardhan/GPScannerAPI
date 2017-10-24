//Tables
var router = express.Router();
var User = models.tbluserinformation;
var News = models.tblnewsmgmt;
//End of Tables

router.get('/GetAllNews', function(req, res) {
    News.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetNewsById', function(req, res) {
    News.findOne({ where: { id: req.query.idNews } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveNews', jsonParser, function(req, res) {
    objNews = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objNews.id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;
                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            News.findOrCreate({ where: { Name: objNews.Name }, defaults: objNews }).then(function(response) {
                                if ((response[1])) {
                                    res.json({ success: true, message: "News created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "News is already Exist...", data: response });
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

                            News.findOne({ where: { Name: objNews.Name }, defaults: objNews }).then(function(objNewsExist) {
                                if (objNewsExist != null && objNews.id != objNewsExist.id) {
                                    res.json({ success: false, message: "News is already Exist...", data: objNewsExist });
                                } else {
                                    News.update(objNews, { where: { id: objNews.id } }).then(function(response) {
                                        if (response[0]) {
                                            res.json({ success: true, message: "News updated successfully...", data: response });
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

router.get('/DeleteNews', function(req, res) {
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
                        News.destroy({ where: { id: req.query.idNews } }).then(function(response) {
                            if (response) {
                                res.json({ success: true, message: "News deleted successfully...", data: response });
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
