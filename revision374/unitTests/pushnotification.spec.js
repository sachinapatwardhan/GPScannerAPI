var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testPushNotification1 = {
	id: 0,
	udid: '1a2a3a4a5a6a7a8a',
	Platform: 'android',
	PushNotificationId: 'asjdsaoidjoi21ueoi21u3lk21nmelkn21n3o21joi3j21oi3n215h32v4jgc21421gf4d21d421fhhwiuh214hkj21o21h3kj21h958y21iunekjs',
	iduser: 0,
	Country: 'Malaysia',
	UserType: 'Android',
	MessageCount: 0
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

describe('/pushnotification', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var User;
	var Role;
	var UserRole;
	var Module;
	var Permission;
	var PushNotification;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;
	var dPushNotification;
	
	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		User = models.tbluserinformation;
		Role = models.tblrole;
		UserRole = models.tbluserinrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;
		PushNotification = models.tblpushnotification;

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
			testPushNotification1.iduser = dUser.id;
			return PushNotification.create(testPushNotification1);
		})
		.then(function(rPushNotification) {
			dPushNotification = rPushNotification;
			done();
		});
	});

	after(function(done) {
		dPushNotification.destroy()
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
			server.close(done);
		});
	});

	describe('/pushnotification/Subscribe', function() {
		it('should subscribe to push notifications', function(done) {
			request(server)
			.post('/pushnotification/Subscribe')
			.send(testPushNotification1)
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Subscribe successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('iduser').that.is.equal(dUser.id);
				done();
			});
		});
	});

	describe('/pushnotification/UpdateUserIdByUdid', function() {
		it('should update user ID when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/pushnotification/UpdateUserIdByUdid')
			.set('authorization', token)
			.query(qs.stringify({
				udid: testPushNotification1.udid,
				UserType: testPushNotification1.UserType,
				UserId: testPushNotification1.iduser
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Push notification data updated successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('iduser').that.is.equal(dUser.id.toString());
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/pushnotification/UpdateUserIdByUdid')
			.query(qs.stringify({
				udid: testPushNotification1.udid,
				UserType: testPushNotification1.UserType,
				UserId: testPushNotification1.iduser
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/pushnotification/UpdatePushnotificationCounter', function() {
		it('should set push notification counter to 0', function(done) {
			request(server)
			.get('/pushnotification/UpdatePushnotificationCounter')
			.query(qs.stringify({
				udid: testPushNotification1.udid,
				UserType: testPushNotification1.UserType
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Push notification data updated successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('affectedRows').that.is.equal(1);
				done();
			});
		});
	});

	describe('/pushnotification/SendPushNotification', function() {
		it('should send push notifications if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/pushnotification/SendPushNotification')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send({
				udid: testPushNotification1.udid,
				UserType: testPushNotification1.UserType,
				Country: 'Malaysia'
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Push Notification send Successfully.');
				expect(res.body.data).to.be.null;
				done();
			});
		});

		it('should fail if credentials or permissions are wrong', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/pushnotification/SendPushNotification')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('No Access Permission...');
				expect(res.body.data).to.equal('AccessPermission');
				done();
			});
		});
	});
});