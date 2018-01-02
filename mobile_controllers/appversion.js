var router = express.Router();
var AppVersion = models.tblappversion;
var AppInfo = models.tblappinfo;
//End of Tables

//Media Size
//----------------------(MobileApp):-(check app version)----------------------------------------
router.get('/GetAppVersionByName', function(req, res) {
    AppVersion.findOne({ where: { Name: req.query.Name } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})


//----------------------(MobileApp):-(check app version)----------------------------------------
router.get('/GetAppVersionByAppNameNew', function(req, res) {
    AppInfo.findOne({ where: { WebAppUrl: req.query.WebAppUrl } }).then(function(response) {
        if (response != null) {
            AppVersion.findOne({ where: { Name: response.AppName } }).then(function(resVersion) {
                res.json(resVersion);
            }).catch(function(error) {
                res.json(error);
            })
        } else {
            res.json(response);
        }
    }).catch(function(error) {
        res.json(error);
    })
})

module.exports = router