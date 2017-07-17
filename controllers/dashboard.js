//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Pet = models.tblpet;
var PetDevice = models.tblgpsdevice;
var Country = models.tblcountrymgmt;
var Bike = models.tblbike;

//End of Tables

function convertdateformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();
    // return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    // return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2)+(firstdayHours.toString())+(firstdayMinutes.toString())+(firstdaySeconds.toString());
    if (flg == 1) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + (firstdayHours.toString()) + ":" + (firstdayMinutes.toString()) + ":" + (firstdaySeconds.toString());

    } else {
        return ("0000" + firstdayDay.toString()).slice(-2) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayYear.toString()).slice(-4);
    }
}

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};
router.get('/GetAllWorkingBike', jsonParser, function(req, res) {
    connection.query("SELECT  tb.id,tb.deviceid,tb.bikeimageURl,tb.bikeNumber,tb.IsOnline, tpg.Latitude,tpg.Longtitude,tpg.Datetime, tpg.Id, tpg.Speed FROM tblbike tb INNER JOIN tblgpsscanner tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId,MAX(Id) Id FROM tblgpsscanner GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Id = b.Id WHERE IsDeleted=false and IsOnline=1;", function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {

            res.json({ success: false, data: [] });
        }
    })

})

router.get('/GetTotalCustomerByCountry', function(req, res) {
    Bike.belongsTo(User, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });
    Bike.findAll({
        where: {
            IsDeleted: '0',
            deviceid: {
                $ne: ''
            }
        },
        include: [{
            model: User,
            attributes: [
                //[models.sequelize.fn('count', 'iduser'), 'Total'],
                [models.Sequelize.literal('COUNT(DISTINCT(iduser))'), 'Total'],
                'country', 'Type'
            ]
        }],
        group: ['country', 'Type'],
        order: 'country',
    }).then(function(resUser) {
        if (resUser != null) {
            res.json({
                success: true,
                message: "Record found...",
                data: resUser
            });
        } else {
            res.json({
                success: false,
                message: "Record not found...",
                data: resUser
            });
        }
    })

})

router.get('/GetGraphData', function(req, res) {

    var CountryName = req.query.countryName;

    var CountryList = req.query.CountryList;
    if (CountryList == null || CountryList == "" || CountryList == undefined) {
        CountryList = [];
    }
    var IsSuperAdmin = req.query.IsSuperAdmin;
    if (IsSuperAdmin == null || IsSuperAdmin == "" || IsSuperAdmin == undefined) {
        IsSuperAdmin = false;
    }
    var IsCountryAll = false;

    var search1 = {};
    //var flg = false;

    var flg = true;


    //search['$and'] = [];

    if (IsSuperAdmin == 'false' || IsSuperAdmin == false) {
        search1['$or'] = [];

        if (CountryList.length > 0) {
            function checkcountry(z) {
                if (z < CountryList.length) {
                    if (CountryList[z] == "All") {
                        IsCountryAll = true;
                        flg = false;
                        checkcountry(CountryList.length);
                    } else {
                        var obj = new Object();

                        obj['country'] = {
                            $like: '%' + CountryList[z] + '%'
                        }
                        search1['$or'].push(obj);
                        checkcountry(z + 1);
                    }
                } else {

                    if (IsCountryAll) {
                        search1 = {};
                    }
                    if (CountryList.length == 3 && CountryList == "All") {
                        search1 = {};
                    }
                }
            }
            checkcountry(0);
        } else {
            var obj = new Object();
            obj['country'] = {
                $like: null
            }
            search1['$or'].push(obj);
        }
    } else {
        flg = false;
    }

    User.findAll({
        // where: { country: CountryName },
        where: search1,
        attributes: [
            [models.sequelize.fn('count', 'id'), 'Total'],
            [models.sequelize.fn('day', models.sequelize.col('createddate')), 'day'],
            [models.sequelize.fn('month', models.sequelize.col('createddate')), 'month'],
            [models.sequelize.fn('year', models.sequelize.col('createddate')), 'year'],
            'Type', 'country'
        ],
        group: ['Type', 'country', models.sequelize.fn('day', models.sequelize.col('createddate')), models.sequelize.fn('month', models.sequelize.col('createddate')), models.sequelize.fn('year', models.sequelize.col('createddate'))],
        order: ['year', 'month', 'day']
    }).then(function(resUser) {
        res.json({
            success: true,
            UserData: resUser
        });
    })


})

