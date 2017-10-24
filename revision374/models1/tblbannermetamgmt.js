/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblbannermetamgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idBanner: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblbannermgmt',
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
    tableName: 'tblbannermetamgmt'
  });
};
