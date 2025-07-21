-- --- BEGIN SOURCE ---
-- --- END SOURCE ---

-- Create employee_commissions table
CREATE TABLE employee_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commission_number TEXT NOT NULL,
    period TEXT NOT NULL,
    employee_id UUID REFERENCES user_profiles(id),
    base_amount NUMERIC NOT NULL,
    commission_rate NUMERIC NOT NULL,
    total_expenses NUMERIC NOT NULL,
    net_profit NUMERIC NOT NULL,
    calculated_commission NUMERIC NOT NULL,
    adjustments NUMERIC DEFAULT 0,
    bonuses NUMERIC DEFAULT 0,
    deductions NUMERIC DEFAULT 0,
    final_amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'calculated', 'approved', 'paid', 'disputed')),
    calculated_date TIMESTAMP DEFAULT NOW(),
    approved_by TEXT,
    paid_date TIMESTAMP,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_employee_commissions_period ON employee_commissions(period);
CREATE INDEX idx_employee_commissions_employee_id ON employee_commissions(employee_id);
CREATE INDEX idx_employee_commissions_status ON employee_commissions(status);

-- Foreign key relations and rules can be added as necessary

