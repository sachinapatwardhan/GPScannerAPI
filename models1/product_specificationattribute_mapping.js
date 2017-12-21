/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_specificationattribute_mapping', {
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
    AttributeTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    SpecificationAttributeOptionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'specificationattributeoption',
        key: 'Id'
      }
    },
    CustomValue: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AllowFiltering: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    ShowOnProductPage: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    DisplayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    SpecificationAttributeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'product_specificationattribute_mapping'
  });
};
