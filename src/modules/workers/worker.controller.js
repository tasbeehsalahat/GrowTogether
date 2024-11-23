

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const {Owner,Worker,Token,Land} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
const updateWorkerProfile = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Please enter what you want to update' });
        }

        const updates = req.body; 
        let email = req.params.email.trim();  // إزالة المسافات الزائدة
        email = email.replace(":", "");  

        if (req.user.email !== email || req.user.role !== 'Worker') {
            return res.status(403).json({ message: 'You can only update your own profile as a Worker.' });
        }

        console.log('Updating profile for Worker:', email);

        // Validate the updates for Worker
        const validation = validateProfileUpdate(updates, 'Worker');
        if (validation.error) {
            return res.status(400).json({ message: validation.error });
        }

        const updatedProfile = validation.value;

        // Find and update the Worker profile in the database
        const updatedWorker = await Worker.findOneAndUpdate(
            { email },
            { $set: updatedProfile },
            { new: true }  // Return the updated document
        );

        if (!updatedWorker) {
            return res.status(404).json({ message: 'Worker not found.' });
        }

        return res.status(200).json({
            message: 'Worker profile updated successfully.',
            updatedWorker
        });
    } catch (error) {
        console.error('Error updating Worker profile:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
module.exports={updateWorkerProfile}