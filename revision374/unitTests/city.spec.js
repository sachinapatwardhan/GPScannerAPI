var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testCity1 = {
	id: 0,
	idState: 0,
	Name: 'UnitTestCity1',
	ShortName: null,
	Seq: 1,
	CreatedBy: 'UnitTest1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null
};
var testCity2 = {
	id: 0,
	idState: 0,
	Name: 'UnitTestCity2',
	ShortName: null,
	Seq: 1,
	CreatedBy: 'UnitTest1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null
};
var testState1 = {
	id: 0,
	idCountry: 0,
	Name: 'UnitTestState1',
	ShortName: null,
	Seq: 1,
	CreatedBy: 'UnitTest1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null
};
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

describe('/city', function() {
	// Important! Because server setup is slow!
	this.timeout(6000);

	var server;
	var City;
	var State;
	var Country;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dCity;
	var dCity2;
	var dState;
	var dCountry;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		City = models.tblstatecitymgmt;
		State = models.tblcountrystatemgmt;
		Country = models.tblcountrymgmt;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;
		
		Country.create(testCountry1)
		.then(function(rCountry) {
			dCountry = rCountry;
			testState1.idCountry = dCountry.id;
			return State.create(testState1);
		})
		.then(function(rState) {
			dState = rState;
			testCity1.idState = dState.id
			return City.create(testCity1);
		})
		.then(function(rCity) {
			dCity = rCity;
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
			return dCity.destroy();
		})
		.then(function() {
			return dState.destroy();
		})
		.then(function() {
			return dCountry.destroy();
		})
		.then(function() {
			return City.destroy({
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

	/**
	 * Note: Lookup of ~6s detected
	 */
	describe('/city/GetAllCity', function() {
		it('should get all cities', function(done) {
			request(server)
			.get('/city/GetAllCity')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/city/GetAllCityByStateId', function() {
		it('should get all cities when StateId is correct', function(done) {
			request(server)
			.get('/city/GetAllCityByStateId')
			.query(qs.stringify({
				StateId: dState.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				done();
			});
		});

		it('should fail when StateId is wrong', function(done) {
			request(server)
			.get('/city/GetAllCityByStateId')
			.query(qs.stringify({
				StateId: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/city/GetAllCityByPagging', function() {
		it('should get all cities by paging', function(done) {
			request(server)
			.get('/city/GetAllCityByPagging')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{
						data: 'tblcountrystatemgmt.tblcountrymgmt.Country',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'tblcountrystatemgmt.Name',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'Name',
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

		it('should get all cities by paging when searching', function(done) {
			request(server)
			.get('/city/GetAllCityByPagging')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{
						data: 'tblcountrystatemgmt.tblcountrymgmt.Country',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'tblcountrystatemgmt.Name',
						name: '',
						searchable: true,
						orderable: true,
						search: {
							value: '',
							regex: false
						}
					},
					{
						data: 'Name',
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
					value: testCity1.Name,
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

	describe('/city/GetCityById', function() {
		it('should find city when CityId is correct', function(done) {
			request(server)
			.get('/city/GetCityById')
			.query(qs.stringify({
				CityId: dCity.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('object');
				expect(res.body.data).to.have.property('Name');
				expect(res.body.data.Name).to.equal(testCity1.Name);
				done();
			});
		});

		it('should fail when CityId does not match', function(done) {
			request(server)
			.get('/city/GetCityById')
			.query(qs.stringify({
				CityId: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Record not found...');
				expect(res.body.data).to.be.null;
				done();
			});
		});
	});

	describe('/city/SaveCity', function() {
		it('should save city if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testCity2.idState = dState.id;
			
			request(server)
			.post('/city/SaveCity')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testCity2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('City created successfully...');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dCity2 = res.body.data[0];
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/city/SaveCity')
			.send(testCity2)
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

	describe('/city/DeleteCity', function() {
		it('should delete city when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/city/DeleteCity')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				CityId: dCity2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('City deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.get('/city/DeleteCity')
			.query(qs.stringify({
				CityId: dCity2.id
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
});