/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgpsactivity', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Datetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    TimeZone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SumCheck: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StartTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    EndTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblgpsactivity'
  });
};
