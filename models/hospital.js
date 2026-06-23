'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hospital extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Hospital.hasMany(models.Mother, {
    foreignKey: 'hospitalId',
    as: 'mothers'
  });
    }
  }
  Hospital.init({
     id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
    hospitalName:{
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
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hospitalLogo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hospitalLogoPublicId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verificationDocuments: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verificationDocumentPublicId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deliveryFee: {
      type: DataTypes.STRING,
      allowNull: true
    },
    medicalLicenseNumber: {
      type: DataTypes.STRING,
      allowNull: true
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
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0  
    },
    lockUntil: {
        type: DataTypes.DATE
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
    modelName: 'Hospital',
    tableName: 'Hospitals'
  });
  return Hospital;
};
