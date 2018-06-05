//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Warehouse = models.warehouse;
var Address = models.address;
//End of Tables

router.get('/GetAllWarehouse', function(req, res) {
    Warehouse.belongsTo(Address, {
        foreignKey: {
            name: 'AddressId',
            allowNull: false
        }
    });
    Warehouse.findAll({
        include: [{
            model: Address
        }]
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetWarehouseById', function(req, res) {
    Warehouse.findOne({ where: { Id: req.query.idWarehouse } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveWarehouse', jsonParser, function(req, res) {
    objWarehouse = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objWarehouse.Id == 0) {
                    Warehouse.findOne({ where: { Name: objWarehouse.Name }, defaults: objWarehouse }).then(function(objWarehouseExist) {
                        if (objWarehouseExist != null) {
                            res.json({ success: false, message: "Warehouse is already Exist...", data: objWarehouseExist });
                        } else {
                            Address.create(objWarehouse).then(function(resAddress) {
                                objWarehouse.AddressId = resAddress.Id;
                                Warehouse.create(objWarehouse).then(function(resWarehouse) {
                                    res.json({ success: true, message: "Warehouse created successfully...", data: resWarehouse });
                                })
                            })
                        }
                    })
                } else {
                    Warehouse.findOne({ where: { Name: objWarehouse.Name }, defaults: objWarehouse }).then(function(objWarehouseExist) {
                        if (objWarehouseExist != null && objWarehouse.Id != objWarehouseExist.Id) {
                            res.json({ success: false, message: "Warehouse is already Exist...", data: objWarehouseExist });
                        } else {
                            var tempWarehouseId = objWarehouse.Id;
                            objWarehouse.Id = objWarehouse.AddressId;
                            Address.findOne({ where: { Id: objWarehouse.AddressId }, defaults: objWarehouse }).then(function(objAddressExist) {
                                if (objAddressExist != null) {
                                    Address.update(objWarehouse, { where: { Id: objWarehouse.AddressId } }).then(function(resAddress) {
                                        if (resAddress[0]) {
                                            objWarehouse.Id = tempWarehouseId;
                                            Warehouse.update(objWarehouse, { where: { Id: objWarehouse.Id } }).then(function(resWarehouse) {
                                                if (resWarehouse[0]) {
                                                    res.json({ success: true, message: "Warehouse updated successfully...", data: resWarehouse });
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    res.json({ success: false, message: "Address not exist...", data: objAddressExist });
                                }
                            });
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


router.get('/DeleteWarehouse', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                Warehouse.destroy({ where: { Id: req.query.idWarehouse } }).then(function(response) {
                    if (response) {
                        res.json({ success: true, message: "Warehouse deleted successfully...", data: response });
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