var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testCountry1 = {
	id: 0,
	Code: 0,
	Country: 'UnitTestCountry1',
	ShortName: null,
	Seq: 0,
	CreatedBy: 'UnitTest1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null,
	IsEurope: false
};
var testCountry2 = {
	id: 0,
	Code: 0,
	Country: 'UnitTestCountry2',
	ShortName: null,
	Seq: 0,
	CreatedBy: 'UnitTest1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null,
	IsEurope: false
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

describe('/country', function() {
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
	var dPermission;

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
		
		Country.create(testCountry1)
		.then(function(rCountry) {
			dCountry = rCountry;
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
			return dCountry.destroy();
		})
		.then(function() {
			return Country.destroy({
				where: {
					Country: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/country/GetAllCountry', function() {
		it('should get all countries', function(done) {
			request(server)
			.get('/country/GetAllCountry')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/country/GetAllCountryByPagging', function() {
		it('should get all countries by paging', function(done) {
			request(server)
			.get('/country/GetAllCountryByPagging')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{
						data: 'Code',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'Country',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'ShortName',
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
				search: {
					value: '',
					regex: false
				},
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

		it('should get all countries by paging when searching', function(done) {
			request(server)
			.get('/country/GetAllCountryByPagging')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{
						data: 'Code',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'Country',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'ShortName',
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
				search: {
					value: testCountry1.Country,
					regex: false
				},
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
	});

	describe('/country/SaveCountry', function() {
		it('should save country if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/country/SaveCountry')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testCountry2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Country created successfully...');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dCountry2 = res.body.data[0];
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/country/SaveCountry')
			.send(testCountry2)
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

	describe('/country/DeleteCountry', function() {
		it('should delete country when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/country/DeleteCountry')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				CountryId: dCountry2.id,
				idCountry: dCountry2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Country deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.get('/country/DeleteCountry')
			.query(qs.stringify({
				CountryId: dCountry2.id,
				idCountry: dCountry2.id
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

	describe('/country/GetCountryCode', function() {
		it('should get all countries', function(done) {
			request(server)
			.get('/country/GetCountryCode')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});
});