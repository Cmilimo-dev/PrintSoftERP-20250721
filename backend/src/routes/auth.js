const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { 
  login, 
  register, 
  registerSubUser, 
  getUserSubscriptionStatus 
} = require('../controllers/authController');

// Authentication routes (no auth required)
router.post('/login', login);
router.post('/register', register);
router.post('/register-sub-user', registerSubUser);

// Protected routes (authentication required)
router.use(authenticateToken);
router.get('/subscription-status', getUserSubscriptionStatus);

module.exports = router;
