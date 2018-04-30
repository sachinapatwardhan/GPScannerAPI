var router = express.Router();

//Command Concox GPS - GPS Command
global.CommandConcoxGPS = function(obj, Callback) {
    // console.log(obj)
    try {
        //Server Reconnet If Disconneted
        if (connection.state == 'disconnected') {
            global.connection = mysql.createConnection({
                host: MysqlHost,
                user: Mysqluser,
                password: Mysqlpassword,
                database: Mysqldatabase
            });
        }
        var objGps = JSON.parse(obj);
        var line = objGps.line;
        // console.log("GPS data = " + line);

        var DeviceId = objGps.DeviceId;


        var Date1 = line.substring(8, 20);
        var CourseStatus = line.substring(40, 44);

        var Inputoutputbit = hexToBinary(CourseStatus);
        var lstInputOutputStatus = Inputoutputbit.split('');
        // console.log(Date1)
        var Position = '';
        if (lstInputOutputStatus[3] == '0') {
            Position = 'V';
        } else {
            Position = 'A';
        }
        var Lat = convert_lat_long_format(parseInt(line.substring(22, 30), 16));
        var LatDirection = '';
        if (lstInputOutputStatus[5] == '0') {
            LatDirection = 'S';
        } else {
            LatDirection = 'N';
        }

        var Lan = convert_lat_long_format(parseInt(line.substring(30, 38), 16));

        var LanDirection = '';
        if (lstInputOutputStatus[4] == '0') {
            LanDirection = 'E';
        } else {
            LanDirection = 'W';
        }
        var Speed = parseInt(line.substring(38, 40), 16);
        // var Time = lstLocationData[0];
        var Direction = parseInt(Inputoutputbit.substring(6, Inputoutputbit.length), 2);


        var HDOP = 0;
        var altitude = 0;
        var inputoutputSTatus = '123';
        // var lstAD = lstGPSAllData[4].split(',')
        var AD1 = 0;
        var AD2 = 0;
        var Odometer = 0;
        var RFID = 0;
        var IsRealLocation = '';
        if (lstInputOutputStatus[2] == '0') {
            IsRealLocation = true;
            AD1 = '0';
        } else {
            IsRealLocation = false;
            AD1 = '1';
        }
        // if (AD2 == undefined) {
        //     AD2 = 0;
        // }
        // var str = "110b0f0c0f3ac30247437 00 7d1919816153e0002001a89fb0d0a";
        var year = "20" + parseInt(Date1.substring(0, 2), 16).toString();
        var month = parseInt(Date1.substring(2, 4), 16).toString();
        var day = parseInt(Date1.substring(4, 6), 16).toString();

        var hour = parseInt(Date1.substring(6, 8), 16).toString();
        var min = parseInt(Date1.substring(8, 10), 16).toString();
        var sec = parseInt(Date1.substring(10, 12), 16).toString();


        // // var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
        var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
        // console.log("Datetime = " + GPSDateTime);
        var GPSDate = year + "-" + month + "-" + day;
        var CurrentDate = GetCurrentDate();

        var convertDate = convertdateformat(GPSDateTime + " +08:00");
        var unixDateStemp = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

        var Latitude = global.deg_to_lat_long(Lat, LatDirection);
        var Longitude = global.deg_to_lat_long(Lan, LanDirection);

        // var Inputoutputbit = hexToBinary(inputoutputSTatus);
        // var lstInputOutputStatus = Inputoutputbit.split('');

        var IsRelayToStopTheCar = false;
        var IsSirenSound = false;
        var IsUserDefined = false;
        var IsLockTheDoor = false;
        var IsUnlockTheDoor = false;
        var IsSOS = false;
        var IsWiringForAntiTamper = false;
        var IsDoor = false;
        var IsEngine = false;
        var IsPowercutoff = false;
        var IsPatchEngine = false;
        var IsOriginalSirenTriggeringStatus = false;

        //check <5 min time difference then only store data otherwise neglect
        var systemtime = new Date();
        var DeviceTime = new Date(GPSDateTime + " +08:00");
        // console.log(systemtime)
        // console.log(DeviceTime)
        var timediffernce = parseInt((DeviceTime - systemtime) / 1000);
        // console.log("Time Diff = " + timediffernce)

        //if (timediffernce <= 3600) {

        // var NewDeviceId = DeviceId.substring(DeviceId.length - 7);
        // // var unixDateStemp = new Date(resData1[j].CreatedDate).getTime() / 1000;
        // var unixDateStempNew = parseInt((new Date()).getTime() / 1000) + unixDateStemp;
        // // var Ids = resData1[j].Date.toString() + NewDeviceId;
        // var Ids = unixDateStempNew.toString() + NewDeviceId;

        var IsOverSpeed = false;
        client.get(DeviceId + "MaxSpeed", function(err, strSpeed) {
            if (!err) {
                if (strSpeed != null && strSpeed != undefined && strSpeed != '' && strSpeed != 'null' && strSpeed != 'undefined') {
                    try {
                        if (Speed > parseFloat(strSpeed)) {
                            IsOverSpeed = true;
                        }
                    } catch (ex) {}
                }
            }

            client.get(DeviceId + "ACC", function(err, strEngine) {
                if (!err) {
                    if (strEngine != null && strEngine != undefined && strEngine != '') {
                        if (strEngine == true || strEngine == 'true') {
                            IsEngine = true;
                        }
                    }
                }
                client.get(DeviceId + "PowerCutOff", function(err, strPowerCut) {
                    if (!err) {
                        if (strPowerCut != null && strPowerCut != undefined && strPowerCut != '') {
                            if (strPowerCut == true || strPowerCut == 'true') {
                                IsPowercutoff = true;
                                IsWiringForAntiTamper = true;
                            }
                        }
                    }

                    IsPatchEngine = IsEngine;
                    // //Insert data in gps
                    // var query = "INSERT INTO tblgpsdata (Id,Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,IsRelayToStopTheCar,IsSirenSound,IsUserDefined,IsLockTheDoor,IsUnlockTheDoor,IsSOS,IsWiringForAntiTamper,IsDoor,IsEngine,IsOriginalSirenTriggeringStatus,CreatedDate,HDOP,Altitude,AD1,AD2,OdoMeter,Date,IsPatchEngine ) " +
                    //     "VALUES (" + Ids + ",'" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "'," + IsRelayToStopTheCar + "," + IsSirenSound + "," + IsUserDefined + "," + IsLockTheDoor + "," + IsUnlockTheDoor + "," + IsSOS + "," + IsWiringForAntiTamper + "," + IsDoor + "," + IsEngine + "," + IsOriginalSirenTriggeringStatus + ",'" + CurrentDate + "','" + HDOP + "','" + altitude + "','" + AD1 + "','" + AD2 + "','" + Odometer + "','" + unixDateStemp + "'," + IsPatchEngine + ");";
                    // connection.query(query, function(err, rows, fields) {
                    // console.log(err);
                    var objConnection = {
                        Position: Position,
                        Speed: Speed,
                        Deviceid: DeviceId,
                        Latitude: Latitude,
                        Longitude: Longitude,
                        Direction: Direction,
                        IsRelayToStopTheCar: IsRelayToStopTheCar,
                        IsSirenSound: IsSirenSound,
                        IsUserDefined: IsUserDefined,
                        IsLockTheDoor: IsLockTheDoor,
                        IsUnlockTheDoor: IsUnlockTheDoor,
                        IsSOS: IsSOS,
                        IsWiringForAntiTamper: IsWiringForAntiTamper,
                        IsDoor: IsDoor,
                        IsEngine: IsEngine,
                        IsPowercutoff: IsPowercutoff,
                        IsOriginalSirenTriggeringStatus: IsOriginalSirenTriggeringStatus,
                        Date: unixDateStemp,
                        IsOverSpeed: IsOverSpeed
                    }

                    if (Position == 'A') {

                        // client.get(DeviceId + "Last7Records", function(err, strLast7Record) {
                        //     var lstlast7record = [];
                        //     if (!err) {
                        //         if (strLast7Record != null && strLast7Record != undefined && strLast7Record != '') {
                        //             lstlast7record = JSON.parse(strLast7Record);
                        //         }
                        //     }

                        //     if (lstlast7record.length >= 7) {
                        //         lstlast7record.splice(0, 1);
                        //     }

                        //     lstlast7record.push(objConnection);

                        //     client.set(DeviceId + "Last7Records", JSON.stringify(lstlast7record), function(err, replies) {});
                        // });

                        client.set(DeviceId, JSON.stringify(objConnection), function(err, replies) {});
                        // io.sockets.emit('BikeRoute', JSON.stringify(objConnection));
                        io.sockets.emit(DeviceId + 'BikeRoute', JSON.stringify(objConnection));
                    }
                });
                // console.log("Is Engine = " + IsEngine)
                if (IsEngine == true) {
                    //Fence
                    connection.query("SELECT * from tblfence where deviceId=" + DeviceId + " and IsFenceOnline=true", function(err, rows, fields) {
                        if (!err && rows.length > 0) {
                            connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, Bikerows, fields) {
                                if (!err && Bikerows.length > 0) {
                                    var objVehicle = Bikerows[0];
                                    if (Position == 'A') {

                                        function checkFence(j) {
                                            if (j < rows.length) {
                                                rows[j].IsPetInFence = true;
                                                var response = rows[j];

                                                // var response = rows[0];

                                                var CheckPoints = {
                                                    latitude: parseFloat(Latitude),
                                                    longitude: parseFloat(Longitude)
                                                }

                                                var IsPetInFence = true;

                                                if (response.fencedraw == "circle") {
                                                    var CircleCenterPoints = {
                                                        latitude: parseFloat(response.lat),
                                                        longitude: parseFloat(response.lng)
                                                    }
                                                    var CircleRadius = parseFloat(response.range);
                                                    IsPetInFence = geolib.isPointInCircle(CheckPoints, CircleCenterPoints, CircleRadius)
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
                                                    IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
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

                                                    IsPetInFence = geolib.isPointInside(CheckPoints, lstpolygonDrawC)
                                                };

                                                // console.log("Fence Last State = " + objBike.IsInFence)
                                                // console.log("Fence Current State = " + IsPetInFence)
                                                if (IsPetInFence != rows[j].IsInFence && rows[j].IsFenceOnline) {
                                                    var AlarmCode = '6';
                                                    var Message = '';
                                                    var soundname = "";

                                                    if (IsPetInFence == false) {
                                                        AlarmCode = '66';
                                                        if (rows[j].name != null && rows[j].name != '' && rows[j].name != undefined) {
                                                            Message = objVehicle.Name + ' is out of ' + rows[j].name + ' Fence.';
                                                        } else {
                                                            Message = objVehicle.Name + ' is out of Fence.';
                                                        }
                                                        soundname = "Default";
                                                    } else {
                                                        AlarmCode = '6';
                                                        if (rows[j].name != null && rows[j].name != '' && rows[j].name != undefined) {
                                                            Message = objVehicle.Name + ' is in ' + rows[j].name + ' Fence.';
                                                        } else {
                                                            Message = objVehicle.Name + ' is in Fence.';
                                                        }
                                                        soundname = "Default";
                                                    }
                                                    // console.log(unixDateStemp);
                                                    connection.query('UPDATE tblfence set IsInFence=' + IsPetInFence + ' WHERE id=' + rows[j].id, function(err, rowsFence, fields) {
                                                        // console.log(err)
                                                        var Alarmquery = "INSERT INTO tblalarm (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,AlarmCode,CreatedDate,FenceName ) VALUES ('" + GPSDateTime + "', '" + unixDateStemp + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "','" + AlarmCode + "','" + CurrentDate + "','" + rows[j].name + "');";
                                                        // var Alarmquery = "INSERT INTO tblalarm (Datetime,Latitude,Longitude,GPSPositioning,Speed,Direction,Status,ReservedSign,ReservedSelection,DeviceId,AlarmCode ) VALUES ('" + GPSDateTime + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + Status + "', '" + Sign + "', '" + ReserveSection + "', '" + deviceID + "','" + AlarmCode + "');";
                                                        connection.query(Alarmquery, function(err1, Alarmrows, fields) {

                                                            connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function(err, lstShareUser, fields) {
                                                                var lstAllUser = [objVehicle.iduser];
                                                                var AllUser = objVehicle.iduser.toString();
                                                                if (!err && lstShareUser.length > 0) {
                                                                    for (var i = 0; i < lstShareUser.length; i++) {
                                                                        lstAllUser.push(lstShareUser[i].idUser)
                                                                        AllUser = AllUser + ',' + lstShareUser[i].idUser;
                                                                    }
                                                                }
                                                                connection.query("SELECT tu.id, tu.username, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function(err, objAppInfo, fields) {

                                                                    var PushNotificationdata = {
                                                                        title: 'Alert',
                                                                        message: Message,
                                                                        // Fence: 'Default',
                                                                        soundname: soundname,
                                                                        otherfields: {
                                                                            deviceid: DeviceId,
                                                                            Id: objVehicle.id,
                                                                            VehicleName: objVehicle.Name,
                                                                            AlarmCode: AlarmCode,
                                                                            Type: 'Alarm'
                                                                        }
                                                                    };

                                                                    SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);

                                                                    var objConnection = {
                                                                        AlarmCode: AlarmCode.toString(),
                                                                        DeviceId: DeviceId,
                                                                        Datetime: GPSDateTime,
                                                                        Date: unixDateStemp,
                                                                        IdUser: objVehicle.iduser,
                                                                        Name: objVehicle.Name,
                                                                        FenceName: rows[j].name
                                                                    }


                                                                    // io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                                                                    io.sockets.emit(objVehicle.iduser + 'DeviceAlarm', JSON.stringify(objConnection));

                                                                    for (var i = 0; i < lstAllUser.length; i++) {
                                                                        var objConnection = {
                                                                            AlarmCode: AlarmCode.toString(),
                                                                            DeviceId: DeviceId,
                                                                            Datetime: GPSDateTime,
                                                                            Date: unixDateStemp,
                                                                            IdUser: lstAllUser[i],
                                                                            Name: objVehicle.Name,
                                                                            FenceName: rows[j].name
                                                                        }

                                                                        io.sockets.emit(lstAllUser[i] + 'DeviceAlarm', JSON.stringify(objConnection));

                                                                        var objPushnotificationCount = {
                                                                            Id: Alarmrows.insertId,
                                                                            Latitude: Latitude,
                                                                            Longitude: Longitude,
                                                                            GPSPositioning: Position,
                                                                            Speed: Speed,
                                                                            Direction: Direction,
                                                                            Status: inputoutputSTatus,
                                                                            AlarmCode: AlarmCode.toString(),
                                                                            DeviceId: DeviceId,
                                                                            CreatedDate: CurrentDate,
                                                                            Datetime: GPSDateTime,
                                                                            Date: unixDateStemp,
                                                                            FenceName: rows[j].name,
                                                                            UserId: lstAllUser[i],
                                                                            IsRead: false,
                                                                            // Name: objVehicle.Name
                                                                        }

                                                                        io.sockets.emit(lstAllUser[i] + 'DeviceNotificationCount', JSON.stringify(objPushnotificationCount));
                                                                    }

                                                                    checkFence(j + 1);
                                                                });
                                                            });
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

                    //Max Speed
                    if (timediffernce > -100 && timediffernce < 100) {
                        client.get(DeviceId + "MaxSpeedAlarm", function(err, strSpeed) {
                            if (!err) {
                                if (strSpeed != null && strSpeed != undefined && strSpeed != '' && strSpeed != 'null' && strSpeed != 'undefined') {
                                    var objMaxSpeeddata = JSON.parse(strSpeed);

                                    if (objMaxSpeeddata != null) {
                                        //if (objMaxSpeeddata.IsSpeedAlert == false) {
                                        var AlarmCode = '';
                                        if (Speed > parseInt(objMaxSpeeddata.Speed) && objMaxSpeeddata.IsOverSpeed == false) {
                                            AlarmCode = '11';

                                            var objmaxspeedDataNew = {
                                                Speed: objMaxSpeeddata.Speed,
                                                IsSpeedAlert: true,
                                                IsOverSpeed: true
                                            }

                                            client.set(DeviceId + "MaxSpeedAlarm", JSON.stringify(objmaxspeedDataNew), function(err, replies) {});
                                        }
                                        //  else if (Speed <= parseInt(objMaxSpeeddata.Speed) && objMaxSpeeddata.IsOverSpeed == true) {
                                        //     AlarmCode = '13';

                                        //     var objmaxspeedDataNew = {
                                        //         Speed: objMaxSpeeddata.Speed,
                                        //         IsSpeedAlert: true,
                                        //         IsOverSpeed: false
                                        //     }

                                        //     client.set(DeviceId + "MaxSpeedAlarm", JSON.stringify(objmaxspeedDataNew), function(err, replies) {});
                                        // }

                                        if (AlarmCode != '') {
                                            var query = "INSERT INTO tblalarm (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,AlarmCode,CreatedDate ) VALUES ('" + GPSDateTime + "', '" + unixDateStemp + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "','" + AlarmCode + "','" + CurrentDate + "');";
                                            connection.query(query, function(err, rows, fields) {


                                                connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, lstVehicle, fields) {
                                                    if (!err && lstVehicle.length > 0) {
                                                        var objVehicle = lstVehicle[0];
                                                        connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function(err, lstShareUser, fields) {
                                                            var lstAllUser = [objVehicle.iduser];
                                                            var AllUser = objVehicle.iduser.toString();
                                                            if (!err && lstShareUser.length > 0) {
                                                                for (var i = 0; i < lstShareUser.length; i++) {
                                                                    lstAllUser.push(lstShareUser[i].idUser)
                                                                    AllUser = AllUser + ',' + lstShareUser[i].idUser;
                                                                }
                                                            }
                                                            connection.query("SELECT tu.id, tu.username,tu.Notification, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function(err, objAppInfo, fields) {

                                                                var Message = "";
                                                                var soundname = "";

                                                                if (AlarmCode == '11') {
                                                                    Message = 'Vehicle ' + objVehicle.Name + ' Max Speed alert! Please check!';
                                                                    soundname = 'Default';
                                                                }
                                                                // else if (AlarmCode == '13') {
                                                                //     Message = 'Vehicle ' + objVehicle.Name + ' Recover Over Speed alert! Please check!';
                                                                //     soundname = 'Default';
                                                                // } 
                                                                else {
                                                                    soundname = 'Default';
                                                                }

                                                                var PushNotificationdata = {
                                                                    title: 'Alert',
                                                                    message: Message,
                                                                    // Fence: 'Default',
                                                                    soundname: soundname,
                                                                    otherfields: {
                                                                        deviceid: DeviceId,
                                                                        Id: objVehicle.id,
                                                                        VehicleName: objVehicle.Name,
                                                                        AlarmCode: AlarmCode,
                                                                        Type: 'Alarm'
                                                                    }
                                                                };
                                                                // console.log(AllUser)
                                                                SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
                                                                // if (new Date(GPSDateTime) <= new Date()) {
                                                                // io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                                                                for (var i = 0; i < lstAllUser.length; i++) {
                                                                    var objConnection = {
                                                                        AlarmCode: AlarmCode.toString(),
                                                                        DeviceId: DeviceId,
                                                                        Datetime: GPSDateTime,
                                                                        Date: unixDateStemp,
                                                                        IdUser: lstAllUser[i],
                                                                        Name: objVehicle.Name,
                                                                        Speed: Speed
                                                                    }

                                                                    io.sockets.emit(lstAllUser[i] + 'DeviceAlarm', JSON.stringify(objConnection));

                                                                    var objPushnotificationCount = {
                                                                        Id: rows.insertId,
                                                                        Latitude: Latitude,
                                                                        Longitude: Longitude,
                                                                        GPSPositioning: Position,
                                                                        Speed: Speed,
                                                                        Direction: Direction,
                                                                        Status: inputoutputSTatus,
                                                                        AlarmCode: AlarmCode.toString(),
                                                                        DeviceId: DeviceId,
                                                                        CreatedDate: CurrentDate,
                                                                        Datetime: GPSDateTime,
                                                                        Date: unixDateStemp,
                                                                        FenceName: null,
                                                                        UserId: lstAllUser[i],
                                                                        IsRead: false,
                                                                        // Name: objVehicle.Name
                                                                    }

                                                                    io.sockets.emit(lstAllUser[i] + 'DeviceNotificationCount', JSON.stringify(objPushnotificationCount));
                                                                }
                                                                // }

                                                            });
                                                        })
                                                    }
                                                });


                                            });
                                        }
                                        //}
                                    }

                                }
                            }
                        });
                    }
                }
                //}
                //});
            });
        });

    } catch (ex) {
        console.log(ex)
        console.log("Error GPS Data = " + line);
    }

};

//Command Concox Alarm - Alarm Command
global.CommandConcoxAlarm = function(obj, Callback) {
    console.log("Alarm Data = " + obj);
    try {
        //Server Reconnet If Disconneted
        if (connection.state == 'disconnected') {
            global.connection = mysql.createConnection({
                host: MysqlHost,
                user: Mysqluser,
                password: Mysqlpassword,
                database: Mysqldatabase,
                multipleStatements: true
            });
        }
        var objGps = JSON.parse(obj);
        var line = objGps.line;

        var DeviceId = objGps.DeviceId;


        var Date1 = line.substring(8, 20);
        var CourseStatus = line.substring(40, 44);

        var Inputoutputbit = hexToBinary(CourseStatus);
        var lstInputOutputStatus = Inputoutputbit.split('');
        // console.log(Date1)
        var Position = '';
        if (lstInputOutputStatus[3] == '0') {
            Position = 'V';
        } else {
            Position = 'A';
        }
        var Lat = convert_lat_long_format(parseInt(line.substring(22, 30), 16));
        var LatDirection = '';
        if (lstInputOutputStatus[5] == '0') {
            LatDirection = 'S';
        } else {
            LatDirection = 'N';
        }

        var Lan = convert_lat_long_format(parseInt(line.substring(30, 38), 16));

        var LanDirection = '';
        if (lstInputOutputStatus[4] == '0') {
            LanDirection = 'E';
        } else {
            LanDirection = 'W';
        }
        var Speed = parseInt(line.substring(38, 40), 16);
        // var Time = lstLocationData[0];
        var Direction = parseInt(Inputoutputbit.substring(6, Inputoutputbit.length), 2);


        var HDOP = 0;
        var altitude = 0;
        // var inputoutputSTatus = '123';
        // var lstAD = lstGPSAllData[4].split(',')
        var AD1 = 0;
        var AD2 = 0;
        var Odometer = 0;
        var RFID = 0;
        var IsRealLocation = '';
        if (lstInputOutputStatus[2] == '0') {
            IsRealLocation = true;
            AD1 = '0';
        } else {
            IsRealLocation = false;
            AD1 = '1';
        }
        // if (AD2 == undefined) {
        //     AD2 = 0;
        // }
        // var str = "110b0f0c0f3ac30247437 00 7d1919816153e0002001a89fb0d0a";
        var year = "20" + parseInt(Date1.substring(0, 2), 16).toString();
        var month = parseInt(Date1.substring(2, 4), 16).toString();
        var day = parseInt(Date1.substring(4, 6), 16).toString();

        var hour = parseInt(Date1.substring(6, 8), 16).toString();
        var min = parseInt(Date1.substring(8, 10), 16).toString();
        var sec = parseInt(Date1.substring(10, 12), 16).toString();


        // // var GPSDateTime = Date.UTC(year, month, day, hour, min, sec);
        var GPSDateTime = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

        var GPSDate = year + "-" + month + "-" + day;
        var CurrentDate = GetCurrentDate();

        var convertDate = convertdateformat(GPSDateTime);
        var unixDateStemp = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

        var Latitude = global.deg_to_lat_long(Lat, LatDirection);
        var Longitude = global.deg_to_lat_long(Lan, LanDirection);

        var TerminalInformationContent = line.substring(62, 64);
        var TerminalInformationContentBit = hexToBinary(TerminalInformationContent);
        var LowbatteryBit = TerminalInformationContentBit.substring(2, 5);
        var inputoutputSTatus = line.substring(68, 72);
        var AlarmCodeHex = line.substring(68, 70);
        var AlarmCode = '00';
        if (AlarmCodeHex == '03') {
            AlarmCode = '30';
        } else if (AlarmCodeHex == '01') {
            AlarmCode = '01';
        } else if (AlarmCodeHex == '02') {
            AlarmCode = '50';
        } else {
            AlarmCode = '00';
        }

        if (AlarmCode == '00') {
            if (LowbatteryBit == '011') {
                AlarmCode = '10';
            }
        }
        var IsACC = false;
        if (TerminalInformationContentBit.substring(6, 7) == '0') {
            IsACC = true;
        }

        var IsPowerCut = false;
        if (TerminalInformationContentBit.substring(2, 5) == '010') {
            IsPowerCut = true;
        }

        client.set(DeviceId + "ACC", IsACC.toString(), function(err, replies) {});
        client.set(DeviceId + "PowerCutOff", IsPowerCut.toString(), function(err, replies) {});

        if (AlarmCode != '00') {
            var query = "INSERT INTO tblalarm (Datetime, Date, Latitude,Longitude,GPSPositioning,Speed,Direction,Status,DeviceId,AlarmCode,CreatedDate ) VALUES ('" + GPSDateTime + "', '" + unixDateStemp + "', '" + Latitude + "', '" + Longitude + "', '" + Position + "', '" + Speed + "', '" + Direction + "', '" + inputoutputSTatus + "', '" + DeviceId + "','" + AlarmCode + "','" + CurrentDate + "');";
            connection.query(query, function(err, rows, fields) {


                connection.query("SELECT id,Name,iduser,deviceid from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, lstVehicle, fields) {
                    if (!err && lstVehicle.length > 0) {
                        var objVehicle = lstVehicle[0];
                        connection.query("SELECT * from tblsharedevice where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true", function(err, lstShareUser, fields) {
                            var lstAllUser = [objVehicle.iduser];
                            var AllUser = objVehicle.iduser.toString();
                            if (!err && lstShareUser.length > 0) {
                                for (var i = 0; i < lstShareUser.length; i++) {
                                    lstAllUser.push(lstShareUser[i].idUser)
                                    AllUser = AllUser + ',' + lstShareUser[i].idUser;
                                }
                            }
                            connection.query("SELECT tu.id, tu.username,tu.Notification, ta.AppName, ta.IOSCertificate, ta.IOSKey, ta.AndroidId, ta.AndroidSenderId FROM tbluserinformation as tu inner Join tblappinfo as ta ON ta.id = tu.idApp where tu.id=" + objVehicle.iduser, function(err, objAppInfo, fields) {

                                var Message = "";
                                var soundname = "";

                                if (AlarmCode == '04') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Engine ON alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '03') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Door Open alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '10') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Low Bettry alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '11') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Max Speed alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '12') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Movement alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '30') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Vibration alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '50') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' External Power Cut alert! Please check!';
                                    soundname = 'sound50';
                                } else if (AlarmCode == '05') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Original Triggering alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '02') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Line Broken alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '52') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Veer Report alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '60') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Fuel Driving alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '71') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Crash alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '72') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Acceleration alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '81') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' Fuel Loss alert! Please check!';
                                    soundname = 'Default';
                                } else if (AlarmCode == '01') {
                                    Message = 'Vehicle ' + objVehicle.Name + ' SOS alert! Please check!';
                                    soundname = 'Default';
                                } else {
                                    soundname = 'Default';
                                }

                                var PushNotificationdata = {
                                    title: 'Alert',
                                    message: Message,
                                    // Fence: 'Default',
                                    soundname: soundname,
                                    otherfields: {
                                        deviceid: DeviceId,
                                        Id: objVehicle.id,
                                        VehicleName: objVehicle.Name,
                                        AlarmCode: AlarmCode,
                                        Type: 'Alarm'
                                    }
                                };
                                // console.log(AllUser)
                                SendPushNotification(PushNotificationdata, AllUser, objAppInfo[0]);
                                // if (new Date(GPSDateTime) <= new Date()) {
                                // io.sockets.emit('DeviceAlarm', JSON.stringify(objConnection));
                                for (var i = 0; i < lstAllUser.length; i++) {
                                    var objConnection = {
                                        AlarmCode: AlarmCode.toString(),
                                        DeviceId: DeviceId,
                                        Datetime: GPSDateTime,
                                        Date: unixDateStemp,
                                        IdUser: lstAllUser[i],
                                        Name: objVehicle.Name
                                    }

                                    io.sockets.emit(lstAllUser[i] + 'DeviceAlarm', JSON.stringify(objConnection));

                                    var objPushnotificationCount = {
                                        Id: rows.insertId,
                                        Latitude: Latitude,
                                        Longitude: Longitude,
                                        GPSPositioning: Position,
                                        Speed: Speed,
                                        Direction: Direction,
                                        Status: inputoutputSTatus,
                                        AlarmCode: AlarmCode.toString(),
                                        DeviceId: DeviceId,
                                        CreatedDate: CurrentDate,
                                        Datetime: GPSDateTime,
                                        Date: unixDateStemp,
                                        FenceName: null,
                                        UserId: lstAllUser[i],
                                        IsRead: false,
                                        // Name: objVehicle.Name
                                    }

                                    io.sockets.emit(lstAllUser[i] + 'DeviceNotificationCount', JSON.stringify(objPushnotificationCount));
                                }
                                // }

                            });
                        })
                    }
                });


            });
        }

    } catch (ex) {
        console.log("Error Alarm Data = " + line);
    }
};

