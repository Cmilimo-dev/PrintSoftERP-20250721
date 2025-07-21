const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  generateNumber,
  getNextNumber,
  resetCounter,
  getAllCounters,
  getAvailableFormatsEndpoint,
  previewNumberFormat,
  updateAllFormats
} = require('../controllers/numberGenerationController');

// Generate a new number for a document type
router.post('/generate-number/:type', authenticateToken, generateNumber);

// Get the next number for a document type without incrementing
router.get('/generate-number/:type/next', authenticateToken, getNextNumber);

// Reset counter for a document type
router.put('/generate-number/:type/reset', authenticateToken, resetCounter);

// Get all counters
router.get('/counters', authenticateToken, getAllCounters);

// Get available formats
router.get('/formats', authenticateToken, getAvailableFormatsEndpoint);

// Preview number format
router.post('/preview/:type', authenticateToken, previewNumberFormat);

// Update all formats
router.put('/formats/bulk-update', authenticateToken, updateAllFormats);

module.exports = router;
