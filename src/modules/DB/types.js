// models/Admin.js
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  

    ownerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    role: { type: String, default: 'Owner' },  // إضافة حقل role
    Status: { type: String, default: 'active' }, // إضافة حقل role

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
    email: { type: String, required: true, unique: true,lowercase:true },
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
    contactNumber: { type: String, required: true },
    role: { type: String, default: 'Worker' }, // إضافة حقل role
    Status: { type: String, default: 'active' }, // إضافة حقل role


}, { collection: 'Worker' });
const Worker = mongoose.model('Worker', workerSchema);
const tokenSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // The email address
    token: { type: String, required: true ,unique: true },
   role: { type: String, required: true  },

}, { collection: 'Token' });
const Token = mongoose.model('Token', tokenSchema);

const LandSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true
    },
    area: {
        type: Number, // مساحة الأرض بالمتر المربع
        required: true
    },
    perimeter: {
        type: Number, // محيط الأرض بالأمتار
        required: true
    },
    coordinates: [
        {
            x: { type: Number, required: true },
            y: { type: Number, required: true }
        }
    ],
    soilType: {
        type: String, // نوع التربة
        enum: ['Loamy', 'Clay', 'Sandy', 'Silt'],
        required: false
    },
    status: {
        type: String,
        enum: ['Available', 'Not Available'], // حالة الأرض
        default: 'Available'
    }
}, {  collection: 'lands' });

const Land = mongoose.model('Land', LandSchema);

module.exports ={Owner,Worker,Token,Land};
