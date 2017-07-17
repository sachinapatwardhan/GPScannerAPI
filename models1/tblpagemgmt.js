/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblpagemgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Parent: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PageType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pageImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Slug: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblpagemgmt'
  });
};
