var router = express.Router();
var AuditLog = models.tblauditlog;

router.get('/GetAllAditlog', function (req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrder = objParam.order;
    var objSearch = objParam.search;

    var Orderby = objColumns[parseInt(objOrder[0].column)].data + ' ' + objOrder[0].dir;
    var search = {};
    var search1 = {};

    if (objSearch != null && objSearch != '') {
        search['$or'] = [];

        for (var i = 0; i < objColumns.length; i++) {
            if (objColumns[i].data != null && objColumns[i].data != '') {
                var columnName = objColumns[i].data;

                if (columnName != 'createddate') {
                    search['$or'].push([columnName + ' like ?', "%" + objSearch + "%"]);
                }

            };
        };
    }
     search['$and'] = [];
    var StartDate = req.query.StartDate;
    var EndDate = req.query.EndDate;
    if (StartDate != '' && EndDate != '') {
        StartDate = convertdateformat(StartDate, 3);
        EndDate = convertdateformat(EndDate, 3);

        var obj = new Object();
        obj['createddate'] = {
            $between: [StartDate, EndDate]
        };
        search['$and'].push(obj);
    } else if (StartDate != null && StartDate != '') {
        StartDate = convertdateformat(StartDate, 3);
        var obj = new Object();
        obj['createddate'] = {
            $gt: StartDate
        };
        search['$and'].push(obj);
    } else if (EndDate != null && EndDate != '') {
        EndDate = convertdateformat(EndDate, 3);
        var obj = new Object();
        obj['createddate'] = {
            $lt: EndDate
        };
        search['$and'].push(obj);
    }



    AuditLog.findAndCountAll({
        where: search,
        order: Orderby,
        offset: parseInt(objParam.start),
        limit: parseInt(objParam.length),
    }).then(function (response) {
        var response1 = new Object();
        response1.draw = objParam.draw;
        response1.recordsTotal = response.count;
        response1.recordsFiltered = response.count;
        response1.data = response.rows;
        res.json(response1);
    }).catch(function (error) {
        res.json(error);
    })
})



router.get('/GetAllGPSDeleteData', function (req, res) {

    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;

    var search = '';
    var IsUserSuperAdmin = false;
    var IsCountryAll = false;

    var CountryList = objParam.CountryList;
    if (CountryList == undefined || CountryList == null || CountryList == "") {
        CountryList = [];
    }

    var UserRoles = objParam.UserRoles;

    if (objSearch != null && objSearch != '') {
        search = 'Where (tblgpsdeletecash.DeviceId like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdeletecash.Status like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdeletecash.CreatedBy like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdeletecash.CreatedDate like "%' + objSearch + '%" or ';
        search = search + 'tblgpsdeletecash.ModifiedDate like "%' + objSearch + '%" or ';
        search = search + 'tblvehicle.Name like "%' + objSearch + '%" or ';
        search = search + 'tbluserinformation.username like "%' + objSearch + '%") ';
    };
    //  if (objParam.UserId != null && objParam.UserId != undefined && objParam.UserId != '') {
    //      if (search != "") {
    //          search += " and tblgpsdevice.idSalesAgent =" + objParam.UserId;
    //      } else {
    //          search += " Where tblgpsdevice.idSalesAgent =" + objParam.UserId;
    //      }
    //  }
    if (objParam.appId != null && objParam.appId != undefined && objParam.appId != '') {
        if (search != "") {
            search += ' and tbluserinformation.idApp = "' + objParam.appId + '"';
        } else {
            search += ' where tbluserinformation.idApp = "' + objParam.appId + '"';
        }
    }

    var query = "Select tblgpsdeletecash.*,CONVERT_TZ(tblgpsdeletecash.CreatedDate,'+00:00','" + CurrentOffset + "') as DisplayCreatedDate," +
        " CONVERT_TZ(tblgpsdeletecash.ModifiedDate,'+00:00','" + CurrentOffset + "') as DisplayModifiedDate," +
        " tblvehicle.Name,tbluserinformation.username from tblgpsdeletecash" +
        " Left join tblvehicle on tblgpsdeletecash.idVehicle = tblvehicle.id" +
        " Left join tbluserinformation on tblgpsdeletecash.idUser = tbluserinformation.id " + search +
        " order by " + Orderby + " limit " + parseInt(objParam.length) + " offset " + parseInt(objParam.start);
    var Countqry = "Select count(tblgpsdeletecash.Id) as TotalRecord from tblgpsdeletecash" +
        " Left join tblvehicle on tblgpsdeletecash.idVehicle = tblvehicle.id" +
        " Left join tbluserinformation on tblgpsdeletecash.idUser = tbluserinformation.id " + search;
    connection.query(query, function (err, response) {
        if (response != undefined) {
            connection.query(Countqry, function (err, lstCount, fields) {
                var response1 = new Object();
                response1.draw = objParam.draw;
                response1.recordsTotal = lstCount[0].TotalRecord;
                response1.recordsFiltered = lstCount[0].TotalRecord;
                response1.data = response;
                res.json(response1);
            });
        } else {
            console.log(err);
            var response1 = new Object();
            response1.draw = objParam.draw;
            response1.recordsTotal = 0;
            response1.recordsFiltered = 0;
            response1.data = [];
            res.json(response1);
        }
    })


})

function convertdateformat(date1, flg) {
    var date = new Date(date1);
    var firstdayMonth = date.getMonth() + 1;
    var firstdayDay = date.getDate();
    var firstdayYear = date.getFullYear();
    var firstdayHours = date.getHours();
    var firstdayMinutes = date.getMinutes();
    var firstdaySeconds = date.getSeconds();

    if (flg == 1) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "23:59:59";

    } else if (flg == 2) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + "00:00:00";
    } else if (flg == 3) {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00" + firstdayHours.toString()).slice(-2) + ':' + ("00" + firstdayMinutes.toString()).slice(-2) + ':' + ("00" + firstdaySeconds.toString()).slice(-2);
    } else {
        return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
    }
}



module.exports = router