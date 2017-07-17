/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblbannermgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    BannerId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblbanner',
        key: 'id'
      }
    },
    ImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    alt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UrlLink: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tblbannermgmt'
  });
};
