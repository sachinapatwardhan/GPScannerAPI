const express = require('express');
const jwt = require('jwt-simple');
const moment = require('moment');
const bodyParser = require('body-parser');

const DatabaseConnection = require('../connection/DatabaseConnection.js');

const router = express.Router();
const connection = new DatabaseConnection().connection;
const jsonParser = bodyParser.json();

router.post('/getJourneyReport', jsonParser, (req, res) => {
  const authorization = req.header('authorization');

  if (!authorization) {
    return res.json({
      success: false,
      message: 'Unauthorized access.'
    });
  }

  const [tokenType, token] = authorization.split(' ');

  if (!token) {
    return res.json({
      success: false,
      message: 'Invalid token.'
    });
  }

  let decoded = null;
  try {
    decoded = jwt.decode(token, process.env.TokenKey);
  } catch (err) {
    return res.json({
      success: false,
      message: err.message || 'Invalid token.'
    });
  }

  if (!req.body.tz) {
    return res.json({
      success: false,
      message: 'User timezone not provided.'
    });
  }

  if (!req.body.deviceIds || !Array.isArray(req.body.deviceIds) || req.body.deviceIds.length === 0) {
    return res.json({
      success: false,
      message: 'Device ID(s) not provided.'
    });
  }

  let startMoment = null;
  let endMoment = null;
  switch (req.body.dateRange) {
    case 'Yesterday': {
      startMoment = moment().utcOffset(req.body.tz).startOf('day').subtract(1, 'day');
      endMoment = moment().utcOffset(req.body.tz).endOf('day').subtract(1, 'day');
      break;
    }
    case 'This Week': {
      startMoment = moment().utcOffset(req.body.tz).startOf('week');
      endMoment = moment().utcOffset(req.body.tz).endOf('week');
      break;
    }
    case 'Last Week': {
      startMoment = moment().utcOffset(req.body.tz).startOf('week').subtract(1, 'week');
      endMoment = moment().utcOffset(req.body.tz).endOf('week').subtract(1, 'week');
      break;
    }
    case 'This Month': {
      startMoment = moment().utcOffset(req.body.tz).startOf('month');
      endMoment = moment().utcOffset(req.body.tz).endOf('month');
      break;
    }
    case 'Last Month': {
      startMoment = moment().utcOffset(req.body.tz).startOf('month').subtract(1, 'month');
      endMoment = moment().utcOffset(req.body.tz).endOf('month').subtract(1, 'month');
      break;
    }
    default: {
      startMoment = moment().utcOffset(req.body.tz).startOf('day');
      endMoment = moment().utcOffset(req.body.tz).endOf('day');
      break;
    }
  }

  let reportType = null;
  switch (req.body.type) {
    case 'Trip Only': {
      reportType = ['Trip'];
      break;
    }
    case 'Park Only': {
      reportType = ['Parking'];
      break;
    }
    case 'Trip + Park': {
      reportType = ['Trip', 'Parking'];
      break;
    }
    case 'Journey Only': {
      reportType = ['Journey'];
      break;
    }
    default: {
      req.body.type = 'Trip + Park + Journey';
      reportType = ['Trip', 'Parking', 'Journey'];
      break;
    }
  }

  const query = "SELECT id, deviceId, vehicleName, startDatetime, endDatetime, startLatitude, startLongitude, startLocation, endLatitude, endLongitude, endLocation, totalKm, totalSecs, idleSecs, maximumSpeed, averageSpeed, reportType, journeyName FROM tbltrackerreport WHERE processingStatus = ? AND startDatetime >= ? AND startDatetime <= ? AND reportType IN (?) AND deviceId IN (?) ORDER BY vehicleName ASC";
  const bindings = [
    'Processed',
    startMoment.toISOString(),
    endMoment.toISOString(),
    reportType,
    req.body.deviceIds
  ];

  return connection.query(query, bindings, (err, rows) => {
    if (err) {
      return res.json({
        success: false,
        message: err.sqlMessage || err.message || 'An error occurred. Please try again.'
      });
    }

    return res.json({
      success: !!rows.length,
      message: rows.length ? 'Report found.' : 'No report found.',
      data: {
        report: {
          generatedBy: decoded.username,
          generatedDatetime: moment().toISOString(),
          filters: {
            type: req.body.type,
            startDatetime: startMoment.toISOString(),
            endDatetime: endMoment.toISOString(),
            deviceIds: req.body.deviceIds
          },
          rows: rows
        }
      }
    });
  });
});

