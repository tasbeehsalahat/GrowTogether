const express = require('express');
const connection = require('../DB/connection.js');
const mongoose = require('mongoose');
const signupSchema = require('../valdition/vald.js');
const mailgun = require('mailgun-js');
const mg = mailgun({ apiKey: '19989d49144a85a5ceebbd4865d38b3b', domain: 'sandboxd8d3a464035148ac979db254c7decc50.mailgun.org' });

const bcrypt = require('bcrypt');
const Owner = require('../DB/types.js'); // Adjust the path as needed

// Send email function
const sendEmail = (recipient, subject, text) => {
    const data = {
        from: 'tasbeehsa80"gmail.com', // replace with actual sender email
        to: recipient,
        subject: subject,
        text: text
    };
console.log("jfidjfijdh");
    mg.messages().send(data, function (error, body) {
        if (error) {
            console.log(error);
        } else {
            console.log(body);
        }
    });
};

// Login function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate request body
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find the owner by email
        const owner = await Owner.findOne({ email });
        if (!owner) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, owner.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Send login confirmation email
        sendEmail(email, "Login Successful", `Hi ${owner.ownerName}, you have successfully logged in.`);

        // Return owner details (without password)
        return res.status(200).json({ 
            message: "Login successful", 
            owner: {
                email: owner.email,
                ownerName: owner.ownerName,
                location: owner.location,
                landArea: owner.landArea,
                landType: owner.landType,
                soilType: owner.soilType,
                contactNumber: owner.contactNumber
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Signup function
const signup = async (req, res) => {
    try {
        // Validate request body
        const { error } = signupSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, password, landArea, location, ownerName, contactNumber, landType, soilType } = req.body;
        const existingOwner = await Owner.findOne({ email });
        if (existingOwner) {
            return res.status(409).json({ message: "Email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new owner
        const newowner = new Owner({
            email,
            password: hashedPassword,
            landArea,
            location,
            ownerName,
            contactNumber,
            landType,
            soilType
        });
        await newowner.save();

        // Send signup confirmation email
        sendEmail(email, "Signup Successful", `Hi ${ownerName}, your account has been successfully created.`);

        return res.status(201).json({ message: "Owner created successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(409).json({ message: "Email already exists" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { login, signup };
