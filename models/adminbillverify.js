'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class adminBillVerify extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  adminBillVerify.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    motherId: {
      type: DataTypes.UUID,
      references: {
        model: 'mothers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING },    
    otpExpiresAt: { type: DataTypes.DATE },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: { type: DataTypes.STRING, enum: ['mother','admin', 'hospital'],defaultValue: 'admin' },
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
    modelName: 'adminBillVerify',
  });
  return adminBillVerify;
};