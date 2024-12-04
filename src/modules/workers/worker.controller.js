
const axios=require('axios');
const express = require('express');const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const { API_KEY } = require('dotenv'); // تأكد من أنك قد خزنت مفتاح API في ملف config.js أو مباشرًا في الكود.
const nodemailer = require('nodemailer');

const {Owner,Worker,Token,Land,works,requests} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
const updateWorkerProfile = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Please enter what you want to update' });
        }

        const updates = req.body; 
        let email = req.params.email.trim();  // إزالة المسافات الزائدة
        email = email.replace(":", "");  

        if (req.user.email !== email || req.user.role !== 'Worker') {
            return res.status(403).json({ message: 'You can only update your own profile as a Worker.' });
        }

        console.log('Updating profile for Worker:', email);

        // Validate the updates for Worker
        const validation = validateProfileUpdate(updates, 'Worker');
        if (validation.error) {
            return res.status(400).json({ message: validation.error });
        }

        const updatedProfile = validation.value;

        // Find and update the Worker profile in the database
        const updatedWorker = await Worker.findOneAndUpdate(
            { email },
            { $set: updatedProfile },
            { new: true }  // Return the updated document
        );

        if (!updatedWorker) {
            return res.status(404).json({ message: 'Worker not found.' });
        }

        return res.status(200).json({
            message: 'Worker profile updated successfully.',
            updatedWorker
        });
    } catch (error) {
        console.error('Error updating Worker profile:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const announce = async (req, res) => {
    try {
        const token = req.header("authorization");
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required." });
        }

        let decodedToken;
        try {
            // تحقق من صحة التوكن باستخدام verify
            decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token has expired. Please login again.' });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token. Please login again.' });
            }
            return res.status(401).json({ message: 'Authentication failed. Please login again.' });
        }

        // استخراج البريد الإلكتروني من الـ decoded token
        const { email, role } = decodedToken;

        // تحقق من صلاحية الدور
        if (role !== "Worker") {
            return res.status(403).json({ message: "Access denied. Only Workers can announce jobs." });
        }

        // البحث عن العامل في قاعدة البيانات باستخدام البريد الإلكتروني
        const worker = await Worker.findOne({ email });
        if (!worker) {
            return res.status(404).json({ message: "Worker not found." });
        }

        // استخراج التفاصيل من العامل
        const { skills, contactNumber, tools, isGuarantor, street, city, town,areas } = worker;

        // استلام تفاصيل العمل من الطلب
        const { availableDays, hourlyRate} = req.body;

        // تجميع العنوان من بيانات العامل
        const address = `${street}, ${city}, ${town}, palestine`;
        const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // API key here
        const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await axios.get(geocodeUrl);

        if (response.data.status !== "OK") {
            return res.status(400).json({ message: "Unable to find location.", error: response.data.error_message });
        }

        const { lat, lng } = response.data.results[0].geometry.location;
        const formattedAddress = response.data.results[0].formatted_address;
        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

        // بناء مستند عمل جديد
        const newWork = new works({
            skills, // إضافة المهارات التي تم استرجاعها من العامل
            tools, // إضافة الأدوات التي تم استرجاعها من العامل
            availableDays, // إضافة الأيام المتاحة التي يتم استلامها من الطلب
            hourlyRate, // إضافة الأجرة التي تم استلامها من الطلب
            areas, // إضافة المناطق من الطلب
            location: {
                latitude: lat,
                longitude: lng
            },
            coordinates: {
                lat,
                lng
            },
            formattedAddress,
            email, // تخزين الايميل من التوكن
            contactNumber, // تخزين رقم الهاتف من قاعدة البيانات
            isGuarantor, // تخزين حالة التحقق من العامل
        });

        // حفظ المستند في قاعدة البيانات
        await newWork.save();

        res.status(201).json({
            message: 'Work announcement created successfully.',
            work: newWork,
            googleMapsLink
        });
    } catch (error) {
        console.error('Error in adding the announcement:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
};
const getLands = async (req, res) => {
    try {
        // تحقق من وجود التوكن في الهيدر
        const token = req.headers['authorization'];

        if (!token) {
            return res.status(401).json({ message: 'Token is required.' });
        }

        // التحقق من صحة التوكن (هنا يجب استخدام مكتبة للتحقق من التوكن مثل JWT)
        const user = verifyToken(token); // استخدم دالة للتحقق من صحة التوكن
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        // استخراج الفلتر من الكويري
        const { isguarntee, location } = req.query; // استخرج الموقع مع الفلتر
        
        // إنشاء كائن شرط البحث
        const query = {};

        // التحقق من حالة ضمان الأرض بناءً على حالة المستخدم
        if (isguarntee === 'true') {
            query.isguarntee = true; // فقط الأراضي المضمونة
        } else if (isguarntee === 'false') {
            query.isguarntee = false; // فقط الأراضي غير المضمونة
        }

        // إضافة فلتر الموقع (يتم هنا افتراض أن "location" هو موقع العامل)
        if (location) {
            // حدد الموقع المناسب للأرض (شارع، بلدة، مدينة، أو أي موقع آخر)
            query.location = location;
        }

        // العثور على الأراضي بناءً على الفلتر
        const lands = await Land.find(query);

        // إذا كانت الأراضي فارغة
        if (lands.length === 0) {
            return res.status(404).json({ message: 'No lands found matching the criteria.' });
        }

        // تصفية الأراضي حسب الموقع
        const filteredLands = lands.filter(land => {
            // هنا نحتاج إلى منطق لحساب المسافة بين موقع العامل وموقع الأرض
            // يمكن استخدام حزمة مثل "geolib" لحساب المسافات إذا كان لدينا إحداثيات جغرافية
            return isLandNearby(land, user.location);
        });

        // إذا لم توجد أراضٍ قريبة
        if (filteredLands.length === 0) {
            return res.status(404).json({ message: 'No nearby lands found matching the criteria.' });
        }

        // إرجاع الأراضي المتوافقة
        return res.status(200).json(filteredLands);
    } catch (error) {
        console.error('Error retrieving lands:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
};

// دالة للتحقق من صحة التوكن
const verifyToken = (token) => {
    // من المفترض أن تستخدم مكتبة للتحقق من التوكن هنا (مثل JWT)
    try {
        return jwt.verify(token, 'secret-key'); // تأكد من استخدام المفتاح الصحيح
    } catch (error) {
        return null;
    }
};

// دالة لحساب ما إذا كانت الأرض قريبة بناءً على الموقع
const isLandNearby = (land, userLocation) => {
    // من المفترض أن يكون لديك إحداثيات الموقع (خط العرض والطول) في كلا من "land" و "userLocation"
    // هنا نستخدم مكتبة مثل "geolib" لحساب المسافة بين الموقعين.
    // إذا كانت المسافة أقل من مسافة معينة، يمكن اعتبار الأرض قريبة

    // مثال باستخدام geolib (افترض أن المواقع هي إحداثيات جغرافية)
    const { getDistance } = require('geolib');
    
    const landLocation = land.location; // الموقع الخاص بالأرض
    const distance = getDistance(userLocation, landLocation);
    
    // تحديد مسافة معينة (مثال 10 كم)
    return distance <= 10000;
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tasbeehsa80@gmail.com', // بريدك الإلكتروني
        pass: 'yeaf tcnf prlj kzlj'    // كلمة المرور أو كلمة مرور التطبيق
    }
});
const getWeather = async (latitude, longitude) => {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                lat: latitude,
                lon: longitude,
                appid: '6d12351278a6e0f3a7bdd70bd2ddbd24', // استخدم مفتاح API هنا
                units: 'metric', // لعرض درجة الحرارة بوحدات مئوية
                lang: 'ar' // لجعل الطقس باللغة العربية
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching weather data');
    }
};
const sendEmailNotification = async (toEmail, subject, weatherMessage) => {
    const mailOptions = {
        from: 'tasbeehsa80@gmail.com',
        to: toEmail,
        subject: subject,
        text: weatherMessage
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};
const sendWeatherNotification = async (latitude, longitude, userEmail) => {
    try {
        // جلب بيانات الطقس
        const weatherData = await getWeather(latitude, longitude);
        const weatherDescription = weatherData.weather[0].description; // وصف الطقس
        const temperature = weatherData.main.temp; // درجة الحرارة
        const rain = weatherData.rain ? weatherData.rain['1h'] : 0; // كمية الأمطار خلال الساعة الماضية

        // تحديد الرسالة بناءً على الطقس
        let weatherMessage = '';
        if (temperature > 35) {
            weatherMessage = `🔥 تحذير: الطقس حار جدًا. درجة الحرارة: ${temperature}°C. يرجى اتخاذ الاحتياطات اللازمة.`;
        } else if (rain > 0) {
            weatherMessage = `🌧️ تنبيه: تساقط الأمطار قد يؤثر على العمل الزراعي. كمية الأمطار: ${rain} مم.`;
        } else {
            weatherMessage = `☀️ الطقس معتدل ومناسب للعمل. درجة الحرارة: ${temperature}°C.`;
        }

        // إرسال البريد الإلكتروني
        await sendEmailNotification(userEmail, 'تنبيه الطقس الزراعي', weatherMessage);
    } catch (error) {
        console.error('Error sending weather notification:', error.message);
    }
};
const weathernotification=async (req, res) => {
    try {
        const token = req.header('authorization'); // استخراج التوكن من الهيدر

        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // فك تشفير التوكن
        const { email } = decodedToken; // الحصول على الإيميل من التوكن

        const { latitude, longitude } = req.body; // إحداثيات الموقع من الطلب

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'يجب توفير الإحداثيات.' });
        }

        await sendWeatherNotification(latitude, longitude, email);

        return res.status(200).json({ message: 'تم إرسال إشعار الطقس بنجاح.' });
    } catch (error) {
        console.error('Error in weather notification route:', error.message);
        return res.status(500).json({ message: 'حدث خطأ في إرسال الإشعار.' });
    }
};
const notification = async (req, res) => {
    try {
        // استخرج التوكن من الهيدر
        const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        // فك تشفير التوكن والتحقق منه
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        // تحقق من أن المستخدم لديه دور "Worker" أو "Landowner"
        if (role !== 'Worker' && role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Workers or Landowners can view notifications.' });
        }

        // البحث عن المستخدم بناءً على البريد الإلكتروني
        const user = await Worker.findOne({ email }) || await Owner.findOne({ email });
        console.log(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log(role);

        console.log(user);

        if (role === 'Worker') {
            // إذا كان المستخدم "عامل"، جلب جميع الطلبات المتعلقة به
            const requestsForWorker = await requests.find({ workerId: user._id })
                .populate('landId')  // جلب كافة تفاصيل الأرض المرتبطة بالطلب
                .populate('ownerId', 'email name');  // جلب بيانات المالك (البريد الإلكتروني والاسم)

            // التحقق إذا لم تكن هناك طلبات
            if (!requestsForWorker.length) {
                return res.status(404).json({ message: 'No requests found for this worker.' });
            }

            // إرسال الطلبات مع تفاصيل الأرض والمالك
            return res.status(200).json({
                message: 'Requests retrieved successfully!.',
                requests: requestsForWorker
            });

        } else if (role === 'Owner') {
             // إذا كان المستخدم "Owner"، نبحث عن جميع الطلبات المتعلقة بالأراضي التي يملكها هذا المستخدم.
    const requestsForOwner = await requests.find({ ownerId: user._id })
    .populate('workerId')  // جلب بيانات العامل (البريد الإلكتروني والاسم)
    .populate('landId');  // جلب تفاصيل الأرض
console.log(user._id);
            // التحقق إذا لم تكن هناك طلبات
            if (!requestsForOwner.length) {
                return res.status(404).json({ message: 'No requests found for this landowner.' });
            }

            // إرسال الطلبات الخاصة بصاحب الأرض
            return res.status(200).json({
                message: 'Requests for your land retrieved successfully.yyyy',
                requests: requestsForOwner
            });
        }

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
};


const respondToRequest = async (req, res) => {
    try {
        // استخرج التوكن من الهيدر
        const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        // فك تشفير التوكن والتحقق منه
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;  // استخراج البريد الإلكتروني والدور

        // تحقق من أن المستخدم لديه دور "Worker"
        if (role !== 'Worker') {
            return res.status(403).json({ message: 'Access denied. Only Workers can respond to requests.' });
        }

        // ابحث عن العامل باستخدام البريد الإلكتروني
        const worker = await Worker.findOne({ email });
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found.' });
        }


     let { requestId, status } = req.params;  // status: accept/reject
        console.log(requestId);
        console.log(status);
        requestId=requestId.replace(/^:/, ''); 
        status= status.replace(/^:/, ''); 

        if (!requestId || !status) {
            return res.status(400).json({ message: 'Request ID and status (accept/reject) are required.' });
        }

        // تحقق من أن الحالة هي إما قبول أو رفض
        if (status !== 'accept' && status !== 'reject') {
            return res.status(400).json({ message: 'Invalid status. Must be "accept" or "reject".' });
        }

        // العثور على الطلب بناءً على الـ requestId
        const request = await requests.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        // تحقق من أن الـ workerId في الطلب يتطابق مع الـ workerId المستخرج من قاعدة البيانات
        if (request.workerId.toString() !== worker._id.toString()) {
            return res.status(403).json({ message: 'This request does not belong to this worker.' });
        }

        // تحديث حالة الطلب بناءً على القرار (قبول أو رفض)
        request.status = status === 'accept' ? 'Accepted' : 'Rejected';
        await request.save();

        // إرجاع استجابة مع الحالة الجديدة
        return res.status(200).json({
            message: `Request ${status}ed successfully.`,
            request: request,
        });

    } catch (error) {
        console.error('Error responding to request:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
};












module.exports={updateWorkerProfile,notification,respondToRequest,
    announce,getLands,weathernotification}