//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Enquiry = models.tblinquirymgmt;
var EnquiryLog = models.tblinquirylog;
var SystemEmail = models.tblemailsettingsys;
var EmailTemplate = models.tblemailtemplate;
//End of Tables

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};

function convertdateformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    if (flg == 1) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "23:59:59";

    } else {
        return ("0000" + firstdayDay.toString()).slice(-2) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayYear.toString()).slice(-4) + " " + "00:00:00";
    }
}

router.get('/GetAllEnquiry', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objEnquiry = objParam.order;
    var objSearch = objParam.search;
    var objSearch = objParam.search.value;
    var Orderby = 'CreatedOn desc';
    //var Orderby = objColumns[parseInt(objEnquiry[0].column)].data + ' ' + objEnquiry[0].dir;
    //var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;

    var search = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];
        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                
                if (columnName == 'Detail') {
                    var obj = new Object();
                    obj['Name'] = {
                        $like: '%' + objSearch + '%'
                    }
                    search['$or'].push(obj);

                    var obj = new Object();
                    obj['EmailId'] = {
                        $like: '%' + objSearch + '%'
                    }
                    search['$or'].push(obj);

                    var obj = new Object();
                    obj['Phone'] = {
                        $like: '%' + objSearch + '%'
                    }
                    search['$or'].push(obj);

                } else {


                    var obj = new Object();
                    obj[columnName] = {
                        $like: '%' + objSearch + '%'
                    }
                    search['$or'].push(obj);
                }

            };
        };
    }

    var StartDate = objParam.StartDate;
    var EndDate = objParam.EndDate;
    search['$and'] = [];

    if (StartDate != '' && EndDate != '') {
        StartDate = convertdateformat(StartDate, 0);
        EndDate = convertdateformat(EndDate, 1);

        var obj = new Object();
        obj['CreatedOn'] = {
            $between: [StartDate, EndDate]
        };
        search['$and'].push(obj);
    } else if (StartDate != null && StartDate != '') {
        StartDate = convertdateformat(StartDate, 0);
        var obj = new Object();
        obj['CreatedOn'] = {
            $gt: StartDate
        };
        search['$and'].push(obj);
    } else if (EndDate != null && EndDate != '') {
        EndDate = convertdateformat(EndDate, 1);
        console.log(EndDate);
        var obj = new Object();
        obj['CreatedOn'] = {
            $lt: EndDate
        };
        search['$and'].push(obj);
    }

    var offset = (req.query.PageNo * 10) - 10;
    Enquiry.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
    }).then(function(response) {
        console.log(response)
            // res.json({ success: true, response: response });
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function(error) {
        res.json({
            success: false,
            response: error
        });
    })
})

router.post('/SaveEnquiry', jsonParser, function(req, res) {
    // objHeader = req.headers;

    // var token = getToken(objHeader);
    // if (token) {
    //     var decoded = jwt.decode(token, TokenKey);
    //     User.findOne({
    //         where: {
    //             username: decoded.username,
    //             password: decoded.password
    //         }
    //     }).then(function (UserExist) {
    //         if (UserExist != null) {
    objEnquiry = req.body;
    Enquiry.create(objEnquiry).then(function(response) {
            if (response != null) {
                SystemEmail.findOne().then(function(objSystemEmail) {
                    if (objSystemEmail != null) {
                        EmailTemplate.findOne({
                            where: {
                                Type: "Enquiry Email",
                            }
                        }).then(function(objEmailTemplate) {
                            if (objEmailTemplate != null) {
                                var EnquiryDetail = "Name: " + objEnquiry.Name + "<br/><br/>" + "Email: " + objEnquiry.EmailId + "<br/><br/>" + "Subject: " + objEnquiry.Subject + "<br/><br/>" + "Message: " + objEnquiry.Message + "<br/><br/>"

                                var body = objEmailTemplate.EmailBody.replace(/{EnquiryDetail}/g, EnquiryDetail);
                                var mail = {
                                    from: objEnquiry.EmailId,
                                    to: objSystemEmail.NotificationEmailTo,
                                    subject: objEmailTemplate.EmailSubject,
                                    html: body
                                };
                                transporter.sendMail(mail, function(error, response) {
                                    if (error) {
                                        res.json(error);
                                    } else {
                                        res.json({
                                            success: true,
                                            message: "Enquiry sent successfully...",
                                            data: response
                                        });
                                    }
                                });
                            } else {
                                res.json({
                                    success: false,
                                    message: "This Email template not found..."
                                })
                            }
                        });
                    } else {
                        res.json({
                            success: false,
                            message: "This system Email not found..."
                        });
                    }
                }).catch(function(error) {
                    res.json({
                        success: false,
                        message: error.errors[0].message + "..."
                    });
                })
            } else {
                res.json({
                    success: false,
                    message: "Enquiry Email Not sent Please Try Again..."
                });
            }
        })
        //         }
        //         else {
        //             res.json(InvalidToken);
        //         }
        //     })
        // } else {
        //     res.json(InvalidToken);
        // }
});


