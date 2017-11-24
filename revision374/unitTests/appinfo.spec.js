var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

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
var testAppInfo2 = {
	Id: 0,
	AppName: 'UnitTestAppInfo2',
	BundleId: 'com.disolutions.unittestappinfo2',
	IOSCertificate: '999999999999993.pem',
	IOSKey: '999999999999994.pem',
	AndroidId: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2',
	AndroidSenderId: '999999999992',
	CreatedDate: new Date(),
	CreatedBy: 'Admin',
	ImageLogo: '999999999999992.png',
	AdminUrl: 'http://unittestadmin1.maark.my',
	WebAppUrl: 'http://unittestwebapp1.maark.my',
	WebAppLoginLogo: null,
	WebAppHeaderLogo: null
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

describe('/appinfo', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var User;
	var AppInfo;
	var dUser;
	var dAppInfo;
	var dAppInfo2;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});
		
		User = models.tbluserinformation;
		AppInfo = models.tblappinfo;

		fs.writeFileSync(__dirname + '/../MediaUploads/FileUpload/UnitTestImageLogo.png');
		fs.writeFileSync(__dirname + '/../MediaUploads/FileUpload/UnitTestLoginLogo.png');
		fs.writeFileSync(__dirname + '/../MediaUploads/FileUpload/UnitTestHeaderLogo.png');
		fs.writeFileSync(__dirname + '/../MediaUploads/FileUpload/UnitTestIosCertificate.pem');
		fs.writeFileSync(__dirname + '/../MediaUploads/FileUpload/UnitTestIosKey.pem');

		AppInfo.create(testAppInfo1)
		.then(function(rAppInfo) {
			dAppInfo = rAppInfo;
			testUser1.password = jwt.encode(testUser1.password, 'bugz');
			return User.create(testUser1);
		})
		.then(function(rUser) {
			dUser = rUser;
			done();
		});
	});

	after(function(done) {
		fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/UnitTestImageLogo.png');
		fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/UnitTestLoginLogo.png');
		fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/UnitTestHeaderLogo.png');
		fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/UnitTestIosCertificate.pem');
		fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/UnitTestIosKey.pem');
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + dAppInfo2.ImageLogo);
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + dAppInfo2.WebAppLoginLogo);
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + dAppInfo2.WebAppHeaderLogo);
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + dAppInfo2.IOSCertificate);
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + dAppInfo2.IOSKey);
		} catch (err) {}

		dUser.destroy()
		.then(function() {
			return AppInfo.destroy({
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

	describe('/appinfo/GetAllAppInfo', function() {
		it('should get all app info with status 200 when not searching', function(done) {
			request(server)
			.get('/appinfo/GetAllAppInfo')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'Id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AppName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'BundleId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IOSCertificate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IOSKey', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AndroidId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AndroidSenderId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedBy', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 2, dir: 'asc' }
				],
				start: 0,
				length: 25,
				_: 1500000000000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.draw).to.equal('1');
				expect(res.body.recordsTotal).to.be.above(1);
				expect(res.body.recordsFiltered).to.be.above(1);
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});

		it('should get matched app info with status 200 when searching', function(done) {
			request(server)
			.get('/appinfo/GetAllAppInfo')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'Id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AppName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'BundleId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IOSCertificate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IOSKey', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AndroidId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AndroidSenderId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedBy', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testAppInfo1.AppName,
				_: 1500000000000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.draw).to.equal('1');
				expect(res.body.recordsTotal).to.equal(1);
				expect(res.body.recordsFiltered).to.equal(1);
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				done();
			});
		});

		it('should fail with status 200 when searching with SQL injection', function(done) {
			request(server)
			.get('/appinfo/GetAllAppInfo')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'Id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AppName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'BundleId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IOSCertificate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IOSKey', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AndroidId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AndroidSenderId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedBy', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '" or ""="',
				_: 1500000000000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.draw).to.equal('1');
				expect(res.body.recordsTotal).to.equal(0);
				expect(res.body.recordsFiltered).to.equal(0);
				expect(res.body.data).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/appinfo/GetAllInfoList', function() {
		it('should return all app info id and AppName', function(done) {
			request(server)
			.get('/appinfo/GetAllInfoList')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/appinfo/SaveAppInfo', function() {
		it('should save app info when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.post('/appinfo/SaveAppInfo')
			.set('authorization', token)
			.send(testAppInfo2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('App Info created successfully...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dAppInfo2 = res.body.data[0];
				done();
			});
		});
		
		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/appinfo/SaveAppInfo')
			.send(testAppInfo2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/appinfo/DeleteAppInfo', function() {
		it('should delete app info when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/appinfo/DeleteAppInfo')
			.set('authorization', token)
			.query(qs.stringify({
				Id: dAppInfo.Id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('App Info Deleted Successfully');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/appinfo/DeleteAppInfo')
			.query(qs.stringify({
				Id: 0
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

	describe('/appinfo/uploadFile', function() {
		it('should upload files', function(done) {
			request(server)
			.post('/appinfo/uploadFile')
			.attach(dAppInfo2.Id + ',logo', __dirname + '/../MediaUploads/FileUpload/UnitTestImageLogo.png')
			.attach(dAppInfo2.Id + ',Loginlogo', __dirname + '/../MediaUploads/FileUpload/UnitTestLoginLogo.png')
			.attach(dAppInfo2.Id + ',Headerlogo', __dirname + '/../MediaUploads/FileUpload/UnitTestHeaderLogo.png')
			.attach(dAppInfo2.Id + ',IC', __dirname + '/../MediaUploads/FileUpload/UnitTestIosCertificate.pem')
			.attach(dAppInfo2.Id + ',IK', __dirname + '/../MediaUploads/FileUpload/UnitTestIosKey.pem')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('File Uploaded Successfully...');
				expect(res.body.data).to.be.an('object');
				dAppInfo2 = res.body.data;
				done();
			});
		});
	});

	describe('/appinfo/GetAppInfoByName', function() {
		it('should get app info when name is matching', function(done) {
			request(server)
			.get('/appinfo/GetAppInfoByName')
			.query(qs.stringify({
				AppName: testAppInfo2.AppName
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object');
				expect(res.body.BundleId).to.equal(testAppInfo2.BundleId);
				done();
			});
		});

		it('should not get app info when name does not match', function(done) {
			request(server)
			.get('/appinfo/GetAppInfoByName')
			.query(qs.stringify({
				AppName: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.be.null;
				done();
			});
		});
	});

	describe('/appinfo/GetAppInfoByAdmin', function() {
		it('should find app info like query string', function(done) {
			request(server)
			.get('/appinfo/GetAppInfoByAdmin')
			.query(qs.stringify({
				AdminUrl: testAppInfo2.AdminUrl
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object');
				done();
			});
		});

		it('should not find anything if query string does not match', function(done) {
			request(server)
			.get('/appinfo/GetAppInfoByAdmin')
			.query(qs.stringify({
				AdminUrl: 'supercalifragilisticexpialidocious'
			}))
			.end(function(err, res) {
				expect(res.body).to.be.null;
				done();
			});
		});
	});

	describe('/appinfo/GetAppInfoByWebApp', function() {
		it('should find app info like query string', function(done) {
			request(server)
			.get('/appinfo/GetAppInfoByWebApp')
			.query(qs.stringify({
				WebAppUrl: testAppInfo2.WebAppUrl
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object');
				done();
			});
		});

		it('should not find anything if query string does not match', function(done) {
			request(server)
			.get('/appinfo/GetAppInfoByWebApp')
			.query(qs.stringify({
				AdminUrl: 'supercalifragilisticexpialidocious'
			}))
			.end(function(err, res) {
				expect(res.body).to.be.null;
				done();
			});
		});
	});

	describe('/appinfo/GetAllInfoList', function() {
		it('should get all app info', function(done) {
			request(server)
			.get('/appinfo/GetAllInfoList')
			.query(qs.stringify({
				AppName: testAppInfo1.AppName
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});
});