/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblhandshake', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Datetime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'tblhandshake'
  });
};
