'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class motherNotification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  motherNotification.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },

    hospitalId: {
      type: DataTypes.UUID,
      references: {
        model: "Hospitals",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    motherId: {
      type: DataTypes.UUID,
      references: {
        model: 'mothers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    
    dayNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    week: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    title: {
      type: DataTypes.JSON,
      allowNull: false
    },
    description: {
      type: DataTypes.JSON,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      enum: ['allNotifications','pregnancyUpdates', 'healthReminders', 'walletAlerts', 'hospitalNotifications'],
      defaultValue: 'allNotifications' 
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    time: {
        type: DataTypes.DATE,
        allowNull: false

      },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false

      },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
  }, {
    sequelize,
    modelName: 'motherNotification',
  });
  return motherNotification;
};