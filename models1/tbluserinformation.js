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
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idApp: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Notification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
    },
    LastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    AppVersion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Platform: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tbluserinformation'
  });
};
