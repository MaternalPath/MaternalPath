const express = require('express');
const { createMother, verifyEmail, resendOTP, verifyResetOTP, resetPassword, updateMother, getMotherProfile, logout, loginMother, forgotPassword, getHospitals } = require('../controller/mother');
const { registerValidator, loginValidator, updateValidation } = require('../middlewares/validator');
const passport = require('passport');
const upload = require('../middlewares/multer');
const { Authentication } = require('../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Mother
 *   description: Mother management and authentication
 */


/**
 * @swagger
 * /api/v1/mother/register:
 *   post:
 *     tags:
 *       - Mother
 *     summary: Register a new mother
 *     description: Creates a new mother account and sends an OTP to the provided email
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
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
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
 *         description: Mother created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: Jane
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: jane.doe@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "+2348012345678"
 *       400:
 *         description: Email already exists or passwords do not match
 */

router.post('/register',registerValidator, createMother);


/**
 * @swagger
 * /api/v1/mother/verify:
 *   post:
 *     tags:
 *       - Mother
 *     summary: Verify mother's email
 *     description: Verifies the mother's email using the OTP sent during registration
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
 *                 example: jane.doe@example.com
 *               otp:
 *                 type: string
 *                 example: "482910"
 *     responses:
 *       200:
 *         description: Mother verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother verified successfully
 *       404:
 *         description: Mother not found or invalid OTP
 */

router.post('/verify', verifyEmail);


/**
 * @swagger
 * /api/v1/mother/resend-otp:
 *   post:
 *     tags:
 *       - Mother
 *     summary: Resend OTP
 *     description: Resends the verification OTP to the mother's email
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
 *                 example: jane.doe@example.com
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
 *         description: Mother not found
 */

router.post('/resend-otp',resendOTP);


/**
 * @swagger
 * /api/v1/mother/loginMother:
 *   post:
 *     tags:
 *       - Mother
 *     summary: Mother login
 *     description: Authenticates a mother using email or phone number and password
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
 *                 example: jane.doe@example.com
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

router.post('/loginMother',loginValidator, loginMother);


/**
 * @swagger
 * /api/v1/mother/forgot-password:
 *   post:
 *     tags:
 *       - Mother
 *     summary: Forgot password
 *     description: Sends a password reset OTP to the mother's email
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
 *                 example: jane.doe@example.com
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
 *         description: Mother not found or email not verified
 */

router.post('/forgot-password', forgotPassword);


/**
 * @swagger
 * /api/v1/mother/verify-reset:
 *   post:
 *     tags:
 *       - Mother
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
 *                 example: jane.doe@example.com
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
 *         description: Mother not found
 */

router.post('/verify-reset', verifyResetOTP);


/**
 * @swagger
 * /api/v1/mother/reset-password:
 *   post:
 *     tags:
 *       - Mother
 *     summary: Reset password
 *     description: Resets the mother's password after OTP verification
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
 *                 example: jane.doe@example.com
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
 *         description: Mother not found
 */

router.post('/reset-password', resetPassword);


/**
 * @swagger
 * /api/v1/mother/update-profile:
 *   put:
 *     tags:
 *       - Mother
 *     summary: Update mother profile
 *     description: Updates the authenticated mother's profile including an optional image upload.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: JPG, JPEG, PNG, or PDF file. Maximum size is 5MB.
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phoneNumber:
 *                 type: string
 *                 example: "8012345678"
 *               address:
 *                 type: string
 *                 example: 123 Main St, Lagos
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1995-06-15"
 *               estimatedDueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-12-01"
 *               trimester:
 *                 type: integer
 *                 example: 2
 *                 description: Must be 1, 2 or 3
 *               hospitalId:
 *                 type: string
 *                 example: "3f4d73a0-b228-4691-b848-3e2dcab195a3"
 *               bloodType:
 *                 type: string
 *                 example: O+
 *               existingHealthConditions:
 *                 type: string
 *                 example: None
 *               currentPregnancyWeek:
 *                 type: integer
 *                 example: 20
 *               emergencyContactName:
 *                 type: string
 *                 example: "John Doe"
 *               emergencyContactNumber:
 *                 type: string
 *                 example: "08098765432"
 *               allergies:
 *                 type: string
 *                 example: Penicillin
 *               savingsGoalAmount:
 *                 type: number
 *                 example: 500000
 *               weeklyContribution:
 *                 type: number
 *                 example: 10000
 *               linkedPaymentMethod:
 *                 type: string
 *                 example: transfer
 *     responses:
 *       200:
 *         description: Mother updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: Jane
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     image:
 *                       type: string
 *                       example: "https://res.cloudinary.com/sample/image.jpg"
 *                     selectedHospital:
 *                       type: string
 *                       example: Lagos General Hospital
 *                     hospitalAddress:
 *                       type: string
 *                       example: 45 Hospital Road, Lagos
 *                     hospitalContact:
 *                       type: string
 *                       example: "+2348012345678"
 *                     estimatedDeliveryCost:
 *                       type: number
 *                       example: 150000
 *                     pregnancyProgress:
 *                       type: number
 *                       example: 50
 *                     daysUntilDueDate:
 *                       type: integer
 *                       example: 140
 *       400:
 *         description: Invalid trimester value
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       404:
 *         description: Mother or hospital not found
 */
router.put('/update-profile', Authentication, upload.single('image'), updateValidation, updateMother);

/**
 * @swagger
 * /api/v1/mother/get-mother:
 *   get:
 *     tags:
 *       - Mother
 *     summary: Get mother profile
 *     description: Retrieves the authenticated mother's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mother profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mother profile retrieved successfully
 *                 data:
 *                   type: object
 *       404:
 *         description: Mother not found
 */

router.get('/get-mother',Authentication, getMotherProfile);

/**
 * @swagger
 * /api/v1/mother/getHospitals:
 *   get:
 *     summary: Get all hospitals
 *     tags: [Mother]
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
 *                     properties:
 *                       hospitalName:
 *                         type: string
 *                         example: Lagos General Hospital
 *                       email:
 *                         type: string
 *                         example: hospital@example.com
 *                       phoneNumber:
 *                         type: string
 *                         example: "09099923323"
 *                       address:
 *                         type: string
 *                         example: 45 Hospital Road, Lagos
 *                       deliveryFee:
 *                         type: number
 *                         example: 150000
 *       401:
 *         description: Unauthorized - token not found or invalid
 *       403:
 *         description: Unauthorised - admin access only
 *       500:
 *         description: Internal server error
 */

router.get('/getHospitals', Authentication, getHospitals);


/**
 * @swagger
 * /api/v1/mother/logout:
 *   post:
 *     tags:
 *       - Mother
 *     summary: Logout mother
 *     description: Logs out the authenticated mother and invalidates the session token in Redis
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

router.post('/logout', logout)

/**
 * @swagger
 * tags:
 *   - name: Google Auth
 *     description: Google OAuth2 authentication for mother accounts
 */

/**
 * @swagger
 * /api/v1/mother/collect:
 *   get:
 *     tags:
 *       - Google Auth
 *     summary: Start Google login
 *     description: Redirects the user to Google OAuth consent screen to authenticate with profile and email access.
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth page
 */

router.get('/collect', passport.authenticate('google', {scope: ['profile', 'email']}))

/**
 * @swagger
 * /api/v1/mother/googleSignUp:
 *   get:
 *     tags:
 *       - Google Auth
 *     summary: Google OAuth callback
 *     description: Handles Google callback after authentication. The backend checks if the mother already exists by email, creates a new mother account if needed, creates a wallet for new users, generates a JWT token, and redirects to success or failure.
 *     responses:
 *       302:
 *         description: Redirects to /api/v1/mother/loginsuccess on success or /api/v1/mother/loginfailed on failure
 */

router.get('/googleSignUp', passport.authenticate('google', {
    successRedirect: '/api/v1/mother/loginsuccess', 

                       
    failureRedirect: '/api/v1/mother/loginfailed'}))



    // router.get('/googleSignUp', passport.authenticate('google', {
    // successRedirect: '/api/user/loginsuccess', 
    // failureRedirect: '/api/user/loginfailed'}))

/**
 * @swagger
 * /api/v1/mother/loginsuccess:
 *   get:
 *     tags:
 *       - Google Auth
 *     summary: Google login success
 *     description: Returns the JWT token after successful Google authentication.
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
 *                 data:
 *                   type: string
 *                   description: JWT token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

router.get('/loginsuccess', (req, res) => {
        res.json({message: 'Login successful',  
            data: req.user})
    }) 

/**
 * @swagger
 * /api/v1/mother/loginfailed:
 *   get:
 *     tags:
 *       - Google Auth
 *     summary: Google login failed
 *     description: Returns a failure message when Google authentication does not succeed.
 *     responses:
 *       200:
 *         description: Login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login failed
 */

router.get('/loginfailed', (req, res) => {
        res.json({message: 'Login failed'})
    })

module.exports = router