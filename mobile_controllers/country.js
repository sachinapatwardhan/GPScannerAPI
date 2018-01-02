//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Country = models.tblcountrymgmt;
var State = models.tblcountrystatemgmt;
var Address = models.address;
var BillingAddress = models.tblbillingaddress;
var DeliveryAddress = models.tbldeliveryaddress;
var Order = models.tblorder;
var Countrycode = models.tblcountrycode;
var LanguageInCountry = models.tbllanguageincountry;


//Get Current country
//--============(Mobile & web App):-(get Current Country Name )------------------
router.get('/GetCurrentCountry', function(req, res) {
    request.get({
        url: 'http://freegeoip.net/json/' + req.connection.remoteAddress,
    }, function(error, response, body) {
        console.log(body)
        if (body.indexOf("Error") >= 0) {
            res.json(null);
        } else {
            try {
                var data = eval('(' + body + ')');
                var objCurrentCountry = data
                res.json(objCurrentCountry);
            } catch (ex) {
                var mail = {
                    from: 'soham.patel@bugzstudio.com',
                    to: 'soham.patel@bugzstudio.com',
                    subject: 'Maark Get Current Country API error',
                    text: body
                };
                transporter.sendMail(mail, function(error, response) {

                });
                res.json(null);
            }
        }
    })
});

//--------------(MobileApp:-Get Country)-------------------
router.get('/GetCountryCode', function(req, res) {
    Countrycode.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})


module.exports = router