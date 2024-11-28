const mongoose = require('mongoose');
const keywordsMapping = {
  "حراثة": {
      skills: ["مزارع متخصص", "خبرة في الحراثة", "خبرة بالآلات الزراعية"],
      tools: ["آلة حراثة", "محراث", "جرار"]
  },
  "زراعة": {
      skills: ["مزارع", "خبرة في الزراعة", "خبرة في زراعة المحاصيل"],
      tools: ["محراث", "عربة زراعية", "أسمدة"]
  },
  "ري": {
      skills: ["تقني ري", "خبرة في أنظمة الري", "مزارع"],
      tools: ["أنظمة ري بالتنقيط", "مضخات مياه", "أنابيب ري"]
  },
  "حصاد": {
      skills: ["عامل حصاد", "خبرة في جمع المحاصيل", "خبرة في الزراعة"],
      tools: ["أدوات حصاد", "مقصات قطاف", "سلال"]
  },
  "تسميد": {
      skills: ["خبرة في التسميد", "مزارع", "تقني تسميد"],
      tools: ["أسمدة", "موزعات الأسمدة", "آلات تسميد"]
  },
  "مكافحة الآفات": {
      skills: ["خبير مكافحة آفات", "خبرة في مكافحة الحشرات", "خبرة في استخدام المبيدات"],
      tools: ["مبيدات حشرية", "رشاشات", "أدوات مكافحة الآفات"]
  },
  "تسوية الأرض": {
      skills: ["خبرة في تسوية الأرض", "مزارع", "متخصص في تجهيز الأراضي"],
      tools: ["معدات تسوية", "أدوات تمهيد الأرض", "جرافات"]
  },
  "إزالة الأعشاب الضارة": {
      skills: ["عامل إزالة الأعشاب", "خبرة في المكافحة", "خبرة في المعدات الزراعية"],
      tools: ["آلة إزالة الأعشاب", "مبيدات الأعشاب", "أدوات يدوية"]
  },
  "إعداد البيوت البلاستيكية": {
      skills: ["مزارع", "تقني محميات زراعية", "خبرة في البيوت البلاستيكية"],
      tools: ["بيوت بلاستيكية", "غلاف بلاستيكي", "معدات تركيب البيوت"]
  },
  "نقل المحاصيل": {
      skills: ["عامل نقل", "خبرة في شحن المحاصيل", "مزارع"],
      tools: ["عربة نقل", "شاحنة", "سلال"]
  }
};

// تعريف الـ Schema للمهارات والأدوات المرتبطة بالكلمات المفتاحية
const keywordsSchema = new mongoose.Schema({
    keyword: {
        type: String,
        required: true,
        unique: true
    },
    skills: [String],
    tools: [String]
});

// إنشاء نموذج باستخدام الـ Schema
const Keywords = mongoose.model('Keywords', keywordsSchema);

// الاتصال بقاعدة البيانات (تأكد من أنه لديك MongoDB يعمل على جهازك)
mongoose.connect('mongodb+srv://tasbeeh80:Aa123456**@cluster0.lu3yf.mongodb.net/growToGother', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

// تخزين البيانات في MongoDB
const saveKeywordsData = async () => {
    for (const keyword in keywordsMapping) {
        const data = {
            keyword: keyword,
            skills: keywordsMapping[keyword].skills,
            tools: keywordsMapping[keyword].tools
        };
        
        try {
            await Keywords.updateOne(
                { keyword: keyword },
                { $set: data },
                { upsert: true }  // هذا يجعل العملية تقوم بإضافة أو تحديث السجلات
            );
            console.log(`Data for ${keyword} saved/updated successfully.`);
        } catch (err) {
            console.error(`Error saving data for ${keyword}:`, err);
        }
    }
};

// تشغيل عملية حفظ البيانات
saveKeywordsData();
