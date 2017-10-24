//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Country = models.tblcountrymgmt;
var State = models.tblcountrystatemgmt;
var Address = models.address;
var BillingAddress = models.tblbillingaddress;
var DeliveryAddress = models.tbldeliveryaddress;
var Order = models.tblorder;
var Countrycode = models.tblcountrycode;
//End of Tables

router.get('/GetAllCountry', function(req, res) {
    Country.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})


router.get('/GetAllEuropeCountry', function(req, res) {
    Country.findAll({ where: { IsEurope: true } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

//Get Current country
router.get('/GetCurrentCountry', function(req, res) {
    request.get({
        url: 'http://freegeoip.net/json/' + req.connection.remoteAddress,
    }, function(error, response, body) {
        console.log(body)
        if (body.indexOf("Error") >= 0) {
            res.json(null);
        } else {
            var data = eval('(' + body + ')');
            var objCurrentCountry = data
            res.json(objCurrentCountry);
        }
    })
});


router.get('/GetAllCountryByPagging', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search.value;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;

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
    Country.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
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


router.get('/GetCountryById', function(req, res) {
    Country.findOne({ where: { id: req.query.idCountry } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Country found...", data: response });
        } else {
            res.json({ success: false, message: "Country not found...", data: response });
        }
    })
})

router.post('/SaveCountry', jsonParser, function(req, res) {
    objCountry = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objCountry.id == 0) {

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            Country.findOrCreate({ where: { Country: objCountry.Country }, defaults: objCountry }).then(function(response) {
                                if ((response[1])) {
                                    funAuditLog.CreateAuditLog('SaveCountry', UserExist.username, 'Create Country');
                                    res.json({ success: true, message: "Country created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Country is already Exist...", data: response });
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

                            Country.findOne({ where: { Country: objCountry.Country }, defaults: objCountry }).then(function(objCountryExist) {
                                if (objCountryExist != null && objCountry.id != objCountryExist.id) {
                                    res.json({ success: false, message: "Country is already Exist...", data: objCountryExist });
                                } else {
                                    Country.update(objCountry, { where: { id: objCountry.id } }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveCountry', UserExist.username, 'Update Country');
                                            res.json({ success: true, message: "Country updated successfully...", data: response });
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

router.get('/DeleteCountry', function(req, res) {
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
                        State.findOne({ where: { idCountry: req.query.CountryId } }).then(function(resState) {
                            Address.findOne({ where: { CountryId: req.query.CountryId } }).then(function(resAddress) {
                                BillingAddress.findOne({ where: { idCountry: req.query.CountryId } }).then(function(resBillingAddress) {
                                    DeliveryAddress.findOne({ where: { idCountry: req.query.CountryId } }).then(function(resDeliveryAddress) {
                                        Order.findOne({ where: { ShippidCountry: req.query.CountryId } }).then(function(resOrder) {
                                            if (resState == null && resAddress == null && resBillingAddress == null && resDeliveryAddress == null && resOrder == null) {
                                                Country.destroy({ where: { id: req.query.idCountry } }).then(function(response) {
                                                    if (response) {
                                                        funAuditLog.CreateAuditLog('DeleteCountry', UserExist.username, 'Delete Country');
                                                        res.json({ success: true, message: "Country deleted successfully...", data: response });
                                                    } else {
                                                        res.json({ success: false, message: "Requested Country not Exist...", data: response });
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

router.get('/GetCountryCode', function(req, res) {
    Countrycode.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

module.exports = router