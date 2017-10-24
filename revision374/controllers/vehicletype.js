//Tables
var router = express.Router();
var VehicleType = models.tblvehicletype;
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;

router.get('/GetAllActivevehicletype', function(req, res) {
    VehicleType.findAll({ where: { IsActive: 1 } }).then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json({ success: false, data: err });
    })
})

router.get('/Getvehicletype', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];

        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                if (columnName != 'CreatedDate') {
                    search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                }
            };
        };
    }
    VehicleType.findAndCountAll({
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
            res.json(error);
        })
        // VehicleType.findAll().then(function(response) {
        //     res.json(response);
        // }).catch(function(err) {
        //     res.json({ success: false, data: err });
        // })
})

router.post('/SaveVehicleType', jsonParser, function(req, res) {
    console.log(req.body);
    var objVehicleType = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objVehicleType.id == 0) {

                    //set Parameter
                    objVehicleType.CreatedDate = new Date();
                    objVehicleType.CreatedBy = decoded.username;
                    VehicleType.findOrCreate({ where: { Type: objVehicleType.Type }, defaults: objVehicleType }).then(function(response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('Create Vehicle Type', UserExist.username, 'Save Vehicle Type');
                            res.json({ success: true, message: "Vehicle Type created successfully...", data: response });
                        } else {
                            res.json({ success: false, message: "Vehicle Type is already Exist...", data: response });
                        }
                    })

                } else {
                    //set Parameter
                    VehicleType.findOne({ where: { Type: objVehicleType.Type }, defaults: objVehicleType }).then(function(objVehicleTypeExist) {
                        if (objVehicleTypeExist != null && objVehicleType.id != objVehicleTypeExist.id) {
                            res.json({ success: false, message: "Vehicle Type is already Exist...", data: objVehicleTypeExist });
                        } else {
                            VehicleType.update(objVehicleType, { where: { id: objVehicleType.id } }).then(function(response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('Update Vehicle Type ', UserExist.username, 'Update Vehicle Type');
                                    res.json({ success: true, message: "Vehicle Type updated successfully...", data: response });
                                }
                            })
                        }
                    })

                }
            } else {
                res.json({
                    success: false,
                    InvalidToken: true,
                    data: InvalidToken,
                });
            }
        })
    } else {
        res.json({
            success: false,
            InvalidToken: true,
            data: InvalidToken,
        });
    }
})



router.get('/DeleteVehicleTypeById', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                Vehicle.findOne({ where: { idType: req.query.id } }).then(function(VehicleExist) {
                    if (VehicleExist != null) {
                        res.json({ success: true, message: "This Type of Vehicel Exist..So, You can not delete this Vehicle Type" });
                    } else {
                        VehicleType.destroy({
                            where: { id: req.query.id }
                        }).then(function(response) {
                            if (response != null) {
                                funAuditLog.CreateAuditLog('Delete Vehicle Type', UserExist.username, 'Delete Vehicle Type');
                                res.json({ success: true, message: "Vehicle Type deleted successfully...", data: response });
                            } else {
                                res.json({ success: true, message: "Vehicle Type not deleted successfully...", data: response });
                            }
                        })
                    }
                })

            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})


router.get('/UpdateIsActiveStatus', function(req, res) {
    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                VehicleType.findOne({ where: { id: req.query.id } }).then(function(objVehicleTypeExist) {
                    if (objVehicleTypeExist != null) {
                        objVehicleTypeExist.updateAttributes({
                            IsActive: req.query.IsActive
                        }).then(function(response) {
                            if (response != null) {
                                funAuditLog.CreateAuditLog('Update Vehicle Type Status', UserExist.username, 'Update Vehicle Type Status');
                                res.json({ success: true, message: "Vehicle Type status updated successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "Vehicle Type status not updated successfully...", data: response });
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Vehicle Type is not Exist...", data: response });
                    }

                })

            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

module.exports = router