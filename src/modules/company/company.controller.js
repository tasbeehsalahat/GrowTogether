
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Owner,Worker,Token,Land,Work_analysis,workType, works,Keywords,keywordsSchema} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن

const notification=async(req,res)=>{

try{
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required. Please login again.' });
    }
       // التحقق مما إذا كان التوكن موجودًا في جدول التوكن
       const tokenExists = await Token.findOne({ token: token });
       if (!tokenExists) {
           return res.status(401).json({ message: 'You have logged out. Please login again.' });
       }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please login again.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token. Please login again.' });
        }
        return res.status(401).json({ message: 'Authentication failed. Please login again.' });
    }
const role=decodedToken.role;
if(role!='Company'){

return res.json({message:"u can't access this page"});

}


const lands = await Land.find({ status: 'Pending', guarantee: true });
    if (!lands || lands.length === 0) {
        return res.status(404).json({ message: "No Lands Work" });
    }
else{
    res.status(200).json({ message: "Here's the pending lands", lands });

}    
}

catch (err) {
console.error("خطأ أثناء عرض الأراضي:", err);
res.status(500).json({ message: "حدث خطأ أثناء عرض الأراضي" });
}
};
const viewwork =async(req,res)=>{
    try{
        const token = req.headers.authorization;
    
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is required. Please login again.' });
        }
           // التحقق مما إذا كان التوكن موجودًا في جدول التوكن
           const tokenExists = await Token.findOne({ token: token });
           if (!tokenExists) {
               return res.status(401).json({ message: 'You have logged out. Please login again.' });
           }
    
        let decodedToken;
        try {
            // التحقق من صحة التوكن
            decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        } catch (err) {
            // التحقق إذا كان الخطأ بسبب انتهاء صلاحية التوكن
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token has expired. Please login again.' });
            }
            // التحقق إذا كان الخطأ بسبب توكن غير صالح
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token. Please login again.' });
            }
            // أي أخطاء أخرى
            return res.status(401).json({ message: 'Authentication failed. Please login again.' });
        }
    const role=decodedToken.role;
    if(role!='Company'){
    
    return res.json({message:"u can't access this page"});
    
    }
     const lands = await Land.find({ status: 'Approved' , guarantee: true });
        if (!lands || lands.length === 0) {
            return res.status(404).json({ message: "No Lands Work" });
        }
    else{
        res.status(200).json({ message: "Here's the Accepted lands", lands });
    
    }    
    }
    
    catch (err) {
    console.error("error happend ", err);
    res.status(500).json({ message: "error happend while reviewing the lands" });
    }
    };

const state= async (req, res) => {
    try {
        const { id, status } = req.params;

        // التحقق من صحة الحالة
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Only "Approved" or "Rejected" are allowed.',
            });
        }

        const land = await Land.findById(id);

        if (!land) {
            return res.status(404).json({ message: 'Land not found.' });
        }
        if (!land.guarantee) {
            return res.status(400).json({
                message: 'This land does not require a guarantee.',
            });
        }

        // تحديث حالة الأرض
        land.status = status;
        const updatedLand = await land.save();

        return res.status(200).json({
            message: `Land has been ${status === 'Approved' ? 'approved' : 'rejected'}.`,
            land: updatedLand,
        });
    } catch (error) {
        console.error('Error updating land status:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

const Analysis = async (req, res) => {
    try {
      const token = req.headers.authorization;
  
      if (!token) {
        return res.status(401).json({ message: 'Authorization token is required. Please login again.' });
      }
  
      // التحقق مما إذا كان التوكن موجودًا في جدول التوكن
      const tokenExists = await Token.findOne({ token: token });
      if (!tokenExists) {
        return res.status(401).json({ message: 'You have logged out. Please login again.' });
      }
  
      let decodedToken;
      try {
        // التحقق من صحة التوكن
        decodedToken = jwt.verify(token, JWT_SECRET_KEY);
      } catch (err) {
        // التحقق إذا كان الخطأ بسبب انتهاء صلاحية التوكن
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired. Please login again.' });
        }
        // التحقق إذا كان الخطأ بسبب توكن غير صالح
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Invalid token. Please login again.' });
        }
        // أي أخطاء أخرى
        return res.status(401).json({ message: 'Authentication failed. Please login again.' });
      }
  
      const role = decodedToken.role;
      if (role !== 'Company') {
        return res.json({ message: "You can't access this page" });
      }
  
      const landId = req.params.id;
      const land = await Land.findById(landId);
  
      if (!land) {
        return res.status(404).json({ message: 'الأرض غير موجودة' });
      }
  
      // استرجاع الكلمات المفتاحية للأرض
      const keywords = land.detectedKeywords;
  
      const skillsAndToolsPromises = keywords.map(keyword => {
        return Keywords.findOne({ keyword: keyword })
          .then(keywordsSchema => {
            if (keywordsSchema) {
              return {
                keyword: keywordsSchema.keyword,
                skills: keywordsSchema.skills,
                tools: keywordsSchema.tools
              };
            }
            return null; // إذا لم توجد كلمة مفتاحية، نعيد null
          });
      });
  
      const skillsAndTools = await Promise.all(skillsAndToolsPromises);
        const validSkillsAndTools = skillsAndTools.filter(item => item !== null);
      const requiredSkills = [];
      const requiredTools = [];
  
      validSkillsAndTools.forEach(item => {
        requiredSkills.push(...item.skills);
        requiredTools.push(...item.tools);
      });
      const filterSkills = req.query.skills ? req.query.skills.split(',') : [];
      const filterTools = req.query.tools ? req.query.tools.split(',') : [];
  
      let matchingWorkersQuery = {
        $or: [
          { skills: { $in: requiredSkills } },
          { tools: { $in: requiredTools } }
        ]
      };
  
      if (filterSkills.length > 0) {
        matchingWorkersQuery.$or.push({ skills: { $in: filterSkills } });
      }
      if (filterTools.length > 0) {
        matchingWorkersQuery.$or.push({ tools: { $in: filterTools } });
      }
  
      const matchingWorkers = await works.find(matchingWorkersQuery).exec();;
      if (matchingWorkers.length === 0) {
        return res.status(404).json({ message: 'لا يوجد عمال يتطابقون مع هذه المهارات والأدوات.' });
    }
      return res.json({
        matchingWorkers
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
  };
  
  
module.exports={notification,viewwork ,state,Analysis}