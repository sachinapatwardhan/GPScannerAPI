var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;
var qs = require('qs');

var testFavoritePlace1 = {
	id: 0,
	Name: 'UnitTestFavoritePlace1',
	DeviceId: '1234567890123x',
	Range: 100,
	Latitude: 21.1538551,
	Longitude: 72.78483449999999,
	IsInFavoritePlace: false,
	CreatedDate: new Date(),
	CreatedBy: null,
	ModifiedDate: null,
	ModifiedBy: null
};
var testFavoritePlace2 = {
	id: 0,
	Name: 'UnitTestFavoritePlace2',
	DeviceId: '1234567890124x',
	Range: 100,
	Latitude: 21.1538551,
	Longitude: 72.78483449999999,
	IsInFavoritePlace: false,
	CreatedDate: new Date(),
	CreatedBy: null,
	ModifiedDate: null,
	ModifiedBy: null
};
var testUser1 = {
	email: 'unittest.user@bugzstudio.com',
	username: 'unittest.user@bugzstudio.com',
	password: 'unittest.user',
	ProfileName: 'Unit Test User',
	IsMobileVerify: false,
	idApp: 1
};
var testRole1 = {
	RoleName: 'UnitTestUser',
	Description: 'Unit Test User',
	Country: 'Malaysia'
};
var testModule1 = {
	Module: 'UnitTestModule',
	IsActive: true,
	DisplayOrder: 99999
};
var testPermission = {
	idModule: 0,
	RoleName: testRole1.RoleName,
	Added: true,
	Modified: true,
	Deleted: true,
	Show: true
};

describe('/favoriteplace', function() {
	// Important! Because server setup is slow!
	this.timeout(5000);

	var server;
	var FavoritePlace;
	var User;
	var UserRole;
	var Role;
	var Module;
	var Permission;
	var dFavoritePlace;
	var dFavoritePlace2;
	var dUser;
	var dRole;
	var dUserRole;
	var dModule;
	var dPermission;

	before(function(done) {
		server = require('../server', {
			bustCache: true
		});

		FavoritePlace = models.tblfavoriteplace;
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		Module = models.tblmodulemgmt;
		Permission = models.tbluserpermission;
		
		FavoritePlace.create(testFavoritePlace1)
		.then(function(rFavoritePlace) {
			dFavoritePlace = rFavoritePlace;
			testUser1.password = jwt.encode(testUser1.password, 'bugz');
			return User.create(testUser1);
		})
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
			return Module.create(testModule1);
		})
		.then(function(rModule) {
			dModule = rModule;
			testPermission.idModule = dModule.id;
			return Permission.create(testPermission);
		})
		.then(function(rPermission) {
			dPermission = rPermission;
			done();
		});
	});

	after(function(done) {
		dPermission.destroy()
		.then(function() {
			return dModule.destroy();
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
			return dFavoritePlace.destroy();
		})
		.then(function() {
			return FavoritePlace.destroy({
				where: {
					Name: {
						$like: 'UnitTest%'
					}
				}
			});
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/favoriteplace/GetAllFavoritePlaceByDevice', function() {
		it('should get all favorite places when DeviceId matches', function(done) {
			request(server)
			.get('/favoriteplace/GetAllFavoritePlaceByDevice')
			.query(qs.stringify({
				DeviceId: testFavoritePlace1.DeviceId
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
				done();
			});
		});
		
		it('should fail when DeviceId does not match', function(done) {
			request(server)
			.get('/favoriteplace/GetAllFavoritePlaceByDevice')
			.query(qs.stringify({
				DeviceId: ''
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(0);
				done();
			});
		});
	});

	describe('/favoriteplace/GetFavoritePlaceById', function() {
		it('should get favorite place when id matches', function(done) {
			request(server)
			.get('/favoriteplace/GetFavoritePlaceById')
			.query(qs.stringify({
				id: dFavoritePlace.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Record found...');
				expect(res.body.data).to.be.an('object');
				expect(res.body.data.Name).to.equal(testFavoritePlace1.Name);
				done();
			});
		});
		
		it('should fail when id does not match', function(done) {
			request(server)
			.get('/favoriteplace/GetFavoritePlaceById')
			.query(qs.stringify({
				id: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Requested Record(s) not Found....');
				expect(res.body.data).to.be.null;
				done();
			});
		});
	});

	describe('/favoriteplace/SaveFavoritePlace', function() {
		it('should create favorite place if it does not exist', function(done) {
			request(server)
			.post('/favoriteplace/SaveFavoritePlace')
			.send(testFavoritePlace2)
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Favorite Place created successfully...');
				expect(res.body.data).to.be.an('array').that.has.lengthOf(2);
				expect(res.body.data[0]).to.be.an('object');
				expect(res.body.data[0].Name).to.equal(testFavoritePlace2.Name);
				expect(res.body.data[1]).to.equal(true);
				dFavoritePlace2 = res.body.data[0];
				done();
			});
		});
	});

	describe('/favoriteplace/DeleteFavoritePlace', function() {
		it('should delete favorite place if it exists', function(done) {
			request(server)
			.get('/favoriteplace/DeleteFavoritePlace')
			.query(qs.stringify({
				id: dFavoritePlace2.id
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Favorite Place Deleted Successfully...');
				expect(res.body.data).to.equal(1);
				done();
			});
		});

		it('should fail if it does not exist', function(done) {
			request(server)
			.get('/favoriteplace/DeleteFavoritePlace')
			.query(qs.stringify({
				id: 0
			}))
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Favorite Place Deleted Successfully...');
				expect(res.body.data).to.equal(0);
				done();
			});
		});
	});

	describe('/favoriteplace/UpdateFavoritePlaceNameById', function() {
		it('should update favorite place name when id matches', function(done) {
			request(server)
			.post('/favoriteplace/UpdateFavoritePlaceNameById')
			.send({
				id: dFavoritePlace.id,
				Name: testFavoritePlace1.Name
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Favorite Place Name updated successfully...');
				expect(res.body.data).to.be.an('object');
				expect(res.body.data.DeviceId).to.equal(testFavoritePlace1.DeviceId);
				done();
			});
		});

		it('should fail when id does not match', function(done) {
			request(server)
			.post('/favoriteplace/UpdateFavoritePlaceNameById')
			.send({
				id: 0,
				Name: testFavoritePlace1.Name
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Favorite Place Name not updated...');
				done();
			});
		});
	});
});