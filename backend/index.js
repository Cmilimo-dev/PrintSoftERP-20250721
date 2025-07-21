const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import MySQL database connection for customer routes
const { db: mysqlDb } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./printsoft.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Initialize database tables
const initializeDatabase = () => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create roles table
  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT, -- JSON array of permissions
      is_system_role BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create permissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create user_roles table (many-to-many)
  db.run(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      assigned_by TEXT,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (role_id) REFERENCES roles(id),
      UNIQUE(user_id, role_id)
    )
  `);

  // Create number_generation_settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS number_generation_settings (
      id TEXT PRIMARY KEY,
      document_type TEXT UNIQUE NOT NULL,
      prefix TEXT DEFAULT '',
      suffix TEXT DEFAULT '',
      next_number INTEGER DEFAULT 1,
      number_length INTEGER DEFAULT 6,
      separator TEXT DEFAULT '-',
      format TEXT DEFAULT 'prefix-number',
      auto_increment BOOLEAN DEFAULT TRUE,
      reset_frequency TEXT DEFAULT 'never', -- never, daily, monthly, yearly
      last_reset_date DATE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create document_sequences table for tracking generated numbers
  db.run(`
    CREATE TABLE IF NOT EXISTS document_sequences (
      id TEXT PRIMARY KEY,
      document_type TEXT NOT NULL,
      document_number TEXT NOT NULL,
      sequence_number INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (document_type) REFERENCES number_generation_settings(document_type)
    )
  `);

  // Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      category TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, key)
    )
  `);

  // User Profiles table for extended profile information
  db.run(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT,
      timezone TEXT DEFAULT 'Africa/Nairobi',
      language TEXT DEFAULT 'en',
      date_format TEXT DEFAULT 'DD/MM/YYYY',
      time_format TEXT DEFAULT '24h',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // User Email Preferences table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_email_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      notifications BOOLEAN DEFAULT true,
      newsletters BOOLEAN DEFAULT false,
      security BOOLEAN DEFAULT true,
      marketing BOOLEAN DEFAULT false,
      system_updates BOOLEAN DEFAULT true,
      weekly_digest BOOLEAN DEFAULT false,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // System Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      subcategory TEXT,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      data_type TEXT DEFAULT 'string',
      description TEXT,
      is_required BOOLEAN DEFAULT false,
      is_encrypted BOOLEAN DEFAULT false,
      validation_rules TEXT,
      default_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      updated_by TEXT,
      UNIQUE(category, subcategory, key)
    )
  `);

  // Company Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      legal_name TEXT,
      registration_number TEXT,
      tax_id TEXT,
      vat_number TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      logo_url TEXT,
      currency TEXT DEFAULT 'KES',
      timezone TEXT DEFAULT 'Africa/Nairobi',
      date_format TEXT DEFAULT 'DD/MM/YYYY',
      time_format TEXT DEFAULT '24h',
      fiscal_year_start TEXT DEFAULT '01-01',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tax Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS tax_settings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rate DECIMAL(5,2) NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      is_default BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      applies_to TEXT,
      effective_from DATE,
      effective_to DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Layout Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS layout_settings (
      id TEXT PRIMARY KEY,
      document_type TEXT NOT NULL,
      template_name TEXT NOT NULL,
      template_data TEXT,
      numbering_pattern TEXT,
      auto_numbering BOOLEAN DEFAULT true,
      next_number INTEGER DEFAULT 1,
      prefix TEXT,
      suffix TEXT,
      padding_length INTEGER DEFAULT 4,
      reset_frequency TEXT DEFAULT 'never',
      is_active BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Payment Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS payment_settings (
      id TEXT PRIMARY KEY,
      provider_name TEXT NOT NULL,
      provider_type TEXT NOT NULL,
      api_key TEXT,
      api_secret TEXT,
      webhook_url TEXT,
      is_active BOOLEAN DEFAULT false,
      is_sandbox BOOLEAN DEFAULT true,
      configuration TEXT,
      supported_currencies TEXT,
      fees_configuration TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Signature Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS signature_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      signature_type TEXT NOT NULL,
      signature_data TEXT,
      certificate_path TEXT,
      is_default BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Integration Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS integration_settings (
      id TEXT PRIMARY KEY,
      service_name TEXT NOT NULL,
      service_type TEXT NOT NULL,
      api_endpoint TEXT,
      api_key TEXT,
      api_secret TEXT,
      webhook_url TEXT,
      configuration TEXT,
      is_active BOOLEAN DEFAULT false,
      last_sync DATETIME,
      sync_frequency TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User Roles table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      role_name TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings Audit table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings_audit (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      action TEXT NOT NULL,
      old_values TEXT,
      new_values TEXT,
      changed_by TEXT NOT NULL,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'product',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Warehouses table
  db.run(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      manager_id TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Customers table
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      customer_number TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      company_name TEXT,
      customer_type TEXT DEFAULT 'individual',
      email TEXT,
      phone TEXT,
      mobile TEXT,
      fax TEXT,
      website TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'Kenya',
      tax_id TEXT,
      vat_number TEXT,
      credit_limit DECIMAL(12,2) DEFAULT 0,
      payment_terms INTEGER DEFAULT 30,
      currency TEXT DEFAULT 'KES',
      preferred_payment_method TEXT,
      discount_percentage DECIMAL(5,2) DEFAULT 0,
      price_list_id TEXT,
      territory TEXT,
      sales_rep_id TEXT,
      customer_group TEXT,
      industry TEXT,
      lead_source TEXT,
      tags TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      internal_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      updated_by TEXT
    )
  `);

  // Customer Contacts table
  db.run(`
    CREATE TABLE IF NOT EXISTS customer_contacts (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      contact_type TEXT DEFAULT 'primary',
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      title TEXT,
      email TEXT,
      phone TEXT,
      mobile TEXT,
      department TEXT,
      is_primary BOOLEAN DEFAULT false,
      is_billing BOOLEAN DEFAULT false,
      is_shipping BOOLEAN DEFAULT false,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Customer Addresses table
  db.run(`
    CREATE TABLE IF NOT EXISTS customer_addresses (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      address_type TEXT DEFAULT 'billing',
      label TEXT,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT,
      country TEXT NOT NULL,
      is_default BOOLEAN DEFAULT false,
      is_billing BOOLEAN DEFAULT false,
      is_shipping BOOLEAN DEFAULT false,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Customer Notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS customer_notes (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      note TEXT NOT NULL,
      note_type TEXT DEFAULT 'general',
      is_important BOOLEAN DEFAULT false,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Customer Documents table
  db.run(`
    CREATE TABLE IF NOT EXISTS customer_documents (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      document_name TEXT NOT NULL,
      document_type TEXT,
      file_url TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      uploaded_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      description TEXT,
      price DECIMAL(10,2),
      cost DECIMAL(10,2),
      stock_quantity INTEGER DEFAULT 0,
      unit_of_measure TEXT DEFAULT 'pcs',
      category TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Parts table
  db.run(`
    CREATE TABLE IF NOT EXISTS parts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      description TEXT,
      cost DECIMAL(10,2),
      stock_quantity INTEGER DEFAULT 0,
      unit_of_measure TEXT DEFAULT 'pcs',
      supplier_id TEXT,
      category TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vendors table
  db.run(`
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      vendor_number TEXT UNIQUE,
      company_name TEXT,
      supplier_type TEXT DEFAULT 'company',
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'Kenya',
      credit_limit DECIMAL(12,2) DEFAULT 0,
      preferred_currency TEXT DEFAULT 'USD',
      payment_terms INTEGER DEFAULT 30,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Leads table
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      company_name TEXT,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'Kenya',
      source TEXT,
      lead_source TEXT,
      status TEXT DEFAULT 'new',
      priority TEXT DEFAULT 'medium',
      estimated_value DECIMAL(12,2) DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Product Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS product_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inventory table
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      reserved_quantity INTEGER DEFAULT 0,
      available_quantity INTEGER DEFAULT 0,
      minimum_stock INTEGER DEFAULT 0,
      reorder_point INTEGER DEFAULT 0,
      maximum_stock INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    )
  `);

  // Stock Movements table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      warehouse_id TEXT,
      movement_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_cost DECIMAL(12,2),
      reference_type TEXT,
      reference_id TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Stock Transfer table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_transfers (
      id TEXT PRIMARY KEY,
      transfer_number TEXT NOT NULL,
      from_warehouse_id TEXT NOT NULL,
      to_warehouse_id TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      requested_date DATETIME NOT NULL,
      scheduled_date DATETIME,
      shipped_date DATETIME,
      received_date DATETIME,
      requested_by TEXT NOT NULL,
      approved_by TEXT,
      shipped_by TEXT,
      received_by TEXT,
      tracking_number TEXT,
      carrier TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Stock Transfer Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_transfer_items (
      id TEXT PRIMARY KEY,
      transfer_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      requested_quantity INTEGER NOT NULL,
      shipped_quantity INTEGER DEFAULT 0,
      received_quantity INTEGER DEFAULT 0,
      unit_cost DECIMAL(12,2) NOT NULL,
      batch_number TEXT,
      notes TEXT,
      FOREIGN KEY (transfer_id) REFERENCES stock_transfers(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Stock Adjustment table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_adjustments (
      id TEXT PRIMARY KEY,
      adjustment_number TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      type TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      approved_by TEXT,
      approved_at DATETIME,
      performed_by TEXT,
      performed_at DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Stock Adjustment Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_adjustment_items (
      id TEXT PRIMARY KEY,
      adjustment_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      current_quantity INTEGER NOT NULL,
      adjusted_quantity INTEGER NOT NULL,
      variance INTEGER NOT NULL,
      unit_cost DECIMAL(12,2) NOT NULL,
      total_cost_impact DECIMAL(12,2) NOT NULL,
      reason TEXT,
      batch_number TEXT,
      notes TEXT,
      FOREIGN KEY (adjustment_id) REFERENCES stock_adjustments(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Physical Count table
  db.run(`
    CREATE TABLE IF NOT EXISTS physical_counts (
      id TEXT PRIMARY KEY,
      count_number TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      status TEXT DEFAULT 'planned',
      type TEXT NOT NULL,
      scheduled_date DATETIME NOT NULL,
      started_date DATETIME,
      completed_date DATETIME,
      assigned_to TEXT,
      supervised_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Physical Count Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS physical_count_items (
      id TEXT PRIMARY KEY,
      count_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      expected_quantity INTEGER NOT NULL,
      counted_quantity INTEGER DEFAULT 0,
      variance INTEGER DEFAULT 0,
      variance_value DECIMAL(12,2) DEFAULT 0,
      unit_cost DECIMAL(12,2) NOT NULL,
      batch_number TEXT,
      counted_by TEXT,
      counted_at DATETIME,
      notes TEXT,
      is_recounted BOOLEAN DEFAULT false,
      FOREIGN KEY (count_id) REFERENCES physical_counts(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Low Stock Alerts table
  db.run(`
    CREATE TABLE IF NOT EXISTS low_stock_alerts (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      current_quantity INTEGER NOT NULL,
      reorder_point INTEGER NOT NULL,
      reorder_quantity INTEGER NOT NULL,
      alert_level TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      acknowledged_by TEXT,
      acknowledged_at DATETIME,
      resolved BOOLEAN DEFAULT false,
      resolved_at DATETIME,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    )
  `);

  // Batch Records table
  db.run(`
    CREATE TABLE IF NOT EXISTS batch_records (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      expiry_date DATETIME,
      manufacture_date DATETIME,
      supplier_lot_number TEXT,
      received_date DATETIME NOT NULL,
      cost DECIMAL(12,2) NOT NULL,
      notes TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Serial Records table
  db.run(`
    CREATE TABLE IF NOT EXISTS serial_records (
      id TEXT PRIMARY KEY,
      serial_number TEXT NOT NULL,
      product_id TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      purchase_date DATETIME,
      sale_date DATETIME,
      warranty_expiry_date DATETIME,
      notes TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Inventory Valuation table
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory_valuation (
      id TEXT PRIMARY KEY,
      valuation_date DATETIME NOT NULL,
      warehouse_id TEXT,
      method TEXT NOT NULL,
      total_quantity INTEGER NOT NULL,
      total_value DECIMAL(12,2) NOT NULL,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inventory Valuation Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory_valuation_items (
      id TEXT PRIMARY KEY,
      valuation_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_cost DECIMAL(12,2) NOT NULL,
      total_value DECIMAL(12,2) NOT NULL,
      valuation_method TEXT NOT NULL,
      FOREIGN KEY (valuation_id) REFERENCES inventory_valuation(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    )
  `);

// Chart of Accounts table
  db.run(`
    CREATE TABLE IF NOT EXISTS chart_of_accounts (
      id TEXT PRIMARY KEY,
      account_code TEXT NOT NULL,
      account_name TEXT NOT NULL,
      account_type TEXT,
      parent_account_id TEXT,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      balance DECIMAL(12,2) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Financial Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS financial_transactions (
      id TEXT PRIMARY KEY,
      transaction_number TEXT NOT NULL,
      transaction_date DATETIME NOT NULL,
      transaction_type TEXT NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      description TEXT,
      customer_id TEXT,
      vendor_id TEXT,
      subtotal DECIMAL(12,2),
      tax_amount DECIMAL(12,2),
      discount_amount DECIMAL(12,2),
      total_amount DECIMAL(12,2),
      currency TEXT,
      status TEXT DEFAULT 'pending',
      affects_inventory BOOLEAN DEFAULT false,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transaction Entries table
  db.run(`
    CREATE TABLE IF NOT EXISTS transaction_entries (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      account_id TEXT,
      description TEXT,
      debit_amount DECIMAL(12,2),
      credit_amount DECIMAL(12,2),
      entry_date DATETIME,
      reference_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Currency Rates table
  db.run(`
    CREATE TABLE IF NOT EXISTS currency_rates (
      id TEXT PRIMARY KEY,
      base_currency TEXT NOT NULL,
      target_currency TEXT NOT NULL,
      rate DECIMAL(12,6) NOT NULL,
      effective_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      expense_number TEXT NOT NULL,
      expense_date DATE NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      amount DECIMAL(12,2) NOT NULL,
      currency TEXT NOT NULL,
      vendor_id TEXT,
      account_id TEXT,
      payment_method TEXT,
      receipt_number TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      receipt_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Invoices table (extended)
  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      date DATE NOT NULL,
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'draft',
      currency TEXT DEFAULT 'KES',
      exchange_rate DECIMAL(10,6) DEFAULT 1.0,
      subtotal DECIMAL(12,2) NOT NULL,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      discount_amount DECIMAL(12,2) DEFAULT 0,
      total_amount DECIMAL(12,2) NOT NULL,
      paid_amount DECIMAL(12,2) DEFAULT 0,
      balance_amount DECIMAL(12,2) NOT NULL,
      terms TEXT,
      notes TEXT,
      internal_notes TEXT,
      sent_at DATETIME,
      viewed_at DATETIME,
      last_reminder_sent DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      updated_by TEXT
    )
  `);

  // Invoice Line Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoice_line_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      product_id TEXT,
      description TEXT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      discount_percentage DECIMAL(5,2) DEFAULT 0,
      discount_amount DECIMAL(12,2) DEFAULT 0,
      tax_rate_id TEXT,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      total_amount DECIMAL(12,2) NOT NULL,
      account_id TEXT,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Invoice Taxes table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoice_taxes (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      tax_rate_id TEXT NOT NULL,
      tax_name TEXT NOT NULL,
      rate DECIMAL(5,2) NOT NULL,
      taxable_amount DECIMAL(12,2) NOT NULL,
      tax_amount DECIMAL(12,2) NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);

  // Invoice Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoice_payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      payment_id TEXT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id),
      FOREIGN KEY (payment_id) REFERENCES payments(id)
    )
  `);

  // Invoice Attachments table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoice_attachments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      uploaded_by TEXT,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);

  // Bills table
  db.run(`
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      bill_number TEXT NOT NULL,
      supplier_invoice_number TEXT,
      supplier_id TEXT NOT NULL,
      date DATE NOT NULL,
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'draft',
      currency TEXT DEFAULT 'KES',
      exchange_rate DECIMAL(10,6) DEFAULT 1.0,
      subtotal DECIMAL(12,2) NOT NULL,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      discount_amount DECIMAL(12,2) DEFAULT 0,
      total_amount DECIMAL(12,2) NOT NULL,
      paid_amount DECIMAL(12,2) DEFAULT 0,
      balance_amount DECIMAL(12,2) NOT NULL,
      terms TEXT,
      notes TEXT,
      internal_notes TEXT,
      received_at DATETIME,
      approved_by TEXT,
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      updated_by TEXT
    )
  `);

  // Bill Line Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS bill_line_items (
      id TEXT PRIMARY KEY,
      bill_id TEXT NOT NULL,
      product_id TEXT,
      description TEXT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      discount_percentage DECIMAL(5,2) DEFAULT 0,
      discount_amount DECIMAL(12,2) DEFAULT 0,
      tax_rate_id TEXT,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      total_amount DECIMAL(12,2) NOT NULL,
      account_id TEXT,
      FOREIGN KEY (bill_id) REFERENCES bills(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Bill Taxes table
  db.run(`
    CREATE TABLE IF NOT EXISTS bill_taxes (
      id TEXT PRIMARY KEY,
      bill_id TEXT NOT NULL,
      tax_rate_id TEXT NOT NULL,
      tax_name TEXT NOT NULL,
      rate DECIMAL(5,2) NOT NULL,
      taxable_amount DECIMAL(12,2) NOT NULL,
      tax_amount DECIMAL(12,2) NOT NULL,
      FOREIGN KEY (bill_id) REFERENCES bills(id)
    )
  `);

  // Bill Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS bill_payments (
      id TEXT PRIMARY KEY,
      bill_id TEXT NOT NULL,
      payment_id TEXT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      FOREIGN KEY (bill_id) REFERENCES bills(id),
      FOREIGN KEY (payment_id) REFERENCES payments(id)
    )
  `);

  // Bill Attachments table
  db.run(`
    CREATE TABLE IF NOT EXISTS bill_attachments (
      id TEXT PRIMARY KEY,
      bill_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      uploaded_by TEXT,
      FOREIGN KEY (bill_id) REFERENCES bills(id)
    )
  `);

  // Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      payment_number TEXT NOT NULL,
      type TEXT NOT NULL,
      date DATE NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      currency TEXT DEFAULT 'KES',
      exchange_rate DECIMAL(10,6) DEFAULT 1.0,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      reference TEXT,
      description TEXT,
      from_account_id TEXT,
      to_account_id TEXT,
      customer_id TEXT,
      supplier_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      updated_by TEXT,
      notes TEXT
    )
  `);

  // Payment Attachments table
  db.run(`
    CREATE TABLE IF NOT EXISTS payment_attachments (
      id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      uploaded_by TEXT,
      FOREIGN KEY (payment_id) REFERENCES payments(id)
    )
  `);

  // Payment Fees table
  db.run(`
    CREATE TABLE IF NOT EXISTS payment_fees (
      id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      account_id TEXT,
      FOREIGN KEY (payment_id) REFERENCES payments(id)
    )
  `);

  // Tax Rates table
  db.run(`
    CREATE TABLE IF NOT EXISTS tax_rates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      rate DECIMAL(5,2) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      is_default BOOLEAN DEFAULT false,
      valid_from DATE NOT NULL,
      valid_to DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bank Accounts table
  db.run(`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id TEXT PRIMARY KEY,
      account_name TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      routing_number TEXT,
      iban TEXT,
      swift_code TEXT,
      currency TEXT DEFAULT 'KES',
      account_type TEXT NOT NULL,
      current_balance DECIMAL(12,2) DEFAULT 0,
      available_balance DECIMAL(12,2) DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      is_default BOOLEAN DEFAULT false,
      chart_of_accounts_id TEXT,
      last_reconciled_date DATE,
      last_reconciled_balance DECIMAL(12,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    )
  `);

  // Bank Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS bank_transactions (
      id TEXT PRIMARY KEY,
      bank_account_id TEXT NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      reference TEXT,
      amount DECIMAL(12,2) NOT NULL,
      type TEXT NOT NULL,
      balance DECIMAL(12,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      journal_entry_id TEXT,
      payment_id TEXT,
      category TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
    )
  `);

  // Bank Reconciliations table
  db.run(`
    CREATE TABLE IF NOT EXISTS bank_reconciliations (
      id TEXT PRIMARY KEY,
      bank_account_id TEXT NOT NULL,
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      statement_balance DECIMAL(12,2) NOT NULL,
      book_balance DECIMAL(12,2) NOT NULL,
      status TEXT DEFAULT 'in_progress',
      completed_by TEXT,
      completed_at DATETIME,
      reviewed_by TEXT,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
    )
  `);

  // Reconciliation Adjustments table
  db.run(`
    CREATE TABLE IF NOT EXISTS reconciliation_adjustments (
      id TEXT PRIMARY KEY,
      reconciliation_id TEXT NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      type TEXT NOT NULL,
      account_id TEXT,
      journal_entry_id TEXT,
      FOREIGN KEY (reconciliation_id) REFERENCES bank_reconciliations(id)
    )
  `);

  // Budgets table
  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      period TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT DEFAULT 'draft',
      currency TEXT DEFAULT 'KES',
      total_budget_amount DECIMAL(12,2) NOT NULL,
      total_actual_amount DECIMAL(12,2) DEFAULT 0,
      total_variance DECIMAL(12,2) DEFAULT 0,
      approved_by TEXT,
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      updated_by TEXT,
      notes TEXT
    )
  `);

  // Budget Line Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS budget_line_items (
      id TEXT PRIMARY KEY,
      budget_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      description TEXT,
      budget_amount DECIMAL(12,2) NOT NULL,
      actual_amount DECIMAL(12,2) DEFAULT 0,
      variance DECIMAL(12,2) DEFAULT 0,
      variance_percentage DECIMAL(5,2) DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (budget_id) REFERENCES budgets(id),
      FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id)
    )
  `);

  // Journal Entries table
  db.run(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      entry_number TEXT NOT NULL,
      date DATE NOT NULL,
      reference TEXT,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      total_debit DECIMAL(12,2) NOT NULL,
      total_credit DECIMAL(12,2) NOT NULL,
      currency TEXT DEFAULT 'KES',
      exchange_rate DECIMAL(10,6) DEFAULT 1.0,
      approved_by TEXT,
      approved_at DATETIME,
      posted_by TEXT,
      posted_at DATETIME,
      reversed_by TEXT,
      reversed_at DATETIME,
      reversal_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      updated_by TEXT
    )
  `);

  // Journal Line Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS journal_line_items (
      id TEXT PRIMARY KEY,
      journal_entry_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      description TEXT,
      debit_amount DECIMAL(12,2) DEFAULT 0,
      credit_amount DECIMAL(12,2) DEFAULT 0,
      currency TEXT DEFAULT 'KES',
      exchange_rate DECIMAL(10,6) DEFAULT 1.0,
      tax_rate_id TEXT,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      customer_id TEXT,
      supplier_id TEXT,
      project_id TEXT,
      department_id TEXT,
      notes TEXT,
      FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
      FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id)
    )
  `);

  // Journal Attachments table
  db.run(`
    CREATE TABLE IF NOT EXISTS journal_attachments (
      id TEXT PRIMARY KEY,
      journal_entry_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      uploaded_by TEXT,
      FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
    )
  `);

  // Financial Reports table
  db.run(`
    CREATE TABLE IF NOT EXISTS financial_reports (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      period TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      currency TEXT DEFAULT 'KES',
      parameters TEXT,
      data TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      generated_by TEXT,
      is_scheduled BOOLEAN DEFAULT false,
      schedule_config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Financial Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS financial_settings (
      id TEXT PRIMARY KEY,
      base_currency TEXT DEFAULT 'KES',
      fiscal_year_start DATE NOT NULL,
      tax_settings TEXT,
      numbering_settings TEXT,
      account_settings TEXT,
      report_settings TEXT,
      integration_settings TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

// Quotations table
  db.run(`
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      quote_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      total_amount DECIMAL(12,2),
      status TEXT DEFAULT 'draft',
      valid_until DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Quotation items table
  db.run(`
    CREATE TABLE IF NOT EXISTS quotation_items (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL,
      product_id TEXT,
      description TEXT,
      quantity DECIMAL(10,2),
      unit_price DECIMAL(10,2),
      total_price DECIMAL(12,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Sales orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS sales_orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      quotation_id TEXT,
      total_amount DECIMAL(12,2),
      status TEXT DEFAULT 'pending',
      order_date DATE,
      delivery_date DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (quotation_id) REFERENCES quotations(id)
    )
  `);

  // Sales order items table
  db.run(`
    CREATE TABLE IF NOT EXISTS sales_order_items (
      id TEXT PRIMARY KEY,
      sales_order_id TEXT NOT NULL,
      product_id TEXT,
      description TEXT,
      quantity DECIMAL(10,2),
      unit_price DECIMAL(10,2),
      total_price DECIMAL(12,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Delivery Notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS delivery_notes (
      id TEXT PRIMARY KEY,
      delivery_note_number TEXT UNIQUE NOT NULL,
      sales_order_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      delivery_date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      warehouse_id TEXT,
      delivery_address TEXT,
      delivery_method TEXT,
      tracking_number TEXT,
      driver_name TEXT,
      vehicle_number TEXT,
      delivered_by TEXT,
      received_by TEXT,
      delivery_time TIME,
      notes TEXT,
      internal_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    )
  `);

// Delivery Note Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS delivery_note_items (
      id TEXT PRIMARY KEY,
      delivery_note_id TEXT NOT NULL,
      sales_order_item_id TEXT NOT NULL,
      product_id TEXT,
      description TEXT NOT NULL,
      ordered_quantity DECIMAL(10,2) NOT NULL,
      delivered_quantity DECIMAL(10,2) NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      total_value DECIMAL(12,2) NOT NULL,
      batch_number TEXT,
      serial_numbers TEXT,
      condition_status TEXT DEFAULT 'good',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (delivery_note_id) REFERENCES delivery_notes(id),
      FOREIGN KEY (sales_order_item_id) REFERENCES sales_order_items(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Shipments table
  db.run(`
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      delivery_note_id TEXT NOT NULL,
      carrier_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      shipped_date DATE,
      estimated_delivery_date DATE,
      actual_delivery_date DATE,
      shipping_cost DECIMAL(12,2),
      tracking_number TEXT,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (delivery_note_id) REFERENCES delivery_notes(id),
      FOREIGN KEY (carrier_id) REFERENCES carriers(id)
    )
  `);

  // Tracking Information table
  db.run(`
    CREATE TABLE IF NOT EXISTS tracking_information (
      id TEXT PRIMARY KEY,
      shipment_id TEXT NOT NULL,
      status TEXT NOT NULL,
      location TEXT,
      updated_by TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      remarks TEXT,
      FOREIGN KEY (shipment_id) REFERENCES shipments(id)
    )
  `);

  // Carriers table
  db.run(`
    CREATE TABLE IF NOT EXISTS carriers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_number TEXT,
      email TEXT,
      address TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Customer Returns table
  db.run(`
    CREATE TABLE IF NOT EXISTS customer_returns (
      id TEXT PRIMARY KEY,
      return_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      sales_order_id TEXT,
      delivery_note_id TEXT,
      return_date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      return_type TEXT NOT NULL,
      reason TEXT NOT NULL,
      total_items INTEGER DEFAULT 0,
      total_value DECIMAL(12,2) DEFAULT 0,
      refund_amount DECIMAL(12,2) DEFAULT 0,
      refund_status TEXT DEFAULT 'pending',
      replacement_requested BOOLEAN DEFAULT false,
      returned_by TEXT,
      received_by TEXT,
      approved_by TEXT,
      approved_at DATETIME,
      notes TEXT,
      internal_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (delivery_note_id) REFERENCES delivery_notes(id)
    )
  `);

  // Customer Return Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS customer_return_items (
      id TEXT PRIMARY KEY,
      return_id TEXT NOT NULL,
      delivery_note_item_id TEXT,
      product_id TEXT,
      description TEXT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      total_value DECIMAL(12,2) NOT NULL,
      condition_status TEXT,
      return_reason TEXT,
      batch_number TEXT,
      serial_numbers TEXT,
      refund_amount DECIMAL(12,2) DEFAULT 0,
      replacement_requested BOOLEAN DEFAULT false,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (return_id) REFERENCES customer_returns(id),
      FOREIGN KEY (delivery_note_item_id) REFERENCES delivery_note_items(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Companies table for purchase orders
  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      country TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      tax_id TEXT NOT NULL,
      logo TEXT,
      website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vendors table for purchase orders
  db.run(`
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      vendor_number TEXT,
      company_name TEXT,
      supplier_type TEXT,
      contact_person TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT,
      postal_code TEXT,
      country TEXT,
      expected_delivery TEXT,
      phone TEXT,
      email TEXT,
      tax_id TEXT,
      capabilities TEXT,
      preferred_currency TEXT,
      payment_terms TEXT,
      lead_time INTEGER,
      credit_limit DECIMAL(12,2),
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Purchase orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      document_number TEXT UNIQUE NOT NULL,
      date DATE NOT NULL,
      company_id TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      total DECIMAL(12,2) NOT NULL,
      currency TEXT DEFAULT 'KES',
      subtotal DECIMAL(12,2) NOT NULL,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      tax_type TEXT DEFAULT 'vat_inclusive',
      default_tax_rate DECIMAL(5,2) DEFAULT 0,
      qr_code_data TEXT,
      notes TEXT,
      terms TEXT,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (vendor_id) REFERENCES vendors(id)
    )
  `);

  // Purchase order items table
  db.run(`
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id TEXT PRIMARY KEY,
      purchase_order_id TEXT NOT NULL,
      item_code TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      total DECIMAL(12,2) NOT NULL,
      tax_rate DECIMAL(5,2) DEFAULT 0,
      tax_amount DECIMAL(12,2) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
    )
  `);

  // Goods Receiving table
  db.run(`
    CREATE TABLE IF NOT EXISTS goods_receiving (
      id TEXT PRIMARY KEY,
      grn_number TEXT UNIQUE NOT NULL,
      purchase_order_id TEXT NOT NULL,
      vendor_id TEXT NOT NULL,
      receiving_date DATE NOT NULL,
      status TEXT DEFAULT 'draft',
      warehouse_id TEXT,
      total_items INTEGER DEFAULT 0,
      received_by TEXT,
      inspector TEXT,
      quality_check_status TEXT DEFAULT 'pending',
      notes TEXT,
      internal_notes TEXT,
      delivery_note_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    )
  `);

  // Goods Receiving Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS goods_receiving_items (
      id TEXT PRIMARY KEY,
      grn_id TEXT NOT NULL,
      purchase_order_item_id TEXT NOT NULL,
      product_id TEXT,
      item_code TEXT NOT NULL,
      description TEXT NOT NULL,
      ordered_quantity DECIMAL(10,2) NOT NULL,
      received_quantity DECIMAL(10,2) NOT NULL,
      rejected_quantity DECIMAL(10,2) DEFAULT 0,
      accepted_quantity DECIMAL(10,2) NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      total_value DECIMAL(12,2) NOT NULL,
      batch_number TEXT,
      expiry_date DATE,
      serial_numbers TEXT,
      condition_status TEXT DEFAULT 'good',
      rejection_reason TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (grn_id) REFERENCES goods_receiving(id),
      FOREIGN KEY (purchase_order_item_id) REFERENCES purchase_order_items(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Vendor Returns table
  db.run(`
    CREATE TABLE IF NOT EXISTS vendor_returns (
      id TEXT PRIMARY KEY,
      return_number TEXT UNIQUE NOT NULL,
      vendor_id TEXT NOT NULL,
      grn_id TEXT,
      return_date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      return_type TEXT NOT NULL,
      reason TEXT NOT NULL,
      total_items INTEGER DEFAULT 0,
      total_value DECIMAL(12,2) DEFAULT 0,
      refund_amount DECIMAL(12,2) DEFAULT 0,
      refund_status TEXT DEFAULT 'pending',
      replacement_requested BOOLEAN DEFAULT false,
      returned_by TEXT,
      approved_by TEXT,
      approved_at DATETIME,
      notes TEXT,
      internal_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      FOREIGN KEY (grn_id) REFERENCES goods_receiving(id)
    )
  `);

  // Vendor Return Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS vendor_return_items (
      id TEXT PRIMARY KEY,
      return_id TEXT NOT NULL,
      grn_item_id TEXT,
      product_id TEXT,
      item_code TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      total_value DECIMAL(12,2) NOT NULL,
      condition_status TEXT,
      return_reason TEXT,
      batch_number TEXT,
      serial_numbers TEXT,
      refund_amount DECIMAL(12,2) DEFAULT 0,
      replacement_requested BOOLEAN DEFAULT false,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (return_id) REFERENCES vendor_returns(id),
      FOREIGN KEY (grn_item_id) REFERENCES goods_receiving_items(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // HR Management Tables
  
  // Employees table
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      employee_id TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      position TEXT,
      department TEXT,
      hire_date DATE,
      salary DECIMAL(12,2),
      status TEXT DEFAULT 'active',
      manager_id TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'Kenya',
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      bank_account_number TEXT,
      bank_name TEXT,
      tax_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES employees(id)
    )
  `);

  // Departments table
  db.run(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      manager_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES employees(id)
    )
  `);

  // Leave Requests table
  db.run(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      employee_name TEXT,
      leave_type TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days_requested INTEGER NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      approved_by TEXT,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  // Payroll Records table
  db.run(`
    CREATE TABLE IF NOT EXISTS payroll_records (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      employee_name TEXT,
      pay_period_start DATE NOT NULL,
      pay_period_end DATE NOT NULL,
      base_salary DECIMAL(12,2) NOT NULL,
      overtime_hours DECIMAL(8,2) DEFAULT 0,
      overtime_rate DECIMAL(10,2) DEFAULT 0,
      bonuses DECIMAL(12,2) DEFAULT 0,
      deductions DECIMAL(12,2) DEFAULT 0,
      gross_pay DECIMAL(12,2) NOT NULL,
      tax_deductions DECIMAL(12,2) DEFAULT 0,
      net_pay DECIMAL(12,2) NOT NULL,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  // Performance Reviews table
  db.run(`
    CREATE TABLE IF NOT EXISTS performance_reviews (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      review_period TEXT NOT NULL,
      overall_rating INTEGER CHECK(overall_rating >= 1 AND overall_rating <= 5),
      technical_skills INTEGER CHECK(technical_skills >= 1 AND technical_skills <= 5),
      communication INTEGER CHECK(communication >= 1 AND communication <= 5),
      teamwork INTEGER CHECK(teamwork >= 1 AND teamwork <= 5),
      leadership INTEGER CHECK(leadership >= 1 AND leadership <= 5),
      problem_solving INTEGER CHECK(problem_solving >= 1 AND problem_solving <= 5),
      goals TEXT,
      achievements TEXT,
      areas_for_improvement TEXT,
      next_period_goals TEXT,
      reviewer_comments TEXT,
      review_date DATE NOT NULL,
      reviewer_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (reviewer_id) REFERENCES employees(id)
    )
  `);

  // Mailbox Tables
  
  // Messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      is_draft BOOLEAN DEFAULT false,
      is_read BOOLEAN DEFAULT false,
      is_starred BOOLEAN DEFAULT false,
      is_archived BOOLEAN DEFAULT false,
      is_deleted BOOLEAN DEFAULT false,
      reply_to_id TEXT,
      thread_id TEXT,
      attachments TEXT,
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (reply_to_id) REFERENCES messages(id)
    )
  `);

  // Message Recipients table
  db.run(`
    CREATE TABLE IF NOT EXISTS message_recipients (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      recipient_type TEXT DEFAULT 'to',
      is_read BOOLEAN DEFAULT false,
      is_starred BOOLEAN DEFAULT false,
      is_archived BOOLEAN DEFAULT false,
      is_deleted BOOLEAN DEFAULT false,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES messages(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    )
  `);

  // Message Attachments table
  db.run(`
    CREATE TABLE IF NOT EXISTS message_attachments (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES messages(id)
    )
  `);

  // Message Folders table
  db.run(`
    CREATE TABLE IF NOT EXISTS message_folders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'custom',
      icon TEXT,
      color TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Message Folder Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS message_folder_items (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES message_folders(id),
      FOREIGN KEY (message_id) REFERENCES messages(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(folder_id, message_id, user_id)
    )
  `);

  console.log('Database tables initialized');
  
  // Initialize default data
  initializeDefaultData();
};

// Initialize default data
const initializeDefaultData = () => {
  // Insert default roles
  const defaultRoles = [
    {
      id: uuidv4(),
      name: 'admin',
      description: 'System Administrator with full access',
      permissions: JSON.stringify(['*']),
      is_system_role: true
    },
    {
      id: uuidv4(),
      name: 'Super Administrator',
      description: 'Super Administrator with all permissions',
      permissions: JSON.stringify(['*']),
      is_system_role: true
    },
    {
      id: uuidv4(),
      name: 'manager',
      description: 'Manager with access to most features',
      permissions: JSON.stringify([
        'customers.read', 'customers.write', 'customers.delete',
        'sales.read', 'sales.write', 'sales.delete',
        'purchases.read', 'purchases.write', 'purchases.delete',
        'inventory.read', 'inventory.write',
        'financial.read', 'financial.write',
        'reports.read', 'reports.write',
        'settings.read'
      ]),
      is_system_role: true
    },
    {
      id: uuidv4(),
      name: 'user',
      description: 'Regular user with limited access',
      permissions: JSON.stringify([
        'customers.read', 'customers.write',
        'sales.read', 'sales.write',
        'purchases.read', 'purchases.write',
        'inventory.read',
        'financial.read',
        'reports.read'
      ]),
      is_system_role: true
    },
    {
      id: uuidv4(),
      name: 'viewer',
      description: 'View-only access',
      permissions: JSON.stringify([
        'customers.read',
        'sales.read',
        'purchases.read',
        'inventory.read',
        'financial.read',
        'reports.read'
      ]),
      is_system_role: true
    }
  ];

  defaultRoles.forEach(role => {
    db.run(`
      INSERT OR IGNORE INTO roles (id, name, description, permissions, is_system_role)
      VALUES (?, ?, ?, ?, ?)
    `, [role.id, role.name, role.description, role.permissions, role.is_system_role]);
  });

  // Insert default permissions
  const defaultPermissions = [
    // Customer permissions
    { id: uuidv4(), name: 'customers.read', description: 'View customers', module: 'customers', action: 'read', resource: 'customer' },
    { id: uuidv4(), name: 'customers.write', description: 'Create/Edit customers', module: 'customers', action: 'write', resource: 'customer' },
    { id: uuidv4(), name: 'customers.delete', description: 'Delete customers', module: 'customers', action: 'delete', resource: 'customer' },
    
    // Sales permissions
    { id: uuidv4(), name: 'sales.read', description: 'View sales documents', module: 'sales', action: 'read', resource: 'sales' },
    { id: uuidv4(), name: 'sales.write', description: 'Create/Edit sales documents', module: 'sales', action: 'write', resource: 'sales' },
    { id: uuidv4(), name: 'sales.delete', description: 'Delete sales documents', module: 'sales', action: 'delete', resource: 'sales' },
    
    // Purchase permissions
    { id: uuidv4(), name: 'purchases.read', description: 'View purchase documents', module: 'purchases', action: 'read', resource: 'purchase' },
    { id: uuidv4(), name: 'purchases.write', description: 'Create/Edit purchase documents', module: 'purchases', action: 'write', resource: 'purchase' },
    { id: uuidv4(), name: 'purchases.delete', description: 'Delete purchase documents', module: 'purchases', action: 'delete', resource: 'purchase' },
    
    // Inventory permissions
    { id: uuidv4(), name: 'inventory.read', description: 'View inventory', module: 'inventory', action: 'read', resource: 'inventory' },
    { id: uuidv4(), name: 'inventory.write', description: 'Manage inventory', module: 'inventory', action: 'write', resource: 'inventory' },
    { id: uuidv4(), name: 'inventory.delete', description: 'Delete inventory items', module: 'inventory', action: 'delete', resource: 'inventory' },
    
    // Financial permissions
    { id: uuidv4(), name: 'financial.read', description: 'View financial data', module: 'financial', action: 'read', resource: 'financial' },
    { id: uuidv4(), name: 'financial.write', description: 'Manage financial data', module: 'financial', action: 'write', resource: 'financial' },
    { id: uuidv4(), name: 'financial.delete', description: 'Delete financial records', module: 'financial', action: 'delete', resource: 'financial' },
    
    // Reports permissions
    { id: uuidv4(), name: 'reports.read', description: 'View reports', module: 'reports', action: 'read', resource: 'reports' },
    { id: uuidv4(), name: 'reports.write', description: 'Create/Edit reports', module: 'reports', action: 'write', resource: 'reports' },
    
    // Settings permissions
    { id: uuidv4(), name: 'settings.read', description: 'View settings', module: 'settings', action: 'read', resource: 'settings' },
    { id: uuidv4(), name: 'settings.write', description: 'Manage settings', module: 'settings', action: 'write', resource: 'settings' },
    { id: uuidv4(), name: 'settings.system', description: 'Manage system settings', module: 'settings', action: 'system', resource: 'settings' }
  ];

  defaultPermissions.forEach(permission => {
    db.run(`
      INSERT OR IGNORE INTO permissions (id, name, description, module, action, resource)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [permission.id, permission.name, permission.description, permission.module, permission.action, permission.resource]);
  });

  // Insert default number generation settings
  const defaultNumberSettings = [
    { document_type: 'customer', prefix: 'CUST', next_number: 1, number_length: 6 },
    { document_type: 'lead', prefix: 'LEAD', next_number: 1, number_length: 6 },
    { document_type: 'vendor', prefix: 'VEND', next_number: 1, number_length: 6 },
    { document_type: 'product', prefix: 'ITEM', next_number: 1, number_length: 6 },
    { document_type: 'purchase_order', prefix: 'PO', next_number: 1, number_length: 6 },
    { document_type: 'sales_order', prefix: 'SO', next_number: 1, number_length: 6 },
    { document_type: 'quotation', prefix: 'QUO', next_number: 1, number_length: 6 },
    { document_type: 'invoice', prefix: 'INV', next_number: 1, number_length: 6 },
    { document_type: 'delivery_note', prefix: 'DN', next_number: 1, number_length: 6 },
    { document_type: 'payment_receipt', prefix: 'PR', next_number: 1, number_length: 6 },
    { document_type: 'customer_return', prefix: 'CR', next_number: 1, number_length: 6 },
    { document_type: 'vendor_return', prefix: 'VR', next_number: 1, number_length: 6 },
    { document_type: 'goods_receiving', prefix: 'GR', next_number: 1, number_length: 6 },
    { document_type: 'credit_note', prefix: 'CN', next_number: 1, number_length: 6 },
    { document_type: 'debit_note', prefix: 'DN', next_number: 1, number_length: 6 },
    { document_type: 'stock_adjustment', prefix: 'SA', next_number: 1, number_length: 6 },
    { document_type: 'stock_transfer', prefix: 'ST', next_number: 1, number_length: 6 },
    { document_type: 'expense_claim', prefix: 'EC', next_number: 1, number_length: 6 }
  ];

  defaultNumberSettings.forEach(setting => {
    db.run(`
      INSERT OR IGNORE INTO number_generation_settings 
      (id, document_type, prefix, next_number, number_length, separator, format, auto_increment, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuidv4(), setting.document_type, setting.prefix, setting.next_number, setting.number_length, '-', 'prefix-number', true, true]);
  });

  // Create default admin user
  createDefaultAdminUser();

  console.log('Default data initialized');
};

// Create default admin user
const createDefaultAdminUser = async () => {
  try {
    // Check if admin user already exists
    db.get('SELECT id FROM users WHERE email = ?', ['admin@printsoft.com'], async (err, row) => {
      if (err) {
        console.error('Error checking for admin user:', err);
        return;
      }
      
      if (row) {
        console.log('Admin user already exists');
        return;
      }
      
      // Create admin user
      const adminPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminId = uuidv4();
      
      db.run(`
        INSERT INTO users (id, email, password, first_name, last_name, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [adminId, 'admin@printsoft.com', hashedPassword, 'Admin', 'User', 'admin'], function(err) {
        if (err) {
          console.error('Error creating admin user:', err);
        } else {
          console.log('Default admin user created successfully');
          console.log('Email: admin@printsoft.com');
          console.log('Password: admin123');
        }
      });
    });
  } catch (error) {
    console.error('Error in createDefaultAdminUser:', error);
  }
};

// Express Routes

// Authentication routes (no auth required)
app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt:', JSON.stringify(req.body));
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Missing credentials - email:', email, 'password:', password);
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password exists
    if (!user.password) {
      console.error('User has no password:', email);
      return res.status(500).json({ error: 'User account is not properly configured' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      return res.status(500).json({ error: 'Authentication error' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, first_name, last_name, role = 'user' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    db.run(
      'INSERT INTO users (id, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [id, email, hashedPassword, first_name, last_name, role],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign(
          { id, email, role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          success: true,
          token: token,
          user: { id, email, first_name, last_name, role }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Subscription routes
app.get('/api/subscription', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  // For now, return a default subscription since we're using the basic backend
  res.json({
    id: 'default-subscription',
    user_id: userId,
    plan_id: 'PLAN_TRIAL',
    status: 'active',
    trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    created_at: new Date().toISOString()
  });
});

app.get('/api/subscription-plans', (req, res) => {
  // Return the available subscription plans
  res.json([
    {
      id: 'PLAN_TRIAL',
      name: 'Trial Plan',
      description: '30-day free trial with full access',
      price: 0,
      currency: 'KES',
      billing_cycle: 'trial',
      features: ['All features', '30-day trial', 'Email support'],
      is_trial: true
    },
    {
      id: 'PLAN_BASIC',
      name: 'Basic Plan',
      description: 'Perfect for small businesses',
      price: 2999,
      currency: 'KES',
      billing_cycle: 'monthly',
      features: ['Core ERP features', 'Up to 5 users', 'Email support'],
      is_trial: false
    },
    {
      id: 'PLAN_PRO',
      name: 'Professional Plan',
      description: 'Advanced features for growing businesses',
      price: 4999,
      currency: 'KES',
      billing_cycle: 'monthly',
      features: ['All ERP features', 'Up to 25 users', 'Priority support', 'Advanced reporting'],
      is_trial: false
    },
    {
      id: 'PLAN_ENTERPRISE',
      name: 'Enterprise Plan',
      description: 'Complete solution for large organizations',
      price: 9999,
      currency: 'KES',
      billing_cycle: 'monthly',
      features: ['All features', 'Unlimited users', '24/7 support', 'Custom integrations'],
      is_trial: false
    }
  ]);
});

// HR Management Routes

// Employees routes
app.get('/rest/v1/employees', authenticateToken, (req, res) => {
  db.all('SELECT * FROM employees ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/rest/v1/employees/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(row);
  });
});

app.post('/rest/v1/employees', authenticateToken, (req, res) => {
  const {
    employee_id, first_name, last_name, email, phone, position,
    department, hire_date, salary, status, manager_id, address,
    city, state, postal_code, country, emergency_contact_name,
    emergency_contact_phone, bank_account_number, bank_name, tax_number
  } = req.body;
  
  const id = uuidv4();
  
  db.run(
    `INSERT INTO employees (
      id, employee_id, first_name, last_name, email, phone, position,
      department, hire_date, salary, status, manager_id, address,
      city, state, postal_code, country, emergency_contact_name,
      emergency_contact_phone, bank_account_number, bank_name, tax_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, employee_id, first_name, last_name, email, phone, position,
      department, hire_date, salary, status || 'active', manager_id, address,
      city, state, postal_code, country || 'Kenya', emergency_contact_name,
      emergency_contact_phone, bank_account_number, bank_name, tax_number
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating employee' });
      }
      res.status(201).json({ id, message: 'Employee created successfully' });
    }
  );
});

app.put('/rest/v1/employees/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    employee_id, first_name, last_name, email, phone, position,
    department, hire_date, salary, status, manager_id, address,
    city, state, postal_code, country, emergency_contact_name,
    emergency_contact_phone, bank_account_number, bank_name, tax_number
  } = req.body;
  
  db.run(
    `UPDATE employees SET 
      employee_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, position = ?,
      department = ?, hire_date = ?, salary = ?, status = ?, manager_id = ?, address = ?,
      city = ?, state = ?, postal_code = ?, country = ?, emergency_contact_name = ?,
      emergency_contact_phone = ?, bank_account_number = ?, bank_name = ?, tax_number = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      employee_id, first_name, last_name, email, phone, position,
      department, hire_date, salary, status, manager_id, address,
      city, state, postal_code, country, emergency_contact_name,
      emergency_contact_phone, bank_account_number, bank_name, tax_number, id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating employee' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json({ message: 'Employee updated successfully' });
    }
  );
});

app.delete('/rest/v1/employees/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  });
});

// Leave Requests routes
app.get('/rest/v1/leave_requests', authenticateToken, (req, res) => {
  db.all('SELECT * FROM leave_requests ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/leave_requests', authenticateToken, (req, res) => {
  const {
    employee_id, employee_name, leave_type, start_date, end_date,
    days_requested, reason, status
  } = req.body;
  
  const id = uuidv4();
  
  db.run(
    `INSERT INTO leave_requests (
      id, employee_id, employee_name, leave_type, start_date, end_date,
      days_requested, reason, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, employee_id, employee_name, leave_type, start_date, end_date,
     days_requested, reason, status || 'pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating leave request' });
      }
      res.status(201).json({ id, message: 'Leave request created successfully' });
    }
  );
});

app.put('/rest/v1/leave_requests/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, approved_by, rejection_reason } = req.body;
  
  db.run(
    `UPDATE leave_requests SET 
      status = ?, approved_by = ?, approved_at = ?, rejection_reason = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [status, approved_by, status === 'approved' ? new Date().toISOString() : null, rejection_reason, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating leave request' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      res.json({ message: 'Leave request updated successfully' });
    }
  );
});

// Payroll Records routes
app.get('/rest/v1/payroll_records', authenticateToken, (req, res) => {
  db.all('SELECT * FROM payroll_records ORDER BY pay_period_start DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/payroll_records', authenticateToken, (req, res) => {
  const {
    employee_id, employee_name, pay_period_start, pay_period_end,
    base_salary, overtime_hours, overtime_rate, bonuses, deductions,
    gross_pay, tax_deductions, net_pay, status
  } = req.body;
  
  const id = uuidv4();
  
  db.run(
    `INSERT INTO payroll_records (
      id, employee_id, employee_name, pay_period_start, pay_period_end,
      base_salary, overtime_hours, overtime_rate, bonuses, deductions,
      gross_pay, tax_deductions, net_pay, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, employee_id, employee_name, pay_period_start, pay_period_end,
      base_salary, overtime_hours || 0, overtime_rate || 0, bonuses || 0, deductions || 0,
      gross_pay, tax_deductions || 0, net_pay, status || 'draft'
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating payroll record' });
      }
      res.status(201).json({ id, message: 'Payroll record created successfully' });
    }
  );
});

// Performance Reviews routes
app.get('/rest/v1/performance_reviews', authenticateToken, (req, res) => {
  db.all('SELECT * FROM performance_reviews ORDER BY review_date DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/performance_reviews', authenticateToken, (req, res) => {
  const {
    employee_id, review_period, overall_rating, technical_skills,
    communication, teamwork, leadership, problem_solving, goals,
    achievements, areas_for_improvement, next_period_goals,
    reviewer_comments, review_date, reviewer_id
  } = req.body;
  
  const id = uuidv4();
  
  db.run(
    `INSERT INTO performance_reviews (
      id, employee_id, review_period, overall_rating, technical_skills,
      communication, teamwork, leadership, problem_solving, goals,
      achievements, areas_for_improvement, next_period_goals,
      reviewer_comments, review_date, reviewer_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, employee_id, review_period, overall_rating, technical_skills,
      communication, teamwork, leadership, problem_solving, goals,
      achievements, areas_for_improvement, next_period_goals,
      reviewer_comments, review_date, reviewer_id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating performance review' });
      }
      res.status(201).json({ id, message: 'Performance review created successfully' });
    }
  );
});

// Departments routes
app.get('/rest/v1/departments', authenticateToken, (req, res) => {
  db.all('SELECT * FROM departments ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/departments', authenticateToken, (req, res) => {
  const { name, description, manager_id } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO departments (id, name, description, manager_id) VALUES (?, ?, ?, ?)',
    [id, name, description, manager_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating department' });
      }
      res.status(201).json({ id, message: 'Department created successfully' });
    }
  );
});

// HR Test Route
app.get('/rest/v1/test-hr', authenticateToken, (req, res) => {
  res.json({ message: 'HR test route working', timestamp: new Date().toISOString() });
});

// Employees Test Route
app.get('/rest/v1/employees-test', authenticateToken, (req, res) => {
  db.all('SELECT * FROM employees ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(rows || []);
  });
});

// User Profile routes
app.get('/rest/v1/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get('SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  });
});

app.put('/rest/v1/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name } = req.body;

  db.run('UPDATE users SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [first_name, last_name, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error updating profile' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully' });
  });
});

// Change Password route
app.put('/rest/v1/profile/password', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  // Get the user's current password from the database
  db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(current_password, row.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Update password in database
    db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedNewPassword, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating password' });
      }
      res.json({ message: 'Password updated successfully' });
    });
  });
});

// User Settings routes
app.get('/rest/v1/settings', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all('SELECT key, value, category FROM user_settings WHERE user_id = ? ORDER BY category, key', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.put('/rest/v1/settings', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const settings = req.body.settings;

  if (!settings || !Array.isArray(settings)) {
    return res.status(400).json({ error: 'Settings must be an array' });
  }

  db.run('BEGIN TRANSACTION');

  let completed = 0;
  const total = settings.length;

  if (total === 0) {
    db.run('COMMIT');
    return res.json({ message: 'No settings to update' });
  }

  settings.forEach(({ key, value, category = 'user' }) => {
    const settingId = uuidv4();
    db.run(
      'INSERT INTO user_settings (id, user_id, key, value, category) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
      [settingId, userId, key, value, category],
      function(err) {
        if (err) {
          console.error(err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error updating settings' });
        }
        
        completed++;
        if (completed === total) {
          db.run('COMMIT', [], err => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Settings updated successfully' });
          });
        }
      }
    );
  });
});

// Get specific setting
app.get('/rest/v1/settings/:key', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { key } = req.params;

  db.get('SELECT key, value, category FROM user_settings WHERE user_id = ? AND key = ?', [userId, key], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(row);
  });
});

// Update specific setting
app.put('/rest/v1/settings/:key', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { key } = req.params;
  const { value, category = 'user' } = req.body;

  if (!value) {
    return res.status(400).json({ error: 'Value is required' });
  }

  const settingId = uuidv4();
  db.run(
    'INSERT INTO user_settings (id, user_id, key, value, category) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
    [settingId, userId, key, value, category],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating setting' });
      }
      res.json({ message: 'Setting updated successfully' });
    }
  );
});

// Delete specific setting
app.delete('/rest/v1/settings/:key', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { key } = req.params;

  db.run('DELETE FROM user_settings WHERE user_id = ? AND key = ?', [userId, key], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ message: 'Setting deleted successfully' });
  });
});

// Company Settings routes
app.get('/rest/v1/company-settings', authenticateToken, (req, res) => {
  db.get('SELECT * FROM company_settings ORDER BY created_at DESC LIMIT 1', [], (err, row) => {
    if (err) {
      console.error('Database error fetching company settings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Return empty object with default structure if no settings found
    if (!row) {
      return res.json({
        id: null,
        company_name: '',
        legal_name: '',
        registration_number: '',
        tax_id: '',
        vat_number: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        logo_url: '',
        currency: 'KES',
        timezone: 'Africa/Nairobi',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        fiscal_year_start: '01-01'
      });
    }
    
    res.json(row);
  });
});

// Alternative endpoint for mobile app compatibility
app.get('/api/company-settings', authenticateToken, (req, res) => {
  db.get('SELECT * FROM company_settings ORDER BY created_at DESC LIMIT 1', [], (err, row) => {
    if (err) {
      console.error('Database error fetching company settings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Return structured response for mobile
    const companyData = row || {
      company_name: '',
      legal_name: '',
      registration_number: '',
      tax_id: '',
      vat_number: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      logo_url: '',
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      date_format: 'DD/MM/YYYY',
      time_format: '24h',
      fiscal_year_start: '01-01'
    };
    
    res.json({
      success: true,
      data: companyData
    });
  });
});

// Get company profile (simplified for mobile)
app.get('/api/company/profile', authenticateToken, (req, res) => {
  db.get('SELECT * FROM company_settings ORDER BY created_at DESC LIMIT 1', [], (err, row) => {
    if (err) {
      console.error('Database error fetching company profile:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.json({
        success: true,
        data: {
          name: '',
          email: '',
          phone: '',
          address: '',
          logo: ''
        }
      });
    }
    
    // Return simplified company profile
    res.json({
      success: true,
      data: {
        name: row.company_name || '',
        legal_name: row.legal_name || '',
        email: row.email || '',
        phone: row.phone || '',
        address: `${row.address_line1 || ''} ${row.address_line2 || ''}, ${row.city || ''}, ${row.state || ''} ${row.postal_code || ''}`.trim(),
        country: row.country || '',
        website: row.website || '',
        logo: row.logo_url || '',
        tax_id: row.tax_id || '',
        vat_number: row.vat_number || '',
        registration_number: row.registration_number || '',
        currency: row.currency || 'KES'
      }
    });
  });
});

app.put('/rest/v1/company-settings', authenticateToken, (req, res) => {
  const { company_name, legal_name, registration_number, tax_id, vat_number, address_line1, address_line2, city, state, postal_code, country, phone, email, website, logo_url, currency, timezone, date_format, time_format, fiscal_year_start } = req.body;
  const id = uuidv4();

  // Delete existing company settings first
  db.run('DELETE FROM company_settings', [], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Insert new company settings
    db.run(
      `INSERT INTO company_settings (id, company_name, legal_name, registration_number, tax_id, vat_number, address_line1, address_line2, city, state, postal_code, country, phone, email, website, logo_url, currency, timezone, date_format, time_format, fiscal_year_start)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, company_name, legal_name, registration_number, tax_id, vat_number, address_line1, address_line2, city, state, postal_code, country, phone, email, website, logo_url, currency, timezone, date_format, time_format, fiscal_year_start],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error updating company settings' });
        }
        res.json({ message: 'Company settings updated successfully' });
      }
    );
  });
});

// Tax Settings routes
app.get('/rest/v1/tax-settings', authenticateToken, (req, res) => {
  db.all('SELECT * FROM tax_settings WHERE is_active = 1 ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/tax-settings', authenticateToken, (req, res) => {
  const { name, rate, type, description, is_default, applies_to, effective_from, effective_to } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO tax_settings (id, name, rate, type, description, is_default, applies_to, effective_from, effective_to)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, rate, type, description, is_default, applies_to, effective_from, effective_to],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating tax setting' });
      }
      res.status(201).json({ id, message: 'Tax setting created successfully' });
    }
  );
});

