var request = require('supertest');
var expect = require('chai').expect;
var qs = require('qs');

var testDynamicPage1 = {
	id: 0,
	Title: 'UnitTestDynamicPage1',
	Name: 'UnitTestDynamicPage1',
	PageContent: '<span></span>',
	isPublish: true,
	Slug: 'UnitTestDynamicPage1',
	MetaTag: null,
	MetaDescription: null,
	isHomePage: false,
	CreatedBy: 'UnitTestUser1',
	CreatedDate: new Date(),
	ModifiedBy: 'UnitTestUser1',
	ModifiedDate: new Date()
};

describe('/dynamicpage', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var DynamicPage;
	var dDynamicPage;

	before(function(done) {
		server = require('../server');

		DynamicPage = models.tbldynamicpagemgmt;

		DynamicPage.create(testDynamicPage1)
		.then(function(rDynamicPage) {
			dDynamicPage = rDynamicPage;
			done();
		});
	});

	after(function(done) {
		dDynamicPage.destroy()
		.then(function() {
			server.close(done);
		});
	});

	describe('/dynamicpage/GetAllDynamicPage', function() {
		it('should get all dynamic pages', function(done) {
			request(server)
			.get('/dynamicpage/GetAllDynamicPage')
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('array').that.has.property('length').of.at.least(1);
				done();
			});
		});
	});
});