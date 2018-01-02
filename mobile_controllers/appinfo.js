var express = require('express'),
    router = express.Router();
//Tables
var AppInfo = models.tblappinfo;
//End of Tables

//----------------------(MobileApp):-(Appinfo at app runtime)----------------------------------------
router.get('/GetAppInfoByName', function(req, res) {
    AppInfo.findOne({ where: { AppName: req.query.AppName } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    });
})

///----------------------(WebApp):-(Appinfo at app runtime)----------------------------------------
router.get('/GetAppInfoByWebApp', function(req, res) {
    AppInfo.findOne({ where: { WebAppUrl: req.query.WebAppUrl } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    });
})
module.exports = router