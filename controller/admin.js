const { Mother, Hospital } = require('../models');
const hospitalModel = require('../models/hospital');
const { Admin } = require('../models')
const bcrypt = require('bcrypt');
const { sendBrevoEmail } = require('../utils/brevo');
const otpGenerator = require('otp-generator');
const { signUpTemplate , resetPasswordTemplate} = require('../utils/emailTemplates');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const { Op } = require('sequelize');

exports.createAdmin = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword} = req.body;
        const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase().trim() : null;
        if (!normalizedEmail) {
            return res.status(400).json({ message: 'email is required' });
        }
        const emailExists = await Admin.findOne({ where: { email: normalizedEmail } });
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

        const admin = await Admin.create({
            firstName,
            lastName,
            email: normalizedEmail,
            phoneNumber: `+234${phoneNumber}`,
            password: hashedPassword,
            otp: OTP,
            otpExpiresAt: expiresAt
        });

        const emailOptions = {
            email: admin.email,
            subject: 'Welcome to MaternalPath',
            html: signUpTemplate(admin.firstName + admin.lastName, OTP)
        }

        await sendBrevoEmail(emailOptions);

        const data = {
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phoneNumber: admin.phoneNumber
        }

        res.status(201).json({
            message: 'Admin created successfully',
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
        const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase().trim() : null;
        if (!normalizedEmail) return res.status(400).json({ message: 'email is required' });

        const admin = await Admin.findOne({ where: { email: normalizedEmail } });

        if (!admin) {
            return res.status(404).json({
                message: 'admin not found'
            })
        }

        if (new Date() > admin.otpExpiresAt || admin.otp != otp) {
            return res.status(404).json({
                message: 'Invalid OTP'
            })
        }

        admin.isVerified = true;
        admin.otp = null
        admin.otpExpiresAt = null

        await admin.save()

        res.status(200).json({
            message: 'Admin verified successfully'
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
        const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase().trim() : null;
        if (!normalizedEmail) return res.status(400).json({ message: 'email is required' });

        const admin = await Admin.findOne({ where: { email: normalizedEmail } });

        if (!admin) {
            return res.status(404).json({
                message: `Admin with ${email} not found`
            })
        } 

        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })

        const expiresAt = new Date(Date.now() + 10 * 60000);

        admin.otp = OTP;
        admin.otpExpiresAt = expiresAt;

        const emailOptions = {
            email: admin.email,
            subject: 'New otp confirmation',
            html: signUpTemplate(admin.firstName + admin.lastName, OTP)
        }

        await sendBrevoEmail(emailOptions);

        await admin.save();

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

exports.loginAdmin = async (req, res, next) => {
    try {
        const { emailOrPhoneNumber, password } = req.body;

        const input = emailOrPhoneNumber?.trim();
console.log('Input: ', input);
        const admin = await Admin.findOne({
    where: {
        [Op.or]: [
            { email: input?.toLowerCase() },
            { phoneNumber: input }
        ]
    }
});

        if (!admin) {
            return res.status(400).json({
                message: 'Invalid credentials'
            })
        }

        if (admin.isVerified == false) {
            return next({
                message: 'Please verify your email before logging in',
                statusCode: 404
            })
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            })
        }

        await admin.save();

        const token = await jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1day'});

        redisClient.del(`admin_${admin.id}`);

        redisClient.set(`admin_${admin.id}`, token, { EX: 86400 });

        return res.status(200).json({
            message: 'Login successful',
            token
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
        const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase().trim() : null;
        if (!normalizedEmail) return res.status(400).json({ message: 'email is required' });

        const admin = await Admin.findOne({ where: { email: normalizedEmail }});

        if (!admin) {
            return res.status(404).json({
                message: `admin with email: ${email} not found`
            })
        }

        if (admin.isVerified == false) {
            return next({
                message: 'Please verify your email to complete this action',
                statusCode: 404
            })
        }

        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        const expiresAt = new Date(Date.now() + 10 * 60000);

        const emailData = {
            name: admin.firstName + admin.lastName,
            otp: OTP
        }

        const emailOptions = {
            email: admin.email,
            subject: 'Password reset OTP',
            html: resetPasswordTemplate(emailData)
        }

        await sendBrevoEmail(emailOptions);

        admin.otp = OTP;
        admin.otpExpiresAt = expiresAt;

        await admin.save();

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
        const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase().trim() : null;
        if (!normalizedEmail) return res.status(400).json({ message: 'email is required' });

        const admin = await Admin.findOne({ where: { email: normalizedEmail } });

        if (!admin) {
            return next({
                message: 'admin not found',
                statusCode: 404
            })
        }

        if (new Date() > admin.otpExpiresAt ||admin.otp !== otp) {
            return next({
                message: 'Invalid OTP',
                statusCode: 400
            })
        }

        admin.otp = null;
        admin.otpExpiresAt = null;

        await admin.save();

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
        const normalizedEmail = email && typeof email === 'string' ? email.toLowerCase().trim() : null;
        if (!normalizedEmail) return res.status(400).json({ message: 'email is required' });

        const admin = await Admin.findOne({ where: { email: normalizedEmail } });

        if (!admin) {
            return next({
                message: 'admin not found',
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

        admin.password = hashedPassword;

        await admin.save();

        const emailOptions = {
            email: admin.email,
            subject: 'Password Reset Successfully',
            html: resetPasswordSuccessTemplate(admin.firstName + admin.lastName)
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
};

exports.getMothers = async (req, res, next) => {
    try {
        const id = req.user?.id;
        const user = await Admin.findOne({where: {id}});
        if (user.role !== 'admin') {
            return next({
                message: 'Unauthorised',
                statusCode: 403
            })
        }
        const mothers = await Mother.findAll({ attributes: { exclude: ['password']}});
        res.status(200).json({
            message: 'All mothers fetched successfully',
            mothers
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.getMother = async (req, res, next) => {
    try {
        const { id } = req.params;
        const foundMother = await Mother.findOne({where: {id}}).select('-password');
        if (!foundMother) {
            return next({
                message: 'Mother not found',
                statusCode: 404
            })
        }

        res.status(200).json({
            message: 'Mother fetched successfully',
            foundMother
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}
exports.getHospitals = async (req, res, next) => {
     try {
        const id = req.user.id;
        console.log(req.user)
        const user = await Admin.findOne({where: {id}});
        if (user.role !== 'admin') {
            return next({
                message: 'Unauthorised',
                statusCode: 403
            })
        }
        const hospitals = await Hospital.findAll({ attributes: {exclude: ['password']}});
        res.status(200).json({
            message: 'All hospitals fetched successfully',
            hospitals
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.getHospital = async (req, res, next) => {
    try {
        const { id } = req.params;
        const foundHospital = await hospital.findOne({where: {id}}).select('-password');
        if (!foundHospital) {
            return next({
                message: 'Hospital not found',
                statusCode: 404
            })
        }

        res.status(200).json({
            message: 'Hospital fetched successfully',
            foundHospital
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.logout = async (req, res, next) => {
    try {
        const id = req.user?.id;
        redisClient.del(`user: ${id}`);

        res.status(200).json({
            message: 'Logout successful'
        })
    } catch (error) {
        next(error);
    }
}