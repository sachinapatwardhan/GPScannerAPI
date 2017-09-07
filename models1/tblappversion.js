/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblappversion', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AndroidVersion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AndroidURL: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IOSVersion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IOSURL: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UpdateAppText: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblappversion'
  });
};
