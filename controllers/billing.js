var router = express.Router();

var User = models.tbluserinformation;
var OrderService = models.tblorderservice;
var OrderServiceDetail = models.tblorderserviceitem;
var OrderServiceStatus = models.tblorderservicestatus;
var LicenceManager = models.tbllicencemanager;
var Vehicle = models.tblvehicle;
var Setting = models.tblsetting;
var SystemEmail = models.tblemailsettingsys;
var EmailTemplate = models.tblemailtemplate;
var Commonfunction = require('./common.js');
var WebCashconfig = require('./../config/webcash.json');
var SimDetail = models.tblsimdetails;
var GPSDevice = models.tblgpsdevice;
var DeviceAgentRetailer = models.tbldeviceagentretailer;
var Database = require('./../connection/DatabaseConnection.js');
var DBConnection = new Database();
var RenewTransaction = models.tblrenewtransaction;
//////////


router.get('/GetAllSalesAgentRole', function (req, res) {
    var objParam = req.query;
    var search = '';
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

    var query = "select tbluserinformation.CreatedDate, tblappinfo.AppName,tbluserinformation.id,tbluserinformation.username,tbluserinformation.idApp,tbluserinformation.email,tbluserinformation.phone,tbluserinformation.country,tbluserinformation.OTP,tbluserinformation.IsMobileVerify,CONVERT_TZ(tbluserinformation.LastLogin,'+00:00','" + CurrentOffset + "') as LastLogin " +
        "from tbluserinformation left join tblappinfo on tbluserinformation.idApp = tblappinfo.id " +
        " inner join tbluserinrole on tbluserinrole.userId = tbluserinformation.Id " +
        " inner join tblrole on tblrole.Id = tbluserinrole.roleId " + search + " ";


    connection.query(query, function (err, response) {
        if (response != undefined) {
            var response1 = new Object();
            response1.success = true
            response1.data = response;
            res.json(response1);
        } else {
            var response1 = new Object();
            response1.success = true
            response1.data = [];
            res.json(response1);
        }
    })


})

router.get('/GetAllRenewData', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != null && objSearch != '') {
        search += ' and (tl.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tl.ExpiryDate like "%' + objSearch + '%" or ';
        search = search + 'tu.email like "%' + objSearch + '%" or ';
        search = search + 'tu.phone like "%' + objSearch + '%" or ';
        search = search + 'ta.AppName like "%' + objSearch + '%" or ';
        search = search + 'tl.LicenceType like "%' + objSearch + '%" or ';
        search = search + 'tl.LicenceRenewalType like "%' + objSearch + '%" or ';
        search = search + 'ts.Status like "%' + objSearch + '%" or ';
        search = search + 'tv.Name like "%' + objSearch + '%") ';
    };

    if (req.query.StartDate != '' && req.query.EndDate != '') {
        if (search == '') {
            search += " AND tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
        } else {
            search += search + " AND   tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
        }
    } else if (req.query.StartDate != null && req.query.StartDate != '' && req.query.StartDate != undefined) {
        if (search == '') {
            search += " AND  tl.ExpiryDate >= '" + convertdateformat(req.query.StartDate, 3) + "'";
        } else {
            search += " AND tl.ExpiryDate >= '" + convertdateformat(req.query.StartDate, 3) + "'";
        }
    } else if (req.query.EndDate != null && req.query.EndDate != '' && req.query.EndDate != undefined) {
        if (search == '') {
            search += " AND tl.ExpiryDate <= '" + convertdateformat(req.query.EndDate, 3) + "'";
        } else {
            search += " AND tl.ExpiryDate <= '" + convertdateformat(req.query.EndDate, 3) + "'";
        }
    }

    if (req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != '') {
        search += " and ta.Id=" + req.query.idApp + " ";
    }
    if (objParam.idDistributor != null && objParam.idDistributor != '' && objParam.idDistributor != undefined) {
        search += ' and dar.idDistributor = ' + objParam.idDistributor;
    }
    if (objParam.idCountry != null && objParam.idCountry != '' && objParam.idCountry != undefined) {
        search += ' and tblgpsdevice.CountryId = ' + objParam.idCountry;
    }
    if (objParam.idSalesAgent != null && objParam.idSalesAgent != '' && objParam.idSalesAgent != undefined) {
        search += ' and (tblgpsdevice.idSalesAgent = ' + objParam.idSalesAgent + ' or dar.agentId=' + objParam.idSalesAgent + ')';
    }
    var query = "SELECT ts.Status,tl.Id, tu.email,CONVERT_TZ(tu.LastLogin,'+00:00','" + CurrentOffset + "') as LastLoginDate ,tl.DeviceId,tv.iduser,tu.phone,tv.Name as VehicleName,ta.Id as idApp,ta.AppName,tl.LicenceRenewalType,tl.LicenceType,ta.LicenceRenewalType as appLicenceRenewalType,ta.LicenceType as appLicenceType, " +
        "CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " INNER JOIN (Select * from tblvehicle where IsDelete=0) tv on tv.deviceid =tl.DeviceId " +
        " INNER JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
        " LEFT JOIN tbldeviceagentretailer AS dar ON  dar.deviceId = tv.deviceid " +
        " LEFT JOIN tblgpsdevice ON tblgpsdevice.DeviceId = tv.deviceid " +
        " LEFT JOIN tblsimdetails AS ts ON  ts.id = tblgpsdevice.idSim " +
        " where tl.IsDeleted=0  " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var countquery = "SELECT count(*) as TotalRecord " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " INNER JOIN (Select * from tblvehicle where IsDelete=0)  tv on tv.deviceid =tl.DeviceId " +
        " INNER JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
        " LEFT JOIN tbldeviceagentretailer AS dar ON  dar.deviceId = tv.deviceid " +
        " LEFT JOIN tblgpsdevice ON tblgpsdevice.DeviceId = tv.deviceid " +
        " LEFT JOIN tblsimdetails AS ts ON  ts.id = tblgpsdevice.idSim " +
        " where tl.IsDeleted=0 " + search;
    console.log(countquery)

    connection.query(query, function (err, response) {
        if (response != undefined) {
            connection.query(countquery, function (err, lstCount, fields) {
                var lstAllVehicle = [];
                function getData(i) {
                    if (i < response.length) {
                        var obj = new Object();
                        obj.Id = response[i].Id;
                        obj.email = response[i].email;
                        obj.LastLoginDate = response[i].LastLoginDate;
                        obj.DeviceId = response[i].DeviceId;
                        obj.iduser = response[i].iduser;
                        obj.phone = response[i].phone;
                        obj.VehicleName = response[i].VehicleName;
                        obj.idApp = response[i].idApp;
                        obj.AppName = response[i].AppName;
                        obj.LicenceRenewalType = response[i].LicenceRenewalType;
                        obj.LicenceType = response[i].LicenceType;
                        obj.appLicenceRenewalType = response[i].appLicenceRenewalType;
                        obj.appLicenceType = response[i].appLicenceType;
                        obj.ExpiryDate = response[i].ExpiryDate;
                        obj.Status = response[i].Status;
                        client.get(response[i].DeviceId, function (err, strgpsdata) {
                            if (!err) {
                                if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                    var objgps = JSON.parse(strgpsdata);
                                    obj.GpsDate = objgps.Date;
                                } else {
                                    obj.GpsDate = null;
                                }
                            } else {
                                obj.GpsDate = null;
                            }
                            lstAllVehicle.push(obj);
                            getData(i + 1);
                        });
                    }
                    else {
                        var response1 = new Object();
                        response1.draw = objParam.draw;
                        response1.recordsTotal = lstCount[0].TotalRecord;
                        response1.recordsFiltered = lstCount[0].TotalRecord;
                        response1.data = lstAllVehicle;
                        res.json(response1);
                    }
                }
                getData(0);
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



router.get('/ExportAllRenewData', function (req, res) {

    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'Device ID',
        type: 'string'
    },
    {
        caption: 'User Email',
        type: 'string'
    }, {
        caption: 'Contact No',
        type: 'string'
    }, {
        caption: 'Expiry Date',
        type: 'string'
    }, {
        caption: 'Days Left',
        type: 'string'
    },
    {
        caption: 'Licence Type',
        type: 'string'
    },
    {
        caption: 'Renewal Type',
        type: 'string'
    },
    {
        caption: 'App Name',
        type: 'string'
    }, {
        caption: 'Last Login Date',
        type: 'string'
    },
    {
        caption: 'Last GPS Date',
        type: 'string'
    }, {
        caption: 'Sim Status',
        type: 'string'
    },
    ];
    conf.rows = [];
    var objParam = req.query;
    objParam.CurrentOffset = decodeURIComponent(objParam.CurrentOffset);
    var objColumns = JSON.parse(objParam.columns);
    var objOrder = JSON.parse(objParam.order);
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != null && objSearch != '') {
        search += ' and (tl.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tl.ExpiryDate like "%' + objSearch + '%" or ';
        search = search + 'tu.email like "%' + objSearch + '%" or ';
        search = search + 'tu.phone like "%' + objSearch + '%" or ';
        search = search + 'ta.AppName like "%' + objSearch + '%" or ';
        search = search + 'tl.LicenceType like "%' + objSearch + '%" or ';
        search = search + 'tl.LicenceRenewalType like "%' + objSearch + '%" or ';
        search = search + 'ts.Status like "%' + objSearch + '%" or ';
        search = search + 'tv.Name like "%' + objSearch + '%") ';
    };


    if (req.query.StartDate != '' && req.query.EndDate != '') {
        if (search == '') {
            search += " AND tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
        } else {
            search += search + " AND   tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
        }
    } else if (req.query.StartDate != null && req.query.StartDate != '' && req.query.StartDate != undefined) {
        if (search == '') {
            search += " AND  tl.ExpiryDate >= '" + convertdateformat(req.query.StartDate, 3) + "'";
        } else {
            search += " AND tl.ExpiryDate >= '" + convertdateformat(req.query.StartDate, 3) + "'";
        }
    } else if (req.query.EndDate != null && req.query.EndDate != '' && req.query.EndDate != undefined) {
        if (search == '') {
            search += " AND tl.ExpiryDate <= '" + convertdateformat(req.query.EndDate, 3) + "'";
        } else {
            search += " AND tl.ExpiryDate <= '" + convertdateformat(req.query.EndDate, 3) + "'";
        }
    }

    if (req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != '' && req.query.idApp != 'undefined') {
        search += " and ta.Id=" + req.query.idApp + " ";
    }
    if (objParam.idDistributor != null && objParam.idDistributor != '' && objParam.idDistributor != undefined) {
        search += ' and dar.idDistributor = ' + objParam.idDistributor;
    }
    if (objParam.idCountry != null && objParam.idCountry != '' && objParam.idCountry != undefined) {
        search += ' and tblgpsdevice.CountryId = ' + objParam.idCountry;
    }
    if (objParam.idSalesAgent != null && objParam.idSalesAgent != '' && objParam.idSalesAgent != undefined) {
        search += ' and tblgpsdevice.idSalesAgent = ' + objParam.idSalesAgent;
    }
    objParam.CurrentOffset = decodeURIComponent(objParam.CurrentOffset);
    var query = "SELECT ts.Status,tl.Id, tu.email,CONVERT_TZ(tu.LastLogin,'+00:00','" + objParam.CurrentOffset + "') as LastLoginDate ,tl.DeviceId,tv.iduser,tu.phone,tv.Name as VehicleName,ta.Id as idApp,ta.AppName,tl.LicenceRenewalType,tl.LicenceType,ta.LicenceRenewalType as appLicenceRenewalType,ta.LicenceType as appLicenceType, " +
        "CONVERT_TZ(tl.ExpiryDate,'+00:00','" + objParam.CurrentOffset + "') as ExpiryDate " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " INNER JOIN (Select * from tblvehicle where IsDelete=0) tv on tv.deviceid =tl.DeviceId " +
        " INNER JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
        " LEFT JOIN tbldeviceagentretailer AS dar ON  dar.deviceId = tv.deviceid " +
        " LEFT JOIN tblgpsdevice ON tblgpsdevice.DeviceId = tl.DeviceId " +
        " LEFT JOIN tblsimdetails AS ts ON  ts.id = tblgpsdevice.idSim " +
        " where tl.IsDeleted=0  " + search +
        " order by " + Orderby + " ";

    connection.query(query, function (err, response, fields) {
        if (!err) {
            if (objParam.IsSuperAdmin == "0") {
                conf.cols.splice(8, 1);
            }
            var lstAllVehicle = [];
            function getData(i) {
                if (i < response.length) {
                    var obj = new Object();
                    obj.Id = response[i].Id;
                    obj.email = response[i].email;
                    obj.LastLoginDate = response[i].LastLoginDate;
                    obj.DeviceId = response[i].DeviceId;
                    obj.iduser = response[i].iduser;
                    obj.phone = response[i].phone;
                    obj.VehicleName = response[i].VehicleName;
                    obj.idApp = response[i].idApp;
                    obj.AppName = response[i].AppName;
                    obj.LicenceRenewalType = response[i].LicenceRenewalType;
                    obj.LicenceType = response[i].LicenceType;
                    obj.appLicenceRenewalType = response[i].appLicenceRenewalType;
                    obj.appLicenceType = response[i].appLicenceType;
                    obj.ExpiryDate = response[i].ExpiryDate;
                    obj.Status = response[i].Status;
                    client.get(response[i].DeviceId, function (err, strgpsdata) {
                        if (!err) {
                            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                var objgps = JSON.parse(strgpsdata);
                                obj.GpsDate = objgps.Date;
                            } else {
                                obj.GpsDate = null;
                            }
                        } else {
                            obj.GpsDate = null;
                        }
                        lstAllVehicle.push(obj);

                        getData(i + 1);
                    });
                }
                else {
                    for (var i = 0; i < lstAllVehicle.length; i++) {
                        var row = [];
                        if (objParam.IsSuperAdmin == "1") {
                            row.push(lstAllVehicle[i].DeviceId, lstAllVehicle[i].email, lstAllVehicle[i].phone, dateFormat1(lstAllVehicle[i].ExpiryDate), daysHtml(lstAllVehicle[i]), lstAllVehicle[i].LicenceType, lstAllVehicle[i].LicenceRenewalType, lstAllVehicle[i].AppName, dateFormat(lstAllVehicle[i].LastLoginDate), gpsdateFormat(lstAllVehicle[i].GpsDate), lstAllVehicle[i].Status);
                        }
                        else {
                            row.push(lstAllVehicle[i].DeviceId, lstAllVehicle[i].email, lstAllVehicle[i].phone, dateFormat1(lstAllVehicle[i].ExpiryDate), daysHtml(lstAllVehicle[i]), lstAllVehicle[i].LicenceType, lstAllVehicle[i].LicenceRenewalType, dateFormat(lstAllVehicle[i].LastLoginDate), gpsdateFormat(lstAllVehicle[i].GpsDate), lstAllVehicle[i].Status);
                        }
                        conf.rows.push(row);
                    }
                    var result = nodeExcel.execute(conf);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader("Content-Disposition", "attachment; filename=Renew.xlsx");
                    res.end(result, 'binary');
                    function daysHtml(full) {
                        var days = '';
                        if (full.ExpiryDate != null && full.ExpiryDate != '') {
                            var timeDiff = (new Date(full.ExpiryDate)).getTime() - (new Date()).getTime();
                            var diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
                            days = diffDays + ' days';

                        }
                        return days;
                    }

                    function dateFormat1(date) {
                        if (date != null) {
                            // return moment.utc(date).utcOffset(objParam.CurrentOffset).format('DD-MM-YYYY');
                            return moment(moment.utc(date).toDate()).format("DD-MM-YYYY");
                        } else {
                            return 'N/A';
                        }
                    }
                    function dateFormat(date) {
                        if (date != null) {
                            // return moment.utc(date).utcOffset(objParam.CurrentOffset).format('DD-MM-YYYY hh:mm:ss a');
                            return moment(moment.utc(date).toDate()).format("DD-MM-YYYY hh:mm:ss a");
                        } else {
                            return 'N/A';
                        }
                    }

                    function gpsdateFormat(date) {
                        if (date != null) {
                            return moment.utc(moment.utc(date * 1000).toDate()).utcOffset(objParam.CurrentOffset).format("DD-MM-YYYY hh:mm:ss A")
                        } else {
                            return 'N/A';
                        }
                    }
                }
            }
            getData(0);
        }
        else {
            var result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=Renew.xlsx");
            res.end(result, 'binary');
        }
    });
})


