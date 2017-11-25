/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('tbliosimeinumbermapping', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        UDID: {
            type: DataTypes.STRING,
            allowNull: true
        },
        IMEI: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        CreatedDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        Type: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'tbliosimeinumbermapping'
    });
};