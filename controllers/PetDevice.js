//Tables
var router = express.Router();
var User = models.tbluserinformation;
var GPSDevice = models.tblgpsdevice;
var Pet = models.tblpet;
var Carrier = models.tblcarrier;
var Country = models.tblcountrymgmt;
var TelCo = models.tbltelco;
var SimService = models.tblsimdetails;
//End of Tables

router.get('/GetAllGPSDeviceold', function(req, res) {
    var objParam = req.query;

    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = {};
    var search1 = {};
    search1['$and'] = [];
    var TelSearchflg = false;
    var SalesAgSearchflg = false;

    var IsUserSuperAdmin = false;
    var IsCountryAll = false;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }

    var UserRoles = objParam.UserRoles;
    if (UserRoles == 'Sales Agent') {
        var obj1 = new Object();
        obj1['idSalesAgent'] = {
            $eq: parseInt(objParam.UserId)
        }
        search1['$and'].push(obj1);
    }
    if (UserRoles.length > 0) {

        function CheckUserCountry(i) {
            if (i < UserRoles.length) {

                if (UserRoles[i] == 'Super Admin') {
                    IsUserSuperAdmin = true;
                    CheckUserCountry(i + 1);
                } else {
                    CheckUserCountry(i + 1);
                }

            } else {
                if (objSearch != null && objSearch != '') {
                    search1['$or'] = [];

                    for (var i = 0; i < objColumns.length; i++) {
                        if (objColumns[i].data != null && objColumns[i].data != '') {
                            var columnName = objColumns[i].data;

                            if (columnName == 'DeviceId') {
                                search1['$or'].push(['tblgpsdevice.DeviceId like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'Type') {
                                search1['$or'].push(['tblgpsdevice.Type like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'Version') {
                                search1['$or'].push(['tblgpsdevice.Version like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'CreatedBy') {
                                search1['$or'].push(['tblgpsdevice.CreatedBy like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'CreatedDate') {
                                search1['$or'].push(['tblgpsdevice.CreatedDate like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'SimNum') {
                                search1['$or'].push(['tblgpsdevice.SimNum like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'tbltelco.Name') {
                                TelSearchflg = true;
                                search1['$or'].push(['tbltelco.Name like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'tbluserinformation.username') {
                                SalesAgSearchflg = true;
                                search1['$or'].push(['tbluserinformation.username like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'ExpiryDate') {
                                search1['$or'].push(['tblgpsdevice.ExpiryDate like ?', "%" + objSearch + "%"]);
                            }
                        };
                    };
                }
                if (!IsUserSuperAdmin && CountryList.length != 0) {
                    search['$or'] = [];
                    if (CountryList.length > 0) {
                        function CheckCountry(p) {
                            if (p < CountryList.length) {
                                var obj = new Object();
                                if (CountryList[p] != "") {

                                    obj['Country'] = {
                                        $like: '%' + CountryList[p] + '%'
                                    }

                                    search['$or'].push(obj);

                                    if (CountryList[p] == "All") {
                                        IsCountryAll = true;
                                    }
                                }
                                CheckCountry(p + 1);
                            }
                        }
                        CheckCountry(0);
                    }
                }

                var flg = true;
                if (IsCountryAll || IsUserSuperAdmin) {
                    flg = false;
                }

                GPSDevice.belongsTo(Country, {
                    foreignKey: {
                        name: 'CountryId',
                        allowNull: true
                    }
                });
                GPSDevice.belongsTo(TelCo, {
                    foreignKey: {
                        name: 'TelCoId',
                        allowNull: true
                    }
                });
                GPSDevice.belongsTo(User, {
                    foreignKey: {
                        name: 'idSalesAgent',
                        allowNull: true
                    }
                });

                GPSDevice.findAndCountAll({
                    where: search1,
                    order: Orderby,
                    offset: parseInt(objParam.start),
                    limit: parseInt(objParam.length),
                    include: [{
                        model: Country,
                        attributes: ['Country'],
                        required: flg,
                        where: search,
                    }, {
                        model: TelCo,
                        required: TelSearchflg,
                    }, {
                        model: User,
                        required: SalesAgSearchflg,
                    }],
                }).then(function(response) {
                    var response1 = new Object();
                    response1.draw = objParam.draw;
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
            }
        }
        CheckUserCountry(0)
    }
})
router.get('/GetAllGPSDevice', function(req, res) {
    var objParam = req.query;

    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var search = '';

    var TelSearchflg = false;
    var SalesAgSearchflg = false;

    var IsUserSuperAdmin = false;
    var IsCountryAll = false;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }

    var UserRoles = objParam.UserRoles;

    if (objSearch != null && objSearch != '') {
        search = 'Where (tblgpsdevice.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.Type like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.IMEI like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.Version like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.SimNum like "%' + objSearch + '%" or ';
        search = search + 'tbltelco.Name like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.ExpiryDate like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdevice.CreatedBy like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.username like "%' + objSearch + '%") ';
    };
    if (objParam.UserId != null && objParam.UserId != undefined && objParam.UserId != '') {
        if (search != "") {
            search += " and tblgpsdevice.idSalesAgent =" + objParam.UserId;
        } else {
            search += " Where tblgpsdevice.idSalesAgent =" + objParam.UserId;
        }
    }

    if (search != "") {
        search += ' and tblgpsdevice.AppName = "' + objParam.AppName + '"';
    } else {
        search += ' where tblgpsdevice.AppName = "' + objParam.AppName + '"';
    }
    var query = " select tblgpsdevice.*, tbltelco.Name, tbluserinformation.username, tbluserinformation.idApp" +
        " from tblgpsdevice " +
        " Left Join tbluserinformation on tblgpsdevice.idSalesAgent=tbluserinformation.id " +
        " Left Join tbltelco on tblgpsdevice.TelCoId = tbltelco.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);

    var Countqry = "SELECT count(tblgpsdevice.id) as TotalRecord " +
        " from tblgpsdevice " +
        " Left Join tbluserinformation on  tblgpsdevice.idSalesAgent=tbluserinformation.id " +
        " Left Join tbltelco on tblgpsdevice.TelCoId = tbltelco.id " + search;
    // " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    connection.query(query, function(err, response) {
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

})

router.get('/GetGPSDeviceById', function(req, res) {
    GPSDevice.findOne({
        where: {
            DeviceId: req.query.DeviceId
        }
    }).then(function(response) {
        res.json(response);
    }).catch(function(err) {
        res.json(err);
    })
})

// router.get('/GetAllPetDeviceStatusbyCountry', function(req, res) {

//     var objParam = req.query;
//     var objColumns = objParam.columns;
//     var objOrderBy = objParam.order;
//     var objSearch = objParam.search;
//     var objSearch = objParam.search.value;

//     var CountryList = objParam.CountryList;
//     if (CountryList == undefined || CountryList == null || CountryList == "") {
//         CountryList = [];
//     }
//     var UserRoles = objParam.UserRoles;
//     var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
//     var search = {};
//     var search1 = {};

//     search1['$and'] = [];

//     var IsUserSuperAdmin = false;
//     var IsCountryAll = false;


//     if (objSearch != null && objSearch != '') {
//         search['$or'] = [];
//         for (var i = 0; i < objColumns.length; i++) {
//             if (objColumns[i].data != null && objColumns[i].data != '') {
//                 var columnName = objColumns[i].data;
//                 var obj = new Object();
//                 obj[columnName] = {
//                     $like: '%' + objSearch + '%'
//                 }
//                 search['$or'].push(obj);
//             };
//         };
//     }

//     search['$and'] = [];

//     search['$and'].push({ IsDeleted: false });

//     Pet.belongsTo(User, {
//         foreignKey: {
//             name: 'iduser',
//             allowNull: false
//         }
//     });

//     if (UserRoles.length > 0) {

//         function CheckUserCountry(i) {
//             if (i < UserRoles.length) {
//                 if (UserRoles[i] == 'Super Admin') {
//                     IsUserSuperAdmin = true;
//                     CheckUserCountry(i + 1);
//                 } else {
//                     CheckUserCountry(i + 1);
//                 }

//             } else {
//                 if (!IsUserSuperAdmin) {
//                     search['$or'] = [];
//                 } else {
//                     search['$and'] = [];
//                 }


//                 if (!IsUserSuperAdmin) {
//                     search['$or'] = [];
//                     if (CountryList.length > 0) {
//                         function CheckCountry(p) {
//                             if (p < CountryList.length) {
//                                 var obj = new Object();
//                                 if (CountryList[p] != "") {

//                                     obj['country'] = {
//                                         $like: '%' + CountryList[p] + '%'
//                                     }
//                                     search['$or'].push(obj);

//                                     if (CountryList[p] == "All") {
//                                         IsCountryAll = true;
//                                     }
//                                 }
//                                 CheckCountry(p + 1);
//                             }
//                         }
//                         CheckCountry(0);
//                     }
//                 }

//                 if (IsCountryAll) {
//                     search = {};
//                 } else {
//                     search1['$and'].push(search)
//                 }

//                 if (!IsUserSuperAdmin) {
//                     Pet.findAndCountAll({
//                         //where: search,
//                         where: {
//                             deviceid: {
//                                 $ne: ''
//                             },
//                             $and: [search]
//                         },
//                         order: Orderby,
//                         offset: parseInt(objParam.start),
//                         limit: parseInt(objParam.length),
//                         include: [{
//                             model: User,
//                             where: { country: UserCountry },
//                             required: true
//                         }]
//                     }).then(function(response) {
//                         var PetList = [];
//                         var response1 = new Object();
//                         response1.draw = objParam.draw;
//                         response1.recordsTotal = response.count;
//                         response1.recordsFiltered = response.count;
//                         response1.data = response.rows;
//                         res.json(response1);

//                     }).catch(function(error) {
//                         res.json(error);
//                     })
//                 } else {
//                     Pet.findAndCountAll({
//                         //where: search,
//                         where: {
//                             deviceid: {
//                                 $ne: ''
//                             },
//                             $and: [search]
//                         },
//                         order: Orderby,
//                         offset: parseInt(objParam.start),
//                         limit: parseInt(objParam.length),
//                         include: [{
//                             model: User,
//                             required: true
//                         }]
//                     }).then(function(response) {
//                         var PetList = [];
//                         var response1 = new Object();
//                         response1.draw = objParam.draw;
//                         response1.recordsTotal = response.count;
//                         response1.recordsFiltered = response.count;
//                         response1.data = response.rows;
//                         res.json(response1);

//                     }).catch(function(error) {
//                         res.json(error);
//                     })
//                 }
//             }
//         }
//         CheckUserCountry(0);
//     }

// })

router.get('/GetAllPetbyCountry', function(req, res) {

    var model = [];

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var objSearch = objParam.search.value;
    var UserCountry = objParam.UserCountry;
    var UserRoles = objParam.UserRoles;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }
    var country = objParam.country;

    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var IsUserSuperAdmin = false;
    var search = {};
    var search1 = {};
    var IsCountryAll = false;

    if (objSearch != null && objSearch != '') {
        search['$or'] = [];
        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                var obj = new Object();
                obj[columnName] = {
                    $like: '%' + objSearch + '%'
                }
                search['$or'].push(obj);
            };
        };
    }

    search['$and'] = [];
    search['$and'].push({ IsDeleted: false });
    search['$and'].push({
        deviceid: {
            $ne: ''
        }
    });

    deviceid: {
        $ne: ''
    }
    Pet.belongsTo(User, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });

    // if (country != null && country != '') {
    //     model.push({
    //         model: User,
    //         where: {
    //             country: country
    //         }
    //     });
    // } else {
    //     model.push({
    //         model: User
    //     });

    // }

    if (UserRoles.length > 0) {

        function CheckUserCountry(i) {
            if (i < UserRoles.length) {
                if (UserRoles[i] == 'Super Admin') {
                    IsUserSuperAdmin = true;
                    CheckUserCountry(i + 1);
                } else {
                    CheckUserCountry(i + 1);
                }

            } else {

                search1['$or'] = [];

                if (CountryList.length > 0) {
                    function CheckCountry(p) {
                        if (p < CountryList.length) {
                            var obj = new Object();
                            if (CountryList[p] != "") {

                                obj['country'] = {
                                    $like: '%' + CountryList[p] + '%'
                                }
                                search1['$or'].push(obj);

                                if (CountryList[p] == "All") {
                                    IsCountryAll = true;
                                }
                            }
                            CheckCountry(p + 1);
                        }
                    }
                    CheckCountry(0);
                }
                if (!IsUserSuperAdmin && !IsCountryAll) {
                    Pet.findAndCountAll({
                        where: search,
                        order: Orderby,
                        offset: parseInt(objParam.start),
                        limit: parseInt(objParam.length),
                        include: [{
                            model: User,
                            // where: { country: UserCountry },
                            where: search1,
                            required: true
                        }]
                    }).then(function(response) {
                        var PetList = [];
                        var response1 = new Object();
                        response1.draw = objParam.draw;
                        response1.recordsTotal = response.count;
                        response1.recordsFiltered = response.count;
                        response1.data = response.rows;
                        res.json(response1);

                    }).catch(function(error) {
                        res.json(error);
                    })
                } else {
                    Pet.findAndCountAll({
                        where: search,
                        order: Orderby,
                        offset: parseInt(objParam.start),
                        limit: parseInt(objParam.length),
                        include: [{
                                model: User,
                                required: true
                            }]
                            //include: model
                    }).then(function(response) {
                        var PetList = [];
                        var response1 = new Object();
                        response1.draw = objParam.draw;
                        response1.recordsTotal = response.count;
                        response1.recordsFiltered = response.count;
                        response1.data = response.rows;
                        res.json(response1);

                    }).catch(function(error) {
                        res.json(error);
                    })
                }
            }
        }
        CheckUserCountry(0);
    }
})

router.post('/SaveGPSDevice', jsonParser, function(req, res) {
    objGPSDevice = req.body;
    if (objGPSDevice.idSalesAgent == 0) {
        objGPSDevice.idSalesAgent = null
    }
    objHeader = req.headers;
    //Set parameters for user permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objGPSDevice.id == 0) {
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            objGPSDevice.CreatedDate = new Date();
                            objGPSDevice.CreatedBy = decoded.username;
                            GPSDevice.findOrCreate({ where: { DeviceId: objGPSDevice.DeviceId }, defaults: objGPSDevice }).then(function(response) {
                                if ((response[1])) {
                                    funAuditLog.CreateAuditLog('SaveGPSDevice', UserExist.username, 'Create Pet Device');
                                    res.json({ success: true, message: "Tracker created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Tracker already exist...", data: response });
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {
                    //set parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {;
                            GPSDevice.findOne({ where: { DeviceId: objGPSDevice.DeviceId } }).then(function(objGPSDeviceExit) {
                                if (objGPSDeviceExit != null && objGPSDevice.id != objGPSDeviceExit.id) {
                                    res.json({ success: false, message: "Tracker is already exist...", data: objGPSDeviceExit });
                                } else {
                                    GPSDevice.update(objGPSDevice, { where: { id: objGPSDevice.id } }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveGPSDevice', UserExist.username, 'Update Pet Device');
                                            res.json({ success: true, message: "Tracker updated successfully", data: response });
                                        } else {
                                            res.json({ success: false, message: "Tracker Is Not updated", data: response });
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
});

router.get('/UpdateStatus', function(req, res) {
    objHeader = req.headers;
    var ExpiryDate = null;
    if (req.query.IsActive == 1) {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        var c = new Date(year + 1, month, day)
        ExpiryDate = c;
    }
    //Set parameters for user permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        GPSDevice.findOne({
            where: {
                id: req.query.id,
            }
        }).then(function(ObjExist) {
            if (ObjExist) {
                ObjExist.updateAttributes({
                    IsActive: req.query.IsActive,
                    ExpiryDate: ExpiryDate,
                }).then(function(response) {
                    if (response) {
                        res.json({ success: true, message: "Tracker Status Updated successfully", data: response });
                    }
                })
            }
        })
    }
})

router.post('/uploadExcelDevice', function(req, res) {
    var form = new formidable.IncomingForm();
    var lst = [];
    var FileName = [];
    var DeviceType;
    var IsOldDevice;
    var CreatedBy;
    var CountryId;
    var CarrierId;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //var FileName = __dirname + '/../MediaUploads/FileUpload/DeviceList.xlsx';
    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';

    form.parse(req, function(err, fields, files) {
        //console.log(fields);
        DeviceType = fields.Type;
        IsOldDevice = fields.IsOldDevice;
        CreatedBy = fields.CreatedBy;
        CountryId = fields.CountryId;
        CarrierId = fields.CarrierId;
    });

    form.on('fileBegin', function(name, file) {
        file.path = form.uploadDir + "/" + file.name;
        // console.log(file.path);
        FileName = file.path.toString();
        //FileName.push(file.path);
    });

    form.on('end', function() {
        if (FileName.length > 0) {
            var workbook = XLSX.readFile(FileName, { type: 'binary' });
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            if (worksheet != null && worksheet != undefined && worksheet != '') {
                var Firstcolumn = worksheet.A1.v;
                if (Firstcolumn == "DeviceId") {
                    lst = XLSX.utils.sheet_to_json(worksheet);
                    if (lst.length > 0) {
                        function addDevice(i) {
                            if (i < lst.length) {
                                var obj = new Object();
                                obj.DeviceId = lst[i].DeviceId.trim();
                                obj.IMEI = lst[i].DeviceId.trim();
                                obj.CreatedDate = new Date();
                                obj.Latitude = '22.54967667';
                                obj.Longitude = '114.0822583';
                                obj.speed = '0.1';
                                obj.Direction = '323.87';
                                obj.Type = DeviceType;
                                obj.IsOldDevice = IsOldDevice;
                                obj.CreatedBy = CreatedBy;
                                obj.CountryId = CountryId;
                                if (CarrierId == 'null') {
                                    obj.CarrierId = null;
                                } else {
                                    obj.CarrierId = CarrierId;
                                }

                                GPSDevice.findOrCreate({
                                    where: { DeviceId: obj.DeviceId },
                                    defaults: obj
                                }).then(function(response) {
                                    addDevice(i + 1);
                                })

                            } else {
                                res.json({
                                    success: true,
                                    message: "Excel File uploaded successfully..",
                                });
                            }
                        }
                        addDevice(0)
                    } else {
                        res.json({
                            success: false,
                            message: "No Data in Excel File..",
                        });
                    }

                } else {
                    res.json({
                        success: false,
                        message: "Excel File is Not in Valid Format, You can Download Template for import Excel File.",
                    });
                }
            } else {
                res.json({
                    success: false,
                    message: "Error in Import , Excel File is Protected..",
                });
            }
        } else {
            res.json({
                success: false,
                message: "No File Found..",
            });
        };

    });
});

router.get('/DownloadTemplate', function(req, res) {
    var conf = {};
    conf.name = "Sheet1";
    conf.cols = [{
        caption: 'DeviceId',
        type: 'string'
    }];


    var row = [];
    for (var i = 0; i < conf.cols.length; i++) {
        row.push('');
    };
    conf.rows = [];
    conf.rows.push(row);
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "TrackersManagement_Template.xlsx");
    res.end(result, 'binary');
})

router.get('/GetGPSDeviceByIMEI', function(req, res) {
    GPSDevice.findOne({ where: { IMEI: req.query.IMEI } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, data: response });
        } else {
            res.json({ success: false, data: response });
        }
    }).catch(function(err) {
        res.json({ success: false, data: err });
    })
})

router.get('/GetSIMDetailBySerialNum', function(req, res) {
    SimService.findOne({ where: { SerialNum: req.query.SerialNum } }).then(function(response) {
        if (response != null) {
            GPSDevice.findOne({ where: { idSim: response.id } }).then(function(response1) {
                if (response1 != null) {
                    res.json({ success: false, message: 'SIM Is Already assigned.', data: response1 });
                } else {
                    res.json({ success: true, message: 'Success', data: response });
                }
            })
        } else {
            res.json({ success: false, message: 'Invalid Serial Number.', data: response });
        }
    }).catch(function(err) {
        res.json({ success: false, data: err });
    })
})

router.get('/SaveSimServiceToIMEI', function(req, res) {

    var query = "UPDATE tblgpsdevice SET idSim = " + req.query.idSim + " where IMEI = '" + req.query.IMEI + "' ";
    console.log(query);

    connection.query(query, function(err, response) {
        if (response != undefined) {
            res.json({ success: true, message: 'SIM Serial Num Attached SuccessFully', data: response });
        } else {
            res.json({ success: false, message: 'Please Try Again Later', data: err });
        }
    })
})

module.exports = router