// Billing API start
router.get('/GetAllVehicleExpirebyUser', jsonParser, function (req, res) {

    var query = "SELECT tv.id,tv.Name,tv.deviceid,tv.renewaldate,tl.LicenceRenewalType,tl.LicenceType,tl.id as LicenceId,tl.LicenceNo " +
        "FROM tblvehicle tv " +
        "left join tbllicencemanager tl on tv.deviceid=tl.DeviceId and tl.IsDeleted=false " +
        "where tv.iduser=" + req.query.idUser + " and tv.IsDelete=false;";
    connection.query(query, function (err, rows, fields) {
        if (!err) {
            var lstAllVehicle = [];
            var lstDevice = [];
            function getData(i) {
                if (i < rows.length) {
                    var obj = new Object();
                    obj.id = rows[i].id;
                    obj.Name = rows[i].Name;
                    obj.deviceid = rows[i].deviceid;
                    obj.renewaldate = rows[i].renewaldate;
                    obj.LicenceRenewalType = rows[i].LicenceRenewalType;
                    obj.LicenceType = rows[i].LicenceType;
                    obj.LicenceId = rows[i].LicenceId;
                    obj.LicenceNo = rows[i].LicenceNo;
                    lstDevice.push(rows[i].deviceid);
                    client.get(rows[i].deviceid, function (err, strgpsdata) {
                        if (!err) {
                            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                var objgps = JSON.parse(strgpsdata);
                                obj.GpsDate = objgps.Date;
                            } else {
                                obj.GpsDate = null;
                            }
                        } else {
                            obj.GpsDate = null;
                        }
                        lstAllVehicle.push(obj);
                        getData(i + 1);
                    });
                }
                else {
                    GetDevicePricebyDeviceIds(lstAllVehicle, lstDevice).then(function (lstfinaldata) {
                        res.json(lstfinaldata.lstProduct);
                    });
                }
            }
            getData(0);
        } else {
            res.json([]);
        }
    })
})

router.get('/GetPriceByApp', jsonParser, function (req, res) {

    var query = "SELECT p.Id,p.ProductTypeId,p.Name,p.Sku as LicenceType,pam.ProductAttributeId,pa.Name as CountryName,pav.Name as LicenceRenewalType,pav.PriceAdjustment as Price " +
        "FROM product p  " +
        "inner join product_productattribute_mapping pam on p.Id = pam.ProductId  " +
        "inner join productattribute pa on pa.Id = pam.ProductAttributeId   " +
        "inner join tbluserinformation tu on pa.Name= tu.country and tu.id=" + req.query.idUser + " " +
        "inner join productattributevalue pav on pav.ProductAttributeMappingId=pam.Id " +
        "where p.ProductTypeId=" + req.query.idApp + " and p.Name='Licence Renew'";
    connection.query(query, function (err, lstAllPrice, fields) {
        if (!err) {
            res.json(lstAllPrice);
        } else {
            res.json([]);
        }
    })
})

