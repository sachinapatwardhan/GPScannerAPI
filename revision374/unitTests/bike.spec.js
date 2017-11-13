var request = require('supertest');
var require = require('really-need');
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
var testVehicle2 = {
	id: 0,
	iduser: 0,
	Name: 'UnitTestVehicle2',
	deviceid: '1234567890124x',
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
var testVehicleType1 = {
	id: 0,
	Type: 'UnitTestType1',
	IsActive: false,
	CreatedDate: new Date(),
	CreatedBy: 'unittest.user@bugzstudio.com',
	OnIcon: '/path/to/on/icon',
	OffIcon: '/path/to/off/icon',
	ActiveIcon: '/path/to/active/icon'
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
	AppName: 'UnitTest1',
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
	Date: Math.floor(new Date().getTime() / 1000)
};
var testShareDevice1 = {
	id: 0,
	idUser: 0,
	idSharedUser: 0,
	IsActive: true,
	idVehicle: 0,
	CreatedBy: 'unittest.user@bugzstudio.com',
	CreatedDate: new Date(),
	DeviceId: '1234567890123x',
	IsSharedUserNotification: true,
	IsNotification: true
};
var testAlarm1 = {
	Id: 0,
	Latitude: 23.14050333,
	Longitude: 113.379815,
	GPSPositioning: 'A',
	Speed: 0,
	Direction: '000',
	Status: 0,
	DeviceId: '1234567890123x',
	AlarmCode: 6,
	CreatedDate: new Date(),
	Datetime: new Date(),
	Date: new Date().getTime(),
	FenceName: 'UnitTestFence1',
	IsRead: false
};
var testFence1 = {
	id: 0,
	name: 'UnitTestFence1',
	deviceId: '1234567890123x',
	range: 207.10958715342082,
	status: 1,
	lat: 29.567861478493672,
	lng: 106.4535975929175,
	fencedraw: 'circle',
	IsInFence: true,
	IsFenceOnline: false
};
var testSim1 = {
	id: 0,
	SerialNum: '1234567890123',
	PhoneNum: '01234576789',
	CreatedDate: new Date(),
	idTelCo: null
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
	var VehicleType;
	var GpsData;
	var Fence;
	var GpsDevice;
	var Sim;
	var ShareDevice;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;
	var dVehicle;
	var dVehicleType;
	var dGpsDevice;
	var dShareDevice;
	var dGpsData;
	var dAlarm;
	var dFence;
	var dSim;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		User = models.tbluserinformation;
		Role = models.tblrole;
		UserRole = models.tbluserinrole;
		Vehicle = models.tblvehicle;
		VehicleType = models.tblvehicletype;
		GpsData = models.tblgpsdata;
		Fence = models.tblfence;
		GpsDevice = models.tblgpsdevice;
		Sim = models.tblsimdetails;
		ShareDevice = models.tblsharedevice;
		Alarm = models.tblalarm;

		testUser1.password = jwt.encode(testUser1.password, 'bugz');
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
			return VehicleType.create(testVehicleType1);
		})
		.then(function(rVehicleType) {
			dVehicleType = rVehicleType;
			testVehicle1.idType = dVehicleType.id;
			return Vehicle.create(testVehicle1);
		})
		.then(function(rVehicle) {
			dVehicle = rVehicle;
			testShareDevice1.idVehicle = dVehicle.id;
			testShareDevice1.idUser = dUser.id;
			return ShareDevice.create(testShareDevice1);
		})
		.then(function(rShareDevice) {
			dShareDevice = rShareDevice;
			return GpsData.create(testGpsData1);
		})
		.then(function(rGpsData) {
			dGpsData = rGpsData;
			return Sim.create(testSim1);
		})
		.then(function(rSim) {
			dSim = rSim;
			testGpsDevice1.idSim = dSim.id;
			return GpsDevice.create(testGpsDevice1);
		})
		.then(function(rGpsDevice) {
			dGpsDevice = rGpsDevice;
			return Alarm.create(testAlarm1);
		})
		.then(function(rAlarm) {
			dAlarm = rAlarm;
			return Fence.create(testFence1);
		})
		.then(function(rFence) {
			dFence = rFence;
			done();
		});
	});

	after(function(done) {
		dFence.destroy()
		.then(function() {
			return dAlarm.destroy();
		})
		.then(function() {
			return dGpsDevice.destroy();
		})
		.then(function() {
			return dSim.destroy();
		})
		.then(function() {
			return dGpsData.destroy();
		})
		.then(function() {
			return dShareDevice.destroy();
		})
		.then(function() {
			return dVehicle.destroy();
		})
		.then(function() {
			return dVehicleType.destroy();
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

	describe('/bike/GetAllWorkingBike', function() {
		it('should get all working bikes when data exists', function(done) {
			request(server)
			.post('/bike/GetAllWorkingBike')
			.query(qs.stringify({
				idUser: dUser.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(1);
				expect(res.body.data[0]).to.be.an('object');
				done();
			});
		});
		
		it('should fail when data does not exist', function(done) {
			request(server)
			.post('/bike/GetAllWorkingBike')
			.query(qs.stringify({
				idUser: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(0);
				done();
			});
		});
	});

	describe('/bike/GetAllWorkingBikeWebApp', function() {
		it('should get all working bikes when data exists', function(done) {
			request(server)
			.get('/bike/GetAllWorkingBikeWebApp')
			.query(qs.stringify({
				idUser: dUser.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(1);
				expect(res.body.data[0]).to.be.an('object');
				done();
			});
		});

		it('should fail when data does not exist', function(done) {
			request(server)
			.get('/bike/GetAllWorkingBikeWebApp')
			.query(qs.stringify({
				idUser: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(0);
				done();
			});
		});
	});

	describe('/bike/DeleteBike', function() {
		var dVehicle2;

		before(function(done) {
			testVehicle2.iduser = dUser.id;
			Vehicle.create(testVehicle2)
			.then(function(rVehicle) {
				dVehicle2 = rVehicle;
				done();
			});
		});

		it('should delete bike when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/bike/DeleteBike')
			.set('authorization', token)
			.query(qs.stringify({
				BikeId: dVehicle2.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle deleted successfully');
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/bike/DeleteBike')
			.query(qs.stringify({
				BikeId: dVehicle2.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});
	
	describe('/bike/GetVehicleCurrentLocation', function() {
		it('should get vehicle\'s current location when DeviceId matches', function(done) {
			request(server)
			.get('/bike/GetVehicleCurrentLocation')
			.query(qs.stringify({
				DeviceId: testGpsData1.DeviceId
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('object');
				expect(res.body.data).to.have.property('Id');
				expect(res.body.data.Id).to.equal(dGpsData.Id);
				done();
			});
		});

		it('should fail when DeviceId or data does not exist', function(done) {
			request(server)
			.get('/bike/GetVehicleCurrentLocation')
			.query(qs.stringify({
				DeviceId: 0
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

	describe('/bike/GetVehicleCurrentLocationForSharedDevice', function() {
		it('should get vehicle\'s current location for shared device if DeviceId matches', function(done) {
			request(server)
			.get('/bike/GetVehicleCurrentLocationForSharedDevice')
			.query(qs.stringify({
				DeviceId: jwt.encode('\'' + testGpsData1.DeviceId + '\'', 'bugz')
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('object');
				expect(res.body.data).to.have.property('Id');
				expect(res.body.data.Id).to.equal(dGpsData.Id);
				done();
			});
		});

		it('should fail if DeviceId does not match', function(done) {
			request(server)
			.get('/bike/GetVehicleCurrentLocationForSharedDevice')
			.query(qs.stringify({
				DeviceId: jwt.encode('\'\'', 'bugz')
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

	describe('/bike/GetAllGPSDate', function() {
		it('should get all GPS date when DeviceId matches', function(done) {
			request(server)
			.get('/bike/GetAllGPSDate')
			.query(qs.stringify({
				DeviceId: testGpsData1.DeviceId
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.lengthOf(1);
				done();
			});
		});

		it('should fail when DeviceId does not match', function(done) {
			request(server)
			.get('/bike/GetAllGPSDate')
			.query(qs.stringify({
				DeviceId: ''
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

	describe('/bike/GetAllGPSDateByDate', function() {
		it('should get all GPS date by date when DeviceId and StartDateTime matches', function(done) {
			request(server)
			.get('/bike/GetAllGPSDate')
			.query(qs.stringify({
				DeviceId: testGpsData1.DeviceId,
				StartDateTime: moment().startOf('month').unix()
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.lengthOf(1);
				done();
			});
		});

		it('should fail when DeviceId or StartDateTime does not match', function(done) {
			request(server)
			.get('/bike/GetAllGPSDate')
			.query(qs.stringify({
				DeviceId: '',
				StartDateTime: Math.floor(new Date().getTime() / 1000)
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

	describe('/bike/GetAllGPSByTimeZoneDate', function() {
		it('should get all GPS data by time zone date', function(done) {
			request(server)
			.get('/bike/GetAllGPSByTimeZoneDate')
			.query(qs.stringify({
				DeviceId: '\'' + testGpsData1.DeviceId + '\'',
				TodayStartDateTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
				TodayEndDateTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss')
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.lengthOf(1);
				done();
			});
		});

		it('should fail when no data found', function(done) {
			request(server)
			.get('/bike/GetAllGPSByTimeZoneDate')
			.query(qs.stringify({
				DeviceId: '\'\'',
				TodayStartDateTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
				TodayEndDateTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss')
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

	describe('/bike/GetAllGPSByTimeZoneDateWithV', function() {
		it('should get all GPS data by time zone date', function(done) {
			request(server)
			.get('/bike/GetAllGPSByTimeZoneDateWithV')
			.query(qs.stringify({
				DeviceId: '\'' + testGpsData1.DeviceId + '\'',
				TodayStartDateTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
				TodayEndDateTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss')
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.lengthOf(1);
				done();
			});
		});

		it('should fail when no data found', function(done) {
			request(server)
			.get('/bike/GetAllGPSByTimeZoneDateWithV')
			.query(qs.stringify({
				DeviceId: '\'\'',
				TodayStartDateTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
				TodayEndDateTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss')
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

	describe('/bike/ChangeFenceByBike', function() {
		it('should update fence when idFence is correct', function(done) {
			request(server)
			.get('/bike/ChangeFenceByBike')
			.query(qs.stringify({
				idFence: dFence.id,
				IsFenceOnline: true
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).have.property('success');
				expect(res.body).have.property('message');
				expect(res.body).have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Fence Setting saved successfully.'),
				expect(res.body.data).to.equal('true');
				done();
			});
		});

		it('should fail when idFence is wrong', function(done) {
			request(server)
			.get('/bike/ChangeFenceByBike')
			.query(qs.stringify({
				idFence: 0,
				IsFenceOnline: false
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).have.property('success');
				expect(res.body).have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Fence Setting not saved successfully. Try after 5 minute.'),
				done();
			});
		});
	});

	describe('/bike/SaveVehicle', function() {
		after(function(done) {
			Vehicle.destroy({
				where: {
					Name: testVehicle2.Name
				}
			})
			.then(function() {
				done();
			});
		});

		it('should save vehicle credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/bike/SaveVehicle')
			.set('authorization', token)
			.query(qs.stringify({
				id: 0,
				AppName: testGpsDevice1.AppName,
				IMEI: testGpsDevice1.IMEI,
				deviceid: '',
				Name: testVehicle2.Name,
				iduser: dUser.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle created successfully...');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});

		it('should fail if credentials are wrong', function(done) {
			request(server)
			.get('/bike/SaveVehicle')
			.query(qs.stringify({
				id: testVehicle1.id,
				AppName: testGpsDevice1.AppName,
				IMEI: testGpsDevice1.IMEI,
				deviceid: testVehicle1.deviceid
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/bike/UpdateVehicleName', function() {
		it('should update vehicle name when DeviceId matches', function(done) {
			request(server)
			.get('/bike/UpdateVehicleName')
			.query(qs.stringify({
				Name: testVehicle1.Name,
				DeviceId: testVehicle1.deviceid
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle No. Save Successfully.');
				done();
			});
		});
	});

	describe('/bike/UpdateVehicleType', function() {
		it('should update vehicle type when DeviceId matches', function(done) {
			request(server)
			.get('/bike/UpdateVehicleType')
			.query(qs.stringify({
				idType: testVehicle1.idType,
				DeviceId: testVehicle1.deviceid
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle Type Save Successfully.');
				done();
			});
		});
	});

	describe('/bike/UpdateVehicleShare', function() {
		it('should update vehicle sharing when DeviceId matches', function(done) {
			request(server)
			.get('/bike/UpdateVehicleShare')
			.query(qs.stringify({
				IsShared: true,
				DeviceId: testVehicle1.deviceid
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle No. Save Successfully.');
				done();
			});
		});
	});

	describe('/bike/UpdateInsurenceDate', function() {
		it('should update insurance date when DeviceId matches', function(done) {
			request(server)
			.get('/bike/UpdateInsurenceDate')
			.query(qs.stringify({
				InsurenceDate: moment().format('YYYY-MM-DD HH:mm:ss'),
				DeviceId: testVehicle1.deviceid
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Insurence Date Save Successfully.');
				done();
			});
		});
	});

	describe('/bike/UpdatePUCDate', function() {
		it('should update PUC date when DeviceId matches', function(done) {
			request(server)
			.get('/bike/UpdatePUCDate')
			.query(qs.stringify({
				PUCDate: moment().format('YYYY-MM-DD HH:mm:ss'),
				DeviceId: testVehicle1.deviceid
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('PUC Date  Save Successfully.');
				done();
			});
		});
	});

	describe('/bike/GetAllExpireDevice', function() {
		it('should get all expired devices based on app name', function(done) {
			request(server)
			.get('/bike/GetAllExpireDevice')
			.query(qs.stringify({
				AppName: testGpsDevice1.AppName
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.lengthOf(1);
				expect(res.body[0]).to.have.property('SerialNum');
				expect(res.body[0].SerialNum).to.equal(testSim1.SerialNum);
				done();
			});
		});
	});

	describe('/bike/GetAllWorkingBikeWebAppNew', function() {
		it('should get all working bikes for web app', function(done) {
			request(server)
			.get('/bike/GetAllWorkingBikeWebAppNew')
			.query(qs.stringify({
				idUser: dUser.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(1);
				done();
			});
		});
	});
});