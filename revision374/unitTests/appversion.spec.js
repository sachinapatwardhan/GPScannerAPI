var request = require('supertest');
var expect = require('chai').expect;
var qs = require('qs');

var testAppInfo2 = {
	AppName: 'Test2',
	BundleId: 'com.disolutions.test2',
	IOSCertificate: '999999999999993.pem',
	IOSKey: '999999999999994.pem',
	AndroidId: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2',
	AndroidSenderId: '999999999992',
	CreatedDate: new Date(),
	CreatedBy: 'Admin',
	ImageLogo: '999999999999992.png',
	AdminUrl: 'http://unittest.admin.maark.my',
	WebAppUrl: 'http://unittest.webapp.maark.my'
};
var testAppVersion = {
	id: 0,
	Name: 'Test2',
	AndroidVersion: '0.0.1',
	AndroidURL: 'https://play.google.com/store/apps/details?id=com.disolutions.test',
	IOSVersion: '0.0.1',
	IOSURL: 'https://itunes.apple.com/us/app/maark/id1234567890?ls=1&mt=8',
	UpdateAppText: 'A new app version is available!'
};

describe('/appversion', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var AppVersion;
	var AppInfo;

	var dAppVersion;
	var dAppInfo;

	before(function(done) {
		server = require('../server');
		AppVersion = models.tblappversion;
		AppInfo = models.tblappinfo;

		AppVersion.create(testAppVersion)
		.then(function(rAppVersion) {
			dAppVersion = rAppVersion;
			return AppInfo.create(testAppInfo2);
		})
		.then(function(rAppInfo) {
			dAppInfo = rAppInfo;
			done();
		});
	});

	after(function(done) {
		dAppVersion.destroy()
		.then(function() {
			return dAppInfo.destroy();
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/appversion/GetAppVersionByName', function() {
		it('should find app version when query string matches name', function(done) {
			request(server)
			.get('/appversion/GetAppVersionByName')
			.query(qs.stringify({
				Name: testAppVersion.Name
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object');
				done();
			});
		});

		it('should not find anything when query string does not match', function(done) {
			request(server)
			.get('/appversion/GetAppVersionByName')
			.query(qs.stringify({
				Name: 'supercalifragilisticexpialidocious'
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.be.null;
				done();
			});
		});
	});

	describe('/appversion/GetAppVersionByAppName', function() {
		it('should find app version and app info when query string matches name', function(done) {
			request(server)
			.get('/appversion/GetAppVersionByAppName')
			.query(qs.stringify({
				Name: testAppVersion.Name
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(1);
				done();
			});
		});

		it('should not find anything when query string does not match', function(done) {
			request(server)
			.get('/appversion/GetAppVersionByAppName')
			.query(qs.stringify({
				Name: 'supercalifragilisticexpialidocious'
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.lengthOf(0);
				done();
			});
		});
	});

	describe('/appversion/GetAppVersionByAppNameNew', function() {
		it('should find app version and app info when query string matches WebAppUrl', function(done) {
			request(server)
			.get('/appversion/GetAppVersionByAppNameNew')
			.query(qs.stringify({
				WebAppUrl: testAppInfo2.WebAppUrl
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object');
				done();
			});
		});

		it('should not find anything when query string does not match', function(done) {
			request(server)
			.get('/appversion/GetAppVersionByAppNameNew')
			.query(qs.stringify({
				Name: 'supercalifragilisticexpialidocious'
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.be.null;
				done();
			});
		});
	});
});