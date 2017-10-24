/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgpstimezone', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    TimeZone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TimeZoneDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblgpstimezone'
  });
};
