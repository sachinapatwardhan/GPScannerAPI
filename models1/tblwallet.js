/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblwallet', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idwalletTransaction: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblwallettransaction',
        key: 'id'
      }
    },
    Amount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Remark: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Createdby: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblwallet'
  });
};
