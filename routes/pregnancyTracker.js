const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { getTrimester, weeklyMessage } = require('../controller/pregnancyTracker');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PregnancyTracker
 *   description: Admin management and authentication
 */

/**
 * @swagger
 * /api/v1/tracker/getTrimester:
 *   get:
 *     tags:
 *       - PregnancyTracker
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

router.get('/getTrimester',Authentication , getTrimester);

/**
 * @swagger
 * /api/v1/tracker/weeklyMessage:
 *   get:
 *     tags:
 *       - PregnancyTracker
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

router.get('/weeklyMessage', Authentication,weeklyMessage);


module.exports = router;