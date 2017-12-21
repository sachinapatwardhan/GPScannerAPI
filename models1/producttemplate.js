/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('producttemplate', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ViewPath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DisplayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'producttemplate'
  });
};
