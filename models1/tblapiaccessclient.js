/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblapiaccessclient', {
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
    Phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    AppName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ModifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ModifiedBy: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblapiaccessclient'
  });
};
