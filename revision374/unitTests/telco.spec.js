var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testTelco1 = {
	id: 0,
	Name: 'UnitTestTelco1',
	CreatedDate: new Date(),
	CreatedBy: 'UnitTestUser1',
	ModifiedDate: null,
	ModifiedBy: null
};
var testTelco2 = {
	id: 0,
	Name: 'UnitTestTelco2',
	CreatedDate: new Date(),
	CreatedBy: 'UnitTestUser1',
	ModifiedDate: null,
	ModifiedBy: null
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

describe('/state', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var Telco;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dTelco;
	var dTelco2;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		Telco = models.tbltelco;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;
		
		Telco.create(testTelco1)
		.then(function(rTelco) {
			dTelco = rTelco;
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
		dPermission.destroy()
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
			return Telco.destroy({
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

	describe('/telco/GetAllCompany', function() {
		it('should get all telcos', function(done) {
			request(server)
			.get('/telco/GetAllCompany')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/telco/SaveCompany', function() {
		it('should save telco if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/telco/SaveCompany')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testTelco2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Telephone Company created successfully...');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dState2 = res.body.data[0];
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/telco/SaveCompany')
			.send(testTelco2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/telco/DeleteTelCompany', function() {
		it('should delete telco when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/telco/DeleteTelCompany')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				id: dTelco.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Telephone Company deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.get('/telco/DeleteTelCompany')
			.query(qs.stringify({
				StateId: 0
			}))
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