'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('healthGuides', {
      id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    dayNumber: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    title: {
      type: Sequelize.JSON,
      allowNull: false
    },
    description: {
      type: Sequelize.JSON,
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
    await queryInterface.dropTable('healthGuides');
  }
};