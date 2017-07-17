/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('discount_appliedtocategories', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Category_Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblcategorymgmt',
        key: 'id'
      }
    },
    Discount_Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'discount',
        key: 'Id'
      }
    }
  }, {
    tableName: 'discount_appliedtocategories'
  });
};
