var express = require('express'),
    router = express.Router();

var Vehicle = models.tblvehicle;

router.get('/SetfullfuelPoint', function(req, res) {
    var DeviceId = req.query.deviceid; //'52852852852852';
    client.get(DeviceId, function(err, strgpsdata) {
        var AD1 = 0;
        var GPSDate = 0;
        if (!err) {
            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                var objgps = JSON.parse(strgpsdata);
                if (objgps.AD1 != null && objgps.AD1 != undefined && objgps.AD1 != '') {
                    AD1 = parseInt(objgps.AD1, 16);
                }
                GPSDate = objgps.Date;
            }
        }
        var obj = {
            AD1: AD1,
            GPSDate: GPSDate
        }
        res.json(obj);
    })
})

router.get('/GetVehicleDetail', function(req, res) {
    connection.query("SELECT * from tblvehicle where deviceid='" + req.query.DeviceId + "' and IsDelete = false;", function(err, rows, fields) {
        if (!err && rows.length > 0) {
            var obj = new Object();
            obj.id = rows[0].id;
            obj.iduser = rows[0].iduser;
            obj.Name = rows[0].Name;
            obj.deviceid = rows[0].deviceid;
            obj.IsOnline = rows[0].IsOnline;
            obj.DeviceType = rows[0].DeviceType;
            obj.DeviceCompany = rows[0].DeviceCompany;
            obj.VehicleType = rows[0].VehicleType;
            client.get(req.query.DeviceId, function(err, strgpsdata) {
                if (!err) {
                    if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                        var objgps = JSON.parse(strgpsdata);
                        obj.IsEngine = objgps.IsEngine;
                        obj.Latitude = objgps.Latitude;
                        obj.Longitude = objgps.Longitude;
                        obj.Date = objgps.Date;
                        obj.Speed = objgps.Speed;
                        obj.Direction = objgps.Direction;
                        obj.OdoMeter = objgps.OdoMeter;
                        obj.AD1 = objgps.AD1;
                        obj.AD2 = objgps.AD2;
                        obj.IsWiringForAntiTamper = objgps.IsWiringForAntiTamper;

                    } else {
                        obj.IsEngine = null;
                        obj.Latitude = null;
                        obj.Longitude = null;
                        obj.Date = null;
                        obj.Speed = null;
                        obj.Direction = null;
                        obj.OdoMeter = null;
                        obj.AD1 = 0;
                        obj.AD2 = 0;
                    }
                } else {
                    obj.IsEngine = null;
                    obj.Latitude = null;
                    obj.Longitude = null;
                    obj.Date = null;
                    obj.Speed = null;
                    obj.Direction = null;
                    obj.OdoMeter = null;
                    obj.AD1 = 0;
                    obj.AD2 = 0;
                }
                res.json({ success: true, data: obj });
            });

        } else {
            res.json({ success: false, data: null });
        }
    });
});

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
                    funAuditLog.CreateAuditLog('Update Fuel Data', 'Calibration', 'Update Vehicle fuel data: (FuelRatio:' + (FuelRatio).toFixed(2) + ') & (FuelCapacity:' + (FuelCapacity).toFixed(2) + ') ');
                    res.json({ success: true, message: "Fuel Calibration updated successfully." })
                } else {
                    res.json({ success: false, message: "Fuel Calibration not updated." })
                }
            })
        } else {
            res.json({ success: false, message: "Vehicle not assign with this device ID." })
        }
    })

})

module.exports = router