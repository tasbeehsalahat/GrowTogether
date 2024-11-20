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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const upload = multer({ storage: storage });
const { signupowner,Myprofile, login,signupWorker,updateprofile} = require('../auth/auth.controller.js');
const router = express.Router();
router.post('/login', login); 
router.post('/signupowner', signupowner);
router.post('/signupworker', signupWorker);
router.post('/send-verification-code', (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    
    admin.auth().generatePhoneNumberVerificationCode(phoneNumber)
      .then((verificationCode) => {
        // Send the verification code to the user (e.g., via SMS or email)
        res.json({ success: true, message: "Verification code sent!" });
      })
      .catch((error) => {
        console.error("Error sending verification code: ", error);
        res.status(500).json({ success: false, message: "Failed to send verification code" });
      });
  });
router.post('/verify-code', (req, res) => {
    const { phoneNumber, verificationCode } = req.body;
    
    admin.auth().verifyPhoneNumber(verificationCode, phoneNumber)
      .then((userCredential) => {
        // OTP verified successfully
        res.json({ success: true, message: "Phone number verified", user: userCredential });
      })
      .catch((error) => {
        console.error("Error verifying OTP: ", error);
        res.status(500).json({ success: false, message: "Failed to verify OTrP" });
      });
  });
  router.get('/myprofile',Myprofile);
  router.patch('/updateprofile',updateprofile)
module.exports = router; 
