/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbljobassigned', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idJob: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    idVehicle: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsDeviceInStart: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: "0"
    },
    IsDeviceInEnd: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: "0"
    }
  }, {
    tableName: 'tbljobassigned'
  });
};
