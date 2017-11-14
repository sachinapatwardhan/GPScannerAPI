var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testCurrency1 = {
	id: 0,
	Name: 'UnitTestCurrency1',
	CurrencyCode: 'UT1'
};
var testCurrency2 = {
	id: 0,
	Name: 'UnitTestCurrency2',
	CurrencyCode: 'UT2'	
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

describe('/currency', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var Currency;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dCurrency;
	var dCurrency2;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		Currency = models.tblcurrency;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;

		Currency.create(testCurrency1)
		.then(function(rCurrency) {
			dCurrency = rCurrency;
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
			return dCurrency.destroy();
		})
		.then(function() {
			return Currency.destroy({
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

	describe('/currency/GetCurrency', function() {
		it('should get one currency', function(done) {
			request(server)
			.get('/currency/GetCurrency')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object');
				done();
			});
		});
	});

	describe('/currency/ManageCurrency', function() {
		it('should save currency if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/currency/ManageCurrency')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testCurrency2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Currency created successfully...');
				expect(res.body.data).to.be.an('object');
				dCurrency2 = res.body.data;
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/currency/ManageCurrency')
			.send(testCurrency2)
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
});