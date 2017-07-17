var express = require('express'),
    router = express.Router();
//var app = express();
// var fs = require('fs');
//var formidable = require('formidable');

//Tables
app.use(express.static(__dirname + '/../MediaUploads'));
var User = models.tbluserinformation;
var Media = models.tblmediamgmt;
//End of Tables

function GetUserNameFromDate() {
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

router.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/../MediaUploads';
    var FileName = [];
    var AuthorName = '';

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];

    //file upload path
    form.parse(req, function(err, fields, files) {
        // console.log(err)
        // console.log(fields)
        // console.log(files)
        //you can get fields here
    });
    form.on('fileBegin', function(name, file) {
        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetUserNameFromDate();

        file.path = form.uploadDir + "/" + NewName + ext;
        // file.path = form.uploadDir + "/" + file.name;
        FileName.push(NewName + ext);
        AuthorName = name;

        //modify file path
    });
    form.on('end', function() {
        var i = 0;
        //set Parameter
        req.query['permission'] = "Added";

        var obj = {};
        obj.headers = req.headers;
        obj.query = req.query;

        funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
            var AccessPermission = responseAccessPermission.success;
            if (AccessPermission) {

                function uploader(i) {
                    if (i < FileName.length) {

                        var objMedia = {
                            FileName: FileName[i],
                            Author: AuthorName,
                            Caption: null,
                            AltText: null,
                            Description: null,
                            Name: FileName[i].substring(0, FileName[i].indexOf('.')),
                        };

                        Media.findOrCreate({ where: { FileName: objMedia.FileName }, defaults: objMedia }).then(function(response) {

                            if ((i + 1) == FileName.length) {
                                res.json({ success: true, data: response, message: "Images Uploaded Successfully..." });
                            } else {
                                uploader(i + 1);
                            };

                        })
                    }
                }
                uploader(i);
                if (FileName.length == 0) {
                    res.json({ success: false, message: "Please Select atleast One File..." });
                };
            } else {
                res.json(NoAccessPermission);
            }
        });
        // res.sendStatus(200);
        //when finish all process    
    });
});

router.post('/uploadPdfFromPost', function(req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/../MediaUploads';
    var FileName = [];
    var AuthorName = '';

    //file upload path
    form.parse(req, function(err, fields, files) {});
    form.on('fileBegin', function(name, file) {
        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetUserNameFromDate();

        file.path = form.uploadDir + "/" + NewName + ext;
        FileName.push(NewName + ext);
        AuthorName = name;
    });
    form.on('end', function() {
        var i = 0;

        function uploader(i) {
            if (i < FileName.length) {

                var objMedia = {
                    FileName: FileName[i],
                    Author: AuthorName,
                    Caption: null,
                    AltText: null,
                    Description: null,
                    Name: FileName[i].substring(0, FileName[i].indexOf('.')),
                };
                //Set Parameter for User Permission
                req.query['tablename'] = req.headers['x-requested-with'];
                req.query['permission'] = "Added";

                var obj = {};
                obj.headers = req.headers;
                obj.query = req.query;

                funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
                    var AccessPermission = responseAccessPermission.success;
                    if (AccessPermission) {
                        Media.findOrCreate({ where: { FileName: objMedia.FileName }, defaults: objMedia }).then(function(response) {

                            if ((i + 1) == FileName.length) {
                                res.json({ success: true, data: response, message: "File Uploaded Successfully..." });
                            } else {
                                uploader(i + 1);
                            };

                        })
                    } else {
                        res.json(NoAccessPermission);
                    }
                });
            }
        }
        uploader(i);
        if (FileName.length == 0) {
            res.json({ success: false, message: "Please Select atleast One File..." });
        };
        // res.sendStatus(200);
        //when finish all process    
    });
});



router.get('/GetAllDynamicMedia', function(req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search.value;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};
    if (objSearch != null && objSearch != '') {
        search['$or'] = [];

        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;
                var obj = new Object();
                obj[columnName] = { $like: '%' + objSearch + '%' };
                search['$or'].push(obj);
            };
        };
        // search['$or'].push({ FileName: { $like: '%' + objSearch + '%' } });
        // search['$or'].push({ Author: { $like: '%' + objSearch + '%' } });
        // search['Author'] = { $like: '%' + objSearch + '%' };
    }

    Media.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length)

    }).then(function(response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetAllMedia', function(req, res) {
    Media.findAll().then(function(response) {
        res.json(response);
    }).catch(function(error) {
        res.json(error);
    })
})

router.get('/GetMediaById', function(req, res) {
    Media.findOne({ where: { id: req.query.idMedia } }).then(function(response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.get('/CreateMedia', jsonParser, function(req, res) {
    objMedia = req.body;
    objHeader = req.headers;
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
            if (UserExist != null) {

                Media.findOrCreate({ where: { FileName: objMedia.FileName }, defaults: objMedia }).then(function(response) {
                    if ((response[1])) {
                        funAuditLog.CreateAuditLog('CreateMedia', UserExist.username , 'Create Media');
                        res.json("Media created successfully...");
                    } else {
                        res.json("Media is already Exist...");
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

router.post('/UpdateMedia', jsonParser, function(req, res) {
    objMedia = req.body;
    objHeader = req.headers;
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    //set Parameter
    req.query['permission'] = "Modified";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            var token = getToken(objHeader);
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
                    if (UserExist != null) {
                        Media.update(objMedia, { where: { id: objMedia.id } }).then(function(response) {
                            if (response[0]) {
                                funAuditLog.CreateAuditLog('UpdateMedia', UserExist.username , 'Update Media');
                                res.json({ success: true, message: "Media updated successfully...", data: response });
                            } else {
                                res.json({ success: false, message: "Media not Found...", data: response });
                            }
                        })
                    } else {
                        res.json(InvalidToken);
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        } else {
            res.json(NoAccessPermission);
        }
    });
});

router.get('/DeleteMedia', function(req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    req.query['permission'] = "Deleted";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function(responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function(UserExist) {
                    if (UserExist != null) {
                        models.product_picture_mapping.findOne({ where: { PictureId: req.query.idMedia } }).then(function(response) {
                            if (response != null) {
                                res.json({ success: false, message: "This Record Can't Deleted, It Contain References to other data...", data: response });
                            } else {
                                Media.destroy({ where: { id: req.query.idMedia } }).then(function(response) {
                                    if (response) {
                                        // fs.access('MediaUploads/' + req.query.filename, fs.F_OK, function(err) {
                                        //     if (!err) {
                                        //         // Do something
                                        //         fs.unlink('MediaUploads/' + req.query.filename);
                                        //     }
                                        // });
                                        var oldFile = __dirname + '/../MediaUploads/' + req.query.filename;
                                        fs.exists(oldFile, function(exists) {
                                            if (exists) {
                                                fs.unlink(oldFile);
                                            }
                                        });
                                        funAuditLog.CreateAuditLog('DeleteMedia', UserExist.username , 'Delete Media');
                                        res.json({ success: true, message: "Media deleted successfully...", data: response });
                                    } else {
                                        res.json(RecordNotFound);
                                    }
                                })
                            }
                        })
                    } else {
                        res.json(InvalidToken);
                    }
                })
            } else {
                res.json(InvalidToken);
            }
        } else {
            res.json(NoAccessPermission);
        }
    });
});

module.exports = router
