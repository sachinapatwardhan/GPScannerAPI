var request = require('supertest');
var expect = require('chai').expect;
var fs = require('fs');
var qs = require('qs');

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
var testGpsDevice2 = {
	DeviceId: '1234567890124x',
	IMEI: '51234567890124x',
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
var testGpsDevice3 = {
	DeviceId: '1234567890125x',
	IMEI: '51234567890125x',
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
var testGpsDevice4 = {
	DeviceId: '1234567890126x',
	IMEI: '51234567890126x',
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
var testGpsDevice5 = {
	DeviceId: '1234567890127x',
	IMEI: '51234567890127x',
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
var testDeviceAgentRetailer3 = {
	id: 0,
	agentId: 0,
	retailerId: 0,
	deviceId: '1234567890125x',
	activatedDatetime: null,
	expiryDatetime: null,
	createdDatetime: new Date(),
	lastModifiedDatetime: new Date(),
	simSerial: '1234567890125'
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
	id: 0,
	RoleName: 'Sales Agent',
	Description: 'UnitTestRole1',
	Country: 'UnitTestCountry1'
};

describe('/admin', function() {
	this.timeout(5000);

	var server;
	var User;
	var Role;
	var UserRole;
	var DeviceAgentRetailer;
	var GpsDevice;
	var dUser;
	var dRole;
	var dUserRole;
	var dDeviceAgentRetailer;
	var dDeviceAgentRetailer2;
	var dDeviceAgentRetailer3;
	var dGpsDevice;
	var dGpsDevice2;
	var dGpsDevice4;
	var dGpsDevice5;

	before(function(done) {
		server = require('../server');

		User = models.tbluserinformation;
		Role = models.tblrole;
		UserRole = models.tbluserinrole;
		DeviceAgentRetailer = models.tbldeviceagentretailer;
		GpsDevice = models.tblgpsdevice;

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
			return GpsDevice.create(testGpsDevice2);
		})
		.then(function(rGpsDevice) {
			dGpsDevice2 = rGpsDevice;
			return GpsDevice.create(testGpsDevice4);
		})
		.then(function(rGpsDevice) {
			dGpsDevice4 = rGpsDevice;
			return GpsDevice.create(testGpsDevice5);
		})
		.then(function(rGpsDevice) {
			dGpsDevice5 = rGpsDevice;
			testDeviceAgentRetailer1.agentId = dUser.id;
			return DeviceAgentRetailer.create(testDeviceAgentRetailer1);
		})
		.then(function(rDeviceAgentRetailer) {
			dDeviceAgentRetailer = rDeviceAgentRetailer;
			testDeviceAgentRetailer3.agentId = dUser.id;
			testDeviceAgentRetailer3.retailerId = 99999999;
			return DeviceAgentRetailer.create(testDeviceAgentRetailer3);
		})
		.then(function(rDeviceAgentRetailer) {
			dDeviceAgentRetailer3 = rDeviceAgentRetailer;
			done();
		});
	});

	after(function(done) {
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/AssignDeviceTemplate.xlsx');
		} catch (err) {}

		DeviceAgentRetailer.destroy({ where: { deviceId: { $or: ['1234567890123x', '1234567890124x', '1234567890125x', '1234567890126x', '1234567890127x'] } } })
		.then(function() {
			return GpsDevice.destroy({ where: { AppName: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return UserRole.destroy({ where: { userId: dUser.id } });
		})
		.then(function() {
			return Role.destroy({ where: { Description: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			return User.destroy({ where: { username: { $like: 'unittest%' } } });
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/admin/getAutocompleteSalesAgent', function(req, res) {
		it('should get autocomplete sales agents when query matches', function(done) {
			request(server)
			.get('/admin/getAutocompleteSalesAgent')
			.query(qs.stringify({
				username: testUser1.username
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record(s) found.');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.data[0]).to.be.an('object').that.has.property('id').that.is.equal(dUser.id);
				done();
			});
		});

		it('should fail when query does not match', function(done) {
			request(server)
			.get('/admin/getAutocompleteSalesAgent')
			.query(qs.stringify({
				username: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('No record(s) found.');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/admin/transferStock', function() {
		it('should transfer device when device is able to be transferred', function(done) {
			request(server)
			.post('/admin/transferStock')
			.send({
				deviceId: testDeviceAgentRetailer1.deviceId,
				toAgentId: testDeviceAgentRetailer1.agentId
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Device transferred.');
				expect(res.body.data).to.be.an('object').that.has.property('simSerial').that.is.equal(testDeviceAgentRetailer1.simSerial);
				done();
			});
		});

		it('should fail if device not found', function(done) {
			request(server)
			.post('/admin/transferStock')
			.send({
				deviceId: '',
				toAgentId: testDeviceAgentRetailer1.agentId
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Unable to transfer device. Device ID not found.');
				done();
			});
		});
	});

	describe('/admin/getAllGpsDevices', function() {
		it('should get all gps devices', function(done) {
			request(server)
			.get('/admin/getAllGpsDevices')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Type', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IMEI', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Version', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AppName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'ExpiryDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedBy', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
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
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Device(s) found.');
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				expect(+res.body.draw).to.equal(1);
				expect(res.body.recordsFiltered).to.be.at.least(1);
				expect(res.body.recordsTotal).to.be.at.least(1);
				done();
			});
		});

		it('should get gps devices filtered by sales agent', function(done) {
			request(server)
			.get('/admin/getAllGpsDevices')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Type', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'IMEI', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Version', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'AppName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'ExpiryDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedBy', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
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
				agentId: testDeviceAgentRetailer1.agentId
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Device(s) found.');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.data[0]).to.be.an('object').that.has.property('Type').that.is.equal(testGpsDevice1.Type);
				expect(+res.body.draw).to.equal(1);
				expect(res.body.recordsFiltered).to.equal(1);
				expect(res.body.recordsTotal).to.equal(1);
				done();
			});
		});
	});

	
	describe('/admin/assignDevice', function() {
		// Test fail case before success
		it('should fail when gps device not found', function(done) {
			request(server)
			.post('/admin/assignDevice')
			.send({
				deviceId: '',
				userId: dUser.id,
				assign: true,
				appName: testGpsDevice2.AppName
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('GPS device not found.');
				done();
			});
		});

		// Test fail case before success
		it('should fail when user not found', function(done) {
			request(server)
			.post('/admin/assignDevice')
			.send({
				deviceId: testGpsDevice2.DeviceId,
				userId: 0,
				assign: true,
				appName: testGpsDevice2.AppName
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('User not found.');
				done();
			});
		});

		// Test unassign before assign
		it('should unable to unassign when device has not yet been assigned', function(done) {
			request(server)
			.post('/admin/assignDevice')
			.send({
				deviceId: testGpsDevice2.DeviceId,
				userId: dUser.id,
				assign: false,
				appName: testGpsDevice2.appName
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Unable to unassign device. Device not assigned.');
				done();
			});
		});
		
		it('should assign device to sales agent', function(done) {
			request(server)
			.post('/admin/assignDevice')
			.send({
				deviceId: testGpsDevice2.DeviceId,
				userId: dUser.id,
				assign: true,
				appName: testGpsDevice2.AppName
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Assigned device to agent.');
				expect(res.body.data).to.be.an('object').that.has.property('agentId').that.is.equal(dUser.id);
				dDeviceAgentRetailer2 = res.body.data;
				done();
			});
		});

		// Test assigned case
		it('should fail when device already assigned', function(done) {
			request(server)
			.post('/admin/assignDevice')
			.send({
				deviceId: testGpsDevice2.DeviceId,
				userId: dUser.id,
				assign: true,
				appName: testGpsDevice2.AppName
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Device is already assigned.');
				done();
			});
		});

		// Test activated case
		it('should unable to unassign when device has already been activated', function(done) {
			request(server)
			.post('/admin/assignDevice')
			.send({
				deviceId: testGpsDevice3.DeviceId,
				userId: dUser.id,
				assign: false,
				appName: testGpsDevice3.AppName
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Unable to unassign device. Device has already been activated.');
				done();
			});
		});

		// Test unassign after assigned
		it('should unassign', function(done) {
			request(server)
			.post('/admin/assignDevice')
			.send({
				deviceId: testGpsDevice2.DeviceId,
				userId: dUser.id,
				assign: false,
				appName: testGpsDevice2.AppName
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Device unassigned.');
				done();
			});
		});
	});

	describe('/admin/assignDeviceByExcel', function() {
		it('should assign device by excel', function(done) {
			request(server)
			.post('/admin/assignDeviceByExcel')
			.attach('file', __dirname + '/../MediaUploads/UnitTest/AssignDeviceTemplate.xlsx')
			.field('appName', testGpsDevice4.AppName)
			.field('createdBy', '')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Device(s) assigned.');
				done();
			});
		});

		it('should fail when devices assigned and all failed', function(done) {
			request(server)
			.post('/admin/assignDeviceByExcel')
			.attach('file', __dirname + '/../MediaUploads/UnitTest/AssignDeviceTemplate.xlsx')
			.field('appName', testGpsDevice4.AppName)
			.field('createdBy', '')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Failed to assign any devices.');
				done();
			});
		});
	});
	
	describe('/admin/downloadAssignDeviceExcelTemplate', function() {
		it('should download assign device excel template', function(done) {
			request(server)
			.get('/admin/downloadAssignDeviceExcelTemplate')
			.end(function(err, res) {
				expect(res.text).to.exist;
				expect(res.header['content-type']).to.equal('application/vnd.openxmlformats');
				expect(res.header['content-disposition']).to.equal('attachment; filename=AssignDeviceTemplate.xlsx');
				done();
			});
		});
	});
});