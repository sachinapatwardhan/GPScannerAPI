/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblemailcheckout', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Enable: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SubscribeOn: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsDontResubscribe: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsDoubleOptIn: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsSendWelcomeEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'tblemailcheckout'
  });
};
