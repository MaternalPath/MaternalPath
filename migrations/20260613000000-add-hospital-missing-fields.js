'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Hospitals');

    if (!table.hospitalLogo) {
      await queryInterface.addColumn('Hospitals', 'hospitalLogo', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!table.verificationDocuments) {
      await queryInterface.addColumn('Hospitals', 'verificationDocuments', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!table.deliveryFee) {
      await queryInterface.addColumn('Hospitals', 'deliveryFee', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!table.medicalLicenseNumber) {
      await queryInterface.addColumn('Hospitals', 'medicalLicenseNumber', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Hospitals');

    if (table.hospitalLogo) {
      await queryInterface.removeColumn('Hospitals', 'hospitalLogo');
    }

    if (table.verificationDocuments) {
      await queryInterface.removeColumn('Hospitals', 'verificationDocuments');
    }

    if (table.deliveryFee) {
      await queryInterface.removeColumn('Hospitals', 'deliveryFee');
    }

    if (table.medicalLicenseNumber) {
      await queryInterface.removeColumn('Hospitals', 'medicalLicenseNumber');
    }
  }
};