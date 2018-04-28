/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgpsdata', {
    Id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    Datetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Latitude: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Longitude: {
      type: DataTypes.STRING,
      allowNull: false
    },
    GPSPositioning: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    Speed: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Direction: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IsRelayToStopTheCar: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsSirenSound: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsUserDefined: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsLockTheDoor: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsUnlockTheDoor: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsSOS: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsWiringForAntiTamper: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsDoor: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsEngine: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsOriginalSirenTriggeringStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    HDOP: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Altitude: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    AD1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AD2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OdoMeter: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Date: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    IsPatchEngine: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    IsOverSpeed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'tblgpsdata'
  });
};
