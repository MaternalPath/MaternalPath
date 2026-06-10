const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { makePayment, verifyPayment, monthlyGoals } = require('../controller/payment');
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing and management
 */


/**
 * @swagger
 * /api/v1/payment/balance:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Initiate a payment
 *     description: Initiates a payment for the authenticated mother and returns a payment link
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000.00
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment initiated successfully
 *                 currentBalance:
 *                   type: number
 *                   example: 50000.00
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       404:
 *         description: Mother not found
 */

router.post('/balance', Authentication, makePayment)

/**
 * @swagger
 * /api/v1/payment/payment:
 *   get:
 *     tags:
 *       - Payment
 *     summary: Verify a payment
 *     description: Verifies the status of a payment using the payment reference
 *     parameters:
 *       - in: query
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         example: "ABC1234567"
 *         description: The payment reference returned during initiation
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment successful
 *       404:
 *         description: No initiated payment found
 */

router.get('/payment', verifyPayment)

router.get('/history', Authentication,monthlyGoals)


module.exports = router
