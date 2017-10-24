/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbltermsmgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Terms: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'tbltermsmgmt'
  });
};