router.post('/SaveOrderService', jsonParser, function (req, res) {
    objOrderservice = req.body;
    objHeader = req.headers;
    var OrderTotal = 0;
    var DeviceId = ''
    var lstProduct = objOrderservice.lstProduct;
    var lstLicenceId = [];
    var lstDeviceId = [];
    var lstGpsDeviceCheck = [];
    var SalesAgentId = null;
    var DistributorId = null;
    var PurchaseOrderNumber = new Date();
    OrderNumber = "BILLNO" + GetRandomWord() + Date.parse(PurchaseOrderNumber)
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {

            if (!UserExist) {
                err.message = 'Token';
                throw err;
            }

            for (var i = 0; i < lstProduct.length; i++) {
                lstGpsDeviceCheck.push(lstProduct[i].deviceid)
                OrderTotal = OrderTotal + lstProduct[i].RenewPrice;
                if (DeviceId == '') {
                    DeviceId = lstProduct[i].deviceid;
                } else {
                    DeviceId = DeviceId + "," + lstProduct[i].deviceid;
                }
            }
            return GetDevicePricebyDeviceIds(lstProduct, lstGpsDeviceCheck)
        }).then(function (objDeviceRenewPrice) {
            console.log(objDeviceRenewPrice)
            lstProduct = objDeviceRenewPrice.lstProduct;
            OrderTotal = objDeviceRenewPrice.OrderTotal;
            SalesAgentId = objDeviceRenewPrice.SalesAgentId;
            DistributorId = objDeviceRenewPrice.DistributorId;

            var objOrder = new Object();
            objOrder.CustomerId = objOrderservice.idUser;
            objOrder.CreatedOnUtc = new Date();
            // objOrder.ExpiryDate = AddDate(objOrder.CreatedOnUtc, 1, "Year");
            // objOrder.ExpiryDurationValue = 1;
            // objOrder.ExpiryDurationType = "Year";
            objOrder.MerchantId = SalesAgentId;
            objOrder.AuthorizeWorkId = DistributorId;
            objOrder.PurchaseOrderNumber = OrderNumber;
            objOrder.CustomerCurrencyCode = "MYR / Rs";
            objOrder.OrderTotal = OrderTotal;
            objOrder.OrderNotes = DeviceId;
            objOrder.SettlementCur = "MYR / Rs";
            objOrder.OrderStatusId = 1;
            objOrder.SubscriptionTransactionId = objOrderservice.idApp;
            objOrder.ShippingStatusId = 0;
            objOrder.PaymentMethodSystemName = "CASH";
            objOrder.CustomerTaxDisplayTypeId = 0;
            objOrder.OrderSubtotalInclTax = OrderTotal;
            objOrder.OrderSubtotalExclTax = OrderTotal;
            objOrder.OrderSubTotalDiscountInclTax = 0;
            objOrder.OrderSubTotalDiscountExclTax = 0;
            objOrder.OrderShippingInclTax = 0;
            objOrder.OrderShippingExclTax = 0;
            objOrder.TaxRates = 0;
            objOrder.OrderTax = 0;
            objOrder.OrderDiscount = 0;
            objOrder.RefundedAmount = 0;
            objOrder.RewardPointsWereAdded = 0;
            objOrder.CustomerLanguageId = 0;
            objOrder.AffiliateId = 0;
            objOrder.AllowStoringCreditCardNumber = 0;
            objOrder.CreatedBy = decoded.username;
            objOrder.PaymentMethodAdditionalFeeInclTax = 0;
            objOrder.PaymentMethodAdditionalFeeExclTax = 0;
            objOrder.ProcessingCharges = 0;
            objOrder.PaymentStatusId = null;
            objOrder.Deleted = false;
            objOrder.ShippAddress1 = lstProduct[0].CountryName;

            return OrderService.create(objOrder);

        }).then(function (resOrder) {
            if (!resOrder) {
                err.message = 'Order could not created. Try again later.';
                throw err;
            }
            var lstOrderServiceItem = [];
            for (i = 0; i < lstProduct.length; i++) {
                var objOrderDetail = new Object();
                objOrderDetail.OrderId = resOrder.id;
                objOrderDetail.ProductId = lstProduct[i].ProductId;
                objOrderDetail.ProductName = lstProduct[i].deviceid;
                objOrderDetail.Quantity = 1;
                objOrderDetail.UnitPriceInclTax = lstProduct[i].RenewPrice;
                objOrderDetail.UnitPriceExclTax = lstProduct[i].RenewPrice;
                objOrderDetail.idOrderStatus = 1;
                objOrderDetail.PriceInclTax = lstProduct[i].RenewPrice;
                objOrderDetail.PriceExclTax = lstProduct[i].RenewPrice;
                objOrderDetail.UOM = lstProduct[i].UOM;
                objOrderDetail.sku = lstProduct[i].LicenceType;
                objOrderDetail.Attribute = lstProduct[i].LicenceNo;
                objOrderDetail.AttributeValue = lstProduct[i].LicenceRenewalType;
                objOrderDetail.AttributeDescription = lstProduct[i].Name;
                objOrderDetail.AttributesXml = lstProduct[i].ExpireDate;
                objOrderDetail.ItemWeight = lstProduct[i].NextExpireDate;
                objOrderDetail.LicenseDownloadId = lstProduct[i].SalesAgentId;
                objOrderDetail.DownloadCount = lstProduct[i].DistributorId;

                lstOrderServiceItem.push(objOrderDetail);
                lstLicenceId.push(lstProduct[i].LicenceId);
                lstDeviceId.push(lstProduct[i].deviceid);
            }

            return OrderServiceDetail.bulkCreate(lstOrderServiceItem);

        })

            // .then(function(resOrderServiceItem) {

            //     return LicenceManager.findAll({
            //         where: {
            //             Id: {
            //                 $in: lstLicenceId
            //             },
            //             IsDeleted: false
            //         }
            //     }).then(function(lstLicenceList) {
            //         return Vehicle.findAll({
            //             where: {
            //                 deviceid: {
            //                     $in: lstDeviceId
            //                 },
            //                 IsDelete: false
            //             }
            //         }).then(function(lstVehicleList) {
            //             return [lstLicenceList, lstVehicleList];
            //         })
            //     })

            // }).spread(function(lstLicenceList, lstVehicleList) {
            //     var TotalRecords = lstLicenceList.length;
            //     // if (TotalRecords < lstVehicleList.length) {
            //     //     TotalRecords = lstVehicleList.length;
            //     // }

            //     function UpdateLicenceVehicle(j) {
            //         if (j < TotalRecords) {
            //             var UpdateDeviceId = lstLicenceList[j].DeviceId;
            //             var AddMonth = 0;
            //             if (lstLicenceList[j].LicenceRenewalType == 'Monthly') {
            //                 AddMonth = 1;
            //             } else if (lstLicenceList[j].LicenceRenewalType == 'Quarterly') {
            //                 AddMonth = 3;
            //             } else if (lstLicenceList[j].LicenceRenewalType == 'Yearly') {
            //                 AddMonth = 12;
            //             }

            //             var oldexpdate = lstLicenceList[j].ExpiryDate;
            //             var date = new Date(lstLicenceList[j].ExpiryDate);
            //             var updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);

            //             var timeDiff = (new Date(oldexpdate)).getTime() - (new Date()).getTime();
            //             var diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
            //             days = diffDays;
            //             if (days < 0) {
            //                 date = new Date();
            //                 updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);
            //             }
            //             lstLicenceList[j].updateAttributes({ ExpiryDate: updatedDate }).then(function(resUpdateExpiryLicence) {
            //                 var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
            //                 if (objVehicle != undefined) {
            //                     return objVehicle.updateAttributes({ renewaldate: updatedDate });
            //                 } else {
            //                     return {};
            //                 }
            //             }).then(function(resVehicleUpdate) {
            //                 UpdateLicenceVehicle(j + 1);
            //             });

            //         } else {
            //             return {
            //                 success: true,
            //                 message: 'Device Renew successfully.',
            //             };
            //         }
            //     }
            //     UpdateLicenceVehicle(0);

            // })
            .then(function (resOrderServiceItem) {
                res.json({
                    success: true,
                    message: 'Order created successfully.',
                });
            }).catch(function (err) {
                if (err.message === 'Token') {
                    res.json(InvalidToken);
                } else {
                    res.json({
                        success: false,
                        message: "Order Could not created. Try again later."
                    });
                    console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
                }
            });
    } else {
        res.json(InvalidToken);
    }
})

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

    } else if (flg == 2) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
    } else if (flg == 3) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
    } else {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}

// Billing API End

//Order API start
router.get('/GetAllVehicleOrderbyUser', jsonParser, function (req, res) {

    var objParam = req.query;
    // var objColumns = objParam.columns;
    // var objOrder = objParam.order;
    var objSearch = objParam.search;
    // console.log(objParam)

    // var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var Orderby = 'id desc';
    var search = {};

    if (objSearch != null && objSearch != '') {
        search['$or'] = [];


        search['$or'].push(['PurchaseOrderNumber like ?', "%" + objSearch + "%"]);

    }

    OrderService.hasMany(OrderServiceDetail, {
        foreignKey: {
            name: 'OrderId',
            allowNull: false
        }
    });

    OrderService.belongsTo(OrderServiceStatus, {
        foreignKey: {
            name: 'OrderStatusId',
            allowNull: false
        }
    });

    var wherestatus = 'where CustomerId=' + objParam.idUser;
    if (objParam.Status != '') {
        wherestatus = wherestatus + ' and OrderStatusId = ' + objParam.Status
    }

    var query = "select tos.*,tosi.id as OrderdetailId, tosi.ProductName, tosi.PriceInclTax, tosi.AttributeDescription, tosi.AttributesXml, tosi.ItemWeight, tosi.UOM, tosi.sku, tosi.Attribute, tosi.AttributeValue,toss.OrderStatus from ( " +
        "SELECT id, CustomerId, ShippAddress1, OrderNotes, OrderStatusId, OrderTotal, PurchaseOrderNumber, CONVERT_TZ(CreatedOnUtc,'+00:00','" + CurrentOffset + "') as CreatedOnUtc FROM tblorderservice " + wherestatus + " ORDER BY CreatedOnUtc desc LIMIT " + objParam.start + ", " + objParam.length + ") as tos " +
        "inner join tblorderserviceitem tosi on tos.id=tosi.OrderId " +
        "inner join tblorderservicestatus toss on tos.OrderStatusId=toss.id;";

    var countquery = "SELECT count(id) as TotalRecord FROM tblorderservice " + wherestatus + " ORDER BY CreatedOnUtc desc"
    connection.query(query, function (err, lstAllOrder, fields) {

        connection.query(countquery, function (err, TotalRecord, fields) {


            var groups = u.groupBy(lstAllOrder, function (o) {

                return o.id;
            });

            var lstfinaldata = u.map(groups, function (group, id) {
                var lstOrderdetail = [];
                for (var i = 0; i < group.length; i++) {
                    var obj = new Object();
                    obj.OrderdetailId = group[i].OrderdetailId;
                    obj.ProductName = group[i].ProductName;
                    obj.PriceInclTax = group[i].PriceInclTax;
                    obj.AttributeDescription = group[i].AttributeDescription;
                    obj.UOM = group[i].UOM;
                    obj.sku = group[i].sku;
                    obj.Attribute = group[i].Attribute;
                    obj.AttributeValue = group[i].AttributeValue;
                    obj.AttributesXml = group[i].AttributesXml;
                    obj.ItemWeight = group[i].ItemWeight;

                    lstOrderdetail.push(obj);
                }
                return {
                    id: id,
                    CustomerId: group[0].CustomerId,
                    ShippAddress1: group[0].ShippAddress1,
                    OrderStatusId: group[0].OrderStatusId,
                    OrderTotal: group[0].OrderTotal,
                    PurchaseOrderNumber: group[0].PurchaseOrderNumber,
                    CreatedOnUtc: group[0].CreatedOnUtc,
                    CustomerId: group[0].CustomerId,
                    tblorderserviceitems: lstOrderdetail,
                    OrderStatus: group[0].OrderStatus
                }
            });

            lstfinaldata = u.sortBy(lstfinaldata, function (o) { return -o.CreatedOnUtc; })

            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.LastPage = lstfinaldata.length;
            response1.recordsTotal = TotalRecord[0].TotalRecord;
            response1.recordsFiltered = lstfinaldata.length;
            response1.data = lstfinaldata;
            res.json(response1);
        });
    });


    // OrderService.findAndCountAll({

    //     where: search,
    //     order: Orderby,
    //     offset: parseInt(objParam.start),
    //     limit: parseInt(objParam.length),
    //     attributes: ['id', 'CustomerId', 'ShippAddress1', 'OrderNotes', 'OrderStatusId', 'OrderTotal', 'PurchaseOrderNumber', 'CreatedOnUtc'],
    //     include: [{
    //         model: OrderServiceStatus,
    //         attributes: ['id', 'OrderStatus'],
    //         required: true
    //     }, {
    //         model: OrderServiceDetail,
    //         attributes: ['id', 'ProductName', 'PriceInclTax', 'AttributeDescription', 'UOM', 'sku', 'Attribute', 'AttributeValue'],
    //         required: true
    //     }]
    // }).then(function(response) {
    //     var response1 = new Object();
    //     response1.draw = objParam.draw;
    //     response1.LastPage = response.count;
    //     response1.recordsTotal = response.count;
    //     response1.recordsFiltered = response.count;
    //     response1.data = response.rows;
    //     res.json(response1);
    // }).catch(function(error) {
    //     var response1 = new Object();
    //     response1.draw = objParam.draw;
    //     response1.LastPage = 0;
    //     response1.recordsTotal = 0;
    //     response1.recordsFiltered = 0;
    //     response1.data = [];
    //     res.json(response1);
    // })

})


router.get('/GetBillingdata', function (req, res) {
    try {
        var dataall = req.query.data;
        // var EncodePass = jwt.encode(Passwordaa, "bugz");
        // console.log(EncodePass)
        var resobjdata = jwt.decode(dataall, "bugz");
        res.json({
            success: true,
            ObjTokenData: resobjdata
        });
    } catch (err) {
        res.json({
            success: false
        });
    };
});

router.get('/GetEncryptedBillingdata', function (req, res) {
    try {
        var objdata = {};
        req.query.Message.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
            objdata[key] = value;
        });
        //console.log(objdata);
        var token = jwt.encode(objdata, "bugz");
        res.json({
            success: true,
            Message: token
        });
    } catch (err) {
        res.json({
            success: false
        });
    };
});

