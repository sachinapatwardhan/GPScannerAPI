var request = require('supertest');
var expect = require('chai').expect;
var qs = require('qs');

var testEmail = 'lenqxue95@gmail.com';
var testPassword = 'dino.saw';
var testPhone = '+60102658531';
var testUdid = '1a2a3a4a5a6a7a8a';

var testPushNotification1 = {
	id: 0,
	udid: '1a2a3a4a5a6a7a8a',
	Platform: 'android',
	PushNotificationId: 'asjdsaoidjoi21ueoi21u3lk21nmelkn21n3o21joi3j21oi3n215h32v4jgc21421gf4d21d421fhhwiuh214hkj21o21h3kj21h958y21iunekjs',
	iduser: 0,
	Country: 'Malaysia',
	UserType: 'Android',
	MessageCount: 0
};
var testUser1 = {
	email: 'unittest.user1@bugzstudio.com',
	username: 'unittest.user1@bugzstudio.com',
	password: 'unittest.user1',
	ProfileName: 'UnitTestUser1',
	IsMobileVerify: false,
	Type: 'Owner',
	idApp: 1
};
var testUser2 = {
	email: 'unittest.user2@bugzstudio.com',
	username: 'unittest.user2@bugzstudio.com',
	password: 'unittest.user2',
	ProfileName: 'UnitTestUser2',
	IsMobileVerify: false,
	Type: 'Owner',
	idApp: 1
};
var testUser3 = {
	email: 'unittest.user3@bugzstudio.com',
	username: 'unittest.user3@bugzstudio.com',
	password: 'unittest.user3',
	ProfileName: 'UnitTestUser3',
	IsMobileVerify: false,
	Type: 'Owner',
	idApp: 1
};
var testUser4 = {
	email: 'unittest.user4@bugzstudio.com',
	username: 'unittest.user4@bugzstudio.com',
	password: 'unittest.user4',
	ProfileName: 'UnitTestUser4',
	IsMobileVerify: false,
	Type: 'Owner',
	idApp: 1
};
var testUser5 = {
	email: 'unittest.user5@bugzstudio.com',
	username: 'unittest.user5@bugzstudio.com',
	password: 'unittest.user5',
	ProfileName: 'UnitTestUser5',
	IsMobileVerify: false,
	Type: 'Owner',
	idApp: 1
};
var testOriginalPassword1 = testUser1.password;
var testOriginalPassword5 = testUser5.password;
var testRole1 = {
	id: 0,
	RoleName: 'UnitTestUser',
	Description: 'Unit Test User',
	Country: 'Malaysia'
};
var testRole2 = {
	id: 0,
	RoleName: 'Scanner',
	Description: 'UnitTestUser1',
	Country: 'Malaysia'
};
// var testModule1 = {
// 	Module: 'UnitTestModule',
// 	IsActive: true,
// 	DisplayOrder: 99999
// };
// var testPermission1 = {
// 	idModule: 0,
// 	RoleName: testRole1.RoleName,
// 	Added: true,
// 	Modified: true,
// 	Deleted: true,
// 	Show: true
// };

