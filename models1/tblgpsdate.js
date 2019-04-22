/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgpsdate', {
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
    GPSDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblgpsdate'
  });
};
