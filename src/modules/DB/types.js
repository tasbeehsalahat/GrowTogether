// models/Admin.js
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  

    ownerName: { type: String, required: true },
    contactNumber: { type: String, required: true }
}, { collection: 'Owner' });

const Owner = mongoose.model('Owner', ownerSchema);
const allowedSkills = [
    'Plowing',
    'Irrigation',
    'Harvesting',
    'Fertilizer Application',
    'Crop Monitoring',
    'Livestock Care',
    'Soil Analysis',
    'Pest Control',
    'Landscaping',
    'Greenhouse Management'
];
const workerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userName: { type: String, required: true },
    skills: {
        type: [String],  // هنا قمنا بتحديد أن المهارات ستكون مصفوفة من نوع String
        required: true,
        validate: {
            validator: function (value) {
                // التحقق من أن كل مهارة في المصفوفة هي واحدة من المهارات المسموح بها
                return value.every(skill => allowedSkills.includes(skill));
            },
            message: 'Some skills are not valid or are not related to farming.'
        }
    },
    contactNumber: { type: String, required: true }

}, { collection: 'Worker' });


const Worker = mongoose.model('Worker', workerSchema);
// Define the Token schema
const tokenSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // The email address
    token: { type: String, required: true ,unique: true }, // The generated token
}, { collection: 'Token' });
const Token = mongoose.model('Token', tokenSchema);
module.exports ={Owner,Worker,Token};
