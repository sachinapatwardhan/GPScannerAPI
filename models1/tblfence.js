/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblfence', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    range: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    lat: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lng: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fencedraw: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IsInFence: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '1'
    },
    IsFenceOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'tblfence'
  });
};
