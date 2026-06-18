const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  // getBill, // Ensure getBill is imported correctly
  uploadBill,
  customerReview,
  validateFunds,
  finalApproval,
  getBillStatus,
  getBillSummary,
  runSystemValidation,
  getUploadedBillDashboard,
  getUploadedBillRecords
} = require('../controller/uploadedbill');
const { Authentication } = require('../middlewares/auth');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'bills');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|pdf)$/i;
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const extension = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.test(extension) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UploadedBill
 *   description: Bill upload, review, fund validation and final approval workflow APIs
 */

/**
 * @swagger
 * /api/v1/bill/upload:
 *   post:
 *     summary: Upload a new bill (Stage 1)
 *     tags: [UploadedBill]
 *     description: |
 *       Hospital uploads a bill for a patient. This starts the verification workflow
 *       at stage 1 (`uploadedBill`). The system performs:
 *       - requiredFieldComplete validation
 *       - patienceIdMatched validation
 *       - fileUploadedProgress validation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - maternalId
 *               - phoneNumber
 *               - category
 *               - amount
 *               - billingDate
 *               - dueDate
 *               - documentUpload
 *               - billNumber
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ada Okafor
 *               maternalId:
 *                 type: string
 *                 format: uuid
 *                 example: 9c27d236-7d61-4f3c-8f72-a1b2c3d4e5f6
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348012345678"
 *               expectedDeliveryDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-12-01"
 *               referenceNumber:
 *                 type: string
 *                 example: REF-172000
 *               category:
 *                 type: string
 *                 example: Antenatal Care
 *               amount:
 *                 type: number
 *                 example: 75000
 *               billingDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-01"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-30"
 *               documentUpload:
 *                 type: string
 *                 format: binary
 *                 description: JPG, JPEG, PNG, or PDF file. Maximum size is 5MB.
 *               billNumber:
 *                 type: string
 *                 example: QI-123456
 *     responses:
 *       201:
 *         description: Bill uploaded successfully and entered customer review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bill uploaded successfully and entered customer review
 *                 data:
 *                   type: object
 *                 workflow:
 *                   type: object
 *                   properties:
 *                     currentStage:
 *                       type: string
 *                       example: uploadedBill
 *                     nextStage:
 *                       type: string
 *                       example: customerReview
 *       400:
 *         description: Required fields missing or document not uploaded
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       404:
 *         description: Hospital or mother not found
 *       500:
 *         description: Internal server error
 */
router.post('/upload/:motherId', Authentication, upload.single('documentUpload'), uploadBill);

// // Add a diagnostic check to ensure getBill is a function
// if (typeof getBill !== 'function') {
//   console.error('CRITICAL ERROR: The "getBill" handler is not a function. Please ensure it is correctly exported from `../controller/uploadedbill.js` and that the server has been fully restarted to pick up changes.');
//   // Depending on desired behavior, you might want to throw an error here to prevent the server from starting with a broken route.
//   // throw new TypeError('Route handler for /api/v1/bill/{billId} must be a function.');
// }
// /**
//  * @swagger
//  * /api/v1/bill/{billId}:
//  *   get:
//  *     summary: Get a single bill by Bill ID
//  *     tags: [UploadedBill]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: billId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The custom Bill ID (e.g., BILL-17182...)
//  *     responses:
//  *       200:
//  *         description: Bill retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                 data:
//  *                   type: object
//  *       404:
//  *         description: Bill not found
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/:billId', Authentication, getBill);

/**
 * @swagger
 * /api/v1/bill/{billId}/customer-review:
 *   post:
 *     summary: Customer review of bill (Stage 2)
 *     tags: [UploadedBill]
 *     description: |
 *       Moves the workflow from `uploadedBill` to `customerReview`.
 *       Send `approved: true` to accept the bill, or `approved: false` to reject it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The bill's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Bill accepted or rejected by customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bill accepted by customer. Proceeding to fund validation.
 *                 data:
 *                   type: object
 *                 workflow:
 *                   type: object
 *                   properties:
 *                     currentStage:
 *                       type: string
 *                       example: customerReview
 *                     nextStage:
 *                       type: string
 *                       example: fundValidation
 *       400:
 *         description: Bill is not at the correct workflow stage
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Internal server error
 */
router.post('/:billId/customer-review', Authentication, customerReview);

/**
 * @swagger
 * /api/v1/bill/{billId}/validate-funds:
 *   post:
 *     summary: Validate mother's funds against the bill (Stage 3)
 *     tags: [UploadedBill]
 *     description: |
 *       Validates the mother's available `currentBalance` against the bill `amount`.
 *       Moves the workflow from `customerReview` to `fundValidation`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The bill's ID
 *     responses:
 *       200:
 *         description: Fund validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fund validation passed. Bill is ready for final approval.
 *                 data:
 *                   type: object
 *                 fundCheck:
 *                   type: object
 *                   properties:
 *                     billAmount:
 *                       type: number
 *                       example: 75000
 *                     currentBalance:
 *                       type: number
 *                       example: 100000
 *                     remainingAfterPayment:
 *                       type: number
 *                       example: 25000
 *                 workflow:
 *                   type: object
 *                   properties:
 *                     currentStage:
 *                       type: string
 *                       example: fundValidation
 *                     nextStage:
 *                       type: string
 *                       example: finalApproval
 *       400:
 *         description: Bill is not at the correct workflow stage
 *       404:
 *         description: Bill or mother not found
 *       500:
 *         description: Internal server error
 */
router.post('/:billId/validate-funds', Authentication, validateFunds);

