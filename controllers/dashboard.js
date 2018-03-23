//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var GPSDevice = models.tblgpsdevice;
var Country = models.tblcountrymgmt;

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
// router.get('/GetAllWorkingBike', jsonParser, function(req, res) {
//     var search = '';
//     var search1 = '';
//     if (req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != '' && req.query.idApp != 'All') {
//         search = " and idApp=" + req.query.idApp;
//         search1 = " where  ta.id=" + req.query.idApp;
//     }
//     var query = "select ve.*,tgd.AppName,tgd.DeviceId from " +
//         "(SELECT tb.id,tb.deviceid,tb.Name,tb.IsOnline, tpg.IsEngine, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed,tpg.Direction, tu.idApp " +
//         "FROM tblvehicle tb Left Join tbluserinformation as tu on tb.iduser = tu.id Left JOIN tblgpsdata tpg " +
//         "INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date ON tb.deviceid=tpg.DeviceId " +
//         "WHERE IsDelete=false " + search + " group by tb.DeviceId ) as ve " +
//         "RIGHT  join tblgpsdevice tgd on ve.deviceid = tgd.DeviceId " +
//         "left join tblappinfo ta on ta.AppName = tgd.AppName " + search1;
//     //  var query ="SELECT tb.id,tb.deviceid,tb.Name,tb.IsOnline, tpg.IsEngine, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed,tpg.Direction, tu.idApp FROM tblvehicle tb Left Join tbluserinformation as tu on tb.iduser = tu.id Left JOIN tblgpsdata tpg INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date ON tb.deviceid=tpg.DeviceId WHERE IsDelete=false and idApp=" + req.query.idApp + " group by tb.DeviceId"
//     connection.query(query, function(err, rows, fields) {
//         if (!err) {
//             res.json({ success: true, data: rows });
//         } else {
//             res.json({ success: false, data: [] });
//         }
//     })

// })

router.get('/GetAllWorkingBike', function(req, res) {
    var search = '';
    var search1 = '';
    if (req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != '' && req.query.idApp != 'All') {
        // search = " and idApp=" + req.query.idApp;
        search1 = " where  ta.id=" + req.query.idApp;
    }
    var query = "select ve.*,tgd.AppName,tgd.DeviceId from " +
        "(SELECT tb.id,tb.deviceid,tb.Name,tb.IsOnline " +
        "FROM tblvehicle tb  " +
        "WHERE IsDelete=false " +
        ") as ve " +
        "RIGHT  join tblgpsdevice tgd on ve.deviceid = tgd.DeviceId  " +
        "left join tblappinfo ta on ta.AppName = tgd.AppName " + search1;
    //  var query ="SELECT tb.id,tb.deviceid,tb.Name,tb.IsOnline, tpg.IsEngine, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed,tpg.Direction, tu.idApp FROM tblvehicle tb Left Join tbluserinformation as tu on tb.iduser = tu.id Left JOIN tblgpsdata tpg INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date ON tb.deviceid=tpg.DeviceId WHERE IsDelete=false and idApp=" + req.query.idApp + " group by tb.DeviceId"
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            // res.json({ success: true, data: rows });

            var lstAllVehicle = [];

            function getData(i) {

                if (i < rows.length) {
                    var obj = new Object();
                    obj.id = rows[i].id;
                    obj.Name = rows[i].Name;
                    obj.deviceid = rows[i].DeviceId;
                    obj.IsOnline = rows[i].IsOnline;
                    obj.AppName = rows[i].AppName;

                    client.get(rows[i].DeviceId, function(err, strgpsdata) {
                        if (!err) {
                            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                var objgps = JSON.parse(strgpsdata);
                                obj.IsEngine = objgps.IsEngine;
                                obj.Latitude = objgps.Latitude;
                                obj.Longitude = objgps.Longitude;
                                obj.Datetime = objgps.Datetime;
                                obj.Date = objgps.Date;
                                obj.Speed = objgps.Speed;
                                obj.Direction = objgps.Direction;
                                obj.OdoMeter = objgps.OdoMeter;
                                lstAllVehicle.push(obj);
                                getData(i + 1);
                            } else {
                                obj.IsEngine = null;
                                obj.Latitude = null;
                                obj.Longitude = null;
                                obj.Datetime = null;
                                obj.Date = null;
                                obj.Speed = null;
                                obj.Direction = null;
                                obj.OdoMeter = null;
                                lstAllVehicle.push(obj);
                                getData(i + 1);
                            }
                        } else {
                            obj.IsEngine = null;
                            obj.Latitude = null;
                            obj.Longitude = null;
                            obj.Datetime = null;
                            obj.Date = null;
                            obj.Speed = null;
                            obj.Direction = null;
                            obj.OdoMeter = null;
                            lstAllVehicle.push(obj);
                            getData(i + 1);
                        }
                    });

                } else {
                    res.json({ success: true, data: lstAllVehicle });
                }
            }
            getData(0);
        } else {
            res.json({ success: false, data: [] });
        }
    })

})

