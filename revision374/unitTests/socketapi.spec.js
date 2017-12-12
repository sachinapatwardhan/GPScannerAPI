var request = require('supertest');
var expect = require('chai').expect;
var qs = require('qs');

var testVehicle1 = {
	id: 0,
	iduser: 0,
	Name: 'UnitTestVehicle1',
	deviceid: '1234567890123x',
	renewaldate: new Date(),
	IsOnline: false,
	HandshakDatetime: new Date(),
	CreatedDate: new Date(),
	MaxSpeed: 0.0000,
	IsACC: false,
	BatteryPercentage: 0,
	CreatedBy: 'Admin',
	ModifiedDate: null,
	ModifiedBy: null,
	SleepMode: false,
	GPRSInterval: 10,
	GPRSStopInterval: 0,
	Arm: false,
	OdoMeter: false,
	HeartbeatInterval: true,
	Relay: false,
	Siren: false,
	UserDefined: false,
	DoorLock: false,
	DoorUnlock: false,
	TimeZone: null,
	IsDelete: false,
	DeviceType: 'UnitTest1',
	idSalesAgent: null,
	LastArmSetting: false,
	IsShared: false,
	InsurenceDate: new Date(),
	PUCDate: null,
	idType: null,
	Movement: false
};
var testGpsDevice1 = {
	DeviceId: '1234567890123x',
	IMEI: '556473829105647',
	CreatedDate: new Date(),
	Type: 'TEST100',
	Version: null,
	CreatedBy: 'UnitTest',
	CountryId: null,
	TelCoId: null,
	SimNum: null,
	idSalesAgent: null,
	IsActive: true,
	ExpiryDate: new Date(),
	AppName: 'UnitTest1',
	idSim: null,
	ActivationDate: new Date()
};
var testImeiNumber = {
	id: 0,
	IMEI: 556473829105647,
	IsUse: false
};
var testIosImeiNumberMapping = {
	id: 0,
	UDID: 'UnitTestUdid',
	IMEI: 556473829105647,
	CreatedDate: new Date(),
	Type: 'IOS'
};
var testUser1 = {
	email: 'unittest.user@bugzstudio.com',
	username: 'unittest.user@bugzstudio.com',
	password: 'unittest.user',
	ProfileName: 'Unit Test User',
	IsMobileVerify: false,
	idApp: 1
};

/**
 * Note: This test spec requires Socket API server to be on!
 */

