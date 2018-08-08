var router = express.Router();
// global.connection = mysql.createConnection({
//     host: MysqlHost,
//     user: Mysqluser,
//     password: Mysqlpassword,
//     database: Mysqldatabase,
//     multipleStatements: true
// });
// global.connectionhandshake = mysql.createConnection({
//     host: MysqlHost,
//     user: Mysqluser,
//     password: Mysqlpassword,
//     database: Mysqldatabase,
//     multipleStatements: true
// });


global.handleDisconnect = handleDisconnect;
global.handleDisconnecthandshake = handleDisconnecthandshake;
global.handleDisconnectbikedata = handleDisconnectbikedata;
global.handleDisconnectreport = handleDisconnectreport;
global.handleDisconnectDashboard = handleDisconnectDashboard;
global.handleDisconnectGpsData = handleDisconnectGpsData;
global.handleDisconnectAlarmData = handleDisconnectAlarmData;
global.handleDisconnectUserData = handleDisconnectUserData;

function handleDisconnect() {
    // console.log("@@@@@@@@@@@@@@@@@@@@@@")
    global.connection = mysql.createConnection({
        host: MysqlHost,
        user: Mysqluser,
        password: Mysqlpassword,
        database: Mysqldatabase,
        multipleStatements: true
    });

    connection.connect(function(err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    connection.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

function handleDisconnecthandshake() {
    // console.log("handleDisconnecthandshake.....")
    global.connectionhandshake = mysql.createConnection({
        host: MysqlHost,
        user: Mysqluser,
        password: Mysqlpassword,
        database: Mysqldatabase,
        multipleStatements: true
    });

    connectionhandshake.connect(function(err) {
        if (err) {
            console.log('error when connecting to db for handshake:', err);
            setTimeout(handleDisconnecthandshake, 2000);
        }
    });

    connectionhandshake.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnecthandshake();
        } else {
            throw err;
        }
    });
}
handleDisconnecthandshake();

function handleDisconnectbikedata() {
    global.connectionbikedata = mysql.createConnection({
        host: MysqlHost,
        user: Mysqluser,
        password: Mysqlpassword,
        database: Mysqldatabase,
        multipleStatements: true
    });

    connectionbikedata.connect(function(err) {
        if (err) {
            console.log('error when connecting to db for bike.js data:', err);
            setTimeout(handleDisconnectbikedata, 2000);
        }
    });

    connectionbikedata.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectbikedata();
        } else {
            throw err;
        }
    });
}
handleDisconnectbikedata();

function handleDisconnectreport() {
    // console.log("Report.....")
    global.connectionreport = mysql.createConnection({
        host: MysqlHost,
        user: Mysqluser,
        password: Mysqlpassword,
        database: Mysqldatabase,
        multipleStatements: true
    });

    connectionreport.connect(function(err) {
        if (err) {
            console.log('error when connecting to db for report data:', err);
            setTimeout(handleDisconnectreport, 2000);
        }
    });

    connectionreport.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectreport();
        } else {
            throw err;
        }
    });
}
handleDisconnectreport();

function handleDisconnectDashboard() {
    // console.log("Dashboard.....")
    global.connectionDashboard = mysql.createConnection({
        host: MysqlHost,
        user: Mysqluser,
        password: Mysqlpassword,
        database: Mysqldatabase,
        multipleStatements: true
    });

    connectionDashboard.connect(function(err) {
        if (err) {
            console.log('error when connecting to db for dashbord data:', err);
            setTimeout(handleDisconnectDashboard, 2000);
        }
    });

    connectionDashboard.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectDashboard();
        } else {
            throw err;
        }
    });
}
handleDisconnectDashboard();

function handleDisconnectGpsData() {
    // console.log("GPS data....")
    global.connectionGpsData = mysql.createConnection({
        host: MysqlHost,
        user: Mysqluser,
        password: Mysqlpassword,
        database: Mysqldatabase,
        multipleStatements: true
    });

    connectionGpsData.connect(function(err) {
        if (err) {
            console.log('error when connecting to db for dashbord data:', err);
            setTimeout(handleDisconnectGpsData, 2000);
        }
    });

    connectionGpsData.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectGpsData();
        } else {
            throw err;
        }
    });
}
handleDisconnectGpsData();


function handleDisconnectCanbus() {
    // console.log("Canbus data....")
    global.connectionCanbus = mysql.createConnection({
        host: MysqlHost,
        user: Mysqluser,
        password: Mysqlpassword,
        database: Mysqldatabase,
        multipleStatements: true
    });

    connectionCanbus.connect(function(err) {
        if (err) {
            console.log('error when connecting to db for canbus data:', err);
            setTimeout(handleDisconnectCanbus, 2000);
        }
    });

    connectionCanbus.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectCanbus();
        } else {
            throw err;
        }
    });
}
handleDisconnectCanbus();

function handleDisconnectdotrack() {
    // console.log("Canbus data....")
    global.connectiondotrackdata = mysql.createConnection({
        host: MysqlHost,
        user: Mysqluser,
        password: Mysqlpassword,
        database: Mysqldatabase,
        multipleStatements: true
    });

    connectiondotrackdata.connect(function(err) {
        if (err) {
            console.log('error when connecting to db for canbus data:', err);
            setTimeout(handleDisconnectdotrack, 2000);
        }
    });

    connectiondotrackdata.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectdotrack();
        } else {
            throw err;
        }
    });
}
handleDisconnectdotrack();

function handleDisconnectAlarmData() {
    // console.log("GPS data....")
    global.connectionAlarmData = mysql.createConnection({
        host: MysqlHost,
        user: Mysqluser,
        password: Mysqlpassword,
        database: Mysqldatabase,
        multipleStatements: true
    });

    connectionAlarmData.connect(function(err) {
        if (err) {
            console.log('error when connecting to db for dashbord data:', err);
            setTimeout(handleDisconnectAlarmData, 2000);
        }
    });

    connectionAlarmData.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectAlarmData();
        } else {
            throw err;
        }
    });
}
handleDisconnectAlarmData();

function handleDisconnectUserData() {
    // console.log("GPS data....")
    global.connectionUserData = mysql.createConnection({
        host: MysqlHost,
        user: Mysqluser,
        password: Mysqlpassword,
        database: Mysqldatabase,
        multipleStatements: true
    });

    connectionUserData.connect(function(err) {
        if (err) {
            console.log('error when connecting to db for dashbord data:', err);
            setTimeout(handleDisconnectUserData, 2000);
        }
    });

    connectionUserData.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectUserData();
        } else {
            throw err;
        }
    });
}
handleDisconnectUserData();

module.exports = router