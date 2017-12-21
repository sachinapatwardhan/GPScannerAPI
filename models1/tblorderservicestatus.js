/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblorderservicestatus', {
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
    tableName: 'tblorderservicestatus'
  });
};
