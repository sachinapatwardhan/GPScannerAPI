var router = express.Router();
var User = models.tbluserinformation;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var AgentRetailer = models.tblagentretailer;

router.get('/GetAllSalesAgent', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = '';
    var IsUserSuperAdmin = false;
    var IsCountryAll = false;

    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }

    var UserRoles = objParam.UserRoles;

    if (objSearch != null && objSearch != '') {
        search = 'Where (tbluserinformation.email like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.phone like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.country like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.OTP like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.username like "%' + objSearch + '%" or ';
        search = search + 'tblappinfo.AppName like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.IsMobileVerify like "%' + objSearch + '%") ';
    };
    //  if (objParam.UserId != null && objParam.UserId != undefined && objParam.UserId != '') {
    //      if (search != "") {
    //          search += " and tblgpsdevice.idSalesAgent =" + objParam.UserId;
    //      } else {
    //          search += " Where tblgpsdevice.idSalesAgent =" + objParam.UserId;
    //      }
    //  }
    if (objParam.appId != null && objParam.appId != undefined && objParam.appId != '') {
        if (search != "") {
            search += ' and tbluserinformation.idApp = "' + objParam.appId + '"';
        } else {
            search += ' where tbluserinformation.idApp = "' + objParam.appId + '"';
        }
    }
    if (objParam.country != null && objParam.country != undefined && objParam.country != '') {
        if (search != "") {
            search += ' and tbluserinformation.country = "' + objParam.country + '"';
        } else {
            search += ' where tbluserinformation.country = "' + objParam.country + '"';
        }
    }
    if (search != "") {
        search += " and tblrole.RoleName = 'Sales Agent'";
    } else {
        search += " where tblrole.RoleName = 'Sales Agent'";
    }

    var query = "select tbluserinformation.CreatedDate, tblappinfo.AppName,tbluserinformation.id,tbluserinformation.username,tbluserinformation.idApp,tbluserinformation.email,tbluserinformation.phone,tbluserinformation.country,tbluserinformation.OTP,tbluserinformation.IsMobileVerify,CONVERT_TZ(tbluserinformation.LastLogin,'+00:00','" + CurrentOffset + "') as LastLogin, " +
        "(select count(tblvehicle.deviceid) from tblvehicle where iduser = tbluserinformation.id and tblvehicle.IsDelete=0 and tblvehicle.deviceid !='' ) as TotalDevice " +
        "from tbluserinformation left join tblappinfo on tbluserinformation.idApp = tblappinfo.id " +
        " inner join tbluserinrole on tbluserinrole.userId = tbluserinformation.Id " +
        " inner join tblrole on tblrole.Id = tbluserinrole.roleId " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "SELECT count(tbluserinformation.id) as TotalRecord " +
        "from tbluserinformation left join tblappinfo on tbluserinformation.idApp = tblappinfo.id " +
        " inner join tbluserinrole on tbluserinrole.userId = tbluserinformation.Id " +
        " inner join tblrole on tblrole.Id = tbluserinrole.roleId " + search;
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
            console.log(err);
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = 0;
            response1.recordsFiltered = 0;
            response1.data = [];
            res.json(response1);
        }
    })


})

router.get('/GetAllRetailer', function(req, res) {
    User.hasMany(UserInRole, {
        foreignKey: {
            name: 'userId',
            allowNull: false
        }
    });
    UserInRole.belongsTo(Role, {
        foreignKey: {
            name: 'roleId',
            allowNull: false
        }
    });

    User.findAll({
        where: { idApp: req.query.idApp },
        include: [{
            model: UserInRole,
            include: [{
                model: Role,
                where: { RoleName: 'Retailer' }
            }]
        }],
    }).then(function(response) {
        console.log("******************************")
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })

})


router.get('/GetAllAssignRetailer', function(req, res) {
    var query = "Select tblagentretailer.* from tblagentretailer inner join tbluserinformation on tblagentretailer.retailerId =tbluserinformation.Id  where idApp=" + req.query.idApp;
    connection.query(query, function(err, response) {
        res.json(response);
    })
})

router.get('/SaveAssignRetailer', function(req, res) {

    var objAssignRetailer = req.query;
    console.log(objAssignRetailer)
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
                objAssignRetailer.createdDatetime = new Date();
                AgentRetailer.findOne({ where: { agentId: objAssignRetailer.agentId, retailerId: objAssignRetailer.retailerId } }).then(function(AgentretailerExist) {
                    if (!AgentretailerExist) {
                        AgentRetailer.create(objAssignRetailer).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('Save SIM', UserExist.username, 'Cerate New SIM Data');
                                res.json({ success: true, message: "Agent Retailer created successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "Agent Retailer not created...", data: response });
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Agent Retailer is already Exist...", });
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

router.get('/removeAssignRetailer', function(req, res) {

    var objAssignRetailer = req.query;
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
                AgentRetailer.destroy({ where: { agentId: objAssignRetailer.agentId, retailerId: objAssignRetailer.retailerId } }).then(function(response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('Delete  retailer', UserExist.username, 'Delete  retailer');
                        res.json({ success: true, message: "Agent Retailer removed successfully...", data: response });
                    } else {
                        res.json({ success: false, message: "Agent Retailer not remove...", data: response });
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