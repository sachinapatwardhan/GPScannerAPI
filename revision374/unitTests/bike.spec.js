var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testVehicle1 = {
	id: 0,
	iduser: 0,
	Name: 'UnitTestVehicle',
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
	IMEI: '51234567890123x',
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
	AppName: 'UnitTest',
	idSim: null,
	ActivationDate: new Date()
};
var testGpsData1 = {
	Datetime: new Date(),
	Latitude: 1.000000,
	Longitude: 2.000000,
	GPSPositioning: 'A',
	Speed: 40.0,
	Direction: 309.62,
	Status: 00000000,
	DeviceId: '1234567890123x',
	IsRelayToStopTheCar: null,
	IsSirenSound: null,
	IsUserDefined: null,
	IsLockTheDoor: null,
	IsUnlockTheDoor: null,
	IsSOS: null,
	IsWiringForAntiTamper: null,
	IsDoor: null,
	IsEngine: true,
	IsOriginalSirenTriggeringStatus: null,
	CreatedDate: null,
	HDOP: null,
	Altitude: null,
	AD1: null,
	AD2: null,
	OdoMeter: null,
	Date: new Date().getTime()
};
var testUser1 = {
	email: 'unittest.user@bugzstudio.com',
	username: 'unittest.user@bugzstudio.com',
	password: 'unittest.user',
	ProfileName: 'Unit Test User',
	IsMobileVerify: false,
	idApp: 1
};
var testRole1 = {
	RoleName: 'UnitTestUser',
	Description: 'Unit Test User',
	Country: 'Malaysia'
};
var testModule1 = {
	Module: 'UnitTestModule',
	IsActive: true,
	DisplayOrder: 99999
};
var testPermission = {
	idModule: 0,
	RoleName: testRole1.RoleName,
	Added: true,
	Modified: true,
	Deleted: true,
	Show: true
};

describe('bike.js', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var User;
	var Role;
	var UserRole;
	var Vehicle;
	var GpsData;
	var Fence;
	var GpsDevice;
	var Sim;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;
	var dVehicle;
	var dGpsDevice;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		User = models.tbluserinformation;
		Role = models.tblrole;
		UserRole = models.tbluserinrole;
		Vehicle = models.tblvehicle;
		GpsData = models.tblgpsdata;
		Fence = models.tblfence;
		GpsDevice = models.tblgpsdevice;
		Sim = models.tblsimdetails;

		User.create(testUser1)
		.then(function(rUser) {
			dUser = rUser;
			return Role.create(testRole1);
		})
		.then(function(rRole) {
			dRole = rRole;
			return UserRole.create({
				userId: dUser.id,
				roleId: dRole.id
			});
		})
		.then(function(rUserRole) {
			dUserRole = rUserRole;
			testVehicle1.iduser = dUser.id;
			return Vehicle.create(testVehicle1);
		})
		.then(function(rVehicle) {
			dVehicle = rVehicle;
			return GpsDevice.create(testGpsDevice1);
		})
		.then(function(rGpsDevice) {
			dGpsDevice = rGpsDevice;
			done();
		});
	});

	after(function(done) {
		dGpsDevice.destroy()
		.then(function() {
			return dVehicle.destroy();
		})
		.then(function() {
			return dUserRole.destroy();
		})
		.then(function() {
			return dRole.destroy();
		})
		.then(function() {
			return dUser.destroy();
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/bike/getAllBikeByUser', function() {
		it('should get all bikes if user ID is correct', function(done) {
			request(server)
			.get('/bike/getAllBikeByUser')
			.query(qs.stringify({
				idUser: testVehicle1.iduser
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(1);
				done();
			});
		});

		it('should fail if no records are found', function(done) {
			request(server)
			.get('/bike/getAllBikeByUser')
			.query(qs.stringify({
				idUser: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.lengthOf(0);
				done();
			});
		});
	});

	describe('/bike/GetVehicleById', function() {
		it('should get vehicle if vehicle ID exists', function(done) {
			request(server)
			.get('/bike/GetVehicleById')
			.query(qs.stringify({
				idVehicle: dVehicle.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});

		it('should fail if vehicle ID does not exist', function(done) {
			request(server)
			.get('/bike/GetVehicleById')
			.query(qs.stringify({
				idVehicle: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Requested Record(s) not Found....');
				expect(res.body.data).to.be.null;
				done();
			});
		});
	});

	describe('/bike/GetVehicleDetailById', function() {
		it('should get vehicle if vehicle ID exists', function(done) {
			request(server)
			.get('/bike/GetVehicleDetailById')
			.query(qs.stringify({
				idVehicle: dVehicle.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('object');
				expect(res.body.data).to.have.property('id');
				expect(res.body.data.id).to.equal(dVehicle.id);
				done();
			});
		});

		it('should fail if vehicle ID does not exist', function(done) {
			request(server)
			.get('/bike/GetVehicleDetailById')
			.query(qs.stringify({
				idVehicle: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.not.have.property('data');
				expect(res.body.success).to.equal(true);
				done();
			});
		});
	});
});