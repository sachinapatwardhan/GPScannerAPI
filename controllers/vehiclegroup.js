//Tables
var router = express.Router();
var VehicleGroup = models.tblvehiclegroup;
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var App = models.tblappinfo;


router.get('/GetvehicleGroupWise', function(req, res) {
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
                if (columnName != 'CreatedDate' && columnName != 'id') {
                    if (columnName == 'tblvehiclegroup.tbluserinformation.username') {
                        search['$or'].push(['username like ?', "%" + objSearch + "%"]);
                    } else if (columnName == 'tblvehiclegroup.GroupName') {
                        search['$or'].push(['GroupName like ?', "%" + objSearch + "%"]);
                    } else if (columnName == 'tblvehiclegroup.tbluserinformation.tblappinfo.AppName') {
                        search['$or'].push(['AppName like ?', "%" + objSearch + "%"]);
                    } else {
                        search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                    }
                }

            };
        };
    }

    search['$and'] = [];
    search['$and'].push(['IdGroup IS NOT NULL']);

    //join tbl
    Vehicle.belongsTo(VehicleGroup, {
        foreignKey: {
            name: 'IdGroup',
            allowNull: false
        }
    });
    VehicleGroup.belongsTo(User, {
        foreignKey: {
            name: 'IdUser',
            allowNull: false
        }
    });
    User.belongsTo(App, {
        foreignKey: {
            name: 'idApp',
            allowNull: false
        }
    });

    Vehicle.findAndCountAll({
        where: search,
        attributes: ['id', 'Name'],
        order: Orderby,
        include: [{
            model: VehicleGroup,
            include: [{
                model: User,
                attributes: ['username', 'idApp'],
                include: [{
                    model: App,
                    attributes: ['AppName'],
                    required: true,
                }],
                required: true,
            }],
            required: true,
        }],
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
});

router.get('/GetAllGroupUserWise', function(req, res) {
    VehicleGroup.findAll({
        where: {
            IdUser: req.query.IdUser
        }
    }).then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json([]);
    })
});

router.get('/GetAllVehicleUserWise', function(req, res) {
    Vehicle.findAll({
        where: {
            IdUser: req.query.IdUser,
            IdGroup: null,
        }
    }).then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json([]);
    })
});


router.post('/SaveVehicleGroup', jsonParser, function(req, res) {
    var objVehicleGroup = req.body;
    objHeader = req.headers;
    //Set Parameter for User Permission
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                Vehicle.findOne({
                    where: {
                        id: objVehicleGroup.idVehicle
                    }
                }).then(function(resvehicle) {
                    resvehicle.updateAttributes({
                        IdGroup: objVehicleGroup.IdGroup
                    }).then(function(resUpdate) {
                        funAuditLog.CreateAuditLog('Create Vehicle Group', UserExist.username, 'Save Vehicle Group');
                        res.json({ success: true, message: "Vehicle Group created successfully...", data: resUpdate });
                    })
                })
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


router.get('/DeleteVehicleGroup', function(req, res) {
    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                Vehicle.findOne({ where: { id: req.query.id } }).then(function(objVehicleGroupExist) {
                    if (objVehicleGroupExist != null) {
                        objVehicleGroupExist.updateAttributes({
                            IdGroup: null
                        }).then(function(response) {
                            if (response != null) {
                                funAuditLog.CreateAuditLog('Delete Vehicel Group', UserExist.username, 'Delete Vehicel Group');
                                res.json({ success: true, message: "Vehicle Group  Delete successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "Vehicle Group  not Delete successfully...", data: response });
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Vehicle Group is not Exist...", data: [] });
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