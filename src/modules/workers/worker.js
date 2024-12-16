
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
    search,
    getChats,
    sendMessage,
    getonechat,
    getWorkers,
    updateAnnouncement,
    deleteAnnouncement,
    getMyAnnouncements,
    getWorkerDetails,
    sendreq} = require('./worker.controller.js');
    const { Activity, Tool, Skill, Factor } = require('../DB/types.js');  // تأكد من المسار الصحيح

const multer = require('multer');
const axios = require("axios");
const {Owner,Worker,Token,Land,works} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
const jwt = require('jsonwebtoken'); 
const API_KEY = '6d12351278a6e0f3a7bdd70bd2ddbd24'; // تخزين المفتاح مباشرة

router.post('/announcee',authenticateJWT,announce);
router.patch('/updateannounce/:id',authenticateJWT,updateAnnouncement);
router.patch('/update/:email',authenticateJWT,updateWorkerProfile);
router.get('/showLands',authenticateJWT,getLands);
router.get('/myannouncement',authenticateJWT,getMyAnnouncements);
router.delete('/deletemyannounc/:id',authenticateJWT,deleteAnnouncement);
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
router.get('/getchats',authenticateJWT,getChats);
router.post('/sendmessages/:chatId',authenticateJWT,sendMessage);
router.get('/chat/:chatId',authenticateJWT,getonechat);
router.get('/workers/:workerId', authenticateJWT,getWorkerDetails);

router.post('/sendWorkRequest/:landId/:workerId', authenticateJWT,sendreq);
const activityGoals = {
    'حصاد القمح': 'جمع سنابل القمح الناضجة بطريقة فعالة',
    'زراعة المحاصيل': 'ضمان زراعة البذور أو الشتلات بطريقة تحقق نموًا سليمًا',
    // يمكن إضافة المزيد من الأنشطة هنا
  };
router.post('/activities', async (req, res) => {
    const { name, description, tools, skills, factors, steps } = req.body;
    
    // تحديد الهدف تلقائيًا بناءً على نوع النشاط
    const goal = activityGoals[name] || "الهدف غير محدد"; // إذا لم يكن هناك تطابق، يتم استخدام قيمة افتراضية
  
    // إنشاء كائن النشاط
    const activity = new Activity({
      name,
      description,
      goal,  // تخزين الهدف تلقائيًا
      details: {
        tools,
        skills,
        factors,
        steps,
      },
    });
  
    try {
      // حفظ النشاط في قاعدة البيانات
      const savedActivity = await activity.save();
      res.status(201).json(savedActivity); // الرد مع النشاط المحفوظ
    } catch (error) {
      res.status(400).json({ message: error.message }); // التعامل مع الأخطاء
    }
  });
  

  
  router.get('/land-report/:landId', async (req, res) => {
    const { landId } = req.params;
  
    // البحث عن الأرض باستخدام landId
    const land = await Land.findById(landId);  // هنا نستخدم populate لربط النشاط المرتبط بالأرض
  
    if (land) {
      // استرجاع نوع العمل المرتبط بالأرض
      const landActivityName = land.workType;
  
      // البحث عن النشاط الزراعي الذي يتوافق مع اسم النشاط المرتبط بالأرض
      const activity = await Activity.findOne({ name: landActivityName });
  
      if (activity) {
        // إذا تم العثور على النشاط المطابق، نعرض تفاصيله
        res.status(200).json({
          landName: land.landName,
          activity: activity.name,
          report: {
            tools: activity.details.tools,
            skills: activity.details.skills,
            factors: activity.details.factors,
            steps: activity.details.steps,
          },
        });
      } else {
        res.status(404).json({ message: 'No matching activity found for this land' });
      }
    } else {
      res.status(404).json({ message: 'Land not found' });
    }
  });
  // تحديث جزئي للنشاط
router.patch('/activities/:activityId', async (req, res) => {
    const { activityId } = req.params;
    const { name, description, tools, skills, factors, steps } = req.body;
  
    try {
      // البحث عن النشاط باستخدام activityId
      const activity = await Activity.findById(activityId);
  
      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
      }
  
      // تحديث التفاصيل للنشاط بشكل جزئي
      if (name) activity.name = name;
      if (description) activity.description = description;
      if (tools) activity.details.tools = tools;
      if (skills) activity.details.skills = skills;
      if (factors) activity.details.factors = factors;
      if (steps) activity.details.steps = steps;
  
      // حفظ التحديثات في قاعدة البيانات
      const updatedActivity = await activity.save();
  
      // الرد مع النشاط المحدث
      res.status(200).json(updatedActivity);
  
    } catch (error) {
      res.status(400).json({ message: error.message }); // التعامل مع الأخطاء
    }
  });
  
  router.get('/allactivity', async (req, res) => {
    try {
      // استرجاع جميع الأنشطة من قاعدة البيانات
      const activities = await Activity.find(); 
  
      // التحقق إذا كان هناك أنشطة
      if (activities.length === 0) {
        return res.status(404).json({ message: 'No activities found' });
      }
  
      // الرد مع جميع الأنشطة
      res.status(200).json(activities);
  
    } catch (error) {
      res.status(500).json({ message: error.message }); // التعامل مع الأخطاء
    }
  });
  router.get('/getworkers/:landid',authenticateJWT,getWorkers);
module.exports = router;