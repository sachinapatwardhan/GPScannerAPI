/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblsos', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    deviceid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sosNumbers: {
      type: DataTypes.STRING,
      allowNull: true
    },
    flgNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'tblsos'
  });
};
