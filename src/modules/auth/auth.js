
// router.post('/signup',signup);
// router.delete('/logout',logout);
// router.patch('resetpass',resetpass);

// auth.js
const express = require('express');
const { signup, login } = require('../auth/auth.controller.js');
const router = express.Router();

router.post ('/login', login); // This should match your POST request
router.post('/signup',signup);
module.exports = router; // Make sure you're exporting the router


