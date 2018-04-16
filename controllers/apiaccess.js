var router = express.Router();
var sequelize = models.sequelize;
var User = models.tbluserinformation;
var AccessClient = models.tblapiaccessclient;
var AppInfo = models.tblappinfo;
var GPSDevice = models.tblgpsdevice;


router.get('/GetAllAccessClient', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];
        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                var obj = new Object();
                if (columnName != 'CreatedDate') {
                    columnName = columnName == 'Key' ? '`Key`' : columnName;
                    search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                }

            };
        };
    }
    AccessClient.findAndCountAll({
        where: search,
        order: [
            [objColumns[parseInt(objOrderBy[0].column)].data, objOrderBy[0].dir]
        ],
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
    }).then(function (response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function (err) {
        res.json(err);
    })
})


router.post('/SaveAccessClient', jsonParser, function (req, res) {
    objClient = req.body;
    objHeader = req.headers;
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                $or: [{ email: decoded.email }, { username: decoded.username }],
                password: decoded.password,
            }
        }).then(function (UserExist) {
            if (UserExist != null) {
                if (objClient.id == 0) {
                    req.query['permission'] = "Added";
                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;
                    objClient.CreatedDate = new Date();
                    objClient.CreatedBy = decoded.username;
                    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            GetRandomToken(function (Token) {
                                objClient.Token = Token;
                                GetRandomKey(function (Key) {
                                    objClient.Key = Key
                                    sequelize.transaction(function (t) {
                                        return AccessClient.findOne({
                                            where: {
                                                $or: {
                                                    Token: objClient.Token,
                                                    Key: objClient.Key,
                                                }
                                            }
                                        }).then(function (result) {
                                            if (result) {
                                                throw new Error('Client is already Exist.');
                                            } else {
                                                return AccessClient.create(objClient);
                                            }
                                        })
                                    }).then(function (result) {
                                        if (result != null) {
                                            res.json({
                                                success: true,
                                                message: 'Client created successfully.',
                                                data: result
                                            });
                                        }
                                    }).catch(function (err) {
                                        res.json({
                                            success: false,
                                            message: err.message
                                        });
                                    });
                                })
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
                    objClient.ModifiedDate = new Date();
                    objClient.ModifiedBy = decoded.username;
                    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            sequelize.transaction(function (t) {
                                return AccessClient.findOne({
                                    where: {
                                        $or: {
                                            Token: objClient.Token,
                                            Key: objClient.Key,
                                        }
                                    }
                                }).then(function (result) {
                                    if (result != null && objClient.id != result.id) {
                                        throw new Error('Client is already Exist.');
                                    } else {
                                        return AccessClient.update(objClient, { where: { id: objClient.id } })
                                    }
                                })
                            }).then(function (result) {
                                res.json({
                                    success: true,
                                    message: 'Client updated successfully.',
                                    data: result
                                });
                            }).catch(function (err) {
                                res.json({
                                    success: false,
                                    message: err.message
                                });
                            });
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

router.get('/UpdateIsActiveStatus', function (req, res) {
    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                AccessClient.findOne({ where: { id: req.query.id } }).then(function (AccessClientExist) {
                    if (AccessClientExist != null) {
                        AccessClientExist.updateAttributes({
                            IsActive: req.query.IsActive
                        }).then(function (response) {
                            if (response != null) {
                                funAuditLog.CreateAuditLog('Update API Access Status', UserExist.username, 'Update Vehicle Type Status API Access ID:(' + AccessClientExist.id + ') / Token : (' + AccessClientExist.Token + ')');
                                res.json({ success: true, message: "API Access status updated successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "API Access status not updated successfully...", data: response });
                            }
                        })
                    } else {
                        res.json({ success: false, message: "API Access is not Exist...", data: response });
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

router.get('/DelAccessClient', function (req, res) {
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    req.query['permission'] = "Deleted";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {

            var token = getToken(objHeader);
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({
                    where: {
                        username: decoded.username,
                        password: decoded.password
                    }
                }).then(function (UserExist) {
                    if (UserExist != null) {
                        sequelize.transaction(function (t) {
                            return AccessClient.findOne({
                                where: {
                                    id: req.query.id
                                }
                            }).then(function (result) {
                                if (result != null) {
                                    return result.destroy();
                                } else {
                                    throw new Error("Failed to delete record: No record found.")

                                }
                            })
                        }).then(function () {
                            res.json({
                                success: true,
                                message: 'Client deleted successfully.'
                            });
                        }).catch(function (err) {
                            res.json({
                                success: false,
                                message: err.message
                            });
                        });
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
})

router.get('/getAllDeviceFromAppName', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];
        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                var obj = new Object();
                    columnName = columnName == 'DeviceId' ? 'tblgpsdevice.DeviceId' : columnName;
                    search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
            };
        };
    }
    search['$and'] = [];
    var obj1 = new Object();
    obj1['AppName'] = objParam.AppName;
    search['$and'].push(obj1);

    GPSDevice.belongsTo(AccessClient, {
        foreignKey: 'AppName',
        targetKey: 'AppName',
    });

    GPSDevice.findAndCountAll({
        where: search,
        include: [{
            model: AccessClient,
            required: true,
        }],
        order: [
            [objColumns[parseInt(objOrderBy[0].column)].data, objOrderBy[0].dir]
        ],
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
    }).then(function (response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function (err) {
        res.json(err);
    })
})

router.get('/giveAccess', function (req, res) {
    var objParam = req.query;
    AccessClient.findOne({
        where: {
            id: objParam.id,
        }
    }).then(function (IsDeviceExist) {
        if (IsDeviceExist) {
            var DeviceId = '';
            if (IsDeviceExist.DeviceId != null && IsDeviceExist.DeviceId != '' && IsDeviceExist.DeviceId != undefined) {
                var devicelist = IsDeviceExist.DeviceId.split(',');
                var Exist = u.find(devicelist, function (i) {
                    if (i == objParam.DeviceId) {
                        return i;
                    }
                });
                if (Exist != '' && Exist != null && Exist != undefined) {
                    var obj = u.without(devicelist, objParam.DeviceId);
                    DeviceId = obj.toString();
                }
                else {
                    devicelist.push(objParam.DeviceId);
                    DeviceId = devicelist.toString();
                }
            }
            else {
                DeviceId = objParam.DeviceId
            }
            AccessClient.update({ DeviceId: DeviceId }, { where: { id: objParam.id } }).then(function (response) {
                res.json({
                    success: true,
                    message: "Device added successfully",
                    data: response
                });
            })
        }
        else {
            res.json({
                success: false,
                message: "Device added successfully",
                data: response
            });
        }
    })
})

function GetRandomToken(callback) {
    var length = 10;
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    AccessClient.findAll({
        where: {
            Token: result
        }
    }).then(function (exist) {
        if (exist.length > 0) {
            GetRandomToken();
        }
        else {
            return callback(result);
        }
    })
}

function GetRandomKey(callback) {
    var length = 16;
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    AccessClient.findAll({
        where: {
            Token: result
        }
    }).then(function (exist) {
        if (exist.length > 0) {
            GetRandomKey();
        }
        else {
            return callback(result);
        }
    })
}



module.exports = router;