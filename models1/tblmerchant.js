/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblmerchant', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    PetShopId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    UserName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PersonInCharge: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ShopName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OperatingWeeks: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OperatingHours: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CloseOn: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CloseOnPublichHoliday: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    CountryId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    StateId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CityId: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PinCode: {
      type: DataTypes.STRING,
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
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
    },
    IsDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    IsBoarding: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsGrooming: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsProducts: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsVeterinary: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    PriceSlot: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '10'
    },
    MaxBoardingSlot: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '10'
    }
  }, {
    tableName: 'tblmerchant'
  });
};
