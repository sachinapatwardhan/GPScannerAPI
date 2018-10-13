var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var DeviceRenewPrice = models.tbldevicerenewprice;
//End of Tables



router.get('/GetAllAgentDevicePrice', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != null && objSearch != '') {
        search = ' Where (tu.username like "%' + objSearch + '%" or ';
        search = search + 'tu.email like "%' + objSearch + '%" or ';
        search = search + 'ta.AppName like "%' + objSearch + '%" or ';
        search = search + 'tdp.Type like "%' + objSearch + '%" or ';
        search = search + 'tdp.Price like "%' + objSearch + '%") ';
    };
    if (objParam.idApp != undefined && objParam.idApp != null && objParam.idApp != '') {
        if (search == '') {
            search = " where tu.idApp=" + objParam.idApp;
        } else {
            search = " and tu.idApp=" + objParam.idApp;
        }
    }

    var query = "SELECT tdp.*,ta.id as idApp,tu.username,tu.email,ta.AppName,CONVERT_TZ(tdp.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate " +
        " FROM tbldevicerenewprice as tdp " +
        " INNER JOIN tbluserinformation as tu ON tu.id = tdp.IdUser " +
        " INNER JOIN tblappinfo ta on ta.id = tu.idApp  " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var countquery = "SELECT count(*) as TotalRecord " +
        " FROM tbldevicerenewprice as tdp " +
        " INNER JOIN tbluserinformation as tu ON tu.id = tdp.IdUser " +
        " INNER JOIN tblappinfo ta on ta.id = tu.idApp  " + search;
    connection.query(query, function(err, response) {
        if (response != undefined) {
            connection.query(countquery, function(err, lstCount, fields) {
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


router.post('/SaveDevcieRenewPrice', jsonParser, function(req, res) {
    objdata = req.body;
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
                if (objdata.Id == 0) {
                    objdata.CreatedDate = new Date();
                    objdata.CreatedBy = UserExist.username;

                    DeviceRenewPrice.findOrCreate({ where: { IdUser: objdata.IdUser, Type: objdata.Type }, defaults: objdata }).then(function(response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('Agent Device Type Price Created', UserExist.username, 'Agent Device Type Price Created');
                            res.json({ success: true, message: "Agent device type price created successfully...", data: response });
                        } else {
                            res.json({ success: false, message: "Agent device type price is already Exist...", data: response });
                        }
                    })
                } else {
                    DeviceRenewPrice.findOne({ where: { IdUser: objdata.IdUser, Type: objdata.Type }, defaults: objdata }).then(function(objExist) {
                        if (objExist != null && objdata.Id != objExist.Id) {
                            res.json({ success: false, message: "Agent device type price is already Exist...", data: objExist });
                        } else {
                            DeviceRenewPrice.update(objdata, { where: { Id: objdata.Id } }).then(function(response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('Update Agent device type price ', UserExist.username, 'Update Agent device type price  Data');
                                    res.json({ success: true, message: "Agent device type price  updated successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Agent device type price  not updated successfully...", data: response });
                                }
                            })
                        }
                    })
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})



router.get('/DeleteDevicePrice', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    if (token) {
        var decoded = jwt.decode(token, TokenKey);


        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (req.query.Id != '' && req.query.Id != null) {

                    DeviceRenewPrice.destroy({
                        where: {
                            Id: req.query.Id
                        }
                    }).then(function(response) {
                        if (response) {
                            funAuditLog.CreateAuditLog('Delete Agent Device Type Price', UserExist.username, 'Delete Agent Device Type Price');
                            res.json({
                                success: true,
                                message: "Agent Device Type Price deleted successfully...",
                                data: response
                            });
                        } else {
                            res.json(RecordNotFound);
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: "Select Agent Device Type Price To delete",
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }

});


module.exports = router