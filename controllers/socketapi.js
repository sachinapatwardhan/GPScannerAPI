//Tables
var router = express.Router();
var geolib = require("geolib");
var PushNotification = models.tblpushnotification;
// var Pet = models.tblpet;
// var PetGPS = models.tblgpsscanner;
var TaxSetting = models.tblsetting;
// var FacebookPostData = models.tblfacebookpostdata;
var HandShake = models.tblhandshake;
var Bike = models.tblbike;

var momentz = require('moment-timezone');



//End of Tables

global.deg_to_lat_long = function(deg) {

    var Direction = deg.substring(deg.length - 1, deg.length);
    var Minute = deg.substring(deg.length - 8, deg.length - 1)
    var degree = deg.substring(0, deg.length - 8)

    var min = Minute.substring(0, Minute.indexOf('.'));
    var sec = parseFloat(Minute.substring(Minute.indexOf('.'), Minute.length)) * 60;

    sec = sec.toFixed(3);
    var lat_long = '';
    try {
        lat_long = geolib.useDecimal(degree + "° " + min + "' " + sec + "\" " + Direction);
    } catch (ex) {
        lat_long = parseFloat(degree) + (parseFloat(Minute) / 60);

        if (Direction == "S" || Direction == "W") {
            lat_long = parseFloat(lat_long) * -1;
        }
    }
    return lat_long;
}

router.get('/TestDegree', function(req, res) {
    var A = global.deg_to_lat_long('5016.8633N')
    var B = global.deg_to_lat_long('00347.3997W')
    console.log(A)
    console.log(B)
    res.send(A + B);
})



function SendIOSPushNotification(DeviceId) {
    // console.log(__dirname + "/../resource/key.pem")
    var deviceIds = [];

    var UserId = 0;
    var data = {
        title: 'Alert',
        message: "Puppy is out of Fence",
        Fence: 'Fence',
        otherfields: {
            deviceid: "488990008090",
            PetId: "1",
            PetName: "Puppy"
        }
    };

    // PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {

    //PushNotificationSettings.apn.defaultData.sound = 'jinglebellssms.caf';

    var objPushNotificationSend = new PushNotifications(OwnerPushNotificationSettings);

    function SendNotification(i) {
        // if (i < response.length) {
        // deviceIds.push(response[i].PushNotificationId)
        deviceIds.push(DeviceId)
            // SendNotification(i + 1);
            // } else {
        console.log(deviceIds)
        if (deviceIds.length > 0) {
            objPushNotificationSend.send(deviceIds, data, function(result) {
                console.log(result);
            });
        };
        // }
    }
    SendNotification(0)
        // }).catch(function(error) {
        //     // console.log(error);
        // })

}


router.get('/SendIOSPush', function(req, res) {
    var DeviceId = req.query.Token;
    SendIOSPushNotification(DeviceId);
    res.send("Done")
})

