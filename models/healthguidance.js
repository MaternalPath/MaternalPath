'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class healthGuidance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  healthGuidance.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    motherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'mothers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    week: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    thisWeeksFocus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    healthStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nutritionGuidance: [{
      type: DataTypes.STRING,
      allowNull: true
  }],
  hydrationReminder: {
    type: DataTypes.STRING,
    allowNull: true
  },
  foodsToAvoid: [{
    type: DataTypes.STRING,
    allowNull: true
  }],
  sleepAndRest: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stressManagement: {
    type: DataTypes.STRING,
    allowNull: true
  },
  safePhysicalActivity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mentalWellness: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ironRichFoods: DataTypes.STRING,
    proteinSources: DataTypes.STRING,
    calciumRichFoods: DataTypes.STRING,
    wholeGrains: DataTypes.STRING,
  createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
  }, {
    sequelize,
    modelName: 'healthGuidance',
  });
  return healthGuidance;
};