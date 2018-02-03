/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblfeedback', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    IdUser: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    AppsUserFriendly: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    GPSAccuracy: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    TrackLocLiverate: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    TrackLocHistory: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Notificaton: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblfeedback'
  });
};
