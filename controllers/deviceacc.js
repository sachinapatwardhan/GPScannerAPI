var router = express.Router();
//**********************GetDeviceAccvalue*********************************************************************************** */

router.get('/GetAllDeviceAccValue', function(req, res) {
    var objParam = req.query;
    var objColumns = objParam.columns;
    var objOrderBy = objParam.order;
    var objSearch = objParam.search;
    var Orderby = objColumns[parseInt(objOrderBy[0].column)].data + ' ' + objOrderBy[0].dir;
    var WhereCondition = "";

    if (objSearch != '' && objSearch != undefined && objSearch != '') {
        WhereCondition = "Where tbldeviceaccvalueset.DeviceId like '%" + objSearch + "%' ";
    }
    if (objParam.DeviceId != '' && objParam.DeviceId != undefined && objParam.DeviceId != '') {
        if (WhereCondition == '') {
            WhereCondition = "Where tbldeviceaccvalueset.DeviceId like '%" + objParam.DeviceId + "%' ";
        } else {
            WhereCondition = WhereCondition + " And tbldeviceaccvalueset.DeviceId like '%" + objParam.DeviceId + "%' ";
        }
    }
    if (objParam.AppName != '' && objParam.AppName != null && objParam.AppName != undefined) {
        if (WhereCondition == '') {
            WhereCondition = "Where tblgpsdevice.AppName = '" + objParam.AppName + "' ";
        } else {
            WhereCondition = WhereCondition + " And  tblgpsdevice.AppName  = '" + objParam.AppName + "' ";
        }
    }

    if (objParam.StartDate != '' && objParam.EndDate != '') {
        if (WhereCondition == '') {
            WhereCondition = "Where tbldeviceaccvalueset.CreatedDate between  '" + objParam.StartDate + "' And '" + objParam.EndDate + "'";
        } else {
            WhereCondition = WhereCondition + " And  tbldeviceaccvalueset.CreatedDate between  '" + objParam.StartDate + "' And '" + objParam.EndDate + "'";
        }
    } else if (objParam.StartDate != '') {
        if (WhereCondition == '') {
            WhereCondition = "Where tbldeviceaccvalueset.CreatedDate >= '" + objParam.StartDate + "'";
        } else {
            WhereCondition = WhereCondition + " And   tbldeviceaccvalueset.CreatedDate >=  '" + objParam.StartDate + "'";
        }
    } else if (objParam.EndDate != '') {
        if (WhereCondition == '') {
            WhereCondition = "Where tbldeviceaccvalueset.CreatedDate <=  = '" + objParam.StartDate + "'";
        } else {
            WhereCondition = WhereCondition + " And   tbldeviceaccvalueset.CreatedDate <=  '" + objParam.StartDate + "'";
        }
    }
    if (objParam.IsACCValueSet != '' && objParam.IsACCValueSet != null && objParam.IsACCValueSet != undefined) {
        if (WhereCondition == '') {
            WhereCondition = "Where tbldeviceaccvalueset.IsACCValueSet = " + objParam.IsACCValueSet;
        } else {
            WhereCondition = WhereCondition + " And  tbldeviceaccvalueset.IsACCValueSet  = " + objParam.IsACCValueSet;
        }
    }

    var Query = "Select tbldeviceaccvalueset.*, tblgpsdevice.AppName from tbldeviceaccvalueset Left join tblgpsdevice on tblgpsdevice.DeviceId = tbldeviceaccvalueset.DeviceId " + WhereCondition + " order by CreatedDate Desc LIMIT " + parseInt(objParam.length) + " OFFSET " + parseInt(objParam.start);
    var Count = "Select Count(*) As TotalRecord from tbldeviceaccvalueset Left join tblgpsdevice on tblgpsdevice.DeviceId = tbldeviceaccvalueset.DeviceId " + WhereCondition;
    connection.query(Query, function(err, response) {
        if (response != undefined) {
            connection.query(Count, function(err, lstCount, fields) {
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
    })
})

module.exports = router