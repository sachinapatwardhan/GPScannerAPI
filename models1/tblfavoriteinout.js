/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblfavoriteinout', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Latitude: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Longitude: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GPSPositioning: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    Speed: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Direction: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Code: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Datetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Date: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    tableName: 'tblfavoriteinout'
  });
};