app.put('/rest/v1/tax-settings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, rate, type, description, is_default, applies_to, effective_from, effective_to, is_active } = req.body;

  db.run(
    'UPDATE tax_settings SET name = ?, rate = ?, type = ?, description = ?, is_default = ?, applies_to = ?, effective_from = ?, effective_to = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, rate, type, description, is_default, applies_to, effective_from, effective_to, is_active, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating tax setting' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tax setting not found' });
      }
      res.json({ message: 'Tax setting updated successfully' });
    }
  );
});

app.delete('/rest/v1/tax-settings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tax_settings WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tax setting not found' });
    }
    res.json({ message: 'Tax setting deleted successfully' });
  });
});

// Layout Settings routes
app.get('/rest/v1/layout-settings', authenticateToken, (req, res) => {
  const { document_type } = req.query;
  let query = 'SELECT * FROM layout_settings WHERE is_active = 1';
  let params = [];

  if (document_type) {
    query += ' AND document_type = ?';
    params.push(document_type);
  }

  query += ' ORDER BY document_type, template_name';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/layout-settings', authenticateToken, (req, res) => {
  const { document_type, template_name, template_data, numbering_pattern, auto_numbering, next_number, prefix, suffix, padding_length, reset_frequency } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO layout_settings (id, document_type, template_name, template_data, numbering_pattern, auto_numbering, next_number, prefix, suffix, padding_length, reset_frequency)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, document_type, template_name, template_data, numbering_pattern, auto_numbering, next_number, prefix, suffix, padding_length, reset_frequency],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating layout setting' });
      }
      res.status(201).json({ id, message: 'Layout setting created successfully' });
    }
  );
});

