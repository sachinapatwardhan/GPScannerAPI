//Tables
var router = express.Router();
var User = models.tbluserinformation;
var State = models.tblcountrystatemgmt;
var Country = models.tblcountrymgmt;
var Address = models.address;
var City = models.tblstatecitymgmt;
var BillingAddress = models.tblbillingaddress;
var DeliveryAddress = models.tbldeliveryaddress;
var Order = models.tblorder;
//End of Tables

State.belongsTo(Country, {
    foreignKey: {
        name: 'idCountry',
        allowNull: false
    }
})

router.get('/GetAllState', function(req, res) {
    State.findAll({ include: [{ model: Country }] }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllStateByPagging', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;

    for (var i = 0; i < objColumns.length; i++) {
        if (objColumns[i].data == "tblcountrymgmt.Country") {
            objColumns[i].data = "Country";
        } else if (objColumns[i].data == "ShortName") {
            objColumns[i].data = "tblcountrystatemgmt.ShortName";
        }
    };


    var objOrder = objParam.order;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var objSearch = objParam.search.value;


    var search = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];

        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                var obj = new Object();
                search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
            };
        };
    }

    State.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
        include: [{
            model: Country,
            required: true,
            attributes: ['id', 'Country']
        }]
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

router.get('/GetAllStateByCountryId', function(req, res) {
    State.findAll({ where: { idCountry: req.query.CountryId } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveState', jsonParser, function(req, res) {
    objState = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objState.id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            State.findOrCreate({ where: { Name: objState.Name, idCountry: objState.idCountry }, defaults: objState }).then(function(response) {
                                if ((response[1])) {
                                    res.json({ success: true, message: "State created successfully...", data: response });
                                    funAuditLog.CreateAuditLog('SaveState', UserExist.username , 'Create State');
                                } else {
                                    res.json({ success: false, message: "State is already Exist...", data: response });
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

                            State.findOne({ where: { Name: objState.Name, idCountry: objState.idCountry }, defaults: objState }).then(function(objStateExist) {
                                if (objStateExist != null && objState.id != objStateExist.id) {
                                    res.json({ success: false, message: "State is already Exist...", data: objStateExist });
                                } else {
                                    State.update(objState, { where: { id: objState.id } }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveState', UserExist.username , 'Update State');
                                            res.json({ success: true, message: "State updated successfully...", data: response });
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

router.get('/DeleteState', function(req, res) {
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
                        City.findOne({ where: { idState: req.query.StateId } }).then(function(resCity) {
                            Address.findOne({ where: { StateProvinceId: req.query.StateId } }).then(function(resAddress) {
                                BillingAddress.findOne({ where: { idState: req.query.StateId } }).then(function(resBillingAddress) {
                                    DeliveryAddress.findOne({ where: { idState: req.query.StateId } }).then(function(resDeliveryAddress) {
                                        Order.findOne({ where: { ShippidState: req.query.StateId } }).then(function(resOrder) {
                                            if (resCity == null && resAddress == null && resBillingAddress == null && resDeliveryAddress == null && resOrder == null) {
                                                State.destroy({ where: { id: req.query.StateId } }).then(function(response) {
                                                    if (response) {
                                                        funAuditLog.CreateAuditLog('DeleteState', UserExist.username , 'Delete State');
                                                        res.json({ success: true, message: "State deleted successfully...", data: response });
                                                    } else {
                                                        res.json({ success: false, message: "Requested Record not Exist....", data: response });
                                                    }
                                                })
                                            } else {
                                                res.json(NotDeleteReferenceData);
                                            }
                                        })
                                    })
                                })
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

router.get('/GetAllStateForApp', function(req, res) {
    var offset = (parseInt(req.query.page) * 10);
    search={};
    search['$and']=[];

    search['$and'].push(['Name like ?', "%" + req.query.state + "%"]);

    if (req.query.state != undefined) {
        State.findAll({
            // where: { Name: req.query.state },
            where:search,
            include: [{
                model: Country
            }],
            offset: offset,
            limit: 20,
            order: 'Name ASC'
        }).then(function(response) {
            res.json(response);
        }).catch(function(error) {
            res.json(error);
        })
    } else {
        State.findAll({
            include: [{
                model: Country
            }],
            offset: offset,
            limit: 20,
            order: 'Name ASC'
        }).then(function(response) {
            res.json(response);
        }).catch(function(error) {
            res.json(error);
        })
    }
})

module.exports = router
