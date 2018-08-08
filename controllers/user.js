//Tables
var router = express.Router();
var User = models.tbluserinformation;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var Pet = models.tblpet;
var Vehicle = models.tblvehicle;
var Country = models.tblcountrymgmt;
var State = models.tblcountrystatemgmt;
var AppInfo = models.tblappinfo;
var SharedDevice = models.tblsharedevice;
var GpsDeleteCash = models.tblgpsdeletecash;
var Commonfunction = require('./common.js');
//End of Tables

router.get('/GetAllUser', function(req, res) {
    var search = {};
    User.hasMany(UserInRole, {
        foreignKey: {
            name: 'userId',
            allowNull: false
        }
    });
    if (req.query.appId != null && req.query.appId != '' && req.query.appId != undefined) {
        search['$and'] = [];
        var obj = new Object();
        obj['idApp'] = {
            $eq: req.query.appId
        };
        search['$and'].push(obj);
    }
    UserInRole.belongsTo(Role, {
        foreignKey: {
            name: 'roleId',
            allowNull: false
        }
    });
    User.findAll({
        include: [{
            model: UserInRole,
            include: [
                Role
            ]
        }],
        where: search,
        order: 'createddate'
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllUserNew', function(req, res) {
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
        where: {
            idApp: req.query.idApp,
        },
        include: [{
            model: UserInRole,
            include: [
                Role
            ]
        }],
        order: 'createddate',

    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllUserBySalesRole', function(req, res) {
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
        include: [{
            model: UserInRole,
            include: [{
                model: Role,
                where: { RoleName: 'Sales Agent' }
            }]
        }],
        order: 'createddate'
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetFirstUserSequelize', function(req, res) {
    User.findOne().then(function(response) {
        var obj = new Object();
        obj.status = true;
        obj.data = response;
        res.json(obj);
    }).catch(function(error) {
        var obj = new Object();
        obj.status = false;
        obj.data = error;
        res.json(obj);
    })
})

router.get('/GetAllDynamicUser', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};
    var search1 = {};

    if (objSearch != null && objSearch != '') {
        search['$or'] = [];

        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;

                if (columnName != 'createddate') {
                    search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                }

            };
        };
    }
    if (objParam.appId != null && objParam.appId != '' && objParam.appId != undefined) {
        search['$and'] = [];
        var obj = new Object();
        obj['idApp'] = {
            $eq: objParam.appId
        };
        search['$and'].push(obj);
    }

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


    User.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
        include: [{
            model: UserInRole,
            include: [
                Role
            ]
        }]
    }).then(function(response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function(error) {
        res.json(error);
    })
})


