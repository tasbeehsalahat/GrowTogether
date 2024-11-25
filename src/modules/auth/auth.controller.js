const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const {signupSchema,workerSignupSchema,loginSchema,validateProfileUpdate} = require('../valdition/vald.js');
const {Owner,Worker,Token} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000); // توليد رقم عشوائي مكون من 6 أرقام
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tasbeehsa80@gmail.com', // بريدك الإلكتروني
        pass: 'yeaf tcnf prlj kzlj'  // كلمة المرور (يفضل استخدام كلمات مرور التطبيقات App Passwords)
    }
});

let verificationCodes = {};
const CODE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 دقائق

const sendconfirm= async (req, res) => {
    const { email} = req.body;

    const verificationCode = generateRandomCode() ;
    // تخزين الكود مع تاريخ الانتهاء
    const expirationTime = Date.now() + CODE_EXPIRATION_TIME;
    verificationCodes[email] = { code: verificationCode, expiresAt: expirationTime };

    const mailOptions = {
        from: 'tasbeehsa@gmail.com', // المرسل
        to: email,                   // المستلم
        subject: 'VerificationCode from GROW TOGETHER',
        text: `Your VerificationCode ${verificationCode}`

       
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({   "message": "Verification code has been sent to the email."
        });
        
        setTimeout(() => {
            delete verificationCodes[email];
        }, CODE_EXPIRATION_TIME);
    } catch (error) {
        console.error(error);
        res.status(500).json({"message": "An error occurred while sending the email."});
    }
};

