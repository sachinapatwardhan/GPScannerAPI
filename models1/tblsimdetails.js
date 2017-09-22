/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('tblsimdetails', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        SerialNum: {
            type: DataTypes.STRING,
            allowNull: true
        },
        PhoneNum: {
            type: DataTypes.STRING,
            allowNull: true
        },
        CreatedDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        idTelCo: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }
    }, {
        tableName: 'tblsimdetails'
    });
};