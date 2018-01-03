/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblpwa_notification_subscription', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    endpoint: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    auth: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    p256dh: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    iduser: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tbluserinformation',
        key: 'id'
      }
    }
  }, {
    tableName: 'tblpwa_notification_subscription'
  });
};
