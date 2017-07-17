/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblcountrystatemgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idCountry: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblcountrymgmt',
        key: 'id'
      }
    },
    Name: {
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
    }
  }, {
    tableName: 'tblcountrystatemgmt'
  });
};
