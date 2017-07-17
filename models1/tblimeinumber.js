/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblimeinumber', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    IMEI: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    IsUse: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    }
  }, {
    tableName: 'tblimeinumber'
  });
};
