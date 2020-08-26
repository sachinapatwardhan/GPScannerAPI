var router = express.Router();
var Database = require('./../connection/DatabaseConnection.js');
var DBConnection = new Database();
var RenewTransaction = models.tblrenewtransaction;
var User = models.tbluserinformation;

router.get('/GetAllRenewTransaction', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';
    console.log(objParam)
    if (objSearch != null && objSearch != '') {
        search = ' Where ( tu.username like "%' + objSearch + '%" or ';
        search = search + 'tor.PurchaseOrderNumber  like "%' + objSearch + '%" or ';
        search = search + 'ta.AppName  like "%' + objSearch + '%" or ';
        search = search + 'tr.Remark  like "%' + objSearch + '%") ';
    }
    if (objParam.idApp != null && objParam.idApp != '' && objParam.idApp != undefined) {
        if (search == '') {
            search = search + " where tr.idApp=" + objParam.idApp;
        } else {
            search = search + " and tr.idApp=" + objParam.idApp;
        }
    }

    if (objParam.idUser != null && objParam.idUser != '' && objParam.idUser != undefined) {
        if (search == '') {
            search = search + " where tr.idUser=" + objParam.idUser;
        } else {
            search = search + " and tr.idUser=" + objParam.idUser;
        }
    }

    if (objParam.IsComplete != null && objParam.IsComplete != '' && objParam.IsComplete != undefined) {
        if (search == '') {
            search = search + " where tr.IsComplete=" + objParam.IsComplete;
        } else {
            search = search + " and tr.IsComplete=" + objParam.IsComplete;
        }
    }

    if (objParam.StartDate != null && objParam.StartDate != '' && objParam.StartDate != undefined) {
        if (search == '') {
            search = search + " where tr.CreatedDate >= '" + objParam.StartDate + "' ";
        } else {
            search = search + " and tr.CreatedDate >= '" + objParam.StartDate + "' ";
        }
    }

    if (objParam.EndDate != null && objParam.EndDate != '' && objParam.EndDate != undefined) {
        if (search == '') {
            search = search + " where tr.CreatedDate <= '" + objParam.EndDate + "' ";
        } else {
            search = search + " and tr.CreatedDate <= '" + objParam.EndDate + "' ";
        }
    }

    var Query = `SELECT 
                    SQL_CALC_FOUND_ROWS tr.*, tor.PurchaseOrderNumber, tu.username, ta.AppName,CONVERT_TZ(tr.CreatedDate,'+00:00','` + CurrentOffset + `') AS CreatedDate,CONVERT_TZ(tr.CompletedDate,'+00:00','` + CurrentOffset + `') AS CompletedDate
                FROM
                    tblrenewtransaction tr
                        INNER JOIN
                    tblorderservice tor ON tr.idOrder = tor.id
                        INNER JOIN
                    tbluserinformation tu ON tr.idUser = tu.id
                        INNER JOIN
                    tblappinfo ta ON tr.idApp = ta.id `+ search + ` 
                ORDER BY `+ Orderby + ` 
                LIMIT ` + objParam.length + ` OFFSET ` + objParam.start + `; SELECT FOUND_ROWS() as TotalRecord; `;
    console.log(Query)
    DBConnection.query(Query).then(function (responseData) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = responseData[1][0].TotalRecord;
        response1.recordsFiltered = responseData[1][0].TotalRecord;
        response1.data = responseData[0];
        res.json(response1);
    }).catch(function (err) {
        console.log(err)
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = 0;
        response1.recordsFiltered = 0;
        response1.data = [];
        res.json(response1);
    });
})

router.get('/MarkAsComplete', function (req, res) {
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
            return RenewTransaction.findOne({ where: { id: req.query.id } });

        }).then(function (restransaction) {
            if (restransaction != null) {
                restransaction.updateAttributes({
                    IsComplete: req.query.status,
                    Remark: req.query.Remark,
                    CompletedDate: new Date(),
                    CompletedBy: decoded.username,
                }).then(function (resUpdate) {
                    var objres = {
                        success: true,
                        message: 'Transaction completed successfully.',
                    }
                    res.json(objres);

                });
            } else {
                res.json({
                    success: false,
                    message: "Transaction not found. Try again later."
                });
            }
        }).catch(function (error) {
            if (err.message === 'Token') {
                res.json(InvalidToken);
            } else {
                var obj = {
                    success: false,
                    message: "Transaction can not completed. Try again later.",
                }
                res.json(obj);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})
module.exports = router