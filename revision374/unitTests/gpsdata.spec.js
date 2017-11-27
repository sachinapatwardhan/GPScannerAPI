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
	Date: null
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
var testOriginalPassword1 = testUser1.password;
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

describe('/gpsdata', function() {
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
	var dGpsData2;
	var dGpsData3;
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
			testGpsData3.Date = moment().add(5, 'minutes').unix();
			return GpsData.create(testGpsData3);
		})
		.then(function(rGpsData) {
			dGpsData3 = rGpsData;
			testGpsData2.Date = moment().add(10, 'minutes').unix();
			return GpsData.create(testGpsData2);
		})
		.then(function(rGpsData) {
			dGpsData2 = rGpsData;
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

	describe('/gpsdata/GetAllGpsData', function() {
		it('should get all gps data by paging', function(done) {
			request(server)
			.get('/gpsdata/GetAllGpsData')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Date', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Latitude', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Longitude', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'GPSPositioning', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Speed', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Direction', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Status', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsRelayToStopTheCar', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsSirenSound', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsLockTheDoor', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsUnlockTheDoor', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsSOS', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsDoor', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsEngine', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Altitude', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AD1', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AD2', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'OdoMeter', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				_: 1500000000000,
				idApp: testUser1.idApp,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format()
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('draw');
				expect(res.body).to.have.property('recordsTotal');
				expect(res.body).to.have.property('recordsFiltered');
				expect(res.body).to.have.property('data');
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				done();
			});
		});
		
		it('should get all gps data by paging when searching', function(done) {
			request(server)
			.get('/gpsdata/GetAllGpsData')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Date', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Latitude', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Longitude', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'GPSPositioning', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Speed', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Direction', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Status', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsRelayToStopTheCar', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsSirenSound', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsLockTheDoor', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsUnlockTheDoor', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsSOS', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsDoor', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsEngine', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Altitude', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AD1', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AD2', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'OdoMeter', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testGpsData1.DeviceId,
				_: 1500000000000,
				idApp: testUser1.idApp,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format()
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('draw');
				expect(res.body).to.have.property('recordsTotal');
				expect(res.body).to.have.property('recordsFiltered');
				expect(res.body).to.have.property('data');
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/gpsdata/GetAllAlarm', function() {
		it('should get all alarm by paging', function(done) {
			request(server)
			.get('/gpsdata/GetAllAlarm')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Date', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AlarmCode', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Latitude', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Longitude', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'GPSPositioning', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Status', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				_: 1500000000000,
				idApp: testUser1.idApp,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				AlarmCode: testAlarm1.AlarmCode
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('draw');
				expect(res.body).to.have.property('recordsTotal');
				expect(res.body).to.have.property('recordsFiltered');
				expect(res.body).to.have.property('data');
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				done();
			});
		});
		
		it('should get all gps data by paging when searching', function(done) {
			request(server)
			.get('/gpsdata/GetAllAlarm')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Date', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AlarmCode', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Latitude', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Longitude', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'GPSPositioning', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Status', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testGpsData1.DeviceId,
				_: 1500000000000,
				idApp: testUser1.idApp,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				AlarmCode: testAlarm1.AlarmCode
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('draw');
				expect(res.body).to.have.property('recordsTotal');
				expect(res.body).to.have.property('recordsFiltered');
				expect(res.body).to.have.property('data');
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/gpsdata/GetAllGpsDevice', function() {
		it('should get all gps device when idApp matches', function(done) {
			request(server)
			.get('/gpsdata/GetAllGpsDevice')
			.query(qs.stringify({
				idApp: testUser1.idApp
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});

		it('should get all gps device when idApp does not match', function(done) {
			request(server)
			.get('/gpsdata/GetAllGpsDevice')
			.query(qs.stringify({
				idApp: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.is.empty;
				done();
			});
		});
	});

	describe('/gpsdata/ExportAllGpsData', function() {
		it('should export all gps data when DeviceId matches', function(done) {
			request(server)
			.get('/gpsdata/ExportAllGpsData')
			.query(qs.stringify({
				DeviceId: testGpsData1.DeviceId,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format()
			}))
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				expect(res.header['content-disposition']).to.equal('attachment; filename=GPSData.xlsx');
				done();
			});
		});
	});

	describe('/gpsdata/ExportAlarm', function() {
		it('should export alarm when query matches', function(done) {
			request(server)
			.get('/gpsdata/ExportAlarm')
			.query(qs.stringify({
				DeviceId: '\'' + testAlarm1.DeviceId + '\'',
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				AlarmCode: testAlarm1.AlarmCode,
				idApp: testUser1.idApp,
				TimeZone: 'Asia/Kuala_Lumpur',
				CurrentOffset: '+08:00'
			}))
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				expect(res.header['content-disposition']).to.equal('attachment; filename=Alarm.xlsx');
				done();
			});
		});
	});

	describe('/gpsdata/GetAllSpeedDataReport', function() {
		it('should get all speed data report when query matches', function(done) {
			request(server)
			.get('/gpsdata/GetAllSpeedDataReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'' + testGpsData1.DeviceId + '\'',
				Speed: '',
				start: 0,
				length: 25,
				TimeZone: 'Asia/Kuala_Lumpur'
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.data).to.be.an('array').that.has.lengthOf(2);
				expect(res.body.Totalrecord).to.equal(2);
				done();
			});
		});

		it('should fail when query does not match', function(done) {
			request(server)
			.get('/gpsdata/GetAllSpeedDataReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'\'',
				Speed: '',
				start: 0,
				length: 25,
				TimeZone: 'Asia/Kuala_Lumpur'
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.data).to.be.an('array').that.has.lengthOf(0);
				expect(res.body.Totalrecord).to.equal(0);
				done();
			});
		});
	});

	describe('/gpsdata/ExportAllSpeedDataReport', function() {
		it('should export all speed data report when query matches', function(done) {
			request(server)
			.get('/gpsdata/ExportAllSpeedDataReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				Speed: '',
				DeviceId: '\'' + testGpsData1.DeviceId + '\'',
				TimeZone: 'Asia/Kuala_Lumpur'
			}))
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				expect(res.header['content-disposition']).to.equal('attachment; filename=SpeedReport.xlsx');
				done();
			});
		});
	});

	describe('/gpsdata/GetAllWoringHourForReport', function() {
		it('should get all working hours when query matches', function(done) {
			request(server)
			.get('/gpsdata/GetAllWoringHourForReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'' + testGpsData1.DeviceId + '\'',
				TimeZone: 'Asia/Kuala_Lumpur'
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0].Name).to.equal(testVehicle1.Name);
				done();
			});
		});

		it('should fail when query does not match', function(done) {
			request(server)
			.get('/gpsdata/GetAllWoringHourForReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'\'',
				TimeZone: 'Asia/Kuala_Lumpur'
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/gpsdata/ExportAllWoringHourForReport', function() {
		it('should export all working hours', function(done) {
			request(server)
			.get('/gpsdata/ExportAllWoringHourForReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'\'',
			}))
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				expect(res.header['content-disposition']).to.equal('attachment; filename=WorkingHourReport.xlsx');
				done();
			});
		});
	});

	describe('/gpsdata/GetAllEngineidleReport', function() {
		it('should get all engine idle report when query matches', function(done) {
			request(server)
			.get('/gpsdata/GetAllEngineidleReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'' + testGpsData1.DeviceId + '\'',
				TimeZone: 'Asia/Kuala_Lumpur',
				IdleSpeed: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0].Name).to.equal(testVehicle1.Name);
				done();
			});
		});

		it('should fail when query does not match', function(done) {
			request(server)
			.get('/gpsdata/GetAllEngineidleReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'\'',
				TimeZone: 'Asia/Kuala_Lumpur',
				IdleSpeed: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Requested Record(s) not Found....');
				expect(res.body.data).to.be.null;
				done();
			});
		});
	});

	describe('/gpsdata/GetAllDriverReport', function() {
		it('should get all driver report when query matches', function(done) {
			request(server)
			.get('/gpsdata/GetAllDriverReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'' + testGpsData1.DeviceId + '\'',
				TimeZone: 'Asia/Kuala_Lumpur'
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0].Name).to.equal(testVehicle1.Name);
				done();
			});
		});

		it('should fail when query does not match', function(done) {
			request(server)
			.get('/gpsdata/GetAllDriverReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'\'',
				TimeZone: 'Asia/Kuala_Lumpur'
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/gpsdata/ExportDriverReport', function() {
		it('should export driver report', function(done) {
			request(server)
			.get('/gpsdata/ExportAllWoringHourForReport')
			.query(qs.stringify({
				idUser: dUser.id,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'' + testGpsData1.DeviceId + '\'',
				TimeZone: 'Asia/Kuala_Lumpur'
			}))
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				expect(res.header['content-disposition']).to.equal('attachment; filename=WorkingHourReport.xlsx');
				done();
			});
		});
	});

	describe('/gpsdata/DeleteGPSdatabyVehicleId', function(req, res) {
		it('should delete gps data by vehicle ID when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/gpsdata/DeleteGPSdatabyVehicleId')
			.set('authorization', token)
			.query(qs.stringify({
				DeviceId: testVehicle1.deviceid,
				password: testOriginalPassword1,
				flg: true
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle Deleted Successfully');
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/gpsdata/DeleteGPSdatabyVehicleId')
			.query(qs.stringify({
				DeviceId: testVehicle1.deviceid,
				password: testOriginalPassword1,
				flg: true
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});
});