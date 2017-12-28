//Tables
var router = express.Router();
var User = models.tbluserinformation;
var WalletTransaction = models.tblwallettransaction;
var Wallet = models.tblwallet;
var AppInfo = models.tblappinfo;


router.get('/GetAllWallettransaction', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    console.log('Orderby', Orderby)

    var search = "";

    // if (objSearch != '' && objSearch != null && objSearch != undefined) {
    //     search = 'Where (AppName like "%' + objSearch + '%" or ';
    //     search = search + 'BundleId like "%' + objSearch + '%" or ';
    //     search = search + 'IOSCertificate like "%' + objSearch + '%" or ';
    //     search = search + 'IOSKey like "%' + objSearch + '%" or ';
    //     search = search + 'AndroidId like "%' + objSearch + '%" or ';
    //     search = search + 'AndroidSenderId like "%' + objSearch + '%" or ';
    //     search = search + 'CreatedBy like "%' + objSearch + '%" or ';
    //     search = search + 'CreatedDate like "%' + objSearch + '%") ';
    // }

    if (objParam.idApp != null && objParam.idApp != '' && objParam.idApp != undefined) {
        if (search == "") {
            search += 'where and twt.idApp = ' + objParam.idApp;
        } else {
            search += ' and twt.idApp = ' + objParam.idApp;
        }
    }

    var qry = "Select twt.id,tai.Id,tai.AppName,Amount,Type,Remark,OrderNumber,CONVERT_TZ(twt.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate,twt.CreatedBy from tblwallettransaction twt" +
        " inner join tblappinfo tai on twt.idApp = tai.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);

    console.log(qry);

    var Countqry = "SELECT count(twt.id) as TotalRecord " +
        "from tblwallettransaction twt " +
        "inner join tblappinfo tai on twt.idApp = tai.id " + search

    console.log(Countqry);

    connection.query(qry, function (err, response) {
        if (response != undefined) {
            connection.query(Countqry, function (err, lstCount, fields) {
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


router.post('/Savewallettransaction', jsonParser, function (req, res) {
    var objWalletTransaction = req.body;
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
            if (UserExist != null) {
                if (objWalletTransaction.id == 0) {

                    var WalletTransactionOrderNumber = new Date();
                    objWalletTransaction.OrderNumber = "WALTNO-" + GetRandomWord() + Date.parse(WalletTransactionOrderNumber);
                    objWalletTransaction.CreatedBy = decoded.username;
                    objWalletTransaction.CreatedDate = new Date();
                    WalletTransaction.create(objWalletTransaction).then(function (response) {
                        if (response != null) {
                            res.json({
                                success: true,
                                message: "WalletTransaction Created Successfully...",
                            });

                        } else {
                            res.json({
                                success: false,
                                message: "WalletTransaction Does Not Created...",
                            });
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


router.get('/ApproveTransaction', function (req, res) {
    try {
        var id = req.query.id;
        var username = req.query.UserName;
        WalletTransaction.findOne({
            where: {
                id: id
            }
        }).then(function (resWalletTransaction) {
            if (resWalletTransaction == null) {
                res.json({
                    success: false,
                    message: "Transaction Not Found"
                });
            } else {
                resWalletTransaction.updateAttributes({
                    IsPaymentSuccess: 1,
                    ModifiedDate: new Date(),
                    ModifiedBy: username,
                }).then(function (resUpdateTrans) {

                    var ObjWallet = new Object();
                    ObjWallet.id = 0;
                    ObjWallet.idwalletTransaction = resWalletTransaction.id;
                    ObjWallet.Amount = resWalletTransaction.Amount;
                    ObjWallet.Type = resWalletTransaction.Type;
                    ObjWallet.Remark = resWalletTransaction.Remark;
                    ObjWallet.Createdby = username;
                    ObjWallet.CreatedDate = new Date();
                    Wallet.create(ObjWallet).then(function (resCreateWallet) {
                        res.json({
                            success: true,
                            message: "Wallet Transaction Approved successfully."
                        });
                    });
                });
            }
        });
    } catch (err) {
        res.json({
            success: false,
            message: "System Exception, try again later"
        });
    }
});


router.get('/RenewTransaction', function (req, res) {
    try {
        var id = req.query.id;
        var username = req.query.UserName;

        WalletTransaction.findOne({
            where: {
                id: id
            }
        }).then(function (resWalletTransaction) {
            if (resWalletTransaction == null) {
                res.json({
                    success: false,
                    message: "Transaction Not Found"
                });
            } else {
                resWalletTransaction.updateAttributes({
                    IsPaymentSuccess: 2
                }).then(function (resUpdateTra) {
                    GetWalletChargesGlobal(resWalletTransaction.Country, resWalletTransaction.idApp, function (resOrderTotal) {
                        var Amount = resOrderTotal.TotalAmount;
                        var Remark = resOrderTotal.Remark;
                        RenewTransaction(resWalletTransaction.Country, Amount, Remark);
                    });
                });
            }

            function RenewTransaction(Country, Amount, Remark) {
                var ObjRenewWalletTransaction = new Object();
                ObjRenewWalletTransaction.id = 0;
                ObjRenewWalletTransaction.idApp = resWalletTransaction.idApp;
                ObjRenewWalletTransaction.Amount = Amount;
                ObjRenewWalletTransaction.Type = "Debit";
                ObjRenewWalletTransaction.Remark = Remark;
                ObjRenewWalletTransaction.OrderNumber = "WALTNO-" + GetRandomWord() + Date.parse(new Date());
                ObjRenewWalletTransaction.Country = Country;
                ObjRenewWalletTransaction.PaymentType = "Offline";
                ObjRenewWalletTransaction.IsPaymentSuccess = 0;
                ObjRenewWalletTransaction.CreatedDate = new Date();
                ObjRenewWalletTransaction.CreatedBy = username;
                ObjRenewWalletTransaction.ExpiryDate = AddDate(ObjRenewWalletTransaction.CreatedDate, 1, "Year");
                ObjRenewWalletTransaction.ModifiedDate = null;
                ObjRenewWalletTransaction.ModifiedBy = null;
                ObjRenewWalletTransaction.PaymentReceipt = null;
                WalletTransaction.create(ObjRenewWalletTransaction).then(function (responseTransaction) {
                    return callback({
                        success: true,
                        message: "Wallet Transaction Renew successfully.",
                    });
                });
            }
        });
    } catch (err) {
        res.json({
            success: false,
            message: "System Exception, try again later"
        });
    }
});

router.get('/GetAllWalletes', function (req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};

    // if (objSearch != null && objSearch != '') {
    //     search['$or'] = [];

    //     for (var i = 0; i < objColumns.length; i++) {
    //         if (objColumns[i].data != null && objColumns[i].data != '') {
    //             var columnName = objColumns[i].data;
    //             if (columnName != 'CreatedDate') {
    //                 search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
    //             }
    //         };
    //     };
    // }

    Wallet.belongsTo(WalletTransaction, {
        foreignKey: {
            name: 'idwalletTransaction',
            allowNull: false
        }
    });

    WalletTransaction.belongsTo(AppInfo, {
        foreignKey: {
            name: 'idApp',
            allowNull: false
        }
    });

    Wallet.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
        include: [{
            model: WalletTransaction,
            attributes: ['OrderNumber', 'Country', 'idApp', 'PaymentType'],
            include: [{
                model: AppInfo,
                attributes: ['Id', 'AppName']
            }]
        }]
    }).then(function (response) {
        console.log(response)
        var responseWallet = new Object();
        responseWallet.draw = objParam.draw;
        responseWallet.recordsTotal = response.count;
        responseWallet.recordsFiltered = response.count;
        responseWallet.data = response.rows;
        res.json(responseWallet);
    }).catch(function (error) {
        res.json(error);
    })
});

module.exports = router