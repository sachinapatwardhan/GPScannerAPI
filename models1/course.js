/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('course', {
    CourseId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Duration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ShortName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'course'
  });
};
