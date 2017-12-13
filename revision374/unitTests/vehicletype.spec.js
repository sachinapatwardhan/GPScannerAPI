var request = require('supertest');
var expect = require('chai').expect;
var qs = require('qs');

var testVehicleType1 = {
	id: 0,
	Type: 'UnitTestVehicleType1',
	IsActive: 1,
	CreatedDate: new Date(),
	CreatedBy: 'UnitTestUser1',
	OnIcon: '0921830921.png',
	OffIcon: '1209380921.png',
	ActiveIcon: '129308.png',
	LocateOnIcon: '2109382109.png',
	LocateOffIcon: '1293021.png',
	LocateActiveIcon: '1209830921.png',
	LocateIsRotate: false
};
var testVehicleType2 = {
	id: 0,
	Type: 'UnitTestVehicleType2',
	IsActive: 1,
	CreatedDate: new Date(),
	CreatedBy: 'UnitTestUser1',
	OnIcon: '0921830922.png',
	OffIcon: '1209380922.png',
	ActiveIcon: '129309.png',
	LocateOnIcon: '2109382110.png',
	LocateOffIcon: '1293022.png',
	LocateActiveIcon: '1209830922.png',
	LocateIsRotate: true
};
var testUser1 = {
	email: 'unittest.user1@bugzstudio.com',
	username: 'unittest.user1@bugzstudio.com',
	password: 'unittest.user1',
	ProfileName: 'UnitTestUser1',
	IsMobileVerify: false,
	idApp: 1
};

