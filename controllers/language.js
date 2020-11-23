//Tables
var router = express.Router();
var User = models.tbluserinformation;
var Language = models.language;
var LanguageInCountry = models.tbllanguageincountry;

//End of Tables

router.get('/GetAllLanguage', function (req, res) {
    Language.findAll().then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})


router.get('/GetAllPublishLanguage', function (req, res) {
    Language.hasMany(LanguageInCountry, {
        foreignKey: {
            name: 'IdLanguage',
            allowNull: false
        }
    });
    Language.findAll({
        where: { Published: true },
        include: [{
            model: LanguageInCountry,
            where: {
                $or: [{ Country: req.query.Country }, { Country: 'All' }]
            }
        }],
        order: ['DisplayOrder']
    }).then(function (response) {
        res.json(response);
    }).catch(function (error) {
        res.json(error);
    })
})

router.get('/GetLanguageById', function (req, res) {
    Language.findOne({ where: { Id: req.query.idLanguage } }).then(function (response) {
        if (response != null) {
            res.json({ success: true, message: "Record found...", data: response });
        } else {
            res.json({ success: false, message: "Record not found...", data: response });
        }
    })
})

router.get('/GetLangageCulture', function (req, res) {
    var allCountryCodes = CountryLanguage.getLanguages();
    var culturename = [];
    for (var i = 0; i < allCountryCodes.length; i++) {
        if (allCountryCodes[i].langCultureMs) {
            allCountryCodes[i].langCultureMs.forEach(function (locale) {
                culturename.push(locale.langCultureName);
            })
        };
    };

    res.json(culturename);
})




router.post('/SaveLanguage', jsonParser, function (req, res) {
    objLanguage = req.body;
    objHeader = req.headers;

    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    var token = getToken(objHeader);
    if (token) {
        var decoded = jwt.decode(token, TokenKey);
        User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
            if (UserExist != null) {
                if (objLanguage.Id == 0) {
                    //set Parameter
                    req.query['permission'] = "Added";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            Language.findOrCreate({ where: { Name: objLanguage.Name }, defaults: objLanguage }).then(function (response) {
                                if ((response[1])) {
                                    funAuditLog.CreateAuditLog('SaveLanguage', UserExist.username, 'Create Language');
                                    res.json({ success: true, message: "Language created successfully...", data: response });
                                } else {
                                    res.json({ success: false, message: "Language is already Exist...", data: response });
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                } else {
                    //set Parameter
                    req.query['permission'] = "Modified";

                    var obj = {};
                    obj.headers = req.headers;
                    obj.query = req.query;

                    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
                        var AccessPermission = responseAccessPermission.success;
                        if (AccessPermission) {
                            Language.findOne({ where: { Name: objLanguage.Name }, defaults: objLanguage }).then(function (objLanguageExist) {
                                if (objLanguageExist != null && objLanguage.Id != objLanguageExist.Id) {
                                    res.json({ success: false, message: "Language is already Exist...", data: objLanguageExist });
                                } else {
                                    Language.update(objLanguage, { where: { Id: objLanguage.Id } }).then(function (response) {
                                        if (response[0]) {
                                            funAuditLog.CreateAuditLog('SaveLanguage', UserExist.username, 'Update Language');
                                            res.json({ success: true, message: "Language updated successfully...", data: response });
                                        }
                                    })
                                }
                            })
                        } else {
                            res.json(NoAccessPermission);
                        }
                    });
                }
            } else {
                res.json(InvalidToken);
            }
        })
    } else {
        res.json(InvalidToken);
    }
})