const getconfirm = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({  "message": "Please provide both email and code." });
    }
    const storedCode = verificationCodes[email];

    if (!storedCode) {
        return res.status(400).json({  "message": "The code is either not found or has already been used." });
    }

    // التحقق من انتهاء صلاحية الكود
    if (Date.now() > storedCode.expiresAt) {
        delete verificationCodes[email]; // حذف الكود بعد انتهاء صلاحيته
        return res.status(400).json({  "message": "The code has expired." });
    }  if (parseInt(code) === storedCode.code) {
        return res.status(200).json({  "message": "Verification successful!" });
    } else {
        return res.status(400).json({ "message": "The code is incorrect."});
    }
};



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
        // التحقق من صحة البيانات المدخلة
        const { error } = loginSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({ message: 'Validation error', errors: errorMessages });
        }

        const { email, password } = req.body;
        let user = await Owner.findOne({ email });

        if (!user) {
            user = await Worker.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        const payload = { email: req.body.email, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '5h' });  // إنشاء التوكن
        localStorage.setItem("authToken", token);

        const role = user instanceof Owner ? 'Owner' : 'Worker';
        console.log("User role:", role);
        const existingToken = await Token.findOne({ email });
        console.log("Authenticated user:", role);

        if (existingToken) {
            existingToken.token = token;
            existingToken.role = role;  // التأكد من أن الدور يتم تحديثه في حال تغييره
            await existingToken.save();
        } else {
            const newToken = new Token({ email, token, role });
            await newToken.save();
        }

        const userName = user.userName || user.ownerName;
        const welcomeMessage = role === 'Worker' ? `Hello, ${userName}! Welcome to the Worker page.` : `Hello, ${userName}! Welcome to the Owner page.`;

        return res.status(200).json({
            message: 'Login successful!',
            token, 
            role,
            welcomeMessage // لة 
           
        });

    } catch (error) {
        console.error("errorrrrr", error);

        if (error.code === 11000) {
            return res.status(409).json({ message: 'sorry,this email is already exist' });
        }

        return res.status(500).json({ message: 'Error adding worker' });
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

const logout = async (req, res) => {
    try {
        const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. No token provided.' });
        }

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
const myprofile = async (req, res) => {
    try {
        // الحصول على التوكن من الهيدر
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'Authorization token is required. Please login again.' });
        }
           // التحقق مما إذا كان التوكن موجودًا في جدول التوكن
           const tokenExists = await Token.findOne({ token: token });
           if (!tokenExists) {
               return res.status(401).json({ message: 'You have logged out. Please login again.' });
           }

        let decodedToken;
        try {
            // التحقق من صحة التوكن
            decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        } catch (err) {
            // التحقق إذا كان الخطأ بسبب انتهاء صلاحية التوكن
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token has expired. Please login again.' });
            }
            // التحقق إذا كان الخطأ بسبب توكن غير صالح
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token. Please login again.' });
            }
            // أي أخطاء أخرى
            return res.status(401).json({ message: 'Authentication failed. Please login again.' });
        }

        // استخراج الإيميل من التوكن
        const email = decodedToken.email;

        if (!email) {
            return res.status(400).json({ message: 'Email not found in token' });
        }

        // البحث عن المستخدم في قاعدة البيانات
        let user = await Worker.findOne({ email }) || await Owner.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // إعداد بيانات البروفايل
        const userProfile = {
            email: user.email,
            username: user.username || user.ownerName,
            role: user instanceof Worker ? 'worker' : 'owner',
            ...(user.skills && user.skills.length > 0 ? { skills: user.skills } : {}),
            contactNumber: user.contactNumber || null,
        };

        return res.status(200).json({ profile: userProfile });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const deleteAccount = async (req, res) => {
    const email = req.params.email;
    const result = await User.deleteOne({ email });
    if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'Account deleted successfully.' });
};
const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { email } = req.params; // الحصول على الإيميل من الرابط

        // التأكد من أن التوكن صالح وأنه يخص الإيميل المرسل
        if (req.user.email !== email) {
            return res.status(403).json({ message: 'Unauthorized. Token does not match the provided email.' });
        }

        // البحث عن المستخدم بواسطة البريد الإلكتروني
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // التحقق من كلمة المرور القديمة
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // تحديث كلمة المرور
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const forgotPassword = async (req, res) => {
    const { email} = req.body;

    const verificationCode = generateRandomCode() ;
    // تخزين الكود مع تاريخ الانتهاء
    const expirationTime = Date.now() + CODE_EXPIRATION_TIME;
    verificationCodes[email] = { code: verificationCode, expiresAt: expirationTime };

    const mailOptions = {
        from: 'tasbeehsa@gmail.com', // المرسل
        to: email,                   // المستلم
        subject: 'VerificationCode from GROW TOGETHER',
        text: `Your VerificationCode for reset password ${verificationCode}`

       
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({   "message": "Verification code has been sent to the email."
        });
        
        setTimeout(() => {
            delete verificationCodes[email];
        }, CODE_EXPIRATION_TIME);
    } catch (error) {
        console.error(error);
        res.status(500).json({"message": "An error occurred while sending the email."});
    }
};
const verifyResetCode = async (req, res) => {
  
    const { email, resetcode } = req.body;

    if (!email || !resetcode) {
        return res.status(400).json({  "message": "Please provide both email and code." });
    }
    const storedCode = verificationCodes[email];

    if (!storedCode) {
        return res.status(400).json({  "message": "The code is either not found or has already been used." });
    }

    // التحقق من انتهاء صلاحية الكود
    if (Date.now() > storedCode.expiresAt) {
        delete verificationCodes[email]; // حذف الكود بعد انتهاء صلاحيته
        return res.status(400).json({  "message": "The code has expired." });
    }  if (parseInt(resetcode) === storedCode.code) {
        return res.status(200).json({  "message": "Verification successful!" });
    } else {
        return res.status(400).json({ "message": "The code is incorrect."});
    }
};
const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // البحث عن المستخدم سواء كان في نموذج Worker أو LandOwner
        let user = await Worker.findOne({ email });
        if (!user) {
            user = await LandOwner.findOne({ email });
        }

        // إذا لم يتم العثور على المستخدم في كلا النموذجين
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        // التحقق من قوة كلمة المرور الجديدة
        const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordStrengthRegex.test(newPassword)) {
            return res.status(400).json({
                message: 'Password is weak. Please make sure it contains at least 8 characters, including upper/lowercase letters, a number, and a special character.'
            });
        }

        // تحديث كلمة المرور
        user.password = await bcrypt.hash(newPassword, 10);

        // إزالة كود التحقق بعد التحديث
        user.resetPasswordCode = null;
        user.resetPasswordExpires = null;
        await user.save();

        // الاستجابة بنجاح
        return res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Error in resetting password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const deactivationaccount = async (req, res) => {
    const token = req.header('authorization'); // استخراج التوكن من الهيدر

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        // فك تشفير التوكن
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        // تحقق من نوع الحساب (Owner أو Worker)
        if (role === 'Owner') {
            // تعطيل حساب المالك
            const owner = await Owner.findOneAndUpdate(
                { email },
                { Status: 'inactive' },
                { new: true } // لإرجاع المستند بعد التحديث
            );

            if (!owner) {
                return res.status(404).json({ message: 'Owner not found.' });
            }

            return res.status(200).json({
                message: 'Owner account has been deactivated successfully.',
                owner: owner
            });
        } else if (role === 'Worker') {
            // تعطيل حساب العامل
            const worker = await Worker.findOneAndUpdate(
                { email },
                { Status: 'inactive' },
                { new: true } // لإرجاع المستند بعد التحديث
            );

            if (!worker) {
                return res.status(404).json({ message: 'Worker not found.' });
            }

            return res.status(200).json({
                message: 'Worker account has been deactivated successfully.',
                worker: worker
            });
        } else {
            return res.status(403).json({ message: 'Invalid role.' });
        }

    } catch (error) {
        console.error('Error deactivating account:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


module.exports = {verifyResetCode,resetPassword, login, deactivationaccount,
    signupowner,signupWorker,profile,logout,sendconfirm,
    getconfirm,myprofile,deleteAccount,updatePassword,forgotPassword};