router.get('/GetAllDynamicUserNew', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != null && objSearch != '') {
        search = ' Where (tbluserinformation.username like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.email  like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.phone  like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.country  like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.AppVersion  like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.Platform  like "%' + objSearch + '%" or ';
        search = search + 'tblappinfo.AppName  like "%' + objSearch + '%" or ';
        search = search + 'tblrole.RoleName  like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.IsMobileVerify like "%' + objSearch + '%") ';
    }
    if (objParam.appId != null && objParam.appId != '' && objParam.appId != undefined) {
        if (search == '') {
            search = " where tbluserinformation.idApp=" + objParam.appId;
        } else {
            search = " and tbluserinformation.idApp=" + objParam.appId;
        }
    }
    var query = "select tblappinfo.AppName,GROUP_CONCAT(tblrole.RoleName) as Role ,tbluserinformation.*,CONVERT_TZ(tbluserinformation.LastLogin,'+00:00','" + CurrentOffset + "') as LastLoginDate from tbluserinformation " +
        "left join tbluserinrole on tbluserinformation.id = tbluserinrole.userId " +
        "left join tblrole on tbluserinrole.roleId  = tblrole.id " +
        "left join tblappinfo on tblappinfo.id = tbluserinformation.idApp " + search +
        "group by tbluserinformation.id " +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    // console.log(query)
    var countquery = "select tbluserinformation.id from tbluserinformation " +
        "left join tbluserinrole on tbluserinformation.id = tbluserinrole.userId " +
        "left join tblrole on tbluserinrole.roleId  = tblrole.id " +
        "left join tblappinfo on tblappinfo.id = tbluserinformation.idApp " + search +
        "group by tbluserinformation.id ";
    connection.query(query, function(err, response) {
        if (response != undefined) {
            connection.query(countquery, function(err, lstCount, fields) {
                // console.log("************", lstCount.length)
                var response1 = new Object();
                response1.draw = objParam.draw;
                response1.recordsTotal = lstCount.length;
                response1.recordsFiltered = lstCount.length;
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

router.get('/GetAllDynamicUserOld', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;


    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    if (objOrder[0].column == 5) {
        Orderby = 'tblrole.' + Orderby;
    } else if (objOrder[0].column == 6) {
        Orderby = 'tblappinfo.' + Orderby;
    } else {
        Orderby = 'tbluserinformation.' + Orderby;
    }
    var search = '';


    if (objSearch != null && objSearch != '') {

        search = 'Where (tbluserinformation.username like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.email like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.phone like "%' + objSearch + '%" or ';
        search = search + 'tblrole.RoleName like "%' + objSearch + '%" or ';
        search = search + 'tblappinfo.AppName like "%' + objSearch + '%") ';
    }

    if (search != "") {
        search += ' and tbluserinformation.idApp = ' + objParam.appId;
    } else {
        search += ' where tbluserinformation.idApp = ' + objParam.appId;
    }

    var query = "Select tbluserinrole.*,tbluserinformation.id,tbluserinformation.phone,tbluserinformation.image,tbluserinformation.username,tbluserinformation.email,tbluserinformation.phone,tblrole.RoleName,tblappinfo.AppName" +
        " from tbluserinformation " +
        " Left join tbluserinrole on tbluserinformation.id = tbluserinrole.userId" +
        " Left join tblrole on tbluserinrole.roleId = tblrole.id " +
        " left join tblappinfo on tbluserinformation.idApp = tblappinfo.id" + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "SELECT count(tbluserinformation.id) as TotalRecord " +
        " from tbluserinformation " +
        " Left join tbluserinrole on tbluserinformation.id = tbluserinrole.userId" +
        " Left join tblrole on tbluserinrole.roleId = tblrole.id " +
        " left join tblappinfo on tbluserinformation.idApp = tblappinfo.id " + search;
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

router.get('/GetAllDynamicCustomer', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search.value;

    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }
    var UserRoles = objParam.UserRoles;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};
    var search1 = {};

    search1['$and'] = [];

    var IsUserSuperAdmin = false;
    var IsCountryAll = false;

    if (UserRoles.length > 0) {

        function CheckUserCountry(i) {
            if (i < UserRoles.length) {

                if (UserRoles[i] == 'Super Admin') {
                    IsUserSuperAdmin = true;
                    CheckUserCountry(i + 1);
                } else {
                    CheckUserCountry(i + 1);
                }

            } else {
                if (!IsUserSuperAdmin) {
                    search['$or'] = [];
                } else {
                    search['$and'] = [];
                }

                if (objSearch != null && objSearch != '') {
                    search1['$or'] = [];

                    for (var i = 0; i < objColumns.length; i++) {
                        if (objColumns[i].data != null && objColumns[i].data != '') {
                            var columnName = objColumns[i].data;
                            if (columnName != 'CreatedDate') {
                                search1['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                            }
                        };
                    };
                }
                if (!IsUserSuperAdmin) {
                    search['$or'] = [];
                    if (CountryList.length > 0) {
                        function CheckCountry(p) {
                            if (p < CountryList.length) {
                                var obj = new Object();
                                if (CountryList[p] != "") {

                                    obj['country'] = {
                                        $like: '%' + CountryList[p] + '%'
                                    }
                                    search['$or'].push(obj);

                                    if (CountryList[p] == "All") {
                                        IsCountryAll = true;
                                    }
                                }
                                CheckCountry(p + 1);
                            }
                        }
                        CheckCountry(0);
                    }
                }

                if (IsCountryAll) {
                    search = {};
                } else {
                    search1['$and'].push(search)
                }

                User.hasMany(Pet, {
                    foreignKey: {
                        name: 'iduser',
                        allowNull: false
                    }
                });

                User.findAndCountAll({
                    required: true,
                    where: search1,
                    order: Orderby,
                    offset: parseInt(objParam.start),
                    limit: parseInt(objParam.length),
                    include: [{
                        model: Pet,
                        attributes: [
                            [('DISTINCT', models.sequelize.col('iduser')), 'iduser']
                        ],
                        where: {
                            IsDeleted: 0,
                            deviceid: {
                                $ne: ''
                            }
                        },
                    }],
                }).then(function(response) {
                    var response1 = new Object();
                    response1.draw = objParam.draw;
                    response1.recordsTotal = response.count;
                    response1.recordsFiltered = response.count;
                    response1.data = response.rows;
                    res.json(response1);
                }).catch(function(error) {
                    res.json(error);
                })
            }
        }
        CheckUserCountry(0)
    }
})

router.get('/GetAllDynamicUserbyCountry', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search.value;
    var UserCountry = objParam.UserCountry;
    var Type = objParam.Type;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }
    var UserRoles = objParam.UserRoles;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};
    var search1 = {};
    var search2 = {};
    var search3 = {};
    //var search2 = {};

    search1['$and'] = [];
    //search1['$or'] = [];
    var IsUserSuperAdmin = false;
    var IsCountryAll = false;


    if (UserRoles.length > 0) {

        function CheckUserCountry(i) {
            if (i < UserRoles.length) {

                if (UserRoles[i] == 'Super Admin') {
                    IsUserSuperAdmin = true;
                    CheckUserCountry(i + 1);
                } else {
                    CheckUserCountry(i + 1);
                }

            } else {
                if (!IsUserSuperAdmin) {
                    search['$or'] = [];
                } else {
                    search['$and'] = [];
                }
                if (objSearch != null && objSearch != '') {
                    search2['$or'] = [];

                    for (var i = 0; i < objColumns.length; i++) {
                        if (objColumns[i].data != null && objColumns[i].data != '') {
                            var columnName = objColumns[i].data;

                            if (columnName != 'createddate') {
                                search2['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                            }
                        };
                    };
                    search1['$and'].push(search2);
                }
                if (Type != null && Type != '') {
                    search3['$or'] = [];

                    for (var i = 0; i < Type.length; i++) {
                        if (Type[i] != null && Type[i] != '') {
                            var TypeName = Type[i];
                            var obj = new Object();
                            if (TypeName != '') {
                                obj['Type'] = {
                                    $eq: TypeName
                                }
                                search3['$or'].push(obj);
                            }
                        };
                    };
                    //console.log("search3",search3['$or'])
                    search1['$and'].push(search3);
                }
                if (!IsUserSuperAdmin) {
                    search['$or'] = [];
                    if (CountryList.length > 0) {
                        function CheckCountry(p) {
                            if (p < CountryList.length) {
                                var obj = new Object();
                                if (CountryList[p] != "") {

                                    obj['country'] = {
                                        $like: '%' + CountryList[p] + '%'
                                    }
                                    search['$or'].push(obj);

                                    if (CountryList[p] == "All") {
                                        IsCountryAll = true;
                                    }
                                }
                                CheckCountry(p + 1);
                            }
                        }
                        CheckCountry(0);
                    }
                }


                if (IsCountryAll) {
                    search = {};
                } else {
                    search1['$and'].push(search)
                }

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
                User.findAndCountAll({
                    where: search1,
                    order: Orderby,
                    offset: parseInt(objParam.start),
                    limit: parseInt(objParam.length),
                    include: [{
                        model: UserInRole,
                        include: [
                            Role
                        ]
                    }]
                }).then(function(response) {
                    var response1 = new Object();
                    response1.draw = objParam.draw;
                    response1.recordsTotal = response.count;
                    response1.recordsFiltered = response.count;
                    response1.data = response.rows;
                    res.json(response1);
                }).catch(function(error) {
                    res.json(error);
                })
            }
        }
        CheckUserCountry(0)
    }
})

router.get('/GetUserByName', function(req, res) {

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
        where: {
            username: {
                $like: '%' + req.query.UserName + '%'
            },
            idApp: req.query.appId,
        },
        include: [{
            model: UserInRole,
            include: [
                Role
            ]
        }],
        order: 'username',
        limit: 10
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetUserByEmail', function(req, res) {

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
        where: {
            email: {
                $like: '%' + req.query.email + '%'
            },
            idApp: req.query.appId,
        },
        include: [{
            model: UserInRole,
            include: [
                Role
            ]
        }],
        order: 'email',
        limit: 10
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetUserById', function(req, res) {
    User.findOne({
        where: {
            id: req.query.idUser
        }
    }).then(function(response) {
        if (response != null) {
            if (req.query.OTP) {
                response.updateAttributes({ OTP: req.query.OTP }).then(function(resUpdate) {
                    response.OTP = req.query.OTP;
                    res.json({
                        success: true,
                        message: "Record found...",
                        data: response
                    });
                })
            } else {
                res.json({
                    success: true,
                    message: "Record found...",
                    data: response
                });
            };

        } else {
            res.json({
                success: false,
                message: "Record not found...",
                data: response
            });
        }
    })
})


var https = require('https');
router.get('/GetSupportUserById', function(req, res) {
    //set Parameter
    req.query['permission'] = "Modified";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {


            User.findOne({
                where: {
                    id: req.query.idUser
                }
            }).then(function(response) {
                if (response != null) {
                    if (req.query.OTP) {
                        response.updateAttributes({ OTP: req.query.OTP }).then(function(resUpdate) {
                            response.OTP = req.query.OTP;
                            var data = JSON.stringify({
                                api_key: 'a692ce5b',
                                api_secret: '928903ee92ecd3e4',
                                text: 'Your One Time Password(OTP) is ' + req.query.OTP,
                                to: resUpdate.phone,
                                from: 'Pettorway'

                            });

                            var options = {
                                host: 'rest.nexmo.com',
                                path: '/sms/json',
                                port: 443,
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Content-Length': Buffer.byteLength(data)
                                }
                            };

                            var req1 = https.request(options);

                            req1.write(data);
                            req1.end();

                            var responseData = '';
                            req1.on('response', function(res1) {
                                res1.on('data', function(chunk) {
                                    responseData += chunk;
                                });

                                res1.on('end', function() {
                                    res.json({
                                        success: true,
                                        message: "Record found...",
                                        data: JSON.parse(responseData)
                                    });
                                });
                            });
                        })
                    } else {
                        res.json({
                            success: false,
                            message: "Record found...",
                            data: response
                        });
                    };

                } else {
                    res.json({
                        success: false,
                        message: "Record not found...",
                        data: response
                    });
                }
            })
        } else {
            res.json(NoAccessPermission);
        }
    });
})

router.get('/SendOTPById', function(req, res) {

    User.findOne({
        where: {
            id: req.query.idUser
        }
    }).then(function(response) {
        if (response != null) {

            // response.updateAttributes({ OTP: req.query.OTP }).then(function(resUpdate) {
            //     response.OTP = req.query.OTP;
            //     res.json({
            //         success: true,
            //         message: "Record found...",
            //         data: response
            //     });
            // })

            var data = JSON.stringify({
                api_key: 'a692ce5b',
                api_secret: '928903ee92ecd3e4',
                text: 'Your One Time Password(OTP) is ' + req.query.OTP,
                to: response.phone,
                from: 'Pettorway'

            });

            var options = {
                host: 'rest.nexmo.com',
                path: '/sms/json',
                port: 443,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            var req1 = https.request(options);

            req1.write(data);
            req1.end();

            var responseData = '';
            req1.on('response', function(res1) {
                res1.on('data', function(chunk) {
                    responseData += chunk;
                });

                res1.on('end', function() {
                    res.json({
                        success: true,
                        message: "Record found...",
                        data: JSON.parse(responseData)
                    });
                });
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

router.get('/GetUserByOTP', function(req, res) {

    User.findOne({
        where: {
            id: req.query.idUser,
            OTP: req.query.OTP,
        }
    }).then(function(response) {
        if (response != null) {

            response.updateAttributes({ IsMobileVerify: true }).then(function(resUpdate) {

                UserInRole.belongsTo(Role, {
                    foreignKey: {
                        name: 'roleId',
                        allowNull: false
                    }
                });
                UserInRole.findAll({
                    where: {
                        userId: response.id
                    },
                    include: [{
                        model: Role,
                        attributes: ['id', 'RoleName']
                    }]
                }).then(function(resUserInRole) {
                    var lstRole = [];
                    for (var i = 0; i < resUserInRole.length; i++) {
                        var objRole = resUserInRole[i].tblrole.RoleName;
                        lstRole.push(objRole);
                    }

                    var user = {
                        username: response.username,
                        password: response.password,
                        Role: lstRole
                    }
                    var token = jwt.encode(user, "bugz");
                    var Usertoken = 'JWT ' + token;

                    res.json({
                        success: true,
                        message: "Record found...",
                        data: response,
                        token: Usertoken
                    });
                })
            })


        } else {
            res.json({
                success: false,
                message: "Record not found...",
                data: response
            });
        }
    })
})

router.get('/GetUserProfile', function(req, res) {
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

    User.findOne({
        where: {
            username: req.query.username,
        },
        include: [{
            model: UserInRole,
            include: [Role]
        }]
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

router.get('/GetUserProfileNew', function(req, res) {
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

    User.findOne({
        where: {
            id: req.query.UserId,
        },
        include: [{
            model: UserInRole,
            include: [Role]
        }]
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

router.post('/SaveUser', jsonParser, function(req, res) {
    objUser = req.body;
    objHeader = req.headers;
    //  console.log(objUser);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

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
                //  console.log("UserExist")
                if (objUser.id != 0) {
                    //  console.log("id not 0");
                    //set Parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            User.findOne({
                                where: {
                                    username: objUser.username
                                },
                                defaults: objUser
                            }).then(function(objUserExist) {
                                if (objUserExist != null && objUser.id != objUserExist.id) {
                                    res.json({
                                        success: false,
                                        message: "User is already Exist...",
                                        data: objUserExist
                                    });
                                } else {
                                    if (objUser.phone && objUser.phone != '') {
                                        User.findOne({
                                            where: {
                                                // email: objUserReg.email
                                                $or: [{ email: objUser.email }, { phone: objUser.phone }],
                                                $and: [{
                                                    id: { $ne: objUser.id }
                                                }]

                                            }
                                        }).then(function(chkEmailExist) {
                                            if (chkEmailExist != null) {
                                                if (objUser.phone == chkEmailExist.phone) {
                                                    res.json({
                                                        success: false,
                                                        message: "Phone is already Exist..."
                                                    });
                                                } else {
                                                    res.json({
                                                        success: false,
                                                        message: "Email is already Exist..."
                                                    });
                                                }
                                            } else {
                                                User.update(objUser, {
                                                    where: {
                                                        id: objUser.id
                                                    }
                                                }).then(function(responseUser) {
                                                    UserInRole.destroy({
                                                        where: {
                                                            userId: objUser.id
                                                        }
                                                    }).then(function(response) {
                                                        if (objUser.roleId.length > 0) {
                                                            function uploader(i) {
                                                                if (i < objUser.roleId.length) {
                                                                    var objUserInRole = {
                                                                        userId: objUser.id,
                                                                        roleId: objUser.roleId[i].id
                                                                    }

                                                                    UserInRole.create(objUserInRole).then(function(response) {
                                                                        if (objUser.roleId.length == (i + 1)) {
                                                                            updateUserRedisValue(objUser.id);
                                                                            funAuditLog.CreateAuditLog('SaveUser', UserExist.username, 'Update User');
                                                                            res.json({
                                                                                success: true,
                                                                                message: "User updated successfully...",
                                                                                data: response
                                                                            });
                                                                        } else {
                                                                            uploader(i + 1);
                                                                        }
                                                                    })

                                                                }
                                                            }
                                                            uploader(0);
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Please Select atleast One Role..."
                                                            });
                                                        }
                                                    })
                                                })
                                            }

                                        });
                                    } else {
                                        User.findOne({
                                            where: {
                                                // email: objUserReg.email
                                                $or: [{ email: objUser.email }],
                                                $and: [{
                                                    id: { $ne: objUser.id }
                                                }]

                                            }
                                        }).then(function(chkEmailExist) {
                                            if (chkEmailExist != null) {
                                                // if (objUser.phone == chkEmailExist.phone) {
                                                //     res.json({
                                                //         success: false,
                                                //         message: "Phone is already Exist..."
                                                //     });
                                                // } else {
                                                res.json({
                                                    success: false,
                                                    message: "Email is already Exist..."
                                                });
                                                //}
                                            } else {
                                                User.update(objUser, {
                                                    where: {
                                                        id: objUser.id
                                                    }
                                                }).then(function(responseUser) {
                                                    UserInRole.destroy({
                                                        where: {
                                                            userId: objUser.id
                                                        }
                                                    }).then(function(response) {
                                                        if (objUser.roleId.length > 0) {
                                                            function uploader(i) {
                                                                if (i < objUser.roleId.length) {
                                                                    var objUserInRole = {
                                                                        userId: objUser.id,
                                                                        roleId: objUser.roleId[i].id
                                                                    }
                                                                    UserInRole.create(objUserInRole).then(function(response) {
                                                                        if (objUser.roleId.length == (i + 1)) {
                                                                            funAuditLog.CreateAuditLog('SaveUser', UserExist.username, 'Update User');
                                                                            updateUserRedisValue(objUser.id);
                                                                            res.json({
                                                                                success: true,
                                                                                message: "User updated successfully...",
                                                                                data: response
                                                                            });
                                                                        } else {
                                                                            uploader(i + 1);
                                                                        }
                                                                    })

                                                                }
                                                            }
                                                            uploader(0);
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Please Select atleast One Role..."
                                                            });
                                                        }
                                                    })
                                                })
                                            }

                                        });
                                    }
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {
                    //  console.log("id 0");

                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            User.findOne({
                                where: {
                                    username: objUser.username
                                },
                                defaults: objUser
                            }).then(function(objUserExist) {
                                if (objUserExist != null && objUser.id != objUserExist.id) {
                                    res.json({
                                        success: false,
                                        message: "User is already Exist...",
                                        data: objUserExist
                                    });
                                } else {

                                    var UserPassword = customPassword();
                                    var EncryptUserpassword = jwt.encode(UserPassword, "bugz");

                                    if (objUser.phone && objUser.phone != '') {
                                        User.findOne({
                                            where: {
                                                // email: objUserReg.email
                                                $or: [{ email: objUser.email }, { phone: objUser.phone }]
                                            }
                                        }).then(function(chkEmailExist) {
                                            if (chkEmailExist != null) {
                                                if (objUser.phone == chkEmailExist.phone) {
                                                    res.json({
                                                        success: false,
                                                        message: "Phone is already Exist...",
                                                        data: chkEmailExist

                                                    });
                                                } else {
                                                    res.json({
                                                        success: false,
                                                        message: "Email is already Exist...",
                                                        data: chkEmailExist

                                                    });
                                                }
                                            } else {
                                                User.findOrCreate({
                                                    where: {
                                                        username: objUser.username,
                                                        password: EncryptUserpassword
                                                    },
                                                    defaults: objUser
                                                }).then(function(responseObjUser) {
                                                    //
                                                    UserInRole.destroy({
                                                        where: {
                                                            userId: responseObjUser[0].id
                                                        }
                                                    }).then(function(response) {
                                                        if (objUser.roleId.length > 0) {
                                                            function uploader(i) {
                                                                if (i < objUser.roleId.length) {
                                                                    var objUserInRole = {
                                                                        userId: responseObjUser[0].id,
                                                                        roleId: objUser.roleId[i].id
                                                                    }
                                                                    UserInRole.create(objUserInRole).then(function(response) {
                                                                        if (objUser.roleId.length == (i + 1)) {
                                                                            funAuditLog.CreateAuditLog('SaveUser', UserExist.username, 'Create User');
                                                                            updateUserRedisValue(responseObjUser[0].id)
                                                                            res.json({
                                                                                success: true,
                                                                                message: "User created successfully...",
                                                                                data: response
                                                                            });
                                                                        } else {
                                                                            uploader(i + 1);
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                            uploader(0);
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Please Select atleast One Role..."
                                                            });
                                                        }
                                                    })

                                                    //
                                                })
                                            }
                                        });

                                    } else {
                                        User.findOne({
                                            where: {
                                                // email: objUserReg.email
                                                $or: [{ email: objUser.email }]
                                            }
                                        }).then(function(chkEmailExist) {
                                            if (chkEmailExist != null) {
                                                // if (objUser.phone == chkEmailExist.phone) {
                                                //     res.json({
                                                //         success: false,
                                                //         message: "Phone is already Exist...",
                                                //         data: chkEmailExist

                                                //     });
                                                // } else {
                                                res.json({
                                                    success: false,
                                                    message: "Email is already Exist...",
                                                    data: chkEmailExist

                                                });
                                                //}
                                            } else {
                                                User.findOrCreate({
                                                    where: {
                                                        username: objUser.username,
                                                        password: EncryptUserpassword
                                                    },
                                                    defaults: objUser
                                                }).then(function(responseObjUser) {
                                                    //
                                                    UserInRole.destroy({
                                                        where: {
                                                            userId: responseObjUser[0].id
                                                        }
                                                    }).then(function(response) {
                                                        if (objUser.roleId.length > 0) {
                                                            function uploader(i) {
                                                                if (i < objUser.roleId.length) {
                                                                    var objUserInRole = {
                                                                        userId: responseObjUser[0].id,
                                                                        roleId: objUser.roleId[i].id
                                                                    }
                                                                    UserInRole.create(objUserInRole).then(function(response) {
                                                                        if (objUser.roleId.length == (i + 1)) {
                                                                            funAuditLog.CreateAuditLog('SaveUser', UserExist.username, 'Create User');
                                                                            updateUserRedisValue(responseObjUser[0].id)
                                                                            res.json({
                                                                                success: true,
                                                                                message: "User created successfully...",
                                                                                data: response
                                                                            });
                                                                        } else {
                                                                            uploader(i + 1);
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                            uploader(0);
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Please Select atleast One Role..."
                                                            });
                                                        }
                                                    })

                                                    //
                                                })
                                            }
                                        });
                                    }
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.post('/SaveUserNew', jsonParser, function(req, res) {
    objUser = req.body;
    objHeader = req.headers;
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

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
                if (objUser.id != 0) {
                    //set Parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            User.findOne({
                                where: {
                                    $or: [{ email: objUser.email }, { phone: objUser.phone }, { username: objUser.username }],
                                    $and: [{
                                        id: { $ne: objUser.id },
                                        idApp: objUser.idApp,
                                    }]
                                }
                            }).then(function(objUserExist) {
                                if (objUserExist != null) {
                                    if (objUserExist.phone == objUser.phone) {
                                        res.json({
                                            success: false,
                                            message: "Phone is already Exist..."
                                        });
                                    } else if (objUserExist.email == objUser.email) {
                                        res.json({
                                            success: false,
                                            message: "Email is already Exist...",
                                            data: objUserExist
                                        });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "UserName is already Exist...",
                                            data: objUserExist
                                        });
                                    }
                                } else {
                                    User.update(objUser, {
                                        where: {
                                            id: objUser.id
                                        }
                                    }).then(function(responseUser) {
                                        UserInRole.destroy({
                                            where: {
                                                userId: objUser.id
                                            }
                                        }).then(function(response) {
                                            if (objUser.roleId.length > 0) {
                                                function uploader(i) {
                                                    if (i < objUser.roleId.length) {
                                                        var objUserInRole = {
                                                            userId: objUser.id,
                                                            roleId: objUser.roleId[i].id
                                                        }

                                                        UserInRole.create(objUserInRole).then(function(response) {
                                                            if (objUser.roleId.length == (i + 1)) {
                                                                funAuditLog.CreateAuditLog('SaveUser', UserExist.username, 'Update User');
                                                                updateUserRedisValue(objUser.id);
                                                                res.json({
                                                                    success: true,
                                                                    message: "User updated successfully...",
                                                                    data: response
                                                                });
                                                            } else {
                                                                uploader(i + 1);
                                                            }
                                                        })

                                                    }
                                                }
                                                uploader(0);
                                            } else {
                                                res.json({
                                                    success: false,
                                                    message: "Please Select atleast One Role..."
                                                });
                                            }
                                        })
                                    })
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {
                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            User.findOne({
                                where: {
                                    $or: [{ email: objUser.email }, { phone: objUser.phone }, { username: objUser.username }],
                                    $and: [{
                                        idApp: objUser.idApp,
                                    }]
                                },
                            }).then(function(objUserExist) {
                                if (objUserExist != null) {
                                    if (objUserExist.phone == objUser.phone) {
                                        res.json({
                                            success: false,
                                            message: "Phone is already Exist..."
                                        });
                                    } else if (objUserExist.email == objUser.email) {
                                        res.json({
                                            success: false,
                                            message: "Email is already Exist...",
                                            data: objUserExist
                                        });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "UserName is already Exist...",
                                            data: objUserExist
                                        });
                                    }
                                } else {
                                    var UserPassword = customPassword();
                                    var EncryptUserpassword = jwt.encode(UserPassword, "bugz");
                                    objUser.password = EncryptUserpassword;
                                    User.findOrCreate({
                                        where: {
                                            username: objUser.username,
                                            password: EncryptUserpassword
                                        },
                                        defaults: objUser
                                    }).then(function(responseObjUser) {
                                        //
                                        UserInRole.destroy({
                                            where: {
                                                userId: responseObjUser[0].id
                                            }
                                        }).then(function(response) {
                                            if (objUser.roleId.length > 0) {
                                                function uploader(i) {
                                                    if (i < objUser.roleId.length) {
                                                        var objUserInRole = {
                                                            userId: responseObjUser[0].id,
                                                            roleId: objUser.roleId[i].id
                                                        }
                                                        UserInRole.create(objUserInRole).then(function(response) {
                                                            if (objUser.roleId.length == (i + 1)) {
                                                                funAuditLog.CreateAuditLog('SaveUser', UserExist.username, 'Create User');
                                                                updateUserRedisValue(responseObjUser[0].id)
                                                                res.json({
                                                                    success: true,
                                                                    message: "User created successfully...",
                                                                    data: response
                                                                });
                                                            } else {
                                                                uploader(i + 1);
                                                            }
                                                        })
                                                    }
                                                }
                                                uploader(0);
                                            } else {
                                                res.json({
                                                    success: false,
                                                    message: "Please Select atleast One Role..."
                                                });
                                            }
                                        })

                                        //
                                    })
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.post('/SaveCustomer', jsonParser, function(req, res) {
    objUser = req.body;
    objHeader = req.headers;
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

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
                if (objUser.id != 0) {
                    //set Parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            User.findOne({
                                where: {
                                    $or: [{ email: objUser.email }, { phone: objUser.phone }, { username: objUser.username }],
                                    $and: [{
                                        id: { $ne: objUser.id },
                                        idApp: objUser.idApp,
                                    }]
                                }
                            }).then(function(objUserExist) {
                                if (objUserExist != null && objUserExist.id != objUser.id) {
                                    if (objUserExist.phone == objUser.phone) {
                                        res.json({
                                            success: false,
                                            message: "Phone is already Exist..."
                                        });
                                    } else if (objUserExist.email == objUser.email) {
                                        res.json({
                                            success: false,
                                            message: "Email is already Exist...",
                                            data: objUserExist
                                        });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "UserName is already Exist...",
                                            data: objUserExist
                                        });
                                    }
                                } else {
                                    var objUpdate = {
                                        email: objUser.email,
                                        username: objUser.username,
                                        phone: objUser.phone,
                                        country: objUser.country,
                                        modifieddate: objUser.modifieddate,
                                        modifiedby: objUser.modifieddate,
                                        idApp: objUser.idApp,
                                    }
                                    User.update(objUpdate, {
                                        where: {
                                            id: objUser.id
                                        }
                                    }).then(function(responseUser) {
                                        UserInRole.destroy({
                                            where: {
                                                userId: objUser.id
                                            }
                                        }).then(function(response) {
                                            if (objUser.roleId.length > 0) {
                                                function uploader(i) {
                                                    if (i < objUser.roleId.length) {
                                                        var objUserInRole = {
                                                            userId: objUser.id,
                                                            roleId: objUser.roleId[i].id
                                                        }
                                                        UserInRole.create(objUserInRole).then(function(response) {
                                                            if (objUser.roleId.length == (i + 1)) {
                                                                funAuditLog.CreateAuditLog('SaveCustomer', UserExist.username, 'Update Customer');
                                                                updateUserRedisValue(objUser.id)
                                                                res.json({
                                                                    success: true,
                                                                    message: "Customer updated successfully...",
                                                                    data: response
                                                                });
                                                            } else {
                                                                uploader(i + 1);
                                                            }
                                                        })

                                                    }
                                                }
                                                uploader(0);
                                            } else {
                                                res.json({
                                                    success: false,
                                                    message: "Please Select atleast One Role..."
                                                });
                                            }
                                        })
                                    })
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {
                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            User.findOne({
                                where: {
                                    $or: [{ email: objUser.email }, { phone: objUser.phone }, { username: objUser.username }],
                                    $and: [{
                                        idApp: objUser.idApp,
                                    }]
                                },
                            }).then(function(objUserExist) {
                                if (objUserExist != null) {
                                    if (objUserExist.phone == objUser.phone) {
                                        res.json({
                                            success: false,
                                            message: "Phone is already Exist..."
                                        });
                                    } else if (objUserExist.email == objUser.email) {
                                        res.json({
                                            success: false,
                                            message: "Email is already Exist...",
                                            data: objUserExist
                                        });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "UserName is already Exist...",
                                            data: objUserExist
                                        });
                                    }
                                } else {
                                    var UserPassword = objUser.password;
                                    var EncryptUserpassword = jwt.encode(UserPassword, "bugz");
                                    objUser.password = EncryptUserpassword;
                                    User.findOrCreate({
                                        where: {
                                            username: objUser.username,
                                            password: EncryptUserpassword
                                        },
                                        defaults: objUser
                                    }).then(function(responseObjUser) {
                                        //
                                        UserInRole.destroy({
                                            where: {
                                                userId: responseObjUser[0].id
                                            }
                                        }).then(function(response) {
                                            if (objUser.roleId.length > 0) {
                                                function uploader(i) {
                                                    if (i < objUser.roleId.length) {
                                                        var objUserInRole = {
                                                            userId: responseObjUser[0].id,
                                                            roleId: objUser.roleId[i].id
                                                        }
                                                        UserInRole.create(objUserInRole).then(function(response) {
                                                            if (objUser.roleId.length == (i + 1)) {
                                                                funAuditLog.CreateAuditLog('SaveCustomer', UserExist.username, 'Create Customer');
                                                                updateUserRedisValue(responseObjUser[0].id);
                                                                res.json({
                                                                    success: true,
                                                                    message: "Customer created successfully...",
                                                                    data: response
                                                                });
                                                            } else {
                                                                uploader(i + 1);
                                                            }
                                                        })
                                                    }
                                                }
                                                uploader(0);
                                            } else {
                                                res.json({
                                                    success: false,
                                                    message: "Please Select atleast One Role..."
                                                });
                                            }
                                        })

                                        //
                                    })
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.post('/SaveMobileUser', jsonParser, function(req, res) {
    objUser = req.body;
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
                if (objUser.id != 0) {
                    User.findOne({

                        where: {
                            username: objUser.username
                        },
                        defaults: objUser
                    }).then(function(objUserExist) {
                        if (objUserExist != null && objUser.id != objUserExist.id) {
                            res.json({
                                success: false,
                                message: "User is already Exist...",
                                data: objUserExist
                            });
                        } else {
                            User.update(objUser, {
                                where: {
                                    id: objUser.id
                                }
                            }).then(function(responseUser) {
                                funAuditLog.CreateAuditLog('SaveMobileUser', UserExist.username, 'Update User');
                                res.json({
                                    success: true,
                                    message: "User updated successfully...",
                                    data: responseUser
                                });
                            })
                        }
                    })

                } else {
                    res.json({
                        success: false,
                        message: "User not updated...",
                        data: responseUser
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.post('/SaveSupportUser', jsonParser, function(req, res) {
    objUser = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

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
                if (objUser.id != 0) {

                    //set Parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {

                            User.findOne({
                                where: {
                                    username: objUser.username
                                },
                                defaults: objUser
                            }).then(function(objUserExist) {
                                if (objUserExist != null && objUser.id != objUserExist.id) {
                                    res.json({
                                        success: false,
                                        message: "User is already Exist...",
                                        data: objUserExist
                                    });
                                } else {
                                    User.findOne({
                                        where: {
                                            $or: [{ email: objUser.email }, { phone: objUser.phone }],
                                            $and: [{
                                                id: { $ne: objUser.id }
                                            }]
                                        }
                                    }).then(function(chkEmailExist) {
                                        if (chkEmailExist != null) {
                                            if (objUser.phone == chkEmailExist.phone) {
                                                res.json({
                                                    success: false,
                                                    message: "Phone is already Exist..."
                                                });
                                            } else {
                                                res.json({
                                                    success: false,
                                                    message: "Email is already Exist..."
                                                });
                                            }
                                        } else {
                                            User.update(objUser, {
                                                where: {
                                                    id: objUser.id
                                                }
                                            }).then(function(responseUser) {
                                                funAuditLog.CreateAuditLog('SaveSupportUser', UserExist.username, 'Create Support User');
                                                res.json({
                                                    success: true,
                                                    message: "User updated successfully...",
                                                    data: responseUser
                                                });
                                            })
                                        }
                                    });
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {
                    res.json({
                        success: false,
                        message: "You Can not Create User from this Page.",
                        data: objUserExist
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.post('/SaveUserInRole', jsonParser, function(req, res) {
    objUser = req.body;
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

                UserInRole.findOrCreate({
                    where: {
                        userId: objUser.userId
                    },
                    defaults: objUser
                }).then(function(response) {
                    if ((response[1])) {
                        funAuditLog.CreateAuditLog('SaveUserInRole', UserExist.username, 'Create User In Role');
                        res.json({
                            success: true,
                            message: "Role assigned successfully...",
                            data: response
                        });
                    } else {
                        UserInRole.update(objUser, {
                            where: {
                                userId: objUser.userId
                            }
                        }).then(function(response) {
                            if (response[0]) {
                                funAuditLog.CreateAuditLog('SaveUserInRole', UserExist.username, 'Create User In Role');
                                res.json({
                                    success: true,
                                    message: "Role assigned successfully...",
                                    data: response
                                });
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

router.post('/UpdateMobileUserOwnerSpeed', jsonParser, function(req, res) {
    objUser = req.body;
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
                if (objUser.id != 0) {
                    User.findOne({
                        where: {
                            username: objUser.username
                        },
                        defaults: objUser
                    }).then(function(objUserExist) {

                        //Umang -- Start
                        if (objUserExist != null) {

                            if (objUserExist.MaxSpeed == null) {
                                objUserExist.MaxSpeed = 0;
                            }
                            var Speed = objUserExist.MaxSpeed;
                            var Security = objUserExist.IsOwnerSecurity;


                            var search = {};

                            search['$and'] = [];

                            var obj = new Object();
                            obj['iduser'] = {
                                $eq: objUserExist.id
                            };
                            search['$and'].push(obj);

                            var obj = new Object();
                            obj['IsOnline'] = {
                                $eq: true
                            };
                            search['$and'].push(obj);

                            var obj = new Object();
                            obj['IsDeleted'] = {
                                $eq: false
                            };
                            search['$and'].push(obj);

                            var obj = new Object();
                            obj['deviceid'] = {
                                $ne: ''
                            };
                            search['$and'].push(obj);

                            var obj = new Object();
                            obj['DeviceType'] = {
                                $ne: 'M2'
                            };
                            search['$and'].push(obj);

                            Bike.findAll({
                                where: search,
                            }).then(function(UserRes) {
                                if (UserRes.length > 0) {
                                    var client = new net.Socket();
                                    var SecurityFlag = '0';
                                    var timerHander = 0;
                                    var timerHanderSecurity = 0;

                                    if (Speed != objUser.MaxSpeed) {
                                        var MaxSpeed = ("00" + objUser.MaxSpeed).slice(-3);

                                        function SetMaxSpeedCommand(i) {
                                            if (i < UserRes.length) {
                                                var Sendflag = false;
                                                var DeviceId = UserRes[i].deviceid;
                                                var Data = "(" + DeviceId + "DP12H" + MaxSpeed + "L000)";

                                                client.connect(SocketPort, SocketIPAddress, function() {
                                                    client.write(Data);
                                                    client.setTimeout(180000, function() {
                                                        if (Sendflag == false) {
                                                            Sendflag = true;
                                                            // res.json({ success: false, message: 'Network searching, please try again' });
                                                            client.destroy();
                                                            SetMaxSpeedCommand(i + 1);
                                                        };

                                                    });
                                                });

                                                client.on('data', function(data) {
                                                    var line = data.toString();
                                                    //console.log(line);
                                                    if (Sendflag == false) {
                                                        if (line.indexOf('BP12') > 0) {

                                                            var deviceID = line.substring(1, 13);
                                                            var SpeedDetail = line.substring(17, 25);

                                                            Sendflag = true;
                                                            // res.json({ success: true, data: objNavigation });
                                                            // res.json(objNavigation);

                                                            client.destroy();
                                                            //clearTimeout(timerHander);
                                                            timerHander = 0;
                                                            SetMaxSpeedCommand(i + 1); // kill client after server's response
                                                        } else {
                                                            Sendflag = true;
                                                            // res.json({ success: false, message: 'Network searching, please try again' });

                                                            client.destroy();
                                                            //clearTimeout(timerHander);
                                                            timerHander = 0;
                                                            SetMaxSpeedCommand(i + 1);
                                                        }

                                                    }
                                                });

                                                client.on('close', function() {
                                                    //  console.log('Connection closed');
                                                });
                                            }
                                            // else {
                                            //     if (Security != objUser.IsSecurity) {
                                            //         var Sendflag = false;

                                            //         if (objUser.IsSecurity) {
                                            //             SecurityFlag = '1';
                                            //         }
                                            //         SetSecurityCommand(0);
                                            //     }
                                            // }
                                        }
                                        SetMaxSpeedCommand(0);
                                    }
                                    // else {
                                    //     if (objUser.IsOwnerSecurity != Security) {
                                    //         var Sendflag = false;

                                    //         if (objUser.IsOwnerSecurity) {
                                    //             SecurityFlag = '1';
                                    //         }
                                    //         SetSecurityCommand(0);
                                    //     };
                                    // }


                                    // function SetSecurityCommand(j) {
                                    //     if (j < UserRes.length) {
                                    //         var Sendflag = false;
                                    //         var DeviceId = UserRes[j].deviceid;
                                    //         var Data = "(" + DeviceId + "DV03" + SecurityFlag + ")";

                                    //         client.connect(SocketPort, SocketIPAddress, function() {
                                    //             console.log(Data);
                                    //             client.write(Data);
                                    //             client.setTimeout(180000, function() {
                                    //                 if (Sendflag == false) {
                                    //                     Sendflag = true;
                                    //                     // res.json({ success: false, message: 'Network searching, please try again' });
                                    //                     client.destroy();
                                    //                     GetSecurityCommand(j + 1);
                                    //                 };

                                    //             });
                                    //         });

                                    //         client.on('data', function(data) {
                                    //             var line = data.toString();
                                    //             //console.log(line);
                                    //             if (Sendflag == false) {
                                    //                 if (line.indexOf('BV03') > 0) {
                                    //                     console.log('Received: ' + line);

                                    //                     var deviceID = line.substring(1, 13);
                                    //                     var SecurityFlag = line.substring(17, 18);

                                    //                     Sendflag = true;
                                    //                     // res.json({ success: true, data: objNavigation });
                                    //                     // res.json(objNavigation);
                                    //                     client.destroy();
                                    //                     //clearTimeout(timerHanderSecurity);
                                    //                     timerHanderSecurity = 0;
                                    //                     SetSecurityCommand(j + 1); // kill client after server's response
                                    //                 } else {
                                    //                     Sendflag = true;
                                    //                     // res.json({ success: false, message: 'Network searching, please try again' });

                                    //                     client.destroy();
                                    //                     //clearTimeout(timerHanderSecurity);
                                    //                     timerHanderSecurity = 0;
                                    //                     SetSecurityCommand(j + 1);
                                    //                 }
                                    //             }
                                    //         });

                                    //         client.on('close', function() {
                                    //             console.log('Connection closed');
                                    //         });
                                    //     }
                                    // }

                                }
                            });

                            //Umang -- End


                            objUserExist.updateAttributes({ MaxSpeed: objUser.MaxSpeed }).then(function(responseUser) {
                                connection.query("update tblbike set MaxSpeed = '" + objUser.MaxSpeed + "' where iduser = '" + objUserExist.id + "' and IsDeleted=false and DeviceType!='M2';", function(err, rows, fields) {
                                    funAuditLog.CreateAuditLog('UpdateMobileUserOwnerSpeed', UserExist.username, 'Update Maximum Speed');
                                    res.json({
                                        success: true,
                                        message: "Maximum Speed updated successfully...",
                                        data: responseUser
                                    });
                                });
                            })
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: "Maximum Speed not updated...",
                        data: responseUser
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.post('/UpdateBikeDeviceMaxSpeed', jsonParser, function(req, res) {
    objUser = req.body;
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
                if (objUser.id != 0) {
                    Bike.findOne({
                        where: {
                            id: objUser.bikeId,
                            // IsOnline: true,
                            IsDeleted: false,
                            DeviceType: {
                                $ne: 'M2'
                            },
                        },
                        defaults: objUser
                    }).then(function(objUserExist) {
                        if (objUserExist != null) {

                            if (objUserExist.MaxSpeed == null) {
                                objUserExist.MaxSpeed = 0;
                            }
                            var Speed = objUserExist.MaxSpeed;
                            var Security = objUserExist.IsOwnerSecurity;


                            var client = new net.Socket();
                            var SecurityFlag = '0';
                            var timerHander = 0;
                            var timerHanderSecurity = 0;

                            if (Speed != objUser.MaxSpeed) {
                                var MaxSpeed = ("00" + objUser.MaxSpeed).slice(-3);

                                var Sendflag = false;
                                var DeviceId = objUserExist.deviceid;
                                var Data = "(" + DeviceId + "DP12H" + MaxSpeed + "L000)";

                                client.connect(SocketPort, SocketIPAddress, function() {
                                    client.write(Data);
                                    client.setTimeout(120000, function() {
                                        if (Sendflag == false) {
                                            Sendflag = true;
                                            client.destroy();
                                            res.json({
                                                success: false,
                                                message: "Device not Connected.Try again after 5 Minute",
                                                data: objUserExist
                                            });
                                        };

                                    });
                                });

                                client.on('data', function(data) {
                                    var line = data.toString();
                                    if (Sendflag == false) {
                                        if (line.indexOf('BP12') > 0) {
                                            //  console.log('Received: ' + line);

                                            var deviceID = line.substring(1, 13);
                                            var SpeedDetail = line.substring(17, 25);

                                            Sendflag = true;

                                            client.destroy();
                                            timerHander = 0;

                                            objUserExist.updateAttributes({ MaxSpeed: objUser.MaxSpeed }).then(function(responseUser) {
                                                funAuditLog.CreateAuditLog('UpdateBikeDeviceMaxSpeed', UserExist.username, deviceID + 'Update Maximum Speed');
                                                res.json({
                                                    success: true,
                                                    message: "Maximum Speed updated successfully...",
                                                    data: responseUser
                                                });
                                            })
                                        } else {
                                            Sendflag = true;

                                            client.destroy();
                                            timerHander = 0;
                                            res.json({
                                                success: false,
                                                message: "Maximum Speed  Not updated.Try again Later",
                                                data: objUserExist
                                            });
                                        }

                                    }
                                });

                                client.on('close', function() {
                                    //  console.log('Connection closed');
                                });
                            } else {
                                res.json({
                                    success: false,
                                    message: "Maximum Speed Same as Before. Try with different Speed",
                                    data: objUserExist
                                });
                            }


                        } else {
                            res.json({
                                success: false,
                                message: "Maximum Speed not updated...",
                                data: null
                            });
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        message: "Maximum Speed not updated...",
                        data: UserExist
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})


//  router.post('/UpdateBikeDeviceMaxSpeed', jsonParser, function (req, res) {
//     objUser = req.body;
//     objHeader = req.headers;
//     var token = getToken(objHeader);
//     if (token) {
//         var decoded = jwt.decode(token, TokenKey);

//         User.findOne({
//             where: {
//                 username: decoded.username,
//                 password: decoded.password
//             }
//         }).then(function (UserExist) {
//             if (UserExist != null) {
//                 if (objUser.id != 0) {
//                     Bike.findOne({
//                         where: {
//                             id: objUser.bikeId,
//                             IsOnline: true,
//                             IsDeleted: false,
//                             DeviceType: 'M2-U'
//                         },
//                         defaults: objUser
//                     }).then(function (objUserExist) {
//                         if (objUserExist != null) {

//                             if (objUserExist.MaxSpeed == null) {
//                                 objUserExist.MaxSpeed = 0;
//                             }
//                             var Speed = objUserExist.MaxSpeed;
//                             var Security = objUserExist.IsOwnerSecurity;


//                             var client = new net.Socket();
//                             var SecurityFlag = '0';
//                             var timerHander = 0;
//                             var timerHanderSecurity = 0;

//                             if (Speed != objUser.MaxSpeed) {
//                                 var MaxSpeed = ("00" + objUser.MaxSpeed).slice(-3);

//                                 var Sendflag = false;
//                                 var DeviceId = objUserExist.deviceid;
//                                 var Data = "(" + DeviceId + "DP12H" + MaxSpeed + "L000)";

//                                 client.connect(SocketPort, SocketIPAddress, function () {
//                                     console.log(Data);
//                                     client.write(Data);
//                                     client.setTimeout(180000, function () {
//                                         if (Sendflag == false) {
//                                             Sendflag = true;
//                                             client.destroy();
//                                         };

//                                     });
//                                 });

//                                 client.on('data', function (data) {
//                                     var line = data.toString();
//                                     if (Sendflag == false) {
//                                         if (line.indexOf('BP12') > 0) {
//                                             console.log('Received: ' + line);

//                                             var deviceID = line.substring(1, 13);
//                                             var SpeedDetail = line.substring(17, 25);

//                                             Sendflag = true;

//                                             client.destroy();
//                                             timerHander = 0;
//                                         } else {
//                                             Sendflag = true;

//                                             client.destroy();
//                                             timerHander = 0;
//                                         }

//                                     }
//                                 });

//                                 client.on('close', function () {
//                                     console.log('Connection closed');
//                                 });
//                             }

//                             objUserExist.updateAttributes({ MaxSpeed: objUser.MaxSpeed }).then(function (responseUser) {
//                                 funAuditLog.CreateAuditLog('UpdateBikeDeviceMaxSpeed', UserExist.username, 'Update Maximum Speed');
//                                 res.json({
//                                     success: true,
//                                     message: "Maximum Speed updated successfully...",
//                                     data: responseUser
//                                 });
//                             })
//                         } else {
//                             res.json({
//                                 success: true,
//                                 message: "Maximum Speed updated successfully...",
//                                 data: objUserExist
//                             });
//                         }
//                     })
//                 } else {
//                     res.json({
//                         success: false,
//                         message: "Maximum Speed not updated...",
//                         data: UserExist
//                     });
//                 }
//             } else {
//                 res.json(InvalidToken);
//             }
//         })
//     } else {
//         res.json(InvalidToken);
//     }
// })

router.post('/UpdateMobileUserOwner', jsonParser, function(req, res) {
    objUser = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);

        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password,
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                UserExist.updateAttributes({ ProfileName: objUser.ProfileName, email: objUser.email, phone: objUser.phone }).then(function(responseUser) {
                    funAuditLog.CreateAuditLog('UpdateMobileUserOwner', UserExist.username, 'Update User');
                    res.json({
                        success: true,
                        message: "User updated successfully...",
                        data: responseUser
                    });
                })

            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.post('/UpdateMobileUserOwnerNew', jsonParser, function(req, res) {
    objUser = req.body;
    objHeader = req.headers;

    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);

        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password,
                idApp: objUser.idApp,
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                UserExist.updateAttributes({ ProfileName: objUser.ProfileName, email: objUser.email, phone: objUser.phone }).then(function(responseUser) {
                    funAuditLog.CreateAuditLog('UpdateMobileUserOwner', UserExist.username, 'Update User');
                    res.json({
                        success: true,
                        message: "User updated successfully...",
                        data: responseUser
                    });
                })

            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.post('/UpdateMobileUser', jsonParser, function(req, res) {
    objUser = req.body;
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
                if (objUser.id != 0) {
                    User.findOne({
                        where: {
                            username: objUser.username
                        },
                        defaults: objUser
                    }).then(function(objUserExist) {
                        if (objUserExist != null) {
                            objUserExist.updateAttributes({ ShopName: objUser.ShopName, PersonInCharge: objUser.PersonInCharge, phone: objUser.phone, IsSecurity: objUser.IsSecurity }).then(function(responseUser) {
                                funAuditLog.CreateAuditLog('UpdateMobileUser', UserExist.username, 'Update User');
                                res.json({
                                    success: true,
                                    message: "User updated successfully...",
                                    data: responseUser
                                });
                            })
                        }
                    })

                } else {
                    res.json({
                        success: false,
                        message: "User not updated...",
                        data: responseUser
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/DeleteUser', function(req, res) {
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
                User.destroy({
                    where: {
                        id: req.query.idUser
                    }
                }).then(function(response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeleteUser', UserExist.username, 'Delete User');
                        res.json({
                            success: true,
                            message: "User deleted successfully...",
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
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});


// Generate Custome Password for Creating New User
var maxLength = 10;
var minLength = 8;
var uppercaseMinCount = 2;
var lowercaseMinCount = 2;
var numberMinCount = 2;
var specialMinCount = 1;
var UPPERCASE_RE = /([A-Z])/g;
var LOWERCASE_RE = /([a-z])/g;
var NUMBER_RE = /([\d])/g;
var SPECIAL_CHAR_RE = /([\?\-\^\$\#\@\!\%\&\*])/g;
var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

function isStrongEnough(password) {
    var uc = password.match(UPPERCASE_RE);
    var lc = password.match(LOWERCASE_RE);
    var n = password.match(NUMBER_RE);
    var sc = password.match(SPECIAL_CHAR_RE);
    var nr = password.match(NON_REPEATING_CHAR_RE);
    return password.length >= minLength &&
        !nr &&
        uc && uc.length >= uppercaseMinCount &&
        lc && lc.length >= lowercaseMinCount &&
        n && n.length >= numberMinCount &&
        sc && sc.length >= specialMinCount;
}

function customPassword() {
    var password = "";
    var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
    while (!isStrongEnough(password)) {
        password = generatePassword(randomLength, false, /[\w\d\?\-]/);
    }
    return password;
}
//End

function GetUserNameFromDate() {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();

    var seconds = d.getSeconds();
    var minutes = d.getMinutes();
    var hour = d.getHours();

    var milisec = d.getMilliseconds();

    return curr_year.toString() + curr_month.toString() + curr_date.toString() + hour.toString() + minutes.toString() + seconds.toString() + milisec.toString();


}


router.post('/uploadImage', function(req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/../MediaUploads/UserUpload';
    var FileName = [];
    var lstUser = [];




    //file upload path
    form.parse(req, function(err, fields, files) {

        // console.log(err)
        // console.log(fields)
        //console.log(files)
        //you can get fields here
    });
    form.on('fileBegin', function(name, file) {
        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetUserNameFromDate();
        if (ext.indexOf('?') > -1) {
            ext = ext.substring(0, ext.indexOf('?'));
        };

        file.path = form.uploadDir + "/" + NewName + ext;
        FileName.push(NewName + ext);
        lstUser.push(name);

        //modify file path
    });
    form.on('end', function() {
        var i = 0;

        function uploader(i) {
            if (i < FileName.length) {
                var UserId = parseInt(lstUser[i]);

                User.findOne({ where: { id: UserId } }).then(function(response) {
                    if (response != null) {
                        //  if (req.query.UserType == 'Owner') {
                        //      if (response.OwnerImage != '' && response.OwnerImage != null) {
                        //          var oldFile = __dirname + '/../MediaUploads/UserUpload/' + response.OwnerImage;
                        //          fs.exists(oldFile, function(exists) {
                        //              if (exists) {
                        //                  fs.unlink(oldFile);
                        //              }
                        //          });
                        //      };
                        //      response.updateAttributes({ OwnerImage: FileName[i] }).then(function(resUpdate) {
                        //          if ((i + 1) == FileName.length) {
                        //              res.json({ success: true, message: "Images Uploaded Successfully...", data: FileName[i] });
                        //          } else {
                        //              uploader(i + 1);
                        //          };
                        //      })
                        //  } else {
                        if (response.image != '' && response.image != null) {
                            var oldFile = __dirname + '/../MediaUploads/UserUpload/' + response.image;
                            fs.exists(oldFile, function(exists) {
                                if (exists) {
                                    fs.unlink(oldFile);
                                }
                            });
                        };
                        response.updateAttributes({ image: FileName[i] }).then(function(resUpdate) {
                                if ((i + 1) == FileName.length) {
                                    res.json({ success: true, message: "Images Uploaded Successfully...", data: FileName[i] });
                                } else {
                                    uploader(i + 1);
                                };
                            })
                            //  }
                    }
                })
            }
        }
        uploader(i);
        if (FileName.length == 0) {
            res.json({ success: false, message: "Please Select atleast One File..." });
        }
        // res.sendStatus(200);
        //when finish all process
    });
});

router.get('/GetAllDynamicOwnerCustomerold', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};
    var search1 = {};
    var search2 = {};
    var searchUser = {};
    search1['$and'] = [];
    searchUser['$and'] = [];
    var IsUserSuperAdmin = false;
    var IsCountryAll = false;

    var UserRoles = objParam.UserRoles;
    if (UserRoles == "Sales Agent") {
        var UserId = objParam.UserId;
        var obj = new Object();
        obj['idSalesAgent'] = { $eq: parseInt(UserId) }
        searchUser['$and'].push(obj);
    }

    if (UserRoles.length > 0) {

        function CheckUserCountry(i) {
            if (i < UserRoles.length) {

                if (UserRoles[i] == 'Super Admin') {
                    IsUserSuperAdmin = true;
                    CheckUserCountry(i + 1);
                } else {
                    CheckUserCountry(i + 1);
                }

            } else {
                if (!IsUserSuperAdmin) {
                    search['$or'] = [];
                } else {
                    search['$and'] = [];
                }

                if (objSearch != null && objSearch != '') {
                    search1['$or'] = [];

                    for (var i = 0; i < objColumns.length; i++) {
                        if (objColumns[i].data != null && objColumns[i].data != '') {
                            var columnName = objColumns[i].data;
                            if (columnName != 'CreatedDate') {
                                if (columnName == 'MaxSpeed') {
                                    columnName = 'tbluserinformation.MaxSpeed';
                                }
                                search1['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                            }
                        };
                    };
                }
                search1['$and'].push(search2);
                if (objParam.appId != null && objParam.appId != '' && objParam.appId != undefined) {
                    var obj = new Object();
                    obj['idApp'] = {
                        $eq: objParam.appId
                    };
                    search1['$and'].push(obj);
                }

                User.hasMany(Vehicle, {
                    foreignKey: {
                        name: 'iduser',
                        allowNull: true,
                    }
                });
                User.findAndCountAll({
                    required: true,
                    where: search1,
                    order: Orderby,
                    offset: parseInt(objParam.start),
                    limit: parseInt(objParam.length),
                    //  include: [{
                    //      model: Vehicle,
                    //      attributes: [
                    //          [('DISTINCT', models.sequelize.col('iduser')), 'iduser']
                    //      ],
                    //      where: [searchUser, {
                    //          IsDelete: 0,
                    //          deviceid: {
                    //              $ne: '',
                    //          }
                    //      }],
                    //  }],
                }).then(function(response) {
                    var response1 = new Object();
                    response1.draw = objParam.draw;
                    response1.recordsTotal = response.count;
                    response1.recordsFiltered = response.count;
                    response1.data = response.rows;
                    res.json(response1);
                }).catch(function(error) {
                    //  console.log(error);
                    res.json(error);
                })
            }
        }
        CheckUserCountry(0)
    }
})

router.get('/GetAllDynamicOwnerCustomer', function(req, res) {
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

    var UserInRole = objParam.UserRoles.length ? objParam.UserRoles : [];

    var CheckRole = u.contains(UserInRole, "Super Admin");
    if (CheckRole == false) {
        var query = "select SQL_CALC_FOUND_ROWS tbluserinformation.CreatedDate, tblappinfo.AppName,tbluserinformation.id,tbluserinformation.username,tbluserinformation.idApp,tbluserinformation.email,tbluserinformation.phone,tbluserinformation.country,tbluserinformation.OTP,tbluserinformation.IsMobileVerify,CONVERT_TZ(tbluserinformation.LastLogin,'+00:00','" + CurrentOffset + "') as LastLogin, " +
            "(select count(tblvehicle.deviceid) from tblvehicle where iduser = tbluserinformation.id and tblvehicle.IsDelete=0 and tblvehicle.deviceid !='' ) as TotalDevice " +
            "from tbluserinformation left join tblappinfo on tbluserinformation.idApp = tblappinfo.id   inner join tbluserinrole on tbluserinformation.id=tbluserinrole.userId inner join tblrole on tblrole.id=tbluserinrole.roleId and tblrole.RoleName='User' " + search +
            " group by tbluserinformation.id " +
            " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start) + ";";
    } else {
        var query = "select SQL_CALC_FOUND_ROWS tbluserinformation.CreatedDate, tblappinfo.AppName,tbluserinformation.id,tbluserinformation.username,tbluserinformation.idApp,tbluserinformation.email,tbluserinformation.phone,tbluserinformation.country,tbluserinformation.OTP,tbluserinformation.IsMobileVerify,CONVERT_TZ(tbluserinformation.LastLogin,'+00:00','" + CurrentOffset + "') as LastLogin, " +
            "(select count(tblvehicle.deviceid) from tblvehicle where iduser = tbluserinformation.id and tblvehicle.IsDelete=0 and tblvehicle.deviceid !='' ) as TotalDevice " +
            "from tbluserinformation left join tblappinfo on tbluserinformation.idApp = tblappinfo.id  " + search +
            " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start) + ";";
    }


    query += " SELECT FOUND_ROWS() as TotalRecord ";
    // var Countqry = "SELECT count(tbluserinformation.id) as TotalRecord " +
    //     "from tbluserinformation left join tblappinfo on tbluserinformation.idApp = tblappinfo.id " + JoinQuery + search;
    connectionUserData.query(query, function(err, response) {
        if (response != undefined) {
            // connection.query(Countqry, function(err, lstCount, fields) {
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = response[1][0].TotalRecord;
            response1.recordsFiltered = response[1][0].TotalRecord;
            response1.data = response[0];
            res.json(response1);
            // });
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

router.get('/ExportOwnerCustomer', function(req, res) {
    //for excel
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
            caption: 'Email',
            type: 'string'
        }, {
            caption: 'Phone',
            type: 'string'
        }, {
            caption: 'Country',
            type: 'string'
        },
        {
            caption: 'Total Device',
            type: 'string'
        }, {
            caption: 'App Name',
            type: 'string'
        }, {
            caption: 'Last Login Date',
            type: 'string'
        },
    ];

    var objParam = req.query;
    var search = '';
    if (objParam.appId != null && objParam.appId != undefined && objParam.appId != '') {
        if (search != "") {
            search += ' and tbluserinformation.idApp = "' + objParam.appId + '"';
        } else {
            search += ' where tbluserinformation.idApp = "' + objParam.appId + '"';
        }
    }
    if (objParam.UserRoles != 'Super Admin') {
        conf.cols.splice(4, 1);
    }
    objParam.CurrentOffset = objParam.CurrentOffset.charAt(0) == 'p' ? objParam.CurrentOffset.replace('p', '+') : objParam.CurrentOffset.replace('m', '-');
    var query = "select tbluserinformation.CreatedDate, tblappinfo.AppName,tbluserinformation.id,tbluserinformation.username,tbluserinformation.idApp,tbluserinformation.email,tbluserinformation.phone,tbluserinformation.country,tbluserinformation.OTP,tbluserinformation.IsMobileVerify,DATE_FORMAT(CONVERT_TZ(tbluserinformation.LastLogin,'+00:00','" + objParam.CurrentOffset + "'),'%d-%m-%Y %r') as LastLogin, " +
        "(select count(tblvehicle.deviceid) from tblvehicle where iduser = tbluserinformation.id and tblvehicle.IsDelete=0 and tblvehicle.deviceid !='' ) as TotalDevice " +
        "from tbluserinformation left join tblappinfo on tbluserinformation.idApp = tblappinfo.id " + search +
        " order by CreatedDate desc";

    connectionUserData.query(query, function(err, response) {
        if (response != undefined) {
            conf.rows = [];

            function GetUserData(i) {
                var Email = '';
                var Phone = '';
                var Country = '';
                var TotalDevice = '0';
                var AppName = '';
                var LastLoginDate = '';
                if (i < response.length) {

                    var row = [];
                    if (response[i].email != null && response[i].email != '' && response[i].email != undefined) {
                        Email = response[i].email.toString();
                    }
                    if (response[i].phone != null && response[i].phone != '' && response[i].phone != undefined) {
                        Phone = response[i].phone.toString();
                    }
                    if (response[i].country != null && response[i].country != '' && response[i].country != undefined) {
                        Country = response[i].country.toString();
                    }
                    if (response[i].TotalDevice != null && response[i].TotalDevice != '' && response[i].TotalDevice != undefined) {
                        TotalDevice = response[i].TotalDevice.toString();
                    }
                    if (response[i].AppName != null && response[i].AppName != '' && response[i].AppName != undefined) {
                        AppName = response[i].AppName.toString();
                    }
                    if (response[i].LastLogin != null && response[i].LastLogin != '' && response[i].LastLogin != undefined) {
                        LastLoginDate = response[i].LastLogin.toString();
                    }
                    if (objParam.UserRoles == 'Super Admin') {
                        row.push(Email, Phone, Country, TotalDevice, AppName, LastLoginDate);
                    } else {
                        row.push(Email, Phone, Country, TotalDevice, LastLoginDate);
                    }
                    conf.rows.push(row);
                    GetUserData(i + 1);
                } else {
                    var result = nodeExcel.execute(conf);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader("Content-Disposition", "attachment; filename=Customer.xlsx");
                    res.end(result, 'binary');
                }
            }
            GetUserData(0);
        }
    })
})

router.get('/GetAllDynamicShopperCustomer', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search.value;

    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }
    var UserRoles = objParam.UserRoles;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};
    var search1 = {};
    var search2 = {};
    search1['$and'] = [];

    var IsUserSuperAdmin = false;
    var IsCountryAll = false;

    if (UserRoles.length > 0) {

        function CheckUserCountry(i) {
            if (i < UserRoles.length) {

                if (UserRoles[i] == 'Super Admin') {
                    IsUserSuperAdmin = true;
                    CheckUserCountry(i + 1);
                } else {
                    CheckUserCountry(i + 1);
                }

            } else {
                if (!IsUserSuperAdmin) {
                    search['$or'] = [];
                } else {
                    search['$and'] = [];
                }

                search2['$or'] = [];
                var obje = new Object();
                obje['Type'] = 'Shop';
                search2['$or'].push(obje);
                var obje1 = new Object();
                obje1['Type'] = 'Both';
                search2['$or'].push(obje1);

                if (objSearch != null && objSearch != '') {
                    search1['$or'] = [];

                    for (var i = 0; i < objColumns.length; i++) {
                        if (objColumns[i].data != null && objColumns[i].data != '') {
                            var columnName = objColumns[i].data;
                            if (columnName != 'CreatedDate') {
                                search1['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                            }
                        };
                    };
                }

                search1['$and'].push(search2)
                User.hasMany(Vehicle, {
                    foreignKey: {
                        name: 'iduser',
                        allowNull: false
                    }
                });

                User.findAndCountAll({
                    required: true,
                    where: search1,
                    order: Orderby,
                    offset: parseInt(objParam.start),
                    limit: parseInt(objParam.length),
                    include: [{
                        model: Vehicle,
                        attributes: [
                            [('DISTINCT', models.sequelize.col('iduser')), 'iduser']
                        ],
                        where: {
                            IsDeleted: 0,
                            DeviceType: 'M2',
                            deviceid: {
                                $ne: ''
                            }
                        },
                    }],
                }).then(function(response) {
                    var response1 = new Object();
                    response1.draw = objParam.draw;
                    response1.recordsTotal = response.count;
                    response1.recordsFiltered = response.count;
                    response1.data = response.rows;
                    res.json(response1);
                }).catch(function(error) {
                    //  console.log(error);
                    res.json(error);
                })
            }
        }
        CheckUserCountry(0)
    }
})


router.get('/DeleteCustomer_old', function(req, res) {
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
                if (req.query.id != '' && req.query.id != null) {
                    Vehicle.findOne({ where: { iduser: req.query.id } }).then(function(vehicleExits) {
                        if (vehicleExits) {
                            res.json({
                                success: false,
                                message: "This Customer have Vehicle. so you can not delete this customer.",
                            });
                        } else {
                            SharedDevice.destroy({ where: { idSharedUser: req.query.id } }).then(function(SharedDevicedeleted) {
                                UserInRole.destroy({ where: { userId: req.query.id } }).then(function(roledeleted) {
                                    User.destroy({ where: { id: req.query.id } }).then(function(response) {
                                        if (response) {
                                            funAuditLog.CreateAuditLog('Delete Customer', UserExist.username, 'Delete Customer');
                                            res.json({
                                                success: true,
                                                message: "Customer deleted successfully.....",
                                            });
                                        } else {
                                            res.json({
                                                success: false,
                                                message: "Customer not deleted",
                                            });
                                        }

                                    })
                                })
                            })
                        }
                    })

                } else {
                    res.json({
                        success: false,
                        message: "Select User To delete",
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


router.post('/UpdateCustomer', jsonParser, function(req, res) {
    objCustomer = req.body;
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
                User.findOne({ where: { id: objCustomer.id } }).then(function(userObject) {
                    if (userObject) {
                        User.findOne({ where: { email: objCustomer.email, idApp: objCustomer.idApp } }).then(function(userduplicate) {
                            if (userduplicate && userduplicate.id != objCustomer.id) {
                                res.json({
                                    success: false,
                                    message: "Email is already exits. Please change email id..",
                                });
                            } else {
                                objCustomer.modifiedby = UserExist.username;
                                objCustomer.modifieddate = new Date();
                                userObject.update(objCustomer).then(function(response) {
                                    if (response) {
                                        funAuditLog.CreateAuditLog('Update Customer', UserExist.username, 'Update Customer');
                                        res.json({
                                            success: true,
                                            message: "Customer updated successfully",
                                        });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: "Customer not updated..",
                                        });
                                    }
                                })
                            }

                        })

                    } else {
                        res.json({
                            success: false,
                            message: "Customer not exist",
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

});


function updateUserRedisValue(id) {
    Vehicle.findAll({ where: { iduser: id } }).then(function(response) {
        if (response) {
            for (var i = 0; i < response.length; i++) {
                Commonfunction.UpdateVehicleRedis(response[i].deviceid, 'User')
            }
        }
    })
}

//DeleteCustomer
router.get('/DeleteCustomer', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        var obj = new Object();
        obj.idUser = req.query.id;
        obj.Status = 'Pending';
        obj.CreatedDate = new Date();
        obj.CreatedBy = decoded.username;
        obj.RequestType = "AccountDelete";
        GpsDeleteCash.findOrCreate({
            where: {
                idUser: obj.idUser,
                Status: obj.Status,
                RequestType: obj.RequestType,
            },
            defaults: obj
        }).then(function(CashCreate) {
            if (CashCreate[1]) {
                funAuditLog.CreateAuditLog('Delete Account', decoded.username, 'Save GpsDeleteCash data Userid: (' + obj.idUser + ')');
                res.json({
                    success: true,
                    message: "Your account deletion is under process. We will notify you over email.",
                })
            } else {
                res.json({
                    success: false,
                    message: "You have already requested for account termination. It is under process. Please wait, you will be notified via email.",
                })
            }

        })
    } else {
        res.json(InvalidToken);
    }
})

module.exports = router