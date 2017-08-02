/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblalarm', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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
    AlarmCode: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Datetime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblalarm'
  });
};
