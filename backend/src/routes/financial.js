const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { 
  getTransactions, 
  getAccounts, 
  getLedgerEntries,
  getAccountsReceivable,
  getAccountsPayable,
  getInvoices,
  getReceipts,
  getFinancialSummary
} = require('../controllers/financialController');

// All financial routes require authentication
router.use(authenticateToken);

// Financial routes
router.get('/transactions', getTransactions);
router.get('/accounts', getAccounts);
router.get('/ledger', getLedgerEntries);
router.get('/receivables', getAccountsReceivable);
router.get('/payables', getAccountsPayable);
router.get('/invoices', getInvoices);
router.get('/receipts', getReceipts);
router.get('/summary', getFinancialSummary);

module.exports = router;
