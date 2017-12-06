var request = require('supertest');
var require = require('really-need');
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
var testModule2 = {
	Module: 'UnitTestModule2',
	IsActive: false,
	DisplayOrder: 99998
};
var testModule3 = {
	Module: 'UnitTestModule3',
	IsActive: true,
	DisplayOrder: 99997
};
var testModule4 = {
	Module: 'UnitTestModule4',
	IsActive: true,
	DisplayOrder: 99997
};
var testPermission1 = {
	idModule: 0,
	RoleName: testRole1.RoleName,
	Added: true,
	Modified: true,
	Deleted: true,
	Show: true
};
var testPermission2 = {
	idModule: 0,
	RoleName: testRole1.RoleName,
	Added: true,
	Modified: true,
	Deleted: true,
	Show: true
};

describe('/module', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var Country;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dCountry;
	var dCountry2;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dModule2;
	var dModule3;
	var dModule4;
	var dPermission;
	var dPermission2;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		Country = models.tblcountrymgmt;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;
		
		Module.create(testModule2)
		.then(function(rModule) {
			dModule2 = rModule;
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
			testPermission1.idModule = dModule.id;
			return Permission.create(testPermission1);
		})
		.then(function(rPermission) {
			dPermission = rPermission;
			return Module.create(testModule4);
		})
		.then(function(rModule) {
			dModule4 = rModule;
			testPermission2.idModule = dModule4.id;
			return Permission.create(testPermission2);
		})
		.then(function(rPermission) {
			dPermission2 = rPermission;
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
			return dModule2.destroy();
		})
		.then(function() {
			return Permission.destroy({
				where: {
					idModule: dModule4.id
				}
			});
		})
		.then(function() {
			return Module.destroy({
				where: {
					Module: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/module/GetAllModule', function() {
		it('should get all modules that are active', function(done) {
			request(server)
			.get('/module/GetAllModule')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/module/GetAllModuleName', function() {
		it('should get all modules', function(done) {
			request(server)
			.get('/module/GetAllModuleName')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(2);
				done();
			});
		});
	});

	describe('/module/CreateModule', function() {
		it('should create a module if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.post('/module/CreateModule')
			.set('authorization', token)
			.send(testModule3)
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Module created successfully...');
				Module.findOne({
					where: {
						Module: testModule3.Module
					}
				})
				.then(function(rModule) {
					dModule3 = rModule;
					done();
				});
			});
		});

		it('should fail if credentials are wrong', function(done) {
			request(server)
			.post('/module/CreateModule')
			.send(testModule3)
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

	describe('/module/UpdateModule', function() {
		it('should update a module if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testModule3.id = dModule3.id;

			request(server)
			.post('/module/UpdateModule')
			.set('authorization', token)
			.send(testModule3)
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Module updated successfully...');
				done();
			});
		});

		it('should fail if credentials are wrong', function(done) {
			request(server)
			.post('/module/UpdateModule')
			.send(testModule3)
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

	describe('/module/DeleteModule', function() {
		it('should delete module if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/module/DeleteModule/' + dModule3.id)
			.set('authorization', token)
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Module deleted successfully...');
				done();
			});
		});

		it('should fail if credentials are wrong', function(done) {
			request(server)
			.get('/module/DeleteModule/' + dModule3.id)
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

	describe('/module/DeleteModuleAndpermission', function() {
		it('should delete module and permission if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/module/DeleteModuleAndpermission/' + dModule4.id)
			.set('authorization', token)
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Module deleted successfully...');
				done();
			});
		});
		
		it('should fail if credentials are wrong', function(done) {
			request(server)
			.get('/module/DeleteModuleAndpermission/' + dModule4.id)
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
});