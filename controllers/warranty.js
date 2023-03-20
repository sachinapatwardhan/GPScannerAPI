var router = express.Router();
var WarrantyReplace = models.tbwarrantyreplace;
var Vehicle = models.tblvehicle;
var GPSDevice = models.tblgpsdevice;
var LicenceManager = models.tbllicencemanager;
var User = models.tbluserinformation;

router.post('/GetAllOldVehicle', jsonParser, function (req, res) {
  var AppName = req.body.AppName;
  var wherecondition = '';
  if (AppName != null && AppName != undefined && AppName != '') {
    wherecondition = " Where AppName='" + AppName + "' ";
  }
  var query =
    ' SELECT DeviceId,AppName as CreatedDate FROM tblgpsdevice ' +
    wherecondition +
    ' ORDER BY CreatedDate ';
  connection.query(query, function (err, response) {
    if (response.length) {
      res.json({
        success: true,
        message: 'Record(s) found',
        data: response,
      });
    } else {
      res.json({
        success: false,
        message: err,
        data: response,
      });
    }
  });
});

router.post('/GetAllNewVehicle', jsonParser, function (req, res) {
  var AppName = req.body.AppName;
  var wherecondition = '';
  if (AppName != null && AppName != undefined && AppName != '') {
    wherecondition = " AND AppName='" + AppName + "' ";
  }
  var query =
    ' SELECT DeviceId,AppName' +
    ' FROM tblgpsdevice tg ' +
    ' WHERE DeviceId NOT IN (SELECT DeviceId FROM tbllicencemanager WHERE DeviceId IS Not null) ' +
    wherecondition;
  console.log(query);
  connection.query(query, function (err, response) {
    if (response.length) {
      res.json({
        success: true,
        message: 'Record(s) found',
        data: response,
      });
    } else {
      res.json({
        success: false,
        message: err,
        data: response,
      });
    }
  });
});

router.get('/GetAllDyanmicWarrantyReplaceDevice', function (req, res) {
  var objParam = req.query;
  var objColumns = objParam.columns;
  var objOrder = objParam.order;
  var objSearch = objParam.search;
  var Orderby =
    objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
  var search = '';

  if (objSearch != null && objSearch != '') {
    search = ' Where (tw.OldDevice like "%' + objSearch + '%" or ';
    search = search + 'tw.NewDevice like "%' + objSearch + '%" or ';
    search = search + 'tw.IsReuseSim like "%' + objSearch + '%" or ';
    search = search + 'tw.CreatedDate like "%' + objSearch + '%" or ';
    search = search + 'tw.CreatedBy like "%' + objSearch + '%") ';
  }

  var query =
    "SELECT tw.*,CONVERT_TZ(tw.CreatedDate,'+00:00','" +
    CurrentOffset +
    "') as CreatedDate" +
    ' FROM tbwarrantyreplace as tw ' +
    search +
    ' order by ' +
    Orderby +
    ' limit ' +
    parseInt(objParam.length) +
    ' offset ' +
    parseInt(objParam.start);
  console.log(query);
  var countquery =
    'SELECT count(*) as TotalRecord ' +
    ' from tbwarrantyreplace as tw ' +
    search;
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
  });
});

