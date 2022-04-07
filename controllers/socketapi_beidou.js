var router = express.Router();
var CommonFunction = require('./common.js');

//Send Speed Data
router.get('/SendSpeedData', function (req, res) {
    req.setTimeout(3600000);
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.Speed = req.query.Speed;
    SendSpeedDataBeidou(obj, function (data) {
        res.json(data);
    })
})

//Send Speed Data
global.SendSpeedDataBeidou = function (objdata, Callback) {
    var DeviceId = objdata.DeviceId;
    var Speed = ('00000000' + decimalToHexString(parseInt(objdata.Speed))).slice(-8);
    // var bodycommand = '80010005' + DeviceId + '' + ReplySerialnumber + '' + ReplySerialnumber + '010200'
    // var Checksum = mUtils.CalculateBeidouCRC(bodycommand)
    // var response = '7e' + bodycommand + '' + Checksum + '7e';

    var bodycommand = "8103000a" + DeviceId + "00a4010000005504" + Speed;
    var Checksum = CalculateBeidouCRC(bodycommand)
    var Data = '7e' + bodycommand + '' + Checksum + '7e';
    console.log('Send Data = ' + Data)
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            console.log("Response = " + line)
            // socketclient.destroy();
            if (Sendflag == false) {
                if (line.substring(34, 36) == '00') {
                    //     console.log('Received: ' + line);
                    //     var StatusCode = line.substring(26, 28);
                    Sendflag = true;
                    socketclient.destroy(); // kill socketclient after server's response
                    //     if (StatusCode == '01') {
                    connection.query("Update tblvehicle set MaxSpeed=" + objdata.Speed + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                        //Update Max Speed in Redis
                        CommonFunction.UpdateVehicleRedis(DeviceId, 'Vehicle');
                        funAuditLog.CreateAuditLog('Speed Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') max speed (' + objdata.Speed + ') setting at (time:' + convertdateformat(new Date()) + ').');
                        Callback({ success: true, message: 'Speed Settings Save Successfully.' });
                    });
                    //     } else {
                    //         Callback({ success: false, message: 'Speed Settings could not save. Try again later.' });
                    //     }
                } else {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Speed Settings could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Set Arm Settings
router.get('/SetArmSettings', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    if (req.query.Arm == '2' || req.query.Arm == 2) {
        var obj = new Object();
        obj.DeviceId = DeviceId;
        obj.Arm = req.query.Arm;
        connection.query("Update tblvehicle set Arm=" + obj.Arm + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
            //UpdateArm Mode in Redis
            CommonFunction.UpdateVehicleRedis(DeviceId, 'Vehicle');
            var Startdate = new Date();
            var convertDate = convertdateformatForUnix(Startdate);
            var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
            //----------------call redix server data--------------------------
            client.get(DeviceId, function (err, response) {
                if (!err && response != null && response != '' && response != undefined) {
                    response = JSON.parse(response);
                    if (response.IsEngine == 1) {
                        obj.ArmStatus = 0;
                    } else {
                        obj.ArmStatus = 1;
                    }
                    SetArmSettingsBeidou(obj, function (data) { });
                    funAuditLog.CreateAuditLog('Arm Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') Arm Setting at (time:' + convertdateformat(new Date()) + ').');
                    res.json({ success: true, message: 'Arm Settings Save Successfully.' });
                } else {
                    res.json({ success: true, message: 'Arm Settings Save Successfully.' });
                }
            })
        });
    } else {
        var obj = new Object();
        obj.DeviceId = DeviceId;
        obj.Arm = req.query.Arm;
        obj.ArmStatus = req.query.Arm;
        SetArmSettingsBeidou(obj, function (data) {
            res.json(data);
        })
    }
})

