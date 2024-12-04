const multer = require('multer');
const express = require('express');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const admin = require('firebase-admin');
const serviceAccount = require('../firebase/firebase.json');

const bodyParser = require('body-parser');

const {authenticateJWT}=require('../middleware/middleware.js')
const upload = multer({ storage: storage });
const { signupowner,profile,deactivationaccount, login,signupWorker,
  updateprofile,logout,getconfirm,sendconfirm,verifyResetCode,
  resetPassword,myprofile,deleteAccount,forgotPassword, updatePassword,
  logincompany,
  signupwstep2} = require('../auth/auth.controller.js');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 1* 60 * 1000, 
  max: 2,
  message: (req, res) => {
    return res.json({
      message: 'Too many login attempts from this IP, please try again after 1 minutes'
    });
  },
    standardHeaders: true, // إضافة معلومات إلى رؤوس الاستجابة
  legacyHeaders: false,
});
router.use(bodyParser.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://your-database-url.firebaseio.com" // Replace with your Firebase database URL
});
router.post('/login',loginLimiter,login); 
router.post('/signupowner', signupowner);
router.post('/signupworker', signupWorker);
router.post('/send-confirmation-email',sendconfirm);
router.post('/confirm-account',getconfirm);
 router.get('/profile',profile);
  router.get('/logout',authenticateJWT,logout);
  router.get('/myprofile',authenticateJWT,myprofile);
  router.delete('/delete-account/:email', authenticateJWT, deleteAccount);
  router.patch('/update-password/:email', authenticateJWT, updatePassword);
  router.post('/forgot-password',forgotPassword);
  router.post('/verifyResetCode',verifyResetCode);
  router.post('/resetPassword',resetPassword);
  router.patch('/deactiveaccount',authenticateJWT,deactivationaccount);
  router.post('/logincompany',logincompany);
  router.post('/register-step2/:workerId',signupwstep2);
module.exports = router; 
