//Tables
var router = express.Router();
var User = models.tbluserinformation;
var WalletTransaction = models.tblwallettransaction;
var Wallet = models.tblwallet;
var AppInfo = models.tblappinfo;


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

router.get('/GetAllWallettransaction', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = "";

    if (objSearch != '' && objSearch != null && objSearch != undefined) {
        var PStatusName = 'pending';
        var AStatusName = 'approve';
        var CStatusName = 'completed';

        search = 'Where (tai.AppName like "%' + objSearch + '%" or ';
        if (PStatusName.indexOf(objSearch.toLowerCase()) >= 0) {
            search = search + 'twt.IsPaymentSuccess = 0 or ';
        }
        if (AStatusName.indexOf(objSearch.toLowerCase()) >= 0) {
            search = search + 'twt.IsPaymentSuccess = 1 or ';
        }

        if (CStatusName.indexOf(objSearch.toLowerCase()) >= 0) {
            search = search + 'twt.IsPaymentSuccess = 2 or ';
        }

        search = search + 'twt.OrderNumber like "%' + objSearch + '%" or ';
        search = search + 'twt.CreatedBy like "%' + objSearch + '%" or ';
        search = search + 'twt.Remark like "%' + objSearch + '%" or ';
        search = search + 'twt.Amount like "%' + objSearch + '%" or ';
        search = search + 'twt.Type like "%' + objSearch + '%" ) ';
    }

    if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined && objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);
        if (search == "") {
            search += "WHERE  twt.CreatedDate between '" + StartDate + "' and '" + EndDate + "' or twt.ExpiryDate between '" + StartDate + "' and '" + EndDate + "' ";
        } else {
            search += " and twt.CreatedDate between '" + StartDate + "' and '" + EndDate + "' or twt.ExpiryDate between '" + StartDate + "' and '" + EndDate + "' ";
        }
    } else if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined) {

        var StartDate = convertdateUTCformat(objParam.StartDate);
        if (search == "") {
            search += "where twt.CreatedDate >= '" + StartDate + "' or twt.ExpiryDate >= '" + StartDate + "' ";
        } else {
            search += " and twt.CreatedDate >= '" + StartDate + "' or twt.ExpiryDate >= '" + StartDate + "' ";
        }
    } else if (objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {

        var EndDate = convertdateUTCformat(objParam.EndDate, 2);
        if (search == "") {
            search += "where twt.CreatedDate <= '" + EndDate + "' or twt.ExpiryDate <= '" + EndDate + "' ";
        } else {
            search += " and twt.CreatedDate <= '" + EndDate + "' or twt.ExpiryDate <= '" + EndDate + "' ";
        }
    }

    if (objParam.Status >= 0) {
        if (search == "") {
            search += 'where twt.IsPaymentSuccess = ' + objParam.Status;
        } else {
            search += ' and twt.IsPaymentSuccess = ' + objParam.Status;
        }
    }

    // if (objParam.Type > 0) {
    //     if (search == "") {
    //         search += 'where twt.idApp = ' + objParam.Type;
    //     } else {
    //         search += ' and twt.idApp = ' + objParam.Type;
    //     }
    // }

    if (objParam.idApp != null && objParam.idApp != '' && objParam.idApp != undefined && objParam.idApp > 0) {
        if (search == "") {
            search += 'where twt.idApp = ' + objParam.idApp;
        } else {
            search += ' and twt.idApp = ' + objParam.idApp;
        }
    }

    if (objParam.idAppsearch != null && objParam.idAppsearch != '' && objParam.idAppsearch != undefined && objParam.idAppsearch > 0) {
        if (search == "") {
            search += 'where twt.idApp = ' + objParam.idAppsearch;
        } else {
            search += ' and twt.idApp = ' + objParam.idAppsearch;
        }
    }



    var qry = "Select twt.id,tai.Id,tai.AppName,Amount,Type,Remark,OrderNumber,CONVERT_TZ(twt.CreatedDate,'+00:00','" + CurrentOffset + "') as CreatedDate,CONVERT_TZ(twt.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate,twt.CreatedBy,twt.IsPaymentSuccess,twt.PaymentReceipt,Country from tblwallettransaction twt" +
        " inner join tblappinfo tai on twt.idApp = tai.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);

    console.log('*****************', qry)

    var Countqry = "SELECT count(twt.id) as TotalRecord " +
        "from tblwallettransaction twt " +
        "inner join tblappinfo tai on twt.idApp = tai.id " + search


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
                    objWalletTransaction.ExpiryDate = AddDate(objWalletTransaction.CreatedDate, 1, "Year");
                    WalletTransaction.create(objWalletTransaction).then(function (response) {
                        if (response != null) {
                            res.json({
                                success: true,
                                message: "WalletTransaction Created Successfully...",
                                data: response
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

router.post('/uploadImage', function (req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/../MediaUploads/WalletReceipt';
    var FileName = [];
    var lstUser = [];

    form.parse(req, function (err, fields, files) { });
    form.on('fileBegin', function (name, file) {
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
    form.on('end', function () {
        var i = 0;

        function uploader(i) {
            if (i < FileName.length) {
                var Id = parseInt(lstUser[i]);
                WalletTransaction.findOne({ where: { Id: Id } }).then(function (response) {
                    if (response != null) {


                        if (response.PaymentReceipt != '' && response.PaymentReceipt != null) {
                            var oldFile = __dirname + '/../MediaUploads/WalletReceipt/' + response.FlagImageFileName;
                            fs.exists(oldFile, function (exists) {
                                if (exists) {
                                    fs.unlink(oldFile);
                                }
                            });
                        };
                        response.updateAttributes({ PaymentReceipt: FileName[i] }).then(function (resUpdate) {
                            if ((i + 1) == FileName.length) {
                                res.json({ success: true, message: "Images Uploaded Successfully...", data: FileName[i] });
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
            res.json({ success: false, message: "Please Select atleast One File..." });
        }

    });
});

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
                    if (resWalletTransaction.Remark != null && resWalletTransaction.Remark != '' && resWalletTransaction.Remark != undefined) {
                        ObjWallet.Remark = resWalletTransaction.Remark + "<br/>Reference Wallet Transaction : " + resWalletTransaction.OrderNumber;
                    } else {
                        ObjWallet.Remark = "Reference Wallet Transaction : " + resWalletTransaction.OrderNumber;;
                    }
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
                ObjRenewWalletTransaction.Type = resWalletTransaction.Type;
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
                    res.json({
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

    if (objSearch != null && objSearch != '') {
        search['$or'] = [];

        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                if (columnName != 'CreatedDate') {
                    if (columnName == 'Amount') {
                        search['$or'].push(['tblwallet.Amount like ?', "%" + objSearch + "%"]);
                    } else if (columnName == 'Type') {
                        search['$or'].push(['tblwallet.Type like ?', "%" + objSearch + "%"]);
                    } else if (columnName == 'Remark') {
                        search['$or'].push(['tblwallet.Remark like ?', "%" + objSearch + "%"]);
                    } else if (columnName == 'OrderNo') {
                        search['$or'].push(['tblwallettransaction.OrderNumber like ?', "%" + objSearch + "%"]);
                    } else if (columnName == 'Country') {
                        search['$or'].push(['tblwallettransaction.Country like ?', "%" + objSearch + "%"]);
                    } else {
                        search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                    }
                }
            };
        };
    }

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


    if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined && objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);

        var obj1 = new Object();
        obj1['CreatedDate'] = {
            $between: [StartDate, EndDate]
        };
        search['$or'].push(obj1);

    } else if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined) {
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var obj1 = new Object();
        obj1['CreatedDate'] = {
            $gte: StartDate
        };
        search['$or'].push(obj1);
    } else if (objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);

        var obj1 = new Object();
        obj1['CreatedDate'] = {
            $lte: EndDate
        };
        search['$or'].push(obj1);
    }


    if (objParam.Type != 'All') {
        if (search['$and'] == undefined) {
            search['$and'] = [];
        }
        var obj = new Object();
        obj['Type'] = {
            $eq: objParam.Type
        };
        search['$and'].push(obj);
    }

    var searchapp = {};

    if (objParam.idApp != '' && objParam.idApp != undefined && objParam.idApp != null && objParam.idApp > 0) {
        if (searchapp['$and'] == undefined) {
            searchapp['$and'] = [];
        }
        var obj = new Object();
        obj['idApp'] = {
            $eq: parseInt(objParam.idApp)
        };
        searchapp['$and'].push(obj);
    }


    Wallet.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
        include: [{
            where: searchapp,
            model: WalletTransaction,
            attributes: ['OrderNumber', 'Country', 'idApp', 'PaymentType'],
            required: true,
            include: [{
                model: AppInfo,
                attributes: ['Id', 'AppName'],
                required: true,
            }]
        }]
    }).then(function (response) {
        var responseWallet = new Object();
        responseWallet.draw = objParam.draw;
        responseWallet.recordsTotal = response.count;
        responseWallet.recordsFiltered = response.count;
        responseWallet.data = response.rows;
        res.json(responseWallet);
    }).catch(function (error) {
        res.json({
            success: false,
            response: error
        });
    })
});

router.get('/ExportWallet', function (req, res) {
    var conf = {};
    conf.cols = [];

    var objParam = req.query;
    var objSearch = objParam.search;

    var search = {};

    if (objSearch != null && objSearch != '' && objSearch != undefined && objSearch != 'undefined') {
        search['$or'] = [];
        search['$or'].push(['tblwallet.Amount like ?', "%" + objSearch + "%"]);
        search['$or'].push(['tblwallet.Type like ?', "%" + objSearch + "%"]);
        search['$or'].push(['tblwallet.Remark like ?', "%" + objSearch + "%"]);
        search['$or'].push(['tblwallettransaction.OrderNumber like ?', "%" + objSearch + "%"]);
        search['$or'].push(['tblwallettransaction.Country like ?', "%" + objSearch + "%"]);
        search['$or'].push(['AppName like ?', "%" + objSearch + "%"]);
    }



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


    if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined && objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);

        var obj1 = new Object();
        obj1['CreatedDate'] = {
            $between: [StartDate, EndDate]
        };
        search['$or'].push(obj1);

    } else if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined) {
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var obj1 = new Object();
        obj1['CreatedDate'] = {
            $gte: StartDate
        };
        search['$or'].push(obj1);
    } else if (objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);

        var obj1 = new Object();
        obj1['CreatedDate'] = {
            $lte: EndDate
        };
        search['$or'].push(obj1);
    }


    if (objParam.Type != 'All') {
        if (search['$and'] == undefined) {
            search['$and'] = [];
        }
        var obj = new Object();
        obj['Type'] = {
            $eq: objParam.Type
        };
        search['$and'].push(obj);
    }

    var searchapp = {};

    if (objParam.idApp != '' && objParam.idApp != undefined && objParam.idApp != null && objParam.idApp > 0) {
        if (searchapp['$and'] == undefined) {
            searchapp['$and'] = [];
        }
        var obj = new Object();
        obj['idApp'] = {
            $eq: parseInt(objParam.idApp)
        };
        searchapp['$and'].push(obj);
    }

    Wallet.findAll({
        where: search,
        order: 'CreatedDate desc',
        include: [{
            where: searchapp,
            model: WalletTransaction,
            attributes: ['OrderNumber', 'Country', 'idApp', 'PaymentType'],
            required: true,
            include: [{
                model: AppInfo,
                attributes: ['Id', 'AppName'],
                required: true,
            }]
        }]
    }).then(function (response) {

        var NewColumns = [{
            caption: 'No',
            type: 'string'
        }, {
            caption: 'Order No',
            type: 'string'
        }, {
            caption: 'App Name',
            type: 'string'
        }, {
            caption: 'Total Amount',
            type: 'number'
        }, {
            caption: 'Type',
            type: 'string'
        }, {
            caption: 'Created Date',
            type: 'string'
        }, {
            caption: 'Country',
            type: 'string'
        }, {
            caption: 'Remark',
            type: 'string'
        }];

        conf.cols = (NewColumns);
        var row = [];
        for (var i = 0; i < response.length; i++) {
            var ObjData = response[i];
            var srow = [];

            var No = i + 1;
            var OrderNo = ObjData.tblwallettransaction.OrderNumber;
            var AppName = ObjData.tblwallettransaction.tblappinfo.AppName;
            var OrderTotal = ObjData.Amount;
            var Type = ObjData.Type;
            if (ObjData.CreatedDate != '' && ObjData.CreatedDate != null && ObjData.CreatedDate != undefined) {
                var CreatedDate = moment(moment.utc(ObjData.CreatedDate).toDate()).format("DD/MM/YYYY hh:mm A");
            } else {
                var CreatedDate = '';
            }
            var Country = ObjData.tblwallettransaction.Country;
            var Remark = ObjData.Remark;
            srow.push(No.toString());
            srow.push(OrderNo);
            srow.push(AppName);
            srow.push(OrderTotal.toString());
            srow.push(Type);
            srow.push(CreatedDate);
            srow.push(Country);
            srow.push(Remark);
            row.push(srow);
        };
        conf.rows = [];
        conf.rows = row;
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Wallet.xlsx");
        res.end(result, 'binary');
    });
})

router.get('/ExportWalletTransaction', function (req, res) {
    var conf = {};
    conf.cols = [];

    var objParam = req.query;
    var objSearch = objParam.search;

    var search = {};

    if (objSearch != null && objSearch != '' && objSearch != undefined && objSearch != 'undefined') {
        var PStatusName = 'pending';
        var AStatusName = 'approve';
        var CStatusName = 'completed';



        search['$or'] = [];
        search['$or'].push(['tblwallettransaction.Type like ?', "%" + objSearch + "%"]);
        search['$or'].push(['tblwallettransaction.OrderNumber like ?', "%" + objSearch + "%"]);
        search['$or'].push(['tblwallettransaction.Country like ?', "%" + objSearch + "%"]);
        if (PStatusName.indexOf(objSearch.toLowerCase()) >= 0) {
            search['$or'].push(['tblwallettransaction.IsPaymentSuccess = 0']);
        }
        if (AStatusName.indexOf(objSearch.toLowerCase()) >= 0) {
            search['$or'].push(['tblwallettransaction.IsPaymentSuccess = 1']);
        }

        if (CStatusName.indexOf(objSearch.toLowerCase()) >= 0) {
            search['$or'].push(['tblwallettransaction.IsPaymentSuccess = 2']);
        }
    }


    if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined && objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var StartDate = convertdateUTCformat(objParam.StartDate);
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);

        var obj1 = new Object();
        obj1['CreatedDate'] = {
            $between: [StartDate, EndDate]
        };
        search['$or'].push(obj1);

    } else if (objParam.StartDate != '' && objParam.StartDate != null && objParam.StartDate != undefined) {
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var obj1 = new Object();
        obj1['CreatedDate'] = {
            $gte: StartDate
        };
        search['$or'].push(obj1);
    } else if (objParam.EndDate != '' && objParam.EndDate != null && objParam.EndDate != undefined) {
        if (search['$or'] == undefined) {
            search['$or'] = [];
        }
        var EndDate = convertdateUTCformat(objParam.EndDate, 2);

        var obj1 = new Object();
        obj1['CreatedDate'] = {
            $lte: EndDate
        };
        search['$or'].push(obj1);
    }

    console.log('Status', objParam.Status)
    if (objParam.Status >= 0) {
        if (search['$and'] == undefined) {
            search['$and'] = [];
        }
        var obj = new Object();
        obj['IsPaymentSuccess'] = {
            $eq: objParam.Status
        };
        search['$and'].push(obj);
    }

    //var searchapp = {};   
    if (objParam.idApp != '' && objParam.idApp != undefined && objParam.idApp != null && objParam.idApp > 0) {
        if (search['$and'] == undefined) {
            search['$and'] = [];
        }
        var obj = new Object();
        obj['idApp'] = {
            $eq: parseInt(objParam.idApp)
        };
        search['$and'].push(obj);
    }


    if (objParam.idAppsearch != null && objParam.idAppsearch != '' && objParam.idAppsearch != undefined && objParam.idAppsearch > 0) {
        if (search['$and'] == undefined) {
            search['$and'] = [];
        }
        var obj = new Object();
        obj['idApp'] = {
            $eq: parseInt(objParam.idAppsearch)
        };
        search['$and'].push(obj);
    }

    WalletTransaction.belongsTo(AppInfo, {
        foreignKey: {
            name: 'idApp',
            allowNull: false
        }
    });

    console.log('Export')
    WalletTransaction.findAll({
        where: search,
        order: 'CreatedDate desc',
        include: [{
            model: AppInfo,
            attributes: ['Id', 'AppName'],
            required: true,
        }]

    }).then(function (response) {

        var NewColumns = [{
            caption: 'No',
            type: 'string'
        }, {
            caption: 'Order No',
            type: 'string'
        }, {
            caption: 'App Name',
            type: 'string'
        }, {
            caption: 'Total Amount',
            type: 'number'
        }, {
            caption: 'Type',
            type: 'string'
        }, {
            caption: 'Created By',
            type: 'string'
        }, {
            caption: 'Created Date',
            type: 'string'
        }, {
            caption: 'Expiry Date',
            type: 'string'
        }, {
            caption: 'Remark',
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
            var OrderNo = ObjData.OrderNumber;
            var AppName = ObjData.tblappinfo.AppName;
            var OrderTotal = ObjData.Amount;
            var Type = ObjData.Type;
            var CreatedBy = ObjData.CreatedBy;
            var CreatedDate = '';
            if (ObjData.CreatedDate != '' && ObjData.CreatedDate != null && ObjData.CreatedDate != undefined) {
                CreatedDate = moment(moment.utc(ObjData.CreatedDate).toDate()).format("DD/MM/YYYY hh:mm A");
            } else {
                CreatedDate = '';
            }
            var ExpiryDate = '';
            if (ObjData.ExpiryDate != '' && ObjData.ExpiryDate != null && ObjData.ExpiryDate != undefined) {
                ExpiryDate = moment(moment.utc(ObjData.ExpiryDate).toDate()).format("DD/MM/YYYY hh:mm A");
            } else {
                ExpiryDate = '';
            }
            var Remark = '';
            if (ObjData.ExpiryDate != '' && ObjData.ExpiryDate != null && ObjData.ExpiryDate != undefined) {
                Remark = ObjData.Remark;
            } else {
                Remark = '';
            }
            var Status = '';
            if (ObjData.IsPaymentSuccess == 0) {
                Status = 'Pending'
            } else if (ObjData.IsPaymentSuccess == 1) {
                Status = 'Approve'
            } else if (ObjData.IsPaymentSuccess == 2) {
                Status = 'Complete'
            }

            srow.push(No.toString());
            srow.push(OrderNo.toString());
            srow.push(AppName.toString());
            srow.push(OrderTotal);
            srow.push(Type.toString());
            srow.push(CreatedBy.toString());
            srow.push(CreatedDate.toString());
            srow.push(ExpiryDate.toString());
            srow.push(Remark);
            srow.push(Status.toString());
            row.push(srow);
        };

        conf.rows = [];
        conf.rows = row;
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "WalletTransaction.xlsx");
        res.end(result, 'binary');

    });
})

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
module.exports = router