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

router.get('/weeklyMessage',Authentication, weeklyMessage);

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

module.exports = router