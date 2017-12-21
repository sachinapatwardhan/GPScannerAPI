/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('productattributevalue', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ProductAttributeMappingId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'product_productattribute_mapping',
        key: 'Id'
      }
    },
    AttributeValueTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    AssociatedProductId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ColorSquaresRgb: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PriceAdjustment: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    WeightAdjustment: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    Cost: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    Quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    IsPreSelected: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    DisplayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    PictureId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'productattributevalue'
  });
};
