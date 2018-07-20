var router = express.Router();
var OrderService = models.tblorderservice;
var User = models.tbluserinformation;
var OrderService = models.tblorderservice;
var OrderServiceDetail = models.tblorderserviceitem;
var OrderServiceStatus = models.tblorderservicestatus;
var LicenceManager = models.tbllicencemanager;
var Vehicle = models.tblvehicle;
var Setting = models.tblsetting;
var SystemEmail = models.tblemailsettingsys;
var EmailTemplate = models.tblemailtemplate;

var rule = new schedule.RecurrenceRule();
// rule.minute = new schedule.Range(0, 0, 1);

// call every day 9 AM 
var GetAllExpiredSoonOrder = schedule.scheduleJob('0 0 9 * * *', function() {
    //GetAllPrice
    var query = "SELECT tu.id as userId,p.Id,p.ProductTypeId,p.Name,p.Sku as LicenceType,pam.ProductAttributeId,pa.Name as CountryName,pav.Name as LicenceRenewalType,pav.PriceAdjustment as Price " +
        "FROM product p  " +
        "inner join product_productattribute_mapping pam on p.Id = pam.ProductId  " +
        "inner join productattribute pa on pa.Id = pam.ProductAttributeId   " +
        "inner join tbluserinformation tu on pa.Name= tu.country " +
        "inner join productattributevalue pav on pav.ProductAttributeMappingId=pam.Id " +
        "where p.Name='Licence Renew'";
    connection.query(query, function(err, lstAllPrice, fields) {
        if (!err) {
            var lstAllPrice = lstAllPrice;
            var query = "SELECT ta.AppName,tu.idApp,tv.iduser,tv.id,tv.Name,tv.deviceid,tv.renewaldate,tl.LicenceRenewalType,tl.LicenceType,tl.id as LicenceId,tl.LicenceNo,tu.username,tu.email " +
                "FROM tblvehicle tv " +
                "left join tbllicencemanager tl on tv.deviceid=tl.DeviceId and tl.IsDeleted=false " +
                "inner join tbluserinformation tu on tv.iduser = tu.id " +
                "left join tblappinfo ta on ta.id = tu.idApp " +
                "where tv.IsDelete=false and Date(tv.renewaldate)<='" + genratedate() + "'";
            connection.query(query, function(err, response, fields) {
                if (!err) {
                    var groups = u.groupBy(response, function(value) {
                        return value.iduser;
                    });
                    var lstAllVehicle = u.map(groups, function(group) {
                        return {
                            idUser: group[0].iduser,
                            idApp: group[0].idApp,
                            AppName: group[0].AppName,
                            username: group[0].username,
                            email: group[0].email,
                            Order: group
                        }
                    })

                    function uploader(i) {
                        if (i < lstAllVehicle.length) {
                            var idUser = lstAllVehicle[i].idUser;
                            var Order = lstAllVehicle[i].Order;
                            var lstAllPrice1 = u.filter(lstAllPrice, function(o) { if (o.userId == idUser && o.ProductTypeId == lstAllVehicle[i].idApp) { return o; } });
                            for (var j = 0; j < Order.length; j++) {
                                var lstAllPrice2 = u.findWhere(lstAllPrice1, { LicenceRenewalType: Order[j].LicenceRenewalType, LicenceType: Order[j].LicenceType });
                                if (lstAllPrice2 != undefined) {
                                    Order[j].RenewPrice = lstAllPrice2.Price;
                                    Order[j].CountryName = lstAllPrice2.CountryName;
                                    Order[j].ProductId = lstAllPrice2.Id;
                                } else {
                                    Order[j].RenewPrice = 'N/A';
                                    Order[j].CountryName = 'N/A';
                                    Order[j].ProductId = null;
                                }
                                if (Order[j].renewaldate != null && Order[j].renewaldate != '') {
                                    Order[j].ExpireDate = moment(Order[j].renewaldate).format('DD-MM-YYYY');
                                } else {
                                    Order[j].ExpireDate = 'N/A';
                                }

                                if (Order[j].LicenceRenewalType != null && Order[j].LicenceRenewalType != '') {
                                    var nextRenewalDate = new Date(Order[j].renewaldate);
                                    if (Order[j].LicenceRenewalType == 'Monthly') {
                                        Order[j].UOM = '1M';
                                        nextRenewalDate = nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
                                    } else if (Order[j].LicenceRenewalType == 'Quarterly') {
                                        Order[j].UOM = '3M';
                                        nextRenewalDate = nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 3);
                                    } else {
                                        Order[j].UOM = '12M';
                                        nextRenewalDate = nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 12);
                                    }
                                    Order[j].NextExpireDate = moment(nextRenewalDate).format('DD-MM-YYYY');

                                } else {
                                    Order[j].UOM = 'N/A';
                                }
                            }
                            if (lstAllVehicle[i].AppName == 'Maark') {
                                CreateOrder(lstAllVehicle[i], function(Ordercreated) {
                                    uploader(i + 1);
                                });
                            }

                        }
                    }
                    uploader(0)
                        // lstAllVehicle
                } else {}
            })
        } else {}
    })
})

