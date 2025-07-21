const { db, uuidv4 } = require('../config/database');

// Get subscription for current user
const getSubscription = (req, res) => {
  const userId = req.user.id;
  
  // For now, return a default subscription since we're using the basic backend
  res.json({
    id: 'default-subscription',
    user_id: userId,
    plan: 'free',
    status: 'active',
    created_at: new Date().toISOString(),
    expires_at: null
  });
};

// Get available subscription plans
const getSubscriptionPlans = (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      description: 'Free trial with basic features',
      price: 0,
      currency: 'USD',
      billing_period: 'monthly',
      features: [
        'Basic ERP features',
        'Up to 5 users',
        'Community support'
      ]
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      description: 'Full ERP access billed monthly',
      price: 49.99,
      currency: 'USD',
      billing_period: 'monthly',
      features: [
        'All ERP features',
        'Unlimited users',
        'Priority support',
        'Advanced reporting'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      description: 'Full ERP access billed yearly (2 months free)',
      price: 499.99,
      currency: 'USD',
      billing_period: 'yearly',
      features: [
        'All ERP features',
        'Unlimited users',
        'Priority support',
        'Advanced reporting',
        '2 months free'
      ]
    }
  ];

  res.json(plans);
};

// Create or update subscription
const createSubscription = (req, res) => {
  const { plan_id } = req.body;
  const userId = req.user.id;

  if (!plan_id) {
    return res.status(400).json({ error: 'Plan ID is required' });
  }

  // For now, just return success since we're using basic backend
  res.json({
    success: true,
    subscription: {
      id: uuidv4(),
      user_id: userId,
      plan: plan_id,
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: plan_id === 'yearly' ? 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() :
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
};

module.exports = {
  getSubscription,
  getSubscriptionPlans,
  createSubscription
};
