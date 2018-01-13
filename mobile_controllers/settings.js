//Tables
var router = express.Router();
var TaxSetting = models.tblsetting;
//End of Tables

router.get('/GetTaxSettingForSharlink', function(req, res) {
    TaxSetting.findOne({ where: { Name: req.query.TaxSettingName } }).then(function(response) {
        if (response != null) {
            Vehicle.findOne({ where: { deviceid: req.query.DeviceId } }).then(function(VehicleExist) {
                if (VehicleExist.ShareCode != null && VehicleExist.ShareCode != '' && VehicleExist.ShareCode != undefined) {
                    var response1 = new Object();
                    response1.Name = response.Name
                    var url = req.query.DeviceId + "," + VehicleExist.ShareCode;
                    response1.enDeviceId = jwt.encode(url, "bugz");
                    response1.link = response.Value + '/' + response1.enDeviceId;
                    res.json({ success: true, message: "Record found...", data: response1 });
                } else {
                    VehicleExist.updateAttributes({ ShareCode: Math.floor(100000 + Math.random() * 900000) }).then(function(shareCodeupdated) {
                        var response1 = new Object();
                        response1.Name = response.Name
                        var url = req.query.DeviceId + "," + shareCodeupdated.ShareCode;
                        response1.enDeviceId = jwt.encode(url, "bugz");
                        response1.link = response.Value + '/' + response1.enDeviceId;
                        res.json({ success: true, message: "Record found...", data: response1 });
                    })
                }
            })
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

module.exports = router