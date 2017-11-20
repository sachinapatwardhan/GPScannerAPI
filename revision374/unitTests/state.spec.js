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
var testState1 = {
	id: 0,
	idCountry: 0,
	Name: 'UnitTestState1',
	ShortName: 'UTS1',
	Seq: null,
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null
};
var testState2 = {
	id: 0,
	idCountry: 0,
	Name: 'UnitTestState2',
	ShortName: 'UTS2',
	Seq: null,
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null
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
	var Country;
	var State;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dCountry;
	var dState;
	var dState2;
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
		State = models.tblcountrystatemgmt;
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
			return dState.destroy();
		})
		.then(function() {
			return State.destroy({
				where: {
					Name: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			return dCountry.destroy();
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/state/GetAllState', function() {
		it('should get all states', function(done) {
			request(server)
			.get('/state/GetAllState')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/state/GetAllStateByPagging', function() {
		it('should get all states by paging', function(done) {
			request(server)
			.get('/state/GetAllStateByPagging')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'tblcountrymgmt.Country', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Name', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'ShortName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
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
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});

		it('should get all states by paging when searching', function(done) {
			request(server)
			.get('/state/GetAllStateByPagging')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'tblcountrymgmt.Country', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Name', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'ShortName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: {
					value: testState1.Name,
					regex: false
				},
				_: 1500000000000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/state/GetAllStateByCountryId', function() {
		it('should get all states by country ID', function(done) {
			request(server)
			.get('/state/GetAllStateByCountryId')
			.query(qs.stringify({
				CountryId: dCountry.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				done();
			});
		});
	});

	describe('/state/SaveState', function() {
		it('should save save if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testState2.idCountry = dCountry.id;
			
			request(server)
			.post('/state/SaveState')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testState2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('State created successfully...');
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
			.post('/state/SaveState')
			.send(testState2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/state/DeleteState', function() {
		it('should delete state when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/state/DeleteState')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				StateId: dState2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('State deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.get('/state/DeleteState')
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

	// describe('/country/GetCountryCode', function() {
	// 	it('should get all countries', function(done) {
	// 		request(server)
	// 		.get('/country/GetCountryCode')
	// 		.expect(200)
	// 		.end(function(err, res) {
	// 			expect(res.body).to.exist;
	// 			expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
	// 			done();
	// 		});
	// 	});
	// });

	// describe('/country/getAllLangauageInCountry', function() {
	// 	it('should get all languages in country when IdLanguage matches', function(done) {
	// 		request(server)
	// 		.get('/country/getAllLangauageInCountry')
	// 		.query(qs.stringify({
	// 			Id: testLanguageInCountry1.IdLanguage
	// 		}))
	// 		.expect(200)
	// 		.end(function(err, res) {
	// 			expect(res.body).to.exist;
	// 			expect(res.body).to.be.an('array').that.has.lengthOf(1);
	// 			done();
	// 		});
	// 	});

	// 	it('should fail when IdLanguage does not match', function(done) {
	// 		request(server)
	// 		.get('/country/getAllLangauageInCountry')
	// 		.query(qs.stringify({
	// 			Id: 0
	// 		}))
	// 		.expect(200)
	// 		.end(function(err, res) {
	// 			expect(res.body).to.exist;
	// 			expect(res.body).to.be.an('array').that.has.lengthOf(0);
	// 			done();
	// 		});
	// 	});
	// });

	// describe('/country/SaveLagaugeInCountry', function() {
	// 	it('should save language in country if credentials and permissions are correct', function(done) {
	// 		var token = {
	// 			username: dUser.username,
	// 			password: dUser.password
	// 		};
	// 		token = 'JWT ' + jwt.encode(token, 'bugz');
			
	// 		request(server)
	// 		.post('/country/SaveLagaugeInCountry')
	// 		.set('authorization', token)
	// 		.set('x-requested-with', dModule.Module)
	// 		.send(testLanguageInCountry2)
	// 		.end(function(err, res) {
	// 			expect(res.body).to.exist;
	// 			expect(res.body).to.have.property('success');
	// 			expect(res.body).to.have.property('message');
	// 			expect(res.body).to.have.property('data');
	// 			expect(res.body.success).to.equal(true);
	// 			expect(res.body.message).to.equal('Language add in country successfully...');
	// 			expect(res.body.data).to.be.an('array');
	// 			expect(res.body.data).to.have.lengthOf(2);
	// 			expect(res.body.data[0]).to.be.an('object');
	// 			expect(res.body.data[1]).to.equal(true);
	// 			dLanguageInCountry2 = res.body.data[0];
	// 			done();
	// 		});
	// 	});

	// 	it('should fail when credentials and permissions are wrong', function(done) {
	// 		request(server)
	// 		.post('/country/SaveLagaugeInCountry')
	// 		.send(testLanguageInCountry2)
	// 		.end(function(err, res) {
	// 			expect(res.body).to.exist;
	// 			expect(res.body).to.have.property('success');
	// 			expect(res.body).to.have.property('message');
	// 			expect(res.body).to.have.property('data');
	// 			expect(res.body.success).to.equal(false);
	// 			expect(res.body.message).to.equal('Invalid token...');
	// 			expect(res.body.data).to.equal('TOKEN');
	// 			done();
	// 		});
	// 	});
	// });

	// describe('/country/DeleteLagauagefromCountry', function() {
	// 	it('should delete language in country when credentials and permissions are correct', function(done) {
	// 		var token = {
	// 			username: dUser.username,
	// 			password: dUser.password
	// 		};
	// 		token = 'JWT ' + jwt.encode(token, 'bugz');

	// 		request(server)
	// 		.get('/country/DeleteLagauagefromCountry')
	// 		.set('authorization', token)
	// 		.set('x-requested-with', dModule.Module)
	// 		.query(qs.stringify({
	// 			IdLanguage: testLanguageInCountry2.IdLanguage,
	// 			Country: testLanguageInCountry2.Country
	// 		}))
	// 		.end(function(err, res) {
	// 			expect(res.body).to.exist;
	// 			expect(res.body).to.have.property('success');
	// 			expect(res.body).to.have.property('message');
	// 			expect(res.body).to.have.property('data');
	// 			expect(res.body.success).to.equal(true);
	// 			expect(res.body.message).to.equal('Language remove from country successfully...');
	// 			expect(res.body.data).to.equal(1);
	// 			done();
	// 		});
	// 	});

	// 	it('should fail when credentials and permissions are wrong', function(done) {
	// 		request(server)
	// 		.get('/country/DeleteLagauagefromCountry')
	// 		.query(qs.stringify({
	// 			IdLanguage: testLanguageInCountry2.IdLanguage,
	// 			Country: testLanguageInCountry2.Country
	// 		}))
	// 		.end(function(err, res) {
	// 			expect(res.body).to.exist;
	// 			expect(res.body).to.have.property('success');
	// 			expect(res.body).to.have.property('message');
	// 			expect(res.body).to.have.property('data');
	// 			expect(res.body.success).to.equal(false);
	// 			expect(res.body.message).to.equal('No Access Permission...');
	// 			expect(res.body.data).to.equal('AccessPermission');
	// 			done();
	// 		});
	// 	});
	// });
});