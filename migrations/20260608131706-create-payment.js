'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
        allowNull: false
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: false
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
        defaultValue: 'pending'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};