router.get('/TestQuery', function(req, res) {
    connection.query("SELECT PushNotificationId,Platform from tblpushnotification where iduser=1 group by PushNotificationId, Platform", function(err, response, fields) {
        console.log(err)
        console.log(response.length)
        res.json(response)
    });
})

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function SendPushNotification(data, UserId, Type, PushNotificationType) {
    // var deviceIds = [];
    connection.query("SELECT PushNotificationId,Platform from tblpushnotification where iduser=" + UserId + " and UserType='" + Type + "' group by PushNotificationId, Platform", function(err, response, fields) {
        if (!err && response.length > 0) {
            // PushNotification.findAll({ where: { iduser: UserId } }).then(function(response) {
            function SendNotification(i) {
                if (i < response.length) {
                    connection.query("SELECT IsSecurity, Type from tbluserinformation where id=" + UserId, function(err, lstUser, fields) {
                        if (lstUser[0].IsSecurity == true && Type == 'Shop') {
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
                            objData.priority = 'high';
                            var objPushNotificationSend = new PushNotifications(PushNotificationSettings);
                            if (deviceIds.length > 0) {

                                objPushNotificationSend.send(deviceIds, objData, function(result) {
                                    // console.log(result);
                                    SendNotification(i + 1);
                                });
                            } else {
                                SendNotification(i + 1);
                            };
                        } else {
                            if (Type == 'Owner') {
                                connection.query("SELECT * from tblsetting where Name ='" + PushNotificationType + "' ", function(err, lstSetting, fields) {
                                    if (lstSetting[0].Value == 1) {
                                        var deviceIds = [];
                                        deviceIds.push(response[i].PushNotificationId)
                                            //SendNotification(i + 1);
                                            // } else {
                                            // console.log(deviceIds)
                                        var objData = clone(data);
                                        if (response[i].Platform == 'ios') {
                                            objData.title = data.message;
                                            objData.message = data.title;
                                            if (objData.Fence == 'FenceIn') {
                                                OwnerPushNotificationSettings.apn.defaultData.sound = 'fencein.caf';
                                            } else if (objData.Fence == 'FenceOut') {
                                                OwnerPushNotificationSettings.apn.defaultData.sound = 'fenceout.caf';
                                            } else {
                                                OwnerPushNotificationSettings.apn.defaultData.sound = 'default';
                                            };
                                        };
                                        // console.log(response[i].Platform + "_______________________________________________________")
                                        // console.log(objData)
                                        objData.priority = 'high';
                                        var objPushNotificationSend = new PushNotifications(OwnerPushNotificationSettings);
                                        if (deviceIds.length > 0) {

                                            objPushNotificationSend.send(deviceIds, objData, function(result) {
                                                // console.log(result);
                                                SendNotification(i + 1);
                                            });
                                        } else {
                                            SendNotification(i + 1);
                                        };
                                    } else {
                                        SendNotification(i + 1);
                                    }
                                });
                            } else {
                                SendNotification(i + 1);
                            }
                        }
                    });
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

    //return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    return ("0000" + year.toString()).slice(-4) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2) + " " + ("00" + hour.toString()).slice(-2) + ":" + ("00" + min.toString()).slice(-2) + ":" + ("00" + sec.toString()).slice(-2);
}

//BR01
// router.get('/BR01Method', function(req, res) {
//     var line = req.query.Code;
//     console.log(line)
//     var deviceID = line.substring(1, 13);
//     var Date1 = line.substring(17, 23);
//     var Position = line.substring(23, 24);
//     var Lat = line.substring(24, 34);
//     var Lan = line.substring(34, 45);
//     var Speed = line.substring(45, 50);
//     var Time = line.substring(50, 56);
//     var Direction = line.substring(56, 62);
//     var Status = line.substring(62, 70);
//     var Sign = line.substring(70, 71);
//     var ReserveSection = line.substring(71, 79);

//     var day = parseInt(Date1.substring(4, 6));
//     var month = parseInt(Date1.substring(2, 4));
//     var year = parseInt("20" + Date1.substring(0, 2));
//     var hour = parseInt(Time.substring(0, 2));
//     var min = parseInt(Time.substring(2, 4));
//     var sec = parseInt(Time.substring(4, 6));

//     // // var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
//     // var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
//     // var CurrentDate = GetCurrentDate();

//     // var Latitude = global.deg_to_lat_long(Lat);
//     // var Longtitude = global.deg_to_lat_long(Lan);

//     // //tblPetgps Entry
//     // var query = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "');";
//     // connection.query(query, function(err, rows, fields) {
//     //     //tblapisresponse Entry
//     //     var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BR01', 'No Response', '" + CurrentDate + "');";
//     //     connection.query(ResponceQuery, function(err, rows1, fields) {
//     //         res.json("No Response");
//     //         strResponce = "No Response";
//     //     });
//     // });

//     // var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
//     var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
//     var CurrentDate = GetCurrentDate();

//     var Latitude = global.deg_to_lat_long(Lat);
//     var Longtitude = global.deg_to_lat_long(Lan);

//     connection.query("SELECT * from tblfence where deviceId=" + deviceID, function(err, rows, fields) {
//         if (!err && rows.length > 0) {
//             //Get Last GPS Data
//             // connection.query("SELECT * from tblpetgps where DeviceId=" + deviceID + " Order by Id desc", function(gpserr, lstgps, fields) {
//             // var IsPetInFencePrevious = true;
//             var response = rows[0];

//             // if (!gpserr && lstgps.length > 0) {
//             //     var objlastgps = lstgps[0];
//             //     console.log(objlastgps)

//             //     var LastCheckPoints = {
//             //         latitude: parseFloat(objlastgps.Latitude),
//             //         longitude: parseFloat(objlastgps.Longtitude)
//             //     }

//             //     console.log(LastCheckPoints)

//             //     if (response.fencedraw == "circle") {
//             //         var CircleCenterPoints = {
//             //             latitude: parseFloat(response.lat),
//             //             longitude: parseFloat(response.lng)
//             //         }
//             //         var CircleRadius = parseFloat(response.range);
//             //         IsPetInFencePrevious = geolib.isPointInCircle(LastCheckPoints, CircleCenterPoints, CircleRadius)

//             //         // console.log("IsPetIn Fence - " + IsPetInFence)
//             //     } else if (response.fencedraw == "polygon" || response.fencedraw == "polyline") {
//             //         var lstpolygonDrawC = [];
//             //         var lstlatC = response.lat.split(',');
//             //         var lstlngC = response.lng.split(',');

//             //         for (var i = 0; i < lstlatC.length; i++) {
//             //             var objDraw = {
//             //                 latitude: parseFloat(lstlatC[i]),
//             //                 longitude: parseFloat(lstlngC[i])
//             //             }
//             //             lstpolygonDrawC.push(objDraw);
//             //         }
//             //         IsPetInFencePrevious = geolib.isPointInside(LastCheckPoints, lstpolygonDrawC)
//             //             // console.log("IsPetIn Fence - " + IsPetInFence)
//             //     } else if (response.fencedraw == "rectangle") {
//             //         var lstpolygonDrawC = [];
//             //         var lstlatC = response.lat.split(',');
//             //         var lstlngC = response.lng.split(',');


//             //         var objDraw = {
//             //             latitude: parseFloat(lstlatC[0]),
//             //             longitude: parseFloat(lstlngC[0])
//             //         }
//             //         lstpolygonDrawC.push(objDraw);
//             //         var objDraw = {
//             //             latitude: parseFloat(lstlatC[0]),
//             //             longitude: parseFloat(lstlngC[1])
//             //         }
//             //         lstpolygonDrawC.push(objDraw);
//             //         var objDraw = {
//             //             latitude: parseFloat(lstlatC[1]),
//             //             longitude: parseFloat(lstlngC[1])
//             //         }
//             //         lstpolygonDrawC.push(objDraw);
//             //         var objDraw = {
//             //             latitude: parseFloat(lstlatC[1]),
//             //             longitude: parseFloat(lstlngC[0])
//             //         }
//             //         lstpolygonDrawC.push(objDraw);
//             //         var objDraw = {
//             //             latitude: parseFloat(lstlatC[0]),
//             //             longitude: parseFloat(lstlngC[0])
//             //         }
//             //         lstpolygonDrawC.push(objDraw);

//             //         // console.log(lstpolygonDrawC)
//             //         IsPetInFencePrevious = geolib.isPointInside(LastCheckPoints, lstpolygonDrawC)
//             //             // console.log("Sqre IsPetIn Fence - " + IsPetInFence)
//             //     };

//             // }


//             var CheckPoints = {
//                 latitude: parseFloat(Latitude),
//                 longitude: parseFloat(Longtitude)
//             }

//             var IsPetInFence = true;

//             if (response.fencedraw == "circle") {
//                 var CircleCenterPoints = {
//                     latitude: parseFloat(response.lat),
//                     longitude: parseFloat(response.lng)
//                 }
//                 var CircleRadius = parseFloat(response.range);
//                 IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)

//                 // console.log("IsPetIn Fence - " + IsPetInFence)
//             } else if (response.fencedraw == "polygon" || response.fencedraw == "polyline") {
//                 var lstpolygonDrawC = [];
//                 var lstlatC = response.lat.split(',');
//                 var lstlngC = response.lng.split(',');

//                 for (var i = 0; i < lstlatC.length; i++) {
//                     var objDraw = {
//                         latitude: parseFloat(lstlatC[i]),
//                         longitude: parseFloat(lstlngC[i])
//                     }
//                     lstpolygonDrawC.push(objDraw);
//                 }
//                 IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
//                     // console.log("IsPetIn Fence - " + IsPetInFence)
//             } else if (response.fencedraw == "rectangle") {
//                 var lstpolygonDrawC = [];
//                 var lstlatC = response.lat.split(',');
//                 var lstlngC = response.lng.split(',');


//                 var objDraw = {
//                     latitude: parseFloat(lstlatC[0]),
//                     longitude: parseFloat(lstlngC[0])
//                 }
//                 lstpolygonDrawC.push(objDraw);
//                 var objDraw = {
//                     latitude: parseFloat(lstlatC[0]),
//                     longitude: parseFloat(lstlngC[1])
//                 }
//                 lstpolygonDrawC.push(objDraw);
//                 var objDraw = {
//                     latitude: parseFloat(lstlatC[1]),
//                     longitude: parseFloat(lstlngC[1])
//                 }
//                 lstpolygonDrawC.push(objDraw);
//                 var objDraw = {
//                     latitude: parseFloat(lstlatC[1]),
//                     longitude: parseFloat(lstlngC[0])
//                 }
//                 lstpolygonDrawC.push(objDraw);
//                 var objDraw = {
//                     latitude: parseFloat(lstlatC[0]),
//                     longitude: parseFloat(lstlngC[0])
//                 }
//                 lstpolygonDrawC.push(objDraw);

//                 // console.log(lstpolygonDrawC)
//                 IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
//                     // console.log("Sqre IsPetIn Fence - " + IsPetInFence)
//             };



//             connection.query("SELECT * from tblpet where deviceId=" + deviceID, function(err, Petrows, fields) {
//                 if (!err && Petrows.length > 0) {
//                     var objPet = Petrows[0];

//                     if (IsPetInFence != objPet.IsInFence) {

//                         var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','6');";
//                         connection.query(Alarmquery, function(err, rows, fields) {
//                             connection.query('UPDATE tblpet set IsInFence=' + IsPetInFence + ' WHERE DeviceId=' + deviceID, function(err, rows, fields) {
//                                 var message = '';
//                                 if (IsPetInFence == false) {
//                                     message = objPet.Collartagname + ' is out of Fence.';
//                                 } else {
//                                     message = objPet.Collartagname + ' is in Fence.';
//                                 }
//                                 var PushNotificationdata = {
//                                     title: 'Fence',
//                                     message: message,
//                                     Fence: 'Default',
//                                     otherfields: {
//                                         deviceid: deviceID,
//                                         PetId: objPet.id,
//                                         PetName: objPet.Collartagname
//                                     }
//                                 };
//                                 if (IsPetInFence == false) {
//                                     PushNotificationdata.Fence = 'Default';
//                                 } else {
//                                     PushNotificationdata.Fence = 'Fence';
//                                 }
//                                 SendPushNotification(PushNotificationdata, objPet.iduser);
//                             });
//                         });

//                     };
//                 };
//             });
//             // });
//         };

//         //Insert data in gps
//         var query = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "');";
//         connection.query(query, function(err, rows, fields) {
//             var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BR01', 'No Response', '" + CurrentDate + "');";
//             connection.query(ResponceQuery, function(err, rows1, fields) {
//                 res.json("No Response");
//                 strResponce = "No Response";
//             });
//         });
//     });
// })

//CHeck Server Connection

// var ServerConnectionrule = new schedule.RecurrenceRule();
// //rule.dayOfWeek = [0, new schedule.Range(4, 6)];
// // rule.hour = 10;
// rule.minute = 1;
// rule.second = 0;
function sendServerDisconnectMail() {

    TaxSetting.findOne({ where: { Name: 'SocketCheckMail', Value: '1' } }).then(function(response) {
        //console.log(response)
        if (response) {
            var mail = {
                from: 'pmt@bugzstudio.com',
                to: 'pmt@bugzstudio.com;soham.patel@bugzstudio.com',
                //to: 'soham.patel@bugzstudio.com',
                subject: 'Pettorway Socket Server Disconnected',
                text: 'Dear Bugzstudio Team,\n\n Your Pettorway Socket Server is not Responding. Please Restart it. \n Thank you. \n\n Pettorway'
            };
            transporter.sendMail(mail, function(error, response) {

            });
        };

    });
}


//need to Uncomment
// var ServerConnectionCheck = schedule.scheduleJob('*/1 * * * *', function() {
//     var SendCount = 0;

//     function CallServer() {
//         // console.log("Send")
//         // console.log(new Date())
//         var client = new net.Socket();
//         client.connect(SocketPort, SocketIPAddress, function() {
//             // console.log('Connected');
//             client.write('Hello');
//             var Sendflag = true;
//             client.setTimeout(5000, function() {
//                 if (Sendflag == false) {
//                     SendCount = SendCount + 1;
//                     if (SendCount > 2) {
//                         CallServer();
//                     } else {
//                         // console.log("Not Connected");
//                         sendServerDisconnectMail();
//                     };
//                 };
//                 client.destroy();
//             });
//         });

//         client.on('data', function(data) {
//             var line = data.toString();
//             //console.log(line);
//             if (line == 'Connected') {
//                 Sendflag = true;
//                 client.destroy();
//             };

//             // kill client after server's response
//         });

//         client.on('close', function() {
//             console.log('Connection closed');
//         });

//         client.on('end', function() {
//             console.log('Connection end');
//         });

//         client.on('error', function(err) {
//             console.log('Connection Error');
//             SendCount = SendCount + 1;
//             if (SendCount < 3) {
//                 client.destroy();
//                 CallServer();
//             } else {
//                 sendServerDisconnectMail();
//             };

//         })
//     }

//     CallServer();

// });

//Send G-Sensor Data
router.get('/SendGsensor', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    var sensitivity = req.query.sensitivity;
    var DId = req.query.DeviceId;
    var search = {};
    search['$and'] = [];
    search['$and'].push({ IsOnline: true });

    if (DId != null && DId != '' && DId != undefined) {
        search['$and'].push({ deviceid: DId });
    };
    // var Data = req.query.Data;
    Bike.findAll({
        where: search,
    }).then(function(response) {
        var totalDevice = response.length;
        var SuccessDevice = 0;

        function SendGSensorCommand(i) {
            if (i < response.length) {
                var DeviceId = response[i].deviceid;
                var Data = "(" + DeviceId + "DE201" + sensitivity + "5)";
                console.log(Data);
                var client = new net.Socket();
                var Sendflag = false;

                client.connect(SocketPort, SocketIPAddress, function() {
                    // console.log('G-Sensor send to ' + DeviceId);
                    client.write(Data);
                    // client.setTimeout(30000, function() {
                    //     if (Sendflag == false) {
                    //         Sendflag = true;
                    //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                    //         client.destroy();
                    //     };

                    // });

                    client.setTimeout(30000, function() {
                        if (Sendflag == false) {
                            Sendflag = true;

                            client.destroy();
                            SendGSensorCommand(i + 1);
                        };

                    });
                });

                client.on('data', function(data) {
                    var line = data.toString();
                    if (Sendflag == false) {
                        if (line.indexOf('BE20') > 0) {
                            console.log('Received: ' + line);
                            Sendflag = true;
                            SuccessDevice = SuccessDevice + 1;
                            // res.json(objNavigation);
                            client.destroy(); // kill client after server's response
                            SendGSensorCommand(i + 1);

                        } else {
                            Sendflag = true;

                            client.destroy();
                            SendGSensorCommand(i + 1);
                        }
                    };


                });

                client.on('close', function() {
                    console.log('Connection closed');
                });

            } else {
                res.send(SuccessDevice + " out of " + totalDevice + " Device Success");
            }
        }

        SendGSensorCommand(0);
    }).catch(function(error) {
        res.send(error);
    })

    // } else {
    //     res.send("Please Select DeviceId.");
    // }
})

//Send Mode Data
router.get('/SendMode', function(req, res) {
    //GetLookAtMeDP3110a0f
    var Mode = req.query.Mode;
    var DId = req.query.DeviceId;
    var search = {};
    search['$and'] = [];
    search['$and'].push({ IsOnline: true });

    if (DId != null && DId != '' && DId != undefined) {
        search['$and'].push({ deviceid: DId });
        //};
        // var Data = req.query.Data;
        Bike.findAll({
            where: search,
        }).then(function(response) {
            var totalDevice = response.length;
            var SuccessDevice = 0;

            function SendModeCommand(i) {
                if (i < response.length) {
                    var DeviceId = response[i].deviceid;
                    var Data = "(" + DeviceId + "DP30" + Mode + ")";
                    console.log(Data);
                    var client = new net.Socket();
                    var Sendflag = false;

                    client.connect(SocketPort, SocketIPAddress, function() {
                        // console.log('G-Sensor send to ' + DeviceId);
                        client.write(Data);


                        client.setTimeout(30000, function() {
                            if (Sendflag == false) {
                                Sendflag = true;

                                client.destroy();
                                SendModeCommand(i + 1);
                            };

                        });
                    });

                    client.on('data', function(data) {
                        var line = data.toString();
                        if (Sendflag == false) {
                            if (line.indexOf('BP30') > 0) {
                                console.log('Received: ' + line);
                                Sendflag = true;
                                SuccessDevice = SuccessDevice + 1;
                                // res.json(objNavigation);
                                client.destroy(); // kill client after server's response
                                SendModeCommand(i + 1);

                            } else {
                                Sendflag = true;

                                client.destroy();
                                SendModeCommand(i + 1);
                            }
                        };


                    });

                    client.on('close', function() {
                        console.log('Connection closed');
                    });

                } else {
                    res.send(SuccessDevice + " out of " + totalDevice + " Device Success");
                }
            }

            SendModeCommand(0);
        }).catch(function(error) {
            res.send(error);
        })
    } else {
        res.send("Please Select DeviceId.");
    }
})

//Send SOS Data
router.get('/SendSOS', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    var Numbers = req.query.Numbers;
    var DeviceId = req.query.DeviceId;
    var Type = req.query.Type;
    var TotalNumbers = req.query.Numbers.split(',').length;

    var Data = "(" + DeviceId + "DE22" + Type + "," + TotalNumbers + "," + Numbers + ")";
    console.log(Data);
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data);
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.indexOf('BE22') > 0) {
                console.log('Received: ' + line);
                var StatusCode = line.substring(17, 18);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '1') {
                    res.json({ success: true, message: 'SOS Numbers Save Successfully.' });
                } else {
                    res.json({ success: false, message: 'SOS Numbers could not save. Try again later.' });
                }

            } else {
                Sendflag = true;

                client.destroy();
                res.json({ success: false, message: 'SOS Numbers could not save. Try again later.' });
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


})

global.sendSOSNumbers = function(obj, callback) {
    // req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    var Numbers = obj.Numbers;
    var DeviceId = obj.DeviceId;
    var Type = obj.Type;
    var TotalNumbers = obj.Numbers.split(',').length;

    var Data = "(" + DeviceId + "DE22" + Type + "," + TotalNumbers + "," + Numbers + ")";
    console.log(Data);
    var client = new net.Socket();
    var Sendflag = false;

    client.connect(SocketPort, SocketIPAddress, function() {
        // console.log('G-Sensor send to ' + DeviceId);
        client.write(Data);
        // client.setTimeout(30000, function() {
        //     if (Sendflag == false) {
        //         Sendflag = true;
        //         res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
        //         client.destroy();
        //     };

        // });

        client.setTimeout(30000, function() {
            if (Sendflag == false) {
                Sendflag = true;

                client.destroy();
                var msg = { success: false, message: 'Device not connected. Try after 5 minute.' };
                callback(msg);
                // SendGSensorCommand(i + 1);
            };

        });
    });

    client.on('data', function(data) {
        var line = data.toString();
        if (Sendflag == false) {
            if (line.indexOf('BE22') > 0) {
                console.log('Received: ' + line);
                var StatusCode = line.substring(17, 18);
                Sendflag = true;
                // SuccessDevice = SuccessDevice + 1;
                // res.json(objNavigation);
                client.destroy(); // kill client after server's response
                if (StatusCode == '1') {
                    var msg = { success: true, message: 'SOS Numbers Save Successfully.' };
                    callback(msg);
                } else {
                    var msg = { success: false, message: 'SOS Numbers could not save. Try again later.' };
                    callback(msg);
                }

            } else {
                Sendflag = true;

                client.destroy();
                var msg = { success: false, message: 'SOS Numbers could not save. Try again later.' };
                callback(msg);
                // SendGSensorCommand(i + 1);
            }
        };


    });

    client.on('close', function() {
        console.log('Connection closed');
    });


}

//Transfer Speed Data to Temp Table
router.get('/TransferSpeedDataTempTable', function(req, res) {
    req.setTimeout(3600000);

    connection.query("SELECT * from tblbike where IsDeleted=false && DeviceType!='M2'", function(err, Bikerows, fields) {
        if (!err) {
            var lstSpeedData = [];
            for (var i = 0; i < Bikerows.length; i++) {
                var lstdata = [Bikerows[i].deviceid, parseInt(Bikerows[i].MaxSpeed).toString(), false, GetCurrentDate(), null];
                lstSpeedData.push(lstdata)
            }
            var sql = "INSERT INTO tbltempspeedsettings (DeviceId, Speed,IsGetCommand, CreatedDate, ModifiedDate) VALUES ?";
            connection.query(sql, [lstSpeedData], function(err, Petrows, fields) {
                if (!err) {
                    res.json({ success: true, message: "Data transfer successfully." });
                } else {
                    res.json({ success: false, message: "Can not Insert Data to temp table." });
                }
            });
        } else {
            res.json({ success: false, message: "Can not Insert Data to temp table." });
        }
    });

});

//Sync Speed Data
router.get('/SyncSpeedData', function(req, res) {
    req.setTimeout(3600000);
    connection.query("SELECT * from tblbike where IsDeleted=false and DeviceType!='M2' and IsOnline=true and MaxSpeed>0", function(err, Bikerows, fields) {
        if (!err) {
            if (Bikerows.length > 0) {
                function SendSpeed(i) {
                    if (i < Bikerows.length) {
                        if (Bikerows[i].MaxSpeed != null) {
                            connection.query("INSERT INTO tbltempspeedsettings (DeviceId, Speed,IsGetCommand, CreatedDate, ModifiedDate) VALUES('" + Bikerows[i].deviceid + "','" + parseInt(Bikerows[i].MaxSpeed).toString() + "',false,'" + GetCurrentDate() + "',null)", function(err, objBikeRow, fields) {
                                console.log(err);
                                if (!err) {
                                    var MaxSpeed = ("00" + Bikerows[i].MaxSpeed).slice(-3);
                                    var client = new net.Socket();
                                    var Sendflag = false;
                                    var DeviceId = Bikerows[i].deviceid;
                                    var commandId = objBikeRow.insertId;
                                    var Data = "(" + DeviceId + "DP12H" + MaxSpeed + "L000)";

                                    client.connect(SocketPort, SocketIPAddress, function() {
                                        console.log(Data);
                                        client.write(Data);
                                        client.setTimeout(120000, function() {
                                            if (Sendflag == false) {
                                                Sendflag = true;
                                                client.destroy();
                                                // res.json({
                                                //     success: false,
                                                //     message: "Device not Connected.Try again after 5 Minute",
                                                //     data: objUserExist
                                                // });
                                                SendSpeed(i + 1);
                                            };

                                        });
                                    });

                                    client.on('data', function(data) {
                                        var line = data.toString();
                                        if (Sendflag == false) {
                                            if (line.indexOf('BP12') > 0) {
                                                console.log('Received: ' + line);

                                                var deviceID = line.substring(1, 13);
                                                var SpeedDetail = line.substring(17, 25);

                                                Sendflag = true;

                                                client.destroy();


                                                // objUserExist.updateAttributes({ MaxSpeed: objUser.MaxSpeed }).then(function(responseUser) {
                                                //     funAuditLog.CreateAuditLog('UpdateBikeDeviceMaxSpeed', UserExist.username, deviceID + ' Update Maximum Speed');
                                                // res.json({
                                                //     success: true,
                                                //     message: "Maximum Speed updated successfully...",
                                                //     data: responseUser
                                                // });
                                                connection.query("Update tbltempspeedsettings set IsGetCommand=true, ModifiedDate='" + GetCurrentDate() + "' where id=" + commandId, function(err, Bikerows, fields) {
                                                    SendSpeed(i + 1);
                                                });
                                                //})
                                            } else {
                                                Sendflag = true;

                                                client.destroy();

                                                SendSpeed(i + 1);
                                            }

                                        }
                                    });

                                    client.on('close', function() {
                                        console.log('Connection closed');
                                    });
                                } else {
                                    SendSpeed(i + 1);
                                }
                            });
                        } else {
                            SendSpeed(i + 1);
                        }
                    } else {
                        res.json({ success: true, message: "Speed Data Sync successfully." });
                    }
                }
                SendSpeed(0)
            } else {
                res.json({ success: false, message: "No More data for Sync." });
            }
        } else {
            res.json({ success: false, message: "Could not sync Data." });
        }
    });
});

//BR00
router.get('/BR00Method', function(req, res) {
    var line = req.query.Code;

    BR00Method(line, function(resdata) {
        res.json(resdata);
    });
    // console.log("muyyyyy", line);
    // var deviceID = line.substring(1, 13);
    // var Date1 = line.substring(17, 23);
    // var Position = line.substring(23, 24);
    // var Lat = line.substring(24, 34);
    // var Lan = line.substring(34, 45);
    // var Speed = line.substring(45, 50);
    // var Time = line.substring(50, 56);
    // var Direction = line.substring(56, 62);
    // var Status = line.substring(62, 70);
    // var Sign = line.substring(70, 71);
    // var ReserveSection = line.substring(71, 79);

    // var day = parseInt(Date1.substring(4, 6));
    // var month = parseInt(Date1.substring(2, 4));
    // var year = parseInt("20" + Date1.substring(0, 2));
    // var hour = parseInt(Time.substring(0, 2));
    // var min = parseInt(Time.substring(2, 4));
    // var sec = parseInt(Time.substring(4, 6));

    // // var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
    // var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    // var GPSDate = year + "-" + month + "-" + day;
    // var CurrentDate = GetCurrentDate();

    // var Latitude = global.deg_to_lat_long(Lat);
    // var Longtitude = global.deg_to_lat_long(Lan);
    // console.log("Start Function", new Date());

    // var today = new Date();

    // var testsec = today.getUTCSeconds();
    // var testmin = today.getUTCMinutes();
    // var testhour = today.getUTCHours();

    // var testyear = today.getUTCFullYear();
    // var testmonth = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    // var testday = today.getUTCDate();
    // var Devicedate = new Date(year, month - 1, day, hour, min, sec);
    // var Currentdatetime = new Date(testyear, testmonth - 1, testday, testhour, testmin, testsec);
    // console.log("Device Datetime", Devicedate);
    // console.log("Current Datetime", Currentdatetime);
    // console.log("Time Difference =", (Currentdatetime - Devicedate));

    // connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Bikerows, fields) {
    //     if (!err && Bikerows.length > 0) {
    //         var objBike = Bikerows[0];
    //         if (objBike.DeviceType == 'M2-U' && Position == 'A') {
    //             connection.query("SELECT * from tblfence where deviceId=" + deviceID, function(err, rows, fields) {
    //                 if (!err && rows.length > 0) {
    //                     var response = rows[0];

    //                     var CheckPoints = {
    //                         latitude: parseFloat(Latitude),
    //                         longitude: parseFloat(Longtitude)
    //                     }

    //                     var IsPetInFence = true;

    //                     if (response.fencedraw == "circle") {
    //                         var CircleCenterPoints = {
    //                             latitude: parseFloat(response.lat),
    //                             longitude: parseFloat(response.lng)
    //                         }
    //                         var CircleRadius = parseFloat(response.range);
    //                         IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
    //                     } else if (response.fencedraw == "polygon" || response.fencedraw == "polyline") {
    //                         var lstpolygonDrawC = [];
    //                         var lstlatC = response.lat.split(',');
    //                         var lstlngC = response.lng.split(',');

    //                         for (var i = 0; i < lstlatC.length; i++) {
    //                             var objDraw = {
    //                                 latitude: parseFloat(lstlatC[i]),
    //                                 longitude: parseFloat(lstlngC[i])
    //                             }
    //                             lstpolygonDrawC.push(objDraw);
    //                         }
    //                         IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
    //                     } else if (response.fencedraw == "rectangle") {
    //                         var lstpolygonDrawC = [];
    //                         var lstlatC = response.lat.split(',');
    //                         var lstlngC = response.lng.split(',');

    //                         var objDraw = {
    //                             latitude: parseFloat(lstlatC[0]),
    //                             longitude: parseFloat(lstlngC[0])
    //                         }
    //                         lstpolygonDrawC.push(objDraw);
    //                         var objDraw = {
    //                             latitude: parseFloat(lstlatC[0]),
    //                             longitude: parseFloat(lstlngC[1])
    //                         }
    //                         lstpolygonDrawC.push(objDraw);
    //                         var objDraw = {
    //                             latitude: parseFloat(lstlatC[1]),
    //                             longitude: parseFloat(lstlngC[1])
    //                         }
    //                         lstpolygonDrawC.push(objDraw);
    //                         var objDraw = {
    //                             latitude: parseFloat(lstlatC[1]),
    //                             longitude: parseFloat(lstlngC[0])
    //                         }
    //                         lstpolygonDrawC.push(objDraw);
    //                         var objDraw = {
    //                             latitude: parseFloat(lstlatC[0]),
    //                             longitude: parseFloat(lstlngC[0])
    //                         }
    //                         lstpolygonDrawC.push(objDraw);

    //                         IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
    //                     };

    //                     // console.log("Fence Last State = " + objBike.IsInFence)
    //                     // console.log("Fence Current State = " + IsPetInFence)
    //                     if (IsPetInFence != objBike.IsInFence && objBike.IsFenceOnline) {

    //                         var AlarmCode = '6';
    //                         var message = '';
    //                         if (IsPetInFence == false) {
    //                             AlarmCode = '66';
    //                             message = objBike.bikeNumber + ' is out of Fence.';
    //                         } else {
    //                             AlarmCode = '6';
    //                             message = objBike.bikeNumber + ' is in Fence.';
    //                         }

    //                         var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + AlarmCode + "');";
    //                         connection.query(Alarmquery, function(err1, Alarmrows, fields) {

    //                             connection.query('UPDATE tblbike set IsInFence=' + IsPetInFence + ' WHERE DeviceId=' + deviceID, function(err, rows, fields) {
    //                                 console.log(err)
    //                                 var PushNotificationdata = {
    //                                     title: 'Fence',
    //                                     message: message,
    //                                     Fence: 'Default',
    //                                     otherfields: {
    //                                         deviceid: deviceID,
    //                                         PetId: objBike.id,
    //                                         PetName: objBike.bikeNumber
    //                                     }
    //                                 };
    //                                 if (IsPetInFence == false) {
    //                                     PushNotificationdata.Fence = 'FenceIn';
    //                                 } else {
    //                                     PushNotificationdata.Fence = 'FenceOut';
    //                                 }
    //                                 SendPushNotification(PushNotificationdata, objBike.iduser, 'Owner', 'OwnerFencePushNotification');
    //                             });
    //                         });
    //                     };
    //                 };
    //             });
    //         }
    //     }
    // });

    // // connection.query("SELECT user.MaxSpeed, bike.* from tbluserinformation as user inner join tblbike as bike where user.id = bike.iduser and deviceid=" + deviceID, function(err, Userrows, fields) {
    // //     if (!err && Userrows.length > 0) {
    // //         var objUser = Userrows[0];
    // //         var maxSpeed = parseFloat(objUser.MaxSpeed);
    // //         var deviceSpeed = parseFloat(Speed);
    // //         if (deviceSpeed > maxSpeed) {
    // //             var query = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + alarmcode + "');";
    // //             connection.query(query, function(err, rows, fields) {

    // //                 var PushNotificationdata = {
    // //                     title: 'Alert',
    // //                     message: 'Vehicle ' + objUser.bikeNumber + 'Max Speed alert! Please check!',
    // //                     Fence: 'Default',
    // //                     otherfields: {
    // //                         deviceid: deviceID,
    // //                         PetId: objUser.id,
    // //                         PetName: objUser.bikeNumber
    // //                     }
    // //                 };

    // //                 SendPushNotification(PushNotificationdata, objUser.iduser, 'Owner', 'OwnerMaxSpeedPushNotification');

    // //             });
    // //         }
    // //     }
    // // });

    // var IsAdvanture = false;
    // if (line.indexOf('BP04') > 0) {
    //     IsAdvanture = true;
    // }
    // //Insert data in gps
    // // var query = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "'," + IsAdvanture + ");";
    // var query = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture,MacAddress,GPSDate ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "'," + IsAdvanture + ",null,'" + GPSDate + "');";
    // connection.query(query, function(err, rows, fields) {
    //     var code = "BR00";
    //     if (line.indexOf('BP04') > 0) {
    //         code = "BP04";
    //     }

    //     var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('" + code + "', 'No Response', '" + CurrentDate + "');";
    //     connection.query(ResponceQuery, function(err, rows1, fields) {
    //         console.log("End Function", new Date())
    //         res.json("No Response");
    //         strResponce = "No Response";
    //     });

    //     var objConnection = {
    //         Position: Position,
    //         Speed: Speed,
    //         Deviceid: deviceID,
    //         Latitute: Latitude,
    //         Longitude: Longtitude,
    //         Direction: Direction,
    //     }

    //     if (new Date(GPSDateTime) <= new Date()) {
    //         io.sockets.emit('BikeRoute', JSON.stringify(objConnection));
    //     }
    // });
    //});
});


global.BR00Method = function(line, Callback) {
    //Server Reconnet If Disconneted
    if (connection.state == 'disconnected') {
        global.connection = mysql.createConnection({
            host: MysqlHost,
            user: Mysqluser,
            password: Mysqlpassword,
            database: Mysqldatabase
        });
    }
    // var line = req.query.Code;
    console.log("muyyyyy", line);
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
    var month = parseInt(Date1.substring(2, 4));
    var year = parseInt("20" + Date1.substring(0, 2));
    var hour = parseInt(Time.substring(0, 2));
    var min = parseInt(Time.substring(2, 4));
    var sec = parseInt(Time.substring(4, 6));

    // var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
    var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    var GPSDate = year + "-" + month + "-" + day;
    var CurrentDate = GetCurrentDate();

    var Latitude = global.deg_to_lat_long(Lat);
    var Longtitude = global.deg_to_lat_long(Lan);
    console.log("Start Function", new Date());

    var today = new Date();

    var testsec = today.getUTCSeconds();
    var testmin = today.getUTCMinutes();
    var testhour = today.getUTCHours();

    var testyear = today.getUTCFullYear();
    var testmonth = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
    var testday = today.getUTCDate();
    var Devicedate = new Date(year, month - 1, day, hour, min, sec);
    var Currentdatetime = new Date(testyear, testmonth - 1, testday, testhour, testmin, testsec);
    console.log("Device Datetime", Devicedate);
    console.log("Current Datetime", Currentdatetime);
    console.log("Time Difference =", (Currentdatetime - Devicedate));

    connection.query("SELECT * from tblfence where deviceId=" + deviceID, function(err, rows, fields) {
        if (!err && rows.length > 0) {
            connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Bikerows, fields) {
                if (!err && Bikerows.length > 0) {
                    var objBike = Bikerows[0];
                    if (objBike.DeviceType != 'M2' && Position == 'A') {

                        function checkFence(j) {
                            if (j < rows.length) {
                                rows[j].IsPetInFence = true;
                                var response = rows[j];

                                // var response = rows[0];

                                var CheckPoints = {
                                    latitude: parseFloat(Latitude),
                                    longitude: parseFloat(Longtitude)
                                }

                                // var IsPetInFence = true;

                                if (response.fencedraw == "circle") {
                                    var CircleCenterPoints = {
                                        latitude: parseFloat(response.lat),
                                        longitude: parseFloat(response.lng)
                                    }
                                    var CircleRadius = parseFloat(response.range);
                                    rows[j].IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
                                } else if (response.fencedraw == "polygon" || response.fencedraw == "polyline") {
                                    var lstpolygonDrawC = [];
                                    var lstlatC = response.lat.split(',');
                                    var lstlngC = response.lng.split(',');

                                    for (var i = 0; i < lstlatC.length; i++) {
                                        var objDraw = {
                                            latitude: parseFloat(lstlatC[i]),
                                            longitude: parseFloat(lstlngC[i])
                                        }
                                        lstpolygonDrawC.push(objDraw);
                                    }
                                    rows[j].IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                } else if (response.fencedraw == "rectangle") {
                                    var lstpolygonDrawC = [];
                                    var lstlatC = response.lat.split(',');
                                    var lstlngC = response.lng.split(',');

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

                                    rows[j].IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                };

                                // console.log("Fence Last State = " + objBike.IsInFence)
                                // console.log("Fence Current State = " + IsPetInFence)
                                if (rows[j].IsPetInFence != rows[j].IsInFence && rows[j].IsFenceOnline) {
                                    var AlarmCode = '6';
                                    var message = '';

                                    if (rows[j].IsPetInFence == false) {
                                        AlarmCode = '66';
                                        if (rows[j].name != null && rows[j].name != '' && rows[j].name != undefined) {
                                            message = objBike.bikeNumber + ' is out of ' + rows[j].name + ' Fence.';
                                        } else {
                                            message = objBike.bikeNumber + ' is out of Fence.';
                                        }
                                    } else {
                                        AlarmCode = '6';
                                        if (rows[j].name != null && rows[j].name != '' && rows[j].name != undefined) {
                                            message = objBike.bikeNumber + ' is in ' + rows[j].name + ' Fence.';
                                        } else {
                                            message = objBike.bikeNumber + ' is in Fence.';
                                        }
                                    }

                                    connection.query('UPDATE tblfence set IsInFence=' + rows[j].IsPetInFence + ' WHERE id=' + rows[j].id, function(err, rowsFence, fields) {
                                        console.log(err)
                                        var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + AlarmCode + "');";
                                        connection.query(Alarmquery, function(err1, Alarmrows, fields) {

                                            var PushNotificationdata = {
                                                title: 'Fence',
                                                message: message,
                                                Fence: 'Default',
                                                otherfields: {
                                                    deviceid: deviceID,
                                                    PetId: objBike.id,
                                                    PetName: objBike.bikeNumber
                                                }
                                            };
                                            if (rows[j].IsPetInFence == false) {
                                                PushNotificationdata.Fence = 'FenceIn';
                                            } else {
                                                PushNotificationdata.Fence = 'FenceOut';
                                            }
                                            SendPushNotification(PushNotificationdata, objBike.iduser, 'Owner', 'OwnerFencePushNotification');
                                            checkFence(j + 1);
                                        });
                                    });
                                } else {
                                    checkFence(j + 1);
                                }
                            } else {

                            }
                        }
                        checkFence(0);
                    }
                }
            });
        };
    });

    // connection.query("SELECT user.MaxSpeed, bike.* from tbluserinformation as user inner join tblbike as bike where user.id = bike.iduser and deviceid=" + deviceID, function(err, Userrows, fields) {
    //     if (!err && Userrows.length > 0) {
    //         var objUser = Userrows[0];
    //         var maxSpeed = parseFloat(objUser.MaxSpeed);
    //         var deviceSpeed = parseFloat(Speed);
    //         if (deviceSpeed > maxSpeed) {
    //             var query = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + alarmcode + "');";
    //             connection.query(query, function(err, rows, fields) {

    //                 var PushNotificationdata = {
    //                     title: 'Alert',
    //                     message: 'Vehicle ' + objUser.bikeNumber + 'Max Speed alert! Please check!',
    //                     Fence: 'Default',
    //                     otherfields: {
    //                         deviceid: deviceID,
    //                         PetId: objUser.id,
    //                         PetName: objUser.bikeNumber
    //                     }
    //                 };

    //                 SendPushNotification(PushNotificationdata, objUser.iduser, 'Owner', 'OwnerMaxSpeedPushNotification');

    //             });
    //         }
    //     }
    // });

    var IsAdvanture = false;
    if (line.indexOf('BP04') > 0) {
        IsAdvanture = true;
    }
    //Insert data in gps
    // var query = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "'," + IsAdvanture + ");";
    var query = "INSERT INTO tblgpsscanner (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture,MacAddress,GPSDate ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "'," + IsAdvanture + ",null,'" + GPSDate + "');";
    connection.query(query, function(err, rows, fields) {
        console.log("***************BR00**************")
        console.log(err)
        console.log("*****************************")
        var code = "BR00";
        if (line.indexOf('BP04') > 0) {
            code = "BP04";
        }

        // var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('" + code + "', 'No Response', '" + CurrentDate + "');";
        // connection.query(ResponceQuery, function(err, rows1, fields) {
        console.log("End Function", new Date())
        Callback("No Response");
        strResponce = "No Response";
        //});

        var objConnection = {
            Position: Position,
            Speed: Speed,
            Deviceid: deviceID,
            Latitute: Latitude,
            Longitude: Longtitude,
            Direction: Direction,
        }

        if (new Date(GPSDateTime) <= new Date() && Position == 'A') {
            io.sockets.emit('BikeRoute', JSON.stringify(objConnection));
        }
    });
    //});
};
// var deviceID = '075034904002';
// connection.query("SELECT * from tblbike where deviceid=" + deviceID, function(err, Bikerows, fields) {
//     //tblPetgps Entry
//     if (!err && Bikerows.length > 0) {
//         var objPet = Bikerows[0];
//         console.log(objPet)
//         if (objPet.IsDeleted.toString('hex') == '01') {
//             console.log("Deleted")
//         };
//         console.log(objPet.IsCharging.toString('hex'))

