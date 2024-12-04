const express = require('express');
const connectDB = require('./src/modules/DB/connection.js'); // Import the connectDB function
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = 3000;
const router = express.Router();
const auth = require('./src/modules/auth/auth.js');
const owner = require('./src/modules/Owner/owner.js');
const worker=require('./src/modules/workers/worker.js')
connectDB();
app.use(express.json());

app.use(express.static('public'));
const cors = require('cors');
const company = require('./src/modules/company/company.js');
app.use(cors());

 app.use('/auth', auth);
 app.use('/owner', owner);
app.use('/company',company);
app.use('/worker',worker);

app.listen(2000, () => {
  console.log(`Server is running on porttttt ${PORT}`);
});
