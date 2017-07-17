//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Language = models.language;
var Localizedproperty = models.localizedproperty;
//End of Tables

router.get('/GetAllLanguage', function(req, res) {
    Language.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})


router.get('/GetAllPublishLanguage', function(req, res) {
    Language.findAll({ where: { Published: true }, order: ['DisplayOrder'] }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetLanguageById', function(req, res) {
    Language.findOne({ where: { Id: req.query.idLanguage } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.get('/GetLangageCulture', function(req, res) {
    var allCountryCodes = CountryLanguage.getLanguages();
    var culturename = [];
    for (var i = 0; i < allCountryCodes.length; i++) {
        if (allCountryCodes[i].langCultureMs) {
            allCountryCodes[i].langCultureMs.forEach(function(locale) {
                culturename.push(locale.langCultureName);
            })
        };
    };

    res.json(culturename);
})




router.post('/SaveLanguage', jsonParser, function(req, res) {
    objLanguage = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objLanguage.Id == 0) {
                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            Language.findOrCreate({ where: { Name: objLanguage.Name }, defaults: objLanguage }).then(function(response) {
                                if ((response[1])) {
                                    funAuditLog.CreateAuditLog('SaveLanguage', UserExist.username , 'Create Language');
                                    res.json({ success: true, message: "Language created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Language is already Exist...", data: response });
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {
                    //set Parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            Language.findOne({ where: { Name: objLanguage.Name }, defaults: objLanguage }).then(function(objLanguageExist) {
                                if (objLanguageExist != null && objLanguage.Id != objLanguageExist.Id) {
                                    res.json({ success: false, message: "Language is already Exist...", data: objLanguageExist });
                                } else {
                                    Language.update(objLanguage, { where: { Id: objLanguage.Id } }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveLanguage', UserExist.username , 'Update Language');
                                            res.json({ success: true, message: "Language updated successfully...", data: response });
                                        }
                                    })
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
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
})



router.post('/CreateLocalizedProperty', jsonParser, function(req, res) {
    lstLocalizedProperty = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (lstLocalizedProperty.length > 0) {
                    function uploadLocalizeProperty(i) {
                        if (i < lstLocalizedProperty.length) {
                            var objLocalizedProperty = lstLocalizedProperty[i];
                            if (objLocalizedProperty.Id == 0) {
                                if (objLocalizedProperty.LocaleValue != null && objLocalizedProperty.LocaleValue != '' && objLocalizedProperty.LocaleValue != undefined) {
                                    objLocalizedProperty.EntityId = parseInt(req.query.EntityId);
                                    Localizedproperty.findOrCreate({
                                        where: {
                                            EntityId: objLocalizedProperty.EntityId,
                                            LanguageId: objLocalizedProperty.LanguageId,
                                            LocaleKeyGroup: objLocalizedProperty.LocaleKeyGroup,
                                            LocaleKey: objLocalizedProperty.LocaleKey,
                                        },
                                        defaults: objLocalizedProperty
                                    }).then(function(response) {
                                        // if ((response[1])) {
                                        //     res.json({ success: true, message: "LocalizedProperty Created successfully...", data: response });
                                        // } else {
                                        //     res.json({ success: false, message: "LocalizedProperty is already Exist...", data: response });
                                        // }
                                        uploadLocalizeProperty(i + 1);

                                    })
                                } else {
                                    // res.json({ success: false, message: "No value" });
                                    uploadLocalizeProperty(i + 1);

                                }
                            } else {
                                if (objLocalizedProperty.LocaleValue != null && objLocalizedProperty.LocaleValue != '' && objLocalizedProperty.LocaleValue != undefined) {
                                    objLocalizedProperty.EntityId = parseInt(req.query.EntityId);
                                    Localizedproperty.findOne({
                                        where: {
                                            EntityId: objLocalizedProperty.EntityId,
                                            LanguageId: objLocalizedProperty.LanguageId,
                                            LocaleKeyGroup: objLocalizedProperty.LocaleKeyGroup,
                                            LocaleKey: objLocalizedProperty.LocaleKey,
                                        },
                                        defaults: objLocalizedProperty
                                    }).then(function(objLanguageExist) {
                                        if (objLanguageExist != null && objLocalizedProperty.Id != objLanguageExist.Id) {
                                            // res.json({ success: false, message: "LocalizedProperty is already Exist..", data: objLanguageExist });
                                            uploadLocalizeProperty(i + 1);
                                        } else {
                                            Localizedproperty.update(objLocalizedProperty, { where: { Id: objLocalizedProperty.Id } }).then(function(response2) {
                                                if (response2[0]) {
                                                    // res.json({ success: true, message: "LocalizedProperty Updated successfully...", data: response });
                                                }
                                                uploadLocalizeProperty(i + 1);

                                            })
                                        }
                                    })

                                } else {
                                    // res.json({ success: false, message: "No value" });
                                    uploadLocalizeProperty(i + 1);

                                }
                            }
                        } else {
                            res.json({ success: true, message: "Localized property created.." });

                        }
                    }
                    uploadLocalizeProperty(0);
                }

            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})


router.get('/GetLocalizedPropertyByID', function(req, res) {
    Localizedproperty.findAll({ where: { EntityId: req.query.EntityId, LocaleKeyGroup: req.query.LocaleKeyGroup } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.get('/DeleteLocalizedProperty', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                Localizedproperty.destroy({ where: { EntityId: req.query.EntityId } }).then(function(response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeleteLocalizedProperty', UserExist.username , 'Delete Localized Property');
                        res.json({ success: true, message: "Localized property deleted successfully...", data: response });
                    } else {
                        res.json({ success: false, message: "Requested Record not Exist....", data: response });
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});



router.get('/DeleteLanguage', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    req.query['permission'] = "Deleted";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
                    if (UserExist != null) {
                        Language.destroy({ where: { Id: req.query.idLanguage } }).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('DeleteLanguage', UserExist.username , 'Delete Language');
                                res.json({ success: true, message: "Language deleted successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "Requested Record not Exist....", data: response });
                            }
                        })
                    } else {
                        res.json(InvalidToken);
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        } else {
            res.json(NoAccessPermission);
        }
    });
});

module.exports = router
