/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbluserinformation', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ProfileName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdby: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    modifiedby: {
      type: DataTypes.STRING,
      allowNull: true
    },
    modifieddate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    OTP: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsMobileVerify: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    CountryCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PrivacyPolicy: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Age: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ShopName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PersonInCharge: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsSecurity: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MaxSpeed: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    OwnerName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OwnerPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OwnerEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OwnerPassword: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsOwnerSecurity: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
    },
    OwnerImage: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tbluserinformation'
  });
};
