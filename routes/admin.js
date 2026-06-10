const express = require('express');
const { registerValidator } = require('../middlewares/validator');
const { createAdmin, loginAdmin, verifyEmail, resendOTP, forgotPassword, getMothers, getMother, getHospital, getHospitals, logout, verifyResetOTP, resetPassword } = require('../controller/admin');
const { Authentication, checkAdmin } = require('../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and authentication
 */


/**
 * @swagger
 * /api/v1/admin/admin:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Register a new admin
 *     description: Creates a new admin account and sends an OTP to the provided email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - password
 *               - confirmPassword
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "8012345678"
 *               password:
 *                 type: string
 *                 example: P@ssword123
 *               confirmPassword:
 *                 type: string
 *                 example: P@ssword123
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "+2348012345678"
 *       400:
 *         description: Email already exists or passwords do not match
 */
router.post('/admin',registerValidator, createAdmin);

/**
 * @swagger
 * /api/v1/admin/emailVerify:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Verify admin email
 *     description: Verifies the admin's email using the OTP sent during registration
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
 *                 example: john.doe@example.com
 *               otp:
 *                 type: string
 *                 example: "482910"
 *     responses:
 *       200:
 *         description: Admin verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin verified successfully
 *       404:
 *         description: Admin not found or invalid OTP
 */

router.post('/emailVerify', verifyEmail);

/**
 * @swagger
 * /api/v1/admin/resendOtp:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Resend OTP
 *     description: Resends the verification OTP to the admin's email
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
 *                 example: john.doe@example.com
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
 *         description: Admin not found
 */

router.post('/resendOtp',resendOTP);

/**
 * @swagger
 * /api/v1/admin/loginAdmin:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin login
 *     description: Authenticates an admin using email or phone number and password
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
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: P@ssword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials
 *       404:
 *         description: Email not verified
 */

router.post('/loginAdmin', loginAdmin);

/**
 * @swagger
 * /api/v1/admin/forgotPassword:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Forgot password
 *     description: Sends a password reset OTP to the admin's email
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
 *                 example: john.doe@example.com
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
 *         description: Admin not found or email not verified
 */

router.post('/forgotPassword', forgotPassword);

/**
 * @swagger
 * /api/v1/admin/verifyReset:
 *   post:
 *     tags:
 *       - Admin
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
 *                 example: john.doe@example.com
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
 *         description: Admin not found
 */

router.post('/verifyReset', verifyResetOTP);

/**
 * @swagger
 * /api/v1/admin/resetPassword:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Reset password
 *     description: Resets the admin's password after OTP verification
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
 *                 example: john.doe@example.com
 *               newPassword:
 *                 type: string
 *                 example: NewP@ssword123
 *               confirmNewPassword:
 *                 type: string
 *                 example: NewP@ssword123
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
 *         description: Admin not found
 */

router.post('/resetPassword', resetPassword);

/**
 * @swagger
 * /api/v1/admin/getMothers:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all mothers
 *     description: Retrieves all registered mothers (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All mothers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All mothers fetched successfully
 *                 mothers:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Unauthorised
 */

router.get('/getMothers', checkAdmin, getMothers),

/**
 * @swagger
 * /api/v1/admin/getMother:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get a single mother
 *     description: Retrieves a single mother by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The mother's ID
 *     responses:
 *       200:
 *         description: Mother fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother fetched successfully
 *                 mother:
 *                   type: object
 *       404:
 *         description: Mother not found
 */

router.get('/getMother', getMother);

/**
 * @swagger
 * /api/v1/admin/getHospitals:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all hospitals
 *     description: Retrieves all registered hospitals (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All hospitals fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All hospitals fetched successfully
 *                 hospitals:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Unauthorised
 */

router.get('/getHospitals', checkAdmin, getHospitals);

/**
 * @swagger
 * /api/v1/admin/getHospital:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get a single hospital
 *     description: Retrieves a single hospital by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The hospital's ID
 *     responses:
 *       200:
 *         description: Hospital fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hospital fetched successfully
 *                 hospital:
 *                   type: object
 *       404:
 *         description: Hospital not found
 */

router.get('/getHospital', getHospital);

/**
 * @swagger
 * /api/v1/admin/logOut:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Logout admin
 *     description: Logs out the authenticated admin and invalidates the session token in Redis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */

router.post('/logOut', logout)

module.exports = router