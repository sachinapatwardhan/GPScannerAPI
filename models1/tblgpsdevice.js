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
      type: DataTypes.STRING,
      allowNull: false
    },
    IMEI: {
      type: DataTypes.STRING,
      allowNull: false
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Version: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: true
    },
    idSalesAgent: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tbluserinformation',
        key: 'id'
      }
    },
    IsActive: {
      type: DataTypes.INTEGER(2),
      allowNull: true,
      defaultValue: '0'
    },
    ExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblgpsdevice'
  });
};
