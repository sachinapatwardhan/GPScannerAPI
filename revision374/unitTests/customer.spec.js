var request = require('supertest');
var expect = require('chai').expect;
var qs = require('qs');

describe('/customer', function() {
	this.timeout(5000);
	
	var server;

	before(function(done) {
		server = require('../server');
		done();
	});

	after(function(done) {
		server.close(done);
	});
	
	describe('/customer/GetMobileLanguageData', function() {
		it('should get mobile language data as json', function(done) {
			request(server)
			.get('/customer/GetMobileLanguageData')
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object');
				done();
			});
		});
	});
});