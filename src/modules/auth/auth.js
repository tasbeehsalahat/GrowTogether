const router = require('express').Router();
const {login,signup,logout,resetpass} = require('./auth.controller');
router.post('/login',login);
router.post('/signup',signup);
router.delete('/logout',logout);
router.patch('resetpass',resetpass);