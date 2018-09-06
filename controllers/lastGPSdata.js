var router = express.Router();
var sequelize = models.sequelize;
var User = models.tbluserinformation;
var AccessClient = models.tblapiaccessclient;
var AppInfo = models.tblappinfo;
var GPS = models.tblgpsdata;
var GPSDevice = models.tblgpsdevice;

router.get('/getlastgpsdata', function(req, res) {

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
            if (AccessClientExist.DeviceId != null && AccessClientExist.DeviceId != undefined) {
                if (AccessClientExist.DeviceId.indexOf(req.query.DeviceId) >= 0) {
                    client.get(req.query.DeviceId, function(err, strLast7Record) {
                        var lstlastrecord = null;
                        if (!err) {
                            if (strLast7Record != null && strLast7Record != undefined && strLast7Record != '') {
                                lstlastrecord = JSON.parse(strLast7Record);
                            }
                        }
                        var finaldata = null;
                        if (lstlastrecord != null) {
                            lstlastrecord.Date = moment.unix(lstlastrecord.Date).utc().format('DD-MM-YYYY HH:mm:ss ') + '(UTC)';
                            var objfinaldata = new Object();
                            objfinaldata.Deviceid = lstlastrecord.Deviceid;
                            objfinaldata.GPSDate = lstlastrecord.Date;
                            objfinaldata.Latitude = lstlastrecord.Latitude;
                            objfinaldata.Longitude = lstlastrecord.Longitude;
                            objfinaldata.Speed = lstlastrecord.Speed;
                            objfinaldata.Position = lstlastrecord.Position;
                            objfinaldata.Direction = lstlastrecord.Direction;
                            objfinaldata.EngineStatus = lstlastrecord.IsEngine;
                            if (lstlastrecord.OdoMeter != null && lstlastrecord.OdoMeter != undefined) {
                                objfinaldata.OdoMeter = Math.floor(parseInt(lstlastrecord.OdoMeter) / 1000);
                            } else {
                                objfinaldata.OdoMeter = 0;
                            }
                            finaldata = objfinaldata;
                        }

                        res.json({ success: true, message: "Last GPS Data get successfully.", data: finaldata });
                    });


                } else {
                    res.json({ success: false, message: "Invalid DeviceId.", data: null });
                }
            } else {
                res.json({ success: false, message: "Invalid DeviceId.", data: null });
            }

        } else {
            res.json({ success: false, message: "Invalid Token/Key.", data: null });
        }

    })
})





module.exports = router;