/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblinquirymgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    EmailId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Status: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CreatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Region: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblinquirymgmt'
  });
};