router.get('/DeleteLanguage', function (req, res) {
    objHeader = req.headers;
    var token = getToken(objHeader);
    //Set Parameter for User Permission
    req.query['tablename'] = req.headers['x-requested-with'];
    req.query['permission'] = "Deleted";

    var obj = {};
    obj.headers = req.headers;
    obj.query = req.query;

    funAccessPermission.CheckUserAccessPermission(obj, function (responseAccessPermission) {
        var AccessPermission = responseAccessPermission.success;
        if (AccessPermission) {
            if (token) {
                var decoded = jwt.decode(token, TokenKey);
                User.findOne({ where: { username: decoded.username, password: decoded.password } }).then(function (UserExist) {
                    if (UserExist != null) {

                        Language.findOne({ where: { Id: req.query.idLanguage } }).then(function (response1) {
                            if (response1 != null) {
                                if (response1.FlagImageFileName != '' && response1.FlagImageFileName != null) {
                                    var oldFile = __dirname + '/../MediaUploads/' + response1.FlagImageFileName;
                                    console.log(oldFile)
                                    fs.exists(oldFile, function (exists) {
                                        if (exists) {
                                            fs.unlink(oldFile);
                                        }
                                    });
                                }
                                Language.destroy({ where: { Id: req.query.idLanguage } }).then(function (response) {
                                    if (response) {
                                        funAuditLog.CreateAuditLog('DeleteLanguage', UserExist.username, 'Delete Language');
                                        res.json({ success: true, message: "Language deleted successfully...", data: response });
                                    } else {
                                        res.json({ success: false, message: "Requested Record not Exist....", data: response });
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

router.post('/uploadImage', function (req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/../MediaUploads';
    var FileName = [];
    var lstUser = [];




    //file upload path
    form.parse(req, function (err, fields, files) {
        //you can get fields here
    });
    form.on('fileBegin', function (name, file) {
        var ext = file.name.substring(file.name.indexOf('.'), file.name.length);
        var NewName = GetUserNameFromDate();
        if (ext.indexOf('?') > -1) {
            ext = ext.substring(0, ext.indexOf('?'));
        };

        file.path = form.uploadDir + "/" + NewName + ext;
        FileName.push(NewName + ext);
        lstUser.push(name);

        //modify file path
    });
    form.on('end', function () {
        var i = 0;

        function uploader(i) {
            if (i < FileName.length) {
                var Id = parseInt(lstUser[i]);
                Language.findOne({ where: { Id: Id } }).then(function (response) {
                    if (response != null) {
                        //  if (req.query.UserType == 'Owner') {
                        //      if (response.OwnerImage != '' && response.OwnerImage != null) {
                        //          var oldFile = __dirname + '/../MediaUploads/UserUpload/' + response.OwnerImage;
                        //          fs.exists(oldFile, function(exists) {
                        //              if (exists) {
                        //                  fs.unlink(oldFile);
                        //              }
                        //          });
                        //      };
                        //      response.updateAttributes({ OwnerImage: FileName[i] }).then(function(resUpdate) {
                        //          if ((i + 1) == FileName.length) {
                        //              res.json({ success: true, message: "Images Uploaded Successfully...", data: FileName[i] });
                        //          } else {
                        //              uploader(i + 1);
                        //          };
                        //      })
                        //  } else {
                        if (response.FlagImageFileName != '' && response.FlagImageFileName != null) {
                            var oldFile = __dirname + '/../MediaUploads/' + response.FlagImageFileName;
                            fs.exists(oldFile, function (exists) {
                                if (exists) {
                                    fs.unlink(oldFile);
                                }
                            });
                        };
                        response.updateAttributes({ FlagImageFileName: FileName[i] }).then(function (resUpdate) {
                            if ((i + 1) == FileName.length) {
                                res.json({ success: true, message: "Images Uploaded Successfully...", data: FileName[i] });
                            } else {
                                uploader(i + 1);
                            };
                        })
                        //  }
                    }
                })
            }
        }
        uploader(i);
        if (FileName.length == 0) {
            res.json({ success: false, message: "Please Select atleast One File..." });
        }
        // res.sendStatus(200);
        //when finish all process
    });
});


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

router.get('/GetMobileLanguageData', function (req, res) {
    // var translations = {
    //         "en-GB": {
    //             "Email / Mobile": "Email / Mobile",
    //             "Password": "Password",
    //             "Remember Me": "Remember Me",
    //             "Forgot Password": "Forgot Password",
    //             "Login": "Login",
    //             "Sign Up": "Sign Up",
    //             "About Us": "About Us",
    //             "Email": "Email",
    //             "Required Email Message": "Required Email Message",
    //             "Valid Email Message": "Valid Email Message",
    //             "Reset": "Reset",
    //             "Back to Login": "Back to Login",
    //             "Sign Up": "Sign Up",
    //             "Email": "Email",
    //             "Required Email Message": "Required Email Message",
    //             "Valid Email Message": "Valid Email Message",
    //             "Mobile": "Mobile",
    //             "Please Enter Mobile No": "Please Enter Mobile No",
    //             "Please Enter Valid Mobile No": "Please Enter Valid Mobile No",
    //             "Required Password Message": "Required Password Message",
    //             "Please Confirm Your Password": "Please Confirm Your Password",
    //             "Sign Up": "Sign Up",
    //             "Back to Login": "Back to Login",
    //             "Search Country": "Search Country",
    //             "No Country Found": "No Country Found",
    //             "HOME": "HOME",
    //             "Add Device": "Add Device",
    //             "IMEI": "IMEI",
    //             "Type": "Type",
    //             "Map Type": "Map Type",
    //             "Default": "Default",
    //             "Terrain": "Terrain",
    //             "Address.": "Address.",
    //             "No Location Found": "No Location Found",
    //             "Map Type": "Map Type",
    //             "Default": "Default",
    //             "Terrain": "Terrain",
    //             "Setellite": "Setellite",
    //             "Engine ON": "Engine ON",
    //             "Engine OFF": "Engine OFF",
    //             "Address.": "Address.",
    //             "Speed": "Speed",
    //             "Slow": "Slow",
    //             "Medium": "Medium",
    //             "Fast": "Fast",
    //             "Mileage": "Mileage",
    //             "Average Speed": "Average Speed",
    //             "Total Time": "Total Time",
    //             "No Street View Found": "No Street View Found",
    //             "Trip Info": "Trip Info",
    //             "No Trip Info Found": "No Trip Info Found",
    //             "Device ID": "Device ID",
    //             "Time": "Time",
    //             "Total iginition No.": "Total iginition No.",
    //             "Total driving time": "Total driving time",
    //             "Total idle time": "Total idle time",
    //             "Average hot start time": "Average hot start time",
    //             "Average speed": "Average speed",
    //             "History highest speed": "History highest speed",
    //             "History highest rotation": "History highest rotation",
    //             "Total Harsh acceleration No.": "Total Harsh acceleration No.",
    //             "Total Harsh brake No.": "Total Harsh brake No.",
    //             "Select History Date": "Select History Date",
    //             "From": "From",
    //             "To": "To",
    //             "No Address Found": "No Address Found",
    //             "Start": "Start",
    //             "Select History Date": "Select History Date",
    //             "End": "End",
    //             "From": "From",
    //             "time": "time",
    //             "No History Found": "No History Found",
    //             "Notification": "Notification",
    //             "Engine On": "Engine On",
    //             "Door Open": "Door Open",
    //             "Low Bettry": "Low Bettry",
    //             "Over Speed": "Over Speed",
    //             "Movement": "Movement",
    //             "ence IN": "ence IN",
    //             "Fence OUT": "Fence OUT",
    //             "Vibration": "Vibration",
    //             "External Power Cut": "External Power Cut",
    //             "Original Triggering": "Original Triggering",
    //             "Line Broken": "Line Broken",
    //             "Veer Report": "Veer Report",
    //             "Fuel Driving": "Fuel Driving",
    //             "Crash": "Crash",
    //             "Acceleration": "Acceleration",
    //             "Fuel Loss": "Fuel Loss",
    //             "No Notifications Found": "No Notifications Found",
    //             "Share Device": "Share Device",
    //             "No Shared User Found": "No Shared User Found",
    //             "Start Sharing": "Start Sharing",
    //             "Add": "Add",
    //             "Save Fence": "Save Fence",
    //             "Update Fence": "Update Fence",
    //             "Vehicle No.": "Vehicle No.",
    //             "Vehicle Type": "Vehicle Type",
    //             "Select Vehicle Type": "Select Vehicle Type",
    //             "Max Speed": "Max Speed",
    //             "range 0 to 200 km": "range 0 to 200 km",
    //             "Arm Settings": "Arm Settings",
    //             "Disarm": "Disarm",
    //             "Auto": "Auto",
    //             "Arm": "Arm",
    //             "Expiry Date": "Expiry Date",
    //             "Edit Profile": "Edit Profile",
    //             "Change Password": "Change Password",
    //             "Log Out": "Log Out",
    //             "Update Profile": "Update Profile",
    //             "Name": "Name",
    //             "Email": "Email",
    //             "Mobile": "Mobile",
    //             "Update": "Update",
    //             "Change Password": "Change Password",
    //             "Old Password": "Old Password",
    //             "Please Enter Old Password": "Please Enter Old Password",
    //             "New Password": "New Password",
    //             "Valid Password Message": "Valid Password Message",
    //             "Confirm New Password": "Confirm New Password",
    //             "Submit": "Submit",
    //             "Version": "Version",
    //             "Save Favorite Place": "Save Favorite Place",
    //             "Update Favorite Place": "Update Favorite Place",
    //             "Start Location": "Start Location",
    //             "End Location": "End Location",
    //             "No Address Found": "No Address Found",
    //             "Distance": "Distance",
    //             "Duration": "Duration",
    //             "No Favorite Places Found": "No Favorite Places Found",
    //             "Add New Favorite Place": "Add New Favorite Place",
    //             "Favorite Place List": "Favorite Place List",
    //             "Locate": "Locate",
    //             "Fence": "Fence",
    //             "History": "History",
    //             "Settings": "Settings",
    //             "No Vehicle Deatils Found": "No Vehicle Deatils Found",
    //             "Home": "Home",
    //             "Device List": "Device List",
    //             "Notification": "Notification",
    //             "Me": "Me",
    //             "Select Date": "Select Date",
    //             "No History Found": "No History Found",
    //             "No Vehicle Found": "No Vehicle Found",
    //             "Vehicle No": "Vehicle No",
    //             "IMEI No.": "IMEI No.",
    //             "Scan QR Code": "Scan QR Code",
    //             "Vehicle Type": "Vehicle Type",
    //             "Select Vehicel Type": "Select Vehicel Type",
    //             "IMEI should not less than 15 digit": "IMEI should not less than 15 digit",
    //             "IMEI should not greater than 15 digit": "IMEI should not greater than 15 digit",
    //             "IMEI is not digit": "IMEI is not digit",
    //             "Vehicle No.": "Vehicle No.",
    //             "IMEI No.": "IMEI No.",
    //             "Scan QR Code": "Scan QR Code",
    //             "Vehicle Type": "Vehicle Type",
    //             "Add New Device": "Add New Device",
    //             "Select Vehicel Type": "Select Vehicel Type",
    //             "Add Device": "Add Device",
    //             "Vehicle No. is Empty": "Vehicle No. is Empty",
    //             "IMEI No. is Empty": "IMEI No. is Empty",
    //             "Vehicle Added Successfully": "Vehicle Added Successfully",
    //             "Share Device": "Share Device",
    //             "Share Enable": "Share Enable",
    //             "Device Id": "Device Id",
    //             "Changed Successfully": "Changed Successfully",
    //             "Are You Sure to Delete this Vehicle": "Are You Sure to Delete this Vehicle",
    //             "Ok": "Ok",
    //             "Cancel": "Cancel",
    //             "Please Enter Fence Name": "Please Enter Fence Name",
    //             "No Location Found": "No Location Found",
    //             "Location update need take 2 to 3 minutes if the vehicle is not under open sky area": "Location update need take 2 to 3 minutes if the vehicle is not under open sky area",
    //             "No Street View Found": "No Street View Found",
    //             "Parking Time": "Parking Time",
    //             "Address": "Address",
    //             "No History Found": "No History Found",
    //             "Login Failed!": "Login Failed!",
    //             "Invalid Email or Password": "Invalid Email or Password",
    //             "Your profile has been updated successfully.": "Your profile has been updated successfully.",
    //             "About App Currently Not Available": "About App Currently Not Available",
    //             "Notifications cleared": "Notifications cleared",
    //             "Oops! Notifications not cleared": "Oops! Notifications not cleared",
    //             "Please Enter email Address of the person you want to Share Vehicle With.": "Please Enter email Address of the person you want to Share Vehicle With.",
    //             "Share Vehicle": "Share Vehicle",
    //             "Invalid Email Address": "Invalid Email Address",
    //             "You Can't Share Your Vehicle to Your Self": "You Can't Share Your Vehicle to Your Self",
    //             "Notification Enabled": "Notification Enabled",
    //             "Notification Disabled": "Notification Disabled",
    //             "Stop Sharing": "Stop Sharing",
    //             "Are you sure to stop sharing device with this user ?": "Are you sure to stop sharing device with this user ?",
    //             "Are you sure to stop sharing device?": "Are you sure to stop sharing device?",
    //             "Enter Valid Mobile Number...": "Enter Valid Mobile Number...",
    //             "Register Successfully": "Register Successfully",
    //             "Registration Failed!": "Registration Failed!",
    //             "New Update Available": "New Update Available",
    //             "Update Now!": "Update Now!",
    //             "Ask Me Later": "Ask Me Later",
    //             "Vehicle created successfully...": "Vehicle created successfully...",
    //             "Vehicle is Not created...": "Vehicle is Not created...",
    //             "Tracker No. is already assign to other Vehicle...": "Tracker No. is already assign to other Vehicle...",
    //             "Vehicle updated successfully...": "Vehicle updated successfully...",
    //             "Vehicle is Not updated...": "Vehicle is Not updated...",
    //             "Invalid Tracker No., Please insert valid Tracker No.": "Invalid Tracker No., Please insert valid Tracker No.",
    //             "Vehicle No. could not save. Try again later.": "Vehicle No. could not save. Try again later.",
    //             "Vehicle No. Save Successfully.": "Vehicle No. Save Successfully.",
    //             "Vehicle deleted successfully": "Vehicle deleted successfully",
    //             "Vehicle deleted successfully": "Vehicle deleted successfully",
    //             "Vehicle No. Save Successfully.": "Vehicle No. Save Successfully.",
    //             "Vehicle No. could not save. Try again later.": "Vehicle No. could not save. Try again later.",
    //             "Vehicle Type Save Successfully.": "Vehicle Type Save Successfully.",
    //             "Vehicle Type could not save. Try again later.": "Vehicle Type could not save. Try again later.",
    //             "Device not connected. Try after 5 minute.": "Device not connected. Try after 5 minute.",
    //             "HeartBeat Interval Settings Save Successfully.": "HeartBeat Interval Settings Save Successfully.",
    //             "HeartBeat Interval Settings could not save. Try again later.": "HeartBeat Interval Settings could not save. Try again later.",
    //             "GPRS Interval Settings for Stop Car Save Successfully.": "GPRS Interval Settings for Stop Car Save Successfully.",
    //             "GPRS Interval Settings for Stop Car could not save. Try again later.": "GPRS Interval Settings for Stop Car could not save. Try again later.",
    //             "GPRS Interval Settings Save Successfully.": "GPRS Interval Settings Save Successfully.",
    //             "GPRS Interval Settings could not save. Try again later.": "GPRS Interval Settings could not save. Try again later.",
    //             "Speed Settings Save Successfully.": "Speed Settings Save Successfully.",
    //             "Speed Settings could not save. Try again later.": "Speed Settings could not save. Try again later.",
    //             "Arm Settings Save Successfully.": "Arm Settings Save Successfully.",
    //             "Arm Settings not Save Successfully.": "Arm Settings not Save Successfully.",
    //             "Arm Settings could not save. Try again later.": "Arm Settings could not save. Try again later.",
    //             "Favorite Place Name updated successfully...": "Favorite Place Name updated successfully...",
    //             "Favorite Place Name not updated...": "Favorite Place Name not updated...",
    //             "Please Enter Favorite Place Name": "Please Enter Favorite Place Name",
    //             "No Route Found": "No Route Found",
    //             "Favorite Place Deleted Successfully...": "Favorite Place Deleted Successfully...",
    //             "Fence Name updated successfully...": "Fence Name updated successfully...",
    //             "Fence Name not updated...": "Fence Name not updated...",
    //             "Please Enter Fence Name": "Please Enter Fence Name",
    //             "Fence Removed successfully...": "Fence Removed successfully...",
    //             "Fence not Removed.": "Fence not Removed.",
    //             "Fence Setting saved successfully.": "Fence Setting saved successfully.",
    //             "Fence Setting not saved successfully. Try after 5 minute.": "Fence Setting not saved successfully. Try after 5 minute.",
    //             "To use this functionality Buy Pettorway Z3 Device": "To use this functionality Buy Pettorway Z3 Device",
    //             "Password sent to your email successfully...": "Password sent to your email successfully...",
    //             "This Email template not found...": "This Email template not found...",
    //             "This system Email not found...": "This system Email not found...",
    //             "This Email not registered with us...": "This Email not registered with us...",
    //             "Password Send Successfully message": "Password Send Successfully message",
    //             "Vehicle Added Successfully": "Vehicle Added Successfully",
    //             "Device not connected. Try after 5 minute.": "Device not connected. Try after 5 minute.",
    //             "Current Location Received Successfully.": "Current Location Received Successfully.",
    //             "Current Location could not Received. Try again later.": "Current Location could not Received. Try again later.",
    //             "Invalid Username or Password...": "Invalid Username or Password...",
    //             "Login Successfully...": "Login Successfully...",
    //             "User updated successfully...": "User updated successfully...",
    //             "New Password contains atleast 2 characters...": "New Password contains atleast 2 characters...",
    //             "Password changed successfully...": "Password changed successfully...",
    //             "Old Password is wrong...": "Old Password is wrong...",
    //             "User is not Exist...": "User is not Exist...",
    //             "Vehicle is already Shared With This User...": "Vehicle is already Shared With This User...",
    //             "Vehicle Shared successfully...": "Vehicle Shared successfully...",
    //             "User is not Exist...": "User is not Exist...",
    //             "Notification Setting could not Changed. Try again later.": "Notification Setting could not Changed. Try again later.",
    //             "Main Notification Setting Changed Successfully.": "Main Notification Setting Changed Successfully.",
    //             "User Removed successfully...": "User Removed successfully...",
    //             "User not Removed.": "User not Removed.",
    //             "User Push notification data updated successfully...": "User Push notification data updated successfully...",
    //             "Requested Record(s) not Found....": "Requested Record(s) not Found....",
    //             "Invalid token...": "Invalid token...",
    //             "No Access Permission...": "No Access Permission...",
    //             "Add New Fence": "Add New Fence",
    //             "Fence List": "Fence List",
    //             "No Fence Found": "No Fence Found",
    //             "Email id.": "Email id.",
    //             "Share": "Share",
    //             "Satellite": "Satellite",
    //             "Locate": "Locate",
    //             "History": "History",
    //             "Logout": "Logout",
    //             "Close": "Close",
    //             "Mo.": "Mo.",
    //             "Confirm Password": "Confirm Password",
    //             "Language": "Language",
    //             "Delete Vehicle": "Delete Vehicle",
    //             "Loading": "Loading",
    //             "Password and Confirm Password does not match": "Password and Confirm Password does not match",
    //             "Please Enter New Password.": "Please Enter New Password.",
    //             "Please Confirm Your Password.": "Please Confirm Your Password.",
    //             "Passwords must be between 2 and 20 characters": "Passwords must be between 2 and 20 characters",
    //         },
    //         "gu-IN": {
    //             "Email / Mobile": "ઇમેઇલ / મોબાઇલ	",
    //             "Password": "પાસવર્ડ	",
    //             "Remember Me": "મને યાદ	",
    //             "Forgot Password": "પાસવર્ડ ભૂલી ગયા	",
    //             "Login": "લૉગિન	",
    //             "Sign Up": "સાઇન અપ	",
    //             "About Us": "અમારા વિશે	",
    //             "Email": "ઇમેઇલ	",
    //             "Required Email Message": "જરૂરી ઇમેઇલ સંદેશ	",
    //             "Valid Email Message": "માન્ય ઇમેઇલ સંદેશ	",
    //             "Reset": "રીસેટ	",
    //             "Back to Login": "પાછા લૉગિન કરવા	",
    //             "Sign Up": "સાઇન અપ	",
    //             "Email": "ઇમેઇલ	",
    //             "Required Email Message": "જરૂરી ઇમેઇલ સંદેશ	",
    //             "Valid Email Message": "માન્ય ઇમેઇલ સંદેશ	",
    //             "Mobile": "મોબાઇલ	",
    //             "Please Enter Mobile No": "કૃપા કરીને દાખલ કરો મોબાઇલ કોઈ	",
    //             "Please Enter Valid Mobile No": "કૃપા કરીને દાખલ કરો માન્ય મોબાઇલ કોઈ	",
    //             "Required Password Message": "જરૂરી પાસવર્ડ સંદેશ	",
    //             "Please Confirm Your Password": "કૃપા કરીને તમારા પાસવર્ડની પુષ્ટિ	",
    //             "Sign Up": "સાઇન અપ	",
    //             "Back to Login": "પાછા લૉગિન કરવા	",
    //             "Search Country": "શોધ દેશ	",
    //             "No Country Found": "કોઈ દેશ મળ્યો નથી	",
    //             "HOME": "ઘર	",
    //             "Add Device": "ઉપકરણ ઉમેરો	",
    //             "IMEI": "IMEI	",
    //             "Type": "પ્રકાર	",
    //             "Map Type": "નકશો પ્રકાર	",
    //             "Default": "ડિફૉલ્ટ	",
    //             "Terrain": "ટેરેઇન	",
    //             "Address.": "સરનામું.	",
    //             "No Location Found": "કોઈ સ્થાન શોધી	",
    //             "Map Type": "નકશો પ્રકાર	",
    //             "Default": "ડિફૉલ્ટ	",
    //             "Terrain": "ટેરેઇન	",
    //             "Setellite": "Setellite	",
    //             "Engine ON": "એન્જિન ચાલૂ",
    //             "Engine OFF": "એન્જિન બંધ",
    //             "Address.": "સરનામું.	",
    //             "Speed": "ઝડપ	",
    //             "Slow": "ધીમો	",
    //             "Medium": "મધ્યમ	",
    //             "Fast": "ફાસ્ટ	",
    //             "Mileage": "માઇલેજ	",
    //             "Average Speed": "સામન્ય ગતિ	",
    //             "Total Time": "કુલ સમય	",
    //             "No Street View Found": "ગલી નુ દૃશ્ય મળ્યું નથી",
    //             "Trip Info": "સહેલની માહિતી	",
    //             "No Trip Info Found": "કોઈ સહેલની માહિતી મળે	",
    //             "Device ID": "ઉપકરણ ID	",
    //             "Time": "સમય	",
    //             "Total iginition No.": "કુલ iginition નં	",
    //             "Total driving time": "કુલ ડ્રાઈવીંગ સમય	",
    //             "Total idle time": "કુલ નિષ્ક્રિય સમય	",
    //             "Average hot start time": "સરેરાશ ગરમ પ્રારંભ સમય	",
    //             "Average speed": "સામન્ય ગતિ	",
    //             "History highest speed": "ઇતિહાસ સર્વોચ્ચ ઝડપ	",
    //             "History highest rotation": "ઇતિહાસ સર્વોચ્ચ પરિભ્રમણ	",
    //             "Total Harsh acceleration No.": "કુલ હર્ષ પ્રવેગક નં	",
    //             "Total Harsh brake No.": "કુલ હર્ષ બ્રેક નં	",
    //             "Select History Date": "પસંદ ઇતિહાસ તારીખ	",
    //             "From": "પ્રતિ	",
    //             "To": "કરો	",
    //             "No Address Found": "કોઈ સરનામું મળે	",
    //             "Start": "શરૂઆત	",
    //             "Select History Date": "પસંદ ઇતિહાસ તારીખ	",
    //             "End": "અંતે	",
    //             "From": "પ્રતિ	",
    //             "time": "સમય	",
    //             "No History Found": "કોઈ ઇતિહાસ મળે	",
    //             "Notification": "સૂચના	",
    //             "Engine On": "એન્જિન પર	",
    //             "Door Open": "દરવાજાને ખોલવા	",
    //             "Low Bettry": "લો Bettry	",
    //             "Over Speed": "ઝડપ સ્કોર	",
    //             "Movement": "ચળવળ	",
    //             "ence IN": "Ence છે	",
    //             "Fence OUT": "ફેંસ આઉટ	",
    //             "Vibration": "કંપન	",
    //             "External Power Cut": "બાહ્ય પાવર કટ	",
    //             "Original Triggering": "મૂળ સર્જાઈ	",
    //             "Line Broken": "રેખા બ્રોકન	",
    //             "Veer Report": "વીર રિપોર્ટ	",
    //             "Fuel Driving": "ફ્યુઅલ ડ્રાઈવિંગ	",
    //             "Crash": "ક્રેશ	",
    //             "Acceleration": "પ્રવેગ	",
    //             "Fuel Loss": "ફ્યુઅલ નુકશાન	",
    //             "No Notifications Found": "કોઈ સૂચનો મળે	",
    //             "Share Device": "ઉપકરણ શેર કરો	",
    //             "No Shared User Found": "કોઈ શેર કરેલ વપરાશકર્તા મળ્યો	",
    //             "Start Sharing": "પ્રારંભ શેરિંગ	",
    //             "Add": "ઉમેરો	",
    //             "Save Fence": "ફેંસ સાચવો	",
    //             "Update Fence": "ફેંસ અપડેટ	",
    //             "Vehicle No.": "વાહન નં	",
    //             "Vehicle Type": "વાહનનો પ્રકાર	",
    //             "Select Vehicle Type": "પસંદ વાહનનો પ્રકાર	",
    //             "Max Speed": "મેક્સ ઝડપ	",
    //             "range 0 to 200 km": "શ્રેણી 0 200 કિમી	",
    //             "Arm Settings": "આર્મ સેટિંગ્સ	",
    //             "Disarm": "નિઃશસ્ત્ર	",
    //             "Auto": "ઓટો	",
    //             "Arm": "આર્મ	",
    //             "Expiry Date": "અંતિમ તારીખ	",
    //             "Edit Profile": "પ્રોફાઇલ સંપાદિત કરો	",
    //             "Change Password": "પાસવર્ડ બદલો	",
    //             "Log Out": "લૉગ આઉટ	",
    //             "Update Profile": "પ્રોફાઇલ અપડેટ કરો	",
    //             "Name": "નામ	",
    //             "Email": "ઇમેઇલ	",
    //             "Mobile": "મોબાઇલ	",
    //             "Update": "અપડેટ	",
    //             "Change Password": "પાસવર્ડ બદલો	",
    //             "Old Password": "જુનો પાસવર્ડ	",
    //             "Please Enter Old Password": "કૃપા કરીને જૂનો પાસવર્ડ દાખલ કરો",
    //             "New Password": "નવો પાસવર્ડ	",
    //             "Valid Password Message": "માન્ય પાસવર્ડ સંદેશ	",
    //             "Confirm New Password": "નવાપાસવર્ડની પુષ્ટી કરો	",
    //             "Submit": "સબમિટ	",
    //             "Version": "આવૃત્તિ	",
    //             "Save Favorite Place": "સાચવો પ્રિય સ્થળ	",
    //             "Update Favorite Place": "અપડેટ પ્રિય સ્થળ	",
    //             "Start Location": "પ્રારંભ સ્થાન	",
    //             "End Location": "અંતે લોકેશન	",
    //             "No Address Found": "કોઈ સરનામું મળે	",
    //             "Distance": "અંતર	",
    //             "Duration": "સમયગાળો	",
    //             "No Favorite Places Found": "કોઈ મનપસંદ સ્થાનો મળ્યાં	",
    //             "Add New Favorite Place": "નવી મનપસંદ સ્થળ ઉમેરો	",
    //             "Favorite Place List": "પ્રિય સ્થળ યાદી	",
    //             "Locate": "શોધો	",
    //             "Fence": "ફેંસ	",
    //             "History": "ઇતિહાસ	",
    //             "Settings": "સેટિંગ્સ	",
    //             "No Vehicle Deatils Found": "કોઈ વાહન Deatils મળે	",
    //             "Home": "ઘર	",
    //             "Device List": "ઉપકરણ સૂચિ	",
    //             "Notification": "સૂચના	",
    //             "Me": "મને	",
    //             "Select Date": "તારીખ પસંદ કરો	",
    //             "No History Found": "કોઈ ઇતિહાસ મળે	",
    //             "No Vehicle Found": "કોઈ વાહન મળે	",
    //             "Vehicle No": "વાહન કોઈ	",
    //             "IMEI No.": "IMEI નંબર	",
    //             "Scan QR Code": "QR કોડ સ્કેન કરો	",
    //             "Vehicle Type": "વાહનનો પ્રકાર	",
    //             "Select Vehicel Type": "પસંદ Vehicel પ્રકાર	",
    //             "IMEI should not less than 15 digit": "IMEI ન જોઈએ 15 કરતાં ઓછી આંકડાના	",
    //             "IMEI should not greater than 15 digit": "IMEI એ 15 અંકથી વધુ ન હોવો જોઈએ",
    //             "IMEI is not digit": "IMEI એ સંખ્યા નથી",
    //             "Vehicle No.": "વાહન નં	",
    //             "IMEI No.": "IMEI નંબર	",
    //             "Scan QR Code": "QR કોડ સ્કેન કરો	",
    //             "Vehicle Type": "વાહનનો પ્રકાર	",
    //             "Add New Device": "નવું ઉપકરણ ઉમેરો	",
    //             "Select Vehicel Type": "પસંદ Vehicel પ્રકાર	",
    //             "Add Device": "ઉપકરણ ઉમેરો	",
    //             "Vehicle No. is Empty": "વાહન નં ખાલી છે	",
    //             "IMEI No. is Empty": "IMEI નંબર ખાલી છે	",
    //             "Vehicle Added Successfully": "વાહન સફળતાપૂર્વક ઉમેરાયું	",
    //             "Share Device": "ઉપકરણ શેર કરો	",
    //             "Share Enable": "શેર સક્ષમ	",
    //             "Device Id": "ઉપકરણ ID	",
    //             "Changed Successfully": "સફળતાપૂર્વક બદલાઈ	",
    //             "Are You Sure to Delete this Vehicle": "તમે આ વાહન કાઢી નાખવા માંગો છો	",
    //             "Ok": "ઠીક છે	",
    //             "Cancel": "રદ કરો	",
    //             "Please Enter Fence Name": "કૃપા કરીને ફેંસ નામ દાખલ કરો	",
    //             "No Location Found": "કોઈ સ્થાન શોધી	",
    //             "Location update need take 2 to 3 minutes if the vehicle is not under open sky area": "સ્થાન અપડેટ 2 થી 3 મિનિટ લેવાની જરૂર જો વાહન ઓપન સ્કાય વિસ્તાર હેઠળ નથી	",
    //             "No Street View Found": "ગલી નુ દૃશ્ય મળ્યું નથી",
    //             "Parking Time": "પાર્કિંગ સમયનો	",
    //             "Address": "સરનામું	",
    //             "No History Found": "કોઈ ઇતિહાસ મળે	",
    //             "Login Failed!": "પ્રવેશ નિષ્ફળ!	",
    //             "Invalid Email or Password": "ઈ મેઈલ અથવા પાસવર્ડ ખોટો છે	",
    //             "Your profile has been updated successfully.": "તમારી પ્રોફાઇલ સફળતાપૂર્વક અપડેટ કરવામાં આવ્યું છે.	",
    //             "About App Currently Not Available": "એપ્લિકેશન હાલમાં ઉપલબ્ધ નથી વિશે	",
    //             "Notifications cleared": "સૂચનાઓ સાફ	",
    //             "Oops! Notifications not cleared": "અરે! સૂચનાઓ સાફ નથી	",
    //             "Please Enter email Address of the person you want to Share Vehicle With.": "કૃપા કરીને તમે જે વ્યક્તિ સાથે વાહન શેર કરવા માંગો છો ઇમેઇલ સરનામું દાખલ કરો. '	",
    //             "Share Vehicle": "શેર વ્હિકલ	",
    //             "Invalid Email Address": "અમાન્ય ઇમેઇલ સરનામું	",
    //             "You Can't Share Your Vehicle to Your Self": "તમે તમારા સ્વ તમારું વાહન શેર કરી શકાતું નથી	",
    //             "Notification Enabled": "સૂચના સક્ષમ	",
    //             "Notification Disabled": "સૂચના અક્ષમ	",
    //             "Stop Sharing": "શેર કરવાનું રોકો	",
    //             "Are you sure to stop sharing device with this user ?": "તમે આ વપરાશકર્તા સાથે શેર ઉપકરણ બંધ કરવા માંગો છો?	",
    //             "Are you sure to stop sharing device?": "જો તમે શેરિંગ ઉપકરણ બંધ કરવા માંગો છો?	",
    //             "Enter Valid Mobile Number...": "માન્ય મોબાઇલ નંબર દાખલ કરો ...	",
    //             "Register Successfully": "સફળતાપૂર્વક નોંધણી	",
    //             "Registration Failed!": "નોંધણી નિષ્ફળ!	",
    //             "New Update Available": "નવું અપડેટ ઉપલબ્ધ	",
    //             "Update Now!": "હવે અપડેટ કરો!	",
    //             "Ask Me Later": "પછી મને પૂછો	",
    //             "Vehicle created successfully...": "વાહન સફળતાપૂર્વક બનાવવામાં આવી ...	",
    //             "Vehicle is Not created...": "વાહન બનાવી છે ...	",
    //             "Tracker No. is already assign to other Vehicle...": "ટ્રેકર નં પહેલેથી અન્ય વાહન સોંપી છે ...	",
    //             "Vehicle updated successfully...": "વાહન સફળતાપૂર્વક અપડેટ ...	",
    //             "Vehicle is Not updated...": "વાહન સુધારી નથી ...	",
    //             "Invalid Tracker No., Please insert valid Tracker No.": "અમાન્ય ટ્રેકર નં માન્ય ટ્રેકર નં સામેલ કૃપા કરીને	",
    //             "Vehicle No. could not save. Try again later.": "વાહન નં સાચવી શક્યા નથી. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો.	",
    //             "Vehicle No. Save Successfully.": "વાહન નં સાચવો સફળ.	",
    //             "Vehicle deleted successfully": "વાહન સફળતાપૂર્વક કાઢી	",
    //             "Vehicle deleted successfully": "વાહન સફળતાપૂર્વક કાઢી	",
    //             "Vehicle No. Save Successfully.": "વાહન નં સાચવો સફળ.	",
    //             "Vehicle No. could not save. Try again later.": "વાહન નં સાચવી શક્યા નથી. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો.	",
    //             "Vehicle Type Save Successfully.": "વાહનનો પ્રકાર સફળતાપૂર્વક સાચવો.	",
    //             "Vehicle Type could not save. Try again later.": "વાહનનો પ્રકાર સાચવી શક્યા નથી. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો.	",
    //             "Device not connected. Try after 5 minute.": "ઉપકરણ સાથે જોડાયેલો નથી. 5 મિનિટ પછી પ્રયાસ કરો.	",
    //             "HeartBeat Interval Settings Save Successfully.": "ધબકારા અંતરાલ સાચવો સેટિંગ્સ સફળતાપૂર્વક.	",
    //             "HeartBeat Interval Settings could not save. Try again later.": "ધબકારા અંતરાલ સેટિંગ્સ સાચવી શકાઈ નથી. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો.	",
    //             "GPRS Interval Settings for Stop Car Save Successfully.": "રોકો કાર સાચવો સફળતાપૂર્વક માટે GPRS અંતરાલ સેટિંગ્સ.	",
    //             "GPRS Interval Settings for Stop Car could not save. Try again later.": "રોકો કાર માટે GPRS અંતરાલ સેટિંગ્સ સાચવી શકાઈ નથી. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો.	",
    //             "GPRS Interval Settings Save Successfully.": "GPRS અંતરાલ સાચવો સેટિંગ્સ સફળતાપૂર્વક.	",
    //             "GPRS Interval Settings could not save. Try again later.": "GPRS અંતરાલ સેટિંગ્સ સાચવી શકાઈ નથી. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો.	",
    //             "Speed Settings Save Successfully.": "ઝડપ સાચવો સેટિંગ્સ સફળતાપૂર્વક.	",
    //             "Speed Settings could not save. Try again later.": "ઝડપ સેટિંગ્સ સાચવી શકાઈ નથી. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો.	",
    //             "Arm Settings Save Successfully.": "આર્મ સાચવો સેટિંગ્સ સફળતાપૂર્વક.	",
    //             "Arm Settings not Save Successfully.": "આર્મ સેટિંગ્સ સફળતાપૂર્વક સાચવી.	",
    //             "Arm Settings could not save. Try again later.": "આર્મ સેટિંગ્સ સાચવી શકાઈ નથી. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો.	",
    //             "Favorite Place Name updated successfully...": "પ્રિય સ્થળ નામ સફળતાપૂર્વક અપડેટ ...	",
    //             "Favorite Place Name not updated...": "પ્રિય સ્થળનું નામ નથી અપડેટ ...	",
    //             "Please Enter Favorite Place Name": "કૃપા કરીને દાખલ પ્રિય સ્થળ નામ	",
    //             "No Route Found": "કોઈ રસ્તો મળ્યો નથી	",
    //             "Favorite Place Deleted Successfully...": "પ્રિય સ્થળ સફળતાપૂર્વક કાઢી નાખ્યું ...	",
    //             "Fence Name updated successfully...": "ફેંસ નામ સફળતાપૂર્વક અપડેટ ...	",
    //             "Fence Name not updated...": "ફેંસ નામ અપડેટ નથી ...	",
    //             "Please Enter Fence Name": "કૃપા કરીને ફેંસ નામ દાખલ કરો	",
    //             "Fence Removed successfully...": "ફેંસ સફળતાપૂર્વક દૂર ...	",
    //             "Fence not Removed.": "ફેંસ દૂર કરાયા નથી.	",
    //             "Fence Setting saved successfully.": "ફેંસ સેટિંગ સફળતાપૂર્વક સાચવવામાં આવ્યાં.	",
    //             "Fence Setting not saved successfully. Try after 5 minute.": "ફેંસ સફળતાપૂર્વક સાચવવામાં આવી ન સેટિંગ. 5 મિનિટ પછી પ્રયાસ કરો.	",
    //             "To use this functionality Buy Pettorway Z3 Device": "આ કાર્યક્ષમતા ખરીદો Pettorway Z3 ઉપકરણ વાપરવા માટે	",
    //             "Password sent to your email successfully...": "પાસવર્ડ સફળતાપૂર્વક તમારા ઇમેઇલ પર મોકલવામાં ...	",
    //             "This Email template not found...": "આ ઇમેઇલ નમૂનો મળી નથી ...	",
    //             "This system Email not found...": "આ સિસ્ટમ ઇમેઇલ મળી નથી ...	",
    //             "This Email not registered with us...": "આ ઇમેઇલ અમારી સાથે રજીસ્ટર નથી ...	",
    //             "Password Send Successfully message": "પાસવર્ડ સફળતાપૂર્વક સંદેશ મોકલો	",
    //             "Vehicle Added Successfully": "વાહન સફળતાપૂર્વક ઉમેરાયું	",
    //             "Device not connected. Try after 5 minute.": "ઉપકરણ સાથે જોડાયેલો નથી. 5 મિનિટ પછી પ્રયાસ કરો.	",
    //             "Current Location Received Successfully.": "વર્તમાન સ્થાન સફળતાપૂર્વક પ્રાપ્ત થઈ. '	",
    //             "Current Location could not Received. Try again later.": "વર્તમાન સ્થાન પ્રાપ્ત કરી શક્યા નથી. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો.	",
    //             "Invalid Username or Password...": "અમાન્ય વપરાશકર્તાનામ અથવા પાસવર્ડ...",
    //             "Login Successfully...": "સફળતાપૂર્વક લૉગિન ...	",
    //             "User updated successfully...": "વપરાશકર્તા સફળતાપૂર્વક અપડેટ ...	",
    //             "New Password contains atleast 2 characters...": "નવો પાસવર્ડ ઓછામાં ઓછા 2 અક્ષરો સમાવે ...	",
    //             "Password changed successfully...": "પાસવર્ડ સફળતાપૂર્વક બદલાઈ ...	",
    //             "Old Password is wrong...": "જુની પાસવર્ડ ખોટો છે ...	",
    //             "User is not Exist...": "વપરાશકર્તા અસ્તિત્વમાં નથી ...	",
    //             "Vehicle is already Shared With This User...": "વાહન પહેલાંથી જ આ વપરાશકર્તા સાથે શેર કરવામાં આવે ...	",
    //             "Vehicle Shared successfully...": "વાહન સફળતાપૂર્વક શેર ...	",
    //             "User is not Exist...": "વપરાશકર્તા અસ્તિત્વમાં નથી ...	",
    //             "Notification Setting could not Changed. Try again later.": "સૂચના સેટિંગ બદલી શક્યાં નથી. કૃપા કરીને પછીથી ફરી પ્રયત્ન કરો.	",
    //             "Main Notification Setting Changed Successfully.": "મુખ્ય સૂચના સેટિંગ સફળતાપૂર્વક બદલ્યો.	",
    //             "User Removed successfully...": "વપરાશકર્તાને સફળતાપૂર્વક દૂર કર્યા ...	",
    //             "User not Removed.": "વપરાશકર્તાને દૂર નથી.	",
    //             "User Push notification data updated successfully...": "વપરાશકર્તા પુશ સૂચના માહિતી સફળતાપૂર્વક અપડેટ ...	",
    //             "Requested Record(s) not Found....": "વિનંતી રેકોર્ડ (ઓ) મળી નથી ....	",
    //             "Invalid token...": "અમાન્ય ટોકન ...	",
    //             "No Access Permission...": "કોઈ ઍક્સેસ પરવાનગી ...	",
    //             "Add New Fence": "નવી વાડ ઉમેરો",
    //             "Fence List": "ફેંસ સૂચિ",
    //             "No Fence Found": "કોઈ વાડ મળ્યો નથી",
    //             "Email id.": "ઇમેઇલ આઈડી",
    //             "Share": "શેર",
    //             "Satellite": "ઉપગ્રહ",
    //             "Locate": "શોધો",
    //             "History": "ઇતિહાસ",
    //             "Logout": "લૉગ આઉટ",
    //             "Close": "બંધ",
    //             "Mo.": "મો.",
    //             "Confirm Password": "પાસવર્ડની પુષ્ટિ કરો",
    //             "Language": "ભાષા",
    //             "Delete Vehicle": "વાહન કાઢી નાખો",
    //             "Loading": "લોડ કરી રહ્યું છે",
    //             "Password and Confirm Password does not match": "પાસવર્ડ અને પુષ્ટિ પાસવર્ડ મેળ ખાતો નથી",
    //             "Please Enter New Password.": "કૃપા કરીને નવો પાસવર્ડ દાખલ કરો",
    //             "Please Confirm Your Password.": "કૃપા કરીને તમારા પાસવર્ડની પુષ્ટિ કરો",
    //             "Passwords must be between 2 and 20 characters": "પાસવર્ડ્સ 2 અને 20 અક્ષરો વચ્ચે હોવા જોઈએ.",
    //         },
    //         "hi-IN": {

    //             "Email / Mobile": "ईमेल / मोबाइल	",
    //             "Password": "पासवर्ड	",
    //             "Remember Me": "मुझे याद रखना	",
    //             "Forgot Password": "पासवर्ड भूल गए	",
    //             "Login": "लॉग इन करें	",
    //             "Sign Up": "साइन अप करें	",
    //             "About Us": "हमारे बारे में	",
    //             "Email": "ईमेल	",
    //             "Required Email Message": "आवश्यक ईमेल संदेश	",
    //             "Valid Email Message": "मान्य ईमेल संदेश	",
    //             "Reset": "रीसेट	",
    //             "Back to Login": "लॉगिन पर वापस जाएं	",
    //             "Sign Up": "साइन अप करें	",
    //             "Email": "ईमेल	",
    //             "Required Email Message": "आवश्यक ईमेल संदेश	",
    //             "Valid Email Message": "मान्य ईमेल संदेश	",
    //             "Mobile": "मोबाइल	",
    //             "Please Enter Mobile No": "कृपया दर्ज मोबाइल नं	",
    //             "Please Enter Valid Mobile No": "कृपया दर्ज मान्य मोबाइल नं	",
    //             "Required Password Message": "आवश्यक पासवर्ड संदेश	",
    //             "Please Confirm Your Password": "कृपया अपने पासवर्ड की पुष्टि करें	",
    //             "Sign Up": "साइन अप करें	",
    //             "Back to Login": "लॉगिन पर वापस जाएं	",
    //             "Search Country": "खोजें देश	",
    //             "No Country Found": "नो कंट्री मिले	",
    //             "HOME": "घर	",
    //             "Add Device": "डिवाइस जोडे	",
    //             "IMEI": "आईएमईआई	",
    //             "Type": "प्रकार	",
    //             "Map Type": "नक्शा प्रकार	",
    //             "Default": "चूक	",
    //             "Terrain": "इलाक़ा	",
    //             "Address.": "पता।	",
    //             "No Location Found": "कोई स्थान नहीं मिला	",
    //             "Map Type": "नक्शा प्रकार	",
    //             "Default": "चूक	",
    //             "Terrain": "इलाक़ा	",
    //             "Setellite": "Setellite	",
    //             "Engine ON": "इंजन चालू",
    //             "Engine OFF": "इंजन बंद",
    //             "Address.": "पता।	",
    //             "Speed": "गति	",
    //             "Slow": "धीरे	",
    //             "Medium": "मध्यम	",
    //             "Fast": "उपवास	",
    //             "Mileage": "लाभ	",
    //             "Average Speed": "औसत गति	",
    //             "Total Time": "कुल समय	",
    //             "No Street View Found": "सड़क दृश्य नहीं मिला",
    //             "Trip Info": "यात्रा जानकारी	",
    //             "No Trip Info Found": "कोई ट्रिप जानकारी मिली	",
    //             "Device ID": "डिवाइस आईडी	",
    //             "Time": "पहर	",
    //             "Total iginition No.": "कुल iginition नहीं।	",
    //             "Total driving time": "कुल समय ड्राइविंग	",
    //             "Total idle time": "कुल निष्क्रिय समय	",
    //             "Average hot start time": "औसत गर्म शुरू करने का समय	",
    //             "Average speed": "औसत गति	",
    //             "History highest speed": "इतिहास उच्चतम गति	",
    //             "History highest rotation": "इतिहास उच्चतम रोटेशन	",
    //             "Total Harsh acceleration No.": "कुल हर्ष त्वरण नहीं।	",
    //             "Total Harsh brake No.": "कुल हर्ष ब्रेक नहीं।	",
    //             "Select History Date": "चुनें इतिहास की तारीख	",
    //             "From": "से	",
    //             "To": "सेवा मेरे	",
    //             "No Address Found": "कोई पता मिला	",
    //             "Start": "प्रारंभ	",
    //             "Select History Date": "चुनें इतिहास की तारीख	",
    //             "End": "समाप्त	",
    //             "From": "से	",
    //             "time": "पहर	",
    //             "No History Found": "कोई इतिहास नहीं मिला	",
    //             "Notification": "अधिसूचना	",
    //             "Engine On": "इंजन पर	",
    //             "Door Open": "द्वार खुला है	",
    //             "Low Bettry": "कम Bettry	",
    //             "Over Speed": "स्पीड से अधिक	",
    //             "Movement": "आंदोलन	",
    //             "ence IN": "खिलाडि़यों में	",
    //             "Fence OUT": "बाड़ बाहर	",
    //             "Vibration": "कंपन	",
    //             "External Power Cut": "बाहरी पावर कट	",
    //             "Original Triggering": "मूल ट्रिगर	",
    //             "Line Broken": "लाइन टूटी	",
    //             "Veer Report": "वीर रिपोर्ट	",
    //             "Fuel Driving": "ईंधन ड्राइविंग	",
    //             "Crash": "दुर्घटना	",
    //             "Acceleration": "त्वरण	",
    //             "Fuel Loss": "ईंधन में कमी	",
    //             "No Notifications Found": "कोई सूचनाएं मिली	",
    //             "Share Device": "शेयर डिवाइस	",
    //             "No Shared User Found": "कोई साझा उपयोगकर्ता मिले	",
    //             "Start Sharing": "प्रारंभ शेयरिंग	",
    //             "Add": "जोड़ना	",
    //             "Save Fence": "बाड़ सहेजें	",
    //             "Update Fence": "बाड़ अद्यतन	",
    //             "Vehicle No.": "वाहन नहीं।	",
    //             "Vehicle Type": "वाहन का प्रकार	",
    //             "Select Vehicle Type": "चुनें वाहन के प्रकार	",
    //             "Max Speed": "अधिकतम चाल	",
    //             "range 0 to 200 km": "रेंज 0 करने के लिए 200 किमी	",
    //             "Arm Settings": "शाखा सेटिंग	",
    //             "Disarm": "वश में कर लेना	",
    //             "Auto": "ऑटो	",
    //             "Arm": "बांह	",
    //             "Expiry Date": "समाप्ति तिथि	",
    //             "Edit Profile": "प्रोफाइल एडिट करें	",
    //             "Change Password": "पासवर्ड बदलें	",
    //             "Log Out": "लोग आउट	",
    //             "Update Profile": "प्रोफ़ाइल अपडेट करें	",
    //             "Name": "नाम	",
    //             "Email": "ईमेल	",
    //             "Mobile": "मोबाइल	",
    //             "Update": "अद्यतन	",
    //             "Change Password": "पासवर्ड बदलें	",
    //             "Old Password": "पुराना पासवर्ड	",
    //             "Please Enter Old Password": "कृपया पुराना पासवर्ड दर्ज करें",
    //             "New Password": "नया पासवर्ड	",
    //             "Valid Password Message": "मान्य पासवर्ड संदेश	",
    //             "Confirm New Password": "नए पासवर्ड की पुष्टि करें	",
    //             "Submit": "जमा करें	",
    //             "Version": "संस्करण	",
    //             "Save Favorite Place": "सहेजें पसंदीदा जगह	",
    //             "Update Favorite Place": "अपडेट पसंदीदा जगह	",
    //             "Start Location": "प्रारंभ स्थान	",
    //             "End Location": "अंत स्थान	",
    //             "No Address Found": "कोई पता मिला	",
    //             "Distance": "दूरी	",
    //             "Duration": "अवधि	",
    //             "No Favorite Places Found": "कोई पसंदीदा स्थान मिला	",
    //             "Add New Favorite Place": "नए पसंदीदा स्थान जोड़ें	",
    //             "Favorite Place List": "पसंदीदा प्लेस सूची	",
    //             "Locate": "पता लगाएँ	",
    //             "Fence": "बाड़	",
    //             "History": "इतिहास	",
    //             "Settings": "सेटिंग्स	",
    //             "No Vehicle Deatils Found": "कोई वाहन के विवरण मिला	",
    //             "Home": "घर	",
    //             "Device List": "उपकरण सूची	",
    //             "Notification": "अधिसूचना	",
    //             "Me": "मुझे	",
    //             "Select Date": "तारीख़ चुनें	",
    //             "No History Found": "कोई इतिहास नहीं मिला	",
    //             "No Vehicle Found": "कोई वाहन मिले	",
    //             "Vehicle No": "वाहन नहीं	",
    //             "IMEI No.": "आईएमईआई नंबर	",
    //             "Scan QR Code": "क्यू आर कोड स्कैन करें	",
    //             "Vehicle Type": "वाहन का प्रकार	",
    //             "Select Vehicel Type": "का चयन करें Vehicel प्रकार	",
    //             "IMEI should not less than 15 digit": "आईएमईआई नहीं करना चाहिए कम से कम 15 अंकों	",
    //             "IMEI should not greater than 15 digit": "IMEI को 15 अंकों से अधिक नहीं होना चाहिए",
    //             "IMEI is not digit": "आईएमईआई अंक नहीं है",
    //             "Vehicle No.": "वाहन नहीं।	",
    //             "IMEI No.": "आईएमईआई नंबर	",
    //             "Scan QR Code": "क्यू आर कोड स्कैन करें	",
    //             "Vehicle Type": "वाहन का प्रकार	",
    //             "Add New Device": "नए उपकरण को जोड़ने	",
    //             "Select Vehicel Type": "का चयन करें Vehicel प्रकार	",
    //             "Add Device": "डिवाइस जोडे	",
    //             "Vehicle No. is Empty": "वाहन सं खाली है	",
    //             "IMEI No. is Empty": "आईएमईआई नंबर खाली है	",
    //             "Vehicle Added Successfully": "वाहन को सफलतापूर्वक जोड़	",
    //             "Share Device": "शेयर डिवाइस	",
    //             "Share Enable": "शेयर सक्षम करें	",
    //             "Device Id": "डिवाइस आईडी	",
    //             "Changed Successfully": "सफलतापूर्वक बदल	",
    //             "Are You Sure to Delete this Vehicle": "आप इस वाहन हटाना चाहते हैं	",
    //             "Ok": "ठीक	",
    //             "Cancel": "रद्द करना	",
    //             "Please Enter Fence Name": "कृपया बाड़ का नाम दर्ज करें	",
    //             "No Location Found": "कोई स्थान नहीं मिला	",
    //             "Location update need take 2 to 3 minutes if the vehicle is not under open sky area": "स्थान अद्यतन 2 से 3 मिनट लेने की जरूरत है, तो वाहन खुले आकाश के क्षेत्र में नहीं है	",
    //             "No Street View Found": "सड़क दृश्य नहीं मिला",
    //             "Parking Time": "पार्किंग समय	",
    //             "Address": "पता	",
    //             "No History Found": "कोई इतिहास नहीं मिला	",
    //             "Login Failed!": "लॉगिन विफल!	",
    //             "Invalid Email or Password": "अमान्य ईमेल या पासवर्ड	",
    //             "Your profile has been updated successfully.": "आपकी प्रोफ़ाइल सफलतापूर्वक अद्यतन किया गया है।	",
    //             "About App Currently Not Available": "एप्लिकेशन को वर्तमान में उपलब्ध नहीं है के बारे में	",
    //             "Notifications cleared": "सूचनाएं मंजूरी दे दी	",
    //             "Oops! Notifications not cleared": "ऊप्स! सूचनाएं साफ नहीं	",
    //             "Please Enter email Address of the person you want to Share Vehicle With.": "आप जिस व्यक्ति को साथ वाहन साझा करना चाहते हैं का ईमेल पता डालें। '	",
    //             "Share Vehicle": "शेयर वाहन	",
    //             "Invalid Email Address": "अमान्य ईमेल पता	",
    //             "You Can't Share Your Vehicle to Your Self": "तुम अपने आप को अपने वाहन साझा नहीं कर सकते	",
    //             "Notification Enabled": "अधिसूचना सक्षम	",
    //             "Notification Disabled": "अधिसूचना अक्षम किया गया	",
    //             "Stop Sharing": "साझा करना बंद	",
    //             "Are you sure to stop sharing device with this user ?": "आप इस उपयोगकर्ता के साथ साझा करने के उपकरण को रोकने के लिए हैं?	",
    //             "Are you sure to stop sharing device?": "आप साझा करने डिवाइस को रोकने के लिए हैं?	",
    //             "Enter Valid Mobile Number...": "वैध मोबाइल नंबर दर्ज करें...	",
    //             "Register Successfully": "सफलतापूर्वक रजिस्टर	",
    //             "Registration Failed!": "पंजीकरण विफल!	",
    //             "New Update Available": "नई सूचना उपलब्ध है	",
    //             "Update Now!": "अभी अद्यतन करें!	",
    //             "Ask Me Later": "मुझसे बाद में पूछना	",
    //             "Vehicle created successfully...": "वाहन सफलतापूर्वक बनाया गया ...	",
    //             "Vehicle is Not created...": "वाहन नहीं बनाई गई है ...	",
    //             "Tracker No. is already assign to other Vehicle...": "ट्रैकर नहीं। पहले से ही अन्य वाहन के लिए निर्दिष्ट किया जाता है ...	",
    //             "Vehicle updated successfully...": "वाहन सफलतापूर्वक अपडेट किया गया ...	",
    //             "Vehicle is Not updated...": "वाहन अद्यतन नहीं है ...	",
    //             "Invalid Tracker No., Please insert valid Tracker No.": "अमान्य ट्रैकर नहीं।, वैध ट्रैकर नहीं। डालें	",
    //             "Vehicle No. could not save. Try again later.": "वाहन नंबर सहेज नहीं सके। बाद में पुन: प्रयास करें।	",
    //             "Vehicle No. Save Successfully.": "वाहन सं सहेजें सफलतापूर्वक।	",
    //             "Vehicle deleted successfully": "वाहन सफलतापूर्वक नष्ट कर दिया	",
    //             "Vehicle deleted successfully": "वाहन सफलतापूर्वक नष्ट कर दिया	",
    //             "Vehicle No. Save Successfully.": "वाहन सं सहेजें सफलतापूर्वक।	",
    //             "Vehicle No. could not save. Try again later.": "वाहन नंबर सहेज नहीं सके। बाद में पुन: प्रयास करें।	",
    //             "Vehicle Type Save Successfully.": "वाहन के प्रकार सफलतापूर्वक बचाओ।	",
    //             "Vehicle Type could not save. Try again later.": "वाहन के प्रकार सहेज नहीं सके। बाद में पुन: प्रयास करें।	",
    //             "Device not connected. Try after 5 minute.": "डिवाइस कनेक्ट नहीं। 5 मिनट के बाद की कोशिश करो।	",
    //             "HeartBeat Interval Settings Save Successfully.": "दिल की धड़कन अंतराल सेटिंग्स सहेजें सफलतापूर्वक।	",
    //             "HeartBeat Interval Settings could not save. Try again later.": "दिल की धड़कन अंतराल सेटिंग सहेज नहीं सके। बाद में पुन: प्रयास करें।	",
    //             "GPRS Interval Settings for Stop Car Save Successfully.": "बंद करो कार सहेजें सफलतापूर्वक के लिए GPRS अंतराल सेटिंग।	",
    //             "GPRS Interval Settings for Stop Car could not save. Try again later.": "बंद करो कार के लिए GPRS अंतराल सेटिंग सहेज नहीं सके। बाद में पुन: प्रयास करें।	",
    //             "GPRS Interval Settings Save Successfully.": "जीपीआरएस अंतराल सेटिंग्स सहेजें सफलतापूर्वक।	",
    //             "GPRS Interval Settings could not save. Try again later.": "जीपीआरएस अंतराल सेटिंग सहेज नहीं सके। बाद में पुन: प्रयास करें।	",
    //             "Speed Settings Save Successfully.": "स्पीड सेटिंग्स सहेजें सफलतापूर्वक।	",
    //             "Speed Settings could not save. Try again later.": "स्पीड सेटिंग सहेज नहीं सके। बाद में पुन: प्रयास करें।	",
    //             "Arm Settings Save Successfully.": "शाखा सेटिंग्स सहेजें सफलतापूर्वक।	",
    //             "Arm Settings not Save Successfully.": "शाखा सेटिंग्स सफलतापूर्वक सहेजें नहीं।	",
    //             "Arm Settings could not save. Try again later.": "शाखा सेटिंग सहेज नहीं सके। बाद में पुन: प्रयास करें।	",
    //             "Favorite Place Name updated successfully...": "पसंदीदा जगह का नाम सफलतापूर्वक अपडेट किया गया ...	",
    //             "Favorite Place Name not updated...": "पसंदीदा जगह का नाम नहीं अद्यतन ...	",
    //             "Please Enter Favorite Place Name": "कृपया दर्ज करें पसंदीदा जगह का नाम	",
    //             "No Route Found": "कोई मार्ग नहीं मिला	",
    //             "Favorite Place Deleted Successfully...": "पसंदीदा जगह सफलतापूर्वक हटाया गया ...	",
    //             "Fence Name updated successfully...": "बाड़ नाम सफलतापूर्वक अपडेट किया गया ...	",
    //             "Fence Name not updated...": "बाड़ नाम अद्यतन नहीं ...	",
    //             "Please Enter Fence Name": "कृपया बाड़ का नाम दर्ज करें	",
    //             "Fence Removed successfully...": "बाड़ को सफलतापूर्वक निकाल दिया ...	",
    //             "Fence not Removed.": "बाड़ हटाया नहीं।	",
    //             "Fence Setting saved successfully.": "बाड़ स्थापना सफलतापूर्वक सहेजा गया।	",
    //             "Fence Setting not saved successfully. Try after 5 minute.": "बाड़ सफलतापूर्वक सहेजा नहीं स्थापित कर लिया। 5 मिनट के बाद की कोशिश करो।	",
    //             "To use this functionality Buy Pettorway Z3 Device": "इस कार्यक्षमता खरीदें Pettorway जेड 3 डिवाइस का उपयोग करने	",
    //             "Password sent to your email successfully...": "पासवर्ड सफलतापूर्वक अपने ईमेल के लिए भेजा ...	",
    //             "This Email template not found...": "इस ईमेल टेम्पलेट नहीं मिला ...	",
    //             "This system Email not found...": "इस प्रणाली को ईमेल नहीं मिला ...	",
    //             "This Email not registered with us...": "यह ईमेल हमारे साथ पंजीकृत नहीं ...	",
    //             "Password Send Successfully message": "पासवर्ड सफलतापूर्वक संदेश भेजें	",
    //             "Vehicle Added Successfully": "वाहन को सफलतापूर्वक जोड़	",
    //             "Device not connected. Try after 5 minute.": "डिवाइस कनेक्ट नहीं। 5 मिनट के बाद की कोशिश करो।	",
    //             "Current Location Received Successfully.": "वर्तमान स्थान सफलतापूर्वक प्राप्त। '	",
    //             "Current Location could not Received. Try again later.": "वर्तमान स्थान प्राप्त नहीं कर सका। बाद में पुन: प्रयास करें।	",
    //             "Invalid Username or Password...": "अमान्य उपयोगकर्ता नाम या पासवर्ड...	",
    //             "Login Successfully...": "सफलतापूर्वक प्रवेश ...	",
    //             "User updated successfully...": "प्रयोक्ता को सफलतापूर्वक अद्यतन ...	",
    //             "New Password contains atleast 2 characters...": "नया पासवर्ड कम से कम 2 वर्ण हैं ...	",
    //             "Password changed successfully...": "पासवर्ड सफलतापूर्वक बदला गया...	",
    //             "Old Password is wrong...": "पुराने पासवर्ड गलत है ...	",
    //             "User is not Exist...": "उपयोगकर्ता मौजूद नहीं है ...	",
    //             "Vehicle is already Shared With This User...": "वाहन पहले से ही यह उपयोगकर्ता के साथ साझा कर रहा है ...	",
    //             "Vehicle Shared successfully...": "वाहन सफलतापूर्वक साझा किया गया ...	",
    //             "User is not Exist...": "उपयोगकर्ता मौजूद नहीं है ...	",
    //             "Notification Setting could not Changed. Try again later.": "अधिसूचना सेटिंग में परिवर्तन नहीं कर सका। बाद में पुन: प्रयास करें।	",
    //             "Main Notification Setting Changed Successfully.": "मुख्य सूचना सेटिंग सफलतापूर्वक बदला गया।	",
    //             "User Removed successfully...": "प्रयोक्ता को सफलतापूर्वक निकाल दिया गया ...	",
    //             "User not Removed.": "उपयोगकर्ता हटाया नहीं।	",
    //             "User Push notification data updated successfully...": "उपयोगकर्ता पुश अधिसूचना डेटा को सफलतापूर्वक अपडेट कर ...	",
    //             "Requested Record(s) not Found....": "अनुरोधित रिकॉर्ड (रों) नहीं मिला ....	",
    //             "Invalid token...": "अमान्य टोकन...	",
    //             "No Access Permission...": "कोई प्रवेश की अनुमति ...	",
    //             "Add New Fence": "नई बाड़ जोड़ें",
    //             "Fence List": "बाड़ सूची",
    //             "No Fence Found": "कोई बाड़ नहीं मिला",
    //             "Email id.": "ईमेल आईडी।",
    //             "Share": "शेयर",
    //             "Satellite": "उपग्रह",
    //             "Locate": "पता लगाएँ",
    //             "History": "इतिहास",
    //             "Logout": "लोग आउट",
    //             "Close": "बंद करे",
    //             "Mo.": "मो",
    //             "Confirm Password": "पासवर्ड की पुष्टि कीजिये",
    //             "Language": "भाषा",
    //             "Delete Vehicle": "वाहन हटाएं",
    //             "Loading": "लोड हो रहा है",
    //             "Password and Confirm Password does not match": "पासवर्ड और पासवर्ड की पुष्टि करें से मेल नहीं खाती",
    //             "Please Enter New Password.": "कृपया नया पासवर्ड दर्ज करें",
    //             "Please Confirm Your Password.": "कृपया अपने पासवर्ड की पुष्टि करें।",
    //             "Passwords must be between 2 and 20 characters.": "पासवर्ड 2 और 20 अक्षरों के बीच होना चाहिए।",
    //         },
    //         "ms-MY": {

    //             "Email / Mobile": "E-mel / Mobile	",
    //             "Password": "kata laluan	",
    //             "Remember Me": "Remember Me	",
    //             "Forgot Password": "Lupa kata laluan	",
    //             "Login": "Log masuk	",
    //             "Sign Up": "Daftar	",
    //             "About Us": "Tentang kita	",
    //             "Email": "e-mel	",
    //             "Required Email Message": "E-mel diperlukan Mesej	",
    //             "Valid Email Message": "Sah E-mel Mesej	",
    //             "Reset": "menetapkan semula	",
    //             "Back to Login": "Kembali untuk Login		",
    //             "Sign Up": "Daftar	",
    //             "Email": "e-mel	",
    //             "Required Email Message": "E-mel diperlukan Mesej	",
    //             "Valid Email Message": "Sah E-mel Mesej	",
    //             "Mobile": "mudah alih	",
    //             "Please Enter Mobile No": "Sila Masukkan No Mobile	",
    //             "Please Enter Valid Mobile No": "Sila Masukkan Sah Bimbit	",
    //             "Required Password Message": "Kata laluan diperlukan Mesej	",
    //             "Please Confirm Your Password": "Sila Sahkan Kata Laluan Anda	",
    //             "Sign Up": "Daftar	",
    //             "Back to Login": "Kembali untuk Login	",
    //             "Search Country": "Cari Negara	",
    //             "No Country Found": "Tiada Negara Dijumpai	",
    //             "HOME": "HOME	",
    //             "Add Device": "Tambah Peranti	",
    //             "IMEI": "IMEI	",
    //             "Type": "Jenis	",
    //             "Map Type": "Jenis peta	",
    //             "Default": "lalai	",
    //             "Terrain": "rupa bumi	",
    //             "Address.": "Alamat.	",
    //             "No Location Found": "Tiada Lokasi dijumpai	",
    //             "Map Type": "Jenis peta	",
    //             "Default": "lalai	",
    //             "Terrain": "rupa bumi	",
    //             "Setellite": "Setellite	",
    //             "Engine ON": "enjin ON",
    //             "Engine OFF": "enjin OFF",
    //             "Address.": "Alamat.	",
    //             "Speed": "kelajuan	",
    //             "Slow": "Slow	",
    //             "Medium": "sederhana	",
    //             "Fast": "Fast	",
    //             "Mileage": "Jarak tempuh	",
    //             "Average Speed": "Kelajuan purata	",
    //             "Total Time": "Jumlah masa	",
    //             "No Street View Found": "No View Street Dijumpai	",
    //             "Trip Info": "Maklumat perjalanan	",
    //             "No Trip Info Found": "Belum ada Info lawatan Dijumpai	",
    //             "Device ID": "ID peranti	",
    //             "Time": "Masa	",
    //             "Total iginition No.": "Jumlah iginition No.	",
    //             "Total driving time": "Jumlah masa memandu	",
    //             "Total idle time": "Jumlah masa terbiar	",
    //             "Average hot start time": "Purata masa mula panas	",
    //             "Average speed": "Kelajuan purata	",
    //             "History highest speed": "Sejarah Kelajuan tertinggi	",
    //             "History highest rotation": "Sejarah putaran tertinggi	",
    //             "Total Harsh acceleration No.": "pecutan Harsh Jumlah No.	",
    //             "Total Harsh brake No.": "brek Harsh Jumlah No.	",
    //             "Select History Date": "Pilih Tarikh Sejarah	",
    //             "From": "daripada	",
    //             "To": "kepada	",
    //             "No Address Found": "Tidak Alamat Dijumpai	",
    //             "Start": "Start	",
    //             "Select History Date": "Pilih Tarikh Sejarah	",
    //             "End": "akhir	",
    //             "From": "daripada	",
    //             "time": "masa	",
    //             "No History Found": "Tiada Sejarah Dijumpai	",
    //             "Notification": "pemberitahuan	",
    //             "Engine On": "enjin On	",
    //             "Door Open": "Pintu terbuka	",
    //             "Low Bettry": "Bettry rendah	",
    //             "Over Speed": "lebih Kelajuan	",
    //             "Movement": "pergerakan	",
    //             "ence IN": "ence IN	",
    //             "Fence OUT": "pagar OUT	",
    //             "Vibration": "getaran	",
    //             "External Power Cut": "Kuasa Luar Cut	",
    //             "Original Triggering": "mencetuskan asal	",
    //             "Line Broken": "Line Broken	",
    //             "Veer Report": "Laporan Veer	",
    //             "Fuel Driving": "Driving bahan api	",
    //             "Crash": "Crash	",
    //             "Acceleration": "Pecutan	",
    //             "Fuel Loss": "Kerugian bahan api	",
    //             "No Notifications Found": "Tiada Pemberitahuan Dijumpai	",
    //             "Share Device": "Kongsi Peranti	",
    //             "No Shared User Found": "Tiada pengguna berkongsi Dijumpai	",
    //             "Start Sharing": "Perkongsian permulaan	",
    //             "Add": "Tambah	",
    //             "Save Fence": "Simpan Fence	",
    //             "Update Fence": "Update Fence	",
    //             "Vehicle No.": "No. kenderaan	",
    //             "Vehicle Type": "Jenis kenderaan	",
    //             "Select Vehicle Type": "Pilih Jenis Kenderaan	",
    //             "Max Speed": "Max Speed	",
    //             "range 0 to 200 km": "pelbagai 0-200 km	",
    //             "Arm Settings": "Tetapan Arm	",
    //             "Disarm": "melucutkan senjata	",
    //             "Auto": "Auto	",
    //             "Arm": "Arm	",
    //             "Expiry Date": "Tarikh luput	",
    //             "Edit Profile": "Sunting profil	",
    //             "Change Password": "Tukar kata laluan	",
    //             "Log Out": "Log keluar	",
    //             "Update Profile": "Kemas kini Profil	",
    //             "Name": "nama	",
    //             "Email": "e-mel	",
    //             "Mobile": "mudah alih	",
    //             "Update": "Kemas kini	",
    //             "Change Password": "Tukar kata laluan	",
    //             "Old Password": "Kata laluan lama	",
    //             "Please Enter Old Password": "Sila Masukkan Kata Laluan Lama",
    //             "New Password": "Kata laluan baharu	",
    //             "Valid Password Message": "Sah Kata laluan Mesej	",
    //             "Confirm New Password": "Sahkan kata laluan baru	",
    //             "Submit": "hantar	",
    //             "Version": "versi	",
    //             "Save Favorite Place": "Jimat kegemaran Place	",
    //             "Update Favorite Place": "Update Place kegemaran	",
    //             "Start Location": "Mula Lokasi	",
    //             "End Location": "akhir Lokasi	",
    //             "No Address Found": "Tidak Alamat Dijumpai	",
    //             "Distance": "Jarak	",
    //             "Duration": "Tempoh	",
    //             "No Favorite Places Found": "Tiada Tempat kegemaran Dijumpai	",
    //             "Add New Favorite Place": "Menambah Place New kegemaran	",
    //             "Favorite Place List": "Senarai Place kegemaran	",
    //             "Locate": "Cari	",
    //             "Fence": "pagar	",
    //             "History": "Sejarah	",
    //             "Settings": "tetapan	",
    //             "No Vehicle Deatils Found": "No Deatils Kenderaan Dijumpai	",
    //             "Home": "rumah	",
    //             "Device List": "Senarai Gajet	",
    //             "Notification": "pemberitahuan	",
    //             "Me": "saya	",
    //             "Select Date": "Pilih Tarikh	",
    //             "No History Found": "Tiada Sejarah Dijumpai	",
    //             "No Vehicle Found": "No Kenderaan Dijumpai	",
    //             "Vehicle No": "kenderaan No	",
    //             "IMEI No.": "IMEI No.	",
    //             "Scan QR Code": "Imbas Kod QR	",
    //             "Vehicle Type": "Jenis kenderaan	",
    //             "Select Vehicel Type": "Pilih Vehicel Jenis	",
    //             "IMEI should not less than 15 digit": "IMEI tidak harus kurang daripada 15 digit	",
    //             "IMEI should not greater than 15 digit": "IMEI tidak boleh melebihi 15 digit",
    //             "IMEI is not digit": "IMEI bukan digit",
    //             "Vehicle No.": "No. kenderaan	",
    //             "IMEI No.": "IMEI No.	",
    //             "Scan QR Code": "Imbas Kod QR	",
    //             "Vehicle Type": "Jenis kenderaan	",
    //             "Add New Device": "Tambah Peranti Baru	",
    //             "Select Vehicel Type": "Pilih Vehicel Jenis	",
    //             "Add Device": "Tambah Peranti	",
    //             "Vehicle No. is Empty": "Kenderaan No. adalah kosong	",
    //             "IMEI No. is Empty": "IMEI No. adalah kosong	",
    //             "Vehicle Added Successfully": "Kenderaan Ditambah Berjaya	",
    //             "Share Device": "Kongsi Peranti	",
    //             "Share Enable": "Kongsi Dayakan	",
    //             "Device Id": "Id peranti	",
    //             "Changed Successfully": "berubah Berjaya	",
    //             "Are You Sure to Delete this Vehicle": "Adakah Anda pasti akan menghapuskan Kenderaan ini	",
    //             "Ok": "Okey	",
    //             "Cancel": "Batal	",
    //             "Please Enter Fence Name": "Sila Masukkan Nama Fence	",
    //             "No Location Found": "Tiada Lokasi dijumpai	",
    //             "Location update need take 2 to 3 minutes if the vehicle is not under open sky area": "kemas kini lokasi perlu mengambil masa 2 hingga 3 minit jika kenderaan itu tidak berada di bawah kawasan langit terbuka	",
    //             "No Street View Found": "No View Street Dijumpai	",
    //             "Parking Time": "Parking Masa	",
    //             "Address": "alamat	",
    //             "No History Found": "Tiada Sejarah Dijumpai	",
    //             "Login Failed!": "Daftar masuk gagal!	",
    //             "Invalid Email or Password": "Email atau kata laluan tidak sah	",
    //             "Your profile has been updated successfully.": "profil anda telah berjaya dikemas kini.	",
    //             "About App Currently Not Available": "Mengenai Apl masa ini Tiada Maklumat	",
    //             "Notifications cleared": "Pemberitahuan dibersihkan	",
    //             "Oops! Notifications not cleared": "Oops! Pemberitahuan tidak dibersihkan	",
    //             "Please Enter email Address of the person you want to Share Vehicle With.": "Sila Masukkan Alamat e-mel orang yang anda mahu untuk Berkongsi Kenderaan With. '	",
    //             "Share Vehicle": "Kongsi kenderaan	",
    //             "Invalid Email Address": "Alamat email tidak sah	",
    //             "You Can't Share Your Vehicle to Your Self": "Anda tidak boleh berkongsi Kenderaan Anda ke diriMu	",
    //             "Notification Enabled": "pemberitahuan Didayakan	",
    //             "Notification Disabled": "pemberitahuan Dilumpuhkan	",
    //             "Stop Sharing": "Hentikan Perkongsian	",
    //             "Are you sure to stop sharing device with this user ?": "Adakah anda pasti untuk menghentikan peranti perkongsian dengan pengguna ini?	",
    //             "Are you sure to stop sharing device?": "Adakah anda pasti untuk menghentikan peranti perkongsian?	",
    //             "Enter Valid Mobile Number...": "Masukkan Sah Nombor Telefon ...	",
    //             "Register Successfully": "mendaftar Berjaya	",
    //             "Registration Failed!": "Pendaftaran gagal!	",
    //             "New Update Available": "Update New Tersedia	",
    //             "Update Now!": "Mengemas kini sekarang!	",
    //             "Ask Me Later": "Tanya saya nanti	",
    //             "Vehicle created successfully...": "Kenderaan berjaya dicipta ...	",
    //             "Vehicle is Not created...": "Kenderaan tidak dicipta ...	",
    //             "Tracker No. is already assign to other Vehicle...": "Tracker No. sudah memberikan kepada kenderaan lain ...	",
    //             "Vehicle updated successfully...": "Kenderaan berjaya dikemas kini ...	",
    //             "Vehicle is Not updated...": "Kenderaan tidak dikemaskini ...	",
    //             "Invalid Tracker No., Please insert valid Tracker No.": "Tidak sah Tracker No., Sila masukkan No. Tracker sah	",
    //             "Vehicle No. could not save. Try again later.": "Kenderaan No. tidak dapat menyelamatkan. Cuba lagi nanti.	",
    //             "Vehicle No. Save Successfully.": "Kenderaan No. Simpan Berjaya.	",
    //             "Vehicle deleted successfully": "Kenderaan berjaya dipadamkan	",
    //             "Vehicle deleted successfully": "Kenderaan berjaya dipadamkan	",
    //             "Vehicle No. Save Successfully.": "Kenderaan No. Simpan Berjaya.	",
    //             "Vehicle No. could not save. Try again later.": "Kenderaan No. tidak dapat menyelamatkan. Cuba lagi nanti.	",
    //             "Vehicle Type Save Successfully.": "Jenis kenderaan Jimat Berjaya.	",
    //             "Vehicle Type could not save. Try again later.": "Jenis kenderaan tidak dapat menyelamatkan. Cuba lagi nanti.	",
    //             "Device not connected. Try after 5 minute.": "Peranti tidak bersambung. Cuba selepas 5 minit.	",
    //             "HeartBeat Interval Settings Save Successfully.": "Heartbeat Tetapan Selang Simpan Berjaya.	",
    //             "HeartBeat Interval Settings could not save. Try again later.": "Heartbeat Interval Tetapan tidak boleh menyelamatkan. Cuba lagi nanti.	",
    //             "GPRS Interval Settings for Stop Car Save Successfully.": "Tetapan Selang GPRS untuk Stop Car Simpan Berjaya.	",
    //             "GPRS Interval Settings for Stop Car could not save. Try again later.": "GPRS Tetapan Selang untuk Stop kereta tidak dapat menyelamatkan. Cuba lagi nanti.	",
    //             "GPRS Interval Settings Save Successfully.": "GPRS Tetapan Selang Simpan Berjaya.	",
    //             "GPRS Interval Settings could not save. Try again later.": "GPRS Interval Tetapan tidak boleh menyelamatkan. Cuba lagi nanti.	",
    //             "Speed Settings Save Successfully.": "Tetapan kelajuan Simpan Berjaya.	",
    //             "Speed Settings could not save. Try again later.": "Tetapan kelajuan tidak boleh menyelamatkan. Cuba lagi nanti.	",
    //             "Arm Settings Save Successfully.": "Arm Tetapan Simpan Berjaya.	",
    //             "Arm Settings not Save Successfully.": "Arm Tetapan tidak Jimat Berjaya.	",
    //             "Arm Settings could not save. Try again later.": "Tetapan lengan tidak dapat menyelamatkan. Cuba lagi nanti.	",
    //             "Favorite Place Name updated successfully...": "Kegemaran Place Nama berjaya dikemas kini ...	",
    //             "Favorite Place Name not updated...": "Kegemaran Place Nama tidak dikemaskini ...	",
    //             "Please Enter Favorite Place Name": "Sila Masukkan Nama kegemaran Place	",
    //             "No Route Found": "No Route Dijumpai	",
    //             "Favorite Place Deleted Successfully...": "Kegemaran Place Dipadam Berjaya ...	",
    //             "Fence Name updated successfully...": "Pagar Nama berjaya dikemas kini ...	",
    //             "Fence Name not updated...": "Pagar Nama tidak dikemaskini ...	",
    //             "Please Enter Fence Name": "Sila Masukkan Nama Fence	",
    //             "Fence Removed successfully...": "Pagar berjaya dikeluarkan ...	",
    //             "Fence not Removed.": "Pagar tidak dikeluarkan.	",
    //             "Fence Setting saved successfully.": "Pagar Menetapkan berjaya disimpan.	",
    //             "Fence Setting not saved successfully. Try after 5 minute.": "Pagar Tetapan tidak berjaya disimpan. Cuba selepas 5 minit.	",
    //             "To use this functionality Buy Pettorway Z3 Device": "Untuk menggunakan fungsi ini Beli Pettorway Z3 Peranti	",
    //             "Password sent to your email successfully...": "Kata laluan dihantar ke e-mel anda berjaya ...	",
    //             "This Email template not found...": "Templat E-mel tidak dijumpai ...	",
    //             "This system Email not found...": "Sistem ini E-mel tidak dijumpai ...	",
    //             "This Email not registered with us...": "E-mel ini tidak berdaftar dengan kami ...	",
    //             "Password Send Successfully message": "Kata laluan Hantar Berjaya mesej	",
    //             "Vehicle Added Successfully": "Kenderaan Ditambah Berjaya	",
    //             "Device not connected. Try after 5 minute.": "Peranti tidak bersambung. Cuba selepas 5 minit.	",
    //             "Current Location Received Successfully.": "Lokasi Semasa DITERIMA Berjaya. '	",
    //             "Current Location could not Received. Try again later.": "Lokasi Semasa tidak dapat diterima. Cuba lagi nanti.	",
    //             "Invalid Username or Password...": "Nama pengguna atau kata laluan tidak sah...	",
    //             "Login Successfully...": "Log masuk Berjaya ...	",
    //             "User updated successfully...": "Pengguna berjaya dikemas kini ...	",
    //             "New Password contains atleast 2 characters...": "Kata Laluan Baru mengandungi atleast 2 watak-watak ...	",
    //             "Password changed successfully...": "Kata laluan berjaya berubah ...	",
    //             "Old Password is wrong...": "Old Password adalah salah ...	",
    //             "User is not Exist...": "Pengguna tidak Exist ...	",
    //             "Vehicle is already Shared With This User...": "Kenderaan sudah dikongsi dengan pengguna ini ...	",
    //             "Vehicle Shared successfully...": "Kenderaan berjaya berkongsi ...	",
    //             "User is not Exist...": "Pengguna tidak Exist ...	",
    //             "Notification Setting could not Changed. Try again later.": "Tetapan pemberitahuan tidak dapat ditukar. Cuba lagi nanti.	",
    //             "Main Notification Setting Changed Successfully.": "Menetapkan Pemberitahuan utama Berubah Berjaya.	",
    //             "User Removed successfully...": "Pengguna berjaya dikeluarkan ...	",
    //             "User not Removed.": "Pengguna tidak dikeluarkan.	",
    //             "User Push notification data updated successfully...": "Pengguna data Pemberitahuan push berjaya dikemas kini ...	",
    //             "Requested Record(s) not Found....": "Rekod diminta (s) tidak ditemui ....	",
    //             "Invalid token...": "Token tidak sah...	",
    //             "No Access Permission...": "Tiada Akses Kebenaran ...	",
    //             "Add New Fence": "Tambah Pagar Baru",
    //             "Fence List": "Senarai Pagar",
    //             "No Fence Found": "Tiada Pagar Dijumpai",
    //             "Email id.": "ID emel.",
    //             "Share": "Kongsi",
    //             "Satellite": "Satelit",
    //             "Locate": "Cari",
    //             "History": "Sejarah",
    //             "Logout": "Log keluar",
    //             "Close": "Tutup",
    //             "Mo.": "Mo.",
    //             "Confirm Password": "Sahkan Kata Laluan",
    //             "Language": "Bahasa",
    //             "Delete Vehicle": "Padam Kenderaan",
    //             "Loading": "Memuatkan",
    //             "Password and Confirm Password does not match": "Kata Laluan dan Sahkan Kata Laluan tidak sepadan",
    //             "Please Enter New Password.": "Sila masukkan kata laluan baru.",
    //             "Please Confirm Your Password.": "Sila Sahkan Kata Laluan Anda.",
    //             "Passwords must be between 2 and 20 characters": "Kata laluan mestilah di antara 2 dan 20 aksara.",

    //         }
    //     }



    // var lst = [];

    // for (objLan in translations[Object.keys(translations)[0]]) {
    //     var oo = new Object();

    //     oo.Code = objLan;
    //     for (obj in translations) {

    //         var kkkk = translations[obj];
    //         oo[obj] = kkkk[objLan];

    //     }

    //     lst.push(oo);
    // };

    // res.json(lst);
    var file = __dirname + "/MultiLangugaeFile/MobileLanguageResource.json";

    // jsonfile.writeFile(file, translations, function(err) {
    //     console.error(err)
    //         // res.json(translations);
    // })

    jsonfile.readFile(file, function (err, obj) {
        res.json(obj);
        // res.json(translations);
    })

    // res.json(translations);
})


module.exports = router