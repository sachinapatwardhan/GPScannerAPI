/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tblcompanysetteres', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Address1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Address2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Address3: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Address4: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    State: {
      type: DataTypes.STRING,
      allowNull: true
    },
    City: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Phone1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Phone2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Fax1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Fax2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tblcompanysetteres'
  });
};
