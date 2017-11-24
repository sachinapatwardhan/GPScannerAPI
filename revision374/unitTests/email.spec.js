var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testEmailSetting1 = {
	id: 0,
	DefaultEmailFrom: 'unittest1@bugzstudio.com',
	NotificationEmailTo: 'unittest1@bugzstudio.com',
	EEMandrillKey: '192809saodjou21joi',
	EEDefaultFrom: 'unittest1@bugzstudio.com',
	EEValidateEmailAddresses: false
};
var testEmailSetting2 = {
	id: 0,
	DefaultEmailFrom: 'unittest2@bugzstudio.com',
	NotificationEmailTo: 'unittest2@bugzstudio.com',
	EEMandrillKey: 'asidjsaldj1280921sa',
	EEDefaultFrom: 'unittest2@bugzstudio.com',
	EEValidateEmailAddresses: false
};
var testEmailTemplate1 = {
	id: 0,
	Type: 'UnitTestEmailTemplate1',
	EmailSubject: 'UnitTestEmailTemplate1',
	EmailBody: 'UnitTestEmailTemplate1',
	EmailFrom: 'unittest1@bugzstudio.com'
};
var testEmailTemplate2 = {
	id: 0,
	Type: 'UnitTestEmailTemplate2',
	EmailSubject: 'UnitTestEmailTemplate2',
	EmailBody: 'UnitTestEmailTemplate2',
	EmailFrom: 'unittest2@bugzstudio.com'
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

describe('/email', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var EmailSetting;
	var EmailTemplate;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dEmailSetting;
	var dEmailSetting2;
	var dEmailTemplate;
	var dEmailTemplate2;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		EmailSetting = models.tblemailsettingsys;
		EmailTemplate = models.tblemailtemplate;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;
		
		EmailSetting.create(testEmailSetting1)
		.then(function(rEmailSetting) {
			dEmailSetting = rEmailSetting;
			return EmailTemplate.create(testEmailTemplate1);
		})
		.then(function(rEmailTemplate) {
			dEmailTemplate = rEmailTemplate;
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
			return dEmailTemplate.destroy();
		})
		.then(function() {
			return dEmailSetting.destroy();
		})
		.then(function() {
			return EmailTemplate.destroy({
				where: {
					Type: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			return EmailSetting.destroy({
				where: {
					DefaultEmailFrom: {
						$like: 'unittest%'
					}
				}
			});
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/email/GetEmailSetting', function() {
		it('should get one email setting', function(done) {
			request(server)
			.get('/email/GetEmailSetting')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Email Setting found...');
				expect(res.body.data).to.be.an('object').that.has.property('DefaultEmailFrom');
				done();
			});
		});
	});

	describe('/email/SaveEmailSetting', function() {
		it('should save email setting if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/email/SaveEmailSetting')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testEmailSetting2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Email Setting created successfully...');
				expect(res.body.data).to.be.an('object');
				dEmailSetting2 = res.body.data;
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/email/SaveEmailSetting')
			.send(testEmailSetting2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/email/DeleteEmailSetting', function() {
		it('should delete email setting when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/email/DeleteEmailSetting')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				idEmailSetting: dEmailSetting2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Email Setting deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.get('/email/DeleteEmailSetting')
			.query(qs.stringify({
				idEmailSetting: dEmailSetting2.id
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

	describe('/email/GetAllEmailTemplate', function() {
		it('should get all email templates', function(done) {
			request(server)
			.get('/email/GetAllEmailTemplate')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/email/SaveEmailTemplate', function() {
		it('should save email template if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/email/SaveEmailTemplate')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send(testEmailTemplate2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('EmailTemplate created successfully...');
				expect(res.body.data).to.be.an('object');
				dEmailTemplate2 = res.body.data;
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/email/SaveEmailTemplate')
			.send(testEmailTemplate2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/email/DeleteEmailTemplate', function() {
		it('should delete email template when credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/email/DeleteEmailTemplate')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.query(qs.stringify({
				idEmailTemplate: dEmailTemplate2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('EmailTemplate deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.get('/email/DeleteEmailTemplate')
			.query(qs.stringify({
				idEmailTemplate: dEmailTemplate2.id
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