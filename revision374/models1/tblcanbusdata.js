/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblcanbusdata', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BatteryVoltage: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    EngineSpeed: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    RunningSpeed: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ThrottleOpeningWidth: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    EngineLoad: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    CoolantTemperature: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    InstantaneousFuelConsumption: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    AverageFuelConsumption: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    DrivingRange: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    TotalMileage: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    SingleFuelConsumptionVolume: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    TotalFuelConsumptionVolume: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    CurrentErrorCodeNumbers: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    HarshAccelerationNo: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    HarshBrakeNo: {
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
    tableName: 'tblcanbusdata'
  });
};
