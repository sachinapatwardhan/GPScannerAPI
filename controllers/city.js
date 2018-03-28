//Tables
var router = express.Router();
var User = models.tbluserinformation;
var City = models.tblstatecitymgmt;
var State = models.tblcountrystatemgmt;
var Country = models.tblcountrymgmt;
//End of Tables



router.get('/GetAllCity', function(req, res) {

    City.belongsTo(State, {
        foreignKey: {
            name: 'idState',
            allowNull: false
        }
    });

    State.belongsTo(Country, {
        foreignKey: {
            name: 'idCountry',
            allowNull: false
        }
    });

    City.findAll({
        include: [{
            model: State,
            include: [
                Country
            ]
        }]
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllCityByStateId', function(req, res) {
    City.findAll({ where: { idState: req.query.StateId } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.get('/GetAllCityByPagging', function(req, res) {



    var objParam = req.query;
    var objColumns = objParam.columns;

    for (var i = 0; i < objColumns.length; i++) {
        if (objColumns[i].data == "tblcountrystatemgmt.tblcountrymgmt.Country") {
            objColumns[i].data = "Country";
        } else if (objColumns[i].data == "Name") {
            objColumns[i].data = "tblstatecitymgmt.Name";
        }
    };

    var objOrder = objParam.order;
    var objSearch = objParam.search.value;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    // console.log(objOrder)
    // if (objOrder[0].column == 1) {
    //     Orderby = "Country" + ' ' + objOrder[0].dir;
    // }
    var search = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];
        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                var obj = new Object();
                // if (columnName == "tblcountrystatemgmt.tblcountrymgmt.Country") {
                //     search['$or'].push(['Country like ?', "%" + objSearch + "%"]);
                // }
                // // else if (columnName == "Name") {
                // //     search['$or'].push(['tblstatecitymgmt.Name like ?', "%" + objSearch + "%"]);
                // // } 
                // else {
                search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                //}


            };
        };
    }


    City.belongsTo(State, {
        foreignKey: {
            name: 'idState',
            allowNull: false
        }
    });

    State.belongsTo(Country, {
        foreignKey: {
            name: 'idCountry',
            allowNull: false
        }
    });


    City.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
        include: [{
            model: State,
            required: true,
            // attributes: ['id', [models.sequelize.col('Name'), 'State']],
            attributes: ['id', 'Name'],
            include: [{
                model: Country,
                required: true,
                attributes: ['id', 'Country']
            }]
        }],
    }).then(function(response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function(error) {
        res.json({
            success: false,
            response: error
        });
    })
})

router.get('/GetCityById', function(req, res) {
    City.findOne({ where: { id: req.query.CityId } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveCity', jsonParser, function(req, res) {
    objCity = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objCity.id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            City.findOrCreate({ where: { Name: objCity.Name, idState: objCity.idState }, defaults: objCity }).then(function(response) {
                                if ((response[1])) {
                                  //  funAuditLog.CreateAuditLog('SaveCity', UserExist.username, 'Create City ('+ response[1].Name +')');
                                    res.json({ success: true, message: "City created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "City is already Exist...", data: response });
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

                            City.findOne({ where: { Name: objCity.Name, idState: objCity.idState }, defaults: objCity }).then(function(objCityExist) {
                                if (objCityExist != null && objCity.id != objCityExist.id) {
                                    res.json({ success: false, message: "City is already Exist...", data: objCityExist });
                                } else {
                                    City.update(objCity, { where: { id: objCity.id } }).then(function(response) {
                                        if (response[0]) {
                                         //   funAuditLog.CreateAuditLog('Update City', UserExist.username, 'Update City ('+objCityExist.Name+') ');
                                            res.json({ success: true, message: "City updated successfully...", data: response });
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

router.get('/DeleteCity', function(req, res) {
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
                        City.destroy({ where: { id: req.query.CityId } }).then(function(response) {
                            if (response) {
                               // funAuditLog.CreateAuditLog('DeleteCity', UserExist.username, 'Delete City ('+ response.Name +')');
                                res.json({ success: true, message: "City deleted successfully...", data: response });
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