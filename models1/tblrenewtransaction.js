/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblrenewtransaction', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    idUser: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    idApp: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Amount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsComplete: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: '0'
    },
    CompletedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Remark: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CompletedBy: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblrenewtransaction'
  });
};
