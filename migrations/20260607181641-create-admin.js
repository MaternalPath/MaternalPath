'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Admins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
                type: Sequelize.STRING,
                allowNull: false
              },
            password: {
                type: Sequelize.STRING,
                allowNull: false
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
              role: { type: Sequelize.STRING, enum: ['mother','admin', 'hospital'],defaultValue: 'admin' },
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
    await queryInterface.dropTable('Admins');
  }
};