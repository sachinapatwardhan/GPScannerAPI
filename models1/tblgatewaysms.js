/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgatewaysms', {
    unixTime: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    message: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mtmo: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    deviceId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    gatewayUuid: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    devicePhone: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'tblgatewaysms'
  });
};
