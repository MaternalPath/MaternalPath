'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Hospitals');

    if (!table.otp) {
      await queryInterface.addColumn('Hospitals', 'otp', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!table.otpExpiresAt) {
      await queryInterface.addColumn('Hospitals', 'otpExpiresAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!table.isVerified) {
      await queryInterface.addColumn('Hospitals', 'isVerified', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Hospitals');

    if (table.isVerified) {
      await queryInterface.removeColumn('Hospitals', 'isVerified');
    }

    if (table.otpExpiresAt) {
      await queryInterface.removeColumn('Hospitals', 'otpExpiresAt');
    }

    if (table.otp) {
      await queryInterface.removeColumn('Hospitals', 'otp');
    }
  }
};
