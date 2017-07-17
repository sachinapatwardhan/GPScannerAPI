/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblgpsdevice', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DeviceId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IMEI: {
      type: DataTypes.STRING,
      allowNull: false
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Latitude: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Longitude: {
      type: DataTypes.STRING,
      allowNull: true
    },
    speed: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Direction: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsOldDevice: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '1'
    },
    Version: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CarrierId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblcarrier',
        key: 'id'
      }
    },
    CountryId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'tblcountrymgmt',
        key: 'id'
      }
    }
  }, {
    tableName: 'tblgpsdevice'
  });
};
