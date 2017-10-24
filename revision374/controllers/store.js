//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Store = models.store;
var StoreMapping = models.storemapping;
var ACL = models.aclrecord;
//End of Tables

router.get('/GetAllStore', function (req, res) {
    Store.findAll().then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})

router.get('/GetStoreById', function (req, res) {
    Store.findOne({ where: { Id: req.query.idStore } }).then(function (response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        }
        else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.post('/SaveStore', jsonParser, function (req, res) {
    objStore = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                if (objStore.Id == 0) {
                    Store.findOrCreate({ where: { Name: objStore.Name }, defaults: objStore }).then(function (response) {
                        if ((response[1])) {
                            funAuditLog.CreateAuditLog('SaveStore', UserExist.username , 'Create Store');
                            res.json({ success: true, message: "Store created successfully...", data: response });
                        }
                        else {
                            res.json({ success: false, message: "Store is already Exist...", data: response });
                        }
                    })
                } else {
                    Store.findOne({ where: { Name: objStore.Name }, defaults: objStore }).then(function (objStoreExist) {
                        if (objStoreExist != null && objStore.Id != objStoreExist.Id) {
                            res.json({ success: false, message: "Store is already Exist...", data: objStoreExist });
                        }
                        else {
                            Store.update(objStore, { where: { Id: objStore.Id } }).then(function (response) {
                                if (response[0]) {
                                    funAuditLog.CreateAuditLog('SaveStore', UserExist.username , 'Update Store');
                                    res.json({ success: true, message: "Store updated successfully...", data: response });
                                }
                            })
                        }
                    })
                }
            }
            else {
                res.json(InvalidToken);
            }
        })
    }
    else {
        res.json(InvalidToken);
    }
})

router.get('/DeleteStore', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                Store.destroy({ where: { Id: req.query.idStore } }).then(function (response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeleteStore', UserExist.username , 'Delete Store');
                        res.json({ success: true, message: "Store deleted successfully...", data: response });
                    }
                    else {
                        res.json({ success: false, message: "Requested Record not Exist....", data: response });
                    }
                })
            }
            else {
                res.json(InvalidToken);
            }
        })
    }
    else {
        res.json(InvalidToken);
    }
});

//Strore Mapping
router.get('/GetAllStoreByEntity', function (req, res) {

    StoreMapping.findAll({
        where: { EntityId: req.query.EntityId, EntityName: req.query.EntityName }
    }).then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})

//ACL
router.get('/GetAllACLByEntity', function (req, res) {
    ACL.findAll({
        where: { EntityId: req.query.EntityId, EntityName: req.query.EntityName }
    }).then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})

module.exports = router
