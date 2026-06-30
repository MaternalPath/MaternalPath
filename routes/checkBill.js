const express = require('express');
const { Authentication, checkAdmin } = require('../middlewares/auth');
const { checkBill, sendOTP } = require('../controller/billsAndVerification');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CheckBill
 *   description: Admin management and authentication
 */

/**
 * @swagger
 * /api/v1/checkBill:
 *   get:
 *     tags:
 *       - CheckBill
 *     summary: Retrieve and store uploaded bills for verification
 *     description: Fetches all uploaded bills, maps relevant bill details, and stores them in the bills verification table (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bills retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       billRef:
 *                         type: string
 *                         example: BILL-12345
 *                       patientName:
 *                         type: string
 *                         example: Jane Doe
 *                       hospitalId:
 *                         type: string
 *                         example: 64f92b7c123abc456def7890
 *                       amount:
 *                         type: number
 *                         example: 250000
 *                       uploadDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-06-30T12:30:00.000Z
 *                       motherId:
 *                         type: string
 *                         example: 64f92b7c123abc456def1234
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       403:
 *         description: Unauthorized - admin access only
 *       500:
 *         description: Internal server error
 */

router.get('/checkBill', checkAdmin, checkBill)

/**
 * @swagger
 * /api/v1/send-otp/{motherId}:
 *   get:
 *     tags:
 *       - CheckBill
 *     summary: Send bill verification OTP
 *     description: Sends a bill verification OTP to a mother via email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: motherId
 *         required: true
 *         schema:
 *           type: string
 *         description: The mother ID
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent succesfully
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       404:
 *         description: Admin or Mother not found
 *       500:
 *         description: Internal server error
 */

router.get('/send-otp/:motherId', checkAdmin, sendOTP)


module.exports = router