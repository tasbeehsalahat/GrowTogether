const jwt = require('jsonwebtoken');

// Middleware للتحقق من التوكن
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader; // استخراج التوكن من رأس الطلب

    if (!token) {
        return res.status(401).json({ message: 'Token is required.' });
    }

    jwt.verify(token, 'secretKey', (err, user) => {
        if (err) {
            console.log(err)
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        req.user = user; // تمرير بيانات المستخدم إلى الطلب
        next(); // المتابعة إلى الوظيفة التالية
    });
};

   

module.exports = {authenticateJWT };
