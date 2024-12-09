const express = require('express');
const multer = require('multer');

const router = express.Router();

const {authenticateJWT}=require('../middleware/middleware.js');
const { addLand, getAllLands,updateLand, deleteLand, getLandbyid, updateOwnerProfile, 
    getLandAdvertisement, addLanddaily, getguarntors, calculateWorkersForLand,
     createWorkAnnouncement, showLand, createRequest, 
     feedback} = require('./owner.controller.js');
router.get('/getmylands',authenticateJWT,getAllLands);
router.patch('/updatemyland/:landId',authenticateJWT,updateLand);
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
router.post('/addlandgurantee',authenticateJWT,addLand);
router.get('/advertismentland',  getLandAdvertisement);
router.post('/addlanddaily',authenticateJWT,addLanddaily);
router.get('/getguarntors/:landid', authenticateJWT, getguarntors);
router.get('/calculateworkers/:landid', authenticateJWT, calculateWorkersForLand);
router.post('/create-work-announcement/:landid',authenticateJWT,createWorkAnnouncement);
router.get('/showlands',authenticateJWT,showLand);
router.get('/request/:landId/:workerEmail',authenticateJWT,createRequest);
router.post('/feedback/:report_id',authenticateJWT,feedback);
// 1. راوتر لعرض التقرير بناءً على معرف الأرض
router.get('/report/:land_id', async (req, res) => {
  const { land_id } = req.params;
  
  try {
    const report = await DailyReport.findOne({ land_id }).populate('owner_feedback');
    if (!report) {
      return res.status(404).json({ message: 'التقرير غير موجود' });
    }

    res.status(200).json({
      reportDetails: {
        land_id: report.land_id,
        report_date: report.report_date,
        completion_percentage: report.completion_percentage,
        tasks_completed: report.tasks_completed,
        challenges: report.challenges,
        recommendations: report.recommendations,
        hours_worked: report.hours_worked,
        owner_feedback: report.owner_feedback,  // إرجاع ملاحظات صاحب الأرض إذا كانت موجودة
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء استرجاع التقرير', error: error.message });
  }
});




module.exports = router;