// GetAllExpiredSoonOrder()

function CreateOrder(objOrderservice, CallbackOrder) {
    var lstLicenceId = [];
    var lstDeviceId = [];
    var PurchaseOrderNumber = new Date();
    OrderNumber = "BILLNO" + GetRandomWord() + Date.parse(PurchaseOrderNumber)
    var lstProduct = objOrderservice.Order;
    var OrderTotal = 0;
    var DeviceId = '';
    for (var i = 0; i < lstProduct.length; i++) {
        OrderTotal = OrderTotal + lstProduct[i].RenewPrice;
        if (DeviceId == '') {
            DeviceId = lstProduct[i].deviceid;
        } else {
            DeviceId = DeviceId + "," + lstProduct[i].deviceid;
        }
    }


    var objOrder = new Object();
    objOrder.CustomerId = objOrderservice.idUser;
    objOrder.CreatedOnUtc = new Date();
    // objOrder.ExpiryDate = AddDate(objOrder.CreatedOnUtc, 1, "Year");
    // objOrder.ExpiryDurationValue = 1;
    // objOrder.ExpiryDurationType = "Year";
    objOrder.MerchantId = 0;
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
    objOrder.CreatedBy = 'Admin';
    objOrder.PaymentMethodAdditionalFeeInclTax = 0;
    objOrder.PaymentMethodAdditionalFeeExclTax = 0;
    objOrder.ProcessingCharges = 0;
    objOrder.PaymentStatusId = null;
    objOrder.Deleted = false;
    objOrder.ShippAddress1 = lstProduct[0].CountryName;
    objOrder.OrderStatus = 2;
    objOrder.AuthorizationTransactionResult = 'Success';
    var OrderId = '';
    return OrderService.create(objOrder).then(function(resOrder) {
        if (!resOrder) {
            err.message = 'Order could not created. Try again later.';
            throw err;
        }
        var lstOrderServiceItem = [];
        OrderId = resOrder.id;
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
            lstOrderServiceItem.push(objOrderDetail);
            lstLicenceId.push(lstProduct[i].LicenceId);
            lstDeviceId.push(lstProduct[i].deviceid);
        }
        return OrderServiceDetail.bulkCreate(lstOrderServiceItem);

    }).then(function(resOrderServiceItem) {
        // res.json({
        //     success: true,
        //     message: 'Order created successfully.',


        return LicenceManager.findAll({
            where: {
                Id: {
                    $in: lstLicenceId
                },
                IsDeleted: false
            }
        }).then(function(lstLicenceList) {
            return Vehicle.findAll({
                where: {
                    deviceid: {
                        $in: lstDeviceId
                    },
                    IsDelete: false
                }
            }).then(function(lstVehicleList) {
                return [lstLicenceList, lstVehicleList];
            })
        })

    }).spread(function(lstLicenceList, lstVehicleList) {
        var TotalRecords = lstLicenceList.length;

        function UpdateLicenceVehicle(j, Callback) {
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
                            UpdateLicenceVehicle(j + 1, Callback);
                        });
                    } else {
                        UpdateLicenceVehicle(j + 1, Callback);
                    }
                })

            } else {
                var LinkInfo = {
                    id: OrderId,
                    PurchaseOrderNumber: objOrder.PurchaseOrderNumber,
                    Email: objOrderservice.email,
                    OrderTotal: objOrder.OrderTotal,
                    idUser: objOrderservice.idUser,
                    idApp: objOrderservice.idApp,
                    AppName: objOrderservice.AppName,
                    username: objOrderservice.username,
                }
                SendPaymentLink(LinkInfo, function(callbacklink) {
                    return CallbackOrder({
                        success: true,
                        message: "Order created ...",
                    });
                })

                // res.json({
                //     success: true,
                //     message: 'Order created successfully.',
                // });
            }
        }
        UpdateLicenceVehicle(0, (resobj) => {
            return resobj;
        });


    }).then(function() {
        // res.json({
        //     success: true,
        //     message: 'Order created successfully.',
        // });
    }).catch(function(err) {
        if (err.message === 'Token') {
            // res.json(InvalidToken);
        } else {
            // res.json({
            //     success: false,
            //     message: "Order Could not created. Try again later."
            // });
            console.error('[' + moment().format('DD/MM/YYYY hh:mm:ss a') + '] ' + (err.stack || err.message));
        }
    });

}


