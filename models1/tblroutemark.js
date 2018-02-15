/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblroutemark', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    MarkName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Lat: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Lng: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IdRoute: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'tblroutemark'
  });
};
