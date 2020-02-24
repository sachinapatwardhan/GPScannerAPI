/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbwarrantyreplace', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    OldDevice: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    NewDevice: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    IsReuseSim: {
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
    tableName: 'tbwarrantyreplace'
  });
};