//     }
// });

//BP05
router.get('/BP05Method', function(req, res) {
    var line = req.query.Code;
    console.log(line)
    var IMEI = line.substring(17, 32);
    var deviceID = line.substring(1, 13);

    var Date1 = line.substring(32, 38);
    var Position = line.substring(38, 39);
    var Lat = line.substring(39, 49);
    var Lan = line.substring(49, 60);
    var Speed = line.substring(60, 65);
    var Time = line.substring(65, 71);
    var Direction = line.substring(71, 77);
    var Status = line.substring(77, 85);
    var Sign = line.substring(85, 86);

    var ReserveSection = line.substring(86, 94);

    var day = parseInt(Date1.substring(4, 6));
    var month = parseInt(Date1.substring(2, 4));
    var year = parseInt("20" + Date1.substring(0, 2));
    var hour = parseInt(Time.substring(0, 2));
    var min = parseInt(Time.substring(2, 4));
    var sec = parseInt(Time.substring(4, 6));

    // var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
    var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    var CurrentDate = GetCurrentDate();


    var Latitude = global.deg_to_lat_long(Lat);
    var Longtitude = global.deg_to_lat_long(Lan);


    connection.query("SELECT * from tblgpsdevice where DeviceId=" + deviceID, function(err, rows, fields) {
        if (!err) {
            if (rows.length > 0) {
                //tblapisresponse Entry
                var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BP05', '(" + deviceID + "AP05)', '" + CurrentDate + "');";
                connection.query(ResponceQuery, function(err, rows1, fields) {
                    res.json("(" + deviceID + "AP05)");
                    strResponce = "(" + deviceID + "AP05)";
                });
            } else {
                //tblPetgps Entry
                // var query = "INSERT INTO tblgpsdevice (DeviceId,IMEI,CreatedDate,Latitude,Longitude,speed,Direction ) VALUES ('" + deviceID + "','" + IMEI + "','" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Speed + "', '" + Direction + "');";
                // var query = "INSERT INTO tblgpsdevice (DeviceId,IMEI,CreatedDate,Latitude,Longitude,speed,Direction,Type ) VALUES ('" + deviceID + "','" + IMEI + "','" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Speed + "', '" + Direction + "','M2');";
                // connection.query(query, function(err, rows, fields) {
                //tblapisresponse Entry
                var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BP05', '(" + deviceID + "AP05)', '" + CurrentDate + "');";
                connection.query(ResponceQuery, function(err, rows1, fields) {
                    res.json("(" + deviceID + "AP05)");
                    strResponce = "(" + deviceID + "AP05)";
                });
                //});
            }
        }
    })

    connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Bikerows, fields) {
        //tblPetgps Entry
        if (!err && Bikerows.length > 0) {
            var objPet = Bikerows[0];
            flgOnline = true;

            var query = "Update tblbike set IsOnline=" + flgOnline + " where deviceid='" + deviceID + "';";
            connection.query(query, function(err, rows, fields) {
                //tblapisresponse Entry
                console.log(objPet.IsDeleted.toString('hex'));
                if (objPet.IsDeleted.toString('hex') == '00') {
                    var PushNotificationdata = {
                        title: 'Alert',
                        message: 'Vehicle ' + objPet.bikeNumber + ' Device online alert! Please check!',
                        Fence: 'Default',
                        otherfields: {
                            deviceid: deviceID,
                            PetId: objPet.id,
                            PetName: objPet.bikeNumber
                        }
                    };

                    if (objPet.DeviceType == 'M2') {
                        SendPushNotification(PushNotificationdata, objPet.iduser, 'Shop', null);
                    } else {


                        SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
                    }
                };

                var objConnection = {
                    deviceid: deviceID,
                    PetId: objPet.id,
                    Status: flgOnline
                }
                io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
            });

            if (ReserveSection.toString() != "00000000" && objPet.DeviceType != 'M2') {
                connection.query("SELECT * from tbluserinformation where id=" + objPet.iduser, function(err, Userrows, fields) {
                    if (!err && Userrows.length > 0) {
                        var objUser = Userrows[0];
                        var SecurityFlg = line.substring(88, 89);

                        if (objUser.IsOwnerSecurity.toString() != SecurityFlg) {
                            setTimeout(function() {
                                var client = new net.Socket();
                                var Data = "(" + deviceID + "DV03" + objUser.IsOwnerSecurity.toString() + ")";
                                var Sendflag = false;
                                client.connect(SocketPort, SocketIPAddress, function() {
                                    console.log(Data);
                                    client.write(Data);
                                    client.setTimeout(180000, function() {
                                        if (Sendflag == false) {
                                            client.destroy();
                                        };
                                    });
                                });

                                client.on('data', function(data) {
                                    var line = data.toString();
                                    if (Sendflag == false) {
                                        Sendflag = true;
                                        if (line.indexOf('BV03') > 0) {
                                            console.log('Received: ' + line);
                                            var deviceID = line.substring(1, 13);
                                            var SecurityFlag = line.substring(17, 18);
                                            client.destroy();
                                        } else {
                                            client.destroy();
                                        }
                                    }
                                });

                                client.on('close', function() {
                                    console.log('Connection closed');
                                });
                            }, 5000)
                        }
                    }
                });
            }

        }
    });



})

