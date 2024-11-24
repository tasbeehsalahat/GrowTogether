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
router.get('/test', (req, res) => {
 
    console.log("mdjnc")
  });
  router.get('/open', (req, res) => {
    return res.json("hii");
   });

module.exports = router;
