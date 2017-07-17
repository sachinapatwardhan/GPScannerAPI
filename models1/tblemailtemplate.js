/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblemailtemplate', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    EmailSubject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    EmailBody: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    EmailFrom: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblemailtemplate'
  });
};
