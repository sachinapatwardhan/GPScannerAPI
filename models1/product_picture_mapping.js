/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_picture_mapping', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ProductId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'product',
        key: 'Id'
      }
    },
    PictureId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblmediamgmt',
        key: 'id'
      }
    },
    DisplayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'product_picture_mapping'
  });
};
