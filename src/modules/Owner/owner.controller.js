require('dotenv').config(); // لتحميل المتغيرات من .env
const cron = require('node-cron');

const multer = require('multer');
const jwt = require('jsonwebtoken'); 
const {Owner,Worker,OwnerFeedback,requests,WorkAnnouncement,DailyReport,Land,works} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
const axios=require('axios');
const nodemailer = require('nodemailer');

const keywords = {
    "حراثة": ["فلاحة", "حرث", "تقليب التربة", "إعداد الأرض"],
    "زراعة": ["غرس", "بذر", "زرع", "إنبات", "تشجير", "إنتاج محاصيل"],
    "ري": ["سقي", "ترطيب التربة", "تزويد بالماء", "توزيع مياه", "نظام الري"],
    "حصاد": ["جني", "جمع المحصول", "قطاف", "حصد", "قطع الثمار"],
    "تسميد": ["إضافة سماد", "تغذية التربة", "تحسين خصوبة التربة", "تقوية المحصول"],
    "مكافحة الآفات": ["رش مبيدات", "إبادة الحشرات", "مكافحة الأمراض", "إزالة الفطريات"],
    "تسوية الأرض": ["تمهيد الأرض", "تعديل التربة", "تجهيز الأرض", "تنظيم المساحات"],
    "إزالة الأعشاب الضارة": ["إزالة الحشائش", "تنظيف الأرض", "قص الأعشاب", "تنظيف التربة"],
    "إعداد البيوت البلاستيكية": ["بناء بيوت بلاستيكية", "إعداد محميات زراعية", "تركيب الغطاء البلاستيكي", "تجهيز الدفيئات"],
    "نقل المحاصيل": ["شحن المحصول", "تحميل المحاصيل", "توصيل الثمار", "نقل المنتجات الزراعية"]
};

// دالة لتحليل الوصف واستخراج الكلمات المفتاحية
const extractKeywords = (description) => {
    const foundKeywords = [];
    const normalizedDescription = description.toLowerCase();

    for (const [keyword, synonyms] of Object.entries(keywords)) {
        // التحقق من وجود الكلمة الأساسية أو أي من مرادفاتها
        const isKeywordPresent = synonyms.some(synonym => normalizedDescription.includes(synonym.toLowerCase()));
        if (isKeywordPresent || normalizedDescription.includes(keyword.toLowerCase())) {
            foundKeywords.push(keyword);
        }
    }

    return foundKeywords;
};
     

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // المجلد الذي سيتم تخزين الصور فيه
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // اسم الملف (وقت الرفع + الاسم الأصلي)
    },
});

const upload = multer({ storage });

