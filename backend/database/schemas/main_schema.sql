-- Complete ERP Database Schema
-- Based on the analysis of erp-modules-clean project

-- ====================
-- CORE ENTITIES
-- ====================

-- Companies Table
CREATE TABLE companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip VARCHAR(20),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    tax_id VARCHAR(50),
    website VARCHAR(255),
    logo_url TEXT,
    etims_pin VARCHAR(50),
    registration_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users and Authentication
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
role TEXT CHECK(role IN ('admin', 'manager', 'user', 'viewer')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Sessions for mobile app
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    device_id VARCHAR(255),
device_type TEXT CHECK(device_type IN ('mobile', 'web', 'tablet')) DEFAULT 'mobile',
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================
-- CUSTOMER MANAGEMENT
-- ====================

-- Customers Table
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    customer_number VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
customer_type TEXT CHECK(customer_type IN ('individual', 'company')) DEFAULT 'individual',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip VARCHAR(20),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    tax_number VARCHAR(50),
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    payment_terms INT DEFAULT 30,
    preferred_currency VARCHAR(10) DEFAULT 'USD',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Customer Contacts
CREATE TABLE customer_contacts (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Leads Management
CREATE TABLE leads (
    id VARCHAR(36) PRIMARY KEY,
    lead_number VARCHAR(50) UNIQUE,
    company_name VARCHAR(255),
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    source VARCHAR(100),
status TEXT CHECK(status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')) DEFAULT 'new',
priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    estimated_value DECIMAL(15, 2),
    expected_close_date DATE,
    notes TEXT,
    assigned_to VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ====================
-- VENDOR MANAGEMENT
-- ====================

-- Vendors Table
CREATE TABLE vendors (
    id VARCHAR(36) PRIMARY KEY,
    vendor_number VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip VARCHAR(20),
    country VARCHAR(100),
    tax_number VARCHAR(50),
    payment_terms INT DEFAULT 30,
    preferred_currency VARCHAR(10) DEFAULT 'USD',
    lead_time INT DEFAULT 7,
    capabilities JSON,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ====================
-- INVENTORY MANAGEMENT
-- ====================

-- Product Categories
CREATE TABLE product_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_category_id VARCHAR(36),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES product_categories(id)
);

-- Inventory Items/Products
CREATE TABLE inventory_items (
    id VARCHAR(36) PRIMARY KEY,
    item_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(36),
    vendor_id VARCHAR(36),
    barcode VARCHAR(100),
    sku VARCHAR(100),
    unit_of_measure VARCHAR(50) DEFAULT 'pcs',
    weight DECIMAL(10, 3),
    dimensions VARCHAR(100),
    current_stock DECIMAL(15, 3) DEFAULT 0,
    minimum_stock DECIMAL(15, 3) DEFAULT 0,
    reorder_point DECIMAL(15, 3) DEFAULT 0,
    maximum_stock DECIMAL(15, 3),
    unit_cost DECIMAL(15, 4) DEFAULT 0,
    selling_price DECIMAL(15, 4) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    location VARCHAR(255),
    supplier VARCHAR(255),
    last_restocked DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Stock Movements
CREATE TABLE stock_movements (
    id VARCHAR(36) PRIMARY KEY,
    movement_number VARCHAR(50) UNIQUE,
    item_id VARCHAR(36) NOT NULL,
    movement_type ENUM('in', 'out', 'adjustment', 'transfer') NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    unit_cost DECIMAL(15, 4),
    total_cost DECIMAL(15, 2),
    reference_document VARCHAR(100),
    reference_id VARCHAR(36),
    reason VARCHAR(255),
    batch_number VARCHAR(100),
    expiry_date DATE,
    location_from VARCHAR(255),
    location_to VARCHAR(255),
    movement_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Inventory Alerts
CREATE TABLE inventory_alerts (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36) NOT NULL,
    alert_type ENUM('low_stock', 'reorder', 'overstock', 'expiry') NOT NULL,
    current_quantity DECIMAL(15, 3),
    threshold_quantity DECIMAL(15, 3),
    message TEXT,
    status ENUM('active', 'resolved', 'dismissed') DEFAULT 'active',
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    created_by VARCHAR(36),
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ====================
-- DOCUMENT MANAGEMENT
-- ====================

-- Document Types Configuration
CREATE TABLE document_types (
    id VARCHAR(36) PRIMARY KEY,
    type_code VARCHAR(50) UNIQUE NOT NULL,
    type_name VARCHAR(255) NOT NULL,
    prefix VARCHAR(20),
    next_number INT DEFAULT 1,
    number_format VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents (Universal for all document types)
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    document_number VARCHAR(100) UNIQUE NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    valid_until DATE,
    expected_delivery DATE,
    
    -- Party Information
    customer_id VARCHAR(36),
    vendor_id VARCHAR(36),
    company_id VARCHAR(36) NOT NULL,
    
    -- Financial Information
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    shipping_cost DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Status and Workflow
    status VARCHAR(50) DEFAULT 'draft',
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by VARCHAR(36),
    approved_at TIMESTAMP NULL,
    
    -- Payment Information
    payment_terms VARCHAR(255),
    payment_method VARCHAR(100),
    payment_status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    
    -- Additional Fields
    notes TEXT,
    terms_conditions TEXT,
    special_instructions TEXT,
    reference_number VARCHAR(100),
    
    -- QR Code and eTIMS
    qr_code_data TEXT,
    etims_submitted BOOLEAN DEFAULT FALSE,
    etims_response JSON,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Document Line Items
CREATE TABLE document_line_items (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36),
    item_code VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    unit_price DECIMAL(15, 4) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    line_total DECIMAL(15, 2) NOT NULL,
    unit VARCHAR(50),
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id)
);

-- ====================
-- FINANCIAL MANAGEMENT
-- ====================

-- Chart of Accounts
CREATE TABLE chart_of_accounts (
    id VARCHAR(36) PRIMARY KEY,
    account_code VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type ENUM('asset', 'liability', 'equity', 'income', 'expense') NOT NULL,
    parent_account_id VARCHAR(36),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    balance DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    FOREIGN KEY (parent_account_id) REFERENCES chart_of_accounts(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Financial Transactions
CREATE TABLE financial_transactions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_number VARCHAR(100) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type ENUM('sale', 'purchase', 'payment', 'receipt', 'adjustment') NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    description TEXT,
    
    -- Party Information
    customer_id VARCHAR(36),
    vendor_id VARCHAR(36),
    
    -- Financial Amounts
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Status and Flags
    status ENUM('pending', 'completed', 'cancelled', 'reversed') DEFAULT 'pending',
    affects_inventory BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Transaction Entries (Double Entry Bookkeeping)
CREATE TABLE transaction_entries (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    description TEXT,
    debit_amount DECIMAL(15, 2) DEFAULT 0,
    credit_amount DECIMAL(15, 2) DEFAULT 0,
    entry_date DATE NOT NULL,
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES financial_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id)
);

-- Expenses Management
CREATE TABLE expenses (
    id VARCHAR(36) PRIMARY KEY,
    expense_number VARCHAR(100) UNIQUE NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    vendor_id VARCHAR(36),
    account_id VARCHAR(36),
    payment_method VARCHAR(100),
    receipt_number VARCHAR(100),
    status ENUM('pending', 'approved', 'paid', 'rejected') DEFAULT 'pending',
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    approved_by VARCHAR(36),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Commission Management
CREATE TABLE commissions (
    id VARCHAR(36) PRIMARY KEY,
    commission_number VARCHAR(100) UNIQUE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    employee_id VARCHAR(36),
    department VARCHAR(100),
    total_sales DECIMAL(15, 2) DEFAULT 0,
    total_expenses DECIMAL(15, 2) DEFAULT 0,
    net_profit DECIMAL(15, 2) DEFAULT 0,
    commission_rate DECIMAL(5, 2) DEFAULT 0,
    commission_amount DECIMAL(15, 2) DEFAULT 0,
    status ENUM('draft', 'calculated', 'approved', 'paid') DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Currency Exchange Rates
CREATE TABLE currency_rates (
    id VARCHAR(36) PRIMARY KEY,
    base_currency VARCHAR(10) NOT NULL,
    target_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(15, 8) NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_currency_date (base_currency, target_currency, effective_date)
);

-- ====================
-- SYSTEM SETTINGS
-- ====================

-- System Settings
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Settings
CREATE TABLE user_settings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_setting (user_id, setting_key)
);

-- Audit Log
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(36) NOT NULL,
    action ENUM('create', 'update', 'delete') NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ====================
-- MOBILE APP SPECIFIC
-- ====================

-- Device Registration for Push Notifications
CREATE TABLE mobile_devices (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    device_token VARCHAR(255) NOT NULL,
    device_type ENUM('ios', 'android') NOT NULL,
    app_version VARCHAR(20),
    os_version VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Offline Sync Queue
CREATE TABLE sync_queue (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(36) NOT NULL,
    action ENUM('create', 'update', 'delete') NOT NULL,
    data JSON NOT NULL,
    status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
    attempts INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================
-- INDEXES FOR PERFORMANCE
-- ====================

-- Customer indexes
CREATE INDEX idx_customers_number ON customers(customer_number);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_status ON customers(status);

-- Vendor indexes
CREATE INDEX idx_vendors_number ON vendors(vendor_number);
CREATE INDEX idx_vendors_name ON vendors(name);

-- Inventory indexes
CREATE INDEX idx_inventory_code ON inventory_items(item_code);
CREATE INDEX idx_inventory_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_stock ON inventory_items(current_stock);

-- Document indexes
CREATE INDEX idx_documents_number ON documents(document_number);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_date ON documents(date);
CREATE INDEX idx_documents_customer ON documents(customer_id);
CREATE INDEX idx_documents_vendor ON documents(vendor_id);
CREATE INDEX idx_documents_status ON documents(status);

-- Financial indexes
CREATE INDEX idx_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX idx_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX idx_accounts_type ON chart_of_accounts(account_type);

-- Mobile app indexes
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(access_token(100));
CREATE INDEX idx_sync_user_status ON sync_queue(user_id, status);

-- ====================
-- INITIAL DATA
-- ====================

-- Insert default document types
INSERT INTO document_types (id, type_code, type_name, prefix, number_format) VALUES
('DT001', 'purchase-order', 'Purchase Order', 'PO', 'PO-{YYYY}-{####}'),
('DT002', 'sales-order', 'Sales Order', 'SO', 'SO-{YYYY}-{####}'),
('DT003', 'invoice', 'Invoice', 'INV', 'INV-{YYYY}-{####}'),
('DT004', 'quote', 'Quotation', 'QT', 'QT-{YYYY}-{####}'),
('DT005', 'delivery-note', 'Delivery Note', 'DN', 'DN-{YYYY}-{####}'),
('DT006', 'payment-receipt', 'Payment Receipt', 'PR', 'PR-{YYYY}-{####}'),
('DT007', 'credit-note', 'Credit Note', 'CN', 'CN-{YYYY}-{####}');

-- Insert default chart of accounts
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type) VALUES
('ACC001', '1000', 'Assets', 'asset'),
('ACC002', '1100', 'Current Assets', 'asset'),
('ACC003', '1110', 'Cash and Cash Equivalents', 'asset'),
('ACC004', '1120', 'Accounts Receivable', 'asset'),
('ACC005', '1130', 'Inventory', 'asset'),
('ACC006', '2000', 'Liabilities', 'liability'),
('ACC007', '2100', 'Current Liabilities', 'liability'),
('ACC008', '2110', 'Accounts Payable', 'liability'),
('ACC009', '3000', 'Equity', 'equity'),
('ACC010', '4000', 'Revenue', 'income'),
('ACC011', '5000', 'Cost of Goods Sold', 'expense'),
('ACC012', '6000', 'Operating Expenses', 'expense');

-- Insert default system settings
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description) VALUES
('SET001', 'company_name', 'Your Company Name', 'string', 'Default company name'),
('SET002', 'default_currency', 'USD', 'string', 'Default currency code'),
('SET003', 'tax_rate', '16.0', 'number', 'Default tax rate percentage'),
('SET004', 'mobile_app_enabled', 'true', 'boolean', 'Enable mobile app access'),
('SET005', 'offline_sync_enabled', 'true', 'boolean', 'Enable offline synchronization');