//BP01
router.get('/BP01Method', function(req, res) {
    var line = req.query.Code;
    console.log(line)
    var lstData = line.split(',');
    var IMEI = lstData[1];
    var deviceID = line.substring(1, 13);
    // var CurrentOperatingMode = lstData[2].substring(0, lstData[2].length - 1);

    var Version = lstData[0].substring(17, lstData[0].length);

    var CurrentDate = GetCurrentDate();

    connection.query("Update tblgpsdevice set IsOldDevice=0,Version='" + Version + "' where DeviceId=" + deviceID, function(err, rows, fields) {
        if (!err) {
            connection.query("Update tblbike set IsOldDevice=0 where deviceid=" + deviceID, function(err, rows, fields) {
                var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BP01', 'No Response', '" + CurrentDate + "');";
                connection.query(ResponceQuery, function(err, rows1, fields) {
                    res.json("No Response");
                    strResponce = "No Response";
                });
            })
        }
    })
})

//BP00
router.get('/BP00Method', function(req, res) {
    var line = req.query.Code;
    console.log(line)
    BP00Method(line, function(resdata) {
        res.json(resdata);
    });
    // var IMEI = line.substring(17, 32);
    // var deviceID = line.substring(1, 13);
    // var Power = line.substring(line.lastIndexOf('P'), line.lastIndexOf('P') + 3);
    // var charging = line.substring(line.length - 2, line.length - 1);

    // var BatteryPercentage = parseInt(Power.substring(1, 3), 16);

    // // var IsWireCut = true;
    // // if (charging == '1') {
    // //     IsWireCut = false;
    // // };

    // var CurrentDate = GetCurrentDate();

    // //tblPetgps Entry
    // var query = "INSERT INTO tblhandshake (DeviceId,GPSModuleNumber,Power,Charging,Datetime ) VALUES ('" + deviceID + "','" + deviceID + "','" + Power + "', '" + charging + "', '" + CurrentDate + "');";
    // connection.query(query, function(err, rows, fields) {
    //     //Check for WireCut Ready
    //     connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Bikerows, fields) {
    //         if (!err && Bikerows.length > 0) {
    //             //Update Pet
    //             IsOnline = true;
    //             var Updatequery = "UPDATE tblbike set DeviceBattery='" + BatteryPercentage + "',IsOnline=" + IsOnline + ",HandshakDatetime='" + CurrentDate + "' WHERE deviceid = '" + deviceID + "';";
    //             connection.query(Updatequery, function(err, rows1, fields) {

    //                 var objBike = Bikerows[0];
    //                 if (!objBike.IsOnline && IsOnline) {
    //                     console.log(objBike.IsDeleted.toString('hex'));
    //                     if (objBike.IsDeleted.toString('hex') == '00') {
    //                         var PushNotificationdata = {
    //                             title: 'Alert',
    //                             message: 'Vehicle ' + objBike.bikeNumber + 'Device online again, please confirm!',
    //                             Fence: 'Default',
    //                             otherfields: {
    //                                 deviceid: deviceID,
    //                                 PetId: objBike.id,
    //                                 PetName: objBike.bikeNumber
    //                             }
    //                         };

    //                         if (objBike.DeviceType == 'M2') {
    //                             SendPushNotification(PushNotificationdata, objBike.iduser, 'Shop', null);
    //                         } else {
    //                             SendPushNotification(PushNotificationdata, objBike.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
    //                         }
    //                     }
    //                     var objConnection = {
    //                         deviceid: deviceID,
    //                         PetId: objBike.id,
    //                         Status: IsOnline
    //                     }
    //                     io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));

    //                 };

    //             });
    //         }

    //         //tblapisresponse Entry
    //         var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BP00', '(" + deviceID + "AP01HSO)', '" + CurrentDate + "');";
    //         connection.query(ResponceQuery, function(err, rows2, fields) {
    //             res.json("(" + deviceID + "AP01HSO)");
    //             strResponce = "(" + deviceID + "AP01HSO)";
    //         });
    //     });
    // });

})

