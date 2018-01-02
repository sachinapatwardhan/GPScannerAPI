var express = require('express'),
    router = express.Router();
//Tables
var DrivingData = models.tbldrivingdata;
//End of Tables

//----------mobile app:- get all driving data on locate me page
router.get('/GetDrivingDataByDeviceId', function(req, res) {
    DrivingData.findOne({
        where: { DeviceId: req.query.DeviceId },
        order: 'Datetime desc'
    }).then(function(response) {
        res.json({
            success: true,
            message: "Record found...",
            data: response
        });
    }).catch(function(error) {
        res.json(RecordNotFound);
    })

})


module.exports = router