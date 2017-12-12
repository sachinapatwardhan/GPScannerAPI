var request = require('supertest');
var expect = require('chai').expect;
var qs = require('qs');

var testType1 = {
	id: 0,
	name: 'UnitTestType1',
	displayorder: 99999999
};
var testStockEntry1 = {
	id: 0,
	idtype: 0,
	entryvalue: 10000,
	createddate: new Date()
};
var testStockEntry2 = {
	id: 0,
	idtype: 0,
	entryvalue: 20000,
	createddate: new Date()
};

describe('/DeviceStock', function() {
	this.timeout(5000);

	var server;
	var Type;
	var StockEntry;
	var dType;
	var dStockEntry;

	before(function(done) {
		server = require('../server');

		Type = models.tbltype;
		StockEntry = models.tblstockentry;

		Type.create(testType1)
		.then(function(rType) {
			dType = rType;
			testStockEntry1.idtype = dType.id;
			return StockEntry.create(testStockEntry1);
		})
		.then(function(rStockEntry) {
			dStockEntry = rStockEntry;
			done();
		});
	});

	after(function(done) {
		StockEntry.destroy({
			where: {
				idtype: dType.id
			}
		})
		.then(function() {
			return dType.destroy();
		})
		.then(function() {
			done();
		});
	});

	describe('/DeviceStock/GetAllType', function() {
		it('should get all device types', function(done) {
			request(server)
			.get('/DeviceStock/GetAllType')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(1);
				expect(res.body.message).to.equal('Success');
				expect(res.body.lstTypes).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});

	describe('/DeviceStock/ManageStock', function() {
		it('should save new stock if stock does not yet exist', function(done) {
			testStockEntry2.idtype = dType.id;
			
			request(server)
			.post('/DeviceStock/ManageStock')
			.send(testStockEntry2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(1);
				expect(res.body.message).to.equal('Stock Detail Save Successfully');
				expect(res.body.resdata).to.be.an('object').that.has.property('idtype').that.is.equal(testStockEntry2.idtype);
				done();
			});
		});

		it('should fail if stock already exists', function(done) {
			request(server)
			.post('/DeviceStock/ManageStock')
			.send(testStockEntry1)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(0);
				expect(res.body.message).to.equal('Stock Detail Already Exist');
				done();
			});
		});
	});

	describe('/DeviceStock/GetAllStock', function() {
		it('should get all stock entry', function(done) {
			request(server)
			.get('/DeviceStock/GetAllStock')
			.query(qs.stringify({
				stype: 'ALL'
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(1);
				expect(res.body.message).to.equal('Success');
				expect(res.body.lstStock).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});

		it('should get all stock entry that matches search query', function(done) {
			request(server)
			.get('/DeviceStock/GetAllStock')
			.query(qs.stringify({
				stype: testStockEntry1.idtype,
				sentryvalue: testStockEntry1.entryvalue
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(1);
				expect(res.body.message).to.equal('Success');
				expect(res.body.lstStock).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.lstStock[0]).to.have.property('idtype').that.is.equal(testStockEntry1.idtype);
				done();
			});
		});
	});

	describe('/DeviceStock/DeleteStock', function() {
		it('should delete stock', function(done) {
			request(server)
			.get('/DeviceStock/DeleteStock')
			.query(qs.stringify({
				id: dStockEntry.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(1);
				expect(res.body.message).to.equal('StockEntry Deleted Successfully');
				done();
			});
		});

		it('should fail when stock does not exist', function(done) {
			request(server)
			.get('/DeviceStock/DeleteStock')
			.query(qs.stringify({
				id: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(0);
				expect(res.body.message).to.equal('StockEntry Already Deleted');
				done();
			});
		});
	});
});