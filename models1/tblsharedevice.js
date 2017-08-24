/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblsharedevice', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idUser: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    idSharedUser: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    IsActive: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: "1"
    },
    idVehicle: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblsharedevice'
  });
};
