/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblsystemsetting', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    SiteName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SiteLogo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SiteLoadingImage: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblsystemsetting'
  });
};
