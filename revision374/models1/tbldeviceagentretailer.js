/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbldeviceagentretailer', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    agentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    retailerId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    deviceId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    activatedDatetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiryDatetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdDatetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastModifiedDatetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    simSerial: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'tbldeviceagentretailer'
  });
};
