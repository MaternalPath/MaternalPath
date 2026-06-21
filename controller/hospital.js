const { Hospital, Mother } = require('../models');
const bcrypt = require('bcrypt');
const { sendBrevoEmail } = require('../utils/brevo');
const sendMail = require("../utils/nodemailer");
const otpGenerator = require('otp-generator');
const {
    signUpTemplate,
    resetPasswordTemplate,
    resetPasswordSuccessfulTemplate
} = require('../utils/emailTemplates');
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const redisClient = require('../config/redis')


const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientId,
      clientSecret: process.env.clientSecret,
      callbackURL: process.env.googleCallback,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      console.log("i am profile:", profile);
      console.log("email:", profile._json.email);
      const checkUser = await Mother.findOne({
        where: { email: profile._json.email },
      }); // sequelize uses "where"
      let token;

      if (checkUser) {
        token = jwt.sign({ id: checkUser.id }, process.env.JWT_SECRET, {
          expiresIn: "1day",
        });
      } else {
        const createUser = await Hospital.create({
          firstName: profile._json.given_name,
          lastName: profile._json.family_name,
          email: profile._json.email,
          isVerified: profile._json.email_verified,
          password: " ",
        });
        token = jwt.sign({ id: createUser.id }, process.env.JWT_SECRET, {
          expiresIn: "1day",
        });
        await wallet.create({
          hospitalId: createUser.dataValues.id,
        });
      }
      return done(null, token);
    },
  ),
);

passport.serializeUser((token, done) => {
  return done(null, token);
});

passport.deserializeUser((token, done) => {
  return done(null, token);
});


