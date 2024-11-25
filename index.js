const express = require('express');
const connectDB = require('./src/modules/DB/connection.js'); // Import the connectDB function
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = 2000;
const router = express.Router();
//const p = require("./public/public.js")
const auth = require('./src/modules/auth/auth.js');
const owner = require('./src/modules/Owner/owner.js');
const maps = require('./src/modules/maps/maps.js')

connectDB();
app.use(express.json());

app.use(express.static('public'));
const cors = require('cors');
app.use(cors());

 app.use('/auth', auth);
 app.use('/owner', owner);
 app.use('/maps', maps);

app.listen(2000, () => {
  console.log(`Server is running on porttttt ${PORT}`);
});
