//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var GPSDevice = models.tblgpsdevice;
var Country = models.tblcountrymgmt;

//End of Tables

// function convertdateformat(date1, flg) {
//     var date = new Date(date1);
//     var firstdayMonth = date.getMonth() + 1;
//     var firstdayDay = date.getDate();
//     var firstdayYear = date.getFullYear();
//     var firstdayHours = date.getHours();
//     var firstdayMinutes = date.getMinutes();
//     var firstdaySeconds = date.getSeconds();
//     // return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
//     // return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2)+(firstdayHours.toString())+(firstdayMinutes.toString())+(firstdaySeconds.toString());
//     if (flg == 1) {
//         return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + (firstdayHours.toString()) + ":" + (firstdayMinutes.toString()) + ":" + (firstdaySeconds.toString());

//     } else {
//         return ("0000" + firstdayDay.toString()).slice(-2) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayYear.toString()).slice(-4);
//     }
// }
function convertdateformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    if (flg == 1) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "23:59:59";

    } else if (flg == 2) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
    } else if (flg == 3) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
    } else {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}
Date.prototype.addDays = function (days) {
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
//     connectionDashboard.query(query, function(err, rows, fields) {
//         if (!err) {
//             res.json({ success: true, data: rows });
//         } else {
//             res.json({ success: false, data: [] });
//         }
//     })

// })

router.get('/GetAllWorkingBike', function (req, res) {
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
    connectionDashboard.query(query, function (err, rows, fields) {
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

                    client.get(rows[i].DeviceId, function (err, strgpsdata) {
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

var IsDashboardTakingLoad = false;
router.get('/GetAllWorkingBikeNew', function (req, res) {
    var search = '';
    var search1 = '';
    var systemStarttime = new Date();
    if (req.query.AppName != null && req.query.AppName != undefined && req.query.AppName != '' && req.query.AppName != 'All') {
        // search = " and idApp=" + req.query.idApp;
        search1 = " where  tgd.AppName='" + req.query.AppName + "'";
    }
    var query = "select tb.id,tb.Name,tb.IsOnline,tgd.AppName,tgd.DeviceId as deviceid " +
        "from tblgpsdevice tgd " +
        "left join tblvehicle tb on tb.deviceid=tgd.DeviceId and tb.IsDelete=false " + search1;

    //  var query ="SELECT tb.id,tb.deviceid,tb.Name,tb.IsOnline, tpg.IsEngine, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Date, tpg.Speed,tpg.Direction, tu.idApp FROM tblvehicle tb Left Join tbluserinformation as tu on tb.iduser = tu.id Left JOIN tblgpsdata tpg INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date ON tb.deviceid=tpg.DeviceId WHERE IsDelete=false and idApp=" + req.query.idApp + " group by tb.DeviceId"
    connectionDashboard.query(query, function (err, rows, fields) {
        if (!err) {
            // res.json({ success: true, data: rows });
            var systemEndtime = new Date();

            var timediffernce = parseInt((systemEndtime - systemStarttime) / 1000);

            if (timediffernce >= 5) {
                if (IsDashboardTakingLoad == false) {
                    IsDashboardTakingLoad = true;

                    var mail = {
                        from: 'noreply@maark.my',
                        // to: 'pmt@bugzstudio.com',
                        to: 'soham.patel@bugzstudio.com;dhaval.bhanderi@bugzstudio.com',
                        subject: 'Maark API taking Load. Please check',
                        text: 'Maark API taking Load; load time = ' + timediffernce + ' sec. Please check'
                    };
                    transporter.sendMail(mail, function (error, response) {
                        if (error) {
                            console.log("Maark API taking Load Email (Error). ===== ", error);
                        } else {
                            console.log("Maark API taking Load Email Send Successfully.===== ");
                        }
                    });

                }
            } else {
                IsDashboardTakingLoad = false;
            }

            var lstAllVehicle = [];

            function getData(i) {

                if (i < rows.length) {
                    var obj = new Object();
                    obj.id = rows[i].id;
                    obj.Name = rows[i].Name;
                    obj.deviceid = rows[i].deviceid;
                    obj.IsOnline = rows[i].IsOnline;
                    obj.AppName = rows[i].AppName;

                    client.get(rows[i].deviceid, function (err, strgpsdata) {
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

router.get('/GetAllDeviceForDashboard', jsonParser, function (req, res) {
    connectionDashboard.query("SELECT tv.id,tv.deviceid,tv.Name,tv.IsOnline,  tu.idApp, b.IsEngine, b.Latitude, b.Longitude, b.Datetime, b.Speed, b.Direction, b.Date FROM tblvehicle as tv left join tbluserinformation as tu ON tv.iduser = tu.id left JOIN (SELECT DeviceId, IsEngine, Latitude, Longitude, Datetime, Speed, Direction, MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tv.DeviceId = b.DeviceId where tv.IsDelete = false and tu.idApp = " + req.query.idApp, function (err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

router.get('/GetTotalCustomerByCountry', function (req, res) {
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
    }).then(function (resUser) {
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

router.get('/GetGraphData', function (req, res) {

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
    }).then(function (resUser) {
        res.json({
            success: true,
            UserData: resUser
        });
    })


})

router.get('/GetDashboardData', function (req, res) {

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

    User.count({ where: search }).then(function (TotalUser) {
        lstDashboard['TotalUser'] = TotalUser;
        res.json(lstDashboard);
    })

})

router.get('/GetTotalCustomer', function (req, res) {
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
    }).then(function (response) {
        res.json(response);
    })
})

router.get('/GetBikeTotalDevice', function (req, res) {

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
    }).then(function (respetdevice) {

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
        }).then(function (respet) {
            var bal_device = respetdevice - respet.count;
            res.json({ DeviceStatus: respet.rows, BalanceDevice: bal_device });
        })
    })

})

router.get('/GetGraphCustomer', function (req, res) {
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
    }).then(function (resUser) {
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

router.get('/SalesDashBoardData', function (req, res) {
    var IdUser = req.query.IdUser;
    var AppName = req.query.AppName;
    var objData = {
        TotalDevice: 0,
        TotalAttachedDevice: 0,
        TotalExpiredDevice: 0,
        TotalUnusedDevice: 0,
    }
    var WhereCondition = "";
    if (IdUser != null && IdUser != undefined && IdUser != "") {
        WhereCondition = " WHERE (tg.idSalesAgent=" + IdUser + " OR tad.agentId=" + IdUser + ")";
    }
    if (AppName != null && AppName != undefined && AppName != "") {
        WhereCondition += " and tg.AppName='" + AppName + "'";
    }
    var query = " SELECT *,NOW()>CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') As ExpiredDevice " +
        " FROM tblgpsdevice tg" +
        " LEFT JOIN tbldeviceagentretailer tad ON tad.deviceId = tg.DeviceId" +
        " LEFT JOIN tbllicencemanager tl ON tl.DeviceId = tg.DeviceId " + WhereCondition;
    console.log(query)
    connectionDashboard.query(query, function (err, rows, fields) {
        console.log(err)
        if (!err) {
            objData.TotalDevice = rows.length;
            var TotalAttachedDevice = u.filter(rows, function (o) { if (o.LicenceNo != null) { return o } });
            objData.TotalAttachedDevice = TotalAttachedDevice != undefined ? TotalAttachedDevice.length : objData.TotalAttachedDevice;

            var TotalExpiredDevice = u.filter(rows, { ExpiredDevice: 1 });
            objData.TotalExpiredDevice = TotalExpiredDevice != undefined ? TotalExpiredDevice.length : objData.TotalExpiredDevice;

            var TotalUnusedDevice = u.filter(rows, { LicenceNo: null });
            objData.TotalUnusedDevice = TotalUnusedDevice != undefined ? TotalUnusedDevice.length : objData.TotalUnusedDevice;

            res.json({ success: true, data: objData });
        } else {
            res.json({ success: false, data: objData });
        }
    })
})

router.get('/getAllExpiredDevice', function (req, res) {
    // router.get('/GetAllRenewData', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != null && objSearch != '') {
        search += ' and (tl.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tl.ExpiryDate like "%' + objSearch + '%" or ';
        search = search + 'tu.email like "%' + objSearch + '%" or ';
        search = search + 'tu.phone like "%' + objSearch + '%" or ';
        search = search + 'ta.AppName like "%' + objSearch + '%" or ';
        search = search + 'tl.LicenceType like "%' + objSearch + '%" or ';
        search = search + 'tl.LicenceRenewalType like "%' + objSearch + '%" or ';
        search = search + 'ts.Status like "%' + objSearch + '%" or ';
        search = search + 'tv.Name like "%' + objSearch + '%") ';
    };

    if (req.query.StartDate != '' && req.query.EndDate != '') {
        if (search == '') {
            search += " AND tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
        } else {
            search += search + " AND   tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
        }
    } else if (req.query.StartDate != null && req.query.StartDate != '' && req.query.StartDate != undefined) {
        if (search == '') {
            search += " AND  tl.ExpiryDate >= '" + convertdateformat(req.query.StartDate, 3) + "'";
        } else {
            search += " AND tl.ExpiryDate >= '" + convertdateformat(req.query.StartDate, 3) + "'";
        }
    } else if (req.query.EndDate != null && req.query.EndDate != '' && req.query.EndDate != undefined) {
        if (search == '') {
            search += " AND tl.ExpiryDate <= '" + convertdateformat(req.query.EndDate, 3) + "'";
        } else {
            search += " AND tl.ExpiryDate <= '" + convertdateformat(req.query.EndDate, 3) + "'";
        }
    }

    if (req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != '') {
        search += " and ta.Id=" + req.query.idApp + " ";
    }
    if (objParam.idDistributor != null && objParam.idDistributor != '' && objParam.idDistributor != undefined) {
        search += ' and dar.idDistributor = ' + objParam.idDistributor;
    }
    if (objParam.idCountry != null && objParam.idCountry != '' && objParam.idCountry != undefined) {
        search += ' and tblgpsdevice.CountryId = ' + objParam.idCountry;
    }
    if (objParam.idSalesAgent != null && objParam.idSalesAgent != '' && objParam.idSalesAgent != undefined) {
        search += ' and (tblgpsdevice.idSalesAgent = ' + objParam.idSalesAgent + ' or dar.agentId=' + objParam.idSalesAgent + ')';
    }
    var query = "SELECT ts.Status,tl.Id, tu.email,CONVERT_TZ(tu.LastLogin,'+00:00','" + CurrentOffset + "') as LastLoginDate ,tl.DeviceId,tv.iduser,tu.phone,tv.Name as VehicleName,ta.Id as idApp,ta.AppName,tl.LicenceRenewalType,tl.LicenceType,ta.LicenceRenewalType as appLicenceRenewalType,ta.LicenceType as appLicenceType, " +
        "CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate,tblgpsdevice.Status as DeviceStatus " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " INNER JOIN (Select * from tblvehicle where IsDelete=0) tv on tv.deviceid =tl.DeviceId " +
        " INNER JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
        " LEFT JOIN tbldeviceagentretailer AS dar ON  dar.deviceId = tv.deviceid " +
        " LEFT JOIN tblgpsdevice ON tblgpsdevice.DeviceId = tv.deviceid " +
        " LEFT JOIN tblsimdetails AS ts ON  ts.id = tblgpsdevice.idSim " +
        " where tl.IsDeleted=0  " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var countquery = "SELECT count(*) as TotalRecord " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " INNER JOIN (Select * from tblvehicle where IsDelete=0)  tv on tv.deviceid =tl.DeviceId " +
        " INNER JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
        " LEFT JOIN tbldeviceagentretailer AS dar ON  dar.deviceId = tv.deviceid " +
        " LEFT JOIN tblgpsdevice ON tblgpsdevice.DeviceId = tv.deviceid " +
        " LEFT JOIN tblsimdetails AS ts ON  ts.id = tblgpsdevice.idSim " +
        " where tl.IsDeleted=0 " + search;

    connection.query(query, function (err, response) {
        if (response != undefined) {
            connection.query(countquery, function (err, lstCount, fields) {
                var lstAllVehicle = [];
                function getData(i) {
                    if (i < response.length) {
                        var obj = new Object();
                        obj.Id = response[i].Id;
                        obj.email = response[i].email;
                        obj.LastLoginDate = response[i].LastLoginDate;
                        obj.DeviceId = response[i].DeviceId;
                        obj.iduser = response[i].iduser;
                        obj.phone = response[i].phone;
                        obj.VehicleName = response[i].VehicleName;
                        obj.idApp = response[i].idApp;
                        obj.AppName = response[i].AppName;
                        obj.LicenceRenewalType = response[i].LicenceRenewalType;
                        obj.LicenceType = response[i].LicenceType;
                        obj.appLicenceRenewalType = response[i].appLicenceRenewalType;
                        obj.appLicenceType = response[i].appLicenceType;
                        obj.ExpiryDate = response[i].ExpiryDate;
                        obj.Status = response[i].Status;
                        obj.DeviceStatus = response[i].DeviceStatus;
                        client.get(response[i].DeviceId, function (err, strgpsdata) {
                            if (!err) {
                                if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                    var objgps = JSON.parse(strgpsdata);
                                    obj.GpsDate = objgps.Date;
                                } else {
                                    obj.GpsDate = null;
                                }
                            } else {
                                obj.GpsDate = null;
                            }
                            lstAllVehicle.push(obj);
                            getData(i + 1);
                        });
                    }
                    else {
                        var response1 = new Object();
                        response1.draw = objParam.draw;
                        response1.recordsTotal = lstCount[0].TotalRecord;
                        response1.recordsFiltered = lstCount[0].TotalRecord;
                        response1.data = lstAllVehicle;
                        res.json(response1);
                    }
                }
                getData(0);
            });
        } else {
            console.log(err);
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = 0;
            response1.recordsFiltered = 0;
            response1.data = [];
            res.json(response1);
        }
    })
})


router.get('/getAllExpiredSoonDevice', function (req, res) {

    // router.get('/GetAllRenewData', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != null && objSearch != '') {
        search += ' and (tl.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tl.ExpiryDate like "%' + objSearch + '%" or ';
        search = search + 'tu.email like "%' + objSearch + '%" or ';
        search = search + 'tu.phone like "%' + objSearch + '%" or ';
        search = search + 'ta.AppName like "%' + objSearch + '%" or ';
        search = search + 'tl.LicenceType like "%' + objSearch + '%" or ';
        search = search + 'tl.LicenceRenewalType like "%' + objSearch + '%" or ';
        search = search + 'ts.Status like "%' + objSearch + '%" or ';
        search = search + 'tv.Name like "%' + objSearch + '%") ';
    };

    if (req.query.StartDate != '' && req.query.EndDate != '') {
        if (search == '') {
            search += " AND tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
        } else {
            search += search + " AND   tl.ExpiryDate between  '" + convertdateformat(req.query.StartDate, 3) + "' AND '" + convertdateformat(req.query.EndDate, 3) + "'";
        }
    } else if (req.query.StartDate != null && req.query.StartDate != '' && req.query.StartDate != undefined) {
        if (search == '') {
            search += " AND  tl.ExpiryDate >= '" + convertdateformat(req.query.StartDate, 3) + "'";
        } else {
            search += " AND tl.ExpiryDate >= '" + convertdateformat(req.query.StartDate, 3) + "'";
        }
    } else if (req.query.EndDate != null && req.query.EndDate != '' && req.query.EndDate != undefined) {
        if (search == '') {
            search += " AND tl.ExpiryDate <= '" + convertdateformat(req.query.EndDate, 3) + "'";
        } else {
            search += " AND tl.ExpiryDate <= '" + convertdateformat(req.query.EndDate, 3) + "'";
        }
    }

    if (req.query.idApp != null && req.query.idApp != undefined && req.query.idApp != '') {
        search += " and ta.Id=" + req.query.idApp + " ";
    }
    if (objParam.idDistributor != null && objParam.idDistributor != '' && objParam.idDistributor != undefined) {
        search += ' and dar.idDistributor = ' + objParam.idDistributor;
    }
    if (objParam.idCountry != null && objParam.idCountry != '' && objParam.idCountry != undefined) {
        search += ' and tblgpsdevice.CountryId = ' + objParam.idCountry;
    }
    if (objParam.idSalesAgent != null && objParam.idSalesAgent != '' && objParam.idSalesAgent != undefined) {
        search += ' and (tblgpsdevice.idSalesAgent = ' + objParam.idSalesAgent + ' or dar.agentId=' + objParam.idSalesAgent + ')';
    }
    var query = "SELECT ts.Status,tl.Id, tu.email,CONVERT_TZ(tu.LastLogin,'+00:00','" + CurrentOffset + "') as LastLoginDate ,tl.DeviceId,tv.iduser,tu.phone,tv.Name as VehicleName,ta.Id as idApp,ta.AppName,tl.LicenceRenewalType,tl.LicenceType,ta.LicenceRenewalType as appLicenceRenewalType,ta.LicenceType as appLicenceType, " +
        "CONVERT_TZ(tl.ExpiryDate,'+00:00','" + CurrentOffset + "') as ExpiryDate " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " INNER JOIN (Select * from tblvehicle where IsDelete=0) tv on tv.deviceid =tl.DeviceId " +
        " INNER JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
        " LEFT JOIN tbldeviceagentretailer AS dar ON  dar.deviceId = tv.deviceid " +
        " LEFT JOIN tblgpsdevice ON tblgpsdevice.DeviceId = tv.deviceid " +
        " LEFT JOIN tblsimdetails AS ts ON  ts.id = tblgpsdevice.idSim " +
        " where tl.IsDeleted=0  " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var countquery = "SELECT count(*) as TotalRecord " +
        " from tbllicencemanager as tl " +
        " LEFT JOIN tblappinfo as ta ON ta.Id= tl.idApp" +
        " INNER JOIN (Select * from tblvehicle where IsDelete=0)  tv on tv.deviceid =tl.DeviceId " +
        " INNER JOIN tbluserinformation as tu ON tv.iduser = tu.id " +
        " LEFT JOIN tbldeviceagentretailer AS dar ON  dar.deviceId = tv.deviceid " +
        " LEFT JOIN tblgpsdevice ON tblgpsdevice.DeviceId = tv.deviceid " +
        " LEFT JOIN tblsimdetails AS ts ON  ts.id = tblgpsdevice.idSim " +
        " where tl.IsDeleted=0 " + search;

    connection.query(query, function (err, response) {
        if (response != undefined) {
            connection.query(countquery, function (err, lstCount, fields) {
                var lstAllVehicle = [];
                function getData(i) {
                    if (i < response.length) {
                        var obj = new Object();
                        obj.Id = response[i].Id;
                        obj.email = response[i].email;
                        obj.LastLoginDate = response[i].LastLoginDate;
                        obj.DeviceId = response[i].DeviceId;
                        obj.iduser = response[i].iduser;
                        obj.phone = response[i].phone;
                        obj.VehicleName = response[i].VehicleName;
                        obj.idApp = response[i].idApp;
                        obj.AppName = response[i].AppName;
                        obj.LicenceRenewalType = response[i].LicenceRenewalType;
                        obj.LicenceType = response[i].LicenceType;
                        obj.appLicenceRenewalType = response[i].appLicenceRenewalType;
                        obj.appLicenceType = response[i].appLicenceType;
                        obj.ExpiryDate = response[i].ExpiryDate;
                        obj.Status = response[i].Status;
                        client.get(response[i].DeviceId, function (err, strgpsdata) {
                            if (!err) {
                                if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                    var objgps = JSON.parse(strgpsdata);
                                    obj.GpsDate = objgps.Date;
                                } else {
                                    obj.GpsDate = null;
                                }
                            } else {
                                obj.GpsDate = null;
                            }
                            lstAllVehicle.push(obj);
                            getData(i + 1);
                        });
                    }
                    else {
                        var response1 = new Object();
                        response1.draw = objParam.draw;
                        response1.recordsTotal = lstCount[0].TotalRecord;
                        response1.recordsFiltered = lstCount[0].TotalRecord;
                        response1.data = lstAllVehicle;
                        res.json(response1);
                    }
                }
                getData(0);
            });
        } else {
            console.log(err);
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = 0;
            response1.recordsFiltered = 0;
            response1.data = [];
            res.json(response1);
        }
    })
})

router.get('/GetVehicleExpireDetailsByDeviceID', function (req, res) {

    var query = "SELECT tv.id,tv.Name,tv.deviceid,tv.renewaldate,tl.LicenceRenewalType,tl.LicenceType,tl.id as LicenceId,tl.LicenceNo " +
        "FROM tblvehicle tv " +
        "left join tbllicencemanager tl on tv.deviceid=tl.DeviceId and tl.IsDeleted=false " +
        "where tv.deviceid='" + req.query.deviceid + "'and tv.IsDelete=false;";
    connection.query(query, function (err, rows, fields) {
        if (!err) {
            var lstAllVehicle = [];
            function getData(i) {
                if (i < rows.length) {
                    var obj = new Object();
                    obj.id = rows[i].id;
                    obj.Name = rows[i].Name;
                    obj.deviceid = rows[i].deviceid;
                    obj.renewaldate = rows[i].renewaldate;
                    obj.LicenceRenewalType = rows[i].LicenceRenewalType;
                    obj.LicenceType = rows[i].LicenceType;
                    obj.LicenceId = rows[i].LicenceId;
                    obj.LicenceNo = rows[i].LicenceNo;

                    client.get(rows[i].deviceid, function (err, strgpsdata) {
                        if (!err) {
                            if (strgpsdata != null & strgpsdata != '' && strgpsdata != undefined) {
                                var objgps = JSON.parse(strgpsdata);
                                obj.GpsDate = objgps.Date;
                            } else {
                                obj.GpsDate = null;
                            }
                        } else {
                            obj.GpsDate = null;
                        }
                        lstAllVehicle.push(obj);
                        getData(i + 1);
                    });
                }
                else {
                    res.json(lstAllVehicle);
                }
            }
            getData(0);
        } else {
            res.json([]);
        }
    })
})
module.exports = router