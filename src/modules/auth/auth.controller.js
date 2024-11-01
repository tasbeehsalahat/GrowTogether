const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dns = require('dns');
const {signupSchema,workerSignupSchema,loginSchema} = require('../valdition/vald.js');
const {Owner,Worker} = require('../DB/types.js');  // تأكد من أن المسار صحيح

const signup = async (req, res) => {
    const { error } = signupSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: 'Validation error', errors: errorMessages });
    }

    const { email, password, confirmpassword, landArea, location, ownerName, contactNumber, description, suggestion } = req.body;

    if (password !== confirmpassword) {
        return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new Owner document
        const newOwner = new Owner({
            email,
            password: hashedPassword,
            landArea,
            location,
            ownerName,
            contactNumber,
            description,
            suggestion: suggestion || "", // Optional field
            image: ""  // If there’s an image, you can set it here
        });

        // Save the new owner to the database
        await newOwner.save();
        console.log("done");
       
        return res.status(201).json({ message: 'Owner added successfully' });

    } catch (error) {
        console.error("errorrrrr", error);

        if (error.code === 11000) {
            return res.status(409).json({ message: 'sorry,this email is already exist' });
        }

        return res.status(500).json({ message: 'Error adding owner' });
    }
};

const signupWorker = async (req, res) => {
    // Validate the request body using Joi schema
    const { error } = workerSignupSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: 'Validation error', errors: errorMessages });
    }

    const { email, password, confirmPassword, userName, yearsOfExperience, placeOfResidence, areasAvailableToTravel, availableDays, workingHours } = req.body;

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new Worker document
        const newWorker = new Worker({
            email,
            password: hashedPassword,  // Use hashed password
            userName,
            yearsOfExperience,
            placeOfResidence,
            areasAvailableToTravel,
            availableDays,
            workingHours
        });

        // Save the new worker to the database
        await newWorker.save();
        console.log("Worker added successfully");
       
        return res.status(201).json({ message: 'Worker added successfully' });

    } catch (error) {
        console.error("Error adding worker:", error);

        // Check for duplicate email error
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // General error handling
        return res.status(500).json({ message: 'Error adding worker' });
    }
};


const login = async (req,res) =>{
try{ 
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: 'Validation error', errors: errorMessages });
    }
  




}
catch(error){

}
    
}

module.exports = { login, signup,signupWorker};
