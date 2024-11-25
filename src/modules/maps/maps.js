const express = require('express');
const multer = require('multer');
const axios = require("axios");
const {Owner,Worker,Token,Land,works} = require('../DB/types.js');  // تأكد من أن المسار صحيح

const router = express.Router();

router.post("/add-land", async (req, res) => {
    try {
        
        const { ownerId, area, perimeter, street, city, state, country, soilType, status } = req.body;

        // التأكد من إدخال كل الحقول المطلوبة
        if (!street || !city || !state || !country || !area || !perimeter || !soilType) {
            return res.status(400).json({ message: "كل الحقول مطلوبة (الشارع، المدينة، المحافظة، الدولة، المساحة، المحيط، نوع التربة)" });
        }
        const address = `${street}, ${city}, ${state}, ${country}`;

        const apiKey = "AlzaSy6XpmiefdiJmjZyZJVslxex6jWWjzxkmrn"; // ضع مفتاح API هنا
        const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await axios.get(geocodeUrl);

if (response.data.status !== "OK") {
    return res.status(400).json({ message: "we can't find the site", error: response.data.error_message });
}

const { lat, lng } = response.data.results[0].geometry.location;
const formattedAddress = response.data.results[0].formatted_address;
const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

 const newLand = new Land({
    ownerId,
    area,
    perimeter,
    coordinates: [
        { x: lat, y: lng }
    ],
    soilType,
    status,
    formattedAddress
});

await newLand.save();

 res.status(200).json({
    message: 'success adding the land',
    data: {
        coordinates: { latitude: lat, longitude: lng },
        formattedAddress: formattedAddress,
        googleMapsLink: googleMapsLink,  // إضافة رابط Google Maps
        landDetails: newLand
    }
});
} catch (error) {
console.error('Error adding land:', error);
res.status(500).json({ message: 'error ocurred' });
}
});
router.post('/announce', async (req, res) => {
    try {
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
        location,
        skills,
        tools,
        availableDays,
        workDetails,
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
module.exports = router;
