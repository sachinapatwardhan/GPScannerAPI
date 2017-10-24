/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('specificationattributeoption', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    SpecificationAttributeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'specificationattribute',
        key: 'Id'
      }
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DisplayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'specificationattributeoption'
  });
};
