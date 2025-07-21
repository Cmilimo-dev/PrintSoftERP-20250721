const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const subscriptionRoutes = require('./subscription');
const inventoryRoutes = require('./inventory');
const ordersRoutes = require('./orders');
const customersRoutes = require('./customers');
const leadsRoutes = require('./leads');
const vendorsRoutes = require('./vendors');
const financialRoutes = require('./financial');
const settingsRoutes = require('./settings');
const hrRoutes = require('./hr');
const mailboxRoutes = require('./mailbox');
const numberGenerationRoutes = require('./numberGeneration');
const categoriesRoutes = require('./categories');
const partsRoutes = require('./parts');

// Mount routes
router.use('/auth', authRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/plans', subscriptionRoutes); // Alias for plans
router.use('/inventory', inventoryRoutes);
router.use('/orders', ordersRoutes);
router.use('/customers', customersRoutes);
router.use('/leads', leadsRoutes);
router.use('/vendors', vendorsRoutes);
router.use('/financial', financialRoutes);
router.use('/mailbox', mailboxRoutes);
router.use('/number-generation', numberGenerationRoutes);
router.use('/settings', settingsRoutes);
router.use('/hr', hrRoutes);
router.use('/categories', categoriesRoutes);
router.use('/parts', partsRoutes);

module.exports = router;
