/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblinquirylog', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    EnquiryId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tblinquirymgmt',
        key: 'id'
      }
    },
    Subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Body: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tblinquirylog'
  });
};
