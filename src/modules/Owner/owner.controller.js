require('dotenv').config(); // لتحميل المتغيرات من .env

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const {Owner,Worker,Token,Land} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
const axios=require('axios');

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
        if (useCurrentLocation) {
         
            const { latitude, longitude } =location;

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
          
        }
        else{
            if (!area || !description    || !streetName  || !town || !city || !workType) {
                return res.status(400).json({ message: 'All fields (area, description, location, workType) are required.' });
            } 
            try {
                const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // مفتاح Google Maps API
                const address = `${streetName}, ${town}, ${city},palestine`;
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
            status: 'Pending',
           googleMapsLink,
           formattedAddress
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

module.exports={getAllLands,updateLand,deleteLand,addLand,getLandbyid,updateOwnerProfile}