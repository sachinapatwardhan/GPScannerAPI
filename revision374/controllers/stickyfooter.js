//Tables
var router = express.Router();
var User = models.tbluserinformation;
var StickyFooter = models.tblstickyfooter;
//End of Tables

router.get('/GetAllStickyFooter', function (req, res) {
    StickyFooter.findAll().then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})

router.get('/GetStickyFooterById', function (req, res) {
    StickyFooter.findOne({ where: { id: req.query.idStickyFooter } }).then(function (response) {
        if (response != null) {
            res.json({ success: true, message: "Sticky-Footer found...", data: response });
        }
        else {
            res.json({ success: false, message: "Sticky-Footer not found...", data: response });
        }
    })
})

router.post('/SaveStickyFooter', jsonParser, function (req, res) {
    objStickyFooter = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                if (objStickyFooter.id == 0) {
                    StickyFooter.findOrCreate({ where: { Name: objStickyFooter.Name }, defaults: objStickyFooter }).then(function (response) {
                        if (response[1]) {
                            funAuditLog.CreateAuditLog('SaveStickyFooter', UserExist.username , 'Create Sticky-Footer');
                            res.json({ success: true, message: "Sticky-Footer created successfully...", data: response });
                        }
                        else {
                            res.json({ success: false, message: "Sticky-Footer is already Exist...", data: response });
                        }
                    })
                } else {
                    StickyFooter.findOne({ where: { Name: objStickyFooter.Name }, defaults: objStickyFooter }).then(function (objStickyFooterExist) {
                        if (objStickyFooterExist != null && objStickyFooter.Id != objStickyFooterExist.Id) {
                            res.json({ success: false, message: "Sticky-Footer is already Exist...", data: objStickyFooterExist });
                        }
                        else {
                            StickyFooter.update(objStickyFooter, { where: { id: objStickyFooter.id } }).then(function (response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('SaveStickyFooter', UserExist.username , 'Update Sticky-Footer');
                                    res.json({ success: true, message: "Sticky-Footer updated successfully...", data: response });
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
    }
    else {
        res.json(InvalidToken);
    }
});

router.get('/DeleteStickyFooter', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                StickyFooter.destroy({ where: { id: req.query.idStickyFooter } }).then(function (response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeleteStickyFooter', UserExist.username , 'Delete Sticky-Footer');
                        res.json({ success: true, message: "Sticky-Footer deleted successfully...", data: response });
                    }
                    else {
                        res.json(RecordNotFound);
                    }
                })
            }
            else {
                res.json(InvalidToken);
            }
        })
    }
    else {
        res.json(InvalidToken);
    }
});

module.exports = router
