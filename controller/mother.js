const { Mother, Hospital, wallet,MotherUpdate } = require("../models");
const bcrypt = require("bcrypt");
const { sendBrevoEmail } = require("../utils/brevo");
const otpGenerator = require("otp-generator");
const {
  signUpTemplate,
  resetPasswordTemplate,
  resetPasswordSuccessfulTemplate,
} = require("../utils/emailTemplates");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const { Op } = require("sequelize");
const passport = require("passport");
const fs = require('fs')

const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Strategy definition
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
        const createUser = await Mother.create({
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
          motherId: createUser.dataValues.id,
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

exports.createMother = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      hospitalId,
    } = req.body;
    const emailExists = await Mother.findOne({
      where: { email: email.toLowerCase() },
    });
    console.log(emailExists);
    if (emailExists) {
      return res.status(400).json({
        message: `Mother with email: ${email} already exists`,
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    if (hospitalId) {
      const hospital = await Hospital.findByPk(hospitalId);
      if (!hospital) {
        return res.status(404).json({
          message: "Hospital not found",
        });
      }
    }

    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = new Date(Date.now() + 10 * 60000);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const mother = await Mother.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phoneNumber: `+234${phoneNumber}`,
      password: hashedPassword,
      hospitalId,
      otp: OTP,
      otpExpiresAt: expiresAt,
    });

    await wallet.create({
      motherId: mother.dataValues.id,
    });

    const emailOptions = {
      email: mother.email,
      subject: "Welcome to MaternalPath",
      html: signUpTemplate(mother.firstName + mother.lastName, OTP),
    };

    await sendBrevoEmail(emailOptions);

    const data = {
      firstName: mother.firstName,
      lastName: mother.lastName,
      email: mother.email,
      phoneNumber: mother.phoneNumber,
      hospitalId: mother.hospitalId,
    };

    res.status(201).json({
      message: "Mother created successfully",
      data,
    });
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const mother = await Mother.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!mother) {
      return res.status(404).json({
        message: "Mother not found",
      });
    }

    if (new Date() > mother.otpExpiresAt || mother.otp != otp) {
      return res.status(404).json({
        message: "Invalid OTP",
      });
    }

    mother.isVerified = true;
    mother.otp = null;
    mother.otpExpiresAt = null;

    await mother.save();

    res.status(200).json({
      message: "Mother verified successfully",
    });
  } catch (error) {
    return next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const mother = await Mother.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!mother) {
      return res.status(404).json({
        message: `Mother with ${email} not found`,
      });
    }

    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = new Date(Date.now() + 10 * 60000);

    mother.otp = OTP;
    mother.otpExpiresAt = expiresAt;

    const emailOptions = {
      email: mother.email,
      subject: "New otp confirmation",
      html: signUpTemplate(mother.firstName + mother.lastName, OTP),
    };

    await sendBrevoEmail(emailOptions);

    await mother.save();

    res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.loginMother = async (req, res, next) => {
  try {
    const { emailOrPhoneNumber, password } = req.body;

    const input = emailOrPhoneNumber?.trim();
    console.log("Input: ", input);
    const mother = await Mother.findOne({
      where: {
        [Op.or]: [{ email: input?.toLowerCase() }, { phoneNumber: input }],
      },
    });

    if (!mother) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (mother.isVerified == false) {
      return next({
        message: "Please verify your email before logging in",
        statusCode: 404,
      });
    }

    const passwordMatch = await bcrypt.compare(password, mother.password);

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    await mother.save();

    const token = await jwt.sign(
      { id: mother.id, email: mother.email },
      process.env.JWT_SECRET,
      { expiresIn: "1day" },
    );

    const check = mother.isUpdated;

    console.log(check);

    redisClient.del(`mother_${mother.id}`);

    redisClient.set(`mother_${mother.id}`, token, { EX: 86400 });

    return res.status(200).json({
      message: "Login successful",
      token,
      id: mother.id,
      name: `${mother.firstName} ${mother.lastName}`,
      isUpdated: check,
    });
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const mother = await Mother.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!mother) {
      return res.status(404).json({
        message: `Mother with email: ${email} not found`,
      });
    }

    if (mother.isVerified == false) {
      return next({
        message: "Please verify your email to complete this action",
        statusCode: 404,
      });
    }

    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = new Date(Date.now() + 10 * 60000);

    const emailData = {
      name: mother.firstName + mother.lastName,
      otp: OTP,
    };

    const emailOptions = {
      email: mother.email,
      subject: "Password reset OTP",
      html: resetPasswordTemplate(emailData),
    };

    await sendBrevoEmail(emailOptions);

    mother.otp = OTP;
    mother.otpExpiresAt = expiresAt;

    await mother.save();

    res.status(200).json({
      message: "Please check your email for password reset OTP",
    });
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const mother = await Mother.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!mother) {
      return next({
        message: "Mother not found",
        statusCode: 404,
      });
    }

    if (new Date() > mother.otpExpiresAt || mother.otp !== otp) {
      return next({
        message: "Invalid OTP",
        statusCode: 400,
      });
    }

    mother.otp = null;
    mother.otpExpiresAt = null;

    await mother.save();

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;

    const mother = await Mother.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!mother) {
      return next({
        message: "Mother not found",
        statusCode: 404,
      });
    }

    if (newPassword !== confirmNewPassword) {
      return next({
        message: "Passwords do not match",
        statusCode: 400,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    mother.password = hashedPassword;

    await mother.save();

    const emailOptions = {
      email: mother.email,
      subject: "Password Reset Successfully",
      html: resetPasswordSuccessfulTemplate(mother.firstName + mother.lastName),
    };

    await sendBrevoEmail(emailOptions);

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.updateMother = async (req, res, next) => {
  try {
    const id = req.user?.id;
    const hospitalId = req.params?.id;

    console.log('hospitalid', hospitalId)

    if (!id) {
      return next({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const mother = await Mother.findOne({ where: { id } });

    if (!mother) {
      return next({
        statusCode: 404,
        message: "Mother not found",
      });
    }

    const selectedHospitalId = hospitalId ?? mother.hospitalId;
    const hospital = await Hospital.findOne({
      where: { id: selectedHospitalId },
      attributes: ["hospitalName", "address", "phoneNumber", "deliveryFee"],
    });
    console.log("selectedHospitalId:", hospital);


    if (!hospital) {
      return next({
        statusCode: 404,
        message: "Hospital not found",
      });
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      address,
      image,
      estimatedDueDate,
      dateOfBirth,
      trimester,
      bloodType,
      existingHealthConditions,
      currentPregnancyWeek,
      emergencyContact,
      allergies,
      savingsGoalAmount,
      weeklyContribution,
      linkedPaymentMethod
    } = req.body;

    if (trimester > 3) {
      return next({
        message: 'invalid trimester'
      })
    }
    

    const today = new Date();
    //today.setHours(0, 0, 0, 0);

    const targetDate = new Date(estimatedDueDate);
    const timeDiff = targetDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const progress = currentPregnancyWeek * 100 / 40

    const details = {
      firstName: firstName ?? mother.firstName,
      lastName: lastName ?? mother.lastName,
      email: email ?? mother.email,
      phoneNumber: phoneNumber ?? mother.phoneNumber,
      isUpdated: true,
    }

    const data = {
      motherId: mother.id,
      image: req.file?.path,

      estimatedDueDate: estimatedDueDate ?? MotherUpdate.estimatedDueDate,
      trimester: trimester ?? MotherUpdate.trimester,
      bloodType: bloodType ?? MotherUpdate.bloodType,
      dateOfBirth: dateOfBirth ?? MotherUpdate.dateOfBirth,
      address: address ?? MotherUpdate.address,
      existingHealthConditions:
        existingHealthConditions ?? MotherUpdate.existingHealthConditions,
      currentPregnancyWeek: currentPregnancyWeek ?? MotherUpdate.currentPregnancyWeek,
      emergencyContact: emergencyContact ?? MotherUpdate.emergencyContact,
      allergies: allergies ?? MotherUpdate.allergies,
      savingsGoalAmount: savingsGoalAmount ?? MotherUpdate.savingsGoalAmount,
      weeklyContribution: weeklyContribution ?? MotherUpdate.weeklyContribution,
      linkedPaymentMethod: linkedPaymentMethod ?? MotherUpdate.linkedPaymentMethod,
      hospitalId: selectedHospitalId,

      selectedHospital: hospital.hospitalName,
      hospitalAddress: hospital.address,
      hospitalContact: hospital.phoneNumber,
      estimatedDeliveryCost: hospital.deliveryFee,
      pregnancyProgress: progress,
      daysUntilDueDate: daysLeft
    };

    if (mother.isUpdated === false) {
  await MotherUpdate.create(data);
  await mother.update(details);
} else{
  await MotherUpdate.update(data,{
    where: {
      motherId: mother.id
    }
  });
  await mother.update(details, {
    where: {
      id: mother.id
    }
  });
}

    res.status(200).json({
      message: "Mother updated successfully",
      data: details,
      data
    });
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.getMotherProfile = async (req, res, next) => {
  try {
    const id = req.user?.id;

    const mother = await Mother.findOne({
      where: { id },
      attributes: { exclude: ["password", "otp", "otpExpiresAt"] },
    });

    if (!mother) {
      return next({
        message: "Mother not found",
        statusCode: 404,
      });
    }

    const remainingAmountNeeded = mother.savingsGoalAmount - wallet.currentBalance;

    res.status(200).json({
      message: "Mother profile retrieved successfully",
      data: mother,
      remainingAmountNeeded
    });
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const id = req.user?.id;

    redisClient.del(`user: ${id}`);

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};
