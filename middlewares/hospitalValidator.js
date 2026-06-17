const joi = require('joi');

exports.hospitalRegisterValidator = async (req, res, next) => {
    const schema = joi.object({
        hospitalName: joi.string().trim().min(5).required().messages({
            'string.base': 'Hospital name must be a string',
            'string.empty': 'Hospital name is required',
            'string.min': 'Hospital name must be at least 5 characters long',
            'any.required': 'Hospital name is required'
        }),
        email: joi.string().trim().email().required().messages({
            'string.email': 'Please enter a valid email',
            'any.required': 'Email is required',
            'string.empty': 'Email is required'
        }),
        password: joi.string().trim().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': 'Password is required',
            'string.empty': 'Password cannot be empty',
            'string.pattern.base': 'Password must be at least 8 characters and include upper and lower case'
        }),
        confirmPassword: joi.string().trim().required().valid(joi.ref('password')).messages({
            'any.only': 'Confirm password must match password',
            'any.required': 'Confirm password is required',
            'string.empty': 'Confirm password cannot be empty'
        }),
        phoneNumber: joi.string().trim().pattern(/^[0-9]{10,15}$/).required().messages({
            'string.empty': 'Phone number cannot be empty',
            'string.pattern.base': 'Phone number must contain only digits and be 10 to 15 characters long',
            'any.required': 'Phone number is required'
        }),
        address: joi.string().trim().min(5).required().messages({
            'string.base': 'Address must be a string',
            'string.empty': 'Address is required',
            'string.min': 'Address must be at least 5 characters long',
            'any.required': 'Address is required'
        }),
        deliveryFee: joi.string().trim().pattern(/^[0-9]{5,15}$/).required().messages({
            'string.base': 'Delivery fee must be a string',
            'string.empty': 'Delivery fee is required',
            'string.pattern.base': 'Delivery fee must contain only digits and be 5 to 15 characters long',
            'any.required': 'Delivery fee is required'
        }),
        medicalLicenseNumber: joi.string().trim().pattern(/^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]+$/).required().messages({
            'string.base': 'Medical license number must be a string',
            'string.empty': 'Medical license number is required',
            'string.pattern.base': 'Medical license number must contain only letters and numbers, e.g. MED000123456',
            'any.required': 'Medical license number is required'
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

exports.hospitalLoginValidator = async (req, res, next) => {
    const schema = joi.object({
        emailOrPhoneNumber: joi.string().trim().required().messages({
            'any.required': 'Email or phone number is required',
            'string.empty': 'Email or phone number cannot be empty'
        }),
        password: joi.string().trim().required().messages({
            'any.required': 'Password is required',
            'string.empty': 'Password cannot be empty'
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

exports.changePasswordValidator = (req, res, next) => {
    const schema = joi.object({
        currentPassword: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': "Old password is required",
            "string.empty": "Old password cannot be empty",
            'string.pattern.base': "Old password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
        }),
        newPassword: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': "New password is required",
            "string.empty": "New password cannot be empty",
            'string.pattern.base': "New password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
        }),
       
    })

    const { error } = schema.validate(req.body);
    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next() 
}

// const { body, query, validationResult } = require('express-validator');

exports.validateSearchMother = async (req, res, next) => {
    const schema = joi.object({
        search: joi.string().trim().required().messages({
            'any.required': 'Search query parameter is required',
            'string.empty': 'Search query parameter cannot be empty'
        }),
          emailOrPhoneNumber: joi.string().trim().required().messages({
            'any.required': 'Email or phone number is required',
            'string.empty': 'Email or phone number cannot be empty'
        })

    });

    const { error } = schema.validate(req.query);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next();
};


// exports.updateHospitalProfileValidator = (req, res, next) => {
//     const schema = joi.object({
//         hospitalName: joi.string().trim().min(2).messages({
//             'string.base': 'Hospital name must be a string',
//             'string.min': 'Hospital name must be at least 2 characters long'
//         }),
//         phoneNumber: joi.string().trim().pattern(/^[0-9]{10,15}$/).messages({
//             'string.pattern.base': 'Phone number must contain only digits and be 10 to 15 characters long'
//         }),
//         adminFullName: joi.string().trim().min(5).messages({
//             'string.base': 'Admin full name must be a string',
//             'string.min': 'Admin full name must be at least 5 characters long'
//         }),
//         deliveryFee: joi.string().trim().messages({
//             'string.base': 'Delivery fee must be a string'
//         }),
//         medicalLicenseNumber: joi.string().trim().messages({
//             'string.base': 'Medical license number must be a string'
//         })
//     });

//     const { error } = schema.validate(req.body, { allowUnknown: true });
//     if (error) {
//         return res.status(400).json({
//             message: error.details[0].message
//         });
//     }

//     next();
// }
