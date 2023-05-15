var router = express.Router();
var Address = models.tbladdress;

router.get('/SaveAddress', function (req, res) {
  var obj = new Object();
  obj.Address = req.query.Address;
  obj.Lat = req.query.Lat;
  obj.Lng = req.query.Lng;
  Address.findOrCreate({ where: { Lat: obj.Lat, Lng: obj.Lng }, defaults: obj })
    .then(function (resAddress) {
      res.json({ success: true, message: 'Address created successfully.' });
    })
    .catch(function (err) {
      res.json({ success: false, message: 'Address could not created.' });
    });
});
module.exports = router;
