/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblrewardpointssetting', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    ExchangeRate: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    MinimumRewardPointstoUse: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PointsForRegistration: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PointsForPurchases_Amount: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PointsForPurchases_Points: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PointsForPurchases_Awarded: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PointsForPurchases_Canceled: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DisplayHowMuchWillbeEarned: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    PointsAccumulatedForAllStores: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'tblrewardpointssetting'
  });
};
