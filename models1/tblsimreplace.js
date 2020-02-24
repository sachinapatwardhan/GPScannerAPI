/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblsimreplace', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    OldSim: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    NewSim: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    idApp: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblsimreplace'
  });
};
