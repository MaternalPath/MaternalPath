const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { getPatientDetails, getMotherDashboard } = require('../controller/patientDetails');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient details for hospitals
 */

/**
 * @swagger
 * /api/v1/patients/{motherId}:
 *   get:
 *     summary: Get patient details for bill upload page
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     description: Returns full patient details including pregnancy info and preferred hospital name
 *     parameters:
 *       - in: path
 *         name: motherId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The mother's UUID
 *     responses:
 *       200:
 *         description: Patient details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: d4b0c8d7-9a3b-4c2f-a7a1-9c1d2f0d4b8a
 *                 fullName:
 *                   type: string
 *                   example: Chidinma Okonkwo
 *                 phoneNumber:
 *                   type: string
 *                   example: "+234800000000"
 *                 email:
 *                   type: string
 *                   example: chidinma@example.com
 *                 maternalId:
 *                   type: string
 *                   example: MP-2024-889
 *                 pregnancyWeek:
 *                   type: integer
 *                   example: 24
 *                 expectedDeliveryDate:
 *                   type: string
 *                   example: "2026-10-12"
 *                 preferredHospital:
 *                   type: string
 *                   example: Lagos University Hospital
 *       401:
 *         description: Missing or invalid authentication token
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
router.get('/patients/:motherId', Authentication, getPatientDetails);

/**
 * @swagger
 * /api/v1/mother/dashboard:
 *   get:
 *     summary: Get mother's dashboard with wallet summary, pregnancy info, and recent bills
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns the authenticated mother's dashboard containing:
 *       - **wallet**: savings goal, current savings, remaining amount, savings progress percentage
 *       - **pregnancy**: current week, expected delivery date, preferred hospital, last verification status
 *       - **recentBills**: recent bill records showing what the money from her balance was used for
 *     responses:
 *       200:
 *         description: Mother dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother dashboard retrieved successfully
 *                 wallet:
 *                   type: object
 *                   properties:
 *                     savingsGoal:
 *                       type: number
 *                       example: 400000
 *                     currentSavings:
 *                       type: number
 *                       example: 150000
 *                     remainingAmount:
 *                       type: number
 *                       example: 250000
 *                     savingsProgress:
 *                       type: string
 *                       example: "37.5%"
 *                 pregnancy:
 *                   type: object
 *                   properties:
 *                     currentWeek:
 *                       type: integer
 *                       example: 20
 *                     expectedDelivery:
 *                       type: string
 *                       example: "2026-12-01"
 *                     preferredHospital:
 *                       type: string
 *                       example: Lagos University Teaching Hospital
 *                     lastVerification:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: Approved
 *                         verifiedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-06-15T10:30:00.000Z"
 *                         readiness:
 *                           type: string
 *                           example: Moderate Preparedness
 *                 recentBills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       billNumber:
 *                         type: string
 *                         example: "BL-123456"
 *                       category:
 *                         type: string
 *                         example: "Antenatal Care"
 *                       amount:
 *                         type: number
 *                         example: 75000
 *                       billingDate:
 *                         type: string
 *                         format: date
 *                         example: "2026-06-01"
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                         example: "2026-06-30"
 *                       status:
 *                         type: string
 *                         example: "finalApproval"
 *       401:
 *         description: Missing or invalid authentication token
 *       404:
 *         description: Mother record not found
 *       500:
 *         description: Internal server error
 */
router.get('/mother/dashboard', Authentication, getMotherDashboard);

module.exports = router;