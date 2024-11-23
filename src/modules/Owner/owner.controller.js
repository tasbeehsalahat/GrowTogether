
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const {Owner,Worker,Token,Land} = require('../DB/types.js');  // تأكد من أن المسار صحيح
const JWT_SECRET_KEY = '1234#';  // نفس المفتاح السري الذي ستستخدمه للتحقق من التوكن
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const axios = require('axios');

const addLand = async (req, res) => {
    const token = req.header('authorization'); //  "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // استبدل `yourSecretKey` بمفتاحك السري
        
        const { email, role } = decodedToken;

        // تحقق من أن الدور هو Owner
        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can add land.' });
        }

        // البحث عن المالك في قاعدة البيانات باستخدام البريد الإلكتروني
        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        // إنشاء الأرض وربطها بالمالك
        const { area, perimeter, coordinates, soilType, status } = req.body;

        const newLand = new Land({
            ownerId: owner._id, // الربط بالمالك
            area,
            perimeter,
            coordinates,
            soilType,
            status,
        });

        // حفظ الأرض في قاعدة البيانات
        const savedLand = await newLand.save();

        // الاستجابة بنجاح
        return res.status(201).json({
            message: 'Land added successfully.',
            land: savedLand,
        });
    } catch (error) {
        console.error('Error adding land:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const getAllLands = async (req, res) => {
    const token = req.header('authorization');

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can view their lands.' });
        }

        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        const lands = await Land.find({ ownerId: owner._id });

        return res.status(200).json({
            message: 'Lands retrieved successfully.',
            lands,
        });
    } catch (error) {
        console.error('Error fetching lands:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const updateLand = async (req, res) => {
    const token = req.header('authorization');

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token,JWT_SECRET_KEY);
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can update their lands.' });
        }

        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        const { landId } = req.params;

        // التأكد أن الأرض مملوكة لهذا المستخدم
        const land = await Land.findOne({ _id: landId, ownerId: owner._id });

        if (!land) {
            return res.status(404).json({ message: 'Land not found or does not belong to the owner.' });
        }

        // تحديث الأرض
        const updatedLand = await Land.findByIdAndUpdate(
            landId,
            { ...req.body },
            { new: true }
        );

        return res.status(200).json({
            message: 'Land updated successfully.',
            land: updatedLand,
        });
    } catch (error) {
        console.error('Error updating land:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
const deleteLand = async (req, res) => {
    const token = req.header('authorization'); // استخراج التوكن من الهيدر

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // فك تشفير التوكن
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can delete their lands.' });
        }

        // العثور على المالك بناءً على الإيميل
        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        // استخراج معرف الأرض من body
        let { landid } = req.params; 
        if (!landid) {
            return res.status(400).json({ message: 'Land ID is required.' });
        }

        // إزالة النقطتين من بداية الـ landid
        landid = landid.replace(/^:/, '');  // هذه الدالة ستزيل النقطتين في حال كانت في بداية المعرف

        // العثور على الأرض والتأكد من أنها مملوكة لهذا المالك
        const land = await Land.findOne({ _id: landid, ownerId: owner._id });

        if (!land) {
            return res.status(404).json({ message: 'Land not found or does not belong to the owner.' });
        }

        // حذف الأرض
        await Land.findByIdAndDelete(landid);

        return res.status(200).json({
            message: 'Land deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting land:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

const getLandbyid = async (req, res) => {
    const token = req.header('authorization'); // استخراج التوكن من الهيدر

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY); // فك تشفير التوكن
        const { email, role } = decodedToken;

        if (role !== 'Owner') {
            return res.status(403).json({ message: 'Access denied. Only Owners can delete their lands.' });
        }

        // العثور على المالك بناءً على الإيميل
        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        // استخراج معرف الأرض من body
        let { landid } = req.params; 
        if (!landid) {
            return res.status(400).json({ message: 'Land ID is required.' });
        }

        // إزالة النقطتين من بداية الـ landid
        landid = landid.replace(/^:/, '');  // هذه الدالة ستزيل النقطتين في حال كانت في بداية المعرف

        // العثور على الأرض والتأكد من أنها مملوكة لهذا المالك
        const land = await Land.findOne({ _id: landid, ownerId: owner._id });

        if (!land) {
            return res.status(404).json({ message: 'Land not found or does not belong to the owner.' });
        }

        return res.status(200).json(land);
    } catch (error) {
        console.error('Error fetching land:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports={addLand,getAllLands,updateLand,deleteLand,getLandbyid}