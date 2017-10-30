(function() {
	'use strict';

	var express = require('express');
	var router = express.Router();
	var bodyParser = require('body-parser');
	var jsonParser = bodyParser.json();
	var moment = require('moment');

	//////////

	var DeviceAgentRetailer = models.tbldeviceagentretailer;
	var GpsDevice = models.tblgpsdevice;

	//////////

	router.get('/getAutocompleteDeviceIds', function(req, res) {
		GpsDevice.findAll({
			where: { DeviceId: { $like: '%' + req.query.deviceId + '%' } },
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
			}
		})
		.then(function(rDeviceAgentRetailer) {
			if (!rDeviceAgentRetailer) {
				var err = new Error('GPS device not found.');
				err.name = 'BugzError';
				throw err;
			}

			var date = new Date();
			return rDeviceAgentRetailer.update({
				retailerId: req.body.retailerId,
				activatedDatetime: moment(),
				expiryDatetime: moment().add(1, 'year'),
				lastModifiedDatetime: moment()
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