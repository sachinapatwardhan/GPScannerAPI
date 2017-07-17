/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgrooming', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    PetId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblpet',
        key: 'id'
      }
    },
    VendorId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblmerchant',
        key: 'id'
      }
    },
    Weight: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Size: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsFullGrooming: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsNailCutting: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsFurColouring: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    GroomPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    NailCuttingPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    FurColouringPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    TotalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    BookDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UpdatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblgrooming'
  });
};
