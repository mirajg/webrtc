
const express = require('express');
const { home } = require('../controllers/home.js');
let isAuthenticate = require('../middleware/isAuthenticate.js');
const router = express.Router();

router.get('/', isAuthenticate, home);

module.exports = router;