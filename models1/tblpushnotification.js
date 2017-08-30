/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblpushnotification', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    udid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Platform: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PushNotificationId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    iduser: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UserType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MessageCount: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'tblpushnotification'
  });
};
