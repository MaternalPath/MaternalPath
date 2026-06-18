const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { getNotifications } = require('../controller/motherNotification');
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Mother Notifications
 *   description: Trimester information and pregnancy tracking
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     tags:
 *       - Mother Notifications
 *     summary: Get mother notifications
 *     description: Retrieves all notifications for the authenticated mother based on her current pregnancy week and day, scheduled for delivery at 8:00 AM daily
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All notifications
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       week:
 *                         type: integer
 *                         example: 12
 *                       dayNumber:
 *                         type: integer
 *                         example: 84
 *                       message:
 *                         type: string
 *                         example: Your baby is now the size of a lime!
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T08:00:00.000Z
 *                       time:
 *                         type: string
 *                         example: 2 hours ago
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother update not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.get('/notifications', Authentication ,getNotifications)

module.exports = router