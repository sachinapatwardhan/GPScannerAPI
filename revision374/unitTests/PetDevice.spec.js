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

describe('/PetDevice', function() {
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
		server = require('../server', {
			bustCache: true
		});

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
		// Remove downloaded file
		try {
			fs.unlinkSync(__dirname + '/UnitTestTrackersManagementTemplate.xlsx');
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/UnitTestTrackersManagementTemplate.xlsx');
		} catch (err) {}

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

	describe('/PetDevice/GetAllGPSDevice', function() {
		it('should get all gps device by paging', function(done) {
			request(server)
			.get('/PetDevice/GetAllGPSDevice')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Type', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IMEI', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Version', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'SerialNum', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'PhoneNum', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Name', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'ExpiryDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedBy', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				_: 1500000000000,
				UserId: dUser.id,
				AppName: testGpsDevice1.AppName
			}))
			.expect(200)
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
			.get('/PetDevice/GetAllGPSDevice')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Type', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IMEI', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Version', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'SerialNum', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'PhoneNum', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Name', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'ExpiryDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedBy', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testGpsData1.DeviceId,
				_: 1500000000000,
				UserId: dUser.id,
				AppName: testGpsDevice1.AppName
			}))
			.expect(200)
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

	describe('/PetDevice/ExportTracker', function() {
		it('should export tracker', function(done) {
			request(server)
			.get('/PetDevice/ExportTracker')
			.query(qs.stringify({
				AppName: testGpsDevice1.AppName,
				UserId: dUser.id,
				search: '',
				CurrentOffset: '+08:00'
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				expect(res.header['content-disposition']).to.equal('attachment; filename=GPSTracker.xlsx');
				done();
			});
		});
	});

	describe('/PetDevice/GetGPSDeviceById', function() {
		it('should get GPS device when IMEI matches', function(done) {
			request(server)
			.get('/PetDevice/GetGPSDeviceById')
			.query(qs.stringify({
				IMEI: testGpsDevice1.IMEI
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object').that.has.property('DeviceId').that.is.equal(testGpsDevice1.DeviceId);
				done();
			});
		});

		it('should fail when IMEI does not match', function(done) {
			request(server)
			.get('/PetDevice/GetGPSDeviceById')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.be.null;
				done();
			});
		});
	});

	describe('/PetDevice/SaveGPSDevice', function() {
		it('should save GPS device if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/PetDevice/SaveGPSDevice')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testGpsDevice2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Tracker created successfully...');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dGpsDevice2 = res.body.data[0];
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/PetDevice/SaveGPSDevice')
			.send(testGpsDevice2)
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

	describe('/PetDevice/UpdateStatus', function() {
		it('should update is active status when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/PetDevice/UpdateStatus')
			.set('authorization', token)
			.query(qs.stringify({
				IsActive: 1,
				id: dGpsDevice2.id,
				flg: true
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Tracker Status Updated successfully');
				expect(res.body.data).to.be.an('object').that.has.property('DeviceId').that.is.equal(testGpsDevice2.DeviceId);
				done();
			});
		});
	});

	describe('/PetDevice/DownloadTemplate', function() {
		it('should download template', function(done) {
			request(server)
			.get('/PetDevice/DownloadTemplate')
			.expect(200)
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats');
				expect(res.header['content-disposition']).to.equal('attachment; filename=TrackersManagement_Template.xlsx');
			})
			.pipe(fs.createWriteStream(__dirname + '/UnitTestTrackersManagementTemplate.xlsx'))
			.on('finish', done);
		});
	});

	describe('/PetDevice/uploadExcelDevice', function() {
		it('should upload device in excel format', function(done) {
			request(server)
			.post('/PetDevice/uploadExcelDevice')
			.attach('files[]', __dirname + '/../MediaUploads/UnitTest/UnitTestTrackersManagementTemplate.xlsx')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Excel File uploaded successfully..');
				done();
			});
		});

		it('should fail if excel file is protected', function(done) {
			request(server)
			.post('/PetDevice/uploadExcelDevice')
			.attach('files[]', __dirname + '/UnitTestTrackersManagementTemplate.xlsx')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Error in Import , Excel File is Protected..');
				done();
			});
		});
	});
});