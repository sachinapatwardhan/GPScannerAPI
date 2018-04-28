/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblvehicletype', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsActive: {
      type: DataTypes.INTEGER(2),
      allowNull: true,
      defaultValue: '0'
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OnIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OffIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ActiveIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PowerCuttIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LocateOnIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LocateOffIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LocateActiveIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LocatePowerCuttIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LocateIsRotate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
    },
    idApp: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'tblvehicletype'
  });
};
