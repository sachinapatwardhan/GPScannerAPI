var express = require('express'),
    router = express.Router();
//Tables
var User = models.tbluserinformation;
var Bike = models.tblbike;
var Vehicle = models.tblvehicle;
var GPSData = models.tblgpsdata;
var Pet = models.tblpet;
var PetTracking = models.tbldevicetracking;
var Fence = models.tblfence;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var PetGPS = models.tblgpsscanner;
var PetAlarm = models.tblalarm;
var PetDevice = models.tblgpsdevice;
var PetLogs = models.tblpetlogs;
var SOS = models.tblsos;
var Buffer = require('buffer').Buffer;
var momentz = require('moment-timezone');
//End of Tables

app.use(express.static(__dirname + '/../MediaUploads/PetUpload'));


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function SendPushNotification(data, UserId) {
    // var deviceIds = [];

    connection.query("SELECT PushNotificationId,Platform from tblpushnotification where iduser=" + UserId + " group by PushNotificationId, Platform", function(err, response, fields) {
        if (!err && response.length > 0) {
            // PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {
            function SendNotification(i) {
                if (i < response.length) {
                    var deviceIds = [];
                    deviceIds.push(response[i].PushNotificationId)
                        //SendNotification(i + 1);
                        // } else {
                        // console.log(deviceIds)
                    var objData = clone(data);
                    if (response[i].Platform == 'ios') {
                        objData.title = data.message;
                        objData.message = data.title;
                        if (objData.Fence == 'Fence') {
                            PushNotificationSettings.apn.defaultData.sound = 'jinglebellssms.caf';
                        } else {
                            PushNotificationSettings.apn.defaultData.sound = 'default';
                        };
                    };
                    // console.log(response[i].Platform + "_______________________________________________________")
                    // console.log(objData)
                    var objPushNotificationSend = new PushNotifications(PushNotificationSettings);
                    if (deviceIds.length > 0) {

                        objPushNotificationSend.send(deviceIds, objData, function(result) {
                            // console.log(result);
                            SendNotification(i + 1);
                        });
                    } else {
                        SendNotification(i + 1);
                    };
                }
            }
            SendNotification(0)
        }

    })
}

