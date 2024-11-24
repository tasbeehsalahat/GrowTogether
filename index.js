const express = require('express');
const connectDB = require('./src/modules/DB/connection.js'); // Import the connectDB function
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = 3000;
const router = express.Router();

const auth = require('./src/modules/auth/auth.js');
const owner = require('./src/modules/Owner/owner.js');

// Connect to MongoDB
connectDB();

app.use(express.json());
const cors = require('cors');
app.use(cors());


app.use('/auth', auth);
app.use('/owner', owner);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
