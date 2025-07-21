-- Migration: Add VAT Settings to All Business Document Types
-- Date: 2025-07-13
-- Description: Adds comprehensive VAT/tax settings support to quotations, invoices, sales_orders, and delivery_notes

-- Add VAT settings to Quotations table
ALTER TABLE quotations ADD COLUMN date DATE;
ALTER TABLE quotations ADD COLUMN currency TEXT DEFAULT 'KES';
ALTER TABLE quotations ADD COLUMN subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE quotations ADD COLUMN tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE quotations ADD COLUMN tax_type TEXT DEFAULT 'vat_inclusive';
ALTER TABLE quotations ADD COLUMN default_tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE quotations ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE quotations ADD COLUMN terms TEXT;

-- Add VAT settings to Invoices table (some fields may already exist)
-- Check if these fields don't exist before adding
-- ALTER TABLE invoices ADD COLUMN tax_type TEXT DEFAULT 'vat_inclusive';
-- ALTER TABLE invoices ADD COLUMN default_tax_rate DECIMAL(5,2) DEFAULT 0;

-- We'll use a safer approach with INSERT OR IGNORE for new columns
CREATE TABLE IF NOT EXISTS temp_invoices_new AS SELECT * FROM invoices;

-- Drop and recreate invoices table with new fields
DROP TABLE invoices;
CREATE TABLE invoices (
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
  tax_type TEXT DEFAULT 'vat_inclusive',
  default_tax_rate DECIMAL(5,2) DEFAULT 0,
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
);

-- Copy data back
INSERT INTO invoices (
  id, invoice_number, customer_id, date, due_date, status, currency, exchange_rate,
  subtotal, tax_amount, discount_amount, total_amount, paid_amount, balance_amount,
  terms, notes, internal_notes, sent_at, viewed_at, last_reminder_sent,
  created_at, updated_at, created_by, updated_by
) SELECT 
  id, invoice_number, customer_id, date, due_date, status, currency, exchange_rate,
  subtotal, tax_amount, discount_amount, total_amount, paid_amount, balance_amount,
  terms, notes, internal_notes, sent_at, viewed_at, last_reminder_sent,
  created_at, updated_at, created_by, updated_by
FROM temp_invoices_new;

DROP TABLE temp_invoices_new;

-- Add VAT settings to Sales Orders table
ALTER TABLE sales_orders ADD COLUMN date DATE;
ALTER TABLE sales_orders ADD COLUMN currency TEXT DEFAULT 'KES';
ALTER TABLE sales_orders ADD COLUMN subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE sales_orders ADD COLUMN tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE sales_orders ADD COLUMN tax_type TEXT DEFAULT 'vat_inclusive';
ALTER TABLE sales_orders ADD COLUMN default_tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE sales_orders ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE sales_orders ADD COLUMN expected_delivery DATE;
ALTER TABLE sales_orders ADD COLUMN payment_terms TEXT;
ALTER TABLE sales_orders ADD COLUMN payment_method TEXT;
ALTER TABLE sales_orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
ALTER TABLE sales_orders ADD COLUMN terms TEXT;

-- Add VAT settings to Delivery Notes table
ALTER TABLE delivery_notes ADD COLUMN currency TEXT DEFAULT 'KES';
ALTER TABLE delivery_notes ADD COLUMN subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE delivery_notes ADD COLUMN tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE delivery_notes ADD COLUMN tax_type TEXT DEFAULT 'vat_inclusive';
ALTER TABLE delivery_notes ADD COLUMN default_tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE delivery_notes ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE delivery_notes ADD COLUMN total_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE delivery_notes ADD COLUMN terms TEXT;
ALTER TABLE delivery_notes ADD COLUMN carrier TEXT;
ALTER TABLE delivery_notes ADD COLUMN delivery_instructions TEXT;
ALTER TABLE delivery_notes ADD COLUMN expected_delivery DATE;

-- Add tax fields to line item tables

-- Quotation items
ALTER TABLE quotation_items ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN item_code TEXT;

-- Invoice line items already have tax fields, but let's ensure consistency
-- ALTER TABLE invoice_line_items ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;

-- Sales order items
ALTER TABLE sales_order_items ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE sales_order_items ADD COLUMN tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE sales_order_items ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE sales_order_items ADD COLUMN item_code TEXT;

-- Delivery note items
ALTER TABLE delivery_note_items ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE delivery_note_items ADD COLUMN tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE delivery_note_items ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0;

-- Update column names to match frontend expectations
-- Rename columns where needed for consistency
UPDATE quotations SET date = COALESCE(date, created_at) WHERE date IS NULL;
UPDATE sales_orders SET date = COALESCE(date, order_date) WHERE date IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotations_tax_type ON quotations(tax_type);
CREATE INDEX IF NOT EXISTS idx_invoices_tax_type ON invoices(tax_type);
CREATE INDEX IF NOT EXISTS idx_sales_orders_tax_type ON sales_orders(tax_type);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_tax_type ON delivery_notes(tax_type);

-- Insert default VAT settings if tax_settings table is empty
INSERT OR IGNORE INTO tax_settings (id, name, rate, type, description, is_default, is_active) VALUES
('VAT_16', 'Standard VAT', 16.0, 'vat_inclusive', 'Standard VAT rate of 16%', true, true),
('VAT_0', 'Zero Rated', 0.0, 'vat_exclusive', 'Zero rated items', false, true),
('VAT_8', 'Reduced VAT', 8.0, 'vat_inclusive', 'Reduced VAT rate of 8%', false, true);
