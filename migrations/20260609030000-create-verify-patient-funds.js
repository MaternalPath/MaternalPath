'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patientFundVerifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      patientName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      maternalId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'mothers',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
      hospitalName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pregnancyWeek: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      walletBalance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      savingsGoal: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      goalPercentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Pending'
      },
      readiness: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Just Started'
      },
      notes: {
        type: Sequelize.STRING,
        allowNull: true
      },
      verifiedBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.dropTable('patientFundVerifications');
  }
};
