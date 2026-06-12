'use strict';
const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital"
      },

      title: {
        type: String,
        required: true
      },

      message: {
        type: String,
        required: true
      },

      type: {
        type: String,
        enum: [
          "verification",
          "authorization",
          "otp",
          "approval",
          "declined"
        ]
      },

      isRead: {
        type: Boolean,
        default: false
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);