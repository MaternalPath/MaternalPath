'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Hospitals', 'adminFullName');
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Hospitals', 'adminFullName', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
