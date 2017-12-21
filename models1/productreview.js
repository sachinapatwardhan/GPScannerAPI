/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('productreview', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    CustomerId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tbluserinformation',
        key: 'id'
      }
    },
    ProductId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'product',
        key: 'Id'
      }
    },
    IsApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ReviewText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Rating: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    HelpfulYesTotal: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    HelpfulNoTotal: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    CreatedOnUtc: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'productreview'
  });
};
