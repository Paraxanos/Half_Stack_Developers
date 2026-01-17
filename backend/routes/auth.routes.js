// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifytoken');

// Test: Get user profile (protected)
router.get('/me', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    },
  });
});

module.exports = router;