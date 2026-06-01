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
            edd: {
                type: Sequelize.STRING
              },
            amount: {
                type: Sequelize.INTEGER
             },
             otp: {
                type: Sequelize.STRING,
              },
              otpExpiresAt: {
                  type: Sequelize.DATE,
              },
              isVerified: {
                  type: Sequelize.BOOLEAN,
                  default: false
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
    await queryInterface.dropTable('mothers');
  }
};