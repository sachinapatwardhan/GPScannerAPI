var request = require('supertest');
var require = require('really-need');

describe('starting express', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;

	beforeEach(function() {
		server = require('../server', {
			bustCache: true
		});
	});

	afterEach(function(done) {
		server.close(done);
	});

	it('should respond to / with status 200', function(done) {
		request(server)
		.get('/')
		.expect(200, done);
	});

	it('should respond to invalid routes with status 404', function(done) {
		request(server)
		.get('/foo/bar')
		.expect(404, done);
	});
});