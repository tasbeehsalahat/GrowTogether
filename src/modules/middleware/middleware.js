const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader;
console.log( token);
    if (!token) {
        return res.status(401).json({ message: 'Token is required.' });
    }
    jwt.verify(token, 'secretKey', (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        req.user = user;
        next();
    });

};

module.exports = { authenticateJWT };
