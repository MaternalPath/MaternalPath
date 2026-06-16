'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      hospitalId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Hospitals',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM(
          'verification_alert',
          'pending_review',
          'bill_upload_update',
          'payment_update',
          'system_notification',
          'general'
        ),
        allowNull: false,
        defaultValue: 'general'
      },
      status: {
        type: Sequelize.ENUM('info', 'warning', 'success', 'error'),
        allowNull: false,
        defaultValue: 'info'
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // Add indexes for faster queries
    await queryInterface.addIndex('Notifications', ['hospitalId']);
    await queryInterface.addIndex('Notifications', ['type']);
    await queryInterface.addIndex('Notifications', ['isRead']);
    await queryInterface.addIndex('Notifications', ['createdAt']);
    await queryInterface.addIndex('Notifications', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  }
};