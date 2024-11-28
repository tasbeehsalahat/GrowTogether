const multer = require('multer');
const express = require('express');
const router=express.Router();

const {authenticateJWT}=require('../middleware/middleware.js');
const {notification ,viewwork, state, Analysis} = require('./company.controller.js');


router.get('/viewrequest',authenticateJWT, notification);

router.get('/viewwork',authenticateJWT, viewwork);
router.put('/state/:id/:status',authenticateJWT,state);
router.get('/filter/:id', authenticateJWT,Analysis)
module.exports=router;