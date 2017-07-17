/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('localestringresource', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    LanguageId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'language',
        key: 'Id'
      }
    },
    ResourceName: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ResourceValue: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'localestringresource'
  });
};
