const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { makePayment, verifyPayment, monthlyGoals, initiatePayment } = require('../controller/payment');
const { initiateCard } = require('../controller/cardPayment');
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing and management
 */


/**
 * @swagger
 * /api/v1/payment/initiate:
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

router.post('/initiate', Authentication, initiatePayment)

/**
 * @swagger
 * /api/v1/payment/initiateCard:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Initiate a card payment
 *     description: Initiates a card payment using Kora and returns a payment transaction response
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
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       404:
 *         description: Mother not found
 */
router.post('/initiateCard', Authentication, initiateCard)

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

/**
 * @swagger
 * /api/v1/payment/history:
 *   get:
 *     tags:
 *       - Payment
 *     summary: Get monthly payment goals
 *     description: Retrieves the authenticated mother's total payment amount for the current month
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly payment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: monthly payment retrieved successfully
 *                 monthlyTotal:
 *                   type: number
 *                   example: 50000.00
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       500:
 *         description: Internal server error
 */

router.get('/history', Authentication,monthlyGoals)


module.exports = router
