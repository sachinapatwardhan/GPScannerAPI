var request = require('supertest');

describe('starting express', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;

	before(function() {
		server = require('../server');
	});

	after(function(done) {
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