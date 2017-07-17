/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('aclrecord', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    EntityId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    EntityName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    RoleId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblrole',
        key: 'id'
      }
    }
  }, {
    tableName: 'aclrecord'
  });
};
