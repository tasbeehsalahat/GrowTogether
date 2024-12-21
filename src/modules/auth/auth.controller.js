const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const {signupSchema,workerSignupSchema,loginSchema} = require('../valdition/vald.js');
const {Owner,Worker,Company,Token} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
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

    const { email, password, confirmPassword, userName, skills, contactNumber, isGuarantor } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

  

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newWorker = new Worker({
            email,
            password: hashedPassword,  // Use hashed password
            userName,
        
            contactNumber,
            isGuarantor: isGuarantor || false // إذا لم يكن تم اختيارها، تكون القيمة False
            ,
            registrationCompleted: false // تعيين حالة التسجيل كغير مكتملة

        });

        const savedWorker = await newWorker.save();
        console.log("Worker added successfully");
       
        return res.status(201).json({
            message: 'Step 1 completed. Proceed to step 2.',
            workerId: savedWorker._id
        });
    } catch (error) {
        console.error("Error adding worker:", {
            errorMessage: error.message,
            stack: error.stack,
            code: error.code
        });

        // Check for duplicate email error
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // General error handling
        return res.status(500).json({ message: 'Error adding worker' });
    }
};

const signupwstep2= async (req, res) => {
    let { workerId } = req.params;
    const { streetName, town, city, areas ,tools,skills} = req.body;
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

    const allowedTools = [
        'محراث', 
        'جرار', 
        'مضخة ري', 
        'مقص زراعي', 
        'منشار يدوي', 
        'معدات رش مبيدات', 
        'آلة حصاد', 
        'معدات تسميد', 
        'مجزّ العشب', 
        'معدات نقل المحاصيل'
    ];
    try {
        workerId = workerId.replace(/^:/, '');  // هذه الدالة ستزيل النقطتين في حال كانت في بداية المعرف

        const worker = await Worker.findById(workerId);
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found.' });
        }
        if (!Array.isArray(skills)) {
            return res.status(400).json({ message: 'Skills must be an array' });
        }
    
        if (!skills.every(skill => allowedSkills.includes(skill))) {
            return res.status(400).json({ 
                message: 'اختر مهارات لها علاقة بأعمال الأرض',
                allowedSkills
            });
        }
    
        if (!Array.isArray(tools)) {
            return res.status(400).json({ message: 'Tools must be an array' });
        }
    
        if (!tools.every(tool => allowedTools.includes(tool))) {
            return res.status(400).json({ 
                message: 'اختر أدوات لها علاقة بأعمال الأرض',
                allowedTools
            });
        }
        // تحديث بيانات الموقع وحالة التسجيل
        worker.streetName=  streetName ;
        worker.town= town ;
        worker.city=   city ;
        worker.tools=  tools ;
        worker.skills =   skills ;

        worker.areas = areas;
        worker.registrationCompleted = true;

        await worker.save();

        return res.status(200).json({ message: 'Registration completed successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating worker data.' });
    }
};

