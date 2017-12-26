var router = express.Router();
var PaymentSummary = models.tblpaymentsummary;
var OrderService = models.tblorderservice;
var OrderServiceStatus = models.tblorderservicestatus;
var OrderServiceDetail = models.tblorderserviceitem;
var User = models.tbluserinformation;
var Product = models.product;
var ProductAttributeMapping = models.product_productattribute_mapping;
var ProductAttribute = models.productattribute;
var ProductAttributeValue = models.productattributevalue;
var AppInfo = models.tblappinfo;

//
// CreateOrderServiceGlobal("India", 1, "0000000000000", "IMMM", function(redds) {
//     console.log(redds)
// })

function convertdateUTCformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getUTCMonth() + 1;
    var firstdayDay = date.getUTCDate();
    var firstdayYear = date.getUTCFullYear();
    var firstdayHours = date.getUTCHours();
    var firstdayMinutes = date.getUTCMinutes();
    var firstdaySeconds = date.getUTCSeconds();
    if (flg == 2) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " 23:59:59";
    } else {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " 00:00:00";
    }
}

function AddDate(oldDate, offset, offsetType) {
    var year = parseInt(oldDate.getFullYear());
    var month = parseInt(oldDate.getMonth());
    var date = parseInt(oldDate.getDate());
    var hour = parseInt(oldDate.getHours());
    var newDate;
    if (offsetType == "Year") {
        newDate = new Date(year + offset, month, date, hour);
    } else if (offsetType == "Month") {
        newDate = new Date(year, month + offset, date, hour);
    } else if (offsetType == "Day" || offsetType == "Week") {
        newDate = new Date(year, month, date + offset, hour);
    }
    return newDate;
}

var maxLength = 1;
var minLength = 1;
var uppercaseMinCount = 1;
var numberMinCount = 1;
var UPPERCASE_RE = /([A-Z])/g;
var NUMBER_RE = /([\d])/g;
var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

function isStrongEnough(randomWord) {
    var uc = randomWord.match(UPPERCASE_RE);
    var n = randomWord.match(NUMBER_RE);
    var nr = randomWord.match(NON_REPEATING_CHAR_RE);
    return randomWord.length >= minLength && !nr && uc && uc.length >= uppercaseMinCount;
}

function GetRandomWord() {

    var randomWord = "";
    var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
    while (!isStrongEnough(randomWord)) {
        randomWord = generatePassword(randomLength, false, /[\w\d\?\-]/);
    }
    return randomWord;
}

//======================================================================

