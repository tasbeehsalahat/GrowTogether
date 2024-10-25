// valdition/vald.js
const Joi = require('joi');

const signupSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.base': `"Email" should be a type of 'text'`,
        'string.empty': `"Email" cannot be an empty field`,
        'string.email': `"Email" must be a valid email`,
        'any.required': `"Email" is a required field`
    }),
    password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()_+={}:;"\'<>?,./`~]).{8,30}$')) // نمط كلمة المرور الجديد
    .required()
    .messages({
        'string.base': `"Password" should be a type of 'text'`,
        'string.empty': `"Password" cannot be an empty field`,
        'string.min': `"Password" should have a minimum length of {#limit}`,
        'string.pattern.base': `"Password" must contain at least one letter, one number, and one special character.`,
        'any.required': `"Password" is a required field`
    }),
    landArea: Joi.number().required().messages({
        'number.base': `"Land Area" must be a number`,
        'any.required': `"Land Area" is a required field`
    }),
    location: Joi.string().required().messages({
        'string.base': `"Location" should be a type of 'text'`,
        'string.empty': `"Location" cannot be an empty field`,
        'any.required': `"Location" is a required field`
    }),
    ownerName: Joi.string().required().messages({
        'string.base': `"Owner Name" should be a type of 'text'`,
        'string.empty': `"Owner Name" cannot be an empty field`,
        'any.required': `"Owner Name" is a required field`
    }),
    contactNumber: Joi.string().required().messages({
        'string.base': `"Contact Number" should be a type of 'text'`,
        'string.empty': `"Contact Number" cannot be an empty field`,
        'any.required': `"Contact Number" is a required field`
    }),
    landType: Joi.string().required().messages({
        'string.base': `"Land Type" should be a type of 'text'`,
        'string.empty': `"Land Type" cannot be an empty field`,
        'any.required': `"Land Type" is a required field`
    }),
    soilType: Joi.string().required().messages({
        'string.base': `"Soil Type" should be a type of 'text'`,
        'string.empty': `"Soil Type" cannot be an empty field`,
        'any.required': `"Soil Type" is a required field`
    }),
});

module.exports = signupSchema;