app.put('/rest/v1/layout-settings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { document_type, template_name, template_data, numbering_pattern, auto_numbering, next_number, prefix, suffix, padding_length, reset_frequency, is_active } = req.body;

  db.run(
    'UPDATE layout_settings SET document_type = ?, template_name = ?, template_data = ?, numbering_pattern = ?, auto_numbering = ?, next_number = ?, prefix = ?, suffix = ?, padding_length = ?, reset_frequency = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [document_type, template_name, template_data, numbering_pattern, auto_numbering, next_number, prefix, suffix, padding_length, reset_frequency, is_active, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating layout setting' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Layout setting not found' });
      }
      res.json({ message: 'Layout setting updated successfully' });
    }
  );
});

app.delete('/rest/v1/layout-settings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM layout_settings WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Layout setting not found' });
    }
    res.json({ message: 'Layout setting deleted successfully' });
  });
});

// Payment Settings routes
app.get('/rest/v1/payment-settings', authenticateToken, (req, res) => {
  db.all('SELECT * FROM payment_settings ORDER BY provider_name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/payment-settings', authenticateToken, (req, res) => {
  const { provider_name, provider_type, api_key, api_secret, webhook_url, is_active, is_sandbox, configuration, supported_currencies, fees_configuration } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO payment_settings (id, provider_name, provider_type, api_key, api_secret, webhook_url, is_active, is_sandbox, configuration, supported_currencies, fees_configuration)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, provider_name, provider_type, api_key, api_secret, webhook_url, is_active, is_sandbox, configuration, supported_currencies, fees_configuration],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating payment setting' });
      }
      res.status(201).json({ id, message: 'Payment setting created successfully' });
    }
  );
});

app.put('/rest/v1/payment-settings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { provider_name, provider_type, api_key, api_secret, webhook_url, is_active, is_sandbox, configuration, supported_currencies, fees_configuration } = req.body;

  db.run(
    'UPDATE payment_settings SET provider_name = ?, provider_type = ?, api_key = ?, api_secret = ?, webhook_url = ?, is_active = ?, is_sandbox = ?, configuration = ?, supported_currencies = ?, fees_configuration = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [provider_name, provider_type, api_key, api_secret, webhook_url, is_active, is_sandbox, configuration, supported_currencies, fees_configuration, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating payment setting' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Payment setting not found' });
      }
      res.json({ message: 'Payment setting updated successfully' });
    }
  );
});

app.delete('/rest/v1/payment-settings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM payment_settings WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Payment setting not found' });
    }
    res.json({ message: 'Payment setting deleted successfully' });
  });
});

// Integration Settings routes
app.get('/rest/v1/integration-settings', authenticateToken, (req, res) => {
  db.all('SELECT * FROM integration_settings ORDER BY service_name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/integration-settings', authenticateToken, (req, res) => {
  const { service_name, service_type, api_endpoint, api_key, api_secret, webhook_url, configuration, is_active, sync_frequency } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO integration_settings (id, service_name, service_type, api_endpoint, api_key, api_secret, webhook_url, configuration, is_active, sync_frequency)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, service_name, service_type, api_endpoint, api_key, api_secret, webhook_url, configuration, is_active, sync_frequency],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating integration setting' });
      }
      res.status(201).json({ id, message: 'Integration setting created successfully' });
    }
  );
});

app.put('/rest/v1/integration-settings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { service_name, service_type, api_endpoint, api_key, api_secret, webhook_url, configuration, is_active, sync_frequency } = req.body;

  db.run(
    'UPDATE integration_settings SET service_name = ?, service_type = ?, api_endpoint = ?, api_key = ?, api_secret = ?, webhook_url = ?, configuration = ?, is_active = ?, sync_frequency = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [service_name, service_type, api_endpoint, api_key, api_secret, webhook_url, configuration, is_active, sync_frequency, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating integration setting' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Integration setting not found' });
      }
      res.json({ message: 'Integration setting updated successfully' });
    }
  );
});

app.delete('/rest/v1/integration-settings/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM integration_settings WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Integration setting not found' });
    }
    res.json({ message: 'Integration setting deleted successfully' });
  });
});

