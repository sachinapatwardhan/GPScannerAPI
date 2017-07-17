/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbltaxsetteres', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    EnableTax: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PriceEnteredWithTax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ShippingTaxClose: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    DefaultAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DisplayPriceInShop: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    PriceSuffix: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DisplayPriceDuringCart: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    DisplayTaxTotal: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    tableName: 'tbltaxsetteres'
  });
};
