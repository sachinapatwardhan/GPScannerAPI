//Tables
var router = express.Router();
var OrderService = models.tblorderservice;
var OrderServiceDetail = models.tblorderserviceitem;
var OrderServiceStatus = models.tblorderservicestatus;
var LicenceManager = models.tbllicencemanager;
var Vehicle = models.tblvehicle;
var User = models.tbluserinformation;

router.get('/GetRenewDeviceInfo', jsonParser, function (req, res) {

    var objSearch = req.query.Search;
    var search = '';
    if (objSearch != null && objSearch != '' && objSearch != undefined) {
        search = " AND (tu.username = '" + objSearch + "' or ";
        search = search + "tu.email = '" + objSearch + "' or ";
        search = search + "tl.DeviceId ='" + objSearch + "' or ";
        search = search + "tv.Name ='" + objSearch + "') ";
    };

    var query = "SELECT tl.Id, tl.LicenceNo,tu.email,CONVERT_TZ(tu.LastLogin,'+00:00','+05:30') as LastLoginDate,tgd.Type,tdp.Price,tv.renewaldate, " +
        " tl.DeviceId, tv.iduser, tu.phone,tu.username, tv.Name as VehicleName, ta.Id as idApp, ta.AppName, " +
        " tl.LicenceRenewalType, tl.LicenceType, ta.LicenceRenewalType as appLicenceRenewalType, " +
        " ta.LicenceType as appLicenceType, CONVERT_TZ(tl.ExpiryDate, '+00:00', '+05:30') as ExpiryDate " +
        " from tbllicencemanager as tl  " +
        " INNER JOIN tblappinfo as ta ON ta.Id = tl.idApp " +
        " INNER JOIN (Select * from tblvehicle where IsDelete = 0) tv on tv.deviceid = tl.DeviceId " +
        " INNER JOIN tblgpsdevice tgd on tgd.DeviceId = tv.deviceid" +
        " INNER JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
        " LEFT JOIN (select * from tbldevicerenewprice where IdUser=" + req.query.idUser + " ) as tdp ON tdp.Type = tgd.Type " +
        " where tl.IsDeleted = 0 AND ta.Id = " + req.query.idApp + " " + search + " order by tl.ExpiryDate asc";
    connection.query(query, function (err, response) {
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
                obj.Type = response[i].Type;
                obj.username = response[i].username;
                obj.renewaldate = response[i].renewaldate;
                obj.LicenceNo = response[i].LicenceNo;
                if (response[i].Price != null && response[i].Price != undefined && response[i].Price != '') {
                    obj.Price = response[i].Price;
                } else {
                    obj.Price = 0;
                }
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
            } else {
                res.json(lstAllVehicle);
            }
        }
        getData(0);


    })


})

router.post('/SaveOrderServiceRenew', jsonParser, function (req, res) {
    objOrderservice = req.body;
    objHeader = req.headers;
    var OrderTotal = objOrderservice.OrderTotal;
    var Remark = objOrderservice.Terms;
    var DeviceId = ''
    var lstProduct = objOrderservice.lstProduct;
    var lstLicenceId = [];
    var lstDeviceId = [];
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
                if (DeviceId == '') {
                    DeviceId = lstProduct[i].DeviceId;
                } else {
                    DeviceId = DeviceId + "," + lstProduct[i].DeviceId;
                }
            }
            var objOrder = new Object();
            objOrder.CustomerId = objOrderservice.idUser;
            objOrder.CreatedOnUtc = new Date();
            objOrder.MerchantId = 0;
            objOrder.PurchaseOrderNumber = OrderNumber;
            objOrder.CustomerCurrencyCode = "MYR / Rs";
            objOrder.OrderTotal = OrderTotal;
            objOrder.OrderNotes = DeviceId;
            objOrder.SettlementCur = "MYR / Rs";
            objOrder.OrderStatusId = 2;
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
            objOrder.Terms = Remark;
            objOrder.ModifiedDate = new Date();
            objOrder.Courier = decoded.username;

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
                objOrderDetail.ProductName = lstProduct[i].DeviceId;
                objOrderDetail.Quantity = 1;
                objOrderDetail.UnitPriceInclTax = lstProduct[i].Price;
                objOrderDetail.UnitPriceExclTax = lstProduct[i].Price;
                objOrderDetail.idOrderStatus = 2;
                objOrderDetail.PriceInclTax = lstProduct[i].Price;
                objOrderDetail.PriceExclTax = lstProduct[i].Price;
                objOrderDetail.UOM = lstProduct[i].UOM;
                objOrderDetail.sku = lstProduct[i].LicenceType;
                objOrderDetail.Attribute = lstProduct[i].LicenceNo;
                objOrderDetail.AttributeValue = lstProduct[i].LicenceRenewalType;
                objOrderDetail.AttributeDescription = lstProduct[i].VehicleName;
                objOrderDetail.AttributesXml = lstProduct[i].ExpiryDate;
                objOrderDetail.ItemWeight = lstProduct[i].NextExpireDate;
                objOrderDetail.CaptureTransactionResult = lstProduct[i].RefNumber;
                lstOrderServiceItem.push(objOrderDetail);
                lstLicenceId.push(lstProduct[i].Id);
                lstDeviceId.push(lstProduct[i].DeviceId);
            }
            return OrderServiceDetail.bulkCreate(lstOrderServiceItem);

        }).then(function (resOrderServiceItem) {
            return [LicenceManager.findAll({
                where: {
                    Id: {
                        $in: lstLicenceId
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
                                // Commonfunction.UpdateVehicleRedis(objVehicle.deviceid, 'Vehicle');
                                UpdateLicenceVehicle(j + 1);
                            });
                        } else {
                            UpdateLicenceVehicle(j + 1);
                        }
                    })

                } else {
                    res.json({
                        success: true,
                        message: 'Device renewed successfully.',
                    });
                }
            }
            UpdateLicenceVehicle(0);
        })
            .catch(function (err) {
                if (err.message === 'Token') {
                    res.json(InvalidToken);
                } else {
                    res.json({
                        success: false,
                        message: "Device Could not renewed. Try again later."
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

module.exports = router