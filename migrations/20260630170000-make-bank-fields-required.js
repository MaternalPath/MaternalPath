'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('uploadedBills', 'accountNumber', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('uploadedBills', 'bankName', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('uploadedBills', 'accountName', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('uploadedBills', 'accountNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('uploadedBills', 'bankName', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('uploadedBills', 'accountName', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};