describe('/account', function() {
	this.timeout(5000);

	var server;
	var User;
	var UserRole;
	var Role;
	var PushNotification;
	var dUser;
	var dUser2;
	var dUserRole;
	var dUserRole2;
	var dRole;
	var dRole2;
	var dPushNotification;
	var shouldDeleteScannerRole = false;

	before(function(done) {
		server = require('../server');

		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		Role = models.tblrole;
		PushNotification = models.tblpushnotification;
		
		Role.findOrCreate({
			where: {
				RoleName: testRole2.RoleName
			},
			defaults: testRole2
		})
		.spread(function(rRole, isCreated) {
			shouldDeleteScannerRole = isCreated;
			dRole2 = rRole;
			testUser5.password = jwt.encode(testUser5.password, 'bugz');
			return User.create(testUser5);
		})
		.then(function(rUser) {
			dUser2 = rUser;
			return UserRole.create({
				userId: dUser2.id,
				roleId: dRole2.id
			});
		})
		.then(function(rUserRole) {
			dUserRole2 = rUserRole;
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
			testPushNotification1.iduser = dUser.id;
			return PushNotification.create(testPushNotification1);
		})
		.then(function(rPushNotification) {
			dPushNotification = rPushNotification;
			done();
		});
	});

	after(function(done) {
		var userIds = [];

		dPushNotification.destroy()
		.then(function() {
			return User.findAll({
				where: {
					email: { $like: 'unittest%' },
					ProfileName: { $like: 'UnitTestUser%' }
				}
			});
		})
		.then(function(rUsers) {
			rUsers.forEach(function(rUser) {
				userIds.push(rUser.id);
			});

			return UserRole.destroy({
				where: {
					userId: { $in: userIds }
				}
			});
		})
		.then(function() {
			return dRole.destroy();
		})
		.then(function() {
			return User.destroy({
				where: {
					id: { $in: userIds }
				}
			});
		})
		.then(function() {
			if (!shouldDeleteScannerRole) return;
			return dRole2.destroy();
		})
		.then(function() {
			server.close(done);
		});
	});

	describe('/account/login', function() {
		it('should login when username/email and password is correct', function(done) {
			request(server)
			.get('/account/login')
			.query(qs.stringify({
				username: testUser1.email,
				password: testOriginalPassword1,
				appId: 1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.be.a('string');
				expect(res.body.token.indexOf('JWT')).to.equal(0);
				expect(res.body.UserId).to.equal(dUser.id);
				expect(res.body.UserImage).to.equal(null);
				expect(res.body.UserCountry).to.equal(null);
				expect(res.body.UserRoles).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.RolewiseCountryList).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.appId).to.equal(testUser1.idApp);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});
		
		it('should fail with when password is incorrect', function(done) {
			request(server)
			.get('/account/login')
			.query({
				username: testUser1.email,
				password: '',
				appId: 1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});

	describe('/account/loginNew', function() {
		it('should login when username/email and password is correct', function(done) {
			request(server)
			.get('/account/loginNew')
			.query(qs.stringify({
				username: testUser1.email,
				password: testOriginalPassword1,
				appId: 1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.be.a('string');
				expect(res.body.token.indexOf('JWT')).to.equal(0);
				expect(res.body.UserId).to.equal(dUser.id);
				expect(res.body.UserImage).to.equal(null);
				expect(res.body.UserCountry).to.equal(null);
				expect(res.body.UserRoles).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.RolewiseCountryList).to.be.an('array').that.has.lengthOf(1);
				expect(res.body.appId).to.equal(testUser1.idApp);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});
		
		it('should fail when password is incorrect', function(done) {
			request(server)
			.get('/account/loginNew')
			.query(qs.stringify({
				username: testUser1.email,
				password: '',
				appid: 1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});

	describe('/account/Mobilelogin', function() {
		it('should login when username/email and password is correct', function(done) {
			request(server)
			.get('/account/Mobilelogin')
			.query(qs.stringify({
				username: testUser1.email,
				password: testOriginalPassword1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.be.a('string');
				expect(res.body.token.indexOf('JWT')).to.equal(0);
				expect(res.body.UserId).to.equal(dUser.id);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});
		
		it('should fail when password is incorrect', function(done) {
			request(server)
			.get('/account/Mobilelogin')
			.query(qs.stringify({
				username: testUser1.email,
				password: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});

	//////////
	// DEPRECATED?

	// describe('/account/MobileOwnerlogin', function() {
	// 	it('should login when username/email and password is correct', function(done) {
	// 		request(server)
	// 		.get('/account/MobileOwnerlogin')
	// 		.query({
	// 			username: 'dino.saw@bugzstudio.com',
	// 			password: 'dino.saw'
	// 		})
	// 		.expect(200)
	// 		.end(function(err, res) {
	// 			expect(res.body).to.exist;
	// 			expect(res.body).to.have.property('success');
	// 			expect(res.body).to.have.property('token');
	// 			expect(res.body).to.have.property('UserId');
	// 			expect(res.body).to.have.property('message');
	// 			expect(res.body.success).to.equal(true);
	// 			expect(res.body.token).to.not.equal(null);
	// 			expect(res.body.UserId).to.not.equal(null);
	// 			expect(res.body.message).to.equal('Login Successfully...');
	// 			done();
	// 		});
	// 	});
		
	// 	it('should fail when password is incorrect', function(done) {
	// 		request(server)
	// 		.get('/account/MobileOwnerlogin')
	// 		.query({
	// 			username: 'dino.saw@bugzstudio.com',
	// 			password: ''
	// 		})
	// 		.expect(200)
	// 		.end(function(err, res) {
	// 			expect(res.body).to.exist;
	// 			expect(res.body).to.have.property('success');
	// 			expect(res.body).to.have.property('message');
	// 			expect(res.body.success).to.equal(false);
	// 			expect(res.body.message).to.equal('Invalid Username or Password...');
	// 			done();
	// 		});
	// 	});
	// });

	describe('account/OwnerMobilelogout', function() {
		it('should logout when UDID is valid', function(done) {
			request(server)
			.get('/account/OwnerMobilelogout')
			.query(qs.stringify({
				udid: testPushNotification1.udid
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
		
		it('should logout gracefully when UDID is invalid', function(done) {
			request(server)
			.get('/account/OwnerMobilelogout')
			.query(qs.stringify({
				udid: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
	});

	describe('/account/Mobilelogout', function() {
		it('should logout when UDID and UserType is valid', function(done) {
			request(server)
			.get('/account/Mobilelogout')
			.query(qs.stringify({
				udid: testPushNotification1.udid,
				UserType: testPushNotification1.UserType
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
		
		it('should logout gracefully when UDID is invalid or UserType is not provided', function(done) {
			request(server)
			.get('/account/Mobilelogout')
			.query(qs.stringify({
				udid: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
	});

	describe('/account/register', function() {
		it('should register when email is valid', function(done) {
			request(server)
			.post('/account/register')
			.send(testUser2)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Registered Successfully...');
				done();
			});
		});
		
		it('should fail when email is already registered', function(done) {
			request(server)
			.post('/account/register')
			.send(testUser1)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Username is already Exist...');
				done();
			});
		});
	});

	describe('/account/ResendOTP', function() {
		it('should resend OTP when user ID is valid', function(done) {
			request(server)
			.get('/account/ResendOTP')
			.query(qs.stringify({
				idUser: dUser.id,
				OTP: 111111
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Verification Code send to Registered Mobile Number.');
				done();
			});
		});
		
		it('should fail when user ID is invalid', function(done) {
			request(server)
			.get('/account/ResendOTP')
			.query(qs.stringify({
				idUser: 0,
				OTP: 111111
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid User');
				done();
			});
		});
	});

	describe('/account/CheckUserExist', function() {
		it('should return true when username/email does not exist', function(done) {
			request(server)
			.post('/account/CheckUserExist')
			.send({
				username: 'supercalifragilisticexpialidocious@unittest.com',
				email: 'supercalifragilisticexpialidocious@unittest.com',
				Type: testUser1.Type
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('user is not Exist...');
				done();
			});
		});
		
		it('should fail when username/email exists', function(done) {
			request(server)
			.post('/account/CheckUserExist')
			.send({
				username: testUser1.email,
				email: testUser1.email,
				Type: testUser1.Type
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Username is already Exist...');
				done();
			});
		});
	});

	describe('/account/changepassword', function() {
		it('should change password when password is valid', function(done) {
			request(server)
			.post('/account/changepassword')
			.send({
				UserId: dUser.id,
				oldpassword: testOriginalPassword1,
				password: testOriginalPassword1,
				confirmpassword: testOriginalPassword1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password changed successfully...');
				done();
			});
		});
		
		it('should fail when password is invalid', function(done) {
			request(server)
			.post('/account/changepassword')
			.send({
				UserId: dUser.id,
				oldpassword: '',
				password: testOriginalPassword1,
				confirmpassword: testOriginalPassword1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Old Password is wrong...');
				done();
			});
		});
	});

	describe('/account/changeUserPassword', function() {
		it('should change password when password is valid', function(done) {
			request(server)
			.post('/account/changeUserPassword')
			.send({
				username: testUser1.email,
				password: testOriginalPassword1,
				NewPassword: testOriginalPassword1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password changed successfully...');
				done();
			});
		});
		
		it('should fail when password is invalid', function(done) {
			request(server)
			.post('/account/changeUserPassword')
			.send({
				username: testUser1.email,
				password: '',
				NewPassword: testOriginalPassword1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Old Password is wrong...');
				done();
			});
		});
	});

	describe('/account/forgotpassword', function() {
		it('should change password and send email when password is valid', function(done) {
			request(server)
			.get('/account/forgotpassword')
			.query(qs.stringify({
				id: dUser.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password sent to your email successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('ProfileName').that.is.equal(testUser1.ProfileName);
				done();
			});
		});
		
		it('should fail when password is invalid', function(done) {
			request(server)
			.get('/account/forgotpassword')
			.query(qs.stringify({
				id: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('This Email not registered with us...');
				done();
			});
		});
	});

	//////////
	// NOTE: user registered email is null but forgot password email sent

	describe('/account/forgotpasswordNew', function() {
		it('should change password and send email when password is valid', function(done) {
			request(server)
			.get('/account/forgotpasswordNew')
			.query(qs.stringify({
				email: testUser1.email,
				idApp: 1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password sent to your email successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('ProfileName').that.is.equal(testUser1.ProfileName);
				done();
			});
		});
		
		it('should fail when password is invalid', function(done) {
			request(server)
			.get('/account/forgotpasswordNew')
			.query(qs.stringify({
				email: 'supercalifragilisticexpialidocious@unittest.com',
				idApp: 1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('This system Email not found...');
				done();
			});
		});
	});

	describe('/account/forgotpasswordfromOwnerCustomer', function() {
		it('should change password and send email when password is valid', function(done) {
			request(server)
			.get('/account/forgotpasswordfromOwnerCustomer')
			.query(qs.stringify({
				id: dUser.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password sent to your email successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('ProfileName').that.is.equal(testUser1.ProfileName);
				done();
			});
		});
		
		it('should fail when password is invalid', function(done) {
			request(server)
			.get('/account/forgotpasswordfromOwnerCustomer')
			.query(qs.stringify({
				id: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('This Email not registered with us...');
				done();
			});
		});
	});

	describe('/account/MobileAppLogin', function() {
		// Reset password or else just now forgot password already reset will fail
		before(function(done) {
			User.findOne({
				where: {
					id: dUser.id
				}
			})
			.then(function(rUser) {
				return rUser.update({
					password: jwt.encode(testOriginalPassword1, 'bugz')
				});
			})
			.then(function(rUser) {
				dUser = rUser;
				done();
			});
		});

		it('should login when username/email and password is correct', function(done) {
			request(server)
			.get('/account/MobileAppLogin')
			.query(qs.stringify({
				username: testUser1.email,
				password: testOriginalPassword1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.be.a('string');
				expect(res.body.token.indexOf('JWT')).to.equal(0);
				expect(res.body.UserId).to.equal(dUser.id);
				expect(res.body.UserName).to.equal(testUser1.username);
				expect(res.body.Email).to.equal(testUser1.email);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});
		
		it('should fail when password is incorrect', function(done) {
			request(server)
			.get('/account/MobileAppLogin')
			.query(qs.stringify({
				username: testUser1.email,
				password: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});

	describe('/account/CheckMobileUserExist', function() {
		it('should return true when username/email does not exist', function(done) {
			request(server)
			.post('/account/CheckMobileUserExist')
			.send({
				username: 'supercalifragilisticexpialidocious@unittest.com',
				email: 'supercalifragilisticexpialidocious@unittest.com'
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('user is not Exist...');
				done();
			});
		});
		
		it('should fail when username/email exists', function(done) {
			request(server)
			.post('/account/CheckMobileUserExist')
			.send({
				username: testUser1.email,
				email: testUser1.email,
				idApp: 1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Username is already Exist...');
				done();
			});
		});
	});

	describe('/account/MobileRegister', function() {
		it('should register when email is valid', function(done) {
			request(server)
			.post('/account/MobileRegister')
			.send(testUser3)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Registered Successfully...');
				done();
			});
		});
	});

	describe('/account/MobileForgotPassword', function() {
		it('should change password and send email when email is valid', function(done) {
			request(server)
			.get('/account/MobileForgotPassword')
			.query(qs.stringify({
				email: testUser1.email
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password sent to your email successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('ProfileName').that.is.equal(testUser1.ProfileName);
				done();
			});
		});
		
		it('should fail when email is invalid', function(done) {
			request(server)
			.get('/account/MobileForgotPassword')
			.query(qs.stringify({
				email: 'supercalifragilisticexpialidocious@unittest.com'
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('This Email not registered with us...');
				done();
			});
		});
	});

	describe('/account/changeMobileUserPassword', function() {
		// Reset password again
		before(function(done) {
			User.findOne({
				where: {
					id: dUser.id
				}
			})
			.then(function(rUser) {
				return rUser.update({
					password: jwt.encode(testOriginalPassword1, 'bugz')
				});
			})
			.then(function(rUser) {
				dUser = rUser;
				done();
			});
		});

		it('should change password when password is valid', function(done) {
			request(server)
			.post('/account/changeMobileUserPassword')
			.send({
				username: testUser1.email,
				password: testOriginalPassword1,
				NewPassword: testOriginalPassword1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password changed successfully...');
				done();
			});
		});
		
		it('should fail when password is invalid', function(done) {
			request(server)
			.post('/account/changeMobileUserPassword')
			.send({
				username: testUser1.email,
				password: '',
				NewPassword: testOriginalPassword1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Old Password is wrong...');
				done();
			});
		});
	});

	describe('/account/MobileApplogout', function() {
		it('should logout when UDID and UserType is valid', function(done) {
			request(server)
			.get('/account/MobileApplogout')
			.query(qs.stringify({
				udid: testPushNotification1.udid,
				UserType: testPushNotification1.UserType
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
		
		it('should logout gracefully when UDID is invalid or UserType is not provided', function(done) {
			request(server)
			.get('/account/MobileApplogout')
			.query(qs.stringify({
				udid: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
	});

	describe('/account/SetLastLogin', function() {
		it('should set last login if user exists', function(done) {
			request(server)
			.get('/account/SetLastLogin')
			.query(qs.stringify({
				useId: dUser.id
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.be.an('object').that.has.property('ProfileName').that.is.equal(testUser1.ProfileName);
				done();
			});
		});

		it('should fail if user does not exist', function(done) {
			request(server)
			.get('/account/SetLastLogin')
			.query(qs.stringify({
				useId: 0
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('User not found.');
				done()	
			});
		});
	});

	describe('/account/MobileAppLoginNew', function() {
		it('should login when username/email and password is correct', function(done) {
			request(server)
			.get('/account/MobileAppLoginNew')
			.query(qs.stringify({
				username: testUser1.email,
				password: testOriginalPassword1,
				idApp: 1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.be.a('string');
				expect(res.body.token.indexOf('JWT')).to.equal(0);
				expect(res.body.UserId).to.equal(dUser.id);
				expect(res.body.UserName).to.equal(testUser1.username);
				expect(res.body.Email).to.equal(testUser1.email);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});
		
		it('should fail when password is incorrect', function(done) {
			request(server)
			.get('/account/MobileAppLoginNew')
			.query(qs.stringify({
				username: testUser1.email,
				password: '',
				idApp: 1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});

	describe('/account/CheckMobileUserExistNew', function() {
		it('should return true when username/email does not exist', function(done) {
			request(server)
			.post('/account/CheckMobileUserExistNew')
			.send({
				username: 'supercalifragilisticexpialidocious@unittest.com',
				email: 'supercalifragilisticexpialidocious@unittest.com',
				idApp: 1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('user is not Exist...');
				done();
			});
		});
		
		it('should fail when username/email exists', function(done) {
			request(server)
			.post('/account/CheckMobileUserExistNew')
			.send({
				username: testUser1.email,
				email: testUser1.email,
				idApp: 1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Username is already Exist...');
				done();
			});
		});
	});

	describe('/account/MobileRegisterNew', function() {
		it('should register when email is valid', function(done) {
			request(server)
			.post('/account/MobileRegisterNew')
			.send(testUser4)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Registered Successfully...');
				done();
			});
		});
	});

	describe('/account/MobileForgotPasswordNew', function() {
		it('should change password and send email when email is valid', function(done) {
			request(server)
			.get('/account/MobileForgotPasswordNew')
			.query(qs.stringify({
				email: testUser1.email,
				idApp: 1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password sent to your email successfully...');
				expect(res.body.data).to.be.an('object').that.has.property('ProfileName').that.is.equal(testUser1.ProfileName);
				done();
			});
		});
		
		it('should fail when email is invalid', function(done) {
			request(server)
			.get('/account/MobileForgotPasswordNew')
			.query(qs.stringify({
				email: 'supercalifragilisticexpialidocious',
				idApp: 1
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('This Email not registered with us...');
				done();
			});
		});
	});

	describe('/account/changeMobileUserPasswordNew', function() {
		// Reset again
		before(function(done) {
			User.findOne({
				where: {
					id: dUser.id
				}
			})
			.then(function(rUser) {
				return rUser.update({
					password: jwt.encode(testOriginalPassword1, 'bugz')
				});
			})
			.then(function(rUser) {
				dUser = rUser;
				done();
			});
		});

		it('should change password when password is valid', function(done) {
			request(server)
			.post('/account/changeMobileUserPasswordNew')
			.send({
				UserId: dUser.id,
				password: testOriginalPassword1,
				NewPassword: testOriginalPassword1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password changed successfully...');
				done();
			});
		});
		
		it('should fail when password is invalid', function(done) {
			request(server)
			.post('/account/changeMobileUserPasswordNew')
			.send({
				UserId: dUser.id,
				password: '',
				NewPassword: testOriginalPassword1
			})
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Old Password is wrong...');
				done();
			});
		});
	});

	describe('/account/MobileApplogoutNew', function() {
		it('should logout when UDID and UserType is valid', function(done) {
			request(server)
			.get('/account/MobileApplogoutNew')
			.query(qs.stringify({
				udid: testPushNotification1.udid,
				UserType: testPushNotification1.UserType
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
		
		it('should logout gracefully when UDID is invalid or UserType is not provided', function(done) {
			request(server)
			.get('/account/MobileApplogoutNew')
			.query(qs.stringify({
				udid: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
	});

	describe('/account/MobileAppLoginScannerApp', function() {
		it('should login when username and password matches, and is of role scanner', function(done) {
			request(server)
			.get('/account/MobileAppLoginScannerApp')
			.query(qs.stringify({
				username: testUser5.email,
				password: testOriginalPassword5
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.be.a('string');
				expect(res.body.token.indexOf('JWT')).to.equal(0);
				expect(res.body.UserId).to.equal(dUser2.id);
				expect(res.body.UserName).to.equal(testUser5.username);
				expect(res.body.Email).to.equal(testUser5.email);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});

		it('should fail when username and/or password does not match', function(done) {
			request(server)
			.get('/account/MobileAppLoginScannerApp')
			.query(qs.stringify({
				username: testUser5.email,
				password: ''
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});
	
	describe('/account/CheckUserPassword', function() {
		it('should return true if user password is correct', function(done) {
			request(server)
			.get('/account/CheckUserPassword')
			.query(qs.stringify({
				username: testUser1.email,
				password: testOriginalPassword1,
				idApp: testUser1.idApp
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Valid Password...');
				done();
			});
		});

		it('should fail if user password is wrong', function(done) {
			request(server)
			.get('/account/CheckUserPassword')
			.query(qs.stringify({
				username: testUser1.email,
				password: '',
				idApp: testUser1.idApp
			}))
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Password...');
				done();
			});
		});
	});
});