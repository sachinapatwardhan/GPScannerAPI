(function() {
	'use strict';

	var express = require('express');
	var router = express.Router();
	var bodyParser = require('body-parser');
	var jsonParser = bodyParser.json();
	var moment = require('moment');

	//////////

	var DeviceAgentRetailer = models.tbldeviceagentretailer;
	var Vehicle = models.tblvehicle;
	var User = models.tbluserinformation;

	//////////

	router.get('/getPagedClientsByRetailerId', function(req, res) {
		DeviceAgentRetailer.belongsTo(Vehicle, {
			targetKey: 'deviceid',
			foreignKey: {
				name: 'deviceId',
				allowNull: false
			}
		});

		Vehicle.belongsTo(User, {
			foreignKey: {
				name: 'iduser',
				allowNull: false
			}
		});

		var include = {
			model: User,
			attributes: ['ProfileName', 'email', 'phone']
		};
		if (req.query.search.value) {
			include.where = {
				$or: [
					{ ProfileName: { $like: '%' + req.query.search.value + '%' } },
					{ email: { $like: '%' + req.query.search.value + '%' } },
					{ phone: { $like: '%' + req.query.search.value + '%' } }
				]
			};
		}

		DeviceAgentRetailer.findAndCountAll({
			where: {
				retailerId: req.query.retailerId	
			},
			include: [{
				model: Vehicle,
				include: [include]
			}]
		})
		.then(function(result) {
			if (result.rows.length) {
				res.json({
					success: true,
					message: 'Record(s) found.',
					data: result.rows,
					draw: req.query.draw,
					recordsTotal: result.count,
					recordsFiltered: result.count
				});
			} else {
				res.json({
					success: false,
					message: 'No record(s) found.',
					data: result.rows,
					draw: req.query.draw,
					recordsTotal: result.count,
					recordsFiltered: result.count
				});
			}
		})
		.catch(function(err) {
			res.json({
				success: false,
				message: 'Record(s) not found.'
			});
		});
	});

	router.get('/getAutocompleteActivateDeviceIds', function(req, res) {
		DeviceAgentRetailer.findAll({
			where: {
				deviceId: {
					$like: '%' + req.query.deviceId + '%'
				},
				$or: [
					{ activatedDatetime: { $eq: null } },
					{ expiryDatetime: { $ne: null } }
				]
			},
			limit: 20
		})
		.then(function(rGpsDevices) {
			if (rGpsDevices.length) {
				res.json({
					success: true,
					message: 'Record(s) found.',
					data: rGpsDevices
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
		});
	});

	router.get('/getAutocompleteReconfigureDeviceIds', function(req, res) {
		var now = moment();

		DeviceAgentRetailer.findAll({
			where: {
				deviceId: {
					$like: '%' + req.query.deviceId + '%'
				},
				activatedDatetime: {
					$lt: now
				},
				expiryDatetime: {
					$gt: now
				}
			},
			limit: 20
		})
		.then(function(rGpsDevices) {
			if (rGpsDevices.length) {
				res.json({
					success: true,
					message: 'Record(s) found.',
					data: rGpsDevices
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
		});
	});

	router.post('/activateDevice', jsonParser, function(req, res) {
		DeviceAgentRetailer.findOne({
			where: {
				deviceId: req.body.deviceId
			},
			$or: [
				{ activatedDatetime: { $eq: null } },
				{ expiryDatetime: { $ne: null } }
			]
		})
		.then(function(rDeviceAgentRetailer) {
			if (!rDeviceAgentRetailer) {
				var err = new Error('GPS device not found.');
				err.name = 'BugzError';
				throw err;
			}
			
			return rDeviceAgentRetailer.update({
				retailerId: req.body.retailerId,
				activatedDatetime: moment(),
				expiryDatetime: moment().add(1, 'year'),
				lastModifiedDatetime: moment()
			});
		})
		.then(function(rDeviceAgentRetailer) {
			res.json({
				success: true,
				message: 'Device activated!',
				data: rDeviceAgentRetailer
			});
		})
		.catch(function(err) {
			res.json({
				success: false,
				message: err.message
			});
		});
	});

	module.exports = router;
})();