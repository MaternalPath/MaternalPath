const { Mother } = require('../models');
const hospitalModel = require('../models/hospital');
const bcrypt = require('bcrypt');
const { sendBrevoEmail } = require('../utils/brevo');
const otpGenerator = require('otp-generator');
const { signUpTemplate , resetPasswordTemplate} = require('../utils/emailTemplates');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis')
const { Op } = require('sequelize');


exports.createMother = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword} = req.body;
        const emailExists = await Mother.findOne({ where: {email: email.toLowerCase()}})
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

        const mother = await Mother.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            phoneNumber: `+234${phoneNumber}`,
            password: hashedPassword,
            otp: OTP,
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

exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const mother = await Mother.findOne({ where: { email: email.toLowerCase() } });

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
       return next({
        message: error.message,
        statusCode: 500
       })  
    }
};

exports.resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        const mother = await Mother.findOne({ where: { email: email.toLowerCase() } });

        if (!mother) {
            return res.status(404).json({
                message: `Mother with ${email} not found`
            })
        } 

        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })

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

exports.loginMother = async (req, res, next) => {
    try {
        const { emailOrPhoneNumber, password } = req.body;

        const input = emailOrPhoneNumber?.trim();
console.log('Input: ', input);
        const mother = await Mother.findOne({
    where: {
        [Op.or]: [
            { email: input?.toLowerCase() },
            { phoneNumber: input }
        ]
    }
});

        if (!mother) {
            return res.status(400).json({
                message: 'Invalid credentials'
            })
        }

        if (mother.isVerified == false) {
            return next({
                message: 'Please verify your email before logging in',
                statusCode: 404
            })
        }

        const passwordMatch = await bcrypt.compare(password, mother.password);

        if (!passwordMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            })
        }

        await mother.save();

        const token = await jwt.sign({ id: mother._id, email: mother.email }, process.env.JWT_SECRET, { expiresIn: '1day'});

        const check = mother.isUpdated;

        console.log(check)

        redisClient.del(`mother_${mother._id}`);

        redisClient.set(`mother_${mother._id}`, token, { EX: 86400 });

        return res.status(200).json({
            message: 'Login successful',
            token,
            check
        })
    } catch (error) {
        next({
        message: error.message,
        statusCode: 500
       }) 
    }
}

exports.forgotPassword = async (req, res,next) => {
    try {
        const { email } = req.body;

        const mother = await Mother.findOne({ where: { email: email.toLowerCase()}});

        if (!mother) {
            return res.status(404).json({
                message: `Mother with email: ${email} not found`
            })
        }

        if (mother.isVerified == false) {
            return next({
                message: 'Please verify your email to complete this action',
                statusCode: 404
            })
        }

        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        const expiresAt = new Date(Date.now() + 10 * 60000);

        const emailData = {
            name: mother.firstName + mother.lastName,
            otp: OTP
        }

        emailOptions = {
            email: mother.email,
            subject: 'Password reset OTP',
            html: resetPasswordTemplate(emailData)
        }

        await sendBrevoEmail(emailOptions);

        mother.otp = OTP;
        mother.otpExpiresAt = expiresAt;

        await mother.save();

        res.status(200).json({
            message: 'Please check your email for password reset OTP'
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.verifyResetOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const mother = await Mother.findOne({ where: { email: email.toLowerCase() } });

        if (!mother) {
            return next({
                message: 'Mother not found',
                statusCode: 404
            })
        }

        if (new Date() > mother.otpExpiresAt ||mother.otp !== otp) {
            return next({
                message: 'Invalid OTP',
                statusCode: 400
            })
        }

        mother.otp = null;
        mother.otpExpiresAt = null;

        await mother.save();

        res.status(200).json({
            message: 'OTP verified successfully'
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword, confirmNewPassword } = req.body;

        const mother = await Mother.findOne({ where: { email: email.toLowerCase() } });

        if (!mother) {
            return next({
                message: 'Mother not found',
                statusCode: 404
            })
        }

        if (newPassword !== confirmNewPassword) {
            return next({
                message: 'Passwords do not match',
                statusCode: 400
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        mother.password = hashedPassword;

        await mother.save();

        const emailOptions = {
            email: mother.email,
            subject: 'Password Reset Successfully',
            html: resetPasswordSuccessTemplate(mother.firstName + mother.lastName)
        }

        await sendBrevoEmail(emailOptions);

        res.status(200).json({
            message: 'Password reset successfully'
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.updateMother = async (req, res, next) => {
    try {
        const { firstName, lastName, phoneNumber, email, address, estimatedDueDate, trimester, bloodType, existingHealthConditions, currentPregnancyWeek, emergencyContact, allergies,savingsGoalAmount, weeklyContribution, linkedPaymentMethod } = req.body;

        const { id } = req.user;

        const mother = await Mother.findOne({ where: { id } });

        if (!mother) {
  return next({
    statusCode: 404,
    message: 'Mother not found'
  });
}

const hospital = await hospitalModel.findOne({
  where: { id: mother.hospitalId },
  attributes: [
    'hospitalName',
    'hospitalAddress',
    'hospitalContact',
    'estimatedDeliveryCost'
  ]
});

if (!hospital) {
  return next({
    statusCode: 404,
    message: 'Hospital not found'
  });
}

const data = {
  firstName: firstName ?? mother.firstName,
  lastName: lastName ?? mother.lastName,
  email: email ?? mother.email,
  address: address ?? mother.address,
  phoneNumber: phoneNumber ?? mother.phoneNumber,

  estimatedDueDate: estimatedDueDate ?? mother.estimatedDueDate,
  trimester: trimester ?? mother.trimester,
  bloodType: bloodType ?? mother.bloodType,
  existingHealthConditions: existingHealthConditions ?? mother.existingHealthConditions,
  currentPregnancyWeek: currentPregnancyWeek ?? mother.currentPregnancyWeek,
  emergencyContact: emergencyContact ?? mother.emergencyContact,
  allergies: allergies ?? mother.allergies,
  savingsGoalAmount: savingsGoalAmount ?? mother.savingsGoalAmount,
  weeklyContribution: weeklyContribution ?? mother.weeklyContribution,

  selectedHospital: hospital.hospitalName,
  hospitalAddress: hospital.hospitalAddress,
  hospitalContact: hospital.hospitalContact,
  estimatedDeliveryCost: hospital.estimatedDeliveryCost
};

mother.isUpdated = true;

await mother.update(data);

    res.status(200).json({
        message: 'Mother updated successfully',
        data: updatedMother
    })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getMotherProfile = async (req, res, next) => {
    try{
        const { id } = req.user;

        const mother = await Mother.findOne({ where: { id } }).select('-password -otp -otpExpiresAt');

        if(!mother) {
            return next({
                message: 'Mother not found',
                statusCode: 404
            })
        }

        res.status(200).json({
            message: 'Mother profile retrieved successfully',
            data: mother
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.logout = async (req, res, next) => {
    try {
        const { id } = req.user;

        redisClient.del(`mother_${id}`);

        res.status(200).json({
            message: 'Logout successful'
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}