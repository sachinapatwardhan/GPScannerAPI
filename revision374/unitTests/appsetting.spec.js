var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

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
	Name: 'Test',
	AndroidVersion: '0.0.1',
	AndroidURL: 'https://play.google.com/store/apps/details?id=com.disolutions.test',
	IOSVersion: '0.0.1',
	IOSURL: 'https://itunes.apple.com/us/app/maark/id1234567890?ls=1&mt=8',
	UpdateAppText: 'A new app version is available!'
};
var testEmail = 'lenqxue95@gmail.com';
var testPassword = 'dino.saw';

describe('app settings', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var AppInfo;
	var AppVersion;
	var User;

	before(function() {
		server = require('../server', {
			bustCache: true
		});
		AppInfo = models.tblappinfo;
		AppVersion = models.tblappversion;
		User = models.tbluserinformation;
	});

	after(function(done) {
		server.close(done);
	});
	
	describe('/appsetting/GetAllAppName', function() {
		var dAppInfo;
		
		before(function(done) {
			AppInfo.create(testAppInfo1)
			.then(function(rAppInfo) {
				dAppInfo = rAppInfo;
				done();
			});
		});

		after(function(done) {
			dAppInfo.destroy()
			.then(function() {
				done();
			});
		});

		it('should get all app names not in tblappversion', function(done) {
			request(server)
			.get('/appsetting/GetAllAppName')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/appsetting/GetAllAppVersion', function() {
		var dAppVersion;

		before(function(done) {
			AppVersion.create(testAppVersion)
			.then(function(rAppVersion) {
				dAppVersion = rAppVersion;
				done();
			});
		});

		after(function(done) {
			dAppVersion.destroy()
			.then(function() {
				done();
			});
		});

		it('should get all app versions', function(done) {
			request(server)
			.get('/appsetting/GetAllAppVersion')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/appsetting/GetAppVersionByName', function() {
		var dAppVersion;

		before(function(done) {
			AppVersion.create(testAppVersion)
			.then(function(rAppVersion) {
				dAppVersion = rAppVersion;
				done();
			});
		});

		after(function(done) {
			dAppVersion.destroy()
			.then(function() {
				done();
			});
		});

		it('should get app version by name', function(done) {
			request(server)
			.get('/appsetting/GetAppVersionByName')
			.query(qs.stringify({
				Name: testAppVersion.Name
			}))
			.expect(200)
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
		var dUser;
		
		before(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				done();
			});
		});

		after(function(done) {
			dUser.destroy()
			.then(function() {
				return AppVersion.destroy({
					where: {
						Name: testAppVersion.Name,
						AndroidVersion: testAppVersion.AndroidVersion
					}
				});
			})
			.then(function() {
				done();
			});
		});

		it('should save app version if credentials are correct', function(done) {
			var token = jwt.encode({
				username: testEmail,
				password: jwt.encode(testPassword, 'bugz')
			}, 'bugz');
			token = 'JWT ' + token;

			request(server)
			.post('/appsetting/SaveAppVesionInfo')
			.set('authorization', token)
			.send(testAppVersion)
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('App Version created successfully...');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});
	});

	describe('/appsetting/DeleteAppVersion', function() {
		var dUser;
		var dAppVersion;
		
		before(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				return AppVersion.create(testAppVersion);
			})
			.then(function(rAppVersion) {
				dAppVersion = rAppVersion;
				done();
			});
		});

		after(function(done) {
			dUser.destroy()
			.then(function() {
				return AppVersion.destroy({
					where: {
						Name: testAppVersion.Name,
						AndroidVersion: testAppVersion.AndroidVersion
					}
				});
			})
			.then(function() {
				done();
			});
		});

		it('should delete app version if credentials are correct', function(done) {
			var token = jwt.encode({
				username: testEmail,
				password: jwt.encode(testPassword, 'bugz')
			}, 'bugz');
			token = 'JWT ' + token;

			request(server)
			.get('/appsetting/DeleteAppVersion')
			.set('authorization', token)
			.query(qs.stringify({
				Id: dAppVersion.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('App Version successfully...');
				done();
			});
		});

		it('should fail if credentials are wrong', function(done) {
			request(server)
			.get('/appsetting/DeleteAppVersion')
			.expect(200)
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

	describe('/appsetting/GetAllAppInfo', function() {
		var dAppInfo;
		
		before(function(done) {
			AppInfo.create(testAppInfo1)
			.then(function(rAppInfo) {
				dAppInfo = rAppInfo;
				done();
			});
		});

		after(function(done) {
			dAppInfo.destroy()
			.then(function() {
				done();
			});
		});

		it('should get all app info', function(done) {
			request(server)
			.get('/appsetting/GetAllAppInfo')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(1);
				done();
			});
		});
	});
});