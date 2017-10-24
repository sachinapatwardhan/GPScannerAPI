/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblcountrymgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Code: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ShortName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Seq: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ModifiedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModifiedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsEurope: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'tblcountrymgmt'
  });
};