function SendPaymentLink(LinkInfo, Callback) {
    Setting.findOne({ where: { Name: 'OrderServicePaymentLink' }, }).then(function(response) {
        return [response, SystemEmail.findOne({ where: { IdApp: LinkInfo.idApp } }), EmailTemplate.findOne({ where: { Type: "Order Service Payment Link Email", } })];
    }).spread(function(objSetting, objEmail, objEmailTemplate) {
        if (objSetting != null && objEmailTemplate != null) {
            var TotalAmount = parseFloat(LinkInfo.OrderTotal).toFixed(2);
            var urldata = LinkInfo.id + "," + LinkInfo.username + "," + LinkInfo.Email;
            var query = "select tblorderserviceitem.* ,tblorderservice.OrderStatusId,tblorderservice.ImageUrl,tblorderservice.PurchaseOrderNumber,tblorderservice.OrderTotal from tblorderserviceitem inner join tblorderservice on tblorderservice.id= tblorderserviceitem.OrderId where tblorderserviceitem.OrderId=" + LinkInfo.id;
            connection.query(query, function(err, lstorderdetail, fields) {
                var OrderDetail = "";
                for (var i = 0; i < lstorderdetail.length; i++) {
                    OrderDetail = OrderDetail + '<div>&nbsp;</div>' +
                        '<div>' + (i + 1).toString() + '.<span style="white-space:pre"> </span>' + lstorderdetail[i].AttributeDescription + ' (' + lstorderdetail[i].ProductName + ') -&gt; ' + lstorderdetail[i].AttributesXml + ' to ' + lstorderdetail[i].ItemWeight + '</div>' +
                        '<div>-----------------------------------------</div>' +
                        '<div>Amount Due = MYR ' + parseFloat(lstorderdetail[i].PriceInclTax).toFixed(2) + '</div>';
                }

                var url = objSetting.Value + '/' + jwt.encode(urldata, "bugz");
                var link = url;
                var body = objEmailTemplate.EmailBody.replace(/{Email}/g, LinkInfo.Email).replace(/{AppName}/g, LinkInfo.AppName).replace("{PaymentLink}", link).replace("{Amount}", TotalAmount).replace("{OrderDetail}", OrderDetail);
                var mail = {
                    from: objEmail.DefaultEmailFrom,
                    to: LinkInfo.Email,
                    subject: objEmailTemplate.EmailSubject,
                    html: body
                };
                SetsmtpConfig(objEmail, mail, function(EmailSettingCreated) {
                    // console.log(EmailSettingCreated)
                })

                // funAuditLog.CreateAuditLog('Payment Link', decoded.username, 'Payment Link Send: (' + LinkInfo.Email + ')');
                return Callback({
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
                return Callback(obj);
            }
        }
    }).catch(function(error) {
        if (error.message === 'Token') {
            res.json(InvalidToken);
        } else {
            var obj = {
                success: false,
                message: "Payment Link can not send.",
            }
            return Callback(obj);
        }
    })

}



function genratedate() {
    var TodayDate = new Date();
    TodayDate.setDate(TodayDate.getDate() - 30);
    var year = TodayDate.getUTCFullYear();
    var month = TodayDate.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = TodayDate.getUTCDate();
    return ("0000" + year.toString()).slice(-4) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2);
}


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

module.exports = router;