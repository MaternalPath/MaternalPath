const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { dashboardWeek } = require('../controller/dashboard');
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
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       404:
 *         description: Mother record not found
 *       500:
 *         description: Internal server error
 */
router.get('/pregnancyOverview', Authentication, dashboardWeek)


module.exports = router