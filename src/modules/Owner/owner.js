const express = require('express');
const multer = require('multer');

const router = express.Router();

const {authenticateJWT}=require('../middleware/middleware.js');
const { addLand, getAllLands,updateLand, deleteLand, getLandbyid, updateOwnerProfile } = require('./owner.controller.js');
router.post('/addland',authenticateJWT,addLand)
router.get('/getmylands',authenticateJWT,getAllLands);
router.patch('/updatemylands/:landid',authenticateJWT,updateLand);
router.delete('/deletemylands/:landid',authenticateJWT,deleteLand);
router.get('/getland/:landid',authenticateJWT,getLandbyid);
router.patch('/update/:email',authenticateJWT,updateOwnerProfile);
router.post('/open', (req, res) => {
    const { address } = req.body;  // The address is passed by the user

    if (!address) {
        return res.status(400).json({ message: 'Please provide an address.' });
    }
    const encodedAddress = encodeURIComponent(address);

    const googleMapsUrl = `https://geomolg.ps/L5/index.html?viewer=A3.V1&fbclid=IwY2xjawGt2yFleHRuA2FlbQIxMAABHdY5wduIKvkzgWUu5_0qX4ueInY1J8Wxu0lK6ODCO6_O0YDI268mRczjUA_aem_49xM2_G90d7MuTFRmTuGLQ&location=${encodedAddress}`;
    
    // Send the constructed URL as the response
    return res.status(200).json({
        message: 'Location URL generated successfully.',
        googleMapsUrl,
    });
});

module.exports = router;
