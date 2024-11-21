

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const {signupSchema,workerSignupSchema,loginSchema,validateProfileUpdate} = require('../valdition/vald.js');
const {Owner,Worker,Token} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const {validation}=require('../valdition/vald.js');
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن

const signupowner= async (req, res) => {
    const { error } = signupSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: 'Validation error', errors: errorMessages });
    }

    const { email, password, confirmpassword, ownerName, contactNumber } = req.body;

    if (password !== confirmpassword) {
        return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newOwner = new Owner({
            email,
            password: hashedPassword,
            ownerName,
            contactNumber,
           
        });

        // Save the new owner to the database
        await newOwner.save();
        console.log("done");
       
        return res.status(201).json({ message: 'Owner added successfully' });

    } catch (error) {
        console.error("errorrrrr", error);

        if (error.code === 11000) {
            return res.status(409).json({ message: 'sorry,this email is already exist' });
        }

        return res.status(500).json({ message: 'Error adding owner' });
    }
};

const signupWorker = async (req, res) => {
    const { error } = workerSignupSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: 'Validation error', errors: errorMessages });
    }

    const { email, password, confirmPassword, userName ,skills,contactNumber} = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new Worker document
        const newWorker = new Worker({
            email,
            password: hashedPassword,  // Use hashed password
            userName,
            skills,
            contactNumber
        });
        await newWorker.save();
        console.log("Worker added successfully");
       
        return res.status(201).json({ message: 'Worker added successfully' });

    } catch (error) {
        console.error("Error adding worker:", error);

        // Check for duplicate email error
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // General error handling
        return res.status(500).json({ message: 'Error adding worker' });
    }
};

const login = async (req, res) => {
    try {
        // التحقق من المدخلات باستخدام Joi
        const { error } = loginSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({ message: 'Validation error', errors: errorMessages });
        }

        const { email, password } = req.body;

        let user = await Owner.findOne({ email });

        // إذا لم يتم العثور عليه في جدول Owners، تحقق في جدول Workers
        if (!user) {
            user = await Worker.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // التحقق من صحة كلمة المرور
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }
        // const token = jwt.sign({ id: user._id, email: user.email }, 'secretKey', { expiresIn: '1h' });
        const payload = { email: req.body.email }; // البيانات التي تريد تضمينها في التوكن
const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1h' }); // انشئ التوكن هنا

 const existingToken = await Token.findOne({ email });  // Check if the token already exists for the user
 if (existingToken) {
     existingToken.token = token;  // Update the token if it already exists
     await existingToken.save();
 } else {
     const newToken = new Token({ email, token });
     await newToken.save();
 }
        const userName = user.userName || user.ownerName;  // إذا كان عامل نأخذ userName، وإذا كان صاحب نأخذ ownerName
        const role = user instanceof Owner ? 'owner' : 'worker'; // تحديد الدور

        const welcomeMessage = role === 'worker' 
    ? `Hello, ${userName}! Welcome to the Worker page.` : `Hello, ${userName}! Welcome to the Owner page.`;

        return res.status(200).json({
            message: 'Login successful',
            token,
            welcomeMessage,  // إضافة رسالة الترحيب
           
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: 'Error logging in' });
    }
};


const profile = async (req, res) => {
    try {
        const { email, username } = req.query;  // Extract email or userName from query parameters

        if (!email && !username) {
            return res.status(400).json({ message: 'Email or username is required' });
        }

        let user = null;

        if (email) {
            user = await Worker.findOne({ email }) || await Owner.findOne({ email });
        } else if (username) {
            user = await Worker.findOne({ username }) || await Owner.findOne({ ownerName });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userProfile = {
            email: user.email,
            username: user.userName || user.ownerName,
            role: user instanceof Worker ? 'worker' : 'owner',
            ...(user.skills && user.skills.length > 0 ? { skills: user.skills } : {}), // تضمين skills فقط إذا كانت موجودة
            contactNumber: user.contactNumber || null, // Only for owners
            // Add any additional fields as needed
        };

        return res.status(200).json({ profile: userProfile });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const updateprofile = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Please enter what you want to update' });
        }

        const updates = req.body; // بيانات التحديث من البودي
        let email = req.params.email; // الإيميل من الرابط
        email = email.replace(":", ""); // إزالة أي نقاط في الإيميل إذا كانت موجودة في الرابط

        if (req.user.email !== email) {
            return res.status(403).json({ message: 'You can only update your own profile.' });
        }
        console.log(req.user.email);

        const Model = req.user.role === 'Worker' ? Worker : Owner;

        const validation = validateProfileUpdate(updates, Model); // استدعاء الدالة بشكل صحيح
        if (validation.error) {
            return res.status(400).json({ message: validation.error });
        }

        const updatedProfile = validation.value;

        const updatedUser = await Model.findOneAndUpdate(
            { email },
            { $set: updatedProfile },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({
            message: 'Profile updated successfully.',
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const logout = async (req, res) => {
    try {
        // Extract the token from the Authorization header
        const token = req.header('Authorization'); // Ensure only the token is extracted
        
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. No token provided.' });
        }

        // Remove the token from the MongoDB collection
        const result = await Token.deleteOne({ token: token });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Token not found or already logged out.' });
        }

        return res.status(200).json({
            message: "Logout successful...See you soon!"
        });
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).json({ error: 'An error occurred while logging out.' });
    }
};
module.exports = { login, signupowner,signupWorker,profile,updateprofile,logout};