router.get('/GetDashboardData', function(req, res) {
    var CountryName = req.query.countryName;
    var CountryList = req.query.CountryList;
    if (CountryList == null || CountryList == "" || CountryList == undefined) {
        CountryList = [];
    }
    var IsSuperAdmin = req.query.IsSuperAdmin;
    if (IsSuperAdmin == null || IsSuperAdmin == "" || IsSuperAdmin == undefined) {
        IsSuperAdmin = false;
    }
    var IsCountryAll = false;
    var lstDashboard = {};
    var currentDate = new Date();
    var StartDate = convertdateformat(currentDate, 1);
    var EndDate = convertdateformat(currentDate, 1);

    //var Last7days = currentDate.addDays(-7);
    var LastWeek = convertdateformat(currentDate.addDays(-7), 1);
    var firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    var lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    var firstDayMonth = convertdateformat(firstDay, 1);
    var lastDayMonth = convertdateformat(lastDay, 1);

    firstDate = new Date(new Date().getFullYear(), 0, 1);
    lastDate = new Date(new Date().getFullYear(), 11, 31);

    var firstDateYear = convertdateformat(firstDate, 1);
    var lastDateYear = convertdateformat(lastDate, 1);

    var search = {};
    var search1 = {};

    var flg = true;
    search['$and'] = [];
    if (IsSuperAdmin == 'false' || IsSuperAdmin == false) {
        search1['$or'] = [];

        if (CountryList.length > 0) {
            function checkcountry(z) {
                if (z < CountryList.length) {
                    if (CountryList[z] == "All") {
                        IsCountryAll = true;
                        flg = false;
                        checkcountry(CountryList.length);
                    } else {
                        var obj = new Object();

                        obj['country'] = {
                            $like: '%' + CountryList[z] + '%'
                        }
                        search1['$or'].push(obj);
                        checkcountry(z + 1);
                    }
                } else {

                    if (IsCountryAll) {
                        search1 = {};
                    }
                    if (CountryList.length == 3 && CountryList == "All") {
                        search1 = {};
                    }
                }
            }
            checkcountry(0);
        } else {
            var obj = new Object();
            obj['country'] = {
                $like: null
            }
            search1['$or'].push(obj);
        }
    } else {
        flg = false;
    }
    User.count({ where: search1 }).then(function(TotalUser) {
        lstDashboard['TotalUser'] = TotalUser;
        res.json(lstDashboard);
    })

})

router.get('/GetTotalCustomer', function(req, res) {

    Bike.belongsTo(User, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });

    var CountryName = req.query.countryName;
    var IsSuperAdmin = req.query.IsSuperAdmin;
    var CountryList = req.query.CountryList;
    if (IsSuperAdmin == null || IsSuperAdmin == undefined || IsSuperAdmin == "") {
        IsSuperAdmin = [];
    }
    if (CountryList == null || CountryList == undefined || CountryList == "") {
        CountryList = [];
    }
    var search1 = {};
    var IsCountryAll = false;
    if (IsSuperAdmin == 'false' || IsSuperAdmin == false) {
        search1['$or'] = [];

        if (CountryList.length > 0) {
            function checkcountry(z) {
                if (z < CountryList.length) {
                    if (CountryList[z] == "All") {
                        IsCountryAll = true;
                        checkcountry(CountryList.length);
                    } else {
                        var obj = new Object();

                        obj['country'] = {
                            $like: '%' + CountryList[z] + '%'
                        }
                        search1['$or'].push(obj);
                        checkcountry(z + 1);
                    }
                } else {

                    if (IsCountryAll) {
                        search1 = {};
                    }
                    if (CountryList.length == 3 && CountryList == "All") {
                        search1 = {};
                    }
                }
            }
            checkcountry(0);
        } else {
            var obj = new Object();
            obj['country'] = {
                $like: null
            }
            search1['$or'].push(obj);
        }
    }


    Bike.findAll({
        attributes: [
            [models.Sequelize.literal('COUNT(DISTINCT(iduser))'), 'Count'],
        ],
        where: {
            IsDeleted: 0,
            deviceid: {
                $ne: ''
            }
        },
        include: [{
            model: User,
            //where: search1,
            // attributes: [
            //     //[models.sequelize.fn('count', 'iduser'), 'Total'],
            //     'Type'
            // ]
        }]
    }).then(function(response) {
        res.json(response);
    })

})


