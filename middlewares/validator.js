const joi = require('joi');

exports.registerValidator = async (req, res, next) => {
    const schema = joi.object({
        firstName: joi.string().trim().pattern(/^[a-zA-Z\s]{3,}$/).required().messages({
            'string.base': 'Firstname must be a string',
            'string.empty': 'Firstname is required',
            'string.min': 'Firstname must be at least 4 characters long',
            'any.required': 'Firstname is required',
            'string.pattern.base': 'School name cannot contain digits and must be a minimum of 3 characters'
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
}


