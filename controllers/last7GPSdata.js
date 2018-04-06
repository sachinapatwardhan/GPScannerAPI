var router = express.Router();
var sequelize = models.sequelize;
var User = models.tbluserinformation;
var AccessClient = models.tblapiaccessclient;
var AppInfo = models.tblappinfo;
var GPS = models.tblgpsdata;
var GPSDevice = models.tblgpsdevice;

router.get('/getlast7gpsdata', function(req, res) {

    AccessClient.findOne({
        where: {
            $and: {
                Token: req.query.Token, //'FV6AGM0YHU',
                Key: req.query.Key, //'ml4xZQgvfzZwpr4u',
                IsActive: 1,
            }
        }
    }).then(function(AccessClientExist) {
        if (AccessClientExist != null) {
            GPSDevice.belongsTo(AppInfo, {
                foreignKey: 'AppName',
                targetKey: 'AppName',
            });
            GPSDevice.findOne({
                where: {
                    DeviceId: req.query.DeviceId //59197080005615
                },
                include: [{
                    model: AppInfo,
                    required: true,
                }],
            }).then(function(IsDeviceExist) {
                if (IsDeviceExist != null) {
                    if (IsDeviceExist.tblappinfo.Id == AccessClientExist.AppName) {
                        query = "SELECT DeviceId,Date,Latitude,Longitude,Speed,Direction,GPSPositioning as Position,IsPatchEngine as Engine,Altitude from tblgpsdata order By Date desc limit 7";
                        connection.query(query, function(err, lstRecord, fields) {
                            if (!err) {
                                for (var i = 0; i < lstRecord.length; i++) {
                                    lstRecord[i].Date = moment.unix(lstRecord[i].Date).utc().format('DD-MM-YYYY HH:mm:ss ') + '(UTC)';
                                }
                                var response = new Object();
                                response.data = lstRecord;
                                res.json(response)
                            } else {
                                var response = new Object();
                                response.data = [];
                                res.json(response)
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Invalid Device." });
                    }
                } else {
                    res.json({ success: false, message: "Device not exist" });
                }
            })
        } else {
            res.json({ success: false, message: "Invalid Token/Key Or API Access Inactive.." });
        }

    })
})



module.exports = router;