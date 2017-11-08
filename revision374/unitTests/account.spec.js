var request = require('supertest');
var require = require('really-need');
var expect = require('chai').expect;

var testEmail = 'lenqxue95@gmail.com';
var testPassword = 'dino.saw';
var testPhone = '+60102658531';
var testUdid = '1a2a3a4a5a6a7a8a';

describe('user account authentications', function() {
	this.timeout(5000);

	var server;
	var User;
	var UserRole;
	var PushNotification;

	beforeEach(function() {
		server = require('../server', {
			bustCache: true
		});
		User = models.tbluserinformation;
		UserRole = models.tbluserinrole;
		PushNotification = models.tblpushnotification;
	});

	afterEach(function(done) {
		server.close(done);
	});

	describe('/account/login', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should login with status 200 when username/email and password is correct', function(done) {
			request(server)
			.get('/account/login')
			.query({
				username: testEmail,
				password: testPassword,
				appId: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('token');
				expect(res.body).to.have.property('UserId');
				expect(res.body).to.have.property('UserImage');
				expect(res.body).to.have.property('UserCountry');
				expect(res.body).to.have.property('UserRoles');
				expect(res.body).to.have.property('RolewiseCountryList');
				expect(res.body).to.have.property('appId');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.not.equal(null);
				expect(res.body.UserId).to.not.equal(null);
				expect(res.body.UserRoles).to.be.an('array');
				expect(res.body.UserRoles).to.have.property('length').of.at.least(1);
				expect(res.body.RolewiseCountryList).to.be.an('array');
				expect(res.body.RolewiseCountryList).to.have.property('length').of.at.least(1);
				expect(res.body.appId).to.not.equal(null);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is incorrect', function(done) {
			request(server)
			.get('/account/login')
			.query({
				username: testEmail,
				password: '',
				appId: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});

	describe('/account/loginNew', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should login with status 200 when username/email and password is correct', function(done) {
			request(server)
			.get('/account/loginNew')
			.query({
				username: testEmail,
				password: testPassword,
				appId: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('token');
				expect(res.body).to.have.property('UserId');
				expect(res.body).to.have.property('UserImage');
				expect(res.body).to.have.property('UserCountry');
				expect(res.body).to.have.property('UserRoles');
				expect(res.body).to.have.property('RolewiseCountryList');
				expect(res.body).to.have.property('appId');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.not.equal(null);
				expect(res.body.UserId).to.not.equal(null);
				expect(res.body.UserRoles).to.be.an('array');
				expect(res.body.UserRoles).to.have.property('length').of.at.least(1);
				expect(res.body.RolewiseCountryList).to.be.an('array');
				expect(res.body.RolewiseCountryList).to.have.property('length').of.at.least(1);
				expect(res.body.appId).to.not.equal(null);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is incorrect', function(done) {
			request(server)
			.get('/account/loginNew')
			.query({
				username: testEmail,
				password: '',
				appid: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});

	describe('/account/Mobilelogin', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should login with status 200 when username/email and password is correct', function(done) {
			request(server)
			.get('/account/Mobilelogin')
			.query({
				username: testEmail,
				password: testPassword
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('token');
				expect(res.body).to.have.property('UserId');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.not.equal(null);
				expect(res.body.UserId).to.not.equal(null);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is incorrect', function(done) {
			request(server)
			.get('/account/Mobilelogin')
			.query({
				username: testEmail,
				password: ''
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});

	//////////
	// DEPRECATED?

	// describe('/account/MobileOwnerlogin', function() {
	// 	it('should login with status 200 when username/email and password is correct', function(done) {
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
		
	// 	it('should fail with status 200 when password is incorrect', function(done) {
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
		var dPushNotification;

		beforeEach(function(done) {
			PushNotification.create({
				udid: testUdid,
				UserType: 'Owner'
			})
			.then(function(rPushNotification) {
				dPushNotification = rPushNotification;
				done();
			});
		});

		afterEach(function(done) {
			dPushNotification.destroy()
			.then(function() {
				done();
			});
		});

		it('should logout with status 200 when UDID is valid', function(done) {
			request(server)
			.get('/account/OwnerMobilelogout')
			.query({
				udid: testUdid
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
		
		it('should logout with status 200 when UDID is invalid', function(done) {
			request(server)
			.get('/account/OwnerMobilelogout')
			.query({
				udid: ''
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
	});

	describe('/account/Mobilelogout', function() {
		var dPushNotification;
		
		beforeEach(function(done) {
			PushNotification.create({
				udid: testUdid,
				UserType: 'Maark'
			})
			.then(function(rPushNotification) {
				dPushNotification = rPushNotification;
				done();
			});
		});

		afterEach(function(done) {
			dPushNotification.destroy()
			.then(function() {
				done();
			});
		});

		it('should logout with status 200 when UDID and UserType is valid', function(done) {
			request(server)
			.get('/account/Mobilelogout')
			.query({
				udid: testUdid,
				UserType: 'Maark'
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
		
		it('should logout with status 200 when UDID is invalid or UserType is not provided', function(done) {
			request(server)
			.get('/account/Mobilelogout')
			.query({
				udid: ''
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
	});

	describe('/account/register', function() {
		it('should register with status 200 when email is valid', function(done) {
			request(server)
			.post('/account/register')
			.send({
				Type: 'Shop',
				password: testPassword,
				username: testEmail,
				email: testEmail,
				IsMobileVerify: false
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Registered Successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when email is already registered', function(done) {
			request(server)
			.post('/account/register')
			.send({
				password: testPassword,
				username: testEmail,
				email: testEmail,
				IsMobileVerify: false
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Username is already Exist...');

				// Special case remove here
				User.findOne({
					where: {
						email: testEmail,
						password: jwt.encode(testPassword, 'bugz')
					}
				})
				.then(function(rUser) {
					return UserRole.destroy({
						where: {
							userId: rUser.id
						}
					})
					.then(function() {
						return rUser.destroy();
					});
				})
				.then(function() {
					done();
				});
			});
		});
	});

	describe('/account/ResendOTP', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				phone: testPhone,
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should resend OTP with status 200 when user ID is valid', function(done) {
			request(server)
			.get('/account/ResendOTP')
			.query({
				idUser: dUser.id,
				OTP: 111111
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Verification Code send to Registered Mobile Number.');
				done();
			});
		});
		
		it('should fail with status 200 when user ID is invalid', function(done) {
			request(server)
			.get('/account/ResendOTP')
			.query({
				idUser: 0,
				OTP: 111111
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid User');
				done();
			});
		});
	});

	describe('/account/CheckUserExist', function() {
		it('should return true with status 200 when username/email does not exist', function(done) {
			request(server)
			.post('/account/CheckUserExist')
			.send({
				username: testEmail,
				email: testEmail
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('user is not Exist...');
				done();
			});
		});
		
		it('should fail with status 200 when username/email exists', function(done) {
			// Special case create here
			var dUser;
			var dUserRole;
			
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1,
				Type: 'Owner'
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;

				request(server)
				.post('/account/CheckUserExist')
				.send({
					username: testEmail,
					email: testEmail,
					Type: 'Owner'
				})
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.exist;
					expect(res.body).to.have.property('success');
					expect(res.body).to.have.property('message');
					expect(res.body.success).to.equal(false);
					expect(res.body.message).to.equal('Username is already Exist...');
	
					// Special case remove here
					dUserRole.destroy()
					.then(function() {
						return dUser.destroy();
					})
					.then(function() {
						done();
					});
				});
			});
		});
	});

	describe('/account/changepassword', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should change password with status 200 when password is valid', function(done) {
			request(server)
			.post('/account/changepassword')
			.send({
				UserId: dUser.id,
				oldpassword: testPassword,
				password: testPassword,
				confirmpassword: testPassword
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password changed successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is invalid', function(done) {
			request(server)
			.post('/account/changepassword')
			.send({
				UserId: dUser.id,
				oldpassword: '',
				password: testPassword,
				confirmpassword: testPassword
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Old Password is wrong...');
				done();
			});
		});
	});

	describe('/account/changeUserPassword', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should change password with status 200 when password is valid', function(done) {
			request(server)
			.post('/account/changeUserPassword')
			.send({
				username: testEmail,
				password: testPassword,
				NewPassword: testPassword
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password changed successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is invalid', function(done) {
			request(server)
			.post('/account/changeUserPassword')
			.send({
				username: testEmail,
				password: '',
				NewPassword: testPassword
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Old Password is wrong...');
				done();
			});
		});
	});

	describe('/account/forgotpassword', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should change password and send email with status 200 when password is valid', function(done) {
			request(server)
			.get('/account/forgotpassword')
			.query({
				id: dUser.id
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password sent to your email successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is invalid', function(done) {
			request(server)
			.get('/account/forgotpassword')
			.query({
				id: 0
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('This Email not registered with us...');
				done();
			});
		});
	});

	//////////
	// NOTE: user registered email is null but forgot password email sent

	describe('/account/forgotpasswordNew', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should change password and send email with status 200 when password is valid', function(done) {
			request(server)
			.get('/account/forgotpasswordNew')
			.query({
				email: testEmail,
				idApp: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password sent to your email successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is invalid', function(done) {
			request(server)
			.get('/account/forgotpasswordNew')
			.query({
				email: '',
				idApp: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('This system Email not found...');
				done();
			});
		});
	});

	describe('/account/forgotpasswordfromOwnerCustomer', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should change password and send email with status 200 when password is valid', function(done) {
			request(server)
			.get('/account/forgotpasswordfromOwnerCustomer')
			.query({
				id: dUser.id
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password sent to your email successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is invalid', function(done) {
			request(server)
			.get('/account/forgotpasswordfromOwnerCustomer')
			.query({
				id: 0
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('This Email not registered with us...');
				done();
			});
		});
	});

	describe('/account/MobileAppLogin', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should login with status 200 when username/email and password is correct', function(done) {
			request(server)
			.get('/account/MobileAppLogin')
			.query({
				username: testEmail,
				password: testPassword
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('token');
				expect(res.body).to.have.property('UserId');
				expect(res.body).to.have.property('UserName');
				expect(res.body).to.have.property('Email');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.not.equal(null);
				expect(res.body.UserId).to.not.equal(null);
				expect(res.body.UserName).to.not.equal(null);
				expect(res.body.Email).to.not.equal(null);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is incorrect', function(done) {
			request(server)
			.get('/account/MobileAppLogin')
			.query({
				username: testEmail,
				password: ''
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});

	describe('/account/CheckMobileUserExist', function() {
		it('should return true with status 200 when username/email does not exist', function(done) {
			request(server)
			.post('/account/CheckMobileUserExist')
			.send({
				username: testEmail,
				email: testEmail
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('user is not Exist...');
				done();
			});
		});
		
		it('should fail with status 200 when username/email exists', function(done) {
			// Special case create here
			var dUser;
			var dUserRole;
			
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1,
				Type: 'Owner'
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;

				request(server)
				.post('/account/CheckMobileUserExist')
				.send({
					username: testEmail,
					email: testEmail,
					idApp: 1
				})
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.exist;
					expect(res.body).to.have.property('success');
					expect(res.body).to.have.property('message');
					expect(res.body.success).to.equal(false);
					expect(res.body.message).to.equal('Username is already Exist...');
	
					// Special case remove here
					dUserRole.destroy()
					.then(function() {
						return dUser.destroy();
					})
					.then(function() {
						done();
					});
				});
			});
		});
	});

	describe('/account/MobileRegister', function() {
		it('should register with status 200 when email is valid', function(done) {
			request(server)
			.post('/account/MobileRegister')
			.send({
				Type: 'Owner',
				password: testPassword,
				username: testEmail,
				email: testEmail,
				IsMobileVerify: false
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Registered Successfully...');
				done();
			});
		});

		describe('', function() {
			afterEach(function(done) {
				User.findAll({
					where: {
						email: testEmail,
						password: jwt.encode(testPassword, 'bugz')
					}
				})
				.then(function(rUsers) {
					var ids = [];
					for (var i = 0; i < rUsers.length; ++i) {
						ids.push(rUsers[i].id);
					}
	
					return UserRole.destroy({
						where: {
							userId: {
								$in: ids
							}
						}
					})
					.then(function() {
						return User.destroy({
							where: {
								id: {
									$in: ids
								}
							}
						});
					});
				})
				.then(function() {
					done();
				});
			});

			it('should fail with status 200 when email is already registered', function(done) {
				request(server)
				.post('/account/MobileRegister')
				.send({
					password: testPassword,
					username: testEmail,
					email: testEmail,
					IsMobileVerify: false
				})
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.exist;
					expect(res.body).to.have.property('success');
					expect(res.body).to.have.property('message');
					expect(res.body.success).to.equal(false);
					expect(res.body.message).to.equal('User Registration Failed...');
					done();
				});
			});
		});
	});

	describe('/account/MobileForgotPassword', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should change password and send email with status 200 when email is valid', function(done) {
			request(server)
			.get('/account/MobileForgotPassword')
			.query({
				email: testEmail
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password sent to your email successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when email is invalid', function(done) {
			request(server)
			.get('/account/MobileForgotPassword')
			.query({
				email: ''
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('This Email not registered with us...');
				done();
			});
		});
	});

	describe('/account/changeMobileUserPassword', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should change password with status 200 when password is valid', function(done) {
			request(server)
			.post('/account/changeMobileUserPassword')
			.send({
				username: testEmail,
				password: testPassword,
				NewPassword: testPassword
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password changed successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is invalid', function(done) {
			request(server)
			.post('/account/changeMobileUserPassword')
			.send({
				username: testEmail,
				password: '',
				NewPassword: testPassword
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Old Password is wrong...');
				done();
			});
		});
	});

	describe('/account/MobileApplogout', function() {
		var dPushNotification;
		
		beforeEach(function(done) {
			PushNotification.create({
				udid: testUdid,
				UserType: 'Maark'
			})
			.then(function(rPushNotification) {
				dPushNotification = rPushNotification;
				done();
			});
		});

		afterEach(function(done) {
			dPushNotification.destroy()
			.then(function() {
				done();
			});
		});

		it('should logout with status 200 when UDID and UserType is valid', function(done) {
			request(server)
			.get('/account/MobileApplogout')
			.query({
				udid: testUdid,
				UserType: 'Maark'
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
		
		it('should logout with status 200 when UDID is invalid or UserType is not provided', function(done) {
			request(server)
			.get('/account/MobileApplogout')
			.query({
				udid: ''
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
	});

	describe('/account/MobileAppLoginNew', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should login with status 200 when username/email and password is correct', function(done) {
			request(server)
			.get('/account/MobileAppLoginNew')
			.query({
				username: testEmail,
				password: testPassword,
				idApp: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('token');
				expect(res.body).to.have.property('UserId');
				expect(res.body).to.have.property('UserName');
				expect(res.body).to.have.property('Email');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.not.equal(null);
				expect(res.body.UserId).to.not.equal(null);
				expect(res.body.UserName).to.not.equal(null);
				expect(res.body.Email).to.not.equal(null);
				expect(res.body.message).to.equal('Login Successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is incorrect', function(done) {
			request(server)
			.get('/account/MobileAppLoginNew')
			.query({
				username: testEmail,
				password: '',
				idApp: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Invalid Username or Password...');
				done();
			});
		});
	});

	describe('/account/CheckMobileUserExistNew', function() {
		it('should return true with status 200 when username/email does not exist', function(done) {
			request(server)
			.post('/account/CheckMobileUserExistNew')
			.send({
				username: testEmail,
				email: testEmail,
				idApp: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('user is not Exist...');
				done();
			});
		});
		
		it('should fail with status 200 when username/email exists', function(done) {
			// Special case create here
			var dUser;
			var dUserRole;
			
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1,
				Type: 'Owner'
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;

				request(server)
				.post('/account/CheckMobileUserExistNew')
				.send({
					username: testEmail,
					email: testEmail,
					idApp: 1
				})
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.exist;
					expect(res.body).to.have.property('success');
					expect(res.body).to.have.property('message');
					expect(res.body.success).to.equal(false);
					expect(res.body.message).to.equal('Username is already Exist...');
	
					// Special case remove here
					dUserRole.destroy()
					.then(function() {
						return dUser.destroy();
					})
					.then(function() {
						done();
					});
				});
			});
		});
	});

	describe('/account/MobileRegisterNew', function() {
		it('should register with status 200 when email is valid', function(done) {
			request(server)
			.post('/account/MobileRegisterNew')
			.send({
				Type: 'Owner',
				password: testPassword,
				username: testEmail,
				email: testEmail,
				IsMobileVerify: false
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('User Registered Successfully...');
				done();
			});
		});

		describe('', function() {
			afterEach(function(done) {
				User.findAll({
					where: {
						email: testEmail,
						password: jwt.encode(testPassword, 'bugz')
					}
				})
				.then(function(rUsers) {
					var ids = [];
					for (var i = 0; i < rUsers.length; ++i) {
						ids.push(rUsers[i].id);
					}
	
					return UserRole.destroy({
						where: {
							userId: {
								$in: ids
							}
						}
					})
					.then(function() {
						return User.destroy({
							where: {
								id: {
									$in: ids
								}
							}
						});
					});
				})
				.then(function() {
					done();
				});
			});

			it('should fail with status 200 when email is already registered', function(done) {
				request(server)
				.post('/account/MobileRegisterNew')
				.send({
					password: testPassword,
					username: testEmail,
					email: testEmail,
					IsMobileVerify: false
				})
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.exist;
					expect(res.body).to.have.property('success');
					expect(res.body).to.have.property('message');
					expect(res.body.success).to.equal(false);
					expect(res.body.message).to.equal('User Registration Failed...');
					done();
				});
			});
		});
	});

	describe('/account/MobileForgotPasswordNew', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should change password and send email with status 200 when email is valid', function(done) {
			request(server)
			.get('/account/MobileForgotPasswordNew')
			.query({
				email: testEmail,
				idApp: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body).to.have.property('data');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password sent to your email successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when email is invalid', function(done) {
			request(server)
			.get('/account/MobileForgotPasswordNew')
			.query({
				email: '',
				idApp: 1
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('This Email not registered with us...');
				done();
			});
		});
	});

	describe('/account/changeMobileUserPasswordNew', function() {
		var dUser;
		var dUserRole;

		beforeEach(function(done) {
			User.create({
				username: testEmail,
				email: testEmail,
				password: jwt.encode(testPassword, 'bugz'),
				IsMobileVerify: false,
				idApp: 1
			})
			.then(function(rUser) {
				dUser = rUser;
				
				return UserRole.create({
					userId: rUser.id,
					roleId: 3
				});
			})
			.then(function(rUserRole) {
				dUserRole = rUserRole;
				done();
			});
		});

		afterEach(function(done) {
			dUserRole.destroy()
			.then(function() {
				return dUser.destroy();
			})
			.then(function() {
				done();
			});
		});

		it('should change password with status 200 when password is valid', function(done) {
			request(server)
			.post('/account/changeMobileUserPasswordNew')
			.send({
				UserId: dUser.id,
				password: testPassword,
				NewPassword: testPassword
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Password changed successfully...');
				done();
			});
		});
		
		it('should fail with status 200 when password is invalid', function(done) {
			request(server)
			.post('/account/changeMobileUserPasswordNew')
			.send({
				UserId: dUser.id,
				password: '',
				NewPassword: testPassword
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(false);
				expect(res.body.message).to.equal('Old Password is wrong...');
				done();
			});
		});
	});

	describe('/account/MobileApplogoutNew', function() {
		var dPushNotification;
		
		beforeEach(function(done) {
			PushNotification.create({
				udid: testUdid,
				UserType: 'Maark'
			})
			.then(function(rPushNotification) {
				dPushNotification = rPushNotification;
				done();
			});
		});

		afterEach(function(done) {
			dPushNotification.destroy()
			.then(function() {
				done();
			});
		});

		it('should logout with status 200 when UDID and UserType is valid', function(done) {
			request(server)
			.get('/account/MobileApplogoutNew')
			.query({
				udid: testUdid,
				UserType: 'Maark'
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
		
		it('should logout with status 200 when UDID is invalid or UserType is not provided', function(done) {
			request(server)
			.get('/account/MobileApplogoutNew')
			.query({
				udid: ''
			})
			.expect(200)
			.end(function(err, res) {
				expect(res.body).to.exist;
				expect(res.body).to.have.property('success');
				expect(res.body).to.have.property('message');
				expect(res.body.success).to.equal(true);
				expect(res.body.message).to.equal('Logout Successfully.');
				done();
			});
		});
	});
});