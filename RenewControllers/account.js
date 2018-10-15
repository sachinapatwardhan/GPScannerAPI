//Tables
var router = express.Router();
var User = models.tbluserinformation;
var UserRole = models.tbluserinrole;
var Role = models.tblrole;

router.get('/MobileAppLoginNew', jsonParser, function (req, res) {
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
        .then(function (rSalesAgents) {
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
        .catch(function (err) {
            res.json({
                success: false,
                message: 'Record(s) not found.'
            });
            console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
        });
});
module.exports = router