'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('motherUpdates', {
        id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
              },
              hospitalId: {
              type: Sequelize.UUID,
             },
              motherId: {
              type: Sequelize.UUID,
             },
              image: {
        type: Sequelize.STRING,
        allowNull: false
      },
            dateOfBirth: {
                type: Sequelize.STRING,
                allowNull: false
              },
            estimatedDueDate: {
                type: Sequelize.DATEONLY,
                allowNull: false
              },
            trimester: {
                type: Sequelize.STRING,
                allowNull: false
              },
            bloodType: {
                type: Sequelize.STRING,
                allowNull: false
              },
            existingHealthConditions: {
                type: Sequelize.STRING,
                allowNull: false
              },
            allergies: {
                type: Sequelize.STRING,
                allowNull: false
              },
            currentPregnancyWeek: {
                type: Sequelize.INTEGER,
                allowNull: false
             },
            pregnancyProgress: {
                type: Sequelize.INTEGER,
                allowNull: false
             },
            daysUntilDueDate: {
                type: Sequelize.INTEGER,
                allowNull: false
             },
            emergencyContact: {
                type: Sequelize.STRING,
                allowNull: false
             },
            selectedHospital: {
                type: Sequelize.STRING,
                allowNull: false
             },
            hospitalAddress: {
                type: Sequelize.STRING
             },
            hospitalContact: {
                type: Sequelize.STRING
             },
            estimatedDeliveryCost: {
                type: Sequelize.STRING
             },
            savingsGoalAmount: {
                type: Sequelize.STRING,
                allowNull: false
             },
            address: {
                type: Sequelize.STRING,
                allowNull: false
             },
            weeklyContribution: {
                type: Sequelize.STRING,
                allowNull: false
             },
            linkedPaymentMethod: {
                type: Sequelize.STRING,
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
    await queryInterface.dropTable('motherUpdates');
  }
};