global.BP00Method = function(line, Callback) {
    //Server Reconnet If Disconneted
    if (connection.state == 'disconnected') {
        global.connection = mysql.createConnection({
            host: MysqlHost,
            user: Mysqluser,
            password: Mysqlpassword,
            database: Mysqldatabase
        });
    }

    var deviceID = line.substring(1, 13);
    var Power = line.substring(line.lastIndexOf('P'), line.lastIndexOf('P') + 3);
    var charging = line.substring(line.length - 2, line.length - 1);

    var BatteryPercentage = parseInt(Power.substring(1, 3), 16);

    // var IsWireCut = true;
    // if (charging == '1') {
    //     IsWireCut = false;
    // };

    var CurrentDate = GetCurrentDate();

    //tblPetgps Entry
    var query = "INSERT INTO tblhandshake (DeviceId,GPSModuleNumber,Power,Charging,Datetime ) VALUES ('" + deviceID + "','" + deviceID + "','" + Power + "', '" + charging + "', '" + CurrentDate + "');";
    connection.query(query, function(err, rows, fields) {
        console.log("***************BP00**************")
        console.log(err)
        console.log("*****************************")
            //Check for WireCut Ready
        connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Bikerows, fields) {
            if (!err && Bikerows.length > 0) {
                //Update Pet
                IsOnline = true;
                var Updatequery = "UPDATE tblbike set DeviceBattery='" + BatteryPercentage + "',IsOnline=" + IsOnline + ",HandshakDatetime='" + CurrentDate + "' WHERE deviceid = '" + deviceID + "';";
                connection.query(Updatequery, function(err, rows1, fields) {

                    var objBike = Bikerows[0];
                    if (!objBike.IsOnline && IsOnline) {
                        console.log(objBike.IsDeleted.toString('hex'));
                        if (objBike.IsDeleted.toString('hex') == '00') {
                            var PushNotificationdata = {
                                title: 'Alert',
                                message: 'Vehicle ' + objBike.bikeNumber + ' Device online alert! Please check!',
                                Fence: 'Default',
                                otherfields: {
                                    deviceid: deviceID,
                                    PetId: objBike.id,
                                    PetName: objBike.bikeNumber
                                }
                            };

                            if (objBike.DeviceType == 'M2') {
                                SendPushNotification(PushNotificationdata, objBike.iduser, 'Shop', null);
                            } else {
                                SendPushNotification(PushNotificationdata, objBike.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
                            }
                        }
                        var objConnection = {
                            deviceid: deviceID,
                            PetId: objBike.id,
                            Status: IsOnline
                        }
                        io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));

                    };

                });
            }

            //tblapisresponse Entry
            var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BP00', '(" + deviceID + "AP01HSO)', '" + CurrentDate + "');";
            connection.query(ResponceQuery, function(err, rows2, fields) {
                // res.json("(" + deviceID + "AP01HSO)");
                Callback("(" + deviceID + "AP01HSO)");
                strResponce = "(" + deviceID + "AP01HSO)";
            });
        });
    });
};

//BO01
router.get('/BO01Method', function(req, res) {
    var line = req.query.Code;
    var deviceID = line.substring(1, 13);
    var alarmcode = line.substring(17, 18);
    var Date1 = line.substring(18, 24);
    var Position = line.substring(24, 25);
    var Lat = line.substring(25, 35);
    var Lan = line.substring(35, 46);
    var Speed = line.substring(46, 51);
    // var SpeedInKm = parseInt(Speed) * 1.852;
    var Time = line.substring(51, 57);
    var Direction = line.substring(57, 63);
    var Status = line.substring(63, 71);
    var Sign = line.substring(71, 72);
    var ReserveSection = line.substring(72, 80);

    var day = parseInt(Date1.substring(4, 6));
    var month = parseInt(Date1.substring(2, 4));
    var year = parseInt("20" + Date1.substring(0, 2));
    var hour = parseInt(Time.substring(0, 2));
    var min = parseInt(Time.substring(2, 4));
    var sec = parseInt(Time.substring(4, 6));

    //var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
    var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    var CurrentDate = GetCurrentDate();

    var Latitude = global.deg_to_lat_long(Lat);
    var Longtitude = global.deg_to_lat_long(Lan);

    strResponce = "(" + deviceID + "AS01" + alarmcode + ")";

    var IsAdvanture = false;
    //console.log("Alarm COde = " + alarmcode)
    //tblPetgps Entry

    // console.log("Data Date:", new Date(GPSDateTime));
    // console.log("New Date:", new Date());

    //Umang
    if (alarmcode.toString() == "5" && Position == 'A') {

        // var flgIsMaxSpeedNotification = false;
        // var prevDatetime = new Date(GPSDateTime);
        // var newDate = convertdateformat(prevDatetime.setMinutes(prevDatetime.getMinutes() - 30));
        // connection.query("SELECT * from tblalarm where Datetime >'" + newDate + "' and AlarmCode = '5'", function(err, PetGpsDetailrows, fields) {
        //     if (!err && PetGpsDetailrows.length > 0) {
        //         var oldDate = convertdateformat(PetGpsDetailrows[0].Datetime);
        //         connection.query("SELECT * from tblpetgps where Datetime >'" + oldDate + "' and Datetime <'" + prevDatetime + "' and GPSPositioning = 'A' ORDER BY Datetime DESC", function(err, PetGpsrows, fields) {
        //             if (PetGpsrows == undefined) {
        //                 // flgIsMaxSpeedNotification = true;
        //                 SendMaxSpeedAlarm();
        //             }
        //         });
        //     } else {
        //         // flgIsMaxSpeedNotification = true;
        //         SendMaxSpeedAlarm();
        //     }
        // });
        var prevDatetime = new Date(GPSDateTime);
        var OneMinPrevDatetime = new Date(GPSDateTime);
        var PreDate = convertdateformat(prevDatetime);
        var OneMinPreDate = convertdateformat(OneMinPrevDatetime.setMinutes(OneMinPrevDatetime.getMinutes() - 1));
        var newDate = convertdateformat(prevDatetime.setMinutes(prevDatetime.getMinutes() - 30));
        connection.query("SELECT * from tblalarm where Datetime >'" + newDate + "' and AlarmCode = '5' and DeviceId='" + deviceID + "' order by Id desc", function(err, PetGpsDetailrows, fields) {
            if (!err && PetGpsDetailrows.length > 0) {
                var oldDate = convertdateformat(PetGpsDetailrows[0].Datetime);
                connection.query("SELECT * from tblgpsscanner where Datetime >'" + oldDate + "' and Datetime <'" + PreDate + "' and DeviceId='" + deviceID + "' and GPSPositioning = 'A' ORDER BY Id DESC", function(err, PetGpsrows, fields) {
                    if (PetGpsrows.length == 0) {
                        // flgIsMaxSpeedNotification = true;
                        // SendMaxSpeedAlarm();
                        connection.query("SELECT * from tblalarm where Datetime >'" + OneMinPreDate + "' and AlarmCode = '5' and DeviceId='" + deviceID + "' order by Id desc", function(err, PetGpsOneMinDetailrows, fields) {
                            if (PetGpsOneMinDetailrows.length == 0) {
                                SendMaxSpeedAlarm();
                            } else {
                                res.json(strResponce);
                            }
                        });
                    } else {
                        res.json(strResponce);
                    }
                });
            } else {
                // flgIsMaxSpeedNotification = true;
                SendMaxSpeedAlarm();
            }
        });

        function SendMaxSpeedAlarm() {
            console.log("Call Max Speed Notification");
            connection.query("SELECT user.MaxSpeed as UserMaxSpeed, bike.* from tbluserinformation as user inner join tblbike as bike where user.id = bike.iduser and deviceid=" + deviceID, function(err, Userrows, fields) {
                if (!err && Userrows.length > 0) {
                    var objUser = Userrows[0];
                    var maxSpeed = 0;
                    if (objUser.MaxSpeed != null && objUser.MaxSpeed != undefined) {
                        maxSpeed = parseFloat(objUser.MaxSpeed);
                    } else {
                        maxSpeed = parseFloat(objUser.UserMaxSpeed);
                    }

                    var deviceSpeed = parseFloat(Speed);
                    //if (deviceSpeed > maxSpeed) {
                    //Speed = maxSpeed;
                    // }

                    var query = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + maxSpeed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + alarmcode + "');";
                    connection.query(query, function(err, rows, fields) {

                        // var GPSquery = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "'," + IsAdvanture + ");";
                        // connection.query(GPSquery, function(err, rows, fields) {

                        var objConnection = {
                            Position: Position,
                            Speed: Speed,
                            Deviceid: deviceID,
                            Latitute: Latitude,
                            Longitude: Longtitude,
                            Direction: Direction,
                        }
                        io.sockets.emit('BikeRoute', JSON.stringify(objConnection));

                        // connection.query("Update tblbike set IsWireCut=true where deviceid=" + deviceID, function (err1, rows, fields) {

                        //     if (!err) {
                        connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Petrows, fields) {
                            if (!err && Petrows.length > 0) {
                                var objPet = Petrows[0];

                                // if (flgIsMaxSpeedNotification == true) {
                                console.log(objPet.IsDeleted.toString('hex'));
                                if (objPet.IsDeleted.toString('hex') == '00') {
                                    var PushNotificationdata = {
                                        title: 'Alert',
                                        message: 'Vehicle ' + objPet.bikeNumber + 'Max Speed alert! Please check!',
                                        Fence: 'Default',
                                        otherfields: {
                                            deviceid: deviceID,
                                            PetId: objPet.id,
                                            PetName: objPet.bikeNumber
                                        }
                                    };
                                    SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerMaxSpeedPushNotification');
                                }
                                // }

                                var objConnection = {
                                    AlarmCode: alarmcode.toString(),
                                    DeviceId: deviceID,
                                    Datetime: GPSDateTime,
                                    IdUser: objPet.iduser,
                                    bikeNumber: objPet.bikeNumber
                                }
                                if (new Date(GPSDateTime) <= new Date()) {
                                    io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                                }
                            }
                        });
                        //     }
                        // });

                        //tblapisresponse Entry
                        var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BO01', '" + strResponce + "', '" + CurrentDate + "');";
                        connection.query(ResponceQuery, function(err, rows2, fields) {
                            res.json(strResponce);
                        });

                        // });
                    });
                }
            })
        }
    } else if (alarmcode.toString() == "7") {

        // var flgIsNotification = false;
        // var prevDatetime = new Date(GPSDateTime);
        // var newDate = convertdateformat(prevDatetime.setMinutes(prevDatetime.getMinutes() - 30));
        // connection.query("SELECT * from tblalarm where Datetime >'" + newDate + "' and AlarmCode = '7'", function (err, PetGpsDetailrows, fields) {
        //     if (!err && PetGpsDetailrows.length > 0) {
        //         var oldDate = convertdateformat(PetGpsDetailrows[0].Datetime);
        //         connection.query("SELECT * from tblpetgps where Datetime >'" + oldDate + "' and Datetime <'" + prevDatetime + "' and GPSPositioning = 'A' ORDER BY Datetime DESC", function (err, PetGpsrows, fields) {
        //             if (PetGpsrows == undefined) {
        //                 // flgIsNotification = true;
        //                 SendVibrationNotification();
        //             }
        //         });
        //     } else {
        //         // flgIsNotification = true;
        //         SendVibrationNotification();
        //     }
        // });
        var prevDatetime = new Date(GPSDateTime);
        var OneMinPrevDatetime = new Date(GPSDateTime);
        var PreDate = convertdateformat(prevDatetime);
        var OneMinPreDate = convertdateformat(OneMinPrevDatetime.setMinutes(OneMinPrevDatetime.getMinutes() - 1));
        var newDate = convertdateformat(prevDatetime.setMinutes(prevDatetime.getMinutes() - 30));
        connection.query("SELECT * from tblalarm where Datetime >'" + newDate + "' and AlarmCode = '7' and DeviceId='" + deviceID + "' order by Id desc", function(err, PetGpsDetailrows, fields) {
            if (!err && PetGpsDetailrows.length > 0) {
                var oldDate = convertdateformat(PetGpsDetailrows[0].Datetime);
                console.log("Old Date = " + oldDate)
                console.log("Previous Date = " + PreDate)
                console.log("Previous Date = " + newDate)
                connection.query("SELECT * from tblgpsscanner where Datetime >'" + oldDate + "' and Datetime <'" + PreDate + "' and DeviceId='" + deviceID + "' and GPSPositioning = 'A' ORDER BY Id DESC", function(err, PetGpsrows, fields) {
                    if (PetGpsrows.length == 0) {
                        // flgIsNotification = true;
                        // SendVibrationNotification();
                        connection.query("SELECT * from tblalarm where Datetime >'" + OneMinPreDate + "' and AlarmCode = '7' and DeviceId='" + deviceID + "' order by Id desc", function(err, PetGpsOneMinDetailrows, fields) {
                            if (PetGpsOneMinDetailrows.length == 0) {
                                SendVibrationNotification();
                            } else {
                                res.json(strResponce);
                            }
                        });
                    } else {
                        res.json(strResponce);
                    }
                });
            } else {
                // flgIsNotification = true;
                SendVibrationNotification();
            }
        });

        function SendVibrationNotification() {
            console.log("Call Vibration Notification");
            var query = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + alarmcode + "');";
            connection.query(query, function(err, rows, fields) {

                // var GPSquery = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "'," + IsAdvanture + ");";
                // connection.query(GPSquery, function(err, rows, fields) {

                var objConnection = {
                    Position: Position,
                    Speed: Speed,
                    Deviceid: deviceID,
                    Latitute: Latitude,
                    Longitude: Longtitude,
                    Direction: Direction,
                }
                io.sockets.emit('BikeRoute', JSON.stringify(objConnection));

                // connection.query("Update tblbike set IsWireCut=true where deviceid=" + deviceID, function (err1, rows, fields) {

                // if (!err) {
                connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Petrows, fields) {
                    if (!err && Petrows.length > 0) {

                        var objPet = Petrows[0];
                        // if (flgIsNotification == true) {
                        console.log(objPet.IsDeleted.toString('hex'));
                        if (objPet.IsDeleted.toString('hex') == '00') {
                            var PushNotificationdata = {
                                title: 'Alert',
                                message: 'Vehicle ' + objPet.bikeNumber + ' Vibrating alert! Please check!',
                                Fence: 'Default',
                                otherfields: {
                                    deviceid: deviceID,
                                    PetId: objPet.id,
                                    PetName: objPet.bikeNumber
                                }
                            };
                            SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerVibrationPushNotification');
                        }
                        // }

                        var objConnection = {
                            AlarmCode: alarmcode.toString(),
                            DeviceId: deviceID,
                            Datetime: GPSDateTime,
                            IdUser: objPet.iduser,
                            bikeNumber: objPet.bikeNumber
                        }
                        if (new Date(GPSDateTime) <= new Date()) {
                            io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                        }
                    }
                });
                // }
                // });

                //tblapisresponse Entry
                var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BO01', '" + strResponce + "', '" + CurrentDate + "');";
                connection.query(ResponceQuery, function(err, rows2, fields) {
                    res.json(strResponce);
                });

                // });
            });
        }
    } else if (alarmcode.toString() == "0") {
        var prevDatetime = new Date(GPSDateTime);
        var OneMinPrevDatetime = new Date(GPSDateTime);
        var OneMinPreDate = convertdateformat(OneMinPrevDatetime.setMinutes(OneMinPrevDatetime.getMinutes() - 1));

        connection.query("SELECT * from tblalarm where Datetime >'" + OneMinPreDate + "' and AlarmCode = '0' and DeviceId='" + deviceID + "' order by Id desc", function(err, PetGpsOneMinDetailrows, fields) {
            if (PetGpsOneMinDetailrows.length == 0) {
                SendWirecutNotification();
            } else {
                res.json(strResponce);
            }
        });

        function SendWirecutNotification() {
            var query = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + alarmcode + "');";
            connection.query(query, function(err, rows, fields) {

                // var GPSquery = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "'," + IsAdvanture + ");";
                // connection.query(GPSquery, function(err, rows, fields) {

                var objConnection = {
                    Position: Position,
                    Speed: Speed,
                    Deviceid: deviceID,
                    Latitute: Latitude,
                    Longitude: Longtitude,
                    Direction: Direction,
                }
                io.sockets.emit('BikeRoute', JSON.stringify(objConnection));

                // connection.query("Update tblbike set IsWireCut=true where deviceid=" + deviceID, function (err1, rows, fields) {

                // if (!err) {
                connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Petrows, fields) {
                    if (!err && Petrows.length > 0) {
                        var objPet = Petrows[0];
                        console.log(objPet.IsDeleted.toString('hex'));
                        if (objPet.IsDeleted.toString('hex') == '00') {
                            var PushNotificationdata = {
                                title: 'Alert',
                                message: 'Vehicle ' + objPet.bikeNumber + ' Wire Cut alert! Please check!',
                                // Fence: 'Default',
                                Fence: 'FenceIn',
                                otherfields: {
                                    deviceid: deviceID,
                                    PetId: objPet.id,
                                    PetName: objPet.bikeNumber
                                }
                            };
                            SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerWireCutPushNotification');
                        }
                        var objConnection = {
                            AlarmCode: alarmcode.toString(),
                            DeviceId: deviceID,
                            Datetime: GPSDateTime,
                            IdUser: objPet.iduser,
                            bikeNumber: objPet.bikeNumber
                        }
                        if (new Date(GPSDateTime) <= new Date()) {
                            io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                        }
                    }
                });
                // }
                // });

                //tblapisresponse Entry
                var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BO01', '" + strResponce + "', '" + CurrentDate + "');";
                connection.query(ResponceQuery, function(err, rows2, fields) {
                    res.json(strResponce);
                });

                // });
            });
        }
    } else if (alarmcode.toString() == "2") {
        var prevDatetime = new Date(GPSDateTime);
        var OneMinPrevDatetime = new Date(GPSDateTime);
        var OneMinPreDate = convertdateformat(OneMinPrevDatetime.setMinutes(OneMinPrevDatetime.getMinutes() - 1));

        connection.query("SELECT * from tblalarm where Datetime >'" + OneMinPreDate + "' and AlarmCode = '2' and DeviceId='" + deviceID + "' order by Id desc", function(err, PetGpsOneMinDetailrows, fields) {
            if (PetGpsOneMinDetailrows.length == 0) {
                SendSOSNotification();
            } else {
                res.json(strResponce);
            }
        });

        function SendSOSNotification() {
            var query = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + alarmcode + "');";
            connection.query(query, function(err, rows, fields) {

                var GPSquery = "INSERT INTO tblgpsscanner (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,IsAdvanture ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "'," + IsAdvanture + ");";
                connection.query(GPSquery, function(err, rows, fields) {

                    var objConnection = {
                        Position: Position,
                        Speed: Speed,
                        Deviceid: deviceID,
                        Latitute: Latitude,
                        Longitude: Longtitude,
                        Direction: Direction,
                    }
                    io.sockets.emit('BikeRoute', JSON.stringify(objConnection));

                    // connection.query("Update tblbike set IsWireCut=true where deviceid=" + deviceID, function (err1, rows, fields) {

                    // if (!err) {
                    connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Petrows, fields) {
                        if (!err && Petrows.length > 0) {
                            var objPet = Petrows[0];
                            console.log(objPet.IsDeleted.toString('hex'));
                            if (objPet.IsDeleted.toString('hex') == '00') {
                                var PushNotificationdata = {
                                    title: 'Alert',
                                    message: 'Vehicle ' + objPet.bikeNumber + ' SOS alert! Please check!',
                                    // Fence: 'Default',
                                    Fence: 'FenceIn',
                                    otherfields: {
                                        deviceid: deviceID,
                                        PetId: objPet.id,
                                        PetName: objPet.bikeNumber
                                    }
                                };
                                SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerSOSPushNotification');
                            }
                            var objConnection = {
                                AlarmCode: alarmcode.toString(),
                                DeviceId: deviceID,
                                Datetime: GPSDateTime,
                                IdUser: objPet.iduser,
                                bikeNumber: objPet.bikeNumber
                            }
                            if (new Date(GPSDateTime) <= new Date()) {
                                io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                            }
                        }
                    });
                    // }
                    // });

                    //tblapisresponse Entry
                    var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BO01', '" + strResponce + "', '" + CurrentDate + "');";
                    connection.query(ResponceQuery, function(err, rows2, fields) {
                        res.json(strResponce);
                    });

                });
            });
        }
    } else {
        res.json(strResponce);
    }
})

