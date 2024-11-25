const express = require('express');
const multer = require('multer');
const axios = require("axios");
const {Owner,Worker,Token,Land,works} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
const jwt = require('jsonwebtoken'); 

const router = express.Router();

router.post("/add-land", async (req, res) => {
    try {
            // Validate token
            const token = req.header("authorization");
            if (!token) {
                return res.status(401).json({ message: "Authentication token is required." });
            }
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
    
            if (role !== "Owner") {
                return res.status(403).json({ message: "Access denied. Only Owners can add land." });
            }
    
            const owner = await Owner.findOne({ email });
            if (!owner) {
                return res.status(404).json({ message: "Owner not found." });
            }
    
        const {  area, status, streetName, city, soilType, town ,specificArea} = req.body;

        if (!streetName || !city   || !area  || !soilType) {
            return res.status(400).json({
                message: "All fields are required: street, city, state, area, perimeter, soilType.",
            });
        }

        const address = `${streetName}, ${town}, ${city}, Palestine`;
                console.log(address);
             const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // ضع مفتاح API هنا
        const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await axios.get(geocodeUrl);
        axios.get(geocodeUrl)
       
if (response.data.status !== "OK") {
    return res.status(400).json({ message: "we can't find the site", error: response.data.error_message });
}

const { lat, lng } = response.data.results[0].geometry.location;
const formattedAddress = response.data.results[0].formatted_address;
const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
const newLand = new Land({
    ownerId: owner._id, // Link the land to the owner's ID
    ownerEmail: email, // Save the owner's email
    area,
    specificArea,
    coordinates: [{ x: lat, y: lng }],
    soilType,
    status: status || "Available", // Default to "Available" if status is not provided
    formattedAddress,
});
await newLand.save();

 res.status(200).json({
    message: 'success adding the land',
    data: {
       
        googleMapsLink: googleMapsLink
    }
});
} catch (error) {
console.error('Error adding land:', error);
res.status(500).json({ message: 'error ocurred' });
}
});
router.post('/announcee', async (req, res) => {
    try {
        // Validate token
        const token = req.header("authorization");
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required." });
        }

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

        // Check if the user is a worker
        if (role !== "Worker") {
            return res.status(403).json({ message: "Access denied. Only Workers can announce jobs." });
        }

        // Verify that the worker exists in the database
        const worker = await Worker.findOne({ email }); 
        if (!worker) {
            return res.status(404).json({ message: "Worker not found." });
        }

        const {
            skills,
            tools,
            availableDays,
            hourlyRate,
            areas,
            street,
            city,
            state,
            country,
            email: workerEmail,
            phone
        } = req.body;

        // Validate required fields
        if (!skills || !tools || !availableDays || !hourlyRate || !areas || !street || !city || !state || !country || !workerEmail || !phone) {
            return res.status(400).json({ message: 'All fields are required: skills, tools, availableDays, hourlyRate, areas, street, city, state, country, email, phone.' });
        }

        // Build the full address
        const address = `${street}, ${city}, ${state}, ${country}`;
        const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // ضع مفتاح API هنا
        const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await axios.get(geocodeUrl);

        if (response.data.status !== "OK") {
            return res.status(400).json({ message: "Unable to find location.", error: response.data.error_message });
        }

        const { lat, lng } = response.data.results[0].geometry.location;
        const formattedAddress = response.data.results[0].formatted_address;
        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

        // Prepare the new Work document
        const newWork = new works({
            skills,
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
            email: workerEmail,
            phone
        });

        // Save to the database
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

router.post('/announcework', async (req, res) => {
    try {
        // Validate token
        const token = req.header("authorization");
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required." });
        }

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
console.log(role)
        // Check if the user is a worker
        if (role !== "Worker") {
            return res.status(403).json({ message: "Access denied. Only Workers can announce jobs." });
        }

        // Verify that the worker exists in the database
        const worker = await Worker.findOne({ email }); // Adjust model if there's a separate Worker model
        if (!worker) {
            return res.status(404).json({ message: "Worker not found." });
        }

        const { city, street, skills, tools, availableDays, workDetails } = req.body;

        // Check for required fields
        if (!city || !street || !skills || !tools || !availableDays || !workDetails) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Construct full address
        const fullAddress = `${street}, ${city}`;

        // Get geocode data
        const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // Replace with your actual API key
        const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;
        const geocodeResponse = await axios.get(geocodeUrl);

        if (geocodeResponse.data.status !== "OK") {
            return res.status(400).json({ message: "Location not found." });
        }

        const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

        // Create and save the new work announcement
        const newWorks = new works({
            city,
            street,
            location: fullAddress,
            skills,
            tools,
            availableDays,
            workDetails,
            coordinates: { lat, lng }
        });

        await newWorks.save();

        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

        res.status(201).json({
            message: 'Announcement created successfully.',
            worker: newWorks,
            googleMapsLink: googleMapsLink
        });
    } catch (error) {
        console.error('Error in adding the announcement:', error);
        res.status(500).json({ message: 'Server error occurred.' });
    }
});
  
router.post('/announce', async (req, res) => {
    try {
        
            const token = req.header("authorization");
            if (!token) {
                return res.status(401).json({ message: "Authentication token is required." });
            }
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
    
            if (role !== "Worker") {
                return res.status(403).json({ message: "Access denied. Only Owners can add land." });
            }
    
            const Worker = await Worker.findOne({ email });
            if (!Worker) {
                return res.status(404).json({ message: "can't find this worker" });
            }
    
      const { location, skills, tools, availableDays, workDetails } = req.body;
  
      // التحقق من وجود البيانات المطلوبة
      if (!location || !skills || !tools || !availableDays || !workDetails) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
      }
      const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // ضع مفتاح API هنا
      const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
     const geocodeResponse = await axios.get(geocodeUrl);
  
      if (geocodeResponse.data.status !== "OK") {
        return res.status(400).json({ message: "لم يتم العثور على الموقع" });
      }
  
      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
  
      const newWorks = new works({
        skills,
        tools,
        availableDays,
        hourlyRate, // الأجرة بالساعة
      areas, // مثل ["نابلس", "جنين"]
      location,
        coordinates: { lat, lng }
      });
  
      await newWorks.save();
      const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
  
      res.status(201).json({
        message: 'تم الإعلان بنجاح',
        worker: newWorks,
        googleMapsLink: googleMapsLink
      });
    } catch (error) {
      console.error('خطأ في إضافة الإعلان:', error);
      res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
  });
router.get("/current-location", async (req, res) => {
    try {
      // Request payload for Geolocation API
      const geolocationPayload = {
        considerIp: true,
      };
      const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // ضع مفتاح API هنا

      // Request Google Geolocation API
      const response = await axios.post(
        `https://maps.gomaps.pro/geolocation/v1/geolocate?key=${apiKey}`,
        geolocationPayload
      );
  
      const { location, accuracy } = response.data;
  
      const googleMapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
  
      res.status(200).json({
        message: "Current location fetched successfully",
        data: {
          latitude: location.lat,
          longitude: location.lng,
          accuracy: accuracy, // Accuracy in meters
          googleMapsLink,
        },
      });
    } catch (error) {
      console.error("Error fetching location:", error);
      res.status(500).json({ message: "Failed to fetch location", error: error.message });
    }
  });

module.exports = router;
