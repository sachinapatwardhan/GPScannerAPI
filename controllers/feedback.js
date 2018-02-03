var express = require('express'),
    router = express.Router();
var FeedBack = models.tblfeedback;
var User = models.tbluserinformation;

router.get('/GetFeedbackByUser', function(req, res) {
    FeedBack.findOne({ where: { IdUser: req.query.IdUser } }).then(function(response) {
        res.json(response)
    })
})
router.post('/saveUserfeedBack', jsonParser, function(req, res) {
    console.log(req.body);
    objfeedback = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {

                FeedBack.findOne({
                    where: { IdUser: objfeedback.IdUser }
                }).then(function(FeedBackExits) {
                    if (FeedBackExits) {
                        FeedBack.update(objfeedback, { where: { IdUser: objfeedback.IdUser } }).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('update Feedback', UserExist.username, 'Update Feedback');
                                res.json({ success: true, message: "FeedBack updated successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "FeedBack not updated...", data: response });
                            }
                        })
                    } else {
                        objfeedback.CreatedDate = new Date();
                        objfeedback.CreatedBy = UserExist.username;
                        FeedBack.create(objfeedback).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('feedback cerate', UserExist.username, 'Cerate New feedback');
                                res.json({ success: true, message: "FeedBack created successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "FeedBack is already Exist...", data: response });
                            }
                        })
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

module.exports = router