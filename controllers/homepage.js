var express = require('express'),
  router = express.Router();
//Tables
var User = models.tbluserinformation;
var Vehicle = models.tblvehicle;
var UserInRole = models.tbluserinrole;
var Role = models.tblrole;
var GPSData = models.tblgpsdata;
var PetAlarm = models.tblalarm;
var PetDevice = models.tblgpsdevice;
var SOS = models.tblsos;
var Buffer = require('buffer').Buffer;
var momentz = require('moment-timezone');
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

router.get('/getAllVehicleByUser', function (req, res) {
  var search = {};
  var objSearch = req.query.objSearch;

  if (objSearch != null && objSearch != '') {
    search['$or'] = [];
    search['$or'].push(['deviceid like ?', '%' + objSearch + '%']);
    search['$or'].push(['Name like ?', '%' + objSearch + '%']);
  }

  search['$and'] = [];

  var obj = new Object();
  obj['iduser'] = {
    $eq: req.query.idUser,
  };
  search['$and'].push(obj);

  var obj = new Object();
  obj['deviceid'] = {
    $ne: '',
  };
  search['$and'].push(obj);

  var obj = new Object();
  obj['IsDelete'] = {
    $eq: false,
  };
  search['$and'].push(obj);

  Vehicle.findAll({
    where: search,
    order: 'CreatedDate',
  })
    .then(function (response) {
      res.json(response);
    })
    .catch(function (error) {
      res.json(error);
    });
});

router.post('/GetAllWorkingVehicle', jsonParser, function (req, res) {
  connection.query(
    'SELECT  tb.id,tb.deviceid,tb.Name,tb.IsOnline, tpg.Latitude,tpg.Longitude,tpg.Datetime, tpg.Id, tpg.Speed FROM tblvehicle tb INNER JOIN tblgpsdata tpg ON tb.deviceid=tpg.DeviceId INNER JOIN (SELECT DeviceId,MAX(Id) Id FROM tblgpsdata GROUP BY DeviceId) b ON tpg.DeviceId = b.DeviceId AND tpg.Id = b.Id WHERE iduser=' +
      req.query.idUser +
      ' and IsDelete=false;',
    function (err, rows, fields) {
      if (!err) {
        res.json({ success: true, data: rows });
      } else {
        res.json({ success: false, data: [] });
      }
    }
  );
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

router.get('/GetVehicleCurrentLocation', function (req, res) {
  //----------------call redix server data--------------------------
  client.get(req.query.DeviceId, function (err, strgpsdata) {
    if (!err) {
      if (strgpsdata != null && strgpsdata != '' && strgpsdata != undefined) {
        res.json({ success: true, data: JSON.parse(strgpsdata) });
      } else {
        res.json(RecordNotFound);
      }
    }
  });


});

module.exports = router;
