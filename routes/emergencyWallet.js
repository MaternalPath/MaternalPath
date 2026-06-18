const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { emergencyWallet, verifyOTP } = require('../controller/emergencyWallet');
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Emergency Wallet
 *   description: Pregnancy savings and wallet tracking
 */

// /**
//  * @swagger
//  * /api/v1/ewallet:
//  *   get:
//  *     tags:
//  *       - Wallet
//  *     summary: Get pregnancy journey overview
//  *     description: Retrieves a full overview of the authenticated mother's pregnancy journey including trimester, savings progress, wallet balance, and preparedness level
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Pregnancy journey overview retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Pregnancy journey overview
//  *                 info:
//  *                   type: object
//  *                   properties:
//  *                     trimester:
//  *                       type: string
//  *                       example: Second Trimester
//  *                     week:
//  *                       type: integer
//  *                       example: 20
//  *                     estimatedDueDate:
//  *                       type: string
//  *                       format: date-time
//  *                       example: 2024-09-15T00:00:00.000Z
//  *                     preferredHospital:
//  *                       type: string
//  *                       example: Lagos University Teaching Hospital
//  *                     currentBalance:
//  *                       type: number
//  *                       example: 150000
//  *                     savingsGoal:
//  *                       type: number
//  *                       example: 400000
//  *                     savingsProgress:
//  *                       type: number
//  *                       example: 37.5
//  *                     remainingAmountNeeded:
//  *                       type: number
//  *                       example: 250000
//  *                     daysUntilDueDate:
//  *                       type: integer
//  *                       example: 140
//  *                     pregnancyProgress:
//  *                       type: string
//  *                       example: 50%
//  *                     preparedness:
//  *                       type: string
//  *                       example: average Preparedness
//  *       401:
//  *         description: Unauthorized - Invalid or missing user ID
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Invalid or missing user ID
//  *       404:
//  *         description: Not found - Mother or wallet record not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Mother record not found
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

// router.get('/ewallet', Authentication, emergency)

// /**
//  * @swagger
//  * /api/v1/monthlysavings:
//  *   get:
//  *     tags:
//  *       - Wallet
//  *     summary: Get monthly savings breakdown
//  *     description: Retrieves a month-by-month breakdown of all successful payments made by the authenticated mother throughout the year
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Monthly savings retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: monthly payment retrieved successfully
//  *                 monthlySavings:
//  *                   type: object
//  *                   properties:
//  *                     January:
//  *                       type: number
//  *                       example: 20000
//  *                     February:
//  *                       type: number
//  *                       example: 35000
//  *                     March:
//  *                       type: number
//  *                       example: 0
//  *                     April:
//  *                       type: number
//  *                       example: 50000
//  *                     May:
//  *                       type: number
//  *                       example: 0
//  *                     June:
//  *                       type: number
//  *                       example: 45000
//  *                     July:
//  *                       type: number
//  *                       example: 0
//  *                     August:
//  *                       type: number
//  *                       example: 0
//  *                     September:
//  *                       type: number
//  *                       example: 0
//  *                     October:
//  *                       type: number
//  *                       example: 0
//  *                     November:
//  *                       type: number
//  *                       example: 0
//  *                     December:
//  *                       type: number
//  *                       example: 0
//  *       401:
//  *         description: Unauthorized - Invalid or missing user ID
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Invalid or missing user ID
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

// router.get('/monthlysavings', Authentication, savingsProgress)

// /**
//  * @swagger
//  * /api/v1/savingsInsight:
//  *   get:
//  *     tags:
//  *       - Wallet
//  *     summary: Get savings insights
//  *     description: Retrieves savings insights for the authenticated mother including weekly contribution recommendation, current weekly contribution, weeks remaining, and whether she is on track to meet her savings goal
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Savings insights retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Savings Insight
//  *                 info:
//  *                   type: object
//  *                   properties:
//  *                     WeeklyContributionRecommendation:
//  *                       type: string
//  *                       example: Saving 10000 weekly can help you reach your goal before delivery
//  *                     Current weekly contribution:
//  *                       type: string
//  *                       example: 8000 per week
//  *                     Weeks Remaining until Due Date:
//  *                       type: string
//  *                       example: 20 weeks
//  *                     On Track:
//  *                       type: string
//  *                       example: At your current pace, you'll not reach your goal
//  *       401:
//  *         description: Unauthorized - Invalid or missing user ID
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Invalid or missing user ID
//  *       404:
//  *         description: Not found - Mother record not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Mother record not found
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

