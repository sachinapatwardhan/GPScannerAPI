/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblpet', {
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
    petimageURl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Collartagname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pettype: {
      type: DataTypes.STRING,
      allowNull: false
    },
    petlocation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: false
    },
    microchipped: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    nameplate: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    petinsurance: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    deviceid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    macname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    renewaldate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    DeviceBattery: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    mode: {
      type: DataTypes.CHAR(1),
      allowNull: false,
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
    IsInFence: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
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
    IsFenceOnline: {
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
    Breed: {
      type: DataTypes.STRING,
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
    PetroverTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblpet'
  });
};
