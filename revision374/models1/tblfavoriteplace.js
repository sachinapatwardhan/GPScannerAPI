/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('tblfavoriteplace', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        DeviceId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        Range: {
            type: DataTypes.STRING,
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
        IsInFavoritePlace: {
            type: DataTypes.INTEGER(1),
            allowNull: true
        },
        CreatedDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        CreatedBy: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ModifiedDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        ModifiedBy: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'tblfavoriteplace'
    });
};