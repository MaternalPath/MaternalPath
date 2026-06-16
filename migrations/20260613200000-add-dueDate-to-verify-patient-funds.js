'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('patientFundVerifications');

    if (!table.dueDate) {
      await queryInterface.addColumn('patientFundVerifications', 'dueDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('patientFundVerifications');

    if (table.dueDate) {
      await queryInterface.removeColumn('patientFundVerifications', 'dueDate');
    }
  }
};