router.post('/WebCashResponseUrl', jsonParser, function (req, res) {
    var resdata = req.body;
    var resdataparam = req.query;

    var objConnection = {
        OrderNumber: resdataparam.OrderNumber,
    }
    io.sockets.emit(resdataparam.OrderNumber + 'WebCashResponse', JSON.stringify(objConnection));

    // var MerchantID = '80000155'
    // var MerchantKey = '123456'
    // var Merchantenquiry = 'https://staging.webcash.com.my/enquiry.php?'
    var MerchantID = WebCashconfig.WebCash.MerchantID;
    var MerchantKey = WebCashconfig.WebCash.MerchantKey;
    var Merchantenquiry = WebCashconfig.WebCash.MerchantEnquiry;

    OrderService.findOne({
        where: { PurchaseOrderNumber: resdataparam.OrderNumber },
    }).then(function (response) {
        if (response != null) {
            if (JSON.stringify(resdata) == "{}") {
                var QString = "ord_mercID=" + MerchantID + "&ord_mercref=" + response.CaptureTransactionResult + "&ord_totalamt=" + parseFloat(response.OrderTotal).toFixed(2);
                //var QString = "MerchantCode=M11071&RefNo=WLT2904&Amount=20.00";                
                request.get({
                    headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    url: Merchantenquiry + QString,
                    //body: QString
                }, function (error, resWebCase, resData) {
                    if (resData != null) {
                        var Status = '';
                        var StatusMessage = '';
                        var OrderStatus = 1;
                        if (resData == 'S') {
                            Status = 'Success';
                            StatusMessage = 'Payment Success.';
                            OrderStatus = 2;
                        } else if (resData == 'P') {
                            Status = 'Pending';
                            StatusMessage = 'Payment status is Pending. Please wait for payment confirmation.';
                            OrderStatus = 1;
                        } else if (resData == 'F') {
                            Status = 'Fail';
                            StatusMessage = 'Payment Failed.';
                            OrderStatus = 1;
                        } else {
                            Status = 'Canceled';
                            StatusMessage = 'User canceled Transaction.';
                            OrderStatus = 1;
                        }

                        response.updateAttributes({ AuthorizationTransactionResult: Status, OrderStatusId: OrderStatus }).then(function (resupdatedata) {

                            if (Status == "Success") {
                                OrderServiceDetail.findAll({
                                    where: {
                                        OrderId: response.id
                                    }
                                }).then(function (lstOrderItem) {
                                    var lstDeviceId = [];

                                    for (var i = 0; i < lstOrderItem.length; i++) {
                                        lstDeviceId.push(lstOrderItem[i].ProductName);
                                    }

                                    return LicenceManager.findAll({
                                        where: {
                                            DeviceId: {
                                                $in: lstDeviceId
                                            },
                                            IsDeleted: false
                                        }
                                    }).then(function (lstLicenceList) {
                                        return Vehicle.findAll({
                                            where: {
                                                deviceid: {
                                                    $in: lstDeviceId
                                                },
                                                IsDelete: false
                                            }
                                        }).then(function (lstVehicleList) {
                                            return [lstLicenceList, lstVehicleList];
                                        })
                                    })

                                }).spread(function (lstLicenceList, lstVehicleList) {
                                    var TotalRecords = lstLicenceList.length;
                                    // if (TotalRecords < lstVehicleList.length) {
                                    //     TotalRecords = lstVehicleList.length;
                                    // }

                                    function UpdateLicenceVehicle(j) {
                                        if (j < TotalRecords) {
                                            var UpdateDeviceId = lstLicenceList[j].DeviceId;
                                            var AddMonth = 0;
                                            if (lstLicenceList[j].LicenceRenewalType == 'Monthly') {
                                                AddMonth = 1;
                                            } else if (lstLicenceList[j].LicenceRenewalType == 'Quarterly') {
                                                AddMonth = 3;
                                            } else if (lstLicenceList[j].LicenceRenewalType == 'Yearly') {
                                                AddMonth = 12;
                                            }

                                            var oldexpdate = lstLicenceList[j].ExpiryDate;
                                            var date = new Date(lstLicenceList[j].ExpiryDate);
                                            var updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);

                                            var timeDiff = (new Date(oldexpdate)).getTime() - (new Date()).getTime();
                                            var diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
                                            days = diffDays;
                                            if (days < 0) {
                                                date = new Date();
                                                updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);
                                            }
                                            lstLicenceList[j].updateAttributes({ ExpiryDate: updatedDate }).then(function (resUpdateExpiryLicence) {
                                                var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
                                                if (objVehicle != undefined) {
                                                    return objVehicle.updateAttributes({ renewaldate: updatedDate });

                                                } else {
                                                    return {};
                                                }
                                            }).then(function (resVehicleUpdate) {
                                                var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
                                                if (objVehicle != undefined) {
                                                    Commonfunction.UpdateVehicleRedis(objVehicle.deviceid, 'Vehicle');
                                                }
                                                UpdateLicenceVehicle(j + 1);
                                            });

                                        } else {
                                            return {
                                                success: true,
                                                message: 'Device Renew successfully.',
                                            };
                                        }
                                    }
                                    UpdateLicenceVehicle(0);

                                }).then(function (resOrderServiceItem) {
                                    var objres = {
                                        success: true,
                                        Message: StatusMessage
                                    }
                                    io.sockets.emit(resdataparam.OrderNumber + 'ApiResponse', JSON.stringify(objres));
                                })

                            } else {
                                var objres = {
                                    success: false,
                                    Message: StatusMessage
                                }
                                io.sockets.emit(resdataparam.OrderNumber + 'ApiResponse', JSON.stringify(objres));
                            }

                        })

                        // CallUpdateWalletTransation(resMarchant.MerchantID, resMarchant.MerchantKey, response, resData, function(res) {
                        //     if (res.success == true) {
                        //         io.sockets.emit(resdataparam.OrderNumber + 'ApiResponse', JSON.stringify(res));
                        //         //res.send('RECEIVEOK');
                        //     } else {
                        //         io.sockets.emit(resdataparam.OrderNumber + 'ApiResponse', JSON.stringify(res));
                        //         //res.send('RECEIVEOK');
                        //     }
                        // })
                    } else {
                        //res.send('RECEIVEOK');
                        var res = {
                            success: false,
                            message: "Payment failed.",
                            data: [],
                        }
                        io.sockets.emit(resdataparam.OrderNumber + 'ApiResponse', JSON.stringify(res));
                    }
                })
            } else {
                var resbodyData = req.body.returncode;
                var Status = '';
                var StatusMessage = '';
                var OrderStatus = 1;
                if (JSON.stringify(resbodyData) == '100') {
                    Status = 'Success';
                    StatusMessage = 'Payment Success.';
                    OrderStatus = 2;
                } else if (JSON.stringify(resbodyData) == 'E1') {
                    Status = 'Fail';
                    StatusMessage = 'Payment Failed.';
                    OrderStatus = 1;
                } else if (JSON.stringify(resbodyData) == 'E2') {
                    Status = 'Pending';
                    StatusMessage = 'Payment status is Pending. Please wait for payment confirmation.';
                    OrderStatus = 1;
                } else {
                    Status = 'Canceled';
                    StatusMessage = 'User canceled Transaction.';
                    OrderStatus = 1;
                }

                response.updateAttributes({ AuthorizationTransactionResult: Status, OrderStatusId: OrderStatus }).then(function (resupdatedata) {

                    if (Status == "Success") {
                        OrderServiceDetail.findAll({
                            where: {
                                OrderId: response.id
                            }
                        }).then(function (lstOrderItem) {
                            var lstDeviceId = [];

                            for (var i = 0; i < lstOrderItem.length; i++) {
                                lstDeviceId.push(lstOrderItem[i].ProductName);
                            }

                            return LicenceManager.findAll({
                                where: {
                                    DeviceId: {
                                        $in: lstDeviceId
                                    },
                                    IsDeleted: false
                                }
                            }).then(function (lstLicenceList) {
                                return Vehicle.findAll({
                                    where: {
                                        deviceid: {
                                            $in: lstDeviceId
                                        },
                                        IsDelete: false
                                    }
                                }).then(function (lstVehicleList) {
                                    return [lstLicenceList, lstVehicleList];
                                })
                            })

                        }).spread(function (lstLicenceList, lstVehicleList) {
                            var TotalRecords = lstLicenceList.length;
                            // if (TotalRecords < lstVehicleList.length) {
                            //     TotalRecords = lstVehicleList.length;
                            // }

                            function UpdateLicenceVehicle(j) {
                                if (j < TotalRecords) {
                                    var UpdateDeviceId = lstLicenceList[j].DeviceId;
                                    var AddMonth = 0;
                                    if (lstLicenceList[j].LicenceRenewalType == 'Monthly') {
                                        AddMonth = 1;
                                    } else if (lstLicenceList[j].LicenceRenewalType == 'Quarterly') {
                                        AddMonth = 3;
                                    } else if (lstLicenceList[j].LicenceRenewalType == 'Yearly') {
                                        AddMonth = 12;
                                    }

                                    var oldexpdate = lstLicenceList[j].ExpiryDate;
                                    var date = new Date(lstLicenceList[j].ExpiryDate);
                                    var updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);

                                    var timeDiff = (new Date(oldexpdate)).getTime() - (new Date()).getTime();
                                    var diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
                                    days = diffDays;
                                    if (days < 0) {
                                        date = new Date();
                                        updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);
                                    }
                                    lstLicenceList[j].updateAttributes({ ExpiryDate: updatedDate }).then(function (resUpdateExpiryLicence) {
                                        var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
                                        if (objVehicle != undefined) {
                                            return objVehicle.updateAttributes({ renewaldate: updatedDate });
                                        } else {
                                            return {};
                                        }
                                    }).then(function (resVehicleUpdate) {
                                        var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
                                        if (objVehicle != undefined) {
                                            Commonfunction.UpdateVehicleRedis(objVehicle.deviceid, 'Vehicle');
                                        }
                                        UpdateLicenceVehicle(j + 1);
                                    });

                                } else {
                                    return {
                                        success: true,
                                        message: 'Device Renew successfully.',
                                    };
                                }
                            }
                            UpdateLicenceVehicle(0);

                        }).then(function (resOrderServiceItem) {
                            var objres = {
                                success: true,
                                Message: StatusMessage
                            }
                            io.sockets.emit(resdataparam.OrderNumber + 'ApiResponse', JSON.stringify(objres));
                        })

                    } else {
                        var objres = {
                            success: false,
                            Message: StatusMessage
                        }
                        io.sockets.emit(resdataparam.OrderNumber + 'ApiResponse', JSON.stringify(objres));
                    }

                })
            }
        } else {
            var res = {
                success: false,
                message: "Payment failed",
                data: [],
            }
            io.sockets.emit(resdataparam.OrderNumber + 'ApiResponse', JSON.stringify(res));
            //res.send('RECEIVEOK');
        }
    }).catch(function (error) {
        var res = {
            success: false,
            message: "Payment failed",
            data: [],
        }
        io.sockets.emit(resdataparam.OrderNumber + 'ApiResponse', JSON.stringify(res));
        //res.send('');
    })

    res.send('Please Wait...');

});

router.get('/UpdateReferenceNumber', function (req, res) {
    var PurchaseOrderNumber = new Date();
    var RefNumber = "T" + GetRandomWord() + Date.parse(PurchaseOrderNumber)
    OrderService.findOne({
        where: { PurchaseOrderNumber: req.query.OrderNumber },
    }).then(function (response) {
        return response.updateAttributes({ CaptureTransactionResult: RefNumber });
    }).then(function (resupdate) {
        var obj = {
            success: true,
            message: "Reference Number UpdatedSuccessfully",
            data: RefNumber
        }
        res.json(obj);
    }).catch(function (error) {
        var obj = {
            success: false,
            message: "Reference Number can not update",
        }
        res.json(obj);
    })
});

