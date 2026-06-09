'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mothers', {
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
            firstName: {
                type: Sequelize.STRING,
                allowNull: false
              },
            lastName: {
                type: Sequelize.STRING,
                allowNull: false
              },
            email: {
                type: Sequelize.STRING,
                allowNull: false
        
              },
            phoneNumber: {
                type: Sequelize.STRING
              },
            password: {
                type: Sequelize.STRING,
                allowNull: false
              },
            dateOfBirth: {
                type: Sequelize.STRING,
              },
            estimatedDueDate: {
                type: Sequelize.DATEONLY
              },
            trimester: {
                type: Sequelize.STRING
              },
            bloodType: {
                type: Sequelize.STRING
              },
            existingHealthConditions: {
                type: Sequelize.STRING
              },
            allergies: {
                type: Sequelize.STRING
              },
            currentPregnancyWeek: {
                type: Sequelize.INTEGER
             },
            pregnancyProgress: {
                type: Sequelize.INTEGER
             },
            daysUntilDueDate: {
                type: Sequelize.INTEGER
             },
            emergencyContact: {
                type: Sequelize.STRING
             },
            selectedHospital: {
                type: Sequelize.STRING
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
                type: Sequelize.STRING
             },
            address: {
                type: Sequelize.STRING
             },
            weeklyContribution: {
                type: Sequelize.STRING
             },
            linkedPaymentMethod: {
                type: Sequelize.STRING
             },
             otp: {
                type: Sequelize.STRING
            },
            otpExpiresAt: {
                type: Sequelize.DATE,
            },
            isVerified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            isUpdated: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            role: { type: Sequelize.STRING, enum: ['mother','admin', 'hospital'],defaultValue: 'mother' },
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
    await queryInterface.dropTable('mothers');
  }
};