//BE21
router.get('/BE21Method', function(req, res) {
    var line = req.query.Code;

    global.BE21Method(line, function(resdata) {
        res.send(resdata);
    });
    // console.log(line)
    //     // var IMEI = line.substring(17, 32);
    // var deviceID = line.substring(1, 13);

    // var ACCStatus = line.substring(17, 18);
    // var OtherStatus = line.substring(18, 22);

    // var FlagStatus = false;
    // if (ACCStatus == '1') {
    //     FlagStatus = true;
    // }

    // // connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Bikerows, fields) {
    // //     //tblPetgps Entry
    // //     if (!err && Bikerows.length > 0) {
    // //         var objPet = Bikerows[0];
    // //         flgOnline = true;

    // var query = "Update tblbike set IsACC=" + FlagStatus + ", IsACCEnable=true where deviceid='" + deviceID + "';";
    // connection.query(query, function(err, rows, fields) {
    //     //tblapisresponse Entry
    //     res.send("No Response");
    //     // if (objPet.IsDeleted.toString('hex') == '00') {
    //     //     var PushNotificationdata = {
    //     //         title: 'Alert',
    //     //         message: 'Vehicle ' + objPet.bikeNumber + ' Device online alert! Please check!',
    //     //         Fence: 'Default',
    //     //         otherfields: {
    //     //             deviceid: deviceID,
    //     //             PetId: objPet.id,
    //     //             PetName: objPet.bikeNumber
    //     //         }
    //     //     };

    //     //     if (objPet.DeviceType == 'M2') {
    //     //         SendPushNotification(PushNotificationdata, objPet.iduser, 'Shop', null);
    //     //     } else {


    //     //         SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
    //     //     }
    //     // };

    //     // var objConnection = {
    //     //     deviceid: deviceID,
    //     //     PetId: objPet.id,
    //     //     Status: flgOnline
    //     // }
    //     // io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
    // });

    // var objConnection = {
    //     DeviceId: deviceID,
    //     IsACC: FlagStatus,
    // }

    // io.sockets.emit('BikeACC', JSON.stringify(objConnection));




    //     }
    // });



})

global.BE21Method = function(line, Callback) {
    console.log(line)
        // var IMEI = line.substring(17, 32);
    var deviceID = line.substring(1, 13);

    var ACCStatus = line.substring(17, 18);
    var OtherStatus = line.substring(18, 22);

    var FlagStatus = false;
    if (ACCStatus == '1') {
        FlagStatus = true;
    }


    var query = "Update tblbike set IsACC=" + FlagStatus + ", IsACCEnable=true where deviceid='" + deviceID + "';";
    connection.query(query, function(err, rows, fields) {
        //tblapisresponse Entry
        Callback("No Response");

    });

    var objConnection = {
        DeviceId: deviceID,
        IsACC: FlagStatus,
    }

    io.sockets.emit('BikeACC', JSON.stringify(objConnection));
};

function convertdateformat(date1) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    return ("00" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

}

//BE04
// router.get('/BE04Method', function(req, res) {
//     var line = req.query.Code;
//     console.log(line)
//     var deviceID = line.substring(1, 13);
//     var alarmcode = line.substring(17, 18);
//     var Position = "A";
//     var Speed = "000.0";
//     var Direction = "000.00";
//     var Status = "00000000";
//     var Sign = "L";
//     var ReserveSection = "00000000";

//     //var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
//     // var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
//     var GPSDateTime = GetCurrentDate();
//     var CurrentDate = GetCurrentDate();

//     var strResponce = "No response";

//     var lstMAC = [];

//     var Mac = line.substring(18, (line.length - 1));
//     lstMAC = Mac.split(',');

//     var MacAddressString = "";

//     if (parseInt(lstMAC[0]) > 0) {

//         var wifi = [];

//         for (var i = 1; i < lstMAC.length; i++) {
//             var obj = new Object();
//             obj.bssid = lstMAC[i].replace(/(.{2})(.{2})(.{2})(.{2})(.{2})/, "$1:$2:$3:$4:$5:").toString();
//             if (MacAddressString == "") {
//                 MacAddressString = obj.bssid;
//             } else {
//                 MacAddressString += "," + obj.bssid;
//             };
//             wifi.push(obj);
//         };



//         var objwifi = new Object();
//         // objwifi.token = '93ce073f71ceac';
//         objwifi.token = 'a92ac31f4efa47';
//         objwifi.id = deviceID;
//         objwifi.wifi = wifi;

//         //Get Wifi Data
//         request.post({
//             url: 'https://us1.unwiredlabs.com/v2/process.php',
//             form: JSON.stringify(objwifi)
//         }, function(error, response, body) {
//             var data = JSON.parse(body)
//             if (data.status == 'ok') {
//                 var Latitude = parseFloat(data.lat);
//                 var Longtitude = parseFloat(data.lon);
//                 //CHeck Fence
//                 connection.query("SELECT * from tblfence where deviceId=" + deviceID, function(err, rows, fields) {
//                     if (!err && rows.length > 0) {
//                         var response = rows[0];