const login = async (req, res) => {
    try {
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
        const role = user instanceof Owner ? 'Owner' : 'Worker';

        const payload = role === 'Owner' 
        ? {
            email: req.body.email,
            role: user.role,
            ownerName: user.ownerName,
            contactNumber: user.contactNumber,
            Status: user.Status,
        }
        : {
            email: req.body.email,
            role: user.role,
            userName: user.userName,
            contactNumber: user.contactNumber,
            Status: user.Status,
            skills: user.skills
        };
    
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '50d' });  // إنشاء التوكن مع البيانات الإضافية
    console.log(payload); // تأكد من أن القيمة موجودة هنا

    console.log(user.contactNumber); // تأكد من أن القيمة موجودة هنا
    if (!user.contactNumber) {
        return res.status(400).json({ message: "رقم الاتصال مطلوب." });
    }
    
         // جلب البيانات الإضافية بناءً على الدور
         const userData =
         role === 'Owner'
             ? {
                 ownerName: user.ownerName,
                 contactNumber: user.contactNumber,
                 role: user.role,
                 Status: user.Status
             }
             : {
                 userName: user.userName,
                 contactNumber: user.contactNumber,
                 role: user.role,
                 Status: user.Status,
                 skills: user.skills
             };
        console.log("User role:", role);
      // تحديث أو إنشاء التوكن في جدول التوكن
      const existingToken = await Token.findOne({ email });

      if (existingToken) {
          existingToken.token = token;
          Object.assign(existingToken, userData); // تحديث البيانات الإضافية
          await existingToken.save();
      } else {
          const newToken = new Token({ email, token, ...userData }); // إضافة البيانات الإضافية
          await newToken.save();
      }
      console.log("Authenticated user:", role);


        const userName = user.userName || user.ownerName;
        const welcomeMessage = role === 'Worker' ? `Hello, ${userName}! Welcome to the Worker page.` : `Hello, ${userName}! Welcome to the Owner page.`;

    // إرسال الاستجابة
    return res.status(200).json({
        message: 'Login successful!',
        token,
        role,
        email,
        welcomeMessage,
        userData // إرسال بيانات المستخدم
    });
} catch (error) {
    console.error("Error during login:", error);

    if (error.code === 11000) {
        return res.status(409).json({ message: 'Sorry, this email is already exist' });
    }

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
const logincompany = async (req, res) => {
    try {
        const { email, password } = req.body;

        // التحقق من الحقول المدخلة
        if (!email || !password) {
            return res.status(400).json({ message: "يرجى إدخال البريد الإلكتروني وكلمة المرور" });
        }

        // البحث عن الشركة بناءً على البريد الإلكتروني
        const company = await Company.findOne({ email });
        console.log("Email entered:", email);
        console.log("Company found:", company);

        if (!company) {
            return res.status(404).json({ message: "الشركة غير موجودة" });
        }

        // مقارنة كلمة المرور
        if (password !== company.password) {
            return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
        }

        // إعداد البيانات للتوكن
        const payload = {
            email: company.email,
            role: company.role,
        };

        const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '20d' });

        // إنشاء أو تحديث التوكن
        const existingToken = await Token.findOne({ email });
        if (existingToken) {
            existingToken.token = token;
            existingToken.role = company.role || existingToken.role; // تحديث الدور إذا لم يكن مفقودًا
            await existingToken.save();
        } else {
            const newToken = new Token({
                email: company.email,
                token,
                role: company.role,
                ...(company.role === 'Owner' && { ownerName: company.ownerName, contactNumber: company.contactNumber }),
                ...(company.role === 'Worker' && { userName: company.userName, skills: company.skills }),
            });
            await newToken.save();
        }

        console.log("Authenticated company:", company.role);

        // إرسال التوكن مع الرد
        res.status(200).json({
            message: "تم تسجيل الدخول بنجاح",
            token,
            role: company.role,
        });

    } catch (error) {
        console.error("خطأ في تسجيل الدخول: ", error);
        res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
};
const signuptransporation=async (req, res) => {
    const { companyName, email, phoneNumber, serviceType, location, password } = req.body;
  
    try {
      // التحقق من المدخلات
      if (!companyName || !email || !phoneNumber || !serviceType || !password) {
        return res.status(400).json({ message: "الرجاء ملء جميع الحقول المطلوبة." });
      }
  
      // إنشاء حساب جديد
      const newCompany = new Company({
        companyName,
        email,
        phoneNumber,
        serviceType,
        location,
        password
      });
  
      // حفظ الحساب في قاعدة البيانات
      await newCompany.save();
  
      // إرسال الرد
      res.status(201).json({ message: 'تم إنشاء حساب الشركة بنجاح!' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'حدث خطأ أثناء التسجيل' });
    }
  };
  const signupcompany = async (req, res) => {
    const { companyType, companyName, location, contactInfo, workingHours, additionalFields, password } = req.body;

    // التأكد من وجود نوع الشركة وكلمة السر
    if (!companyType) {
        return res.status(400).json({ error: 'نوع الشركة مطلوب' });
    }

    if (!password) {
        return res.status(400).json({ error: 'كلمة السر مطلوبة' });
    }

    if (!contactInfo || !contactInfo.email || !contactInfo.phone) {
        return res.status(400).json({ error: 'معلومات الاتصال (البريد الإلكتروني والهاتف) مطلوبة' });
    }

    let requiredFields = [];

    // تحديد الحقول المطلوبة بناءً على نوع الشركة
    switch (companyType) {
        case 'نقل':
            requiredFields = ['serviceType', 'serviceRange', 'transportCost', 'availableVehicles'];
            break;
        case 'معصرة':
            requiredFields = ['pressCapacity', 'pressCost', 'additionalServices'];
            break;
        case 'أسمدة وبذور':
            requiredFields = ['productType', 'minOrder', 'deliveryOptions'];
            break;
        case 'مطحنة':
            requiredFields = ['grainTypes', 'millingCost', 'millCapacity'];
            break;
        default:
            return res.status(400).json({ error: 'نوع الشركة غير معروف' });
    }

    // التحقق من الحقول المفقودة
    for (let field of requiredFields) {
        if (!additionalFields || !additionalFields[field]) {
            return res.status(400).json({ error: `${field} مطلوب` });
        }
    }

    // تشفير كلمة السر باستخدام bcrypt
    try {
        const hashedPassword = await bcrypt.hash(password, 10);  // استخدام bcrypt لتشفير كلمة السر
        
        // إنشاء كائن جديد من شركة
        const company = new Company({
            companyType,
            companyName,
            location,
            contactInfo,  // تأكد من تمرير معلومات الاتصال هنا
            workingHours,
            additionalFields,
            password: hashedPassword,  // تعيين كلمة السر المشفرة
        });

        // حفظ الشركة في قاعدة البيانات
        await company.save();

        // إنشاء الحساب بنجاح
        res.status(200).json({
            message: 'تم إنشاء الحساب بنجاح',
            companyData: {
                companyType,
                companyName,
                location,
                contactInfo,
                workingHours,
                additionalFields,
                password: hashedPassword,  // عرض كلمة السر المشفرة
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'فشل في تشفير كلمة السر' });
    }
};


module.exports = {verifyResetCode,signuptransporation,resetPassword, login, deactivationaccount,
    signupowner,signupWorker,profile,logout,sendconfirm,signupcompany,
    getconfirm,myprofile,deleteAccount,updatePassword,forgotPassword,logincompany,signupwstep2};
