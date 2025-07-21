-- Create Chart of Accounts table for ERP system
-- This will fix the 404 errors when querying chart_of_accounts

-- Create the chart_of_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'income', 'expense')),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    balance DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_parent ON chart_of_accounts(parent_account_id);

-- Enable RLS (Row Level Security)
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
DROP POLICY IF EXISTS "Enable read access for all users" ON chart_of_accounts;
CREATE POLICY "Enable read access for all users" ON chart_of_accounts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON chart_of_accounts;
CREATE POLICY "Enable insert for authenticated users only" ON chart_of_accounts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON chart_of_accounts;
CREATE POLICY "Enable update for authenticated users only" ON chart_of_accounts
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON chart_of_accounts;
CREATE POLICY "Enable delete for authenticated users only" ON chart_of_accounts
    FOR DELETE USING (true);

-- Insert default chart of accounts if table is empty
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, description) 
SELECT * FROM (VALUES
    ('00000000-0000-0000-0000-000000000001'::UUID, '1000', 'Assets', 'asset', 'All company assets'),
    ('00000000-0000-0000-0000-000000000002'::UUID, '1100', 'Current Assets', 'asset', 'Assets convertible to cash within one year'),
    ('00000000-0000-0000-0000-000000000003'::UUID, '1110', 'Cash and Cash Equivalents', 'asset', 'Cash on hand and in bank accounts'),
    ('00000000-0000-0000-0000-000000000004'::UUID, '1120', 'Accounts Receivable', 'asset', 'Money owed by customers'),
    ('00000000-0000-0000-0000-000000000005'::UUID, '1130', 'Inventory', 'asset', 'Goods held for sale'),
    ('00000000-0000-0000-0000-000000000006'::UUID, '1200', 'Fixed Assets', 'asset', 'Long-term assets'),
    ('00000000-0000-0000-0000-000000000007'::UUID, '1210', 'Equipment', 'asset', 'Business equipment and machinery'),
    ('00000000-0000-0000-0000-000000000008'::UUID, '2000', 'Liabilities', 'liability', 'All company liabilities'),
    ('00000000-0000-0000-0000-000000000009'::UUID, '2100', 'Current Liabilities', 'liability', 'Debts due within one year'),
    ('00000000-0000-0000-0000-000000000010'::UUID, '2110', 'Accounts Payable', 'liability', 'Money owed to suppliers'),
    ('00000000-0000-0000-0000-000000000011'::UUID, '2120', 'Accrued Expenses', 'liability', 'Expenses incurred but not yet paid'),
    ('00000000-0000-0000-0000-000000000012'::UUID, '3000', 'Equity', 'equity', 'Owner''s equity in the business'),
    ('00000000-0000-0000-0000-000000000013'::UUID, '3100', 'Owner''s Equity', 'equity', 'Capital invested by owners'),
    ('00000000-0000-0000-0000-000000000014'::UUID, '3200', 'Retained Earnings', 'equity', 'Accumulated profits retained in business'),
    ('00000000-0000-0000-0000-000000000015'::UUID, '4000', 'Revenue', 'income', 'Income from business operations'),
    ('00000000-0000-0000-0000-000000000016'::UUID, '4100', 'Sales Revenue', 'income', 'Revenue from sales of goods/services'),
    ('00000000-0000-0000-0000-000000000017'::UUID, '4200', 'Service Revenue', 'income', 'Revenue from services provided'),
    ('00000000-0000-0000-0000-000000000018'::UUID, '5000', 'Cost of Goods Sold', 'expense', 'Direct costs of producing goods sold'),
    ('00000000-0000-0000-0000-000000000019'::UUID, '6000', 'Operating Expenses', 'expense', 'Expenses from normal business operations'),
    ('00000000-0000-0000-0000-000000000020'::UUID, '6100', 'Salaries and Wages', 'expense', 'Employee compensation'),
    ('00000000-0000-0000-0000-000000000021'::UUID, '6200', 'Rent Expense', 'expense', 'Cost of renting facilities'),
    ('00000000-0000-0000-0000-000000000022'::UUID, '6300', 'Utilities Expense', 'expense', 'Cost of utilities (electricity, water, etc.)'),
    ('00000000-0000-0000-0000-000000000023'::UUID, '6400', 'Office Supplies', 'expense', 'Cost of office supplies and materials'),
    ('00000000-0000-0000-0000-000000000024'::UUID, '6500', 'Marketing Expense', 'expense', 'Cost of marketing and advertising')
) AS v(id, account_code, account_name, account_type, description)
WHERE NOT EXISTS (SELECT 1 FROM chart_of_accounts LIMIT 1);

-- Update parent account relationships
UPDATE chart_of_accounts SET parent_account_id = '00000000-0000-0000-0000-000000000001' WHERE account_code IN ('1100', '1200');
UPDATE chart_of_accounts SET parent_account_id = '00000000-0000-0000-0000-000000000002' WHERE account_code IN ('1110', '1120', '1130');
UPDATE chart_of_accounts SET parent_account_id = '00000000-0000-0000-0000-000000000006' WHERE account_code IN ('1210');
UPDATE chart_of_accounts SET parent_account_id = '00000000-0000-0000-0000-000000000008' WHERE account_code IN ('2100');
UPDATE chart_of_accounts SET parent_account_id = '00000000-0000-0000-0000-000000000009' WHERE account_code IN ('2110', '2120');
UPDATE chart_of_accounts SET parent_account_id = '00000000-0000-0000-0000-000000000012' WHERE account_code IN ('3100', '3200');
UPDATE chart_of_accounts SET parent_account_id = '00000000-0000-0000-0000-000000000015' WHERE account_code IN ('4100', '4200');
UPDATE chart_of_accounts SET parent_account_id = '00000000-0000-0000-0000-000000000019' WHERE account_code IN ('6100', '6200', '6300', '6400', '6500');

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE
    ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
