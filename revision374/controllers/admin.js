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

	// deviceId, fromAgentId, toAgentId
	router.post('/transferStock', jsonParser, function(req, res) {
		DeviceAgentRetailer.findOne({
			where: {
				deviceId: req.body.deviceId,
				agentId: req.body.fromAgentId,
				retailerId: null
			}
		})
		.then(function(rDeviceAgentRetailer) {
			if (!rDeviceAgentRetailer) {
				var err = new Error('Either this device ID not found or this device already activated by customer.');
				err.name = 'BugzApiError';
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
			darModel.agentId = +req.query.agentId;
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
			console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
		});
	});

	
	// deviceId, userId
	router.post('/assignDevice', jsonParser, function(req, res) {
		if (req.body.assign) {
			DeviceAgentRetailer.findOne({
				where: {
					deviceId: req.body.deviceId
				}
			})
			.then(function(rDeviceAgentRetailer) {
				if (rDeviceAgentRetailer) {
					var err = new Error('Device is already assigned.');
					err.name = 'BugzApiError';
					throw err;
				}

				return GpsDevice.findOne({
					where: {
						DeviceId: req.body.deviceId
					}
				});
			})
			.then(function(rGpsDevice) {
				if (!rGpsDevice) {
					var err = new Error('GPS device not found.');
					err.name = 'BugzError';
					throw err;
				}
	
				return User.findOne({
					where: {
						id: req.body.userId
					}
				})
				.then(function(rUser) {
					if (!rUser) {
						var err = new Error('User not found.');
						err.name = 'BugzError';
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
					var err = new Error('Unable to unassign device. Device not assigned.');
					err.name = 'BugzApiError';
					throw err;
				}

				if (rDeviceAgentRetailer.retailerId) {
					var err = new Error('Unable to unassign device. Device has already been activated.');
					err.name = 'BugzApiError';
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
						var err = new Error('Device is already assigned.');
						err.name = 'BugzApiError';
						throw err;
					}
	
					return GpsDevice.findOne({
						where: {
							DeviceId: o.deviceId
						}
					});
				})
				.then(function(rGpsDevice) {
					if (!rGpsDevice) {
						var err = new Error('GPS device not found.');
						err.name = 'BugzError';
						throw err;
					}
		
					return User.findOne({
						where: {
							username: o.username
						}
					})
					.then(function(rUser) {
						if (!rUser) {
							var err = new Error('User not found.');
							err.name = 'BugzError';
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
							deviceId: deviceId,
							agentId: agentId,
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
				console.log('Done!');
				res.json({
					success: true,
					message: 'Device(s) assigned.'
				});
			})
			.catch(function(err) {
				console.log(err);
				res.json({
					success: false,
					message: 'Unable to assign device(s). Please try again later.'
				});
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