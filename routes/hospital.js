const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createHospital, loginHospital, changePassword, updateHospitalProfile} = require('../controller/hospital');
const { hospitalRegisterValidator, hospitalLoginValidator, changePasswordValidator, updateHospitalProfileValidator } = require('../middlewares/validator');
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
  const extension = path.extname(file.originalname);
  if (allowedExtensions.test(extension)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and PDF files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

const router = express.Router();

router.post('/hospital/register', hospitalRegisterValidator, createHospital);
router.post('/hospital/login', hospitalLoginValidator, loginHospital);
router.put('/change-password', Authentication, changePasswordValidator, changePassword);
router.put(
    '/hospital/profile/:id',
    upload.fields([
        { name: 'hospitalLogo', maxCount: 1 },
        { name: 'verificationDocuments', maxCount: 5 }
    ]),
    updateHospitalProfileValidator,
    updateHospitalProfile
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Hospital
 *   description: Hospital management APIs
 */

/**
 * @swagger
 * /hospital/register:
 *   post:
 *     summary: Register a new hospital
 *     tags: [Hospital]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hospitalName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hospital registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/hospital/register', hospitalRegisterValidator, createHospital);

/**
 * @swagger
 * /change-password:
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
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/change-password', Authentication, changePasswordValidator, changePassword);

/**
 * @swagger
 * /hospital/profile/{id}:
 *   put:
 *     summary: Update hospital profile
 *     tags: [Hospital]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               hospitalLogo:
 *                 type: string
 *                 format: binary
 *               verificationDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               hospitalName:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hospital profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put(
  '/hospital/profile/:id',
  upload.fields([
    { name: 'hospitalLogo', maxCount: 1 },
    { name: 'verificationDocuments', maxCount: 5 }
  ]),
  updateHospitalProfileValidator,
  updateHospitalProfile
);