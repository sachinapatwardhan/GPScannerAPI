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
var testSim1 = {
	id: 0,
	SerialNum: '1234567890123',
	PhoneNum: '01234576789',
	CreatedDate: new Date(),
	idTelCo: null
};
var testSim2 = {
	id: 0,
	SerialNum: '1234567890124',
	PhoneNum: '01234576790',
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

describe('/sim', function() {
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
	var dSim2;

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
		try {
			fs.unlinkSync(__dirname + '/UnitTestSimTemplate.xlsx');
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/UnitTestSimTemplate.xlsx');
		} catch (err) {}

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
			return Sim.destroy({
				where: {
					SerialNum: testSim2.SerialNum,
					PhoneNum: testSim2.PhoneNum
				}
			});
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/sim/GetAllSIMInfo', function() {
		it('should get all SIM info', function(done) {
			request(server)
			.get('/sim/GetAllSIMInfo')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/sim/SaveSIMInfo', function() {
		it('should save SIM info if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testSim2.Id = 0;

			request(server)
			.post('/sim/SaveSIMInfo')
			.set('authorization', token)
			.send(testSim2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('SIM Info created successfully...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dSim2 = res.body.data[0];
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/sim/SaveSIMInfo')
			.send(testSim2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/sim/DeleteSIMInfo', function() {
		it('should delete SIM info when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/sim/DeleteSIMInfo')
			.set('authorization', token)
			.query(qs.stringify({
				Id: dSim2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('SIM deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/sim/DeleteSIMInfo')
			.query(qs.stringify({
				idRole: 0
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

	describe('/sim/DownloadTemplate', function() {
		it('should download template', function(done) {
			request(server)
			.get('/sim/DownloadTemplate')
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats');
				expect(res.header['content-disposition']).to.equal('attachment; filename=SIM_Template.xlsx');
			})
			.pipe(fs.createWriteStream(__dirname + '/UnitTestSimTemplate.xlsx'))
			.on('finish', done);
		});
	});

	describe('/sim/uploadExcelDevice', function() {
		it('should upload device in excel format', function(done) {
			request(server)
			.post('/sim/uploadExcelDevice')
			.set('x-requested-with', 'tblsimdetails')
			.attach('files[]', __dirname + '/../MediaUploads/UnitTest/UnitTestSimTemplate.xlsx')
			.field('idTelCo', 0)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Excel File uploaded successfully..Failed To Import : 1');
				done();
			});
		});

		it('should fail if excel file is protected', function(done) {
			request(server)
			.post('/sim/uploadExcelDevice')
			.set('x-requested-with', 'tblsimdetails')
			.attach('files[]', __dirname + '/UnitTestSimTemplate.xlsx')
			.field('idTelCo', 0)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Error in Import , Excel File is Protected..');
				done();
			});
		});
	});

	describe('/sim/Export', function() {
		it('should export SIM details', function(done) {
			request(server)
			.get('/sim/Export')
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats');
				expect(res.header['content-disposition']).to.equal('attachment; filename=SIM.xlsx');
				done();
			});
		});
	});
});