/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('tblnotificationmgmt', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        Notification: {
            type: DataTypes.STRING,
            allowNull: true
        },
        IsActive: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: "1"
        },
        AlarmCode: {
            type: DataTypes.CHAR(2),
            allowNull: true
        }
    }, {
        tableName: 'tblnotificationmgmt'
    });
};