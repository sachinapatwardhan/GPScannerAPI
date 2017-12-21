/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_category_mapping', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ProductId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'product',
        key: 'Id'
      }
    },
    CategoryId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblcategorymgmt',
        key: 'id'
      }
    },
    IsFeaturedProduct: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    DisplayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'product_category_mapping'
  });
};
