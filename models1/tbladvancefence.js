/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbladvancefence', {
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
    UserId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    range: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    lat: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lng: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fencedraw: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsFenceOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
    }
  }, {
    tableName: 'tbladvancefence'
  });
};
