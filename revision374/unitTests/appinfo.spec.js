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
var testAppInfo2 = {
	AppName: 'Test2',
	BundleId: 'com.disolutions.test2',
	IOSCertificate: '999999999999993.pem',
	IOSKey: '999999999999994.pem',
	AndroidId: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2',
	AndroidSenderId: '999999999992',
	CreatedDate: new Date(),
	CreatedBy: 'Admin',
	ImageLogo: '999999999999992.png'
};
var testEmail = 'lenqxue95@gmail.com';
var testPassword = 'dino.saw';

describe('application information', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var User;
	var AppInfo;

	beforeEach(function() {
		server = require('../server', {
			bustCache: true
		});
		User = models.tbluserinformation;
		AppInfo = models.tblappinfo;
	});

	afterEach(function(done) {
		server.close(done);
	});

	describe('/appinfo/GetAllAppInfo', function() {
		var dAppInfo1;
		var dAppInfo2;

		beforeEach(function(done) {
			AppInfo.create(testAppInfo1)
			.then(function(rAppInfo) {
				dAppInfo1 = rAppInfo;
				return AppInfo.create(testAppInfo2);
			})
			.then(function(rAppInfo) {
				dAppInfo2 = rAppInfo;
				done();
			});
		});

		afterEach(function(done) {
			dAppInfo1.destroy()
			.then(function() {
				dAppInfo2.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should get all app info with status 200 when not searching', function(done) {
			request(server)
			.get('/appinfo/GetAllAppInfo')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{
						data: 'Id',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'AppName',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'BundleId',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'IOSCertificate',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'IOSKey',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'AndroidId',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'AndroidSenderId',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'CreatedBy',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'CreatedDate',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					}
				],
				order: [
					{ column: 2, dir: 'asc' }
				],
				start: 0,
				length: 25,
				// search: {
				// 	value: '',
				// 	regex: false
				// },
				_: 1500000000000
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

		it('should get matched app info with status 200 when searching', function(done) {
			request(server)
			.get('/appinfo/GetAllAppInfo')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{
						data: 'Id',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'AppName',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'BundleId',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'IOSCertificate',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'IOSKey',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'AndroidId',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'AndroidSenderId',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'CreatedBy',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'CreatedDate',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					}
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: 'Test2',
				_: 1500000000000
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
				expect(res.body.data).to.have.lengthOf(1);
				done();
			});
		});

		it('should fail with status 200 when searching with SQL injection', function(done) {
			request(server)
			.get('/appinfo/GetAllAppInfo')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{
						data: 'Id',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'AppName',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'BundleId',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'IOSCertificate',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'IOSKey',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'AndroidId',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'AndroidSenderId',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'CreatedBy',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'CreatedDate',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					}
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '" or ""="',
				_: 1500000000000
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
				expect(res.body.data).to.have.lengthOf(0);
				done();
			});
		});
	});

	describe('/appinfo/GetAllInfoList', function() {
		var dAppInfo1;
		var dAppInfo2;

		beforeEach(function(done) {
			AppInfo.create(testAppInfo1)
			.then(function(rAppInfo) {
				dAppInfo1 = rAppInfo;
				return AppInfo.create(testAppInfo2);
			})
			.then(function(rAppInfo) {
				dAppInfo2 = rAppInfo;
				done();
			});
		});

		afterEach(function(done) {
			dAppInfo1.destroy()
			.then(function() {
				dAppInfo2.destroy();
			})
			.then(function() {
				done();
			});
		});
		
		it('should return all app info id and AppName', function(done) {
			request(server)
			.get('/appinfo/GetAllInfoList')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(2);
				expect(res.body[0]).to.have.property('id');
				expect(res.body[0]).to.have.property('AppName');
				expect(res.body[0]).to.not.have.property('BundleId');
				expect(res.body[0].Id).to.not.equal(null);
				expect(res.body[0].AppName).to.not.equal(null);
				done();
			});
		});
	});

	describe('/appinfo/SaveAppInfo', function() {
		afterEach(function(done) {
			AppInfo.destroy({
				where: {
					AppName: testAppInfo1.AppName,
					BundleId: testAppInfo1.BundleId
				}
			})
			.then(function() {
				done();
			});
		});

		describe('', function() {
			var dUser;
	
			beforeEach(function(done) {
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
	
			afterEach(function(done) {
				dUser.destroy()
				.then(function() {
					done();
				});
			});

			it('should save app info when credentials are correct', function(done) {
				var token = jwt.encode({
					username: testEmail,
					password: jwt.encode(testPassword, 'bugz')
				}, 'bugz');
				token = 'JWT ' + token;

				request(server)
				.post('/appinfo/SaveAppInfo')
				.set('authorization', token)
				.send(testAppInfo1)
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.exist;
					expect(res.body).to.have.property('success');
					expect(res.body).to.have.property('message');
					expect(res.body).to.have.property('data');
					expect(res.body.success).to.equal(true);
					expect(res.body.message).to.equal('App Info created successfully...');
					expect(res.body.data).to.be.an('array');
					expect(res.body.data).to.have.lengthOf(2);
					expect(res.body.data[0]).to.be.an('object');
					expect(res.body.data[1]).to.equal(true);
					done();
				});
			});
		});
		
		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/appinfo/SaveAppInfo')
			.send(testAppInfo1)
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

	describe('/appinfo/DeleteAppInfo', function() {
		describe('', function() {
			var dUser;
			var dAppInfo;

			beforeEach(function(done) {
				User.create({
					username: testEmail,
					email: testEmail,
					password: jwt.encode(testPassword, 'bugz'),
					IsMobileVerify: false,
					idApp: 1
				})
				.then(function(rUser) {
					dUser = rUser;
					return AppInfo.create(testAppInfo1);
				})
				.then(function(rAppInfo) {
					dAppInfo = rAppInfo;
					done();
				});
			});

			afterEach(function(done) {
				dUser.destroy()
				.then(function() {
					done();
				});
			});

			it('should delete app info when credentials are correct', function(done) {
				var token = jwt.encode({
					username: testEmail,
					password: jwt.encode(testPassword, 'bugz')
				}, 'bugz');
				token = 'JWT ' + token;

				request(server)
				.get('/appinfo/DeleteAppInfo')
				.set('authorization', token)
				.query(qs.stringify({
					Id: dAppInfo.Id
				}))
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.exist;
					expect(res.body).to.have.property('success');
					expect(res.body).to.have.property('message');
					expect(res.body).to.have.property('data');
					expect(res.body.success).to.equal(true);
					expect(res.body.message).to.equal('App Info Deleted Successfully');
					expect(res.body.data).to.be.an('object');
					done();
				});
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/appinfo/DeleteAppInfo')
			.query(qs.stringify({
				Id: 0
			}))
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

	describe('/appinfo/uploadFile', function() {
		// TODO: Fill in the test here
	});

	describe('/appinfo/GetAppInfoByName', function() {
		var dAppInfo;

		beforeEach(function(done) {
			AppInfo.create(testAppInfo1)
			.then(function(rAppInfo) {
				dAppInfo = rAppInfo;
				done();
			});
		});

		afterEach(function(done) {
			dAppInfo.destroy()
			.then(function() {
				done();
			});
		});

		describe('', function() {
			it('should get app info when name is matching', function(done) {
				request(server)
				.get('/appinfo/GetAppInfoByName')
				.query(qs.stringify({
					AppName: testAppInfo1.AppName
				}))
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.exist;
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('BundleId');
					expect(res.body.BundleId).to.equal(testAppInfo1.BundleId);
					done();
				});
			});
	
			it('should not get app info when name does not match', function(done) {
				request(server)
				.get('/appinfo/GetAppInfoByName')
				.query(qs.stringify({
					AppName: ''
				}))
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.be.null;
					done();
				});
			});
		});
	});

	describe('/appinfo/GetAllInfoList', function() {
		var dAppInfo;

		beforeEach(function(done) {
			AppInfo.create(testAppInfo1)
			.then(function(rAppInfo) {
				dAppInfo = rAppInfo;
				done();
			});
		});

		afterEach(function(done) {
			dAppInfo.destroy()
			.then(function() {
				done();
			});
		});

		it('should get all app info', function(done) {
			request(server)
			.get('/appinfo/GetAllInfoList')
			.query(qs.stringify({
				AppName: testAppInfo1.AppName
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(1);
				expect(res.body[0]).to.be.an('object');
				expect(res.body[0]).to.have.property('id');
				done();
			});
		});
	});
});