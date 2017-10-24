/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbltmporderdetail', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idUser: {
      type: DataTypes.STRING,
      allowNull: false
    },
    OrderNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PaymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tbltmporderdetail'
  });
};
