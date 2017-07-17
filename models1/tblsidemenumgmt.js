/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblsidemenumgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    MenuLabel: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tblsidemenumgmt'
  });
};