router.post('/SaveOrderServiceNew', jsonParser, function (req, res) {
    objOrderservice = req.body;
    objHeader = req.headers;
    var OrderTotal = objOrderservice.OrderTotal;
    var DeviceId = ''
    var lstProduct = objOrderservice.lstProduct;
    var lstLicenceId = [];
    var lstDeviceId = [];
    var SalesAgentId = null;
    var DistributorId = null;
    var lstGpsDeviceCheck = [];
    var PurchaseOrderNumber = new Date();
    OrderNumber = "BILLNO" + GetRandomWord() + Date.parse(PurchaseOrderNumber)
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {

            if (!UserExist) {
                err.message = 'Token';
                throw err;
            }

            for (var i = 0; i < lstProduct.length; i++) {
                lstGpsDeviceCheck.push(lstProduct[i].deviceid)
                // OrderTotal = OrderTotal + lstProduct[i].RenewPrice;
                if (DeviceId == '') {
                    DeviceId = lstProduct[i].deviceid;
                } else {
                    DeviceId = DeviceId + "," + lstProduct[i].deviceid;
                }
            }
            return GetDevicePricebyDeviceIds(lstProduct, lstGpsDeviceCheck)
        }).then(function (objDeviceRenewPrice) {
            console.log(objDeviceRenewPrice)
            lstProduct = objDeviceRenewPrice.lstProduct;
            OrderTotal = objDeviceRenewPrice.OrderTotal;
            SalesAgentId = objDeviceRenewPrice.SalesAgentId;
            DistributorId = objDeviceRenewPrice.DistributorId;
            console.log("Order Total = " + OrderTotal)
            var objOrder = new Object();
            objOrder.CustomerId = objOrderservice.idUser;
            objOrder.CreatedOnUtc = new Date();
            // objOrder.ExpiryDate = AddDate(objOrder.CreatedOnUtc, 1, "Year");
            // objOrder.ExpiryDurationValue = 1;
            // objOrder.ExpiryDurationType = "Year";
            objOrder.MerchantId = SalesAgentId;
            objOrder.AuthorizeWorkId = DistributorId;
            objOrder.PurchaseOrderNumber = OrderNumber;
            objOrder.CustomerCurrencyCode = "MYR / Rs";
            objOrder.OrderTotal = OrderTotal;
            objOrder.OrderNotes = DeviceId;
            objOrder.SettlementCur = "MYR / Rs";
            objOrder.OrderStatusId = 1;
            objOrder.SubscriptionTransactionId = objOrderservice.idApp;
            objOrder.ShippingStatusId = 0;
            objOrder.PaymentMethodSystemName = "CASH";
            objOrder.CustomerTaxDisplayTypeId = 0;
            objOrder.OrderSubtotalInclTax = OrderTotal;
            objOrder.OrderSubtotalExclTax = OrderTotal;
            objOrder.OrderSubTotalDiscountInclTax = 0;
            objOrder.OrderSubTotalDiscountExclTax = 0;
            objOrder.OrderShippingInclTax = 0;
            objOrder.OrderShippingExclTax = 0;
            objOrder.TaxRates = 0;
            objOrder.OrderTax = 0;
            objOrder.OrderDiscount = 0;
            objOrder.RefundedAmount = 0;
            objOrder.RewardPointsWereAdded = 0;
            objOrder.CustomerLanguageId = 0;
            objOrder.AffiliateId = 0;
            objOrder.AllowStoringCreditCardNumber = 0;
            objOrder.CreatedBy = decoded.username;
            objOrder.PaymentMethodAdditionalFeeInclTax = 0;
            objOrder.PaymentMethodAdditionalFeeExclTax = 0;
            objOrder.ProcessingCharges = 0;
            objOrder.PaymentStatusId = null;
            objOrder.Deleted = false;
            objOrder.ShippAddress1 = lstProduct[0].CountryName;
            objOrder.OrderStatus = 2;
            objOrder.AuthorizationTransactionResult = 'Success';

            return OrderService.create(objOrder);
        }).then(function (resOrder) {
            if (!resOrder) {
                err.message = 'Order could not created. Try again later.';
                throw err;
            }
            var lstOrderServiceItem = [];
            for (i = 0; i < lstProduct.length; i++) {
                var objOrderDetail = new Object();
                var RefNumber = "T" + GetRandomWord() + Date.parse(PurchaseOrderNumber);
                objOrderDetail.OrderId = resOrder.id;
                objOrderDetail.ProductId = lstProduct[i].ProductId;
                objOrderDetail.ProductName = lstProduct[i].deviceid;
                objOrderDetail.Quantity = 1;
                objOrderDetail.UnitPriceInclTax = lstProduct[i].RenewPrice;
                objOrderDetail.UnitPriceExclTax = lstProduct[i].RenewPrice;
                objOrderDetail.idOrderStatus = 1;
                objOrderDetail.PriceInclTax = lstProduct[i].RenewPrice;
                objOrderDetail.PriceExclTax = lstProduct[i].RenewPrice;
                objOrderDetail.UOM = lstProduct[i].UOM;
                objOrderDetail.sku = lstProduct[i].LicenceType;
                objOrderDetail.Attribute = lstProduct[i].LicenceNo;
                objOrderDetail.AttributeValue = lstProduct[i].LicenceRenewalType;
                objOrderDetail.AttributeDescription = lstProduct[i].Name;
                objOrderDetail.AttributesXml = lstProduct[i].ExpireDate;
                objOrderDetail.ItemWeight = lstProduct[i].NextExpireDate;
                objOrderDetail.CaptureTransactionResult = lstProduct[i].RefNumber;
                objOrderDetail.LicenseDownloadId = lstProduct[i].SalesAgentId;
                objOrderDetail.DownloadCount = lstProduct[i].DistributorId;
                lstOrderServiceItem.push(objOrderDetail);
                lstLicenceId.push(lstProduct[i].LicenceId);
                lstDeviceId.push(lstProduct[i].deviceid);
            }
            return OrderServiceDetail.bulkCreate(lstOrderServiceItem);

            // }).then(function(resOrderServiceItem) {
            //     // res.json({
            //     //     success: true,
            //     //     message: 'Order created successfully.',


            //     return LicenceManager.findAll({
            //         where: {
            //             Id: {
            //                 $in: lstLicenceId
            //             },
            //             IsDeleted: false
            //         }
            //     }).then(function(lstLicenceList) {
            //         return Vehicle.findAll({
            //             where: {
            //                 deviceid: {
            //                     $in: lstDeviceId
            //                 },
            //                 IsDelete: false
            //             }
            //         }).then(function(lstVehicleList) {
            //             return [lstLicenceList, lstVehicleList];
            //         })
            //     })

            // }).spread(function(lstLicenceList, lstVehicleList) {
            //     var TotalRecords = lstLicenceList.length;

            //     function UpdateLicenceVehicle(j, Callback) {
            //         if (j < TotalRecords) {
            //             var UpdateDeviceId = lstLicenceList[j].DeviceId;
            //             var AddMonth = 0;
            //             if (lstLicenceList[j].LicenceRenewalType == 'Monthly') {
            //                 AddMonth = 1;
            //             } else if (lstLicenceList[j].LicenceRenewalType == 'Quarterly') {
            //                 AddMonth = 3;
            //             } else if (lstLicenceList[j].LicenceRenewalType == 'Yearly') {
            //                 AddMonth = 12;
            //             }

            //             var oldexpdate = lstLicenceList[j].ExpiryDate;
            //             var date = new Date(lstLicenceList[j].ExpiryDate);
            //             var updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);

            //             var timeDiff = (new Date(oldexpdate)).getTime() - (new Date()).getTime();
            //             var diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
            //             days = diffDays;
            //             if (days < 0) {
            //                 date = new Date();
            //                 updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);
            //             }
            //             lstLicenceList[j].updateAttributes({ ExpiryDate: updatedDate }).then((resUpdateExpiryLicence) => {
            //                 var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
            //                 if (objVehicle != undefined) {
            //                     objVehicle.updateAttributes({ renewaldate: updatedDate }).then((resVehicleUpdate) => {
            //                         UpdateLicenceVehicle(j + 1, Callback);
            //                     });
            //                 } else {
            //                     UpdateLicenceVehicle(j + 1, Callback);
            //                 }
            //             })

            //         } else {
            //             res.json({
            //                 success: true,
            //                 message: 'Order created successfully.',
            //             });
            //         }
            //     }
            //     UpdateLicenceVehicle(0, (resobj) => {
            //         return resobj;
            //     });


        }).then(function () {
            res.json({
                success: true,
                message: 'Order created successfully.',
            });
        }).catch(function (err) {
            if (err.message === 'Token') {
                res.json(InvalidToken);
            } else {
                res.json({
                    success: false,
                    message: "Order Could not created. Try again later."
                });
                console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
            }
        });
    } else {
        res.json(InvalidToken);
    }
})

