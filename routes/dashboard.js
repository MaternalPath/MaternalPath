const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { dashboardWeek, emergencyWallet } = require('../controller/dashboard');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin management and authentication
 */

/**
 * @swagger
 * /api/v1/mother/pregnancyOverview:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get pregnancy journey overview
 *     description: Retrieves the authenticated mother's current pregnancy week, due date, preferred hospital, and days remaining until the due date
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pregnancy journey overview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pregnancy journey overview
 *                 info:
 *                   type: object
 *                   properties:
 *                     trimester:
 *                       type: integer
 *                       example: 2
 *                     week:
 *                       type: integer
 *                       example: 20
 *                     estimatedDueDate:
 *                       type: string
 *                       format: date
 *                       example: "2026-12-01"
 *                     preferredHospital:
 *                       type: string
 *                       example: Maternal Path Hospital
 *                     daysUntilDueDate:
 *                       type: integer
 *                       example: 167
 *                     pregnancyProgress:
 *                       type: integer
 *                       example: 30%
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       404:
 *         description: Mother record not found
 *       500:
 *         description: Internal server error
 */
router.get('/pregnancyOverview', Authentication, dashboardWeek)

/**
 * @swagger
 * /wallet:
 *   get:
 *     summary: Retrieve mother's emergency wallet details
 *     description: Returns the authenticated mother's emergency savings wallet, including the current balance, savings goal, and savings progress.
 *     tags:
 *       - Wallet
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: wallet retrieved successfully
 *                 info:
 *                   type: object
 *                   properties:
 *                     currentBalance:
 *                       type: number
 *                       example: 120000
 *                     savingsGoal:
 *                       type: number
 *                       example: 400000
 *                     savingsProgress:
 *                       type: number
 *                       example: 30
 *       401:
 *         description: Unauthorized. Authentication token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Mother record not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother record not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get('/wallet', Authentication, emergencyWallet);


module.exports = router