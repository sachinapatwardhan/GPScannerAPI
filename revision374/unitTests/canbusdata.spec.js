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
			server.close(done);
		});
	});

	describe('/canbusdata/GetAllCanbusData', function() {
		it('should get all canvas data by paging', function(done) {
			request(server)
			.get('/canbusdata/GetAllCanbusData')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Datetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'BatteryVoltage', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'EngineSpeed', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'RunningSpeed', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CoolantTemperature', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'ThrottleOpeningWidth', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'EngineLoad', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'InstantaneousFuelConsumption', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AverageFuelConsumption', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DrivingRange', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalMileage', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'SingleFuelConsumptionVolume', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalFuelConsumptionVolume', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CurrentErrorCodeNumbers', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'HarshAccelerationNo', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'HarshBrakeNo', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				DeviceId: '\'' + testCanvasData1.DeviceId + '\'',
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				idApp: testUser1.idApp,
				_: 1500000000000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});

		it('should get all canvas data by paging when searching', function(done) {
			request(server)
			.get('/canbusdata/GetAllCanbusData')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Datetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'BatteryVoltage', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'EngineSpeed', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'RunningSpeed', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CoolantTemperature', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'ThrottleOpeningWidth', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'EngineLoad', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'InstantaneousFuelConsumption', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AverageFuelConsumption', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DrivingRange', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalMileage', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'SingleFuelConsumptionVolume', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalFuelConsumptionVolume', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CurrentErrorCodeNumbers', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'HarshAccelerationNo', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'HarshBrakeNo', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testCanvasData1.Datetime,
				DeviceId: '\'' + testCanvasData1.DeviceId + '\'',
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				idApp: testUser1.idApp,
				_: 1500000000000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/canbusdata/ExportAllCanbusData', function() {
		it('should export all canvas data', function(done) {
			request(server)
			.get('/canbusdata/ExportAllCanbusData')
			.query(qs.stringify({
				idApp: testUser1.idApp,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'' + testGpsData1.DeviceId + '\'',
				TimeZone: 'Asia/Kuala_Lumpur'
			}))
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				expect(res.header['content-disposition']).to.equal('attachment; filename=CanbusData.xlsx');
				done();
			});
		});
	});

	describe('/canbusdata/GetAllDrivingBehavior', function() {
		it('should get all driving data by paging', function(done) {
			request(server)
			.get('/canbusdata/GetAllDrivingBehavior')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Datetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalIgnition', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalDrivingTime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalIdlingTime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AverageHotStartTime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AverageSpeed', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'HistoryHighestSpeed', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'HistoryHighestRotation', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalHarshAcceleration', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalHarshBrake', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				DeviceId: '\'' + testDrivingData1.DeviceId + '\'',
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				idApp: testUser1.idApp,
				_: 1500000000000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});

		it('should get all driving data by paging when searching', function(done) {
			request(server)
			.get('/canbusdata/GetAllDrivingBehavior')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Datetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalIgnition', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalDrivingTime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalIdlingTime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AverageHotStartTime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AverageSpeed', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'HistoryHighestSpeed', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'HistoryHighestRotation', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalHarshAcceleration', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalHarshBrake', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testDrivingData1.Datetime,
				DeviceId: '\'' + testDrivingData1.DeviceId + '\'',
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				idApp: testUser1.idApp,
				_: 1500000000000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/canbusdata/ExportAllDrivingData', function() {
		it('should export all driving data', function(done) {
			request(server)
			.get('/canbusdata/ExportAllDrivingData')
			.query(qs.stringify({
				idApp: testUser1.idApp,
				StartDate: moment.utc().startOf('month').format(),
				EndDate: moment.utc().endOf('month').format(),
				DeviceId: '\'' + testGpsData1.DeviceId + '\'',
				TimeZone: 'Asia/Kuala_Lumpur'
			}))
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				expect(res.header['content-disposition']).to.equal('attachment; filename=DrivingBehavior.xlsx');
				done();
			});
		});
	});
});