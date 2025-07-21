const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { getSettings, updateSettings, resetSettings } = require('../controllers/settingsController');
const { 
  getAllCounters,
  getNumberGenerationSettings,
  updateNumberGenerationSettings,
  getAvailableFormatsEndpoint,
  previewNumberFormat,
  updateAllFormats
} = require('../controllers/numberGenerationController');

// Test endpoint without authentication
router.get('/number-generation/test', getNumberGenerationSettings);

// All settings routes require authentication
router.use(authenticateToken);

// General settings routes
router.get('/', getSettings);
router.post('/', updateSettings);
router.post('/reset', resetSettings);

// Number generation settings routes
router.get('/number-generation', getNumberGenerationSettings);
router.post('/number-generation', updateNumberGenerationSettings);
router.get('/number-generation/counters', getAllCounters);

// Number format management routes
router.get('/number-generation/formats', getAvailableFormatsEndpoint);
router.post('/number-generation/preview/:type', previewNumberFormat);
router.put('/number-generation/formats/bulk-update', updateAllFormats);

module.exports = router;
