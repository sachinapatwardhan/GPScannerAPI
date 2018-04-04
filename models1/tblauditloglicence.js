/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblauditloglicence', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LicenceNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    OldExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DateDiff: {
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
    Message: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblauditloglicence'
  });
};
