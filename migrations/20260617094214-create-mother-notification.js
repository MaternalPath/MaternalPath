'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('motherNotifications', {
      id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    hospitalId: {
      type: Sequelize.UUID,
      references: {
        model: "Hospitals",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    motherId: {
      type: Sequelize.UUID,
      references: {
        model: 'mothers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    dayNumber: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    week: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    title: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    type: {
      type: Sequelize.TEXT,
      allowNull: false,
      enum: ['allNotifications','pregnancyUpdates', 'healthReminders', 'walletAlerts', 'hospitalNotifications'],
      defaultValue: 'allNotifications' 
    },
    isRead: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    time: {
        type: Sequelize.DATE,
        allowNull: false

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
    await queryInterface.dropTable('motherNotifications');
  }
};