/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblsidemenustructure', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    idMenu: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblsidemenumgmt',
        key: 'id'
      }
    },
    idType: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    idParent: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Depth: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    NavigationLabel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    LeftNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    RightNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'tblsidemenustructure'
  });
};
