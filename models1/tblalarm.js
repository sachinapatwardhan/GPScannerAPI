/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblalarm', {
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
    AlarmCode: {
      type: DataTypes.CHAR(2),
      allowNull: false
    }
  }, {
    tableName: 'tblalarm'
  });
};
