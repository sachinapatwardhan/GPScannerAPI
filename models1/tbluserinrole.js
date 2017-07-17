/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbluserinrole', {
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      primaryKey: true,
      references: {
        model: 'tbluserinformation',
        key: 'id'
      }
    },
    roleId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      primaryKey: true,
      references: {
        model: 'tblrole',
        key: 'id'
      }
    }
  }, {
    tableName: 'tbluserinrole'
  });
};
