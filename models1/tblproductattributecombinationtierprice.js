/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblproductattributecombinationtierprice', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ProductAttributeCombinationId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'productattributecombination',
        key: 'Id'
      }
    },
    UserRoleId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Price: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblproductattributecombinationtierprice'
  });
};
