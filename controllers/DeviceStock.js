var router = express.Router();
var StockEntry = models.tblstockentry;
var Type = models.tbltype;

router.get('/GetAllType', function(req, res) {
    try {
        Type.findAll({
            order: 'displayorder'
        }).then(function(response) {
            res.json({
                success: 1,
                message: "Success",
                lstTypes: response
            });
        });
    } catch (err) {
        res.json({
            success: 0,
            message: "Exception Try Agian Later"
        });
    }
})

router.post('/ManageStock', jsonParser, function(req, res) {
    try {
        var objStockDtl = req.body
        objStockDtl.createddate = new Date();

        StockEntry.findOne({
            where: {
                entryvalue: objStockDtl.entryvalue
            }
        }).then(function(resExistsStockEntry) {
            if (resExistsStockEntry == null) {
                StockEntry.create(objStockDtl).then(function(resCreate) {
                    res.json({
                        success: 1,
                        message: "Stock Detail Save Successfully",
                        resdata: resCreate
                    });
                });
            } else {
                res.json({
                    success: 0,
                    message: "Stock Detail Already Exist"
                });
            }
        });
    } catch (err) {
        res.json({
            success: 0,
            message: "Exception Try Agian Later"
        });
    }
});

router.get('/GetAllStock', function(req, res) {
    try {
        StockEntry.belongsTo(Type, {
            foreignKey: {
                name: 'idtype',
                allowNull: false
            }
        });

        var searchque = {};
        if (req.query.stype != "ALL") {
            searchque['$and'] = [];
            var obj = new Object();
            obj['idtype'] = {
                $eq: parseInt(req.query.stype)
            };
            searchque['$and'].push(obj);
        }

        if (req.query.sentryvalue != '' && req.query.sentryvalue != null && req.query.sentryvalue != undefined) {
            if (searchque['$and'] == undefined) {
                searchque['$and'] = [];
            }
            searchque['$and'].push(["entryvalue like '%" + req.query.sentryvalue + "%'"]);
        }

        StockEntry.findAll({
            where: searchque,
            order: "createddate",
            include: [{
                model: Type,
                required: true
            }]
        }).then(function(resStockEntry) {
            res.json({
                success: 1,
                message: "Success",
                lstStock: resStockEntry
            });
        });
    } catch (err) {
        res.json({
            success: 0,
            message: "Exception Try Agian Later"
        });
    }
})

router.get("/DeleteStock", function(req, res) {
    try {
        StockEntry.destroy({
            where: {
                id: req.query.id,
            }
        }).then(function(resDeleteResponse) {
            if (resDeleteResponse) {
                res.json({
                    success: 1,
                    message: "StockEntry Deleted Successfully"
                });
            } else {
                res.json({
                    success: 0,
                    message: "StockEntry Already Deleted"
                });
            }
        });
    } catch (err) {
        res.json({
            success: 0,
            message: "Exception When StockEntry Agent,Try Again Later"
        });
    }
});

module.exports = router
