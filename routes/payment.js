const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { makePayment } = require('../controller/payment');
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: payment
 *   description: Payment processing and management
 */
 

/**
 * @swagger
 * /api/v1/payment/balance:
 *   post:
 *     tags:
 *       - payment
 *     summary: Get payment balance
 *     description: Retrieves the authenticated user's current payment balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentBalance:
 *                       type: number
 *                       example: 50000.00
 *       401:
 *         description: Unauthorised - token not found or invalid
 *       404:
 *         description: Mother not found
 */

router.post('/balance', Authentication, makePayment)


module.exports = router