// User Roles routes
app.get('/rest/v1/user-roles', authenticateToken, (req, res) => {
  db.all('SELECT * FROM user_roles WHERE is_active = 1 ORDER BY role_name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/user-roles', authenticateToken, (req, res) => {
  const { role_name, description, permissions } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO user_roles (id, role_name, description, permissions)
     VALUES (?, ?, ?, ?)`,
    [id, role_name, description, JSON.stringify(permissions)],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating user role' });
      }
      res.status(201).json({ id, message: 'User role created successfully' });
    }
  );
});

app.put('/rest/v1/user-roles/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { role_name, description, permissions, is_active } = req.body;

  db.run(
    'UPDATE user_roles SET role_name = ?, description = ?, permissions = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [role_name, description, JSON.stringify(permissions), is_active, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating user role' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User role not found' });
      }
      res.json({ message: 'User role updated successfully' });
    }
  );
});

app.delete('/rest/v1/user-roles/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM user_roles WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User role not found' });
    }
    res.json({ message: 'User role deleted successfully' });
  });
});

// System Settings routes
app.get('/rest/v1/system-settings/:category', authenticateToken, (req, res) => {
  const { category } = req.params;

  db.all('SELECT key, value, subcategory, description FROM system_settings WHERE category = ? ORDER BY subcategory, key', [category], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.put('/rest/v1/system-settings/:category', authenticateToken, (req, res) => {
  const { category } = req.params;
  const settings = req.body.settings;

  if (!settings || !Array.isArray(settings)) {
    return res.status(400).json({ error: 'Settings must be an array' });
  }

  db.run('BEGIN TRANSACTION');

  let completed = 0;
  const total = settings.length;

  if (total === 0) {
    db.run('COMMIT');
    return res.json({ message: 'No settings to update' });
  }

  settings.forEach(({ key, value, subcategory }) => {
    const settingId = uuidv4();
    db.run(
      'INSERT INTO system_settings (id, category, subcategory, key, value) VALUES (?, ?, ?, ?, ?) ON CONFLICT(category, subcategory, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
      [settingId, category, subcategory, key, value],
      function(err) {
        if (err) {
          console.error(err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error updating settings' });
        }

        completed++;
        if (completed === total) {
          db.run('COMMIT', [], err => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Settings updated successfully' });
          });
        }
      }
    );
  });
});

app.get('/rest/v1/system-settings/:category/:key', authenticateToken, (req, res) => {
  const { category, key } = req.params;

  db.get('SELECT key, value, subcategory, description FROM system_settings WHERE category = ? AND key = ?', [category, key], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(row);
  });
});

app.put('/rest/v1/system-settings/:category/:key', authenticateToken, (req, res) => {
  const { category, key } = req.params;
  const { value, subcategory } = req.body;

  if (!value) {
    return res.status(400).json({ error: 'Value is required' });
  }

  const settingId = uuidv4();
  db.run(
    'INSERT INTO system_settings (id, category, subcategory, key, value) VALUES (?, ?, ?, ?, ?) ON CONFLICT(category, subcategory, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
    [settingId, category, subcategory, key, value],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating setting' });
      }
      res.json({ message: 'Setting updated successfully' });
    }
  );
});

app.delete('/rest/v1/system-settings/:category/:key', authenticateToken, (req, res) => {
  const { category, key } = req.params;

  db.run('DELETE FROM system_settings WHERE category = ? AND key = ?', [category, key], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ message: 'Setting deleted successfully' });
  });
});

// Mailbox Routes

// Get inbox messages
app.get('/rest/v1/mailbox/inbox', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      m.id, m.subject, m.body, m.priority, m.is_read, m.is_starred, 
      m.is_archived, m.is_deleted, m.sent_at, m.created_at,
      u.first_name as sender_first_name, u.last_name as sender_last_name,
      u.email as sender_email,
      mr.is_read as recipient_read, mr.is_starred as recipient_starred,
      mr.is_archived as recipient_archived, mr.read_at
    FROM messages m
    INNER JOIN message_recipients mr ON m.id = mr.message_id
    INNER JOIN users u ON m.sender_id = u.id
    WHERE mr.recipient_id = ? AND mr.is_deleted = false AND m.is_draft = false
  `;
  
  const params = [userId];
  
  if (search) {
    query += ` AND (m.subject LIKE ? OR m.body LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }
  
  query += ` ORDER BY m.sent_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get sent messages
app.get('/rest/v1/mailbox/sent', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      m.id, m.subject, m.body, m.priority, m.is_read, m.is_starred, 
      m.is_archived, m.is_deleted, m.sent_at, m.created_at,
      GROUP_CONCAT(u.first_name || ' ' || u.last_name) as recipients
    FROM messages m
    LEFT JOIN message_recipients mr ON m.id = mr.message_id
    LEFT JOIN users u ON mr.recipient_id = u.id
    WHERE m.sender_id = ? AND m.is_draft = false AND m.is_deleted = false
  `;
  
  const params = [userId];
  
  if (search) {
    query += ` AND (m.subject LIKE ? OR m.body LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }
  
  query += ` GROUP BY m.id ORDER BY m.sent_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get draft messages
app.get('/rest/v1/mailbox/drafts', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      m.id, m.subject, m.body, m.priority, m.created_at, m.updated_at
    FROM messages m
    WHERE m.sender_id = ? AND m.is_draft = true AND m.is_deleted = false
    ORDER BY m.updated_at DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [userId, limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get starred messages
app.get('/rest/v1/mailbox/starred', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      m.id, m.subject, m.body, m.priority, m.is_read, m.sent_at, m.created_at,
      u.first_name as sender_first_name, u.last_name as sender_last_name,
      u.email as sender_email,
      mr.is_read as recipient_read, mr.read_at
    FROM messages m
    LEFT JOIN message_recipients mr ON m.id = mr.message_id AND mr.recipient_id = ?
    INNER JOIN users u ON m.sender_id = u.id
    WHERE ((mr.recipient_id = ? AND mr.is_starred = true) OR (m.sender_id = ? AND m.is_starred = true))
      AND m.is_draft = false AND m.is_deleted = false
    ORDER BY m.sent_at DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [userId, userId, userId, limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get single message
app.get('/rest/v1/mailbox/messages/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const query = `
    SELECT 
      m.id, m.subject, m.body, m.priority, m.is_read, m.is_starred, 
      m.is_archived, m.is_deleted, m.sent_at, m.created_at, m.reply_to_id,
      u.first_name as sender_first_name, u.last_name as sender_last_name,
      u.email as sender_email,
      mr.is_read as recipient_read, mr.is_starred as recipient_starred,
      mr.is_archived as recipient_archived, mr.read_at
    FROM messages m
    LEFT JOIN message_recipients mr ON m.id = mr.message_id AND mr.recipient_id = ?
    INNER JOIN users u ON m.sender_id = u.id
    WHERE m.id = ? AND (m.sender_id = ? OR mr.recipient_id = ?)
  `;

  db.get(query, [userId, id, userId, userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Mark as read if recipient is viewing
    if (row.recipient_read === 0) {
      db.run(
        'UPDATE message_recipients SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE message_id = ? AND recipient_id = ?',
        [id, userId]
      );
    }

    // Get recipients
    db.all(
      `SELECT u.id, u.first_name, u.last_name, u.email, mr.recipient_type 
       FROM message_recipients mr 
       INNER JOIN users u ON mr.recipient_id = u.id 
       WHERE mr.message_id = ?`,
      [id],
      (err, recipients) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        row.recipients = recipients;
        res.json(row);
      }
    );
  });
});

// Send message
app.post('/rest/v1/mailbox/messages', authenticateToken, (req, res) => {
  const senderId = req.user.id;
  const { recipients, subject, body, priority = 'normal', isDraft = false } = req.body;

  if (!isDraft && (!recipients || recipients.length === 0)) {
    return res.status(400).json({ error: 'Recipients are required for sending messages' });
  }

  if (!subject || !body) {
    return res.status(400).json({ error: 'Subject and body are required' });
  }

  const messageId = uuidv4();
  const threadId = uuidv4();
  const sentAt = isDraft ? null : new Date().toISOString();

  // Insert message
  db.run(
    `INSERT INTO messages (
      id, sender_id, subject, body, priority, is_draft, thread_id, sent_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [messageId, senderId, subject, body, priority, isDraft, threadId, sentAt],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating message' });
      }

      if (!isDraft && recipients && recipients.length > 0) {
        // Insert recipients
        const recipientPromises = recipients.map(recipientId => {
          const recipientRowId = uuidv4();
          return new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO message_recipients (id, message_id, recipient_id, recipient_type) VALUES (?, ?, ?, ?)',
              [recipientRowId, messageId, recipientId, 'to'],
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });

        Promise.all(recipientPromises)
          .then(() => {
            res.status(201).json({ 
              id: messageId, 
              message: isDraft ? 'Draft saved successfully' : 'Message sent successfully' 
            });
          })
          .catch(err => {
            console.error('Error inserting recipients:', err);
            res.status(500).json({ error: 'Database error creating recipients' });
          });
      } else {
        res.status(201).json({ 
          id: messageId, 
          message: 'Draft saved successfully' 
        });
      }
    }
  );
});

// Update message (for drafts)
app.put('/rest/v1/mailbox/messages/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { recipients, subject, body, priority = 'normal', isDraft = false } = req.body;

  // Check if user owns the message and it's a draft
  db.get(
    'SELECT id, is_draft FROM messages WHERE id = ? AND sender_id = ?',
    [id, userId],
    (err, message) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
      if (!message.is_draft) {
        return res.status(400).json({ error: 'Cannot edit sent messages' });
      }

      const sentAt = isDraft ? null : new Date().toISOString();

      // Update message
      db.run(
        `UPDATE messages SET 
          subject = ?, body = ?, priority = ?, is_draft = ?, sent_at = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [subject, body, priority, isDraft, sentAt, id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error updating message' });
          }

          if (!isDraft && recipients && recipients.length > 0) {
            // Delete existing recipients and add new ones
            db.run('DELETE FROM message_recipients WHERE message_id = ?', [id], (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              const recipientPromises = recipients.map(recipientId => {
                const recipientRowId = uuidv4();
                return new Promise((resolve, reject) => {
                  db.run(
                    'INSERT INTO message_recipients (id, message_id, recipient_id, recipient_type) VALUES (?, ?, ?, ?)',
                    [recipientRowId, id, recipientId, 'to'],
                    function(err) {
                      if (err) reject(err);
                      else resolve();
                    }
                  );
                });
              });

              Promise.all(recipientPromises)
                .then(() => {
                  res.json({ 
                    message: isDraft ? 'Draft updated successfully' : 'Message sent successfully' 
                  });
                })
                .catch(err => {
                  console.error('Error updating recipients:', err);
                  res.status(500).json({ error: 'Database error updating recipients' });
                });
            });
          } else {
            res.json({ message: 'Draft updated successfully' });
          }
        }
      );
    }
  );
});

// Delete message
app.delete('/rest/v1/mailbox/messages/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  // Check if user is sender or recipient
  db.get(
    `SELECT m.id, m.sender_id, mr.recipient_id 
     FROM messages m 
     LEFT JOIN message_recipients mr ON m.id = mr.message_id 
     WHERE m.id = ? AND (m.sender_id = ? OR mr.recipient_id = ?)`,
    [id, userId, userId],
    (err, message) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.sender_id === userId) {
        // Sender deleting - mark message as deleted
        db.run(
          'UPDATE messages SET is_deleted = true WHERE id = ?',
          [id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Message deleted successfully' });
          }
        );
      } else {
        // Recipient deleting - mark recipient record as deleted
        db.run(
          'UPDATE message_recipients SET is_deleted = true WHERE message_id = ? AND recipient_id = ?',
          [id, userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Message deleted successfully' });
          }
        );
      }
    }
  );
});

// Toggle star status
app.patch('/rest/v1/mailbox/messages/:id/star', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { starred } = req.body;

  // Check if user is sender or recipient
  db.get(
    `SELECT m.id, m.sender_id, mr.recipient_id 
     FROM messages m 
     LEFT JOIN message_recipients mr ON m.id = mr.message_id 
     WHERE m.id = ? AND (m.sender_id = ? OR mr.recipient_id = ?)`,
    [id, userId, userId],
    (err, message) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.sender_id === userId) {
        // Sender starring - update message
        db.run(
          'UPDATE messages SET is_starred = ? WHERE id = ?',
          [starred, id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Star status updated successfully' });
          }
        );
      } else {
        // Recipient starring - update recipient record
        db.run(
          'UPDATE message_recipients SET is_starred = ? WHERE message_id = ? AND recipient_id = ?',
          [starred, id, userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Star status updated successfully' });
          }
        );
      }
    }
  );
});

// Get users for recipient selection
app.get('/rest/v1/mailbox/users', authenticateToken, (req, res) => {
  const { search = '' } = req.query;
  
  let query = `
    SELECT id, first_name, last_name, email 
    FROM users 
    WHERE id != ?
  `;
  
  const params = [req.user.id];
  
  if (search) {
    query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }
  
  query += ` ORDER BY first_name, last_name LIMIT 50`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get message statistics
app.get('/rest/v1/mailbox/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const queries = {
    unread: `
      SELECT COUNT(*) as count 
      FROM message_recipients mr 
      INNER JOIN messages m ON mr.message_id = m.id 
      WHERE mr.recipient_id = ? AND mr.is_read = false AND mr.is_deleted = false AND m.is_draft = false
    `,
    total_received: `
      SELECT COUNT(*) as count 
      FROM message_recipients mr 
      INNER JOIN messages m ON mr.message_id = m.id 
      WHERE mr.recipient_id = ? AND mr.is_deleted = false AND m.is_draft = false
    `,
    total_sent: `
      SELECT COUNT(*) as count 
      FROM messages m 
      WHERE m.sender_id = ? AND m.is_draft = false AND m.is_deleted = false
    `,
    drafts: `
      SELECT COUNT(*) as count 
      FROM messages m 
      WHERE m.sender_id = ? AND m.is_draft = true AND m.is_deleted = false
    `,
    starred: `
      SELECT COUNT(*) as count 
      FROM messages m 
      LEFT JOIN message_recipients mr ON m.id = mr.message_id 
      WHERE ((mr.recipient_id = ? AND mr.is_starred = true) OR (m.sender_id = ? AND m.is_starred = true))
        AND m.is_draft = false AND m.is_deleted = false
    `
  };

  const stats = {};
  const promises = Object.keys(queries).map(key => {
    return new Promise((resolve, reject) => {
      const params = key === 'starred' ? [userId, userId] : [userId];
      db.get(queries[key], params, (err, row) => {
        if (err) reject(err);
        else {
          stats[key] = row.count;
          resolve();
        }
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json(stats);
    })
    .catch(err => {
      console.error('Error getting mailbox stats:', err);
      res.status(500).json({ error: 'Database error' });
    });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PrintSoft ERP Backend is running',
    timestamp: new Date().toISOString() 
  });
});

// Reusable document number generation function
const generateDocumentNumber = (documentType, callback) => {
  // Use a transaction to ensure thread safety
  db.run('BEGIN TRANSACTION');
  
  // Get the settings for this document type with row-level locking
  db.get('SELECT * FROM number_generation_settings WHERE document_type = ? AND is_active = 1', [documentType], (err, setting) => {
    if (err) {
      db.run('ROLLBACK');
      return callback(err, null);
    }
    
    if (!setting) {
      db.run('ROLLBACK');
      return callback(new Error(`Number generation settings not found for ${documentType}`), null);
    }
    
    // Get the current number and increment it atomically
    const currentNumber = setting.next_number;
    const paddedNumber = currentNumber.toString().padStart(setting.number_length, '0');
    let generatedNumber;
    
    switch (setting.format) {
      case 'prefix-number':
        generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
        break;
      case 'number-suffix':
        generatedNumber = `${paddedNumber}${setting.separator}${setting.suffix}`;
        break;
      case 'prefix-number-suffix':
        generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}${setting.separator}${setting.suffix}`;
        break;
      default:
        generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
    }
    
    // Update the next number if auto_increment is enabled (atomically)
    if (setting.auto_increment) {
      db.run('UPDATE number_generation_settings SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [setting.id], (updateErr) => {
        if (updateErr) {
          db.run('ROLLBACK');
          console.error('Error updating next number:', updateErr);
          return callback(updateErr, null);
        }
        
        // Record the generated number
        const sequenceId = uuidv4();
        db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
          [sequenceId, documentType, generatedNumber, currentNumber], (insertErr) => {
            if (insertErr) {
              db.run('ROLLBACK');
              console.error('Error recording sequence:', insertErr);
              return callback(insertErr, null);
            }
            
            // Commit the transaction
            db.run('COMMIT', (commitErr) => {
              if (commitErr) {
                console.error('Error committing transaction:', commitErr);
                return callback(commitErr, null);
              }
              
              callback(null, generatedNumber);
            });
          });
      });
    } else {
      // Just record the number without incrementing
      const sequenceId = uuidv4();
      db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
        [sequenceId, documentType, generatedNumber, currentNumber], (insertErr) => {
          if (insertErr) {
            db.run('ROLLBACK');
            console.error('Error recording sequence:', insertErr);
            return callback(insertErr, null);
          }
          
          // Commit the transaction
          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              console.error('Error committing transaction:', commitErr);
              return callback(commitErr, null);
            }
            
            callback(null, generatedNumber);
          });
        });
    }
  });
};

// Number generation settings management endpoints
app.get('/rest/v1/number-generation-settings', authenticateToken, (req, res) => {
  db.all('SELECT * FROM number_generation_settings ORDER BY document_type ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/rest/v1/number-generation-settings/:documentType', authenticateToken, (req, res) => {
  const { documentType } = req.params;
  db.get('SELECT * FROM number_generation_settings WHERE document_type = ?', [documentType], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Number generation setting not found' });
    }
    res.json(row);
  });
});

app.put('/rest/v1/number-generation-settings/:documentType', authenticateToken, (req, res) => {
  const { documentType } = req.params;
  const { prefix, suffix, next_number, number_length, separator, format, auto_increment, reset_frequency, is_active } = req.body;
  
  db.run(
    `UPDATE number_generation_settings 
     SET prefix = ?, suffix = ?, next_number = ?, number_length = ?, separator = ?, format = ?, auto_increment = ?, reset_frequency = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE document_type = ?`,
    [prefix, suffix, next_number, number_length, separator, format, auto_increment, reset_frequency, is_active, documentType],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating number generation settings' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Number generation setting not found' });
      }
      res.json({ message: 'Number generation settings updated successfully' });
    }
  );
});

app.post('/rest/v1/number-generation-settings', authenticateToken, (req, res) => {
  const { document_type, prefix, suffix, next_number, number_length, separator, format, auto_increment, reset_frequency, is_active } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO number_generation_settings 
     (id, document_type, prefix, suffix, next_number, number_length, separator, format, auto_increment, reset_frequency, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, document_type, prefix, suffix, next_number, number_length, separator, format, auto_increment, reset_frequency, is_active],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating number generation settings' });
      }
      res.status(201).json({ id, message: 'Number generation settings created successfully' });
    }
  );
});

app.delete('/rest/v1/number-generation-settings/:documentType', authenticateToken, (req, res) => {
  const { documentType } = req.params;
  
  db.run('DELETE FROM number_generation_settings WHERE document_type = ?', [documentType], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Number generation setting not found' });
    }
    res.json({ message: 'Number generation settings deleted successfully' });
  });
});

// Number generation endpoint (thread-safe)
app.post('/rest/v1/generate-number/:documentType', authenticateToken, (req, res) => {
  const { documentType } = req.params;
  
  generateDocumentNumber(documentType, (err, generatedNumber) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ number: generatedNumber });
  });
});

// Customer routes
// Customers
app.get('/rest/v1/customers', authenticateToken, async (req, res) => {
  const { select = '*', order } = req.query;
  const query = `SELECT ${select} FROM customers ORDER BY created_at DESC`;

  try {
    const [rows] = await mysqlDb.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving customers:', error);
    res.status(500).json({ error: 'Database error retrieving customers' });
  }
});

app.get('/rest/v1/customers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await mysqlDb.execute('SELECT * FROM customers WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.status(500).json({ error: 'Database error retrieving customer' });
  }
});

