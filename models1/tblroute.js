/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblroute', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UserId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Lat: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Lng: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Distance: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsInRoute: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
    },
    IsRouteOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
    }
  }, {
    tableName: 'tblroute'
  });
};
