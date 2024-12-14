
const express = require('express');
const router = express.Router();

const {authenticateJWT}=require('../middleware/middleware.js');
const { updateWorkerProfile,  announce, getLands, 
    weathernotification, notification, 
    getAllAnnouncements,respondToRequest, 
    joinland,
    getLandsForGuarantor,
    toggleWorkStatus,
    creatReport,
    feedbacksystem,
    search} = require('./worker.controller.js');
const multer = require('multer');
const axios = require("axios");
const {Owner,Worker,Token,Land,works} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
const jwt = require('jsonwebtoken'); 
const API_KEY = '6d12351278a6e0f3a7bdd70bd2ddbd24'; // تخزين المفتاح مباشرة

router.post('/announcee',authenticateJWT,announce);

router.patch('/update/:email',authenticateJWT,updateWorkerProfile);
router.get('/showLands',authenticateJWT,getLands);

router.post('/weather-notification',weathernotification);
router.get('/notification',authenticateJWT,notification);
router.get('/respondToRequest/:requestId/:status',authenticateJWT,respondToRequest);
router.get('/announcement',getAllAnnouncements );
router.post('/join-land/:landid',authenticateJWT,joinland);
router.get('/mygyarnterland',authenticateJWT,getLandsForGuarantor);
router.post('/create-report/:land_id',authenticateJWT,creatReport);
router.post('/toggle-work-status', toggleWorkStatus);
router.get('/feedback/:feedback_id/:status', authenticateJWT,feedbacksystem);

router.get('/suggested-workers/:landId',authenticateJWT,search);
module.exports = router;