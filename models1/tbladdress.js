/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbladdress', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Lat: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Lng: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Address: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tbladdress'
  });
};
