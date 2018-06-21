var express = require('express'),
    router = express.Router();

var Vehicle = models.tblvehicle;

router.get('/Setfullfuelpoint', function(req, res) {
    var DeviceId = req.query.deviceid; //'52852852852852';
    client.get(DeviceId, function(err, strgpsdata) {
        var AD1 = 0;
        if (!err) {
            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                var objgps = JSON.parse(strgpsdata);
                if (objgps.AD1 != null && objgps.AD1 != undefined && objgps.AD1 != '') {
                    AD1 = parseInt(objgps.AD1, 16);
                }
            }
        }
        res.json(AD1);

    })
})

router.get('/SetVehicleFuelData', function(req, res) {
    var fullfuelpoint = 0;
    var fueltanksize = 0;
    if (req.query.fullfuelpoint != null && req.query.fullfuelpoint != undefined && req.query.fullfuelpoint != '') {
        fullfuelpoint = parseFloat(req.query.fullfuelpoint);
    }
    if (req.query.fueltanksize != null && req.query.fueltanksize != undefined && req.query.fueltanksize != '') {
        fueltanksize = parseFloat(req.query.fueltanksize);
    }
    Vehicle.findOne({ where: { deviceid: req.query.deviceid } }).then(function(vehicleExist) {
        if (vehicleExist) {
            var FuelRatio = (fullfuelpoint - 40) / fueltanksize;
            var FuelCapacity = fueltanksize;
            vehicleExist.updateAttributes({ FuelRatio: FuelRatio, FuelCapacity: FuelCapacity, IsFule: true }).then(function(response) {
                if (response) {
                    funAuditLog.CreateAuditLog('Update Fuel Data', 'Calibration', 'Update vehicle fuel data: (FuelRatio:' + (FuelRatio).toFixed(2) + ') & (FuelCapacity:' + (FuelCapacity).toFixed(2) + ') ');
                    res.json({ success: true, message: "Fuel Calibration updated successfully." })
                } else {
                    res.json({ success: false, message: "Fuel Calibration not updated." })
                }
            })
        } else {
            res.json({ success: false, message: "Vehicle not assign with this deviceid." })
        }
    })

})

module.exports = router