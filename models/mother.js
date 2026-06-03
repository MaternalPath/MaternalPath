module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Mother extends Model {
    static associate(models) {
      // define association here
    }
  }

  Mother.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    edd: {
      type: DataTypes.STRING
    },
    amount: {
      type: DataTypes.INTEGER
    },
    otp: {
      type: DataTypes.STRING
    },
    otpExpiresAt: {
      type: DataTypes.DATE
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Mother',
    tableName: 'mothers'
  });

  return Mother;
};