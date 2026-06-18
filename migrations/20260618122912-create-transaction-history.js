'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactionHistories', {
      id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    motherId: {
      type: Sequelize.UUID,
      references: {
        model: 'mothers',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    transactionType: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "Contribution"
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "monthly savings deposit"
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      enum: ['Pending','Completed', 'Failed'],
      defaultValue: 'Pending'
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
    await queryInterface.dropTable('transactionHistories');
  }
};