app.post('/rest/v1/customers', authenticateToken, async (req, res) => {
  const {
    customer_number,
    first_name,
    last_name,
    company_name,
    customer_type,
    email,
    phone,
    mobile,
    fax,
    website,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    tax_id,
    vat_number,
    credit_limit,
    payment_terms,
    preferred_currency,
    preferred_payment_method,
    discount_percentage,
    price_list_id,
    territory,
    sales_rep_id,
    customer_group,
    industry,
    lead_source,
    tags,
    status,
    notes,
    internal_notes,
    created_by
  } = req.body;
  const id = uuidv4();

  // Generate customer number if not provided
  const generateCustomerNumber = () => {
    if (customer_number) {
      // Use provided customer number
      insertCustomer(customer_number);
    } else {
      // Generate customer number using number generation settings
      db.run('BEGIN TRANSACTION');
      db.get('SELECT * FROM number_generation_settings WHERE document_type = ? AND is_active = 1', ['customer'], (err, setting) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error retrieving number settings' });
        }
        
        if (!setting) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Number generation settings not found for customers' });
        }
        
        const currentNumber = setting.next_number;
        const paddedNumber = currentNumber.toString().padStart(setting.number_length, '0');
        let generatedNumber;
        
        switch (setting.format) {
          case 'prefix-number':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
            break;
          case 'number-suffix':
            generatedNumber = `${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          case 'prefix-number-suffix':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          default:
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
        }
        
        // Update the next number if auto_increment is enabled
        if (setting.auto_increment) {
          db.run('UPDATE number_generation_settings SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [setting.id], (updateErr) => {
            if (updateErr) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update customer number sequence' });
            }
            
            // Record the generated number
            const sequenceId = uuidv4();
            db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
              [sequenceId, 'customer', generatedNumber, currentNumber], (insertErr) => {
                if (insertErr) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Failed to record customer number sequence' });
                }
                
                db.run('COMMIT');
                insertCustomer(generatedNumber);
              });
          });
        } else {
          // Just record the number without incrementing
          const sequenceId = uuidv4();
          db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
            [sequenceId, 'customer', generatedNumber, currentNumber], (insertErr) => {
              if (insertErr) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to record customer number sequence' });
              }
              
              db.run('COMMIT');
              insertCustomer(generatedNumber);
            });
        }
      });
    }
  };

  const insertCustomer = async (finalCustomerNumber) => {
    // Calculate name field from first_name, last_name, or company_name
    const name = company_name || 
                 (first_name 66 last_name ? 
                  `${first_name} ${last_name}` : 
                  first_name || last_name || 'Unnamed Customer');
    
    try {
      await mysqlDb.execute(
        `INSERT INTO customers (
          id, customer_number, name, first_name, last_name, company_name, customer_type, email, phone, mobile, fax, website,
          address_line1, address_line2, city, state, postal_code, country, tax_id, vat_number, credit_limit, payment_terms,
          preferred_currency, preferred_payment_method, discount_percentage, price_list_id, territory, sales_rep_id, customer_group,
          industry, lead_source, tags, status, notes, internal_notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, finalCustomerNumber, name, first_name, last_name, company_name, customer_type, email, phone, mobile, fax, website,
        address_line1, address_line2, city, state, postal_code, country, tax_id, vat_number, credit_limit, payment_terms,
        preferred_currency, preferred_payment_method, discount_percentage, price_list_id, territory, sales_rep_id, customer_group,
        industry, lead_source, tags, status, notes, internal_notes, created_by]
      );
      
      // Retrieve the created customer
      const [rows] = await mysqlDb.execute('SELECT * FROM customers WHERE id = ?', [id]);
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ error: 'Database error creating customer' });
    }
  };

  generateCustomerNumber();
});
          case 'number-suffix':
            generatedNumber = `${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          case 'prefix-number-suffix':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          default:
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
        }
        
        // Update the next number if auto_increment is enabled
        if (setting.auto_increment) {
          db.run('UPDATE number_generation_settings SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [setting.id], (updateErr) => {
            if (updateErr) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update customer number sequence' });
            }
            
            // Record the generated number
            const sequenceId = uuidv4();
            db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
              [sequenceId, 'customer', generatedNumber, currentNumber], (insertErr) => {
                if (insertErr) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Failed to record customer number sequence' });
                }
                
                db.run('COMMIT');
                insertCustomer(generatedNumber);
              });
          });
        } else {
          // Just record the number without incrementing
          const sequenceId = uuidv4();
          db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
            [sequenceId, 'customer', generatedNumber, currentNumber], (insertErr) => {
              if (insertErr) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to record customer number sequence' });
              }
              
              db.run('COMMIT');
              insertCustomer(generatedNumber);
            });
        }
      });
    }
  };
  const insertCustomer = async (finalCustomerNumber) =e {
    // Calculate name field from first_name, last_name, or company_name
    const name = company_name || 
                 (first_name && last_name ? 
                  `${first_name} ${last_name}` : 
                  first_name || last_name || 'Unnamed Customer');
    
    try {
      await mysqlDb.execute(
        `INSERT INTO customers (
          id, customer_number, name, first_name, last_name, company_name, customer_type, email, phone, mobile, fax, website,
          address_line1, address_line2, city, state, postal_code, country, tax_id, vat_number, credit_limit, payment_terms,
          preferred_currency, preferred_payment_method, discount_percentage, price_list_id, territory, sales_rep_id, customer_group,
          industry, lead_source, tags, status, notes, internal_notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, finalCustomerNumber, name, first_name, last_name, company_name, customer_type, email, phone, mobile, fax, website,
        address_line1, address_line2, city, state, postal_code, country, tax_id, vat_number, credit_limit, payment_terms,
        preferred_currency, preferred_payment_method, discount_percentage, price_list_id, territory, sales_rep_id, customer_group,
        industry, lead_source, tags, status, notes, internal_notes, created_by]
      );
      
      // Retrieve the created customer
      const [rows] = await mysqlDb.execute('SELECT * FROM customers WHERE id = ?', [id]);
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ error: 'Database error creating customer' });
    }
  };
  };

  generateCustomerNumber();
});
app.put('/rest/v1/customers/:id', authenticateToken, async (req, res) =e {
  const { id } = req.params;
  const {
    customer_number,
    first_name,
    last_name,
    company_name,
    customer_type,
    email,
    phone,
    mobile,
    fax,
    website,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    tax_id,
    vat_number,
    credit_limit,
    payment_terms,
    preferred_currency,
    preferred_payment_method,
    discount_percentage,
    price_list_id,
    territory,
    sales_rep_id,
    customer_group,
    industry,
    lead_source,
    tags,
    status,
    notes,
    internal_notes,
    updated_by
  } = req.body;

  // Calculate name field from first_name, last_name, or company_name
  const name = company_name || 
               (first_name 66 last_name ? 
                `${first_name} ${last_name}` : 
                first_name || last_name || 'Unnamed Customer');

  try {
    const [result] = await mysqlDb.execute(
      `UPDATE customers SET
        customer_number = ?,
        name = ?,
        first_name = ?,
        last_name = ?,
        company_name = ?,
        customer_type = ?,
        email = ?,
        phone = ?,
        mobile = ?,
        fax = ?,
        website = ?,
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        state = ?,
        postal_code = ?,
        country = ?,
        tax_id = ?,
        vat_number = ?,
        credit_limit = ?,
        payment_terms = ?,
        preferred_currency = ?,
        preferred_payment_method = ?,
        discount_percentage = ?,
        price_list_id = ?,
        territory = ?,
        sales_rep_id = ?,
        customer_group = ?,
        industry = ?,
        lead_source = ?,
        tags = ?,
        status = ?,
        notes = ?,
        internal_notes = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [customer_number, name, first_name, last_name, company_name, customer_type, email, phone, mobile, fax, website,
      address_line1, address_line2, city, state, postal_code, country, tax_id, vat_number, credit_limit, payment_terms,
      preferred_currency, preferred_payment_method, discount_percentage, price_list_id, territory, sales_rep_id, customer_group,
      industry, lead_source, tags, status, notes, internal_notes, updated_by, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const [rows] = await mysqlDb.execute('SELECT * FROM customers WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Database error updating customer' });
  }
});
});

app.delete('/rest/v1/customers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if customer exists in MySQL database
    const [rows] = await mysqlDb.execute('SELECT id FROM customers WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Delete the customer from MySQL database
    await mysqlDb.execute('DELETE FROM customers WHERE id = ?', [id]);
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer Contacts
app.get('/rest/v1/customers/:customer_id/contacts', authenticateToken, (req, res) => {
  const { customer_id } = req.params;

  db.all('SELECT * FROM customer_contacts WHERE customer_id = ? ORDER BY created_at DESC', [customer_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error retrieving contacts' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/customers/:customer_id/contacts', authenticateToken, (req, res) => {
  const { customer_id } = req.params;
  const { contact_type, first_name, last_name, title, email, phone, mobile, department, is_primary, is_billing, is_shipping, notes } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO customer_contacts (
      id, customer_id, contact_type, first_name, last_name, title, email, phone, mobile, department,
      is_primary, is_billing, is_shipping, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, customer_id, contact_type, first_name, last_name, title, email, phone, mobile, department,
    is_primary, is_billing, is_shipping, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating contact' });
      }
      db.get('SELECT * FROM customer_contacts WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/rest/v1/customers/:customer_id/contacts/:id', authenticateToken, (req, res) => {
  const { customer_id, id } = req.params;
  const { contact_type, first_name, last_name, title, email, phone, mobile, department, is_primary, is_billing, is_shipping, notes } = req.body;

  db.run(
    `UPDATE customer_contacts SET
      contact_type = ?,
      first_name = ?,
      last_name = ?,
      title = ?,
      email = ?,
      phone = ?,
      mobile = ?,
      department = ?,
      is_primary = ?,
      is_billing = ?,
      is_shipping = ?,
      notes = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND customer_id = ?`,
    [contact_type, first_name, last_name, title, email, phone, mobile, department, is_primary, is_billing, is_shipping, notes, id, customer_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating contact' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      db.get('SELECT * FROM customer_contacts WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/customers/:customer_id/contacts/:id', authenticateToken, (req, res) => {
  const { customer_id, id } = req.params;

  db.run('DELETE FROM customer_contacts WHERE id = ? AND customer_id = ?', [id, customer_id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  });
});

// Customer Addresses
app.get('/rest/v1/customers/:customer_id/addresses', authenticateToken, (req, res) => {
  const { customer_id } = req.params;

  db.all('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY created_at DESC', [customer_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error retrieving addresses' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/customers/:customer_id/addresses', authenticateToken, (req, res) => {
  const { customer_id } = req.params;
  const { address_type, label, address_line1, address_line2, city, state, postal_code, country, is_default, is_billing, is_shipping } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO customer_addresses (
      id, customer_id, address_type, label, address_line1, address_line2, city, state, postal_code, country,
      is_default, is_billing, is_shipping
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, customer_id, address_type, label, address_line1, address_line2, city, state, postal_code, country, is_default, is_billing, is_shipping],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating address' });
      }
      db.get('SELECT * FROM customer_addresses WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/rest/v1/customers/:customer_id/addresses/:id', authenticateToken, (req, res) => {
  const { customer_id, id } = req.params;
  const { address_type, label, address_line1, address_line2, city, state, postal_code, country, is_default, is_billing, is_shipping } = req.body;

  db.run(
    `UPDATE customer_addresses SET
      address_type = ?,
      label = ?,
      address_line1 = ?,
      address_line2 = ?,
      city = ?,
      state = ?,
      postal_code = ?,
      country = ?,
      is_default = ?,
      is_billing = ?,
      is_shipping = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND customer_id = ?`,
    [address_type, label, address_line1, address_line2, city, state, postal_code, country, is_default, is_billing, is_shipping, id, customer_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating address' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }
      db.get('SELECT * FROM customer_addresses WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/customers/:customer_id/addresses/:id', authenticateToken, (req, res) => {
  const { customer_id, id } = req.params;

  db.run('DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?', [id, customer_id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json({ message: 'Address deleted successfully' });
  });
});

// Customer Notes
app.get('/rest/v1/customers/:customer_id/notes', authenticateToken, (req, res) => {
  const { customer_id } = req.params;

  db.all('SELECT * FROM customer_notes WHERE customer_id = ? ORDER BY created_at DESC', [customer_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error retrieving notes' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/customers/:customer_id/notes', authenticateToken, (req, res) => {
  const { customer_id } = req.params;
  const { note, note_type, is_important, created_by } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO customer_notes (id, customer_id, note, note_type, is_important, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, customer_id, note, note_type, is_important, created_by],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating note' });
      }
      db.get('SELECT * FROM customer_notes WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/rest/v1/customers/:customer_id/notes/:id', authenticateToken, (req, res) => {
  const { customer_id, id } = req.params;
  const { note, note_type, is_important } = req.body;

  db.run(
    `UPDATE customer_notes SET
      note = ?,
      note_type = ?,
      is_important = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND customer_id = ?`,
    [note, note_type, is_important, id, customer_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating note' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      db.get('SELECT * FROM customer_notes WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/customers/:customer_id/notes/:id', authenticateToken, (req, res) => {
  const { customer_id, id } = req.params;

  db.run('DELETE FROM customer_notes WHERE id = ? AND customer_id = ?', [id, customer_id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  });
});

// Financial Management Routes

// Chart of Accounts
app.get('/rest/v1/chart-of-accounts', authenticateToken, (req, res) => {
  const { account_type } = req.query;
  let query = 'SELECT * FROM chart_of_accounts WHERE is_active = 1';
  let params = [];

  if (account_type) {
    query += ' AND account_type = ?';
    params.push(account_type);
  }

  query += ' ORDER BY account_code ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/chart-of-accounts', authenticateToken, (req, res) => {
  const { account_code, account_name, account_type, parent_account_id, description } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, parent_account_id, description) VALUES (?, ?, ?, ?, ?, ?)',
    [id, account_code, account_name, account_type, parent_account_id, description],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating account' });
      }
      db.get('SELECT * FROM chart_of_accounts WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/rest/v1/chart-of-accounts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { account_code, account_name, account_type, parent_account_id, description, is_active } = req.body;

  db.run(
    'UPDATE chart_of_accounts SET account_code = ?, account_name = ?, account_type = ?, parent_account_id = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [account_code, account_name, account_type, parent_account_id, description, is_active, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating account' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }
      db.get('SELECT * FROM chart_of_accounts WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/chart-of-accounts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('UPDATE chart_of_accounts SET is_active = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ message: 'Account deactivated successfully' });
  });
});

// Invoices
app.get('/rest/v1/invoices', authenticateToken, (req, res) => {
  const { status, customer_id } = req.query;
  const query = `
    SELECT 
      i.*,
      c.first_name as customer_first_name,
      c.last_name as customer_last_name,
      c.company_name as customer_company_name,
      c.email as customer_email
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    ${status ? 'WHERE i.status = ?' : ''}
    ${customer_id ? (status ? 'AND' : 'WHERE') + ' i.customer_id = ?' : ''}
    ORDER BY i.created_at DESC
  `;

  const params = [];
  if (status) params.push(status);
  if (customer_id) params.push(customer_id);

  db.all(query, params, (err, invoices) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const invoiceIds = invoices.map(inv => inv.id);
    if (invoiceIds.length === 0) {
      return res.json([]);
    }

    const itemsQuery = `
      SELECT 
        ili.*,
        p.name as product_name,
        p.sku as product_sku
      FROM invoice_line_items ili
      LEFT JOIN products p ON ili.product_id = p.id
      WHERE ili.invoice_id IN (${invoiceIds.map(() => '?').join(',')})
    `;

    db.all(itemsQuery, invoiceIds, (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const invoicesWithItems = invoices.map(invoice => ({
        ...invoice,
        customer: {
          id: invoice.customer_id,
          first_name: invoice.customer_first_name,
          last_name: invoice.customer_last_name,
          company_name: invoice.customer_company_name,
          email: invoice.customer_email
        },
        items: items.filter(item => item.invoice_id === invoice.id)
      }));

      res.json(invoicesWithItems);
    });
  });
});

app.get('/rest/v1/invoices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      i.*,
      c.first_name as customer_first_name,
      c.last_name as customer_last_name,
      c.company_name as customer_company_name,
      c.email as customer_email
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `;

  db.get(query, [id], (err, invoice) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    db.all('SELECT * FROM invoice_line_items WHERE invoice_id = ?', [id], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const invoiceWithItems = {
        ...invoice,
        customer: {
          id: invoice.customer_id,
          first_name: invoice.customer_first_name,
          last_name: invoice.customer_last_name,
          company_name: invoice.customer_company_name,
          email: invoice.customer_email
        },
        items
      };

      res.json(invoiceWithItems);
    });
  });
});

app.post('/rest/v1/invoices', authenticateToken, (req, res) => {
  const {
    invoice_number,
    customer_id,
    date,
    due_date,
    status,
    currency,
    exchange_rate,
    subtotal,
    tax_amount,
    discount_amount,
    total_amount,
    balance_amount,
    terms,
    notes,
    internal_notes,
    items,
    created_by
  } = req.body;
  const id = uuidv4();

  // Generate invoice number if not provided
  const generateInvoiceNumber = () => {
    if (invoice_number) {
      // Use provided invoice number
      insertInvoice(invoice_number);
    } else {
      // Generate invoice number using number generation settings
      db.run('BEGIN TRANSACTION');
      db.get('SELECT * FROM number_generation_settings WHERE document_type = ? AND is_active = 1', ['invoice'], (err, setting) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error retrieving number settings' });
        }
        
        if (!setting) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Number generation settings not found for invoices' });
        }
        
        const currentNumber = setting.next_number;
        const paddedNumber = currentNumber.toString().padStart(setting.number_length, '0');
        let generatedNumber;
        
        switch (setting.format) {
          case 'prefix-number':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
            break;
          case 'number-suffix':
            generatedNumber = `${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          case 'prefix-number-suffix':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          default:
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
        }
        
        // Update the next number if auto_increment is enabled
        if (setting.auto_increment) {
          db.run('UPDATE number_generation_settings SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [setting.id], (updateErr) => {
            if (updateErr) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update invoice number sequence' });
            }
            
            // Record the generated number
            const sequenceId = uuidv4();
            db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
              [sequenceId, 'invoice', generatedNumber, currentNumber], (insertErr) => {
                if (insertErr) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Failed to record invoice number sequence' });
                }
                
                db.run('COMMIT');
                insertInvoice(generatedNumber);
              });
          });
        } else {
          // Just record the number without incrementing
          const sequenceId = uuidv4();
          db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
            [sequenceId, 'invoice', generatedNumber, currentNumber], (insertErr) => {
              if (insertErr) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to record invoice number sequence' });
              }
              
              db.run('COMMIT');
              insertInvoice(generatedNumber);
            });
        }
      });
    }
  };

  const insertInvoice = (finalInvoiceNumber) => {
    db.run('BEGIN TRANSACTION');

    db.run(
      `INSERT INTO invoices (
        id, invoice_number, customer_id, date, due_date, status, currency, exchange_rate,
        subtotal, tax_amount, discount_amount, total_amount, paid_amount, balance_amount,
        terms, notes, internal_notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
      [id, finalInvoiceNumber, customer_id, date, due_date, status, currency, exchange_rate,
      subtotal, tax_amount, discount_amount, total_amount, balance_amount, terms, notes, internal_notes, created_by],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error creating invoice' });
        }

        let itemsInserted = 0;
        const totalItems = items.length;

        if (totalItems === 0) {
          db.run('COMMIT');
          return res.status(201).json({ id, message: 'Invoice created successfully' });
        }

        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO invoice_line_items (
              id, invoice_id, product_id, description, quantity, unit_price,
              discount_percentage, discount_amount, tax_amount, total_amount, account_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [itemId, id, item.product_id, item.description, item.quantity, item.unit_price,
            item.discount_percentage || 0, item.discount_amount || 0, item.tax_amount || 0, item.total_amount, item.account_id],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error creating invoice items' });
              }

              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.status(201).json({ id, message: 'Invoice created successfully' });
              }
            }
          );
        });
      }
    );
  };

  generateInvoiceNumber();
});

app.put('/rest/v1/invoices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    invoice_number,
    customer_id,
    date,
    due_date,
    status,
    currency,
    exchange_rate,
    subtotal,
    tax_amount,
    discount_amount,
    total_amount,
    balance_amount,
    terms,
    notes,
    internal_notes,
    items,
    updated_by
  } = req.body;

  db.run('BEGIN TRANSACTION');

  db.run(
    `UPDATE invoices SET
      invoice_number = ?, customer_id = ?, date = ?, due_date = ?, status = ?, currency = ?, exchange_rate = ?,
      subtotal = ?, tax_amount = ?, discount_amount = ?, total_amount = ?, balance_amount = ?,
      terms = ?, notes = ?, internal_notes = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [invoice_number, customer_id, date, due_date, status, currency, exchange_rate,
    subtotal, tax_amount, discount_amount, total_amount, balance_amount, terms, notes, internal_notes, updated_by, id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error updating invoice' });
      }

      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Invoice not found' });
      }

      db.run('DELETE FROM invoice_line_items WHERE invoice_id = ?', [id], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error updating invoice items' });
        }

        let itemsInserted = 0;
        const totalItems = items.length;

        if (totalItems === 0) {
          db.run('COMMIT');
          return res.json({ message: 'Invoice updated successfully' });
        }

        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO invoice_line_items (
              id, invoice_id, product_id, description, quantity, unit_price,
              discount_percentage, discount_amount, tax_amount, total_amount, account_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [itemId, id, item.product_id, item.description, item.quantity, item.unit_price,
            item.discount_percentage || 0, item.discount_amount || 0, item.tax_amount || 0, item.total_amount, item.account_id],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error updating invoice items' });
              }

              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.json({ message: 'Invoice updated successfully' });
              }
            }
          );
        });
      });
    }
  );
});

app.delete('/rest/v1/invoices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('BEGIN TRANSACTION');

  db.run('DELETE FROM invoice_line_items WHERE invoice_id = ?', [id], function(err) {
    if (err) {
      db.run('ROLLBACK');
      return res.status(500).json({ error: 'Database error' });
    }

    db.run('DELETE FROM invoices WHERE id = ?', [id], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Invoice not found' });
      }

      db.run('COMMIT');
      res.json({ message: 'Invoice deleted successfully' });
    });
  });
});

// Payments
app.get('/rest/v1/payments', authenticateToken, (req, res) => {
  const { type, status, customer_id } = req.query;
  let query = 'SELECT * FROM payments';
  const params = [];
  const conditions = [];

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (customer_id) {
    conditions.push('customer_id = ?');
    params.push(customer_id);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/payments', authenticateToken, (req, res) => {
  const {
    payment_number,
    type,
    date,
    amount,
    currency,
    exchange_rate,
    payment_method,
    status,
    reference,
    description,
    from_account_id,
    to_account_id,
    customer_id,
    supplier_id,
    notes,
    created_by
  } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO payments (
      id, payment_number, type, date, amount, currency, exchange_rate, payment_method,
      status, reference, description, from_account_id, to_account_id, customer_id,
      supplier_id, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, payment_number, type, date, amount, currency, exchange_rate, payment_method,
    status, reference, description, from_account_id, to_account_id, customer_id,
    supplier_id, notes, created_by],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating payment' });
      }
      db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/rest/v1/payments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    payment_number,
    type,
    date,
    amount,
    currency,
    exchange_rate,
    payment_method,
    status,
    reference,
    description,
    from_account_id,
    to_account_id,
    customer_id,
    supplier_id,
    notes,
    updated_by
  } = req.body;

  db.run(
    `UPDATE payments SET
      payment_number = ?, type = ?, date = ?, amount = ?, currency = ?, exchange_rate = ?,
      payment_method = ?, status = ?, reference = ?, description = ?, from_account_id = ?,
      to_account_id = ?, customer_id = ?, supplier_id = ?, notes = ?, updated_by = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [payment_number, type, date, amount, currency, exchange_rate, payment_method,
    status, reference, description, from_account_id, to_account_id, customer_id,
    supplier_id, notes, updated_by, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating payment' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/payments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM payments WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  });
});

// Journal Entries
app.get('/rest/v1/journal-entries', authenticateToken, (req, res) => {
  const { status, date_from, date_to } = req.query;
  let query = 'SELECT * FROM journal_entries';
  const params = [];
  const conditions = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (date_from) {
    conditions.push('date >= ?');
    params.push(date_from);
  }
  if (date_to) {
    conditions.push('date <= ?');
    params.push(date_to);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY date DESC, created_at DESC';

  db.all(query, params, (err, entries) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const entryIds = entries.map(entry => entry.id);
    if (entryIds.length === 0) {
      return res.json([]);
    }

    const lineItemsQuery = `
      SELECT 
        jli.*,
        coa.account_name,
        coa.account_code
      FROM journal_line_items jli
      LEFT JOIN chart_of_accounts coa ON jli.account_id = coa.id
      WHERE jli.journal_entry_id IN (${entryIds.map(() => '?').join(',')})
      ORDER BY jli.journal_entry_id, jli.debit_amount DESC
    `;

    db.all(lineItemsQuery, entryIds, (err, lineItems) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const entriesWithLineItems = entries.map(entry => ({
        ...entry,
        line_items: lineItems.filter(item => item.journal_entry_id === entry.id)
      }));

      res.json(entriesWithLineItems);
    });
  });
});

// Product routes
app.get('/rest/v1/products', authenticateToken, (req, res) => {
  const { select = '*', order } = req.query;
  
  let query = `SELECT ${select} FROM products WHERE status = 'active'`;
  
  if (order) {
    const orderParts = order.split('.');
    const column = orderParts[0];
    const direction = orderParts[1] || 'asc';
    query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/rest/v1/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error retrieving product' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(row);
  });
});

app.post('/rest/v1/products', authenticateToken, (req, res) => {
  const {
    product_number,
    name,
    sku,
    description,
    price,
    cost,
    stock_quantity,
    unit_of_measure,
    category,
    status
  } = req.body;
  const id = uuidv4();

  // Generate product number if not provided
  const generateProductNumber = () => {
    if (product_number) {
      // Use provided product number
      insertProduct(product_number);
    } else {
      // Generate product number using number generation settings
      db.run('BEGIN TRANSACTION');
      db.get('SELECT * FROM number_generation_settings WHERE document_type = ? AND is_active = 1', ['product'], (err, setting) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error retrieving number settings' });
        }
        
        if (!setting) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Number generation settings not found for products' });
        }
        
        const currentNumber = setting.next_number;
        const paddedNumber = currentNumber.toString().padStart(setting.number_length, '0');
        let generatedNumber;
        
        switch (setting.format) {
          case 'prefix-number':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
            break;
          case 'number-suffix':
            generatedNumber = `${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          case 'prefix-number-suffix':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          default:
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
        }
        
        // Update the next number if auto_increment is enabled
        if (setting.auto_increment) {
          db.run('UPDATE number_generation_settings SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [setting.id], (updateErr) => {
            if (updateErr) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update product number sequence' });
            }
            
            // Record the generated number
            const sequenceId = uuidv4();
            db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
              [sequenceId, 'product', generatedNumber, currentNumber], (insertErr) => {
                if (insertErr) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Failed to record product number sequence' });
                }
                
                db.run('COMMIT');
                insertProduct(generatedNumber);
              });
          });
        } else {
          // Just record the number without incrementing
          const sequenceId = uuidv4();
          db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
            [sequenceId, 'product', generatedNumber, currentNumber], (insertErr) => {
              if (insertErr) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to record product number sequence' });
              }
              
              db.run('COMMIT');
              insertProduct(generatedNumber);
            });
        }
      });
    }
  };

  const insertProduct = (finalProductNumber) => {
    db.run(
      `INSERT INTO products (
        id, product_number, name, sku, description, price, cost, stock_quantity, unit_of_measure, category, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, finalProductNumber, name, sku, description, price, cost, stock_quantity || 0, unit_of_measure || 'pcs', category, status || 'active'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error creating product' });
        }
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.status(201).json(row);
        });
      }
    );
  };

  generateProductNumber();
});