router.post('/SaveOrderServiceRenew', jsonParser, function (req, res) {
    objOrderservice = req.body;
    objHeader = req.headers;
    var OrderTotal = objOrderservice.OrderTotal;
    var Remark = objOrderservice.Remark;
    var DeviceId = ''
    var lstProduct = objOrderservice.lstProduct;
    var lstLicenceId = [];
    var lstDeviceId = [];
    var lstGpsDeviceCheck = [];
    var PurchaseOrderNumber = new Date();
    var error = {};
    var SalesAgentId = null;
    var DistributorId = null;
    var objOrderData = null;
    var objCurrentUser = null;
    OrderNumber = "BILLNO" + GetRandomWord() + Date.parse(PurchaseOrderNumber)
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            objCurrentUser = UserExist;
            if (!UserExist) {
                error.message = 'Token';
                throw error;
            }
            for (var i = 0; i < lstProduct.length; i++) {
                lstGpsDeviceCheck.push(lstProduct[i].deviceid)
                OrderTotal = OrderTotal + lstProduct[i].RenewPrice;
                if (DeviceId == '') {
                    DeviceId = lstProduct[i].deviceid;
                } else {
                    DeviceId = DeviceId + "," + lstProduct[i].deviceid;
                }
            }
            return DeviceAgentRetailer.findAll({
                where: { DeviceId: { $in: lstGpsDeviceCheck } },
            });
        }).then(function (lstDeviceAgentRes) {
            var NotAgentorDistributerDevice = [];

            u.filter(lstGpsDeviceCheck, function (item) {
                var obj = u.findWhere(lstDeviceAgentRes, { deviceId: item });
                if (obj == undefined) {
                    NotAgentorDistributerDevice.push(item);
                }
            })
            if (NotAgentorDistributerDevice.length > 0) {
                error.message = "Contact Admin Error : 1001";
                error.Data = NotAgentorDistributerDevice;
                throw error
            }
            return GetDevicePricebyDeviceIds(lstProduct, lstGpsDeviceCheck)
        }).then(function (objDeviceRenewPrice) {
            console.log(objDeviceRenewPrice)
            lstProduct = objDeviceRenewPrice.lstProduct;
            OrderTotal = objDeviceRenewPrice.OrderTotal;
            SalesAgentId = objDeviceRenewPrice.SalesAgentId;
            DistributorId = objDeviceRenewPrice.DistributorId;
            GPSDevice.belongsTo(SimDetail, {
                foreignKey: {
                    name: 'idSim',
                    allowNull: false
                }
            });
            return GPSDevice.findAll({
                where: { DeviceId: { $in: lstGpsDeviceCheck } },
                include: [{
                    model: SimDetail,
                    attributes: ['id', 'Status'],
                    required: false
                }]
            });
        }).then(function (lstGpsDevices) {

            var IsTerminate = false;
            var TerminateDevices = "";
            for (var i = 0; i < lstGpsDevices.length; i++) {
                if (lstGpsDevices[i].tblsimdetail && lstGpsDevices[i].tblsimdetail.Status == 'Terminate') {
                    IsTerminate = true;
                    if (TerminateDevices == '') {
                        TerminateDevices = lstGpsDevices[i].DeviceId;
                    } else {
                        TerminateDevices = TerminateDevices + "," + lstGpsDevices[i].DeviceId;
                    }
                }
            }
            if (IsTerminate) {
                error.message = 'Terminate';
                error.Data = TerminateDevices;
                throw error;
            }

            console.log("Order Total = " + OrderTotal)
            var objOrder = new Object();
            objOrder.CustomerId = objCurrentUser.id;
            objOrder.CreatedOnUtc = new Date();
            // objOrder.ExpiryDate = AddDate(objOrder.CreatedOnUtc, 1, "Year");
            // objOrder.ExpiryDurationValue = 1;
            // objOrder.ExpiryDurationType = "Year";
            objOrder.MerchantId = SalesAgentId;
            objOrder.AuthorizeWorkId = DistributorId;
            objOrder.PurchaseOrderNumber = OrderNumber;
            objOrder.CustomerCurrencyCode = "MYR";
            objOrder.OrderTotal = OrderTotal;
            objOrder.OrderNotes = DeviceId;
            objOrder.SettlementCur = "MYR";
            objOrder.SubscriptionTransactionId = objOrderservice.idApp;
            objOrder.ShippingStatusId = 0;
            // if (objOrderservice.idApp == 2) {
            //     objOrder.OrderStatusId = 2;
            //     objOrder.PaymentMethodSystemName = "CASH";
            //     objOrder.AuthorizationTransactionResult = 'Success';
            // } else {
            objOrder.OrderStatusId = 1;
            objOrder.PaymentMethodSystemName = null;
            objOrder.AuthorizationTransactionResult = null;
            // }
            objOrder.CustomerTaxDisplayTypeId = 0;
            objOrder.OrderSubtotalInclTax = OrderTotal;
            objOrder.OrderSubtotalExclTax = OrderTotal;
            objOrder.OrderSubTotalDiscountInclTax = 0;
            objOrder.OrderSubTotalDiscountExclTax = 0;
            objOrder.OrderShippingInclTax = 0;
            objOrder.OrderShippingExclTax = 0;
            objOrder.TaxRates = 0;
            objOrder.OrderTax = 0;
            objOrder.OrderDiscount = 0;
            objOrder.RefundedAmount = 0;
            objOrder.RewardPointsWereAdded = 0;
            objOrder.CustomerLanguageId = 0;
            objOrder.AffiliateId = 0;
            objOrder.AllowStoringCreditCardNumber = 0;
            objOrder.CreatedBy = decoded.username;
            objOrder.PaymentMethodAdditionalFeeInclTax = 0;
            objOrder.PaymentMethodAdditionalFeeExclTax = 0;
            objOrder.ProcessingCharges = 0;
            objOrder.PaymentStatusId = null;
            objOrder.Deleted = false;
            objOrder.ShippAddress1 = lstProduct[0].CountryName;
            objOrder.OrderStatus = 2;

            objOrder.Terms = Remark;
            objOrder.ModifiedDate = new Date();
            objOrder.Courier = decoded.username;

            return OrderService.create(objOrder);
        }).then(function (resOrder) {
            if (!resOrder) {
                error.message = 'Order could not created. Try again later.';
                throw error;
            }
            objOrderData = resOrder;
            var lstOrderServiceItem = [];
            for (i = 0; i < lstProduct.length; i++) {
                var objOrderDetail = new Object();
                var RefNumber = "T" + GetRandomWord() + Date.parse(PurchaseOrderNumber);
                objOrderDetail.OrderId = resOrder.id;
                objOrderDetail.ProductId = lstProduct[i].ProductId;
                objOrderDetail.ProductName = lstProduct[i].deviceid;
                objOrderDetail.Quantity = 1;
                objOrderDetail.UnitPriceInclTax = lstProduct[i].RenewPrice;
                objOrderDetail.UnitPriceExclTax = lstProduct[i].RenewPrice;
                objOrderDetail.idOrderStatus = 2;
                objOrderDetail.PriceInclTax = lstProduct[i].RenewPrice;
                objOrderDetail.PriceExclTax = lstProduct[i].RenewPrice;
                objOrderDetail.UOM = lstProduct[i].UOM;
                objOrderDetail.sku = lstProduct[i].LicenceType;
                objOrderDetail.Attribute = lstProduct[i].LicenceNo;
                objOrderDetail.AttributeValue = lstProduct[i].LicenceRenewalType;
                objOrderDetail.AttributeDescription = lstProduct[i].Name;
                objOrderDetail.AttributesXml = lstProduct[i].ExpireDate;
                objOrderDetail.ItemWeight = lstProduct[i].NextExpireDate;
                objOrderDetail.CaptureTransactionResult = lstProduct[i].RefNumber;
                objOrderDetail.LicenseDownloadId = lstProduct[i].SalesAgentId;
                objOrderDetail.DownloadCount = lstProduct[i].DistributorId;
                lstOrderServiceItem.push(objOrderDetail);
                lstLicenceId.push(lstProduct[i].LicenceId);
                lstDeviceId.push(lstProduct[i].deviceid);
            }
            return OrderServiceDetail.bulkCreate(lstOrderServiceItem);

        })
            // .then(function (resOrderServiceItem) {
            //     // res.json({
            //     //     success: true,
            //     //     message: 'Order created successfully.',
            //     if (objOrderservice.idApp == 2) {
            //         return [LicenceManager.findAll({
            //             where: {
            //                 Id: {
            //                     $in: lstLicenceId
            //                 },
            //                 IsDeleted: false
            //             }
            //         }), Vehicle.findAll({
            //             where: {
            //                 deviceid: {
            //                     $in: lstDeviceId
            //                 },
            //                 IsDelete: false
            //             }
            //         })];
            //     } else {
            //         return [[], []];
            //     }
            //     // return LicenceManager.findAll({
            //     //     where: {
            //     //         Id: {
            //     //             $in: lstLicenceId
            //     //         },
            //     //         IsDeleted: false
            //     //     }
            //     // }).then(function (lstLicenceList) {
            //     //     return Vehicle.findAll({
            //     //         where: {
            //     //             deviceid: {
            //     //                 $in: lstDeviceId
            //     //             },
            //     //             IsDelete: false
            //     //         }
            //     //     }).then(function (lstVehicleList) {
            //     //         return [lstLicenceList, lstVehicleList];
            //     //     })
            //     // })

            // }).spread(function (lstLicenceList, lstVehicleList) {
            //     var TotalRecords = lstLicenceList.length;
            //     function UpdateLicenceVehicle(j) {
            //         if (j < TotalRecords) {
            //             var UpdateDeviceId = lstLicenceList[j].DeviceId;
            //             var AddMonth = 0;
            //             if (lstLicenceList[j].LicenceRenewalType == 'Monthly') {
            //                 AddMonth = 1;
            //             } else if (lstLicenceList[j].LicenceRenewalType == 'Quarterly') {
            //                 AddMonth = 3;
            //             } else if (lstLicenceList[j].LicenceRenewalType == 'Yearly') {
            //                 AddMonth = 12;
            //             }

            //             var oldexpdate = lstLicenceList[j].ExpiryDate;
            //             var date = new Date(lstLicenceList[j].ExpiryDate);
            //             var updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);

            //             var timeDiff = (new Date(oldexpdate)).getTime() - (new Date()).getTime();
            //             var diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
            //             days = diffDays;
            //             if (days < 0) {
            //                 date = new Date();
            //                 updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);
            //             }
            //             lstLicenceList[j].updateAttributes({ ExpiryDate: updatedDate }).then((resUpdateExpiryLicence) => {
            //                 var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
            //                 if (objVehicle != undefined) {
            //                     objVehicle.updateAttributes({ renewaldate: updatedDate }).then((resVehicleUpdate) => {
            //                         Commonfunction.UpdateVehicleRedis(objVehicle.deviceid, 'Vehicle');
            //                         UpdateLicenceVehicle(j + 1);
            //                     });
            //                 } else {
            //                     UpdateLicenceVehicle(j + 1);
            //                 }
            //             })

            //         } else {
            //             if (objOrderservice.idApp == 2) {
            //                 var objRenewTransaction = {
            //                     idOrder: objOrderData.id,
            //                     idUser: objCurrentUser.id,
            //                     idApp: objOrderservice.idApp,
            //                     Amount: objOrderData.OrderTotal,
            //                     CreatedBy: decoded.username,
            //                     CreatedDate: new Date()
            //                 }
            //                 SaveRenewTransaction(objRenewTransaction).then(function (resrenewtransaction) {
            //                     res.json({
            //                         success: true,
            //                         message: 'Order created successfully.',
            //                         data: objOrderData
            //                     });
            //                 })
            //             } else {
            //                 res.json({
            //                     success: true,
            //                     message: 'Order created successfully.',
            //                     data: objOrderData
            //                 });
            //             }
            //         }
            //     }
            //     UpdateLicenceVehicle(0);
            // })
            .then(function (aaa) {
                console.log(aaa)
                // console.log("Order create succerss final");
                res.json({
                    success: true,
                    message: 'Order created successfully.',
                    data: objOrderData
                });
            })
            .catch(function (err) {
                if (err.message === 'Token') {
                    res.json(InvalidToken);
                } else if (err.message === 'Terminate') {
                    res.json({
                        success: false,
                        message: "Sim(s) are terminate for " + err.Data + " deevices. First replace that sim then try to renew it.",
                        data: objOrderData
                    });
                } else if (err.message === 'Contact Admin Error : 1001') {
                    res.json({
                        success: false,
                        message: "Contact Admin Error : 1001", //+ err.Data,
                        data: err.Data
                    });
                } else {
                    res.json({
                        success: false,
                        message: "Order Could not created. Try again later.",
                        data: objOrderData
                    });
                    console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
                }
            });
    } else {
        res.json(InvalidToken);
    }
})

