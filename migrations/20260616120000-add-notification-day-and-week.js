'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('notifications');

    if (!table.dayNumber) {
      await queryInterface.addColumn('notifications', 'dayNumber', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!table.week) {
      await queryInterface.addColumn('notifications', 'week', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('notifications');

    if (table.week) {
      await queryInterface.removeColumn('notifications', 'week');
    }

    if (table.dayNumber) {
      await queryInterface.removeColumn('notifications', 'dayNumber');
    }
  }
};
