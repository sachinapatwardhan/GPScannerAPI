/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblagentretailer', {
    agentId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    retailerId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    createdDatetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastModifiedDatetime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblagentretailer'
  });
};
