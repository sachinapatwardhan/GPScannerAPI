/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('localizedproperty', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    EntityId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    LanguageId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'language',
        key: 'Id'
      }
    },
    LocaleKeyGroup: {
      type: DataTypes.STRING,
      allowNull: false
    },
    LocaleKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    LocaleValue: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'localizedproperty'
  });
};
