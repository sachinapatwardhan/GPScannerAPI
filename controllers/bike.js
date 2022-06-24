var express = require('express'),
  router = express.Router();
//Tables
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var GPSData = models.tblgpsdata;
// var Alarm = models.tblalarm;
var Fence = models.tblfence;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var GpsDevice = models.tblgpsdevice;
var Buffer = require('buffer').Buffer;
var momentz = require('moment-timezone');
var SIM = models.tblsimdetails;
var SharedDevice = models.tblsharedevice;
var SystemEmail = models.tblemailsettingsys;
var EmailTemplate = models.tblemailtemplate;
var Setting = models.tblsetting;
var VehicleGroup = models.tblvehiclegroup;
var VehicleType = models.tblvehicletype;
var Commonfunction = require('./common.js');
//End of Tables

app.use(express.static(__dirname + '/../MediaUploads/PetUpload'));

function clone(obj) {
  if (null == obj || 'object' != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

function GetCurrentDate() {
  var today = new Date();

  var sec = today.getUTCSeconds();
  var min = today.getUTCMinutes();
  var hour = today.getUTCHours();

  var year = today.getUTCFullYear();
  var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
  var day = today.getUTCDate();

  return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
}

router.get('/getAllBikeByUser', function (req, res) {
  Vehicle.findAll({
    where: {
      iduser: req.query.idUser,
      IsDelete: false,
      deviceid: {
        $ne: '',
      },
    },
    order: 'CreatedDate',
  })
    .then(function (response) {
      res.json(response);
    })
    .catch(function (error) {
      res.json(error);
    });
});

router.get('/GetVehicleById', function (req, res) {
  Vehicle.findOne({
    where: {
      id: req.query.idVehicle,
    },
  }).then(function (response) {
    if (response != null) {
      res.json({
        success: true,
        message: 'Record found...',
        data: response,
      });
    } else {
      res.json(RecordNotFound);
    }
  });
});

router.get('/GetVehicleDetailById', function (req, res) {
  var query =
    'SELECT tv.*, tgd.ExpiryDate, tgd.IsActive, ' +
    " CONVERT_TZ(tv.InsurenceDate,'+00:00','" +
    CurrentOffset +
    "') as DisplayInsurenceDate, " +
    " CONVERT_TZ(tv.PUCDate,'+00:00','" +
    CurrentOffset +
    "') as DisplayPUCDate, " +
    " CONVERT_TZ(tv.renewaldate,'+00:00','" +
    CurrentOffset +
    "') as DisplayExpiryDate " +
    ' From tblvehicle as tv LEFT JOIN tblgpsdevice as tgd ON tgd.DeviceId = tv.deviceid WHERE tv.id = ' +
    req.query.idVehicle +
    ' LIMIT 1';
  connectionbikedata.query(query, function (err, rows, fields) {
    if (!err) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.json({ success: false, data: [] });
    }
  });
});

// router.post('/GetAllWorkingBike', jsonParser, function(req, res) {
//     var query = "select t4.id,t4.Name,t4.deviceid,t4.IsOnline,t4.DeviceType,t4.IsACC,t4.IsEngine, t4.Latitude,t4.Longitude,t4.Datetime, t4.Date, t4.Speed, t4.Direction,t4.OdoMeter,t4.VehicleType " +
//         "from " +
//         "(select t3.deviceid,t3.id,t3.iduser,t3.DeviceType,t3.VehicleType,t3.IsACC,tg.OdoMeter,tg.IsEngine, tg.Latitude,tg.Longitude,tg.Datetime, tg.Date, tg.Speed, tg.Direction,t3.Name,t3.IsOnline from  " +
//         " (select t.iduser ,t.deviceid ,t.id,t.Name,t.DeviceType,t.VehicleType,t.IsACC,t.IsOnline,max(tgp2.id) as 'GPSID'  from  " +
//         "  (select tb.iduser,tb.deviceid,tb.id,tb.Name,tb.DeviceType,tb.IsACC,tvt.Type as 'VehicleType',tb.IsOnline from tblvehicle tb " +
//         "   LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle " +
//         "   LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id " +
//         "   where (tb.iduser=" + req.query.idUser + " or tsd.idUser=" + req.query.idUser + ")  and tb.IsDelete=0 " +
//         "  ) as t " +
//         "  inner join   tblgpsdata as tgp2 on tgp2.DeviceId = t.deviceid  " +
//         "  group by t.DeviceId " +
//         " ) as t3 inner join tblgpsdata tg on tg.id = t3.GPSID ) " +
//         " as t4;";
//     // connection.query("SELECT tb.id,tb.deviceid,tb.Name,tb.IsOnline, tb.DeviceType, tb.IsACC,tpg.IsEngine, tpg1.Latitude,tpg1.Longitude,tpg.Datetime, tpg.Date, tpg1.Speed, tpg1.Direction,tvt.Type as VehicleType FROM tblvehicle tb LEFT JOIN tblvehicletype tvt on tvt.id = tb.idType INNER JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Date = b.Date INNER JOIN tblgpsdata tpg1 ON tb.deviceid=tpg1.DeviceId INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata where GPSPositioning='A' GROUP BY DeviceId) b1 ON tpg1.DeviceId = b1.DeviceId AND tpg1.Date = b1.Date LEFT JOIN tblsharedevice tsd on tb.id=tsd.idVehicle WHERE (tb.iduser=" + req.query.idUser + " or tsd.idUser=" + req.query.idUser + ") and IsDelete=false;", function(err, rows, fields) {
//     connection.query(query, function(err, rows, fields) {
//         if (!err) {
//             res.json({ success: true, data: rows });
//         } else {
//             res.json({ success: false, data: [] });
//         }
//     })
// })

router.post('/GetAllWorkingBike', jsonParser, function (req, res) {
  var query =
    'select t4.id,t4.iduser,t4.Name,t4.deviceid,t4.IsOnline,t4.DeviceType,t4.DeviceCompany,t4.IsACC,t4.VehicleType ' +
    'from ' +
    "  (select tb.iduser,tb.deviceid,tb.id,tb.Name,tb.DeviceType,tb.DeviceCompany,tb.IsACC,tvt.Type as 'VehicleType',tb.IsOnline from tblvehicle tb " +
    '   LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle ' +
    '   LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id ' +
    '   where (tb.iduser=' +
    req.query.idUser +
    ' or tsd.iduser=' +
    req.query.idUser +
    ') and IsDelete = false ' +
    '  ) as t4 group by t4.deviceid;';
  // connection.query("SELECT tb.id,tb.iduser,tb.Name,tb.deviceid,tb.IsOnline,tb.DeviceType,tpg1.IsEngine, tpg1.Latitude,tpg1.Longitude,tpg.Datetime, tpg.Date, tpg1.Speed, tpg1.Direction, tpg1.OdoMeter,tsd.id as ShareId,tvt.Type as VehicleType,(SELECT COUNT(*) FROM tblalarm WHERE IsRead=false and DeviceId = tb.deviceid) as NotificationCount, (SELECT COUNT(*) FROM tblserviceenhancementnotification WHERE IsRead=false and idvehicle = tb.id) as AlertCount FROM tblvehicle tb LEFT JOIN tblgpsdata tpg INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date  ON tb.deviceid=tpg.DeviceId LEFT JOIN tblgpsdata tpg1 INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata where GPSPositioning='A' GROUP BY DeviceId) b1 ON tpg1.DeviceId = b1.DeviceId AND tpg1.Date = b1.Date  ON tb.deviceid=tpg1.DeviceId LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id WHERE (tb.iduser=" + req.query.idUser + " or tsd.iduser=" + req.query.idUser + ") and IsDelete=false and tb.deviceid != '' group by tb.deviceid;", function(err, rows, fields) {
  connectionbikedata.query(query, function (err, rows, fields) {
    if (!err) {
      var lstAllVehicle = [];

      function getData(i) {
        if (i < rows.length) {
          var obj = new Object();
          obj.id = rows[i].id;
          obj.iduser = rows[i].iduser;
          obj.Name = rows[i].Name;
          obj.deviceid = rows[i].deviceid;
          obj.IsOnline = rows[i].IsOnline;
          obj.DeviceType = rows[i].DeviceType;
          obj.DeviceCompany = rows[i].DeviceCompany;
          obj.ShareId = rows[i].ShareId;
          obj.VehicleType = rows[i].VehicleType;
          obj.NotificationCount = rows[i].NotificationCount;
          obj.AlertCount = rows[i].AlertCount;

          client.get(rows[i].deviceid, function (err, strgpsdata) {
            if (!err) {
              if (
                (strgpsdata != null) & (strgpsdata != '') &&
                strgpsdata != undefined
              ) {
                var objgps = JSON.parse(strgpsdata);
                obj.IsEngine = objgps.IsEngine;
                obj.Latitude = objgps.Latitude;
                obj.Longitude = objgps.Longitude;
                obj.Datetime = objgps.Datetime;
                obj.Date = objgps.Date;
                obj.Speed = objgps.Speed;
                obj.Direction = objgps.Direction;
                obj.OdoMeter = objgps.OdoMeter;
                obj.AD1 = objgps.AD1;
                obj.AD2 = objgps.AD2;
                obj.IsWiringForAntiTamper = objgps.IsWiringForAntiTamper;
                lstAllVehicle.push(obj);
                getData(i + 1);
              } else {
                // obj.IsEngine = null;
                // obj.Latitude = null;
                // obj.Longitude = null;
                // obj.Datetime = null;
                // obj.Date = null;
                // obj.Speed = null;
                // obj.Direction = null;
                // obj.OdoMeter = null;
                // lstAllVehicle.push(obj);
                getData(i + 1);
              }
            } else {
              // obj.IsEngine = null;
              // obj.Latitude = null;
              // obj.Longitude = null;
              // obj.Datetime = null;
              // obj.Date = null;
              // obj.Speed = null;
              // obj.Direction = null;
              // obj.OdoMeter = null;
              // lstAllVehicle.push(obj);
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
  });
});

// router.get('/GetAllWorkingBikeWebApp', jsonParser, function(req, res) {
//     var query = "select t4.id,t4.iduser,t4.Name,t4.deviceid,t4.IsOnline,t4.DeviceType,t4.CreatedDate,t4.IsEngine, t4.Latitude,t4.Longitude,t4.Datetime, t4.Date, t4.Speed, t4.Direction,t4.OdoMeter,t4.ShareId,t4.VehicleType, " +
//         "(select count(*) from tblalarm  a where a.DeviceId =t4.deviceid and IsRead=false) as 'NotificationCount' , " +
//         "(SELECT COUNT(*) FROM tblserviceenhancementnotification WHERE IsRead=false and idvehicle = t4.id) as 'AlertCount' " +
//         "from " +
//         "(select t3.deviceid,t3.id,t3.iduser,t3.DeviceType,t3.ShareId,t3.VehicleType,t3.CreatedDate,tg.OdoMeter,tg.IsEngine, tg.Latitude,tg.Longitude,tg.Datetime, tg.Date, tg.Speed, tg.Direction,t3.Name,t3.IsOnline from  " +
//         " (select t.iduser ,t.deviceid ,t.id,t.Name,t.DeviceType,t.VehicleType,t.CreatedDate,t.ShareId,t.IsOnline,max(tgp2.id) as 'GPSID'  from  " +
//         "  (select tb.iduser,tb.deviceid,tb.id,tb.Name,tb.DeviceType,tb.CreatedDate,tvt.Type as 'VehicleType',tsd.id as'ShareId',tb.IsOnline from tblvehicle tb  " +
//         "   LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle  " +
//         "   LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id  " +
//         "   where (tb.iduser=" + req.query.idUser + " or tsd.idUser=" + req.query.idUser + ") and tb.IsDelete = 0 " +
//         "  ) as t  " +
//         "  left join   tblgpsdata as tgp2 on tgp2.DeviceId = t.deviceid  " +
//         "  group by t.DeviceId  " +
//         " ) as t3 left join tblgpsdata tg on tg.id = t3.GPSID )  " +
//         " as t4";
//     // connection.query("SELECT tb.*,( select count(id) from tblalarm where IsRead=0 and DeviceId = tb.DeviceId) as NotificationCount, (SELECT COUNT(*) FROM tblserviceenhancementnotification WHERE IsRead=false and idvehicle = tb.id) as AlertCount,tpg1.IsEngine, tpg1.Latitude,tpg1.Longitude,tpg.Datetime,tpg.OdoMeter, tpg.Date, tpg1.Speed, tpg1.Direction,tsd.id as ShareId,tvt.Type as VehicleType FROM tblvehicle tb LEFT JOIN tblgpsdata tpg INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date  ON tb.deviceid=tpg.DeviceId LEFT JOIN tblgpsdata tpg1 INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata where GPSPositioning='A' GROUP BY DeviceId) b1 ON tpg1.DeviceId = b1.DeviceId AND tpg1.Date = b1.Date  ON tb.deviceid=tpg1.DeviceId LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id WHERE (tb.iduser=" + req.query.idUser + " or tsd.iduser=" + req.query.idUser + ") and IsDelete=false and tb.deviceid != '' group by tb.deviceid;", function(err, rows, fields) {
//     connection.query(query, function(err, rows, fields) {
//         if (!err) {
//             res.json({ success: true, data: rows });
//         } else {
//             res.json({ success: false, data: [] });
//         }
//     })
// })

router.get('/GetAllWorkingBikeWebApp', jsonParser, function (req, res) {
  var query =
    'select t4.id,t4.iduser,t4.Name,t4.deviceid,t4.IsOnline,t4.DeviceType,t4.DeviceCompany,t4.FuelRatio,t4.FuelCapacity,t4.IsFule,t4.ShareId,t4.VehicleType,t4.CreatedDate,t4.IdGroup,t4.IdSharedGroup,t4.ExpiryDate,t4.JourneyFlag,  ' +
    "(select count(*) from tblalarm  a where a.DeviceId =t4.deviceid and IsRead=false) as 'NotificationCount' ," +
    "(SELECT COUNT(*) FROM tblserviceenhancementnotification WHERE IsRead=false and idvehicle = t4.id) as 'AlertCount' " +
    'from ' +
    "  (select tb.iduser,tb.deviceid,tb.id,tb.Name,tb.DeviceType,tb.FuelRatio,tb.FuelCapacity,tb.IsFule,tb.DeviceCompany,tvt.Type as 'VehicleType',tb.CreatedDate,tsd.id as'ShareId',tsd.JourneyFlag,tb.IsOnline,tsd.IdSharedGroup as 'IdSharedGroup',tb.IdGroup, CONVERT_TZ(tb.renewaldate,'+00:00','" +
    CurrentOffset +
    "') as ExpiryDate from tblvehicle tb " +
    '   LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle ' +
    '   LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id ' +
    '   where (tb.iduser=' +
    req.query.idUser +
    ' or tsd.iduser=' +
    req.query.idUser +
    ') and IsDelete = false ' +
    '  ) as t4 group by t4.deviceid;';
  // connection.query("SELECT tb.id,tb.iduser,tb.Name,tb.deviceid,tb.IsOnline,tb.DeviceType,tpg1.IsEngine, tpg1.Latitude,tpg1.Longitude,tpg.Datetime, tpg.Date, tpg1.Speed, tpg1.Direction, tpg1.OdoMeter,tsd.id as ShareId,tvt.Type as VehicleType,(SELECT COUNT(*) FROM tblalarm WHERE IsRead=false and DeviceId = tb.deviceid) as NotificationCount, (SELECT COUNT(*) FROM tblserviceenhancementnotification WHERE IsRead=false and idvehicle = tb.id) as AlertCount FROM tblvehicle tb LEFT JOIN tblgpsdata tpg INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date  ON tb.deviceid=tpg.DeviceId LEFT JOIN tblgpsdata tpg1 INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata where GPSPositioning='A' GROUP BY DeviceId) b1 ON tpg1.DeviceId = b1.DeviceId AND tpg1.Date = b1.Date  ON tb.deviceid=tpg1.DeviceId LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id WHERE (tb.iduser=" + req.query.idUser + " or tsd.iduser=" + req.query.idUser + ") and IsDelete=false and tb.deviceid != '' group by tb.deviceid;", function(err, rows, fields) {
  connectionbikedata.query(query, function (err, rows, fields) {
    if (!err) {
      var lstAllVehicle = [];

      function getData(i) {
        if (i < rows.length) {
          var obj = new Object();
          obj.id = rows[i].id;
          obj.iduser = rows[i].iduser;
          obj.Name = rows[i].Name;
          obj.deviceid = rows[i].deviceid;
          obj.IsOnline = rows[i].IsOnline;
          obj.DeviceType = rows[i].DeviceType;
          obj.FuelRatio = rows[i].FuelRatio;
          obj.FuelCapacity = rows[i].FuelCapacity;
          obj.IsFule = rows[i].IsFule;
          obj.DeviceCompany = rows[i].DeviceCompany;
          obj.ShareId = rows[i].ShareId;
          obj.VehicleType = rows[i].VehicleType;
          obj.ExpiryDate = rows[i].ExpiryDate;
          obj.NotificationCount = rows[i].NotificationCount;
          obj.AlertCount = rows[i].AlertCount;
          obj.IsShared = rows[i].IsShared;
          obj.IdSharedGroup = rows[i].IdSharedGroup;
          obj.IdGroup = rows[i].IdGroup;
          obj.JourneyFlag = rows[i].JourneyFlag;
          client.get(rows[i].deviceid, function (err, strgpsdata) {
            if (!err) {
              if (
                (strgpsdata != null) & (strgpsdata != '') &&
                strgpsdata != undefined
              ) {
                var objgps = JSON.parse(strgpsdata);
                obj.IsEngine = objgps.IsEngine;
                obj.Latitude = objgps.Latitude;
                obj.Longitude = objgps.Longitude;
                obj.Datetime = objgps.Datetime;
                obj.Date = objgps.Date;
                obj.Speed = objgps.Speed;
                obj.Direction = objgps.Direction;
                obj.OdoMeter = objgps.OdoMeter;
                obj.AD1 = objgps.AD1;
                obj.AD2 = objgps.AD2;
                obj.IsWiringForAntiTamper = objgps.IsWiringForAntiTamper;
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
                obj.AD1 = null;
                obj.AD2 = null;
                obj.IsWiringForAntiTamper = null;
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
              obj.AD1 = null;
              obj.AD2 = null;
              obj.IsWiringForAntiTamper = null;
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
  });
});

router.get('/DeleteBike', function (req, res) {
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
        password: decoded.password,
      },
    }).then(function (UserExist) {
      if (UserExist != null) {
        if (req.query.DeviceId != '' && req.query.DeviceId != null) {
          Vehicle.findOne({
            where: {
              deviceid: req.query.DeviceId,
              IsDelete: false,
            },
          }).then(function (response) {
            if (response) {
              response
                .updateAttributes({ IsDelete: true })
                .then(function (resUpdate) {
                  Commonfunction.DeleteVehicleRedis(req.query.DeviceId);
                  funAuditLog.CreateAuditLog(
                    'DeleteBike',
                    UserExist.username,
                    'Delete Vehicle (DevicId:' +
                      response.deviceid +
                      ' and UserId:' +
                      response.iduser +
                      ')'
                  );
                  res.json({
                    success: true,
                    message: 'Vehicle deleted successfully',
                    data: response,
                  });
                });
            } else {
              res.json(RecordNotFound);
            }
          });
        } else {
          if (req.query.BikeId != '' && req.query.BikeId != null) {
            Vehicle.destroy({ where: { id: req.query.BikeId } }).then(function (
              response
            ) {
              if (response) {
                Commonfunction.DeleteVehicleRedis(req.query.DeviceId);
                funAuditLog.CreateAuditLog(
                  'DeleteBike',
                  UserExist.username,
                  'Delete Vehicle (DevicId:' +
                    response.deviceid +
                    ' and UserId:' +
                    response.iduser +
                    ')'
                );
                res.json({
                  success: true,
                  message: 'Vehicle deleted successfully',
                  data: response,
                });
              } else {
                res.json(RecordNotFound);
              }
            });
          } else {
            res.json(RecordNotFound);
          }
        }
      } else {
        res.json(InvalidToken);
      }
    });
  } else {
    res.json(InvalidToken);
  }
});

router.get('/GetVehicleCurrentLocation', function (req, res) {
  // var Startdate = new Date();

  // var convertDate = convertdateformatForUnix(Startdate);
  // var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
  // // var unixStartdate = Startdate.getTime() / 1000;

  client.get(req.query.DeviceId, function (err, strgpsdata) {
    if (!err) {
      if (strgpsdata != null && strgpsdata != '' && strgpsdata != undefined) {
        res.json({ success: true, data: JSON.parse(strgpsdata) });
      } else {
        GetdbCurrentLocation();
      }
    } else {
      GetdbCurrentLocation();
    }
  });

  function GetdbCurrentLocation() {
    var Startdate = new Date();
    var convertDate = convertdateformatForUnix(Startdate);
    var unixStartdate =
      new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    // var unixStartdate = Startdate.getTime() / 1000;
    GPSData.findOne({
      where: {
        DeviceId: req.query.DeviceId,
        GPSPositioning: 'A',
        Date: { $lte: unixStartdate },
      },
      order: 'Date DESC',
    }).then(function (response) {
      if (response != null) {
        //Use Patch Engine
        response.IsEngine = response.IsPatchEngine;
        response.AD2 = response.AD2;
        client.set(
          req.query.DeviceId,
          JSON.stringify(response),
          function (err, replies) {}
        );
        res.json({ success: true, data: response });
      } else {
        res.json(RecordNotFound);
      }
    });
  }

  //-----------------------------------------------------

  // GPSData.findOne({
  //     where: {
  //         DeviceId: req.query.DeviceId,
  //         GPSPositioning: 'A',
  //         Date: { $lte: unixStartdate }
  //     },
  //     order: 'Date DESC'
  // }).then(function(response) {
  //     if (response != null) {
  //         res.json({ success: true, data: response });
  //     } else {
  //         res.json(RecordNotFound);
  //     }
  // })
});

router.get('/GetVehicleCurrentLocationForSharedDevice', function (req, res) {
  // var Startdate = new Date();

  // var convertDate = convertdateformatForUnix(Startdate);
  // var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
  // var unixStartdate = Startdate.getTime() / 1000;
  try {
    var url = jwt.decode(req.query.DeviceId, 'bugz');
    url = url.split(',');
    var DeviceId = url[0];
    var ShareCode = url[1];
    // var query = "Select tv.Name, tv.IsOnline, tv.iduser, tv.IsShared, tgps.* FROM tblgpsdata as tgps LEFT JOIN tblvehicle as tv ON tgps.DeviceId = tv.deviceid where tgps.DeviceId = " + DeviceId + " AND tv.ShareCode ='" + ShareCode + "' AND tgps.Date <= '" + unixStartdate + "' ORDER BY Date DESC limit 1";
    //console.log("Select tv.Name, tv.IsOnline, tv.iduser, tv.IsShared, tgps.* FROM tblgpsdata as tgps LEFT JOIN tblvehicle as tv ON tgps.DeviceId = tv.deviceid where tgps.DeviceId = " + DeviceId + " AND tv.ShareCode ='" + ShareCode + "' AND tgps.Date <= '" + unixStartdate + "' ORDER BY Date DESC limit 1")
    var query =
      'Select tv.Name, tv.IsOnline, tv.iduser, tv.IsShared From tblvehicle as tv where tv.deviceid = ' +
      DeviceId +
      " AND tv.ShareCode ='" +
      ShareCode +
      "'";
    connectionbikedata.query(query, function (err, rows, fields) {
      if (!err) {
        if (rows.length > 0) {
          var obj = new Object();
          obj.iduser = rows[0].iduser;
          obj.Name = rows[0].Name;
          obj.IsOnline = rows[0].IsOnline;
          obj.IsShared = rows[0].IsShared;
          obj.DeviceId = DeviceId;
          client.get(DeviceId, function (err, strgpsdata) {
            if (!err) {
              if (
                (strgpsdata != null) & (strgpsdata != '') &&
                strgpsdata != undefined
              ) {
                var objgps = JSON.parse(strgpsdata);
                obj.IsEngine = objgps.IsEngine;
                obj.Latitude = objgps.Latitude;
                obj.Longitude = objgps.Longitude;
                obj.Datetime = objgps.Datetime;
                obj.Date = objgps.Date;
                obj.Speed = objgps.Speed;
                obj.Direction = objgps.Direction;
                obj.OdoMeter = objgps.OdoMeter;
                obj.AD1 = objgps.AD1;
                obj.AD2 = objgps.AD2;
                obj.IsWiringForAntiTamper = objgps.IsWiringForAntiTamper;
                res.json({ success: true, data: obj });
              } else {
                res.json({ success: false, data: [] });
              }
            } else {
              res.json({ success: false, data: [] });
            }
          });
        } else {
          res.json({ success: false, data: [] });
        }
      } else {
        res.json({ success: false, data: [] });
      }
    });
  } catch (err) {
    res.json({ success: false, data: [] });
  }
});

// router.get('/GetAllGPSDate', function (req, res) {
//     var AppTimeZone = req.query.TimeZone;
//     if (AppTimeZone != null && AppTimeZone != undefined && AppTimeZone != '') {
//         var todaydata = new Date();
//         var todaydata4 = new Date();
//         // todaydata = new Date(todaydata.setMonth(todaydata.getMonth() - 4));

//         // var convertDate = convertdateformat(todaydata);
//         var unixNewDate = todaydata.getTime() / 1000;

//         todaydata4 = new Date(todaydata4.setMonth(todaydata4.getMonth() - 4));

//         // var convertDate = convertdateformat(todaydata4);
//         var unixTodaydata = todaydata4.getTime() / 1000;

//         GPSData.findAll({
//             attributes: ['Date'],
//             where: {
//                 DeviceId: req.query.DeviceId,
//                 Date: { $lte: unixNewDate, $gte: unixTodaydata }
//                 //Datetime: { $lte: new Date(), $gte: todaydata }

//             },
//             order: 'Date DESC'
//         }).then(function (response) {

//             var groups = u.groupBy(response, function (o) {

//                 return momentz.utc(o.Date * 1000).tz(AppTimeZone).format('DD-MM-YYYY')
//             });

//             var lstGroupDate = u.map(groups, function (group, date) {
//                 return {
//                     Datetime: date,
//                     Date: group[0].Date
//                 }
//             });

//             res.json(lstGroupDate);

//         })
//     } else {
//         var todaydata = new Date();

//         // var convertDate = convertdateformat(todaydata);
//         var unixNewDate = todaydata.getTime() / 1000;

//         todaydata = new Date(todaydata.setMonth(todaydata.getMonth() - 4));

//         // var convertDate = convertdateformat(todaydata);
//         var unixTodaydata = todaydata.getTime() / 1000;

//         GPSData.findAll({
//             attributes: ['Datetime', 'Date'],
//             where: {
//                 DeviceId: req.query.DeviceId,
//                 Date: { $lte: unixNewDate, $gte: unixTodaydata }
//             },
//             group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
//             order: 'Date DESC'
//         }).then(function (response) {
//             res.json(response);
//         })
//     }
// });

var GpsDate = models.tblgpsdate;
router.get('/GetAllGPSDate', function (req, res) {
  GpsDate.findAll({
    attributes: [
      [
        models.sequelize.fn('UNIX_TIMESTAMP', models.sequelize.col('GPSDate')),
        'Date',
      ],
    ],
    where: {
      DeviceId: req.query.DeviceId,
    },
    order: 'GPSDate DESC',
  }).then(function (response) {
    console.log(req.query.TimeZone);
    if (req.query.TimeZone == 'Asia/Kolkata') {
      var TodayDate = new Date();
      TodayDate.setHours(5);
      TodayDate.setMinutes(30);
      TodayDate.setSeconds(0);
    } else {
      var TodayDate = new Date();
      TodayDate.setHours(8);
      TodayDate.setMinutes(0);
      TodayDate.setSeconds(0);
    }
    var UnixTodayDate = Math.floor(TodayDate.getTime() / 1000);
    var objToday = u.filter(response, function (item) {
      if (item.dataValues.Date.toString() == UnixTodayDate.toString()) {
        return item;
      }
    });
    if (objToday.length == 0) {
      response.unshift({ Date: UnixTodayDate });
    }
    res.json(response);
  });
});

router.get('/GetAllGPSDateByDate', function (req, res) {
  var AppTimeZone = req.query.TimeZone;
  if (AppTimeZone != null && AppTimeZone != undefined && AppTimeZone != '') {
    var Startdate = req.query.StartDateTime;
    var StartUnixTime = null;
    var todaydata = new Date();
    var unixNewDate = todaydata.getTime() / 1000;

    if (Startdate == null || Startdate == '') {
      var todaydata4 = new Date();
      todaydata4 = new Date(todaydata4.setMonth(todaydata4.getMonth() - 4));
      StartUnixTime = todaydata4.getTime() / 1000;
    } else {
      var convertDate = convertdateformatForUnix(Startdate);
      StartUnixTime = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    }
    GPSData.findAll({
      attributes: ['Date'],
      where: {
        DeviceId: req.query.DeviceId,
        // Datetime: { $lte: new Date(), $gt: Startdate }
        Date: { $lte: unixNewDate, $gt: StartUnixTime },
      },
      // group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
      order: 'Date DESC',
    }).then(function (response) {
      var groups = u.groupBy(response, function (o) {
        return momentz
          .utc(o.Date * 1000)
          .tz(AppTimeZone)
          .format('DD-MM-YYYY');
      });

      var lstGroupDate = u.map(groups, function (group, date) {
        return {
          Datetime: date,
          Date: group[0].Date,
        };
      });
      res.json(lstGroupDate);
    });
  } else {
    var Startdate = req.query.StartDateTime;
    if (Startdate == null || Startdate == '') {
      Startdate = new Date();
      Startdate = new Date(Startdate.setMonth(Startdate.getMonth() - 4));
      var convertDate = convertdateformat(Startdate);
      var unixStartdata =
        new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
    }

    var todaydata = new Date();
    var convertDate = convertdateformat(todaydata);
    var unixNewDate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

    GPSData.findAll({
      attributes: ['Datetime', 'Date'],
      where: {
        DeviceId: req.query.DeviceId,
        Datetime: { $lte: unixNewDate, $gt: unixStartdata },
      },
      group: [models.sequelize.fn('date', models.sequelize.col('Datetime'))],
      order: 'Date DESC',
    }).then(function (response) {
      res.json(response);
    });
  }
});

router.get('/GetAllGPSByTimeZoneDate', function (req, res) {
  var Startdate = req.query.TodayStartDateTime;
  var Enddate = req.query.TodayEndDateTime;

  var convertDate = convertdateformatForUnix(Startdate);
  var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

  var convertDate = convertdateformatForUnix(Enddate);
  var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

  var query =
    'select Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction, DeviceId,IsPatchEngine as IsEngine, Date from tblgpsdata where deviceid=' +
    req.query.DeviceId +
    " and GPSPositioning='A' and Date >= '" +
    unixStartdate +
    "' and Date <= '" +
    unixEnddate +
    "' order by Date;";
  connectionbikedata.query(query, function (err, lstGPSData, fields) {
    res.json(lstGPSData);
  });
});

router.get('/GetAllGPSByTimeZoneDateWithV', function (req, res) {
  // console.log(req.query)
  var Startdate = req.query.TodayStartDateTime;
  var Enddate = req.query.TodayEndDateTime;

  var convertDate = convertdateformatForUnix(Startdate);
  var unixStartdate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

  var convertDate = convertdateformatForUnix(Enddate);
  var unixEnddate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;

  var query =
    "select Id,Datetime, Latitude, Longitude, GPSPositioning, Speed, Direction, DeviceId, IsPatchEngine as IsEngine, OdoMeter, Date, IsOverSpeed,AD1 from tblgpsdata where deviceid='" +
    req.query.DeviceId +
    "' and Date >= '" +
    unixStartdate +
    "' and Date <= '" +
    unixEnddate +
    "' order by Date;";
  connectionGpsData.query(query, function (err, lstGPSData, fields) {
    res.json(lstGPSData);
  });
});

function ConvertDateFormat(today, flg) {
  var year = today.getUTCFullYear();
  var month = today.getUTCMonth() + 1; // beware: January = 0; February = 1, etc.
  var day = today.getUTCDate();
  var firstdayHours = today.getUTCHours();
  var firstdayMinutes = today.getUTCMinutes();
  var firstdaySeconds = today.getUTCSeconds();

  //return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
  if (flg) {
    return (
      ('00' + year.toString()).slice(-4) +
      '-' +
      ('00' + month.toString()).slice(-2) +
      '-' +
      ('0000' + day.toString()).slice(-2) +
      ' ' +
      ('00' + firstdayHours.toString()).slice(-2) +
      ':' +
      ('00' + firstdayMinutes.toString()).slice(-2) +
      ':' +
      ('00' + firstdaySeconds.toString()).slice(-2)
    );
  } else {
    return (
      ('0000' + year.toString()).slice(-4) +
      '-' +
      ('00' + month.toString()).slice(-2) +
      '-' +
      ('00' + day.toString()).slice(-2)
    );
  }
}

router.get('/ChangeFenceByBike', function (req, res) {
  var idFence = req.query.idFence;
  var deviceId = req.query.deviceId;
  var IsFenceOnline = req.query.IsFenceOnline;

  Fence.findOne({
    where: {
      id: idFence,
    },
  }).then(function (response) {
    if (response) {
      response
        .updateAttributes({ IsFenceOnline: IsFenceOnline })
        .then(function (resUpdate) {
          var desc = 'Fence Status = ' + IsFenceOnline;
          Commonfunction.UpdateVehicleRedis(deviceId, 'Fence');
          res.json({
            success: true,
            message: 'Fence Setting saved successfully.',
            data: IsFenceOnline,
          });
        });
    } else {
      res.json({
        success: false,
        message: 'Fence Setting not saved successfully. Try after 5 minute.',
      });
    }
  });
});

function convertdateformatForUnix(date1) {
  var date = new Date(date1);
  var firstdayMonth = date.getMonth() + 1;
  var firstdayDay = date.getDate();
  var firstdayYear = date.getFullYear();
  var firstdayHours = date.getHours();
  var firstdayMinutes = date.getMinutes();
  var firstdaySeconds = date.getSeconds();

  return (
    ('00' + firstdayYear.toString()).slice(-4) +
    '-' +
    ('00' + firstdayMonth.toString()).slice(-2) +
    '-' +
    ('0000' + firstdayDay.toString()).slice(-2) +
    ' ' +
    ('00' + firstdayHours.toString()).slice(-2) +
    ':' +
    ('00' + firstdayMinutes.toString()).slice(-2) +
    ':' +
    ('00' + firstdaySeconds.toString()).slice(-2)
  );
}

function changeSharedId(VehicleUserId, SharedUserId, DeviceId, callback) {
  // console.log(VehicleUserId, " == ", SharedUserId, "=", DeviceId);

  var query =
    'update tblsharedevice set idSharedUser=' +
    VehicleUserId +
    ' where idSharedUser=' +
    SharedUserId +
    " and DeviceId='" +
    DeviceId +
    "'";
  connectionbikedata.query(query, function (err, response) {
    // console.log(err)
    if (!err && response) {
      SharedDevice.destroy({
        where: { idSharedUser: VehicleUserId, iduser: VehicleUserId },
      }).then(function (SharedDeviceDeleted) {
        return callback({
          success: true,
          message: 'Vehicle Shared User remove successfully..',
        });
      });
    }
  });
}

var LicenceManager = models.tbllicencemanager;
global.checkLicence = checkLicence;
global.checkDeviceAgentorDistributer = checkDeviceAgentorDistributer;
// function checkLicence(objVehicle, callback) {
//     // console.log("deviceid.....")
//     LicenceManager.findOne({ where: { DeviceId: objVehicle.deviceid, IdUser: objVehicle.iduser, IsDeleted: 0 } }).then(function(LicenceNoExist) {
//         if (LicenceNoExist) {
//             LicenceNoExist.updateAttributes({
//                 IdUser: objVehicle.iduser,
//                 // DeviceId: objVehicle.deviceid,
//                 ModifiedDate: new Date(),
//             }).then(function(response) {
//                 return callback({
//                     success: true,
//                     data: LicenceNoExist
//                 });
//             })
//         } else {
//             return callback({
//                 success: false,
//             });
//         }
//     })
// }

function checkLicence(objVehicle, username, callback) {
  checkDeviceAgentorDistributer(
    objVehicle.deviceid,
    function (checkAgentDistributerres) {
      if (checkAgentDistributerres.success == true) {
        var query =
          "select tblappinfo.*,tblgpsdevice.Company as DeviceCompany from tblappinfo inner join tblgpsdevice on tblappinfo.AppName=tblgpsdevice.AppName where tblgpsdevice.DeviceId='" +
          objVehicle.deviceid +
          "'";
        connectionbikedata.query(query, function (err, DeviceExist) {
          if (DeviceExist) {
            LicenceManager.findOne({
              where: {
                DeviceId: objVehicle.deviceid,
                IsDeleted: 0,
                idApp: DeviceExist[0].Id,
              },
            }).then(function (LicenceAssined) {
              if (LicenceAssined) {
                return callback({
                  success: true,
                  data: LicenceAssined,
                });
              } else {
                if (DeviceExist[0].DeviceCompany == 'ITCD') {
                  LicenceManager.findOne({
                    where: {
                      DeviceId: { $eq: null },
                      IsDeleted: 0,
                      idApp: DeviceExist[0].Id,
                      LicenceRenewalType: 'Monthly',
                      // LicenceType: DeviceExist[0].LicenceType,
                    },
                    order: 'Id asc',
                  }).then(function (LicenceNoExist) {
                    if (LicenceNoExist) {
                      if (LicenceNoExist.LicenceRenewalType == 'Monthly') {
                        AddMonth = 1;
                      } else if (
                        LicenceNoExist.LicenceRenewalType == 'Quarterly'
                      ) {
                        AddMonth = 3;
                      } else if (
                        LicenceNoExist.LicenceRenewalType == 'Yearly'
                      ) {
                        AddMonth = 12;
                      }
                      var date = new Date();
                      var updatedDate = convertdateformatLicenceExpiry(
                        date.setMonth(date.getMonth() + AddMonth),
                        3
                      );
                      LicenceNoExist.updateAttributes({
                        // IdUser: objVehicle.iduser,
                        DeviceId: objVehicle.deviceid,
                        // ModifiedDate: new Date(),
                        CreatedDate: new Date(),
                        ExpiryDate: updatedDate,
                        // LicenceRenewalType: DeviceExist[0].LicenceRenewalType,
                        // LicenceType: DeviceExist[0].LicenceType,
                      }).then(function (response) {
                        funAuditLogLicence.CreateAuditLogLicence(
                          'Assign Licence',
                          LicenceNoExist.LicenceNo,
                          response.DeviceId,
                          response.ExpiryDate,
                          null,
                          username,
                          'Assign through create vehicle or activate device'
                        );
                        return callback({
                          success: true,
                          data: LicenceNoExist,
                        });
                      });
                    } else {
                      return callback({
                        success: false,
                        message:
                          'No more Licence available to assign Device. Please contact administrator',
                        data: null,
                      });
                    }
                  });
                } else {
                  LicenceManager.findOne({
                    where: {
                      DeviceId: { $eq: null },
                      IsDeleted: 0,
                      idApp: DeviceExist[0].Id,
                      // LicenceRenewalType: DeviceExist[0].LicenceRenewalType,
                      // LicenceType: DeviceExist[0].LicenceType,
                    },
                    order: 'Id asc',
                  }).then(function (LicenceNoExist) {
                    if (LicenceNoExist) {
                      if (DeviceExist[0].LicenceRenewalType == 'Monthly') {
                        AddMonth = 1;
                      } else if (
                        DeviceExist[0].LicenceRenewalType == 'Quarterly'
                      ) {
                        AddMonth = 3;
                      } else if (
                        DeviceExist[0].LicenceRenewalType == 'Yearly'
                      ) {
                        AddMonth = 12;
                      }
                      var date = new Date();
                      var updatedDate = convertdateformatLicenceExpiry(
                        date.setMonth(date.getMonth() + AddMonth),
                        3
                      );
                      LicenceNoExist.updateAttributes({
                        // IdUser: objVehicle.iduser,
                        DeviceId: objVehicle.deviceid,
                        // ModifiedDate: new Date(),
                        CreatedDate: new Date(),
                        ExpiryDate: updatedDate,
                        // LicenceRenewalType: DeviceExist[0].LicenceRenewalType,
                        // LicenceType: DeviceExist[0].LicenceType,
                      }).then(function (response) {
                        funAuditLogLicence.CreateAuditLogLicence(
                          'Assign Licence',
                          LicenceNoExist.LicenceNo,
                          response.DeviceId,
                          response.ExpiryDate,
                          null,
                          username,
                          'Assign through create vehicle or activate device'
                        );
                        return callback({
                          success: true,
                          data: LicenceNoExist,
                        });
                      });
                    } else {
                      return callback({
                        success: false,
                        message:
                          'No more Licence available to assign Device. Please contact administrator',
                        data: null,
                      });
                    }
                  });
                }
              }
            });
          } else {
            return callback({
              success: false,
              message: 'Invalid Tracker No., Please insert valid Tracker No.',
              data: null,
            });
          }
        });
      } else {
        return callback(checkAgentDistributerres);
      }
    }
  );
}
var DeviceAgentRetailer = models.tbldeviceagentretailer;
function checkDeviceAgentorDistributer(deviceId, callback) {
  DeviceAgentRetailer.findOne({ where: { deviceId: deviceId } }).then(function (
    response
  ) {
    if (response) {
      return callback({
        success: true,
        message: 'Agent or Distribute assign to this device',
        data: null,
      });
    } else {
      return callback({
        success: false,
        message: 'Contact Admin Error : 1001',
        data: null,
      });
    }
  });
}

function checkGroup(objVehicle, callback) {
  // console.log("deviceid.....")
  // console.log(objVehicle)
  if (objVehicle.IdGroup != null) {
    VehicleGroup.findOne({
      where: { Id: objVehicle.IdGroup, IdUser: objVehicle.iduser },
    }).then(function (objvehicleGroup) {
      if (objvehicleGroup) {
        return callback({
          success: true,
        });
      } else {
        return callback({
          success: false,
        });
      }
    });
  } else {
    return callback({
      success: true,
    });
  }
}

function AssignLicenceNumber(objVehicle, UserName, callback) {
  LicenceManager.findOne({
    where: { DeviceId: objVehicle.deviceid, IsDeleted: 0 },
  }).then(function (LicenceNoExist) {
    if (LicenceNoExist) {
      LicenceNoExist.updateAttributes({
        IdUser: objVehicle.iduser,
        DeviceId: objVehicle.deviceid,
        // ExpiryDate: ,
        ModifiedDate: new Date(),
      }).then(function (response) {
        funAuditLog.CreateAuditLog(
          'Update Licence device (' + LicenceNoExist.LicenceNo + ')',
          UserName,
          'update Device (' +
            objVehicle.deviceid +
            ') to (' +
            objVehicle.deviceid +
            ')'
        );
        return callback({
          success: true,
          data: response,
        });
      });
    } else {
      LicenceManager.findOne({
        where: { DeviceId: { $eq: null }, IsDeleted: 0 },
      }).then(function (NewLicence) {
        var ExpiryDate = new Date();
        ExpiryDate.setFullYear(ExpiryDate.getFullYear() + 1);
        NewLicence.updateAttributes({
          IdUser: objVehicle.iduser,
          DeviceId: objVehicle.deviceid,
          ExpiryDate: ExpiryDate,
          CreatedDate: new Date(),
        }).then(function (response) {
          funAuditLog.CreateAuditLog(
            'Assign device Licence (' + NewLicence.LicenceNo + ')',
            UserName,
            'Assign Licence to (' + objVehicle.deviceid + ')'
          );
          return callback({
            success: true,
            data: response,
          });
        });
      });
    }
  });
}

// function SendLicenceAssignMail(DeviceId) {
//     var query = "Select tu.idApp,tu.username,ta.AppName,tu.email,tl.DeviceId,tl.LicenceNo from tbllicencemanager tl inner join tblvehicle as tv on tl.DeviceId= tv.deviceid inner join tbluserinformation as tu on tv.iduser = tu.id inner join tblappinfo ta on ta.Id=tu.idApp where tl.DeviceId='" + DeviceId + "'";
//     connection.query(query, function(err, resdata, fields) {
//         if (!err && resdata[0]) {
//             var resdata = resdata[0];
//             SystemEmail.findOne({ where: { IdApp: parseInt(resdata.idApp) } }).then(function(objSystemEmail) {
//                 EmailTemplate.findOne({
//                     where: {
//                         Type: "Assign Licence",
//                     }
//                 }).then(function(objEmailTemplate) {
//                     if (objEmailTemplate != null) {
//                         var Name = resdata.username;
//                         Setting.findOne({
//                             where: {
//                                 Name: 'NotificationEmailTo'
//                             }
//                         }).then(function(objSetting) {
//                             console.log("Email....", resdata.email)
//                             var body = objEmailTemplate.EmailBody.replace(/{UserName}/g, Name).replace(/{DeviceId}/g, resdata.DeviceId).replace(/{AppName}/g, resdata.AppName).replace("{LicenceNo}", resdata.LicenceNo);
//                             var mail = {
//                                 from: objSystemEmail.DefaultEmailFrom,
//                                 to: 'leekellym890@gmail.com', //resdata.email,
//                                 // bcc: objSetting.Value,
//                                 // bcc: 'soham.patel1@bugzstudio.com',
//                                 subject: resdata.AppName + " " + objEmailTemplate.EmailSubject,
//                                 html: body
//                             };
//                             SetsmtpConfig(objSystemEmail, mail, function(EmailSettingCreated) {
//                                 // console.log("##########", EmailSettingCreated)
//                             })
//                         })
//                     } else {

//                     }
//                 });
//             })
//         }
//     })

// }
// SendLicenceAssignMail(44445555555555)
router.get('/SaveVehicleold', jsonParser, function (req, res) {
  objVehicle = req.query;
  objVehicle.IsDelete = false;
  objHeader = req.headers;
  var token = getToken(objHeader);
  var search = {};
  var ExpiryDate = null;
  var ActivationDate = null;
  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var c = new Date(year + 1, month, day);
  ExpiryDate = c;
  ActivationDate = d;
  search['$and'] = [];
  if (
    objVehicle.AppName != null &&
    objVehicle.AppName != undefined &&
    objVehicle.AppName != ''
  ) {
    var obj = new Object();
    obj['AppName'] = {
      $eq: objVehicle.AppName,
    };
    search['$and'].push(obj);
  }

  if (
    objVehicle.IMEI != null &&
    objVehicle.IMEI != undefined &&
    objVehicle.IMEI != ''
  ) {
    var obj = new Object();
    obj['IMEI'] = {
      $eq: objVehicle.IMEI,
    };
    search['$and'].push(obj);
  }

  if (token) {
    var decoded = jwt.decode(token, TokenKey);

    User.findOne({
      where: {
        username: decoded.username,
        password: decoded.password,
      },
    }).then(function (UserExist) {
      if (UserExist != null) {
        if (objVehicle.IMEI != '' && objVehicle.IMEI != null) {
          GpsDevice.findOne({
            where: search,
          }).then(function (objGpsDevice) {
            if (objGpsDevice != null) {
              if (objVehicle.id == 0) {
                objVehicle.IsOnline = false;
                // objVehicle.CreatedDate = GetCurrentDate();
                objVehicle.CreatedDate = new Date();
                objVehicle.DeviceType = objGpsDevice.Type;
                Vehicle.findOne({
                  where: {
                    deviceid: objVehicle.deviceid,
                    IsDelete: true,
                  },
                }).then(function (objVehicleExist) {
                  if (objVehicleExist) {
                    objVehicle.id = objVehicleExist.id;
                    Vehicle.update(objVehicle, {
                      where: {
                        id: objVehicle.id,
                      },
                    }).then(function (response) {
                      if (response[0]) {
                        funAuditLog.CreateAuditLog(
                          'Update Vehicle',
                          UserExist.username,
                          'UpdateVehicle(IMEI:' +
                            objVehicle.IMEI +
                            ' , UserId : ' +
                            objVehicle.iduser +
                            ')'
                        );
                        // GpsDevice.findOne({ where: { DeviceId: objVehicle.deviceid } }).then(function(GpsDataExist) {
                        //         if (GpsDataExist) {
                        //             funAuditLog.CreateAuditLog('SaveDate', UserExist.username, 'Save Vehicle Expiry & Activation Date');
                        //             GpsDataExist.updateAttributes({
                        //                 IsActive: 1,
                        //                 ExpiryDate: ExpiryDate,
                        //                 ActivationDate: ActivationDate,
                        //             }).then(function(response1) {

                        //             })
                        //         }
                        //     })
                        // if (objGpsDevice.AppName == 'Maark') {
                        // CreateOrderServiceGlobal(UserExist.country, UserExist.id, objVehicle.deviceid, UserExist.username, UserExist.idApp, function(orderresponse) {
                        changeSharedId(
                          objVehicle.iduser,
                          objVehicleExist.iduser,
                          objVehicle.deviceid,
                          function (shareuserupdate) {
                            // console.log("0....1...................................", shareuserupdate)
                            Commonfunction.UpdateVehicleRedis(
                              objVehicle.deviceid,
                              'Vehicle'
                            );
                            res.json({
                              success: true,
                              message: 'Vehicle created successfully...',
                              data: objVehicle,
                            });
                          }
                        );

                        // })
                        // } else {
                        //     res.json({
                        //         success: true,
                        //         message: "Vehicle created successfully...",
                        //         data: objVehicle
                        //     });
                        // }
                      } else {
                        res.json({
                          success: false,
                          message: 'Vehicle is Not created...',
                          data: objVehicle,
                        });
                      }
                    });
                  } else {
                    Vehicle.findOne({
                      where: {
                        deviceid: objVehicle.deviceid,
                        IsDelete: false,
                      },
                    }).then(function (objNewPetExist) {
                      if (objNewPetExist) {
                        res.json({
                          success: false,
                          message:
                            'Tracker No. is already assign to other Vehicle...',
                          data: null,
                        });
                      } else {
                        objVehicle.renewaldate = ExpiryDate;
                        Vehicle.create(objVehicle).then(function (response) {
                          if (response) {
                            Commonfunction.updateSIMStartDate(
                              objVehicle.deviceid
                            );
                            Commonfunction.UpdateVehicleRedis(
                              objVehicle.deviceid
                            );
                            funAuditLog.CreateAuditLog(
                              'Create Vehicle',
                              UserExist.username,
                              'SaveVehicle(IMEI:' +
                                objVehicle.IMEI +
                                ' , UserId : ' +
                                objVehicle.iduser +
                                ')'
                            );

                            // GpsDevice.findOne({ where: { DeviceId: response.deviceid } }).then(function(GpsDataExist) {
                            //     if (GpsDataExist) {
                            //         funAuditLog.CreateAuditLog('SaveDate', UserExist.username, 'Save Vehicle Expiry & Activation Date');

                            //         // var ExpiryDate = null;
                            //         // var ActivationDate = null;
                            //         // var d = new Date();
                            //         // var year = d.getFullYear();
                            //         // var month = d.getMonth();
                            //         // var day = d.getDate();
                            //         // var c = new Date(year + 1, month, day)
                            //         // ExpiryDate = c;
                            //         // ActivationDate = d;
                            //         GpsDataExist.updateAttributes({
                            //             IsActive: 1,
                            //             ExpiryDate: ExpiryDate,
                            //             ActivationDate: ActivationDate,
                            //         }).then(function(response1) {

                            //         })
                            //     }
                            // })

                            //Insert DeviceId to Acc Value set table (if country !=Cambodia)
                            if (
                              objGpsDevice.CountryId != 30 &&
                              objVehicle.DeviceType == 'MT05'
                            ) {
                              var CurrentDate = GetCurrentDate();
                              var query =
                                "INSERT INTO tbldeviceaccvalueset (DeviceId,CreatedDate ) VALUES ('" +
                                objVehicle.deviceid +
                                "', '" +
                                CurrentDate +
                                "');";
                              connectionbikedata.query(
                                query,
                                function (err, rows, fields) {}
                              );
                            }

                            // if (objGpsDevice.AppName == 'Maark') {
                            // CreateOrderServiceGlobal(UserExist.country, UserExist.id, objVehicle.deviceid, UserExist.username, UserExist.idApp, function(orderresponse) {
                            res.json({
                              success: true,
                              message: 'Vehicle created successfully...',
                              data: objVehicle,
                            });
                            // })
                            // } else {
                            //     res.json({
                            //         success: true,
                            //         message: "Vehicle created successfully...",
                            //         data: objVehicle
                            //     });
                            // }
                          } else {
                            res.json({
                              success: false,
                              message:
                                'Tracker No. is already assign to other Vehicle...',
                              data: null,
                            });
                          }
                        });
                      }
                    });
                  }
                });
              } else {
                Vehicle.findOne({
                  where: {
                    deviceid: objVehicle.deviceid,
                  },
                }).then(function (objVehicleExist) {
                  if (
                    objVehicleExist != null &&
                    objVehicleExist.id != objVehicle.id &&
                    objVehicleExist.IsDeleted == false
                  ) {
                    res.json({
                      success: false,
                      message:
                        'Tracker No. is already assign to other Vehicle...',
                      data: objVehicleExist,
                    });
                  } else {
                    Vehicle.update(objVehicle, {
                      where: {
                        id: objVehicle.id,
                      },
                    }).then(function (response) {
                      if (response[0]) {
                        funAuditLog.CreateAuditLog(
                          'Update Vehicle',
                          UserExist.username,
                          'UpdateVehicle(IMEI:' +
                            objVehicle.IMEI +
                            ' , UserId : ' +
                            objVehicle.iduser +
                            ')'
                        );
                        changeSharedId(
                          objVehicle.iduser,
                          objVehicleExist.iduser,
                          objVehicle.deviceid,
                          function (shareuserupdate) {
                            // console.log("1...2................................", shareuserupdate)
                            Commonfunction.UpdateVehicleRedis(
                              objVehicle.deviceid,
                              'Vehicle'
                            );
                            res.json({
                              success: true,
                              message: 'Vehicle updated successfully...',
                              data: objVehicle,
                            });
                          }
                        );
                      } else {
                        res.json({
                          success: false,
                          message: 'Vehicle is Not updated...',
                          data: objVehicle,
                        });
                      }
                    });
                  }
                });
              }
            } else {
              res.json({
                success: false,
                message: 'Invalid Tracker No., Please insert valid Tracker No.',
                data: '',
              });
            }
          });
        } else {
          GpsDevice.findOne({
            where: {
              AppName: objVehicle.AppName,
              DeviceId: objVehicle.deviceid,
            },
          }).then(function (objGpsDevice) {
            if (objGpsDevice != null) {
              if (objVehicle.id == 0) {
                objVehicle.IsOnline = false;
                // objVehicle.CreatedDate = GetCurrentDate();
                objVehicle.CreatedDate = new Date();
                objVehicle.DeviceType = objGpsDevice.Type;
                Vehicle.findOne({
                  where: {
                    deviceid: objVehicle.deviceid,
                    IsDelete: true,
                  },
                }).then(function (objVehicleExist) {
                  if (objVehicleExist) {
                    objVehicle.id = objVehicleExist.id;
                    Vehicle.update(objVehicle, {
                      where: {
                        id: objVehicle.id,
                      },
                    }).then(function (response) {
                      if (response[0]) {
                        funAuditLog.CreateAuditLog(
                          'Update Vehicle',
                          UserExist.username,
                          'UpdateVehicle(IMEI:' +
                            objVehicle.IMEI +
                            ' , UserId : ' +
                            objVehicle.iduser +
                            ')'
                        );
                        // console.log("***********")
                        // console.log("country...........", UserExist.country)
                        // console.log("id................", UserExist.id)
                        // console.log("username..........", UserExist.username)
                        // console.log("deviceid..........", objVehicle.deviceid)
                        // CreateOrderServiceGlobal(UserExist.country, UserExist.id, objVehicle.deviceid, UserExist.username, function(orderresponse) {
                        //     res.json({
                        //         success: true,
                        //         message: "Vehicle created successfully...",
                        //         data: objVehicle
                        //     });
                        // })
                        // if (objGpsDevice.AppName == 'Maark') {
                        // CreateOrderServiceGlobal(UserExist.country, UserExist.id, objVehicle.deviceid, UserExist.username, UserExist.idApp, function(orderresponse) {
                        changeSharedId(
                          objVehicle.iduser,
                          objVehicleExist.iduser,
                          objVehicle.deviceid,
                          function (shareuserupdate) {
                            // console.log("1...2.......3.........................", shareuserupdate)
                            Commonfunction.UpdateVehicleRedis(
                              objVehicle.deviceid,
                              'Vehicle'
                            );
                            res.json({
                              success: true,
                              message: 'Vehicle created successfully...',
                              data: objVehicle,
                            });
                          }
                        );

                        // })
                        // } else {
                        //     res.json({
                        //         success: true,
                        //         message: "Vehicle created successfully...",
                        //         data: objVehicle
                        //     });
                        // }
                      } else {
                        res.json({
                          success: false,
                          message: 'Vehicle is Not created...',
                          data: objVehicle,
                        });
                      }
                    });
                  } else {
                    Vehicle.findOne({
                      where: {
                        deviceid: objVehicle.deviceid,
                        IsDelete: false,
                      },
                    }).then(function (objNewPetExist) {
                      if (objNewPetExist) {
                        res.json({
                          success: false,
                          message:
                            'Tracker No. is already assign to other Vehicle...',
                          data: null,
                        });
                      } else {
                        objVehicle.renewaldate = ExpiryDate;
                        Vehicle.create(objVehicle).then(function (response) {
                          if (response) {
                            Commonfunction.updateSIMStartDate(
                              objVehicle.deviceid
                            );
                            Commonfunction.UpdateVehicleRedis(
                              objVehicle.deviceid
                            );
                            funAuditLog.CreateAuditLog(
                              'Create Vehicle',
                              UserExist.username,
                              'SaveVehicle(IMEI:' +
                                objVehicle.IMEI +
                                ' , UserId : ' +
                                objVehicle.iduser +
                                ')'
                            );

                            //Insert DeviceId to Acc Value set table (if country !=Cambodia)
                            if (
                              objGpsDevice.CountryId != 30 &&
                              objVehicle.DeviceType == 'MT05'
                            ) {
                              var CurrentDate = GetCurrentDate();
                              var query =
                                "INSERT INTO tbldeviceaccvalueset (DeviceId,CreatedDate ) VALUES ('" +
                                objVehicle.deviceid +
                                "', '" +
                                CurrentDate +
                                "');";
                              connectionbikedata.query(
                                query,
                                function (err, rows, fields) {}
                              );
                            }
                            // console.log("***********")
                            // console.log("country...........", UserExist.country)
                            // console.log("id................", UserExist.id)
                            // console.log("username..........", UserExist.username)
                            // console.log("deviceid..........", objVehicle.deviceid)
                            // CreateOrderServiceGlobal(UserExist.country, UserExist.id, objVehicle.deviceid, UserExist.username, function(orderresponse) {
                            //     res.json({
                            //         success: true,
                            //         message: "Vehicle created successfully...",
                            //         data: response
                            //     });
                            // })
                            // if (objGpsDevice.AppName == 'Maark') {

                            // CreateOrderServiceGlobal(UserExist.country, UserExist.id, objVehicle.deviceid, UserExist.username, UserExist.idApp, function(orderresponse) {
                            res.json({
                              success: true,
                              message: 'Vehicle created successfully...',
                              data: objVehicle,
                            });
                            // })
                            // } else {
                            //     res.json({
                            //         success: true,
                            //         message: "Vehicle created successfully...",
                            //         data: objVehicle
                            //     });
                            // }
                          } else {
                            res.json({
                              success: false,
                              message:
                                'Tracker No. is already assign to other Vehicle...',
                              data: null,
                            });
                          }
                        });
                      }
                    });
                  }
                });
              } else {
                Vehicle.findOne({
                  where: {
                    deviceid: objVehicle.deviceid,
                  },
                }).then(function (objVehicleExist) {
                  if (
                    objVehicleExist != null &&
                    objVehicleExist.id != objVehicle.id &&
                    objVehicleExist.IsDeleted == false
                  ) {
                    res.json({
                      success: false,
                      message:
                        'Tracker No. is already assign to other Vehicle...',
                      data: objVehicleExist,
                    });
                  } else {
                    Vehicle.update(objVehicle, {
                      where: {
                        id: objVehicle.id,
                      },
                    }).then(function (response) {
                      if (response[0]) {
                        funAuditLog.CreateAuditLog(
                          'Update Vehicle',
                          UserExist.username,
                          'UpdateVehicle(IMEI:' +
                            objVehicle.IMEI +
                            ' , UserId : ' +
                            objVehicle.iduser +
                            ')'
                        );
                        changeSharedId(
                          objVehicle.iduser,
                          objVehicleExist.iduser,
                          objVehicle.deviceid,
                          function (shareuserupdate) {
                            // console.log("1...2.......3........4.................", shareuserupdate)
                            Commonfunction.UpdateVehicleRedis(
                              objVehicle.deviceid,
                              'Vehicle'
                            );
                            res.json({
                              success: true,
                              message: 'Vehicle updated successfully...',
                              data: objVehicle,
                            });
                          }
                        );
                      } else {
                        res.json({
                          success: false,
                          message: 'Vehicle is Not updated...',
                          data: objVehicle,
                        });
                      }
                    });
                  }
                });
              }
            } else {
              res.json({
                success: false,
                message: 'Invalid Tracker No., Please insert valid Tracker No.',
                data: '',
              });
            }
          });
        }
      } else {
        res.json(InvalidToken);
      }
    });
  } else {
    res.json(InvalidToken);
  }
});

router.get('/SaveVehicle', jsonParser, function (req, res) {
  // [2022-06-24 @ Dino] If deviceid starts with 17 then append 0 to fix Beidou devices
  if (req.query.deviceid.startsWith('17')) {
    req.query.deviceid = '0' + req.query.deviceid;
  }

  objVehicle = req.query;
  objVehicle.IsDelete = false;
  objHeader = req.headers;

  var token = getToken(objHeader);
  var search = {};
  var ExpiryDate = null;
  var ActivationDate = null;
  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var c = new Date(year + 1, month, day);
  ExpiryDate = c;
  ActivationDate = d;
  search['$and'] = [];
  if (
    objVehicle.AppName != null &&
    objVehicle.AppName != undefined &&
    objVehicle.AppName != ''
  ) {
    var obj = new Object();
    obj['AppName'] = {
      $eq: objVehicle.AppName,
    };
    search['$and'].push(obj);
  }

  if (
    objVehicle.IMEI != null &&
    objVehicle.IMEI != undefined &&
    objVehicle.IMEI != ''
  ) {
    var obj = new Object();
    obj['IMEI'] = {
      $eq: objVehicle.IMEI,
    };
    search['$and'].push(obj);
  }

  if (token) {
    var decoded = jwt.decode(token, TokenKey);

    User.findOne({
      where: {
        username: decoded.username,
        password: decoded.password,
      },
    }).then(function (UserExist) {
      if (UserExist != null) {
        objVehicle.IsOnline = false;
        client.get(objVehicle.deviceid + 'Online', function (err, response) {
          if (!err) {
            if (response != null && response != '' && response != undefined) {
              if (response == 'true') {
                objVehicle.IsOnline = response;
              }
            }
          }
          VehicleType.findOne({ where: { Type: 'car' } }).then(function (
            VehicleTypeExits
          ) {
            var idType = 1;
            if (VehicleTypeExits) {
              idType = VehicleTypeExits.id;
            }

            if (
              objVehicle.AppName == 'HC CARGO' &&
              (objVehicle.idType == null ||
                objVehicle.idType == undefined ||
                objVehicle.idType == '' ||
                objVehicle.idType == 0)
            ) {
              objVehicle.idType = idType;
            }

            if (objVehicle.IMEI != '' && objVehicle.IMEI != null) {
              GpsDevice.findOne({
                where: search,
              }).then(function (objGpsDevice) {
                if (objGpsDevice != null) {
                  if (
                    objGpsDevice.Status === 'Spoil' ||
                    objGpsDevice.Status === 'Terminate'
                  ) {
                    return res.json({
                      success: false,
                      message: 'Please contact admin. Device error: 1002',
                    });
                  }

                  objVehicle.DeviceType = objGpsDevice.Type;
                  objVehicle.DeviceCompany = objGpsDevice.Company;
                  if (
                    objGpsDevice.AppName == 'Tracking' ||
                    objGpsDevice.Company == 'Beiduo'
                  ) {
                    objVehicle.deviceid = objVehicle.IMEI;
                  }
                  if (objVehicle.id == 0) {
                    // objVehicle.IsOnline = false;
                    // objVehicle.CreatedDate = GetCurrentDate();
                    objVehicle.CreatedDate = new Date();

                    Vehicle.findOne({
                      where: {
                        deviceid: objVehicle.deviceid,
                        IsDelete: true,
                      },
                    }).then(function (objVehicleExist) {
                      if (objVehicleExist) {
                        objVehicle.id = objVehicleExist.id;
                        checkLicence(
                          objVehicle,
                          UserExist.username,
                          function (LicenceNores) {
                            if (LicenceNores.success == true) {
                              objVehicle.renewaldate =
                                LicenceNores.data.ExpiryDate;
                              Vehicle.update(objVehicle, {
                                where: {
                                  id: objVehicle.id,
                                },
                              }).then(function (response) {
                                if (response[0]) {
                                  funAuditLog.CreateAuditLog(
                                    'Update Vehicle',
                                    UserExist.username,
                                    'SaveVehicle(IMEI:' +
                                      objVehicle.IMEI +
                                      ' , UserId : ' +
                                      objVehicle.iduser +
                                      ')'
                                  );
                                  // GpsDevice.findOne({ where: { DeviceId: objVehicle.deviceid } }).then(function(GpsDataExist) {
                                  //     if (GpsDataExist) {
                                  //         funAuditLog.CreateAuditLog('SaveDate', UserExist.username, 'Save Vehicle Expiry & Activation Date');
                                  //         GpsDataExist.updateAttributes({
                                  //             IsActive: 1,
                                  //             ExpiryDate: ExpiryDate,
                                  //             ActivationDate: ActivationDate,
                                  //         }).then(function(response1) {

                                  //         })
                                  //     }
                                  // })

                                  changeSharedId(
                                    objVehicle.iduser,
                                    objVehicleExist.iduser,
                                    objVehicle.deviceid,
                                    function (shareuserupdate) {
                                      if (objGpsDevice.AppName == 'Tracking') {
                                        shareVehicleTosysreportUser(
                                          objVehicle.deviceid
                                        );
                                      }
                                      Commonfunction.UpdateVehicleRedis(
                                        objVehicle.deviceid,
                                        'Vehicle'
                                      );
                                      res.json({
                                        success: true,
                                        message:
                                          'Vehicle created successfully...',
                                        data: objVehicle,
                                      });
                                    }
                                  );
                                } else {
                                  res.json({
                                    success: false,
                                    message: 'Vehicle is Not created...',
                                    data: objVehicle,
                                  });
                                }
                              });
                            } else {
                              res.json({
                                success: false,
                                message: LicenceNores.message,
                                data: null,
                              });
                            }
                          }
                        );
                      } else {
                        Vehicle.findOne({
                          where: {
                            deviceid: objVehicle.deviceid,
                            IsDelete: false,
                          },
                        }).then(function (objNewPetExist) {
                          if (objNewPetExist) {
                            res.json({
                              success: false,
                              message:
                                'Tracker No. is already assign to other Vehicle...',
                              data: null,
                            });
                          } else {
                            objVehicle.renewaldate = ExpiryDate;
                            checkLicence(
                              objVehicle,
                              UserExist.username,
                              function (LicenceNores) {
                                // console.log("1.2...................")
                                if (LicenceNores.success == true) {
                                  objVehicle.renewaldate =
                                    LicenceNores.data.ExpiryDate;
                                  Vehicle.create(objVehicle).then(function (
                                    response
                                  ) {
                                    if (response) {
                                      Commonfunction.updateSIMStartDate(
                                        objVehicle.deviceid
                                      );
                                      Commonfunction.UpdateVehicleRedis(
                                        objVehicle.deviceid
                                      );
                                      funAuditLog.CreateAuditLog(
                                        'Create Vehicle',
                                        UserExist.username,
                                        'SaveVehicle(IMEI:' +
                                          objVehicle.IMEI +
                                          ' , UserId : ' +
                                          objVehicle.iduser +
                                          ')'
                                      );

                                      // GpsDevice.findOne({ where: { DeviceId: response.deviceid } }).then(function(GpsDataExist) {
                                      //     if (GpsDataExist) {
                                      //         funAuditLog.CreateAuditLog('SaveDate', UserExist.username, 'Save Vehicle Expiry & Activation Date');

                                      //         GpsDataExist.updateAttributes({
                                      //             IsActive: 1,
                                      //             ExpiryDate: ExpiryDate,
                                      //             ActivationDate: ActivationDate,
                                      //         }).then(function(response1) {

                                      //         })
                                      //     }
                                      // })
                                      if (objGpsDevice.AppName == 'Tracking') {
                                        shareVehicleTosysreportUser(
                                          objVehicle.deviceid
                                        );
                                      }

                                      //Insert DeviceId to Acc Value set table (if country !=Cambodia)
                                      if (
                                        objGpsDevice.CountryId != 30 &&
                                        objVehicle.DeviceType == 'MT05'
                                      ) {
                                        var CurrentDate = GetCurrentDate();
                                        var query =
                                          "INSERT INTO tbldeviceaccvalueset (DeviceId,CreatedDate ) VALUES ('" +
                                          objVehicle.deviceid +
                                          "', '" +
                                          CurrentDate +
                                          "');";
                                        connectionbikedata.query(
                                          query,
                                          function (err, rows, fields) {}
                                        );
                                      }

                                      res.json({
                                        success: true,
                                        message:
                                          'Vehicle created successfully...',
                                        data: objVehicle,
                                      });
                                    } else {
                                      res.json({
                                        success: false,
                                        message:
                                          'Tracker No. is already assign to other Vehicle...',
                                        data: null,
                                      });
                                    }
                                  });
                                } else {
                                  res.json({
                                    success: false,
                                    message: LicenceNores.message,
                                    data: null,
                                  });
                                }
                              }
                            );
                          }
                        });
                      }
                    });
                  } else {
                    Vehicle.findOne({
                      where: {
                        deviceid: objVehicle.deviceid,
                      },
                    }).then(function (objVehicleExist) {
                      // objVehicle.IdGroup = objVehicleExist.IdGroup;
                      if (
                        objVehicleExist != null &&
                        objVehicleExist.id != objVehicle.id &&
                        objVehicleExist.IsDeleted == false
                      ) {
                        res.json({
                          success: false,
                          message:
                            'Tracker No. is already assign to other Vehicle...',
                          data: objVehicleExist,
                        });
                      } else {
                        checkLicence(
                          objVehicle,
                          UserExist.username,
                          function (LicenceNores) {
                            // console.log("1.2...3................", LicenceNores)
                            if (LicenceNores.success == true) {
                              objVehicle.renewaldate =
                                LicenceNores.data.ExpiryDate;
                              checkGroup(objVehicle, function (objcheckgroup) {
                                if (objcheckgroup.success == false) {
                                  objVehicle.IdGroup = null;
                                }
                                Vehicle.update(objVehicle, {
                                  where: {
                                    id: objVehicle.id,
                                  },
                                }).then(function (response) {
                                  if (response[0]) {
                                    Commonfunction.UpdateVehicleRedis(
                                      objVehicle.deviceid,
                                      'Vehicle'
                                    );
                                    funAuditLog.CreateAuditLog(
                                      'Update Vehicle',
                                      UserExist.username,
                                      'UpdateVehicle(IMEI:' +
                                        objVehicle.IMEI +
                                        ' , UserId : ' +
                                        objVehicle.iduser +
                                        ')'
                                    );
                                    if (objVehicleExist != null) {
                                      changeSharedId(
                                        objVehicle.iduser,
                                        objVehicleExist.iduser,
                                        objVehicle.deviceid,
                                        function (shareuserupdate) {
                                          if (
                                            objGpsDevice.AppName == 'Tracking'
                                          ) {
                                            shareVehicleTosysreportUser(
                                              objVehicle.deviceid
                                            );
                                          }
                                          Commonfunction.UpdateVehicleRedis(
                                            objVehicle.deviceid,
                                            'Vehicle'
                                          );
                                          res.json({
                                            success: true,
                                            message:
                                              'Vehicle updated successfully...',
                                            data: objVehicle,
                                          });
                                        }
                                      );
                                    } else {
                                      if (objGpsDevice.AppName == 'Tracking') {
                                        shareVehicleTosysreportUser(
                                          objVehicle.deviceid
                                        );
                                      }
                                      Commonfunction.UpdateVehicleRedis(
                                        objVehicle.deviceid,
                                        'Vehicle'
                                      );
                                      res.json({
                                        success: true,
                                        message:
                                          'Vehicle updated successfully...',
                                        data: objVehicle,
                                      });
                                    }
                                  } else {
                                    res.json({
                                      success: false,
                                      message: 'Vehicle is Not updated...',
                                      data: objVehicle,
                                    });
                                  }
                                });
                              });
                            } else {
                              res.json({
                                success: false,
                                message: LicenceNores.message,
                                data: null,
                              });
                            }
                          }
                        );
                      }
                    });
                  }
                } else {
                  res.json({
                    success: false,
                    message:
                      'Invalid Tracker No., Please insert valid Tracker No.',
                    data: '',
                  });
                }
              });
            } else {
              GpsDevice.findOne({
                where: {
                  AppName: objVehicle.AppName,
                  DeviceId: objVehicle.deviceid,
                },
              }).then(function (objGpsDevice) {
                if (objGpsDevice != null) {
                  if (
                    objGpsDevice.Status === 'Spoil' ||
                    objGpsDevice.Status === 'Terminate'
                  ) {
                    return res.json({
                      success: false,
                      message: 'Please contact admin. Device error: 1002',
                    });
                  }

                  objVehicle.DeviceType = objGpsDevice.Type;
                  objVehicle.DeviceCompany = objGpsDevice.Company;
                  if (objGpsDevice.AppName == 'Tracking') {
                    objVehicle.deviceid = objGpsDevice.IMEI;
                  }
                  if (objVehicle.id == 0) {
                    // objVehicle.IsOnline = false;
                    objVehicle.CreatedDate = new Date();

                    Vehicle.findOne({
                      where: {
                        deviceid: objVehicle.deviceid,
                        IsDelete: true,
                      },
                    }).then(function (objVehicleExist) {
                      if (objVehicleExist) {
                        objVehicle.id = objVehicleExist.id;
                        // console.log("1.2...3.....4...........")
                        checkLicence(
                          objVehicle,
                          UserExist.username,
                          function (LicenceNores) {
                            // console.log("1.2...3.....4...........", LicenceNores)
                            if (LicenceNores.success == true) {
                              objVehicle.renewaldate =
                                LicenceNores.data.ExpiryDate;
                              Vehicle.update(objVehicle, {
                                where: {
                                  id: objVehicle.id,
                                },
                              }).then(function (response) {
                                if (response[0]) {
                                  funAuditLog.CreateAuditLog(
                                    'Update Vehicle',
                                    UserExist.username,
                                    'UpdateVehicle(DeviceId:' +
                                      objVehicle.deviceid +
                                      ' , UserId : ' +
                                      objVehicle.iduser +
                                      ')'
                                  );
                                  changeSharedId(
                                    objVehicle.iduser,
                                    objVehicleExist.iduser,
                                    objVehicle.deviceid,
                                    function (shareuserupdate) {
                                      if (objGpsDevice.AppName == 'Tracking') {
                                        shareVehicleTosysreportUser(
                                          objVehicle.deviceid
                                        );
                                      }
                                      Commonfunction.UpdateVehicleRedis(
                                        objVehicle.deviceid,
                                        'Vehicle'
                                      );
                                      res.json({
                                        success: true,
                                        message:
                                          'Vehicle created successfully...',
                                        data: objVehicle,
                                      });
                                    }
                                  );
                                } else {
                                  res.json({
                                    success: false,
                                    message: 'Vehicle is Not created...',
                                    data: objVehicle,
                                  });
                                }
                              });
                            } else {
                              res.json({
                                success: false,
                                message: LicenceNores.message,
                                data: null,
                              });
                            }
                          }
                        );
                      } else {
                        Vehicle.findOne({
                          where: {
                            deviceid: objVehicle.deviceid,
                            IsDelete: false,
                          },
                        }).then(function (objNewPetExist) {
                          if (objNewPetExist) {
                            res.json({
                              success: false,
                              message:
                                'Tracker No. is already assign to other Vehicle...',
                              data: null,
                            });
                          } else {
                            objVehicle.renewaldate = ExpiryDate;
                            // console.log("1.2...3.....4......5.....")
                            checkLicence(
                              objVehicle,
                              UserExist.username,
                              function (LicenceNores) {
                                objVehicle.renewaldate =
                                  LicenceNores.data.ExpiryDate;
                                if (LicenceNores.success == true) {
                                  objVehicle.renewaldate =
                                    LicenceNoExist.ExpiryDate;
                                  Vehicle.create(objVehicle).then(function (
                                    response
                                  ) {
                                    if (response) {
                                      Commonfunction.updateSIMStartDate(
                                        objVehicle.deviceid
                                      );
                                      Commonfunction.UpdateVehicleRedis(
                                        objVehicle.deviceid
                                      );
                                      funAuditLog.CreateAuditLog(
                                        'Create Vehicle',
                                        UserExist.username,
                                        'SaveVehicle(DeviceId:' +
                                          objVehicle.deviceid +
                                          ' , UserId : ' +
                                          objVehicle.iduser +
                                          ')'
                                      );
                                      if (objGpsDevice.AppName == 'Tracking') {
                                        shareVehicleTosysreportUser(
                                          objVehicle.deviceid
                                        );
                                      }
                                      //Insert DeviceId to Acc Value set table (if country !=Cambodia)
                                      if (
                                        objGpsDevice.CountryId != 30 &&
                                        objVehicle.DeviceType == 'MT05'
                                      ) {
                                        var CurrentDate = GetCurrentDate();
                                        var query =
                                          "INSERT INTO tbldeviceaccvalueset (DeviceId,CreatedDate ) VALUES ('" +
                                          objVehicle.deviceid +
                                          "', '" +
                                          CurrentDate +
                                          "');";
                                        connectionbikedata.query(
                                          query,
                                          function (err, rows, fields) {}
                                        );
                                      }
                                      res.json({
                                        success: true,
                                        message:
                                          'Vehicle created successfully...',
                                        data: objVehicle,
                                      });
                                    } else {
                                      res.json({
                                        success: false,
                                        message:
                                          'Tracker No. is already assign to other Vehicle...',
                                        data: null,
                                      });
                                    }
                                  });
                                } else {
                                  res.json({
                                    success: false,
                                    message: LicenceNores.message,
                                    data: null,
                                  });
                                }
                              }
                            );
                          }
                        });
                      }
                    });
                  } else {
                    Vehicle.findOne({
                      where: {
                        deviceid: objVehicle.deviceid,
                      },
                    }).then(function (objVehicleExist) {
                      // objVehicle.IdGroup = objVehicleExist.IdGroup;
                      if (
                        objVehicleExist != null &&
                        objVehicleExist.id != objVehicle.id &&
                        objVehicleExist.IsDeleted == false
                      ) {
                        res.json({
                          success: false,
                          message:
                            'Tracker No. is already assign to other Vehicle...',
                          data: objVehicleExist,
                        });
                      } else {
                        checkLicence(
                          objVehicle,
                          UserExist.username,
                          function (LicenceNores) {
                            // console.log("1.2...3.....4......5....6.", LicenceNores)
                            if (LicenceNores.success == true) {
                              objVehicle.renewaldate =
                                LicenceNores.data.ExpiryDate;
                              checkGroup(objVehicle, function (objcheckgroup) {
                                if (objcheckgroup.success == false) {
                                  objVehicle.IdGroup = null;
                                }
                                Vehicle.update(objVehicle, {
                                  where: {
                                    id: objVehicle.id,
                                  },
                                }).then(function (response) {
                                  if (response[0]) {
                                    funAuditLog.CreateAuditLog(
                                      'Update Vehicle',
                                      UserExist.username,
                                      'UpdateVehicle(DeviceId:' +
                                        objVehicle.deviceid +
                                        ' , UserId : ' +
                                        objVehicle.iduser +
                                        ')'
                                    );
                                    if (objVehicleExist != null) {
                                      changeSharedId(
                                        objVehicle.iduser,
                                        objVehicleExist.iduser,
                                        objVehicle.deviceid,
                                        function (shareuserupdate) {
                                          if (
                                            objGpsDevice.AppName == 'Tracking'
                                          ) {
                                            shareVehicleTosysreportUser(
                                              objVehicle.deviceid
                                            );
                                          }
                                          Commonfunction.UpdateVehicleRedis(
                                            objVehicle.deviceid,
                                            'Vehicle'
                                          );
                                          res.json({
                                            success: true,
                                            message:
                                              'Vehicle updated successfully...',
                                            data: objVehicle,
                                          });
                                        }
                                      );
                                    } else {
                                      if (objGpsDevice.AppName == 'Tracking') {
                                        shareVehicleTosysreportUser(
                                          objVehicle.deviceid
                                        );
                                      }
                                      Commonfunction.UpdateVehicleRedis(
                                        objVehicle.deviceid,
                                        'Vehicle'
                                      );
                                      res.json({
                                        success: true,
                                        message:
                                          'Vehicle updated successfully...',
                                        data: objVehicle,
                                      });
                                    }
                                  } else {
                                    res.json({
                                      success: false,
                                      message: 'Vehicle is Not updated...',
                                      data: objVehicle,
                                    });
                                  }
                                });
                              });
                            } else {
                              res.json({
                                success: false,
                                message: LicenceNores.message,
                                data: null,
                              });
                            }
                          }
                        );
                      }
                    });
                  }
                } else {
                  res.json({
                    success: false,
                    message:
                      'Invalid Tracker No., Please insert valid Tracker No.',
                    data: '',
                  });
                }
              });
            }
          });
        });
      } else {
        res.json(InvalidToken);
      }
    });
  } else {
    res.json(InvalidToken);
  }
});

global.shareVehicleTosysreportUser = shareVehicleTosysreportUser;

function shareVehicleTosysreportUser(DeviceId) {
  var query =
    "select tu.* from tbluserinformation tu inner join tblappinfo ta on tu.idApp = ta.Id where tu.username='sysreport' and ta.AppName='Tracking'";
  connectionbikedata.query(query, function (err, rows, fields) {
    if (!err && rows) {
      var query =
        "Select * from tblvehicle tv where tv.deviceid='" +
        DeviceId +
        "' and tv.IsDelete = 0";
      connectionbikedata.query(query, function (err, objVehicle, fields) {
        if (!err && objVehicle) {
          var obj = new Object();
          obj.idSharedUser = objVehicle[0].iduser;
          obj.idUser = rows[0].id;
          obj.IsActive = 1;
          obj.idVehicle = objVehicle[0].id;
          obj.CreatedBy = 'System';
          obj.CreatedDate = new Date();
          obj.DeviceId = objVehicle[0].deviceid;
          obj.IsSharedUserNotification = 1;
          obj.IsNotification = 1;
          SharedDevice.findOne({
            where: {
              DeviceId: obj.DeviceId,
              idUser: obj.idUser,
              idSharedUser: obj.idSharedUser,
            },
          }).then(function (resExist) {
            if (resExist == null) {
              SharedDevice.create(obj).then(function (response) {
                // console.log("Share device Device........");
              });
            }
          });
        }
      });
    }
  });
}

function share(CallBack) {
  var query =
    "select tu.* from tbluserinformation tu inner join tblappinfo ta on tu.idApp = ta.Id where tu.username='sysreport' and ta.AppName='Tracking'";
  connectionbikedata.query(query, function (err, rows, fields) {
    var query =
      "select tv.* from tblvehicle tv Left join tbluserinformation tu on tv.iduser = tu.id left join tblappinfo ta on tu.idApp = ta.Id where  ta.AppName='Tracking' and tv.IsDelete=0";
    connectionbikedata.query(query, function (err, objVehicle, fields) {
      uploder(0);
      // console.log(objVehicle.length)
      function uploder(i) {
        if (i < objVehicle.length) {
          var obj = new Object();
          obj.idSharedUser = objVehicle[i].iduser;
          obj.idUser = rows[0].id;
          obj.IsActive = 1;
          obj.idVehicle = objVehicle[i].id;
          obj.CreatedBy = 'System';
          obj.CreatedDate = new Date();
          obj.DeviceId = objVehicle[i].deviceid;
          obj.IsSharedUserNotification = 1;
          obj.IsNotification = 1;
          SharedDevice.findOne({
            where: {
              DeviceId: obj.DeviceId,
              idUser: obj.idUser,
              idSharedUser: obj.idSharedUser,
            },
          }).then(function (resExist) {
            if (resExist == null) {
              SharedDevice.create(obj).then(function (response) {
                // console.log(response.DeviceId, "--", i)
                uploder(i + 1);
              });
            } else {
              // console.log("----------------", i)
              uploder(i + 1);
            }
          });
        } else {
          CallBack('Share all device to sysreport user.');
        }
      }
    });
  });
}

router.get('/OldVehicleShareForReport', function (req, res) {
  share(function (resdata) {
    res.json(resdata);
  });
});

// router.post('/SaveVehicle', jsonParser, function(req, res) {
//     objVehicle = req.body;
// router.get('/SaveVehicle', jsonParser, function(req, res) {
//     objVehicle = req.query;
//     objVehicle.IsDelete = false;
//     objHeader = req.headers;
//     var token = getToken(objHeader);
//     var search = {};
//     var ExpiryDate = null;
//     var ActivationDate = null;
//     var d = new Date();
//     var year = d.getFullYear();
//     var month = d.getMonth();
//     var day = d.getDate();
//     var c = new Date(year + 1, month, day)
//     ExpiryDate = c;
//     ActivationDate = d;
//     search['$and'] = [];
//     if (objVehicle.AppName != null && objVehicle.AppName != undefined && objVehicle.AppName != '') {
//         var obj = new Object();
//         obj['AppName'] = {
//             $eq: objVehicle.AppName
//         };
//         search['$and'].push(obj);
//     }

//     if (objVehicle.IMEI != null && objVehicle.IMEI != undefined && objVehicle.IMEI != '') {
//         var obj = new Object();
//         obj['IMEI'] = {
//             $eq: objVehicle.IMEI
//         };
//         search['$and'].push(obj);
//     }

//     if (token) {
//         var decoded = jwt.decode(token, TokenKey);

//         User.findOne({
//             where: {
//                 username: decoded.username,
//                 password: decoded.password
//             }
//         }).then(function(UserExist) {
//             if (UserExist != null) {
//                 if (objVehicle.IMEI != '' && objVehicle.IMEI != null) {
//                     GpsDevice.findOne({
//                         where: search
//                     }).then(function(objGpsDevice) {
//                         if (objGpsDevice != null) {
//                             if (objVehicle.id == 0) {
//                                 objVehicle.IsOnline = false;
//                                 // objVehicle.CreatedDate = GetCurrentDate();
//                                 objVehicle.CreatedDate = new Date();
//                                 objVehicle.DeviceType = objGpsDevice.Type;
//                                 Vehicle.findOne({
//                                     where: {
//                                         deviceid: objVehicle.deviceid,
//                                         IsDelete: true
//                                     }
//                                 }).then(function(objVehicleExist) {
//                                     if (objVehicleExist) {
//                                         objVehicle.id = objVehicleExist.id;
//                                         Vehicle.update(objVehicle, {
//                                             where: {
//                                                 id: objVehicle.id
//                                             }
//                                         }).then(function(response) {
//                                             if (response[0]) {
//                                                 funAuditLog.CreateAuditLog('SaveVehicle(IMEI:' + objVehicle.IMEI + ')', UserExist.username, 'Create Vehicle');
//                                                 GpsDevice.findOne({ where: { DeviceId: objVehicle.deviceid } }).then(function(GpsDataExist) {
//                                                     if (GpsDataExist) {
//                                                         funAuditLog.CreateAuditLog('SaveDate', UserExist.username, 'Save Vehicle Expiry & Activation Date');
//                                                         GpsDataExist.updateAttributes({
//                                                             IsActive: 1,
//                                                             ExpiryDate: ExpiryDate,
//                                                             ActivationDate: ActivationDate,
//                                                         }).then(function(response1) {

//                                                         })
//                                                     }
//                                                 })
//                                                 res.json({
//                                                     success: true,
//                                                     message: "Vehicle created successfully...",
//                                                     data: objVehicle
//                                                 });
//                                             } else {
//                                                 res.json({
//                                                     success: false,
//                                                     message: "Vehicle is Not created...",
//                                                     data: objVehicle
//                                                 });
//                                             }
//                                         })
//                                     } else {
//                                         Vehicle.findOne({
//                                             where: {
//                                                 deviceid: objVehicle.deviceid,
//                                                 IsDelete: false
//                                             }
//                                         }).then(function(objNewPetExist) {
//                                             if (objNewPetExist) {
//                                                 res.json({
//                                                     success: false,
//                                                     message: "Tracker No. is already assign to other Vehicle...",
//                                                     data: null
//                                                 });
//                                             } else {
//                                                 Vehicle.create(objVehicle).then(function(response) {
//                                                     if (response) {
//                                                         funAuditLog.CreateAuditLog('SaveVehicle(IMEI:' + objVehicle.IMEI + ')', UserExist.username, 'Create Vehicle');
//                                                         GpsDevice.findOne({ where: { DeviceId: response.deviceid } }).then(function(GpsDataExist) {
//                                                             if (GpsDataExist) {
//                                                                 funAuditLog.CreateAuditLog('SaveDate', UserExist.username, 'Save Vehicle Expiry & Activation Date');

//                                                                 // var ExpiryDate = null;
//                                                                 // var ActivationDate = null;
//                                                                 // var d = new Date();
//                                                                 // var year = d.getFullYear();
//                                                                 // var month = d.getMonth();
//                                                                 // var day = d.getDate();
//                                                                 // var c = new Date(year + 1, month, day)
//                                                                 // ExpiryDate = c;
//                                                                 // ActivationDate = d;
//                                                                 GpsDataExist.updateAttributes({
//                                                                     IsActive: 1,
//                                                                     ExpiryDate: ExpiryDate,
//                                                                     ActivationDate: ActivationDate,
//                                                                 }).then(function(response1) {

//                                                                 })
//                                                             }
//                                                         })
//                                                         res.json({
//                                                             success: true,
//                                                             message: "Vehicle created successfully...",
//                                                             data: response
//                                                         });
//                                                     } else {
//                                                         res.json({
//                                                             success: false,
//                                                             message: "Tracker No. is already assign to other Vehicle...",
//                                                             data: null
//                                                         });
//                                                     }
//                                                 })
//                                             }
//                                         })
//                                     }
//                                 })
//                             } else {
//                                 Vehicle.findOne({
//                                     where: {
//                                         deviceid: objVehicle.deviceid
//                                     }
//                                 }).then(function(objVehicleExist) {
//                                     if (objVehicleExist != null && objVehicleExist.id != objVehicle.id && objVehicleExist.IsDeleted == false) {
//                                         res.json({
//                                             success: false,
//                                             message: "Tracker No. is already assign to other Vehicle...",
//                                             data: objVehicleExist
//                                         });
//                                     } else {
//                                         Vehicle.update(objVehicle, {
//                                             where: {
//                                                 id: objVehicle.id
//                                             }
//                                         }).then(function(response) {
//                                             if (response[0]) {
//                                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Update Vehicle');
//                                                 res.json({
//                                                     success: true,
//                                                     message: "Vehicle updated successfully...",
//                                                     data: objVehicle
//                                                 });
//                                             } else {
//                                                 res.json({
//                                                     success: false,
//                                                     message: "Vehicle is Not updated...",
//                                                     data: objVehicle
//                                                 });
//                                             }
//                                         })
//                                     }
//                                 })
//                             }
//                         } else {
//                             res.json({
//                                 success: false,
//                                 message: "Invalid Tracker No., Please insert valid Tracker No.",
//                                 data: ""
//                             });
//                         }
//                     })
//                 } else {
//                     GpsDevice.findOne({
//                         where: { AppName: objVehicle.AppName, DeviceId: objVehicle.deviceid }
//                     }).then(function(objGpsDevice) {
//                         if (objGpsDevice != null) {
//                             if (objVehicle.id == 0) {
//                                 objVehicle.IsOnline = false;
//                                 // objVehicle.CreatedDate = GetCurrentDate();
//                                 objVehicle.CreatedDate = new Date();
//                                 objVehicle.DeviceType = objGpsDevice.Type;
//                                 Vehicle.findOne({
//                                     where: {
//                                         deviceid: objVehicle.deviceid,
//                                         IsDelete: true
//                                     }
//                                 }).then(function(objVehicleExist) {
//                                     if (objVehicleExist) {
//                                         objVehicle.id = objVehicleExist.id;
//                                         Vehicle.update(objVehicle, {
//                                             where: {
//                                                 id: objVehicle.id
//                                             }
//                                         }).then(function(response) {
//                                             if (response[0]) {
//                                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
//                                                 res.json({
//                                                     success: true,
//                                                     message: "Vehicle created successfully...",
//                                                     data: objVehicle
//                                                 });
//                                             } else {
//                                                 res.json({
//                                                     success: false,
//                                                     message: "Vehicle is Not created...",
//                                                     data: objVehicle
//                                                 });
//                                             }
//                                         })
//                                     } else {
//                                         Vehicle.findOne({
//                                             where: {
//                                                 deviceid: objVehicle.deviceid,
//                                                 IsDelete: false
//                                             }
//                                         }).then(function(objNewPetExist) {
//                                             if (objNewPetExist) {
//                                                 res.json({
//                                                     success: false,
//                                                     message: "Tracker No. is already assign to other Vehicle...",
//                                                     data: null
//                                                 });
//                                             } else {
//                                                 Vehicle.create(objVehicle).then(function(response) {
//                                                     if (response) {
//                                                         funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
//                                                         res.json({
//                                                             success: true,
//                                                             message: "Vehicle created successfully...",
//                                                             data: response
//                                                         });
//                                                     } else {
//                                                         res.json({
//                                                             success: false,
//                                                             message: "Tracker No. is already assign to other Vehicle...",
//                                                             data: null
//                                                         });
//                                                     }
//                                                 })
//                                             }
//                                         })
//                                     }
//                                 })
//                             } else {
//                                 Vehicle.findOne({
//                                     where: {
//                                         deviceid: objVehicle.deviceid
//                                     }
//                                 }).then(function(objVehicleExist) {
//                                     if (objVehicleExist != null && objVehicleExist.id != objVehicle.id && objVehicleExist.IsDeleted == false) {
//                                         res.json({
//                                             success: false,
//                                             message: "Tracker No. is already assign to other Vehicle...",
//                                             data: objVehicleExist
//                                         });
//                                     } else {
//                                         Vehicle.update(objVehicle, {
//                                             where: {
//                                                 id: objVehicle.id
//                                             }
//                                         }).then(function(response) {
//                                             if (response[0]) {
//                                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Update Vehicle');
//                                                 res.json({
//                                                     success: true,
//                                                     message: "Vehicle updated successfully...",
//                                                     data: objVehicle
//                                                 });
//                                             } else {
//                                                 res.json({
//                                                     success: false,
//                                                     message: "Vehicle is Not updated...",
//                                                     data: objVehicle
//                                                 });
//                                             }
//                                         })
//                                     }
//                                 })
//                             }
//                         } else {
//                             res.json({
//                                 success: false,
//                                 message: "Invalid Tracker No., Please insert valid Tracker No.",
//                                 data: ""
//                             });
//                         }
//                     })
//                 }
//             } else {
//                 res.json(InvalidToken);
//             }
//         })
//     } else {
//         res.json(InvalidToken);
//     }
// });

// router.get('/SaveVehicle', jsonParser, function(req, res) {
//     objVehicle = req.query;
//     objHeader = req.headers;
//     var token = getToken(objHeader);
//     if (token) {
//         var decoded = jwt.decode(token, TokenKey);
//         User.findOne({
//             where: {
//                 username: decoded.username,
//                 password: decoded.password
//             }
//         }).then(function(UserExist) {
//             if (UserExist != null) {
//                 if (objVehicle.deviceid != '' && objVehicle.deviceid != null) {
//                     GpsDevice.findOne({
//                         where: {
//                             DeviceId: objVehicle.deviceid,
//                         }
//                     }).then(function(objGpsDevice) {
//                         if (objGpsDevice != null) {
//                             if (objVehicle.id == 0) {
//                                 objVehicle.IsOnline = false;
//                                 objVehicle.CreatedDate = GetCurrentDate();
//                                 objVehicle.DeviceType = objGpsDevice.Type;
//                                 Vehicle.findOne({
//                                     where: {
//                                         deviceid: objVehicle.deviceid,
//                                         // IsDelete: true
//                                     }
//                                 }).then(function(objPetExist) {
//                                     if (objPetExist && objPetExist.IsDelete) {
//                                         objPet.id = objPetExist.id;
//                                         Vehicle.update(objPet, {
//                                             where: {
//                                                 id: objVehicle.id
//                                             }
//                                         }).then(function(response) {
//                                             if (response[0]) {
//                                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
//                                                 res.json({
//                                                     success: true,
//                                                     message: "Vehicle created successfully...",
//                                                     data: objVehicle
//                                                 });
//                                             }
//                                         })
//                                     } else if (objPetExist && !objPetExist.IsDelete) {
//                                         res.json({
//                                             success: false,
//                                             message: "Tracker No. is already assign to other Vehicle...",
//                                             data: null
//                                         });
//                                     } else {
//                                         Vehicle.create(objPet).then(function(response) {
//                                             if (response) {
//                                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
//                                                 res.json({
//                                                     success: true,
//                                                     message: "Vehicle created successfully...",
//                                                     data: response
//                                                 });
//                                             } else {
//                                                 res.json({
//                                                     success: false,
//                                                     message: "Tracker No. is already assign to other Vehicle...",
//                                                     data: null
//                                                 });
//                                             }
//                                         })
//                                     }
//                                 })
//                             } else {
//                                 Vehicle.findOne({
//                                     where: {
//                                         deviceid: objVehicle.deviceid
//                                     }
//                                 }).then(function(objVehicleExist) {
//                                     if (objVehicleExist != null && objVehicleExist.id != objVehicle.id && objVehicleExist.IsDeleted == false) {
//                                         res.json({
//                                             success: false,
//                                             message: "Tracker No. is already assign to other Vehicle...",
//                                             data: objVehicleExist
//                                         });
//                                     } else {
//                                         Vehicle.update(objVehicle, {
//                                             where: {
//                                                 id: objVehicle.id
//                                             }
//                                         }).then(function(response) {
//                                             if (response[0]) {
//                                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Update Vehicle');
//                                                 res.json({
//                                                     success: true,
//                                                     message: "Vehicle updated successfully...",
//                                                     data: objVehicle
//                                                 });
//                                             }
//                                         })
//                                     }
//                                 })
//                             }
//                         } else {
//                             res.json({
//                                 success: false,
//                                 message: "Invalid Tracker No., Please insert valid Tracker No.",
//                                 data: ""
//                             });
//                         }
//                     })
//                 } else {
//                     if (objVehicle.id == 0) {
//                         objVehicle.IsOnline = false;
//                         objVehicle.HandshakDatetime = null;
//                         objVehicle.CreatedDate = GetCurrentDate();
//                         Vehicle.create(objVehicle).then(function(response) {
//                             if (response) {
//                                 funAuditLog.CreateAuditLog('SaveVehicle', UserExist.username, 'Create Vehicle');
//                                 res.json({
//                                     success: true,
//                                     message: "Vehicle created successfully...",
//                                     data: response
//                                 });
//                             } else {
//                                 res.json({
//                                     success: false,
//                                     message: "Tracker No. is already assign to other pet...",
//                                     data: null
//                                 });
//                             }
//                         })
//                     } else {
//                         Vehicle.findOne({
//                             where: {
//                                 id: objVehicle.id
//                             }
//                         }).then(function(objVehicleExist) {
//                             if (objVehicleExist != null && objVehicleExist.id != objVehicle.id && objVehicleExist.IsDelete == false) {
//                                 res.json({
//                                     success: false,
//                                     message: "Tracker No. is already assign to other Vehicle...",
//                                     data: objVehicleExist
//                                 });
//                             } else {
//                                 Vehicle.update(objVehicle, {
//                                     where: {
//                                         id: objVehicle.id
//                                     }
//                                 }).then(function(response) {
//                                     if (response[0]) {
//                                         funAuditLog.CreateAuditLog('SaveBike', UserExist.username, 'Update Vehicle');
//                                         res.json({
//                                             success: true,
//                                             message: "Vehicle updated successfully...",
//                                             data: objVehicle
//                                         });
//                                     }
//                                 })
//                             }
//                         })
//                     }
//                 }
//             } else {
//                 res.json(InvalidToken);
//             }
//         })
//     } else {
//         res.json(InvalidToken);
//     }
// });

router.get('/UpdateVehicleName', jsonParser, function (req, res) {
  connectionbikedata.query(
    "Update tblvehicle set Name='" +
      req.query.Name +
      "' where deviceid='" +
      req.query.DeviceId +
      "'",
    function (err, rows, fields) {
      if (!err) {
        Commonfunction.UpdateVehicleRedis(req.query.DeviceId, 'Vehicle');
        res.json({ success: true, message: 'Vehicle No. Save Successfully.' });
      } else {
        // console.log(err);
        res.json({
          success: false,
          message: 'Vehicle No. could not save. Try again later.',
        });
      }
    }
  );
});

router.get('/UpdateVehicleType', jsonParser, function (req, res) {
  connectionbikedata.query(
    "Update tblvehicle set idType='" +
      req.query.idType +
      "' where deviceid='" +
      req.query.DeviceId +
      "'",
    function (err, rows, fields) {
      if (!err) {
        Commonfunction.UpdateVehicleRedis(req.query.DeviceId, 'Vehicle');
        res.json({ success: true, message: 'Vehicle Type Save Successfully.' });
      } else {
        // console.log(err);
        res.json({
          success: false,
          message: 'Vehicle Type could not save. Try again later.',
        });
      }
    }
  );
});

router.get('/UpdateVehicleShare', jsonParser, function (req, res) {
  objHeader = req.headers;
  var token = getToken(objHeader);
  if (token) {
    var decoded = jwt.decode(token, TokenKey);
    User.findOne({
      where: {
        username: decoded.username,
        password: decoded.password,
      },
    }).then(function (UserExist) {
      if (UserExist != null) {
        var updateAttribute = '';
        if (
          req.query.IsShared == false ||
          req.query.IsShared == 'false' ||
          req.query.IsShared == 0
        ) {
          var updateAttribute =
            " , ShareCode ='" +
            Math.floor(100000 + Math.random() * 900000) +
            "'";
        }
        connectionbikedata.query(
          'Update tblvehicle set IsShared=' +
            req.query.IsShared +
            ' ' +
            updateAttribute +
            " where deviceid='" +
            req.query.DeviceId +
            "'",
          function (err, rows, fields) {
            if (!err) {
              Commonfunction.UpdateVehicleRedis(req.query.DeviceId, 'Vehicle');
              funAuditLog.CreateAuditLog(
                'Update share Location ',
                UserExist.username,
                'Update share Location (' + req.query.DeviceId + ')'
              );
              res.json({
                success: true,
                message: 'Vehicle No. Save Successfully.',
              });

              var objConnection = {
                DeviceId: req.query.DeviceId,
                // PetId: objVehicle.id,
                Status: req.query.IsShared,
              };
              io.sockets.emit('ShareStatus', JSON.stringify(objConnection));
              io.sockets.emit(
                req.query.DeviceId + 'ShareStatus',
                JSON.stringify(objConnection)
              );
            } else {
              // console.log(err);
              res.json({
                success: false,
                message: 'Vehicle No. could not save. Try again later.',
              });
            }
          }
        );
      } else {
        res.json(InvalidToken);
      }
    });
  } else {
    res.json(InvalidToken);
  }
});

router.get('/UpdateInsurenceDate', jsonParser, function (req, res) {
  var convertDate = convertdateformatForUnix(req.query.InsurenceDate);
  var InsurenceDate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
  // console.log("Update tblvehicle set InsurenceDate='" + req.query.InsurenceDate + "' where deviceid=deviceid='" + req.query.DeviceId + "'")
  connectionbikedata.query(
    "Update tblvehicle set InsurenceDate='" +
      req.query.InsurenceDate +
      "' where deviceid='" +
      req.query.DeviceId +
      "'",
    function (err, rows, fields) {
      if (!err) {
        Commonfunction.UpdateVehicleRedis(req.query.DeviceId, 'Vehicle');
        res.json({
          success: true,
          message: 'Insurence Date Save Successfully.',
        });
      } else {
        // console.log(err);
        res.json({
          success: false,
          message: 'Insurence Date could not save. Try again later.',
        });
      }
    }
  );
});

router.get('/UpdatePUCDate', jsonParser, function (req, res) {
  var convertDate = convertdateformatForUnix(req.query.PUCDate);
  var PUCDate = new Date(convertDate.replace(' ', 'T')).getTime() / 1000;
  // console.log("Update tblvehicle set PUCDate='" + req.query.PUCDate + "' where deviceid=deviceid='" + req.query.DeviceId + "'")
  connectionbikedata.query(
    "Update tblvehicle set PUCDate='" +
      req.query.PUCDate +
      "' where deviceid='" +
      req.query.DeviceId +
      "'",
    function (err, rows, fields) {
      if (!err) {
        Commonfunction.UpdateVehicleRedis(req.query.DeviceId, 'Vehicle');
        res.json({ success: true, message: 'PUC Date  Save Successfully.' });
      } else {
        // console.log(err);
        res.json({
          success: false,
          message: 'PUC Date could not save. Try again later.',
        });
      }
    }
  );
});

router.get('/GetAllExpireDevice', jsonParser, function (req, res) {
  var date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  // var query = "select tblgpsdevice.DeviceId,tblgpsdevice.ExpiryDate,tblsimdetails.SerialNum,tblvehicle.renewaldate " +
  //     "from tblgpsdevice LEFT JOIN tblsimdetails ON tblgpsdevice.idSim = tblsimdetails.id " +
  //     "INNER JOIN tblvehicle ON  tblgpsdevice.DeviceId = tblvehicle.deviceid " +
  //     "where tblgpsdevice.AppName ='" + req.query.AppName + "' and " +
  //     "tblvehicle.renewaldate >'" + ConvertDateFormat(date, true) + "' order by renewaldate asc";

  var query =
    'select tblvehicle.deviceid,tblsimdetails.SerialNum,tblvehicle.renewaldate ' +
    'from tblgpsdevice LEFT JOIN tblsimdetails ON tblgpsdevice.idSim = tblsimdetails.id ' +
    'right JOIN tblvehicle ON  tblgpsdevice.DeviceId = tblvehicle.deviceid ' +
    "where tblgpsdevice.AppName ='" +
    req.query.AppName +
    "' and tblvehicle.IsDelete=0 and " +
    "Date (tblvehicle.renewaldate )>'" +
    ConvertDateFormat(date) +
    "' order by renewaldate asc";

  connectionbikedata.query(query, function (err, response, fields) {
    // res.json({ data: response, message: query });
    res.json(response);
  });

  // GpsDevice.belongsTo(SIM, {
  //     foreignKey: {
  //         name: 'idSim',
  //         allowNull: true,
  //     }
  // });

  // GpsDevice.findAll({
  //     attributes: ['DeviceId', 'ExpiryDate'],
  //     where: {
  //         ExpiryDate: {
  //             $gt: date
  //         },
  //         AppName: req.query.AppName,
  //     },
  //     include: [{
  //         model: SIM,
  //         attributes: ['SerialNum']
  //     }],
  //     order: 'ExpiryDate asc',
  // }).then(function(response) {
  //     res.json(response);
  // })
});

router.get('/GetAllWorkingBikeWebAppNew1', jsonParser, function (req, res) {
  var query =
    'select t4.id,t4.iduser,t4.Name,t4.deviceid,t4.IsOnline,t4.DeviceType,t4.IsEngine, t4.Latitude,t4.Longitude,t4.Datetime, t4.Date, t4.Speed, t4.Direction,t4.OdoMeter,t4.ShareId,t4.VehicleType, ' +
    "(select count(*) from tblalarm  a where a.DeviceId =t4.deviceid and IsRead=false) as 'NotificationCount' ," +
    "(SELECT COUNT(*) FROM tblserviceenhancementnotification WHERE IsRead=false and idvehicle = t4.id) as 'AlertCount' " +
    'from ' +
    '(select t3.deviceid,t3.id,t3.iduser,t3.DeviceType,t3.ShareId,t3.VehicleType,tg.OdoMeter,tg.IsPatchEngine as IsEngine, tg.Latitude,tg.Longitude,tg.Datetime, tg.Date, tg.Speed, tg.Direction,t3.Name,t3.IsOnline from ' +
    " (select t.iduser ,t.deviceid ,t.id,t.Name,t.DeviceType,t.VehicleType,t.ShareId,t.IsOnline,max(tgp2.id) as 'GPSID'  from " +
    "  (select tb.iduser,tb.deviceid,tb.id,tb.Name,tb.DeviceType,tvt.Type as 'VehicleType',tsd.id as'ShareId',tb.IsOnline from tblvehicle tb " +
    '   LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle ' +
    '   LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id ' +
    '   where (tb.iduser=' +
    req.query.idUser +
    ' or tsd.iduser=' +
    req.query.idUser +
    ')  and tb.IsDelete = 0 ' +
    '  ) as t ' +
    '  left join   tblgpsdata as tgp2 on tgp2.DeviceId = t.deviceid ' +
    '  group by t.DeviceId ' +
    ' ) as t3 left join tblgpsdata tg on tg.id = t3.GPSID ) ' +
    ' as t4';
  // connection.query("SELECT tb.id,tb.iduser,tb.Name,tb.deviceid,tb.IsOnline,tb.DeviceType,tpg1.IsEngine, tpg1.Latitude,tpg1.Longitude,tpg.Datetime, tpg.Date, tpg1.Speed, tpg1.Direction, tpg1.OdoMeter,tsd.id as ShareId,tvt.Type as VehicleType,(SELECT COUNT(*) FROM tblalarm WHERE IsRead=false and DeviceId = tb.deviceid) as NotificationCount, (SELECT COUNT(*) FROM tblserviceenhancementnotification WHERE IsRead=false and idvehicle = tb.id) as AlertCount FROM tblvehicle tb LEFT JOIN tblgpsdata tpg INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date  ON tb.deviceid=tpg.DeviceId LEFT JOIN tblgpsdata tpg1 INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata where GPSPositioning='A' GROUP BY DeviceId) b1 ON tpg1.DeviceId = b1.DeviceId AND tpg1.Date = b1.Date  ON tb.deviceid=tpg1.DeviceId LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id WHERE (tb.iduser=" + req.query.idUser + " or tsd.iduser=" + req.query.idUser + ") and IsDelete=false and tb.deviceid != '' group by tb.deviceid;", function(err, rows, fields) {
  connectionbikedata.query(query, function (err, rows, fields) {
    if (!err) {
      res.json({ success: true, data: rows });
    } else {
      res.json({ success: false, data: [] });
    }
  });
});

router.get('/GetAllWorkingBikeWebAppNew', function (req, res) {
  var query =
    'select t4.id,t4.iduser,t4.Name,t4.deviceid,t4.IsOnline,t4.DeviceType,t4.DeviceCompany,t4.FuelRatio,t4.FuelCapacity,t4.IsFule,t4.ShareId,t4.JourneyFlag,t4.VehicleType,t4.IsShared,t4.IdGroup,t4.IdSharedGroup,t4.ExpiryDate, ' +
    "(select count(*) from tblalarm  a where a.DeviceId =t4.deviceid and IsRead=false) as 'NotificationCount' ," +
    "(SELECT COUNT(*) FROM tblserviceenhancementnotification WHERE IsRead=false and idvehicle = t4.id) as 'AlertCount' " +
    'from ' +
    "  (select tb.iduser,tb.deviceid,tb.id,tb.Name,tb.IdGroup,tb.DeviceType,tb.DeviceCompany,tb.FuelRatio,tb.FuelCapacity,tb.IsFule,tb.IsShared as 'IsShared',tsd.IdSharedGroup as 'IdSharedGroup',tvt.Type as 'VehicleType',tsd.id as'ShareId',tsd.JourneyFlag,tb.IsOnline, CONVERT_TZ(tb.renewaldate,'+00:00','" +
    CurrentOffset +
    "') as ExpiryDate from tblvehicle tb " +
    '   LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle ' +
    '   LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id ' +
    '   where (tb.iduser=' +
    req.query.idUser +
    ' or tsd.iduser=' +
    req.query.idUser +
    ') and IsDelete = false ' +
    '  ) as t4 group by t4.deviceid;';
  // connection.query("SELECT tb.id,tb.iduser,tb.Name,tb.deviceid,tb.IsOnline,tb.DeviceType,tpg1.IsEngine, tpg1.Latitude,tpg1.Longitude,tpg.Datetime, tpg.Date, tpg1.Speed, tpg1.Direction, tpg1.OdoMeter,tsd.id as ShareId,tvt.Type as VehicleType,(SELECT COUNT(*) FROM tblalarm WHERE IsRead=false and DeviceId = tb.deviceid) as NotificationCount, (SELECT COUNT(*) FROM tblserviceenhancementnotification WHERE IsRead=false and idvehicle = tb.id) as AlertCount FROM tblvehicle tb LEFT JOIN tblgpsdata tpg INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId  AND tpg.Date = b.Date  ON tb.deviceid=tpg.DeviceId LEFT JOIN tblgpsdata tpg1 INNER JOIN (SELECT DeviceId,MAX(Date) Date FROM tblgpsdata where GPSPositioning='A' GROUP BY DeviceId) b1 ON tpg1.DeviceId = b1.DeviceId AND tpg1.Date = b1.Date  ON tb.deviceid=tpg1.DeviceId LEFT join tblsharedevice tsd on tb.id=tsd.idVehicle LEFT JOIN tblvehicletype tvt on tb.idType=tvt.id WHERE (tb.iduser=" + req.query.idUser + " or tsd.iduser=" + req.query.idUser + ") and IsDelete=false and tb.deviceid != '' group by tb.deviceid;", function(err, rows, fields) {
  connectionbikedata.query(query, function (err, rows, fields) {
    if (!err) {
      var lstAllVehicle = [];

      function getData(i) {
        if (i < rows.length) {
          var obj = new Object();
          obj.id = rows[i].id;
          obj.iduser = rows[i].iduser;
          obj.Name = rows[i].Name;
          obj.IdGroup = rows[i].IdGroup;
          obj.deviceid = rows[i].deviceid;
          obj.IsOnline = rows[i].IsOnline;
          obj.DeviceType = rows[i].DeviceType;
          obj.DeviceCompany = rows[i].DeviceCompany;
          obj.ShareId = rows[i].ShareId;
          obj.VehicleType = rows[i].VehicleType;
          obj.NotificationCount = rows[i].NotificationCount;
          obj.AlertCount = rows[i].AlertCount;
          obj.IsShared = rows[i].IsShared;
          obj.IdSharedGroup = rows[i].IdSharedGroup;
          obj.ExpiryDate = rows[i].ExpiryDate;
          obj.AD2 = rows[i].AD2;
          obj.FuelRatio = rows[i].FuelRatio;
          obj.IsFule = rows[i].IsFule;
          obj.FuelCapacity = rows[i].FuelCapacity;
          obj.JourneyFlag = rows[i].JourneyFlag;
          client.get(rows[i].deviceid, function (err, strgpsdata) {
            if (!err) {
              if (
                (strgpsdata != null) & (strgpsdata != '') &&
                strgpsdata != undefined
              ) {
                var objgps = JSON.parse(strgpsdata);
                obj.IsEngine = objgps.IsEngine;
                obj.Latitude = objgps.Latitude;
                obj.Longitude = objgps.Longitude;
                obj.Datetime = objgps.Datetime;
                obj.Date = objgps.Date;
                obj.Speed = objgps.Speed;
                obj.Direction = objgps.Direction;
                obj.OdoMeter = objgps.OdoMeter;
                obj.AD1 = objgps.AD1;
                obj.AD2 = objgps.AD2;
                obj.IsWiringForAntiTamper = objgps.IsWiringForAntiTamper;
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
                obj.AD1 = null;
                obj.AD2 = null;
                obj.IsWiringForAntiTamper = null;
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
              obj.AD1 = null;
              obj.AD2 = null;
              obj.IsWiringForAntiTamper = null;
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
  });
});

router.get('/GetDeviceAllInformation', function (req, res) {
  var query =
    'Select tgd.IMEI,tgd.DeviceId,tgd.Type,ts.SerialNum,ts.PhoneNum,tv.Name,tv.renewaldate,tv.IsDelete,tu.username,tu.email,tu.phone ' +
    ' from tblgpsdevice tgd ' +
    'LEFT JOIN tblvehicle tv ON tv.deviceid = tgd.DeviceId ' +
    'LEFT JOIN tbluserinformation tu ON tu.id = tv.iduser ' +
    'LEFT JOIN tblsimdetails ts ON ts.id = tgd.idSim ' +
    'INNER JOIN tblappinfo tai ON tai.AppName = tgd.AppName ' +
    'where tai.id = ' +
    req.query.idApp +
    '  and ' +
    ' tgd.IMEI = ' +
    req.query.DeviceId;
  connectionbikedata.query(query, function (err, rows, fields) {
    if (!err) {
      res.json({ success: true, data: rows });
    } else {
      res.json({ success: false, data: [] });
    }
  });
});

router.get('/GetExcelVehicleDetailReport', function (req, res) {
  var conf = {};
  conf.name = 'Sheet1';
  conf.cols = [
    {
      caption: 'User',
      type: 'string',
    },
    {
      caption: 'DeviceID',
      type: 'string',
    },
    {
      caption: 'IMEI',
      type: 'string',
    },
    {
      caption: 'Sim Serial Number',
      type: 'string',
    },
    {
      caption: 'Phone Number',
      type: 'string',
    },
    {
      caption: 'Expiry Date',
      type: 'string',
    },
    {
      caption: 'GPSDate',
      type: 'string',
    },
    {
      caption: 'AppName',
      type: 'string',
    },
  ];
  conf.rows = [];
  var query =
    "Select tv.id, tu.Email, tgd.DeviceId,CONVERT_TZ(tv.renewaldate,'+00:00','" +
    CurrentOffset +
    "') as DisplayExpiryDate, tgd.AppName,CONVERT_TZ(tgd.ExpiryDate,'+00:00','" +
    CurrentOffset +
    "') as DisplayExpiryDate2,tgd.IMEI,ts.SerialNum,ts.PhoneNum from tblgpsdevice as tgd " +
    'left join tblsimdetails as ts on tgd.idSim=ts.id ' +
    // "left join tblgpsdata as tg on (tgd.DeviceId=tg.DeviceId and tg.GPSPositioning='A') " +
    'left join (tblvehicle as tv inner join tbluserinformation as tu on tv.iduser=tu.id) on (tgd.DeviceId=tv.deviceid and tv.IsDelete=false) ' +
    // "where (tv.id is not null || tg.Id is not null) " +
    'group by tgd.DeviceId';
  connectionbikedata.query(query, function (err, rowsdata, fields) {
    if (!err) {
      var lstAllData = [];

      function GetGpsData(i) {
        if (i < rowsdata.length) {
          console.log(i);
          GPSData.findOne({
            where: {
              DeviceId: rowsdata[i].DeviceId,
            },
          }).then(function (response) {
            var row = [];
            if (response != null) {
              var User = '';
              if (rowsdata[i].Email != null) {
                User = rowsdata[i].Email;
              }
              var ExpiryDate = '';
              if (
                rowsdata[i].DisplayExpiryDate != null &&
                rowsdata[i].DisplayExpiryDate != '' &&
                rowsdata[i].DisplayExpiryDate != undefined
              ) {
                ExpiryDate = convertdateformat(rowsdata[i].DisplayExpiryDate);
              } else if (
                rowsdata[i].DisplayExpiryDate2 != null &&
                rowsdata[i].DisplayExpiryDate2 != '' &&
                rowsdata[i].DisplayExpiryDate2 != undefined
              ) {
                ExpiryDate = convertdateformat(rowsdata[i].DisplayExpiryDate2);
              }

              var GPSDate = '';
              if (
                response.Date != null &&
                response.Date != '' &&
                response.Date != undefined
              ) {
                GPSDate = convertdateformat(new Date(response.Date * 1000));
              }

              var AppName = '';
              if (
                rowsdata[i].AppName != null &&
                rowsdata[i].AppName != '' &&
                rowsdata[i].AppName != undefined
              ) {
                AppName = rowsdata[i].AppName;
              }

              var SimNum = '';
              if (
                rowsdata[i].SerialNum != null &&
                rowsdata[i].SerialNum != '' &&
                rowsdata[i].SerialNum != undefined
              ) {
                SimNum = rowsdata[i].SerialNum;
              }

              var PhoneNum = '';
              if (
                rowsdata[i].PhoneNum != null &&
                rowsdata[i].PhoneNum != '' &&
                rowsdata[i].PhoneNum != undefined
              ) {
                PhoneNum = rowsdata[i].PhoneNum;
              }

              var obj = new Object();
              obj.User = User;
              obj.DeviceId = rowsdata[i].DeviceId;
              obj.IMEI = rowsdata[i].IMEI;
              obj.SimNum = SimNum;
              obj.PhoneNum = PhoneNum;
              obj.ExpiryDate = ExpiryDate;
              obj.GPSDate = GPSDate;
              obj.AppName = AppName;
              obj.AppName = AppName;
              obj.Date = response.Date;
              lstAllData.push(obj);
              // row.push(User, rowsdata[i].DeviceId, rowsdata[i].IMEI, SimNum, PhoneNum, ExpiryDate, GPSDate, AppName);
              // conf.rows.push(row);
              GetGpsData(i + 1);
            } else if (rowsdata[i].id != null) {
              var User = '';
              if (rowsdata[i].Email != null) {
                User = rowsdata[i].Email;
              }
              var ExpiryDate = '';
              if (
                rowsdata[i].DisplayExpiryDate != null &&
                rowsdata[i].DisplayExpiryDate != '' &&
                rowsdata[i].DisplayExpiryDate != undefined
              ) {
                ExpiryDate = convertdateformat(rowsdata[i].DisplayExpiryDate);
              } else if (
                rowsdata[i].DisplayExpiryDate2 != null &&
                rowsdata[i].DisplayExpiryDate2 != '' &&
                rowsdata[i].DisplayExpiryDate2 != undefined
              ) {
                ExpiryDate = convertdateformat(rowsdata[i].DisplayExpiryDate2);
              }

              var SimNum = '';
              if (
                rowsdata[i].SerialNum != null &&
                rowsdata[i].SerialNum != '' &&
                rowsdata[i].SerialNum != undefined
              ) {
                SimNum = rowsdata[i].SerialNum;
              }

              var PhoneNum = '';
              if (
                rowsdata[i].PhoneNum != null &&
                rowsdata[i].PhoneNum != '' &&
                rowsdata[i].PhoneNum != undefined
              ) {
                PhoneNum = rowsdata[i].PhoneNum;
              }

              var AppName = '';
              if (
                rowsdata[i].AppName != null &&
                rowsdata[i].AppName != '' &&
                rowsdata[i].AppName != undefined
              ) {
                AppName = rowsdata[i].AppName;
              }

              var obj = new Object();
              obj.User = User;
              obj.DeviceId = rowsdata[i].DeviceId;
              obj.IMEI = rowsdata[i].IMEI;
              obj.SimNum = SimNum;
              obj.PhoneNum = PhoneNum;
              obj.ExpiryDate = ExpiryDate;
              obj.GPSDate = '';
              obj.AppName = AppName;
              obj.AppName = AppName;
              obj.Date = 0;
              lstAllData.push(obj);
              // row.push(User, rowsdata[i].DeviceId, rowsdata[i].IMEI, SimNum, PhoneNum, ExpiryDate, '', AppName);
              // conf.rows.push(row);
              GetGpsData(i + 1);
            } else {
              GetGpsData(i + 1);
            }
          });
        } else {
          lstAllData = u.sortBy(lstAllData, function (o) {
            return o.Date;
          });
          for (var j = 0; j < lstAllData.length; j++) {
            var row = [];
            row.push(
              lstAllData[j].User,
              lstAllData[j].DeviceId,
              lstAllData[j].IMEI,
              lstAllData[j].SimNum,
              lstAllData[j].PhoneNum,
              lstAllData[j].ExpiryDate,
              lstAllData[j].GPSDate,
              lstAllData[j].AppName
            );
            conf.rows.push(row);
          }

          var result = nodeExcel.execute(conf);
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
          res.setHeader(
            'Content-Disposition',
            'attachment; filename=VehicleExpiryData.xlsx'
          );
          res.end(result, 'binary');
        }
      }
      GetGpsData(0);
      // res.json({ success: true, data: rows });
    } else {
      res.json({ success: false, data: [] });
    }
  });
});

router.get('/ChangeFuleStatus', function (req, res) {
  Vehicle.findOne({
    where: {
      deviceid: req.query.deviceid,
    },
  }).then(function (resVehical) {
    if (resVehical) {
      resVehical
        .updateAttributes({ IsFule: req.query.IsFule })
        .then(function (response) {
          Commonfunction.UpdateVehicleRedis(req.query.deviceid, 'Vehicle');
          res.json({
            success: true,
            message: 'Fule status updated successfully.',
          });
        });
    } else {
      res.json({ success: false, message: 'No record found.' });
    }
  });
});

router.get('/ChangeFuleRatioAndCapcity', function (req, res) {
  Vehicle.findOne({
    where: {
      deviceid: req.query.deviceid,
    },
  }).then(function (resVehical) {
    if (resVehical) {
      resVehical
        .updateAttributes({
          FuelRatio: req.query.FuelRatio,
          FuelCapacity: req.query.FuelCapacity,
        })
        .then(function (response) {
          Commonfunction.UpdateVehicleRedis(req.query.deviceid, 'Vehicle');
          res.json({
            success: true,
            message: 'Fule Ratio and Capacity updated successfully.',
          });
        });
    } else {
      res.json({ success: false, message: 'No record found.' });
    }
  });
});

router.get('/updateEmailNotificationSetting', jsonParser, function (req, res) {
  objHeader = req.headers;
  var token = getToken(objHeader);
  var obj = {};
  obj.headers = req.headers;

  if (token) {
    var decoded = jwt.decode(token, TokenKey);
    User.findOne({
      where: {
        username: decoded.username,
        password: decoded.password,
      },
    }).then(function (UserExist) {
      if (UserExist != null) {
        User.findOne({ where: { id: req.query.Id } }).then(function (
          response1
        ) {
          if (response1) {
            response1
              .updateAttributes({ IsEmail: req.query.IsEmail })
              .then(function (UpdateUserEmail) {
                if (UpdateUserEmail) {
                  var query =
                    'update tblvehicle set IsEmail=' +
                    req.query.IsEmail +
                    ' where iduser=' +
                    req.query.Id;
                  connection.query(query, function (err, response) {
                    if (response) {
                      res.json({
                        success: true,
                        message:
                          'Email Notification setting update successfully.',
                      });
                      Vehicle.findAll({ where: { iduser: req.query.Id } }).then(
                        function (vehicleList) {
                          if (vehicleList.length > 0) {
                            function uploder(i) {
                              if (vehicleList.length > i) {
                                //update Vehicle Data In Redis Server
                                Commonfunction.UpdateVehicleRedis(
                                  vehicleList[i].deviceid,
                                  'Vehicle'
                                );
                                Commonfunction.UpdateVehicleRedis(
                                  vehicleList[i].deviceid,
                                  'User'
                                );
                                client.set(
                                  vehicleList[i].deviceid +
                                    'EmailNotificationSend',
                                  req.query.IsEmail.toString(),
                                  function (err, replies) {
                                    // console.log(err)
                                    uploder(i + 1);
                                  }
                                );
                              }
                            }
                            uploder(0);
                          }
                        }
                      );
                    } else {
                      res.json({
                        success: false,
                        message: 'Email Notification setting not update.',
                      });
                    }
                  });
                } else {
                  res.json({
                    success: false,
                    message: 'Email Notification setting not update.',
                  });
                }
              });
          } else {
            res.json(RecordNotFound);
          }
        });
      } else {
        res.json(InvalidToken);
      }
    });
  } else {
    res.json(InvalidToken);
  }
});

router.get(
  '/updateIsIgnitionNotificationSetting',
  jsonParser,
  function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    var obj = {};
    obj.headers = req.headers;

    if (token) {
      var decoded = jwt.decode(token, TokenKey);
      User.findOne({
        where: {
          username: decoded.username,
          password: decoded.password,
        },
      }).then(function (UserExist) {
        if (UserExist != null) {
          User.findOne({ where: { id: req.query.Id } }).then(function (
            response1
          ) {
            if (response1) {
              response1
                .updateAttributes({ IsIgnition: req.query.IsIgnition })
                .then(function (UpdateUserIgnition) {
                  if (UpdateUserIgnition) {
                    var query =
                      'update tblvehicle set IsIgnition=' +
                      req.query.IsIgnition +
                      ' where iduser=' +
                      req.query.Id;
                    connection.query(query, function (err, response) {
                      if (response) {
                        res.json({
                          success: true,
                          message:
                            'Ignition Notification setting update successfully.',
                        });
                        Vehicle.findAll({
                          where: { iduser: req.query.Id },
                        }).then(function (vehicleList) {
                          if (vehicleList.length > 0) {
                            function uploder(i) {
                              if (vehicleList.length > i) {
                                //update Vehicle Data In Redis Server
                                Commonfunction.UpdateVehicleRedis(
                                  vehicleList[i].deviceid,
                                  'Vehicle'
                                );
                                //User
                                Commonfunction.UpdateVehicleRedis(
                                  vehicleList[i].deviceid,
                                  'User'
                                );
                                client.set(
                                  vehicleList[i].deviceid + 'IgnitionStatus',
                                  req.query.IsIgnition.toString(),
                                  function (err, replies) {
                                    // console.log(err)
                                    uploder(i + 1);
                                  }
                                );
                              }
                            }
                            uploder(0);
                          }
                        });
                      } else {
                        res.json({
                          success: false,
                          message: 'Ignition Notification setting not update.',
                        });
                      }
                    });
                  } else {
                    res.json({
                      success: false,
                      message: 'Ignition Notification setting not update.',
                    });
                  }
                });
            } else {
              res.json(RecordNotFound);
            }
          });
        } else {
          res.json(InvalidToken);
        }
      });
    } else {
      res.json(InvalidToken);
    }
  }
);

router.get('/updateIdleMinute', jsonParser, function (req, res) {
  objHeader = req.headers;
  var token = getToken(objHeader);
  var obj = {};
  obj.headers = req.headers;

  if (token) {
    var decoded = jwt.decode(token, TokenKey);
    User.findOne({
      where: {
        username: decoded.username,
        password: decoded.password,
      },
    }).then(function (UserExist) {
      if (UserExist != null) {
        User.findOne({ where: { id: req.query.Id } }).then(function (
          response1
        ) {
          if (response1) {
            response1
              .updateAttributes({ IdleMinute: req.query.IdleMinute })
              .then(function (UpdateUserIgnition) {
                if (UpdateUserIgnition) {
                  var query =
                    'update tblvehicle set IdleMinute=' +
                    req.query.IdleMinute +
                    ' where iduser=' +
                    req.query.Id;
                  connection.query(query, function (err, response) {
                    if (response) {
                      res.json({
                        success: true,
                        message: 'Idle Minute update successfully.',
                      });
                      Vehicle.findAll({ where: { iduser: req.query.Id } }).then(
                        function (vehicleList) {
                          if (vehicleList.length > 0) {
                            function uploder(i) {
                              if (vehicleList.length > i) {
                                //update Vehicle Data In Redis Server
                                Commonfunction.UpdateVehicleRedis(
                                  vehicleList[i].deviceid,
                                  'Vehicle'
                                );
                                //User
                                Commonfunction.UpdateVehicleRedis(
                                  vehicleList[i].deviceid,
                                  'User'
                                );
                                client.set(
                                  vehicleList[i].deviceid + 'IdleMinute',
                                  req.query.IdleMinute.toString(),
                                  function (err, replies) {
                                    // console.log(err)
                                    uploder(i + 1);
                                  }
                                );
                              }
                            }
                            uploder(0);
                          }
                        }
                      );
                    } else {
                      res.json({
                        success: false,
                        message: 'Idle Minute not update.',
                      });
                    }
                  });
                } else {
                  res.json({
                    success: false,
                    message: 'Idle Minute not update.',
                  });
                }
              });
          } else {
            res.json(RecordNotFound);
          }
        });
      } else {
        res.json(InvalidToken);
      }
    });
  } else {
    res.json(InvalidToken);
  }
});

function convertdateformat(date1) {
  var date = new Date(date1);
  var firstdayMonth = date.getMonth() + 1;

  var firstdayDay = date.getDate();

  var firstdayYear = date.getFullYear();

  var firstdayHours = date.getHours();

  var firstdayMinutes = date.getMinutes();

  var firstdaySeconds = date.getSeconds();

  return (
    ('00' + firstdayDay.toString()).slice(-2) +
    '-' +
    ('00' + firstdayMonth.toString()).slice(-2) +
    '-' +
    ('0000' + firstdayYear.toString()).slice(-4) +
    ' ' +
    ('00' + firstdayHours.toString()).slice(-2) +
    ':' +
    ('00' + firstdayMinutes.toString()).slice(-2) +
    ':' +
    ('00' + firstdaySeconds.toString()).slice(-2)
  );
}

// function convertdateformatForUnix(date1) {
//     var date = new Date(date1);
//     var firstdayMonth = date.getMonth() + 1;
//     var firstdayDay = date.getDate();
//     var firstdayYear = date.getFullYear();
//     var firstdayHours = 0;
//     var firstdayMinutes = 0;
//     var firstdaySeconds = 0;

//     return ("00" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("0000" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);

// }

function convertdateformatLicenceExpiry(date1, flg) {
  var date = new Date(date1);
  var firstdayMonth = date.getMonth() + 1;
  var firstdayDay = date.getDate();
  var firstdayYear = date.getFullYear();
  var firstdayHours = date.getHours();
  var firstdayMinutes = date.getMinutes();
  var firstdaySeconds = date.getSeconds();

  if (flg == 1) {
    return (
      ('0000' + firstdayYear.toString()).slice(-4) +
      '-' +
      ('00' + firstdayMonth.toString()).slice(-2) +
      '-' +
      ('00' + firstdayDay.toString()).slice(-2) +
      ' ' +
      '23:59:59'
    );
  } else if (flg == 2) {
    return (
      ('0000' + firstdayYear.toString()).slice(-4) +
      '-' +
      ('00' + firstdayMonth.toString()).slice(-2) +
      '-' +
      ('00' + firstdayDay.toString()).slice(-2) +
      ' ' +
      '00:00:00'
    );
  } else if (flg == 3) {
    return (
      ('0000' + firstdayYear.toString()).slice(-4) +
      '-' +
      ('00' + firstdayMonth.toString()).slice(-2) +
      '-' +
      ('00' + firstdayDay.toString()).slice(-2) +
      ' ' +
      ('00' + firstdayHours.toString()).slice(-2) +
      ':' +
      ('00' + firstdayMinutes.toString()).slice(-2) +
      ':' +
      ('00' + firstdaySeconds.toString()).slice(-2)
    );
  } else {
    return (
      ('0000' + firstdayYear.toString()).slice(-4) +
      '-' +
      ('00' + firstdayMonth.toString()).slice(-2) +
      '-' +
      ('00' + firstdayDay.toString()).slice(-2)
    );
  }
}

module.exports = router;
