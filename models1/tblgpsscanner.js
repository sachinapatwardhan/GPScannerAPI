/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgpsscanner', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Datetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Latitude: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Longtitude: {
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
    ReservedSign: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    ReservedSelection: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IsAdvanture: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    MacAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GPSDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Date: {
      type: DataTypes.BIGINT,
      allowNull: true
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
    }
  }, {
    tableName: 'tblgpsscanner'
  });
};