router.get('/GetAllOrderService', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};

    if (objSearch != null && objSearch != '') {
        search['$or'] = [];

        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;

                if (columnName != 'CreatedOnUtc' && columnName != 'ExpiryDate') {
                    if (columnName == "AppName") {
                        search['$or'].push(['tblappinfo.AppName like ?', "%" + objSearch + "%"]);
                    } else if (columnName == 'Email') {
                        search['$or'].push(['tbluserinformation.email like ?', "%" + objSearch + "%"]);
                    } else if (columnName == 'UserName') {
                        search['$or'].push(['tbluserinformation.username like ?', "%" + objSearch + "%"]);
                    } else {
                        search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                    }
                }
            };
        };
    }

    OrderService.hasOne(OrderServiceDetail, {
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

    OrderService.belongsTo(User, {
        foreignKey: {
            name: 'CustomerId',
            allowNull: false
        }
    });

    OrderService.belongsTo(AppInfo, {
        foreignKey: {
            name: 'SubscriptionTransactionId',
            allowNull: false
        }
    })

    if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined && objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {

        // search['$and'] = [];
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }

        var StartDate = convertdateUTCformat(objParam.StartDate);
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);

        var obj = new Object();
        obj['ExpiryDate'] = {
            $between: [StartDate, EndDate]
        };
        search['$or'].push(obj);

        var obj1 = new Object();
        obj1['CreatedOnUtc'] = {
            $between: [StartDate, EndDate]
        };
        search['$or'].push(obj1);

    } else if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined) {

        // if (search['$and'] == undefined) {
        //     search['$and'] = [];
        // }
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }

        var StartDate = convertdateUTCformat(objParam.StartDate);
        var obj = new Object();
        obj['ExpiryDate'] = {
            $gte: StartDate
        };
        search['$or'].push(obj);

        var obj1 = new Object();
        obj1['CreatedOnUtc'] = {
            $gte: StartDate
        };
        search['$or'].push(obj1);
    } else if (objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {
        // if (search['$and'] == undefined) {
        //     search['$and'] = [];
        // }
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);

        var obj = new Object();
        obj['ExpiryDate'] = {
            $lte: EndDate
        };
        search['$or'].push(obj);

        var obj1 = new Object();
        obj1['CreatedOnUtc'] = {
            $lte: EndDate
        };
        search['$or'].push(obj1);
    }

    if (objParam.Status > 0) {
        if (search['$and'] == undefined) {
            search['$and'] = [];
        }
        var obj = new Object();
        obj['OrderStatusId'] = {
            $eq: objParam.Status
        };
        search['$and'].push(obj);
    }

    if (objParam.Type > 0) {
        if (search['$and'] == undefined) {
            search['$and'] = [];
        }
        var obj = new Object();
        obj['SubscriptionTransactionId'] = {
            $eq: parseInt(objParam.Type)
        };
        search['$and'].push(obj);
    }

    var offset = (req.query.PageNo * 10) - 10;
    OrderService.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
        include: [{
            model: OrderServiceStatus,
            attributes: ['id', 'OrderStatus'],
            required: true
        }, {
            model: OrderServiceDetail,
            attributes: ['id', 'ProductName', 'Quantity', 'UnitPriceInclTax'],
            required: true
        }, {
            model: User,
            attributes: ['id', 'email', 'username', 'country', 'ProfileName'],
            required: true
        }, {
            model: AppInfo,
            required: true,
            attributes: ['id', 'AppName'],
        }]
    }).then(function(response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.LastPage = response.count;
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

router.get('/GetOrderServiceStatus', function(req, res) {
    OrderServiceStatus.findAll().then(function(resStatus) {
        res.json(resStatus);
    });
})

router.post('/CreateOrderService', jsonParser, function(req, res) {
    var objOrderReq = req.body;
    //Country,UserId,DeviceId,UserName
    GetCharges(objOrderReq.Country, objOrderReq.ProductTypeId, false, function(resOrderTotal) {
        var OrderTotal = resOrderTotal.TotalAmount;
        var ProductId = resOrderTotal.ProductId;

        var objOrder = new Object();
        objOrder.CustomerId = objOrderReq.UserId;
        objOrder.CreatedOnUtc = new Date();
        objOrder.ExpiryDate = AddDate(objOrder.CreatedOnUtc, 1, "Year");
        objOrder.ExpiryDurationValue = 1;
        objOrder.ExpiryDurationType = "Year";
        objOrder.MerchantId = 0;
        var PurchaseOrderNumber = new Date();
        objOrder.PurchaseOrderNumber = "BILLNO" + GetRandomWord() + Date.parse(PurchaseOrderNumber);
        objOrder.CustomerCurrencyCode = "MYR / Rs";
        objOrder.OrderTotal = OrderTotal;
        objOrder.OrderNotes = objOrderReq.DeviceId;
        objOrder.SettlementCur = "MYR / Rs";
        objOrder.OrderStatusId = 1;
        objOrder.SubscriptionTransactionId = objOrderReq.ProductTypeId;
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
        objOrder.CreatedBy = objOrderReq.UserName;
        objOrder.PaymentMethodAdditionalFeeInclTax = OrderTotal;
        objOrder.PaymentMethodAdditionalFeeExclTax = OrderTotal;
        objOrder.ProcessingCharges = 0;
        objOrder.PaymentStatusId = null;
        objOrder.Deleted = false;
        objOrder.ShippAddress1 = objOrderReq.Country;
        OrderService.create(objOrder).then(function(response) {
            var objOrderDetail = new Object();
            objOrderDetail.OrderId = response.id;
            objOrderDetail.ProductId = ProductId;
            objOrderDetail.ProductName = "Expiry Product";
            objOrderDetail.Quantity = 1;
            objOrderDetail.UnitPriceInclTax = OrderTotal;
            objOrderDetail.UnitPriceExclTax = OrderTotal;
            objOrderDetail.idOrderStatus = 1;
            objOrderDetail.PriceInclTax = OrderTotal;
            objOrderDetail.PriceExclTax = OrderTotal;
            OrderServiceDetail.create(objOrderDetail).then(function(responseOrderDetail) {
                res.json({
                    success: true,
                    message: "Order Service placed successfully...",
                    data: response,
                    orderId: response.id,
                });
            });
        });
    });
});

router.get('/RenewOrderService', function(req, res) {
    var objOrderReq = req.query;

    OrderService.hasOne(OrderServiceDetail, {
        foreignKey: {
            name: 'OrderId',
            allowNull: false
        }
    });

    OrderService.findOne({
        where: {
            id: objOrderReq.id
        },
        include: [{
            model: OrderServiceDetail,
            attributes: ['id', 'ProductId', 'ProductName', 'Quantity', 'UnitPriceInclTax'],
            required: true
        }]
    }).then(function(objOrderExists) {

        if (objOrderExists != null) {
            // var OrderTotal = resOrderTotal.TotalAmount;
            // var ProductId = resOrderTotal.ProductId;

            var objOrder = new Object();
            objOrder.CustomerId = objOrderExists.CustomerId;
            objOrder.CreatedOnUtc = new Date();
            objOrder.ExpiryDate = AddDate(objOrder.CreatedOnUtc, 1, "Year");
            objOrder.ExpiryDurationValue = 1;
            objOrder.ExpiryDurationType = "Year";
            objOrder.MerchantId = 0;
            var PurchaseOrderNumber = new Date();
            objOrder.PurchaseOrderNumber = "BILLNO" + GetRandomWord() + Date.parse(PurchaseOrderNumber);
            objOrder.CustomerCurrencyCode = "MYR / Rs";
            objOrder.OrderTotal = objOrderExists.OrderTotal;
            objOrder.OrderNotes = objOrderExists.OrderNotes;
            objOrder.SettlementCur = "MYR / Rs";
            objOrder.OrderStatusId = 1;
            //Ptoduct type ID
            objOrder.SubscriptionTransactionId = objOrderExists.SubscriptionTransactionId;
            objOrder.ShippingStatusId = 0;
            objOrder.PaymentMethodSystemName = "CASH";
            objOrder.CustomerTaxDisplayTypeId = 0;
            objOrder.OrderSubtotalInclTax = objOrderExists.OrderTotal;
            objOrder.OrderSubtotalExclTax = objOrderExists.OrderTotal;
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
            objOrder.CreatedBy = objOrderExists.CreatedBy;
            objOrder.PaymentMethodAdditionalFeeInclTax = 0;
            objOrder.PaymentMethodAdditionalFeeExclTax = 0;
            objOrder.ProcessingCharges = 0;
            objOrder.PaymentStatusId = null;
            objOrder.ShippAddress1 = objOrderExists.ShippAddress1;
            objOrder.Deleted = false;

            OrderService.create(objOrder).then(function(response) {
                var objOrderDetail = new Object();
                objOrderDetail.OrderId = response.id;
                objOrderDetail.ProductId = objOrderExists.tblorderserviceitem.ProductId;
                objOrderDetail.ProductName = "Renew Price";
                objOrderDetail.Quantity = 1;
                objOrderDetail.UnitPriceInclTax = objOrderExists.OrderTotal;
                objOrderDetail.UnitPriceExclTax = objOrderExists.OrderTotal;
                objOrderDetail.idOrderStatus = 1;
                objOrderDetail.PriceInclTax = objOrderExists.OrderTotal;
                objOrderDetail.PriceExclTax = objOrderExists.OrderTotal;
                OrderServiceDetail.create(objOrderDetail).then(function(responseOrderDetail) {
                    objOrderExists.updateAttributes({
                        Deleted: true,
                        OrderStatusId: 3
                    }).then(function(resUpdateOrder) {
                        res.json({
                            success: true,
                            message: "Order Service Renew successfully...",
                            data: response,
                            orderId: response.id,
                        });
                    });
                });
            });

        } else {
            res.json({
                success: false,
                message: "Order Service Not Found",
                data: []
            });
        }
    });
});

router.get('/UpdateDevice', function(req, res) {
    var OrderTotal = req.query.OrderTotal;
    OrderService.findOne({
        where: {
            id: req.query.id
        }
    }).then(function(resOrderFind) {
        if (resOrderFind != null) {
            resOrderFind.updateAttributes({
                OrderNotes: req.query.DeviceId,
                OrderTotal: OrderTotal,
                OrderSubtotalInclTax: OrderTotal,
                OrderSubtotalExclTax: OrderTotal,
            }).then(function(resUpdate) {
                OrderServiceDetail.findOne({
                    where: {
                        OrderId: req.query.id
                    }
                }).then(function(resDetailCheck) {
                    if (resDetailCheck != null) {
                        resDetailCheck.updateAttributes({
                            UnitPriceInclTax: OrderTotal,
                            UnitPriceExclTax: OrderTotal,
                            PriceInclTax: OrderTotal,
                            PriceExclTax: OrderTotal,
                        }).then(function(resUpdateDtl) {
                            res.json({
                                success: true,
                                message: "Device Updated Successfully"
                            });
                        })
                    } else {
                        res.json({
                            success: true,
                            message: "Device Updated Successfully"
                        });
                    }
                });

            });
        } else {
            res.json({
                success: false,
                message: "Order Service Can not Found"
            });
        }
    });
})

router.get('/UpdateOrderServiceDates', function(req, res) {
    var CreatedOnUtc = req.query.CreatedOnUtc;
    OrderService.findOne({
        where: {
            id: req.query.id
        }
    }).then(function(resOrderFind) {
        if (resOrderFind != null) {
            var ExpiryDate = AddDate(new Date(CreatedOnUtc), 1, "Year");
            resOrderFind.updateAttributes({
                CreatedOnUtc: new Date(CreatedOnUtc),
                ExpiryDate: ExpiryDate,
            }).then(function(resUpdate) {
                res.json({
                    success: true,
                    message: "Expiry Date Updated Successfully"
                });
            });
        } else {
            res.json({
                success: false,
                message: "Order Service Can not Found"
            });
        }
    });
})

router.get('/ChangeStatus', function(req, res) {
    OrderService.findOne({
        where: {
            id: req.query.id
        }
    }).then(function(resOrderFind) {
        if (resOrderFind != null) {
            resOrderFind.updateAttributes({
                OrderStatusId: 2
            }).then(function(resUpdate) {
                OrderServiceDetail.findOne({
                    where: {
                        orderId: req.query.id,
                    }
                }).then(function(resgetDTl) {
                    if (resgetDTl != null) {
                        resgetDTl.updateAttributes({
                            idOrderStatus: 2
                        }).then(function(resUpdatedtl) {
                            res.json({
                                success: true,
                                message: "Order Service Approved Successfully"
                            });
                        });
                    } else {
                        res.json({
                            success: true,
                            message: "Order Service Approved Successfully"
                        });
                    }
                });
            });
        } else {
            res.json({
                success: false,
                message: "Order Service Can not Found"
            });
        }
    });
})

router.get('/ExportOrderService', function(req, res) {
    var conf = {};
    conf.cols = [];

    var objParam = req.query;
    var objSearch = objParam.search;

    var search = {};

    if (objSearch != null && objSearch != '' && objSearch != undefined && objSearch != 'undefined') {
        search['$or'] = [];
        search['$or'].push(['tblappinfo.AppName like ?', "%" + objSearch + "%"]);
        search['$or'].push(['tbluserinformation.email like ?', "%" + objSearch + "%"]);
        search['$or'].push(['tbluserinformation.username like ?', "%" + objSearch + "%"]);
        search['$or'].push(['OrderTotal like ?', "%" + objSearch + "%"]);
        search['$or'].push(['OrderNotes like ?', "%" + objSearch + "%"]);
        search['$or'].push(['ShippAddress1 like ?', "%" + objSearch + "%"]);
        search['$or'].push(['tblorderservicestatus.OrderStatus like ?', "%" + objSearch + "%"]);
    }

    OrderService.hasOne(OrderServiceDetail, {
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

    OrderService.belongsTo(User, {
        foreignKey: {
            name: 'CustomerId',
            allowNull: false
        }
    });

    OrderService.belongsTo(AppInfo, {
        foreignKey: {
            name: 'SubscriptionTransactionId',
            allowNull: false
        }
    })

    if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined && objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }

        var StartDate = convertdateUTCformat(objParam.StartDate);
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);

        var obj = new Object();
        obj['ExpiryDate'] = {
            $between: [StartDate, EndDate]
        };
        search['$or'].push(obj);

        var obj1 = new Object();
        obj1['CreatedOnUtc'] = {
            $between: [StartDate, EndDate]
        };
        search['$or'].push(obj1);

    } else if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined) {

        if (search['$or'] == undefined) {
            search['$or'] = [];
        }

        var StartDate = convertdateUTCformat(objParam.StartDate);
        var obj = new Object();
        obj['ExpiryDate'] = {
            $gte: StartDate
        };
        search['$or'].push(obj);

        var obj1 = new Object();
        obj1['CreatedOnUtc'] = {
            $gte: StartDate
        };
        search['$or'].push(obj1);
    } else if (objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {

        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);

        var obj = new Object();
        obj['ExpiryDate'] = {
            $lte: EndDate
        };
        search['$or'].push(obj);

        var obj1 = new Object();
        obj1['CreatedOnUtc'] = {
            $lte: EndDate
        };
        search['$or'].push(obj1);
    }

    if (objParam.Status > 0) {
        if (search['$and'] == undefined) {
            search['$and'] = [];
        }
        var obj = new Object();
        obj['OrderStatusId'] = {
            $eq: objParam.Status
        };
        search['$and'].push(obj);
    }

    if (objParam.Type > 0) {
        if (search['$and'] == undefined) {
            search['$and'] = [];
        }
        var obj = new Object();
        obj['SubscriptionTransactionId'] = {
            $eq: parseInt(objParam.Type)
        };
        search['$and'].push(obj);
    }

    OrderService.findAll({
        where: search,
        order:'CreatedOnUtc asc',
        include: [{
            model: OrderServiceStatus,
            attributes: ['id', 'OrderStatus'],
            required: true
        }, {
            model: OrderServiceDetail,
            attributes: ['id', 'ProductName', 'Quantity', 'UnitPriceInclTax'],
            required: true
        }, {
            model: User,
            attributes: ['id', 'email', 'username', 'country', 'ProfileName'],
            required: true
        }, {
            model: AppInfo,
            required: true,
            attributes: ['id', 'AppName'],
        }]
    }).then(function(response) {

        var NewColumns = [{
            caption: 'No',
            type: 'string'
        },  {
            caption: 'Order No',
            type: 'string'
        },{
            caption: 'Type',
            type: 'string'
        }, {
            caption: 'Email',
            type: 'string'
        }, {
            caption: 'Created Date',
            type: 'string'
        }, {
            caption: 'Exipiry Date',
            type: 'string'
        }, {
            caption: 'Order Total',
            type: 'string'
        }, {
            caption: 'Device',
            type: 'string'
        }, {
            caption: 'Country',
            type: 'string'
        }, {
            caption: 'Status',
            type: 'string'
        }];

        conf.cols = (NewColumns);
        var row = [];

        for (var i = 0; i < response.length; i++) {
            var ObjData = response[i];
            var srow = [];

            var No = i + 1;
            var Type = ObjData.tblappinfo.AppName;
            var OrderNo = ObjData.PurchaseOrderNumber;
            var Email = ObjData.tbluserinformation.email;
            if (ObjData.CreatedOnUtc != '' && ObjData.CreatedOnUtc != null && ObjData.CreatedOnUtc != undefined) {
                var CreatedOnUtc = moment(moment.utc(ObjData.CreatedOnUtc).toDate()).format("DD/MM/YYYY hh:mm A");
            } else {
                var CreatedOnUtc = '';
            }
            if (ObjData.ExpiryDate != '' && ObjData.ExpiryDate != null && ObjData.ExpiryDate != undefined) {
                var ExpiryDate = moment(moment.utc(ObjData.ExpiryDate).toDate()).format("DD/MM/YYYY hh:mm A");
            } else {
                var ExpiryDate = '';
            }
            var OrderTotal = ObjData.OrderTotal;
            var Device = ObjData.OrderNotes;
            var Country = ObjData.ShippAddress1;
            var Status = ObjData.tblorderservicestatus.OrderStatus;
            srow.push(No.toString());
            srow.push(OrderNo);
            srow.push(Type);
            srow.push(Email);
            srow.push(CreatedOnUtc);
            srow.push(ExpiryDate);
            srow.push(OrderTotal.toString());
            srow.push(Device);
            srow.push(Country);
            srow.push(Status);
            row.push(srow);
        };
        conf.rows = [];
        conf.rows = row;
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "OrderService.xlsx");
        res.end(result, 'binary');
    });
})

