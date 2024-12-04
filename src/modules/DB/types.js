const { optional, boolean } = require('joi');
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


// قائمة المهارات المسموح بها
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

// قائمة الأدوات المسموح بها
const allowedTools = [
    'معدات تسميد',
    'معدات حراثة',
    'معدات ري',
    'آلات زراعية',
    'معدات مكافحة آفات',
    'معدات حصاد',
    'معدات نقل'
];

const workerSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        skills: {
            type: [String],
            validate: {
                validator: function (value) {
                    return value.every(skill => allowedSkills.includes(skill));
                },
                message: 'بعض المهارات غير صحيحة أو غير مرتبطة بالزراعة.'
            }
        },
        contactNumber: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: 'Worker'
        },
        status: {
            type: String,
            default: 'active'
        },
        isGuarantor: {
            type: Boolean,
            default: false
        },
        tools: {
            type: [String],
            validate: {
                validator: function (value) {
                    return value.every(tool => allowedTools.includes(tool));
                },
                message: 'بعض الأدوات غير صحيحة أو غير مرتبطة بالزراعة.'
            }
        },
        // الحقول الجديدة لخطوة التسجيل الثانية
        streetName: {
            type: String,
            required: false // اختياري في حال كان إدخال الموقع يتم في خطوة ثانية
        },
        town: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        areas: {
            type: [String], // قائمة بالمناطق الجغرافية
            required: false
        }
    },
    { collection: 'Worker' }
);

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
        enum: ['زراعة', 'فلاحة', 'تشجير', 'تلقيط', 'حصاد','حراثة','تسميد','رش مبيدات حشرية','اعداد بيوت بلاستيكية','نقل محاصيل'], // الخيارات المتاحة لنوع العمل
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
    isguarntee:  { type: Boolean, default: false }
    ,
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
    advertisement:{ type: Boolean, default: false },
    status:{ type: Boolean, default: false },
    location: {
        type: {
            latitude: { type: Number, required: true }, // خط العرض
            longitude: { type: Number, required: true }, // خط الطول
        },
        required: true, // تأكد من وجود الموقع دائمًا
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
      isGuarantor: { type: Boolean, default: false } // إضافة حقل isGuarantor (هل العامل ضامن؟)

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
const Work_analysis = mongoose.model('e', workSchema);

const keywordsSchema = new mongoose.Schema({
    keyword: { type: String, required: true, unique: true },
    skills: [String], // قائمة المهارات
    tools: [String]   // قائمة الأدوات
});

const Keywords = mongoose.model('Keywords', keywordsSchema);

// سكيما إعلان العمل
const workAnnouncementSchema = new mongoose.Schema({
    landid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Land',
        required: true, // الإشارة إلى الأرض التي يتم الإعلان عنها
    },
    numberOfWorkers: {
        type: Number,
        required: true, // عدد العمال المطلوبين
    },
    startTime: {
        type: String,
        required: true, // وقت بداية العمل
    },
    endTime: {
        type: String,
        required: true, // وقت انتهاء العمل
    },
    startDate: {
        type: Date,
        required: true, // تاريخ بداية العمل
    },
    endDate: {
        type: Date,
        required: true, // تاريخ نهاية العمل
    },
    dailyRate: {
        type: Number,
        required: true, // الأجرة اليومية لكل عامل
    },
    workType: {
        type: String,
        required: true, // نوع العمل (مأخوذ من الأرض)
    },
    location: {
        latitude: {
            type: Number,
            required: true, // خط العرض
        },
        longitude: {
            type: Number,
            required: true, // خط الطول
        },
    },
    formattedAddress: {
        type: String,
        required: true, // العنوان الكامل
    },
    googleMapsLink: {
        type: String,
        required: true, // رابط جوجل ماب للموقع
    },
    createdAt: {
        type: Date,
        default: Date.now, // تاريخ إنشاء الإعلان
    },
});

// إنشاء الموديل بناءً على السكيما
const WorkAnnouncement = mongoose.model('WorkAnnouncement', workAnnouncementSchema);

const RequestSchema = new mongoose.Schema({
    landId: { type: mongoose.Schema.Types.ObjectId, ref: 'Land', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
   owneremail: { type: String, required: true },

});

const requests = mongoose.model('Request', RequestSchema);


module.exports ={requests,WorkAnnouncement,Owner,Worker,Token,Land,works,Company,Work_analysis,Keywords,keywordsSchema};
