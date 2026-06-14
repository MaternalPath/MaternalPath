'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('uploadedBills', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      // hospitalId: {
      //         type: Sequelize.UUID,
      //         references: {
      //           model: "Hospitals",
      //           key: "id",
      //         },
      //         onDelete: "CASCADE",
      //         onUpdate: "CASCADE",
      //        },
      // billId: {
      //   type: Sequelize.STRING,
      //   allowNull: false
      // },
      fullName: {
        type: Sequelize.STRING
      },
      maternalId: {
        type: Sequelize.STRING
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      expectedDeliveryDate: {
        type: Sequelize.DATE
      },
      referenceNumber: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER
      },
      billNumber: {
        type: Sequelize.STRING
      },
      billingDate: {
        type: Sequelize.DATE
      },
      dueDate: {
        type: Sequelize.DATE
      },
      verificationWorkFlow: {
        type: Sequelize.STRING,
        enum: [ 'uploadedBill', 'customerReview', 'fundValidation', 'finalApproval']
      },
      systemValidation: {
        type: Sequelize.STRING,
        enum: ['patienceIdMatched', 'fileUploadedProgress', 'billingVerification', 'requiredFieldComplete']
      },
      billSummary: {
        type: Sequelize.STRING,
        enum: ['patienceName', 'category', 'date', 'totalAmount']
      },
      documentUpload: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('uploadedBills');
  }
};