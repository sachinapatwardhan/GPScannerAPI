/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblsharedemail', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idUser: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    SharedEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblsharedemail'
  });
};
