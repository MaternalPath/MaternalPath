'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    title: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    },
    time: {
      type: Sequelize.STRING,
      allowNull: true
    },
    dayNumber: {
      type: Sequelize.STRING,
      allowNull: true
    },
    week: {
      type: Sequelize.STRING,
      allowNull: true
    },
    notificationType: {
      type: Sequelize.STRING,
      allowNull: true,
      visible: true
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
      enum: ['unread','read'],
      defaultValue: 'unread'
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
    await queryInterface.dropTable('notifications');
  }
};