/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblbike', {
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
    bikeimageURl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bikeNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    microchipped: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    nameplate: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    deviceid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    macname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    renewaldate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DeviceBattery: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    mode: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      defaultValue: '0'
    },
    IsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    IsCharging: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    IMEINumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CurrentWifi: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeviceModel: {
      type: DataTypes.STRING,
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
    Weight: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeviceType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsOldDevice: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    Gsercer: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    Buyer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsWireCut: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsFenceOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    IsInFence: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
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
    IsACCEnable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'tblbike'
  });
};
