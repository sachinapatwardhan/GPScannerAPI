var request = require('supertest');
var expect = require('chai').expect;
var qs = require('qs');

var testUser1 = {
	email: 'unittest.user@bugzstudio.com',
	username: 'unittest.user@bugzstudio.com',
	password: 'unittest.user',
	ProfileName: 'Unit Test User',
	IsMobileVerify: false,
	idApp: 1
};
var testOriginalPassword1 = testUser1.password;
var testAppInfo1 = {
	Id: 0,
	AppName: 'Test1',
	BundleId: 'com.disolutions.test1',
	IOSCertificate: '999999999999991.pem',
	IOSKey: '999999999999992.pem',
	AndroidId: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1',
	AndroidSenderId: '999999999991',
	CreatedDate: new Date(),
	CreatedBy: 'Admin',
	ImageLogo: '999999999999991.png'
};
var testAppVersion = {
	id: 0,
	Name: 'UnitTestAppVersion1',
	AndroidVersion: '0.0.1',
	AndroidURL: 'https://play.google.com/store/apps/details?id=com.disolutions.unittest1',
	IOSVersion: '0.0.1',
	IOSURL: 'https://itunes.apple.com/us/app/maark/id1234567890?ls=1&mt=8',
	UpdateAppText: 'A new app version is available!'
};
var testAppVersion2 = {
	id: 0,
	Name: 'UnitTestAppVersion2',
	AndroidVersion: '0.0.1',
	AndroidURL: 'https://play.google.com/store/apps/details?id=com.disolutions.unittest2',
	IOSVersion: '0.0.1',
	IOSURL: 'https://itunes.apple.com/us/app/maark/id1234567891?ls=1&mt=8',
	UpdateAppText: 'A new app version is available!'
};

describe('/appsetting', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var AppInfo;
	var AppVersion;
	var User;
	var dAppInfo;
	var dAppVersion;
	var dUser;

	before(function(done) {
		server = require('../server');
		
		AppInfo = models.tblappinfo;
		AppVersion = models.tblappversion;
		User = models.tbluserinformation;

		User.create(testUser1)
		.then(function(rUser) {
			dUser = rUser;
			return AppInfo.create(testAppInfo1);
		})
		.then(function(rAppInfo) {
			dAppInfo = rAppInfo;
			return AppVersion.create(testAppVersion);
		})
		.then(function(rAppVersion) {
			dAppVersion = rAppVersion;
			done();
		});
	});

	after(function(done) {
		dAppInfo.destroy()
		.then(function() {
			return dUser.destroy();
		})
		.then(function() {
			return AppVersion.destroy({
				where: {
					Name: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			server.close(done);
		});
	});
	
	describe('/appsetting/GetAllAppName', function() {
		it('should get all app names not in tblappversion', function(done) {
			request(server)
			.get('/appsetting/GetAllAppName')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/appsetting/GetAllAppVersion', function() {
		it('should get all app versions', function(done) {
			request(server)
			.get('/appsetting/GetAllAppVersion')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/appsetting/GetAppVersionByName', function() {
		it('should get app version by name', function(done) {
			request(server)
			.get('/appsetting/GetAppVersionByName')
			.query(qs.stringify({
				Name: testAppVersion.Name
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.property('id');
				expect(res.body.id).to.equal(dAppVersion.id);
				done();
			});
		});
	});

	describe('/appsetting/SaveAppVersionInfo', function() {
		it('should save app version if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.post('/appsetting/SaveAppVesionInfo')
			.set('authorization', token)
			.send(testAppVersion2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('App Version created successfully...');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});
	});

	describe('/appsetting/DeleteAppVersion', function() {
		it('should delete app version if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/appsetting/DeleteAppVersion')
			.set('authorization', token)
			.query(qs.stringify({
				Id: dAppVersion.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('App Version successfully...');
				done();
			});
		});

		it('should fail if credentials are wrong', function(done) {
			request(server)
			.get('/appsetting/DeleteAppVersion')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/appsetting/GetAllAppInfo', function() {
		it('should get all app info', function(done) {
			request(server)
			.get('/appsetting/GetAllAppInfo')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(1);
				done();
			});
		});
	});
});