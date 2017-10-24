//Tables
var router = express.Router();
var User = models.tbluserinformation;
var TaxRate = models.taxrate;
var TaxCategory = models.taxcategory;
var TaxSetting = models.tblsetting;
var Country = models.tblcountrymgmt;
var State = models.tblcountrystatemgmt;
//End of Tables

router.get('/GetAllTaxRate', function(req, res) {
    TaxRate.belongsTo(Country, {
        foreignKey: {
            name: 'CountryId',
            allowNull: false
        }
    });
    TaxRate.belongsTo(State, {
        foreignKey: {
            name: 'StateProvinceId',
            allowNull: false
        }
    });
    TaxRate.belongsTo(TaxCategory, {
        foreignKey: {
            name: 'TaxCategoryId',
            allowNull: false
        }
    });
    TaxRate.findAll({
        include: [{
            model: Country
        }, {
            model: State
        }, {
            model: TaxCategory
        }]
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetTaxRateById', function(req, res) {
    TaxRate.findOne({ where: { Id: req.query.idTaxRate } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.get('/GetDataFromSetting', function(req, res) {
    var lstTaxSetting;
    var lstTaxRate = [];

    function uploader(i) {
        if (i < lstTaxSetting.length) {
            var Name = "TaxCategoryFixedRate." + lstTaxSetting[i].Id;
            TaxSetting.findOne({ where: { Name: Name }, defaults: lstTaxSetting[i] }).then(function(response) {
                if (response != null) {
                    var obj = { id: lstTaxSetting[i].Id, Name: lstTaxSetting[i].Name, Rate: parseInt(response.Value) };
                    lstTaxRate.push(obj)
                } else {
                    var obj = { id: lstTaxSetting[i].Id, Name: lstTaxSetting[i].Name, Rate: 0 };
                    lstTaxRate.push(obj)
                }
                uploader(i + 1);
            })
        }
        if (i == lstTaxSetting.length) {
            res.json({ success: true, data: lstTaxRate });
        }
    }

    TaxCategory.findAll().then(function(response) {
        if (response != null) {
            lstTaxSetting = response
            uploader(0);
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveTaxRate', jsonParser, function(req, res) {
    objTaxRate = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objTaxRate.Id == 0) {
                    TaxRate.findOrCreate({ where: { CountryId: objTaxRate.CountryId, StateProvinceId: objTaxRate.StateProvinceId, Zip: objTaxRate.Zip, TaxCategoryId: objTaxRate.TaxCategoryId }, defaults: objTaxRate }).then(function(response) {
                        if ((response[1])) {
                            res.json({ success: true, message: "Tax Rate created successfully...", data: response });
                        } else {
                            res.json({ success: false, message: "Tax Rate is already Exist...", data: response });
                        }
                    })
                } else {
                    TaxRate.findOne({ where: { CountryId: objTaxRate.CountryId, StateProvinceId: objTaxRate.StateProvinceId, Zip: objTaxRate.Zip, TaxCategoryId: objTaxRate.TaxCategoryId }, defaults: objTaxRate }).then(function(objTaxRateExist) {
                        if (objTaxRateExist != null && objTaxRate.Id != objTaxRateExist.Id) {
                            res.json({ success: false, message: "Tax Rate is already Exist...", data: objTaxRateExist });
                        } else {
                            TaxRate.update(objTaxRate, { where: { Id: objTaxRate.Id } }).then(function(response) {
                                if (response[0]) {
                                    res.json({ success: true, message: "Tax Rate updated successfully...", data: response });
                                }
                            })
                        }
                    })
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/DeleteTaxRate', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                TaxRate.destroy({ where: { Id: req.query.idTaxRate } }).then(function(response) {
                    if (response) {
                        res.json({ success: true, message: "Tax Rate deleted successfully...", data: response });
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
});

module.exports = router