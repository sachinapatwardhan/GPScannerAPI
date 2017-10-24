/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('taxrate', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    StoreId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    TaxCategoryId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    CountryId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    StateProvinceId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Zip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Percentage: {
      type: DataTypes.DECIMAL,
      allowNull: false
    }
  }, {
    tableName: 'taxrate'
  });
};
