const mongoose = require('mongoose'); // استدعاء مكتبة mongoose

const db = require('../config/db'); // تعديل المسار الصحيح لاتصال قاعدة البيانات

const { Schema } = mongoose; // استخراج Schema من mongoose

// تعريف المخطط (Schema) الخاص بالمستخدم
const userSchema = new Schema({
  email: {
    type: String, // يجب أن تكون String مع S كبيرة
    lowercase: true,
    required: true,
    unique: true,
  },
  password: {
    type: String, // يجب أن تكون String مع S كبيرة
    required: true,
  },
});

// إنشاء نموذج المستخدم باستخدام اتصال قاعدة البيانات
const UserModel = db.model('User', userSchema); // 'User' هو اسم المجموعة في قاعدة البيانات

module.exports = UserModel; // تصدير النموذج لاستخدامه في أجزاء أخرى من التطبيق
