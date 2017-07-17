/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbldevicetracking', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    iddevice: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblpet',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lat: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    lang: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    deviceid: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tbldevicetracking'
  });
};
