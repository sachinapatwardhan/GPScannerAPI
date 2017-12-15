(function() {
	'use strict';

	var express = require('express');
	var router = express.Router();
	var bodyParser = require('body-parser');
	var jsonParser = bodyParser.json();
	var Bluebird = require('bluebird');
	var moment = require('moment');

	//////////

	var Sequelize = require('sequelize');
	var sequelize = require('../models1').sequelize;
	var User = models.tbluserinformation;
	var Role = models.tblrole;
	var UserRole = models.tbluserinrole;
	var GpsDevice = models.tblgpsdevice;
	var AgentRetailer = models.tblagentretailer;
	var DeviceAgentRetailer = models.tbldeviceagentretailer;

	//////////

	router.post('/registerRetailerAccount', jsonParser, function(req, res) {
		sequelize.transaction(function(t) {
			var now = new Date()

			return User.findOrCreate({
				where: {
					$or: [
						{ email: req.body.email },
						{ username: req.body.email }
					]
				},
				defaults: {
					email: req.body.email,
					username: req.body.email,
					password: jwt.encode(req.body.password, TokenKey),
					ProfileName: req.body.profileName,
					IsMobileVerify: false,
					createddate: now,
					createdby: req.body.agentId,
					idApp: req.body.appId
				},
				transaction: t
			})
			.spread(function(rUser, isCreated) {
				if (!isCreated) {
					var err = new Error('An account with this email already exists.');
					err.name = 'BugzError';
					throw err;
				}

				return AgentRetailer.create({
					agentId: req.body.agentId,
					retailerId: rUser.id,
					createdDatetime: now
				}, {
					transaction: t
				})
				.then(function(rAgentRetailer) {
					return rUser;
				});
			})
			.then(function(rUser) {
				return Role.findOne({
					where: {
						RoleName: 'Retailer'
					},
					transaction: t
				})
				.then(function(rRole) {
					return [rUser, rRole];
				});
			})
			.spread(function(rUser, rRole) {
				return UserRole.create({
					userId: rUser.id,
					roleId: rRole.id
				}, {
					transaction: t
				})
				.then(function(rUserRole) {
					return rUser;
				});
			});
		})
		.then(function(rUser) {
			res.json({
				success: true,
				message: 'Retailer account created!',
				data: rUser
			});
		})
		.catch(function(err) {
			res.json({
				success: false,
				message: err.message
			});
		});
	});

	router.get('/getActivatedDevices', function(req, res) {
		var now = moment();

		DeviceAgentRetailer.belongsTo(User, {
			foreignKey: {
				name: 'retailerId',
				allowNull: false
			}
		});

		// Get not activated devices count
		var notActivated = DeviceAgentRetailer.findAll({
			where: {
				agentId: req.query.agentId,
				$or: [
					{ activatedDatetime: { $eq: null } },
					{ expiryDatetime: { $lt: now } }
				]
			}
		})
		.then(function(rDeviceAgentRetailers) {
			return rDeviceAgentRetailers.length;
		});

		// Get activated devices count
		var activated = DeviceAgentRetailer.findAll({
			where: {
				agentId: req.query.agentId,
				activatedDatetime: {
					$lt: now
				},
				expiryDatetime: {
					$gt: now
				}
			}
		})
		.then(function(rDeviceAgentRetailers) {
			return rDeviceAgentRetailers.length;
		});

		// Get top three selling retailers
		var allDevices = DeviceAgentRetailer.findAll({
			where: {
				agentId: req.query.agentId,
				activatedDatetime:  {
					$ne: null
				}
			},
			attributes: [
				[sequelize.fn('count', sequelize.col('tbldeviceagentretailer.deviceId')), 'activatedDevicesCount']
			],
			include: [{
				model: User,
				attributes: ['ProfileName']
			}],
			group: ['tbldeviceagentretailer.retailerId'],
			order: [
				[sequelize.fn('count', sequelize.col('tbldeviceagentretailer.deviceId')), 'desc']
			]
		})
		.then(function(rDeviceAgentRetailers) {
			return rDeviceAgentRetailers;
		});
		
		// Wait for all parallel
		Bluebird.all([notActivated, activated, allDevices])
		.spread(function(notActivatedCount, activatedCount, allDevices) {
			var ro = {
				success: true,
				message: 'Record(s) found.',
				data: allDevices,
				notActivatedCount: notActivatedCount,
				activatedCount: activatedCount
			};

			if (notActivatedCount + activatedCount === 0) {
				ro.success = false;
				ro.message = 'No record(s) found.';
			}

			res.json(ro);
		})
		.catch(function(err) {
			res.json({
				success: false,
				message: err.message
			});
		});
	});

	router.get('/getPagedDevicesByAgentId', function(req, res) {
		var where = { agentId: req.query.agentId };
		if (req.query.search.value) {
			where.$or = [
				{ id: { $like: '%' + req.query.search.value + '%' } },
				{ deviceId: { $like: '%' + req.query.search.value + '%' } },
				{ retailerId: { $like: '%' + req.query.search.value + '%' } },
				
			];
			var ad = moment(req.query.search.value);
			if (ad.isValid()) {
				where.$or.push({ activatedDatetime: req.query.search.value });
			}
		}

		DeviceAgentRetailer.belongsTo(User, {
			foreignKey: {
				name: 'retailerId',
				allowNull: false
			}
		});

		DeviceAgentRetailer.findAndCountAll({
			where: where,
			order: [
				// Use Sequelize.literal to treat incoming column as literal
				[ Sequelize.literal(req.query.columns[req.query.order[0].column].data), req.query.order[0].dir ]
			],
			offset: parseInt(req.query.start),
			limit: parseInt(req.query.length),
			include: [{
				model: User,
				attributes: ['ProfileName']
			}]
		})
		.then(function(rDeviceAgentRetailer) {
			if (rDeviceAgentRetailer.rows.length) {
				res.json({
					success: true,
					message: 'Device(s) found.',
					data: rDeviceAgentRetailer.rows,
					draw: req.query.draw,
					recordsTotal: rDeviceAgentRetailer.count,
					recordsFiltered: rDeviceAgentRetailer.count
				});
			} else {
				res.json({
					success: false,
					message: 'No device(s) found.',
					data: rDeviceAgentRetailer.rows,
					draw: req.query.draw,
					recordsTotal: rDeviceAgentRetailer.count,
					recordsFiltered: rDeviceAgentRetailer.count
				});
			}
		})
		.catch(function(err) {
			res.json({
				success: false,
				message: err.message
			});
		});
	});

	//////////

	module.exports = router;
})();