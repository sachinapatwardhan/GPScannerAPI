/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblsimdetails', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    SerialNum: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    PhoneNum: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    idTelCo: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    idApp: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    SpoilDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblsimdetails'
  });
};
