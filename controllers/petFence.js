//Tables
var router = express.Router();
var geolib = require("geolib");
var User = models.tbluserinformation;
var Fence = models.tblfence;
var PetGPS = models.tblgpsdata;
var Bike = models.tblvehicle;
//End of Tables

router.get('/GetAllFence', function(req, res) {
    Fence.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/IsPetInFence', function(req, res) {
    Fence.findOne({
        where: {
            deviceId: req.query.deviceId
        }
    }).then(function(response) {
        if (response != null) {
            var lat = response.lat.split(",");
            var lng = response.lng.split(",");
            var lstLatLng = [];

            function uploader(i) {
                if (i < lat.length) {
                    var objLatLng = {
                        latitude: lat[i],
                        longitude: lng[i]
                    }
                    lstLatLng.push(objLatLng);
                    uploader(i + 1);
                } else {
                    var val = geolib.isPointInside({
                        latitude: req.query.lat,
                        longitude: req.query.lng
                    }, lstLatLng);
                    if (val) {
                        res.json({
                            success: val,
                            message: "Pet is inside in Fence..."
                        });
                    } else {
                        res.json({
                            success: val,
                            message: "Pet is outside in Fence..."
                        });
                    }
                }

            }
            uploader(0);
        } else {
            res.json(RecordNotFound);
        }
    })
})

