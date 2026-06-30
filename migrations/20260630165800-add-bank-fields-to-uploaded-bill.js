'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('uploadedBills', 'accountNumber', {
      type: Sequelize.STRING(10),
      allowNull: true
    });
    await queryInterface.addColumn('uploadedBills', 'bankName', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('uploadedBills', 'accountName', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('uploadedBills', 'accountNumber');
    await queryInterface.removeColumn('uploadedBills', 'bankName');
    await queryInterface.removeColumn('uploadedBills', 'accountName');
  }
};