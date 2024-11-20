// valdition/vald.js
const Joi = require('joi');

const signupSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.base': `"Email" should be of type 'text'`,
        'string.empty': `"Email" cannot be an empty field`,
        'string.email': `"Email" must be a valid email address`,
        'any.required': `"Email" is a required field`
    }),
    password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
    .required()
    .messages({
        'string.empty': `"Password" cannot be empty`,
        'string.min': `"Password" should have at least 8 characters`,
        'string.pattern.base': `"Password" must contain at least one uppercase letter, one lowercase letter, one number, and one special character`,
        'any.required': `"Password" is a required field`
    }),

    confirmpassword: Joi.any().equal(Joi.ref('password')).required().messages({
        'any.only': `"Confirm Password" must match the password`,
        'any.required': `"Confirm Password" is a required field`
    }),
    ownerName: Joi.string().min(3).max(50).required().messages({
        'string.empty': `"Name" cannot be empty`,
        'string.min': `"Name" should have at least 3 characters`,
        'string.max': `"Name" cannot exceed 50 characters`,
        'any.required': `"Name" is a required field`
    }),
    contactNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
        'string.empty': `"Contact Number" cannot be empty`,
        'string.pattern.base': `"Contact Number" should contain only numbers and be between 10 and 15 digits`,
        'any.required': `"Contact Number" is a required field`
    })
});

const workerSignupSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': `"Email" must be a valid email address`,
        'any.required': `"Email" is a required field`
    }),
    password: Joi.string().min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
        .required().messages({
            'string.min': `"Password" should have at least 8 characters`,
            'string.pattern.base': `"Password" must contain at least one uppercase letter, one lowercase letter, one number, and one special character`,
            'any.required': `"Password" is a required field`
        }),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
        'any.only': `"Confirm Password" must match the password`,
        'any.required': `"Confirm Password" is a required field`
    }),
    userName: Joi.string().min(3).max(50).required().messages({
        'string.min': `"User Name" should have at least 3 characters`,
        'any.required': `"User Name" is a required field`
    }),
    skills: Joi.array().items(
        Joi.string().min(1).required().messages({
            'string.min': `"Skill" cannot be empty`,
            'any.required': `"Skill" is required`
        })
    ).min(1).required().messages({
        'array.min': `"Skills" must include at least one skill`,
        'any.required': `"Skills" is a required field`
    }),
    contactNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
        'string.empty': `"Contact Number" cannot be empty`,
        'string.pattern.base': `"Contact Number" should contain only numbers and be between 10 and 15 digits`,
        'any.required': `"Contact Number" is a required field`
    })

});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': `"Email" must be a valid email address`,
        'any.required': `"Email" is a required field`
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': `"Password" should have at least 8 characters`,
        'any.required': `"Password" is a required field`
    }),
});


module.exports = {signupSchema,workerSignupSchema,loginSchema};
