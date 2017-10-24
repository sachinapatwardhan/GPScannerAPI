/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblapisresponse', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Response: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Datetime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'tblapisresponse'
  });
};
