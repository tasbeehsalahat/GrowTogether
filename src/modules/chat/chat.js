const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Message = require('../DB/types.js'); // تأكد من وجود الموديل الصحيح

// 1. جلب الرسائل غير المقروءة
router.get('/:receiverEmail/unread', async (req, res) => {
    try {
        const { receiverEmail } = req.params;

        // جلب الرسائل باستخدام الإيميل كمستقبل
        const unreadMessages = await Message.find({ receiverId: receiverEmail, isRead: false }).sort({ createdAt: -1 });

        if (!unreadMessages.length) {
            return res.status(404).json({ success: false, message: 'لا توجد رسائل غير مقروءة' });
        }

        res.status(200).json({ success: true, messages: unreadMessages });
    } catch (err) {
        res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب الرسائل' });
    }
});

// 2. التحقق من البيانات عند إرسال الرسالة
const messageSchema = Joi.object({
    message: Joi.string().required().min(1).max(1000),
});

// إرسال رسالة جديدة
router.post('/send/:landId/:senderEmail/:receiverEmail', async (req, res) => {
    try {
        const { landId, senderEmail, receiverEmail } = req.params;
        const { message } = req.body;

        // التحقق من الرسالة
        const { error } = messageSchema.validate({ message });
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        // إنشاء الرسالة
        const newMessage = new Message({
            landId,
            senderId: senderEmail,
            receiverId: receiverEmail,
            message
        });

        await newMessage.save();

        res.status(201).json({
            success: true,
            message: 'تم إرسال الرسالة بنجاح',
            data: newMessage
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'حدث خطأ أثناء إرسال الرسالة' });
    }
});

// 3. جلب المحادثة باستخدام landId و الإيميل
router.get('/:landId/:receiverEmail/conversation', async (req, res) => {
    try {
        const { landId, receiverEmail } = req.params;

        // البحث عن الرسائل بين الطرفين باستخدام الإيميل
        const messages = await Message.find({
            landId,
            $or: [{ senderId: receiverEmail }, { receiverId: receiverEmail }]
        }).sort({ createdAt: 1 });

        if (!messages.length) {
            return res.status(404).json({ success: false, message: 'لا توجد رسائل في هذه المحادثة' });
        }

        // تحديث الرسائل إلى حالة مقروءة
        await Message.updateMany(
            { landId, receiverId: receiverEmail, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب المحادثة' });
    }
});

module.exports = router;
