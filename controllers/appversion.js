var router = express.Router();
var User = models.tbluserinformation;
var AppVersion = models.tblappversion;
//End of Tables

//Media Size
router.get('/GetAppVersionByName', function(req, res) {
    AppVersion.findOne({ where: { Name: req.query.Name } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

module.exports = router