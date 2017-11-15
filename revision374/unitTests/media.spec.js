var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testMedia1 = {
	id: 0,
	FileName: '2017000000123456.jpg',
	Author: 'UnitTest1',
	Caption: null,
	AltText: null,
	Description: null,
	Name: '2017000000123456'
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

describe('/media', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var Media;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dMedia;
	var dMedia2;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		Media = models.tblmediamgmt;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;
		
		Media.create(testMedia1)
		.then(function(rMedia) {
			dMedia = rMedia;
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
			return dMedia.destroy();
		})
		.then(function() {
			return Media.destroy({
				where: {
					Author: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			if (dMedia2) {
				fs.unlinkSync(__dirname + '/../MediaUploads/' + dMedia2.FileName);
			}
			server.close(done);
		});
	});

	describe('/media/upload', function() {
		it('should upload a media file', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/media/upload')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.attach('UnitTestMedia1', __dirname + '/../MediaUploads/default-user.png')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Images Uploaded Successfully...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[1]).to.equal(true);
				dMedia2 = res.body.data[0];
				done();
			});
		});
	});

	describe('/media/GetAllMedia', function() {
		it('should get all medias', function(done) {
			request(server)
			.get('/media/GetAllMedia')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});
});