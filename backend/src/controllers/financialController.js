const { db } = require('../config/database');

const getTransactions = async (req, res) => {
  try {
    const [transactions] = await db.execute('SELECT * FROM financial_transactions ORDER BY transaction_date DESC');
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAccounts = async (req, res) => {
  try {
    const [accounts] = await db.execute('SELECT * FROM chart_of_accounts ORDER BY account_code');
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLedgerEntries = async (req, res) => {
  try {
    const [entries] = await db.execute('SELECT te.*, f.transaction_number as reference FROM transaction_entries te JOIN financial_transactions f ON te.transaction_id = f.id ORDER BY entry_date DESC');
    res.json(entries);
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAccountsReceivable = async (req, res) => {
  try {
    const [receivables] = await db.execute(`
      SELECT ft.*, c.name as customer_name 
      FROM financial_transactions ft 
      LEFT JOIN customers c ON ft.customer_id = c.id 
      WHERE ft.transaction_type = 'sale' AND ft.status = 'completed'
      ORDER BY ft.transaction_date DESC
    `);
    res.json(receivables);
  } catch (error) {
    console.error('Error fetching accounts receivable:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAccountsPayable = async (req, res) => {
  try {
    const [payables] = await db.execute(`
      SELECT ft.*, v.name as vendor_name 
      FROM financial_transactions ft 
      LEFT JOIN vendors v ON ft.vendor_id = v.id 
      WHERE ft.transaction_type = 'purchase' AND ft.status = 'completed'
      ORDER BY ft.transaction_date DESC
    `);
    res.json(payables);
  } catch (error) {
    console.error('Error fetching accounts payable:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const [invoices] = await db.execute(`
      SELECT ft.*, c.name as customer_name 
      FROM financial_transactions ft 
      LEFT JOIN customers c ON ft.customer_id = c.id 
      WHERE ft.transaction_type = 'sale'
      ORDER BY ft.transaction_date DESC
    `);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getReceipts = async (req, res) => {
  try {
    const [receipts] = await db.execute(`
      SELECT ft.*, c.name as customer_name 
      FROM financial_transactions ft 
      LEFT JOIN customers c ON ft.customer_id = c.id 
      WHERE ft.transaction_type = 'receipt'
      ORDER BY ft.transaction_date DESC
    `);
    res.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFinancialSummary = async (req, res) => {
  try {
    const [summary] = await db.execute(`
      SELECT 
        SUM(CASE WHEN transaction_type = 'sale' THEN total_amount ELSE 0 END) as total_sales,
        SUM(CASE WHEN transaction_type = 'purchase' THEN total_amount ELSE 0 END) as total_purchases,
        SUM(CASE WHEN transaction_type = 'receipt' THEN total_amount ELSE 0 END) as total_receipts,
        SUM(CASE WHEN transaction_type = 'payment' THEN total_amount ELSE 0 END) as total_payments,
        COUNT(*) as total_transactions
      FROM financial_transactions
      WHERE status = 'completed'
    `);
    res.json(summary[0]);
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTransactions,
  getAccounts,
  getLedgerEntries,
  getAccountsReceivable,
  getAccountsPayable,
  getInvoices,
  getReceipts,
  getFinancialSummary
};
