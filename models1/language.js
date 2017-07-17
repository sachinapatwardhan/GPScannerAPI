/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('language', {
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
    LanguageCulture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UniqueSeoCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    FlagImageFileName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Rtl: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    LimitedToStores: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    DefaultCurrencyId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Published: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    DisplayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'language'
  });
};
