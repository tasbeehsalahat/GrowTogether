const { optional, boolean } = require('joi');
const mongoose = require('mongoose');
const bcrypt=require('bcrypt')
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


const contractSchema = new mongoose.Schema({
    landId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Land',
        required: true, // معرف الأرض مطلوب
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true, // معرف العامل مطلوب
    },
    ownerEmail: {
        type: String,
        required: true, // بريد المالك الإلكتروني مطلوب
    },
    taskDescription: {
        type: String,
        required: true, // وصف المهمة مطلوب
    },
    selectedDay: {
        type: String,
        required: true, // اليوم المختار مطلوب
    },
    startTime: {
        type: String,
        required: true, // وقت البداية مطلوب
    },
    endTime: {
        type: String,
        required: true, // وقت النهاية مطلوب
    },
   workerEmail: {
        type: String,
        required: true, // وقت النهاية مطلوب
    },
    workerSkills: {
        type: [String], // مهارات العامل كمصفوفة نصوص
        default: [],
    },
    workerTools: {
        type: [String], // أدوات العامل كمصفوفة نصوص
        default: [],
    },
    hourlyRate: {
        type: Number, // أجر العامل بالساعة
        required: true,
    },
    landDescription: {
        type: String, // وصف الأرض
        default: '',
    },
    landArea: {
        type: Number, // مساحة الأرض بالمتر المربع
        default: 0,
    },
    landWorkType: {
        type: String, // نوع العمل المطلوب في الأرض
        default: '',
    },
    landAddress: {
        type: String, // عنوان الأرض
        default: '',
    },
    landCity: {
        type: String, // مدينة الأرض
        default: '',
    },
    landTown: {
        type: String, // بلدة الأرض
        default: '',
    },
    contractMessage: {
        type: String, // رسالة العقد
        required: true,
    },
    comment: {
        type: String, // رسالة العقد
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected','Modified','Extended'], // الحالة يمكن أن تكون واحدة من القيم المحددة
        default: 'Pending', // الحالة الافتراضية
    },
    createdAt: {
        type: Date,
        default: Date.now, // وقت إنشاء العقد
    },
});

const contract = mongoose.model('Contract', contractSchema);


const contractHistory = new mongoose.Schema({
    landId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Land',
        required: true, // معرف الأرض مطلوب
    },
    contractId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contract',
        required: true,  
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true, // معرف العامل مطلوب
    },
    ownerEmail: {
        type: String,
        required: true, // بريد المالك الإلكتروني مطلوب
    },
    taskDescription: {
        type: String,
        required: true, // وصف المهمة مطلوب
    },
    selectedDay: {
        type: String,
        required: true, // اليوم المختار مطلوب
    },
    startTime: {
        type: String,
        required: true, // وقت البداية مطلوب
    },
    endTime: {
        type: String,
        required: true, // وقت النهاية مطلوب
    },
   workerEmail: {
        type: String,
        required: true, // وقت النهاية مطلوب
    },
    workerSkills: {
        type: [String], // مهارات العامل كمصفوفة نصوص
        default: [],
    },
    workerTools: {
        type: [String], // أدوات العامل كمصفوفة نصوص
        default: [],
    },
    hourlyRate: {
        type: Number, // أجر العامل بالساعة
        required: true,
    },
    landDescription: {
        type: String, // وصف الأرض
        default: '',
    },
    landArea: {
        type: Number, // مساحة الأرض بالمتر المربع
        default: 0,
    },
    landWorkType: {
        type: String, // نوع العمل المطلوب في الأرض
        default: '',
    },
    landAddress: {
        type: String, // عنوان الأرض
        default: '',
    },
    landCity: {
        type: String, // مدينة الأرض
        default: '',
    },
    landTown: {
        type: String, // بلدة الأرض
        default: '',
    },
    contractMessage: {
        type: String, // رسالة العقد
        required: true,
    },
    comment: {
        type: String, // رسالة العقد
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected','Modified','Extended'], // الحالة يمكن أن تكون واحدة من القيم المحددة
        default: 'Pending', // الحالة الافتراضية
    },
    createdAt: {
        type: Date,
        default: Date.now, // وقت إنشاء العقد
    },
});

