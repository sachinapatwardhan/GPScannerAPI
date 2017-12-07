var require = require('really-need');
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
var testServiceEnhancementType1 = {
	id: 0,
	Type: 'UnitTestServiceEnhancementType1',
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null
};
var testServiceEnhancementNotification1 = {
	Id: 0,
	IdServiceEnhancement: 0,
	idvehicle: 0,
	CreatedDate: new Date(),
	Message: 'UnitTestMessage1',
	days: 0,
	IsRead: false
};
var testServiceEnhancement1 = {
	id: 0,
	idvehicle: 0,
	idUser: 0,
	DeviceId: testVehicle1.deviceid,
	Type: testServiceEnhancementType1.Type,
	Fromdate: new Date(),
	Todate: new Date(),
	IsActive: true,
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null,
	Title: 'UnitTestServiceEnhancement1',
	Description: 'UnitTestServiceEnhancement1',
	Currentkm: 0,
	Expiredkm: 0,
	IsDelete: false
};
var testServiceEnhancement2 = {
	id: 0,
	idvehicle: 0,
	idUser: 0,
	DeviceId: testVehicle1.deviceid,
	Type: testServiceEnhancementType1.Type,
	Fromdate: new Date(),
	Todate: new Date(),
	IsActive: true,
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null,
	Title: 'UnitTestServiceEnhancement2',
	Description: 'UnitTestServiceEnhancement2',
	Currentkm: 0,
	Expiredkm: 0,
	IsDelete: false
};
var testUser1 = {
	email: 'unittest.user@bugzstudio.com',
	username: 'unittest.user@bugzstudio.com',
	password: 'unittest.user',
	ProfileName: 'UnitTestUser1',
	IsMobileVerify: false,
	idApp: 1
};

describe('/serviceenhancement', function() {
	this.timeout(5000);

	var server;
	var User;
	var ServiceEnhancement;
	var ServiceEnhancementType;
	var Vehicle;
	var ServiceEnhancementNotification;
	var dUser;
	var dServiceEnhancement;
	var dServiceEnhancementType;
	var dVehicle;
	var dServiceEnhancementNotification;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		User = models.tbluserinformation;
		ServiceEnhancement = models.tblserviceenhancement;
		ServiceEnhancementType = models.tblserviceenhancementtype;
		Vehicle = models.tblvehicle;
		ServiceEnhancementNotification = models.tblserviceenhancementnotification;
		
		User.create(testUser1)
		.then(function(rUser) {
			dUser = rUser;
			testVehicle1.iduser = dUser.id;
			return Vehicle.create(testVehicle1);
		})
		.then(function(rVehicle) {
			dVehicle = rVehicle;
			return ServiceEnhancementType.create(testServiceEnhancementType1);
		})
		.then(function(rServiceEnhancementType) {
			dServiceEnhancementType = rServiceEnhancementType;
			testServiceEnhancement1.idvehicle = dVehicle.id;
			testServiceEnhancement1.idUser = dUser.id;
			return ServiceEnhancement.create(testServiceEnhancement1);
		})
		.then(function(rServiceEnhancement) {
			dServiceEnhancement = rServiceEnhancement;
			testServiceEnhancementNotification1.idvehicle = dVehicle.id;
			testServiceEnhancementNotification1.IdServiceEnhancement = dServiceEnhancement.id;
			return ServiceEnhancementNotification.create(testServiceEnhancementNotification1);
		})
		.then(function(rServiceEnhancementNotification) {
			dServiceEnhancementNotification = rServiceEnhancementNotification;
			done();
		});
	});

	after(function(done) {
		ServiceEnhancementNotification.destroy({ where: { Message: { $like: 'UnitTest%' } } })
		.then(function() {
			return ServiceEnhancement.destroy({ where: { Title: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return ServiceEnhancementType.destroy({ where: { Type: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return Vehicle.destroy({ where: { Name: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return User.destroy({ where: { username: { $like: 'unittest%' } } });
		})
		.then(function() {
			done();
		});
	});

	describe('/serviceenhancement/GetAllServiceEnhacementType', function() {
		it('should get all service enhancement types', function(done) {
			request(server)
			.get('/serviceenhancement/GetAllServiceEnhacementType')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/serviceenhancement/GetAllServiceData', function() {
		it('should get all service data when query matches', function(done) {
			request(server)
			.get('/serviceenhancement/GetAllServiceData')
			.query(qs.stringify({
				DeviceId: testServiceEnhancement1.DeviceId,
				idUser: testServiceEnhancement1.idUser,
				page: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0]).to.have.property('Title').that.is.equal(testServiceEnhancement1.Title);
				done();
			});
		});

		it('should fail when query does not match', function(done) {
			request(server)
			.get('/serviceenhancement/GetAllServiceData')
			.query(qs.stringify({
				DeviceId: '',
				idUser: 0,
				page: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/serviceenhancement/getAllServiceNotification', function() {
		it('should get all service notification when query matches', function(done) {
			request(server)
			.get('/serviceenhancement/getAllServiceNotification')
			.query(qs.stringify({
				DeviceId: testServiceEnhancement1.DeviceId,
				idUser: testServiceEnhancement1.idUser,
				page: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0]).to.have.property('Message').that.is.equal(testServiceEnhancementNotification1.Message);
				done();
			});
		});

		it('should fail when query does not match', function(done) {
			request(server)
			.get('/serviceenhancement/getAllServiceNotification')
			.query(qs.stringify({
				DeviceId: '',
				idUser: 0,
				page: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/serviceenhancement/SaveService', function() {
		it('should save service when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testServiceEnhancement2.Fromdate = new Date().toUTCString().replace(/\sGMT/g, '');
			testServiceEnhancement2.Todate = new Date().toUTCString().replace(/\sGMT/g, '');
			
			request(server)
			.post('/serviceenhancement/SaveService')
			.set('authorization', token)
			.send(testServiceEnhancement2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Service Save Successfully');
				expect(res.body.err).to.equal(null);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/serviceenhancement/SaveService')
			.send(testServiceEnhancement2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/serviceenhancement/DeleteRemiderService', function() {
		it('should delete reminder service if it exists', function(done) {
			request(server)
			.get('/serviceenhancement/DeleteRemiderService')
			.query(qs.stringify({
				id: dServiceEnhancement.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Reminder service deleted Successfully');
				expect(res.body.err).to.equal(null);
				done();
			});
		});

		it('should fail if reminder service does not exist', function(done) {
			request(server)
			.get('/serviceenhancement/DeleteRemiderService')
			.query(qs.stringify({
				id: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Reminder service not Exist');
				expect(res.body.err).to.equal(null);
				done();
			});
		});
	});

	describe('/serviceenhancement/UpdateReadStatus', function() {
		it('should update read status when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/serviceenhancement/UpdateReadStatus')
			.set('authorization', token)
			.send([
				dServiceEnhancementNotification.Id
			])
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.data[0]).to.equal(1);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/serviceenhancement/UpdateReadStatus')
			.send([
				dServiceEnhancementNotification.Id
			])
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