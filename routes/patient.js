const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { getPatientDetails } = require('../controller/patientDetails');

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

module.exports = router;
