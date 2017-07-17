/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblemailsettingsys', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DefaultEmailFrom: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NotificationEmailTo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EEMandrillKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EEDefaultFrom: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EEValidateEmailAddresses: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'tblemailsettingsys'
  });
};
