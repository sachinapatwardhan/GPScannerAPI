/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgpsdeletecash', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idVehicle: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idUser: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblgpsdeletecash'
  });
};