router.post('/getStatisticsReport', jsonParser, (req, res) => {
  const authorization = req.header('authorization');

  if (!authorization) {
    return res.json({
      success: false,
      message: 'Unauthorized access.'
    });
  }

  const [tokenType, token] = authorization.split(' ');

  if (!token) {
    return res.json({
      success: false,
      message: 'Invalid token.'
    });
  }

  let decoded = null;
  try {
    decoded = jwt.decode(token, process.env.TokenKey);
  } catch (err) {
    return res.json({
      success: false,
      message: err.message || 'Invalid token.'
    });
  }

  if (!req.body.tz) {
    return res.json({
      success: false,
      message: 'User timezone not provided.'
    });
  }

  if (!req.body.deviceIds || !Array.isArray(req.body.deviceIds) || req.body.deviceIds.length === 0) {
    return res.json({
      success: false,
      message: 'Device ID(s) not provided.'
    });
  }

  let startMoment = null;
  let endMoment = null;
  switch (req.body.dateRange) {
    case 'Yesterday': {
      startMoment = moment().utcOffset(req.body.tz).startOf('day').subtract(1, 'day');
      endMoment = moment().utcOffset(req.body.tz).endOf('day').subtract(1, 'day');
      break;
    }
    case 'This Week': {
      startMoment = moment().utcOffset(req.body.tz).startOf('week');
      endMoment = moment().utcOffset(req.body.tz).endOf('week');
      break;
    }
    case 'Last Week': {
      startMoment = moment().utcOffset(req.body.tz).startOf('week').subtract(1, 'week');
      endMoment = moment().utcOffset(req.body.tz).endOf('week').subtract(1, 'week');
      break;
    }
    case 'This Month': {
      startMoment = moment().utcOffset(req.body.tz).startOf('month');
      endMoment = moment().utcOffset(req.body.tz).endOf('month');
      break;
    }
    case 'Last Month': {
      startMoment = moment().utcOffset(req.body.tz).startOf('month').subtract(1, 'month');
      endMoment = moment().utcOffset(req.body.tz).endOf('month').subtract(1, 'month');
      break;
    }
    default: {
      startMoment = moment().utcOffset(req.body.tz).startOf('day');
      endMoment = moment().utcOffset(req.body.tz).endOf('day');
      break;
    }
  }

  const query = "SELECT vehicleName, startDatetime, (CASE WHEN reportType = 'Trip' THEN 1 ELSE 0 END) AS tripCount, SUM(CASE WHEN reportType = 'Parking' THEN 1 ELSE 0 END) AS parkCount, SUM(CASE WHEN reportType = 'Journey' THEN 1 ELSE 0 END) AS journeyCount, SUM(totalKm) AS totalKm, AVG(averageSpeed) AS averageSpeed, MAX(maximumSpeed) AS maximumSpeed, TIMEDIFF(MAX(CASE WHEN reportType = 'Trip' THEN endDatetime ELSE '1000-01-01' END), MIN(CASE WHEN reportType = 'Trip' THEN startDatetime ELSE '9999-12-31' END)) AS workingHours, SEC_TO_TIME(SUM(CASE WHEN reportType = 'Trip' THEN totalSecs ELSE 0 END)) AS drivingHours, SEC_TO_TIME(SUM(CASE WHEN reportType = 'Parking' THEN totalSecs ELSE 0 END)) AS parkingHours, SEC_TO_TIME(SUM(CASE WHEN reportType = 'Trip' THEN idleSecs ELSE 0 END)) AS idleHours FROM tbltrackerreport WHERE processingStatus = ? AND startDatetime >= ? AND startDatetime <= ? AND deviceId IN (?)  GROUP BY vehicleName, DATE(CONVERT_TZ(startDatetime, '+00:00', '+08:00'))";
  const bindings = [
    'Processed',
    startMoment.toISOString(),
    endMoment.toISOString(),
    req.body.deviceIds
  ];

  return connection.query(query, bindings, (err, rows) => {
    if (err) {
      return res.json({
        success: false,
        message: err.sqlMessage || err.message || 'An error occurred. Please try again.'
      });
    }

    return res.json({
      success: !!rows.length,
      message: rows.length ? 'Report found.' : 'No report found.',
      data: {
        report: {
          generatedBy: decoded.username,
          generatedDatetime: moment().toISOString(),
          filters: {
            type: req.body.type,
            startDatetime: startMoment.toISOString(),
            endDatetime: endMoment.toISOString(),
            deviceIds: req.body.deviceIds
          },
          rows: rows
        }
      }
    });
  });
});

