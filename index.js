const express = require('express');
const connectDB = require('./src/modules/DB/connection.js'); // Import the connectDB function
const dotenv = require('dotenv');
dotenv.config();
const auth = require('./src/modules/auth/auth.js');
const owner = require('./src/modules/Owner/owner.js');
const worker = require('./src/modules/workers/worker.js');
const chat = require('./src/modules/chat/chat.js');
const axios = require('axios');
const cors = require('cors');
const company = require('./src/modules/company/company.js');

// Initialize app
const app = express();
const PORT = 2000;
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Connect to database
connectDB();

// Routes
app.use('/auth', auth);
app.use('/owner', owner);
app.use('/company', company);
app.use('/worker', worker);
app.use('/chat', chat);
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// دالة لتوليد PDF وإرساله للمستخدم
function generatePDF(req, res) {
    const doc = new PDFDocument();

    // تحديد مسار حفظ الملف على الخادم
    const filePath = path.join(__dirname, 'generated_files', 'dynamic_generated.pdf');

    // التأكد من أن المجلد موجود، إذا لم يكن موجودًا يتم إنشاؤه
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // إنشاء محتوى PDF ديناميكي
    doc.fontSize(20).text('تقرير مبيعات ديناميكي', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('هذا التقرير تم توليده بشكل ديناميكي في ' + new Date().toLocaleString());
    doc.moveDown();
    doc.fontSize(12).text('المزيد من التفاصيل حول المبيعات هنا...');
    doc.moveDown();
    doc.text('تفاصيل إضافية يمكن توليدها حسب المطلوب...');

    // حفظ الملف على الخادم أولًا
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // بعد حفظ الملف، نرسل الملف للمستخدم
    writeStream.on('finish', () => {
        // إرسال الملف المخزن للمستخدم
        res.sendFile(filePath, (err) => {
            if (err) {
                res.status(500).send('خطأ في إرسال الملف');
            }
        });
    });

    // إنهاء PDF
    doc.end();
}
app.get('/generate-pdf', generatePDF);

// API Request Example
const url = 'https://api-v2.distancematrix.ai/maps/api/distancematrix/json';
const params = {
  origins: '51.4822656,-0.1933769',
  destinations: '51.4994794,-0.1269979',
  key: 'Azhgd8l7rChAdvuvUJsPG8uSONBwZdSFHPrJrVW6uobu9GZk9idf9ahQRZBeyE58'
};

axios.get(url, { params })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

// Endpoint to get elevation data
app.get('/get-elevation', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).send('يجب توفير إحداثيات خط العرض والطول');
  }

  try {
    const response = await axios.get(`https://api-v2.distancematrix.ai/maps/api/distancematrix/json?origins=51.4822656,-0.1933769&destinations=51.4994794,-0.1269979&key=Azhgd8l7rChAdvuvUJsPG8uSONBwZdSFHPrJrVW6uobu9GZk9idf9ahQRZBeyE58`, {
      params: {
        locations: `${lat},${lon}`,
        key: 'Azhgd8l7rChAdvuvUJsPG8uSONBwZdSFHPrJrVW6uobu9GZk9idf9ahQRZBeyE58',
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const elevation = response.data.results[0].elevation;
      res.json({ elevation });
    } else {
      res.status(404).send('لم يتم العثور على بيانات الارتفاع لهذه الإحداثيات');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('حدث خطأ أثناء الاتصال بـ API');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
