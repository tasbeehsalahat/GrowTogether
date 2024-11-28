const express = require('express');
const multer = require('multer');
const axios = require("axios");
const {Owner,Worker,Token,Land,works} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
const jwt = require('jsonwebtoken'); 
const { land } = require('../valdition/vald.js');

const router = express.Router();
router.post('/announcee', async (req, res) => {
    try {
        // Validate token
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

        console.log("Email:", email);
        console.log("Role:", role);

        // البحث عن العامل في قاعدة البيانات باستخدام البريد الإلكتروني
        const worker = await Worker.findOne({ email });
        if (!worker) {
            return res.status(404).json({ message: "Worker not found." });
        }

        // استخراج المهارات من العامل
        const { skills, contactNumber } = worker;
        console.log("Worker's Skills:", skills);
        console.log("Worker's Contact Number:", contactNumber);

        // استخراج البيانات من الـ request body
        const {
            tools,
            availableDays,
            hourlyRate,
            areas,
            street,
            city,
            state,
            country
        } = req.body;

        if (!tools || !availableDays || !hourlyRate || !areas || !street || !city || !state || !country) {
            return res.status(400).json({ message: 'All fields are required: tools, availableDays, hourlyRate, areas, street, city, state, country.' });
        }

        const address = `${street}, ${city}, ${state}, ${country}`;
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
            tools,
            availableDays,
            hourlyRate,
            areas,
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
});

module.exports = router;
