var require = require('really-need');
var request = require('supertest');
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
var testServiceEnhancementType1 = {
	id: 0,
	Type: 'UnitTestServiceEnhancementType1',
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null,
	Month: 1
};
var testServiceEnhancementType2 = {
	id: 0,
	Type: 'UnitTestServiceEnhancementType2',
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null,
	Month: 1
};
var testServiceEnhancementType3 = {
	id: 0,
	Type: 'UnitTestServiceEnhancementType3',
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null,
	Month: 1
};
var testServiceEnhancementNotification1 = {
	Id: 0,
	IdServiceEnhancement: 0,
	idvehicle: 0,
	CreatedDate: new Date(),
	Message: 'UnitTestMessage1',
	days: 0,
	IsRead: false
};
var testServiceEnhancement1 = {
	id: 0,
	idvehicle: 0,
	idUser: 0,
	DeviceId: testVehicle1.deviceid,
	Type: testServiceEnhancementType1.Type,
	Fromdate: new Date(),
	Todate: new Date(),
	IsActive: true,
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null,
	Title: 'UnitTestServiceEnhancement1',
	Description: 'UnitTestServiceEnhancement1',
	Currentkm: 0,
	Expiredkm: 0,
	IsDelete: false,
	WorkShop: 'UnitTestWorkshop1',
	ContectNo: '0123456789',
	IsComplete: true
};
var testServiceEnhancement2 = {
	id: 0,
	idvehicle: 0,
	idUser: 0,
	DeviceId: testVehicle1.deviceid,
	Type: testServiceEnhancementType1.Type,
	Fromdate: new Date(),
	Todate: new Date(),
	IsActive: true,
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null,
	Title: 'UnitTestServiceEnhancement2',
	Description: 'UnitTestServiceEnhancement2',
	Currentkm: 0,
	Expiredkm: 0,
	IsDelete: false,
	WorkShop: 'UnitTestWorkshop2',
	ContectNo: '0123456789',
	IsComplete: true
};
var testServiceEnhancement3 = {
	id: 0,
	idvehicle: 0,
	idUser: 0,
	DeviceId: testVehicle1.deviceid,
	Type: testServiceEnhancementType3.Type,
	Fromdate: new Date(),
	Todate: new Date(),
	IsActive: true,
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: null,
	ModifiedDate: null,
	Title: 'UnitTestServiceEnhancement3',
	Description: 'UnitTestServiceEnhancement3',
	Currentkm: 0,
	Expiredkm: 0,
	IsDelete: false,
	WorkShop: 'UnitTestWorkshop3',
	ContectNo: '0123456789',
	IsComplete: true
};
var testServiceEnhancementCountry1 = {
	Id: 0,
	IdServiceEnhancementType: 0,
	Country: 'UnitTestCountry1'
};
var testServiceEnhancementCountry2 = {
	Id: 0,
	IdServiceEnhancementType: 0,
	Country: 'UnitTestCountry2'
};
var testUser1 = {
	email: 'unittest.user@bugzstudio.com',
	username: 'unittest.user@bugzstudio.com',
	password: 'unittest.user',
	ProfileName: 'UnitTestUser1',
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
var testPermission1 = {
	idModule: 0,
	RoleName: testRole1.RoleName,
	Added: true,
	Modified: true,
	Deleted: true,
	Show: true
};

describe('/serviceenhancement', function() {
	this.timeout(5000);

	var server;
	var User;
	var Role;
	var UserRole;
	var Module;
	var Permission;
	var ServiceEnhancement;
	var ServiceEnhancementType;
	var Vehicle;
	var ServiceEnhancementNotification;
	var ServiceEnhancementCountry;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;
	var dServiceEnhancement;
	var dServiceEnhancement3;
	var dServiceEnhancementType;
	var dServiceEnhancementType3
	var dVehicle;
	var dServiceEnhancementNotification;
	var dServiceEnhancementCountry;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		User = models.tbluserinformation;
		Role = models.tblrole;
		UserRole = models.tbluserinrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;
		ServiceEnhancement = models.tblserviceenhancement;
		ServiceEnhancementType = models.tblserviceenhancementtype;
		Vehicle = models.tblvehicle;
		ServiceEnhancementNotification = models.tblserviceenhancementnotification;
		ServiceEnhancementCountry = models.tblserviceenhancementincountry;
		
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
			testVehicle1.iduser = dUser.id;
			return Vehicle.create(testVehicle1);
		})
		.then(function(rVehicle) {
			dVehicle = rVehicle;
			return ServiceEnhancementType.create(testServiceEnhancementType1);
		})
		.then(function(rServiceEnhancementType) {
			dServiceEnhancementType = rServiceEnhancementType;
			return ServiceEnhancementType.create(testServiceEnhancementType3);
		})
		.then(function(rServiceEnhancementType) {
			dServiceEnhancementType3 = rServiceEnhancementType;
			testServiceEnhancement1.idvehicle = dVehicle.id;
			testServiceEnhancement1.idUser = dUser.id;
			return ServiceEnhancement.create(testServiceEnhancement1);
		})
		.then(function(rServiceEnhancement) {
			dServiceEnhancement = rServiceEnhancement;
			testServiceEnhancement3.idvehicle = dVehicle.id;
			testServiceEnhancement3.idUser = dUser.id;
			return ServiceEnhancement.create(testServiceEnhancement3);
		})
		.then(function(rServiceEnhancement) {
			dServiceEnhancement3 = rServiceEnhancement;
			testServiceEnhancementNotification1.idvehicle = dVehicle.id;
			testServiceEnhancementNotification1.IdServiceEnhancement = dServiceEnhancement.id;
			return ServiceEnhancementNotification.create(testServiceEnhancementNotification1);
		})
		.then(function(rServiceEnhancementNotification) {
			dServiceEnhancementNotification = rServiceEnhancementNotification;
			testServiceEnhancementCountry1.IdServiceEnhancementType = dServiceEnhancementType.id;
			return ServiceEnhancementCountry.create(testServiceEnhancementCountry1);
		})
		.then(function(rServiceEnhancementCountry) {
			dServiceEnhancementCountry = rServiceEnhancementCountry;
			done();
		});
	});

	after(function(done) {
		ServiceEnhancementCountry.destroy({ where: { Country: { $like: 'UnitTest%' } } })
		.then(function() {
			return ServiceEnhancementNotification.destroy({ where: { Message: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return ServiceEnhancement.destroy({ where: { Title: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return ServiceEnhancementType.destroy({ where: { Type: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return Vehicle.destroy({ where: { Name: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return Permission.destroy({ where: { RoleName: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return Module.destroy({ where:{ Module: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return dUserRole.destroy();
		})
		.then(function() {
			return Role.destroy({ where: { RoleName: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return User.destroy({ where: { username: { $like: 'unittest%' } } });
		})
		.then(function() {
			done();
		});
	});

	describe('/serviceenhancement/GetAllServiceEnhacementType', function() {
		it('should get all service enhancement types', function(done) {
			request(server)
			.get('/serviceenhancement/GetAllServiceEnhacementType')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/serviceenhancement/getAllSericeInCountry', function() {
		it('should get all service in country', function(done) {
			request(server)
			.get('/serviceenhancement/GetAllSericeInCountry')
			.query(qs.stringify({
				id: dServiceEnhancementType.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0]).to.have.property('Country').that.is.equal(testServiceEnhancementCountry1.Country);
				done();
			});
		});

		it('should fail when no country matches', function(done) {
			request(server)
			.get('/serviceenhancement/GetAllSericeInCountry')
			.query(qs.stringify({
				id: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/serviceenhancement/SaveServiceType', function() {
		it('should save service type when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz'); 
			
			request(server)
			.post('/serviceenhancement/SaveServiceType')
			.set('authorization', token)
			.set('x-requested-with', testModule1.Module)
			.send(testServiceEnhancementType2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Service Type created successfully...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(2);
				expect(res.body.data[0].Type).to.equal(testServiceEnhancementType2.Type);
				expect(res.body.data[1]).to.equal(true);
				done();
			});
		});

		// it('should fail when credentials are wrong', function(done) {
		// 	request(server)
		// 	.post('/serviceenhancement/SaveServiceType')
		// 	.send(testServiceEnhancementType2)
		// 	.end(function(err, res) {
		// 		expect(res.body).to.exist;
		// 		expect(res.body.success).to.equal(false);
		// 		expect(res.body.message).to.equal('Invalid token...');
		// 		expect(res.body.data).to.equal('TOKEN');
		// 		done();
		// 	});
		// });
	});

	describe('/serviceenhancement/SaveServiceInCountry', function() {
		it('should save service country when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testServiceEnhancementCountry2.IdServiceEnhancementType = dServiceEnhancementType.id;
			
			request(server)
			.post('/serviceenhancement/SaveServiceInCountry')
			.set('authorization', token)
			.set('x-requested-with', testModule1.Module)
			.send(testServiceEnhancementCountry2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Service add in country successfully...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object').that.has.property('Country').that.is.equal(testServiceEnhancementCountry2.Country);
				expect(res.body.data[1]).to.equal(true);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/serviceenhancement/SaveServiceInCountry')
			.send(testServiceEnhancementCountry2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/serviceenhancement/DeleteServicefromCountry', function() {
		it('should delete service from country when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/serviceenhancement/DeleteServicefromCountry')
			.set('authorization', token)
			.set('x-requested-with', testModule1.Module)
			.query(qs.stringify({
				IdServiceEnhancementType: dServiceEnhancementCountry.IdServiceEnhancementType,
				Country: dServiceEnhancementCountry.Country
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Service remove from country successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/serviceenhancement/DeleteServicefromCountry')
			.query(qs.stringify({
				IdServiceEnhancementType: dServiceEnhancementCountry.IdServiceEnhancementType,
				Country: dServiceEnhancementCountry.Country
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

	// Test get before delete
	describe('/serviceenhancement/GetAllServiceEnhacementTypebyCountry', function() {
		it('should get all service enhancement types when query matches', function(done) {
			request(server)
			.get('/serviceenhancement/GetAllServiceEnhacementTypebyCountry')
			.query(qs.stringify({
				Country: testServiceEnhancementCountry2.Country
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				done();
			});
		});

		it('should fail when query does not match', function(done) {
			request(server)
			.get('/serviceenhancement/GetAllServiceEnhacementTypebyCountry')
			.query(qs.stringify({
				Country: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/serviceenhancement/DeleteSevcieType', function() {
		it('should delete service type when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/serviceenhancement/DeleteSevcieType')
			.set('authorization', token)
			.query(qs.stringify({
				id: dServiceEnhancementType.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Sevcie Type deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.get('/serviceenhancement/DeleteSevcieType')
			.query(qs.stringify({
				id: 0
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

	describe('/serviceenhancement/GetAllServiceData', function() {
		it('should get all service data when query matches', function(done) {
			request(server)
			.get('/serviceenhancement/GetAllServiceData')
			.query(qs.stringify({
				DeviceId: testServiceEnhancement1.DeviceId,
				idUser: testServiceEnhancement1.idUser,
				page: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(2);
				expect(res.body[0]).to.have.property('Title').that.is.equal(testServiceEnhancement3.Title);
				expect(res.body[1]).to.have.property('Title').that.is.equal(testServiceEnhancement1.Title);
				done();
			});
		});

		it('should fail when query does not match', function(done) {
			request(server)
			.get('/serviceenhancement/GetAllServiceData')
			.query(qs.stringify({
				DeviceId: '',
				idUser: 0,
				page: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/serviceenhancement/getAllServiceNotification', function() {
		it('should get all service notification when query matches', function(done) {
			request(server)
			.get('/serviceenhancement/getAllServiceNotification')
			.query(qs.stringify({
				DeviceId: testServiceEnhancement1.DeviceId,
				idUser: testServiceEnhancement1.idUser,
				page: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(1);
				expect(res.body[0]).to.have.property('Message').that.is.equal(testServiceEnhancementNotification1.Message);
				done();
			});
		});

		it('should fail when query does not match', function(done) {
			request(server)
			.get('/serviceenhancement/getAllServiceNotification')
			.query(qs.stringify({
				DeviceId: '',
				idUser: 0,
				page: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/serviceenhancement/SaveService', function() {
		it('should save service when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			testServiceEnhancement2.Fromdate = new Date().toUTCString().replace(/\sGMT/g, '');
			testServiceEnhancement2.Todate = new Date().toUTCString().replace(/\sGMT/g, '');
			
			request(server)
			.post('/serviceenhancement/SaveService')
			.set('authorization', token)
			.send(testServiceEnhancement2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Service Save Successfully');
				expect(res.body.err).to.equal(null);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/serviceenhancement/SaveService')
			.send(testServiceEnhancement2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/serviceenhancement/DeleteRemiderService', function() {
		it('should delete reminder service if it exists', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.get('/serviceenhancement/DeleteRemiderService')
			.set('authorization', token)
			.query(qs.stringify({
				id: dServiceEnhancement.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Reminder service deleted Successfully');
				expect(res.body.err).to.equal(null);
				done();
			});
		});

		it('should fail if reminder service does not exist', function(done) {
			request(server)
			.get('/serviceenhancement/DeleteRemiderService')
			.query(qs.stringify({
				id: 0
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

	describe('/serviceenhancement/UpdateReadStatus', function() {
		it('should update read status when credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/serviceenhancement/UpdateReadStatus')
			.set('authorization', token)
			.send([
				dServiceEnhancementNotification.Id
			])
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.data[0]).to.equal(1);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/serviceenhancement/UpdateReadStatus')
			.send([
				dServiceEnhancementNotification.Id
			])
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid token...');
				expect(res.body.data).to.equal('TOKEN');
				done();
			});
		});
	});

	describe('/serviceenhancement/CompleteSevice', function() {
		it('should complete service if credentials are correct', function(done) {
			var token = {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');

			request(server)
			.get('/serviceenhancement/CompleteSevice')
			.set('authorization', token)
			.query(qs.stringify({
				id: dServiceEnhancement3.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('New service reminder created successfully');
				done();
			});
		});
		
		it('should fail if credentials are wrong', function(done) {
			request(server)
			.get('/serviceenhancement/CompleteSevice')
			.query(qs.stringify({
				id: dServiceEnhancement3.id
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