/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('productreviewhelpfulness', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ProductReviewId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'productreview',
        key: 'Id'
      }
    },
    WasHelpful: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    CustomerId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tbluserinformation',
        key: 'id'
      }
    }
  }, {
    tableName: 'productreviewhelpfulness'
  });
};
