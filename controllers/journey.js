var router = express.Router();
var User = models.tbluserinformation;
var JourneyRoute = models.tbljourneyroute;

router.get('/GetDeviceJourney', function(req, res) {
    console.log(req.query)
    JourneyRoute.findAll({ where: { DeviceId: req.query.DeviceId, EndTime: { $ne: null } }, order: 'StartTime desc' }).then(function(response) {
        res.json(response)
    })
})


router.get('/GetDeviceLastJourney', function(req, res) {
    JourneyRoute.findOne({ where: { DeviceId: req.query.DeviceId, EndTime: { $eq: null } }, order: 'StartTime desc' }).then(function(response) {
        if (response) {
            res.json({ success: true, data: response })
        } else {
            res.json({ success: false, data: response })
        }
    })
})



router.post('/StartJourney', jsonParser, function(req, res) {
    console.log(req.body)
    objJourney = req.body;
    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                JourneyRoute.findOne({ where: { DeviceId: objJourney.DeviceId, EndTime: { $eq: null } }, order: 'StartTime desc' }).then(function(JourneyRouteExist) {
                    if (JourneyRouteExist) {
                        JourneyRouteExist.updateAttributes({
                            EndTime: new Date(),
                            ModifieDate: new Date(),
                            ModifiedBy: UserExist.username,
                        }).then(function(response) {
                            if (response) {
                                res.json({ success: true, message: 'Joureny stop successfully..' });
                            } else {
                                res.json({ success: false, message: 'Joureny not stop..' });
                            }
                        })
                    } else {
                        objJourney.StartTime = new Date();
                        objJourney.CreatedDate = new Date();
                        objJourney.CreatedBy = UserExist.username;

                        JourneyRoute.create(objJourney).then(function(response) {
                            if (response) {
                                res.json({ success: true, message: 'Joureny started successfully..' });
                            } else {
                                res.json({ success: false, message: 'Joureny not started..' });
                            }
                        })
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

module.exports = router