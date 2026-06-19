'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('healthGuidances', {
        id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      motherId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'mothers',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      week: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      thisWeeksFocus: {
        type: Sequelize.STRING,
        allowNull: true
      },
      healthStatus: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nutritionGuidance: [{
        type: Sequelize.STRING,
        allowNull: true
    }],
    hydrationReminder: {
      type: Sequelize.STRING,
      allowNull: true
    },
    foodsToAvoid: [{
      type: Sequelize.STRING,
      allowNull: true
    }],
    sleepAndRest: {
      type: Sequelize.STRING,
      allowNull: true
    },
    stressManagement: {
      type: Sequelize.STRING,
      allowNull: true
    },
    safePhysicalActivity: {
      type: Sequelize.STRING,
      allowNull: true
    },
    mentalWellness: {
      type: Sequelize.STRING,
      allowNull: true
    },
    ironRichFoods: Sequelize.STRING,
    proteinSources: Sequelize.STRING,
    calciumRichFoods: Sequelize.STRING,
    wholeGrains: Sequelize.STRING,
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
    await queryInterface.dropTable('healthGuidances');
  }
};