router.post('/SendEmailNotification', jsonParser, function (req, res) {
    var ObjRenewList = req.body;
    var lstRenewListAll = ObjRenewList.lstRenewalList;
    var lstidApp = [];
    var groups = u.groupBy(lstRenewListAll, function (value) {
        return value.iduser + '#' + value.idApp;
    });
    var lstRenewList = u.map(groups, function (group) {
        lstidApp.push(group[0].idApp);
        return {
            iduser: group[0].iduser,
            idApp: group[0].idApp,
            email: group[0].email,
            AppName: group[0].AppName,
            lstvehicle: group
        }
    });
    var objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {

            if (!UserExist) {
                err.message = 'Token';
                throw err;
            }
            return [SystemEmail.findAll({ where: { IdApp: { $in: lstidApp } } }), EmailTemplate.findOne({ where: { Type: "Renew Device Email", } })];
        }).spread(function (lstAppEmail, objEmailTemplate) {
            if (objEmailTemplate != null) {
                function SendEmailonebyOne(j) {
                    if (j < lstRenewList.length) {
                        var objRenewdata = lstRenewList[j];
                        var objEmail = u.findWhere(lstAppEmail, { IdApp: objRenewdata.idApp });
                        var OrderDetail = "";
                        for (var i = 0; i < objRenewdata.lstvehicle.length; i++) {
                            OrderDetail = OrderDetail + '<div>&nbsp;</div>' +
                                '<div>' + (i + 1).toString() + '.<span style="white-space:pre"> </span>' + objRenewdata.lstvehicle[i].VehicleName + ' (' + objRenewdata.lstvehicle[i].DeviceId + ') -&gt; ' + objRenewdata.lstvehicle[i].ExpiryDate + '</div>' +
                                '<div>-----------------------------------------</div>';
                        }

                        var body = objEmailTemplate.EmailBody.replace(/{Email}/g, objRenewdata.email).replace(/{AppName}/g, objRenewdata.AppName).replace("{OrderDetail}", OrderDetail);
                        var mail = {
                            from: objEmail.DefaultEmailFrom,
                            to: objRenewdata.email,
                            subject: objEmailTemplate.EmailSubject,
                            html: body
                        };
                        SetsmtpConfig(objEmail, mail, function (EmailSettingCreated) {
                            // console.log(EmailSettingCreated)
                        })
                        funAuditLog.CreateAuditLog('Renew Device Email', decoded.username, 'Renew Device Email Send: (' + objRenewdata.email + ')');
                        SendEmailonebyOne(j + 1);
                    } else {
                        res.json({
                            success: true,
                            message: "Email Send to Customer Successfully.",
                        });
                    }
                }
                SendEmailonebyOne(0);
            } else {
                var obj = {
                    success: false,
                    message: "Please Add Renew Device Email Template.",
                }
                res.json(obj);
            }
        }).catch(function (error) {
            console.log(error)
            if (error.message === 'Token') {
                res.json(InvalidToken);
            } else {
                var obj = {
                    success: false,
                    message: "Email can not send.",
                    data: error
                }
                res.json(obj);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/SendPaymentLink', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {

            if (!UserExist) {
                err.message = 'Token';
                throw err;
            }
            return Setting.findOne({ where: { Name: 'OrderServicePaymentLink' }, });
        }).then(function (response) {
            return [response, SystemEmail.findOne({ where: { IdApp: req.query.idApp } }), EmailTemplate.findOne({ where: { Type: "Order Service Payment Link Email", } })];
        }).spread(function (objSetting, objEmail, objEmailTemplate) {
            if (objSetting != null && objEmailTemplate != null) {
                var TotalAmount = parseFloat(req.query.OrderTotal).toFixed(2);
                var urldata = req.query.id + "," + req.query.username + "," + req.query.Email;
                var query = "select tblorderserviceitem.* ,tblorderservice.OrderStatusId,tblorderservice.ImageUrl,tblorderservice.PurchaseOrderNumber,tblorderservice.OrderTotal from tblorderserviceitem inner join tblorderservice on tblorderservice.id= tblorderserviceitem.OrderId where tblorderserviceitem.OrderId=" + req.query.id;
                connection.query(query, function (err, lstorderdetail, fields) {
                    var OrderDetail = "";
                    for (var i = 0; i < lstorderdetail.length; i++) {
                        OrderDetail = OrderDetail + '<div>&nbsp;</div>' +
                            '<div>' + (i + 1).toString() + '.<span style="white-space:pre"> </span>' + lstorderdetail[i].AttributeDescription + ' (' + lstorderdetail[i].ProductName + ') -&gt; ' + lstorderdetail[i].AttributesXml + ' to ' + lstorderdetail[i].ItemWeight + '</div>' +
                            '<div>-----------------------------------------</div>' +
                            '<div>Amount Due = MYR ' + parseFloat(lstorderdetail[i].PriceInclTax).toFixed(2) + '</div>';
                    }

                    var url = objSetting.Value + '/' + jwt.encode(urldata, "bugz");
                    var link = url;
                    var body = objEmailTemplate.EmailBody.replace(/{Email}/g, req.query.Email).replace(/{AppName}/g, req.query.AppName).replace("{PaymentLink}", link).replace("{Amount}", TotalAmount).replace("{OrderDetail}", OrderDetail);
                    var mail = {
                        from: objEmail.DefaultEmailFrom,
                        to: req.query.Email,
                        subject: objEmailTemplate.EmailSubject,
                        html: body
                    };
                    SetsmtpConfig(objEmail, mail, function (EmailSettingCreated) {
                        // console.log(EmailSettingCreated)
                    })
                    funAuditLog.CreateAuditLog('Payment Link', decoded.username, 'Payment Link Send: (' + req.query.Email + ')');
                    res.json({
                        success: true,
                        message: "Payment Link Send to Customer Successfully.",
                    });
                });
            } else {
                if (objSetting == null) {
                    var obj = {
                        success: false,
                        message: "Please Add Payment Link in Setting.",
                    }
                    res.json(obj);
                } else {
                    var obj = {
                        success: false,
                        message: "Please Add Payment Link Email Template.",
                    }
                    res.json(obj);
                }
            }
        }).catch(function (error) {
            if (error.message === 'Token') {
                res.json(InvalidToken);
            } else {
                var obj = {
                    success: false,
                    message: "Payment Link can not send.",
                }
                res.json(obj);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/MakeStatusPaid', function (req, res) {
    objHeader = req.headers;
    var objOrder = null;
    var OldOrderCheckDate = new Date(process.env.OldOrderCheckDate);
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (!UserExist) {
                err.message = 'Token';
                throw err;
            }
            return OrderService.findOne({ where: { id: req.query.id } });

        }).then(function (resOrderFind) {
            if (resOrderFind != null) {

                resOrderFind.updateAttributes({
                    OrderStatusId: req.query.status,
                    CustomValuesXml: req.query.Remark,
                    ModifiedDate: new Date(),
                    Courier: decoded.username,
                    PaymentMethodSystemName: 'CASH',
                    PaidDateUtc: new Date(),
                    AuthorizationTransactionResult: 'Success'
                }).then(function (resUpdate) {

                    if (resOrderFind.CreatedOnUtc <= OldOrderCheckDate) {
                        if (resOrderFind.SubscriptionTransactionId == 2 || resOrderFind.SubscriptionTransactionId == '2') {
                            var objRenewTransaction = {
                                idOrder: resOrderFind.id,
                                idUser: resOrderFind.CustomerId,
                                idApp: resOrderFind.SubscriptionTransactionId,
                                Amount: resOrderFind.OrderTotal,
                                CreatedBy: decoded.username,
                                CreatedDate: new Date()
                            }
                            SaveRenewTransaction(objRenewTransaction)
                        }
                        var objres = {
                            success: true,
                            message: 'Order Service paid Successfully.',
                        }
                        res.json(objres);
                    } else {
                        OrderServiceDetail.findAll({
                            where: {
                                OrderId: req.query.id
                            }
                        }).then(function (lstOrderItem) {
                            var lstDeviceId = [];

                            for (var i = 0; i < lstOrderItem.length; i++) {
                                lstDeviceId.push(lstOrderItem[i].ProductName);
                            }

                            return LicenceManager.findAll({
                                where: {
                                    DeviceId: {
                                        $in: lstDeviceId
                                    },
                                    IsDeleted: false
                                }
                            }).then(function (lstLicenceList) {
                                return Vehicle.findAll({
                                    where: {
                                        deviceid: {
                                            $in: lstDeviceId
                                        },
                                        IsDelete: false
                                    }
                                }).then(function (lstVehicleList) {
                                    return [lstLicenceList, lstVehicleList];
                                })
                            })

                        }).spread(function (lstLicenceList, lstVehicleList) {
                            var TotalRecords = lstLicenceList.length;
                            // if (TotalRecords < lstVehicleList.length) {
                            //     TotalRecords = lstVehicleList.length;
                            // }
                            console.log(TotalRecords)

                            function UpdateLicenceVehicle(j) {
                                if (j < TotalRecords) {
                                    var UpdateDeviceId = lstLicenceList[j].DeviceId;
                                    var AddMonth = 0;
                                    if (lstLicenceList[j].LicenceRenewalType == 'Monthly') {
                                        AddMonth = 1;
                                    } else if (lstLicenceList[j].LicenceRenewalType == 'Quarterly') {
                                        AddMonth = 3;
                                    } else if (lstLicenceList[j].LicenceRenewalType == 'Yearly') {
                                        AddMonth = 12;
                                    }

                                    var oldexpdate = lstLicenceList[j].ExpiryDate;
                                    var date = new Date(lstLicenceList[j].ExpiryDate);
                                    var updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);

                                    var timeDiff = (new Date(oldexpdate)).getTime() - (new Date()).getTime();
                                    var diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
                                    days = diffDays;
                                    if (days < 0) {
                                        date = new Date();
                                        updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);
                                    }
                                    lstLicenceList[j].updateAttributes({ ExpiryDate: updatedDate }).then(function (resUpdateExpiryLicence) {
                                        var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
                                        if (objVehicle != undefined) {
                                            return objVehicle.updateAttributes({ renewaldate: updatedDate });
                                        } else {
                                            return {};
                                        }
                                    }).then(function (resVehicleUpdate) {
                                        var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
                                        if (objVehicle != undefined) {
                                            Commonfunction.UpdateVehicleRedis(objVehicle.deviceid, 'Vehicle');
                                        }
                                        UpdateLicenceVehicle(j + 1);
                                    });

                                } else {
                                    if (resOrderFind.SubscriptionTransactionId == 2 || resOrderFind.SubscriptionTransactionId == '2') {
                                        var objRenewTransaction = {
                                            idOrder: resOrderFind.id,
                                            idUser: resOrderFind.CustomerId,
                                            idApp: resOrderFind.SubscriptionTransactionId,
                                            Amount: resOrderFind.OrderTotal,
                                            CreatedBy: decoded.username,
                                            CreatedDate: new Date()
                                        }
                                        SaveRenewTransaction(objRenewTransaction)
                                    }
                                    return {
                                        success: true,
                                        message: 'Order Service paid Successfully.',
                                    };
                                }
                            }
                            UpdateLicenceVehicle(0);

                        }).then(function (resOrderServiceItem) {
                            var objres = {
                                success: true,
                                message: 'Order Service paid Successfully.',
                            }
                            res.json(objres);
                        });
                    }
                    // funAuditLog.CreateAuditLog('Order Make Paid', decoded.username, 'Order Status Change (' + req.query.Remark + ')');
                    // res.json({
                    //     success: true,
                    //     message: "Order Service paid Successfully."
                    // });
                });
            } else {

                res.json({
                    success: false,
                    message: "Order Service can not found. Try again later."
                });
            }
        }).catch(function (error) {
            if (err.message === 'Token') {
                res.json(InvalidToken);
            } else {
                var obj = {
                    success: false,
                    message: "Order Service Status can not change. Try again later.",
                }
                res.json(obj);
            }
        })

    } else {
        res.json(InvalidToken);
    }
})