function GetCurrentDate() {
    var today = new Date();

    var sec = today.getUTCSeconds();
    var min = today.getUTCMinutes();
    var hour = today.getUTCHours();

    var year = today.getUTCFullYear();
    var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getUTCDate();

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

router.get('/GetAllPet', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var objSearch = objParam.search.value;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = {};
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


    Pet.belongsTo(User, {
        foreignKey: {
            name: 'iduser',
            allowNull: false
        }
    });

    Pet.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
        include: [{
            model: User,
            required: true
        }]
    }).then(function(response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllBikebyCountry', function(req, res) {

    var model = [];

    var objParam = req.query;
    // console.log("objParam", objParam);
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var objSearch = objParam.search.value;
    var UserCountry = objParam.UserCountry;
    var UserRoles = objParam.UserRoles;
    var CountryList = objParam.CountryList;
    var DeviceType = objParam.DeviceType;
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
                if (columnName != 'id') {
                    search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                }
                // var obj = new Object();
                // obj[columnName] = {
                //     $like: '%' + objSearch + '%'
                // }
                // search['$or'].push(obj);
            };
        };
    }

    search['$and'] = [];

    search['$and'].push({ IsDeleted: false });
    // search['$and'].push({ DeviceType: DeviceType });

    if (DeviceType == 'M2' || DeviceType == null || DeviceType == undefined) {
        var obj = new Object();
        obj['DeviceType'] = {
            $eq: 'M2'
        };
        search['$and'].push(obj);
    } else {
        var obj = new Object();
        obj['DeviceType'] = {
            $ne: 'M2'
        };
        search['$and'].push(obj);
    }

    Bike.belongsTo(User, {
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
                    Bike.findAndCountAll({
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
                        var BikeList = [];
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
                    Bike.findAndCountAll({
                        where: search,
                        order: Orderby,
                        offset: parseInt(objParam.start),
                        limit: parseInt(objParam.length),
                        include: [{
                                model: User,
                                required: true
                            }]
                            // include: model
                    }).then(function(response) {
                        var BikeList = [];
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

router.get('/getAllBikeByUser', function(req, res) {
    Vehicle.findAll({
        where: {
            iduser: req.query.idUser,
            IsDelete: false,
            deviceid: {
                $ne: ''
            }
        },
        order: 'CreatedDate'
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })

})


router.get('/getAllBikeByUserWithOffline', function(req, res) {

    var search = {};
    var objSearch = req.query.objSearch;

    if (objSearch != null && objSearch != '') {
        search['$or'] = [];
        search['$or'].push(['Buyer like ?', "%" + objSearch + "%"]);
        search['$or'].push(['deviceid like ?', "%" + objSearch + "%"]);
        search['$or'].push(['bikeNumber like ?', "%" + objSearch + "%"]);
    }


    search['$and'] = [];

    var obj = new Object();
    obj['iduser'] = {
        $eq: req.query.idUser
    };
    search['$and'].push(obj);

    var obj = new Object();
    obj['IsOnline'] = {
        $eq: false
    };
    search['$and'].push(obj);

    var obj = new Object();
    obj['IsDeleted'] = {
        $eq: false
    };
    search['$and'].push(obj);

    var obj = new Object();
    obj['deviceid'] = {
        $ne: ''
    };
    search['$and'].push(obj);

    if (req.query.Type == 'M2' || req.query.Type == null || req.query.Type == undefined) {
        var obj = new Object();
        obj['DeviceType'] = {
            $eq: 'M2'
        };
        search['$and'].push(obj);
    } else {
        var obj = new Object();
        obj['DeviceType'] = {
            $ne: 'M2'
        };
        search['$and'].push(obj);
    }

    Bike.findAll({
        // where: {
        //     iduser: req.query.idUser,
        //     IsDeleted: false,
        //     deviceid: {
        //         $ne: ''
        //     }
        // },
        where: search,
        order: 'CreatedDate'
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })

})

router.get('/GetAllPetByUser', function(req, res) {

    if (req.query.id != null || req.query.id != undefined) {

        var search = {};

        search['$and'] = [];

        var obj = new Object();
        obj['iduser'] = {
            $eq: req.query.idUser
        };
        search['$and'].push(obj);

        var obj = new Object();
        obj['deviceid'] = {
            $ne: ''
        };
        search['$and'].push(obj);

        var obj = new Object();
        obj['IsDeleted'] = {
            $eq: false
        };
        search['$and'].push(obj);

        if (req.query.DeviceType == 'M2' || req.query.DeviceType == null || req.query.DeviceType == undefined) {
            var obj = new Object();
            obj['DeviceType'] = {
                $eq: 'M2'
            };
            search['$and'].push(obj);
        } else {
            var obj = new Object();
            obj['DeviceType'] = {
                $ne: 'M2'
            };
            search['$and'].push(obj);
        }


        Bike.findAll({
            where: search,
            order: 'CreatedDate'
        }).then(function(response) {
            res.json(response);
        }).catch(function(error) {
            res.json(error);
        })
    } else {
        res.json(RecordNotFound);
    }

})

router.get('/GetAllMobilePetByUser', function(req, res) {
    User.findOne({ where: { username: req.query.username } }).then(function(response) {
        if (response != null) {
            var Today = new Date();
            Pet.findAll({ where: { iduser: response.id, IsDeleted: false }, order: 'CreatedDate' }).then(function(lstPet) {
                var data = new Object();
                var lstPetOnline = [];
                var lstPetRoverDetail = [];
                var lstZ1Detail = [];
                for (var i = 0; i < lstPet.length; i++) {
                    if (lstPet[i].HandshakDatetime != null) {

                        var LastDate = new Date(lstPet[i].HandshakDatetime);
                        var diff = Math.floor(Today.getTime() - LastDate.getTime());
                        var Minute = Math.floor(diff / 60000);

                        if (Minute < 10) {
                            var obj = new Object();
                            obj.DeviceId = lstPet[i].deviceid;
                            obj.Status = true;
                            lstPetOnline.push(obj);
                        } else {
                            var obj = new Object();
                            obj.DeviceId = lstPet[i].deviceid;
                            obj.Status = false;
                            lstPetOnline.push(obj);
                        };

                    } else {
                        var obj = new Object();
                        obj.DeviceId = lstPet[i].deviceid;
                        obj.Status = false;
                        lstPetOnline.push(obj);
                    };
                };

                function PetroverDetail(i) {
                    if (i < lstPet.length) {

                        if (lstPet[i].DeviceType == 'Petrover') {

                            // PetActivity.findAll({
                            //     where: { $and: [{ $or: [{ Status: '01' }, { Status: '10' }] }, { DeviceId: lstPet[i].deviceid }] },
                            // }).then(function(response) {
                            PetActivityNew.findAll({
                                where: { DeviceId: lstPet[i].deviceid },
                            }).then(function(response) {

                                // var counts = u.countBy(response, 'Status');



                                var TotalRun = 0;
                                var TotalWalk = 0;

                                for (var k = 0; k < response.length; k++) {
                                    TotalRun = TotalRun + response[k].TotalRun;
                                    TotalWalk = TotalWalk + response[k].TotalWalk;
                                };
                                // if (counts['10'] != null) {
                                //     TotalRun = parseInt(counts['10']) * 10;
                                // };
                                // if (counts['01'] != null) {
                                //     TotalWalk = parseInt(counts['01']) * 10;
                                // }

                                if (TotalRun > 60) {
                                    TotalRun = Math.round((TotalRun / 60) * 100) / 100;
                                    if (TotalRun > 60) {
                                        TotalRun = Math.round((TotalRun / 60) * 100) / 100;
                                        TotalRun = TotalRun + " hrs";
                                    } else {
                                        TotalRun = TotalRun + " mins";
                                    };

                                } else {
                                    TotalRun = TotalRun + " secs";
                                };

                                if (TotalWalk > 60) {
                                    TotalWalk = Math.round((TotalWalk / 60) * 100) / 100;
                                    if (TotalWalk > 60) {
                                        TotalWalk = Math.round((TotalWalk / 60) * 100) / 100;
                                        TotalWalk = TotalWalk + " hrs";
                                    } else {
                                        TotalWalk = TotalWalk + " mins";
                                    };

                                } else {
                                    TotalWalk = TotalWalk + " secs";
                                };


                                var obj = new Object();
                                obj.DeviceId = lstPet[i].deviceid;
                                obj.TotalRun = TotalRun;
                                obj.TotalWalk = TotalWalk;
                                lstPetRoverDetail.push(obj);

                                PetroverDetail(i + 1);

                            })
                        } else if (lstPet[i].DeviceType == 'Z1') {

                            PetGPS.findAll({
                                where: { $and: [{ DeviceId: lstPet[i].deviceid }, { IsAdvanture: true }] },
                                order: 'Datetime ASC'
                            }).then(function(response) {

                                var objAdvantureInfo = new Object();
                                var TotalDistance = 0;
                                var MaxSpeed = 0;
                                var AverageAdvantureDistance = 0;
                                var MaxAdvantureDistance = 0;

                                if (response.length > 0) {


                                    var groups = u.groupBy(response, function(o) {
                                        // var m = moment.utc(new Date(o.Datetime).toUTCString())
                                        // console.log(new Date(o.Datetime).toUTCString("dd-MM-yyyy"))
                                        // return new Date(o.Datetime).toUTCString("dd-MM-yyyy");
                                        return moment.utc(new Date(o.Datetime).toUTCString()).format("DD-MM-YYYY");
                                    });


                                    var lstGroupDate = u.map(groups, function(group, day) {
                                        return {
                                            day: day,
                                            ConvertedDate: moment.utc(new Date(group[0].Datetime).toUTCString()).format("YYYY-MM-DD"),
                                            data: group
                                        }
                                    });

                                    for (var j = 0; j < lstGroupDate.length; j++) {
                                        if (lstGroupDate[j].data.length > 0) {
                                            var IndividualDistance = 0;
                                            if (parseFloat(lstGroupDate[j].data[0].Speed) > MaxSpeed) {
                                                MaxSpeed = parseFloat(lstGroupDate[j].data[0].Speed);
                                            };

                                            for (var k = 0; k < lstGroupDate[j].data.length - 1; k++) {
                                                var LocaA = {
                                                    latitude: lstGroupDate[j].data[k].Latitude,
                                                    longitude: lstGroupDate[j].data[k].Longtitude
                                                }
                                                var LocaB = {
                                                    latitude: lstGroupDate[j].data[k + 1].Latitude,
                                                    longitude: lstGroupDate[j].data[k + 1].Longtitude
                                                }
                                                var dist = geolib.getDistance(LocaA, LocaB);
                                                IndividualDistance += dist

                                                if (parseFloat(lstGroupDate[j].data[k + 1].Speed) > MaxSpeed) {
                                                    MaxSpeed = parseFloat(lstGroupDate[j].data[k + 1].Speed);
                                                };

                                            };

                                            TotalDistance += IndividualDistance;
                                            IndividualDistance = Math.round((IndividualDistance / 1000) * 100) / 100;
                                            if (IndividualDistance > MaxAdvantureDistance) {
                                                MaxAdvantureDistance = IndividualDistance;
                                            };
                                        };
                                    };

                                    AverageAdvantureDistance = Math.round(((TotalDistance / 1000) / lstGroupDate.length) * 100) / 100;
                                };
                                objAdvantureInfo.TotalDistance = Math.round((TotalDistance / 1000) * 100) / 100;
                                objAdvantureInfo.MaxSpeed = Math.round(MaxSpeed * 100) / 100;
                                objAdvantureInfo.AverageAdvantureDistance = AverageAdvantureDistance;
                                objAdvantureInfo.MaxAdvantureDistance = Math.round(MaxAdvantureDistance * 100) / 100;
                                objAdvantureInfo.DeviceId = lstPet[i].deviceid;

                                lstZ1Detail.push(objAdvantureInfo);
                                PetroverDetail(i + 1);
                            })
                        } else {
                            PetroverDetail(i + 1)
                        };
                    } else {
                        data.lstPet = lstPet;
                        data.lstPetOnline = lstPetOnline;
                        data.lstPetRoverDetail = lstPetRoverDetail;
                        data.lstZ1Detail = lstZ1Detail;
                        data.success = true;

                        res.json(data);
                    };
                }
                PetroverDetail(0)


            }).catch(function(error) {
                res.json(error);
            })
        } else {
            res.json(RecordNotFound);
        }
    })
})


router.get('/GetVehicleById', function(req, res) {
    Vehicle.findOne({
        where: {
            id: req.query.idVehicle
        }
    }).then(function(response) {
        if (response != null) {
            res.json({
                success: true,
                message: "Record found...",
                data: response
            });
        } else {
            res.json(RecordNotFound);
        }
    })
})

router.get('/GetPetByDeviceId', function(req, res) {
    Pet.findOne({
        where: {
            deviceid: req.query.DeviceId
        }
    }).then(function(response) {
        if (response != null) {
            res.json({
                success: true,
                message: "Record found...",
                data: response
            });
        } else {
            res.json(RecordNotFound);
        }
    })
})

router.post('/GetAllBike', jsonParser, function(req, res) {

    Bike.findAll({ where: { iduser: req.query.idUser, IsWireCut: 1, IsDeleted: false, } }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.post('/GetAllNotWorkingBike', jsonParser, function(req, res) {
    if (req.query.Type == 'M2' || req.query.Type == null || req.query.Type == undefined) {
        var Type = "tp.DeviceType = 'M2'";
    } else {
        var Type = "tp.DeviceType != 'M2'";
    }
    // connection.query("SELECT tp.*, tpg.Latitude,tpg.Longtitude,tpg.MAXDateTime, tpg.Id, tpg.Speed FROM (SELECT DeviceId,Latitude,Longtitude, MAX(Datetime) AS MAXDateTime, Id, Speed FROM tblgpsscanner GROUP BY DeviceId) tpg INNER JOIN tblbike as tp ON tp.deviceid = tpg.DeviceId  where tp.IsWireCut=1 && tp.iduser = "+ req.query.idUser + " && tp.IsDeleted = false", function(err, rows, fields) {
    connection.query("select  tp.*, tpg.Latitude,tpg.Longtitude,tpg.Datetime, tpg.Id, tpg.Speed  from (select s1.Datetime, s1.Latitude, s1.Longtitude, s1.Id, s1.Speed, s1.DeviceId from tblgpsscanner s1 inner join (select max(Datetime) Datetime, deviceid from tblgpsscanner group by deviceid) s2 on s1.deviceid = s2.deviceid and s1.Datetime = s2.Datetime group by Datetime) tpg INNER JOIN tblbike as tp ON tp.deviceid = tpg.DeviceId  where tp.IsOnline= false && tp.iduser = " + req.query.idUser + " && tp.IsDeleted = false && '" + Type + "';", function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            console.log(err);
            res.json({ success: false, data: [] });
        }
    })

})

router.post('/GetAllWorkingBike', jsonParser, function(req, res) {
    connection.query("SELECT  tb.id,tb.deviceid,tb.Name,tb.IsOnline, tb.IsACC, tpg.Latitude,tpg.Longtitude,tpg.Datetime, tpg.Date, tpg.Id, tpg.Speed FROM tblvehicle tb INNER JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId,MAX(Id) Id FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Id = b.Id WHERE iduser=" + req.query.idUser + " and IsDelete=false;", function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            res.json({ success: false, data: [] });
        }
    })
})

router.post('/GetNotWorkingBikeById', jsonParser, function(req, res) {

    if (req.query.Type == 'M2' || req.query.Type == null || req.query.Type == undefined) {
        var Type = "tp.DeviceType = 'M2'";
    } else {
        var Type = "tp.DeviceType != 'M2'";
    }
    // connection.query("SELECT tp.*, tpg.Latitude,tpg.Longtitude,tpg.MAXDateTime, tpg.Id, tpg.Speed FROM (SELECT DeviceId,Latitude,Longtitude, MAX(Datetime) AS MAXDateTime, Id, Speed FROM tblgpsscanner GROUP BY DeviceId) tpg INNER JOIN tblbike as tp ON tp.deviceid = tpg.DeviceId  where tp.IsWireCut=1 && tp.iduser = "+ req.query.idUser + " && tp.IsDeleted = false", function(err, rows, fields) {
    connection.query("select  tp.*, tpg.Latitude,tpg.Longtitude,tpg.Datetime, tpg.Id, tpg.Speed  from (select s1.Datetime, s1.Latitude, s1.Longtitude, s1.Id, s1.Speed, s1.DeviceId from tblgpsdata s1 inner join (select max(Datetime) Datetime, deviceid from tblgpsdata group by deviceid) s2 on s1.deviceid = s2.deviceid and s1.Datetime = s2.Datetime group by Datetime) tpg INNER JOIN tblbike as tp ON tp.deviceid = tpg.DeviceId  where tp.IsOnline= false && tp.id = " + req.query.bikeId + " && tp.IsDelete = false && '" + Type + "';", function(err, rows, fields) {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            console.log(err);
            res.json({ success: false, data: [] });
        }
    })

})


router.post('/SaveBike', jsonParser, function(req, res) {
    objPet = req.body;

    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);

        var search = {};
        search['$and'] = [];

        var obj = new Object();
        obj['username'] = {
            $eq: decoded.username
        };
        search['$and'].push(obj);
        if (objPet.Type == 'Owner') {
            var DeviceType = 'M2-U';
            var obj = new Object();
            obj['password'] = {
                $eq: decoded.password
            };
            search['$and'].push(obj);
        } else {
            var DeviceType = 'M2';
            var obj = new Object();
            obj['password'] = {
                $eq: decoded.password
            };
            search['$and'].push(obj);
        }


        User.findOne({
            // where: {
            //     username: decoded.username,
            //     password: decoded.password
            // }
            where: search
        }).then(function(UserExist) {
            if (UserExist != null) {

                Bike.count({
                    where: {
                        iduser: objPet.iduser,
                        IsDeleted: false,
                        DeviceType: {
                            $ne: 'M2'
                        },
                    }
                }).then(function(objCount) {
                    // if (objCount >= 5 && DeviceType == 'M2-U') {
                    //     res.json({
                    //         success: false,
                    //         message: "You can add only five divices",
                    //         data: null
                    //     });
                    // } else {
                    if (objPet.deviceid != '' && objPet.deviceid != null) {

                        var searchDevice = {};
                        searchDevice['$and'] = [];

                        var obj = new Object();
                        obj['DeviceId'] = {
                            $eq: objPet.deviceid
                        };
                        searchDevice['$and'].push(obj);

                        if (objPet.Type == 'Owner') {
                            var obj = new Object();
                            obj['Type'] = {
                                $ne: 'M2'
                            };
                            searchDevice['$and'].push(obj);
                        } else {
                            var obj = new Object();
                            obj['Type'] = {
                                $eq: 'M2'
                            };
                            searchDevice['$and'].push(obj);
                        }

                        PetDevice.findOne({
                            // where: {
                            //     DeviceId: objPet.deviceid,
                            //     Type: DeviceType,
                            // }

                            where: searchDevice
                        }).then(function(objPetDevice) {
                            if (objPetDevice != null) {
                                if (objPet.id == 0) {

                                    objPet.IMEINumber = objPetDevice.IMEI;
                                    objPet.IsOldDevice = objPetDevice.IsOldDevice;
                                    objPet.IsOnline = false;
                                    // objPet.HandshakDatetime = null;
                                    objPet.CreatedDate = GetCurrentDate();
                                    objPet.DeviceType = objPetDevice.Type;
                                    Bike.findOne({
                                        where: {
                                            deviceid: objPet.deviceid,
                                            IsDeleted: true
                                        }
                                    }).then(function(objPetExist) {
                                        if (objPetExist) {
                                            objPet.id = objPetExist.id;
                                            Bike.update(objPet, {
                                                where: {
                                                    id: objPet.id
                                                }
                                            }).then(function(response) {
                                                if (response[0]) {
                                                    funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Create Vehicle');
                                                    res.json({
                                                        success: true,
                                                        message: "Vehicle created successfully...",
                                                        data: objPet
                                                    });
                                                }
                                            })
                                        } else {
                                            objPet.mode = 1;
                                            Bike.findOne({
                                                where: {
                                                    deviceid: objPet.deviceid,
                                                    IsDeleted: false
                                                }
                                            }).then(function(objNewPetExist) {
                                                if (objNewPetExist) {
                                                    res.json({
                                                        success: false,
                                                        message: "Tracker No. is already assign to other Vehicle...",
                                                        data: null
                                                    });

                                                } else {
                                                    Bike.create(objPet).then(function(response) {
                                                        if (response) {
                                                            funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Create Vehicle');
                                                            res.json({
                                                                success: true,
                                                                message: "Vehicle created successfully...",
                                                                data: response
                                                            });
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Tracker No. is already assign to other Vehicle...",
                                                                data: null
                                                            });
                                                        }
                                                    })
                                                }

                                            })
                                        }
                                    })
                                } else {
                                    objPet.IsOldDevice = objPetDevice.IsOldDevice;
                                    Bike.findOne({
                                        where: {
                                            deviceid: objPet.deviceid
                                        }
                                    }).then(function(objPetExist) {
                                        if (objPetExist != null && objPetExist.id != objPet.id && objPetExist.IsDeleted == false) {
                                            res.json({
                                                success: false,
                                                message: "Tracker No. is already assign to other Vehicle...",
                                                data: objPetExist
                                            });
                                        } else {
                                            Bike.update(objPet, {
                                                where: {
                                                    id: objPet.id
                                                }
                                            }).then(function(response) {
                                                if (response[0]) {
                                                    funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Update Vehicle');
                                                    res.json({
                                                        success: true,
                                                        message: "Vehicle updated successfully...",
                                                        data: objPet
                                                    });
                                                }
                                            })
                                        }
                                    })
                                }
                            } else {
                                res.json({
                                    success: false,
                                    message: "Invalid Tracker No., Please insert valid Tracker No.",
                                    data: ""
                                });
                            }
                        })
                    } else {
                        if (objPet.id == 0) {
                            objPet.IMEINumber = '';
                            // objPet.IsOldDevice = objPetDevice.IsOldDevice;
                            objPet.IsOnline = false;
                            objPet.HandshakDatetime = null;
                            objPet.CreatedDate = GetCurrentDate();

                            // Pet.findOne({
                            //     where: {
                            //         deviceid: objPet.deviceid,
                            //         IsDeleted: true
                            //     }
                            // }).then(function(objPetExist) {
                            //     if (objPetExist) {
                            //         objPet.id = objPetExist.id;
                            //         Pet.update(objPet, {
                            //             where: {
                            //                 id: objPet.id
                            //             }
                            //         }).then(function(response) {
                            //             if (response[0]) {
                            //                 res.json({
                            //                     success: true,
                            //                     message: "Pet created successfully...",
                            //                     data: objPet
                            //                 });
                            //             }
                            //         })

                            //     } else {
                            objPet.mode = 1;
                            // Pet.findOne({
                            //     where: {
                            //         deviceid: objPet.deviceid,
                            //         IsDeleted: false
                            //     }
                            // }).then(function(objNewPetExist) {
                            //     if (objNewPetExist) {
                            //         res.json({
                            //             success: false,
                            //             message: "Device id is already assign to other pet...",
                            //             data: null
                            //         });

                            //     } else {
                            Bike.create(objPet).then(function(response) {
                                if (response) {
                                    funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Create Vehicle');
                                    res.json({
                                        success: true,
                                        message: "Vehicle created successfully...",
                                        data: response
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Tracker No. is already assign to other pet...",
                                        data: null
                                    });
                                }
                            })

                            //     }

                            // })
                            //     }
                            // })
                        } else {
                            // objPet.IsOldDevice = objPetDevice.IsOldDevice;
                            Bike.findOne({
                                where: {
                                    id: objPet.id
                                }
                            }).then(function(objPetExist) {
                                if (objPetExist != null && objPetExist.id != objPet.id && objPetExist.IsDeleted == false) {
                                    res.json({
                                        success: false,
                                        message: "Tracker No. is already assign to other Vehicle...",
                                        data: objPetExist
                                    });
                                } else {
                                    Bike.update(objPet, {
                                        where: {
                                            id: objPet.id
                                        }
                                    }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Update Vehicle');
                                            res.json({
                                                success: true,
                                                message: "Vehicle updated successfully...",
                                                data: objPet
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    }
                    //}
                });
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/DeleteBike', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    if (token) {
        var decoded = jwt.decode(token, TokenKey);

        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (req.query.DeviceId != '' && req.query.DeviceId != null) {
                    Bike.findOne({
                        where: {
                            deviceid: req.query.DeviceId,
                            IsDeleted: false
                        }
                    }).then(function(response) {
                        if (response) {
                            response.updateAttributes({ IsDeleted: true }).then(function(resUpdate) {
                                PetGPS.destroy({ where: { DeviceId: req.query.DeviceId } }).then(function(responseGPS) {
                                    PetAlarm.destroy({ where: { DeviceId: req.query.DeviceId } }).then(function(responseAlarm) {
                                        funAuditLog.CreateAuditLog('DeleteBike', UserExist.username, 'Delete Vehicle');
                                        res.json({
                                            success: true,
                                            message: "Vehicle deleted successfully",
                                            data: response
                                        });
                                    });
                                });
                            });
                        } else {
                            res.json(RecordNotFound);
                        }

                    })
                } else {
                    if (req.query.BikeId != '' && req.query.BikeId != null) {
                        Bike.destroy({ where: { id: req.query.BikeId } }).then(function(response) {
                            if (response) {
                                funAuditLog.CreateAuditLog('DeleteBike', UserExist.username, 'Delete Vehicle');
                                res.json({
                                    success: true,
                                    message: "Vehicle deleted successfully",
                                    data: response
                                });
                            } else {
                                res.json(RecordNotFound);
                            }
                        })
                    } else {
                        res.json(RecordNotFound);
                    }
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/ChangePetWorkingMode', function(req, res) {
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

                var DeviceId = req.query.DeviceId;
                // var Mode = "0";
                // if (req.query.mode == '1') {
                //     Mode = "1";
                // }

                Pet.findOne({
                    where: {
                        deviceid: req.query.DeviceId
                    }
                }).then(function(response) {
                    if (response != null) {

                        // var Data = req.query.Data;
                        var Data = "";
                        if (response.IsOldDevice) {

                            // if (req.query.mode == '0') {
                            Data = "(" + DeviceId + "DP30" + req.query.mode + ")";
                            // } else if (req.query.mode == '1') {
                            //     Data = "(" + DeviceId + "DP30" + req.query.mode + ")";
                            // }


                        } else {
                            if (req.query.mode == '0') {
                                Data = "(" + DeviceId + "DP30" + req.query.mode + ",0,180,1)";
                            } else if (req.query.mode == '1') {
                                Data = "(" + DeviceId + "DP30" + req.query.mode + ",10,0,0)";
                            } else {
                                Data = "(" + DeviceId + "DP30" + req.query.mode + ",300,180,1)";
                            };
                        }
                        // var Data = "(" + DeviceId + "DP30" + req.query.mode + ")";
                        var client = new net.Socket();
                        var Sendflag = false;
                        client.connect(SocketPort, SocketIPAddress, function() {
                            client.write(Data);
                            client.setTimeout(20000, function() {
                                if (Sendflag == false) {
                                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                                };
                                client.destroy();
                            });
                        });

                        client.on('data', function(data) {
                            var line = data.toString();
                            //   console.log(line);
                            if (line.indexOf('BP30') > 0) {
                                // console.log('Received: ' + line);

                                var ModeCode = line.substring(17, 18);
                                var deviceID = line.substring(1, 13);

                                Sendflag = true;

                                var FenceFlag = false;

                                if (ModeCode == "2") {
                                    FenceFlag = true;
                                }

                                Pet.findOne({
                                    where: {
                                        deviceid: req.query.DeviceId
                                    }
                                }).then(function(objPetresponse) {
                                    if (objPetresponse) {
                                        //  console.log("Check for Old Device -   " + response.IsOldDevice)
                                        if (response.IsOldDevice) {
                                            FenceFlag = objPetresponse.IsFenceOnline;
                                        };

                                        //  console.log(FenceFlag)

                                        objPetresponse.updateAttributes({ mode: ModeCode, IsFenceOnline: FenceFlag }).then(function(resUpdate) {

                                            var desc = "Working Mode = " + ModeCode;
                                            var objPetLogs = {
                                                DeviceId: req.query.DeviceId,
                                                Description: desc,
                                                Datetime: GetCurrentDate()
                                            }

                                            PetLogs.create(objPetLogs).then(function(response1) {
                                                funAuditLog.CreateAuditLog('ChangePetWorkingMode', UserExist.username, 'Update Working Mode');
                                                res.json({
                                                    success: true,
                                                    message: "Working Mode Updated successfully.",
                                                    data: ModeCode
                                                });
                                            })

                                        });
                                    } else {
                                        res.json(RecordNotFound);
                                    }
                                    client.destroy();

                                })


                                // res.json({ success: true, data: objNavigation });
                                // res.json(objNavigation);
                                client.destroy(); // kill client after server's response

                            } else {
                                Sendflag = true;
                                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });

                                client.destroy();
                            }


                        });

                        client.on('close', function() {
                            console.log('Connection closed');
                        });

                    } else {
                        res.json(RecordNotFound);
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


function GetUserNameFromDate() {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();

    var seconds = d.getSeconds();
    var minutes = d.getMinutes();
    var hour = d.getHours();

    var milisec = d.getMilliseconds();

    return curr_year.toString() + curr_month.toString() + curr_date.toString() + hour.toString() + minutes.toString() + seconds.toString() + milisec.toString();


}

router.post('/uploadImage', function(req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/../MediaUploads/PetUpload';
    var FileName = [];
    var DeviceId = [];

    //file upload path
    form.parse(req, function(err, fields, files) {

        //console.log(err)
        // console.log(fields)
        //console.log(files)
        //you can get fields here
    });
    form.on('fileBegin', function(name, file) {
        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetUserNameFromDate();

        if (ext.indexOf('?') > -1) {
            ext = ext.substring(0, ext.indexOf('?'));
        };

        file.path = form.uploadDir + "/" + NewName + ext;
        // file.path = form.uploadDir + "/" + file.name;
        FileName.push(NewName + ext);
        DeviceId.push(name);

        //modify file path
    });
    form.on('end', function() {
        var i = 0;

        function uploader(i) {
            if (i < FileName.length) {
                var BikeId = parseInt(DeviceId[i]);

                Bike.findOne({ where: { id: BikeId } }).then(function(response) {
                    if (response != null) {
                        if (response.bikeimageURl != '' && response.bikeimageURl != null) {
                            var oldFile = __dirname + '/../MediaUploads/PetUpload/' + response.bikeimageURl;
                            fs.exists(oldFile, function(exists) {
                                if (exists) {
                                    fs.unlink(oldFile);
                                }
                            });
                        };
                        response.updateAttributes({ bikeimageURl: FileName[i] }).then(function(resUpdate) {
                            if ((i + 1) == FileName.length) {
                                res.json({ success: true, message: "Images Uploaded Successfully..." });
                            } else {
                                uploader(i + 1);
                            };
                        })
                    }
                })
            }
        }
        uploader(i);
        if (FileName.length == 0) {
            res.json({ success: false, message: "Please Select atleast One File..." });
        }
        // res.sendStatus(200);
        //when finish all process
    });
});

router.post('/login', jsonParser, function(req, res) {
    var obj = req.body;
    var username = obj.username
    var password = obj.password

    User.findOne({
        where: {
            username: username,
            password: password
        }
    }).then(function(response) {
        if (response != null) {
            UserInRole.belongsTo(Role, {
                foreignKey: {
                    name: 'roleId',
                    allowNull: false
                }
            });
            UserInRole.findAll({
                where: {
                    userId: response.id
                },
                include: [{
                    model: Role,
                    attributes: ['id', 'RoleName']
                }]
            }).then(function(resUserInRole) {
                var lstRole = [];
                for (var i = 0; i < resUserInRole.length; i++) {
                    var objRole = resUserInRole[i].tblrole.RoleName;
                    lstRole.push(objRole);
                }

                var user = {
                    username: username,
                    password: password,
                    Role: lstRole
                }
                var token = jwt.encode(user, "bugz");
                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    UserId: response.id,
                    message: "Login Successfully..."
                });
            })
        } else {
            res.json({
                success: false,
                message: "Invalid Username or Password..."
            });
        }
    })
})

router.get('/GetVehicleCurrentLocation', function(req, res) {

    var Startdate = new Date();

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    GPSData.findOne({
        where: {
            DeviceId: req.query.DeviceId,
            Date: { $lte: unixStartdate }
        },
        order: 'id DESC'
    }).then(function(response) {
        if (response != null) {
            res.json({ success: true, data: response });
        } else {
            res.json(RecordNotFound);
        }
    })
});

router.get('/GetAllGPSDate', function(req, res) {
    var todaydata = new Date();

    // var convertDate = convertdateformat(todaydata);
    var unixNewDate = todaydata.getTime() / 1000;

    todaydata = new Date(todaydata.setMonth(todaydata.getMonth() - 4));

    // var convertDate = convertdateformat(todaydata);
    var unixTodaydata = todaydata.getTime() / 1000;


    GPSData.findAll({
        attributes: ['Datetime', 'Date'],
        where: {
            DeviceId: req.query.DeviceId,
            Date: { $lte: unixNewDate, $gte: unixTodaydata }
        },
        group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        order: 'id DESC'
    }).then(function(response) {
        res.json(response);
    })
});

router.get('/GetAllGPSDate1', function(req, res) {
    connection.query("Select Datetime from tblgpsscanner where DeviceId='" + req.query.DeviceId + "' and Datetime <= now() and Datetime >= DATE_SUB(now() ,INTERVAL 4 MONTH) group by Date(Datetime);", function(err, rows, fields) {
        if (!err) {
            rows = rows.reverse();
            res.json(rows);
        } else {
            res.json([]);
        }
    })
});

router.get('/GetAllGPSDateByDate', function(req, res) {
    var Startdate = req.query.StartDateTime;
    if (Startdate == null || Startdate == '') {
        Startdate = new Date();
        Startdate = new Date(Startdate.setMonth(Startdate.getMonth() - 4));
        var convertDate = convertdateformat(Startdate);
        var unixStartdata = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    }


    var todaydata = new Date();
    var convertDate = convertdateformat(todaydata);
    var unixNewDate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    GPSData.findAll({
        attributes: ['Datetime', 'Date'],
        where: {
            DeviceId: req.query.DeviceId,
            Datetime: { $lte: unixNewDate, $gt: unixStartdata }
        },
        group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        order: 'id DESC'
    }).then(function(response) {
        res.json(response);
    })
});

router.get('/GetAllGPSDateByUser', function(req, res) {
    var query = "SELECT a.Datetime, a.DeviceId FROM tblgpsscanner as a, tblbike as b where a.DeviceId = b.deviceid and a.Datetime <= now() and a.Datetime >= DATE_SUB(now() ,INTERVAL 4 MONTH) and b.idUser = '" + req.query.idUser + "' and b.IsDeleted = false and b.DeviceType != 'M2' group by a.DeviceId, date(Datetime) order by a.id desc;";
    connection.query(query, function(err, lstGPSData, fields) {
        res.json(lstGPSData);
    });
});

router.get('/GetAllGPSDateByUser1', function(req, res) {
    console.log("################################################################")
    console.log(new Date())
        // var query = "SELECT Datetime,DeviceId from tblgpsscanner where Datetime <= now() and Datetime >= DATE_SUB(now() ,INTERVAL 4 MONTH) and DeviceId in('075034498153','075034499458','075034807742','075034800879','075034803469');";
    var query = "SELECT a.Datetime, a.DeviceId FROM tblgpsscanner as a, tblbike as b where a.DeviceId = b.deviceid and a.Datetime <= now() and a.Datetime >= DATE_SUB(now() ,INTERVAL 4 MONTH) and b.idUser = 51592;";
    connection.query(query, function(err, lstGPSData, fields) {
        console.log(new Date())
        console.log("######################################################################################")
            //  groups = u.groupBy(lstGPSData, function(o) {

        //             return momentz.utc(o.Datetime).tz(AppTimeZone).format('DD-MM-YYYY')
        //         });

        var groups = u.groupBy(lstGPSData, function(o) {

            return o.DeviceId
        });

        var lstGroupDate = u.map(groups, function(group, DeviceId) {
            // console.log(day)
            // console.log(momentz(group[0].Datetime).format('YYYY-MM-DD'))
            var group2 = u.groupBy(group, function(o) {

                return momentz.utc(o.Datetime).format('DD-MM-YYYY')
            });

            var lstGroupData = u.map(group2, function(group3, groupdate) {
                return {
                    DeviceId: DeviceId,
                    Datetime: group3[0].Datetime
                }
            });


            return {
                DeviceId: DeviceId,
                data: lstGroupData
            }
        });

        var lstAllGPSData = [];
        for (var i = 0; i < lstGroupDate.length; i++) {
            // lstAllGPSData.push(lstGroupDate[i].data);
            // if (lstAllGPSData.length == 0) {
            //     lstAllGPSData = lstGroupDate[i].data;

            // } else {
            lstAllGPSData = lstAllGPSData.concat(lstGroupDate[i].data)
                // }
        }

        res.json(lstAllGPSData);
    });
});

router.get('/GetAllGPSByDate', function(req, res) {

    var data = req.query.TodayDateTime;
    PetGPS.findAll({
        // where: models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data),
        where: { $and: [models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data), { DeviceId: req.query.DeviceId }, { IsAdvanture: true }] },
        // group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        order: 'Datetime ASC'
    }).then(function(response) {
        res.json(response);
    })
});

router.get('/GetAllGPSByTimeZoneDate', function(req, res) {

    // var Startdate = req.query.TodayStartDateTime;
    // var Enddate = req.query.TodayEndDateTime;
    // PetGPS.findAll({
    //         attributes: ['Id', 'Datetime', 'Latitude', 'Longtitude', 'GPSPositioning', 'Speed', 'Direction', 'DeviceId'],
    //         where: { $and: [{ DeviceId: req.query.DeviceId }, { GPSPositioning: 'A' }, { Datetime: { $gte: Startdate } }, { Datetime: { $lte: Enddate } }] },
    //         // where: models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data),
    //         // where: { $and: [models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data), { DeviceId: req.query.DeviceId }, { IsAdvanture: true }] },
    //         // group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
    //         order: 'Id ASC'
    //     }).then(function(response) {
    //         res.json(response);
    //     })
    var Startdate = req.query.TodayStartDateTime;
    var Enddate = req.query.TodayEndDateTime;

    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    var convertDate = convertdateformatForUnix(Enddate);
    var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;


    var query = "select Id,Datetime, Latitude, Longtitude, GPSPositioning, Speed, Direction, DeviceId, Date from tblgpsdata where deviceid=" + req.query.DeviceId + " and GPSPositioning='A' and Date >= '" + unixStartdate + "' and Date <= '" + unixEnddate + "';"
    connection.query(query, function(err, lstGPSData, fields) {
        res.json(lstGPSData);
    });
});

router.get('/GetAllGPSByTimeZoneDate1', function(req, res) {

    // var Startdate = req.query.TodayStartDateTime;
    // var Enddate = req.query.TodayEndDateTime;
    // PetGPS.findAll({
    //     attributes: ['Id', 'Datetime', 'Latitude', 'Longtitude', 'GPSPositioning', 'Speed', 'Direction', 'DeviceId'],
    //     where: { $and: [{ DeviceId: req.query.DeviceId }, { GPSPositioning: 'A' }, { Datetime: { $gte: Startdate } }, { Datetime: { $lte: Enddate } }] },
    //     // where: models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data),
    //     // where: { $and: [models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data), { DeviceId: req.query.DeviceId }, { IsAdvanture: true }] },
    //     // group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
    //     order: 'Id ASC'
    // }).then(function(response) {
    //     res.json(response);
    // })

    var Startdate = req.query.TodayStartDateTime;
    var Enddate = req.query.TodayEndDateTime;

    console.log("###################################################")
    console.log(Startdate)
    console.log(Enddate)
    console.log("###################################################")

    var query = "select Id,Datetime, Latitude, Longtitude, GPSPositioning, Speed, Direction, DeviceId from tblgpsscanner where deviceid=" + req.query.DeviceId + " and GPSPositioning='A' and Datetime >= '" + Startdate + "' and Datetime <= '" + Enddate + "';"
    connection.query(query, function(err, lstGPSData, fields) {
        res.json(lstGPSData);
    });
});

function ConvertDateFormat(today) {
    console.log(today)
    var year = today.getUTCFullYear();
    var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = today.getUTCDate();

    //return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    return ("0000" + year.toString()).slice(-4) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2);
}

router.get('/GetAdvatureInfoByDeviceId', function(req, res) {

    var Todaydata = req.query.TodayDateTime;
    var AppTimeZone = req.query.AppTimeZone;

    PetGPS.findAll({
        // where: models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data),
        where: { $and: [{ DeviceId: req.query.DeviceId }, { IsAdvanture: true }] },
        // group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        order: 'Datetime ASC'
    }).then(function(response) {

        var objAdvantureInfo = new Object();
        var TotalDistance = 0;
        var MaxSpeed = 0;
        var AverageAdvantureDistance = 0;
        var MaxAdvantureDistance = 0;

        var DatewiseTravelledDistance = 0;
        var DatewiseMaxSpeed = 0;
        var DatewiseAverageSpeed = 0;
        var DatewiseTotalSpeed = 0;
        if (response.length > 0) {
            var groups = [];
            var lstGroupDate = [];
            if (AppTimeZone) {

                groups = u.groupBy(response, function(o) {
                    // var m = moment.utc(new Date(o.Datetime).toUTCString())
                    // console.log(new Date(o.Datetime).toUTCString("dd-MM-yyyy"))
                    // return new Date(o.Datetime).toUTCString("dd-MM-yyyy");
                    // return moment.utc(new Date(o.Datetime).toUTCString()).format("DD-MM-YYYY");
                    // console.log(momentz(o.Datetime).tz(AppTimeZone).format('DD-MM-YYYY'))
                    // console.log(momentz(o.Datetime).tz(AppTimeZone).format('DD-MM-YYYY HH:mm:ss'))
                    // console.log(AppTimeZone)


                    return momentz.utc(o.Datetime).tz(AppTimeZone).format('DD-MM-YYYY')
                });

                lstGroupDate = u.map(groups, function(group, day) {
                    // console.log(day)
                    // console.log(momentz(group[0].Datetime).format('YYYY-MM-DD'))

                    return {
                        day: day,
                        // ConvertedDate: moment.utc(new Date(group[0].Datetime).toUTCString()).format("YYYY-MM-DD"),
                        ConvertedDate: momentz.utc(group[0].Datetime).tz(AppTimeZone).format('YYYY-MM-DD'),
                        data: group
                    }
                });
            } else {
                groups = u.groupBy(response, function(o) {
                    // var m = moment.utc(new Date(o.Datetime).toUTCString())
                    // console.log(new Date(o.Datetime).toUTCString("dd-MM-yyyy"))
                    // return new Date(o.Datetime).toUTCString("dd-MM-yyyy");
                    return moment.utc(new Date(o.Datetime).toUTCString()).format("DD-MM-YYYY");
                });

                lstGroupDate = u.map(groups, function(group, day) {
                    return {
                        day: day,
                        ConvertedDate: moment.utc(new Date(group[0].Datetime).toUTCString()).format("YYYY-MM-DD"),
                        data: group
                    }
                });
            };

            // console.log(lstGroupDate[(lstGroupDate.length - 1)].ConvertedDate)
            if (Todaydata) {
                var objTodayData = u.findWhere(lstGroupDate, { ConvertedDate: Todaydata });
                // console.log(AppTimeZone)

                if (objTodayData != undefined && objTodayData != null) {

                    DatewiseMaxSpeed = parseFloat(objTodayData.data[0].Speed);

                    for (var i = 0; i < objTodayData.data.length - 1; i++) {
                        var LocaA = {
                            latitude: objTodayData.data[i].Latitude,
                            longitude: objTodayData.data[i].Longtitude
                        }
                        var LocaB = {
                            latitude: objTodayData.data[i + 1].Latitude,
                            longitude: objTodayData.data[i + 1].Longtitude
                        }
                        var dist = geolib.getDistance(LocaA, LocaB);
                        DatewiseTravelledDistance += dist

                        if (parseFloat(objTodayData.data[i + 1].Speed) > DatewiseMaxSpeed) {
                            DatewiseMaxSpeed = parseFloat(objTodayData.data[i + 1].Speed);
                        };

                        DatewiseTotalSpeed += parseFloat(objTodayData.data[i + 1].Speed);

                    };
                    DatewiseTravelledDistance = Math.round((DatewiseTravelledDistance / 1000) * 100) / 100;
                    DatewiseAverageSpeed = Math.round((DatewiseTotalSpeed / objTodayData.data.length) * 100) / 100;

                };
            };

            for (var j = 0; j < lstGroupDate.length; j++) {
                if (lstGroupDate[j].data.length > 0) {
                    var IndividualDistance = 0;
                    if (parseFloat(lstGroupDate[j].data[0].Speed) > MaxSpeed) {
                        MaxSpeed = parseFloat(lstGroupDate[j].data[0].Speed);
                    };

                    for (var i = 0; i < lstGroupDate[j].data.length - 1; i++) {
                        var LocaA = {
                            latitude: lstGroupDate[j].data[i].Latitude,
                            longitude: lstGroupDate[j].data[i].Longtitude
                        }
                        var LocaB = {
                            latitude: lstGroupDate[j].data[i + 1].Latitude,
                            longitude: lstGroupDate[j].data[i + 1].Longtitude
                        }
                        var dist = geolib.getDistance(LocaA, LocaB);
                        IndividualDistance += dist

                        if (parseFloat(lstGroupDate[j].data[i + 1].Speed) > MaxSpeed) {
                            MaxSpeed = parseFloat(lstGroupDate[j].data[i + 1].Speed);
                        };

                    };

                    TotalDistance += IndividualDistance;
                    IndividualDistance = Math.round((IndividualDistance / 1000) * 100) / 100;
                    if (IndividualDistance > MaxAdvantureDistance) {
                        MaxAdvantureDistance = IndividualDistance;
                    };
                };
            };

            AverageAdvantureDistance = Math.round(((TotalDistance / 1000) / lstGroupDate.length) * 100) / 100;
        };



        objAdvantureInfo.TotalDistance = Math.round((TotalDistance / 1000) * 100) / 100;
        objAdvantureInfo.MaxSpeed = MaxSpeed;
        objAdvantureInfo.AverageAdvantureDistance = AverageAdvantureDistance;
        objAdvantureInfo.MaxAdvantureDistance = MaxAdvantureDistance;

        objAdvantureInfo.DatewiseTravelledDistance = DatewiseTravelledDistance;
        objAdvantureInfo.DatewiseMaxSpeed = DatewiseMaxSpeed;
        objAdvantureInfo.DatewiseAverageSpeed = DatewiseAverageSpeed;
        res.json(objAdvantureInfo);
    })
});
/*
router.post('/SaveWifiSetting', jsonParser, function(req, res) {
    var objData = req.body;

    var wifiList = objData.WifiList;

    var SSID = "";
    if (wifiList.length > 6) {
        SSID = "6";
        for (var i = 0; i < 6; i++) {
            SSID = SSID + "," + wifiList[i].SSID;
        };
    } else {
        SSID = wifiList.length;
        for (var i = 0; i < wifiList.length; i++) {
            SSID = SSID + "," + wifiList[i].SSID;
        };
    };

    if (wifiList.length == 0) {
        SSID = "0";
    };
    var SSIDData = "(" + objData.DeviceId + "DE01" + SSID + ")";
    var Sendflag = false;
    var client = new net.Socket();
    client.connect(SocketPort, SocketIPAddress, function() {
        console.log('Connected');
        client.write(SSIDData);

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
            };
            client.destroy();
        });
    });

    client.on('data', function(data) {
        console.log('Received: ' + data);
        var line = data.toString();
        console.log(line);

        if (line.indexOf('BE01') > 0) {
            var deviceID = line.substring(1, 13);
            var Code = line.substring(13, 17);
            var Flag = line.substring(17, 18);
            console.log("299 - " + Flag);
            Sendflag = true;
            if (Flag == '1') {
                Pet.findOne({
                    where: {
                        deviceid: objData.DeviceId
                    }
                }).then(function(response) {
                    if (response) {
                        var CurrentWifi = '';

                        if (wifiList.length > 0) {
                            CurrentWifi = wifiList[0].SSID;
                        };

                        response.updateAttributes({ CurrentWifi: CurrentWifi }).then(function(resUpdate) {
                            funAuditLog.CreateAuditLog('SaveWifiSetting', UserExist.username, 'Save Wifi Setting');
                            res.json({
                                success: true,
                                message: "Wifi Setting saved successfully...",
                                data: CurrentWifi
                            });

                        });
                    } else {
                        res.json(RecordNotFound);
                    }
                    client.destroy();

                })

            } else {
                res.json({ success: false, message: 'Wifi Setting not saved successfully...' });
            };
        } else {
            Sendflag = true;
            res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });

            client.destroy();
        }


        client.destroy(); // kill client after server's response
    });

    client.on('close', function() {
        console.log('Connection closed');
    });
})*/

router.get('/ChangeFenceByPet', function(req, res) {
    var deviceId = req.query.deviceId;
    var IsFenceOnline = req.query.IsFenceOnline;

    // var status = "0";
    // var SSIDData = "(" + deviceId + "DE050,0,0)";
    // if (IsFenceOnline == 'true') {
    //     status = "1";
    //     SSIDData = "(" + deviceId + "DE05300,180,1)";
    // };
    // console.log(SSIDData)
    //     //var SSIDData = "(" + deviceId + "DX21" + status + ",N,8321.190,E,09330.560,01F4)";
    // var Sendflag = false;
    // var client = new net.Socket();
    // client.connect(SocketPort, SocketIPAddress, function() {
    //     console.log('Connected');
    //     client.write(SSIDData);

    //     client.setTimeout(30000, function() {
    //         if (Sendflag == false) {
    //             res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
    //         };
    //         client.destroy();
    //     });
    // });

    // client.on('data', function(data) {
    //     console.log('Received: ' + data);
    //     var line = data.toString();
    //     console.log(line);

    //     if (line.indexOf('BE05') > 0) {
    //         var deviceID = line.substring(1, 13);
    //         var Data = line.substring(17, 18);

    //         Sendflag = true;
    //         if (Data == "1") {

    Fence.findOne({
            where: {
                deviceId: deviceId
            }
        }).then(function(response) {
            if (response) {
                // var IsPetOnline = false;

                // if (status == "1") {
                //     IsPetOnline = true;
                // };
                response.updateAttributes({ IsFenceOnline: IsFenceOnline }).then(function(resUpdate) {
                    var desc = "Fence Status = " + IsFenceOnline;
                    var objPetLogs = {
                        DeviceId: deviceId,
                        Description: desc,
                        Datetime: GetCurrentDate()
                    }

                    if (IsFenceOnline == 'true') {
                        var query = 'UPDATE tblbike SET IsFenceOnline = ' + IsFenceOnline + ' WHERE deviceid = ' + deviceId + ';';
                        connection.query(query, function(err, rows, fields) {
                            PetLogs.create(objPetLogs).then(function(response1) {
                                res.json({
                                    success: true,
                                    message: "Fence Setting saved successfully.",
                                    data: IsFenceOnline
                                });
                            })
                        });
                    } else {
                        Fence.findOne({
                            where: {
                                deviceId: deviceId,
                                IsFenceOnline: true,
                            }
                        }).then(function(responseFence) {
                            if (responseFence != null) {
                                var query = 'UPDATE tblbike SET IsFenceOnline = true WHERE deviceid = ' + deviceId + ';';
                                connection.query(query, function(err, rows, fields) {
                                    PetLogs.create(objPetLogs).then(function(response1) {
                                        res.json({
                                            success: true,
                                            message: "Fence Setting saved successfully.",
                                            data: IsFenceOnline
                                        });
                                    })
                                });
                            } else {
                                var query = 'UPDATE tblbike SET IsFenceOnline = false WHERE deviceid = ' + deviceId + ';';
                                connection.query(query, function(err, rows, fields) {
                                    PetLogs.create(objPetLogs).then(function(response1) {
                                        res.json({
                                            success: true,
                                            message: "Fence Setting saved successfully.",
                                            data: IsFenceOnline
                                        });
                                    })
                                });
                            }
                        });
                    }

                });
            } else {
                res.json({ success: false, message: 'Fence Setting not saved successfully. Try after 5 minute.' });
            }
            // client.destroy();
        })
        //         } else {
        //             res.json({ success: false, message: 'Fence Setting not saved successfully. Try after 5 minute.' });
        //             client.destroy();
        //         };


    //     } else {
    //         Sendflag = true;
    //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });

    //         client.destroy();
    //     }


    //     client.destroy(); // kill client after server's response
    // });

    // client.on('close', function() {
    //     console.log('Connection closed');
    // });
})

router.get('/ChangeFenceByBike', function(req, res) {
    var idFence = req.query.idFence;
    var deviceId = req.query.deviceId
    var IsFenceOnline = req.query.IsFenceOnline;

    // var status = "0";
    // var SSIDData = "(" + deviceId + "DE050,0,0)";
    // if (IsFenceOnline == 'true') {
    //     status = "1";
    //     SSIDData = "(" + deviceId + "DE05300,180,1)";
    // };
    // console.log(SSIDData)
    //     //var SSIDData = "(" + deviceId + "DX21" + status + ",N,8321.190,E,09330.560,01F4)";
    // var Sendflag = false;
    // var client = new net.Socket();
    // client.connect(SocketPort, SocketIPAddress, function() {
    //     console.log('Connected');
    //     client.write(SSIDData);

    //     client.setTimeout(30000, function() {
    //         if (Sendflag == false) {
    //             res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
    //         };
    //         client.destroy();
    //     });
    // });

    // client.on('data', function(data) {
    //     console.log('Received: ' + data);
    //     var line = data.toString();
    //     console.log(line);

    //     if (line.indexOf('BE05') > 0) {
    //         var deviceID = line.substring(1, 13);
    //         var Data = line.substring(17, 18);

    //         Sendflag = true;
    //         if (Data == "1") {

    Fence.findOne({
            where: {
                id: idFence
            }
        }).then(function(response) {
            if (response) {
                // var IsPetOnline = false;

                // if (status == "1") {
                //     IsPetOnline = true;
                // };
                response.updateAttributes({ IsFenceOnline: IsFenceOnline }).then(function(resUpdate) {
                    var desc = "Fence Status = " + IsFenceOnline;
                    // var objPetLogs = {
                    //     DeviceId: deviceId,
                    //     Description: desc,
                    //     Datetime: GetCurrentDate()
                    // }

                    // if (IsFenceOnline == 'true') {
                    //     var query = 'UPDATE tblbike SET IsFenceOnline = ' + IsFenceOnline + ' WHERE deviceid = ' + deviceId + ';';
                    //     connection.query(query, function(err, rows, fields) {
                            // PetLogs.create(objPetLogs).then(function(response1) {
                                res.json({
                                    success: true,
                                    message: "Fence Setting saved successfully.",
                                    data: IsFenceOnline
                                });
                            // })
                    //     });
                    // } else {
                    //     Fence.findOne({
                    //         where: {
                    //             deviceId: deviceId,
                    //             IsFenceOnline: true,
                    //         }
                    //     }).then(function(responseFence) {
                    //         if (responseFence != null) {
                    //             var query = 'UPDATE tblbike SET IsFenceOnline = true WHERE deviceid = ' + deviceId + ';';
                    //             connection.query(query, function(err, rows, fields) {
                    //                 PetLogs.create(objPetLogs).then(function(response1) {
                    //                     res.json({
                    //                         success: true,
                    //                         message: "Fence Setting saved successfully.",
                    //                         data: IsFenceOnline
                    //                     });
                    //                 })
                    //             });
                    //         } else {
                    //             var query = 'UPDATE tblbike SET IsFenceOnline = false WHERE deviceid = ' + deviceId + ';';
                    //             connection.query(query, function(err, rows, fields) {
                    //                 PetLogs.create(objPetLogs).then(function(response1) {
                    //                     res.json({
                    //                         success: true,
                    //                         message: "Fence Setting saved successfully.",
                    //                         data: IsFenceOnline
                    //                     });
                    //                 })
                    //             });
                    //         }
                    //     });
                    // }
                });
            } else {
                res.json({ success: false, message: 'Fence Setting not saved successfully. Try after 5 minute.' });
            }
            // client.destroy();
        })
        //         } else {
        //             res.json({ success: false, message: 'Fence Setting not saved successfully. Try after 5 minute.' });
        //             client.destroy();
        //         };


    //     } else {
    //         Sendflag = true;
    //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });

    //         client.destroy();
    //     }


    //     client.destroy(); // kill client after server's response
    // });

    // client.on('close', function() {
    //     console.log('Connection closed');
    // });
})

router.get('/GetCurrentPetLocation', function(req, res) {
    //GetLookAtMeDP3110a0f
    var DeviceId = req.query.DeviceId;
    // var Data = req.query.Data;
    var Data = "(" + DeviceId + "DP00)";
    console.log(Data);
    var client = new net.Socket();
    var Sendflag = false;

    // PetGPS.findOne({
    //     where: {
    //         DeviceId: req.query.DeviceId
    //     },
    //     order: 'Datetime DESC'
    // }).then(function(response) {
    //     if (response != null) {

    //         response.Datetime = new Date();
    //         var objNewdata = new Object();
    //         objNewdata.id = 0;
    //         objNewdata.Datetime = response.Datetime;
    //         objNewdata.Latitude = response.Latitude;
    //         objNewdata.Longtitude = response.Longtitude;
    //         objNewdata.GPSPositioning = response.GPSPositioning;
    //         objNewdata.Speed = response.Speed;
    //         objNewdata.Direction = response.Direction;
    //         objNewdata.Status = response.Status;
    //         objNewdata.ReservedSign = response.ReservedSign;
    //         objNewdata.DeviceId = response.DeviceId;
    //         objNewdata.IsAdvanture = response.IsAdvanture;
    //         // objNewdata.Datetime = ConvertDateFormat(new Date());
    //        // console.log(objNewdata)
    //         PetGPS.create(objNewdata).then(function(resdata) {});
    //         res.json({ success: true, data: response });
    //     } else {
    //         res.json(RecordNotFound);
    //     }
    // })

    client.connect(SocketPort, SocketIPAddress, function() {
        console.log('Connected');
        client.write(Data);
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(180000, function() {
            if (Sendflag == false) {
                Sendflag = true;
                res.json({ success: false, message: 'Network searching, please try again' });
                client.destroy();
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        console.log(line);
        if (Sendflag == false) {
            if (line.indexOf('BP04') > 0) {
                console.log('Received: ' + line);

                var deviceID = line.substring(1, 13);
                var Date1 = line.substring(17, 23);
                var Position = line.substring(23, 24);
                var Lat = line.substring(24, 34);
                var Lan = line.substring(34, 45);
                var Speed = line.substring(45, 50);
                var Time = line.substring(50, 56);
                var Direction = line.substring(56, 62);
                var Status = line.substring(62, 70);
                var Sign = line.substring(70, 71);
                var ReserveSection = line.substring(71, 79);

                var day = parseInt(Date1.substring(4, 6));
                var month = parseInt(Date1.substring(2, 4)) - 1;
                var year = parseInt("20" + Date1.substring(0, 2));
                var hour = parseInt(Time.substring(0, 2));
                var min = parseInt(Time.substring(2, 4));
                var sec = parseInt(Time.substring(4, 6));
                // console.log(day)
                // console.log(month)
                // console.log(year)

                var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
                if (GPSDateTime <= new Date()) {
                    var objNavigation = {
                        DeviceId: deviceID,
                        Datetime: GPSDateTime,
                        GPSPositioning: Position,
                        Latitude: global.deg_to_lat_long(Lat),
                        Longtitude: global.deg_to_lat_long(Lan),
                        Speed: Speed,
                        Direction: Direction,
                        Status: Status,
                        ReservedSign: Sign,
                        ReservedSelection: ReserveSection,
                    }

                    Sendflag = true;
                    res.json({ success: true, data: objNavigation });
                    // res.json(objNavigation);
                    client.destroy(); // kill client after server's response
                } else {
                    Sendflag = true;
                    res.json({ success: false, message: 'Network searching, please try again' });

                    client.destroy();
                }

            } else {
                Sendflag = true;
                res.json({ success: false, message: 'Network searching, please try again' });

                client.destroy();
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });

})

router.get('/GetLocateMeMapZoom', function(req, res) {
    res.json(15);
});
/*
router.get('/UpdateGsecerByDevice', function(req, res) {
    Pet.findOne({
        where: {
            deviceid: req.query.DeviceId
        }
    }).then(function(response) {
        if (response) {
            response.updateAttributes({ Gsercer: req.query.Gsercer }).then(function(resUpdate) {
                res.json({
                    success: true,
                    message: "G-SECER Setting saved successfully.",
                    data: IsFenceOnline
                });
            });
        } else {
            res.json({ success: false, message: 'G-SECER Setting not saved successfully.' });
        }
    })
});*/

router.get('/UpdateBatteryByDevice', function(req, res) {
    Pet.findOne({
        where: {
            deviceid: req.query.DeviceId
        }
    }).then(function(response) {
        if (response) {
            response.updateAttributes({ DeviceBattery: req.query.DeviceBattery }).then(function(resUpdate) {
                res.json({
                    success: true,
                    message: "Battery Setting saved successfully.",
                    data: req.query.DeviceBattery
                });
            });
        } else {
            res.json({ success: false, message: 'Battery Setting not saved successfully.' });
        }

    })
});

var PetTimeZone = models.tblgpstimezone;
router.post('/SaveTimeZone', jsonParser, function(req, res) {
    objPetTimeZone = req.body;

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

                objPetTimeZone.CreatedDate = GetCurrentDate();
                PetTimeZone.findOne({
                    where: {
                        DeviceId: objPetTimeZone.DeviceId
                    }
                }).then(function(objPetTimeZoneExist) {
                    if (objPetTimeZoneExist) {
                        objPetTimeZone.id = objPetTimeZoneExist.id;
                        PetTimeZone.update(objPetTimeZone, {
                            where: {
                                id: objPetTimeZone.id
                            }
                        }).then(function(response) {
                            // if (response[0]) {
                            res.json({
                                success: true,
                                message: "Timezone Updated successfully...",
                                data: objPetTimeZone
                            });
                            //}
                        })

                    } else {
                        PetTimeZone.create(objPetTimeZone).then(function(response) {
                            funAuditLog.CreateAuditLog('SaveTimeZone', UserExist.username, 'Create Timezone');
                            res.json({
                                success: true,
                                message: "Timezone created successfully...",
                                data: response
                            });
                        })
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

router.get('/GetTimeZoneByDevice', function(req, res) {

    // var data = req.query.DeviceId;
    PetTimeZone.findOne({
        where: { DeviceId: req.query.DeviceId },
    }).then(function(response) {

        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
});

var PetActivity = models.tblgpsactivity;
router.post('/SavePetActivity', jsonParser, function(req, res) {
    lstPetActivity = req.body;

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

                // objPetTimeZone.CreatedDate = GetCurrentDate();
                function AddActivity(i) {
                    if (i < lstPetActivity.length) {
                        var objPetActivity = lstPetActivity[i];
                        PetActivity.create(objPetActivity).then(function(response) {
                            AddActivity(i + 1)
                        })
                    } else {
                        res.json({
                            success: true,
                            message: "Pet Activity created successfully...",
                            data: response
                        });
                    };
                }
                AddActivity(0)


            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/GetAllActivityByDate', function(req, res) {

    var data = req.query.TodayDateTime;
    PetActivity.findAll({
        // where: models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data),
        where: { $and: [models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data), { DeviceId: req.query.DeviceId }] },
        // group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        order: 'Datetime ASC'
    }).then(function(response) {
        res.json(response);
    })
});

router.get('/GetAllActivityByToDay', function(req, res) {

    var Startdate = req.query.TodayDateTime;
    var Enddate = req.query.TodayEndDateTime;
    // console.log("-------------------------************-----------------------")
    // console.log(Startdate)
    // console.log(Enddate)
    // console.log("-------------------------************-----------------------")
    PetActivity.findAll({
        // where: models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data),
        // where: { $and: [models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data), { DeviceId: req.query.DeviceId }] },
        where: { $and: [{ DeviceId: req.query.DeviceId }, { Datetime: { $gte: Startdate } }, { Datetime: { $lte: Enddate } }] },
        // group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        order: 'Datetime ASC'
    }).then(function(response) {
        res.json(response);
    })
});

router.get('/GetAllActivityNewByToDay', function(req, res) {

    var Startdate = req.query.TodayDateTime;
    var Enddate = req.query.TodayEndDateTime;
    // console.log("-------------------------************-----------------------")
    // console.log(Startdate)
    // console.log(Enddate)
    // console.log("-------------------------************-----------------------")
    PetActivityNew.findAll({
        // where: models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data),
        // where: { $and: [models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('Datetime')), data), { DeviceId: req.query.DeviceId }] },
        where: { $and: [{ DeviceId: req.query.DeviceId }, { Datetime: { $gte: Startdate } }, { Datetime: { $lte: Enddate } }] },
        // group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        order: 'Datetime ASC'
    }).then(function(response) {
        res.json(response);
    })
});

router.get('/UpdatePetroverTimeByDevice', function(req, res) {
    Pet.findOne({
        where: {
            deviceid: req.query.DeviceId
        }
    }).then(function(response) {
        if (response) {

            console.log(req.query.PetroverTime)
            response.updateAttributes({ PetroverTime: req.query.PetroverTime }).then(function(resUpdate) {
                res.json({
                    success: true,
                    message: "Battery Setting saved successfully.",
                    data: resUpdate
                });
            });
        } else {
            res.json({ success: false, message: 'Battery Setting not saved successfully.' });
        }
    })
});

router.get('/GetPetroverTimeByDevice', function(req, res) {

    //res.json({ success: true, message: '', data: '2016-08-01 00:00:00' });
    // PetActivity.findOne({
    //     where: {
    //         deviceid: req.query.DeviceId
    //     },
    //     order: 'Datetime DESC'
    // }).then(function(response) {

    //     if (response != null) {
    //         console.log(response.Datetime)
    //         res.json({ success: true, message: '', data: response.Datetime });

    //     } else {
    //         Pet.findOne({
    //             where: {
    //                 deviceid: req.query.DeviceId
    //             }
    //         }).then(function(response1) {


    //             if (response1) {
    //                 res.json({ success: true, message: '', data: response1.PetroverTime });

    //             } else {
    //                 res.json({ success: false, message: '', data: null });
    //             }
    //         })
    //     }
    // })

    PetActivityNew.findOne({
        where: {
            deviceid: req.query.DeviceId
        },
        order: 'Datetime DESC'
    }).then(function(response) {

        if (response != null) {
            res.json({ success: true, message: '', data: response.Datetime });

        } else {
            Pet.findOne({
                where: {
                    deviceid: req.query.DeviceId
                }
            }).then(function(response1) {
                if (response1) {
                    res.json({ success: true, message: '', data: response1.PetroverTime });

                } else {
                    res.json({ success: false, message: '', data: null });
                }
            })
        }
    })
});

router.get('/GetPetroverTimeByDeviceTest', function(req, res) {
    PetActivityNew.findOne({
        where: {
            deviceid: req.query.DeviceId
        },
        order: 'Datetime DESC'
    }).then(function(response) {

        if (response != null) {
            res.json({ success: true, message: '', data: response.Datetime });

        } else {
            Pet.findOne({
                where: {
                    deviceid: req.query.DeviceId
                }
            }).then(function(response1) {
                if (response1) {
                    res.json({ success: true, message: '', data: response1.PetroverTime });

                } else {
                    res.json({ success: false, message: '', data: null });
                }
            })
        }
    })

});

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    // alert(bytes[11]);
    // alert(bytes.buffer);
    return bytes;
}

function checkHex(n) {
    return /^[0-9A-Fa-f]{1,64}$/.test(n)
}

function hex2bin(n) {
    if (!checkHex(n)) {
        return 0;
    }
    var str = parseInt(n, 16).toString(2);
    if (str.length == 7) {
        str = "0" + str;
    } else if (str.length == 6) {
        str = "00" + str;
    } else if (str.length == 5) {
        str = "000" + str;
    } else if (str.length == 4) {
        str = "0000" + str;
    } else if (str.length == 3) {
        str = "00000" + str;
    } else if (str.length == 2) {
        str = "000000" + str;
    } else if (str.length == 1) {
        str = "0000000" + str;
    }
    return str;
}

function formatDate(date) {
    // console.log(date)
    var sec = date.getSeconds();
    var min = date.getMinutes();
    var hour = date.getHours();

    var year = date.getFullYear();
    var month = date.getMonth() + 1; // beware: January = 0; February = 1, etc.
    var day = date.getDate();

    //return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    return ("0000" + year.toString()).slice(-4) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2) + " " + ("00" + hour.toString()).slice(-2) + ":" + ("00" + min.toString()).slice(-2) + ":" + ("00" + sec.toString()).slice(-2);
    // return ('{0}-{1}-{3} {4}:{5}:{6}').replace('{0}', date.getFullYear()).replace('{1}', date.getMonth() + 1).replace('{3}', date.getDay()).replace('{4}', date.getHours()).replace('{5}', date.getMinutes()).replace('{6}', date.getSeconds())
}
var StartTime = new Date();
router.post('/ImportPetActivities', jsonParser, function(req, res) {
    // var data = '2afb02013136303130312c3030303030392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0500000000010000100000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0000100000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030313031332c0000000400000000000400100000002c2b3030ffff23,2afb02013136303130312c3030323031372c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030333032312c0001000000504000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0100000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030313031332c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030323031372c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030333032312c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030343032352c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030353032392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3031303033332c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0100000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030313031332c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030323031372c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030333032312c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030343032352c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030353032392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3031303033332c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030313031332c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030323031372c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030333032312c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030343032352c0000000000000000000000000000002c2b3030ffff23';
    var objPetActivity = req.body;
    var data = objPetActivity.ActivityData;
    var DeviceId = objPetActivity.DeviceId;

    console.log("------------------------------------------------")
    console.log(data)
    console.log("------------------------------------------------")



    var lstPetActivity = data.split(",");

    function AddActivity(i) {
        if (i < lstPetActivity.length) {
            var objPetActivity = {};
            var strPetActivity = lstPetActivity[i].substring(8, lstPetActivity[i].length);
            var arrPetActivity = strPetActivity.split("2c");


            if (arrPetActivity != '' && arrPetActivity != null && arrPetActivity != undefined) {
                var strDate = hexToBytes(arrPetActivity[0]);
                var strTime = hexToBytes(arrPetActivity[1]);
                var buffDate = new Buffer(strDate);
                var buffTime = new Buffer(strTime);
                // console.log("------------------------------------------------")
                // console.log(buffDate.toString('utf8'))
                // console.log(buffTime.toString('utf8'))
                // console.log("------------------------------------------------")
                var datetime = "20" + buffDate.toString('utf8') + buffTime.toString('utf8');
                var dtYear = datetime.substring(0, 4);
                var dtMonth = datetime.substring(4, 6);
                var dtDay = datetime.substring(6, 8);
                var dtTime = " " + datetime.substring(8, 10) + ":" + datetime.substring(10, 12) + ":" + datetime.substring(12, 14);
                var dt = dtYear + "-" + dtMonth + "-" + dtDay + dtTime;
                StartTime = new Date(dt);

                if (StartTime != 'Invalid Date') {
                    StartTime.setSeconds(00);
                    // console.log("Starat Date = " + StartTime);
                    //  var EndTime = new Date(dt);
                    //  EndTime = moment(EndTime).add(10, 'seconds');
                    // var parsedDate = new Date(Date.parse(dt))
                    // var EndTime = new Date(parsedDate.getTime() + (1000 * 10));



                    var strTimeZone = hexToBytes(arrPetActivity[3]);
                    var buffTimeZone = new Buffer(strTimeZone);
                    var timezone = buffTimeZone.toString('utf8').substring(0, 3);

                    var hxStatus = arrPetActivity[2];
                    var matchHxStr = hxStatus.match(/.{1,2}/g);

                    function statusRaw(j) {
                        if (j < matchHxStr.length) {
                            var strStatus = hex2bin(matchHxStr[j]);
                            var matchStr = strStatus.match(/.{1,2}/g);
                            // console.log("matchStr.length =>", matchStr.length + " " + j);

                            function SetStatus(k) {
                                if (k < matchStr.length) {

                                    if (k >= 0) {
                                        // if (timezone != "+00") {
                                        var seconds = 10;

                                        var sDateFormat = formatDate(StartTime);

                                        var newEndDate = new Date(StartTime.getTime() + (1000 * seconds))
                                        var eDateFormat = formatDate(newEndDate);


                                        objPetActivity['id'] = 0;
                                        objPetActivity['DeviceId'] = DeviceId;
                                        objPetActivity['Datetime'] = sDateFormat;
                                        objPetActivity['TimeZone'] = timezone;
                                        objPetActivity['Status'] = matchStr[k];
                                        objPetActivity['StartTime'] = sDateFormat;
                                        objPetActivity['EndTime'] = eDateFormat;
                                        // console.log("---------**************************----------------")
                                        // console.log(sDateFormat)
                                        // console.log("---------**************************----------------")

                                        PetActivity.findOrCreate({
                                                where: {
                                                    $and: [{
                                                        Datetime: sDateFormat
                                                    }, {
                                                        DeviceId: objPetActivity['DeviceId']
                                                    }]
                                                },
                                                defaults: objPetActivity
                                            }).then(function(response) {
                                                StartTime = newEndDate;
                                                SetStatus(k + 1);
                                            })
                                            // } else {
                                            //     SetStatus(k + 1);
                                            // };
                                    } else {
                                        SetStatus(k + 1);
                                    }
                                } else {
                                    statusRaw(j + 1);
                                }
                            }
                            SetStatus(0);
                        } else {
                            AddActivity(i + 1);
                        }
                    }
                    statusRaw(0);
                } else {
                    AddActivity(i + 1);
                }
            } else {
                AddActivity(i + 1);
            }
        } else {
            res.json({
                success: true,
                message: "Pet Activity created successfully...",
            });
        }
    }
    AddActivity(0);
})

router.get('/ImportPetActivitiesTest', jsonParser, function(req, res) {
    // var data = '2afb02013136303130312c3030303030392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0500000000010000100000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0000100000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030313031332c0000000400000000000400100000002c2b3030ffff23,2afb02013136303130312c3030323031372c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030333032312c0001000000504000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0100000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030313031332c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030323031372c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030333032312c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030343032352c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030353032392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3031303033332c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0100000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030313031332c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030323031372c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030333032312c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030343032352c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030353032392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3031303033332c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030303030392c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030313031332c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030323031372c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030333032312c0000000000000000000000000000002c2b3030ffff23,2afb02013136303130312c3030343032352c0000000000000000000000000000002c2b3030ffff23';
    // var objPetActivity = req.body;
    // var data = objPetActivity.ActivityData;
    var data = '2afb020137372e292e292c2e292e292f282c0000000000000000000000000000002c2d3237033b23,2afb020137372e292e292c2e292e2930272c0000000000000000000000000000002c2d3237033b23,2afb020137372e292e292c2e292f2833312c0000000000000000000000000000002c2d3237034823,2afb020137372e292e292c2e29302831302c0000000000000000000000000000002c2d3237034623,2afb020137372e292e292c2e29303135302c0000000000000000000000000000002c2d3237035323,2afb020137372e292e292c2e29313132392c0000000000000000000000000000002c2d3237035a23,2afb020137372e292e292c2e29323130392c0000000000000000000000000000002c2d3237035923,2afb02013136303832392c3131323130322c0000000000000000000000000000002c2b3030037023,2afb02013136303832392c3131333035342c0000000000000000000000000000002c2b3030037723,2afb02013136303832392c3131343033342c0000000000000000000000000000002c2b3030037623,2afb02013136303832392c3131353031332c0000000000000000000000000000002c2b3030037423,2afb02013136303832392c3131353935332c0000000000000000000000000000002c2b3030038123,2afb02013136303832392c3132303933322c0000000000000000000000000000002c2b3030037a23,2afb02013136303832392c3132313931322c0000000000000000000000000000002c2b3030037923,2afb02013136303832392c3132323835312c0000000000000000000000000000002c2b3030037c23,2afb02013136303832392c3132333833312c0000000000000000000000000000002c2b3030037b23,2afb02013136303832392c3132343831302c0000000000000000000000000000002c2b3030037923,2afb02013136303832392c3132353735302c0000000000000000000000000000002c2b3030037d23,2afb02013136303832392c3133303732392c0000000000000000000000000000002c2b3030037f23,2afb02013136303832392c3133313730392c0000000000000000000000000000002c2b3030037e23,2afb02013136303832392c3133323634382c0000000000000000000000000000002c2b3030038123,2afb02013136303832392c3133333632382c0000000000000000000000000000002c2b3030038023,2afb02013136303832392c3133343630372c0000000000000000000000000000002c2b3030037e23,2afb02013136303832392c3133353534372c0000000000000000000000000000002c2b3030038223,2afb02013136303832392c3134303532362c0000000000000000000000000000002c2b3030037b23,2afb02013136303832392c3134313530362c0000000000000000000000000000002c2b3030037a23,2afb02013136303832392c3134323434352c0000000000000000000000000000002c2b3030037d23,2afb02013136303832392c3134333432352c0000000000000000000000000000002c2b3030037c23,2afb02013136303832392c3134343430342c0000000000000000000000000000002c2b3030037a23,2afb02013136303832392c3134353334342c0000000000000000000000000000002c2b3030037e23,2afb02013136303832392c3135303332332c0000000000000000000000000000002c2b3030037723,2afb02013136303832392c3135313330332c0000000000000000000000000000002c2b3030037623,2afb02013136303832392c3135323234322c0000000000000000000000000000002c2b3030037923,2afb02013136303832392c3135333232322c0000000000000000000000000000002c2b3030037823,2afb02013136303832392c3135343230312c0000000000000000000000000000002c2b3030037623,2afb02013136303832392c3135353134312c0000000000000000000000000000002c2b3030037a23,2afb02013136303832392c3136303132302c0000000000000000000000000000002c2b3030037323,2afb02013136303832392c3136313130302c0000000000000000000000000000002c2b3030037223,2afb02013136303832392c3136323033392c0000000000000000000000000000002c2b3030037e23,2afb02013136303832392c3136333031392c0000000000000000000000000000002c2b3030037d23,2afb02013136303832392c3136333935382c0000000000000000000000000000002c2b3030038923,2afb02013136303832392c3136343933382c0000000000000000000000000000002c2b3030038823,2afb02013136303832392c3136353931372c0000000000000000000000000000002c2b3030038623,2afb02013136303832392c3137303835372c0000000000000000000000000000002c2b3030038523,2afb02013136303832392c3137313833362c0000000000000000000000000000002c2b3030038323,2afb02013136303832392c3137323831362c0000000000000000000000000000002c2b3030038223,2afb02013136303832392c3137333735352c0000000000000000000000000000002c2b3030038523,2afb02013136303832392c3137343733352c0000000000000000000000000000002c2b3030038423,2afb02013136303832392c3137353731342c0000000000000000000000000000002c2b3030038223,2afb02013136303832392c3138303635342c0000000000000000000000000000002c2b3030038123,2afb02013136303832392c3138313633332c0000000000000000000000000000002c2b3030037f23,2afb02013136303832392c3138323631332c0000000000000000000000000000002c2b3030037e23,2afb02013136303832392c3138333535322c0000000000000000000000000000002c2b3030038123,2afb02013136303832392c3138343533322c0000000000000000000000000000002c2b3030038023,2afb02013136303832392c3138353531312c0000000000000000000000000000002c2b3030037e23,2afb02013136303832392c3139303435312c0000000000000000000000000000002c2b3030037d23,2afb02013136303832392c3139313433302c0000000000000000000000000000002c2b3030037b23,2afb02013136303832392c3139323431302c0000000000000000000000000000002c2b3030037a23,2afb02013136303832392c3139333334392c0000000000000000000000000000002c2b3030038623,2afb02013136303832392c3139343332392c0000000000000000000000000000002c2b3030038523,2afb02013136303832392c3139353330382c0000000000000000000000000000002c2b3030038323,2afb02013136303832392c3230303234382c0000000000000000000000000000002c2b3030037923,2afb02013136303832392c3230313232372c0000000000000000000000000000002c2b3030037723,2afb02013136303832392c3230323230372c0000000000000000000000000000002c2b3030037623,2afb02013136303832392c3230333134362c0000000000000000000000000000002c2b3030037923,2afb02013136303832392c3230343132362c0000000000000000000000000000002c2b3030037823,2afb02013136303832392c3230353130352c0000000000000000000000000000002c2b3030037623,2afb02013136303832392c3231303034352c0000000000000000000000000000002c2b3030037523,2afb02013136303832392c3231313032342c0000000000000000000000000000002c2b3030037323,2afb02013136303832392c3231323030342c0000000000000000000000000000002c2b3030037223,2afb02013136303832392c3231323934332c0000000000000000000000000000002c2b3030037e23,2afb02013136303832392c3231333932332c0000000000000000000000000000002c2b3030037d23,2afb02013136303832392c3231343930322c0000000000000000000000000000002c2b3030037b23,2afb02013136303832392c3231353834322c0000000000000000000000000000002c2b3030037f23,2afb02013136303832392c3232303832312c0000000000000000000000000000002c2b3030037823,2afb02013136303832392c3232313830312c0000000000000000000000000000002c2b3030037723,2afb02013136303832392c3232323734302c0000000000000000000000000000002c2b3030037a23,2afb02013136303832392c3232333732302c0000000000000000000000000000002c2b3030037923,2afb02013136303832392c3232343635392c0000000000000000000000000000002c2b3030038523,2afb02013136303833302c3033343635332c0000000000000000000000000000002c2b3030037623,2afb02013136303833302c3033353633332c0000000000000000000000000000002c2b3030037523,2afb02013136303833302c3034303633372c0000000000000000000000000000002c2b3030037523,2afb02013136303833302c3034313631362c0000000000000000000000000000002c2b3030037323,2afb02013136303833302c3034323535362c0000000000000000000000000000002c2b3030037723,2afb02013136303833302c3034333533352c0000000000000000000000000000002c2b3030037523,2afb02013136303833302c3034343531352c0000000000000000000000000000002c2b3030037423,2afb02013136303833302c3034353435342c0000000000000000000000000000002c2b3030037723,2afb02013136303833302c3035303433342c0000000000000000000000000000002c2b3030037123,2afb02013136303833302c3035313431332c0000000000000000000000000000002c2b3030036f23,2afb02013136303833302c3035323335332c0000000000000000000000000000002c2b3030037323,2afb02013136303833302c3035333330372c0000000000000000000000000000002c2b3030037323,2afb02013136303833302c3035343331322c0000000000000000000000000000002c2b3030037023';
    var DeviceId = '008607550013';

    // console.log("------------------------------------------------")
    // console.log(data)
    // console.log("------------------------------------------------")

    var lstPetActivity = data.split(",");

    function AddActivity(i) {
        if (i < lstPetActivity.length) {

            var objPetActivity = {};
            var strPetActivity = lstPetActivity[i].substring(8, lstPetActivity[i].length);
            var arrPetActivity = strPetActivity.split("2c");


            if (arrPetActivity != '' && arrPetActivity != null && arrPetActivity != undefined) {

                var strDate = hexToBytes(arrPetActivity[0]);
                var strTime = hexToBytes(arrPetActivity[1]);
                var buffDate = new Buffer(strDate);
                var buffTime = new Buffer(strTime);
                // console.log("------------------------------------------------")
                // console.log(buffDate.toString('utf8'))
                // console.log(buffTime.toString('utf8'))
                // console.log("------------------------------------------------")
                var datetime = "20" + buffDate.toString('utf8') + buffTime.toString('utf8');
                var dtYear = datetime.substring(0, 4);
                var dtMonth = datetime.substring(4, 6);
                var dtDay = datetime.substring(6, 8);
                var dtTime = " " + datetime.substring(8, 10) + ":" + datetime.substring(10, 12) + ":" + datetime.substring(12, 14);
                var dt = dtYear + "-" + dtMonth + "-" + dtDay + dtTime;
                StartTime = new Date(dt);
                StartTime.setSeconds(00);
                console.log(StartTime)
                if (StartTime != 'Invalid Date') {
                    //  var EndTime = new Date(dt);
                    //  EndTime = moment(EndTime).add(10, 'seconds');
                    // var parsedDate = new Date(Date.parse(dt))
                    // var EndTime = new Date(parsedDate.getTime() + (1000 * 10));



                    var strTimeZone = hexToBytes(arrPetActivity[3]);
                    var buffTimeZone = new Buffer(strTimeZone);
                    var timezone = buffTimeZone.toString('utf8').substring(0, 3);

                    var hxStatus = arrPetActivity[2];
                    var matchHxStr = hxStatus.match(/.{1,2}/g);

                    function statusRaw(j) {
                        if (j < matchHxStr.length) {
                            var strStatus = hex2bin(matchHxStr[j]);
                            var matchStr = strStatus.match(/.{1,2}/g);
                            // console.log("matchStr.length =>", matchStr.length + " " + j);

                            function SetStatus(k) {
                                if (k < matchStr.length) {

                                    if (k >= 0) {
                                        // if (timezone != "+00") {
                                        var seconds = 10;

                                        var sDateFormat = formatDate(StartTime);

                                        var newEndDate = new Date(StartTime.getTime() + (1000 * seconds))
                                        var eDateFormat = formatDate(newEndDate);


                                        objPetActivity['id'] = 0;
                                        objPetActivity['DeviceId'] = DeviceId;
                                        objPetActivity['Datetime'] = sDateFormat;
                                        objPetActivity['TimeZone'] = timezone;
                                        objPetActivity['Status'] = matchStr[k];
                                        objPetActivity['StartTime'] = sDateFormat;
                                        objPetActivity['EndTime'] = eDateFormat;
                                        console.log("---------**************************----------------")
                                        console.log(sDateFormat)
                                        console.log("---------**************************----------------")

                                        PetActivity.findOrCreate({
                                            where: {
                                                $and: [{
                                                    Datetime: sDateFormat
                                                }, {
                                                    DeviceId: objPetActivity['DeviceId']
                                                }]
                                            },
                                            defaults: objPetActivity
                                        }).then(function(response) {
                                            StartTime = newEndDate;
                                            SetStatus(k + 1);
                                        })

                                        // StartTime = newEndDate;
                                        // SetStatus(k + 1);

                                        // } else {
                                        //     SetStatus(k + 1);
                                        // };
                                    } else {
                                        SetStatus(k + 1);
                                    }
                                } else {
                                    statusRaw(j + 1);
                                }
                            }
                            SetStatus(0);
                        } else {
                            AddActivity(i + 1);
                        }
                    }
                    statusRaw(0);
                } else {
                    AddActivity(i + 1);
                }
            } else {
                AddActivity(i + 1);
            }
        } else {
            res.json({
                success: true,
                message: "Pet Activity created successfully...",
            });
        };
    }
    AddActivity(0);
})

var PetActivityNew = models.tblpetactivitynew;
router.post('/ImportPetActivitiesNew', jsonParser, function(req, res) {
    //router.get('/ImportPetActivitiesNew', jsonParser, function(req, res) {
    // var data = '2afb02040007e00916080523200517017223,2afb02040007e00916080f23120327017c23,2afb02040007e0091608191d310209018023,2afb02040007e009160823242a050d019123';
    // var data = '2afb02040007e00916080523200517017223,2afb02040007e00916080f23120327017c23,2afb02040007e0091608191d310209018023,2afb02040007e009160823242a050d019123';
    // var DeviceId = '008607550001';

    var objPetActivity = req.body;
    var data = objPetActivity.ActivityData;
    var DeviceId = objPetActivity.DeviceId;

    console.log("------------------------------------------------")
    console.log(data)
    console.log("------------------------------------------------")

    var lstPetActivity = data.split(",");

    function AddActivity(i) {
        if (i < lstPetActivity.length) {
            var line = lstPetActivity[i];
            var TimeZone = parseInt(line.substring(8, 10), 16);
            // console.log(line.substring(8, 10))
            // console.log(line.substring(10, 14))
            var Year = parseInt(line.substring(10, 14), 16);
            var Month = parseInt(line.substring(14, 16), 16);
            var day = parseInt(line.substring(16, 18), 16);
            var hour = parseInt(line.substring(18, 20), 16);
            var min = Math.round(parseInt(line.substring(20, 22), 16) / 10) * 10;
            var sec = parseInt(line.substring(22, 24), 16);
            var TotalRest = parseInt(line.substring(24, 26), 16) * 10;
            var TotalWalk = parseInt(line.substring(26, 28), 16) * 10;
            var TotalRun = parseInt(line.substring(28, 30), 16) * 10;
            var calibration = parseInt(line.substring(30, 34), 16);
            if (min == 60) {
                min = 0;
            };
            console.log("------------------------------------------------")
            console.log("Date = " + ("0000" + Year.toString()).slice(-4) + "-" + ("00" + Month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2) + " " + ("00" + hour.toString()).slice(-2) + ":" + ("00" + min.toString()).slice(-2) + ":" + ("00" + sec.toString()).slice(-2) + " +" + ("00" + TimeZone.toString()).slice(-2));
            // // console.log("Rest = " + rest + ", Walk = " + walk + ", Run = " + run);
            console.log("------------------------------------------------")
            var Datetime = ("0000" + Year.toString()).slice(-4) + "-" + ("00" + Month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2) + " " + ("00" + hour.toString()).slice(-2) + ":" + ("00" + min.toString()).slice(-2) + ":00";
            var objPetActivity = new Object();
            objPetActivity.DeviceId = DeviceId;
            objPetActivity.Datetime = Datetime;
            objPetActivity.TimeZone = "+" + ("00" + TimeZone.toString()).slice(-2);
            objPetActivity.TotalRest = TotalRest;
            objPetActivity.TotalWalk = TotalWalk;
            objPetActivity.TotalRun = TotalRun;
            objPetActivity.calibration = calibration;
            PetActivityNew.findOrCreate({
                where: {
                    $and: [{
                        Datetime: Datetime
                    }, {
                        DeviceId: objPetActivity.DeviceId
                    }]
                },
                defaults: objPetActivity
            }).then(function(response) {
                AddActivity(i + 1);
            })


        } else {
            res.json({
                success: true,
                message: "Pet Activity created successfully...",
            });
        };
    }
    AddActivity(0);
})

router.get('/ChangeOldPetActivitiesNew', jsonParser, function(req, res) {
    PetActivityNew.findAll().then(function(response) {
        function Edit(i) {
            if (i < response.length) {
                var objPetActivity = response[i];
                var Datetime = new Date(objPetActivity.Datetime);
                Datetime.setMinutes(Math.round((Datetime.getMinutes()) / 10) * 10);
                Datetime.setSeconds(00);
                // objPetActivity.Datetime = Datetime;
                objPetActivity.updateAttributes({ Datetime: Datetime }).then(function(resUpdate) {
                    Edit(i + 1);
                });


            } else {
                res.send("success");
            }
        }
        Edit(0)
    })
});


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
    } else if (flg == "Excel Export") {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
    } else {
        //return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}


router.get('/GetAllActivityByWeekDate', function(req, res) {

    var date1 = new Date(req.query.StartDate);
    var date2 = new Date(req.query.StartDate);
    var Startdata = date1.addDays(-7);
    var Enddata = date2.addDays(2);
    // console.log("------------####################-------------------")
    // console.log(Startdata)
    // console.log(Enddata)
    // console.log("------------####################-------------------")

    var search = {};
    search["$and"] = [];

    var obj1 = new Object();
    obj1['DeviceId'] = { $like: req.query.DeviceId };
    search["$and"].push(obj1);

    if (Startdata != '' && Enddata != '') {
        // Startdata = convertdateformat(Startdata, 0);
        // Enddata = convertdateformat(Enddata, 1);
        var obj = new Object();
        obj['Datetime'] = {
            $between: [Startdata, Enddata]
        };
        search['$and'].push(obj);
        //search['$and'].push(obj1);
    }

    PetActivity.findAll({
        where: search,
        //group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        //order: 'Datetime ASC'
    }).then(function(response) {
        res.json(response);
    })
});

router.get('/GetAllActivityNewByWeekDate', function(req, res) {

    var date1 = new Date(req.query.StartDate);
    var date2 = new Date(req.query.StartDate);
    var Startdata = date1.addDays(-7);
    var Enddata = date2.addDays(2);


    var search = {};
    search["$and"] = [];

    var obj1 = new Object();
    obj1['DeviceId'] = { $like: req.query.DeviceId };
    search["$and"].push(obj1);

    if (Startdata != '' && Enddata != '') {
        // Startdata = convertdateformat(Startdata, 0);
        // Enddata = convertdateformat(Enddata, 1);
        var obj = new Object();
        obj['Datetime'] = {
            $between: [Startdata, Enddata]
        };
        search['$and'].push(obj);
        //search['$and'].push(obj1);
    }

    PetActivityNew.findAll({
        where: search,
        //group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        //order: 'Datetime ASC'
    }).then(function(response) {
        res.json(response);
    })
});

router.get('/GetAllActivityByDeviceId', function(req, res) {
    PetActivity.findAll({
        where: { DeviceId: req.query.DeviceId },
        group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        //order: 'Datetime ASC'
    }).then(function(response) {
        res.json(response);
    })
});

router.get('/GetAllActivityNewByDeviceId', function(req, res) {
    PetActivityNew.findAll({
        where: { DeviceId: req.query.DeviceId },
        group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
        //order: 'Datetime ASC'
    }).then(function(response) {
        res.json(response);
    })
});

router.get('/getAllSOS', function(req, res) {
    SOS.findOne({
        where: {
            deviceid: req.query.deviceId
        }
    }).then(function(response) {
        if (response != null) {
            res.json({
                success: true,
                message: "Record found...",
                data: response
            });
        } else {
            res.json(RecordNotFound);
        }
    })
})

router.post('/setSOS', jsonParser, function(req, res) {
    var objSOS = req.body;

    var obj = new Object();
    obj.Type = objSOS.flgNotification;
    obj.DeviceId = objSOS.deviceid;

    if (objSOS.sosNumbers.substring(0, 1) == ',') {
        obj.Numbers = objSOS.sosNumbers.substring(1, objSOS.sosNumbers.length)
    }

    if (objSOS.sosNumbers.substring(objSOS.sosNumbers.length - 1) == ',') {
        obj.Numbers = objSOS.sosNumbers.substring(0, objSOS.sosNumbers.length - 1)
    }

    global.sendSOSNumbers(obj, function(response) {
        if (response.success == true) {
            if (objSOS.id == 0) {
                SOS.findOrCreate({ where: { deviceid: objSOS.deviceid }, defaults: objSOS }).then(function(response) {
                    if ((response[1])) {
                        res.json({ success: true, message: "SOS Numbers created successfully...", data: response });
                    } else {
                        res.json({ success: false, message: "SOS Numbers is already Exist...", data: response });
                    }
                })
            } else {
                SOS.findOne({ where: { deviceid: objSOS.deviceid }, defaults: objSOS }).then(function(objSOSExist) {
                    if (objSOSExist != null && objSOS.id != objSOSExist.id) {
                        res.json({ success: false, message: "SOS Numbers is already Exist...", data: objSOSExist });
                    } else {
                        SOS.update(objSOS, { where: { id: objSOS.id } }).then(function(response) {
                            if (response[0]) {
                                res.json({ success: true, message: "SOS Numbers updated successfully...", data: response });
                            }
                        })
                    }
                })
            }
        } else {
            res.json(response);
        }
    })
});

function convertdateformatForUnix(date1) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    return ("00" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

}

router.post('/SaveVehicle', jsonParser, function(req, res) {
    objPet = req.body;
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
                    if (objPet.deviceid != '' && objPet.deviceid != null) {
                        PetDevice.findOne({
                            where: {
                                DeviceId: objPet.deviceid,
                            }
                        }).then(function(objPetDevice) {
                            if (objPetDevice != null) {
                                if (objPet.id == 0) {
                                    objPet.IsOnline = false;
                                    objPet.CreatedDate = GetCurrentDate();
                                    objPet.DeviceType = objPetDevice.Type;
                                    Vehicle.findOne({
                                        where: {
                                            deviceid: objPet.deviceid,
                                            IsDelete: true
                                        }
                                    }).then(function(objPetExist) {
                                        if (objPetExist) {
                                            objPet.id = objPetExist.id;
                                            Vehicle.update(objPet, {
                                                where: {
                                                    id: objPet.id
                                                }
                                            }).then(function(response) {
                                                if (response[0]) {
                                                    funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
                                                    res.json({
                                                        success: true,
                                                        message: "Vehicle created successfully...",
                                                        data: objPet
                                                    });
                                                }
                                            })
                                        } else {
                                            Vehicle.findOne({
                                                where: {
                                                    deviceid: objPet.deviceid,
                                                    IsDelete: false
                                                }
                                            }).then(function(objNewPetExist) {
                                                if (objNewPetExist) {
                                                    res.json({
                                                        success: false,
                                                        message: "Tracker No. is already assign to other Vehicle...",
                                                        data: null
                                                    });
                                                } else {
                                                    Vehicle.create(objPet).then(function(response) {
                                                        if (response) {
                                                            funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
                                                            res.json({
                                                                success: true,
                                                                message: "Vehicle created successfully...",
                                                                data: response
                                                            });
                                                        } else {
                                                            res.json({
                                                                success: false,
                                                                message: "Tracker No. is already assign to other Vehicle...",
                                                                data: null
                                                            });
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    Vehicle.findOne({
                                        where: {
                                            deviceid: objPet.deviceid
                                        }
                                    }).then(function(objPetExist) {
                                        if (objPetExist != null && objPetExist.id != objPet.id && objPetExist.IsDeleted == false) {
                                            res.json({
                                                success: false,
                                                message: "Tracker No. is already assign to other Vehicle...",
                                                data: objPetExist
                                            });
                                        } else {
                                            Vehicle.update(objPet, {
                                                where: {
                                                    id: objPet.id
                                                }
                                            }).then(function(response) {
                                                if (response[0]) {
                                                    funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Update Vehicle');
                                                    res.json({
                                                        success: true,
                                                        message: "Vehicle updated successfully...",
                                                        data: objPet
                                                    });
                                                }
                                            })
                                        }
                                    })
                                }
                            } else {
                                res.json({
                                    success: false,
                                    message: "Invalid Tracker No., Please insert valid Tracker No.",
                                    data: ""
                                });
                            }
                        })
                    } else {
                        if (objPet.id == 0) {
                            objPet.IsOnline = false;
                            objPet.HandshakDatetime = null;
                            objPet.CreatedDate = GetCurrentDate();
                            Vehicle.create(objPet).then(function(response) {
                                if (response) {
                                    funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
                                    res.json({
                                        success: true,
                                        message: "Vehicle created successfully...",
                                        data: response
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: "Tracker No. is already assign to other pet...",
                                        data: null
                                    });
                                }
                            })
                        } else {
                            Vehicle.findOne({
                                where: {
                                    id: objPet.id
                                }
                            }).then(function(objPetExist) {
                                if (objPetExist != null && objPetExist.id != objPet.id && objPetExist.IsDelete == false) {
                                    res.json({
                                        success: false,
                                        message: "Tracker No. is already assign to other Vehicle...",
                                        data: objPetExist
                                    });
                                } else {
                                    Vehicle.update(objPet, {
                                        where: {
                                            id: objPet.id
                                        }
                                    }).then(function(response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Update Vehicle');
                                            res.json({
                                                success: true,
                                                message: "Vehicle updated successfully...",
                                                data: objPet
                                            });
                                        }
                                    })
                                }
                            })
                        }
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