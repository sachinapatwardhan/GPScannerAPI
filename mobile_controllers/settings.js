//Tables
var router = express.Router();
var TaxSetting = models.tblsetting;
//End of Tables

router.get('/GetTaxSettingForSharlink', function(req, res) {
    TaxSetting.findOne({ where: { Name: req.query.TaxSettingName } }).then(function(response) {
        if (response != null) {
            var response1 = new Object();
            response1.Name = response.Name
            response1.enDeviceId = jwt.encode(req.query.DeviceId, "bugz");
            response1.link = response.Value + '/' + response1.enDeviceId;
            res.json({ success: true, message: "Record found...", data: response1 });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

module.exports = router