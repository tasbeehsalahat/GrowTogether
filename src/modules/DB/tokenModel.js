const mongoose = require('mongoose');

// Define the token schema
const tokenSchema = new mongoose.Schema({
    token: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: '1h'  // Token expiration time (1 hour)
    }
});

// Create the model from the schema
const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
