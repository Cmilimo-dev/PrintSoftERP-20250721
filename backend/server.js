const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import modular components
const { initializeDatabase } = require('./src/models');
const apiRoutes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins. For production, specify allowed origins.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
  } else {
    next();
  }
});

// Initialize database
initializeDatabase();

// Mount API routes
app.use('/api', apiRoutes);
// Also mount as REST v1 API for frontend compatibility
app.use('/rest/v1', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'PrintSoft ERP Backend API', 
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      customers: '/api/customers',
      orders: '/api/orders', 
      inventory: '/api/inventory',
      subscriptions: '/api/subscriptions'
    }
  });
});

// Favicon route to prevent 404
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint for number generation settings
app.get('/test/number-generation', async (req, res) => {
  try {
    const { db } = require('./src/config/database');
    const query = `SELECT * FROM number_generation_settings WHERE is_active = 1 ORDER BY document_type`;
    
    const [rows] = await db.execute(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for generating numbers without auth
app.post('/test/generate-number/:type', async (req, res) => {
  try {
    const { generateNumber } = require('./src/controllers/numberGenerationController');
    // Create a mock request object
    const mockReq = {
      params: req.params,
      body: req.body
    };
    
    // Call the generateNumber function directly
    await generateNumber(mockReq, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
