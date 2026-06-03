'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Hospitals', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('Hospitals', 'hospitalLogo', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Hospitals', 'verificationDocuments', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Hospitals', 'adminFullName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Hospitals', 'deliveryFee', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Hospitals', 'medicalLicenseNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Hospitals', 'medicalLicenseNumber');
    await queryInterface.removeColumn('Hospitals', 'deliveryFee');
    await queryInterface.removeColumn('Hospitals', 'adminFullName');
    await queryInterface.removeColumn('Hospitals', 'verificationDocuments');
    await queryInterface.removeColumn('Hospitals', 'hospitalLogo');

    await queryInterface.changeColumn('Hospitals', 'phoneNumber', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
