/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblstickyfooter', {
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
    URL: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblstickyfooter'
  });
};
