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
	id: 0,
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
var testGpsDevice2 = {
	id: 0,
	DeviceId: '1234567890124x',
	IMEI: '51234567890124x',
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
var testGpsData2 = {
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
	IsEngine: false,
	IsOriginalSirenTriggeringStatus: null,
	CreatedDate: null,
	HDOP: null,
	Altitude: null,
	AD1: null,
	AD2: null,
	OdoMeter: null,
	Date: Math.floor(new Date().getTime() / 1000)
};
var testGpsData3 = {
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
	Date: null
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
	Date: Math.floor(new Date().getTime() / 1000),
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
var testFence2 = {
	id: 0,
	name: 'UnitTestFence2',
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
var testCanvasData1 = {
	id: 0,
	DeviceId: '1234567890123x',
	BatteryVoltage: 12.90,
	EngineSpeed: 0,
	RunningSpeed: 0.00,
	ThrottleOpeningWidth: 0.00,
	EngineLoad: 0.00,
	CoolantTemperature: 44.00,
	InstantaneousFuelConsumption: 0.00,
	AverageFuelConsumption: 19.49,
	DrivingRange: 0.67,
	TotalMileage: 7.00,
	SingleFuelConsumptionVolume: 0.15,
	TotalFuelConsumptionVolume: null,
	CurrentErrorCodeNumber: 0,
	HarshAccelerationNo: 1,
	HarshBrakeNo: 0,
	Datetime: Math.floor(new Date().getTime() / 1000),
	CreatedDate: new Date()
};
var testDrivingData1 = {
	int: 0,
	DeviceId: '1234567890123x',
	TotalIgnition: 12,
	TotalDrivingTime: 0.50,
	TotalIdlingTime: 0.35,
	AverageHotStartTime: 53,
	AverageSpeed: 15.00,
	HistoryHighestSpeed: 46.00,
	HistoryHighestRotation: 2277.00,
	TotalHarshAcceleration: 2,
	TotalHarshBrake: 0,
	Datetime: Math.floor(new Date() / 1000),
	CreatedDate: new Date()
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

describe('/petfence', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var User;
	var Role;
	var UserRole;
	var Module;
	var Permission;
	var Vehicle;
	var VehicleType;
	var GpsData;
	var Fence;
	var GpsDevice;
	var Sim;
	var ShareDevice;
	var CanvasData;
	var DrivingData;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;
	var dVehicle;
	var dVehicleType;
	var dGpsDevice;
	var dGpsDevice2;
	var dShareDevice;
	var dGpsData;
	var dGpsData2;
	var dGpsData3;
	var dAlarm;
	var dFence;
	var dFence2;
	var dSim;
	var dCanvas;
	var dDrivingData;

	before(function(done) {
		server = require('../server');

		User = models.tbluserinformation;
		Role = models.tblrole;
		UserRole = models.tbluserinrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;
		Vehicle = models.tblvehicle;
		VehicleType = models.tblvehicletype;
		GpsData = models.tblgpsdata;
		Fence = models.tblfence;
		GpsDevice = models.tblgpsdevice;
		Sim = models.tblsimdetails;
		ShareDevice = models.tblsharedevice;
		Alarm = models.tblalarm;
		CanvasData = models.tblcanbusdata;
		DrivingData = models.tbldrivingdata;

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
			return Module.create(testModule1);
		})
		.then(function(rModule) {
			dModule = rModule;
			testPermission.idModule = dModule.id;
			return Permission.create(testPermission);
		})
		.then(function(rPermission) {
			dPermission = rPermission;
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
			testGpsData3.Date = moment().add(5, 'minutes').unix();
			return GpsData.create(testGpsData3);
		})
		.then(function(rGpsData) {
			dGpsData3 = rGpsData;
			return GpsData.create(testGpsData2);
		})
		.then(function(rGpsData) {
			dGpsData2 = rGpsData;
			return Sim.create(testSim1);
		})
		.then(function(rSim) {
			dSim = rSim;
			testGpsDevice1.idSim = dSim.id;
			testGpsDevice1.idSalesAgent = dUser.id;
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
			return Fence.create(testFence2);
		})
		.then(function(rFence) {
			dFence2 = rFence;
			return CanvasData.create(testCanvasData1);
		})
		.then(function(rCanvas) {
			dCanvas = rCanvas;
			return DrivingData.create(testDrivingData1);
		})
		.then(function(rDrivingData) {
			dDrivingData = rDrivingData;
			done();
		});
	});

	after(function(done) {
		dDrivingData.destroy()
		.then(function() {
			return dCanvas.destroy();
		})
		.then(function() {
			return dFence.destroy();
		})
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
			return dGpsData2.destroy();
		})
		.then(function() {
			return dGpsData3.destroy();
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
			return dPermission.destroy();
		})
		.then(function() {
			return dModule.destroy();
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
			return Fence.destroy({
				where: {
					name: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			return GpsDevice.destroy({
				where: {
					AppName: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/petfence/GetAllFenceByVehicle', function() {
		it('should get all fences when deviceId matches', function(done) {
			request(server)
			.get('/petfence/GetAllFenceByVehicle')
			.query(qs.stringify({
				deviceId: testFence1.deviceId
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(2);
				done();
			});
		});

		it('should fail when deviceId does not match', function(done) {
			request(server)
			.get('/petfence/GetAllFenceByVehicle')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/petfence/GetFenceById', function() {
		it('should get fence when idFence matches', function(done) {
			request(server)
			.get('/petfence/GetFenceById')
			.query(qs.stringify({
				idFence: dFence.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('object').that.has.property('deviceId').that.is.equal(testFence1.deviceId);
				done();
			});
		});

		it('should fail when idFence does not match', function(done) {
			request(server)
			.get('/petfence/GetFenceById')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Requested Record(s) not Found....');
				expect(res.body.data).to.be.null;
				done();
			});
		});
	});

	describe('/petfence/SaveFenceById', function() {
		it('should save fence when idFence matches', function(done) {
			request(server)
			.post('/petfence/SaveFenceById')
			.send({
				deviceId: testFence2.deviceId,
				range: testFence2.range,
				status: testFence2.status,
				lat: testFence2.lat,
				lng: testFence2.lng,
				fencedraw: testFence2.fencedraw,
				name: testFence2.name,
				idFence: dFence2.id
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Fence updated successfully...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				done();
			});
		});
	});

	describe('/petfence/UpdateFenceNameById', function() {
		it('should update fence name when id matches', function(done) {
			request(server)
			.post('/petfence/UpdateFenceNameById')
			.send({
				id: dFence2.id,
				name: testFence2.name
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Fence Name updated successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('deviceId').that.is.equal(testFence2.deviceId);
				done();
			});
		});

		it('should fail when id matches', function(done) {
			request(server)
			.post('/petfence/UpdateFenceNameById')
			.send({
				id: 0,
				name: testFence2.name
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Fence Name not updated...');
				done();
			});
		});
	});

	describe('/petfence/DeleteFenceById', function() {
		it('should delete fence when idFence matches', function(done) {
			request(server)
			.get('/petfence/DeleteFenceById')
			.query(qs.stringify({
				idFence: dFence2.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Fence Removed successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when idFence does not match', function(done) {
			request(server)
			.get('/petfence/DeleteFenceById')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Fence not Removed.');
				done();
			});
		});
	});
});