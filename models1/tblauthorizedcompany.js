/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblauthorizedcompany', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    FullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    PreferredName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    HandPhoneNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CompanyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    CompanyNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    OfficeNo1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    OfficeNo2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OfficeHPNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Fax: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    OpeningHour: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ClosingHour: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Monday: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Tuesday: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Wednesday: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Thursday: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Friday: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Saturday: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Sunday: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'tblauthorizedcompany'
  });
};
