/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblmenumgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    MenuLabel: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tblmenumgmt'
  });
};