//Set Arm Settings
global.SetArmSettingsBeidou = function (objdata, Callback) {
    // var Arm = ('00' + decimalToHexString(parseInt(objdata.ArmStatus))).slice(-2);
    var Arm = '11';
    if (objdata.ArmStatus == 0 || objdata.ArmStatus == '0') {
        Arm = '12';
    }
    var DeviceId = objdata.DeviceId;
    // var Data = "40400012" + DeviceId + "4116" + Arm;
    // Data = Data + CalculateCRCbyHex(Data) + '0D0A';

    var bodycommand = "81050001" + DeviceId + "00a1" + Arm;
    var Checksum = CalculateBeidouCRC(bodycommand);
    var Data = '7e' + bodycommand + '' + Checksum + '7e';
    console.log('Send Data = ' + Data)

    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                Sendflag = true;
                socketclient.destroy(); // kill client after server's response
                if (line.substring(34, 36) == '00') {
                    console.log('Received: ' + line);
                    connection.query("Update tblvehicle set Arm=" + objdata.Arm + ", LastArmSetting=" + objdata.ArmStatus + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                        //Update Arm Setting in Redis
                        CommonFunction.UpdateVehicleRedis(DeviceId, 'Vehicle');
                        funAuditLog.CreateAuditLog('Arm Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') Arm Setting at (time:' + convertdateformat(new Date()) + ').');
                        Callback({ success: true, message: 'Arm Settings Save Successfully.' });
                    });

                } else {
                    Callback({ success: false, message: 'Arm Settings could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Set Initial ODOmeter Settings
router.get('/SetOdometerSetting', function (req, res) {
    req.setTimeout(3600000);
    var obj = new Object();
    obj.DeviceId = req.query.DeviceId;
    obj.odometer = req.query.odometer;
    SetOdometerSettingBeidou(obj, function (data) {
        res.json(data);
    })
})

//Set Initial ODOmeter Settings
global.SetOdometerSettingBeidou = function (objdata, Callback) {
    var DeviceId = objdata.DeviceId;
    // var odometer = a2hex(objdata.odometer);
    // var datalength = 8;
    // var Data = DeviceId + "4145" + odometer;
    // datalength = datalength + (Data.length / 2);
    // Data = "4040" + ('0000' + datalength.toString(16)).slice(-4) + Data + CalculateCRCbyHex(Data) + '0D0A';

    var Odometer = ('00000000' + decimalToHexString(parseInt(objdata.odometer))).slice(-8);
    var bodycommand = "8103000a" + DeviceId + "00aa010000003404" + Odometer;
    var Checksum = CalculateBeidouCRC(bodycommand)
    var Data = '7e' + bodycommand + '' + Checksum + '7e';
    console.log('Send Data = ' + Data)

    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    Callback({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                Sendflag = true;
                socketclient.destroy(); // kill socketclient after server's response
                if (line.substring(34, 36) == '00') {
                    console.log('Received: ' + line);

                    connection.query("Update tblvehicle set OdoMeter=" + objdata.odometer + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                        funAuditLog.CreateAuditLog('Odometer Setting', null, 'Change vehicle (DeviceId:' + DeviceId + ') Odometer Setting at (time:' + convertdateformat(new Date()) + ').');
                        Callback({ success: true, message: 'Odometer settings Save Successfully.' });
                    });
                } else {
                    Callback({ success: false, message: 'Odometer settings could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
}

//Set Output Control Settings
router.get('/SetRelaySetting', function (req, res) {
    req.setTimeout(3600000);
    var DeviceId = req.query.DeviceId;
    // var ARelay = req.query.Relay;
    var Relay = ('00' + decimalToHexString(parseInt(req.query.Relay))).slice(-2);

    var bodycommand = "85000001" + DeviceId + "0001" + Relay;
    var Checksum = CalculateBeidouCRC(bodycommand);
    var Data = '7e' + bodycommand + '' + Checksum + '7e';
    console.log('Send Data = ' + Data)
    var socketclient = new net.Socket();
    var Sendflag = false;
    var ClintSocketPort = SocketPort;
    var ClintSocketIPAddress = SocketIPAddress;
    client.get(DeviceId + "SocketConnection", function (err, resSocket) {
        if (!err) {
            if (resSocket != null && resSocket != undefined && resSocket != '') {
                try {
                    var objsocketconnection = JSON.parse(resSocket);
                    ClintSocketIPAddress = objsocketconnection.IP;
                    ClintSocketPort = objsocketconnection.Port;
                } catch (ex) { }
            }
        }
        socketclient.connect(ClintSocketPort, ClintSocketIPAddress, function () {
            socketclient.write(Data, 'hex');
            socketclient.setTimeout(10000, function () {
                if (Sendflag == false) {
                    Sendflag = true;
                    socketclient.destroy();
                    res.json({ success: false, message: 'Device not connected. Try after 5 minute.' });
                };
            });
        });
        socketclient.on('data', function (data) {
            var line = data.toString();
            if (Sendflag == false) {
                Sendflag = true;
                socketclient.destroy(); // kill socketclient after server's response
                if (line.substring(2, 6) == '0500') {
                    console.log('Received: ' + line);
                    connection.query("Update tblvehicle set Relay=" + req.query.Relay + " where deviceid='" + DeviceId + "'", function (err, rows, fields) {
                        client.set(DeviceId + "Relay", parseInt(req.query.Relay), function (err, replies) { });
                        CommonFunction.UpdateVehicleRedis(DeviceId, 'Vehicle');
                        funAuditLog.CreateAuditLog('Relay Setting', null, 'Change vehicle (DeviceId:' + req.query.DeviceId + ') Relay Setting at (time:' + convertdateformat(new Date()) + ').');
                        res.json({ success: true, message: 'Setting Save Successfully.' });
                    });
                } else {
                    res.json({ success: false, message: 'Setting could not save. Try again later.' });
                }
            };
        });
        socketclient.on('close', function () {
            console.log('Connection closed');
        });
    });
})

//Hex to Ascii
function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

// CRC for Beidou Device
function CalculateBeidouCRC(hex) {
    var str = hex2a(hex)
    let cs = 0;
    for (let char of str)
        cs ^= char.charCodeAt(0)
    return cs.toString(16)
}

//Decimal To Hex
function decimalToHexString(number) {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

function convertdateformat(date1) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();
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

module.exports = router
