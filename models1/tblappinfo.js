/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblappinfo', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    AppName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BundleId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IOSCertificate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IOSKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AndroidId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AndroidSenderId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ImageLogo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AdminUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    WebAppUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    WebAppLoginLogo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    WebAppHeaderLogo: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblappinfo'
  });
};