router.get('/GetTotalDevice', function(req, res) {

    Pet.belongsTo(User, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });

    PetDevice.belongsTo(Country, {
        foreignKey: {
            name: 'CountryId',
            allowNull: false
        }
    });

    var CountryName = req.query.countryName;
    var IsSuperAdmin = req.query.IsSuperAdmin;
    var CountryList = req.query.CountryList;
    if (IsSuperAdmin == null || IsSuperAdmin == undefined || IsSuperAdmin == "") {
        IsSuperAdmin = [];
    }
    if (CountryList == null || CountryList == undefined || CountryList == "") {
        CountryList = [];
    }
    var search1 = {};
    var IsCountryAll = false;
    if (IsSuperAdmin == 'false' || IsSuperAdmin == false) {
        search1['$or'] = [];

        if (CountryList.length > 0) {
            function checkcountry(z) {
                if (z < CountryList.length) {
                    if (CountryList[z] == "All") {
                        IsCountryAll = true;
                        checkcountry(CountryList.length);
                    } else {
                        var obj = new Object();

                        obj['country'] = {
                            $like: '%' + CountryList[z] + '%'
                        }
                        search1['$or'].push(obj);
                        checkcountry(z + 1);
                    }
                } else {

                    if (IsCountryAll) {
                        search1 = {};
                    }
                    if (CountryList.length == 3 && CountryList == "All") {
                        search1 = {};
                    }
                }
            }
            checkcountry(0);
        } else {
            var obj = new Object();
            obj['country'] = {
                $like: null
            }
            search1['$or'].push(obj);
        }
    }
    var search = {};
    var flg = true;
    if (IsCountryAll || IsSuperAdmin == 'true') {
        flg = false;
        search1 = {};
    } else {
        search = {
            CountryId: {
                $ne: null
            }
        }
    }

    PetDevice.count({
        where: search,
        include: [{
            model: Country,
            required: flg,
            where: search1,

        }],
    }).then(function(respetdevice) {

        Pet.findAndCountAll({
            attributes: ["IsOnline"],
            where: {
                IsDeleted: 0,
                deviceid: {
                    $ne: ''
                }
            },
            include: [{
                model: User,
                where: search1
            }]
        }).then(function(respet) {
            var bal_device = respetdevice - respet.count;
            res.json({ DeviceStatus: respet.rows, BalanceDevice: bal_device });
        })
    })

})
router.get('/GetBikeTotalDevice', function(req, res) {

    Bike.belongsTo(User, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });

    PetDevice.belongsTo(Country, {
        foreignKey: {
            name: 'CountryId',
            allowNull: false
        }
    });

    var CountryName = req.query.countryName;
    var IsSuperAdmin = req.query.IsSuperAdmin;
    var CountryList = req.query.CountryList;
    if (IsSuperAdmin == null || IsSuperAdmin == undefined || IsSuperAdmin == "") {
        IsSuperAdmin = [];
    }
    if (CountryList == null || CountryList == undefined || CountryList == "") {
        CountryList = [];
    }
    var search1 = {};
    var IsCountryAll = false;
    if (IsSuperAdmin == 'false' || IsSuperAdmin == false) {
        search1['$or'] = [];

        if (CountryList.length > 0) {
            function checkcountry(z) {
                if (z < CountryList.length) {
                    if (CountryList[z] == "All") {
                        IsCountryAll = true;
                        checkcountry(CountryList.length);
                    } else {
                        var obj = new Object();

                        obj['country'] = {
                            $like: '%' + CountryList[z] + '%'
                        }
                        search1['$or'].push(obj);
                        checkcountry(z + 1);
                    }
                } else {

                    if (IsCountryAll) {
                        search1 = {};
                    }
                    if (CountryList.length == 3 && CountryList == "All") {
                        search1 = {};
                    }
                }
            }
            checkcountry(0);
        } else {
            var obj = new Object();
            obj['country'] = {
                $like: null
            }
            search1['$or'].push(obj);
        }
    }
    var search = {};
    var flg = true;
    if (IsCountryAll || IsSuperAdmin == 'true') {
        flg = false;
        search1 = {};
    } else {
        search = {
            CountryId: {
                $ne: null
            }
        }
    }

    PetDevice.count({
        where: search,
        include: [{
            model: Country,
            required: flg,
            where: search1,

        }],
    }).then(function(respetdevice) {

        Bike.findAndCountAll({
            attributes: ["id", "IsOnline", "IsWireCut", "DeviceType"],
            where: {
                IsDeleted: 0,
                deviceid: {
                    $ne: ''
                }
            },
            include: [{
                model: User,
                where: search1
            }]
        }).then(function(respet) {
            //console.log("respet", respet.rows);
            var bal_device = respetdevice - respet.count;
            res.json({ DeviceStatus: respet.rows, BalanceDevice: bal_device });
        })
    })

})