function convertdateformatcutm(date1) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();
    return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
}

function GetCharges(Country, ProductTypeId, IsRenew, callback) {
    var TotalAmount = 0;
    try {
        GetExpiryProductByName(ProductTypeId, function(resProductId) {
            TotalAmount = 0;
            if (resProductId > 0) {
                GetProductAttributes(resProductId, Country, function(resAllAttributes) {
                    for (var i = 0; i < resAllAttributes.length; i++) {
                        TotalAmount += resAllAttributes[i].PriceAdjustment;
                    }
                    return callback({
                        "TotalAmount": TotalAmount,
                        "ProductId": resProductId
                    });
                });
            } else {
                return callback({
                    "TotalAmount": TotalAmount,
                    "ProductId": 0
                });
            }
        });

    } catch (err) {
        return callback({
            "TotalAmount": TotalAmount,
            "ProductId": 0
        });
    }
}

function GetExpiryProductByName(ProductTypeId, callback) {
    try {
        Product.findOne({
            where: {
                // Name: "Expiry Product",
                Name: "Renew Price",
                ProductTypeId: parseInt(ProductTypeId),
                Deleted: false,
            },
            attributes: ['Id', 'Name'],
        }).then(function(response) {
            if (response != null) {
                return callback(response.Id);
            } else {
                return callback(0);
            }
        })
    } catch (ees) {
        return callback(0);
    }
}

