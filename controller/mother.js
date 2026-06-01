const motherModel = require('../models/mother');
const bcrypt = require('bcrypt');
const { sendBrevoEmail } = require('../utils/brevo');
const otpGenerator = require('otp-generator');
const { signUpTemplate } = require('../utils/emailTemplates');
const jwt = require('jsonwebtoken');


exports.createMother = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword} = req.body;
        const emailExists = await motherModel.findOne({ where: {email: email.toLowerCase()}})
        console.log(emailExists)
        if (emailExists) {
            return res.status(400).json({
                message: `Mother with email: ${email} already exists`
            })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                error: 'Passwords do not match' 
            });
        }

        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        const expiresAt = new Date(Date.now() + 10 * 60000);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const mother = await motherModel.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            phoneNumber: `+234${phoneNumber}`,
            password: hashedPassword,
            confirmPassword,
            otpExpiresAt: expiresAt
        });

        const emailOptions = {
            email: mother.email,
            subject: 'Welcome to MaternalPath',
            html: signUpTemplate(mother.firstName + mother.lastName, OTP)
        }

        await sendBrevoEmail(emailOptions);

        const data = {
            firstName: mother.firstName,
            lastName: mother.lastName,
            email: mother.email,
            phoneNumber: mother.phoneNumber
        }

        res.status(201).json({
            message: 'Mother created successfully',
            data
    });
    } catch (error) {
       next({
        message: error.message,
        statusCode: 500
       }) 
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const mother = await motherModel.findOne({ email: email.toLowerCase()})

        if (!mother) {
            return res.status(404).json({
                message: 'Mother not found'
            })
        }

        if (new Date() > mother.otpExpiresAt || mother.otp != otp) {
            return res.status(404).json({
                message: 'Invalid OTP'
            })
        }

        mother.isVerified = true;
        mother.otp = null
        mother.otpExpiresAt = null

        await mother.save()

        res.status(200).json({
            message: 'Mother verified successfully'
        })
    } catch (error) {
       next({
        message: error.message,
        statusCode: 500
       })  
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const mother = await motherModel.findOne({ email: email.toLowerCase()});

        if (!mother) {
            return res.status(404).json({
                message: `Mother with ${email} not found`
            })
        } 

        const OTP = otpGenerator(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})

        const expiresAt = new Date(Date.now() + 10 * 60000);

        mother.otp = OTP;
        mother.otpExpiresAt = expiresAt;

        const emailOptions = {
            email: mother.email,
            subject: 'New otp confirmation',
            html: signUpTemplate(mother.firstName + mother.lastName, OTP)
        }

        await sendBrevoEmail(emailOptions);

        await mother.save();

        res.status(200).json({
            message: 'OTP resent successfully'
        })
    } catch (error) {
        next({
        message: error.message,
        statusCode: 500
       }) 
    }
};

exports.loginMother = async (req, res) => {
    try {
        const { emailOrPhoneNumber, password } = req.body;
        const user = userModel.findOne(e => (e.email === emailOrPhoneNumber?.toLowerCase() || e.phoneNumber === emailOrPhoneNumber));
        

        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials'
            })
        }

        return res.status(200).json({
            message: 'Login successful',
            data: user
        })
    } catch (error) {
        next({
        message: error.message,
        statusCode: 500
       }) 
    }
}