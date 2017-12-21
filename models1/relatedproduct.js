/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('relatedproduct', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ProductId1: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'product',
        key: 'Id'
      }
    },
    ProductId2: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'product',
        key: 'Id'
      }
    },
    DisplayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'relatedproduct'
  });
};
