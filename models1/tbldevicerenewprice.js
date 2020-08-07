/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbldevicerenewprice', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    IdUser: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Price: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    LicenceRenewalType: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    LicenceType: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'tbldevicerenewprice'
  });
};
