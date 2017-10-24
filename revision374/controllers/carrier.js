//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Carrier = models.tblcarrier;
var Country = models.tblcountrymgmt;
var PetDevice = models.tblgpsdevice;
//End of Tables

router.get('/GetAllCarrier', function(req, res) {
    Carrier.belongsTo(Country, {
        foreignKey: {
            name: 'idCountry',
            allowNull: false
        }
    });

    Carrier.findAll({
        include: [{
            model: Country,
        }],
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetCarrierById', function(req, res) {
    Carrier.findOne({ where: { id: req.query.idCarrier } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveCarrier', jsonParser, function(req, res) {
    objCarrier = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objCarrier.id == 0) {
                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            Carrier.findOrCreate({ where: { Name: objCarrier.Name }, defaults: objCarrier }).then(function(response) {
                                if ((response[1])) {
                                    res.json({ success: true, message: "Carrier created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Carrier is already Exist...", data: response });
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
                            Carrier.findOne({ where: { Name: objCarrier.Name }, defaults: objCarrier }).then(function(objCarrierExist) {
                                if (objCarrierExist != null && objCarrier.id != objCarrierExist.id) {
                                    res.json({ success: false, message: "Carrier is already Exist...", data: objCarrierExist });
                                } else {
                                    Carrier.update(objCarrier, { where: { id: objCarrier.id } }).then(function(response) {
                                        if (response[0]) {
                                            PetDevice.findAll({ where: { CarrierId: objCarrier.id } }).then(function(lstPetDevice) {
                                                function UpdatePetDevice(i) {
                                                    if (i < lstPetDevice.length) {
                                                        var objPetDevice = lstPetDevice[i];
                                                        objPetDevice.updateAttributes({ CountryId: objCarrier.idCountry }).then(function(resUpdate) {
                                                            UpdatePetDevice(i + 1);
                                                        });
                                                    } else {
                                                        res.json({ success: true, message: "Carrier updated successfully...", data: response });
                                                    }
                                                }
                                                UpdatePetDevice(0)
                                            });
                                        } else {
                                            res.json({ success: false, message: "Carrier not updated...", data: response });
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

router.get('/DeleteCarrier', function(req, res) {
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
                        Carrier.destroy({ where: { id: req.query.idCarrier } }).then(function(response) {
                            if (response) {
                                res.json({ success: true, message: "Carrier deleted successfully...", data: response });
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