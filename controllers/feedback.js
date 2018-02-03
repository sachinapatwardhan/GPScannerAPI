var express = require('express'),
    router = express.Router();
var FeedBack = models.tblfeedback;
var User = models.tbluserinformation;

router.get('/GetFeedbackByUser', function(req, res) {
    FeedBack.findOne({ where: { IdUser: req.query.IdUser } }).then(function(response) {
        res.json(response)
    })
})

router.get('/GetAllFeedback', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (tblfeedback.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tblfeedback.AppsUserFriendly like "%' + objSearch + '%" or ';
        search = search + 'tblfeedback.GPSAccuracy like "%' + objSearch + '%" or ';
        search = search + 'tblfeedback.TrackLocLiverate like "%' + objSearch + '%" or ';
        search = search + 'tblfeedback.TrackLocHistory like "%' + objSearch + '%" or ';
        search = search + 'tblfeedback.Notificaton like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.email like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.phone like "%' + objSearch + '%") ';
    }

    var query = "Select tblfeedback.*,CONVERT_TZ(tblfeedback.CreatedDate,'+00:00','" + CurrentOffset + "') as DisplayCreatedDate, tbluserinformation.phone,tbluserinformation.email from tblfeedback " +
        " Left join tbluserinformation on tbluserinformation.id = tblfeedback.IdUser " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    console.log(query)
    var Countqry = "Select count(tblfeedback.Id) as TotalRecord  from tblfeedback " +
        " Left join tbluserinformation on tbluserinformation.id = tblfeedback.IdUser " + search;
    connection.query(query, function(err, response) {
        if (response != undefined) {
            connection.query(Countqry, function(err, lstCount, fields) {
                var response1 = new Object();
                response1.draw = objParam.draw;
                response1.recordsTotal = lstCount[0].TotalRecord;
                response1.recordsFiltered = lstCount[0].TotalRecord;
                response1.data = response;
                res.json(response1);
            });
        } else {
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = 0;
            response1.recordsFiltered = 0;
            response1.data = [];
            res.json(response1);
        }
    })
})

router.post('/saveUserfeedBack', jsonParser, function(req, res) {
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
                objfeedback.CreatedDate = new Date();
                objfeedback.CreatedBy = UserExist.username;
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