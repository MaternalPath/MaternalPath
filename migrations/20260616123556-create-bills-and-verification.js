'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('billsAndVerifications', {
      id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    billREf: {
      type: Sequelize.STRING,
      allowNull: false
    },
    patientName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    hospital: {
      type: Sequelize.STRING,
      allowNull: false
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    uploadDate: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      enum: ['approved','rejected','pendingReview', 'awaitingOTP'],
      defaultValue: 'awaitingOTP'
    },
    action: {
      type: Sequelize.STRING,
      allowNull: false,
      enum: ['review','view'],
      defaultValue: 'review'
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false

      },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('billsAndVerifications');
  }
};