/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblboarding', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    PetId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblpet',
        key: 'id'
      }
    },
    VendorId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblmerchant',
        key: 'id'
      }
    },
    Size: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Weight: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CheckInDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CheckOutDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsBoarding: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsFoodAndDrink: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    BoardingPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    FoodDrinkPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    TotalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UpdatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblboarding'
  });
};
