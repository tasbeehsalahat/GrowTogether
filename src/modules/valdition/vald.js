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
const allowedSkills = [
    'خبرة في الحراثة', 
    'خبرة بالآلات الزراعية', 
    'مزارع', 
    'خبرة في الزراعة', 
    'خبرة في زراعة المحاصيل', 
    'تقني ري', 
    'خبرة في أنظمة الري', 
    'عامل حصاد', 
    'خبرة في جمع المحاصيل', 
    'خبرة في التسميد', 
    'تقني تسميد', 
    'خبير مكافحة آفات', 
    'خبرة في مكافحة الحشرات', 
    'خبرة في استخدام المبيدات', 
    'خبرة في تسوية الأرض', 
    'متخصص في تجهيز الأراضي', 
    'عامل إزالة الأعشاب', 
    'خبرة في المكافحة', 
    'خبرة في المعدات الزراعية', 
    'تقني محميات زراعية', 
    'خبرة في البيوت البلاستيكية', 
    'عامل نقل', 
    'خبرة في شحن المحاصيل'
];
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
        Joi.string().valid(...allowedSkills).required().messages({
            'any.only': `"Skill" must be one of the allowed skills`,
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
    }), 
     isGuarantor: Joi.boolean().optional().messages({
        'boolean.base': `"Is Guarantor" must be a boolean value`
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

const validateProfileUpdate = (userData, role) => {
    let schema;
    if (role === 'Owner') {
        schema = Joi.object({
            email: Joi.string().email().optional().messages({
                'string.email': `"Email" must be a valid email address`
            }),
            username: Joi.string().min(3).optional().messages({
                'string.min': `"Username" should have at least 3 characters`
            }),
            contactNumber: Joi.string().min(10).max(15).optional().messages({
                'string.min': `"Contact Number" should have at least 10 characters`,
                'string.max': `"Contact Number" can have a maximum of 15 characters`
            }),
            password: Joi.string()
                .min(8)
                .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
                .optional()
                .messages({
                    'string.min': `"Password" should have at least 8 characters`,
                    'string.pattern.base': `"Password" must contain at least one uppercase letter, one lowercase letter, one number, and one special character`
                }),
            confirmpassword: Joi.any().valid(Joi.ref('password')).optional().messages({
                'any.only': `"Confirm Password" must match the password`
            }),
            ownerName: Joi.string().min(3).max(50).optional().messages({
                'string.min': `"Owner Name" should have at least 3 characters`,
                'string.max': `"Owner Name" should have at most 50 characters`
            }),
        });
    } 
     if (role === 'Worker') {
        schema = Joi.object({
            email: Joi.string().email().optional().messages({
                'string.email': `"Email" must be a valid email address`
            }),
            password: Joi.string()
                .min(8)
                .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
                .optional()
                .messages({
                    'string.min': `"Password" should have at least 8 characters`,
                    'string.pattern.base': `"Password" must contain at least one uppercase letter, one lowercase letter, one number, and one special character`
                }),
            confirmPassword: Joi.any().valid(Joi.ref('password')).optional().messages({
                'any.only': `"Confirm Password" must match the password`
            }),
            userName: Joi.string().min(3).max(50).optional().messages({
                'string.min': `"User Name" should have at least 3 characters`,
                'string.max': `"User Name" should have at most 50 characters`
            }),
            skills: Joi.array().items(
                Joi.string().min(1).optional().messages({
                    'string.min': `"Skill" cannot be empty`
                })
            ).min(1).optional().messages({
                'array.min': `"Skills" must include at least one skill`
            }),
            contactNumber: Joi.string().pattern(/^[0-9]{10,15}$/).optional().messages({
                'string.pattern.base': `"Contact Number" should contain only numbers and be between 10 and 15 digits`
            }),
        });
    } else {
        console.log('dkfkv,m');
        return { error: 'Invalid role' }; 
    }
    const { error, value } = schema.validate(userData, { abortEarly: false });
    if (error) {
        return { error: error.details.map(err => err.message).join(", ") };
    }

    return { value };
};
const land = (data) => {
    const schema = Joi.object({
        landName: Joi.string()
            .min(3)
            .max(100)
            .optional()
            .messages({
                'string.base': 'Land name must be a string.',
                'string.min': 'Land name must be at least 3 characters long.',
                'string.max': 'Land name cannot exceed 100 characters.',
            }),
        workType: Joi.string()
            .valid('Agricultural', 'Commercial', 'Residential', 'Guarantee')
            .required()
            .messages({
                'any.only': 'Work type must be one of Agricultural, Commercial, Guarantee, or Residential.',
                'any.required': 'Work type is required.',
            }),
        description: Joi.string()
            .max(500)
            .optional()
            .messages({
                'string.base': 'Description must be a string.',
                'string.max': 'Description cannot exceed 500 characters.',
            }),
        village: Joi.string()
            .optional()
            .messages({
                'string.base': 'Village must be a string.',
            }),
        area: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Area must be a number.',
                'number.positive': 'Area must be a positive number.',
                'any.required': 'Area is required.',
            }), 
             SpecificArea: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Area must be a number.',
                'number.positive': 'Area must be a positive number.',
                'any.required': 'Area is required.',
            }),
        coordinates: Joi.object({
            lat: Joi.number()
                .required()
                .messages({
                    'number.base': 'Latitude must be a number.',
                    'any.required': 'Latitude is required.',
                }),
            lng: Joi.number()
                .required()
                .messages({
                    'number.base': 'Longitude must be a number.',
                    'any.required': 'Longitude is required.',
                }),
        }).optional(),
        images: Joi.array()
            .items(Joi.string().uri())
            .optional()
            .messages({
                'array.base': 'Images must be an array of URLs.',
                'string.uri': 'Each image must be a valid URL.',
            }),
    });

    return schema.validate(data, { abortEarly: false });
};

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// تعريف الـ Schema لحساب الشركة


module.exports = {signupSchema,workerSignupSchema,loginSchema,validateProfileUpdate,land};
