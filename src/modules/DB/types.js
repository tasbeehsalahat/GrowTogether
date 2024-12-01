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
const allowedSkills = [
    'خبرة في الحراثة', 
    'خبرة بالآلات الزراعية', 
    'مزارع', 
    'خبرة في الزراعة', 
    'خبرة في زراعة المحاصيل', 
    'تقني ري', 
    'خبرة في أنظمة الري', 
    'عامل حصاد', 
    'خبرة في جمع المحاصيل', 
    'خبرة في التسميد', 
    'تقني تسميد', 
    'خبير مكافحة آفات', 
    'خبرة في مكافحة الحشرات', 
    'خبرة في استخدام المبيدات', 
    'خبرة في تسوية الأرض', 
    'متخصص في تجهيز الأراضي', 
    'عامل إزالة الأعشاب', 
    'خبرة في المكافحة', 
    'خبرة في المعدات الزراعية', 
    'تقني محميات زراعية', 
    'خبرة في البيوت البلاستيكية', 
    'عامل نقل', 
    'خبرة في شحن المحاصيل'
];

const workerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    userName: { type: String, required: true },
    skills: {
        type: [String],  // تحديد أن المهارات ستكون مصفوفة من نوع String
        optional,
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
    isGuarantor: { type: Boolean, default: false } // إضافة حقل isGuarantor (هل العامل ضامن؟)
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
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner', // اسم الـ Schema الذي يحتوي على معلومات المالك
        required: true,
    },
    ownerEmail: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, 'Invalid email address'], // التحقق من صحة البريد الإلكتروني
    },
    contactNumber: {
        type: String,
        required: true,
    },
    area: {
        type: Number, // المساحة الكلية للأرض
        required: true,
        min: [1, 'Area must be greater than 0'],
    },
    description: {
        type: String,
        required: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    streetName: {
        type: String,
        required: false, // قد يكون غير مطلوب عند استخدام الموقع الحالي
    },
    city: {
        type: String,
        required: false,
    },
    town: {
        type: String,
        required: false,
    },
    specificAreas: {
        type: Number, // المناطق المحددة داخل الأرض
optional,
        min: [0, 'Specific areas must be 0 or greater'],
    },
    workType: {
        type: String,
        required: true,
        enum: ['زراعة', 'فلاحة', 'تشجير', 'تلقيط', 'حصاد'], // الخيارات المتاحة لنوع العمل
    },
    guaranteePrice: {
        type: Number, // السعر الذي يطلبه المالك كضمان (قد يكون مطلوبًا لنوع عمل معين)
        default: null,
    },
    guaranteeDuration: {
        type: String, // مدة الضمان
        default: null,
    },
    guaranteePercentage: {
        type: Number, // نسبة الضمان (قد يكون مطلوبًا لنوع عمل معين)
        default: null,
    },
    status: {
        type: String,
        enum: ['Accepted', 'Pending', 'Rejected'], // حالات الأرض
        default: 'Pending',
    },
    formattedAddress: {
        type: String, // العنوان المترجم (المستخرج من API)
        required: false,
    },
    googleMapsLink: {
        type: String, // رابط Google Maps لموقع الأرض
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now, // يتم تعيين تاريخ الإضافة تلقائيًا
    },
});

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
