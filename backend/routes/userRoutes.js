
const express = require('express');
const router = express.Router();
let { signupHandler, loginHandler, getAllUser } = require('../controllers/user');

router.post('/login', loginHandler)
router.post('/signup', signupHandler) 
router.get('/all', getAllUser)
 
module.exports = router;
