/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblorderitem', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    OrderId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblorder',
        key: 'id'
      }
    },
    ProductName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idOrderStatus: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblorderstatus',
        key: 'id'
      }
    },
    Quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    UnitPriceInclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    UnitPriceExclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    PriceInclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    PriceExclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    DiscountAmountInclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    DiscountAmountExclTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    OriginalProductCost: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    AttributeDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AttributesXml: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DownloadCount: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    IsDownloadActivated: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    LicenseDownloadId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ItemWeight: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UOM: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Attribute: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AttributeValue: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblorderitem'
  });
};
