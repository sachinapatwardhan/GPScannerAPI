var redis = require('redis');
var mysql = require('mysql');
var MysqlConnection;
if (process.env.IsProduction == true || process.env.IsProduction == "true") {
    var RedisClient = redis.createClient({
        host: process.env.RedisHost,
        port: process.env.RedisPort,
        password: process.env.RedisPassword
    });

    RedisClient.on('error', function(err) {});
} else {
    var RedisClient = redis.createClient({
        host: process.env.RedisHost,
        port: process.env.RedisPort
    });
    RedisClient.on('error', function(err) {});
}
mysqlConnectionSetup();
//Add/Update Device Setting in Redis
function UpdateVehicleRedis(DeviceId, Type) {
    RedisClient.get(DeviceId + "Settings", function(err, Vehicledata) {
        if (!err && Vehicledata != null && Vehicledata != undefined && Vehicledata != '') {
            objData = JSON.parse(Vehicledata);
            if (Type == 'Vehicle') {
                //Vehicle
                MysqlConnection.query("SELECT * from tblvehicle where deviceid='" + DeviceId + "' and IsDelete=false", function(err, Bikerows, fields) {
                    if (!err && Bikerows.length > 0) {
                        var objVehicle = Bikerows[0];
                        objData["Vehicle"] = objVehicle;
                        // Add in Redis
                        RedisClient.set(DeviceId + "Settings", JSON.stringify(objData), function(err, replies) {});
                    }
                });
            } else if (Type == 'User') {
                var objVehicle = objData.Vehicle;
                //User
                MysqlConnection.query("SELECT id,email,username,phone,country,idApp,Notification FROM tbluserinformation where id=" + objVehicle.iduser + ";", function(err, userrow, fields) {
                    objData["User"] = userrow[0];
                    // Add in Redis
                    RedisClient.set(DeviceId + "Settings", JSON.stringify(objData), function(err, replies) {});
                });
            } else if (Type == 'Fence') {
                //Fence
                MysqlConnection.query("SELECT * from tblfence where deviceId='" + DeviceId + "' and IsFenceOnline=true", function(err, rows, fields) {
                    objData["FenceList"] = rows;
                    // Add in Redis
                    RedisClient.set(DeviceId + "Settings", JSON.stringify(objData), function(err, replies) {});
                });
            } else if (Type == 'PushNotification') {
                var objVehicle = objData.Vehicle;
                //Push Notification
                var query = "SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  " +
                    "from tblsharedevice ts " +
                    "inner join tblpushnotification tp on tp.iduser=ts.idUser " +
                    "inner join tbluserinformation tu on ts.idUser=tu.id " +
                    "where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true and Notification=true " +
                    "union " +
                    "SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpushnotification tp on tu.id=tp.iduser where tu.id=" + objVehicle.iduser + ";";
                MysqlConnection.query(query, function(err, lstNotificationList, fields) {
                    objData["PushNotificationUsers"] = lstNotificationList;
                    // Add in Redis
                    RedisClient.set(DeviceId + "Settings", JSON.stringify(objData), function(err, replies) {});
                });
            } else if (Type == 'PWAPushNotification') {
                var objVehicle = objData.Vehicle;
                //PWA Push Notification
                var query = "SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  " +
                    "from tblsharedevice ts " +
                    "inner join tblpwa_notification_subscription tp on tp.iduser=ts.idUser " +
                    "inner join tbluserinformation tu on ts.idUser=tu.id " +
                    "where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true and Notification=true " +
                    "union " +
                    "SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpwa_notification_subscription tp on tu.id=tp.iduser where tu.id=" + objVehicle.iduser + ";";
                MysqlConnection.query(query, function(err, lstPWANotificationList, fields) {
                    objData["PWAPushNotificationUsers"] = lstNotificationList;
                    // Add in Redis
                    RedisClient.set(DeviceId + "Settings", JSON.stringify(objData), function(err, replies) {});
                });
            } else {
                //Vehicle
                MysqlConnection.query("SELECT * from tblvehicle where deviceid='" + DeviceId + "' and IsDelete=false", function(err, Bikerows, fields) {
                    if (!err && Bikerows.length > 0) {
                        var objVehicle = Bikerows[0];
                        objData["Vehicle"] = objVehicle;
                        //User
                        MysqlConnection.query("SELECT id,email,username,phone,country,idApp,Notification FROM tbluserinformation where id=" + objVehicle.iduser + ";", function(err, userrow, fields) {
                            objData["User"] = userrow[0];
                            //Fence
                            MysqlConnection.query("SELECT * from tblfence where deviceId='" + DeviceId + "' and IsFenceOnline=true", function(err, rows, fields) {
                                objData["FenceList"] = rows;
                                //Push Notification
                                var query = "SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  " +
                                    "from tblsharedevice ts " +
                                    "inner join tblpushnotification tp on tp.iduser=ts.idUser " +
                                    "inner join tbluserinformation tu on ts.idUser=tu.id " +
                                    "where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true and Notification=true " +
                                    "union " +
                                    "SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpushnotification tp on tu.id=tp.iduser where tu.id=" + objVehicle.iduser + ";";
                                MysqlConnection.query(query, function(err, lstNotificationList, fields) {
                                    objData["PushNotificationUsers"] = lstNotificationList;
                                    //PWA Push Notification
                                    var query = "SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  " +
                                        "from tblsharedevice ts " +
                                        "inner join tblpwa_notification_subscription tp on tp.iduser=ts.idUser " +
                                        "inner join tbluserinformation tu on ts.idUser=tu.id " +
                                        "where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true and Notification=true " +
                                        "union " +
                                        "SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpwa_notification_subscription tp on tu.id=tp.iduser where tu.id=" + objVehicle.iduser + ";";
                                    MysqlConnection.query(query, function(err, lstPWANotificationList, fields) {
                                        objData["PWAPushNotificationUsers"] = lstNotificationList;
                                        // Add in Redis
                                        RedisClient.set(DeviceId + "Settings", JSON.stringify(objData), function(err, replies) {});
                                    });
                                });
                            });
                        });
                    }
                })
            }
        } else {
            var objData = {};
            //Vehicle
            MysqlConnection.query("SELECT * from tblvehicle where deviceid='" + DeviceId + "' and IsDelete=false", function(err, Bikerows, fields) {
                if (!err && Bikerows.length > 0) {
                    var objVehicle = Bikerows[0];
                    objData["Vehicle"] = objVehicle;
                    //User
                    MysqlConnection.query("SELECT id,email,username,phone,country,idApp,Notification FROM tbluserinformation where id=" + objVehicle.iduser + ";", function(err, userrow, fields) {
                        objData["User"] = userrow[0];
                        //Fence
                        MysqlConnection.query("SELECT * from tblfence where deviceId='" + DeviceId + "' and IsFenceOnline=true", function(err, rows, fields) {
                            objData["FenceList"] = rows;
                            //Push Notification
                            var query = "SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  " +
                                "from tblsharedevice ts " +
                                "inner join tblpushnotification tp on tp.iduser=ts.idUser " +
                                "inner join tbluserinformation tu on ts.idUser=tu.id " +
                                "where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true and Notification=true " +
                                "union " +
                                "SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpushnotification tp on tu.id=tp.iduser where tu.id=" + objVehicle.iduser + ";";
                            MysqlConnection.query(query, function(err, lstNotificationList, fields) {
                                objData["PushNotificationUsers"] = lstNotificationList;
                                //PWA Push Notification
                                var query = "SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  " +
                                    "from tblsharedevice ts " +
                                    "inner join tblpwa_notification_subscription tp on tp.iduser=ts.idUser " +
                                    "inner join tbluserinformation tu on ts.idUser=tu.id " +
                                    "where idVehicle=" + objVehicle.id + " and IsSharedUserNotification=true and IsNotification=true and Notification=true " +
                                    "union " +
                                    "SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpwa_notification_subscription tp on tu.id=tp.iduser where tu.id=" + objVehicle.iduser + ";";
                                MysqlConnection.query(query, function(err, lstPWANotificationList, fields) {
                                    objData["PWAPushNotificationUsers"] = lstNotificationList;
                                    // Add in Redis
                                    RedisClient.set(DeviceId + "Settings", JSON.stringify(objData), function(err, replies) {});
                                });
                            });
                        });
                    });
                }
            })
        }
    });
};
//Delete Device Setting from Redis
function DeleteVehicleRedis(DeviceId) {
    RedisClient.del(DeviceId + "Settings", function(err, Vehicledata) {});
}
//Update AppSetting in Redis
function UpdateAppInfoRedis() {
    MysqlConnection.query("select id,AppName,IOSCertificate, IOSKey, AndroidId, AndroidSenderId from tblappinfo", function(err, rows, fields) {
        for (var i = 0; i < rows.length; i++) {
            RedisClient.set(rows[i].id + "AppSetting", JSON.stringify(rows[i]), function(err, replies) {
                console.log("Set Success")
            });
        }
    })
}
setTimeout(function() {
    UpdateAppInfoRedis();
}, 100);
//MySql Connection
function mysqlConnectionSetup() {
    if (!MysqlConnection || MysqlConnection.state != 'authenticated') {
        MysqlConnection = mysql.createConnection({
            host: process.env.MysqlHost,
            user: process.env.Mysqluser,
            password: process.env.Mysqlpassword,
            database: process.env.Mysqldatabase
        });
        MysqlConnection.connect(function(err) { // The server is either down
            if (err) { // or restarting (takes a while sometimes).
                console.log('error when connecting to db:', err);
                setTimeout(mysqlConnectionSetup, 2000); // We introduce a delay before attempting to reconnect,
            } // to avoid a hot loop, and to allow our node script to
        }); // process asynchronous requests in the meantime.
        MysqlConnection.on('error', function(err) {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                mysqlConnectionSetup(); // lost due to either server restart, or a
            } else { // connnection idle timeout (the wait_timeout
                mysqlConnectionSetup(); // server variable configures this)
            }
        });
        // return connection;
    }
}

module.exports = {
    UpdateVehicleRedis: UpdateVehicleRedis,
    DeleteVehicleRedis: DeleteVehicleRedis,
    UpdateAppInfoRedis: UpdateAppInfoRedis
}