
const axios=require('axios');
const mongoose = require('mongoose');
const multer = require('multer');

const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const cron = require('node-cron'); 
const moment = require('moment');
const {Owner,Worker,DailyReport,OwnerFeedback,Chat,Land,works,requests,WorkAnnouncement} = require('../DB/types.js');  // تأكد من أن المسار صحيح
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
        // التحقق من وجود التوكن
        const token = req.header("authorization");
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required." });
        }

        // فك تشفير التوكن والتحقق من صحته
        let decodedToken;
        try {
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

        const { email, role } = decodedToken;

        // تحقق من الدور (يجب أن يكون العامل فقط)
        if (role !== "Worker") {
            return res.status(403).json({ message: "Access denied. Only Workers can announce jobs." });
        }

        // البحث عن العامل باستخدام البريد الإلكتروني
        const worker = await Worker.findOne({ email });
        if (!worker) {
            return res.status(404).json({ message: "Worker not found." });
        }

        // استخراج بيانات العامل
        const { _id, skills, contactNumber, tools, isGuarantor, street, city, town, areas } = worker;

        // التأكد من وجود بيانات العمل في الطلب
        const { availableDays, hourlyRate } = req.body;
        if (!availableDays || !hourlyRate) {
            return res.status(400).json({ message: "Missing required work data (availableDays or hourlyRate)." });
        }

        // تجميع العنوان
        const address = `${street}, ${city}, ${town}, palestine`;
        const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // مفتاح API
        const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        
        // استدعاء API للحصول على الإحداثيات
        const response = await axios.get(geocodeUrl);
        if (response.data.status !== "OK") {
            return res.status(400).json({ message: "Unable to find location.", error: response.data.error_message });
        }

        const { lat, lng } = response.data.results[0].geometry.location;
        const formattedAddress = response.data.results[0].formatted_address;

        // التحقق من صحة الإحداثيات
        if (!lat || !lng) {
            return res.status(400).json({ message: "Invalid coordinates returned from Geocoding API." });
        }

        // إنشاء مستند جديد للعمل
        const newWork = new works({
            workerId: _id, // تخزين _id الخاص بالعامل
            skills,
            tools,
            availableDays,
            hourlyRate,
            areas,
            location: {
                type: "Point",
                coordinates: [lng, lat] // ترتيب الإحداثيات [longitude, latitude]
            },
            coordinates: {
                lat,
                lng
            },
            formattedAddress,
            email,
            contactNumber,
            isGuarantor,
        });

        // حفظ المستند في قاعدة البيانات
        await newWork.save();

        res.status(201).json({
            message: 'Work announcement created successfully.',
            work: newWork,
            googleMapsLink: `https://www.google.com/maps?q=${lat},${lng}`
        });
    } catch (error) {
        console.error('Error in adding the announcement:', error);
        res.status(500).json({ message: 'Server error occurred.', error: error.message });
    }
};

