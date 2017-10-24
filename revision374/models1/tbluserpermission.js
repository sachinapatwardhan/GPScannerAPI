/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbluserpermission', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idModule: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblmodulemgmt',
        key: 'id'
      }
    },
    RoleName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Added: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    Modified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    Deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    Show: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'tbluserpermission'
  });
};