router.get('/GetGraphCustomer', function(req, res) {

    var CountryName = req.query.countryName;
    var StartDate = (new Date()).addDays(-30);
    var EndDate = new Date();

    var IsSuperAdmin = req.query.IsSuperAdmin;
    var CountryList = req.query.CountryList;
    if (IsSuperAdmin == null || IsSuperAdmin == undefined || IsSuperAdmin == "") {
        IsSuperAdmin = [];
    }
    if (CountryList == null || CountryList == undefined || CountryList == "") {
        CountryList = [];
    }
    var search1 = {};
    var search = {};
    var flg = true;
    var IsCountryAll = false;
    if (IsSuperAdmin == 'false' || IsSuperAdmin == false) {
        search1['$or'] = [];

        if (CountryList.length > 0) {
            function checkcountry(z) {
                if (z < CountryList.length) {
                    if (CountryList[z] == "All") {
                        IsCountryAll = true;
                        flg = false;
                        checkcountry(CountryList.length);
                    } else {
                        var obj = new Object();

                        obj['country'] = {
                            $like: '%' + CountryList[z] + '%'
                        }
                        search1['$or'].push(obj);
                        checkcountry(z + 1);
                    }
                } else {

                    if (IsCountryAll) {
                        search1 = {};
                    }
                    if (CountryList.length == 3 && CountryList == "All") {
                        search1 = {};
                    }
                }
            }
            checkcountry(0);
        } else {
            var obj = new Object();
            obj['country'] = {
                $like: null
            }
            search1['$or'].push(obj);
        }
    } else {
        flg = false;
    }

    search['$and'] = [];
    var obj = new Object();
    obj['createddate'] = {
        $gte: StartDate,
        $lte: EndDate
    }

    search['$and'].push(obj);

    search1['$and'] = [];
    search1['$and'].push(search);

    User.hasMany(Bike, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });
    if (IsSuperAdmin == 'false' || IsSuperAdmin == false && flg == true) {
        User.findAll({
            include: [{
                model: Bike,
                where: models.sequelize.and({
                    'IsDeleted': 0,
                    deviceid: {
                        $ne: ''
                    }
                }),
            }],
            // where: {
            //     $and: {
            //         createddate: {
            //             $gte: StartDate,
            //             $lte: EndDate
            //         },
            //     },
            //     country:CountryName
            // },
            where: search1,
            attributes: [
                [models.sequelize.fn('day', models.sequelize.col('tbluserinformation.createddate')), 'day'],
                [models.sequelize.fn('month', models.sequelize.col('tbluserinformation.createddate')), 'month'],
                [models.sequelize.fn('year', models.sequelize.col('tbluserinformation.createddate')), 'year']
            ],
            // group: ['year', 'month', 'day'],
            order: ['year', 'month', 'day'],
        }).then(function(resUser) {
            res.json({
                success: true,
                UserData: resUser
            });
        })
    } else {
        User.findAll({
            include: [{
                model: Bike,
                where: models.sequelize.and({
                    'IsDeleted': 0,
                    deviceid: {
                        $ne: ''
                    }
                }),
            }],
            // where: {
            //     $and: {
            //         createddate: {
            //             $gte: StartDate,
            //             $lte: EndDate
            //         }
            //     },
            // },
            attributes: [
                [models.sequelize.fn('day', models.sequelize.col('tbluserinformation.createddate')), 'day'],
                [models.sequelize.fn('month', models.sequelize.col('tbluserinformation.createddate')), 'month'],
                [models.sequelize.fn('year', models.sequelize.col('tbluserinformation.createddate')), 'year'], 'country', 'Type'
            ],
            // group: ['year', 'month', 'day'],
            order: ['year', 'month', 'day'],
        }).then(function(resUser) {
            res.json({
                success: true,
                UserData: resUser
            });
        })
    }

})

module.exports = router