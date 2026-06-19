const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { pregnancyTracker } = require('../controller/pregnancyTracker');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PregnancyTracker
 *   description: Admin management and authentication
 */

/**
 * @swagger
 * /api/v1/tracker/pregnancyTracker:
 *   get:
 *     tags:
 *       - PregnancyTracker
 *     summary: Get pregnancy tracker overview
 *     description: Retrieves trimester-specific information, milestone timeline, and weekly pregnancy tip based on the authenticated mother's current pregnancy week
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pregnancy tracker retrieved successfully
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
 *                 firsttrim:
 *                   type: array
 *                   description: Returned when mother is in the first trimester (weeks 1-12)
 *                   items:
 *                     type: array
 *                     example: ["First Trimester", "Current", "weeks 1-12", "Initial prenatal visit", "pregnancy confirmation"]
 *                 secondtrim:
 *                   type: array
 *                   description: Returned when mother is in the second trimester (weeks 13-26)
 *                   items:
 *                     type: array
 *                     example: ["Second Trimester", "Current", "weeks 13-26", "Anatomy scan", "Feel baby movements", "Glucose screening"]
 *                 thirdtrim:
 *                   type: array
 *                   description: Returned when mother is in the third trimester (weeks 27-40)
 *                   items:
 *                     type: array
 *                     example: ["Third Trimester", "Current", "Weeks 27-40", "Hospital tour", "Birth plan discussion", "Final preparations"]
 *                 tip:
 *                   type: object
 *                   description: Returned only in the third trimester
 *                   nullable: true
 *                   properties:
 *                     week:
 *                       type: integer
 *                       example: 30
 *                     tip:
 *                       type: string
 *                       example: Start practicing breathing exercises to prepare for labor
 *       400:
 *         description: Bad request - Mother does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: mother does not exist
 *       401:
 *         description: Unauthorized - Invalid or missing user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or missing user ID
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

router.get('/pregnancyTracker',Authentication , pregnancyTracker);

// /**
//  * @swagger
//  * /api/v1/tracker/weeklyMessage:
//  *   get:
//  *     tags:
//  *       - PregnancyTracker
//  *     summary: Get weekly pregnancy tip
//  *     description: Retrieves the pregnancy tip for the authenticated mother's current pregnancy week
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Weekly tip retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 tip:
//  *                   type: object
//  *                   properties:
//  *                     week:
//  *                       type: integer
//  *                       example: 12
//  *                     message:
//  *                       type: string
//  *                       example: Your baby is now the size of a lime
//  *       400:
//  *         description: Mother not found
//  *       401:
//  *         description: Unauthorized - token not found or invalid
//  *       500:
//  *         description: Internal server error
//  */

// router.get('/weeklyMessage', Authentication,weeklyMessage);


module.exports = router;