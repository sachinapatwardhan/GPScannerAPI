/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblappoption', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idApp: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Value: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblappoption'
  });
};
