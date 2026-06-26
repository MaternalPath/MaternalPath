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
              imagePublicId: {
                type: Sequelize.STRING,
                allowNull: false
              },
            dateOfBirth: {
                type: Sequelize.STRING,
                allowNull: true
              },
            estimatedDueDate: {
                type: Sequelize.DATEONLY,
                allowNull: true
              },
            trimester: {
                type: Sequelize.STRING,
                allowNull: true
              },
            bloodType: {
                type: Sequelize.STRING,
                allowNull: true
              },
            existingHealthConditions: {
                type: Sequelize.STRING,
                allowNull: true
              },
            allergies: {
                type: Sequelize.STRING,
                allowNull: true
              },
            currentPregnancyWeek: {
                type: Sequelize.INTEGER,
                allowNull: true
             },
            pregnancyProgress: {
                type: Sequelize.INTEGER,
                allowNull: true
             },
            daysUntilDueDate: {
                type: Sequelize.INTEGER,
                allowNull: true
             },
            emergencyContactName: {
                type: Sequelize.STRING,
                allowNull: true
             },
            emergencyContactNumber: {
                type: Sequelize.STRING,
                allowNull: true
             },
            selectedHospital: {
                type: Sequelize.STRING,
                allowNull: true
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
                allowNull: true
             },
            address: {
                type: Sequelize.STRING,
                allowNull: true
             },
            weeklyContribution: {
                type: Sequelize.STRING,
                allowNull: true
             },
            linkedPaymentMethod: {
                type: Sequelize.STRING,
                allowNull: true
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