router.post('/SaveWarrantyReplaceDevice', jsonParser, function (req, res) {
  var objParam = req.body;
  objHeader = req.headers;
  // var DeviceList = req.query.DeviceList;
  var token = getToken(objHeader);
  if (token) {
    var decoded = jwt.decode(token, TokenKey);
    User.findOne({
      where: { username: decoded.username, password: decoded.password },
    }).then(function (UserExist) {
      if (UserExist != null) {
        var wherecondition1 = '';
        var wherecondition2 = '';
        if (
          objParam.AppName != null &&
          objParam.AppName != undefined &&
          objParam.AppName != ''
        ) {
          wherecondition1 = " Where AppName='" + objParam.AppName + "' ";
          wherecondition2 = " AND AppName='" + objParam.AppName + "' ";
        }

        if (
          objParam.OldDevice != null &&
          objParam.OldDevice != undefined &&
          objParam.OldDevice != ''
        ) {
          wherecondition1 += " AND DeviceId='" + objParam.OldDevice + "' ";
        }

        if (
          objParam.NewDevice != null &&
          objParam.NewDevice != undefined &&
          objParam.NewDevice != ''
        ) {
          wherecondition2 += " AND DeviceId='" + objParam.NewDevice + "' ";
        }
        var query1 =
          ' SELECT DeviceId,AppName FROM tblgpsdevice ' + wherecondition1;
        connection.query(query1, function (err, OldDeviceExist) {
          if (OldDeviceExist != null && OldDeviceExist.length > 0) {
            var query2 =
              ' SELECT DeviceId,AppName' +
              ' FROM tblgpsdevice tg ' +
              ' WHERE DeviceId NOT IN (SELECT DeviceId FROM tbllicencemanager WHERE DeviceId IS Not null) ' +
              wherecondition2;
            connection.query(query2, function (err, NewDeviceExist) {
              if (NewDeviceExist != null && NewDeviceExist.length > 0) {
                var obj = new Object();
                obj.OldDevice = objParam.OldDevice;
                obj.NewDevice = objParam.NewDevice;
                obj.IsReuseSim = objParam.IsReuseSim;
                obj.CreatedBy = UserExist.username;
                obj.CreatedDate = new Date();

                WarrantyReplace.create(obj).then(function (reswarranty) {
                  if (reswarranty) {
                    funAuditLog.CreateAuditLog(
                      'Warranty Replace',
                      UserExist.username,
                      'Warranty Replace OldDevice:(' +
                        objParam.OldDevice +
                        ') to NewDevice:(' +
                        objParam.NewDevice +
                        ')'
                    );
                    LicenceManager.update(
                      { DeviceId: objParam.NewDevice },
                      { where: { DeviceId: objParam.OldDevice } }
                    ).then(function (updateDeviceLicence) {
                      // if (updateDeviceLicence[0]) {
                      funAuditLog.CreateAuditLog(
                        'Licence Replace',
                        UserExist.username,
                        'Warranty Replace Licence of Device OldDevice:(' +
                          objParam.OldDevice +
                          ') to NewDevice:(' +
                          objParam.NewDevice +
                          ')'
                      );
                      GPSDevice.findOne({
                        where: {
                          deviceid: objParam.OldDevice,
                          AppName: objParam.AppName,
                        },
                      }).then(function (OldGPSDeviceExist) {
                        if (OldGPSDeviceExist) {
                          GPSDevice.findOne({
                            where: {
                              deviceid: objParam.NewDevice,
                              AppName: objParam.AppName,
                            },
                          }).then(function (NewGPSDeviceExist) {
                            if (NewGPSDeviceExist) {
                              var idSim = OldGPSDeviceExist.idSim;
                              OldGPSDeviceExist.updateAttributes({
                                idSim: null,
                                Status: 'Spoil',
                              }).then(function (updateOldGpsDevice) {
                                if (updateOldGpsDevice) {
                                  NewGPSDeviceExist.updateAttributes({
                                    idSim: idSim,
                                  }).then(function (updateNewGpsDevice) {
                                    if (updateNewGpsDevice) {
                                      funAuditLog.CreateAuditLog(
                                        'GPS Device Sim Update',
                                        UserExist.username,
                                        'Warranty Replace GPS Device Sim(' +
                                          idSim +
                                          ') of Device OldDevice:(' +
                                          objParam.OldDevice +
                                          ') to NewDevice:(' +
                                          objParam.NewDevice +
                                          ')'
                                      );
                                      Vehicle.findOne({
                                        where: {
                                          deviceid: objParam.OldDevice,
                                          IsDelete: 0,
                                        },
                                      }).then(function (VehicleExist) {
                                        if (VehicleExist) {
                                          VehicleExist.updateAttributes({
                                            deviceid: objParam.NewDevice,
                                          }).then(function (vehicleUpdated) {
                                            if (vehicleUpdated) {
                                              res.json({
                                                success: true,
                                                message:
                                                  'New Device replace successfully...',
                                              });
                                            } else {
                                              res.json({
                                                success: false,
                                                message:
                                                  'Device Vehice not replace...',
                                              });
                                            }
                                          });
                                        } else {
                                          res.json({
                                            success: true,
                                            message:
                                              'New Device replace successfully...',
                                          });
                                        }
                                      });
                                    } else {
                                      res.json({
                                        success: false,
                                        message:
                                          'New GPS Device not updated...',
                                      });
                                    }
                                  });
                                } else {
                                  res.json({
                                    success: false,
                                    message: 'Old GPS Device not updated...',
                                  });
                                }
                              });
                            } else {
                              res.json({
                                success: false,
                                message: 'New GPS Device not exist...',
                              });
                            }
                          });
                        } else {
                          res.json({
                            success: false,
                            message: 'Old GPS Device not exist...',
                          });
                        }
                      });
                      // } else {
                      //     res.json({ success: false, message: " Licence Device not replace..." })
                      // }
                    });
                  } else {
                    res.json({
                      success: false,
                      message: 'Device not replace successfully...',
                    });
                  }
                });
              } else {
                res.json({
                  success: false,
                  message: 'New Device not exist...',
                });
              }
            });
          } else {
            res.json({ success: false, message: 'Old Device not exist...' });
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

module.exports = router;
