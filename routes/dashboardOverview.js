const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { dashboardOverview } = require('../controller/dashboardOverview');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard Overview
 *   description: Admin management and authentication
 */

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     tags:
 *       - Dashboard Overview
 *     summary: Get dashboard overview
 *     description: Retrieves the authenticated mother's pregnancy info, wallet/savings summary, daily reminder, and notifications based on her current pregnancy week and day
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard retrieved successfully
 *                 info:
 *                   type: object
 *                   properties:
 *                     trimester:
 *                       type: string
 *                       example: Second Trimester
 *                     week:
 *                       type: integer
 *                       example: 20
 *                     estimatedDueDate:
 *                       type: string
 *                       format: date
 *                       example: "2026-12-01"
 *                     preferredHospital:
 *                       type: string
 *                       example: Lagos University Teaching Hospital
 *                     daysUntilDueDate:
 *                       type: integer
 *                       example: 140
 *                     pregnancyProgress:
 *                       type: string
 *                       example: 50%
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentBalance:
 *                       type: number
 *                       example: 150000
 *                     savingsGoal:
 *                       type: number
 *                       example: 400000
 *                     savingsProgress:
 *                       type: number
 *                       example: 37.5
 *                 reminder:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     dayNumber:
 *                       type: integer
 *                       example: 84
 *                     message:
 *                       type: string
 *                       example: Remember to take your prenatal vitamins today
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T08:00:00.000Z
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       week:
 *                         type: integer
 *                         example: 20
 *                       dayNumber:
 *                         type: integer
 *                         example: 140
 *                       message:
 *                         type: string
 *                         example: Your baby is now the size of a banana!
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T08:00:00.000Z
 *                       time:
 *                         type: string
 *                         example: 2 hours ago
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
 *       404:
 *         description: Not found - Mother or wallet record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother record not found
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

router.get('/dashboard', Authentication, dashboardOverview)


module.exports = router