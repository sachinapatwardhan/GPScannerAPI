/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('productattributecombination', {
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
    AttributesXml: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    StockQuantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    AllowOutOfStockOrders: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Sku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ManufacturerPartNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Gtin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OverriddenPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    NotifyAdminForQuantityBelow: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    AttributeString: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AttributeValueString: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'productattributecombination'
  });
};
