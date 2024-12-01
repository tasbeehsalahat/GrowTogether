const router = express.Router();

const {authenticateJWT}=require('../middleware/middleware.js');
const { updateWorkerProfile, showLand } = require('./worker.controller.js');





router.patch('/update/:email',authenticateJWT,updateWorkerProfile);
router.get('/showlands',authenticateJWT,showLand);