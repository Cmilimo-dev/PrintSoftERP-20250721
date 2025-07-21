-- Financial Automation Database Schema
-- This script creates the necessary tables for the financial automation features

-- Recurring Transactions Table
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'KES',
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    interval INTEGER NOT NULL DEFAULT 1 CHECK (interval > 0),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    next_due_date TIMESTAMP NOT NULL,
    account_id TEXT NOT NULL,
    category TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    auto_execute BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Auto Reconciliation Rules Table
CREATE TABLE IF NOT EXISTS auto_reconciliation_rules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    bank_statement_pattern TEXT NOT NULL, -- regex pattern
    account_id TEXT NOT NULL,
    category TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
    is_active BOOLEAN NOT NULL DEFAULT true,
    match_count INTEGER NOT NULL DEFAULT 0,
    last_matched TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Smart Categorization Rules Table
CREATE TABLE IF NOT EXISTS smart_categorization_rules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    pattern TEXT NOT NULL, -- regex or keyword pattern
    category TEXT NOT NULL,
    subcategory TEXT,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
    is_active BOOLEAN NOT NULL DEFAULT true,
    machine_generated BOOLEAN NOT NULL DEFAULT false,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bank Statements Table
CREATE TABLE IF NOT EXISTS bank_statements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id TEXT NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance DECIMAL(15,2) NOT NULL,
    reference TEXT NOT NULL,
    is_reconciled BOOLEAN NOT NULL DEFAULT false,
    matched_transaction_id TEXT,
    suggested_category TEXT,
    confidence DECIMAL(3,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial Insights Cache Table
CREATE TABLE IF NOT EXISTS financial_insights_cache (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type TEXT NOT NULL, -- 'spending_patterns', 'anomalies', 'recommendations', 'forecast'
    date_range_start TIMESTAMP NOT NULL,
    date_range_end TIMESTAMP NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_due_date ON recurring_transactions(next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_active ON recurring_transactions(is_active);
CREATE INDEX IF NOT EXISTS idx_auto_reconciliation_rules_active ON auto_reconciliation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_smart_categorization_rules_active ON smart_categorization_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_smart_categorization_rules_confidence ON smart_categorization_rules(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_bank_statements_reconciled ON bank_statements(is_reconciled);
CREATE INDEX IF NOT EXISTS idx_bank_statements_date ON bank_statements(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_insights_cache_type_expires ON financial_insights_cache(insight_type, expires_at);

-- RLS (Row Level Security) Policies
-- Note: These would typically be customized based on your authentication system

-- Enable RLS on all tables
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_reconciliation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_categorization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_insights_cache ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your auth system)
-- CREATE POLICY "Users can view their own recurring transactions" ON recurring_transactions
--     FOR SELECT USING (auth.uid() = user_id);
-- 
-- CREATE POLICY "Users can insert their own recurring transactions" ON recurring_transactions
--     FOR INSERT WITH CHECK (auth.uid() = user_id);
-- 
-- CREATE POLICY "Users can update their own recurring transactions" ON recurring_transactions
--     FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recurring_transactions_updated_at 
    BEFORE UPDATE ON recurring_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_reconciliation_rules_updated_at 
    BEFORE UPDATE ON auto_reconciliation_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_categorization_rules_updated_at 
    BEFORE UPDATE ON smart_categorization_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_statements_updated_at 
    BEFORE UPDATE ON bank_statements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
