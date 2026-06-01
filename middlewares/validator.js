const joi = require('joi');

exports.registerValidator = async (req, res, next) => {
    const schema = joi.object({
        firstName: joi.string().trim().min(2).required().messages({
            'string.base': 'Firstname must be a string',
            'string.empty': 'Firstname is required',
            'string.min': 'Firstname must be at least 2 characters long',
            'any.required': 'Firstname is required'
        }),
        lastName: joi.string().trim().min(2).required().messages({
            'string.base': 'Lastname must be a string',
            'string.empty': 'Lastname is required'
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
        confirmPassword: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
        'any required':'confirm Password is required',
        'string.empty':'confirm Password cannot be Empty',
        'string.pattern.base':'confirm Password must be 8 chracters must include upper and lower case'
        }),
        phoneNumber: joi.string().trim().required().messages({
            'string.empty': 'Phone number cannot be empty',
            'any.required': 'Phone number is required'
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
        currentPassword:joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
                'any.required': 'Current password is required',
                'string.empty': 'Current Password cannot be empty',
               'string.pattern.base': 'Current Password must be at least 8 characters and must Include 1 uppercase and 1 lowercase'
            }),
             newPassword: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
                'any.required': 'new Password is required',
                'string.empty': 'new Password cannot be empty',
               'string.pattern.base': 'new Password must be at least 8 characters and must Include 1 uppercase and 1 lowercase'
            }),
            confirmPassword:joi.string().required().valid(joi.ref('newPassword')).messages({
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
    