function GetProductAttributes(idProduct, Country, callback) {
    ProductAttributeMapping.belongsTo(ProductAttribute, {
        foreignKey: {
            name: 'ProductAttributeId',
            allowNull: false
        }
    });
    ProductAttributeMapping.hasMany(ProductAttributeValue, {
        foreignKey: {
            name: 'ProductAttributeMappingId',
            allowNull: false
        }
    });
    ProductAttributeValue.belongsTo(Product, {
        foreignKey: {
            name: 'AssociatedProductId',
            allowNull: false
        }
    });
    ProductAttributeMapping.findAll({
        where: {
            ProductId: idProduct
        },
        include: [{
            model: ProductAttribute
        }, {
            model: ProductAttributeValue,
            include: [{
                model: Product,
                attributes: ['Id', 'Name']
            }]
        }]
    }).then(function(resAttributes) {
        var AllAttributeValue = [];
        for (var i = 0; i < resAttributes.length; i++) {
            var value = resAttributes[i];
            for (var j = 0; j < value.productattributevalues.length; j++) {
                var InnerVal = value.productattributevalues[j];
                var obj1 = new Object();
                obj1.Id = InnerVal.Id;
                obj1.Name = InnerVal.Name;
                obj1.PriceAdjustment = InnerVal.PriceAdjustment;
                obj1.mapid = InnerVal.ProductAttributeMappingId;
                obj1.AName = value.productattribute.Name;
                obj1.AId = value.Id;
                if (Country == obj1.AName) {
                    AllAttributeValue.push(obj1);
                }
            }
        }
        return callback(AllAttributeValue);
    }).catch(function(error) {
        return callback([]);
    })
}

//======================================================================
var rule = new schedule.RecurrenceRule();
rule.hour = 1;
rule.minute = 0;
rule.second = 0;

var ExpireDataCheck = schedule.scheduleJob(rule, function() {
    // MerchantLock();
});

module.exports = router
