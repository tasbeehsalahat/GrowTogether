const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = '1234#'; 
const Token = require('../DB/tokenModel.js'); // Import the token model

const authenticateJWT = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden.ERROR.' });
        }

        try {
            // Query MongoDB for the token
            const tokenRecord = await Token.findOne({ token: token });

            if (!tokenRecord) {
                return res.status(403).json({ message: 'Forbidden. Invalid token.' });
            }

            req.user = decoded;
            next();
        } catch (error) {
            console.error('Error verifying token:', error);
            return res.status(500).json({ error: 'An error occurred while verifying the token.' });
        }
    });
};

module.exports = { authenticateJWT, JWT_SECRET_KEY };
