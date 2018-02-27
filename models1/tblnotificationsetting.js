/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('tblnotificationsetting', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        idNotification: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        idUser: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        IsNotificationOn: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: "0"
        }
    }, {
        tableName: 'tblnotificationsetting'
    });
};