/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblpagegeneratemgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    PageTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PageName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Slug: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    MetaDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    MetaKeyword: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tblpagegeneratemgmt'
  });
};