/**
 * @swagger
 * /api/v1/bill/{billId}/final-approval:
 *   post:
 *     summary: Final approval of bill (Stage 4)
 *     tags: [UploadedBill]
 *     description: |
 *       Admin/Hospital gives the final approval to complete the workflow.
 *       Moves the workflow from `fundValidation` to `finalApproval`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The bill's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Bill final approval granted or denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bill has received final approval. Workflow complete.
 *                 data:
 *                   type: object
 *                 workflow:
 *                   type: object
 *                   properties:
 *                     currentStage:
 *                       type: string
 *                       example: finalApproval
 *                     completed:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bill is not at the correct workflow stage
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Internal server error
 */
router.post('/:billId/final-approval', Authentication, finalApproval);

/**
 * @swagger
 * /api/v1/bill/{billId}/status:
 *   get:
 *     summary: Get current bill status
 *     tags: [UploadedBill]
 *     description: Returns the current workflow stage, system validation, and progress for a bill.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The bill's ID
 *     responses:
 *       200:
 *         description: Bill status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bill status retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     fullName:
 *                       type: string
 *                     maternalId:
 *                       type: string
 *                     referenceNumber:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     verificationWorkFlow:
 *                       type: string
 *                       enum: [uploadedBill, customerReview, fundValidation, finalApproval]
 *                     systemValidation:
 *                       type: string
 *                       enum: [patienceIdMatched, fileUploadedProgress, billingVerification, requiredFieldComplete]
 *                     completedStages:
 *                       type: array
 *                       items:
 *                         type: string
 *                     remainingStages:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isComplete:
 *                       type: boolean
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Internal server error
 */
router.get('/:billId/status', Authentication, getBillStatus);

/**
 * @swagger
 * /api/v1/bill/{billId}/summary:
 *   get:
 *     summary: Get bill summary
 *     tags: [UploadedBill]
 *     description: |
 *       Returns a summary of the bill. The `summaryType` query parameter controls
 *       which fields are returned. Allowed: `patienceName`, `category`, `date`, `totalAmount`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The bill's ID
 *       - in: query
 *         name: summaryType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [patienceName, category, date, totalAmount]
 *         description: The type of summary to retrieve (defaults to the stored value)
 *     responses:
 *       200:
 *         description: Bill summary retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bill summary retrieved
 *                 summaryType:
 *                   type: string
 *                   example: totalAmount
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid summary type
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Internal server error
 */
router.get('/:billId/summary', Authentication, getBillSummary);

/**
 * @swagger
 * /api/v1/bill/{billId}/system-validation:
 *   post:
 *     summary: Run a system validation check on the bill
 *     tags: [UploadedBill]
 *     description: |
 *       Runs one of the system validations against the bill.
 *       Allowed validation types: `patienceIdMatched`, `fileUploadedProgress`,
 *       `billingVerification`, `requiredFieldComplete`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The bill's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - validationType
 *             properties:
 *               validationType:
 *                 type: string
 *                 enum: [patienceIdMatched, fileUploadedProgress, billingVerification, requiredFieldComplete]
 *                 example: billingVerification
 *     responses:
 *       200:
 *         description: System validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: System validation passed
 *                 validationType:
 *                   type: string
 *                   example: billingVerification
 *                 passed:
 *                   type: boolean
 *                   example: true
 *                 detail:
 *                   type: object
 *       400:
 *         description: Invalid validation type
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Internal server error
 */
router.post('/:billId/system-validation', Authentication, runSystemValidation);

/**
 * @swagger
 * /api/v1/bill/dashboard:
 *   get:
 *     summary: Get hospital uploaded bill dashboard
 *     tags: [UploadedBill]
 *     description: "Returns aggregated dashboard data: total uploadedBills, total VerifiedBills, total PendingBills and total DeliveryCost."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard data retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     total uploadedBills:
 *                       type: integer
 *                       example: 12
 *                     total VerifiedBills:
 *                       type: number
 *                       example: 850000
 *                     total PendingBills:
 *                       type: integer
 *                       example: 3
 *                     total DeliveryCost:
 *                       type: number
 *                       example: 150000                    
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', Authentication, getUploadedBillDashboard);



/**
 * @swagger
 * /api/v1/bill/billRecords:
 *   get:
 *     summary: Get paginated uploaded bill records for the authenticated hospital
 *     tags: [UploadedBill]
 *     description: |
 *       Returns a paginated list of bill records for the authenticated hospital.
 *       Supports optional filtering by `status` (verification status) and `search`
 *       (by billId or patientName).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Verified, Pending]
 *         description: Filter by verification status
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term to filter by billId or patientName (case-insensitive)
 *     responses:
 *       200:
 *         description: Bill records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bill records retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                       example: 25
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           billId:
 *                             type: string
 *                             format: uuid
 *                             example: "550e8400-e29b-41d4-a716-446655440000"
 *                           billNumber:
 *                             type: string
 *                             example: "BL-123456"
 *                           patientName:
 *                             type: string
 *                             example: "Ada Okafor"
 *                           deliveryType:
 *                             type: string
 *                             example: "Natural Birth"
 *                           billAmount:
 *                             type: number
 *                             example: 75000
 *                           uploadedDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-06-10T10:30:00.000Z"
 *                           verificationStatus:
 *                             type: string
 *                             enum: [Verified, Pending]
 *                             example: "Pending"
 *                           paymentStatus:
 *                             type: string
 *                             example: "Unpaid"
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/billRecords', Authentication, getUploadedBillRecords);



module.exports = router;