router.get('/GetFenceByPet', function(req, res) {
    Fence.findOne({
        where: {
            deviceId: req.query.deviceId
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

router.get('/GetAllFenceByVehicle', function(req, res) {
    Fence.findAll({
        where: {
            deviceId: req.query.deviceId
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

router.get('/GetFenceById', function(req, res) {

    Fence.findOne({
        where: {
            id: req.query.idFence
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

router.post('/SaveFence', jsonParser, function(req, res) {
    objFence = req.body;
    // objHeader = req.headers;
    // var token = getToken(objHeader);
    // if (token) {
    //     var decoded = jwt.decode(token, TokenKey);
    //     User.findOne({
    //         where: {
    //             username: decoded.username,
    //             password: decoded.password
    //         }
    //     }).then(function(UserExist) {
    //         if (UserExist != null) {
    Fence.findOrCreate({
        where: {
            deviceId: objFence.deviceId
        },
        defaults: objFence
    }).then(function(response) {
        if ((response[1])) {
            var IsPetInFence = true;

            PetGPS.findOne({
                where: {
                    DeviceId: objFence.deviceId
                },
                order: 'id DESC'
            }).then(function(response) {
                if (response != null) {

                    var CheckPoints = {
                        latitude: parseFloat(response.Latitude),
                        longitude: parseFloat(response.Longitude)
                    }

                    if (objFence.fencedraw == "circle") {
                        var CircleCenterPoints = {
                            latitude: parseFloat(objFence.lat),
                            longitude: parseFloat(objFence.lng)
                        }
                        var CircleRadius = parseFloat(objFence.range);
                        IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)

                        // console.log("IsPetIn Fence - " + IsPetInFence)
                    } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                        var lstpolygonDrawC = [];
                        var lstlatC = objFence.lat.split(',');
                        var lstlngC = objFence.lng.split(',');

                        for (var i = 0; i < lstlatC.length; i++) {
                            var objDraw = {
                                latitude: parseFloat(lstlatC[i]),
                                longitude: parseFloat(lstlngC[i])
                            }
                            lstpolygonDrawC.push(objDraw);
                        }
                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                            // console.log("IsPetIn Fence - " + IsPetInFence)
                    } else if (objFence.fencedraw == "rectangle") {
                        var lstpolygonDrawC = [];
                        var lstlatC = objFence.lat.split(',');
                        var lstlngC = objFence.lng.split(',');


                        var objDraw = {
                            latitude: parseFloat(lstlatC[0]),
                            longitude: parseFloat(lstlngC[0])
                        }
                        lstpolygonDrawC.push(objDraw);
                        var objDraw = {
                            latitude: parseFloat(lstlatC[0]),
                            longitude: parseFloat(lstlngC[1])
                        }
                        lstpolygonDrawC.push(objDraw);
                        var objDraw = {
                            latitude: parseFloat(lstlatC[1]),
                            longitude: parseFloat(lstlngC[1])
                        }
                        lstpolygonDrawC.push(objDraw);
                        var objDraw = {
                            latitude: parseFloat(lstlatC[1]),
                            longitude: parseFloat(lstlngC[0])
                        }
                        lstpolygonDrawC.push(objDraw);
                        var objDraw = {
                            latitude: parseFloat(lstlatC[0]),
                            longitude: parseFloat(lstlngC[0])
                        }
                        lstpolygonDrawC.push(objDraw);

                        // console.log(lstpolygonDrawC)
                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                            // console.log("Sqre IsPetIn Fence - " + IsPetInFence)
                    };
                }

                Bike.findOne({
                    where: {
                        deviceid: objFence.deviceId
                    }
                }).then(function(objPet) {
                    objPet.updateAttributes({ IsInFence: IsPetInFence }).then(function(resUpdate) {
                        // funAuditLog.CreateAuditLog('SaveFence', UserExist.username , 'Delete Pet Tracking');
                        res.json({
                            success: true,
                            message: "Fence created successfully...",
                            data: response
                        });
                    });
                })

            })
        } else {
            Fence.update(objFence, {
                where: {
                    deviceId: objFence.deviceId
                }
            }).then(function(response) {
                var IsPetInFence = true;
                PetGPS.findOne({
                    where: {
                        DeviceId: objFence.deviceId
                    },
                    order: 'id DESC'
                }).then(function(response) {
                    if (response != null) {
                        var CheckPoints = {
                                latitude: parseFloat(response.Latitude),
                                longitude: parseFloat(response.Longitude)
                            }
                            // var IsPetInFence = true;

                        if (objFence.fencedraw == "circle") {
                            var CircleCenterPoints = {
                                latitude: parseFloat(objFence.lat),
                                longitude: parseFloat(objFence.lng)
                            }
                            var CircleRadius = parseFloat(objFence.range);
                            IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)

                            // console.log("IsPetIn Fence - " + IsPetInFence)
                        } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                            var lstpolygonDrawC = [];
                            var lstlatC = objFence.lat.split(',');
                            var lstlngC = objFence.lng.split(',');

                            for (var i = 0; i < lstlatC.length; i++) {
                                var objDraw = {
                                    latitude: parseFloat(lstlatC[i]),
                                    longitude: parseFloat(lstlngC[i])
                                }
                                lstpolygonDrawC.push(objDraw);
                            }
                            IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                // console.log("IsPetIn Fence - " + IsPetInFence)
                        } else if (objFence.fencedraw == "rectangle") {
                            var lstpolygonDrawC = [];
                            var lstlatC = objFence.lat.split(',');
                            var lstlngC = objFence.lng.split(',');


                            var objDraw = {
                                latitude: parseFloat(lstlatC[0]),
                                longitude: parseFloat(lstlngC[0])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[0]),
                                longitude: parseFloat(lstlngC[1])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[1]),
                                longitude: parseFloat(lstlngC[1])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[1]),
                                longitude: parseFloat(lstlngC[0])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[0]),
                                longitude: parseFloat(lstlngC[0])
                            }
                            lstpolygonDrawC.push(objDraw);

                            // console.log(lstpolygonDrawC)
                            IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                // console.log("Sqre IsPetIn Fence - " + IsPetInFence)
                        };
                    }

                    Bike.findOne({
                        where: {
                            deviceid: objFence.deviceId
                        }
                    }).then(function(objPet) {
                        objPet.updateAttributes({ IsInFence: IsPetInFence }).then(function(resUpdate) {
                            res.json({
                                success: true,
                                message: "Fence updated successfully...",
                                data: response
                            });
                        });
                    })

                })
            })
        }
    })

    //         } else {
    //             res.json(InvalidToken);
    //         }
    //     })
    // } else {
    //     res.json(InvalidToken);
    // }
});

router.post('/SaveFenceById', jsonParser, function(req, res) {
    objFence = req.body;
    Fence.findOrCreate({
        where: {
            id: objFence.idFence
        },
        defaults: objFence
    }).then(function(resFence) {
        if ((resFence[1])) {
            var IsPetInFence = true;
            PetGPS.findOne({
                where: {
                    DeviceId: objFence.deviceId
                },
                order: 'id DESC'
            }).then(function(response) {
                if (response != null) {

                    var CheckPoints = {
                        latitude: parseFloat(response.Latitude),
                        longitude: parseFloat(response.Longitude)
                    }

                    if (objFence.fencedraw == "circle") {
                        var CircleCenterPoints = {
                            latitude: parseFloat(objFence.lat),
                            longitude: parseFloat(objFence.lng)
                        }
                        var CircleRadius = parseFloat(objFence.range);
                        IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                    } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                        var lstpolygonDrawC = [];
                        var lstlatC = objFence.lat.split(',');
                        var lstlngC = objFence.lng.split(',');

                        for (var i = 0; i < lstlatC.length; i++) {
                            var objDraw = {
                                latitude: parseFloat(lstlatC[i]),
                                longitude: parseFloat(lstlngC[i])
                            }
                            lstpolygonDrawC.push(objDraw);
                        }
                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                    } else if (objFence.fencedraw == "rectangle") {
                        var lstpolygonDrawC = [];
                        var lstlatC = objFence.lat.split(',');
                        var lstlngC = objFence.lng.split(',');


                        var objDraw = {
                            latitude: parseFloat(lstlatC[0]),
                            longitude: parseFloat(lstlngC[0])
                        }
                        lstpolygonDrawC.push(objDraw);
                        var objDraw = {
                            latitude: parseFloat(lstlatC[0]),
                            longitude: parseFloat(lstlngC[1])
                        }
                        lstpolygonDrawC.push(objDraw);
                        var objDraw = {
                            latitude: parseFloat(lstlatC[1]),
                            longitude: parseFloat(lstlngC[1])
                        }
                        lstpolygonDrawC.push(objDraw);
                        var objDraw = {
                            latitude: parseFloat(lstlatC[1]),
                            longitude: parseFloat(lstlngC[0])
                        }
                        lstpolygonDrawC.push(objDraw);
                        var objDraw = {
                            latitude: parseFloat(lstlatC[0]),
                            longitude: parseFloat(lstlngC[0])
                        }
                        lstpolygonDrawC.push(objDraw);

                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                    };
                }
                // Bike.findOne({
                //     where: {
                //         deviceid: objFence.deviceId
                //     }
                // }).then(function(objPet) {
                objFence.IsInFence = IsPetInFence;
                Fence.update(objFence, {
                    where: {
                        id: objFence.id
                    }
                }).then(function(resUpdate) {
                    // funAuditLog.CreateAuditLog('SaveFence', UserExist.username , 'Delete Pet Tracking');
                    res.json({
                        success: true,
                        message: "Fence created successfully...",
                        data: resUpdate
                    });
                });
                // })
            })
        } else {
            Fence.update(objFence, {
                where: {
                    id: objFence.idFence
                }
            }).then(function(resFence) {
                var IsPetInFence = true;
                PetGPS.findOne({
                    where: {
                        DeviceId: objFence.deviceId
                    },
                    order: 'id DESC'
                }).then(function(response) {
                    if (response != null) {
                        var CheckPoints = {
                            latitude: parseFloat(response.Latitude),
                            longitude: parseFloat(response.Longitude)
                        }
                        if (objFence.fencedraw == "circle") {
                            var CircleCenterPoints = {
                                latitude: parseFloat(objFence.lat),
                                longitude: parseFloat(objFence.lng)
                            }
                            var CircleRadius = parseFloat(objFence.range);
                            IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                        } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                            var lstpolygonDrawC = [];
                            var lstlatC = objFence.lat.split(',');
                            var lstlngC = objFence.lng.split(',');

                            for (var i = 0; i < lstlatC.length; i++) {
                                var objDraw = {
                                    latitude: parseFloat(lstlatC[i]),
                                    longitude: parseFloat(lstlngC[i])
                                }
                                lstpolygonDrawC.push(objDraw);
                            }
                            IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                        } else if (objFence.fencedraw == "rectangle") {
                            var lstpolygonDrawC = [];
                            var lstlatC = objFence.lat.split(',');
                            var lstlngC = objFence.lng.split(',');


                            var objDraw = {
                                latitude: parseFloat(lstlatC[0]),
                                longitude: parseFloat(lstlngC[0])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[0]),
                                longitude: parseFloat(lstlngC[1])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[1]),
                                longitude: parseFloat(lstlngC[1])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[1]),
                                longitude: parseFloat(lstlngC[0])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[0]),
                                longitude: parseFloat(lstlngC[0])
                            }
                            lstpolygonDrawC.push(objDraw);

                            IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                        };
                    }

                    // Bike.findOne({
                    //     where: {
                    //         deviceid: objFence.deviceId
                    //     }
                    // }).then(function(objPet) {
                    objFence.IsInFence = IsPetInFence;
                    Fence.update(objFence, {
                        where: {
                            id: objFence.idFence
                        }
                    }).then(function(resUpdate) {
                        res.json({
                            success: true,
                            message: "Fence updated successfully...",
                            data: resUpdate
                        });
                    });
                    // })
                })
            })
        }
    })
});



router.post('/SaveFenceByIdNew', jsonParser, function(req, res) {
    objFence = req.body;

    var Deviceidlist = objFence.selectedlist;
    Fence.find({
        where: {
            id: objFence.idFence
        },
    }).then(function(resFence) {
        if (resFence) {
            // Fence.destroy({
            //     where: {
            //         name: resFence.name,
            //         range: resFence.range,
            //         lat: resFence.lat,
            //         lng: resFence.lng,
            //         fencedraw: resFence.fencedraw,
            //     }
            // }).then(function(fencedeleted) {

            //     function uploader(m) {
            //         if (Deviceidlist.length > m) {
            //             objFence.deviceId = Deviceidlist[m];
            //             Fence.create(objFence).then(function(resFence) {
            //                 if ((resFence)) {
            //                     var IsPetInFence = true;
            //                     PetGPS.findOne({
            //                         where: {
            //                             DeviceId: objFence.deviceId
            //                         },
            //                         order: 'id DESC'
            //                     }).then(function(response) {
            //                         if (response != null) {

            //                             var CheckPoints = {
            //                                 latitude: parseFloat(response.Latitude),
            //                                 longitude: parseFloat(response.Longitude)
            //                             }

            //                             if (objFence.fencedraw == "circle") {
            //                                 var CircleCenterPoints = {
            //                                     latitude: parseFloat(objFence.lat),
            //                                     longitude: parseFloat(objFence.lng)
            //                                 }
            //                                 var CircleRadius = parseFloat(objFence.range);
            //                                 IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
            //                             } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
            //                                 var lstpolygonDrawC = [];
            //                                 var lstlatC = objFence.lat.split(',');
            //                                 var lstlngC = objFence.lng.split(',');

            //                                 for (var i = 0; i < lstlatC.length; i++) {
            //                                     var objDraw = {
            //                                         latitude: parseFloat(lstlatC[i]),
            //                                         longitude: parseFloat(lstlngC[i])
            //                                     }
            //                                     lstpolygonDrawC.push(objDraw);
            //                                 }
            //                                 IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
            //                             } else if (objFence.fencedraw == "rectangle") {
            //                                 var lstpolygonDrawC = [];
            //                                 var lstlatC = objFence.lat.split(',');
            //                                 var lstlngC = objFence.lng.split(',');


            //                                 var objDraw = {
            //                                     latitude: parseFloat(lstlatC[0]),
            //                                     longitude: parseFloat(lstlngC[0])
            //                                 }
            //                                 lstpolygonDrawC.push(objDraw);
            //                                 var objDraw = {
            //                                     latitude: parseFloat(lstlatC[0]),
            //                                     longitude: parseFloat(lstlngC[1])
            //                                 }
            //                                 lstpolygonDrawC.push(objDraw);
            //                                 var objDraw = {
            //                                     latitude: parseFloat(lstlatC[1]),
            //                                     longitude: parseFloat(lstlngC[1])
            //                                 }
            //                                 lstpolygonDrawC.push(objDraw);
            //                                 var objDraw = {
            //                                     latitude: parseFloat(lstlatC[1]),
            //                                     longitude: parseFloat(lstlngC[0])
            //                                 }
            //                                 lstpolygonDrawC.push(objDraw);
            //                                 var objDraw = {
            //                                     latitude: parseFloat(lstlatC[0]),
            //                                     longitude: parseFloat(lstlngC[0])
            //                                 }
            //                                 lstpolygonDrawC.push(objDraw);

            //                                 IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
            //                             };
            //                         }
            //                         // Bike.findOne({
            //                         //     where: {
            //                         //         deviceid: objFence.deviceId
            //                         //     }
            //                         // }).then(function(objPet) {

            //                         objFence.IsInFence = IsPetInFence;
            //                         Fence.update(objFence, {
            //                             where: {
            //                                 id: objFence.id
            //                             }
            //                         }).then(function(resUpdate) {
            //                             // funAuditLog.CreateAuditLog('SaveFence', UserExist.username , 'Delete Pet Tracking');
            //                             if (resUpdate) {
            //                                 uploader(m + 1);
            //                             } else {
            //                                 res.json(resUpdate)
            //                             }
            //                             // res.json({
            //                             //     success: true,
            //                             //     message: "Fence created successfully...",
            //                             //     data: resUpdate
            //                             // });
            //                         });
            //                         // })

            //                     })
            //                 }
            //             })
            //         } else {
            //             res.json({
            //                 success: true,
            //                 message: "Fence Updated successfully...",
            //             });
            //         }
            //     }
            //     uploader(0);

            // })
            Fence.update(objFence, {
                where: {
                    id: objFence.idFence
                }
            }).then(function(resFence) {
                var IsPetInFence = true;
                PetGPS.findOne({
                    where: {
                        DeviceId: objFence.deviceId
                    },
                    order: 'id DESC'
                }).then(function(response) {
                    if (response != null) {
                        var CheckPoints = {
                            latitude: parseFloat(response.Latitude),
                            longitude: parseFloat(response.Longitude)
                        }
                        if (objFence.fencedraw == "circle") {
                            var CircleCenterPoints = {
                                latitude: parseFloat(objFence.lat),
                                longitude: parseFloat(objFence.lng)
                            }
                            var CircleRadius = parseFloat(objFence.range);
                            IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                        } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                            var lstpolygonDrawC = [];
                            var lstlatC = objFence.lat.split(',');
                            var lstlngC = objFence.lng.split(',');

                            for (var i = 0; i < lstlatC.length; i++) {
                                var objDraw = {
                                    latitude: parseFloat(lstlatC[i]),
                                    longitude: parseFloat(lstlngC[i])
                                }
                                lstpolygonDrawC.push(objDraw);
                            }
                            IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                        } else if (objFence.fencedraw == "rectangle") {
                            var lstpolygonDrawC = [];
                            var lstlatC = objFence.lat.split(',');
                            var lstlngC = objFence.lng.split(',');


                            var objDraw = {
                                latitude: parseFloat(lstlatC[0]),
                                longitude: parseFloat(lstlngC[0])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[0]),
                                longitude: parseFloat(lstlngC[1])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[1]),
                                longitude: parseFloat(lstlngC[1])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[1]),
                                longitude: parseFloat(lstlngC[0])
                            }
                            lstpolygonDrawC.push(objDraw);
                            var objDraw = {
                                latitude: parseFloat(lstlatC[0]),
                                longitude: parseFloat(lstlngC[0])
                            }
                            lstpolygonDrawC.push(objDraw);

                            IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                        };
                    }

                    // Bike.findOne({
                    //     where: {
                    //         deviceid: objFence.deviceId
                    //     }
                    // }).then(function(objPet) {
                    objFence.IsInFence = IsPetInFence;
                    Fence.update(objFence, {
                        where: {
                            id: objFence.idFence
                        }
                    }).then(function(resUpdate) {
                        res.json({
                            success: true,
                            message: "Fence updated successfully...",
                            data: resUpdate
                        });
                    });
                    // })
                })
            })

        } else {
            objFence.selectedlist.push(objFence.deviceId);

            function uploader(m) {
                if (Deviceidlist.length > m) {
                    objFence.deviceId = Deviceidlist[m];
                    Fence.create(objFence).then(function(resFence) {
                        if ((resFence)) {
                            var IsPetInFence = true;
                            PetGPS.findOne({
                                where: {
                                    DeviceId: objFence.deviceId
                                },
                                order: 'id DESC'
                            }).then(function(response) {
                                if (response != null) {

                                    var CheckPoints = {
                                        latitude: parseFloat(response.Latitude),
                                        longitude: parseFloat(response.Longitude)
                                    }

                                    if (objFence.fencedraw == "circle") {
                                        var CircleCenterPoints = {
                                            latitude: parseFloat(objFence.lat),
                                            longitude: parseFloat(objFence.lng)
                                        }
                                        var CircleRadius = parseFloat(objFence.range);
                                        IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                    } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
                                        var lstpolygonDrawC = [];
                                        var lstlatC = objFence.lat.split(',');
                                        var lstlngC = objFence.lng.split(',');

                                        for (var i = 0; i < lstlatC.length; i++) {
                                            var objDraw = {
                                                latitude: parseFloat(lstlatC[i]),
                                                longitude: parseFloat(lstlngC[i])
                                            }
                                            lstpolygonDrawC.push(objDraw);
                                        }
                                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                    } else if (objFence.fencedraw == "rectangle") {
                                        var lstpolygonDrawC = [];
                                        var lstlatC = objFence.lat.split(',');
                                        var lstlngC = objFence.lng.split(',');


                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[0]),
                                            longitude: parseFloat(lstlngC[0])
                                        }
                                        lstpolygonDrawC.push(objDraw);
                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[0]),
                                            longitude: parseFloat(lstlngC[1])
                                        }
                                        lstpolygonDrawC.push(objDraw);
                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[1]),
                                            longitude: parseFloat(lstlngC[1])
                                        }
                                        lstpolygonDrawC.push(objDraw);
                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[1]),
                                            longitude: parseFloat(lstlngC[0])
                                        }
                                        lstpolygonDrawC.push(objDraw);
                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[0]),
                                            longitude: parseFloat(lstlngC[0])
                                        }
                                        lstpolygonDrawC.push(objDraw);

                                        IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                    };
                                }
                                // Bike.findOne({
                                //     where: {
                                //         deviceid: objFence.deviceId
                                //     }
                                // }).then(function(objPet) {

                                objFence.IsInFence = IsPetInFence;
                                Fence.update(objFence, {
                                    where: {
                                        id: objFence.id
                                    }
                                }).then(function(resUpdate) {
                                    // funAuditLog.CreateAuditLog('SaveFence', UserExist.username , 'Delete Pet Tracking');
                                    if (resUpdate) {
                                        uploader(m + 1);
                                    } else {
                                        res.json(resUpdate)
                                    }
                                    // res.json({
                                    //     success: true,
                                    //     message: "Fence created successfully...",
                                    //     data: resUpdate
                                    // });
                                });
                                // })

                            })
                        }
                    })
                } else {
                    res.json({
                        success: true,
                        message: "Fence created successfully...",
                    });
                }
            }
            uploader(0);
        }
    })




    // function uploader(m) {
    //     console.log("i....", m);
    //     if (Deviceidlist.length > m) {
    //         objFence.deviceId = Deviceidlist[m];
    //         console.log(objFence.deviceId)
    //         Fence.findOrCreate({
    //             where: {
    //                 id: objFence.idFence
    //             },
    //             defaults: objFence
    //         }).then(function(resFence) {
    //             if ((resFence[1])) {
    //                 var IsPetInFence = true;
    //                 PetGPS.findOne({
    //                     where: {
    //                         DeviceId: objFence.deviceId
    //                     },
    //                     order: 'id DESC'
    //                 }).then(function(response) {
    //                     if (response != null) {

    //                         var CheckPoints = {
    //                             latitude: parseFloat(response.Latitude),
    //                             longitude: parseFloat(response.Longitude)
    //                         }

    //                         if (objFence.fencedraw == "circle") {
    //                             var CircleCenterPoints = {
    //                                 latitude: parseFloat(objFence.lat),
    //                                 longitude: parseFloat(objFence.lng)
    //                             }
    //                             var CircleRadius = parseFloat(objFence.range);
    //                             IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
    //                         } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
    //                             var lstpolygonDrawC = [];
    //                             var lstlatC = objFence.lat.split(',');
    //                             var lstlngC = objFence.lng.split(',');

    //                             for (var i = 0; i < lstlatC.length; i++) {
    //                                 var objDraw = {
    //                                     latitude: parseFloat(lstlatC[i]),
    //                                     longitude: parseFloat(lstlngC[i])
    //                                 }
    //                                 lstpolygonDrawC.push(objDraw);
    //                             }
    //                             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
    //                         } else if (objFence.fencedraw == "rectangle") {
    //                             var lstpolygonDrawC = [];
    //                             var lstlatC = objFence.lat.split(',');
    //                             var lstlngC = objFence.lng.split(',');


    //                             var objDraw = {
    //                                 latitude: parseFloat(lstlatC[0]),
    //                                 longitude: parseFloat(lstlngC[0])
    //                             }
    //                             lstpolygonDrawC.push(objDraw);
    //                             var objDraw = {
    //                                 latitude: parseFloat(lstlatC[0]),
    //                                 longitude: parseFloat(lstlngC[1])
    //                             }
    //                             lstpolygonDrawC.push(objDraw);
    //                             var objDraw = {
    //                                 latitude: parseFloat(lstlatC[1]),
    //                                 longitude: parseFloat(lstlngC[1])
    //                             }
    //                             lstpolygonDrawC.push(objDraw);
    //                             var objDraw = {
    //                                 latitude: parseFloat(lstlatC[1]),
    //                                 longitude: parseFloat(lstlngC[0])
    //                             }
    //                             lstpolygonDrawC.push(objDraw);
    //                             var objDraw = {
    //                                 latitude: parseFloat(lstlatC[0]),
    //                                 longitude: parseFloat(lstlngC[0])
    //                             }
    //                             lstpolygonDrawC.push(objDraw);

    //                             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
    //                         };
    //                     }
    //                     // Bike.findOne({
    //                     //     where: {
    //                     //         deviceid: objFence.deviceId
    //                     //     }
    //                     // }).then(function(objPet) {

    //                     objFence.IsInFence = IsPetInFence;
    //                     Fence.update(objFence, {
    //                         where: {
    //                             id: objFence.id
    //                         }
    //                     }).then(function(resUpdate) {
    //                         // funAuditLog.CreateAuditLog('SaveFence', UserExist.username , 'Delete Pet Tracking');
    //                         if (resUpdate) {
    //                             uploader(m + 1);
    //                         } else {
    //                             res.json(resUpdate)
    //                         }
    //                         // res.json({
    //                         //     success: true,
    //                         //     message: "Fence created successfully...",
    //                         //     data: resUpdate
    //                         // });
    //                     });
    //                     // })
    //                 })
    //             } else {
    //                 Fence.destroy({
    //                     where: {
    //                         name: objFence.name,
    //                         range: objFence.range,
    //                         lat: objFence.lat,
    //                         lng: objFence.lng,
    //                         fencedraw: objFence.fencedraw,
    //                         deviceId: { $notIn: Deviceidlist }
    //                     }
    //                 }).then(function(fencedeleted) {
    //                     Fence.create(objFence).then(function(resFence) {
    //                         if ((resFence)) {
    //                             var IsPetInFence = true;
    //                             PetGPS.findOne({
    //                                 where: {
    //                                     DeviceId: objFence.deviceId
    //                                 },
    //                                 order: 'id DESC'
    //                             }).then(function(response) {
    //                                 if (response != null) {

    //                                     var CheckPoints = {
    //                                         latitude: parseFloat(response.Latitude),
    //                                         longitude: parseFloat(response.Longitude)
    //                                     }

    //                                     if (objFence.fencedraw == "circle") {
    //                                         var CircleCenterPoints = {
    //                                             latitude: parseFloat(objFence.lat),
    //                                             longitude: parseFloat(objFence.lng)
    //                                         }
    //                                         var CircleRadius = parseFloat(objFence.range);
    //                                         IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
    //                                     } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
    //                                         var lstpolygonDrawC = [];
    //                                         var lstlatC = objFence.lat.split(',');
    //                                         var lstlngC = objFence.lng.split(',');

    //                                         for (var i = 0; i < lstlatC.length; i++) {
    //                                             var objDraw = {
    //                                                 latitude: parseFloat(lstlatC[i]),
    //                                                 longitude: parseFloat(lstlngC[i])
    //                                             }
    //                                             lstpolygonDrawC.push(objDraw);
    //                                         }
    //                                         IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
    //                                     } else if (objFence.fencedraw == "rectangle") {
    //                                         var lstpolygonDrawC = [];
    //                                         var lstlatC = objFence.lat.split(',');
    //                                         var lstlngC = objFence.lng.split(',');


    //                                         var objDraw = {
    //                                             latitude: parseFloat(lstlatC[0]),
    //                                             longitude: parseFloat(lstlngC[0])
    //                                         }
    //                                         lstpolygonDrawC.push(objDraw);
    //                                         var objDraw = {
    //                                             latitude: parseFloat(lstlatC[0]),
    //                                             longitude: parseFloat(lstlngC[1])
    //                                         }
    //                                         lstpolygonDrawC.push(objDraw);
    //                                         var objDraw = {
    //                                             latitude: parseFloat(lstlatC[1]),
    //                                             longitude: parseFloat(lstlngC[1])
    //                                         }
    //                                         lstpolygonDrawC.push(objDraw);
    //                                         var objDraw = {
    //                                             latitude: parseFloat(lstlatC[1]),
    //                                             longitude: parseFloat(lstlngC[0])
    //                                         }
    //                                         lstpolygonDrawC.push(objDraw);
    //                                         var objDraw = {
    //                                             latitude: parseFloat(lstlatC[0]),
    //                                             longitude: parseFloat(lstlngC[0])
    //                                         }
    //                                         lstpolygonDrawC.push(objDraw);

    //                                         IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
    //                                     };
    //                                 }
    //                                 // Bike.findOne({
    //                                 //     where: {
    //                                 //         deviceid: objFence.deviceId
    //                                 //     }
    //                                 // }).then(function(objPet) {

    //                                 objFence.IsInFence = IsPetInFence;
    //                                 Fence.update(objFence, {
    //                                     where: {
    //                                         id: objFence.id
    //                                     }
    //                                 }).then(function(resUpdate) {
    //                                     // funAuditLog.CreateAuditLog('SaveFence', UserExist.username , 'Delete Pet Tracking');
    //                                     if (resUpdate) {
    //                                         uploader(m + 1);
    //                                     } else {
    //                                         res.json(resUpdate)
    //                                     }
    //                                     // res.json({
    //                                     //     success: true,
    //                                     //     message: "Fence created successfully...",
    //                                     //     data: resUpdate
    //                                     // });
    //                                 });
    //                                 // })

    //                             })
    //                         }
    //                     })


    //                     // Fence.update(objFence, {
    //                     //     where: {
    //                     //         id: objFence.idFence
    //                     //     }
    //                     // }).then(function(resFence) {
    //                     //     var IsPetInFence = true;
    //                     //     PetGPS.findOne({
    //                     //         where: {
    //                     //             DeviceId: objFence.deviceId
    //                     //         },
    //                     //         order: 'id DESC'
    //                     //     }).then(function(response) {
    //                     //         if (response != null) {
    //                     //             var CheckPoints = {
    //                     //                 latitude: parseFloat(response.Latitude),
    //                     //                 longitude: parseFloat(response.Longitude)
    //                     //             }
    //                     //             if (objFence.fencedraw == "circle") {
    //                     //                 var CircleCenterPoints = {
    //                     //                     latitude: parseFloat(objFence.lat),
    //                     //                     longitude: parseFloat(objFence.lng)
    //                     //                 }
    //                     //                 var CircleRadius = parseFloat(objFence.range);
    //                     //                 IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
    //                     //             } else if (objFence.fencedraw == "polygon" || objFence.fencedraw == "polyline") {
    //                     //                 var lstpolygonDrawC = [];
    //                     //                 var lstlatC = objFence.lat.split(',');
    //                     //                 var lstlngC = objFence.lng.split(',');

    //                     //                 for (var i = 0; i < lstlatC.length; i++) {
    //                     //                     var objDraw = {
    //                     //                         latitude: parseFloat(lstlatC[i]),
    //                     //                         longitude: parseFloat(lstlngC[i])
    //                     //                     }
    //                     //                     lstpolygonDrawC.push(objDraw);
    //                     //                 }
    //                     //                 IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
    //                     //             } else if (objFence.fencedraw == "rectangle") {
    //                     //                 var lstpolygonDrawC = [];
    //                     //                 var lstlatC = objFence.lat.split(',');
    //                     //                 var lstlngC = objFence.lng.split(',');


    //                     //                 var objDraw = {
    //                     //                     latitude: parseFloat(lstlatC[0]),
    //                     //                     longitude: parseFloat(lstlngC[0])
    //                     //                 }
    //                     //                 lstpolygonDrawC.push(objDraw);
    //                     //                 var objDraw = {
    //                     //                     latitude: parseFloat(lstlatC[0]),
    //                     //                     longitude: parseFloat(lstlngC[1])
    //                     //                 }
    //                     //                 lstpolygonDrawC.push(objDraw);
    //                     //                 var objDraw = {
    //                     //                     latitude: parseFloat(lstlatC[1]),
    //                     //                     longitude: parseFloat(lstlngC[1])
    //                     //                 }
    //                     //                 lstpolygonDrawC.push(objDraw);
    //                     //                 var objDraw = {
    //                     //                     latitude: parseFloat(lstlatC[1]),
    //                     //                     longitude: parseFloat(lstlngC[0])
    //                     //                 }
    //                     //                 lstpolygonDrawC.push(objDraw);
    //                     //                 var objDraw = {
    //                     //                     latitude: parseFloat(lstlatC[0]),
    //                     //                     longitude: parseFloat(lstlngC[0])
    //                     //                 }
    //                     //                 lstpolygonDrawC.push(objDraw);

    //                     //                 IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
    //                     //             };
    //                     //         }

    //                     //         // Bike.findOne({
    //                     //         //     where: {
    //                     //         //         deviceid: objFence.deviceId
    //                     //         //     }
    //                     //         // }).then(function(objPet) {
    //                     //         objFence.IsInFence = IsPetInFence;
    //                     //         Fence.update(objFence, {
    //                     //             where: {
    //                     //                 id: objFence.idFence
    //                     //             }
    //                     //         }).then(function(resUpdate) {
    //                     //             if (resUpdate) {
    //                     //                 uploader(m + 1);
    //                     //             } else {
    //                     //                 res.json(resUpdate);
    //                     //             }
    //                     //             // res.json({
    //                     //             //     success: true,
    //                     //             //     message: "Fence updated successfully...",
    //                     //             //     data: resUpdate
    //                     //             // });
    //                     //         });
    //                     //         // })
    //                     //     })
    //                     // })
    //                 })
    //             }
    //         })
    //     } else {
    //         res.json({
    //             success: true,
    //             message: "Fence created successfully...",
    //         });
    //     }
    // }
    // uploader(0)
});

