/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblserviceenhancementnotification', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    IdServiceEnhancement: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    idvehicle: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Message: {
      type: DataTypes.STRING,
      allowNull: true
    },
    days: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    IsRead: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'tblserviceenhancementnotification'
  });
};