describe('/vehicletype', function() {
	this.timeout(5000);

	var server;
	var VehicleType;
	var User;
	var dVehicleType;
	var dUser;
	var fileRemoval;

	before(function(done) {
		server = require('../server');

		VehicleType = models.tblvehicletype;
		User = models.tbluserinformation;

		VehicleType.create(testVehicleType1)
		.then(function(rVehicleType) {
			dVehicleType = rVehicleType;
			return User.create(testUser1);
		})
		.then(function(rUser) {
			dUser = rUser;
			done();
		});
	});

	after(function(done) {
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + fileRemoval.OnIcon);
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + fileRemoval.OffIcon);
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + fileRemoval.ActiveIcon);
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + fileRemoval.LocateOnIcon);
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + fileRemoval.LocateOffIcon);
		} catch (err) {}
		try {
			fs.unlinkSync(__dirname + '/../MediaUploads/FileUpload/' + fileRemoval.LocateActiveIcon);
		} catch (err) {}

		VehicleType.destroy({ where: { Type: { $like: 'UnitTest%' } } })
		.then(function() {
			return User.destroy({ where: { ProfileName: { $like: 'UnitTest%' } } });
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/vehicletype/GetAllActivevehicletype', function() {
		it('should get all vehicle types', function(done) {
			request(server)
			.get('/vehicletype/GetAllActivevehicletype')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/vehicletype/Getvehicletype', function() {
		it('should get vehicle type when query matches', function(done) {
			request(server)
			.get('/vehicletype/Getvehicletype')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'Type', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedBy', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: '',
				_: 1500000000000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(+res.body.draw).to.equal(1);
				expect(res.body.recordsTotal).to.be.at.least(1);
				expect(res.body.recordsFiltered).to.be.at.least(1);
				expect(res.body.data).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});

		it('should get vehicle type when query matches', function(done) {
			request(server)
			.get('/vehicletype/Getvehicletype')
			.query(qs.stringify({
				draw: 1,
				columns: [
					{ data: 'Type', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedDate', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
					{ data: 'CreatedBy', name: '', searchable: true, orderable: true, search: { value: '', regex: false } }
				],
				order: [
					{ column: 1, dir: 'asc' }
				],
				start: 0,
				length: 25,
				search: testVehicleType1.Type,
				_: 1500000000000
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(+res.body.draw).to.equal(1);
				expect(res.body.recordsTotal).to.equal(1);
				expect(res.body.recordsFiltered).to.equal(1);
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.data[0]).to.have.property('CreatedBy').that.is.equal(testVehicleType1.CreatedBy);
				done();
			});
		});
	});

	describe('/vehicletype/SaveVehicleType', function() {
		it('should save vehicle type when credentials are correct', function(done) {
			var token =  {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
			
			request(server)
			.post('/vehicletype/SaveVehicleType')
			.set('authorization', token)
			.send(testVehicleType2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle Type created successfully...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object').that.has.property('LocateIsRotate').that.is.equal(testVehicleType2.LocateIsRotate);
				expect(res.body.data[1]).to.equal(true);
				done();
			});
		});

		it('should fail when credentials are wrong', function(done) {
			request(server)
			.post('/vehicletype/SaveVehicleType')
			.send(testVehicleType2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.InvalidToken).to.equal(true);
				expect(res.body.data.success).to.equal(false);
				expect(res.body.data.message).to.equal('Invalid token...');
				expect(res.body.data.data).to.equal('TOKEN');
				done();
			});
		});
	});

	// Test update before delete
	describe('/vehicletype/UpdateIsActiveStatus', function() {
		it('should update is active status if credentials are correct', function(done) {
			var token =  {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
	
			request(server)
			.get('/vehicletype/UpdateIsActiveStatus')
			.set('authorization', token)
			.query(qs.stringify({
				id: dVehicleType.id,
				IsActive: testVehicleType1.IsActive
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle Type status updated successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('LocateIsRotate').that.is.equal(testVehicleType1.LocateIsRotate);
				done();
			});
		});

		it('should fail when credentails are wrong', function(done) {
			request(server)
			.get('/vehicletype/UpdateIsActiveStatus')
			.query(qs.stringify({
				id: dVehicleType.id,
				IsActive: testVehicleType1.IsActive
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

	// Test upload file before delete
	describe('/vehicletype/uploadFile', function() {
		it('should upload icons for vehicle type', function(done) {
			request(server)
			.post('/vehicletype/uploadFile')
			.attach(dVehicleType.id + ',OnIcon', __dirname + '/../MediaUploads/UnitTest/TestIcon.png')
			.attach(dVehicleType.id + ',ActiveIcon', __dirname + '/../MediaUploads/UnitTest/TestIcon.png')
			.attach(dVehicleType.id + ',OffIcon', __dirname + '/../MediaUploads/UnitTest/TestIcon.png')
			.attach(dVehicleType.id + ',LocateOnIcon', __dirname + '/../MediaUploads/UnitTest/TestIcon.png')
			.attach(dVehicleType.id + ',LocateActiveIcon', __dirname + '/../MediaUploads/UnitTest/TestIcon.png')
			.attach(dVehicleType.id + ',LocateOffIcon', __dirname + '/../MediaUploads/UnitTest/TestIcon.png')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('File Uploaded Successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('CreatedBy').that.is.equal(testVehicleType1.CreatedBy);
				fileRemoval = res.body.data;
				done();
			});
		});
	});

	describe('/vehicletype/DeleteVehicleTypeById', function() {
		it('should delete vehicle type when credentials are correct', function(done) {
			var token =  {
				username: dUser.username,
				password: dUser.password
			};
			token = 'JWT ' + jwt.encode(token, 'bugz');
	
			request(server)
			.get('/vehicletype/DeleteVehicleTypeById')
			.set('authorization', token)
			.query(qs.stringify({
				id: dVehicleType.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Vehicle Type deleted successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail when credentails are wrong', function(done) {
			request(server)
			.get('/vehicletype/DeleteVehicleTypeById')
			.query(qs.stringify({
				id: dVehicleType.id
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

	describe('/vehicletype/GetActivevehicletype', function() {
		it('should get active vehicle type when query matches', function(done) {
			request(server)
			.get('/vehicletype/GetActivevehicletype')
			.query(qs.stringify({
				Type: testVehicleType2.Type
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object').that.has.property('LocateIsRotate').that.is.equal(testVehicleType2.LocateIsRotate);
				done();
			});
		});
	});
});