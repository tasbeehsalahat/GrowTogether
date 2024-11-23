const router = express.Router();

const {authenticateJWT}=require('../middleware/middleware.js');
const { updateWorkerProfile } = require('./worker.controller.js');





router.patch('/update/:email',authenticateJWT,updateWorkerProfile);