router.post('/getFenceReport', jsonParser, (req, res) => {
  const authorization = req.header('authorization');

  if (!authorization) {
    return res.json({
      success: false,
      message: 'Unauthorized access.'
    });
  }

  const [tokenType, token] = authorization.split(' ');

  if (!token) {
    return res.json({
      success: false,
      message: 'Invalid token.'
    });
  }

  let decoded = null;
  try {
    decoded = jwt.decode(token, process.env.TokenKey);
  } catch (err) {
    return res.json({
      success: false,
      message: err.message || 'Invalid token.'
    });
  }

  if (!req.body.tz) {
    return res.json({
      success: false,
      message: 'User timezone not provided.'
    });
  }

  if (!req.body.deviceIds || !Array.isArray(req.body.deviceIds) || req.body.deviceIds.length === 0) {
    return res.json({
      success: false,
      message: 'Device ID(s) not provided.'
    });
  }

  let startMoment = null;
  let endMoment = null;
  switch (req.body.dateRange) {
    case 'Yesterday': {
      startMoment = moment().utcOffset(req.body.tz).startOf('day').subtract(1, 'day');
      endMoment = moment().utcOffset(req.body.tz).endOf('day').subtract(1, 'day');
      break;
    }
    case 'This Week': {
      startMoment = moment().utcOffset(req.body.tz).startOf('week');
      endMoment = moment().utcOffset(req.body.tz).endOf('week');
      break;
    }
    case 'Last Week': {
      startMoment = moment().utcOffset(req.body.tz).startOf('week').subtract(1, 'week');
      endMoment = moment().utcOffset(req.body.tz).endOf('week').subtract(1, 'week');
      break;
    }
    case 'This Month': {
      startMoment = moment().utcOffset(req.body.tz).startOf('month');
      endMoment = moment().utcOffset(req.body.tz).endOf('month');
      break;
    }
    case 'Last Month': {
      startMoment = moment().utcOffset(req.body.tz).startOf('month').subtract(1, 'month');
      endMoment = moment().utcOffset(req.body.tz).endOf('month').subtract(1, 'month');
      break;
    }
    default: {
      startMoment = moment().utcOffset(req.body.tz).startOf('day');
      endMoment = moment().utcOffset(req.body.tz).endOf('day');
      break;
    }
  }

  let dateFilterColumn = null;
  switch (req.body.type) {
    case 'Fence IN': {
      dateFilterColumn = 'startDatetime';
      break;
    }
    case 'Fence OUT': {
      dateFilterColumn = 'endDatetime';
      break;
    }
    default: {
      req.body.type = 'Fence IN + OUT';
      dateFilterColumn = 'startDatetime';
      break;
    }
  }

  const query = "SELECT id, deviceId, vehicleName, startDatetime, endDatetime, startLatitude, startLongitude, startLocation, endLatitude, endLongitude, endLocation, totalKm, totalSecs, idleSecs, maximumSpeed, averageSpeed, reportType, journeyName FROM tbltrackerreport WHERE processingStatus = ? AND ?? >= ? AND ?? <= ? AND reportType = ? AND deviceId IN (?) ORDER BY vehicleName ASC";
  const bindings = [
    'Processed',
    dateFilterColumn,
    startMoment.toISOString(),
    dateFilterColumn,
    endMoment.toISOString(),
    'Fence',
    req.body.deviceIds
  ];

  return connection.query(query, bindings, (err, rows) => {
    if (err) {
      return res.json({
        success: false,
        message: err.sqlMessage || err.message || 'An error occurred. Please try again.'
      });
    }

    return res.json({
      success: !!rows.length,
      message: rows.length ? 'Report found.' : 'No report found.',
      data: {
        report: {
          generatedBy: decoded.username,
          generatedDatetime: moment().toISOString(),
          filters: {
            type: req.body.type,
            startDatetime: startMoment.toISOString(),
            endDatetime: endMoment.toISOString(),
            deviceIds: req.body.deviceIds
          },
          rows: rows
        }
      }
    });
  });
});

module.exports = router;
