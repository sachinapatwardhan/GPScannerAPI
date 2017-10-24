/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblupdation', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    TableName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    UpdatedDateTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblupdation'
  });
};