const getLands = async (req, res) => {
    try {
        const token = req.header('authorization'); // استخراج التوكن من الهيدر

        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // فك تشفير التوكن
        const { email, role } = decodedToken;

        if (role !== 'Worker') {
            return res.status(403).json({ message: 'Access denied. Only Workers can access this data.' });
        }

        // العثور على العامل بناءً على الإيميل
        const worker = await Worker.findOne({ email });

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found.' });
        }

        // استخراج معرف الموقع
        const { streetName, town, city } = worker;

        if (!streetName && !town && !city) {
            return res.status(400).json({ message: 'Worker location data is incomplete.' });
        }

        // البحث عن الأراضي بإعلانات الضمان أو إعلانات العمل
        const landsWithGuarantee = await Land.find({
            $or: [
                { streetName: { $regex: streetName, $options: 'i' } },
                { town: { $regex: town, $options: 'i' } },
                { city: { $regex: city, $options: 'i' } }
            ],
            isguarntee: true,
            status:false
        });

        const workAnnouncements = await WorkAnnouncement.find({
            $or: [
                { location: { $regex: streetName, $options: 'i' } },
                { location: { $regex: town, $options: 'i' } },
                { location: { $regex: city, $options: 'i' } }
            ]
        });

        // التحقق من النتائج
        if (landsWithGuarantee.length > 0 || workAnnouncements.length > 0) {
            return res.status(200).json({
                message: 'Results found.',
                landsWithGuarantee,
                workAnnouncements
            });
        }

        return res.status(404).json({ message: 'No lands or work announcements found for this worker.' });

    } catch (error) {
        console.error('Error retrieving lands or work announcements:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
};

const joinland=async (req, res) => {
    try {
        const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        // التأكد من أن المستخدم هو عامل
        if (role !== 'Worker') {
            return res.status(403).json({ message: 'Access denied. Only workers can request to join land.' });
        }

        // العثور على العامل بناءً على الإيميل
        const worker = await Worker.findOne({ email });
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found.' });
        }

        // استخراج معرف الأرض من params
        const { landid } = req.params;

        // التأكد من أن الـ landid هو ObjectId صالح
        if (!mongoose.Types.ObjectId.isValid(landid)) {
            return res.status(400).json({ message: 'Invalid land ID.' });
        }

        // العثور على الأرض
        const land = await Land.findById(landid);
        if (!land) {
            return res.status(404).json({ message: 'Land not found.' });
        }

        // التحقق إذا كان العامل قد قدم طلبًا سابقًا لهذا الأرض
        const existingRequest = await requests.findOne({ workerId: worker._id, landId: land._id });
        if (existingRequest) {
            return res.status(400).json({ message: 'You have already requested to join this land.' });
        }

        // إنشاء الطلب
        const request = new requests({
            workerId: worker._id,
            landId: land._id,
            workerEmail: worker.email,
            ownerId: land.ownerId,
            owneremail: land.ownerEmail,
            status: 'Pending'
        });

        // حفظ الطلب في قاعدة البيانات
        await request.save();

        return res.status(201).json({
            message: 'Request to join the land has been submitted successfully.',
            request: request
        });

    } catch (error) {
        console.error('Error processing the join request:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
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

        const user = await Worker.findOne({ email }) || await Owner.findOne({ email });
        console.log(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log(role);

        console.log(user);

       if (role === 'Worker') {
       
                // استرجاع البريد الإلكتروني للمستخدم من التوكن
                const userEmail = req.user.email;
                
                // 1. البحث عن الطلبات الخاصة بالعامل والتي حالتها "Pending"
                const requestsForWorker = await requests.find({
                    workerEmail: userEmail, // التصفية باستخدام البريد الإلكتروني للعامل
                    status: { $in: ['Accepted', 'Rejected','Pending'] } // التصفية حسب حالة الطلب
                })
                .populate('landId') // جلب كافة تفاصيل الأرض المرتبطة بالطلب
                .populate('ownerId', 'email name'); // جلب بيانات المالك (البريد الإلكتروني والاسم)
        
                // 2. البحث عن التقارير التي تم تقديمها من قِبل العامل
                const reportsForWorker = await DailyReport.find({
                    reporter_email: userEmail // البحث باستخدام البريد الإلكتروني للعامل
                });
        
                // 3. إذا لم تكن هناك طلبات أو تقارير
                if (!requestsForWorker.length && !reportsForWorker.length) {
                    return res.status(404).json({ 
                        message: 'No pending requests or reports found for this worker.' 
                    });
                }
        
                // متغير لتخزين الطلبات التي تم تحديث الفيدباك لها
                let feedbackUpdatedRequests = [];
        
                // 4. البحث عن الفيدباك لكل تقرير تم تقديمه من العامل
                for (let report of reportsForWorker) {
                    const feedback = await OwnerFeedback.findOne({ report_id: report._id });
        
                    if (feedback && feedback.status === 'Pending') {
                        // تحديث حالة الفيدباك إلى "Reviewed"
                        feedback.status = 'Reviewed';
                        await feedback.save(); // حفظ التحديث في قاعدة البيانات
                        feedbackUpdatedRequests.push(feedback); // إضافة الفيدباك الذي تم تحديثه
                    }
          
        
                // إرسال الاستجابة مع الطلبات والتقارير والفيدباك الذي تم تحديثه
                return res.status(200).json({
                    message: 'Pending requests and reports retrieved successfully!',
                    requests: requestsForWorker,  // الطلبات التي حالتها "Pending"
                    feedbacksUpdated: feedbackUpdatedRequests // الفيدباك الذي تم تحديثه إلى "Reviewed"
                });
        
            } }
        
        else if (role === 'Owner') {
            try {
                // استرجاع البريد الإلكتروني للمستخدم من التوكن
                const userEmail = req.user.email;
        
                // البحث عن صاحب الأرض باستخدام البريد الإلكتروني
                const user = await Owner.findOne({ email: userEmail });
        
                if (!user) {
                    return res.status(404).json({ message: 'User not found.' });
                }
        
                // 1. البحث عن الطلبات الخاصة بصاحب الأرض والتي حالتها "Accepted" أو "Rejected"
                const requestsForOwner = await requests.find({
                    ownerId: user._id,
                    status: { $in: ['Accepted', 'Rejected','Pending'] } // التصفية حسب حالة الطلب
                });
        
                // 2. البحث عن التقارير المرتبطة بصاحب الأرض بناءً على بريده الإلكتروني
                const reportsForOwner = await DailyReport.find({
                    owner_email: userEmail // البحث باستخدام بريد صاحب الأرض
                });
        
                // التحقق إذا لم تكن هناك طلبات أو تقارير
                if (!requestsForOwner.length && !reportsForOwner.length) {
                    return res.status(404).json({ 
                        message: 'No requests or reports found for this landowner.' 
                    });
                }
        
                // إرسال الطلبات والتقارير المرتبطة بصاحب الأرض
                return res.status(200).json({
                    message: 'Requests and reports for your land retrieved successfully.',
                    requests: requestsForOwner, // الطلبات التي حالتها "Accepted" أو "Rejected"
                    reports: reportsForOwner   // التقارير المرتبطة بصاحب الأرض
                });
        
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'An error occurred while retrieving the requests or reports.' });
            }
        }
        
        

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
};

const respondToRequest = async (req, res) => {
    try {
        console.log('Received request to respond to request.');

        // استخرج التوكن من الهيدر
        const token = req.header('authorization');
        if (!token) {
            console.log('No token provided.');
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        // فك تشفير التوكن والتحقق منه
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        if (role !== 'Worker') {
            return res.status(403).json({ message: 'Access denied. Only Workers can respond to requests.' });
        }

        // ابحث عن العامل باستخدام البريد الإلكتروني
        const worker = await Worker.findOne({ email });
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found.' });
        }

        let { requestId, status } = req.params;
        requestId = requestId.replace(/^:/, '');
        status = status.replace(/^:/, '');

        if (!requestId || !status || (status !== 'accept' && status !== 'reject')) {
            return res.status(400).json({ message: 'Invalid request. Request ID and valid status are required.' });
        }

        // العثور على الطلب بناءً على الـ requestId
        const request = await requests.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        // تحديث حالة الطلب بناءً على القرار
        request.status = status === 'accept' ? 'Accepted' : 'Rejected';
        request.workerEmail = email;

        // تحديث الطلب في حالة القبول
        if (status === 'accept') {
            const { landId} = request; // افترض أن معرف الأرض ومدة الضمان موجودان في الطلب
            if (!landId) {
                return res.status(400).json({ message: 'Land ID is missing in the request.' });
            }

            const land = await Land.findById(landId);
            if (!land) {
                return res.status(404).json({ message: 'Land not found.' });
            }
            const guaranteeDuration = land.guaranteeDuration;

            if (land.isguarntee) {
                console.log(guaranteeDuration);
                if (!guaranteeDuration) {
                    return res.status(400).json({ message: 'Guarantee duration is required for guaranteed lands.' });
                }

                const guaranteeEndDate = new Date();
                const durationParts = guaranteeDuration.split(' '); // توقع صيغة مثل "3 months"
                const durationValue = parseInt(durationParts[0]);
                const durationUnit = durationParts[1]?.toLowerCase();

                if (isNaN(durationValue) || !['month','أشهر', 'months', 'year', 'years'].includes(durationUnit)) {
                    return res.status(400).json({ message: 'Invalid guarantee duration format.' });
                }

                if (durationUnit.includes('month')) {
                    guaranteeEndDate.setMonth(guaranteeEndDate.getMonth() + durationValue);
                } else if (durationUnit.includes('year')) {
                    guaranteeEndDate.setFullYear(guaranteeEndDate.getFullYear() + durationValue);
                }

                // تحديث الأرض
                land.temporaryOwnerEmail = email; // تعيين العامل كمالك مؤقت
                land.guaranteeEndDate = guaranteeEndDate; // تحديد تاريخ انتهاء الضمان
                land.status = true;
                land.advertisement=false;
            } else {
                // تحديث حالة الأرض بشكل طبيعي
                land.status = true; // تحديث الحالة إذا لم تكن ضمان
            }

            await land.save();
        }

        // حفظ الطلب المحدث
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

const getAllAnnouncements = async (req, res) => {
    try {
        // Fetch all works from the database
        const announcements = await works.find();

        // Return the announcements as a response
        res.status(200).json({
            message: "Announcements retrieved successfully.",
            announcements,
        });
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: "Server error occurred." });
    }
};
const sendReminderEmail = async (toEmail, subject, text) => {
    try {
        const mailOptions = {
            from: 'tasbeehsa@gmail.com', // البريد المرسل منه
            to: toEmail, // البريد المستلم
            subject: subject,
            text: text
        };

        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
// جدولة التذكير يوميًا عند منتصف الليل
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled task for sending reminders...');

    // البحث عن الأراضي التي انتهت مدة استلامها
    const today = new Date();
    const landsToRemind = await Land.find({ guaranteeEndDate: { $lte: today } }); // الأراضي التي انتهت مدة ضمانها

    for (const land of landsToRemind) {
        const temporaryOwnerEmail = land.temporaryOwnerEmail; // البريد الإلكتروني للمستأجر
        const originalOwnerEmail = land.originalOwnerEmail; // البريد الإلكتروني للمالك الأصلي

        // إرسال تذكير للمستأجر
        if (temporaryOwnerEmail) {
            const subject = `Reminder: Guarantee period ended for land ${land._id}`;
            const text = `Dear temporary owner,\n\nThe guarantee period for the land "${land._id}" has ended. The land will be returned to the original owner.\n\nThank you.`;
            await sendReminderEmail(temporaryOwnerEmail, subject, text);
        }

        // تحديث قاعدة البيانات لإرجاع الملكية
        land.temporaryOwnerEmail = null; // إزالة البريد الإلكتروني للمستأجر
        land.currentOwnerEmail = originalOwnerEmail; // إعادة الملكية للمالك الأصلي
        await land.save();
    }
});

const getLandsForGuarantor = async (req, res) => {
    try {
        console.log('Start of getLandsForGuarantor function');

        // استخرج التوكن من الهيدر
        const token = req.header('authorization');
        if (!token) {
            console.log('No token provided.');
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        console.log('Token received:', token);

        // فك تشفير التوكن والتحقق منه
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;
        console.log('Decoded token:', decodedToken);

        if (role !== 'Worker') {
            console.log('Access denied. Only Workers can respond to requests.');
            return res.status(403).json({ message: 'Access denied. Only Workers can respond to requests.' });
        }

        // ابحث عن العامل باستخدام البريد الإلكتروني
        const worker = await Worker.findOne({ email: email });
        if (!worker) {
            console.log('Worker not found for email:', email);
            return res.status(404).json({ message: 'Worker not found.' });
        }
        
        console.log('Worker found:', worker);

        if (!worker.isGuarantor) {
            console.log('The worker is not a guarantor.');
            return res.status(403).json({ message: 'You are not a guarantor.' });
        }

       

        const lands = await Land.find({
            temporaryOwnerEmail:email // البحث عن الأراضي التي الضامن هو المؤقت لها
        }).exec();
        console.log(lands);
        if (lands.length === 0) {
            console.log('No lands found for guarantor:', email);
            return res.status(404).json({ message: 'You are not a guarantor for any land' });
        }
        console.log('Lands found for guarantor:', lands);
        res.status(200).json(lands);

    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
let start_time = null;  // لتخزين وقت البدء
let end_time = null;    // لتخزين وقت الانتهاء

const toggleWorkStatus = async (req, res) => {
  try {
    if (!start_time) {
      // إذا لم يكن هناك وقت بدء، نقوم بتسجيله
      start_time = moment();
      return res.status(200).json({
        message: 'تم تسجيل وقت البدء',
        start_time: start_time.format('YYYY-MM-DD HH:mm:ss'),
      });
    } else {
      // إذا كان هناك وقت بدء، نقوم بتسجيل وقت الانتهاء وحساب الفارق
      end_time = moment();
      const duration = moment.duration(end_time.diff(start_time));
      const total_hours_worked = duration.asHours(); // نحسب الساعات الإجمالية

      return res.status(200).json({
        message: 'تم تسجيل وقت الانتهاء',
        start_time: start_time.format('YYYY-MM-DD HH:mm:ss'),
        end_time: end_time.format('YYYY-MM-DD HH:mm:ss'),
        total_duration: `${duration.hours()} hours, ${duration.minutes()} minutes`,
        total_hours_worked, // نرسل ساعات العمل الفعلية
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء العملية' });
  }
};
const creatReport = async (req, res) => {
    const { completion_percentage, tasks_completed, challenges, recommendations } = req.body;
    const { land_id } = req.params;
    const { total_hours_worked } = req.body;
  
    try {
      const token = req.header('authorization');
      if (!token) {
        return res.status(401).json({ message: 'التوكن مطلوب للمصادقة.' });
      }
  
      const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
      const { email: user_email } = decodedToken;
  
      const land = await Land.findById(land_id);
      if (!land) {
        return res.status(404).json({ message: 'الأرض غير موجودة' });
      }
  
      if (land.temporaryOwnerEmail !== user_email) {
        return res.status(403).json({ message: 'البريد الإلكتروني لا يتطابق مع صاحب الأرض' });
      }
  
      const existingReport = await DailyReport.findOne({
        land_id,
        report_date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)), $lt: new Date(new Date().setHours(23, 59, 59, 999)) },
      });
  
      if (existingReport) {
        return res.status(400).json({ message: 'تم تقديم تقرير لهذا اليوم بالفعل' });
      }
  
      if (completion_percentage < 0 || completion_percentage > 100) {
        return res.status(400).json({ message: 'نسبة الإنجاز يجب أن تكون بين 0 و 100' });
      }
  
      if (total_hours_worked < 0) {
        return res.status(400).json({ message: 'ساعات العمل يجب أن تكون رقمًا موجبًا' });
      }
  
      const landemail = await Land.findOne({ _id: land_id }).select('ownerEmail');
      const ownerEmail = landemail.ownerEmail;
  
      const avgCompletion = await calculateAverageCompletion(land_id);
      const totalHours = await calculateTotalHoursWorked(land_id);
      const challengesAnalysis = await analyzeChallenges(land_id);
      const monthlyData = await analyzeMonthlyData(land_id);
  
      const analysis = {
        avgCompletion,
        totalHours,
        challengesAnalysis: JSON.stringify(challengesAnalysis),
        monthlyData: JSON.stringify(monthlyData),
      };
  
      const newReport = new DailyReport({
        land_id,
        report_date: new Date(),
        completion_percentage,
        tasks_completed,
        challenges,
        recommendations,
        hours_worked: total_hours_worked,
        owner_email: ownerEmail,
        reporter_email: user_email,
        analysis,
      });
  
      await newReport.save();
  
      res.status(201).json({
        message: 'تم إضافة التقرير بنجاح',
        analysis,
        reportDetails: {
          land_id,
          completion_percentage,
          tasks_completed,
          challenges,
          recommendations,
          hours_worked: total_hours_worked,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'حدث خطأ أثناء إضافة التقرير', error: error.message });
    }
};
  const calculateAverageCompletion = async (land_id) => {
    const reports = await DailyReport.find({ land_id });
    if (reports.length === 0) return 0;
  
    const totalCompletion = reports.reduce((acc, report) => acc + report.completion_percentage, 0);
    return totalCompletion / reports.length;
  };
  const calculateTotalHoursWorked = async (land_id) => {
    const reports = await DailyReport.find({ land_id });
    if (reports.length === 0) return 0;
  
    const totalHours = reports.reduce((acc, report) => acc + report.hours_worked, 0);
    return totalHours;
  };
  const analyzeChallenges = async (land_id) => {
    const reports = await DailyReport.find({ land_id });
    const challengeFrequency = {};
  
    reports.forEach((report) => {
      const challenges = report.challenges.split(','); // نفترض أن التحديات مفصولة بفواصل
      challenges.forEach((challenge) => {
        challenge = challenge.trim();
        challengeFrequency[challenge] = (challengeFrequency[challenge] || 0) + 1;
      });
    });
  
    return challengeFrequency;
  };
  const analyzeMonthlyData = async (land_id) => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  
    const reports = await DailyReport.find({
      land_id,
      report_date: { $gte: startOfMonth, $lt: endOfMonth }
    });
  
    const totalCompletion = reports.reduce((acc, report) => acc + report.completion_percentage, 0);
    const avgCompletion = reports.length ? totalCompletion / reports.length : 0;
  
    return { avgCompletion, reports };
  };
  const feedbacksystem = async (req, res) => {
    const { feedback_id, status } = req.params; // الحصول على معرف الفيدباك والحالة
    
    // التحقق من أن الحالة هي "مقبولة" أو "مرفوضة"
    if (status !== 'مقبولة' && status !== 'مرفوضة') {
        return res.status(400).json({ message: 'الحالة غير صالحة. يجب أن تكون "مقبولة" أو "مرفوضة".' });
    }

    try {
      // البحث عن الفيدباك من قاعدة البيانات
      const feedback = await OwnerFeedback.findById(feedback_id);
      if (!feedback) {
        return res.status(404).json({ message: 'الملاحظة غير موجودة.' });
      }
  
      // استخراج report_id من الفيدباك
      const { report_id } = feedback;
  
      // البحث عن التقرير باستخدام report_id
      const report = await DailyReport.findById(report_id);
      if (!report) {
        return res.status(404).json({ message: 'التقرير غير موجود.' });
      }
  
      // استخراج البريد الإلكتروني من التقرير
      const reportOwnerEmail = report.reporter_email; // البريد الإلكتروني لصاحب التقرير
  
      // استخراج البريد الإلكتروني من التوكن
      const token = req.header('authorization');
      if (!token) {
        return res.status(401).json({ message: 'التوكن مطلوب للمصادقة.' });
      }
      
      const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // فك التشفير
      const { email: userEmail } = decodedToken;
  
      // التحقق من تطابق البريد الإلكتروني لصاحب التقرير مع البريد الإلكتروني من التوكن
      if (reportOwnerEmail !== userEmail) {
        return res.status(403).json({ message: 'ليس لديك صلاحية لفتح هذا الفيدباك.' });
      }
  
      // تحديث الحالة إلى "مقبولة" أو "مرفوضة"
      feedback.status = status; // تحديث الحالة استنادًا إلى القيمة التي تم إرسالها
      await feedback.save(); // حفظ التحديث في قاعدة البيانات
  
      res.status(200).json({
        message: `تم تحديث حالة الملاحظة إلى ${status} بنجاح.`,
        feedback, // إرسال تفاصيل الفيدباك المحدثة
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'حدث خطأ أثناء استرجاع الملاحظة وتحديث حالتها.',
        error: error.message,
      });
    }
};
cron.schedule("*/5 * * * *", async () => {
    try {
        // جلب جميع الأراضي المضمونة وحالتها true
        const lands = await Land.find({ isguarntee: true, status: true });

        // المرور على جميع الأراضي المضمونة
        await Promise.all(
            lands.map(async (land) => {
                try {
                    // التحقق من وجود المحادثة بالفعل
                    const existingChat = await Chat.findOne({ landId: land._id });
                    if (existingChat) return;

                    // التحقق من وجود البريد الإلكتروني للمالك والضامن
                    if (!land.ownerEmail || !land.temporaryOwnerEmail) {
                        console.error(
                            `Missing ownerEmail or temporaryOwnerEmail for land ID: ${land._id}`
                        );
                        return;
                    }

                    // إنشاء محادثة جديدة
                    const newChat = new Chat({
                        participants: [land.ownerEmail, land.temporaryOwnerEmail],
                        landId: land._id,
                        messages: [
                            {
                                senderId: land.ownerEmail,
                                receiverId: land.temporaryOwnerEmail,
                                message: `مرحبًا، تم إنشاء محادثة جديدة بخصوص ضمان الأرض "${land.description}" الواقعة في "${land.formattedAddress}".`,
                                timestamp: new Date(),
                            },
                        ],
                    });

                    // حفظ المحادثة الجديدة
                    await newChat.save();
                    console.log(`Chat created successfully for land ID: ${land._id}`);
                } catch (error) {
                    console.error(
                        `Error creating chat for land ID: ${land._id}:`,
                        error.message
                    );
                }
            })
        );

        console.log("Checked guaranteed lands and created chats if necessary.");
    } catch (error) {
        console.error("Error checking guaranteed lands:", error.message);
    }
});

const search = async (req, res) => {
    try {
        const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ message: 'التوكن مطلوب للمصادقة.' });
        }

        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email: user_email } = decodedToken;

        const { landId } = req.params; // ID الأرض المراد البحث عن عمال لها
        if (!landId) {
            return res.status(400).json({ success: false, message: "الرجاء تزويد رقم الأرض." });
        }

        const land = await Land.findById(landId);
        if (!land) {
            return res.status(400).json({ success: false, message: "إحداثيات الأرض غير متوفرة." });
        }

        // التحقق من تطابق البريد الإلكتروني مع صاحب الأرض
        if (land.temporaryOwnerEmail !== user_email) {
            return res.status(403).json({ message: 'البريد الإلكتروني لا يتطابق مع صاحب الأرض' });
        }

        const { location, workType, streetName, town, city } = land; // استخراج الإحداثيات ونوع العمل وأسماء الأماكن

        if (!workType) {
            return res.status(400).json({ success: false, message: "نوع العمل غير محدد في الأرض." });
        }

        const { latitude, longitude } = location; // استخراج الإحداثيات بشكل صحيح

        let workers = []; // مصفوفة لتخزين العمال

        // أولاً: البحث باستخدام اسم الشارع
        workers = await works.find({
            areas: { $regex: streetName, $options: 'i' }        
        });

        // ثانياً: إذا لم يتم العثور على عمال، البحث باستخدام اسم البلدة
        if (workers.length === 0) {
            workers = await works.find({
                areas: { $regex: town, $options: 'i' }
            });
        }

        // ثالثاً: إذا لم يتم العثور على عمال، البحث باستخدام اسم المدينة
        if (workers.length === 0) {
            workers = await works.find({
                areas: { $regex: city, $options: 'i' }
            });
        }

        // رابعاً: إذا لم يتم العثور على عمال، البحث باستخدام عدة شروط (الشارع، البلدة، المدينة)
        if (workers.length === 0) {
            workers = await works.find({
                $or: [
                    { areas: { $regex: streetName, $options: 'i' } },
                    { areas: { $regex: town, $options: 'i' } },
                    { areas: { $regex: city, $options: 'i' } },
                ],
                ...(isguarntee ? { isguarntee: true } : {}), // إضافة شرط الضمان إذا كان موجودًا
            });
        }

        // إذا لم يتم العثور على عمال باستخدام الموقع الجغرافي
        if (workers.length === 0) {
            // البحث باستخدام الموقع الجغرافي فقط إذا لم تجد عمال باستخدام الأماكن السابقة
            workers = await Worker.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [longitude, latitude] }, 
                        distanceField: "distance", 
                        spherical: true, 
                        maxDistance: 10000, 
                        query: {
                            status: "Available", 
                            $or: [
                                { skills: { $in: [workType] } },
                                { tools: { $in: [workType] } }
                            ]
                        }
                    }
                },
                { $limit: 20 }
            ]);
        }

        // إذا لم يتم العثور على عمال بعد جميع الفحوصات
        if (workers.length === 0) {
            return res.status(404).json({ message: 'لا يوجد عمال قريبين لهذه الأرض.' });
        }

        // فلترة العمال حسب المهارات والأدوات
        const filteredWorkers = workers.filter(worker => {
            return (worker.skills.includes(workType) || worker.tools.includes(workType));
        });

        // إرجاع العمال المفلترين
        return res.status(200).json(filteredWorkers);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ غير متوقع",
            error: error.message || error
        });
    }
};

