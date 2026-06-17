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
      hospitalId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Hospitals',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      motherId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'mothers',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      billId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      fullName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      maternalId: {
        type: Sequelize.STRING
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      pregnancyWeek: {
        type: Sequelize.STRING
      },
      expectedDeliveryDate: {
        type: Sequelize.DATE
      },
      preferredHospital: {
        type: Sequelize.STRING
      },
      referenceNumber: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.ENUM('Natural Delivery', 'C section')
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
        type: Sequelize.ENUM('uploadedBill', 'customerReview', 'fundValidation', 'finalApproval'),
        defaultValue: 'uploadedBill'
      },
      systemValidation: {
        type: Sequelize.ENUM('patienceIdMatched', 'fileUploadedProgress', 'billingVerification', 'requiredFieldComplete'),
        defaultValue: 'fileUploadedProgress'
      },
      billSummary: {
        type: Sequelize.ENUM('patienceName', 'category', 'date', 'totalAmount'),
        defaultValue: 'patienceName'
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