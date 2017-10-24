/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblcondition', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Condition: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tblcondition'
  });
};