//Command Concox HeartBeat - HeartBeat Command
global.CommandConcoxHeartBeat = function(obj, Callback) {
    try {
        //Server Reconnet If Disconneted
        if (connection.state == 'disconnected') {
            global.connection = mysql.createConnection({
                host: MysqlHost,
                user: Mysqluser,
                password: Mysqlpassword,
                database: Mysqldatabase,
                multipleStatements: true
            });
        }
        var objHearbeat = JSON.parse(obj);
        var line = objHearbeat.line;
        console.log("HandShak data = " + line);

        var DeviceId = objHearbeat.DeviceId;

        var TerminalInformationContent = line.substring(8, 10);
        var VoltageLevel = line.substring(10, 12);
        var GSMLevel = line.substring(12, 14);
        var TerminalInformationContentBit = hexToBinary(TerminalInformationContent);

        var IsACC = false;
        var IsGPSTracking = false;
        var IsCharging = false;
        var IsPowerCut = false;
        // var IsACCHigh = false;

        // if (TerminalInformationContentBit.substring(0, 1) == '0') {
        //     IsACC = true;
        // }



        if (TerminalInformationContentBit.substring(1, 2) == '1') {
            IsGPSTracking = true;
        }
        if (TerminalInformationContentBit.substring(2, 5) == '010') {
            IsPowerCut = true;
        }

        if (TerminalInformationContentBit.substring(5, 6) == '1') {
            IsCharging = true;
        }

        if (TerminalInformationContentBit.substring(6, 7) == '1') {
            IsACC = true;
        }

        var CurrentDate = GetCurrentDate();

        var objConnection = {
            DeviceId: DeviceId,
            Status: true,
            IsACC: IsACC,
            VoltageLevel: VoltageLevel,
            IsCharging: IsCharging,
            IsGPSTracking: IsGPSTracking

        }
        io.sockets.emit(DeviceId + 'BikeDeviceStatus', JSON.stringify(objConnection));

        client.set(DeviceId + "ACC", IsACC.toString(), function(err, replies) {});
        client.set(DeviceId + "PowerCutOff", IsPowerCut.toString(), function(err, replies) {});
        client.set(DeviceId + "BatteryPercentage", VoltageLevel.toString(), function(err, replies) {});
        client.set(DeviceId + "GPSTracking", IsGPSTracking.toString(), function(err, replies) {});
        client.set(DeviceId + "Charging", IsCharging.toString(), function(err, replies) {});

        //tblPetgps Entry
        var query = "INSERT INTO tblhandshake (DeviceId,Datetime,Data ) VALUES ('" + DeviceId + "', '" + CurrentDate + "','" + line + "');";
        connection.query(query, function(err, rows, fields) {

            var CheckOnline = false;
            client.get(DeviceId + "Online", function(err, response) {
                if (!err) {
                    if (response != null && response != undefined && response != '') {
                        if (response == 'true') {
                            CheckOnline = true;
                        }
                    }
                }

                if (CheckOnline == false) {
                    client.set(DeviceId + "Online", "true", function(err, replies) {});
                    connection.query("Update tblvehicle set HandshakDatetime='" + CurrentDate + "',IsOnline=true,IsACC=" + IsACC + ",IsPowercutoff=" + IsPowerCut + ",BatteryPercentage='" + VoltageLevel + "' where deviceid='" + DeviceId + "'", function(err, rows1, fields) {

                    });
                }

            });

            // connection.query("Update tblvehicle set HandshakDatetime='" + CurrentDate + "',IsOnline=true,IsACC=" + IsACC + ",IsPowercutoff=" + IsPowerCut + ",BatteryPercentage='" + VoltageLevel + "' where deviceid='" + DeviceId + "'", function(err, rows1, fields) {
            //     var objConnection = {
            //         DeviceId: DeviceId,
            //         Status: true,
            //         IsACC: IsACC,
            //         VoltageLevel: VoltageLevel,
            //         IsCharging: IsCharging,
            //         IsGPSTracking: IsGPSTracking

            //     }
            //     io.sockets.emit(DeviceId + 'BikeDeviceStatus', JSON.stringify(objConnection));
            // });

        });
    } catch (ex) {
        console.log("Error Heartbeat Data = " + line);
    }
}

