//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Vendor = models.vendor;
var Product = models.product;
//End of Tables

router.get('/GetAllVendor', function (req, res) {
    Vendor.findAll().then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})

router.get('/GetVendorById', function (req, res) {
    Vendor.findOne({ where: { Id: req.query.idVendor } }).then(function (response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        }
        else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveVendor', jsonParser, function (req, res) {
    objVendor = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                if (objVendor.Id == 0) {
                    Vendor.findOrCreate({ where: { Name: objVendor.Name }, defaults: objVendor }).then(function (response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('SaveVendor', UserExist.username , 'Create Vendor');
                            res.json({ success: true, message: "Vendor created successfully...", data: response });
                        }
                        else {
                            res.json({ success: false, message: "Vendor is already Exist...", data: response });
                        }
                    })
                } else {
                    Vendor.findOne({ where: { Name: objVendor.Name }, defaults: objVendor }).then(function (objVendorExist) {
                        if (objVendorExist != null && objVendor.Id != objVendorExist.Id) {
                            res.json({ success: false, message: "Vendor is already Exist...", data: objVendorExist });
                        }
                        else {
                            Vendor.update(objVendor, { where: { Id: objVendor.Id } }).then(function (response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('SaveVendor', UserExist.username , 'Update Vendor');
                                    res.json({ success: true, message: "Vendor updated successfully...", data: response });
                                }
                            })
                        }
                    })
                }
            }
            else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/DeleteVendor', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                Product.findOne({ where: { VendorId: req.query.idVendor } }).then(function (resProduct) {
                    if (resProduct == null) {
                        Vendor.destroy({ where: { Id: req.query.idVendor } }).then(function (response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('DeleteVendor', UserExist.username , 'Delete Vendor');
                                res.json({ success: true, message: "Vendor deleted successfully...", data: response });
                            }
                            else {
                                res.json({ success: false, message: "Requested Record not Exist....", data: response });
                            }
                        })
                    } else {
                        res.json(NotDeleteReferenceData);
                    }
                })
            }
            else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

module.exports = router
