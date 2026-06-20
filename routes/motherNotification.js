const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { getNotifications, markAsRead, markAsUnread, deleteNotification, getUnreadNotifications, getReadNotifications, getRecentNotifications, getNotificationCount, getNotificationsByType } = require('../controller/motherNotification');
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Mother Notifications
 *   description: Notifications for the mother
 */

/**
 * @swagger
 * /api/v1/mothers/notifications:
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
 *                         example: 2024-01-15T08:00:00.000z
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

/**
 * @swagger
 * /api/v1/mothers/stats:
 *   get:
 *     tags:
 *       - Mother Notifications
 *     summary: Get notification statistics
 *     description: Retrieves aggregate notification counts (total, unread, read) for the authenticated mother.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification count retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalNotifications:
 *                       type: integer
 *                       example: 12
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *                     readCount:
 *                       type: integer
 *                       example: 7
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error counting notifications
 *                 error:
 *                   type: string
 */

router.get('/stats', Authentication, getNotificationCount);

/**
 * @swagger
 * /api/v1/mothers/unread:
 *   get:
 *     tags:
 *       - Mother Notifications
 *     summary: Get unread notifications
 *     description: Retrieves a paginated list of unread notifications for the authenticated mother.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Unread notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unread notifications retrieved successfully
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       type:
 *                         type: string
 *                         example: payment_update
 *                       message:
 *                         type: string
 *                         example: Your bill has been approved
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T08:00:00.000z
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching unread notifications
 *                 error:
 *                   type: string
 */

router.get('/unread', Authentication, getUnreadNotifications);

/**
 * @swagger
 * /api/v1/mothers/read:
 *   get:
 *     tags:
 *       - Mother Notifications
 *     summary: Get read notifications
 *     description: Retrieves a paginated list of read notifications for the authenticated mother.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Read notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Read notifications retrieved successfully
 *                 total:
 *                   type: integer
 *                   example: 7
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       type:
 *                         type: string
 *                         example: payment_update
 *                       message:
 *                         type: string
 *                         example: Your bill has been approved
 *                       isRead:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T08:00:00.000z
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching read notifications
 *                 error:
 *                   type: string
 */


router.get('/read', Authentication, getReadNotifications);

/**
 * @swagger
 * /api/v1/mothers/recent:
 *   get:
 *     tags:
 *       - Mother Notifications
 *     summary: Get recent notifications
 *     description: Retrieves the 5 most recent notifications for the authenticated mother, ordered by creation date (descending).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Recent notifications retrieved successfully
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       type:
 *                         type: string
 *                         example: system_notification
 *                       message:
 *                         type: string
 *                         example: Your profile was updated
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T08:00:00.000z
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching recent notifications
 *                 error:
 *                   type: string
 */

router.get('/recent', Authentication, getRecentNotifications);

/**
 * @swagger
 * /api/v1/mothers/count:
 *   get:
 *     tags:
 *       - Mother Notifications
 *     summary: Get notification count
 *     description: Retrieves aggregate notification counts (total, unread, read) for the authenticated mother.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification count retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalNotifications:
 *                       type: integer
 *                       example: 12
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *                     readCount:
 *                       type: integer
 *                       example: 7
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error counting notifications
 *                 error:
 *                   type: string
 */

router.get('/count', Authentication, getNotificationCount);

/**
 * @swagger
 * /api/v1/mothers/type/{type}:
 *   get:
 *     tags:
 *       - Mother Notifications
 *     summary: Get notifications by type
 *     description: Retrieves a paginated list of notifications filtered by type for the authenticated mother.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - allNotifications
 *             - pregnancyUpdates
 *             - healthReminders
 *             - walletAlerts
 *             - hospitalNotifications
 *         description: The notification type to filter by
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Notifications with the given type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifications with type 'walletAlerts' retrieved successfully
 *                 total:
 *                   type: integer
 *                   example: 3
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       type:
 *                         type: string
 *                         example: walletAlerts
 *                       message:
 *                         type: string
 *                         example: Your wallet balance is low
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T08:00:00.000z
 *       400:
 *         description: Invalid type supplied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid status. Must be one of: allNotifications, pregnancyUpdates, healthReminders, walletAlerts, hospitalNotifications"
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching notifications by status
 *                 error:
 *                   type: string
 */

router.get('/type/:type', Authentication, getNotificationsByType);

/**
 * @swagger
 * /api/v1/mothers/{id}/read:
 *   patch:
 *     tags:
 *       - Mother Notifications
 *     summary: Mark notification as read
 *     description: Marks a single notification as read for the authenticated mother.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification marked as read
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     type:
 *                       type: string
 *                       example: payment_update
 *                     message:
 *                       type: string
 *                       example: Your bill has been approved
 *                     isRead:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T08:00:00.000z
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
 *                   example: Notification not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating notification
 *                 error:
 *                   type: string
 */

router.patch('/:id/read', Authentication, markAsRead);

/**
 * @swagger
 * /api/v1/mothers/{id}/unread:
 *   patch:
 *     tags:
 *       - Mother Notifications
 *     summary: Mark notification as unread
 *     description: Marks a single notification as unread for the authenticated mother.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as unread
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification marked as unread
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     type:
 *                       type: string
 *                       example: payment_update
 *                     message:
 *                       type: string
 *                       example: Your bill has been approved
 *                     isRead:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T08:00:00.000z
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
 *                   example: Notification not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating notification
 *                 error:
 *                   type: string
 */

router.patch('/:id/unread', Authentication, markAsUnread);

/**
 * @swagger
 * /api/v1/mothers/notifications/{id}:
 *   delete:
 *     tags:
 *       - Mother Notifications
 *     summary: Delete notification
 *     description: Permanently deletes a single notification for the authenticated mother.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification deleted successfully
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
 *                   example: Notification not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting notification
 *                 error:
 *                   type: string
 */


router.delete('/:id', Authentication, deleteNotification);

module.exports = router