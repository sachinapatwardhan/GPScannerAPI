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
	id: 0,
	RoleName: 'UnitTestUser',
	Description: 'Unit Test User',
	Country: 'Malaysia'
};
var testModule1 = {
	Module: 'UnitTestModule',
	IsActive: true,
	DisplayOrder: 99999
};
var testPermission1 = {
	idModule: 0,
	RoleName: testRole1.RoleName,
	Added: true,
	Modified: true,
	Deleted: true,
	Show: true
};

describe('/userpermission', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});
		
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;
		
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
			testPermission1.idModule = dModule.id;
			return Permission.create(testPermission1);
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
			server.close(done);
		});
	});

	describe('/userpermission/GetAllPermissionByRole', function() {
		it('should get all permission by role', function(done) {
			request(server)
			.get('/userpermission/GetAllPermissionByRole')
			.query(qs.stringify({
				RoleName: testRole1.RoleName
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0]).to.have.property('Added').that.is.equal(testPermission1.Added);
				done();
			});
		});
		
		it('should fail when RoleName does not match', function(done) {
			request(server)
			.get('/userpermission/GetAllPermissionByRole')
			.query(qs.stringify({
				RoleName: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/userpermission/ChangePermission', function() {
		it('should change permission if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.post('/userpermission/ChangePermission')
			.set('authorization', token)
			.send(dPermission)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Permission updated successfully...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.data[0]).to.equal(1);
				done();
			});
		});

		it('should fail if credentials are wrong', function(done) {
			request(server)
			.post('/userpermission/ChangePermission')
			.send(dPermission)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/userpermission/ChangeAllPermissions', function() {
		it('should change all permissions if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.post('/userpermission/ChangeAllPermissions')
			.set('authorization', token)
			.send({
				Data: [ { idModule: dPermission.idModule } ],
				RoleName: dPermission.RoleName,
				Type: 'View',
				Show: true
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Permission updated successfully...');
				done();
			});
		});

		it('should fail if credentials are wrong', function(done) {
			request(server)
			.post('/userpermission/ChangeAllPermissions')
			.send({
				Data: [ { idModule: dPermission.idModule } ],
				RoleName: dPermission.RoleName,
				Type: 'View',
				Show: true
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/userpermission/CheckRights', function() {
		it('should check rights', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/userpermission/CheckRights')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				tablename: dModule.Module,
				permission: 'Show',
				idApp: testUser1.idApp
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Permission to Access...');
				expect(res.body.order).to.equal(testModule1.DisplayOrder);
				done();
			});
		});
		
		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/userpermission/CheckRights')
			.query(qs.stringify({
				tablename: dModule.Module,
				permission: 'Show',
				idApp: testUser1.idApp
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

	describe('/userpermission/GetAllPageRights', function() {
		it('should get all page rights', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/userpermission/GetAllPageRights')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				idApp: testUser1.idApp
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Permission to Access...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/userpermission/GetAllPageRights')
			.query(qs.stringify({
				idApp: testUser1.idApp
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

	describe('/userpermission/CheckRightsbyPage', function() {
		it('should check rights by page', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/userpermission/CheckRightsbyPage')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				tablename: dModule.Module,
				idApp: testUser1.idApp
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Permission to Access...');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});
		
		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/userpermission/CheckRightsbyPage')
			.query(qs.stringify({
				tablename: dModule.Module,
				idApp: testUser1.idApp
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