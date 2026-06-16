const express = require('express');
const { Authentication } = require('../middlewares/auth');
const {
  createNotification,
  getNotifications,
//   getNotificationById,
  markAsRead,
  markAsUnread,
  deleteNotification,
  getUnreadNotifications,
  getReadNotifications,
  getNotificationsByType,
  getNotificationsByStatus,
  getRecentNotifications,
  getNotificationCount,
  getNotificationStats,
  createSystemNotification
} = require('../controller/notification');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management APIs
 */

/**
 * @swagger
 * /api/v1/notifications/create:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 description: Hospital ID (optional. If omitted, notification is system-wide)
 *               title:
 *                 type: string
 *                 example: New Verification Request
 *               message:
 *                 type: string
 *                 example: A new verification request has been submitted.
 *               type:
 *                 type: string
 *                 enum: [verification_alert, pending_review, bill_upload_update, payment_update, system_notification, general]
 *                 default: general
 *               status:
 *                 type: string
 *                 enum: [info, warning, success, error]
 *                 default: info
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/create', Authentication, createNotification);

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get all notifications (paginated)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', Authentication, getNotifications);

/**
 * @swagger
 * /api/v1/notifications/stats:
 *   get:
 *     summary: Get notification dashboard statistics
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalNotifications:
 *                       type: integer
 *                       example: 6
 *                     pendingReviews:
 *                       type: integer
 *                       example: 8
 *                     verificationAlerts:
 *                       type: integer
 *                       example: 15
 *                     billUploadUpdates:
 *                       type: integer
 *                       example: 6
 *                     unreadCount:
 *                       type: integer
 *                       example: 3
 */
router.get('/stats', Authentication, getNotificationStats);

/**
 * @swagger
 * /api/v1/notifications/unread:
 *   get:
 *     summary: Get all unread notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Unread notifications retrieved successfully
 */
router.get('/unread', Authentication, getUnreadNotifications);

/**
 * @swagger
 * /api/v1/notifications/read:
 *   get:
 *     summary: Get all read notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Read notifications retrieved successfully
 */
router.get('/read', Authentication, getReadNotifications);

/**
 * @swagger
 * /api/v1/notifications/recent:
 *   get:
 *     summary: Get the 5 most recent notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent notifications retrieved successfully
 */
router.get('/recent', Authentication, getRecentNotifications);

/**
 * @swagger
 * /api/v1/notifications/count:
 *   get:
 *     summary: Get notification counts (total, unread, read)
 *     tags: [Notifications]
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalNotifications:
 *                       type: integer
 *                     unreadCount:
 *                       type: integer
 *                     readCount:
 *                       type: integer
 */
router.get('/count', Authentication, getNotificationCount);

/**
 * @swagger
 * /api/v1/notifications/type/{type}:
 *   get:
 *     summary: Get notifications by type
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [verification_alert, pending_review, bill_upload_update, payment_update, system_notification, general]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Notifications by type retrieved successfully
 *       400:
 *         description: Invalid type
 */
router.get('/type/:type', Authentication, getNotificationsByType);

/**
 * @swagger
 * /api/v1/notifications/status/{status}:
 *   get:
 *     summary: Get notifications by status
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [info, warning, success, error]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Notifications by status retrieved successfully
 *       400:
 *         description: Invalid status
 */
router.get('/status/:status', Authentication, getNotificationsByStatus);

// /**
//  * @swagger
//  * /api/v1/notifications/{id}:
//  *   get:
//  *     summary: Get a single notification by ID
//  *     tags: [Notifications]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *     responses:
//  *       200:
//  *         description: Notification retrieved successfully
//  *       404:
//  *         description: Notification not found
//  */
// router.get('/:id', Authentication, getNotificationById);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/read', Authentication, markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/unread:
 *   patch:
 *     summary: Mark a notification as unread
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as unread
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/unread', Authentication, markAsUnread);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', Authentication, deleteNotification);

/**
 * @swagger
 * /api/v1/notifications/create-system:
 *   post:
 *     summary: Create a system notification for ALL hospitals (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 example: Scheduled Maintenance
 *               message:
 *                 type: string
 *                 example: The system will be down for maintenance tonight.
 *               type:
 *                 type: string
 *                 default: system_notification
 *               status:
 *                 type: string
 *                 default: warning
 *     responses:
 *       201:
 *         description: System notification sent to all hospitals
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/create-system', Authentication, createSystemNotification);

module.exports = router;