const getChats = async (req, res) => {
    try {  
         const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ message: 'التوكن مطلوب للمصادقة.' });
        }

        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email: user_email } = decodedToken;

console.log(user_email);
        // تحقق من وجود البريد الإلكتروني
        if (!user_email) {
            return res.status(401).json({ message: "التوكن لا يحتوي على بريد إلكتروني صالح" });
        }

        // جلب جميع المحادثات التي يكون المستخدم جزءًا منها
        const chats = await Chat.find({ participants: user_email })
            .select("_id participants messages landId")
            .populate("landId", "description formattedAddress"); // جلب بيانات الأرض

        // تهيئة قائمة المحادثات
        const formattedChats = chats.map((chat) => {
            const lastMessage =
                chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1]
                    : null;

            return {
                chatId: chat._id,
                participants: chat.participants,
                landDetails: chat.landId,
                lastMessage: lastMessage
                    ? {
                          senderId: lastMessage.senderId,
                          receiverId: lastMessage.receiverId,
                          message: lastMessage.message,
                          timestamp: lastMessage.timestamp,
                      }
                    : null,
            };
        });

        // إرسال المحادثات كاستجابة
        res.status(200).json({ chats: formattedChats });
    } catch (error) {
        console.error("Error fetching chats:", error.message);

        // التعامل مع أخطاء التوكن
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "التوكن غير صالح" });
        }

        // التعامل مع أي أخطاء أخرى
        res.status(500).json({ message: "حدث خطأ أثناء جلب المحادثات", error: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        // التحقق من وجود التوكن في الهيدر
        const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ message: 'التوكن مطلوب للمصادقة.' });
        }

        // فك التوكن للحصول على البريد الإلكتروني للمرسل
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email: senderEmail } = decodedToken;

        // تحقق من وجود البريد الإلكتروني في التوكن
        if (!senderEmail) {
            return res.status(401).json({ message: "التوكن لا يحتوي على بريد إلكتروني صالح" });
        }

        // الحصول على chatId من الرابط (req.params)
        const { chatId } = req.params;

        // التحقق من وجود الرسالة في الجسم
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "يجب توفير الرسالة" });
        }

        // البحث عن المحادثة باستخدام chatId
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "المحادثة غير موجودة" });
        }

        // التحقق إذا كان المرسل أحد المشاركين في المحادثة (إما المرسل أو المستقبل)
        const isParticipant = chat.participants.includes(senderEmail);
        if (!isParticipant) {
            return res.status(403).json({ message: "أنت غير مفوض لإرسال الرسائل في هذه المحادثة" });
        }

        // تحديد البريد الإلكتروني للمستقبل (الطرف الآخر في المحادثة)
        const receiverEmail = chat.participants.find((email) => email !== senderEmail);
        if (!receiverEmail) {
            return res.status(400).json({ message: "تعذر العثور على المشارك الآخر" });
        }

        // إنشاء الرسالة الجديدة
        const newMessage = {
            senderId: senderEmail,
            receiverId: receiverEmail,
            message: message,
            timestamp: new Date(),
        };

        // إضافة الرسالة إلى المحادثة وحفظها في قاعدة البيانات
        chat.messages.push(newMessage);
        await chat.save();

        // إرسال الاستجابة مع التفاصيل
        res.status(200).json({
            message: "تم إرسال الرسالة بنجاح",
            chatId: chat._id,
            newMessage,
        });
    } catch (error) {
        // التعامل مع الأخطاء
        console.error("Error sending message:", error.message);
        res.status(500).json({ message: "حدث خطأ أثناء إرسال الرسالة", error: error.message });
    }
};
const getonechat= async (req, res) => {
    try {
        // التحقق من وجود التوكن في الهيدر
        const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ message: 'التوكن مطلوب للمصادقة.' });
        }

        // فك التوكن للحصول على البريد الإلكتروني للمرسل
        const decodedToken = jwt.verify(token,JWT_SECRET_KEY);
        const { email: senderEmail } = decodedToken;

        // تحقق من وجود البريد الإلكتروني في التوكن
        if (!senderEmail) {
            return res.status(401).json({ message: "التوكن لا يحتوي على بريد إلكتروني صالح" });
        }

        const { chatId } = req.params;

        // البحث عن المحادثة باستخدام chatId
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "المحادثة غير موجودة" });
        }

        // التحقق من أن المرسل هو أحد المشاركين في المحادثة
        const isParticipant = chat.participants.includes(senderEmail);
        if (!isParticipant) {
            return res.status(403).json({ message: "أنت لست من المشاركين في هذه المحادثة" });
        }

        // إرجاع تفاصيل المحادثة
        res.status(200).json({
            message: "تم العثور على المحادثة بنجاح",
            chatId: chat._id,
            participants: chat.participants,
            messages: chat.messages,
            createdAt: chat.createdAt,
        });

    } catch (error) {
        console.error("Error fetching chat:", error.message);
        res.status(500).json({ message: "حدث خطأ أثناء استرجاع المحادثة", error: error.message });
    }
};

  
  
  module.exports={ feedbacksystem,search,sendMessage,getonechat,
    toggleWorkStatus,creatReport,
    getLandsForGuarantor,updateWorkerProfile,
    notification,respondToRequest,
    announce,getLands,weathernotification,
    getAllAnnouncements,joinland,getChats}