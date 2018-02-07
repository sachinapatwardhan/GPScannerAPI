var router = express.Router();
var User = models.tbluserinformation;
var AppVersion = models.tblappversion;
var AppInfo = models.tblappinfo;
//End of Tables

//Media Size
router.get('/GetAppVersionByName', function(req, res) {
    AppVersion.findOne({ where: { Name: req.query.Name } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAppVersionByAppName', function(req, res) {
    var query = "select * from tblappversion inner join tblappinfo ON tblappinfo.AppName= tblappversion.Name where tblappversion.Name='" + req.query.Name + "'";
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            res.json(rows);
        } else {
            // console.log(err);
            res.json({ success: false });
        }
    })
})

router.get('/GetAppVersionByAppNameNew', function(req, res) {
    var query = "select * from tblappinfo inner join tblappversion on tblappinfo.AppName = tblappversion.Name where tblappinfo.WebAppUrl='" + req.query.WebAppUrl + "'";
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            res.json(rows);
        } else {
            res.json({ success: false });
        }
    })

    // AppInfo.findOne({ where: { WebAppUrl: req.query.WebAppUrl } }).then(function(response) {
    //     if (response != null) {
    //         AppVersion.findOne({ where: { Name: response.AppName } }).then(function(resVersion) {
    //             res.json(resVersion);
    //         }).catch(function(error) {
    //             res.json(error);
    //         })
    //     } else {
    //         res.json(response);
    //     }
    // }).catch(function(error) {
    //     res.json(error);
    // })
})

module.exports = router