//Tables
var router = express.Router();
var User = models.tbluserinformation;
var WalletTransaction = models.tblwallettransaction;
var Wallet = models.tblwallet;


router.get('/GetAllWallettransaction', function(req, res) {
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

console.log('71', GetRandomWord());
router.post('/Savewallettransaction', jsonParser, function(req, res) {
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
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (objWalletTransaction.id == 0) {

                    var WalletTransactionOrderNumber = new Date();
                    objWalletTransaction.OrderNumber = "WALTNO-" + GetRandomWord() + Date.parse(WalletTransactionOrderNumber);
                    objWalletTransaction.CreatedBy = decoded.username;
                    objWalletTransaction.CreatedDate = new Date();
                    WalletTransaction.create(objWalletTransaction).then(function(response) {
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
module.exports = router