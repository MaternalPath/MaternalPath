const express = require('express');
const { Authentication } = require('./auth');
const { healthGuidance } = require('../controller/healthGuidance');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health Guidance
 *   description: Pregnancy savings and wallet tracking
 */
/**
 * @swagger
 * /api/v1/week:
 *   get:
 *     tags:
 *       - Health Guidance
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

router.get('/week', Authentication, healthGuidance);


module.exports = router