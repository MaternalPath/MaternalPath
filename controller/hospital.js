const { Hospital } = require('../models');
const bcrypt = require('bcrypt');
const { sendBrevoEmail } = require('../utils/brevo');
const otpGenerator = require('otp-generator');
const { signUpTemplate , resetPasswordTemplate} = require('../utils/emailTemplates');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis')


exports.createHospital = async (req, res) => {
    try {
        const { hospitalName, email, phoneNumber, password, address, adminFullName, deliveryFee, medicalLicenseNumber } = req.body;
        const hospitalLogo = req.files?.hospitalLogo?.[0]
            ? `/uploads/hospitals/${req.files.hospitalLogo[0].filename}`
            : null;
        const verificationDocuments = req.files?.verificationDocuments
            ? req.files.verificationDocuments.map((file) => `/uploads/hospitals/${file.filename}`)
            : [];

        const emailExists = await Hospital.findOne({ where: { email: email.toLowerCase() } });
         console.log(emailExists)
        if (emailExists) {
            return res.status(400).json({
                message: `Hospital with email: ${email} already exists`
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const hospital = await Hospital.create({
            hospitalName,
            email: email.toLowerCase(),
            phoneNumber: `+234${phoneNumber}`,
            password: hashedPassword,
            address,
            hospitalLogo,
            verificationDocuments: JSON.stringify(verificationDocuments),
            adminFullName,
            deliveryFee,
            medicalLicenseNumber
        });

        const data = {
            hospitalName: hospital.hospitalName,
            email: hospital.email,
            phoneNumber: hospital.phoneNumber,
            address: hospital.address,
            hospitalLogo: hospital.hospitalLogo,
            verificationDocuments,
            adminFullName: hospital.adminFullName,
            deliveryFee: hospital.deliveryFee,
            medicalLicenseNumber: hospital.medicalLicenseNumber
        }

        res.status(201).json({
            message: 'Hospital created successfully',
            data
    });
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        }); 
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const hospital = await Hospital.findOne({ where: { email: email.toLowerCase() } });

        if (!hospital) {
            return res.status(404).json({
                message: 'Hospital not found'
            })
        }

        if (new Date() > hospital.otpExpiresAt || hospital.otp != otp) {
            return res.status(404).json({
                message: 'Invalid OTP'
            })
        }

        hospital.isVerified = true;
        hospital.otp = null
        hospital.otpExpiresAt = null

        await hospital.save()

        res.status(200).json({
            message: 'Hospital verified successfully'
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

        const hospital = await Hospital.findOne({ where: { email: email.toLowerCase() } });

        if (!hospital) {
            return res.status(404).json({
                message: `Hospital with ${email} not found`
            })
        } 

        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })

        const expiresAt = new Date(Date.now() + 10 * 60000);

        hospital.otp = OTP;
        hospital.otpExpiresAt = expiresAt;

        const emailOptions = {
            email: hospital.email,
            subject: 'New otp confirmation',
            html: signUpTemplate(hospital.hospitalName, OTP)
        }

        await sendBrevoEmail(emailOptions);

        await hospital.save();

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

exports.loginHospital = async (req, res) => {
    try {
        const { email, password } = req.body;

        const hospital = await Hospital.findOne({ where: { email: email.toLowerCase() } });

        if (!hospital) {
            return res.status(404).json({
                message: 'Hospital not found'
            });
        }

        const passwordMatch = await bcrypt.compare(password, hospital.password);

        if (!passwordMatch) {
            return res.status(400).json({
                message: 'Invalid password'
            });
        }

        const token = jwt.sign(
            { id: hospital.id, email: hospital.email },
            process.env.SECRET_KEY || 'your-secret-key-change-this-in-production',
            { expiresIn: '7d' }
        );

        // redisClient.setex(`hospital_${hospital.id}`, 7 * 24 * 60 * 60, token);

        res.status(200).json({
            message: 'Login successful',
            token,
            data: {
                email: hospital.email,
                phoneNumber: hospital.phoneNumber,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.changePassword = async(req, res)=>{
    try {
        const { id } = req.user;

        const { currentPassword, newPassword, confirmPassword } = req.body;
        const hospital = await Hospital.findByPk(id);
        if(!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            })
        }
        const checkPassword = await bcrypt.compare(currentPassword, hospital.password);
        if (!checkPassword) {
            return res.status(400).json({
                message: "old password is invalid"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        hospital.password = hashedPassword;

        await hospital.save();
        res.status(200).json({
            message: "Password changed successfully"
        })

        
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

// exports.updateHospitalProfile = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { hospitalName, phoneNumber, adminFullName, deliveryFee, medicalLicenseNumber } = req.body;

//         const hospital = await Hospital.findByPk(id);

//         if (!hospital) {
//             return res.status(404).json({
//                 message: 'Hospital not found'
//             });
//         }

//         const hospitalLogo = req.files?.hospitalLogo?.[0];
//         const verificationDocuments = req.files?.verificationDocuments || [];

//         hospital.hospitalName = hospitalName || hospital.hospitalName;
//         hospital.phoneNumber = phoneNumber || hospital.phoneNumber;
//         hospital.hospitalLogo = hospitalLogo ? `/uploads/hospitals/${hospitalLogo.filename}` : hospital.hospitalLogo;
//         hospital.adminFullName = adminFullName;
//         hospital.deliveryFee = deliveryFee;
//         hospital.medicalLicenseNumber = medicalLicenseNumber;
//         hospital.verificationDocuments = JSON.stringify(
//             verificationDocuments.map((file) => `/uploads/hospitals/${file.filename}`)
//         );

//         await hospital.save();

//         res.status(200).json({
//             message: 'Hospital profile updated successfully',
//             data: {
//                 id: hospital.id,
//                 hospitalName: hospital.hospitalName,
//                 email: hospital.email,
//                 phoneNumber: hospital.phoneNumber,
//                 address: hospital.address,
//                 hospitalLogo: hospital.hospitalLogo,
//                 adminFullName: hospital.adminFullName,
//                 deliveryFee: hospital.deliveryFee,
//                 medicalLicenseNumber: hospital.medicalLicenseNumber,
//                 verificationDocuments: JSON.parse(hospital.verificationDocuments)
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };


exports.logout = async (req, res, next) => {
    try {
        const { id } = req.user;

        redisClient.del(`hospital_${id}`);

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
