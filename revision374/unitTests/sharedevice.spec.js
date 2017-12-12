var request = require('supertest');
var expect = require('chai').expect;
var qs = require('qs');

var testUser1 = {
	email: 'unittest.user1@bugzstudio.com',
	username: 'unittest.user1@bugzstudio.com',
	password: 'unittest.user1',
	ProfileName: 'UnitTestUser1',
	IsMobileVerify: false,
	idApp: 1
};
var testUser2 = {
	email: 'unittest.user2@bugzstudio.com',
	username: 'unittest.user2@bugzstudio.com',
	password: 'unittest.user2',
	ProfileName: 'UnitTestUser2',
	IsMobileVerify: false,
	idApp: 1
};
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
var testSharedDevice1 = {
	id: 0,
	idUser: 0,
	idSharedUser: 0,
	IsActive: true,
	idVehicle: 0,
	CreatedBy: 'UnitTest1',
	CreatedDate: new Date(),
	DeviceId: '1234567890123x',
	IsSharedUserNotification: true,
	IsNotification: true
};
var testSharedDevice2 = {
	id: 0,
	idUser: 0,
	idSharedUser: 0,
	IsActive: true,
	idVehicle: 0,
	CreatedBy: 'UnitTest1',
	CreatedDate: new Date(),
	DeviceId: '1234567890124x',
	IsSharedUserNotification: true,
	IsNotification: true
};
var testSharedEmail1 = {
	Id: 0,
	DeviceId: '1234567890123x',
	idUser: 0,
	SharedEmail: 'unittest.user2@bugzstudio.com',
	Status: 'Pending',
	CreatedDate: new Date()
};
var testSharedEmail2 = {
	Id: 0,
	DeviceId: '1234567890123x',
	idUser: 0,
	SharedEmail: 'unittest.user3@bugzstudio.com',
	Status: 'Pending',
	CreatedDate: new Date()
};
var testAppInfo1 = {
	Id: 0,
	AppName: 'UnitTestAppInfo1',
	BundleId: 'com.disolutions.unittestappinfo1',
	IOSCertificate: null,
	IOSKey: null,
	AndroidId: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1',
	AndroidSenderId: '999999999991',
	CreatedDate: new Date(),
	CreatedBy: 'Admin',
	ImageLogo: null,
	AdminUrl: 'http://unittestadmin1.maark.my',
	WebAppUrl: 'http://unittestwebapp1.maark.my',
	WebAppLoginLogo: null,
	WebAppHeaderLogo: null
};

