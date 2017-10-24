/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblstatecitymgmt', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idState: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblcountrystatemgmt',
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
    tableName: 'tblstatecitymgmt'
  });
};
