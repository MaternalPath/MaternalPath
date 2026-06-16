'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration was originally written for MongoDB (Mongoose) but this
    // project uses Sequelize with MySQL. The Notifications table is now
    // properly created in migration: 20260615200000-create-notifications.js
    // This migration is intentionally left as a no-op to avoid conflicts.
    console.log('Skipping duplicate notifications migration (handled by 20260615200000).');
  },

  async down(queryInterface, Sequelize) {
    // No-op: the table drop is handled by the corresponding down migration
  }
};
