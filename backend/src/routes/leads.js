const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { getLeads, createLead } = require('../controllers/customersController');

// All leads routes require authentication
router.use(authenticateToken);

// Leads routes
router.get('/', getLeads);
router.post('/', createLead);

module.exports = router;
