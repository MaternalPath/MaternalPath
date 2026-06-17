const joi = require('joi');

exports.registerValidator = async (req, res, next) => {
    const schema = joi.object({
        firstName: joi.string().trim().pattern(/^[a-zA-Z\s]{3,}$/).required().messages({
            'string.base': 'Firstname must be a string',
            'string.empty': 'Firstname is required',
            'string.min': 'Firstname must be at least 4 characters long',
            'any.required': 'Firstname is required',
            'string.pattern.base': 'First name cannot contain digits and must be a minimum of 3 characters'
        }),
        lastName: joi.string().trim().pattern(/^[a-zA-Z\s]{3,}$/).required().messages({
            'string.base': 'Lastname must be a string',
            'string.empty': 'Lastname is required',
            'string.min': 'Lastname must be at least 4 characters long',
            'any.required': 'Lastname is required',
            'string.pattern.base': 'School name cannot contain digits and must be a minimum of 3 characters'
        }),
        email: joi.string().trim().email().required().messages({
              'string.email': 'Please enter a valid email',
              'any.required': 'Email is required'
        }),
        password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
        'any required':'Password is required',
        'string.empty':'Password cannot be Empty',
        'string.pattern.base':'Password must be 8 chracters must include upper and lower case'
        }),
        confirmPassword: joi.string().trim().required().valid(joi.ref('password')).messages({
            'any.only': 'Confirm password must match password',
            'any.required': 'Confirm password is required',
            'string.empty': 'Confirm password cannot be empty'
        }),
        phoneNumber: joi.string().trim().pattern(/^[0-9]{10}$/).required().messages({
            'string.empty': 'Phone number cannot be empty',
            'any.required': 'Phone number is required',
            'string.pattern.base': 'Phone number must contain only 10 digit numbers'
        }),
        hospitalId: joi.string().trim().guid({ version: ['uuidv4'] }).optional().messages({
            'string.guid': 'Hospital ID must be a valid UUID'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next();
};
exports.loginValidator = async (req, res, next) => {
    const schema = joi.object({
        emailOrPhoneNumber: joi.string().trim().required().messages({
              'string.empty': 'Empty or PhoneNumber cannot be Empty',
              'any required':'Email or Phone Number is required',
        }),
        password: joi.string().required().messages({
        'any required':'Password is required',
        'string.empty':'Password cannot be Empty'
        }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next();
};


exports.resetPasswordValidator = async (req, res, next) => {
    const schema = joi.object({
        email: joi.string().trim().email().required().messages({
            'string.email': 'Please enter a valid email',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
        otp: joi.string().trim().length(6).required().messages({
            'string.empty': 'OTP is required',
            'string.length': 'OTP must be 6 characters long',
            'any.required': 'OTP is required'
        }),
        newPassword: joi.string().trim().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
        'any.required':'Password is required',
        'string.empty':'Password cannot be Empty',
        'string.pattern.base':'Password must be 8 characters and include upper and lower case'
        }),
        confirmPassword:joi.string().trim().required().valid(joi.ref('newPassword')).messages({
                'any.only':'Confirm password must match new password',
                'any.required':'Confirm password is required'
            })
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
exports.changePasswordValidator = (req,res,next)=>{
    const schema = joi.object({
        currentPassword:joi.string().trim().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
                'any.required': 'Current password is required',
                'string.empty': 'Current password cannot be empty',
               'string.pattern.base': 'Current password must be at least 8 characters and include 1 uppercase and 1 lowercase'
            }),
             newPassword: joi.string().trim().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
                'any.required': 'New password is required',
                'string.empty': 'New password cannot be empty',
               'string.pattern.base': 'New password must be at least 8 characters and include 1 uppercase and 1 lowercase'
            }),
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
};

exports.updateValidation = (req,res,next)=>{
    const schema = joi.object({
        firstName: joi.string().trim().pattern(/^[a-zA-Z\s]{3,}$/).required().messages({
            'string.base': 'Firstname must be a string',
            'string.empty': 'Firstname is required',
            'string.min': 'Firstname must be at least 4 characters long',
            'any.required': 'Firstname is required',
            'string.pattern.base': 'First name cannot contain digits and must be a minimum of 3 characters'
        }),
        lastName: joi.string().trim().pattern(/^[a-zA-Z\s]{3,}$/).required().messages({
            'string.base': 'Lastname must be a string',
            'string.empty': 'Lastname is required',
            'string.min': 'Lastname must be at least 4 characters long',
            'any.required': 'Lastname is required',
            'string.pattern.base': 'School name cannot contain digits and must be a minimum of 3 characters'
        }),
        phoneNumber: joi.string().trim().pattern(/^[0-9]{10}$/).required().messages({
            'string.empty': 'Phone number cannot be empty',
            'any.required': 'Phone number is required',
            'string.pattern.base': 'Phone number must contain only 10 digit numbers'
        }),
        address: joi.string().trim().min(5).max(255).required().messages({
      "string.base": "Address must be a string",
      "string.empty": "Address is required",
      "string.min": "Address must be at least 5 characters long",
      "string.max": "Address cannot exceed 255 characters",
      "any.required": "Address is required"
    }),
    image: joi.string().messages({
    "string.base": "Image must be a string.",
    "any.required": "Image is required."
  }),
    estimatedDueDate: joi.date()
    .min("now")
    .required()
    .messages({
        "date.base": "Estimated due date must be a valid date.",
        "date.min": "Estimated due date cannot be in the past.",
        "any.required": "Estimated due date is required."
    }),
    
    dateOfBirth: joi.date().less('now').required().messages({
    "date.base": "Date of birth must be a valid date.",
    "date.less": "Date of birth must be in the past.",
    "any.required": "Date of birth is required."
  }),
    
    trimester: joi.number().integer().valid(1, 2, 3).required().messages({
    "number.base": "Trimester must be a number.",
    "any.only": "Trimester must be 1, 2, or 3.",
    "any.required": "Trimester is required."
  }),
    bloodType: joi.string().trim().uppercase().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").required().messages({
      "any.only":
        "Blood type must be one of A+, A-, B+, B-, AB+, AB-, O+, or O-",
      "string.empty": "Blood type is required",
      "any.required": "Blood type is required"
    }),
    existingHealthConditions: joi.string().trim().min(2).max(255).required().messages({
    "string.base": "Existing health conditions must be a string.",
    "string.empty": "Existing health conditions cannot be empty.",
    "string.min": "Existing health conditions must be at least 2 characters long.",
    "string.max": "Existing health conditions cannot exceed 255 characters.",
    "any.required": "Existing health conditions is required."
  }),
    currentPregnancyWeek: joi.number().integer().min(1).max(42).required().messages({
    "number.base": "Current pregnancy week must be a number.",
    "number.integer": "Current pregnancy week must be a whole number.",
    "number.min": "Current pregnancy week must be at least 1.",
    "number.max": "Current pregnancy week cannot be more than 42.",
    "any.required": "Current pregnancy week is required."
  }),
    emergencyContactName: joi.string().trim().min(2).max(100).pattern(/^[A-Za-z\s]+$/).required().messages({
      "string.base": "Emergency contact name must be a string.",
      "string.empty": "Emergency contact name is required.",
      "string.min": "Emergency contact name must be at least 2 characters.",
      "string.max": "Emergency contact name cannot exceed 100 characters.",
      "string.pattern.base": "Emergency contact name should contain only letters and spaces.",
      "any.required": "Emergency contact name is required."
    }),

  emergencyContactNumber: joi.string().trim().pattern(/^\+?[0-9]{10,15}$/).required().messages({
      "string.base": "Emergency contact phone number must be a string.",
      "string.empty": "Emergency contact phone number is required.",
      "string.pattern.base": "Emergency contact phone number must be between 10 and 15 digits and may start with '+'.",
      "any.required": "Emergency contact phone number is required."
    }),

    allergies: joi.string().trim().min(2).max(255).required().messages({
    "string.base": "Allergies must be a string.",
    "string.empty": "Allergies cannot be empty.",
    "string.min": "Allergies must be at least 2 characters long.",
    "string.max": "Allergies cannot exceed 255 characters.",
    "any.required": "Allergies is required."
  }),
  savingsGoalAmount: joi.number().positive().required().messages({
    "number.base": "Savings goal amount must be a number.",
    "number.positive": "Savings goal amount must be greater than 0.",
    "any.required": "Savings goal amount is required."
  }),

weeklyContribution: joi.number().positive().required().messages({
    "number.base": "Weekly contribution must be a number.",
    "number.positive": "Weekly contribution must be greater than 0.",
    "any.required": "Weekly contribution is required."
  }),

  hospitalId: joi.string().guid({version: ['uuidv4', 'uuidv5']}).required().messages({
    "string.base": "Hospital ID must be a string.",
    "string.empty": "Hospital ID is required.",
    "string.guid": "Hospital ID must be a valid UUID.",
    "any.required": "Hospital ID is required."
  }),

linkedPaymentMethod: joi.string().valid("card", "bank", "wallet", "ussd", "transfer").required().messages({
    "string.base": "Linked payment method must be a string.",
    "any.only": "Payment method must be card, bank, wallet, transfer, or ussd.",
    "any.required": "Linked payment method is required."
  }),
    })
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}


