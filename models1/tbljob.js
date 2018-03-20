/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbljob', {
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
    Type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Detail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StartLatitude: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StartLongitude: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EndLatitude: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EndLongitude: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Pincode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    JobStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    JobEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsDone: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: '0'
    },
    CustomerRefId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CustName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ContactPerson: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CustAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ContactNum: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CustEmail: {
      type: DataTypes.STRING,
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
    },
    IdUser: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'tbljob'
  });
};
