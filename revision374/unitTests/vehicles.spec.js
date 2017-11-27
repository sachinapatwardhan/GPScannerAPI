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
	IsOnline: true,
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
var testVehicle3 = {
	id: 0,
	iduser: 0,
	Name: 'UnitTestVehicle3',
	deviceid: '1234567890125x',
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
var testGpsDevice2 = {
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
var testDefaultValue1 = {
	id: 0,
	Type: 'UnitTestType1',
	Value: 0
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
var testUser1 = {
	email: 'unittest.user@bugzstudio.com',
	username: 'unittest.user@bugzstudio.com',
	password: 'unittest.user',
	ProfileName: 'Unit Test User',
	phone: '1234567890',
	IsMobileVerify: false,
	idApp: 1
};

describe('/vehicles', function() {
	this.timeout(5000);

	var server;
	var Vehicle;
	var VehicleType;
	var GpsDevice;
	var DrivingData;
	var GpsData;
	var DefaultValue;
	var Fence;
	var User;
	var dVehicle;
	var dVehicle2;
	var dVehicle3;
	var dVehicleType;
	var dGpsDevice;
	var dGpsDevice2;
	var dDrivingData;
	var dGpsData;
	var dDefaultValue;
	var dFence;
	var dUser;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		Vehicle = models.tblvehicle;
		VehicleType = models.tblvehicletype;
		GpsDevice = models.tblgpsdevice;
		DrivingData = models.tbldrivingdata;
		GpsData = models.tblgpsdata;
		DefaultValue = models.tbldefaultvalue;
		Fence = models.tblfence;
		User = models.tbluserinformation;

		User.create(testUser1)
		.then(function(rUser) {
			dUser = rUser;
			return VehicleType.create(testVehicleType1);
		})
		.then(function(rVehicleType) {
			dVehicleType = rVehicleType;
			testVehicle1.iduser = dUser.id;
			testVehicle1.idType = dVehicleType.id;
			return Vehicle.create(testVehicle1);			
		})
		.then(function(rVehicle) {
			dVehicle = rVehicle;
			return GpsDevice.create(testGpsDevice1);
		})
		.then(function(rGpsDevice) {
			dGpsDevice = rGpsDevice;
			return GpsDevice.create(testGpsDevice2);
		})
		.then(function(rGpsDevice) {
			dGpsDevice2 = rGpsDevice;
			testVehicle3.iduser = dUser.id;
			return Vehicle.create(testVehicle3);
		})
		.then(function(rVehicle) {
			dVehicle3 = rVehicle;
			return DrivingData.create(testDrivingData1);
		})
		.then(function(rDrivingData) {
			dDrivingData = rDrivingData;
			return GpsData.create(testGpsData1);
		})
		.then(function(rGpsData) {
			dGpsData = rGpsData;
			return DefaultValue.create(testDefaultValue1);
		})
		.then(function(rDefaultValue) {
			dDefaultValue = rDefaultValue;
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
			return dDefaultValue.destroy();
		})
		.then(function() {
			return dGpsData.destroy();
		})
		.then(function() {
			return dDrivingData.destroy();
		})
		.then(function() {
			return dGpsDevice2.destroy();
		})
		.then(function() {
			return dGpsDevice.destroy();
		})
		.then(function() {
			return dVehicle.destroy();
		})
		.then(function() {
			return dVehicleType.destroy();
		})
		.then(function() {
			return Vehicle.destroy({
				where: {
					Name: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			return dUser.destroy();
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/vehicles/GetAllDynamicVehicle', function() {
		it('should get all vehicles by paging', function(done) {
			request(server)
			.get('/vehicles/GetAllDynamicVehicle')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'username', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Name', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'deviceid', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceType', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsOnline', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				appId: testUser1.idApp,
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

		it('should get all vehicles by paging when searching', function(done) {
			request(server)
			.get('/vehicles/GetAllDynamicVehicle')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'username', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Name', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'deviceid', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceType', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsOnline', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testUser1.username,
				appId: testUser1.idApp,
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

	describe('/vehicles/SaveVehicle', function() {
		it('should save vehicle if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testVehicle2.iduser = dUser.id;

			request(server)
			.post('/vehicles/SaveVehicle')
			.set('authorization', token)
			.send(testVehicle2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle Detail created successfully...');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dVehicle2 = res.body.data[0];
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/vehicles/SaveVehicle')
			.send(testVehicle2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/vehicles/DeleteVehicle', function() {
		it('should delete vehicle when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/vehicles/DeleteVehicle')
			.set('authorization', token)
			.query(qs.stringify({
				id: dVehicle3.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle Deleted Successfully');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/vehicles/DeleteVehicle')
			.query(qs.stringify({
				id: 0
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

	describe('/vehicles/GetAllVehicleByUser', function() {
		it('should get all vehicles by user', function(done) {
			request(server)
			.get('/vehicles/GetAllVehicleByUser')
			.query(qs.stringify({
				iduser: testVehicle1.iduser
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(3);
				done();
			});
		});

		it('should fail when no vehicles found', function(done) {
			request(server)
			.get('/vehicles/GetAllVehicleByUser')
			.query(qs.stringify({
				iduser: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/vehicles/GetAllVehicleById', function() {
		it('should get all vehicles by ID', function(done) {
			request(server)
			.get('/vehicles/GetAllVehicleById')
			.query(qs.stringify({
				id: dVehicle.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object').that.has.property('Name').that.is.equal(testVehicle1.Name);
				done();
			});
		});

		it('should fail when vehicle not found', function(done) {
			request(server)
			.get('/vehicles/GetAllVehicleById')
			.query(qs.stringify({
				id: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.be.null;
				done();
			});
		});
	});

	describe('/vehicles/GetDrivingDataByDeviceId', function() {
		it('should get driving data by device ID', function(done) {
			request(server)
			.get('/vehicles/GetDrivingDataByDeviceId')
			.query(qs.stringify({
				DeviceId: testDrivingData1.DeviceId
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('object').that.has.property('Datetime').that.is.equal(testDrivingData1.Datetime);
				done();
			});
		});

		it('should fail when driving data not found', function(done) {
			request(server)
			.get('/vehicles/GetDrivingDataByDeviceId')
			.query(qs.stringify({
				DeviceId: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.null;
				done();
			});
		});
	});

	describe('/vehicles/GetVehicleCurrentLocation', function() {
		it('should get gps data by device ID', function(done) {
			request(server)
			.get('/vehicles/GetVehicleCurrentLocation')
			.query(qs.stringify({
				DeviceId: testGpsData1.DeviceId
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('object').that.has.property('Date').that.is.equal(testGpsData1.Date);
				done();
			});
		});

		it('should fail when gps data not found', function(done) {
			request(server)
			.get('/vehicles/GetVehicleCurrentLocation')
			.query(qs.stringify({
				DeviceId: ''
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

	describe('/vehicles/GetAllOnlineVehicle', function() {
		it('should get all online vehicles by paging', function(done) {
			request(server)
			.get('/vehicles/GetAllOnlineVehicle')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Name', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'deviceid', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceType', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsOnline', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				appId: testUser1.idApp,
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

		it('should get all online vehicles by paging when searching', function(done) {
			request(server)
			.get('/vehicles/GetAllOnlineVehicle')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Name', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'deviceid', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceType', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsOnline', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testUser1.username,
				appId: testUser1.idApp,
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

	describe('/vehicles/getAllDefaultValue', function() {
		it('should get all default values', function(done) {
			request(server)
			.get('/vehicles/getAllDefaultValue')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/vehicles/UpdateDefultValue', function() {
		it('should update default value when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/vehicles/UpdateDefultValue')
			.set('authorization', token)
			.query(qs.stringify({
				Type: testDefaultValue1.Type,
				Value: testDefaultValue1.Value
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal(' updated successfully');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/vehicles/UpdateDefultValue')
			.query(qs.stringify({
				Type: testDefaultValue1.Type,
				Value: testDefaultValue1.Value
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

	describe('/vehicles/GetAllNotAssignDevice', function() {
		it('should get all device that are not assigned', function(done) {
			request(server)
			.get('/vehicles/GetAllNotAssignDevice')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/vehicles/TransferDevicetoUser', function() {
		it('should transfer device to user when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/vehicles/TransferDevicetoUser')
			.set('authorization', token)
			.query(qs.stringify({
				deviceid: testVehicle1.deviceid,
				id: dVehicle.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Device Transfer successfully..');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/vehicles/TransferDevicetoUser')
			.query(qs.stringify({
				deviceid: testVehicle1.deviceid,
				id: dVehicle.id
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

	describe('/vehicles/GetAllNotUseDevcie', function() {
		it('should get all devices that are not in use', function(done) {
			request(server)
			.get('/vehicles/GetAllNotUseDevcie')
			.query(qs.stringify({
				UserId: dUser.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});
});