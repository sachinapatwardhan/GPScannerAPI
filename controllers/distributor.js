var router = express.Router();

//Gps Tracker
// --------------------------------------Get All Gps Device From Distributor-----------------------------------

router.get('/GetAllGPSDeviceForDistributor', function(req, res) {
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
        search = search + 'tblgpsdevice.AppName like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.Company like "%' + objSearch + '%") ';
    };
    if (objParam.UserId != null && objParam.UserId != undefined && objParam.UserId != '') {
        if (search != "") {
            search += " and tbldeviceagentretailer.idDistributor =" + objParam.UserId;
        } else {
            search += " Where tbldeviceagentretailer.idDistributor =" + objParam.UserId;
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
        " Inner Join tbldeviceagentretailer on tbldeviceagentretailer.DeviceId = tblgpsdevice.DeviceId" +
        " Left Join tbluserinformation on tbldeviceagentretailer.idDistributor=tbluserinformation.id " +
        " Left Join tblsimdetails on tblsimdetails.id = tblgpsdevice.idSim" +
        " Left Join tblcountrymgmt on tblcountrymgmt.id = tblgpsdevice.CountryId" +
        " Left Join tbltelco on tblsimdetails.idTelCo = tbltelco.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);

    var Countqry = "SELECT count(tblgpsdevice.id) as TotalRecord " +
        " from tblgpsdevice " +
        " Inner Join tbldeviceagentretailer on tbldeviceagentretailer.DeviceId = tblgpsdevice.DeviceId" +
        " Left Join tbluserinformation on  tbldeviceagentretailer.idDistributor=tbluserinformation.id " +
        " Left Join tblsimdetails on tblsimdetails.id = tblgpsdevice.idSim" +
        " Left Join tblcountrymgmt on tblcountrymgmt.id = tblgpsdevice.CountryId" +
        " Left Join tbltelco on tblsimdetails.idTelCo = tbltelco.id " + search;
    // " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    connection.query(query, function(err, response) {
        if (response != undefined) {
            connection.query(Countqry, function(err, lstCount, fields) {
                console.log(err)
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

// --------------------------------------Export Gps Device From Distributor-----------------------------------
router.get('/ExportTrackerForDistributor', function(req, res) {
    var objParam = req.query;
    var conf = {};
    conf.name = "Sheet1";
    var UserRoles = objParam.UserRoles;
    conf.cols = [];
    conf.cols.push({
        caption: 'Device Id',
        type: 'string'
    });

    if (objParam.AppName == 'DoTrack' || UserRoles == 'Super Admin') {
        conf.cols.push({
            caption: 'Company',
            type: 'string'
        });
    }

    conf.cols.push({
        caption: 'Type',
        type: 'string'
    });

    conf.cols.push({
        caption: 'IMEI',
        type: 'string'
    });

    conf.cols.push({
        caption: 'Version',
        type: 'string'
    });

    conf.cols.push({
        caption: 'SIM Serial Number',
        type: 'string'
    });

    conf.cols.push({
        caption: 'SIM Phone Number',
        type: 'string'
    });

    conf.cols.push({
        caption: 'Tel Company',
        type: 'string'
    });

    conf.cols.push({
        caption: 'Country',
        type: 'string'
    });

    if (UserRoles == 'Super Admin') {

        conf.cols.push({
            caption: 'App Type',
            type: 'string'
        });
    }

    conf.cols.push({
        caption: 'Expiry Date',
        type: 'string'
    });

    conf.cols.push({
        caption: 'Date',
        type: 'string'
    });

    conf.cols.push({
        caption: 'Created By',
        type: 'string'
    });

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
        search = search + 'tblgpsdevice.Company like "%' + objSearch + '%") ';
    };

    if (objParam.UserId != null && objParam.UserId != undefined && objParam.UserId != '') {
        if (search != "") {
            search += " and tbldeviceagentretailer.idDistributor =" + objParam.UserId;
        } else {
            search += " Where tbldeviceagentretailer.idDistributor =" + objParam.UserId;
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
        " Inner Join tbldeviceagentretailer on tbldeviceagentretailer.DeviceId = tblgpsdevice.DeviceId" +
        " Left Join tbluserinformation on tbldeviceagentretailer.idDistributor=tbluserinformation.id " +
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
                var Company = '';
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

                if (response[i].Company != null && response[i].Company != '' && response[i].Company != undefined) {
                    Company = response[i].Company;
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
                    row.push(DeviceId, Company, Type, IMEI, Version, SimSerialNum, SimPhoneNum, TelCompany, Country, AppName, ExpiryDate, Date, CreatedBy);
                    conf.rows.push(row);
                } else {
                    if (objParam.AppName == 'DoTrack') {
                        row.push(DeviceId, Company, Type, IMEI, Version, SimSerialNum, SimPhoneNum, TelCompany, Country, ExpiryDate, Date, CreatedBy);
                    } else {
                        row.push(DeviceId, Type, IMEI, Version, SimSerialNum, SimPhoneNum, TelCompany, Country, ExpiryDate, Date, CreatedBy);
                    }

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


//-------------------------------------Distributor Customer--------------------------------------------------
router.get('/GetAllDynamicOwnerCustomerForDistributor', function(req, res) {
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
    var SearchForDeviceCount = '';
    if (objParam.UserId != null && objParam.UserId != undefined && objParam.UserId != '') {
        if (search != "") {
            search += " and tbldeviceagentretailer.idDistributor =" + objParam.UserId;
        } else {
            search += " Where tbldeviceagentretailer.idDistributor =" + objParam.UserId;
        }
        SearchForDeviceCount += " AND tbldeviceagentretailer.idDistributor =" + objParam.UserId;
    }
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
            "(select count(tblvehicle.deviceid) from tblvehicle INNER JOIN tbldeviceagentretailer ON tbldeviceagentretailer.deviceId = tblvehicle.deviceid where iduser = tbluserinformation.id and tblvehicle.IsDelete=0 and tblvehicle.deviceid !='' " + SearchForDeviceCount + " ) as TotalDevice " +
            "from tbluserinformation INNER join tblvehicle on tblvehicle.iduser = tbluserinformation.id  INNER join tbldeviceagentretailer on tbldeviceagentretailer.deviceId = tblvehicle.deviceid left join tblappinfo on tbluserinformation.idApp = tblappinfo.id   inner join tbluserinrole on tbluserinformation.id=tbluserinrole.userId inner join tblrole on tblrole.id=tbluserinrole.roleId and tblrole.RoleName='User' " + search +
            " group by tbluserinformation.id " +
            " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start) + ";";
    } else {
        var query = "select SQL_CALC_FOUND_ROWS tbluserinformation.CreatedDate, tblappinfo.AppName,tbluserinformation.id,tbluserinformation.username,tbluserinformation.idApp,tbluserinformation.email,tbluserinformation.phone,tbluserinformation.country,tbluserinformation.OTP,tbluserinformation.IsMobileVerify,CONVERT_TZ(tbluserinformation.LastLogin,'+00:00','" + CurrentOffset + "') as LastLogin, " +
            "(select count(tblvehicle.deviceid) from tblvehicle INNER JOIN tbldeviceagentretailer ON tbldeviceagentretailer.deviceId = tblvehicle.deviceid where iduser = tbluserinformation.id and tblvehicle.IsDelete=0 and tblvehicle.deviceid !='' " + SearchForDeviceCount + " ) as TotalDevice " +
            "from tbluserinformation INNER join tblvehicle on tblvehicle.iduser = tbluserinformation.id  INNER join tbldeviceagentretailer on tbldeviceagentretailer.deviceId = tblvehicle.deviceid left join tblappinfo on tbluserinformation.idApp = tblappinfo.id  " + search +
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

//----------------------------------------Distributor Vehicles--------------------------------------------------
router.get('/GetAllDynamicVehicleForDistibutor', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;

    var AdvanceSearch = objParam.AdvanceSearch;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        search = 'Where (vehicle.Name like "%' + objSearch + '%" or ';
        search = search + 'user.username like "%' + objSearch + '%" or ';
        search = search + 'vehicle.deviceid like "%' + objSearch + '%" or ';
        search = search + 'vehicle.BatteryPercentage like "%' + objSearch + '%" or ';
        search = search + 'vehicle.HandshakDatetime like "%' + objSearch + '%" or ';
        search = search + 'vehicle.DeviceType like "%' + objSearch + '%" or ';
        search = search + 'vehicletype.Type like "%' + objSearch + '%" or ';
        search = search + 'vehicle.IsOnline like "%' + objSearch + '%") ';
    }

    if (objParam.UserId != null && objParam.UserId != '' && objParam.UserId != undefined) {
        if (search != "") {
            search += ' and der.idDistributor = ' + objParam.UserId;
        } else {
            search += ' where der.idDistributor = ' + objParam.UserId;
        }
    }

    if (search != "") {
        search += ' and vehicle.IsDelete = 0 ';
    } else {
        search += ' where vehicle.IsDelete = 0 ';
    }
    if (objParam.appId != null && objParam.appId != '' && objParam.appId != undefined) {
        if (search != "") {
            search += ' and user.idApp =' + objParam.appId;
        } else {
            search += ' Where user.idApp =' + objParam.appId;
        }
    }
    var AdvanceSearch = objParam.AdvanceSearch;
    if (AdvanceSearch != null && AdvanceSearch != '' && AdvanceSearch != undefined) {
        if (AdvanceSearch.idType != '' && AdvanceSearch.idType != undefined && AdvanceSearch.idType != '') {
            search += " and vehicle.idType=" + AdvanceSearch.idType;
        }
        if (AdvanceSearch.StartDate != '' && AdvanceSearch.EndDate == '') {
            search += " and Date(vehicle.renewaldate)>='" + ConvertDateFormat(new Date(AdvanceSearch.StartDate)) + "'";
        }
        if (AdvanceSearch.StartDate == '' && AdvanceSearch.EndDate != '') {
            search += " and Date(vehicle.renewaldate)<'" + ConvertDateFormat(new Date(AdvanceSearch.EndDate)) + "'";
        }
        if (AdvanceSearch.StartDate != '' && AdvanceSearch.EndDate != '') {
            search += " and Date(vehicle.renewaldate)>='" + ConvertDateFormat(new Date(AdvanceSearch.StartDate)) + "' and Date(vehicle.renewaldate) <= '" + ConvertDateFormat(new Date(AdvanceSearch.EndDate)) + "'";
        }
        if (AdvanceSearch.IsOnline != '' && AdvanceSearch.IsOnline != '') {
            search += " and vehicle.IsOnline =" + AdvanceSearch.IsOnline;
        }
    }

    // console.log(search)
    var qry = "Select vehicle.*,vehicletype.Type,gpsdevice.IMEI,CONVERT_TZ(vehicle.HandshakDatetime,'+00:00','" + CurrentOffset + "') as DisplyHandshakDate, CONVERT_TZ(vehicle.renewaldate,'+00:00','" + CurrentOffset + "') as Displyrenewaldate,  " +
        "user.username AS username " +
        "FROM tblvehicle AS vehicle " +
        " INNER JOIN tbldeviceagentretailer AS der ON  der.deviceId = vehicle.deviceid" +
        " left join tblvehicletype  as vehicletype on vehicletype.id = vehicle.idType " +
        " left join tblgpsdevice as gpsdevice on gpsdevice.DeviceId =vehicle.deviceid " +
        " LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    // var Countqry = "SELECT count(vehicle.id) as TotalRecord " +
    //     "FROM tblvehicle AS vehicle " +
    //     "LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search;
    var Countqry = "SELECT count(vehicle.id) as TotalRecord " +
        "FROM tblvehicle AS vehicle " +
        " INNER JOIN tbldeviceagentretailer AS der ON  der.deviceId = vehicle.deviceid" +
        " left join tblvehicletype  as vehicletype on vehicletype.id = vehicle.idType " +
        " left join tblgpsdevice as gpsdevice on gpsdevice.DeviceId =vehicle.deviceid " +
        " LEFT JOIN tbluserinformation AS user ON vehicle.iduser = user.id " + search;

    connection.query(qry, function(err, response) {
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
});

router.get('/GetAllVehicleByUserForDistibutor', function(req, res) {
    if (req.query.iduser != null || req.query.iduser != undefined) {
        var search = "";
        if (search != "") {
            search += " and dar.idDistributor = " + req.query.DistibutorId;
        } else {
            search = " Where dar.idDistributor = " + req.query.DistibutorId;
        }

        if (search != "") {
            search += " and tv.iduser = " + req.query.iduser;
        } else {
            search = " Where tv.iduser = " + req.query.iduser;
        }


        if (search != "") {
            search += " and tv.IsDelete = 0 and tv.deviceid != '' ";
        } else {
            search = " Where tv.IsDelete = 0 and tv.deviceid != '' ";
        }

        var query = "SELECT tv.*, CONVERT_TZ(tgd.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate FROM tblvehicle as tv INNER JOIN tbldeviceagentretailer as dar ON dar.deviceId = tv.deviceid LEFT JOIN tblgpsdevice as tgd ON tgd.DeviceId = tv.deviceid " + search;
        connection.query(query, function(err, response) {
            if (response != undefined) {
                res.json(response);
            } else {
                res.json(err);
            }
        });

    } else {
        res.json(RecordNotFound);
    }

})
module.exports = router