router.post('/UpdateFenceNameById', jsonParser, function(req, res) {
    objFence = req.body;
    Fence.findOne({
        where: {
            id: objFence.id
        }
    }).then(function(response) {
        if (response != null) {
            response.updateAttributes({ name: objFence.name }).then(function(resUpdate) {
                res.json({
                    success: true,
                    message: "Fence Name updated successfully...",
                    data: response,
                });
            });
        } else {
            res.json({
                success: false,
                message: "Fence Name not updated...",
            });
        }
    });
});

router.get('/DeleteFence', function(req, res) {

    var deviceId = req.query.deviceId;
    var SSIDData = "(" + deviceId + "DE050,0,0)";

    var Sendflag = false;
    var client = new net.Socket();
    client.connect(SocketPort, SocketIPAddress, function() {
        console.log('Connected');
        client.write(SSIDData);

        client.setTimeout(20000, function() {
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

        if (line.indexOf('BE05') > 0) {
            var deviceID = line.substring(1, 13);
            var Data = line.substring(17, 18);

            Sendflag = true;
            if (Data == "1") {

                Fence.destroy({
                    where: {
                        deviceId: req.query.deviceId
                    }
                }).then(function(response) {
                    if (response) {
                        Pet.findOne({
                            where: {
                                deviceid: req.query.deviceId
                            }
                        }).then(function(objPet) {
                            if (objPet) {
                                objPet.updateAttributes({ IsInFence: true, IsFenceOnline: false }).then(function(resUpdate) {
                                    res.json({
                                        success: true,
                                        message: "Fence Removed successfully...",
                                        data: response
                                    });
                                    client.destroy();
                                });
                            } else {
                                res.json({
                                    success: true,
                                    message: "Fence Removed successfully...",
                                    data: response
                                });
                                client.destroy();
                            };

                        })
                    } else {
                        res.json({ success: false, message: 'Fence not Removed.' });
                        client.destroy();
                    }
                })


            } else {
                res.json({ success: false, message: 'Fence not Removed. Try after 5 minute.' });
                client.destroy();
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


});

router.get('/DeleteFenceById', function(req, res) {
    Fence.destroy({
        where: {
            id: req.query.idFence
        }
    }).then(function(response) {
        if (response) {
            res.json({
                success: true,
                message: "Fence Removed successfully...",
                data: response
            });
        } else {
            res.json({ success: false, message: 'Fence not Removed.' });
        }
    })
});

router.get('/GetFencedeivce', function(req, res) {
    console.log("@@@@@@@@@@@@@@@@@@@@@@")
    console.log(req.query)
    objparm = req.query;
    Fence.findAll({
        where: objparm
    }).then(function(response) {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        res.json(response);
    })
})



module.exports = router