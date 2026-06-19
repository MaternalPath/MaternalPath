'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('trimesterSymptoms', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
    whatToExpect:{
      type: Sequelize.TEXT,
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
    await queryInterface.dropTable('trimesterSymptoms');
  }
};