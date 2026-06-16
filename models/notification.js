'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  notification.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    time: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dayNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    week: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notificationType: {
      type: DataTypes.STRING,
      allowNull: true,
      visible: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      enum: ['unread','read'],
      defaultValue: 'unread'
    },
    createdAt: {
        type: DataTypes.DATE,
        visible: false

      },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
  }, {
    sequelize,
    modelName: 'notification',
    tableName: 'notifications'
  });
  return notification;
};