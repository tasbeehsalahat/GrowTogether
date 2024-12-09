const mongoose = require('mongoose');

const connection = mongoose.createConnection('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true, 
});

connection.on('open', () => {
  console.log("MongoDB connected successfully");
});

connection.on('error', (err) => {
  console.error("MongoDB connection error:", err);
});

module.exports = connection;
