//Tables
var router = express.Router();
var User = models.tbluserinformation;
var GPSDevice = models.tblgpsdevice;
var Pet = models.tblpet;
var Carrier = models.tblcarrier;
var Country = models.tblcountrymgmt;
var TelCo = models.tbltelco;
var SimService = models.tblsimdetails;
var VehicleType = models.tblvehicletype;
//End of Tables

router.get('/GetAllGPSDeviceold', function(req, res) {
    var objParam = req.query;

    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = {};
    var search1 = {};
    search1['$and'] = [];
    var TelSearchflg = false;
    var SalesAgSearchflg = false;

    var IsUserSuperAdmin = false;
    var IsCountryAll = false;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }

    var UserRoles = objParam.UserRoles;
    if (UserRoles == 'Sales Agent') {
        var obj1 = new Object();
        obj1['idSalesAgent'] = {
            $eq: parseInt(objParam.UserId)
        }
        search1['$and'].push(obj1);
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
                if (objSearch != null && objSearch != '') {
                    search1['$or'] = [];

                    for (var i = 0; i < objColumns.length; i++) {
                        if (objColumns[i].data != null && objColumns[i].data != '') {
                            var columnName = objColumns[i].data;

                            if (columnName == 'DeviceId') {
                                search1['$or'].push(['tblgpsdevice.DeviceId like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'Type') {
                                search1['$or'].push(['tblgpsdevice.Type like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'Version') {
                                search1['$or'].push(['tblgpsdevice.Version like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'CreatedBy') {
                                search1['$or'].push(['tblgpsdevice.CreatedBy like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'CreatedDate') {
                                search1['$or'].push(['tblgpsdevice.CreatedDate like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'SimNum') {
                                search1['$or'].push(['tblgpsdevice.SimNum like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'tbltelco.Name') {
                                TelSearchflg = true;
                                search1['$or'].push(['tbltelco.Name like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'tbluserinformation.username') {
                                SalesAgSearchflg = true;
                                search1['$or'].push(['tbluserinformation.username like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'ExpiryDate') {
                                search1['$or'].push(['tblgpsdevice.ExpiryDate like ?', "%" + objSearch + "%"]);
                            }
                        };
                    };
                }
                if (!IsUserSuperAdmin && CountryList.length != 0) {
                    search['$or'] = [];
                    if (CountryList.length > 0) {
                        function CheckCountry(p) {
                            if (p < CountryList.length) {
                                var obj = new Object();
                                if (CountryList[p] != "") {

                                    obj['Country'] = {
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

                var flg = true;
                if (IsCountryAll || IsUserSuperAdmin) {
                    flg = false;
                }

                GPSDevice.belongsTo(Country, {
                    foreignKey: {
                        name: 'CountryId',
                        allowNull: true
                    }
                });
                GPSDevice.belongsTo(TelCo, {
                    foreignKey: {
                        name: 'TelCoId',
                        allowNull: true
                    }
                });
                GPSDevice.belongsTo(User, {
                    foreignKey: {
                        name: 'idSalesAgent',
                        allowNull: true
                    }
                });

                GPSDevice.findAndCountAll({
                    where: search1,
                    order: Orderby,
                    offset: parseInt(objParam.start),
                    limit: parseInt(objParam.length),
                    include: [{
                        model: Country,
                        attributes: ['Country'],
                        required: flg,
                        where: search,
                    }, {
                        model: TelCo,
                        required: TelSearchflg,
                    }, {
                        model: User,
                        required: SalesAgSearchflg,
                    }],
                }).then(function(response) {
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
            }
        }
        CheckUserCountry(0)
    }
})
router.get('/GetAllGPSDeviceold1', function(req, res) {
    var objParam = req.query;

    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = '';

    var TelSearchflg = false;
    var SalesAgSearchflg = false;

    var IsUserSuperAdmin = false;
    var IsCountryAll = false;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }

    var UserRoles = objParam.UserRoles;

    if (objSearch != null && objSearch != '') {
        search = 'Where (tblgpsdevice.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.Type like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.IMEI like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.Version like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.SimNum like "%' + objSearch + '%" or ';
        search = search + 'tbltelco.Name like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.ExpiryDate like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.CreatedBy like "%' + objSearch + '%" or ';
        search = search + 'tblsimdetails.SerialNum like "%' + objSearch + '%" or ';
        search = search + 'tblsimdetails.PhoneNum like "%' + objSearch + '%" or ';
        search = search + 'tblcountrymgmt.Country like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.AppName like "%' + objSearch + '%") ';
    };
    if (objParam.UserId != null && objParam.UserId != undefined && objParam.UserId != '') {
        if (search != "") {
            search += " and tblgpsdevice.idSalesAgent =" + objParam.UserId;
        } else {
            search += " Where tblgpsdevice.idSalesAgent =" + objParam.UserId;
        }
    }

    if (objParam.AppName != null && objParam.AppName != undefined && objParam.AppName != '') {
        if (search != "") {
            search += ' and tblgpsdevice.AppName = "' + objParam.AppName + '"';
        } else {
            search += ' where tblgpsdevice.AppName = "' + objParam.AppName + '"';
        }
    }

    var query = " select tblgpsdevice.*, tblcountrymgmt.Country, " +
        " CONVERT_TZ(tblgpsdevice.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate," +
        " CONVERT_TZ(tblgpsdevice.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate," +
        " tbltelco.Name, tbluserinformation.username, tbluserinformation.idApp,tblsimdetails.SerialNum,tblsimdetails.PhoneNum" +
        " from tblgpsdevice " +
        " Left Join tbluserinformation on tblgpsdevice.idSalesAgent=tbluserinformation.id " +
        " Left Join tblsimdetails on tblsimdetails.id = tblgpsdevice.idSim" +
        " Left Join tblcountrymgmt on tblcountrymgmt.id = tblgpsdevice.CountryId" +
        " Left Join tbltelco on tblsimdetails.idTelCo = tbltelco.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);

    var Countqry = "SELECT count(tblgpsdevice.id) as TotalRecord " +
        " from tblgpsdevice " +
        " Left Join tbluserinformation on  tblgpsdevice.idSalesAgent=tbluserinformation.id " +
        " Left Join tblsimdetails on tblsimdetails.id = tblgpsdevice.idSim" +
        " Left Join tblcountrymgmt on tblcountrymgmt.id = tblgpsdevice.CountryId" +
        " Left Join tbltelco on tblsimdetails.idTelCo = tbltelco.id " + search;
    // " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
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

router.get('/GetAllGPSDevice', function(req, res) {
    var objParam = req.query;

    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = '';

    var TelSearchflg = false;
    var SalesAgSearchflg = false;

    var IsUserSuperAdmin = false;
    var IsCountryAll = false;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }

    var UserRoles = objParam.UserRoles;

    if (objSearch != null && objSearch != '') {
        search = 'Where (tblgpsdevice.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.Type like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.IMEI like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.Version like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.SimNum like "%' + objSearch + '%" or ';
        search = search + 'tbltelco.Name like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.ExpiryDate like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.CreatedBy like "%' + objSearch + '%" or ';
        search = search + 'tblsimdetails.SerialNum like "%' + objSearch + '%" or ';
        search = search + 'tblsimdetails.PhoneNum like "%' + objSearch + '%" or ';
        search = search + 'tblcountrymgmt.Country like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.AppName like "%' + objSearch + '%") ';
    };
    if (objParam.UserId != null && objParam.UserId != undefined && objParam.UserId != '') {
        if (search != "") {
            search += " and tblgpsdevice.idSalesAgent =" + objParam.UserId;
        } else {
            search += " Where tblgpsdevice.idSalesAgent =" + objParam.UserId;
        }
    }

    if (objParam.AppName != null && objParam.AppName != undefined && objParam.AppName != '') {
        if (search != "") {
            search += ' and tblgpsdevice.AppName = "' + objParam.AppName + '"';
        } else {
            search += ' where tblgpsdevice.AppName = "' + objParam.AppName + '"';
        }
    }

    var query = " select tblgpsdevice.*, tblcountrymgmt.Country, " +
        " CONVERT_TZ(tblgpsdevice.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate," +
        " CONVERT_TZ(tblgpsdevice.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate," +
        " tbltelco.Name, tbluserinformation.username, tbluserinformation.idApp,tblsimdetails.SerialNum,tblsimdetails.PhoneNum" +
        " from tblgpsdevice " +
        " Left Join tbluserinformation on tblgpsdevice.idSalesAgent=tbluserinformation.id " +
        " Left Join tblsimdetails on tblsimdetails.id = tblgpsdevice.idSim" +
        " Left Join tblcountrymgmt on tblcountrymgmt.id = tblgpsdevice.CountryId" +
        " Left Join tbltelco on tblsimdetails.idTelCo = tbltelco.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);

    var Countqry = "SELECT count(tblgpsdevice.id) as TotalRecord " +
        " from tblgpsdevice " +
        " Left Join tbluserinformation on  tblgpsdevice.idSalesAgent=tbluserinformation.id " +
        " Left Join tblsimdetails on tblsimdetails.id = tblgpsdevice.idSim" +
        " Left Join tblcountrymgmt on tblcountrymgmt.id = tblgpsdevice.CountryId" +
        " Left Join tbltelco on tblsimdetails.idTelCo = tbltelco.id " + search;
    // " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
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
router.get('/ExportTracker', function(req, res) {
    var objParam = req.query;
    var conf = {};
    conf.name = "Sheet1";
    var UserRoles = objParam.UserRoles;
    if (UserRoles == 'Super Admin') {
        conf.cols = [{
            caption: 'Device Id',
            type: 'string'
        }, {
            caption: 'Type',
            type: 'string'
        }, {
            caption: 'IMEI',
            type: 'String'
        }, {
            caption: 'Version',
            type: 'string'
        }, {
            caption: 'SIM Serial Number',
            type: 'string'
        }, {
            caption: 'SIM Phone Number',
            type: 'string'
        }, {
            caption: 'Tel Company',
            type: 'string'
        }, {
            caption: 'Country',
            type: 'string'
        }, {
            caption: 'App Type',
            type: 'string'
        }, {
            caption: 'Expiry Date',
            type: 'string'
        }, {
            caption: 'Date',
            type: 'string'
        }, {
            caption: 'Created By',
            type: 'string'
        }];
    } else {
        conf.cols = [{
            caption: 'Device Id',
            type: 'string'
        }, {
            caption: 'Type',
            type: 'string'
        }, {
            caption: 'IMEI',
            type: 'String'
        }, {
            caption: 'Version',
            type: 'string'
        }, {
            caption: 'SIM Serial Number',
            type: 'string'
        }, {
            caption: 'SIM Phone Number',
            type: 'string'
        }, {
            caption: 'Tel Company',
            type: 'string'
        }, {
            caption: 'Country',
            type: 'string'
        }, {
            caption: 'Expiry Date',
            type: 'string'
        }, {
            caption: 'Date',
            type: 'string'
        }, {
            caption: 'Created By',
            type: 'string'
        }];
    }

    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    // var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var Orderby = ' tblgpsdevice.CreatedDate desc'
    var search = '';

    var TelSearchflg = false;
    var SalesAgSearchflg = false;

    var IsUserSuperAdmin = false;
    var IsCountryAll = false;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }



    if (objSearch != null && objSearch != '') {
        search = 'Where (tblgpsdevice.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.Type like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.IMEI like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.Version like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.SimNum like "%' + objSearch + '%" or ';
        search = search + 'tbltelco.Name like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.ExpiryDate like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.CreatedBy like "%' + objSearch + '%" or ';
        search = search + 'tblsimdetails.SerialNum like "%' + objSearch + '%" or ';
        search = search + 'tblsimdetails.PhoneNum like "%' + objSearch + '%" or ';
        search = search + 'tblcountrymgmt.Country like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.AppName like "%' + objSearch + '%") ';
    };

    if (objParam.UserId != null && objParam.UserId != undefined && objParam.UserId != '') {
        if (search != "") {
            search += " and tblgpsdevice.idSalesAgent =" + objParam.UserId;
        } else {
            search += " Where tblgpsdevice.idSalesAgent =" + objParam.UserId;
        }
    }
    if (objParam.AppName != null && objParam.AppName != undefined && objParam.AppName != '' && objParam.AppName != 'All') {
        if (search != "") {
            search += ' and tblgpsdevice.AppName = "' + objParam.AppName + '"';
        } else {
            search += ' where tblgpsdevice.AppName = "' + objParam.AppName + '"';
        }
    }
    var query = " select tblgpsdevice.*, tblcountrymgmt.Country, " +
        " CONVERT_TZ(tblgpsdevice.CreatedDate,'+00:00','" + req.query.CurrentOffset + "') as CreatedDate," +
        " CONVERT_TZ(tblgpsdevice.ExpiryDate,'+00:00','" + req.query.CurrentOffset + "') as ExpiryDate," +
        " tbltelco.Name, tbluserinformation.username, tbluserinformation.idApp,tblsimdetails.SerialNum,tblsimdetails.PhoneNum" +
        " from tblgpsdevice " +
        " Left Join tbluserinformation on tblgpsdevice.idSalesAgent=tbluserinformation.id " +
        " Left Join tblsimdetails on tblsimdetails.id = tblgpsdevice.idSim" +
        " Left Join tblcountrymgmt on tblcountrymgmt.id = tblgpsdevice.CountryId" +
        " Left Join tbltelco on tblsimdetails.idTelCo = tbltelco.id " + search +
        " order by " + Orderby;

    connection.query(query, function(err, response) {
        if (response != undefined) {
            conf.rows = [];
            // conf1.rows = [];
            // GetTrackerData(0);

            // function GetTrackerData(i) {
            for (var i = 0; i < response.length; i++) {
                var DeviceId = '';
                var Type = '';
                var IMEI = '';
                var Version = '';
                var SimSerialNum = '';
                var SimPhoneNum = '';
                var TelCompany = '';
                var SalesAgent = '';
                var ExpiryDate = '';
                var Date = '';
                var CreatedBy = '';
                var isActive = 'false';
                var AppName = '';
                var Country = '';
                var CreatedBy = '';
                // if (i < response.length) {
                var row = [];
                if (response[i].DeviceId != null && response[i].DeviceId != '' && response[i].DeviceId != undefined) {
                    DeviceId = response[i].DeviceId;
                }

                if (response[i].Type != null && response[i].Type != '' && response[i].Type != undefined) {
                    Type = response[i].Type;
                }
                if (response[i].IMEI != null && response[i].IMEI != '' && response[i].IMEI != undefined) {
                    IMEI = response[i].IMEI;
                }

                if (response[i].Version != null && response[i].Version != '' && response[i].Version != undefined) {
                    Version = response[i].Version;
                }

                if (response[i].SerialNum != null && response[i].SerialNum != '' && response[i].SerialNum != undefined) {
                    SimSerialNum = response[i].SerialNum
                }

                if (response[i].PhoneNum != null && response[i].PhoneNum != '' && response[i].PhoneNum != undefined) {
                    SimPhoneNum = response[i].PhoneNum;
                }

                if (response[i].Name != null && response[i].Name != '' && response[i].Name != undefined) {
                    TelCompany = response[i].Name;
                }

                // if (response[i].username != null && response[i].username != '' && response[i].username != undefined) {
                //     SalesAgent = response[i].username;
                // }
                if (response[i].ExpiryDate != null && response[i].ExpiryDate != '' && response[i].ExpiryDate != undefined) {
                    ExpiryDate = moment(response[i].ExpiryDate).format('DD-MM-YYYY hh:mm:ss a');
                }
                if (response[i].CreatedDate != null && response[i].CreatedDate != '' && response[i].CreatedDate != undefined) {
                    Date = moment(response[i].CreatedDate).format('DD-MM-YYYY hh:mm:ss a');
                }
                if (response[i].IsActive != null && response[i].IsActive != '' && response[i].IsActive != undefined) {
                    if (response[i].IsActive == 1) {
                        response[i].IsActive = 'true';
                    }
                    if (response[i].IsActive == 0) {
                        response[i].IsActive = 'false';
                    }
                    isActive = response[i].IsActive;
                }
                if (response[i].AppName != null && response[i].AppName != '' && response[i].AppName != undefined) {
                    AppName = response[i].AppName;
                }
                if (response[i].Country != null && response[i].Country != '' && response[i].Country != undefined) {
                    Country = response[i].Country;
                }
                if (response[i].CreatedBy != null && response[i].CreatedBy != '' && response[i].CreatedBy != undefined) {
                    CreatedBy = response[i].CreatedBy;
                }
                if (UserRoles == 'Super Admin') {
                    row.push(DeviceId, Type, IMEI, Version, SimSerialNum, SimPhoneNum, TelCompany, Country, AppName, ExpiryDate, Date, CreatedBy);
                    conf.rows.push(row);
                } else {
                    row.push(DeviceId, Type, IMEI, Version, SimSerialNum, SimPhoneNum, TelCompany, Country, ExpiryDate, Date, CreatedBy);
                    conf.rows.push(row);
                }

                // GetTrackerData(i + 1);
            }
            var result = nodeExcel.execute(conf);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=GPSTracker.xlsx");
            res.end(result, 'binary');

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

router.get('/GetGPSDeviceById', function(req, res) {
    GPSDevice.findOne({
        where: {
            IMEI: req.query.IMEI
        }
    }).then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json(err);
    })
})

// router.get('/GetAllPetDeviceStatusbyCountry', function(req, res) {

//     var objParam = req.query;
//     var objColumns = objParam.columns;
//     var objOrderBy = objParam.order;
//     var objSearch = objParam.search;
//     var objSearch = objParam.search.value;

//     var CountryList = objParam.CountryList;
//     if (CountryList == undefined || CountryList == null || CountryList == "") {
//         CountryList = [];
//     }
//     var UserRoles = objParam.UserRoles;
//     var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
//     var search = {};
//     var search1 = {};

//     search1['$and'] = [];

//     var IsUserSuperAdmin = false;
//     var IsCountryAll = false;


//     if (objSearch != null && objSearch != '') {
//         search['$or'] = [];
//         for (var i = 0; i < objColumns.length; i++) {
//             if (objColumns[i].data != null && objColumns[i].data != '') {
//                 var columnName = objColumns[i].data;
//                 var obj = new Object();
//                 obj[columnName] = {
//                     $like: '%' + objSearch + '%'
//                 }
//                 search['$or'].push(obj);
//             };
//         };
//     }

//     search['$and'] = [];

//     search['$and'].push({ IsDeleted: false });

//     Pet.belongsTo(User, {
//         foreignKey: {
//             name: 'iduser',
//             allowNull: false
//         }
//     });

//     if (UserRoles.length > 0) {

//         function CheckUserCountry(i) {
//             if (i < UserRoles.length) {
//                 if (UserRoles[i] == 'Super Admin') {
//                     IsUserSuperAdmin = true;
//                     CheckUserCountry(i + 1);
//                 } else {
//                     CheckUserCountry(i + 1);
//                 }

//             } else {
//                 if (!IsUserSuperAdmin) {
//                     search['$or'] = [];
//                 } else {
//                     search['$and'] = [];
//                 }


//                 if (!IsUserSuperAdmin) {
//                     search['$or'] = [];
//                     if (CountryList.length > 0) {
//                         function CheckCountry(p) {
//                             if (p < CountryList.length) {
//                                 var obj = new Object();
//                                 if (CountryList[p] != "") {

//                                     obj['country'] = {
//                                         $like: '%' + CountryList[p] + '%'
//                                     }
//                                     search['$or'].push(obj);

//                                     if (CountryList[p] == "All") {
//                                         IsCountryAll = true;
//                                     }
//                                 }
//                                 CheckCountry(p + 1);
//                             }
//                         }
//                         CheckCountry(0);
//                     }
//                 }

//                 if (IsCountryAll) {
//                     search = {};
//                 } else {
//                     search1['$and'].push(search)
//                 }

//                 if (!IsUserSuperAdmin) {
//                     Pet.findAndCountAll({
//                         //where: search,
//                         where: {
//                             deviceid: {
//                                 $ne: ''
//                             },
//                             $and: [search]
//                         },
//                         order: Orderby,
//                         offset: parseInt(objParam.start),
//                         limit: parseInt(objParam.length),
//                         include: [{
//                             model: User,
//                             where: { country: UserCountry },
//                             required: true
//                         }]
//                     }).then(function(response) {
//                         var PetList = [];
//                         var response1 = new Object();
//                         response1.draw = objParam.draw;
//                         response1.recordsTotal = response.count;
//                         response1.recordsFiltered = response.count;
//                         response1.data = response.rows;
//                         res.json(response1);

//                     }).catch(function(error) {
//                         res.json(error);
//                     })
//                 } else {
//                     Pet.findAndCountAll({
//                         //where: search,
//                         where: {
//                             deviceid: {
//                                 $ne: ''
//                             },
//                             $and: [search]
//                         },
//                         order: Orderby,
//                         offset: parseInt(objParam.start),
//                         limit: parseInt(objParam.length),
//                         include: [{
//                             model: User,
//                             required: true
//                         }]
//                     }).then(function(response) {
//                         var PetList = [];
//                         var response1 = new Object();
//                         response1.draw = objParam.draw;
//                         response1.recordsTotal = response.count;
//                         response1.recordsFiltered = response.count;
//                         response1.data = response.rows;
//                         res.json(response1);

//                     }).catch(function(error) {
//                         res.json(error);
//                     })
//                 }
//             }
//         }
//         CheckUserCountry(0);
//     }

// })

router.get('/GetAllPetbyCountry', function(req, res) {

    var model = [];

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var objSearch = objParam.search.value;
    var UserCountry = objParam.UserCountry;
    var UserRoles = objParam.UserRoles;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }
    var country = objParam.country;

    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var IsUserSuperAdmin = false;
    var search = {};
    var search1 = {};
    var IsCountryAll = false;

    if (objSearch != null && objSearch != '') {
        search['$or'] = [];
        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                var obj = new Object();
                obj[columnName] = {
                    $like: '%' + objSearch + '%'
                }
                search['$or'].push(obj);
            };
        };
    }

    search['$and'] = [];
    search['$and'].push({ IsDeleted: false });
    search['$and'].push({
        deviceid: {
            $ne: ''
        }
    });

    deviceid: {
        $ne: ''
    }
    Pet.belongsTo(User, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });

    // if (country != null && country != '') {
    //     model.push({
    //         model: User,
    //         where: {
    //             country: country
    //         }
    //     });
    // } else {
    //     model.push({
    //         model: User
    //     });

    // }

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

                search1['$or'] = [];

                if (CountryList.length > 0) {
                    function CheckCountry(p) {
                        if (p < CountryList.length) {
                            var obj = new Object();
                            if (CountryList[p] != "") {

                                obj['country'] = {
                                    $like: '%' + CountryList[p] + '%'
                                }
                                search1['$or'].push(obj);

                                if (CountryList[p] == "All") {
                                    IsCountryAll = true;
                                }
                            }
                            CheckCountry(p + 1);
                        }
                    }
                    CheckCountry(0);
                }
                if (!IsUserSuperAdmin && !IsCountryAll) {
                    Pet.findAndCountAll({
                        where: search,
                        order: Orderby,
                        offset: parseInt(objParam.start),
                        limit: parseInt(objParam.length),
                        include: [{
                            model: User,
                            // where: { country: UserCountry },
                            where: search1,
                            required: true
                        }]
                    }).then(function(response) {
                        var PetList = [];
                        var response1 = new Object();
                        response1.draw = objParam.draw;
                        response1.recordsTotal = response.count;
                        response1.recordsFiltered = response.count;
                        response1.data = response.rows;
                        res.json(response1);

                    }).catch(function(error) {
                        res.json(error);
                    })
                } else {
                    Pet.findAndCountAll({
                        where: search,
                        order: Orderby,
                        offset: parseInt(objParam.start),
                        limit: parseInt(objParam.length),
                        include: [{
                                model: User,
                                required: true
                            }]
                            //include: model
                    }).then(function(response) {
                        var PetList = [];
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
        }
        CheckUserCountry(0);
    }
})

router.get('/DeleteDeviceById', function(req, res) {
    GPSDevice.destroy({ where: { id: req.query.id } }).then(function(response) {
        if (response) {
            funAuditLog.CreateAuditLog('DeleteGPSDevice', 'Admin', 'Delete GPS Device');
            res.json({ success: true, message: "GPS Device deleted successfully...", data: response });
        } else {
            res.json({ success: false, message: "Requested Record not Exist....", data: response });
        }
    })
});

router.post('/SaveGPSDevice', jsonParser, function(req, res) {
    objGPSDevice = req.body;
    if (objGPSDevice.idSalesAgent == 0) {
        objGPSDevice.idSalesAgent = null
    }
    objHeader = req.headers;
    //Set parameters for user permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objGPSDevice.id == 0) {
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            objGPSDevice.CreatedDate = new Date();
                            objGPSDevice.CreatedBy = decoded.username;
                            GPSDevice.findOrCreate({ where: { DeviceId: objGPSDevice.DeviceId }, defaults: objGPSDevice }).then(function(response) {
                                if ((response[1])) {
                                    funAuditLog.CreateAuditLog('SaveGPSDevice', UserExist.username, 'Create GPS Tracker Device');
                                    res.json({ success: true, message: "Tracker created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Tracker already exist...", data: response });
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {
                    //set parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {;
                            GPSDevice.findOne({ where: { DeviceId: objGPSDevice.DeviceId } }).then(function(objGPSDeviceExit) {
                                if (objGPSDeviceExit != null && objGPSDevice.id != objGPSDeviceExit.id) {
                                    res.json({ success: false, message: "Tracker is already exist...", data: objGPSDeviceExit });
                                } else {
                                    GPSDevice.update(objGPSDevice, { where: { id: objGPSDevice.id } }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveGPSDevice', UserExist.username, 'Update GPS Tracker Device');
                                            res.json({ success: true, message: "Tracker updated successfully", data: response });
                                        } else {
                                            res.json({ success: false, message: "Tracker Is Not updated", data: response });
                                        }
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
});

router.get('/UpdateStatusold', function(req, res) {
    objHeader = req.headers;
    var ExpiryDate = null;
    var ActivationDate = null;
    if (req.query.IsActive == 1) {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        var c = new Date(year + 1, month, day)
        ExpiryDate = c;
        ActivationDate = d;
    }
    //Set parameters for user permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        GPSDevice.findOne({
            where: {
                id: req.query.id,
            }
        }).then(function(ObjExist) {
            if (ObjExist) {
                ObjExist.updateAttributes({
                    IsActive: req.query.IsActive,
                    ExpiryDate: ExpiryDate,
                    ActivationDate: ActivationDate
                }).then(function(response) {
                    if (response) {
                        res.json({ success: true, message: "Tracker Status Updated successfully", data: response });
                    } else {
                        res.json({ success: false, message: "Tracker Status not Updated successfully", data: response });
                    }
                })
            } else {
                res.json({ success: false, message: "Tracker Device not found", data: response });
            }
        })
    } else {
        res.json(InvalidToken);
    }
})


router.get('/UpdateStatus', function(req, res) {
    objHeader = req.headers;
    var ExpiryDate = null;
    var ActivationDate = null;
    if (req.query.IsActive == 1) {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        var c = new Date(year + 1, month, day)
        ExpiryDate = c;
        ActivationDate = d;
    }
    // var d = new Date();
    // var year = d.getFullYear();
    // var month = d.getMonth();
    // var day = d.getDate();
    // var c = new Date(year + 1, month, day)
    // ExpiryDate = c;
    // ActivationDate = d;

    //Set parameters for user permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                GPSDevice.findOne({
                    where: {
                        id: req.query.id,
                    }
                }).then(function(ObjExist) {
                    if (ObjExist) {
                        // ObjExist.updateAttributes({
                        //     IsActive: req.query.IsActive,
                        //     ExpiryDate: ExpiryDate,
                        //     ActivationDate: ActivationDate
                        // }).then(function(response) {
                        //     if (response) {
                        //         res.json({ success: true, message: "Tracker Status Updated successfully", data: response });
                        //     }
                        // })

                        if ((req.query.flg == true || req.query.flg == 'true') || (req.query.dateFlag == true || req.query.dateFlag == 'true')) {
                            ObjExist.updateAttributes({
                                IsActive: req.query.IsActive,
                                ExpiryDate: ExpiryDate,
                                ActivationDate: ActivationDate
                            }).then(function(response) {
                                if (response) {
                                    funAuditLog.CreateAuditLog('update tracker status', UserExist.username, 'update tracker status IsActive');
                                    res.json({ success: true, message: "Tracker Status Updated successfully", data: response });
                                } else {
                                    res.json({ success: false, message: "Tacker Status not updated successfully" })
                                }
                            })

                        } else {

                            ObjExist.updateAttributes({
                                IsActive: req.query.IsActive,
                            }).then(function(response) {
                                if (response) {
                                    funAuditLog.CreateAuditLog('update tracker status', UserExist.username, 'update tracker status IsActive');
                                    res.json({ success: true, message: "Tracker Status Updated successfully", data: response });
                                } else {
                                    res.json({ success: false, message: "Tracker Status not Updated successfully", data: response });
                                }
                            })
                        }
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

router.post('/uploadExcelDevice', function(req, res) {
    var form = new formidable.IncomingForm();
    var lst = [];
    var FileName = [];
    var DeviceType;
    var IsOldDevice;
    var CreatedBy;
    var CountryId;
    var CarrierId;
    var AppName;
    var Importerror = [];

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //var FileName = __dirname + '/../MediaUploads/FileUpload/DeviceList.xlsx';
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

    form.parse(req, function(err, fields, files) {
        //console.log(fields);
        DeviceType = fields.Type;
        IsOldDevice = fields.IsOldDevice;
        CreatedBy = fields.CreatedBy;
        CountryId = fields.CountryId;
        CarrierId = fields.CarrierId;
        AppName = fields.AppName;
    });

    form.on('fileBegin', function(name, file) {
        file.path = form.uploadDir + "/" + file.name;
        // console.log(file.path);
        FileName = file.path.toString();
        //FileName.push(file.path);
    });

    form.on('end', function() {
        if (FileName.length > 0) {
            var workbook = XLSX.readFile(FileName, { type: 'binary' });
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            if (worksheet != null && worksheet != undefined && worksheet != '') {
                var Firstcolumn = worksheet.A1.v;
                if (Firstcolumn == "IMEI") {
                    lst = XLSX.utils.sheet_to_json(worksheet);
                    if (lst.length > 0) {
                        function addDevice(i) {
                            if (i < lst.length) {
                                var obj = new Object();
                                obj.DeviceId = lst[i].IMEI.trim().slice(1);
                                // obj.DeviceId = lst[i].IMEI.trim();
                                obj.IMEI = lst[i].IMEI.trim();
                                obj.CreatedDate = new Date();
                                obj.Latitude = '22.54967667';
                                obj.Longitude = '114.0822583';
                                obj.speed = '0.1';
                                obj.Direction = '323.87';
                                obj.Type = DeviceType;
                                obj.IsOldDevice = IsOldDevice;
                                obj.CreatedBy = CreatedBy;
                                obj.CountryId = CountryId;
                                obj.Version = lst[i].Version;
                                obj.AppName = AppName;
                                if (CarrierId == 'null') {
                                    obj.CarrierId = null;
                                } else {
                                    obj.CarrierId = CarrierId;
                                }
                                if (lst[i].SIMSerialnumber != null && lst[i].SIMSerialnumber != undefined && lst[i].SIMSerialnumber != '') {
                                    SimService.findOne({
                                        where: {
                                            SerialNum: lst[i].SIMSerialnumber.trim()
                                        }
                                    }).then(function(ExistSim) {
                                        if (ExistSim != null) {
                                            obj.idSim = ExistSim.id;
                                            GPSDevice.findOrCreate({
                                                where: { IMEI: obj.IMEI },
                                                defaults: obj
                                            }).then(function(response) {
                                                if ((response[1])) {
                                                    addDevice(i + 1);
                                                } else {
                                                    GPSDevice.update(obj, { where: { id: response[0].id } }).then(function(resUpdate) {
                                                        addDevice(i + 1);
                                                    });
                                                    // Importerror.push(lst[i].SerialNumber); 
                                                }
                                            })
                                        } else {
                                            var Simobj = new Object();
                                            Simobj.SerialNum = lst[i].SIMSerialnumber.trim();
                                            if (lst[i].SIMPhoneno != null && lst[i].SIMPhoneno != undefined) {
                                                Simobj.PhoneNum = lst[i].SIMPhoneno.trim();
                                            } else {
                                                Simobj.PhoneNum = null;
                                            }
                                            Simobj.CreatedDate = new Date();
                                            SimService.findOrCreate({
                                                where: {
                                                    SerialNum: lst[i].SIMSerialnumber
                                                },
                                                defaults: Simobj
                                            }).then(function(resSerial) {
                                                if ((resSerial[1])) {
                                                    obj.idSim = resSerial[0].dataValues.id;
                                                    GPSDevice.findOrCreate({
                                                        where: { IMEI: obj.IMEI },
                                                        defaults: obj
                                                    }).then(function(response) {
                                                        if ((response[1])) {
                                                            addDevice(i + 1);
                                                        } else {
                                                            // Importerror.push(lst[i].SerialNumber);
                                                            GPSDevice.update(obj, { where: { id: response[0].id } }).then(function(resUpdate) {
                                                                addDevice(i + 1);
                                                            });
                                                        }
                                                    })
                                                } else {
                                                    SimService.update(oSimobjbj, { where: { id: resSerial[0].id } }).then(function(resUpdateSim) {
                                                        obj.idSim = resSerial[0].id;
                                                        GPSDevice.findOrCreate({
                                                            where: { IMEI: obj.IMEI },
                                                            defaults: obj
                                                        }).then(function(response) {
                                                            if ((response[1])) {
                                                                addDevice(i + 1);
                                                            } else {
                                                                // Importerror.push(lst[i].SerialNumber);
                                                                GPSDevice.update(obj, { where: { id: response[0].id } }).then(function(resUpdate) {
                                                                    addDevice(i + 1);
                                                                });
                                                            }
                                                        })
                                                    });

                                                }
                                            })
                                        }

                                    })
                                } else {
                                    GPSDevice.findOrCreate({
                                        where: { IMEI: obj.IMEI },
                                        defaults: obj
                                    }).then(function(response) {
                                        if ((response[1])) {
                                            addDevice(i + 1);
                                        } else {
                                            // Importerror.push(lst[i].SerialNumber);
                                            GPSDevice.update(obj, { where: { id: response[0].id } }).then(function(resUpdate) {
                                                addDevice(i + 1);
                                            });
                                        }
                                    })
                                }
                            } else {
                                if (Importerror.length == 0) {
                                    res.json({
                                        success: true,
                                        message: "Excel File uploaded successfully..",
                                    });
                                } else {
                                    res.json({
                                        success: true,
                                        message: "Excel File uploaded successfully..Failed To Import : " + Importerror.length,
                                    });
                                }
                            }
                        }
                        addDevice(0)
                    } else {
                        res.json({
                            success: false,
                            message: "No Data in Excel File..",
                        });
                    }

                } else {
                    res.json({
                        success: false,
                        message: "Excel File is Not in Valid Format, You can Download Template for import Excel File.",
                    });
                }
            } else {
                res.json({
                    success: false,
                    message: "Error in Import , Excel File is Protected..",
                });
            }
        } else {
            res.json({
                success: false,
                message: "No File Found..",
            });
        };

    });
});

router.get('/DownloadTemplate', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'IMEI',
        type: 'string'
    }, {
        caption: 'SIMSerialnumber',
        type: 'string'
    }, {
        caption: 'SIMPhoneno',
        type: 'string'
    }, {
        caption: 'Version',
        type: 'string'
    }];


    var row = [];
    for (var i = 0; i < conf.cols.length; i++) {
        row.push('');
    };
    conf.rows = [];
    conf.rows.push(row);
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "TrackersManagement_Template.xlsx");
    res.end(result, 'binary');
})

router.get('/GetGPSDeviceByIMEI', function(req, res) {
    GPSDevice.belongsTo(SimService, {
        foreignKey: {
            name: 'idSim',
            allowNull: false
        }
    })
    GPSDevice.findOne({
        where: { IMEI: req.query.IMEI },
        include: [{
            model: SimService,
        }]
    }).then(function(response) {
        if (response != null) {
            res.json({ success: true, data: response });
        } else {
            res.json({ success: false, data: response });
        }
    }).catch(function(err) {
        res.json({ success: false, data: err });
    })
})

router.get('/GetSIMDetailBySerialNum', function(req, res) {
    SimService.findOne({ where: { SerialNum: req.query.SerialNum } }).then(function(response) {
        if (response != null) {
            GPSDevice.findOne({ where: { idSim: response.id } }).then(function(response1) {
                if (response1 != null) {
                    res.json({ success: false, message: 'SIM Is Already assigned.', data: 1 });
                } else {
                    res.json({ success: true, message: 'Success', data: response });
                }
            })
        } else {
            res.json({ success: false, message: 'Invalid Serial Number.', data: 0 });
        }
    }).catch(function(err) {
        res.json({ success: false, data: err });
    })
})

// router.post('/SaveSimServiceToIMEI', jsonParser, function(req, res) {
//     var objIMEI = req.body;
//     objHeader = req.headers;
//     var token = getToken(objHeader);
//     if (token) {
//         var decoded = jwt.decode(token, TokenKey);

//         objIMEI.CreatedDate = new Date();
//         objIMEI.CreatedBy = decoded.username;
//         if (objIMEI.IsNewSIM) {
//             SimService.create(objIMEI).then(function(response) {
//                 if (response) {
//                     objIMEI.idSim = response.id;
//                     if (objIMEI.IsNewIMEI) {
//                         GPSDevice.create(objIMEI).then(function(resIMEI) {
//                             if (resIMEI) {
//                                 res.json({ success: true, message: "SIM Serial Num Attached SuccessFully", data: resIMEI });
//                             } else {
//                                 res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: respose });
//                             }
//                         })
//                     } else {
//                         GPSDevice.findOne({ where: { IMEI: objIMEI.IMEI } }).then(function(objIMEIExist) {
//                             if (objIMEIExist != null) {
//                                 objIMEIExist.updateAttributes({ idSim: objIMEI.idSim, }).then(function(response) {
//                                     if (response) {
//                                         res.json({ success: true, message: "SIM Serial Num Attached SuccessFully..", data: response });
//                                     } else {
//                                         res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: resIMEI });
//                                     }
//                                 })
//                             }
//                         })
//                     }
//                 } else {
//                     res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: respose });
//                 }
//             })
//         } else {
//             if (objIMEI.IsNewIMEI) {
//                 GPSDevice.create(objIMEI).then(function(resIMEI) {
//                     if (resIMEI) {
//                         res.json({ success: true, message: "SIM Serial Num Attached SuccessFully", data: resIMEI });
//                     } else {
//                         res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: respose });
//                     }
//                 })
//             } else {
//                 GPSDevice.findOne({ where: { IMEI: objIMEI.IMEI } }).then(function(objIMEIExist) {
//                     if (objIMEIExist != null) {
//                         objIMEIExist.updateAttributes({ idSim: objIMEI.idSim, }).then(function(response) {
//                             if (response) {
//                                 res.json({ success: true, message: "SIM Serial Num Attached SuccessFully..", data: response });
//                             } else {
//                                 res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: resIMEI });
//                             }
//                         })
//                     }
//                 });
//             }
//         }
//     } else {
//         res.json(InvalidToken);
//     }
// })

router.post('/SaveSimServiceToIMEI', jsonParser, function(req, res) {
    var objIMEI = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);

        objIMEI.CreatedDate = new Date();
        objIMEI.CreatedBy = decoded.username;


        if (objIMEI.IsIMEI && objIMEI.IsSim) {
            if (objIMEI.IsNewSIM) {
                SimService.create(objIMEI).then(function(response) {
                    if (response) {
                        objIMEI.idSim = response.id;
                        if (objIMEI.IsNewIMEI) {
                            GPSDevice.create(objIMEI).then(function(resIMEI) {
                                if (resIMEI) {
                                    res.json({ success: true, message: "SIM Serial Num and IMEI Num Attached SuccessFully", data: resIMEI });
                                } else {
                                    res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: respose });
                                }
                            })
                        } else {
                            GPSDevice.findOne({ where: { IMEI: objIMEI.IMEI } }).then(function(objIMEIExist) {
                                if (objIMEIExist != null) {
                                    objIMEIExist.updateAttributes({ idSim: objIMEI.idSim, Type: objIMEI.Type, AppName: objIMEI.AppName }).then(function(response) {
                                        if (response) {
                                            res.json({ success: true, message: "SIM Serial Num and IMEI Num Attached SuccessFully..", data: response });
                                        } else {
                                            res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: resIMEI });
                                        }
                                    })
                                } else {
                                    res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: objIMEIExist });
                                }
                            })
                        }
                    } else {
                        res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: respose });
                    }
                })
            } else {
                SimService.findOne({ where: { SerialNum: objIMEI.SerialNum } }).then(function(objSimExist) {
                    if (objSimExist != null) {
                        objSimExist.updateAttributes({ PhoneNum: objIMEI.PhoneNum, idTelCo: objIMEI.idTelCo }).then(function(response) {
                            if (objIMEI.IsNewIMEI) {
                                GPSDevice.create(objIMEI).then(function(resIMEI) {
                                    if (resIMEI) {
                                        res.json({ success: true, message: "SIM Serial Num and IMEI Num Attached SuccessFully", data: resIMEI });
                                    } else {
                                        res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: respose });
                                    }
                                })
                            } else {
                                GPSDevice.findOne({ where: { IMEI: objIMEI.IMEI } }).then(function(objIMEIExist) {
                                    if (objIMEIExist != null) {
                                        objIMEIExist.updateAttributes({ idSim: objIMEI.idSim, Type: objIMEI.Type, AppName: objIMEI.AppName }).then(function(response) {
                                            if (response) {
                                                res.json({ success: true, message: "SIM Serial Num and IMEI Num Attached SuccessFully..", data: response });
                                            } else {
                                                res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: resIMEI });
                                            }
                                        })
                                    } else {
                                        res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: objIMEIExist });
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: objSimExist });
                    }
                });
            }
        } else if (objIMEI.IsIMEI) {
            if (objIMEI.IsNewIMEI) {
                GPSDevice.create(objIMEI).then(function(resIMEI) {
                    if (resIMEI) {
                        res.json({ success: true, message: "IMEI Num Created SuccessFully", data: resIMEI });
                    } else {
                        res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: respose });
                    }
                })
            } else {
                GPSDevice.findOne({ where: { IMEI: objIMEI.IMEI } }).then(function(objIMEIExist) {
                    if (objIMEIExist != null) {
                        objIMEIExist.updateAttributes({ idSim: objIMEI.idSim, Type: objIMEI.Type, AppName: objIMEI.AppName }).then(function(response) {
                            if (response) {
                                res.json({ success: true, message: "IMEI Num Updated SuccessFully..", data: response });
                            } else {
                                res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: resIMEI });
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: objIMEIExist });
                    }
                });
            }
        } else if (objIMEI.IsSim) {
            if (objIMEI.IsNewSIM) {
                SimService.create(objIMEI).then(function(resIMEI) {
                    if (resIMEI) {
                        res.json({ success: true, message: "SIM Serial Num Created SuccessFully", data: resIMEI });
                    } else {
                        res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: respose });
                    }
                })
            } else {
                SimService.findOne({ where: { SerialNum: objIMEI.SerialNum } }).then(function(objSimExist) {
                    if (objSimExist != null) {
                        objSimExist.updateAttributes({ PhoneNum: objIMEI.PhoneNum, idTelCo: objIMEI.idTelCo }).then(function(response) {
                            if (response) {
                                res.json({ success: true, message: "SIM Serial Num Updated SuccessFully..", data: response });
                            } else {
                                res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: resIMEI });
                            }
                        });
                    } else {
                        res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: respose });
                    }
                });
            }
        } else {
            res.json({ success: false, message: "Something Went wrong Please Try Again Later..", data: null });
        }


    } else {
        res.json(InvalidToken);
    }
})

module.exports = router