/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblpaymentsummary', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    MerchantId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TxnModel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    RefNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TxnCur: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TxnAmt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TxnDesc: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TxnId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TxnStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ErrDesc: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Version: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Signature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SettlementCur: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SettlementAmt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OrderNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblpaymentsummary'
  });
};
