/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblroutemarker', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    MarkerName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Lat: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Lng: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IdRoute: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    IsInRouteMarker: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'tblroutemarker'
  });
};
