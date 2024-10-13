// db.js
const mongoose = require('mongoose');
require('dotenv').config();

// Use the MongoDB URI from the .env file
const uri = process.env.MONGODB_URI ;
const connectDB = async () => {
    try {
        // Remove deprecated options
        await mongoose.connect(uri);
        console.log('Connected to MongoDB done ');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process with failure
    }
};

// Export the connection function
module.exports = connectDB;
