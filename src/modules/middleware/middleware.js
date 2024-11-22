const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = '1234#';  // The secret key you are using to sign and verify the token

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    // Get the Authorization header
    const authHeader = req.headers['authorization'];  // It's lowercase 'authorization'
    // Ensure that the token follows the format "Bearer <token>"
    const token = authHeader; // This will get the token part after 'Bearer'
    console.log(token);

    if (!token) {
        return res.status(401).json({ message: 'Token is required.' });
    }

    // Verify the token with the correct secret key
    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {  // Corrected here
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        // Attach the user to the request object for further use
        req.user = user;

        next();
    });
};

module.exports = { authenticateJWT };
