'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class uploadedBill extends Model {
    static associate(models) {
      uploadedBill.belongsTo(models.Hospital, {
        foreignKey: 'hospitalId',
        as: 'hospital'
      });
      uploadedBill.belongsTo(models.Mother, {
        foreignKey: 'motherId',
        as: 'mother'
      });
    }
  }
  uploadedBill.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    // hospitalId: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   references: {
    //     model: 'Hospitals',
    //     key: 'id'
    //   },
    //   onDelete: 'CASCADE',
    //   onUpdate: 'CASCADE'
    // },
    // billId: {
    //   type: DataTypes.STRING,
    //   allowNull: false
    // },
    fullName: DataTypes.STRING,
    maternalId: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    expectedDeliveryDate: DataTypes.DATE,
    referenceNumber: DataTypes.STRING,
    category: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    billNumber: DataTypes.STRING,
    billingDate: DataTypes.DATE,
    dueDate: DataTypes.DATE,
    verificationWorkFlow: {
      type: DataTypes.STRING,
      values: ['uploadedBill', 'customerReview', 'fundValidation', 'finalApproval']
    },
    systemValidation: {
      type: DataTypes.STRING,
      values: ['patienceIdMatched', 'fileUploadedProgress', 'billingVerification', 'requiredFieldComplete']
    },
    billSummary: {
      type: DataTypes.STRING,
      values: ['patienceName', 'category', 'date', 'totalAmount']
    },
    documentUpload: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'uploadedBill',
    tableName: 'uploadedBills'
  });
  return uploadedBill;
};