/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblmenustructure', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idMenu: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblmenumgmt',
        key: 'id'
      }
    },
    idType: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idParent: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Depth: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    NavigationLabel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LeftNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    RightNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ProductCount: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'tblmenustructure'
  });
};
