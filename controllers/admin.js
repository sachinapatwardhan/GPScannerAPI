(function() {
    'use strict';

    var express = require('express');
    var router = express.Router();
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();
    var Bluebird = require('bluebird');
    var moment = require('moment');
    var _ = require('lodash');
    var formidable = require('formidable');
    var nodeExcel = require('excel-export');
    var XLSX = require('xlsx');

    //////////

    var Sequelize = require('sequelize');
    var sequelize = require('../models1').sequelize;
    var User = models.tbluserinformation;
    var Role = models.tblrole;
    var UserRole = models.tbluserinrole;
    var GpsDevice = models.tblgpsdevice;
    var Telco = models.tbltelco;
    var Sim = models.tblsimdetails;
    var DeviceAgentRetailer = models.tbldeviceagentretailer;
    var AppInfo = models.tblappinfo;
    //////////

    router.get('/getAutocompleteSalesAgent', function(req, res) {
        User.hasMany(UserRole, {
            foreignKey: {
                name: 'userId',
                allowNull: false
            }
        });
        UserRole.belongsTo(Role, {
            foreignKey: {
                name: 'roleId',
                allowNull: false
            }
        });

        User.findAll({
                where: {
                    username: {
                        $like: '%' + req.query.username + '%'
                    }
                },
                include: [{
                    model: UserRole,
                    attributes: [],
                    include: [{
                        model: Role,
                        attributes: [],
                        where: {
                            RoleName: 'Sales Agent'
                        }
                    }]
                }],
                limit: 20,
                attributes: ['id', 'username']
            })
            .then(function(rSalesAgents) {
                var reply = {
                    success: true,
                    message: 'Record(s) found.',
                    data: rSalesAgents
                };

                if (!rSalesAgents.length) {
                    reply.message = 'No record(s) found.'
                }

                res.json(reply);
            })
            .catch(function(err) {
                res.json({
                    success: false,
                    message: 'Record(s) not found.'
                });
                console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
            });
    });

    router.get('/getAutocompleteSalesAgentNew', function(req, res) {
        console.log(req.query.idApp)
        User.hasMany(UserRole, {
            foreignKey: {
                name: 'userId',
                allowNull: false
            }
        });
        UserRole.belongsTo(Role, {
            foreignKey: {
                name: 'roleId',
                allowNull: false
            }
        });

        User.findAll({
                where: {
                    idApp: req.query.idApp,
                    username: {
                        $like: '%' + req.query.username + '%'
                    }
                },
                include: [{
                    model: UserRole,
                    attributes: [],
                    include: [{
                        model: Role,
                        attributes: [],
                        where: {
                            RoleName: 'Sales Agent'
                        }
                    }]
                }],
                limit: 20,
                attributes: ['id', 'username']
            })
            .then(function(rSalesAgents) {
                var reply = {
                    success: true,
                    message: 'Record(s) found.',
                    data: rSalesAgents
                };

                if (!rSalesAgents.length) {
                    reply.message = 'No record(s) found.'
                }

                res.json(reply);
            })
            .catch(function(err) {
                res.json({
                    success: false,
                    message: 'Record(s) not found.'
                });
                console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
            });
    });

    // deviceId, toAgentId
    router.post('/transferStock', jsonParser, function(req, res) {
        var err = new Error();
        err.name = 'BugzApiError';

        DeviceAgentRetailer.findOne({
                where: {
                    deviceId: req.body.deviceId
                }
            })
            .then(function(rDeviceAgentRetailer) {
                if (!rDeviceAgentRetailer) {
                    err.message = 'Unable to transfer device. Device ID not found.';
                    throw err;
                }
                if (rDeviceAgentRetailer.retailerId) {
                    err.message = 'Unable to transfer device. This device has already been sold.';
                    throw err;
                }

                return rDeviceAgentRetailer.update({
                    agentId: req.body.toAgentId
                });
            })
            .then(function(rDeviceAgentRetailer) {
                res.json({
                    success: true,
                    message: 'Device transferred.',
                    data: rDeviceAgentRetailer
                });
            })
            .catch(function(err) {
                if (err.name === 'BugzApiError') {
                    res.json({
                        success: false,
                        message: err.message
                    });
                } else {
                    res.json({
                        success: false,
                        message: 'Unable to transfer device. Please try again later.'
                    });
                    console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
                }
            });
    });
    router.get('/getAllGpsDevicesNew', function(req, res) {
        console.log(req.query)
        var orderBy = [];
        orderBy.push([
            req.query.columns[req.query.order[0].column].data + ' ' + req.query.order[0].dir
        ]);

        var search = '';
        if (req.query.search.value != null && req.query.search.value != '' && req.query.search.value != undefined) {
            search = ' Where (tgd.DeviceId like "%' + req.query.search.value + '%" or ';
            search = search + 'tgd.AppName like "%' + req.query.search.value + '%" or ';
            search = search + 'tgd.CreatedBy like "%' + req.query.search.value + '%" or ';
            search = search + 'tgd.Type like "%' + req.query.search.value + '%" or ';
            search = search + 'tgd.IMEI like "%' + req.query.search.value + '%" or ';
            search = search + 'tgd.Version like "%' + req.query.search.value + '%" or ';
            search = search + 'ts.SerialNum like "%' + req.query.search.value + '%" or ';
            search = search + 'ts.PhoneNum like "%' + req.query.search.value + '%" or ';
            search = search + 'tel.Name like "%' + req.query.search.value + '%") ';
        }
        if (search != '') {
            search = search + " and tgd.AppName='" + req.query.AppName + "'";
        } else {
            search = search + " Where tgd.AppName='" + req.query.AppName + "'";
        }

        if (req.query.agentId != null && req.query.agentId != '' && req.query.agentId != undefined) {
            if (search != '') {
                search = search + ' and tgd.DeviceId not in (select deviceId from tbldeviceagentretailer where retailerId is not null)';
            } else {
                search = search + ' where tgd.DeviceId not in (select deviceId from tbldeviceagentretailer where retailerId is not null)';
            }
            // search = search + '  tgd.DeviceId not in (select deviceId from tbldeviceagentretailer)'
        }

        var query = 'select tgd.DeviceId,tgd.Type,tgd.IMEI,tgd.Version,tgd.CreatedDate,tgd.CreatedBy,tgd.AppName,tgd.ExpiryDate,ts.SerialNum,ts.PhoneNum,tel.Name,tdr.id,tdr.agentId' +
            ' from tblgpsdevice tgd LEFT JOIN tblsimdetails ts on tgd.idSim = ts.id' +
            ' LEFT JOIN tbltelco tel on ts.idTelCo = tel.id' +
            ' LEFT JOIN tbldeviceagentretailer tdr on tdr.deviceId = tgd.DeviceId' + search +
            ' order by ' + orderBy + ' limit ' + parseInt(req.query.length) + ' offset ' + parseInt(req.query.start);
        // console.log(query)
        var Countqry = ' select count(tgd.id)  as TotalRecord ' +
            ' from tblgpsdevice tgd LEFT JOIN tblsimdetails ts on tgd.idSim = ts.id' +
            ' LEFT JOIN tbltelco tel on ts.idTelCo = tel.id' +
            ' LEFT JOIN tbldeviceagentretailer tdr on tdr.deviceId = tgd.DeviceId' + search;

        connection.query(query, function(err, response) {
            console.log(err)
            if (response != undefined) {
                connection.query(Countqry, function(err, lstCount, fields) {
                    var response1 = new Object();
                    response1.draw = req.query.draw;
                    response1.recordsTotal = lstCount[0].TotalRecord;
                    response1.recordsFiltered = lstCount[0].TotalRecord;

                    for (var i = 0; i < response.length; i++) {
                        response[i].IsActive = false;
                        if (response[i].id != null && response[i].id != undefined && response[i].id != '') {
                            response[i].IsActive = true;
                        }
                    }

                    response1.data = u.sortBy(response, function(num) { return num.IsActive }).reverse();;
                    res.json(response1);
                });
            } else {
                var response1 = new Object();
                response1.draw = req.query.draw;
                response1.recordsTotal = 0;
                response1.recordsFiltered = 0;
                response1.data = [];
                res.json(response1);
            }
        })
    })
    router.get('/getAllGpsDevices', function(req, res) {
        var orderBy = [];
        orderBy.push([
            req.query.columns[req.query.order[0].column].data, req.query.order[0].dir
        ]);

        var darModel = {
            model: DeviceAgentRetailer,
            required: false
        };
        if (req.query.agentId) {
            darModel.where = {
                agentId: +req.query.agentId
            };
            darModel.required = true;
        }

        Sim.belongsTo(Telco, {
            foreignKey: {
                name: 'idTelCo',
                allowNull: true
            }
        });

        GpsDevice.belongsTo(Sim, {
            foreignKey: {
                name: 'idSim',
                allowNull: true
            }
        });

        GpsDevice.belongsTo(DeviceAgentRetailer, {
            foreignKey: {
                name: 'DeviceId',
                allowNull: true
            },
            targetKey: 'deviceId'
        });

        GpsDevice.findAndCountAll({
                where: {
                    $or: {
                        DeviceId: { $like: '%' + req.query.search.value + '%' },
                        Type: { $like: '%' + req.query.search.value + '%' },
                        IMEI: { $like: '%' + req.query.search.value + '%' },
                        Version: { $like: '%' + req.query.search.value + '%' },
                        CreatedBy: { $like: '%' + req.query.search.value + '%' },
                        AppName: { $like: '%' + req.query.search.value + '%' }
                    }
                },
                include: [{
                    model: Sim,
                    where: {
                        $or: {
                            SerialNum: { $like: '%' + req.query.search.value + '%' },
                            PhoneNum: { $like: '%' + req.query.search.value + '%' }
                        }
                    },
                    required: false,
                    include: [{
                        model: Telco,
                        where: {
                            $or: {
                                Name: { $like: '%' + req.query.search.value + '%' }
                            }
                        },
                        required: false
                    }]
                }, darModel],
                order: orderBy,
                limit: +req.query.length,
                offset: +req.query.start
            })
            .then(function(result) {
                var reply = {
                    success: true,
                    message: 'Device(s) found.',
                    draw: req.query.draw,
                    recordsFiltered: result.count,
                    recordsTotal: result.count,
                    data: result.rows
                };
                if (!result.rows.length) {
                    reply.message = 'No device(s) found.';
                }
                res.json(reply);
            })
            .catch(function(err) {
                res.json({
                    success: false,
                    message: 'Device(s) not found.'
                });
                console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
                console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
            });
    });


    // deviceId, userId, assign, appName
    router.post('/assignDevice', jsonParser, function(req, res) {
        var err = new Error();
        err.name = 'BugzApiError';
        console.log(req.body)

        if (req.body.assign) {
            DeviceAgentRetailer.findOne({
                    where: {
                        deviceId: req.body.deviceId
                    }
                })
                .then(function(rDeviceAgentRetailer) {
                    if (rDeviceAgentRetailer) {
                        err.message = 'Device is already assigned.';
                        throw err;
                    }

                    return GpsDevice.findOne({
                        where: {
                            DeviceId: req.body.deviceId,
                            AppName: req.body.appName
                        }
                    });
                })
                .then(function(rGpsDevice) {
                    console.log(rGpsDevice)
                    if (!rGpsDevice) {
                        err.message = 'GPS device not found.';
                        throw err;
                    }

                    return User.findOne({
                            where: {
                                id: req.body.userId
                            }
                        })
                        .then(function(rUser) {
                            if (!rUser) {
                                err.message = 'User not found.';
                                throw err;
                            }

                            return [rGpsDevice, rUser];
                        });
                })
                .spread(function(rGpsDevice, rUser) {
                    return DeviceAgentRetailer.create({
                        agentId: rUser.id,
                        deviceId: rGpsDevice.DeviceId,
                        createdDatetime: new Date()
                    });
                })
                .then(function(rDeviceAgentRetailer) {
                    res.json({
                        success: true,
                        message: 'Assigned device to agent.',
                        data: rDeviceAgentRetailer
                    });
                })
                .catch(function(err) {
                    if (err.name === 'BugzApiError') {
                        res.json({
                            success: false,
                            message: err.message
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'Unable to assign device. Please try again later.'
                        });
                        console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
                    }
                });
        } else {
            DeviceAgentRetailer.findOne({
                    where: {
                        agentId: req.body.userId,
                        deviceId: req.body.deviceId
                    }
                })
                .then(function(rDeviceAgentRetailer) {
                    if (!rDeviceAgentRetailer) {
                        err.message = 'Unable to unassign device. Device not assigned.';
                        throw err;
                    }

                    if (rDeviceAgentRetailer.retailerId) {
                        err.message = 'Unable to unassign device. Device has already been activated.';
                        throw err;
                    }

                    return rDeviceAgentRetailer.destroy();
                })
                .then(function() {
                    res.json({
                        success: true,
                        message: 'Device unassigned.'
                    });
                })
                .catch(function(err) {
                    if (err.name === 'BugzApiError') {
                        res.json({
                            success: false,
                            message: err.message
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'Unable to unassign device. Please try again later.'
                        });
                        console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
                    }
                });
        }
    });

    router.post('/assignDeviceByExcelNew', function(req, res) {
        var form = new formidable.IncomingForm();
        var appName;
        var createdBy;
        var fileName;

        form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

        form.parse(req, function(err, fields, files) {
            appName = fields.appName;
            createdBy = fields.createdBy;
        });

        form.on('fileBegin', function(name, file) {
            file.path = form.uploadDir + '/' + file.name;
            fileName = file.path.toString();
        });

        form.on('end', function() {
            var err = new Error();
            err.name = 'BugzApiError';

            var workbook = XLSX.readFile(fileName, { type: 'binary' });
            var sheet1 = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[sheet1];

            // Excel file in protected mode
            if (!worksheet) {
                res.json({
                    success: false,
                    message: 'Unable to import. Excel file is in protected mode.'
                });
                return;
            }

            // Excel file does not follow template format
            var IMEI = worksheet.A1.v;
            var assignToUsername = worksheet.B1.v;
            if (IMEI !== 'IMEI' || assignToUsername !== 'Assign To Username') {
                res.json({
                    success: false,
                    message: 'Unable to import. Excel file does not follow template format.'
                });
                return;
            }

            // Excel file does not contain data
            var rows = XLSX.utils.sheet_to_json(worksheet);
            if (!rows.length) {
                res.json({
                    success: false,
                    message: 'Unable to import. Excel file does not contain any data.'
                });
                return;
            }

            // Array to store which assign failed
            var whichFailed = [];

            function assignDevice(o) {
                return DeviceAgentRetailer.findOne({
                        where: {
                            deviceId: o.deviceId
                        }
                    })
                    .then(function(rDeviceAgentRetailer) {
                        if (rDeviceAgentRetailer) {
                            err.message = 'Device is already assigned.';
                            throw err;
                        }
                        return GpsDevice.findOne({
                            where: {
                                DeviceId: o.deviceId,
                                AppName: appName
                            }
                        });
                    })
                    .then(function(rGpsDevice) {
                        if (!rGpsDevice) {
                            err.message = 'GPS device not found.';
                            throw err;
                        }

                        User.belongsTo(AppInfo, {
                            foreignKey: {
                                name: 'idApp',
                                allowNull: true
                            }
                        });
                        User.hasMany(UserRole, {
                            foreignKey: {
                                name: 'userId',
                                allowNull: false
                            }
                        });
                        UserRole.belongsTo(Role, {
                            foreignKey: {
                                name: 'roleId',
                                allowNull: false
                            }
                        });


                        return User.findOne({
                                where: { username: o.username },
                                include: [{
                                    model: AppInfo,
                                    where: { AppName: { $eq: appName } },
                                }, {
                                    model: UserRole,
                                    include: [{
                                        model: Role,
                                        where: {
                                            RoleName: 'Sales Agent'
                                        }
                                    }]
                                }]
                            })
                            .then(function(rUser) {
                                if (!rUser) {
                                    err.message = 'User not found.';
                                    throw err;
                                }

                                return [rGpsDevice, rUser];
                            });
                    })
                    .spread(function(rGpsDevice, rUser) {
                        return DeviceAgentRetailer.create({
                            agentId: rUser.id,
                            deviceId: rGpsDevice.DeviceId,
                            createdDatetime: new Date()
                        });
                    })
                    .catch(function(err) {
                        if (err.name === 'BugzApiError') {
                            whichFailed.push({
                                deviceId: o.deviceId,
                                agentUsername: o.username,
                                message: err.message
                            });
                        } else {
                            console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
                        }
                    });
            }

            // Array of promises
            var promises = [];
            for (var i = 0; i < rows.length; ++i) {
                var r = rows[i];
                var o = {};

                o.deviceId = r['IMEI'].trim().substring(1);
                o.username = r['Assign To Username'].trim();

                promises.push(assignDevice(o));
            }

            Bluebird.all(promises)
                .then(function() {
                    var reply = {
                        success: true,
                        message: 'Device(s) assigned.'
                    };

                    if (whichFailed.length) {
                        reply.message = 'Device(s) assigned but some failed.';
                    }
                    if (whichFailed.length === rows.length) {
                        reply.success = false;
                        reply.message = 'Failed to assign any devices.';
                    }

                    res.json(reply);
                })
                .catch(function(err) {
                    res.json({
                        success: false,
                        message: 'Unable to assign device(s). Please try again later.'
                    });
                    console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
                });
        });
    });

    router.post('/assignDeviceByExcel', function(req, res) {
        var form = new formidable.IncomingForm();
        var appName;
        var createdBy;
        var fileName;

        form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

        form.parse(req, function(err, fields, files) {
            appName = fields.appName;
            createdBy = fields.createdBy;
        });

        form.on('fileBegin', function(name, file) {
            file.path = form.uploadDir + '/' + file.name;
            fileName = file.path.toString();
        });

        form.on('end', function() {
            var err = new Error();
            err.name = 'BugzApiError';

            var workbook = XLSX.readFile(fileName, { type: 'binary' });
            var sheet1 = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[sheet1];

            // Excel file in protected mode
            if (!worksheet) {
                res.json({
                    success: false,
                    message: 'Unable to import. Excel file is in protected mode.'
                });
                return;
            }

            // Excel file does not follow template format
            var IMEI = worksheet.A1.v;
            var assignToUsername = worksheet.B1.v;
            if (IMEI !== 'IMEI' || assignToUsername !== 'Assign To Username') {
                res.json({
                    success: false,
                    message: 'Unable to import. Excel file does not follow template format.'
                });
                return;
            }

            // Excel file does not contain data
            var rows = XLSX.utils.sheet_to_json(worksheet);
            if (!rows.length) {
                res.json({
                    success: false,
                    message: 'Unable to import. Excel file does not contain any data.'
                });
                return;
            }

            // Array to store which assign failed
            var whichFailed = [];

            function assignDevice(o) {
                return DeviceAgentRetailer.findOne({
                        where: {
                            deviceId: o.deviceId
                        }
                    })
                    .then(function(rDeviceAgentRetailer) {
                        if (rDeviceAgentRetailer) {
                            err.message = 'Device is already assigned.';
                            throw err;
                        }
                        return GpsDevice.findOne({
                            where: {
                                DeviceId: o.deviceId,
                                AppName: appName
                            }
                        });
                    })
                    .then(function(rGpsDevice) {
                        if (!rGpsDevice) {
                            err.message = 'GPS device not found.';
                            throw err;
                        }

                        return User.findOne({
                                where: {
                                    username: o.username
                                }
                            })
                            .then(function(rUser) {
                                if (!rUser) {
                                    err.message = 'User not found.';
                                    throw err;
                                }

                                return [rGpsDevice, rUser];
                            });
                    })
                    .spread(function(rGpsDevice, rUser) {
                        return DeviceAgentRetailer.create({
                            agentId: rUser.id,
                            deviceId: rGpsDevice.DeviceId,
                            createdDatetime: new Date()
                        });
                    })
                    .catch(function(err) {
                        if (err.name === 'BugzApiError') {
                            whichFailed.push({
                                deviceId: o.deviceId,
                                agentUsername: o.username,
                                message: err.message
                            });
                        } else {
                            console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
                        }
                    });
            }

            // Array of promises
            var promises = [];
            for (var i = 0; i < rows.length; ++i) {
                var r = rows[i];
                var o = {};

                o.deviceId = r['IMEI'].trim().substring(1);
                o.username = r['Assign To Username'].trim();

                promises.push(assignDevice(o));
            }

            Bluebird.all(promises)
                .then(function() {
                    var reply = {
                        success: true,
                        message: 'Device(s) assigned.'
                    };

                    if (whichFailed.length) {
                        reply.message = 'Device(s) assigned but some failed.';
                    }
                    if (whichFailed.length === rows.length) {
                        reply.success = false;
                        reply.message = 'Failed to assign any devices.';
                    }

                    res.json(reply);
                })
                .catch(function(err) {
                    res.json({
                        success: false,
                        message: 'Unable to assign device(s). Please try again later.'
                    });
                    console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
                });
        });
    });

    router.get('/downloadAssignDeviceExcelTemplate', function(req, res) {
        var conf = {};
        conf.name = 'Sheet1';
        // Create two columns
        conf.cols = [{
            caption: 'IMEI',
            type: 'string'
        }, {
            caption: 'Assign To Username',
            type: 'string'
        }];
        conf.rows = [];

        // Create a row
        var row = [];
        // Set all columns in row to empty string
        for (var i = 0; i < conf.cols.length; ++i) {
            row.push('');
        }
        // Add row to file
        conf.rows.push(row);

        var result = nodeExcel.execute(conf);
        res.set('Content-Type', 'application/vnd.openxmlformats');
        res.set('Content-Disposition', 'attachment; filename=AssignDeviceTemplate.xlsx');
        res.end(result, 'binary');
    });

    //////////

    module.exports = router;
})();