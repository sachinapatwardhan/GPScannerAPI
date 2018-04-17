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
                Token: req.query.Token,
                Key: req.query.Key,
                IsActive: 1,
            }
        }
    }).then(function(AccessClientExist) {
        if (AccessClientExist != null) {
            if (AccessClientExist.DeviceId != null) {
                if (AccessClientExist.DeviceId.indexOf(req.query.DeviceId) >= 0) {
                    client.get(req.query.DeviceId + "Last7Records", function(err, strLast7Record) {
                        var lstlast7record = [];
                        if (!err) {
                            if (strLast7Record != null && strLast7Record != undefined && strLast7Record != '') {
                                lstlast7record = JSON.parse(strLast7Record);
                            }
                        }
                        var finaldata = [];
                        for (var i = 0; i < lstlast7record.length; i++) {
                            lstlast7record[i].Date = moment.unix(lstlast7record[i].Date).utc().format('DD-MM-YYYY HH:mm:ss ') + '(UTC)';
                            var objfinaldata = new Object();
                            objfinaldata.Deviceid = lstlast7record[i].Deviceid;
                            objfinaldata.GPSDate = lstlast7record[i].Date;
                            objfinaldata.Latitude = lstlast7record[i].Latitude;
                            objfinaldata.Longitude = lstlast7record[i].Longitude;
                            objfinaldata.Speed = lstlast7record[i].Speed;
                            objfinaldata.Position = lstlast7record[i].Position;
                            objfinaldata.Direction = lstlast7record[i].Direction;
                            objfinaldata.EngineStatus = lstlast7record[i].IsEngine;
                            finaldata.push(objfinaldata);
                        }
                        res.json({ success: true, message: "Last 7 GPS Data get successfully.", data: finaldata });
                    });


                } else {
                    res.json({ success: false, message: "Device Permission is not given", data: [] });
                }
            } else {
                res.json({ success: false, message: "Device Permission is not given", data: [] });
            }

        } else {
            res.json({ success: false, message: "Invalid Token/Key Or API Access Inactive..", data: [] });
        }

    })
})





module.exports = router;