describe('/socketapi', function() {
	// Adjusted to compensate timeout for socket
	this.timeout(12000);

	var server;
	var User;
	var Vehicle;
	var GpsDevice;
	var ImeiNumber;
	var IosImeiNumberMapping;
	var dUser;
	var dVehicle;
	var dGpsDevice;
	var dImeiNumber;
	var dIosImeiNumberMapping;

	before(function(done) {
		server = require('../server');

		User = models.tbluserinformation;
		Vehicle = models.tblvehicle;
		GpsDevice = models.tblgpsdevice;
		ImeiNumber = models.tblimeinumber;
		IosImeiNumberMapping = models.tbliosimeinumbermapping;

		User.create(testUser1)
		.then(function(rUser) {
			dUser = rUser;
			testVehicle1.iduser = dUser.id;
			return Vehicle.create(testVehicle1);
		})
		.then(function(rVehicle) {
			dVehicle = rVehicle;
			return GpsDevice.create(testGpsDevice1);
		})
		.then(function(rGpsDevice) {
			dGpsDevice = rGpsDevice;
			return ImeiNumber.create(testImeiNumber);
		})
		.then(function(rImeiNumber) {
			dImeiNumber = rImeiNumber;
			return IosImeiNumberMapping.create(testIosImeiNumberMapping);
		})
		.then(function(rIosImeiNumberMapping) {
			dIosImeiNumberMapping = rIosImeiNumberMapping;
			done();
		});
	});

	after(function(done) {
		dIosImeiNumberMapping.destroy()
		.then(function() { return dImeiNumber.destroy(); })
		.then(function() { return dGpsDevice.destroy(); })
		.then(function() { return dVehicle.destroy(); })
		.then(function() { return dUser.destroy(); })
		.then(function() { done(); });
	});

	describe('/socketapi/RequestIMEINumberbyUDID', function() {
		it('should request IMEI number by UDID for IOS', function(done) {
			request(server)
			.get('/socketapi/RequestIMEINumberbyUDID')
			.query(qs.stringify({
				UDID: testIosImeiNumberMapping.UDID
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.IMEI).to.equal(testIosImeiNumberMapping.IMEI);
				done();
			});
		});
	});

	describe('/socketapi/RequestIMEINumberForAndroid', function() {
		it('should request IMEI number by UDID for Android', function(done) {
			request(server)
			.get('/socketapi/RequestIMEINumberForAndroid')
			.query(qs.stringify({
				UDID: testIosImeiNumberMapping.UDID
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.IMEI).to.equal(testIosImeiNumberMapping.IMEI);
				done();
			});
		});
	});

	describe('/socketapi/SendSpeedData', function() {
		it('should fail when device not connected', function(done) {
			request(server)
			.get('/socketapi/SendSpeedData')
			.query(qs.stringify({
				DeviceId: testGpsDevice1.DeviceId,
				Speed: 100
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device not connected. Try after 5 minute.');
				done();
			});
		});
	});
	
	describe('/socketapi/GetCurrentLocation', function() {
		it('should fail when device not connected', function(done) {
			request(server)
			.get('/socketapi/GetCurrentLocation')
			.query(qs.stringify({
				DeviceId: testGpsDevice1.DeviceId
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device not connected. Try after 5 minute.');
				done();
			});
		});
	});

	describe('/socketapi/SetGPRSInterval', function() {
		it('should fail when device not connected', function(done) {
			request(server)
			.get('/socketapi/SetGPRSInterval')
			.query(qs.stringify({
				DeviceId: testGpsDevice1.DeviceId,
				TimeInterval: 10000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device not connected. Try after 5 minute.');
				done();
			});
		});
	});

	describe('/socketapi/SetSleepMode', function() {
		it('should fail when device not connected', function(done) {
			request(server)
			.get('/socketapi/SetSleepMode')
			.query(qs.stringify({
				DeviceId: testGpsDevice1.DeviceId,
				SleepMode: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device not connected. Try after 5 minute.');
				done();
			});
		});
	});

	describe('/socketapi/SetOutputControl', function() {
		it('should fail when device not connected', function(done) {
			request(server)
			.get('/socketapi/SetOutputControl')
			.query(qs.stringify({
				DeviceId: testGpsDevice1.DeviceId,
				Relay: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device not connected. Try after 5 minute.');
				done();
			});
		});
	});

	describe('/socketapi/SetArmSettings', function() {
		it('should fail when device not connected', function(done) {
			request(server)
			.get('/socketapi/SetArmSettings')
			.query(qs.stringify({
				DeviceId: testGpsDevice1.DeviceId,
				Arm: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device not connected. Try after 5 minute.');
				done();
			});
		});
	});

	describe('/socketapi/SetOdometerSetting', function() {
		it('should fail when device not connected', function(done) {
			request(server)
			.get('/socketapi/SetArmSettings')
			.query(qs.stringify({
				DeviceId: testGpsDevice1.DeviceId,
				odometer: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device not connected. Try after 5 minute.');
				done();
			});
		});
	});

	describe('/socketapi/SetOdometerSetting', function() {
		it('should fail when device not connected', function(done) {
			request(server)
			.get('/socketapi/SetArmSettings')
			.query(qs.stringify({
				DeviceId: testGpsDevice1.DeviceId,
				odometer: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device not connected. Try after 5 minute.');
				done();
			});
		});
	});

	describe('/socketapi/SetHeartBeatInterval', function() {
		it('should fail when device not connected', function(done) {
			request(server)
			.get('/socketapi/SetHeartBeatInterval')
			.query(qs.stringify({
				DeviceId: testGpsDevice1.DeviceId,
				TimeInterval: 60000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device not connected. Try after 5 minute.');
				done();
			});
		});
	});

	describe('/socketapi/SetGPRSIntervalStopCar', function() {
		it('should fail when device not connected', function(done) {
			request(server)
			.get('/socketapi/SetGPRSIntervalStopCar')
			.query(qs.stringify({
				DeviceId: testGpsDevice1.DeviceId,
				TimeInterval: 60000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device not connected. Try after 5 minute.');
				done();
			});
		});
	});

	describe('/socketapi/UpdateDeviceStatus', function() {
		it('should update device status', function(done) {
			request(server)
			.get('/socketapi/UpdateDeviceStatus')
			.query(qs.stringify({
				DeviceId: testVehicle1.DeviceId,
				Status: false
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.equal('No Response');
				done();
			});
		});
	});
});