// router.get('/savingsInsight', Authentication, savingsInsights)

// /**
//  * @swagger
//  * /api/v1/transactionHistory:
//  *   get:
//  *     tags:
//  *       - Wallet
//  *     summary: Get transaction history
//  *     description: Retrieves all transaction history for the authenticated mother
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Transaction history retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Transaction History
//  *                 history:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       id:
//  *                         type: integer
//  *                         example: 1
//  *                       amount:
//  *                         type: number
//  *                         example: 5000
//  *                       transactionType:
//  *                         type: string
//  *                         example: deposit
//  *                       description:
//  *                         type: string
//  *                         example: Savings deposit
//  *                       date:
//  *                         type: string
//  *                         format: date-time
//  *                         example: 2024-01-15T08:00:00.000Z
//  *                       motherId:
//  *                         type: integer
//  *                         example: 12
//  *                       createdAt:
//  *                         type: string
//  *                         format: date-time
//  *                         example: 2024-01-15T08:00:00.000Z
//  *       401:
//  *         description: Unauthorized - Invalid or missing user ID
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Invalid or missing user ID
//  *       404:
//  *         description: Not found - Mother record not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Mother record not found
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

// router.get('/transactionHistory', Authentication, transactionHistory)

/**
 * @swagger
 * /api/v1/verify:
 *   post:
 *     tags:
 *       - Emergency Wallet
 *     summary: Verify OTP for bill verification
 *     description: Verifies the OTP sent to the authenticated mother to approve and unlock bill viewing access
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Bill verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bill verified successfully
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
 *         description: Not found or invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid OTP
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

router.post('/verify', Authentication,  verifyOTP);

/**
 * @swagger
 * /api/v1/emergencyWallet:
 *   get:
 *     tags:
 *       - Emergency Wallet
 *     summary: Get emergency wallet overview
 *     description: Retrieves the authenticated mother's full wallet overview including pregnancy info, savings progress, monthly savings breakdown, transaction history, preparedness level, and weekly savings insights
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emergency wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Emergency Wallet
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
 *                     currentBalance:
 *                       type: number
 *                       example: 150000
 *                     savingsGoal:
 *                       type: number
 *                       example: 400000
 *                     savingsProgress:
 *                       type: number
 *                       example: 37.5
 *                     remainingAmountNeeded:
 *                       type: number
 *                       example: 250000
 *                     daysUntilDueDate:
 *                       type: integer
 *                       example: 140
 *                     pregnancyProgress:
 *                       type: string
 *                       example: 50%
 *                     preparedness:
 *                       type: string
 *                       example: average Preparedness
 *                 monthlySavings:
 *                   type: object
 *                   properties:
 *                     January:
 *                       type: number
 *                       example: 20000
 *                     February:
 *                       type: number
 *                       example: 35000
 *                     March:
 *                       type: number
 *                       example: 0
 *                     April:
 *                       type: number
 *                       example: 50000
 *                     May:
 *                       type: number
 *                       example: 0
 *                     June:
 *                       type: number
 *                       example: 45000
 *                     July:
 *                       type: number
 *                       example: 0
 *                     August:
 *                       type: number
 *                       example: 0
 *                     September:
 *                       type: number
 *                       example: 0
 *                     October:
 *                       type: number
 *                       example: 0
 *                     November:
 *                       type: number
 *                       example: 0
 *                     December:
 *                       type: number
 *                       example: 0
 *                 data:
 *                   type: object
 *                   properties:
 *                     WeeklyContributionRecommendation:
 *                       type: string
 *                       example: Saving 10000 weekly can help you reach your goal before delivery
 *                     Current weekly contribution:
 *                       type: string
 *                       example: 8000 per week
 *                     Weeks Remaining until Due Date:
 *                       type: string
 *                       example: 20 weeks
 *                     On Track:
 *                       type: string
 *                       example: At your current pace, you'll not reach your goal
 *                 history:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     amount:
 *                       type: number
 *                       example: 5000
 *                     transactionType:
 *                       type: string
 *                       example: deposit
 *                     description:
 *                       type: string
 *                       example: Savings deposit
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T08:00:00.000Z
 *                     motherId:
 *                       type: integer
 *                       example: 12
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

router.get('/emergencyWallet', Authentication, emergencyWallet)

module.exports = router;