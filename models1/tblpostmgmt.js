/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblpostmgmt', {
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
    Title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IdCategory: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblcategory',
        key: 'id'
      }
    },
    ImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsCommentOption: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedOnUtc: {
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
    },
    PdfUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblpostmgmt'
  });
};
