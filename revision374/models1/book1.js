/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('book1', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Publisher: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Isbn: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Time: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    tableName: 'book1'
  });
};
