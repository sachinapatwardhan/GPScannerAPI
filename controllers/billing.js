var router = express.Router();

var User = models.tbluserinformation;
var OrderService = models.tblorderservice;
var OrderServiceDetail = models.tblorderserviceitem;
var OrderServiceStatus = models.tblorderservicestatus;
var LicenceManager = models.tbllicencemanager;
var Vehicle = models.tblvehicle;
var Commonfunction = require('./common.js');

//////////

// Billing API start
router.get('/GetAllVehicleExpirebyUser', jsonParser, function(req, res) {

    var query = "SELECT tv.id,tv.Name,tv.deviceid,tv.renewaldate,tl.LicenceRenewalType,tl.LicenceType,tl.id as LicenceId,tl.LicenceNo " +
        "FROM tblvehicle tv " +
        "left join tbllicencemanager tl on tv.deviceid=tl.DeviceId and tl.IsDeleted=false " +
        "where tv.iduser=" + req.query.idUser + " and tv.IsDelete=false;";
    connection.query(query, function(err, lstAllVehicle, fields) {
        if (!err) {
            res.json(lstAllVehicle);
        } else {
            res.json([]);
        }
    })
})

router.get('/GetPriceByApp', jsonParser, function(req, res) {

    var query = "SELECT p.Id,p.ProductTypeId,p.Name,p.Sku as LicenceType,pam.ProductAttributeId,pa.Name as CountryName,pav.Name as LicenceRenewalType,pav.PriceAdjustment as Price " +
        "FROM product p  " +
        "inner join product_productattribute_mapping pam on p.Id = pam.ProductId  " +
        "inner join productattribute pa on pa.Id = pam.ProductAttributeId   " +
        "inner join tbluserinformation tu on pa.Name= tu.country and tu.id=" + req.query.idUser + " " +
        "inner join productattributevalue pav on pav.ProductAttributeMappingId=pam.Id " +
        "where p.ProductTypeId=" + req.query.idApp + " and p.Name='Licence Renew'";
    connection.query(query, function(err, lstAllPrice, fields) {
        if (!err) {
            res.json(lstAllPrice);
        } else {
            res.json([]);
        }
    })
})

