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

    await queryInterface.addColumn('Hospitals', 'role', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable('Hospitals');

  if (table.medicalLicenseNumber) {
    await queryInterface.removeColumn('Hospitals', 'medicalLicenseNumber');
  }

  if (table.deliveryFee) {
    await queryInterface.removeColumn('Hospitals', 'deliveryFee');
  }

  if (table.adminFullName) {
    await queryInterface.removeColumn('Hospitals', 'adminFullName');
  }

  if (table.verificationDocuments) {
    await queryInterface.removeColumn('Hospitals', 'verificationDocuments');
  }

  if (table.role) {
    await queryInterface.removeColumn('Hospitals', 'role');
  }

  await queryInterface.changeColumn('Hospitals', 'phoneNumber', {
    type: Sequelize.INTEGER,
    allowNull: false
  });
}
};
