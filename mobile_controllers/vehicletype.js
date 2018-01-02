//Tables
var router = express.Router();
var VehicleType = models.tblvehicletype;
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
//-----(web app):-get vehcile type-----
router.get('/GetAllActivevehicletype', function(req, res) {

    VehicleType.findAll({ where: { IsActive: 1 } }).then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json({ success: false, data: err });
    })
})

module.exports = router