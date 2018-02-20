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
    SMTPService: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SMTPhost: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SMTPuser: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SMTPpass: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IdApp: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'tblemailsettingsys'
  });
};