//                         var CheckPoints = {
//                             latitude: parseFloat(Latitude),
//                             longitude: parseFloat(Longtitude)
//                         }

//                         var IsPetInFence = true;

//                         if (response.fencedraw == "circle") {
//                             var CircleCenterPoints = {
//                                 latitude: parseFloat(response.lat),
//                                 longitude: parseFloat(response.lng)
//                             }
//                             var CircleRadius = parseFloat(response.range);
//                             IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)

//                             // console.log("IsPetIn Fence - " + IsPetInFence)
//                         } else if (response.fencedraw == "polygon" || response.fencedraw == "polyline") {
//                             var lstpolygonDrawC = [];
//                             var lstlatC = response.lat.split(',');
//                             var lstlngC = response.lng.split(',');

//                             for (var i = 0; i < lstlatC.length; i++) {
//                                 var objDraw = {
//                                     latitude: parseFloat(lstlatC[i]),
//                                     longitude: parseFloat(lstlngC[i])
//                                 }
//                                 lstpolygonDrawC.push(objDraw);
//                             }
//                             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
//                                 // console.log("IsPetIn Fence - " + IsPetInFence)
//                         } else if (response.fencedraw == "rectangle") {
//                             var lstpolygonDrawC = [];
//                             var lstlatC = response.lat.split(',');
//                             var lstlngC = response.lng.split(',');


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

//                             // console.log(lstpolygonDrawC)
//                             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
//                                 // console.log("Sqre IsPetIn Fence - " + IsPetInFence)
//                         };


//                         //Get Pet
//                         connection.query("SELECT * from tblpet where deviceId=" + deviceID, function(err, Petrows, fields) {
//                             if (!err && Petrows.length > 0) {
//                                 var objPet = Petrows[0];

//                                 if (IsPetInFence != objPet.IsInFence && objPet.IsFenceOnline) {

//                                     var AlarmCode = '6';
//                                     var message = '';
//                                     if (IsPetInFence == false) {
//                                         AlarmCode = '66';
//                                         message = objPet.Collartagname + ' is out of Fence.';
//                                     } else {
//                                         AlarmCode = '6';
//                                         message = objPet.Collartagname + ' is in Fence.';
//                                     }
//                                     //Insert In TO Alarm for Fence Data
//                                     var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + AlarmCode + "');";
//                                     connection.query(Alarmquery, function(err1, Alarmrows, fields) {
//                                         //Update Fence Status
//                                         connection.query('UPDATE tblpet set IsInFence=' + IsPetInFence + ' WHERE DeviceId=' + deviceID, function(err, rows, fields) {

//                                             var PushNotificationdata = {
//                                                 title: 'Fence',
//                                                 message: message,
//                                                 Fence: 'Default',
//                                                 otherfields: {
//                                                     deviceid: deviceID,
//                                                     PetId: objPet.id,
//                                                     PetName: objPet.Collartagname
//                                                 }
//                                             };
//                                             if (IsPetInFence == false) {
//                                                 PushNotificationdata.Fence = 'Default';
//                                             } else {
//                                                 PushNotificationdata.Fence = 'Fence';
//                                             }
//                                             //Send Push Notification
//                                             SendPushNotification(PushNotificationdata, objPet.iduser);

//                                         });
//                                     });

//                                 };
//                             };
//                         });
//                         // });
//                     };

//                     //Insert data in gps
//                     var query = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,MacAddress ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + MacAddressString + "');";
//                     connection.query(query, function(err, rows, fields) {
//                         //Insert In to Low Battery Alarm
//                         var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + alarmcode + "');";
//                         connection.query(Alarmquery, function(err, rows, fields) {
//                             if (alarmcode == "8") {
//                                 //Select Pet Info
//                                 connection.query("SELECT * from tblpet where deviceid=" + deviceID, function(err, Petrows, fields) {
//                                     if (!err && Petrows.length > 0) {
//                                         var objPet = Petrows[0];

//                                         var PushNotificationdata = {
//                                             title: 'Alarm',
//                                             message: 'Low Battery Alarm for ' + objPet.Collartagname + '.',
//                                             Fence: 'Default',
//                                             otherfields: {
//                                                 deviceid: deviceID,
//                                                 PetId: objPet.id,
//                                                 PetName: objPet.Collartagname
//                                             }
//                                         };
//                                         //Send Push Notification
//                                         SendPushNotification(PushNotificationdata, objPet.iduser);

//                                     }
//                                 });
//                             }
//                             res.json(strResponce);
//                         });
//                     });
//                 });
//             } else {
//                 //Error for Getting wifi Location
//                 var Latitude = "00.000000";
//                 var Longtitude = "000.000000";



//                 //tblPetgps Entry
//                 if (alarmcode != "6") {
//                     //Insert In TO Alarm
//                     var query = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + alarmcode + "');";
//                     connection.query(query, function(err, rows, fields) {
//                         if (alarmcode == "8") {
//                             //get pet info
//                             connection.query("SELECT * from tblpet where deviceid=" + deviceID, function(err, Petrows, fields) {
//                                 if (!err && Petrows.length > 0) {
//                                     var objPet = Petrows[0];

//                                     var PushNotificationdata = {
//                                         title: 'Alarm',
//                                         message: 'Low Battery Alarm for ' + objPet.Collartagname + '.',
//                                         Fence: 'Default',
//                                         otherfields: {
//                                             deviceid: deviceID,
//                                             PetId: objPet.id,
//                                             PetName: objPet.Collartagname
//                                         }
//                                     };
//                                     //Send Push Notifiction
//                                     SendPushNotification(PushNotificationdata, objPet.iduser);

//                                 }
//                             });
//                         }
//                         res.json(strResponce);
//                     });
//                 } else {
//                     res.json(strResponce);
//                 }
//             }

//         });


//     } else {
//         var Latitude = "00.000000";
//         var Longtitude = "000.000000";

//         strResponce = "No response";

//         //tblPetgps Entry
//         if (alarmcode != "6") {
//             var query = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + alarmcode + "');";
//             connection.query(query, function(err, rows, fields) {
//                 if (alarmcode == "8") {
//                     connection.query("SELECT * from tblpet where deviceid=" + deviceID, function(err, Petrows, fields) {
//                         if (!err && Petrows.length > 0) {
//                             var objPet = Petrows[0];

//                             var PushNotificationdata = {
//                                 title: 'Alarm',
//                                 message: 'Low Battery Alarm for ' + objPet.Collartagname + '.',
//                                 Fence: 'Default',
//                                 otherfields: {
//                                     deviceid: deviceID,
//                                     PetId: objPet.id,
//                                     PetName: objPet.Collartagname
//                                 }
//                             };

//                             SendPushNotification(PushNotificationdata, objPet.iduser);

//                         }
//                     });
//                 }
//                 res.json(strResponce);
//             });
//         } else {
//             res.json(strResponce);
//         }
//     };
// })

// router.get('/BE03Method', function(req, res) {
//     var deviceID = req.query.Code;
//     PetGPS.findOne({
//         where: {
//             DeviceId: deviceID
//         },
//         order: 'Datetime DESC'
//     }).then(function(response) {
//         //console.log(response)
//         if (response != null) {

//             var d = new Date();
//             var curr_date = d.getDate();
//             var curr_month = d.getMonth() + 1; //Months are zero based
//             var curr_year = d.getFullYear();

//             var seconds = d.getSeconds();
//             var minutes = d.getMinutes();
//             var hour = d.getHours();

//             var milisec = d.getMilliseconds();

//             var date = curr_year.toString() + curr_month.toString() + curr_date.toString() + hour.toString() + minutes.toString() + seconds.toString();
//             //var GPSDateTime = date;
//             var GPSDateTime = GetCurrentDate()

//             var objpetgps = new Object();
//             objpetgps.Id = 0;
//             objpetgps.Datetime = GPSDateTime;
//             objpetgps.IsAdvanture = false;
//             objpetgps.DeviceId = response.DeviceId;
//             objpetgps.GPSPositioning = response.GPSPositioning;
//             objpetgps.Latitude = response.Latitude;
//             objpetgps.Longtitude = response.Longtitude;
//             objpetgps.Speed = response.Speed;
//             objpetgps.Direction = response.Direction;
//             objpetgps.Status = response.Status;
//             objpetgps.ReservedSign = response.ReservedSign;
//             objpetgps.ReservedSelection = response.ReservedSelection;
//             PetGPS.create(objpetgps).then(function(resgps) {

//             });


//             connection.query("SELECT * from tblpet where deviceId=" + deviceID, function(err, Petrows, fields) {
//                 if (!err && Petrows.length > 0) {
//                     var objPet = Petrows[0];
//                     var IsPetInFence = true;
//                     if (objPet.IsInFence == false && objPet.IsFenceOnline) {
//                         var AlarmCode = '6';
//                         var message = '';
//                         if (IsPetInFence == true) {
//                             AlarmCode = '6';
//                             message = objPet.Collartagname + ' is in Fence.';
//                         }
//                         //Insert In TO Alarm for Fence Data
//                         var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + objpetgps.Latitude + "', '" + objpetgps.Longtitude + "', '" + objpetgps.GPSPositioning + "', '" + objpetgps.Speed + "', '" + objpetgps.Direction + "', '" + objpetgps.Status + "', '" + objpetgps.ReservedSign + "', '" + objpetgps.ReservedSelection + "', '" + deviceID + "','" + AlarmCode + "');";
//                         connection.query(Alarmquery, function(err1, Alarmrows, fields) {
//                             //Update Fence Status
//                             connection.query('UPDATE tblpet set IsInFence=' + IsPetInFence + ' WHERE DeviceId=' + deviceID, function(err, rows, fields) {

//                                 var PushNotificationdata = {
//                                     title: 'Fence',
//                                     message: message,
//                                     Fence: 'Default',
//                                     otherfields: {
//                                         deviceid: deviceID,
//                                         PetId: objPet.id,
//                                         PetName: objPet.Collartagname
//                                     }
//                                 };
//                                 if (IsPetInFence == false) {
//                                     PushNotificationdata.Fence = 'Default';
//                                 } else {
//                                     PushNotificationdata.Fence = 'Fence';
//                                 }
//                                 //Send Push Notification
//                                 SendPushNotification(PushNotificationdata, objPet.iduser);

//                             });
//                         });

//                     };
//                 };
//             });


//         } else {
//             res.json({ success: false, data: '' });
//             //  client.destroy();
//         }
//     })
// })



//BE04
// router.get('/BW01Method', function(req, res) {
//     var line = req.query.Code;
//     console.log("CallAPI - " + line)
//     var deviceID = line.substring(1, 13);
//     var Position = "A";
//     var Speed = "000.0";
//     var Direction = "000.00";
//     var Status = "00000000";
//     var Sign = "L";
//     var ReserveSection = "00000000";

//     var GPSDateTime = GetCurrentDate();

//     var MacAdderssCount = parseInt(line.substring(17, 19), 16);
//     var startIndex = 19;
//     var lstMacAddress = [];
//     var MacAddressString = "";
//     for (var i = 0; i < MacAdderssCount; i++) {
//         var mac = line.substring(startIndex, startIndex + 12);
//         lstMacAddress.push(mac)
//         startIndex = startIndex + 12;
//     };
//     console.log(lstMacAddress.length)
//     if (lstMacAddress.length > 0) {
//         var wifi = [];

//         for (var i = 0; i < lstMacAddress.length; i++) {
//             var obj = new Object();
//             obj.bssid = lstMacAddress[i].replace(/(.{2})(.{2})(.{2})(.{2})(.{2})/, '$1:$2:$3:$4:$5:');

//             if (MacAddressString == "") {
//                 MacAddressString = obj.bssid;
//             } else {
//                 MacAddressString += "," + obj.bssid;
//             };

//             wifi.push(obj);
//         };


//         var objwifi = new Object();
//         // objwifi.token = '93ce073f71ceac';
//         objwifi.token = 'a92ac31f4efa47';
//         objwifi.id = deviceID;
//         objwifi.wifi = wifi;


//         console.log(objwifi)
//             //Get Wifi Data
//         request.post({
//             url: 'https://us1.unwiredlabs.com/v2/process.php',
//             form: JSON.stringify(objwifi)
//         }, function(error, response, body) {
//             var data1 = JSON.parse(body)
//             console.log(data1)
//             if (data1.status == 'ok') {
//                 var Latitude = parseFloat(data1.lat);
//                 var Longtitude = parseFloat(data1.lon);

//                 var objNavigation = {
//                     DeviceId: deviceID,
//                     Datetime: GPSDateTime,
//                     GPSPositioning: Position,
//                     Latitude: Latitude,
//                     Longtitude: Longtitude,
//                     Speed: Speed,
//                     Direction: Direction,
//                     Status: Status,
//                     ReservedSign: Sign,
//                     ReservedSelection: ReserveSection,
//                 }

//                 //CHeck Fence
//                 connection.query("SELECT * from tblfence where deviceId=" + deviceID, function(err, rows, fields) {
//                     if (!err && rows.length > 0) {
//                         var response = rows[0];


//                         var CheckPoints = {
//                             latitude: parseFloat(Latitude),
//                             longitude: parseFloat(Longtitude)
//                         }

//                         var IsPetInFence = true;

//                         if (response.fencedraw == "circle") {
//                             var CircleCenterPoints = {
//                                 latitude: parseFloat(response.lat),
//                                 longitude: parseFloat(response.lng)
//                             }
//                             var CircleRadius = parseFloat(response.range);
//                             IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)

