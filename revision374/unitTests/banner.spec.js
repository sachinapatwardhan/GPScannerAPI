var request = require('supertest');
var expect = require('chai').expect;
var qs = require('qs');

var testBanner1 = {
	id: 0,
	Name: 'UnitTestBanner1'
};
var testBanner2 = {
	id: 0,
	Name: 'UnitTestBanner2'
};
var testBannerMgmt1 = {
	id: 0,
	BannerId: 0,
	ImageUrl: '12345678901234567.jpg',
	alt: 'UnitTestBanner1',
	UrlLink: '#',
	Description: 'Unit Test Banner 1'
};
var testBannerMgmt2 = {
	id: 0,
	BannerId: 0,
	ImageUrl: '12345678901234568.jpg',
	alt: 'UnitTestBanner2',
	UrlLink: '#',
	Description: 'Unit Test Banner 2'
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

describe('banner', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var Banner;
	var BannerMgmt;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dBanner1;
	var dBanner2;
	var dBannerMgmt1;
	var dBannerMgmt2;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;

	before(function(done) {
		server = require('../server');
		Banner = models.tblbanner;
		BannerMgmt = models.tblbannermgmt;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;

		Banner.create(testBanner1)
		.then(function(rBanner) {
			dBanner1 = rBanner;
			testBannerMgmt1.BannerId = rBanner.id;
			return BannerMgmt.create(testBannerMgmt1);
		})
		.then(function(rBannerMgmt) {
			dBannerMgmt1 = rBannerMgmt;
			testUser1.password = jwt.encode(testUser1.password, 'bugz');
			return User.create(testUser1);
		})
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
			done();
		});
	});

	after(function(done) {
		BannerMgmt.destroy({
			where: {
				alt: { $like: 'UnitTestBanner%' }
			}
		})
		.then(function() {
			return Banner.destroy({
				where: {
					Name: { $like: 'UnitTestBanner%' }
				}
			});
		})
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

	describe('/banner/GetAllBanner', function() {
		it('should get all banner', function(done) {
			request(server)
			.get('/banner/GetAllBanner')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.eixst;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/banner/GetBannerById', function() {
		it('should get banner if ID matches', function(done) {
			request(server)
			.get('/banner/GetBannerById')
			.query(qs.stringify({
				idBanner: dBanner1.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Banner found...');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});
		
		it('should not get banner if ID does not match', function(done) {
			request(server)
			.get('/banner/GetBannerById')
			.query(qs.stringify({
				idBanner: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Banner not found...');
				expect(res.body.data).to.be.null;
				done();
			});
		});
	});

	describe('/banner/SaveBanner', function() {
		it('should save banner when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.post('/banner/SaveBanner')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testBanner2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Banner created successfully...');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dBanner2 = res.body.data[0];
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/banner/SaveBanner')
			.send(testBanner2)
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

	describe('/banner/DeleteBanner', function() {
		it('should delete banner when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/banner/DeleteBanner')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				idBanner: dBanner2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Banner deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.get('/banner/DeleteBanner')
			.query(qs.stringify({
				idBanner: dBanner2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('No Access Permission...');
				expect(res.body.data).to.equal('AccessPermission');
				done();
			});
		});
	});

	describe('/banner/GetAllBannerMgmt', function() {
		it('should get all banner management', function(done) {
			request(server)
			.get('/banner/GetAllBannerMgmt')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/banner/GetBannerMgmtById', function() {
		it('should get banner management when id match', function(done) {
			request(server)
			.get('/banner/GetBannerMgmtById')
			.query(qs.stringify({
				idBanner: dBanner1.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				done();
			});
		});
		
		it('should fail when id does not match', function(done) {
			request(server)
			.get('/banner/GetBannerMgmtById')
			.query(qs.stringify({
				idBanner: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Record not found...');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(0);
				done();
			});
		});
	});

	describe('/banner/SaveBannerMgmt', function() {
		it('should save banner management when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testBannerMgmt2.BannerId = dBanner1.id;

			request(server)
			.post('/banner/SaveBannerMgmt')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testBannerMgmt2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('BannerMgmt created successfully...');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dBannerMgmt2 = res.body.data[0];
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/banner/SaveBannerMgmt')
			.send(testBannerMgmt2)
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

	describe('/banner/DeleteBannerMgmt', function() {
		it('should delete banner management when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/banner/DeleteBannerMgmt')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				idBanner: dBannerMgmt2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('BannerMgmt deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.get('/banner/DeleteBannerMgmt')
			.query(qs.stringify({
				idBanner: dBannerMgmt2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('No Access Permission...');
				expect(res.body.data).to.equal('AccessPermission');
				done();
			});
		});
	});

	describe('/banner/GetAllBannerMgmtByBannerName', function() {
		it('should get all banner management when banner name matches', function(done) {
			request(server)
			.get('/banner/GetAllBannerMgmtByBannerName')
			.query(qs.stringify({
				BannerName: dBanner1.Name
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.property('length').of.at.least(1);
				done();
			});
		});

		it('should fail when banner name does not match', function(done) {
			request(server)
			.get('/banner/GetAllBannerMgmtByBannerName')
			.query(qs.stringify({
				BannerName: 'supercalifragilisticexpialidocious'
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
});