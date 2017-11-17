var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testUser1 = {
	email: 'unittest.user@bugzstudio.com',
	username: 'unittest.user@bugzstudio.com',
	password: 'unittest.user',
	ProfileName: 'Unit Test User',
	IsMobileVerify: false,
	idApp: 1
};
var testUser2 = {
	email: 'unittest.user2@bugzstudio.com',
	username: 'unittest.user2@bugzstudio.com',
	password: 'unittest.user2',
	profileName: 'Unit Test User 2',
	agentId: 0,
	appId: 1
};
var testRole1 = {
	id: 0,
	RoleName: 'UnitTestUser',
	Description: 'Unit Test User',
	Country: 'Malaysia'
};
var testGpsDevice1 = {
	DeviceId: '1234567890123x',
	IMEI: '51234567890123x',
	CreatedDate: new Date(),
	Type: 'TEST100',
	Version: null,
	CreatedBy: 'UnitTest',
	CountryId: null,
	TelCoId: null,
	SimNum: null,
	idSalesAgent: null,
	IsActive: true,
	ExpiryDate: new Date(),
	AppName: 'UnitTest1',
	idSim: null,
	ActivationDate: new Date()
};
var testDeviceAgentRetailer1 = {
	id: 0,
	agentId: 0,
	retailerId: 0,
	deviceId: '1234567890123x',
	activatedDatetime: null,
	expiryDatetime: null,
	createdDatetime: new Date(),
	lastModifiedDatetime: new Date(),
	simSerial: '1234567890123'
};

describe('/salesAgent', function() {
	this.timeout(5000);

	var server;
	var User;
	var Role;
	var UserRole;
	var GpsDevice;
	var AgentRetailer;
	var DeviceAgentRetailer;
	var dUser;
	var dUser2;
	var dRole;
	var dUserRole;
	var dGpsDevice;
	var dAgentRetailer;
	var dDeviceAgentRetailer;
	var dDeviceAgentRetailer2;
	
	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		User = models.tbluserinformation;
		Role = models.tblrole;
		UserRole = models.tbluserinrole;
		GpsDevice = models.tblgpsdevice;
		AgentRetailer = models.tblagentretailer;
		DeviceAgentRetailer = models.tbldeviceagentretailer;

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
			return GpsDevice.create(testGpsDevice1);
		})
		.then(function(rGpsDevice) {
			dGpsDevice = rGpsDevice;
			return AgentRetailer.create({
				agentId: dUser.id,
				retailerId: dUser.id,
				createdDatetime: new Date()
			});
		})
		.then(function(rAgentRetailer) {
			dAgentRetailer = rAgentRetailer;
			return DeviceAgentRetailer.create(testDeviceAgentRetailer1);
		})
		.then(function(rDeviceAgentRetailer) {
			dDeviceAgentRetailer = rDeviceAgentRetailer;
			done();
		});
	});

	after(function(done) {
		DeviceAgentRetailer.destroy({
			where: {
				agentId: dDeviceAgentRetailer2.agentId,
				deviceId: dDeviceAgentRetailer2.deviceId
			}
		})
		.then(function() {
			return AgentRetailer.destroy({
				where: {
					agentId: dUser.id,
					retailerId: dUser2.id,
				}
			});
		})
		.then(function() {
			return UserRole.destroy({
				where: {
					userId: dUser2.id
				}
			});
		})
		.then(function() {
			return User.destroy({
				where: {
					username: {
						$like: 'unittest.user2%'
					}
				}
			});
		})
		.then(function() {
			return dDeviceAgentRetailer.destroy();
		})
		.then(function() {
			return dAgentRetailer.destroy();
		})
		.then(function() {
			return dGpsDevice.destroy();
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
			done();
		});
	});

	describe('/salesAgent/assignDevice', function() {
		it('should assign device to sales agent', function(done) {
			request(server)
			.post('/salesAgent/assignDevice')
			.send({
				deviceId: testGpsDevice1.DeviceId,
				userId: dUser.id
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Assigned device to agent.');
				expect(res.body.data).to.be.an('object');
				dDeviceAgentRetailer2 = res.body.data;
				done();
			});
		});
		
		it('should fail when gps device not found', function(done) {
			request(server)
			.post('/salesAgent/assignDevice')
			.send({
				userId: dUser.id
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('GPS device not found.');
				done();
			});
		});

		it('should fail when user not found', function(done) {
			request(server)
			.post('/salesAgent/assignDevice')
			.send({
				deviceId: testGpsDevice1.DeviceId
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('User not found.');
				done();
			});
		});
	});

	describe('/salesAgent/registerRetailerAccount', function() {
		it('should register retailer account', function(done) {
			testUser2.agentId = dUser.id;
			
			request(server)
			.post('/salesAgent/registerRetailerAccount')
			.send(testUser2)
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Retailer account created!');
				expect(res.body.data).to.be.an('object');
				dUser2 = res.body.data;
				done();
			});
		});

		it('should fail when account with email exists', function(done) {
			request(server)
			.post('/salesAgent/registerRetailerAccount')
			.send(testUser2)
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('An account with this email already exists.');
				done();
			});
		});
	});

	describe('/salesAgent/getActivatedDevices', function() {
		it('should get activated devices', function(done) {
			request(server)
			.get('/salesAgent/getActivatedDevices')
			.query(qs.stringify({
				agentId: dUser.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record(s) found.');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(0);
				expect(res.body.notActivatedCount).to.equal(1);
				expect(res.body.activatedCount).to.equal(0);
				done();
			});
		});
	});

	describe('/salesAgent/getPagedDevicesByAgentId', function() {
		it('should get paged devices by agent id', function(done) {
			request(server)
			.get('/salesAgent/getPagedDevicesByAgentId')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'deviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'tbluserinformation.ProfileName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'activatedDatetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
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
				_: 1500000000000,
				agentId: dUser.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Device(s) found.');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				expect(res.body.draw).to.equal('1');
				expect(res.body.recordsTotal).to.be.at.least(1);
				expect(res.body.recordsFiltered).to.be.at.least(1);
				done();
			});
		});
		
		it('should get paged clients by retailer id when searching', function(done) {
			request(server)
			.get('/salesAgent/getPagedDevicesByAgentId')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'deviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'tbluserinformation.ProfileName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'activatedDatetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: {
					value: testGpsDevice1.DeviceId,
					regex: false
				},
				_: 1500000000000,
				agentId: dUser.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Device(s) found.');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				expect(res.body.draw).to.equal('1');
				expect(res.body.recordsTotal).to.be.at.least(1);
				expect(res.body.recordsFiltered).to.be.at.least(1);
				done();
			});
		});
	});
});