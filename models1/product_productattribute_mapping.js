/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_productattribute_mapping', {
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
    ProductAttributeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'productattribute',
        key: 'Id'
      }
    },
    TextPrompt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IsRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    AttributeControlType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DisplayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    ValidationMinLength: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ValidationMaxLength: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ValidationFileAllowedExtensions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ValidationFileMaximumSize: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    DefaultValue: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'product_productattribute_mapping'
  });
};
