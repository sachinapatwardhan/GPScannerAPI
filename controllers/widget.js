    //Tables
    var router = express.Router();
    var User = models.tbluserinformation;
    var Widget = models.tblwidgetmgmt;
    //End of Tables

    router.get('/GetAllWidget', function(req, res) {
        Widget.findAll().then(function(response) {
            res.json(response);
        }).catch(function(error) {
            res.json(error);
        })
    })

    router.get('/GetAllWidgetByType', function(req, res) {
        var search = "Web";
        if (req.query.CmsType != undefined && req.query.CmsType != '' && req.query.CmsType != null) {
            search = req.query.CmsType;
        }

        Widget.findAll({
            where: { CmsType: search },
        }).then(function(response) {
            res.json(response);
        }).catch(function(error) {
            res.json(error);
        })
    })



    router.get('/GetWidgetById', function(req, res) {
        Widget.findAll({ where: { id: req.query.WidgetId } }).then(function(response) {
            if (response != null) {
                res.json(response);
            } else {
                res.json("Record not found...");
            }
        })
    })

    //Get Widget By Name for FrontSide
    router.get('/GetWidgetByName', function(req, res) {
        Widget.findAll({ where: { Name: req.query.WidgetName } }).then(function(response) {
            if (response != null) {
                res.json(response);
            } else {
                res.json("Record not found...");
            }
        })
    })


    router.post('/SaveWidget', jsonParser, function(req, res) {
        objWidget = req.body;
        objHeader = req.headers;

        //Set Parameter for User Permission
        req.query['tablename'] = req.headers['x-requested-with'];

        var token = getToken(objHeader);
        if (token) {
            var decoded = jwt.decode(token, TokenKey);
            User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
                if (UserExist != null) {
                    if (objWidget.id == 0) {

                        //set Parameter
                        req.query['permission'] = "Added";

                        var obj = {};
                        obj.headers = req.headers;
                        obj.query = req.query;

                        funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                            var AccessPermission = responseAccessPermission.success;
                            if (AccessPermission) {
                                Widget.findOrCreate({ where: { Title: objWidget.Title, Name: objWidget.Name }, defaults: objWidget }).then(function(response) {
                                    if ((response[1])) {
                                        funAuditLog.CreateAuditLog('SaveWidget', UserExist.username, 'Create Widget');
                                        res.json({ success: true, message: "Widget created successfully...", data: response });
                                    } else {
                                        res.json({ success: false, message: "Widget is already Exist...", data: response });
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
                                Widget.findOne({ where: { Title: objWidget.Title, Name: objWidget.Name }, defaults: objWidget }).then(function(objWidgetExist) {
                                    if (objWidgetExist != null && objWidget.id != objWidgetExist.id) {
                                        res.json({ success: false, message: "Widget is already Exist...", data: objWidgetExist });
                                    } else {
                                        Widget.update(objWidget, { where: { id: objWidget.id } }).then(function(response) {
                                            if (response[0]) {
                                                funAuditLog.CreateAuditLog('SaveWidget', UserExist.username, 'Update Widget');
                                                res.json({ success: true, message: "Widget updated successfully...", data: response });
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

    router.get('/DeleteWidget', function(req, res) {
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
                            Widget.destroy({ where: { id: req.query.WidgetId } }).then(function(response) {
                                if (response) {
                                    funAuditLog.CreateAuditLog('DeleteWidget', UserExist.username, 'Delete Widget');
                                    res.json({ success: true, message: "Widget deleted successfully...", data: response });
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