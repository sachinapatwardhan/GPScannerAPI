(function() {
	'use strict';

	var express = require('express');
	var router = express.Router();
	var bodyParser = require('body-parser');
	var jsonParser = bodyParser.json();
	var Bluebird = require('bluebird');
	var moment = require('moment');
	var _ = require('lodash');

	//////////

	var Sequelize = require('sequelize');
	var sequelize = require('../models1').sequelize;
	var User = models.tbluserinformation;
	var Role = models.tblrole;
	var UserRole = models.tbluserinrole;
	var GpsDevice = models.tblgpsdevice;
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
			if (rSalesAgents.length) {
				res.json({
					success: true,
					message: 'Record(s) found.',
					data: rSalesAgents
				});
			} else {
				res.json({
					success: false,
					message: 'No record(s) found.'
				});
			}
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
			res.json({
				success: false,
				message: err.message
			});
			if (err.name !== 'BugzApiError') {
			}
		});
	});

	//////////

	module.exports = router;
})();