router.get('/GetAllWorkingBikeNew', function(req, res) {
    var search = '';
    var search1 = '';
    if (req.query.AppName != null && req.query.AppName != undefined && req.query.AppName != '' && req.query.AppName != 'All') {
        // search = " and idApp=" + req.query.idApp;
        search1 = " where  tgd.AppName='" + req.query.AppName + "'";
    }
    var query = "select tb.id,tb.Name,tb.IsOnline,tgd.AppName,tgd.DeviceId as deviceid " +
        "from tblgpsdevice tgd " +
        "left join tblvehicle tb on tb.deviceid=tgd.DeviceId and tb.IsDelete=false " + search1;

    //  var query ="SELECT tb.id,tb.deviceid,tb.Name,tb.IsOnline, tpg.IsEngine, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed,tpg.Direction, tu.idApp FROM tblvehicle tb Left Join tbluserinformation as tu on tb.iduser = tu.id Left JOIN tblgpsdata tpg INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date ON tb.deviceid=tpg.DeviceId WHERE IsDelete=false and idApp=" + req.query.idApp + " group by tb.DeviceId"
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            // res.json({ success: true, data: rows });

            var lstAllVehicle = [];

            function getData(i) {

                if (i < rows.length) {
                    var obj = new Object();
                    obj.id = rows[i].id;
                    obj.Name = rows[i].Name;
                    obj.deviceid = rows[i].deviceid;
                    obj.IsOnline = rows[i].IsOnline;
                    obj.AppName = rows[i].AppName;

                    client.get(rows[i].deviceid, function(err, strgpsdata) {
                        if (!err) {
                            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                var objgps = JSON.parse(strgpsdata);
                                obj.IsEngine = objgps.IsEngine;
                                obj.Latitude = objgps.Latitude;
                                obj.Longitude = objgps.Longitude;
                                obj.Datetime = objgps.Datetime;
                                obj.Date = objgps.Date;
                                obj.Speed = objgps.Speed;
                                obj.Direction = objgps.Direction;
                                obj.OdoMeter = objgps.OdoMeter;
                                lstAllVehicle.push(obj);
                                getData(i + 1);
                            } else {
                                obj.IsEngine = null;
                                obj.Latitude = null;
                                obj.Longitude = null;
                                obj.Datetime = null;
                                obj.Date = null;
                                obj.Speed = null;
                                obj.Direction = null;
                                obj.OdoMeter = null;
                                lstAllVehicle.push(obj);
                                getData(i + 1);
                            }
                        } else {
                            obj.IsEngine = null;
                            obj.Latitude = null;
                            obj.Longitude = null;
                            obj.Datetime = null;
                            obj.Date = null;
                            obj.Speed = null;
                            obj.Direction = null;
                            obj.OdoMeter = null;
                            lstAllVehicle.push(obj);
                            getData(i + 1);
                        }
                    });

                } else {
                    res.json({ success: true, data: lstAllVehicle });
                }
            }
            getData(0);
        } else {
            res.json({ success: false, data: [] });
        }
    })

})

