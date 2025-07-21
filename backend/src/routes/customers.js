const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { getCustomers, createCustomer, updateCustomer, deleteCustomer, getLeads, createLead } = require('../controllers/customersController');

// All customer routes require authentication
router.use(authenticateToken);

// Customer routes
router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Leads routes
router.get('/leads', getLeads);
router.post('/leads', createLead);

module.exports = router;
