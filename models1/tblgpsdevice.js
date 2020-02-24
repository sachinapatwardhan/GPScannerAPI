/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgpsdevice', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DeviceId: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    IMEI: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Type: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    Version: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CountryId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblcountrymgmt',
        key: 'id'
      }
    },
    TelCoId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tbltelco',
        key: 'id'
      }
    },
    SimNum: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    idSalesAgent: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    IsActive: {
      type: DataTypes.INTEGER(2),
      allowNull: true,
      defaultValue: '0'
    },
    ExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    AppName: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    idSim: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ActivationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Company: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Maark'
    },
    Status: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    Remark: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'tblgpsdevice'
  });
};