app.put('/rest/v1/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    product_number,
    name,
    sku,
    description,
    price,
    cost,
    stock_quantity,
    unit_of_measure,
    category,
    status
  } = req.body;

  db.run(
    `UPDATE products SET
      product_number = ?,
      name = ?,
      sku = ?,
      description = ?,
      price = ?,
      cost = ?,
      stock_quantity = ?,
      unit_of_measure = ?,
      category = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [product_number, name, sku, description, price, cost, stock_quantity, unit_of_measure, category, status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating product' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Soft delete by setting status to 'inactive'
  db.run(
    'UPDATE products SET status = "inactive", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json({ message: 'Product deactivated successfully' });
    }
  );
});

// Parts routes
app.get('/rest/v1/parts', authenticateToken, (req, res) => {
  const { select = '*', order } = req.query;
  
  let query = `SELECT ${select} FROM parts WHERE status = 'active'`;
  
  if (order) {
    const orderParts = order.split('.');
    const column = orderParts[0];
    const direction = orderParts[1] || 'asc';
    query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Quotations routes with joins
app.get('/rest/v1/quotations', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      q.*,
      c.first_name as customer_first_name,
      c.last_name as customer_last_name,
      c.company_name as customer_company_name,
      c.email as customer_email
    FROM quotations q
    LEFT JOIN customers c ON q.customer_id = c.id
    ORDER BY q.created_at DESC
  `;

  db.all(query, [], (err, quotations) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get quotation items for each quotation
    const quotationIds = quotations.map(q => q.id);
    if (quotationIds.length === 0) {
      return res.json([]);
    }

    const itemsQuery = `
      SELECT 
        qi.*,
        p.name as product_name,
        p.sku as product_sku
      FROM quotation_items qi
      LEFT JOIN products p ON qi.product_id = p.id
      WHERE qi.quotation_id IN (${quotationIds.map(() => '?').join(',')})
    `;

    db.all(itemsQuery, quotationIds, (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Group items by quotation
      const quotationsWithItems = quotations.map(quotation => ({
        ...quotation,
        customers: {
          id: quotation.customer_id,
          first_name: quotation.customer_first_name,
          last_name: quotation.customer_last_name,
          company_name: quotation.customer_company_name,
          email: quotation.customer_email
        },
        quotation_items: items.filter(item => item.quotation_id === quotation.id).map(item => ({
          ...item,
          products: item.product_id ? {
            name: item.product_name,
            sku: item.product_sku
          } : null
        }))
      }));

      res.json(quotationsWithItems);
    });
  });
});

// Sales orders routes with joins
app.get('/rest/v1/sales_orders', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      so.*,
      c.first_name as customer_first_name,
      c.last_name as customer_last_name,
      c.company_name as customer_company_name,
      c.email as customer_email
    FROM sales_orders so
    LEFT JOIN customers c ON so.customer_id = c.id
    ORDER BY so.created_at DESC
  `;

  db.all(query, [], (err, salesOrders) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get sales order items for each order
    const orderIds = salesOrders.map(so => so.id);
    if (orderIds.length === 0) {
      return res.json([]);
    }

    const itemsQuery = `
      SELECT 
        soi.*,
        p.name as product_name,
        p.sku as product_sku
      FROM sales_order_items soi
      LEFT JOIN products p ON soi.product_id = p.id
      WHERE soi.sales_order_id IN (${orderIds.map(() => '?').join(',')})
    `;

    db.all(itemsQuery, orderIds, (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Group items by sales order
      const salesOrdersWithItems = salesOrders.map(salesOrder => ({
        ...salesOrder,
        customers: {
          id: salesOrder.customer_id,
          first_name: salesOrder.customer_first_name,
          last_name: salesOrder.customer_last_name,
          company_name: salesOrder.customer_company_name,
          email: salesOrder.customer_email
        },
        sales_order_items: items.filter(item => item.sales_order_id === salesOrder.id).map(item => ({
          ...item,
          products: item.product_id ? {
            name: item.product_name,
            sku: item.product_sku
          } : null
        }))
      }));

      res.json(salesOrdersWithItems);
    });
  });
});

// Settings routes
app.get('/rest/v1/settings', authenticateToken, (req, res) => {
  const { category } = req.query;
  
  let query = 'SELECT * FROM settings';
  let params = [];
  
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY key ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/settings', authenticateToken, (req, res) => {
  const { key, value, category = 'general' } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT OR REPLACE INTO settings (id, key, value, category) VALUES (?, ?, ?, ?)',
    [id, key, JSON.stringify(value), category],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      db.get('SELECT * FROM settings WHERE key = ?', [key], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ ...row, value: JSON.parse(row.value) });
      });
    }
  );
});

// Categories routes
app.get('/rest/v1/categories', authenticateToken, (req, res) => {
  const { type, order } = req.query;
  
  let query = 'SELECT * FROM categories';
  let params = [];
  
  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }
  
  if (order) {
    const orderParts = order.split('.');
    const column = orderParts[0];
    const direction = orderParts[1] || 'asc';
    query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
  } else {
    query += ' ORDER BY name ASC';
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/categories', authenticateToken, (req, res) => {
  const { name, description, type = 'product' } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO categories (id, name, description, type) VALUES (?, ?, ?, ?)',
    [id, name, description, type],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/rest/v1/categories/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, description, type } = req.body;

  db.run(
    'UPDATE categories SET name = ?, description = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, description, type, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/categories/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  });
});

// Vendors routes
app.get('/rest/v1/vendors', authenticateToken, (req, res) => {
  const { order } = req.query;
  
  let query = "SELECT * FROM vendors WHERE status = 'active'";
  
  if (order) {
    const orderParts = order.split('.');
    const column = orderParts[0];
    const direction = orderParts[1] || 'asc';
    query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
  } else {
    query += ' ORDER BY name ASC';
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/vendors', authenticateToken, (req, res) => {
  const { name, vendor_number, company_name, supplier_type, contact_person, email, phone, address, city, state, postal_code, country, credit_limit, preferred_currency, payment_terms, notes } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO vendors (id, name, vendor_number, company_name, supplier_type, contact_person, email, phone, address, city, state, postal_code, country, credit_limit, preferred_currency, payment_terms, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, vendor_number, company_name, supplier_type, contact_person, email, phone, address, city, state, postal_code, country, credit_limit, preferred_currency, payment_terms, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      db.get('SELECT * FROM vendors WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/rest/v1/vendors/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, vendor_number, company_name, supplier_type, contact_person, email, phone, address, city, state, postal_code, country, credit_limit, preferred_currency, payment_terms, status, notes } = req.body;

  db.run(
    'UPDATE vendors SET name = ?, vendor_number = ?, company_name = ?, supplier_type = ?, contact_person = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, postal_code = ?, country = ?, credit_limit = ?, preferred_currency = ?, payment_terms = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, vendor_number, company_name, supplier_type, contact_person, email, phone, address, city, state, postal_code, country, credit_limit, preferred_currency, payment_terms, status, notes, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      
      db.get('SELECT * FROM vendors WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/vendors/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Soft delete by setting status to 'inactive'
  db.run(
    'UPDATE vendors SET status = "inactive", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      
      res.json({ message: 'Vendor deactivated successfully' });
    }
  );
});

// Leads routes
app.get('/rest/v1/leads', authenticateToken, (req, res) => {
  const { order } = req.query;
  
  let query = 'SELECT * FROM leads';
  
  if (order) {
    const orderParts = order.split('.');
    const column = orderParts[0];
    const direction = orderParts[1] || 'asc';
    query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
  } else {
    query += ' ORDER BY created_at DESC';
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/leads', authenticateToken, (req, res) => {
  const { lead_number, first_name, last_name, company_name, contact_name, email, phone, address, city, state, postal_code, country, source, lead_source, status, priority, estimated_value, notes } = req.body;
  const id = uuidv4();

  // Generate lead number if not provided
  const generateLeadNumber = () => {
    if (lead_number) {
      // Use provided lead number
      insertLead(lead_number);
    } else {
      // Generate lead number using number generation settings
      db.run('BEGIN TRANSACTION');
      db.get('SELECT * FROM number_generation_settings WHERE document_type = ? AND is_active = 1', ['lead'], (err, setting) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error retrieving number settings' });
        }
        
        if (!setting) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Number generation settings not found for leads' });
        }
        
        const currentNumber = setting.next_number;
        const paddedNumber = currentNumber.toString().padStart(setting.number_length, '0');
        let generatedNumber;
        
        switch (setting.format) {
          case 'prefix-number':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
            break;
          case 'number-suffix':
            generatedNumber = `${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          case 'prefix-number-suffix':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          default:
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
        }
        
        // Update the next number if auto_increment is enabled
        if (setting.auto_increment) {
          db.run('UPDATE number_generation_settings SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [setting.id], (updateErr) => {
            if (updateErr) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update lead number sequence' });
            }
            
            // Record the generated number
            const sequenceId = uuidv4();
            db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
              [sequenceId, 'lead', generatedNumber, currentNumber], (insertErr) => {
                if (insertErr) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Failed to record lead number sequence' });
                }
                
                db.run('COMMIT');
                insertLead(generatedNumber);
              });
          });
        } else {
          // Just record the number without incrementing
          const sequenceId = uuidv4();
          db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
            [sequenceId, 'lead', generatedNumber, currentNumber], (insertErr) => {
              if (insertErr) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to record lead number sequence' });
              }
              
              db.run('COMMIT');
              insertLead(generatedNumber);
            });
        }
      });
    }
  };

  const insertLead = (finalLeadNumber) => {
    db.run(
      `INSERT INTO leads (id, lead_number, first_name, last_name, company_name, contact_name, email, phone, address, city, state, postal_code, country, source, lead_source, status, priority, estimated_value, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, finalLeadNumber, first_name, last_name, company_name, contact_name, email, phone, address, city, state, postal_code, country, source, lead_source, status, priority, estimated_value, notes],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.status(201).json(row);
        });
      }
    );
  };

  generateLeadNumber();
});

app.put('/rest/v1/leads/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, company_name, contact_name, email, phone, address, city, state, postal_code, country, source, lead_source, status, priority, estimated_value, notes } = req.body;

  db.run(
    'UPDATE leads SET first_name = ?, last_name = ?, company_name = ?, contact_name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, postal_code = ?, country = ?, source = ?, lead_source = ?, status = ?, priority = ?, estimated_value = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [first_name, last_name, company_name, contact_name, email, phone, address, city, state, postal_code, country, source, lead_source, status, priority, estimated_value, notes, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/leads/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM leads WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json({ message: 'Lead deleted successfully' });
  });
});

// Purchase Order routes
app.get('/rest/v1/purchase-orders', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      po.*,
      c.name as company_name,
      v.name as vendor_name,
      v.email as vendor_email,
      v.phone as vendor_phone
    FROM purchase_orders po
    LEFT JOIN companies c ON po.company_id = c.id
    LEFT JOIN vendors v ON po.vendor_id = v.id
    ORDER BY po.created_at DESC
  `;

  db.all(query, [], (err, purchaseOrders) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get purchase order items for each purchase order
    const poIds = purchaseOrders.map(po => po.id);
    if (poIds.length === 0) {
      return res.json([]);
    }

    const itemsQuery = `
      SELECT poi.*
      FROM purchase_order_items poi
      WHERE poi.purchase_order_id IN (${poIds.map(() => '?').join(',')})
    `;

    db.all(itemsQuery, poIds, (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Group items by purchase order
      const purchaseOrdersWithItems = purchaseOrders.map(po => ({
        ...po,
        items: items.filter(item => item.purchase_order_id === po.id)
      }));

      res.json(purchaseOrdersWithItems);
    });
  });
});

app.post('/rest/v1/purchase-orders', authenticateToken, (req, res) => {
  const { document_number, date, company_id, vendor_id, items, total, currency, subtotal, tax_amount, tax_type, default_tax_rate, notes, terms } = req.body;
  const id = uuidv4();

  // Generate document number if not provided
  const generatePONumber = () => {
    if (document_number) {
      // Use provided document number
      insertPurchaseOrder(document_number);
    } else {
      // Generate document number using number generation settings
      generateDocumentNumber('purchase_order', (err, generatedNumber) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        insertPurchaseOrder(generatedNumber);
      });
    }
  };

  const insertPurchaseOrder = (finalDocumentNumber) => {
    db.run('BEGIN TRANSACTION');

    // Insert purchase order
    db.run(
      `INSERT INTO purchase_orders (id, document_number, date, company_id, vendor_id, total, currency, subtotal, tax_amount, tax_type, default_tax_rate, notes, terms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, finalDocumentNumber, date, company_id, vendor_id, total, currency, subtotal, tax_amount, tax_type, default_tax_rate, notes, terms],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error creating purchase order' });
        }

        // Insert purchase order items
        let itemsInserted = 0;
        const totalItems = items.length;

        if (totalItems === 0) {
          db.run('COMMIT');
          return res.status(201).json({ id, message: 'Purchase order created successfully' });
        }

        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO purchase_order_items (id, purchase_order_id, item_code, description, quantity, unit_price, total, tax_rate, tax_amount)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [itemId, id, item.item_code, item.description, item.quantity, item.unit_price, item.total, item.tax_rate || 0, item.tax_amount || 0],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error creating purchase order items' });
              }

              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.status(201).json({ id, message: 'Purchase order created successfully' });
              }
            }
          );
        });
      }
    );
  };

  generatePONumber();
});

app.put('/rest/v1/purchase-orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { document_number, date, company_id, vendor_id, items, total, currency, subtotal, tax_amount, tax_type, default_tax_rate, notes, terms, status } = req.body;

  db.run('BEGIN TRANSACTION');

  // Update purchase order
  db.run(
    `UPDATE purchase_orders SET document_number = ?, date = ?, company_id = ?, vendor_id = ?, total = ?, currency = ?, subtotal = ?, tax_amount = ?, tax_type = ?, default_tax_rate = ?, notes = ?, terms = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [document_number, date, company_id, vendor_id, total, currency, subtotal, tax_amount, tax_type, default_tax_rate, notes, terms, status, id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error updating purchase order' });
      }

      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Purchase order not found' });
      }

      // Delete existing items and insert new ones
      db.run(
        'DELETE FROM purchase_order_items WHERE purchase_order_id = ?',
        [id],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Database error updating purchase order items' });
          }

          // Insert new items
          let itemsInserted = 0;
          const totalItems = items.length;

          if (totalItems === 0) {
            db.run('COMMIT');
            return res.json({ message: 'Purchase order updated successfully' });
          }

          items.forEach(item => {
            const itemId = uuidv4();
            db.run(
              `INSERT INTO purchase_order_items (id, purchase_order_id, item_code, description, quantity, unit_price, total, tax_rate, tax_amount)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [itemId, id, item.item_code, item.description, item.quantity, item.unit_price, item.total, item.tax_rate || 0, item.tax_amount || 0],
              function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Database error updating purchase order items' });
                }

                itemsInserted++;
                if (itemsInserted === totalItems) {
                  db.run('COMMIT');
                  res.json({ message: 'Purchase order updated successfully' });
                }
              }
            );
          });
        }
      );
    }
  );
});

app.delete('/rest/v1/purchase-orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('BEGIN TRANSACTION');

  // Delete purchase order items first
  db.run(
    'DELETE FROM purchase_order_items WHERE purchase_order_id = ?',
    [id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }

      // Delete purchase order
      db.run(
        'DELETE FROM purchase_orders WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Database error' });
          }

          if (this.changes === 0) {
            db.run('ROLLBACK');
            return res.status(404).json({ error: 'Purchase order not found' });
          }

          db.run('COMMIT');
          res.json({ message: 'Purchase order deleted successfully' });
        }
      );
    }
  );
});

// Logistics Module - Shipments routes
app.get('/rest/v1/shipments', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      s.*,
      dn.delivery_note_number,
      c.name as carrier_name,
      cu.first_name as customer_name
    FROM shipments s
    LEFT JOIN delivery_notes dn ON s.delivery_note_id = dn.id
    LEFT JOIN carriers c ON s.carrier_id = c.id
    LEFT JOIN customers cu ON dn.customer_id = cu.id
    ORDER BY s.created_at DESC
  `;

  db.all(query, [], (err, shipments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(shipments);
  });
});

app.post('/rest/v1/shipments', authenticateToken, (req, res) => {
  const { delivery_note_id, carrier_id, status, shipped_date, estimated_delivery_date, actual_delivery_date, shipping_cost, tracking_number, remarks } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO shipments (id, delivery_note_id, carrier_id, status, shipped_date, estimated_delivery_date, actual_delivery_date, shipping_cost, tracking_number, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, delivery_note_id, carrier_id, status, shipped_date, estimated_delivery_date, actual_delivery_date, shipping_cost, tracking_number, remarks],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating shipment' });
      }

      db.get('SELECT * FROM shipments WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/rest/v1/shipments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { delivery_note_id, carrier_id, status, shipped_date, estimated_delivery_date, actual_delivery_date, shipping_cost, tracking_number, remarks } = req.body;

  db.run(
    `UPDATE shipments SET delivery_note_id = ?, carrier_id = ?, status = ?, shipped_date = ?, estimated_delivery_date = ?, actual_delivery_date = ?, shipping_cost = ?, tracking_number = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [delivery_note_id, carrier_id, status, shipped_date, estimated_delivery_date, actual_delivery_date, shipping_cost, tracking_number, remarks, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error updating shipment' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Shipment not found' });
      }

      db.get('SELECT * FROM shipments WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/shipments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM shipments WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({ message: 'Shipment deleted successfully' });
  });
});

// Tracking Information routes
app.get('/rest/v1/tracking-information/:shipment_id', authenticateToken, (req, res) => {
  const { shipment_id } = req.params;

  db.all(
    'SELECT * FROM tracking_information WHERE shipment_id = ? ORDER BY updated_at DESC',
    [shipment_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

app.post('/rest/v1/tracking-information', authenticateToken, (req, res) => {
  const { shipment_id, status, location, updated_by, remarks } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO tracking_information (id, shipment_id, status, location, updated_by, remarks)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, shipment_id, status, location, updated_by, remarks],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error creating tracking information' });
      }

      db.get('SELECT * FROM tracking_information WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

// Carriers routes
app.get('/rest/v1/carriers', authenticateToken, (req, res) => {
  const { select = '*', order } = req.query;
  
  let query = `SELECT ${select} FROM carriers`;
  
  if (order) {
    const orderParts = order.split('.');
    const column = orderParts[0];
    const direction = orderParts[1] || 'asc';
    query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
  } else {
    query += ' ORDER BY name ASC';
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/carriers', authenticateToken, (req, res) => {
  const { name, contact_number, email, address, notes } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO carriers (id, name, contact_number, email, address, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, contact_number, email, address, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      db.get('SELECT * FROM carriers WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/rest/v1/carriers/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, contact_number, email, address, notes } = req.body;

  db.run(
    `UPDATE carriers SET name = ?, contact_number = ?, email = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [name, contact_number, email, address, notes, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Carrier not found' });
      }

      db.get('SELECT * FROM carriers WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/carriers/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM carriers WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    res.json({ message: 'Carrier deleted successfully' });
  });
});

// Delivery Notes routes
app.get('/rest/v1/delivery-notes', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      dn.*,
      so.order_number as sales_order_number,
      c.first_name as customer_name
    FROM delivery_notes dn
    LEFT JOIN sales_orders so ON dn.sales_order_id = so.id
    LEFT JOIN customers c ON dn.customer_id = c.id
    ORDER BY dn.created_at DESC
  `;

  db.all(query, [], (err, deliveryNotes) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const dnIds = deliveryNotes.map(dn => dn.id);
    if (dnIds.length === 0) {
      return res.json([]);
    }

    const itemsQuery = `
      SELECT dni.*
      FROM delivery_note_items dni
      WHERE dni.delivery_note_id IN (${dnIds.map(() => '?').join(',')})
    `;

    db.all(itemsQuery, dnIds, (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const deliveryNotesWithItems = deliveryNotes.map(dn => ({
        ...dn,
        items: items.filter(item => item.delivery_note_id === dn.id)
      }));

      res.json(deliveryNotesWithItems);
    });
  });
});

app.post('/rest/v1/delivery-notes', authenticateToken, (req, res) => {
  const { delivery_note_number, sales_order_id, customer_id, delivery_date, status, warehouse_id, delivery_address, delivery_method, tracking_number, driver_name, vehicle_number, delivered_by, received_by, delivery_time, items, notes, internal_notes } = req.body;
  const id = uuidv4();

  // Generate delivery note number if not provided
  const generateDeliveryNoteNumber = () => {
    if (delivery_note_number) {
      // Use provided delivery note number
      insertDeliveryNote(delivery_note_number);
    } else {
      // Generate delivery note number using number generation settings
      generateDocumentNumber('delivery_note', (err, generatedNumber) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        insertDeliveryNote(generatedNumber);
      });
    }
  };

  const insertDeliveryNote = (finalDeliveryNoteNumber) => {
    db.run('BEGIN TRANSACTION');

    db.run(
      `INSERT INTO delivery_notes (id, delivery_note_number, sales_order_id, customer_id, delivery_date, status, warehouse_id, delivery_address, delivery_method, tracking_number, driver_name, vehicle_number, delivered_by, received_by, delivery_time, notes, internal_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, finalDeliveryNoteNumber, sales_order_id, customer_id, delivery_date, status, warehouse_id, delivery_address, delivery_method, tracking_number, driver_name, vehicle_number, delivered_by, received_by, delivery_time, notes, internal_notes],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error creating delivery note' });
        }

        let itemsInserted = 0;
        const totalItems = items.length;

        if (totalItems === 0) {
          db.run('COMMIT');
          return res.status(201).json({ id, message: 'Delivery note created successfully' });
        }

        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO delivery_note_items (id, delivery_note_id, sales_order_item_id, product_id, description, ordered_quantity, delivered_quantity, unit_price, total_value, batch_number, serial_numbers, condition_status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [itemId, id, item.sales_order_item_id, item.product_id, item.description, item.ordered_quantity, item.delivered_quantity, item.unit_price, item.total_value, item.batch_number, item.serial_numbers, item.condition_status || 'good', item.notes],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error creating delivery note items' });
              }

              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.status(201).json({ id, message: 'Delivery note created successfully' });
              }
            }
          );
        });
      }
    );
  };

  generateDeliveryNoteNumber();
});