const conHistory = mongoose.model('ConHistory', contractHistory);


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
        min: [0, 'Specific areas must be 0 or greater'],
        default: null,
    },
    workType: {
        type: String,
        required: true,
        enum: [
            'زراعة', 'فلاحة', 'تشجير', 'تلقيط', 'حصاد', 
            'حراثة', 'تسميد', 'رش مبيدات حشرية', 
            'اعداد بيوت بلاستيكية', 'نقل محاصيل'
        ], // الخيارات المتاحة لنوع العمل
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
    isguarntee: {
        type: Boolean,
        default: false, // يشير إلى ما إذا كانت الأرض مضمونة أم لا
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
    advertisement: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Boolean,
        default: false,
    },
    location: {
        type: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
        required: true, // تأكد من وجود الموقع دائمًا
    },
    temporaryOwnerEmail: {
        type: String, // البريد الإلكتروني للضامن المؤقت
        default: null,
        match: [/.+@.+\..+/, 'Invalid email address'], // تحقق من صحة البريد الإلكتروني
    },
    guaranteeEndDate: {
        type: Date, // تاريخ انتهاء الضمان
        default: null,
    },
});


const Land = mongoose.model('Land', landSchema);

const dailyReportSchema = new mongoose.Schema({
    land_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land', // الربط مع نموذج الأرض
      required: true,
    },
    report_date: {
      type: Date,
      default: Date.now,
    },
    completion_percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    tasks_completed: {
      type: [String], // قائمة بالمهام المكتملة
      required: true,
    },
    challenges: {
      type: [String], // قائمة بالتحديات التي تمت مواجهتها
      required: true,
    },
    recommendations: {
      type: [String], // قائمة بالتوصيات
      required: true,
    },
    hours_worked: {
      type: Number,
      required: true,
      min: 0, // تأكيد أن عدد الساعات لا يمكن أن يكون سالب
    },
    owner_email: {
      type: String,
      required: true,
    },
    reporter_email: {
      type: String,
      required: true,
    },
    analysis: {
      avgCompletion: { type: Number },
      totalHours: { type: Number },
      challengesAnalysis: { type: mongoose.Schema.Types.Mixed }, // JSON
      monthlyData: { type: mongoose.Schema.Types.Mixed }, // JSON
    },
    status: {
      type: String,
      enum: ['مقدم', 'مراجعة صاحب الأرض', 'مغلق'],
      default: 'مقدم',
    },
    owner_feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OwnerFeedback', // الربط بملاحظات صاحب الأرض
    },
    is_pdf_generated: {
      type: Boolean,
      default: false, // هل تم إنشاء PDF لهذا التقرير
    },
  }, { timestamps: true }); // إضافة createdAt و updatedAt تلقائيًا
  
  
  const DailyReport = mongoose.model('DailyReport', dailyReportSchema);

  const ownerFeedbackSchema = new mongoose.Schema({
    report_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyReport', // الربط بالتقرير
      required: true,
    },
    feedback: {
      type: String,
      required: true, // تعليق صاحب الأرض
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Accepted', 'مقبولة','مرفوضة','Rejected'], // الحالات المتاحة
        default: 'Pending', // الحالة الافتراضية
      },
    owner_email: {
      type: String,
      required: true, // بريد الإلكتروني لصاحب الأرض
    },
    date: {
      type: Date,
      default: Date.now,
    },
  });
  

const OwnerFeedback= mongoose.model('OwnerFeedback', ownerFeedbackSchema);

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
    location: { // تعديل هذا الحقل ليكون GeoJSON
        type: {
            type: String,
            enum: ['Point'],  // تحديد نوع النقطة الجغرافية
            required: true
        },
        coordinates: {  // إحداثيات الموقع
            type: [Number],  // [longitude, latitude]
            required: true
        }
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
      isGuarantor: { type: Boolean, default: false },
      workingHours: [
        {
            day: { type: String, required: true }, // اليوم (مثال: "Monday")
            startTime: { type: String, required: true }, // وقت البدء (مثال: "9:00 AM")
            endTime: { type: String, required: true }, // وقت الانتهاء (مثال: "5:00 PM")
        }
    ]
    
});

const works = mongoose.model('Works', Work);
const workerScheduleSchema = new mongoose.Schema({
    workerId: String,
    taskId: String,
    taskDescription: String,
    startTime: String,
    endTime: String,
    status: { type: String, default: 'Pending' }
  });
  
  const WorkerSchedule = mongoose.model('WorkerSchedule', workerScheduleSchema);
  




const workSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true }, // الربط مع جدول العمال
    skills: [String],
    tools: [String],
    availableDays: [String],
    hourlyRate: Number,
    areas: [String],
    location: {
        latitude: Number,
        longitude: Number
    },
    coordinates: {
        lat: Number,
        lng: Number
    },

    formattedAddress: String,
    email: String,
    contactNumber: String,
    isGuarantor: Boolean,
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


const RequestSchema= new mongoose.Schema({
    landId: { type: mongoose.Schema.Types.ObjectId, ref: 'Land', required: true },
    workerEmail: { type: String, required: true }, // Ensure this is marked as required
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    owneremail: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }, // تاريخ الإنشاء

});

const requests = mongoose.model('Request', RequestSchema);

// تعريف الـ Schema للشركة
const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    companyType: {
        type: String,
        enum: ['نقل', 'معصرة', 'أسمدة وبذور', 'مطحنة'], // تحديد الأنواع المتاحة
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    contactInfo: {
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        }
    },
    workingHours: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    additionalFields: {
        serviceType: {
            type: String,
            required: function() { return this.companyType === 'نقل'; },
        },
        serviceRange: {
            type: String,
            required: function() { return this.companyType === 'نقل'; },
        },
        transportCost: {
            type: String,
            required: function() { return this.companyType === 'نقل'; },
        },
        availableVehicles: {
            type: String,
            required: function() { return this.companyType === 'نقل'; },
        },
        pressCapacity: {
            type: Number,
            required: function() { return this.companyType === 'معصرة'; },
        },
        pressCost: {
            type: String,
            required: function() { return this.companyType === 'معصرة'; },
        },
        additionalServices: {
            type: String,
            required: function() { return this.companyType === 'معصرة'; },
        },
        productType: {
            type: String,
            required: function() { return this.companyType === 'أسمدة وبذور'; },
        },
        minOrder: {
            type: String,
            required: function() { return this.companyType === 'أسمدة وبذور'; },
        },
        deliveryOptions: {
            type: String,
            required: function() { return this.companyType === 'أسمدة وبذور'; },
        },
        grainTypes: {
            type: String,
            required: function() { return this.companyType === 'مطحنة'; },
        },
        millingCost: {
            type: String,
            required: function() { return this.companyType === 'مطحنة'; },
        },
        millCapacity: {
            type: Number,
            required: function() { return this.companyType === 'مطحنة'; },
        }
    },
});
  const Company = mongoose.model('Company', companySchema);

  const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true }, // معرف المرسل (بريد إلكتروني)
    receiverId: { type: String, required: true }, // معرف المستقبل (بريد إلكتروني)
    message: { type: String, required: true }, // نص الرسالة
    timestamp: { type: Date, default: Date.now }, // توقيت إرسال الرسالة
});

// إنشاء سكيما المحادثة
const chatSchema = new mongoose.Schema({
    participants: {
        type: [String], // قائمة بالبريد الإلكتروني للمشاركين في المحادثة (المالك والضامن)
        required: true,
    },
    landId: {
        type: mongoose.Schema.Types.ObjectId, // معرف الأرض المرتبطة بالمحادثة
        ref: "Land", // ربط مع جدول الأراضي
        required: true,
    },
    messages: {
        type: [messageSchema], // مصفوفة من الرسائل المرتبطة بهذه المحادثة
        default: [], // تعيين القيمة الافتراضية كمصفوفة فارغة
    },
    createdAt: { type: Date, default: Date.now }, // توقيت إنشاء المحادثة
});

const Chat = mongoose.model("Chat", chatSchema);

const activitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    details: {
      tools: [String],  // قائمة الأدوات كـ Strings (يمكنك استخدام ID للأدوات إذا كان لديك علاقة مع أدوات أخرى)
      skills: [String], // قائمة المهارات كـ Strings (نفس الشيء مع المهارات)
      factors: [String], // قائمة العوامل كـ Strings
      steps: [String]    // خطوات النشاط
    }
  });

// تعريف الـ Model
const Activity = mongoose.model('Activity', activitySchema);



  

module.exports ={OwnerFeedback,Chat, Activity,contract,
     WorkerSchedule, requests,DailyReport,WorkAnnouncement,
     Owner,Worker,Token,Land,works,Company,Work_analysis,Keywords,conHistory,
     keywordsSchema};
