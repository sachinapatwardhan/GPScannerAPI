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
      type: DataTypes.STRING(200),
      allowNull: true
    },
    deviceid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    renewaldate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsOnline: {
      type: DataTypes.INTEGER(1),
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
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    BatteryPercentage: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ModifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ModifiedBy: {
      type: DataTypes.STRING(100),
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
      type: DataTypes.STRING(100),
      allowNull: true
    },
    IsDelete: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    DeviceType: {
      type: DataTypes.STRING(45),
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
      type: DataTypes.INTEGER(1),
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
      type: DataTypes.STRING(45),
      allowNull: true
    },
    IdGroup: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PUCNo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    RCNo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    LicenceNo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Insurence: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    DriverName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    FuleType: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    FuelCost: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Average: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    FuelRatio: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: '1.00'
    },
    FuelCapacity: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: '0.00'
    },
    IsPowercutoff: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    DeviceCompany: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Maark'
    },
    IsIgnition: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    IsEmail: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    IdleMinute: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '3'
    },
    IsFule: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'tblvehicle'
  });
};
