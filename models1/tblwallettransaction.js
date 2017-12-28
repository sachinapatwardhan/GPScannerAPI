/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblwallettransaction', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idApp: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Amount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Remark: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    OrderNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PaymentType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsPaymentSuccess: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ModifiedBy: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblwallettransaction'
  });
};
