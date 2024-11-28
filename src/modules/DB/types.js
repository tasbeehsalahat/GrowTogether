const { optional } = require('joi');
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


const workerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    userName: { type: String, required: true },
    skills: {
        type: [String],  // هنا قمنا بتحديد أن المهارات ستكون مصفوفة من نوع String
        required: true,
        validate: {
            validator: function (value) {
                return value.every(skill => allowedSkills.includes(skill));
            },
            message: 'بعض المهارات غير صحيحة أو غير مرتبطة بالزراعة.'
        }
    },
    contactNumber: { type: String, required: true },
    role: { type: String, default: 'Worker' }, // إضافة حقل role
    Status: { type: String, default: 'active' }, // إضافة حقل status
}, { collection: 'Worker' });

const Worker = mongoose.model('Worker', workerSchema);

const tokenSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // البريد الإلكتروني للمستخدم
    token: { type: String, required: true },              // التوكن JWT
    role: { type: String, enum: ['Owner', 'Worker','Company'], required: true }, // الدور (Owner أو Worker)

    ownerName: { type: String },       // اسم المالك (لـ Owner فقط)
    contactNumber: { type: String },   // رقم الاتصال
    Status: { type: String, default: 'active' }, // حالة الحساب

    // حقول إضافية خاصة بـ Worker
    userName: { type: String },        // اسم المستخدم (لـ Worker فقط)
    skills: { type: [String] }         // المهارات (لـ Worker فقط)
}, { timestamps: true }); // إضافة الطوابع الزمنية (createdAt, updatedAt)
const Token = mongoose.model('Token', tokenSchema);
const landSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true }, // معرف المالك
    ownerEmail: { type: String, required: true }, // بريد المالك الإلكتروني
    contactNumber: { type: String }, // رقم التواصل الخاص بالمالك
    area: { type: Number, required: true }, // مساحة الأرض
    streetName: { type: String, required: true }, // اسم الشارع
    description: { type: String }, // وصف الأرض
    city: { type: String, required: true }, // المدينة
    town: { type: String, required: true }, // البلدة
    workType: { 
        type: String, 
       optional, 
        enum: [
            'حراثة', 
            'الحراثة', 
            'زراعة', 

            'الزراعة', 
            'ري', 
            'حصاد', 
            'تسميد', 
            'مكافحة الآفات', 
            'تسوية الأرض', 
            'إزالة الأعشاب الضارة', 
            'أنظمة التصريف', 
            'إعداد البيوت البلاستيكية'
        ], // الأنواع المسموح بها للعمل
    },
    specificAreas: { 
        type: Number, 
        required: true, 
        validate: {
            validator: function(value) {
                return value < this.area; // التأكد من أن specificAreas أصغر من المساحة الإجمالية
            },
            message: 'Specific areas must be less than the total area.'
        }
    },
    googleMapsLink: { type: String }, // رابط لموقع الأرض على خرائط Google
    formattedAddress: { type: String }, // العنوان المُنسّق للأرض
    landImage: { type: String }, // صورة الأرض (اختياري)
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    detectedKeywords: {
        type: [String],  // تعديل هنا للسماح بمصفوفة من السلاسل النصية
        required: true
    },
    guarantee: { type: Boolean, default: false }, // الحقل الجديد
}, { timestamps: true }); // إضافة الطوابع الزمنية (createdAt, updatedAt)
const Land = mongoose.model('Land', landSchema);


const Work = new mongoose.Schema({
    skills: {
        type: [String], 
        required: true,
    },
    tools: {
        type: [String], 
        required: true,
    },
    availableDays: {
        type: [String], 
        required: true,
    },
    hourlyRate: {
        type: Number, 
        required: true,
    },
    areas: {
        type: [String], 
        required: true,
    },
    location: {
        type: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
        required: true,
    },
    coordinates: {
        type: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        required: true,
    },
    email: {
        type: String, 
        required: true,
    },
    contactNumber: {
        type: String, 
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: { 
        type: String, 
        default: 'Available' 
    },
});

const works = mongoose.model('Works', Work);

  const companySchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,  // التأكد من أن البريد الإلكتروني فريد 
        lowercase: true,
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: [ 'Company'], 
        required: true 
    },
   
}, { timestamps: true });


const Company = mongoose.model('Company', companySchema);



// Define work type schema
const workSchema = new mongoose.Schema({
  type: {
    type: String,  // Type of work (e.g., Plowing, Planting, etc.)
    required: true,
  },
  skills: {
    type: [String],  // List of skills needed for the work
    required: true,
  },
  tools: {
    type: [String],  // List of tools required for the work
    required: true,
  },
  requiredByOwner: {
    type: Boolean,  // Indicating whether the work is required by land owner
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define the Work model
const Work_analysis = mongoose.model('e', workSchema);

const keywordsSchema = new mongoose.Schema({
    keyword: { type: String, required: true, unique: true },
    skills: [String], // قائمة المهارات
    tools: [String]   // قائمة الأدوات
});

// إنشاء نموذج MongoDB
const Keywords = mongoose.model('Keywords', keywordsSchema);


module.exports ={Owner,Worker,Token,Land,works,Company,Work_analysis,Keywords,keywordsSchema};
