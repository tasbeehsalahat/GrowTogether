const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dns = require('dns');
const signupSchema = require('../valdition/vald.js');
const Owner = require('../DB/types.js');  // تأكد من أن المسار صحيح

const signup = async (req, res) => {
     const { error } = signupSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: 'Validation error', errors: errorMessages });
    }

    const { email, password, confirmpassword, landArea, location, ownerName, contactNumber, description, suggestion } = req.body;

    if (password !== confirmpassword) {
        return res.status(400).json({ message: 'Password and confirm password do not match' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newOwner = new Owner({
            email: email,
            password: hashedPassword,  // استخدام كلمة المرور المشفرة
            landArea: landArea,
            location: location,
            ownerName: ownerName,
            contactNumber: contactNumber,
            description: description,
            suggestion: suggestion || "", // حقل اختياري
            image: ""  // إذا كان هناك صورة، يمكنك إضافتها لاحقًا
        });

        await newOwner.save();
        console.log("تمت إضافة المالك بنجاح");
        
        return res.status(201).json({ message: 'Owner added successfully' });

    } catch (error) {
        console.error("حدث خطأ أثناء إضافة المالك:", error);
        return res.status(500).json({ message: 'Error adding owner' });
    }
};


const login = async (req,res) =>{

    
}

module.exports = { login, signup};
