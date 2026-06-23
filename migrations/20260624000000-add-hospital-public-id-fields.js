'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Hospitals');

    if (!table.hospitalLogoPublicId) {
      await queryInterface.addColumn('Hospitals', 'hospitalLogoPublicId', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!table.verificationDocumentPublicId) {
      await queryInterface.addColumn('Hospitals', 'verificationDocumentPublicId', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Hospitals');

    if (table.hospitalLogoPublicId) {
      await queryInterface.removeColumn('Hospitals', 'hospitalLogoPublicId');
    }

    if (table.verificationDocumentPublicId) {
      await queryInterface.removeColumn('Hospitals', 'verificationDocumentPublicId');
    }
  }
};