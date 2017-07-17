/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('student', {
    StudentId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    FirstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    LastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BirthDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CourseId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'course',
        key: 'CourseId'
      }
    },
    Gender: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'student'
  });
};
