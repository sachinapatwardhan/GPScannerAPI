/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbldrivingdata', {
    int: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TotalIgnition: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    TotalDrivingTime: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    TotalIdlingTime: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    AverageHotStartTime: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    AverageSpeed: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    HistoryHighestSpeed: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    HistoryHighestRotation: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    TotalHarshAcceleration: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    TotalHarshBrake: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Datetime: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tbldrivingdata'
  });
};
