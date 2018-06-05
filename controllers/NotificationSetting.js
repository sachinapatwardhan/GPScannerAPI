var router = express.Router();
var Notification = models.tblnotificationmgmt;
var NotificationSetting = models.tblnotificationsetting;
var User = models.tbluserinformation;
var Commonfunction = require('./common.js');


router.get('/GetAllNotification', function(req, res) {
    Notification.findAll({
        where: { IsActive: true },
        order: [
            ['Notification', 'ASC']
        ]
    }).then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    });
})

router.get('/GetAllNotificationSettingById', function(req, res) {
    NotificationSetting.findAll({
        where: { idUser: req.query.idUser }
    }).then(function(response) {
        if (response.length == 0) {
            Notification.findAll({
                where: { IsActive: true },
                order: [
                    ['Notification', 'ASC']
                ]
            }).then(function(response) {
                if (response.length > 0) {
                    function AddNotification(i) {
                        if (i < response.length) {
                            var objNotification = new Object();
                            objNotification.idNotification = response[i].id;
                            objNotification.idUser = req.query.idUser;
                            objNotification.IsNotificationOn = true;
                            NotificationSetting.create(objNotification).then(function(resUserInRole) {
                                AddNotification(i + 1);
                            })
                        } else {
                            NotificationSetting.findAll({
                                where: { idUser: req.query.idUser }
                            }).then(function(response) {
                                res.json(response);
                            })
                        }
                    }
                    AddNotification(0);
                } else {
                    callback({
                        success: false,
                        message: "Notification Setting not Added Successfully..."
                    });
                }
            })
        } else {
            res.json(response);
        }
    }).catch(function(error) {
        res.json(error);
    });
})

router.get('/ChangeMainNotification', function(req, res) {
    connection.query("UPDATE tbluserinformation SET Notification = " + req.query.IsNotification + " WHERE id = " + req.query.idUser, function(err, resUpdate, fields) {
        UpdateUserSettingInRedisServer(req.query.idUser);
        res.json(resUpdate);
    })
})


function UpdateUserSettingInRedisServer(idUser) {
    connection.query("Select * from tblvehicle  WHERE iduser = " + idUser, function(err, response, fields) {
        for (var index = 0; index < response.length; index++) {
            var obj = response[index];
            //Update User Data For in Redis Server
            Commonfunction.UpdateVehicleRedis(obj.deviceid, 'User');
        }
    })
}

router.post('/ChangeNotificationSetting', jsonParser, function(req, res) {
    objSetting = req.body;
    NotificationSetting.findOne({ where: { idNotification: objSetting.idNotification, idUser: objSetting.idUser }, defaults: objSetting }).then(function(objSettingExist) {
        if (objSettingExist != null) {
            objSetting.id = objSettingExist.id;
            NotificationSetting.update(objSetting, { where: { id: objSetting.id, idNotification: objSetting.idNotification } }).then(function(response) {
                if (response[0]) {
                    UpdateUserSettingInRedisServer(objSetting.idUser)
                        // funAuditLog.CreateAuditLog('ChangePermission', UserExist.username, 'Update User Permission');
                    res.json({ success: true, message: "Notification Setting updated successfully...", data: response });
                }
            })
        } else {
            NotificationSetting.create(objSetting).then(function(response) {
                // funAuditLog.CreateAuditLog('ChangePermission', UserExist.username, 'Create User Permission');
                res.json({ success: true, message: "Notification Setting created successfully...", data: response });
            })
        }
    })
})


module.exports = router