app.delete('/rest/v1/delivery-notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('BEGIN TRANSACTION');

  db.run(
    'DELETE FROM delivery_note_items WHERE delivery_note_id = ?',
    [id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }

      db.run(
        'DELETE FROM delivery_notes WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Database error' });
          }

          if (this.changes === 0) {
            db.run('ROLLBACK');
            return res.status(404).json({ error: 'Delivery note not found' });
          }

          db.run('COMMIT');
          res.json({ message: 'Delivery note deleted successfully' });
        }
      );
    }
  );
});

// Customer Returns routes
app.get('/rest/v1/customer-returns', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      cr.*,
      c.first_name as customer_name
    FROM customer_returns cr
    LEFT JOIN customers c ON cr.customer_id = c.id
    ORDER BY cr.created_at DESC
  `;

  db.all(query, [], (err, customerReturns) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const crIds = customerReturns.map(cr => cr.id);
    if (crIds.length === 0) {
      return res.json([]);
    }

    const itemsQuery = `
      SELECT cri.*
      FROM customer_return_items cri
      WHERE cri.return_id IN (${crIds.map(() => '?').join(',')})
    `;

    db.all(itemsQuery, crIds, (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const customerReturnsWithItems = customerReturns.map(cr => ({
        ...cr,
        items: items.filter(item => item.return_id === cr.id)
      }));

      res.json(customerReturnsWithItems);
    });
  });
});

app.post('/rest/v1/customer-returns', authenticateToken, (req, res) => {
  const { return_number, customer_id, sales_order_id, delivery_note_id, return_date, return_type, reason, total_items, total_value, refund_amount, refund_status, replacement_requested, returned_by, received_by, approved_by, approved_at, notes, internal_notes, items } = req.body;
  const id = uuidv4();

  // Generate return number if not provided
  const generateReturnNumber = () => {
    if (return_number) {
      // Use provided return number
      insertCustomerReturn(return_number);
    } else {
      // Generate return number using number generation settings
      db.run('BEGIN TRANSACTION');
      db.get('SELECT * FROM number_generation_settings WHERE document_type = ? AND is_active = 1', ['customer_return'], (err, setting) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error retrieving number settings' });
        }
        
        if (!setting) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Number generation settings not found for customer returns' });
        }
        
        const currentNumber = setting.next_number;
        const paddedNumber = currentNumber.toString().padStart(setting.number_length, '0');
        let generatedNumber;
        
        switch (setting.format) {
          case 'prefix-number':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
            break;
          case 'number-suffix':
            generatedNumber = `${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          case 'prefix-number-suffix':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          default:
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
        }
        
        // Update the next number if auto_increment is enabled
        if (setting.auto_increment) {
          db.run('UPDATE number_generation_settings SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [setting.id], (updateErr) => {
            if (updateErr) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update customer return number sequence' });
            }
            
            // Record the generated number
            const sequenceId = uuidv4();
            db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
              [sequenceId, 'customer_return', generatedNumber, currentNumber], (insertErr) => {
                if (insertErr) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Failed to record customer return number sequence' });
                }
                
                db.run('COMMIT');
                insertCustomerReturn(generatedNumber);
              });
          });
        } else {
          // Just record the number without incrementing
          const sequenceId = uuidv4();
          db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
            [sequenceId, 'customer_return', generatedNumber, currentNumber], (insertErr) => {
              if (insertErr) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to record customer return number sequence' });
              }
              
              db.run('COMMIT');
              insertCustomerReturn(generatedNumber);
            });
        }
      });
    }
  };

  const insertCustomerReturn = (finalReturnNumber) => {
    db.run('BEGIN TRANSACTION');

    db.run(
      `INSERT INTO customer_returns (id, return_number, customer_id, sales_order_id, delivery_note_id, return_date, status, return_type, reason, total_items, total_value, refund_amount, refund_status, replacement_requested, returned_by, received_by, approved_by, approved_at, notes, internal_notes)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, finalReturnNumber, customer_id, sales_order_id, delivery_note_id, return_date, return_type, reason, total_items, total_value, refund_amount, refund_status, replacement_requested || false, returned_by, received_by, approved_by, approved_at, notes, internal_notes],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error creating customer return' });
        }

        let itemsInserted = 0;
        const totalItems = items.length;

        if (totalItems === 0) {
          db.run('COMMIT');
          return res.status(201).json({ id, message: 'Customer return created successfully' });
        }

        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO customer_return_items (id, return_id, delivery_note_item_id, product_id, description, quantity, unit_price, total_value, condition_status, return_reason, batch_number, serial_numbers, refund_amount, replacement_requested, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [itemId, id, item.delivery_note_item_id, item.product_id, item.description, item.quantity, item.unit_price, item.total_value, item.condition_status, item.return_reason, item.batch_number, item.serial_numbers, item.refund_amount, item.replacement_requested || false, item.notes],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error creating customer return items' });
              }

              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.status(201).json({ id, message: 'Customer return created successfully' });
              }
            }
          );
        });
      }
    );
  };

  generateReturnNumber();
});

app.delete('/rest/v1/customer-returns/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('BEGIN TRANSACTION');

  db.run(
    'DELETE FROM customer_return_items WHERE return_id = ?',
    [id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }

      db.run(
        'DELETE FROM customer_returns WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Database error' });
          }

          if (this.changes === 0) {
            db.run('ROLLBACK');
            return res.status(404).json({ error: 'Customer return not found' });
          }

          db.run('COMMIT');
          res.json({ message: 'Customer return deleted successfully' });
        }
      );
    }
  );
});

// Goods Receiving routes
app.get('/rest/v1/goods-receiving', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      gr.*,
      po.document_number as purchase_order_number,
      v.name as vendor_name
    FROM goods_receiving gr
    LEFT JOIN purchase_orders po ON gr.purchase_order_id = po.id
    LEFT JOIN vendors v ON gr.vendor_id = v.id
    ORDER BY gr.created_at DESC
  `;

  db.all(query, [], (err, goodsReceiving) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const grIds = goodsReceiving.map(gr => gr.id);
    if (grIds.length === 0) {
      return res.json([]);
    }

    const itemsQuery = `
      SELECT gri.*
      FROM goods_receiving_items gri
      WHERE gri.grn_id IN (${grIds.map(() => '?').join(',')})
    `;

    db.all(itemsQuery, grIds, (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const goodsReceivingWithItems = goodsReceiving.map(gr => ({
        ...gr,
        items: items.filter(item => item.grn_id === gr.id)
      }));

      res.json(goodsReceivingWithItems);
    });
  });
});

app.post('/rest/v1/goods-receiving', authenticateToken, (req, res) => {
  const { grn_number, purchase_order_id, vendor_id, receiving_date, status, warehouse_id, total_items, received_by, inspector, quality_check_status, delivery_note_number, items, notes, internal_notes } = req.body;
  const id = uuidv4();

  // Generate GRN number if not provided
  const generateGrnNumber = () => {
    if (grn_number) {
      // Use provided GRN number
      insertGoodsReceiving(grn_number);
    } else {
      // Generate GRN number using number generation settings
      db.run('BEGIN TRANSACTION');
      db.get('SELECT * FROM number_generation_settings WHERE document_type = ? AND is_active = 1', ['goods_receiving'], (err, setting) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error retrieving number settings' });
        }
        
        if (!setting) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Number generation settings not found for goods receiving' });
        }
        
        const currentNumber = setting.next_number;
        const paddedNumber = currentNumber.toString().padStart(setting.number_length, '0');
        let generatedNumber;
        
        switch (setting.format) {
          case 'prefix-number':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
            break;
          case 'number-suffix':
            generatedNumber = `${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          case 'prefix-number-suffix':
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}${setting.separator}${setting.suffix}`;
            break;
          default:
            generatedNumber = `${setting.prefix}${setting.separator}${paddedNumber}`;
        }
        
        // Update the next number if auto_increment is enabled
        if (setting.auto_increment) {
          db.run('UPDATE number_generation_settings SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [setting.id], (updateErr) => {
            if (updateErr) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update GRN number sequence' });
            }
            
            // Record the generated number
            const sequenceId = uuidv4();
            db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
              [sequenceId, 'goods_receiving', generatedNumber, currentNumber], (insertErr) => {
                if (insertErr) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Failed to record GRN number sequence' });
                }
                
                db.run('COMMIT');
                insertGoodsReceiving(generatedNumber);
              });
          });
        } else {
          // Just record the number without incrementing
          const sequenceId = uuidv4();
          db.run('INSERT INTO document_sequences (id, document_type, document_number, sequence_number) VALUES (?, ?, ?, ?)', 
            [sequenceId, 'goods_receiving', generatedNumber, currentNumber], (insertErr) => {
              if (insertErr) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to record GRN number sequence' });
              }
              
              db.run('COMMIT');
              insertGoodsReceiving(generatedNumber);
            });
        }
      });
    }
  };

  const insertGoodsReceiving = (finalGrnNumber) => {
    db.run('BEGIN TRANSACTION');
    db.run(
      `INSERT INTO goods_receiving (id, grn_number, purchase_order_id, vendor_id, receiving_date, status, warehouse_id, total_items, received_by, inspector, quality_check_status, delivery_note_number, notes, internal_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, finalGrnNumber, purchase_order_id, vendor_id, receiving_date, status, warehouse_id, total_items, received_by, inspector, quality_check_status, delivery_note_number, notes, internal_notes],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error creating goods receiving note' });
        }

        let itemsInserted = 0;
        const totalItems = items.length;

        if (totalItems === 0) {
          db.run('COMMIT');
          return res.status(201).json({ id, message: 'Goods receiving note created successfully' });
        }

        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO goods_receiving_items (id, grn_id, purchase_order_item_id, product_id, item_code, description, ordered_quantity, received_quantity, rejected_quantity, accepted_quantity, unit_price, total_value, batch_number, expiry_date, serial_numbers, condition_status, rejection_reason, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [itemId, id, item.purchase_order_item_id, item.product_id, item.item_code, item.description, item.ordered_quantity, item.received_quantity, item.rejected_quantity || 0, item.accepted_quantity, item.unit_price, item.total_value, item.batch_number, item.expiry_date, item.serial_numbers, item.condition_status || 'good', item.rejection_reason, item.notes],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error creating goods receiving items' });
              }

              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.status(201).json({ id, message: 'Goods receiving note created successfully' });
              }
            }
          );
        });
      }
    );
  };

  generateGrnNumber();
});

app.delete('/rest/v1/goods-receiving/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('BEGIN TRANSACTION');

  db.run(
    'DELETE FROM goods_receiving_items WHERE grn_id = ?',
    [id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }

      db.run(
        'DELETE FROM goods_receiving WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Database error' });
          }

          if (this.changes === 0) {
            db.run('ROLLBACK');
            return res.status(404).json({ error: 'GRN not found' });
          }

          db.run('COMMIT');
          res.json({ message: 'Goods receiving note deleted successfully' });
        }
      );
    }
  );
});

// Vendor Returns routes
app.get('/rest/v1/vendor-returns', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      vr.*,
      v.name as vendor_name
    FROM vendor_returns vr
    LEFT JOIN vendors v ON vr.vendor_id = v.id
    ORDER BY vr.created_at DESC
  `;

  db.all(query, [], (err, vendorReturns) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const vrIds = vendorReturns.map(vr => vr.id);
    if (vrIds.length === 0) {
      return res.json([]);
    }

    const itemsQuery = `
      SELECT vri.*
      FROM vendor_return_items vri
      WHERE vri.return_id IN (${vrIds.map(() => '?').join(',')})
    `;

    db.all(itemsQuery, vrIds, (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const vendorReturnsWithItems = vendorReturns.map(vr => ({
        ...vr,
        items: items.filter(item => item.return_id === vr.id)
      }));

      res.json(vendorReturnsWithItems);
    });
  });
});

app.post('/rest/v1/vendor-returns', authenticateToken, (req, res) => {
  const { return_number, vendor_id, grn_id, return_date, return_type, reason, total_items, total_value, refund_amount, refund_status, replacement_requested, returned_by, approved_by, approved_at, items, notes, internal_notes } = req.body;
  const id = uuidv4();

  // Generate return number if not provided
  const generateReturnNumber = () => {
    if (return_number) {
      // Use provided return number
      insertVendorReturn(return_number);
    } else {
      // Generate return number using number generation settings
      generateDocumentNumber('vendor_return', (err, generatedNumber) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        insertVendorReturn(generatedNumber);
      });
    }
  };

  const insertVendorReturn = (finalReturnNumber) => {
    db.run('BEGIN TRANSACTION');

    db.run(
      `INSERT INTO vendor_returns (id, return_number, vendor_id, grn_id, return_date, status, return_type, reason, total_items, total_value, refund_amount, refund_status, replacement_requested, returned_by, approved_by, approved_at, notes, internal_notes)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, finalReturnNumber, vendor_id, grn_id, return_date, return_type, reason, total_items, total_value, refund_amount, refund_status, replacement_requested || false, returned_by, approved_by, approved_at, notes, internal_notes],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Database error creating vendor return' });
        }

        let itemsInserted = 0;
        const totalItems = items.length;

        if (totalItems === 0) {
          db.run('COMMIT');
          return res.status(201).json({ id, message: 'Vendor return created successfully' });
        }

        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO vendor_return_items (id, return_id, grn_item_id, product_id, item_code, description, quantity, unit_price, total_value, condition_status, return_reason, batch_number, serial_numbers, refund_amount, replacement_requested, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [itemId, id, item.grn_item_id, item.product_id, item.item_code, item.description, item.quantity, item.unit_price, item.total_value, item.condition_status, item.return_reason, item.batch_number, item.serial_numbers, item.refund_amount, item.replacement_requested || false, item.notes],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error creating vendor return items' });
              }

              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.status(201).json({ id, message: 'Vendor return created successfully' });
              }
            }
          );
        });
      }
    );
  };

  generateReturnNumber();
});

app.delete('/rest/v1/vendor-returns/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('BEGIN TRANSACTION');

  db.run(
    'DELETE FROM vendor_return_items WHERE return_id = ?',
    [id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }

      db.run(
        'DELETE FROM vendor_returns WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Database error' });
          }

          if (this.changes === 0) {
            db.run('ROLLBACK');
            return res.status(404).json({ error: 'Vendor return not found' });
          }

          db.run('COMMIT');
          res.json({ message: 'Vendor return deleted successfully' });
        }
      );
    }
  );
});

// Vendors routes
app.get('/rest/v1/vendors', authenticateToken, (req, res) => {
  const { select = '*', order } = req.query;
  
  let query = `SELECT ${select} FROM vendors`;
  
  if (order) {
    const orderParts = order.split('.');
    const column = orderParts[0];
    const direction = orderParts[1] || 'asc';
    query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
  } else {
    query += ' ORDER BY name ASC';
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/vendors', authenticateToken, (req, res) => {
  const { name, address, city, state, zip, expected_delivery, phone, email, tax_id, capabilities, preferred_currency, payment_terms, lead_time } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO vendors (id, name, address, city, state, zip, expected_delivery, phone, email, tax_id, capabilities, preferred_currency, payment_terms, lead_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, address, city, state, zip, expected_delivery, phone, email, tax_id, capabilities, preferred_currency, payment_terms, lead_time],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      db.get('SELECT * FROM vendors WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

// Companies routes
app.get('/rest/v1/companies', authenticateToken, (req, res) => {
  const { select = '*', order } = req.query;
  
  let query = `SELECT ${select} FROM companies`;
  
  if (order) {
    const orderParts = order.split('.');
    const column = orderParts[0];
    const direction = orderParts[1] || 'asc';
    query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
  } else {
    query += ' ORDER BY name ASC';
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/companies', authenticateToken, (req, res) => {
  const { name, address, city, state, zip, country, phone, email, tax_id, logo, website } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO companies (id, name, address, city, state, zip, country, phone, email, tax_id, logo, website)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, address, city, state, zip, country, phone, email, tax_id, logo, website],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      db.get('SELECT * FROM companies WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

// Warehouses routes
app.get('/rest/v1/warehouses', authenticateToken, (req, res) => {
  const { order } = req.query;
  
  let query = "SELECT * FROM warehouses WHERE status = 'active'";
  
  if (order) {
    const orderParts = order.split('.');
    const column = orderParts[0];
    const direction = orderParts[1] || 'asc';
    query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
  } else {
    query += ' ORDER BY name ASC';
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/rest/v1/warehouses', authenticateToken, (req, res) => {
  const { name, code, address, city, state, postal_code, manager_id } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO warehouses (id, name, code, address, city, state, postal_code, manager_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, code, address, city, state, postal_code, manager_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      db.get('SELECT * FROM warehouses WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/rest/v1/warehouses/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, code, address, city, state, postal_code, manager_id, status } = req.body;

  db.run(
    'UPDATE warehouses SET name = ?, code = ?, address = ?, city = ?, state = ?, postal_code = ?, manager_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, code, address, city, state, postal_code, manager_id, status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Warehouse not found' });
      }
      
      db.get('SELECT * FROM warehouses WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/rest/v1/warehouses/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Soft delete by setting status to 'inactive'
  db.run(
    'UPDATE warehouses SET status = "inactive", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Warehouse not found' });
      }
      
      res.json({ message: 'Warehouse deactivated successfully' });
    }
  );
});

// Mailbox API endpoints
app.get('/api/mailbox/inbox', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT m.*, 
           (u.first_name || ' ' || u.last_name) as sender_name, 
           u.email as sender_email
    FROM messages m
    JOIN message_recipients mr ON m.id = mr.message_id
    JOIN users u ON m.sender_id = u.id
    WHERE mr.recipient_id = ? AND mr.is_deleted = false
    ORDER BY m.created_at DESC
  `, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/mailbox/sent', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT m.*, 
           (u.first_name || ' ' || u.last_name) as sender_name, 
           u.email as sender_email
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.sender_id = ? AND m.is_deleted = false
    ORDER BY m.created_at DESC
  `, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/mailbox/send', authenticateToken, (req, res) => {
  const { to, subject, body } = req.body;
  const messageId = uuidv4();
  const senderId = req.user.id;

  db.run('BEGIN TRANSACTION');
  
  db.run('INSERT INTO messages (id, sender_id, subject, body, sent_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)', [messageId, senderId, subject, body], function(err) {
    if (err) {
      db.run('ROLLBACK');
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Add recipient
    db.run('INSERT INTO message_recipients (id, message_id, recipient_id, recipient_type) VALUES (?, ?, ?, "to")', [uuidv4(), messageId, to], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }
      
      db.run('COMMIT');
      res.status(201).json({ message: 'Message sent successfully' });
    });
  });
});

app.get('/api/mailbox/users', authenticateToken, (req, res) => {
  db.all('SELECT id, (first_name || " " || last_name) as name, email FROM users WHERE id != ?', [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Sales API endpoints for frontend
app.get('/api/sales/invoices', authenticateToken, (req, res) => {
  const { status, customer_id } = req.query;
  const query = `
    SELECT 
      i.*,
      i.invoice_number as document_number,
      c.id as customer_id,
      c.first_name as customer_first_name,
      c.last_name as customer_last_name,
      c.company_name as customer_company_name,
      c.name as customer_name,
      c.email as customer_email
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    ${status ? 'WHERE i.status = ?' : ''}
    ${customer_id ? (status ? 'AND' : 'WHERE') + ' i.customer_id = ?' : ''}
    ORDER BY i.created_at DESC
  `;

  const params = [];
  if (status) params.push(status);
  if (customer_id) params.push(customer_id);

  db.all(query, params, (err, invoices) => {
    if (err) {
      console.error('Database error fetching invoices:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Transform invoices to match frontend expectations
    const transformedInvoices = invoices.map(invoice => ({
      ...invoice,
      customer: {
        id: invoice.customer_id,
        name: invoice.customer_name || 
              (invoice.customer_first_name && invoice.customer_last_name ? 
               `${invoice.customer_first_name} ${invoice.customer_last_name}` : 
               invoice.customer_company_name || 'Unknown Customer'),
        email: invoice.customer_email
      }
    }));

    res.json(transformedInvoices);
  });
});

// Orders stats API
app.get('/api/orders/stats', authenticateToken, (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) AS total_orders,
      SUM(total_amount) AS total_revenue,
      AVG(total_amount) AS average_order_value,
      COUNT(DISTINCT customer_id) AS unique_customers
    FROM invoices
    WHERE status = 'paid'
  `;

  db.get(statsQuery, (err, stats) => {
    if (err) {
      console.error('Database error fetching stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stats || { total_orders: 0, total_revenue: 0, average_order_value: 0, unique_customers: 0 });
  });
});

// ===== QUOTATIONS CRUD ENDPOINTS =====

// Create a new quotation
app.post('/api/quotations', authenticateToken, (req, res) => {
  const {
    customer_id,
    quotation_number,
    issue_date,
    expiry_date,
    status = 'draft',
    subtotal,
    total_amount,
    notes,
    terms_conditions,
    tax_type,
    default_tax_rate,
    items = []
  } = req.body;

  if (!customer_id || !quotation_number) {
    return res.status(400).json({ error: 'Customer ID and quotation number are required' });
  }

  const quotationId = uuidv4();

  db.run('BEGIN TRANSACTION');
  
  // Insert quotation
  db.run(
    `INSERT INTO quotations (
      id, customer_id, quotation_number, issue_date, expiry_date, status,
      subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [quotationId, customer_id, quotation_number, issue_date, expiry_date, status,
     subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error creating quotation:', err);
        return res.status(500).json({ error: 'Database error creating quotation' });
      }
      
      // Insert quotation items
      let itemsInserted = 0;
      const totalItems = items.length;
      
      if (totalItems === 0) {
        db.run('COMMIT');
        return res.status(201).json({ id: quotationId, message: 'Quotation created successfully' });
      }
      
      items.forEach(item => {
        const itemId = uuidv4();
        db.run(
          `INSERT INTO quotation_items (
            id, quotation_id, product_id, description, quantity, unit_price,
            total_price, tax_rate, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [itemId, quotationId, item.product_id, item.description, item.quantity,
           item.unit_price, item.total_price, item.tax_rate],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              console.error('Error creating quotation item:', err);
              return res.status(500).json({ error: 'Database error creating quotation items' });
            }
            
            itemsInserted++;
            if (itemsInserted === totalItems) {
              db.run('COMMIT');
              res.status(201).json({ id: quotationId, message: 'Quotation created successfully' });
            }
          }
        );
      });
    }
  );
});

