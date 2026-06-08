'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class uploadedBill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  uploadedBill.init({
    fullName: DataTypes.STRING,
    maternalId: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    expectedDeliveryDate: DataTypes.DATE,
    referenceNumber: DataTypes.STRING,
    category: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    billingDate: DataTypes.DATE,
    dueDate: DataTypes.DATE,
    verificationWorkFlow: DataTypes.STRING, enum: ['uploadedBill', 'customerReview', 'fundValidation', 'finalApproval'],
    systemValidation: DataTypes.STRING, enum: ['patienceIdMatched', 'fileUploadedProgress', 'billingVerification', 'requiredFieldComplete'],
    billSummary: DataTypes.STRING, enum: ['patienceName', 'category', 'date', 'totalAmount'],
    documentUpload: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'uploadedBill',
  });
  return uploadedBill;
};