router.get('/CommandDeviceStatus', function(req, res) {
    var DeviceId = req.query.DeviceId;
    // deviceID = '075034903863';
    var Status = req.query.Status;
    // var Status = true;
    var objdata = {
        DeviceId: DeviceId,
        Status: Status
    }
    CommandDeviceStatus(objdata, function(objresponse) {
        res.json(objresponse);
    })

})

global.CommandDeviceStatus = function(obj, Callback) {
    var DeviceId = obj.DeviceId;
    var Status = obj.Status;

    var CheckOnline = false;
    var GetOldOnline = false;
    client.get(DeviceId + "Online", function(err, response) {
        // console.log(response)
        if (!err) {
            if (response != null && response != undefined && response != '') {
                GetOldOnline = true;
                if (response == 'true') {
                    CheckOnline = true;
                } else {
                    CheckOnline = false;
                }
            }
        }
        // console.log("GetOldOnline", GetOldOnline)
        // console.log("CheckOnline", CheckOnline)
        if (GetOldOnline == false || CheckOnline != Status) {
            // console.log("Go Inside")
            client.set(DeviceId + "Online", Status.toString(), function(err, replies) {});
            var query = "Update tblvehicle set IsOnline=" + Status + " where deviceid='" + DeviceId + "';";
            // console.log(query)
            connection.query(query, function(err, rows, fields) {
                // console.log(err);
                Callback("No Response");
                strResponce = "No Response";


            });
        } else {
            Callback("No Response");
        }
        // console.log("################################################################")
    });


    var ConnectionStatus = false;
    if (Status == 'true' || Status == true) {
        ConnectionStatus = true;
    }
    var objConnection = {
        DeviceId: DeviceId,
        Status: ConnectionStatus
    }
    io.sockets.emit(DeviceId + 'BikeDeviceStatus', JSON.stringify(objConnection));

    // connection.query("SELECT * from tblvehicle where deviceid=" + DeviceId + " and IsDelete=false", function(err, Vehiclerows, fields) {
    //     //tblPetgps Entry
    //     if (!err && Vehiclerows.length > 0) {
    //         var objVehicle = Vehiclerows[0];

    //         var flgOnline = false;
    //         if (objVehicle.IsOnline == 1) {
    //             flgOnline = true;
    //         }
    //         if (Status.toString() != flgOnline.toString()) {
    //             var query = "Update tblvehicle set IsOnline=" + Status + " where deviceid='" + DeviceId + "';";
    //             connection.query(query, function(err, rows, fields) {
    //                 Callback("No Response");
    //                 strResponce = "No Response";

    //                 var ConnectionStatus = false;
    //                 if (Status == 'true' || Status == true) {
    //                     ConnectionStatus = true;
    //                 }
    //                 var objConnection = {
    //                     DeviceId: DeviceId,
    //                     // PetId: objVehicle.id,
    //                     Status: ConnectionStatus
    //                 }
    //                 io.sockets.emit(DeviceId + 'BikeDeviceStatus', JSON.stringify(objConnection));
    //             });
    //         } else {
    //             Callback("No Response");
    //             strResponce = "No Response";
    //         }
    //     } else {
    //         Callback("No Response");
    //         strResponce = "No Response";
    //     }
    // });
}