const addLand = async (req, res) => {
    const token = req.header('authorization'); // استخراج التوكن من الهيدر

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can add land.' });
        }

        const owner = await Owner.findOne({ email });
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        // استخراج البيانات من الطلب
        const {
            area,
            streetName,
            description,
            city,
            workType,
            town,
            specificAreas,
            guaranteePrice,
            guaranteeDuration, // مدة الضمان
            guaranteePercentage, // نسبة الضمان
            location, // الموقع الحالي (اختياري)
            useCurrentLocation, // التشيك بوكس (True إذا تم تفعيله)
        } = req.body;

        // التحقق من الحقول بناءً على useCurrentLocation
        let lat, lng, formattedAddress, googleMapsLink;
        if (useCurrentLocation) {
            const { latitude, longitude } = location;
            // تحقق إذا كان الموقع قد تم إدخاله سابقًا
            const existingLand = await Land.findOne({ lat: latitude, lng: longitude });
            if (existingLand) {
                return res.status(400).json({ message: 'This location has already been entered.' });
            }
            try {
                const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // مفتاح Google Maps API
                const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
                const response = await axios.get(geocodeUrl);

                if (response.data.status !== "OK") {
                    return res.status(400).json({
                        message: "We can't find the site based on the provided location.",
                        error: response.data.error_message,
                    });
                }

                lat = latitude;
                lng = longitude;
                formattedAddress = response.data.results[0].formatted_address;
                googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
            } catch (error) {
                return res.status(500).json({ message: "Error retrieving location data.", error });
            }
        } else {
          
            try {
                const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // مفتاح Google Maps API
                const address = `${streetName}, ${town}, ${city},palestine`;
                const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
                const response = await axios.get(geocodeUrl);

                if (response.data.status !== "OK") {
                    return res.status(400).json({
                        message: "We can't find the site based on tkkkkkkkkkhe provided address.",
                        error: response.data.error_message,
                    });
                }

                lat = response.data.results[0].geometry.location.lat;
                lng = response.data.results[0].geometry.location.lng;
                formattedAddress = response.data.results[0].formatted_address;
                googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
            } catch (error) {
                return res.status(500).json({ message: "Error retrieving location data from address.", error });
            }
        }

        if (specificAreas >= area) {
            return res.status(400).json({ message: 'Specific areas must be less than the total area.' });
        }

        if (['زراعة', 'فلاحة', 'تشجير'].includes(workType)) {
            if (!guaranteePrice || !guaranteeDuration) {
                return res.status(400).json({
                    message: 'For work type "زراعة", guarantee price and guarantee duration are required.',
                });
            }
        }

        if (['تلقيط', 'حصاد'].includes(workType)) {
            if (!guaranteeDuration || !guaranteePercentage) {
                return res.status(400).json({
                    message: 'For work type "تلقيط" or "حصاد", guarantee duration and guarantee percentage are required.',
                });
            }
        }

        // إنشاء سجل جديد للأرض
        const newLand = new Land({
            ownerId: owner._id,
            ownerEmail: owner.email,
            contactNumber: owner.contactNumber,
            area,
            description,
            streetName,
            city,
            town,
            specificAreas,
            workType,
            guaranteePrice: guaranteePrice || null,
            guaranteeDuration: guaranteeDuration || null,
            guaranteePercentage: guaranteePercentage || null,
            temporaryOwnerEmail: null, // حقل البريد الإلكتروني للضامن
            guaranteeEndDate: null, // حقل نهاية فترة الضمان
            isguarntee: 'true',
            googleMapsLink,
            formattedAddress,
            advertisement: 'false',
            status: 'false',
            location: {
                latitude: lat,
                longitude: lng,
            },
        });

        // حفظ الأرض في قاعدة البيانات
        const savedLand = await newLand.save();

        return res.status(201).json({
            message: 'Land added successfully.',
            land: savedLand,
        });
    } catch (error) {
        console.error('Error adding land:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

cron.schedule('*/1 * * * *', async () => {
    console.log('Running automatic advertisement checkguarntee lands...');
    try {
        const landsToAdvertise = await Land.find({ status: 'false', advertisement: 'false' ,isguarntee:'true'});

        if (landsToAdvertise.length === 0) {
            console.log('No lands to advertise. All lands are already advertised.');
            return;
        }

        for (const land of landsToAdvertise) {
            // التحقق من وجود الحقل location
            if (!land.location || !land.location.latitude || !land.location.longitude) {
                console.log(`Land with ID ${land._id} is missing location data. Skipping...`);
                continue; // تجاوز الأرض التي تفتقد الحقل location
            }

            const creationTime = new Date(land.createdAt);
            const currentTime = new Date();

            // التحقق إذا مرت أكثر من 5 دقائق على إنشائها
            const elapsedTime = (currentTime - creationTime) / 1000 / 60; // الزمن بالدقائق
            if (elapsedTime >= 5) {
                land.advertisement = 'true';
                await land.save();
                console.log(`Land with ID ${land._id} has been advertised automatically.`);
            }
        }

    } catch (error) {
        console.error('Error in automatic advertisement:', error);
    }
});
const respondToGuaranteeRequest = async (req, res) => {
    try {
        console.log('Received request to respond to guarantee request.');

        // استخرج التوكن من الهيدر
        const token = req.header('authorization');
        if (!token) {
            console.log('No token provided.');
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        // فك تشفير التوكن والتحقق منه
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can respond to guarantee requests.' });
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

        // تحقق من أن الطلب مرتبط بالبريد الإلكتروني لصاحب الأرض
        const { landId } = request;
        if (!landId) {
            return res.status(400).json({ message: 'Land ID is missing in the request.' });
        }

        const land = await Land.findById(landId);
        if (!land) {
            return res.status(404).json({ message: 'Land not found.' });
        }

        if (land.ownerEmail !== email) {
            return res.status(403).json({ message: 'Access denied. This land does not belong to you.' });
        }

        // تحديث حالة الطلب بناءً على القرار
        request.status = status === 'accept' ? 'Accepted' : 'Rejected';
        request.ownerResponse = status === 'accept' ? 'Approved' : 'Rejected';

        // تحديث حالة الأرض إذا تم قبول الطلب
        if (status === 'accept') {
            if (!land.isguarntee) {
                return res.status(400).json({ message: 'This land is not marked for guarantee.' });
            }

            const guaranteeEndDate = new Date();
            const guaranteeDuration = land.guaranteeDuration;

            if (!guaranteeDuration) {
                return res.status(400).json({ message: 'Guarantee duration is missing for this land.' });
            }

            const durationParts = guaranteeDuration.split(' ');
            const durationValue = parseInt(durationParts[0]);
            const durationUnit = durationParts[1]?.toLowerCase();

            if (isNaN(durationValue) || !['month', 'أشهر', 'months', 'year', 'years'].includes(durationUnit)) {
                return res.status(400).json({ message: 'Invalid guarantee duration format.' });
            }

            if (durationUnit.includes('month')) {
                guaranteeEndDate.setMonth(guaranteeEndDate.getMonth() + durationValue);
            } else if (durationUnit.includes('year')) {
                guaranteeEndDate.setFullYear(guaranteeEndDate.getFullYear() + durationValue);
            }

            // تحديث الأرض
            land.temporaryOwnerEmail = request.workerEmail; // تعيين العامل كمالك مؤقت
            land.guaranteeEndDate = guaranteeEndDate; // تحديد تاريخ انتهاء الضمان
            land.status = true;
            land.advertisement = false;
        }

        // حفظ الطلب المحدث
        await request.save();
        // حفظ تحديث الأرض إذا لزم
        await land.save();

        // إرجاع استجابة مع الحالة الجديدة
        return res.status(200).json({
            message: `Guarantee request ${status}ed successfully.`,
            request: request,
        });
    } catch (error) {
        console.error('Error responding to guarantee request:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
};


const getAllLands = async (req, res) => {
    const token = req.header('authorization');

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can view their lands.' });
        }

        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        const lands = await Land.find({ ownerId: owner._id });
        if (lands.length === 0) {
            return res.status(404).json({ message: 'No lands found for this owner.' });
        }
        return res.status(200).json({
            message: 'Lands retrieved successfully.',
            lands,
        });
    } catch (error) {
        console.error('Error fetching lands:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const updateLand = async (req, res) => {
    const token = req.header('authorization'); // استخراج التوكن من الهيدر

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can update their lands.' });
        }

        const owner = await Owner.findOne({ email });
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        let { landId } = req.params;
        landId = landId.replace(/^:/, '');  // إزالة الكولون إذا كان في البداية

        const land = await Land.findOne({ _id: landId, ownerId: owner._id });
        if (!land) {
            return res.status(404).json({ message: 'Land not found or does not belong to the owner.' });
        }

        // استخراج البيانات من الجسم (Body) للتعديل
        const { area, streetName, description, city, town, specificAreas, workType } = req.body;

        const updatedData = {}; // كائن لتخزين البيانات المحدثة

        // تحديث فقط الحقول الموجودة في الجسم (Body)
        if (area) updatedData.area = area;

        if (streetName || city || town) {
            try {
                // تحديث الـ streetName، city، town إذا تم إرسالهم
                updatedData.streetName = streetName;
                updatedData.city = city;
                updatedData.town = town;

                const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // مفتاح Google Maps API
                const address = `${streetName || ''}, ${town || ''}, ${city || ''}, palestine`; // إنشاء العنوان الذي سيتم البحث عنه

                // إرسال طلب لـ Google Maps API
                const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
                const response = await axios.get(geocodeUrl);

                // التحقق من حالة الاستجابة
                if (response.data.status !== "OK") {
                    return res.status(400).json({
                        message: "We can't find the site based on the provided address.",
                        error: response.data.error_message
                    });
                }

                // استخراج الإحداثيات والبيانات
                const lat = response.data.results[0].geometry.location.lat;
                const lng = response.data.results[0].geometry.location.lng;
                const formattedAddress = response.data.results[0].formatted_address;
                const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

                // إضافة العنوان الكامل ورابط Google Maps
                updatedData.formattedAddress = formattedAddress;
                updatedData.googleMapsLink = googleMapsLink;

            } catch (error) {
                return res.status(500).json({ message: "Error retrieving location data from address.", error: error.message });
            }
        }

        if (description) updatedData.description = description;
        if (specificAreas) updatedData.specificAreas = specificAreas;
        if (workType) updatedData.workType = workType;

        // تحديث البيانات في قاعدة البيانات
        const updatedLand = await Land.findByIdAndUpdate(
            landId,
            updatedData,
            { new: true } // Return the updated land object
        );

        return res.status(200).json({
            message: 'Land updated successfully.',
            land: updatedLand,
        });

    } catch (error) {
        return res.status(500).json({ message: "An error occurred while updating the land.", error: error.message });
    }
};
  
const deleteLand = async (req, res) => {
    const token = req.header('authorization'); // استخراج التوكن من الهيدر

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // فك تشفير التوكن
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can delete their lands.' });
        }

        // العثور على المالك بناءً على الإيميل
        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        // استخراج معرف الأرض من body
        let { landid } = req.params; 
        if (!landid) {
            return res.status(400).json({ message: 'Land ID is required.' });
        }

        // إزالة النقطتين من بداية الـ landid
        landid = landid.replace(/^:/, '');  // هذه الدالة ستزيل النقطتين في حال كانت في بداية المعرف

        // العثور على الأرض والتأكد من أنها مملوكة لهذا المالك
        const land = await Land.findOne({ _id: landid, ownerId: owner._id });

        if (!land) {
            return res.status(404).json({ message: 'Land not found or does not belong to the owner.' });
        }

        // حذف الأرض
        await Land.findByIdAndDelete(landid);

        return res.status(200).json({
            message: 'Land deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting land:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const getLandbyid = async (req, res) => {
    const token = req.header('authorization'); // استخراج التوكن من الهيدر

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // فك تشفير التوكن
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can delete their lands.' });
        }

        // العثور على المالك بناءً على الإيميل
        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        // استخراج معرف الأرض من body
        let { landid } = req.params; 
        if (!landid) {
            return res.status(400).json({ message: 'Land ID is required.' });
        }

        // إزالة النقطتين من بداية الـ landid
        landid = landid.replace(/^:/, '');  // هذه الدالة ستزيل النقطتين في حال كانت في بداية المعرف

        // العثور على الأرض والتأكد من أنها مملوكة لهذا المالك
        const land = await Land.findOne({ _id: landid, ownerId: owner._id });

        if (!land) {
            return res.status(404).json({ message: 'Land not found or does not belong to the owner.' });
        }

        return res.status(200).json(land);
    } catch (error) {
        console.error('Error fetching land:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const updateOwnerProfile = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Please enter what you want to update' });
        }

        const updates = req.body; 
        let email = req.params.email.trim();  // إزالة المسافات الزائدة
        email = email.replace(":", "");  

        if (req.user.email !== email || req.user.role !== 'Owner') {
            return res.status(403).json({ message: 'You can only update your own profile as an Owner.' });
        }

        console.log('Updating profile for Owner:', email);

        // Validate the updates for Owner
        const validation = validateProfileUpdate(updates, 'Owner');
        if (validation.error) {
            return res.status(400).json({ message: validation.error });
        }

        const updatedProfile = validation.value;

        // Find and update the Owner profile in the database
        const updatedOwner = await Owner.findOneAndUpdate(
            { email },
            { $set: updatedProfile },
            { new: true }  // Return the updated document
        );

        if (!updatedOwner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        return res.status(200).json({
            message: 'Owner profile updated successfully.',
            updatedOwner
        });
    } catch (error) {
        console.error('Error updating Owner profile:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const getLandAdvertisement = async (req, res) => {
    try {
        // البحث عن جميع الأراضي التي تم الإعلان عنها
        const advertisedLands = await Land.find({ advertisement: 'true' });

        // التحقق إذا لم يكن هناك أراضٍ معلنة
        if (advertisedLands.length === 0) {
            return res.status(404).json({ message: 'No advertised lands found.' });
        }

        // إرسال قائمة الأراضي المعلنة
        res.status(200).json({
            message: 'Advertised lands retrieved successfully.',
            lands: advertisedLands,
        });
    } catch (error) {
        console.error('Error fetching advertised lands:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
const addLanddaily = async (req, res) => {
    const token = req.header('authorization'); // استخراج التوكن من الهيدر

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can add land.' });
        }

        const owner = await Owner.findOne({ email });
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        // استخراج البيانات من الطلب
        const {
            area,
            streetName,
            description,
            city,
            workType,
            town,
            specificAreas,
            location, // الموقع الحالي (اختياري)
            useCurrentLocation, // التشيك بوكس (True إذا تم تفعيله)
        } = req.body;

        // التحقق من الحقول بناءً على useCurrentLocation
        let lat, lng, formattedAddress, googleMapsLink;

        if (useCurrentLocation) {
            const { latitude, longitude } = location;
  // تحقق إذا كان الموقع قد تم إدخاله سابقًا
  const existingLand = await Land.findOne({ lat: latitude, lng: longitude });
  if (existingLand) {
      return res.status(400).json({ message: 'This location has already been entered.' });
  }
            try {
                const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // مفتاح Google Maps API
                const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
                const response = await axios.get(geocodeUrl);
        
                if (response.data.status !== "OK") {
                    return res.status(400).json({ 
                        message: "We can't find the site based on the provided location.", 
                        error: response.data.error_message 
                    });
                }
        
                lat = latitude;
                lng = longitude;
                formattedAddress = response.data.results[0].formatted_address;
                googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
            } catch (error) {
                return res.status(500).json({ message: "Error retrieving location data.", error });
            }
        } else {
            if (!area || !description || !streetName || !city || !workType) {
                return res.status(400).json({ message: 'All fields (area, description, location, workType) are required.' });
            }

            try {
                const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // مفتاح Google Maps API
                const address = `${streetName}, ${town}, ${city}, palestine`;
                const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
                const response = await axios.get(geocodeUrl);
        
                if (response.data.status !== "OK") {
                    return res.status(400).json({ 
                        message: "We can't find the site based on the provided address.", 
                        error: response.data.error_message 
                    });
                }
        
                lat = response.data.results[0].geometry.location.lat;
                lng = response.data.results[0].geometry.location.lng;
                formattedAddress = response.data.results[0].formatted_address;
                googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
            } catch (error) {
                return res.status(500).json({ message: "Error retrieving location data from address.", error });
            }
        }

        if (specificAreas >= area) {
            return res.status(400).json({ message: 'Specific areas must be less than the total area.' });
        }

        // إنشاء سجل جديد للأرض
        const newLand = new Land({
            ownerId: owner._id,
            ownerEmail: owner.email,
            contactNumber: owner.contactNumber,
            area,
            description,
            streetName,
            city,
            town,
            specificAreas,
            workType,
            googleMapsLink,
            formattedAddress,
            advertisement: 'false', 
              location: {
                latitude: lat, // يتم تخزين خط العرض المستخرج تلقائيًا
                longitude: lng, // يتم تخزين خط الطول المستخرج تلقائيًا
            },
       
        });

        // حفظ الأرض في قاعدة البيانات
        const savedLand = await newLand.save();

        return res.status(201).json({
            message: 'Land added successfully.',
            land: savedLand,
        });
    } catch (error) {
        console.error('Error adding land:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const getguarntors = async (req, res) => {
    try { const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        // فك تشفير التوكن والتحقق منه
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;
        console.log("Email from token:", email);

        // استخراج معرف الأرض من params
        let { landid } = req.params;
        if (!landid) {
            return res.status(400).json({ message: 'Land ID is required.' });
        }
        landid = landid.replace(/^:/, '');

        // البحث عن الأرض باستخدام landid
        const land = await Land.findById(landid);
        if (!land) {
            return res.status(404).json({ message: 'Land not found.' });
        }

        // التحقق إذا كان المستخدم مالكاً أو البريد الإلكتروني يطابق temporaryOwnerEmail
        if (!(role === 'Owner' || email === land.temporaryOwnerEmail)) {
            return res.status(403).json({ message: 'Access denied. Only Owners or temporary owners can access this data.' });
        }

        const { city, town, isguarntee, streetName } = land;

        if (!city || !town || !streetName) {
            return res.status(400).json({ message: 'Land city, town, and street name are required.' });
        }

        let workers;
        if (isguarntee) {
            // البحث باستخدام اسم الشارع
            workers = await works.find({
                areas: { $regex: streetName, $options: 'i' },
                isGuarantor: true, // إضافة الشرط مباشرة
            });

            // البحث باستخدام البلدة إذا لم يتم العثور على عمال
            if (workers.length === 0) {
                workers = await works.find({
                    areas: { $regex: town, $options: 'i' },
                    isGuarantor: true,
                });
            }

            // البحث باستخدام المدينة إذا لم يتم العثور على عمال
            if (workers.length === 0) {
                workers = await works.find({
                    areas: { $regex: city, $options: 'i' },
                    isGuarantor: true,
                });
            }

            // البحث باستخدام عدة شروط (الشارع، البلدة، المدينة)
            if (workers.length === 0) {
                workers = await works.find({
                    $or: [
                        { areas: { $regex: streetName, $options: 'i' } },
                        { areas: { $regex: town, $options: 'i' } },
                        { areas: { $regex: city, $options: 'i' } },
                    ],
                    isGuarantor: true,
                });
            }

            if (workers.length === 0) {
                return res.status(404).json({ message: 'No workers found for this land.' });
            }

            return res.status(200).json(workers);
        }

        // في حالة الأرض ليست مضمونة
        workers = await works.find({
            areas: { $regex: streetName, $options: 'i' },
        });

        // البحث باستخدام البلدة إذا لم يتم العثور على عمال
        if (workers.length === 0) {
            workers = await works.find({
                areas: { $regex: town, $options: 'i' },
            });
        }

        // البحث باستخدام المدينة إذا لم يتم العثور على عمال
        if (workers.length === 0) {
            workers = await works.find({
                areas: { $regex: city, $options: 'i' },
            });
        }

        // البحث باستخدام عدة شروط (الشارع، البلدة، المدينة)
        if (workers.length === 0) {
            workers = await works.find({
                $or: [
                    { areas: { $regex: streetName, $options: 'i' } },
                    { areas: { $regex: town, $options: 'i' } },
                    { areas: { $regex: city, $options: 'i' } },
                ],
            });
        }

        if (workers.length === 0) {
            return res.status(404).json({ message: 'No workers found for this land.' });
        }

        return res.status(200).json(workers);
    } catch (error) {
        console.error('Error retrieving workers:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
};
const createRequest = async (req, res) => {
    try {
        // استخراج التوكن من الهيدر
        const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        // فك تشفير التوكن والتحقق منه
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        // استخراج landId و workerEmail من الرابط
        let { landId, workerEmail } = req.params;
        landId = landId.replace(/^:/, ''); // إزالة النقطتين في بداية المعرف
        workerEmail = workerEmail.replace(/^:/, ''); // إزالة النقطتين في بداية البريد الإلكتروني

        // العثور على الأرض بناءً على landId
        const land = await Land.findOne({ _id: landId });

        console.log(`Land ID: ${landId}, Worker Email: ${workerEmail}`);

        if (!email) {
            return res.status(400).json({ message: 'Owner email is missing in the token.' });
        }

        // التحقق من صلاحية الأونر (المالك الأصلي أو الضامن المؤقت)
        if (!(role === 'Owner' || email === land.temporaryOwnerEmail)) {
            return res.status(403).json({ message: 'Access denied. Only Owners or temporary owners can access this data.' });
        }

        // التحقق من وجود landId و workerEmail
        if (!landId || !workerEmail) {
            return res.status(400).json({ message: 'Land ID and Worker Email are required in the URL.' });
        }

        // التحقق من وجود الأرض
        if (!land) {
            return res.status(404).json({ message: 'Land not found.' });
        }

        // التحقق إذا كان الأرض تعود للأونر الأصلي أو الضامن المؤقت
        if (land.ownerEmail !== email && land.temporaryOwnerEmail !== email) {
            return res.status(403).json({ message: 'Access denied. This land does not belong to you or you are not the temporary owner.' });
        }

        // التحقق من وجود العامل
        const worker = await works.findOne({ email: workerEmail });
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found.' });
        }

        // إنشاء الطلب
        const newRequest = new requests({
            landId,
            workerEmail, // حفظ الإيميل الخاص بالعامل
            ownerId: worker._id,  // سيتم تعيين معرّف العامل هنا كمالك (أو الشخص الذي يرسل الطلب)
            owneremail: email, // تعيين الإيميل الخاص بالمالك أو الضامن
            status: 'Pending'
        });

        await newRequest.save();

        // إرسال الرد
        return res.status(201).json({
            message: 'Request sent successfully.',
            request: {
                _id: newRequest._id,
                landId: newRequest.landId,
                workerEmail: newRequest.workerEmail, // الإيميل الخاص بالعامل
                ownerId: newRequest.ownerId,
                owneremail: newRequest.owneremail, // الإيميل الخاص بالمالك أو الضامن
                status: 'Pending',
            },
        });
    } catch (error) {
        console.error('Error creating request:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
};



const calculateWorkersForLand = async (req, res) => {
    try {
        const token = req.header('authorization'); // استخراج التوكن من الهيدر

        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // فك تشفير التوكن
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can access this data.' });
        }

        // العثور على المالك بناءً على الإيميل
        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        // استخراج معرف الأرض من params
        let { landid } = req.params; 

        if (!landid) {
            return res.status(400).json({ message: 'Land ID is required.' });
        }
        landid = landid.replace(/^:/, '');

        const land = await Land.findOne({ _id: landid, ownerId: owner._id });

        if (!land) {
            return res.status(404).json({ message: 'Land not found or does not belong to the owner.' });
        }

        let workersPerArea = 0;
        const area = land.area; // المساحة المطلوبة
        const workType = land.workType; // نوع العمل

        // تحديد الأدوات والمواد اللازمة لكل نوع عمل
        let toolsAndMaterials = '';
        let workDuration = ''; // الوقت التقديري
        let costEstimate = 0; // التكلفة التقديرية

        switch (workType) {
            case 'زراعة':
                workersPerArea = 1 / 50; // 1 عامل لكل 50 متر مربع
                toolsAndMaterials = 'أدوات الزراعة، بذور، أسمدة';
                workDuration = 'من 1 إلى 2 أسبوع حسب المساحة';
                costEstimate = area * 5; // تكلفة تقديرية لكل متر مربع (مثال)
                break;
            case 'فلاحة':
                workersPerArea = 1 / 60; // 1 عامل لكل 60 متر مربع
                toolsAndMaterials = 'محاريث، آلات فلاحة';
                workDuration = 'من 3 إلى 4 أيام';
                costEstimate = area * 4; // تكلفة تقديرية
                break;
            case 'تشجير':
                workersPerArea = 1 / 70; // 1 عامل لكل 70 متر مربع
                toolsAndMaterials = 'شجيرات، أدوات حفر';
                workDuration = 'من 1 إلى 3 أسابيع';
                costEstimate = area * 8; // تكلفة تقديرية
                break;
            case 'تلقيط':
                workersPerArea = 1 / 30; // 1 عامل لكل 30 متر مربع
                toolsAndMaterials = 'سلال، معدات جمع';
                workDuration = 'من 2 إلى 3 أيام';
                costEstimate = area * 2; // تكلفة تقديرية
                break;
            case 'حصاد':
                workersPerArea = 1 / 40; // 1 عامل لكل 40 متر مربع
                toolsAndMaterials = 'معدات حصاد، أكياس';
                workDuration = 'من 1 إلى 2 أسبوع';
                costEstimate = area * 6; // تكلفة تقديرية
                break;
            case 'حراثة':
                workersPerArea = 1 / 100; // 1 عامل لكل 100 متر مربع
                toolsAndMaterials = 'محاريث، آلات حراثة';
                workDuration = 'من 4 إلى 6 أيام';
                costEstimate = area * 3; // تكلفة تقديرية
                break;
            case 'تسميد':
                workersPerArea = 1 / 100; // 1 عامل لكل 100 متر مربع
                toolsAndMaterials = 'أسمدة، أدوات توزيع';
                workDuration = 'من 2 إلى 3 أيام';
                costEstimate = area * 2; // تكلفة تقديرية
                break;
            case 'رش مبيدات حشرية':
                workersPerArea = 1 / 50; // 1 عامل لكل 50 متر مربع
                toolsAndMaterials = 'مبيدات حشرية، آلات رش';
                workDuration = 'من 1 إلى 2 يوم';
                costEstimate = area * 5; // تكلفة تقديرية
                break;
            case 'اعداد بيوت بلاستيكية':
                workersPerArea = 1 / 20; // 1 عامل لكل 20 متر مربع
                toolsAndMaterials = 'أغطية بلاستيكية، أدوات تثبيت';
                workDuration = 'من 5 إلى 7 أيام';
                costEstimate = area * 10; // تكلفة تقديرية
                break;
            case 'نقل محاصيل':
                workersPerArea = 1 / 40; // 1 عامل لكل 40 متر مربع
                toolsAndMaterials = 'أدوات نقل، صناديق';
                workDuration = 'من 3 إلى 5 أيام';
                costEstimate = area * 7; // تكلفة تقديرية
                break;
            default:
                return res.status(400).json({ message: 'Invalid work type.' });
        }

        // حساب عدد العمال بناءً على المساحة
        const requiredWorkers = Math.ceil(area * workersPerArea);

        // التحليل النهائي
        const landAnalysis = {
            requiredWorkers,
            workType,
            toolsAndMaterials,
            workDuration,
            costEstimate,
            area
        };

        return res.status(200).json(landAnalysis);

    } catch (error) {
        console.error('Error calculating workers:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
};


const createWorkAnnouncement = async (req, res) => {
    try {
        const token = req.header('authorization'); // استخراج التوكن من الهيدر

        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required.' });
        }

        const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // فك تشفير التوكن
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can access this data.' });
        }

        // العثور على المالك بناءً على الإيميل
        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        // استخراج معرف الأرض من params
        let { landid } = req.params; 

        if (!landid) {
            return res.status(400).json({ message: 'Land ID is required.' });
        }

        // إزالة النقطتين من بداية landid (في حال كانت موجودة)
        landid = landid.replace(/^:/, '');

        // العثور على الأرض والتأكد من أنها مملوكة لهذا المالك
        const land = await Land.findOne({ _id: landid, ownerId: owner._id });

        if (!land) {
            return res.status(404).json({ message: 'Land not found or does not belong to the owner.' });
        }

        // فحص ما إذا كانت الأرض قد تم الإعلان عنها سابقًا
        const existingAnnouncement = await WorkAnnouncement.findOne({ landid });

        if (existingAnnouncement) {
            return res.status(400).json({ message: 'This land has already been announced.' });
        }
        const { numberOfWorkers, startTime, endTime, startDate, endDate, dailyRate } = req.body;

        // التأكد من وجود الحقول المطلوبة
        if (!numberOfWorkers || !startTime || !endTime || !startDate || !endDate || !dailyRate) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // إنشاء إعلان العمل المرتبط بالأرض
        const workAnnouncement = new WorkAnnouncement({
            landid,
            numberOfWorkers,
            startTime,
            endTime,
            startDate,
            endDate,
            dailyRate,
            workType: land.workType, // نوع العمل من الأرض
            location: land.location, // الموقع
            formattedAddress: land.formattedAddress,
            googleMapsLink: land.googleMapsLink
        });

        // حفظ الإعلان في قاعدة البيانات
        await workAnnouncement.save();

        return res.status(201).json({
            message: 'Work announcement created successfully.',
            workAnnouncement: workAnnouncement
        });

    } catch (error) {
        console.error('Error creating work announcement:', error);
        return res.status(500).json({ message: 'Server error occurred.' });
    }
};

const showLand = async (req, res) => {
    const token = req.header('authorization'); // استخراج التوكن من الهيدر

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        // فك تشفير التوكن
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        // التأكد من أن الدور هو "Owner"
        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can view their lands.' });
        }

        // العثور على الأراضي التي تخص هذا المالك بناءً على الإيميل
        const lands = await Land.find({ email: email });

        // التأكد من وجود أراضي
        if (!lands || lands.length === 0) {
            return res.status(404).json({ message: 'No lands found for this owner.' });
        }

        // إعادة عرض الأراضي مع التفاصيل المطلوبة فقط (مثل اسم الأرض، الموقع، إلخ)
        const landDetails = lands.map(land => ({
            landName: land.name,    // اسم الأرض
            location: land.location, // الموقع
            landLink: land.link     // رابط الموقع (يمكن تعديل ذلك بناءً على هيكل بياناتك)
        }));

        return res.status(200).json({ lands: landDetails });

    } catch (err) {
        console.error('Error while processing the request:', err);
        return res.status(500).json({ message: 'An error occurred while fetching lands.' });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tasbeehsa80@gmail.com', // بريدك الإلكتروني
        pass: 'yeaf tcnf prlj kzlj'    // كلمة المرور أو كلمة مرور التطبيق
    }
});
cron.schedule('*/1 * * * *', async () => {
    console.log('Running automatic advertisement check...');
    try {
        // العثور على الأراضي التي تحتاج إلى إعلان
        const landsToAdvertise = await Land.find({ isguarntee: 'false', advertisement: 'false' });

        if (landsToAdvertise.length === 0) {
            console.log('No lands to advertise. All lands are already advertisednormallly.');
            return;
        }

        for (const land of landsToAdvertise) {
            // التحقق من وجود الحقل location
            if (!land.location || !land.location.latitude || !land.location.longitude) {
                console.log(`Land with ID ${land._id} is missing location data. Skipping...`);
                continue; // تجاوز الأرض التي تفتقد الحقل location
            }
            if (land.isguarntee) {
                console.log(`Land with ID ${land._id} is guaranteed. Skipping...`);
                continue; // إذا كانت الأرض مضمونة، لا يتم الإعلان عنها
            }

            // التحقق إذا مرت أكثر من 5 دقائق على إنشائها
            const currentTime = new Date();
            const creationTime = new Date(land.creationDate); // assuming `creationDate` exists
            const elapsedTime = (currentTime - creationTime) / 1000 / 60; // الزمن بالدقائق
            if (elapsedTime < 5) {
                console.log(`Land with ID ${land._id} has not passed 5 minutes since creation. Skipping...`);
                continue; // إذا لم تمر 5 دقائق على إنشاء الأرض
            }

            // العثور على صاحب الأرض بناءً على معرّف المالك
            const owner = await Owner.findById(land.ownerId);
            if (!owner) {
                console.log(`Owner not found for land with ID ${land._id}. Skipping email.`);
                continue; // إذا لم يتم العثور على المالك
            }

           // حساب عدد العمال بناءً على نوع العمل والمساحة
let workersPerArea = 0;
switch (land.workType) {
    case 'زراعة':
        workersPerArea = 1 / 50; // 1 عامل لكل 50 متر مربع
        break;
    case 'فلاحة':
        workersPerArea = 1 / 60; // 1 عامل لكل 60 متر مربع
        break;
    case 'تشجير':
        workersPerArea = 1 / 70; // 1 عامل لكل 70 متر مربع
        break;
    case 'تلقيط':
        workersPerArea = 1 / 30; // 1 عامل لكل 30 متر مربع
        break;
    case 'حصاد':
        workersPerArea = 1 / 40; // 1 عامل لكل 40 متر مربع
        break;
    case 'حراثة':
        workersPerArea = 1 / 100; // 1 عامل لكل 100 متر مربع
        break;
    case 'تسميد':
        workersPerArea = 1 / 100; // 1 عامل لكل 100 متر مربع
        break;
    case 'رش مبيدات حشرية':
        workersPerArea = 1 / 50; // 1 عامل لكل 50 متر مربع
        break;
    case 'اعداد بيوت بلاستيكية':
        workersPerArea = 1 / 20; // 1 عامل لكل 20 متر مربع
        break;
    case 'نقل محاصيل':
        workersPerArea = 1 / 40; // 1 عامل لكل 40 متر مربع
        break;
    default:
        return res.status(400).json({ message: 'Invalid work type.' });
}

// حساب عدد العمال بناءً على المساحة
const numberOfWorkers = Math.max(1, Math.ceil(land.area * workersPerArea)); // لا يجب أن يكون العدد أقل من 1


            // تحديد تواريخ العمل والأجرة اليومية
            const suggestedStartDate = new Date();
            suggestedStartDate.setDate(suggestedStartDate.getDate() + 2); // بدء العمل بعد يومين (اقتراح)
            const suggestedEndDate = new Date(suggestedStartDate);
            suggestedEndDate.setDate(suggestedStartDate.getDate() + 5); // الانتهاء بعد 5 أيام من بدء العمل

            const dailyRate = land.workType === 'زراعة' ? 50 : land.workType === 'Construction' ? 80 : 60; // تحديد الأجرة اليومية بناءً على نوع العمل

            // تحديد ساعات العمل بناءً على نوع العمل
            const workHours = {
                'زراعة': { start: '7:00 AM', end: '3:00 PM' },   // ساعات العمل للزراعة
                'Construction': { start: '8:00 AM', end: '6:00 PM' },  // ساعات العمل للبناء
                'Maintenance': { start: '9:00 AM', end: '5:00 PM' },   // ساعات العمل للصيانة
            };

            const suggestedWorkHours = workHours[land.workType] || { start: '8:00 AM', end: '4:00 PM' }; // إذا لم يكن النوع موجودًا، اختر 8 AM - 4 PM

            // صيغة الاقتراح لإرسالها عبر البريد
            const proposalText = `
                مرحبًا ${owner.email} ،\n\n
                نحن نقترح إعلانًا للعمل على الأرض الخاصة بك.\n
                نوع العمل: ${land.workType}\n
                عدد العمال المقترح: ${numberOfWorkers} عامل\n
                تاريخ بدء العمل: ${suggestedStartDate.toDateString()}\n
                تاريخ انتهاء العمل: ${suggestedEndDate.toDateString()}\n
                الأجرة اليومية المقترحة: ${dailyRate} دولار\n
                ساعات العمل المقترحة: من ${suggestedWorkHours.start} إلى ${suggestedWorkHours.end}\n\n
                يرجى مراجعة الاقتراح وإعلامنا إذا كنت توافق أو ترغب في إجراء تعديلات.\n
                إذا كنت ترغب في قبول الاقتراح، يمكننا المتابعة لإتمام العملية.\n\n
                شكرًا لك.\n
                فريق إدارة الأراضي
            `;

            // إعدادات البريد الإلكتروني
            const mailOptions = {
                from: 'tasbeehsa80@gmail.com',
                to: owner.email,              // إرسال الإيميل إلى مالك الأرض
                subject: 'Work Announcement Proposal',
                text: proposalText
            };

            // إرسال البريد الإلكتروني
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                    return;
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    } catch (error) {
        console.error('Error in automatic advertisement:', error);
    }
});
const pending=async (req,res)=>{

}

const feedback= async (req, res) => {
    const { report_id } = req.params; // معرف التقرير
    const { feedback } = req.body; // محتوى الملاحظة
    
    try {
        const token = req.header('authorization'); // استخراج التوكن من الهيدر
        if (!token) {
            return res.status(401).json({ message: 'التوكن مطلوب للمصادقة.' }); // خطأ إذا لم يتم تقديم التوكن
        }
      
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // التحقق من صحة التوكن
        const { email: user_email } = decodedToken; // استخراج البريد الإلكتروني من التوكن
      
        // التحقق من أن المستخدم هو صاحب الأرض
        const report = await DailyReport.findById(report_id);
        if (!report || report.owner_email !== user_email) {
            return res.status(403).json({ message: 'ليس لديك صلاحية لإضافة الملاحظات لهذا التقرير.' });
        }
      
        const newFeedback = new OwnerFeedback({
            report_id,
            feedback,
            status: 'Pending', // تعيين الحالة الافتراضية عند إنشاء الملاحظة
            
            owner_email: user_email, // إضافة البريد الإلكتروني المستخرج من التوكن

        }); // إنشاء ملاحظة جديدة
      
          
        await newFeedback.save(); // حفظ الملاحظة في قاعدة البيانات
  
        // تحديث حالة التقرير
        report.status = 'مراجعة صاحب الأرض';
        await report.save();
  
        res.status(201).json({
            message: 'تم إضافة الملاحظة بنجاح',
            feedback: newFeedback,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ أثناء إضافة الملاحظة', error: error.message });
    }
};


  
module.exports={feedback,createRequest,pending,
    showLand ,createWorkAnnouncement
    ,calculateWorkersForLand,getAllLands,
    getguarntors, addLanddaily,updateLand,
    deleteLand,addLand,getLandbyid,respondToGuaranteeRequest,
    updateOwnerProfile,getLandAdvertisement}