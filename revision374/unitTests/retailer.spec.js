var request = require('supertest');
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
var testDeviceAgentRetailer2 = {
	id: 0,
	agentId: 0,
	retailerId: 0,
	deviceId: '1234567890124x',
	activatedDatetime: null,
	expiryDatetime: null,
	createdDatetime: new Date(),
	lastModifiedDatetime: new Date(),
	simSerial: '1234567890123'
};

describe('/retailer', function() {
	this.timeout(5000);
	
	var server;
	var User;
	var Vehicle;
	var DeviceAgentRetailer;
	var dUser;
	var dVehicle;
	var dDeviceAgentRetailer;
	var dDeviceAgentRetailer2;

	before(function(done) {
		server = require('../server');

		User = models.tbluserinformation;
		Vehicle = models.tblvehicle;
		DeviceAgentRetailer = models.tbldeviceagentretailer;

		User.create(testUser1)
		.then(function(rUser) {
			dUser = rUser;
			testVehicle1.iduser = dUser.id;
			return Vehicle.create(testVehicle1);
		})
		.then(function(rVehicle) {
			dVehicle = rVehicle;
			testDeviceAgentRetailer1.retailerId = dUser.id;
			return DeviceAgentRetailer.create(testDeviceAgentRetailer1);
		})
		.then(function(rDeviceAgentRetailer) {
			dDeviceAgentRetailer = rDeviceAgentRetailer;
			testDeviceAgentRetailer2.retailerId = dUser.id;
			testDeviceAgentRetailer2.activatedDatetime = moment().subtract(5, 'minutes');
			testDeviceAgentRetailer2.expiryDatetime = moment().add(1, 'year');
			return DeviceAgentRetailer.create(testDeviceAgentRetailer2);
		})
		.then(function(rDeviceAgentRetailer) {
			dDeviceAgentRetailer2 = rDeviceAgentRetailer;
			done();
		});
	});

	after(function(done) {
		dDeviceAgentRetailer2.destroy()
		.then(function() {
			return dDeviceAgentRetailer.destroy();
		})
		.then(function() {
			return dVehicle.destroy();
		})
		.then(function() {
			return dUser.destroy();
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/retailer/getPagedClientsByRetailerId', function() {
		it('should get paged clients by retailer id', function(done) {
			request(server)
			.get('/retailer/getPagedClientsByRetailerId')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'tblvehicle.tbluserinformation.ProfileName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'expiryDatetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'activatedDatetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'tblvehicle.tbluserinformation.phone', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'tblvehicle.tbluserinformation.email', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
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
				retailerId: testDeviceAgentRetailer1.retailerId
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record(s) found.');
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
			.get('/retailer/getPagedClientsByRetailerId')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'tblvehicle.tbluserinformation.ProfileName', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'expiryDatetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'activatedDatetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'tblvehicle.tbluserinformation.phone', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'tblvehicle.tbluserinformation.email', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: {
					value: testUser1.ProfileName,
					regex: false
				},
				_: 1500000000000,
				retailerId: testDeviceAgentRetailer1.retailerId
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record(s) found.');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				expect(res.body.draw).to.equal('1');
				expect(res.body.recordsTotal).to.be.at.least(1);
				expect(res.body.recordsFiltered).to.be.at.least(1);
				done();
			});
		});
	});

	describe('/retailer/getAutocompleteActivateDeviceIds', function() {
		it('should get autocomplete activate device IDs', function(done) {
			request(server)
			.get('/retailer/getAutocompleteActivateDeviceIds')
			.query(qs.stringify({
				deviceId: testDeviceAgentRetailer1.deviceId
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record(s) found.');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				done();
			});
		});

		it('should fail when no records found', function(done) {
			request(server)
			.get('/retailer/getAutocompleteActivateDeviceIds')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('No record(s) found.');
				done();
			});
		});
	});

	describe('/retailer/getAutocompleteReconfigureDeviceIds', function() {
		it('should get autocomplete reconfigure device IDs', function(done) {
			request(server)
			.get('/retailer/getAutocompleteReconfigureDeviceIds')
			.query(qs.stringify({
				deviceId: testDeviceAgentRetailer2.deviceId
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record(s) found.');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				done();
			});
		});

		it('should fail when no records found', function(done) {
			request(server)
			.get('/retailer/getAutocompleteReconfigureDeviceIds')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('No record(s) found.');
				done();
			});
		});
	});

	describe('/retailer/activateDevice', function() {
		it('should activate device', function(done) {
			request(server)
			.post('/retailer/activateDevice')
			.send({
				deviceId: testDeviceAgentRetailer1.deviceId,
				retailerId: dUser.id
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Device activated!');
				expect(res.body.data).to.be.an('object').that.has.property('retailerId').that.is.equal(dUser.id);
				done();
			});
		});
	});
});