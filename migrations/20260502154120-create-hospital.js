'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Hospitals', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
    hospitalName:{
      type: Sequelize.STRING,
      allowNull: false
    },

    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false
    },
    hospitalLogo: {
      type: Sequelize.STRING,
      allowNull: true
    },
    hospitalLogoPublicId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    verificationDocuments: {
      type: Sequelize.STRING,
      allowNull: true
    },
    verificationDocumentPublicId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    deliveryFee: {
      type: Sequelize.STRING,
      allowNull: true
    },
    medicalLicenseNumber: {
      type: Sequelize.STRING,
      allowNull: true
    },
    otp: {
      type: Sequelize.STRING
    },
    otpExpiresAt: {
      type: Sequelize.DATE
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
      isBlocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    loginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0  
    },
    lockUntil: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Hospitals');
  }
};
