const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createHospital, loginHospital, changePassword} = require('../controller/hospital');
const { hospitalRegisterValidator, hospitalLoginValidator, changePasswordValidator  } = require('../middlewares/validator');
const { Authentication } = require('../middlewares/auth');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'hospitals');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now(); 
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|pdf)$/i;
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const extension = path.extname(file.originalname);
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
 *               - adminFullName
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
 *               hospitalLogo:
 *                 type: string
 *                 format: binary
 *                 description: JPG, JPEG, PNG, or PDF file. Maximum size is 5MB.
 *               verificationDocuments:
 *                 type: array
 *                 maxItems: 5
 *                 description: Upload up to 5 JPG, JPEG, PNG, or PDF files. Each file must be 5MB or less.
 *                 items:
 *                   type: string
 *                   format: binary
 *               adminFullName:
 *                 type: string
 *                 example: Ada Johnson
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
router.post('/register',
  upload.fields([
        { name: 'hospitalLogo', maxCount: 1 },
        { name: 'verificationDocuments', maxCount: 5 }
    ]), hospitalRegisterValidator, createHospital);

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
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hospital@example.com
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
