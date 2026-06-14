'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * This model uses Mongoose (MongoDB), not Sequelize (PostgreSQL).
     * This migration ensures the MongoDB collection exists with proper indexes
     * to match the notification schema defined in models/notification.js.
     */
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    const collections = await db.listCollections({ name: 'notifications' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('notifications');
    }

    const collection = db.collection('notifications');

    // Create indexes to match schema fields that are commonly queried
    await collection.createIndex({ hospital: 1 }, { background: true });
    await collection.createIndex({ type: 1 }, { background: true });
    await collection.createIndex({ isRead: 1 }, { background: true });
    await collection.createIndex({ createdAt: -1 }, { background: true });
  },

  async down(queryInterface, Sequelize) {
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    await db.dropCollection('notifications');
  }
};