describe('/sharedevice', function() {
	this.timeout(5000);
	
	var server;
	var User;
	var Vehicle;
	var SharedDevice;
	var SharedEmail;
	var AppInfo;
	var dUser;
	var dUser2;
	var dVehicle;
	var dSharedDevice;
	var dSharedDevice2;
	var dSharedEmail;
	var dAppInfo;

	before(function(done) {
		server = require('../server');
		
		User = models.tbluserinformation;
		Vehicle = models.tblvehicle;
		SharedDevice = models.tblsharedevice;
		SharedEmail = models.tblsharedemail;
		AppInfo = models.tblappinfo;

		User.create(testUser1)
		.then(function(rUser) {
			dUser = rUser;
			return User.create(testUser2);
		})
		.then(function(rUser) {
			dUser2 = rUser;
			testVehicle1.iduser = dUser.id;
			return Vehicle.create(testVehicle1);
		})
		.then(function(rVehicle) {
			dVehicle = rVehicle;
			testSharedDevice1.idUser = dUser.id;
			testSharedDevice1.idSharedUser = dUser2.id;
			return SharedDevice.create(testSharedDevice1);
		})
		.then(function(rSharedDevice) {
			dSharedDevice = rSharedDevice;
			testSharedEmail1.idUser = dUser2.id;
			return SharedEmail.create(testSharedEmail1);
		})
		.then(function(rSharedEmail) {
			dSharedEmail = rSharedEmail;
			return AppInfo.create(testAppInfo1);
		})
		.then(function(rAppInfo) {
			dAppInfo = rAppInfo;
			done();
		});
	});

	after(function(done) {
		dAppInfo.destroy()
		.then(function() {
			return SharedDevice.destroy({
				where: {
					CreatedBy: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			return SharedEmail.destroy({
				where: {
					DeviceId: '1234567890123x'
				}
			});
		})
		.then(function() {
			return dSharedDevice.destroy();
		})
		.then(function() {
			return dVehicle.destroy();
		})
		.then(function() {
			return dUser2.destroy();
		})
		.then(function() {
			return dUser.destroy();
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/sharedevice/GetAllSharedDeviceByUser', function() {
		it('should get all shared device by user', function(done) {
			request(server)
			.get('/sharedevice/GetAllSharedDeviceByUser')
			.query(qs.stringify({
				DeviceId: testSharedDevice1.DeviceId,
				idSharedUser: dUser2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0]).to.be.an('object').that.has.property('CreatedBy').that.is.equal(testSharedDevice1.CreatedBy);
				done();
			});
		});

		it('should fail when no shared device found', function(done) {
			request(server)
			.get('/sharedevice/GetAllSharedDeviceByUser')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/sharedevice/GetAllSharedDeviceByUserNew', function() {
		it('should get all shared device by user', function(done) {
			request(server)
			.get('/sharedevice/GetAllSharedDeviceByUserNew')
			.query(qs.stringify({
				DeviceId: testSharedDevice1.DeviceId,
				idSharedUser: dUser2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.lstSharedUser).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.lstSharedUser[0]).to.be.an('object').that.has.property('CreatedBy').that.is.equal(testSharedDevice1.CreatedBy);
				expect(res.body.lstSharedInvite).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.lstSharedInvite[0]).to.have.property('SharedEmail').that.is.equal(testSharedEmail1.SharedEmail);
				done();
			});
		});
		
		it('should fail when no shared device found', function(done) {
			request(server)
			.get('/sharedevice/GetAllSharedDeviceByUserNew')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.lstSharedUser).to.be.an('array').that.has.lengthOf(0);
				expect(res.body.lstSharedInvite).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/sharedevice/SaveSharedUserNew', function() {
		it('should save shared device if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testSharedDevice2.email = testUser1.email;
			testSharedDevice2.idApp = testUser1.idApp;

			request(server)
			.post('/sharedevice/SaveSharedUserNew')
			.set('authorization', token)
			.send(testSharedDevice2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle Shared successfully...');
				expect(res.body.data).to.be.an('object');
				dSharedDevice2 = res.body.data;
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/sharedevice/SaveSharedUserNew')
			.send(testSharedDevice2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/sharedevice/GetAllInvitedEmail', function() {
		it('should get all invited email', function(done) {
			request(server)
			.get('/sharedevice/GetAllInvitedEmail')
			.query(qs.stringify({
				DeviceId: testSharedEmail1.DeviceId
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0]).to.be.an('object').that.has.property('SharedEmail').that.is.equal(testSharedEmail1.SharedEmail);
				done();
			});
		});
		
		it('should fail when no invited emails found', function(done) {
			request(server)
			.get('/sharedevice/GetAllInvitedEmail')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/sharedevice/InvitedNewUser', function() {
		it('should invite new user when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testSharedEmail2.AppName = testAppInfo1.AppName;
			
			request(server)
			.post('/sharedevice/InvitedNewUser')
			.set('authorization', token)
			.send(testSharedEmail2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Invitation email send to this user successfully');
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/sharedevice/InvitedNewUser')
			.send(testSharedEmail2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/sharedevice/ChangeSharedNotificationSetting', function() {
		it('should change shared notification setting when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/sharedevice/ChangeSharedNotificationSetting')
			.set('authorization', token)
			.query(qs.stringify(dSharedDevice2))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Main Notification Setting Changed Successfully.');
				done();
			});
		});
		
		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/sharedevice/ChangeSharedNotificationSetting')
			.query(qs.stringify(dSharedDevice2))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/sharedevice/ChangeNotificationSetting', function() {
		it('should change notification setting when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/sharedevice/ChangeNotificationSetting')
			.set('authorization', token)
			.query(qs.stringify(dSharedDevice2))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Notification Setting Changed Successfully.');
				done();
			});
		});
		
		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/sharedevice/ChangeNotificationSetting')
			.query(qs.stringify(dSharedDevice2))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/sharedevice/RemoveSharedUser', function() {
		it('should remove shared user when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/sharedevice/RemoveSharedUser')
			.set('authorization', token)
			.query(qs.stringify(dSharedDevice2))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Removed successfully...');
				done();
			});
		});
		
		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/sharedevice/RemoveSharedUser')
			.query(qs.stringify(dSharedDevice2))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/sharedevice/RejectSharedInvitation', function() {
		it('should reject shared invitation when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/sharedevice/RejectSharedInvitation')
			.set('authorization', token)
			.query(qs.stringify({
				Id: dSharedEmail.Id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Removed successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('SharedEmail').that.is.equal(testSharedEmail1.SharedEmail);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/sharedevice/RejectSharedInvitation')
			.query(qs.stringify({
				Id: dSharedEmail.Id
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