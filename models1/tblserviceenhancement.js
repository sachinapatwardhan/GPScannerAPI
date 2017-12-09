/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblserviceenhancement', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idvehicle: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    idUser: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Fromdate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Todate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ModifiedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Currentkm: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Expiredkm: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    WorkShop: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ContectNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsComplete: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'tblserviceenhancement'
  });
};
