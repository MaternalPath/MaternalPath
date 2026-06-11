const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createHospital,
  verifyEmail,
  resendOTP,
  loginHospital,
  changePassword,
  verifyResetOTP,
  resetPassword,
  forgotPassword,
  getHospitalMothers,
  getHospitalMother
} = require('../controller/hospital');
const { hospitalRegisterValidator, hospitalLoginValidator, changePasswordValidator } = require('../middlewares/hospitalValidator');
const { Authentication } = require('../middlewares/auth');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'hospitals');
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
 *   name: Hospital
 *   description: Hospital management APIs
 */

/**
 * @swagger
 * /api/v1/hospital/register:
 *   post:
 *     summary: Register a new hospital
 *     tags: [Hospital]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - hospitalName
 *               - email
 *               - phoneNumber
 *               - password
 *               - confirmPassword
 *               - address
 *               - deliveryFee
 *               - medicalLicenseNumber
 *             properties:
 *               hospitalName:
 *                 type: string
 *                 example: Maternal Path Hospital
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hospital@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "8012345678"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               address:
 *                 type: string
 *                 example: 12 Hospital Road, Lagos
 *               verificationDocuments:
 *                 type: array
 *                 maxItems: 5
 *                 description: Upload only 1 JPG, JPEG, PNG, or PDF file. file must be 5MB or less.
 *                 items:
 *                   type: string
 *                   format: binary
 *               hospitalLogo:
 *                 type: string
 *                 format: binary
 *                 description: JPG, JPEG, PNG, or PDF file. Maximum size is 5MB.
 *               deliveryFee:
 *                 type: string
 *                 example: "50000"
 *               medicalLicenseNumber:
 *                 type: string
 *                 example: MED-123456
 *     responses:
 *       201:
 *         description: Hospital created successfully
 *       400:
 *         description: Validation error or unsupported upload file type
 *       500:
 *         description: Internal server error
 */
router.post('/register',upload.fields([
        { name: 'hospitalLogo', maxCount: 1 },
        { name: 'verificationDocuments', maxCount: 5 }
    ]), hospitalRegisterValidator, createHospital);

    /**
 * @swagger
 * /api/v1/hospital/verify:
 *   post:
 *     summary: Verify hospital email
 *     tags: [Hospital]
 *     description: Verifies a hospital account using the OTP sent during registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hospital@example.com
 *               otp:
 *                 type: string
 *                 example: "482910"
 *     responses:
 *       200:
 *         description: Hospital verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hospital verified successfully
 *       404:
 *         description: Hospital not found or invalid OTP
 *       500:
 *         description: Internal server error
 */
router.post('/verify', verifyEmail);

/**
 * @swagger
 * /api/v1/hospital/resend-otp:
 *   post:
 *     summary: Resend verification OTP
 *     tags: [Hospital]
 *     description: Sends a new verification OTP to the hospital email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hospital@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP resent successfully
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.post('/resend-otp', resendOTP);

/**
 * @swagger
 * /api/v1/hospital/verify-reset:
 *   post:
 *     tags:
 *       - Hospital
 *     summary: Verify reset OTP
 *     description: Verifies the OTP sent for password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: falety@example.com
 *               otp:
 *                 type: string
 *                 example: "839201"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: hospital not found
 */

router.post('/verify-reset', verifyResetOTP);


/**
 * @swagger
 * /api/v1/hospital/login:
 *   post:
 *     summary: Login a hospital
 *     tags: [Hospital]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhoneNumber
 *               - password
 *             properties:
 *               emailOrPhoneNumber:
 *                 type: string
 *                 example: hospital@example.com or 09099923323
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid password or validation error
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.post('/login', hospitalLoginValidator, loginHospital);






/**
 * @swagger
 * /api/v1/hospital/forgot-password:
 *   post:
 *     tags:
 *       - Hospital
 *     summary: Forgot password
 *     description: Sends a password reset OTP to the hospital's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: falety@example.com
 *     responses:
 *       200:
 *         description: OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please check your email for password reset OTP
 *       404:
 *         description: hospital not found or email not verified
 */

router.post('/forgot-password', forgotPassword);




/**
 * @swagger
 * /api/v1/hospital/reset-password:
 *   post:
 *     tags:
 *       - Hospital
 *     summary: Reset password
 *     description: Resets the hospital's password after OTP verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: falety@example.com
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *               confirmNewPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Passwords do not match
 *       404:
 *         description: hospital not found
 */

router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/v1/hospital/mothers:
 *   get:
 *     summary: Get mothers registered to the logged-in hospital
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 *     description: Returns only mothers whose hospitalId matches the authenticated hospital's token.
 *     responses:
 *       200:
 *         description: Mothers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mothers retrieved successfully
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: 9c27d236-7d61-4f3c-8f72-a1b2c3d4e5f6
 *                       hospitalId:
 *                         type: string
 *                         format: uuid
 *                         example: 2dbb3a33-49c4-4c71-9b23-a8f47162c197
 *                       firstName:
 *                         type: string
 *                         example: Ada
 *                       lastName:
 *                         type: string
 *                         example: Okafor
 *                       email:
 *                         type: string
 *                         example: ada@example.com
 *                       phoneNumber:
 *                         type: string
 *                         example: "+2348012345678"
 *                       estimatedDueDate:
 *                         type: string
 *                         example: "2026-12-01"
 *                       trimester:
 *                         type: string
 *                         example: second
 *                       selectedHospital:
 *                         type: string
 *                         example: Maternal Path Hospital
 *                       isVerified:
 *                         type: boolean
 *                         example: true
 *                       isUpdated:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Missing or invalid hospital token
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.get('/mothers', Authentication, getHospitalMothers);

/**
 * @swagger
 * /api/v1/hospital/mothers/{motherId}:
 *   get:
 *     summary: Get one mother registered to the logged-in hospital
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 *     description: Returns one mother only if her hospitalId matches the authenticated hospital's token.
 *     parameters:
 *       - in: path
 *         name: motherId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The mother's ID
 *     responses:
 *       200:
 *         description: Mother retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 9c27d236-7d61-4f3c-8f72-a1b2c3d4e5f6
 *                     hospitalId:
 *                       type: string
 *                       format: uuid
 *                       example: 2dbb3a33-49c4-4c71-9b23-a8f47162c197
 *                     firstName:
 *                       type: string
 *                       example: Ada
 *                     lastName:
 *                       type: string
 *                       example: Okafor
 *                     email:
 *                       type: string
 *                       example: ada@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "+2348012345678"
 *                     selectedHospital:
 *                       type: string
 *                       example: Maternal Path Hospital
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     isUpdated:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Missing or invalid hospital token
 *       404:
 *         description: Mother not found for this hospital
 *       500:
 *         description: Internal server error
 */
router.get('/mothers/:motherId', Authentication, getHospitalMother);


/**
 * @swagger
 * /api/v1/hospital/change-password:
 *   put:
 *     summary: Change hospital password
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.put('/change-password', Authentication, changePasswordValidator, changePassword);

module.exports = router;
