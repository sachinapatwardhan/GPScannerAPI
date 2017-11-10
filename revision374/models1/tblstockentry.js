/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblstockentry', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idtype: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tbltype',
        key: 'id'
      }
    },
    entryvalue: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblstockentry'
  });
};
