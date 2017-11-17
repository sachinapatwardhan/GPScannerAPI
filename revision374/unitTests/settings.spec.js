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
var testHandshake1 = {
	Id: 0,
	DeviceId: '1234567890123x',
	Datetime: new Date()
};
var testUser1 = {
	email: 'unittest.user@bugzstudio.com',
	username: 'unittest.user@bugzstudio.com',
	password: 'unittest.user',
	ProfileName: 'Unit Test User',
	IsMobileVerify: false,
	idApp: 1
};

describe('/gpsdata', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var User;
	var Vehicle;
	var Handshake;
	var dUser;
	var dVehicle;
	var dHandshake;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		User = models.tbluserinformation;
		Vehicle = models.tblvehicle;
		Handshake = models.tblhandshake;
		
		testUser1.password = jwt.encode(testUser1.password, 'bugz');
		User.create(testUser1)
		.then(function(rUser) {
			dUser = rUser;
			testVehicle1.iduser = dUser.id;
			return Vehicle.create(testVehicle1);
		})
		.then(function(rVehicle) {
			dVehicle = rVehicle;
			return Handshake.create(testHandshake1);
		})
		.then(function(rHandshake) {
			dHandshake = rHandshake;
			done();
		});
	});

	after(function(done) {
		dHandshake.destroy()
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

	describe('/settings/GetAllDynamickHandshake', function() {
		it('should get all handshake by paging', function(done) {
			request(server)
			.get('/settings/GetAllDynamickHandshake')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Datetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				_: 1500000000000,
				idApp: testUser1.idApp,
				fromdate: moment.utc().startOf('month').format(),
				todate: moment.utc().endOf('month').format(),
				DeviceId: testVehicle1.DeviceId,
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('draw');
				expect(res.body).to.have.property('recordsTotal');
				expect(res.body).to.have.property('recordsFiltered');
				expect(res.body).to.have.property('data');
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				done();
			});
		});
		
		it('should get all gps data by paging when searching', function(done) {
			request(server)
			.get('/settings/GetAllDynamickHandshake')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'id', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'Datetime', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'DeviceId', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testVehicle1.DeviceId,
				_: 1500000000000,
				idApp: testUser1.idApp,
				fromdate: moment.utc().startOf('month').format(),
				todate: moment.utc().endOf('month').format(),
				DeviceId: testVehicle1.DeviceId
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('draw');
				expect(res.body).to.have.property('recordsTotal');
				expect(res.body).to.have.property('recordsFiltered');
				expect(res.body).to.have.property('data');
				expect(res.body.draw).to.not.equal(null);
				expect(res.body.recordsTotal).to.not.equal(null);
				expect(res.body.recordsFiltered).to.not.equal(null);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.property('length').of.at.least(1);
				done();
			});
		});
	});
});