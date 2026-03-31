//Tables
var router = express.Router();
var User = models.tbluserinformation;
var PetTracking = models.tbldevicetracking;
var PetGPS = models.tblgpsscanner;
app.use(express.static(__dirname + '/../MediaUploads'));
//End of Tables

router.get('/GetAllPetTracking', function(req, res) {
    PetTracking.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {

        res.json(error);
    })
})

router.get('/GetPetTrackingById', function(req, res) {
    PetTracking.findOne({
        where: {
            id: req.query.idPetTracking
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

router.post('/SavePetTracking', jsonParser, function(req, res) {
    objPetTracking = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                if (objPetTracking.id == 0) {
                    PetTracking.create(objPetTracking).then(function(response) {
                        funAuditLog.CreateAuditLog('SavePetTracking', UserExist.username, 'Create Pet Tracking');
                        res.json({
                            success: true,
                            message: "Pet Tracking created successfully...",
                            data: response
                        });
                    })
                } else {
                    PetTracking.update(objPetTracking, {
                        where: {
                            id: objPetTracking.id
                        }
                    }).then(function(response) {
                        funAuditLog.CreateAuditLog('SavePetTracking', UserExist.username, 'Update Pet Tracking');
                        res.json({
                            success: true,
                            message: "Pet Tracking updated successfully...",
                            data: response
                        });
                    })
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

router.get('/DeletePetTracking', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({
            where: {
                username: decoded.username,
                password: decoded.password
            }
        }).then(function(UserExist) {
            if (UserExist != null) {
                PetTracking.destroy({
                    where: {
                        id: req.query.idPetTracking
                    }
                }).then(function(response) {
                    if (response) {
                        funAuditLog.CreateAuditLog('DeletePetTracking', UserExist.username, 'Delete Pet Tracking');
                        res.json({
                            success: true,
                            message: "Pet Tracking deleted successfully...",
                            data: response
                        });
                    } else {
                        res.json(RecordNotFound);
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
});

//Import Pet Adventure
router.post('/ImportPetAdventures', jsonParser, function(req, res) {

    var form = new formidable.IncomingForm();
    var FileName = [];
    var AuthorName = '';

    form.uploadDir = __dirname + '/../MediaUploads/FileUpload';
    
    var filePath = '';

    form.parse(req, function(err, fields, files) {});
    form.on('fileBegin', function(name, file) {
        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetFileNameFromDate();

        file.path = form.uploadDir + "/" + NewName + ext;
        FileName.push(NewName + ext);
        AuthorName = name;
        filePath = form.uploadDir + '/' + NewName + ext;
    });

    form.on('end', function() {
        var fs = require('fs');
        var array = fs.readFileSync(filePath).toString().split("\n");

        function ListData(i) {
            if (array.length > 0) {
                var objData = array[i].toString().split(",");

                if (objData != '' && objData != null) {
                    var day = parseInt(objData[3].substring(4, 6));
                    var month = parseInt(objData[3].substring(2, 4));
                    var year = parseInt("20" + objData[3].substring(0, 2));
                    var hour = parseInt(objData[4].substring(0, 2));
                    var min = parseInt(objData[4].substring(2, 4));
                    var sec = parseInt(objData[4].substring(4, 6));
                    var GPSDateTime = ("0000" + year.toString()).slice(-4) + "-" + ("00" + month.toString()).slice(-2) + "-" + ("00" + day.toString()).slice(-2) + " " + ("00" + hour.toString()).slice(-2) + ":" + ("00" + min.toString()).slice(-2) + ":" + ("00" + sec.toString()).slice(-2);
                    
                    var objPetGPS = new Object();
                    objPetGPS.Datetime = GPSDateTime;
                    if (objData[7] == 'E') {
                        objPetGPS.Latitude = "-" + objData[6];
                    } else {
                        objPetGPS.Latitude = objData[6];
                    };
                    if (objData[9] == 'W') {
                        objPetGPS.Longitude = "-" + objData[8];
                    } else {
                        objPetGPS.Longitude = objData[8];
                    }
                    objPetGPS.GPSPositioning = objData[5];
                    objPetGPS.Speed = objData[11];
                    objPetGPS.Direction = objData[10];
                    objPetGPS.Status = '00000000';
                    objPetGPS.ReservedSign = 'L';
                    objPetGPS.ReservedSelection = '00000000';
                    objPetGPS.DeviceId = objData[0];
                    objPetGPS.IsAdvanture = 1;
                    // console.log(objPetGPS.DeviceId)

                    PetGPS.findOrCreate({
                        where: {
                            $and: [{
                                Datetime: objPetGPS.Datetime
                            }, {
                                DeviceId: objPetGPS.DeviceId
                            }]
                        },
                        defaults: objPetGPS
                    }).then(function(response) {
                        // console.log(response)
                        if (i == (array.length - 1)) {
                            res.json({ success: true, data: "File Import successfully..." });
                        } else {
                            ListData(i + 1);
                        }
                    })
                } else {
                    res.json({ success: true, data: "File Import successfully..." });
                }
            } else {
                res.json({ success: true, data: "File Import successfully..." });
            }
        }

        ListData(0);
    });
})

function GetFileNameFromDate() {
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();

    var seconds = d.getSeconds();
    var minutes = d.getMinutes();
    var hour = d.getHours();

    var milisec = d.getMilliseconds();

    return curr_year.toString() + curr_month.toString() + curr_date.toString() + hour.toString() + minutes.toString() + seconds.toString() + milisec.toString();
}

//End of Import Pet Adventure

module.exports = router