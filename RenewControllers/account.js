//Tables
var router = express.Router();
var User = models.tbluserinformation;
var UserRole = models.tbluserinrole;
var Role = models.tblrole;
var Country = models.tblcountrymgmt;
var State = models.tblcountrystatemgmt;
var SystemEmail = models.tblemailsettingsys;
var EmailTemplate = models.tblemailtemplate;
var PushNotification = models.tblpushnotification;
var Setting = models.tblsetting;
var SharedEmailTbl = models.tblsharedemail;
var ShareDevice = models.tblsharedevice;
var Vehicle = models.tblvehicle;


router.get('/MobileAppLoginNew', jsonParser, function(req, res) {
    var Encryptpassword = jwt.encode(req.query.password, "bugz");

    User.hasMany(UserRole, {
        foreignKey: {
            name: 'userId',
            allowNull: false
        }
    });
    UserRole.belongsTo(Role, {
        foreignKey: {
            name: 'roleId',
            allowNull: false
        }
    });
    console.log(req.query)
    User.findOne({
            where: {
                $or: {
                    username: req.query.username,
                    email: req.query.username,
                    phone: req.query.username,
                },
                password: Encryptpassword,
                idApp: req.query.idApp,
            },
            include: [{
                model: UserRole,
                include: [{
                    model: Role,
                    where: {
                        RoleName: 'Sales Agent'
                    }
                }]
            }],

        })
        .then(function(rSalesAgents) {
            if (rSalesAgents == null) {
                res.json({
                    success: false,
                    message: "Invalid Username or Password..."
                });
            } else {

                var lstRole = [];
                for (var i = 0; i < rSalesAgents.tbluserinroles.length; i++) {
                    var objRole = rSalesAgents.tbluserinroles[i].tblrole.RoleName;
                    lstRole.push(objRole);
                }
                var user = {
                    username: rSalesAgents.username,
                    password: Encryptpassword,
                    Role: lstRole
                }
                var token = jwt.encode(user, "bugz");
                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    UserId: rSalesAgents.id,
                    UserName: rSalesAgents.username,
                    Email: rSalesAgents.email,
                    Notification: rSalesAgents.Notification,
                    SpeedValue: rSalesAgents.SpeedValue,
                    IsIgnition: rSalesAgents.IsIgnition,
                    message: "Login Successfully..."
                });
            }

        })
        .catch(function(err) {
            res.json({
                success: false,
                message: 'Record(s) not found.'
            });
            console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
        });
});

function updatePushNotificationRedisValue(id) {
    var query = "SELECT tv.deviceid " +
        " FROM tblvehicle tv " +
        " LEFT JOIN tblsharedevice tsd ON tv.id=tsd.idVehicle " +
        " where  (tv.iduser=" + id + " or tsd.iduser=" + id + ")  and tv.IsDelete = 0";
    connection.query(query, function(err, response, filed) {
        if (response) {
            for (var i = 0; i < response.length; i++) {
                Commonfunction.UpdateVehicleRedis(response[i].deviceid, 'PushNotification')
            }
        }
    })
}

function updateUserRedisValue(id) {
    Vehicle.findAll({ where: { iduser: id } }).then(function(response) {
        if (response) {
            for (var i = 0; i < response.length; i++) {
                Commonfunction.UpdateVehicleRedis(response[i].deviceid, 'User')
            }
        }
    })
}
//End Of New Mobile App wise

//Private functions
var maxLength = 6;
var minLength = 6;
var uppercaseMinCount = 2;
var lowercaseMinCount = 2;
var numberMinCount = 2;
var specialMinCount = 1;
var UPPERCASE_RE = /([A-Z])/g;
var LOWERCASE_RE = /([a-z])/g;
var NUMBER_RE = /([\d])/g;
var SPECIAL_CHAR_RE = /([\?\-\^\$\#\@\!\%\&\*])/g;
var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

function isStrongEnough(password) {
    var uc = password.match(UPPERCASE_RE);
    var lc = password.match(LOWERCASE_RE);
    var n = password.match(NUMBER_RE);
    // var sc = password.match(SPECIAL_CHAR_RE);
    var nr = password.match(NON_REPEATING_CHAR_RE);
    return password.length >= minLength &&
        !nr &&
        uc && uc.length >= uppercaseMinCount &&
        lc && lc.length >= lowercaseMinCount &&
        n && n.length >= numberMinCount;
    // &&
    // sc && sc.length >= specialMinCount;
}

function customPassword() {
    var password = "";
    var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
    while (!isStrongEnough(password)) {
        password = generatePassword(randomLength, false, /[\w\d\?\-]/);
    }
    return password;
}
//End of Private functions

module.exports = router