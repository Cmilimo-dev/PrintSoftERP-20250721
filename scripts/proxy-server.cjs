const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Authorization', 'Content-Type', 'apikey', 'x-client-info', 'prefer', 'accept-profile', 'content-profile'],
  exposedHeaders: ['Content-Range', 'Content-Location']
}));

// Add JSON body parsing middleware
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Proxy /auth/* to backend Express server
app.use('/auth', createProxyMiddleware({
  target: 'http://127.0.0.1:3003',
  changeOrigin: true,
  logLevel: 'debug',
  // Don't rewrite the path - preserve the /auth prefix
  pathRewrite: function(path, req) {
    return path; // Keep the original path including /auth
  },
  onProxyReq: function (proxyReq, req, res) {
    console.log(`Proxying auth: ${req.method} ${req.url} to ${proxyReq.getHeader('host')}`);
  },
  onProxyRes: function (proxyRes, req, res) {
    console.log(`Auth response: ${proxyRes.statusCode}`);
    // Add CORS headers for auth routes
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, apikey, x-client-info, prefer, accept-profile, content-profile';
    proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Range, Content-Location';
  },
  onError: function (err, req, res) {
    console.error('Auth proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
}));

// Proxy /rest/v1/* to PostgREST at root
app.use('/rest/v1', createProxyMiddleware({
  target: 'http://127.0.0.1:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/rest/v1': '', // Remove /rest/v1 prefix
  },
  onProxyReq: function (proxyReq, req, res) {
    // Forward Supabase authentication headers properly
    if (req.headers.apikey) {
      proxyReq.setHeader('Authorization', 'Bearer ' + req.headers.apikey);
    }
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    console.log(`Proxying: ${req.method} ${req.url}`);
  },
  onProxyRes: function (proxyRes, req, res) {
    // Add CORS headers with explicit Authorization header
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, apikey, x-client-info, prefer, accept-profile, content-profile';
    proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Range, Content-Location';
  }
}));

// Authentication endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, planId, companyName } = req.body;
  
  // Mock user registration with subscription
  if (!email || !password || !planId) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and plan selection are required'
    });
  }

  // Mock user creation
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  const adminToken = 'admin_' + Math.random().toString(36).substr(2, 16);
  
  // Calculate subscription expiry based on plan
  let expiresAt;
  const now = new Date();
  
  if (planId === 'trial') {
    expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  } else if (planId.includes('monthly')) {
    expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  } else if (planId.includes('yearly')) {
    expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  }

  const mockUser = {
    id: userId,
    email,
    firstName,
    lastName,
    role: 'admin', // First user is always admin
    companyName: companyName || `${firstName}'s Company`,
    adminToken: adminToken, // Token for sharing subscription
    subscription: {
      isActive: true,
      plan: planId,
      expiresAt: expiresAt.toISOString(),
      maxUsers: planId === 'trial' ? 1 : (planId.includes('enterprise') ? 'unlimited' : 10),
      maxCompanies: planId.includes('enterprise') ? 'unlimited' : 1
    },
    createdAt: now.toISOString()
  };

  // Mock JWT token
  const token = 'jwt_' + Math.random().toString(36).substr(2, 32);

  res.json({
    success: true,
    message: 'User registered successfully',
    user: mockUser,
    token,
    adminToken // Share this token with team members
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, adminToken } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Mock user authentication
  const mockUser = {
    id: 'user_123',
    email,
    firstName: 'John',
    lastName: 'Doe',
    role: adminToken ? 'user' : 'admin', // If using admin token, user is regular user
    companyName: 'Demo Company',
    subscription: {
      isActive: true,
      plan: 'professional_monthly',
      expiresAt: '2025-12-31T23:59:59.000Z',
      maxUsers: 10,
      maxCompanies: 1
    }
  };

  const token = 'jwt_' + Math.random().toString(36).substr(2, 32);

  res.json({
    success: true,
    message: 'Login successful',
    user: mockUser,
    token
  });
});

app.post('/api/auth/invite-user', (req, res) => {
  const { email, adminToken } = req.body;
  
  if (!email || !adminToken) {
    return res.status(400).json({
      success: false,
      message: 'Email and admin token are required'
    });
  }

  // Mock user invitation
  res.json({
    success: true,
    message: 'User invitation sent successfully',
    inviteLink: `${req.protocol}://${req.get('host')}/register?token=${adminToken}&email=${encodeURIComponent(email)}`
  });
});

// Subscription management endpoints
app.get('/api/user/subscription', (req, res) => {
  // Mock subscription data - replace with real database logic
  const mockUser = {
    id: 'user_123',
    subscription: {
      isActive: true,
      expiresAt: '2025-12-31T23:59:59.000Z',
      plan: 'professional',
      features: ['basic_invoicing', 'basic_reports', 'inventory_management', 'advanced_reports', 'multi_user']
    }
  };

  res.json(mockUser.subscription);
});

app.get('/api/subscription/plans', (req, res) => {
  // Mock subscription plans - replace with real database logic
  const plans = [
    {
      id: 'trial',
      name: '7-Day Free Trial',
      price: 0,
      currency: 'USD',
      interval: 'trial',
      trialDays: 7,
      maxCompanies: 1,
      maxUsers: 1,
      features: [
        'All Professional features',
        'Single company setup',
        'Admin access only',
        '7-day trial period',
        'Email support'
      ]
    },
    {
      id: 'professional_monthly',
      name: 'Professional Monthly',
      price: 79,
      currency: 'USD',
      interval: 'monthly',
      maxCompanies: 1,
      maxUsers: 10,
      features: [
        'All ERP features',
        'Single company setup',
        'Up to 10 users',
        'Admin token sharing',
        'Priority support',
        'Advanced reports'
      ]
    },
    {
      id: 'professional_yearly',
      name: 'Professional Yearly',
      price: 790,
      currency: 'USD',
      interval: 'yearly',
      maxCompanies: 1,
      maxUsers: 10,
      savings: '20% savings',
      features: [
        'All ERP features',
        'Single company setup',
        'Up to 10 users',
        'Admin token sharing',
        'Priority support',
        'Advanced reports',
        '2 months free'
      ]
    },
    {
      id: 'enterprise_monthly',
      name: 'Enterprise Monthly',
      price: 199,
      currency: 'USD',
      interval: 'monthly',
      maxCompanies: 'unlimited',
      maxUsers: 'unlimited',
      features: [
        'All Professional features',
        'Multi-company support',
        'Unlimited users',
        'White-label options',
        'API access',
        'Custom integrations',
        '24/7 phone support'
      ]
    },
    {
      id: 'enterprise_yearly',
      name: 'Enterprise Yearly',
      price: 1990,
      currency: 'USD',
      interval: 'yearly',
      maxCompanies: 'unlimited',
      maxUsers: 'unlimited',
      savings: '20% savings',
      features: [
        'All Professional features',
        'Multi-company support',
        'Unlimited users',
        'White-label options',
        'API access',
        'Custom integrations',
        '24/7 phone support',
        '2 months free'
      ]
    }
  ];

  res.json(plans);
});

app.post('/api/subscription/subscribe', (req, res) => {
  const { planId } = req.body;
  
  // Mock subscription logic - replace with real payment processing
  if (!planId) {
    return res.status(400).json({
      success: false,
      message: 'Plan ID is required'
    });
  }

  // Simulate payment processing
  console.log(`Processing subscription for plan: ${planId}`);
  
  // For demo purposes, return success with a mock payment URL
  if (planId === 'free') {
    res.json({
      success: true,
      message: 'Successfully subscribed to free plan'
    });
  } else {
    // For paid plans, return a mock Stripe/payment URL
    res.json({
      success: true,
      message: 'Redirecting to payment processor',
      paymentUrl: `https://mock-payment-processor.com/checkout?plan=${planId}&user=user_123`
    });
  }
});

// Handle auth endpoints (mock for development) - keep as fallback
app.use('/auth/v1', (req, res) => {
  res.json({ message: 'Auth endpoint not implemented in local development' });
});

const port = 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Supabase-compatible proxy server running on http://localhost:${port}`);
  console.log(`Proxying /rest/v1/* to PostgREST at http://127.0.0.1:3002`);
});
