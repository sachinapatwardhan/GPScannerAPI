/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblvehicle', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    iduser: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tbluserinformation',
        key: 'id'
      }
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deviceid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    renewaldate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    HandshakDatetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    MaxSpeed: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    IsACC: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    BatteryPercentage: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ModifiedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SleepMode: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    GPRSInterval: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '10'
    },
    GPRSStopInterval: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    Arm: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    OdoMeter: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    HeartbeatInterval: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '1'
    },
    Relay: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    Siren: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    UserDefined: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    DoorLock: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    DoorUnlock: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    TimeZone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    DeviceType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idSalesAgent: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    LastArmSetting: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    IsShared: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    InsurenceDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    PUCDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    idType: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    Movement: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    ACC: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: '0.00'
    },
    ShareCode: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblvehicle'
  });
};
