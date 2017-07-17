/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblmediamgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    FileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Author: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Caption: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AltText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblmediamgmt'
  });
};