router.post('/SaveOrderService', jsonParser, function(req, res) {
    objOrderservice = req.body;
    objHeader = req.headers;
    var OrderTotal = 0;
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
        }).then(function(UserExist) {

            if (!UserExist) {
                err.message = 'Token';
                throw err;
            }

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
            objOrder.CreatedBy = decoded.username;
            objOrder.PaymentMethodAdditionalFeeInclTax = 0;
            objOrder.PaymentMethodAdditionalFeeExclTax = 0;
            objOrder.ProcessingCharges = 0;
            objOrder.PaymentStatusId = null;
            objOrder.Deleted = false;
            objOrder.ShippAddress1 = lstProduct[0].CountryName;

            return OrderService.create(objOrder);

        }).then(function(resOrder) {
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
        .then(function(resOrderServiceItem) {
            res.json({
                success: true,
                message: 'Order created successfully.',
            });
        }).catch(function(err) {
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
router.get('/GetAllVehicleOrderbyUser', jsonParser, function(req, res) {

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
    connection.query(query, function(err, lstAllOrder, fields) {

        connection.query(countquery, function(err, TotalRecord, fields) {


            var groups = u.groupBy(lstAllOrder, function(o) {

                return o.id;
            });

            var lstfinaldata = u.map(groups, function(group, id) {
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

            lstfinaldata = u.sortBy(lstfinaldata, function(o) { return -o.CreatedOnUtc; })

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


router.get('/GetBillingdata', function(req, res) {
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

router.get('/GetEncryptedBillingdata', function(req, res) {
    try {
        var objdata = {};
        req.query.Message.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
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


router.post('/WebCashResponseUrl', jsonParser, function(req, res) {
    var resdata = req.body;
    var resdataparam = req.query;

    var objConnection = {
        OrderNumber: resdataparam.OrderNumber,
    }
    io.sockets.emit(resdataparam.OrderNumber + 'WebCashResponse', JSON.stringify(objConnection));

    var MerchantID = '80000155'
    var MerchantKey = '123456'
    var Merchantenquiry = 'https://staging.webcash.com.my/enquiry.php?'

    OrderService.findOne({
        where: { PurchaseOrderNumber: resdataparam.OrderNumber },
    }).then(function(response) {
        if (response != null) {
            if (JSON.stringify(resdata) == "{}") {
                var QString = "ord_mercID=" + MerchantID + "&ord_mercref=" + response.CaptureTransactionResult + "&ord_totalamt=" + parseFloat(response.OrderTotal).toFixed(2);
                //var QString = "MerchantCode=M11071&RefNo=WLT2904&Amount=20.00";                
                request.get({
                    headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    url: Merchantenquiry + QString,
                    //body: QString
                }, function(error, resWebCase, resData) {
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

                        response.updateAttributes({ AuthorizationTransactionResult: Status, OrderStatusId: OrderStatus }).then(function(resupdatedata) {

                            if (Status == "Success") {
                                OrderServiceDetail.findAll({
                                    where: {
                                        OrderId: response.id
                                    }
                                }).then(function(lstOrderItem) {
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
                                            lstLicenceList[j].updateAttributes({ ExpiryDate: updatedDate }).then(function(resUpdateExpiryLicence) {
                                                var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
                                                if (objVehicle != undefined) {
                                                    return objVehicle.updateAttributes({ renewaldate: updatedDate });
                                                    Commonfunction.UpdateVehicleRedis(objVehicle.deviceid, 'Vehicle');
                                                } else {
                                                    return {};
                                                }
                                            }).then(function(resVehicleUpdate) {
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

                                }).then(function(resOrderServiceItem) {
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
                            message: "Wallet Does Not Created Successfully...",
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

                response.updateAttributes({ AuthorizationTransactionResult: Status, OrderStatusId: OrderStatus }).then(function(resupdatedata) {

                    if (Status == "Success") {
                        OrderServiceDetail.findAll({
                            where: {
                                OrderId: response.id
                            }
                        }).then(function(lstOrderItem) {
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
                                    lstLicenceList[j].updateAttributes({ ExpiryDate: updatedDate }).then(function(resUpdateExpiryLicence) {
                                        var objVehicle = u.findWhere(lstVehicleList, { deviceid: UpdateDeviceId });
                                        if (objVehicle != undefined) {
                                            return objVehicle.updateAttributes({ renewaldate: updatedDate });
                                        } else {
                                            return {};
                                        }
                                    }).then(function(resVehicleUpdate) {
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

                        }).then(function(resOrderServiceItem) {
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
    }).catch(function(error) {
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

router.get('/UpdateReferenceNumber', function(req, res) {
    var PurchaseOrderNumber = new Date();
    var RefNumber = "T" + GetRandomWord() + Date.parse(PurchaseOrderNumber)
    OrderService.findOne({
        where: { PurchaseOrderNumber: req.query.OrderNumber },
    }).then(function(response) {
        return response.updateAttributes({ CaptureTransactionResult: RefNumber });
    }).then(function(resupdate) {
        var obj = {
            success: true,
            message: "Reference Number UpdatedSuccessfully",
            data: RefNumber
        }
        res.json(obj);
    }).catch(function(error) {
        var obj = {
            success: false,
            message: "Reference Number can not update",
        }
        res.json(obj);
    })
});

router.post('/SaveOrderServiceNew', jsonParser, function(req, res) {
    objOrderservice = req.body;
    objHeader = req.headers;
    var OrderTotal = objOrderservice.OrderTotal;
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
            }).then(function(UserExist) {

                if (!UserExist) {
                    err.message = 'Token';
                    throw err;
                }

                for (var i = 0; i < lstProduct.length; i++) {
                    // OrderTotal = OrderTotal + lstProduct[i].RenewPrice;
                    if (DeviceId == '') {
                        DeviceId = lstProduct[i].deviceid;
                    } else {
                        DeviceId = DeviceId + "," + lstProduct[i].deviceid;
                    }
                }
                console.log("Order Total = " + OrderTotal)
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

                return OrderService.create(objOrder);
            }).then(function(resOrder) {
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
                    lstOrderServiceItem.push(objOrderDetail);
                    lstLicenceId.push(lstProduct[i].LicenceId);
                    lstDeviceId.push(lstProduct[i].deviceid);
                }
                return OrderServiceDetail.bulkCreate(lstOrderServiceItem);

            })
            .then(function(resOrderServiceItem) {
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
                        res.json({
                            success: true,
                            message: 'Order created successfully.',
                        });
                    }
                }
                UpdateLicenceVehicle(0, (resobj) => {
                    return resobj;
                });

            }).catch(function(err) {
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

//Order API End
//////////

module.exports = router;