//Send Speed Data
router.get('/SendSpeedData', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var DeviceId = req.query.DeviceId;
    // obj.Speed = req.query.Speed;
    var IsOverSpeed = false;
    var IsSpeedAlert = false;
    client.get(DeviceId + "MaxSpeedAlarm", function(err, strSpeed) {
        if (!err) {
            if (strSpeed != null && strSpeed != undefined && strSpeed != '' && strSpeed != 'null' && strSpeed != 'undefined') {
                var objlastspeeddata = JSON.parse(strSpeed);
                if (objlastspeeddata != null) {
                    IsOverSpeed = objlastspeeddata.IsOverSpeed;
                    IsSpeedAlert = objlastspeeddata.IsSpeedAlert;
                }
            }
        }
        var objmaxspeedData = {
            Speed: req.query.Speed,
            IsSpeedAlert: IsSpeedAlert,
            IsOverSpeed: IsOverSpeed
        }

        client.set(DeviceId + "MaxSpeedAlarm", JSON.stringify(objmaxspeedData), function(err, replies) {});
        connection.query("Update tblvehicle set MaxSpeed=" + req.query.Speed + " where deviceid='" + DeviceId + "'", function(err, rows, fields) {
            client.set(DeviceId + "MaxSpeed", req.query.Speed.toString(), function(err, replies) {});
            res.json({ success: true, message: 'Speed Settings Save Successfully.' });
        });
    });

})


