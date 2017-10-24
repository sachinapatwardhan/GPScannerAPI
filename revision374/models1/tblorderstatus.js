/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblorderstatus', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    OrderStatus: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tblorderstatus'
  });
};
