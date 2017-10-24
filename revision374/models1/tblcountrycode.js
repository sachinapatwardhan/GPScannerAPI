/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblcountrycode', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    CountryName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PhoneDialCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsoCode: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblcountrycode'
  });
};