router.get('/MakeStatusCancel', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function (UserExist) {
            if (!UserExist) {
                err.message = 'Token';
                throw err;
            }
            return OrderService.findOne({ where: { id: req.query.id } });

        }).then(function (resOrderFind) {
            if (resOrderFind != null) {
                resOrderFind.updateAttributes({
                    OrderStatusId: req.query.status,
                    ModifiedDate: new Date(),
                    Courier: decoded.username,
                }).then(function (resUpdate) {
                    var objres = {
                        success: true,
                        message: 'Order Service Cancel Successfully.',
                    }
                    res.json(objres);
                });
            } else {
                res.json({
                    success: false,
                    message: "Order Service can not found. Try again later."
                });
            }
        }).catch(function (error) {
            if (err.message === 'Token') {
                res.json(InvalidToken);
            } else {
                var obj = {
                    success: false,
                    message: "Order Service Status can not change. Try again later.",
                }
                res.json(obj);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

//Image APi
router.post('/uploadImage', function (req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/../MediaUploads/PaymentReceipt';
    var FileName = [];
    var lstOrder = [];
    //file upload path
    form.parse(req, function (err, fields, files) {
        //you can get fields here
    });
    form.on('fileBegin', function (name, file) {
        var ext = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
        var NewName = GetImageNameFromDate();
        if (ext.indexOf('?') > -1) {
            ext = ext.substring(0, ext.lastIndexOf('?'));
        };

        if (file.name.indexOf('.') == -1) {
            ext = '.jpg'
        }

        file.path = form.uploadDir + "/" + NewName + ext;
        FileName.push(NewName + ext);
        lstOrder.push(name);

        //modify file path
    });
    form.on('end', function () {
        var i = 0;

        function uploader(i) {
            if (i < FileName.length) {
                var orderId = parseInt(lstOrder[i]);
                OrderService.findOne({
                    where: {
                        id: orderId
                    }
                }).then(function (response) {
                    if (response != null) {
                        if (response.ImageUrl != '' && response.ImageUrl != null) {
                            var oldFile = __dirname + '/../MediaUploads/PaymentReceipt/' + response.ImageUrl;
                            fs.exists(oldFile, function (exists) {
                                if (exists) {
                                    fs.unlink(oldFile);
                                }
                            });
                        };
                        response.updateAttributes({
                            ImageUrl: FileName[i]
                        }).then(function (resUpdate) {
                            if ((i + 1) == FileName.length) {
                                res.json({
                                    success: true,
                                    message: "Receipt Save successfully.",
                                    data: FileName[i]
                                });
                            } else {
                                uploader(i + 1);
                            };
                        })
                    }
                })
            }
        }
        uploader(i);
        if (FileName.length == 0) {
            res.json({
                success: false,
                message: "Please Select atleast One File..."
            });
        }
        // res.sendStatus(200);
        //when finish all process
    });
});


router.get('/DeleteOrderReceipt', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                OrderService.findOne({
                    where: { id: req.query.id },
                }).then(function (response) {
                    if (response.ImageUrl != '' && response.ImageUrl != null) {
                        var oldFile = __dirname + '/../MediaUploads/PaymentReceipt/' + response.ImageUrl;
                        fs.exists(oldFile, function (exists) {
                            if (exists) {
                                fs.unlink(oldFile);
                            }
                        });
                    };
                    funAuditLog.CreateAuditLog('DeleteOrderReceipt', UserExist.username, "DeleteOrderReceipt User: " + UserExist.username + " idOrder : " + req.query.id + " ImageUrl : " + response.ImageUrl + " ");
                    return response.updateAttributes({ ImageUrl: null });
                }).then(function (resupdate) {
                    var obj = {
                        success: true,
                        message: "Receipt Delete Successfully",
                    }
                    res.json(obj);
                }).catch(function (error) {
                    var obj = {
                        success: false,
                        message: "Receipt can not Delete",
                    }
                    res.json(obj);
                })

            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});


router.get('/GetAllOrderDetailsByOrderId', function (req, res) {
    // console.log(req.query)
    // OrderServiceDetail.findAll({ where: { OrderId: req.query.OrderId } }).then(function(response) {
    //     res.json(response)
    // })
    var url = jwt.decode(req.query.url, "bugz");
    url = url.split(',');
    var OrderId = url[0];
    var username = url[1];
    var email = url[2];
    var query = "select tblorderserviceitem.* ,tblorderservice.OrderStatusId,tblorderservice.ImageUrl,tblorderservice.PurchaseOrderNumber,tblorderservice.OrderTotal from tblorderserviceitem inner join tblorderservice on tblorderservice.id= tblorderserviceitem.OrderId where tblorderserviceitem.OrderId=" + OrderId;
    connection.query(query, function (err, response, fields) {
        var obj = new Object();
        obj.lstOrderDetail = response;
        obj.username = username;
        obj.email = email;
        res.json(obj);
    })

})

router.post('/CVpayPaymentResponse', jsonParser, function (req, res) {
    var objPaymentResponse = req.body;
    console.log("================== CV Pay Payment Response =========================")
    console.log(objPaymentResponse);
    var PaymentStatus = "Fail";
    var OrderStatusId = 4;
    var lstDeviceId = '';
    if (objPaymentResponse.success == true) {
        PaymentStatus = "Success";
        OrderStatusId = 2;
    }
    var objOrder = null;
    var OldOrderCheckDate = new Date(process.env.OldOrderCheckDate);

    OrderService.findOne({ where: { AuthorizationTransactionCode: objPaymentResponse.RefNo } }).then(function (resOrderRepeat) {
        if (resOrderRepeat) {
            throw "Duplicate Order Found for this Transaction Id";
        }
        return OrderService.findOne({ where: { PurchaseOrderNumber: objPaymentResponse.customField } })
    }).then(function (resOrder) {
        objOrder = resOrder;
        if (!objOrder) {
            throw "No Order Found for this Order Number";
        }
        var updateorder = { AuthorizationTransactionCode: objPaymentResponse.RefNo, AuthorizationTransactionResult: PaymentStatus, OrderStatusId: OrderStatusId, CustomValuesXml: objPaymentResponse.cvpayMessage, PaymentMethodSystemName: 'CV PAY', PaidDateUtc: new Date(), ProcessingCharges: objPaymentResponse.TxnAmt };
        return resOrder.updateAttributes(updateorder);
    }).then(function (resUpdateOrder) {

        if (objPaymentResponse.success == false) {
            throw "Payment Fail with error " + objPaymentResponse.cvpayMessage;
        }

        if (objOrder.CreatedOnUtc <= OldOrderCheckDate) {
            throw "Old Order";
        }

        lstDeviceId = objOrder.OrderNotes.split(',');
        return [LicenceManager.findAll({
            where: {
                DeviceId: {
                    $in: lstDeviceId
                },
                IsDeleted: false
            }
        }), Vehicle.findAll({
            where: {
                deviceid: {
                    $in: lstDeviceId
                },
                IsDelete: false
            }
        })];
    }).spread(function (lstLicenceList, lstVehicleList) {
        var TotalRecords = lstLicenceList.length;
        function UpdateLicenceVehicle(j) {
            if (j < TotalRecords) {
                var UpdateDeviceId = lstLicenceList[j].DeviceId;
                var AddMonth = 0;
                if (lstLicenceList[j].LicenceRenewalType == 'Monthly') {
                    AddMonth = 1;
                } else if (lstLicenceList[j].LicenceRenewalType == 'Quarterly') {
                    AddMonth = 3;
                } else if (lstLicenceList[j].LicenceRenewalType == 'Yearly') {
                    AddMonth = 12;
                }

                var oldexpdate = lstLicenceList[j].ExpiryDate;
                var date = new Date(lstLicenceList[j].ExpiryDate);
                var updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);

                var timeDiff = (new Date(oldexpdate)).getTime() - (new Date()).getTime();
                var diffDays = Math.round(timeDiff / (1000 * 3600 * 24));
                days = diffDays;
                if (days < 0) {
                    date = new Date();
                    updatedDate = convertdateformat(date.setMonth(date.getMonth() + AddMonth), 3);
                }
                lstLicenceList[j].updateAttributes({ ExpiryDate: updatedDate }).then((resUpdateExpiryLicence) => {
                    var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
                    if (objVehicle != undefined) {
                        objVehicle.updateAttributes({ renewaldate: updatedDate }).then((resVehicleUpdate) => {
                            Commonfunction.UpdateVehicleRedis(objVehicle.deviceid, 'Vehicle');
                            UpdateLicenceVehicle(j + 1);
                        });
                    } else {
                        UpdateLicenceVehicle(j + 1);
                    }
                })

            } else {
                if (objOrder.SubscriptionTransactionId == 2 || objOrder.SubscriptionTransactionId == '2') {
                    var objRenewTransaction = {
                        idOrder: objOrder.id,
                        idUser: objOrder.CustomerId,
                        idApp: objOrder.SubscriptionTransactionId,
                        Amount: objOrder.OrderTotal,
                        CreatedBy: objOrder.CreatedBy,
                        CreatedDate: new Date()
                    }
                    SaveRenewTransaction(objRenewTransaction)
                }
                io.sockets.emit(objPaymentResponse.customField + 'PaymentStatus', { PaymentStatus: objPaymentResponse.success, TransactionId: objPaymentResponse.RefNo, message: objPaymentResponse.cvpayMessage });
                console.log('Licence Updated successfully.')
            }
        }
        UpdateLicenceVehicle(0);
    }).catch(function (err) {
        console.log("CVPAY Payment Response Error ===========")
        console.log(err);
        if (err == "Old Order") {
            if (objOrder.SubscriptionTransactionId == 2 || objOrder.SubscriptionTransactionId == '2') {
                var objRenewTransaction = {
                    idOrder: objOrder.id,
                    idUser: objOrder.CustomerId,
                    idApp: objOrder.SubscriptionTransactionId,
                    Amount: objOrder.OrderTotal,
                    CreatedBy: objOrder.CreatedBy,
                    CreatedDate: new Date()
                }
                SaveRenewTransaction(objRenewTransaction)
            }
        }
        io.sockets.emit(objPaymentResponse.customField + 'PaymentStatus', { PaymentStatus: objPaymentResponse.success, TransactionId: objPaymentResponse.RefNo, message: objPaymentResponse.cvpayMessage });
    })

    res.send("OK");
})

function GetImageNameFromDate() {
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
//Order API End
//////////

function GetDevicePricebyDeviceIds(lstProduct, lstGpsDeviceCheck) {
    return new Promise((resolve, reject) => {
        var Query = `SELECT 
                        tgd.DeviceId,
                        tgd.Type,
                        tda.agentId,
                        tda.idDistributor,
                        tl.LicenceRenewalType,
                        tl.LicenceType,
                        tdrp.Price
                    FROM
                        tblgpsdevice tgd
                            INNER JOIN
                        tbldeviceagentretailer tda ON tgd.DeviceId = tda.deviceId
                            INNER JOIN
                        tbllicencemanager tl ON tgd.DeviceId = tl.DeviceId
                            INNER JOIN
                        tbldevicerenewprice tdrp ON (tdrp.IdUser = tda.agentId
                            OR tdrp.IdUser = tda.idDistributor)
                            AND tdrp.Type = tgd.Type
                            AND tdrp.LicenceRenewalType = tl.LicenceRenewalType
                            AND tdrp.LicenceType = tl.LicenceType
                    WHERE
                        tgd.DeviceId IN (`+ lstGpsDeviceCheck + `);`;
        DBConnection.query(Query).then(function (lstRenewPrice) {
            var OrderTotal = 0;
            var SalesAgentId = null;
            var DistributorId = null;
            for (var i = 0; i < lstProduct.length; i++) {
                var DeviceId = lstProduct[i].deviceid.toString();
                var objRenewPrice = u.findWhere(lstRenewPrice, { DeviceId: DeviceId });
                if (objRenewPrice) {
                    SalesAgentId = objRenewPrice.agentId;
                    DistributorId = objRenewPrice.idDistributor;
                    lstProduct[i].RenewPrice = objRenewPrice.Price;
                    lstProduct[i].SalesAgentId = SalesAgentId;
                    lstProduct[i].DistributorId = DistributorId;

                } else {
                    lstProduct[i].RenewPrice = 0;
                    lstProduct[i].SalesAgentId = null;
                    lstProduct[i].DistributorId = null;
                }
                OrderTotal = OrderTotal + lstProduct[i].RenewPrice;
            }
            resolve({
                lstProduct: lstProduct,
                OrderTotal: OrderTotal,
                SalesAgentId: SalesAgentId,
                DistributorId: DistributorId
            })
        })
    });
}

function SaveRenewTransaction(objdata) {
    return new Promise((resolve, reject) => {
        RenewTransaction.create(objdata).then(function (resrenewtransaction) {
            resolve(resrenewtransaction);
        })
    });
}

router.get('/GetCVPayPaymentData', function (req, res) {
    res.json({ MerchantId: process.env.CVPayMerchantId, PaymentURL: process.env.CVPayPaymentURL });
})

// router.get('/GetTestdata', function (req, res) {
//     OrderService.findOne({ where: { id: req.query.idOrder } }).then(function (resOrder) {
//         // var CheckDate = "2020-08-20 15:59:59 GMT";
//         var OldOrderCheckDate = new Date(process.env.OldOrderCheckDate);
//         console.log(resOrder.CreatedOnUtc, OldOrderCheckDate)
//         if (resOrder.CreatedOnUtc <= OldOrderCheckDate) {
//             console.log(true)
//             res.json(true);
//         } else {
//             console.log(false)
//             res.json(false);
//         }
//     })
// })

module.exports = router;