exports.createHospital = async (req, res) => {
    try {
        const { hospitalName, email, phoneNumber, password, address,  deliveryFee, medicalLicenseNumber } = req.body;
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
        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        const expiresAt = new Date(Date.now() + 10 * 60000);

        const hospital = await Hospital.create({
            hospitalName,
            email: email.toLowerCase(),
            phoneNumber: `+234${phoneNumber}`,
            password: hashedPassword,
            address,
            hospitalLogo,
            verificationDocuments: JSON.stringify(verificationDocuments),
            otp: OTP,
            otpExpiresAt: expiresAt,
            isVerified: false,
            deliveryFee,
            medicalLicenseNumber
        });

        const emailOptions = {
            email: hospital.email,
            subject: 'Hospital email verification OTP',
            html: signUpTemplate(hospital.hospitalName, OTP)
        };

        if (process.env.NODE_ENV === "production") {
      await sendBrevoEmail(emailOptions);
    } else {
      await sendMail(emailOptions);
    }

        const data = {
            hospitalName: hospital.hospitalName,
            email: hospital.email,
            phoneNumber: hospital.phoneNumber,
            address: hospital.address,
            hospitalLogo: hospital.hospitalLogo,
            verificationDocuments,
            otp: hospital.otp,
            deliveryFee: hospital.deliveryFee,
            medicalLicenseNumber: hospital.medicalLicenseNumber
        }

        res.status(201).json({
            message: 'Hospital created successfully. Please check your email for OTP',
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

        if (process.env.NODE_ENV === "production") {
      await sendBrevoEmail(emailOptions);
    } else {
      await sendMail(emailOptions);
    }

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
        const { emailOrPhoneNumber, password } = req.body;

        const input = emailOrPhoneNumber?.trim();
        const hospital = await Hospital.findOne({
            where: {
                [Op.or]: [
                    { email: input?.toLowerCase() },
                    { phoneNumber: input }
                ]
            }
        });

        if (!hospital) {
            return res.status(404).json({
                message: 'Hospital not found'
            });
        }
        if (hospital.lockUntil && hospital.lockUntil > Date.now()) {
            return next({
                message: `Account locked until ${hospital.lockUntil}`,
                statusCode: 403
            })
        }

        const passwordMatch = await bcrypt.compare(password, hospital.password);

        if (!passwordMatch) {
            hospital.loginAttempts += 1;
            if (hospital.loginAttempts >= 5) {
                hospital.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
                hospital.loginAttempts = 0;
            }
            await user.save();
            return res.status(400).json({
                message: 'Invalid password'
            });
        }

        const token = jwt.sign(
            { id: hospital.id, email: hospital.email },
            process.env.JWT_SECRET || 'olachi',
            { expiresIn: '1d' }
        );
           
        // redisClient.setex(`hospital_${hospital.id}`, 7 * 24 * 60 * 60, token);

        res.status(200).json({
            message: 'Login successful',
            token,
            data: {
                hospitalName: hospital.hospitalName,
                id: hospital.id,
                email: hospital.email,
                phoneNumber: hospital.phoneNumber
            }
        }); 
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            const error = new Error('Email is required');
            error.statusCode = 400;
            return next(error);
        }

        const hospital = await Hospital.findOne({ where: { email: email.toLowerCase()}});

        if (!hospital) {
            return res.status(404).json({
                message: `hospital with email: ${email} not found`
            })
        }

        if (hospital.isVerified == false) {
            return next({
                message: 'Please verify your email to complete this action',
                statusCode: 404
            })
        }

        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        const expiresAt = new Date(Date.now() + 10 * 60000);

        const emailData = {
            name: hospital.hospitalName,
            otp: OTP
        }

        const emailOptions = {
            email: hospital.email,
            subject: 'Password reset OTP',
            html: resetPasswordTemplate(emailData)
        }

        if (process.env.NODE_ENV === "production") {
      await sendBrevoEmail(emailOptions);
    } else {
      await sendMail(emailOptions);
    }

        hospital.otp = OTP;
        hospital.otpExpiresAt = expiresAt;

        await hospital.save();

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

        const hospital = await Hospital.findOne({ where: { email: email.toLowerCase() } });

        if (!hospital) {
            return next({
                message: 'hospital not found',
                statusCode: 404
            })
        }

        if (new Date() > hospital.otpExpiresAt ||hospital.otp !== otp) {
            return next({
                message: 'Invalid OTP',
                statusCode: 400
            })
        }

        hospital.otp = null;
        hospital.otpExpiresAt = null;

        await hospital.save();

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

        const hospital = await Hospital.findOne({ where: { email: email.toLowerCase() } });

        if (!hospital) {
            return next({
                message: 'hospital not found',
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

        hospital.password = hashedPassword;

        await hospital.save();

        const emailOptions = {
            email: hospital.email,
            subject: 'Password Reset Successfully',
            html: resetPasswordSuccessfulTemplate(hospital.hospitalName)
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

exports.getHospitalMothers = async (req, res) => {
    try {
        const { id } = req.user;

        const hospital = await Hospital.findByPk(id);
        if (!hospital) {
            return res.status(404).json({
                message: 'Hospital not found'
            });
        }

        const mothers = await Mother.findAll({
            where: { hospitalId: id },
            attributes: {
                exclude: ['password', 'otp', 'otpExpiresAt']
            },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: 'Mothers retrieved successfully',
            count: mothers.length,
            data: mothers
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


exports.getHospitalMother = async (req, res) => {
  try {
    const hospitalId = req.user?.id;
    const { motherId } = req.params;

    if (!motherId) {
      return res.status(400).json({ message: 'Mother ID is required' });
    }

    const mother = await Mother.findOne({
      where: { id: motherId, id:hospitalId }
    });

    // ,
    //   attributes: { exclude: ['password', 'otp', 'otpExpiresAt'] },
    //   include: [
    //     { model: Hospital, attributes: ['hospitalName'], required: false }
    //   ]

    // console.log("mother: ", mother);

    if (!mother) {
      return res.status(404).json({ message: 'Mother not found for this hospital' });
    }

    res.status(200).json({
      message: 'Mother retrieved successfully',
      data: mother
    });
  } catch (error) {
    console.error('getHospitalMother error:', error);
    res.status(500).json({ message: 'Error retrieving mother' }); // don't leak error.message
  }
};


exports.getHospitalProfile = async (req, res) => {
    try {
        const { id } = req.user; 

        const hospital = await Hospital.findByPk(id, {
            attributes: {
                exclude: ['password', 'otp', 'otpExpiresAt']
            }
        });

        if (!hospital) {
            return res.status(404).json({
                message: 'Hospital not found'
            });
        }

        res.status(200).json({
            message: 'Hospital profile retrieved successfully',
            data: hospital
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// exports.updateHospitalProfile = async(req, res, next) => {
//     try {
//         const id = req.user?.id;
//         if (!id) {
//             return next({
//                 message: "Unauthorized",
//                 statusCode: 401
//             })
//         }

//         const hospital = await Hospital.findOne({ where: {id}});

//         if (!hospital) {
//             return next({
//                 message: "Hospital not found",
//                 statusCode: 404
//             })
//         }

//         const { hospitalName, email, phoneNumber, address,  deliveryFee} = req.body;

//         const data = { 
//             hospitalName: hospitalName ?? Hospital.hospitalName, 
//             email: email ?? Hospital.email, 
//             phoneNumber: phoneNumber ?? Hospital.phoneNumber, 
//             address: address ?? Hospital.address,  
//             deliveryFee: deliveryFee ?? Hospital.deliveryFee
//         }

//         await Hospital.update(data, {
//   where: { id }
// });

//         res.status(200).json({
//             message: 'Hospital Updated successfully',
//             data
//         })
//     } catch (error) {
//        next({
//         message: error.message,
//         statusCode: 500
//        }) 
//     }
// }


// exports.updateHospitalProfile = async(req, res, next) => {
//     try {
//         const id = req.user?.id;
//         if (!id) {
//             return next({
//                 message: "Unauthorized",
//                 statusCode: 401
//             })
//         }

//         const hospital = await Hospital.findOne({ where: {id}});

//         if (!hospital) {
//             return next({
//                 message: "Hospital not found",
//                 statusCode: 404
//             })
//         }

//         const { hospitalLogo, hospitalName, email, phoneNumber, address, deliveryFee } = req.body;

//         const data = {
//              hospitalLogo: hospitalLogo ?? hospital.hospitalLogo, 
//             hospitalName: hospitalName ?? hospital.hospitalName, 
//             email: email ?? hospital.email, 
//             phoneNumber: phoneNumber ?? hospital.phoneNumber, 
//             address: address ?? hospital.address,  
//             deliveryFee: deliveryFee ?? hospital.deliveryFee,
//         }

//         await Hospital.update(data, {
//             where: { id }
//         });

//         res.status(200).json({
//             message: 'Hospital Updated successfully',
//             data
//         })
//     } catch (error) {
//        next({
//         message: error.message,
//         statusCode: 500
//        }) 
//     }
// }


exports.updateHospitalProfile = async(req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            return next({
                message: "Unauthorized",
                statusCode: 401
            })
        }

        const hospital = await Hospital.findOne({ where: {id}});

        if (!hospital) {
            return next({
                message: "Hospital not found",
                statusCode: 404
            })
        }

        // 1. Destructure the other fields from req.body (exclude hospitalLogo from here)
        const { hospitalName, email, phoneNumber, address, deliveryFee } = req.body;

        // 2. Check if a new file was uploaded in req.file. 
        // If not, keep the existing logo (or fallback to req.body.hospitalLogo if they sent a string URL)
        const logoPath = req.file
            ? `/uploads/hospitals/${req.file.filename}` 
            : (req.body.hospitalLogo ?? hospital.hospitalLogo);

        const data = {
            hospitalLogo: logoPath, 
            hospitalName: hospitalName ?? hospital.hospitalName, 
            email: email ?? hospital.email, 
            phoneNumber: phoneNumber ?? hospital.phoneNumber, 
            address: address ?? hospital.address,  
            deliveryFee: deliveryFee ?? hospital.deliveryFee,
        }

        await Hospital.update(data, {
            where: { id }
        });

        res.status(200).json({
            message: 'Hospital Updated successfully',
            data
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



