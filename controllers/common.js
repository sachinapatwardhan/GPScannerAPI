var redis = require('redis');
var mysql = require('mysql');
var request = require('request');
var NodeGeocoder = require('node-geocoder');
var Address = models.tbladdress;
var SIMDetails = models.tblsimdetails;
var GpsDevice = models.tblgpsdevice;
var options = {
  provider: 'google',
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyAzzv0uzTJsDnsxVoBKYg1xNn8bCBrMErM', // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
};
var geocoder = NodeGeocoder(options);
var MysqlConnection;
if (process.env.IsProduction == true || process.env.IsProduction == 'true') {
  var RedisClient = redis.createClient({
    host: process.env.RedisHost,
    port: process.env.RedisPort,
    password: process.env.RedisPassword,
  });

  RedisClient.on('error', function (err) {});
} else {
  var RedisClient = redis.createClient({
    host: process.env.RedisHost,
    port: process.env.RedisPort,
  });
  RedisClient.on('error', function (err) {});
}
mysqlConnectionSetup();
//Add/Update Device Setting in Redis
function UpdateVehicleRedis(DeviceId, Type) {
  RedisClient.get(DeviceId + 'Settings', function (err, Vehicledata) {
    if (
      !err &&
      Vehicledata != null &&
      Vehicledata != undefined &&
      Vehicledata != ''
    ) {
      objData = JSON.parse(Vehicledata);
      if (Type == 'Vehicle') {
        //Vehicle
        MysqlConnection.query(
          "SELECT * from tblvehicle where deviceid='" +
            DeviceId +
            "' and IsDelete=false",
          function (err, Bikerows, fields) {
            if (!err && Bikerows.length > 0) {
              var objVehicle = Bikerows[0];
              objData['Vehicle'] = objVehicle;
              // Add in Redis
              RedisClient.set(
                DeviceId + 'Settings',
                JSON.stringify(objData),
                function (err, replies) {}
              );
            }
          }
        );
      } else if (Type == 'User') {
        var objVehicle = objData.Vehicle;
        //User
        MysqlConnection.query(
          'SELECT id,email,username,phone,country,idApp,Notification FROM tbluserinformation where id=' +
            objVehicle.iduser +
            ';',
          function (err, userrow, fields) {
            objData['User'] = userrow[0];
            // Add in Redis
            RedisClient.set(
              DeviceId + 'Settings',
              JSON.stringify(objData),
              function (err, replies) {}
            );
          }
        );
      } else if (Type == 'Fence') {
        //Fence
        MysqlConnection.query(
          "SELECT * from tblfence where deviceId='" +
            DeviceId +
            "' and IsFenceOnline=true",
          function (err, rows, fields) {
            objData['FenceList'] = rows;
            // Add in Redis
            RedisClient.set(
              DeviceId + 'Settings',
              JSON.stringify(objData),
              function (err, replies) {}
            );
          }
        );
      } else if (Type == 'PushNotification') {
        var objVehicle = objData.Vehicle;
        //Push Notification
        var query =
          'SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  ' +
          'from tblsharedevice ts ' +
          'inner join tblpushnotification tp on tp.iduser=ts.idUser ' +
          'inner join tbluserinformation tu on ts.idUser=tu.id ' +
          'where idVehicle=' +
          objVehicle.id +
          ' and IsSharedUserNotification=true and IsNotification=true and Notification=true ' +
          'union ' +
          'SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpushnotification tp on tu.id=tp.iduser where tu.id=' +
          objVehicle.iduser +
          ';';
        MysqlConnection.query(
          query,
          function (err, lstNotificationList, fields) {
            objData['PushNotificationUsers'] = lstNotificationList;
            // Add in Redis
            RedisClient.set(
              DeviceId + 'Settings',
              JSON.stringify(objData),
              function (err, replies) {}
            );
          }
        );
      } else if (Type == 'PWAPushNotification') {
        var objVehicle = objData.Vehicle;
        //PWA Push Notification
        var query =
          'SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  ' +
          'from tblsharedevice ts ' +
          'inner join tblpwa_notification_subscription tp on tp.iduser=ts.idUser ' +
          'inner join tbluserinformation tu on ts.idUser=tu.id ' +
          'where idVehicle=' +
          objVehicle.id +
          ' and IsSharedUserNotification=true and IsNotification=true and Notification=true ' +
          'union ' +
          'SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpwa_notification_subscription tp on tu.id=tp.iduser where tu.id=' +
          objVehicle.iduser +
          ';';
        MysqlConnection.query(
          query,
          function (err, lstPWANotificationList, fields) {
            objData['PWAPushNotificationUsers'] = lstNotificationList;
            // Add in Redis
            RedisClient.set(
              DeviceId + 'Settings',
              JSON.stringify(objData),
              function (err, replies) {}
            );
          }
        );
      } else {
        //Vehicle
        MysqlConnection.query(
          "SELECT * from tblvehicle where deviceid='" +
            DeviceId +
            "' and IsDelete=false",
          function (err, Bikerows, fields) {
            if (!err && Bikerows.length > 0) {
              var objVehicle = Bikerows[0];
              objData['Vehicle'] = objVehicle;
              //User
              MysqlConnection.query(
                'SELECT id,email,username,phone,country,idApp,Notification FROM tbluserinformation where id=' +
                  objVehicle.iduser +
                  ';',
                function (err, userrow, fields) {
                  objData['User'] = userrow[0];
                  //Fence
                  MysqlConnection.query(
                    "SELECT * from tblfence where deviceId='" +
                      DeviceId +
                      "' and IsFenceOnline=true",
                    function (err, rows, fields) {
                      objData['FenceList'] = rows;
                      //Push Notification
                      var query =
                        'SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  ' +
                        'from tblsharedevice ts ' +
                        'inner join tblpushnotification tp on tp.iduser=ts.idUser ' +
                        'inner join tbluserinformation tu on ts.idUser=tu.id ' +
                        'where idVehicle=' +
                        objVehicle.id +
                        ' and IsSharedUserNotification=true and IsNotification=true and Notification=true ' +
                        'union ' +
                        'SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpushnotification tp on tu.id=tp.iduser where tu.id=' +
                        objVehicle.iduser +
                        ';';
                      MysqlConnection.query(
                        query,
                        function (err, lstNotificationList, fields) {
                          objData['PushNotificationUsers'] =
                            lstNotificationList;
                          //PWA Push Notification
                          var query =
                            'SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  ' +
                            'from tblsharedevice ts ' +
                            'inner join tblpwa_notification_subscription tp on tp.iduser=ts.idUser ' +
                            'inner join tbluserinformation tu on ts.idUser=tu.id ' +
                            'where idVehicle=' +
                            objVehicle.id +
                            ' and IsSharedUserNotification=true and IsNotification=true and Notification=true ' +
                            'union ' +
                            'SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpwa_notification_subscription tp on tu.id=tp.iduser where tu.id=' +
                            objVehicle.iduser +
                            ';';
                          MysqlConnection.query(
                            query,
                            function (err, lstPWANotificationList, fields) {
                              objData['PWAPushNotificationUsers'] =
                                lstNotificationList;
                              // Add in Redis
                              RedisClient.set(
                                DeviceId + 'Settings',
                                JSON.stringify(objData),
                                function (err, replies) {}
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          }
        );
      }
    } else {
      var objData = {};
      //Vehicle
      MysqlConnection.query(
        "SELECT * from tblvehicle where deviceid='" +
          DeviceId +
          "' and IsDelete=false",
        function (err, Bikerows, fields) {
          if (!err && Bikerows.length > 0) {
            var objVehicle = Bikerows[0];
            objData['Vehicle'] = objVehicle;
            //User
            MysqlConnection.query(
              'SELECT id,email,username,phone,country,idApp,Notification FROM tbluserinformation where id=' +
                objVehicle.iduser +
                ';',
              function (err, userrow, fields) {
                objData['User'] = userrow[0];
                //Fence
                MysqlConnection.query(
                  "SELECT * from tblfence where deviceId='" +
                    DeviceId +
                    "' and IsFenceOnline=true",
                  function (err, rows, fields) {
                    objData['FenceList'] = rows;
                    //Push Notification
                    var query =
                      'SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  ' +
                      'from tblsharedevice ts ' +
                      'inner join tblpushnotification tp on tp.iduser=ts.idUser ' +
                      'inner join tbluserinformation tu on ts.idUser=tu.id ' +
                      'where idVehicle=' +
                      objVehicle.id +
                      ' and IsSharedUserNotification=true and IsNotification=true and Notification=true ' +
                      'union ' +
                      'SELECT tu.id,tp.udid,tp.Platform,tp.PushNotificationId,tp.UserType,tp.MessageCount,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpushnotification tp on tu.id=tp.iduser where tu.id=' +
                      objVehicle.iduser +
                      ';';
                    MysqlConnection.query(
                      query,
                      function (err, lstNotificationList, fields) {
                        objData['PushNotificationUsers'] = lstNotificationList;
                        //PWA Push Notification
                        var query =
                          'SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm  ' +
                          'from tblsharedevice ts ' +
                          'inner join tblpwa_notification_subscription tp on tp.iduser=ts.idUser ' +
                          'inner join tbluserinformation tu on ts.idUser=tu.id ' +
                          'where idVehicle=' +
                          objVehicle.id +
                          ' and IsSharedUserNotification=true and IsNotification=true and Notification=true ' +
                          'union ' +
                          'SELECT tu.id,tp.endpoint,tp.auth,tp.p256dh,(SELECT GROUP_CONCAT(AlarmCode) FROM tblnotificationsetting tns inner join tblnotificationmgmt tn on tns.idNotification=tn.id where idUser=tu.id and IsNotificationOn=false) as NoAlarm FROM tbluserinformation as tu inner join tblpwa_notification_subscription tp on tu.id=tp.iduser where tu.id=' +
                          objVehicle.iduser +
                          ';';
                        MysqlConnection.query(
                          query,
                          function (err, lstPWANotificationList, fields) {
                            objData['PWAPushNotificationUsers'] =
                              lstNotificationList;
                            // Add in Redis
                            RedisClient.set(
                              DeviceId + 'Settings',
                              JSON.stringify(objData),
                              function (err, replies) {}
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        }
      );
    }
  });
}
//Delete Device Setting from Redis
function DeleteVehicleRedis(DeviceId) {
  RedisClient.del(DeviceId + 'Settings', function (err, Vehicledata) {});
}
//Update AppSetting in Redis
function UpdateAppInfoRedis() {
  MysqlConnection.query(
    'select id,AppName,IOSCertificate, IOSKey, AndroidId, AndroidSenderId from tblappinfo',
    function (err, rows, fields) {
      for (var i = 0; i < rows.length; i++) {
        RedisClient.set(
          rows[i].id + 'AppSetting',
          JSON.stringify(rows[i]),
          function (err, replies) {
            console.log('Set Success');
          }
        );
      }
    }
  );
}
setTimeout(function () {
  UpdateAppInfoRedis();
}, 100);
//MySql Connection
function mysqlConnectionSetup() {
  if (!MysqlConnection || MysqlConnection.state != 'authenticated') {
    MysqlConnection = mysql.createConnection({
      host: process.env.MysqlHost,
      user: process.env.Mysqluser,
      password: process.env.Mysqlpassword,
      database: process.env.Mysqldatabase,
    });
    MysqlConnection.connect(function (err) {
      // The server is either down
      if (err) {
        // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(mysqlConnectionSetup, 2000); // We introduce a delay before attempting to reconnect,
      } // to avoid a hot loop, and to allow our node script to
    }); // process asynchronous requests in the meantime.
    MysqlConnection.on('error', function (err) {
      console.log('db error', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        // Connection to the MySQL server is usually
        mysqlConnectionSetup(); // lost due to either server restart, or a
      } else {
        // connnection idle timeout (the wait_timeout
        mysqlConnectionSetup(); // server variable configures this)
      }
    });
    // return connection;
  }
}

function GetAddressLatLong(Latitude, Longitude, CallBack) {
  Address.findOne({ where: { Lat: Latitude, Lng: Longitude } })
    .then(function (resaddress) {
      if (resaddress && resaddress.Address) {
        return CallBack(resaddress.Address);
      } else {
        if (process.env.GeocodingService == 'google') {
          geocoder.reverse(
            { lat: Latitude, lon: Longitude },
            function (err, res) {
              if (!err || res != null) {
                if (res.length > 0) {
                  return CallBack(res[0].formattedAddress);
                } else {
                  return CallBack('');
                }
              } else {
                return CallBack('');
              }
            }
          );
        } else {
          var lat = Latitude;
          var lon = Longitude;
          // var url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lon;
          var url =
            'https://osmnames.klokantech.com/r/' +
            lon +
            '/' +
            lat +
            '.js?key=dgb7TgC5zR0YpsAqbE';
          request.get(
            url,
            {
              rejectUnauthorized: false,
            },
            function (err, response, data) {
              if (!err) {
                try {
                  data = JSON.parse(data);
                  if (data.results && data.results.length > 0) {
                    return CallBack(data.results[0].display_name);
                  } else {
                    return CallBack('');
                  }
                } catch (ex) {
                  return CallBack('');
                }
              } else {
                return CallBack('');
              }
            }
          );
        }
      }
    })
    .catch(function (error) {
      if (process.env.GeocodingService == 'google') {
        geocoder.reverse(
          { lat: Latitude, lon: Longitude },
          function (err, res) {
            if (!err || res != null) {
              if (res.length > 0) {
                return CallBack(res[0].formattedAddress);
              } else {
                return CallBack('');
              }
            } else {
              return CallBack('');
            }
          }
        );
      } else {
        var lat = Latitude;
        var lon = Longitude;
        // var url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lon;
        var url =
          'https://osmnames.klokantech.com/r/' +
          lon +
          '/' +
          lat +
          '.js?key=dgb7TgC5zR0YpsAqbE';
        request.get(
          url,
          {
            rejectUnauthorized: false,
          },
          function (err, response, data) {
            if (!err) {
              try {
                data = JSON.parse(data);
                if (data.results && data.results.length > 0) {
                  return CallBack(data.results[0].display_name);
                } else {
                  return CallBack('');
                }
              } catch (ex) {
                return CallBack('');
              }
            } else {
              return CallBack('');
            }
          }
        );
      }
    });
}

function GetLatLongAddress(Address, CallBack) {
  if (process.env.GeocodingService == 'google') {
    geocoder.geocode(Address, function (err, res) {
      if (!err || res != null) {
        if (res.length > 0) {
          var obj = new Object();
          obj.Lat = res[0].latitude;
          obj.Lang = res[0].longitude;
          return CallBack(obj);
        } else {
          return CallBack(null);
        }
      } else {
        return CallBack(null);
      }
    });
  } else {
    var Address = Address;
    var url =
      'https://nominatim.openstreetmap.org/search.php?q=' +
      Address +
      '&format=jsonv2';
    request.get(url, function (err, response, data) {
      if (!err) {
        try {
          data = JSON.parse(data);
          if (data.length > 0) {
            var obj = {
              Lat: parseFloat(data[0].lat),
              Lang: parseFloat(data[0].lon),
            };
            return CallBack(obj);
          } else {
            return CallBack(null);
          }
        } catch (ex) {
          return CallBack(null);
        }
      } else {
        return CallBack(null);
      }
    });
  }
}

function updateSIMStartDate(DeviceId) {
  GpsDevice.findOne({
    where: { DeviceId: DeviceId, idSim: { $ne: null } },
  }).then(function (GpsDeviceExist) {
    if (GpsDeviceExist) {
      var idSim = GpsDeviceExist.idSim;
      var StartDate = new Date();
      SIMDetails.update(
        { StartDate: StartDate },
        { where: { id: idSim } }
      ).then(function (simupdated) {
        // return callback({ success: true, message: "Sim Start Date updated successfully..." })
      });
    } else {
      // return callback({ success: true, message: "Sim not assign..." })
    }
  });
}

module.exports = {
  UpdateVehicleRedis: UpdateVehicleRedis,
  DeleteVehicleRedis: DeleteVehicleRedis,
  UpdateAppInfoRedis: UpdateAppInfoRedis,
  GetAddressLatLong: GetAddressLatLong,
  GetLatLongAddress: GetLatLongAddress,
  updateSIMStartDate: updateSIMStartDate,
};
