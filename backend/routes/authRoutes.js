
const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/isAuthenticate');

router.get('/verifyuser', requireLogin, (req, res) => {
  res.json({ user: req.user }); // Optional: send user data
});
 
module.exports = router;
