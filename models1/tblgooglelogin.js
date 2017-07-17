/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgooglelogin', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    GoogleId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UserName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblgooglelogin'
  });
};