router.get('/UpdateEnquiryStatus', jsonParser, function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    //set Parameter
    req.query['permission'] = "Modified";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({
                    where: {
                        username: decoded.username,
                        password: decoded.password
                    }
                }).then(function(UserExist) {
                    if (UserExist != null) {
                        Enquiry.findOne({
                            where: {
                                id: req.query.idEnquiry
                            }
                        }).then(function(objEnquiry) {
                            if (objEnquiry != null) {
                                objEnquiry.updateAttributes({
                                    Status: req.query.idEnquiryStatus
                                }).then(function(response) {
                                    res.json({
                                        success: true,
                                        message: "Enquiry status updated successfully..."
                                    });
                                })
                            } else {
                                res.json({
                                    success: false,
                                    message: "Enquiry not Found..."
                                });
                            }
                        })
                    } else {
                        res.json(InvalidToken);
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        } else {
            res.json(NoAccessPermission);
        }
    });
});

router.get('/DeleteEnquiry', jsonParser, function(req, res) {
    objTracking = req.body;
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
                EnquiryLog.findOne({
                    where: {
                        EnquiryId: req.query.idEnquiry
                    }
                }).then(function(resEnquiryLog) {
                    if (resEnquiryLog == null) {
                        Enquiry.destroy({
                            where: {
                                id: req.query.idEnquiry
                            }
                        }).then(function(response) {
                            if (response) {
                                res.json({
                                    success: true,
                                    message: "Enquiry deleted successfully...",
                                    data: response
                                });
                            } else {
                                res.json({
                                    success: false,
                                    message: "Requested Record not Exist....",
                                    data: response
                                });
                            }
                        })
                    } else {
                        res.json(NotDeleteReferenceData);
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.post('/ReplyEnquiryEmail', jsonParser, function(req, res) {
    objEmail = req.body;
    objHeader = req.headers;
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    //set Parameter
    req.query['permission'] = "Modified";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
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
                        SystemEmail.findOne().then(function(objSystemEmail) {
                            var mail = {
                                from: objSystemEmail.DefaultEmailFrom,
                                to: objEmail.EmailTo, // + ', ' + objSystemEmail.NotificationEmailTo,
                                subject: objEmail.EmailSubject,
                                //text: 'hello ' + objUser.username + ' ' + 'Your New Password is ' + NewPassword,
                                html: objEmail.EmailBody
                            };
                            transporter.sendMail(mail, function(error, response) {
                                if (error) {
                                    res.json(error);
                                } else {
                                    var objEnquiryLog = {
                                        EnquiryId: objEmail.id,
                                        Subject: objEmail.EmailSubject,
                                        Body: objEmail.EmailBody,
                                        CreatedBy: objEmail.CreatedBy,
                                        CreatedDate: objEmail.CreatedDate,
                                    }
                                    EnquiryLog.create(objEnquiryLog).then(function(response) {
                                        Enquiry.findOne({
                                            where: {
                                                id: objEmail.id
                                            }
                                        }).then(function(objEnquiry) {
                                            if (objEnquiry != null) {
                                                if (objEmail.Status == 0) {
                                                    objEnquiry.updateAttributes({
                                                        Status: 1
                                                    }).then(function(response) {
                                                        res.json({
                                                            success: true,
                                                            message: "Email sent successfully..."
                                                        });
                                                    })
                                                } else {
                                                    res.json({
                                                        success: true,
                                                        message: "Email sent successfully..."
                                                    });
                                                }
                                            } else {
                                                res.json({
                                                    success: false,
                                                    message: "Enquiry not Found..."
                                                });
                                            }
                                        })
                                    })
                                }
                            });
                        })
                    } else {
                        res.json(InvalidToken);
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        } else {
            res.json(NoAccessPermission);
        }
    });

});

//Enquiry Log
router.get('/GetAllEnquiryLogByEnquiryId', function(req, res) {
        EnquiryLog.findAll({
            where: {
                EnquiryId: req.query.idEnquiry
            }
        }).then(function(response) {
            if (response != null) {
                res.json({
                    success: true,
                    message: "Record found...",
                    data: response
                });
            } else {
                res.json({
                    success: false,
                    message: "Record not found...",
                    data: response
                });
            }
        })
    })
    //End of Enquiry Log

module.exports = router
