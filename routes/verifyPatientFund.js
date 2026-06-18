const express = require('express');
const { Authentication } = require('../middlewares/auth');
const {
  createVerificationRequest,
  getVerificationRequests,
  getVerificationRequest,
  approveVerificationRequest,
  rejectVerificationRequest
} = require('../controller/verifyPatientFund');
const { getVerificationHistory, getVerificationRecords } = require('../controller/verificationHistory');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patient Fund Verification
 *   description: Patient fund verification management APIs
 */

/**
 * @swagger
 * /api/v1/hospital/verification-requests:
 *   post:
 *     summary: Create a new patient fund verification request
 *     tags: [Patient Fund Verification]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a verification request for a mother's fund status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - maternalId
 *             properties:
 *               maternalId:
 *                 type: string
 *                 format: uuid
 *                 description: The mother's ID
 *                 example: "9c27d236-7d61-4f3c-8f72-a1b2c3d4e5f6"
 *               notes:
 *                 type: string
 *                 description: Optional notes
 *     responses:
 *       201:
 *         description: Verification request created successfully
 *       400:
 *         description: Missing maternalId
 *       401:
 *         description: Missing or invalid authentication token
 *       404:
 *         description: Hospital or Mother not found
 *       409:
 *         description: Pending verification already exists
 *       500:
 *         description: Error creating verification request
 *   get:
 *     summary: Get all verification requests
 *     tags: [Patient Fund Verification]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves all verification requests for the authenticated hospital
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Verification requests retrieved successfully
 *       401:
 *         description: Missing or invalid authentication token
 *       500:
 *         description: Error fetching verification requests
 */
router.route('/verification-requests')
  .post(Authentication, createVerificationRequest)
  .get(Authentication, getVerificationRequests);

/**
 * @swagger
 * /api/v1/hospital/verification-requests/{id}:
 *   get:
 *     summary: Get a single verification request
 *     tags: [Patient Fund Verification]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a single verification request by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The verification request ID
 *     responses:
 *       200:
 *         description: Verification request retrieved successfully
 *       401:
 *         description: Missing or invalid authentication token
 *       404:
 *         description: Verification request not found
 *       500:
 *         description: Error fetching verification request
 */
router.get('/verification-requests/:id', Authentication, getVerificationRequest);

/**
 * @swagger
 * /api/v1/hospital/verification-requests/{id}/approve:
 *   patch:
 *     summary: Approve a verification request
 *     tags: [Patient Fund Verification]
 *     security:
 *       - bearerAuth: []
 *     description: Approves a pending verification request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The verification request ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification request approved successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Missing or invalid authentication token
 *       404:
 *         description: Pending verification request not found
 *       500:
 *         description: Error approving verification request
 */
router.get('/verification-requests/:id/approve', Authentication, approveVerificationRequest);

/**
 * @swagger
 * /api/v1/hospital/verification-requests/{id}/reject:
 *   patch:
 *     summary: Reject a verification request
 *     tags: [Patient Fund Verification]
 *     security:
 *       - bearerAuth: []
 *     description: Rejects a pending verification request with required notes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The verification request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Verification request rejected successfully
 *       400:
 *         description: Notes are required
 *       401:
 *         description: Missing or invalid authentication token
 *       404:
 *         description: Pending verification request not found
 *       500:
 *         description: Error rejecting verification request
 */
router.patch('/verification-requests/:id/reject', Authentication, rejectVerificationRequest);

/**
 * @swagger
 * /api/v1/hospital/verification-history:
 *   get:
 *     summary: Get verification history summary
 *     tags: [Patient Fund Verification]
 *     security:
 *       - bearerAuth: []
 *     description: Returns counts of verification requests by status
 *     responses:
 *       200:
 *         description: Verification history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalVerification:
 *                   type: integer
 *                 approvedRequest:
 *                   type: integer
 *                 pendingReviews:
 *                   type: integer
 *                 rejectedRequest:
 *                   type: integer
 *       401:
 *         description: Missing or invalid authentication token
 *       500:
 *         description: Error fetching verification history
 */
router.get('/verification-history', Authentication, getVerificationHistory);

/**
 * @swagger
 * /api/v1/hospital/verification-records:
 *   get:
 *     summary: Get paginated verification records
 *     tags: [Patient Fund Verification]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Fetch paginated list of patient fund verification records.
 *       Hospitals automatically see only their own records. Can filter by status.
 *       Returns total count along with paginated results.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *         example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *         description: Filter records by verification status
 *         example: Pending
 *     responses:
 *       200:
 *         description: Verification records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification records fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     patientName:
 *                       type: string
 *                       example: Ada Okafor
 *                     pregnancyWeek:
 *                       type: integer
 *                       example: 28
 *                     hospitalName:
 *                       type: string
 *                       example: Maternal Path Hospital
 *                     walletAmount:
 *                       type: number
 *                       example: 35000
 *                     verificationStatus:
 *                       type: string
 *                       enum: [Pending, Approved, Rejected]
 *                       example: Pending
 *                     verificationDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-06-15T10:30:00.000Z
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: Not authorized to view records
 *       500:
 *         description: Server error
 */
router.get('/verification-records', Authentication, getVerificationRecords);

module.exports = router;
