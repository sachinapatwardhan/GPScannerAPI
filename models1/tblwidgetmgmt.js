/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblwidgetmgmt', {
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
    Design: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Position: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    URL: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Heading: {
      type: DataTypes.STRING,
      allowNull: true
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
    },
    CmsType: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblwidgetmgmt'
  });
};