//Engine Cut OFF Settings
router.get('/EngineCutOff', function(req, res) {
    req.setTimeout(3600000);
    //GetLookAtMeDP3110a0f
    //Test Device 075034699503
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.IsEngineCutOff = req.query.IsEngineCutOff;
    // obj.TimeInterval = req.query.TimeInterval;
    EngineCutOff(obj, function(data) {
        res.json(data);
    })


})

//Engine Cut OFF Settings //78 78 15 80 0F 00 01 A9 58 44 59 44 2C 30 30 30 30 30 30 23 00 A0 DC F1 0D 0A
global.EngineCutOff = function(objdata, Callback) {
    var today = new Date();
    var DeviceId = objdata.DeviceId;
    var Content = "";
    if (objdata.IsEngineCutOff == true) {
        Content = '00000001' + a2hex("DYD,000000#");
    } else {
        Content = '00000001' + a2hex("HFYD,000000#");
    }

    var Data = "80" + ('00' + (Content.length / 2).toString(16)).slice(-2) + Content + "0001";
    Data = ('00' + ((Data.length / 2) + 2).toString(16)).slice(-2) + Data;
    // Data = Data + CalculateCRCbyHex(Data) + '0D0A';
    var socketclient = new net.Socket();
    var Sendflag = false;

    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function(err, resSocket) {

        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) {

                }
            }
        }



        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function() {
            // console.log('G-Sensor send to ' + DeviceId);
            var objData = {
                DeviceId: DeviceId,
                Data: Data,
                CommandType: '00000001'
            }
            socketclient.write('7878' + a2hex("LOCAL80") + a2hex(JSON.stringify(objData)) + '0d0a', 'hex');

            socketclient.setTimeout(10000, function() {
                if (Sendflag == false) {
                    Sendflag = true;

                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                    // SendGSensorCommand(i + 1);
                };

            });
        });

        socketclient.on('data', function(data) {
            var line = data.toString();
            if (Sendflag == false) {
                if (line.substring(0, 4) == '7878' && line.substring(6, 8) == '15' && line.substring(10, 18) == '00000001') {
                    console.log('Received: ' + line);
                    var StatusCode = hex2a(line.substring(18, line.length - 16));
                    Sendflag = true;
                    // SuccessDevice = SuccessDevice + 1;
                    // res.json(objNavigation);
                    socketclient.destroy(); // kill socketclient after server's response
                    if (StatusCode.indexOf("DYD=Success!") >= 0) {
                        // connection.query("Update tblvehicle set GPRSInterval=" + objdata.TimeInterval + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        connection.query("Update tblvehicle set Relay=" + objdata.IsEngineCutOff + " where deviceid='" + DeviceId + "'", function(err, rows, fields) {
                            Callback({ success: true, message: 'Engine Cutoff Successfully.' });
                        });
                        // });
                    } else if (StatusCode.indexOf("HFYD=Success!") >= 0) {
                        // connection.query("Update tblvehicle set GPRSInterval=" + objdata.TimeInterval + " where deviceid=" + DeviceId, function(err, rows, fields) {
                        connection.query("Update tblvehicle set Relay=" + objdata.IsEngineCutOff + " where deviceid='" + DeviceId + "'", function(err, rows, fields) {
                            Callback({ success: true, message: 'Engine Cutoff Recover Successfully.' });
                        });
                        // });
                    } else {
                        if (objdata.IsEngineCutOff == true) {
                            Callback({ success: false, message: 'Engine could not cutoff. Try again later.' });
                        } else {
                            Callback({ success: false, message: 'Engine cutoff could not recover. Try again later.' });
                        }
                    }

                } else {
                    Sendflag = true;

                    socketclient.destroy();
                    if (objdata.IsEngineCutOff == true) {
                        Callback({ success: false, message: 'Engine could not cutoff. Try again later.' });
                    } else {
                        Callback({ success: false, message: 'Engine cutoff could not recover. Try again later.' });
                    }
                    // SendGSensorCommand(i + 1);
                }
            };


        });

        socketclient.on('close', function() {
            console.log('Connection closed');
        });
    });
}

