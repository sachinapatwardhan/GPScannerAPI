//Tables
var router = express.Router();
var User = models.tbluserinformation;
var PetDevice = models.tblgpsdevice;
var Pet = models.tblpet;
var Carrier = models.tblcarrier;
var Country = models.tblcountrymgmt;
//End of Tables

router.get('/GetAllPetDevice', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var objSearch = objParam.search.value;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = {};
    var search1 = {};
    search1['$and'] = [];

    var IsUserSuperAdmin = false;
    var IsCountryAll = false;
    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }

    var UserRoles = objParam.UserRoles;

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
                                search1['$or'].push(['tblpetdevice.DeviceId like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'IMEI') {
                                search1['$or'].push(['tblpetdevice.IMEI like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'id') {
                                search1['$or'].push(['tblpetdevice.id like ?', "%" + objSearch + "%"]);
                            } else if (columnName == 'Type') {
                                if (objSearch == 'C2' || objSearch == 'c2' || objSearch == 'c' || objSearch == 'C') {
                                    objSearch = 'M2-U';
                                    search1['$or'].push(['tblpetdevice.Type like ?', "%" + objSearch + "%"]);
                                } else if (objSearch == 'M2' || objSearch == 'm2') {
                                    objSearch = 'M2';
                                    search1['$or'].push(['tblpetdevice.Type = ?', objSearch]);
                                } else if (objSearch == '2' || objSearch == '3') {
                                    search1['$or'].push(['tblpetdevice.Type like ?', "%" + objSearch + "%"]);
                                } else if (objSearch == 'M3' || objSearch == 'm3') {
                                    objSearch = 'M2';
                                    search1['$or'].push(['tblpetdevice.Type like ?', "%" + objSearch + "%"]);
                                } else if (objSearch == 'm' || objSearch == 'M') {
                                    search1['$or'].push(['tblpetdevice.Type like ?', "%M2%"]);
                                    search1['$or'].push(['tblpetdevice.Type like ?', "%M3%"]);

                                }
                            } else if (columnName == 'CreatedBy') {
                                search1['$or'].push(['tblpetdevice.CreatedBy like ?', "%" + objSearch + "%"]);
                            }
                        };
                    };
                }
                if (!IsUserSuperAdmin) {
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

                PetDevice.belongsTo(Country, {
                    foreignKey: {
                        name: 'CountryId',
                        allowNull: true
                    }
                });

                PetDevice.findAndCountAll({
                    where: search1,
                    order: Orderby,
                    offset: parseInt(objParam.start),
                    limit: parseInt(objParam.length),
                    include: [{
                        model: Country,
                        attributes: ['Country'],
                        required: flg,
                        where: search,
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


                console.log("****************")
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

router.post('/SavePetDevice', jsonParser, function(req, res) {
    objPetDevice = req.body;
    objHeader = req.headers;

    //Set parameters for user permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {
                if (objPetDevice.id == 0) {

                    //Set parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            PetDevice.findOrCreate({ where: { DeviceId: objPetDevice.DeviceId }, defaults: objPetDevice }).then(function(response) {
                                if ((response[1])) {
                                    funAuditLog.CreateAuditLog('SavePetDevice', UserExist.username, 'Create Pet Device');
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
                        if (AccessPermission) {
                            PetDevice.findOne({ where: { DeviceId: objPetDevice.DeviceId }, defaults: objPetDevice }).then(function(objPetDeviceExit) {
                                if (objPetDeviceExit != null && objPetDevice.id != objPetDeviceExit.id) {
                                    res.json({ success: false, message: "Tracker is already exist...", data: objPetDeviceExit });
                                } else {
                                    PetDevice.update(objPetDevice, { where: { id: objPetDevice.id } }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SavePetDevice', UserExist.username, 'Update Pet Device');
                                            res.json({ success: true, message: "Tracker updated successfully", data: response });
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

                                PetDevice.findOrCreate({
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

module.exports = router