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
var testLocaleStringResource1 = {
	Id: 0,
	LanguageId: 0,
	ResourceName: 'UnitTestLocaleStringResource1',
	ResourceValue: 'UnitTestLocaleStringResource1'
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

describe('/languageresources', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var Language;
	var LocaleStringResource;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dLanguage;
	var dLocaleStringResource;
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
		LocaleStringResource = models.localestringresource;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;

		Language.create(testLanguage1)
		.then(function(rLanguage) {
			dLanguage = rLanguage;
			testLocaleStringResource1.LanguageId = dLanguage.Id;
			return LocaleStringResource.create(testLocaleStringResource1);
		})
		.then(function(rLocaleStringResource) {
			dLocaleStringResource = rLocaleStringResource;
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
			return dLocaleStringResource.destroy();
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

	describe('/languageresources/DownloadTemplate', function() {
		it('should download template', function(done) {
			request(server)
			.get('/languageresources/DownloadTemplate')
			.expect(200)
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats');
				expect(res.header['content-disposition']).to.equal('attachment; filename=MobileLanguageResources_Template.xlsx');
				done();
			});
		});
	});

	describe('/languageresources/GetMobileLanguageData', function() {
		it('should get mobile language data', function(done) {
			request(server)
			.get('/languageresources/GetMobileLanguageData')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body['en-GB']).to.be.an('object');
				expect(res.body['gu-IN']).to.be.an('object');
				expect(res.body['hi-IN']).to.be.an('object');
				expect(res.body['ms-MY']).to.be.an('object');
				done();
			});
		});
	});

	describe('/languageresources/SaveMobileLanguageData', function() {
		it('should save mobile language data if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/languageresources/SaveMobileLanguageData')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send([
				{},
				{ Value: 'Language' },
				{ Name: 'ms-MY', Value: 'Bahasa' },
				{}
			])
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Mobile Language Resources updated successfully...');
				expect(res.body.data).to.be.null;
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/languageresources/SaveMobileLanguageData')
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

	describe('/languageresources/ExportMobileLanguageResource', function() {
		it('should export mobile language resources', function(done) {
			request(server)
			.get('/languageresources/ExportMobileLanguageResource')
			.expect(200)
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats');
				expect(res.header['content-disposition']).to.equal('attachment; filename=MobileLanguageResource.xlsx');
				done();
			});
		});
	});
});