'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // A notification belongs to a hospital (optional - null for system-wide notifications)
      Notification.belongsTo(models.Hospital, {
        foreignKey: 'hospitalId',
        targetKey: 'id',
        as: 'hospital'
      });
    }
  }

  Notification.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Hospitals',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title is required' },
        len: { args: [2, 255], msg: 'Title must be between 2 and 255 characters' }
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Message is required' }
      }
    },
    type: {
      type: DataTypes.ENUM(
        'verification_alert',
        'pending_review',
        'bill_upload_update',
        'payment_update',
        'system_notification',
        'general'
      ),
      allowNull: false,
      defaultValue: 'general'
    },
    status: {
      type: DataTypes.ENUM('info', 'warning', 'success', 'error'),
      allowNull: false,
      defaultValue: 'info'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'Notifications',
    hooks: {
      // Auto-set type based on status (optional helper)
      beforeCreate: (notification) => {
        if (!notification.type) {
          const statusTypeMap = {
            'warning': 'pending_review',
            'success': 'bill_upload_update',
            'error': 'verification_alert',
            'info': 'general'
          };
          notification.type = statusTypeMap[notification.status] || 'general';
        }
      }
    }
  });

  return Notification;
};