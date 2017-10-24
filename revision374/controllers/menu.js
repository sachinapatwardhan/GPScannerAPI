//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Menu = models.tblmenumgmt;
var MenuStructure = models.tblmenustructure;
//End of Tables

//-----Menu master-----//
router.get('/GetAllMenuMgmt', function(req, res) {
    Menu.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetMenuMgmtById/:idMenu', function(req, res) {
    Menu.findOne({ where: { id: req.params.idMenu } }).then(function(response) {
        if (response != null) {
            res.json(response);
        } else {
            res.json("Record not found...");
        }
    })
})

router.post('/CreateMenuMgmt', jsonParser, function(req, res) {

    var objMenu = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //set Parameter
    req.query['permission'] = "Added";

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

                        Menu.create(objMenu).then(function(response) {
                            funAuditLog.CreateAuditLog('CreateMenuMgmt', UserExist.username, 'Create Menu Mgmt');
                            res.json({ success: true, message: "Menu created successfully...", data: response });
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

router.get('/DeleteMenuMgmt', function(req, res) {
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
                        MenuStructure.destroy({ where: { idMenu: req.query.MenuId } }).then(function(response1) {
                            Menu.destroy({ where: { id: req.query.MenuId } }).then(function(response) {
                                if (response) {
                                    funAuditLog.CreateAuditLog('DeleteMenuMgmt', UserExist.username, 'Delete Menu Mgmt');
                                    res.json({ success: true, message: "Menu deleted successfully...", data: response });
                                } else {
                                    res.json(RecordNotFound);
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
//-----End of Menu master-----//

//-----Menu Structure-----//
router.get('/GetAllMenuStructure', function(req, res) {
    MenuStructure.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetMenuStructurerById/:idMenuStructure', function(req, res) {
    MenuStructure.findOne({ where: { id: req.params.idMenuStructure } }).then(function(response) {
        if (response != null) {
            res.json(response);
        } else {
            res.json("Record not found...");
        }
    })
})

router.post('/CreateBulkMenuStructure', jsonParser, function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    //set Parameter
    req.query['permission'] = "Modified";

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
                        var lstMenuStructure = req.body;
                        var MenuId = lstMenuStructure[0].idMenu;

                        function uploader(i) {
                            if (i < lstMenuStructure.length) {
                                if (lstMenuStructure[i].ParentId > 0) {
                                    MenuStructure.findOne({ where: { idMenu: MenuId, idType: lstMenuStructure[i].ParentId, Type: lstMenuStructure[i].Type } }).then(function(results) {
                                        if (results != null && results != undefined) {
                                            lstMenuStructure[i].idParent = results.id;
                                        } else {
                                            var objMenudata = u.findWhere(lstMenuStructure, { idType: lstMenuStructure[i].ParentId, Type: lstMenuStructure[i].ParentType });
                                            MenuStructure.create(objMenudata).then(function(response1) {
                                                lstMenuStructure[i].idParent = response1.id;
                                            }).catch(function(error) {
                                                res.json(error.errors[0].message + "...");
                                            })

                                        };
                                    })

                                } else {
                                    lstMenuStructure[i].idParent = lstMenuStructure[i].ParentId;
                                };

                                MenuStructure.findOne({ where: { idMenu: MenuId, idType: lstMenuStructure[i].idType, idParent: lstMenuStructure[i].idParent, Type: lstMenuStructure[i].Type } }).then(function(results) {

                                    if (results == null || results == undefined) {
                                        MenuStructure.create(lstMenuStructure[i]).then(function(response1) {
                                            uploader(i + 1);
                                        }).catch(function(error) {
                                            console.log(error);
                                        })
                                    };
                                })
                            }
                        }

                        //remove all Menu structure by Menu Id
                        MenuStructure.destroy({ where: { idMenu: MenuId } }).then(function(response) {
                            var i = 0;
                            uploader(i);
                            funAuditLog.CreateAuditLog('CreateBulkMenuStructure', UserExist.username, 'Create Menu Structure');
                            res.json({ success: true, message: "Menu structure created successfully..." });
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

router.get('/DeleteMenuStructure/:idMenuStructure', function(req, res) {
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
                        MenuStructure.destroy({ where: { id: req.params.idMenuStructure } }).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('DeleteMenuStructure', UserExist.username, 'Delete Menu Structure');
                                res.json("MenuStructure deleted successfully");
                            } else {
                                res.json("Requested Record not Exist...");
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


router.get('/GetAllMenu', function(req, res) {
    Menu.findAndCountAll().then(function(results) {
        // projects will be an array of Project instances with the specified name
        res.json(results);
    })
})

router.get('/GetMenuStructureByMenuId', function(req, res) {

    MenuStructure.findAndCountAll({ where: { idMenu: req.query.MenuId } }).then(function(results) {
        // projects will be an array of Project instances with the specified name
        res.json(results);
    })
})

router.get('/GetMenuStructureByMenuName', function(req, res) {

    MenuStructure.belongsTo(Menu, {
        foreignKey: {
            name: 'idMenu',
            allowNull: false
        }
    });
    MenuStructure.findAll({
        include: [{
            model: Menu,
            where: { MenuLabel: req.query.MenuName }
        }]
    }).then(function(results) {
        // projects will be an array of Project instances with the specified name
        res.json(results);
    })
})

module.exports = router