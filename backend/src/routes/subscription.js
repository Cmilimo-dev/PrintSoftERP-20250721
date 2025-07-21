const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { 
  getSubscription, 
  getSubscriptionPlans, 
  createSubscription 
} = require('../controllers/subscriptionController');

// Public routes (no authentication required)
router.get('/plans', getSubscriptionPlans);

// Protected routes (authentication required)
router.use(authenticateToken);
router.get('/', getSubscription);
router.post('/', createSubscription);

module.exports = router;