// Get all quotations
app.get('/api/quotations', authenticateToken, (req, res) => {
  const { status, customer_id } = req.query;
  
  let query = `
    SELECT 
      q.*,
      c.name as customer_name,
      c.company_name as customer_company_name,
      c.email as customer_email,
      c.phone as customer_phone
    FROM quotations q
    LEFT JOIN customers c ON q.customer_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  if (status) {
    query += ' AND q.status = ?';
    params.push(status);
  }
  if (customer_id) {
    query += ' AND q.customer_id = ?';
    params.push(customer_id);
  }
  
  query += ' ORDER BY q.created_at DESC';
  
  db.all(query, params, (err, quotations) => {
    if (err) {
      console.error('Database error fetching quotations:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(quotations);
  });
});

// Get quotation by ID with items
app.get('/api/quotations/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT 
      q.*,
      c.name as customer_name,
      c.company_name as customer_company_name,
      c.email as customer_email,
      c.phone as customer_phone
    FROM quotations q
    LEFT JOIN customers c ON q.customer_id = c.id
    WHERE q.id = ?
  `, [id], (err, quotation) => {
    if (err) {
      console.error('Database error fetching quotation:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Get quotation items
    db.all(`
      SELECT 
        qi.*,
        p.name as product_name,
        p.sku as product_sku
      FROM quotation_items qi
      LEFT JOIN products p ON qi.product_id = p.id
      WHERE qi.quotation_id = ?
      ORDER BY qi.created_at
    `, [id], (err, items) => {
      if (err) {
        console.error('Database error fetching quotation items:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      quotation.items = items;
      res.json(quotation);
    });
  });
});

// Update quotation
app.put('/api/quotations/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    customer_id,
    quotation_number,
    issue_date,
    expiry_date,
    status,
    subtotal,
    total_amount,
    notes,
    terms_conditions,
    tax_type,
    default_tax_rate,
    items = []
  } = req.body;

  db.run('BEGIN TRANSACTION');
  
  // Update quotation
  db.run(
    `UPDATE quotations SET 
      customer_id = ?, quotation_number = ?, issue_date = ?, expiry_date = ?, status = ?,
      subtotal = ?, total_amount = ?, notes = ?, terms_conditions = ?, tax_type = ?, 
      default_tax_rate = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [customer_id, quotation_number, issue_date, expiry_date, status,
     subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate, id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error updating quotation:', err);
        return res.status(500).json({ error: 'Database error updating quotation' });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Quotation not found' });
      }
      
      // Delete existing items
      db.run('DELETE FROM quotation_items WHERE quotation_id = ?', [id], function(err) {
        if (err) {
          db.run('ROLLBACK');
          console.error('Error deleting quotation items:', err);
          return res.status(500).json({ error: 'Database error updating quotation items' });
        }
        
        // Insert new items
        let itemsInserted = 0;
        const totalItems = items.length;
        
        if (totalItems === 0) {
          db.run('COMMIT');
          return res.json({ message: 'Quotation updated successfully' });
        }
        
        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO quotation_items (
              id, quotation_id, product_id, description, quantity, unit_price,
              total_price, tax_rate, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [itemId, id, item.product_id, item.description, item.quantity,
             item.unit_price, item.total_price, item.tax_rate],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                console.error('Error creating quotation item:', err);
                return res.status(500).json({ error: 'Database error updating quotation items' });
              }
              
              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.json({ message: 'Quotation updated successfully' });
              }
            }
          );
        });
      });
    }
  );
});

// Delete quotation
app.delete('/api/quotations/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('BEGIN TRANSACTION');
  
  // Delete quotation items first
  db.run('DELETE FROM quotation_items WHERE quotation_id = ?', [id], function(err) {
    if (err) {
      db.run('ROLLBACK');
      console.error('Error deleting quotation items:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Delete quotation
    db.run('DELETE FROM quotations WHERE id = ?', [id], function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error deleting quotation:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Quotation not found' });
      }
      
      db.run('COMMIT');
      res.json({ message: 'Quotation deleted successfully' });
    });
  });
});

// ===== SALES ORDERS CRUD ENDPOINTS =====

// Create a new sales order
app.post('/api/sales-orders', authenticateToken, (req, res) => {
  const {
    customer_id,
    order_number,
    order_date,
    delivery_date,
    status = 'pending',
    subtotal,
    total_amount,
    notes,
    terms_conditions,
    tax_type,
    default_tax_rate,
    items = []
  } = req.body;

  if (!customer_id || !order_number) {
    return res.status(400).json({ error: 'Customer ID and order number are required' });
  }

  const orderId = uuidv4();

  db.run('BEGIN TRANSACTION');
  
  // Insert sales order
  db.run(
    `INSERT INTO sales_orders (
      id, customer_id, order_number, order_date, delivery_date, status,
      subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [orderId, customer_id, order_number, order_date, delivery_date, status,
     subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error creating sales order:', err);
        return res.status(500).json({ error: 'Database error creating sales order' });
      }
      
      // Insert sales order items
      let itemsInserted = 0;
      const totalItems = items.length;
      
      if (totalItems === 0) {
        db.run('COMMIT');
        return res.status(201).json({ id: orderId, message: 'Sales order created successfully' });
      }
      
      items.forEach(item => {
        const itemId = uuidv4();
        db.run(
          `INSERT INTO sales_order_items (
            id, sales_order_id, product_id, description, quantity, unit_price,
            total_price, tax_rate, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [itemId, orderId, item.product_id, item.description, item.quantity,
           item.unit_price, item.total_price, item.tax_rate],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              console.error('Error creating sales order item:', err);
              return res.status(500).json({ error: 'Database error creating sales order items' });
            }
            
            itemsInserted++;
            if (itemsInserted === totalItems) {
              db.run('COMMIT');
              res.status(201).json({ id: orderId, message: 'Sales order created successfully' });
            }
          }
        );
      });
    }
  );
});

// Get all sales orders
app.get('/api/sales-orders', authenticateToken, (req, res) => {
  const { status, customer_id } = req.query;
  
  let query = `
    SELECT 
      so.*,
      c.name as customer_name,
      c.company_name as customer_company_name,
      c.email as customer_email,
      c.phone as customer_phone
    FROM sales_orders so
    LEFT JOIN customers c ON so.customer_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  if (status) {
    query += ' AND so.status = ?';
    params.push(status);
  }
  if (customer_id) {
    query += ' AND so.customer_id = ?';
    params.push(customer_id);
  }
  
  query += ' ORDER BY so.created_at DESC';
  
  db.all(query, params, (err, orders) => {
    if (err) {
      console.error('Database error fetching sales orders:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(orders);
  });
});

// Get sales order by ID with items
app.get('/api/sales-orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT 
      so.*,
      c.name as customer_name,
      c.company_name as customer_company_name,
      c.email as customer_email,
      c.phone as customer_phone
    FROM sales_orders so
    LEFT JOIN customers c ON so.customer_id = c.id
    WHERE so.id = ?
  `, [id], (err, order) => {
    if (err) {
      console.error('Database error fetching sales order:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Sales order not found' });
    }
    
    // Get sales order items
    db.all(`
      SELECT 
        soi.*,
        p.name as product_name,
        p.sku as product_sku
      FROM sales_order_items soi
      LEFT JOIN products p ON soi.product_id = p.id
      WHERE soi.sales_order_id = ?
      ORDER BY soi.created_at
    `, [id], (err, items) => {
      if (err) {
        console.error('Database error fetching sales order items:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      order.items = items;
      res.json(order);
    });
  });
});

// Update sales order
app.put('/api/sales-orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    customer_id,
    order_number,
    order_date,
    delivery_date,
    status,
    subtotal,
    total_amount,
    notes,
    terms_conditions,
    tax_type,
    default_tax_rate,
    items = []
  } = req.body;

  db.run('BEGIN TRANSACTION');
  
  // Update sales order
  db.run(
    `UPDATE sales_orders SET 
      customer_id = ?, order_number = ?, order_date = ?, delivery_date = ?, status = ?,
      subtotal = ?, total_amount = ?, notes = ?, terms_conditions = ?, tax_type = ?, 
      default_tax_rate = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [customer_id, order_number, order_date, delivery_date, status,
     subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate, id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error updating sales order:', err);
        return res.status(500).json({ error: 'Database error updating sales order' });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Sales order not found' });
      }
      
      // Delete existing items
      db.run('DELETE FROM sales_order_items WHERE sales_order_id = ?', [id], function(err) {
        if (err) {
          db.run('ROLLBACK');
          console.error('Error deleting sales order items:', err);
          return res.status(500).json({ error: 'Database error updating sales order items' });
        }
        
        // Insert new items
        let itemsInserted = 0;
        const totalItems = items.length;
        
        if (totalItems === 0) {
          db.run('COMMIT');
          return res.json({ message: 'Sales order updated successfully' });
        }
        
        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO sales_order_items (
              id, sales_order_id, product_id, description, quantity, unit_price,
              total_price, tax_rate, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [itemId, id, item.product_id, item.description, item.quantity,
             item.unit_price, item.total_price, item.tax_rate],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                console.error('Error creating sales order item:', err);
                return res.status(500).json({ error: 'Database error updating sales order items' });
              }
              
              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.json({ message: 'Sales order updated successfully' });
              }
            }
          );
        });
      });
    }
  );
});

// Delete sales order
app.delete('/api/sales-orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('BEGIN TRANSACTION');
  
  // Delete sales order items first
  db.run('DELETE FROM sales_order_items WHERE sales_order_id = ?', [id], function(err) {
    if (err) {
      db.run('ROLLBACK');
      console.error('Error deleting sales order items:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Delete sales order
    db.run('DELETE FROM sales_orders WHERE id = ?', [id], function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error deleting sales order:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Sales order not found' });
      }
      
      db.run('COMMIT');
      res.json({ message: 'Sales order deleted successfully' });
    });
  });
});

// ===== DELIVERY NOTES CRUD ENDPOINTS =====

// Create a new delivery note
app.post('/api/delivery-notes', authenticateToken, (req, res) => {
  const {
    customer_id,
    delivery_note_number,
    delivery_date,
    status = 'pending',
    subtotal,
    total_amount,
    notes,
    terms_conditions,
    tax_type,
    default_tax_rate,
    items = []
  } = req.body;

  if (!customer_id || !delivery_note_number) {
    return res.status(400).json({ error: 'Customer ID and delivery note number are required' });
  }

  const deliveryNoteId = uuidv4();

  db.run('BEGIN TRANSACTION');
  
  // Insert delivery note
  db.run(
    `INSERT INTO delivery_notes (
      id, customer_id, delivery_note_number, delivery_date, status,
      subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [deliveryNoteId, customer_id, delivery_note_number, delivery_date, status,
     subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error creating delivery note:', err);
        return res.status(500).json({ error: 'Database error creating delivery note' });
      }
      
      // Insert delivery note items
      let itemsInserted = 0;
      const totalItems = items.length;
      
      if (totalItems === 0) {
        db.run('COMMIT');
        return res.status(201).json({ id: deliveryNoteId, message: 'Delivery note created successfully' });
      }
      
      items.forEach(item => {
        const itemId = uuidv4();
        db.run(
          `INSERT INTO delivery_note_items (
            id, delivery_note_id, product_id, description, quantity, unit_price,
            total_price, tax_rate, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [itemId, deliveryNoteId, item.product_id, item.description, item.quantity,
           item.unit_price, item.total_price, item.tax_rate],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              console.error('Error creating delivery note item:', err);
              return res.status(500).json({ error: 'Database error creating delivery note items' });
            }
            
            itemsInserted++;
            if (itemsInserted === totalItems) {
              db.run('COMMIT');
              res.status(201).json({ id: deliveryNoteId, message: 'Delivery note created successfully' });
            }
          }
        );
      });
    }
  );
});

// Get all delivery notes
app.get('/api/delivery-notes', authenticateToken, (req, res) => {
  const { status, customer_id } = req.query;
  
  let query = `
    SELECT 
      dn.*,
      c.name as customer_name,
      c.company_name as customer_company_name,
      c.email as customer_email,
      c.phone as customer_phone
    FROM delivery_notes dn
    LEFT JOIN customers c ON dn.customer_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  if (status) {
    query += ' AND dn.status = ?';
    params.push(status);
  }
  if (customer_id) {
    query += ' AND dn.customer_id = ?';
    params.push(customer_id);
  }
  
  query += ' ORDER BY dn.created_at DESC';
  
  db.all(query, params, (err, deliveryNotes) => {
    if (err) {
      console.error('Database error fetching delivery notes:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(deliveryNotes);
  });
});

// Get delivery note by ID with items
app.get('/api/delivery-notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT 
      dn.*,
      c.name as customer_name,
      c.company_name as customer_company_name,
      c.email as customer_email,
      c.phone as customer_phone
    FROM delivery_notes dn
    LEFT JOIN customers c ON dn.customer_id = c.id
    WHERE dn.id = ?
  `, [id], (err, deliveryNote) => {
    if (err) {
      console.error('Database error fetching delivery note:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!deliveryNote) {
      return res.status(404).json({ error: 'Delivery note not found' });
    }
    
    // Get delivery note items
    db.all(`
      SELECT 
        dni.*,
        p.name as product_name,
        p.sku as product_sku
      FROM delivery_note_items dni
      LEFT JOIN products p ON dni.product_id = p.id
      WHERE dni.delivery_note_id = ?
      ORDER BY dni.created_at
    `, [id], (err, items) => {
      if (err) {
        console.error('Database error fetching delivery note items:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      deliveryNote.items = items;
      res.json(deliveryNote);
    });
  });
});

// Update delivery note
app.put('/api/delivery-notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    customer_id,
    delivery_note_number,
    delivery_date,
    status,
    subtotal,
    total_amount,
    notes,
    terms_conditions,
    tax_type,
    default_tax_rate,
    items = []
  } = req.body;

  db.run('BEGIN TRANSACTION');
  
  // Update delivery note
  db.run(
    `UPDATE delivery_notes SET 
      customer_id = ?, delivery_note_number = ?, delivery_date = ?, status = ?,
      subtotal = ?, total_amount = ?, notes = ?, terms_conditions = ?, tax_type = ?, 
      default_tax_rate = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [customer_id, delivery_note_number, delivery_date, status,
     subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate, id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error updating delivery note:', err);
        return res.status(500).json({ error: 'Database error updating delivery note' });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Delivery note not found' });
      }
      
      // Delete existing items
      db.run('DELETE FROM delivery_note_items WHERE delivery_note_id = ?', [id], function(err) {
        if (err) {
          db.run('ROLLBACK');
          console.error('Error deleting delivery note items:', err);
          return res.status(500).json({ error: 'Database error updating delivery note items' });
        }
        
        // Insert new items
        let itemsInserted = 0;
        const totalItems = items.length;
        
        if (totalItems === 0) {
          db.run('COMMIT');
          return res.json({ message: 'Delivery note updated successfully' });
        }
        
        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO delivery_note_items (
              id, delivery_note_id, product_id, description, quantity, unit_price,
              total_price, tax_rate, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [itemId, id, item.product_id, item.description, item.quantity,
             item.unit_price, item.total_price, item.tax_rate],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                console.error('Error creating delivery note item:', err);
                return res.status(500).json({ error: 'Database error updating delivery note items' });
              }
              
              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.json({ message: 'Delivery note updated successfully' });
              }
            }
          );
        });
      });
    }
  );
});

// Delete delivery note
app.delete('/api/delivery-notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('BEGIN TRANSACTION');
  
  // Delete delivery note items first
  db.run('DELETE FROM delivery_note_items WHERE delivery_note_id = ?', [id], function(err) {
    if (err) {
      db.run('ROLLBACK');
      console.error('Error deleting delivery note items:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Delete delivery note
    db.run('DELETE FROM delivery_notes WHERE id = ?', [id], function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error deleting delivery note:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Delivery note not found' });
      }
      
      db.run('COMMIT');
      res.json({ message: 'Delivery note deleted successfully' });
    });
  });
});

// ===== INVOICES CRUD ENDPOINTS =====

// Create a new invoice
app.post('/api/invoices', authenticateToken, (req, res) => {
  const {
    customer_id,
    invoice_number,
    invoice_date,
    due_date,
    status = 'draft',
    subtotal,
    total_amount,
    notes,
    terms_conditions,
    tax_type,
    default_tax_rate,
    items = []
  } = req.body;

  if (!customer_id || !invoice_number) {
    return res.status(400).json({ error: 'Customer ID and invoice number are required' });
  }

  const invoiceId = uuidv4();

  db.run('BEGIN TRANSACTION');
  
  // Insert invoice
  db.run(
    `INSERT INTO invoices (
      id, customer_id, invoice_number, invoice_date, due_date, status,
      subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [invoiceId, customer_id, invoice_number, invoice_date, due_date, status,
     subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error creating invoice:', err);
        return res.status(500).json({ error: 'Database error creating invoice' });
      }
      
      // Insert invoice items
      let itemsInserted = 0;
      const totalItems = items.length;
      
      if (totalItems === 0) {
        db.run('COMMIT');
        return res.status(201).json({ id: invoiceId, message: 'Invoice created successfully' });
      }
      
      items.forEach(item => {
        const itemId = uuidv4();
        db.run(
          `INSERT INTO invoice_items (
            id, invoice_id, product_id, description, quantity, unit_price,
            total_price, tax_rate, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [itemId, invoiceId, item.product_id, item.description, item.quantity,
           item.unit_price, item.total_price, item.tax_rate],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              console.error('Error creating invoice item:', err);
              return res.status(500).json({ error: 'Database error creating invoice items' });
            }
            
            itemsInserted++;
            if (itemsInserted === totalItems) {
              db.run('COMMIT');
              res.status(201).json({ id: invoiceId, message: 'Invoice created successfully' });
            }
          }
        );
      });
    }
  );
});

// Get all invoices (enhanced version)
app.get('/api/invoices', authenticateToken, (req, res) => {
  const { status, customer_id } = req.query;
  
  let query = `
    SELECT 
      i.*,
      c.name as customer_name,
      c.company_name as customer_company_name,
      c.email as customer_email,
      c.phone as customer_phone
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  if (status) {
    query += ' AND i.status = ?';
    params.push(status);
  }
  if (customer_id) {
    query += ' AND i.customer_id = ?';
    params.push(customer_id);
  }
  
  query += ' ORDER BY i.created_at DESC';
  
  db.all(query, params, (err, invoices) => {
    if (err) {
      console.error('Database error fetching invoices:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(invoices);
  });
});

// Get invoice by ID with items
app.get('/api/invoices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT 
      i.*,
      c.name as customer_name,
      c.company_name as customer_company_name,
      c.email as customer_email,
      c.phone as customer_phone
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `, [id], (err, invoice) => {
    if (err) {
      console.error('Database error fetching invoice:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Get invoice items
    db.all(`
      SELECT 
        ii.*,
        p.name as product_name,
        p.sku as product_sku
      FROM invoice_items ii
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE ii.invoice_id = ?
      ORDER BY ii.created_at
    `, [id], (err, items) => {
      if (err) {
        console.error('Database error fetching invoice items:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      invoice.items = items;
      res.json(invoice);
    });
  });
});

// Update invoice
app.put('/api/invoices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    customer_id,
    invoice_number,
    invoice_date,
    due_date,
    status,
    subtotal,
    total_amount,
    notes,
    terms_conditions,
    tax_type,
    default_tax_rate,
    items = []
  } = req.body;

  db.run('BEGIN TRANSACTION');
  
  // Update invoice
  db.run(
    `UPDATE invoices SET 
      customer_id = ?, invoice_number = ?, invoice_date = ?, due_date = ?, status = ?,
      subtotal = ?, total_amount = ?, notes = ?, terms_conditions = ?, tax_type = ?, 
      default_tax_rate = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [customer_id, invoice_number, invoice_date, due_date, status,
     subtotal, total_amount, notes, terms_conditions, tax_type, default_tax_rate, id],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error updating invoice:', err);
        return res.status(500).json({ error: 'Database error updating invoice' });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      // Delete existing items
      db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [id], function(err) {
        if (err) {
          db.run('ROLLBACK');
          console.error('Error deleting invoice items:', err);
          return res.status(500).json({ error: 'Database error updating invoice items' });
        }
        
        // Insert new items
        let itemsInserted = 0;
        const totalItems = items.length;
        
        if (totalItems === 0) {
          db.run('COMMIT');
          return res.json({ message: 'Invoice updated successfully' });
        }
        
        items.forEach(item => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO invoice_items (
              id, invoice_id, product_id, description, quantity, unit_price,
              total_price, tax_rate, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [itemId, id, item.product_id, item.description, item.quantity,
             item.unit_price, item.total_price, item.tax_rate],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                console.error('Error creating invoice item:', err);
                return res.status(500).json({ error: 'Database error updating invoice items' });
              }
              
              itemsInserted++;
              if (itemsInserted === totalItems) {
                db.run('COMMIT');
                res.json({ message: 'Invoice updated successfully' });
              }
            }
          );
        });
      });
    }
  );
});

// Delete invoice
app.delete('/api/invoices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('BEGIN TRANSACTION');
  
  // Delete invoice items first
  db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [id], function(err) {
    if (err) {
      db.run('ROLLBACK');
      console.error('Error deleting invoice items:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Delete invoice
    db.run('DELETE FROM invoices WHERE id = ?', [id], function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Error deleting invoice:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      db.run('COMMIT');
      res.json({ message: 'Invoice deleted successfully' });
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend accessible at:`);
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - Network: http://0.0.0.0:${PORT} (accessible from any network)`);
  console.log(`  - Your IP: http://192.168.100.40:${PORT}`);
  initializeDatabase();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
