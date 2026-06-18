const express = require('express');
const { createFirst, createSecond, createThird, getTrimester, createMessage, weeklyMessage, createDaily, dailyMessage, getNotifications } = require('../controller/trimester');
const { Authentication } = require('../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trimester
 *   description: Trimester information and pregnancy tracking
 */

router.post('/first', createFirst);

router.post('/second', createSecond);

router.post('/third', createThird);

/**
 * @swagger
 * /api/v1/getTrimester:
 *   get:
 *     tags:
 *       - Trimester
 *     summary: Get trimester information
 *     description: Retrieves trimester information based on the authenticated mother's current pregnancy week
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trimester information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 perTrimester:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       whatToExpect:
 *                         type: string
 *                         example: You may experience nausea and fatigue
 *                       nutritionGuidance:
 *                         type: string
 *                         example: Take folic acid and eat iron-rich foods
 *                 trimesterTimeline:
 *                   type: array
 *                   items:
 *                     type: array
 *                     example: ["First Trimester", "Current", "weeks 1-12"]
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       500:
 *         description: Internal server error
 */

router.get('/getTrimester',Authentication , getTrimester)

router.post('/createMessage', createMessage);

/**
 * @swagger
 * /api/v1/weeklyMessage:
 *   get:
 *     tags:
 *       - Trimester
 *     summary: Get weekly pregnancy tip
 *     description: Retrieves the pregnancy tip for the authenticated mother's current pregnancy week
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly tip retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tip:
 *                   type: object
 *                   properties:
 *                     week:
 *                       type: integer
 *                       example: 12
 *                     message:
 *                       type: string
 *                       example: Your baby is now the size of a lime
 *       400:
 *         description: Mother not found
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       500:
 *         description: Internal server error
 */

router.get('/weeklyMessage', weeklyMessage);

router.post('/dailyMessage', createDaily);

/**
 * @swagger
 * /api/v1/getDailyMessage:
 *   get:
 *     tags:
 *       - Trimester
 *     summary: Get daily reminder
 *     description: Retrieves the daily reminder for the authenticated mother based on her current pregnancy day
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily reminder retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pregnancyDay:
 *                   type: integer
 *                   example: 84
 *                 reminder:
 *                   type: string
 *                   example: Remember to take your prenatal vitamins today
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       500:
 *         description: Internal server error
 */

router.get('/getDailyMessage', dailyMessage)

// /**
//  * @swagger
//  * /api/v1/notifications:
//  *   get:
//  *     tags:
//  *       - Notifications
//  *     summary: Get mother notifications
//  *     description: Retrieves all notifications for the authenticated mother based on her current pregnancy week and day, scheduled for delivery at 8:00 AM daily
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Notifications retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: All notifications
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       id:
//  *                         type: integer
//  *                         example: 1
//  *                       week:
//  *                         type: integer
//  *                         example: 12
//  *                       dayNumber:
//  *                         type: integer
//  *                         example: 84
//  *                       message:
//  *                         type: string
//  *                         example: Your baby is now the size of a lime!
//  *                       createdAt:
//  *                         type: string
//  *                         format: date-time
//  *                         example: 2024-01-15T08:00:00.000Z
//  *                       time:
//  *                         type: string
//  *                         example: 2 hours ago
//  *       401:
//  *         description: Unauthorized - token not found or invalid
//  *       404:
//  *         description: Not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Mother update not found
//  *       500:
//  *         description: Internal server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Internal server error
//  */

// router.get('/notifications', Authentication ,getNotifications)

module.exports = router