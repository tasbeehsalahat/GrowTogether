// استيراد المكتبة
const express = require('express');

// إنشاء تطبيق Express
const app = express();

// تحديد منفذ التشغيل
const PORT = 3000;

// إعداد مسار للتحقق من الاتصال
app.get('/', (req, res) => {
  res.send('Connection is successful!');
});

// بدء تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
