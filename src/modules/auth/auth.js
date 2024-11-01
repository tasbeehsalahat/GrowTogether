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

const upload = multer({ storage: storage });
const { signup, login } = require('../auth/auth.controller.js');
const router = express.Router();
router.post('/login', login); 
router.post('/signup', upload.single('image'), signup);
module.exports = router; 
