/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('address', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    FirstName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    LastName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Company: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CountryId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblcountrymgmt',
        key: 'id'
      }
    },
    StateProvinceId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblcountrystatemgmt',
        key: 'id'
      }
    },
    City: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Address1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Address2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ZipPostalCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PhoneNumber: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    FaxNumber: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CustomAttributes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CreatedOnUtc: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'address'
  });
};
