/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('discount', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DiscountTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    UsePercentage: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    DiscountPercentage: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    DiscountAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    StartDateUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    EndDateUtc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    RequiresCouponCode: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    CouponCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DiscountLimitationId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    LimitationTimes: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    MaximumDiscountedQuantity: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'discount'
  });
};
