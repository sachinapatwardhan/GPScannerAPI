/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblpagemetamgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idPage: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblpagemgmt',
        key: 'id'
      }
    },
    MetaKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MetaValue: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblpagemetamgmt'
  });
};
