/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbldynamicpagemgmt', {
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
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PageContent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isPublish: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Slug: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MetaTag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MetaDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isHomePage: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ModifiedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tbldynamicpagemgmt'
  });
};
