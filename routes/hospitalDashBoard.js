const express = require('express'); 
const { getHospitalDashboard, searchMothers } = require('../controller/hospitalDashBoard');
const { Authentication } = require('../middlewares/auth');
// const { validateSearchMother } = require('../middlewares/hospitalValidator');
// const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Hospital Dashboard
 *   description: Hospital dashboard management APIs
 */

/**
 * @swagger
 * /api/v1/hospital/dashboard:
 *   get:
 *     summary: Get hospital dashboard statistics
 *     tags: [Hospital Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Returns aggregated verification request counts for the authenticated hospital.
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalVerificationRequests:
 *                   type: integer
 *                   description: Total number of verification requests for the hospital
 *                   example: 45
 *                 pendingAuthorizations:
 *                   type: integer
 *                   description: Number of verification requests with status 'pending'
 *                   example: 12
 *                 approvedRequest:
 *                   type: integer
 *                   description: Number of verification requests with status 'approved'
 *                   example: 28
 *                 declinedRequest:
 *                   type: integer
 *                   description: Number of verification requests with status 'declined'
 *                   example: 5
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: Not authorized as a hospital
 *       500:
 *         description: Error fetching dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching dashboard data
 */
router.get( "/dashboard", Authentication,getHospitalDashboard );

// /**
//  * @swagger
//  * /api/v1/hospital/search-patient:
//  *   get:
//  *     summary: Search for a patient by patient ID or phone number
//  *     tags: [Hospital Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     description: Searches for a mother/patient using their patient ID or phone number. Returns patient summary including wallet readiness.
//  *     parameters:
//  *       - in: query
//  *         name: search
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The mother ID or phone number to search for mother/patient
//  *         example: "d799a447-9cd0-4b6b-b0c4-f2f9e7b0d7aa or 08012345678"
//  *     responses:
//  *       200:
//  *         description: Patient found successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 patientName:
//  *                   type: string
//  *                   description: Full name of the patient
//  *                   example: Ada Okafor
//  *                 patientId:
//  *                   type: string
//  *                   description: Unique patient identifier
//  *                   example: PAT-123456
//  *                 pregnancyStage:
//  *                   type: string
//  *                   description: Current pregnancy stage/trimester
//  *                   example: second
//  *                 walletBalance:
//  *                   type: number
//  *                   description: Current wallet balance
//  *                   example: 35000
//  *                 deliverySavingsGoal:
//  *                   type: number
//  *                   description: Target delivery savings goal amount
//  *                   example: 100000
//  *                 preferredHospital:
//  *                   type: string
//  *                   description: Name of the patient's preferred hospital
//  *                   example: Maternal Path Hospital
//  *                 readinessPercentage:
//  *                   type: integer
//  *                   description: Percentage of delivery savings goal achieved (capped at 100)
//  *                   example: 35
//  *                 status:
//  *                   type: string
//  *                   description: Eligibility status for admission
//  *                   example: Not eligible
//  *       400:
//  *         description: Missing search query parameter
//  *       401:
//  *         description: Missing or invalid authentication token
//  *       403:
//  *         description: Not authorized as a hospital
//  *       404:
//  *         description: Patient not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Patient not found
//  *       500:
//  *         description: Error searching for patient
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Error searching for patient
//  */
// router.get( "/search-patient", Authentication, validateSearchMother, searchMothers);

/**
 * @swagger
 * /api/v1/hospital/search:
 *   get:
 *     summary: Search and verify patient delivery fund status
 *     description: Search patient by full name (firstName + lastName) or phone number to get fund status and delivery readiness.
 *     tags: [Patient Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient full name or phone number. Supports partial matching on both.
 *         example: "Ada Okafor or 9024545904"
 *     responses:
 *       200:
 *         description: Patient found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patientName:
 *                   type: string
 *                   example: Ada Okafor
 *                 patientId:
 *                   type: string
 *                   format: uuid
 *                 pregnancyStage:
 *                   type: string
 *                   example: second
 *                 pregnancyWeek:
 *                   type: integer
 *                   example: 22
 *                 walletBalance:
 *                   type: number
 *                   example: 35000
 *                 deliverySavingsGoal:
 *                   type: number
 *                   example: 100000
 *                 preferredHospital:
 *                   type: string
 *                   example: Maternal Path Hospital
 *                 readinessPercentage:
 *                   type: integer
 *                   example: 35
 *                 status:
 *                   type: string
 *                   enum: [Not eligible, Partially eligible, Fully eligible]
 *                   example: Not eligible
 *       400:
 *         description: Search query parameter is required
 *       401:
 *         description: Missing or invalid authentication token
 *       404:
 *         description: Mother not found
 *       500:
 *         description: Error searching for patient
 */
router.get('/search', Authentication, searchMothers);


// /**
//  * @swagger
//  * /api/v1/hospital/search-patient:
//  *   get:
//  *     summary: Search for a patient by email or phone number
//  *     tags: [Hospital Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     description: Searches for a mother/patient using their email or phone number. Returns patient summary including pregnancy info and wallet readiness.
//  *     parameters:
//  *       - in: query
//  *         name: search
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The patient’s email address or phone number
//  *         example: "adaokafor@example.com or 08012345678"
//  *     responses:
//  *       200:
//  *         description: Patient found successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 patientName:
//  *                   type: string
//  *                   description: Full name of the patient
//  *                   example: Ada Okafor
//  *                 patientId:
//  *                   type: string
//  *                   description: Unique patient identifier
//  *                   example: d799a447-9cd0-4b6b-b0c4-f2f9e7b0d7aa
//  *                 pregnancyStage:
//  *                   type: string
//  *                   description: Current pregnancy stage/trimester
//  *                   example: second
//  *                 pregnancyWeek:
//  *                   type: integer
//  *                   description: Current pregnancy week
//  *                   example: 22
//  *                 walletBalance:
//  *                   type: number
//  *                   description: Current wallet balance
//  *                   example: 35000
//  *                 deliverySavingsGoal:
//  *                   type: number
//  *                   description: Target delivery savings goal amount
//  *                   example: 100000
//  *                 preferredHospital:
//  *                   type: string
//  *                   description: Name of the patient's preferred hospital
//  *                   example: Maternal Path Hospital
//  *                 readinessPercentage:
//  *                   type: integer
//  *                   description: Percentage of delivery savings goal achieved capped at 100
//  *                   example: 35
//  *                 status:
//  *                   type: string
//  *                   enum: [Not eligible, Partially eligible, Fully eligible]
//  *                   description: Eligibility status for admission
//  *                   example: Not eligible
//  *       400:
//  *         description: Missing or invalid search query parameter
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Please enter a valid email or phone number
//  *       401:
//  *         description: Missing or invalid authentication token
//  *       403:
//  *         description: Not authorized as a hospital
//  *       404:
//  *         description: Patient not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Mother not found with that email or phone number
//  *       500:
//  *         description: Error searching for patient
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Error searching for patient
//  */
// router.get( "/search-patient", Authentication, validateSearchMother, searchMothers);


module.exports = router;