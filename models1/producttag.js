/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('producttag', {
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
    Product_Id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'product',
        key: 'Id'
      }
    }
  }, {
    tableName: 'producttag'
  });
};
