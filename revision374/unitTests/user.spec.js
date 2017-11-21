var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testVehicle1 = {
	id: 0,
	iduser: 0,
	Name: 'UnitTestVehicle1',
	deviceid: '1234567890123x',
	renewaldate: new Date(),
	IsOnline: false,
	HandshakDatetime: new Date(),
	CreatedDate: new Date(),
	MaxSpeed: 0.0000,
	IsACC: false,
	BatteryPercentage: 0,
	CreatedBy: 'Admin',
	ModifiedDate: null,
	ModifiedBy: null,
	SleepMode: false,
	GPRSInterval: 10,
	GPRSStopInterval: 0,
	Arm: false,
	OdoMeter: false,
	HeartbeatInterval: true,
	Relay: false,
	Siren: false,
	UserDefined: false,
	DoorLock: false,
	DoorUnlock: false,
	TimeZone: null,
	IsDelete: false,
	DeviceType: 'UnitTest1',
	idSalesAgent: null,
	LastArmSetting: false,
	IsShared: false,
	InsurenceDate: new Date(),
	PUCDate: null,
	idType: null,
	Movement: false
};
var testUser1 = {
	email: 'unittest.user@bugzstudio.com',
	username: 'unittest.user@bugzstudio.com',
	password: 'unittest.user',
	ProfileName: 'Unit Test User',
	phone: '1234567890',
	IsMobileVerify: false,
	idApp: 1
};
var testUser2 = {
	email: 'unittest.user2@bugzstudio.com',
	username: 'unittest.user2@bugzstudio.com',
	password: 'unittest.user2',
	ProfileName: 'Unit Test User 2',
	phone: '1234567891',
	IsMobileVerify: false,
	idApp: 1
};
var testUser3 = {
	email: 'unittest.user3@bugzstudio.com',
	username: 'unittest.user3@bugzstudio.com',
	password: 'unittest.user3',
	ProfileName: 'Unit Test User 3',
	phone: '1234567892',
	IsMobileVerify: false,
	idApp: 1
};
var testRole1 = {
	id: 0,
	RoleName: 'UnitTestUser',
	Description: 'Unit Test User',
	Country: 'Malaysia'
};
var testRole2 = {
	id: 0,
	RoleName: 'Sales Agent',
	Description: 'Unit Test Sales Agent',
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

describe('/user', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var Vehicle;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dVehicle;
	var dUser;
	var dUser2;
	var dRole;
	var dRole2;
	var dUserRole;
	var dUserRole2;
	var dUserRole3;
	var dModule;
	var dPermission;
	var shouldDeleteSalesAgentRole = false;
	var uploadedImgPath;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});
		
		Vehicle = models.tblvehicle;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;

		Role.findOrCreate({
			where: {
				RoleName: 'Sales Agent'
			},
			defaults: testRole2
		})
		.spread(function(rRole, isCreated) {
			dRole2 = rRole;
			shouldDeleteSalesAgentRole = isCreated;
			testUser2.password = jwt.encode(testUser2.password, 'bugz');
			return User.create(testUser2);
		})
		.then(function(rUser) {
			dUser2 = rUser;
			return UserRole.create({
				userId: dUser2.id,
				roleId: dRole2.id
			});
		})
		.then(function(rUserRole) {
			dUserRole2 = rUserRole;
			testVehicle1.iduser = dUser2.id;
			return Vehicle.create(testVehicle1);
		})
		.then(function(rVehicle) {
			dVehicle = rVehicle;
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
			return dVehicle.destroy();
		})
		.then(function() {
			return dUserRole2.destroy();
		})
		.then(function() {
			if (!shouldDeleteSalesAgentRole) return;
			return dRole2.destroy();
		})
		.then(function() {
			return dUser2.destroy();
		})
		.then(function() {
			if (!dUserRole3) return;
			return UserRole.destroy({
				where: {
					userId: dUserRole3.userId
				}
			});
		})
		.then(function() {
			if (!dUserRole3) return;
			return User.destroy({
				where: {
					id: dUserRole3.id
				}
			});
		})
		.then(function() {
			if (uploadedImgPath) {
				fs.unlinkSync(__dirname + '/../MediaUploads/UserUpload/' + uploadedImgPath);
			}
			server.close(done);
		});
	});

	describe('/user/GetAllUserBySalesRole', function() {
		it('should get all user that are sales agents', function(done) {
			request(server)
			.get('/user/GetAllUserBySalesRole')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/user/GetAllDynamicUser', function() {
		it('should get all users by paging', function(done) {
			request(server)
			.get('/user/GetAllDynamicUser')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'createddate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'username', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'email', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'phone', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				appId: testUser2.idApp,
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

		it('should get all users by paging when searching', function(done) {
			request(server)
			.get('/user/GetAllDynamicUser')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'createddate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'username', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'email', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'phone', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testUser2.username,
				appId: testUser2.idApp,
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

	describe('/user/GetUserByName', function() {
		it('should get user by name', function(done) {
			request(server)
			.get('/user/GetUserByName')
			.query(qs.stringify({
				UserName: testUser2.username,
				appId: testUser2.idApp
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0]).to.have.property('ProfileName').that.is.equal(testUser2.ProfileName);
				done();
			});
		});
		
		it('should fail when record not found', function(done) {
			request(server)
			.get('/user/GetUserByName')
			.query(qs.stringify({
				appId: testUser2.idApp
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/user/GetUserById', function() {
		it('should get user by ID', function(done) {
			request(server)
			.get('/user/GetUserById')
			.query(qs.stringify({
				idUser: dUser2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('object').that.has.property('ProfileName').that.is.equal(testUser2.ProfileName);
				done();
			});
		});

		it('should fail when ID does not match', function(done) {
			request(server)
			.get('/user/GetUserById')
			.query(qs.stringify({
				idUser: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Record not found...');
				expect(res.body.data).to.be.null;
				done();
			});
		});
	});
	
	describe('/user/GetUserProfile', function() {
		it('should get user profile by username', function(done) {
			request(server)
			.get('/user/GetUserProfile')
			.query(qs.stringify({
				username: testUser2.username
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('object').that.has.property('ProfileName').that.is.equal(testUser2.ProfileName);
				done();
			});
		});

		it('should fail when username does not match', function(done) {
			request(server)
			.get('/user/GetUserProfile')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Record not found...');
				expect(res.body.data).to.be.null;
				done();
			});
		});
	});

	describe('/user/GetUserProfileNew', function() {
		it('should get user profile by ID', function(done) {
			request(server)
			.get('/user/GetUserProfileNew')
			.query(qs.stringify({
				UserId: dUser2.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('object').that.has.property('ProfileName').that.is.equal(testUser2.ProfileName);
				done();
			});
		});

		it('should fail when ID does not match', function(done) {
			request(server)
			.get('/user/GetUserProfileNew')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Record not found...');
				expect(res.body.data).to.be.null;
				done();
			});
		});
	});
	
	describe('/user/SaveUserNew', function() {
		it('should save user if credentials and permissions are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/user/SaveUserNew')
			.set('authorization', token)
			.set('x-requested-with', dModule.Module)
			.send({
				id: dUser2.id,
				roleId: [ { id: dRole2.id } ]
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User updated successfully...');
				expect(res.body.data).to.be.an('object');
				dUserRole3 = res.body.data;
				done();
			});
		});
		
		it('should fail when credentials and permissions are wrong', function(done) {
			request(server)
			.post('/user/SaveUserNew')
			.send({
				id: dUser2.id,
				roleId: [ { id: dRole2.id } ]
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

	describe('/user/UpdateMobileUserOwner', function() {
		it('should update mobile user owner if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/user/UpdateMobileUserOwner')
			.set('authorization', token)
			.send(dUser2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User updated successfully...');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/user/UpdateMobileUserOwner')
			.send(dUser2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/user/UpdateMobileUserOwnerNew', function() {
		it('should update mobile user owner if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/user/UpdateMobileUserOwnerNew')
			.set('authorization', token)
			.send(dUser2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User updated successfully...');
				expect(res.body.data).to.be.an('object');
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/user/UpdateMobileUserOwnerNew')
			.send(dUser2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/user/uploadImage', function() {
		it('should upload image', function(done) {
			request(server)
			.post('/user/uploadImage')
			.attach(dUser2.id, __dirname + '/../MediaUploads/default-user.png')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Images Uploaded Successfully...');
				expect(res.body.data).to.not.be.null;
				uploadedImgPath = res.body.data;
				done();
			});
		});
	});

	describe('/user/GetAllDynamicOwnerCustomer', function() {
		it('should get all owner customers by paging', function(done) {
			request(server)
			.get('/user/GetAllDynamicOwnerCustomer')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'email', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'phone', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'country', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'OTP', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsMobileVerify', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalDevice', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				appId: testUser2.idApp,
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

		it('should get all owner customers by paging when searching', function(done) {
			request(server)
			.get('/user/GetAllDynamicOwnerCustomer')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'email', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'phone', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'country', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'OTP', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IsMobileVerify', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'TotalDevice', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testUser2.username,
				appId: testUser2.idApp,
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

	// describe('/role/DeleteRole', function() {
	// 	it('should delete role when credentials and permissions are correct', function(done) {
	// 		var token = {
	// 			username: dUser.username,
	// 			password: dUser.password
	// 		};
	// 		token = 'JWT ' + jwt.encode(token, 'bugz');

	// 		request(server)
	// 		.get('/role/DeleteRole')
	// 		.set('authorization', token)
	// 		.set('x-requested-with', dModule.Module)
	// 		.query(qs.stringify({
	// 			idRole: dRole3.id
	// 		}))
	// 		.end(function(err, res) {
	// 			expect(res.body).to.exist;
	// 			expect(res.body).to.have.property('success');
	// 			expect(res.body).to.have.property('message');
	// 			expect(res.body).to.have.property('data');
	// 			expect(res.body.success).to.equal(true);
	// 			expect(res.body.message).to.equal('Role deleted successfully...');
	// 			expect(res.body.data).to.equal(1);
	// 			done();
	// 		});
	// 	});

	// 	it('should fail when credentials and permissions are wrong', function(done) {
	// 		request(server)
	// 		.get('/role/DeleteRole')
	// 		.query(qs.stringify({
	// 			idRole: 0
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