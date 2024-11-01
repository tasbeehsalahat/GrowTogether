// models/Admin.js
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    landArea: { type: Number, required: true },
    location: { type: String, required: true },
    ownerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    description: { type: String , required: true},  
    suggestion: { type: String },    // optional field
    image: { type: String },          // optional field
}, { collection: 'Owner' });

const Owner = mongoose.model('Owner', ownerSchema);

module.exports =Owner;