router.get('/GetAllDeviceForDashboard', jsonParser, function(req, res) {
    connection.query("SELECT tv.id,tv.deviceid,tv.Name,tv.IsOnline,  tu.idApp, b.IsEngine, b.Latitude, b.Longitude, b.Datetime, b.Speed, b.Direction, b.Date FROM tblvehicle as tv left join tbluserinformation as tu ON tv.iduser = tu.id left JOIN (SELECT DeviceId, IsEngine, Latitude, Longitude, Datetime, Speed, Direction, MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tv.DeviceId = b.DeviceId where tv.IsDelete = false and tu.idApp = " + req.query.idApp, function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

router.get('/GetTotalCustomerByCountry', function(req, res) {
    Vehicle.belongsTo(User, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });
    var search = {}
    if (req.query.idApp != '' && req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != 'All') {
        search['$and'] = [];
        var obj = new Object();
        obj['idApp'] = {
            $eq: req.query.idApp
        };
        search['$and'].push(obj);
    }
    Vehicle.findAll({
        attributes: [
            'deviceid', 'Name'
        ],
        where: {
            IsDelete: '0',
            deviceid: {
                $ne: ''
            }
        },
        include: [{
            model: User,
            attributes: [
                [models.Sequelize.literal('COUNT(DISTINCT(iduser))'), 'Total'],
                'country', 'Type', 'idApp'
            ],
            where: search,
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

    // var CountryName = req.query.countryName;

    // var CountryList = req.query.CountryList;
    // if (CountryList == null || CountryList == "" || CountryList == undefined) {
    //     CountryList = [];
    // }
    // var IsSuperAdmin = req.query.IsSuperAdmin;
    // if (IsSuperAdmin == null || IsSuperAdmin == "" || IsSuperAdmin == undefined) {
    //     IsSuperAdmin = false;
    // }
    // var IsCountryAll = false;

    // var search1 = {};
    // //var flg = false;

    // var flg = true;


    // search1['$and'] = [];
    // var obj = new Object();
    // obj['idApp'] = {
    //     $eq: req.query.idApp
    // }
    // search1['$and'].push(obj);

    // if (IsSuperAdmin == 'false' || IsSuperAdmin == false) {
    //     if (CountryList.length > 0) {
    //         search1['$or'] = [];

    //         function checkcountry(z) {
    //             if (z < CountryList.length) {
    //                 if (CountryList[z] == "All") {
    //                     IsCountryAll = true;
    //                     flg = false;
    //                     checkcountry(CountryList.length);
    //                 } else {
    //                     var obj = new Object();

    //                     obj['country'] = {
    //                         $like: '%' + CountryList[z] + '%'
    //                     }
    //                     search1['$or'].push(obj);
    //                     checkcountry(z + 1);
    //                 }
    //             } else {

    //                 if (IsCountryAll) {
    //                     search1 = {};
    //                 }
    //                 if (CountryList.length == 3 && CountryList == "All") {
    //                     search1 = {};
    //                 }
    //             }
    //         }
    //         checkcountry(0);
    //     }
    //     // else {
    //     //     var obj = new Object();
    //     //     obj['country'] = {
    //     //         $like: null
    //     //     }
    //     //     search1['$or'].push(obj);
    //     // }
    // } else {
    //     flg = false;
    // }
    var search = {}
    if (req.query.idApp != '' && req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != 'All') {
        search['$and'] = [];
        var obj = new Object();
        obj['idApp'] = {
            $eq: req.query.idApp
        };
        search['$and'].push(obj);
    }
    User.findAll({
        // where: { country: CountryName },
        where: search,
        attributes: [
            'country', [models.sequelize.fn('count', 'id'), 'Total'],
            [models.sequelize.fn('day', models.sequelize.col('createddate')), 'day'],
            [models.sequelize.fn('month', models.sequelize.col('createddate')), 'month'],
            [models.sequelize.fn('year', models.sequelize.col('createddate')), 'year'],
            'idApp'
        ],
        group: [models.sequelize.fn('day', models.sequelize.col('createddate')), models.sequelize.fn('month', models.sequelize.col('createddate')), models.sequelize.fn('year', models.sequelize.col('createddate'))],
        order: ['year', 'month', 'day']
    }).then(function(resUser) {
        res.json({
            success: true,
            UserData: resUser
        });
    })


})

router.get('/GetDashboardData', function(req, res) {

    // var CountryName = req.query.countryName;
    // var CountryList = req.query.CountryList;
    // if (CountryList == null || CountryList == "" || CountryList == undefined) {
    //     CountryList = [];
    // }
    // var IsSuperAdmin = req.query.IsSuperAdmin;
    // if (IsSuperAdmin == null || IsSuperAdmin == "" || IsSuperAdmin == undefined) {
    //     IsSuperAdmin = false;
    // }
    // var IsCountryAll = false;

    // var currentDate = new Date();
    // var StartDate = convertdateformat(currentDate, 3);
    // var EndDate = convertdateformat(currentDate, 3);

    // //var Last7days = currentDate.addDays(-7);
    // var LastWeek1 = convertdateformat(currentDate.addDays(-7), 3);
    // var firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    // var lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    // var firstDayMonth = convertdateformat(firstDay, 3);
    // var lastDayMonth = convertdateformat(lastDay, 3);

    // firstDate = new Date(new Date().getFullYear(), 0, 1);
    // lastDate = new Date(new Date().getFullYear(), 11, 31);

    // var firstDateYear = convertdateformat(firstDate, 3);
    // var lastDateYear = convertdateformat(lastDate, 3);

    // var flg = true;
    var lstDashboard = {};
    var search = {}
    if (req.query.idApp != '' && req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != 'All') {
        search['$and'] = [];
        var obj = new Object();
        obj['idApp'] = {
            $eq: req.query.idApp
        };
        search['$and'].push(obj);
    }

    User.count({ where: search }).then(function(TotalUser) {
        lstDashboard['TotalUser'] = TotalUser;
        res.json(lstDashboard);
    })

})

router.get('/GetTotalCustomer', function(req, res) {
    // var CountryName = req.query.countryName;
    // var IsSuperAdmin = req.query.IsSuperAdmin;
    // var CountryList = req.query.CountryList;
    // if (IsSuperAdmin == null || IsSuperAdmin == undefined || IsSuperAdmin == "") {
    //     IsSuperAdmin = [];
    // }
    // if (CountryList == null || CountryList == undefined || CountryList == "") {
    //     CountryList = [];
    // }
    // var search1 = {};
    // var IsCountryAll = false;
    var search = {}
    if (req.query.idApp != '' && req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != 'All') {
        search['$and'] = [];
        var obj = new Object();
        obj['idApp'] = {
            $eq: req.query.idApp
        };
        search['$and'].push(obj);
    }
    Vehicle.belongsTo(User, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });
    Vehicle.findAll({
        attributes: [
            [models.sequelize.literal('COUNT(DISTINCT(iduser))'), 'Count'],
        ],
        where: {
            IsDelete: 0,
            deviceid: {
                $ne: ''
            }
        },
        include: [{
            model: User,
            attributes: ['id', 'idApp', 'username'],
            where: search
        }]
    }).then(function(response) {
        res.json(response);
    })
})

router.get('/GetBikeTotalDevice', function(req, res) {

    Vehicle.belongsTo(User, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });

    GPSDevice.belongsTo(Country, {
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

    GPSDevice.count({
        where: search,
        include: [{
            model: Country,
            required: flg,
            where: search1,

        }],
    }).then(function(respetdevice) {

        Vehicle.findAndCountAll({
            attributes: ["id", "IsOnline", "DeviceType"],
            where: {
                IsDelete: 0,
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

router.get('/GetGraphCustomer', function(req, res) {
    // var CountryName = req.query.countryName;
    // var StartDate = (new Date()).addDays(-30);
    // var EndDate = new Date();

    // var IsSuperAdmin = req.query.IsSuperAdmin;
    // var CountryList = req.query.CountryList;
    // if (IsSuperAdmin == null || IsSuperAdmin == undefined || IsSuperAdmin == "") {
    //     IsSuperAdmin = [];
    // }
    // if (CountryList == null || CountryList == undefined || CountryList == "") {
    //     CountryList = [];
    // }
    // var search1 = {};
    var search = {};
    // var flg = true;
    // var IsCountryAll = false;
    // if (IsSuperAdmin == 'false' || IsSuperAdmin == false) {
    //     if (CountryList.length > 0) {
    //         search1['$or'] = [];

    //         function checkcountry(z) {
    //             if (z < CountryList.length) {
    //                 if (CountryList[z] == "All") {
    //                     IsCountryAll = true;
    //                     flg = false;
    //                     checkcountry(CountryList.length);
    //                 } else {
    //                     var obj = new Object();

    //                     obj['country'] = {
    //                         $like: '%' + CountryList[z] + '%'
    //                     }
    //                     search1['$or'].push(obj);
    //                     checkcountry(z + 1);
    //                 }
    //             } else {

    //                 if (IsCountryAll) {
    //                     search1 = {};
    //                 }
    //                 if (CountryList.length == 3 && CountryList == "All") {
    //                     search1 = {};
    //                 }
    //             }
    //         }
    //         checkcountry(0);
    //     }
    //     // else {
    //     //     var obj = new Object();
    //     //     obj['country'] = {
    //     //         $like: null
    //     //     }
    //     //     search1['$or'].push(obj);
    //     // }
    // } else {
    //     flg = false;
    // }

    // search['$and'] = [];
    // var obj = new Object();
    // obj['createddate'] = {
    //     $gte: StartDate,
    //     $lte: EndDate
    // }

    // search['$and'].push(obj);
    var search = {}
    if (req.query.idApp != '' && req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != 'All') {
        search['$and'] = [];
        var obj = new Object();
        obj['idApp'] = {
            $eq: req.query.idApp
        };
        search['$and'].push(obj);
    }
    User.hasMany(Vehicle, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });
    // if (IsSuperAdmin == 'false' || IsSuperAdmin == false && flg == true) {
    User.findAll({
        include: [{
            model: Vehicle,
            where: {
                IsDelete: 0,
                deviceid: {
                    $ne: ''
                },
            },
        }],
        where: search,
        attributes: [
            'country', [models.sequelize.fn('day', models.sequelize.col('tbluserinformation.createddate')), 'day'],
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
    });
    // } else {
    //     User.findAll({
    //         include: [{
    //             model: Vehicle,
    //             where: models.sequelize.and({
    //                 'IsDelete': 0,
    //                 deviceid: {
    //                     $ne: ''
    //                 },
    //             }),
    //         }],
    //         where: {
    //             idApp: req.query.idApp
    //         },
    //         attributes: [
    //             [models.sequelize.fn('day', models.sequelize.col('tbluserinformation.createddate')), 'day'],
    //             [models.sequelize.fn('month', models.sequelize.col('tbluserinformation.createddate')), 'month'],
    //             [models.sequelize.fn('year', models.sequelize.col('tbluserinformation.createddate')), 'year'], 'country', 'Type'
    //         ],
    //         // group: ['year', 'month', 'day'],
    //         order: ['year', 'month', 'day'],
    //     }).then(function(resUser) {
    //         res.json({
    //             success: true,
    //             UserData: resUser
    //         });
    //     })
    // }

})

module.exports = router