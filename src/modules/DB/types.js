// models/Admin.js
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // تأكد من وجود خاصية unique هنا
    password: { type: String, required: true },
    landArea: { type: Number, required: true },
    location: { type: String, required: true },
    ownerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    landType: { type: String, required: true },
    soilType: { type: String, required: true },
}, { collection: 'Owner' });

const Owner = mongoose.model('Owner', ownerSchema);

module.exports =Owner;
