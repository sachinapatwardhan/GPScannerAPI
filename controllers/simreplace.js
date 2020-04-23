var router = express.Router();
var SimReplace = models.tblsimreplace;
var SimDetail = models.tblsimdetails;
var Vehicle = models.tblvehicle;
var GPSDevice = models.tblgpsdevice;
var LicenceManager = models.tbllicencemanager;
var User = models.tbluserinformation;

router.post('/GetAllSim', jsonParser, function (req, res) {
    var idApp = req.body.idApp;
    var wherecondition = "";
    if (idApp != null && idApp != undefined && idApp != '') {
        wherecondition = " Where idApp='" + idApp + "' ";
    }
    var query = " SELECT SerialNum,CreatedDate FROM tblsimdetails " + wherecondition +
        // "Left outer join tblappinfo on tblappinfo.Id= tblsimdetails.idApp " +
        "Group by SerialNum ORDER BY CreatedDate ";
    connection.query(query, function (err, response) {
        if (response.length) {
            res.json({
                success: true,
                message: 'Record(s) found',
                data: response
            });
        } else {
            res.json({
                success: false,
                message: err,
                data: response
            });
        }
    })
})

router.get('/GetAllDyanmicSimReplace', function (req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = '';

    if (objSearch != null && objSearch != '') {
        search = ' Where (ts.OldSim like "%' + objSearch + '%" or ';
        search = search + 'ts.NewSim like "%' + objSearch + '%" or ';
        search = search + 'ts.idApp like "%' + objSearch + '%" or ';
        search = search + 'ts.CreatedBy like "%' + objSearch + '%" or ';
        search = search + 'ts.CreatedDate like "%' + objSearch + '%") ';
    };

    var query = "SELECT ts.* " +
        " FROM tblsimreplace as ts " + search +
        " order by " + Orderby +
        " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    console.log(query)
    var countquery = "SELECT count(*) as TotalRecord " +
        " from tblsimreplace as ts " + search;
    connection.query(query, function (err, response) {
        if (response != undefined) {
            connection.query(countquery, function (err, lstCount, fields) {
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

router.post('/SaveSimReplace', jsonParser, function (req, res) {
    var objParam = req.body;
    objHeader = req.headers;
    // var DeviceList = req.query.DeviceList;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: { username: decoded.username, password: decoded.password }
        }).then(function (UserExist) {
            if (UserExist != null) {

                var wherecondition1 = "";
                var wherecondition2 = "";
                if (objParam.OldSim != null && objParam.OldSim != undefined && objParam.OldSim != '') {
                    wherecondition1 += " WHERE SerialNum='" + objParam.OldSim + "' ";
                }

                if (objParam.NewSim != null && objParam.NewSim != undefined && objParam.NewSim != '') {
                    wherecondition2 += " WHERE SerialNum='" + objParam.NewSim + "' ";
                }
                var query1 = " SELECT id,SerialNum FROM tblsimdetails " + wherecondition1;
                connection.query(query1, function (err, OldSimExist) {

                    if (OldSimExist != null && OldSimExist.length > 0) {

                        var query2 = " SELECT id,SerialNum FROM tblsimdetails " + wherecondition2;
                        connection.query(query2, function (err, NewSimExist) {
                            if (NewSimExist != null && NewSimExist.length > 0) {
                                var obj = new Object();
                                obj.OldSim = objParam.OldSim;
                                obj.NewSim = objParam.NewSim;
                                obj.CreatedBy = UserExist.username;
                                obj.CreatedDate = new Date();

                                SimReplace.create(obj).then(function (ressim) {
                                    if (ressim) {
                                        GPSDevice.findOne({ where: { idSim: OldSimExist[0].id } }).then(function (OldGPSDeviceExist) {
                                            if (OldGPSDeviceExist) {
                                                GPSDevice.findOne({ where: { idSim: NewSimExist[0].id } }).then(function (NewGPSDeviceExist) {
                                                    if (NewGPSDeviceExist) {
                                                        NewGPSDeviceExist.updateAttributes({ idSim: null }).then(function (updateNewGpsDevice) {

                                                        })
                                                    }
                                                    var idSim = NewSimExist[0].id;
                                                    OldGPSDeviceExist.updateAttributes({ idSim: idSim }).then(function (updateOldGpsDevice) {
                                                        if (updateOldGpsDevice) {
                                                            SimDetail.findOne({ where: { SerialNum: objParam.OldSim } }).then(function (SimExist) {
                                                                if (SimExist) {
                                                                    SimExist.updateAttributes({ Status: 'Spoil', SpoilDate: new Date() }).then(function (Updated) {
                                                                        if (Updated) {

                                                                            Vehicle.findOne({ where: { deviceid: OldGPSDeviceExist.DeviceId, IsDelete: 0 } }).then(function (VehicleExist) {
                                                                                SimDetail.update({ StartDate: new Date(), Status: null, SpoilDate: null }, { where: { SerialNum: objParam.NewSim } }).then(function (NewSimUpdated) {
                                                                                    res.json({ success: true, message: "New SIM replace successfully..." })
                                                                                })
                                                                            })
                                                                        } else {
                                                                            res.json({ success: false, message: "Device Vehicel not replace..." })
                                                                        }
                                                                    })
                                                                } else {
                                                                    res.json({ success: true, message: "New SIM replace successfully..." })
                                                                }
                                                            })
                                                        } else { res.json({ success: false, message: "Old SIM not updated..." }) }
                                                    })
                                                })

                                            } else { res.json({ success: false, message: "Old SIM not exist in Gps Device..." }) }
                                        })

                                    } else {
                                        res.json({ success: false, message: "SIM not replace successfully..." })
                                    }
                                })
                            } else {
                                res.json({ success: false, message: "New SIM not exist..." })
                            }
                        })
                    } else {
                        res.json({ success: false, message: "Old SIM not exist..." })
                    }
                })
            } else { res.json(InvalidToken); }
        })
    } else { res.json(InvalidToken); }

})

router.post('/SaveSimReplaceMDetail', jsonParser, function (req, res) {
    var objParam = req.body;
    var wherecondition1 = "";
    var wherecondition2 = "";
    if (objParam.OldSim != null && objParam.OldSim != undefined && objParam.OldSim != '') {
        wherecondition1 += " WHERE SerialNum='" + objParam.OldSim + "' ";
    }
    if (objParam.NewSim != null && objParam.NewSim != undefined && objParam.NewSim != '') {
        wherecondition2 += " WHERE SerialNum='" + objParam.NewSim + "' ";
    }
    var query1 = " SELECT id,SerialNum FROM tblsimdetails " + wherecondition1;
    connection.query(query1, function (err, OldSimExist) {
        if (OldSimExist != null && OldSimExist.length > 0) {
            var query2 = " SELECT id,SerialNum FROM tblsimdetails " + wherecondition2;
            connection.query(query2, function (err, NewSimExist) {
                if (NewSimExist != null && NewSimExist.length > 0) {
                    var obj = new Object();
                    obj.OldSim = objParam.OldSim;
                    obj.NewSim = objParam.NewSim;
                    obj.CreatedBy = 'MDetail';
                    obj.CreatedDate = new Date();

                    SimReplace.create(obj).then(function (ressim) {
                        if (ressim) {
                            GPSDevice.findOne({ where: { idSim: OldSimExist[0].id } }).then(function (OldGPSDeviceExist) {
                                if (OldGPSDeviceExist) {
                                    GPSDevice.findOne({ where: { idSim: NewSimExist[0].id } }).then(function (NewGPSDeviceExist) {
                                        if (NewGPSDeviceExist) {
                                            NewGPSDeviceExist.updateAttributes({ idSim: null }).then(function (updateNewGpsDevice) { })
                                        }
                                        var idSim = NewSimExist[0].id;
                                        OldGPSDeviceExist.updateAttributes({ idSim: idSim }).then(function (updateOldGpsDevice) {
                                            if (updateOldGpsDevice) {
                                                SimDetail.findOne({ where: { SerialNum: objParam.OldSim } }).then(function (SimExist) {
                                                    if (SimExist) {
                                                        SimExist.updateAttributes({ Status: 'Spoil', SpoilDate: new Date() }).then(function (Updated) {
                                                            if (Updated) {
                                                                Vehicle.findOne({ where: { deviceid: OldGPSDeviceExist.DeviceId, IsDelete: 0 } }).then(function (VehicleExist) {
                                                                    SimDetail.update({ StartDate: new Date(), Status: null, SpoilDate: null }, { where: { SerialNum: objParam.NewSim } }).then(function (NewSimUpdated) {
                                                                        res.json({ success: true, message: "New SIM replace successfully..." })
                                                                    })
                                                                })
                                                            } else {
                                                                res.json({ success: false, message: "Device Vehicel not replace..." })
                                                            }
                                                        })
                                                    } else {
                                                        res.json({ success: true, message: "New SIM replace successfully..." })
                                                    }
                                                })
                                            } else { res.json({ success: false, message: "Old SIM not updated..." }) }
                                        })
                                    })
                                } else { res.json({ success: false, message: "Old SIM not exist in Gps Device..." }) }
                            })
                        } else {
                            res.json({ success: false, message: "SIM not replace successfully..." })
                        }
                    })
                } else {
                    res.json({ success: false, message: "New SIM not exist..." })
                }
            })
        } else {
            res.json({ success: false, message: "Old SIM not exist..." })
        }
    })
})
module.exports = router