//                             // console.log("IsPetIn Fence - " + IsPetInFence)
//                         } else if (response.fencedraw == "polygon" || response.fencedraw == "polyline") {
//                             var lstpolygonDrawC = [];
//                             var lstlatC = response.lat.split(',');
//                             var lstlngC = response.lng.split(',');

//                             for (var i = 0; i < lstlatC.length; i++) {
//                                 var objDraw = {
//                                     latitude: parseFloat(lstlatC[i]),
//                                     longitude: parseFloat(lstlngC[i])
//                                 }
//                                 lstpolygonDrawC.push(objDraw);
//                             }
//                             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
//                                 // console.log("IsPetIn Fence - " + IsPetInFence)
//                         } else if (response.fencedraw == "rectangle") {
//                             var lstpolygonDrawC = [];
//                             var lstlatC = response.lat.split(',');
//                             var lstlngC = response.lng.split(',');


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

//                             // console.log(lstpolygonDrawC)
//                             IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
//                                 // console.log("Sqre IsPetIn Fence - " + IsPetInFence)
//                         };


//                         //Get Pet
//                         connection.query("SELECT * from tblpet where deviceId=" + deviceID, function(err, Petrows, fields) {
//                             if (!err && Petrows.length > 0) {
//                                 var objPet = Petrows[0];

//                                 if (IsPetInFence != objPet.IsInFence && objPet.IsFenceOnline) {
//                                     var AlarmCode = '6';
//                                     var message = '';
//                                     if (IsPetInFence == false) {
//                                         AlarmCode = '66';
//                                         message = objPet.Collartagname + ' is out of Fence.';
//                                     } else {
//                                         AlarmCode = '6';
//                                         message = objPet.Collartagname + ' is in Fence.';
//                                     }
//                                     //Insert In TO Alarm for Fence Data
//                                     var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + AlarmCode + "');";
//                                     connection.query(Alarmquery, function(err1, Alarmrows, fields) {
//                                         //Update Fence Status
//                                         connection.query('UPDATE tblpet set IsInFence=' + IsPetInFence + ' WHERE DeviceId=' + deviceID, function(err, rows, fields) {

//                                             var PushNotificationdata = {
//                                                 title: 'Fence',
//                                                 message: message,
//                                                 Fence: 'Default',
//                                                 otherfields: {
//                                                     deviceid: deviceID,
//                                                     PetId: objPet.id,
//                                                     PetName: objPet.Collartagname
//                                                 }
//                                             };
//                                             if (IsPetInFence == false) {
//                                                 PushNotificationdata.Fence = 'Default';
//                                             } else {
//                                                 PushNotificationdata.Fence = 'Fence';
//                                             }
//                                             //Send Push Notification
//                                             SendPushNotification(PushNotificationdata, objPet.iduser);
//                                         });
//                                     });

//                                 };
//                             };
//                         });
//                         // });
//                     };

//                     //Insert data in gps
//                     var query = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,MacAddress ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + MacAddressString + "');";
//                     connection.query(query, function(err, rows, fields) {
//                         res.json({ success: true, data: objNavigation });
//                     });
//                 });



//             } else {
//                 res.json({ success: true, data: response });
//             }

//         });

//     } else {
//         res.json({ success: true, data: null });
//     }

// })

//BR04
// router.get('/BR04Method', function(req, res) {
//     var line = req.query.Code;
//     console.log(line)
//     var deviceID = line.substring(1, 13);
//     var Date1 = line.substring(17, 23);
//     var Position = line.substring(23, 24);
//     var Lat = line.substring(24, 34);
//     var Lan = line.substring(34, 45);
//     var Speed = line.substring(45, 50);
//     var Time = line.substring(50, 56);
//     var Direction = line.substring(56, 62);
//     var Status = line.substring(62, 70);
//     var Sign = line.substring(70, 71);
//     var ReserveSection = line.substring(71, 79);

//     var day = parseInt(Date1.substring(4, 6));
//     var month = parseInt(Date1.substring(2, 4));
//     var year = parseInt("20" + Date1.substring(0, 2));
//     var hour = parseInt(Time.substring(0, 2));
//     var min = parseInt(Time.substring(2, 4));
//     var sec = parseInt(Time.substring(4, 6));

//     // var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
//     var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
//     var CurrentDate = GetCurrentDate();

//     var Latitude = global.deg_to_lat_long(Lat);
//     var Longtitude = global.deg_to_lat_long(Lan);

//     //tblPetgps Entry
//     var query = "INSERT INTO tblpetgps (Datetime,Latitude,Longtitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longtitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "');";
//     connection.query(query, function(err, rows, fields) {
//         //tblapisresponse Entry
//         var ResponceQuery = "INSERT INTO tblapisresponse (Code,Response,Datetime) VALUES ('BR04', 'No Response', '" + CurrentDate + "');";
//         connection.query(ResponceQuery, function(err, rows1, fields) {
//             res.json("No Response");
//             strResponce = "No Response";
//         });
//     });
// })




router.get('/UpdateDeviceStatus', function(req, res) {
    var deviceID = req.query.DeviceId;
    // deviceID = '075034903863';
    var Status = req.query.Status;
    // var Status = true;

    connection.query("SELECT * from tblbike where deviceid=" + deviceID + " and IsDeleted=false", function(err, Bikerows, fields) {
        //tblPetgps Entry
        if (!err && Bikerows.length > 0) {
            var objPet = Bikerows[0];
            console.log("dbbbbbbbbbbb 123", objPet.IsOnline);
            console.log("localllllllll 123", Status);
            var flgOnline = false;
            if (objPet.IsOnline == 1) {
                flgOnline = true;
            }
            if (Status.toString() != flgOnline.toString()) {
                var query = "Update tblbike set IsOnline=" + Status + " where deviceid='" + deviceID + "';";
                connection.query(query, function(err, rows, fields) {
                    //tblapisresponse Entry
                    if (objPet.IsDeleted.toString('hex') == '00') {
                        if (!Status) {
                            var PushNotificationdata = {
                                title: 'Alert',
                                message: 'Vehicle ' + objPet.bikeNumber + ' Device offline alert! Please check!',
                                Fence: 'Default',
                                otherfields: {
                                    deviceid: deviceID,
                                    PetId: objPet.id,
                                    PetName: objPet.bikeNumber
                                }
                            };
                        } else {
                            var PushNotificationdata = {
                                title: 'Alert',
                                message: 'Vehicle ' + objPet.bikeNumber + ' Device online alert! Please check!',
                                Fence: 'Default',
                                otherfields: {
                                    deviceid: deviceID,
                                    PetId: objPet.id,
                                    PetName: objPet.bikeNumber
                                }
                            };
                        }
                        if (objPet.DeviceType == 'M2') {

                            SendPushNotification(PushNotificationdata, objPet.iduser, 'Shop', null);
                        } else {
                            SendPushNotification(PushNotificationdata, objPet.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
                        }
                    }
                    res.json("No Response");
                    strResponce = "No Response";

                    var ConnectionStatus = false;
                    if (Status == 'true' || Status == true) {
                        ConnectionStatus = true;
                    }
                    var objConnection = {
                        deviceid: deviceID,
                        PetId: objPet.id,
                        Status: ConnectionStatus
                    }
                    io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
                });
            } else {
                res.json("No Response");
                strResponce = "No Response";
            }
        } else {
            res.json("No Response");
            strResponce = "No Response";
        }
    });


    // res.json("No Response");
    // var deviceID = '075034498021';
    // var Latitude = '20.834979';
    // var Longtitude = '73.265247';

    // var objConnection = {
    //     Deviceid: deviceID,
    //     Latitute: Latitude,
    //     Longitude: Longtitude,
    // }
    // io.sockets.emit('BikeRoute', JSON.stringify(objConnection));

})

//End of Send Email

// var rule = new schedule.RecurrenceRule();
// //rule.dayOfWeek = [0, new schedule.Range(4, 6)];
// // rule.hour = 0;
// // rule.minute = 0;
// // rule.second = 30;
// rule.minute = new schedule.Range(0, 59, 1);
// //rule.minute = new schedule.Range(0, 59, 1);
// var testStatus = false;
// var IsOnlineDeviceCheck = schedule.scheduleJob(rule, function() {
//     var today = new Date();
//     var year = today.getFullYear();
//     var month = today.getMonth() + 1; // beware: January = 0; February = 1, etc.
//     // var month1 = today.getMonth() + 1; // beware: January = 0; February = 1, etc.
//     var day = today.getDate();

//     var data = year + '-' + month + '-' + day;
//     console.log(new Date())

//     // var objConnection = {
//     //     deviceid: '075034498021',
//     //     PetId: 50303,
//     //     Status: testStatus
//     // }
//     // io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
//     // var objConnection = {
//     //     AlarmCode: '5',
//     //     DeviceId: '123456',
//     //     Datetime: '2016-12-15 10:50:02',
//     //     IdUser : '51588'
//     // }
//     // io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
//     // var objConnection1 = {
//     //     Deviceid: '075034498021',
//     //     Latitute: '40.704059',
//     //     Longitude: '117.102490'
//     // }
//     // console.log("objConnection1",objConnection1);
//     // io.sockets.emit('BikeRoute', JSON.stringify(objConnection1));

//     // if (testStatus) {
//     //     testStatus = false
//     // } else {
//     //     testStatus = true;
//     // }
//     // var deviceID = '075034498021';
//     // var Latitude = '40.704059';
//     // var Longtitude = '117.102490';



//     Bike.findAll({
//         where: {
//             IsOnline: true,
//             IsDeleted: false
//         },
//     }).then(function(resBike) {
//         // for (var i = 0; i < resBike.length; i++) {
//         function setDeviceStatus(i) {
//             if (i < resBike.length) {
//                 if (resBike[i].HandshakDatetime != null) {
//                     var date1 = new Date();
//                     var date2 = new Date(resBike[i].HandshakDatetime);
//                     var timeDiff = Math.abs(date2.getTime() - date1.getTime());
//                     var min = Math.floor(timeDiff / 60000);
//                     console.log(resBike[i].deviceid + "    = " + min);
//                     if (min > 20) {
//                         var objPetExist = resBike[i];
//                         Bike.findOne({
//                             where: {
//                                 id: objPetExist.id
//                             }
//                         }).then(function(objPetExistOnline) {
//                             if (objPetExistOnline && objPetExistOnline.IsOnline) {
//                                 objPetExistOnline.updateAttributes({ IsOnline: false }).then(function(resUpdate) {

//                                     if (objPetExistOnline.IsDeleted.toString('hex') == '00') {
//                                         var PushNotificationdata = {
//                                             title: 'Alert',
//                                             message: 'Vehicle ' + objPetExistOnline.bikeNumber + ' Device offline alert! Please check!',
//                                             Fence: 'Default',
//                                             otherfields: {
//                                                 deviceid: objPetExistOnline.deviceid,
//                                                 PetId: objPetExistOnline.id,
//                                                 PetName: objPetExistOnline.bikeNumber
//                                             }
//                                         };

//                                         if (objPetExistOnline.DeviceType == 'M2') {
//                                             SendPushNotification(PushNotificationdata, objPetExistOnline.iduser, 'Shop', null);
//                                         } else {
//                                             SendPushNotification(PushNotificationdata, objPetExistOnline.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
//                                         }
//                                     }
//                                     var objConnection = {
//                                         deviceid: objPetExistOnline.deviceid,
//                                         PetId: objPetExistOnline.id,
//                                         Status: false
//                                     }
//                                     io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
//                                     setDeviceStatus(i + 1);
//                                 })
//                             } else {
//                                 setDeviceStatus(i + 1);
//                             }
//                         })
//                     } else {
//                         setDeviceStatus(i + 1);
//                     }
//                 } else {
//                     var objPetExist = resBike[i];
//                     Bike.findOne({
//                         where: {
//                             id: objPetExist.id
//                         }
//                     }).then(function(objPetExistOnline) {
//                         if (objPetExistOnline && objPetExistOnline.IsOnline) {
//                             objPetExistOnline.updateAttributes({ IsOnline: false }).then(function(resUpdate) {
//                                 if (objPetExistOnline.IsDeleted.toString('hex') == '00') {
//                                     var PushNotificationdata = {
//                                         title: 'Alert',
//                                         message: 'Vehicle ' + objPetExistOnline.bikeNumber + ' Device offline alert! Please check!',
//                                         Fence: 'Default',
//                                         otherfields: {
//                                             deviceid: objPetExistOnline.deviceid,
//                                             PetId: objPetExistOnline.id,
//                                             PetName: objPetExistOnline.bikeNumber
//                                         }
//                                     };
//                                     if (objPetExistOnline.DeviceType == 'M2') {
//                                         SendPushNotification(PushNotificationdata, objPetExistOnline.iduser, 'Shop', null);
//                                     } else {
//                                         SendPushNotification(PushNotificationdata, objPetExistOnline.iduser, 'Owner', 'OwnerDeviceStatusPushNotification');
//                                     }
//                                 }
//                                 var objConnection = {
//                                     deviceid: objPetExistOnline.deviceid,
//                                     PetId: objPetExistOnline.id,
//                                     Status: false
//                                 }
//                                 io.sockets.emit('BikeDeviceStatus', JSON.stringify(objConnection));
//                                 setDeviceStatus(i + 1);
//                             })
//                         } else {
//                             setDeviceStatus(i + 1);
//                         }
//                     })
//                 }
//             }
//         }
//         setDeviceStatus(0);
//     })
// });

module.exports = router