global.convert_lat_long_format = function(data) {
    var data1 = parseFloat(data) / 30000;
    var deg = Math.floor(data1 / 60);
    var min = (data1 % 60).toString();
    if (min.substring(0, min.indexOf('.')).length == 1) {
        min = '0' + min.toString();
    }

    return deg.toString() + min.toString();
}

//Hex to Byte For CRC
function hex2byteCRC(hexx) {
    var hex = hexx.toString(); //force conversion
    var lst = [];
    for (var i = 0; i < hex.length; i += 2)
        lst.push(parseInt(hex.substr(i, 2), 16));
    return lst;
}

function hexToBinary(s) {
    var i, k, part, ret = '';
    // lookup table for easier conversion. '0' characters are padded for '1' to '7'
    var lookupTable = {
        '0': '0000',
        '1': '0001',
        '2': '0010',
        '3': '0011',
        '4': '0100',
        '5': '0101',
        '6': '0110',
        '7': '0111',
        '8': '1000',
        '9': '1001',
        'a': '1010',
        'b': '1011',
        'c': '1100',
        'd': '1101',
        'e': '1110',
        'f': '1111',
        'A': '1010',
        'B': '1011',
        'C': '1100',
        'D': '1101',
        'E': '1110',
        'F': '1111'
    };
    for (i = 0; i < s.length; i += 1) {
        if (lookupTable.hasOwnProperty(s[i])) {
            ret += lookupTable[s[i]];
        }
    }
    return ret;
}

//Decimal To Hex
function decimalToHexString(number) {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

function a2hex(str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i++) {
        var hex = ("00" + Number(str.charCodeAt(i)).toString(16).toUpperCase()).slice(-2);
        arr.push(hex);
    }

    return arr.join('');
}

//Hex to Ascii
function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function convertdateformat(date1) {
    var date = new Date(date1);
    var firstdayMonth = date.getUTCMonth() + 1;
    var firstdayDay = date.getUTCDate();
    var firstdayYear = date.getUTCFullYear();
    var firstdayHours = date.getUTCHours();
    var firstdayMinutes = date.getUTCMinutes();
    var firstdaySeconds = date.getUTCSeconds();

    return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

}

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

module.exports = router