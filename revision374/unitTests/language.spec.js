var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testLanguage1 = {
	Id: 0,
	Name: 'UnitTestLanguage1',
	LanguageCulture: 'ut-UT1',
	UniqueSeoCode: 'ut-UT1',
	FlagImageFileName: '201772512326623.png',
	Rtl: false,
	LimitedToStores: null,
	DefaultCurrencyId: null,
	Published: true,
	DisplayOrder: 99999
};
var testLanguage2 = {
	Id: 0,
	Name: 'UnitTestLanguage2',
	LanguageCulture: 'ut-UT2',
	UniqueSeoCode: 'ut-UT2',
	FlagImageFileName: '201772512326624.png',
	Rtl: false,
	LimitedToStores: null,
	DefaultCurrencyId: null,
	Published: false,
	DisplayOrder: 99998
};
var testLanguageInCountry1 = {
	Id: 0,
	IdLanguage: 99489927,
	Country: 'UnitTestCountry1'
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

describe('/language', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var Language;
	var LanguageInCountry;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dLanguage;
	var dLanguageInCountry;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		Language = models.language;
		LanguageInCountry = models.tbllanguageincountry;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;

		Language.create(testLanguage1)
		.then(function(rLanguage) {
			dLanguage = rLanguage;
			testLanguageInCountry1.IdLanguage = dLanguage.Id;
			return LanguageInCountry.create(testLanguageInCountry1);
		})
		.then(function(rLanguageInCountry) {
			dLanguageInCountry = rLanguageInCountry;
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
			return dLanguageInCountry.destroy();
		})
		.then(function() {
			return dLanguage.destroy();
		})
		.then(function() {
			return Language.destroy({
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

	describe('/language/GetAllLanguage', function() {
		it('should get all languages', function(done) {
			request(server)
			.get('/language/GetAllLanguage')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(2);
				done();
			});
		});
	});

	describe('/language/GetAllPublishLanguage', function() {
		it('should get all published languages', function(done) {
			request(server)
			.get('/language/GetAllPublishLanguage')
			.query(qs.stringify({
				Country: testLanguageInCountry1.Country
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/language/GetLangageCulture', function() {
		it('should get languages list of the world', function(done) {
			request(server)
			.get('/language/GetLangageCulture')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').to.have.lengthOf(136).and.contain('en-US');
				done();
			});
		});
	});

	describe('/language/SaveLanguage', function() {
		it('should save language if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/language/SaveLanguage')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testLanguage2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Language created successfully...');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dLanguage2 = res.body.data[0];
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/language/SaveLanguage')
			.send(testLanguage2)
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

	describe('/language/DeleteLanguage', function() {
		it('should delete language when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/language/DeleteLanguage')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				idLanguage: dLanguage2.Id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Language deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.get('/language/DeleteLanguage')
			.query(qs.stringify({
				idLanguage: dLanguage2.Id
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

	describe('/language/uploadImage', function() {
		it('should upload image for language', function(done) {
			request(server)
			.post('/language/uploadImage')
			.attach(dLanguage.Id, __dirname + '/../MediaUploads/201672512326623.jpg')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Images Uploaded Successfully...');
				expect(res.body.data.indexOf('.jpg')).to.not.equal(-1);
				fs.unlinkSync(__dirname + '/../MediaUploads/' + res.body.data);
				done();
			});
		});
	});
});