/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblbillingaddress', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idUser: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    FirstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Address1: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Address2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CompanyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    City: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idState: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblcountrystatemgmt',
        key: 'id'
      }
    },
    idCountry: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblcountrymgmt',
        key: 'id'
      }
    },
    PostCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    PhoneNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IsDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'tblbillingaddress'
  });
};
