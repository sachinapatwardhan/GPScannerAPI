/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbllanguageincountry', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    IdLanguage: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Country: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tbllanguageincountry'
  });
};
